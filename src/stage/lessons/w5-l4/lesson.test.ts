import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { ActBlock, StageLesson } from '../../types';
import lesson from './index';
import { SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6 } from './svgs';

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
        inline.push(b.caption ?? '');
        break;
      case 'guided':
        inline.push(b.title, b.source ?? '', b.problem, b.conclusion ?? '');
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
const dir = dirname(fileURLToPath(import.meta.url));
const guidedOf = (l: StageLesson) => {
  const act = l.right_acts[5];
  const gi = act.blocks.findIndex((b) => b.kind === 'guided');
  const g = act.blocks[gi];
  if (!g || g.kind !== 'guided') throw new Error('no guided block');
  return { act, gi, g };
};

describe('W5-L4 lesson', () => {
  const { inline, display } = collect(lesson);

  it('keeps the registry’s id, title, minutes and world', () => {
    expect(lesson.lesson_meta.lesson_id).toBe('W5-L4');
    expect(lesson.lesson_meta.title).toBe('交流网络定理与交流运放电路（叠加、电源变换、交流戴维南与运放）');
    expect(lesson.lesson_meta.estimated_minutes).toBe(55);
    expect(lesson.lesson_meta.world).toBe('World 5');
  });

  it('renders every formula in KaTeX, and leaves no stray $ or backslash in the text', () => {
    for (const s of inline) for (const m of s.matchAll(/\$([^$]+)\$/g)) expect(() => render(m[1], false), m[1]).not.toThrow();
    for (const t of display) expect(() => render(t, true), t).not.toThrow();
    for (const s of inline) {
      const rest = s.replace(/\$[^$]+\$/g, '');
      expect(rest, s).not.toMatch(/\$|\\[a-zA-Z`]/);
    }
  });

  it('links only hover-map ids, and every layer has a renderer and a short label', () => {
    const ids = new Set(Object.keys(lesson.left_stage_spec.hover_map));
    for (const s of inline) for (const m of s.matchAll(/\[\[([a-z0-9_,-]+)\|/g)) for (const id of m[1].split(',')) expect(ids.has(id), id).toBe(true);
    for (const l of lesson.left_stage_spec.layers) {
      expect(lesson.renderers[l.id], l.id).toBeTruthy();
      expect([...l.label].length, l.label).toBeLessThanOrEqual(14);
    }
    const halos = lesson.right_acts.flatMap((a) => [
      ...(a.sync.halo ?? []),
      ...a.blocks.flatMap((b) => (b.kind === 'guided' ? b.steps.flatMap((s) => s.halo ?? []) : [])),
      ...(a.quiz ?? []).flatMap((q) => q.sync?.halo ?? []),
    ]);
    for (const id of halos) expect(ids.has(id), id).toBe(true);
    // the ids the stage drawings use (objects, readout cells, control highlights) are all in the hover map
    const used = new Set<string>(['uni_dc', 'uni_w1', 'uni_w2']); // Superpose: `uni_${uni}`
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.tsx'))) {
      const src = readFileSync(join(dir, f), 'utf8');
      for (const m of src.matchAll(/\bid="([a-z0-9_]+)"/g)) used.add(m[1]);
      for (const m of src.matchAll(/\bhot: '([a-z0-9_]+)'/g)) used.add(m[1]);
      for (const m of src.matchAll(/'(ph_[a-z0-9]+)'/g)) used.add(m[1]);
    }
    expect(used.size).toBeGreaterThan(40);
    for (const id of used) expect(ids.has(id), id).toBe(true);
  });

  it('every act has a diagram; acts follow the sheet’s layers (01, 02, 02, 02, 03, 01)', () => {
    for (const a of lesson.right_acts) expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure' || (b.kind === 'guided' && !!b.problem_svg)), a.title).toBe(true);
    expect(lesson.right_acts.map((a) => a.sync.layer)).toEqual(['01', '02', '02', '02', '03', '01']);
  });

  it('the sheet diagrams lost their page-wide <style> class rules (inlined as attributes)', () => {
    for (const s of [SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6]) {
      expect(s).not.toMatch(/<style|\sclass=/);
      expect(s).not.toMatch(/#0f172a/i); // the dark canvas is recoloured
    }
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
    // the figures do not print the answers
    const words = (svg = '') => svg.replace(/<[^>]+>/g, ' ');
    expect(words(quiz[0].figure)).not.toMatch(/14\.14|cos\(5t/);
    expect(words(quiz[1].figure)).not.toMatch(/2\.4|23\.13/);
    expect(words(quiz[2].figure)).not.toMatch(/5 \+ j5|5\+j5/);
    expect(words(quiz[3].figure)).not.toMatch(/2\.5|135/);
  });

  it('guided example: five steps of three options, one right, its position varies; board and hint on each', () => {
    const { g } = guidedOf(lesson);
    expect(g.steps).toHaveLength(5);
    for (const s of g.steps) {
      expect(s.options).toHaveLength(3);
      expect(s.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(10);
      expect(s.board.length).toBeGreaterThan(0);
      expect(s.hint).toBeTruthy();
    }
    expect(new Set(g.steps.map((s) => s.options.findIndex((o) => o.correct))).size).toBe(3);
    expect(g.steps.map((s) => s.layer)).toEqual(['01', '01', '01', '01', '01']);
  });

  it('anti-spoiler: no guided answer before the guided block; stage numbers covered until reached', () => {
    const { act, gi, g } = guidedOf(lesson);
    // the guided example's answers are nowhere in the acts before it, nor in its problem, its
    // problem diagram or the stage spec
    const before = [
      ...lesson.right_acts.slice(0, 5).map((a) => JSON.stringify(a)),
      JSON.stringify(act.blocks.slice(0, gi)),
      g.problem,
      g.problem_svg ?? '',
      JSON.stringify(lesson.left_stage_spec),
    ];
    const answers = [R`\frac{4}{2 + 4}`, '4.00', '1.6 + j0.8', '1.6 - j1.2', '4 + j8', '8.94', '63.43', '0.35 + j0.80', '0.8732', '5.73', '66.37', 'j0.80'];
    for (const t of before) for (const a of answers) expect(t.includes(a) || t.includes(JSON.stringify(a).slice(1, -1)), a).toBe(false);
    // the step diagrams do not print their own step's answer
    expect(g.steps[1].mini_svg).not.toMatch(/L短路|C开路/);
    expect(g.steps[2].mini_svg).not.toMatch(/2\+j2|-j2Ω/);
    expect(g.steps[3].mini_svg).not.toMatch(/2\+j4|-j1Ω/);
    expect(g.steps[4].mini_svg).not.toMatch(/8\.94|5\.73/);
    // steps open with the numbers reached so far; finishing uncovers the rest
    expect(g.steps.map((s) => s.params?.w54_g)).toEqual([0, 1, 2, 3, 4]);
    expect(g.steps.map((s) => s.params?.w54_uni)).toEqual(['all', 'dc', 'w1', 'w2', 'all']);
    for (const s of g.steps) expect(s.params?.w54_sup).toBe('guided');
    expect(g.done_params).toEqual({ w54_g: 5 });
    // no act or quiz item resets the guided progress
    for (const a of lesson.right_acts) {
      expect(a.sync.params?.w54_g, a.title).toBeUndefined();
      for (const q of a.quiz ?? []) expect(q.sync?.params?.w54_g).toBeUndefined();
    }
  });

  it('Type B, strictly 2D: no file of this lesson imports three.js, @react-three or a 3D shared part', () => {
    for (const f of readdirSync(dir).filter((n) => /\.(ts|tsx)$/.test(n))) {
      const src = readFileSync(join(dir, f), 'utf8');
      const imports = [...src.matchAll(/(?:import|from)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const i of imports) {
        expect(i, `${f} imports ${i}`).not.toMatch(/^three($|\/)|^@react-three\//);
        expect(i, `${f} imports ${i}`).not.toMatch(/BreadboardXray|DmmProbe|Lm358|Passives3D/);
      }
    }
    expect(lesson.left_stage_spec.use_3d).toBe(false);
    expect(lesson.lesson_meta.lesson_type).toBe('B');
  });
});
