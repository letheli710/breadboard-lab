// Modified nodal analysis. Every two-terminal element gets a branch-current unknown and one
// constitutive row a·v + b·i + Σ(control terms) = rhs, so shorts, zero resistors, controlled
// sources of any kind and current-controlled sources referring to any element all work the
// same way. OPAMP adds its output current, XFMR its two winding currents.

import type { Complex } from '../problem/types';
import { Circuit, type CEl, isTwoTerminal } from './circuit';
import { ONE, ZERO, cx, neg, scale, sub } from './complex';
import { AnalysisError } from './errors';
import { type ComplexLU, SingularMatrixError, luFactor } from './linalg';

export type ModeKind = 'dc' | 'ac' | 'res';

export interface Mode {
  /** dc: C open, L short. ac: phasors at omega. res: transient companion (C → v = state, L → i = state) */
  kind: ModeKind;
  omega?: number;
  /** which switch state applies */
  phase: 'before' | 'after';
  /** elements replaced by an open circuit */
  removed?: ReadonlySet<string>;
  /** extra (synthetic) elements: test sources, shorts */
  extra?: readonly CEl[];
  /** dc: capacitors / inductors with `ic` are held at their initial value */
  icFixed?: boolean;
  /** dc: resolve capacitor-only cut-sets by zero net charge and inductor-only loops by zero
   *  loop flux (the "initially uncharged / de-energised" assumption) */
  conserve?: boolean;
  /** with `conserve`: the charge / flux is not zero but taken from these element states
   *  (capacitor voltage, inductor current at t = 0−), keyed by ref */
  conserveInit?: ReadonlyMap<string, number>;
  /** ac: complex frequency s instead of jω (natural-frequency computations) */
  s?: Complex;
  /** res: tiny series resistance (C) or parallel conductance (L) for dependent states */
  parasitic?: ReadonlyMap<string, number>;
  /** for messages, e.g. "DC analysis" */
  label: string;
}

interface Term {
  coef: Complex;
  vp?: number;
  vn?: number;
  cur?: string;
}
type Rhs = 'none' | 'src' | 'state' | number;
export interface Rel {
  a: Complex;
  b: Complex;
  terms: Term[];
  rhs: Rhs;
  /** absent from the topology (open switch, voltmeter, removed) */
  open: boolean;
  /** fixes the voltage without depending on its own current (source / short) */
  vlike: boolean;
}

const OPEN: Rel = { a: ZERO, b: ONE, terms: [], rhs: 'none', open: true, vlike: false };
const rel = (a: Complex, b: Complex, extra: Partial<Rel> = {}): Rel => ({ a, b, terms: [], rhs: 'none', open: false, vlike: false, ...extra });

export const switchClosed = (el: CEl, phase: 'before' | 'after'): boolean => el.sw![phase] === 'closed';

export class MnaSystem {
  readonly all: CEl[];
  readonly byRef = new Map<string, CEl>();
  readonly varOf = new Map<string, number>();
  readonly rels = new Map<string, Rel>();
  readonly size: number;
  readonly nv: number;
  /** union-find root per node; nodes whose root differs from ground's are galvanically isolated */
  readonly island: Int32Array;
  readonly matrix: Complex[][];
  readonly error: AnalysisError | null = null;
  /** number of charge / flux conservation rows (structural zero natural frequencies) */
  conservedCount = 0;
  private readonly conserveRhs = new Map<number, number>();
  private readonly lu: ComplexLU | null = null;

