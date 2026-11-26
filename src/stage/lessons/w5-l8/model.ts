// W5-L8's circuit model, shared by the three stage layers, the readouts and model.test.ts.
// - normalised resonance (u = ω/ω0): |H(u)| = 1/√(1 + Q²(u − 1/u)²), the exact half-power points
//   u1,2 = ∓1/(2Q) + √(1/(4Q²) + 1) and the high-Q approximation 1 ∓ 1/(2Q);
// - the series and parallel RLC phasors at u (layer 01), normalised to V_m = 1 (series) or
//   I_m = 1 (parallel) and R = 1;
// - the bench (layer 03): a 函数信号发生器 (sine, EMF V_pp/2, output resistance R_gen) driving
//   R = 100 Ω, L = 10 mH (copper resistance R_L) and C = 100 nF in series; CH1 is the generator's
//   output terminal, CH2 the voltage across R or across C (whichever sits at the bottom, on GND).
//   The layer's scope traces and its sweep curve both come from bench().

/* ------------------------------------------------------------- complex numbers */

export interface Cx {
  re: number;
  im: number;
}
export const cx = (re: number, im = 0): Cx => ({ re, im });
export const add = (a: Cx, b: Cx): Cx => cx(a.re + b.re, a.im + b.im);
export const sub = (a: Cx, b: Cx): Cx => cx(a.re - b.re, a.im - b.im);
export const mul = (a: Cx, b: Cx): Cx => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export function div(a: Cx, b: Cx): Cx {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
}
export const mag = (a: Cx) => Math.hypot(a.re, a.im);
/** angle in degrees, (−180, 180] */
export const angDeg = (a: Cx) => (Math.atan2(a.im, a.re) * 180) / Math.PI;
export function wrapDeg(d: number): number {
  let x = d % 360;
  if (x <= -180) x += 360;
  if (x > 180) x -= 360;
  return x;
}

/* ------------------------------------------------------------- normalised resonance */

export const Q_RANGE: [number, number] = [1, 20];
export const U_RANGE: [number, number] = [0.5, 2];
export const PRESET_Q = [2, 5, 10] as const;

/** |I(ω)/I_max| of a series RLC (= |V(ω)/V_max| of a parallel RLC) at u = ω/ω0 */
export const resp = (u: number, q: number) => 1 / Math.sqrt(1 + q * q * (u - 1 / u) ** 2);

/** exact half-power points (u1, u2) and the high-Q approximation */
export function halfPower(q: number) {
  const a = 1 / (2 * q);
  const r = Math.sqrt(a * a + 1);
  const u1 = -a + r;
  const u2 = a + r;
  const a1 = 1 - a;
  const a2 = 1 + a;
  return { u1, u2, a1, a2, bw: u2 - u1, err1: ((u1 - a1) / u1) * 100, err2: ((u2 - a2) / u2) * 100, gm: Math.sqrt(u1 * u2) };
}

/** series RLC phasors at u, with V_s = 1∠0°, R = 1 (so I_max = 1 and |V_L(ω0)| = |V_C(ω0)| = Q) */
export function seriesPhasors(u: number, q: number) {
  const z = cx(1, q * (u - 1 / u));
  const i = div(cx(1), z);
  return { z, i, vr: i, vl: mul(cx(0, q * u), i), vc: mul(cx(0, -q / u), i) };
}

/** parallel RLC phasors at u, with I_s = 1∠0°, R = 1 (so V_max = 1 and |I_L(ω0)| = |I_C(ω0)| = Q) */
export function parallelPhasors(u: number, q: number) {
  const y = cx(1, q * (u - 1 / u));
  const v = div(cx(1), y);
  return { y, v, ir: v, ic: mul(cx(0, q * u), v), il: mul(cx(0, -q / u), v) };
}

/** 'cap' (capacitive), 'res' (at resonance), 'ind' (inductive) for a series circuit at u */
export function seriesCharacter(u: number): 'cap' | 'res' | 'ind' {
  if (Math.abs(u - 1) < 0.005) return 'res';
  return u < 1 ? 'cap' : 'ind';
}

/* ------------------------------------------------------------- general series / parallel RLC */

export const w0Of = (l: number, c: number) => 1 / Math.sqrt(l * c);
export const seriesQ = (r: number, l: number, c: number) => Math.sqrt(l / c) / r;
export const parallelQ = (r: number, l: number, c: number) => r / Math.sqrt(l / c);

/** exact half-power angular frequencies for a damping term a (R/(2L) series, 1/(2RC) parallel) */
export function halfPowerW(a: number, w0: number): [number, number] {
  const r = Math.sqrt(a * a + w0 * w0);
  return [r - a, r + a];
}

/** the capacitor voltage of a series RLC as a multiple of V_m: (Q/u)/√(1 + Q²(u − 1/u)²) */
export const vcRatio = (u: number, q: number) => q / u / Math.sqrt(1 + q * q * (u - 1 / u) ** 2);

