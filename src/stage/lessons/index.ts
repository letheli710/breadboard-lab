// Stage lessons by URL id (#/lesson/<id>): the lesson id in lower case ("W1-L0" → "w1-l0").

import type { StageLesson } from '../types';
import { W1_L0 } from './w1-l0';

export const STAGE_LESSONS: StageLesson[] = [W1_L0];

export const lessonSlug = (lessonId: string) => lessonId.toLowerCase();

export const STAGE_LESSON_BY_SLUG = new Map(STAGE_LESSONS.map((l) => [lessonSlug(l.lesson_meta.lesson_id), l]));
