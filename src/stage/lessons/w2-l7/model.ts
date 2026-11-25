// W2-L7's circuits and their numbers. Three networks share one topology (a source in series with
// R1 into node 1, R2 from node 1 to ground, R3 from node 1 to port a, port b = ground):
//  - c1: Sadiku Example 4.8 (Case 1): Vs = 32 V, R1 = 4 Ω, R2 = 12 Ω, Is = 2 A up into node 1, R3 = 1 Ω;
//  - c2: the Case 2 example: a VCVS 2·v_x in place of Vs (v_x = v1), R1 = 4 Ω, R2 = 2 Ω,
//        Is = 5 A into node 1, R3 = 6 Ω;
//  - gd: the guided example: Vs = 12 V, R1 = R2 = 4 Ω, R3 = 2 Ω, a VCCS 0.25·v_x (v_x = v1) from
//        ground up into port a.
// Everything follows from one linear function: the current an external source holding port a at
// v_a pushes into the network, i_in(v_a) = a + b·v_a. Then R_Th = 1/b (b is the test-source
// current for v_o = 1 V with the independent sources zeroed), i_sc = −a, v_oc = −a/b.
// The 3D bench (lab*) is Case 1 scaled for the breadboard: every R × k, Is ÷ k, Vs unchanged.

export type CaseId = 'c1' | 'c2' | 'gd';
export type StepId = 'detach' | 'voc' | 'rth' | 'load';

export interface CaseDef {
  id: CaseId;
  /** independent voltage source in series with R1 (V) */
  vs: number;
  /** gain of a VCVS μ·v1 in series with R1 (Case 2) */
  mu: number;
  /** independent current source up into node 1 (A) */
  is: number;
  /** transconductance of a VCCS g·v1 up into port a (S, the guided example) */
  g: number;
  r1: number;
  r2: number;
  r3: number;
}

export const CASES: Record<CaseId, CaseDef> = {
  c1: { id: 'c1', vs: 32, mu: 0, is: 2, g: 0, r1: 4, r2: 12, r3: 1 },
  c2: { id: 'c2', vs: 0, mu: 2, is: 5, g: 0, r1: 4, r2: 2, r3: 6 },
  gd: { id: 'gd', vs: 12, mu: 0, is: 0, g: 0.25, r1: 4, r2: 4, r3: 2 },
};

/** Node 1 voltage when port a is held at `va` (independent sources on or zeroed). */
export function v1At(c: CaseDef, va: number, sources = true): number {
  const vs = sources ? c.vs : 0;
  const is = sources ? c.is : 0;
  // KCL at node 1: (v1 − vs − μ v1)/R1 + v1/R2 + (v1 − va)/R3 = is
  return (vs / c.r1 + is + va / c.r3) / ((1 - c.mu) / c.r1 + 1 / c.r2 + 1 / c.r3);
}

/** Current pushed into port a by an external source holding it at `va`. */
export function iIn(c: CaseDef, va: number, sources = true): number {
  const v1 = v1At(c, va, sources);
  // KCL at a: i_in + g v1 = (va − v1)/R3
  return (va - v1) / c.r3 - c.g * v1;
}

export interface Equivalent {
  vth: number;
  rth: number;
  iN: number;
  /** node 1 with the port open */
  v1Open: number;
  /** test source v_o = 1 V, independent sources zeroed: node 1 and the current into a */
  v1Test: number;
  io: number;
  /** what you get if you (wrongly) zero the dependent source too */
  rWrong: number;
}

export function equivalent(c: CaseDef): Equivalent {
  const a = iIn(c, 0);
  const b = iIn(c, 1, false);
  const rth = 1 / b;
  const vth = -a / b;
  const par = (x: number, y: number) => (x * y) / (x + y);
  // dependent source zeroed as well: VCVS → short, VCCS → open; then R3 + R1 ∥ R2
  const rWrong = c.r3 + par(c.r1, c.r2);
  return { vth, rth, iN: -a, v1Open: v1At(c, vth), v1Test: v1At(c, 1, false), io: b, rWrong };
}

/** Load current and voltage of the Thevenin equivalent with a load R_L (Ω; 0 = short). */
export function loadPoint(e: Pick<Equivalent, 'vth' | 'rth'>, rl: number): { il: number; vl: number } {
  const il = e.vth / (e.rth + rl);
  return { il, vl: il * rl };
}

/* ------------------------------------------------------------- the breadboard bench (Case 1 × k) */

