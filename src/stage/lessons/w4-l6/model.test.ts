import { describe, expect, it } from 'vitest';
import { EX2, bounds, ex1, ex2, fmt, guided, roots, simulate, type Circuit } from './model';

describe('W4-L6 three-snapshot model', () => {
  it('act 3 (SPDT, 12 V → 30 V): 1 A, 6 V; v_L(0⁺) = 18 V → 36 A/s, i_C(0⁺) = 0; 2.5 A, 15 V', () => {
    const b = bounds(ex1);
    expect(b.iL0).toBeCloseTo(1, 12);
    expect(b.vC0).toBeCloseTo(6, 12);
    expect(b.vL0p).toBeCloseTo(18, 12);
    expect(b.vL0p).toBeCloseTo(30 - 12, 12); // v_L(0⁺) = V2 − V1
    expect(b.diL).toBeCloseTo(36, 12);
    expect(b.iC0p).toBeCloseTo(0, 12);
    expect(b.dvC).toBeCloseTo(0, 12);
    expect(b.iLinf).toBeCloseTo(2.5, 12);
    expect(b.vCinf).toBeCloseTo(15, 12);
  });

  it('act 4 (two sources, S closes): 3 A, 36 V; v_A(0⁺) = 24 V, v_L = 12 V → +24 A/s, i_C = −3 A → −12 V/s; v_A(∞) = 16 V, 4 A, 24 V', () => {
    const b = bounds(ex2);
    expect(b.iL0).toBeCloseTo(3, 12);
    expect(b.vC0).toBeCloseTo(36, 12);
    expect(b.vA0p).toBeCloseTo(24, 12);
    expect(b.vL0p).toBeCloseTo(12, 12);
    expect(b.diL).toBeCloseTo(24, 12);
    expect(b.iC0p).toBeCloseTo(-3, 12);
    expect(b.dvC).toBeCloseTo(-12, 12);
    expect(b.vAinf).toBeCloseTo(16, 12);
    expect(b.vBinf).toBeCloseTo(24, 12);
    expect(b.iLinf).toBeCloseTo(4, 12);
    expect(b.vCinf).toBeCloseTo(24, 12);
    // the sheet's scaled node equations: 9 vA − 3 vB = 72, −3 vA + 5 vB = 72
    expect(9 * b.vAinf! - 3 * b.vBinf!).toBeCloseTo(72, 9);
    expect(-3 * b.vAinf! + 5 * b.vBinf!).toBeCloseTo(72, 9);
    // KCL at A at 0⁺ (leaving positive) is satisfied
    expect((b.vA0p! - EX2.Vs) / EX2.R1 + b.iL0 + (b.vA0p! - b.vC0) / EX2.R3).toBeCloseTo(0, 12);
  });

  it('guided example (S opens): 4 A, 12 V; i_C(0⁺) = 2 A, v_L(0⁺) = 0; 4 V/s, 0 A/s; 3 A, 18 V', () => {
    const b = bounds(guided);
    expect(b.iL0).toBeCloseTo(4, 12);
    expect(b.vC0).toBeCloseTo(12, 12);
    expect(b.iC0p).toBeCloseTo(2, 12);
    expect(b.vL0p).toBeCloseTo(0, 12);
    expect(b.dvC).toBeCloseTo(4, 12);
    expect(b.diL).toBeCloseTo(0, 12);
    expect(b.iLinf).toBeCloseTo(3, 12);
    expect(b.vCinf).toBeCloseTo(18, 12);
    // the wrong options of the guided steps are what the intercepts say they are
    expect(36 / (6 + 6)).toBe(3); // step 1 (b): the t = ∞ circuit
    expect(2 * 0.5).toBe(1); // step 4 (c): i_C · C instead of i_C / C
    expect(36 / 6).toBe(6); // step 5 (c): C taken as a short
    // the R3 current at 0⁻ that has nowhere to go at 0⁺ (step 3's intercept): 12 V / 6 Ω = 2 A
    expect(b.vC0 / 6).toBeCloseTo(b.iC0p, 12);
  });

  it('quiz Q3: −3 A into + of a 0.25 F capacitor gives −12 V/s', () => {
    expect(-3 / 0.25).toBe(-12);
    expect(-3 * 0.25).toBe(-0.75);
  });

  it('the new steady state is a rest point of the t > 0 circuit; all three are overdamped', () => {
    for (const c of [ex1, ex2, guided] as Circuit[]) {
      const f = c.final();
      const r = c.after(f);
      expect(r.iC).toBeCloseTo(0, 9);
      expect(r.vL).toBeCloseTo(0, 9);
      // and the old steady state is a rest point of the t < 0 circuit: i_C(0⁻) = v_L(0⁻) = 0 is the
      // premise; the t > 0 circuit at the old state gives the jumps (bounds)
      const rs = roots(c);
      for (const s of rs) {
        expect(s.re).toBeLessThan(0);
        expect(s.im).toBe(0);
      }
    }
  });

  it('the waveforms: continuous v_C, i_L with the slopes of the 0⁺ snapshot, settling on the final values', () => {
    for (const c of [ex1, ex2, guided] as Circuit[]) {
      const b = bounds(c);
      const { pts } = simulate(c, 6000);
      const i0 = pts.findIndex((p) => p.t === 0);
      // the jump: two samples at t = 0, before (i_C = v_L = 0) and after
      expect(pts[i0].iC).toBe(0);
      expect(pts[i0 + 1].iC).toBeCloseTo(b.iC0p, 12);
      expect(pts[i0 + 1].vL).toBeCloseTo(b.vL0p, 12);
      expect(pts[i0 + 1].vC).toBeCloseTo(b.vC0, 12);
      // the first step after 0⁺ follows the tangent (finite difference ≈ derivative)
      const p = pts[i0 + 2];
      expect((p.vC - b.vC0) / p.t).toBeCloseTo(b.dvC, 0);
      expect((p.iL - b.iL0) / p.t).toBeCloseTo(b.diL, 0);
      const last = pts[pts.length - 1];
      // five slowest time constants: within 1 % (e⁻⁵ ≈ 0.7 %) of the swing from 0⁺ to ∞
      expect(Math.abs(last.vC - b.vCinf)).toBeLessThan(0.01 * Math.abs(b.vCinf - b.vC0) + 1e-9);
      expect(Math.abs(last.iL - b.iLinf)).toBeLessThan(0.01 * Math.abs(b.iLinf - b.iL0) + 1e-9);
    }
  });

  it('fmt: trailing zeros dropped, true minus sign', () => {
    expect(fmt(2.5)).toBe('2.5');
    expect(fmt(-12)).toBe('−12');
    expect(fmt(24, 2, true)).toBe('+24');
    expect(fmt(-1e-12)).toBe('0');
  });
});
