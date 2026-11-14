// Matrix formulation (matrixform.ts): graph matrices against the textbook identities, the matrix
// equations against the MNA engine, and the state equations against the natural frequencies.
import { describe, expect, it } from 'vitest';
import { extractNetlist } from '../problem/geometry';
import type { Analysis, CircuitGraph, Netlist, Schematic } from '../problem/types';
import { abs, sub } from './complex';
import { computeQuantity, naturalFrequencies } from './index';
import { DiGraph, MatrixForm, checkGraphAgainstCircuit, stateMatrices } from './matrixform';

const mmul = (A: number[][], B: number[][]) => A.map((r) => B[0].map((_, j) => r.reduce((s, a, k) => s + a * B[k][j], 0)));
const T = (A: number[][]) => A[0].map((_, j) => A.map((r) => r[j]));

/** four nodes (ref 4 = ground), six branches: the complete graph K4 */
function k4(over: Partial<Record<string, unknown>> = {}, graph: Partial<CircuitGraph> = {}): { netlist: Netlist; graph: CircuitGraph } {
  const s: Schematic = {
    elements: [
      { ref: 'R1', type: 'R', from: [0, 0], to: [0, 3], value: 2 },
      { ref: 'Us1', type: 'V', from: [0, 3], to: [0, 6], value: 10 },
      { ref: 'R2', type: 'R', from: [2, 0], to: [6, 0], value: 4 },
      { ref: 'R3', type: 'R', from: [10, 0], to: [14, 0], value: 4 },
      { ref: 'R4', type: 'R', from: [8, 0], to: [8, 6], value: 2 },
      { ref: 'R5', type: 'R', from: [16, 0], to: [16, 6], value: 2 },
      { ref: 'Is5', type: 'I', from: [19, 6], to: [19, 0], value: 1 },
      { ref: 'R6', type: 'R', from: [6, -4], to: [10, -4], value: 8 },
    ].map((e) => ({ ...e, ...((over[e.ref] as object) ?? {}) })) as Schematic['elements'],
    wires: [
      [
        [6, -4],
        [0, -4],
        [0, 0],
        [2, 0],
      ],
      [
        [6, 0],
        [10, 0],
      ],
      [
        [14, 0],
        [19, 0],
      ],
      [
        [10, -4],
        [16, -4],
        [16, 0],
      ],
      [
        [0, 6],
        [19, 6],
      ],
    ],
    labels: [
      { at: [0, 0], name: '1' },
      { at: [8, 0], name: '2' },
      { at: [16, 0], name: '3' },
      { at: [12, 6], name: '4' },
    ],
    grounds: [[0, 6]],
  };
  if (over.wires) s.wires.push(...(over.wires as Schematic['wires']));
  if (over.extra) s.elements.push(...(over.extra as Schematic['elements']));
  const r = extractNetlist(s);
  expect(r.errors).toEqual([]);
  const g: CircuitGraph = {
    nodes: [
      { name: '1', at: [0, 0] },
      { name: '2', at: [4, 0] },
      { name: '3', at: [8, 0] },
      { name: '4', at: [4, 4] },
    ],
    ref: '4',
    branches: [
      { n: 1, from: '4', to: '1', els: ['R1', 'Us1'] },
      { n: 2, from: '1', to: '2', els: ['R2'] },
      { n: 3, from: '2', to: '3', els: ['R3'] },
      { n: 4, from: '2', to: '4', els: ['R4'] },
      { n: 5, from: '3', to: '4', els: ['R5', 'Is5'] },
      { n: 6, from: '1', to: '3', els: ['R6'] },
    ],
    tree: [1, 2, 3],
    ...graph,
  };
  return { netlist: { ...r.netlist, graph: g }, graph: g };
}

