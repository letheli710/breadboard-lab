// W3-L5 circuit maths: the passive resistor mixer of act 1 (a floating common node), the ideal
// inverting summer (Eq. 5.14) and its rail-saturation mode (act 4, the sheet's solver spec).
// Units: kΩ, V, mA (V / kΩ = mA).

/** Passive mixer: v1–R1 and v2–R2 tied to one node, RL from it to ground (act 1, layer 01). */
export function passiveMixer(v1: number, v2: number, R1: number, R2: number, RL: number) {
  const vNode = (v1 / R1 + v2 / R2) / (1 / R1 + 1 / R2 + 1 / RL);
  return { vNode, i1: (v1 - vNode) / R1, i2: (v2 - vNode) / R2, iL: vNode / RL };
}

/** Ideal op-amp summer, linear (virtual ground): the node sits at 0 V, each branch carries vk / Rk. */
export function idealSummer(v: number[], R: number[], Rf: number) {
  const i = v.map((vk, k) => vk / R[k]);
  const iF = i.reduce((a, b) => a + b, 0);
  return { i, iF, vo: -iF * Rf, w: R.map((Rk) => Rf / Rk) };
}

export interface SummerResult {
  /** −Σ (Rf/Rk)·vk, what the ideal formula asks for */
  voIdeal: number;
  /** the output the op amp can give: voIdeal, or clamped to ±Vcc */
  vo: number;
  /** inverting-input voltage: 0 in the linear region, from KCL (i₋ = 0) once saturated */
  vMinus: number;
  /** branch currents into node a (mA) */
  i: number[];
  /** feedback current, node a → output (mA) */
  iF: number;
  /** load current, output → ground (mA) */
  iL: number;
  /** current leaving the op-amp output, iL − iF (mA; negative: the output sinks) */
  io: number;
  saturated: boolean;
}

/** The summer with ±Vcc rails (the sheet's solveSummingAmp): linear while |voIdeal| ≤ Vcc; beyond
 *  it vo sticks to the rail, the virtual short is gone and v₋ follows from KCL at node a. */
export function solveSummer(v: number[], R: number[], Rf: number, RL: number, Vcc: number): SummerResult {
  const lin = idealSummer(v, R, Rf);
  const voIdeal = lin.vo;
  const saturated = Math.abs(voIdeal) > Vcc + 1e-9;
  if (!saturated) {
    const iL = voIdeal / RL;
    return { voIdeal, vo: voIdeal, vMinus: 0, i: lin.i, iF: lin.iF, iL, io: iL - lin.iF, saturated };
  }
  const vo = Math.sign(voIdeal) * Vcc;
  const G = R.reduce((a, Rk) => a + 1 / Rk, 0) + 1 / Rf;
  const vMinus = (v.reduce((a, vk, k) => a + vk / R[k], 0) + vo / Rf) / G;
  const i = v.map((vk, k) => (vk - vMinus) / R[k]);
  const iF = (vMinus - vo) / Rf;
  const iL = vo / RL;
  return { voIdeal, vo, vMinus, i, iF, iL, io: iL - iF, saturated };
}

/* ------------------------------------------------------------- presets */

export type MixPreset = 'weighted_mixer' | 'unity_summer' | 'inverting_averager' | 'adc_level_shifter';

export interface MixSetup {
  label: string;
  /** input resistors (kΩ); a channel the preset does not use is null */
  R: (number | null)[];
  Rf: number;
  /** a channel held at a fixed voltage (the level shifter's reference) */
  fixed?: { ch: number; v: number; name: string };
}

/** Layer 02 presets (the sheet's checklist, item 4). */
export const MIX_PRESETS: Record<MixPreset, MixSetup> = {
  weighted_mixer: { label: '加权混音（第 2 幕）', R: [10, 5, 20], Rf: 20 },
  unity_summer: { label: '等权加法器', R: [10, 10, 10], Rf: 10 },
  inverting_averager: { label: '反相平均器（3 路）', R: [15, 15, 15], Rf: 5 },
  adc_level_shifter: { label: '电平偏置移位（ADC）', R: [10, 20, null], Rf: 10, fixed: { ch: 1, v: -3.3, name: 'Vref' } },
};

export type AmpPreset = 'sadiku_example_5_6' | 'socratic_3ch_mixer';

export interface AmpSetup {
  label: string;
  /** the label on a phone */
  short: string;
  v: number[];
  R: number[];
  Rf: number;
  RL: number;
  Vcc: number;
}

/** Layer 03 presets: Sadiku Example 5.6 and the act 5 three-channel mixer. */
export const AMP_PRESETS: Record<AmpPreset, AmpSetup> = {
  sadiku_example_5_6: { label: 'Sadiku Example 5.6', short: 'Ex 5.6', v: [2, 1], R: [5, 2.5], Rf: 10, RL: 2, Vcc: 12 },
  socratic_3ch_mixer: { label: '第 5 幕 · 3 路混音', short: '第 5 幕混音', v: [1.2, 1.5, -0.6], R: [4, 6, 12], Rf: 12, RL: 4, Vcc: 10 },
};

/** act 5, step 5: the lead vocal jumps from 1.2 V to 3.0 V */
export const BOOST_V1 = 3.0;

/** "1.20", "−0.05", "+0.43" — a typographic minus; `plus` puts a sign on positives */
export function fmt(x: number, digits = 2, plus = false): string {
  const r = Math.abs(x) < 0.5 * 10 ** -digits ? 0 : x;
  const s = Math.abs(r).toFixed(digits);
  return r < 0 ? `−${s}` : plus && r > 0 ? `+${s}` : s;
}
