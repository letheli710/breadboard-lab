import { describe, expect, it } from 'vitest';
import type { Analysis, Find } from '../problem/types';
import { AnalysisError, computeQuantity, naturalFrequencies, solveDC } from './index';
import { net, type Spec } from './testutil';

const DC: Analysis = { type: 'dc' };
const TRAN: Analysis = { type: 'tran' };
const q = (specs: Spec[], an: Analysis, find: Find) => computeQuantity(net(specs), an, find);
function close(actual: number, expected: number, rel = 1e-6) {
  const tol = rel * Math.max(Math.abs(expected), 1e-9);
  if (!(Math.abs(actual - expected) <= tol)) throw new Error(`expected ${expected}, got ${actual}`);
}

describe('DC resistive circuits', () => {
  // 12 V → R1 2Ω → b ; R2 3Ω ∥ R3 6Ω to ground
  const c: Spec[] = [
    { ref: 'V1', type: 'V', nodes: ['a', '0'], value: 12 },
    { ref: 'R1', type: 'R', nodes: ['a', 'b'], value: 2 },
    { ref: 'R2', type: 'R', nodes: ['b', '0'], value: 3 },
    { ref: 'R3', type: 'R', nodes: ['b', '0'], value: '6' },
  ];
  it('series/parallel currents, voltages, powers with passive convention', () => {
    close(q(c, DC, { kind: 'v', nodes: ['b'] }), 6);
    close(q(c, DC, { kind: 'v', nodes: ['a', 'b'] }), 6);
    close(q(c, DC, { kind: 'v', el: 'R1' }), 6);
    close(q(c, DC, { kind: 'i', el: 'R2' }), 2);
    close(q(c, DC, { kind: 'i', el: 'R3' }), 1);
    close(q(c, DC, { kind: 'i', el: 'V1' }), -3); // delivering source: passive current negative
    close(q(c, DC, { kind: 'p', el: 'V1' }), -36);
    close(q(c, DC, { kind: 'p', el: 'R1' }), 18);
    close(q(c, DC, { kind: 'req', port: ['a', '0'] }), 0); // V source zeroed → short
    close(q(c, DC, { kind: 'req', port: ['b', '0'] }), 1); // 2 ∥ 3 ∥ 6
  });
  it('voltage divider with SI strings and "gnd" node name', () => {
    const d: Spec[] = [
      { ref: 'V', type: 'V', nodes: ['in', '0'], value: '10' },
      { ref: 'Ra', type: 'R', nodes: ['in', 'out'], value: '4.7k' },
      { ref: 'Rb', type: 'R', nodes: ['out', 'gnd'], value: '10k' },
    ];
    close(q(d, DC, { kind: 'v', nodes: ['out', 'gnd'] }), (10 * 10) / 14.7);
  });
  it('KCL with current sources (I pushes value from p to n)', () => {
    const d: Spec[] = [
      { ref: 'I1', type: 'I', nodes: ['0', 'a'], value: 2 }, // 2 A into a
      { ref: 'I2', type: 'I', nodes: ['a', '0'], value: '500m' }, // 0.5 A out of a
      { ref: 'R', type: 'R', nodes: ['a', '0'], value: 5 },
    ];
    close(q(d, DC, { kind: 'v', nodes: ['a'] }), 7.5);
    close(q(d, DC, { kind: 'i', el: 'I1' }), 2);
    close(q(d, DC, { kind: 'p', el: 'I1' }), -15); // v = 0 − 7.5, i = 2
    close(q(d, DC, { kind: 'p', el: 'I2' }), 3.75);
  });
  it('nodal analysis with two sources and superposition gain', () => {
    const d: Spec[] = [
      { ref: 'V1', type: 'V', nodes: ['a', '0'], value: 10 },
      { ref: 'R1', type: 'R', nodes: ['a', 'b'], value: 2 },
      { ref: 'R2', type: 'R', nodes: ['b', '0'], value: 4 },
      { ref: 'R3', type: 'R', nodes: ['b', 'c'], value: 4 },
      { ref: 'V2', type: 'V', nodes: ['c', '0'], value: 5 },
    ];
    close(q(d, DC, { kind: 'v', nodes: ['b'] }), 6.25);
    close(q(d, DC, { kind: 'gain', out: ['b'], input: 'V1' }), 0.5);
    close(q(d, DC, { kind: 'gain', out: ['b'], input: 'V2' }), 0.25);
    // mesh-style: current through R3 from b to c
    close(q(d, DC, { kind: 'i', el: 'R3' }), 0.3125);
  });
});

