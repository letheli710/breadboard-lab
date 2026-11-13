// Derived quantities (what a question's `find` asks for) on top of the MNA / transient solvers.

import type { Analysis, Complex, Find, Netlist, Part } from '../problem/types';
import { Circuit, type CEl, isIndependent, isTwoTerminal } from './circuit';
import { ONE, ZERO, abs, conj, cx, div, mul, neg, polarDeg } from './complex';
import { AnalysisError } from './errors';
import { type Mode, MnaSystem, Solution } from './mna';
import { type Solver, dynamicR, operatingPoints, piecesAt, tangent } from './nonlinear';
import { isSdomainKind, sdomainQuantity } from './sdomain';
import { Transient } from './transient';
import { computePeriodic } from './periodic';

export type Phase = 'before' | 'after';

/** A DC or single-frequency AC analysis of a circuit (switches in one state). */
export class StaticAnalysis {
  private _base?: Solution;
  /** storage elements connected directly across a port are removed (transient "seen by" questions) */
  removeStorageAcrossPort = false;

  constructor(
    readonly ckt: Circuit,
    readonly kind: 'dc' | 'ac',
    readonly omega = 0,
    readonly phase: Phase = 'after',
    /** phasor convention for powers ('peak' halves P, Q, S) */
    readonly peak = false,
  ) {
    if (kind === 'ac' && !(omega > 0)) throw new AnalysisError('AC analysis needs a frequency > 0');
  }

  get label(): string {
    return this.kind === 'dc' ? (this.phase === 'before' ? 'the DC circuit for t < 0' : 'DC analysis') : `AC analysis at ω = ${fmt(this.omega)} rad/s`;
  }

  private mode(extra?: CEl[], removed?: Set<string>): Mode {
    return { kind: this.kind, omega: this.omega, phase: this.phase, extra, removed, label: this.label, conserve: true };
  }

  /** value of an independent source in this analysis */
  sourceValue(el: CEl): Complex {
    const s = el.src!;
    if (el.harmonics?.length)
      throw new AnalysisError(`${el.ref}: a non-sinusoidal periodic source ({harmonics} / {wave}) needs analysis {type: "periodic"}`);
    if (this.kind === 'dc') {
      switch (s.kind) {
        case 'num':
          return cx(s.value);
        case 'dcac':
          return cx(s.dc);
        case 'step':
          return cx(this.phase === 'before' ? s.before : s.after);
        case 'sin':
          return cx(s.offset);
        case 'impulse':
          return ZERO; // δ(t) is zero except at t = 0
        case 'exp':
          if (this.phase === 'before') return ZERO;
          throw new AnalysisError(`${el.ref}: an exponential source {exp} has no constant (DC) value after t = 0`);
      }
    }
    switch (s.kind) {
      case 'num':
        return cx(s.value); // a bare number in AC analysis is a phasor with phase 0
      case 'dcac':
        return s.ac ? polarDeg(s.ac.mag, s.ac.phase) : ZERO;
      case 'step':
        throw new AnalysisError(`${el.ref}: a step source cannot be used in AC (sinusoidal steady-state) analysis`);
      case 'sin':
        throw new AnalysisError(`${el.ref}: in AC analysis give the source as a phasor {ac: {mag, phase}} instead of {sin: …}`);      case 'exp':
      case 'impulse':
        throw new AnalysisError(`${el.ref}: {exp} / {impulse} sources are only available in transient analysis`);
    }
  }

  solve(opts: { extra?: CEl[]; removed?: Set<string>; zero?: boolean; only?: CEl } = {}): Solution {
    const sys = new MnaSystem(this.ckt, this.mode(opts.extra, opts.removed));
    if (sys.error) throw sys.error;
    return sys.solve((el) => {
      if (el.synthetic) return this.sourceValue(el);
      if (opts.only) return el === opts.only ? ONE : ZERO;
      if (opts.zero) return ZERO;
      return this.sourceValue(el);
    });
  }

  base(): Solution {
    return (this._base ??= this.solve());
  }

  private portRemoved(a: number, b: number, extra?: Set<string>): Set<string> {
    const r = new Set(extra ?? []);
    if (this.removeStorageAcrossPort)
      for (const el of this.ckt.els)
        if ((el.type === 'C' || el.type === 'L') && ((el.pins[0] === a && el.pins[1] === b) || (el.pins[0] === b && el.pins[1] === a))) r.add(el.ref);
    return r;
  }

  /** impedance seen between nodes a and b with independent sources zeroed */
  portZ(a: number, b: number, removedExtra?: Set<string>): Complex {
    if (a === b) return ZERO;
    const test = testSource('__test', 'I', b, a, 1); // pushes 1 A into node a
    let sol: Solution;
    try {
      sol = this.solve({ extra: [test], removed: this.portRemoved(a, b, removedExtra), zero: true });
    } catch (e) {
      if (e instanceof AnalysisError)
        throw new AnalysisError(
          `The equivalent resistance/impedance at port (${this.ckt.nodeNames[a]}, ${this.ckt.nodeNames[b]}) is infinite or undefined (no path for a test current, or a degenerate dependent source). Details: ${e.message}`,
        );
      throw e;
    }
    return sol.vIdx(a, b);
  }

  vth(a: number, b: number, removedExtra?: Set<string>): Complex {
    const rem = this.portRemoved(a, b, removedExtra);
    const sol = rem.size ? this.solve({ removed: rem }) : this.base();
    return sol.vIdx(a, b);
  }

