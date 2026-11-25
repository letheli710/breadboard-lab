import { describe, expect, it } from 'vitest';
import { EX_5_7, MATCHED_10, PP_5_7, SENSOR, clip, coeffs, design, eq516, fmt, gains, inputR, nodal, split, superpose, unsplit, withTol } from './model';

describe('W3-L6 difference amplifier model', () => {
  it('act 1: the split v1 = 4.995 V, v2 = 5.005 V; single-ended ×10 clips, differential gives 0.1 V', () => {
    const { v1, v2 } = split(SENSOR.vcm, SENSOR.vd);
    expect(v1).toBeCloseTo(4.995, 9);
    expect(v2).toBeCloseTo(5.005, 9);
    expect(unsplit(v1, v2).vcm).toBeCloseTo(5, 9);
    expect(unsplit(v1, v2).vd).toBeCloseTo(0.01, 9);
    expect(SENSOR.gain * v2).toBeCloseTo(50.05, 9);
    expect(clip(SENSOR.gain * v2, SENSOR.rail)).toBe(15);
    expect(SENSOR.gain * (v2 - v1)).toBeCloseTo(0.1, 9);
  });

  it('act 2: Eq. 5.16, the matching condition and Eq. 5.18; v_a = v_b = 4.55 V (not 0)', () => {
    const { v1, v2 } = split(5, 0.01);
    const n = nodal(MATCHED_10, v1, v2);
    expect(n.vb).toBeCloseTo(4.55, 9);
    expect(n.va).toBeCloseTo(4.55, 9);
    expect(n.vo).toBeCloseTo(0.1, 9);
    expect(n.i1).toBeCloseTo(n.i2, 12); // KCL at a (i₋ = 0)
    expect(n.i3).toBeCloseTo(n.i4, 12); // KCL at b (i₊ = 0)
    expect(eq516(MATCHED_10, v1, v2)).toBeCloseTo(n.vo, 12);
    // Eq. 5.18: matched → R2/R1 (v2 − v1)
    expect(eq516(MATCHED_10, 1.3, -0.7)).toBeCloseTo(10 * (-0.7 - 1.3), 9);
    expect(coeffs(MATCHED_10).a).toBeCloseTo(coeffs(MATCHED_10).b, 12);
    // R1 = R2 = R3 = R4: unity subtractor
    expect(eq516({ R1: 7, R2: 7, R3: 7, R4: 7 }, 2, 5)).toBeCloseTo(3, 12);
  });

  it('act 3: superposition agrees with the nodal result term by term (−49.95 + 50.05 = 0.1 V)', () => {
    const { v1, v2 } = split(5, 0.01);
    const s = superpose(MATCHED_10, v1, v2);
    expect(s.vb1).toBe(0);
    expect(s.vo1).toBeCloseTo(-49.95, 9);
    expect(s.vb2).toBeCloseTo(4.55, 9);
    expect(s.vo2).toBeCloseTo(50.05, 9);
    expect(s.vo).toBeCloseTo(0.1, 9);
    // both methods agree for any resistors and inputs
    for (const r of [MATCHED_10, EX_5_7, PP_5_7, { R1: 3.3, R2: 47, R3: 12, R4: 68 }]) {
      for (const [a, b] of [
        [1, 2],
        [-3, 0.5],
        [4.995, 5.005],
      ]) {
        expect(superpose(r, a, b).vo).toBeCloseTo(nodal(r, a, b).vo, 9);
        expect(eq516(r, a, b)).toBeCloseTo(nodal(r, a, b).vo, 9);
      }
    }
  });

  it('act 4: A_d, A_cm, CMRR of the R4 +5 % case (47.25 dB, 0.2174 V leak)', () => {
    const r = withTol('single_r4_plus5pct', 5);
    expect(r.R4).toBeCloseTo(105, 9);
    const g = gains(r);
    expect(g.Acm).toBeCloseTo(1 / 23, 9);
    expect(g.Acm).toBeCloseTo(0.04348, 5);
    expect(g.Ad).toBeCloseTo(23050 / 2300, 9);
    expect(g.Ad).toBeCloseTo(10.0217, 4);
    expect(g.cmrr).toBeCloseTo(230.5, 2);
    expect(g.cmrrDb).toBeCloseTo(47.25, 2);
    expect(g.Ad * 0.01).toBeCloseTo(0.1002, 4);
    expect(g.Acm * 5).toBeCloseTo(0.2174, 4);
    expect((g.Acm * 5) / (g.Ad * 0.01)).toBeCloseTo(2.17, 2);
    // the gains reproduce Eq. 5.16 with v1 = vcm − vd/2, v2 = vcm + vd/2
    const { v1, v2 } = split(5, 0.01);
    expect(g.Ad * 0.01 + g.Acm * 5).toBeCloseTo(eq516(r, v1, v2), 9);
  });

  it('act 4: the worst 5 % combination (A_cm ≈ −0.19955, 34.79 dB, ≈ −0.9978 V leak)', () => {
    const r = withTol('worst_case_5pct', -5);
    expect(r).toMatchObject({ R1: 9.5, R2: 105, R3: 10.5, R4: 95 });
    const g = gains(r);
    expect(g.Acm).toBeCloseTo(-200 / 1002.25, 9);
    expect(g.Acm).toBeCloseTo(-0.19955, 5);
    expect(g.Ad).toBeCloseTo(21955 / 2004.5, 9);
    expect(g.Ad).toBeCloseTo(10.9529, 4);
    expect(g.cmrr).toBeCloseTo(54.89, 2);
    expect(g.cmrrDb).toBeCloseTo(34.79, 2);
    expect(g.Acm * 5).toBeCloseTo(-0.9978, 4);
    expect(g.Ad * 0.01).toBeCloseTo(0.1095, 4);
    // it is the worst of the 16 corners of ±5 %
    let worst = 0;
    for (let m = 0; m < 16; m++) {
      const k = (i: number) => (m & (1 << i) ? 1.05 : 0.95);
      const c = gains({ R1: 10 * k(0), R2: 100 * k(1), R3: 10 * k(2), R4: 100 * k(3) });
      worst = Math.max(worst, Math.abs(c.Acm));
    }
    expect(worst).toBeCloseTo(Math.abs(g.Acm), 12);
  });

  it('act 4: ideal matching has infinite CMRR; input resistances R1, R3 + R4, 2R1', () => {
    expect(gains(MATCHED_10).Acm).toBe(0);
    expect(gains(MATCHED_10).cmrrDb).toBe(Infinity);
    expect(gains(MATCHED_10).Ad).toBeCloseTo(10, 12);
    expect(inputR(MATCHED_10)).toEqual({ rin1: 10, rin2: 110, rid: 20 });
    expect(gains(withTol('precision_0_1pct', -0.1)).cmrrDb).toBeGreaterThan(60);
  });

  it('act 5: Sadiku Example 5.7 (10, 50, 10, 10 kΩ): v_o = −5 v1 + 3 v2; v1 = v2 = 2 V gives −4 V', () => {
    const d = design(5, 3);
    expect(d.ok).toBe(true);
    expect(d.r2r1).toBe(5);
    expect(d.r3r4).toBe(1);
    const c = coeffs(EX_5_7);
    expect(c.b).toBe(5);
    expect(c.nonInv).toBe(6);
    expect(c.div).toBeCloseTo(0.5, 12);
    expect(c.a).toBeCloseTo(3, 12);
    expect(eq516(EX_5_7, 2, 2)).toBeCloseTo(-4, 12);
    expect(gains(EX_5_7).Acm).toBeCloseTo(-2, 12);
    expect(gains(EX_5_7).Ad).toBeCloseTo(4, 12);
    // R3 = R4 = 20 kΩ is the same design
    expect(eq516({ ...EX_5_7, R3: 20, R4: 20 }, 1.5, -0.25)).toBeCloseTo(-5 * 1.5 + 3 * -0.25, 12);
    // realisable only when K2 < 1 + K1
    expect(design(5, 6).ok).toBe(false);
    expect(design(1, 1.5).ok).toBe(true);
  });

  it('act 5: Practice Problem 5.7 (gain 4) and the quiz numbers', () => {
    expect(eq516(PP_5_7, 1, 3)).toBeCloseTo(8, 12);
    expect(gains(PP_5_7).Acm).toBe(0);
    // Q1: R1 = 10, R2 = 40, R3 = 20 → R4 = 80; v2 = 3 V → v_a = 2.4 V
    const q1 = { R1: 10, R2: 40, R3: 20, R4: 80 };
    expect(gains(q1).Acm).toBe(0);
    expect(nodal(q1, 2, 3).va).toBeCloseTo(2.4, 12);
    expect(nodal(q1, 2, 3).vo).toBeCloseTo(4, 12);
    // Q3: R4 = 105 kΩ, v1 = v2 = 5 V → ≈ +0.217 V
    expect(eq516(withTol('single_r4_plus5pct', 5), 5, 5)).toBeCloseTo(0.2174, 4);
  });

  it('formats readouts', () => {
    expect(fmt(4.995)).toBe('4.995');
    expect(fmt(-49.95, 2)).toBe('−49.95');
    expect(fmt(0.1, 3, true)).toBe('+0.1');
    expect(fmt(-0.0001)).toBe('0');
    expect(fmt(Infinity)).toBe('∞');
  });
});
