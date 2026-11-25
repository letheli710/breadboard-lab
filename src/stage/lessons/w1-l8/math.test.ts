import { describe, expect, it } from 'vitest';
import { bridgeRabNodal, deltaToWye, fmt, portResistance, reduceBridge, wyeToDelta } from './math';

describe('W1-L8 Y–Δ conversions', () => {
  it('Δ (15, 10, 25) → Y (5, 7.5, 3) and back', () => {
    const y = deltaToWye({ ra: 15, rb: 10, rc: 25 });
    expect(y.r1).toBeCloseTo(5);
    expect(y.r2).toBeCloseTo(7.5);
    expect(y.r3).toBeCloseTo(3);
    const d = wyeToDelta(y);
    expect(d.ra).toBeCloseTo(15);
    expect(d.rb).toBeCloseTo(10);
    expect(d.rc).toBeCloseTo(25);
    expect(y.r1 * y.r2 + y.r2 * y.r3 + y.r3 * y.r1).toBeCloseTo(75);
  });

  it('every port pair reads the same in Δ and Y (any values)', () => {
    for (const d of [
      { ra: 15, rb: 10, rc: 25 },
      { ra: 3, rb: 60, rc: 17 },
      { ra: 42, rb: 8, rc: 8 },
    ]) {
      const y = deltaToWye(d);
      for (const pair of ['ab', 'bc', 'ca'] as const) {
        const r = portResistance(pair, d, y);
        expect(r.wye).toBeCloseTo(r.delta, 10);
      }
    }
    expect(portResistance('ab', { ra: 15, rb: 10, rc: 25 }, deltaToWye({ ra: 15, rb: 10, rc: 25 })).delta).toBeCloseTo(12.5);
  });

  it('balanced: R_Δ = 3 R_Y', () => {
    expect(deltaToWye({ ra: 30, rb: 30, rc: 30 }).r1).toBeCloseTo(10);
    expect(wyeToDelta({ r1: 6, r2: 6, r3: 6 }).ra).toBeCloseTo(18);
    // act 4 figure: symmetric Δ of 30 Ω seen between two ports = 30 ∥ 60 = 20 Ω = 10 + 10
    const d = { ra: 30, rb: 30, rc: 30 };
    expect(portResistance('ab', d, deltaToWye(d)).delta).toBeCloseTo(20);
  });

  it('quiz Q2: Y (4, 6, 12) → R_a = 36 Ω', () => {
    const d = wyeToDelta({ r1: 4, r2: 6, r3: 12 });
    expect(d.ra).toBeCloseTo(36);
    expect(d.rb).toBeCloseTo(24);
    expect(d.rc).toBeCloseTo(12);
  });
});

describe('W1-L8 bridge', () => {
  it('the guided example: 12, 18, 6, 10, 21 → R_ab = 14 Ω', () => {
    const b = { ac: 12, ad: 18, cd: 6, cb: 10, db: 21 };
    const r = reduceBridge(b);
    expect(r.sum).toBe(36);
    expect(r.r1).toBeCloseTo(6);
    expect(r.r2).toBeCloseTo(2);
    expect(r.r3).toBeCloseTo(3);
    expect(r.left).toBeCloseTo(12);
    expect(r.right).toBeCloseTo(24);
    expect(r.parallel).toBeCloseTo(8);
    expect(r.rab).toBeCloseTo(14);
    expect(bridgeRabNodal(b)).toBeCloseTo(14);
  });

  it('all 30 Ω → 30 Ω; all 18 Ω → 18 Ω (quiz Q1)', () => {
    expect(reduceBridge({ ac: 30, ad: 30, cd: 30, cb: 30, db: 30 }).rab).toBeCloseTo(30);
    expect(reduceBridge({ ac: 18, ad: 18, cd: 18, cb: 18, db: 18 }).rab).toBeCloseTo(18);
    expect(reduceBridge({ ac: 18, ad: 18, cd: 18, cb: 18, db: 18 }).r1).toBeCloseTo(6);
  });

  it('Δ → Y reduction agrees with nodal analysis for arbitrary values', () => {
    for (const b of [
      { ac: 1, ad: 60, cd: 7, cb: 33, db: 2 },
      { ac: 47, ad: 22, cd: 10, cb: 15, db: 39 },
    ])
      expect(reduceBridge(b).rab).toBeCloseTo(bridgeRabNodal(b), 10);
  });

  it('formats values', () => {
    expect(fmt(7.5)).toBe('7.5');
    expect(fmt(14)).toBe('14');
    expect(fmt(10 / 3)).toBe('3.33');
    expect(fmt(2.1)).toBe('2.1');
  });
});
