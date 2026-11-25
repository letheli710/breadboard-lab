import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { ActBlock, GuidedBlock } from '../../types';
import lesson from './index';
import { SUPPLY_NAME } from './model';

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

const act5 = lesson.right_acts.find((a) => a.act_index === 5)!;
const gIndex = act5.blocks.findIndex((b) => b.kind === 'guided');
const guided = act5.blocks[gIndex] as GuidedBlock;

describe('W4-L4 lesson data', () => {
  const { text, tex } = collect();

  it('keeps the registry fields and has six acts', () => {
    expect(lesson.lesson_meta.lesson_id).toBe('W4-L4');
    expect(lesson.lesson_meta.world).toBe('World 4');
    expect(lesson.lesson_meta.estimated_minutes).toBe(45);
    expect(lesson.right_acts.map((a) => a.act_index)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('every formula renders in KaTeX', () => {
    const all = [...tex];
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[3]) all.push(m[3]);
    expect(all.length).toBeGreaterThan(150);
    for (const t of all) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });

  it('every linked term and every halo names a stage object', () => {
    const known = (id: string) => id in lesson.left_stage_spec.hover_map || lesson.describeTarget?.(id) != null;
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[1]) for (const id of m[1].split(',')) expect(known(id), id).toBe(true);
    const halos = [
      ...lesson.right_acts.flatMap((a) => a.sync.halo ?? []),
      ...guided.steps.flatMap((s) => s.halo ?? []),
      ...lesson.right_acts.flatMap((a) => (a.quiz ?? []).flatMap((q) => q.sync?.halo ?? [])),
    ];
    for (const id of halos) expect(known(id), id).toBe(true);
  });

  it('every layer has a renderer, every sync names a layer, every act has a diagram', () => {
    const ids = lesson.left_stage_spec.layers.map((l) => l.id);
    for (const id of ids) expect(lesson.renderers[id]).toBeDefined();
    for (const a of lesson.right_acts) {
      expect(ids).toContain(a.sync.layer);
      expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure'), `act ${a.act_index}`).toBe(true);
    }
    for (const s of guided.steps) if (s.layer) expect(ids).toContain(s.layer);
  });

  it('guided example: five steps of three options, one right, every option with feedback, the right one moving', () => {
    expect(guided.steps).toHaveLength(5);
    const pos = guided.steps.map((s) => {
      expect(s.options).toHaveLength(3);
      expect(s.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(15);
      expect(s.board.length).toBeGreaterThan(0);
      return s.options.findIndex((o) => o.correct);
    });
    expect(new Set(pos).size).toBe(3);
  });

  it('quiz: one right answer each, every wrong option has its own feedback and a figure, right answers not in one place', () => {
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

  it('anti-spoiler: act 5 shows no answer of its example before the guided block, and the ③ board follows it', () => {
    expect(gIndex).toBeGreaterThan(0);
    const before = JSON.stringify(act5.blocks.slice(0, gIndex));
    for (const answer of [
      '4.5',
      '0.9',
      '3.6',
      '2.7',
      '0.6\\text{ J}',
      '0.3\\text{ J}',
      '4 e^',
      '4e^',
      'A (12V)',
      'B (6V)',
      '12\\text{ V}',
      '= 6\\text{ V}',
      '18∥6',
      '= 18',
      'C 视为开路',
    ]) {
      expect(before.includes(answer), answer).toBe(false);
    }
    const after = act5.blocks.slice(gIndex + 1);
    expect(after.some((b) => b.kind === 'calc' && b.title.startsWith('③'))).toBe(true);
    // no ③ card of the example before the guided block
    expect(act5.blocks.slice(0, gIndex).some((b) => b.kind === 'calc')).toBe(false);
  });

  it('anti-spoiler: no step diagram prints its own step answer; the stage hides the example until it is done', () => {
    const [m1, m2, m3, m4, m5] = guided.steps.map((s) => s.mini_svg ?? '');
    expect(m1).not.toMatch(/6 V|12 V|等效为开路/);
    expect(m2).not.toMatch(/→ 6 V|→ 4 V|连续守恒|允许跳变/);
    expect(m3).not.toMatch(/4\.5|R2 \+ R3|18Ω/);
    expect(m4).not.toMatch(/4e\^|4 e\^/);
    expect(m5).not.toMatch(/2\.7|0\.6|0\.3 J|75%|3\.6/);
    // the stage: act 5 starts hidden, each step uncovers only what was solved before it
    expect(act5.sync.params?.reveal).toBe(0);
    expect(guided.steps.map((s) => s.params?.reveal)).toEqual([0, 1, 2, 3, 4]);
    expect(guided.done_params).toEqual({ reveal: 9 });
    for (const a of lesson.right_acts) if (a.act_index < 5) expect(a.sync.params?.reveal, `act ${a.act_index}`).toBeUndefined();
  });

  it('lab supply: the 台式可调直流电源（5 V）, never a battery', () => {
    const all = JSON.stringify(lesson.right_acts) + JSON.stringify(lesson.left_stage_spec);
    expect(all.includes(SUPPLY_NAME)).toBe(true);
    expect(SUPPLY_NAME).toBe('台式可调直流电源（5 V）');
    expect(/电池|battery|9 V 电池/i.test(all)).toBe(false);
  });

  it('no developer-facing field names in what students see', () => {
    const all = JSON.stringify(lesson.right_acts) + JSON.stringify(lesson.left_stage_spec.hover_map);
    for (const s of ['breadboard_safety', 'THREEJS', 'Claude', 'professor_intercept', 'expected_answer', 'passing_score']) expect(all.includes(s), s).toBe(false);
  });
});
