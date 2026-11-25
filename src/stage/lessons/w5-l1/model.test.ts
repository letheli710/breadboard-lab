import { describe, expect, it } from 'vitest';
import {
  EX11,
  EX21,
  EX31,
  EX41,
  EX51,
  GUIDED,
  abs,
  add,
  argDeg,
  compare,
  cx,
  div,
  fmt,
  fmtPolar,
  fmtRect,
  freqOf,
  mul,
  periodOf,
  polar,
  quadrantFix,
  solveEq,
  terms,
  toCos,
  valueAt,
  wrapDeg,
} from './model';

describe('W5-L1 sinusoids and phasors', () => {
  it('example 1.1: 12 cos(50t + 10°): T = π/25 ≈ 0.1257 s = 125.66 ms, f ≈ 7.958 Hz', () => {
    expect(periodOf(EX11.omega)).toBeCloseTo(Math.PI / 25, 12);
    expect(periodOf(EX11.omega)).toBeCloseTo(0.1257, 4);
    expect(periodOf(EX11.omega) * 1e3).toBeCloseTo(125.66, 2);
    expect(freqOf(EX11.omega)).toBeCloseTo(7.958, 3);
    expect(EX11.omega * periodOf(EX11.omega)).toBeCloseTo(2 * Math.PI, 12);
    // the professor's warning: 50t is in radians, 10° in degrees — mixed, v(T) = v(0)
    expect(valueAt(EX11, periodOf(EX11.omega))).toBeCloseTo(valueAt(EX11, 0), 9);
    expect(valueAt(EX11, 0)).toBeCloseTo(12 * Math.cos((10 * Math.PI) / 180), 12);
  });

  it('example 2.1: −10 cos(ωt + 50°) = 10 cos(ωt − 130°), 12 sin(ωt − 10°) = 12 cos(ωt − 100°); v₂ leads v₁ by 30°', () => {
    const v1 = toCos(EX21.f1, EX21.A1, EX21.p1);
    const v2 = toCos(EX21.f2, EX21.A2, EX21.p2);
    expect(v1.phi).toBeCloseTo(-130, 12);
    expect(v2.phi).toBeCloseTo(-100, 12);
    const c = compare(v1.phi, v2.phi);
    expect(c.d).toBeCloseTo(30, 12);
    expect(c.rel).toBe('lead');
    // ② the symbolic result: Δφ = β − α + 90°
    expect(EX21.p2 - EX21.p1 + 90).toBe(30);
    // the trap: +50° vs −10° read off directly gives 60°
    expect(EX21.p1 - EX21.p2).toBe(60);
    // the identities hold numerically
    for (const th of [0, 0.7, 2.1, -1.3]) {
      expect(-10 * Math.cos(th + (50 * Math.PI) / 180)).toBeCloseTo(10 * Math.cos(th - (130 * Math.PI) / 180), 12);
      expect(12 * Math.sin(th - (10 * Math.PI) / 180)).toBeCloseTo(12 * Math.cos(th - (100 * Math.PI) / 180), 12);
    }
  });

  it('the compass: −sin = cos(+90°), +sin = cos(−90°), −cos = cos(±180°), results in (−180°, 180°]', () => {
    for (const th of [-170, -40, 0, 33, 120]) {
      const r = th * (Math.PI / 180);
      expect(-Math.sin(r)).toBeCloseTo(Math.cos(r + Math.PI / 2), 12);
      expect(Math.sin(r)).toBeCloseTo(Math.cos(r - Math.PI / 2), 12);
      expect(-Math.cos(r)).toBeCloseTo(Math.cos(r + Math.PI), 12);
    }
    expect(toCos('-cos', 1, 0).phi).toBe(180);
    expect(wrapDeg(-180)).toBe(180);
    expect(wrapDeg(253.74)).toBeCloseTo(-106.26, 9);
  });

  it('example 3.1: −3 + j4 = 5∠126.87°, −6 − j8 = 10∠−126.87°; Z₁Z₂ = 50∠0°, Z₁/Z₂ = 0.5∠−106.26° = −0.14 − j0.48', () => {
    const q1 = quadrantFix(EX31.z1);
    expect(q1.q).toBe(2);
    expect(q1.raw).toBeCloseTo(-53.13, 2);
    expect(q1.fix).toBe(180);
    expect(q1.phi).toBeCloseTo(126.87, 2);
    expect(abs(EX31.z1)).toBe(5);
    const q2 = quadrantFix(EX31.z2);
    expect(q2.q).toBe(3);
    expect(q2.raw).toBeCloseTo(53.13, 2);
    expect(q2.fix).toBe(-180);
    expect(q2.phi).toBeCloseTo(-126.87, 2);
    expect(abs(EX31.z2)).toBe(10);
    // atan2 agrees with the hand correction
    expect(argDeg(EX31.z1)).toBeCloseTo(q1.phi, 12);
    expect(argDeg(EX31.z2)).toBeCloseTo(q2.phi, 12);
    const p = mul(EX31.z1, EX31.z2);
    expect(abs(p)).toBeCloseTo(50, 12);
    expect(argDeg(p)).toBeCloseTo(0, 12);
    expect(p.re).toBeCloseTo(50, 12);
    const d = div(EX31.z1, EX31.z2);
    expect(abs(d)).toBeCloseTo(0.5, 12);
    expect(q1.phi - q2.phi).toBeCloseTo(253.74, 2);
    expect(argDeg(d)).toBeCloseTo(-106.26, 2);
    expect(d.re).toBeCloseTo(-0.14, 12);
    expect(d.im).toBeCloseTo(-0.48, 12);
    // figure 3.1's other two: 3 ± j4 = 5∠±53.13°
    expect(fmtPolar(cx(3, 4))).toBe('5∠53.13°');
    expect(fmtPolar(cx(3, -4))).toBe('5∠−53.13°');
  });

  it('example 4.1: 4∠30° + 5∠−110° = 1.7540 − j2.6985 = 3.218∠−56.98° A', () => {
    const i1 = toCos(EX41.f1, EX41.A1, EX41.p1);
    const i2 = toCos(EX41.f2, EX41.A2, EX41.p2);
    expect(i2.phi).toBe(-110);
    const I1 = polar(i1.A, i1.phi);
    const I2 = polar(i2.A, i2.phi);
    expect(I1.re).toBeCloseTo(3.4641, 4);
    expect(I1.im).toBeCloseTo(2, 12);
    expect(I2.re).toBeCloseTo(-1.7101, 4);
    expect(I2.im).toBeCloseTo(-4.6985, 4);
    const I = add(I1, I2);
    expect(I.re).toBeCloseTo(1.754, 3);
    expect(I.im).toBeCloseTo(-2.6985, 4);
    expect(I.re ** 2).toBeCloseTo(3.0765, 3);
    expect(I.im ** 2).toBeCloseTo(7.2819, 3);
    expect(abs(I)).toBeCloseTo(3.2184, 3);
    expect(argDeg(I)).toBeCloseTo(-56.98, 2);
    expect(quadrantFix(I).q).toBe(4);
    // the time domain agrees: i₁(t) + i₂(t) = 3.218 cos(ωt − 56.98°) at any ωt
    for (const th of [0, 0.4, 1.9, 4]) {
      const sum = 4 * Math.cos(th + Math.PI / 6) + 5 * Math.sin(th - (20 * Math.PI) / 180);
      expect(sum).toBeCloseTo(abs(I) * Math.cos(th + (argDeg(I) * Math.PI) / 180), 12);
    }
  });

  it('example 5.1 (Sadiku 9.7): D = 4 − j10 = 10.7703∠−68.20°, I = 4.6424∠143.20° A', () => {
    const { D, X } = solveEq(EX51);
    expect(D.re).toBe(4);
    expect(D.im).toBeCloseTo(-10, 12);
    expect(abs(D)).toBeCloseTo(Math.sqrt(116), 12);
    expect(abs(D)).toBeCloseTo(10.7703, 4);
    expect(argDeg(D)).toBeCloseTo(-68.2, 2);
    expect(abs(X)).toBeCloseTo(4.6424, 4);
    expect(argDeg(X)).toBeCloseTo(143.2, 2);
    // the three terms of the solution close onto the source phasor
    const s = add(...terms(EX51, X));
    expect(s.re).toBeCloseTo(polar(50, 75).re, 9);
    expect(s.im).toBeCloseTo(polar(50, 75).im, 9);
    // and in the time domain: 4i + 8∫i − 3 di/dt = 50 cos(2t + 75°) for i = Im cos(2t + θ)
    const Im = abs(X);
    const th = argDeg(X) * (Math.PI / 180);
    for (const t of [0, 0.3, 1.1, 2.6]) {
      const i = Im * Math.cos(2 * t + th);
      const int = (Im / 2) * Math.sin(2 * t + th);
      const di = -2 * Im * Math.sin(2 * t + th);
      expect(4 * i + 8 * int - 3 * di).toBeCloseTo(50 * Math.cos(2 * t + (75 * Math.PI) / 180), 9);
    }
  });

  it('guided example: V_s = 20∠−60°, (6 + j8)V, 10∠53.13°, V = 2∠−113.13° V', () => {
    expect(GUIDED.phis).toBe(-60);
    const { D, X } = solveEq(GUIDED);
    expect(D.re).toBe(6);
    expect(D.im).toBe(8);
    expect(abs(D)).toBe(10);
    expect(argDeg(D)).toBeCloseTo(53.13, 2);
    expect(abs(X)).toBeCloseTo(2, 12);
    expect(argDeg(X)).toBeCloseTo(-113.13, 2);
    // 2 dv/dt + 6v = 20 sin(4t + 30°) holds for v = 2 cos(4t − 113.13°)
    const th = argDeg(X) * (Math.PI / 180);
    for (const t of [0, 0.2, 0.9]) {
      const v = 2 * Math.cos(4 * t + th);
      const dv = -8 * Math.sin(4 * t + th);
      expect(2 * dv + 6 * v).toBeCloseTo(20 * Math.sin(4 * t + Math.PI / 6), 9);
    }
    // the wrong options are what the intercepts say: 6 + j2 (j, not jω), 14 (6 + 8), 36.87° (arctan 6/8),
    // −6.87° (angles added), 0.5 (moduli inverted)
    expect(abs(cx(6, 8))).not.toBe(14);
    expect(Math.atan(6 / 8) / (Math.PI / 180)).toBeCloseTo(36.87, 2);
    expect(-60 + 53.13).toBeCloseTo(-6.87, 9);
    expect(10 / 20).toBe(0.5);
  });

  it('quiz: Q1 v₁ leads v₂ by 50°; Q2 −5 + j5 = 7.071∠135°; Q3 jω·3∠−30° = 30∠60°', () => {
    const v1 = toCos('-sin', 5, 20);
    const v2 = toCos('+cos', 8, 60);
    expect(v1.phi).toBe(110);
    const c = compare(v2.phi, v1.phi);
    expect(c.d).toBe(50);
    expect(c.rel).toBe('lead');
    const z = cx(-5, 5);
    expect(abs(z)).toBeCloseTo(7.071, 3);
    expect(quadrantFix(z).phi).toBeCloseTo(135, 12);
    expect(quadrantFix(z).raw).toBeCloseTo(-45, 12);
    const d = mul(cx(0, 10), polar(3, -30));
    expect(abs(d)).toBeCloseTo(30, 12);
    expect(argDeg(d)).toBeCloseTo(60, 12);
    // the distractor 0.3∠−120° is the integral, 3∠60° forgets ω
    const int = div(polar(3, -30), cx(0, 10));
    expect(abs(int)).toBeCloseTo(0.3, 12);
    expect(argDeg(int)).toBeCloseTo(-120, 12);
  });

  it('fmt: true minus sign, trailing zeros dropped', () => {
    expect(fmt(-2.5)).toBe('−2.5');
    expect(fmt(10, 2, true)).toBe('+10');
    expect(fmt(-1e-9)).toBe('0');
    expect(fmtRect(cx(1.754, -2.6985))).toBe('1.754 − j2.699');
    expect(fmtPolar(polar(4.6424, 143.2))).toBe('4.642∠143.2°');
  });
});
