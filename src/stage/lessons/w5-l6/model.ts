// W5-L6 numbers: the power triangle of one load (layer 01), the complex-power sum of three parallel
// loads (layer 02), and parallel-capacitor power-factor correction (layer 03). Sign convention of
// the lesson: θ = θ_v − θ_i, S = V_rms I_rms* = P + jQ; lagging (inductive) θ > 0, Q > 0; leading
// (capacitive) θ < 0, Q < 0. A capacitor across the bus delivers |Q_C| = ωCV_rms² (its own Q is −ωCV²).

export const DEG = Math.PI / 180;

export type Kind = 'lag' | 'lead' | 'unity';

/** lagging / leading / unity from the sign of Q (|Q| below `eps` counts as unity) */
export function kindOf(Q: number, eps = 1e-9): Kind {
  return Math.abs(Q) <= eps ? 'unity' : Q > 0 ? 'lag' : 'lead';
}

export const KIND_ZH: Record<Kind, string> = { lag: '滞后', lead: '超前', unity: '单位功率因数' };

export interface Tri {
  S: number;
  P: number;
  Q: number;
  pf: number;
  kind: Kind;
}

/** one load: S = V I (VA), P = S cos θ (W), Q = S sin θ (VAR), pf = cos θ */
export function triangle(thetaDeg: number, V: number, I: number): Tri {
  const S = V * I;
  const P = S * Math.cos(thetaDeg * DEG);
  const Q = S * Math.sin(thetaDeg * DEG);
  return { S, P, Q, pf: Math.cos(thetaDeg * DEG), kind: kindOf(Q, 1e-9 * S) };
}

/** the "forgot the conjugate" product V·I with θ_v = 0, θ_i = −θ: angle θ_v + θ_i = −θ, so Q flips */
export function withoutConjugate(thetaDeg: number, V: number, I: number): { P: number; Q: number } {
  const thetaI = -thetaDeg; // θ_v = 0
  return { P: V * I * Math.cos((0 + thetaI) * DEG), Q: V * I * Math.sin((0 + thetaI) * DEG) };
}

/* ------------------------------------------------------------------ layer 02: three parallel loads */

export const BUS_V = 220;
/** load 1: induction motors, pf 0.8 lagging; load 2: resistive heater, pf 1; load 3: over-excited synchronous machine, pf 0.6 leading */
export const PF_L1 = 0.8;
export const PF_L3 = 0.6;

export interface Vec {
  P: number;
  Q: number;
  S: number;
}

export interface LoadSum {
  loads: Vec[];
  P: number;
  Q: number;
  /** |S_total| = √(ΣP² + ΣQ²) */
  S: number;
  /** the wrong scalar sum Σ|S_k| */
  scalar: number;
  pf: number;
  kind: Kind;
  /** bus current I = |S_total| / V (A), with the S values in VA */
  I: number;
}

/** P_k = S_k pf_k, Q_k = ±S_k √(1 − pf_k²); inputs in kVA / kW, outputs in kW / kVAR / kVA (I in A) */
export function sumLoads(s1: number, p2: number, s3: number, on: [boolean, boolean, boolean] = [true, true, true]): LoadSum {
  const l1: Vec = on[0] ? { P: s1 * PF_L1, Q: s1 * Math.sqrt(1 - PF_L1 ** 2), S: s1 } : { P: 0, Q: 0, S: 0 };
  const l2: Vec = on[1] ? { P: p2, Q: 0, S: p2 } : { P: 0, Q: 0, S: 0 };
  const l3: Vec = on[2] ? { P: s3 * PF_L3, Q: -s3 * Math.sqrt(1 - PF_L3 ** 2), S: s3 } : { P: 0, Q: 0, S: 0 };
  const loads = [l1, l2, l3];
  const P = l1.P + l2.P + l3.P;
  const Q = l1.Q + l2.Q + l3.Q;
  const S = Math.hypot(P, Q);
  return { loads, P, Q, S, scalar: l1.S + l2.S + l3.S, pf: S > 0 ? P / S : 1, kind: kindOf(Q, 1e-9), I: (S * 1000) / BUS_V };
}

/* ------------------------------------------------------------------ layer 03: power-factor correction */

export type ScenarioId = 'sadiku' | 'factory';

