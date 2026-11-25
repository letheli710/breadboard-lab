// W4-L8 numbers: one general second-order solver (Sadiku 8.7's four steps: initial values, the
// characteristic roots, the final value, the two constants) and the lesson's circuits on top of it.
// - series RLC step (act 2, the breadboard): v_C, x_ss = V_s, x(0+) = v_C(0+), x'(0+) = i(0+)/C
// - parallel RLC step (act 3's guided example): i_L, x_ss = I_s, x'(0+) = v(0+)/L
// - general mixed circuit (act 4): v_C with s² + (R1/L + 1/(R2 C)) s + (R1 + R2)/(R2 L C)
// - the 200 Hz square wave on the series bench (layers 02 and 03): the state carried from edge to
//   edge until the waveform is periodic, so a slow case (small R) is drawn as it really looks.

export type Damping = 'over' | 'critical' | 'under';

export const DAMPING_LABEL: Record<Damping, string> = { over: '过阻尼', critical: '临界阻尼', under: '欠阻尼' };

/** x(t) = x_ss + x_t(t) for x'' + a1 x' + a0 x = a0 x_ss, from x(0+) and x'(0+). */
export interface Second {
  kind: Damping;
  /** α = a1 / 2 */
  alpha: number;
  /** ω0 = √a0 */
  w0: number;
  /** ω_d = √(ω0² − α²) (under-damped only, else 0) */
  wd: number;
  /** the roots (real parts and, under-damped, ± j ω_d) */
  s1: number;
  s2: number;
  xss: number;
  /** constants: over A1, A2 (e^{s1 t}, e^{s2 t}); critical D1, D2 ((D1 + D2 t) e^{−αt}); under B1, B2 (cos, sin) */
  k1: number;
  k2: number;
  x: (t: number) => number;
  dx: (t: number) => number;
}

/** Solve x'' + a1 x' + a0 x = a0 x_ss with x(0) = x0, x'(0) = dx0 (step 4: put both into the complete response). */
export function solve2(a1: number, a0: number, xss: number, x0: number, dx0: number): Second {
  const alpha = a1 / 2;
  const w0 = Math.sqrt(a0);
  const d = alpha * alpha - a0;
  const x0t = x0 - xss; // what the transient must cancel at t = 0+
  if (Math.abs(alpha - w0) <= 1e-9 * w0) {
    const D1 = x0t;
    const D2 = dx0 + alpha * D1;
    return {
      kind: 'critical',
      alpha,
      w0,
      wd: 0,
      s1: -alpha,
      s2: -alpha,
      xss,
      k1: D1,
      k2: D2,
      x: (t) => xss + (D1 + D2 * t) * Math.exp(-alpha * t),
      dx: (t) => (D2 - alpha * (D1 + D2 * t)) * Math.exp(-alpha * t),
    };
  }
  if (d > 0) {
    const r = Math.sqrt(d);
    const s1 = -alpha + r;
    const s2 = -alpha - r;
    const A2 = (dx0 - s1 * x0t) / (s2 - s1);
    const A1 = x0t - A2;
    return {
      kind: 'over',
      alpha,
      w0,
      wd: 0,
      s1,
      s2,
      xss,
      k1: A1,
      k2: A2,
      x: (t) => xss + A1 * Math.exp(s1 * t) + A2 * Math.exp(s2 * t),
      dx: (t) => s1 * A1 * Math.exp(s1 * t) + s2 * A2 * Math.exp(s2 * t),
    };
  }
  const wd = Math.sqrt(-d);
  const B1 = x0t;
  const B2 = (dx0 + alpha * B1) / wd;
  return {
    kind: 'under',
    alpha,
    w0,
    wd,
    s1: -alpha,
    s2: -alpha,
    xss,
    k1: B1,
    k2: B2,
    x: (t) => xss + Math.exp(-alpha * t) * (B1 * Math.cos(wd * t) + B2 * Math.sin(wd * t)),
    dx: (t) => Math.exp(-alpha * t) * ((-alpha * B1 + wd * B2) * Math.cos(wd * t) + (-alpha * B2 - wd * B1) * Math.sin(wd * t)),
  };
}

/* ------------------------------------------------------------- series RLC (act 2, the bench) */

export const VS = 5;
export const L_H = 10e-3;
export const C_F = 1e-6;
/** the three resistors of act 2 (total loop resistance) */
export const R_UNDER = 56;
export const R_CRIT = 2 * Math.sqrt(L_H / C_F); // 200 Ω
export const R_OVER = 250;
export const R_RANGE: [number, number] = [20, 400];

export interface SeriesStep {
  R: number;
  v: Second;
  /** loop current i = C dv_C/dt */
  i: (t: number) => number;
  /** ζ = α / ω0 */
  zeta: number;
}

