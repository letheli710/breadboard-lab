// World 1's lessons carry the site-wide upgrade fields: learning objectives, short lens labels,
// and a concept + review act on every quiz question.

import { describe, expect, it } from 'vitest';
import { LESSON_LOADERS } from '..';

const SLUGS = ['w1-l0', 'w1-l1', 'w1-l2', 'w1-l3', 'w1-l4', 'w1-l5', 'w1-l6', 'w1-l7', 'w1-l8'];

describe('World 1 upgrade fields', () => {
  for (const slug of SLUGS) {
    it(`${slug}: objectives, short layer labels, quiz concepts and review acts`, async () => {
      const l = await LESSON_LOADERS[slug]();
      expect(l.lesson_meta.learning_objectives?.length ?? 0).toBeGreaterThanOrEqual(2);
      for (const layer of l.left_stage_spec.layers) {
        expect(layer.short, layer.id).toBeTruthy();
        expect([...layer.short!].length, layer.id).toBeLessThanOrEqual(12);
      }
      const acts = new Set(l.right_acts.map((a) => a.act_index));
      const quiz = l.right_acts.flatMap((a) => a.quiz ?? []);
      expect(quiz.length).toBeGreaterThan(0);
      for (const q of quiz) {
        expect(q.concept, q.id).toBeTruthy();
        expect(acts.has(q.review_act!), q.id).toBe(true);
      }
    });
  }
});
