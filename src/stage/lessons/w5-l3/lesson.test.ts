import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { ActBlock, StageLesson } from '../../types';
import lesson from './index';

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

const R = String.raw;
const render = (tex: string, displayMode: boolean) => katex.renderToString(tex, { displayMode, throwOnError: true, strict: 'ignore' });
const DIR = dirname(fileURLToPath(import.meta.url));

describe('W5-L3 lesson', () => {
  const { inline, display } = collect(lesson);

  it('renders every formula in KaTeX, and leaves no stray $ or backslash in the text', () => {
    for (const s of inline) for (const m of s.matchAll(/\$([^$]+)\$/g)) expect(() => render(m[1], false), m[1]).not.toThrow();
    for (const t of display) expect(() => render(t, true), t).not.toThrow();
    for (const s of inline) {
      const rest = s.replace(/\$[^$]+\$/g, '');
      expect(rest, s).not.toMatch(/\$|\\[a-zA-Z`]/);
    }
  });

  it('links only hover-map ids, and every layer has a renderer', () => {
    const ids = new Set(Object.keys(lesson.left_stage_spec.hover_map));
    for (const s of inline) for (const m of s.matchAll(/\[\[([a-z0-9_,-]+)\|/g)) for (const id of m[1].split(',')) expect(ids.has(id), id).toBe(true);
    for (const l of lesson.left_stage_spec.layers) expect(lesson.renderers[l.id], l.id).toBeTruthy();
    const halos = lesson.right_acts.flatMap((a) => [
      ...(a.sync.halo ?? []),
      ...a.blocks.flatMap((b) => (b.kind === 'guided' ? b.steps.flatMap((s) => s.halo ?? []) : [])),
      ...(a.quiz ?? []).flatMap((q) => q.sync?.halo ?? []),
    ]);
    for (const id of halos) expect(ids.has(id), id).toBe(true);
    // the ids the stage drawings use (objects, node bubbles, toggles, readout cells, useHot) are all in the hover map
    for (const f of readdirSync(DIR).filter((n) => n.endsWith('.tsx') && n !== 'parts.tsx')) {
      const src = readFileSync(join(DIR, f), 'utf8');
      const used = [
        ...[...src.matchAll(/<(?:Obj|NodeBubble|Toggle)\b[^>]*?\bid="([a-z0-9_]+)"/g)].map((m) => m[1]),
        ...[...src.matchAll(/\{ id: '([a-z0-9]+_[a-z0-9_]+)', label:/g)].map((m) => m[1]),
        ...[...src.matchAll(/useHot\('([a-z0-9_]+)'\)/g)].map((m) => m[1]),
      ];
      expect(used.length, f).toBeGreaterThan(5);
      for (const id of used) expect(ids.has(id), `${f}: ${id}`).toBe(true);
    }
  });

  it('labels are short; every act has a diagram; acts follow the sheet’s layer sync (01, 02, 03, 02, 03)', () => {
    for (const l of lesson.left_stage_spec.layers) expect([...l.label].length, l.label).toBeLessThanOrEqual(14);
    for (const a of lesson.right_acts) expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure' || (b.kind === 'guided' && !!b.problem_svg)), a.title).toBe(true);
    expect(lesson.right_acts.map((a) => a.sync.layer)).toEqual(['01', '02', '03', '02', '03']);
    // no developer-facing text reaches the student
    const all = JSON.stringify(lesson.right_acts) + JSON.stringify(lesson.left_stage_spec) + JSON.stringify(lesson.lesson_meta);
    expect(all).not.toMatch(/Claude|passing_score|professor_intercept|board_append|落地清单|\.tsx/);
  });

  it('every wrong quiz option has its own feedback, every question a figure, and the right answer moves', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    for (const q of quiz) {
      expect(q.figure).toBeTruthy();
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback, `${q.id} ${o.key}`).toBeTruthy();
    }
    expect(new Set(quiz.map((q) => q.options.findIndex((o) => o.correct))).size).toBe(4);
    // the figures do not print the answers
    expect(quiz[0].figure).not.toMatch(/-60|−60|-j20|−j20/);
    expect(quiz[2].figure).not.toMatch(/V_1 - V_2|V₁ − V₂|= j10/);
    expect(quiz[3].figure).not.toMatch(/36 \+ j8|6 − j2|6 - j2/);
  });

  it('guided example: five steps of three options, one right, its position varies; board, hint and diagram on each', () => {
    const g = lesson.right_acts[3].blocks.find((b) => b.kind === 'guided');
    if (!g || g.kind !== 'guided') throw new Error('no guided block');
    expect(g.steps).toHaveLength(5);
    for (const s of g.steps) {
      expect(s.options).toHaveLength(3);
      expect(s.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(10);
      expect(s.board.length).toBeGreaterThan(0);
      expect(s.hint).toBeTruthy();
      expect(s.mini_svg).toBeTruthy();
    }
    expect(new Set(g.steps.map((s) => s.options.findIndex((o) => o.correct))).size).toBe(3);
    expect(g.steps.map((s) => s.layer)).toEqual(['02', '02', '02', '02', '02']);
  });

  it('anti-spoiler: no guided answer before the guided block, nor in a step’s hint or diagram; stage numbers covered until reached', () => {
    const act4 = lesson.right_acts[3];
    const gi = act4.blocks.findIndex((b) => b.kind === 'guided');
    const g = act4.blocks[gi];
    if (g.kind !== 'guided') throw new Error('no guided block');
    const before = [
      ...lesson.right_acts.slice(0, 3).map((a) => JSON.stringify(a)),
      JSON.stringify(act4.blocks.slice(0, gi)),
      JSON.stringify(act4.sync),
      g.problem,
      g.problem_svg ?? '',
      JSON.stringify(lesson.left_stage_spec),
    ];
    // the answers of the five steps
    const answers = [
      R`-j6\text{ A}`,
      R`6\angle{-}90`,
      '6∠-90',
      R`-j10\,\Omega`,
      R`(1 + j)\mathbf{V}_1 - j\mathbf{V}_2`,
      R`(1+j)\mathbf{V}_1 - j\mathbf{V}_2`,
      R`-j\mathbf{V}_1 + \mathbf{V}_2 = 0`,
      R`(2 + j)\mathbf{V}_1`,
      R`(2+j)\mathbf{V}_1`,
      '-12 - j24',
      R`26.83\angle{-}116.57`,
      R`26.83\cos(100t`,
      '26.83cos(100t',
    ];
    const has = (t: string, a: string) => t.includes(a) || t.includes(JSON.stringify(a).slice(1, -1));
    for (const t of before) for (const a of answers) expect(has(t, a), a).toBe(false);
    // a step's hint and diagram stop before its own answer
    const own = [
      [R`-j6\text`, R`= j10\,\Omega`, R`= -j10\,`],
      ['-j60', R`-j\mathbf{V}_1 + \mathbf{V}_2`],
      ['(2+j)', '(2 + j)', '1+j+1'],
      ['-12', '24', '116.57'],
      ['26.83', 'cos(100t'],
    ];
    g.steps.forEach((s, i) => {
      for (const a of own[i]) {
        expect(s.hint.includes(a), `step ${i + 1} hint: ${a}`).toBe(false);
        expect((s.mini_svg ?? '').includes(a), `step ${i + 1} diagram: ${a}`).toBe(false);
      }
    });
    // steps open with the numbers reached so far; finishing uncovers the rest
    expect(g.steps.map((s) => s.params?.w53_g)).toEqual([0, 1, 2, 3, 4]);
    for (const s of g.steps) expect(s.params?.w53_nc).toBe('guided');
    expect(g.done_params).toEqual({ w53_g: 5 });
    // no act or quiz item resets the guided progress
    for (const a of lesson.right_acts) {
      expect(a.sync.params?.w53_g, a.title).toBeUndefined();
      for (const q of a.quiz ?? []) expect(q.sync?.params?.w53_g).toBeUndefined();
    }
    // the stage layer gates the guided values on the progress
    const nodal = readFileSync(join(DIR, 'Nodal.tsx'), 'utf8');
    for (const n of [1, 2, 4, 5]) expect(nodal, `seen(${n})`).toContain(`seen(${n})`);
  });

  it('Type B, strictly 2D: no file of this lesson imports three.js, @react-three or a 3D shared part', () => {
    for (const f of readdirSync(DIR).filter((n) => /\.(ts|tsx)$/.test(n))) {
      const src = readFileSync(join(DIR, f), 'utf8');
      const imports = [...src.matchAll(/(?:import|from)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const i of imports) {
        expect(i, `${f} imports ${i}`).not.toMatch(/^three($|\/)|^@react-three\//);
        expect(i, `${f} imports ${i}`).not.toMatch(/BreadboardXray|DmmProbe|Lm358|Passives3D/);
        // nothing indirect either: only this folder, the stage store / types, react, katex and test tools
        expect(i, `${f} imports ${i}`).toMatch(/^\.\/|^\.\.\/\.\.\/(stageStore|types)$|^react$|^katex$|^vitest$|^node:/);
      }
    }
    expect(lesson.left_stage_spec.use_3d).toBe(false);
    expect(lesson.lesson_meta.lesson_type).toBe('B');
  });
});
