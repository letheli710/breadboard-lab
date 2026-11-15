// Layout of a breadboard figure in a lesson card (CardFigure.tsx, CHALLENGE_FORMAT.md §16.3):
// where every hole sits, and where every piece of text goes.
//
// Text placement (prototypes/figure-labels.html, option D with C as the fallback):
//   1. On the board: each label is a small tag placed by scoring every candidate spot. Covering a
//      shaded strip of another label, a part, a ✗ mark or another tag is not allowed; its own strip
//      may be touched only at its empty rounded end. Covering a rail hole costs 5, an empty hole 1,
//      a column number 0.5, and every pixel away from the target 0.05. The cheapest spot wins.
//   2. Off the board: a label whose best spot still costs too much (or that has none) goes above
//      the board (targets in the top half) or below it, with a thin leader that runs in the gaps
//      between the columns of holes and turns into the target at the end.
// Holes under a tag are drawn faded; column numbers under a tag are left out.

import { HOLE_MAP, MAIN_ROWS, RAIL_ROWS, type RowId } from './breadboard';
import type { BoardPart, BreadboardFigure } from './figures';

export const PITCH = 22;
export const HOLE_PX = 7;
/** tag height and font size of on-board labels (px, viewBox units) */
export const TAG_H = 17;
export const LABEL_PX = 12.5;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type Pt = [number, number];

export const hitRect = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export const padRect = (r: Rect, p: number): Rect => ({ x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p });
/** the point of `r` nearest to (x, y) */
export const nearestOn = (x: number, y: number, r: Rect): Pt => [Math.max(r.x, Math.min(x, r.x + r.w)), Math.max(r.y, Math.min(y, r.y + r.h))];
const union = (rs: Rect[]): Rect => {
  const x0 = Math.min(...rs.map((r) => r.x));
  const y0 = Math.min(...rs.map((r) => r.y));
  return { x: x0, y: y0, w: Math.max(...rs.map((r) => r.x + r.w)) - x0, h: Math.max(...rs.map((r) => r.y + r.h)) - y0 };
};

/** rough width of a label (CJK ≈ 1 em, narrow punctuation 0.3 em, others ≈ 0.62 em) */
export const textWidth = (t: string, size = LABEL_PX) => [...t].reduce((w, ch) => w + (/[⺀-鿿＀-￯]/.test(ch) ? size : /[ .,:;!|]/.test(ch) ? size * 0.3 : size * 0.62), 0);

const isRail = (r: RowId) => (RAIL_ROWS as readonly string[]).includes(r);
const TOP_HALF: readonly string[] = ['a', 'b', 'c', 'd', 'e'];

export interface BoardGeom {
  c0: number;
  c1: number;
  /** y of every row shown */
  Y: Map<RowId, number>;
  rows: RowId[];
  /** y of the centre trench (both halves shown) */
  gapY: number | null;
  /** first main row shown (its column numbers sit above it) */
  firstMain: RowId | undefined;
  left: number;
  right: number;
  bottom: number;
  frame: Rect;
  X: (c: number) => number;
  pos: (id: string) => Pt | null;
  holeRect: (id: string) => Rect | null;
  /** the shaded connected group of a hole (a5 → a5–e5, tp3 → the tp rail) */
  stripRect: (id: string) => Rect | null;
  /** the holes of that group only (without its rounded empty ends) */
  stripCore: (id: string) => Rect | null;
  /** column numbers drawn above the first main row */
  colNums: number[];
  colNumRect: (c: number) => Rect;
}