describe('dependent sources', () => {
  it('VCVS', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['a', '0'], value: 1 },
      { ref: 'R1', type: 'R', nodes: ['a', 'b'], value: '1k' },
      { ref: 'R2', type: 'R', nodes: ['b', '0'], value: '1k' },
      { ref: 'E', type: 'VCVS', nodes: ['c', '0'], value: 10, ctrl: { v: 'R2' } },
      { ref: 'R3', type: 'R', nodes: ['c', '0'], value: 100 },
    ];
    close(q(d, DC, { kind: 'v', nodes: ['c'] }), 5);
    close(q(d, DC, { kind: 'p', el: 'E' }), -0.25);
  });
  it('VCCS (vnodes control)', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['a', '0'], value: 2 },
      { ref: 'R1', type: 'R', nodes: ['a', '0'], value: 1 },
      { ref: 'G', type: 'VCCS', nodes: ['0', 'b'], value: 0.5, ctrl: { vnodes: ['a', '0'] } },
      { ref: 'R2', type: 'R', nodes: ['b', '0'], value: 4 },
    ];
    close(q(d, DC, { kind: 'v', nodes: ['b'] }), 4);
  });
  it('CCVS', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['a', '0'], value: 10 },
      { ref: 'R1', type: 'R', nodes: ['a', 'b'], value: 2 },
      { ref: 'H', type: 'CCVS', nodes: ['b', '0'], value: 3, ctrl: { i: 'R1' } },
    ];
    close(q(d, DC, { kind: 'i', el: 'R1' }), 2);
    close(q(d, DC, { kind: 'v', nodes: ['b'] }), 6);
  });
  it('CCCS, also controlled by a voltage-source current', () => {
    const d: Spec[] = [
      { ref: 'Is', type: 'I', nodes: ['0', 'a'], value: 1 },
      { ref: 'R1', type: 'R', nodes: ['a', '0'], value: 10 },
      { ref: 'F', type: 'CCCS', nodes: ['0', 'b'], value: 2, ctrl: { i: 'R1' } },
      { ref: 'R2', type: 'R', nodes: ['b', '0'], value: 5 },
    ];
    close(q(d, DC, { kind: 'v', nodes: ['b'] }), 10);
    const e: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['a', '0'], value: 6 },
      { ref: 'R1', type: 'R', nodes: ['a', '0'], value: 3 },
      { ref: 'F', type: 'CCCS', nodes: ['b', '0'], value: 4, ctrl: { i: 'Vs' } }, // i(Vs) = −2 → pushes −8 A b→0
      { ref: 'R2', type: 'R', nodes: ['b', '0'], value: 1 },
    ];
    close(q(e, DC, { kind: 'v', nodes: ['b'] }), 8);
  });
  it('Thevenin / Norton / req / pmax with a dependent source', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['x', '0'], value: 10 },
      { ref: 'R1', type: 'R', nodes: ['x', 'a'], value: 2 },
      { ref: 'R2', type: 'R', nodes: ['a', '0'], value: 4 },
      { ref: 'G', type: 'VCCS', nodes: ['a', '0'], value: 0.25, ctrl: { v: 'R1' } },
    ];
    close(q(d, DC, { kind: 'vth', port: ['a', '0'] }), 5);
    close(q(d, DC, { kind: 'isc', port: ['a', '0'] }), 2.5);
    close(q(d, DC, { kind: 'req', port: ['a', '0'] }), 2);
    close(q(d, DC, { kind: 'pmax', port: ['a', '0'] }), 3.125);
    close(q(d, DC, { kind: 'isc', port: ['0', 'a'] }), -2.5);
  });
});

describe('port quantities with exclude', () => {
  // 12 V, R1 = 6 Ω to a, R2 = 3 Ω a–0, load RL drawn across a–0
  const d: Spec[] = [
    { ref: 'V', type: 'V', nodes: ['x', '0'], value: 12 },
    { ref: 'R1', type: 'R', nodes: ['x', 'a'], value: 6 },
    { ref: 'R2', type: 'R', nodes: ['a', '0'], value: 3 },
    { ref: 'RL', type: 'R', nodes: ['a', '0'], value: 10 }, // terminal b sits on ground
  ];
  const al = { b: '0' };
  const Q = (find: Find) => computeQuantity(net(d, al), DC, find);
  it('max power with the load drawn across the port', () => {
    close(Q({ kind: 'pmax', port: ['a', 'b'], exclude: ['RL'] }), 16 / 8); // Vth = 4, Rth = 2
    close(Q({ kind: 'vth', port: ['a', 'b'], exclude: ['RL'] }), 4);
    close(Q({ kind: 'isc', port: ['a', 'b'], exclude: ['RL'] }), 2);
    close(Q({ kind: 'vth', port: ['a', 'b'] }), 12 * (30 / 13) / (6 + 30 / 13)); // load kept
  });
  it('req with the drawn load excluded (and kept)', () => {
    close(Q({ kind: 'req', port: ['a', 'b'], exclude: ['RL'] }), 2);
    close(Q({ kind: 'req', port: ['a', 'b'] }), 1 / (1 / 2 + 1 / 10));
  });
  it('AC pmax with exclude', () => {
    const e: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { ac: { mag: 10 } } },
      { ref: 'Zs', type: 'Z', nodes: ['s', 'a'], value: { re: 3, im: 4 } },
      { ref: 'ZL', type: 'Z', nodes: ['a', '0'], value: { re: 3, im: -4 } },
    ];
    close(q(e, { type: 'ac', freq: 50 }, { kind: 'pmax', port: ['a', '0'], exclude: ['ZL'] }), 100 / 12);
  });
  it('unknown excluded ref is an error', () => {
    expect(() => Q({ kind: 'pmax', port: ['a', 'b'], exclude: ['RX'] })).toThrow(/exclude.*"RX"/);
  });
});

