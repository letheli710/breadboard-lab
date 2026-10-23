// Tests for the second batch of quantities (energy, derivatives, natural frequencies, value,
// wattmeter, per-question frequency, cutoff / bandwidth / Q) and the capacitor-loop / cut-set fix.
import { describe, expect, it } from 'vitest';
import type { Analysis, Find } from '../problem/types';
import { computeQuantity } from './index';
import { net, type Spec } from './testutil';

const DC: Analysis = { type: 'dc' };
const TRAN: Analysis = { type: 'tran' };
const q = (specs: Spec[], an: Analysis, find: Find) => computeQuantity(net(specs), an, find);
function close(actual: number, expected: number, rel = 1e-6) {
  const tol = rel * Math.max(Math.abs(expected), 1e-9);
  if (!(Math.abs(actual - expected) <= tol)) throw new Error(`expected ${expected}, got ${actual}`);
}
const step = (after: number, before = 0) => ({ step: { before, after } });

describe('capacitor loops + capacitor-only nodes (and inductor duals)', () => {
  // 12 V step → 1k → a; C1 a–b; C2 ∥ C3 from b to ground. Ceq = 2µ·4µ/6µ
  const series: Spec[] = [
    { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: step(12) },
    { ref: 'R', type: 'R', nodes: ['s', 'a'], value: '1k' },
    { ref: 'C1', type: 'C', nodes: ['a', 'b'], value: '2u' },
    { ref: 'C2', type: 'C', nodes: ['b', '0'], value: '1u' },
    { ref: 'C3', type: 'C', nodes: ['b', '0'], value: '3u' },
  ];
  it('C1 in series with C2 ∥ C3: tau, inf, t, single root', () => {
    close(q(series, TRAN, { kind: 'tau' }), 1e3 * (4e-6 / 3));
    close(q(series, TRAN, { kind: 'v', el: 'C1', t: 'inf' }), 8);
    close(q(series, TRAN, { kind: 'v', el: 'C2', t: 'inf' }), 4);
    close(q(series, TRAN, { kind: 'v', el: 'C2', t: 1e-3 }), 4 * (1 - Math.exp(-0.75)), 1e-6);
    close(q(series, TRAN, { kind: 'root', n: 1 }), -750);
    expect(() => q(series, TRAN, { kind: 'root', n: 2 })).toThrow(/n must be 1…1/);
  });
  it('C3 across the series pair C1–C2', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: step(12) },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: '1k' },
      { ref: 'C1', type: 'C', nodes: ['a', 'b'], value: '2u' },
      { ref: 'C2', type: 'C', nodes: ['b', '0'], value: '1u' },
      { ref: 'C3', type: 'C', nodes: ['a', '0'], value: '3u' },
    ];
    close(q(d, TRAN, { kind: 'tau' }), 1e3 * (3e-6 + 2e-6 / 3));
    close(q(d, TRAN, { kind: 'v', el: 'C1', t: 'inf' }), 4);
    close(q(d, TRAN, { kind: 'v', el: 'C2', t: 'inf' }), 8);
  });
  it('a pre-charged capacitor-only node keeps its charge to t = inf', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: step(12) },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: '1k' },
      { ref: 'C1', type: 'C', nodes: ['a', 'b'], value: '2u', ic: 3 },
      { ref: 'C2', type: 'C', nodes: ['b', '0'], value: '2u', ic: 0 },
    ];
    // q_b = −C1·3 + C2·0 = −6µ ; v1 + v2 = 12, −2v1 + 2v2 = −6 → v1 = 7.5, v2 = 4.5
    close(q(d, TRAN, { kind: 'v', el: 'C1', t: 'inf' }), 7.5);
    close(q(d, TRAN, { kind: 'v', el: 'C2', t: 'inf' }), 4.5);
  });
  it('inductor dual: L1 in series with L2 ∥ L3', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: step(12) },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 2 },
      { ref: 'L1', type: 'L', nodes: ['a', 'b'], value: 1 },
      { ref: 'L2', type: 'L', nodes: ['b', '0'], value: 1 },
      { ref: 'L3', type: 'L', nodes: ['b', '0'], value: 3 },
    ];
    close(q(d, TRAN, { kind: 'tau' }), 1.75 / 2);
    close(q(d, TRAN, { kind: 'i', el: 'L2', t: 'inf' }), 4.5);
    close(q(d, TRAN, { kind: 'i', el: 'L3', t: 'inf' }), 1.5);
    close(q(d, TRAN, { kind: 'i', el: 'L2', t: 0.5 }), 4.5 * (1 - Math.exp(-0.5 / 0.875)), 1e-6);
  });
  it('inductor loop with initial flux keeps it to t = inf', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: step(0, 0) },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 2 },
      { ref: 'L1', type: 'L', nodes: ['a', '0'], value: 1, ic: 2 },
      { ref: 'L2', type: 'L', nodes: ['a', '0'], value: 1, ic: 0 },
    ];
    // loop flux L1 i1 − L2 i2 = 2 conserved, final i1 + i2 = 0 → i1 = 1, i2 = −1
    close(q(d, TRAN, { kind: 'i', el: 'L1', t: 'inf' }), 1);
    close(q(d, TRAN, { kind: 'i', el: 'L2', t: 'inf' }), -1);
  });
});

