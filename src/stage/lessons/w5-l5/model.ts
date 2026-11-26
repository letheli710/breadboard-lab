// W5-L5 maths: instantaneous and average power of a sinusoidal port (layer 01), the RMS value of the
// four waveforms of layer 02, and the AC maximum-power-transfer of layer 03 (Thévenin source with a
// complex load). All phasors here are PEAK (amplitude) phasors, as in the lesson sheet; the RMS
// form is |V| / √2. Pure functions, no React: model.test.ts checks every number of the sheet.

export const DEG = Math.PI / 180;

/* ------------------------------------------------------------------ complex numbers */

export interface Cx {
  re: number;
  im: number;
}
export const cx = (re: number, im = 0): Cx => ({ re, im });
export const polar = (mag: number, deg: number): Cx => ({ re: mag * Math.cos(deg * DEG), im: mag * Math.sin(deg * DEG) });
export const add = (a: Cx, b: Cx): Cx => ({ re: a.re + b.re, im: a.im + b.im });
export const sub = (a: Cx, b: Cx): Cx => ({ re: a.re - b.re, im: a.im - b.im });
export const mul = (a: Cx, b: Cx): Cx => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
export const conj = (a: Cx): Cx => ({ re: a.re, im: -a.im });
export const abs = (a: Cx): number => Math.hypot(a.re, a.im);
export const argDeg = (a: Cx): number => Math.atan2(a.im, a.re) / DEG;
export function div(a: Cx, b: Cx): Cx {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}
/** a ∥ b */
export const par = (a: Cx, b: Cx): Cx => div(mul(a, b), add(a, b));

/* ------------------------------------------------------------------ number formatting */

/** fixed digits, trailing zeros and "-0" dropped, minus sign typographic */
export function fmt(x: number, digits = 2): string {
  const f = x.toFixed(digits);
  const s = f.includes('.') ? f.replace(/\.?0+$/, '') : f;
  return (s === '-0' ? '0' : s).replace('-', '−');
}
/** "3.2 − j2.4" */
export function fmtCx(z: Cx, digits = 2): string {
  const im = Math.abs(z.im) < 1e-9 ? 0 : z.im;
  if (im === 0) return fmt(z.re, digits);
  return `${fmt(z.re, digits)} ${im < 0 ? '−' : '+'} j${fmt(Math.abs(im), digits)}`;
}
/** "17.89∠−63.43°" */
export const fmtPolar = (z: Cx, digits = 2): string => `${fmt(abs(z), digits)}∠${fmt(Math.abs(abs(z)) < 1e-12 ? 0 : argDeg(z), digits)}°`;

/* ------------------------------------------------------------------ layer 01: p(t) = v(t) i(t) */

/** the stage keeps θ_i at −15° (act 1's current) and sets θ_v = θ_i + Δθ */
export const THETA_I = -15;
/** ω of the stage: 377 rad/s (60 Hz) */
export const OMEGA = 377;

export interface Power {
  /** ½ V_m I_m (VA): the amplitude of the 2ω term */
  half: number;
  /** average power P = ½ V_m I_m cos(θ_v − θ_i) */
  P: number;
  pmax: number;
  pmin: number;
  /** fraction of a period with p(t) < 0: |θ_v − θ_i| / 180° */
  back: number;
  /** p at a source phase ωt (degrees) */
  p: (wtDeg: number) => number;
  v: (wtDeg: number) => number;
  i: (wtDeg: number) => number;
}

export function power(Vm: number, Im: number, thv: number, thi: number): Power {
  const half = 0.5 * Vm * Im;
  const c = Math.cos((thv - thi) * DEG);
  const P = half * c;
  return {
    half,
    P,
    pmax: half * (c + 1),
    pmin: half * (c - 1),
    back: Math.min(1, Math.abs(thv - thi) / 180),
    v: (w) => Vm * Math.cos((w + thv) * DEG),
    i: (w) => Im * Math.cos((w + thi) * DEG),
    p: (w) => P + half * Math.cos((2 * w + thv + thi) * DEG),
  };
}

/** the time average of a function over one period (Simpson, n even) */
export function mean(f: (x: number) => number, period: number, n = 2000): number {
  const h = period / n;
  let s = f(0) + f(period);
  for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(k * h);
  return (s * h) / 3 / period;
}

/* ------------------------------------------------------------------ layer 02: RMS */

