// Figures in lesson cards (CHALLENGE_FORMAT.md §16.3): a challenge file may carry a `figures` map
// (id → figure), and a line `![](fig:<id>)` in a card's or a step's text shows that figure there.
// Three kinds, all drawn by the app (so they follow the language, the theme and the zoom viewer):
//   schematic  — the practice problems' circuit drawing (explicit grid coordinates, current
//                arrows, +/− marks, loop arrows), plus the drawing-only LED and BAT symbols;
//   breadboard — a strip of the breadboard: which holes connect, parts plugged into them;
//   plot       — curves on two axes (an LED's current against its voltage, a battery's line).
// Every text inside a figure is either a string or { text, i18n: { en } }, like the notes of a
// problem schematic; it is picked for the language when drawn.

import { HOLE_MAP } from './breadboard';
import { tr } from './i18n';
import { extractNetlist } from './problem/geometry';
import type { Schematic } from './problem/types';

export type FigText = string | { text: string; i18n?: { en?: string } };

/** the text of a figure label for a language */
export const figText = (t: FigText | undefined, lang: string): string => (t === undefined ? '' : typeof t === 'string' ? t : lang === 'en' && t.i18n?.en ? t.i18n.en : t.text);

export type Tone = 1 | 2 | 3;

export interface SchematicFigure {
  kind: 'schematic';
  caption: FigText;
  schematic: Schematic;
  /** element refs drawn in the accent colour */
  highlight?: string[];
}

export type BoardPartType = 'wire' | 'resistor' | 'led' | 'battery' | 'probe';

export interface BoardPart {
  type: BoardPartType;
  /** a hole id ("a5", "tp3"); a probe only has `from` */
  from: string;
  to?: string;
  label?: FigText;
  /** wire / LED / probe colour: red, black, green, yellow, blue, white, orange */
  color?: string;
}

export interface BreadboardFigure {
  kind: 'breadboard';
  caption: FigText;
  /** columns shown, inclusive (default 1–12) */
  cols?: [number, number];
  /** which half of the main rows: "top" (a–e), "bottom" (f–j) or "both" (default) */
  rows?: 'top' | 'bottom' | 'both';
  /** power rails shown: "top", "bottom", "both" or "none" (default: the rails next to the rows shown) */
  rails?: 'top' | 'bottom' | 'both' | 'none';
  /** the connected group of each hole is shaded (a5 → a5–e5; tp3 → the whole tp rail); `at` may list several holes that one label names. Labels are placed by boardFigure.placeLabels. */
  strips?: { at: string | string[]; tone?: Tone; label?: FigText }[];
  parts?: BoardPart[];
  /** a "not connected" cross between two holes (e.g. e5 / f5 across the gap) */
  apart?: [string, string][];
  /** text next to a hole */
  notes?: { at: string; text: FigText; side?: 'left' | 'right' | 'above' | 'below' }[];
}

export interface PlotAxis {
  label: FigText;
  min: number;
  max: number;
  /** tick values (default: none besides the ends) */
  ticks?: number[];
}

export interface PlotFigure {
  kind: 'plot';
  caption: FigText;
  x: PlotAxis;
  y: PlotAxis;
  /** `labelAt`: where the curve's label goes (default: by its last point) */
  curves: { points: [number, number][]; label?: FigText; labelAt?: [number, number]; tone?: Tone; dashed?: boolean }[];
  dots?: { at: [number, number]; label?: FigText; tone?: Tone }[];
  /** horizontal / vertical guide lines */
  hlines?: { y: number; label?: FigText; dashed?: boolean }[];
  vlines?: { x: number; label?: FigText; dashed?: boolean }[];
}

export type CardFigure = (SchematicFigure | BreadboardFigure | PlotFigure) & { id: string };

/** `![alt](fig:<id>)` on a line of its own */
export const FIG_LINE = /^\s*!\[[^\]]*\]\(fig:([a-z0-9-]+)\)\s*$/;
const FIG_ANY = /!\[[^\]]*\]\(fig:([a-z0-9-]+)\)/g;

/** ids referenced in a text */
export const figureRefs = (text: string): string[] => [...text.matchAll(FIG_ANY)].map((m) => m[1]);

const PART_TYPES: BoardPartType[] = ['wire', 'resistor', 'led', 'battery', 'probe'];
const COLORS = ['red', 'black', 'green', 'yellow', 'blue', 'white', 'orange'];

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isText = (v: unknown): v is FigText => (typeof v === 'string' && v.trim() !== '') || (isObj(v) && typeof v.text === 'string' && v.text.trim() !== '');

