import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { ActBlock } from '../../types';
import lesson from './index';
import { SVG_PREVIEW, SVG_PREVIEW_MASKED } from './sheetSvgs';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5 } from './svgs';

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

describe('W5-L9 lesson data', () => {
  const { text, tex } = collect();

  it('keeps the registry metadata', () => {
    const m = lesson.lesson_meta;
    expect([m.lesson_id, m.world, m.title, m.estimated_minutes]).toEqual(['W5-L9', 'World 5', '无源与有源滤波器（Phase 1 收官实战 + 3D 面包板扫频）', 55]);
    // the sheet names no next lesson (Phase 2 is a preview, not a stage lesson)
    expect(m.next_lesson).toBeUndefined();
  });

  it('every formula renders in KaTeX', () => {
    const all = [...tex];
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[3]) all.push(m[3]);
    expect(all.length).toBeGreaterThan(200);
    for (const t of all) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });

  it('no raw TeX outside $…$ (an odd number of $ would leak "\\frac" onto the page)', () => {
    for (const t of text) expect((t.match(/\$/g) ?? []).length % 2, t).toBe(0);
    for (const t of text) expect(t.replace(TOKEN, ''), t).not.toMatch(/\\(frac|text|omega|mathbf|pm)/);
  });

  it('every linked term and every halo id names a stage object', () => {
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[1]) for (const id of m[1].split(',')) expect(known(id), id).toBe(true);
    for (const a of lesson.right_acts) {
      for (const id of a.sync.halo ?? []) expect(known(id), id).toBe(true);
      for (const q of a.quiz ?? []) for (const id of q.sync?.halo ?? []) expect(known(id), id).toBe(true);
      for (const b of a.blocks) if (b.kind === 'guided') for (const s of b.steps) for (const id of s.halo ?? []) expect(known(id), id).toBe(true);
    }
  });

  it('every layer has a renderer and a short label, every sync names a layer, every act has a diagram', () => {
    const ids = lesson.left_stage_spec.layers.map((l) => l.id);
    for (const l of lesson.left_stage_spec.layers) {
      expect(lesson.renderers[l.id]).toBeDefined();
      expect(l.label.length).toBeLessThanOrEqual(14);
    }
    for (const a of lesson.right_acts) {
      expect(ids).toContain(a.sync.layer);
      for (const q of a.quiz ?? []) if (q.sync?.layer) expect(ids).toContain(q.sync.layer);
      for (const b of a.blocks) if (b.kind === 'guided') for (const s of b.steps) if (s.layer) expect(ids).toContain(s.layer);
      expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure' || (b.kind === 'guided' && !!b.problem_svg)), `act ${a.act_index}`).toBe(true);
    }
    expect(lesson.right_acts.map((a) => a.act_index)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('the bench names its instruments and supply, never a battery; no developer text', () => {
    const all = JSON.stringify(lesson);
    expect(all).not.toMatch(/电池|battery/i);
    expect(all).toContain('台式可调直流电源（±9 V）');
    expect(all).toContain('函数信号发生器');
    expect(all).toContain('双通道示波器');
    expect(all).not.toMatch(/breadboard_safety_and_scaling|recommended_bom|Claude|JSON|落地清单/);
    // the LM358's real swing on ±9 V, never "±7.5 V"
    expect(all).toContain('−8.9');
    expect(all).not.toMatch(/摆幅[约为]*\s*\$?\\pm ?7\.5|摆幅±7\.5|±7\.5 V/);
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
    expect(pos).toEqual([0, 1, 3, 2]);
    const after = lesson.right_acts.at(-1)!.after_quiz ?? [];
    expect(JSON.stringify(after)).toContain('Phase 1');
    expect(JSON.stringify(after)).toContain('Phase 2');
  });

  it('anti-spoiler: nothing before the guided block, its step diagrams or the stage start gives its answers', () => {
    const act = lesson.right_acts.find((a) => a.act_index === 7)!;
    const g = act.blocks.findIndex((b) => b.kind === 'guided');
    expect(g).toBeGreaterThan(0);
    const guided = act.blocks[g];
    if (guided.kind !== 'guided') throw new Error('no guided block');
    const before = [
      JSON.stringify(lesson.right_acts.filter((a) => a.act_index < 7).map((a) => [a.blocks, a.inline_svg])),
      JSON.stringify(act.blocks.slice(0, g)),
      guided.problem,
      guided.problem_svg ?? '',
      ...[MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5],
      ...guided.steps.map((s) => s.question),
    ].join('\n');
    for (const answer of ['51 kΩ', '51 k', '3.3 nF', '3.12', '945', '6.12', '-6.37', '−6.37', '14.15', '5.10', '(332)', '1.38'])
      expect(before.includes(answer), answer).toBe(false);
    // the masked 7.1 figure stands before, the full one right after the guided block
    expect(act.blocks.slice(0, g).some((b) => b.kind === 'figure' && b.svg === SVG_PREVIEW_MASKED)).toBe(true);
    const next = act.blocks.slice(g + 1);
    expect(next.some((b) => b.kind === 'figure' && b.svg === SVG_PREVIEW)).toBe(true);
    expect(next.some((b) => b.kind === 'calc')).toBe(true);
    expect(SVG_PREVIEW).toContain('945.7');
    // each step's diagram asks (has a "?") instead of printing the answer
    for (const m of [MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5]) expect(m).toContain('?');
    // the stage starts hidden, is uncovered step by step, then all at once
    expect(act.sync.params?.dReveal).toBe(0);
    expect(act.sync.params?.mode).toBe('design');
    expect(guided.steps.map((s) => s.params?.dReveal)).toEqual([0, 1, 2, 3, 4]);
    expect(guided.done_params).toEqual({ dReveal: 9 });
    // the right options of the five steps: B, B, A, A, A (as in the sheet)
    expect(guided.steps.map((s) => s.options.findIndex((o) => o.correct))).toEqual([1, 1, 0, 0, 0]);
    for (const s of guided.steps) for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(10);
  });

  it('the figures are light-theme: no dark canvas left', () => {
    const svgs = lesson.right_acts.flatMap((a) => [
      a.inline_svg ?? '',
      ...a.blocks.map((b) => (b.kind === 'figure' ? b.svg : b.kind === 'guided' ? (b.problem_svg ?? '') + b.steps.map((s) => s.mini_svg).join('') : '')),
      ...(a.quiz ?? []).map((q) => q.figure ?? ''),
    ]);
    for (const s of svgs) expect(s).not.toMatch(/background:#0f172a|fill="#0f172a"|fill="#1e293b"/);
  });

  it('2D data never pulls three.js in: index.ts imports only lazily loaded layers', async () => {
    const fs = await import('node:fs');
    const src = fs.readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
    expect(src).not.toMatch(/from ['"](three|@react-three|\.\.\/\.\.\/(BreadboardXray|Lm358|Passives3D|DmmProbe))/);
    expect(src).toMatch(/lazy\(\(\) => import\('\.\/Bench3D'\)\)/);
  });
});
