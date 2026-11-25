// W2-L5 circuit model: one top node A fed by a voltage source Vs through R1, R2 from A to ground
// (the branch asked for), an optional CCCS β·i_x (i_x = current down R2) from A to ground, and a
// current source Is pushing current up into A (negative: pulling it down). One KCL at A:
//   (v − Vs)/R1 + v/R2 + β·v/R2 = Is   ⇒   v = (Vs/R1 + Is) / (1/R1 + (1 + β)/R2)
// Zeroing an independent source sets its value to 0 (Vs → short, Is → open); the CCCS stays.

export interface TwoSource {
  /** voltage source, + on top (V) */
  Vs: number;
  /** current source, into node A from below (A); negative = pointing down */
  Is: number;
  R1: number;
  R2: number;
  /** CCCS gain β of β·i_x (0: no dependent source) */
  beta?: number;
}

/** Sadiku Example 4.3: 6 V, 3 A up, 8 Ω, 4 Ω (act 3, aiding) */
export const AIDING: TwoSource = { Vs: 6, Is: 3, R1: 8, R2: 4 };
/** act 6 challenge: 18 V, 3 A down, 4 Ω, 2 Ω (opposing) */
export const OPPOSING: TwoSource = { Vs: 18, Is: -3, R1: 4, R2: 2 };
/** act 4: 16 V, 6 A up, 4 Ω, 4 Ω, CCCS 2 i_x down */
export const DEP: TwoSource = { Vs: 16, Is: 6, R1: 4, R2: 4, beta: 2 };

export interface Solution {
  /** node voltage v (= voltage across R2, + on top) */
  v: number;
  /** current through R1, from the Vs side to node A (= current up through Vs) */
  iR1: number;
  /** current down through R2 (i, i_x, i_o) */
  iR2: number;
  /** current of the CCCS, down */
  iDep: number;
  /** current of the current source into node A */
  iIs: number;
  /** power absorbed by R2 */
  pR2: number;
}

/** Solve with each independent source on or zeroed; k scales every independent source (homogeneity). */
export function solve(c: TwoSource, vsOn: boolean, isOn: boolean, k = 1): Solution {
  const Vs = vsOn ? c.Vs * k : 0;
  const Is = isOn ? c.Is * k : 0;
  const b = c.beta ?? 0;
  const v = (Vs / c.R1 + Is) / (1 / c.R1 + (1 + b) / c.R2);
  const iR2 = v / c.R2;
  return { v, iR1: (Vs - v) / c.R1, iR2, iDep: b * iR2, iIs: Is, pR2: iR2 * iR2 * c.R2 };
}

/** The three superposition pieces: only Vs ('), only Is (''), both (total). */
export function superpose(c: TwoSource, k = 1) {
  return { one: solve(c, true, false, k), two: solve(c, false, true, k), total: solve(c, true, true, k) };
}

/** Power of R for two component currents: the wrong sum, the cross term, the true power. */
export function powerSplit(i1: number, i2: number, R: number) {
  const p1 = i1 * i1 * R;
  const p2 = i2 * i2 * R;
  const cross = 2 * i1 * i2 * R;
  const i = i1 + i2;
  return { p1, p2, wrong: p1 + p2, cross, i, p: i * i * R };
}

/** Number for a readout: rounded to 2 decimals, trailing zeros and "-0" dropped, real minus sign. */
export function fmt(x: number, signed = false): string {
  const r = Math.round(x * 100) / 100;
  const s = (Object.is(r, -0) ? 0 : r).toFixed(2).replace(/\.?0+$/, '');
  const t = s.replace('-', '−');
  return signed && r > 0 ? `+${t}` : t;
}
