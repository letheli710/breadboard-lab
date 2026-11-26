import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { BENCH_NAMES } from '../../Passives3D';
import { STAGE_LESSON_INDEX } from '../../registry';
import type { ActBlock, GuidedBlock } from '../../types';
import { SVG_FIG3, SVG_FIG3_MASKED, SVG_PROBLEM, MINI_STEP5 } from './svgs';
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

const guidedOf = () => {
  const act = lesson.right_acts.find((a) => a.blocks.some((b) => b.kind === 'guided'))!;
  const g = act.blocks.findIndex((b) => b.kind === 'guided');
  return { act, g, block: act.blocks[g] as GuidedBlock };
};

describe('W4-L5 lesson data', () => {
  const { text, tex } = collect();

  it('matches the registry entry', () => {
    const e = STAGE_LESSON_INDEX.find((r) => r.code === 'W4-L5')!;
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
    const ok = (id: string) => known.has(id) || lesson.describeTarget?.(id) != null;
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[1]) for (const id of m[1].split(',')) expect(ok(id), id).toBe(true);
    const halos = lesson.right_acts.flatMap((a) => [
      ...(a.sync.halo ?? []),
      ...a.blocks.flatMap((b) => (b.kind === 'guided' ? b.steps.flatMap((s) => s.halo ?? []) : [])),
      ...(a.quiz ?? []).flatMap((q) => q.sync?.halo ?? []),
    ]);
    for (const id of halos) expect(ok(id), id).toBe(true);
  });

  it('every layer has a renderer and every sync names a layer', () => {
    const ids = lesson.left_stage_spec.layers.map((l) => l.id);
    for (const id of ids) expect(lesson.renderers[id]).toBeDefined();
    for (const a of lesson.right_acts) expect(ids).toContain(a.sync.layer);
    const { block } = guidedOf();
    for (const s of block.steps) if (s.layer) expect(ids).toContain(s.layer);
  });

  it('guided example: five steps, three options each, one right, the right one moves around', () => {
    const { block } = guidedOf();
    expect(block.steps).toHaveLength(5);
    const pos = block.steps.map((s) => {
      expect(s.options).toHaveLength(3);
      expect(s.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(20);
      expect(s.board.length).toBeGreaterThan(0);
      return s.options.findIndex((o) => o.correct);
    });
    expect(new Set(pos).size).toBe(3);
    expect(block.done_params).toEqual({ ex75: 9 });
    // the stage reveal grows step by step and stays below "done"
    expect(block.steps.map((s) => s.params?.ex75)).toEqual([0, 1, 2, 3, 4]);
  });

  it('quiz: one right answer each, every wrong option has its own feedback, right answers spread', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    const pos = quiz.map((q) => {
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback?.length ?? 0).toBeGreaterThan(20);
      expect(q.figure).toBeTruthy();
      return q.options.findIndex((o) => o.correct);
    });
    expect(new Set(pos).size).toBe(4);
  });

  it('anti-spoiler: no Sadiku 7.5 answer before the guided block; the ③ board follows it', () => {
    const { act, g } = guidedOf();
    const ai = lesson.right_acts.indexOf(act);
    const before = JSON.stringify([...lesson.right_acts.slice(0, ai).map((a) => ({ ...a, inline_svg: undefined })), act.blocks.slice(0, g)]);
    const answers = [
      '18 \\\\times \\\\frac{6}{3 + 6} = 12',
      'v_C(0^-) = 12',
      '6 \\\\parallel 12',
      '4 \\\\times 0.25',
      '24 - 12e',
      '2 + 2e',
      '36 - 12',
      'i_3(0^+) = 4',
      '3e^{-t}',
      '4\\\\ \\\\text{k}\\\\Omega \\\\times 250',
      '骤降至安全的',
      '2 A → 4 A',
    ];
    for (const a of answers) expect(before.includes(a), a).toBe(false);
    // act 3 keeps ① and ② but no ③
    const act3 = lesson.right_acts[2];
    expect(act3.blocks.some((b) => b.kind === 'origin')).toBe(true);
    expect(act3.blocks.some((b) => b.kind === 'formula')).toBe(true);
    expect(act3.blocks.some((b) => b.kind === 'calc')).toBe(false);
    expect(act.blocks.slice(g + 1).some((b) => b.kind === 'calc' && b.steps.some((s) => s.tex?.includes('24 - 12e^{-t}')))).toBe(true);
    // the figures: act 3's and the problem's are masked, the full one sits after the guided block
    for (const svg of [lesson.right_acts[2].inline_svg!, SVG_FIG3_MASKED, SVG_PROBLEM])
      for (const a of ['Rth = 4 Ω', '24 - 12e^-t', '2 + 2e^-t', '= 12 V', '4 A !!', '3 A (突变)', '= 24 V']) expect(svg.includes(a), a).toBe(false);
    expect(SVG_FIG3.includes('vC = 24 - 12e^-t')).toBe(true);
    expect(act.blocks.slice(g + 1).some((b) => b.kind === 'figure' && b.svg === SVG_FIG3)).toBe(true);
    // step 5's mini diagram does not show step 5's answer
    expect(MINI_STEP5.includes('2 + 2e^(-t) A')).toBe(false);
  });

  it('the scope-ground warning and the labelled bench supply are in the text', () => {
    const all = text.join('\n');
    expect(all).toContain('示波器探头地线夹共地防短路警示（仪器安全硬性红线）');
    expect(all).toContain('台式可调直流电源（5 V）');
    expect(all).not.toMatch(/9 V 电池|电池扣/);
    expect(lesson.left_stage_spec.hover_map.psu.label).toBe('台式可调直流电源（5 V）');
    expect(lesson.left_stage_spec.hover_map.fg.label).toBe(BENCH_NAMES.generator);
    expect(lesson.left_stage_spec.hover_map.scope.label).toBe(BENCH_NAMES.scope);
    expect(lesson.left_stage_spec.hover_map.psu.label.startsWith(BENCH_NAMES.supply)).toBe(true);
    expect(lesson.left_stage_spec.hover_map.psu75.label.startsWith(BENCH_NAMES.supply)).toBe(true);
  });
});
