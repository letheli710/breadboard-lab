import { describe, expect, it } from 'vitest';
import { boxes, PIPES, solveDep, solveLadder } from './model';

describe('W2-L6 black boxes (12 V series 4 Ω ⟺ 3 A parallel 4 Ω)', () => {
  it('agree at the port and differ inside (act 2 numbers)', () => {
    const { a, b } = boxes('2ohm');
    expect([a.v, a.i, a.pl]).toEqual([4, 2, 8]);
    expect([b.v, b.i, b.pl]).toEqual([4, 2, 8]);
    expect(a.pr).toBe(16);
    expect(b.pr).toBe(4);
    // power balance in each box
    expect(a.ps).toBeCloseTo(a.pr + a.pl);
    expect(b.ps).toBeCloseTo(b.pr + b.pl);
  });
  it('open circuit: 12 V, 0 W vs 36 W', () => {
    const { a, b } = boxes('open');
    expect([a.v, b.v]).toEqual([12, 12]);
    expect([a.pr, b.pr]).toEqual([0, 36]);
  });
  it('short circuit: 3 A, 36 W vs 0 W', () => {
    const { a, b } = boxes('short');
    expect([a.i, b.i]).toEqual([3, 3]);
    expect([a.pr, b.pr]).toEqual([36, 0]);
  });
});

describe('W2-L6 act 4 dependent source', () => {
  it('arrow up: v_x = 4 V, i = 2 A', () => {
    expect(solveDep(true)).toEqual({ i: 2, vx: 4, k: 1 });
  });
  it('arrow down: v_x = 8 V (nodal check)', () => {
    const s = solveDep(false);
    expect(s.vx).toBeCloseTo(8);
    // nodal: (16 − V)/2 = V/4 + 0.25 v_x with v_x = 16 − V
    const V = 16 - s.vx;
    expect((16 - V) / 2).toBeCloseTo(V / 4 + 0.25 * s.vx);
  });
});

describe('W2-L6 reduction pipelines', () => {
  it('Sadiku 4.4: v_o = −3.2 V at every step', () => {
    for (const st of PIPES.sadiku) expect(solveLadder(st.els).target.v).toBeCloseTo(-3.2);
  });
  it('guided example: i_o = 0.5 A at every step', () => {
    for (const st of PIPES.guided) expect(solveLadder(st.els).target.i).toBeCloseTo(0.5);
  });
  it('five stages each (slider 0 … 4)', () => {
    expect(PIPES.sadiku).toHaveLength(5);
    expect(PIPES.guided).toHaveLength(5);
  });
});