describe('stored energy w', () => {
  it('capacitor in transient and DC', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: step(10) },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: '1k' },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: '1u' },
    ];
    close(q(d, TRAN, { kind: 'w', el: 'C', t: 'inf' }), 0.5e-6 * 100);
    close(q(d, TRAN, { kind: 'w', el: 'C', t: 1e-3 }), 0.5e-6 * (10 * (1 - Math.exp(-1))) ** 2);
    close(q(d, DC, { kind: 'w', el: 'C' }), 5e-5);
  });
  it('inductors and a coupled pair (DC)', () => {
    const d: Spec[] = [
      { ref: 'V', type: 'V', nodes: ['s', '0'], value: 10 },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 5 },
      { ref: 'L1', type: 'L', nodes: ['a', 'm'], value: 1 },
      { ref: 'L2', type: 'L', nodes: ['m', '0'], value: 2 },
      { ref: 'K1', type: 'K', l1: 'L1', l2: 'L2', M: 0.5 },
    ];
    close(q(d, DC, { kind: 'w', el: 'L1' }), 2);
    close(q(d, DC, { kind: 'w', el: 'L2' }), 4);
    close(q(d, DC, { kind: 'w', el: 'K1' }), 8); // 2 + 4 + 0.5·2·2
    expect(() => q(d, DC, { kind: 'w', el: 'R' })).toThrow(/not a capacitor/);
    expect(() => q(d, { type: 'ac', omega: 1 }, { kind: 'w', el: 'L1' })).toThrow(/DC and transient/);
  });
});