describe('ideal op-amps', () => {
  const op = (minus: string, plus: string, out: string): Spec => ({ ref: 'U1', type: 'OPAMP', nodes: [minus, plus, out] });
  it('inverting', () => {
    const d = [
      { ref: 'Vi', type: 'V', nodes: ['i', '0'], value: 1 },
      { ref: 'R1', type: 'R', nodes: ['i', 'm'], value: '1k' },
      { ref: 'Rf', type: 'R', nodes: ['m', 'o'], value: '10k' },
      { ref: 'RL', type: 'R', nodes: ['o', '0'], value: '2k' },
      op('m', '0', 'o'),
    ];
    close(q(d, DC, { kind: 'v', nodes: ['o'] }), -10);
    close(q(d, DC, { kind: 'gain', out: ['o'], input: 'Vi' }), -10);
    close(q(d, DC, { kind: 'i', el: 'U1' }), -10 / 2000 - 1e-3); // output current into o
  });
  it('non-inverting', () => {
    const d = [
      { ref: 'Vi', type: 'V', nodes: ['p', '0'], value: 2 },
      { ref: 'R1', type: 'R', nodes: ['m', '0'], value: '1k' },
      { ref: 'Rf', type: 'R', nodes: ['m', 'o'], value: '3k' },
      op('m', 'p', 'o'),
    ];
    close(q(d, DC, { kind: 'v', nodes: ['o'] }), 8);
  });
  it('summing', () => {
    const d = [
      { ref: 'V1', type: 'V', nodes: ['a', '0'], value: 1 },
      { ref: 'V2', type: 'V', nodes: ['b', '0'], value: 2 },
      { ref: 'R1', type: 'R', nodes: ['a', 'm'], value: '10k' },
      { ref: 'R2', type: 'R', nodes: ['b', 'm'], value: '10k' },
      { ref: 'Rf', type: 'R', nodes: ['m', 'o'], value: '20k' },
      op('m', '0', 'o'),
    ];
    close(q(d, DC, { kind: 'v', nodes: ['o'] }), -6);
  });
  it('difference', () => {
    const d = [
      { ref: 'V1', type: 'V', nodes: ['a', '0'], value: 1 },
      { ref: 'V2', type: 'V', nodes: ['b', '0'], value: 3 },
      { ref: 'R1', type: 'R', nodes: ['a', 'm'], value: '10k' },
      { ref: 'R2', type: 'R', nodes: ['m', 'o'], value: '10k' },
      { ref: 'R3', type: 'R', nodes: ['b', 'p'], value: '10k' },
      { ref: 'R4', type: 'R', nodes: ['p', '0'], value: '10k' },
      op('m', 'p', 'o'),
    ];
    close(q(d, DC, { kind: 'v', nodes: ['o'] }), 2);
  });
});

