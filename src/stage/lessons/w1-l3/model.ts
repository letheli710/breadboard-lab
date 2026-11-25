// W1-L3's circuit model, shared by the three layers, the control dock and the telemetry bar:
// a DC source v_s across the resistor R (optionally through a 1 kΩ protective resistor R_s), with
// the open (R → ∞) and short (R → 0) limits. Stage params (useStageParam): v, r, limit, psc, rs,
// cutaway, e12 — acts set them on scroll, the dock changes them.

import { useStageParam } from '../../stageStore';

export type Limit = 'none' | 'open' | 'short';

/** the 1/4 W rating of the kit's carbon-film resistors */
export const P_RATED = 0.25;
/** the protective series resistor of act 5 */
export const RS = 1000;
export const V_MAX = 12;
export const R_MIN = 10;
export const R_MAX = 100_000;
/** the VI plane's current range, A */
export const I_MAX = 0.05;

export interface Solved {
  vs: number;
  /** resistance of the element under test (0 short, Infinity open) */
  rEff: number;
  /** voltage across the element, + at the top / left lead (the reference polarity) */
  vR: number;
  /** physical current through the element from its + to its − terminal (Infinity: an ideal source shorted) */
  iPhys: number;
  /** the reference current's algebraic value: iPhys (PSC) or −iPhys (non-PSC) */
  iRef: number;
  /** conductance, S (Infinity for the short) */
  g: number;
  /** power the element absorbs, W (≥ 0) */
  p: number;
  /** p over the 1/4 W rating */
  eta: number;
  overload: boolean;
  /** an ideal source shorted with nothing in series: current unbounded */
  dead: boolean;
}

export function solve(vs: number, r: number, limit: Limit, psc: boolean, rs: boolean): Solved {
  const rEff = limit === 'open' ? Infinity : limit === 'short' ? 0 : r;
  const rSeries = rs ? RS : 0;
  let iPhys: number;
  let vR: number;
  if (limit === 'open') {
    iPhys = 0;
    vR = vs;
  } else if (limit === 'short') {
    iPhys = rSeries > 0 ? vs / rSeries : vs === 0 ? 0 : Math.sign(vs) * Infinity;
    vR = 0;
  } else {
    iPhys = vs / (rEff + rSeries);
    vR = iPhys * rEff;
  }
  const p = limit === 'none' ? vR * iPhys : 0;
  const dead = limit === 'short' && !rs && vs !== 0;
  return { vs, rEff, vR, iPhys, iRef: psc ? iPhys : -iPhys, g: 1 / rEff, p, eta: p / P_RATED, overload: p > P_RATED, dead };
}

/** All stage settings of the lesson, with setters. */
export function useOhm() {
  const [v, setV] = useStageParam<number>('v', 9);
  const [r, setR] = useStageParam<number>('r', 1000);
  const [limit, setLimit] = useStageParam<Limit>('limit', 'none');
  const [psc, setPsc] = useStageParam<boolean>('psc', true);
  const [rs, setRs] = useStageParam<boolean>('rs', false);
  const [cutaway, setCutaway] = useStageParam<boolean>('cutaway', false);
  const [e12, setE12] = useStageParam<boolean>('e12', true);
  const s = solve(v, r, limit, psc, rs);
  return { v, setV, r, setR, limit, setLimit, psc, setPsc, rs, setRs, cutaway, setCutaway, e12, setE12, s };
}

/* ------------------------------------------------------------- E12 and the colour code */

const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
/** E12 values from 10 Ω to 100 kΩ */
export const E12_VALUES: number[] = [...[1, 10, 100, 1000].flatMap((m) => E12.map((d) => d * m)), 100_000];

export const nearestE12 = (r: number) => E12_VALUES.reduce((a, b) => (Math.abs(Math.log(b / r)) < Math.abs(Math.log(a / r)) ? b : a));

/** slider position 0 … 1 of a resistance on the log scale */
export const rToPos = (r: number) => Math.log10(r / R_MIN) / Math.log10(R_MAX / R_MIN);
export const posToR = (p: number) => R_MIN * Math.pow(R_MAX / R_MIN, p);

