// The validator must reject element values the engine / renderer cannot read, and accept SI strings.
import { describe, expect, it } from 'vitest';
import { parseProblem } from './parse';

const problem = (value: unknown, extraQ: object[] = []) => ({
  format: 'circuit-problem/1',
  id: 'values-test',
  chapter: 'first-order',
  title: 'RC',
  level: 1,
  statement: 'RC step.',
  schematic: {
    elements: [
      { ref: 'Us', type: 'V', from: [0, 0], to: [0, 4], value },
      { ref: 'R1', type: 'R', from: [0, 0], to: [4, 0], value: '1k' },
      { ref: 'C1', type: 'C', from: [4, 0], to: [4, 4], value: '1u' },
    ],
    wires: [
      [
        [0, 4],
        [4, 4],
      ],
    ],
    grounds: [[0, 4]],
  },
  analysis: { type: 'tran' },
  questions: [{ id: 'a', ask: 'u_C(∞)', find: { kind: 'v', el: 'C1', t: 'inf' }, answer: 0.002, unit: 'V' }, ...extraQ],
});

describe('element values in the validator', () => {
  it('accepts SI strings inside a step source', () => {
    const r = parseProblem(problem({ step: { before: 0, after: '2m' } }));
    expect(r.errors).toEqual([]);
  });
  it('rejects an unreadable value with a readable message', () => {
    const r = parseProblem(problem({ step: { before: 0, after: '2 milli' } }));
    expect(r.ok).toBe(false);
    expect(r.errors.join('\n')).toMatch(/Us\.step\.after/);
  });
  it('checks new quantities (energy, derivative, value) against the engine', () => {
    const r = parseProblem(
      problem({ step: { before: 0, after: 10 } }, [
        { id: 'w', ask: 'w_C(∞)', find: { kind: 'w', el: 'C1', t: 'inf' }, answer: 5e-5, unit: 'J' },
        { id: 'd', ask: 'du/dt(0+)', find: { kind: 'v', el: 'C1', t: '0+', deriv: 1 }, answer: 1e4, unit: 'V/s' },
        { id: 'c', ask: 'C', find: { kind: 'val', el: 'C1' }, answer: 1e-6, unit: 'F' },
      ]),
    );
    // question "a" has the wrong answer for a 10 V step (10, not 0.002); the new ones are right
    expect(r.errors.length).toBe(1);
    expect(r.errors[0]).toMatch(/questions\[0\]/);
  });
});
