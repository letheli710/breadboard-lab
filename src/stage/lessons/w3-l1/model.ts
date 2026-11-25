// W3-L1 model: the numbers of the lesson sheet (docs/lessons/W3-L1.md) as pure functions, shared
// by the four stage layers and the tests (no React, no three.js).
//  - the two DIP-8 pinouts (LM358 dual, LM741 single) and their pin groups;
//  - Eq. (5.1), the closed-surface KCL of a real op amp: i_o = i_1 + i_2 + i_+ + i_-;
//  - the linear-region VCVS model (R_i, A·v_d, R_o) driving a load R_L (a Thévenin divider);
//  - the three-region transfer curve under ±9 V or +9 V / 0 V, and the 3 mV input offset.

/* ------------------------------------------------------------- the two chips */

export type ChipKind = 'lm358' | 'lm741';
export type PinNo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type PinRole = 'out' | 'in' | 'pos' | 'neg' | 'null' | 'nc';
export type PinGroup = 'all' | 'power' | 'inputs' | 'outputs';

export interface PinInfo {
  /** short name on the stage */
  name: string;
  /** the sheet's table text */
  zh: string;
  role: PinRole;
}

export const PINS: Record<ChipKind, Record<PinNo, PinInfo>> = {
  lm358: {
    1: { name: 'OUT1', zh: 'OUT1（运放 A 输出）', role: 'out' },
    2: { name: 'IN1−', zh: 'IN1−（运放 A 反相输入 v₁）', role: 'in' },
    3: { name: 'IN1+', zh: 'IN1+（运放 A 同相输入 v₂）', role: 'in' },
    4: { name: 'V−/GND', zh: 'GND / V_EE（负电源或地）', role: 'neg' },
    5: { name: 'IN2+', zh: 'IN2+（运放 B 同相输入）', role: 'in' },
    6: { name: 'IN2−', zh: 'IN2−（运放 B 反相输入）', role: 'in' },
    7: { name: 'OUT2', zh: 'OUT2（运放 B 输出）', role: 'out' },
    8: { name: 'V+', zh: 'V_CC / V+（正电源）', role: 'pos' },
  },
  lm741: {
    1: { name: '调零', zh: 'Offset Null（失调调零，悬空不接）', role: 'null' },
    2: { name: 'IN−', zh: 'IN−（反相输入 v₁）', role: 'in' },
    3: { name: 'IN+', zh: 'IN+（同相输入 v₂）', role: 'in' },
    4: { name: 'V−', zh: 'V_EE / V−（负电源）', role: 'neg' },
    5: { name: '调零', zh: 'Offset Null（失调调零，悬空不接）', role: 'null' },
    6: { name: 'OUT', zh: 'OUT（唯一输出 v_o）', role: 'out' },
    7: { name: 'V+', zh: 'V_CC / V+（正电源）', role: 'pos' },
    8: { name: 'NC', zh: 'NC（空脚，无内部连接）', role: 'nc' },
  },
};

export const CHIP_NAME: Record<ChipKind, string> = { lm358: 'LM358', lm741: 'LM741' };
export const ALL_PINS: PinNo[] = [1, 2, 3, 4, 5, 6, 7, 8];

/** the pins of a highlight group */
export function pinsOf(chip: ChipKind, group: PinGroup): PinNo[] {
  const roles: Record<PinGroup, PinRole[]> = {
    all: ['out', 'in', 'pos', 'neg', 'null', 'nc'],
    power: ['pos', 'neg'],
    inputs: ['in'],
    outputs: ['out'],
  };
  return ALL_PINS.filter((p) => roles[group].includes(PINS[chip][p].role));
}

/** the positive-supply pin: Pin 8 on the LM358, Pin 7 on the LM741 (the sheet's 致命差异) */
export const vccPin = (chip: ChipKind): PinNo => (chip === 'lm358' ? 8 : 7);
/** both chips take the negative supply / ground on Pin 4 */
export const VEE_PIN: PinNo = 4;

/** stage id of a pin, as the shared Lm358 (and this lesson's Lm741) name them */
export const pinId = (chip: ChipKind, p: PinNo) => `chip_${chip}_p${p}`;

/** column of pins 1 and 8 on the 3D breadboard */
export const CHIP_C0 = 14;

/* ------------------------------------------------------------- Eq. (5.1): supply-rail KCL */

/** the sheet's quiescent current (1.0 mA, from +V_CC to −V_EE) and input bias currents (0.1 μA) */
export const IQ_MA = 1.0;
export const IBIAS_MA = 0.0001;

export type LoadMode = 'source' | 'sink';
/** the two cases of act 2: sourcing at v_o = +5 V, sinking at v_o = −4 V */
export const LOAD_VO: Record<LoadMode, number> = { source: 5, sink: -4 };

export interface Kcl {
  vo: number;
  rlK: number;
  /** all currents in mA, positive into the chip (i_o positive out of the output pin) */
  i1: number;
  i2: number;
  ip: number;
  im: number;
  io: number;
}

