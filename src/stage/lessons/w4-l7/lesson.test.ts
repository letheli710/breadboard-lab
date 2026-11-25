import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { STAGE_LESSON_ENTRY } from '../../registry';
import type { ActBlock, GuidedBlock } from '../../types';
import lesson from './index';

const TOKEN = /\[\[([a-z0-9_,-]+)\|(.+?)\]\]|\$([^$]+)\$/g;

/** every inline-markup string and every display formula of the lesson */
function collect(): { text: string[]; tex: string[] } {
  const text: string[] = [];
  const tex: string[] = [];
  const block = (b: ActBlock) => {
    switch (b.kind) {
      case 'p':
      case 'note':
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

const guidedAct = () => lesson.right_acts.find((a) => a.blocks.some((b) => b.kind === 'guided'))!;
const guided = () => guidedAct().blocks.find((b): b is GuidedBlock => b.kind === 'guided')!;

describe('W4-L7 lesson data', () => {
  const { text, tex } = collect();

  it('matches the registry entry', () => {
    const e = STAGE_LESSON_ENTRY.get('w4-l7')!;
    expect(lesson.lesson_meta.lesson_id).toBe(e.code);
    expect(lesson.lesson_meta.title).toBe(e.title.zh);
    expect(lesson.lesson_meta.estimated_minutes).toBe(e.minutes);
    expect(lesson.lesson_meta.world).toBe('World 4');
  });

  it('every formula renders in KaTeX', () => {
    const all = [...tex];
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[3]) all.push(m[3]);
    expect(all.length).toBeGreaterThan(150);
    for (const t of all) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });

  it('every linked term and every halo names a stage object', () => {
    const known = new Set(Object.keys(lesson.left_stage_spec.hover_map));
    for (const t of text)
      for (const m of t.matchAll(TOKEN)) if (m[1]) for (const id of m[1].split(',')) expect(known.has(id) || lesson.describeTarget?.(id) != null, id).toBe(true);
    const halos = lesson.right_acts.flatMap((a) => [
      ...(a.sync.halo ?? []),
      ...a.blocks.flatMap((b) => (b.kind === 'guided' ? b.steps.flatMap((s) => s.halo ?? []) : [])),
      ...(a.quiz ?? []).flatMap((q) => q.sync?.halo ?? []),
    ]);
    for (const id of halos) expect(known.has(id), id).toBe(true);
  });

  it('every layer has a renderer and every sync names a layer', () => {
    const ids = lesson.left_stage_spec.layers.map((l) => l.id);
    for (const id of ids) expect(lesson.renderers[id]).toBeDefined();
    for (const a of lesson.right_acts) expect(ids).toContain(a.sync.layer);
    for (const s of guided().steps) if (s.layer) expect(ids).toContain(s.layer);
    for (const q of lesson.right_acts.flatMap((a) => a.quiz ?? [])) if (q.sync?.layer) expect(ids).toContain(q.sync.layer);
  });

  it('every act has a local diagram', () => {
    for (const a of lesson.right_acts) {
      const has = !!a.inline_svg || a.blocks.some((b) => b.kind === 'figure' || (b.kind === 'guided' && !!b.problem_svg));
      expect(has, a.title).toBe(true);
    }
  });

  it('quiz: one right answer each, every wrong option has its own feedback, right answers not always in one place', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    const pos = quiz.map((q) => {
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback?.length ?? 0, `${q.id} ${o.key}`).toBeGreaterThan(20);
      expect(q.figure).toBeTruthy();
      return q.options.findIndex((o) => o.correct);
    });
    expect(new Set(pos).size).toBe(4);
  });

  it('the guided example: every step one right option, every option a feedback, right answers spread out', () => {
    const g = guided();
    expect(g.steps).toHaveLength(5);
    const pos = g.steps.map((s) => {
      expect(s.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(10);
      expect(s.board.length).toBeGreaterThan(0);
      return s.options.findIndex((o) => o.correct);
    });
    expect(new Set(pos).size).toBeGreaterThan(1);
    expect(g.done_params).toEqual({ reveal: 9 });
  });

  it('anti-spoiler: no guided answer appears before the guided block', () => {
    const act = guidedAct();
    const gi = lesson.right_acts.indexOf(act);
    const before = JSON.stringify([
      ...lesson.right_acts.slice(0, gi),
      {
        ...act,
        blocks: act.blocks.slice(
          0,
          act.blocks.findIndex((b) => b.kind === 'guided'),
        ),
      },
    ]);
    for (const answer of ['80 Np', '80\\\\text{ Np', 'j60', 'e^{-80t}', 'e^(-80t)', '3000', '-30', '−30', '15\\\\cos 60t', '60 rad', '0.75 A'])
      expect(before.includes(answer), answer).toBe(false);
  });

  it("anti-spoiler: a step's diagram does not print that step's answer", () => {
    const [s1, s2, s3, s4, s5] = guided().steps.map((s) => (s.mini_svg ?? '').replace(/<[^>]+>/g, ' '));
    expect(s1).not.toMatch(/80|100 rad|欠阻尼/);
    expect(s2).not.toMatch(/j60|60/);
    expect(s3).not.toMatch(/B₁ = 15|= 15 V/);
    expect(s4).not.toMatch(/0\.75|0\.60|3000 V\/s = /);
    expect(s5).not.toMatch(/B₂ = [-−]30(?!0)|1800/);
  });

  it('the bench supply is named with its voltage, and there is no battery', () => {
    const all = JSON.stringify(lesson);
    expect(all).toContain('台式可调直流电源（5 V）');
    expect(all).not.toMatch(/电池|battery/i);
    expect(lesson.left_stage_spec.hover_map.bb_psu.label).toBe('台式可调直流电源（5 V）');
  });

  it('shows no developer field names to students', () => {
    const all = text.join('\n');
    for (const f of ['breadboard_safety_and_scaling', 'Claude', 'passing_score', 'professor_intercept', 'board_append', 'rlcSolver']) expect(all.includes(f), f).toBe(false);
  });
});
