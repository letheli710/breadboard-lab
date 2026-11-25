// W3-L3's inverting-amplifier engine (the sheet's invertingAmpEngine): an LM358 on ±9 V (or, the
// classic mistake, on a single +9 V with Pin 4 on GND), input v_i through R1 into the inverting
// input, R_f from the output back to it, the non-inverting input on GND.
//
// Output swing of the LM358 (not rail-to-rail): it pulls down to about V− (sinking a fraction of a
// milliamp) but its Darlington pull-up stops about 1.5 V short of V+: [V−, V+ − 1.5 V].
// While the output is inside that range the loop holds v− = 0 (virtual ground); once it clips the
// loop is broken and R1 – R_f is a plain divider between v_i and the clipped output.
// Faults of the troubleshooting table (act 6.3): R_f not seated (open loop: a comparator) and
// Pin 2 wired to GND (the inverting input forced to a real ground, the output idles near 0 V).

export const VPLUS = 9;
export const VMINUS = -9;
/** LM358 output ceiling: V+ − 1.5 V */
export const VSAT_POS = VPLUS - 1.5;
/** LM358 quiescent supply current (both halves), mA */
export const IQ_MA = 0.7;
/** 1/4 W resistor rating */
export const P_RATED = 0.25;

export type Supply = 'dual' | 'single';
export type Fault = 'none' | 'rf_open' | 'pin2_gnd';
export type AmpState = 'linear' | 'sat_pos' | 'sat_neg' | 'open_loop' | 'shorted';

export interface Amp {
  vi: number;
  r1: number;
  rf: number;
  supply: Supply;
  fault: Fault;
  /** closed-loop gain −R_f / R1 */
  av: number;
  /** −(R_f / R1)·v_i, unclipped */
  voIdeal: number;
  /** the output as measured */
  vo: number;
  /** v− (Pin 2) */
  vMinus: number;
  /** current through R1, left to right (A) */
  i1: number;
  /** current through R_f, from node 1 to the output (A) */
  iF: number;
  /** current out of the op-amp output pin, no load (A): KCL at the output node, i_o + i_f = 0 */
  io: number;
  state: AmpState;
  /** output rails of the swing: [vLo, vHi] */
  vLo: number;
  vHi: number;
  /** input range of linear operation: [viLo, viHi] */
  viLo: number;
  viHi: number;
  pR1: number;
  pRf: number;
}

/** Output range of the LM358 on this supply. */
export function swing(supply: Supply): { vLo: number; vHi: number } {
  return { vLo: supply === 'dual' ? VMINUS : 0, vHi: VSAT_POS };
}

/** Linear input window: V_o,min ≤ −(R_f/R1)·v_i ≤ V_o,max ⇔ −(R1/R_f)·V_o,max ≤ v_i ≤ −(R1/R_f)·V_o,min. */
export function linWindow(r1: number, rf: number, supply: Supply): { viLo: number; viHi: number } {
  const { vLo, vHi } = swing(supply);
  return { viLo: -(r1 / rf) * vHi, viHi: -(r1 / rf) * vLo + 0 };
}

export function solve(vi: number, r1: number, rf: number, supply: Supply = 'dual', fault: Fault = 'none'): Amp {
  const { vLo, vHi } = swing(supply);
  const { viLo, viHi } = linWindow(r1, rf, supply);
  const av = -rf / r1;
  const voIdeal = av * vi;
  let vo: number;
  let vMinus: number;
  let i1: number;
  let iF: number;
  let state: AmpState;
  if (fault === 'rf_open') {
    // no feedback: no current in R1, v− = v_i, the output slams to the rail opposite to v_i
    vMinus = vi;
    i1 = 0;
    iF = 0;
    vo = vi > 0 ? vLo : vHi;
    state = 'open_loop';
  } else if (fault === 'pin2_gnd') {
    // Pin 2 tied to GND: i1 drains into the ground wire, v+ = v− = 0, the output idles at 0 V
    vMinus = 0;
    vo = 0;
    i1 = vi / r1;
    iF = 0;
    state = 'shorted';
  } else {
    vo = Math.min(vHi, Math.max(vLo, voIdeal));
    const clipped = vo !== voIdeal;
    state = !clipped ? 'linear' : vo === vHi ? 'sat_pos' : 'sat_neg';
    // linear: virtual ground; clipped: R1–R_f divide between v_i and the stuck output
    vMinus = clipped ? (vi * rf + vo * r1) / (r1 + rf) : 0;
    i1 = (vi - vMinus) / r1;
    iF = (vMinus - vo) / rf;
  }
  const io = -iF;
  return { vi, r1, rf, supply, fault, av, voIdeal, vo, vMinus, i1, iF, io, state, vLo, vHi, viLo, viHi, pR1: i1 * i1 * r1, pRf: iF * iF * rf };
}

