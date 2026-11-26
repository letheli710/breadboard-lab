import { describe, expect, it } from 'vitest';
import { EX51, gainClosedForm, num, openLoop, pct, relErr, sci, si, solveIdeal, solveReal, v1ClosedForm } from './model';

describe('W3-L2 · Example 5.1 (real 741, Fig. 5.6b)', () => {
  const s = solveReal(EX51);

  it('the nodal solution matches the sheet’s closed forms', () => {
    expect(s.gain).toBeCloseTo(gainClosedForm(EX51), 12);
    expect(s.v1 / EX51.vs).toBeCloseTo(v1ClosedForm(EX51), 12);
    // other values too: the closed form is the solution of the two KCL rows in general
    const p = { A: 37, Ri: 1234, Ro: 77, R1: 555, Rf: 999, vs: 1 };
    expect(solveReal(p).gain).toBeCloseTo(gainClosedForm(p), 12);
    expect(solveReal(p).v1).toBeCloseTo(v1ClosedForm(p), 12);
  });

  it('numerator, denominator and the exact fraction (act 1, ③ step 1)', () => {
    const A = 200000n,
      Ri = 2000000n,
      Ro = 50n,
      R1 = 10000n,
      Rf = 20000n;
    const numr = A * R1 * Ri + A * Rf * Ri + R1 * Ro;
    const den = A * R1 * Ri + R1 * Rf + R1 * Ri + R1 * Ro + Rf * Ri + Ri * Ro;
    expect(numr).toBe(12_000_000_000_500_000n);
    expect(R1 * Rf + R1 * Ri + Rf * Ri + Ri * Ro).toBe(60_300_000_000n);
    expect(den).toBe(4_000_060_300_500_000n);
    expect(numr / 500000n).toBe(24_000_000_001n);
    expect(den / 500000n).toBe(8_000_120_601n);
    expect(numr % 500000n).toBe(0n);
    expect(den % 500000n).toBe(0n);
    expect(24000000001 / 8000120601).toBeCloseTo(2.9999547754, 9);
  });

  it('vₛ = 2 V: vₒ, v₁, v_d, i₁, i and i_Rf (act 1, ③ step 2)', () => {
    expect(s.gain).toBeCloseTo(2.9999547754, 9);
    expect(s.vo).toBeCloseTo(5.99990955, 7);
    expect(s.v1).toBeCloseTo(1.99996995, 7);
    expect(s.vd * 1e6).toBeCloseTo(30.049547, 5);
    expect(s.i1 * 1e12).toBeCloseTo(-15.024773, 5);
    expect(s.i * 1e3).toBeCloseTo(0.199997, 6);
    expect(s.iRf * 1e3).toBeCloseTo(0.199997, 6);
    // i_Rf − i = −i₁: the 15 pA that leaks into the inverting input
    expect(s.iRf - s.i).toBeCloseTo(s.i1, 16);
    // no load: the VCVS drives exactly the feedback current
    expect(s.io).toBeCloseTo(s.iRf, 12);
  });

  it('the professor’s comparisons', () => {
    expect(pct(relErr(s.gain, 3))).toBe('0.001507%');
    expect(relErr(s.gain, 3)).toBeLessThan(0.00002); // “0.002% 以内”
    expect(pct(relErr(s.v1, 2))).toBe('0.001502%');
    expect(pct(relErr(s.i, 2e-4))).toBe('0.001502%');
    expect(s.i / Math.abs(s.i1)).toBeGreaterThan(1e7); // 一千万倍以上
    expect(Number((s.i / Math.abs(s.i1)).toPrecision(2))).toBe(1.3e7);
    expect(0.01 / relErr(s.gain, 3)).toBeGreaterThan(600); // 1% resistor: ≈ 663×
  });

  it('ideal limit: 1 + R_f/R₁; the error shrinks with A (layer 01 slider)', () => {
    expect(gainClosedForm({ ...EX51, A: 1e12, Ri: 1e15, Ro: 1e-6 })).toBeCloseTo(3, 9);
    expect(relErr(gainClosedForm({ ...EX51, A: 100 }), 3)).toBeCloseTo(0.0293, 3); // “约 3%”
    expect(relErr(gainClosedForm({ ...EX51, A: 1e7 }), 3)).toBeLessThan(1e-6);
  });

  it('with a load the real output barely moves (Rₒ = 50 Ω inside the loop)', () => {
    const r = solveReal({ ...EX51, RL: 3000 });
    expect(r.vo).toBeCloseTo(5.9999, 3);
    expect(r.io * 1e3).toBeCloseTo(2.2, 3);
    expect(r.io).toBeCloseTo(r.iRf + r.iL, 10);
  });
});

