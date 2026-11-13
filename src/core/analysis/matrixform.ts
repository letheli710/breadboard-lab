// Matrix formulation of circuit equations (邱关源《电路》第 15 章 "电路方程的矩阵形式"):
// the directed graph of a circuit, its incidence / fundamental loop / fundamental cut-set
// matrices, the branch admittance / impedance matrices of the textbook's standard branch, the
// node / loop / cut-set equations in matrix form and the state equations ẋ = Ax + Bu.
//
// The graph is written by the author next to the drawing (schematic.graph): numbered branches,
// each made of one or more circuit elements between two graph nodes, oriented from → to, a
// reference node and (optionally) a tree. Everything here is computed from that description and
// the circuit's element values; `checkGraph` makes sure the description matches the circuit, and
// `crossCheck` solves the matrix equations and compares the node voltages with the MNA engine.
//
// Conventions (textbook):
//   A    a_jk = +1 if branch k leaves node j, −1 if it enters it (reference node row deleted).
//   B_f  one row per link (fundamental loop, ordered by branch number), the loop takes the
//        direction of its link; b_jk = +1 if branch k is in loop j with the same direction.
//   Q_f  one row per tree branch (fundamental cut-set, ordered by branch number), the cut-set
//        takes the direction of its tree branch; q_jk = +1 if branch k crosses in that direction.
//   standard branch k (voltage U_k, current I_k along the branch direction):
//        I_k = Y_k(U_k + U_sk) − I_sk,   U_k = Z_k(I_k + I_sk) − U_sk
//        i.e. U_sk is positive when the source's "+" is toward the head of the branch (it pushes
//        current along the branch), I_sk is positive when the current source points against the
//        branch direction.
//   node:    A·Y·Aᵀ·U_n = A·I_s − A·Y·U_s
//   loop:    B·Z·Bᵀ·I_l = B·U_s − B·Z·I_s
//   cut-set: Q·Y·Qᵀ·U_t = Q·I_s − Q·Y·U_s
//   VCCS in branch k controlled by the element voltage of branch j: Y_kj = ±g; CCCS controlled by
//   the element current of branch j: row k gets ±β·(row j of Y). Coupled inductors: Z_jk = ±jωM
//   (+ when both branches enter or both leave the dotted ends), Y = Z⁻¹ on the coupled block.
//   state equations: x = capacitor voltages / inductor currents (passive convention of each
//   element), u = independent sources; obtained by replacing each C with a voltage source and each
//   L with a current source and solving the resistive circuit (equivalent to the proper-tree method).

import type { Analysis, Complex, Netlist, Pt } from '../problem/types';
import { Circuit, type CEl } from './circuit';
import { ONE, ZERO, abs, add, cx, div, mul, scale, sub } from './complex';
import { AnalysisError } from './errors';
import { luFactor, realSolve } from './linalg';
import { MnaSystem } from './mna';
import { StaticAnalysis } from './engine';

// ---------------- format ----------------

export interface GraphBranch {
  /** branch number 1..b (columns of A, B_f, Q_f) */
  n: number;
  /** graph node names (node labels of the circuit); the branch is oriented from → to */
  from: string;
  to: string;
  /** circuit elements forming this branch (series chain from → to; current sources and
   *  controlled current sources in parallel with part of it) */
  els: string[];
  /** drawing only: perpendicular offset of the curved edge (grid units), for parallel branches */
  bend?: number;
}

export interface GraphSpec {
  /** graph nodes in row order of A; `at` is the position in the graph figure (grid units) */
  nodes: { name: string; at: Pt }[];
  /** reference node (its row is deleted from A) */
  ref: string;
  branches: GraphBranch[];
  /** tree branch numbers */
  tree?: number[];
  /** drawing: do not distinguish tree branches from links (when the question is "find a tree") */
  hideTree?: boolean;
  /** drawing: cut-sets shown as closed dashed curves through `path` */
  cutsets?: { name?: string; branches: number[]; path: Pt[] }[];
}

export interface StateSpec {
  /** state variables in order: a capacitor ref (its voltage) or an inductor ref (its current) */
  x: string[];
  /** inputs in order: independent source refs */
  u: string[];
}

export const MATRIX_KINDS = ['mat', 'gcount', 'state'] as const;
export const isMatrixKind = (k: unknown): boolean => (MATRIX_KINDS as readonly unknown[]).includes(k);

export const MATRICES = ['A', 'Bf', 'Qf', 'Yb', 'Zb', 'Us', 'Is', 'Yn', 'Jn', 'Zl', 'El', 'Yt', 'Jt', 'Un', 'Il', 'Ut', 'Ub', 'Ib'] as const;
export type MatrixName = (typeof MATRICES)[number];
/** column vectors (only `row` is used) */
export const VECTORS: readonly MatrixName[] = ['Us', 'Is', 'Jn', 'El', 'Jt', 'Un', 'Il', 'Ut', 'Ub', 'Ib'];
export const COUNTS = ['nodes', 'branches', 'tree', 'links'] as const;

