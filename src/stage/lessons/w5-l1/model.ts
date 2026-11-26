// W5-L1 maths: complex numbers in rectangular and polar form (angles in degrees, principal value in
// (−180°, +180°]), the quadrant correction of arctan(y/x), the ±sin / ±cos → +cos normalisation of the
// phase-comparison rule, lead / lag, the time-domain parameters of a sinusoid, and the phasor
// solution of a ∫ / d/dt equation  a·x + b∫x dt + c·dx/dt = V_m cos(ωt + φ_s).
// Pure functions, no React: the layers draw from them and model.test.ts checks the sheet's numbers.

export const DEG = Math.PI / 180;

export interface Cx {
  re: number;
  im: number;
}

export const cx = (re: number, im: number): Cx => ({ re, im });
/** r∠φ (φ in degrees) → x + jy */
export const polar = (r: number, deg: number): Cx => ({ re: r * Math.cos(deg * DEG), im: r * Math.sin(deg * DEG) });
export const abs = (z: Cx) => Math.hypot(z.re, z.im);
/** principal angle in degrees, (−180°, +180°] (atan2 does the quadrant correction) */
export const argDeg = (z: Cx) => wrapDeg(Math.atan2(z.im, z.re) / DEG);
export const add = (...zs: Cx[]): Cx => zs.reduce((s, z) => ({ re: s.re + z.re, im: s.im + z.im }), { re: 0, im: 0 });
export const sub = (a: Cx, b: Cx): Cx => ({ re: a.re - b.re, im: a.im - b.im });
export const scale = (z: Cx, k: number): Cx => ({ re: z.re * k, im: z.im * k });
export const mul = (a: Cx, b: Cx): Cx => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
export function div(a: Cx, b: Cx): Cx {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}

/** an angle in degrees brought into (−180°, +180°] */
export function wrapDeg(a: number): number {
  let x = a % 360;
  if (x > 180) x -= 360;
  if (x <= -180) x += 360;
  return Math.abs(x) < 1e-12 ? 0 : x;
}

export type Quadrant = 1 | 2 | 3 | 4 | 0;

/** what a calculator's arctan(y/x) gives, the ±180° the quadrant asks for, and the true angle */
export function quadrantFix(z: Cx): { q: Quadrant; raw: number; fix: 0 | 180 | -180; phi: number } {
  const { re: x, im: y } = z;
  const q: Quadrant = x > 0 && y >= 0 ? 1 : x < 0 && y >= 0 ? 2 : x < 0 && y < 0 ? 3 : x > 0 && y < 0 ? 4 : 0;
  if (x === 0) return { q, raw: y > 0 ? 90 : y < 0 ? -90 : 0, fix: 0, phi: y > 0 ? 90 : y < 0 ? -90 : 0 };
  const raw = Math.atan(y / x) / DEG;
  const fix = x > 0 ? 0 : y >= 0 ? 180 : -180;
  return { q, raw, fix, phi: raw + fix };
}

/* ------------------------------------------------------------------ sinusoids */

export interface Sinusoid {
  /** amplitude V_m */
  Vm: number;
  /** angular frequency ω (rad/s) */
  omega: number;
  /** phase φ (degrees) */
  phi: number;
}

export const periodOf = (omega: number) => (2 * Math.PI) / omega;
export const freqOf = (omega: number) => omega / (2 * Math.PI);
/** v(t) = V_m cos(ωt + φ): ωt in radians, φ in degrees, converted before adding */
export const valueAt = (s: Sinusoid, t: number) => s.Vm * Math.cos(s.omega * t + s.phi * DEG);

/* ---------------------------------------------------------- phase comparison */

export type Func = '+cos' | '-cos' | '+sin' | '-sin';
export const FUNCS: Func[] = ['+cos', '-cos', '+sin', '-sin'];
/** where each function's reference axis sits on the trig compass: f(θ) = cos(θ + shift) */
export const FUNC_SHIFT: Record<Func, number> = { '+cos': 0, '-cos': 180, '+sin': -90, '-sin': 90 };
export const FUNC_TEXT: Record<Func, string> = { '+cos': 'cos', '-cos': '−cos', '+sin': 'sin', '-sin': '−sin' };

/** A·f(ωt + θ) (A > 0) as a positive-amplitude cosine A·cos(ωt + φ), φ in (−180°, +180°] */
export function toCos(func: Func, A: number, theta: number): { A: number; phi: number } {
  return { A, phi: wrapDeg(theta + FUNC_SHIFT[func]) };
}

export type Relation = 'lead' | 'lag' | 'in' | 'anti';

