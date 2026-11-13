// Non-sinusoidal periodic steady state (textbook ch. 13, 非正弦周期电流电路):
//
//   analysis {type: "periodic", freq | omega, phasor?}   — fundamental f₁ / ω₁
//   sources  {harmonics: {dc, terms: [{k, amp, phase}]}}  — amp = amplitude, cosine reference
//            {wave: {shape, amp, upTo, offset}}           — standard waveform, Fourier series to upTo
//            a bare number / {dc} is a DC source; {dc, ac} adds a fundamental (ac.mag per `phasor`)
//
// The circuit is linear, so the response is the superposition of the responses to each harmonic:
// for k = 0 a DC analysis (C open, L short), for every k ≥ 1 a sinusoidal steady-state analysis at
// kω₁ with the existing MNA solver (X_L = kω₁L, X_C = 1/(kω₁C)). Derived quantities:
//
//   find.harmonic = k   one harmonic: v / i / meter / vth / isc are phasors (rms by default, so
//                       part "mag" is the rms value U_k of that harmonic, "phase" its initial phase);
//                       p / q / s / pf / wattmeter / pmax that harmonic's powers; req / gain / twoport
//                       evaluated at kω₁ (k = 0: DC).
//   no harmonic         the whole waveform: v / i / meter → part "rms" (default) = √(X₀² + Σ X_k²),
//                       "avg" = X₀, "absavg" = average of |x(t)|, "peak" = max |x(t)|; with a time
//                       t (s) the instantaneous value x(t).  p = P₀ + Σ P_k (average power),
//                       q = Σ Q_k, s = U·I (rms values), pf = |P|/S, wattmeter = Σ readings.
//                       f0, Q, fc, bw and val (of R, L, C, gains) do not depend on the source.

import type { Analysis, Complex, Find, Netlist, Part, ProblemElement, TwoTerminalElement } from '../problem/types';
import { Circuit, type CEl, isIndependent } from './circuit';
import { ZERO, abs, polarDeg, scale } from './complex';
import { computeComplex, reduce, type Val } from './engine';
import { AnalysisError } from './errors';

type PeriodicAnalysis = Analysis & { type: 'periodic' };

/** harmonic content of one independent source: DC value and peak phasors of harmonics k ≥ 1 */
interface SourceSpectrum {
  dc: number;
  h: Map<number, Complex>;
}

const PHASOR_KINDS = ['v', 'i', 'meter', 'vth', 'isc'];
const WHOLE_SIGNAL = ['v', 'i', 'meter'];
const WHOLE_POWER = ['p', 'q', 's', 'pf', 'wattmeter'];
const PER_HARMONIC_ONLY = ['req', 'vth', 'isc', 'pmax', 'gain', 'twoport'];
const FREQ_FREE = ['f0', 'Q', 'fc', 'bw'];

const fmt = (x: number) => Number(x.toPrecision(6)).toString();

export function fundamentalOmega(a: PeriodicAnalysis): number {
  const { freq, omega } = a;
  if (omega !== undefined && !(omega > 0)) throw new AnalysisError('analysis.omega must be > 0');
  if (freq !== undefined && !(freq > 0)) throw new AnalysisError('analysis.freq must be > 0');
  if (omega !== undefined && freq !== undefined && Math.abs(omega - 2 * Math.PI * freq) > 1e-9 * omega)
    throw new AnalysisError('analysis: freq and omega disagree (ω = 2πf); give only one');
  if (omega !== undefined) return omega;
  if (freq !== undefined) return 2 * Math.PI * freq;
  throw new AnalysisError('Periodic analysis needs the fundamental frequency: analysis.freq (Hz) or analysis.omega (rad/s)');
}

/** A periodic circuit: the source spectra and one netlist per harmonic. */
export class PeriodicCircuit {
  readonly ckt: Circuit;
  readonly omega: number;
  readonly rms: boolean;
  readonly spectra = new Map<string, SourceSpectrum>();
  /** harmonic orders present in some source (0 = DC), ascending */
  readonly orders: number[];
  private nets = new Map<number, Netlist>();

  constructor(
    readonly netlist: Netlist,
    readonly analysis: PeriodicAnalysis,
  ) {
    this.ckt = new Circuit(netlist);
    this.omega = fundamentalOmega(analysis);
    this.rms = analysis.phasor !== 'peak';
    const ks = new Set<number>();
    for (const el of this.ckt.els) {
      if (el.type === 'Z')
        throw new AnalysisError(`${el.ref}: a Z element has a fixed impedance at one frequency; in periodic (harmonic) analysis use R, L and C`);
      if (!isIndependent(el)) continue;
      const sp = this.spectrumOf(el);
      this.spectra.set(el.ref, sp);
      if (sp.dc !== 0) ks.add(0);
      for (const [k, x] of sp.h) if (abs(x) > 0) ks.add(k);
    }
    this.orders = [...ks].sort((a, b) => a - b);
  }

