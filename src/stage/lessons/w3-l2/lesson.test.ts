import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { ActBlock } from '../../types';
import lesson from './index';

const TEX_KEYS = new Set(['tex']);

/** every string of the lesson, with whether it is display TeX (formula / calc / board) */
function strings(): { s: string; tex: boolean }[] {
  const out: { s: string; tex: boolean }[] = [];
  const walk = (v: unknown, key = '') => {
    if (typeof v === 'string') out.push({ s: v, tex: TEX_KEYS.has(key) || key === 'board' });
    else if (Array.isArray(v)) v.forEach((x) => walk(x, key));
    else if (v && typeof v === 'object')
      for (const [k, x] of Object.entries(v)) {
        if (k === 'renderers' || k === 'svg' || k === 'inline_svg' || k === 'mini_svg' || k === 'problem_svg' || k === 'figure') continue;
        walk(x, k);
      }
  };
  walk(lesson);
  return out;
}

const render = (tex: string, display: boolean) => katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: 'ignore' });

describe('W3-L2 lesson', () => {
  it('every formula renders in KaTeX', () => {
    let n = 0;
    for (const { s, tex } of strings()) {
      if (tex) {
        expect(() => render(s, true), s).not.toThrow();
        n++;
      } else
        for (const m of s.matchAll(/\$([^$]+)\$/g)) {
          expect(() => render(m[1], false), m[1]).not.toThrow();
          n++;
        }
    }
    expect(n).toBeGreaterThan(150);
  });

  it('every [[id|…]] link names a hover-map id, every lit id too', () => {
    const map = lesson.left_stage_spec.hover_map;
    for (const { s } of strings()) for (const m of s.matchAll(/\[\[([a-z0-9_,-]+)\|/g)) for (const id of m[1].split(',')) expect(map[id], id).toBeTruthy();
    const halos = lesson.right_acts.flatMap((a) => [
      ...(a.sync.halo ?? []),
      ...(a.quiz ?? []).flatMap((q) => q.sync?.halo ?? []),
      ...a.blocks.flatMap((b: ActBlock) => (b.kind === 'guided' ? b.steps.flatMap((st) => st.halo ?? []) : [])),
    ]);
    for (const id of halos) expect(map[id], id).toBeTruthy();
  });

  it('every layer has a renderer; acts and quiz are complete', () => {
    for (const l of lesson.left_stage_spec.layers) expect(lesson.renderers[l.id]).toBeTruthy();
    expect(lesson.right_acts.map((a) => a.act_index)).toEqual([1, 2, 3, 4, 5]);
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    for (const q of quiz) {
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback, `${q.id} ${o.key}`).toBeTruthy();
      expect(q.figure).toBeTruthy();
    }
    // the right answer is not always in the same place
    expect(new Set(quiz.map((q) => q.options.findIndex((o) => o.correct))).size).toBeGreaterThan(2);
  });

  it('anti-spoiler: nothing before the guided example prints Example 5.2’s results in a diagram', () => {
    const act4 = lesson.right_acts[3];
    const figs = act4.blocks.flatMap((b) => (b.kind === 'figure' ? [b.svg] : []));
    expect(figs).toHaveLength(1);
    expect(figs[0]).not.toMatch(/0\.2 mA|vₒ = 6 V|= 3<|0\.0015%/);
    // act 4 keeps ① and ② but no ③
    expect(act4.blocks.some((b) => b.kind === 'calc')).toBe(false);
    const act5 = lesson.right_acts[4];
    const gi = act5.blocks.findIndex((b) => b.kind === 'guided');
    const calc = act5.blocks.findIndex((b) => b.kind === 'calc');
    expect(gi).toBeGreaterThanOrEqual(0);
    expect(calc).toBeGreaterThan(gi);
    const g = act5.blocks[gi];
    if (g.kind !== 'guided') throw new Error('no guided block');
    expect(g.problem_svg).not.toMatch(/0\.2 mA|6 V</);
    expect(g.steps[3].mini_svg).not.toMatch(/1 \+ R_f/);
    expect(g.steps[1].mini_svg).not.toMatch(/i₁=0/);
    expect(g.done_params).toMatchObject({ w32_reveal: true });
    for (const st of g.steps) expect(st.params).toMatchObject({ w32_reveal: false });
    expect(act4.sync.params).toMatchObject({ w32_reveal: false });
  });
});
