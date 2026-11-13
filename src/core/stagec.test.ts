// Stage C: new parts, checker rules (op-amp halves, instruments), diagnostics, schematic.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseChallenge } from './challenge';
import { checkCircuit } from './check';
import { boardDiagnostics } from './diagnostics';
import { setLang } from './i18n';
import { buildNetlist } from './netlist';
import { PARTS, nextScopeChannel } from './parts';
import { layoutSchematic } from './schematic';
import { simulate } from './solver';
import type { Layout, PlacedPart } from './types';

setLang('en');
const fixture = (name: string) => JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), 'utf8'));
const titles = (issues: { title: string; detail?: string }[]) => issues.map((i) => `${i.title} ${i.detail ?? ''}`);

let n = 0;
const part = (type: PlacedPart['type'], pins: Record<string, string>, props = {}, ref?: string): PlacedPart => ({
  id: `p${n++}`,
  ref: ref ?? `${type}${n}`,
  type,
  props: { ...PARTS[type].defaults, ...props },
  pins,
});
const at = (type: PlacedPart['type'], anchor: string, props = {}, ref?: string) =>
  part(type, (PARTS[type].placement as { footprint: (a: string) => Record<string, string> }).footprint(anchor), props, ref);

describe('parts', () => {
  it('op-amp must straddle the gap (anchor in row e)', () => {
    const fp = (PARTS.opamp.placement as { footprint: (a: string) => Record<string, string> | null }).footprint;
    expect(fp('e10')).toEqual({ '1': 'e10', '2': 'e11', '3': 'e12', '4': 'e13', '8': 'f10', '7': 'f11', '6': 'f12', '5': 'f13' });
    expect(fp('c10')).toBeNull();
    expect(fp('e28')).toBeNull();
  });
  it('nextScopeChannel', () => {
    const lay: Layout = { version: 1, parts: [] };
    expect(nextScopeChannel(lay)).toBe(1);
    lay.parts.push(part('scope_probe', { tip: 'a1', gnd: 'tn1' }, { channel: 1 }));
    expect(nextScopeChannel(lay)).toBe(2);
    lay.parts.push(part('scope_probe', { tip: 'a2', gnd: 'tn2' }, { channel: 2 }));
    expect(nextScopeChannel(lay)).toBeNull();
  });
  it('generator-only board: GND at the black clip, signal net VIN', () => {
    const nl = buildNetlist({
      version: 1,
      parts: [part('function_gen', { '+': 'a3', '-': 'tn3' }, {}, 'FG1'), part('resistor', { '1': 'b3', '2': 'tn8' }, { resistance: 1000 }, 'R1')],
    });
    expect(nl.pinNet.get('FG1.-')).toBe('GND');
    expect(nl.pinNet.get('FG1.+')).toBe('VIN');
    const sim = simulate(nl.circuit);
    expect(sim.ground).toBe('GND');
    expect(boardDiagnostics(nl, sim).some((i) => i.title.includes('No power'))).toBe(false);
  });
});

describe('sample challenges with scope / ammeter tests', () => {
  for (const f of ['rc-lowpass-scope.json', 'opamp-noninverting.json'])
    it(`${f}: parses, target self-test and solution pass`, () => {
      const res = parseChallenge(fixture(f));
      expect(res.errors).toEqual([]);
      const ch = res.challenge!;
      expect(titles(checkCircuit(ch, ch.target).issues)).toEqual([]);
      const nl = buildNetlist(ch.solution!);
      expect(nl.unplaced).toEqual([]);
      const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
      expect(titles(r.issues)).toEqual([]);
      expect(r.testsPassed).toBe(ch.tests.length);
    });
});

