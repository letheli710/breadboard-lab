// Nonlinear resistors: element laws, operating points (all of them), static / dynamic resistance,
// small-signal response. Every expected value is a closed-form result.
import { describe, expect, it } from 'vitest';
import type { Analysis, Find } from '../problem/types';
import { computeQuantity } from './index';
import { parseLaw, realRoots } from './nonlinear';
import { net, type Spec } from './testutil';

const DC: Analysis = { type: 'dc' };
const AC: Analysis = { type: 'ac', omega: 1, phasor: 'peak' };
const q = (specs: Spec[], an: Analysis, find: Find) => computeQuantity(net(specs), an, find);
function close(actual: number, expected: number, rel = 1e-9) {
  const tol = rel * Math.max(Math.abs(expected), 1e-12);
  if (!(Math.abs(actual - expected) <= tol)) throw new Error(`expected ${expected}, got ${actual}`);
}

/** Us — R — a — NR — ground */
const divider = (us: unknown, r: number, law: unknown): Spec[] => [
  { ref: 'Us', type: 'V', nodes: ['s', '0'], value: us },
  { ref: 'R', type: 'R', nodes: ['s', 'a'], value: r },
  { ref: 'D', type: 'NR', nodes: ['a', '0'], law },
];

describe('polynomial real roots', () => {
  it('double and simple roots, intervals, identically zero', () => {
    // (x − 1)²(x + 2) = x³ − 3x + 2
    const r = realRoots([2, -3, 0, 1], -Infinity, Infinity);
    expect(r.length).toBe(2);
    close(r[0], -2, 1e-9);
    close(r[1], 1, 1e-6);
    expect(realRoots([2, -3, 0, 1], 0, Infinity).length).toBe(1);
    expect(realRoots([1, 0, 1], -Infinity, Infinity)).toEqual([]);
    const s = realRoots([-6, 11, -6, 1], -Infinity, Infinity); // 1, 2, 3
    s.forEach((x, k) => close(x, k + 1, 1e-12));
    expect(() => realRoots([0], 0, 1)).toThrow();
  });
});

describe('laws', () => {
  it('parse and reject', () => {
    expect(parseLaw('D', { i: [0, 0, 1], umin: 0 }).pieces.length).toBe(2);
    expect(parseLaw('D', { pwl: [[0, 0], [1, 1], [2, 0]] }).pieces.length).toBe(2);
    expect(parseLaw('D', { diode: {} }).diode).toBe(true);
    expect(() => parseLaw('D', {})).toThrow(/law/);
    expect(() => parseLaw('D', { i: [0, 1], u: [0, 1] })).toThrow(/exactly one/);
    expect(() => parseLaw('D', { pwl: [[0, 0]] })).toThrow(/two/);
    expect(() => parseLaw('D', { i: [0, 1], imin: 0 })).toThrow(/unknown field/);
    expect(() => parseLaw('D', { diode: { ron: -1 } })).toThrow(/ron/);
  });
});

