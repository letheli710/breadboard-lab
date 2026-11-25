// W4-L1 numbers: the parallel-plate capacitor (C = ε_r ε_0 A / d), the piecewise-linear waveforms
// of examples 2 and 3 (i = C dv/dt and its integral), the electric energy w = ½Cv², the DC
// steady state (capacitors open) of example 4 and the guided example, and series / parallel
// capacitors (example 5). Every layer, the acts and the tests use these.

export const EPS0 = 8.854e-12;

/* ------------------------------------------------------------- parallel plates */

export type DielectricKey = 'air' | 'polyester' | 'mica' | 'ceramic';
export const DIELECTRICS: { key: DielectricKey; name: string; er: number }[] = [
  { key: 'air', name: '空气', er: 1 },
  { key: 'polyester', name: '聚酯', er: 3 },
  { key: 'mica', name: '云母', er: 5 },
  { key: 'ceramic', name: '陶瓷', er: 1000 },
];
export const erOf = (k: DielectricKey) => DIELECTRICS.find((d) => d.key === k)?.er ?? 1;

/** C = ε_r ε_0 A / d (SI units) */
export const plateC = (er: number, A: number, d: number) => (er * EPS0 * A) / d;

/** Example 1: A = 20 cm², d = 1 mm, air then mica (ε_r = 5) */
export const EX1 = { A: 20e-4, d: 1e-3, er1: 1, er2: 5 };

/** slider ranges of layer 02 (A in cm², d in mm, v in V) */
export const A_RANGE: [number, number] = [2, 40];
export const D_RANGE: [number, number] = [0.2, 3];
export const V_RANGE: [number, number] = [0, 5];

export function teardown(er: number, Acm2: number, dmm: number, v: number) {
  const A = Acm2 * 1e-4;
  const d = dmm * 1e-3;
  const C = plateC(er, A, d);
  const q = C * v;
  return { C, q, E: v / d, w: energy(C, v), sigma: q / A };
}

/* ------------------------------------------------------------- energy */

export const energy = (C: number, v: number) => 0.5 * C * v * v;

/* ------------------------------------------------------------- piecewise-linear v(t) → i(t) */

export type Pt = [number, number];

/** Example 2: C = 2 μF, v(t) through (0, 0), (2 ms, 10 V), (4 ms, 10 V), (6 ms, −10 V), (8 ms, 0) */
export const EX2 = {
  C: 2e-6,
  pts: [
    [0, 0],
    [2e-3, 10],
    [4e-3, 10],
    [6e-3, -10],
    [8e-3, 0],
  ] as Pt[],
};

/** Example 2's first ramp squeezed into the last `rise` seconds before 2 ms (rise = 2 ms is the sheet's) */
export function ex2Points(rise: number): Pt[] {
  const r = Math.min(2e-3, Math.max(1e-6, rise));
  const p = EX2.pts;
  return r >= 2e-3 ? p : [p[0], [2e-3 - r, 0], ...p.slice(1)];
}

/** index of the segment that holds t (a boundary belongs to the segment it starts) */
function seg(pts: Pt[], t: number): number {
  for (let k = 0; k < pts.length - 1; k++) if (t < pts[k + 1][0]) return k;
  return pts.length - 2;
}

export function pwl(pts: Pt[], t: number): number {
  const k = seg(pts, t);
  const [t0, v0] = pts[k];
  const [t1, v1] = pts[k + 1];
  const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  return v0 + (v1 - v0) * u;
}

/** dv/dt on the segment that holds t */
export function slope(pts: Pt[], t: number): number {
  const k = seg(pts, t);
  return (pts[k + 1][1] - pts[k][1]) / (pts[k + 1][0] - pts[k][0]);
}

/** i_ab = C (v_b − v_a)/(t_b − t_a), segment by segment */
export const segCurrents = (C: number, pts: Pt[]) => pts.slice(0, -1).map((p, k) => (C * (pts[k + 1][1] - p[1])) / (pts[k + 1][0] - p[0]));

/** the current spike the rise-time test asks for: i = C · 10 V / Δt */
export const riseCurrent = (rise: number) => (EX2.C * 10) / rise;
/** above this, the stage raises the "voltage cannot jump" alarm */
export const SPIKE_ALARM = 1;

