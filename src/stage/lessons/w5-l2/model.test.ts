import { describe, expect, it } from 'vitest';
import {
  abs,
  add,
  arg,
  bench,
  C_LAB,
  cx,
  div,
  EL,
  exNet,
  exReadout,
  inv,
  mul,
  mixNet,
  phaseOf,
  polar,
  R_ALT,
  R_GEN,
  R_LAB,
  rc,
  RLC,
  single,
  sub,
  timeDiv,
  V_PK,
  zL,
  zR,
  type Cx,
} from './model';
import { SVG_SCOPE_DARK, SVG_Z_TRIANGLE } from './svgs';

const close = (z: Cx, re: number, im: number, d = 9) => {
  expect(z.re).toBeCloseTo(re, d);
  expect(z.im).toBeCloseTo(im, d);
};
const polarIs = (z: Cx, mag: number, ang: number, dm = 2, da = 2) => {
  expect(abs(z)).toBeCloseTo(mag, dm);
  expect(arg(z)).toBeCloseTo(ang, da);
};

describe('complex arithmetic', () => {
  it('multiplies, divides and inverts', () => {
    close(div(cx(60, -80), cx(8, -4)), 10, -5);
    close(inv(cx(6, -8)), 0.06, 0.08);
    polarIs(polar(30, 20), 30, 20, 9, 9);
    expect(phaseOf(polar(1, -170), polar(1, 170))).toBeCloseTo(20, 9);
  });
});

describe('act 1 · example 1.1: v = 12∠30° V on L = 5 mH and C = 10 µF at ω = 4000 rad/s', () => {
  it('X_L = 20 Ω, I_L = 0.60∠−60° A; X_C = 25 Ω, I_C = 0.48∠120° A', () => {
    const l = single('L', EL.w);
    close(l.z, 0, 20);
    polarIs(l.i, 0.6, -60, 9, 9);
    const c = single('C', EL.w);
    close(c.z, 0, -25);
    polarIs(c.i, 0.48, 120, 9, 9);
    // R: in phase, independent of ω
    expect(arg(single('R', 123).i)).toBeCloseTo(30, 9);
  });
});

describe('act 2 · example 2.1: series RLC 30 Ω, 80 mH, 25 µF at ω = 1000 rad/s', () => {
  it('Z = 30 + j40 = 50∠53.13° Ω, Y = 0.012 − j0.016 = 0.020∠−53.13° S, 1/R ≠ G', () => {
    const z = single('RLC', RLC.w).z;
    close(z, 30, 40);
    polarIs(z, 50, 53.13);
    const y = inv(z);
    close(y, 0.012, -0.016);
    polarIs(y, 0.02, -53.13, 6);
    expect(1 / RLC.r).toBeCloseTo(0.0333, 4);
  });
  it('resonance (X = 0) at ω = 1/√(LC) ≈ 707.1 rad/s — the 01 layer preset', () => {
    expect(1 / Math.sqrt(RLC.l * RLC.c)).toBeCloseTo(707.1, 1);
    expect(single('RLC', 1 / Math.sqrt(RLC.l * RLC.c)).x).toBeCloseTo(0, 9);
  });
});

describe('act 3 · example 3.1: the mixed network at ω = 50 rad/s, V_s = 30∠10° V', () => {
  const m = mixNet(50);
  it('Z_1 = 2 − j4, Z_A = 8 + j6, Z_B = −j10, Z_p = 10 − j5, Z_eq = 12 − j9 = 15∠−36.87° Ω', () => {
    close(m.z1, 2, -4);
    close(m.za, 8, 6);
    close(m.zb, 0, -10);
    close(m.zp, 10, -5);
    close(m.zeq, 12, -9);
    polarIs(m.zeq, 15, -36.87);
    polarIs(add(m.za, m.zb), 4 * Math.sqrt(5), -26.57);
  });
  it('I = 2.00∠46.87° A, I_A = √5∠−16.57°, I_B = √5∠110.30° A, 126.87° apart, I_A + I_B = I', () => {
    polarIs(m.i, 2, 46.87);
    polarIs(m.ia, Math.sqrt(5), -16.57, 6, 1);
    expect(arg(m.ia)).toBeCloseTo(-16.565, 2);
    polarIs(m.ib, Math.sqrt(5), 110.3, 6, 1);
    expect(abs(m.ia)).toBeCloseTo(2.24, 2);
    expect(arg(m.ib) - arg(m.ia)).toBeCloseTo(126.87, 2);
    close(add(m.ia, m.ib), m.i.re, m.i.im);
  });
});