describe('operating point: square law i = u² (u ≥ 0)', () => {
  const c = divider(10, 1, { i: [0, 0, 1], umin: 0 });
  const uq = (-1 + Math.sqrt(41)) / 2; // u + u² = 10, the positive root
  it('U_Q, I_Q, power, static and dynamic resistance', () => {
    close(q(c, DC, { kind: 'v', el: 'D' }), uq);
    close(q(c, DC, { kind: 'i', el: 'D' }), uq * uq);
    close(q(c, DC, { kind: 'i', el: 'R' }), uq * uq);
    close(q(c, DC, { kind: 'v', nodes: ['a'] }), uq);
    close(q(c, DC, { kind: 'p', el: 'D' }), uq ** 3);
    close(q(c, DC, { kind: 'rs', el: 'D' }), 1 / uq);
    close(q(c, DC, { kind: 'rd', el: 'D' }), 1 / (2 * uq));
    expect(q(c, DC, { kind: 'nop' })).toBe(1);
  });
  it('the negative root of the quadratic is not an operating point', () => {
    // with no umin the law i = u² is bilateral and u² + u − 10 = 0 has two roots
    const both = divider(10, 1, { i: [0, 0, 1] });
    expect(q(both, DC, { kind: 'nop' })).toBe(2);
    close(q(both, DC, { kind: 'v', el: 'D', op: 1 }), (-1 - Math.sqrt(41)) / 2);
    expect(() => q(both, DC, { kind: 'v', el: 'D' })).toThrow(/2 DC operating points/);
  });
  it('reverse source: the element is cut off (u < 0 → i = 0)', () => {
    const r = divider(-3, 1, { i: [0, 0, 1], umin: 0 });
    close(q(r, DC, { kind: 'v', el: 'D' }), -3);
    close(q(r, DC, { kind: 'i', el: 'D' }), 0);
    expect(() => q(r, DC, { kind: 'rd', el: 'D' })).toThrow(/infinite/);
    expect(() => q(r, DC, { kind: 'rs', el: 'D' })).toThrow(/zero/);
  });
});

describe('current-controlled law u = i + i³', () => {
  it('unique operating point, rd = 1 + 3i²', () => {
    // u = 10 − 1·i and u = i + i³ → i³ + 2i − 10 = 0
    const c = divider(10, 1, { u: [0, 1, 0, 1] });
    const i = q(c, DC, { kind: 'i', el: 'D' });
    close(i ** 3 + 2 * i - 10, 0, 1);
    expect(Math.abs(i ** 3 + 2 * i - 10)).toBeLessThan(1e-9);
    close(q(c, DC, { kind: 'v', el: 'D' }), i + i ** 3);
    close(q(c, DC, { kind: 'rd', el: 'D' }), 1 + 3 * i * i);
  });
});

describe('ideal diode models', () => {
  it('ideal diode forward / reverse', () => {
    close(q(divider(5, 1000, { diode: {} }), DC, { kind: 'i', el: 'D' }), 5e-3);
    close(q(divider(5, 1000, { diode: {} }), DC, { kind: 'v', el: 'D' }), 0);
    close(q(divider(-5, 1000, { diode: {} }), DC, { kind: 'v', el: 'D' }), -5);
    close(q(divider(-5, 1000, { diode: {} }), DC, { kind: 'i', el: 'D' }), 0);
  });
  it('threshold + on-resistance', () => {
    const c = divider(5, 1000, { diode: { uon: 0.7, ron: 10 } });
    const i = 4.3 / 1010;
    close(q(c, DC, { kind: 'i', el: 'D' }), i);
    close(q(c, DC, { kind: 'v', el: 'D' }), 0.7 + 10 * i);
    close(q(c, DC, { kind: 'rd', el: 'D' }), 10);
    // below the threshold: off
    close(q(divider(0.5, 1000, { diode: { uon: 0.7 } }), DC, { kind: 'v', el: 'D' }), 0.5);
  });
  it('corner: rd undefined', () => {
    // 0 V source: the diode sits at its corner (0, 0)
    expect(() => q(divider(0, 1000, { diode: {} }), DC, { kind: 'rd', el: 'D' })).toThrow(/corner/);
  });
  it('two diodes: half-wave clamp, assumed states checked by enumeration', () => {
    // Us = 10 V – 1k – a; D1 a→0; D2 from 0 to a (reverse). D1 conducts, D2 off
    const c: Spec[] = [
      { ref: 'Us', type: 'V', nodes: ['s', '0'], value: 10 },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 1000 },
      { ref: 'D1', type: 'NR', nodes: ['a', 'b'], law: { diode: { uon: 0.7 } } },
      { ref: 'R2', type: 'R', nodes: ['b', '0'], value: 1000 },
      { ref: 'D2', type: 'NR', nodes: ['a', '0'], law: { diode: { uon: 3 } } },
    ];
    // D2 clamps a at 3 V (D1 path would draw (3 − 0.7)/1k = 2.3 mA; R supplies 7 mA)
    close(q(c, DC, { kind: 'v', nodes: ['a'] }), 3);
    close(q(c, DC, { kind: 'i', el: 'D1' }), 2.3e-3);
    close(q(c, DC, { kind: 'i', el: 'D2' }), 7e-3 - 2.3e-3);
    expect(q(c, DC, { kind: 'nop' })).toBe(1);
  });
});

