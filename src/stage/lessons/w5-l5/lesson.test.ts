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

const R = String.raw;
const render = (tex: string, displayMode: boolean) => katex.renderToString(tex, { displayMode, throwOnError: true, strict: 'ignore' });
const dir = dirname(fileURLToPath(import.meta.url));
const sources = readdirSync(dir).filter((n) => /\.(ts|tsx)$/.test(n) && !n.endsWith('.test.ts'));

describe('W5-L5 lesson', () => {
  const { inline, display } = collect(lesson);
  const guidedAct = lesson.right_acts[6];
  const gi = guidedAct.blocks.findIndex((b) => b.kind === 'guided');
  const g = guidedAct.blocks[gi];
  if (g.kind !== 'guided') throw new Error('no guided block');

  it('matches the registry entry: id, title, minutes, World 5', () => {
    expect(lesson.lesson_meta.lesson_id).toBe('W5-L5');
    expect(lesson.lesson_meta.title).toBe('瞬时功率、平均功率、有效值（RMS）与交流最大功率传输');
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

  it('links only hover-map ids, lights only hover-map ids, and every layer has a renderer', () => {
    const ids = new Set(Object.keys(lesson.left_stage_spec.hover_map));
    for (const s of inline) for (const m of s.matchAll(/\[\[([a-z0-9_,-]+)\|/g)) for (const id of m[1].split(',')) expect(ids.has(id), id).toBe(true);
    for (const l of lesson.left_stage_spec.layers) expect(lesson.renderers[l.id], l.id).toBeTruthy();
    const halos = lesson.right_acts.flatMap((a) => [
      ...(a.sync.halo ?? []),
      ...a.blocks.flatMap((b) => (b.kind === 'guided' ? b.steps.flatMap((s) => s.halo ?? []) : [])),
      ...(a.quiz ?? []).flatMap((q) => q.sync?.halo ?? []),
    ]);
    for (const id of halos) expect(ids.has(id), id).toBe(true);
    // the ids the stage drawings use (hot('…') objects, id="…" sliders and cells) are in the hover map
    const used = new Set<string>();
    for (const f of sources.filter((n) => n.endsWith('.tsx'))) {
      const src = readFileSync(join(dir, f), 'utf8');
      for (const m of src.matchAll(/\bhot\('([a-z0-9_]+)'/g)) used.add(m[1]);
      for (const m of src.matchAll(/\bid="([a-z0-9_]+)"/g)) used.add(m[1]);
      for (const m of src.matchAll(/\bid=\{[^}]*\}/g)) for (const q of m[0].matchAll(/'([a-z0-9_]+)'/g)) used.add(q[1]);
    }
    expect(used.size).toBeGreaterThan(20);
    for (const id of used) expect(ids.has(id), id).toBe(true);
    // and every hover-map id is drawn somewhere
    for (const id of ids) expect(used.has(id), `unused ${id}`).toBe(true);
  });

  it('short layer labels; acts follow the sheet (01, 01, 02, 02, 03, 03; the guided part 03); every act has a diagram', () => {
    for (const l of lesson.left_stage_spec.layers) expect([...l.label].length, l.label).toBeLessThanOrEqual(14);
    expect(lesson.right_acts.map((a) => a.sync.layer)).toEqual(['01', '01', '02', '02', '03', '03', '03']);
    for (const a of lesson.right_acts) expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure' || (b.kind === 'guided' && !!b.problem_svg)), a.title).toBe(true);
  });

  it('every wrong quiz option has its own feedback, every question a figure, and the right answer moves', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    for (const q of quiz) {
      expect(q.figure).toBeTruthy();
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback, `${q.id} ${o.key}`).toBeTruthy();
      // no quiz figure prints its answer
      expect(q.figure).not.toMatch(/=\s*(200|0 W|10 V|12 W|3 \+ j4)/);
      // a quiz item only changes the layer and the halo, never the stage numbers
      expect(q.sync?.params).toBeUndefined();
    }
    expect(new Set(quiz.map((q) => q.options.findIndex((o) => o.correct))).size).toBeGreaterThan(2);
  });

  it('guided example: five steps of three options, one right, its position varies; board and hint on each', () => {
    expect(g.steps).toHaveLength(5);
    for (const s of g.steps) {
      expect(s.options).toHaveLength(3);
      expect(s.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of s.options) expect(o.feedback.length).toBeGreaterThan(10);
      expect(s.board.length).toBeGreaterThan(0);
      expect(s.hint).toBeTruthy();
      expect(s.mini_svg).toBeTruthy();
      expect(s.layer).toBe('03');
    }
    expect(new Set(g.steps.map((s) => s.options.findIndex((o) => o.correct))).size).toBe(3);
    // the sheet's intercepts are the feedback of the wrong options they correct
    expect(g.steps[0].options.find((o) => !o.correct)?.feedback).toContain('慢着！检查一下你的并联运算');
    expect(g.steps[1].options.some((o) => !o.correct && o.feedback.startsWith(R`别把 $+j8\ \Omega$ 算进分压里`))).toBe(true);
    expect(g.steps[2].options.some((o) => !o.correct && o.feedback.startsWith('警惕“直接相等”陷阱'))).toBe(true);
    expect(g.steps[3].options.some((o) => !o.correct && o.feedback.startsWith('记住正弦波换算铁律'))).toBe(true);
    expect(g.steps[4].options.some((o) => !o.correct && o.feedback.startsWith(R`如果你算出 $10\text{ W}$`))).toBe(true);
  });

  it('anti-spoiler: no guided answer before the guided block; stage numbers covered until reached', () => {
    const before = [
      ...lesson.right_acts.slice(0, 6).map((a) => JSON.stringify(a)),
      JSON.stringify(guidedAct.blocks.slice(0, gi)),
      g.problem,
      g.problem_svg ?? '',
      JSON.stringify(lesson.left_stage_spec),
    ];
    const answers = ['5 + j3', '5+j3', '5 - j3', '5-j3', '5 − j3', '10 - j10', '10-j10', R`10\sqrt{2}\angle`, '10√2∠', R`P_{\max} = 5`, '= 5 W', R`= 5\text{ W}`];
    for (const t of before) for (const a of answers) expect(t.includes(a) || t.includes(JSON.stringify(a).slice(1, -1)), a).toBe(false);
    // the step diagrams do not print their own step's answer
    expect(g.steps[2].mini_svg).not.toMatch(/5 - j3|容性共轭抵消/);
    expect(g.steps[3].mini_svg).not.toMatch(/>10 V<|÷√2/);
    expect(g.steps[4].mini_svg).not.toMatch(/= 5 W|200\/40|100\/20/);
    // steps open with the numbers reached so far, on the guided circuit; finishing uncovers the rest
    expect(g.steps.map((s) => s.params?.w55_g)).toEqual([0, 1, 2, 3, 4]);
    for (const s of g.steps) expect(s.params?.w55_src).toBe('gd');
    expect(g.done_params).toEqual({ w55_g: 5 });
    // no act or quiz item resets the guided progress
    for (const a of lesson.right_acts) {
      expect(a.sync.params?.w55_g, a.title).toBeUndefined();
      for (const q of a.quiz ?? []) expect(q.sync?.params?.w55_g).toBeUndefined();
    }
    // the layer gates every guided number on w55_g
    const layer = readFileSync(join(dir, 'MatchLayer.tsx'), 'utf8');
    for (const gate of ['seen(1)', 'seen(2)', 'seen(3)', 'seen(4)', 'seen(5)']) expect(layer).toContain(gate);
  });

  it('Type D, strictly 2D: no file of this lesson imports three.js, @react-three or a 3D shared part', () => {
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
    for (const l of lesson.left_stage_spec.layers) expect(l.render_mode).toBe('2D_INTERACTIVE_SVG');
  });

  it('students see no build notes or sheet field names', () => {
    const all = JSON.stringify(lesson.right_acts) + JSON.stringify(lesson.left_stage_spec) + JSON.stringify(lesson.lesson_meta);
    for (const w of ['Claude', 'JSON', 'professor_intercept', 'expected_answer', 'passing_score', 'board_append', 'concept_tag']) expect(all.includes(w), w).toBe(false);
  });
});
