// W4-L2's numbers: the solenoid inductance (Example 1.1), the piecewise current and its induced
// voltage (Example 2.1), the exponential-voltage integral (Example 2.2), magnetic energy, the
// switch-off kickback with and without a flyback diode (act 3), the inductor network (act 4), the
// DC steady state of Example 5.1 (acts 5–6) and the quiz items. Pure functions; the layers and the
// tests use them.

export const MU0 = 4 * Math.PI * 1e-7;

/* ------------------------------------------------------------- act 1 · the solenoid */

/** L = N² μ0 μr A / ℓ with A = π r² (SI units) */
export function solenoidL(N: number, r: number, len: number, mur: number): number {
  return (N * N * MU0 * mur * Math.PI * r * r) / len;
}

/** Example 1.1: N = 200, r = 5 mm, ℓ = 40 mm; ferrite μr = 200 */
export const EX11 = { N: 200, r: 5e-3, len: 40e-3, murFerrite: 200 } as const;

/* ------------------------------------------------------------- act 2 · v = L di/dt */

/** A trapezoid current: 0 → ipk on [0, t1], flat to t2, back to 0 at t3 (s, A, H) */
export interface Ramp {
  L: number;
  ipk: number;
  t1: number;
  t2: number;
  t3: number;
}

/** Example 2.1: L = 10 mH, 0 → 40 mA in 2 ms, flat to 5 ms, 0 at 6 ms */
export const EX21: Ramp = { L: 10e-3, ipk: 40e-3, t1: 2e-3, t2: 5e-3, t3: 6e-3 };

export function iAt(w: Ramp, t: number): number {
  if (t <= 0) return 0;
  if (t < w.t1) return (w.ipk * t) / w.t1;
  if (t < w.t2) return w.ipk;
  if (t < w.t3) return w.ipk * (1 - (t - w.t2) / (w.t3 - w.t2));
  return 0;
}

/** di/dt on each open interval (A/s) */
export function slopeAt(w: Ramp, t: number): number {
  if (t <= 0 || t >= w.t3) return 0;
  if (t < w.t1) return w.ipk / w.t1;
  if (t < w.t2) return 0;
  return -w.ipk / (w.t3 - w.t2);
}

export const vAt = (w: Ramp, t: number) => w.L * slopeAt(w, t);

/** the three segment voltages v1, v2, v3 */
export function segmentVolts(w: Ramp): [number, number, number] {
  return [(w.L * w.ipk) / w.t1, 0, (-w.L * w.ipk) / (w.t3 - w.t2)];
}

/** ∫ v dt over the whole pulse (V·s): zero, since the current starts and ends at 0 */
export function voltArea(w: Ramp): number {
  const [v1, , v3] = segmentVolts(w);
  return v1 * w.t1 + v3 * (w.t3 - w.t2);
}

export const energy = (L: number, i: number) => 0.5 * L * i * i;

/** Example 2.2: L = 20 mH, i(0) = 100 mA, v = 6 e^(−500 t) V */
export const EX22 = { L: 0.02, i0: 0.1, V0: 6, alpha: 500 } as const;
export const ex22I = (t: number) => EX22.i0 + (EX22.V0 / (EX22.alpha * EX22.L)) * (1 - Math.exp(-EX22.alpha * t));

/* ------------------------------------------------------------- act 3 · kickback and flyback */

/** Act 3: a 10 mH relay coil carrying 200 mA from a 12 V supply; the contacts open in 1 µs. */
export const KICK = { L: 10e-3, I0: 0.2, dt: 1e-6, Vs: 12, Vd: 0.7 } as const;
/** the coil's own resistance: 12 V / 200 mA */
export const R_COIL = KICK.Vs / KICK.I0;

/** v_L = L Δi/Δt when the current is forced to 0 in Δt */
export const kickVolts = (L: number, I0: number, dt: number) => (L * (0 - I0)) / dt;

/** With the flyback diode: L di/dt = −(V_D + R i), so i(t) = (I0 + V_D/R) e^(−t/τ) − V_D/R until it reaches 0. */
export function flybackI(t: number, L = KICK.L, I0 = KICK.I0, R = R_COIL, Vd = KICK.Vd): number {
  if (t <= 0) return I0;
  const tau = L / R;
  const i = (I0 + Vd / R) * Math.exp(-t / tau) - Vd / R;
  return Math.max(0, i);
}