describe('graph matrices', () => {
  const { graph } = k4();
  const g = new DiGraph(graph);
  it('A, B_f, Q_f follow the textbook conventions', () => {
    expect(g.A()).toEqual([
      [-1, 1, 0, 0, 0, 1],
      [0, -1, 1, 1, 0, 0],
      [0, 0, -1, 0, 1, -1],
    ]);
    // links 4, 5, 6; loop direction = link direction
    expect(g.Bf()).toEqual([
      [1, 1, 0, 1, 0, 0],
      [1, 1, 1, 0, 1, 0],
      [0, -1, -1, 0, 0, 1],
    ]);
    expect(g.Qf()).toEqual([
      [1, 0, 0, -1, -1, 0],
      [0, 1, 0, -1, -1, 1],
      [0, 0, 1, 0, -1, 1],
    ]);
  });
  it('A·B_fᵀ = 0, Q_f·B_fᵀ = 0 and Q_l = −B_tᵀ for every spanning tree', () => {
    const trees: number[][] = [];
    for (let a = 1; a <= 6; a++) for (let b = a + 1; b <= 6; b++) for (let c = b + 1; c <= 6; c++) if (!g.notTree([a - 1, b - 1, c - 1])) trees.push([a, b, c]);
    expect(trees.length).toBe(16); // Cayley: K4 has 4² trees
    for (const tree of trees) {
      const h = new DiGraph({ ...graph, tree });
      const B = h.Bf();
      const Q = h.Qf();
      for (const row of mmul(h.A(), T(B))) expect(row.every((x) => x === 0)).toBe(true);
      for (const row of mmul(Q, T(B))) expect(row.every((x) => x === 0)).toBe(true);
      h.tree.forEach((t, i) => h.links.forEach((l, j) => expect(Q[i][l]).toBe(-B[j][t] || 0)));
    }
  });
  it('counts, trees and cut-sets', () => {
    expect(['nodes', 'branches', 'tree', 'links'].map((c) => g.count(c))).toEqual([4, 6, 3, 3]);
    expect(g.notTree([1, 2, 5])).toMatch(/loop/);
    expect(g.notTree([0, 1, 5])).toBeNull(); // the star at node 1
    expect(g.notTree([0, 1])).toMatch(/3 branches/);
    expect(g.notCutset([0, 1, 5])).toBeNull(); // all branches at node 1
    expect(g.notCutset([0, 1])).toMatch(/connected/);
    expect(g.notCutset([0, 1, 5, 3, 4])).toMatch(/parts|minimal/);
    expect(() => new DiGraph({ ...graph, tree: [2, 3, 6] })).toThrow(/loop/);
  });
});

