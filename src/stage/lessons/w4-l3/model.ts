// W4-L3 numbers: the op-amp integrator / differentiator on the breadboard's LM358 (±9 V rails),
// R = 10 kΩ, C = 100 nF (RC = 1 ms), R_f = 100 kΩ (lossy integrator), R_s = 1 kΩ (practical
// differentiator). Pure functions, shared by the three stage layers and model.test.ts.
//
// Time-domain model (what the oscilloscope layer draws):
// - integrator, state v_C (feedback capacitor, v_− side minus output side); in the linear region
//   v_− = v_+ = V_OS, i_R = (v_i − V_OS)/R, i_Rf = v_C/R_f, C dv_C/dt = i_R − i_Rf, v_o = V_OS − v_C;
// - differentiator, state x (input capacitor): i = (v_i − V_OS − x)/R_s', C dx/dt = i,
//   v_o = V_OS − R·i. The "ideal" differentiator still has the function generator's 50 Ω output
//   resistance in series (R_s' = 50 Ω), so a square edge shows as a narrow spike to the rail
//   instead of an infinite impulse;
// - the output is limited to the LM358's swing on ±9 V: about +7.5 V high (V+ − 1.5 V) and about
//   −8.9 V low at light load (it sits a little higher when it sinks more current). When the output
//   is on a rail the integrator's state is held there (the sheet's `clamp(vo, …)`; the small
//   wind-up of the inverting node during saturation is left out).
// Each step is integrated exactly for an input that is linear over the step (a square wave's
// edges fall on step boundaries), so the 50 kHz glitch is not simulated sample by sample: it is a
// small sine on top of the input, and its effect on the output is |A(f_n)| · V_n, drawn as a band.

export const R = 10_000;
export const C = 100e-9;
export const RC = R * C;
export const RF = 100_000;
export const RF_LOW = 1_000_000;
export const RS = 1_000;
/** the function generator's output resistance (in series with any input element) */
export const R_GEN = 50;
/** LM358 input offset voltage (typ.) */
export const VOS = 3e-3;
/** LM358 output swing on ±9 V (light load) */
export const VOH = 7.5;
export const VOL = -8.9;
/** the sheet's conservative linear limit (design rule) */
export const V_SAFE = 7.5;
export const RAIL = 9;
/** the glitch on the signal line */
export const VN = 0.05;
export const FN = 50_000;

export type Mode = 'int' | 'lossy' | 'diff' | 'pdiff';
export type Wave = 'square' | 'tri' | 'gnd';
export type Ic = 'sym' | 'zero';

export const MODE_LABEL: Record<Mode, [string, string]> = {
  int: ['理想积分器', '积分'],
  lossy: ['有损积分器 +R_f', '+R_f'],
  diff: ['理想微分器', '微分'],
  pdiff: ['实用微分器 +R_s', '+R_s'],
};

export const isInt = (m: Mode) => m === 'int' || m === 'lossy';

export const clampV = (v: number) => Math.min(VOH, Math.max(VOL, v));

/* ------------------------------------------------------------- closed-form numbers */

/** integrator output slope for a constant input (V/s) */
export const intSlope = (vi: number, rc = RC) => -vi / rc;
/** ideal integrator: |Δv_o| over half a period of a ±A square wave (V) */
export const halfSwing = (a: number, f: number, rc = RC) => a / (2 * f * rc);
/** ideal differentiator output for an input slope (V/s) */
export const diffOut = (slope: number, rc = RC) => -rc * slope;
/** triangle of peak A at f: slope magnitude 4 A f (V/s) */
export const triSlope = (a: number, f: number) => 4 * a * f;

/** ideal integrator drift with the input grounded */
export const driftRate = (vos = VOS, rc = RC) => vos / rc;
export const tSat = (vsat = VOH, vos = VOS, rc = RC) => (vsat * rc) / vos;
/** lossy integrator: DC output offset and corner frequency */
export const lossyDc = (rf = RF, r = R, vos = VOS) => (1 + rf / r) * vos;
export const fc = (rf = RF, c = C) => 1 / (2 * Math.PI * rf * c);
/** R_f needed so that f_signal ≥ 10 f_c */
export const rfMin = (fSignal: number, c = C) => 1 / (2 * Math.PI * (fSignal / 10) * c);

/** differentiator gains at f */
export const aIdeal = (f: number, rc = RC) => 2 * Math.PI * f * rc;
export const aPrac = (f: number, rs = RS, r = R, c = C) => (2 * Math.PI * f * r * c) / Math.sqrt(1 + (2 * Math.PI * f * rs * c) ** 2);
export const fb = (rs = RS, c = C) => 1 / (2 * Math.PI * rs * c);
export const aMax = (rs = RS, r = R) => r / rs;
/** integrator gains at f */
export const aInt = (f: number, rc = RC) => 1 / (2 * Math.PI * f * rc);
export const aLossy = (f: number, rf = RF, r = R, c = C) => rf / r / Math.sqrt(1 + (2 * Math.PI * f * rf * c) ** 2);

