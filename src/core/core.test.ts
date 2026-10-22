import { describe, expect, it } from 'vitest';
import { parseChallenge } from './challenge';
import { checkCircuit } from './check';
import { boardDiagnostics } from './diagnostics';
import { buildNetlist } from './netlist';
import { simulate } from './solver';
import { layoutSchematic } from './schematic';
import type { Layout, PlacedPart } from './types';
import { parseValue, resistorBands } from './format';

let n = 0;
const part = (type: PlacedPart['type'], pins: Record<string, string>, props = {}, ref?: string): PlacedPart => ({
  id: `p${n++}`,
  ref: ref ?? `${type}${n}`,
  type,
  props,
  pins,
});

const ledCircuit = (resistorHoles: [string, string], ledHoles: [string, string]): Layout => ({
  version: 1,
  parts: [
    part('battery', { '+': 'tp1', '-': 'tn1' }, { variant: '9V' }, 'BAT1'),
    part('wire', { a: 'tp5', b: 'a5' }),
    part('resistor', { '1': resistorHoles[0], '2': resistorHoles[1] }, { resistance: 330 }, 'R1'),
    part('led', { anode: ledHoles[0], cathode: ledHoles[1] }, { color: 'red' }, 'LED1'),
    part('wire', { a: 'e12', b: 'tn12' }),
  ],
});

const challengeJson = {
  format: 'breadboard-challenge/1',
  id: 'led',
  title: 'LED',
  components: [
    { ref: 'V1', type: 'dc_source', voltage: 9 },
    { ref: 'R1', type: 'resistor', resistance: '330' },
    { ref: 'D1', type: 'led', color: 'red' },
  ],
  connections: [
    ['V1.+', 'R1.1'],
    ['R1.2', 'D1.anode'],
    ['D1.cathode', 'V1.-'],
  ],
  tests: [{ name: 'LED on', expect: { D1: 'on' } }],
};

describe('format', () => {
  it('parses values', () => {
    expect(parseValue('4.7k')).toBeCloseTo(4700);
    expect(parseValue('4k7')).toBeCloseTo(4700);
    expect(parseValue('330Ω')).toBe(330);
    expect(parseValue('10uF')).toBeCloseTo(1e-5);
  });
  it('colour bands', () => {
    expect(resistorBands(330).map((b) => b.name[0])).toEqual(['橙', '橙', '棕', '金']);
    expect(resistorBands(10000).map((b) => b.name[0])).toEqual(['棕', '黑', '橙', '金']);
  });
});

