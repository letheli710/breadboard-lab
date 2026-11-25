// W3-L6 model: the four-resistor difference amplifier of Sadiku Fig. 5.19 with an ideal op amp
// (virtual open i₋ = i₊ = 0, virtual short v_a = v_b), and the common-mode / differential split.
//   node b (divider):   v_b = R4/(R3 + R4) · v2
//   node a (KCL):       (v1 − v_a)/R1 = (v_a − v_o)/R2  ⇒  v_o = (1 + R2/R1)·v_a − (R2/R1)·v1
//   Eq. 5.16:           v_o = (1 + R2/R1)/(1 + R3/R4) · v2 − (R2/R1) · v1
//   superposition:      v_o1 = −(R2/R1)·v1 (v2 = 0),  v_o2 = (1 + R2/R1)·v_b2 (v1 = 0)
//   split:              v1 = v_cm − v_d/2, v2 = v_cm + v_d/2  ⇒  v_o = A_d·v_d + A_cm·v_cm
// Resistances in kΩ throughout (only ratios matter, except the input resistances).

export interface Four {
  R1: number;
  R2: number;
  R3: number;
  R4: number;
}

/** the matched gain-10 amplifier of acts 2–4 */
export const MATCHED_10: Four = { R1: 10, R2: 100, R3: 10, R4: 100 };
/** Sadiku Example 5.7: v_o = −5 v1 + 3 v2 (R1 = R3 = 10 kΩ given; R2, R4 are the answers) */
export const EX_5_7: Four = { R1: 10, R2: 50, R3: 10, R4: 10 };
/** Sadiku Practice Problem 5.7: a difference amplifier of gain 4 */
export const PP_5_7: Four = { R1: 10, R2: 40, R3: 10, R4: 40 };

/** act 1: the sensor on long leads */
export const SENSOR = { vcm: 5, vd: 0.01, gain: 10, rail: 15 };

/** the two input voltages from the common-mode and differential parts */
export function split(vcm: number, vd: number) {
  return { v1: vcm - vd / 2, v2: vcm + vd / 2 };
}

/** the common-mode and differential parts of two input voltages */
export function unsplit(v1: number, v2: number) {
  return { vcm: (v1 + v2) / 2, vd: v2 - v1 };
}

/** an output clipped at the supply rails ±rail */
export function clip(v: number, rail: number) {
  return Math.max(-rail, Math.min(rail, v));
}

/** coefficients of Eq. 5.16: v_o = a·v2 − b·v1 */
export function coeffs(r: Four) {
  const b = r.R2 / r.R1;
  const div = r.R4 / (r.R3 + r.R4);
  const nonInv = 1 + b;
  return { a: nonInv * div, b, div, nonInv };
}

/** Eq. 5.16 */
export function eq516(r: Four, v1: number, v2: number) {
  const { a, b } = coeffs(r);
  return a * v2 - b * v1;
}

/** Node analysis: v_b from the divider, v_a = v_b (virtual short), v_o from the KCL at node a. */
export function nodal(r: Four, v1: number, v2: number) {
  const vb = (r.R4 / (r.R3 + r.R4)) * v2;
  const va = vb;
  // (v1 − va)/R1 = (va − vo)/R2
  const vo = va - (r.R2 * (v1 - va)) / r.R1;
  const i1 = (v1 - va) / r.R1; // mA (kΩ), = i2
  const i3 = (v2 - vb) / r.R3; // = i4
  return { va, vb, vo, i1, i2: (va - vo) / r.R2, i3, i4: vb / r.R4 };
}

/** Superposition: sub-circuit A (v2 = 0) and sub-circuit B (v1 = 0). */
export function superpose(r: Four, v1: number, v2: number) {
  const { b, div, nonInv } = coeffs(r);
  const vo1 = -b * v1;
  const vb2 = div * v2;
  const vo2 = nonInv * vb2;
  return { vb1: 0, vo1, vb2, vo2, vo: vo1 + vo2 };
}

/** differential and common-mode gains of any four resistors (act 4 ②) */
export function gains(r: Four) {
  const { R1, R2, R3, R4 } = r;
  const Ad = (R1 * R4 + R2 * R3 + 2 * R2 * R4) / (2 * R1 * (R3 + R4));
  const Acm = (R1 * R4 - R2 * R3) / (R1 * (R3 + R4));
  const cmrr = Math.abs(Acm) < 1e-12 ? Infinity : Math.abs(Ad / Acm);
  return { Ad, Acm, cmrr, cmrrDb: cmrr === Infinity ? Infinity : 20 * Math.log10(cmrr) };
}

/** input resistances (kΩ): v1 alone (v2 = 0), v2 alone (v1 = 0), a floating differential source */
export function inputR(r: Four) {
  return { rin1: r.R1, rin2: r.R3 + r.R4, rid: r.R1 + r.R3 };
}

/** Weighted subtractor design v_o = −K1 v1 + K2 v2 (act 5 ②): R2/R1 = K1, R3/R4 = (1 + K1 − K2)/K2. */
export function design(K1: number, K2: number) {
  const r2r1 = K1;
  const r3r4 = (1 + K1 - K2) / K2;
  return { r2r1, r3r4, ok: K1 > 0 && K2 > 0 && K2 < 1 + K1 };
}

/** tolerance presets of layer 03: relative deviation (%) of each resistor from its nominal value */
export type TolPreset = 'ideal_0pct' | 'single_r4_plus5pct' | 'worst_case_5pct' | 'precision_0_1pct' | 'ex57';
export const TOL: Record<TolPreset, { nominal: Four; d: [number, number, number, number] }> = {
  ideal_0pct: { nominal: MATCHED_10, d: [0, 0, 0, 0] },
  single_r4_plus5pct: { nominal: MATCHED_10, d: [0, 0, 0, 5] },
  worst_case_5pct: { nominal: MATCHED_10, d: [-5, 5, 5, -5] },
  precision_0_1pct: { nominal: MATCHED_10, d: [-0.1, 0.1, 0.1, -0.1] },
  ex57: { nominal: EX_5_7, d: [0, 0, 0, 0] },
};

/** the four resistors of a tolerance preset with R4's deviation set to d4 (%) */
export function withTol(p: TolPreset, d4: number): Four {
  const { nominal: n, d } = TOL[p];
  const k = (x: number) => 1 + x / 100;
  return { R1: n.R1 * k(d[0]), R2: n.R2 * k(d[1]), R3: n.R3 * k(d[2]), R4: n.R4 * k(d4) };
}

/** number for a readout: up to `dp` decimals, trailing zeros dropped, a real minus sign */
export function fmt(x: number, dp = 3, signed = false): string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞';
  let s = x.toFixed(dp);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  if (/^-0$/.test(s)) s = '0';
  if (s.startsWith('-')) return `−${s.slice(1)}`;
  return signed && s !== '0' ? `+${s}` : s;
}

/** a resistance in kΩ for a label: "10k", "105k", "9.5k" */
export function kOhm(x: number): string {
  return `${fmt(x, 2)}k`;
}
