import { describe, expect, it } from 'vitest';
import {
  bench,
  halfPower,
  halfPowerW,
  LAB,
  LAB_F0,
  LAB_W0,
  LAB_X0,
  mag,
  parallelPhasors,
  parallelQ,
  resp,
  scopeScale,
  seriesPhasors,
  seriesQ,
  sweep,
  vcPeak,
  vcRatio,
  w0Of,
} from './model';

const TAU = 2 * Math.PI;

describe('normalised resonance (act 3 table and figure, layer 02)', () => {
  it('the half-power points of the sheet table: Q = 25, 10, 3.16, 2', () => {
    const rows: [number, number, number, number][] = [
      // Q, exact ω1/ω0, approx ω1/ω0, error %
      [25, 0.9802, 0.98, 0.02],
      [10, 0.9512, 0.95, 0.131],
      [Math.sqrt(10), 0.8543, 0.8419, 1.454],
      [2, 0.7808, 0.75, 3.942],
    ];
    for (const [q, ex, ap, err] of rows) {
      const h = halfPower(q);
      expect(h.u1).toBeCloseTo(ex, 4);
      expect(h.a1).toBeCloseTo(ap, 4);
      expect(h.err1).toBeCloseTo(err, err < 0.1 ? 3 : 2);
      // exact identities, any Q
      expect(h.bw).toBeCloseTo(1 / q, 12);
      expect(h.gm).toBeCloseTo(1, 12);
      expect(resp(h.u1, q)).toBeCloseTo(1 / Math.SQRT2, 12);
      expect(resp(h.u2, q)).toBeCloseTo(1 / Math.SQRT2, 12);
    }
  });

  it('the sheet figure: the curves and half-power markers sit where it draws them', () => {
    const X = (u: number) => 80 + (u - 0.2) * (600 / 1.8);
    const Y = (v: number) => 310 - v * 250;
    expect(Y(resp(0.2, 2))).toBeCloseTo(284.1, 1);
    expect(Y(resp(2, 10))).toBeCloseTo(293.4, 1);
    expect(Y(1 / Math.SQRT2)).toBeCloseTo(133.2, 1);
    expect(X(halfPower(2).u1)).toBeCloseTo(273.6, 1);
    expect(X(halfPower(2).u2)).toBeCloseTo(440.3, 1);
    expect(X(halfPower(10).u1)).toBeCloseTo(330.4, 1);
    expect(X(halfPower(10).u2)).toBeCloseTo(363.7, 1);
  });

  it('series phasors: at u = 1, V_R = V_s and |V_L| = |V_C| = Q, 180° apart; below ω0 capacitive', () => {
    const p = seriesPhasors(1, 10);
    expect(p.vr.re).toBeCloseTo(1, 12);
    expect(p.vr.im).toBeCloseTo(0, 12);
    expect(mag(p.vl)).toBeCloseTo(10, 12);
    expect(mag(p.vc)).toBeCloseTo(10, 12);
    expect(p.vl.im + p.vc.im).toBeCloseTo(0, 12);
    // KVL off resonance
    const q = seriesPhasors(0.7, 5);
    expect(q.vr.re + q.vl.re + q.vc.re).toBeCloseTo(1, 12);
    expect(q.vr.im + q.vl.im + q.vc.im).toBeCloseTo(0, 12);
    expect(q.i.im).toBeGreaterThan(0); // current leads: capacitive
  });

  it('parallel phasors: at u = 1, I_R = I_s, |I_L| = |I_C| = Q and they cancel; KCL holds', () => {
    const p = parallelPhasors(1, 5);
    expect(p.ir.re).toBeCloseTo(1, 12);
    expect(mag(p.il)).toBeCloseTo(5, 12);
    expect(mag(p.ic)).toBeCloseTo(5, 12);
    const q = parallelPhasors(1.3, 5);
    expect(q.ir.re + q.il.re + q.ic.re).toBeCloseTo(1, 12);
    expect(q.ir.im + q.il.im + q.ic.im).toBeCloseTo(0, 12);
  });
});

describe('act 3: Sadiku 14.5 series example (R = 2 Ω, L = 1 mH, C = 0.4 µF, V_m = 5 V)', () => {
  it('ω0 = 50 krad/s, f0 = 7957.75 Hz, Q = 25, B = 2000 rad/s (318.31 Hz)', () => {
    const w0 = w0Of(1e-3, 0.4e-6);
    expect(w0).toBeCloseTo(50000, 6);
    expect(w0 / TAU).toBeCloseTo(7957.75, 2);
    const q = seriesQ(2, 1e-3, 0.4e-6);
    expect(q).toBeCloseTo(25, 9);
    expect(w0 / q).toBeCloseTo(2000, 6);
    expect(w0 / q / TAU).toBeCloseTo(318.31, 2);
  });
  it('ω1 = 49009.999, ω2 = 51009.999 rad/s, √(ω1ω2) = ω0, error 0.020 %; I_max = 2.5 A, |V_C| = 125 V', () => {
    const [w1, w2] = halfPowerW(2 / (2 * 1e-3), 50000);
    expect(Math.sqrt(1000 ** 2 + 50000 ** 2)).toBeCloseTo(50009.999, 3);
    expect(w1).toBeCloseTo(49009.999, 3);
    expect(w2).toBeCloseTo(51009.999, 3);
    expect(Math.sqrt(w1 * w2)).toBeCloseTo(50000, 6);
    expect(((w1 - 49000) / w1) * 100).toBeCloseTo(0.02, 3);
    expect(5 / 2).toBe(2.5);
    expect(25 * 5).toBe(125);
  });
});

