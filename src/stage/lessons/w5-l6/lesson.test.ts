import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useStage } from '../../stageStore';
import type { ActBlock, StageLesson } from '../../types';
import lesson from './index';
import PfcLayer from './PfcLayer';
import { P } from './parts';

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
const sources = readdirSync(dir)
  .filter((n) => /\.(ts|tsx)$/.test(n))
  .map((n) => ({ n, src: readFileSync(join(dir, n), 'utf8') }));

describe('W5-L6 lesson', () => {
  const { inline, display } = collect(lesson);

  it('keeps the registry metadata', () => {
    const m = lesson.lesson_meta;
    expect([m.lesson_id, m.title, m.estimated_minutes, m.world]).toEqual(['W5-L6', '视在功率、复功率、功率三角形与功率因数校正', 45, 'World 5']);
    expect(m.lesson_type).toBe('D');
  });

  it('renders every formula in KaTeX, and leaves no stray $ or backslash in the text', () => {
    let n = 0;
    for (const s of inline)
      for (const m of s.matchAll(/\$([^$]+)\$/g)) {
        expect(() => render(m[1], false), m[1]).not.toThrow();
        n++;
      }
    for (const t of display) expect(() => render(t, true), t).not.toThrow();
    expect(n + display.length).toBeGreaterThan(250);
    for (const s of inline) {
      const rest = s.replace(/\$[^$]+\$/g, '');
      expect(rest, s).not.toMatch(/\$|\\[a-zA-Z`]/);
    }
  });

  it('links only hover-map ids, every halo is one, and the stage drawings use only hover-map ids', () => {
    const ids = new Set(Object.keys(lesson.left_stage_spec.hover_map));
    let links = 0;
    for (const s of inline)
      for (const m of s.matchAll(/\[\[([a-z0-9_,-]+)\|/g))
        for (const id of m[1].split(',')) {
          expect(ids.has(id), id).toBe(true);
          links++;
        }
    expect(links).toBeGreaterThan(25);
    for (const l of lesson.left_stage_spec.layers) expect(lesson.renderers[l.id], l.id).toBeTruthy();
    const halos = lesson.right_acts.flatMap((a) => [
      ...(a.sync.halo ?? []),
      ...a.blocks.flatMap((b) => (b.kind === 'guided' ? b.steps.flatMap((s) => s.halo ?? []) : [])),
      ...(a.quiz ?? []).flatMap((q) => q.sync?.halo ?? []),
    ]);
    for (const id of halos) expect(ids.has(id), id).toBe(true);
    const used = new Set<string>();
    for (const { n, src } of sources.filter((f) => f.n.endsWith('.tsx'))) {
      for (const m of src.matchAll(/<Obj (?:key=\{[^}]+\} )?id=(?:"([a-z0-9_]+)"|\{IDS\[i\]\})/g)) if (m[1]) used.add(m[1]);
      for (const m of src.matchAll(/hover="([a-z0-9_]+)"/g)) used.add(m[1]);
      for (const m of src.matchAll(/\{ id: '([a-z0-9_]+)', label:/g)) used.add(m[1]);
      for (const m of src.matchAll(/const IDS = \[([^\]]+)\]/g)) for (const q of m[1].matchAll(/'([a-z0-9_]+)'/g)) used.add(q[1]);
      for (const id of used) expect(ids.has(id), `${n}: ${id}`).toBe(true);
    }
    // and every hover-map id is drawn somewhere
    for (const id of ids) expect(used.has(id), id).toBe(true);
  });

  it('three short layer labels; acts follow the sheet (01, 01, 02, 03, 03); every act has a diagram', () => {
    for (const l of lesson.left_stage_spec.layers) expect(l.label.length, l.label).toBeLessThanOrEqual(14);
    expect(lesson.right_acts.map((a) => a.sync.layer)).toEqual(['01', '01', '02', '03', '03']);
    for (const a of lesson.right_acts) expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure'), a.title).toBe(true);
  });

  it('quiz: four questions, one right each, every wrong option its own feedback, a figure each, the right answer moves', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    for (const q of quiz) {
      expect(q.figure).toBeTruthy();
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback, `${q.id} ${o.key}`).toBeTruthy();
      expect(q.options.map((o) => o.key)).toEqual(['A', 'B', 'C', 'D']);
    }
    expect(new Set(quiz.map((q) => q.options.findIndex((o) => o.correct))).size).toBe(4);
    // the quiz figures do not print the answers
    expect(quiz[0].figure).not.toMatch(/500|250|30°/);
    expect(quiz[1].figure).not.toMatch(/9\.4|12\.88/);
    expect(quiz[3].figure).not.toMatch(/454|227|691|909/);
  });

  it('guided example: five steps of three options, one right, the position varies; board, hint and stage on each', () => {
    const g = lesson.right_acts[4].blocks.find((b) => b.kind === 'guided');
    if (!g || g.kind !== 'guided') throw new Error('no guided block');
    expect(g.steps).toHaveLength(5);
    for (const s of g.steps) {
      expect(s.options).toHaveLength(3);
      expect(s.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(20);
      expect(s.board.length).toBeGreaterThan(0);
      expect(s.hint).toBeTruthy();
      expect(s.layer).toBe('03');
    }
    expect(new Set(g.steps.map((s) => s.options.findIndex((o) => o.correct))).size).toBe(3);
  });

  it('anti-spoiler: no guided answer before the guided block; the step diagrams ask; the stage stays covered until reached', () => {
    const act5 = lesson.right_acts[4];
    const gi = act5.blocks.findIndex((b) => b.kind === 'guided');
    const g = act5.blocks[gi];
    if (g.kind !== 'guided') throw new Error('no guided block');
    const before = [...lesson.right_acts.slice(0, 4).map((a) => JSON.stringify(a)), JSON.stringify(act5.blocks.slice(0, gi)), g.problem, JSON.stringify(lesson.left_stage_spec)];
    const answers = ['15000', '15 kVAR', '6573', '8426', '8.43', '388.0', '388.1', '104.1', '104.2', '87.7', '16.45'];
    for (const t of before) for (const a of answers) expect(t.includes(a), a).toBe(false);
    // the wiring diagram before the example asks, the full one follows it
    const figs = act5.blocks.map((b, i) => ({ b, i })).filter((x) => x.b.kind === 'figure');
    expect(figs[0].i).toBeLessThan(gi);
    expect(figs[1].i).toBeGreaterThan(gi);
    const [asked, full] = figs.map((x) => (x.b.kind === 'figure' ? x.b.svg : ''));
    expect(asked).toMatch(/\? µF/);
    expect(asked).not.toMatch(/388\.05|104\.2|87\.7|8\.43/);
    expect(full).toMatch(/388\.05 µF/);
    // each step diagram leaves its own answer out
    expect(g.steps[0].mini_svg).not.toMatch(/15000|15 kVAR/);
    expect(g.steps[1].mini_svg).not.toMatch(/6573|6\.57/);
    expect(g.steps[2].mini_svg).not.toMatch(/8426|8\.43/);
    expect(g.steps[3].mini_svg).not.toMatch(/388/);
    expect(g.steps[4].mini_svg).not.toMatch(/104\.17|87\.72|29\.09/);
    // steps open with the steps solved so far, on the factory scenario; finishing uncovers the rest
    expect(g.steps.map((s) => s.params?.[P.g])).toEqual([0, 1, 2, 3, 4]);
    for (const s of g.steps) expect(s.params?.[P.scn]).toBe('factory');
    expect(g.done_params?.[P.g]).toBe(5);
    // no act or quiz item resets the guided progress
    for (const a of lesson.right_acts) {
      expect(a.sync.params?.[P.g], a.title).toBeUndefined();
      for (const q of a.quiz ?? []) expect(q.sync?.params?.[P.g]).toBeUndefined();
    }
  });

  it('the stage (layer 03, factory scenario) shows each guided number only once the example has reached it', () => {
    // a server render reads the store's initial state (zustand's server snapshot): set the params there
    const init = useStage.getInitialState();
    const saved = init.params;
    const render = (params: Record<string, unknown>) => {
      init.params = params;
      return renderToStaticMarkup(createElement(PfcLayer));
    };
    const html = (g: number, c: number) => render({ [P.scn]: 'factory', [P.g]: g, [P.c]: c, [P.pf2]: 0.95 });
    const h0 = html(0, 0);
    for (const a of ['15.00 kVAR', '6573', '8426', '388.05', '104.17', '87.72', '25.00 kVA', '29.09']) expect(h0.includes(a), `g=0: ${a}`).toBe(false);
    expect(h0).toMatch(/第 4 步求出 C 后解锁/);
    // a C left on the slider by act 4 does not leak while the slider is locked
    const h0c = html(0, 310.44);
    expect(h0c.includes('8426') || h0c.includes('1685')).toBe(false);
    const h1 = html(1, 0);
    expect(h1).toMatch(/15\.00 kVAR/);
    expect(h1.includes('6573')).toBe(false);
    const h2 = html(2, 0);
    expect(h2).toMatch(/6573\.68 VAR/);
    expect(h2.includes('8426')).toBe(false);
    const h3 = html(3, 0);
    expect(h3).toMatch(/8426\.32 VAR/);
    expect(h3.includes('388.05')).toBe(false);
    const h4 = html(4, 388.05);
    expect(h4).toMatch(/388\.05/);
    for (const a of ['104.17', '87.72', '29.09']) expect(h4.includes(a), `g=4: ${a}`).toBe(false);
    const h5 = html(5, 388.05);
    for (const a of ['104.17 A', '87.72 A', '29.09%', '15.79%']) expect(h5.includes(a), `g=5: ${a}`).toBe(true);
    // Sadiku's scenario is act 4's own example: nothing covered
    const s = render({ [P.scn]: 'sadiku', [P.c]: 310.44, [P.pf2]: 0.95 });
    for (const a of ['41.67 A', '35.09 A', '1685.2', '3000.00 VAR']) expect(s.includes(a), a).toBe(true);
    init.params = saved;
  });

  it('strictly 2D: no file of this lesson imports three.js, @react-three or a 3D shared part', () => {
    for (const { n, src } of sources) {
      const imports = [...src.matchAll(/(?:import|from)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const i of imports) {
        expect(i, `${n} imports ${i}`).not.toMatch(/^three($|\/)|^@react-three\//);
        expect(i, `${n} imports ${i}`).not.toMatch(/BreadboardXray|DmmProbe|Lm358|Passives3D/);
      }
    }
    expect(lesson.left_stage_spec.use_3d).toBe(false);
    for (const l of lesson.left_stage_spec.layers) expect(l.render_mode).toBe('2D_INTERACTIVE_SVG');
  });

  it('no developer-facing text reaches the student', () => {
    const all = JSON.stringify(lesson.right_acts) + JSON.stringify(lesson.left_stage_spec) + JSON.stringify(lesson.lesson_meta);
    expect(all).not.toMatch(/Claude|JSON|professor_intercept|expected_answer|passing_score|left_stage_spec|落地清单/);
  });
});
