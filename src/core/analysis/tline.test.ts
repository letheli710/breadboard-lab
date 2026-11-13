// Transmission lines (TL): closed-form checks of the exact two-port and the derived quantities,
// the bounce-diagram transient, and the lumped RLGC ladder converging to the exact line.
import { describe, expect, it } from 'vitest';
import type { Analysis, Complex, Find } from '../problem/types';
import { abs, cx, div, mul } from './complex';
import { computeComplex, computeQuantity } from './engine';
import { cosh, lineAt, parseLine, sinh } from './tline';
import { net, type Spec } from './testutil';

const close = (a: number, b: number, rel = 1e-9, absTol = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThanOrEqual(Math.max(rel * Math.abs(b), absTol));
const closeC = (a: Complex, b: Complex, rel = 1e-9) =>
  expect(abs({ re: a.re - b.re, im: a.im - b.im }), `${JSON.stringify(a)} vs ${JSON.stringify(b)}`).toBeLessThanOrEqual(rel * Math.max(1, abs(b)));

const F = 1e6;
const W = 2 * Math.PI * F;
const AC: Analysis = { type: 'ac', freq: F };
const lossless = (zc: number, length: number, vp = 2e8) => ({ zc, vp, length });

/** source Us (1∠0) with series Rs → line from a to b → load spec between b and 0 */
function circuit(line: Record<string, unknown>, load: Spec | null, rs = 0, us: unknown = 1): ReturnType<typeof net> {
  const specs: Spec[] = [
    { ref: 'Us', type: 'V', nodes: ['s', '0'], value: us },
    { ref: 'Rs', type: 'R', nodes: ['s', 'a'], value: rs },
    { ref: 'TL', type: 'TL', nodes: ['a', '0', 'b', '0'], line },
  ];
  if (load) specs.push(load);
  return net(specs);
}
const tl = (what: string, extra: Record<string, unknown> = {}) => ({ kind: 'tl', el: 'TL', what, ...extra }) as unknown as Find;
const cv = (n: ReturnType<typeof net>, f: Find, a: Analysis = AC) => computeComplex(n, a, f).value;

describe('transmission line: line constants', () => {
  it('lossless {zc, vp}: β = ω/vp, λ = vp/f, Z_c real', () => {
    const n = circuit(lossless(50, 30), { ref: 'RL', type: 'R', nodes: ['b', '0'], value: 50 });
    close(computeQuantity(n, AC, tl('beta')), W / 2e8);
    close(computeQuantity(n, AC, tl('lambda')), 200);
    close(computeQuantity(n, AC, tl('vp')), 2e8);
    close(computeQuantity(n, AC, tl('alpha')), 0, 1e-12, 1e-15);
    close(computeQuantity(n, AC, tl('wavelengths')), 30 / 200);
    close(computeQuantity(n, AC, tl('delay')), 30 / 2e8);
    closeC(cv(n, tl('zc')), cx(50));
  });

  it('RLGC: Z_c = √(Z0/Y0), γ = √(Z0·Y0) with Re γ ≥ 0 and Z_c·γ = Z0', () => {
    const s = parseLine('T', { R0: 0.08e-3, L0: 1.3e-6, G0: 0.05e-9, C0: 8.6e-12, length: 300e3 });
    const at = lineAt(s, 2 * Math.PI * 50);
    expect(at.gamma.re).toBeGreaterThan(0);
    expect(at.gamma.im).toBeGreaterThan(0);
    closeC(mul(at.zc, at.gamma), at.Z0);
    closeC(div(at.gamma, at.zc), at.Y0);
  });

  it('distortionless line (R0/L0 = G0/C0): Z_c = √(L0/C0) real, α = √(R0·G0), v = 1/√(L0·C0) at every frequency', () => {
    const line = { R0: 0.02, L0: 2e-6, G0: 1e-6, C0: 1e-10, length: 1000 };
    const n = circuit(line, { ref: 'RL', type: 'R', nodes: ['b', '0'], value: 141.42 });
    for (const f of [1e3, 1e5, 3e6]) {
      const a: Analysis = { type: 'ac', freq: f };
      closeC(cv(n, tl('zc'), a), cx(Math.sqrt(2e-6 / 1e-10)));
      close(computeQuantity(n, a, tl('alpha')), Math.sqrt(0.02 * 1e-6));
      close(computeQuantity(n, a, tl('vp')), 1 / Math.sqrt(2e-16));
    }
  });
});

describe('transmission line: steady state against the textbook closed forms', () => {
  const zc = 50;
  const l = 30; // λ = 200 m at 1 MHz with vp = 2e8
  const bl = (2 * Math.PI * l) / 200;

  it('matched: Z_in = Z_c, Γ = 0, VSWR = 1, |U| constant, U̇(x) = U̇1·e^(−jβx)', () => {
    const n = circuit(lossless(zc, l), { ref: 'RL', type: 'R', nodes: ['b', '0'], value: zc }, 0, 10);
    closeC(cv(n, tl('z')), cx(zc));
    close(computeQuantity(n, AC, { ...tl('refl'), part: 'mag' } as Find), 0, 1e-9, 1e-12);
    close(computeQuantity(n, AC, tl('vswr')), 1);
    close(computeQuantity(n, AC, tl('umax')), 10, 1e-7);
    close(computeQuantity(n, AC, tl('umin')), 10, 1e-7);
    const x = 12;
    closeC(cv(n, tl('u', { x })), { re: 10 * Math.cos((-W / 2e8) * x), im: 10 * Math.sin((-W / 2e8) * x) });
    closeC(cv(n, tl('uref', { x })), cx(0));
  });

  it('open end: Z_in = −jZ_c·cot βl; short end: Z_in = jZ_c·tan βl', () => {
    const open = circuit(lossless(zc, l), null);
    closeC(cv(open, tl('z')), cx(0, -zc / Math.tan(bl)));
    closeC(cv(open, tl('refl')), cx(1));
    const short = circuit(lossless(zc, l), { ref: 'W', type: 'R', nodes: ['b', '0'], value: 0 });
    closeC(cv(short, tl('z')), cx(0, zc * Math.tan(bl)));
    closeC(cv(short, tl('refl')), cx(-1));
  });

  it('λ/4 transformer: Z_in = Z_c²/Z_L; λ/2: Z_in = Z_L', () => {
    const ZL = { ref: 'ZL', type: 'Z', nodes: ['b', '0'], value: { re: 30, im: 40 } };
    const q = circuit(lossless(zc, 50), ZL);
    closeC(cv(q, tl('z')), div(cx(zc * zc), cx(30, 40)));
    const h = circuit(lossless(zc, 100), ZL);
    closeC(cv(h, tl('z')), cx(30, 40));
  });

  it('Γ(x′) = Γ_2·e^(−2γx′), VSWR, and the positions of the first maximum / minimum', () => {
    const n = circuit(lossless(zc, l), { ref: 'RL', type: 'R', nodes: ['b', '0'], value: 150 }, 0, 1);
    const g2 = cv(n, tl('refl'));
    closeC(g2, cx(0.5));
    close(computeQuantity(n, AC, tl('vswr')), 3);
    const xp = 7;
    const beta = W / 2e8;
    closeC(cv(n, tl('refl', { x: xp, from: 'end' })), { re: 0.5 * Math.cos(-2 * beta * xp), im: 0.5 * Math.sin(-2 * beta * xp) });
    // R_L > Z_c: voltage maximum at the load, minimum λ/4 away
    close(computeQuantity(n, AC, tl('xmax')), 0, 1e-9, 1e-9);
    close(computeQuantity(n, AC, tl('xmin')), 50);
    // R_L < Z_c: the other way round
    const m = circuit(lossless(zc, l), { ref: 'RL', type: 'R', nodes: ['b', '0'], value: 25 });
    close(computeQuantity(m, AC, tl('xmin')), 0, 1e-9, 1e-9);
    close(computeQuantity(m, AC, tl('xmax')), 50);
  });

  it('U_max / U_min = VSWR on a line longer than λ/2; U_max = |U⁺|(1 + |Γ|)', () => {
    const n = circuit(lossless(zc, 130), { ref: 'RL', type: 'R', nodes: ['b', '0'], value: 150 }, 50, 10);
    const up = computeQuantity(n, AC, tl('uinc', { x: 0, from: 'end' }));
    close(computeQuantity(n, AC, tl('umax')), up * 1.5, 1e-7);
    close(computeQuantity(n, AC, tl('umin')), up * 0.5, 1e-7);
    close(computeQuantity(n, AC, tl('imax')), (up * 1.5) / zc, 1e-7);
  });

  it('lossy line: U̇1 = U̇2·ch γl + Z_c·İ2·sh γl, İ1 = U̇2/Z_c·sh γl + İ2·ch γl; power and efficiency', () => {
    const line = { R0: 0.1e-3, L0: 1.3e-6, G0: 0, C0: 9e-12, length: 200e3 };
    const a: Analysis = { type: 'ac', freq: 50 };
    const n = circuit(line, { ref: 'RL', type: 'R', nodes: ['b', '0'], value: 400 }, 0, 220e3);
    const at = lineAt(parseLine('TL', line), 2 * Math.PI * 50);
    const U2 = cv(n, { kind: 'v', nodes: ['b'] } as Find, a);
    const I2 = div(U2, cx(400));
    const gl = { re: at.gamma.re * 200e3, im: at.gamma.im * 200e3 };
    const U1 = { re: 0, im: 0 };
    const t1 = mul(U2, cosh(gl));
    const t2 = mul(mul(at.zc, I2), sinh(gl));
    U1.re = t1.re + t2.re;
    U1.im = t1.im + t2.im;
    closeC(U1, cx(220e3), 1e-9);
    const I1a = mul(div(U2, at.zc), sinh(gl));
    const I1b = mul(I2, cosh(gl));
    closeC(cv(n, tl('i', { x: 0 }), a), { re: I1a.re + I1b.re, im: I1a.im + I1b.im });
    const p2 = computeQuantity(n, a, tl('p', { x: 0, from: 'end' }));
    close(p2, abs(U2) ** 2 / 400);
    close(computeQuantity(n, a, { kind: 'p', el: 'RL' } as Find), p2);
    close(computeQuantity(n, a, tl('eta')), p2 / computeQuantity(n, a, tl('p', { x: 0 })));
  });

  it('matched lossy line: η = e^(−2αl)', () => {
    const line = { R0: 0.01, L0: 2.5e-7, G0: 0, C0: 1e-10, length: 500 };
    const a: Analysis = { type: 'ac', freq: 1e6 };
    const at = lineAt(parseLine('TL', line), 2 * Math.PI * 1e6);
    const ZL = { ref: 'ZL', type: 'Z', nodes: ['b', '0'], value: at.zc };
    const n = circuit(line, ZL, 0, 1);
    close(computeQuantity(n, a, tl('eta')), Math.exp(-2 * at.gamma.re * 500), 1e-9);
    close(computeQuantity(n, a, { ...tl('z'), part: 're' } as Find), at.zc.re, 1e-9);
  });

  it('the line inside the ordinary analysis: two-port parameters A = ch γl, B = Z_c·sh γl', () => {
    const n = net([{ ref: 'TL', type: 'TL', nodes: ['1', '0', '2', '0'], line: lossless(50, 20) }]);
    const b = (W / 2e8) * 20;
    close(
      computeQuantity(n, AC, {
        kind: 'twoport',
        ports: [
          ['1', '0'],
          ['2', '0'],
        ],
        param: 'a',
        part: 're',
      } as Find),
      Math.cos(b),
    );
    close(
      computeQuantity(n, AC, {
        kind: 'twoport',
        ports: [
          ['1', '0'],
          ['2', '0'],
        ],
        param: 'b',
        part: 'im',
      } as Find),
      50 * Math.sin(b),
    );
  });
});

describe('transmission line: lumped RLGC π-sections converge to the exact line', () => {
  /** n π-sections (C/2 – R+L – C/2, G likewise) of the given line, between nodes a and b */
  function ladder(n: number, line: { R0: number; L0: number; G0: number; C0: number; length: number }, load: Spec): ReturnType<typeof net> {
    const d = line.length / n;
    const specs: Spec[] = [{ ref: 'Us', type: 'V', nodes: ['a', '0'], value: 1 }, load];
    for (let k = 0; k < n; k++) {
      const p = k === 0 ? 'a' : `m${k}`;
      const q = k === n - 1 ? 'b' : `m${k + 1}`;
      specs.push({ ref: `R${k}`, type: 'R', nodes: [p, `r${k}`], value: line.R0 * d });
      specs.push({ ref: `L${k}`, type: 'L', nodes: [`r${k}`, q], value: line.L0 * d });
    }
    for (let k = 0; k <= n; k++) {
      const node = k === 0 ? 'a' : k === n ? 'b' : `m${k}`;
      const share = k === 0 || k === n ? 0.5 : 1;
      specs.push({ ref: `C${k}`, type: 'C', nodes: [node, '0'], value: line.C0 * d * share });
      if (line.G0 > 0) specs.push({ ref: `G${k}`, type: 'R', nodes: [node, '0'], value: 1 / (line.G0 * d * share) });
    }
    return net(specs);
  }

  it('input impedance and load voltage: error falls like 1/N²', () => {
    const line = { R0: 0.05, L0: 2.5e-7, G0: 2e-6, C0: 1e-10, length: 40 };
    const load: Spec = { ref: 'RL', type: 'R', nodes: ['b', '0'], value: 120 };
    const exact = net([{ ref: 'Us', type: 'V', nodes: ['a', '0'], value: 1 }, { ref: 'TL', type: 'TL', nodes: ['a', '0', 'b', '0'], line }, load]);
    const a: Analysis = { type: 'ac', freq: 1e6 };
    const zx = cv(exact, tl('z'), a);
    const ux = cv(exact, { kind: 'v', nodes: ['b'] } as Find, a);
    const errs: number[] = [];
    for (const N of [10, 40, 160]) {
      const lad = ladder(N, line, load);
      const i = cv(lad, { kind: 'i', el: 'Us' } as Find, a);
      const z = div(cx(-1), i);
      const u = cv(lad, { kind: 'v', nodes: ['b'] } as Find, a);
      errs.push(Math.max(abs({ re: z.re - zx.re, im: z.im - zx.im }) / abs(zx), abs({ re: u.re - ux.re, im: u.im - ux.im }) / abs(ux)));
    }
    expect(errs[2]).toBeLessThan(2e-4);
    expect(errs[0] / errs[1]).toBeGreaterThan(10); // ≈ 16 for second-order convergence
    expect(errs[1] / errs[2]).toBeGreaterThan(10);
  });
});

describe('transmission line: transient by the bounce diagram', () => {
  const T = 1e-6; // l = 200 m, v = 2e8 m/s
  const tr: Analysis = { type: 'tran' };
  const mk = (rs: number, load: Spec | null) =>
    net([
      { ref: 'Us', type: 'V', nodes: ['s', '0'], value: { step: { before: 0, after: 10 } } },
      { ref: 'Rs', type: 'R', nodes: ['s', 'a'], value: rs },
      { ref: 'TL', type: 'TL', nodes: ['a', '0', 'b', '0'], line: lossless(50, 200) },
      ...(load ? [load] : []),
    ]);
  const q = (n: ReturnType<typeof net>, what: string, x: number, t: number | string) => computeQuantity(n, tr, { kind: 'tl', el: 'TL', what, x, t } as unknown as Find);

  it('R_s = 25 Ω, R_L = 150 Ω: launch 6.67 V, Γ_2 = 0.5, Γ_1 = −1/3', () => {
    const n = mk(25, { ref: 'RL', type: 'R', nodes: ['b', '0'], value: 150 });
    const a0 = (10 * 50) / 75;
    close(q(n, 'u', 0, 0.1 * T), a0);
    close(q(n, 'u', 100, 0.4 * T), 0); // the front has not arrived at the middle yet
    close(q(n, 'u', 100, 0.6 * T), a0);
    close(q(n, 'u', 200, 1.5 * T), a0 * 1.5);
    close(q(n, 'u', 0, 2.5 * T), a0 * (1 + 0.5 - 0.5 / 3));
    close(q(n, 'i', 200, 1.5 * T), (a0 * 1.5) / 150);
    close(q(n, 'u', 100, 'inf'), (10 * 150) / 175);
    close(computeQuantity(n, tr, { kind: 'tl', el: 'TL', what: 'refl' } as unknown as Find), 0.5);
    close(computeQuantity(n, tr, { kind: 'tl', el: 'TL', what: 'reflSource' } as unknown as Find), -1 / 3);
    // other elements by substitution: the load current and the source-resistor voltage
    close(computeQuantity(n, tr, { kind: 'i', el: 'RL', t: 1.5 * T } as Find), (a0 * 1.5) / 150);
    close(computeQuantity(n, tr, { kind: 'v', el: 'Rs', t: 0.5 * T } as Find), 10 - a0);
  });

  it('open end with a matched source: the far end jumps to the full source voltage at t = T', () => {
    const n = mk(50, null);
    close(q(n, 'u', 200, 0.9 * T), 0);
    close(q(n, 'u', 200, 1.1 * T), 10);
    close(q(n, 'u', 0, 1.5 * T), 5);
    close(q(n, 'u', 0, 2.5 * T), 10);
    close(computeQuantity(n, tr, { kind: 'v', nodes: ['b'], t: 1.2 * T } as Find), 10);
  });

  it('agrees with a fine lumped LC ladder (exact matrix-exponential transient) on the plateaus', () => {
    const N = 60;
    const L0 = 50 / 2e8;
    const C0 = 1 / (50 * 2e8);
    const d = 200 / N;
    const specs: Spec[] = [
      { ref: 'Us', type: 'V', nodes: ['s', '0'], value: { step: { before: 0, after: 10 } } },
      { ref: 'Rs', type: 'R', nodes: ['s', 'm0'], value: 25 },
      { ref: 'RL', type: 'R', nodes: [`m${N}`, '0'], value: 150 },
    ];
    for (let k = 0; k < N; k++) specs.push({ ref: `L${k}`, type: 'L', nodes: [`m${k}`, `m${k + 1}`], value: L0 * d });
    for (let k = 0; k <= N; k++) specs.push({ ref: `C${k}`, type: 'C', nodes: [`m${k}`, '0'], value: C0 * d * (k === 0 || k === N ? 0.5 : 1) });
    const lad = net(specs);
    const exact = mk(25, { ref: 'RL', type: 'R', nodes: ['b', '0'], value: 150 });
    // the ladder rings (Gibbs) after every front: compare plateau averages over (t − 0.3T, t + 0.3T)
    for (const t of [1.5 * T, 3.5 * T, 5.5 * T]) {
      let ul = 0;
      for (let k = -6; k <= 6; k++) ul += computeQuantity(lad, tr, { kind: 'v', nodes: [`m${N}`], t: t + (k / 20) * T } as Find) / 13;
      const ue = q(exact, 'u', 200, t);
      expect(Math.abs(ul - ue) / ue, `t = ${t}: ladder ${ul} vs bounce ${ue}`).toBeLessThan(0.02);
    }
  });
});