describe('time derivatives', () => {
  const rc: Spec[] = [
    { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: step(10) },
    { ref: 'R', type: 'R', nodes: ['s', 'a'], value: '1k' },
    { ref: 'C', type: 'C', nodes: ['a', '0'], value: '1u' },
  ];
  it('RC: du_C/dt and di/dt at 0+, t, 0-, inf', () => {
    close(q(rc, TRAN, { kind: 'v', el: 'C', t: '0+', deriv: 1 }), 1e4); // i_C(0+)/C
    close(q(rc, TRAN, { kind: 'v', el: 'C', t: 1e-3, deriv: 1 }), 1e4 * Math.exp(-1));
    close(q(rc, TRAN, { kind: 'i', el: 'C', t: '0+', deriv: 1 }), -0.01 / 1e-3);
    close(q(rc, TRAN, { kind: 'v', el: 'C', t: '0-', deriv: 1 }), 0);
    close(q(rc, TRAN, { kind: 'v', el: 'C', t: 'inf', deriv: 1 }), 0);
  });
  it('RL: di_L/dt(0+) = u_L(0+)/L', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: step(12) },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 4 },
      { ref: 'L', type: 'L', nodes: ['a', '0'], value: 2 },
    ];
    close(q(d, TRAN, { kind: 'i', el: 'L', t: '0+', deriv: 1 }), 6);
  });
  it('underdamped RLC: du_C/dt = i_L/C', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: step(1) },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 2 },
      { ref: 'L', type: 'L', nodes: ['a', 'b'], value: 1 },
      { ref: 'C', type: 'C', nodes: ['b', '0'], value: 0.25 },
    ];
    const w = Math.sqrt(3);
    const iL = (t: number) => 0.25 * (4 / w) * Math.exp(-t) * Math.sin(w * t);
    close(q(d, TRAN, { kind: 'v', el: 'C', t: 1, deriv: 1 }), iL(1) / 0.25, 1e-8);
    close(q(d, TRAN, { kind: 'i', el: 'L', t: '0+', deriv: 1 }), 1); // u_L(0+) = 1 V
  });
  it('sinusoidal steady state before t = 0', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { sin: { amp: 1, freq: 1 / (2 * Math.PI) } } },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 1 },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: 1 },
    ];
    close(q(d, TRAN, { kind: 'v', el: 'C', t: '0-', deriv: 1 }), Math.cos(-Math.PI / 4) / Math.SQRT2);
    close(q(d, TRAN, { kind: 'v', el: 'C', t: 2, deriv: 1 }), Math.cos(2 - Math.PI / 4) / Math.SQRT2, 1e-8);
  });
  it('deriv is rejected outside transient v/i', () => {
    expect(() => q(rc, DC, { kind: 'v', el: 'C', deriv: 1 })).toThrow(/deriv/);
    expect(() => q(rc, TRAN, { kind: 'p', el: 'C', t: 1, deriv: 1 } as Find)).toThrow(/deriv/);
  });
});

describe('natural frequencies: root, alpha, omega_d, omega0', () => {
  const rlc = (R: number): Spec[] => [
    { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: step(1) },
    { ref: 'R', type: 'R', nodes: ['s', 'a'], value: R },
    { ref: 'L', type: 'L', nodes: ['a', 'b'], value: 1 },
    { ref: 'C', type: 'C', nodes: ['b', '0'], value: 0.25 },
  ];
  it('underdamped series RLC (s = −1 ± j√3)', () => {
    close(q(rlc(2), TRAN, { kind: 'root', n: 1 }), -1);
    close(q(rlc(2), TRAN, { kind: 'root', n: 1, part: 'im' }), Math.sqrt(3));
    close(q(rlc(2), TRAN, { kind: 'root', n: 2, part: 'im' }), -Math.sqrt(3));
    close(q(rlc(2), TRAN, { kind: 'root', n: 1, part: 'mag' }), 2);
    close(q(rlc(2), TRAN, { kind: 'alpha' }), 1);
    close(q(rlc(2), TRAN, { kind: 'omega_d' }), Math.sqrt(3));
    close(q(rlc(2), TRAN, { kind: 'omega0' }), 2);
  });
  it('overdamped (−1, −4) and critically damped (−2, −2)', () => {
    close(q(rlc(5), TRAN, { kind: 'root', n: 1 }), -1);
    close(q(rlc(5), TRAN, { kind: 'root', n: 2 }), -4);
    close(q(rlc(5), TRAN, { kind: 'alpha' }), 2.5);
    close(q(rlc(5), TRAN, { kind: 'omega0' }), 2);
    expect(() => q(rlc(5), TRAN, { kind: 'omega_d' })).toThrow(/real/);
    close(q(rlc(4), TRAN, { kind: 'alpha' }), 2, 1e-6);
    close(q(rlc(4), TRAN, { kind: 'omega0' }), 2, 1e-6);
  });
  it('parallel GCL natural response', () => {
    // I source, R = 1/G, L, C in parallel: α = G/(2C), ω0 = 1/√(LC)
    const d: Spec[] = [
      { ref: 'Is', type: 'I', nodes: ['0', 'a'], value: step(1) },
      { ref: 'R', type: 'R', nodes: ['a', '0'], value: 10 },
      { ref: 'L', type: 'L', nodes: ['a', '0'], value: '10m' },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: '100u' },
    ];
    close(q(d, TRAN, { kind: 'alpha' }), 0.1 / (2 * 1e-4));
    close(q(d, TRAN, { kind: 'omega0' }), 1 / Math.sqrt(1e-6));
    close(q(d, TRAN, { kind: 'omega_d' }), Math.sqrt(1e6 - 500 ** 2));
  });
});