  isc(a: number, b: number, removedExtra?: Set<string>): Complex {
    if (a === b) throw new AnalysisError('isc: the two port nodes are the same node');
    const sh = testSource('__short', 'V', a, b, 0);
    let sol: Solution;
    try {
      sol = this.solve({ extra: [sh], removed: this.portRemoved(a, b, removedExtra) });
    } catch (e) {
      if (e instanceof AnalysisError) throw new AnalysisError(`isc: shorting the port makes the circuit unsolvable (e.g. an ideal voltage source directly across the port). ${e.message}`);
      throw e;
    }
    return sol.i('__short');
  }
}

function testSource(ref: string, type: 'V' | 'I', p: number, n: number, value: number): CEl {
  return { ref, type, pins: [p, n], value: NaN, src: { kind: 'num', value }, synthetic: true };
}

const fmt = (x: number) => Number(x.toPrecision(6)).toString();

function omegaOf(a: Analysis & { type: 'ac' }): number {
  const { freq, omega } = a;
  if (omega !== undefined && !(omega > 0)) throw new AnalysisError('analysis.omega must be > 0');
  if (freq !== undefined && !(freq > 0)) throw new AnalysisError('analysis.freq must be > 0');
  if (omega !== undefined && freq !== undefined && Math.abs(omega - 2 * Math.PI * freq) > 1e-9 * omega)
    throw new AnalysisError('analysis: freq and omega disagree (ω = 2πf); give only one');
  if (omega !== undefined) return omega;
  if (freq !== undefined) return 2 * Math.PI * freq;
  throw new AnalysisError('AC analysis needs analysis.freq (Hz) or analysis.omega (rad/s)');
}

type T = Find['t'];
const phaseOfT = (t: T): Phase => (t === '0-' || (typeof t === 'number' && t < 0) ? 'before' : 'after');

// ---------------- element quantities on a solution ----------------

export interface Val {
  value: Complex;
  /** phasor-like result (reduce with part, default 'mag' in AC) vs real-valued quantity */
  complex: boolean;
  defaultPart?: Part;
}
const real = (x: number): Val => ({ value: cx(x), complex: false });

function elementPower(sol: Solution, ref: string): Complex {
  const el = sol.sys.byRef.get(ref);
  if (!el) throw new AnalysisError(`Unknown element "${ref}"`);
  if (!isTwoTerminal(el)) throw new AnalysisError(`p/q/s/pf: ${ref} is a ${el.type}; ask for the power of a two-terminal element`);
  return mul(sol.vEl(ref), conj(sol.i(ref)));
}

function meter(sol: Solution, ckt: Circuit, ref: string): Complex {
  const el = ckt.element(ref);
  if (el.type === 'ammeter') return sol.i(ref);
  if (el.type === 'voltmeter') return sol.vEl(ref);
  throw new AnalysisError(`meter: ${ref} is not an ammeter or voltmeter (it is ${el.type})`);
}

function pointQuantity(find: Find, sol: Solution, ckt: Circuit, kind: 'dc' | 'ac' | 'tran', peak: boolean): Val | null {
  const k = peak ? 0.5 : 1;
  switch (find.kind) {
    case 'v':
      if ('nodes' in find && find.nodes) {
        if (!Array.isArray(find.nodes) || find.nodes.length < 1) throw new AnalysisError('v: "nodes" must be ["a"] or ["a", "b"]');
        return { value: sol.v(find.nodes[0], find.nodes[1] ?? '0'), complex: kind === 'ac' };
      }
      ckt.element((find as { el: string }).el);
      return { value: sol.vEl((find as { el: string }).el), complex: kind === 'ac' };
    case 'i':
      ckt.element(find.el);
      return { value: sol.i(find.el), complex: kind === 'ac' };
    case 'meter':
      return { value: meter(sol, ckt, find.el), complex: kind === 'ac' };
    case 'p': {
      const s = elementPower(sol, find.el);
      return real(kind === 'ac' ? k * s.re : s.re);
    }
    case 'q':
    case 's':
    case 'pf': {
      if (kind !== 'ac') throw new AnalysisError(`"${find.kind}" (reactive/apparent power, power factor) is only defined in AC analysis`);
      const s = elementPower(sol, find.el);
      if (find.kind === 'q') return real(k * s.im);
      if (find.kind === 's') return real(k * abs(s));
      const S = abs(s);
      if (!(S > 0)) throw new AnalysisError(`pf: ${find.el} carries no power (V or I is zero), the power factor is undefined`);
      return real(Math.abs(s.re) / S);
    }
    default:
      return null;
  }
}

// ---------------- network quantities ----------------

function portNodes(ckt: Circuit, port: unknown, what: string): [number, number] {
  if (!Array.isArray(port) || port.length !== 2) throw new AnalysisError(`${what}: "port" must be ["a", "b"]`);
  return [ckt.node(String(port[0])), ckt.node(String(port[1]))];
}

/** `exclude`: element refs taken out (open-circuited) before a port calculation */
function excluded(ckt: Circuit, find: Find): Set<string> | undefined {
  const ex = (find as { exclude?: unknown }).exclude;
  if (ex === undefined) return undefined;
  if (!Array.isArray(ex)) throw new AnalysisError(`${find.kind}: "exclude" must be a list of element refs, e.g. ["RL"]`);
  const out = new Set<string>();
  for (const r of ex) {
    const ref = String(r);
    const el = ckt.byRef.get(ref);
    if (!el) throw new AnalysisError(`${find.kind}: exclude lists "${ref}", but there is no element with that ref`);
    if (!isTwoTerminal(el)) throw new AnalysisError(`${find.kind}: exclude can only remove two-terminal elements (${ref} is a ${el.type})`);
    out.add(ref);
  }
  return out;
}

