import { describe, expect, it } from 'vitest';
import { aIdeal, aMax, aPrac, at, diffOut, driftLevel, driftRate, fb, fc, halfSwing, intSlope, lossyDc, RC, RF, RF_LOW, rfMin, simulate, triSlope, tSat, VOH, VOL } from './model';

describe('W4-L3 sheet numbers', () => {
  it('act 1: RC = 1 ms, −1/RC = −1000 1/s, +2 V in → −2 V/ms', () => {
    expect(RC).toBeCloseTo(1e-3, 12);
    expect(-1 / RC).toBeCloseTo(-1000, 6);
    expect(intSlope(2)).toBeCloseTo(-2000, 6);
  });

  it('act 2: 500 Hz ±2 V square → ±1 V triangle (2 Vpp), |k| = 2 V/ms', () => {
    expect(halfSwing(2, 500)).toBeCloseTo(2, 9);
    const tr = simulate({ mode: 'int', wave: 'square', f: 500, amp: 2, vos: 0, ic: 'sym' });
    expect(tr.max).toBeCloseTo(1, 2);
    expect(tr.min).toBeCloseTo(-1, 2);
    expect(tr.clipped).toBe(false);
  });

  it('§2.2 / guided example: 250 Hz ±3 V from v_o(0) = 0 → −6 V at 2 ms, 0 V at 4 ms, 6 Vpp, no clipping', () => {
    expect(intSlope(3) / 1000).toBeCloseTo(-3, 9);
    const tr = simulate({ mode: 'int', wave: 'square', f: 250, amp: 3, vos: 0, ic: 'zero' });
    expect(at(tr, 2e-3)).toBeCloseTo(-6, 2);
    expect(at(tr, 4e-3)).toBeCloseTo(0, 2);
    expect(tr.max - tr.min).toBeCloseTo(6, 2);
    expect(tr.clipped).toBe(false);
  });

  it('§2.2 (c): ±5 V reaches −7.5 V at 1.5 ms and the −8.9 V rail at 1.78 ms, then clips', () => {
    expect(-7.5 / intSlope(5)).toBeCloseTo(1.5e-3, 9);
    expect(VOL / intSlope(5)).toBeCloseTo(1.78e-3, 9);
    const tr = simulate({ mode: 'int', wave: 'square', f: 250, amp: 5, vos: 0, ic: 'zero' });
    expect(tr.clipped).toBe(true);
    expect(tr.min).toBeCloseTo(VOL, 6);
    expect(tr.idealMin).toBeCloseTo(-10, 2);
    // clipped flat from 1.78 ms to 2 ms, then +10 V up: +1.1 V at 4 ms
    expect(at(tr, 1.9e-3)).toBeCloseTo(VOL, 3);
    expect(at(tr, 4e-3)).toBeCloseTo(VOL + 10, 2);
  });

  it('act 3: 3 mV offset → 3 V/s, +7.5 V rail in 2.5 s; R_f = 100 kΩ → 33 mV, f_c ≈ 15.92 Hz, 500/f_c ≈ 31.4', () => {
    expect(driftRate()).toBeCloseTo(3, 9);
    expect(tSat()).toBeCloseTo(2.5, 9);
    expect(lossyDc()).toBeCloseTo(0.033, 9);
    expect(fc()).toBeCloseTo(15.915, 3);
    expect(500 / fc()).toBeCloseTo(31.4, 1);
    expect(fc(RF_LOW)).toBeCloseTo(1.5915, 3);
    expect(lossyDc(RF_LOW)).toBeCloseTo(0.303, 9);
    expect(driftLevel('int', 2.5)).toBeCloseTo(VOH, 9);
    expect(driftLevel('int', 4)).toBe(VOH);
    expect(driftLevel('lossy', 4)).toBeCloseTo(0.033, 6);
    // the lossy integrator with the chip's offset sits 33 mV up
    const g = simulate({ mode: 'lossy', wave: 'gnd', f: 500, amp: 2, vos: 3e-3, ic: 'sym' });
    expect(g.max).toBeCloseTo(0.033, 4);
  });

  it('act 4: 500 Hz ±2 V triangle → slope ±4 V/ms → ∓4 V square (8 Vpp)', () => {
    expect(triSlope(2, 500)).toBeCloseTo(4000, 6);
    expect(diffOut(4000)).toBeCloseTo(-4, 9);
    const tr = simulate({ mode: 'diff', wave: 'tri', f: 500, amp: 2, vos: 0, ic: 'sym' });
    expect(tr.max).toBeCloseTo(4, 1);
    expect(tr.min).toBeCloseTo(-4, 1);
    expect(tr.clipped).toBe(false);
  });

  it('act 5: |A_ideal(50 kHz)| ≈ 314.16 → 15.71 V; R_s = 1 kΩ: 10×, f_b ≈ 1591.55 Hz, 9.995 → 0.50 V; 500 Hz 3.142 / 2.997 (−4.6 %)', () => {
    expect(aIdeal(50e3)).toBeCloseTo(314.16, 2);
    expect(aIdeal(50e3) * 0.05).toBeCloseTo(15.71, 2);
    expect(aMax()).toBe(10);
    expect(fb()).toBeCloseTo(1591.55, 2);
    expect(aPrac(50e3)).toBeCloseTo(9.995, 3);
    expect(aPrac(50e3) * 0.05).toBeCloseTo(0.5, 3);
    expect(aIdeal(500)).toBeCloseTo(3.142, 3);
    expect(aPrac(500)).toBeCloseTo(2.997, 3);
    expect(1 - aPrac(500) / aIdeal(500)).toBeCloseTo(0.046, 3);
    expect((aIdeal(50e3) * 0.05) / (aPrac(50e3) * 0.05)).toBeGreaterThan(31);
  });

  it('guided step 5: f_c ≤ 25 Hz needs R_f ≥ 63.7 kΩ; 1 k / 10 k / 100 k give 1592 / 159 / 15.9 Hz', () => {
    expect(rfMin(250)).toBeCloseTo(63_662, -1);
    expect(fc(1e3)).toBeCloseTo(1591.5, 1);
    expect(fc(10e3)).toBeCloseTo(159.15, 2);
    expect(fc(RF)).toBeLessThan(25);
    expect(250 / fc(RF)).toBeGreaterThanOrEqual(10);
  });

  it('act 6 troubleshooting: 50 Hz ±2 V into RC = 1 ms swings 20 V > the window, so the triangle clips', () => {
    expect(halfSwing(2, 50)).toBeCloseTo(20, 9);
    const tr = simulate({ mode: 'lossy', wave: 'square', f: 50, amp: 2, vos: 3e-3, ic: 'sym' });
    expect(tr.clipped).toBe(true);
    const ok = simulate({ mode: 'lossy', wave: 'square', f: 500, amp: 2, vos: 3e-3, ic: 'sym' });
    expect(ok.clipped).toBe(false);
    // the lossy integrator at 500 Hz is still nearly the ideal ±1 V triangle
    expect(ok.max - ok.min).toBeGreaterThan(1.95);
    expect(ok.max - ok.min).toBeLessThan(2.01);
  });

  it('quiz: Q1 +4 V/ms, Q3 −2.5 V', () => {
    expect(intSlope(-4, 20e3 * 50e-9) / 1000).toBeCloseTo(4, 9);
    expect(diffOut(2500)).toBeCloseTo(-2.5, 9);
  });

  it('ideal integrator with the 3 mV offset and a signal hangs from the +7.5 V rail', () => {
    const tr = simulate({ mode: 'int', wave: 'square', f: 500, amp: 2, vos: 3e-3, ic: 'sym', drift: driftLevel('int', 3) });
    expect(tr.max).toBeCloseTo(VOH, 6);
    expect(tr.min).toBeCloseTo(VOH - 2, 2);
    expect(tr.clipped).toBe(true);
  });
});
