import katex from 'katex';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { ActBlock } from '../../types';
import lesson from './index';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4 } from './sheetSvgs';
import { MINI_STEP5, SVG_PROBLEM } from './svgs';

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
      case 'figure':
        if (b.caption) text.push(b.caption);
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

describe('W5-L8 lesson data', () => {
  const { text, tex } = collect();

  it('every formula renders in KaTeX', () => {
    const all = [...tex];
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[3]) all.push(m[3]);
    expect(all.length).toBeGreaterThan(150);
    for (const t of all) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });

  it('no raw TeX outside $…$ (an odd number of $ would leak "\\frac" onto the page)', () => {
    for (const t of text) expect((t.match(/\$/g) ?? []).length % 2, t).toBe(0);
    for (const t of text) expect(t.replace(TOKEN, ''), t).not.toMatch(/\\(frac|text|alpha|omega|mathbf)/);
  });

  it('every linked term and every halo id names a stage object', () => {
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[1]) for (const id of m[1].split(',')) expect(known(id), id).toBe(true);
    for (const a of lesson.right_acts) {
      for (const id of a.sync.halo ?? []) expect(known(id), id).toBe(true);
      for (const q of a.quiz ?? []) for (const id of q.sync?.halo ?? []) expect(known(id), id).toBe(true);
      for (const b of a.blocks) if (b.kind === 'guided') for (const s of b.steps) for (const id of s.halo ?? []) expect(known(id), id).toBe(true);
    }
  });

  it('every hover id the layers light or set is in the hover map', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = ['Circuit.tsx', 'Curves.tsx', 'Bench3D.tsx'].map((f) => readFileSync(join(here, f), 'utf8')).join('\n');
    const ids = new Set<string>();
    for (const m of src.matchAll(/(?:hoverProps|hover3d|on)\(\[?'([a-z0-9_]+)'/g)) ids.add(m[1]);
    for (const m of src.matchAll(/\bid="([a-z0-9_]+)"/g)) ids.add(m[1]);
    for (const m of src.matchAll(/\bid: '([a-z0-9_]+)'/g)) ids.add(m[1]);
    for (const m of src.matchAll(/hover: \[([^\]]+)\]/g)) for (const x of m[1].matchAll(/'([a-z0-9_]+)'/g)) ids.add(x[1]);
    for (const m of src.matchAll(/ids=\{\[([^\]]+)\]\}/g)) for (const x of m[1].matchAll(/'([a-z0-9_]+)'/g)) ids.add(x[1]);
    expect(ids.size).toBeGreaterThan(30);
    for (const id of ids) expect(id in lesson.left_stage_spec.hover_map, id).toBe(true);
    for (const p of [2, 5, 10]) expect(`curve_q${p}` in lesson.left_stage_spec.hover_map).toBe(true);
  });

  it('every layer has a renderer, every sync names a layer, every act has a diagram', () => {
    const ids = lesson.left_stage_spec.layers.map((l) => l.id);
    for (const id of ids) expect(lesson.renderers[id]).toBeDefined();
    for (const l of lesson.left_stage_spec.layers) expect(l.label.length).toBeLessThanOrEqual(14);
    for (const a of lesson.right_acts) {
      expect(ids).toContain(a.sync.layer);
      expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure'), `act ${a.act_index}`).toBe(true);
    }
    expect(lesson.right_acts.map((a) => a.act_index)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('three.js stays in the lazily loaded 3D layer', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    for (const f of readdirSync(here).filter((f) => /\.tsx?$/.test(f) && f !== 'Bench3D.tsx' && !f.endsWith('.test.ts'))) {
      const src = readFileSync(join(here, f), 'utf8');
      expect(src, f).not.toMatch(/from 'three'|@react-three|BreadboardXray|Passives3D|DmmProbe|Lm358/);
    }
  });

  it('the bench names its instruments, no battery, no DC supply needed, no developer text', () => {
    const all = JSON.stringify(lesson);
    expect(all).not.toMatch(/电池|battery/i);
    expect(all).toContain('函数信号发生器');
    expect(all).toContain('双通道示波器');
    for (const m of all.matchAll(/台式可调直流电源/g)) expect(all.slice(m.index! - 3, m.index), 'a DC supply must name its voltage').toBe('不需要');
    expect(all).not.toContain('breadboard_safety_and_scaling');
    expect(all).not.toMatch(/Claude|JSON|expected_answer|professor_intercept/);
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
    expect(new Set(pos).size).toBe(4);
    expect(lesson.right_acts.at(-1)!.after_quiz?.length).toBeGreaterThan(0);
  });

  it('anti-spoiler: nothing before the guided block, its step diagrams or its problem figure gives its answers', () => {
    const act = lesson.right_acts.find((a) => a.act_index === 6)!;
    const g = act.blocks.findIndex((b) => b.kind === 'guided');
    expect(g).toBeGreaterThan(0);
    const guided = act.blocks[g];
    if (guided.kind !== 'guided') throw new Error('no guided block');
    const before = [
      JSON.stringify(lesson.right_acts.filter((a) => a.act_index < 6).map((a) => [a.blocks, a.inline_svg])),
      JSON.stringify(act.blocks.slice(0, g)),
      guided.title,
      guided.problem,
      SVG_PROBLEM,
      ...[MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5],
      ...guided.steps.map((s) => s.question),
    ].join('\n');
    for (const answer of ['47{,}562', '52{,}562', '47,562', '52,562', '47{,}500', '52{,}500', '795.7', '0.9512', '0.131', '62.46', '需 ≥ 100 V', '至少应选 100 V'])
      expect(before.includes(answer), answer).toBe(false);
    // the moved row comes right after the guided block
    const review = act.blocks[g + 1];
    expect(review.kind === 'table' && review.rows[0][0]).toBe('临界判据（本课例题）');
    expect(`${guided.title} ${guided.problem} ${SVG_PROBLEM}`).not.toMatch(/50 V|100 V/);
    // step 5's diagram asks instead of answering
    expect(MINI_STEP5).toContain('?');
    expect(MINI_STEP5).not.toContain('50 V');
    // the stage hides what the open step asks for, and uncovers it when the example is done
    expect(guided.steps.map((s) => s.params?.w58g)).toEqual([1, 2, 3, 4, 5]);
    expect(guided.done_params).toEqual({ w58g: 0 });
    // steps 1–2 must not set Q on the stage (Q = 10 is step 2's answer)
    expect(guided.steps.slice(0, 2).every((s) => s.params?.q === undefined)).toBe(true);
    // three options per step, the right one moving around, every option with feedback
    for (const s of guided.steps) {
      expect(s.options).toHaveLength(3);
      expect(s.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(20);
    }
    expect(guided.steps.map((s) => s.options.findIndex((o) => o.correct))).toEqual([1, 2, 0, 2, 0]);
  });

  it('the light-theme figures: no dark canvas', () => {
    const svgs = lesson.right_acts.flatMap((a) => [
      a.inline_svg ?? '',
      ...a.blocks.map((b) => (b.kind === 'figure' ? b.svg : b.kind === 'guided' ? (b.problem_svg ?? '') + b.steps.map((s) => s.mini_svg).join('') : '')),
      ...(a.quiz ?? []).map((q) => q.figure ?? ''),
    ]);
    for (const s of svgs) {
      expect(s).not.toMatch(/<rect[^>]*x="0" y="0"[^>]*fill="#0f172a"/);
      expect(s).not.toMatch(/background:#0f172a/);
    }
  });
});
