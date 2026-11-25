// W4-L5 numbers: the first-order step response (three-element formula), the breadboard RC kit
// (5 V, 10 kΩ, 100 µF), Sadiku 7.5 (RC, SPDT switch) and Sadiku 7.6 (RL, switch across R_2) of
// the lesson sheet, the 1000× breadboard scaling of 7.5, and the oscilloscope traces of the
// 3D bench (safe common-ground probes, the floating-clip hazard, the function generator's square
// wave). Pure functions: the layers, the tests and the lesson text use the same values.

/** x(t) = x(∞) + [x(0⁺) − x(∞)] e^(−t/τ), t ≥ 0 */
export function threeElement(x0p: number, xInf: number, tau: number, t: number): number {
  return xInf + (x0p - xInf) * Math.exp(-t / tau);
}

/* ------------------------------------------------------------------ the breadboard RC kit */

/** act 2 / act 5 kit: 台式可调直流电源（5 V）, R = 10 kΩ (brown-black-orange-gold), C = 100 µF electrolytic */
export const KIT = { vs: 5, r: 10e3, c: 100e-6 } as const;
export const KIT_TAU = KIT.r * KIT.c; // 1.0 s

/** RC charge from V_0 towards Vs: vC(t), iC(t) (= current through R, towards C) */
export function rcStep(vs: number, r: number, c: number, v0: number, t: number): { vc: number; ic: number; vr: number } {
  const tau = r * c;
  const vc = threeElement(v0, vs, tau, t);
  const ic = ((vs - v0) / r) * Math.exp(-t / tau);
  return { vc, ic, vr: vs - vc };
}

/** the Boylestad milestones of act 2: t = 0⁺, 1τ … 5τ with the kit */
export const MILESTONES = [0, 1, 2, 3, 4, 5].map((n) => {
  const { vc, ic } = rcStep(KIT.vs, KIT.r, KIT.c, 0, n * KIT_TAU);
  return { n, pct: (1 - Math.exp(-n)) * 100, vc, ic };
});

/** peak power in R: Vs² / R at t = 0⁺ (2.5 mW) */
export const KIT_PEAK_P = (KIT.vs * KIT.vs) / KIT.r;

/** act 1 ③: v_s(t) = 5[u(t) − u(t − 5)] V */
export const unitStep = (t: number) => (t > 0 ? 1 : 0);
export const pulse = (t: number) => KIT.vs * (unitStep(t) - unitStep(t - 5));

/* ------------------------------------------------------------------ Sadiku 7.5 (RC, SPDT) */

export const EX75 = { v1: 18, r1: 3, r2: 6, c: 0.25, v2: 36, r3: 6, r4: 12 } as const;

export interface Ex75 {
  vc0: number;
  i30m: number;
  rth: number;
  vth: number;
  tau: number;
  vcInf: number;
  i30p: number;
  i3Inf: number;
  ic0p: number;
  /** node B (the R_3–R_4 junction) before the switch moves: V2 R_4 / (R_3 + R_4) */
  vb0m: number;
  vc: (t: number) => number;
  i3: (t: number) => number;
  ic: (t: number) => number;
  i4: (t: number) => number;
}

/** Sadiku 7.5 with every resistor × k and C ÷ k (k = 1 theory, k = 1000 the breadboard) */
export function ex75(k = 1): Ex75 {
  const { v1, v2 } = EX75;
  const r1 = EX75.r1 * k;
  const r2 = EX75.r2 * k;
  const r3 = EX75.r3 * k;
  const r4 = EX75.r4 * k;
  const c = EX75.c / k;
  const vc0 = (v1 * r2) / (r1 + r2);
  const i30m = v2 / (r3 + r4);
  const rth = (r3 * r4) / (r3 + r4);
  const vth = (v2 * r4) / (r3 + r4);
  const tau = rth * c;
  const vc = (t: number) => threeElement(vc0, vth, tau, t);
  const i30p = (v2 - vc0) / r3;
  const i3Inf = (v2 - vth) / r3;
  const i3 = (t: number) => threeElement(i30p, i3Inf, tau, t);
  const i4 = (t: number) => vc(t) / r4;
  const ic = (t: number) => i3(t) - i4(t);
  return { vc0, i30m, rth, vth, tau, vcInf: vth, i30p, i3Inf, ic0p: ic(0), vb0m: (v2 * r4) / (r3 + r4), vc, i3, ic, i4 };
}