function networkQuantity(find: Find, an: StaticAnalysis): Val {
  const ckt = an.ckt;
  const ac = an.kind === 'ac';
  switch (find.kind) {
    case 'req': {
      const [a, b] = portNodes(ckt, find.port, 'req');
      return { value: an.portZ(a, b, excluded(ckt, find)), complex: ac };
    }
    case 'vth': {
      const [a, b] = portNodes(ckt, find.port, 'vth');
      return { value: an.vth(a, b, excluded(ckt, find)), complex: ac };
    }
    case 'isc': {
      const [a, b] = portNodes(ckt, find.port, 'isc');
      return { value: an.isc(a, b, excluded(ckt, find)), complex: ac };
    }
    case 'pmax': {
      const [a, b] = portNodes(ckt, find.port, 'pmax');
      const ex = excluded(ckt, find);
      const vth = an.vth(a, b, ex);
      const z = an.portZ(a, b, ex);
      if (!(z.re > 0))
        throw new AnalysisError(`pmax: the Thevenin resistance at the port is ${fmt(z.re)} Ω (not positive), so maximum power transfer is undefined`);
      const p = (abs(vth) ** 2 / (4 * z.re)) * (ac && an.peak ? 0.5 : 1);
      return real(p);
    }
    case 'gain': {
      const input = ckt.element(find.input);
      if (!isIndependent(input)) throw new AnalysisError(`gain: input "${find.input}" must be an independent V or I source`);
      if (!Array.isArray(find.out) || find.out.length < 1) throw new AnalysisError('gain: "out" must be ["a"] or ["a", "b"]');
      const sol = an.solve({ only: input });
      return { value: sol.v(find.out[0], find.out[1] ?? '0'), complex: ac };
    }
    case 'twoport':
      return { value: twoPort(an, find.ports, find.param), complex: ac };
    default:
      throw new AnalysisError(`"${find.kind}" is not supported in ${an.label}`);
  }
}

type PortDrive = 'open' | 'short' | 'I' | 'V';

function twoPort(an: StaticAnalysis, ports: unknown, param: string): Complex {
  if (!Array.isArray(ports) || ports.length !== 2 || !ports.every((p) => Array.isArray(p) && p.length === 2))
    throw new AnalysisError('twoport: "ports" must be [["1", "1\'"], ["2", "2\'"]]');
  const P = (ports as string[][]).map((p) => [an.ckt.node(String(p[0])), an.ckt.node(String(p[1]))]);
  const measure = (d1: PortDrive, d2: PortDrive) => {
    const extra: CEl[] = [];
    [d1, d2].forEach((d, k) => {
      const [p, m] = P[k];
      if (d === 'short') extra.push(testSource(`__port${k + 1}`, 'V', p, m, 0));
      else if (d === 'V') extra.push(testSource(`__port${k + 1}`, 'V', p, m, 1));
      else if (d === 'I') extra.push(testSource(`__port${k + 1}`, 'I', m, p, 1));
    });
    let sol: Solution;
    try {
      sol = an.solve({ extra, zero: true });
    } catch (e) {
      if (e instanceof AnalysisError) throw new AnalysisError(`twoport ${param}: this parameter does not exist for the network (the required test condition has no solution). ${e.message}`);
      throw e;
    }
    const I = (k: number, d: PortDrive): Complex => (d === 'I' ? ONE : d === 'open' ? ZERO : neg(sol.i(`__port${k + 1}`)));
    return { V1: sol.vIdx(P[0][0], P[0][1]), V2: sol.vIdx(P[1][0], P[1][1]), I1: I(0, d1), I2: I(1, d2) };
  };
  const q = (n: Complex, d: Complex): Complex => {
    if (!(abs(d) > 1e-12 * Math.max(abs(n), 1e-300))) throw new AnalysisError(`twoport ${param}: this parameter does not exist for the network (division by zero)`);
    return div(n, d);
  };
  switch (param) {
    case 'z11':
      return measure('I', 'open').V1;
    case 'z21':
      return measure('I', 'open').V2;
    case 'z12':
      return measure('open', 'I').V1;
    case 'z22':
      return measure('open', 'I').V2;
    case 'y11':
      return measure('V', 'short').I1;
    case 'y21':
      return measure('V', 'short').I2;
    case 'y12':
      return measure('short', 'V').I1;
    case 'y22':
      return measure('short', 'V').I2;
    case 'h11':
      return measure('I', 'short').V1;
    case 'h21':
      return measure('I', 'short').I2;
    case 'h12':
      return measure('open', 'V').V1;
    case 'h22':
      return measure('open', 'V').I2;
    case 'a': {
      const m = measure('I', 'open');
      return q(m.V1, m.V2);
    }
    case 'c': {
      const m = measure('I', 'open');
      return q(ONE, m.V2);
    }
    case 'b': {
      const m = measure('I', 'short');
      return neg(q(m.V1, m.I2));
    }
    case 'd': {
      const m = measure('I', 'short');
      return neg(q(ONE, m.I2));
    }
    default:
      throw new AnalysisError(`twoport: unknown parameter "${param}"`);
  }
}

// ---------------- frequency search helpers ----------------

/** port nodes for an input-impedance question: the given port, or the terminals of the single
 *  independent source (which is then removed) */