/** Δφ = φ₂ − φ₁ (wrapped): > 0 means wave 2 leads wave 1 */
export function compare(phi1: number, phi2: number): { d: number; rel: Relation } {
  const d = wrapDeg(phi2 - phi1);
  const rel: Relation = Math.abs(d) < 1e-9 ? 'in' : Math.abs(d - 180) < 1e-9 ? 'anti' : d > 0 ? 'lead' : 'lag';
  return { d, rel };
}

/* ----------------------------------------------- the phasor ∫ / d/dt equation */

export interface PhasorEq {
  /** coefficient of x(t) */
  a: number;
  /** coefficient of ∫x dt */
  b: number;
  /** coefficient of dx/dt */
  c: number;
  omega: number;
  /** the source V_m cos(ωt + φ_s) */
  Vm: number;
  phis: number;
}

/** the three terms of the left side for a trial phasor X: a·X, b·X/(jω), c·jωX */
export function terms(e: PhasorEq, X: Cx): [Cx, Cx, Cx] {
  return [scale(X, e.a), mul(X, cx(0, -e.b / e.omega)), mul(X, cx(0, e.c * e.omega))];
}

/** D = a + b/(jω) + jωc = a + j(ωc − b/ω), and the response phasor X = V_s / D */
export function solveEq(e: PhasorEq): { D: Cx; Vs: Cx; X: Cx } {
  const D = cx(e.a, e.omega * e.c - e.b / e.omega);
  const Vs = polar(e.Vm, e.phis);
  return { D, Vs, X: div(Vs, D) };
}

/* ------------------------------------------------------------ the examples */

/** act 1, example 1.1: v(t) = 12 cos(50t + 10°) V */
export const EX11: Sinusoid = { Vm: 12, omega: 50, phi: 10 };
/** act 2, example 2.1 (Sadiku 9.2): v₁ = −10 cos(ωt + 50°), v₂ = 12 sin(ωt − 10°) */
export const EX21 = { f1: '-cos' as Func, A1: 10, p1: 50, f2: '+sin' as Func, A2: 12, p2: -10 };
/** act 3, example 3.1: Z₁ = −3 + j4, Z₂ = −6 − j8 */
export const EX31 = { z1: cx(-3, 4), z2: cx(-6, -8) };
/** act 4, example 4.1 (Sadiku 9.6): i = 4 cos(ωt + 30°) + 5 sin(ωt − 20°) A */
export const EX41 = { f1: '+cos' as Func, A1: 4, p1: 30, f2: '+sin' as Func, A2: 5, p2: -20 };
/** act 5, example 5.1 (Sadiku 9.7): 4i + 8∫i dt − 3 di/dt = 50 cos(2t + 75°) */
export const EX51: PhasorEq = { a: 4, b: 8, c: -3, omega: 2, Vm: 50, phis: 75 };
/** the guided example: 2 dv/dt + 6v = 20 sin(4t + 30°) V, the source as a cosine: 20∠−60° */
export const GUIDED: PhasorEq = { a: 6, b: 0, c: 2, omega: 4, Vm: 20, phis: toCos('+sin', 20, 30).phi };

/* ------------------------------------------------------------ formatting */

const MINUS = '−';

/** a number with up to `d` decimals, trailing zeros dropped, true minus sign; `plus` adds "+" */
export function fmt(x: number, d = 3, plus = false): string {
  const r = Number(x.toFixed(d));
  const v = Object.is(r, -0) || Math.abs(r) < 10 ** -(d + 1) ? 0 : r;
  const s = Math.abs(v)
    .toFixed(d)
    .replace(/\.?0+$/, '');
  return v < 0 ? MINUS + s : plus && v > 0 ? `+${s}` : s;
}
/** significant digits for magnitudes: 4 significant, at most 3 decimals */
export function fmtMag(x: number): string {
  const a = Math.abs(x);
  const d = a >= 100 ? 1 : a >= 10 ? 2 : 3;
  return fmt(x, d);
}
export const fmtAng = (deg: number, plus = false) => `${fmt(deg, 2, plus)}°`;
export const fmtPolar = (z: Cx) => `${fmtMag(abs(z))}∠${fmtAng(argDeg(z))}`;
export function fmtRect(z: Cx): string {
  const im = fmt(Math.abs(z.im), 3);
  return `${fmt(z.re, 3)} ${z.im < 0 && im !== '0' ? MINUS : '+'} j${im}`;
}
/** seconds as s / ms */
export function fmtTime(t: number): string {
  return t >= 1 ? `${fmt(t, 3)} s` : `${fmt(t * 1e3, 2)} ms`;
}