describe('first-order transients', () => {
  const rc: Spec[] = [
    { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { step: { before: 0, after: 10 } } },
    { ref: 'R', type: 'R', nodes: ['s', 'a'], value: '1k' },
    { ref: 'C', type: 'C', nodes: ['a', '0'], value: '1u' },
  ];
  it('RC step: 0−, 0+, t, inf, tau', () => {
    close(q(rc, TRAN, { kind: 'v', el: 'C', t: '0-' }), 0);
    close(q(rc, TRAN, { kind: 'v', el: 'C', t: '0+' }), 0);
    close(q(rc, TRAN, { kind: 'i', el: 'C', t: '0+' }), 0.01);
    close(q(rc, TRAN, { kind: 'v', el: 'R', t: '0+' }), 10);
    close(q(rc, TRAN, { kind: 'v', el: 'C', t: 1e-3 }), 10 * (1 - Math.exp(-1)));
    close(q(rc, TRAN, { kind: 'v', el: 'C', t: 3e-3 }), 10 * (1 - Math.exp(-3)));
    close(q(rc, TRAN, { kind: 'i', el: 'C', t: 2e-3 }), 0.01 * Math.exp(-2));
    close(q(rc, TRAN, { kind: 'v', el: 'C', t: 'inf' }), 10);
    close(q(rc, TRAN, { kind: 'tau' }), 1e-3);
  });
  it('RL step', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { step: { before: 0, after: 12 } } },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 4 },
      { ref: 'L', type: 'L', nodes: ['a', '0'], value: 2 },
    ];
    close(q(d, TRAN, { kind: 'i', el: 'L', t: 0.5 }), 3 * (1 - Math.exp(-1)));
    close(q(d, TRAN, { kind: 'v', el: 'L', t: '0+' }), 12);
    close(q(d, TRAN, { kind: 'tau' }), 0.5);
  });
  it('switch opening: capacitor discharges', () => {
    const d: Spec[] = [
      { ref: 'V', type: 'V', nodes: ['s', '0'], value: 10 },
      { ref: 'R1', type: 'R', nodes: ['s', 'x'], value: 2 },
      { ref: 'S', type: 'SW', nodes: ['x', 'a'], state: { before: 'closed', after: 'open' } },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: 0.5 },
      { ref: 'R2', type: 'R', nodes: ['a', '0'], value: 8 },
    ];
    close(q(d, TRAN, { kind: 'v', el: 'C', t: '0-' }), 8);
    close(q(d, TRAN, { kind: 'i', el: 'C', t: '0-' }), 0);
    close(q(d, TRAN, { kind: 'i', el: 'C', t: '0+' }), -1);
    close(q(d, TRAN, { kind: 'v', el: 'C', t: 2 }), 8 * Math.exp(-0.5));
    close(q(d, TRAN, { kind: 'p', el: 'R2', t: 2 }), (8 * Math.exp(-0.5)) ** 2 / 8);
    close(q(d, TRAN, { kind: 'tau' }), 4);
    close(q(d, TRAN, { kind: 'req', port: ['a', '0'] }), 8); // seen by C after switching
    close(q(d, TRAN, { kind: 'req', port: ['a', '0'], t: '0-' }), 1.6);
  });
  it('switch closing: inductor current with initial condition', () => {
    const d: Spec[] = [
      { ref: 'V', type: 'V', nodes: ['s', '0'], value: 10 },
      { ref: 'R1', type: 'R', nodes: ['s', 'a'], value: 2 },
      { ref: 'L', type: 'L', nodes: ['a', 'b'], value: 1 },
      { ref: 'R2', type: 'R', nodes: ['b', '0'], value: 3 },
      { ref: 'S', type: 'SW', nodes: ['b', '0'] }, // default: open before, closed after
    ];
    close(q(d, TRAN, { kind: 'i', el: 'L', t: '0-' }), 2);
    close(q(d, TRAN, { kind: 'i', el: 'L', t: '0+' }), 2);
    close(q(d, TRAN, { kind: 'v', el: 'L', t: '0+' }), 6);
    close(q(d, TRAN, { kind: 'i', el: 'S', t: '0+' }), 2);
    close(q(d, TRAN, { kind: 'i', el: 'L', t: 0.25 }), 5 - 3 * Math.exp(-0.5));
    close(q(d, TRAN, { kind: 'i', el: 'L', t: 'inf' }), 5);
    close(q(d, TRAN, { kind: 'tau' }), 0.5);
  });
  it('parallel capacitors and series inductors reduce to first order', () => {
    const pc: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { step: { before: 0, after: 10 } } },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: '1k' },
      { ref: 'C1', type: 'C', nodes: ['a', '0'], value: '1u' },
      { ref: 'C2', type: 'C', nodes: ['a', '0'], value: '2u' },
    ];
    close(q(pc, TRAN, { kind: 'tau' }), 3e-3);
    close(q(pc, TRAN, { kind: 'v', el: 'C2', t: 3e-3 }), 10 * (1 - Math.exp(-1)), 1e-5);
    close(q(pc, TRAN, { kind: 'i', el: 'C2', t: 3e-3 }), (2 / 3) * 0.01 * Math.exp(-1), 1e-5);
    const sl: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { step: { before: 0, after: 6 } } },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 3 },
      { ref: 'L1', type: 'L', nodes: ['a', 'b'], value: 1 },
      { ref: 'L2', type: 'L', nodes: ['b', '0'], value: 2 },
    ];
    close(q(sl, TRAN, { kind: 'tau' }), 1);
    close(q(sl, TRAN, { kind: 'i', el: 'L2', t: 1 }), 2 * (1 - Math.exp(-1)), 1e-5);
    close(q(sl, TRAN, { kind: 'v', el: 'L2', t: 1 }), 4 * Math.exp(-1), 1e-5);
  });
  it('charge redistribution between capacitors through a closing switch', () => {
    const d: Spec[] = [
      { ref: 'C1', type: 'C', nodes: ['a', '0'], value: 1, ic: 10 },
      { ref: 'S', type: 'SW', nodes: ['a', 'b'] },
      { ref: 'C2', type: 'C', nodes: ['b', '0'], value: 1, ic: 0 },
      { ref: 'R', type: 'R', nodes: ['b', '0'], value: 1 },
    ];
    close(q(d, TRAN, { kind: 'v', el: 'C2', t: '0+' }), 5, 1e-6);
    close(q(d, TRAN, { kind: 'v', el: 'C2', t: 1 }), 5 * Math.exp(-0.5), 1e-6);
    close(q(d, TRAN, { kind: 'tau' }), 2, 1e-6);
  });
  it('parallel inductors: zero loop flux before, conserved flux to t = inf', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { step: { before: 3, after: 6 } } },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 2 },
      { ref: 'L1', type: 'L', nodes: ['a', '0'], value: 1 },
      { ref: 'L2', type: 'L', nodes: ['a', '0'], value: 2 },
    ];
    close(q(d, TRAN, { kind: 'i', el: 'L1', t: '0-' }), 1); // 1.5 A split 2:1
    close(q(d, TRAN, { kind: 'tau' }), 1 / 3);
    close(q(d, TRAN, { kind: 'i', el: 'L1', t: 'inf' }), 2);
    close(q(d, TRAN, { kind: 'i', el: 'L2', t: 1 / 3 }), 0.5 + 0.5 * (1 - Math.exp(-1)));
  });
  it('very stiff circuit (time constants 1 ns and 1e6 s)', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { step: { before: 0, after: 1 } } },
      { ref: 'R1', type: 'R', nodes: ['s', 'a'], value: 1 },
      { ref: 'C1', type: 'C', nodes: ['a', '0'], value: 1e-9 },
      { ref: 'R2', type: 'R', nodes: ['s', 'b'], value: 1e6 },
      { ref: 'C2', type: 'C', nodes: ['b', '0'], value: 1 },
    ];
    close(q(d, TRAN, { kind: 'v', el: 'C2', t: 1e6 }), 1 - Math.exp(-1), 1e-8);
    close(q(d, TRAN, { kind: 'v', el: 'C1', t: 1e-9 }), 1 - Math.exp(-1), 1e-8);
  });
  it('op-amp integrator with ic', () => {
    const d: Spec[] = [
      { ref: 'Vi', type: 'V', nodes: ['i', '0'], value: { step: { before: 0, after: 1 } } },
      { ref: 'R', type: 'R', nodes: ['i', 'm'], value: '1k' },
      { ref: 'C', type: 'C', nodes: ['m', 'o'], value: '1u', ic: 0 },
      { ref: 'U', type: 'OPAMP', nodes: ['m', '0', 'o'] },
    ];
    close(q(d, TRAN, { kind: 'v', nodes: ['o'], t: 1e-3 }), -1);
    close(q(d, TRAN, { kind: 'v', nodes: ['o'], t: 2.5e-3 }), -2.5);
  });
  it('sinusoidal source switched on at t = 0 (RC)', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { sin: { amp: 1, freq: 1 / (2 * Math.PI) } } },
      { ref: 'S', type: 'SW', nodes: ['s', 'x'] },
      { ref: 'R', type: 'R', nodes: ['x', 'a'], value: 1 },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: 1, ic: 0 },
    ];
    const v = (t: number) => (Math.sin(t) - Math.cos(t)) / 2 + Math.exp(-t) / 2;
    close(q(d, TRAN, { kind: 'v', el: 'C', t: 2 }), v(2));
    close(q(d, TRAN, { kind: 'v', el: 'C', t: 7.3 }), v(7.3));
  });
  it('sinusoidal steady state before t = 0 sets the initial state', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { sin: { amp: 1, freq: 1 / (2 * Math.PI) } } },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 1 },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: 1 },
    ];
    const vss = (t: number) => Math.sin(t - Math.PI / 4) / Math.SQRT2;
    close(q(d, TRAN, { kind: 'v', el: 'C', t: '0-' }), -0.5);
    close(q(d, TRAN, { kind: 'v', el: 'C', t: -1 }), vss(-1));
    close(q(d, TRAN, { kind: 'v', el: 'C', t: 2 }), vss(2));
  });
});