function inputPort(ckt: Circuit, port: [string, string] | undefined, what: string): { a: number; b: number; removed?: Set<string> } {
  if (port) {
    const [a, b] = portNodes(ckt, port, what);
    return { a, b };
  }
  const srcs = ckt.els.filter(isIndependent);
  if (srcs.length !== 1)
    throw new AnalysisError(`${what}: without "port" the circuit must have exactly one independent source (it has ${srcs.length}); give "port": ["a", "b"]`);
  return { a: srcs[0].pins[0], b: srcs[0].pins[1], removed: new Set([srcs[0].ref]) };
}

/** log10 range of angular frequencies to search: 10⁻⁴…10⁴ × the characteristic frequencies */
function freqRange(ckt: Circuit, what: string): [number, number] {
  const R = ckt.els.filter((e) => e.type === 'R' && e.value !== 0).map((e) => Math.abs(e.value));
  const C = ckt.els.filter((e) => e.type === 'C').map((e) => e.value);
  const L = ckt.els.filter((e) => e.type === 'L').map((e) => e.value);
  if (!C.length && !L.length) throw new AnalysisError(`${what}: the circuit has no capacitor or inductor, so its response does not depend on frequency`);
  const cands: number[] = [];
  for (const l of L) for (const c of C) cands.push(1 / Math.sqrt(l * c));
  for (const r of R) {
    for (const c of C) cands.push(1 / (r * c));
    for (const l of L) cands.push(r / l);
  }
  if (!cands.length) cands.push(1);
  return [Math.log10(Math.min(...cands)) - 4, Math.log10(Math.max(...cands)) + 4];
}

/** sample a function on a log grid (200 points per decade) */
function sampleLog(lo: number, hi: number, f: (w: number) => number): { ws: number[]; vs: number[] } {
  const steps = Math.ceil((hi - lo) * 200);
  const ws: number[] = [];
  const vs: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const w = 10 ** (lo + ((hi - lo) * i) / steps);
    ws.push(w);
    vs.push(f(w));
  }
  return { ws, vs };
}

/** bisection in log ω between two samples where f changes sign */
function bisectLog(f: (w: number) => number, w1: number, w2: number): number {
  let l = Math.log(w1);
  let r = Math.log(w2);
  const sl = Math.sign(f(w1));
  for (let k = 0; k < 200 && r - l > 1e-15; k++) {
    const mid = (l + r) / 2;
    const v = f(Math.exp(mid));
    if (v === 0) return Math.exp(mid);
    if (Math.sign(v) === sl) l = mid;
    else r = mid;
  }
  return Math.exp((l + r) / 2);
}

// ---------------- resonance, cutoff, bandwidth, Q ----------------

/** lowest frequency (Hz) at which the impedance at the port is purely real */
export function resonance(ckt: Circuit, port?: [string, string]): number {
  const { a, b, removed } = inputPort(ckt, port, 'f0');
  const [lo, hi] = freqRange(ckt, 'f0');
  // h(ω) = sin ∠Z ∈ [−1, 1]; every sign change is a frequency where Z is real (finite, 0 or ∞)
  const h = (w: number): number => {
    const an = new StaticAnalysis(ckt, 'ac', w);
    let z: Complex;
    try {
      z = an.portZ(a, b, removed);
    } catch {
      return 0; // Z infinite exactly here (lossless pole) → real
    }
    const m = abs(z);
    if (m === 0) return 0;
    const s = z.im / m;
    return Math.abs(s) < 1e-10 ? 0 : s;
  };
  const { ws, vs: hs } = sampleLog(lo, hi, h);
  if (hs.every((v) => v === 0)) throw new AnalysisError('f0: the impedance is purely real at all frequencies; there is no resonance');
  let prev = -1;
  for (let i = 0; i < hs.length; i++) {
    if (hs[i] === 0) continue;
    if (prev >= 0 && Math.sign(hs[i]) !== Math.sign(hs[prev])) {
      if (i - prev > 1) return ws[prev + 1] / (2 * Math.PI); // exact zero sample in between
      return bisectLog(h, ws[prev], ws[i]) / (2 * Math.PI);
    }
    prev = i;
  }
  throw new AnalysisError(
    `f0: the input impedance is never purely real between ${fmt(10 ** lo / (2 * Math.PI))} Hz and ${fmt(10 ** hi / (2 * Math.PI))} Hz (no resonance)`,
  );
}