  constructor(
    readonly ckt: Circuit,
    readonly mode: Mode,
  ) {
    this.all = [...ckt.els, ...(mode.extra ?? [])];
    for (const el of this.all) this.byRef.set(el.ref, el);
    const N = ckt.nodeNames.length;
    this.nv = N - 1;
    let idx = this.nv;
    for (const el of this.all) {
      if (isTwoTerminal(el)) {
        this.varOf.set(el.ref, idx++);
        this.rels.set(el.ref, this.relationOf(el));
      } else if (el.type === 'OPAMP') this.varOf.set(el.ref, idx++);
    }
    for (const el of this.all)
      if (el.type === 'XFMR') {
        this.varOf.set(el.ref + '#1', idx++);
        this.varOf.set(el.ref + '#2', idx++);
      }
    this.size = idx;
    const n = idx;
    const A: Complex[][] = Array.from({ length: n }, () => new Array<Complex>(n).fill(ZERO));
    const put = (r: number, c: number, v: Complex) => {
      if (v.re === 0 && v.im === 0) return;
      const o = A[r][c];
      A[r][c] = cx(o.re + v.re, o.im + v.im);
    };
    const putV = (r: number, p: number, q: number, coef: Complex) => {
      if (p === q) return;
      if (p !== 0) put(r, p - 1, coef);
      if (q !== 0) put(r, q - 1, neg(coef));
    };
    const kcl = (node: number, col: number, sign: number) => {
      if (node !== 0) put(node - 1, col, cx(sign));
    };

    // topology for isolated sub-circuits
    const parent = new Int32Array(N);
    for (let i = 0; i < N; i++) parent[i] = i;
    const find = (x: number): number => {
      while (parent[x] !== x) x = parent[x] = parent[parent[x]];
      return x;
    };
    const unite = (a: number, b: number) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
    };

