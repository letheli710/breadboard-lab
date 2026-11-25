import { describe, expect, it } from 'vitest';
import { finiteGain, fmtI, fmtV, ioLoaded, loaded, P_RATED, solve, supplyCurrents, thermalNoise, tiaOut, VSAT_POS, linWindow } from './model';

const close = (x: number, y: number, d = 9) => expect(x).toBeCloseTo(y, d);

describe('W3-L3 inverting amplifier numbers (lesson sheet)', () => {
  it('act 2: R1 = 10 kΩ, R_f = 22 kΩ, v_i = +1 V → A_v = −2.2, v_o = −2.2 V, i1 = i_f = 100 µA', () => {
    const a = solve(1, 10e3, 22e3);
    close(a.av, -2.2);
    close(a.vo, -2.2);
    close(a.vMinus, 0);
    close(a.i1, 100e-6);
    close(a.iF, 100e-6);
    expect(a.state).toBe('linear');
  });

  it('act 2.2: finite open-loop gain A = 1e5 → −2.1999296 (−0.0032 %)', () => {
    const g = finiteGain(2.2, 1e5);
    close(g, -2.1999296, 7);
    close((g - -2.2) / -2.2, -3.2e-5, 7);
  });

  it('act 3: loading by R_s = 1 kΩ, V_s = 1 V: R1 = 1k / 10k / 100k → 0.5000 / 0.9091 / 0.9901 V', () => {
    expect([1e3, 10e3, 100e3].map((r) => loaded(1, 1e3, r).toFixed(4))).toEqual(['0.5000', '0.9091', '0.9901']);
    expect([1e3, 10e3, 100e3].map((r) => ((loaded(1, 1e3, r) - 1) * 100).toFixed(2))).toEqual(['-50.00', '-9.09', '-0.99']);
  });

  it('act 3.2: 45 nA bias through 10 MΩ = 0.45 V; thermal noise grows as √R', () => {
    close(45e-9 * 10e6, 0.45);
    close(thermalNoise(4e6, 1e4) / thermalNoise(1e6, 1e4), 2);
  });

  it('Example 5.3: R1 = 10 kΩ, R_f = 25 kΩ, v_i = 0.5 V → A_v = −2.5, v_o = −1.25 V, i1 = i_f = 50 µA, i_o = −50 µA; R_L = 5 kΩ → −300 µA', () => {
    const a = solve(0.5, 10e3, 25e3);
    close(a.av, -2.5);
    close(a.vo, -1.25);
    close(a.i1, 50e-6);
    close(a.iF, 50e-6);
    close(a.io, -50e-6);
    close(-1.25 / 5e3, -250e-6);
    close(ioLoaded(0.5, 10e3, 25e3, 5e3), -300e-6);
  });

  it('Example 5.4 (TIA): i_s = 200 µA, R_f = 20 kΩ → v_o = −4.00 V', () => {
    close(tiaOut(200e-6, 20e3), -4);
  });

  it('act 5: LM358 on ±9 V swings [−9, +7.5] V; linear input window [−3.41, +4.09] V for R_f/R1 = 2.2', () => {
    expect(VSAT_POS).toBe(7.5);
    const w = linWindow(10e3, 22e3, 'dual');
    expect(w.viLo.toFixed(4)).toBe('-3.4091');
    expect(w.viHi.toFixed(4)).toBe('4.0909');
    const s = linWindow(10e3, 22e3, 'single');
    expect(s.viHi).toBe(0);
  });

  it('act 5.3: single +9 V, v_i = +1 V → v_o stuck at 0 V, v− = 22/32 V ≈ +0.69 V', () => {
    const a = solve(1, 10e3, 22e3, 'single');
    close(a.vo, 0);
    close(a.vMinus, 22 / 32);
    expect(a.vMinus.toFixed(2)).toBe('0.69');
    expect(a.state).toBe('sat_neg');
  });

  it('act 6.2 table: v_i = −4 / −2 / 0 / +1 / +2 / +4.09 / +5 V', () => {
    const rows = [-4, -2, 0, 1, 2, 4.09, 5].map((vi) => solve(vi, 10e3, 22e3));
    expect(rows.map((a) => fmtV(a.vo))).toEqual(['+7.50 V', '+4.40 V', '0.00 V', '−2.20 V', '−4.40 V', '−9.00 V', '−9.00 V']);
    expect(rows.map((a) => a.vMinus.toFixed(2))).toEqual(['-0.41', '0.00', '0.00', '0.00', '0.00', '0.00', '0.63']);
    expect(rows.map((a) => a.state)).toEqual(['sat_pos', 'linear', 'linear', 'linear', 'linear', 'linear', 'sat_neg']);
    expect(fmtI(rows[1].i1)).toBe('−200 µA');
    expect(fmtI(rows[3].i1)).toBe('+100 µA');
  });

  it('faults: R_f open → comparator (−9 V for v_i > 0); Pin 2 on GND → v_o = 0, v− = 0', () => {
    const o = solve(1, 10e3, 22e3, 'dual', 'rf_open');
    expect(o.vo).toBe(-9);
    expect(o.vMinus).toBe(1);
    expect(solve(-0.2, 10e3, 22e3, 'dual', 'rf_open').vo).toBe(7.5);
    const g = solve(1, 10e3, 22e3, 'dual', 'pin2_gnd');
    expect(g.vo).toBe(0);
    expect(g.vMinus).toBe(0);
    close(g.i1, 100e-6);
    expect(g.iF).toBe(0);
  });

  it('quiz: Q2 (R_s 1k + R1 1k, R_f 10k, V_s 1 V) → −5 V; Q4 single supply → v− ≈ +0.69 V', () => {
    close(-(10e3 / 1e3) * loaded(1, 1e3, 1e3), -5);
    close(-(10e3 / 2e3) * 1, -5);
    expect(solve(1, 10e3, 22e3, 'single').vMinus.toFixed(4)).toBe('0.6875');
  });

  it('breadboard safety: on the 2D ranges (v_i ±5 V, R1 ≥ 1 kΩ, R_f ≥ 10 kΩ) the linear branch current stays ≤ 0.9 mA and every resistor stays under 1/10 of 1/4 W', () => {
    let iLin = 0;
    let pMax = 0;
    for (const vi of [-5, -2.5, -1, 1, 2.5, 5])
      for (const r1 of [1e3, 2e3, 10e3, 100e3])
        for (const rf of [10e3, 22e3, 47e3, 100e3])
          for (const s of ['dual', 'single'] as const) {
            const a = solve(vi, r1, rf, s);
            if (a.state === 'linear') iLin = Math.max(iLin, Math.abs(a.i1));
            pMax = Math.max(pMax, a.pR1, a.pRf);
          }
    expect(iLin).toBeLessThanOrEqual(0.9e-3 + 1e-12);
    expect(pMax).toBeLessThan(P_RATED / 10);
  });

  it('bench supply: ±9 V, v_i = +1 V → the output sinks 100 µA into V−', () => {
    const c = supplyCurrents(solve(1, 10e3, 22e3));
    close(c.ch2 - c.ch1, 100e-6);
    expect(supplyCurrents(solve(1, 10e3, 22e3, 'single')).ch2).toBe(0);
  });
});
