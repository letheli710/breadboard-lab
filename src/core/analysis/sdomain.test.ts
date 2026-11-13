// s-domain analysis (network functions, poles/zeros, residues, impulse / exponential sources)
// checked against closed-form results, and the transient solver (matrix exponential)
// cross-checked against the s-domain circuit + numerical inverse Laplace transform.
import { describe, expect, it } from 'vitest';
import type { Analysis, Complex, Find } from '../problem/types';
import { computeQuantity } from './index';
import { Laplace, inverseLaplace, networkFunction, stability, transferAt } from './sdomain';
import { net, type Spec } from './testutil';

const TRAN: Analysis = { type: 'tran' };
const q = (specs: Spec[], find: Find, an: Analysis = TRAN) => computeQuantity(net(specs), an, find);
function close(actual: number, expected: number, rel = 1e-6, abs = 1e-9) {
  const tol = Math.max(rel * Math.abs(expected), abs);
  if (!(Math.abs(actual - expected) <= tol)) throw new Error(`expected ${expected}, got ${actual}`);
}
const closeC = (a: Complex, re: number, im: number, rel = 1e-6) => {
  close(a.re, re, rel, 1e-7);
  close(a.im, im, rel, 1e-7);
};
const closeArr = (a: number[], b: number[], rel = 1e-6) => {
  expect(a.length).toBe(b.length);
  a.forEach((x, i) => close(x, b[i], rel, 1e-8));
};
const step = (after: number, before = 0) => ({ step: { before, after } });
const S3 = Math.sqrt(3);

// RC low-pass: H = 1/(1 + sRC) = 2/(s + 2)
const rc: Spec[] = [
  { ref: 'Us', type: 'V', nodes: ['i', '0'], value: step(10) },
  { ref: 'R', type: 'R', nodes: ['i', 'o'], value: 2 },
  { ref: 'C', type: 'C', nodes: ['o', '0'], value: 0.25 },
];
// RL high-pass (output across L): H = s/(s + R/L) = s/(s + 2)
const rl: Spec[] = [
  { ref: 'Us', type: 'V', nodes: ['i', '0'], value: 1 },
  { ref: 'R', type: 'R', nodes: ['i', 'o'], value: 4 },
  { ref: 'L', type: 'L', nodes: ['o', '0'], value: 2 },
];
// series RLC, R = 2, L = 1, C = 0.25: s² + 2s + 4, roots −1 ± j√3
const rlc: Spec[] = [
  { ref: 'Us', type: 'V', nodes: ['i', '0'], value: step(4) },
  { ref: 'R', type: 'R', nodes: ['i', 'a'], value: 2 },
  { ref: 'L', type: 'L', nodes: ['a', 'o'], value: 1 },
  { ref: 'C', type: 'C', nodes: ['o', '0'], value: 0.25 },
];
// parallel GCL driven by a current source: Z(s) = (s/C)/(s² + s/(RC) + 1/(LC)) = 2s/(s² + 2s + 4)
const gcl: Spec[] = [
  { ref: 'Is', type: 'I', nodes: ['0', 'o'], value: 1 },
  { ref: 'R', type: 'R', nodes: ['o', '0'], value: 1 },
  { ref: 'L', type: 'L', nodes: ['o', '0'], value: 0.5 },
  { ref: 'C', type: 'C', nodes: ['o', '0'], value: 0.5 },
];
// inverting op-amp with R2 ∥ C feedback: H = −(R2/R1)/(1 + sR2C) = −2/(s + 1)
const opamp: Spec[] = [
  { ref: 'Ui', type: 'V', nodes: ['i', '0'], value: 1 },
  { ref: 'R1', type: 'R', nodes: ['i', 'm'], value: 1 },
  { ref: 'R2', type: 'R', nodes: ['m', 'o'], value: 2 },
  { ref: 'C', type: 'C', nodes: ['m', 'o'], value: 0.5 },
  { ref: 'A', type: 'OPAMP', nodes: ['m', '0', 'o'] },
];

