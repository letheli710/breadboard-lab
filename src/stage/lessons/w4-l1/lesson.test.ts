import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { ActBlock, StageLesson } from '../../types';
import lesson from './index';
import { MINI_STEP1, MINI_STEP2, MINI_STEP4 } from './svgs';

/** every inline string of the lesson (text, titles, options, feedback …) and every display TeX */
function collect(l: StageLesson) {
  const inline: string[] = [];
  const display: string[] = [];
  const block = (b: ActBlock) => {
    switch (b.kind) {
      case 'p':
      case 'note':
        inline.push(b.text);
        break;
      case 'ol':
      case 'ul':
        inline.push(...b.items);
        break;
      case 'origin':
        inline.push(b.title, b.text);
        break;
      case 'formula':
        inline.push(b.title);
        display.push(b.tex);
        break;
      case 'calc':
        inline.push(b.title);
        for (const s of b.steps) {
          inline.push(s.label, s.text ?? '');
          if (s.tex) display.push(s.tex);
        }
        break;
      case 'table':
        inline.push(...b.head, ...b.rows.flat());
        break;
      case 'figure':
        if (b.caption) inline.push(b.caption);
        break;
      case 'guided':
        inline.push(b.title, b.problem, b.conclusion ?? '');
        for (const s of b.steps) {
          inline.push(s.title, s.question, s.hint, ...s.options.flatMap((o) => [o.text, o.feedback]));
          display.push(...s.board);
        }
        break;
      default:
        break;
    }
  };
  for (const a of l.right_acts) {
    inline.push(a.title);
    a.blocks.forEach(block);
    a.after_quiz?.forEach(block);
    for (const q of a.quiz ?? []) inline.push(q.question, q.feedback_correct, q.feedback_wrong, ...q.options.flatMap((o) => [o.text, o.feedback ?? '']));
  }
  return { inline, display };
}

const render = (tex: string, displayMode: boolean) => katex.renderToString(tex, { displayMode, throwOnError: true, strict: 'ignore' });

describe('W4-L1 lesson', () => {
  const { inline, display } = collect(lesson);

  it('keeps the registry metadata', () => {
    expect(lesson.lesson_meta.lesson_id).toBe('W4-L1');
    expect(lesson.lesson_meta.title).toBe('电容的物理结构、微分伏安关系与电场储能');
    expect(lesson.lesson_meta.estimated_minutes).toBe(55);
    expect(lesson.lesson_meta.world).toBe('World 4');
  });

  it('renders every formula in KaTeX', () => {
    let n = 0;
    for (const s of inline)
      for (const m of s.matchAll(/\$([^$]+)\$/g)) {
        n++;
        expect(() => render(m[1], false), m[1]).not.toThrow();
      }
    for (const t of display) expect(() => render(t, true), t).not.toThrow();
    expect(n + display.length).toBeGreaterThan(150);
  });

  it('links only hover-map ids, every halo id exists, and every layer has a renderer', () => {
    const ids = new Set(Object.keys(lesson.left_stage_spec.hover_map));
    for (const s of inline) for (const m of s.matchAll(/\[\[([a-z0-9_,-]+)\|/g)) for (const id of m[1].split(',')) expect(ids.has(id), id).toBe(true);
    for (const s of inline) expect(/\[\[(?![a-z0-9_,-]+\|)/.test(s), s).toBe(false);
    const halos = lesson.right_acts.flatMap((a) => [
      ...(a.sync.halo ?? []),
      ...a.blocks.flatMap((b) => (b.kind === 'guided' ? b.steps.flatMap((s) => s.halo ?? []) : [])),
      ...(a.quiz ?? []).flatMap((q) => q.sync?.halo ?? []),
    ]);
    for (const id of halos) expect(ids.has(id), id).toBe(true);
    const layers = lesson.left_stage_spec.layers.map((l) => l.id);
    for (const l of layers) expect(lesson.renderers[l], l).toBeTruthy();
    for (const a of lesson.right_acts) {
      expect(layers).toContain(a.sync.layer);
      for (const q of a.quiz ?? []) if (q.sync?.layer) expect(layers).toContain(q.sync.layer);
      for (const b of a.blocks) if (b.kind === 'guided') for (const s of b.steps) if (s.layer) expect(layers).toContain(s.layer);
    }
  });

  it('every act has a local diagram', () => {
    for (const a of lesson.right_acts) expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure'), a.title).toBe(true);
  });

  it('every wrong quiz option has its own feedback, and every question a figure', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    for (const q of quiz) {
      expect(q.figure).toBeTruthy();
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback?.length ?? 0, `${q.id} ${o.key}`).toBeGreaterThan(20);
    }
    expect(new Set(quiz.map((q) => q.options.findIndex((o) => o.correct))).size).toBeGreaterThan(1);
  });

  it('the lab supply is the bench supply, never a battery', () => {
    const all = JSON.stringify(lesson);
    expect(all).toContain('台式可调直流电源（5 V）');
    expect(all).not.toMatch(/电池/);
    expect(all).not.toMatch(/breadboard_safety|Claude|JSON/);
  });

  it('anti-spoiler: nothing shows the guided answers before the guided block', () => {
    const act = lesson.right_acts.find((a) => a.blocks.some((b) => b.kind === 'guided'))!;
    const g = act.blocks.findIndex((b) => b.kind === 'guided');
    const before = JSON.stringify([act.title, ...act.blocks.slice(0, g)]);
    for (const answer of ['6 V', '3 V', '3 mA', '2.70', '1.80', '0.90', '2.7 mJ', 'iR5 = 0', 'i_{R5} = 0']) expect(before.includes(answer), answer).toBe(false);
    // the guided example's stage ids say nothing of the answers
    const hm = lesson.left_stage_spec.hover_map;
    for (const id of Object.keys(hm).filter((k) => k.startsWith('g_')))
      for (const answer of ['6 V', '3 V', '= 0', '开路']) expect(hm[id].desc.includes(answer), `${id}: ${answer}`).toBe(false);
    // the mini diagrams ask instead of answering
    expect(MINI_STEP1).not.toMatch(/开路/);
    expect(MINI_STEP2).not.toMatch(/= 2 kΩ/);
    expect(MINI_STEP4).not.toMatch(/vR5 = 0|= V2</);
    // the stage hides the numbers while the example runs and uncovers them at the end
    const guided = act.blocks[g];
    if (guided.kind !== 'guided') throw new Error('no guided block');
    expect(act.sync.params?.gd).toBe(0);
    guided.steps.forEach((s, k) => expect(s.params?.gd, `step ${k + 1}`).toBe(k));
    expect(guided.done_params?.gd).toBe(9);
  });
});
