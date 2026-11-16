// Figures in lesson cards (CHALLENGE_FORMAT §16.3): the three kinds are validated, `![](fig:id)`
// lines must name a figure, and LED / BAT symbols stay out of the practice problems.
import { describe, expect, it } from 'vitest';
import { parseChallenge } from './challenge';
import { figText, figureRefs, figureTexts, parseFigures } from './figures';
import { parseProblem } from './problem/parse';

const loop = {
  kind: 'schematic',
  caption: { text: '一条回路', i18n: { en: 'One loop' } },
  schematic: {
    elements: [
      { ref: 'B1', type: 'BAT', from: [0, 4], to: [0, 0], value: 9 },
      { ref: 'R1', type: 'R', from: [0, 0], to: [4, 0], value: 220 },
      { ref: 'D1', type: 'LED', from: [4, 0], to: [4, 4], value: 'red' },
    ],
    wires: [
      [
        [0, 4],
        [4, 4],
      ],
    ],
    marks: [{ kind: 'i', el: 'R1', name: 'I' }],
  },
  highlight: ['D1'],
};

const base = {
  format: 'breadboard-challenge/1',
  id: 't',
  title: 't',
  kind: 'lesson',
  components: [{ ref: 'R1', type: 'resistor' }],
  connections: [['R1.1', 'R1.2']],
  steps: ['one'],
};

describe('card figures', () => {
  it('accept a circuit with LED and battery symbols and no ground', () => {
    const r = parseFigures({ loop });
    expect(r.errors).toEqual([]);
    expect(Object.keys(r.figures)).toEqual(['loop']);
    expect(figText(loop.caption, 'en')).toBe('One loop');
    expect(figText(loop.caption, 'zh')).toBe('一条回路');
  });

  it('report broken drawings, unknown holes and bad plots', () => {
    const r = parseFigures({
      bad: { kind: 'schematic', caption: 'x', schematic: { elements: [{ ref: 'R1', type: 'R', from: [0, 0], to: [1, 1] }], wires: [] }, highlight: ['R9'] },
      board: { kind: 'breadboard', caption: 'x', parts: [{ type: 'wire', from: 'a5', to: 'k5' }], strips: [{ at: 'z1' }] },
      plot: { kind: 'plot', caption: 'x', x: { label: 'V', min: 1, max: 0 }, y: { label: 'I', min: 0, max: 1 }, curves: [{ points: [[0, 0]] }] },
      nocap: { kind: 'breadboard' },
      Odd: { kind: 'map', caption: 'x' },
    });
    const all = r.errors.join('\n');
    expect(all).toMatch(/figures\.bad: .*R1/);
    expect(all).toMatch(/R9/);
    expect(all).toMatch(/k5/);
    expect(all).toMatch(/z1/);
    expect(all).toMatch(/figures\.plot: .*"x"/);
    expect(all).toMatch(/figures\.plot: .*points/);
    expect(all).toMatch(/figures\.nocap: .*caption/);
    expect(all).toMatch(/figures\.Odd: .*kind/);
    expect(Object.keys(r.figures)).toEqual([]);
  });

  it('are shown by `![](fig:id)` lines, which must name a figure', () => {
    const ok = parseChallenge({
      ...base,
      cards: [{ kind: 'explain', title: 'e', text: ['看图：', '![一条回路](fig:loop)'], steps: 1 }],
      figures: { loop },
    });
    expect(ok.errors).toEqual([]);
    expect(ok.challenge?.figures.loop.kind).toBe('schematic');
    expect(figureRefs(ok.challenge!.cards[0].text)).toEqual(['loop']);

    const missing = parseChallenge({ ...base, steps: [{ text: '![](fig:nope)' }], cards: [{ kind: 'build', title: 'b', steps: 1 }] });
    expect(missing.errors.join('\n')).toMatch(/fig:nope/);

    const unused = parseChallenge({ ...base, figures: { loop } });
    expect(unused.errors).toEqual([]);
    expect(unused.warnings.join('\n')).toMatch(/figures\.loop/);
  });

  it('give every text to the answer-leak scan', () => {
    const t = figureTexts({ ...loop, schematic: { ...loop.schematic, notes: [{ at: [2, 2], text: '9 V', i18n: { en: 'nine volts' } }] } });
    expect(t).toEqual(expect.arrayContaining(['一条回路', 'One loop', '9 V', 'nine volts']));
  });

  it('draw transistors, MOSFETs, regulators, diodes and motors, and new board parts', () => {
    const r = parseFigures({
      sw: {
        kind: 'schematic',
        caption: 'x',
        schematic: {
          elements: [
            { ref: 'V1', type: 'BAT', from: [0, 0], to: [0, 7], value: 5 },
            { ref: 'M1', type: 'M', from: [3, 0], to: [3, 3] },
            { ref: 'D1', type: 'D', from: [6, 3], to: [6, 0] },
            { ref: 'Q1', type: 'NMOS', at: [4, 5], flip: true },
            { ref: 'U1', type: 'REG', at: [9, 0] },
            { ref: 'Q2', type: 'NPN', at: [10, 5] },
          ],
          wires: [
            [
              [0, 0],
              [7, 0],
            ],
            [
              [3, 3],
              [6, 3],
            ],
            [
              [3, 7],
              [0, 7],
            ],
            [
              [11, 0],
              [12, 0],
              [12, 7],
              [11, 7],
            ],
            [
              [9, 2],
              [9, 7],
              [3, 7],
            ],
            [
              [8, 5],
              [8, 6],
              [11, 6],
              [11, 7],
            ],
          ],
          terminals: [
            { at: [6, 5], name: 'GPIO' },
            { at: [11, 3], name: 'C' },
          ],
        },
      },
      bb: {
        kind: 'breadboard',
        caption: 'x',
        parts: [
          { type: 'capacitor', from: 'a3', to: 'a4' },
          { type: 'electrolytic', from: 'a6', to: 'a7' },
          { type: 'inductor', from: 'b3', to: 'b7' },
          { type: 'diode', from: 'c3', to: 'c7' },
          { type: 'board', from: 'e9', to: 'f12', label: 'ESP32' },
        ],
      },
    });
    expect(r.errors).toEqual([]);
    expect(Object.keys(r.figures)).toEqual(['sw', 'bb']);
  });

  it('keep LED and BAT out of practice problems', () => {
    const r = parseProblem({
      format: 'circuit-problem/1',
      id: 'x-01',
      chapter: 'basics',
      title: 't',
      level: 1,
      text: 't',
      schematic: { ...loop.schematic, grounds: [[0, 4]] },
      questions: [{ id: 'a', ask: 'I?', find: { kind: 'i', el: 'R1' }, unit: 'A' }],
    });
    expect(r.errors.join('\n')).toMatch(/lesson card figures only|课程卡片/);
  });
});