  private spectrumOf(el: CEl): SourceSpectrum {
    const s = el.src!;
    const h = new Map<number, Complex>();
    if (el.harmonics) {
      for (const t of el.harmonics) h.set(t.k, polarDeg(t.amp, t.phase));
      return { dc: s.kind === 'dcac' ? s.dc : 0, h };
    }
    switch (s.kind) {
      case 'num':
        return { dc: s.value, h };
      case 'dcac':
        if (s.ac) h.set(1, polarDeg(s.ac.mag * (this.rms ? Math.SQRT2 : 1), s.ac.phase));
        return { dc: s.dc, h };
      default:
        throw new AnalysisError(
          `${el.ref}: a ${s.kind} source cannot be used in periodic analysis; give it as {harmonics: {dc, terms: [{k, amp, phase}]}} or {wave: {shape, amp, upTo}}`,
        );
    }
  }

  /** the circuit driven only by harmonic k of every source (k = 0: the DC terms) */
  netFor(k: number): Netlist {
    let n = this.nets.get(k);
    if (n) return n;
    const elements = this.netlist.elements.map((e): ProblemElement => {
      const sp = e.type === 'V' || e.type === 'I' ? this.spectra.get(e.ref) : undefined;
      if (!sp) return e;
      const src = e as TwoTerminalElement;
      if (k === 0) return { ...src, value: sp.dc };
      const x = sp.h.get(k) ?? ZERO;
      return { ...src, value: { ac: { mag: abs(x), phase: abs(x) > 0 ? (Math.atan2(x.im, x.re) * 180) / Math.PI : 0 } } };
    });
    n = { ...this.netlist, elements };
    this.nets.set(k, n);
    return n;
  }

  /** analysis of harmonic k: DC, or AC at kω₁ with peak phasors (powers come out as ½Re(U·I*)) */
  analysisFor(k: number): Analysis {
    return k === 0 ? { type: 'dc' } : { type: 'ac', omega: k * this.omega, phasor: 'peak' };
  }

  /** raw engine value of `find` at harmonic k (phasors are PEAK phasors) */
  rawAt(k: number, find: Find): Val {
    return computeComplex(this.netFor(k), this.analysisFor(k), find);
  }

  /** peak phasor (k ≥ 1) or DC value (k = 0) of a signal quantity, for every harmonic present */
  signal(find: Find): Map<number, Complex> {
    const out = new Map<number, Complex>();
    for (const k of this.orders) out.set(k, this.rawAt(k, find).value);
    return out;
  }

  /** x(t) of a signal from its harmonics */
  static at(sig: Map<number, Complex>, omega: number, t: number): number {
    let x = 0;
    for (const [k, X] of sig) {
      if (k === 0) x += X.re;
      else x += X.re * Math.cos(k * omega * t) - X.im * Math.sin(k * omega * t);
    }
    return x;
  }

  static rms(sig: Map<number, Complex>): number {
    let s = 0;
    for (const [k, X] of sig) s += k === 0 ? X.re * X.re : abs(X) ** 2 / 2;
    return Math.sqrt(s);
  }

  /** samples of one period (enough points for every harmonic present) */
  samples(sig: Map<number, Complex>): number[] {
    const kmax = Math.max(1, ...sig.keys());
    const n = Math.max(8192, 128 * kmax);
    const T = (2 * Math.PI) / this.omega;
    const xs: number[] = [];
    for (let i = 0; i < n; i++) xs.push(PeriodicCircuit.at(sig, this.omega, (i * T) / n));
    return xs;
  }
}

function checkHarmonic(h: unknown): number {
  if (typeof h !== 'number' || !Number.isInteger(h) || h < 0) throw new AnalysisError('find.harmonic must be an integer ≥ 0 (0 = DC component, 1 = fundamental, …)');
  return h;
}

/** one harmonic of a quantity */
function perHarmonic(pc: PeriodicCircuit, find: Find, k: number): number {
  const part = find.part;
  if (part === 'avg' || part === 'absavg' || part === 'peak')
    throw new AnalysisError(`part "${part}" describes a whole periodic waveform; leave out "harmonic" (or ask for the harmonic's "mag" / "rms")`);
  const base = { ...find, harmonic: undefined, part: undefined } as Find;
  let val = pc.rawAt(k, base);
  if (k === 0) return reduce(val, part, { type: 'dc' });
  if (PHASOR_KINDS.includes(find.kind) && pc.rms) val = { ...val, value: scale(val.value, Math.SQRT1_2) };
  return reduce(val, part, { type: 'ac', omega: k * pc.omega, phasor: pc.rms ? 'rms' : 'peak' });
}

/** average power P = Σ_k P_k (k = 0: U₀I₀) of a two-terminal element, or Q / wattmeter sums */
function powerSum(pc: PeriodicCircuit, find: Find): number {
  let s = 0;
  for (const k of pc.orders) {
    if (k === 0 && find.kind === 'q') continue;
    s += pc.rawAt(k, find).value.re;
  }
  return s;
}

