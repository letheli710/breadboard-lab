// W2-L3 circuits: the four two-mesh circuits of the lesson sheet (act 2 standard, act 3 Case 1
// edge source, act 4 Case 2 supermesh, act 5 guided example), all on one topology:
//
//   (L,T) ── topL ── a (M,T) ── topR ── (R,T)
//     │                │                  │
//   left              mid               right        mesh 1 = left window, mesh 2 = right window,
//     │                │                  │          both clockwise
//   (L,B) ──────────── b (M,B) ────────── (R,B)      b is the reference node (0 V)
//
// Voltage sources are drawn + on top; a current source points up or down. `solve` does mesh
// analysis the way the sheet teaches it: plain KVL per mesh, an edge current source locks its
// mesh current, a shared one makes a supermesh (outer-loop KVL + the KCL constraint).

export type ElKind = 'R' | 'V' | 'I';

export interface El {
  /** stage id of the element (lit by hover-map ids, see index.ts) */
  id: string;
  kind: ElKind;
  /** label as drawn, e.g. "R₂" */
  name: string;
  /** TeX symbol, e.g. "R_2" */
  sym: string;
  value: number;
  /** current source arrow */
  dir?: 'up' | 'down';
  /** a resistor in series with a current source (its value is the layer's slider) */
  series?: boolean;
}

export type CaseId = 'std' | 'c1' | 'c2' | 'ex';

export interface Circuit {
  id: CaseId;
  /** vertical branches, listed top to bottom */
  left: El[];
  mid: El[];
  right: El[];
  topL: El;
  topR: El;
}

const R = (id: string, n: string, value: number, series = false): El => ({ id, kind: 'R', name: `R${n}`, sym: `R_${subTex(n)}`, value, series });
const V = (id: string, n: string, value: number): El => ({ id, kind: 'V', name: `V${n}`, sym: `V_${subTex(n)}`, value });
const I = (value: number, dir: 'up' | 'down'): El => ({ id: 'is', kind: 'I', name: 'Is', sym: 'I_s', value, dir });

function subTex(n: string): string {
  const map: Record<string, string> = { '₁': '1', '₂': '2', '₃': '3', s: 's' };
  return map[n] ?? n;
}

/** The sheet's four circuits (values as given). The series resistor's value can be overridden. */
export function circuit(id: CaseId, series?: number): Circuit {
  switch (id) {
    case 'std': // act 2, fig. 2-1
      return { id, left: [V('v1', '₁', 20)], topL: R('r1', '₁', 5), mid: [R('r2', '₂', 10)], topR: R('r3', '₃', 5), right: [V('v2', '₂', 5)] };
    case 'c1': // act 3, fig. 3-1: Is = 3 A up on the right edge, R3 = 6 Ω in series with it
      return { id, left: [V('v1', '₁', 24)], topL: R('r1', '₁', 2), mid: [R('r2', '₂', 4)], topR: R('r3', '₃', series ?? 6, true), right: [I(3, 'up')] };
    case 'c2': // act 4, fig. 4-1: Is = 6 A up in the shared branch, Rs = 2 Ω above it
      return { id, left: [V('v1', '₁', 20)], topL: R('r1', '₁', 6), mid: [R('rs', 's', series ?? 2, true), I(6, 'up')], topR: R('r2', '₂', 10), right: [R('r3', '₃', 4)] };
    case 'ex': // act 5, fig. 5-1: Is = 3 A down in the shared branch, Rs = 5 Ω above it
      return {
        id,
        left: [V('v1', '₁', 30)],
        topL: R('r1', '₁', 4),
        mid: [R('rs', 's', series ?? 5, true), I(3, 'down')],
        topR: R('r2', '₂', 2),
        right: [R('r3', '₃', 6), V('v2', '₂', 6)],
      };
  }
}

/** default value of each circuit's series resistor (null: none) */
export const SERIES_DEFAULT: Record<CaseId, number | null> = { std: null, c1: 6, c2: 2, ex: 5 };

const sumR = (els: El[]) => els.reduce((s, e) => s + (e.kind === 'R' ? e.value : 0), 0);
const sumV = (els: El[]) => els.reduce((s, e) => s + (e.kind === 'V' ? e.value : 0), 0);
const src = (els: El[]) => els.find((e) => e.kind === 'I');

/** One row of the 2×2 system a·[i1, i2] = b. */
export interface Row {
  kind: 'kvl1' | 'kvl2' | 'super' | 'kcl' | 'lock1' | 'lock2';
  a: [number, number];
  b: number;
}

