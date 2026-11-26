import { describe, expect, it } from 'vitest';
import { act2, case1, ccvs, fmt, guided, refAtNode3 } from './model';

describe('W2-L2 circuits (numbers of the lesson sheet)', () => {
  it('act 1: Vs = 10 V locks v1, v2 = 12 V, i1 + i2 = Is', () => {
    const s = case1(10);
    expect(s.v2).toBeCloseTo(12);
    expect(s.i1).toBeCloseTo(1);
    expect(s.i2).toBeCloseTo(3);
    // layer 01 formula v2 = (4/3)(4 + Vs/2), over the slider range
    for (let vs = 4; vs <= 16; vs += 2) {
      const t = case1(vs);
      expect(t.v2).toBeCloseTo((4 / 3) * (4 + vs / 2));
      expect(t.i1 + t.i2).toBeCloseTo(4);
      expect(t.i1).toBeGreaterThanOrEqual(-1e-9);
    }
  });

  it('acts 2–3: v2 = 8 V, v3 = 3 V, i_Vs2 = 2 A (1 A without Rp)', () => {
    const s = act2();
    expect(s.v2).toBeCloseTo(8);
    expect(s.v3).toBeCloseTo(3);
    expect(s.i1).toBeCloseTo(-1);
    expect(s.i2).toBeCloseTo(2);
    expect(s.i3).toBeCloseTo(1);
    expect(s.iRp).toBeCloseTo(1);
    expect(s.iVs2).toBeCloseTo(2);
    // node 3: i3 − Is − iRp + iVs2 = 0
    expect(s.i3 - 2 - s.iRp + s.iVs2).toBeCloseTo(0);
    const n = act2(false);
    expect(n.v2).toBeCloseTo(8);
    expect(n.iVs2).toBeCloseTo(1);
  });

  it('ground moved to node 3: every potential drops by 3 V', () => {
    const r = refAtNode3();
    expect(r).toEqual({ v0: -3, v1: 7, v2: 5, v3: 0 });
    // KCL of the new supernode (0, 1): (v1 − v2)/2 + (v0 − v2)/4 + (v0 − v3)/3 + Is = 0
    expect((r.v1 - r.v2) / 2 + (r.v0 - r.v2) / 4 + (r.v0 - r.v3) / 3 + 2).toBeCloseTo(0);
  });

  it('act 4: v1 = 12 V, v2 = 10 V, v3 = −2 V, ix = 3 A', () => {
    const s = ccvs();
    expect(s.v1).toBeCloseTo(12);
    expect(s.v2).toBeCloseTo(10);
    expect(s.v3).toBeCloseTo(-2);
    expect(s.ix).toBeCloseTo(3);
    expect(s.v2 - s.v3).toBeCloseTo(4 * s.ix);
  });

  it('act 5: v1 = 9 V, v2 = 12 V, is = 4 A (3 A without Rp)', () => {
    const s = guided();
    expect(s.v1).toBeCloseTo(9);
    expect(s.v2).toBeCloseTo(12);
    expect(s.is).toBeCloseTo(4);
    // node 2 cross-check: is = iRp + iR2 + Is2
    expect(s.iRp + s.iR2 + 1).toBeCloseTo(s.is);
    expect(guided(false).is).toBeCloseTo(3);
  });

  it('fmt', () => {
    expect(fmt(12)).toBe('12');
    expect(fmt(28 / 3)).toBe('9.33');
    expect(fmt(-1)).toBe('−1');
    expect(fmt(-0.0001)).toBe('0');
  });
});
