import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Schematic } from '../core/problem/types';
import { ProblemSchematic, elementValueText, richRuns } from './ProblemSchematic';

const src = (value: unknown): Schematic =>
  ({
    elements: [
      { ref: 'Us', type: 'V', from: [0, 4], to: [0, 0], value },
      { ref: 'R1', type: 'R', from: [0, 0], to: [4, 0], value: '4.7k' },
      { ref: 'C1', type: 'C', from: [4, 0], to: [4, 4], value: '100n' },
    ],
    wires: [
      [
        [0, 4],
        [4, 4],
      ],
    ],
    grounds: [[0, 4]],
  }) as unknown as Schematic;

describe('ProblemSchematic renders SI-string values', () => {
  const cases: [string, unknown][] = [
    ['step', { step: { before: 0, after: '2m' } }],
    ['step both strings', { step: { before: '-1.5', after: '2k' } }],
    ['sin', { sin: { amp: '10m', freq: '50', phase: '30', offset: '1' } }],
    ['dc string', { dc: '5' }],
    ['ac', { dc: '2', ac: { mag: '1.5', phase: '-45' } }],
    ['plain string', '12'],
  ];
  for (const [name, v] of cases)
    it(name, () => {
      const html = renderToStaticMarkup(<ProblemSchematic schematic={src(v)} />);
      expect(html).toContain('<svg');
    });
  it('value text uses the parsed numbers', () => {
    const el = (value: unknown, type = 'V') => ({ ref: 'X', type, from: [0, 0], to: [0, 2], value }) as never;
    expect(elementValueText(el({ step: { before: 0, after: '2m' } }))).toBe('0→0.002 V');
    expect(elementValueText(el({ re: '3', im: '-4' }, 'Z'))).toBe('3−j4 Ω');
    expect(elementValueText(el('4.7k', 'R'))).toBe('4.7 kΩ');
  });
  it('Z with string parts and K with string M render', () => {
    const s = {
      elements: [
        { ref: 'Z1', type: 'Z', from: [0, 0], to: [4, 0], value: { re: '3', im: '4' } },
        { ref: 'L1', type: 'L', from: [4, 0], to: [4, 4], value: '1m' },
        { ref: 'L2', type: 'L', from: [8, 0], to: [8, 4], value: '1m' },
        { ref: 'K1', type: 'K', l1: 'L1', l2: 'L2', M: '0.5m' },
      ],
      wires: [
        [
          [0, 0],
          [0, 4],
          [4, 4],
        ],
        [
          [8, 0],
          [8, 4],
        ],
      ],
      grounds: [[4, 4]],
    } as unknown as Schematic;
    expect(renderToStaticMarkup(<ProblemSchematic schematic={s} />)).toContain('<svg');
  });
});

describe('richRuns: subscripts on dotted phasor letters', () => {
  it('U̇_s (combining dot) → italic U̇ + subscript s', () => {
    expect(richRuns('U̇_s = 10∠0° V')).toEqual([{ t: 'U̇', it: true }, { t: 's', sub: true }, { t: ' = 10∠0° V' }]);
  });
  it('İ_1 (precomposed) and U̇_{AB} take subscripts', () => {
    expect(richRuns('İ_1')).toEqual([
      { t: 'İ', it: true },
      { t: '1', sub: true },
    ]);
    expect(richRuns('U̇_{AB}')).toEqual([
      { t: 'U̇', it: true },
      { t: 'AB', sub: true },
    ]);
  });
  it('a lone dotted letter is italic', () => {
    expect(richRuns('U̇')).toEqual([{ t: 'U̇', it: true }]);
  });
  it('plain U_s is unchanged', () => {
    expect(richRuns('U_s')).toEqual([
      { t: 'U', it: true },
      { t: 's', sub: true },
    ]);
    expect(richRuns('R_{1}R_{4}')).toEqual([
      { t: 'R', it: true },
      { t: '1', sub: true },
      { t: 'R', it: true },
      { t: '4', sub: true },
    ]);
  });
});

describe('richRuns: subscripts on hatted letters (Tellegen / reciprocity second experiment)', () => {
  it('precomposed û_1 and î_k → italic hatted letter + subscript', () => {
    expect(richRuns('û_1')).toEqual([
      { t: 'û', it: true },
      { t: '1', sub: true },
    ]);
    expect(richRuns('Σu_k·î_k = 0')).toEqual([{ t: 'Σ' }, { t: 'u', it: true }, { t: 'k', sub: true }, { t: '·' }, { t: 'î', it: true }, { t: 'k', sub: true }, { t: ' = 0' }]);
  });
  it('combining hat (U+0302) and precomposed capitals', () => {
    expect(richRuns('u\u0302_2')).toEqual([
      { t: 'u\u0302', it: true },
      { t: '2', sub: true },
    ]);
    expect(richRuns('Û_{ab}')).toEqual([
      { t: 'Û', it: true },
      { t: 'ab', sub: true },
    ]);
    expect(richRuns('î')).toEqual([{ t: 'î', it: true }]);
  });
  it('the complex-power bar (U+0304) also keeps its subscript: S̄_Us', () => {
    expect(richRuns('S̄_Us = −600 − j800 VA')).toEqual([{ t: 'S̄', it: true }, { t: 'Us', sub: true }, { t: ' = −600 − j800 VA' }]);
  });
  it('u_1 and U̇_s are unchanged', () => {
    expect(richRuns('u_1')).toEqual([
      { t: 'u', it: true },
      { t: '1', sub: true },
    ]);
    expect(richRuns('U̇_s')).toEqual([
      { t: 'U̇', it: true },
      { t: 's', sub: true },
    ]);
  });
});

describe('richRuns: juxtaposed products without braces', () => {
  const flat = (s: string) =>
    richRuns(s)
      .map((r) => (r.sub ? `_{${r.t}}` : r.t))
      .join('');
  it('gives the last letter of a run back to the next symbol', () => {
    expect(flat('√3U_lI_l cos φ')).toBe('√3U_{l}I_{l} cos φ');
    expect(flat('z_12z_21')).toBe('z_{12}z_{21}');
    expect(flat('U̇_AY_A + R_ini_1 + Z_1U̇_2')).toBe('U̇_{A}Y_{A} + R_{in}i_{1} + Z_{1}U̇_{2}');
  });
  it('leaves ordinary runs alone', () => {
    expect(flat('U_s1 = 10 V, u_oc, R_eq, R_{1}R_{4}')).toBe('U_{s1} = 10 V, u_{oc}, R_{eq}, R_{1}R_{4}');
  });
});
