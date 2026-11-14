// Second route for every built-in problem of the matrix-form chapter (problems/matrix-form).
// The validator already compares each answer with matrixform.ts. Here:
//   (a) every solution of a matrix equation (Un, Ub, Ib, Il, Ut) is recomputed from the MNA
//       engine's element voltages / currents (branch current = net current leaving the branch's
//       start node through its elements), and so is every other answer that has such a meaning;
//   (b) A·B_fᵀ = 0, Q_f·B_fᵀ = 0 and Q_l = −B_tᵀ for every graph with a tree;
//   (c) the state matrices: their eigenvalues are the engine's natural frequencies;
//   (d) the right option of every multiple-choice question is recomputed (trees, cut-sets,
//       proper trees, sign changes) and must be the only option that passes.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { extractNetlist } from '../problem/geometry';
import type { Analysis, CircuitGraph, Netlist, ProblemFile, Question } from '../problem/types';
import { abs, sub } from './complex';
import { computeQuantity, naturalFrequencies, solveAC, solveDC } from './index';
import { DiGraph, MatrixForm, stateMatrices } from './matrixform';

const DIR = fileURLToPath(new URL('../../../problems/matrix-form/', import.meta.url));
const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .sort();
const load = (f: string) => JSON.parse(readFileSync(join(DIR, f), 'utf8')) as ProblemFile;
const T = (A: number[][]) => A[0].map((_, j) => A.map((r) => r[j]));
const mmul = (A: number[][], B: number[][]) => A.map((r) => B[0].map((_, j) => r.reduce((s, a, k) => s + a * B[k][j], 0)));
const sets = (s: string) => [...s.matchAll(/\{([\d, ]+)\}/g)].map((m) => m[1].split(',').map((x) => +x.trim()));

function netOf(p: ProblemFile): Netlist {
  const r = extractNetlist(p.schematic);
  expect(r.errors).toEqual([]);
  return { ...r.netlist, graph: p.schematic.graph, state: p.schematic.state };
}

/** branch voltage / current of graph branch k (0-based) straight from the MNA solution */
function mnaBranch(net: Netlist, g: CircuitGraph, an: Analysis, k: number) {
  const sol = an.type === 'ac' ? solveAC(net, an.omega ?? 2 * Math.PI * (an.freq ?? 0)) : solveDC(net);
  const b = [...g.branches].sort((x, y) => x.n - y.n)[k];
  const node = (nm: string) => net.aliases?.get(nm) ?? nm;
  const u = sol.v(node(b.from), node(b.to));
  let i = { re: 0, im: 0 };
  for (const ref of b.els) {
    const p = net.nodeOf.get(`${ref}.p`);
    const n = net.nodeOf.get(`${ref}.n`);
    const s = p === node(b.from) ? 1 : n === node(b.from) ? -1 : 0;
    const ie = sol.i(ref);
    i = { re: i.re + s * ie.re, im: i.im + s * ie.im };
  }
  return { u, i };
}

const part = (z: { re: number; im: number }, p?: string) =>
  p === 'im' ? z.im : p === 'mag' ? Math.hypot(z.re, z.im) : p === 'phase' ? (Math.atan2(z.im, z.re) * 180) / Math.PI : z.re;

