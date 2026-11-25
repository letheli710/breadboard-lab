// W2-L1 stage model: the four circuits of the lesson (act 1 generic, act 2 warm-up, act 3 Sadiku 3.2
// core example, act 4 CCCS example) as netlists with their 2D layout (viewBox 0 0 680 340), and
// an exact nodal-analysis solver: KCL rows in conductance form (rationals), denominators cleared
// to integer rows, integer-preserving elimination and back substitution, every step also as TeX
// for the solver bench. Any node can be the reference.

export type NodeId = 'v0' | 'v1' | 'v2' | 'v3';
export type CircuitId = 'generic' | 'warmup' | 'core' | 'cccs';
export type Pt = [number, number];
export type Anchor = 'start' | 'middle' | 'end';
/** a text position: x, y, text-anchor */
export type Pos = [number, number, Anchor];

/* ------------------------------------------------------------- exact rationals */

export interface Frac {
  n: number;
  d: number;
}
/** greatest common divisor (gcd(0, 0) = 0, so it folds over lists that start with zeros) */
const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};
const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);
export const fr = (n: number, d = 1): Frac => {
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
};
const ZERO = fr(0);
export const add = (a: Frac, b: Frac) => fr(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Frac, b: Frac) => fr(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Frac, b: Frac) => fr(a.n * b.n, a.d * b.d);
export const div = (a: Frac, b: Frac) => fr(a.n * b.d, a.d * b.n);
export const val = (a: Frac) => a.n / a.d;

/** a number for display: integers plain, short decimals as decimals, else a fraction */
export function fmtFrac(a: Frac, tex = true): string {
  const minus = tex ? '-' : '−';
  const s = a.n < 0 ? minus : '';
  const n = Math.abs(a.n);
  if (a.d === 1) return `${s}${n}`;
  let d = a.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  if (d === 1) return `${s}${String(+(n / a.d).toFixed(4))}`;
  return tex ? `${s}\\tfrac{${n}}{${a.d}}` : `${s}${n}/${a.d}`;
}

/* ------------------------------------------------------------- circuits */

export interface Elem {
  /** hover-map id of the element */
  id: string;
  kind: 'R' | 'I' | 'CCCS';
  /** R: the current i is named a → b. I / CCCS: the source drives its current a → b (arrow points at b) */
  a: NodeId;
  b: NodeId;
  /** ohms (R) or amperes (I); absent in the generic circuit */
  value?: number;
  /** CCCS: gain × the current of resistor `ctrl` (in that resistor's a → b direction) */
  gain?: number;
  ctrl?: string;
  /** TeX symbol (R_1, I_{s1}, \beta i_x) and its name on the drawing (R₁, Iₛ₁, 2iₓ) */
  sym: string;
  uni: string;
  /** TeX name of the current through it (i_1, i_x …) */
  cur: string;
  /** terminal on node a / node b */
  pa: Pt;
  pb: Pt;
  /** resistor body length (default: the whole span) */
  body?: number;
  /** label position */
  lab: Pos;
  /** which side of the axis the current arrows run (+1: right / below, −1: left / above) */
  side: 1 | -1;
  /** bubble position for the "流出" translation (layer 02) when standing on a / on b */
  bubA: Pos;
  bubB: Pos;
}

export interface Circuit {
  id: CircuitId;
  /** chip name on the stage */
  name: string;
  /** long name */
  title: string;
  /** numbers known (false: the generic circuit, letters only) */
  numeric: boolean;
  nodes: NodeId[];
  elems: Elem[];
  /** wires of each node (polylines) */
  wires: Partial<Record<NodeId, Pt[][]>>;
  /** node badge centre */
  badge: Partial<Record<NodeId, Pt>>;
  /** where the ground symbol hangs when the node is the reference */
  gnd: Partial<Record<NodeId, Pt>>;
  /** the controlling current's arrow (CCCS circuit) */
  ix?: { from: Pt; to: Pt; lab: Pos };
}

const CORE_WIRES: Circuit['wires'] = {
  v1: [
    [
      [105, 145],
      [280, 145],
    ],
  ],
  v2: [
    [
      [400, 145],
      [575, 145],
    ],
  ],
  v0: [
    [
      [105, 280],
      [575, 280],
    ],
  ],
};
const CORE_BADGE: Circuit['badge'] = { v1: [158, 119], v2: [525, 119], v0: [430, 306] };
const CORE_GND: Circuit['gnd'] = { v0: [340, 280], v1: [150, 145], v2: [520, 145] };

