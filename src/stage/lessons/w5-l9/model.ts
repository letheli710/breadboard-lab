// W5-L9 numbers: the first-order filters of the lesson as phasor transfer functions H(jω), their
// pass-band gain and corner, the Bode samples of layer 02, the breadboard sweep of layer 03 and the
// guided design (act 7). Pure TypeScript (no three.js), so the 2D layers and the tests use it.
// - passive RC low-pass  H = 1 / (1 + jωRC); with a load R_L: Thevenin R_L/(R+R_L), R∥R_L
// - passive RC high-pass H = jωRC / (1 + jωRC); with a load: R∥R_L (no pass-band loss, corner up)
// - inverting active low-pass  H = −(Rf/Ri) / (1 + jωRf Cf)  (the load does not enter)
// - inverting active high-pass H = −(Rf/Ri) · jωRiCi / (1 + jωRiCi)
// - cascaded band-pass: active HPF (−1) then active LPF (−2.2): two inversions, in phase
// - the LM358 on the ±9 V bench supply: output swing +7.5 V / −8.9 V (light load), GBW ≈ 1 MHz

export interface Cx {
  re: number;
  im: number;
}

const cx = (re: number, im = 0): Cx => ({ re, im });
const mul = (a: Cx, b: Cx): Cx => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a: Cx, b: Cx): Cx => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const add = (a: Cx, b: Cx): Cx => cx(a.re + b.re, a.im + b.im);
export const mag = (a: Cx) => Math.hypot(a.re, a.im);
/** angle in degrees, (−180, 180] */
export const angDeg = (a: Cx) => (Math.atan2(a.im, a.re) * 180) / Math.PI;
export const toDb = (x: number) => 20 * Math.log10(x);
const TAU = 2 * Math.PI;

/* ------------------------------------------------------------------ the lesson's parts */

/** the breadboard BOM: Ri 10 kΩ, Rf 22 kΩ, Cf 10 nF, test load 10 kΩ */
export const RI = 10e3;
export const RF = 22e3;
export const CF = 10e-9;
export const RL = 10e3;
/** act 2.3: the passive high-pass 10 kΩ / 100 nF; act 4.3: the active one 10 kΩ / 100 nF / 33 kΩ */
export const HPF = { r: 10e3, c: 100e-9 };
export const AHPF = { ri: 10e3, ci: 100e-9, rf: 33e3 };
/** act 6.1: the voice band-pass, stage 1 HPF (10 kΩ, 47 nF, 10 kΩ), stage 2 LPF (10 kΩ, 22 kΩ, 2.2 nF) */
export const BPF = { ri1: 10e3, ci1: 47e-9, rf1: 10e3, ri2: 10e3, rf2: 22e3, cf2: 2.2e-9 };
/** act 7: the guided design (anti-aliasing front end), the standard parts it ends with */
export const DESIGN = { ri: 10e3, rf: 51e3, cf: 3.3e-9, target: { k: 5, fc: 1000 }, vinPk: 1.2 };

/** LM358 on the 台式可调直流电源（±9 V）: output swing at light load, gain-bandwidth */
export const VOH = 7.5;
export const VOL = -8.9;
export const GBW = 1e6;
export const A0 = 1e5;

/* ------------------------------------------------------------------ transfer functions */

export const par = (a: number, b: number) => (a * b) / (a + b);
export const cornerHz = (r: number, c: number) => 1 / (TAU * r * c);

export function passiveLpf(f: number, r: number, c: number, rl: number | null): Cx {
  const w = TAU * f;
  const k = rl ? rl / (r + rl) : 1;
  const rt = rl ? par(r, rl) : r;
  return div(cx(k), cx(1, w * rt * c));
}

export function passiveHpf(f: number, r: number, c: number, rl: number | null): Cx {
  const w = TAU * f;
  const rt = rl ? par(r, rl) : r;
  return div(cx(0, w * rt * c), cx(1, w * rt * c));
}

/** ideal op amp; with `gbw` the LM358's single-pole open loop A(jf) = A0 / (1 + j f A0 / GBW) */
function closeLoop(ideal: Cx, noiseGain: Cx, f: number, gbw: boolean): Cx {
  if (!gbw) return ideal;
  const a = div(cx(A0), cx(1, (f * A0) / GBW));
  return div(ideal, add(cx(1), div(noiseGain, a)));
}

export function activeLpf(f: number, ri: number, rf: number, cf: number, gbw = false): Cx {
  const w = TAU * f;
  const zf = div(cx(rf), cx(1, w * rf * cf));
  const h = mul(cx(-1 / ri), zf);
  return closeLoop(h, add(cx(1), div(zf, cx(ri))), f, gbw);
}