describe('network function H(s)', () => {
  it('RC low-pass', () => {
    const h = networkFunction(net(rc), 'Us', ['o']);
    closeArr(h.num, [2]);
    closeArr(h.den, [2, 1]);
    expect(h.zeros).toEqual([]);
    closeC(h.poles[0], -2, 0);
    closeC(transferAt(net(rc), 'Us', ['o'], { re: 0, im: 2 }), 0.5, -0.5);
    close(q(rc, { kind: 'H', out: ['o'], input: 'Us', s: 0 }), 1);
    close(q(rc, { kind: 'H', out: ['o'], input: 'Us', s: { im: 2 }, part: 'phase' }), -45);
    close(q(rc, { kind: 'pole', out: ['o'], input: 'Us', n: 1 }), -2);
    close(q(rc, { kind: 'hcoef', out: ['o'], input: 'Us', of: 'den', power: 1 }), 1);
    close(q(rc, { kind: 'hcoef', out: ['o'], input: 'Us', of: 'num', power: 0 }), 2);
    close(q(rc, { kind: 'hcoef', out: ['o'], input: 'Us', of: 'num', power: 3 }), 0);
    expect(() => q(rc, { kind: 'zero', out: ['o'], input: 'Us', n: 1 })).toThrow(/finite zeros of H\(s\) are none/);
    // current output: I(s)/U(s) = sC/(1 + sRC) = 0.5s/(s + 2)
    const hi = networkFunction(net(rc), 'Us', { i: 'R' });
    closeArr(hi.num, [0, 0.5]);
    closeArr(hi.den, [2, 1]);
  });

  it('RL high-pass: zero at the origin', () => {
    const h = networkFunction(net(rl), 'Us', ['o']);
    closeArr(h.num, [0, 1]);
    closeArr(h.den, [2, 1]);
    closeC(h.zeros[0], 0, 0);
    close(q(rl, { kind: 'zero', out: ['o'], input: 'Us', n: 1 }, { type: 'dc' }), 0);
  });

  it('series RLC: complex poles, voltage and current outputs', () => {
    const h = networkFunction(net(rlc), 'Us', { v: 'C' });
    closeArr(h.num, [4]);
    closeArr(h.den, [4, 2, 1]);
    closeC(h.poles[0], -1, S3);
    closeC(h.poles[1], -1, -S3);
    close(q(rlc, { kind: 'pole', out: { v: 'C' }, input: 'Us', n: 1, part: 'im' }), S3);
    const hi = networkFunction(net(rlc), 'Us', { i: 'L' });
    closeArr(hi.num, [0, 1]);
    closeArr(hi.den, [4, 2, 1]);
    // H(j2) of the current = j2/(4 − 4 + j4) = 0.5 (series resonance at ω0 = 2)
    closeC(transferAt(net(rlc), 'Us', { i: 'L' }, { re: 0, im: 2 }), 0.5, 0);
  });

  it('parallel GCL input impedance', () => {
    const h = networkFunction(net(gcl), 'Is', ['o']);
    closeArr(h.num, [0, 2]);
    closeArr(h.den, [4, 2, 1]);
  });

  it('op-amp circuit', () => {
    const h = networkFunction(net(opamp), 'Ui', ['o']);
    closeArr(h.num, [-2]);
    closeArr(h.den, [1, 1]);
    close(q(opamp, { kind: 'H', out: ['o'], input: 'Ui', s: 0 }, { type: 'dc' }), -2);
  });

  it('pole–zero cancellation (constant-resistance network)', () => {
    // (R + sL) ∥ (R + 1/(sC)) with R = √(L/C) = 1: Z(s) = 1 for every s
    const z: Spec[] = [
      { ref: 'Is', type: 'I', nodes: ['0', 'a'], value: 1 },
      { ref: 'R1', type: 'R', nodes: ['a', 'x'], value: 1 },
      { ref: 'L', type: 'L', nodes: ['x', '0'], value: 1 },
      { ref: 'R2', type: 'R', nodes: ['a', 'y'], value: 1 },
      { ref: 'C', type: 'C', nodes: ['y', '0'], value: 1 },
    ];
    const h = networkFunction(net(z), 'Is', ['a']);
    closeArr(h.num, [1]);
    closeArr(h.den, [1]);
    expect(h.poles).toEqual([]);
  });

  it('a switch: H(s) of the circuit after t = 0', () => {
    const sw: Spec[] = [...rc, { ref: 'S', type: 'SW', nodes: ['o', 'x'], state: { before: 'open', after: 'closed' } }, { ref: 'R2', type: 'R', nodes: ['x', '0'], value: 2 }];
    // R2 ∥ C after closing: H = (1/2)/(1 + s·1·0.25)… = 2/(s + 4)
    const h = networkFunction(net(sw), 'Us', ['o']);
    closeArr(h.num, [2]);
    closeArr(h.den, [4, 1]);
  });

  it('stability classification', () => {
    expect(stability(net(rlc), 'Us', { v: 'C' })).toBe('stable');
    const lc: Spec[] = [
      { ref: 'Us', type: 'V', nodes: ['i', '0'], value: 1 },
      { ref: 'L', type: 'L', nodes: ['i', 'o'], value: 1 },
      { ref: 'C', type: 'C', nodes: ['o', '0'], value: 1 },
    ];
    expect(stability(net(lc), 'Us', { v: 'C' })).toBe('marginal');
    // negative resistance (CCVS u = −3i) in series with R = 2: net −1 Ω → unstable
    const neg: Spec[] = [
      { ref: 'Us', type: 'V', nodes: ['i', '0'], value: 1 },
      { ref: 'R', type: 'R', nodes: ['i', 'a'], value: 2 },
      { ref: 'H', type: 'CCVS', nodes: ['a', 'b'], value: -3, ctrl: { i: 'R' } },
      { ref: 'L', type: 'L', nodes: ['b', 'o'], value: 1 },
      { ref: 'C', type: 'C', nodes: ['o', '0'], value: 0.25 },
    ];
    expect(stability(net(neg), 'Us', { v: 'C' })).toBe('unstable');
    close(q(neg, { kind: 'pole', out: { v: 'C' }, input: 'Us', n: 1 }), 0.5);
  });
});