export type LabMode = 'open' | 'half' | 'two' | 'short';
export type Scale = 'safe' | 'orig';

/** 1/4 W carbon-film rating; above half of it the thermal bar turns amber */
export const P_MAX = 0.25;
export const P_WARM = 0.125;
export type Heat = 'ok' | 'warm' | 'smoke';
export const heatOf = (p: number): Heat => (p > P_MAX ? 'smoke' : p > P_WARM ? 'warm' : 'ok');

/** the half-voltage method's potentiometer (kΩ): 10 kΩ multi-turn */
export const POT = { min: 0.5, max: 10, step: 0.1 };
/** the two-point method's known load (kΩ) */
export const RL_KNOWN = 6;

export interface LabPart {
  id: string;
  name: string;
  ohms: number;
  p: number;
}

export interface Lab {
  k: number;
  /** load across a–b (Ω), Infinity when open, 0 for the meter's short */
  rl: number;
  va: number;
  v1: number;
  /** current out of port a into the load / meter (A) */
  il: number;
  /** current out of the bench supply's + terminal (A) */
  iSupply: number;
  vth: number;
  rth: number;
  iN: number;
  parts: LabPart[];
  /** the hottest part */
  hottest: LabPart;
}

export function lab(mode: LabMode, scale: Scale, potK: number): Lab {
  const k = scale === 'safe' ? 1000 : 1;
  const base = CASES.c1;
  const c: CaseDef = { ...base, r1: base.r1 * k, r2: base.r2 * k, r3: base.r3 * k, is: base.is / k };
  const e = equivalent(c);
  const rl = mode === 'open' ? Infinity : mode === 'short' ? 0 : (mode === 'half' ? potK : RL_KNOWN) * k;
  const va = rl === Infinity ? e.vth : (e.vth * rl) / (e.rth + rl);
  const il = rl === Infinity ? 0 : rl === 0 ? e.iN : va / rl;
  const v1 = va + il * c.r3;
  const parts: LabPart[] = [
    { id: 'hl_r1', name: 'R₁', ohms: c.r1, p: (c.vs - v1) ** 2 / c.r1 },
    { id: 'hl_r2', name: 'R₂', ohms: c.r2, p: v1 ** 2 / c.r2 },
    { id: 'hl_r3', name: 'R₃', ohms: c.r3, p: il ** 2 * c.r3 },
  ];
  if (rl !== Infinity && rl > 0) parts.push({ id: mode === 'half' ? 'lab_pot' : 'lab_rl6k', name: 'R_L', ohms: rl, p: va ** 2 / rl });
  const hottest = parts.reduce((m, p) => (p.p > m.p ? p : m), parts[0]);
  return { k, rl, va, v1, il, iSupply: (c.vs - v1) / c.r1, vth: e.vth, rth: e.rth, iN: e.iN, parts, hottest };
}

/** the half-voltage method has hit V_Th / 2 (to the display's two decimals) */
export const halfHit = (l: Lab) => Math.abs(l.va - l.vth / 2) < 0.005;

/* ------------------------------------------------------------- formatting */

const trim = (s: string) => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);

/** 30 → "30", 0.4 → "0.4", 7.3333 → "7.33" */
export const num = (x: number, d = 2) => trim(x.toFixed(d));

export function fmtOhm(ohms: number): string {
  if (ohms >= 1000) return `${num(ohms / 1000)} kΩ`;
  return `${num(ohms)} Ω`;
}

export function fmtA(a: number): string {
  if (Math.abs(a) >= 1) return `${a.toFixed(2)} A`;
  return `${(a * 1000).toFixed(2)} mA`;
}

export function fmtW(w: number): string {
  if (w >= 1) return `${w.toFixed(2)} W`;
  return `${(w * 1000).toFixed(w * 1000 >= 100 ? 1 : 2)} mW`;
}

/** colour bands of the bench's resistors (the sheet's codes; 5-band for the 1 % parts) */
export const BANDS: Record<string, string[]> = {
  '4000': ['yellow', 'black', 'black', 'brown', 'brown'],
  '12000': ['brown', 'red', 'orange', 'gold'],
  '1000': ['brown', 'black', 'red', 'gold'],
  '6000': ['blue', 'black', 'black', 'brown', 'brown'],
  '4': ['yellow', 'black', 'gold', 'gold'],
  '12': ['brown', 'red', 'black', 'gold'],
  '1': ['brown', 'black', 'gold', 'gold'],
  '6': ['blue', 'black', 'gold', 'gold'],
};
