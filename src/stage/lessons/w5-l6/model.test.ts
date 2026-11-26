import { describe, expect, it } from 'vitest';
import { BUS_V, SCENARIOS, capFor, currentDrop, fmt, fmtPow, kindOf, lossDrop, pfc, qcFor, qcOf, sumLoads, triangle, withoutConjugate } from './model';

const deg = (r: number) => (r * 180) / Math.PI;
const tan = (pf: number) => Math.tan(Math.acos(pf));

describe('W5-L6 power triangle (acts 1–2, layer 01)', () => {
  it('act 1 opening: 4 kW at pf 0.8 is 5 kVA, 41.67 A at 120 V', () => {
    expect(4000 / 0.8).toBeCloseTo(5000, 9);
    expect(5000 / 120).toBeCloseTo(41.67, 2);
  });

  it('act 2.3: Z = 12 + j16 Ω on 120∠0° V → 6∠−53.13° A, S = 720∠53.13° = 432 + j576 VA, pf 0.60 lagging', () => {
    const z = Math.hypot(12, 16);
    const th = deg(Math.atan2(16, 12));
    expect(z).toBe(20);
    expect(th).toBeCloseTo(53.13, 2);
    const I = 120 / z;
    expect(I).toBe(6);
    const t = triangle(th, 120, I);
    expect(t.S).toBe(720);
    expect(t.P).toBeCloseTo(432, 9);
    expect(t.Q).toBeCloseTo(576, 9);
    expect(I * I * 12).toBe(432);
    expect(I * I * 16).toBe(576);
    expect(t.pf).toBeCloseTo(0.6, 12);
    expect(t.kind).toBe('lag');
    // S = V²/Z*: 14400 / (12 − j16) = 14400 (12 + j16) / 400
    expect((14400 * 12) / 400).toBe(432);
    expect((14400 * 16) / 400).toBe(576);
  });

  it('the conjugate trap: V·I with θ_v = 0 flips the sign of Q (lagging load comes out leading)', () => {
    const w = withoutConjugate(53.13, 120, 6);
    const t = triangle(53.13, 120, 6);
    expect(w.P).toBeCloseTo(t.P, 9);
    expect(w.Q).toBeCloseTo(-t.Q, 9);
    expect(triangle(-37, 120, 6).kind).toBe('lead');
    expect(triangle(0, 120, 6).kind).toBe('unity');
  });

  it('quiz Q1: (100∠20°)(5∠−10°)* = 500∠30° = 433.01 + j250 VA (lagging); without * 500∠10°', () => {
    const th = 20 - -10;
    expect(th).toBe(30);
    expect(500 * Math.cos((30 * Math.PI) / 180)).toBeCloseTo(433.01, 2);
    expect(500 * Math.sin((30 * Math.PI) / 180)).toBeCloseTo(250, 9);
    expect(20 + -10).toBe(10);
    expect(kindOf(250)).toBe('lag');
  });
});

