import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { ActBlock, GuidedBlock } from '../../types';
import { BENCH_NAMES } from '../../Passives3D';
import lesson from './index';
import { KICK_SUPPLY, SUPPLY_NAME } from './state';

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

describe('W4-L2 lesson data', () => {
  const { text, tex } = collect();

  it('matches the registry entry', () => {
    expect(lesson.lesson_meta.lesson_id).toBe('W4-L2');
    expect(lesson.lesson_meta.world).toBe('World 4');
    expect(lesson.lesson_meta.estimated_minutes).toBe(55);
    expect(lesson.right_acts).toHaveLength(6);
  });

  it('every formula renders in KaTeX', () => {
    const all = [...tex];
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[3]) all.push(m[3]);
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[2]) for (const n of m[2].matchAll(/\$([^$]+)\$/g)) all.push(n[1]);
    expect(all.length).toBeGreaterThan(150);
    for (const t of all) expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }), t).not.toThrow();
  });

  it('every linked term and halo names a stage object; every layer has a renderer', () => {
    const known = new Set(Object.keys(lesson.left_stage_spec.hover_map));
    for (const t of text) for (const m of t.matchAll(TOKEN)) if (m[1]) for (const id of m[1].split(',')) expect(known.has(id), id).toBe(true);
    const halos = lesson.right_acts.flatMap((a) => [
      ...(a.sync.halo ?? []),
      ...a.blocks.flatMap((b) => (b.kind === 'guided' ? b.steps.flatMap((s) => s.halo ?? []) : [])),
      ...(a.quiz ?? []).flatMap((q) => q.sync?.halo ?? []),
    ]);
    for (const id of halos) expect(known.has(id), id).toBe(true);
    const ids = lesson.left_stage_spec.layers.map((l) => l.id);
    for (const id of ids) expect(lesson.renderers[id]).toBeDefined();
    for (const a of lesson.right_acts) expect(ids).toContain(a.sync.layer);
  });

  it('no raw markup or battery wording leaks into the text', () => {
    for (const t of text) {
      expect(t, t).not.toMatch(/breadboard_safety|professor_intercept|Claude|JSON/);
      expect(t, t).not.toMatch(/电池/);
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
    expect(new Set(pos).size).toBeGreaterThan(2);
  });

  it('anti-spoiler: nothing before the guided block gives Example 5.1 away', () => {
    const acts = lesson.right_acts;
    const gi = acts.indexOf(guidedAct());
    const g = guidedAct().blocks.findIndex((b) => b.kind === 'guided');
    const before = JSON.stringify([...acts.slice(0, gi).map((a) => [a.blocks, a.inline_svg ?? '']), guidedAct().blocks.slice(0, g)]);
    for (const answer of [
      '4.5 V',
      '4.5\\\\text',
      'v_C=4.5',
      '30 mA',
      '30\\\\text{ mA}',
      '45 mA',
      '110.25',
      '101.25',
      '9.00',
      '0.2025',
      '0.203 W',
      'R_{23} = \\\\frac{300 \\\\times 150}{300 + 150} = ',
    ])
      expect(before.includes(answer), answer).toBe(false);
    // the act of Example 5.1 keeps ① and ②; its ③ follows the guided block
    const act5 = acts.find((a) => a.act_index === 5)!;
    expect(act5.blocks.some((b) => b.kind === 'origin')).toBe(true);
    expect(act5.blocks.some((b) => b.kind === 'formula')).toBe(true);
    expect(act5.blocks.some((b) => b.kind === 'calc')).toBe(false);
    const after = guidedAct().blocks.slice(g + 1);
    expect(after.some((b) => b.kind === 'calc' && JSON.stringify(b).includes('110.25'))).toBe(true);
    // the stage hides the numbers until the example is done
    const gb = guidedAct().blocks[g] as GuidedBlock;
    expect(gb.done_params).toMatchObject({ ex51: 5 });
    gb.steps.forEach((s, i) => expect(s.params?.ex51, `step ${i + 1}`).toBe(i));
    for (const a of acts) expect(a.sync.params?.ex51, `act ${a.act_index}`).toBe(0);
    // step diagrams only show what earlier steps found
    expect(gb.steps[0].mini_svg).not.toMatch(/短路|开路 \(/);
    expect(gb.steps[2].mini_svg).not.toMatch(/4\.5|150 = 100/);
    expect(gb.steps[3].mini_svg).not.toMatch(/30 mA/);
    expect(gb.steps[4].mini_svg).not.toMatch(/9\.00|101\.25|110\.25/);
    const words = (svg = '') => [...svg.matchAll(/>([^<]+)</g)].map((m) => m[1]).join(' | ');
    expect(words(gb.problem_svg)).not.toMatch(/4\.5|30 mA|45 mA|110\.25/);
  });

  it('every lab supply is a labelled 台式可调直流电源', () => {
    expect(lesson.left_stage_spec.hover_map.supply.label).toBe('台式可调直流电源（9 V）');
    expect(lesson.left_stage_spec.hover_map.kick_src.label).toBe('台式可调直流电源（12 V）');
    // the names the World 4 benches share (Passives3D's BENCH_NAMES; state.tsx stays free of three.js)
    expect(SUPPLY_NAME.startsWith(BENCH_NAMES.supply)).toBe(true);
    expect(KICK_SUPPLY.startsWith(BENCH_NAMES.supply)).toBe(true);
    expect(lesson.left_stage_spec.hover_map.dmm.label.startsWith(BENCH_NAMES.dmm)).toBe(true);
  });
});