/** every text of a figure, both languages (the answer-leak scan reads them) */
export function figureTexts(f: unknown): string[] {
  const out: string[] = [];
  const walk = (v: unknown, key = '') => {
    if (typeof v === 'string') {
      if (['caption', 'text', 'label', 'en'].includes(key)) out.push(v);
    } else if (Array.isArray(v)) v.forEach((x) => walk(x, key));
    else if (isObj(v)) for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  walk(f);
  return out;
}

/** Validates the `figures` map of a challenge file. */
export function parseFigures(raw: unknown): { figures: Record<string, CardFigure>; errors: string[]; warnings: string[] } {
  const figures: Record<string, CardFigure> = {};
  const errors: string[] = [];
  const warnings: string[] = [];
  if (raw === undefined) return { figures, errors, warnings };
  if (!isObj(raw)) {
    errors.push(tr('"figures" 必须是对象：{ "图的名字": { "kind": "schematic", … } }', '"figures" must be an object: { "figure-id": { "kind": "schematic", … } }'));
    return { figures, errors, warnings };
  }
  for (const [id, f] of Object.entries(raw)) {
    const w = `figures.${id}`;
    const err = (zh: string, en: string) => errors.push(tr(`${w}: ${zh}`, `${w}: ${en}`));
    const idOk = /^[a-z0-9-]+$/.test(id);
    if (!idOk) err('名字只能用小写字母、数字和 -', 'the id may only use lowercase letters, digits and -');
    if (!isObj(f)) {
      err('必须是对象', 'must be an object');
      continue;
    }
    const before = errors.length;
    if (!isText(f.caption)) err('需要 "caption"（图下面的一句说明，也是读屏软件读的文字）', 'needs a "caption" (one line under the figure; screen readers read it too)');
    if (f.kind === 'schematic') checkSchematic(f, err, warnings, w);
    else if (f.kind === 'breadboard') checkBoard(f, err);
    else if (f.kind === 'plot') checkPlot(f, err);
    else err('"kind" 必须是 schematic / breadboard / plot', '"kind" must be schematic / breadboard / plot');
    if (idOk && errors.length === before) figures[id] = { ...(f as unknown as SchematicFigure | BreadboardFigure | PlotFigure), id };
  }
  return { figures, errors, warnings };
}

type Err = (zh: string, en: string) => void;

function checkSchematic(f: Record<string, unknown>, err: Err, warnings: string[], w: string) {
  if (!isObj(f.schematic)) return err('需要 "schematic"（和练习题的电路图同一种写法）', 'needs a "schematic" (the same format as a practice problem\'s circuit)');
  const r = extractNetlist(f.schematic as unknown as Schematic, { groundOptional: true });
  for (const e of r.errors) err(e, e);
  for (const x of r.warnings) warnings.push(`${w}: ${x}`);
  const refs = new Set((Array.isArray(f.schematic.elements) ? f.schematic.elements : []).map((e: { ref?: unknown }) => e?.ref));
  if (f.highlight !== undefined) {
    if (!Array.isArray(f.highlight)) err('"highlight" 必须是元件编号的数组', '"highlight" must be an array of element refs');
    else for (const h of f.highlight) if (!refs.has(h)) err(`"highlight" 里的 ${String(h)} 不在图里`, `"highlight": ${String(h)} is not in the drawing`);
  }
}

const hole = (v: unknown): boolean => typeof v === 'string' && HOLE_MAP.has(v);

function checkBoard(f: Record<string, unknown>, err: Err) {
  if (f.cols !== undefined) {
    const c = f.cols;
    if (!Array.isArray(c) || c.length !== 2 || !c.every((n) => Number.isInteger(n) && n >= 1 && n <= 30) || c[0] >= c[1])
      err('"cols" 必须是 [起始列, 结束列]，1–30', '"cols" must be [first column, last column], 1–30');
  }
  if (f.rows !== undefined && !['top', 'bottom', 'both'].includes(f.rows as string)) err('"rows" 必须是 top / bottom / both', '"rows" must be top / bottom / both');
  if (f.rails !== undefined && !['top', 'bottom', 'both', 'none'].includes(f.rails as string))
    err('"rails" 必须是 top / bottom / both / none', '"rails" must be top / bottom / both / none');
  const holeErr = (where: string, v: unknown) =>
    !hole(v) && err(`${where} 的孔位 ${JSON.stringify(v)} 不存在（例如 "a5"、"tp3"）`, `${where}: no hole ${JSON.stringify(v)} (e.g. "a5", "tp3")`);
  const list = (k: string) => (f[k] === undefined ? [] : Array.isArray(f[k]) ? (f[k] as unknown[]) : (err(`"${k}" 必须是数组`, `"${k}" must be an array`), []));
  list('strips').forEach((s, i) => {
    if (!isObj(s)) return err(`strips[${i}] 必须是对象`, `strips[${i}] must be an object`);
    const at = Array.isArray(s.at) ? s.at : [s.at];
    if (!at.length) err(`strips[${i}].at 不能是空数组`, `strips[${i}].at must not be an empty array`);
    at.forEach((h) => holeErr(`strips[${i}].at`, h));
    if (s.tone !== undefined && ![1, 2, 3].includes(s.tone as number)) err(`strips[${i}].tone 必须是 1、2 或 3`, `strips[${i}].tone must be 1, 2 or 3`);
  });
  list('parts').forEach((p, i) => {
    if (!isObj(p)) return err(`parts[${i}] 必须是对象`, `parts[${i}] must be an object`);
    if (!PART_TYPES.includes(p.type as BoardPartType)) err(`parts[${i}].type 必须是 ${PART_TYPES.join(' / ')}`, `parts[${i}].type must be ${PART_TYPES.join(' / ')}`);
    holeErr(`parts[${i}].from`, p.from);
    if (p.type !== 'probe') holeErr(`parts[${i}].to`, p.to);
    if (p.color !== undefined && !COLORS.includes(p.color as string)) err(`parts[${i}].color 必须是 ${COLORS.join(' / ')}`, `parts[${i}].color must be ${COLORS.join(' / ')}`);
    if (p.label !== undefined && !isText(p.label)) err(`parts[${i}].label 不能为空`, `parts[${i}].label must not be empty`);
  });
  list('apart').forEach((a, i) => {
    if (!Array.isArray(a) || a.length !== 2) return err(`apart[${i}] 必须是两个孔位，如 ["e5", "f5"]`, `apart[${i}] must be two holes, e.g. ["e5", "f5"]`);
    a.forEach((h, j) => holeErr(`apart[${i}][${j}]`, h));
  });
  list('notes').forEach((n, i) => {
    if (!isObj(n)) return err(`notes[${i}] 必须是对象`, `notes[${i}] must be an object`);
    holeErr(`notes[${i}].at`, n.at);
    if (!isText(n.text)) err(`notes[${i}].text 不能为空`, `notes[${i}].text must not be empty`);
  });
}

function checkPlot(f: Record<string, unknown>, err: Err) {
  for (const k of ['x', 'y'] as const) {
    const a = f[k];
    if (!isObj(a) || !isText(a.label) || !isNum(a.min) || !isNum(a.max) || a.min >= a.max) {
      err(`"${k}" 必须是 { "label": "…", "min": 数, "max": 更大的数 }`, `"${k}" must be { "label": "…", "min": number, "max": larger number }`);
      continue;
    }
    if (a.ticks !== undefined && !(Array.isArray(a.ticks) && a.ticks.every(isNum))) err(`"${k}.ticks" 必须是数组`, `"${k}.ticks" must be an array of numbers`);
  }
  const pt = (v: unknown) => Array.isArray(v) && v.length === 2 && isNum(v[0]) && isNum(v[1]);
  if (!Array.isArray(f.curves) || !f.curves.length) err('"curves" 至少要有一条曲线', '"curves" needs at least one curve');
  else
    f.curves.forEach((c: unknown, i: number) => {
      if (!isObj(c) || !Array.isArray(c.points) || c.points.length < 2 || !c.points.every(pt))
        err(`curves[${i}].points 必须是至少两个 [x, y] 点`, `curves[${i}].points must be at least two [x, y] points`);
      else if (c.labelAt !== undefined && !pt(c.labelAt)) err(`curves[${i}].labelAt 必须是 [x, y]`, `curves[${i}].labelAt must be [x, y]`);
    });
  if (f.dots !== undefined && !(Array.isArray(f.dots) && f.dots.every((d) => isObj(d) && pt(d.at)))) err('"dots" 的每一项需要 "at": [x, y]', 'each of "dots" needs "at": [x, y]');
  if (f.hlines !== undefined && !(Array.isArray(f.hlines) && f.hlines.every((d) => isObj(d) && isNum(d.y)))) err('"hlines" 的每一项需要 "y"', 'each of "hlines" needs "y"');
  if (f.vlines !== undefined && !(Array.isArray(f.vlines) && f.vlines.every((d) => isObj(d) && isNum(d.x)))) err('"vlines" 的每一项需要 "x"', 'each of "vlines" needs "x"');
}
