import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { setLang } from '../i18n';
import { answersAgree, checkAnswer, formatAnswer, parseProblem, readAnswer, splitUnit } from './parse';
import type { Question } from './types';

afterEach(() => setLang('zh'));

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

// 10 V source, R1 = 2 Ω (top), R2 = 3 Ω (right side, to ground): i = 2 A, V(a) = 6 V
const base = {
  format: 'circuit-problem/1',
  id: 'test-divider',
  chapter: 'basics',
  title: '分压',
  level: 1,
  statement: '求电流和电压。',
  schematic: {
    elements: [
      { ref: 'Us', type: 'V', from: [0, 0], to: [0, 4], value: 10 },
      { ref: 'R1', type: 'R', from: [2, 0], to: [6, 0], value: 2 },
      { ref: 'R2', type: 'R', from: [8, 0], to: [8, 4], value: 3 },
    ],
    wires: [
      [
        [0, 0],
        [2, 0],
      ],
      [
        [6, 0],
        [8, 0],
      ],
      [
        [8, 4],
        [0, 4],
      ],
    ],
    labels: [{ at: [8, 0], name: 'a' }],
    grounds: [[0, 4]],
  },
  analysis: { type: 'dc' },
  questions: [
    { id: 'i', ask: '电流 i', find: { kind: 'i', el: 'R1' }, answer: 2, unit: 'A', explain: '10 / 5' },
    { id: 'va', ask: 'a 点电压', find: { kind: 'v', nodes: ['a'] }, answer: 6, unit: 'V' },
    { id: 'c', ask: '哪个对？', choices: ['甲', '乙'], correct: 1 },
  ],
  hints: ['串联'],
  solution: '先求电流。',
  i18n: {
    en: {
      title: 'Divider',
      statement: 'Find the current and the voltage.',
      questions: [{ ask: 'Current i', explain: '10 / 5' }, { ask: 'Voltage of a' }, { ask: 'Which?', choices: ['A', 'B'] }],
      hints: ['Series'],
      solution: 'Find the current first.',
    },
  },
};

