// Op-amps with positive feedback (a Schmitt trigger, or swapped inputs): the output sits at a rail
// instead of the unstable balance point, and the circuit check explains a swap in the right terms.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseChallenge } from './challenge';
import { checkCircuit } from './check';
import { simulate } from './solver';
import type { Circuit } from './types';

const json = JSON.parse(readFileSync(join(__dirname, '../../challenges/230-schmitt-trigger.json'), 'utf8'));

/** the Schmitt trigger with a DC input of `vin` volts (thresholds ≈ 4.07 V and 4.79 V) */
function schmitt(vin: number): Circuit {
  const c = parseChallenge(json).challenge!.target;
  return {
    components: [...c.components.filter((x) => x.type !== 'function_gen'), { ref: 'V2', type: 'dc_source', props: { voltage: vin } }],
    nets: c.nets.map((n) => ({ ...n, pins: n.pins.map((p) => (p === 'FG1.+' ? 'V2.+' : p === 'FG1.-' ? 'V2.-' : p)) })),
  } as Circuit;
}

describe('positive feedback', () => {
  it('drives the output to a rail, never past it', () => {
    for (const vin of [1, 3, 4.4, 6, 8]) {
      const r = simulate(schmitt(vin));
      const vout = r.nodeV.get('VOUT')!;
      expect(vout).toBeLessThanOrEqual(9 - 1.5 + 1e-3);
      expect(vout).toBeGreaterThanOrEqual(-1e-3);
      // at a rail, not on the unstable balance point in between
      expect(Math.min(Math.abs(vout - 7.5), Math.abs(vout))).toBeLessThan(0.05);
    }
    // far below the lower threshold the output is high, far above the upper one it is low
    expect(simulate(schmitt(1)).nodeV.get('VOUT')!).toBeGreaterThan(7);
    expect(simulate(schmitt(8)).nodeV.get('VOUT')!).toBeLessThan(0.5);
  });

  it('names a swap on a Schmitt trigger as losing the positive feedback', () => {
    const ch = parseChallenge(json).challenge!;
    const target = ch.target;
    const swapped: Circuit = {
      components: target.components,
      nets: target.nets.map((n) => ({ ...n, pins: n.pins.map((p) => (p === 'U1.inA-' ? 'U1.inA+' : p === 'U1.inA+' ? 'U1.inA-' : p)) })),
    };
    const r = checkCircuit(ch, swapped);
    const swap = r.issues.find((i) => /IN−|IN-/.test(i.detail));
    expect(swap?.detail).toMatch(/on purpose|故意/);
  });
});