type CMat = Complex[][];
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

// ---------------- the directed graph (structure only) ----------------

export class DiGraph {
  readonly names: string[];
  readonly ref: number;
  /** node indices of the rows of A (all nodes except ref, in listed order) */
  readonly rows: number[];
  readonly br: { n: number; from: number; to: number }[];
  /** tree branch indices (0-based, ascending branch number) */
  readonly tree: number[];
  readonly links: number[];

  constructor(readonly spec: GraphSpec) {
    this.names = spec.nodes.map((x) => x.name);
    const idx = (nm: string, what: string) => {
      const i = this.names.indexOf(nm);
      if (i < 0) throw new AnalysisError(`graph: ${what} "${nm}" is not one of the graph nodes (${this.names.join(', ')})`);
      return i;
    };
    this.ref = idx(spec.ref, 'reference node');
    this.rows = this.names.map((_, i) => i).filter((i) => i !== this.ref);
    const sorted = [...spec.branches].sort((a, b) => a.n - b.n);
    sorted.forEach((b, k) => {
      if (b.n !== k + 1) throw new AnalysisError(`graph: branches must be numbered 1, 2, …, ${sorted.length} (found ${b.n})`);
    });
    this.br = sorted.map((b) => ({ n: b.n, from: idx(b.from, `branch ${b.n}: node`), to: idx(b.to, `branch ${b.n}: node`) }));
    for (const b of this.br) if (b.from === b.to) throw new AnalysisError(`graph: branch ${b.n} is a self-loop`);
    if (!this.connected(new Set())) throw new AnalysisError('graph: the graph is not connected');
    const tree = spec.tree ?? [];
    this.tree = [...tree]
      .sort((a, b) => a - b)
      .map((n) => {
        if (!Number.isInteger(n) || n < 1 || n > this.br.length) throw new AnalysisError(`graph.tree: no branch ${n}`);
        return n - 1;
      });
    if (spec.tree) {
      const why = this.notTree(this.tree);
      if (why) throw new AnalysisError(`graph.tree: ${why}`);
    }
    this.links = this.br.map((_, k) => k).filter((k) => !this.tree.includes(k));
  }

  get n(): number {
    return this.names.length;
  }
  get b(): number {
    return this.br.length;
  }

  /** components after removing the branches in `cut`: component id per node */
  components(cut: ReadonlySet<number>): number[] {
    const comp = new Array<number>(this.n).fill(-1);
    let c = 0;
    for (let s = 0; s < this.n; s++) {
      if (comp[s] >= 0) continue;
      const stack = [s];
      comp[s] = c;
      while (stack.length) {
        const u = stack.pop()!;
        this.br.forEach((b, k) => {
          if (cut.has(k)) return;
          const v = b.from === u ? b.to : b.to === u ? b.from : -1;
          if (v >= 0 && comp[v] < 0) {
            comp[v] = c;
            stack.push(v);
          }
        });
      }
      c++;
    }
    return comp;
  }

  connected(cut: ReadonlySet<number>): boolean {
    return this.components(cut).every((c) => c === 0);
  }

  /** why a set of branch indices is not a tree (null if it is one) */
  notTree(set: number[]): string | null {
    if (new Set(set).size !== set.length) return 'a branch is listed twice';
    if (set.length !== this.n - 1) return `a tree of a graph with ${this.n} nodes has ${this.n - 1} branches (listed: ${set.length})`;
    const others = new Set(this.br.map((_, k) => k).filter((k) => !set.includes(k)));
    if (!this.connected(others)) return 'the listed branches do not connect all nodes (they contain a loop)';
    return null;
  }

  /** why a set of branch indices is not a cut-set (null if it is one) */
  notCutset(set: number[]): string | null {
    const cut = new Set(set);
    if (cut.size !== set.length) return 'a branch is listed twice';
    const comp = this.components(cut);
    const parts = new Set(comp).size;
    if (parts !== 2) return parts === 1 ? 'removing these branches leaves the graph connected' : `removing these branches leaves ${parts} separate parts (not minimal)`;
    for (const k of set) if (comp[this.br[k].from] === comp[this.br[k].to]) return `branch ${k + 1} is not needed (not minimal)`;
    return null;
  }

  /** full incidence matrix (n × b) */
  incidence(): number[][] {
    return this.names.map((_, j) => this.br.map((b) => (b.from === j ? 1 : b.to === j ? -1 : 0)));
  }