describe('checker: op-amp', () => {
  const json = fixture('opamp-noninverting.json');
  const ch = parseChallenge(json).challenge!;
  const sol = () => structuredClone(parseChallenge(json).challenge!.solution!);

  it('half B instead of half A still matches (the fixture solution uses half B)', () => {
    const r = checkCircuit(ch, buildNetlist(sol()).circuit);
    expect(r.perfect).toBe(true);
    expect(r.pinMap.get('U1.outA')).toBe('U1.outB');
  });

  it('half A also matches', () => {
    // pins 1..3 of half A in row e (e10 out, e11 in−, e12 in+); same strips via a–d
    const lay: Layout = {
      version: 1,
      parts: [
        part('battery', { '+': 'tp1', '-': 'tn1' }, { variant: '9V' }, 'BAT1'),
        at('opamp', 'e10', {}, 'U1'),
        part('wire', { a: 'tp10', b: 'j10' }),
        part('wire', { a: 'a13', b: 'tn13' }),
        part('function_gen', { '+': 'a12', '-': 'tn20' }, {}, 'FG1'),
        part('resistor', { '1': 'b11', '2': 'tn11' }, { resistance: 10000 }, 'RG'),
        part('resistor', { '1': 'b10', '2': 'c11' }, { resistance: 10000 }, 'RF'),
      ],
    };
    const r = checkCircuit(ch, buildNetlist(lay).circuit);
    expect(titles(r.issues)).toEqual([]);
  });

  it('swapped inputs are named as such', () => {
    const lay = sol();
    // move RF/RG from IN− (col 12) to IN+ (col 13) and the generator (via AM1) to col 12
    for (const p of lay.parts) {
      if (p.ref === 'RG') p.pins['1'] = 'g13';
      if (p.ref === 'RF') p.pins['2'] = 'i13';
      if (p.ref === 'AM1') p.pins['-'] = 'h12';
    }
    const r = checkCircuit(ch, buildNetlist(lay).circuit);
    expect(r.perfect).toBe(false);
    expect(r.issues.map((i) => i.title)).toContain("U1's + and − inputs are swapped");
  });

  it('rotated chip is detected', () => {
    // rotated 180°: physical pin k sits where pin k+4 should be
    const lay = sol();
    const u = lay.parts.find((p) => p.ref === 'U1')!;
    const rot: Record<string, string> = { '1': '5', '2': '6', '3': '7', '4': '8', '5': '1', '6': '2', '7': '3', '8': '4' };
    u.pins = Object.fromEntries(Object.entries(u.pins).map(([pin, hole]) => [rot[pin], hole]));
    const r = checkCircuit(ch, buildNetlist(lay).circuit);
    expect(r.issues.map((i) => i.title)).toContain('U1 is rotated 180°');
  });

  it('a scope test fails with a readable message when the gain is wrong', () => {
    const lay = sol();
    lay.parts.find((p) => p.ref === 'RF')!.props.resistance = 10000;
    lay.parts.find((p) => p.ref === 'RG')!.props.resistance = 10000;
    const ch2 = parseChallenge({
      ...json,
      tests: [{ name: 'gain 3', set: json.tests[0].set, scope: [{ pin: 'U1.out', measure: 'gain', vs: 'FG1.+', min: 2.9, max: 3.1 }] }],
    }).challenge!;
    const r = checkCircuit(ch2, buildNetlist(lay).circuit);
    expect(r.issues[0].detail).toMatch(/gain.*2×/);
  });
});

describe('checker: ammeter and scope probe', () => {
  const led = {
    format: 'breadboard-challenge/1',
    id: 'led-am',
    title: 'LED',
    components: [
      { ref: 'V1', type: 'dc_source', voltage: 9 },
      { ref: 'R1', type: 'resistor', resistance: '470' },
      { ref: 'D1', type: 'led', color: 'red' },
    ],
    connections: [
      ['V1.+', 'R1.1'],
      ['R1.2', 'D1.anode'],
      ['D1.cathode', 'V1.-'],
    ],
    tests: [{ name: 'current', expect: { D1: 'on' }, currents: [{ el: 'R1', min: 0.014, max: 0.016 }] }],
  };
  const base = (): Layout => ({
    version: 1,
    parts: [
      part('battery', { '+': 'tp1', '-': 'tn1' }, { variant: '9V' }, 'BAT1'),
      part('resistor', { '1': 'tp5', '2': 'a5' }, { resistance: 470 }, 'R1'),
      part('led', { anode: 'b5', cathode: 'b8' }, { color: 'red' }, 'D1'),
      part('wire', { a: 'a8', b: 'tn8' }),
    ],
  });

  it('an ammeter in series (not in the target) and a scope probe do not break matching', () => {
    const ch = parseChallenge(led).challenge!;
    const lay = base();
    lay.parts[3] = part('ammeter', { '+': 'a8', '-': 'tn8' }, {}, 'AM1');
    lay.parts.push(part('scope_probe', { tip: 'c5', gnd: 'tn20' }, {}, 'PR1'));
    const nl = buildNetlist(lay);
    const r = checkCircuit(ch, nl.circuit);
    expect(titles(r.issues)).toEqual([]);
    const sim = simulate(nl.circuit);
    expect(sim.meters.get('AM1')!.current).toBeCloseTo(sim.leds.get('D1')!.current, 6);
    expect(sim.meters.get('AM1')!.current).toBeCloseTo((9 - 1.8) / (470 + 12 + 1.5 + 0.1), 4);
  });

  it('an ammeter across a part is a short: checker + diagnostics explain it', () => {
    const ch = parseChallenge(led).challenge!;
    const lay = base();
    lay.parts.push(part('ammeter', { '+': 'c5', '-': 'tn10' }, {}, 'AM1')); // across LED (anode to GND)
    const nl = buildNetlist(lay);
    const r = checkCircuit(ch, nl.circuit);
    expect(r.perfect).toBe(false);
    expect(r.issues.some((i) => /ammeter AM1 has almost zero resistance/.test(i.detail ?? ''))).toBe(true);
    // across the battery: diagnostics name the ammeter
    const lay2 = base();
    lay2.parts.push(part('ammeter', { '+': 'tp20', '-': 'tn20' }, {}, 'AM2'));
    const nl2 = buildNetlist(lay2);
    expect(boardDiagnostics(nl2, simulate(nl2.circuit)).some((i) => i.title.startsWith('AM2 is shorting'))).toBe(true);
  });

  it('target with an ammeter: reading tested; reversed leads reported', () => {
    const ch = parseChallenge({
      ...led,
      components: [...led.components, { ref: 'AM1', type: 'ammeter' }],
      connections: [
        ['V1.+', 'AM1.+'],
        ['AM1.-', 'R1.1'],
        ['R1.2', 'D1.anode'],
        ['D1.cathode', 'V1.-'],
      ],
      tests: [{ name: 'meter', currents: [{ el: 'AM1', min: 0.014, max: 0.016 }] }],
    }).challenge!;
    expect(checkCircuit(ch, ch.target).perfect).toBe(true);
    const lay = base();
    lay.parts[1] = part('resistor', { '1': 'a3', '2': 'a5' }, { resistance: 470 }, 'R1');
    lay.parts.push(part('ammeter', { '+': 'tp3', '-': 'b3' }, {}, 'AM1'));
    expect(titles(checkCircuit(ch, buildNetlist(lay).circuit).issues)).toEqual([]);
    lay.parts[4] = part('ammeter', { '+': 'b3', '-': 'tp3' }, {}, 'AM1');
    expect(checkCircuit(ch, buildNetlist(lay).circuit).issues.map((i) => i.title)).toContain('AM1 is backwards');
  });

  it('format errors: scope_probe in components, phase without vs', () => {
    const r1 = parseChallenge({ ...led, components: [...led.components, { ref: 'P1', type: 'scope_probe' }] });
    expect(r1.errors.join()).toMatch(/measuring tool/);
    const r2 = parseChallenge({ ...led, tests: [{ name: 'x', scope: [{ pin: 'R1.1', measure: 'phase', min: 0 }] }] });
    expect(r2.errors.join()).toMatch(/needs "vs"/);
  });
});

