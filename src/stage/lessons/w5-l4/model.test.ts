import { describe, expect, it } from 'vitest';
import {
  EX1,
  GUIDED,
  abs,
  argDeg,
  cx,
  div,
  nodalSrcT,
  opamp,
  polar,
  port3,
  port4,
  portN,
  portTh,
  simulateSup,
  solveSrcT,
  solveSup,
  solveTh3,
  solveTh4,
  supAt,
  type Cx,
} from './model';

const close = (z: Cx, re: number, im: number, d = 9) => {
  expect(z.re).toBeCloseTo(re, d);
  expect(z.im).toBeCloseTo(im, d);
};

describe('W5-L4 · act 1, example 1 (DC + ω₁ = 2 + ω₂ = 5)', () => {
  const s = solveSup(EX1);
  it('v_o0 = 6 V; Z_L1 = j4, Z_C1 = −j2, Z∥1 = 2.4 + j0.8 Ω; V_o1 = 40/3 + j40/3 ≈ 18.86∠45° V', () => {
    expect(s.vo0).toBeCloseTo(6, 12);
    close(s.ZL1, 0, 4);
    close(s.ZC1, 0, -2);
    close(s.Zpar1, 2.4, 0.8);
    close(s.Vo1, 40 / 3, 40 / 3);
    expect(abs(s.Vo1)).toBeCloseTo(18.86, 2);
    expect(argDeg(s.Vo1)).toBeCloseTo(45, 9);
  });
  it('ω₂: Z_L2 = j10, Z_C2 = −j0.8; Y ≈ 0.2845 + j1.1638 ≈ 1.1981∠76.26° S; V_o2 ≈ 2.504∠−166.26° V', () => {
    close(s.ZL2, 0, 10);
    close(s.ZC2, 0, -0.8);
    expect(s.Y2.re).toBeCloseTo(0.2845, 4);
    expect(s.Y2.im).toBeCloseTo(1.1638, 4);
    expect(abs(s.Y2)).toBeCloseTo(1.1981, 4);
    expect(argDeg(s.Y2)).toBeCloseTo(76.26, 2);
    expect(abs(s.Vo2)).toBeCloseTo(2.504, 3);
    expect(argDeg(s.Vo2)).toBeCloseTo(-166.26, 2);
  });
  it('superposition agrees with the full time-domain circuit (RK4, after the transient)', () => {
    const { t, v } = simulateSup(EX1, 40);
    expect(v).toBeCloseTo(supAt(s, t).total, 3);
  });
});

describe('W5-L4 · guided example (DC + ω₁ = 2 + ω₂ = 4)', () => {
  const s = solveSup(GUIDED);
  it('v_o0 = 4 V; Z_L1 = j2, Z_C1 = −j2, (2 + j2) ∥ 4 = 1.6 + j0.8; V_o1 = 4 + j8 ≈ 8.94∠63.43° V', () => {
    expect(s.vo0).toBeCloseTo(4, 12);
    close(s.ZL1, 0, 2);
    close(s.ZC1, 0, -2);
    close(s.Zpar1, 1.6, 0.8);
    close(s.Vo1, 4, 8);
    expect(abs(s.Vo1)).toBeCloseTo(8.94, 2);
    expect(argDeg(s.Vo1)).toBeCloseTo(63.43, 2);
  });
  it('Z_L2 = j4, Z_C2 = −j1; Y = 0.35 + j0.80 ≈ 0.8732∠66.37° S; V_o2 ≈ 5.73∠−66.37° V', () => {
    close(s.ZL2, 0, 4);
    close(s.ZC2, 0, -1);
    close(s.Y2, 0.35, 0.8);
    expect(abs(s.Y2)).toBeCloseTo(0.8732, 4);
    expect(argDeg(s.Y2)).toBeCloseTo(66.37, 2);
    expect(abs(s.Vo2)).toBeCloseTo(5.73, 2);
    expect(argDeg(s.Vo2)).toBeCloseTo(-66.37, 2);
  });
  it('the time-domain sum is the full circuit; the phasor sum is not', () => {
    const { t, v } = simulateSup(GUIDED, 40);
    expect(v).toBeCloseTo(supAt(s, t).total, 3);
    // adding phasors of different frequencies gives a number that is no time function at all:
    // e.g. at t = 0 the right sum is 4 + Re V_o1 + Re V_o2, at t = 0.5 s it is not 4 + |V_o1 + V_o2| cos(…)
    const a = supAt(s, 0.5).total;
    const wrong = 4 + abs({ re: s.Vo1.re + s.Vo2.re, im: s.Vo1.im + s.Vo2.im }) * Math.cos(2 * 0.5 + Math.atan2(s.Vo1.im + s.Vo2.im, s.Vo1.re + s.Vo2.re));
    expect(Math.abs(a - wrong)).toBeGreaterThan(1);
  });
});

