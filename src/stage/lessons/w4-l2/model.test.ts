import { describe, expect, it } from 'vitest';
import {
  bandKeys,
  dcSolve,
  energy,
  EX11,
  EX21,
  EX22,
  ex22I,
  EX51,
  flybackI,
  flybackTime,
  iAt,
  KICK,
  kickVolts,
  net4,
  par,
  Q1,
  Q2,
  Q4,
  R_COIL,
  segmentVolts,
  solenoidL,
  vAt,
  voltArea,
} from './model';

describe('W4-L2 model: the sheet numbers', () => {
  it('Example 1.1: the solenoid, air and ferrite', () => {
    expect(Math.PI * EX11.r ** 2).toBeCloseTo(7.854e-5, 8);
    const air = solenoidL(EX11.N, EX11.r, EX11.len, 1);
    expect(air).toBeCloseTo(1e-5 * Math.PI ** 2, 12);
    expect(air * 1e6).toBeCloseTo(98.7, 1);
    const fe = solenoidL(EX11.N, EX11.r, EX11.len, EX11.murFerrite);
    expect(fe * 1e6).toBeCloseTo(19739.2, 1);
    expect(fe * 1e3).toBeCloseTo(19.74, 2);
    // L ∝ N²
    expect(solenoidL(2 * EX11.N, EX11.r, EX11.len, 1) / air).toBeCloseTo(4, 10);
  });

  it('Example 2.1: piecewise current → +200 mV, 0, −400 mV, zero net area', () => {
    const [v1, v2, v3] = segmentVolts(EX21);
    expect(v1).toBeCloseTo(0.2, 10);
    expect(v2).toBe(0);
    expect(v3).toBeCloseTo(-0.4, 10);
    expect(vAt(EX21, 1e-3)).toBeCloseTo(0.2, 10);
    expect(vAt(EX21, 3e-3)).toBe(0);
    expect(vAt(EX21, 5.5e-3)).toBeCloseTo(-0.4, 10);
    expect(iAt(EX21, 2e-3)).toBeCloseTo(0.04, 10);
    expect(iAt(EX21, 6e-3)).toBe(0);
    expect(voltArea(EX21)).toBeCloseTo(0, 12);
    // slopes in the figure: +20 A/s and −40 A/s
    expect(EX21.ipk / EX21.t1).toBeCloseTo(20, 10);
    expect(EX21.ipk / (EX21.t3 - EX21.t2)).toBeCloseTo(40, 10);
  });

  it('Example 2.2: integral of 6e^(−500t) through 20 mH', () => {
    expect(EX22.V0 / (EX22.alpha * EX22.L)).toBeCloseTo(0.6, 12);
    expect(ex22I(0)).toBeCloseTo(0.1, 12);
    expect(ex22I(2e-3)).toBeCloseTo(0.4793, 4);
    expect(ex22I(1)).toBeCloseTo(0.7, 10);
    expect(energy(EX22.L, 0.7) * 1e3).toBeCloseTo(4.9, 10);
  });

  it('act 3: 8 µJ plateau energy, −2000 V kickback, flyback decay', () => {
    expect(energy(10e-3, 40e-3)).toBeCloseTo(8e-6, 15);
    expect(kickVolts(KICK.L, KICK.I0, KICK.dt)).toBeCloseTo(-2000, 6);
    expect(R_COIL).toBeCloseTo(60, 10);
    expect(flybackI(0)).toBeCloseTo(0.2, 12);
    const t0 = flybackTime();
    expect(t0 * 1e3).toBeCloseTo(0.483, 3);
    expect(flybackI(t0)).toBeCloseTo(0, 9);
    expect(energy(KICK.L, KICK.I0) * 1e3).toBeCloseTo(0.2, 12);
  });

  it('act 4: L1 + L2 ∥ (L3 + L4) = 8 mH', () => {
    const n = net4();
    expect(n.L34).toBe(12);
    expect(n.L234).toBeCloseTo(4, 12);
    expect(n.Leq).toBeCloseTo(8, 12);
  });

  it('Example 5.1: DC steady state, energies and the breadboard check', () => {
    const s = dcSolve(EX51);
    expect(s.r23).toBeCloseTo(100, 10);
    expect(s.vA).toBeCloseTo(4.5, 10);
    expect(s.vC).toBeCloseTo(4.5, 10);
    expect(s.is).toBeCloseTo(0.045, 12);
    expect(s.iL).toBeCloseTo(0.03, 12);
    expect(s.iR2).toBeCloseTo(0.015, 12);
    expect(s.iR2 + s.iL).toBeCloseTo(s.is, 12);
    expect(s.wL * 1e6).toBeCloseTo(9, 10);
    expect(s.wC * 1e6).toBeCloseTo(101.25, 10);
    expect(s.wTotal * 1e6).toBeCloseTo(110.25, 10);
    expect(s.pR1).toBeCloseTo(0.2025, 12);
    expect(s.pR2).toBeCloseTo(0.0675, 12);
    expect(s.pR3).toBeCloseTo(0.135, 12);
    expect(s.pR1).toBeLessThan(0.25);
    // energy bar of figure 6.1: 440 px split 36 / 404
    expect((s.wL / s.wTotal) * 440).toBeCloseTo(35.9, 1);
    expect(((s.wC / s.wTotal) * 100).toFixed(1)).toBe('91.8');
  });

  it('guided distractors are what the intercepts say they are', () => {
    // step 3: R23 = 50 Ω → 3 V; R23 = 200 Ω → 6 V
    expect((9 * 50) / 150).toBeCloseTo(3, 12);
    expect((9 * 200) / 300).toBeCloseTo(6, 12);
    // step 4: 9 V / 150 Ω = 60 mA
    expect(9 / 150).toBeCloseTo(0.06, 12);
    // step 5: without ½, 90 µJ (unit slip), C without squaring 22.5 µJ
    expect(2 * 9 + 2 * 101.25).toBeCloseTo(220.5, 12);
    expect(0.5 * 10e-6 * 4.5 * 1e6).toBeCloseTo(22.5, 12);
  });

  it('colour bands of the breadboard parts', () => {
    expect(bandKeys(100)).toEqual(['brown', 'black', 'brown', 'gold']);
    expect(bandKeys(300)).toEqual(['orange', 'black', 'brown', 'gold']);
    expect(bandKeys(150)).toEqual(['brown', 'green', 'brown', 'gold']);
    expect(bandKeys(200)).toEqual(['red', 'black', 'brown', 'gold']);
    // colour-ring inductors read in µH: 20 mH = 20 × 10³ µH, 10 mH = 10 × 10³ µH
    expect(bandKeys(20_000)).toEqual(['red', 'black', 'orange', 'gold']);
    expect(bandKeys(10_000)).toEqual(['brown', 'black', 'orange', 'gold']);
  });

  it('quiz', () => {
    expect(Q1.L0 * Q1.nFactor ** 2 * 1e6).toBeCloseTo(400, 10);
    const slope = Q2.i1 / Q2.dt;
    expect(slope).toBeCloseTo(40, 10);
    expect(Q2.L * slope).toBeCloseTo(2, 10);
    expect(energy(Q2.L, Q2.i1) * 1e3).toBeCloseTo(1, 10);
    expect(par(Q4.L1, Q4.L2) + Q4.L3).toBeCloseTo(6, 12);
  });
});
