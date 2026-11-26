import { describe, expect, it } from 'vitest';
import { angleOfRl, CASES, etaOf, LAB, peakLocked, pNorm, RATING_W, rlOfAngle, solve } from './model';

describe('W2-L8 maximum power transfer', () => {
  it('act 3: the worked example (V_Th = 16 V, R_Th = 8 Ω)', () => {
    const { vth, rth } = CASES.ex3;
    // R_Th = 6 ∥ 12 + 4, V_Th = 12·12/18 + 1·(4 + 4)
    expect((6 * 12) / (6 + 12) + 4).toBe(rth);
    expect((12 * 12) / 18 + 1 * (4 + 4)).toBe(vth);
    const m = solve(vth, rth, 8);
    expect(m.pl).toBeCloseTo(8, 9);
    expect(m.pmax).toBe(8);
    expect(m.il).toBe(1);
    expect(m.vl).toBe(8);
    expect(m.eta).toBe(0.5);
    expect(m.matched).toBe(true);
    for (const rl of [4, 16]) {
      const s = solve(vth, rth, rl);
      expect(s.pl).toBeCloseTo(64 / 9, 9);
      expect(s.pl / s.pmax).toBeCloseTo(8 / 9, 9);
    }
    expect(solve(vth, rth, 4).eta).toBeCloseTo(1 / 3, 9);
    expect(solve(vth, rth, 16).eta).toBeCloseTo(2 / 3, 9);
  });

  it('guided example: 18 V, 6 Ω, 3 Ω, 3 A, 4 Ω → V_Th = 12 V, R_Th = 6 Ω, p_max = 6 W', () => {
    const vA = 36 / 3; // (V_A − 18)/6 + V_A/3 = 3
    expect((vA - 18) / 6 + vA / 3).toBeCloseTo(3, 12);
    expect(CASES.gd.vth).toBe(vA);
    expect((6 * 3) / (6 + 3) + 4).toBe(CASES.gd.rth);
    const s = solve(CASES.gd.vth, CASES.gd.rth, 6);
    expect(s.pl).toBeCloseTo(6, 9);
    expect(s.ptot).toBeCloseTo(12, 9);
    expect((CASES.gd.vth * CASES.gd.vth) / CASES.gd.rth).toBe(24);
  });

  it('the normalised curve: peak at x = 1, x and 1/x give the same power', () => {
    expect(pNorm(1)).toBe(1);
    expect(pNorm(0.5)).toBeCloseTo(8 / 9, 12);
    expect(pNorm(2)).toBeCloseTo(8 / 9, 12);
    for (const x of [0.2, 0.37, 3, 7]) expect(pNorm(x)).toBeCloseTo(pNorm(1 / x), 12);
    for (const x of [0.01, 0.5, 0.99, 1.01, 2, 5]) expect(pNorm(x)).toBeLessThan(1);
    expect(etaOf(1)).toBe(0.5);
    expect(etaOf(2) / etaOf(0.5)).toBeCloseTo(2, 12);
  });

  it('the breadboard: 5 V, 1 kΩ — the sheet’s lab table and the safety margin', () => {
    const rows: [number, number, number, number][] = [
      [200, 0.833, 3.472, 0.167],
      [500, 1.667, 5.556, 0.333],
      [1000, 2.5, 6.25, 0.5],
      [2000, 3.333, 5.556, 0.667],
      [5000, 4.167, 3.472, 0.833],
      [10000, 4.545, 2.066, 0.909],
    ];
    for (const [rl, vl, pmW, eta] of rows) {
      const s = solve(LAB.vth, LAB.rth, rl);
      expect(s.vl).toBeCloseTo(vl, 3);
      expect(s.pl * 1000).toBeCloseTo(pmW, 3);
      expect(s.eta).toBeCloseTo(eta, 3);
    }
    const pk = solve(LAB.vth, LAB.rth, 1000);
    expect(pk.il * 1000).toBeCloseTo(2.5, 12);
    expect(pk.pl * 1000).toBeCloseTo(6.25, 12);
    // R_L shorted: the whole 5 V across R_Th → 25 mW, a tenth of the 1/4 W rating
    expect(((LAB.vth * LAB.vth) / LAB.rth) * 1000).toBe(25);
    expect(RATING_W / ((LAB.vth * LAB.vth) / LAB.rth)).toBe(10);
    // the textbook values on a 1/4 W part: 8 W is 32 × the rating
    expect(CASES.ex3.vth ** 2 / (4 * CASES.ex3.rth) / RATING_W).toBe(32);
  });

  it('peak lock and the knob', () => {
    expect(peakLocked(solve(5, 1000, 1000))).toBe(true);
    expect(peakLocked(solve(5, 1000, 1040))).toBe(true);
    expect(peakLocked(solve(5, 1000, 1100))).toBe(false);
    expect(peakLocked(solve(5, 1000, 920))).toBe(false);
    expect(rlOfAngle(0)).toBe(50);
    expect(rlOfAngle(270)).toBe(10000);
    expect(rlOfAngle(angleOfRl(1000))).toBeCloseTo(1000, 9);
  });
});