describe('parseProblem', () => {
  it('accepts a valid problem and localises it', () => {
    const r = parseProblem(base);
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
    const p = r.problem!;
    expect(p.title).toBe('分压');
    expect(p.netlist.nodes).toContain('a');
    expect(p.computed.i).toBeCloseTo(2, 9);
    expect(p.computed.va).toBeCloseTo(6, 9);
    // auto mark for the asked element current
    expect(p.schematic.marks).toContainEqual({ kind: 'i', el: 'R1', name: 'i_R1' });

    setLang('en');
    const e = parseProblem(base).problem!;
    expect(e.title).toBe('Divider');
    expect(e.statement).toBe('Find the current and the voltage.');
    expect(e.questions.map((q) => q.ask)).toEqual(['Current i', 'Voltage of a', 'Which?']);
    expect(e.questions[2].choices).toEqual(['A', 'B']);
    expect(e.questions[1].find).toEqual({ kind: 'v', nodes: ['a'] });
    expect(e.hints).toEqual(['Series']);
    expect(e.textLang).toBe('en');
  });

  it('rejects a wrong answer and shows both numbers and the question id', () => {
    const bad = clone(base);
    bad.questions[1].answer = 6.5;
    const r = parseProblem(bad);
    expect(r.ok).toBe(false);
    const msg = r.errors.join('\n');
    expect(msg).toContain('va');
    expect(msg).toContain('6.5');
    expect(msg).toMatch(/\b6\b/);
  });

  it('accepts answers within 0.5 %', () => {
    const near = clone(base);
    near.questions[1].answer = 6.02;
    expect(parseProblem(near).errors).toEqual([]);
    expect(answersAgree(-90, 270, true)).toBe(true);
    expect(answersAgree(0, 1e-12)).toBe(true);
    expect(answersAgree(1.01, 1)).toBe(false);
  });

  it('reports structural errors', () => {
    const b = clone(base) as Record<string, unknown>;
    b.format = 'circuit-problem/2';
    b.chapter = 'nope';
    b.level = 7;
    b.analysis = { type: 'xx' };
    b.questions = [
      { id: 'x', ask: 'a', find: { kind: 'i', el: 'R9' }, answer: 1, unit: 'A' },
      { id: 'x', ask: 'b', choices: ['1', '2'], correct: 5 },
      { id: 'y', ask: 'c' },
    ];
    const r = parseProblem(b);
    const msg = r.errors.join('\n');
    expect(r.ok).toBe(false);
    for (const s of ['format', 'chapter', 'level', 'analysis.type', 'R9', '重复', 'correct', '"find"']) expect(msg).toContain(s);
  });

  it('warns about missing hints, solution, translation and unit', () => {
    const b = clone(base) as Record<string, unknown>;
    delete b.hints;
    delete b.solution;
    delete b.i18n;
    (b.questions as Record<string, unknown>[])[0].unit = undefined;
    const r = parseProblem(JSON.parse(JSON.stringify(b)));
    expect(r.ok).toBe(true);
    const w = r.warnings.join('\n');
    for (const s of ['hints', 'solution', 'i18n', 'unit']) expect(w).toContain(s);
  });

  it('warns about mismatched translation lengths', () => {
    const b = clone(base);
    b.i18n.en.hints = ['a', 'b'];
    b.i18n.en.questions = [{ ask: 'only one', explain: '' }];
    const r = parseProblem(b);
    expect(r.warnings.some((w) => w.includes('i18n.en.hints'))).toBe(true);
    expect(r.warnings.some((w) => w.includes('i18n.en.questions'))).toBe(true);
  });

  it('passes geometry errors through', () => {
    const b = clone(base);
    b.schematic.grounds = [];
    const r = parseProblem(b);
    expect(r.ok).toBe(false);
    expect(r.errors.join()).toMatch(/接地|ground/i);
  });

  it('auto-adds an output-current mark for an asked op-amp current, keeps loops', () => {
    const b = clone(base) as Record<string, any>;
    b.schematic = {
      elements: [
        { ref: 'Ui', type: 'V', from: [0, 3], to: [0, 5], value: 1 },
        { ref: 'R1', type: 'R', from: [0, 3], to: [3, 3], value: 1 },
        { ref: 'Rf', type: 'R', from: [3, 1], to: [7, 1], value: 2 },
        { ref: 'A', type: 'OPAMP', at: [5, 4] },
      ],
      wires: [
        [[3, 1], [3, 3]],
        [[7, 1], [7, 4]],
        [[0, 5], [3, 5]],
      ],
      grounds: [[0, 5]],
      terminals: [{ at: [7, 4], name: 'o' }],
      loops: [{ at: [1, 4], name: 'i_m1' }],
    };
    // the op-amp output drives −1 A: 1 A flows R1 → Rf INTO the output terminal
    b.questions = [
      { id: 'io', ask: 'i_o', find: { kind: 'i', el: 'A' }, answer: -1, unit: 'A' },
      { id: 'vo', ask: 'u_o', find: { kind: 'v', nodes: ['o'] }, answer: -2, unit: 'V' },
    ];
    b.i18n.en.questions = [{ ask: 'i_o' }, { ask: 'v_o' }];
    const r = parseProblem(b);
    expect(r.errors).toEqual([]);
    expect(r.problem!.schematic.marks).toEqual([{ kind: 'i', el: 'A', name: 'i_A' }]);
    expect(r.problem!.schematic.loops).toEqual([{ at: [1, 4], name: 'i_m1' }]);
    // no auto mark for a quantity a mark can't show (voltage of an op-amp is rejected by the engine anyway)
    b.questions = [{ id: 'io', ask: 'i_o', find: { kind: 'i', el: 'A' }, answer: -1, unit: 'A' }];
    b.schematic.marks = [{ kind: 'i', el: 'A', name: 'i_o' }];
    b.i18n.en.questions = [{ ask: 'i_o' }];
    const r2 = parseProblem(b);
    expect(r2.errors).toEqual([]);
    expect(r2.problem!.schematic.marks).toEqual([{ kind: 'i', el: 'A', name: 'i_o' }]);
  });

  it('two-port with primed terminal names on the ground wire', () => {
    const b = clone(base) as Record<string, any>;
    b.chapter = 'two-port';
    b.schematic = {
      elements: [
        { ref: 'R1', type: 'R', from: [2, 0], to: [5, 0], value: 2 },
        { ref: 'R2', type: 'R', from: [7, 0], to: [10, 0], value: 4 },
        { ref: 'R3', type: 'R', from: [6, 0], to: [6, 4], value: 3 },
      ],
      wires: [
        [[0, 0], [2, 0]],
        [[5, 0], [7, 0]],
        [[10, 0], [12, 0]],
        [[0, 4], [12, 4]],
      ],
      terminals: [
        { at: [0, 0], name: '1' },
        { at: [0, 4], name: "1'" },
        { at: [12, 0], name: '2' },
        { at: [12, 4], name: "2'" },
      ],
      grounds: [[6, 4]],
    };
    const ports = [['1', "1'"], ['2', "2'"]];
    b.questions = [
      { id: 'z11', ask: 'z11', find: { kind: 'twoport', ports, param: 'z11' }, answer: 5, unit: 'Ω' },
      { id: 'z21', ask: 'z21', find: { kind: 'twoport', ports, param: 'z21' }, answer: 3, unit: 'Ω' },
      { id: 'r', ask: 'R', find: { kind: 'req', port: ['2', "2'"] }, answer: 7, unit: 'Ω' },
    ];
    b.i18n.en.questions = [{ ask: 'z11' }, { ask: 'z21' }, { ask: 'R' }];
    const r = parseProblem(b);
    expect(r.errors).toEqual([]);
    expect(r.problem!.computed.z11).toBeCloseTo(5, 9);
    expect(r.problem!.computed.z21).toBeCloseTo(3, 9);
  });
});

