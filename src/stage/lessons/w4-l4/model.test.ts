import { describe, expect, it } from 'vitest';
import { decay, energy, integrate, LAB, NET, par, parallelShare, rc, rl, RL_EX, solveNet, TAU_TABLE, tangent } from './model';

const close = (x: number, y: number, d = 9) => expect(x).toBeCloseTo(y, d);

describe('W4-L4 source-free RC / RL numbers (lesson sheet)', () => {
  it('act 2 ③: 5 V, 10 kΩ, 100 µF → τ = 1 s, I0 = 0.5 mA, P0 = 2.5 mW ≪ 250 mW, w_C(0) = 1.25 mJ', () => {
    const a = rc(LAB.v0, LAB.r, LAB.c);
    close(a.tau, 1);
    close(a.i0, 0.5e-3);
    close(a.p0, 2.5e-3);
    expect(a.p0).toBeLessThan(0.25 / 50);
    close(a.w0, 1.25e-3);
  });

  it('act 2 ③: v(1 s) ≈ 1.8394 V, v(5 s) ≈ 0.0337 V; i_R(t) = 0.5 e^(−t) mA', () => {
    const a = rc(LAB.v0, LAB.r, LAB.c);
    expect(a.v(1).toFixed(4)).toBe('1.8394');
    expect(a.v(5).toFixed(4)).toBe('0.0337');
    close(a.i(2), 0.5e-3 * Math.exp(-2));
  });

  it('act 2 ②: ∫p_R dt over [0, t] = ½CV0²(1 − e^(−2t/τ)); over [0, ∞) it is w_C(0); 86.47 % at 1τ', () => {
    const a = rc(LAB.v0, LAB.r, LAB.c);
    const p = (t: number) => a.v(t) ** 2 / LAB.r;
    close(integrate(p, 0, 1.3), a.wR(1.3), 12);
    close(integrate(p, 0, 40), a.w0, 10);
    expect((a.wR(1) / a.w0) * 100).toBeCloseTo(86.47, 2);
    close(energy(1, 1, 1).heat, 1 - Math.exp(-2));
  });

  it('act 3: the t = 0 tangent reaches zero at t = τ; at τ the curve keeps e^(−1) = 36.79 %', () => {
    close(tangent(5, 1, 1), 0);
    close(tangent(5, 0.9, 0.9), 0);
    expect((decay(1, 1, 1) * 100).toFixed(2)).toBe('36.79');
    // the slope at 0 is −V0/τ
    const h = 1e-6;
    expect((decay(5, 2, h) - decay(5, 2, 0)) / h).toBeCloseTo(-2.5, 4);
  });

  it('act 3 table: left / gone / energy dissipated after 0 … 5 τ', () => {
    const pct = (x: number) => (x * 100).toFixed(2);
    expect(TAU_TABLE.map((r) => pct(r.left))).toEqual(['100.00', '36.79', '13.53', '4.98', '1.83', '0.67']);
    expect(TAU_TABLE.map((r) => pct(r.gone))).toEqual(['0.00', '63.21', '86.47', '95.02', '98.17', '99.33']);
    expect(TAU_TABLE.map((r) => pct(r.heat))).toEqual(['0.00', '86.47', '98.17', '99.75', '99.97', '100.00']);
  });

  it('fig. 3-1: the polyline y = 250 − 190 e^(−u) passes 180.1 at 1τ and 248.7 at 5τ', () => {
    expect((250 - 190 * Math.exp(-1)).toFixed(1)).toBe('180.1');
    expect((250 - 190 * Math.exp(-2)).toFixed(1)).toBe('224.3');
    expect((250 - 190 * Math.exp(-5)).toFixed(1)).toBe('248.7');
  });

  it('act 4 ③: L = 0.5 H, R = 10 Ω, I0 = 2 A → τ = 50 ms, w_L(0) = 1 J, i(0.1 s) ≈ 0.2707 A, I0²R = 40 W', () => {
    const a = rl(RL_EX.i0, RL_EX.l, RL_EX.r);
    close(a.tau, 0.05);
    close(a.w0, 1);
    expect(a.i(0.1).toFixed(4)).toBe('0.2707');
    close(a.p0, 40);
    close(
      integrate((t) => a.i(t) ** 2 * RL_EX.r, 0, 2),
      a.w0,
      7,
    );
  });

  it('act 5 / guided example: v_A(0⁻) = 12 V, V0 = 6 V, R_Th = 4.5 Ω, τ = 0.9 s, v_R2 = 4 e^(−t/0.9)', () => {
    const s = solveNet(NET);
    close(s.rRight, 6);
    close(s.vA0, 12);
    close(s.v0, 6);
    close(s.r23, 18);
    close(s.rth, 4.5);
    close(s.tau, 0.9);
    close(s.k2, 2 / 3);
    close(s.vR2at0p, 4);
    close(s.vR2(-0.01), 12);
    close(s.vR2(0.9), 4 * Math.exp(-1));
    // the currents at t = 0⁻: 2 A through R1, 1 A through R2 and 1 A through R3–R4
    close(s.i1, 2);
    close(s.iR2, 1);
    close(s.iR34, 1);
  });

  it('act 5: W0 = 3.6 J = 2.7 + 0.6 + 0.3 J (75 / 16.67 / 8.33 %), checked against ∫v²/R dt', () => {
    const s = solveNet(NET);
    close(s.w0, 3.6);
    close(s.wR4, 2.7);
    close(s.wR2, 0.6);
    close(s.wR3, 0.3);
    close(s.wR4 + s.wR2 + s.wR3, s.w0);
    expect([s.wR4, s.wR2, s.wR3].map((w) => ((w / s.w0) * 100).toFixed(2))).toEqual(['75.00', '16.67', '8.33']);
    close(
      integrate((t) => s.vC(t) ** 2 / NET.r4, 0, 40),
      2.7,
      6,
    );
    close(
      integrate((t) => (s.vC(t) / s.r23) ** 2 * NET.r2, 0, 40),
      0.6,
      6,
    );
    // ∫e^(−2t/τ) dt = τ/2, not τ (the step-5 mistake doubles the heat to 7.2 J)
    close(
      integrate((t) => Math.exp((-2 * t) / s.tau), 0, 40),
      s.tau / 2,
      6,
    );
    close((s.v0 ** 2 / s.rth) * s.tau, 7.2);
  });

  it('breadboard safety: the theory network peaks at 1.33 A and 6 W in R4; the lab scale 2000× keeps τ ≈ 1 s', () => {
    const s = solveNet(NET);
    expect(s.iPeak.toFixed(3)).toBe('1.333');
    close(s.pR4Peak, 6);
    close(s.rth * 2000 * (NET.c / 2000), s.tau);
    close(4.5 * 2000 * (0.2 / 2000), 0.9);
    close(4.5 * 2000, 9000);
    close(0.2 / 2000, 100e-6);
  });

  it('fig. 6-1: 5 e^(−t) at 0 / 1 / 2 / 5 s = 5.00 / 1.84 / 0.68 / 0.034 V', () => {
    expect([0, 1, 2, 5].map((t) => decay(5, 1, t).toFixed(2))).toEqual(['5.00', '1.84', '0.68', '0.03']);
    expect(decay(5, 1, 5).toFixed(3)).toBe('0.034');
  });

  it('self-test: e^(−2) = 13.53 %; τ = 40 mH / 20 Ω = 2 ms; 2R doubles RC, halves L/R; Ra takes 3/4 of 8 mJ', () => {
    expect((Math.exp(-2) * 100).toFixed(2)).toBe('13.53');
    close(rl(1, 0.04, 8 + 12).tau, 0.002);
    // the wrong options: 40 mH / 8 Ω = 5 ms, L·R = 0.8, 40 mH / (8 ∥ 12) = 8.33 ms
    close(0.04 / 8, 0.005);
    close(0.04 * 20, 0.8);
    expect(((0.04 / par(8, 12)) * 1000).toFixed(1)).toBe('8.3');
    close(rc(1, 2, 1).tau / rc(1, 1, 1).tau, 2);
    close(rl(1, 1, 2).tau / rl(1, 1, 1).tau, 0.5);
    close(8 * parallelShare(10e3, [30e3]), 6);
    close(8 * parallelShare(30e3, [10e3]), 2);
  });
});