export interface Solution {
  rows: [Row, Row];
  i1: number;
  i2: number;
  /** downward current in the shared (middle) branch, i1 − i2 */
  iMid: number;
  /** potential of the top middle node a (b = 0 V) */
  va: number;
  /** current source: voltage top − bottom (上正下负), current through it and through its series resistor */
  vIs: number | null;
  /** power in the resistor in series with the current source */
  pSeries: number | null;
  /** KVL sums of drops around mesh 1 and mesh 2 (null where the mesh holds a current source) */
  kvl: [number | null, number | null];
}

/** Mesh analysis of the circuit (mesh currents clockwise). */
export function solve(c: Circuit): Solution {
  const Rl = sumR(c.left);
  const Rm = sumR(c.mid);
  const Rr = sumR(c.right);
  const Rtl = c.topL.kind === 'R' ? c.topL.value : 0;
  const Rtr = c.topR.kind === 'R' ? c.topR.value : 0;
  // KVL right-hand sides: rises met going clockwise (+ on top: up the left branch is a rise,
  // down the right branch a fall; the middle branch is met going down in mesh 1, up in mesh 2)
  const Vl = sumV(c.left);
  const Vm = sumV(c.mid);
  const Vr = sumV(c.right);
  const sl = src(c.left);
  const sm = src(c.mid);
  const sr = src(c.right);
  const kvl1: Row = { kind: 'kvl1', a: [Rl + Rtl + Rm, -Rm], b: Vl - Vm };
  const kvl2: Row = { kind: 'kvl2', a: [-Rm, Rm + Rtr + Rr], b: Vm - Vr };
  let rows: [Row, Row];
  if (sm) {
    // supermesh: outer loop KVL (the shared branch, series resistor included, is skipped) + KCL
    const sup: Row = { kind: 'super', a: [Rl + Rtl, Rtr + Rr], b: Vl - Vr };
    const kcl: Row = sm.dir === 'down' ? { kind: 'kcl', a: [1, -1], b: sm.value } : { kind: 'kcl', a: [-1, 1], b: sm.value };
    rows = [sup, kcl];
  } else {
    const r1: Row = sl ? { kind: 'lock1', a: [1, 0], b: sl.dir === 'up' ? sl.value : -sl.value } : kvl1;
    const r2: Row = sr ? { kind: 'lock2', a: [0, 1], b: sr.dir === 'down' ? sr.value : -sr.value } : kvl2;
    rows = [r1, r2];
  }
  const [p, q] = rows;
  const det = p.a[0] * q.a[1] - p.a[1] * q.a[0];
  const i1 = (p.b * q.a[1] - p.a[1] * q.b) / det;
  const i2 = (p.a[0] * q.b - p.b * q.a[0]) / det;
  const iMid = i1 - i2;
  // potentials: up the left branch from b (current i1 upward), then along topL (i1 to the right)
  let v = 0;
  for (const e of [...c.left].reverse()) v += e.kind === 'V' ? e.value : e.kind === 'R' ? -e.value * i1 : 0;
  const va = v - Rtl * i1;
  // a current source's terminal voltage (top − bottom) and its series resistor's power
  let vIs: number | null = null;
  let pSeries: number | null = null;
  const branchSource = (els: El[], vTop: number, iDown: number) => {
    const k = els.findIndex((e) => e.kind === 'I');
    let top = vTop;
    for (const e of els.slice(0, k)) top -= e.kind === 'V' ? e.value : e.value * iDown;
    let bottom = 0;
    for (const e of els.slice(k + 1).reverse()) bottom += e.kind === 'V' ? e.value : e.value * iDown;
    return top - bottom;
  };
  const series = [c.topL, c.topR, ...c.left, ...c.mid, ...c.right].find((e) => e.series);
  if (sm) vIs = branchSource(c.mid, va, iMid);
  if (sr) vIs = branchSource(c.right, va - Rtr * i2, i2);
  if (sl || sm || sr) pSeries = series ? (sm ?? sr ?? sl)!.value ** 2 * series.value : 0;
  const kvl: [number | null, number | null] = [sl || sm ? null : -Vl + (Rl + Rtl) * i1 + Rm * (i1 - i2) + Vm, sr || sm ? null : -Vm + Rm * (i2 - i1) + (Rtr + Rr) * i2 + Vr];
  return { rows, i1, i2, iMid, va, vIs, pSeries, kvl };
}

/** A number for display: at most 2 decimals, no trailing zeros, "−" for minus, −0 → 0. */
export function fmt(x: number, digits = 2): string {
  const r = Math.round(x * 10 ** digits) / 10 ** digits;
  const s = (Object.is(r, -0) ? 0 : r).toFixed(digits).replace(/\.?0+$/, '');
  return s.replace('-', '−');
}

/** A number for TeX: like fmt, with a TeX minus. */
export const texNum = (x: number, digits = 2) => fmt(x, digits).replace('−', '-');