export function boardGeom(fig: BreadboardFigure): BoardGeom {
  const [c0, c1] = fig.cols ?? [1, 12];
  const rowsShown = fig.rows ?? 'both';
  const railsShown = fig.rails ?? (rowsShown === 'top' ? 'top' : rowsShown === 'bottom' ? 'bottom' : 'both');
  const Y = new Map<RowId, number>();
  let y = 30;
  const take = (r: RowId, gap = 18) => {
    Y.set(r, y);
    y += gap;
  };
  if (railsShown === 'top' || railsShown === 'both') {
    take('tp');
    take('tn', 28);
  }
  if (rowsShown !== 'bottom') {
    for (const r of ['a', 'b', 'c', 'd'] as RowId[]) take(r);
    take('e', 30);
  }
  const gapY = rowsShown === 'both' ? y - 15 : null;
  if (rowsShown !== 'top') {
    for (const r of ['f', 'g', 'h', 'i'] as RowId[]) take(r);
    take('j', 28);
  }
  if (railsShown === 'bottom' || railsShown === 'both') {
    take('bp');
    take('bn');
  }
  const left = (fig.parts ?? []).some((p) => p.type === 'battery') ? 92 : 34;
  const X = (c: number) => left + (c - c0) * PITCH;
  const right = X(c1) + 16;
  const bottom = y + 6;
  const rows = [...RAIL_ROWS, ...MAIN_ROWS].filter((r) => Y.has(r)) as RowId[];
  const order = ['tp', 'tn', ...MAIN_ROWS, 'bp', 'bn'] as RowId[];
  rows.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const firstMain = (['a', 'f'] as RowId[]).find((r) => Y.has(r));
  const pos = (id: string): Pt | null => {
    const h = HOLE_MAP.get(id);
    if (!h || h.col < c0 || h.col > c1) return null;
    const yy = Y.get(h.row);
    return yy === undefined ? null : [X(h.col), yy];
  };
  const holeRect = (id: string): Rect | null => {
    const p = pos(id);
    return p ? { x: p[0] - HOLE_PX / 2, y: p[1] - HOLE_PX / 2, w: HOLE_PX, h: HOLE_PX } : null;
  };
  const stripRect = (id: string): Rect | null => {
    const h = HOLE_MAP.get(id);
    if (!h) return null;
    if (isRail(h.row)) {
      const yy = Y.get(h.row);
      return yy === undefined ? null : { x: X(c0) - 10, y: yy - 9, w: X(c1) - X(c0) + 20, h: 18 };
    }
    if (h.col < c0 || h.col > c1) return null;
    const half = TOP_HALF.includes(h.row) ? ['a', 'b', 'c', 'd', 'e'] : ['f', 'g', 'h', 'i', 'j'];
    const ys = half.map((r) => Y.get(r as RowId)).filter((v): v is number => v !== undefined);
    if (!ys.length) return null;
    const y0 = Math.min(...ys);
    const y1 = Math.max(...ys);
    return { x: X(h.col) - 9, y: y0 - 9, w: 18, h: y1 - y0 + 18 };
  };
  const stripCore = (id: string): Rect | null => {
    const r = stripRect(id);
    return r ? padRect(r, -(9 - HOLE_PX / 2)) : null;
  };
  const colNums: number[] = [];
  if (firstMain) for (let c = c0; c <= c1; c++) if (c === c0 || c === c1 || c % 5 === 0) colNums.push(c);
  const colNumRect = (c: number): Rect => ({ x: X(c) - 7, y: (firstMain ? Y.get(firstMain)! : 30) - 21, w: 14, h: 12 });
  return {
    c0,
    c1,
    Y,
    rows,
    gapY,
    firstMain,
    left,
    right,
    bottom,
    frame: { x: left - 30, y: 4, w: right - left + 38, h: bottom - 8 },
    X,
    pos,
    holeRect,
    stripRect,
    stripCore,
    colNums,
    colNumRect,
  };
}

/** Where a part is drawn (its leads, body and end dots), to keep labels off it. */
export function partRect(g: BoardGeom, p: BoardPart): Rect | null {
  const a = g.pos(p.from);
  if (!a) return null;
  if (p.type === 'probe') return { x: a[0] - 3, y: a[1] - 40, w: 38, h: 43 };
  const b = p.to ? g.pos(p.to) : null;
  if (!b) return null;
  const box = union([padRect({ x: a[0], y: a[1], w: 0, h: 0 }, 3.5), padRect({ x: b[0], y: b[1], w: 0, h: 0 }, 3.5)]);
  const horiz = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]);
  if (p.type === 'button') return padRect(box, 6);
  if (p.type === 'resistor') return horiz ? union([box, { x: box.x, y: a[1] - 6, w: box.w, h: 12 }]) : union([box, { x: a[0] - 6, y: box.y, w: 12, h: box.h }]);
  if (p.type === 'wire') {
    const bow = Math.min(22, 6 + Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.18);
    return horiz ? union([box, { x: box.x, y: (a[1] + b[1]) / 2 - bow / 2 - 3, w: box.w, h: 1 }]) : union([box, { x: (a[0] + b[0]) / 2 + bow / 2 + 3, y: box.y, w: 1, h: box.h }]);
  }
  if (p.type === 'led') {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dome = horiz ? { x: mx - 10, y: Math.min(a[1], b[1]) - 30, w: 20, h: 20 } : { x: Math.max(a[0], b[0]) + 10, y: my - 10, w: 20, h: 20 };
    return union([box, dome]);
  }
  // battery: a box left of the board with its two leads
  return union([box, { x: g.left - 80, y: Math.min(a[1], b[1]) - 4, w: 34, h: Math.max(36, Math.abs(b[1] - a[1]) + 8) }]);
}