/** |A(f)| of a mode (for the glitch band; the sheet's figures, without the generator's 50 Ω) */
export function gainAt(mode: Mode, f: number): number {
  if (mode === 'int') return aInt(f);
  if (mode === 'lossy') return aLossy(f);
  if (mode === 'diff') return aIdeal(f);
  return aPrac(f);
}

/** time to reach a level v (< 0) from 0 at slope k (< 0) */
export const tReach = (v: number, k: number) => v / k;

/* ------------------------------------------------------------- the input */

/** input value at t (s): square ±A starting high, triangle from −A rising, or ground */
export function input(wave: Wave, a: number, f: number, t: number): number {
  if (wave === 'gnd') return 0;
  const T = 1 / f;
  const p = ((t % T) + T) % T;
  if (wave === 'square') return p < T / 2 ? a : -a;
  return p < T / 2 ? -a + (4 * a * p) / T : 3 * a - (4 * a * p) / T;
}

/* ------------------------------------------------------------- simulation */

export interface SimCfg {
  mode: Mode;
  wave: Wave;
  f: number;
  amp: number;
  /** offset voltage at v+ (V) */
  vos: number;
  /** ideal integrator: start from v_o(0) = 0, or the symmetric steady state */
  ic: Ic;
  /** ideal integrator, symmetric case: DC level the offset has drifted to (V) */
  drift?: number;
  /** periods on screen */
  periods?: number;
}

export interface Trace {
  /** sample times (s), from 0 */
  t: number[];
  vi: number[];
  vo: number[];
  /** per display column: [min, max] of v_o (peak detect, so edge spikes stay visible) */
  cols: [number, number][];
  colsIn: [number, number][];
  /** window length (s) */
  span: number;
  max: number;
  min: number;
  clipped: boolean;
  /** the output without the rail limit, for the "ideal" readout */
  idealMax: number;
  idealMin: number;
}

const STEPS_PER_HALF = 1000;

/** exact step of dx/dt = (u − x)/τ, u linear from u0 to u1 over h */
function expStep(x: number, u0: number, u1: number, h: number, tau: number): number {
  const s = (u1 - u0) / h;
  const e = Math.exp(-h / tau);
  return u1 - s * tau + (x - u0 + s * tau) * e;
}

interface Plant {
  /** advance the state over one step (input u0 → u1), honouring the rail limit when `limit` */
  step(x: number, u0: number, u1: number, h: number, limit: boolean): number;
  /** output for state x and input u */
  out(x: number, u: number): number;
}

function plant(mode: Mode, vos: number): Plant {
  if (mode === 'int' || mode === 'lossy') {
    const lossy = mode === 'lossy';
    const tau = RF * C;
    const raw = (x: number, u0: number, u1: number, h: number) => (lossy ? expStep(x, (RF / R) * (u0 - vos), (RF / R) * (u1 - vos), h, tau) : x + (h * ((u0 + u1) / 2 - vos)) / RC);
    return {
      step(x, u0, u1, h, limit) {
        const n = raw(x, u0, u1, h);
        if (!limit) return n;
        const vo = vos - n;
        return vo > VOH ? vos - VOH : vo < VOL ? vos - VOL : n;
      },
      out: (x) => vos - x,
    };
  }
  const rs = (mode === 'pdiff' ? RS : 0) + R_GEN;
  const tau = rs * C;
  return {
    step: (x, u0, u1, h) => expStep(x, u0 - vos, u1 - vos, h, tau),
    out: (x, u) => vos - (R * (u - vos - x)) / rs,
  };
}