describe('checkAnswer', () => {
  const q = (answer: number, unit = 'A', extra: Partial<Question> = {}): Question => ({ id: 'q', ask: '', find: { kind: 'i', el: 'R1' }, answer, unit, ...extra });

  it('reads plain numbers, prefixes and units', () => {
    expect(checkAnswer(q(2500, 'Ω'), '2.5k').ok).toBe(true);
    expect(checkAnswer(q(2500, 'Ω'), '2.5 kΩ').ok).toBe(true);
    expect(checkAnswer(q(2500, 'Ω'), '2500').ok).toBe(true);
    expect(checkAnswer(q(-0.003), '-3mA').ok).toBe(true);
    expect(checkAnswer(q(-0.003), '−3 mA').ok).toBe(true);
    expect(checkAnswer(q(-0.003), '－3m').ok).toBe(true);
    expect(checkAnswer(q(0.0012), '1.2e-3').ok).toBe(true);
    expect(checkAnswer(q(0.0012), '1.2×10^-3').ok).toBe(true);
    expect(checkAnswer(q(1.5), '1，5').ok).toBe(true);
    expect(checkAnswer(q(1234), '1,234').ok).toBe(true);
    expect(checkAnswer(q(4.7e-6, 'F'), '4.7µF').ok).toBe(true);
    expect(checkAnswer(q(4.7e-6, 'F'), '4.7uF').ok).toBe(true);
    expect(checkAnswer(q(1e6, 'Ω'), '1M').ok).toBe(true);
    expect(checkAnswer(q(0.002, 's'), '2ms').ok).toBe(true);
    expect(checkAnswer(q(0.002, 'S'), '2mS').ok).toBe(true);
  });

  it('a bare number is read in the unit shown (which may carry a prefix)', () => {
    expect(checkAnswer(q(-0.001, 'mA'), '-1').ok).toBe(true);
    expect(checkAnswer(q(-0.001, 'mA'), '-1mA').ok).toBe(true);
    expect(checkAnswer(q(-0.001, 'mA'), '-0.001A').ok).toBe(true);
    expect(checkAnswer(q(4700, 'kΩ'), '4.7').ok).toBe(true);
    expect(formatAnswer(q(-0.001, 'mA'))).toBe('-1 mA');
    expect(formatAnswer(q(2.943036, 'V'))).toBe('2.943 V');
  });

  it('uses the tolerance (default 2 %)', () => {
    expect(checkAnswer(q(10), '10.15').ok).toBe(true);
    expect(checkAnswer(q(10), '10.3').ok).toBe(false);
    expect(checkAnswer(q(10, 'A', { tol: 0.05 }), '10.3').ok).toBe(true);
    expect(checkAnswer(q(0), '0').ok).toBe(true);
    expect(checkAnswer(q(0), '0.001').ok).toBe(false);
  });

  it('compares phases modulo 360°', () => {
    const ph = q(-53.13, '°', { find: { kind: 'i', el: 'R1', part: 'phase' } });
    expect(checkAnswer(ph, '306.87').ok).toBe(true);
    expect(checkAnswer(ph, '-53°').ok).toBe(true);
    expect(checkAnswer(ph, '53.13').ok).toBe(false);
  });

  it('explains common mistakes', () => {
    expect(checkAnswer(q(4), '-4').reason).toMatch(/符号|sign/);
    expect(checkAnswer(q(0.004), '4').reason).toMatch(/1000/);
    expect(checkAnswer(q(4), 'abc').reason).toBeTruthy();
    expect(checkAnswer(q(4), '4 V').reason).toMatch(/单位|unit/i);
    expect(checkAnswer(q(4), '').ok).toBe(false);
  });

  it('splits units', () => {
    expect(splitUnit('kΩ')).toEqual({ scale: 1e3, unit: 'Ω' });
    expect(splitUnit('m')).toEqual({ scale: 1e-3, unit: '' });
    expect(splitUnit('A')).toEqual({ scale: 1, unit: 'A' });
    expect(splitUnit('var')).toEqual({ scale: 1, unit: 'var' });
    expect(splitUnit('kvar')).toEqual({ scale: 1e3, unit: 'var' });
    expect(splitUnit('xyz')).toBeNull();
    expect('value' in readAnswer({ unit: 'V' }, '3')).toBe(true);
  });
});

