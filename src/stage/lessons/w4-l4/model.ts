// W4-L4's numbers: the source-free RC / RL natural response, the switched 24 V network of act 5
// (the guided example), the breadboard lab circuit of act 6 and the self-test. Pure functions; the
// layers and model.test.ts use them.

/** the breadboard lab (sheet: breadboard_lab_scaled_params): 5 V, 10 kΩ, 100 µF → τ = 1 s */
export const LAB = { v0: 5, r: 10_000, c: 100e-6 } as const;
export const SUPPLY_NAME = '台式可调直流电源（5 V）';
/** a 1/4 W carbon-film resistor */
export const P_RATED = 0.25;

/** act 4's relay coil: I0 = 2 A, L = 0.5 H, R = 10 Ω → τ = 50 ms */
export const RL_EX = { i0: 2, l: 0.5, r: 10 } as const;

/** act 5 / the guided example: the switched four-resistor RC network (fig. 5-1) */
export const NET = { vs: 24, r1: 6, r2: 12, r3: 6, r4: 6, c: 0.2 } as const;
export type Net = { vs: number; r1: number; r2: number; r3: number; r4: number; c: number };

export const par = (a: number, b: number) => (a * b) / (a + b);

/** x0·e^(−t/τ) */
export const decay = (x0: number, tau: number, t: number) => x0 * Math.exp(-t / tau);

/** the t = 0 tangent of x0·e^(−t/τ): x0(1 − t/τ) (crosses zero at t = τ) */
export const tangent = (x0: number, tau: number, t: number) => x0 * (1 - t / tau);

/** stored and dissipated energy of a source-free RC (or RL) after t: w(0)·e^(−2t/τ) and the rest */
export function energy(w0: number, tau: number, t: number) {
  const left = w0 * Math.exp((-2 * t) / tau);
  return { w0, stored: left, heat: w0 - left };
}

/** the RC discharge of act 2: v(t), i_R(t), p_R(t), w_C(0) */
export function rc(v0: number, r: number, c: number) {
  const tau = r * c;
  return {
    tau,
    i0: v0 / r,
    p0: (v0 * v0) / r,
    w0: 0.5 * c * v0 * v0,
    v: (t: number) => decay(v0, tau, t),
    i: (t: number) => decay(v0 / r, tau, t),
    /** heat in R over [0, t] by the closed form ½CV0²(1 − e^(−2t/τ)) */
    wR: (t: number) => 0.5 * c * v0 * v0 * (1 - Math.exp((-2 * t) / tau)),
  };
}

/** the RL decay of act 4 */
export function rl(i0: number, l: number, r: number) {
  const tau = l / r;
  return { tau, w0: 0.5 * l * i0 * i0, p0: i0 * i0 * r, i: (t: number) => decay(i0, tau, t) };
}

/** the act-3 table: after k·τ, the voltage left, the voltage gone and the energy dissipated */
export const TAU_TABLE = [0, 1, 2, 3, 4, 5].map((k) => ({ k, left: Math.exp(-k), gone: 1 - Math.exp(-k), heat: 1 - Math.exp(-2 * k) }));

/** the switched network: t = 0⁻ steady state, t > 0 Thévenin resistance, waveforms and energy split */
export function solveNet(n: Net = NET) {
  const rRight = par(n.r2, n.r3 + n.r4);
  const vA0 = (n.vs * rRight) / (n.r1 + rRight);
  const v0 = (vA0 * n.r4) / (n.r3 + n.r4);
  const r23 = n.r2 + n.r3;
  const rth = par(r23, n.r4);
  const tau = rth * n.c;
  const w0 = 0.5 * n.c * v0 * v0;
  const k2 = n.r2 / r23;
  return {
    rRight,
    vA0,
    v0,
    r23,
    rth,
    tau,
    /** v_R2 = k2·v_C for t > 0 */
    k2,
    vR2at0p: k2 * v0,
    /** currents at t = 0⁻: through R1 (= R2 + the R3–R4 branch), R2, R3 = R4 */
    i1: (n.vs - vA0) / n.r1,
    iR2: vA0 / n.r2,
    iR34: vA0 / (n.r3 + n.r4),
    /** peak discharge current out of C at t = 0⁺ and the peak power in R4 */
    iPeak: v0 / rth,
    pR4Peak: (v0 * v0) / n.r4,
    w0,
    wR4: (w0 * rth) / n.r4,
    wR2: ((w0 * rth) / r23) * (n.r2 / r23),
    wR3: ((w0 * rth) / r23) * (n.r3 / r23),
    vC: (t: number) => decay(v0, tau, t),
    vR2: (t: number) => (t < 0 ? vA0 : k2 * decay(v0, tau, t)),
  };
}

/** numeric ∫₀^T f dt by Simpson's rule (model.test.ts checks the closed forms with it) */
export function integrate(f: (t: number) => number, a: number, b: number, n = 4000): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** the share of the heat of a capacitor discharging into parallel resistors: conductance ratio */
export const parallelShare = (r: number, others: number[]) => 1 / r / (1 / r + others.reduce((s, x) => s + 1 / x, 0));

/* ------------------------------------------------------------- formatting */

const trim = (s: string) => s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');

export function fmtV(v: number, d = 2): string {
  const a = Math.abs(v);
  if (a > 0 && a < 0.1) return `${(v * 1000).toFixed(1)} mV`;
  return `${v.toFixed(d)} V`;
}
export function fmtA(i: number): string {
  const a = Math.abs(i);
  if (a >= 1) return `${i.toFixed(2)} A`;
  if (a >= 1e-3) return `${(i * 1e3).toFixed(a >= 0.1 ? 0 : 2)} mA`;
  return `${(i * 1e6).toFixed(1)} µA`;
}
export function fmtT(t: number): string {
  const a = Math.abs(t);
  if (a >= 0.5 || a === 0) return `${t.toFixed(2)} s`;
  return `${(t * 1000).toFixed(a >= 0.1 ? 0 : 1)} ms`;
}
export function fmtR(r: number): string {
  if (r >= 1000) return `${trim((r / 1000).toFixed(1))} kΩ`;
  return `${trim(r.toFixed(1))} Ω`;
}
export function fmtC(c: number): string {
  if (c >= 0.01) return `${trim(c.toFixed(2))} F`;
  return `${trim((c * 1e6).toFixed(0))} µF`;
}
export function fmtL(l: number): string {
  if (l >= 1) return `${trim(l.toFixed(2))} H`;
  return `${trim((l * 1000).toFixed(0))} mH`;
}
export function fmtE(w: number): string {
  const a = Math.abs(w);
  if (a >= 0.1 || a === 0) return `${w.toFixed(2)} J`;
  if (a >= 1e-4) return `${(w * 1e3).toFixed(2)} mJ`;
  return `${(w * 1e6).toFixed(1)} µJ`;
}
export function fmtP(p: number): string {
  if (p >= 1) return `${p.toFixed(1)} W`;
  return `${(p * 1000).toFixed(2)} mW`;
}
export const fmtPct = (f: number, d = 1) => `${(f * 100).toFixed(d)}%`;

/** capacitor values of the scope's C slider (E6 series, 10 µF … 470 µF) */
export const C_STEPS = [10e-6, 15e-6, 22e-6, 33e-6, 47e-6, 68e-6, 100e-6, 150e-6, 220e-6, 330e-6, 470e-6];