describe('matrix-form chapter: every answer by a second route', () => {
  it('has 12–15 problems ending with two controlled-source node problems and a state-equation problem', () => {
    expect(files.length).toBeGreaterThanOrEqual(12);
    expect(files.length).toBeLessThanOrEqual(15);
    const last = files.slice(-3).map(load);
    expect(last[0].schematic.elements.some((e) => e.type === 'VCCS' || e.type === 'CCCS')).toBe(true);
    expect(last[1].schematic.elements.some((e) => e.type === 'VCCS' || e.type === 'CCCS')).toBe(true);
    expect(last[2].questions.some((q) => q.find?.kind === 'state')).toBe(true);
  });

  for (const file of files)
    it(file, () => {
      const p = load(file);
      const net = netOf(p);
      const g = p.schematic.graph!;
      const an = p.analysis;
      let checked = 0;
      // (b) structure
      if (g.tree) {
        const d = new DiGraph(g);
        const A = d.A();
        const B = d.Bf();
        const Q = d.Qf();
        for (const r of [...mmul(A, T(B)), ...mmul(Q, T(B))]) expect(r.every((x) => x === 0)).toBe(true);
        d.tree.forEach((t, i) => d.links.forEach((l, j) => expect(Q[i][l]).toBe(-B[j][t] || 0)));
        checked++;
      }
      // entries of A straight from the branch list
      for (const q of p.questions) {
        const f = q.find as Record<string, unknown> | undefined;
        if (f?.kind !== 'mat' || f.mat !== 'A') continue;
        const b = g.branches.find((x) => x.n === f.col)!;
        const nm = new DiGraph(g).names[new DiGraph(g).rows[(f.row as number) - 1]];
        expect(b.from === nm ? 1 : b.to === nm ? -1 : 0, q.id).toBe(q.answer);
        checked++;
      }
      // (a) solutions against MNA
      const dg = new DiGraph(g);
      for (const q of p.questions) {
        const f = q.find as Record<string, unknown> | undefined;
        if (!f || f.kind !== 'mat') continue;
        const row = (f.row as number) - 1;
        const k = f.mat === 'Ub' || f.mat === 'Ib' ? row : f.mat === 'Il' ? dg.links[row] : f.mat === 'Ut' ? dg.tree[row] : -1;
        if (f.mat === 'Un') {
          const sol = an.type === 'ac' ? solveAC(net, an.omega!) : solveDC(net);
          const nm = dg.names[dg.rows[row]];
          const v = sol.v(net.aliases?.get(nm) ?? nm, net.aliases?.get(g.ref) ?? g.ref);
          expect(part(v, f.part as string), `${q.id}`).toBeCloseTo(q.answer!, 4);
          checked++;
        } else if (k >= 0) {
          const { u, i } = mnaBranch(net, g, an, k);
          const z = f.mat === 'Ub' || f.mat === 'Ut' ? u : i;
          expect(part(z, f.part as string), `${q.id}`).toBeCloseTo(q.answer!, 4);
          checked++;
        }
      }
      // (c) state equations
      if (p.schematic.state) {
        const m = stateMatrices(net, p.schematic.state);
        const [[a, b], [c, d]] = m.A;
        for (const s of naturalFrequencies(net)) {
          const re = s.re * s.re - s.im * s.im - (a + d) * s.re + (a * d - b * c);
          const im = 2 * s.re * s.im - (a + d) * s.im;
          expect(Math.hypot(re, im)).toBeLessThan(1e-9);
        }
        checked++;
      }
      // (d) multiple choice
      for (const q of p.questions) if (q.choices) checked += mcCheck(file, q, p, net);
      expect(checked).toBeGreaterThan(0);
    });
});

