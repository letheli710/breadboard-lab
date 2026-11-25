// W1-L2's stage arithmetic: the passive sign convention on a generic two-terminal element (layer
// 01) and the four dependent sources (layer 02). Pure functions, shared by the layers and the test.

/** Layer 01 settings: terminal voltage v, branch current i, which end the + reference sits on,
 *  which end the current reference arrow enters, and how long the element runs. */
export interface PscInput {
  v: number;
  i: number;
  /** the voltage reference reads "+ at the top, − at the bottom" */
  topPlus: boolean;
  /** the current reference arrow enters the element at its top end */
  iEntersTop: boolean;
  /** Δt in seconds */
  dt: number;
}

export interface PscResult {
  /** the reference current enters at the + reference (the passive sign convention holds) */
  entersPlus: boolean;
  /** +1 (p = +vi) or −1 (p = −vi) */
  sign: 1 | -1;
  /** absorbed power, W */
  p: number;
  /** energy absorbed over Δt, J */
  w: number;
  /** the same energy in kWh */
  kwh: number;
  mode: 'absorb' | 'supply' | 'zero';
}

const clean = (x: number) => (Math.abs(x) < 1e-12 ? 0 : x);

export function psc({ v, i, topPlus, iEntersTop, dt }: PscInput): PscResult {
  const entersPlus = topPlus === iEntersTop;
  const sign = entersPlus ? 1 : -1;
  const p = clean(sign * v * i);
  const w = clean(p * dt);
  return { entersPlus, sign, p, w, kwh: w / 3.6e6, mode: p > 0 ? 'absorb' : p < 0 ? 'supply' : 'zero' };
}

export type DepType = 'VCVS' | 'CCVS' | 'VCCS' | 'CCCS';

export interface DepSpec {
  type: DepType;
  name: string;
  /** controlling quantity: a voltage v_x or a current i_x */
  ctrl: 'v' | 'i';
  /** controlled output: a voltage v_s or a current i_s */
  out: 'v' | 'i';
  /** gain symbol and its unit */
  gain: string;
  gainUnit: string;
  gainNote: string;
  /** hover-map id of the gain */
  gainId: string;
}

export const DEP: Record<DepType, DepSpec> = {
  VCVS: { type: 'VCVS', name: '电压控制电压源', ctrl: 'v', out: 'v', gain: 'μ', gainUnit: 'V/V', gainNote: '无量纲', gainId: 'vcvs_opamp' },
  CCVS: { type: 'CCVS', name: '电流控制电压源', ctrl: 'i', out: 'v', gain: 'r', gainUnit: 'Ω', gainNote: '跨阻 V/A', gainId: 'ccvs_transres' },
  VCCS: { type: 'VCCS', name: '电压控制电流源', ctrl: 'v', out: 'i', gain: 'g', gainUnit: 'S', gainNote: '跨导 A/V', gainId: 'vccs_transcond' },
  CCCS: { type: 'CCCS', name: '电流控制电流源', ctrl: 'i', out: 'i', gain: 'β', gainUnit: 'A/A', gainNote: '无量纲', gainId: 'cccs_beta' },
};

export const DEP_TYPES: DepType[] = ['VCVS', 'CCVS', 'VCCS', 'CCCS'];

export interface DepResult {
  /** the controlled output (v_s in V or i_s in A) */
  out: number;
  /** terminal voltage and current of the source; the current leaves at its + end */
  vs: number;
  is: number;
  /** power the source absorbs, W (negative: it delivers) */
  ps: number;
}

/** A dependent source driving a test load. `ext` is the quantity the outside circuit sets: the
 *  current leaving the + end (voltage-type source) or the voltage across it, + at the arrow's
 *  end (current-type source). Either way the current leaves the + end, so p_s = −v_s·i_s. */
export function dep(type: DepType, x: number, k: number, ext: number): DepResult {
  const out = clean(k * x);
  const vs = DEP[type].out === 'v' ? out : ext;
  const is = DEP[type].out === 'v' ? ext : out;
  return { out, vs, is, ps: clean(-vs * is) };
}

/** A number for the readouts: at most `d` decimals, a real minus sign. */
export function fmt(x: number, d = 2): string {
  const s = String(Number(clean(x).toFixed(d)));
  return s.replace('-', '−');
}

/** Signed number with an explicit + for positive values. */
export const fmtSigned = (x: number, d = 2) => (x > 0 ? `+${fmt(x, d)}` : fmt(x, d));