    for (const el of this.all) {
      if (isTwoTerminal(el)) {
        const r = this.rels.get(el.ref)!;
        const c = this.varOf.get(el.ref)!;
        const [p, q] = el.pins;
        kcl(p, c, 1);
        kcl(q, c, -1);
        putV(c, p, q, r.a);
        put(c, c, r.b);
        for (const t of r.terms) {
          if (t.cur !== undefined) {
            const cc = this.varOf.get(t.cur);
            if (cc === undefined) throw new AnalysisError(`${el.ref}: controlling element "${t.cur}" not found`);
            put(c, cc, t.coef);
          } else putV(c, t.vp!, t.vn!, t.coef);
        }
        if (!r.open) unite(p, q);
      } else if (el.type === 'OPAMP') {
        const c = this.varOf.get(el.ref)!;
        const [mi, pl, out] = el.pins;
        kcl(out, c, -1); // output current flows out of the op-amp into node `out`
        putV(c, pl, mi, ONE); // V+ − V− = 0
        unite(out, 0);
        unite(pl, mi);
      } else if (el.type === 'XFMR') {
        const c1 = this.varOf.get(el.ref + '#1')!;
        const c2 = this.varOf.get(el.ref + '#2')!;
        const [p1, n1, p2, n2] = el.pins;
        kcl(p1, c1, 1);
        kcl(n1, c1, -1);
        kcl(p2, c2, 1);
        kcl(n2, c2, -1);
        putV(c1, p1, n1, ONE);
        putV(c1, p2, n2, cx(-el.value)); // v1 − n·v2 = 0
        put(c2, c1, cx(el.value)); // n·i1 + i2 = 0
        put(c2, c2, ONE);
        unite(p1, n1);
        unite(p2, n2);
      }
    }
    // tie each isolated sub-circuit to ground at one node (carries no current by KCL)
    this.island = new Int32Array(N);
    const tied = new Set<number>();
    for (let i = 0; i < N; i++) {
      const r = find(i);
      this.island[i] = r;
      if (r !== find(0) && !tied.has(r)) {
        tied.add(r);
        put(r - 1, r - 1, ONE);
      }
    }
    if (mode.kind === 'dc' && mode.conserve) this.conserve(A, putV, put, find);
    this.matrix = A;
    try {
      this.lu = luFactor(A);
    } catch (e) {
      if (!(e instanceof SingularMatrixError)) throw e;
      this.error = new AnalysisError(this.diagnose(e.column));
    }
  }

  /** Replace redundant rows so that DC-floating capacitor islands carry zero net charge and
   *  loops of shorted inductors carry zero flux. */
  private conserve(
    A: Complex[][],
    putV: (r: number, p: number, q: number, c: Complex) => void,
    put: (r: number, c: number, v: Complex) => void,
    topo: (x: number) => number,
  ): void {
    const N = this.ckt.nodeNames.length;
    const par = Array.from({ length: N }, (_, i) => i);
    const f = (x: number): number => (par[x] === x ? x : (par[x] = f(par[x])));
    const join = (a: number, b: number) => (par[f(a)] = f(b));
    const two = this.all.filter(isTwoTerminal);
    // (a) capacitor cut-sets
    for (const el of two) {
      const r = this.rels.get(el.ref)!;
      if (!r.open && !(r.a.re === 0 && r.a.im === 0)) join(el.pins[0], el.pins[1]);
    }
    for (const el of this.all) {
      if (el.type === 'OPAMP') {
        join(el.pins[2], 0);
        join(el.pins[0], el.pins[1]);
      } else if (el.type === 'XFMR') {
        join(el.pins[0], el.pins[1]);
        join(el.pins[2], el.pins[3]);
      }
    }
    for (let i = 1; i < N; i++) if (topo(i) !== topo(0)) join(i, 0);
    const groups = new Map<number, number[]>();
    for (let i = 1; i < N; i++) {
      const r = f(i);
      if (r === f(0)) continue;
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r)!.push(i);
    }
    for (const nodes of groups.values()) {
      const inG = new Set(nodes);
      const boundary = two.filter((el) => !this.rels.get(el.ref)!.open && inG.has(el.pins[0]) !== inG.has(el.pins[1]));
      const caps = boundary.every((el) => el.type === 'C' && this.rels.get(el.ref)!.a.re === 0 && this.rels.get(el.ref)!.a.im === 0);
      if (!boundary.length || !caps) continue;
      const row = Math.min(...nodes) - 1;
      A[row] = A[row].map(() => ZERO);
      let q0 = 0;
      for (const el of boundary) {
        const sg = inG.has(el.pins[0]) ? 1 : -1;
        putV(row, el.pins[0], el.pins[1], cx(sg * el.value));
        q0 += sg * el.value * (this.mode.conserveInit?.get(el.ref) ?? 0);
      }
      this.conserveRhs.set(row, q0);
      this.conservedCount++;
    }
    // (b) inductor loops
    for (let i = 0; i < N; i++) par[i] = i;
    const adj = new Map<number, { el: CEl; to: number }[]>();
    const addEdge = (el: CEl) => {
      const [p, q] = el.pins;
      if (!adj.has(p)) adj.set(p, []);
      if (!adj.has(q)) adj.set(q, []);
      adj.get(p)!.push({ el, to: q });
      adj.get(q)!.push({ el, to: p });
      join(p, q);
    };
    for (const el of two) {
      const r = this.rels.get(el.ref)!;
      if (r.vlike && !r.terms.length && (el.type === 'SW' || el.type === 'ammeter' || el.type === 'R')) addEdge(el);
    }
    for (const el of two) {
      if (el.type !== 'L') continue;
      const r = this.rels.get(el.ref)!;
      if (!r.vlike) continue; // removed, or held at ic
      const [p, q] = el.pins;
      if (p === q || f(p) !== f(q)) {
        if (p !== q) addEdge(el);
        continue;
      }
      // path q → p through the edges added so far
      const prev = new Map<number, { el: CEl; from: number }>();
      const queue = [q];
      prev.set(q, { el, from: -1 });
      while (queue.length && !prev.has(p) ) {
        const u = queue.shift()!;
        for (const e of adj.get(u) ?? [])
          if (!prev.has(e.to)) {
            prev.set(e.to, { el: e.el, from: u });
            queue.push(e.to);
          }
      }
      const loop: { el: CEl; sign: number }[] = [{ el, sign: 1 }];
      for (let v = p; v !== q; ) {
        const { el: e, from } = prev.get(v)!;
        loop.push({ el: e, sign: e.pins[0] === from ? 1 : -1 });
        v = from;
      }
      const row = this.varOf.get(el.ref)!;
      A[row] = A[row].map(() => ZERO);
      const i0 = (ref: string) => this.mode.conserveInit?.get(ref) ?? 0;
      let phi0 = 0;
      for (const { el: e, sign } of loop) {
        if (e.type !== 'L') continue;
        put(row, this.varOf.get(e.ref)!, cx(sign * e.value));
        phi0 += sign * e.value * i0(e.ref);
        for (const k of this.ckt.mutual) {
          const other = k.l1 === e.ref ? k.l2 : k.l2 === e.ref ? k.l1 : null;
          if (other) {
            put(row, this.varOf.get(other)!, cx(sign * k.M));
            phi0 += sign * k.M * i0(other);
          }
        }
      }
      this.conserveRhs.set(row, phi0);
      this.conservedCount++;
    }
  }

  private ctrlV(el: CEl, coef: Complex): Term {
    const c = el.ctrl as { v?: string; vnodes?: [string, string] };
    if (typeof c.v === 'string') {
      const ce = this.ckt.twoTerminal(c.v, `${el.ref}.ctrl.v`);
      return { coef, vp: ce.pins[0], vn: ce.pins[1] };
    }
    return { coef, vp: this.ckt.node(c.vnodes![0]), vn: this.ckt.node(c.vnodes![1]) };
  }

  private relationOf(el: CEl): Rel {
    const m = this.mode;
    if (m.removed?.has(el.ref)) return OPEN;
    const w = m.omega ?? 0;
    const jw = m.s ?? cx(0, w);
    switch (el.type) {
      case 'R':
        return rel(ONE, cx(-el.value), { vlike: el.value === 0 });
      case 'Z':
        if (m.kind !== 'ac') throw new AnalysisError(`${el.ref}: impedance elements (type Z) can only be used in AC analysis`);
        return rel(ONE, neg(el.z!), { vlike: el.z!.re === 0 && el.z!.im === 0 });
      case 'C':
        if (m.kind === 'dc') {
          if (m.icFixed && el.ic !== undefined) return rel(ONE, ZERO, { rhs: el.ic, vlike: true });
          return rel(ZERO, ONE);
        }
        if (m.kind === 'ac') return rel(scale(jw, el.value), cx(-1));
        {
          const r = m.parasitic?.get(el.ref) ?? 0;
          return rel(ONE, cx(-r), { rhs: 'state', vlike: r === 0 });
        }
      case 'L':
        if (m.kind === 'dc') {
          if (m.icFixed && el.ic !== undefined) return rel(ZERO, ONE, { rhs: el.ic });
          return rel(ONE, ZERO, { vlike: true });
        }
        if (m.kind === 'ac') {
          const terms: Term[] = [];
          for (const k of this.ckt.mutual) {
            const other = k.l1 === el.ref ? k.l2 : k.l2 === el.ref ? k.l1 : null;
            if (other && !m.removed?.has(other)) terms.push({ coef: scale(jw, -k.M), cur: other });
          }
          return { ...rel(ONE, scale(jw, -el.value)), terms };
        }
        return rel(cx(-(m.parasitic?.get(el.ref) ?? 0)), ONE, { rhs: 'state' });
      case 'V':
        return rel(ONE, ZERO, { rhs: 'src', vlike: true });
      case 'I':
        return rel(ZERO, ONE, { rhs: 'src' });
      case 'VCVS':
        return { ...rel(ONE, ZERO, { vlike: true }), terms: [this.ctrlV(el, cx(-el.value))] };
      case 'VCCS':
        return { ...rel(ZERO, ONE), terms: [this.ctrlV(el, cx(-el.value))] };
      case 'CCVS':
        return { ...rel(ONE, ZERO, { vlike: true }), terms: [{ coef: cx(-el.value), cur: (el.ctrl as { i: string }).i }] };
      case 'CCCS':
        return { ...rel(ZERO, ONE), terms: [{ coef: cx(-el.value), cur: (el.ctrl as { i: string }).i }] };
      case 'SW':
        return switchClosed(el, m.phase) ? rel(ONE, ZERO, { vlike: true }) : OPEN;
      case 'ammeter':
        return rel(ONE, ZERO, { vlike: true });
      case 'voltmeter':
        return OPEN;
      default:
        throw new AnalysisError(`${el.ref}: element type ${el.type} is not supported here`);
    }
  }

  private varName(i: number): string {
    if (i < 0) return '';
    if (i < this.nv) return `the voltage of node "${this.ckt.nodeNames[i + 1]}"`;
    for (const [k, v] of this.varOf)
      if (v === i) {
        if (k.includes('#')) return `the winding currents of ${k.split('#')[0]}`;
        const el = this.byRef.get(k);
        return el?.type === 'OPAMP' ? `the output current of ${k}` : `the current of ${k}`;
      }
    return '';
  }

  private diagnose(col: number): string {
    const N = this.ckt.nodeNames.length;
    const names = this.ckt.nodeNames;
    const pre = `No unique solution in ${this.mode.label}`;
    // 1. loops made only of voltage-fixing branches
    const par = Array.from({ length: N }, (_, i) => i);
    const f = (x: number): number => (par[x] === x ? x : (par[x] = f(par[x])));
    const loop: string[] = [];
    for (const el of this.all) {
      let a: number, b: number;
      if (isTwoTerminal(el)) {
        const r = this.rels.get(el.ref)!;
        if (!r.vlike || r.terms.length) continue;
        [a, b] = el.pins;
      } else if (el.type === 'OPAMP') [a, b] = [el.pins[2], 0];
      else continue;
      const ra = f(a);
      const rb = f(b);
      if (ra === rb) loop.push(el.ref);
      else par[ra] = rb;
    }
    if (loop.length) {
      const what = this.mode.kind === 'dc' ? ' (in DC an inductor is a short circuit)' : '';
      return `${pre}: ${loop.join(', ')} closes a loop made only of voltage sources / short circuits${what} (ideal switches, ammeters, zero resistors, op-amp outputs). Two ideal voltage constraints in parallel are contradictory or leave the current undetermined.`;
    }
    // 2. nodes whose voltage is not fixed relative to ground
    for (let i = 0; i < N; i++) par[i] = i;
    for (const el of this.all) {
      if (isTwoTerminal(el)) {
        const r = this.rels.get(el.ref)!;
        if (r.open || (r.a.re === 0 && r.a.im === 0)) continue;
        par[f(el.pins[0])] = f(el.pins[1]);
      } else if (el.type === 'OPAMP') {
        par[f(el.pins[2])] = f(0);
        par[f(el.pins[0])] = f(el.pins[1]);
      } else {
        par[f(el.pins[0])] = f(el.pins[1]);
        par[f(el.pins[2])] = f(el.pins[3]);
      }
    }
    for (let i = 1; i < N; i++) if (this.island[i] !== this.island[0]) par[f(i)] = f(0);
    const floating = [];
    for (let i = 1; i < N; i++) if (f(i) !== f(0)) floating.push(`"${names[i]}"`);
    if (floating.length) {
      const why =
        this.mode.kind === 'dc'
          ? 'they connect to the rest of the circuit only through capacitors (open in DC), current sources or open switches'
          : this.mode.kind === 'res'
            ? 'they connect to the rest of the circuit only through inductors or current sources (an inductor/current-source cut-set)'
            : 'they connect to the rest only through current sources';
      return `${pre}: node(s) ${floating.join(', ')} have no voltage-defining path to ground — ${why}, so their voltage is undefined.`;
    }
    const v = this.varName(col);
    return `${pre}: the circuit equations are singular${v ? ` (cannot determine ${v})` : ''}. Typical causes: a cut-set of current sources (KCL contradiction), an op-amp without negative feedback or with its output tied to a fixed voltage, a dependent source with a gain that makes the circuit degenerate, or (AC) a lossless resonance exactly at the analysis frequency.`;
  }

  /** Right-hand side from source values (and, in res mode, state values). */
  rhs(srcVal: (el: CEl) => Complex, stateVal?: (el: CEl) => number): Complex[] {
    const b = new Array<Complex>(this.size).fill(ZERO);
    for (const el of this.all) {
      if (!isTwoTerminal(el)) continue;
      const r = this.rels.get(el.ref)!;
      const c = this.varOf.get(el.ref)!;
      if (r.rhs === 'src') b[c] = srcVal(el);
      else if (r.rhs === 'state') b[c] = cx(stateVal ? stateVal(el) : 0);
      else if (typeof r.rhs === 'number') b[c] = cx(r.rhs);
    }
    for (const [row, v] of this.conserveRhs) b[row] = cx(v);
    return b;
  }

  solveVec(b: Complex[]): Complex[] {
    if (this.error || !this.lu) throw this.error ?? new AnalysisError(`No solution in ${this.mode.label}`);
    const x = this.lu.solve(b);
    for (const v of x)
      if (!Number.isFinite(v.re) || !Number.isFinite(v.im))
        throw new AnalysisError(`Numerical failure in ${this.mode.label} (the circuit is nearly singular)`);
    return x;
  }

  solve(srcVal: (el: CEl) => Complex, stateVal?: (el: CEl) => number): Solution {
    return new Solution(this, this.solveVec(this.rhs(srcVal, stateVal)));
  }
}

