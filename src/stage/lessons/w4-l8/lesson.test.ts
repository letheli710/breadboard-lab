import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { ActBlock } from '../../types';
import lesson from './index';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_PAR_PROBLEM, SVG_R_ROLE } from './svgs';

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

const known = (id: string) => id in lesson.left_stage_spec.hover_map || lesson.describeTarget?.(id) != null;

describe('W4-L8 lesson data', () => {
  const { text, tex } = collect();

  it('every formula renders in KaTeX', () => {
    const all = [...tex];
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[3]) all.push(m[3]);
    expect(all.length).toBeGreaterThan(150);
    for (const t of all) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });

  it('no raw TeX outside $…$ (an odd number of $ would leak "\\frac" onto the page)', () => {
    for (const t of text) expect((t.match(/\$/g) ?? []).length % 2, t).toBe(0);
    for (const t of text) expect(t.replace(TOKEN, ''), t).not.toMatch(/\\(frac|text|alpha|omega)/);
  });

  it('every linked term and every halo id names a stage object', () => {
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[1]) for (const id of m[1].split(',')) expect(known(id), id).toBe(true);
    for (const a of lesson.right_acts) {
      for (const id of a.sync.halo ?? []) expect(known(id), id).toBe(true);
      for (const q of a.quiz ?? []) for (const id of q.sync?.halo ?? []) expect(known(id), id).toBe(true);
      for (const b of a.blocks) if (b.kind === 'guided') for (const s of b.steps) for (const id of s.halo ?? []) expect(known(id), id).toBe(true);
    }
  });

  it('every layer has a renderer, every sync names a layer, every act has a diagram', () => {
    const ids = lesson.left_stage_spec.layers.map((l) => l.id);
    for (const id of ids) expect(lesson.renderers[id]).toBeDefined();
    for (const a of lesson.right_acts) {
      expect(ids).toContain(a.sync.layer);
      expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure' || (b.kind === 'guided' && !!b.problem_svg)), `act ${a.act_index}`).toBe(true);
    }
    expect(lesson.right_acts.map((a) => a.act_index)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('the bench names its instruments and never a battery', () => {
    const all = JSON.stringify(lesson);
    expect(all).not.toMatch(/电池|9 V 电池|battery/i);
    expect(all).toContain('函数信号发生器');
    expect(all).toContain('台式可调直流电源（5 V）');
    expect(all).not.toContain('breadboard_safety_and_scaling');
    expect(all).not.toMatch(/Claude|JSON/);
  });

  it('quiz: one right answer each, every wrong option has its own feedback, a figure, right answers spread out', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    const pos = quiz.map((q) => {
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback?.length ?? 0).toBeGreaterThan(20);
      expect(q.figure).toBeTruthy();
      return q.options.findIndex((o) => o.correct);
    });
    expect(new Set(pos).size).toBeGreaterThan(2);
    expect(lesson.right_acts.at(-1)!.after_quiz?.length).toBeGreaterThan(0);
  });

  it('anti-spoiler: nothing before the guided block, its step diagrams or its problem figure gives its answers', () => {
    const act = lesson.right_acts.find((a) => a.act_index === 3)!;
    const g = act.blocks.findIndex((b) => b.kind === 'guided');
    expect(g).toBeGreaterThan(0);
    const guided = act.blocks[g];
    if (guided.kind !== 'guided') throw new Error('no guided block');
    // everything shown before (or while) the student answers: earlier acts, act 3 up to the guided
    // block, the problem, the problem figure and every step's diagram and question
    const before = [
      JSON.stringify(lesson.right_acts.filter((a) => a.act_index < 3).map((a) => [a.blocks, a.inline_svg])),
      JSON.stringify(act.blocks.slice(0, g)),
      guided.problem,
      SVG_PAR_PROBLEM,
      SVG_R_ROLE,
      ...[MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5],
      ...guided.steps.map((s) => s.question),
    ].join('\n');
    for (const answer of [
      '临界阻尼阶跃实战',
      '30t',
      '300 t',
      '300t',
      '22.07',
      'D_1 = -6',
      'D_1 = −6',
      'D_2 = -30',
      '= -30',
      'i_L(∞) = 6',
      'i_L(inf) = 6',
      'α = 5',
      'alpha = 5',
      '= 5 -&gt;',
    ])
      expect(before.includes(answer), answer).toBe(false);
    // each step's diagram asks (has a "?") instead of printing the answer
    for (const m of [MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5]) expect(m).toContain('?');
    // the stage starts hidden and is uncovered step by step, then all at once
    expect(guided.steps.map((s) => s.params?.pReveal)).toEqual([0, 1, 2, 3, 4]);
    expect(guided.done_params).toEqual({ pReveal: 9 });
    // the right options of the five steps: A, B, B, A, B (as in the sheet)
    expect(guided.steps.map((s) => s.options.findIndex((o) => o.correct))).toEqual([0, 1, 1, 0, 1]);
    for (const s of guided.steps) for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(10);
  });

  it('the light-theme figures: no dark canvas left', () => {
    const svgs = lesson.right_acts.flatMap((a) => [
      a.inline_svg ?? '',
      ...a.blocks.map((b) => (b.kind === 'figure' ? b.svg : b.kind === 'guided' ? (b.problem_svg ?? '') + b.steps.map((s) => s.mini_svg).join('') : '')),
      ...(a.quiz ?? []).map((q) => q.figure ?? ''),
    ]);
    for (const s of svgs) expect(s).not.toMatch(/background:#0f172a/);
  });
});