/* ------------------------------------------------------------- piecewise-constant i(t) → v(t) */

/** Example 3: C = 50 μF, v(0) = 2 V, i = +15 mA on [0, 4 ms), −10 mA on [4 ms, 10 ms] */
export const EX3 = {
  C: 50e-6,
  v0: 2,
  segs: [
    { t0: 0, t1: 4e-3, i: 15e-3 },
    { t0: 4e-3, t1: 10e-3, i: -10e-3 },
  ],
};
export const EX3_END = 10e-3;

export function ex3i(t: number): number {
  for (const s of EX3.segs) if (t < s.t1) return s.i;
  return EX3.segs[EX3.segs.length - 1].i;
}

/** charge that has flowed in since t = 0: ∫ i dτ */
export function ex3charge(t: number): number {
  let q = 0;
  for (const s of EX3.segs) q += s.i * Math.max(0, Math.min(t, s.t1) - s.t0);
  return q;
}

/** v(t) = (1/C) ∫ i dτ + v(0); `withV0 = false` is the classic slip of forgetting v(0) */
export const ex3v = (t: number, withV0 = true) => ex3charge(t) / EX3.C + (withV0 ? EX3.v0 : 0);

/* ------------------------------------------------------------- DC steady state: capacitors open */

/** The ladder of examples 4 and the guided example: V_s – R_1 – node A (R_2 ∥ C_1 to ground) –
 *  R_3 – node B (R_4 to ground, and C_2 to ground, through R_5 in the guided example). With the
 *  capacitors open (and so R_5 carrying nothing) it is a resistor ladder. */
export interface Ladder {
  Vs: number;
  R1: number;
  R2: number;
  R3: number;
  R4: number;
  /** in series with C_2 (0 = none) */
  R5: number;
  C1: number;
  C2: number;
}

export const EX4: Ladder = { Vs: 12, R1: 3e3, R2: 6e3, R3: 2e3, R4: 4e3, R5: 0, C1: 10e-6, C2: 20e-6 };
export const GUIDED: Ladder = { Vs: 9, R1: 1e3, R2: 3e3, R3: 3e3, R4: 3e3, R5: 2e3, C1: 100e-6, C2: 200e-6 };

export const par = (a: number, b: number) => (a * b) / (a + b);

export function ladder(L: Ladder) {
  const R34 = L.R3 + L.R4;
  const Rp = par(L.R2, R34);
  const Req = L.R1 + Rp;
  const Is = L.Vs / Req;
  const VA = Is * Rp;
  const VB = (VA * L.R4) / R34;
  const iR5 = 0;
  const VC1 = VA;
  const VC2 = VB - iR5 * L.R5;
  const w1 = energy(L.C1, VC1);
  const w2 = energy(L.C2, VC2);
  return { R34, Rp, Req, Is, VA, VB, I2: VA / L.R2, I34: VA / R34, VR1: Is * L.R1, iR5, VC1, VC2, w1, w2, wt: w1 + w2 };
}

/* ------------------------------------------------------------- series and parallel */

export const seriesC = (...c: number[]) => 1 / c.reduce((s, x) => s + 1 / x, 0);
export const parallelC = (...c: number[]) => c.reduce((s, x) => s + x, 0);

/** Example 5: C_1 in series with [C_2 ∥ (C_3 series C_4)], on V_s = 9 V, uncharged at first */
export interface Net5 {
  C1: number;
  C2: number;
  C3: number;
  C4: number;
  Vs: number;
}
export const EX5: Net5 = { C1: 60e-6, C2: 20e-6, C3: 20e-6, C4: 20e-6, Vs: 9 };

export function net5(n: Net5) {
  const C34 = seriesC(n.C3, n.C4);
  const C234 = parallelC(n.C2, C34);
  const Ceq = seriesC(n.C1, C234);
  const Q = Ceq * n.Vs;
  const V1 = Q / n.C1;
  const V234 = Q / C234;
  const V3 = (V234 * n.C4) / (n.C3 + n.C4);
  const V4 = (V234 * n.C3) / (n.C3 + n.C4);
  const w = [energy(n.C1, V1), energy(n.C2, V234), energy(n.C3, V3), energy(n.C4, V4)];
  return { C34, C234, Ceq, Q, V1, V234, V2: V234, V3, V4, Q2: n.C2 * V234, Q34: C34 * V234, w, wsum: w[0] + w[1] + w[2] + w[3], weq: energy(Ceq, n.Vs) };
}

