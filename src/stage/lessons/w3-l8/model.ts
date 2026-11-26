// W3-L8 numbers: the 4-bit binary-weighted DAC (R, 2R, 4R, 8R into a virtual-ground summing node,
// Rf feedback) on the breadboard's LM358 with ±9 V rails, and the three-op-amp instrumentation
// amplifier. Pure functions, shared by the three stage layers and model.test.ts.
//
// The LM358 is not rail-to-rail and not symmetric. On ±9 V its output reaches about V+ − 1.5 V =
// +7.5 V on the high side. On the low side it gets within a few tens of mV of V− only while it
// sinks less than its internal ≈ 50 µA pull-down; sinking more, the output PNP takes over and the
// output stays roughly one V_EB (≈ 0.8 V) above V−. The DAC's output always sinks the feedback
// current |v_o| / R_f (≈ 0.8 mA near the rail with R_f = 10 kΩ), so its low-side limit is taken as
// V− + 0.8 V = −8.2 V. A symmetric non-rail-to-rail part (e.g. TL072: about ±7.5 V on ±9 V) is
// drawn as a reference only.

export const RAIL = 9;
/** the four weighted branches b1 (MSB) … b4 (LSB): R, 2R, 4R, 8R with R = 10 kΩ */
export const R_UNIT = 10_000;
export const DAC_R = [10_000, 20_000, 40_000, 80_000] as const;
/** pull-down on every bit node of the breadboard (an OFF switch leaves the node on GND) */
export const R_PULLDOWN = 10_000;
export const RF_OPTIONS = [10_000, 4_000] as const;
export type Rf = (typeof RF_OPTIONS)[number];
export const VREF_OPTIONS = [1, 5] as const;
export type Vref = (typeof VREF_OPTIONS)[number];

/** LM358 output limits on ±9 V for this circuit (see the header) */
export const LM358_VOH = RAIL - 1.5;
export const LM358_VOL = -RAIL + 0.8;
/** a symmetric non-rail-to-rail op amp (TL072-like) on ±9 V, for comparison only */
export const SYM_SWING = 7.5;
/** open-loop gain (LM358 typ. 100 V/mV) */
export const A_OL = 1e5;
/** 1/4 W resistors */
export const RATING_W = 0.25;

/** bits of a code 0…15, MSB first: [b1, b2, b3, b4] */
export const bitsOf = (code: number): [number, number, number, number] => [(code >> 3) & 1, (code >> 2) & 1, (code >> 1) & 1, code & 1];
export const codeStr = (code: number) => bitsOf(code).join('');

/** ideal output v_o(D) = −(R_f / 8R) · V_ref · D */
export const dacIdeal = (code: number, vref: number, rf: number) => -(rf / (8 * R_UNIT)) * vref * code;
/** one LSB step Δv_LSB = −(R_f / 8R) · V_ref */
export const lsbOf = (vref: number, rf: number) => -(rf / (8 * R_UNIT)) * vref;

export type DacState = 'linear' | 'edge' | 'clip' | 'rail';

export interface Dac {
  code: number;
  bits: [number, number, number, number];
  ideal: number;
  /** output on the breadboard's LM358 */
  vo: number;
  /** output of an ideal rail-to-rail op amp (clamped at ±9 V) */
  voRail: number;
  /** inverting input (Pin 2): 0 V while the loop is closed, pulled off 0 V once the output clips */
  vn: number;
  clipped: boolean;
  /** linear · edge (within 0.15 V of the LM358 limit) · clip (LM358 clips, an ideal rail-to-rail
   *  part would not) · rail (beyond the ±9 V rails: clips on any op amp) */
  state: DacState;
  /** branch currents into the summing node, b1 … b4 (A) */
  ib: number[];
  /** current through R_f toward the output (A) = what the output pin sinks */
  iF: number;
  /** power in each resistor (W): weighted b1 … b4, R_f, and the four pull-downs */
  pW: { r: number[]; rf: number; pd: number[] };
  pMax: number;
}

/** The DAC solved on the breadboard (switch ON: bit node on V_ref; OFF: on GND through the pull-down). */
export function dac(code: number, vref: number, rf: number): Dac {
  const bits = bitsOf(code);
  const ideal = dacIdeal(code, vref, rf);
  const lo = LM358_VOL;
  const hi = LM358_VOH;
  const clipped = ideal < lo || ideal > hi;
  const vo = Math.min(hi, Math.max(lo, ideal));
  const voRail = Math.min(RAIL, Math.max(-RAIL, ideal));
  // node equation at the inverting input; the + input is on GND
  const g = DAC_R.map((r, k) => (bits[k] ? 1 / r : 1 / (r + R_PULLDOWN)));
  const src = bits.map((b) => (b ? vref : 0));
  const gf = 1 / rf;
  const vnClipped = (g.reduce((s, gk, k) => s + gk * src[k], 0) + gf * vo) / (g.reduce((s, x) => s + x, 0) + gf);
  // closed loop: v− = −v_o / A ≈ 10 µV, shown (and solved) as the virtual ground 0 V
  const vn = clipped ? vnClipped : 0;
  const ib = g.map((gk, k) => gk * (src[k] - vn));
  const iF = (vn - vo) / rf;
  const r = DAC_R.map((rk, k) => (bits[k] ? (vref - vn) ** 2 / rk : (rk * vn ** 2) / (rk + R_PULLDOWN) ** 2));
  const pd = bits.map((b, k) => (b ? vref ** 2 / R_PULLDOWN : (R_PULLDOWN * vn ** 2) / (DAC_R[k] + R_PULLDOWN) ** 2));
  const pRf = (vn - vo) ** 2 / rf;
  const pMax = Math.max(...r, pRf, ...pd);
  let state: DacState = 'linear';
  if (ideal < -RAIL || ideal > RAIL) state = 'rail';
  else if (clipped) state = 'clip';
  else if (ideal - lo < 0.15 || hi - ideal < 0.15) state = 'edge';
  return { code, bits, ideal, vo, voRail, vn, clipped, state, ib, iF, pW: { r, rf: pRf, pd }, pMax };
}