/** all −3 dB frequencies (Hz, ascending) of |V(out)/input| relative to its maximum */
export function cutoffs(ckt: Circuit, out: unknown, inputRef: string): number[] {
  const input = ckt.element(inputRef);
  if (!isIndependent(input)) throw new AnalysisError(`fc/bw: input "${inputRef}" must be an independent V or I source`);
  if (!Array.isArray(out) || out.length < 1) throw new AnalysisError('fc/bw: "out" must be ["a"] or ["a", "b"]');
  const H = (w: number) => abs(new StaticAnalysis(ckt, 'ac', w).solve({ only: input }).v(String(out[0]), out[1] === undefined ? '0' : String(out[1])));
  const [lo, hi] = freqRange(ckt, 'fc/bw');
  const { ws, vs } = sampleLog(lo, hi, H);
  let k = 0;
  for (let i = 1; i < vs.length; i++) if (vs[i] > vs[k]) k = i;
  let hmax = vs[k];
  // maximum at an end of the sweep (low-/high-pass): take the limit further out
  if (k === 0) hmax = Math.max(hmax, H(ws[0] * 1e-4));
  if (k === vs.length - 1) hmax = Math.max(hmax, H(ws[k] * 1e4));
  if (k > 0 && k < vs.length - 1) {
    // golden-section refinement of an interior maximum (band-pass / resonant peak)
    let a = Math.log(ws[k - 1]);
    let b = Math.log(ws[k + 1]);
    const g = (Math.sqrt(5) - 1) / 2;
    for (let it = 0; it < 100 && b - a > 1e-13; it++) {
      const c = b - g * (b - a);
      const d = a + g * (b - a);
      if (H(Math.exp(c)) > H(Math.exp(d))) b = d;
      else a = c;
    }
    hmax = Math.max(hmax, H(Math.exp((a + b) / 2)));
  }
  if (!(hmax > 0)) throw new AnalysisError('fc/bw: the network function is zero at all frequencies');
  const level = hmax / Math.SQRT2;
  const f = (w: number) => H(w) - level;
  const out_: number[] = [];
  for (let i = 1; i < ws.length; i++) {
    const a = vs[i - 1] - level;
    const b = vs[i] - level;
    if (a === 0) out_.push(ws[i - 1]);
    else if (a * b < 0) out_.push(bisectLog(f, ws[i - 1], ws[i]));
  }
  return out_.map((w) => w / (2 * Math.PI));
}

/** Q = ω0 · (average stored energy) / (average power) at resonance, driven at the input port */
export function qualityFactor(ckt: Circuit, port?: [string, string]): number {
  const f0 = resonance(ckt, port);
  const w0 = 2 * Math.PI * f0;
  const { a, b, removed } = inputPort(ckt, port, 'Q');
  const an = new StaticAnalysis(ckt, 'ac', w0);
  const test = testSource('__test', 'I', b, a, 1); // 1 A (amplitude) into a
  let sol: Solution;
  try {
    sol = an.solve({ extra: [test], removed: removed ?? new Set(), zero: true });
  } catch {
    throw new AnalysisError('Q: the circuit is lossless at resonance (infinite Q)');
  }
  let W = 0;
  for (const el of ckt.els) {
    if (removed?.has(el.ref)) continue;
    if (el.type === 'L') W += 0.25 * el.value * abs(sol.i(el.ref)) ** 2;
    if (el.type === 'C') W += 0.25 * el.value * abs(sol.vEl(el.ref)) ** 2;
  }
  for (const k of ckt.mutual) W += 0.5 * k.M * mul(sol.i(k.l1), conj(sol.i(k.l2))).re;
  const P = 0.5 * sol.vIdx(a, b).re;
  if (!(P > 0)) throw new AnalysisError('Q: no power is dissipated at resonance (lossless circuit, infinite Q)');
  return (w0 * W) / P;
}

// ---------------- natural frequencies ----------------

function roots(ckt: Circuit): Complex[] {
  const lam = new Transient(ckt).naturalFrequencies().filter((l) => abs(l) > 0);
  const scale = Math.max(0, ...lam.map(abs));
  const clean = lam.map((l) => (Math.abs(l.im) <= 1e-9 * scale ? cx(l.re) : l));
  return clean.sort((x, y) => (Math.abs(x.re - y.re) > 1e-12 * scale ? y.re - x.re : y.im - x.im));
}

function rootQuantity(ckt: Circuit, find: Find): Val {
  const r = roots(ckt);
  if (!r.length) throw new AnalysisError(`${find.kind}: the circuit for t > 0 has no (non-zero) natural frequencies`);
  const list = () => r.map((l) => (l.im ? `${fmt(l.re)}${l.im > 0 ? '+' : '−'}j${fmt(Math.abs(l.im))}` : fmt(l.re))).join(', ');
  const pair = r.find((l) => l.im > 0); // dominant complex pair (sorted by real part)
  switch (find.kind) {
    case 'root': {
      const n = find.n;
      if (!Number.isInteger(n) || n < 1 || n > r.length)
        throw new AnalysisError(`root: n must be 1…${r.length} (the natural frequencies are s = ${list()} 1/s)`);
      return { value: r[n - 1], complex: true, defaultPart: 're' };
    }
    case 'alpha':
      if (r.length === 2) return real(-(r[0].re + r[1].re) / 2);
      if (pair) return real(-pair.re);
      throw new AnalysisError(`alpha: the circuit is not second-order and has no complex natural frequencies (s = ${list()} 1/s)`);
    case 'omega_d':
      if (!pair) throw new AnalysisError(`omega_d: the natural frequencies are real (s = ${list()} 1/s): the response is not oscillatory (over- or critically damped)`);
      return real(pair.im);
    case 'omega0': {
      if (r.length !== 2) throw new AnalysisError(`omega0: the circuit for t > 0 is not second-order (s = ${list()} 1/s)`);
      const p = mul(r[0], r[1]);
      if (!(p.re > 0)) throw new AnalysisError(`omega0: s1·s2 = ${fmt(p.re)} is not positive (unstable circuit)`);
      return real(Math.sqrt(p.re));
    }
    default:
      throw new AnalysisError(`unexpected quantity ${find.kind}`);
  }
}

// ---------------- energy, value, wattmeter ----------------

