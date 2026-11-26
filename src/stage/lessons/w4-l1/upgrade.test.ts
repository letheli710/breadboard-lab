// World 4 upgrade fields: learning objectives, short lens labels, quiz concept / review_act.
import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { StageLesson } from '../../types';
import l1 from './index';
import l2 from '../w4-l2/index';
import l3 from '../w4-l3/index';
import l4 from '../w4-l4/index';
import l5 from '../w4-l5/index';
import l6 from '../w4-l6/index';
import l7 from '../w4-l7/index';
import l8 from '../w4-l8/index';

const LESSONS: StageLesson[] = [l1, l2, l3, l4, l5, l6, l7, l8];

describe.each(LESSONS.map((l) => [l.lesson_meta.lesson_id, l] as const))('%s upgrade fields', (_id, lesson) => {
  it('has 2 or more learning objectives, and their TeX renders', () => {
    const objs = lesson.lesson_meta.learning_objectives ?? [];
    expect(objs.length).toBeGreaterThanOrEqual(2);
    for (const o of objs) {
      expect(o.trim()).not.toBe('');
      for (const m of o.matchAll(/\$([^$]+)\$/g)) {
        expect(() => katex.renderToString(m[1], { throwOnError: true }), m[1]).not.toThrow();
      }
    }
  });

  it('gives every layer a short label of 12 characters or fewer', () => {
    for (const layer of lesson.left_stage_spec.layers) {
      expect(layer.short, layer.id).toBeTruthy();
      expect([...layer.short!].length, layer.short).toBeLessThanOrEqual(12);
      expect(layer.short!.slice(0, 2)).toBe(layer.label.slice(0, 2));
    }
  });

  it('gives every quiz item a concept and a review_act naming an existing act', () => {
    const acts = new Set(lesson.right_acts.map((a) => a.act_index));
    const items = lesson.right_acts.flatMap((a) => (a.quiz ?? []).map((q) => ({ q, host: a.act_index })));
    expect(items.length).toBeGreaterThan(0);
    for (const { q, host } of items) {
      expect(q.concept, q.id).toBeTruthy();
      expect(q.review_act, q.id).toBeDefined();
      expect(acts.has(q.review_act!), `${q.id} → ${q.review_act}`).toBe(true);
      expect(q.review_act, `${q.id} points at its own quiz act`).not.toBe(host);
    }
    expect(new Set(items.map(({ q }) => q.concept)).size).toBeGreaterThanOrEqual(3);
  });
});
