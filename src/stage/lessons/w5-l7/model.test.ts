import { describe, expect, it } from 'vitest';
import {
  blockTF,
  dbOfPower,
  dbOfRatio,
  EX4,
  factorAsymDb,
  factorAsymPhase,
  factorDb,
  factorPhase,
  GUIDED,
  kOf,
  peak,
  RAW,
  rcTF,
  segments,
  totalAsymDb,
  totalAsymPhase,
  totalDb,
  totalPhase,
  type Factor,
} from './model';

const close = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);

describe('W5-L7 model: the sheet’s numbers', () => {
  it('act 1: RC low-pass, R = 1 kΩ, C = 1 µF → ω_c = 1000 rad/s, f_c ≈ 159.15 Hz; at ω_c |H| = 0.7071, φ = −45°', () => {
    const fs = rcTF(1000, 1e-6);
    close(fs[0].w!, 1000, 9);
    close(fs[0].w! / (2 * Math.PI), 159.15, 2);
    close(10 ** (totalDb(fs, 1000) / 20), 0.7071, 4);
    close(totalPhase(fs, 1000), -45, 9);
  });

  it('act 2: half power = 1/√2 = −3.01 dB; ×2 = +6.02 dB, ×10 = +20 dB, ×100 = +40 dB', () => {
    close(dbOfPower(0.5), -3.0103, 4);
    close(dbOfRatio(Math.SQRT1_2), -3.0103, 4);
    close(Math.sqrt(0.5), 0.7071, 4);
    close(-10 * Math.log10(2), -3.0103, 4);
    close(dbOfRatio(2), 6.02, 2);
    close(dbOfRatio(10), 20, 9);
    close(dbOfRatio(100), 40, 9);
    // a first-order slope of 20 dB/dec is 20 log10 2 = 6.02 dB per octave, 40 dB over two decades
    close(20 * Math.log10(2), 6.02, 2);
  });

  it('act 3: the four bricks — slopes ±20 dB/dec per order, errors ±3.01 / ±0.97 dB, phase ±45°/dec with ±5.71° at the decade ends', () => {
    const k: Factor = blockTF('K', 10, 1, 0.3)[0];
    close(factorDb(k, 0.3), 20, 9);
    close(factorAsymDb(k, 123), 20, 9);
    expect(factorPhase(blockTF('K', -10, 1, 0.3)[0], 5)).toBe(-180);
    close(factorAsymDb(blockTF('K', 0.1, 1, 0.3)[0], 5), -20, 9);
    for (const n of [1, -1] as const) {
      const o = blockTF('origin', 1, n, 0.3)[0];
      close(factorDb(o, 1), 0, 9); // through (1, 0 dB)
      close(factorDb(o, 10) - factorDb(o, 1), 20 * n, 9); // ±20 dB/dec
      close(factorPhase(o, 7), 90 * n, 9);
      const r = blockTF('real', 1, n, 0.3)[0]; // ω_c = 10
      close(factorAsymDb(r, 10), 0, 9);
      close(factorAsymDb(r, 100), 20 * n, 9);
      close(factorAsymDb(r, 1000) - factorAsymDb(r, 100), 20 * n, 9);
      close(factorDb(r, 10) - factorAsymDb(r, 10), 3.01 * n, 2);
      close(factorDb(r, 5) - factorAsymDb(r, 5), 0.97 * n, 2);
      close(factorDb(r, 20) - factorAsymDb(r, 20), 0.97 * n, 2);
      close(factorPhase(r, 10), 45 * n, 9);
      close(factorAsymPhase(r, 10), 45 * n, 9);
      // ±45°/dec over one decade either side of the corner, flat outside
      close(factorAsymPhase(r, 1), 0, 9);
      close(factorAsymPhase(r, 100), 90 * n, 9);
      close(factorAsymPhase(r, 0.5), 0, 9);
      close(factorAsymPhase(r, 300), 90 * n, 9);
      close(factorAsymPhase(r, 10 ** 1.5) - factorAsymPhase(r, 10 ** 0.5), 45 * n, 9);
      close(Math.abs(factorPhase(r, 1) - factorAsymPhase(r, 1)), 5.71, 2);
      close(Math.abs(factorPhase(r, 100) - factorAsymPhase(r, 100)), 5.71, 2);
    }
    // the pole pair: −40 dB/dec, −20 log10(2ζ) at ω_n, phase −90° at ω_n and 0 → −180° over two decades
    const q = (z: number) => blockTF('quad', 1, -1, z)[0];
    close(factorAsymDb(q(0.3), 1000) - factorAsymDb(q(0.3), 100), -40, 9);
    close(factorDb(q(1), 10), -6.02, 2);
    close(factorDb(q(0.707), 10), -3.01, 2);
    close(factorPhase(q(0.3), 10), -90, 9);
    close(factorAsymPhase(q(0.3), 10), -90, 9);
    close(factorAsymPhase(q(0.3), 100), -180, 9);
    close(factorPhase(q(0.3), 1e5), -180, 0);
    expect(peak(1)).toBeNull();
    expect(peak(0.707)).toBeNull();
    const p3 = peak(0.3)!;
    close(p3.wr, 0.906, 3);
    close(p3.Mr, 1.747, 3);
    close(p3.db, 4.85, 2);
    const p1 = peak(0.1)!;
    close(p1.wr, 0.99, 3);
    close(p1.Mr, 5.025, 3);
    close(p1.db, 14.02, 2);
    // the peak of the exact curve sits at ω_r with height M_r
    close(factorDb(q(0.3), 10 * p3.wr), p3.db, 6);
  });

  it('act 4: 200jω/[(jω+2)(jω+10)] → K = 10, plateau 26.02 dB, ω0 = √20 ≈ 4.472; the NumPy table', () => {
    expect(kOf(RAW.ex4)).toBe(10);
    close(20 * Math.log10(10 * 2), 26.02, 2);
    close(Math.sqrt(20), 4.472, 3);
    const rows: [number, number, number, number, number][] = [
      // ω, asym dB, exact dB, asym phase, exact phase
      [0.1, 0, -0.01, 90, 86.56],
      [0.2, 6.02, 5.98, 90, 83.14],
      [1, 20, 18.99, 58.55, 57.72],
      [2, 26.02, 22.84, 31.45, 33.69],
      [Math.sqrt(20), 26.02, 24.44, 0, 0],
      [10, 26.02, 22.84, -31.45, -33.69],
      [20, 20, 18.99, -58.55, -57.72],
      [100, 6.02, 5.98, -90, -83.14],
      [1000, -13.98, -13.98, -90, -89.31],
    ];
    for (const [w, a, e, ap, ep] of rows) {
      close(totalAsymDb(EX4, w), a);
      close(totalDb(EX4, w), e);
      close(totalAsymPhase(EX4, w), ap);
      close(totalPhase(EX4, w), ep);
    }
    // −3.18 dB at both corners: −3.01 of its own pole and −0.17 of the other one
    close(totalDb(EX4, 2) - totalAsymDb(EX4, 2), -3.18);
    close(-10 * Math.log10(1 + (2 / 10) ** 2), -0.17);
    close(totalDb(EX4, Math.sqrt(20)) - 26.0206, -1.58);
  });

  it('act 4 §4.2: the slope table (magnitude +20 / 0 / −20 dB/dec, phase 0 / −45 / −90 / −90 / −90 / −45 / 0 °/dec)', () => {
    const s = segments(EX4, 0.01, 1e4);
    expect(s.map((r) => Number(r.lo.toPrecision(6)))).toEqual([0.01, 0.2, 1, 2, 10, 20, 100]);
    expect(s.map((r) => r.magTotal)).toEqual([20, 20, 20, 0, -20, -20, -20]);
    expect(s.map((r) => r.phaseTotal)).toEqual([0, -45, -90, -90, -90, -45, 0]);
    expect(s[4].mag).toEqual({ f_k: 0, f_origin: 20, f_p1: -20, f_p2: -20 });
  });

  it('act 5 (guided): K = 10 (not 2000, 100 or 20); +20 dB/dec through (1, 20 dB); plateau 26.02; 23.01 dB at 2 and 100; ω0 = √200 ≈ 14.14', () => {
    expect(kOf(RAW.guided)).toBe(10);
    close(20 * Math.log10(200), 46.02, 2); // intercept A: "高出整整 46 dB"
    close(totalAsymDb(GUIDED, 1), 20, 9);
    close(totalAsymDb(GUIDED, 0.1), 0, 9);
    close(totalAsymDb(GUIDED, 2), 26.02);
    close(totalAsymDb(GUIDED, 100), 26.02);
    close(totalAsymDb(GUIDED, 1000), 6.02);
    for (const w of [2, 100]) {
      close(totalDb(GUIDED, w), 23.01);
      close(totalDb(GUIDED, w) - totalAsymDb(GUIDED, w), -3.01);
    }
    // the other pole adds only 0.002 dB at each corner (the sheet's figure label 23.01 dB)
    close(-10 * Math.log10(1 + (2 / 100) ** 2), -0.0017, 4);
    const w0 = Math.sqrt(200);
    close(w0, 14.14, 2);
    close(totalPhase(GUIDED, w0), 0, 9);
    close(totalAsymPhase(GUIDED, 0.01), 90, 9);
    close(totalAsymPhase(GUIDED, 1e4), -90, 9);
    // the poles' phase ramps run over [0.2, 20] and [10, 1000]
    const s = segments(GUIDED, 0.01, 1e4);
    expect(s.map((r) => Number(r.lo.toPrecision(6)))).toEqual([0.01, 0.2, 2, 10, 20, 100, 1000]);
    expect(s.map((r) => r.magTotal)).toEqual([20, 20, 0, 0, 0, -20, -20]);
    expect(s.map((r) => r.phaseTotal)).toEqual([0, -45, -45, -90, -45, -45, 0]);
    // the arithmetic mean of option C is not the 0° point
    expect(Math.abs(totalPhase(GUIDED, 51))).toBeGreaterThan(20);
  });

  it('quiz: Q1 1/√2 → P/2, −3.01 dB; Q2 K = 5 (+13.98 dB), the wrong ones 50 / 10 / 1.25; Q3 pole at 10, zero at 100', () => {
    close(Math.SQRT1_2 ** 2, 0.5, 12);
    close(dbOfRatio(0.5), -6.02, 2);
    close((50 * 4) / (2 * 20), 5, 12);
    close(dbOfRatio(5), 13.98, 2);
    close(dbOfRatio(50), 33.98, 2);
    close(dbOfRatio(1.25), 1.94, 2);
    close((50 * 4) / 20, 10, 12);
    close(50 / (2 * 20), 1.25, 12);
    const q3: Factor[] = [
      { id: 'p', kind: 'real', n: -1, w: 10 },
      { id: 'z', kind: 'real', n: 1, w: 100 },
    ];
    expect(
      segments(q3, 1, 1e4)
        .filter((r) => [1, 10, 100].includes(Number(r.lo.toPrecision(6))))
        .map((r) => r.magTotal),
    ).toEqual([0, -20, 0]);
  });
});
