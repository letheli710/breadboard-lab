// Uniform transmission lines (textbook ch. 18, 均匀传输线): element type TL.
//
// A TL element is a four-terminal (two-port) element: port 1 (p1, n1) is the START of the line
// (x = 0, usually the source side), port 2 (p2, n2) the END (x = l, the load side). x is measured
// from the start, x' = l − x from the end. The voltage u(x) is between the conductors (p-conductor
// minus n-conductor) and the current i(x) flows in the +x direction (start → end) in the
// p-conductor.
//
// Line data (SI per metre):
//   {R0, L0, G0, C0, length}   primary parameters
//   {zc, vp, length}           lossless line given by its (real) characteristic impedance and phase
//                              velocity; internally L0 = zc/vp, C0 = 1/(zc·vp), R0 = G0 = 0
//
// Sinusoidal steady state (and DC, ω = 0): the exact two-port (chain / ABCD) model
//   U̇1 = cosh(γl)·U̇2 + Z_c·sinh(γl)·İ2,   İ1 = sinh(γl)/Z_c·U̇2 + cosh(γl)·İ2
// with İ2 the current leaving the end into the load, Z_0 = R0 + jωL0, Y_0 = G0 + jωC0,
// γ = √(Z_0·Y_0) (Re γ ≥ 0), Z_c = √(Z_0/Y_0). Z_c·sinh θ = Z_0·l·sinh(θ)/θ and
// sinh(θ)/Z_c = Y_0·l·sinh(θ)/θ (θ = γl) are used so that DC and lossless lines need no special case.
//
// Transient (analysis "tran"): a lossless line between resistive one-ports, zero initial state,
// step / DC sources on the start side only; solved by the bounce (lattice) method — every wave
// travels at v = 1/√(L0·C0) and is reflected with Γ = (R − Z_c)/(R + Z_c) at each end.
//
// Questions: find {kind: "tl", el, what, x?, from?} (see TL_WHATS); ordinary v / i / p of the other
// elements work as usual (in "tran" by substituting the line by its terminal currents).

import type { Complex } from '../problem/types';
import { type CEl, type Circuit, parseNum } from './circuit';
import { ONE, abs, add, conj, cx, div, mul, scale, sqrt, sub } from './complex';
import { AnalysisError } from './errors';