/** Steady-state (or from-zero) oscilloscope picture of `periods` periods. */
export function simulate(cfg: SimCfg, cols = 480): Trace {
  const { mode, wave, f, amp, vos } = cfg;
  const periods = cfg.periods ?? 2;
  const T = 1 / f;
  const h = T / (2 * STEPS_PER_HALF);
  const per = 2 * STEPS_PER_HALF;
  const p = plant(mode, vos);
  const u = (k: number) => {
    // value just after the step start / just before its end, so square edges sit on boundaries
    const t = k * h;
    return input(wave, amp, f, t);
  };
  const uEnd = (k: number) => input(wave, amp, f, (k + 1) * h - h * 1e-6);
  const run = (x0: number, n: number, limit: boolean, rec?: (k: number, x: number) => void) => {
    let x = x0;
    for (let k = 0; k < n; k++) {
      x = p.step(x, u(k), uEnd(k), h, limit);
      rec?.(k, x);
    }
    return x;
  };

  let x0 = 0;
  const fromZero = mode === 'int' && cfg.ic === 'zero';
  if (!fromZero) {
    if (mode === 'int') {
      // symmetric steady state: shift the state so the output's mean is the drifted DC level
      let sum = 0;
      run(0, per, false, (_k, x) => (sum += p.out(x, 0)));
      const mean = sum / per;
      const want = cfg.drift ?? 0;
      x0 = mean - want; // out = vos − x: shifting x by +d moves the output by −d
      // with a signal on, a drift that reaches the rail leaves the waveform hanging from it
      let hi = -Infinity;
      let lo = Infinity;
      run(x0, per, false, (k, x) => {
        const v = p.out(x, uEnd(k));
        hi = Math.max(hi, v);
        lo = Math.min(lo, v);
      });
      if (hi > VOH) x0 += hi - VOH;
      if (lo < VOL && hi <= VOH) x0 -= VOL - lo;
    } else {
      // periodic steady state of a one-pole system: x(T) = Φ x(0) + b
      const tau = mode === 'lossy' ? RF * C : ((mode === 'pdiff' ? RS : 0) + R_GEN) * C;
      const b = run(0, per, false);
      const phi = Math.exp(-T / tau);
      x0 = b / (1 - phi);
      // settle under the rail limit
      x0 = run(x0, per * 4, true);
    }
  }

  const n = per * periods;
  const t: number[] = [];
  const vi: number[] = [];
  const vo: number[] = [];
  const colsOut: [number, number][] = Array.from({ length: cols }, () => [Infinity, -Infinity]);
  const colsIn: [number, number][] = Array.from({ length: cols }, () => [Infinity, -Infinity]);
  let idealMax = -Infinity;
  let idealMin = Infinity;
  let clipped = false;
  const push = (k: number, tt: number, uu: number, vv: number) => {
    const c = Math.min(cols - 1, Math.floor((k / n) * cols));
    const co = colsOut[c];
    co[0] = Math.min(co[0], vv);
    co[1] = Math.max(co[1], vv);
    const ci = colsIn[c];
    ci[0] = Math.min(ci[0], uu);
    ci[1] = Math.max(ci[1], uu);
    if (k % 4 === 0) {
      t.push(tt);
      vi.push(uu);
      vo.push(vv);
    }
  };
  // ideal-integrator state for the "without the rail" readout
  let xi = x0;
  let x = x0;
  const v0 = clampV(p.out(x, u(0)));
  push(0, 0, u(0), v0);
  let max = v0;
  let min = v0;
  for (let k = 0; k < n; k++) {
    const u0 = u(k);
    const u1 = uEnd(k);
    x = p.step(x, u0, u1, h, true);
    xi = p.step(xi, u0, u1, h, false);
    const raw = p.out(x, u1);
    const ideal = p.out(xi, u1);
    const v = clampV(raw);
    if (raw > VOH + 1e-9 || raw < VOL - 1e-9 || Math.abs(v - VOH) < 1e-6 || Math.abs(v - VOL) < 1e-6) clipped = true;
    max = Math.max(max, v);
    min = Math.min(min, v);
    idealMax = Math.max(idealMax, ideal);
    idealMin = Math.min(idealMin, ideal);
    push(k + 1, (k + 1) * h, u1, v);
  }
  for (let c = 0; c < cols; c++) {
    if (!Number.isFinite(colsOut[c][0])) colsOut[c] = c ? colsOut[c - 1] : [v0, v0];
    if (!Number.isFinite(colsIn[c][0])) colsIn[c] = c ? colsIn[c - 1] : [u(0), u(0)];
  }
  return { t, vi, vo, cols: colsOut, colsIn, span: n * h, max, min, clipped, idealMax, idealMin };
}

/** value of a simulated trace at time t (linear interpolation of the kept samples) */
export function at(tr: Trace, tt: number): number {
  const { t, vo } = tr;
  if (tt <= t[0]) return vo[0];
  for (let i = 1; i < t.length; i++) if (t[i] >= tt) return vo[i - 1] + ((vo[i] - vo[i - 1]) * (tt - t[i - 1])) / (t[i] - t[i - 1]);
  return vo[vo.length - 1];
}

/** DC level of the output with the input grounded, t seconds after power-on (V_OS on v+) */
export function driftLevel(mode: Mode, tOn: number, vos = VOS): number {
  if (mode === 'int') return clampV(driftRate(vos) * tOn);
  if (mode === 'lossy') return lossyDc(RF, R, vos) * (1 - Math.exp(-tOn / (RF * C)));
  return vos;
}

/* ------------------------------------------------------------- formatting */

const MINUS = '−';
export const fmtV = (v: number, d = 2) => `${v < -0.5 * 10 ** -d ? MINUS : ''}${Math.abs(v).toFixed(d)} V`;
export const fmtSigned = (v: number, d = 2) => `${v < -0.5 * 10 ** -d ? MINUS : v > 0.5 * 10 ** -d ? '+' : ''}${Math.abs(v).toFixed(d)} V`;
export function fmtF(f: number): string {
  return f >= 1000 ? `${(f / 1000).toFixed(f % 1000 ? 2 : 0).replace(/\.?0+$/, '')} kHz` : `${Math.round(f)} Hz`;
}
export const fmtMs = (s: number, d = 1) => `${(s * 1000).toFixed(d)} ms`;
export const fmtSlope = (vps: number) => `${vps < -5e-4 ? MINUS : vps > 5e-4 ? '+' : ''}${Math.abs(vps / 1000).toFixed(2)} V/ms`;
