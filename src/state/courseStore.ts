// Per-viewer course state, kept in localStorage: which learning units and stage lessons are done, the "watch
// later" queue of portals, and the breadcrumb left by the last portal the student went through.
// Tiny on purpose (the header's "later" button reads it on every page).

import { create } from 'zustand';
import { boolRecord, readStored, writeStored } from './persist';

export interface LaterItem {
  portal: string;
  added: number;
  done?: boolean;
}

/** Where a portal was taken from: shown as a bar at the top of the target page until the student leaves it. */
export interface Trail {
  /** hash of the page the portal was on, and its title */
  from: string;
  fromTitle: string;
  /** hash of the target page */
  to: string;
}

const UNITS_KEY = 'bb.course.units';
const LESSONS_KEY = 'bb.course.lessons';
const LATER_KEY = 'bb.course.later';

const laterList = (v: unknown): LaterItem[] | undefined =>
  Array.isArray(v)
    ? v
        .filter((x): x is LaterItem => !!x && typeof x === 'object' && typeof (x as LaterItem).portal === 'string' && typeof (x as LaterItem).added === 'number')
        .map((x) => ({ portal: x.portal, added: x.added, ...(x.done ? { done: true } : {}) }))
    : undefined;

interface CourseState {
  unitsDone: Record<string, boolean>;
  /** stage lessons passed (#/lesson/<slug>: the closing check answered right) */
  lessonsDone: Record<string, boolean>;
  later: LaterItem[];
  trail: Trail | null;
  setUnitDone(id: string, done: boolean): void;
  setLessonDone(slug: string, done: boolean): void;
  toggleLater(portal: string): void;
  setLaterDone(portal: string, done: boolean): void;
  removeLater(portal: string): void;
  setTrail(t: Trail | null): void;
}

export const useCourse = create<CourseState>((set, get) => ({
  unitsDone: readStored(UNITS_KEY, {} as Record<string, boolean>, boolRecord),
  lessonsDone: readStored(LESSONS_KEY, {} as Record<string, boolean>, boolRecord),
  later: readStored(LATER_KEY, [] as LaterItem[], laterList),
  trail: null,
  setUnitDone(id, done) {
    const unitsDone = { ...get().unitsDone };
    if (done) unitsDone[id] = true;
    else delete unitsDone[id];
    set({ unitsDone });
    writeStored(UNITS_KEY, unitsDone);
  },
  setLessonDone(slug, done) {
    const lessonsDone = { ...get().lessonsDone };
    if (done) lessonsDone[slug] = true;
    else delete lessonsDone[slug];
    set({ lessonsDone });
    writeStored(LESSONS_KEY, lessonsDone);
  },
  toggleLater(portal) {
    const cur = get().later;
    const later = cur.some((x) => x.portal === portal) ? cur.filter((x) => x.portal !== portal) : [...cur, { portal, added: Date.now() }];
    set({ later });
    writeStored(LATER_KEY, later);
  },
  setLaterDone(portal, done) {
    const later = get().later.map((x) => (x.portal === portal ? { portal: x.portal, added: x.added, ...(done ? { done: true } : {}) } : x));
    set({ later });
    writeStored(LATER_KEY, later);
  },
  removeLater(portal) {
    const later = get().later.filter((x) => x.portal !== portal);
    set({ later });
    writeStored(LATER_KEY, later);
  },
  setTrail(trail) {
    set({ trail });
  },
}));