export function activeHpf(f: number, ri: number, ci: number, rf: number, gbw = false): Cx {
  const w = TAU * f;
  const zi = cx(ri, -1 / (w * ci));
  const h = div(cx(-rf), zi);
  return closeLoop(h, add(cx(1), div(cx(rf), zi)), f, gbw);
}

export function bandPass(f: number, gbw = false): Cx {
  const b = BPF;
  return mul(activeHpf(f, b.ri1, b.ci1, b.rf1, gbw), activeLpf(f, b.ri2, b.rf2, b.cf2, gbw));
}

/* ------------------------------------------------------------------ the topologies of layer 01 */

export type Mode = 'plpf' | 'phpf' | 'alpf' | 'ahpf' | 'bpf' | 'design';

export const MODE_LABEL: Record<Mode, string> = {
  plpf: '无源 RC 低通',
  phpf: '无源 RC 高通',
  alpf: '有源反相低通',
  ahpf: '有源反相高通',
  bpf: '级联有源带通',
  design: '设计题：抗混叠低通',
};

export interface Parts {
  ri: number;
  rf: number;
  cf: number;
}

export const SHEET_PARTS: Parts = { ri: RI, rf: RF, cf: CF };
export const DESIGN_PARTS: Parts = { ri: DESIGN.ri, rf: DESIGN.rf, cf: DESIGN.cf };

/** H(jf) of a topology. The low-pass family uses the sliders (passive R = Rf, C = Cf); the
 *  high-pass and band-pass ones keep the sheet's values. */
export function transfer(mode: Mode, f: number, p: Parts, load: boolean): Cx {
  const rl = load ? RL : null;
  switch (mode) {
    case 'plpf':
      return passiveLpf(f, p.rf, p.cf, rl);
    case 'phpf':
      return passiveHpf(f, HPF.r, HPF.c, rl);
    case 'alpf':
      return activeLpf(f, p.ri, p.rf, p.cf);
    case 'ahpf':
      return activeHpf(f, AHPF.ri, AHPF.ci, AHPF.rf);
    case 'bpf':
      return bandPass(f);
    case 'design':
      return activeLpf(f, DESIGN.ri, DESIGN.rf, DESIGN.cf);
  }
}

export interface Metrics {
  /** pass-band gain (signed: inverting stages are negative) */
  k: number;
  /** corner(s) in Hz: [fc] or [fc1, fc2] */
  fc: number[];
  /** the band-pass only: the real peak at f0 and its −3 dB edges */
  peak?: { f0: number; k: number; edges: [number, number] };
  /** the passive ones: the Thevenin resistance seen by C (Ω) */
  rth?: number;
}

export function metrics(mode: Mode, p: Parts, load: boolean): Metrics {
  const rl = load ? RL : null;
  switch (mode) {
    case 'plpf': {
      const rth = rl ? par(p.rf, rl) : p.rf;
      return { k: rl ? rl / (p.rf + rl) : 1, fc: [cornerHz(rth, p.cf)], rth };
    }
    case 'phpf': {
      const rth = rl ? par(HPF.r, rl) : HPF.r;
      return { k: 1, fc: [cornerHz(rth, HPF.c)], rth };
    }
    case 'alpf':
      return { k: -p.rf / p.ri, fc: [cornerHz(p.rf, p.cf)] };
    case 'ahpf':
      return { k: -AHPF.rf / AHPF.ri, fc: [cornerHz(AHPF.ri, AHPF.ci)] };
    case 'design':
      return { k: -DESIGN.rf / DESIGN.ri, fc: [cornerHz(DESIGN.rf, DESIGN.cf)] };
    case 'bpf': {
      const f1 = cornerHz(BPF.ri1, BPF.ci1);
      const f2 = cornerHz(BPF.rf2, BPF.cf2);
      const f0 = Math.sqrt(f1 * f2);
      const k0 = mag(bandPass(f0));
      return { k: (BPF.rf1 / BPF.ri1) * (BPF.rf2 / BPF.ri2), fc: [f1, f2], peak: { f0, k: k0, edges: bandEdges(k0 / Math.SQRT2) } };
    }
  }
}

/** where |H_BPF| crosses `level` below and above f0 (bisection on a log axis) */
function bandEdges(level: number): [number, number] {
  const f0 = Math.sqrt(cornerHz(BPF.ri1, BPF.ci1) * cornerHz(BPF.rf2, BPF.cf2));
  const cross = (lo: number, hi: number, rising: boolean) => {
    for (let i = 0; i < 80; i++) {
      const m = Math.sqrt(lo * hi);
      const above = mag(bandPass(m)) > level;
      if (above === rising) hi = m;
      else lo = m;
    }
    return Math.sqrt(lo * hi);
  };
  return [cross(1, f0, true), cross(f0, 1e7, false)];
}

/* ------------------------------------------------------------------ Bode samples */

export const F_MIN = 10;
export const F_MAX = 100e3;