describe('act 4: parallel example (R = 1 kΩ, L = 4 mH, C = 0.1 µF, I_m = 10 mA) and Sadiku Example 14.9', () => {
  it('ω0 = 50 krad/s, Q = 5, B = 10 krad/s (1591.55 Hz), ω1,2 = 45249.378 / 55249.378, errors 0.551 % / 0.451 %', () => {
    const w0 = w0Of(4e-3, 0.1e-6);
    expect(w0).toBeCloseTo(50000, 6);
    expect(parallelQ(1000, 4e-3, 0.1e-6)).toBeCloseTo(5, 9);
    expect(w0 * 1000 * 0.1e-6).toBeCloseTo(5, 9);
    expect(1 / (1000 * 0.1e-6)).toBeCloseTo(10000, 6);
    expect(10000 / TAU).toBeCloseTo(1591.55, 2);
    const [w1, w2] = halfPowerW(1 / (2 * 1000 * 0.1e-6), w0);
    expect(w1).toBeCloseTo(45249.378, 3);
    expect(w2).toBeCloseTo(55249.378, 3);
    expect(w1 / TAU / 1000).toBeCloseTo(7.2, 2);
    expect(w2 / TAU / 1000).toBeCloseTo(8.79, 2);
    expect(((w1 - 45000) / w1) * 100).toBeCloseTo(0.551, 3);
    expect(((w2 - 55000) / w2) * 100).toBeCloseTo(0.451, 3);
    expect(10e-3 * 1000).toBeCloseTo(10, 12);
    expect(5 * 10).toBe(50);
  });
  it('Example 14.9: R = 8 kΩ, L = 0.2 mH, C = 8 µF → ω0 = 25 krad/s, Q = 1600, B_f = 2.49 Hz', () => {
    const w0 = w0Of(0.2e-3, 8e-6);
    expect(w0).toBeCloseTo(25000, 6);
    const q = w0 * 8000 * 8e-6;
    expect(q).toBeCloseTo(1600, 6);
    expect(w0 / q / TAU).toBeCloseTo(2.49, 2);
  });
});

describe('the guided example (R = 10 Ω, L = 2 mH, C = 0.2 µF, V_m = 5 V)', () => {
  it('ω0 = 50 krad/s (7.96 kHz), Q = 10, B = 5 krad/s (795.77 Hz)', () => {
    const w0 = w0Of(2e-3, 0.2e-6);
    expect(w0).toBeCloseTo(50000, 6);
    expect(w0 / TAU / 1000).toBeCloseTo(7.96, 2);
    expect(seriesQ(10, 2e-3, 0.2e-6)).toBeCloseTo(10, 9);
    expect(1 / (w0 * 10 * 0.2e-6)).toBeCloseTo(10, 9);
    expect(10 / 2e-3).toBeCloseTo(5000, 9);
    expect(5000 / TAU).toBeCloseTo(795.77, 2);
    // the wrong options
    expect(1 / Math.sqrt(10 * 2e-3 * 0.2e-6)).toBeCloseTo(15811, 0);
    expect(1 / Math.sqrt(10 * 2e-3 * 0.2e-6) / TAU / 1000).toBeCloseTo(2.52, 2);
    expect((10 * 50000) / TAU / 1000).toBeCloseTo(79.58, 2);
  });
  it('ω1,2 exact = 47562.46 / 52562.46 rad/s (62.46 to the right of 47500 / 52500), error 0.13 %; |V_C| = 50 V', () => {
    const [w1, w2] = halfPowerW(10 / (2 * 2e-3), 50000);
    expect(w1).toBeCloseTo(47562.46, 2);
    expect(w2).toBeCloseTo(52562.46, 2);
    expect(w1 - 47500).toBeCloseTo(62.46, 2);
    expect(w2 - 52500).toBeCloseTo(62.46, 2);
    expect(((w1 - 47500) / w1) * 100).toBeCloseTo(0.13, 2);
    expect(w1 / 50000).toBeCloseTo(0.9512, 4);
    expect(10 * 5).toBe(50);
  });
});