/* ------------------------------------------------------------------ Sadiku 7.6 (RL) */

export const EX76 = { vs: 24, r1: 4, r2: 4, r3: 8, l: 2 } as const;

export function ex76() {
  const { vs, r1, r2, r3, l } = EX76;
  const il0 = vs / r1; // S shorts R_2, L shorts R_3
  const rs = r1 + r2;
  const rth = (rs * r3) / (rs + r3);
  const vth = (vs * r3) / (rs + r3);
  const tau = l / rth;
  const ilInf = vth / rth; // = Vs/(R_1 + R_2)
  const vl0p = rth * (vs / rs - il0);
  const il = (t: number) => threeElement(il0, ilInf, tau, t);
  const vl = (t: number) => vl0p * Math.exp(-t / tau);
  const ir3 = (t: number) => vl(t) / r3;
  /** current out of the supply branch (R_1 + R_2) into the top node */
  const isup = (t: number) => (vs - vl(t)) / rs;
  return { il0, rth, vth, tau, ilInf, vl0p, il, vl, ir3, isup };
}

/* ------------------------------------------------------------------ the bench */

/** the bench supplies, named with their real voltages everywhere (3D tags, telemetry, text) */
export const SUPPLY_5 = '台式可调直流电源（5 V）';
export const SUPPLY_75 = '台式可调直流电源（18 V / 36 V）';

/** the scope-ground warning of the lesson sheet, word for word */
export const WARN_TITLE = '示波器探头地线夹共地防短路警示（仪器安全硬性红线）';
export const WARN_TEXT =
  '严禁将示波器探头的黑色鳄鱼夹随意夹在非参考地的悬浮电阻两端（如电源正极侧串联电阻 R 的下端节点），否则将通过 PE 大地直接把该节点短接到电源负极，导致电容被旁路、电阻与电源过流烧毁。';

/* ------------------------------------------------------------------ scaling */

export const SCALE = 1000;
/** the 1/4 W carbon-film rating */
export const RATING_W = 0.25;

/* ------------------------------------------------------------------ the oscilloscope of the 3D bench */

export type Src = 'dc' | 'fg';
export type Sw = 'charge' | 'discharge';
export type Probe = 'safe' | 'hazard';
export type Kit = 'rc' | 'ex75';

/** the generator's square wave: 0 … 5 V, 0.1 Hz (5 s high, 5 s low = 5τ each) */
export const FG = { vpp: 5, period: 10 } as const;

/** steady state of a square wave of half-period T/2 into RC: the levels vC swings between */
export function squareLevels(vs: number, half: number, tau: number): { hi: number; lo: number } {
  const a = Math.exp(-half / tau);
  const hi = vs / (1 + a);
  return { hi, lo: hi * a };
}

/** vC(t) of the generator drive in steady state, t = 0 at a rising edge */
export function fgVc(t: number, tau = KIT_TAU): number {
  const half = FG.period / 2;
  const { hi, lo } = squareLevels(FG.vpp, half, tau);
  const tt = ((t % FG.period) + FG.period) % FG.period;
  return tt < half ? threeElement(lo, FG.vpp, tau, tt) : threeElement(hi, 0, tau, tt - half);
}
export const fgVa = (t: number) => {
  const tt = ((t % FG.period) + FG.period) % FG.period;
  return tt < FG.period / 2 ? FG.vpp : 0;
};

export interface Trace {
  ch: 'ch1' | 'ch2' | 'math';
  /** volts at time t (s, from the trigger) */
  v: (t: number) => number;
  /** the trace's ground level, divisions above the bottom of the screen */
  pos: number;
}

export interface ScopeView {
  /** time at the left edge of the screen (s; the trigger is t = 0) */
  t0: number;
  /** s / div (10 divisions across) */
  tdiv: number;
  /** V / div (8 divisions high) */
  vdiv: number;
  traces: Trace[];
  /** what CH1 / CH2 / MATH are on, for the readout */
  names: Partial<Record<Trace['ch'], string>>;
  /** the cursor time (s) and the trace it reads */
  cursor?: { t: number; ch: Trace['ch'] };
}