/** where |V_C| peaks (u_c = √(1 − 1/(2Q²)), Q > 1/√2) and its value Q/√(1 − 1/(4Q²)) */
export function vcPeak(q: number) {
  return { u: Math.sqrt(1 - 1 / (2 * q * q)), ratio: q / Math.sqrt(1 - 1 / (4 * q * q)) };
}

/* ------------------------------------------------------------- the bench */

export const LAB = { R: 100, L: 10e-3, C: 100e-9, RL: 20, RGEN: 50, C_RATED: 50, P_RATED: 0.25 } as const;
export const F_RANGE: [number, number] = [1000, 15000];
export const F_STEP = 10;
export const VPP_RANGE: [number, number] = [0.2, 2];
export const LAB_W0 = w0Of(LAB.L, LAB.C);
export const LAB_F0 = LAB_W0 / (2 * Math.PI);
export const LAB_X0 = Math.sqrt(LAB.L / LAB.C);
/** the frequency window around f0 in which the scope shows the "谐振锁定" badge */
export const LOCK_HZ = 30;

export type Probe = 'vR' | 'vC';

export interface Bench {
  f: number;
  vpp: number;
  probe: Probe;
  para: boolean;
  rEff: number;
  q: number;
  /** half-power frequencies and bandwidth of the loop (Hz) */
  f1: number;
  f2: number;
  bf: number;
  /** generator EMF, loop current, and the phasors at the generator terminal (CH1) and on CH2 */
  i: Cx;
  ch1: Cx;
  ch2: Cx;
  vR: Cx;
  vC: Cx;
  vL: Cx;
  ch1pp: number;
  ch2pp: number;
  /** phase of CH2 relative to CH1 (degrees) */
  dphi: number;
  /** peak current (A), resistor power (W, average), capacitor / inductor peak voltage (V) */
  iPk: number;
  pR: number;
  vcPk: number;
  vlPk: number;
  locked: boolean;
}

export function bench(f: number, vpp: number, probe: Probe, para: boolean): Bench {
  const rl = para ? LAB.RL : 0;
  const rg = para ? LAB.RGEN : 0;
  const rEff = LAB.R + rl + rg;
  const w = 2 * Math.PI * f;
  const vs = cx(vpp / 2);
  const z = cx(rEff, w * LAB.L - 1 / (w * LAB.C));
  const i = div(vs, z);
  const ch1 = sub(vs, mul(i, cx(rg)));
  const vR = mul(i, cx(LAB.R));
  const vC = mul(i, cx(0, -1 / (w * LAB.C)));
  const vL = mul(i, cx(rl, w * LAB.L));
  const ch2 = probe === 'vR' ? vR : vC;
  const [w1, w2] = halfPowerW(rEff / (2 * LAB.L), LAB_W0);
  const iPk = mag(i);
  return {
    f,
    vpp,
    probe,
    para,
    rEff,
    q: LAB_X0 / rEff,
    f1: w1 / (2 * Math.PI),
    f2: w2 / (2 * Math.PI),
    bf: (w2 - w1) / (2 * Math.PI),
    i,
    ch1,
    ch2,
    vR,
    vC,
    vL,
    ch1pp: 2 * mag(ch1),
    ch2pp: 2 * mag(ch2),
    dphi: wrapDeg(angDeg(ch2) - angDeg(ch1)),
    iPk,
    pR: 0.5 * iPk * iPk * LAB.R,
    vcPk: mag(vC),
    vlPk: mag(vL),
    locked: Math.abs(f - LAB_F0) <= LOCK_HZ,
  };
}

/** CH2's peak-to-peak value across the sweep range (log-spaced), for the sweep record */
export function sweep(vpp: number, probe: Probe, para: boolean, n = 160): { f: number; pp: number }[] {
  const [a, b] = F_RANGE;
  return Array.from({ length: n + 1 }, (_, k) => {
    const f = a * Math.pow(b / a, k / n);
    return { f, pp: bench(f, vpp, probe, para).ch2pp };
  });
}

/** scope settings: a 1-2-5 time base that shows about 2.5 periods, one V/div for both channels */
export function scopeScale(f: number, maxPp: number) {
  const tbs = [10e-6, 20e-6, 50e-6, 100e-6, 200e-6, 500e-6];
  const T = 1 / f;
  let tdiv = tbs[0];
  for (const t of tbs) if (Math.abs(Math.log((10 * t) / T / 2.5)) < Math.abs(Math.log((10 * tdiv) / T / 2.5))) tdiv = t;
  const vds = [0.1, 0.2, 0.5, 1, 2];
  const vdiv = vds.find((v) => maxPp / v <= 6.8) ?? 2;
  return { tdiv, vdiv };
}

/* ------------------------------------------------------------- formatting */

export const fmtHz = (f: number) => (f >= 1000 ? `${(f / 1000).toFixed(2)} kHz` : `${Math.round(f)} Hz`);
export const fmtVpp = (v: number) => `${v.toFixed(2)} Vpp`;
export const fmtDeg = (d: number) => `${d >= 0.05 ? '+' : d <= -0.05 ? '−' : ''}${Math.abs(d).toFixed(1)}°`;
export const fmtNum = (x: number, d: number) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(d);