describe('W5-L6 complex-power sum (act 3, layer 02)', () => {
  it('act 3.3: 10 kVA@0.8 lag + 6 kW + 5 kVA@0.6 lead = 17 + j2 kVA, 17.12 kVA, pf 0.9932 lag, 77.81 A at 220 V; Σ|S| = 21', () => {
    const r = sumLoads(10, 6, 5);
    expect(r.loads[0].P).toBeCloseTo(8, 12);
    expect(r.loads[0].Q).toBeCloseTo(6, 12);
    expect(r.loads[2].P).toBeCloseTo(3, 12);
    expect(r.loads[2].Q).toBeCloseTo(-4, 12);
    expect(r.P).toBeCloseTo(17, 12);
    expect(r.Q).toBeCloseTo(2, 12);
    expect(r.S).toBeCloseTo(Math.sqrt(293), 12);
    expect(r.S).toBeCloseTo(17.12, 2);
    expect(r.S * 1000).toBeCloseTo(17117.24, 2);
    expect(r.pf).toBeCloseTo(0.9932, 4);
    expect(r.kind).toBe('lag');
    expect(BUS_V).toBe(220);
    expect(r.I).toBeCloseTo(77.81, 2);
    expect(r.scalar).toBe(21);
  });

  it('act 3.1: 10 kVA lagging + 5 kVA leading is far below 15 kVA; S_total ≤ Σ S_k', () => {
    const r = sumLoads(10, 0, 5);
    expect(r.S).toBeCloseTo(Math.hypot(11, 2), 12);
    expect(r.S).toBeLessThan(15);
    for (const [a, b, c] of [
      [20, 15, 15],
      [3, 0, 12],
      [0, 7, 0],
    ])
      expect(sumLoads(a, b, c).S).toBeLessThanOrEqual(sumLoads(a, b, c).scalar + 1e-12);
  });

  it('quiz Q2: 8 kVA@0.8 lag + 5 kVA@0.6 lead = 9.4 + j0.8 → 9.434 kVA lagging; the distractors', () => {
    const P = 8 * 0.8 + 5 * 0.6;
    const Q = 8 * 0.6 - 5 * 0.8;
    expect(P).toBeCloseTo(9.4, 12);
    expect(Q).toBeCloseTo(0.8, 12);
    expect(Math.hypot(P, Q)).toBeCloseTo(9.434, 3);
    expect(Math.hypot(9.4, 8.8)).toBeCloseTo(12.88, 2); // option C: Q_B with the wrong sign
    expect(8 - 5).toBe(3); // option B
    // the sheet's option B (√(8² + 5²)) is exactly right here: the two S vectors are 90° apart
    expect(Math.hypot(8, 5)).toBeCloseTo(Math.hypot(P, Q), 12);
    expect(deg(Math.acos(0.8)) + deg(Math.acos(0.6))).toBeCloseTo(90, 12);
  });
});