/** Current drawn from each output of the bench supply (A): quiescent + what the output pin
 *  sources from V+ or sinks into V−. On a single supply V− is GND, CH2 is idle. */
export function supplyCurrents(a: Amp): { ch1: number; ch2: number } {
  const iq = IQ_MA / 1000;
  const src = Math.max(0, a.io);
  const sink = Math.max(0, -a.io);
  return a.supply === 'dual' ? { ch1: iq + src, ch2: iq + sink } : { ch1: iq + src, ch2: 0 };
}

/** Closed-loop gain with a finite open-loop gain A (Sadiku 5.4): −(R_f/R1) / (1 + (1 + R_f/R1)/A). */
export function finiteGain(ratio: number, a: number): number {
  return -ratio / (1 + (1 + ratio) / a);
}

/** Source loading: v_i = V_s·R1 / (R_s + R1). */
export function loaded(vs: number, rs: number, r1: number): number {
  return (vs * r1) / (rs + r1);
}

/** Transimpedance amplifier (Example 5.4 view): v_o = −R_f·i_s. */
export const tiaOut = (is: number, rf: number) => -rf * is;

/** Op-amp output current with a load R_L to ground: i_o = i_L − i_f = v_o / R_L − v_i / R1. */
export function ioLoaded(vi: number, r1: number, rf: number, rl: number): number {
  const vo = (-rf / r1) * vi;
  return vo / rl - vi / r1;
}

/** Johnson noise v_n,rms = √(4 k_B T R Δf) */
export const thermalNoise = (r: number, bw: number, t = 300) => Math.sqrt(4 * 1.380649e-23 * t * r * bw);

/** Colour bands of the lab resistors (4-band, 5 %) */
export const BANDS: Record<number, [string, string, string, string]> = {
  10000: ['brown', 'black', 'orange', 'gold'],
  22000: ['red', 'red', 'orange', 'gold'],
  47000: ['yellow', 'violet', 'orange', 'gold'],
};

/* ------------------------------------------------------------- formatting */

const MINUS = '−';
/** signed number with a real minus sign: 2.2 → "+2.20", −2.2 → "−2.20" */
export function sgn(x: number, d = 2): string {
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  const s = Math.abs(v).toFixed(d);
  return v < 0 ? `${MINUS}${s}` : v > 0 ? `+${s}` : s;
}
/** number with a real minus sign, no plus */
export function num(x: number, d = 2): string {
  return sgn(x, d).replace(/^\+/, '');
}
export function fmtV(x: number, d = 2): string {
  return `${sgn(x, d)} V`;
}
/** current in µA (or mA from 1 mA up) */
export function fmtI(a: number): string {
  const ua = a * 1e6;
  if (Math.abs(ua) >= 1000) return `${sgn(ua / 1000, 2)} mA`;
  return `${sgn(ua, Math.abs(ua) >= 100 ? 0 : 1)} µA`;
}
export function fmtR(ohms: number): string {
  return ohms >= 1e6 ? `${+(ohms / 1e6).toFixed(2)} MΩ` : ohms >= 1000 ? `${+(ohms / 1000).toFixed(1)} kΩ` : `${ohms} Ω`;
}
export function fmtP(w: number): string {
  return w >= 0.1 ? `${(w * 1000).toFixed(0)} mW` : `${(w * 1000).toFixed(2)} mW`;
}
export function fmtMa(a: number): string {
  return `${(a * 1000).toFixed(2)} mA`;
}

export const STATE_ZH: Record<AmpState, string> = {
  linear: '线性放大区（虚地成立）',
  sat_pos: '正向饱和（撞上 V⁺ − 1.5 V）',
  sat_neg: '负向饱和（撞上负轨）',
  open_loop: '开环比较器（Rf 开路）',
  shorted: 'Pin 2 被短接到地',
};
