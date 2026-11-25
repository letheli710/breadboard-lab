// W3-L4 model: the non-inverting amplifier, the voltage follower against a loaded high-impedance
// sensor, Sadiku Example 5.5 (two sources) and the LM358's output window on the bench supply.
// Pure functions, shared by the three stage layers and the tests (no React, no three.js).

export type Supply = 'dual' | 'single';

/** the positive rail: +9 V in both supply modes (the negative rail is −9 V, or GND) */
export const V_POS = 9;
/** the LM358 is not rail-to-rail: its output tops out about 1.5 V below V+ */
export const HEADROOM = 1.5;

/** the sheet's linear output windows of the LM358 (V): ±9 V → [−7.5, +7.5]; single +9 V → [+0.02, +7.5] */
export const WINDOW: Record<Supply, [number, number]> = {
  dual: [-(V_POS - HEADROOM), V_POS - HEADROOM],
  single: [0.02, V_POS - HEADROOM],
};

/** LM358 output current the buffer can rely on (the data sheet's minimum source current, 20 mA) */
export const I_OUT_MAX = 20e-3;

export const clampOut = (v: number, s: Supply) => Math.min(WINDOW[s][1], Math.max(WINDOW[s][0], v));
/** which rail the output is stuck on, if any */
export const satOf = (ideal: number, s: Supply): 'high' | 'low' | null => (ideal > WINDOW[s][1] + 1e-9 ? 'high' : ideal < WINDOW[s][0] - 1e-9 ? 'low' : null);

/* ------------------------------------------------------------- non-inverting amplifier */

/** closed-loop gain of the non-inverting amplifier, A_v = 1 + R_f / R_1 (R_1 = ∞: a follower) */
export const gain = (r1: number, rf: number) => 1 + (Number.isFinite(r1) ? rf / r1 : 0);

export interface NonInv {
  av: number;
  /** ideal output A_v · v_i */
  ideal: number;
  /** the output after the LM358's window */
  vo: number;
  vplus: number;
  /** the divider's tap: R_1 / (R_1 + R_f) · v_o (equals v_+ only in the linear region) */
  vminus: number;
  /** current through R_1 to ground, = i_f (i_− = 0) */
  i1: number;
  sat: 'high' | 'low' | null;
  /** single supply with a negative input: below the chip's input range, the output sits at its low limit */
  negInput: boolean;
}

export function nonInverting(vi: number, r1: number, rf: number, supply: Supply): NonInv {
  const av = gain(r1, rf);
  const ideal = av * vi;
  const vo = clampOut(ideal, supply);
  const vminus = rf === 0 ? vo : vo * (r1 / (r1 + rf));
  return { av, ideal, vo, vplus: vi, vminus, i1: vminus / r1, sat: satOf(ideal, supply), negInput: supply === 'single' && vi < 0 };
}

/* ------------------------------------------------------------- the buffer test bench */

/** the high-impedance sensor of act 3: V_Th = 5 V, R_Th = 10 kΩ */
export const SENSOR = { vth: 5, rth: 10e3 };

/** R_L slider (Ω), logarithmic */
export const RL_RANGE: [number, number] = [100, 100e3];
export const rlOfPos = (p: number) => RL_RANGE[0] * Math.pow(RL_RANGE[1] / RL_RANGE[0], Math.min(1, Math.max(0, p)));
export const posOfRl = (rl: number) => Math.log(Math.min(RL_RANGE[1], Math.max(RL_RANGE[0], rl)) / RL_RANGE[0]) / Math.log(RL_RANGE[1] / RL_RANGE[0]);

export interface Loaded {
  rl: number;
  /** load voltage */
  vl: number;
  /** current the sensor gives (through R_Th) */
  isrc: number;
  /** load current */
  il: number;
  /** load power */
  pl: number;
  /** buffer only: the load asks for more than I_OUT_MAX */
  limited: boolean;
}

/** the sensor wired straight to the load: a divider */
export function direct(rl: number, s = SENSOR): Loaded {
  const il = s.vth / (s.rth + rl);
  const vl = il * rl;
  return { rl, vl, isrc: il, il, pl: (vl * vl) / rl, limited: false };
}

/** a voltage follower between sensor and load: i_+ = 0, v_L = V_Th (while the chip can source the current) */
export function buffered(rl: number, s = SENSOR): Loaded {
  const want = s.vth / rl;
  const limited = want > I_OUT_MAX;
  const vl = limited ? I_OUT_MAX * rl : s.vth;
  const il = vl / rl;
  return { rl, vl, isrc: 0, il, pl: (vl * vl) / rl, limited };
}