describe('act 6 · the guided example: 3 Ω + 55 mH, then 10 Ω ∥ 500 µF, V_s = 30∠20° V, ω = 200 rad/s', () => {
  const n = exNet(200);
  it('step 1: Z_L1 = j11, Z_C = −j10, Z_1 = 3 + j11 Ω', () => {
    close(n.zl1, 0, 11);
    close(n.zc, 0, -10);
    close(n.z1, 3, 11);
  });
  it('step 2: Z_p = 5 − j5 Ω (and the wrong options: series 10 − j10, sign 5 + j5)', () => {
    close(n.zp, 5, -5);
    close(add(zR(10), n.zc), 10, -10);
  });
  it('step 3: Z_eq = 8 + j6 = 10∠36.87° Ω; the distractors are what their slips give', () => {
    close(n.zeq, 8, 6);
    polarIs(n.zeq, 10, 36.87);
    polarIs(cx(8, 16), 17.89, 63.43);
    polarIs(cx(2, 6), 6.32, 71.57);
  });
  it('steps 4–5: I = 3.00∠−16.87° A, i(t) = 3.00 cos(200t − 16.87°) A', () => {
    polarIs(n.i, 3, -16.87);
  });
  it('the 01 layer prints nothing of it before the steps reach it', () => {
    const hidden = exReadout(0, 200);
    for (const v of Object.values(hidden)) expect(v).toBe('?');
    const r1 = exReadout(1, 200);
    expect(r1.zl1).toBe('j11 Ω');
    expect(r1.zc).toBe('−j10 Ω');
    expect(r1.zp).toBe('?');
    expect(exReadout(2, 200).zp).toBe('5 − j5 Ω');
    expect(exReadout(2, 200).zeq).toBe('?');
    expect(exReadout(3, 200).zeq).toBe('8 + j6 = 10∠36.87° Ω');
    expect(exReadout(3, 200).i).toBe('?');
    expect(exReadout(4, 200).i).toBe('3.00∠−16.87° A');
    expect(exReadout(9, 200).it).toBe('3.00 cos(200t − 16.87°) A');
  });
});

