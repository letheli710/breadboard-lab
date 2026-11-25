// The index of stage lessons (#/lesson/<slug>): what the course map, the validator and the progress
// count need to know without loading a lesson (its text, diagrams and stage code are a lazy chunk,
// src/stage/lessons/). A lesson is placed in a World of course/worlds.json as "lesson:<slug>";
// `npm run validate` checks that every entry here is placed exactly once and that the World
// matches, and src/stage/registry.test.ts that each entry matches its lesson file.

export interface StageLessonEntry {
  /** URL / ref id: the lesson id in lower case ("w1-l0") */
  slug: string;
  /** "W1-L0" */
  code: string;
  /** World id in course/worlds.json */
  world: string;
  title: { zh: string; en: string };
  minutes: number;
}

export const STAGE_LESSON_INDEX: StageLessonEntry[] = [
  {
    slug: 'w1-l0',
    code: 'W1-L0',
    world: 'w1',
    title: { zh: '实验箱与万用表极简前置卡', en: 'Quick start: the breadboard and the multimeter' },
    minutes: 5,
  },
];

export const STAGE_LESSON_ENTRY = new Map(STAGE_LESSON_INDEX.map((e) => [e.slug, e]));

/** The stage lessons as the course catalog lists them (core/course/catalog.ts Catalog.lessons). */
export const lessonCatalog = () => new Map(STAGE_LESSON_INDEX.map((e) => [e.slug, { world: e.world, code: e.code, title: e.title }]));
