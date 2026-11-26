import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { STAGE_LESSON_ENTRY } from '../../registry';
import type { ActBlock, StageLesson } from '../../types';
import lesson from './index';
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
const sources = readdirSync(dir).filter((n) => /\.(ts|tsx)$/.test(n));

function guidedOf(l: StageLesson) {
  const act = l.right_acts[5];
  const gi = act.blocks.findIndex((b) => b.kind === 'guided');
  const g = act.blocks[gi];
  if (!g || g.kind !== 'guided') throw new Error('no guided block');
  return { act, gi, g };
}

describe('W5-L1 lesson', () => {
  const { inline, display } = collect(lesson);

  it('matches the registry: id, title, minutes, World 5; five acts', () => {
    const reg = STAGE_LESSON_ENTRY.get('w5-l1')!;
    expect(lesson.lesson_meta.lesson_id).toBe(reg.code);
    expect(lesson.lesson_meta.title).toBe(reg.title.zh);
    expect(lesson.lesson_meta.estimated_minutes).toBe(reg.minutes);
    expect(lesson.lesson_meta.world).toBe('World 5');
    // the sheet's five acts, then the guided example and the quiz as an act of their own
    expect(lesson.right_acts.map((a) => a.act_index)).toEqual([1, 2, 3, 4, 5, 6]);
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
    const { g } = guidedOf(lesson);
    const halos = [...lesson.right_acts.flatMap((a) => [...(a.sync.halo ?? []), ...(a.quiz ?? []).flatMap((q) => q.sync?.halo ?? [])]), ...g.steps.flatMap((s) => s.halo ?? [])];
    for (const id of halos) expect(ids.has(id), id).toBe(true);
    // the ids the stage drawings use (<Obj id=…>, <Cell id=…>, useHot(…), Slider id=…) are all in the hover map
    for (const f of sources.filter((n) => n.endsWith('.tsx'))) {
      const src = readFileSync(join(dir, f), 'utf8');
      const used = [...src.matchAll(/(?:<Obj|<Cell|<Slider)[^>]*?\bid="([a-z0-9_]+)"/g), ...src.matchAll(/useHot\('([a-z0-9_]+)'\)/g)].map((m) => m[1]);
      for (const m of src.matchAll(/id: '([a-z]{2,3}_[a-z0-9_]+)'/g)) used.push(m[1]);
      if (f.endsWith('Layer.tsx')) expect(used.length, f).toBeGreaterThan(0);
      for (const id of used) expect(ids.has(id), `${f}: ${id}`).toBe(true);
    }
    // layer labels stay short (the lens bar), the full names are in the captions
    for (const l of lesson.left_stage_spec.layers) expect([...l.label].length, l.label).toBeLessThanOrEqual(14);
  });

  it('every act has a diagram; acts follow the sheet’s layer links (01, 02, 01, 02, 03), the guided act opens on 02', () => {
    for (const a of lesson.right_acts) expect(!!a.inline_svg || a.blocks.some((b) => b.kind === 'figure' || (b.kind === 'guided' && !!b.problem_svg)), a.title).toBe(true);
    expect(lesson.right_acts.map((a) => a.sync.layer)).toEqual(['01', '02', '01', '02', '03', '02']);
  });

  it('every wrong quiz option has its own feedback, every question a figure, the right answer moves', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    for (const q of quiz) {
      expect(q.figure).toBeTruthy();
      expect(q.options).toHaveLength(4);
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback, `${q.id} ${o.key}`).toBeTruthy();
    }
    expect(new Set(quiz.map((q) => q.options.findIndex((o) => o.correct))).size).toBeGreaterThan(2);
    // the figures do not print the answers
    const answers = ['50°', '135°', '30∠60°', '非法'];
    quiz.forEach((q, i) => expect(q.figure, q.id).not.toContain(answers[i]));
    // the next-lesson preview comes after the quiz
    expect(JSON.stringify(lesson.right_acts[5].after_quiz)).toContain('W5-L2');
    expect(JSON.stringify(lesson.right_acts[5].blocks)).not.toContain('教授收官点睛');
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
      expect(s.mini_svg).toBeTruthy();
    }
    expect(new Set(g.steps.map((s) => s.options.findIndex((o) => o.correct))).size).toBe(3);
    expect(g.steps.map((s) => s.layer)).toEqual(['02', '03', '03', '03', '01']);
  });

  it('anti-spoiler: no guided answer before the guided block; step diagrams and stage keep them covered', () => {
    const { act, gi, g } = guidedOf(lesson);
    const before = [
      ...lesson.right_acts.slice(0, 5).map((a) => JSON.stringify(a)),
      JSON.stringify(act.blocks.slice(0, gi)),
      g.problem,
      g.problem_svg ?? '',
      JSON.stringify(lesson.left_stage_spec),
    ];
    // the answers of the five steps, as TeX and as diagram text
    const answers = [
      '20\\angle -60',
      '20\\angle{-}60',
      '20∠−60',
      '6 + j8',
      '6+j8',
      '10\\angle 53.13',
      '10\\angle{53',
      '10∠53.13',
      '2\\angle -113.13',
      '2\\angle{-}113.13',
      '2∠−113.13',
      '113.13',
      '4t - 113',
      '4t − 113',
    ];
    for (const t of before) for (const a of answers) expect(t.includes(a) || t.includes(JSON.stringify(a).slice(1, -1)), a).toBe(false);
    // each step diagram leaves its own answer out (earlier answers may stay)
    const own = [
      ['−60', '20∠−60'],
      ['j8', '6 + j8'],
      ['10∠', '53.13°<'],
      ['= 2<', '−113.13'],
      ['cos(4t', '验证通过'],
    ];
    g.steps.forEach((s, i) => {
      for (const a of own[i]) expect(s.mini_svg, `step ${i + 1}: ${a}`).not.toContain(a);
    });
    // the stage: steps open with the numbers reached so far, finishing uncovers the rest
    expect(g.steps.map((s) => s.params?.[P.g])).toEqual([0, 1, 2, 3, 4]);
    for (const s of g.steps.slice(1, 4)) expect(s.params?.[P.eq]).toBe('guided');
    expect(g.done_params).toEqual({ [P.g]: 5 });
    // step 1 does not load the guided problem into the compass (that would print 20∠−60°)
    expect(g.steps[0].params).toEqual({ [P.g]: 0 });
    // no act or quiz item resets the guided progress or loads the guided equation
    for (const a of lesson.right_acts) {
      expect(a.sync.params?.[P.g], a.title).toBeUndefined();
      expect(a.sync.params?.[P.eq], a.title).not.toBe('guided');
      for (const q of a.quiz ?? []) {
        expect(q.sync?.params?.[P.g]).toBeUndefined();
        expect(q.sync?.params?.[P.eq]).not.toBe('guided');
      }
    }
    // the stage layer masks the guided equation's numbers by steps solved
    const op = readFileSync(join(dir, 'OperatorLayer.tsx'), 'utf8');
    for (const n of [1, 2, 3, 4, 5]) expect(op).toContain(`q(${n},`);
  });

  it('strictly 2D: no file of this lesson imports three.js, @react-three or a 3D shared part', () => {
    for (const f of sources) {
      const src = readFileSync(join(dir, f), 'utf8');
      const imports = [...src.matchAll(/(?:import|from)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const i of imports) {
        expect(i, `${f} imports ${i}`).not.toMatch(/^three($|\/)|^@react-three\//);
        expect(i, `${f} imports ${i}`).not.toMatch(/BreadboardXray|DmmProbe|Lm358|Passives3D/);
      }
      if (!f.endsWith('.test.ts')) expect(src, f).not.toMatch(/<Canvas\b/);
    }
    expect(lesson.left_stage_spec.use_3d).toBe(false);
    expect(lesson.left_stage_spec.layers.every((l) => l.render_mode === '2D_INTERACTIVE_SVG')).toBe(true);
  });
});