describe('operating point at a corner is found once', () => {
  it('Us = 3 V, R = 1 kΩ meets the PWL curve at u = 0.75 V and at the corner (2 V, 1 mA)', () => {
    const c = divider(3, 1000, { pwl: [[0, 0], [1, 3e-3], [2, 1e-3], [4, 5e-3]] });
    expect(q(c, DC, { kind: 'nop' })).toBe(2);
    close(q(c, DC, { kind: 'v', el: 'D', op: 1 }), 0.75);
    close(q(c, DC, { kind: 'v', el: 'D', op: 2 }), 2);
  });
});

describe('tunnel-diode-like PWL with three operating points', () => {
  const law = { pwl: [[0, 0], [1, 3e-3], [2, 1e-3], [4, 5e-3]] };
  it('Us = 2.5 V, R = 1 kΩ', () => {
    const c = divider(2.5, 1000, law);
    // seg 0: 3u = 2.5 − u → u = 0.625 ; seg 1: 5 − 2u = 2.5 − u → u = 2.5 (outside [1, 2]) ✗
    // so 1 point; use R = 500 Ω: load i = (2.5 − u)/0.5 = 5 − 2u (mA) — coincides with seg 1 → infinite
    expect(q(c, DC, { kind: 'nop' })).toBe(1);
    expect(() => q(divider(2.5, 500, law), DC, { kind: 'nop' })).toThrow(/infinitely many/);
  });
  it('Us = 3.6 V, R = 1 kΩ: three points', () => {
    const c = divider(3.6, 1000, law);
    // seg 0: 3u = 3.6 − u → 0.9 ; seg 1: 5 − 2u = 3.6 − u → 1.4 ; seg 2: 2u − 3 = 3.6 − u → 2.2
    expect(q(c, DC, { kind: 'nop' })).toBe(3);
    close(q(c, DC, { kind: 'v', el: 'D', op: 1 }), 0.9);
    close(q(c, DC, { kind: 'v', el: 'D', op: 2 }), 1.4);
    close(q(c, DC, { kind: 'v', el: 'D', op: 3 }), 2.2);
    close(q(c, DC, { kind: 'i', el: 'D', op: 2 }), 2.2e-3);
    close(q(c, DC, { kind: 'rd', el: 'D', op: 2 }), -500);
    expect(() => q(c, DC, { kind: 'v', el: 'D', op: 4 })).toThrow(/op must be 1…3/);
  });
});

