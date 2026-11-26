// Stage lesson files by slug, each its own lazy chunk (the registry, ../registry.ts, carries what
// the rest of the app needs without them). A lesson is the default export of
// src/stage/lessons/<slug>/index.ts.

import type { StageLesson } from '../types';

export const lessonSlug = (lessonId: string) => lessonId.toLowerCase();

export const LESSON_LOADERS: Record<string, () => Promise<StageLesson>> = {
  'w1-l0': () => import('./w1-l0').then((m) => m.default),
  'w1-l1': () => import('./w1-l1').then((m) => m.default),
  'w1-l2': () => import('./w1-l2').then((m) => m.default),
  'w1-l3': () => import('./w1-l3').then((m) => m.default),
  'w1-l4': () => import('./w1-l4').then((m) => m.default),
  'w1-l5': () => import('./w1-l5').then((m) => m.default),
  'w1-l6': () => import('./w1-l6').then((m) => m.default),
  'w1-l7': () => import('./w1-l7').then((m) => m.default),
  'w1-l8': () => import('./w1-l8').then((m) => m.default),
  'w2-l1': () => import('./w2-l1').then((m) => m.default),
  'w2-l2': () => import('./w2-l2').then((m) => m.default),
  'w2-l3': () => import('./w2-l3').then((m) => m.default),
  'w2-l4': () => import('./w2-l4').then((m) => m.default),
  'w2-l5': () => import('./w2-l5').then((m) => m.default),
  'w2-l6': () => import('./w2-l6').then((m) => m.default),
  'w2-l7': () => import('./w2-l7').then((m) => m.default),
  'w2-l8': () => import('./w2-l8').then((m) => m.default),
  'w3-l1': () => import('./w3-l1').then((m) => m.default),
  'w3-l2': () => import('./w3-l2').then((m) => m.default),
  'w3-l3': () => import('./w3-l3').then((m) => m.default),
  'w3-l4': () => import('./w3-l4').then((m) => m.default),
  'w3-l5': () => import('./w3-l5').then((m) => m.default),
  'w3-l6': () => import('./w3-l6').then((m) => m.default),
  'w3-l7': () => import('./w3-l7').then((m) => m.default),
  'w3-l8': () => import('./w3-l8').then((m) => m.default),
  'w4-l1': () => import('./w4-l1').then((m) => m.default),
  'w4-l2': () => import('./w4-l2').then((m) => m.default),
  'w4-l3': () => import('./w4-l3').then((m) => m.default),
  'w4-l4': () => import('./w4-l4').then((m) => m.default),
  'w4-l5': () => import('./w4-l5').then((m) => m.default),
  'w4-l6': () => import('./w4-l6').then((m) => m.default),
  'w4-l7': () => import('./w4-l7').then((m) => m.default),
  'w4-l8': () => import('./w4-l8').then((m) => m.default),
  'w5-l1': () => import('./w5-l1').then((m) => m.default),
  'w5-l2': () => import('./w5-l2').then((m) => m.default),
  'w5-l3': () => import('./w5-l3').then((m) => m.default),
  'w5-l4': () => import('./w5-l4').then((m) => m.default),
  'w5-l5': () => import('./w5-l5').then((m) => m.default),
  'w5-l6': () => import('./w5-l6').then((m) => m.default),
  'w5-l7': () => import('./w5-l7').then((m) => m.default),
  'w5-l8': () => import('./w5-l8').then((m) => m.default),
  'w5-l9': () => import('./w5-l9').then((m) => m.default),
};