  /** reduced incidence matrix A ((n−1) × b) */
  A(): number[][] {
    const Aa = this.incidence();
    return this.rows.map((j) => Aa[j]);
  }

  private needTree(what: string) {
    if (!this.spec.tree) throw new AnalysisError(`${what} needs a tree: list the tree branches in graph.tree`);
  }

  /** tree path from node u to node v: [branch index, +1 if traversed from → to][] */
  private treePath(u: number, v: number): [number, number][] {
    const prev = new Map<number, [number, number, number]>([[u, [-1, -1, 0]]]);
    const queue = [u];
    while (queue.length) {
      const x = queue.shift()!;
      if (x === v) break;
      for (const k of this.tree) {
        const b = this.br[k];
        const y = b.from === x ? b.to : b.to === x ? b.from : -1;
        if (y >= 0 && !prev.has(y)) {
          prev.set(y, [x, k, b.from === x ? 1 : -1]);
          queue.push(y);
        }
      }
    }
    const path: [number, number][] = [];
    for (let x = v; x !== u;) {
      const [p, k, s] = prev.get(x)!;
      path.push([k, s]);
      x = p;
    }
    return path.reverse();
  }

  /** fundamental loop matrix B_f (links × b), rows in ascending link number */
  Bf(): number[][] {
    this.needTree('B_f');
    return this.links.map((l) => {
      const row = new Array<number>(this.b).fill(0);
      row[l] = 1;
      const b = this.br[l];
      // the loop goes along the link from → to, then back through the tree from "to" to "from"
      for (const [k, s] of this.treePath(b.to, b.from)) row[k] = s;
      return row;
    });
  }

  /** fundamental cut-set matrix Q_f (tree branches × b), rows in ascending tree-branch number */
  Qf(): number[][] {
    this.needTree('Q_f');
    return this.tree.map((t) => {
      const cut = new Set(this.links);
      cut.add(t);
      const comp = this.components(cut);
      const side = comp[this.br[t].from];
      return this.br.map((b) => (comp[b.from] === comp[b.to] ? 0 : comp[b.from] === side ? 1 : -1));
    });
  }

  count(which: string): number {
    switch (which) {
      case 'nodes':
        return this.n;
      case 'branches':
        return this.b;
      case 'tree':
        return this.n - 1;
      case 'links':
        return this.b - this.n + 1;
    }
    throw new AnalysisError(`gcount: "count" must be ${COUNTS.join(' / ')}`);
  }
}

// ---------------- branches made of circuit elements ----------------

interface BranchModel {
  n: number;
  /** +1 if going from → to along the branch passes the element from its p to its n */
  sigma: Map<string, number>;
  passive?: CEl;
  vsrc: CEl[];
  isrc: CEl[];
  ctl: CEl[];
}

const SERIES_OK = new Set(['R', 'L', 'C', 'Z', 'V']);
const PARALLEL_OK = new Set(['I', 'VCCS', 'CCCS']);
const PASSIVE = new Set(['R', 'L', 'C', 'Z']);

/** The graph node a name refers to, resolved to a circuit node name. */
const resolve = (netlist: Netlist, nm: string) => netlist.aliases?.get(nm) ?? (/^(0|gnd)$/i.test(nm) ? '0' : nm);

/**
 * Check that the graph matches the circuit and build each branch's element model.
 * Errors are thrown as AnalysisError with a readable message.
 */