/** Act 2's two cases for a load R_L (kΩ). Sourcing: the quiescent 1 mA leaves through −V_EE
 *  (i_- = −1 mA) and Eq. (5.1) gives i_+. Sinking: the quiescent 1 mA enters at +V_CC (i_+ = +1 mA)
 *  and Eq. (5.1) gives i_-. */
export function kcl(mode: LoadMode, rlK: number): Kcl {
  const vo = LOAD_VO[mode];
  const io = vo / rlK;
  const i1 = IBIAS_MA;
  const i2 = IBIAS_MA;
  if (mode === 'source') {
    const im = -IQ_MA;
    return { vo, rlK, i1, i2, im, ip: io - i1 - i2 - im, io };
  }
  const ip = IQ_MA;
  return { vo, rlK, i1, i2, ip, im: io - i1 - i2 - ip, io };
}

/* ------------------------------------------------------------- the VCVS model (act 3) */

/** the sheet's model values: A = 10⁵, R_i = 2 MΩ, R_o = 75 Ω, ±9 V */
export const OPAMP = { A: 1e5, ri: 2e6, ro: 75, vcc: 9, vee: 9 };

export const dB = (a: number) => 20 * Math.log10(a);
export const fromDb = (adb: number) => Math.pow(10, adb / 20);

export interface Vcvs {
  /** differential input v_d = v₂ − v₁ (V) */
  vd: number;
  /** input current v_d / R_i (A) */
  iin: number;
  /** open-circuit VCVS voltage A·v_d (V) */
  voc: number;
  /** loaded output R_L / (R_o + R_L) · A·v_d (V) */
  vo: number;
  /** load current v_o / R_L (A) */
  io: number;
  /** share of A·v_d lost in R_o: R_o / (R_o + R_L) */
  eps: number;
}

/** linear-region VCVS driving R_L (Ω) */
export function vcvs(vd: number, rl: number, m = OPAMP): Vcvs {
  const voc = m.A * vd;
  const vo = (rl / (m.ro + rl)) * voc;
  return { vd, iin: vd / m.ri, voc, vo, io: vo / rl, eps: m.ro / (m.ro + rl) };
}

/* ------------------------------------------------------------- three regions (act 4) */

export type Supply = 'dual' | 'single';
export type Region = 'pos' | 'lin' | 'neg';

/** output limits. 'ideal': Sadiku's three-region model (the rails); 'lm358': what a real LM358
 *  reaches (V_CC − 1.5 V at the top; −8.9 V on ±9 V, about 10 mV above ground on +9 V / 0 V). */
export const SWING: Record<Supply, Record<'ideal' | 'lm358', [number, number]>> = {
  dual: { ideal: [-9, 9], lm358: [-8.9, 7.5] },
  single: { ideal: [0, 9], lm358: [0.01, 7.5] },
};

/** the sheet's typical input offset voltage */
export const VOS = 3e-3;

export interface Transfer {
  vd: number;
  /** A·v_d before clipping */
  lin: number;
  vo: number;
  region: Region;
}

export function transfer(vd: number, supply: Supply, model: 'ideal' | 'lm358' = 'ideal', A = OPAMP.A): Transfer {
  const [lo, hi] = SWING[supply][model];
  const lin = A * vd;
  const vo = Math.min(hi, Math.max(lo, lin));
  const region: Region = lin > hi ? 'pos' : lin < lo ? 'neg' : 'lin';
  return { vd, lin, vo, region };
}

/** the linear window [v_d−, v_d+] of the ideal model: −V_EE / A … +V_CC / A */
export function linearWindow(supply: Supply, A = OPAMP.A): [number, number] {
  const [lo, hi] = SWING[supply].ideal;
  return [lo / A, hi / A];
}

/** how many times the offset exceeds the saturation boundary V_CC / A */
export const kOs = (vos = VOS, vcc = OPAMP.vcc, A = OPAMP.A) => vos / (vcc / A);

/** the comparator of act 5: V_ref on v₁ (−), the signal on v₂ (+) */
export const VREF = 2.5;

/* ------------------------------------------------------------- formatting */

export const fmtMa = (ma: number, d = 4) => `${ma < 0 ? '−' : ma > 0 ? '+' : ''}${Math.abs(ma).toFixed(d)} mA`;
export const fmtV = (v: number, d = 3) => `${v < 0 ? '−' : v > 0 ? '+' : ''}${Math.abs(v).toFixed(d)} V`;
export const fmtUv = (v: number) => `${v < 0 ? '−' : v > 0 ? '+' : ''}${Math.round(Math.abs(v) * 1e6)} μV`;
export function fmtPa(a: number) {
  const pa = a * 1e12;
  return `${pa < 0 ? '−' : ''}${Math.abs(pa).toFixed(Math.abs(pa) < 10 ? 1 : 0)} pA`;
}
export const REGION_ZH: Record<Region, string> = { pos: '正饱和区', lin: '线性放大区', neg: '负饱和区' };
