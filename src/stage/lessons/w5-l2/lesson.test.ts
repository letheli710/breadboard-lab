import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { STAGE_LESSON_ENTRY } from '../../registry';
import type { ActBlock } from '../../types';
import lesson from './index';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_EX_PROBLEM } from './svgs';

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

describe('W5-L2 lesson data', () => {
  const { text, tex } = collect();

  it('keeps the registry metadata', () => {
    const e = STAGE_LESSON_ENTRY.get('w5-l2')!;
    expect(lesson.lesson_meta.lesson_id).toBe(e.code);
    expect(lesson.lesson_meta.title).toBe(e.title.zh);
    expect(lesson.lesson_meta.estimated_minutes).toBe(e.minutes);
    expect(lesson.lesson_meta.world).toBe('World 5');
  });

  it('every formula renders in KaTeX', () => {
    const all = [...tex];
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[3]) all.push(m[3]);
    expect(all.length).toBeGreaterThan(150);
    for (const t of all) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });

  it('no raw TeX outside $…$ (an odd number of $ would leak "\\frac" onto the page)', () => {
    for (const t of text) expect((t.match(/\$/g) ?? []).length % 2, t).toBe(0);
    for (const t of text) expect(t.replace(TOKEN, ''), t).not.toMatch(/\\(frac|text|mathbf|omega|angle|phi)/);
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
      expect(l.label.length, l.label).toBeLessThanOrEqual(14);
    }
    for (const a of lesson.right_acts) {
      expect(ids).toContain(a.sync.layer);
      for (const q of a.quiz ?? []) if (q.sync?.layer) expect(ids).toContain(q.sync.layer);
      expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure' || (b.kind === 'guided' && !!b.problem_svg)), `act ${a.act_index}`).toBe(true);
    }
    expect(lesson.right_acts.map((a) => a.act_index)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('the bench names its instruments, uses no DC supply or battery, and shows no developer text', () => {
    const all = JSON.stringify(lesson);
    expect(all).not.toMatch(/电池|battery/i);
    expect(all).toContain('函数信号发生器');
    expect(all).toContain('双通道示波器');
    expect(all).not.toMatch(/breadboard_safety_and_scaling|probe_common_ground_rule|professor_intercept|board_append_latex/);
    expect(all).not.toMatch(/Claude|JSON|工程落地清单/);
  });

  it('three.js and the 3D shared parts are imported only by the lazily loaded 3D layer', () => {
    const dir = __dirname;
    for (const f of readdirSync(dir).filter((n) => /\.tsx?$/.test(n) && !n.endsWith('.test.ts'))) {
      const src = readFileSync(join(dir, f), 'utf8');
      const imports = [...src.matchAll(/from '([^']+)'/g)].map((m) => m[1]);
      const threeish = imports.filter((i) => /^three($|\/)|^@react-three\/|three-stdlib|BreadboardXray|DmmProbe|Lm358|Passives3D/.test(i));
      if (f === 'Bench3D.tsx') expect(threeish.length).toBeGreaterThan(0);
      else expect(threeish, f).toEqual([]);
    }
    const index = readFileSync(join(dir, 'index.ts'), 'utf8');
    expect(index).toMatch(/lazy\(\(\) => import\('\.\/Bench3D'\)\)/);
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

  it('quiz figures do not print the answers', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    const answers = [['开路、高频'], ['0.06', '0.08', '呈容性'], ['3.54', '−45', '-45'], ['−45°', '-45°', 'MATH']];
    quiz.forEach((q, i) => {
      for (const a of answers[i]) expect(q.figure!.includes(a), `${q.id}: ${a}`).toBe(false);
    });
  });

  it('anti-spoiler: nothing before the guided block, its problem figure or its step diagrams gives its answers', () => {
    const act = lesson.right_acts.find((a) => a.act_index === 6)!;
    const g = act.blocks.findIndex((b) => b.kind === 'guided');
    expect(g).toBeGreaterThanOrEqual(0);
    const guided = act.blocks[g];
    if (guided.kind !== 'guided') throw new Error('no guided block');
    const before = [
      JSON.stringify(lesson.right_acts.filter((a) => a.act_index < 6).map((a) => [a.blocks, a.inline_svg])),
      JSON.stringify(lesson.left_stage_spec),
      JSON.stringify(act.blocks.slice(0, g)),
      guided.problem,
      SVG_EX_PROBLEM,
    ].join('\n');
    // the answers of the five steps (Z_L1 / Z_C, Z_p, Z_eq, I, i(t)) in the spellings the lesson uses
    // (act 3's own −j10 Ω for Z_B and 10∠36.87° for Z_A = 8 + j6 are another network's numbers)
    const steps: string[][] = [
      ['j11', 'Z_C = -j10', 'Z_C = −j10', '\\mathbf{Z}_C = -j10'],
      ['5 - j5', '5 − j5', '5-j5'],
      ['8 + j6 = 10', '10∠36.87', '10 ∠ 36.87', '10\\angle 36.87^\\circ\\ \\Omega'],
      ['-16.87', '−16.87', '3.00∠', '3.00\\angle'],
      ['200t - 16.87', '200t − 16.87', 'cos(200t -'],
    ];
    for (const a of steps.flat()) expect(before.includes(a), a).toBe(false);
    // step k's diagram and question may show the earlier answers, never its own or a later one
    const minis = [MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5];
    guided.steps.forEach((s, k) => {
      const shown = (minis[k] ?? '') + s.question + s.title;
      for (const a of steps.slice(k).flat()) expect(shown.includes(a), `step ${k + 1}: ${a}`).toBe(false);
      expect(s.mini_svg).toBe(minis[k]);
      expect(minis[k]).toContain('?');
    });
    // the stage's guided page starts hidden and is uncovered step by step, then all at once
    expect(guided.steps.map((s) => s.params?.gReveal)).toEqual([0, 1, 2, 3, 4]);
    expect(guided.done_params).toEqual({ gReveal: 9 });
    expect(act.sync.params?.gReveal).toBe(0);
    // the right options of the five steps: A, B, B, B, A (as in the sheet)
    expect(guided.steps.map((s) => s.options.findIndex((o) => o.correct))).toEqual([0, 1, 1, 1, 0]);
    for (const s of guided.steps) {
      expect(s.options.filter((o) => o.correct)).toHaveLength(1);
      expect(new Set(s.options.map((o) => o.feedback)).size).toBe(s.options.length);
      for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(20);
    }
  });

  it('the light-theme figures: no dark canvas left', () => {
    const svgs = lesson.right_acts.flatMap((a) => [
      a.inline_svg ?? '',
      ...a.blocks.map((b) => (b.kind === 'figure' ? b.svg : b.kind === 'guided' ? (b.problem_svg ?? '') + b.steps.map((s) => s.mini_svg).join('') : '')),
      ...(a.quiz ?? []).map((q) => q.figure ?? ''),
    ]);
    for (const s of svgs) expect(s).not.toMatch(/fill="#0f172a"\s+stroke="#334155"|fill="#020617"/);
  });
});
