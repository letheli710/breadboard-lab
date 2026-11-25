import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { describe, expect, it } from 'vitest';
import type { ActBlock, StageLesson } from '../../types';
import lesson from './index';
import { ALL_LAYER_TEX } from './tex';

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
        inline.push(...b.head, ...b.rows.flat(), b.caption ?? '');
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
const dir = dirname(fileURLToPath(import.meta.url));
const sources = readdirSync(dir).filter((n) => /\.(ts|tsx)$/.test(n) && !n.endsWith('.test.ts'));

describe('W5-L7 lesson', () => {
  const { inline, display } = collect(lesson);

  it('renders every formula in KaTeX (throwOnError), and leaves no stray $, backslash or raw subscript in the text', () => {
    let n = 0;
    for (const s of inline)
      for (const m of s.matchAll(/\$([^$]+)\$/g)) {
        expect(() => render(m[1], false), m[1]).not.toThrow();
        n++;
      }
    for (const t of display) expect(() => render(t, true), t).not.toThrow();
    for (const t of ALL_LAYER_TEX) expect(() => render(t, true), t).not.toThrow();
    expect(n).toBeGreaterThan(150);
    for (const s of inline) {
      const rest = s.replace(/\$[^$]+\$/g, '');
      expect(rest, s).not.toMatch(/\$|\\[a-zA-Z`]/);
      expect(rest.replace(/\[\[[a-z0-9_,-]+\|/g, ''), s).not.toMatch(/[A-Za-zω]_[A-Za-z0-9]/);
    }
  });

  it('the sheet’s dropped closing braces are restored', () => {
    const all = [...inline, ...display].join('\n');
    expect(all).toContain(String.raw`\frac{\dfrac{1}{j\omega C}}{R + \dfrac{1}{j\omega C}}`);
    expect(all).toContain(String.raw`\frac{1}{\sqrt{1 + (\omega/\omega_c)^2}}`);
    expect(all).toContain(String.raw`\frac{1}{10^3 \times 10^{-6}} = 1000`);
    expect(all).toContain(String.raw`G_{\text{dB}} = 10\log_{10}`);
    expect(all).toContain(String.raw`H_{\text{dB}}(\omega) = 20\log_{10}`);
    expect(all).toContain(String.raw`\sqrt{\frac{P_2}{P_1}} = \frac{1}{\sqrt{2}}`);
    expect(all).toContain(String.raw`M_r = \frac{1}{2\zeta\sqrt{1-\zeta^2}}`);
    expect(all).toContain(String.raw`\left(\frac{\omega}{\omega_{p2}}\right)^2}`);
    expect(all).toContain(String.raw`\omega_0 = \sqrt{\omega_{p1}\omega_{p2}}`);
    expect(all).toContain(String.raw`H_{\text{dB,mid}} = 20\log_{10}(10 \times 2)`);
    expect(all).not.toMatch(/_\{\\text\{dB(,mid)?\}(?!\})/);
  });

  it('links only hover-map ids; every layer has a renderer and a short label', () => {
    const ids = new Set(Object.keys(lesson.left_stage_spec.hover_map));
    for (const s of inline) for (const m of s.matchAll(/\[\[([a-z0-9_,-]+)\|/g)) for (const id of m[1].split(',')) expect(ids.has(id), id).toBe(true);
    for (const l of lesson.left_stage_spec.layers) {
      expect(lesson.renderers[l.id], l.id).toBeTruthy();
      expect(l.label.length, l.label).toBeLessThanOrEqual(14);
    }
    const halos = lesson.right_acts.flatMap((a) => [
      ...(a.sync.halo ?? []),
      ...a.blocks.flatMap((b) => (b.kind === 'guided' ? b.steps.flatMap((s) => s.halo ?? []) : [])),
      ...(a.quiz ?? []).flatMap((q) => q.sync?.halo ?? []),
    ]);
    for (const id of halos) expect(ids.has(id), id).toBe(true);
    // the ids the stage drawings and readouts use are all in the hover map
    for (const f of sources.filter((n) => n.endsWith('.tsx'))) {
      const src = readFileSync(join(dir, f), 'utf8');
      const used = [...src.matchAll(/<(?:Obj|Cell|LogSlider) id="([a-z0-9_]+)"/g), ...src.matchAll(/useHot\('([a-z0-9_]+)'\)/g)].map((m) => m[1]);
      expect(used.length, f).toBeGreaterThanOrEqual(f === 'Layer01.tsx' ? 10 : 0);
      for (const id of used) expect(ids.has(id), `${f}: ${id}`).toBe(true);
    }
    // hover-map names and lines are plain text on the page: no raw subscripts or carets
    for (const t of Object.values(lesson.left_stage_spec.hover_map)) expect(`${t.label} ${t.desc}`).not.toMatch(/[_^]/);
    // the factor ids of the transfer functions (Obj id={f.id}, chips) are hover-map ids
    for (const id of ['f_k', 'f_origin', 'f_p1', 'f_p2', 'f_real', 'f_quad']) expect(ids.has(id), id).toBe(true);
  });

  it('six acts, each with a diagram; acts follow the stage (01, 01, 02, 03, 02, 02)', () => {
    expect(lesson.right_acts).toHaveLength(6);
    for (const a of lesson.right_acts) expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure' || (b.kind === 'guided' && !!b.problem_svg)), a.title).toBe(true);
    expect(lesson.right_acts.map((a) => a.sync.layer)).toEqual(['01', '01', '02', '03', '02', '02']);
  });

  it('quiz: four questions, one right option each at varied positions, own feedback for each wrong one, a figure each', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    for (const q of quiz) {
      expect(q.figure).toBeTruthy();
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback, `${q.id} ${o.key}`).toBeTruthy();
    }
    expect(new Set(quiz.map((q) => q.options.findIndex((o) => o.correct))).size).toBe(4);
  });

  it('guided example: five steps of four options, one right, its position varies; board, hint and layer on each', () => {
    const g = lesson.right_acts[4].blocks.find((b) => b.kind === 'guided');
    if (!g || g.kind !== 'guided') throw new Error('no guided block');
    expect(g.steps).toHaveLength(5);
    for (const s of g.steps) {
      expect(s.options).toHaveLength(4);
      expect(s.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(10);
      expect(s.board.length).toBeGreaterThan(0);
      expect(s.hint).toBeTruthy();
    }
    expect(new Set(g.steps.map((s) => s.options.findIndex((o) => o.correct))).size).toBeGreaterThanOrEqual(4);
    expect(g.steps.map((s) => s.layer)).toEqual(['01', '03', '03', '02', '02']);
  });

  it('anti-spoiler: no guided answer before the guided block; the reference plot comes after it; the stage is covered until reached', () => {
    const act5 = lesson.right_acts[4];
    const gi = act5.blocks.findIndex((b) => b.kind === 'guided');
    const g = act5.blocks[gi];
    if (g.kind !== 'guided') throw new Error('no guided block');
    const before = [
      ...lesson.right_acts.slice(0, 4).map((a) => JSON.stringify(a)),
      JSON.stringify(act5.blocks.slice(0, gi)),
      g.problem,
      g.problem_svg ?? '',
      JSON.stringify(lesson.left_stage_spec),
    ];
    // the guided example's answers: K = 2000/200 = 10, its 23.01 dB corners, its √200 ≈ 14.14 center,
    // its 2…100 plateau
    const answers = ['23.01', '14.14', '√200', 'sqrt{200}', '2000 / 200', '2 × 100 = 200', '2×100 = 200', '2 < ω < 100', '2 < \\omega < 100', 'ω_p2=100.0'];
    for (const t of before) for (const a of answers) expect(t.includes(a), a).toBe(false);
    // the reference Bode plot of the example (参考波特图) stands right after the guided block
    const after = act5.blocks.slice(gi + 1);
    expect(after.some((b) => b.kind === 'figure' && b.svg.includes('23.01 dB'))).toBe(true);
    // each step diagram keeps its own step's answer covered
    const [m1, , m3, m4, m5] = g.steps.map((s) => s.mini_svg ?? '');
    expect(m1).not.toMatch(/= ?200(?!0)|K = 10/);
    expect(m3).not.toMatch(/26\.02|(?<![+\d])0 dB\/dec|−20 dB\/dec|250,34 330/);
    expect(m4).not.toMatch(/3\.01|23\.01/);
    expect(m5).not.toMatch(/90°|√|14\.14|p1·p2/);
    // steps open with what has been reached; finishing uncovers the rest
    expect(g.steps.map((s) => s.params?.w57_g)).toEqual([0, 1, 2, 3, 4]);
    for (const s of g.steps) expect(s.params?.w57_preset).toBe('guided');
    expect(g.done_params).toEqual({ w57_g: 5 });
    for (const a of lesson.right_acts) {
      expect(a.sync.params?.w57_g, a.title).toBeUndefined();
      for (const q of a.quiz ?? []) expect(q.sync?.params?.w57_g).toBeUndefined();
    }
  });

  it('strictly 2D: no file of this lesson imports three.js, @react-three or a 3D shared part', () => {
    for (const f of readdirSync(dir).filter((n) => /\.(ts|tsx)$/.test(n))) {
      const src = readFileSync(join(dir, f), 'utf8');
      const imports = [...src.matchAll(/(?:import|from)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const i of imports) {
        expect(i, `${f} imports ${i}`).not.toMatch(/^three($|\/)|^@react-three\//);
        expect(i, `${f} imports ${i}`).not.toMatch(/BreadboardXray|DmmProbe|Lm358|Passives3D/);
      }
    }
    expect(lesson.left_stage_spec.use_3d).toBe(false);
    expect(lesson.lesson_meta.lesson_type).toBe('D');
  });
});