describe('W5-L6 power-factor correction (act 4, guided example, layer 03)', () => {
  it('act 4.1: 0.70 → 0.95 cuts the current 26.3 % and the loss 45.7 %; 0.80 → 0.95: 15.8 %, 29.1 %', () => {
    expect(100 * currentDrop(0.7, 0.95)).toBeCloseTo(26.3, 1);
    expect(100 * lossDrop(0.7, 0.95)).toBeCloseTo(45.7, 1);
    expect(100 * currentDrop(0.8, 0.95)).toBeCloseTo(15.8, 1);
    expect(100 * lossDrop(0.8, 0.95)).toBeCloseTo(29.1, 1);
  });

  it('act 4.1 aside: 0.95 → 1.00 needs 78 % more capacitor at pf1 = 0.80 (the sheet said 45 %), for a 5 % current drop', () => {
    const a = qcFor(1, 0.8, 0.95);
    const b = qcFor(1, 0.8, 1);
    expect(a).toBeCloseTo(0.421, 3);
    expect(b).toBeCloseTo(0.75, 12);
    expect(100 * (b / a - 1)).toBeCloseTo(78, 0);
    expect(100 * currentDrop(0.95, 1)).toBeCloseTo(5, 9);
  });

  it('act 4.3 (Sadiku): 4 kW, 120 V, 60 Hz, 0.8 → 0.95 lagging: Q_C = 1685.26 VAR, C = 310.44 µF, 41.67 → 35.09 A', () => {
    const sc = SCENARIOS.sadiku;
    expect(deg(Math.acos(0.8))).toBeCloseTo(36.87, 2);
    expect(tan(0.8)).toBeCloseTo(0.75, 12);
    expect(deg(Math.acos(0.95))).toBeCloseTo(18.19, 2);
    expect(tan(0.95)).toBeCloseTo(0.328684, 6);
    expect(4000 * tan(0.95)).toBeCloseTo(1314.74, 2);
    expect(qcFor(4000, 0.8, 0.95)).toBeCloseTo(1685.26, 2);
    expect(2 * Math.PI * 60).toBeCloseTo(376.99, 2);
    expect((2 * Math.PI * 60 * 120 ** 2) / 1e6).toBeCloseTo(5.4287, 4);
    expect(capFor(4000, 120, 60, 0.8, 0.95)).toBeCloseTo(310.44, 2);
    const r = pfc(sc, capFor(4000, 120, 60, 0.8, 0.95), 0.95);
    expect(r.Q1).toBeCloseTo(3000, 9);
    expect(r.Qc).toBeCloseTo(1685.26, 2);
    expect(r.Qnet).toBeCloseTo(1314.74, 2);
    expect(r.pfNet).toBeCloseTo(0.95, 9);
    expect(r.kind).toBe('lag');
    expect(r.I1).toBeCloseTo(41.67, 2);
    expect(r.Iline).toBeCloseTo(35.09, 2);
    expect(100 * r.dI).toBeCloseTo(15.79, 2);
    expect(100 * r.dLoss).toBeCloseTo(29.09, 2);
    expect(r.S1).toBe(5000);
    expect(r.Snet).toBeCloseTo(4210.5, 1); // the act 4 figure's 4.21 kVA
    expect(r.cTarget).toBeCloseTo(310.44, 2);
    // the act 4 figure's bar: 210 px × 35.09 / 41.67 ≈ 177 px
    expect(210 * (r.Iline / r.I1)).toBeCloseTo(177, 0);
  });

  it('guided example: 20 kW, 240 V, 60 Hz, 0.8 → 0.95: 15000, 6573.68, 8426.32 VAR, 388.05 µF, 104.17 → 87.72 A, −29.09 %', () => {
    const sc = SCENARIOS.factory;
    expect(20000 * tan(0.8)).toBeCloseTo(15000, 9);
    expect(20000 * tan(0.95)).toBeCloseTo(6573.68, 2);
    expect(qcFor(20000, 0.8, 0.95)).toBeCloseTo(8426.32, 2);
    expect(capFor(20000, 240, 60, 0.8, 0.95)).toBeCloseTo(388.05, 2);
    const r = pfc(sc, capFor(20000, 240, 60, 0.8, 0.95), 0.95);
    expect(r.I1).toBeCloseTo(104.17, 2);
    expect(r.Iline).toBeCloseTo(87.72, 2);
    expect(r.I1 - r.Iline).toBeCloseTo(16.45, 2);
    expect(100 * r.dI).toBeCloseTo(15.79, 2);
    expect(100 * r.dLoss).toBeCloseTo(29.09, 2);
    expect(r.pfNet).toBeCloseTo(0.95, 9);
    // step 5's intercept: (0.80/0.95)² = 0.7091
    expect((0.8 / 0.95) ** 2).toBeCloseTo(0.7091, 4);
    // the act 5 figure: 104.2 → 87.7 A, Q_C = −8.43 kVAR
    expect(fmt(r.I1, 1)).toBe('104.2');
    expect(fmt(r.Iline, 1)).toBe('87.7');
    expect(fmt(r.Qc / 1000, 2)).toBe('8.43');
  });

  it('guided example, the wrong options are what their intercepts say', () => {
    const th1 = Math.acos(0.8);
    const th2 = Math.acos(0.95);
    expect(20000 * Math.sin(th1)).toBeCloseTo(12000, 6); // step 1 (a): sin instead of tan
    expect(20000 / 0.8).toBe(25000); // step 1 (c): S1, not Q1
    expect(((20000 * 0.95) / 0.8) * Math.tan(th2)).toBeCloseTo(7806.25, 2); // step 2 (a): P scaled
    expect(20000 * Math.sin(th2)).toBeCloseTo(6245.0, 2); // step 2 (b): sin
    const Q1 = 15000;
    const Q2 = 20000 * Math.tan(th2);
    expect(Math.sqrt(Q1 ** 2 - Q2 ** 2)).toBeCloseTo(13482.8, 1); // step 3 (b): √(Q1² − Q2²)
    expect(Q1 + Q2).toBeCloseTo(21573.68, 2); // step 3 (c)
    const Qc = Q1 - Q2;
    expect((Qc / (60 * 240 ** 2)) * 1e6).toBeCloseTo(2438.17, 2); // step 4 (a): f instead of ω
    expect((Qc / (2 * Math.PI * 60 * 2 * 240 ** 2)) * 1e6).toBeCloseTo(194.02, 2); // step 4 (c): peak voltage
    expect(20000 / 240).toBeCloseTo(83.33, 2); // step 5 (b): I = P/V
  });

  it('quiz Q4: 10 kW, 220 V, 50 Hz, 0.70 → 0.95: Q_C = 6915.20 VAR, C = 454.8 µF; the distractors', () => {
    expect(deg(Math.acos(0.7))).toBeCloseTo(45.573, 3);
    expect(tan(0.7)).toBeCloseTo(1.0202, 4);
    expect(qcFor(10000, 0.7, 0.95)).toBeCloseTo(6915.2, 1);
    expect(2 * Math.PI * 50).toBeCloseTo(314.159, 3);
    const c = capFor(10000, 220, 50, 0.7, 0.95);
    expect(c).toBeCloseTo(454.8, 1);
    expect(c / 2).toBeCloseTo(227.4, 1); // A: peak voltage
    expect(2 * c).toBeCloseTo(909.6, 1); // D: ω = π f
    // B: 691.5 µF delivers ≈ 10.5 kVAR, more than Q1 = 10.2 kVAR (pf = 1 needs ≈ 671 µF)
    expect(qcOf(691.5, 220, 50)).toBeCloseTo(10514, -1);
    expect(10000 * tan(0.7)).toBeCloseTo(10202, 0);
    expect(capFor(10000, 220, 50, 0.7, 1)).toBeCloseTo(671, 0);
  });

  it('quiz Q3: pf 0.75 → 0.95 at the same P: current to 79 %, loss to 62 % (−38 %)', () => {
    expect(0.75 / 0.95).toBeCloseTo(0.79, 2);
    expect((0.75 / 0.95) ** 2).toBeCloseTo(0.62, 2);
    expect(100 * lossDrop(0.75, 0.95)).toBeCloseTo(38, 0);
  });

  it('layer 03: P never moves; over-compensation only past Q1 (Sadiku: C > 552.6 µF; factory: never within 600 µF)', () => {
    const s = SCENARIOS.sadiku;
    const cOver = (3000 / (2 * Math.PI * 60 * 120 ** 2)) * 1e6;
    expect(cOver).toBeCloseTo(552.6, 1);
    expect(pfc(s, 550, 0.95).over).toBe(false);
    expect(pfc(s, 555, 0.95).over).toBe(true);
    expect(pfc(s, 600, 0.95).kind).toBe('lead');
    expect(pfc(SCENARIOS.factory, 600, 0.95).over).toBe(false);
    // past unity the line current climbs again
    expect(pfc(s, 600, 0.95).Iline).toBeGreaterThan(pfc(s, 550, 0.95).Iline);
    expect(pfc(s, 0, 0.95).Iline).toBeCloseTo(pfc(s, 0, 0.95).I1, 12);
  });

  it('fmt / fmtPow', () => {
    expect(fmt(-1e-9, 2)).toBe('0.00');
    expect(fmt(-2.5, 1)).toBe('−2.5');
    expect(fmt(310.4, 2, true)).toBe('310.4');
    expect(fmtPow(15000, 'VAR')).toBe('15.00 kVAR');
    expect(fmtPow(1685.26, 'VAR')).toBe('1685.26 VAR');
  });
});