function wholeWave(pc: PeriodicCircuit, find: Find): number {
  const base = { ...find, part: undefined, t: undefined } as Find;
  if (WHOLE_SIGNAL.includes(find.kind)) {
    const sig = pc.signal(base);
    if (typeof find.t === 'number') {
      if (find.part !== undefined) throw new AnalysisError('find.t gives the instantaneous value x(t); leave out "part"');
      return PeriodicCircuit.at(sig, pc.omega, find.t);
    }
    if (find.t !== undefined) throw new AnalysisError('find.t: in periodic analysis give a time in seconds (the steady state has no 0−/0+/∞)');
    const part: Part = find.part ?? 'rms';
    switch (part) {
      case 'rms':
        return PeriodicCircuit.rms(sig);
      case 'avg':
        return sig.get(0)?.re ?? 0;
      case 'absavg': {
        const xs = pc.samples(sig);
        return xs.reduce((a, x) => a + Math.abs(x), 0) / xs.length;
      }
      case 'peak':
        return Math.max(...pc.samples(sig).map(Math.abs));
      default:
        throw new AnalysisError(
          `part "${part}": a non-sinusoidal quantity has no single phasor. Ask for one harmonic with "harmonic": k, or use part "rms" / "avg" / "absavg" / "peak"`,
        );
    }
  }
  if (find.t !== undefined) throw new AnalysisError(`find.t is only used for instantaneous values (v, i, meter) in periodic analysis`);
  if (find.part !== undefined && find.part !== 're') throw new AnalysisError(`"${find.kind}" of a periodic circuit is a real number; leave out "part"`);
  switch (find.kind) {
    case 'p':
    case 'q':
    case 'wattmeter':
      return powerSum(pc, base);
    case 's':
    case 'pf': {
      const el = find.el;
      const U = PeriodicCircuit.rms(pc.signal({ kind: 'v', el }));
      const I = PeriodicCircuit.rms(pc.signal({ kind: 'i', el }));
      const S = U * I;
      if (find.kind === 's') return S;
      if (!(S > 0)) throw new AnalysisError(`pf: ${el} carries no power (U or I is zero), the power factor is undefined`);
      return Math.abs(powerSum(pc, { kind: 'p', el })) / S;
    }
  }
  throw new AnalysisError(`unexpected quantity ${find.kind}`);
}

/** computeQuantity for analysis {type: "periodic"} */
export function computePeriodic(netlist: Netlist, analysis: PeriodicAnalysis, find: Find): number {
  if (!find || typeof find !== 'object') throw new AnalysisError('find must be an object');
  if (find.freq !== undefined || find.omega !== undefined)
    throw new AnalysisError('find.freq / find.omega: in periodic analysis ask for a harmonic with "harmonic": k instead');
  if ((find as { deriv?: unknown }).deriv !== undefined) throw new AnalysisError('find.deriv is only available in transient analysis');
  const pc = new PeriodicCircuit(netlist, analysis);
  const kind = find.kind;
  let v: number;
  if (FREQ_FREE.includes(kind)) {
    if (find.harmonic !== undefined) throw new AnalysisError(`${kind} is a property of the circuit, not of one harmonic; leave out "harmonic"`);
    v = reduce(computeComplex(pc.netFor(1), { type: 'ac', omega: pc.omega }, find), find.part, { type: 'ac', omega: pc.omega });
  } else if (kind === 'val') {
    const el = pc.ckt.element(find.el);
    if (isIndependent(el)) throw new AnalysisError(`val: ${el.ref} is a periodic source; ask for one harmonic of its voltage / current instead`);
    v = reduce(computeComplex(pc.netFor(1), { type: 'ac', omega: pc.omega }, { ...find, harmonic: undefined }), find.part, { type: 'dc' });
  } else if (find.harmonic !== undefined) {
    const k = checkHarmonic(find.harmonic);
    if (!WHOLE_SIGNAL.includes(kind) && !WHOLE_POWER.includes(kind) && !PER_HARMONIC_ONLY.includes(kind))
      throw new AnalysisError(`"${kind}" is not available per harmonic`);
    if (find.t !== undefined) throw new AnalysisError('find.t: ask either one harmonic or the instantaneous value, not both');
    v = perHarmonic(pc, find, k);
  } else if (PER_HARMONIC_ONLY.includes(kind)) {
    throw new AnalysisError(`"${kind}" depends on the frequency; say which harmonic with "harmonic": k (0 = DC)`);
  } else if (WHOLE_SIGNAL.includes(kind) || WHOLE_POWER.includes(kind)) {
    v = wholeWave(pc, find);
  } else throw new AnalysisError(`"${kind}" is not available in periodic analysis (ω₁ = ${fmt(pc.omega)} rad/s)`);
  if (!Number.isFinite(v)) throw new AnalysisError('The result is not a finite number');
  return v;
}
