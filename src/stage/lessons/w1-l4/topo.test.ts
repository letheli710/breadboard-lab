import { describe, expect, it } from 'vitest';
import { L1_ELEMENTS, L1_WIRES, l1Terminals, preset } from './circuits';
import { cubicBezier, degree, floodFill, judge, junctions } from './topo';

describe('W1-L4 layer 01: equipotential flood fill', () => {
  it('fills exactly the wire of one node from any of its pieces', () => {
    for (const w of L1_WIRES) {
      const got = floodFill(L1_WIRES, w.id)
        .map((s) => s.id)
        .sort();
      const want = L1_WIRES.filter((x) => x.node === w.node)
        .map((x) => x.id)
        .sort();
      expect(got).toEqual(want);
    }
  });

  it('every wire end is an element terminal or a junction shared with another piece', () => {
    const terms = new Set(L1_ELEMENTS.flatMap((e) => l1Terminals(e).map((p) => p.join(','))));
    const ends = L1_WIRES.flatMap((w) => [w.pts[0], w.pts[w.pts.length - 1]].map((p) => p.join(',')));
    for (const e of ends) expect(terms.has(e) || ends.filter((x) => x === e).length >= 2).toBe(true);
    // each element terminal is reached by its own node's wire
    for (const el of L1_ELEMENTS) {
      const [ta, tb] = l1Terminals(el).map((p) => p.join(','));
      expect(L1_WIRES.some((w) => w.node === el.a && [w.pts[0], w.pts[w.pts.length - 1]].some((p) => p.join(',') === ta))).toBe(true);
      expect(L1_WIRES.some((w) => w.node === el.b && [w.pts[0], w.pts[w.pts.length - 1]].some((p) => p.join(',') === tb))).toBe(true);
    }
  });

  it('has the three T junctions of node B and one of node C, and b = l + n − 1 holds (4 = 2 + 3 − 1)', () => {
    expect(junctions(L1_WIRES).length).toBe(4);
    const b = L1_ELEMENTS.length;
    const n = new Set(L1_WIRES.map((w) => w.node)).size;
    expect([b, n, b - n + 1]).toEqual([4, 3, 2]);
  });
});

describe('W1-L4 layer 02: series / parallel judge', () => {
  it('preset 1: R1 and R2 are in series until the tap makes deg(N) = 3', () => {
    expect(judge(preset(1, false).els, 'R1', 'R2')).toEqual({ kind: 'series', node: 'N' });
    const v = judge(preset(1, true).els, 'R1', 'R2');
    expect(v.kind).toBe('neither');
    if (v.kind === 'neither') {
      expect(v.shared).toEqual({ node: 'N', deg: 3 });
      expect(v.third).toEqual(['Rtap']);
    }
  });

  it('preset 2: R3 and R4 are in parallel until the sneak tears the top rail', () => {
    expect(judge(preset(2, false).els, 'R3', 'R4')).toEqual({ kind: 'parallel', nodes: ['A', 'B'] });
    const v = judge(preset(2, true).els, 'R3', 'R4');
    expect(v.kind === 'neither' && v.sneak).toBe('Rsneak');
  });

  it('preset 3 (Ex 2.4): b = 5, n = 3, l = 3; R1–R2 series via a, R3 ∥ R4 on {b, c}, R4–R1 neither (deg(b) = 4)', () => {
    const { els, nodes } = preset(3, false);
    expect([els.length, nodes.length, els.length - nodes.length + 1]).toEqual([5, 3, 3]);
    expect(judge(els, 'R1', 'R2')).toEqual({ kind: 'series', node: 'a' });
    expect(judge(els, 'R3', 'R4')).toEqual({ kind: 'parallel', nodes: ['b', 'c'] });
    expect(degree(els, 'b')).toBe(4);
    expect(judge(els, 'R4', 'R1').kind).toBe('neither');
    expect(judge(els, 'R3', 'R2').kind).toBe('neither');
  });
});

describe('W1-L4 easing', () => {
  it('cubic-bezier(0.4, 0, 0.2, 1) runs from 0 to 1 and rises', () => {
    const f = cubicBezier(0.4, 0, 0.2, 1);
    expect(f(0)).toBe(0);
    expect(f(1)).toBe(1);
    expect(f(0.25)).toBeLessThan(f(0.5));
    expect(f(0.5)).toBeGreaterThan(0.5);
  });
});