export function branchModels(netlist: Netlist, g: DiGraph): BranchModel[] {
  const nodeOf = (ref: string, pin: string) => netlist.nodeOf.get(`${ref}.${pin}`)!;
  const gnode = g.names.map((nm) => resolve(netlist, nm));
  for (const [i, nm] of gnode.entries())
    if (!netlist.nodes.includes(nm)) throw new AnalysisError(`graph.nodes: "${g.names[i]}" is not a node of the circuit (name it with a label)`);
  if (new Set(gnode).size !== gnode.length) throw new AnalysisError('graph.nodes: two graph nodes are the same circuit node');
  const used = new Map<string, number>();
  const byRef = new Map(netlist.elements.map((e) => [e.ref, e]));
  const models: BranchModel[] = [];
  const specs = [...g.spec.branches].sort((a, b) => a.n - b.n);
  for (const sb of specs) {
    const where = `graph: branch ${sb.n}`;
    if (!Array.isArray(sb.els) || sb.els.length === 0) throw new AnalysisError(`${where}: "els" must list its elements`);
    const els = sb.els.map((r) => {
      const e = byRef.get(r);
      if (!e) throw new AnalysisError(`${where}: no element "${r}"`);
      if (e.type === 'OPAMP' || e.type === 'XFMR' || e.type === 'K') throw new AnalysisError(`${where}: ${r} (${e.type}) cannot be a graph branch element`);
      if (used.has(r)) throw new AnalysisError(`${where}: ${r} is already in branch ${used.get(r)}`);
      used.set(r, sb.n);
      return e as { ref: string; type: string };
    });
    const head = gnode[g.names.indexOf(sb.to)];
    const tail = gnode[g.names.indexOf(sb.from)];
    // series chain tail → head
    const series = els.filter((e) => !PARALLEL_OK.has(e.type));
    for (const e of series)
      if (!SERIES_OK.has(e.type))
        throw new AnalysisError(`${where}: ${e.ref} (${e.type}) is not supported in a standard branch (use R, L, C, Z, V in series; I, VCCS, CCCS in parallel)`);
    const chain = series.length ? [tail] : [tail, head];
    const left = [...series];
    while (left.length) {
      const at = chain[chain.length - 1];
      const k = left.findIndex((e) => nodeOf(e.ref, 'p') === at || nodeOf(e.ref, 'n') === at);
      if (k < 0) break;
      const e = left.splice(k, 1)[0];
      chain.push(nodeOf(e.ref, 'p') === at ? nodeOf(e.ref, 'n') : nodeOf(e.ref, 'p'));
    }
    if (left.length || chain[chain.length - 1] !== head || new Set(chain).size !== chain.length)
      throw new AnalysisError(
        `${where}: the series elements (${series.map((e) => e.ref).join(', ') || 'none'}) must form one chain from node ${sb.from} to node ${sb.to}${series.length ? '' : ' — a branch with only current sources must connect the two nodes directly'}`,
      );
    for (const nm of chain.slice(1, -1))
      if (gnode.includes(nm)) throw new AnalysisError(`${where}: the chain passes through graph node ${g.names[gnode.indexOf(nm)]}; split it into two branches`);
    const pos = (nm: string) => chain.indexOf(nm);
    const sigma = new Map<string, number>();
    for (const e of els) {
      const p = pos(nodeOf(e.ref, 'p'));
      const q = pos(nodeOf(e.ref, 'n'));
      if (p < 0 || q < 0)
        throw new AnalysisError(
          `${where}: ${e.ref} must connect two nodes of the branch (${chain.map((x) => (gnode.includes(x) ? g.names[gnode.indexOf(x)] : 'internal')).join(' → ')})`,
        );
      sigma.set(e.ref, q > p ? 1 : -1);
    }
    const passive = els.filter((e) => PASSIVE.has(e.type));
    if (passive.length > 1) throw new AnalysisError(`${where}: a standard branch has at most one R / L / C / Z (found ${passive.map((e) => e.ref).join(', ')})`);
    models.push({ n: sb.n, sigma, vsrc: [], isrc: [], ctl: [] });
  }
  // internal nodes must not be touched by other branches; every element must belong to a branch
  for (const e of netlist.elements) {
    if (e.type === 'K') continue;
    if (!used.has(e.ref)) throw new AnalysisError(`graph: element ${e.ref} is not in any branch (every element must belong to exactly one branch)`);
  }
  const owner = new Map<string, Set<number>>();
  for (const e of netlist.elements) {
    if (e.type === 'K') continue;
    for (const pin of ['p', 'n']) {
      const nm = nodeOf(e.ref, pin);
      if (gnode.includes(nm)) continue;
      if (!owner.has(nm)) owner.set(nm, new Set());
      owner.get(nm)!.add(used.get(e.ref)!);
    }
  }
  for (const [nm, set] of owner) if (set.size > 1) throw new AnalysisError(`graph: circuit node ${nm} is inside branches ${[...set].join(' and ')}; make it a graph node`);
  return models;
}

/** Element models with parsed values (needs the Circuit). */
function fill(models: BranchModel[], ckt: Circuit): BranchModel[] {
  return models.map((m) => {
    const out: BranchModel = { ...m, vsrc: [], isrc: [], ctl: [] };
    for (const ref of m.sigma.keys()) {
      const el = ckt.element(ref);
      if (PASSIVE.has(el.type)) out.passive = el;
      else if (el.type === 'V') out.vsrc.push(el);
      else if (el.type === 'I') out.isrc.push(el);
      else out.ctl.push(el);
    }
    return out;
  });
}

// ---------------- matrices with element values ----------------