export const BAND_HEX: Record<string, string> = {
  black: '#151515',
  brown: '#7a4a1f',
  red: '#c0261b',
  orange: '#f07a1a',
  yellow: '#f2cf1d',
  green: '#2f9a45',
  blue: '#2b59c3',
  violet: '#7c3aed',
  grey: '#8a8f98',
  white: '#f8f8f6',
  gold: '#d4a72c',
};
const DIGIT_KEYS = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'];
const ZH: Record<string, string> = { black: '黑', brown: '棕', red: '红', orange: '橙', yellow: '黄', green: '绿', blue: '蓝', violet: '紫', grey: '灰', white: '白', gold: '金' };

export interface BandRead {
  keys: [string, string, string, string];
  /** the value the bands encode (two significant digits) */
  ohms: number;
  /** the bands only approximate r (it is not a two-digit value) */
  approx: boolean;
  /** "棕 = 1", "黑 = 0", "红 = ×10²", "金 = ±5%" */
  meanings: string[];
  /** "棕-黑-红-金" */
  names: string;
}

const SUP = (n: number) => String(n).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);

/** The four bands of a resistance (10 Ω … 100 kΩ, rounded to two significant digits; 4th band gold ±5%). */
export function bandsOf(r: number): BandRead {
  let exp = Math.floor(Math.log10(r)) - 1;
  let d = Math.round(r / Math.pow(10, exp));
  if (d >= 100) {
    d = 10;
    exp += 1;
  }
  exp = Math.max(0, exp);
  const keys: [string, string, string, string] = [DIGIT_KEYS[Math.floor(d / 10)], DIGIT_KEYS[d % 10], DIGIT_KEYS[exp], 'gold'];
  const ohms = d * Math.pow(10, exp);
  return {
    keys,
    ohms,
    approx: Math.abs(ohms - r) / r > 0.001,
    meanings: [`${ZH[keys[0]]} = ${Math.floor(d / 10)}`, `${ZH[keys[1]]} = ${d % 10}`, `${ZH[keys[2]]} = ×10${SUP(exp)}`, '金 = ±5%'],
    names: keys.map((k) => ZH[k]).join('-'),
  };
}

/* ------------------------------------------------------------- number formatting */

/** 3 significant digits ("9.00", "27.3", "405") */
export const sig3 = (x: number) => {
  const a = Math.abs(x);
  if (a === 0) return '0';
  if (a >= 100) return x.toFixed(0);
  if (a >= 10) return x.toFixed(1);
  return x.toFixed(2);
};

const PREFIXES: [number, string, string][] = [
  [1, '', ''],
  [1e-3, 'm', 'm'],
  [1e-6, 'µ', '\\mu'],
];

/** A value with an auto prefix (A / mA / µA, S / mS / µS, W / mW): plain text and TeX. */
export function si(x: number, unit: string): { text: string; tex: string } {
  if (!Number.isFinite(x)) return { text: x < 0 ? '−∞' : '∞', tex: x < 0 ? '-\\infty' : '\\infty' };
  const a = Math.abs(x);
  const [f, p, pt] = a === 0 ? PREFIXES[0] : (PREFIXES.find(([k]) => a >= k * 0.9995) ?? PREFIXES[2]);
  const n = sig3(x / f).replace('-', '−');
  const nt = sig3(x / f);
  const texUnit = pt === '\\mu' ? `\\ \\mu\\text{${unit}}` : `\\text{ ${p}${unit}}`;
  return { text: `${n} ${p}${unit}`, tex: `${nt}${texUnit}` };
}

/** Resistance: "1.00 kΩ", "324 Ω", "100 kΩ" (and TeX). */
export function ohms(r: number): { text: string; tex: string } {
  if (!Number.isFinite(r)) return { text: '∞', tex: '\\infty' };
  if (r === 0) return { text: '0 Ω', tex: '0\\ \\Omega' };
  if (r >= 1000) return { text: `${sig3(r / 1000)} kΩ`, tex: `${sig3(r / 1000)}\\text{ k}\\Omega` };
  return { text: `${sig3(r)} Ω`, tex: `${sig3(r)}\\ \\Omega` };
}

/** Voltage with sign: "+9.0 V", "−3.5 V" (the slider's 0.5 V steps). */
export const volts = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)} V`;

/** Particle speed: animation period (s) of the current dots, log-compressed so 0.1 mA … 90 mA all show. */
export function flowPeriod(i: number): number {
  const a = Math.abs(i);
  if (!(a > 0)) return 0;
  if (!Number.isFinite(a)) return 0.25;
  const k = Math.min(1, Math.max(0, Math.log10(a / 1e-4) / Math.log10(0.09 / 1e-4)));
  return 6 - 5.3 * k;
}
