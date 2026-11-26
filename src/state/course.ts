// Portals (course/portals.json) and learning units (units/*.json) for the pages that show them:
// the Map, unit pages, and the portal / reverse-link boxes on lessons, labs, key-points pages and
// problems. Refs are resolved against what the store knows (the lesson / lab and problem indexes)
// and the units bundled here. Pure helpers are in core/course/catalog.ts.

import portalsRaw from '../../course/portals.json';
import {
  backlinksTo,
  isDone,
  parsePortalsFile,
  parseRef,
  portalReadiness,
  portalsFrom,
  resolveRef,
  worldOf,
  type Catalog,
  type CourseData,
  type Portal,
  type Ref,
} from '../core/course/catalog';
import { parseUnit, type Unit } from '../core/course/unit';
import { tt } from '../core/course/text';
import { tr } from '../core/i18n';
import { chapterById, CHAPTERS } from '../core/problem/chapters';
import { useCourse } from './courseStore';
import { entryTitle } from './problems';
import { formatRoute, type Route } from './router';
import { useStore } from './store';
import { PENDING, WORLDS } from './worlds';
import { lessonCatalog } from '../stage/registry';

/** stage lessons (#/lesson/<slug>): the registry only, the lessons themselves are lazy */
export const LESSONS = lessonCatalog();

const unitFiles = import.meta.glob('../../units/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;

export const UNITS = new Map<string, Unit>();
export const unitErrors: { file: string; errors: string[] }[] = [];
for (const [file, json] of Object.entries(unitFiles)) {
  const r = parseUnit(json);
  if (r.unit) UNITS.set(r.unit.id, r.unit);
  else unitErrors.push({ file, errors: r.errors });
}
export const PORTALS: Portal[] = parsePortalsFile(portalsRaw, []);
export const COURSE: CourseData = { worlds: WORLDS, pending: PENDING, portals: PORTALS };

type S = ReturnType<typeof useStore.getState>;

/** What exists right now (the store's lists fill in once their indexes arrive). */
export function catalogOf(s: Pick<S, 'challenges' | 'problems'>): Catalog {
  return {
    challenges: new Map(s.challenges.map((c) => [c.id, { title: c.title, kind: c.kind }])),
    chapters: new Map(CHAPTERS.map((c) => [c.id, { title: c.title() }])),
    problems: new Map(s.problems.map((p) => [p.id, p.chapter])),
    units: UNITS,
    lessons: LESSONS,
  };
}

let cache: { ch: unknown; pr: unknown; cat: Catalog } | null = null;
/** The catalog, rebuilt only when the store's lists change. */
export function useCatalog(): Catalog {
  const challenges = useStore((s) => s.challenges);
  const problems = useStore((s) => s.problems);
  useStore((s) => s.lang);
  if (!cache || cache.ch !== challenges || cache.pr !== problems) cache = { ch: challenges, pr: problems, cat: catalogOf({ challenges, problems }) };
  return cache.cat;
}

export function useProgress() {
  const completed = useStore((s) => s.completed);
  const problems = useStore((s) => s.practiceDone);
  const units = useCourse((s) => s.unitsDone);
  const lessons = useCourse((s) => s.lessonsDone);
  return { completed, problems, units, lessons };
}

/** The route a ref opens (null for a placeholder or a broken ref). */
export function routeOfRef(ref: Ref, cat: Catalog): Route | null {
  const r = resolveRef(ref, cat, COURSE);
  if (r.state !== 'live') return null;
  const { kind, id } = r.ref;
  switch (kind) {
    case 'challenge':
      return { page: cat.challenges.get(id)?.kind === 'lesson' ? 'learn' : 'challenges', id };
    case 'chapter':
      return { page: 'practice', summary: id };
    case 'problem':
      return { page: 'practice', id };
    case 'unit':
      return { page: 'unit', id };
    case 'lesson':
      return { page: 'lesson', id };
    default:
      return null;
  }
}

/** Display title of a ref, e.g. "实验 3-6 · op-amp 积分器…", "要点 · 电路定理", "5b · 为什么有虚短". */
export function titleOfRef(ref: Ref, cat: Catalog): string {
  const r = resolveRef(ref, cat, COURSE);
  const { kind, id } = r.ref;
  if (kind === 'pending') {
    const p = PENDING.find((x) => x.id === id);
    return p ? tt(p.title) : id;
  }
  if (kind === 'challenge') return cat.challenges.get(id)?.title ?? id;
  if (kind === 'chapter') return tr(`理论章节 · ${chapterById(id)?.title() ?? id}`, `Theory · ${chapterById(id)?.title() ?? id}`);
  if (kind === 'problem') {
    const p = useStore.getState().problems.find((x) => x.id === id);
    return p ? tr(`理论题 · ${entryTitle(p)}`, `Problem · ${entryTitle(p)}`) : id;
  }
  if (kind === 'lesson') {
    const l = LESSONS.get(id);
    return l ? `${l.code} · ${tt(l.title)}` : id;
  }
  const u = UNITS.get(id);
  return u ? `${u.code ? `${u.code} · ` : ''}${tt(u.title)}` : id;
}

export const refHash = (ref: Ref, cat: Catalog) => {
  const r = routeOfRef(ref, cat);
  return r ? formatRoute(r) : null;
};

/** Go through a portal: remember where from (the breadcrumb), then open the target. */
export function enterPortal(p: Portal, cat: Catalog) {
  const to = parseRef(p.to);
  const target = to && refHash(to, cat);
  if (!target) return;
  const from = parseRef(p.from);
  useCourse.getState().setTrail({ from: location.hash || '#/', fromTitle: from ? titleOfRef(from, cat) : '', to: target });
  location.hash = target;
}

export { backlinksTo, isDone, parseRef, portalReadiness, portalsFrom, resolveRef, worldOf };
export type { Portal, Ref };