const cm = (m: number[][]): CMat => m.map((r) => r.map((x) => cx(x)));
function mmul(A: CMat, B: CMat): CMat {
  return A.map((r) => B[0].map((_, j) => r.reduce((s, a, k) => add(s, mul(a, B[k][j])), ZERO)));
}
const tr = (A: CMat): CMat => (A.length ? A[0].map((_, j) => A.map((r) => r[j])) : []);
const mvec = (A: CMat, x: Complex[]): Complex[] => A.map((r) => r.reduce((s, a, k) => add(s, mul(a, x[k])), ZERO));
const vsub = (a: Complex[], b: Complex[]) => a.map((x, i) => sub(x, b[i]));
function inv(A: CMat): CMat {
  const lu = luFactor(A);
  const cols = A.map((_, j) => lu.solve(A.map((__, i) => (i === j ? ONE : ZERO))));
  return tr(cols);
}
function solve(A: CMat, b: Complex[], what: string): Complex[] {
  try {
    return luFactor(A).solve(b);
  } catch {
    throw new AnalysisError(`${what}: the coefficient matrix is singular`);
  }
}

/** Everything of chapter 15 for one circuit + graph at one analysis. */
export class MatrixForm {
  readonly g: DiGraph;
  readonly models: BranchModel[];
  readonly ckt: Circuit;
  readonly an: StaticAnalysis;
  readonly omega: number;

  constructor(
    readonly netlist: Netlist,
    spec: GraphSpec,
    analysis: Analysis,
  ) {
    this.g = new DiGraph(spec);
    this.ckt = new Circuit(netlist);
    this.models = fill(branchModels(netlist, this.g), this.ckt);
    if (analysis.type === 'ac') {
      this.omega = analysis.omega ?? 2 * Math.PI * (analysis.freq ?? 0);
      this.an = new StaticAnalysis(this.ckt, 'ac', this.omega, 'after', analysis.phasor === 'peak');
    } else if (analysis.type === 'periodic') throw new AnalysisError('matrix-form quantities need analysis "dc", "ac" or "tran"');
    else {
      this.omega = 0;
      this.an = new StaticAnalysis(this.ckt, 'dc', 0, 'after');
    }
  }

  private where(m: BranchModel) {
    return `branch ${m.n}`;
  }

  /** branch impedance of the passive element (Infinity-free: throws when undefined) */
  private zOf(m: BranchModel, what: string): Complex {
    const el = m.passive;
    const w = this.omega;
    if (!el) {
      if (m.isrc.length || m.ctl.length) throw new AnalysisError(`${what}: ${this.where(m)} is a current-source branch; its impedance is infinite`);
      return ZERO;
    }
    switch (el.type) {
      case 'R':
        return cx(el.value);
      case 'L':
        return cx(0, w * el.value);
      case 'C':
        if (w === 0) throw new AnalysisError(`${what}: ${el.ref} is open in DC; its impedance is infinite`);
        return cx(0, -1 / (w * el.value));
      default:
        return el.z!;
    }
  }

  private yOf(m: BranchModel, what: string): Complex {
    const el = m.passive;
    if (!el) {
      if (m.vsrc.length)
        throw new AnalysisError(
          `${what}: ${this.where(m)} is a voltage source alone; its admittance is infinite (the node / cut-set method needs every voltage source in series with an impedance)`,
        );
      return ZERO;
    }
    if (el.type === 'C') return cx(0, this.omega * el.value);
    const z = this.zOf(m, what);
    if (abs(z) === 0) throw new AnalysisError(`${what}: ${el.ref} has zero impedance${el.type === 'L' ? ' in DC' : ''}; its admittance is infinite`);
    return div(ONE, z);
  }

  private mutual(): { j: number; k: number; zm: Complex }[] {
    const out: { j: number; k: number; zm: Complex }[] = [];
    for (const mu of this.ckt.mutual) {
      const j = this.models.findIndex((m) => m.passive?.ref === mu.l1);
      const k = this.models.findIndex((m) => m.passive?.ref === mu.l2);
      if (j < 0 || k < 0) throw new AnalysisError(`coupling ${mu.ref}: both inductors must be the R/L/C element of a branch`);
      const s = this.models[j].sigma.get(mu.l1)! * this.models[k].sigma.get(mu.l2)!;
      out.push({ j, k, zm: cx(0, s * this.omega * mu.M) });
    }
    return out;
  }

  /** branch impedance matrix Z (b × b) */
  Zb(): CMat {
    const b = this.g.b;
    for (const m of this.models) if (m.ctl.length) throw new AnalysisError(`Z_b: ${this.where(m)} has a controlled current source; use the node method (Y)`);
    const Z: CMat = Array.from({ length: b }, (_, i) => Array.from({ length: b }, (__, j) => (i === j ? this.zOf(this.models[i], 'Z_b') : ZERO)));
    for (const { j, k, zm } of this.mutual()) Z[j][k] = Z[k][j] = add(Z[j][k], zm);
    return Z;
  }