function threeNode(id: CircuitId, name: string, title: string, v: { is?: number; r1?: number; r2?: number; r3?: number }, isSym: string, isUni: string): Circuit {
  const numeric = v.is !== undefined;
  const ohm = (r?: number) => (r === undefined ? '' : ` = ${r} Ω`);
  return {
    id,
    name,
    title,
    numeric,
    nodes: ['v0', 'v1', 'v2'],
    wires: CORE_WIRES,
    badge: CORE_BADGE,
    gnd: CORE_GND,
    elems: [
      {
        id: 'src_is1',
        kind: 'I',
        a: 'v0',
        b: 'v1',
        value: v.is,
        sym: isSym,
        uni: `${isUni}${v.is === undefined ? '' : ` = ${v.is} A`}`,
        cur: isSym,
        pa: [105, 280],
        pb: [105, 145],
        lab: [74, 217, 'end'],
        side: 1,
        bubA: [112, 316, 'middle'],
        bubB: [152, 262, 'middle'],
      },
      {
        id: 'branch_r1',
        kind: 'R',
        a: 'v1',
        b: 'v0',
        value: v.r1,
        sym: 'R_1',
        uni: `R₁${ohm(v.r1)}`,
        cur: 'i_1',
        pa: [210, 145],
        pb: [210, 280],
        body: 64,
        lab: [192, 217, 'end'],
        side: 1,
        bubA: [244, 236, 'start'],
        bubB: [244, 236, 'start'],
      },
      {
        id: 'branch_r2',
        kind: 'R',
        a: 'v1',
        b: 'v2',
        value: v.r2,
        sym: 'R_2',
        uni: `R₂${ohm(v.r2)}`,
        cur: 'i_2',
        pa: [280, 145],
        pb: [400, 145],
        lab: [340, 186, 'middle'],
        side: -1,
        bubA: [340, 103, 'middle'],
        bubB: [340, 103, 'middle'],
      },
      {
        id: 'branch_r3',
        kind: 'R',
        a: 'v2',
        b: 'v0',
        value: v.r3,
        sym: 'R_3',
        uni: `R₃${ohm(v.r3)}`,
        cur: 'i_3',
        pa: [575, 145],
        pb: [575, 280],
        body: 64,
        lab: [594, 217, 'start'],
        side: -1,
        bubA: [543, 236, 'end'],
        bubB: [543, 236, 'end'],
      },
    ],
  };
}

const GENERIC = threeNode('generic', '通用', '通用 3 节点网络（字母）', {}, 'I_s', 'Iₛ');
const WARMUP = threeNode('warmup', '热身', '热身电路：5 A, 3 Ω, 6 Ω, 6 Ω', { is: 5, r1: 3, r2: 6, r3: 6 }, 'I_s', 'Iₛ');

const CORE: Circuit = (() => {
  const base = threeNode('core', '例题 1', '经典例题 1（Sadiku 3.2 核心）', { is: 5, r1: 2, r2: 4, r3: 6 }, 'I_{s1}', 'Iₛ₁');
  return {
    ...base,
    wires: {
      ...CORE_WIRES,
      v1: [
        ...CORE_WIRES.v1!,
        [
          [210, 145],
          [210, 70],
          [290, 70],
        ],
      ],
      v2: [
        ...CORE_WIRES.v2!,
        [
          [390, 70],
          [470, 70],
          [470, 145],
        ],
      ],
    },
    elems: [
      ...base.elems,
      {
        id: 'src_is2',
        kind: 'I',
        a: 'v2',
        b: 'v1',
        value: 10,
        sym: 'I_{s2}',
        uni: 'Iₛ₂ = 10 A',
        cur: 'I_{s2}',
        pa: [390, 70],
        pb: [290, 70],
        lab: [340, 24, 'middle'],
        side: -1,
        bubA: [436, 46, 'middle'],
        bubB: [244, 46, 'middle'],
      },
    ],
  };
})();