describe('netlist + solver', () => {
  it('lights an LED through a resistor', () => {
    const nl = buildNetlist(ledCircuit(['b5', 'b9'], ['c9', 'c12']));
    expect(nl.circuit.nets.length).toBe(3);
    const sim = simulate(nl.circuit);
    const led = sim.leds.get('LED1')!;
    expect(led.on).toBe(true);
    expect(led.current).toBeGreaterThan(0.018);
    expect(led.current).toBeLessThan(0.023);
    expect(boardDiagnostics(nl, sim).filter((i) => i.severity !== 'info')).toEqual([]);
  });

  it('detects reversed LED', () => {
    const nl = buildNetlist(ledCircuit(['b5', 'b9'], ['c12', 'c9']));
    const sim = simulate(nl.circuit);
    expect(sim.leds.get('LED1')!.on).toBe(false);
    expect(boardDiagnostics(nl, sim).some((i) => i.title.includes('接反'))).toBe(true);
  });

  it('detects resistor shorted in one strip', () => {
    const nl = buildNetlist(ledCircuit(['a5', 'd5'], ['c9', 'c12']));
    const sim = simulate(nl.circuit);
    const d = boardDiagnostics(nl, sim);
    expect(d.some((i) => i.title.includes('R1 被短路'))).toBe(true);
  });

  it('detects a shorted battery', () => {
    const lay: Layout = { version: 1, parts: [part('battery', { '+': 'tp1', '-': 'tn1' }, {}, 'B'), part('wire', { a: 'tp3', b: 'tn3' })] };
    const nl = buildNetlist(lay);
    // a battery whose + and - are the same net
    const sim = simulate(nl.circuit);
    expect(sim.sources.get('B')!.shorted).toBe(true);
  });

  it('bench supply current limits', () => {
    const lay: Layout = {
      version: 1,
      parts: [
        part('bench_supply', { '+': 'tp1', '-': 'tn1' }, { voltage: 5, currentLimit: 0.1 }, 'P'),
        part('resistor', { '1': 'tp4', '2': 'tn4' }, { resistance: 10 }, 'R'),
      ],
    };
    const sim = simulate(buildNetlist(lay).circuit);
    const s = sim.sources.get('P')!;
    expect(s.ccMode).toBe(true);
    expect(s.current).toBeCloseTo(0.1, 3);
    expect(s.terminalVoltage).toBeCloseTo(1, 1);
  });

  it('pushbutton across trench', () => {
    const lay: Layout = {
      version: 1,
      parts: [
        part('power_module', { '+t': 'tp1', '-t': 'tn1', '+b': 'bp1', '-b': 'bn1' }, { voltage: 5 }, 'PM'),
        part('wire', { a: 'tp3', b: 'a3' }),
        part('pushbutton', { '1a': 'e3', '2a': 'e5', '1b': 'f3', '2b': 'f5' }, { pressed: false }, 'SW'),
        part('resistor', { '1': 'j5', '2': 'j8' }, { resistance: 220 }, 'R'),
        part('led', { anode: 'i8', cathode: 'i10' }, {}, 'L'),
        part('wire', { a: 'j10', b: 'bn10' }),
      ],
    };
    const nl = buildNetlist(lay);
    expect(simulate(nl.circuit).leds.get('L')!.on).toBe(false);
    lay.parts[2].props.pressed = true;
    expect(simulate(buildNetlist(lay).circuit).leds.get('L')!.on).toBe(true);
  });
});

describe('challenge checking', () => {
  const res = parseChallenge(challengeJson);
  it('parses', () => {
    expect(res.errors).toEqual([]);
    expect(res.challenge!.target.nets.length).toBe(3);
  });

  it('target itself passes its tests', () => {
    const ch = res.challenge!;
    const r = checkCircuit(ch, ch.target);
    expect(r.perfect).toBe(true);
  });

  it('accepts a correct board', () => {
    const nl = buildNetlist(ledCircuit(['b5', 'b9'], ['c9', 'c12']));
    const r = checkCircuit(res.challenge!, nl.circuit);
    expect(r.issues).toEqual([]);
    expect(r.perfect).toBe(true);
  });

  it('reports reversed LED', () => {
    const nl = buildNetlist(ledCircuit(['b5', 'b9'], ['c12', 'c9']));
    const r = checkCircuit(res.challenge!, nl.circuit);
    expect(r.perfect).toBe(false);
    expect(r.issues.map((i) => i.title)).toContain('LED1 接反了');
  });

  it('reports wrong value and broken connection', () => {
    const lay = ledCircuit(['b5', 'b9'], ['c10', 'c12']);
    lay.parts[2].props.resistance = 1000;
    const r = checkCircuit(res.challenge!, buildNetlist(lay).circuit);
    const titles = r.issues.map((i) => i.title).join('|');
    expect(titles).toContain('参数不对');
    expect(titles).toContain('断开了');
  });

  it('reports extra component', () => {
    const lay = ledCircuit(['b5', 'b9'], ['c9', 'c12']);
    lay.parts.push(part('resistor', { '1': 'h20', '2': 'h22' }, { resistance: 100 }, 'R9'));
    const r = checkCircuit(res.challenge!, buildNetlist(lay).circuit);
    expect(r.issues.some((i) => i.title.includes('多出元件'))).toBe(true);
  });

  it('schematic layout puts GND at the bottom', () => {
    const nl = buildNetlist(ledCircuit(['b5', 'b9'], ['c9', 'c12']));
    const s = layoutSchematic(nl.circuit, simulate(nl.circuit));
    const gnd = s.buses.find((b) => b.isGround)!;
    expect(Math.max(...s.buses.map((b) => b.y))).toBe(gnd.y);
  });
});
