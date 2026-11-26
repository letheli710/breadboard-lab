import { describe, expect, it } from 'vitest';
import {
  BENCH_V,
  ceramicCode,
  deratingOk,
  DEVICES,
  energy,
  EX1,
  EX2,
  EX3,
  EX4,
  EX5,
  ex2Points,
  ex3charge,
  ex3i,
  ex3v,
  fmtC,
  GUIDED,
  ladder,
  mirrorR,
  net5,
  plateC,
  pwl,
  R_DISCHARGE,
  riseCurrent,
  segCurrents,
  seriesC,
  seriesPair,
  slope,
  teardown,
} from './model';

describe('W4-L1 capacitors', () => {
  it('example 1: A = 20 cm², d = 1 mm → C_air = 17.71 pF, C_mica = 88.54 pF', () => {
    const air = plateC(EX1.er1, EX1.A, EX1.d);
    const mica = plateC(EX1.er2, EX1.A, EX1.d);
    expect(air).toBeCloseTo(1.7708e-11, 15);
    expect(mica).toBeCloseTo(88.54e-12, 15);
    expect(mica / air).toBeCloseTo(5, 12);
    expect(fmtC(air)).toBe('17.71 pF');
    expect(fmtC(mica)).toBe('88.54 pF');
    // the layer-02 readout at the same set-up
    expect(teardown(1, 20, 1, 5).C).toBeCloseTo(air, 18);
    expect(teardown(1, 20, 1, 5).E).toBeCloseTo(5000, 9);
  });

  it('104 = 10 × 10⁴ pF = 0.1 μF; the bench parts and the 2× derating rule', () => {
    expect(ceramicCode('104')).toBeCloseTo(0.1e-6, 18);
    expect(DEVICES.cer.C).toBeCloseTo(ceramicCode('104'), 18);
    expect(deratingOk(25, 5)).toBe(true);
    expect(deratingOk(16, 5)).toBe(true);
    expect(deratingOk(25, 9)).toBe(true);
    expect(deratingOk(10, 9)).toBe(false); // quiz Q1 A
    expect(deratingOk(6.3, 9)).toBe(false); // quiz Q1 D
    expect(deratingOk(DEVICES.elec.rating, BENCH_V)).toBe(true);
    // the discharge resistor: τ = 1 kΩ × 100 μF = 0.1 s; at 5 V the electrolytic holds 1.25 mJ
    expect(R_DISCHARGE * DEVICES.elec.C).toBeCloseTo(0.1, 12);
    expect(energy(DEVICES.elec.C, BENCH_V)).toBeCloseTo(1.25e-3, 12);
    // and the resistor across 5 V: 5 mA, 25 mW (well under 1/4 W)
    expect((BENCH_V / R_DISCHARGE) * BENCH_V).toBeCloseTo(0.025, 12);
  });

  it('example 2: i = +10, 0, −20, +10 mA; slopes 5000, 0, −10000, 5000 V/s; w_max = 100 μJ', () => {
    const i = segCurrents(EX2.C, EX2.pts);
    expect(i.map((x) => +(x * 1e3).toFixed(9))).toEqual([10, 0, -20, 10]);
    expect(slope(EX2.pts, 1e-3)).toBeCloseTo(5000, 6);
    expect(slope(EX2.pts, 3e-3)).toBeCloseTo(0, 6);
    expect(slope(EX2.pts, 5e-3)).toBeCloseTo(-10000, 6);
    expect(slope(EX2.pts, 7e-3)).toBeCloseTo(5000, 6);
    expect(pwl(EX2.pts, 5e-3)).toBeCloseTo(0, 9);
    const vmax = Math.max(...Array.from({ length: 801 }, (_, k) => Math.abs(pwl(EX2.pts, k * 1e-5))));
    expect(vmax).toBeCloseTo(10, 9);
    expect(energy(EX2.C, vmax)).toBeCloseTo(100e-6, 12);
  });

  it('the rise-time test: Δt = 2 ms is the sheet; Δt → 0 sends the current pulse up as 1/Δt', () => {
    expect(ex2Points(2e-3)).toEqual(EX2.pts);
    expect(riseCurrent(2e-3)).toBeCloseTo(10e-3, 12);
    expect(riseCurrent(0.01e-3)).toBeCloseTo(2, 9);
    const p = ex2Points(0.1e-3);
    expect(pwl(p, 1.85e-3)).toBe(0);
    expect(pwl(p, 2e-3)).toBeCloseTo(10, 9);
    expect(slope(p, 1.95e-3) * EX2.C).toBeCloseTo(0.2, 9);
  });

  it('example 3: v(4 ms) = 3.2 V, w = 256 μJ; v(10 ms) = 2.0 V, w = 100 μJ; ±60 μC', () => {
    expect(ex3i(1e-3)).toBe(15e-3);
    expect(ex3i(5e-3)).toBe(-10e-3);
    expect(ex3charge(4e-3)).toBeCloseTo(60e-6, 12);
    expect(ex3charge(10e-3)).toBeCloseTo(0, 12);
    expect(ex3v(4e-3)).toBeCloseTo(3.2, 9);
    expect(ex3v(10e-3)).toBeCloseTo(2.0, 9);
    expect(energy(EX3.C, ex3v(4e-3))).toBeCloseTo(256e-6, 12);
    expect(energy(EX3.C, ex3v(10e-3))).toBeCloseTo(100e-6, 12);
    // forgetting v(0) shifts everything down by 2 V
    expect(ex3v(4e-3, false)).toBeCloseTo(1.2, 9);
  });

  it('example 4: R_p = 3 kΩ, R_tot = 6 kΩ, I_s = 2 mA, V_C1 = 6 V, V_C2 = 4 V, 180 + 160 = 340 μJ', () => {
    const s = ladder(EX4);
    expect(s.Rp).toBeCloseTo(3e3, 9);
    expect(s.Req).toBeCloseTo(6e3, 9);
    expect(s.Is).toBeCloseTo(2e-3, 12);
    expect(s.VC1).toBeCloseTo(6, 9);
    expect(s.VC2).toBeCloseTo(4, 9);
    expect(s.I2).toBeCloseTo(1e-3, 12);
    expect(s.I34).toBeCloseTo(1e-3, 12);
    expect(s.w1).toBeCloseTo(180e-6, 12);
    expect(s.w2).toBeCloseTo(160e-6, 12);
    expect(s.wt).toBeCloseTo(340e-6, 12);
  });

  it('the guided example: R_eq = 3 kΩ, I_s = 3 mA, V_C1 = 6 V, V_C2 = 3 V, 1.80 + 0.90 = 2.70 mJ', () => {
    const s = ladder(GUIDED);
    expect(s.Rp).toBeCloseTo(2e3, 9);
    expect(s.Req).toBeCloseTo(3e3, 9);
    expect(s.Is).toBeCloseTo(3e-3, 12);
    expect(s.VR1).toBeCloseTo(3, 9); // the step-3 wrong option A
    expect(s.VC1).toBeCloseTo(6, 9);
    expect(s.VB).toBeCloseTo(3, 9);
    expect(s.iR5).toBe(0);
    expect(s.VC2).toBeCloseTo(3, 9);
    expect(s.w1).toBeCloseTo(1.8e-3, 12);
    expect(s.w2).toBeCloseTo(0.9e-3, 12);
    expect(s.wt).toBeCloseTo(2.7e-3, 12);
    // the wrong options: R5 counted in (5 kΩ, 1.8 mA), no ½ (3.6 + 1.8 mJ)
    expect(GUIDED.Vs / (s.Req + GUIDED.R5)).toBeCloseTo(1.8e-3, 12);
    expect(GUIDED.C1 * 36 + GUIDED.C2 * 9).toBeCloseTo(5.4e-3, 12);
    // all capacitors on the 9 V circuit are rated 25 V ≥ 2 × 9 V
    expect(deratingOk(25, GUIDED.Vs)).toBe(true);
  });

  it('example 5: C34 = 10, C234 = 30, Ceq = 20 μF, Q = 180 μC, 3 / 6 / 3 / 3 V, w = 810 μJ both ways', () => {
    const s = net5(EX5);
    expect(s.C34).toBeCloseTo(10e-6, 15);
    expect(s.C234).toBeCloseTo(30e-6, 15);
    expect(s.Ceq).toBeCloseTo(20e-6, 15);
    expect(s.Q).toBeCloseTo(180e-6, 15);
    expect(s.V1).toBeCloseTo(3, 9);
    expect(s.V2).toBeCloseTo(6, 9);
    expect(s.V3).toBeCloseTo(3, 9);
    expect(s.V4).toBeCloseTo(3, 9);
    expect(s.V1 + s.V234).toBeCloseTo(EX5.Vs, 9);
    expect(s.w.map((w) => +(w * 1e6).toFixed(6))).toEqual([270, 360, 90, 90]);
    expect(s.wsum).toBeCloseTo(810e-6, 12);
    expect(s.weq).toBeCloseTo(810e-6, 12);
    // the mirror: the same numbers as kΩ, R1 + R2 ∥ (R3 + R4) = 60 + 20 ∥ 40 = 73.33
    expect(mirrorR({ C1: 60, C2: 20, C3: 20, C4: 20, Vs: 9 })).toBeCloseTo(60 + 40 / 3, 9);
    // series is always below the smallest
    expect(seriesC(20e-6, 20e-6)).toBeLessThan(20e-6);
  });

  it('quiz numbers: Q2 40 mA; Q3 0.4 mJ / 1.6 mJ; Q4 Ceq 20 μF, 8 V on the 30 μF', () => {
    expect((10e-6 * (10 - 2)) / 2e-3).toBeCloseTo(40e-3, 12);
    expect((10e-6 * 10) / 2e-3).toBeCloseTo(50e-3, 12); // Q2 B: from 0 V
    expect(energy(50e-6, 4)).toBeCloseTo(0.4e-3, 12);
    expect(energy(50e-6, 8)).toBeCloseTo(1.6e-3, 12);
    const p = seriesPair(30e-6, 60e-6, 12);
    expect(p.Ceq).toBeCloseTo(20e-6, 15);
    expect(p.Q).toBeCloseTo(240e-6, 15);
    expect(p.V1).toBeCloseTo(8, 9);
    expect(p.V2).toBeCloseTo(4, 9);
  });
});
