import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { CIRCUITS, byId, clearRow, current, ctrlTex, kclCheck, kclTex, matrixTex, nodal, solve, symmetric, val, type NodeId } from './model';

const volts = (id: keyof typeof CIRCUITS, ref: NodeId) => {
  const s = solve(CIRCUITS[id], ref);
  return Object.fromEntries(CIRCUITS[id].nodes.map((n) => [n, val(s.v[n])]));
};

describe('W2-L1 nodal model', () => {
  it('warm-up (act 2): v1 = 12 V, v2 = 6 V, i = 4, 1, 1 A', () => {
    expect(volts('warmup', 'v0')).toEqual({ v0: 0, v1: 12, v2: 6 });
    const c = CIRCUITS.warmup;
    const s = solve(c, 'v0');
    expect(['branch_r1', 'branch_r2', 'branch_r3'].map((id) => val(current(c, s, byId(c, id)!)))).toEqual([4, 1, 1]);
    expect(
      nodal(c, 'v0')
        .G.map(clearRow)
        .map((r) => [...r.a, r.rhs]),
    ).toEqual([
      [3, -1, 30],
      [-1, 2, 0],
    ]);
  });

  it('core example (act 3): 3v1 − v2 = 60, −3v1 + 5v2 = −120, v1 = 15 V, v2 = −15 V', () => {
    const c = CIRCUITS.core;
    const rows = nodal(c, 'v0').G.map(clearRow);
    expect(rows.map((r) => [...r.a, r.rhs])).toEqual([
      [3, -1, 60],
      [-3, 5, -120],
    ]);
    expect(rows.map((r) => r.times)).toEqual([4, 12]);
    const s = solve(c, 'v0');
    expect(volts('core', 'v0')).toEqual({ v0: 0, v1: 15, v2: -15 });
    expect(['branch_r1', 'branch_r2', 'branch_r3'].map((id) => val(current(c, s, byId(c, id)!)))).toEqual([7.5, 7.5, -2.5]);
    expect(s.elim[0]).toContain('(2) + (1)');
    expect(s.back[0]).toContain('4v_2 = -60');
    for (const n of c.nodes) {
      const k = kclCheck(c, s, n);
      expect(val(k.into)).toBeCloseTo(val(k.out));
    }
    expect(symmetric(nodal(c, 'v0'))).toBe(true);
  });

  it('moving the reference to node 2 shifts every potential by +15 V (act 5)', () => {
    expect(volts('core', 'v2')).toEqual({ v0: 15, v1: 30, v2: 0 });
    const c = CIRCUITS.core;
    const s = solve(c, 'v2');
    expect(val(current(c, s, byId(c, 'branch_r2')!))).toBe(7.5);
    expect(val(current(c, s, byId(c, 'branch_r1')!))).toBe(7.5);
  });

  it('CCCS example (act 4): rows (1)–(3), v1 = 8, v2 = 4, v3 = −4 V, 2ix = 4 A, G not symmetric', () => {
    const c = CIRCUITS.cccs;
    const rows = nodal(c, 'v0').G.map(clearRow);
    expect(rows.map((r) => [...r.a, r.rhs])).toEqual([
      [3, -2, -1, 20],
      [-4, 7, -1, 0],
      [2, -3, 1, 0],
    ]);
    expect(rows[2]).toMatchObject({ times: 8, over: 3 });
    expect(volts('cccs', 'v0')).toEqual({ v0: 0, v1: 8, v2: 4, v3: -4 });
    const s = solve(c, 'v0');
    const i = (id: string) => val(current(c, s, byId(c, id)!));
    expect([i('branch_r12'), i('branch_r13'), i('branch_r2g'), i('branch_r23'), i('src_dep')]).toEqual([2, 3, 1, 1, 4]);
    expect(symmetric(nodal(c, 'v0'))).toBe(false);
    for (const n of c.nodes) {
      const k = kclCheck(c, s, n);
      expect(val(k.into)).toBeCloseTo(val(k.out));
    }
  });

  it('writes the KCL equations the way the sheet does', () => {
    expect(kclTex(CIRCUITS.core, 'v1', 'v0', false)).toBe(String.raw`\dfrac{v_1}{2} + \dfrac{v_1 - v_2}{4} = 5 + 10`);
    expect(kclTex(CIRCUITS.core, 'v2', 'v0', false)).toBe(String.raw`\dfrac{v_2 - v_1}{4} + \dfrac{v_2}{6} = -10`);
    expect(kclTex(CIRCUITS.core, 'v1', 'v0', true)).toBe(String.raw`\dfrac{v_1}{R_1} + \dfrac{v_1 - v_2}{R_2} = I_{s1} + I_{s2}`);
    expect(kclTex(CIRCUITS.cccs, 'v3', 'v0', false)).toBe(String.raw`\dfrac{v_3 - v_1}{4} + \dfrac{v_3 - v_2}{8} + 2i_x = 0`);
    expect(ctrlTex(CIRCUITS.cccs, 'v0', false)).toBe(String.raw`i_x = \dfrac{v_1 - v_2}{2}`);
  });

  it('every generated formula is valid KaTeX, for every circuit and reference', () => {
    for (const c of Object.values(CIRCUITS)) {
      for (const ref of c.nodes) {
        const tex: string[] = [matrixTex(nodal(c, ref))];
        for (const k of c.nodes.filter((n) => n !== ref)) tex.push(kclTex(c, k, ref, true), kclTex(c, k, ref, false));
        const t = ctrlTex(c, ref, false);
        if (t) tex.push(t);
        if (c.numeric) {
          const s = solve(c, ref);
          tex.push(...s.elim, ...s.back);
        }
        for (const t of tex) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' })).not.toThrow();
      }
    }
  });
});