describe('W5-L4 · act 2, source transformation', () => {
  const s = solveSrcT();
  it('4 A; 3 − j3 Ω; 12 − j12 V; Z_left = 8 Ω; 1.5 − j1.5 A; 1.5 + j0.5 A; 4 Ω; V_x = 6 + j2 ≈ 6.32∠18.43° V', () => {
    close(s.Is1, 4, 0);
    close(s.Zeq1, 3, -3);
    close(s.Veq1, 12, -12);
    close(s.Zleft, 8, 0);
    close(s.Ileft, 1.5, -1.5);
    close(s.Itot, 1.5, 0.5);
    close(s.Ztot, 4, 0);
    close(s.Vx, 6, 2);
    expect(abs(s.Vx)).toBeCloseTo(6.32, 2);
    expect(argDeg(s.Vx)).toBeCloseTo(18.43, 2);
  });
  it('plain nodal analysis gives the same V_x', () => {
    const v = nodalSrcT();
    close(v, 6, 2);
  });
});

describe('W5-L4 · act 3, Thévenin / Norton (independent sources)', () => {
  const s = solveTh3();
  it('Z1 ∥ Z2 = 15 + j5; Z_Th = 19 + j5 ≈ 19.65∠14.74° Ω; V1 = 15 + j105; V_Th = 15 + j113 ≈ 113.99∠82.44° V', () => {
    close(s.Z12, 15, 5);
    close(s.Zth, 19, 5);
    expect(abs(s.Zth)).toBeCloseTo(19.65, 2);
    expect(argDeg(s.Zth)).toBeCloseTo(14.74, 2);
    close(s.VsZ1, 3, 4);
    close(s.V1, 15, 105);
    close(s.Vth, 15, 113);
    expect(abs(s.Vth)).toBeCloseTo(113.99, 2);
    expect(argDeg(s.Vth)).toBeCloseTo(82.44, 2);
  });
  it('I_N ≈ 5.80∠67.70° ≈ 2.20 + j5.37 A, and it is the short-circuit current', () => {
    expect(abs(s.In)).toBeCloseTo(5.8, 2);
    expect(argDeg(s.In)).toBeCloseTo(67.7, 1);
    expect(s.In.re).toBeCloseTo(2.2, 2);
    expect(s.In.im).toBeCloseTo(5.37, 2);
    const sc = port3(cx(0));
    close(sc.I, s.In.re, s.In.im);
  });
  it('any load sees the same port in the original, Thévenin and Norton views', () => {
    for (const z of [null, cx(0), cx(10, 0), cx(4, -12), cx(0, 20), cx(20, -20)]) {
      const o = port3(z);
      const t = portTh(s.Vth, s.Zth, z);
      const n = portN(s.In, s.Zth, z);
      close(o.V, t.V.re, t.V.im);
      close(o.V, n.V.re, n.V.im);
      close(o.I, t.I.re, t.I.im);
      close(o.I, n.I.re, n.I.im);
    }
  });
});

