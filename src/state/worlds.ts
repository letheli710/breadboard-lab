// The World structure (course/worlds.json), light enough for the challenge carousel and the
// Practice chapter list, which group their items by World. Portals and learning units are in
// state/course.ts (a heavier module, loaded only by the pages that show them).

import raw from '../../course/worlds.json';
import pendingRaw from '../../course/pending.json';
import { parseWorldsFile, type World } from '../core/course/catalog';
import { tt } from '../core/course/text';
import { tr } from '../core/i18n';

const parsed = parseWorldsFile(raw, [], pendingRaw);
export const WORLDS: World[] = parsed.worlds;
export const PENDING = parsed.pending;

/** "World 3" or "UB" */
export const worldLabel = (w: World): string => (w.n !== undefined ? `World ${w.n}` : tr('UB 衔接区', 'UB bridge'));
/** "World 3 · 运算放大器基础" */
export const worldName = (w: World): string => `${worldLabel(w)} · ${tt(w.title)}`;

const position = new Map<string, { world: World; order: number }>();
let k = 0;
for (const w of WORLDS) for (const s of w.sections) for (const item of s.items) position.set(item, { world: w, order: k++ });

/** The World of a lesson / lab / chapter / unit, and its position in the course order. */
export const placeOf = (kind: 'challenge' | 'chapter' | 'unit', id: string) => position.get(`${kind}:${id}`);
export const worldById = (id: string) => WORLDS.find((w) => w.id === id);

/** Course order of lessons / labs: by World, then as listed; unplaced ones last, in their old order. */
export function byCourseOrder<T extends { id: string }>(list: T[]): T[] {
  const ord = (x: T) => placeOf('challenge', x.id)?.order ?? Number.MAX_SAFE_INTEGER;
  return list
    .map((x, i) => ({ x, i }))
    .sort((a, b) => ord(a.x) - ord(b.x) || a.i - b.i)
    .map((e) => e.x);
}
