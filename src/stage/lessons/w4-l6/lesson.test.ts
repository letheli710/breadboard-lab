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

describe('W4-L6 lesson', () => {
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
    // the ids the stage drawings use are all in the hover map
    const dir = dirname(fileURLToPath(import.meta.url));
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.tsx'))) {
      const src = readFileSync(join(dir, f), 'utf8');
      const used = [
        ...[...src.matchAll(/<Obj id=(?:"([a-z0-9_]+)"|\{([^}]+)\})/g)].flatMap((m) => (m[1] ? [m[1]] : [...m[2].matchAll(/'([a-z0-9_]+)'/g)].map((q) => q[1]))),
        ...[...src.matchAll(/\{ id: '([a-z0-9_]+)', label: '[a-z]+_/g)] /* readout cells */
          .map((m) => m[1]),
      ];
      for (const id of used) expect(ids.has(id), `${f}: ${id}`).toBe(true);
    }
  });

  it('every act has a diagram; acts follow the sheet’s layer sync (01, 02, 02, 02, 03)', () => {
    for (const a of lesson.right_acts) expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure' || (b.kind === 'guided' && !!b.problem_svg)), a.title).toBe(true);
    expect(lesson.right_acts.map((a) => a.sync.layer)).toEqual(['01', '02', '02', '02', '03']);
  });

  it('every wrong quiz option has its own feedback, every question a figure, and the right answer moves', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    for (const q of quiz) {
      expect(q.figure).toBeTruthy();
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback, `${q.id} ${o.key}`).toBeTruthy();
    }
    expect(new Set(quiz.map((q) => q.options.findIndex((o) => o.correct))).size).toBeGreaterThan(2);
  });

  it('guided example: five steps of three options, one right, its position varies; board and hint on each', () => {
    const g = lesson.right_acts[4].blocks.find((b) => b.kind === 'guided');
    if (!g || g.kind !== 'guided') throw new Error('no guided block');
    expect(g.steps).toHaveLength(5);
    for (const s of g.steps) {
      expect(s.options).toHaveLength(3);
      expect(s.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(10);
      expect(s.board.length).toBeGreaterThan(0);
      expect(s.hint).toBeTruthy();
    }
    expect(new Set(g.steps.map((s) => s.options.findIndex((o) => o.correct))).size).toBe(3);
    expect(g.steps.map((s) => s.layer)).toEqual(['01', '02', '02', '02', '03']);
  });

  it('anti-spoiler: no guided answer before the guided block; stage numbers covered until reached', () => {
    const act5 = lesson.right_acts[4];
    const gi = act5.blocks.findIndex((b) => b.kind === 'guided');
    const g = act5.blocks[gi];
    if (g.kind !== 'guided') throw new Error('no guided block');
    // the six answers of the guided example (4 A, 12 V, 2 A / 0 V, 4 V/s, 3 A, 18 V) are nowhere
    // in the acts before it, nor in its problem or problem diagram
    const before = [
      ...lesson.right_acts.slice(0, 4).map((a) => JSON.stringify(a)),
      JSON.stringify(act5.blocks.slice(0, gi)),
      g.problem,
      g.problem_svg ?? '',
      JSON.stringify(lesson.left_stage_spec),
    ];
    const answers = [
      R`\frac{36}{6+3}`,
      R`v_C(0^-) = 4 \times 3`,
      '4A 电流源',
      '12V 电压源',
      R`\frac{2}{0.5}`,
      R`36 - 6 \times 4 - 12`,
      R`\frac{36}{6+6}`,
      'i_C(0⁺) = 2',
      'v_C(∞) = 18',
      'i_L(∞) = 3',
    ];
    for (const t of before) for (const a of answers) expect(t.includes(a) || t.includes(JSON.stringify(a).slice(1, -1)), a).toBe(false);
    // the step diagrams do not print their own step's answer
    expect(g.steps[1].mini_svg).not.toMatch(/4A 电流源|12V 电压源/);
    expect(g.steps[2].mini_svg).not.toMatch(/=2A|= 2 ?A/);
    expect(g.steps[3].mini_svg).not.toMatch(/2 \/ 0\.5|0 \/ 0\.25/);
    // steps open with the numbers reached so far; finishing uncovers the rest
    expect(g.steps.map((s) => s.params?.w46_g)).toEqual([0, 1, 2, 3, 4]);
    for (const s of g.steps) expect(s.params?.w46_preset).toBe('guided');
    expect(g.done_params).toEqual({ w46_g: 5 });
    // no act or quiz item resets the guided progress
    for (const a of lesson.right_acts) {
      expect(a.sync.params?.w46_g, a.title).toBeUndefined();
      for (const q of a.quiz ?? []) expect(q.sync?.params?.w46_g).toBeUndefined();
    }
  });

  it('Type B: no file of this lesson imports three.js, @react-three or a 3D shared part', () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    for (const f of readdirSync(dir).filter((n) => /\.(ts|tsx)$/.test(n))) {
      const src = readFileSync(join(dir, f), 'utf8');
      const imports = [...src.matchAll(/(?:import|from)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const i of imports) {
        expect(i, `${f} imports ${i}`).not.toMatch(/^three($|\/)|^@react-three\//);
        expect(i, `${f} imports ${i}`).not.toMatch(/BreadboardXray|DmmProbe|Lm358/);
      }
    }
    expect(lesson.left_stage_spec.use_3d).toBe(false);
    expect(lesson.lesson_meta.lesson_type).toBe('B');
  });
});