export type Wave = 'sine' | 'square' | 'triangle' | 'dcac';

/** v at phase φ (radians, one period = 2π): sine V_p cos φ, square ±V_p, triangle peaking at φ = 0,
 *  DC + AC: V_dc + √2 V_1,rms cos φ (vp is V_dc there) */
export function waveAt(w: Wave, vp: number, v1rms: number, phi: number): number {
  const t = (((phi / (2 * Math.PI)) % 1) + 1) % 1; // 0 … 1
  switch (w) {
    case 'sine':
      return vp * Math.cos(phi);
    case 'square':
      return t < 0.25 || t >= 0.75 ? vp : -vp;
    case 'triangle': {
      const u = t < 0.5 ? t : 1 - t; // 0 … 0.5
      return vp * (1 - 4 * u);
    }
    case 'dcac':
      return vp + Math.SQRT2 * v1rms * Math.cos(phi);
  }
}

/** closed-form RMS: V_p/√2, V_p, V_p/√3, √(V_dc² + V_1,rms²) */
export function rmsOf(w: Wave, vp: number, v1rms: number): number {
  switch (w) {
    case 'sine':
      return vp / Math.SQRT2;
    case 'square':
      return vp;
    case 'triangle':
      return vp / Math.sqrt(3);
    case 'dcac':
      return Math.hypot(vp, v1rms);
  }
}

/** RMS by the definition √((1/T)∫v² dt) */
export const rmsNumeric = (f: (phi: number) => number): number => Math.sqrt(mean((x) => f(x) ** 2, 2 * Math.PI, 4000));

/* ------------------------------------------------------------------ layer 03: max power transfer */

export interface Source {
  /** Thévenin voltage, PEAK phasor */
  vth: Cx;
  zth: Cx;
}

/** average power in R_L of Z_L = R_L + jX_L fed by a peak-phasor Thévenin source:
 *  P = |V_Th|² R_L / (2[(R_Th + R_L)² + (X_Th + X_L)²]) */
export function loadPower(s: Source, rl: number, xl: number): number {
  const d = (s.zth.re + rl) ** 2 + (s.zth.im + xl) ** 2;
  return (abs(s.vth) ** 2 * rl) / (2 * d);
}

export interface Match {
  /** Z_L = Z_Th* */
  zl: Cx;
  /** V_Th,rms = |V_Th| / √2 */
  vrms: number;
  /** |V_Th|² / (8 R_Th) */
  pmax8: number;
  /** V_Th,rms² / (4 R_Th) */
  pmax4: number;
}

export function match(s: Source): Match {
  const v = abs(s.vth);
  const vrms = v / Math.SQRT2;
  return { zl: conj(s.zth), vrms, pmax8: (v * v) / (8 * s.zth.re), pmax4: (vrms * vrms) / (4 * s.zth.re) };
}

/** Thévenin equivalent of V_s – series Z1 – shunt Z2 – series Z3 – port: Z_Th = Z1 ∥ Z2 + Z3, V_Th = V_s Z2 / (Z1 + Z2) */
export function thevenin(vs: Cx, z1: Cx, z2: Cx, z3: Cx = cx(0)): Source {
  return { zth: add(par(z1, z2), z3), vth: div(mul(vs, z2), add(z1, z2)) };
}

export type SrcKey = 'a5' | 'a6' | 'gd';

/** act 5: V_Th = 16∠0° V, Z_Th = 4 + j3 Ω; act 6: V_s = 20∠0° V, Z1 = 4 + j2 Ω, Z2 = −j4 Ω;
 *  the guided example: V_s = 20∠0° V, 10 Ω, −j10 Ω shunt, +j8 Ω to the port */
export const SOURCES: Record<SrcKey, Source> = {
  a5: { vth: cx(16), zth: cx(4, 3) },
  a6: thevenin(cx(20), cx(4, 2), cx(0, -4)),
  gd: thevenin(cx(20), cx(10), cx(0, -10), cx(0, 8)),
};

/** the R_L slider (sheet: 0.5 … 20 Ω; step 0.1 so that act 6's 3.2 Ω is on the track) and the X_L slider */
export const RL_RANGE = { min: 0.5, max: 20, step: 0.1 };
export const XL_RANGE = { min: -10, max: 10, step: 0.2 };

/** snap to a slider step without float residue */
export const snap = (x: number, step: number, min: number) => Number((min + Math.round((x - min) / step) * step).toFixed(6));
