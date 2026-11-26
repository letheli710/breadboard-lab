import { describe, expect, it } from 'vitest';
import { DRILL_FIX, DRILL_HIGH, EX1, EX2_FIX, EX2_HIGH, cascade2, chainGain, fmt, globalCircuit, globalGain, solveChain, stageGain, type Chain } from './model';

const close = (a: number, b: number, d = 6) => expect(a).toBeCloseTo(b, d);

describe('act 1 · passive divider cascade vs buffered cascade', () => {
  it('loads the first divider: v1 = 4.0 V, vo = 2.0 V, A = 0.20 (−20 %)', () => {
    const p = cascade2(10, 10, 20, false);
    close(p.v1, 4);
    close(p.vo, 2);
    close(p.A, 0.2);
    close(p.errPct, -20);
    close(p.iLoad, 0.2); // i_load = 0.2 mA
    close(p.Rth, 5); // R_th1 = 5 kΩ
    close((10 * 20) / 30, 6.6667, 3); // R_eq = R ∥ 2R = 6.667 kΩ
  });
  it('the ideal follower keeps v1 = 5.0 V, vo = 2.5 V, A = 0.25 and supplies 0.25 mA', () => {
    const b = cascade2(10, 10, 20, true);
    close(b.v1, 5);
    close(b.vo, 2.5);
    close(b.A, 0.25);
    close(b.errPct, 0);
    close(b.iLoad, 0.25);
  });
  it('a heavier load collapses more (slider range 2 … 100 kΩ)', () => {
    expect(cascade2(10, 10, 2, false).A).toBeLessThan(cascade2(10, 10, 100, false).A);
    expect(cascade2(10, 10, 100, false).A).toBeLessThan(0.25);
  });
});

describe('act 3 · two-stage inverting → non-inverting (Example 5.8 型)', () => {
  it('A1 = −5, A2 = +4, A = −20; vo1 = −2 V, vo = −8 V', () => {
    expect(EX1.stages.map(stageGain)).toEqual([-5, 4]);
    expect(chainGain(EX1)).toBe(-20);
    const s = solveChain(EX1, 0.4, 15);
    close(s[0].out, -2);
    close(s[1].out, -8);
    expect(s.some((x) => x.sat)).toBe(false);
  });
  it('io1 = −0.20 mA (own feedback only), if2 = −0.50, iL = −4.00, io2 = −4.50 mA', () => {
    const s = solveChain(EX1, 0.4, 15);
    close(s[0].iF, -0.2);
    close(s[0].iNext, 0);
    close(s[0].iO, -0.2);
    close(s[1].vminus, -2);
    close(s[1].iF, -0.5);
    close(s[1].iNext, -4);
    close(s[1].iO, -4.5);
  });
});

describe('act 4 · three stages with a summer, ±12 V rails', () => {
  it('stage 1 clips at −12 V: vo2 = +8.0 V, vo = −4.0 V (blind: −15, +11, −5.5)', () => {
    const s = solveChain(EX2_HIGH, 1.5, 12);
    close(s[0].lin, -15);
    close(s[0].out, -12);
    expect(s[0].sat).toBe(true);
    close(s[1].out, 8);
    expect(s[1].sat).toBe(false);
    close(s[2].out, -4);
    close(s[0].naive, -15);
    close(s[1].naive, 11);
    close(s[2].naive, -5.5);
    close(((s[2].out - s[2].naive) / s[2].naive) * 100, -27.27, 2); // −27.3 %
    close(Math.abs(s[2].out - s[2].naive), 1.5);
  });
  it('gain staging (Rf1 = 10k, Ra = 5k): −7.5 → +11.0 → −5.5 V, nothing clips; same linear formula', () => {
    const s = solveChain(EX2_FIX, 1.5, 12);
    close(s[0].out, -7.5);
    close(s[1].out, 11);
    close(s[2].out, -5.5);
    expect(s.some((x) => x.sat)).toBe(false);
    // vo = −5 v1 + v2 for both chains (linear region)
    for (const c of [EX2_HIGH, EX2_FIX]) close(solveChain(c, 0.2, 100)[2].out, -5 * 0.2 + 2);
  });
});

