import { describe, expect, it } from 'vitest';
import { dep, fmt, psc } from './model';

const p = (v: number, i: number, topPlus: boolean, iEntersTop: boolean, dt = 10) => psc({ v, i, topPlus, iEntersTop, dt });

describe('W1-L2 passive sign convention', () => {
  it('reproduces the lesson numbers', () => {
    // act 1: 12 V × 2.5 A for 40 s
    expect(p(12, 2.5, true, true, 40)).toMatchObject({ p: 30, w: 1200, mode: 'absorb' });
    // act 2: notation A (arrow in at +, i = −3 A) and B (arrow out of +, i = +3 A) agree
    expect(p(4, -3, true, true).p).toBe(-12);
    expect(p(4, 3, true, false).p).toBe(-12);
    // flipping the voltage reference and the sign of v changes nothing either
    expect(p(-4, -3, false, true).p).toBe(-12);
    // act 4: 12 V battery, 3 A, discharging / charging
    expect(p(12, 3, true, false).p).toBe(-36);
    expect(p(12, 3, true, true).p).toBe(36);
    // quiz Q1: v = −10 V, 4 A into +
    expect(p(-10, 4, true, true)).toMatchObject({ p: -40, mode: 'supply' });
    expect(p(0, 4, true, true).mode).toBe('zero');
    expect(p(1, 1, true, true, 3600).kwh).toBeCloseTo(1 / 1000);
  });

  it('balances the act-3 loop and the guided example', () => {
    expect(-24 * 2 + 10 * 2 + 6 * 2 + 8 * 2).toBe(0);
    const i4 = 0.2 * 5;
    expect(5 + i4).toBe(6); // KCL at the top node
    expect(20).toBe(12 + 8); // KVL, left loop
    expect(-20 * 5 + 12 * 5 + 8 * 6 + dep('CCCS', 5, 0.2, 8).ps).toBeCloseTo(0);
  });
});

describe('W1-L2 dependent sources', () => {
  it('computes output and power', () => {
    expect(dep('VCVS', 0.5, 10, 0.4)).toMatchObject({ out: 5, ps: -2 });
    expect(dep('CCCS', 5, 0.2, 8).out).toBeCloseTo(1);
    expect(dep('CCCS', 5, 0.2, 8).ps).toBeCloseTo(-8);
    // quiz Q2: VCVS 3 × 5 V, 1 A into + (= −1 A out of +) absorbs 15 W
    expect(dep('VCVS', 5, 3, -1).ps).toBe(15);
    expect(dep('VCCS', 2, 5, 3)).toMatchObject({ out: 10, vs: 3, is: 10, ps: -30 });
  });

  it('formats numbers', () => {
    expect(fmt(-2)).toBe('−2');
    expect(fmt(0.30000000000000004)).toBe('0.3');
    expect(fmt(-0)).toBe('0');
  });
});