describe('impulse and exponential sources (transient solver)', () => {
  it('impulse voltage into series RC: u_C = (1/RC)e^(−t/RC)', () => {
    const s: Spec[] = [
      { ref: 'Us', type: 'V', nodes: ['i', '0'], value: { impulse: { area: 1 } } },
      { ref: 'R', type: 'R', nodes: ['i', 'o'], value: 2 },
      { ref: 'C', type: 'C', nodes: ['o', '0'], value: 0.25 },
    ];
    close(q(s, { kind: 'v', el: 'C', t: '0-' }), 0);
    close(q(s, { kind: 'v', el: 'C', t: '0+' }), 2);
    close(q(s, { kind: 'v', el: 'C', t: 0.3 }), 2 * Math.exp(-0.6));
    close(q(s, { kind: 'i', el: 'R', t: 0.3 }), -4 * 0.25 * Math.exp(-0.6)); // i = C du/dt
    close(q(s, { kind: 'val', el: 'Us', t: 0 }), 1);
  });

  it('impulse current into R ∥ L: i_L jumps to (R/L)·area', () => {
    const s: Spec[] = [
      { ref: 'Is', type: 'I', nodes: ['0', 'o'], value: { impulse: { area: 2 } } },
      { ref: 'R', type: 'R', nodes: ['o', '0'], value: 3 },
      { ref: 'L', type: 'L', nodes: ['o', '0'], value: 1.5 },
    ];
    close(q(s, { kind: 'i', el: 'L', t: '0+' }), 4);
    close(q(s, { kind: 'i', el: 'L', t: 1 }), 4 * Math.exp(-2));
  });

  it('impulse into a capacitor loop is rejected', () => {
    const s: Spec[] = [
      { ref: 'Us', type: 'V', nodes: ['i', '0'], value: { impulse: { area: 1 } } },
      { ref: 'C1', type: 'C', nodes: ['i', '0'], value: 1 },
      { ref: 'R', type: 'R', nodes: ['i', '0'], value: 1 },
    ];
    expect(() => q(s, { kind: 'v', el: 'C1', t: 1 })).toThrow(/impulse sources are not supported/);
  });

  it('exponential source: distinct and repeated poles', () => {
    const mk = (alpha: number): Spec[] => [
      { ref: 'Us', type: 'V', nodes: ['i', '0'], value: { exp: { amp: 5, alpha } } },
      { ref: 'R', type: 'R', nodes: ['i', 'o'], value: 2 },
      { ref: 'C', type: 'C', nodes: ['o', '0'], value: 0.25 },
    ];
    // U_C = 10/((s + 2)(s + 3)) → 10(e^(−2t) − e^(−3t))
    close(q(mk(3), { kind: 'v', el: 'C', t: 0.4 }), 10 * (Math.exp(-0.8) - Math.exp(-1.2)));
    close(q(mk(3), { kind: 'v', el: 'C', t: '0-' }), 0);
    close(q(mk(3), { kind: 'v', el: 'C', t: 'inf' }), 0);
    close(q(mk(3), { kind: 'val', el: 'Us', t: 0.5 }), 5 * Math.exp(-1.5));
    close(q(mk(3), { kind: 'residue', out: { v: 'C' }, at: -2 }), 10);
    close(q(mk(3), { kind: 'residue', out: { v: 'C' }, at: -3 }), -10);
    // α = 2 = 1/RC: U_C = 10/(s + 2)² → 10t·e^(−2t)
    close(q(mk(2), { kind: 'v', el: 'C', t: 0.7 }), 10 * 0.7 * Math.exp(-1.4));
    close(q(mk(2), { kind: 'residue', out: { v: 'C' }, at: -2, order: 2 }), 10);
    close(q(mk(2), { kind: 'residue', out: { v: 'C' }, at: -2 }), 0);
  });
});