describe('act 5 · cross-stage resistor R_G', () => {
  it('pure cascade A = (−2)(+3) = −6; with R_G = 30k the nodal gain is −2', () => {
    const open = globalCircuit(1, false);
    close(open.Anaive, -6);
    close(open.vo, -6);
    const g = globalCircuit(1, true);
    close(g.A2, 3);
    close(g.Atrue, -2);
    close(g.vo, -2);
    close(g.vo1, -2 / 3);
    // KCL at v₋₁ = 0: the three branch currents cancel
    close(g.i1 + g.if1 + g.iG, 0);
  });
  it('R_G → ∞ gives back A1·A2', () => {
    close(globalGain(10, 20, 3, 1e12), -6, 4);
  });
});

describe('act 6 · guided example (three stages, R_L = 2k, ±15 V)', () => {
  it('step 1: A1 = −8, A2 = +4, A3 = −0.25, A = +8', () => {
    expect(DRILL_HIGH.stages.map(stageGain)).toEqual([-8, 4, -0.25]);
    expect(chainGain(DRILL_HIGH)).toBe(8);
  });
  it('steps 2–3 (vi = 0.25 V): −2.0, −8.0, +2.0 V; io2 = −0.80 mA, io3 = +1.40 mA', () => {
    const s = solveChain(DRILL_HIGH, 0.25, 15);
    close(s[0].out, -2);
    close(s[1].out, -8);
    close(s[2].out, 2);
    expect(s.some((x) => x.sat)).toBe(false);
    close(s[1].iF, -0.4);
    close(s[1].iNext, -0.4);
    close(s[1].iO, -0.8);
    close(s[2].iF, 0.4);
    close(s[2].iNext, 1);
    close(s[2].iO, 1.4);
  });
  it('steps 4–5 (vi = 0.50 V): stage 2 asks −16 V, clips at −15 V; vo3 = +3.75 V, not +4.00', () => {
    const s = solveChain(DRILL_HIGH, 0.5, 15);
    close(s[0].out, -4);
    expect(s[0].sat).toBe(false);
    close(s[1].lin, -16);
    close(s[1].out, -15);
    expect(s[1].sat).toBe(true);
    close(s[2].out, 3.75);
    close(s[2].naive, 4);
  });
  it('the fix (Rf1 = 8k, Rf3 = 10k) keeps A = +8 and runs −2, −8, +4 V at 0.50 V', () => {
    expect(chainGain(DRILL_FIX)).toBe(8);
    const s = solveChain(DRILL_FIX, 0.5, 15);
    close(s[0].out, -2);
    close(s[1].out, -8);
    close(s[2].out, 4);
    expect(s.some((x) => x.sat)).toBe(false);
  });
});

describe('quiz', () => {
  it('Q2: (−3)(+1)(−4) = +12, vo = +6.0 V', () => {
    const c: Chain = {
      stages: [
        { kind: 'inv', Rin: 10, Rf: 30 },
        { kind: 'non', Rin: 1e12, Rf: 0 },
        { kind: 'inv', Rin: 5, Rf: 20 },
      ],
    };
    close(chainGain(c), 12);
    const s = solveChain(c, 0.5, 15);
    close(s[0].out, -1.5);
    close(s[1].out, -1.5);
    close(s[2].out, 6);
  });
  it('Q3: +5, −4, +0.2 at ±12 V, vi = 0.8 V → stage 2 clips, vo = −2.4 V (blind −3.2)', () => {
    const g = [5, -4, 0.2];
    let u = 0.8;
    let blind = 0.8;
    const outs: number[] = [];
    for (const a of g) {
      u = Math.max(-12, Math.min(12, a * u));
      blind *= a;
      outs.push(u);
    }
    close(outs[0], 4);
    close(outs[1], -12);
    close(u, -2.4);
    close(blind, -3.2);
  });
  it('Q4: R1 = 10k, Rf1 = 40k, A2 = +2, R_G = 80k → A = −4, vo = −8.0 V, vo1 = −4.0 V', () => {
    const A = globalGain(10, 40, 2, 80);
    close(A, -4);
    close(A * 2, -8);
    close((A * 2) / 2, -4);
    // KCL at v₋₁: 2/10 + vo1/40 + vo/80 = 0
    close(2 / 10 + -4 / 40 + -8 / 80, 0);
  });
});

describe('fmt', () => {
  it('prints readouts with a real minus sign', () => {
    expect(fmt(-2)).toBe('−2');
    expect(fmt(-2, 2, false, true)).toBe('−2.00');
    expect(fmt(1.4, 2, true)).toBe('+1.4');
    expect(fmt(-0.0001)).toBe('0');
  });
});