  /** branch admittance matrix Y (b × b), controlled current sources included */
  Yb(): CMat {
    const b = this.g.b;
    const Y: CMat = Array.from({ length: b }, () => new Array<Complex>(b).fill(ZERO));
    const mut = this.mutual();
    const coupled = new Set(mut.flatMap(({ j, k }) => [j, k]));
    this.models.forEach((m, i) => {
      if (!coupled.has(i)) Y[i][i] = this.yOf(m, 'Y_b');
    });
    if (coupled.size) {
      const idx = [...coupled].sort((a, c) => a - c);
      const Zs: CMat = idx.map((r) => idx.map((c) => (r === c ? this.zOf(this.models[r], 'Y_b') : ZERO)));
      for (const { j, k, zm } of mut) {
        const a = idx.indexOf(j);
        const c = idx.indexOf(k);
        Zs[a][c] = Zs[c][a] = add(Zs[a][c], zm);
      }
      const Ys = inv(Zs);
      idx.forEach((r, a) => idx.forEach((c, d) => (Y[r][c] = Ys[a][d])));
    }
    const passiveY = Y.map((r) => r.slice());
    this.models.forEach((m, k) => {
      for (const el of m.ctl) {
        const c = el.ctrl as { v?: string; i?: string };
        const ref = c.v ?? c.i;
        const j = this.models.findIndex((x) => x.passive?.ref === ref);
        if (!ref || j < 0)
          throw new AnalysisError(`Y_b: ${el.ref} must be controlled by the voltage / current of the R, L, C or Z element of a branch (${JSON.stringify(el.ctrl)})`);
        const s = m.sigma.get(el.ref)! * this.models[j].sigma.get(ref)!;
        if (el.type === 'VCCS') Y[k][j] = add(Y[k][j], cx(s * el.value));
        else for (let q = 0; q < b; q++) Y[k][q] = add(Y[k][q], scale(passiveY[j][q], s * el.value));
      }
    });
    return Y;
  }

  /** branch source vectors U_s, I_s (textbook directions) */
  Us(): Complex[] {
    return this.models.map((m) => m.vsrc.reduce((s, el) => add(s, scale(this.an.sourceValue(el), -m.sigma.get(el.ref)!)), ZERO));
  }
  Is(): Complex[] {
    return this.models.map((m) => m.isrc.reduce((s, el) => add(s, scale(this.an.sourceValue(el), -m.sigma.get(el.ref)!)), ZERO));
  }

  A(): CMat {
    return cm(this.g.A());
  }
  Bf(): CMat {
    return cm(this.g.Bf());
  }
  Qf(): CMat {
    return cm(this.g.Qf());
  }

  Yn(): CMat {
    const A = this.A();
    return mmul(mmul(A, this.Yb()), tr(A));
  }
  Jn(): Complex[] {
    const A = this.A();
    return vsub(mvec(A, this.Is()), mvec(A, mvec(this.Yb(), this.Us())));
  }
  Zl(): CMat {
    const B = this.Bf();
    return mmul(mmul(B, this.Zb()), tr(B));
  }
  El(): Complex[] {
    const B = this.Bf();
    return vsub(mvec(B, this.Us()), mvec(B, mvec(this.Zb(), this.Is())));
  }
  Yt(): CMat {
    const Q = this.Qf();
    return mmul(mmul(Q, this.Yb()), tr(Q));
  }
  Jt(): Complex[] {
    const Q = this.Qf();
    return vsub(mvec(Q, this.Is()), mvec(Q, mvec(this.Yb(), this.Us())));
  }
  /** node voltages (to the reference node) from the node equations */
  Un(): Complex[] {
    return solve(this.Yn(), this.Jn(), 'node equations A·Y·Aᵀ·U_n = A·I_s − A·Y·U_s');
  }
  /** link (loop) currents from the loop equations */
  Il(): Complex[] {
    return solve(this.Zl(), this.El(), 'loop equations B·Z·Bᵀ·I_l = B·U_s − B·Z·I_s');
  }
  /** tree-branch voltages from the cut-set equations */
  Ut(): Complex[] {
    return solve(this.Yt(), this.Jt(), 'cut-set equations Q·Y·Qᵀ·U_t = Q·I_s − Q·Y·U_s');
  }
  /** branch voltages U = Aᵀ·U_n (node method) */
  Ub(): Complex[] {
    return mvec(tr(this.A()), this.Un());
  }
  /** branch currents I = Y(U + U_s) − I_s (node method) */
  Ib(): Complex[] {
    const U = this.Ub();
    const Us = this.Us();
    return vsub(
      mvec(
        this.Yb(),
        U.map((u, i) => add(u, Us[i])),
      ),
      this.Is(),
    );
  }