describe('diagnostics + schematic for the op-amp', () => {
  const board = (power: boolean): Layout => ({
    version: 1,
    parts: [
      part('battery', { '+': 'tp1', '-': 'tn1' }, { variant: '9V' }, 'BAT1'),
      at('opamp', 'e10', {}, 'U1'),
      ...(power ? [part('wire', { a: 'tp10', b: 'j10' }), part('wire', { a: 'a13', b: 'tn13' })] : []),
      part('resistor', { '1': 'b10', '2': 'tn5' }, { resistance: 1000 }, 'RL'), // load on OUT A
      part('wire', { a: 'b11', b: 'c10' }), // follower: IN− A = OUT A; IN+ A floating
    ],
  });
  it('warns about missing power and a floating input', () => {
    const nl = buildNetlist(board(false));
    const d = boardDiagnostics(nl, simulate(nl.circuit)).map((i) => i.title);
    expect(d).toContain('U1 has no power');
    expect(d.some((t) => t.startsWith('U1 input floating'))).toBe(true);
    const nl2 = buildNetlist(board(true));
    const d2 = boardDiagnostics(nl2, simulate(nl2.circuit)).map((i) => i.title);
    expect(d2).not.toContain('U1 has no power');
    // half B is unused: no noise about its pins
    expect(d2.some((t) => /OUT B|IN. B/.test(t))).toBe(false);
  });
  it('schematic draws one element per used half with finite coordinates', () => {
    const ch = parseChallenge(fixture('opamp-noninverting.json')).challenge!;
    const s = layoutSchematic(ch.target, simulate(ch.target));
    const halves = s.elements.filter((e) => e.comp.type === 'opamp');
    expect(halves.map((e) => e.half)).toEqual(['A']);
    for (const e of s.elements) for (const l of e.leads) expect([l.x1, l.y1, l.x2, l.y2].every(Number.isFinite)).toBe(true);
  });
});

describe('scope vsref (differential compare)', () => {
  const base = {
    format: 'breadboard-challenge/1',
    id: 'rl-vsref',
    title: 'RL',
    components: [
      { ref: 'FG1', type: 'function_gen' },
      { ref: 'L1', type: 'inductor', inductance: '10m' },
      { ref: 'R1', type: 'resistor', resistance: '100' },
    ],
    connections: [
      ['FG1.+', 'L1.1'],
      ['L1.2', 'R1.1'],
      ['R1.2', 'FG1.-'],
    ],
  };
  it('V_L leads V_R by ~90°', () => {
    const res = parseChallenge({
      ...base,
      tests: [{ name: 'phase', set: { FG1: { frequency: 1000 } }, scope: [{ pin: 'L1.1', ref: 'L1.2', measure: 'phase', vs: 'R1.1', vsref: 'R1.2', min: 85, max: 91 }] }],
    });
    expect(res.errors).toEqual([]);
    expect(res.challenge!.tests[0].scope[0].vsref).toBe('R1.2');
    expect(titles(checkCircuit(res.challenge!, res.challenge!.target).issues)).toEqual([]);
  });
  it('vsref without vs is an error', () => {
    const res = parseChallenge({ ...base, tests: [{ name: 'x', scope: [{ pin: 'L1.1', measure: 'vpp', vsref: 'R1.2', min: 0 }] }] });
    expect(res.errors.join()).toMatch(/vsref/);
  });
});
