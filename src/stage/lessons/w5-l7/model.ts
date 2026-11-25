// W5-L7 model: a transfer function in Bode standard form as a list of basic factors (the sheet's
// four "lego bricks": a constant K, an origin zero / pole (jω)^±1, a first-order real zero / pole
// (1 + jω/ω_c)^±1 and a second-order pole pair [1 + j2ζ(ω/ω_n) − (ω/ω_n)²]^−1), with each factor's
// exact response and its straight-line asymptotes:
//  - magnitude: K flat at 20 log|K|; (jω)^±1 through (1, 0 dB) at ±20 dB/dec; a real factor 0 dB up
//    to ω_c, then ±20 dB/dec; the pole pair 0 dB up to ω_n, then −40 dB/dec;
//  - phase: K 0° (K < 0: −180°); (jω)^±1 ±90°; a real factor 0° below 0.1ω_c, ±45°/dec over the two
//    decades [0.1ω_c, 10ω_c], ±90° above; the pole pair 0° → −180° over [0.1ω_n, 10ω_n] (−90°/dec).
// The whole transfer function's exact dB and phase are the sums of its factors' (log of a product);
// so are the asymptotes and the slopes. Pure functions, no React.

export type FactorKind = 'K' | 'origin' | 'real' | 'quad';

export interface Factor {
  /** hover-map id of the factor */
  id: string;
  kind: FactorKind;
  /** K: the constant */
  K?: number;
  /** origin / real: +1 zero, −1 pole */
  n?: 1 | -1;
  /** real: ω_c; quad: ω_n (rad/s) */
  w?: number;
  /** quad: damping ratio ζ */
  zeta?: number;
}

export type Cx = [number, number];
const inv = (a: Cx): Cx => {
  const d = a[0] * a[0] + a[1] * a[1];
  return [a[0] / d, -a[1] / d];
};
const DEG = 180 / Math.PI;
const lg = Math.log10;

/** the factor's value at s = jω */
export function factorH(f: Factor, w: number): Cx {
  switch (f.kind) {
    case 'K':
      return [f.K!, 0];
    case 'origin':
      return f.n === 1 ? [0, w] : inv([0, w]);
    case 'real':
      return f.n === 1 ? [1, w / f.w!] : inv([1, w / f.w!]);
    case 'quad': {
      const u = w / f.w!;
      return inv([1 - u * u, 2 * f.zeta! * u]);
    }
  }
}

/** exact magnitude in dB, 20 log10 |factor| */
export function factorDb(f: Factor, w: number): number {
  const [re, im] = factorH(f, w);
  return 20 * lg(Math.hypot(re, im));
}

/** exact phase in degrees, continuous in ω (the pole pair runs 0° → −180° without wrapping) */
export function factorPhase(f: Factor, w: number): number {
  switch (f.kind) {
    case 'K':
      return f.K! >= 0 ? 0 : -180;
    case 'origin':
      return 90 * f.n!;
    case 'real':
      return f.n! * Math.atan(w / f.w!) * DEG;
    case 'quad': {
      const u = w / f.w!;
      return -Math.atan2(2 * f.zeta! * u, 1 - u * u) * DEG;
    }
  }
}

/** straight-line magnitude asymptote (dB) */
export function factorAsymDb(f: Factor, w: number): number {
  switch (f.kind) {
    case 'K':
      return 20 * lg(Math.abs(f.K!));
    case 'origin':
      return 20 * f.n! * lg(w);
    case 'real':
      return w <= f.w! ? 0 : 20 * f.n! * lg(w / f.w!);
    case 'quad':
      return w <= f.w! ? 0 : -40 * lg(w / f.w!);
  }
}

/** straight-line phase asymptote (degrees) */
export function factorAsymPhase(f: Factor, w: number): number {
  switch (f.kind) {
    case 'K':
    case 'origin':
      return factorPhase(f, w);
    case 'real': {
      const t = Math.min(2, Math.max(0, lg(w / (0.1 * f.w!))));
      return 45 * f.n! * t;
    }
    case 'quad': {
      const t = Math.min(2, Math.max(0, lg(w / (0.1 * f.w!))));
      return -90 * t;
    }
  }
}

