// W1-L7's circuit model, shared by the three stage layers: the topology and slider values (stage
// params, so the acts and every layer see the same circuit) and what follows from them —
// equivalent resistance, currents, voltages, powers, the multimeter reading and the colour bands.
// Pure functions, no React / three.js (model.test.ts checks the lesson sheet's numbers).

import { COLOR_BY_KEY, COLORS } from '../../colorCode';

export type Topo = 'series_vdiv' | 'parallel_cdiv' | 'loaded_vdiv' | 'mixed_socratic' | 'parallel3';
/** board: slider values are kΩ (the 1000× safe values); textbook: the same numbers in Ω */
export type Scale = 'board' | 'textbook';
export type Meter = 'V' | 'mA';

export const TOPOS: { value: Topo; label: string; short: string; formula: string }[] = [
  { value: 'series_vdiv', label: '串联分压 (R1 + R2)', short: '串联分压', formula: 'R1+R2' },
  { value: 'parallel_cdiv', label: '并联分流 (R1 || R2)', short: '并联分流', formula: 'R1||R2' },
  { value: 'loaded_vdiv', label: '带载分压 (R1 + R2||RL)', short: '带载分压', formula: 'R1+R2||RL' },
  { value: 'mixed_socratic', label: '混联例题 (R1 + R2||R3)', short: '混联例题', formula: 'R1+R2||R3' },
  { value: 'parallel3', label: '三支路并联 (R1||R2||R3)', short: '三支路并联', formula: 'R1||R2||R3' },
];

/** Default stage params (the sheet's ctrl_* defaults). */
export const DEFAULTS = { topo: 'series_vdiv' as Topo, vs: 9, r1: 2, r2: 4, rl: 4, r3: 3, scale: 'board' as Scale, meter: 'V' as Meter };

/** 1/4 W carbon film: safe below 125 mW, burns above 250 mW */
export const P_SAFE = 0.125;
export const P_MAX = 0.25;

export interface Part {
  /** hover id of the resistor: tok_r1, tok_r2, tok_rl, tok_r3 */
  id: string;
  name: 'R1' | 'R2' | 'RL' | 'R3';
  ohms: number;
  /** voltage across it (V) and current through it (A) */
  v: number;
  i: number;
  /** power (W) */
  p: number;
}

export interface Solution {
  topo: Topo;
  scale: Scale;
  vs: number;
  /** equivalent resistance seen by the source (Ω) and the source current (A) */
  req: number;
  i: number;
  parts: Part[];
  /** voltage of the node between R1 and the lower arm (series / loaded / mixed), else vs */
  vmid: number;
  /** no-load output vs·R2/(R1+R2) */
  vNoLoad: number;
  /** the load (RL, or R3 in the mixed example) in Ω, when the topology has one */
  load?: number;
}

/** Ohms of a slider value in the given scale. */
export const ohmsOf = (k: number, scale: Scale) => (scale === 'board' ? k * 1000 : k);

const par = (...rs: number[]) => 1 / rs.reduce((s, r) => s + 1 / r, 0);

export function solve(topo: Topo, vs: number, r1k: number, r2k: number, rlk: number, r3k: number, scale: Scale): Solution {
  const R1 = ohmsOf(r1k, scale);
  const R2 = ohmsOf(r2k, scale);
  const RL = ohmsOf(rlk, scale);
  const R3 = ohmsOf(r3k, scale);
  const part = (id: string, name: Part['name'], ohms: number, v: number): Part => ({ id, name, ohms, v, i: v / ohms, p: (v * v) / ohms });
  const vNoLoad = (vs * R2) / (R1 + R2);
  if (topo === 'series_vdiv') {
    const req = R1 + R2;
    const i = vs / req;
    return { topo, scale, vs, req, i, vmid: i * R2, vNoLoad, parts: [part('tok_r1', 'R1', R1, i * R1), part('tok_r2', 'R2', R2, i * R2)] };
  }
  if (topo === 'parallel_cdiv') {
    const req = par(R1, R2);
    return { topo, scale, vs, req, i: vs / req, vmid: vs, vNoLoad, parts: [part('tok_r1', 'R1', R1, vs), part('tok_r2', 'R2', R2, vs)] };
  }
  if (topo === 'parallel3') {
    const req = par(R1, R2, R3);
    return { topo, scale, vs, req, i: vs / req, vmid: vs, vNoLoad, parts: [part('tok_r1', 'R1', R1, vs), part('tok_r2', 'R2', R2, vs), part('tok_r3', 'R3', R3, vs)] };
  }
  // loaded divider and the mixed example: R1 in series with R2 || load
  const mixed = topo === 'mixed_socratic';
  const load = mixed ? R3 : RL;
  const r2l = par(R2, load);
  const req = R1 + r2l;
  const i = vs / req;
  const vout = i * r2l;
  return {
    topo,
    scale,
    vs,
    req,
    i,
    vmid: vout,
    vNoLoad,
    load,
    parts: [part('tok_r1', 'R1', R1, i * R1), part('tok_r2', 'R2', R2, vout), mixed ? part('tok_r3', 'R3', R3, vout) : part('tok_rl', 'RL', RL, vout)],
  };
}

/** Output of the loaded divider for a load ratio a = RL / R2 (the loading curve). */
export const vLoaded = (vs: number, r1: number, r2: number, a: number) => {
  const r2l = (a / (1 + a)) * r2;
  return (vs * r2l) / (r1 + r2l);
};

