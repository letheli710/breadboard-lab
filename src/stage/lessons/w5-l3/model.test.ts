import { describe, expect, it } from 'vitest';
import { abs, act1, add, argDeg, cx, div, ex1, ex2, guided, mul, pol, polar, rect, solve, sourcePhasor, sub, type Cx } from './model';

/** a complex number equals re + j·im */
function eq(z: Cx, re: number, im: number, digits = 10) {
  expect(z.re).toBeCloseTo(re, digits);
  expect(z.im).toBeCloseTo(im, digits);
}
/** magnitude and angle (degrees) to the sheet's printed precision */
function polEq(z: Cx, m: number, deg: number, dm = 2, dd = 2) {
  expect(abs(z)).toBeCloseTo(m, dm);
  expect(argDeg(z)).toBeCloseTo(deg, dd);
}

describe('W5-L3 complex solver', () => {
  it('solves a 3 × 3 complex system and pivots past a zero', () => {
    const A = [
      [cx(0), cx(1, 1), cx(2)],
      [cx(1), cx(0, -1), cx(0)],
      [cx(3, 2), cx(1), cx(-1, 1)],
    ];
    const x = [cx(1, -2), cx(0.5, 3), cx(-4, 1)];
    const b = A.map((r) => r.reduce((s, a, j) => ({ re: s.re + mul(a, x[j]).re, im: s.im + mul(a, x[j]).im }), cx(0)));
    const y = solve(A, b);
    y.forEach((v, i) => eq(v, x[i].re, x[i].im, 12));
  });

  it('sin → cos reference and rectangular ↔ polar', () => {
    eq(sourcePhasor(4, 0, 'sin'), 0, -4); // 4 sin(5t) → 4∠−90° = −j4
    eq(sourcePhasor(6, 0, 'sin'), 0, -6); // 6 sin(100t) → −j6
    polEq(sourcePhasor(12, 30, 'sin'), 12, -60); // quiz 1: 12 sin(200t + 30°) → 12∠−60°
    polEq(cx(-2, -4), 4.47, -116.57); // third quadrant: −180° + arctan 2
    expect(pol(cx(-12, -24))).toBe('26.83∠−116.57°');
    expect(rect(cx(1, 1))).toBe('1 + j');
    expect(rect(cx(0, -4))).toBe('−j4');
    expect(rect(cx(24, -12))).toBe('24 − j12');
  });
});