/** the same numbers read as kΩ in the same topology: R_1 + R_2 ∥ (R_3 + R_4) — the mirror */
export const mirrorR = (n: Net5) => n.C1 + par(n.C2, n.C3 + n.C4);

/** series pair on V_s: inverse-ratio division */
export function seriesPair(C1: number, C2: number, Vs: number) {
  const Ceq = seriesC(C1, C2);
  const Q = Ceq * Vs;
  return { Ceq, Q, V1: Q / C1, V2: Q / C2 };
}

/** the values the ex5 steppers cycle through (μF) */
export const C_STEPS = [10, 20, 30, 47, 60, 100];

/* ------------------------------------------------------------- the 3D bench of layer 01 */

export const BENCH_V = 5;
export const DEVICES = {
  elec: { C: 100e-6, rating: 25, name: '100 μF 25 V 铝电解电容' },
  cer: { C: 0.1e-6, rating: 50, name: '104 瓷片电容（0.1 μF）' },
} as const;
export type DeviceKey = keyof typeof DEVICES;
export const R_DISCHARGE = 1e3;

/** 104 → 10 × 10⁴ pF */
export const ceramicCode = (code: string) => Number(code.slice(0, 2)) * 10 ** Number(code[2]) * 1e-12;

/** the 2× derating rule: rating ≥ 2 × supply */
export const deratingOk = (rating: number, supply: number) => rating >= 2 * supply;

/* ------------------------------------------------------------- formatting */

/** drop trailing zeros after a decimal point ("100.0" → "100", "5000" stays) */
const trim = (s: string) => (s.includes('.') ? s.replace(/\.?0+$/, '') : s);

export function fmtC(C: number): string {
  if (C >= 1e-6) return `${trim((C * 1e6).toPrecision(4))} μF`;
  if (C >= 1e-9) return `${trim((C * 1e9).toPrecision(4))} nF`;
  return `${trim((C * 1e12).toPrecision(4))} pF`;
}

export function fmtQ(q: number): string {
  const a = Math.abs(q);
  if (a >= 1e-6) return `${trim((q * 1e6).toPrecision(4))} μC`;
  if (a >= 1e-9) return `${trim((q * 1e9).toPrecision(4))} nC`;
  return `${trim((q * 1e12).toPrecision(4))} pC`;
}

export function fmtW(w: number): string {
  const a = Math.abs(w);
  if (a >= 1e-3) return `${trim((w * 1e3).toPrecision(4))} mJ`;
  if (a >= 1e-6) return `${trim((w * 1e6).toPrecision(4))} μJ`;
  if (a >= 1e-9) return `${trim((w * 1e9).toPrecision(4))} nJ`;
  if (a === 0) return '0 J';
  return `${trim((w * 1e12).toPrecision(4))} pJ`;
}

export function fmtI(i: number): string {
  const a = Math.abs(i);
  if (a >= 1) return `${trim(i.toPrecision(4))} A`;
  if (a >= 1e-3 || a === 0) return `${trim((i * 1e3).toPrecision(4))} mA`;
  return `${trim((i * 1e6).toPrecision(4))} μA`;
}

export const fmtV = (v: number, digits = 2) => `${(Math.abs(v) < 5e-4 ? 0 : v).toFixed(digits)} V`;

export function fmtR(r: number): string {
  return r >= 1e3 ? `${trim((r / 1e3).toPrecision(4))} kΩ` : `${trim(r.toPrecision(4))} Ω`;
}

/** V/s with a sign */
export function fmtSlope(s: number): string {
  const a = Math.abs(s);
  if (a >= 1e6) return `${trim((s / 1e6).toPrecision(3))} MV/s`;
  if (a >= 1e5) return `${trim((s / 1e3).toPrecision(4))} kV/s`;
  return `${trim(s.toPrecision(4))} V/s`;
}

export function fmtE(E: number): string {
  return E >= 1e3 ? `${trim((E / 1e3).toPrecision(3))} kV/m` : `${trim(E.toPrecision(3))} V/m`;
}