describe('matrix equations agree with the MNA engine', () => {
  const dc: Analysis = { type: 'dc' };
  it('node, loop and cut-set equations give the circuit solution (DC)', () => {
    const { netlist, graph } = k4();
    const mf = new MatrixForm(netlist, graph, dc);
    const un = mf.Un();
    expect(un.map((z) => z.re)).toEqual(mf.mnaNodeVoltages().map((z) => expect.closeTo(z.re, 9)));
    // link currents (branches 4, 5, 6) and tree-branch voltages (1, 2, 3) against element quantities
    const ib = mf.Ib();
    mf.Il().forEach((z, j) => expect(z.re).toBeCloseTo(ib[mf.g.links[j]].re, 9));
    const ub = mf.Ub();
    mf.Ut().forEach((z, j) => expect(z.re).toBeCloseTo(ub[mf.g.tree[j]].re, 9));
    expect(ub[1].re).toBeCloseTo(computeQuantity(netlist, dc, { kind: 'v', el: 'R2' }), 9);
    expect(ib[3].re).toBeCloseTo(computeQuantity(netlist, dc, { kind: 'i', el: 'R4' }), 9);
    // branch 5 = R5 ∥ Is5 (branch direction 3 → 4): I_5 = i_R5 − Is5
    expect(ib[4].re).toBeCloseTo(computeQuantity(netlist, dc, { kind: 'i', el: 'R5' }) - 1, 9);
    // source conventions: U_s1 = +10 ("+" toward the head), I_s5 = +1 (against the branch)
    expect(mf.Us()[0].re).toBe(10);
    expect(mf.Is()[4].re).toBe(1);
  });
  it('the Y_n entry kinds read the same matrices', () => {
    const { netlist } = k4();
    expect(computeQuantity(netlist, dc, { kind: 'mat', mat: 'Yn', row: 1, col: 1 })).toBeCloseTo(0.875, 12);
    expect(computeQuantity(netlist, dc, { kind: 'mat', mat: 'Yn', row: 1, col: 3 })).toBeCloseTo(-0.125, 12);
    expect(computeQuantity(netlist, dc, { kind: 'mat', mat: 'Jn', row: 1 })).toBeCloseTo(5, 12);
    expect(computeQuantity(netlist, dc, { kind: 'gcount', count: 'links' })).toBe(3);
    expect(() => computeQuantity(netlist, dc, { kind: 'mat', mat: 'Yn', row: 4, col: 1 })).toThrow(/row/);
  });
  it('a VCCS and a CCCS (row of Y times β): node voltages still match', () => {
    // G ∥ R4 (branch 4, 2 → 4) carries 0.5·u_R2 downwards; F ∥ R5 (branch 5) carries 2·i_R6 downwards
    const extra = [
      { ref: 'G', type: 'VCCS', from: [9, 0], to: [9, 6], value: 0.5, ctrl: { v: 'R2' } },
      { ref: 'F', type: 'CCCS', from: [18, 0], to: [18, 6], value: 2, ctrl: { i: 'R6' } },
    ];
    const { netlist, graph } = k4({ extra }, {});
    const g2 = { ...graph, branches: graph.branches.map((b) => (b.n === 4 ? { ...b, els: ['R4', 'G'] } : b.n === 5 ? { ...b, els: ['R5', 'Is5', 'F'] } : b)) };
    const mf = new MatrixForm({ ...netlist, graph: g2 }, g2, dc);
    const Y = mf.Yb();
    expect(Y[3][1].re).toBeCloseTo(0.5, 12); // Y_42 = g
    expect(Y[4][5].re).toBeCloseTo(2 / 8, 12); // Y_56 = β·Y_6
    expect(checkGraphAgainstCircuit({ ...netlist, graph: g2 }, g2, dc, true)).toEqual([]);
    mf.Un().forEach((z, k) => expect(z.re).toBeCloseTo(mf.mnaNodeVoltages()[k].re, 9));
  });
  it('coupled inductors and a capacitor in AC (Y = Z⁻¹ on the coupled block)', () => {
    const { netlist, graph } = k4(
      {
        R4: { type: 'L', value: 1 },
        R6: { type: 'L', value: 2 },
        R3: { type: 'C', value: 0.25 },
        Us1: { value: { ac: { mag: 10, phase: 30 } } },
        extra: [{ ref: 'K', type: 'K', l1: 'R4', l2: 'R6', M: 0.5 }],
      },
      {},
    );
    const ac: Analysis = { type: 'ac', omega: 2 };
    const mf = new MatrixForm(netlist, graph, ac);
    const Z = mf.Zb();
    // R4 (2 → 4, p at 2: σ = +1) and R6 (1 → 3, p at 1: σ = +1): Z_46 = +jωM
    expect(Z[3][5]).toEqual({ re: 0, im: 1 });
    expect(checkGraphAgainstCircuit(netlist, graph, ac, true)).toEqual([]);
    const un = mf.Un();
    const il = mf.Il();
    const ib = mf.Ib();
    un.forEach((z, k) => expect(abs(sub(z, mf.mnaNodeVoltages()[k]))).toBeLessThan(1e-9));
    il.forEach((z, j) => expect(abs(sub(z, ib[mf.g.links[j]]))).toBeLessThan(1e-9));
    mf.Ut().forEach((z, j) => expect(abs(sub(z, mf.Ub()[mf.g.tree[j]]))).toBeLessThan(1e-9));
  });
  it('rejects a graph that does not match the circuit', () => {
    const { netlist, graph } = k4();
    const bad = { ...graph, branches: graph.branches.map((b) => (b.n === 2 ? { ...b, from: '2', to: '3', els: ['R2'] } : b)) };
    expect(checkGraphAgainstCircuit(netlist, bad, dc, true)[0]).toMatch(/chain|node/);
    const missing = { ...graph, branches: graph.branches.map((b) => (b.n === 5 ? { ...b, els: ['R5'] } : b)) };
    expect(checkGraphAgainstCircuit(netlist, missing, dc, true)[0]).toMatch(/Is5/);
    expect(checkGraphAgainstCircuit(netlist, { ...graph, cutsets: [{ branches: [1, 2], path: [] }] }, dc, true)[0]).toMatch(/cut-set/);
    expect(checkGraphAgainstCircuit(netlist, graph, dc, true)).toEqual([]);
  });
  it('rejects a current source across the voltage source only (R_1 would not carry I_1 + I_s1)', () => {
    const across = (from: number, to: number) => {
      const { netlist, graph } = k4({
        wires: [
          [
            [-3, from],
            [0, from],
          ],
          [
            [-3, to],
            [0, to],
          ],
        ],
        extra: [{ ref: 'Is1', type: 'I', from: [-3, 6], to: [-3, from === 6 ? to : from], value: 2 }],
      });
      const g2 = { ...graph, branches: graph.branches.map((b) => (b.n === 1 ? { ...b, els: ['R1', 'Us1', 'Is1'] } : b)) };
      return checkGraphAgainstCircuit({ ...netlist, graph: g2 }, g2, dc, true);
    };
    expect(across(3, 6)[0]).toMatch(/Is1 must be in parallel with R1/); // across Us1 alone
    expect(across(0, 6)).toEqual([]); // across R1 + Us1: a standard branch
  });
});