describe('response transform Y(s) and partial fractions', () => {
  it('RC with a step and an initial voltage: u_C = 10 − 6e^(−2t)', () => {
    const s: Spec[] = rc.map((e) => (e.ref === 'C' ? { ...e, ic: 4 } : e));
    close(q(s, { kind: 'residue', out: { v: 'C' }, at: 0 }), 10);
    close(q(s, { kind: 'residue', out: { v: 'C' }, at: -2 }), -6);
    close(q(s, { kind: 'v', el: 'C', t: 0.5 }), 10 - 6 * Math.exp(-1));
    expect(() => q(s, { kind: 'residue', out: { v: 'C' }, at: -3 })).toThrow(/not a pole/);
  });

  it('series RLC step: complex pair', () => {
    // U_C = 16/(s(s² + 2s + 4)): K0 = 4, K(−1 + j√3) = (−6 + j2√3)/3
    const K = new Laplace(net(rlc)).residue({ v: 'C' }, { re: -1, im: S3 });
    closeC(K, -2, (2 * S3) / 3);
    close(q(rlc, { kind: 'residue', out: { v: 'C' }, at: 0 }), 4);
    close(q(rlc, { kind: 'residue', out: { v: 'C' }, at: { re: -1, im: S3 }, part: 'mag' }), Math.hypot(2, (2 * S3) / 3));
    const t = 0.7;
    const u = 4 + 2 * Math.exp(-t) * (K.re * Math.cos(S3 * t) - K.im * Math.sin(S3 * t));
    close(q(rlc, { kind: 'v', el: 'C', t }), u);
  });

  it('critically damped: repeated pole', () => {
    // R = 2, L = 1, C = 1, 1 V step: U_C = 1/(s(s + 1)²) = 1/s − 1/(s + 1) − 1/(s + 1)²
    const c: Spec[] = rlc.map((e) => (e.ref === 'C' ? { ...e, value: 1 } : e.ref === 'Us' ? { ...e, value: step(1) } : e));
    close(q(c, { kind: 'residue', out: { v: 'C' }, at: -1, order: 2 }), -1, 1e-6);
    close(q(c, { kind: 'residue', out: { v: 'C' }, at: -1 }), -1, 1e-6);
    close(q(c, { kind: 'v', el: 'C', t: 1.3 }), 1 - Math.exp(-1.3) - 1.3 * Math.exp(-1.3));
  });

  it('initial- and final-value theorems agree with the transient solver', () => {
    const s: Spec[] = rlc.map((e) => (e.ref === 'C' ? { ...e, ic: 1 } : e.ref === 'L' ? { ...e, ic: 0.5 } : e));
    const lp = new Laplace(net(s));
    const sY = (x: number) => {
      const y = lp.at({ v: 'R' }, { re: x, im: 0 });
      return x * y.re;
    };
    close(sY(1e7), q(s, { kind: 'v', el: 'R', t: '0+' }), 1e-5);
    close(sY(1e-7), q(s, { kind: 'v', el: 'R', t: 'inf' }), 1e-5, 1e-6);
  });
});