/** time for the flyback current to die out */
export function flybackTime(L = KICK.L, I0 = KICK.I0, R = R_COIL, Vd = KICK.Vd): number {
  return (L / R) * Math.log((I0 + Vd / R) / (Vd / R));
}

/* ------------------------------------------------------------- act 4 · series / parallel */

export const par = (a: number, b: number) => (a * b) / (a + b);

/** Act 4: L1 + L2 ∥ (L3 + L4) */
export const NET4 = { L1: 4, L2: 6, L3: 8, L4: 4 } as const;
export function net4(n: { L1: number; L2: number; L3: number; L4: number } = NET4) {
  const L34 = n.L3 + n.L4;
  const L234 = par(n.L2, L34);
  return { L34, L234, Leq: n.L1 + L234 };
}

/* ------------------------------------------------------------- acts 5–6 · DC steady state */

export interface Rlc {
  vs: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  L: number;
  C: number;
}

/** Example 5.1 */
export const EX51: Rlc = { vs: 9, r1: 100, r2: 300, r3: 150, r4: 200, L: 20e-3, C: 10e-6 };

/** quarter-watt resistors; the sheet's target inductor current is ≤ 50 mA */
export const P_RATED = 0.25;
export const IL_TARGET = 0.05;

export interface DcSol {
  r23: number;
  vA: number;
  vC: number;
  is: number;
  iL: number;
  iR2: number;
  iR4: number;
  wL: number;
  wC: number;
  wTotal: number;
  pR1: number;
  pR2: number;
  pR3: number;
  pR4: number;
}

/** L → short, C → open: R4 carries nothing, node A sees R1 in series with R2 ∥ R3. */
export function dcSolve(c: Rlc): DcSol {
  const r23 = par(c.r2, c.r3);
  const is = c.vs / (c.r1 + r23);
  const vA = is * r23;
  const iL = vA / c.r3;
  const iR2 = vA / c.r2;
  const vC = vA;
  const wL = energy(c.L, iL);
  const wC = 0.5 * c.C * vC * vC;
  return { r23, vA, vC, is, iL, iR2, iR4: 0, wL, wC, wTotal: wL + wC, pR1: is * is * c.r1, pR2: iR2 * iR2 * c.r2, pR3: iL * iL * c.r3, pR4: 0 };
}

/* ------------------------------------------------------------- quiz */

export const Q1 = { L0: 100e-6, nFactor: 2 } as const;
export const Q2 = { L: 50e-3, i1: 0.2, dt: 5e-3 } as const;
export const Q4 = { L1: 6, L2: 12, L3: 2 } as const;

/* ------------------------------------------------------------- colour bands */

const DIGIT = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'];

/** 4-band code of a value (Ω for resistors, µH for colour-ring inductors): two digits, multiplier, tolerance */
export function bandKeys(v: number, tol = 'gold'): string[] {
  let e = Math.floor(Math.log10(v)) - 1;
  let d = Math.round(v / 10 ** e);
  if (d >= 100) {
    d = Math.round(d / 10);
    e += 1;
  }
  const mult = e >= 0 ? DIGIT[e] : e === -1 ? 'gold' : 'silver';
  return [DIGIT[Math.floor(d / 10)], DIGIT[d % 10], mult, tol];
}

/* ------------------------------------------------------------- formatting */

const MINUS = '−';
/** fixed digits with a real minus sign */
export function num(v: number, d = 2): string {
  const s = Math.abs(v).toFixed(d);
  return v < 0 && Number(s) !== 0 ? MINUS + s : s;
}

export function fmtL(h: number): string {
  if (h >= 0.1) return `${num(h, 3)} H`;
  if (h >= 1e-3) return `${num(h * 1e3, 2)} mH`;
  return `${num(h * 1e6, 2)} µH`;
}

export const fmtMa = (a: number, d = 1) => `${num(a * 1e3, d)} mA`;
export const fmtUj = (j: number, d = 2) => `${num(j * 1e6, d)} µJ`;
export const fmtW = (w: number) => `${num(w, 4)} W`;
