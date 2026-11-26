// World 2 site-wide upgrade: every lesson has learning objectives, a short lens name for each
// layer, and a concept and a review act for each quiz question.

import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { StageLesson } from '../../types';
import w2l1 from './index';
import w2l2 from '../w2-l2/index';
import w2l3 from '../w2-l3/index';
import w2l4 from '../w2-l4/index';
import w2l5 from '../w2-l5/index';
import w2l6 from '../w2-l6/index';
import w2l7 from '../w2-l7/index';
import w2l8 from '../w2-l8/index';

const LESSONS: Record<string, StageLesson> = {
  'w2-l1': w2l1,
  'w2-l2': w2l2,
  'w2-l3': w2l3,
  'w2-l4': w2l4,
  'w2-l5': w2l5,
  'w2-l6': w2l6,
  'w2-l7': w2l7,
  'w2-l8': w2l8,
};

/** the $TeX$ pieces of an inline-markup string render without errors */
function texOk(s: string) {
  for (const m of s.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), `${s}: ${m[1]}`).not.toThrow();
}

describe.each(Object.entries(LESSONS))('%s upgrade fields', (_slug, lesson) => {
  it('has two or more learning objectives', () => {
    const goals = lesson.lesson_meta.learning_objectives ?? [];
    expect(goals.length).toBeGreaterThanOrEqual(2);
    for (const g of goals) {
      expect(g.trim()).not.toBe('');
      texOk(g);
    }
  });

  it('gives every layer a short lens name of 12 characters or fewer', () => {
    for (const l of lesson.left_stage_spec.layers) {
      expect(l.short, l.id).toBeTruthy();
      expect([...l.short!].length, l.short).toBeLessThanOrEqual(12);
      expect(l.short!.slice(0, 2), l.short).toBe(l.label.slice(0, 2));
    }
  });

  it('gives every quiz item a concept and a review act that exists', () => {
    const acts = new Set(lesson.right_acts.map((a) => a.act_index));
    const items = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(items.length).toBeGreaterThan(0);
    for (const q of items) {
      expect(q.concept, q.id).toBeTruthy();
      texOk(q.concept!);
      expect(q.review_act, q.id).toBeDefined();
      expect(acts.has(q.review_act!), `${q.id} → act ${q.review_act}`).toBe(true);
    }
    const concepts = new Set(items.map((q) => q.concept));
    expect(concepts.size).toBeGreaterThanOrEqual(3);
  });
});
