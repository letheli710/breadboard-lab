// W3-L2 numbers: the real 741 closed loop of Sadiku Example 5.1 (Fig. 5.6b, solved exactly by
// nodal analysis), its ideal limit (Example 5.2, Fig. 5.9), the output-node back-calculation of iₒ
// with a load R_L, and the open-loop comparator of Fig. 5.8 (right panel).

/** a non-inverting closed loop around a VCVS op-amp model (Fig. 5.6b); RL = Infinity: no load */
export interface RealLoop {
  A: number;
  Ri: number;
  Ro: number;
  R1: number;
  Rf: number;
  vs: number;
  RL?: number;
}

/** Sadiku Example 5.1: the 741 (A = 2×10⁵, Rᵢ = 2 MΩ, Rₒ = 50 Ω), R₁ = 10 kΩ, R_f = 20 kΩ, vₛ = 2 V */
export const EX51: RealLoop = { A: 2e5, Ri: 2e6, Ro: 50, R1: 1e4, Rf: 2e4, vs: 2 };

/** supply rails of the lesson (±15 V) */
export const VCC = 15;

export interface RealSolution {
  v1: number;
  vo: number;
  /** vₒ / vₛ */
  gain: number;
  /** v_d = v₂ − v₁ = vₛ − v₁ */
  vd: number;
  /** current into the inverting terminal, i₁ = (v₁ − vₛ)/Rᵢ (negative: it flows from + to −) */
  i1: number;
  /** current down R₁, i = v₁ / R₁ */
  i: number;
  /** current in R_f from vₒ to v₁ */
  iRf: number;
  /** load current */
  iL: number;
  /** current the VCVS drives out through Rₒ */
  io: number;
}

/**
 * Exact nodal solution of Fig. 5.6(b): KCL at node 1 and at the output node o
 *   (1/R₁ + 1/R_f + 1/Rᵢ) v₁ − v_o/R_f = vₛ/Rᵢ
 *   (A/Rₒ − 1/R_f) v₁ + (1/R_f + 1/Rₒ + 1/R_L) v_o = A vₛ/Rₒ
 */
export function solveReal(p: RealLoop): RealSolution {
  const gL = p.RL && Number.isFinite(p.RL) ? 1 / p.RL : 0;
  const a11 = 1 / p.R1 + 1 / p.Rf + 1 / p.Ri;
  const a12 = -1 / p.Rf;
  const b1 = p.vs / p.Ri;
  const a21 = p.A / p.Ro - 1 / p.Rf;
  const a22 = 1 / p.Rf + 1 / p.Ro + gL;
  const b2 = (p.A * p.vs) / p.Ro;
  const det = a11 * a22 - a12 * a21;
  const v1 = (b1 * a22 - a12 * b2) / det;
  const vo = (a11 * b2 - a21 * b1) / det;
  const vd = p.vs - v1;
  return {
    v1,
    vo,
    gain: vo / p.vs,
    vd,
    i1: (v1 - p.vs) / p.Ri,
    i: v1 / p.R1,
    iRf: (vo - v1) / p.Rf,
    iL: vo * gL,
    io: (p.A * vd - vo) / p.Ro,
  };
}

/** the sheet's closed form of the exact gain (act 1, ②), no load */
export function gainClosedForm({ A, Ri, Ro, R1, Rf }: RealLoop): number {
  const den = A * R1 * Ri + R1 * Rf + R1 * Ri + R1 * Ro + Rf * Ri + Ri * Ro;
  return (A * R1 * Ri + A * Rf * Ri + R1 * Ro) / den;
}

/** the sheet's closed form of v₁ / vₛ (act 1, ②), no load */
export function v1ClosedForm({ A, Ri, Ro, R1, Rf }: RealLoop): number {
  const den = A * R1 * Ri + R1 * Rf + R1 * Ri + R1 * Ro + Rf * Ri + Ri * Ro;
  return (R1 * (A * Ri + Rf + Ro)) / den;
}

export interface IdealSolution {
  v1: number;
  vo: number;
  gain: number;
  /** current down R₁ (= current in R_f, since i₁ = 0) */
  i: number;
  iL: number;
  /** output current, from KCL at node o — written last */
  io: number;
}

/** the ideal op amp of Example 5.2 (Fig. 5.9): v₁ = v₂ = vₛ, i₁ = i₂ = 0, v_o = (1 + R_f/R₁) vₛ */
export function solveIdeal({ R1, Rf, vs, RL }: { R1: number; Rf: number; vs: number; RL?: number }): IdealSolution {
  const gain = 1 + Rf / R1;
  const vo = gain * vs;
  const v1 = vs;
  const i = (vo - v1) / Rf;
  const iL = RL && Number.isFinite(RL) ? vo / RL : 0;
  return { v1, vo, gain, i, iL, io: i + iL };
}

/** |x − ref| / |ref| */
export const relErr = (x: number, ref: number) => Math.abs((x - ref) / ref);

/** open loop (no feedback): v_o = A (v₂ − v₁), clamped to the rails */
export function openLoop(A: number, v1: number, v2: number, rails = VCC): { linear: number; vo: number; saturated: boolean } {
  const linear = A * (v2 - v1);
  const vo = Math.max(-rails, Math.min(rails, linear));
  return { linear, vo, saturated: Math.abs(linear) > rails };
}

/* ------------------------------------------------------------- formatting */

const PREFIX: [number, string][] = [
  [1, ''],
  [1e-3, 'm'],
  [1e-6, 'μ'],
  [1e-9, 'n'],
  [1e-12, 'p'],
];

/** "30.05 μV", "−15.02 pA", "0.199997 mA": an SI prefix that keeps 1 ≤ |x| < 1000, `digits` significant */
export function si(x: number, unit: string, digits = 4): string {
  if (x === 0) return `0 ${unit}`;
  const a = Math.abs(x);
  const [f, p] = PREFIX.find(([k]) => a >= k * 0.9995) ?? PREFIX[PREFIX.length - 1];
  const v = Number((a / f).toPrecision(digits));
  return `${x < 0 ? '−' : ''}${String(v)} ${p}${unit}`;
}

/** a plain number with `digits` significant figures, minus sign typeset */
export function num(x: number, digits = 7): string {
  const s = String(Number(x.toPrecision(digits)));
  return s.startsWith('-') ? `−${s.slice(1)}` : s;
}

/** "0.001507%" */
export function pct(x: number, digits = 4): string {
  return `${String(Number((x * 100).toPrecision(digits)))}%`;
}

/** "2×10⁵" for a power-of-ten-ish gain */
export function sci(x: number): string {
  const e = Math.floor(Math.log10(x) + 1e-9);
  const m = Number((x / 10 ** e).toPrecision(2));
  const sup = String(e).replace(/[0-9-]/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] ?? '⁻');
  return m === 1 ? `10${sup}` : `${String(m)}×10${sup}`;
}