/** slope of the factor's magnitude asymptote just above ω (dB/dec) */
export function factorMagSlope(f: Factor, w: number): number {
  switch (f.kind) {
    case 'K':
      return 0;
    case 'origin':
      return 20 * f.n!;
    case 'real':
      return w >= f.w! ? 20 * f.n! : 0;
    case 'quad':
      return w >= f.w! ? -40 : 0;
  }
}

/** slope of the factor's phase asymptote just above ω (°/dec) */
export function factorPhaseSlope(f: Factor, w: number): number {
  if (f.kind !== 'real' && f.kind !== 'quad') return 0;
  if (w < 0.1 * f.w! || w >= 10 * f.w!) return 0;
  return f.kind === 'real' ? 45 * f.n! : -90;
}

const sum = (fs: Factor[], g: (f: Factor) => number) => fs.reduce((s, f) => s + g(f), 0);
export const totalDb = (fs: Factor[], w: number) => sum(fs, (f) => factorDb(f, w));
export const totalPhase = (fs: Factor[], w: number) => sum(fs, (f) => factorPhase(f, w));
export const totalAsymDb = (fs: Factor[], w: number) => sum(fs, (f) => factorAsymDb(f, w));
export const totalAsymPhase = (fs: Factor[], w: number) => sum(fs, (f) => factorAsymPhase(f, w));
export const totalMagSlope = (fs: Factor[], w: number) => sum(fs, (f) => factorMagSlope(f, w));
export const totalPhaseSlope = (fs: Factor[], w: number) => sum(fs, (f) => factorPhaseSlope(f, w));

/** the corner frequencies (ω_c, ω_n) of the factors */
export const corners = (fs: Factor[]) => [...new Set(fs.filter((f) => f.kind === 'real' || f.kind === 'quad').map((f) => f.w!))].sort((a, b) => a - b);

/** where a slope (magnitude or phase) changes: each corner and a decade either side of it, inside [lo, hi] */
export function breakpoints(fs: Factor[], lo: number, hi: number): number[] {
  const out = new Set<number>();
  for (const w of corners(fs)) for (const b of [0.1 * w, w, 10 * w]) if (b > lo * 1.0001 && b < hi * 0.9999) out.add(Number(b.toPrecision(12)));
  return [...out].sort((a, b) => a - b);
}

export interface Segment {
  lo: number;
  hi: number;
  /** magnitude slope contribution of each factor, by id */
  mag: Record<string, number>;
  magTotal: number;
  phaseTotal: number;
}

/** the slope table: between consecutive breakpoints, each factor's magnitude slope, the total and the phase slope */
export function segments(fs: Factor[], lo: number, hi: number): Segment[] {
  const b = [lo, ...breakpoints(fs, lo, hi), hi];
  const out: Segment[] = [];
  for (let i = 0; i + 1 < b.length; i++) {
    const mid = Math.sqrt(b[i] * b[i + 1]);
    const mag: Record<string, number> = {};
    for (const f of fs) mag[f.id] = factorMagSlope(f, mid);
    out.push({ lo: b[i], hi: b[i + 1], mag, magTotal: totalMagSlope(fs, mid), phaseTotal: totalPhaseSlope(fs, mid) });
  }
  return out;
}

/* ---------------------------------------------------------------- the lesson's transfer functions */

export type Preset = 'rc' | 'block' | 'ex4' | 'guided';
export type BlockKind = 'K' | 'origin' | 'real' | 'quad';

/** act 1: RC low-pass, H = 1/(1 + jωRC), ω_c = 1/(RC) */
export const rcTF = (R: number, C: number): Factor[] => [{ id: 'f_real', kind: 'real', n: -1, w: 1 / (R * C) }];

/** the corner of the act 3 bricks (first-order factor and pole pair) */
export const BLOCK_W = 10;

