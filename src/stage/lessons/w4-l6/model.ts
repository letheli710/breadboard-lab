// W4-L6 model: the three switched RLC circuits of the lesson and their six boundary values by the
// three-snapshot method (t = 0⁻ steady state: C open, L short; t = 0⁺: C → voltage source v_C(0⁺),
// L → current source i_L(0⁺); t = ∞ new steady state). Passive sign convention throughout:
// i_C flows into the + end of C, v_L is + where i_L enters L. For t > 0 each circuit is a linear
// two-state system  dv_C/dt = i_C/C, di_L/dt = v_L/L, integrated (RK4) for the stage's waveforms.
//   ex1 (act 3): SPDT switch a → b, V1 = 12 V → V2 = 30 V, then R1, L, node: R2 ∥ C
//   ex2 (act 4): Vs, R1 to node A; A: R2 + L to ground; S + R3 from A to B (closes at t = 0);
//                B: Is (into B), R4, C to ground
//   guided (act 5): Vs, R1, L to node B; B: R2, S + R3 (opens at t = 0), C to ground
// Volts, amperes, ohms, henries, farads, seconds.

export type Preset = 'demo' | 'ex1' | 'ex2' | 'guided';
/** the three snapshots: t = 0⁻, t = 0⁺, t = ∞ */
export type Moment = 'pre' | 'zero' | 'inf';

export interface State {
  vC: number;
  iL: number;
}
/** what the resistive network gives for a state of the two sources (t > 0): the non-state variables */
export interface Response {
  iC: number;
  vL: number;
  /** node voltages where the circuit has named nodes (ex2: A and B) */
  vA?: number;
  vB?: number;
}

export interface Circuit {
  L: number;
  C: number;
  /** t = 0⁻ steady state (old switch position, C open, L short) */
  pre(): State;
  /** t > 0 topology, C and L replaced by sources of value vC and iL */
  after(s: State): Response;
  /** t = ∞ steady state (new switch position, C open, L short) */
  final(): State & { vA?: number; vB?: number };
}

export const EX1 = { V1: 12, V2: 30, R1: 6, R2: 6, L: 0.5, C: 0.25 };
export const EX2 = { Vs: 24, Is: 6, R1: 4, R2: 4, R3: 4, R4: 6, L: 0.5, C: 0.25 };
export const GUIDED = { Vs: 36, R1: 6, R2: 6, R3: 6, L: 0.25, C: 0.5 };

export const par = (a: number, b: number) => (a * b) / (a + b);

export const ex1: Circuit = {
  L: EX1.L,
  C: EX1.C,
  pre() {
    const iL = EX1.V1 / (EX1.R1 + EX1.R2);
    return { iL, vC: EX1.R2 * iL };
  },
  after({ vC, iL }) {
    return { vL: EX1.V2 - EX1.R1 * iL - vC, iC: iL - vC / EX1.R2 };
  },
  final() {
    const iL = EX1.V2 / (EX1.R1 + EX1.R2);
    return { iL, vC: EX1.R2 * iL };
  },
};

export const ex2: Circuit = {
  L: EX2.L,
  C: EX2.C,
  pre() {
    return { iL: EX2.Vs / (EX2.R1 + EX2.R2), vC: EX2.Is * EX2.R4 };
  },
  after({ vC, iL }) {
    const { Vs, Is, R1, R2, R3, R4 } = EX2;
    // KCL at A (leaving positive): (vA − Vs)/R1 + iL + (vA − vC)/R3 = 0; B is clamped to vC
    const vA = (Vs / R1 + vC / R3 - iL) / (1 / R1 + 1 / R3);
    return { vA, vB: vC, vL: vA - R2 * iL, iC: Is - vC / R4 + (vA - vC) / R3 };
  },
  final() {
    const { Vs, Is, R1, R2, R3, R4 } = EX2;
    // two node equations: [g11 −g3; −g3 g22] [vA; vB] = [Vs/R1; Is]
    const g11 = 1 / R1 + 1 / R2 + 1 / R3;
    const g22 = 1 / R3 + 1 / R4;
    const g3 = 1 / R3;
    const det = g11 * g22 - g3 * g3;
    const vA = ((Vs / R1) * g22 + g3 * Is) / det;
    const vB = (g11 * Is + g3 * (Vs / R1)) / det;
    return { vA, vB, iL: vA / R2, vC: vB };
  },
};

export const guided: Circuit = {
  L: GUIDED.L,
  C: GUIDED.C,
  pre() {
    const Rp = par(GUIDED.R2, GUIDED.R3);
    const iL = GUIDED.Vs / (GUIDED.R1 + Rp);
    return { iL, vC: iL * Rp };
  },
  after({ vC, iL }) {
    return { vL: GUIDED.Vs - GUIDED.R1 * iL - vC, iC: iL - vC / GUIDED.R2 };
  },
  final() {
    const iL = GUIDED.Vs / (GUIDED.R1 + GUIDED.R2);
    return { iL, vC: iL * GUIDED.R2 };
  },
};