/** state of a code on a symmetric ±7.5 V op amp (the sheet's TL072 / "±7.5 V" picture) */
export const symClips = (v: number) => v < -SYM_SWING || v > SYM_SWING;

/* ------------------------------------------------------------- instrumentation amplifier */

export interface IaParams {
  /** the two feedback resistors of the first stage */
  R: number;
  R1: number;
  R2: number;
  RG: number;
  v1: number;
  v2: number;
}

export interface IaSol extends IaParams {
  /** current through R_G, upward (from the A2− node to the A1− node) */
  i: number;
  vo1: number;
  vo2: number;
  /** first-stage differential gain 1 + 2R / R_G */
  a1: number;
  /** second stage R2 / R1 */
  a2: number;
  av: number;
  vo: number;
  /** all three outputs inside the LM358's swing */
  linear: boolean;
}

export function ia(p: IaParams): IaSol {
  const i = (p.v2 - p.v1) / p.RG;
  const vo1 = p.v1 - i * p.R;
  const vo2 = p.v2 + i * p.R;
  const a1 = 1 + (2 * p.R) / p.RG;
  const a2 = p.R2 / p.R1;
  const vo = a2 * (vo2 - vo1);
  const inside = (v: number) => v <= LM358_VOH && v >= LM358_VOL;
  return { ...p, i, vo1, vo2, a1, a2, av: a1 * a2, vo, linear: inside(vo1) && inside(vo2) && inside(vo) };
}

/** A_v(R_G) = (R2 / R1)(1 + 2R / R_G) */
export const iaGain = (R: number, R1: number, R2: number, RG: number) => (R2 / R1) * (1 + (2 * R) / RG);
/** R_G for a target gain: R_G = 2R / (A_v / (R2/R1) − 1) */
export const rgFor = (R: number, R1: number, R2: number, av: number) => (2 * R) / (av / (R2 / R1) - 1);

/** Act 2 (the sheet's Sadiku Ex. 5.12 values): R = 25 kΩ, R1 = R2 = 10 kΩ; inputs 2.000 / 2.010 V */
export const IA_EX = { R: 25_000, R1: 10_000, R2: 10_000, v1: 2.0, v2: 2.01 };
/** the guided example: R = 25 kΩ, R1 = 10 kΩ, R2 = 20 kΩ, v1 = 2.000 V, v2 = 2.050 V, target 102 */
export const IA_GD = { R: 25_000, R1: 10_000, R2: 20_000, v1: 2.0, v2: 2.05, target: 102 };
export const RG_RANGE: [number, number] = [1_000, 100_000];

/* ------------------------------------------------------------- formatting */

const minus = (s: string) => s.replace('-', '−');
/** "−1.875 V" (three decimals) */
export const fmtV = (v: number, d = 3) => minus(`${(Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d)} V`);
export const fmtSigned = (v: number, d = 3) => (v > 0 ? `+${v.toFixed(d)} V` : fmtV(v, d));
export function fmtI(a: number): string {
  const x = Math.abs(a);
  if (x < 1e-9) return '0 A';
  if (x < 1e-3) return minus(`${(a * 1e6).toFixed(x < 1e-5 ? 2 : 1)} µA`);
  return minus(`${(a * 1e3).toFixed(3)} mA`);
}
export function fmtR(r: number): string {
  if (r >= 1e6) return `${+(r / 1e6).toFixed(2)} MΩ`;
  if (r >= 1e3) return `${+(r / 1e3).toFixed(r < 1e4 ? 2 : 1)} kΩ`;
  return `${Math.round(r)} Ω`;
}
export const fmtP = (w: number) => (w < 1e-3 ? `${(w * 1e6).toFixed(0)} µW` : `${(w * 1e3).toFixed(2)} mW`);
export const fmtGain = (a: number) => (a >= 10 ? a.toFixed(1).replace(/\.0$/, '') : a.toFixed(2).replace(/0$/, ''));

export const STATE_LABEL: Record<DacState, string> = {
  linear: '线性区',
  edge: '临界：贴近 LM358 低端极限',
  clip: 'LM358 削顶',
  rail: '超出 −9 V 电源轨：彻底饱和',
};
