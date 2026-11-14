import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { ammeterBypasses } from './ammeterBypass';
import { parseChallenge } from './challenge';
import { checkCircuit } from './check';
import { boardDiagnostics } from './diagnostics';
import { setLang } from './i18n';
import { buildNetlist } from './netlist';
import { simulate } from './solver';
import type { Layout, PlacedPart } from './types';

const load = (file: string) => parseChallenge(JSON.parse(readFileSync(new URL(`../../challenges/${file}`, import.meta.url), 'utf8'))).challenge!;
const part = (type: PlacedPart['type'], ref: string, pins: Record<string, string>, props = {}): PlacedPart => ({ id: ref, ref, type, props, pins });

// lesson 10's circuit before the meter goes in: 9 V → jumper tp5–a5 → 1k (c5–c10) → LED (d10–d13) → GND
const base = (): PlacedPart[] => [
  part('battery', 'BAT1', { '+': 'tp1', '-': 'tn1' }, { variant: '9V' }),
  part('wire', 'W1', { a: 'tp5', b: 'a5' }),
  part('resistor', 'R1', { '1': 'c5', '2': 'c10' }, { resistance: 1000 }),
  part('led', 'LED1', { anode: 'd10', cathode: 'd13' }, { color: 'red' }),
  part('wire', 'W2', { a: 'a13', b: 'tn13' }),
];
const board = (...extra: PlacedPart[]): Layout => ({ version: 1, parts: [...base(), ...extra] });

describe('ammeter in parallel (from the wiring, at any current)', () => {
  beforeAll(() => setLang('en'));

  it('across the LED: names the LED, live and in the check result', () => {
    const lay = board(part('ammeter', 'AM1', { '+': 'b10', '-': 'b13' }));
    const nl = buildNetlist(lay);
    expect(ammeterBypasses(nl.circuit)).toEqual([{ ref: 'AM1', bypassed: ['LED1'], supplies: [], acrossSupply: false, sameNet: false }]);
    const sim = simulate(nl.circuit);
    expect(Math.abs(sim.meters.get('AM1')!.current)).toBeLessThan(0.5); // the old live check needed > 0.5 A
    const live = boardDiagnostics(nl, sim).find((i) => i.refs[0] === 'AM1');
    expect(live?.title).toMatch(/AM1 is in parallel with LED1/);
    const r = checkCircuit(load('102-lesson-ammeter.json'), nl.circuit, nl.pinHoles);
    expect(r.perfect).toBe(false);
    expect(r.issues[0].title).toMatch(/AM1 is in parallel with LED1 — an ammeter goes in series/);
  });

  it('in series (the lesson solution) is not flagged', () => {
    const ch = load('102-lesson-ammeter.json');
    expect(ammeterBypasses(buildNetlist(ch.solution!).circuit)).toEqual([]);
    expect(ammeterBypasses(buildNetlist(load('201-kcl-ammeters.json').solution!).circuit)).toEqual([]);
  });

  it('across the supply, and bypassed by the jumper it should replace', () => {
    const across = ammeterBypasses(buildNetlist(board(part('ammeter', 'AM1', { '+': 'tp20', '-': 'tn20' }))).circuit);
    expect(across[0]).toMatchObject({ supplies: ['BAT1'], acrossSupply: true });
    const same = ammeterBypasses(buildNetlist(board(part('ammeter', 'AM1', { '+': 'tp9', '-': 'b5' }))).circuit);
    expect(same[0]).toMatchObject({ sameNet: true });
    // lab 205 starts with its meter across the supply on purpose
    expect(ammeterBypasses(buildNetlist(load('205-current-divider.json').start!).circuit)[0]).toMatchObject({ ref: 'AM1', supplies: ['PSU1'] });
  });
});
