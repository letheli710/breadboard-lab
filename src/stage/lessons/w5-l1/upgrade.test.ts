// World 5 · the site-wide upgrade fields: learning objectives, short lens labels, and the quiz's
// concept / review_act (mistake radar and 回到第 N 幕 buttons), for every lesson of the World.

import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { StageLesson } from '../../types';
import w5l1 from './index';
import w5l2 from '../w5-l2/index';
import w5l3 from '../w5-l3/index';
import w5l4 from '../w5-l4/index';
import w5l5 from '../w5-l5/index';
import w5l6 from '../w5-l6/index';
import w5l7 from '../w5-l7/index';
import w5l8 from '../w5-l8/index';
import w5l9 from '../w5-l9/index';

const LESSONS: StageLesson[] = [w5l1, w5l2, w5l3, w5l4, w5l5, w5l6, w5l7, w5l8, w5l9];

/** every $…$ of an inline string parses in KaTeX */
function texOk(s: string) {
  for (const m of s.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), m[1]).not.toThrow();
  expect(s.split('$').length % 2, s).toBe(1);
}

describe.each(LESSONS.map((l) => [l.lesson_meta.lesson_id, l] as const))('%s upgrade fields', (_id, l) => {
  it('has two or more learning objectives', () => {
    const goals = l.lesson_meta.learning_objectives ?? [];
    expect(goals.length).toBeGreaterThanOrEqual(2);
    for (const g of goals) {
      expect(g.trim().length).toBeGreaterThan(0);
      texOk(g);
    }
  });

  it('gives every layer a short label of 12 characters or fewer, starting with its number', () => {
    for (const layer of l.left_stage_spec.layers) {
      expect(layer.short, layer.id).toBeTruthy();
      expect([...layer.short!].length, layer.short).toBeLessThanOrEqual(12);
      expect(layer.short!.slice(0, 3), layer.short).toBe(layer.label.slice(0, 3));
    }
  });

  it('tags every quiz item with a concept and a review act that exists', () => {
    const acts = new Set(l.right_acts.map((a) => a.act_index));
    const items = l.right_acts.flatMap((a) => (a.quiz ?? []).map((q) => ({ q, at: a.act_index })));
    expect(items.length).toBeGreaterThan(0);
    for (const { q } of items) {
      expect(q.concept, q.id).toBeTruthy();
      texOk(q.concept!);
      expect(q.review_act, q.id).toBeDefined();
      expect(acts.has(q.review_act!), `${q.id} → act ${q.review_act}`).toBe(true);
    }
    // 3–4 distinct concepts: the radar draws a polygon from 3 spokes up
    const concepts = new Set(items.map(({ q }) => q.concept));
    expect(concepts.size).toBeGreaterThanOrEqual(3);
  });
});