describe('state equations', () => {
  // Us — R1 — a; C a–0; L a → b; R2 b–0; Is into b
  const s: Schematic = {
    elements: [
      { ref: 'Us', type: 'V', from: [0, 0], to: [0, 6], value: 1 },
      { ref: 'R1', type: 'R', from: [2, 0], to: [6, 0], value: 1 },
      { ref: 'C', type: 'C', from: [8, 0], to: [8, 6], value: 0.5 },
      { ref: 'L', type: 'L', from: [10, 0], to: [14, 0], value: 1 },
      { ref: 'R2', type: 'R', from: [16, 0], to: [16, 6], value: 2 },
      { ref: 'Is', type: 'I', from: [19, 6], to: [19, 0], value: 1 },
    ],
    wires: [
      [
        [0, 0],
        [2, 0],
      ],
      [
        [6, 0],
        [10, 0],
      ],
      [
        [14, 0],
        [19, 0],
      ],
      [
        [0, 6],
        [19, 6],
      ],
    ],
    grounds: [[0, 6]],
  };
  const netlist = extractNetlist(s).netlist;
  it('ẋ = Ax + Bu by hand: A = [[−2, −2], [1, −2]], B = [[2, 0], [0, −2]]', () => {
    const m = stateMatrices(netlist, { x: ['C', 'L'], u: ['Us', 'Is'] });
    expect(m.A.flat().map((x) => +x.toFixed(12))).toEqual([-2, -2, 1, -2]);
    // Is points up into b: u_b = R2(i_L + Is) → L di/dt = u_C − 2i_L − 2Is
    expect(m.B.flat().map((x) => +x.toFixed(12))).toEqual([2, 0, 0, -2]);
  });
  it('eigenvalues of A are the natural frequencies of the transient engine', () => {
    const m = stateMatrices(netlist, { x: ['C', 'L'], u: ['Us', 'Is'] });
    const [[a, b], [c, d]] = m.A;
    const tr = a + d;
    const det = a * d - b * c;
    const roots = naturalFrequencies(netlist);
    expect(roots.length).toBe(2);
    for (const r of roots) expect(abs(sub({ re: r.re * r.re - r.im * r.im - tr * r.re + det, im: 2 * r.re * r.im - tr * r.im }, { re: 0, im: 0 }))).toBeLessThan(1e-9);
  });
  it('needs every C / L and every source listed', () => {
    expect(() => stateMatrices(netlist, { x: ['C'], u: ['Us', 'Is'] })).toThrow(/L is missing/);
    expect(() => stateMatrices(netlist, { x: ['C', 'L'], u: ['Us'] })).toThrow(/Is is missing/);
  });
});
