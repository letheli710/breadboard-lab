// Every built-in challenge in /challenges must parse, be self-consistent and have a
// solution that the checker judges perfect.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseChallenge } from './challenge';
import { applySet, checkCircuit } from './check';
import { buildNetlist } from './netlist';
import { simulate } from './solver';

const DIR = fileURLToPath(new URL('../../challenges/', import.meta.url));

function listJson(dir: string): string[] {
  return readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) return listJson(p);
      if (!name.endsWith('.json') || name.startsWith('_') || name.endsWith('.schema.json')) return [];
      return [p];
    });
}

const files = listJson(DIR);
const titles = (issues: { title: string; detail?: string }[]) => issues.map((i) => `${i.title} ${i.detail ?? ''}`);

describe('built-in challenges', () => {
  it('folder is not empty and ids are unique', () => {
    expect(files.length).toBeGreaterThan(0);
    const ids = files.map((f) => JSON.parse(readFileSync(f, 'utf8')).id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const file of files) {
    const name = file.slice(DIR.length);
    describe(name, () => {
      const res = parseChallenge(JSON.parse(readFileSync(file, 'utf8')), 'builtin', name);

      it('parses without errors', () => {
        expect(res.errors).toEqual([]);
        expect(res.challenge).toBeDefined();
      });

      it('target passes its own tests', () => {
        const ch = res.challenge!;
        expect(ch.tests.length).toBeGreaterThan(0);
        expect(titles(checkCircuit(ch, ch.target).issues)).toEqual([]);
      });

      it('solution is perfect and LEDs stay ≤ 25 mA', () => {
        const ch = res.challenge!;
        expect(ch.solution).toBeDefined();
        const nl = buildNetlist(ch.solution!);
        expect(nl.unplaced).toEqual([]);
        const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
        expect(titles(r.issues)).toEqual([]);
        expect(r.perfect).toBe(true);
        for (const t of [{ set: {} }, ...ch.tests]) {
          const sim = simulate(applySet(nl.circuit, t.set, r.mapping));
          for (const led of sim.leds.values()) expect(led.current).toBeLessThanOrEqual(0.025);
        }
      });

      if (res.challenge?.start)
        it('start layout builds and is not already solved', () => {
          const ch = res.challenge!;
          const nl = buildNetlist(ch.start!);
          expect(checkCircuit(ch, nl.circuit, nl.pinHoles).perfect).toBe(false);
        });
    });
  }
});

describe('challenge "phase"', () => {
  const base = {
    format: 'breadboard-challenge/1',
    id: 'phase-test',
    title: 'phase',
    components: [
      { ref: 'V1', type: 'dc_source', voltage: 9 },
      { ref: 'R1', type: 'resistor', resistance: '1k' },
    ],
    connections: [
      ['V1.+', 'R1.1'],
      ['R1.2', 'V1.-'],
    ],
  };
  it('is optional (undefined = intro set)', () => {
    const r = parseChallenge(base);
    expect(r.ok).toBe(true);
    expect(r.challenge!.phase).toBeUndefined();
  });
  it('accepts 1–4', () => {
    for (const phase of [1, 2, 3, 4]) expect(parseChallenge({ ...base, phase }).challenge!.phase).toBe(phase);
  });
  it('rejects anything else', () => {
    for (const phase of [0, 5, 1.5, '2', null]) expect(parseChallenge({ ...base, phase }).ok).toBe(false);
  });
  it('file numbers match the phase (2NN files carry one)', () => {
    for (const f of files) {
      const name = f.slice(DIR.length);
      const n = Number(/^(\d+)-/.exec(name)?.[1]);
      const phase = JSON.parse(readFileSync(f, 'utf8')).phase;
      if (n >= 200) expect(phase, name).toBe(Math.floor((n - 200) / 20) + 1);
      else expect(phase, name).toBeUndefined();
    }
  });
});

describe('layout scope probes', () => {
  it('get CH1 then CH2 when "channel" is omitted', () => {
    const r = parseChallenge({
      format: 'breadboard-challenge/1',
      id: 'probe-channels',
      title: 'probes',
      components: [
        { ref: 'V1', type: 'dc_source', voltage: 9 },
        { ref: 'R1', type: 'resistor', resistance: '1k' },
      ],
      connections: [['V1.+', 'R1.1'], ['R1.2', 'V1.-']],
      solution: {
        parts: [
          { type: 'scope_probe', ref: 'PA', channel: 2, pins: { tip: 'a1', gnd: 'a5' } },
          { type: 'scope_probe', ref: 'PB', pins: { tip: 'a10', gnd: 'a15' } },
          { type: 'scope_probe', ref: 'PC', pins: { tip: 'a20', gnd: 'a25' } },
        ],
      },
    });
    expect(r.ok).toBe(true);
    // a third probe has no free channel left and keeps the default
    expect(r.challenge!.solution!.parts.map((p) => p.props.channel)).toEqual([2, 1, 1]);
  });
  it('two probes without "channel" become CH1 and CH2', () => {
    const r = parseChallenge({
      format: 'breadboard-challenge/1',
      id: 'probe-channels-2',
      title: 'probes',
      components: [{ ref: 'V1', type: 'dc_source', voltage: 9 }, { ref: 'R1', type: 'resistor', resistance: '1k' }],
      connections: [['V1.+', 'R1.1'], ['R1.2', 'V1.-']],
      solution: { parts: [
        { type: 'scope_probe', ref: 'PA', pins: { tip: 'a1', gnd: 'a5' } },
        { type: 'scope_probe', ref: 'PB', pins: { tip: 'a10', gnd: 'a15' } },
      ] },
    });
    expect(r.challenge!.solution!.parts.map((p) => p.props.channel)).toEqual([1, 2]);
  });
});