function energy(ckt: Circuit, sol: Solution, ref: string): number {
  const k = ckt.mutual.find((m) => m.ref === ref);
  if (k) {
    const i1 = sol.i(k.l1).re;
    const i2 = sol.i(k.l2).re;
    return 0.5 * ckt.element(k.l1).value * i1 * i1 + 0.5 * ckt.element(k.l2).value * i2 * i2 + k.M * i1 * i2;
  }
  const el = ckt.element(ref);
  if (el.type === 'C') return 0.5 * el.value * sol.vEl(ref).re ** 2;
  if (el.type === 'L') return 0.5 * el.value * sol.i(ref).re ** 2;
  throw new AnalysisError(`w: ${ref} is not a capacitor, an inductor or a coupling K (it is ${el.type})`);
}

function wattmeter(ckt: Circuit, sol: Solution, find: Find & { kind: 'wattmeter' }, ac: boolean, peak: boolean): number {
  const am = ckt.element(find.current);
  if (am.type !== 'ammeter') throw new AnalysisError(`wattmeter: "current" must be the ammeter that stands for the current coil (${find.current} is ${am.type})`);
  if (!Array.isArray(find.nodes) || find.nodes.length !== 2) throw new AnalysisError('wattmeter: "nodes" must be the two nodes of the voltage coil ["a", "b"]');
  const u = sol.v(find.nodes[0], find.nodes[1]);
  const p = mul(u, conj(sol.i(find.current))).re;
  return ac && peak ? 0.5 * p : p;
}

function elementValue(ckt: Circuit, find: Find & { kind: 'val' }, an: StaticAnalysis | null): Val {
  const k = ckt.mutual.find((m) => m.ref === find.el);
  if (k) return real(k.M);
  const el = ckt.element(find.el);
  switch (el.type) {
    case 'R':
    case 'C':
    case 'L':
    case 'VCVS':
    case 'VCCS':
    case 'CCVS':
    case 'CCCS':
    case 'XFMR':
      return real(el.value);
    case 'Z':
      return { value: el.z!, complex: true };
    case 'V':
    case 'I': {
      if (an) return { value: an.sourceValue(el), complex: an.kind === 'ac' };
      // transient: value at find.t
      const s = el.src!;
      const t = find.t;
      if (s.kind === 'num') return real(s.value);
      if (s.kind === 'dcac') return real(s.dc);
      if (s.kind === 'step') return real(phaseOfT(t) === 'before' ? s.before : s.after);
      if (s.kind === 'impulse') return real(s.area); // the strength (area) of the impulse
      if (s.kind === 'exp') {
        if (t === undefined) throw new AnalysisError(`val: ${el.ref} is an exponential source; give a time "t"`);
        if (t === 'inf' || t === '0-' || (typeof t === 'number' && t < 0)) return real(0);
        return real(s.amp * Math.exp(-s.alpha * (typeof t === 'number' ? t : 0)));
      }
      if (t === undefined || t === 'inf') throw new AnalysisError(`val: ${el.ref} is a sinusoidal source; give a time "t"`);
      const tt = typeof t === 'number' ? t : 0;
      return real(s.offset + s.amp * Math.sin(2 * Math.PI * s.freq * tt + (s.phase * Math.PI) / 180));
    }
    default:
      throw new AnalysisError(`val: ${el.ref} (${el.type}) has no value`);
  }
}

// ---------------- entry points ----------------

const NAT = ['root', 'alpha', 'omega_d', 'omega0'];

