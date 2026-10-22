// Breadboard geometry + internal connectivity.
// Units: 1 = one hole pitch (0.1 inch / 2.54 mm). x runs along columns, z runs across rows.

import { tr } from './i18n';

export const COLS = 30;
export const MAIN_ROWS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const;
export type MainRow = (typeof MAIN_ROWS)[number];
export const RAIL_ROWS = ['tp', 'tn', 'bp', 'bn'] as const;
export type RailRow = (typeof RAIL_ROWS)[number];
export type RowId = MainRow | RailRow;

/** z coordinate of every row. e→f spans the centre trench (3 pitches). */
export const ROW_Z: Record<RowId, number> = {
  tp: -9.0,
  tn: -8.0,
  a: -5.5,
  b: -4.5,
  c: -3.5,
  d: -2.5,
  e: -1.5,
  f: 1.5,
  g: 2.5,
  h: 3.5,
  i: 4.5,
  j: 5.5,
  bp: 8.0,
  bn: 9.0,
};

export const BOARD = {
  width: COLS + 2.2,
  depth: 21,
  height: 0.9,
};

export interface Hole {
  id: string;
  row: RowId;
  col: number;
  x: number;
  z: number;
  /** id of the internal metal strip this hole belongs to */
  strip: string;
}

export function colX(col: number): number {
  return col - (COLS + 1) / 2;
}

export function holeId(row: RowId, col: number): string {
  return `${row}${col}`;
}

function stripOf(row: RowId, col: number): string {
  if (row === 'tp' || row === 'tn' || row === 'bp' || row === 'bn') return `rail-${row}`;
  const top = 'abcde'.includes(row);
  return `col-${col}-${top ? 'top' : 'bot'}`;
}

export const HOLES: Hole[] = [];
export const HOLE_MAP = new Map<string, Hole>();
for (const row of [...RAIL_ROWS, ...MAIN_ROWS] as RowId[]) {
  for (let col = 1; col <= COLS; col++) {
    const h: Hole = { id: holeId(row, col), row, col, x: colX(col), z: ROW_Z[row], strip: stripOf(row, col) };
    HOLES.push(h);
    HOLE_MAP.set(h.id, h);
  }
}

export const STRIP_HOLES = new Map<string, string[]>();
for (const h of HOLES) {
  if (!STRIP_HOLES.has(h.strip)) STRIP_HOLES.set(h.strip, []);
  STRIP_HOLES.get(h.strip)!.push(h.id);
}

export function isRail(row: RowId): row is RailRow {
  return (RAIL_ROWS as readonly string[]).includes(row);
}

const RAIL_NAME: Record<RailRow, () => string> = {
  tp: () => tr('上方 + 电源轨（红线）', 'top + rail (red line)'),
  tn: () => tr('上方 − 电源轨（蓝线）', 'top − rail (blue line)'),
  bp: () => tr('下方 + 电源轨（红线）', 'bottom + rail (red line)'),
  bn: () => tr('下方 − 电源轨（蓝线）', 'bottom − rail (blue line)'),
};

export function holeLabel(id: string): string {
  const h = HOLE_MAP.get(id);
  if (!h) return id;
  if (isRail(h.row)) return tr(`${RAIL_NAME[h.row]()} 第${h.col}孔`, `${RAIL_NAME[h.row]()}, hole ${h.col}`);
  return `${h.row}${h.col}`;
}

export function stripLabel(strip: string): string {
  if (strip.startsWith('rail-')) return RAIL_NAME[strip.slice(5) as RailRow]();
  const [, col, side] = strip.split('-');
  const rows = side === 'top' ? 'a–e' : 'f–j';
  return tr(`第${col}列 ${rows}`, `column ${col} ${rows}`);
}

/** Offset a hole by (dRow index, dCol). Main rows only; crossing e→f is one step. */
export function offsetHole(id: string, dRow: number, dCol: number): string | null {
  const h = HOLE_MAP.get(id);
  if (!h) return null;
  if (isRail(h.row)) {
    if (dRow !== 0) return null;
    const c = h.col + dCol;
    return c >= 1 && c <= COLS ? holeId(h.row, c) : null;
  }
  const ri = MAIN_ROWS.indexOf(h.row as MainRow) + dRow;
  const c = h.col + dCol;
  if (ri < 0 || ri >= MAIN_ROWS.length || c < 1 || c > COLS) return null;
  return holeId(MAIN_ROWS[ri], c);
}
