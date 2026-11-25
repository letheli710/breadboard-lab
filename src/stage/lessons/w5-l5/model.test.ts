import { describe, expect, it } from 'vitest';
import {
  abs,
  argDeg,
  cx,
  DEG,
  div,
  fmt,
  fmtCx,
  loadPower,
  match,
  mean,
  mul,
  par,
  polar,
  power,
  rmsNumeric,
  rmsOf,
  snap,
  SOURCES,
  THETA_I,
  thevenin,
  waveAt,
  RL_RANGE,
  XL_RANGE,
} from './model';

describe('W5-L5 power and RMS model', () => {
  it('act 1: v = 120cos(377t + 45°), i = 10cos(377t − 15°) → p = 300 + 600cos(754t + 30°), +900 / −300 W', () => {
    const p = power(120, 10, 45, -15);
    expect(p.half).toBe(600);
    expect(p.P).toBeCloseTo(300, 9);
    expect(p.pmax).toBeCloseTo(900, 9);
    expect(p.pmin).toBeCloseTo(-300, 9);
    // p(t) = v·i at every phase, and its period average is P
    for (let w = 0; w < 360; w += 7) expect(p.p(w)).toBeCloseTo(p.v(w) * p.i(w), 9);
    for (let w = 0; w < 360; w += 7) expect(p.p(w)).toBeCloseTo(300 + 600 * Math.cos((2 * w + 30) * DEG), 9);
    expect(mean(p.p, 360)).toBeCloseTo(300, 6);
    // p < 0 for a third of the period (|Δθ|/180°), on ωt ∈ (45°, 105°) and (225°, 285°)
    expect(p.back).toBeCloseTo(1 / 3, 12);
    const neg = Array.from({ length: 3600 }, (_, k) => p.p(k / 10)).filter((x) => x < 0).length / 3600;
    expect(neg).toBeCloseTo(1 / 3, 2);
    expect(p.p(45)).toBeCloseTo(0, 9);
    expect(p.p(105)).toBeCloseTo(0, 9);
    // the stage's default is this example (θ_i = −15°, Δθ = 60°)
    expect(THETA_I + 60).toBe(45);
  });

  it('act 2: V = 100∠30° V on Z = 6 + j8 Ω → I = 10∠−23.13° A, P = 300 W both ways; pure L / C → 0 W', () => {
    const I = div(polar(100, 30), cx(6, 8));
    expect(abs(I)).toBeCloseTo(10, 12);
    expect(argDeg(I)).toBeCloseTo(30 - Math.atan2(8, 6) / DEG, 9);
    expect(argDeg(I)).toBeCloseTo(-23.13, 2);
    expect(0.5 * 100 * 10 * Math.cos(Math.atan2(8, 6))).toBeCloseTo(300, 9);
    expect(0.5 * abs(I) ** 2 * 6).toBeCloseTo(300, 9);
    expect(power(100, 10, 90, 0).P).toBeCloseTo(0, 9);
    expect(power(100, 10, -90, 0).P).toBeCloseTo(0, 9);
    // R: p(t) never below zero
    expect(power(100, 10, 0, 0).pmin).toBeCloseTo(0, 12);
  });

  it('act 3: sine RMS = V_m/√2; mains 120 V → 169.71 V, 220 V → 311.13 V; act 1 again via RMS: 300 W', () => {
    expect(rmsNumeric((x) => waveAt('sine', 1, 0, x))).toBeCloseTo(1 / Math.SQRT2, 6);
    expect(120 * Math.SQRT2).toBeCloseTo(169.71, 2);
    expect(220 * Math.SQRT2).toBeCloseTo(311.13, 2);
    expect(rmsOf('sine', 170, 0)).toBeCloseTo(120.2, 1);
    expect(rmsOf('sine', 311, 0)).toBeCloseTo(219.9, 1);
    expect(120 / Math.SQRT2).toBeCloseTo(84.85, 2);
    expect(10 / Math.SQRT2).toBeCloseTo(7.07, 2);
    expect((120 / Math.SQRT2) * (10 / Math.SQRT2) * Math.cos(60 * DEG)).toBeCloseTo(300, 9);
    // a 250 V capacitor on the 220 V mains sees its 311 V peak
    expect(220 * Math.SQRT2).toBeGreaterThan(250);
  });

  it('act 4: square V_p, triangle V_p/√3, DC + AC √(V_dc² + V_1,rms²): 12 + 5√2 cos → 13 V (not 17), 13 W in 13 Ω', () => {
    for (const w of ['sine', 'square', 'triangle'] as const) expect(rmsNumeric((x) => waveAt(w, 7, 0, x))).toBeCloseTo(rmsOf(w, 7, 0), 3);
    expect(rmsOf('square', 1, 0)).toBe(1);
    expect(rmsOf('triangle', 1, 0)).toBeCloseTo(0.5774, 4);
    expect(rmsOf('dcac', 12, 5)).toBeCloseTo(13, 12);
    expect(rmsNumeric((x) => waveAt('dcac', 12, 5, x))).toBeCloseTo(13, 5);
    expect(waveAt('dcac', 12, 5, 0)).toBeCloseTo(12 + 5 * Math.SQRT2, 12);
    expect(13 ** 2 / 13).toBe(13);
    // the sheet's figure: same peak, the square heats 2× the sine and 3× the triangle
    expect(rmsOf('square', 1, 0) ** 2 / rmsOf('sine', 1, 0) ** 2).toBeCloseTo(2, 12);
    expect(rmsOf('square', 1, 0) ** 2 / rmsOf('triangle', 1, 0) ** 2).toBeCloseTo(3, 12);
    // the triangle integral: (4/T)∫₀^{T/4} (4V_p t/T)² dt = V_p²/3 (T = 1, V_p = 1)
    expect(4 * (0.25 * mean((t) => (4 * t) ** 2, 0.25))).toBeCloseTo(1 / 3, 9);
  });

  it('act 5: V_Th = 16∠0° V (peak), Z_Th = 4 + j3 Ω → Z_L = 4 − j3 Ω, P_max = 256/32 = 128/16 = 8 W', () => {
    const s = SOURCES.a5;
    const m = match(s);
    expect(fmtCx(m.zl)).toBe('4 − j3');
    expect(m.pmax8).toBeCloseTo(8, 12);
    expect(m.vrms).toBeCloseTo(8 * Math.SQRT2, 12);
    expect(m.pmax4).toBeCloseTo(8, 12);
    expect(loadPower(s, 4, -3)).toBeCloseTo(8, 12);
    // the maximum over the whole slider plane is at the match
    let best = { p: 0, r: 0, x: 0 };
    for (let r = RL_RANGE.min; r <= RL_RANGE.max; r += RL_RANGE.step)
      for (let x = XL_RANGE.min; x <= XL_RANGE.max + 1e-9; x += XL_RANGE.step) {
        const p = loadPower(s, r, x);
        if (p > best.p) best = { p, r, x };
      }
    expect(best.r).toBeCloseTo(4, 6);
    expect(best.x).toBeCloseTo(-3, 6);
    // the partial derivatives of the sheet: ∂P/∂X_L ∝ −(X_Th + X_L), ∂P/∂R_L at X_L = −X_Th ∝ (R_Th − R_L)
    const h = 1e-6;
    expect((loadPower(s, 2, -3 + h) - loadPower(s, 2, -3 - h)) / (2 * h)).toBeCloseTo(0, 6);
    const dR = (r: number) => (loadPower(s, r + h, -3) - loadPower(s, r - h, -3)) / (2 * h);
    expect(dR(4)).toBeCloseTo(0, 6);
    expect(dR(2)).toBeCloseTo((16 ** 2 * (4 - 2)) / (2 * (4 + 2) ** 3), 5);
    // the normalised curve of the figure: P/P_max = 4r/(1 + r)² with the reactance cancelled
    expect(loadPower(s, 2, -3) / 8).toBeCloseTo((4 * 0.5) / 1.5 ** 2, 12);
    // its red curve (X_L = 0) is drawn for X_Th = R_Th: at r = 3.5, 4r/((1 + r)² + 1) = 0.659
    expect((4 * 3.5) / (4.5 ** 2 + 1)).toBeCloseTo((275 - 156.4) / 180, 2);
  });

  it('act 6: Z1 = 4 + j2, Z2 = −j4, V_s = 20∠0° → Z_Th = 3.2 − j2.4 Ω, V_Th = 8 − j16 = 8√5∠−63.43° V, 12.5 W both ways', () => {
    const s = SOURCES.a6;
    expect(s.zth.re).toBeCloseTo(3.2, 12);
    expect(s.zth.im).toBeCloseTo(-2.4, 12);
    expect(mul(cx(4, 2), cx(0, -4))).toEqual({ re: 8, im: -16 });
    expect(mul(cx(8, -16), cx(4, 2))).toEqual({ re: 64, im: -48 });
    expect(s.vth.re).toBeCloseTo(8, 12);
    expect(s.vth.im).toBeCloseTo(-16, 12);
    expect(abs(s.vth)).toBeCloseTo(8 * Math.sqrt(5), 12);
    expect(abs(s.vth)).toBeCloseTo(17.89, 2);
    expect(argDeg(s.vth)).toBeCloseTo(-63.43, 2);
    const m = match(s);
    expect(fmtCx(m.zl)).toBe('3.2 + j2.4');
    expect(m.pmax8).toBeCloseTo(320 / 25.6, 12);
    expect(m.pmax8).toBeCloseTo(12.5, 12);
    expect(m.vrms).toBeCloseTo(4 * Math.sqrt(10), 12);
    expect(m.vrms ** 2).toBeCloseTo(160, 9);
    expect(m.pmax4).toBeCloseTo(12.5, 12);
    // the layer-03 default load is this match (on the slider tracks)
    expect(snap(3.2, RL_RANGE.step, RL_RANGE.min)).toBe(3.2);
    expect(snap(2.4, XL_RANGE.step, XL_RANGE.min)).toBe(2.4);
    expect(loadPower(s, 3.2, 2.4)).toBeCloseTo(12.5, 12);
  });

  it('guided example: 10 Ω ∥ −j10 Ω + j8 Ω = 5 + j3 Ω; V_Th = 10 − j10 = 10√2∠−45° V; Z_L = 5 − j3 Ω; 10 V RMS; 5 W', () => {
    expect(par(cx(10), cx(0, -10))).toEqual({ re: 5, im: -5 });
    const s = SOURCES.gd;
    expect(s.zth.re).toBeCloseTo(5, 12);
    expect(s.zth.im).toBeCloseTo(3, 12);
    expect(s.vth.re).toBeCloseTo(10, 12);
    expect(s.vth.im).toBeCloseTo(-10, 12);
    expect(abs(s.vth)).toBeCloseTo(10 * Math.SQRT2, 12);
    expect(argDeg(s.vth)).toBeCloseTo(-45, 12);
    const m = match(s);
    expect(fmtCx(m.zl)).toBe('5 − j3');
    expect(m.vrms).toBeCloseTo(10, 12);
    expect(m.pmax8).toBeCloseTo(200 / 40, 12);
    expect(m.pmax4).toBeCloseTo(100 / 20, 12);
    expect(loadPower(s, 5, -3)).toBeCloseTo(5, 12);
    // the wrong options are what their intercepts say
    expect(5 + 8).toBe(13); // step 1 (c): +j5 instead of −j5, plus j8
    const wrong2 = div(mul(cx(20), cx(0, -2)), cx(10, -2)); // step 2 (a): +j8 taken into the divider
    expect(fmtCx(wrong2)).toBe('0.77 − j3.85');
    expect(thevenin(cx(20), cx(10), cx(0, -10), cx(0, 8)).vth).toEqual(s.vth); // the +j8 carries no current
    expect(10 * Math.SQRT2 * Math.SQRT2).toBeCloseTo(20, 12); // step 4 (a): × √2
    expect(abs(s.vth) ** 2 / (4 * 5)).toBeCloseTo(10, 12); // step 5 (a): the peak into /4
    expect(10 ** 2 / (8 * 5)).toBe(2.5); // step 5 (b): the RMS into /8
    // Z_L = Z_Th doubles the reactance (step 3, b)
    expect(s.zth.im + 3).toBeCloseTo(6, 12);
  });

  it('quiz', () => {
    // Q1: 200 + 400cos(754t) W, minimum −200 W
    const q1 = power(100, 8, 30, -30);
    expect(q1.P).toBeCloseTo(200, 9);
    expect(q1.half).toBe(400);
    expect(q1.pmin).toBeCloseTo(-200, 9);
    expect(2 * 377).toBe(754);
    // Q2: pure L → 0 W; the distractors are Q = V²/X_L and half of it
    const XL = 2 * Math.PI * 50 * 0.05;
    expect(XL).toBeCloseTo(15.71, 2);
    expect(220 ** 2 / XL / 1000).toBeCloseTo(3.08, 2);
    expect(220 ** 2 / XL / 2000).toBeCloseTo(1.54, 2);
    // Q3: √(6² + 8²) = 10 V; distractors 14, 6 + 8√2 ≈ 17.31, 10/√2 ≈ 7.07
    expect(rmsOf('dcac', 6, 8)).toBeCloseTo(10, 12);
    expect(rmsNumeric((x) => waveAt('dcac', 6, 8, x))).toBeCloseTo(10, 5);
    expect(6 + 8 * Math.SQRT2).toBeCloseTo(17.31, 2);
    expect(10 / Math.SQRT2).toBeCloseTo(7.07, 2);
    // Q4: RMS phasor 12∠0°, Z_Th = 3 − j4 → Z_L = 3 + j4, P_max = 144/12 = 12 W; /8 by mistake: 6 W
    const zth = cx(3, -4);
    expect(fmtCx(match({ vth: cx(12 * Math.SQRT2), zth }).zl)).toBe('3 + j4');
    expect(12 ** 2 / (4 * 3)).toBe(12);
    expect(12 ** 2 / (8 * 3)).toBe(6);
    // (as a peak phasor 12√2 the same source gives the same 12 W)
    expect(match({ vth: cx(12 * Math.SQRT2), zth }).pmax8).toBeCloseTo(12, 9);
    // D: a 5 Ω resistor (= |Z_Th|) gets 144·5/(8² + 4²) = 9 W < 12 W; A: Z_L = Z_Th gets 4.32 W
    expect(abs(zth)).toBe(5);
    expect((12 ** 2 * 5) / (8 ** 2 + 4 ** 2)).toBe(9);
    expect((12 ** 2 * 3) / (6 ** 2 + 8 ** 2)).toBeCloseTo(4.32, 12);
  });

  it('formatting', () => {
    expect(fmt(-0.0001)).toBe('0');
    expect(fmt(-2.4)).toBe('−2.4');
    expect(fmt(900, 0)).toBe('900');
    expect(fmt(300.0, 1)).toBe('300');
    expect(fmtCx(cx(3.2, -2.4))).toBe('3.2 − j2.4');
    expect(fmtCx(cx(5, 0))).toBe('5');
  });
});