/** act 3: one basic factor on its own */
export function blockTF(kind: BlockKind, k: number, sign: 1 | -1, zeta: number): Factor[] {
  switch (kind) {
    case 'K':
      return [{ id: 'f_k', kind: 'K', K: k }];
    case 'origin':
      return [{ id: 'f_origin', kind: 'origin', n: sign }];
    case 'real':
      return [{ id: 'f_real', kind: 'real', n: sign, w: BLOCK_W }];
    case 'quad':
      return [{ id: 'f_quad', kind: 'quad', w: BLOCK_W, zeta }];
  }
}

/** act 4 (Sadiku 14.4): H = 200jω / [(jω + 2)(jω + 10)] = 10jω / [(1 + jω/2)(1 + jω/10)] */
export const EX4: Factor[] = [
  { id: 'f_k', kind: 'K', K: 10 },
  { id: 'f_origin', kind: 'origin', n: 1 },
  { id: 'f_p1', kind: 'real', n: -1, w: 2 },
  { id: 'f_p2', kind: 'real', n: -1, w: 10 },
];

/** act 5 (guided example): H = 2000jω / [(jω + 2)(jω + 100)] = 10jω / [(1 + jω/2)(1 + jω/100)] */
export const GUIDED: Factor[] = [
  { id: 'f_k', kind: 'K', K: 10 },
  { id: 'f_origin', kind: 'origin', n: 1 },
  { id: 'f_p1', kind: 'real', n: -1, w: 2 },
  { id: 'f_p2', kind: 'real', n: -1, w: 100 },
];

/** the raw (non-standard) form: numerator constant and the poles p of (jω + p) — K = N / Π p */
export const RAW = {
  ex4: { N: 200, poles: [2, 10] },
  guided: { N: 2000, poles: [2, 100] },
};
export const kOf = (raw: { N: number; poles: number[] }) => raw.N / raw.poles.reduce((a, b) => a * b, 1);

/** the ω axis of each preset (rad/s): the examples 0.01 … 10⁴ (the sheet's axis); the bricks four decades
 *  around their corner 10; RC: around its ω_c (10 … 10⁵ with the sliders) */
export function rangeOf(p: Preset): [number, number] {
  return p === 'rc' ? [1, 1e6] : p === 'block' ? [0.1, 1000] : [0.01, 1e4];
}

/* ---------------------------------------------------------------- dB ruler (act 2) */

/** voltage (amplitude) ratio → dB */
export const dbOfRatio = (r: number) => 20 * lg(r);
/** power ratio → dB */
export const dbOfPower = (p: number) => 10 * lg(p);

/* ---------------------------------------------------------------- second-order peak (act 3) */

/** the pole pair's resonant peak: ω_r/ω_n and M_r (null when ζ ≥ 1/√2: no peak; ζ = 0.707's 4·10⁻⁷ dB counts as none) */
export function peak(zeta: number): { wr: number; Mr: number; db: number } | null {
  if (zeta >= Math.SQRT1_2) return null;
  const wr = Math.sqrt(1 - 2 * zeta * zeta);
  const Mr = 1 / (2 * zeta * Math.sqrt(1 - zeta * zeta));
  const db = 20 * lg(Mr);
  return db < 0.005 ? null : { wr, Mr, db };
}

/* ---------------------------------------------------------------- formatting */

/** a number with `d` decimals and a real minus sign */
export function fmt(x: number, d = 2): string {
  const s = (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d);
  return s.replace('-', '−');
}
/** the same with a + for positive values */
export const fmtS = (x: number, d = 2) => (x > 0.5 * 10 ** -d ? '+' : '') + fmt(x, d);

/** an angular frequency, 4 significant digits, no exponent below 10⁶ */
export function fmtW(w: number): string {
  if (w >= 1e6) return w.toExponential(2).replace('e+', '×10^');
  const d = w >= 1000 ? 0 : w >= 100 ? 1 : w >= 10 ? 2 : w >= 1 ? 3 : w >= 0.1 ? 3 : 4;
  return Number(w.toFixed(d)).toString();
}

/** R in Ω / kΩ, C in µF */
export const fmtR = (R: number) => (R >= 1000 ? `${Number((R / 1000).toFixed(2))} kΩ` : `${Number(R.toFixed(0))} Ω`);
export const fmtC = (C: number) => `${Number((C * 1e6).toFixed(2))} µF`;