export const isDivider = (t: Topo) => t === 'series_vdiv' || t === 'loaded_vdiv' || t === 'mixed_socratic';

/* ------------------------------------------------------------- formatting */

const fix = (x: number, d = 2) => (Math.abs(x) < 1e-12 ? 0 : x).toFixed(d);

export const fmtV = (v: number) => `${fix(v)} V`;

/** 4.50 mA, 1.50 A, 820 µA */
export function fmtI(a: number): string {
  if (Math.abs(a) >= 1) return `${fix(a)} A`;
  if (Math.abs(a) >= 1e-3) return `${fix(a * 1e3)} mA`;
  return `${fix(a * 1e6, 0)} µA`;
}

/** 9.00 mW, 4.50 W */
export function fmtP(w: number): string {
  if (Math.abs(w) >= 1) return `${fix(w)} W`;
  if (Math.abs(w) >= 1e-3) return `${fix(w * 1e3)} mW`;
  return `${fix(w * 1e6, 0)} µW`;
}

/** 2 kΩ, 1.33 kΩ, 2 Ω, 0.5 Ω */
export function fmtR(ohms: number): string {
  const s = (x: number) => String(Number(x.toPrecision(3)));
  if (ohms >= 1e3) return `${s(ohms / 1e3)} kΩ`;
  return `${s(ohms)} Ω`;
}

/** The slider value as text in the given scale: "2 kΩ" or "2 Ω". */
export const fmtSlider = (k: number, scale: Scale) => `${k} ${scale === 'board' ? 'kΩ' : 'Ω'}`;

export type Heat = 'ok' | 'warm' | 'smoke';
export const heatOf = (p: number): Heat => (p > P_MAX ? 'smoke' : p > P_SAFE ? 'warm' : 'ok');

/* ------------------------------------------------------------- multimeter */

export interface Reading {
  /** what the LCD shows */
  display: string;
  unit: string;
  /** hover id of the measured quantity */
  id: string;
  /** what is measured, one line */
  what: string;
  /** the mA range is overloaded (its 200 mA fuse blows) */
  blown: boolean;
}

/** mA range of the meter: 200 mA, fused */
const MA_RANGE = 0.2;

export function readingOf(s: Solution, meter: Meter): Reading {
  if (meter === 'V') {
    if (s.topo === 'parallel_cdiv' || s.topo === 'parallel3') return { display: s.vs.toFixed(2), unit: 'V', id: 'tok_vs', what: '并联两端电压（b8 对 GND）', blown: false };
    const what = s.topo === 'series_vdiv' ? '中间分压节点 v2（b12 对 b19）' : s.topo === 'loaded_vdiv' ? '带载输出 v_out（b12 对 b19）' : 'Node A 电压（b12 对 b19）';
    return { display: s.vmid.toFixed(2), unit: 'V', id: 'tok_v2', what, blown: false };
  }
  let a = s.i;
  let id = 'tok_i';
  let what = '干路总电流 i（断开 J2，表串入 a19 → GND）';
  if (s.topo === 'parallel_cdiv' || s.topo === 'parallel3') {
    a = s.parts[0].i;
    id = 'tok_i1';
    what = '支路 1 电流 i1（表串入 j8 → GND）';
  } else if (s.topo === 'mixed_socratic') {
    a = s.parts[2].i;
    id = 'tok_io';
    what = 'R3 支路电流 i_o（表串入 a25 → GND）';
  }
  if (a > MA_RANGE) return { display: 'FUSE', unit: '', id, what: `${fmtI(a)} 超出 200 mA 档，保险丝熔断`, blown: true };
  return { display: (a * 1e3).toFixed(2), unit: 'mA', id, what, blown: false };
}

/* ------------------------------------------------------------- colour bands */

/** Band colour keys of a resistance: 4 bands for two significant digits, 5 (1 %) for three. */
export function bandsOf(ohms: number): string[] {
  const digitKey = (d: number) => COLORS.find((c) => c.digit === d)!.key;
  const expKey = (e: number) => COLORS.find((c) => c.exp === e)!.key;
  for (const n of [2, 3]) {
    const e = Math.floor(Math.log10(ohms)) - (n - 1);
    const sig = Math.round(ohms / Math.pow(10, e));
    if (Math.abs(sig * Math.pow(10, e) - ohms) < 1e-6 * ohms && e >= -2) {
      const digits = String(sig).split('').map(Number);
      return [...digits.map(digitKey), expKey(e), n === 2 ? 'gold' : 'brown'];
    }
  }
  return ['brown', 'black', 'black', 'gold'];
}

export const bandsText = (keys: string[]) => keys.map((k) => COLOR_BY_KEY.get(k)!.zh).join('-');
export const bandsHex = (keys: string[]) => keys.map((k) => COLOR_BY_KEY.get(k)!.hex);

/* ------------------------------------------------------------- colours */

/** Node potential colour: GND cool blue → amber at half → warm red at Vs. */
export function potentialColor(frac: number): string {
  const f = Math.min(1, Math.max(0, frac));
  const stops: [number, number, number][] = [
    [37, 99, 235],
    [217, 119, 6],
    [220, 38, 38],
  ];
  const [a, b, t] = f < 0.5 ? [stops[0], stops[1], f / 0.5] : [stops[1], stops[2], (f - 0.5) / 0.5];
  const c = a.map((x, k) => Math.round(x + (b[k] - x) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