describe('W5-L4 · act 4, dependent source and the 1∠0° V test source', () => {
  const s = solveTh4();
  it('V_x = −6 − j6 V; V_Th = 6 − j18 ≈ 18.97∠−71.57° V', () => {
    close(s.Vx, -6, -6);
    close(s.Vth, 6, -18);
    expect(abs(s.Vth)).toBeCloseTo(18.97, 2);
    expect(argDeg(s.Vth)).toBeCloseTo(-71.57, 2);
  });
  it('test source: node 1 admittance 0.25 S (L and C cancel), V_x = −j1 V, I_t = 0.25 + j0.25 A, Z_Th = 2 − j2 ≈ 2.83∠−45° Ω', () => {
    close(s.Ysum, 0.25, 0);
    close(s.VxT, 0, -1);
    close(s.It, 0.25, 0.25);
    close(s.Zth, 2, -2);
    expect(abs(s.Zth)).toBeCloseTo(2.83, 2);
    expect(argDeg(s.Zth)).toBeCloseTo(-45, 9);
  });
  it('V_oc / I_sc gives the same Z_Th, and loads agree with the Thévenin view', () => {
    const sc = port4(cx(0)).I;
    const z = div(s.Vth, sc);
    close(z, 2, -2);
    for (const zl of [null, cx(5, 0), cx(1, 3), cx(20, -20)]) {
      const o = port4(zl);
      const t = portTh(s.Vth, s.Zth, zl);
      close(o.V, t.V.re, t.V.im);
      close(o.I, t.I.re, t.I.im);
    }
  });
});

describe('W5-L4 · act 5, the AC inverting amplifier with C_f ∥ R_f', () => {
  it('ωR_fC_f = 1; Z_Cf = −j50 kΩ; Z_f = 25 − j25 kΩ; A_v = −2.5 + j2.5 ≈ 3.536∠135°; V_o ≈ 7.07∠135° V', () => {
    const o = opamp(1000, 'inv');
    expect(o.x).toBeCloseTo(1, 12);
    close(o.ZCf!, 0, -50e3, 6);
    close(o.Zf, 25e3, -25e3, 6);
    close(o.A, -2.5, 2.5);
    expect(abs(o.A)).toBeCloseTo(3.536, 3);
    expect(argDeg(o.A)).toBeCloseTo(135, 9);
    expect(abs(o.Vo)).toBeCloseTo(7.07, 2);
    expect(o.wc).toBeCloseTo(1000, 9);
  });
  it('DC gain 5 (13.98 dB), 3.536 at ω_c (10.97 dB, −3.01 dB), 0.50 at 10⁴ rad/s', () => {
    const dc = opamp(0, 'inv');
    expect(abs(dc.A)).toBeCloseTo(5, 12);
    expect(dc.dB).toBeCloseTo(13.98, 2);
    const c = opamp(1000, 'inv');
    expect(c.dB).toBeCloseTo(10.97, 2);
    expect(c.dB - dc.dB).toBeCloseTo(-3.01, 2);
    expect(abs(opamp(10000, 'inv').A)).toBeCloseTo(0.5, 2);
  });
  it('non-inverting: A_v = 1 + Z_f/Z_1 → 6 at DC, → 1 at high ω', () => {
    expect(abs(opamp(0, 'noninv').A)).toBeCloseTo(6, 12);
    expect(abs(opamp(1e7, 'noninv').A)).toBeCloseTo(1, 3);
  });
});

describe('W5-L4 · quiz', () => {
  it('Q1: 10∠0° + 10∠90° would be 14.14∠45° — the wrong phasor sum the option offers', () => {
    const z = { re: 10, im: 10 };
    expect(abs(z)).toBeCloseTo(14.14, 2);
  });
  it('Q2: 12∠30° / (3 + j4) = 2.4∠−23.13° A', () => {
    const i = div(polar(12, 30), cx(3, 4));
    expect(abs(i)).toBeCloseTo(2.4, 9);
    expect(argDeg(i)).toBeCloseTo(-23.13, 2);
  });
  it('Q3: 1 / (0.1 − j0.1) = 5 + j5 Ω', () => {
    close(div(cx(1), cx(0.1, -0.1)), 5, 5);
  });
  it('Q4: 2 kΩ, 10 kΩ ∥ 0.1 µF at 1000 rad/s → −2.5 + j2.5 ≈ 3.54∠135°', () => {
    const o = opamp(1000, 'inv', { R1: 2e3, Rf: 10e3, Cf: 0.1e-6, Vi: 1, w: 1000 });
    close(o.A, -2.5, 2.5);
  });
});