const CCCS: Circuit = {
  id: 'cccs',
  name: '例题 2',
  title: '进阶例题 2（含 CCCS 2iₓ）',
  numeric: true,
  nodes: ['v0', 'v1', 'v2', 'v3'],
  wires: {
    v1: [
      [
        [85, 160],
        [200, 160],
      ],
      [
        [150, 160],
        [150, 72],
        [295, 72],
      ],
    ],
    v2: [
      [
        [290, 160],
        [405, 160],
      ],
    ],
    v3: [
      [
        [495, 160],
        [585, 160],
      ],
      [
        [385, 72],
        [555, 72],
        [555, 160],
      ],
    ],
    v0: [
      [
        [85, 290],
        [585, 290],
      ],
    ],
  },
  badge: { v1: [100, 134], v2: [350, 134], v3: [618, 134], v0: [440, 318] },
  gnd: { v0: [350, 290], v1: [115, 160], v2: [315, 160], v3: [520, 160] },
  ix: { from: [217, 184], to: [273, 184], lab: [245, 206, 'middle'] },
  elems: [
    {
      id: 'src_is1',
      kind: 'I',
      a: 'v0',
      b: 'v1',
      value: 5,
      sym: 'I_s',
      uni: '5 A',
      cur: 'I_s',
      pa: [85, 290],
      pb: [85, 160],
      lab: [56, 229, 'end'],
      side: 1,
      bubA: [92, 326, 'middle'],
      bubB: [124, 262, 'start'],
    },
    {
      id: 'branch_r12',
      kind: 'R',
      a: 'v1',
      b: 'v2',
      value: 2,
      sym: 'R_{12}',
      uni: 'R₁₂ = 2 Ω',
      cur: 'i_x',
      pa: [200, 160],
      pb: [290, 160],
      lab: [245, 232, 'middle'],
      side: -1,
      bubA: [245, 120, 'middle'],
      bubB: [245, 120, 'middle'],
    },
    {
      id: 'branch_r13',
      kind: 'R',
      a: 'v1',
      b: 'v3',
      value: 4,
      sym: 'R_{13}',
      uni: 'R₁₃ = 4 Ω',
      cur: 'i_{13}',
      pa: [295, 72],
      pb: [385, 72],
      lab: [340, 52, 'middle'],
      side: 1,
      bubA: [340, 112, 'middle'],
      bubB: [340, 112, 'middle'],
    },
    {
      id: 'branch_r2g',
      kind: 'R',
      a: 'v2',
      b: 'v0',
      value: 4,
      sym: 'R_{2g}',
      uni: 'R₂g = 4 Ω',
      cur: 'i_{2g}',
      pa: [350, 160],
      pb: [350, 290],
      body: 64,
      lab: [368, 229, 'start'],
      side: -1,
      bubA: [318, 252, 'end'],
      bubB: [318, 252, 'end'],
    },
    {
      id: 'branch_r23',
      kind: 'R',
      a: 'v2',
      b: 'v3',
      value: 8,
      sym: 'R_{23}',
      uni: 'R₂₃ = 8 Ω',
      cur: 'i_{23}',
      pa: [405, 160],
      pb: [495, 160],
      lab: [450, 188, 'middle'],
      side: -1,
      bubA: [450, 120, 'middle'],
      bubB: [450, 120, 'middle'],
    },
    {
      id: 'src_dep',
      kind: 'CCCS',
      a: 'v3',
      b: 'v0',
      gain: 2,
      ctrl: 'branch_r12',
      sym: String.raw`\beta i_x`,
      uni: '2iₓ',
      cur: '2i_x',
      pa: [585, 160],
      pb: [585, 290],
      lab: [622, 229, 'start'],
      side: -1,
      bubA: [548, 272, 'end'],
      bubB: [548, 272, 'end'],
    },
  ],
};

export const CIRCUITS: Record<CircuitId, Circuit> = { generic: GENERIC, warmup: WARMUP, core: CORE, cccs: CCCS };
export const CIRCUIT_ORDER: CircuitId[] = ['generic', 'warmup', 'core', 'cccs'];

/* ------------------------------------------------------------- names */

export const NODE_ID: Record<NodeId, string> = { v0: 'node_gnd', v1: 'node_v1', v2: 'node_v2', v3: 'node_v3' };
export const NODE_UNI: Record<NodeId, string> = { v0: 'v₀', v1: 'v₁', v2: 'v₂', v3: 'v₃' };
export const NODE_TEX: Record<NodeId, string> = { v0: 'v_0', v1: 'v_1', v2: 'v_2', v3: 'v_3' };
export const NODE_COLOR: Record<NodeId, string> = { v0: '#0891b2', v1: '#dc2626', v2: '#2563eb', v3: '#7c3aed' };
export const REF_COLOR = '#16a34a';
/** "底部母线" / "节点 1" … */
export const nodeName = (n: NodeId) => (n === 'v0' ? '底部母线' : `节点 ${n.slice(1)}`);