describe('element value val', () => {
  it('passive values, gains, coupling, Z and sources', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { ac: { mag: 10, phase: 30 } } },
      { ref: 'C', type: 'C', nodes: ['s', 'a'], value: '250u', hideValue: true },
      { ref: 'L1', type: 'L', nodes: ['a', '0'], value: '4m' },
      { ref: 'L2', type: 'L', nodes: ['b', '0'], value: '9m' },
      { ref: 'RL', type: 'R', nodes: ['b', '0'], value: '1k' },
      { ref: 'K', type: 'K', l1: 'L1', l2: 'L2', k: 0.5 },
      { ref: 'Z1', type: 'Z', nodes: ['s', '0'], value: { re: 3, im: 4 } },
    ];
    const A: Analysis = { type: 'ac', omega: 1000 };
    close(q(d, A, { kind: 'val', el: 'C' }), 2.5e-4);
    close(q(d, A, { kind: 'val', el: 'RL' }), 1000);
    close(q(d, A, { kind: 'val', el: 'K' }), 0.5 * 6e-3);
    close(q(d, A, { kind: 'val', el: 'Z1' }), 5);
    close(q(d, A, { kind: 'val', el: 'Vs', part: 'phase' }), 30);
  });
  it('step source value before / after in transient', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { step: { before: 2, after: '5' } } },
      { ref: 'R', type: 'R', nodes: ['s', '0'], value: 1 },
    ];
    close(q(d, TRAN, { kind: 'val', el: 'Vs', t: '0-' }), 2);
    close(q(d, TRAN, { kind: 'val', el: 'Vs' }), 5);
  });
});

describe('wattmeter', () => {
  it('single-phase AC: reads the average power of the load', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { ac: { mag: 10 } } },
      { ref: 'W', type: 'ammeter', nodes: ['s', 'x'], label: 'W' },
      { ref: 'R', type: 'R', nodes: ['x', 'a'], value: 3 },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: '250u' },
    ];
    close(q(d, { type: 'ac', omega: 1000 }, { kind: 'wattmeter', current: 'W', nodes: ['x', '0'] }), 12);
    close(q(d, { type: 'ac', omega: 1000, phasor: 'peak' }, { kind: 'wattmeter', current: 'W', nodes: ['x', '0'] }), 6);
    expect(() => q(d, { type: 'ac', omega: 1000 }, { kind: 'wattmeter', current: 'R', nodes: ['x', '0'] })).toThrow(/ammeter/);
  });
  it('DC: U·I', () => {
    const d: Spec[] = [
      { ref: 'V', type: 'V', nodes: ['s', '0'], value: 12 },
      { ref: 'W', type: 'ammeter', nodes: ['s', 'x'] },
      { ref: 'R', type: 'R', nodes: ['x', '0'], value: 4 },
    ];
    close(q(d, DC, { kind: 'wattmeter', current: 'W', nodes: ['x', '0'] }), 36);
  });
  it('two-wattmeter method on a balanced Y load', () => {
    const Z = { re: 10, im: 5 };
    const d: Spec[] = [
      { ref: 'Va', type: 'V', nodes: ['A', '0'], value: { ac: { mag: 120, phase: 0 } } },
      { ref: 'Vb', type: 'V', nodes: ['B', '0'], value: { ac: { mag: 120, phase: -120 } } },
      { ref: 'Vc', type: 'V', nodes: ['C', '0'], value: { ac: { mag: 120, phase: 120 } } },
      { ref: 'W1', type: 'ammeter', nodes: ['A', 'A2'] },
      { ref: 'W2', type: 'ammeter', nodes: ['C', 'C2'] },
      { ref: 'Za', type: 'Z', nodes: ['A2', 'n'], value: Z },
      { ref: 'Zb', type: 'Z', nodes: ['B', 'n'], value: Z },
      { ref: 'Zc', type: 'Z', nodes: ['C2', 'n'], value: Z },
    ];
    const A: Analysis = { type: 'ac', freq: 50 };
    const w1 = q(d, A, { kind: 'wattmeter', current: 'W1', nodes: ['A', 'B'] });
    const w2 = q(d, A, { kind: 'wattmeter', current: 'W2', nodes: ['C', 'B'] });
    const VL = 120 * Math.sqrt(3);
    const IL = 120 / Math.hypot(10, 5);
    const phi = Math.atan2(5, 10);
    close(w1, VL * IL * Math.cos(phi + Math.PI / 6));
    close(w2, VL * IL * Math.cos(phi - Math.PI / 6));
    close(w1 + w2, 3 * IL * IL * 10);
  });
});

