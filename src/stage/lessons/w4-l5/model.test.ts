import { describe, expect, it } from 'vitest';
import { ex75, ex75Scope, ex76, EX75, fgVa, fgVc, KIT, KIT_PEAK_P, KIT_TAU, kitScope, MILESTONES, pulse, RATING_W, rcStep, SCALE, squareLevels, threeElement } from './model';

describe('W4-L5 first-order step response', () => {
  it('act 1: v_s(t) = 5[u(t) − u(t − 5)] V', () => {
    expect(pulse(-1)).toBe(0);
    expect(pulse(0.5)).toBe(5);
    expect(pulse(4.9)).toBe(5);
    expect(pulse(5.1)).toBe(0);
  });

  it('act 2: the kit — τ = 10 kΩ × 100 µF = 1.0 s, i_C(0⁺) = 0.5 mA, 2.5 mW peak', () => {
    expect(KIT_TAU).toBeCloseTo(1, 12);
    expect(rcStep(KIT.vs, KIT.r, KIT.c, 0, 0).ic).toBeCloseTo(0.5e-3, 12);
    expect(KIT_PEAK_P).toBeCloseTo(2.5e-3, 12);
    expect(KIT_PEAK_P / RATING_W).toBeCloseTo(0.01, 12);
    // the ODE RC dv/dt + v = V_s holds along the solution
    const h = 1e-6;
    for (const t of [0.1, 0.7, 2.3]) {
      const v = (s: number) => rcStep(KIT.vs, KIT.r, KIT.c, 1.2, s).vc;
      const dv = (v(t + h) - v(t - h)) / (2 * h);
      expect(KIT.r * KIT.c * dv + v(t)).toBeCloseTo(KIT.vs, 6);
    }
    // ZIR + ZSR = forced + natural
    const v0 = 1.2;
    for (const t of [0, 0.5, 3]) {
      const full = rcStep(KIT.vs, KIT.r, KIT.c, v0, t).vc;
      expect(full).toBeCloseTo(v0 * Math.exp(-t) + KIT.vs * (1 - Math.exp(-t)), 12);
      expect(full).toBeCloseTo(KIT.vs + (v0 - KIT.vs) * Math.exp(-t), 12);
    }
  });

  it('act 2 table: the five Boylestad milestones (to the digits printed)', () => {
    const want = [
      [0, 0.0, 0.0, 0.5],
      [1, 63.21, 3.161, 0.184],
      [2, 86.47, 4.323, 0.068],
      [3, 95.02, 4.751, 0.025],
      [4, 98.17, 4.908, 0.009],
      [5, 99.33, 4.966, 0.003],
    ];
    for (const [n, pct, vc, ma] of want) {
      const m = MILESTONES[n];
      expect(Number(m.pct.toFixed(2))).toBe(pct);
      expect(Number(m.vc.toFixed(3))).toBe(vc);
      expect(Number((m.ic * 1e3).toFixed(3))).toBe(ma);
    }
  });

  it('act 3 / guided: Sadiku 7.5 — 12 V, 4 Ω, 24 V, τ = 1 s, i_3 2 A → 4 A → 2 A, i_C = 3e^(−t)', () => {
    const e = ex75();
    expect(e.vc0).toBe(12);
    expect(e.i30m).toBe(2);
    expect(e.rth).toBe(4);
    expect(e.vth).toBe(24);
    expect(e.tau).toBe(1);
    expect(e.i30p).toBe(4);
    expect(e.i3Inf).toBe(2);
    expect(e.ic0p).toBeCloseTo(3, 12);
    for (const t of [0, 0.4, 1, 3]) {
      expect(e.vc(t)).toBeCloseTo(24 - 12 * Math.exp(-t), 12);
      expect(e.i3(t)).toBeCloseTo(2 + 2 * Math.exp(-t), 12);
      expect(e.i3(t)).toBeCloseTo((EX75.v2 - e.vc(t)) / EX75.r3, 12); // the Ohm's-law cross-check of step 5
      expect(e.i4(t)).toBeCloseTo(2 - Math.exp(-t), 12);
      expect(e.ic(t)).toBeCloseTo(3 * Math.exp(-t), 12);
      // i_C = C dv_C/dt
      const h = 1e-6;
      expect(EX75.c * ((e.vc(t + h) - e.vc(t - h)) / (2 * h))).toBeCloseTo(e.ic(t), 6);
    }
    // the trap: i_3(0⁻) used as i_3(0⁺) gives a constant
    expect(threeElement(e.i30m, e.i3Inf, e.tau, 0.5)).toBe(2);
    // wrong options of the guided steps
    expect(EX75.r3 + EX75.r4).toBe(18); // series mistake
    expect(EX75.r3 * EX75.c).toBe(1.5); // "R_3 C" mistake of step 5
    expect(e.rth / EX75.c).toBe(16); // τ = R/C mistake of step 2
  });

  it('scaled 7.5 (×1000 R, ÷1000 C): τ stays 1 s, the largest current is 4 mA, R_3 peaks at 96 mW', () => {
    const k = ex75(SCALE);
    expect(k.tau).toBeCloseTo(1, 12);
    expect(k.rth).toBeCloseTo(4e3, 9);
    expect(EX75.c / SCALE).toBeCloseTo(250e-6, 15);
    expect(k.i30p).toBeCloseTo(4e-3, 12);
    expect(k.i30p * k.i30p * EX75.r3 * SCALE).toBeCloseTo(0.096, 12);
    expect(k.i30p * k.i30p * EX75.r3 * SCALE).toBeLessThan(RATING_W);
    // the theory circuit: 4 A through 6 Ω ≈ 96 W ("近百瓦")
    const e = ex75();
    expect(e.i30p * e.i30p * EX75.r3).toBe(96);
    // the scope: MATH = V_2 − v_B jumps 12 V → 24 V at t = 0 and decays back to 12 V
    const s = ex75Scope('B');
    const math = s.traces.find((t) => t.ch === 'math')!;
    expect(math.v(-0.1)).toBeCloseTo(12, 12);
    expect(math.v(0)).toBeCloseTo(24, 12);
    expect(math.v(20)).toBeCloseTo(12, 6);
  });

  it('act 4: Sadiku 7.6 — 6 A, 4 Ω, 0.5 s, 3 A, v_L(0⁺) = −12 V, i_R3 = −1.5 A, 4.5 + 1.5 = 6 A', () => {
    const e = ex76();
    expect(e.il0).toBe(6);
    expect(e.rth).toBe(4);
    expect(e.vth).toBe(12);
    expect(e.tau).toBe(0.5);
    expect(e.ilInf).toBe(3);
    expect(e.vl0p).toBe(-12);
    expect(e.ir3(0)).toBe(-1.5);
    expect(e.isup(0)).toBe(4.5);
    expect(e.isup(0) - e.ir3(0)).toBe(6); // KCL: 4.5 + 1.5 = 6 A into the inductor
    for (const t of [0, 0.2, 1]) {
      expect(e.il(t)).toBeCloseTo(3 + 3 * Math.exp(-2 * t), 12);
      const h = 1e-6;
      expect(2 * ((e.il(t + h) - e.il(t - h)) / (2 * h))).toBeCloseTo(e.vl(t), 5); // v_L = L di/dt
      expect(e.isup(t) - e.ir3(t)).toBeCloseTo(e.il(t), 12); // KCL at the top node
    }
  });

  it('scope: safe probes show v_A, v_C and v_R = CH1 − CH2; the hazard clip shows a flat line', () => {
    const s = kitScope('dc', 'charge', 'safe');
    const [ch1, ch2, math] = s.traces;
    expect(s.tdiv * 10).toBe(5); // 500 ms/div: 5 s = 5τ on one screen
    expect(ch2.v(1)).toBeCloseTo(3.161, 3);
    expect(ch1.v(1) - ch2.v(1)).toBeCloseTo(math.v(1), 12);
    expect(math.v(0)).toBeCloseTo(5, 12);
    const d = kitScope('dc', 'discharge', 'safe');
    expect(d.traces[1].v(1)).toBeCloseTo(5 * Math.exp(-1), 12);
    const h = kitScope('dc', 'charge', 'hazard');
    expect(h.traces).toHaveLength(1);
    expect(h.traces[0].v(0.3)).toBe(5);
    expect(h.traces[0].v(4)).toBe(5);
  });

  it('generator: 0–5 V, 0.1 Hz square wave, 5τ per half period — v_C swings 0.033 … 4.967 V', () => {
    const { hi, lo } = squareLevels(5, 5, 1);
    expect(hi).toBeCloseTo(5 / (1 + Math.exp(-5)), 12);
    expect(lo).toBeCloseTo(hi * Math.exp(-5), 12);
    expect(fgVc(5)).toBeCloseTo(hi, 9);
    expect(fgVc(10)).toBeCloseTo(lo, 9);
    expect(fgVc(0)).toBeCloseTo(lo, 9);
    expect(fgVa(2)).toBe(5);
    expect(fgVa(7)).toBe(0);
  });
});