describe('second-order RLC step response (series, v_C)', () => {
  const rlc = (R: number): Spec[] => [
    { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { step: { before: 0, after: 1 } } },
    { ref: 'R', type: 'R', nodes: ['s', 'a'], value: R },
    { ref: 'L', type: 'L', nodes: ['a', 'b'], value: 1 },
    { ref: 'C', type: 'C', nodes: ['b', '0'], value: 0.25 },
  ];
  it('underdamped', () => {
    const w = Math.sqrt(3);
    for (const t of [0.3, 1, 2.7]) close(q(rlc(2), TRAN, { kind: 'v', el: 'C', t }), 1 - Math.exp(-t) * (Math.cos(w * t) + Math.sin(w * t) / w), 1e-8);
    close(q(rlc(2), TRAN, { kind: 'i', el: 'L', t: 1 }), 0.25 * (4 / w) * Math.exp(-1) * Math.sin(w), 1e-8);
  });
  it('critically damped', () => {
    for (const t of [0.5, 1.5]) close(q(rlc(4), TRAN, { kind: 'v', el: 'C', t }), 1 - (1 + 2 * t) * Math.exp(-2 * t), 1e-8);
  });
  it('overdamped', () => {
    for (const t of [0.2, 1, 3]) close(q(rlc(5), TRAN, { kind: 'v', el: 'C', t }), 1 - (4 / 3) * Math.exp(-t) + (1 / 3) * Math.exp(-4 * t), 1e-8);
  });
  it('natural frequencies and tau rejection', () => {
    const s = naturalFrequencies(net(rlc(5))).map((x) => x.re).sort((a, b) => a - b);
    close(s[0], -4);
    close(s[1], -1);
    expect(() => q(rlc(2), TRAN, { kind: 'tau' })).toThrow(/not first-order/);
  });
  it('lossless LC has no final value', () => {
    const d = rlc(0);
    expect(() => q(d, TRAN, { kind: 'v', el: 'C', t: 'inf' })).toThrow(AnalysisError);
    close(q(d, TRAN, { kind: 'v', el: 'C', t: 1 }), 1 - Math.cos(2), 1e-8);
  });
});

describe('AC steady state', () => {
  const W = 1000;
  const AC: Analysis = { type: 'ac', omega: W };
  const rc: Spec[] = [
    { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { ac: { mag: 10, phase: 0 } } },
    { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 3 },
    { ref: 'C', type: 'C', nodes: ['a', '0'], value: '250u' }, // Xc = 4 Ω
  ];
  it('RC impedance, current, phase', () => {
    close(q(rc, AC, { kind: 'i', el: 'R' }), 2);
    close(q(rc, AC, { kind: 'i', el: 'R', part: 'phase' }), (Math.atan2(4, 3) * 180) / Math.PI);
    close(q(rc, AC, { kind: 'v', el: 'C' }), 8);
    close(q(rc, AC, { kind: 'v', el: 'C', part: 'phase' }), (Math.atan2(4, 3) * 180) / Math.PI - 90);
    close(q(rc, AC, { kind: 'req', port: ['s', '0'] }), 0);
    close(q(rc, AC, { kind: 'p', el: 'R' }), 12);
    close(q(rc, AC, { kind: 'q', el: 'C' }), -16);
    close(q(rc, AC, { kind: 'p', el: 'Vs' }), -12);
    close(q(rc, AC, { kind: 's', el: 'Vs' }), 20);
    close(q(rc, AC, { kind: 'pf', el: 'Vs' }), 0.6);
    close(q(rc, AC, { kind: 'pf', el: 'C' }), 0, 1);
  });
  it('RL and RLC port impedance (complex parts)', () => {
    const d: Spec[] = [
      { ref: 'R', type: 'R', nodes: ['a', 'b'], value: 4 },
      { ref: 'L', type: 'L', nodes: ['b', 'c'], value: '3m' },
      { ref: 'C', type: 'C', nodes: ['c', '0'], value: '500u' }, // −2j
    ];
    close(q(d, AC, { kind: 'req', port: ['a', '0'], part: 're' }), 4);
    close(q(d, AC, { kind: 'req', port: ['a', '0'], part: 'im' }), 1);
    close(q(d, AC, { kind: 'req', port: ['a', 'c'] }), 5);
    close(q(d, AC, { kind: 'req', port: ['a', 'c'], part: 'phase' }), (Math.atan2(3, 4) * 180) / Math.PI);
  });
  it('low-pass gain at the corner: mag, phase, dB', () => {
    const d: Spec[] = [
      { ref: 'Vi', type: 'V', nodes: ['i', '0'], value: { ac: { mag: 1 } } },
      { ref: 'R', type: 'R', nodes: ['i', 'o'], value: '1k' },
      { ref: 'C', type: 'C', nodes: ['o', '0'], value: '1u' },
    ];
    close(q(d, AC, { kind: 'gain', out: ['o'], input: 'Vi' }), Math.SQRT1_2);
    close(q(d, AC, { kind: 'gain', out: ['o'], input: 'Vi', part: 'phase' }), -45);
    close(q(d, AC, { kind: 'gain', out: ['o'], input: 'Vi', part: 'db' }), 20 * Math.log10(Math.SQRT1_2));
  });
  it('peak phasor convention halves power; rms part', () => {
    const PK: Analysis = { type: 'ac', omega: W, phasor: 'peak' };
    close(q(rc, PK, { kind: 'p', el: 'R' }), 6);
    close(q(rc, PK, { kind: 'i', el: 'R', part: 'rms' }), Math.SQRT2);
    close(q(rc, AC, { kind: 'i', el: 'R', part: 'rms' }), 2);
  });
  it('AC maximum power transfer', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { ac: { mag: 10 } } },
      { ref: 'R', type: 'R', nodes: ['s', 'x'], value: 3 },
      { ref: 'L', type: 'L', nodes: ['x', 'a'], value: '4m' },
    ];
    close(q(d, AC, { kind: 'pmax', port: ['a', '0'] }), 100 / 12);
    close(q(d, { type: 'ac', freq: W / (2 * Math.PI) }, { kind: 'pmax', port: ['a', '0'] }), 100 / 12);
  });
  it('Z element and plain-number source as 0° phasor', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: 10 },
      { ref: 'Z1', type: 'Z', nodes: ['s', '0'], value: { re: 6, im: 8 } },
    ];
    close(q(d, AC, { kind: 'i', el: 'Z1' }), 1);
    close(q(d, AC, { kind: 'pf', el: 'Vs' }), 0.6);
    close(q(d, AC, { kind: 'q', el: 'Z1' }), 8);
  });
});

