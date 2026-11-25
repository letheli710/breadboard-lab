// W1-L6's circuit model, shared by both stage layers: one loop D → A → B → C → D (clockwise),
// V1 on the left branch (D–A), R1 on top (A–B), V2 on the right branch (B–C), R2 at the bottom
// (C–D). Each element carries a polarity marking (which end is "+"); the sources' marking is
// physical (flipping one reverses the source), the resistors' marking is only the label of v1 / v2.
// Everything follows from KVL + Ohm's law, so the potential profile always closes: the sum of the
// signed terms around the loop is zero for any values and markings.

export type ElemId = 'v1' | 'r1' | 'v2' | 'r2';
export type NodeId = 'D' | 'A' | 'B' | 'C';
export type Dir = 'cw' | 'ccw';

/** The elements in clockwise order, each from its clockwise start node to its end node. */
export const ELEMS: { id: ElemId; from: NodeId; to: NodeId; source: boolean; sym: string; name: string }[] = [
  { id: 'v1', from: 'D', to: 'A', source: true, sym: 'V_1', name: 'V₁' },
  { id: 'r1', from: 'A', to: 'B', source: false, sym: 'v_1', name: 'R₁' },
  { id: 'v2', from: 'B', to: 'C', source: true, sym: 'V_2', name: 'V₂' },
  { id: 'r2', from: 'C', to: 'D', source: false, sym: 'v_2', name: 'R₂' },
];

/** The lesson's circuit (act 5): V1 = 20 V (+ up), R1 = 2 Ω (v1: left +), V2 = 5 V (+ up), R2 = 3 Ω (v2: left +). */
export const DEFAULT_PLUS_AT_END: Record<ElemId, boolean> = { v1: true, r1: false, v2: false, r2: true };

export interface Circuit {
  V1: number;
  V2: number;
  R1: number;
  R2: number;
  /** marking flipped relative to DEFAULT_PLUS_AT_END */
  flip: Record<ElemId, boolean>;
}

export interface Solved {
  /** clockwise loop current, A */
  i: number;
  /** "+" end is the element's clockwise end node */
  plusAtEnd: Record<ElemId, boolean>;
  /** labelled voltage V(+) − V(−) of each element (sources: their value; resistors: ±iR) */
  v: Record<ElemId, number>;
  /** potential change crossing each element clockwise, V(to) − V(from) */
  rise: Record<ElemId, number>;
  /** node potentials with D = 0 */
  pot: Record<NodeId, number>;
  /** potential back at D after the full clockwise walk (0 up to rounding) */
  closeAt: number;
}

export function solve(c: Circuit): Solved {
  const plusAtEnd = Object.fromEntries(ELEMS.map((e) => [e.id, DEFAULT_PLUS_AT_END[e.id] !== c.flip[e.id]])) as Record<ElemId, boolean>;
  // source rise going clockwise: + at the clockwise end → +V
  const srcRise = (id: 'v1' | 'v2', V: number) => (plusAtEnd[id] ? V : -V);
  const i = (srcRise('v1', c.V1) + srcRise('v2', c.V2)) / (c.R1 + c.R2);
  const rise: Record<ElemId, number> = { v1: srcRise('v1', c.V1), r1: -i * c.R1, v2: srcRise('v2', c.V2), r2: -i * c.R2 };
  const pot = { D: 0, A: 0, B: 0, C: 0 } as Record<NodeId, number>;
  pot.A = pot.D + rise.v1;
  pot.B = pot.A + rise.r1;
  pot.C = pot.B + rise.v2;
  const closeAt = pot.C + rise.r2;
  // labelled voltage: V(+) − V(−) = ± (V(to) − V(from))
  const v = Object.fromEntries(ELEMS.map((e) => [e.id, plusAtEnd[e.id] ? rise[e.id] : -rise[e.id]])) as Record<ElemId, number>;
  return { i, plusAtEnd, v, rise, pot, closeAt };
}

export interface Term {
  elem: ElemId;
  /** sign of the term = the sign met first walking in the chosen direction */
  sign: 1 | -1;
  sym: string;
  /** sign × labelled voltage: the term's value */
  value: number;
}

/** The KVL terms in walking order, starting at D. Their values always sum to 0. */
export function kvlTerms(c: Circuit, dir: Dir): Term[] {
  const s = solve(c);
  const order = dir === 'cw' ? ELEMS : [...ELEMS].reverse();
  return order.map((e) => {
    // walking clockwise the first terminal met is `from`; it is "+" when the + is not at `to`
    const firstIsPlus = dir === 'cw' ? !s.plusAtEnd[e.id] : s.plusAtEnd[e.id];
    const sign = firstIsPlus ? 1 : -1;
    return { elem: e.id, sign, sym: e.sym, value: sign * s.v[e.id] };
  });
}

/** Nodes visited walking clockwise from D (step k = the probe is at PATH[k]). */
export const PATH: NodeId[] = ['D', 'A', 'B', 'C', 'D'];

/** Round for display; tiny float noise prints as 0. */
export function fmt(x: number, digits = 1): string {
  const r = Math.abs(x) < 1e-9 ? 0 : x;
  const s = Number(r.toFixed(digits)).toString();
  return s === '-0' ? '0' : s;
}

/** A signed number for display: "+6", "−9" (true minus sign). */
export function signed(x: number, digits = 1): string {
  const s = fmt(x, digits);
  return s.startsWith('-') ? `−${s.slice(1)}` : `+${s}`;
}

/** A number as a TeX term: "6", "(-9)" when negative. */
export function texNum(x: number, digits = 2): string {
  const s = fmt(x, digits);
  return s.startsWith('-') ? `(${s})` : s;
}

/** Series stack of act 3 (V1 = 12 V, V2 = 5 V up, V3 = 3 V reversed): V_ab = Σ ±Vk. */
export const SERIES = [12, 5, 3];
export const SERIES_DEFAULT_UP = [true, true, false];
export const seriesVab = (up: boolean[]) => SERIES.reduce((s, V, k) => s + (up[k] ? V : -V), 0);
