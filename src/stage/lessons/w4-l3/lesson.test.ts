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
      case 'figure':
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

describe('W4-L3 lesson data', () => {
  const { text, tex } = collect();

  it('keeps the registry metadata', () => {
    expect(lesson.lesson_meta.lesson_id).toBe('W4-L3');
    expect(lesson.lesson_meta.world).toBe('World 4');
    expect(lesson.lesson_meta.estimated_minutes).toBe(45);
    expect(lesson.lesson_meta.title).toBe('运放积分器与微分器：用虚地把波形送进微积分流水线');
  });

  it('every formula renders in KaTeX', () => {
    const all = [...tex];
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[3]) all.push(m[3]);
    expect(all.length).toBeGreaterThan(100);
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
    for (const a of lesson.right_acts) for (const b of a.blocks) if (b.kind === 'guided') for (const s of b.steps) if (s.layer) expect(ids).toContain(s.layer);
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

  it('anti-spoiler: nothing before the guided block shows the 250 Hz example’s answers; its ③ comes after', () => {
    const act = lesson.right_acts.find((a) => a.act_index === 2)!;
    const g = act.blocks.findIndex((b) => b.kind === 'guided');
    expect(g).toBeGreaterThan(0);
    const before = JSON.stringify([...lesson.right_acts.filter((a) => a.act_index < 2), { ...act, blocks: act.blocks.slice(0, g) }]);
    for (const answer of ['-6.0', '−6.0', '-3.0\\\\text{ V/ms}', '−3.0 V/ms', 'v_o(4', '-10.0', '-10\\\\text', '−10 V', '1.78', '15.92', 'V_{pp,\\\\text{out}} = 6'])
      expect(before.includes(answer), answer).toBe(false);
    const after = act.blocks.slice(g + 1);
    expect(after.some((b) => b.kind === 'calc' && JSON.stringify(b).includes('-6.0'))).toBe(true);
    const guided = act.blocks[g];
    expect(guided.kind === 'guided' && guided.done_params).toEqual({ g: 9, exAmp: 3 });
  });

  it('anti-spoiler: no mini diagram draws its own step’s answer', () => {
    const act = lesson.right_acts.find((a) => a.act_index === 2)!;
    const guided = act.blocks.find((b) => b.kind === 'guided');
    if (guided?.kind !== 'guided') throw new Error('no guided block');
    const [m1, m2, m3, m4] = guided.steps.map((s) => s.mini_svg ?? '');
    expect(m1).not.toMatch(/1\.0 ?ms/);
    expect(m2).not.toMatch(/-6|−6|-3\.0 ?V\/ms/);
    expect(m3).not.toMatch(/256,22|6\.0 ?V ?pp/);
    expect(m4).not.toMatch(/10\.0V|-10|−10/);
  });

  it('the lab supply is the bench supply, never a battery', () => {
    const all = JSON.stringify(lesson.right_acts) + JSON.stringify(lesson.left_stage_spec);
    expect(all).not.toMatch(/电池/);
    expect(all).toContain('台式可调直流电源（±9 V）');
  });
});