describe('resonance', () => {
  it('series RLC (single source)', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: { ac: { mag: 1 } } },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 10 },
      { ref: 'L', type: 'L', nodes: ['a', 'b'], value: '10m' },
      { ref: 'C', type: 'C', nodes: ['b', '0'], value: '1u' },
    ];
    close(q(d, { type: 'ac', freq: 1000 }, { kind: 'f0' }), 1 / (2 * Math.PI * Math.sqrt(1e-8)), 1e-9);
  });
  it('parallel RLC fed by a current source and lossless parallel LC', () => {
    const d: Spec[] = [
      { ref: 'Is', type: 'I', nodes: ['0', 'a'], value: { ac: { mag: 1 } } },
      { ref: 'R', type: 'R', nodes: ['a', '0'], value: 1000 },
      { ref: 'L', type: 'L', nodes: ['a', '0'], value: '10m' },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: '1u' },
    ];
    close(q(d, { type: 'ac', freq: 50 }, { kind: 'f0' }), 1591.5494309189535, 1e-9);
    const e = d.filter((x) => x.ref !== 'R');
    close(q(e, { type: 'ac', freq: 50 }, { kind: 'f0', port: ['a', '0'] }), 1591.5494309189535, 1e-9);
  });
  it('practical parallel resonance (lossy coil ∥ C) at a port', () => {
    const d: Spec[] = [
      { ref: 'R', type: 'R', nodes: ['a', 'x'], value: 10 },
      { ref: 'L', type: 'L', nodes: ['x', '0'], value: '1m' },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: '1u' },
    ];
    close(q(d, { type: 'ac', freq: 50 }, { kind: 'f0', port: ['a', '0'] }), 30000 / (2 * Math.PI), 1e-9);
  });
});

describe('coupled inductors and ideal transformer', () => {
  const series = (dotsAiding: boolean): Spec[] => [
    { ref: 'L1', type: 'L', nodes: ['a', 'm'], value: 1 },
    { ref: 'L2', type: 'L', nodes: dotsAiding ? ['m', '0'] : ['0', 'm'], value: 2 },
    { ref: 'K1', type: 'K', l1: 'L1', l2: 'L2', M: 0.5 },
  ];
  it('series aiding / opposing', () => {
    close(q(series(true), { type: 'ac', omega: 10 }, { kind: 'req', port: ['a', '0'] }), 40);
    close(q(series(false), { type: 'ac', omega: 10 }, { kind: 'req', port: ['a', '0'] }), 20);
  });
  it('loaded secondary: reflected impedance and dot orientation', () => {
    const mk = (flip: boolean): Spec[] => [
      { ref: 'Vs', type: 'V', nodes: ['a', '0'], value: { ac: { mag: 1 } } },
      { ref: 'L1', type: 'L', nodes: ['a', '0'], value: 1 },
      { ref: 'L2', type: 'L', nodes: flip ? ['0', 'b'] : ['b', '0'], value: 1 },
      { ref: 'RL', type: 'R', nodes: ['b', '0'], value: 1 },
      { ref: 'K', type: 'K', l1: 'L1', l2: 'L2', k: 0.5 },
    ];
    const A1: Analysis = { type: 'ac', omega: 1 };
    // Zin = jωL1 + ω²M²/(R + jωL2) = 0.125 + 0.875j
    close(q(mk(false), A1, { kind: 'i', el: 'L1' }), 1 / Math.hypot(0.125, 0.875));
    close(q(mk(true), A1, { kind: 'i', el: 'L1' }), 1 / Math.hypot(0.125, 0.875));
    // V(b) = jM/(1+j)·I1 (aiding orientation) ; flips sign with the dot
    const i1 = { re: 0.125 / (0.125 ** 2 + 0.875 ** 2), im: -0.875 / (0.125 ** 2 + 0.875 ** 2) };
    const k = { re: 0.25, im: 0.25 }; // 0.5j/(1+j)
    const vb = { re: k.re * i1.re - k.im * i1.im, im: k.re * i1.im + k.im * i1.re };
    close(q(mk(false), A1, { kind: 'v', nodes: ['b'], part: 're' }), vb.re);
    close(q(mk(false), A1, { kind: 'v', nodes: ['b'], part: 'im' }), vb.im);
    close(q(mk(true), A1, { kind: 'v', nodes: ['b'], part: 're' }), -vb.re);
  });
  it('ideal transformer reflects n²·R and scales voltage', () => {
    const d: Spec[] = [
      { ref: 'Vs', type: 'V', nodes: ['s', '0'], value: 10 },
      { ref: 'Rs', type: 'R', nodes: ['s', 'a'], value: 2 },
      { ref: 'T1', type: 'XFMR', nodes: ['a', '0', 'b', '0'], n: 2 },
      { ref: 'RL', type: 'R', nodes: ['b', '0'], value: 2 },
    ];
    close(q(d, DC, { kind: 'v', nodes: ['a'] }), 8);
    close(q(d, DC, { kind: 'v', nodes: ['b'] }), 4);
    close(q(d, DC, { kind: 'i', el: 'RL' }), 2);
    close(q(d, DC, { kind: 'i', el: 'Rs' }), 1);
    close(q(d, DC, { kind: 'req', port: ['a', '0'] }), 1.6);
    const load: Spec[] = [
      { ref: 'T1', type: 'XFMR', nodes: ['a', '0', 'b', 'c'], n: 10 },
      { ref: 'ZL', type: 'Z', nodes: ['b', 'c'], value: { re: 3, im: 4 } }, // floating secondary
    ];
    close(q(load, { type: 'ac', freq: 50 }, { kind: 'req', port: ['a', '0'] }), 500);
    close(q(load, { type: 'ac', freq: 50 }, { kind: 'req', port: ['a', '0'], part: 'phase' }), (Math.atan2(4, 3) * 180) / Math.PI);
    expect(() => q(load, { type: 'ac', freq: 50 }, { kind: 'vth', port: ['b', '0'] })).toThrow(/galvanically/);
  });
});

