// W5-L2 numbers: complex arithmetic, the element impedances (Sadiku 9.4–9.5), the two mixed
// networks (act 3's worked example and act 6's guided example, Sadiku 9.6), and the breadboard RC
// phase-shift lab (acts 4–5: 1.6 kΩ or 1.5 kΩ with 100 nF, 5 V peak sine from a 50 Ω generator).
// Angles of phasors are in degrees, ω in rad/s, f in Hz.

/* ------------------------------------------------------------- complex numbers */

export interface Cx {
  re: number;
  im: number;
}

export const cx = (re: number, im = 0): Cx => ({ re, im });
export const add = (...zs: Cx[]): Cx => zs.reduce((a, b) => cx(a.re + b.re, a.im + b.im), cx(0));
export const sub = (a: Cx, b: Cx): Cx => cx(a.re - b.re, a.im - b.im);
export const mul = (a: Cx, b: Cx): Cx => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const div = (a: Cx, b: Cx): Cx => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
export const inv = (z: Cx): Cx => div(cx(1), z);
export const abs = (z: Cx): number => Math.hypot(z.re, z.im);
/** angle in degrees, (−180°, 180°] */
export const arg = (z: Cx): number => (Math.atan2(z.im, z.re) * 180) / Math.PI;
export const polar = (mag: number, deg: number): Cx => cx(mag * Math.cos((deg * Math.PI) / 180), mag * Math.sin((deg * Math.PI) / 180));
/** Z1 ∥ Z2 = Z1 Z2 / (Z1 + Z2) */
export const par = (a: Cx, b: Cx): Cx => div(mul(a, b), add(a, b));

/* ------------------------------------------------------------- element impedances */

export const zR = (r: number): Cx => cx(r);
export const zL = (w: number, l: number): Cx => cx(0, w * l);
export const zC = (w: number, c: number): Cx => cx(0, -1 / (w * c));

/** 01 layer: which circuit it shows */
export type Elem = 'R' | 'L' | 'C' | 'RLC' | 'mix' | 'ex';

/** single elements (act 1's example 1.1: v(t) = 12 cos(4000t + 30°) V on 5 mH or 10 µF) */
export const EL = { r: 30, l: 5e-3, c: 10e-6, vs: polar(12, 30), w: 4000 } as const;
/** act 2's example 2.1: series RLC at ω = 1000 rad/s */
export const RLC = { r: 30, l: 80e-3, c: 25e-6, w: 1000 } as const;
/** act 3's example 3.1: R1 + C1 in series with (R2 + L) ∥ C2, v_s = 30 cos(50t + 10°) V */
export const MIX = { r1: 2, c1: 5e-3, r2: 8, l: 120e-3, c2: 2e-3, vs: polar(30, 10), w: 50 } as const;
/** act 6's guided example: R1 + L1 in series with R2 ∥ C, v_s = 30 cos(200t + 20°) V */
export const EX = { r1: 3, l1: 55e-3, r2: 10, c: 500e-6, vs: polar(30, 20), w: 200 } as const;

/** slider range of ω on the 01 layer (rad/s) */
export const W_RANGE: [number, number] = [10, 1e5];

export interface Single {
  z: Cx;
  /** reactance X = Im Z (Ω) */
  x: number;
  i: Cx;
  v: Cx;
}

/** one element (or the series RLC of example 2.1) driven by v = 12∠30° V */
export function single(kind: 'R' | 'L' | 'C' | 'RLC', w: number): Single {
  const z = kind === 'R' ? zR(EL.r) : kind === 'L' ? zL(w, EL.l) : kind === 'C' ? zC(w, EL.c) : add(zR(RLC.r), zL(w, RLC.l), zC(w, RLC.c));
  return { z, x: z.im, v: EL.vs, i: div(EL.vs, z) };
}

export interface MixNet {
  z1: Cx;
  za: Cx;
  zb: Cx;
  zp: Cx;
  zeq: Cx;
  i: Cx;
  ia: Cx;
  ib: Cx;
}

/** example 3.1 at ω */
export function mixNet(w: number): MixNet {
  const z1 = add(zR(MIX.r1), zC(w, MIX.c1));
  const za = add(zR(MIX.r2), zL(w, MIX.l));
  const zb = zC(w, MIX.c2);
  const zp = par(za, zb);
  const zeq = add(z1, zp);
  const i = div(MIX.vs, zeq);
  const sum = add(za, zb);
  return { z1, za, zb, zp, zeq, i, ia: mul(div(zb, sum), i), ib: mul(div(za, sum), i) };
}