export function computeComplex(netlist: Netlist, analysis: Analysis, find: Find): Val {
  if (!find || typeof find !== 'object') throw new AnalysisError('find must be an object');
  if (!analysis || typeof analysis !== 'object') throw new AnalysisError('analysis must be an object');
  const ckt = new Circuit(netlist);
  const deriv = (find as { deriv?: unknown }).deriv;
  if (deriv !== undefined) {
    if (deriv !== 1) throw new AnalysisError('find.deriv must be 1 (first time derivative)');
    if (analysis.type !== 'tran' || (find.kind !== 'v' && find.kind !== 'i'))
      throw new AnalysisError('find.deriv is only available for "v" and "i" in transient analysis');
  }
  if ((find.freq !== undefined || find.omega !== undefined) && analysis.type !== 'ac')
    throw new AnalysisError('find.freq / find.omega override the frequency of an AC problem; this problem is not AC');

  if (isSdomainKind(find.kind)) return sdomainQuantity(netlist, analysis.type, find as unknown as Record<string, unknown>);
  const nls = ckt.els.filter((e) => e.type === 'NR');
  if (nls.length) return nonlinearComplex(ckt, nls, analysis, find);
  if (find.kind === 'rs' || find.kind === 'rd' || find.kind === 'nop') throw new AnalysisError(`"${find.kind}" needs a nonlinear resistor (type NR) in the circuit`);
  if (find.dc && analysis.type === 'ac') return computeComplex(netlist, { type: 'dc' }, { ...find, dc: undefined });

  if (find.kind === 'f0') return real(resonance(ckt, find.port));
  if (find.kind === 'Q') return real(qualityFactor(ckt, find.port));
  if (find.kind === 'fc' || find.kind === 'bw') {
    const fs = cutoffs(ckt, find.out, find.input);
    const list = fs.map((f) => `${fmt(f)} Hz`).join(', ') || 'none';
    if (find.kind === 'bw') {
      if (fs.length < 2) throw new AnalysisError(`bw: the response has ${fs.length} −3 dB frequency (${list}); a bandwidth needs a lower and an upper one (band-pass)`);
      return real(fs[fs.length - 1] - fs[0]);
    }
    if (!fs.length) throw new AnalysisError('fc: |H| never drops to max/√2 in the searched range (no cutoff)');
    if (find.which === 'low') return real(fs[0]);
    if (find.which === 'high') return real(fs[fs.length - 1]);
    if (find.which !== undefined) throw new AnalysisError('fc: "which" must be "low" or "high"');
    if (fs.length > 1) throw new AnalysisError(`fc: there are ${fs.length} cutoff frequencies (${list}); say which one with "which": "low" or "high"`);
    return real(fs[0]);
  }
  if (find.kind === 'tau' || NAT.includes(find.kind)) {
    if (analysis.type === 'ac') throw new AnalysisError(`${find.kind} is a transient quantity; use analysis {type: "tran"}`);
    if (find.kind === 'tau') return real(new Transient(ckt).tau());
    return rootQuantity(ckt, find);
  }

  if (analysis.type === 'dc' || analysis.type === 'ac') {
    let an: StaticAnalysis;
    if (analysis.type === 'dc') an = new StaticAnalysis(ckt, 'dc', 0, phaseOfT(find.t));
    else {
      const o = find.omega !== undefined || find.freq !== undefined ? omegaOf({ type: 'ac', freq: find.freq, omega: find.omega }) : omegaOf(analysis);
      an = new StaticAnalysis(ckt, 'ac', o, 'after', analysis.phasor === 'peak');
    }
    if (find.kind === 'val') return elementValue(ckt, find, an);
    if (find.kind === 'w') {
      if (analysis.type === 'ac') throw new AnalysisError('w (stored energy) is available in DC and transient analysis');
      return real(energy(ckt, an.base(), find.el));
    }
    if (find.kind === 'wattmeter') return real(wattmeter(ckt, an.base(), find, analysis.type === 'ac', an.peak));
    const pq = ['v', 'i', 'p', 'q', 's', 'pf', 'meter'].includes(find.kind);
    if (pq) return pointQuantity(find, an.base(), ckt, analysis.type, an.peak)!;
    return networkQuantity(find, an);
  }
  if (analysis.type === 'tran') {
    if (find.kind === 'val') return elementValue(ckt, find, null);
    if (['v', 'i', 'p', 'meter', 'w', 'wattmeter'].includes(find.kind)) {
      if (find.t === undefined) throw new AnalysisError(`find.t is required in transient analysis ("0-", "0+", "inf" or a time in seconds)`);
      const tr = new Transient(ckt);
      if (deriv === 1) return pointQuantity(find, tr.derivAt(find.t), ckt, 'tran', false)!;
      const sol = tr.at(find.t);
      if (find.kind === 'w') return real(energy(ckt, sol, find.el));
      if (find.kind === 'wattmeter') return real(wattmeter(ckt, sol, find, false, false));
      return pointQuantity(find, sol, ckt, 'tran', false)!;
    }
    if (['req', 'vth', 'isc', 'pmax'].includes(find.kind)) {
      // resistive (DC) circuit before or after switching; C/L directly across the port are taken out
      const an = new StaticAnalysis(ckt, 'dc', 0, phaseOfT(find.t));
      an.removeStorageAcrossPort = true;
      return networkQuantity(find, an);
    }
    throw new AnalysisError(`"${find.kind}" is not available in transient analysis`);
  }
  throw new AnalysisError(`Unknown analysis type ${JSON.stringify((analysis as { type?: unknown }).type)}`);
}

// ---------------- nonlinear resistors (NR): operating point and small-signal analysis ----------------

/** DC solve hook for the operating-point search (null when the linearised circuit is singular) */
export function dcSolver(ckt: Circuit, phase: Phase = 'after'): Solver {
  return {
    solve: () => {
      try {
        const s = new StaticAnalysis(ckt, 'dc', 0, phase).solve();
        return { u: (r) => s.vEl(r).re, i: (r) => s.i(r).re };
      } catch (e) {
        if (e instanceof AnalysisError) return null;
        throw e;
      }
    },
  };
}

const NOT_NONLINEAR = ['tau', 'root', 'alpha', 'omega_d', 'omega0', 'f0', 'Q', 'fc', 'bw'];

/** DC: everything at the operating point Q (each NR replaced by its tangent line through Q, which
 *  by the substitution theorem gives the same node voltages and currents). AC: small-signal
 *  response — the NR replaced by its dynamic resistance at Q, sources contribute their ac parts.
 *  find.dc in an AC problem evaluates at the operating point instead. */