export const CIRCUITS: Record<Exclude<Preset, 'demo'>, Circuit> = { ex1, ex2, guided };

/** the six boundary values (and the t = 0⁺ / t = ∞ node voltages where there are nodes) */
export function bounds(c: Circuit) {
  const s0 = c.pre(); // v_C(0⁺) = v_C(0⁻), i_L(0⁺) = i_L(0⁻)
  const r = c.after(s0);
  const f = c.final();
  return {
    vC0: s0.vC,
    iL0: s0.iL,
    iC0p: r.iC,
    vL0p: r.vL,
    dvC: r.iC / c.C,
    diL: r.vL / c.L,
    vCinf: f.vC,
    iLinf: f.iL,
    vA0p: r.vA,
    vAinf: f.vA,
    vBinf: f.vB,
  };
}
export type Bounds = ReturnType<typeof bounds>;

/** the two natural frequencies s₁, s₂ of the t > 0 circuit (real part, imaginary part) */
export function roots(c: Circuit) {
  const f = (s: State) => {
    const r = c.after(s);
    return [r.iC / c.C, r.vL / c.L];
  };
  const o = f({ vC: 0, iL: 0 });
  const dv = f({ vC: 1, iL: 0 });
  const di = f({ vC: 0, iL: 1 });
  const a11 = dv[0] - o[0];
  const a12 = di[0] - o[0];
  const a21 = dv[1] - o[1];
  const a22 = di[1] - o[1];
  const tr = a11 + a22;
  const det = a11 * a22 - a12 * a21;
  const disc = (tr * tr) / 4 - det;
  if (disc >= 0)
    return [
      { re: tr / 2 + Math.sqrt(disc), im: 0 },
      { re: tr / 2 - Math.sqrt(disc), im: 0 },
    ];
  return [
    { re: tr / 2, im: Math.sqrt(-disc) },
    { re: tr / 2, im: -Math.sqrt(-disc) },
  ];
}

export interface Sample {
  t: number;
  vC: number;
  iL: number;
  iC: number;
  vL: number;
}

/** v_C, i_L, i_C, v_L from t = −0.15 T to T (T: five times the slowest time constant), RK4 */
export function simulate(c: Circuit, n = 240): { T: number; pts: Sample[] } {
  const slow = Math.min(...roots(c).map((r) => Math.abs(r.re)));
  const T = 5 / slow;
  const t0 = -0.15 * T;
  const s0 = c.pre();
  const pts: Sample[] = [];
  const dt = (T - t0) / n;
  const der = (s: State) => {
    const r = c.after(s);
    return { vC: r.iC / c.C, iL: r.vL / c.L };
  };
  let s = { ...s0 };
  let tPrev = 0;
  const sub = 8;
  for (let k = 0; k <= n; k++) {
    const t = t0 + k * dt;
    if (t < 0) {
      pts.push({ t, ...s0, iC: 0, vL: 0 });
      continue;
    }
    // integrate from tPrev to t in small RK4 steps
    const span = t - tPrev;
    const h = span / sub;
    for (let j = 0; j < sub && h > 0; j++) {
      const k1 = der(s);
      const k2 = der({ vC: s.vC + (h / 2) * k1.vC, iL: s.iL + (h / 2) * k1.iL });
      const k3 = der({ vC: s.vC + (h / 2) * k2.vC, iL: s.iL + (h / 2) * k2.iL });
      const k4 = der({ vC: s.vC + h * k3.vC, iL: s.iL + h * k3.iL });
      s = { vC: s.vC + (h / 6) * (k1.vC + 2 * k2.vC + 2 * k3.vC + k4.vC), iL: s.iL + (h / 6) * (k1.iL + 2 * k2.iL + 2 * k3.iL + k4.iL) };
    }
    tPrev = t;
    const r = c.after(s);
    pts.push({ t, ...s, iC: r.iC, vL: r.vL });
  }
  // the instant t = 0⁺ itself (the jump of i_C and v_L), inserted after the last t < 0 sample
  const r0 = c.after(s0);
  const i0 = pts.findIndex((p) => p.t >= 0);
  pts.splice(i0, 0, { t: 0, ...s0, iC: 0, vL: 0 }, { t: 0, ...s0, iC: r0.iC, vL: r0.vL });
  return { T, pts };
}

/** a number for the stage: up to `dp` decimals, trailing zeros dropped, a true minus sign */
export function fmt(x: number, dp = 2, plus = false): string {
  const v = Math.abs(x) < 1e-9 ? 0 : x;
  let s = v.toFixed(dp);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  if (s === '-0') s = '0';
  s = s.replace('-', '−');
  return plus && v > 0 ? `+${s}` : s;
}