export interface ExNet {
  zl1: Cx;
  zc: Cx;
  z1: Cx;
  zp: Cx;
  zeq: Cx;
  i: Cx;
}

/** the guided example at ω */
export function exNet(w: number): ExNet {
  const zl1 = zL(w, EX.l1);
  const zc = zC(w, EX.c);
  const z1 = add(zR(EX.r1), zl1);
  const zp = par(zR(EX.r2), zc);
  const zeq = add(z1, zp);
  return { zl1, zc, z1, zp, zeq, i: div(EX.vs, zeq) };
}

/* ------------------------------------------------------------- the RC phase-shift lab */

export const C_LAB = 100e-9;
export const R_LAB = 1600;
export const R_ALT = 1500;
export const V_PK = 5;
export const R_GEN = 50;
/** generator range on the 02 / 03 layers (Hz) */
export const F_RANGE: [number, number] = [100, 10000];
/** 1/4 W */
export const P_RATED = 0.25;

export interface Rc {
  f: number;
  w: number;
  T: number;
  xc: number;
  /** R / X_C = ωRC */
  ratio: number;
  /** |H_C| = |V_C / V_in| */
  gain: number;
  /** Δφ_C (deg, < 0) */
  phiC: number;
  /** Δφ_R = 90° − arctan ωRC (deg, > 0) */
  phiR: number;
  gainR: number;
  /** Δt = |Δφ_C| / 360° · T (s) */
  dt: number;
  zMag: number;
  /** ideal source of 5 V peak straight across R + C */
  iPk: number;
  iRms: number;
  /** average power in R (W) */
  pR: number;
}

/** the ideal RC divider (act 4's ③, the 02 scope): V_in = 5 V peak across R and C */
export function rc(f: number, r: number): Rc {
  const w = 2 * Math.PI * f;
  const xc = 1 / (w * C_LAB);
  const ratio = r / xc;
  const gain = 1 / Math.sqrt(1 + ratio * ratio);
  const phiC = (-Math.atan(ratio) * 180) / Math.PI;
  const zMag = Math.hypot(r, xc);
  const iPk = V_PK / zMag;
  const iRms = iPk / Math.SQRT2;
  return { f, w, T: 1 / f, xc, ratio, gain, phiC, phiR: 90 + phiC, gainR: ratio * gain, dt: -phiC / 360 / f, zMag, iPk, iRms, pR: iRms * iRms * r };
}

/** what CH2 looks at: v_C (R on top), v_R after swapping R and C, or MATH = CH1 − CH2 */
export type Ch2Mode = 'vc' | 'swap' | 'math';
/** where the CH2 ground clip sits: the GND rail, or (wrongly) the R–C node OUT */
export type ClipAt = 'gnd' | 'out';

export interface Bench {
  /** phasors at the nodes, relative to the generator EMF 5∠0° V (peak) */
  ch1: Cx;
  ch2: Cx;
  /** MATH = CH1 − CH2 (only shown in 'math' mode) */
  math: Cx;
  /** CH2 shorted to 0 by its ground clip */
  fault: boolean;
  /** loop current (peak phasor) */
  i: Cx;
  /** average power in R (W) */
  pR: number;
  r: number;
  xc: number;
}

/**
 * The breadboard: the generator (EMF 5 V peak, 50 Ω) drives IN; R and C in series to GND (or C then
 * R after the swap). The CH2 ground clip on OUT ties OUT to the mains earth, i.e. to GND: the lower
 * part (C, or R after the swap) is shorted and CH2 reads 0.
 */
export function bench(f: number, r: number, mode: Ch2Mode, clip: ClipAt): Bench {
  const w = 2 * Math.PI * f;
  const zc = zC(w, C_LAB);
  const zr = zR(r);
  const top = mode === 'swap' ? zc : zr;
  const bottom = mode === 'swap' ? zr : zc;
  const fault = clip === 'out';
  const load = fault ? top : add(top, bottom);
  const i = div(cx(V_PK), add(load, cx(R_GEN)));
  const ch1 = mul(i, load);
  const ch2 = fault ? cx(0) : mul(i, bottom);
  const iRms = abs(i) / Math.SQRT2;
  return { ch1, ch2, math: sub(ch1, ch2), fault, i, pR: iRms * iRms * r, r, xc: 1 / (w * C_LAB) };
}