describe('frequency response: per-question frequency, fc, bw, Q', () => {
  const lp: Spec[] = [
    { ref: 'Vi', type: 'V', nodes: ['i', '0'], value: { ac: { mag: 1 } } },
    { ref: 'R', type: 'R', nodes: ['i', 'o'], value: '1k' },
    { ref: 'C', type: 'C', nodes: ['o', '0'], value: '1u' },
  ];
  const A: Analysis = { type: 'ac', omega: 1000 };
  it('per-question omega / freq override', () => {
    close(q(lp, A, { kind: 'gain', out: ['o'], input: 'Vi' }), Math.SQRT1_2);
    close(q(lp, A, { kind: 'gain', out: ['o'], input: 'Vi', omega: 2000 }), 1 / Math.sqrt(5));
    close(q(lp, A, { kind: 'gain', out: ['o'], input: 'Vi', freq: 3000 / (2 * Math.PI) }), 1 / Math.sqrt(10));
    expect(() => q(lp, DC, { kind: 'v', nodes: ['o'], freq: 50 })).toThrow(/not AC/);
  });
  it('RC low-pass and high-pass cutoff', () => {
    close(q(lp, A, { kind: 'fc', out: ['o'], input: 'Vi' }), 1000 / (2 * Math.PI), 1e-9);
    const hp: Spec[] = [
      { ref: 'Vi', type: 'V', nodes: ['i', '0'], value: { ac: { mag: 1 } } },
      { ref: 'C', type: 'C', nodes: ['i', 'o'], value: '1u' },
      { ref: 'R', type: 'R', nodes: ['o', '0'], value: '1k' },
    ];
    close(q(hp, A, { kind: 'fc', out: ['o'], input: 'Vi' }), 1000 / (2 * Math.PI), 1e-9);
    expect(() => q(lp, A, { kind: 'bw', out: ['o'], input: 'Vi' })).toThrow(/band-pass/);
  });
  it('series RLC band-pass (output across R): f0, fc low/high, bw, Q', () => {
    const d: Spec[] = [
      { ref: 'Vi', type: 'V', nodes: ['i', '0'], value: { ac: { mag: 1 } } },
      { ref: 'L', type: 'L', nodes: ['i', 'x'], value: '10m' },
      { ref: 'C', type: 'C', nodes: ['x', 'o'], value: '1u' },
      { ref: 'R', type: 'R', nodes: ['o', '0'], value: 10 },
    ];
    const a = 500;
    const w0 = 1e4;
    const r = Math.sqrt(a * a + w0 * w0);
    close(q(d, A, { kind: 'fc', out: ['o'], input: 'Vi', which: 'low' }), (r - a) / (2 * Math.PI), 1e-9);
    close(q(d, A, { kind: 'fc', out: ['o'], input: 'Vi', which: 'high' }), (r + a) / (2 * Math.PI), 1e-9);
    close(q(d, A, { kind: 'bw', out: ['o'], input: 'Vi' }), 1000 / (2 * Math.PI), 1e-9);
    expect(() => q(d, A, { kind: 'fc', out: ['o'], input: 'Vi' })).toThrow(/which/);
    close(q(d, A, { kind: 'Q' }), 10, 1e-9); // ω0L/R
    close(q(d, A, { kind: 'f0' }), w0 / (2 * Math.PI), 1e-9);
  });
  it('parallel GCL: Q = ω0C/G', () => {
    const d: Spec[] = [
      { ref: 'Is', type: 'I', nodes: ['0', 'a'], value: { ac: { mag: 1 } } },
      { ref: 'R', type: 'R', nodes: ['a', '0'], value: '1k' },
      { ref: 'L', type: 'L', nodes: ['a', '0'], value: '10m' },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: '1u' },
    ];
    close(q(d, A, { kind: 'Q' }), 10, 1e-9);
    close(q(d, A, { kind: 'Q', port: ['a', '0'] }), 10, 1e-9);
  });
  it('active band-pass (inverting op-amp, C1 in series with R1, Cf ∥ Rf)', () => {
    const d: Spec[] = [
      { ref: 'Vi', type: 'V', nodes: ['i', '0'], value: { ac: { mag: 1 } } },
      { ref: 'R1', type: 'R', nodes: ['i', 'x'], value: '1k' },
      { ref: 'C1', type: 'C', nodes: ['x', 'm'], value: '1u' },
      { ref: 'Rf', type: 'R', nodes: ['m', 'o'], value: '10k' },
      { ref: 'Cf', type: 'C', nodes: ['m', 'o'], value: '1n' },
      { ref: 'U', type: 'OPAMP', nodes: ['m', '0', 'o'] },
    ];
    // |H|² = (ω C1 Rf)² / ((1 + (ωτ1)²)(1 + (ωτ2)²)), τ1 = 1e-3, τ2 = 1e-5; max at ω = 1e4
    const k = 1e-2;
    const t1 = 1e-3;
    const t2 = 1e-5;
    const H2 = (x: number) => (k * k * x) / ((1 + t1 * t1 * x) * (1 + t2 * t2 * x));
    const hm2 = H2(1e8);
    // 2·k²x = hm2 (1 + τ1²x)(1 + τ2²x) → quadratic in x = ω²
    const A2 = hm2 * t1 * t1 * t2 * t2;
    const B2 = hm2 * (t1 * t1 + t2 * t2) - 2 * k * k;
    const C2 = hm2;
    const disc = Math.sqrt(B2 * B2 - 4 * A2 * C2);
    const wl = Math.sqrt((-B2 - disc) / (2 * A2));
    const wh = Math.sqrt((-B2 + disc) / (2 * A2));
    close(q(d, A, { kind: 'fc', out: ['o'], input: 'Vi', which: 'low' }), wl / (2 * Math.PI), 1e-8);
    close(q(d, A, { kind: 'fc', out: ['o'], input: 'Vi', which: 'high' }), wh / (2 * Math.PI), 1e-8);
    close(q(d, A, { kind: 'bw', out: ['o'], input: 'Vi' }), (wh - wl) / (2 * Math.PI), 1e-8);
  });
  it('Q of a circuit without resonance is an error', () => {
    expect(() => q(lp, A, { kind: 'Q' })).toThrow(AnalysisErrorLike);
  });
});

const AnalysisErrorLike = /resonance|real/;
