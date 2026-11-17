// Threshold rules on dev-board pins (mcuRules.ts): the NTC fan capstone (296) with its two outputs
// following the ADC — the fan and the LED come on above 40 °C, with hysteresis on the way back.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseChallenge } from './challenge';
import { checkCircuit } from './check';
import { ruleCode, ruleOutput, type RuleState } from './mcuRules';
import { buildNetlist } from './netlist';
import { simulate } from './solver';
import { simulateTransient } from './transient';
import type { Layout, PinConfig } from './types';

const ch = parseChallenge(JSON.parse(readFileSync('challenges/296-capstone-ntc-fan.json', 'utf8'))).challenge!;
const RULE: PinConfig = { mode: 'rule', rule: { adc: 'GPIO34', above: 2674, hysteresis: 150 } };

function board(temperature: number, rule: PinConfig = RULE): Layout {
  const L = structuredClone(ch.solution!);
  for (const p of L.parts) {
    if (p.type === 'ntc') p.props.temperature = temperature;
    if (p.type === 'esp32_devkit') p.props.pins = { ...p.props.pins, GPIO26: rule, GPIO27: rule };
  }
  return L;
}

const state = (temperature: number, mem?: RuleState) => {
  const nl = buildNetlist(board(temperature));
  const sim = simulate(nl.circuit, mem);
  return { fan: sim.motors.get('M1')?.running, led: sim.leds.get('LED1')?.on, out: sim.mcus.get('U1')?.pins.get('GPIO26')?.logic, nl };
};

describe('threshold rules', () => {
  it('compare with hysteresis', () => {
    const r = { adc: 'X', above: 2000, hysteresis: 100 };
    expect([ruleOutput(r, 2001, false), ruleOutput(r, 1950, false), ruleOutput(r, 1950, true), ruleOutput(r, 1899, true)]).toEqual([true, false, true, false]);
    const b = { adc: 'X', below: 1000 };
    expect([ruleOutput(b, 999, false), ruleOutput(b, 1001, true)]).toEqual([true, false]);
    // exactly the code line: off only when the reading is strictly past threshold ∓ hysteresis
    expect([ruleOutput(r, 1900, true), ruleOutput(r, 1899, true), ruleOutput(r, 2000, true), ruleOutput(r, 2000, false)]).toEqual([true, false, true, false]);
    const bh = { adc: 'X', below: 1000, hysteresis: 50 };
    expect([ruleOutput(bh, 1050, true), ruleOutput(bh, 1051, true), ruleOutput(bh, 1020, false)]).toEqual([true, false, false]);
  });

  it('spell the turn-off reading out in the code line when there is hysteresis', () => {
    expect(ruleCode({ adc: 'GPIO34', above: 2674, hysteresis: 150 }, 'GPIO26')).toBe(
      'if (analogRead(GPIO34) > 2674) GPIO26 = HIGH; else if (analogRead(GPIO34) < 2524) GPIO26 = LOW;',
    );
    expect(ruleCode({ adc: 'GPIO34', below: 800, hysteresis: 100 }, 'GPIO27')).toBe(
      'if (analogRead(GPIO34) < 800) GPIO27 = HIGH; else if (analogRead(GPIO34) > 900) GPIO27 = LOW;',
    );
    expect(ruleCode({ adc: 'GPIO34', above: 2674 }, 'GPIO26')).toBe('if (analogRead(GPIO34) > 2674) GPIO26 = HIGH; else GPIO26 = LOW;');
    expect(ruleCode({ adc: 'GPIO34', above: 100, hysteresis: 500 }, 'GPIO26')).toContain('< 0)');
  });

  it('switch the fan and the LED with the temperature', () => {
    expect(state(25)).toMatchObject({ fan: false, led: false, out: 'low' });
    expect(state(60)).toMatchObject({ fan: true, led: true, out: 'high' });
  });

  it('remember their state inside the hysteresis band', () => {
    const mem: RuleState = new Map();
    expect(state(30, mem).fan).toBe(false);
    expect(state(42, mem).fan).toBe(true); // past 2674 counts
    expect(state(39, mem).fan).toBe(true); // back below the threshold, still inside the band
    expect(state(30, mem).fan).toBe(false);
    expect(state(39, new Map()).fan).toBe(false); // with no history a rule starts LOW
  });

  it('hold LOW when the ADC pin cannot read', () => {
    expect(state(60, undefined).fan).toBe(true);
    const nl = buildNetlist(board(60, { mode: 'rule', rule: { adc: 'GPIO26', above: 100 } }));
    expect(simulate(nl.circuit).motors.get('M1')?.running).toBe(false);
  });

  it('give the transient engine plain outputs', () => {
    const { nl } = state(60);
    expect(() => simulateTransient(nl.circuit)).not.toThrow();
  });

  it('let the capstone pass its tests with no hand-set pin modes', () => {
    const nl = buildNetlist(ch.solution!);
    const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
    expect(r.issues.map((i) => i.title)).toEqual([]);
  });
});

describe('the capstone asks for the rule', () => {
  it('flags output pins left as plain outputs', () => {
    const L = board(60, { mode: 'out_high' });
    const nl = buildNetlist(L);
    const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
    expect(r.issues.map((i) => i.title).join('\n')).toMatch(/wrong mode|模式不对/);
  });
});