/** The scope screen for the RC kit. `hazard`: CH1's ground clip on node B (the R–C junction): PE
 *  earth pulls node B to 0 V, C is bypassed, CH1 shows vA − 0 and CH2 is not connected. */
export function kitScope(src: Src, sw: Sw, probe: Probe): ScopeView {
  if (src === 'fg') {
    if (probe === 'hazard') return { t0: 0, tdiv: 1, vdiv: 1, traces: [{ ch: 'ch1', v: fgVa, pos: 1 }], names: { ch1: 'CH1 vA（黑夹在节点 B！）' } };
    return {
      t0: 0,
      tdiv: 1,
      vdiv: 1,
      traces: [
        { ch: 'ch1', v: fgVa, pos: 1 },
        { ch: 'ch2', v: (t) => fgVc(t), pos: 1 },
        { ch: 'math', v: (t) => fgVa(t) - fgVc(t), pos: 5 },
      ],
      names: { ch1: 'CH1 vA（发生器输出）', ch2: 'CH2 vC', math: 'MATH vR = CH1 − CH2' },
      cursor: { t: 1, ch: 'ch2' },
    };
  }
  const charge = sw === 'charge';
  const va = charge ? KIT.vs : 0;
  const v0 = charge ? 0 : KIT.vs;
  if (probe === 'hazard') return { t0: 0, tdiv: 0.5, vdiv: 1, traces: [{ ch: 'ch1', v: () => va, pos: 1 }], names: { ch1: 'CH1 vA（黑夹在节点 B！）' } };
  const vc = (t: number) => rcStep(va, KIT.r, KIT.c, v0, t).vc;
  return {
    t0: 0,
    tdiv: 0.5,
    vdiv: 1,
    traces: [
      { ch: 'ch1', v: () => va, pos: 1 },
      { ch: 'ch2', v: vc, pos: 1 },
      { ch: 'math', v: (t) => va - vc(t), pos: charge ? 1 : 7 },
    ],
    names: { ch1: 'CH1 vA', ch2: 'CH2 vC', math: 'MATH vR = CH1 − CH2' },
    cursor: { t: KIT_TAU, ch: 'ch2' },
  };
}

/** The scope screen for the scaled Sadiku 7.5 (k = 1000): CH1 on V2 (36 V), CH2 on node B (the
 *  R_3–R_4 junction), MATH = CH1 − CH2 = vR3 = 6 kΩ · i_3. Window −0.5 … 4.5 s (trigger 1 div in). */
export function ex75Scope(sw: 'A' | 'B'): ScopeView {
  const e = ex75(SCALE);
  const vb = (t: number) => (sw === 'A' || t < 0 ? e.vb0m : e.vc(t));
  return {
    t0: -0.5,
    tdiv: 0.5,
    vdiv: 5,
    traces: [
      { ch: 'ch1', v: () => EX75.v2, pos: 0.4 },
      { ch: 'ch2', v: vb, pos: 0.4 },
      { ch: 'math', v: (t) => EX75.v2 - vb(t), pos: 0.4 },
    ],
    names: { ch1: 'CH1 V2 = 36 V', ch2: 'CH2 节点 B', math: 'MATH vR3 = CH1 − CH2' },
    cursor: { t: e.tau, ch: 'ch2' },
  };
}

/* ------------------------------------------------------------------ formatting */

const minus = (s: string) => s.replace('-', '−');
export const fmt = (v: number, d = 2) => minus((Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d));
export const fmtV = (v: number, d = 2) => `${fmt(v, d)} V`;
export const fmtA = (v: number, d = 2) => `${fmt(v, d)} A`;
export const fmtmA = (a: number, d = 3) => `${fmt(a * 1e3, d)} mA`;
export function fmtR(r: number): string {
  if (r >= 1e3) return `${+(r / 1e3).toFixed(r >= 1e4 ? 1 : 2)} kΩ`;
  return `${+r.toFixed(1)} Ω`;
}
export function fmtC(c: number): string {
  return c >= 1e-3 ? `${+(c * 1e3).toFixed(2)} mF` : `${+(c * 1e6).toFixed(1)} µF`;
}
export function fmtT(t: number): string {
  if (t >= 1) return `${+t.toFixed(t >= 10 ? 1 : 2)} s`;
  return `${+(t * 1e3).toFixed(t >= 0.01 ? 0 : 1)} ms`;
}