function nonlinearComplex(ckt: Circuit, nls: CEl[], analysis: Analysis, find: Find): Val {
  if (analysis.type === 'tran') throw new AnalysisError('Nonlinear resistors (type NR) are supported in DC (operating point) and AC (small-signal) analysis, not in transient analysis');
  if (NOT_NONLINEAR.includes(find.kind)) throw new AnalysisError(`"${find.kind}" is not defined for a circuit with nonlinear resistors`);
  const phase = phaseOfT(find.t);
  const ops = operatingPoints(nls, dcSolver(ckt, phase));
  if (find.kind === 'nop') return real(ops.length);
  const first = nls[0].ref;
  const list = ops.map((o, k) => `${k + 1}: u = ${fmt(o.u[first])} V, i = ${fmt(o.i[first])} A`).join('; ');
  if (!ops.length) throw new AnalysisError('The circuit has no DC operating point (the load line does not meet the characteristic)');
  let Q = ops[0];
  if (find.op !== undefined) {
    if (!Number.isInteger(find.op) || find.op < 1 || find.op > ops.length)
      throw new AnalysisError(`op must be 1…${ops.length} (operating points, by the voltage of ${first}: ${list})`);
    Q = ops[find.op - 1];
  } else if (ops.length > 1) throw new AnalysisError(`The circuit has ${ops.length} DC operating points (${list}); choose one with "op": 1…${ops.length}`);

  if (find.kind === 'rs' || find.kind === 'rd') {
    const el = ckt.element(find.el);
    if (el.type !== 'NR') throw new AnalysisError(`${find.kind}: ${find.el} is not a nonlinear resistor (type NR)`);
    const u = Q.u[el.ref];
    const i = Q.i[el.ref];
    if (find.kind === 'rs') {
      if (i === 0) throw new AnalysisError(`rs: the current of ${el.ref} at the operating point is zero, so the static resistance U/I is undefined`);
      return real(u / i);
    }
    const rds = piecesAt(el.nl!, u, i).map((k) => {
      const p = el.nl!.pieces[k];
      return dynamicR(p, p.x === 'u' ? u : i);
    });
    const r = rds[0];
    const same = (x: number) => x === r || (Number.isFinite(x) && Number.isFinite(r) && Math.abs(x - r) <= 1e-9 * Math.max(1, Math.abs(r)));
    if (!rds.every(same))
      throw new AnalysisError(`rd: the operating point of ${el.ref} (u = ${fmt(u)} V, i = ${fmt(i)} A) is a corner of its characteristic, where the dynamic resistance is not defined`);
    if (!Number.isFinite(r)) throw new AnalysisError(`rd: the characteristic of ${el.ref} is horizontal at the operating point (di/du = 0): the dynamic resistance is infinite`);
    return real(r);
  }

  const smallSignal = analysis.type === 'ac' && !find.dc;
  const portKinds = ['vth', 'isc', 'pmax'];
  if (portKinds.includes(find.kind)) {
    const ex = new Set(((find as { exclude?: string[] }).exclude ?? []).map(String));
    if (!nls.every((e) => ex.has(e.ref)))
      throw new AnalysisError(`${find.kind}: a Thevenin/Norton quantity is only defined for the linear part; list every nonlinear resistor in "exclude"`);
  }
  // req: the incremental (small-signal) resistance, so the tangent lines carry no constant term
  const withConst = !smallSignal && find.kind !== 'req';
  for (const e of nls) {
    const p = e.nl!.pieces[Q.piece[e.ref]];
    e.lin = tangent(p, p.x === 'u' ? Q.u[e.ref] : Q.i[e.ref], withConst);
  }
  let an: StaticAnalysis;
  if (smallSignal) {
    const a = analysis as Analysis & { type: 'ac' };
    const o = find.omega !== undefined || find.freq !== undefined ? omegaOf({ type: 'ac', freq: find.freq, omega: find.omega }) : omegaOf(a);
    an = new StaticAnalysis(ckt, 'ac', o, 'after', a.phasor === 'peak');
  } else an = new StaticAnalysis(ckt, 'dc', 0, phase);
  const kind = smallSignal ? 'ac' : 'dc';
  if (find.kind === 'val') {
    if (ckt.element(find.el).type === 'NR') throw new AnalysisError(`val: ${find.el} is a nonlinear resistor; it has no single value (ask rs or rd)`);
    return elementValue(ckt, find, an);
  }
  if (find.kind === 'w') {
    if (smallSignal) throw new AnalysisError('w (stored energy) is available in DC analysis');
    return real(energy(ckt, an.base(), find.el));
  }
  if (find.kind === 'wattmeter') return real(wattmeter(ckt, an.base(), find, smallSignal, an.peak));
  if (['v', 'i', 'p', 'q', 's', 'pf', 'meter'].includes(find.kind)) return pointQuantity(find, an.base(), ckt, kind, an.peak)!;
  return networkQuantity(find, an);
}

/** Reduce a (possibly complex) result to the requested real number. */
export function reduce(val: Val, part: Part | undefined, analysis: Analysis): number {
  let { re, im } = val.value;
  const m = Math.hypot(re, im);
  if (Math.abs(im) <= 1e-12 * m) im = 0;
  if (Math.abs(re) <= 1e-12 * m) re = 0;
  const ac = analysis.type === 'ac';
  const p: Part = part ?? val.defaultPart ?? (val.complex && ac ? 'mag' : 're');
  switch (p) {
    case 're':
      return re;
    case 'im':
      return im;
    case 'mag':
      return m;
    case 'phase': {
      if (m === 0) throw new AnalysisError('phase of a zero quantity is undefined');
      let d = (Math.atan2(im, re) * 180) / Math.PI;
      if (d <= -180) d += 360;
      return d;
    }
    case 'db':
      if (m === 0) throw new AnalysisError('dB of a zero quantity is −∞');
      return 20 * Math.log10(m);
    case 'rms':
      if (analysis.type === 'tran') throw new AnalysisError('part "rms" is not defined for an instantaneous (transient) value');
      if (ac) return analysis.phasor === 'peak' ? m / Math.SQRT2 : m;
      return Math.abs(re);
    default:
      throw new AnalysisError(`Unknown part "${String(p)}" (use re, im, mag, phase, db, rms)`);
  }
}

export function computeQuantity(netlist: Netlist, analysis: Analysis, find: Find): number {
  if (analysis?.type === 'periodic') return computePeriodic(netlist, analysis, find);
  const v = reduce(computeComplex(netlist, analysis, find), find.part, analysis);
  if (!Number.isFinite(v)) throw new AnalysisError('The result is not a finite number');
  return v;
}

