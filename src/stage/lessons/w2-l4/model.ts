// W2-L4 numbers and geometry: the matrices of the lesson's circuits (written by inspection from
// their element values, so the tests can check them against the sheet), a small linear solver
// (Cramer's rule, as the lesson teaches it) and straight-line edge crossings for the planarity
// demo (K3,3 and the Wheatstone bridge).

export type Matrix = number[][];

/** determinant by cofactor expansion along the first row (small matrices only) */
export function det(m: Matrix): number {
  const n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  let s = 0;
  for (let j = 0; j < n; j++) {
    const minor = m.slice(1).map((r) => r.filter((_, k) => k !== j));
    s += (j % 2 ? -1 : 1) * m[0][j] * det(minor);
  }
  return s;
}

/** the matrix with column j replaced by b */
export function withColumn(m: Matrix, j: number, b: number[]): Matrix {
  return m.map((r, i) => r.map((x, k) => (k === j ? b[i] : x)));
}

/** Cramer's rule: Δ, the Δ_k and the solution */
export function cramer(m: Matrix, b: number[]): { d: number; dk: number[]; x: number[] } {
  const d = det(m);
  const dk = m.map((_, j) => det(withColumn(m, j, b)));
  return { d, dk, x: dk.map((v) => v / d) };
}

export function isSymmetric(m: Matrix): boolean {
  return m.every((r, i) => r.every((x, j) => Math.abs(x - m[j][i]) < 1e-12));
}

/** short number text: 2, −0.5, 6.25 (true minus sign) */
export function fmt(x: number, digits = 4): string {
  const r = Math.round(x * 10 ** digits) / 10 ** digits;
  const s = String(Object.is(r, -0) ? 0 : r);
  return s.replace('-', '−');
}

/* ------------------------------------------------------------- act 3: 3-node nodal example (图 3-1) */

/** element values of 图 3-1 (Ω, A; a source's current is + into its node) */
export const NODAL_EX = { r10: 2, r12: 1, r20: 1, r23: 1, r30: 2, r13: 2, i1: 12, i2: 4, i3: -3 };

/** G and i of a 3-node circuit written by inspection */
export function nodalByInspection(c: typeof NODAL_EX): { G: Matrix; i: number[] } {
  const g = (r: number) => 1 / r;
  const G = [
    [g(c.r10) + g(c.r12) + g(c.r13), -g(c.r12), -g(c.r13)],
    [-g(c.r12), g(c.r20) + g(c.r12) + g(c.r23), -g(c.r23)],
    [-g(c.r13), -g(c.r23), g(c.r30) + g(c.r23) + g(c.r13)],
  ];
  return { G, i: [c.i1, c.i2, c.i3] };
}

/* ------------------------------------------------------------- act 6: 3-mesh example (图 6-1) */

/** element values of 图 6-1 (Ω, V; a source's value is its clockwise rise in its mesh) */
export const MESH_EX = { r1: 2, r12: 4, r2: 3, r13: 2, r23: 1, r3: 3, v1: 18, v2: -3, v3: 8 };

/** R and v of a 3-mesh circuit written by inspection (all mesh currents clockwise) */
export function meshByInspection(c: typeof MESH_EX): { R: Matrix; v: number[] } {
  const R = [
    [c.r1 + c.r12 + c.r13, -c.r12, -c.r13],
    [-c.r12, c.r2 + c.r12 + c.r23, -c.r23],
    [-c.r13, -c.r23, c.r3 + c.r13 + c.r23],
  ];
  return { R, v: [c.v1, c.v2, c.v3] };
}

/* ------------------------------------------------------------- act 4: the same circuit two ways (图 4-1) */

/** 图 4-1: R1 4 Ω (1–0), R2 2 Ω (1–2), R3 6 Ω (2–0); 4 A into 1, 4 A into 2, 2 A from 2 to 1 */
export const CMP = { r1: 4, r2: 2, r3: 6, is1: 4, is2: 4, is3: 2 };

