// W4-L7's maths: the source-free series / parallel RLC circuit. One solver for the three damping
// cases of x'' + 2αx' + ω0²x = 0, written for the capacitor voltage v_C(t) (series: v_C, parallel:
// the common node voltage v) from v_C(0⁺) and the inductor's current at 0⁺:
//  - series:   i(t) = C·dv_C/dt (the loop current, entering the capacitor's + plate), so
//              dv_C/dt(0⁺) = i(0⁺)/C;
//  - parallel: every branch current points down (associated with v), so the node KCL at 0⁺ gives
//              dv/dt(0⁺) = −[v(0⁺)/R + i_L(0⁺)]/C.
// α = R/(2L) (series) or 1/(2RC) (parallel), ω0 = 1/√(LC), R_crit (α = ω0) = 2√(L/C) or ½√(L/C).
// Near the boundary (|α − ω0|/ω0 < 10⁻³) the critical form (A1 + A2 t)e^{−αt} is used, so the
// curves never divide by s1 − s2 ≈ 0.

export type Topo = 'series' | 'parallel';
export type Regime = 'over' | 'critical' | 'under';

export interface Circuit {
  topo: Topo;
  /** total resistance (series: everything in the loop, the inductor's winding included) */
  R: number;
  L: number;
  C: number;
  /** v_C(0⁺) */
  v0: number;
  /** series: loop current i(0⁺); parallel: inductor current i_L(0⁺) (downwards) */
  i0: number;
}

export interface Pole {
  re: number;
  im: number;
}

export interface Sol {
  c: Circuit;
  alpha: number;
  w0: number;
  /** damping ratio ζ = α/ω0 */
  zeta: number;
  regime: Regime;
  /** ω_d = √(ω0² − α²) (under-damped), else 0 */
  wd: number;
  /** s1 nearer the origin (the slow, dominant pole), s2 farther; complex pair for under-damped */
  s1: Pole;
  s2: Pole;
  rcrit: number;
  /** dv_C/dt(0⁺) */
  d0: number;
  /** over: A1 e^{s1 t} + A2 e^{s2 t}; critical: (A1 + A2 t) e^{−αt} */
  A1: number;
  A2: number;
  /** under: e^{−αt}(B1 cos ω_d t + B2 sin ω_d t) = M e^{−αt} cos(ω_d t − φ) */
  B1: number;
  B2: number;
  M: number;
  /** φ = atan2(B2, B1), rad */
  phi: number;
  v: (t: number) => number;
  dv: (t: number) => number;
}

export const TOL = 1e-3;

export const alphaOf = (topo: Topo, R: number, L: number, C: number) => (topo === 'series' ? R / (2 * L) : 1 / (2 * R * C));
export const omega0 = (L: number, C: number) => 1 / Math.sqrt(L * C);
export const rcritOf = (topo: Topo, L: number, C: number) => (topo === 'series' ? 2 : 0.5) * Math.sqrt(L / C);
/** the resistance that gives the damping ratio ζ */
export const rForZeta = (topo: Topo, L: number, C: number, zeta: number) => (topo === 'series' ? zeta * rcritOf(topo, L, C) : rcritOf(topo, L, C) / zeta);