describe('W5-L3 sheet numbers', () => {
  it('act 1: Z_L = j10, Z_C = −j20, Y = 0.05 − j0.05 = 0.07071∠−45° S, V = 100√2∠75° V', () => {
    const r = act1(100);
    polEq(r.Is, 10, 30);
    eq(r.ZL, 0, 10);
    eq(r.ZC, 0, -20);
    eq(r.Y, 0.05, -0.05);
    polEq(r.Y, 0.07071, -45, 5);
    expect(abs(r.Y)).toBeCloseTo(0.05 * Math.SQRT2, 12);
    polEq(r.V, 141.42, 75);
    expect(abs(r.V)).toBeCloseTo(100 * Math.SQRT2, 9);
    expect(r.res).toBeLessThan(1e-12);
    // at resonance (ω0 = 1/√(LC) ≈ 141.4 rad/s) only R is left: V = 20 × 10∠30°
    const w0 = 1 / Math.sqrt(0.1 * 5e-4);
    polEq(act1(w0).V, 200, 30, 6, 6);
  });

  it('act 2 (example 1): Z_C = −j4, Z_L = j2; ×4 system [1+j, −1; −3, 3−j2]·V = [20; 0]', () => {
    const r = ex1();
    eq(r.Is, 5, 0);
    eq(r.ZC, 0, -4);
    eq(r.ZL, 0, 2);
    eq(r.A4[0][0], 1, 1);
    eq(r.A4[0][1], -1, 0);
    eq(r.A4[1][0], -3, 0);
    eq(r.A4[1][1], 3, -2);
    eq(r.b4[0], 20, 0);
    eq(r.b4[1], 0, 0);
  });

  it('act 2: Δ = 2 + j = √5∠26.57°, Δ1 = 60 − j40 ≈ 72.1110∠−33.69°, Δ2 = 60', () => {
    const r = ex1();
    eq(r.D, 2, 1);
    polEq(r.D, 2.2361, 26.57, 4);
    expect(abs(r.D)).toBeCloseTo(Math.sqrt(5), 12);
    eq(r.D1, 60, -40);
    polEq(r.D1, 72.111, -33.69, 3);
    eq(r.D2, 60, 0);
  });

  it('act 2: V1 = 16 − j28 = 32.25∠−60.26°, V2 = 24 − j12 = 26.83∠−26.57°, Ix = −2 − j4 = 4.47∠−116.57°', () => {
    const r = ex1();
    eq(r.V1, 16, -28);
    polEq(r.V1, 32.25, -60.26);
    eq(r.V2, 24, -12);
    polEq(r.V2, 26.83, -26.57);
    eq(r.Ix, -2, -4);
    polEq(r.Ix, 4.47, -116.57);
    // Cramer agrees with the solver, both ways the sheet divides
    eq(div(r.D1, r.D), 16, -28);
    eq(div(r.D2, r.D), 24, -12);
    const p = polar(72.111 / 2.2361, -33.69 - 26.57);
    expect(abs(sub(p, r.V1))).toBeLessThan(0.01);
    expect(r.res).toBeLessThan(1e-12);
  });

  it('act 3 (example 2): Is = −j4, Z1 = 4 + j2, Z2 = 2 − j4; Z2·Is = −16 − j8; Vs − Z2·Is = 36 + j8', () => {
    const r = ex2();
    eq(r.Vs, 20, 0);
    eq(r.Is, 0, -4);
    eq(r.ZL, 0, 2);
    eq(r.ZC, 0, -4);
    eq(r.Z1, 4, 2);
    eq(r.Z2, 2, -4);
    eq(mul(r.Z2, r.Is), -16, -8);
    eq(sub(r.Vs, mul(r.Z2, r.Is)), 36, 8);
    polEq(cx(36, 8), 36.8782, 12.53, 4);
    polEq(cx(6, -2), 6.3246, -18.43, 4);
  });

  it('act 3: I1 = 5 + j3 = 5.83∠30.96°, I2 = 5 − j1 = 5.10∠−11.31°; Cramer Δ = 6 − j2, Δ1 = 36 + j8, Δ2 = 28 − j16', () => {
    const r = ex2();
    eq(r.I1, 5, 3);
    polEq(r.I1, 5.83, 30.96);
    eq(r.I2, 5, -1);
    polEq(r.I2, 5.1, -11.31);
    eq(r.D, 6, -2);
    eq(r.D1, 36, 8);
    eq(r.D2, 28, -16);
    eq(div(r.D2, r.D), 5, -1);
    expect(r.res).toBeLessThan(1e-12);
    // supermesh KVL and the constraint, as the sheet checks them
    expect(abs(sub(add(mul(r.Z1, r.I1), mul(r.Z2, r.I2)), r.Vs))).toBeLessThan(1e-12);
    expect(abs(sub(sub(r.I2, r.I1), r.Is))).toBeLessThan(1e-12);
  });

  it('guided (act 4): Is = −j6, Z_C = −j10, Z_L = j10; ×10 system (1 + j)V1 − jV2 = −j60, −jV1 + V2 = 0', () => {
    const r = guided();
    eq(r.Is, 0, -6);
    eq(r.ZC, 0, -10);
    eq(r.ZL, 0, 10);
    eq(r.A10[0][0], 1, 1);
    eq(r.A10[0][1], 0, -1);
    eq(r.A10[1][0], 0, -1);
    eq(r.A10[1][1], 1, 0); // +j0.1 and −j0.1 cancel at node 2
    eq(r.b10[0], 0, -60);
    eq(r.b10[1], 0, 0);
  });

  it('guided: V2 = jV1, (2 + j)V1 = −j60, V1 = −12 − j24 = 26.83∠−116.57°, V2 = 24 − j12 = 26.83∠−26.57°', () => {
    const r = guided();
    eq(div(r.V2, r.V1), 0, 1);
    eq(mul(cx(2, 1), r.V1), 0, -60);
    eq(r.V1, -12, -24);
    polEq(r.V1, 26.83, -116.57);
    eq(r.V2, 24, -12);
    polEq(r.V2, 26.83, -26.57);
    expect(r.res).toBeLessThan(1e-12);
    // the wrong options are what their intercepts say: step 3 (1 + j2) forgets j·j = −1 …
    expect(abs(sub(mul(cx(1, 1), r.V1), mul(cx(0, 1), r.V2)))).toBeCloseTo(60, 9);
    // … step 4 option (12 − j24) and its V2 = j(12 − j24) = 24 + j12 are consistent but wrong
    eq(mul(cx(0, 1), cx(12, -24)), 24, 12);
    polEq(cx(12, -24), 26.83, -63.43);
    polEq(cx(-24, -12), 26.83, -153.43);
  });

  it('quiz: Z_C at 200 rad/s, 250 μF = −j20 (its admittance j0.05); Q4 fraction (36 + j8)/(6 − j2) = 5 + j3', () => {
    const zc = div(cx(1), cx(0, 200 * 250e-6));
    eq(zc, 0, -20);
    eq(div(cx(36, 8), cx(6, -2)), 5, 3);
  });
});