describe('W3-L2 · Example 5.2 (ideal op amp, Fig. 5.9) and the output-node KCL', () => {
  it('gain 3, vₒ = 6 V, iₒ = i = 0.2 mA', () => {
    const s = solveIdeal({ R1: 1e4, Rf: 2e4, vs: 2 });
    expect(s.gain).toBe(3);
    expect(s.vo).toBe(6);
    expect(s.v1).toBe(2);
    expect(s.i).toBeCloseTo(2e-4, 12);
    expect(s.io).toBeCloseTo(2e-4, 12);
    expect(s.io).toBeCloseTo(2 / 1e4, 12); // cross-check iₒ = vₛ / R₁
  });

  it('act 3 ③: a 2 kΩ load leaves vₒ = 6 V, iₒ = 0.2 + 3.0 = 3.2 mA', () => {
    const s = solveIdeal({ R1: 1e4, Rf: 2e4, vs: 2, RL: 2000 });
    expect(s.vo).toBe(6);
    expect(s.iL * 1e3).toBeCloseTo(3, 12);
    expect(s.io * 1e3).toBeCloseTo(3.2, 12);
  });

  it('quiz Q4: a 3 kΩ load: vₒ = 6 V (inside ±15 V), iₒ = 0.2 + 2.0 = 2.2 mA', () => {
    const s = solveIdeal({ R1: 1e4, Rf: 2e4, vs: 2, RL: 3000 });
    expect(s.vo).toBe(6);
    expect(Math.abs(s.vo)).toBeLessThan(15);
    expect(s.io * 1e3).toBeCloseTo(2.2, 12);
  });

  it('error of the ideal model against the 741 (layer 03, 0.0015%)', () => {
    const real = solveReal(EX51);
    const ideal = solveIdeal({ R1: 1e4, Rf: 2e4, vs: 2 });
    expect(pct(relErr(real.vo, ideal.vo), 2)).toBe('0.0015%');
    expect(pct(relErr(real.io, ideal.io), 2)).toBe('0.0015%');
  });
});

describe('W3-L2 · open loop (Fig. 5.8 right panel, quiz Q1)', () => {
  it('2×10⁵ × 1 mV = 200 V: clamped at +15 V', () => {
    const r = openLoop(2e5, 0, 1e-3);
    expect(r.linear).toBeCloseTo(200, 9);
    expect(r.vo).toBe(15);
    expect(r.saturated).toBe(true);
  });
  it('+0.5 mV on the + input, no feedback: +15 V', () => {
    expect(openLoop(2e5, 0, 0.5e-3).vo).toBe(15);
    expect(openLoop(2e5, 0.5e-3, 0).vo).toBe(-15);
  });
});

describe('W3-L2 · formatting', () => {
  it('SI prefixes and powers of ten', () => {
    expect(si(30.049547e-6, 'V')).toBe('30.05 μV');
    expect(si(-15.024773e-12, 'A')).toBe('−15.02 pA');
    expect(si(0.000199997, 'A', 6)).toBe('199.997 μA');
    expect(si(2e-4, 'A')).toBe('200 μA');
    expect(si(6, 'V')).toBe('6 V');
    expect(num(2.9999547754, 7)).toBe('2.999955');
    expect(sci(2e5)).toBe('2×10⁵');
    expect(sci(1e7)).toBe('10⁷');
    expect(sci(100)).toBe('10²');
  });
});