export const incident = (c: Circuit, k: NodeId) => c.elems.filter((e) => e.a === k || e.b === k);
export const other = (e: Elem, k: NodeId): NodeId => (e.a === k ? e.b : e.a);
export const byId = (c: Circuit, id: string) => c.elems.find((e) => e.id === id);

/* ------------------------------------------------------------- nodal equations */

export interface Row {
  /** coefficient of each unknown (in `unknowns` order) */
  a: Frac[];
  rhs: Frac;
}

export interface Nodal {
  ref: NodeId;
  /** the non-reference nodes, in order: one KCL row each */
  unknowns: NodeId[];
  /** conductance form G v = i (exact) */
  G: Row[];
}

/** KCL in "sum of currents leaving = 0" form at every non-reference node, written G v = i. */
export function nodal(c: Circuit, ref: NodeId): Nodal {
  const unknowns = c.nodes.filter((n) => n !== ref);
  const col = (n: NodeId) => unknowns.indexOf(n);
  const G: Row[] = unknowns.map(() => ({ a: unknowns.map(() => ZERO), rhs: ZERO }));
  const put = (row: number, n: NodeId, x: Frac) => {
    const j = col(n);
    if (row >= 0 && j >= 0) G[row].a[j] = add(G[row].a[j], x);
  };
  for (const e of c.elems) {
    const ra = col(e.a);
    const rb = col(e.b);
    if (e.kind === 'R') {
      const g = fr(1, e.value ?? 1);
      const ng = fr(-g.n, g.d);
      put(ra, e.a, g);
      put(ra, e.b, ng);
      put(rb, e.b, g);
      put(rb, e.a, ng);
    } else if (e.kind === 'I') {
      const I = fr(e.value ?? 0);
      if (ra >= 0) G[ra].rhs = sub(G[ra].rhs, I);
      if (rb >= 0) G[rb].rhs = add(G[rb].rhs, I);
    } else {
      // dependent current gain × (v_ca − v_cb) / R_c leaves node a and enters node b
      const r = byId(c, e.ctrl!)!;
      const k = fr(e.gain ?? 1, r.value ?? 1);
      const nk = fr(-k.n, k.d);
      put(ra, r.a, k);
      put(ra, r.b, nk);
      put(rb, r.a, nk);
      put(rb, r.b, k);
    }
  }
  return { ref, unknowns, G };
}

/** an integer row (denominators cleared and reduced) and the factors used */
export interface IntRow {
  a: number[];
  rhs: number;
  times: number;
  over: number;
}

export function clearRow(r: Row): IntRow {
  const L = [...r.a, r.rhs].reduce((m, x) => lcm(m, x.d), 1);
  const ints = [...r.a, r.rhs].map((x) => (x.n * L) / x.d);
  const g = ints.reduce((m, x) => gcd(m, x), 0) || 1;
  const red = ints.map((x) => x / g);
  return { a: red.slice(0, -1), rhs: red[red.length - 1], times: L, over: g };
}

export interface ElimStep {
  /** TeX of the step */
  tex: string;
}

export interface Solution {
  /** potentials of every node relative to the reference */
  v: Record<NodeId, Frac>;
  /** integer rows as cleared (1), (2), … */
  rows: IntRow[];
  /** elimination lines (forward) */
  elim: string[];
  /** back substitution lines */
  back: string[];
  /** index of the unknown found first (the last row) */
  firstFound: NodeId;
}

const prime = (k: number) => "'".repeat(k);
const lbl = (i: number, k: number) => `(${i + 1}${prime(k)})`;

/** "3v_1 - v_2" */
export function linTex(a: number[], names: string[]): string {
  let s = '';
  a.forEach((c, j) => {
    if (c === 0) return;
    const abs = Math.abs(c);
    const coef = abs === 1 ? '' : String(abs);
    if (!s) s = `${c < 0 ? '-' : ''}${coef}${names[j]}`;
    else s += ` ${c < 0 ? '-' : '+'} ${coef}${names[j]}`;
  });
  return s || '0';
}