export function seriesStep(R: number, L = L_H, C = C_F, Vs = VS, v0 = 0, i0 = 0): SeriesStep {
  const v = solve2(R / L, 1 / (L * C), Vs, v0, i0 / C);
  return { R, v, i: (t) => C * v.dx(t), zeta: v.alpha / v.w0 };
}

/** Under-damped zero-state step: t_p = π/ω_d, M_p = e^{−πα/ω_d}, V_peak = V_s (1 + M_p). */
export function overshoot(s: Second, Vs = VS): { tp: number; mp: number; vpeak: number } | null {
  if (s.kind !== 'under') return null;
  const mp = Math.exp((-Math.PI * s.alpha) / s.wd);
  return { tp: Math.PI / s.wd, mp, vpeak: Vs * (1 + mp) };
}

/** Peak of the zero-state loop current V_s/(L ω_d) e^{−αt} sin ω_d t: at tan ω_d t = ω_d/α. */
export function peakCurrent(R: number, L = L_H, C = C_F, Vs = VS): { t: number; i: number } {
  const s = seriesStep(R, L, C, Vs);
  if (s.v.kind === 'under') {
    const t = Math.atan2(s.v.wd, s.v.alpha) / s.v.wd;
    return { t, i: s.i(t) };
  }
  // over / critical: one maximum where di/dt = 0; search it
  let best = { t: 0, i: 0 };
  const T = 10 / s.v.w0;
  for (let k = 1; k <= 4000; k++) {
    const t = (k / 4000) * T;
    const i = s.i(t);
    if (i > best.i) best = { t, i };
  }
  return best;
}

/* ------------------------------------------------------------- the 200 Hz square wave */

export const F_SQ = 200;
export const T_SQ = 1 / F_SQ; // 5 ms
export const HALF = T_SQ / 2; // 2.5 ms

export interface Wave {
  /** v_C and i at the start of the rising half (periodic steady state) */
  rise: SeriesStep;
  fall: SeriesStep;
  /** v_C(t), i(t), source v_s(t) for any t (periodic, t = 0 is a rising edge) */
  vc: (t: number) => number;
  i: (t: number) => number;
  vs: (t: number) => number;
  /** maximum of v_C on the rising half and when, minimum on the falling half */
  peak: { t: number; v: number };
  dip: { t: number; v: number };
  /** the rising half settles to within 1 % of V_s by its end (5/α ≤ T/2 rule of the sheet) */
  settled: boolean;
}

/** The periodic response of the series RLC to a 0 … V_s square wave (ideal source, loop resistance R). */
export function squareWave(R: number, L = L_H, C = C_F, Vs = VS, half = HALF): Wave {
  let v = 0;
  let i = 0;
  let rise = seriesStep(R, L, C, Vs, 0, 0);
  let fall = seriesStep(R, L, C, 0, 0, 0);
  for (let k = 0; k < 400; k++) {
    rise = seriesStep(R, L, C, Vs, v, i);
    v = rise.v.x(half);
    i = rise.i(half);
    fall = seriesStep(R, L, C, 0, v, i);
    const v2 = fall.v.x(half);
    const i2 = fall.i(half);
    const done = Math.abs(v2 - rise.v.x(0)) < 1e-9 && Math.abs(i2 - rise.i(0)) < 1e-12;
    v = v2;
    i = i2;
    if (done) break;
  }
  const wrap = (t: number) => ((t % (2 * half)) + 2 * half) % (2 * half);
  const vc = (t: number) => {
    const u = wrap(t);
    return u < half ? rise.v.x(u) : fall.v.x(u - half);
  };
  const cur = (t: number) => {
    const u = wrap(t);
    return u < half ? rise.i(u) : fall.i(u - half);
  };
  const scan = (s: SeriesStep, sign: 1 | -1) => {
    let best = { t: 0, v: s.v.x(0) };
    for (let k = 1; k <= 5000; k++) {
      const t = (k / 5000) * half;
      const x = s.v.x(t);
      if (sign * x > sign * best.v) best = { t, v: x };
    }
    return best;
  };
  const peak = scan(rise, 1);
  const d = scan(fall, -1);
  return {
    rise,
    fall,
    vc,
    i: cur,
    vs: (t) => (wrap(t) < half ? Vs : 0),
    peak,
    dip: { t: d.t + half, v: d.v },
    settled: Math.abs(rise.v.x(half) - Vs) <= 0.01 * Vs && Math.abs(rise.v.x(0)) <= 0.01 * Vs,
  };
}

/* ------------------------------------------------------------- the breadboard (layer 03) */

/** function generator output impedance and the inductor's winding resistance (the sheet: DCR < 5 Ω) */
export const R_GEN = 50;
export const R_DCR = 4;
/** the 500 Ω linear potentiometer (wiper to one end: a variable resistor 0 … 500 Ω) */
export const POT_MAX = 500;
/** the smallest loop resistance the bench can have (potentiometer at 0 Ω) */
export const R_BENCH_MIN = R_GEN + R_DCR;