/** phase of b relative to a (deg, folded into (−180°, 180°]) */
export function phaseOf(b: Cx, a: Cx): number {
  let d = arg(b) - arg(a);
  while (d > 180) d -= 360;
  while (d <= -180) d += 360;
  return d;
}

/** the 1–2.5–5 time base closest to a quarter period (two periods on 8 divisions) */
export function timeDiv(f: number): number {
  const q = 1 / f / 4;
  let best = 1;
  let err = Infinity;
  for (let k = -7; k <= 0; k++)
    for (const m of [1, 2.5, 5]) {
      const s = m * 10 ** k;
      const e = Math.abs(Math.log(s / q));
      if (e < err) {
        err = e;
        best = s;
      }
    }
  return best;
}

/* ------------------------------------------------------------- formatting */

/** a number with d decimals and a real minus sign */
export function num(x: number, d = 2): string {
  const s = (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d);
  return s.replace('-', '−');
}

/** significant-figure formatting for readouts (3 s.f., no exponent) */
export function sig(x: number, n = 3): string {
  if (x === 0 || !isFinite(x)) return isFinite(x) ? '0' : '∞';
  const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(x))));
  return num(x, Math.min(d, 6));
}

/** "5 − j5" (rectangular, Ω omitted) */
export function rect(z: Cx, d = 2): string {
  const re = Math.abs(z.re) < 0.5 * 10 ** -d ? 0 : z.re;
  const im = Math.abs(z.im) < 0.5 * 10 ** -d ? 0 : z.im;
  const r = trim(num(re, d));
  const m = trim(num(Math.abs(im), d));
  if (im === 0) return r;
  if (re === 0) return `${im < 0 ? '−' : ''}j${m}`;
  return `${r} ${im < 0 ? '−' : '+'} j${m}`;
}

/** "10∠36.87°" */
export function pol(z: Cx, dm = 2, da = 2): string {
  return `${trim(num(abs(z), dm))}∠${num(arg(z), da)}°`;
}

const trim = (s: string) => (s.includes('.') ? s.replace(/\.?0+$/, '') : s);

/** ohms with k for ≥ 1000: 1591.55 → "1.59 kΩ", 20 → "20.0 Ω" */
export function ohm(x: number): string {
  const a = Math.abs(x);
  if (a >= 1e3) return `${sig(x / 1e3)} kΩ`;
  return `${sig(x)} Ω`;
}

export function hz(f: number): string {
  return f >= 1000 ? `${sig(f / 1000)} kHz` : `${sig(f)} Hz`;
}

/** seconds as µs / ms */
export function sec(t: number): string {
  const a = Math.abs(t);
  if (a >= 1e-3) return `${sig(t * 1e3)} ms`;
  return `${num(t * 1e6, a >= 1e-4 ? 1 : 2)} µs`;
}

export function deg(x: number, d = 2): string {
  return `${x > 0 ? '+' : ''}${num(x, d)}°`;
}

export function rad(w: number): string {
  return w >= 1e4 ? `${sig(w / 1e3)}k rad/s` : `${sig(w, 3)} rad/s`;
}

/* ------------------------------------------------------------- the guided example on the stage */

/**
 * What the 01 layer prints for the guided example after `reveal` steps (0 = nothing yet, 1 = Z_L1, Z_C
 * and Z_1, 2 = Z_p, 3 = Z_eq, 4 = I, 9 = all and i(t)). Hidden values read "?".
 */
export function exReadout(reveal: number, w: number) {
  const n = exNet(w);
  const h = (k: number, s: string) => (reveal >= k ? s : '?');
  return {
    zl1: h(1, `${rect(n.zl1)} Ω`),
    zc: h(1, `${rect(n.zc)} Ω`),
    z1: h(1, `${rect(n.z1)} Ω`),
    zp: h(2, `${rect(n.zp)} Ω`),
    zeq: h(3, `${rect(n.zeq)} = ${pol(n.zeq)} Ω`),
    i: h(4, `${num(abs(n.i), 2)}∠${num(arg(n.i), 2)}° A`),
    it: h(5, `${num(abs(n.i), 2)} cos(${trim(num(w, 0))}t ${arg(n.i) < 0 ? '−' : '+'} ${num(Math.abs(arg(n.i)), 2)}°) A`),
  };
}