export function solve(c: Circuit): Sol {
  const { topo, R, L, C, v0, i0 } = c;
  const alpha = alphaOf(topo, R, L, C);
  const w0 = omega0(L, C);
  const zeta = alpha / w0;
  const d0 = topo === 'series' ? i0 / C : -(v0 / R + i0) / C;
  const base = { c, alpha, w0, zeta, rcrit: rcritOf(topo, L, C), d0 };
  if (Math.abs(alpha - w0) / w0 < TOL) {
    const A1 = v0;
    const A2 = d0 + alpha * v0;
    return {
      ...base,
      regime: 'critical',
      wd: 0,
      s1: { re: -alpha, im: 0 },
      s2: { re: -alpha, im: 0 },
      A1,
      A2,
      B1: 0,
      B2: 0,
      M: 0,
      phi: 0,
      v: (t) => (A1 + A2 * t) * Math.exp(-alpha * t),
      dv: (t) => (A2 - alpha * (A1 + A2 * t)) * Math.exp(-alpha * t),
    };
  }
  if (alpha > w0) {
    const root = Math.sqrt(alpha * alpha - w0 * w0);
    // s1 = −α + √(α² − ω0²), written without the cancellation for large α
    const s1 = -(w0 * w0) / (alpha + root);
    const s2 = -alpha - root;
    const A1 = (d0 - s2 * v0) / (s1 - s2);
    const A2 = v0 - A1;
    return {
      ...base,
      regime: 'over',
      wd: 0,
      s1: { re: s1, im: 0 },
      s2: { re: s2, im: 0 },
      A1,
      A2,
      B1: 0,
      B2: 0,
      M: 0,
      phi: 0,
      v: (t) => A1 * Math.exp(s1 * t) + A2 * Math.exp(s2 * t),
      dv: (t) => A1 * s1 * Math.exp(s1 * t) + A2 * s2 * Math.exp(s2 * t),
    };
  }
  const wd = Math.sqrt(w0 * w0 - alpha * alpha);
  const B1 = v0;
  const B2 = (d0 + alpha * B1) / wd;
  return {
    ...base,
    regime: 'under',
    wd,
    s1: { re: -alpha, im: wd },
    s2: { re: -alpha, im: -wd },
    A1: 0,
    A2: 0,
    B1,
    B2,
    M: Math.hypot(B1, B2),
    phi: Math.atan2(B2, B1),
    v: (t) => Math.exp(-alpha * t) * (B1 * Math.cos(wd * t) + B2 * Math.sin(wd * t)),
    dv: (t) => Math.exp(-alpha * t) * ((-alpha * B1 + wd * B2) * Math.cos(wd * t) + (-alpha * B2 - wd * B1) * Math.sin(wd * t)),
  };
}

/** series: the loop current i = C·dv_C/dt; parallel: the inductor current i_L = −v/R − C·dv/dt */
export function current(s: Sol, t: number): number {
  const { topo, R, C } = s.c;
  return topo === 'series' ? C * s.dv(t) : -s.v(t) / R - C * s.dv(t);
}

/** Zero crossings of v in (0, tMax] (bisection on a fine grid). */
export function zeros(s: Sol, tMax: number, n = 800): number[] {
  const out: number[] = [];
  let t0 = 0;
  let f0 = s.v(0);
  for (let k = 1; k <= n; k++) {
    const t1 = (k / n) * tMax;
    const f1 = s.v(t1);
    if (f0 !== 0 && Math.sign(f1) !== Math.sign(f0)) {
      let a = t0;
      let b = t1;
      for (let j = 0; j < 50; j++) {
        const m = (a + b) / 2;
        if (Math.sign(s.v(m)) === Math.sign(s.v(a))) a = m;
        else b = m;
      }
      out.push((a + b) / 2);
    }
    t0 = t1;
    f0 = f1;
  }
  return out;
}

/** The deepest point of v in [0, tMax]: the first undershoot of an under-damped ringing. */
export function minimum(s: Sol, tMax: number, n = 1600): { t: number; v: number } {
  let best = { t: 0, v: s.v(0) };
  for (let k = 1; k <= n; k++) {
    const t = (k / n) * tMax;
    const v = s.v(t);
    if (v < best.v) best = { t, v };
  }
  return best;
}

/* --------------------------------------------------------------------------- circuits */

export interface Preset {
  name: string;
  topo: Topo;
  R: number;
  L: number;
  C: number;
  v0: number;
  i0: number;
  /** resistance that cannot be turned away (the 10 mH inductor's winding on the bench) */
  rl: number;
}

/** the breadboard: 10 mH drum inductor (winding R_L ≈ 10 Ω), 1 µF film capacitor, 0–1 kΩ pot,
 *  charged to 5 V by the bench supply through the SPDT switch */
export const R_L = 10;
export const POT_MAX = 1000;
export const BENCH_V = 5;