/** Exact solution with the elimination written out (integer-preserving, rows reduced on the way). */
export function solve(c: Circuit, ref: NodeId): Solution {
  const { unknowns, G } = nodal(c, ref);
  const names = unknowns.map((n) => NODE_TEX[n]);
  const rows = G.map(clearRow);
  const m = rows.map((r) => ({ a: [...r.a], rhs: r.rhs, k: 0, i: 0 }));
  m.forEach((r, i) => (r.i = i));
  const n = unknowns.length;
  const elim: string[] = [];
  for (let k = 0; k < n - 1; k++) {
    if (m[k].a[k] === 0) {
      const s = m.findIndex((r, i) => i > k && r.a[k] !== 0);
      if (s > 0) {
        [m[k], m[s]] = [m[s], m[k]];
        elim.push(String.raw`\text{交换 } ${lbl(m[s].i, m[s].k)} \text{ 与 } ${lbl(m[k].i, m[k].k)}`);
      }
    }
    const p = m[k].a[k];
    for (let i = k + 1; i < n; i++) {
      const q = m[i].a[k];
      if (q === 0) continue;
      const L = lcm(p, q);
      const ci = L / Math.abs(q);
      const ck = -Math.sign(q) * Math.sign(p) * (L / Math.abs(p));
      const a = m[i].a.map((x, j) => ci * x + ck * m[k].a[j]);
      const rhs = ci * m[i].rhs + ck * m[k].rhs;
      const before = `${ci === 1 ? '' : `${ci}\\cdot`}${lbl(m[i].i, m[i].k)} ${ck < 0 ? '-' : '+'} ${Math.abs(ck) === 1 ? '' : `${Math.abs(ck)}\\cdot`}${lbl(m[k].i, m[k].k)}`;
      m[i].k += 1;
      const last = k === n - 2;
      let line = `${lbl(m[i].i, m[i].k)} = ${before}:\\; ${linTex(a, names)} = ${rhs}`;
      const g = [...a, rhs].reduce((x, y) => gcd(x, y), 0) || 1;
      if (!last && g > 1) {
        const ra = a.map((x) => x / g);
        line += `\\;\\xrightarrow{\\div ${g}}\\; ${linTex(ra, names)} = ${rhs / g}`;
        m[i].a = ra;
        m[i].rhs = rhs / g;
      } else {
        m[i].a = a;
        m[i].rhs = rhs;
      }
      elim.push(line);
    }
  }
  // back substitution
  const x: Frac[] = unknowns.map(() => ZERO);
  const back: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const r = m[i];
    let known = ZERO;
    let subst = '';
    r.a.forEach((cf, j) => {
      if (j <= i || cf === 0) return;
      known = add(known, mul(fr(cf), x[j]));
      const abs = Math.abs(cf);
      const xv = fmtFrac(x[j]);
      subst += ` ${cf < 0 ? '-' : '+'} ${abs === 1 ? (x[j].n < 0 ? `(${xv})` : xv) : `${abs}(${xv})`}`;
    });
    x[i] = div(sub(fr(r.rhs), known), fr(r.a[i]));
    const head = `${r.a[i] === 1 ? '' : r.a[i] === -1 ? '-' : r.a[i]}${names[i]}`;
    const res = `${names[i]} = ${fmtFrac(x[i])}\\,\\text{V}`;
    if (i === n - 1) back.push(`${head} = ${r.rhs} \\implies ${res}`);
    else back.push(String.raw`\text{代回 } ${lbl(r.i, r.k)}:\; ${head}${subst} = ${r.rhs} \implies ${res}`);
  }
  const v = { v0: ZERO, v1: ZERO, v2: ZERO, v3: ZERO } as Record<NodeId, Frac>;
  unknowns.forEach((u, j) => (v[u] = x[j]));
  return { v, rows, elim, back, firstFound: unknowns[n - 1] };
}

/** current through an element in its a → b direction */
export function current(c: Circuit, s: Solution, e: Elem): Frac {
  if (e.kind === 'R') return div(sub(s.v[e.a], s.v[e.b]), fr(e.value ?? 1));
  if (e.kind === 'I') return fr(e.value ?? 0);
  const r = byId(c, e.ctrl!)!;
  return mul(fr(e.gain ?? 1), current(c, s, r));
}

/** KCL check of a node: total current in and out (true directions) */
export function kclCheck(c: Circuit, s: Solution, k: NodeId): { into: Frac; out: Frac } {
  let into = ZERO;
  let out = ZERO;
  for (const e of incident(c, k)) {
    const i = current(c, s, e);
    const leaving = e.a === k ? i : fr(-i.n, i.d);
    if (leaving.n > 0) out = add(out, leaving);
    else into = sub(into, leaving);
  }
  return { into, out };
}

