// Behaviour grading (options.grading "behaviour"): the open night-light task (298) passes any
// circuit that does the job — the ESP32 rule of the reference design or one NPN on a battery.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseChallenge } from './challenge';
import { checkCircuit } from './check';
import { buildNetlist } from './netlist';
import type { Circuit } from './types';

const ch = parseChallenge(JSON.parse(readFileSync('challenges/298-design-night-light.json', 'utf8'))).challenge!;

/** Way B: 9 V → 47 kΩ → node → LDR → GND, node → 1 kΩ → NPN base; 9 V → 470 Ω → LED → collector. */
function npnDesign(ldr = true, rLed = 470): Circuit {
  return {
    components: [
      { ref: 'B1', type: 'battery', props: { variant: '9V' } },
      { ref: 'RTOP', type: 'resistor', props: { resistance: 47e3 } },
      ...(ldr ? [{ ref: 'PHOTO', type: 'ldr' as const, props: { lux: 100 } }] : []),
      { ref: 'RB', type: 'resistor', props: { resistance: 1e3 } },
      { ref: 'Q9', type: 'npn', props: {} },
      { ref: 'RL', type: 'resistor', props: { resistance: rLed } },
      { ref: 'D5', type: 'led', props: { color: 'red' } },
    ],
    nets: [
      { name: 'VP', pins: ['B1.+', 'RTOP.1', 'RL.1'] },
      { name: 'MID', pins: ['RTOP.2', ...(ldr ? ['PHOTO.1'] : []), 'RB.1'] },
      { name: 'BASE', pins: ['RB.2', 'Q9.b'] },
      { name: 'A', pins: ['RL.2', 'D5.anode'] },
      { name: 'K', pins: ['D5.cathode', 'Q9.c'] },
      { name: 'GND', pins: ['B1.-', ...(ldr ? ['PHOTO.2'] : []), 'Q9.e'] },
    ],
  } as Circuit;
}

describe('behaviour grading', () => {
  it('is read from options', () => expect(ch.grading).toBe('behaviour'));

  it('passes the reference design', () => {
    const nl = buildNetlist(ch.solution!);
    const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
    expect(r.issues.map((i) => i.title)).toEqual([]);
    expect(r.testsPassed).toBe(2);
  });

  it('passes a different circuit that does the same job', () => {
    const r = checkCircuit(ch, npnDesign());
    expect(r.issues.map((i) => `${i.title} ${i.detail}`)).toEqual([]);
    expect(r.perfect).toBe(true);
  });

  it('names the requirement a circuit misses', () => {
    const r = checkCircuit(ch, npnDesign(true, 47));
    expect(r.perfect).toBe(false);
    expect(r.issues[0].title).toMatch(/1–20 mA/);
    expect(r.progress).toBe(0.5);
  });

  it('asks for a part the tests need', () => {
    const r = checkCircuit(ch, npnDesign(false));
    expect(r.issues[0].title).toMatch(/Missing part|缺少元件/);
    expect(r.testsPassed).toBe(0);
  });

  it('needs at least one test', () => {
    const json = JSON.parse(readFileSync('challenges/298-design-night-light.json', 'utf8'));
    json.tests = [];
    expect(parseChallenge(json).errors.join('\n')).toMatch(/behaviour/);
  });
});