/** recompute which option is right; returns 1 when checked */
function mcCheck(file: string, q: Question, p: ProblemFile, net: Netlist): number {
  const en = p.i18n!.en!.questions![p.questions.indexOf(q)].choices!;
  const g = new DiGraph(p.schematic.graph!);
  const ok = (pass: (s: string) => boolean) => {
    const passing = en.map((c, i) => (pass(c) ? i : -1)).filter((i) => i >= 0);
    expect(passing, `${file} ${q.id}`).toEqual([q.correct]);
    return 1;
  };
  const idx = (s: number[]) => s.map((x) => x - 1);
  const key = `${file.slice(0, 2)}/${q.id}`;
  switch (key) {
    case '01/tree':
      return ok((c) => g.notTree(idx(sets(c)[0])) === null);
    case '01/kvl':
      return ok((c) => c === `${g.count('tree')} KCL, ${g.count('links')} KVL`);
    case '02/q1': {
      const node1 = g
        .A()[0]
        .map((x, k) => (x ? k + 1 : 0))
        .filter(Boolean);
      return ok(
        (c) =>
          c
            .split(',')
            .map((x) => +x)
            .join() === node1.join(),
      );
    }
    case '02/which':
      return ok((c) => g.notCutset(idx(sets(c)[0])) !== null);
    case '15/tree': {
      const typeOf = new Map(p.schematic.elements.map((e) => [e.ref, e.type]));
      const proper = (s: number[]) =>
        g.notTree(idx(s)) === null &&
        p.schematic.graph!.branches.every((b) => {
          const types = b.els.map((r) => typeOf.get(r));
          const inTree = s.includes(b.n);
          return (types.some((t) => t === 'V' || t === 'C') ? inTree : true) && (types.some((t) => t === 'L' || t === 'I') ? !inTree : true);
        });
      return ok((c) => proper(sets(c)[0]));
    }
    case '08/sign': {
      const flipped = {
        ...net,
        elements: net.elements.map((e) => (e.ref === 'Vs3' ? { ...e, value: -6 } : e)),
      } as Netlist;
      const us = computeQuantity(flipped, p.analysis, { kind: 'mat', mat: 'Us', row: 3 });
      const jn = computeQuantity(flipped, p.analysis, { kind: 'mat', mat: 'Jn', row: 2 });
      const fmt = (x: number, u: string) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x)} ${u}`;
      return ok((c) => c === `${fmt(us, 'V')}, ${fmt(jn, 'A')}`);
    }
    case '07/abt': {
      const d = new DiGraph(p.schematic.graph!);
      const zero = (M: number[][]) => M.every((r) => r.every((x) => x === 0));
      const holds: Record<string, boolean> = {
        'A·Q_fᵀ = 0': zero(mmul(d.A(), T(d.Qf()))),
        'A·B_fᵀ = 0': zero(mmul(d.A(), T(d.Bf()))),
        'Q_f·B_fᵀ = 0': zero(mmul(d.Qf(), T(d.Bf()))),
        'B_f·Aᵀ = 0': zero(mmul(d.Bf(), T(d.A()))),
      };
      return ok((c) => holds[c] === false);
    }
    case '06/rel': {
      const d = new DiGraph(p.schematic.graph!);
      const B = d.Bf();
      const Q = d.Qf();
      const Ql = d.tree.map((_, i) => d.links.map((l) => Q[i][l]));
      const Bt = B.map((r) => d.tree.map((t) => r[t]));
      const eq = (X: number[][]) => X.length === Ql.length && X.every((r, i) => r.length === Ql[i].length && r.every((x, j) => (x || 0) === (Ql[i][j] || 0)));
      return ok((c) => c === 'Q_l = −B_tᵀ' && eq(T(Bt).map((r) => r.map((x) => -x))));
    }
    default:
      // conceptual questions (columns of A_a, meaning of A·I = 0 / U = Aᵀ·U_n) are not numeric
      return 0;
  }
}

describe('matrix-form chapter: the MatrixForm solutions are the circuit solution', () => {
  for (const file of files)
    it(file, () => {
      const p = load(file);
      if (p.analysis.type === 'tran') return; // the state-equation problem has a lone voltage-source branch
      const net = netOf(p);
      const mf = new MatrixForm(net, p.schematic.graph!, p.analysis);
      const un = mf.Un();
      mf.mnaNodeVoltages().forEach((v, k) => expect(abs(sub(un[k], v))).toBeLessThan(1e-9));
      if (p.schematic.graph!.tree && !mf.models.some((m) => m.ctl.length || (!m.passive && m.isrc.length))) {
        const ib = mf.Ib();
        mf.Il().forEach((z, j) => expect(abs(sub(z, ib[mf.g.links[j]]))).toBeLessThan(1e-9));
      }
    });
});