export const PRESETS = {
  demo: { name: '对偶演示（10 mH, 1 µF）', topo: 'series', R: 100, L: 0.01, C: 1e-6, v0: 5, i0: 0, rl: 0 },
  fig2: { name: '同屏对比（ω₀ = 10 rad/s）', topo: 'series', R: 2, L: 0.5, C: 0.02, v0: 12, i0: 0, rl: 0 },
  ex1: { name: '例题 1 · Sadiku 8.3', topo: 'series', R: 12.5, L: 0.5, C: 0.02, v0: 12, i0: 0, rl: 0 },
  ex2: { name: '例题 2 · Sadiku 8.4', topo: 'parallel', R: 50, L: 0.16, C: 25e-6, v0: 12, i0: 0.15, rl: 0 },
  gd: { name: '引导例题', topo: 'parallel', R: 25, L: 0.4, C: 250e-6, v0: 15, i0: 0.15, rl: 0 },
  bench: { name: '面包板（10 mH, 1 µF, 5 V）', topo: 'series', R: 40, L: 0.01, C: 1e-6, v0: BENCH_V, i0: 0, rl: R_L },
} satisfies Record<string, Preset>;

export type PresetKey = keyof typeof PRESETS;

/** R slider range: series [R_L, R_L + 5 R_crit] (linear), parallel [R_crit/10, 10 R_crit] (log) */
export function rRange(topo: Topo, L: number, C: number, rl: number): { lo: number; hi: number; log: boolean } {
  const rc = rcritOf(topo, L, C);
  return topo === 'series' ? { lo: rl, hi: rl + 5 * rc, log: false } : { lo: rc / 10, hi: rc * 10, log: true };
}

/** the slider snaps onto R_crit within ±2 % */
export const snapR = (R: number, rc: number) => (Math.abs(R / rc - 1) < 0.02 ? rc : R);

/** the ghost curves of the three-state overlay: ζ = 1.5, 1, 0.2 (the sheet's figure 2) */
export const GHOST_ZETA = { over: 1.5, critical: 1, under: 0.2 } as const;

/** plotting window: 20/ω0 (2 ms on the bench = 10 div × 200 µs) */
export const windowOf = (w0: number) => 20 / w0;

/* --------------------------------------------------------------------------- formatting */

const trim = (s: string) => (s.includes('.') ? s.replace(/\.?0+$/, '') : s);

/** three significant figures, trailing zeros dropped */
export function sig(x: number, n = 3): string {
  if (!Number.isFinite(x)) return '—';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 10 ** n) return Math.round(x).toString();
  const d = Math.max(0, n - 1 - Math.floor(Math.log10(a)));
  return trim(x.toFixed(d));
}

const neg = (s: string) => s.replace('-', '−');

export const fmtR = (r: number) => (r >= 1000 ? `${sig(r / 1000)} kΩ` : `${sig(r)} Ω`);
export const fmtL = (l: number) => (l >= 1 ? `${sig(l)} H` : `${sig(l * 1000)} mH`);
export function fmtC(c: number): string {
  if (c >= 1e-3) return `${sig(c * 1000)} mF`;
  if (c >= 1e-6) return `${sig(c * 1e6)} µF`;
  return `${sig(c * 1e9)} nF`;
}
export const fmtRate = (x: number, unit: 'Np/s' | 'rad/s' | 's⁻¹') => `${neg(sig(x))} ${unit}`;
export function fmtT(t: number): string {
  const a = Math.abs(t);
  if (a >= 1) return `${sig(t)} s`;
  if (a >= 1e-3) return `${sig(t * 1e3)} ms`;
  return `${sig(t * 1e6)} µs`;
}
export const fmtV = (v: number, d = 2) => `${neg(v.toFixed(d))} V`;
export const fmtHz = (f: number) => (f >= 1000 ? `${sig(f / 1000)} kHz` : `${sig(f)} Hz`);
export const fmtPole = (p: Pole) => (p.im === 0 ? `${neg(sig(p.re))}` : `${neg(sig(p.re))} ${p.im > 0 ? '+' : '−'} j${sig(Math.abs(p.im))}`);

export const REGIME_LABEL: Record<Regime, string> = { over: '过阻尼', critical: '临界阻尼', under: '欠阻尼' };
export const REGIME_COLOR: Record<Regime, string> = { over: '#dc2626', critical: '#059669', under: '#0284c7' };