/* ------------------------------------------------------------- TeX of the KCL equations */

const paren = (x: Frac) => (x.n < 0 ? `(${fmtFrac(x)})` : fmtFrac(x));

/** the "统一流出法" equation of node k: resistor currents leaving = independent sources entering − leaving */
export function kclTex(c: Circuit, k: NodeId, ref: NodeId, symbolic: boolean): string {
  const lhs: string[] = [];
  const rhs: string[] = [];
  for (const e of incident(c, k)) {
    const j = other(e, k);
    if (e.kind === 'R') {
      const R = symbolic || e.value === undefined ? e.sym : String(e.value);
      lhs.push(j === ref ? `\\dfrac{${NODE_TEX[k]}}{${R}}` : `\\dfrac{${NODE_TEX[k]} - ${NODE_TEX[j]}}{${R}}`);
    } else if (e.kind === 'I') {
      const I = symbolic || e.value === undefined ? e.sym : String(e.value);
      rhs.push(`${e.b === k ? '+' : '-'} ${I}`);
    } else {
      const I = symbolic ? e.sym : `${e.gain}i_x`;
      lhs.push(`${e.a === k ? '+' : '-'} ${I}`);
    }
  }
  const l = lhs.map((t, i) => (i === 0 ? t.replace(/^([+-]) /, (_m, s: string) => (s === '-' ? '-' : '')) : /^[+-] /.test(t) ? t : `+ ${t}`)).join(' ');
  const r = rhs.join(' ').replace(/^([+-]) /, (_m, s: string) => (s === '-' ? '-' : '')) || '0';
  return `${l} = ${r}`;
}

/** the control-variable constraint of the CCCS circuit (or null) */
export function ctrlTex(c: Circuit, ref: NodeId, symbolic: boolean): string | null {
  const dep = c.elems.find((e) => e.kind === 'CCCS');
  if (!dep) return null;
  const r = byId(c, dep.ctrl!)!;
  const R = symbolic ? r.sym : String(r.value);
  const num = r.b === ref ? NODE_TEX[r.a] : r.a === ref ? `-${NODE_TEX[r.b]}` : `${NODE_TEX[r.a]} - ${NODE_TEX[r.b]}`;
  return `i_x = \\dfrac{${num}}{${R}}`;
}

/** G v = i as a TeX matrix equation (exact fractions) */
export function matrixTex(n: Nodal): string {
  const cell = (x: Frac) => (x.d === 1 ? String(x.n) : `${x.n < 0 ? '-' : ''}\\tfrac{${Math.abs(x.n)}}{${x.d}}`);
  const G = n.G.map((r) => r.a.map(cell).join(' & ')).join(' \\\\[4pt] ');
  const v = n.unknowns.map((u) => NODE_TEX[u]).join(' \\\\[4pt] ');
  const i = n.G.map((r) => cell(r.rhs)).join(' \\\\[4pt] ');
  return `\\begin{bmatrix} ${G} \\end{bmatrix} \\begin{bmatrix} ${v} \\end{bmatrix} = \\begin{bmatrix} ${i} \\end{bmatrix}`;
}

/** is G symmetric? */
export function symmetric(n: Nodal): boolean {
  return n.G.every((r, i) => r.a.every((x, j) => x.n === n.G[j].a[i].n && x.d === n.G[j].a[i].d));
}

/** a cleared row as TeX, with its factors: "(1)\; \times 4:\; 3v_1 - v_2 = 60" */
export function rowTex(r: IntRow, i: number, names: string[]): string {
  const f = `\\times ${r.times}${r.over > 1 ? ` \\div ${r.over}` : ''}`;
  return `(${i + 1})\\;\\; ${f}:\\quad ${linTex(r.a, names)} = ${r.rhs}`;
}

/** branch current TeX for the back-substitution board */
export function currentTex(c: Circuit, s: Solution, e: Elem): string {
  const i = current(c, s, e);
  const A = `${fmtFrac(i)}\\,\\text{A}`;
  if (e.kind === 'R') return `${e.cur} = \\dfrac{${paren(s.v[e.a])} - ${paren(s.v[e.b])}}{${e.value}} = ${A}`;
  if (e.kind === 'CCCS') return `${e.cur} = ${e.gain} \\times ${fmtFrac(current(c, s, byId(c, e.ctrl!)!))} = ${A}`;
  return `${e.cur} = ${A}`;
}