// Every problem in /problems must parse with no errors (answers recomputed by the engine).
const DIR = fileURLToPath(new URL('../../../problems/', import.meta.url));
function listJson(dir: string): string[] {
  try {
    return readdirSync(dir)
      .sort()
      .flatMap((name) => {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) return listJson(p);
        if (!name.endsWith('.json') || name.startsWith('_') || name.endsWith('.schema.json')) return [];
        return [p];
      });
  } catch {
    return [];
  }
}

describe('built-in problems', () => {
  const files = listJson(DIR);
  it('folder has problems with unique ids', () => {
    expect(files.length).toBeGreaterThan(0);
    const ids = files.map((f) => JSON.parse(readFileSync(f, 'utf8')).id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  for (const file of files) {
    const name = file.slice(DIR.length);
    it(`${name} is valid in zh and en`, () => {
      const json = JSON.parse(readFileSync(file, 'utf8'));
      for (const l of ['zh', 'en'] as const) {
        setLang(l);
        const r = parseProblem(json, 'folder', name);
        expect(r.errors).toEqual([]);
        expect(r.warnings).toEqual([]);
        expect(r.problem!.chapter).toBe(name.split('/')[0]);
      }
    });
  }
});

// Every complete example in the docs must validate too (no stale documentation).
describe('documentation examples', () => {
  const docs = ['PROBLEM_FORMAT.md', 'AI_PROMPT_PROBLEMS.md'].map((f) => {
    try {
      return readFileSync(fileURLToPath(new URL(`../../../docs/${f}`, import.meta.url)), 'utf8');
    } catch {
      return '';
    }
  });
  const blocks = docs.flatMap((d) => [...d.matchAll(/```json\n([\s\S]*?)\n```/g)].map((m) => m[1])).filter((b) => b.includes('"circuit-problem/1"') && b.trim().startsWith('{'));
  it('has at least 3 complete examples', () => expect(blocks.length).toBeGreaterThanOrEqual(3));
  blocks.forEach((b, i) => {
    it(`example ${i + 1} validates`, () => {
      const json = JSON.parse(b);
      const r = parseProblem(json);
      expect(r.errors).toEqual([]);
      expect(r.warnings).toEqual([]);
    });
  });
});
