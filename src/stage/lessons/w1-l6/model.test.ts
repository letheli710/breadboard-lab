import { describe, expect, it } from 'vitest';
import { kvlTerms, seriesVab, SERIES_DEFAULT_UP, solve, type Circuit, type ElemId } from './model';

const NO_FLIP: Record<ElemId, boolean> = { v1: false, r1: false, v2: false, r2: false };
const LESSON: Circuit = { V1: 20, V2: 5, R1: 2, R2: 3, flip: NO_FLIP };

describe('W1-L6 loop model', () => {
  it('solves the act-5 example: i = 3 A, v1 = +6 V, v2 = −9 V, V_A/B/C = 20/14/9 V', () => {
    const s = solve(LESSON);
    expect(s.i).toBeCloseTo(3);
    expect(s.v.r1).toBeCloseTo(6);
    expect(s.v.r2).toBeCloseTo(-9);
    expect(s.pot.A).toBeCloseTo(20);
    expect(s.pot.B).toBeCloseTo(14);
    expect(s.pot.C).toBeCloseTo(9);
    expect(s.closeAt).toBeCloseTo(0);
  });

  it('writes −V1 + v1 + V2 − v2 = 0 clockwise, and its negative counter-clockwise', () => {
    const cw = kvlTerms(LESSON, 'cw');
    expect(cw.map((t) => `${t.sign > 0 ? '+' : '-'}${t.sym}`).join(' ')).toBe('-V_1 +v_1 +V_2 -v_2');
    const ccw = kvlTerms(LESSON, 'ccw');
    for (const t of ccw) expect(t.sign).toBe(-cw.find((u) => u.elem === t.elem)!.sign);
  });

  it('closes the potential profile and the KVL sum for any values and markings', () => {
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let n = 0; n < 500; n++) {
      const flip = { v1: rnd() < 0.5, r1: rnd() < 0.5, v2: rnd() < 0.5, r2: rnd() < 0.5 };
      const c: Circuit = { V1: 5 + 25 * rnd(), V2: 15 * rnd(), R1: 1 + 9 * rnd(), R2: 1 + 9 * rnd(), flip };
      const s = solve(c);
      expect(Math.abs(s.closeAt)).toBeLessThan(1e-9);
      for (const dir of ['cw', 'ccw'] as const) expect(Math.abs(kvlTerms(c, dir).reduce((a, t) => a + t.value, 0))).toBeLessThan(1e-9);
      const rises = Object.values(s.rise).filter((x) => x > 0);
      const drops = Object.values(s.rise).filter((x) => x < 0);
      expect(rises.reduce((a, x) => a + x, 0)).toBeCloseTo(-drops.reduce((a, x) => a + x, 0), 9);
    }
  });

  it('adds series sources by polarity: 12 + 5 − 3 = 14 V', () => {
    expect(seriesVab(SERIES_DEFAULT_UP)).toBe(14);
    expect(seriesVab([true, true, true])).toBe(20);
  });
});