describe('three-phase', () => {
  it('balanced Y–Y with floating load neutral', () => {
    const Z = { re: 10, im: 5 };
    const d: Spec[] = [
      { ref: 'Va', type: 'V', nodes: ['A', '0'], value: { ac: { mag: 120, phase: 0 } } },
      { ref: 'Vb', type: 'V', nodes: ['B', '0'], value: { ac: { mag: 120, phase: -120 } } },
      { ref: 'Vc', type: 'V', nodes: ['C', '0'], value: { ac: { mag: 120, phase: 120 } } },
      { ref: 'Za', type: 'Z', nodes: ['A', 'n'], value: Z },
      { ref: 'Zb', type: 'Z', nodes: ['B', 'n'], value: Z },
      { ref: 'Zc', type: 'Z', nodes: ['C', 'n'], value: Z },
    ];
    const A: Analysis = { type: 'ac', freq: 50 };
    close(q(d, A, { kind: 'i', el: 'Zb' }), 120 / Math.hypot(10, 5));
    close(q(d, A, { kind: 'i', el: 'Zb', part: 'phase' }), -120 - (Math.atan2(5, 10) * 180) / Math.PI);
    close(q(d, A, { kind: 'v', nodes: ['A', 'B'] }), 120 * Math.sqrt(3));
    close(q(d, A, { kind: 'v', nodes: ['n'] }) + 1, 1); // neutral at 0
    close(q(d, A, { kind: 'p', el: 'Za' }), (120 ** 2 / 125) * 10);
  });
});

describe('two-ports', () => {
  const T: Spec[] = [
    { ref: 'Ra', type: 'R', nodes: ['1', 'm'], value: 2 },
    { ref: 'Rb', type: 'R', nodes: ['m', '2'], value: 3 },
    { ref: 'Rc', type: 'R', nodes: ['m', '0'], value: 4 },
  ];
  const P: [[string, string], [string, string]] = [
    ['1', '0'],
    ['2', '0'],
  ];
  const tp = (s: Spec[], param: Extract<Find, { kind: 'twoport' }>['param']) => q(s, DC, { kind: 'twoport', ports: P, param });
  it('T network: z, y, h, ABCD', () => {
    close(tp(T, 'z11'), 6);
    close(tp(T, 'z12'), 4);
    close(tp(T, 'z21'), 4);
    close(tp(T, 'z22'), 7);
    close(tp(T, 'y11'), 7 / 26);
    close(tp(T, 'y12'), -4 / 26);
    close(tp(T, 'y22'), 6 / 26);
    close(tp(T, 'h11'), 26 / 7);
    close(tp(T, 'h12'), 4 / 7);
    close(tp(T, 'h21'), -4 / 7);
    close(tp(T, 'h22'), 1 / 7);
    close(tp(T, 'a'), 1.5);
    close(tp(T, 'b'), 6.5);
    close(tp(T, 'c'), 0.25);
    close(tp(T, 'd'), 1.75);
  });
  it('π network: y and z', () => {
    const pi: Spec[] = [
      { ref: 'Ra', type: 'R', nodes: ['1', '0'], value: 2 },
      { ref: 'Rc', type: 'R', nodes: ['1', '2'], value: 5 },
      { ref: 'Rb', type: 'R', nodes: ['2', '0'], value: 4 },
    ];
    close(tp(pi, 'y11'), 0.7);
    close(tp(pi, 'y21'), -0.2);
    close(tp(pi, 'y22'), 0.45);
    close(tp(pi, 'z11'), 0.45 / 0.275);
    close(tp(pi, 'z12'), 0.2 / 0.275);
  });
});

describe('node aliases', () => {
  it('a port terminal aliased to ground', () => {
    const n = net(
      [
        { ref: 'V1', type: 'V', nodes: ['x', '0'], value: 10 },
        { ref: 'R1', type: 'R', nodes: ['x', 'a'], value: 2 },
        { ref: 'R2', type: 'R', nodes: ['a', '0'], value: 3 },
      ],
      { b: '0', out: 'a' },
    );
    close(computeQuantity(n, DC, { kind: 'vth', port: ['a', 'b'] }), 6);
    close(computeQuantity(n, DC, { kind: 'req', port: ['out', 'b'] }), 1.2);
    close(computeQuantity(n, DC, { kind: 'v', nodes: ['out', 'b'] }), 6);
  });
});