  get(name: MatrixName): CMat | Complex[] {
    switch (name) {
      case 'A':
        return this.A();
      case 'Bf':
        return this.Bf();
      case 'Qf':
        return this.Qf();
      case 'Yb':
        return this.Yb();
      case 'Zb':
        return this.Zb();
      case 'Us':
        return this.Us();
      case 'Is':
        return this.Is();
      case 'Yn':
        return this.Yn();
      case 'Jn':
        return this.Jn();
      case 'Zl':
        return this.Zl();
      case 'El':
        return this.El();
      case 'Yt':
        return this.Yt();
      case 'Jt':
        return this.Jt();
      case 'Un':
        return this.Un();
      case 'Il':
        return this.Il();
      case 'Ut':
        return this.Ut();
      case 'Ub':
        return this.Ub();
      case 'Ib':
        return this.Ib();
    }
    throw new AnalysisError(`mat: unknown matrix "${String(name)}" (available: ${MATRICES.join(', ')})`);
  }

  /** node voltages (to the reference node) of the MNA engine, in graph row order */
  mnaNodeVoltages(): Complex[] {
    const sol = this.an.base();
    const ref = resolve(this.netlist, this.g.spec.ref);
    return this.g.rows.map((j) => sol.v(resolve(this.netlist, this.g.names[j]), ref));
  }
}

/** pick element (row, col) of a matrix / vector, 1-based */
function entry(M: CMat | Complex[], name: string, row: unknown, col: unknown): Complex {
  const isVec = VECTORS.includes(name as MatrixName);
  const rows = M.length;
  if (!(typeof row === 'number' && Number.isInteger(row) && row >= 1 && row <= rows)) throw new AnalysisError(`mat: "row" must be 1…${rows} for ${name}`);
  if (isVec) {
    if (col !== undefined && col !== 1) throw new AnalysisError(`mat: ${name} is a column vector; give only "row"`);
    return (M as Complex[])[row - 1];
  }
  const cols = (M as CMat)[0]?.length ?? 0;
  if (!(typeof col === 'number' && Number.isInteger(col) && col >= 1 && col <= cols)) throw new AnalysisError(`mat: "col" must be 1…${cols} for ${name}`);
  return (M as CMat)[row - 1][col - 1];
}

// ---------------- state equations ----------------

/** ẋ = A·x + B·u for the t > 0 circuit (switches "after"); real matrices. */
export function stateMatrices(netlist: Netlist, spec: StateSpec): { A: number[][]; B: number[][] } {
  if (!isObj(spec) || !Array.isArray(spec.x) || !Array.isArray(spec.u)) throw new AnalysisError('state: needs schematic.state = {"x": [...], "u": [...]}');
  const ckt0 = new Circuit(netlist);
  const xs = spec.x.map((r) => {
    const el = ckt0.element(r);
    if (el.type !== 'C' && el.type !== 'L') throw new AnalysisError(`state.x: ${r} must be a capacitor or an inductor`);
    return el;
  });
  for (const el of ckt0.els)
    if ((el.type === 'C' || el.type === 'L') && !spec.x.includes(el.ref)) throw new AnalysisError(`state.x: ${el.ref} is missing (list every capacitor and inductor)`);
  for (const el of ckt0.els) if ((el.type === 'V' || el.type === 'I') && !spec.u.includes(el.ref)) throw new AnalysisError(`state.u: source ${el.ref} is missing`);
  for (const r of spec.u) {
    const el = ckt0.element(r);
    if (el.type !== 'V' && el.type !== 'I') throw new AnalysisError(`state.u: ${r} must be an independent source`);
  }
  if (new Set(spec.x).size !== spec.x.length || new Set(spec.u).size !== spec.u.length) throw new AnalysisError('state: a ref is listed twice');
  // C → voltage source, L → current source, couplings removed (handled through the inductance matrix)
  const elements = netlist.elements
    .filter((e) => e.type !== 'K')
    .map((e) => (e.type === 'C' ? { ...e, type: 'V' as const, value: 0, ic: undefined } : e.type === 'L' ? { ...e, type: 'I' as const, value: 0, ic: undefined } : e));
  const ckt = new Circuit({ ...netlist, elements });
  const sys = new MnaSystem(ckt, { kind: 'dc', phase: 'after', label: 'the resistive circuit with C → voltage source, L → current source' });
  if (sys.error)
    throw new AnalysisError(`state: ${sys.error.message} — the circuit has a loop of capacitors / voltage sources or a cut-set of inductors / current sources (no proper tree)`);
  const inputs = [...xs.map((e) => e.ref), ...spec.u];
  const cols = inputs.map((ref) => {
    let sol;
    try {
      sol = sys.solve((el) => (el.ref === ref ? ONE : ZERO));
    } catch (e) {
      throw new AnalysisError(`state: ${(e as Error).message} — the circuit has a loop of capacitors / voltage sources or a cut-set of inductors / current sources`);
    }
    // derivative-side quantities: C·du/dt = i_C, L·di/dt = u_L (passive conventions)
    return xs.map((el) => (el.type === 'C' ? sol.i(el.ref).re : sol.vEl(el.ref).re));
  });
  const nx = xs.length;
  const rhs = Array.from({ length: nx }, (_, i) => cols.map((c) => c[i]));
  // mass matrix: diag(C), inductance matrix with mutual terms
  const M = Array.from({ length: nx }, () => new Array<number>(nx).fill(0));
  xs.forEach((el, i) => (M[i][i] = el.value));
  for (const mu of ckt0.mutual) {
    const i = spec.x.indexOf(mu.l1);
    const j = spec.x.indexOf(mu.l2);
    M[i][j] = M[j][i] = mu.M;
  }
  const S = realSolve(M, rhs);
  return { A: S.map((r) => r.slice(0, nx)), B: S.map((r) => r.slice(nx)) };
}