export interface BodePoint {
  f: number;
  db: number;
  /** the phase with the inversion of an inverting stage taken out (the sheet's "极点相移") */
  ph: number;
}

/** `inverted`: the curve's pass band is inverted (one inverting stage): +180° is folded back */
export function bode(h: (f: number) => Cx, inverted: boolean, n = 161): BodePoint[] {
  const out: BodePoint[] = [];
  for (let i = 0; i < n; i++) {
    const f = F_MIN * Math.pow(F_MAX / F_MIN, i / (n - 1));
    const v = h(f);
    let ph = angDeg(v);
    if (inverted) ph = ph > 0 ? ph - 180 : ph + 180;
    out.push({ f, db: toDb(mag(v)), ph });
  }
  return out;
}

/** the total phase of the inverting active low-pass (−180° − arctan(f/fc)), as in the sheet's table */
export const totalPhaseAlpf = (f: number, p: Parts = SHEET_PARTS) => -180 - (Math.atan(f / cornerHz(p.rf, p.cf)) * 180) / Math.PI;

/* ------------------------------------------------------------------ the breadboard sweep */

export interface Sweep {
  f: number;
  /** input amplitude (V peak) */
  vin: number;
  /** linear gain magnitude and phase (total, degrees in (−360, 0]) of the real LM358 stage */
  gain: number;
  phase: number;
  /** wanted output amplitude (V peak) before the rails */
  want: number;
  clipped: boolean;
  /** output samples over two periods, clipped to the swing */
  vo: (t: number) => number;
  vi: (t: number) => number;
  /** output peak-to-peak as the scope reads it */
  vpp: number;
}

/** The 03 bench: the BOM active low-pass, a sine of `vpp` from the 函数信号发生器. The LM358's
 *  1 MHz gain-bandwidth changes the gain by < 0.02 dB over 10 Hz – 10 kHz (model.test.ts), so the
 *  bench reads the ideal transfer function; only the output swing (+7.5 V / −8.9 V) is applied.
 *  The 10 kΩ test load is fed by the op amp's output and does not change the gain. */
export function sweep(f: number, vpp: number): Sweep {
  const h = activeLpf(f, RI, RF, CF);
  const gain = mag(h);
  let phase = angDeg(h);
  if (phase > 0) phase -= 360;
  const vin = vpp / 2;
  const want = gain * vin;
  const w = TAU * f;
  const ph = (phase * Math.PI) / 180;
  const clip = (v: number) => Math.min(VOH, Math.max(VOL, v));
  const hi = Math.min(VOH, want);
  const lo = Math.max(VOL, -want);
  return {
    f,
    vin,
    gain,
    phase,
    want,
    clipped: want > VOH || -want < VOL,
    vi: (t) => vin * Math.sin(w * t),
    vo: (t) => clip(want * Math.sin(w * t + ph)),
    vpp: hi - lo,
  };
}

/** the largest input (V peak-to-peak) the bench filter takes in its pass band without clipping */
export const maxInputVpp = () => (2 * Math.min(VOH, -VOL)) / (RF / RI);

/* ------------------------------------------------------------------ formatting */

export const fmtHz = (f: number) => (f >= 1000 ? `${Number((f / 1000).toPrecision(4))} kHz` : `${Number(f.toPrecision(f >= 100 ? 4 : 3))} Hz`);
export const fmtDb = (d: number) => `${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(2)} dB`;
export const fmtR = (r: number) => (r >= 1e6 ? `${Number((r / 1e6).toPrecision(3))} MΩ` : r >= 1000 ? `${Number((r / 1000).toPrecision(4))} kΩ` : `${Math.round(r)} Ω`);
export const fmtC = (c: number) =>
  c >= 1e-6 ? `${Number((c * 1e6).toPrecision(3))} µF` : c >= 1e-9 ? `${Number((c * 1e9).toPrecision(3))} nF` : `${Number((c * 1e12).toPrecision(3))} pF`;
export const fmtV = (v: number, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)} V`;
export const fmtK = (k: number) => `${k < 0 ? '−' : ''}${Number(Math.abs(k).toPrecision(3))}`;
export const fmtDeg = (d: number) => `${d < 0 ? '−' : '+'}${Math.abs(d).toFixed(1)}°`;

/** E12 values from 1 kΩ to 100 kΩ, and from 1 nF to 100 nF (the sliders step through them) */
const E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
const series = (lo: number) => [...[1, 10].flatMap((d) => E12.map((v) => Number((v * d * lo).toPrecision(3)))), 100 * lo];
export const R_STEPS = series(1e3);
export const C_STEPS = series(1e-9);
/** index of the nearest step */
export const nearest = (steps: number[], v: number) => steps.reduce((bi, s, i) => (Math.abs(Math.log(s / v)) < Math.abs(Math.log(steps[bi] / v)) ? i : bi), 0);
