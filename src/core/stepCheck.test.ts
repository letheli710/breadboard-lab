import { describe, expect, it } from 'vitest';
import { parseChallenge } from './challenge';
import { unmetStepChecks, type StepState } from './stepCheck';
import type { Layout } from './types';

const base = {
  format: 'breadboard-challenge/1',
  id: 't',
  title: 't',
  kind: 'lesson',
  components: [{ ref: 'R1', type: 'resistor' }],
  connections: [['R1.1', 'R1.2']],
};
const steps = (check: unknown) => parseChallenge({ ...base, steps: [{ text: 's', check }] });
const state = (parts: Layout['parts'], probe: StepState['probe'] = { red: null, black: null }): StepState => ({
  layout: { version: 1, parts },
  probe,
  scope: { tdiv: 2e-4, vdiv: { 1: null, 2: 0.5 } },
});

describe('lesson step checks', () => {
  const ch = steps([
    { type: 'resistor', pins: { '1': 'tp5', '2': 'a5' }, resistance: '1k' },
    { probe: { red: 'd5', black: 'tp8' } },
    { empty: ['h20'] },
    { scope: { tdiv: '200u' } },
  ]).challenge!;
  const checks = ch.steps[0].check!;
  it('parses every kind', () => expect(checks.map((c) => c.kind)).toEqual(['part', 'probe', 'empty', 'scope']));
  it('a part on the same strips counts, either way round; the value must match', () => {
    const r = (pins: Record<string, string>, resistance: number) => ({ id: 'x', ref: 'R1', type: 'resistor' as const, props: { resistance }, pins });
    const probe = { red: 'b5', black: 'tp20' };
    expect(unmetStepChecks(checks, state([r({ '1': 'b5', '2': 'tp9' }, 1000)], probe))).toEqual([]);
    expect(unmetStepChecks(checks, state([r({ '1': 'b5', '2': 'tp9' }, 330)], probe))).toHaveLength(1);
    expect(unmetStepChecks(checks, state([r({ '1': 'f5', '2': 'tp9' }, 1000)], probe))).toHaveLength(1);
    expect(unmetStepChecks(checks, state([r({ '1': 'b5', '2': 'h20' }, 1000)], probe))).toHaveLength(2); // h20 not empty, and wrong strip
    expect(unmetStepChecks(checks, state([r({ '1': 'b5', '2': 'tp9' }, 1000)], { red: 'tp8', black: 'd5' }))).toHaveLength(2); // probes swapped
  });
  it('polarised parts must not be reversed', () => {
    const c = steps({ type: 'battery', pins: { '+': 'tp1', '-': 'tn1' } }).challenge!.steps[0].check!;
    const bat = (pins: Record<string, string>) => [{ id: 'b', ref: 'BAT1', type: 'battery' as const, props: { variant: '9V' as const }, pins }];
    expect(unmetStepChecks(c, state(bat({ '+': 'tp3', '-': 'tn3' })))).toEqual([]);
    expect(unmetStepChecks(c, state(bat({ '+': 'tn3', '-': 'tp3' })))).toHaveLength(1);
  });
  it('rejects malformed checks', () => {
    expect(steps({ probe: { red: 'z99' } }).ok).toBe(false);
    expect(steps({ nothing: 1 }).ok).toBe(false);
    expect(steps({ type: 'resistor' }).ok).toBe(false);
  });
});
