import { describe, expect, it } from 'vitest';
import { BENCH, bench, buffered, direct, EX55, gain, I_OUT_MAX, mixed, nonInverting, posOfRl, rlOfPos, SENSOR, WINDOW } from './model';

describe('W3-L4 non-inverting amplifier and voltage follower', () => {
  it('act 2: R_1 = 10 kΩ, R_f = 20 kΩ, v_i = 1.5 V → A_v = 3, v_o = 4.5 V, i_f = i_1 = 0.15 mA', () => {
    const n = nonInverting(1.5, 10e3, 20e3, 'dual');
    expect(n.av).toBe(3);
    expect(n.vo).toBeCloseTo(4.5, 12);
    expect(n.sat).toBeNull();
    expect(n.vminus).toBeCloseTo(1.5, 12); // virtual short holds in the linear region
    expect((n.vo - n.vminus) / 20e3).toBeCloseTo(0.15e-3, 12);
    expect(n.i1).toBeCloseTo(0.15e-3, 12);
    // the KCL form of act 2 ②: v_i/R_1 + (v_i − v_o)/R_f = 0
    expect(1.5 / 10e3 + (1.5 - n.vo) / 20e3).toBeCloseTo(0, 15);
    // the divider view: v− = R_1/(R_1 + R_f) · v_o
    expect((10e3 / 30e3) * n.vo).toBeCloseTo(1.5, 12);
  });

  it('gain ≥ 1 always; R_f = 0 (and R_1 = ∞) is the follower', () => {
    for (const [r1, rf] of [
      [1e3, 0],
      [50e3, 1e3],
      [1e3, 100e3],
      [10e3, 5e3],
    ])
      expect(gain(r1, rf)).toBeGreaterThanOrEqual(1);
    expect(gain(10e3, 0)).toBe(1);
    expect(gain(Infinity, 0)).toBe(1);
    expect(gain(10e3, 5e3)).toBe(1.5); // quiz Q3 A: not an attenuator
    expect(gain(10e3, 40e3)).toBe(5); // quiz Q1
  });

  it('the LM358 on +9 V tops out at +7.5 V: v_i = 3 V clips, the virtual short fails (v− = 2.5 V)', () => {
    expect(WINDOW.dual).toEqual([-7.5, 7.5]);
    expect(WINDOW.single).toEqual([0.02, 7.5]);
    for (const s of ['dual', 'single'] as const) {
      const n = nonInverting(3, 10e3, 20e3, s);
      expect(n.ideal).toBeCloseTo(9, 12);
      expect(n.vo).toBe(7.5);
      expect(n.sat).toBe('high');
      expect(n.vminus).toBeCloseTo(2.5, 12);
      expect(n.vplus).toBe(3);
    }
    // single supply: 1.5 V → 4.5 V works; the follower 5 V → 5 V works
    expect(nonInverting(1.5, 10e3, 20e3, 'single').vo).toBeCloseTo(4.5, 12);
    expect(nonInverting(5, 10e3, 0, 'single').vo).toBe(5);
    // no negative output on a single supply
    expect(nonInverting(-1, 10e3, 20e3, 'single').vo).toBe(0.02);
    expect(nonInverting(-1, 10e3, 20e3, 'dual').vo).toBeCloseTo(-3, 12);
  });

  it('act 3: V_Th = 5 V, R_Th = 10 kΩ, R_L = 1 kΩ — direct 0.455 V / 0.207 mW, buffered 5 V / 5 mA / 25 mW', () => {
    const d = direct(1e3);
    expect(d.vl).toBeCloseTo(5 / 11, 12);
    expect(d.vl).toBeCloseTo(0.455, 3);
    expect(d.il * 1e3).toBeCloseTo(0.455, 3);
    expect(d.pl * 1e3).toBeCloseTo(0.207, 3);
    expect(1 - d.vl / SENSOR.vth).toBeCloseTo(0.909, 3); // 90.9 % lost in R_Th
    expect(SENSOR.vth - d.vl).toBeCloseTo(4.545, 3);
    const b = buffered(1e3);
    expect(b.vl).toBe(5);
    expect(b.isrc).toBe(0);
    expect(b.il * 1e3).toBeCloseTo(5, 12);
    expect(b.pl * 1e3).toBeCloseTo(25, 12);
    expect(b.pl / d.pl).toBeCloseTo(121, 9);
    // the layer-2 hint: at R_L = 500 Ω the direct curve is down at 0.238 V, the buffer still 5 V
    expect(direct(500).vl).toBeCloseTo(0.238, 3);
    expect(buffered(500).vl).toBe(5);
    // below 250 Ω the buffer would need more than 20 mA
    expect(SENSOR.vth / I_OUT_MAX).toBe(250);
    expect(buffered(250).limited).toBe(false);
    expect(buffered(200).limited).toBe(true);
    expect(buffered(200).vl).toBeCloseTo(4, 12);
  });

  it('quiz Q1 / Q2: an inverting amp with R_in = R_1 = 10 kΩ on a 100 kΩ sensor keeps 9.1 % of the signal', () => {
    const kept = 10e3 / (100e3 + 10e3);
    expect(1 - kept).toBeCloseTo(0.909, 3);
    expect(5 * (1 / 11)).toBeCloseTo(0.455, 3);
  });

  it('Sadiku Example 5.5: v− = 4 V, i_1 = i_f = 0.5 mA, v_o = −1 V = −15 V + 14 V', () => {
    const m = mixed('dual');
    expect(m.vminus).toBe(4);
    expect(m.i1 * 1e3).toBeCloseTo(0.5, 12);
    expect(m.ifb * 1e3).toBeCloseTo(0.5, 12);
    expect(m.vo).toBeCloseTo(-1, 12);
    expect(m.vo1).toBeCloseTo(-15, 12);
    expect(m.vo2).toBeCloseTo(14, 12);
    expect(m.sat).toBeNull();
    // v_o = v− − i_f R_f
    expect(4 - 0.5e-3 * EX55.rf).toBeCloseTo(-1, 12);
    // each part alone would hit the ±7.5 V window
    expect(Math.abs(m.vo1)).toBeGreaterThan(WINDOW.dual[1]);
    expect(m.vo2).toBeGreaterThan(WINDOW.dual[1]);
    // single +9 V: no −1 V — the output sits at its low limit and v− ≠ v+
    const s = mixed('single');
    expect(s.vo).toBe(0.02);
    expect(s.sat).toBe('low');
    expect(s.vminus).toBeCloseTo((6 * 10e3 + 0.02 * 4e3) / 14e3, 12);
    expect(s.vminus).not.toBeCloseTo(4, 2);
    // the breadboard builds R_1 = 4 kΩ from two 2 kΩ (E24) in series
    expect(2e3 + 2e3).toBe(EX55.r1);
  });

  it('quiz Q4: +3 V on IN+, +5 V via 2 kΩ, R_f = 6 kΩ → −3 V', () => {
    const m = mixed('dual', { vs1: 5, vs2: 3, r1: 2e3, rf: 6e3 });
    expect(m.vo).toBeCloseTo(-3, 12);
    expect(m.i1 * 1e3).toBeCloseTo(1, 12);
  });

  it('the breadboard presets', () => {
    expect(bench('ni', 'dual', 1.5, true).vout).toBeCloseTo(4.5, 12);
    expect(bench('ni', 'single', 3, true).vout).toBe(7.5);
    expect(bench('ex55', 'dual', 0, true).vout).toBeCloseTo(-1, 12);
    expect(bench('ex55', 'single', 0, true).vout).toBe(0.02);
    const fb = bench('buf', 'single', 0, true);
    expect(fb.vout).toBe(5);
    expect(fb.il! * 1e3).toBeCloseTo(5, 12);
    expect(bench('buf', 'dual', 0, false).vout).toBeCloseTo(0.455, 3);
    // resistor currents stay far below the 1/4 W rating (the sheet's "no scaling needed")
    expect((4.5 * 4.5) / (BENCH.r1 + BENCH.rf)).toBeLessThan(0.25 / 100);
    expect(0.005 * 0.005 * BENCH.rl).toBe(0.025);
  });

  it('the log R_L slider', () => {
    expect(rlOfPos(0)).toBe(100);
    expect(rlOfPos(1)).toBeCloseTo(100e3, 6);
    expect(rlOfPos(posOfRl(1000))).toBeCloseTo(1000, 6);
    expect(posOfRl(1000)).toBeCloseTo(1 / 3, 12);
  });
});