export interface LabelSpec {
  key: string;
  text: string;
  /** what the label points at (strip, hole or part), and the parts of it the tag must not cover */
  targets: Rect[];
  cores: Rect[];
  /** placed above the board when it has to leave it (else below) */
  top: boolean;
  /** x of the gap between columns a leader runs down to reach each target */
  gutters: number[];
  /** a hint: prefer this side of the target */
  side?: 'left' | 'right' | 'above' | 'below';
}

export interface OnBoard {
  key: string;
  kind: 'tag';
  box: Rect;
  /** short pointers from the tag to its targets (none when it touches them) */
  pointers: [Pt, Pt][];
}
export interface OffBoard {
  key: string;
  kind: 'callout';
  /** text anchor (centre, baseline) */
  at: Pt;
  box: Rect;
  /** leader polylines, one per target */
  leaders: Pt[][];
}
export type PlacedLabel = OnBoard | OffBoard;

export interface LabelLayout {
  labels: PlacedLabel[];
  /** holes under a tag (drawn faded) */
  dimmed: Set<string>;
  /** column numbers under a tag (left out) */
  hiddenCols: Set<number>;
  /** the drawing's extent with the labels outside the board */
  bounds: Rect;
}

/** a tag that costs more than this (or lies farther than MAX_DIST) leaves the board */
export const MAX_COST = 4;
export const MAX_DIST = 70;