describe('two routes: matrix exponential vs s-domain circuit + numerical inverse Laplace', () => {
  const cases: [string, Spec[], { v: string } | { i: string }][] = [
    ['RLC with initial state', rlc.map((e) => (e.ref === 'C' ? { ...e, ic: -2 } : e)), { i: 'L' }],
    [
      'switched second-order with a sinusoid',
      [
        { ref: 'Us', type: 'V', nodes: ['i', '0'], value: { sin: { amp: 3, freq: 0.3, phase: 30 } } },
        { ref: 'R', type: 'R', nodes: ['i', 'a'], value: 1 },
        { ref: 'L', type: 'L', nodes: ['a', 'o'], value: 0.5 },
        { ref: 'C', type: 'C', nodes: ['o', '0'], value: 0.5 },
        { ref: 'S', type: 'SW', nodes: ['o', 'x'], state: { before: 'closed', after: 'open' } },
        { ref: 'R2', type: 'R', nodes: ['x', '0'], value: 2 },
      ],
      { v: 'C' },
    ],
    [
      'coupled inductors with an exponential source',
      [
        { ref: 'Us', type: 'V', nodes: ['i', '0'], value: { exp: { amp: 4, alpha: 0.5 } } },
        { ref: 'R1', type: 'R', nodes: ['i', 'a'], value: 2 },
        { ref: 'L1', type: 'L', nodes: ['a', '0'], value: 1, ic: 1 },
        { ref: 'L2', type: 'L', nodes: ['b', '0'], value: 2 },
        { ref: 'R2', type: 'R', nodes: ['b', '0'], value: 3 },
        { ref: 'K', type: 'K', l1: 'L1', l2: 'L2', k: 0.5 },
      ],
      { i: 'R2' },
    ],
    ['op-amp with initial capacitor voltage', opamp.map((e) => (e.ref === 'C' ? { ...e, ic: 1 } : e.ref === 'Ui' ? { ...e, value: step(2) } : e)), { i: 'R2' }],
  ];
  for (const [name, specs, out] of cases)
    it(name, () => {
      const lp = new Laplace(net(specs));
      for (const t of [0.2, 0.9, 2.5]) {
        const f = inverseLaplace((s) => lp.at(out, s), t);
        const kind = 'v' in out ? 'v' : 'i';
        const el = 'v' in out ? out.v : out.i;
        close(f, q(specs, { kind, el, t } as Find), 1e-6, 1e-8);
      }
    });
});