/** A solved operating point (DC value, AC phasor, or an instant of a transient). */
export class Solution {
  constructor(
    readonly sys: MnaSystem,
    readonly x: Complex[],
  ) {}

  private V(node: number): Complex {
    return node === 0 ? ZERO : this.x[node - 1];
  }

  /** V(a) − V(b) by node index; refuses to compare galvanically isolated parts. */
  vIdx(a: number, b: number): Complex {
    const s = this.sys;
    if (s.island[a] !== s.island[b]) {
      const nm = (i: number) => `"${s.ckt.nodeNames[i]}"`;
      throw new AnalysisError(
        `The voltage between nodes ${nm(a)} and ${nm(b)} is undefined: they are in galvanically separate parts of the circuit (e.g. two sides of a transformer with no common ground).`,
      );
    }
    return sub(this.V(a), this.V(b));
  }

  v(a: string, b = '0'): Complex {
    return this.vIdx(this.sys.ckt.node(a), this.sys.ckt.node(b));
  }

  vEl(ref: string): Complex {
    const el = this.sys.byRef.get(ref);
    if (!el) throw new AnalysisError(`Unknown element "${ref}"`);
    if (!isTwoTerminal(el)) throw new AnalysisError(`${ref} is a ${el.type}; ask for node voltages instead of its element voltage`);
    return this.vIdx(el.pins[0], el.pins[1]);
  }

  /** passive-convention current p → n (OPAMP: current out of the output terminal) */
  i(ref: string): Complex {
    const el = this.sys.byRef.get(ref);
    if (!el) throw new AnalysisError(`Unknown element "${ref}"`);
    if (el.type === 'XFMR') throw new AnalysisError(`${ref} is a transformer; ask for the current of an element in series with a winding`);
    return this.x[this.sys.varOf.get(ref)!];
  }
}

/** linear combination Σ k_j·x_j of solution vectors (same system layout) */
export function combine(sys: MnaSystem, parts: { k: Complex | number; x: Complex[] }[]): Solution {
  const n = sys.size;
  const out: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) {
    let re = 0;
    let im = 0;
    for (const { k, x } of parts) {
      const kr = typeof k === 'number' ? k : k.re;
      const ki = typeof k === 'number' ? 0 : k.im;
      re += kr * x[i].re - ki * x[i].im;
      im += kr * x[i].im + ki * x[i].re;
    }
    out[i] = cx(re, im);
  }
  return new Solution(sys, out);
}