export interface Scenario {
  id: ScenarioId;
  /** load real power (W), bus voltage (V rms), frequency (Hz), natural power factor (lagging) */
  P: number;
  V: number;
  f: number;
  pf1: number;
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  /** act 4: Sadiku's example (4 kW, 120 V, 60 Hz, 0.8 lagging → 0.95 lagging) */
  sadiku: { id: 'sadiku', P: 4000, V: 120, f: 60, pf1: 0.8 },
  /** act 5: the guided example (20 kW, 240 V, 60 Hz, 0.8 lagging → 0.95 lagging) */
  factory: { id: 'factory', P: 20000, V: 240, f: 60, pf1: 0.8 },
};

/** θ1 = arccos(pf1) etc. (lagging: positive) */
export const thetaOf = (pf: number) => Math.acos(pf);

/** Q_C = P(tan θ1 − tan θ2) (VAR) for pf1 → pf2, both lagging */
export function qcFor(P: number, pf1: number, pf2: number): number {
  return P * (Math.tan(thetaOf(pf1)) - Math.tan(thetaOf(pf2)));
}

/** C = Q_C / (ω V_rms²), in µF */
export function capFor(P: number, V: number, f: number, pf1: number, pf2: number): number {
  return (qcFor(P, pf1, pf2) / (2 * Math.PI * f * V * V)) * 1e6;
}

/** |Q_C| = ω C V_rms² (VAR) of a capacitor of C µF */
export function qcOf(cUf: number, V: number, f: number): number {
  return 2 * Math.PI * f * cUf * 1e-6 * V * V;
}

export interface Pfc {
  theta1: number;
  Q1: number;
  S1: number;
  I1: number;
  /** what the capacitor delivers now (magnitude) */
  Qc: number;
  Qnet: number;
  Snet: number;
  pfNet: number;
  kind: Kind;
  Iline: number;
  /** fractional drops relative to no capacitor: current 1 − I/I1, line loss 1 − (I/I1)² */
  dI: number;
  dLoss: number;
  /** Q_C > Q1: the bus has gone leading */
  over: boolean;
  /** target pf2 (lagging): Q2 = P tan θ2, Q_C = Q1 − Q2, C in µF */
  Q2: number;
  QcTarget: number;
  cTarget: number;
}

export function pfc(sc: Scenario, cUf: number, pf2: number): Pfc {
  const { P, V, f, pf1 } = sc;
  const theta1 = thetaOf(pf1);
  const Q1 = P * Math.tan(theta1);
  const S1 = P / pf1;
  const I1 = S1 / V;
  const Qc = qcOf(cUf, V, f);
  const Qnet = Q1 - Qc;
  const Snet = Math.hypot(P, Qnet);
  const Iline = Snet / V;
  const Q2 = P * Math.tan(thetaOf(pf2));
  const QcTarget = Q1 - Q2;
  return {
    theta1,
    Q1,
    S1,
    I1,
    Qc,
    Qnet,
    Snet,
    pfNet: P / Snet,
    kind: kindOf(Qnet, 1e-6 * P),
    Iline,
    dI: 1 - Iline / I1,
    dLoss: 1 - (Iline / I1) ** 2,
    over: Qc > Q1 + 1e-9 * P,
    Q2,
    QcTarget,
    cTarget: (QcTarget / (2 * Math.PI * f * V * V)) * 1e6,
  };
}

/** loss drop 1 − (pf1/pf2)² for the same P and V */
export const lossDrop = (pf1: number, pf2: number) => 1 - (pf1 / pf2) ** 2;
/** current drop 1 − pf1/pf2 */
export const currentDrop = (pf1: number, pf2: number) => 1 - pf1 / pf2;

/* ------------------------------------------------------------------ formatting */

/** fixed decimals, trailing zeros kept unless `trim`; true minus sign; −0 → 0 */
export function fmt(x: number, digits = 2, trim = false): string {
  let s = x.toFixed(digits);
  if (/^-0(\.0+)?$/.test(s)) s = s.slice(1);
  if (trim && s.includes('.')) s = s.replace(/\.?0+$/, '');
  return s.replace('-', '−');
}

/** a power in W / VA / VAR: below 10 k with two decimals in the base unit, else in k… with two */
export function fmtPow(x: number, unit: 'W' | 'VA' | 'VAR'): string {
  return Math.abs(x) >= 10000 ? `${fmt(x / 1000, 2)} k${unit}` : `${fmt(x, 2)} ${unit}`;
}