/** Places every label: on the board where a good spot exists, else above / below it. */
export function placeLabels(g: BoardGeom, labels: LabelSpec[], fixed: Rect[], width = textWidth): LabelLayout {
  const holes: { id: string; box: Rect; cost: number }[] = [];
  for (const r of g.rows)
    for (let c = g.c0; c <= g.c1; c++) {
      const id = `${r}${c}`;
      const box = g.holeRect(id);
      if (box) holes.push({ id, box, cost: isRail(r) ? 5 : 1 });
    }
  const inner = padRect(g.frame, -3);
  // candidate rows for a tag: on a row of holes, between two rows, the column-number lane, the trench
  const ys = new Set<number>(g.rows.map((r) => g.Y.get(r)!));
  for (let i = 0; i + 1 < g.rows.length; i++) ys.add((g.Y.get(g.rows[i])! + g.Y.get(g.rows[i + 1])!) / 2);
  // (the lane above the first row: a tag there ends 1 px above the holes)
  if (g.firstMain) ys.add(g.Y.get(g.firstMain)! - 13);
  if (g.gapY !== null) ys.add(g.gapY);
  const taken: Rect[] = [];
  const out: PlacedLabel[] = [];
  const leftOver: LabelSpec[] = [];
  const sideOk = (L: LabelSpec, cx: number, cy: number) => {
    if (!L.side) return true;
    const t = union(L.targets);
    return L.side === 'left' ? cx < t.x : L.side === 'right' ? cx > t.x + t.w : L.side === 'above' ? cy < t.y : cy > t.y + t.h;
  };

  for (const L of [...labels].sort((a, b) => width(b.text) - width(a.text))) {
    const w = width(L.text) + 14;
    const h = TAG_H;
    // what this tag may not cover: the other labels' targets, parts and marks, its own target's holes
    const hard = [...labels.filter((o) => o !== L).flatMap((o) => o.targets.map((t) => padRect(t, 2))), ...L.cores.map((t) => padRect(t, 0.5)), ...fixed];
    let best: { box: Rect; cost: number; d: number } | null = null;
    for (let cx = inner.x + w / 2; cx <= inner.x + inner.w - w / 2; cx += 5.5)
      for (const cy of ys) {
        const box = { x: cx - w / 2, y: cy - h / 2, w, h };
        if (box.y < inner.y || box.y + box.h > inner.y + inner.h) continue;
        if (hard.some((o) => hitRect(box, o)) || taken.some((o) => hitRect(box, padRect(o, 4)))) continue;
        let cost = 0;
        for (const hh of holes) if (hitRect(box, hh.box)) cost += hh.cost;
        for (const c of g.colNums) if (hitRect(box, g.colNumRect(c))) cost += 0.5;
        const d = Math.min(
          ...L.targets.map((t) => {
            const q = nearestOn(cx, cy, t);
            return Math.hypot(q[0] - cx, q[1] - cy);
          }),
        );
        cost += d * 0.05 + (sideOk(L, cx, cy) ? 0 : 1.5);
        if (!best || cost < best.cost) best = { box, cost, d };
      }
    if (!best || best.cost > MAX_COST || best.d > MAX_DIST) {
      leftOver.push(L);
      continue;
    }
    taken.push(best.box);
    const cx = best.box.x + best.box.w / 2;
    const cy = best.box.y + best.box.h / 2;
    // one pointer, to the nearest target (the others share its colour and light up with it)
    const pointers: [Pt, Pt][] = [];
    const ends = L.targets.map((t) => {
      const q = nearestOn(cx, cy, padRect(t, -3));
      return { q, p: nearestOn(q[0], q[1], best.box) };
    });
    const e = ends.reduce((a, b) => (Math.hypot(b.q[0] - b.p[0], b.q[1] - b.p[1]) < Math.hypot(a.q[0] - a.p[0], a.q[1] - a.p[1]) ? b : a));
    if (Math.hypot(e.q[0] - e.p[0], e.q[1] - e.p[1]) > 3) pointers.push([e.p, e.q]);
    out.push({ key: L.key, kind: 'tag', box: best.box, pointers });
  }

  // off the board: a lane above and a lane below, each packed left to right in rows
  let y0 = 0;
  let y1 = g.bottom;
  const minX = g.frame.x;
  const maxX = g.frame.x + g.frame.w;
  for (const top of [true, false]) {
    const items = leftOver
      .filter((L) => L.top === top)
      .map((L) => ({ L, w: width(L.text) + 6, want: L.gutters.reduce((a, b) => a + b, 0) / L.gutters.length }))
      .sort((a, b) => a.want - b.want);
    const rowRight: number[] = [];
    for (const it of items) {
      let row = 0;
      let x: number;
      for (;;) {
        const last = rowRight[row];
        x = Math.max(it.want - it.w / 2, last === undefined ? minX : last + 10, minX);
        if (x + it.w <= maxX || last === undefined) break;
        row++;
      }
      x = Math.min(x, maxX - it.w);
      rowRight[row] = x + it.w;
      const base = top ? g.frame.y - 12 - row * 22 : g.frame.y + g.frame.h + 22 + row * 22;
      const cx = x + it.w / 2;
      const elbow = top ? base + 6 : base - 18;
      // a leader to the target nearest the lane (the others share its colour and light up with it)
      const near = it.L.targets.reduce((bi, t, i, all) => ((top ? t.y < all[bi].y : t.y + t.h > all[bi].y + all[bi].h) ? i : bi), 0);
      const leaders: Pt[][] = [it.L.targets[near]].map((t) => {
        const i = near;
        const gx = it.L.gutters[i];
        const tipY = top ? t.y + Math.min(12, t.h / 2) : t.y + t.h - Math.min(12, t.h / 2);
        const edgeX = gx > t.x + t.w / 2 ? t.x + t.w : t.x;
        return [
          [cx, top ? base + 4 : base - 14],
          [cx, elbow],
          [gx, elbow],
          [gx, tipY],
          [edgeX, tipY],
        ];
      });
      const box = { x, y: base - 13, w: it.w, h: 17 };
      y0 = Math.min(y0, box.y - 4);
      y1 = Math.max(y1, box.y + box.h + 4);
      out.push({ key: it.L.key, kind: 'callout', at: [cx, base], box, leaders });
    }
  }

  const tags = out.filter((p): p is OnBoard => p.kind === 'tag').map((p) => p.box);
  return {
    labels: out,
    dimmed: new Set(holes.filter((hh) => tags.some((t) => hitRect(t, hh.box))).map((hh) => hh.id)),
    hiddenCols: new Set(g.colNums.filter((c) => tags.some((t) => hitRect(t, g.colNumRect(c))))),
    bounds: (() => {
      const x0 = Math.min(0, ...out.map((p) => p.box.x - 4));
      const x1 = Math.max(g.right + 12, ...out.map((p) => p.box.x + p.box.w + 4));
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    })(),
  };
}

/** the gap between two columns next to x (where a leader can run without crossing a hole) */
export function gutterNear(g: BoardGeom, x: number, preferRight = true): number {
  const c = Math.round((x - g.left) / PITCH) + g.c0;
  const right = g.X(Math.min(c, g.c1)) + PITCH / 2;
  const left = g.X(Math.max(c, g.c0)) - PITCH / 2;
  return preferRight && c < g.c1 ? right : c > g.c0 ? left : right;
}
