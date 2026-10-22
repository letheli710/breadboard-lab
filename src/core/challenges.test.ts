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