describe('acts 4–5 · the RC phase-shift lab (C = 100 nF, 5 V peak)', () => {
  it('1 kHz, 1.6 kΩ: X_C = 1591.55 Ω, R/X_C = 1.0053, |H_C| = 0.7052, Δφ = −45.15°, Δt = 125.42 µs, V_C = 3.53 V', () => {
    const m = rc(1000, R_LAB);
    expect(m.xc).toBeCloseTo(1591.55, 2);
    expect(m.ratio).toBeCloseTo(1.0053, 4);
    expect(m.gain).toBeCloseTo(0.7052, 4);
    expect(m.phiC).toBeCloseTo(-45.15, 2);
    expect(m.dt * 1e6).toBeCloseTo(125.42, 2);
    expect(V_PK * m.gain).toBeCloseTo(3.53, 2);
    expect(m.phiR).toBeCloseTo(44.85, 2);
    expect(m.dt / m.T).toBeCloseTo(1 / 8, 2);
    expect(m.w).toBeCloseTo(6283.19, 2);
  });
  it('1 kHz, 1.5 kΩ: |H_C| = 0.7277 (3.64 V), Δφ = −43.30°, Δt = 120.29 µs', () => {
    const m = rc(1000, R_ALT);
    expect(m.gain).toBeCloseTo(0.7277, 4);
    expect(V_PK * m.gain).toBeCloseTo(3.64, 2);
    expect(m.phiC).toBeCloseTo(-43.3, 2);
    expect(m.dt * 1e6).toBeCloseTo(120.29, 2);
  });
  it('safety block: |Z| = 2256.77 Ω, 2.22 mA peak, 1.57 mA rms, 3.93 mW in R (< 1.6 % of 1/4 W, margin 63.6×)', () => {
    const m = rc(1000, R_LAB);
    expect(m.zMag).toBeCloseTo(2256.77, 2);
    expect(m.iPk * 1e3).toBeCloseTo(2.22, 2);
    expect(m.iRms * 1e3).toBeCloseTo(1.57, 2);
    expect(m.pR * 1e3).toBeCloseTo(3.93, 2);
    expect(m.pR / 0.25).toBeLessThan(0.016);
    expect(0.25 / 3.93e-3).toBeCloseTo(63.6, 1);
    // "负载误差低于 2.3 %": the 50 Ω generator against |Z|
    expect(R_GEN / m.zMag).toBeLessThan(0.023);
  });
  it('the sweep of act 5.1: 100 Hz (15.92 kΩ, 0.995, −5.74°) and 10 kHz (159.2 Ω, 0.099, −84.32°)', () => {
    const lo = rc(100, R_LAB);
    expect(lo.xc / 1e3).toBeCloseTo(15.92, 2);
    expect(lo.gain).toBeCloseTo(0.995, 3);
    expect(lo.phiC).toBeCloseTo(-5.74, 2);
    const hi = rc(10000, R_LAB);
    expect(hi.xc).toBeCloseTo(159.2, 1);
    expect(hi.gain).toBeCloseTo(0.099, 3);
    expect(hi.phiC).toBeCloseTo(-84.32, 2);
  });
  it('act 5.1 ①, corrected: 2 Ω on 5 V peak needs 2.5 A from an ideal source; the 50 Ω generator only gives ≈ 96 mA and ≈ 0.19 V', () => {
    expect(V_PK / 2).toBe(2.5);
    expect(((2.5 * 2.5) / 2) * 2).toBeCloseTo(6.25, 9);
    expect((V_PK / (2 + R_GEN)) * 1e3).toBeCloseTo(96, 0);
    expect((V_PK * 2) / (2 + R_GEN)).toBeCloseTo(0.19, 2);
  });
  it('the bench: the 50 Ω output lowers CH1 to ≈ 4.92 V but leaves CH2/CH1 and the phase alone', () => {
    const b = bench(1000, R_LAB, 'vc', 'gnd');
    expect(abs(b.ch1)).toBeCloseTo(4.92, 2);
    expect(abs(b.ch2) / abs(b.ch1)).toBeCloseTo(0.7052, 4);
    expect(phaseOf(b.ch2, b.ch1)).toBeCloseTo(-45.15, 2);
    expect(b.pR * 1e3).toBeCloseTo(3.81, 2);
    close(b.math, sub(b.ch1, b.ch2).re, sub(b.ch1, b.ch2).im);
    expect(phaseOf(b.math, b.ch1)).toBeCloseTo(44.85, 2);
  });
  it('the bench: swapping R and C puts v_R on CH2 (+44.85°); the CH2 clip on OUT shorts the lower part', () => {
    const s = bench(1000, R_LAB, 'swap', 'gnd');
    expect(phaseOf(s.ch2, s.ch1)).toBeCloseTo(44.85, 2);
    expect(abs(s.ch2) / abs(s.ch1)).toBeCloseTo(rc(1000, R_LAB).gainR, 6);
    const f = bench(1000, R_LAB, 'vc', 'out');
    expect(f.fault).toBe(true);
    expect(abs(f.ch2)).toBe(0);
    // only R is left across the generator
    expect(abs(f.i)).toBeCloseTo(V_PK / (R_LAB + R_GEN), 9);
  });
  it('quiz 2–4: Y = 0.06 + j0.08 S; I_L = 3.54∠−45° A; Δφ = −45° at 2 kHz, Δt = 62.5 µs', () => {
    close(inv(cx(6, -8)), 0.06, 0.08);
    const iL = mul(div(zR(10), add(zL(1, 10), zR(10))), polar(5, 0));
    polarIs(iL, 3.5355, -45, 4);
    expect(-(62.5e-6 / (1 / 2000)) * 360).toBeCloseTo(-45, 9);
  });
  it('the time base: two periods on 8 divisions in 1–2.5–5 steps', () => {
    expect(timeDiv(1000)).toBeCloseTo(250e-6, 12);
    expect(timeDiv(100)).toBeCloseTo(2.5e-3, 12);
    expect(timeDiv(10000)).toBeCloseTo(25e-6, 12);
    expect(C_LAB).toBe(1e-7);
  });
});

describe('the sheet figures', () => {
  const line = (svg: string, x1: number, y1: number) => {
    const m = new RegExp(`<line x1="${x1}" y1="${y1}" x2="([\\d.]+)" y2="([\\d.]+)" stroke="#7c3aed"`).exec(svg);
    if (!m) throw new Error('no Z line');
    return (Math.atan2(y1 - Number(m[2]), Number(m[1]) - x1) * 180) / Math.PI;
  };
  it('act 2: both Z vectors are drawn at θ_Z = 53.13°', () => {
    expect(line(SVG_Z_TRIANGLE, 115, 195)).toBeCloseTo(53.13, 1);
    expect(line(SVG_Z_TRIANGLE, 430, 235)).toBeCloseTo(53.13, 1);
  });
  it('act 4: CH2 peaks 35.1 px (125.4 µs at 70 px = 250 µs) after CH1, at 3.53 V on 2.5 V/div', () => {
    expect(((175.1 - 140) / 70) * 250).toBeCloseTo(125.4, 0);
    expect(SVG_SCOPE_DARK).toContain('x1="175.1"');
    expect(175 - (3.53 / 2.5) * 45).toBeCloseTo(111.5, 0);
  });
});
