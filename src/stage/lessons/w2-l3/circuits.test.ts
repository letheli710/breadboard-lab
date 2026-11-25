// The lesson sheet's numbers, re-derived by the stage's mesh solver.

import { describe, expect, it } from 'vitest';
import { circuit, fmt, solve } from './circuits';

describe('W2-L3 mesh solver against the sheet', () => {
  it('act 2: standard two-mesh circuit', () => {
    const s = solve(circuit('std'));
    expect(s.rows.map((r) => [...r.a, r.b])).toEqual([
      [15, -10, 20],
      [-10, 15, -5],
    ]);
    expect(s.i1).toBeCloseTo(2);
    expect(s.i2).toBeCloseTo(1);
    expect(s.iMid).toBeCloseTo(1);
    expect(s.kvl[0]).toBeCloseTo(0);
    expect(s.kvl[1]).toBeCloseTo(0);
    expect(s.va).toBeCloseTo(10);
  });

  it('act 3: Case 1, the edge source locks i2 = −Is; R3 only changes the source voltage', () => {
    for (const r3 of [0, 6, 20]) {
      const s = solve(circuit('c1', r3));
      expect(s.i2).toBeCloseTo(-3);
      expect(s.i1).toBeCloseTo(2);
      expect(s.iMid).toBeCloseTo(5);
      expect(s.va).toBeCloseTo(20);
      expect(s.vIs).toBeCloseTo(20 + 3 * r3);
    }
    expect(solve(circuit('c1')).vIs).toBeCloseTo(38);
  });

  it('act 4: Case 2 supermesh with Rs = 2 Ω', () => {
    const s = solve(circuit('c2'));
    expect(s.rows.map((r) => [...r.a, r.b])).toEqual([
      [6, 14, 20],
      [-1, 1, 6],
    ]);
    expect(s.i1).toBeCloseTo(-3.2);
    expect(s.i2).toBeCloseTo(2.8);
    expect(s.va).toBeCloseTo(39.2);
    expect(s.vIs).toBeCloseTo(51.2);
    expect(s.pSeries).toBeCloseTo(72);
    // Rs does not move the mesh currents
    for (const rs of [0, 20]) {
      const t = solve(circuit('c2', rs));
      expect(t.i1).toBeCloseTo(-3.2);
      expect(t.i2).toBeCloseTo(2.8);
    }
  });

  it('act 5: guided example', () => {
    const s = solve(circuit('ex'));
    expect(s.rows.map((r) => [...r.a, r.b])).toEqual([
      [4, 8, 24],
      [1, -1, 3],
    ]);
    expect(s.i1).toBeCloseTo(4);
    expect(s.i2).toBeCloseTo(1);
    expect(s.va).toBeCloseTo(14);
    expect(s.vIs).toBeCloseTo(-1);
    expect(s.pSeries).toBeCloseTo(45);
  });

  it('quiz Q4: 5 A through 10 Ω then 20 Ω', () => {
    expect(5 ** 2 * 10).toBe(250);
    expect(5 ** 2 * 20).toBe(500);
  });

  it('formats numbers', () => {
    expect(fmt(-3.2)).toBe('−3.2');
    expect(fmt(2)).toBe('2');
    expect(fmt(-0.0001)).toBe('0');
    expect(fmt(51.2)).toBe('51.2');
  });
});
