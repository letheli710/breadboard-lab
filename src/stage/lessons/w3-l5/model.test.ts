// The numbers of the W3-L5 lesson sheet, checked against the circuit model.

import { describe, expect, it } from 'vitest';
import { AMP_PRESETS, BOOST_V1, MIX_PRESETS, fmt, idealSummer, passiveMixer, solveSummer } from './model';

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('act 1: passive mixer vs. virtual-ground summer (10 kΩ everywhere, v1 = 2 V)', () => {
  it('passive: v2 = 0 V → v_mix = 0.667 V, i1 = 0.133 mA, i2 = −0.067 mA', () => {
    const p = passiveMixer(2, 0, 10, 10, 10);
    expect(fmt(p.vNode, 3)).toBe('0.667');
    expect(fmt(p.i1, 3)).toBe('0.133');
    expect(fmt(p.i2, 3)).toBe('−0.067');
  });
  it('passive: v2 = 4 V → v_mix = 2 V, i1 = 0 (−100 %), i2 = 0.2 mA', () => {
    const p = passiveMixer(2, 4, 10, 10, 10);
    close(p.vNode, 2);
    close(p.i1, 0);
    close(p.i2, 0.2);
  });
  it('summer: i1 = 0.2 mA whatever v2; vo = −2 V, then −6 V', () => {
    const a = idealSummer([2, 0], [10, 10], 10);
    const b = idealSummer([2, 4], [10, 10], 10);
    close(a.i[0], 0.2);
    close(b.i[0], 0.2);
    close(b.i[1], 0.4);
    close(a.vo, -2);
    close(b.vo, -6);
  });
});

describe('act 2: three-channel worked example (Rf = 20 kΩ)', () => {
  it('weights 2, 4, 1; i = 0.1, 0.1, −0.1 mA; if = 0.1 mA; vo = −2 V', () => {
    const s = idealSummer([1, 0.5, -2], [10, 5, 20], 20);
    expect(s.w).toEqual([2, 4, 1]);
    close(s.i[0], 0.1);
    close(s.i[1], 0.1);
    close(s.i[2], -0.1);
    close(s.iF, 0.1);
    close(s.vo, -2);
  });
  it('the weighted_mixer preset is that circuit', () => {
    expect(MIX_PRESETS.weighted_mixer.R).toEqual([10, 5, 20]);
    expect(MIX_PRESETS.weighted_mixer.Rf).toBe(20);
  });
});

describe('act 3: variants', () => {
  it('mixer faders: Rf = 12 kΩ over 4, 6, 12 kΩ gives weights 3, 2, 1', () => {
    expect(idealSummer([0, 0, 0], [4, 6, 12], 12).w).toEqual([3, 2, 1]);
  });
  it('averager: 4 × 20 kΩ with Rf = 5 kΩ gives −(sum)/4; the 3-channel preset 15/5 gives −(sum)/3', () => {
    close(idealSummer([1, 2, 3, 6], [20, 20, 20, 20], 5).vo, -3);
    const p = MIX_PRESETS.inverting_averager;
    close(idealSummer([1, 2, 6], p.R as number[], p.Rf).vo, -3);
  });
  it('level shifter: vo = −vsig + 1.65 V, 2.65 / 1.65 / 0.65 V for vsig = −1 / 0 / +1 V', () => {
    const at = (vsig: number) => idealSummer([vsig, -3.3], [10, 20], 10).vo;
    close(at(-1), 2.65);
    close(at(0), 1.65);
    close(at(1), 0.65);
  });
});

describe('act 4: Sadiku Example 5.6', () => {
  const e = AMP_PRESETS.sadiku_example_5_6;
  it('±12 V: vo = −8 V, if = 0.8 mA, iL = −4 mA, io = −4.8 mA, linear', () => {
    const s = solveSummer(e.v, e.R, e.Rf, e.RL, 12);
    close(s.vo, -8);
    close(s.iF, 0.8);
    close(s.iL, -4);
    close(s.io, -4.8);
    close(s.vMinus, 0);
    expect(s.saturated).toBe(false);
  });
  it('±5 V: clamps at −5 V, v− = 3/7 V, if = 19/35 mA, i1 ≈ 0.314 mA, i2 ≈ 0.229 mA', () => {
    const s = solveSummer(e.v, e.R, e.Rf, e.RL, 5);
    expect(s.saturated).toBe(true);
    close(s.voIdeal, -8);
    close(s.vo, -5);
    close(s.vMinus, 3 / 7);
    close(s.iF, 19 / 35);
    expect(fmt(s.i[0], 3)).toBe('0.314');
    expect(fmt(s.i[1], 3)).toBe('0.229');
    close(s.i[0] + s.i[1], s.iF); // KCL at node a still holds (i− = 0)
  });
});

describe('act 5: the three-channel mixer (guided example)', () => {
  const g = AMP_PRESETS.socratic_3ch_mixer;
  it('normal: i = 0.30, 0.25, −0.05 mA; if = 0.5 mA; vo = −6 V; io = −2 mA', () => {
    const s = solveSummer(g.v, g.R, g.Rf, g.RL, g.Vcc);
    close(s.i[0], 0.3);
    close(s.i[1], 0.25);
    close(s.i[2], -0.05);
    close(s.iF, 0.5);
    close(s.vo, -6);
    close(s.iL, -1.5);
    close(s.io, -2);
    expect(s.saturated).toBe(false);
  });
  it('v1 = 3.0 V: vo_ideal = −11.4 V, clamps at −10 V', () => {
    const s = solveSummer([BOOST_V1, 1.5, -0.6], g.R, g.Rf, g.RL, g.Vcc);
    close(s.voIdeal, -11.4);
    close(s.vo, -10);
    expect(s.saturated).toBe(true);
    close(s.vMinus, 0.2);
  });
  it('step 5 board: −(3 × 3.0 + 2 × 1.5 − 0.6) = −11.4 V', () => {
    close(-(3 * 3 + 2 * 1.5 - 0.6), -11.4);
  });
});

describe('quiz', () => {
  it('Q2: weights 3, 1, 2 → vo = −2 V (ignoring the sign of v2: −6 V)', () => {
    const s = idealSummer([1, -2, 0.5], [5, 15, 7.5], 15);
    expect(s.w).toEqual([3, 1, 2]);
    close(s.vo, -2);
    close(idealSummer([1, 2, 0.5], [5, 15, 7.5], 15).vo, -6);
  });
  it('Q3: four 20 kΩ inputs average with Rf = 5 kΩ', () => {
    close(idealSummer([1, 1, 1, 1], [20, 20, 20, 20], 5).vo, -1);
  });
  it('Q1: i1 does not depend on R2', () => {
    close(idealSummer([1, 1, 1], [10, 10, 10], 10).i[0], idealSummer([1, 1, 1], [10, 5, 10], 10).i[0]);
  });
});
