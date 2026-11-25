import { describe, expect, it } from 'vitest';
import { AIDING, DEP, OPPOSING, fmt, powerSplit, solve, superpose } from './model';

describe('W2-L5 superposition model', () => {
  it('act 1: divider 4 Ω / 6 Ω, homogeneity and the k² power', () => {
    const c = { Vs: 10, Is: 0, R1: 4, R2: 6 };
    expect(solve(c, true, false).v).toBeCloseTo(6);
    expect(solve(c, true, false, 3).v).toBeCloseTo(18);
    expect(solve(c, true, false, 3).pR2).toBeCloseTo(9 * solve(c, true, false).pR2);
  });

  it('act 3: Sadiku Example 4.3 (v′ = 2, v″ = 8, v = 10 V; i = 2.5 A)', () => {
    const s = superpose(AIDING);
    expect(s.one.v).toBeCloseTo(2);
    expect(s.one.iR2).toBeCloseTo(0.5);
    expect(s.two.v).toBeCloseTo(8);
    expect(s.two.iR2).toBeCloseTo(2);
    expect(s.total.v).toBeCloseTo(10);
    expect(s.total.iR2).toBeCloseTo(2.5);
    expect(s.total.pR2).toBeCloseTo(25);
  });

  it('act 4: the CCCS stays (v′ = 4, v″ = 6, v = 10 V); zeroing it gives 8 + 12 = 20 V', () => {
    const s = superpose(DEP);
    expect(s.one.v).toBeCloseTo(4);
    expect(s.two.v).toBeCloseTo(6);
    expect(s.total.v).toBeCloseTo(10);
    expect(s.one.iR2 + s.two.iR2).toBeCloseTo(2.5);
    const wrong = superpose({ ...DEP, beta: 0 });
    expect(wrong.one.v).toBeCloseTo(8);
    expect(wrong.two.v).toBeCloseTo(12);
  });

  it('act 6: opposing sources (i′ = 3, i″ = −2, i = 1 A, p = 2 W)', () => {
    const s = superpose(OPPOSING);
    expect(s.one.iR2).toBeCloseTo(3);
    expect(s.two.iR2).toBeCloseTo(-2);
    expect(s.two.v).toBeCloseTo(-4);
    expect(s.total.iR2).toBeCloseTo(1);
    expect(s.total.pR2).toBeCloseTo(2);
    // KCL at A in every case
    for (const x of [s.one, s.two, s.total]) expect(x.iR1 + x.iIs).toBeCloseTo(x.iR2);
  });

  it('act 5 and the quiz: the cross term', () => {
    expect(powerSplit(0.5, 2, 4)).toMatchObject({ wrong: 17, cross: 8, p: 25 });
    expect(powerSplit(3, -2, 2)).toMatchObject({ wrong: 26, cross: -24, p: 2 });
    expect(powerSplit(2, 4, 5)).toMatchObject({ wrong: 100, cross: 80, p: 180 });
    expect(powerSplit(2, -4, 5)).toMatchObject({ wrong: 100, cross: -80, p: 20 });
  });

  it('formats readouts', () => {
    expect(fmt(2.5)).toBe('2.5');
    expect(fmt(-2)).toBe('−2');
    expect(fmt(3, true)).toBe('+3');
    expect(fmt(-0.0001)).toBe('0');
    expect(fmt(10)).toBe('10');
  });
});
