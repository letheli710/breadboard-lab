import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Schematic } from '../core/problem/types';
import { ProblemSchematic, elementValueText } from './ProblemSchematic';

const src = (value: unknown): Schematic =>
  ({
    elements: [
      { ref: 'Us', type: 'V', from: [0, 4], to: [0, 0], value },
      { ref: 'R1', type: 'R', from: [0, 0], to: [4, 0], value: '4.7k' },
      { ref: 'C1', type: 'C', from: [4, 0], to: [4, 4], value: '100n' },
    ],
    wires: [[[0, 4], [4, 4]]],
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
      wires: [[[0, 0], [0, 4], [4, 4]], [[8, 0], [8, 4]]],
      grounds: [[4, 4]],
    } as unknown as Schematic;
    expect(renderToStaticMarkup(<ProblemSchematic schematic={s} />)).toContain('<svg');
  });
});