// ---------------- quantities ----------------

/** a quantity of the matrix-form chapter ({kind: "mat" | "gcount" | "state"}) */
export function matrixQuantity(
  netlist: Netlist & { graph?: GraphSpec; state?: StateSpec },
  analysis: Analysis,
  find: Record<string, unknown>,
): { value: Complex; complex: boolean; defaultPart: 're' } {
  const out = (value: Complex) => ({ value, complex: true, defaultPart: 're' as const });
  if (find.kind === 'state') {
    if (!netlist.state) throw new AnalysisError('state: the problem needs schematic.state = {"x": [...], "u": [...]}');
    const m = stateMatrices(netlist, netlist.state);
    const M = find.mat === 'A' ? m.A : find.mat === 'B' ? m.B : null;
    if (!M) throw new AnalysisError('state: "mat" must be "A" or "B"');
    return out(entry(cm(M), `state ${find.mat}`, find.row, find.col));
  }
  if (!netlist.graph) throw new AnalysisError(`${String(find.kind)}: the problem needs schematic.graph`);
  if (find.kind === 'gcount') return out(cx(new DiGraph(netlist.graph).count(find.count as string)));
  if (!MATRICES.includes(find.mat as MatrixName)) throw new AnalysisError(`mat: "mat" must be one of ${MATRICES.join(', ')}`);
  const mf = new MatrixForm(netlist, netlist.graph, analysis);
  return out(entry(mf.get(find.mat as MatrixName), find.mat as string, find.row, find.col));
}

/**
 * Validation of schematic.graph against the circuit: structure, branch models, and — when the
 * node equations can be formed — the node voltages solved from A·Y·Aᵀ·U_n = A·I_s − A·Y·U_s must
 * equal the MNA engine's. Returns error messages (empty = fine).
 */
export function checkGraphAgainstCircuit(netlist: Netlist, spec: GraphSpec, analysis: Analysis | null, verify: boolean): string[] {
  try {
    const g = new DiGraph(spec);
    branchModels(netlist, g);
    for (const [i, c] of (spec.cutsets ?? []).entries()) {
      const set = (c.branches ?? []).map((n) => n - 1);
      if (set.some((k) => !(k >= 0 && k < g.b))) return [`graph.cutsets[${i}]: unknown branch number`];
      const why = g.notCutset(set);
      if (why) return [`graph.cutsets[${i}] (${c.branches.join(', ')}): not a cut-set — ${why}`];
    }
    if (!verify || !analysis || analysis.type === 'periodic') return [];
    const mf = new MatrixForm(netlist, spec, analysis);
    let un: Complex[];
    try {
      un = mf.Un();
    } catch {
      return []; // node equations not formable (lone voltage source, current source with Z, …): nothing to compare
    }
    const ref = mf.mnaNodeVoltages();
    const scaleV = Math.max(1e-9, ...ref.map(abs));
    for (let k = 0; k < un.length; k++)
      if (abs(sub(un[k], ref[k])) > 1e-6 * scaleV)
        return [`graph: the node equations of the graph give U_n${k + 1} = ${fmtC(un[k])} but the circuit gives ${fmtC(ref[k])} — check the branch elements and directions`];
    return [];
  } catch (e) {
    return [(e as Error).message];
  }
}

const fmtC = (z: Complex) =>
  Math.abs(z.im) < 1e-12 ? Number(z.re.toPrecision(6)).toString() : `${Number(z.re.toPrecision(6))}${z.im >= 0 ? '+' : '−'}j${Number(Math.abs(z.im).toPrecision(6))}`;