describe('the bench (act 5, layer 03): L = 10 mH, C = 100 nF, R = 100 Ω', () => {
  it('f0 = 5032.92 Hz, ω0 = 31622.78 rad/s, X0 = 316.23 Ω, Q = 3.16, B_f = 1591.55 Hz, f1 = 4299.67, f2 = 5891.22 Hz', () => {
    expect(LAB_W0).toBeCloseTo(31622.78, 2);
    expect(LAB_F0).toBeCloseTo(5032.92, 2);
    expect(LAB_X0).toBeCloseTo(316.23, 2);
    const b = bench(LAB_F0, 1, 'vR', false);
    expect(b.q).toBeCloseTo(3.162, 3);
    expect(b.bf).toBeCloseTo(1591.55, 2);
    expect(b.f1).toBeCloseTo(4299.67, 1);
    expect(b.f2).toBeCloseTo(5891.22, 1);
  });

  it('1 Vpp at f0: 5 mA peak, 1.25 mW in R, v_R in phase with CH1, v_C = 3.16 Vpp lagging 90°', () => {
    const r = bench(LAB_F0, 1, 'vR', false);
    expect(r.iPk * 1000).toBeCloseTo(5, 9);
    expect(r.pR * 1000).toBeCloseTo(1.25, 9);
    expect(r.ch1pp).toBeCloseTo(1, 12);
    expect(r.ch2pp).toBeCloseTo(1, 9);
    expect(r.dphi).toBeCloseTo(0, 6);
    const c = bench(LAB_F0, 1, 'vC', false);
    expect(c.ch2pp).toBeCloseTo(3.162, 3);
    expect(c.dphi).toBeCloseTo(-90, 6);
    expect(c.vlPk).toBeCloseTo(c.vcPk, 9);
    expect(c.locked).toBe(true);
    expect(bench(LAB_F0 + 40, 1, 'vC', false).locked).toBe(false);
  });

  it('the 2 Vpp ceiling stays far inside the ratings: 10 mA, 5 mW, 6.32 Vpp on C (50 V part)', () => {
    const c = bench(LAB_F0, 2, 'vC', false);
    expect(c.iPk * 1000).toBeCloseTo(10, 9);
    expect(c.pR * 1000).toBeCloseTo(5, 9);
    expect(c.ch2pp).toBeCloseTo(6.325, 3);
    expect(c.vcPk).toBeLessThan(LAB.C_RATED / 10);
    expect(c.pR).toBeLessThan(LAB.P_RATED / 40);
  });

  it('with R_L = 20 Ω and R_gen = 50 Ω: Reff = 170 Ω, Q = 1.86, v_C ≈ 1.86 Vpp at f0, B ≈ 2.71 kHz, CH1 sags to ≈ 0.71 Vpp', () => {
    const c = bench(LAB_F0, 1, 'vC', true);
    expect(c.rEff).toBe(170);
    expect(c.q).toBeCloseTo(1.86, 2);
    expect(316.23 / 170).toBeCloseTo(1.86, 2);
    expect(c.ch2pp).toBeCloseTo(1.86, 2);
    expect(c.bf / 1000).toBeCloseTo(2.71, 2);
    expect(c.ch1pp).toBeCloseTo(120 / 170, 9);
    expect(c.dphi).toBeCloseTo(-90, 6);
    // the self-test's "about 1.9 Vpp": the peak of the sweep
    const peak = Math.max(...sweep(1, 'vC', true, 4000).map((p) => p.pp));
    expect(peak).toBeCloseTo(1.93, 2);
  });

  it('the capacitor voltage of a low-Q loop peaks below f0: Q = 3.16 → 3.20 Vpp at 4.91 kHz', () => {
    const q = Math.sqrt(10);
    const p = vcPeak(q);
    expect(p.u * LAB_F0).toBeCloseTo(4905.5, 0);
    expect(p.ratio).toBeCloseTo(3.2026, 4);
    expect(vcRatio(p.u, q)).toBeCloseTo(p.ratio, 9);
    const top = sweep(1, 'vC', false, 4000).reduce((a, b) => (b.pp > a.pp ? b : a));
    expect(top.f).toBeGreaterThan(4880);
    expect(top.f).toBeLessThan(4930);
    expect(top.pp).toBeCloseTo(3.2026, 3);
    // the v_R curve peaks at f0
    const topR = sweep(1, 'vR', false, 4000).reduce((a, b) => (b.pp > a.pp ? b : a));
    expect(Math.abs(topR.f - LAB_F0)).toBeLessThan(15);
  });

  it('the scope fits both traces: V/div and a time base showing about 2.5 periods', () => {
    for (const f of [1000, 2000, 5030, 9000, 15000]) {
      for (const vpp of [0.2, 1, 2]) {
        const b = bench(f, vpp, 'vC', false);
        const { tdiv, vdiv } = scopeScale(f, Math.max(b.ch1pp, b.ch2pp));
        expect(Math.max(b.ch1pp, b.ch2pp) / vdiv).toBeLessThanOrEqual(6.8);
        const periods = (10 * tdiv * f) / 1;
        expect(periods).toBeGreaterThan(1);
        expect(periods).toBeLessThan(6);
      }
    }
  });
});
