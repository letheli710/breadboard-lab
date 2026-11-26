import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { ActBlock } from '../../types';
import lesson from './index';

const TOKEN = /\[\[([a-z0-9_,-]+)\|(.+?)\]\]|\$([^$]+)\$/g;

/** every inline-markup string and every display formula of the lesson */
function collect(): { text: string[]; tex: string[] } {
  const text: string[] = [];
  const tex: string[] = [];
  const block = (b: ActBlock) => {
    switch (b.kind) {
      case 'p':
        text.push(b.text);
        break;
      case 'ol':
      case 'ul':
        text.push(...b.items);
        break;
      case 'origin':
        text.push(b.title, b.text);
        break;
      case 'formula':
        text.push(b.title);
        tex.push(b.tex);
        break;
      case 'calc':
        text.push(b.title);
        for (const s of b.steps) {
          text.push(s.label);
          if (s.text) text.push(s.text);
          if (s.tex) tex.push(s.tex);
        }
        break;
      case 'note':
        text.push(b.text);
        break;
      case 'table':
        text.push(...b.head, ...b.rows.flat());
        if (b.caption) text.push(b.caption);
        break;
      case 'guided':
        text.push(b.title, b.problem);
        if (b.conclusion) text.push(b.conclusion);
        for (const s of b.steps) {
          text.push(s.title, s.question, s.hint, ...s.options.flatMap((o) => [o.text, o.feedback]));
          tex.push(...s.board);
        }
        break;
      default:
        break;
    }
  };
  for (const a of lesson.right_acts) {
    text.push(a.title);
    a.blocks.forEach(block);
    a.after_quiz?.forEach(block);
    for (const q of a.quiz ?? []) text.push(q.question, q.feedback_correct, q.feedback_wrong, ...q.options.flatMap((o) => [o.text, o.feedback ?? '']));
  }
  return { text, tex };
}

describe('W3-L4 lesson data', () => {
  const { text, tex } = collect();

  it('every formula renders in KaTeX', () => {
    const all = [...tex];
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[3]) all.push(m[3]);
    expect(all.length).toBeGreaterThan(100);
    for (const t of all) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });

  it('every linked term names a stage object', () => {
    const known = new Set(Object.keys(lesson.left_stage_spec.hover_map));
    for (const t of text)
      for (const m of t.matchAll(TOKEN)) if (m[1]) for (const id of m[1].split(',')) expect(known.has(id) || lesson.describeTarget?.(id) != null, id).toBe(true);
  });

  it('every layer has a renderer and every sync names a layer', () => {
    const ids = lesson.left_stage_spec.layers.map((l) => l.id);
    for (const id of ids) expect(lesson.renderers[id]).toBeDefined();
    for (const a of lesson.right_acts) expect(ids).toContain(a.sync.layer);
  });

  it('quiz: one right answer each, every wrong option has its own feedback, right answers not always in one place', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    const pos = quiz.map((q) => {
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback?.length ?? 0).toBeGreaterThan(20);
      expect(q.figure).toBeTruthy();
      return q.options.findIndex((o) => o.correct);
    });
    expect(new Set(pos).size).toBeGreaterThan(2);
  });

  it('anti-spoiler: act 4 shows no Example 5.5 answer before the guided block', () => {
    const act = lesson.right_acts.find((a) => a.act_index === 4)!;
    const g = act.blocks.findIndex((b) => b.kind === 'guided');
    expect(g).toBeGreaterThan(0);
    const before = JSON.stringify(act.blocks.slice(0, g));
    for (const answer of ['-1\\text{ V}', '0.5\\text{ mA}', 'v_- = 4', 'v_− = 4 V', '−1 V']) expect(before.includes(answer), answer).toBe(false);
    expect(act.blocks.slice(g + 1).some((b) => b.kind === 'calc')).toBe(true);
  });
});