describe('small-signal analysis', () => {
  const law = { i: [0, 0, 1], umin: 0 };
  const uq = (-1 + Math.sqrt(41)) / 2;
  const rd = 1 / (2 * uq);
  const c = divider({ dc: 10, ac: { mag: 0.01 } }, 1, law);
  it('Δu = Δu_s · r_d/(R + r_d), matches the difference of two full solutions', () => {
    const du = q(c, AC, { kind: 'v', el: 'D' });
    close(du, (0.01 * rd) / (1 + rd));
    // total response check: (U(10.001) − U(9.999)) / 0.002 ≈ du/0.01
    const U = (us: number) => q(divider(us, 1, law), DC, { kind: 'v', el: 'D' });
    close((U(10 + 1e-4) - U(10 - 1e-4)) / 2e-4, du / 0.01, 1e-6);
    close(q(c, AC, { kind: 'i', el: 'D' }), 0.01 / (1 + rd));
    close(q(c, AC, { kind: 'v', el: 'D', part: 'phase' }), 0);
    // the operating point from the same AC problem
    close(q(c, AC, { kind: 'v', el: 'D', dc: true }), uq);
    close(q(c, AC, { kind: 'rd', el: 'D' }), rd);
  });
  it('req: small-signal resistance seen at a port (R ∥ r_d)', () => {
    close(q(c, DC, { kind: 'req', port: ['a', '0'] }), rd / (1 + rd));
  });
  it('vth needs the NR excluded', () => {
    expect(() => q(c, DC, { kind: 'vth', port: ['a', '0'] })).toThrow(/exclude/);
    close(q(c, DC, { kind: 'vth', port: ['a', '0'], exclude: ['D'] }), 10);
  });
  it('find.dc in a linear AC problem is the DC solution', () => {
    const lin: Spec[] = [
      { ref: 'Us', type: 'V', nodes: ['s', '0'], value: { dc: 6, ac: { mag: 1 } } },
      { ref: 'R1', type: 'R', nodes: ['s', 'a'], value: 1 },
      { ref: 'R2', type: 'R', nodes: ['a', '0'], value: 2 },
    ];
    close(q(lin, AC, { kind: 'v', nodes: ['a'], dc: true }), 4);
    close(q(lin, AC, { kind: 'v', nodes: ['a'] }), 2 / 3);
  });
});

describe('several curved elements (Newton) and errors', () => {
  it('i = u1² in series with u2 = i + i³ across 3 V: i = 1 A', () => {
    const c: Spec[] = [
      { ref: 'Us', type: 'V', nodes: ['s', '0'], value: 3 },
      { ref: 'N1', type: 'NR', nodes: ['s', 'a'], law: { i: [0, 0, 1], umin: 0 } },
      { ref: 'N2', type: 'NR', nodes: ['a', '0'], law: { u: [0, 1, 0, 1] } },
    ];
    close(q(c, DC, { kind: 'i', el: 'N2' }), 1, 1e-9);
    close(q(c, DC, { kind: 'v', el: 'N1' }), 1, 1e-9);
    close(q(c, DC, { kind: 'v', el: 'N2' }), 2, 1e-9);
    expect(q(c, DC, { kind: 'nop' })).toBe(1);
  });
  it('no operating point; transient refused; rd on a linear circuit', () => {
    // current source 5 A into an element whose current can never exceed 1 A
    const c: Spec[] = [
      { ref: 'Is', type: 'I', nodes: ['0', 'a'], value: 5 },
      { ref: 'D', type: 'NR', nodes: ['a', '0'], law: { pwl: [[-1, -1], [0, 0], [1, 1], [2, 1]] } },
    ];
    expect(() => q(c, DC, { kind: 'v', el: 'D' })).toThrow(/no DC operating point/);
    expect(() => q(divider(1, 1, { diode: {} }), { type: 'tran' }, { kind: 'v', el: 'D', t: 0 })).toThrow(/not in transient/);
    expect(() => q([{ ref: 'R', type: 'R', nodes: ['a', '0'], value: 1 }, { ref: 'I', type: 'I', nodes: ['0', 'a'], value: 1 }], DC, { kind: 'rd', el: 'R' })).toThrow(/needs a nonlinear/);
  });
  it('series PWL elements: graphical series combination', () => {
    // two ideal diodes with thresholds 0.6 V and 1.4 V in series + 1 kΩ from 5 V: i = 3 mA
    const c: Spec[] = [
      { ref: 'Us', type: 'V', nodes: ['s', '0'], value: 5 },
      { ref: 'R', type: 'R', nodes: ['s', 'a'], value: 1000 },
      { ref: 'D1', type: 'NR', nodes: ['a', 'b'], law: { diode: { uon: 0.6 } } },
      { ref: 'D2', type: 'NR', nodes: ['b', '0'], law: { diode: { uon: 1.4 } } },
    ];
    close(q(c, DC, { kind: 'i', el: 'R' }), 3e-3);
    close(q(c, DC, { kind: 'v', nodes: ['b'] }), 1.4);
  });
});
