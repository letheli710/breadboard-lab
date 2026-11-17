// The course map: the Worlds of course/worlds.json (World 1–8, each tied to a QCC course and its
// exam, plus the UB elective area), each a run of short units, each unit a few bench items
// (lessons, challenges, labs) in the order to do them, the learning units that go with it and its
// theory chapters. The Learn page and its map panel follow this order; the files keep their ids, so
// saved progress, layouts and links stay valid when a unit moves. course/worlds.json is the single
// source (docs/REBUILD_PLAN.md); the #/map page (ui/course/MapPage.tsx) reads the same file.

// only the "worlds" key: the pending list and the file checks (core/course/catalog.ts, run by
// npm run validate) stay out of the start-up bundle
import { worlds as rawWorlds } from '../../course/worlds.json';
import type { World as WorldEntry } from './course/catalog';
import { tt } from './course/text';
import { tr } from './i18n';

export interface CourseUnit {
  /** "3.5" — shown on the cards */
  num: string;
  /** challenge / lesson ids, in order */
  items: string[];
  /** learning units (units/*.json, #/unit/<id>) that go with it */
  units: string[];
  /** theory chapters (problem chapter ids) that go with this unit */
  practice?: string[];
  title: () => string;
  note: () => string;
}

export interface World {
  /** the World number (1–8); the UB elective area is 9 */
  id: number;
  /** the id in course/worlds.json ("w3", "ub") */
  key: string;
  /** "World 3" / "UB" */
  label: () => string;
  title: () => string;
  /** the course(s) and textbook chapters it covers */
  books: () => string;
  current: boolean;
  elective: boolean;
  units: CourseUnit[];
}

export const WORLDS: World[] = (rawWorlds as unknown as WorldEntry[]).map((w) => {
  const id = w.n ?? 9;
  return {
    id,
    key: w.id,
    label: () => (w.n !== undefined ? `World ${w.n}` : tr('UB 衔接区', 'UB bridge')),
    title: () => tt(w.title),
    books: () => [tt(w.course), w.textbook ? tt(w.textbook) : ''].filter(Boolean).join(' · '),
    current: !!w.current,
    elective: !!w.elective,
    units: w.sections.map((s, k) => {
      const of = (p: string) => s.items.filter((x) => x.startsWith(p)).map((x) => x.slice(p.length));
      const practice = of('chapter:');
      return {
        num: w.n !== undefined ? `${w.n}.${k + 1}` : `UB.${k + 1}`,
        items: of('challenge:'),
        units: of('unit:'),
        ...(practice.length ? { practice } : {}),
        title: () => tt(s.title),
        note: () => (s.note ? tt(s.note) : ''),
      };
    }),
  };
});

/** Theory chapters kept out of the main path (shown as electives in Practice): the UB area. */
export const ARCHIVED_CHAPTERS = WORLDS.filter((w) => w.elective).flatMap((w) => w.units.flatMap((u) => u.practice ?? []));

export interface CoursePlace {
  world: World;
  unit: CourseUnit;
  /** position inside the unit (0-based) */
  pos: number;
  /** index in the whole course */
  index: number;
}

/** Every bench item in course order. */
export const COURSE_ORDER: string[] = WORLDS.flatMap((w) => w.units.flatMap((u) => u.items));

const PLACES = new Map<string, CoursePlace>();
WORLDS.forEach((world) =>
  world.units.forEach((unit) =>
    unit.items.forEach((id, pos) => {
      PLACES.set(id, { world, unit, pos, index: PLACES.size });
    }),
  ),
);

/** Where a bench item sits in the course (undefined: not in the map, e.g. an imported file). */
export const placeOf = (id: string): CoursePlace | undefined => PLACES.get(id);

/** "1.7" for a one-item unit, "1.7b" for the second item of a longer one. */
export function itemLabel(p: CoursePlace): string {
  return p.unit.items.length > 1 ? `${p.unit.num}${'abcdefghij'[p.pos]}` : p.unit.num;
}

/** The theory chapters of a World, in course order, without repeats. */
export function worldChapters(w: World): string[] {
  return [...new Set(w.units.flatMap((u) => u.practice ?? []))];
}

/** Items sorted in course order; items outside the map keep their order after them. */
export function inCourseOrder<T extends { id: string }>(items: T[]): T[] {
  const known = items.filter((c) => PLACES.has(c.id)).sort((a, b) => PLACES.get(a.id)!.index - PLACES.get(b.id)!.index);
  return [...known, ...items.filter((c) => !PLACES.has(c.id))];
}