/* ------------------------------------------------------------- Sadiku Example 5.5 */

export const EX55 = { vs1: 6, vs2: 4, r1: 4e3, rf: 10e3 };

export interface Mixed {
  /** superposition parts: V_s1 alone (inverting), V_s2 alone (non-inverting) */
  vo1: number;
  vo2: number;
  ideal: number;
  vo: number;
  vplus: number;
  vminus: number;
  i1: number;
  ifb: number;
  sat: 'high' | 'low' | null;
}

/** V_s1 via R_1 into the inverting input, V_s2 straight into the non-inverting input, R_f feedback. */
export function mixed(supply: Supply, p = EX55): Mixed {
  const k = p.rf / p.r1;
  const vo1 = -k * p.vs1;
  const vo2 = (1 + k) * p.vs2;
  const ideal = vo1 + vo2;
  const vo = clampOut(ideal, supply);
  const sat = satOf(ideal, supply);
  // linear: v− = v+; stuck on a rail: v− is the R_1–R_f divider between V_s1 and the output
  const vminus = sat ? (p.vs1 * p.rf + vo * p.r1) / (p.r1 + p.rf) : p.vs2;
  return { vo1, vo2, ideal, vo, vplus: p.vs2, vminus, i1: (p.vs1 - vminus) / p.r1, ifb: (vminus - vo) / p.rf, sat };
}

/* ------------------------------------------------------------- the breadboard */

export type Preset = 'ni' | 'buf' | 'ex55';
export type ProbeAt = 'out' | 'vplus' | 'vminus';

/** the board's fixed parts: A_v = 3 (10 kΩ, 20 kΩ); the follower with R_L = 1 kΩ */
export const BENCH = { r1: 10e3, rf: 20e3, rl: 1e3 };

export interface BenchRead {
  vplus: number;
  vminus: number;
  /** what the red probe's "out" point reads: the output (ni, ex55) or the load (buf) */
  vout: number;
  /** the ideal output (no window) */
  ideal: number;
  sat: 'high' | 'low' | null;
  /** load current (buf) */
  il?: number;
}

export function bench(preset: Preset, supply: Supply, vi: number, buf: boolean): BenchRead {
  if (preset === 'ni') {
    const n = nonInverting(vi, BENCH.r1, BENCH.rf, supply);
    return { vplus: n.vplus, vminus: n.vminus, vout: n.vo, ideal: n.ideal, sat: n.sat };
  }
  if (preset === 'ex55') {
    const m = mixed(supply);
    return { vplus: m.vplus, vminus: m.vminus, vout: m.vo, ideal: m.ideal, sat: m.sat };
  }
  // the follower: R_L on the output (buffered) or straight on the sensor (direct)
  const l = buf ? buffered(BENCH.rl) : direct(BENCH.rl);
  const vplus = buf ? SENSOR.vth : l.vl;
  const vo = clampOut(vplus, supply);
  return { vplus, vminus: buf ? l.vl : vo, vout: l.vl, ideal: vplus, sat: satOf(vplus, supply), il: l.il };
}

/* ------------------------------------------------------------- formatting */

export const fmtV = (v: number, d = 2) => `${v < -0.5 * 10 ** -d ? '−' : ''}${Math.abs(v).toFixed(d)} V`;
export const fmtSigned = (v: number, d = 2) => `${v < -0.5 * 10 ** -d ? '−' : v > 0.5 * 10 ** -d ? '+' : ''}${Math.abs(v).toFixed(d)} V`;
export function fmtR(ohm: number): string {
  if (!Number.isFinite(ohm)) return '∞';
  if (ohm >= 1000) {
    const k = ohm / 1000;
    return `${k >= 100 ? k.toFixed(0) : k >= 10 ? k.toFixed(1).replace(/\.0$/, '') : k.toFixed(2).replace(/\.?0+$/, '')} kΩ`;
  }
  return `${Math.round(ohm)} Ω`;
}
export function fmtI(a: number): string {
  const m = Math.abs(a) * 1000;
  const s = a < -1e-12 ? '−' : '';
  if (m === 0) return '0.00 mA';
  if (m < 0.01) return `${s}${(m * 1000).toFixed(1)} µA`;
  return `${s}${m.toFixed(m >= 10 ? 1 : m >= 1 ? 2 : 3)} mA`;
}
export function fmtP(w: number): string {
  const m = w * 1000;
  return m >= 10 ? `${m.toFixed(1)} mW` : m >= 1 ? `${m.toFixed(2)} mW` : `${m.toFixed(3)} mW`;
}
