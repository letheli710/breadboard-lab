import { describe, expect, it } from 'vitest';
import { current, GHOST_ZETA, minimum, PRESETS, rcritOf, rForZeta, R_L, solve, windowOf, zeros, type Circuit } from './model';

const close = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(tol * Math.max(1, Math.abs(b)));

/** residual of v'' + 2αv' + ω0²v at t (numerical second derivative) */
function residual(c: Circuit, t: number): number {
  const s = solve(c);
  const h = 1e-4 / s.w0;
  const d2 = (s.dv(t + h) - s.dv(t - h)) / (2 * h);
  return (d2 + 2 * s.alpha * s.dv(t) + s.w0 * s.w0 * s.v(t)) / (s.w0 * s.w0 * Math.max(1, Math.abs(c.v0)));
}

describe('W4-L7 characteristic equation', () => {
  it('act 1: ω0 is the same for both topologies, α and R_crit are not', () => {
    expect(rcritOf('series', 0.01, 1e-6)).toBeCloseTo(200, 9);
    expect(rcritOf('parallel', 0.01, 1e-6)).toBeCloseTo(50, 9);
    const s = solve({ topo: 'series', R: 100, L: 0.01, C: 1e-6, v0: 5, i0: 0 });
    const p = solve({ topo: 'parallel', R: 100, L: 0.01, C: 1e-6, v0: 5, i0: 0 });
    close(s.w0, 1e4);
    close(p.w0, 1e4);
    close(s.alpha, 5000);
    close(p.alpha, 5000);
    // R up: series more damped, parallel less
    expect(solve({ ...s.c, R: 300 }).regime).toBe('over');
    expect(solve({ ...p.c, R: 300 }).regime).toBe('under');
  });

  it('act 2 figure: ω0 = 10, α = 15 / 10 / 2, v(0) = 12 V, envelope ±12.25 e^(−2t), first undershoot −6.32 V at 0.32 s', () => {
    const base = { ...PRESETS.fig2 };
    const o = solve({ ...base, R: 15 });
    const c = solve({ ...base, R: 10 });
    const u = solve({ ...base, R: 2 });
    expect([o.regime, c.regime, u.regime]).toEqual(['over', 'critical', 'under']);
    close(u.wd, Math.sqrt(96));
    expect(u.wd.toFixed(2)).toBe('9.80');
    expect(u.M.toFixed(2)).toBe('12.25');
    const m = minimum(u, 1);
    expect(m.t).toBeCloseTo(Math.PI / u.wd, 3);
    expect(m.t.toFixed(2)).toBe('0.32');
    expect(m.v.toFixed(2)).toBe('-6.32');
    // the ghost overlay uses the figure's three ζ: R = 15, 10, 2 Ω
    close(rForZeta('series', 0.5, 0.02, GHOST_ZETA.over), 15);
    close(rForZeta('series', 0.5, 0.02, GHOST_ZETA.critical), 10);
    close(rForZeta('series', 0.5, 0.02, GHOST_ZETA.under), 2);
    // a point of the sheet's red curve: t = 0.3 s → 4.47 V (y = 158.3 in its 10.83 px/V plot)
    expect(o.v(0.3)).toBeCloseTo(4.47, 2);
  });

  it('act 3: under-damped poles lie on |s| = ω0, the slow pole → −ω0²/(2α)', () => {
    for (const R of [1, 3, 6, 9]) {
      const s = solve({ ...PRESETS.ex1, R });
      close(Math.hypot(s.s1.re, s.s1.im), 10);
    }
    const far = solve({ ...PRESETS.ex1, R: 400 });
    close(far.s1.re, -100 / (2 * far.alpha), 1e-3);
  });

  it('act 4 (Sadiku 8.3): L = 0.5 H, C = 0.02 F, v_C(0) = 12 V, i(0) = 0', () => {
    const s1 = solve({ ...PRESETS.ex1, R: 12.5 });
    close(s1.w0, 10);
    close(s1.rcrit, 10);
    close(s1.d0, 0);
    expect(s1.regime).toBe('over');
    close(s1.s1.re, -5);
    close(s1.s2.re, -20);
    close(s1.A1, 16);
    close(s1.A2, -4);
    for (const t of [0.05, 0.2, 0.7]) {
      close(s1.v(t), 16 * Math.exp(-5 * t) - 4 * Math.exp(-20 * t));
      close(current(s1, t), 1.6 * (Math.exp(-20 * t) - Math.exp(-5 * t)));
    }
    const s2 = solve({ ...PRESETS.ex1, R: 10 });
    expect(s2.regime).toBe('critical');
    close(s2.A1, 12);
    close(s2.A2, 120);
    for (const t of [0.05, 0.2, 0.7]) close(current(s2, t), -24 * t * Math.exp(-10 * t));
    const s3 = solve({ ...PRESETS.ex1, R: 6 });
    expect(s3.regime).toBe('under');
    close(s3.alpha, 6);
    close(s3.wd, 8);
    close(s3.B1, 12);
    close(s3.B2, 9);
    close(s3.M, 15);
    expect(((s3.phi * 180) / Math.PI).toFixed(2)).toBe('36.87');
    for (const t of [0.05, 0.2, 0.7]) close(current(s3, t), -3 * Math.exp(-6 * t) * Math.sin(8 * t));
    // i(t) changes sign at π/8 ≈ 0.393 s, when v_C is already negative
    expect(Math.PI / 8).toBeCloseTo(0.393, 3);
    expect(s3.v(Math.PI / 8)).toBeLessThan(0);
    // the sheet's current plot: troughs −0.756 A, −0.883 A, −1.197 A
    expect(Math.min(...Array.from({ length: 800 }, (_, k) => current(s1, k / 1000)))).toBeCloseTo(-0.756, 3);
    expect(Math.min(...Array.from({ length: 800 }, (_, k) => current(s2, k / 1000)))).toBeCloseTo(-0.883, 3);
    expect(Math.min(...Array.from({ length: 800 }, (_, k) => current(s3, k / 1000)))).toBeCloseTo(-1.197, 3);
  });

  it('act 5 (Sadiku 8.4): R = 50 Ω, L = 160 mH, C = 25 µF, v(0) = 12 V, i_L(0) = 0.15 A', () => {
    const s = solve(PRESETS.ex2);
    close(s.alpha, 400);
    close(s.w0, 500);
    close(s.rcrit, 40);
    close(s.wd, 300);
    close(s.d0, -15600);
    close(s.B1, 12);
    close(s.B2, -36);
    const z = zeros(s, 0.015);
    expect((z[0] * 1000).toFixed(2)).toBe('1.07');
    const m = minimum(s, 0.015);
    expect((m.t * 1000).toFixed(2)).toBe('3.22');
    expect(m.v.toFixed(2)).toBe('-6.29');
    close(12 / 15600, 0.000769, 1e-3);
  });

  it('the guided example: R = 25 Ω, L = 0.4 H, C = 250 µF, v(0) = 15 V, i_L(0) = 0.15 A', () => {
    const s = solve(PRESETS.gd);
    close(s.alpha, 80);
    close(s.w0, 100);
    close(s.wd, 60);
    close(s.rcrit, 20);
    close(s.d0, -3000);
    close(s.B1, 15);
    close(s.B2, -30);
    // the wrong options of step 1 and step 5
    close(25 / (2 * 0.4), 31.25);
    close(1 / (25 * 250e-6), 160);
    close(-3000 / 60, -50);
    close((-3000 - 1200) / 60, -70);
    // step 4's wrong option: only the resistor branch
    close(-(15 / 25) / 250e-6, -2400);
  });

  it('act 6, the breadboard: 10 mH, 1 µF, R_L ≈ 10 Ω, 5 V', () => {
    const b = { ...PRESETS.bench };
    const s = solve(b);
    close(s.w0, 1e4);
    expect((s.w0 / (2 * Math.PI)).toFixed(2)).toBe('1591.55');
    expect(((2 * Math.PI) / s.w0) * 1e6).toBeCloseTo(628.3, 1);
    close(s.rcrit, 200);
    close(windowOf(s.w0), 2e-3);
    // 40 Ω: α = 2000, f_d ≈ 1.56 kHz, first undershoot ≈ −2.63 V
    close(s.alpha, 2000);
    expect((s.wd / (2 * Math.PI) / 1000).toFixed(2)).toBe('1.56');
    expect(minimum(s, 2e-3).v).toBeCloseTo(-2.63, 2);
    // pot at 0 (only R_L = 10 Ω): undershoot ≈ −4.27 V; the sheet's "−3.5 V" needs R ≈ 23 Ω
    expect(minimum(solve({ ...b, R: R_L }), 2e-3).v).toBeCloseTo(-4.27, 2);
    expect(minimum(solve({ ...b, R: 22.6 }), 2e-3).v).toBeCloseTo(-3.5, 1);
    // 500 Ω: α = 25000, s1 ≈ −2087
    const o = solve({ ...b, R: 500 });
    close(o.alpha, 25000);
    expect(Math.round(o.s1.re)).toBe(-2087);
    // critical on the pot: 200 − R_L; quiz 2: R_L = 12 Ω → 188 Ω
    expect(200 - R_L).toBe(190);
    expect(200 - 12).toBe(188);
    // peak current stays far below the 250 mA limit: |i| ≤ v0 / (ω_d L) = 51 mA
    let peak = 0;
    for (const R of [R_L, 40, 200, 500]) {
      const x = solve({ ...b, R });
      for (let k = 0; k <= 2000; k++) peak = Math.max(peak, Math.abs(current(x, (k / 2000) * 2e-3)));
    }
    expect(peak).toBeLessThan(0.052);
    expect(peak).toBeGreaterThan(0.045);
  });

  it('the quiz', () => {
    // Q1: critical parallel, R doubled → α halves → under-damped
    const crit = { topo: 'parallel' as const, L: 0.01, C: 1e-6, v0: 5, i0: 0, R: 50 };
    expect(solve(crit).regime).toBe('critical');
    expect(solve({ ...crit, R: 100 }).regime).toBe('under');
    close(solve({ ...crit, R: 100 }).alpha, solve(crit).alpha / 2);
    // Q4: v(0) = 10, v'(0) = 10, α = 3, ω_d = 4 → B2 = 10
    close((10 + 3 * 10) / 4, 10);
  });

  it('every solution satisfies the differential equation and its two initial values', () => {
    const cases: Circuit[] = [PRESETS.ex1, { ...PRESETS.ex1, R: 10 }, { ...PRESETS.ex1, R: 6 }, PRESETS.ex2, PRESETS.gd, PRESETS.bench, { ...PRESETS.bench, R: 500 }];
    for (const c of cases) {
      const s = solve(c);
      close(s.v(0), c.v0);
      close(s.dv(0), s.d0);
      for (const t of [0.3, 1.1, 2.5].map((k) => k / s.w0)) expect(Math.abs(residual(c, t))).toBeLessThan(1e-5);
    }
  });

  it('is continuous through the critical boundary (no NaN, no jump)', () => {
    const rc = 10;
    for (const R of [rc * (1 - 2e-3), rc * (1 - 5e-4), rc, rc * (1 + 5e-4), rc * (1 + 2e-3)]) {
      const s = solve({ ...PRESETS.ex1, R });
      for (const t of [0.05, 0.3, 1]) {
        expect(Number.isFinite(s.v(t))).toBe(true);
        expect(Math.abs(s.v(t) - solve({ ...PRESETS.ex1, R: rc }).v(t))).toBeLessThan(0.05);
      }
    }
  });
});
