// W3-L7 numbers: the passive divider cascade and its buffered twin (layer 01), op-amp chains
// solved stage by stage with rail clipping (layer 02), and the two-stage circuit with a
// cross-stage resistor R_G solved by nodal analysis (layer 03). Resistances in kΩ, voltages in
// V, so currents come out in mA. model.test.ts checks every number the lesson sheet prints.

export const clip = (v: number, rail: number) => Math.max(-rail, Math.min(rail, v));

/** a readout value: `digits` decimals (trailing zeros dropped unless `keep`), "−" for minus,
 *  "+" in front when `signed` and positive */
export function fmt(v: number, digits = 2, signed = false, keep = false): string {
  let s = (Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v).toFixed(digits);
  if (!keep && s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  if (s.startsWith('-')) return `−${s.slice(1)}`;
  return signed && Number(s) > 0 ? `+${s}` : s;
}

/* ------------------------------------------------------------------ layer 01 */

export interface Cascade2 {
  /** stage-1 output node (the divider tap) */
  v1: number;
  /** stage-2 output */
  vo: number;
  /** actual gain vo / vi */
  A: number;
  /** product of the unloaded gains, 0.5 × 0.5 */
  Aideal: number;
  /** (A − Aideal) / Aideal, in % */
  errPct: number;
  /** current stage 2 draws from the stage-1 node, mA */
  iLoad: number;
  /** Thevenin resistance seen at the stage-1 node (R ∥ R), kΩ; 0 behind the buffer */
  Rth: number;
}

/** Two R–R dividers (gain ½ each). Stage 2 is two equal resistors of R_in2 / 2 (input resistance
 *  R_in2, gain ½ whatever R_in2 is). `buffered`: an ideal follower (R_o = 0) sits between them. */
export function cascade2(vi: number, R: number, Rin2: number, buffered: boolean): Cascade2 {
  const Aideal = 0.25;
  if (buffered) {
    const v1 = vi / 2;
    const vo = v1 / 2;
    return { v1, vo, A: vo / vi, Aideal, errPct: ((vo / vi - Aideal) / Aideal) * 100, iLoad: v1 / Rin2, Rth: 0 };
  }
  const Rp = (R * Rin2) / (R + Rin2);
  const v1 = (vi * Rp) / (R + Rp);
  const vo = v1 / 2;
  return { v1, vo, A: vo / vi, Aideal, errPct: ((vo / vi - Aideal) / Aideal) * 100, iLoad: v1 / Rin2, Rth: R / 2 };
}

/* ------------------------------------------------------------------ layer 02 */

export type StageKind = 'inv' | 'non' | 'sum';

export interface StageDef {
  kind: StageKind;
  /** inv: input resistor; non: resistor from − to ground; sum: resistor of the chain input (R_a) */
  Rin: number;
  Rf: number;
  /** sum: the second input, through Rb */
  Rb?: number;
  vb?: number;
}

export interface Chain {
  stages: StageDef[];
  /** load on the last output, kΩ (none when absent) */
  RL?: number;
}

export interface StageState {
  /** the stage's own closed-loop gain on the chain input */
  A: number;
  /** what the linear formula asks for (with the actual, clipped input) */
  lin: number;
  /** the actual output, clipped to the rails */
  out: number;
  sat: boolean;
  /** the chain computed without clipping anywhere (the "blind" product) */
  naive: number;
  /** voltage at the stage's inverting input */
  vminus: number;
  /** current out of the op-amp output into its own feedback resistor, mA */
  iF: number;
  /** current the next stage (or the load) draws from this output, mA */
  iNext: number;
  /** total op-amp output current i_ok = iF + iNext (KCL at the output node), mA */
  iO: number;
}

export function stageGain(s: StageDef): number {
  return s.kind === 'non' ? 1 + s.Rf / s.Rin : -s.Rf / s.Rin;
}

/** the second-input term of a summer: −(Rf / Rb)·vb */
export function sumOffset(s: StageDef): number {
  return s.kind === 'sum' ? -(s.Rf / (s.Rb ?? 1)) * (s.vb ?? 0) : 0;
}

function linear(s: StageDef, u: number) {
  return stageGain(s) * u + sumOffset(s);
}

/** inverting-input voltage of a stage with input u and output out (virtual short unless saturated) */
function vMinus(s: StageDef, u: number, out: number, sat: boolean): number {
  if (s.kind === 'non') return sat ? (out * s.Rin) / (s.Rin + s.Rf) : u;
  if (!sat) return 0;
  if (s.kind === 'inv') return (u * s.Rf + out * s.Rin) / (s.Rin + s.Rf);
  const Rb = s.Rb ?? 1;
  return (u / s.Rin + (s.vb ?? 0) / Rb + out / s.Rf) / (1 / s.Rin + 1 / Rb + 1 / s.Rf);
}

/** current a stage draws from the node driving its chain input (into its input resistor) */
function inputCurrent(s: StageDef, u: number, vm: number): number {
  return s.kind === 'non' ? 0 : (u - vm) / s.Rin;
}

/** Solve the chain left to right: every output clipped to ±rail before it feeds the next stage. */
export function solveChain(c: Chain, vi: number, rail: number): StageState[] {
  const out: StageState[] = [];
  let u = vi;
  let blind = vi;
  const ins: { u: number; out: number; sat: boolean }[] = [];
  for (const s of c.stages) {
    const lin = linear(s, u);
    const o = clip(lin, rail);
    const sat = Math.abs(lin) > rail + 1e-9;
    blind = linear(s, blind);
    ins.push({ u, out: o, sat });
    out.push({ A: stageGain(s), lin, out: o, sat, naive: blind, vminus: 0, iF: 0, iNext: 0, iO: 0 });
    u = o;
  }
  c.stages.forEach((s, k) => {
    const st = out[k];
    st.vminus = vMinus(s, ins[k].u, st.out, st.sat);
    st.iF = (st.out - st.vminus) / s.Rf;
  });
  c.stages.forEach((_, k) => {
    const st = out[k];
    const nx = c.stages[k + 1];
    st.iNext = nx ? inputCurrent(nx, st.out, out[k + 1].vminus) : c.RL ? st.out / c.RL : 0;
    st.iO = st.iF + st.iNext;
  });
  return out;
}

/** product of the stage gains (on the chain input) */
export const chainGain = (c: Chain) => c.stages.reduce((a, s) => a * stageGain(s), 1);

/* the chains on layer 02 */

/** act 3 (Sadiku Example 5.8 型): inverting 2k/10k → non-inverting 4k/12k, R_L = 2k, ±15 V */
export const EX1: Chain = {
  stages: [
    { kind: 'inv', Rin: 2, Rf: 10 },
    { kind: 'non', Rin: 4, Rf: 12 },
  ],
  RL: 2,
};

/** act 4: inverting 2k/20k → summer (v_o1 via Ra 10k, v₂ = 2 V via Rb 5k, Rf 10k) → inverting 20k/10k, ±12 V */
export const EX2_HIGH: Chain = {
  stages: [
    { kind: 'inv', Rin: 2, Rf: 20 },
    { kind: 'sum', Rin: 10, Rf: 10, Rb: 5, vb: 2 },
    { kind: 'inv', Rin: 20, Rf: 10 },
  ],
};
/** act 4's gain-staging fix: Rf1 = 10k (A₁ = −5), Ra = 5k */
export const EX2_FIX: Chain = {
  stages: [
    { kind: 'inv', Rin: 2, Rf: 10 },
    { kind: 'sum', Rin: 5, Rf: 10, Rb: 5, vb: 2 },
    { kind: 'inv', Rin: 20, Rf: 10 },
  ],
};

/** the guided example: inverting 2k/16k → non-inverting 5k/15k → inverting 20k/5k, R_L = 2k, ±15 V */
export const DRILL_HIGH: Chain = {
  stages: [
    { kind: 'inv', Rin: 2, Rf: 16 },
    { kind: 'non', Rin: 5, Rf: 15 },
    { kind: 'inv', Rin: 20, Rf: 5 },
  ],
  RL: 2,
};
/** its fix (step 5): Rf1 = 8k (A₁ = −4), Rf3 = 10k (A₃ = −0.5) */
export const DRILL_FIX: Chain = {
  stages: [
    { kind: 'inv', Rin: 2, Rf: 8 },
    { kind: 'non', Rin: 5, Rf: 15 },
    { kind: 'inv', Rin: 20, Rf: 10 },
  ],
  RL: 2,
};

/* ------------------------------------------------------------------ layer 03 */

export const GF = { R1: 10, Rf1: 20, R2: 10, Rf2: 20, RG: 30, rail: 15 };

export interface GlobalResult {
  A2: number;
  /** pure-cascade product A₁·A₂ */
  Anaive: number;
  /** the circuit's real gain (nodal analysis when R_G is in, the product when it is out) */
  Atrue: number;
  vo1: number;
  vo: number;
  sat: boolean;
  /** branch currents into the v₋₁ = 0 node (KCL: they sum to zero), mA */
  i1: number;
  if1: number;
  iG: number;
}

/** Closed-loop gain with a cross-stage resistor R_G from v_o back to v₋₁ (Rf1·A₂ form). */
export function globalGain(R1: number, Rf1: number, A2: number, RG: number) {
  return -(A2 * Rf1 * RG) / (R1 * (RG + A2 * Rf1));
}

export function globalCircuit(vi: number, withRG: boolean, p = GF): GlobalResult {
  const A2 = 1 + p.Rf2 / p.R2;
  const A1 = -p.Rf1 / p.R1;
  const Anaive = A1 * A2;
  if (!withRG) {
    const lin1 = A1 * vi;
    const vo1 = clip(lin1, p.rail);
    const lin = A2 * vo1;
    const vo = clip(lin, p.rail);
    const sat = Math.abs(lin1) > p.rail + 1e-9 || Math.abs(lin) > p.rail + 1e-9;
    return { A2, Anaive, Atrue: Anaive, vo1, vo, sat, i1: vi / p.R1, if1: vo1 / p.Rf1, iG: 0 };
  }
  const Atrue = globalGain(p.R1, p.Rf1, A2, p.RG);
  const lin = Atrue * vi;
  const vo = clip(lin, p.rail);
  const vo1 = vo / A2;
  return { A2, Anaive, Atrue, vo1, vo, sat: Math.abs(lin) > p.rail + 1e-9, i1: vi / p.R1, if1: vo1 / p.Rf1, iG: vo / p.RG };
}