describe('errors', () => {
  it('series capacitors in DC share charge (initially uncharged)', () => {
    const d: Spec[] = [
      { ref: 'V', type: 'V', nodes: ['a', '0'], value: 5 },
      { ref: 'C1', type: 'C', nodes: ['a', 'm'], value: '1u' },
      { ref: 'C2', type: 'C', nodes: ['m', '0'], value: '3u' },
    ];
    close(q(d, DC, { kind: 'v', el: 'C2' }), 1.25);
  });
  it('floating node (current source into a capacitor in DC) gives a readable message', () => {
    const d: Spec[] = [
      { ref: 'I', type: 'I', nodes: ['0', 'm'], value: 1 },
      { ref: 'C', type: 'C', nodes: ['m', '0'], value: 1e-6 },
      { ref: 'R', type: 'R', nodes: ['m', 'x'], value: 1 },
    ];
    expect(() => q(d, DC, { kind: 'v', nodes: ['m'] })).toThrow(AnalysisError);
    expect(() => q(d, DC, { kind: 'v', nodes: ['m'] })).toThrow(/"m".*capacitors/);
  });
  it('AC: lossless resonance exactly at the analysis frequency', () => {
    const d: Spec[] = [
      { ref: 'Is', type: 'I', nodes: ['0', 'a'], value: { ac: { mag: 1 } } },
      { ref: 'L', type: 'L', nodes: ['a', '0'], value: 1 },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: 1 },
    ];
    expect(() => q(d, { type: 'ac', omega: 1 }, { kind: 'v', nodes: ['a'] })).toThrow(/resonance/);
  });
  it('voltage-source loop', () => {
    const d: Spec[] = [
      { ref: 'V1', type: 'V', nodes: ['a', '0'], value: 5 },
      { ref: 'V2', type: 'V', nodes: ['a', '0'], value: 6 },
    ];
    expect(() => q(d, DC, { kind: 'v', nodes: ['a'] })).toThrow(/loop/);
  });
  it('a capacitor cut off before t = 0 is uncharged unless ic is given', () => {
    const d: Spec[] = [
      { ref: 'V', type: 'V', nodes: ['s', '0'], value: 10 },
      { ref: 'S', type: 'SW', nodes: ['s', 'x'] },
      { ref: 'R', type: 'R', nodes: ['x', 'a'], value: 1 },
      { ref: 'C', type: 'C', nodes: ['a', '0'], value: 1 },
    ];
    close(q(d, TRAN, { kind: 'v', el: 'C', t: '0-' }), 0);
    close(q(d, TRAN, { kind: 'v', el: 'C', t: 1 }), 10 * (1 - Math.exp(-1)));
    const e = d.map((x) => (x.ref === 'C' ? { ...x, ic: 4 } : x));
    close(q(e, TRAN, { kind: 'v', el: 'C', t: 1 }), 10 - 6 * Math.exp(-1));
  });
  it('inductor driven by a current source after t = 0 (cut-set)', () => {
    const d: Spec[] = [
      { ref: 'Is', type: 'I', nodes: ['0', 'a'], value: { step: { before: 0, after: 2 } } },
      { ref: 'L', type: 'L', nodes: ['a', '0'], value: 1, ic: 0 },
      { ref: 'S', type: 'SW', nodes: ['a', 'b'], state: { before: 'closed', after: 'open' } },
      { ref: 'R', type: 'R', nodes: ['b', '0'], value: 1 },
    ];
    close(q(d, TRAN, { kind: 'i', el: 'L', t: 0.5 }), 2, 1e-6);
  });
  it('missing values, unknown nodes, unsupported kinds', () => {
    expect(() => q([{ ref: 'R1', type: 'R', nodes: ['a', '0'] }], DC, { kind: 'v', nodes: ['a'] })).toThrow(/R1.*missing/);
    const d: Spec[] = [
      { ref: 'V', type: 'V', nodes: ['a', '0'], value: 1 },
      { ref: 'R', type: 'R', nodes: ['a', '0'], value: 'abc' },
    ];
    expect(() => q(d, DC, { kind: 'v', nodes: ['a'] })).toThrow(/abc/);
    const ok: Spec[] = [
      { ref: 'V', type: 'V', nodes: ['a', '0'], value: 1 },
      { ref: 'R', type: 'R', nodes: ['a', '0'], value: 1 },
    ];
    expect(() => q(ok, DC, { kind: 'v', nodes: ['zz'] })).toThrow(/Unknown node "zz"/);
    expect(() => q(ok, DC, { kind: 'q', el: 'R' })).toThrow(/AC/);
    expect(() => q(ok, TRAN, { kind: 'v', el: 'R' })).toThrow(/find.t/);
    expect(() => q(ok, DC, { kind: 'req', port: ['a', 'a'] })).not.toThrow();
  });
  it('op-amp without feedback is singular', () => {
    const d: Spec[] = [
      { ref: 'V', type: 'V', nodes: ['p', '0'], value: 1 },
      { ref: 'U', type: 'OPAMP', nodes: ['0', 'p', 'o'] },
      { ref: 'R', type: 'R', nodes: ['o', '0'], value: 1 },
    ];
    expect(() => q(d, DC, { kind: 'v', nodes: ['o'] })).toThrow(AnalysisError);
  });
  it('solveDC helper', () => {
    const s = solveDC(
      net([
        { ref: 'V', type: 'V', nodes: ['a', '0'], value: 3 },
        { ref: 'R', type: 'R', nodes: ['a', '0'], value: 1.5 },
      ]),
    );
    close(s.i('R').re, 2);
  });
});

describe('value parsing', () => {
  it('SI prefixes and units', async () => {
    const { parseNum } = await import('./index');
    close(parseNum('2.2u', 'x'), 2.2e-6);
    close(parseNum('100n', 'x'), 1e-7);
    close(parseNum('4k7', 'x'), 4700);
    close(parseNum('10mH', 'x'), 0.01);
    close(parseNum('1e3', 'x'), 1000);
    close(parseNum('1 kΩ', 'x'), 1000);
    close(parseNum('0.1µF', 'x'), 1e-7);
  });
});
