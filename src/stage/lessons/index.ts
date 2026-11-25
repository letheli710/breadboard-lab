// Stage lesson files by slug, each its own lazy chunk (the registry, ../registry.ts, carries what
// the rest of the app needs without them).

import type { StageLesson } from '../types';

export const lessonSlug = (lessonId: string) => lessonId.toLowerCase();

export const LESSON_LOADERS: Record<string, () => Promise<StageLesson>> = {
  'w1-l0': () => import('./w1-l0').then((m) => m.W1_L0),
};