export function compareNodal(c: typeof CMP): { G: Matrix; i: number[]; v: number[] } {
  const G = [
    [1 / c.r1 + 1 / c.r2, -1 / c.r2],
    [-1 / c.r2, 1 / c.r2 + 1 / c.r3],
  ];
  const i = [c.is1 + c.is3, c.is2 - c.is3];
  return { G, i, v: cramer(G, i).x };
}

/** mesh route of 图 4-1: supermesh 1-2 (i2 − i1 = Is1), i3 = −Is3, i4 = −Is2, KVL around the supermesh */
export function compareMesh(c: typeof CMP): { i: number[]; v: number[] } {
  const i3 = -c.is3;
  const i4 = -c.is2;
  // r1 (i2 − is1) + r2 (i2 − i3) + r3 (i2 − i4) = 0
  const i2 = (c.r1 * c.is1 + c.r2 * i3 + c.r3 * i4) / (c.r1 + c.r2 + c.r3);
  const i1 = i2 - c.is1;
  return { i: [i1, i2, i3, i4], v: [c.r1 * -i1, c.r3 * (i2 - i4)] };
}

/* ------------------------------------------------------------- planarity demo */

export type Pt = [number, number];

const orient = (a: Pt, b: Pt, c: Pt) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));

/** where two straight edges cross properly (no shared end), or null */
export function crossing(p: Pt, q: Pt, r: Pt, s: Pt): Pt | null {
  if (orient(p, q, r) * orient(p, q, s) >= 0 || orient(r, s, p) * orient(r, s, q) >= 0) return null;
  const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
  const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
  return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])];
}

/** every crossing of a straight-line drawing (edges are index pairs into pos) */
export function crossings(pos: Pt[], edges: [number, number][]): { at: Pt; edges: [number, number] }[] {
  const out: { at: Pt; edges: [number, number] }[] = [];
  for (let i = 0; i < edges.length; i++)
    for (let j = i + 1; j < edges.length; j++) {
      const [a, b] = edges[i];
      const [c, d] = edges[j];
      if (a === c || a === d || b === c || b === d) continue;
      const x = crossing(pos[a], pos[b], pos[c], pos[d]);
      if (x) out.push({ at: x, edges: [i, j] });
    }
  return out;
}

/** K3,3: top A B C (0–2), bottom D E F (3–5), every top node joined to every bottom node */
export const K33_EDGES: [number, number][] = [0, 1, 2].flatMap((a) => [3, 4, 5].map((b) => [a, b] as [number, number]));
/** Wheatstone bridge as a graph: 4 nodes (top, left, right, bottom), 6 branches (5 resistors + source) = K4 */
export const BRIDGE_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [1, 2],
  [0, 3],
];

/** layouts the "try to redraw" animation walks through (graph box 360 × 260) */
export const K33_LAYOUTS: Pt[][] = [
  // the sheet's drawing: two rows of three
  [
    [60, 50],
    [180, 50],
    [300, 50],
    [60, 210],
    [180, 210],
    [300, 210],
  ],
  // pulled into a hexagon (A D B E C F around): the three long diagonals still meet
  [
    [180, 30],
    [276, 185],
    [84, 185],
    [276, 75],
    [180, 230],
    [84, 75],
  ],
  // nodes pulled about until only one crossing is left: the best any drawing of K3,3 can do
  [
    [110, 150],
    [300, 30],
    [90, 220],
    [250, 120],
    [40, 120],
    [300, 210],
  ],
];

export const BRIDGE_LAYOUTS: Pt[][] = [
  // the textbook square with the source drawn across the diagonal: one (fake) crossing
  [
    [180, 30],
    [70, 130],
    [290, 130],
    [180, 230],
  ],
  // the bottom node pulled inside the triangle of the other three: no crossing at all
  [
    [180, 30],
    [60, 210],
    [300, 210],
    [180, 150],
  ],
];
