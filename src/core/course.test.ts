// The course map (core/course.ts) must place every built-in bench file exactly once, name only
// files that exist, and reach every theory chapter that is not archived.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildChallengeIndex } from '../../scripts/challenge-index-plugin';
import { ARCHIVED_CHAPTERS, COURSE_ORDER, inCourseOrder, itemLabel, placeOf, WORLDS, worldChapters } from './course';
import { CHAPTERS } from './problem/chapters';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const { entries } = buildChallengeIndex(ROOT);
/** prerequisites straight from the files (the index does not carry them) */
const prereqOf = new Map(entries.map((e) => [e.id, (JSON.parse(readFileSync(join(ROOT, e.file), 'utf8')) as { prereq?: string[] }).prereq ?? []] as const));

describe('course map', () => {
  it('places every built-in lesson / challenge exactly once', () => {
    const ids = entries.map((e) => e.id).sort();
    expect([...COURSE_ORDER].sort()).toEqual(ids);
    expect(new Set(COURSE_ORDER).size).toBe(COURSE_ORDER.length);
  });

  it('numbers units 1.1, 1.2, … inside each World', () => {
    for (const w of WORLDS) w.units.forEach((u, i) => expect(u.num).toBe(`${w.elective ? 'UB' : w.id}.${i + 1}`));
  });

  it('links only real theory chapters, and reaches every chapter that is not archived', () => {
    const known = new Set(CHAPTERS.map((c) => c.id));
    const linked = new Set(WORLDS.flatMap(worldChapters));
    for (const c of linked) expect(known.has(c), c).toBe(true);
    for (const c of ARCHIVED_CHAPTERS) expect(known.has(c), c).toBe(true);
    for (const c of known) expect(linked.has(c) || ARCHIVED_CHAPTERS.includes(c), `chapter ${c} is not in any World`).toBe(true);
  });

  it('labels items by unit (1.4a, 1.4b) and sorts lists in course order', () => {
    expect(itemLabel(placeOf('lesson-multimeter')!)).toBe('1.4a');
    expect(itemLabel(placeOf('challenge-voltage-divider')!)).toBe('1.4b');
    expect(itemLabel(placeOf('lesson-ammeter')!)).toBe('1.5');
    const sorted = inCourseOrder([{ id: 'x-imported' }, { id: 'lesson-ammeter' }, { id: 'lesson-breadboard-basics' }]);
    expect(sorted.map((c) => c.id)).toEqual(['lesson-breadboard-basics', 'lesson-ammeter', 'x-imported']);
  });

  it('puts each lab after the lessons it lists as prerequisites', () => {
    for (const e of entries) {
      const at = placeOf(e.id)!.index;
      for (const p of prereqOf.get(e.id) ?? []) expect(placeOf(p)?.index ?? Infinity, `${e.id} needs ${p} first`).toBeLessThan(at);
    }
  });
});