export interface LineSpec {
  R0: number;
  L0: number;
  G0: number;
  C0: number;
  length: number;
  /** how the author gave it (for labels and messages) */
  form: 'rlgc' | 'lossless';
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Read the `line` field of a TL element. */
export function parseLine(ref: string, raw: unknown): LineSpec {
  if (!isObj(raw)) throw new AnalysisError(`${ref}: a transmission line needs "line": {R0, L0, G0, C0, length} or {zc, vp, length}`);
  const num = (k: string, min0 = true) => {
    const v = parseNum(raw[k], `${ref}.line.${k}`);
    if (min0 ? !(v >= 0) : !(v > 0)) throw new AnalysisError(`${ref}.line.${k} must be ${min0 ? '≥ 0' : '> 0'}`);
    return v;
  };
  const length = num('length', false);
  if ('zc' in raw || 'vp' in raw) {
    for (const k of ['R0', 'L0', 'G0', 'C0']) if (k in raw) throw new AnalysisError(`${ref}.line: give either {zc, vp, length} (lossless) or {R0, L0, G0, C0, length}, not both`);
    const zc = num('zc', false);
    const vp = num('vp', false);
    return { R0: 0, L0: zc / vp, G0: 0, C0: 1 / (zc * vp), length, form: 'lossless' };
  }
  const spec = { R0: num('R0'), L0: num('L0'), G0: num('G0'), C0: num('C0'), length, form: 'rlgc' as const };
  if (!(spec.L0 > 0 && spec.C0 > 0)) throw new AnalysisError(`${ref}.line: L0 and C0 must be > 0`);
  return spec;
}

// ---------- complex hyperbolic helpers ----------

export const cosh = (z: Complex): Complex => cx(Math.cosh(z.re) * Math.cos(z.im), Math.sinh(z.re) * Math.sin(z.im));
export const sinh = (z: Complex): Complex => cx(Math.sinh(z.re) * Math.cos(z.im), Math.cosh(z.re) * Math.sin(z.im));
/** sinh(z)/z, = 1 at z = 0 */
export function shc(z: Complex): Complex {
  const m = abs(z);
  if (m < 1e-5) {
    const z2 = mul(z, z);
    return add(ONE, add(scale(z2, 1 / 6), scale(mul(z2, z2), 1 / 120)));
  }
  return div(sinh(z), z);
}

/** Line constants at angular frequency ω (ω = 0: DC). */
export interface LineAt {
  /** series impedance and shunt admittance per metre */
  Z0: Complex;
  Y0: Complex;
  /** propagation constant α + jβ (1/m), Re ≥ 0 */
  gamma: Complex;
  /** characteristic impedance (NaN when Y0 = 0, i.e. DC with G0 = 0) */
  zc: Complex;
  length: number;
  omega: number;
}

export function lineAt(spec: LineSpec, omega: number): LineAt {
  const Z0 = cx(spec.R0, omega * spec.L0);
  const Y0 = cx(spec.G0, omega * spec.C0);
  let gamma = sqrt(mul(Z0, Y0));
  if (gamma.re < 0 || (gamma.re === 0 && gamma.im < 0)) gamma = cx(-gamma.re, -gamma.im);
  const zc = Y0.re === 0 && Y0.im === 0 ? cx(NaN, NaN) : div(gamma, Y0); // = √(Z0/Y0) with the matching sign
  return { Z0, Y0, gamma, zc, length: spec.length, omega };
}

/** Chain (ABCD) parameters of a piece of line of length d: [A, B, C, D] with A = D. */
export function chain(at: LineAt, d: number): [Complex, Complex, Complex, Complex] {
  const th = scale(at.gamma, d);
  const ch = cosh(th);
  const s = shc(th);
  return [ch, mul(scale(at.Z0, d), s), mul(scale(at.Y0, d), s), ch];
}

/** voltage and current (in +x) at distance xe from the END, from the end values (I2 leaves the end). */
export function fromEnd(at: LineAt, U2: Complex, I2: Complex, xe: number): { u: Complex; i: Complex } {
  const [A, B, C, D] = chain(at, xe);
  return { u: add(mul(A, U2), mul(B, I2)), i: add(mul(C, U2), mul(D, I2)) };
}

export const isTL = (el: CEl): boolean => el.type === 'TL';

// ---------- questions ----------

/** what a {kind: "tl"} question can ask */
export const TL_WHATS = [
  'zc', // characteristic impedance Z_c (complex, Ω)
  'gamma', // propagation constant γ = α + jβ (complex, 1/m)
  'alpha', // attenuation constant α (Np/m)
  'beta', // phase constant β (rad/m)
  'lambda', // wavelength 2π/β (m)
  'vp', // phase velocity ω/β (m/s)
  'length', // line length l (m)
  'wavelengths', // electrical length l/λ
  'delay', // one-way travel time l/v (s), lossless lines
  'u', // voltage phasor U̇(x) between the conductors (tran: u(x, t))
  'i', // current phasor İ(x) in +x (tran: i(x, t))
  'uinc', // incident (forward) voltage wave U̇⁺(x) = (U̇ + Z_c·İ)/2
  'uref', // reflected (backward) voltage wave U̇⁻(x) = (U̇ − Z_c·İ)/2
  'z', // impedance U̇(x)/İ(x) looking towards the end (default x = 0: input impedance)
  'refl', // reflection coefficient Γ(x) = U̇⁻/U̇⁺ (default at the end; tran: Γ_2 of the load)
  'reflSource', // tran: Γ_1 = (R_1 − Z_c)/(R_1 + Z_c) of the start-side network
  'vswr', // standing-wave ratio (1 + |Γ|)/(1 − |Γ|) (default at the end)
  'p', // average power flowing in +x at x
  'eta', // efficiency P(end)/P(start)
  'umax', // max |U̇(x)| over 0 ≤ x ≤ l
  'umin', // min |U̇(x)| over 0 ≤ x ≤ l
  'imax',
  'imin',
  'xmax', // lossless: distance from the END to the first voltage maximum (≥ 0)
  'xmin', // lossless: distance from the END to the first voltage minimum (≥ 0)
] as const;
export type TlWhat = (typeof TL_WHATS)[number];

/** quantities that need a position x */
export const TL_AT_X: readonly string[] = ['u', 'i', 'uinc', 'uref', 'p'];
/** quantities that may take a position x (default given in the docs) */
export const TL_X_OK: readonly string[] = [...TL_AT_X, 'z', 'refl', 'vswr'];
/** quantities that need a time t in transient analysis */
export const TL_TIMED: readonly string[] = ['u', 'i', 'p'];

export interface TlFind {
  kind: 'tl';
  el: string;
  what: TlWhat;
  x?: number;
  from?: 'start' | 'end';
}

export interface Val {
  value: Complex;
  complex: boolean;
}
const real = (x: number): Val => ({ value: cx(x), complex: false });
const cplx = (z: Complex): Val => ({ value: z, complex: true });

/** distance from the END for a find's x / from (dflt used when x is absent) */
function xEnd(f: TlFind, l: number, dflt: 'start' | 'end' | null): number {
  if (f.x === undefined) {
    if (!dflt) throw new AnalysisError(`tl: "${f.what}" needs a position "x" (metres, measured from the start unless "from": "end")`);
    return dflt === 'end' ? 0 : l;
  }
  if (!(typeof f.x === 'number' && f.x >= 0 && f.x <= l * (1 + 1e-12))) throw new AnalysisError(`tl: x = ${f.x} m is outside the line (0 ≤ x ≤ l = ${l} m)`);
  const x = Math.min(f.x, l);
  return f.from === 'end' ? x : l - x;
}

const lossless = (at: LineAt) => at.gamma.re <= 1e-12 * Math.abs(at.gamma.im);

/** line-only quantities (no circuit solution needed) */
function lineConstant(f: TlFind, at: LineAt, spec: LineSpec): Val | null {
  const beta = at.gamma.im;
  switch (f.what) {
    case 'zc':
      if (!Number.isFinite(at.zc.re)) throw new AnalysisError('tl: Z_c is undefined at ω = 0 with G0 = 0');
      return cplx(at.zc);
    case 'gamma':
      return cplx(at.gamma);
    case 'alpha':
      return real(at.gamma.re);
    case 'beta':
      return real(beta);
    case 'lambda':
      if (!(beta > 0)) throw new AnalysisError('tl: the wavelength needs β > 0 (an AC analysis)');
      return real((2 * Math.PI) / beta);
    case 'vp':
      if (!(beta > 0)) throw new AnalysisError('tl: the phase velocity needs β > 0 (an AC analysis)');
      return real(at.omega / beta);
    case 'length':
      return real(spec.length);
    case 'wavelengths':
      if (!(beta > 0)) throw new AnalysisError('tl: the electrical length needs β > 0 (an AC analysis)');
      return real((beta * spec.length) / (2 * Math.PI));
    case 'delay':
      return real(spec.length * Math.sqrt(spec.L0 * spec.C0));
  }
  return null;
}

/** Sinusoidal steady state: U̇2, İ2 at the end come from the solved circuit. */
export function tlAc(f: TlFind, spec: LineSpec, omega: number, U2: Complex, I2: Complex, peak: boolean): Val {
  const at = lineAt(spec, omega);
  const c = lineConstant(f, at, spec);
  if (c) return c;
  if (!(omega > 0)) throw new AnalysisError(`tl: "${f.what}" needs an AC analysis`);
  const l = spec.length;
  const zc = at.zc;
  const k = peak ? 0.5 : 1;
  const ui = (xe: number) => fromEnd(at, U2, I2, xe);
  const waves = (xe: number) => {
    const { u, i } = ui(xe);
    const zi = mul(zc, i);
    return { p: scale(add(u, zi), 0.5), m: scale(sub(u, zi), 0.5) };
  };
  const refl = (xe: number) => {
    const { p, m } = waves(xe);
    if (abs(p) === 0) throw new AnalysisError('tl: no incident wave at this point (is the line excited?)');
    return div(m, p);
  };
  switch (f.what) {
    case 'u':
      return cplx(ui(xEnd(f, l, null)).u);
    case 'i':
      return cplx(ui(xEnd(f, l, null)).i);
    case 'uinc':
      return cplx(waves(xEnd(f, l, null)).p);
    case 'uref':
      return cplx(waves(xEnd(f, l, null)).m);
    case 'z': {
      const { u, i } = ui(xEnd(f, l, 'start'));
      if (abs(i) <= 1e-12 * abs(u) || abs(u) + abs(i) === 0) throw new AnalysisError('tl: the current is zero here, so the impedance is infinite (or the line is not excited)');
      return cplx(div(u, i));
    }
    case 'refl':
      return cplx(refl(xEnd(f, l, 'end')));
    case 'vswr': {
      const g = abs(refl(xEnd(f, l, 'end')));
      if (g >= 1 - 1e-12) throw new AnalysisError('tl: |Γ| = 1 (open / short / reactive load): the standing-wave ratio is infinite');
      return real((1 + g) / (1 - g));
    }
    case 'p': {
      const { u, i } = ui(xEnd(f, l, null));
      return real(k * mul(u, conj(i)).re);
    }
    case 'eta': {
      const p1 = mul(ui(l).u, conj(ui(l).i)).re;
      const p2 = mul(U2, conj(I2)).re;
      if (!(p1 > 0)) throw new AnalysisError('tl: no power enters the line at the start');
      return real(p2 / p1);
    }
    case 'umax':
    case 'umin':
    case 'imax':
    case 'imin': {
      const g = (xe: number) => abs(f.what[0] === 'u' ? ui(xe).u : ui(xe).i);
      return real(extremum(g, l, f.what.endsWith('max')));
    }
    case 'xmax':
    case 'xmin': {
      if (!lossless(at)) throw new AnalysisError('tl: xmax / xmin are defined for a lossless line only');
      const G = refl(0);
      if (abs(G) < 1e-9) throw new AnalysisError('tl: the line is matched (Γ = 0): there are no voltage maxima / minima');
      // |U(x')|² ∝ 1 + |Γ|² + 2|Γ|cos(φ − 2βx'): maxima where φ − 2βx' = 2πn, minima at π + 2πn
      const phi = Math.atan2(G.im, G.re);
      const tw = 2 * Math.PI;
      const ang = f.what === 'xmax' ? phi : phi + Math.PI;
      let a = ((ang % tw) + tw) % tw;
      if (a > tw - 1e-9) a = 0;
      return real(a / (2 * at.gamma.im));
    }
    case 'reflSource':
      throw new AnalysisError('tl: "reflSource" is only available in transient (bounce-diagram) problems');
  }
  throw new AnalysisError(`tl: unknown quantity "${String(f.what)}"`);
}

/** max / min of g on [0, l]: dense sampling then golden-section refinement */
function extremum(g: (x: number) => number, l: number, max: boolean): number {
  const s = max ? 1 : -1;
  const N = 4000;
  let best = 0;
  let bv = -Infinity;
  for (let k = 0; k <= N; k++) {
    const v = s * g((l * k) / N);
    if (v > bv) {
      bv = v;
      best = k;
    }
  }
  let a = (l * Math.max(0, best - 1)) / N;
  let b = (l * Math.min(N, best + 1)) / N;
  const r = (Math.sqrt(5) - 1) / 2;
  for (let it = 0; it < 80; it++) {
    const c = b - r * (b - a);
    const d = a + r * (b - a);
    if (s * g(c) > s * g(d)) b = d;
    else a = c;
  }
  return Math.max(bv, s * g((a + b) / 2)) * s;
}

// ---------- transient: lossless line, bounce diagram ----------

export interface Bounce {
  zc: number;
  /** one-way delay l/v (s) */
  T: number;
  length: number;
  /** first forward wave launched at t = 0 */
  a0: number;
  g1: number;
  g2: number;
  /** resistances of the start- and end-side networks (Infinity: open) */
  r1: number;
  r2: number;
}

const reflOf = (R: number, zc: number) => (R === Infinity ? 1 : (R - zc) / (R + zc));

/** u(x, t) and i(x, t) (x from the start; t ≥ 0; t = Infinity: final value). Values just after a wavefront (t+). */
export function bounceAt(b: Bounce, x: number, t: number): { u: number; i: number } {
  const { T, length: l, a0, g1, g2, zc } = b;
  if (t === Infinity) {
    const r = g1 * g2;
    if (Math.abs(r) >= 1 - 1e-12) throw new AnalysisError('tl: |Γ_1·Γ_2| = 1, the waves never die out: there is no final value');
    const f = a0 / (1 - r);
    return { u: f * (1 + g2), i: (f * (1 - g2)) / zc };
  }
  const v = l / T;
  const eps = 1e-9 * T;
  let fw = 0;
  let bw = 0;
  let amp = a0;
  for (let k = 0; k < 100000; k++) {
    const tf = (2 * k * l + x) / v;
    if (tf > t + eps || amp === 0) break;
    fw += amp;
    const tb = ((2 * k + 2) * l - x) / v;
    if (tb <= t + eps) bw += amp * g2;
    amp *= g1 * g2;
  }
  return { u: fw + bw, i: (fw - bw) / zc };
}

const sourceFree = (el: CEl): boolean => el.type !== 'V' && el.type !== 'I';

/** Set up the bounce solution of a circuit with one lossless TL and resistive terminations. */
export function bounceOf(
  ckt: Circuit,
  tl: CEl & { line: LineSpec },
  port: (a: number, b: number, phase: 'before' | 'after', removed: Set<string>) => { uoc: number; r: number },
): Bounce {
  const s = tl.line;
  if (s.R0 !== 0 || s.G0 !== 0) throw new AnalysisError(`${tl.ref}: transient (bounce-diagram) analysis needs a lossless line (R0 = G0 = 0)`);
  for (const el of ckt.els)
    if (el.type === 'C' || el.type === 'L' || el.type === 'NR' || el.type === 'OPAMP' || el.type === 'XFMR' || (el.type === 'TL' && el !== tl))
      throw new AnalysisError(
        `${el.ref}: a transient problem with a transmission line may only contain resistive terminations (R, sources, switches, controlled sources) and one TL`,
      );
  for (const el of ckt.els)
    if (!sourceFree(el) && el.src && el.src.kind !== 'num' && el.src.kind !== 'step' && el.src.kind !== 'dcac')
      throw new AnalysisError(`${el.ref}: only DC / step sources are supported with a transmission line in transient analysis`);
  const zc = Math.sqrt(s.L0 / s.C0);
  const T = s.length * Math.sqrt(s.L0 * s.C0);
  const rm = new Set([tl.ref]);
  const [p1, n1, p2, n2] = tl.pins;
  const before1 = port(p1, n1, 'before', rm);
  const before2 = port(p2, n2, 'before', rm);
  if (Math.abs(before1.uoc) > 1e-12 || Math.abs(before2.uoc) > 1e-12)
    throw new AnalysisError(`${tl.ref}: the line must be uncharged before t = 0 (no source may act on it for t < 0)`);
  const end1 = port(p1, n1, 'after', rm);
  const end2 = port(p2, n2, 'after', rm);
  if (Math.abs(end2.uoc) > 1e-12) throw new AnalysisError(`${tl.ref}: sources are supported on the start side (port 1) only`);
  if (end1.r === Infinity) throw new AnalysisError(`${tl.ref}: the start-side network must have a finite resistance`);
  return { zc, T, length: s.length, a0: (end1.uoc * zc) / (end1.r + zc), g1: reflOf(end1.r, zc), g2: reflOf(end2.r, zc), r1: end1.r, r2: end2.r };
}

/** Quantities of a {kind: "tl"} question in a transient problem. */
export function tlTran(f: TlFind & { t?: unknown }, b: Bounce, spec: LineSpec): Val {
  switch (f.what) {
    case 'zc':
      return real(b.zc);
    case 'length':
      return real(spec.length);
    case 'delay':
      return real(b.T);
    case 'vp':
      return real(spec.length / b.T);
    case 'refl':
      return real(b.g2);
    case 'reflSource':
      return real(b.g1);
    case 'u':
    case 'i':
    case 'p': {
      const { u, i } = bounceAt(b, spec.length - xEnd(f, spec.length, null), tOf(f.t));
      return real(f.what === 'u' ? u : f.what === 'i' ? i : u * i);
    }
  }
  throw new AnalysisError(`tl: "${f.what}" is not available in transient analysis (use u, i, p, zc, vp, delay, refl, reflSource, length)`);
}

export function tOf(t: unknown): number {
  if (t === 'inf') return Infinity;
  if (t === '0+' || t === 0) return 0;
  if (t === '0-') throw new AnalysisError('tl: the line is uncharged at t = 0−; ask for a time ≥ 0');
  if (typeof t === 'number' && t >= 0) return t;
  throw new AnalysisError('tl: transient questions need a time "t" ≥ 0 (seconds, "0+" or "inf")');
}
