// Derived quantities (what a question's `find` asks for) on top of the MNA / transient solvers.

import type { Analysis, Complex, Find, Netlist, Part } from '../problem/types';
import { Circuit, type CEl, isIndependent, isTwoTerminal } from './circuit';
import { ONE, ZERO, abs, conj, cx, div, mul, neg, polarDeg } from './complex';
import { AnalysisError } from './errors';
import { type Mode, MnaSystem, Solution } from './mna';
import { Transient } from './transient';

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
        throw new AnalysisError(`${el.ref}: in AC analysis give the source as a phasor {ac: {mag, phase}} instead of {sin: …}`);
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

  vth(a: number, b: number): Complex {
    const rem = this.portRemoved(a, b);
    const sol = rem.size ? this.solve({ removed: rem }) : this.base();
    return sol.vIdx(a, b);
  }

  isc(a: number, b: number): Complex {
    if (a === b) throw new AnalysisError('isc: the two port nodes are the same node');
    const sh = testSource('__short', 'V', a, b, 0);
    let sol: Solution;
    try {
      sol = this.solve({ extra: [sh], removed: this.portRemoved(a, b) });
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

interface Val {
  value: Complex;
  /** phasor-like result (reduce with part, default 'mag' in AC) vs real-valued quantity */
  complex: boolean;
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

function networkQuantity(find: Find, an: StaticAnalysis): Val {
  const ckt = an.ckt;
  const ac = an.kind === 'ac';
  switch (find.kind) {
    case 'req': {
      const [a, b] = portNodes(ckt, find.port, 'req');
      return { value: an.portZ(a, b), complex: ac };
    }
    case 'vth': {
      const [a, b] = portNodes(ckt, find.port, 'vth');
      return { value: an.vth(a, b), complex: ac };
    }
    case 'isc': {
      const [a, b] = portNodes(ckt, find.port, 'isc');
      return { value: an.isc(a, b), complex: ac };
    }
    case 'pmax': {
      const [a, b] = portNodes(ckt, find.port, 'pmax');
      const vth = an.vth(a, b);
      const z = an.portZ(a, b);
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

// ---------------- resonance ----------------

/** lowest frequency (Hz) at which the impedance at the port is purely real */
export function resonance(ckt: Circuit, port?: [string, string]): number {
  let a: number;
  let b: number;
  let removed: Set<string> | undefined;
  if (port) [a, b] = portNodes(ckt, port, 'f0');
  else {
    const srcs = ckt.els.filter(isIndependent);
    if (srcs.length !== 1)
      throw new AnalysisError(`f0: without "port" the circuit must have exactly one independent source (it has ${srcs.length}); give "port": ["a", "b"]`);
    [a, b] = srcs[0].pins;
    removed = new Set([srcs[0].ref]);
  }
  const R = ckt.els.filter((e) => e.type === 'R' && e.value !== 0).map((e) => Math.abs(e.value));
  const C = ckt.els.filter((e) => e.type === 'C').map((e) => e.value);
  const L = ckt.els.filter((e) => e.type === 'L').map((e) => e.value);
  if (!C.length && !L.length) throw new AnalysisError('f0: the circuit has no capacitor or inductor, so there is no resonance');
  const cands: number[] = [];
  for (const l of L) for (const c of C) cands.push(1 / Math.sqrt(l * c));
  for (const r of R) {
    for (const c of C) cands.push(1 / (r * c));
    for (const l of L) cands.push(r / l);
  }
  if (!cands.length) cands.push(1);
  const lo = Math.log10(Math.min(...cands)) - 4;
  const hi = Math.log10(Math.max(...cands)) + 4;
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
  const steps = Math.ceil((hi - lo) * 200);
  const ws: number[] = [];
  const hs: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const w = 10 ** (lo + ((hi - lo) * i) / steps);
    ws.push(w);
    hs.push(h(w));
  }
  if (hs.every((v) => v === 0)) throw new AnalysisError('f0: the impedance is purely real at all frequencies; there is no resonance');
  let prev = -1;
  for (let i = 0; i < hs.length; i++) {
    if (hs[i] === 0) continue;
    if (prev >= 0 && Math.sign(hs[i]) !== Math.sign(hs[prev])) {
      if (i - prev > 1) return ws[prev + 1] / (2 * Math.PI); // exact zero sample in between
      let l = Math.log(ws[prev]);
      let r = Math.log(ws[i]);
      const sl = Math.sign(hs[prev]);
      for (let k = 0; k < 200 && r - l > 1e-15; k++) {
        const mid = (l + r) / 2;
        const v = h(Math.exp(mid));
        if (v === 0) {
          l = r = mid;
          break;
        }
        if (Math.sign(v) === sl) l = mid;
        else r = mid;
      }
      return Math.exp((l + r) / 2) / (2 * Math.PI);
    }
    prev = i;
  }
  throw new AnalysisError(
    `f0: the input impedance is never purely real between ${fmt(10 ** lo / (2 * Math.PI))} Hz and ${fmt(10 ** hi / (2 * Math.PI))} Hz (no resonance)`,
  );
}

// ---------------- entry points ----------------

export function computeComplex(netlist: Netlist, analysis: Analysis, find: Find): Val {
  if (!find || typeof find !== 'object') throw new AnalysisError('find must be an object');
  if (!analysis || typeof analysis !== 'object') throw new AnalysisError('analysis must be an object');
  const ckt = new Circuit(netlist);

  if (find.kind === 'f0') return real(resonance(ckt, find.port));
  if (find.kind === 'tau') {
    if (analysis.type === 'ac') throw new AnalysisError('tau is a transient quantity; use analysis {type: "tran"}');
    return real(new Transient(ckt).tau());
  }

  if (analysis.type === 'dc' || analysis.type === 'ac') {
    const an =
      analysis.type === 'dc'
        ? new StaticAnalysis(ckt, 'dc', 0, phaseOfT(find.t))
        : new StaticAnalysis(ckt, 'ac', omegaOf(analysis), 'after', analysis.phasor === 'peak');
    const pq = ['v', 'i', 'p', 'q', 's', 'pf', 'meter'].includes(find.kind);
    if (pq) return pointQuantity(find, an.base(), ckt, analysis.type, an.peak)!;
    return networkQuantity(find, an);
  }
  if (analysis.type === 'tran') {
    if (['v', 'i', 'p', 'meter'].includes(find.kind)) {
      if (find.t === undefined) throw new AnalysisError(`find.t is required in transient analysis ("0-", "0+", "inf" or a time in seconds)`);
      const sol = new Transient(ckt).at(find.t);
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

/** Reduce a (possibly complex) result to the requested real number. */
export function reduce(val: Val, part: Part | undefined, analysis: Analysis): number {
  let { re, im } = val.value;
  const m = Math.hypot(re, im);
  if (Math.abs(im) <= 1e-12 * m) im = 0;
  if (Math.abs(re) <= 1e-12 * m) re = 0;
  const ac = analysis.type === 'ac';
  const p: Part = part ?? (val.complex && ac ? 'mag' : 're');
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
  const v = reduce(computeComplex(netlist, analysis, find), find.part, analysis);
  if (!Number.isFinite(v)) throw new AnalysisError('The result is not a finite number');
  return v;
}

