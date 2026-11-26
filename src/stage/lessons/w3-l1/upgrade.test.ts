// World 3 upgrade fields: learning objectives, short lens labels, quiz concepts and review acts.
import { describe, expect, it } from 'vitest';
import type { StageLesson } from '../../types';
import l1 from './index';
import l2 from '../w3-l2/index';
import l3 from '../w3-l3/index';
import l4 from '../w3-l4/index';
import l5 from '../w3-l5/index';
import l6 from '../w3-l6/index';
import l7 from '../w3-l7/index';
import l8 from '../w3-l8/index';

const lessons: StageLesson[] = [l1, l2, l3, l4, l5, l6, l7, l8];

describe('World 3 upgrade data', () => {
  it.each(lessons.map((l) => [l.lesson_meta.lesson_id, l] as const))('%s', (_id, lesson) => {
    expect(lesson.lesson_meta.learning_objectives?.length ?? 0).toBeGreaterThanOrEqual(2);

    for (const layer of lesson.left_stage_spec.layers) {
      expect(layer.short, layer.id).toBeTruthy();
      expect([...layer.short!].length, layer.short).toBeLessThanOrEqual(12);
    }

    const acts = new Set(lesson.right_acts.map((a) => a.act_index));
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz.length).toBeGreaterThan(0);
    for (const q of quiz) {
      expect(q.concept, q.id).toBeTruthy();
      expect(acts.has(q.review_act!), `${q.id} → act ${q.review_act}`).toBe(true);
    }
  });
});