export type ClipNode = 'gnd' | 'n1' | 'n2' | 'n3';

export interface Bench {
  /** total loop resistance R = R_gen + R_DCR + R_pot */
  rTotal: number;
  rPot: number;
  /** the slider asked for less than the bench can do */
  clamped: boolean;
  wave: Wave;
  /** CH1 at the generator's output terminal: v_s − R_gen · i */
  ch1: (t: number) => number;
  ch2: (t: number) => number;
  /** a ground clip on a floating node: the scope's earth shorts it, the bench cuts the excitation */
  fault: boolean;
  /** average power in each resistance (W): every edge burns ½CV², split by resistance */
  pAvg: { gen: number; dcr: number; pot: number; total: number };
  /** peak loop current (A) */
  iPeak: number;
}

export function bench(rAsked: number, clip: ClipNode): Bench {
  const rTotal = Math.min(R_BENCH_MIN + POT_MAX, Math.max(R_BENCH_MIN, rAsked));
  const wave = squareWave(rTotal);
  const fault = clip !== 'gnd';
  const total = C_F * VS * VS * F_SQ; // two edges per period, ½CV² each
  let iPeak = 0;
  for (let k = 0; k <= 20000; k++) iPeak = Math.max(iPeak, Math.abs(wave.i((k / 20000) * T_SQ)));
  return {
    rTotal,
    rPot: rTotal - R_BENCH_MIN,
    clamped: rAsked < R_BENCH_MIN - 1e-9,
    wave,
    ch1: (t) => (fault ? 0 : wave.vs(t) - R_GEN * wave.i(t)),
    ch2: (t) => (fault ? 0 : wave.vc(t)),
    fault,
    pAvg: { gen: (total * R_GEN) / rTotal, dcr: (total * R_DCR) / rTotal, pot: (total * (rTotal - R_BENCH_MIN)) / rTotal, total },
    iPeak,
  };
}

/* ------------------------------------------------------------- act 3: the parallel RLC (guided example) */

export const PAR = { Is: 6, R: 5, L: 2, C: 0.02 } as const;

/** i_L(t) of the parallel RLC driven by I_s u(t), from i_L(0+) and v(0+). */
export function parallelStep(p: { Is: number; R: number; L: number; C: number } = PAR, iL0 = 0, v0 = 0): Second {
  return solve2(1 / (p.R * p.C), 1 / (p.L * p.C), p.Is, iL0, v0 / p.L);
}

/* ------------------------------------------------------------- act 4: the general circuit */

export const GEN = { Vs: 12, R1: 4, L: 1, R2: 2, C: 0.5 } as const;

/** characteristic polynomial s² + a1 s + a0 of the mixed circuit (source killed, i_L eliminated) */
export function generalPoly(g: { R1: number; L: number; R2: number; C: number } = GEN): { a1: number; a0: number } {
  return { a1: g.R1 / g.L + 1 / (g.R2 * g.C), a0: (g.R1 + g.R2) / (g.R2 * g.L * g.C) };
}

/** v_C(t) of the general circuit (zero initial energy unless given) */
export function generalStep(g: { Vs: number; R1: number; L: number; R2: number; C: number } = GEN, v0 = 0, iL0 = 0): { vc: Second; iL: (t: number) => number } {
  const { a1, a0 } = generalPoly(g);
  const vss = (g.Vs * g.R2) / (g.R1 + g.R2);
  const vc = solve2(a1, a0, vss, v0, (iL0 - v0 / g.R2) / g.C);
  return { vc, iL: (t) => vc.x(t) / g.R2 + g.C * vc.dx(t) };
}

/* ------------------------------------------------------------- act 5: the PCB trace */

export const PCB = { L: 25e-9, C: 10e-12, Rout: 15 } as const;

export const critR = (L: number, C: number) => 2 * Math.sqrt(L / C);

/** percent overshoot of a series RLC step for damping ratio ζ < 1 */
export const overshootOf = (zeta: number) => (zeta < 1 ? Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta)) : 0);

/* ------------------------------------------------------------- formatting */

/** a number with up to `d` decimals, no trailing zeros; − for negative */
export function num(x: number, d = 3): string {
  const f = x.toFixed(d);
  const s = Math.abs(x) < 10 ** -(d + 1) ? '0' : f.includes('.') ? f.replace(/\.?0+$/, '') : f;
  return s.replace('-', '−');
}

export const fmtV = (v: number, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)} V`;
export const fmtMs = (t: number, d = 3) => `${(t * 1000).toFixed(d)} ms`;
export const fmtOhm = (r: number) => `${Math.round(r)} Ω`;
export const fmtPct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
