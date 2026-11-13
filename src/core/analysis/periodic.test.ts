// Non-sinusoidal periodic analysis (periodic.ts, fourier.ts) against closed-form results, and
// against an independent time-domain path (the exact transient solver sampled over one period).
import { describe, expect, it } from 'vitest';
import type { Analysis, Find, WaveShape } from '../problem/types';
import { computeQuantity } from './index';
import { waveExact, waveSpectrum, WAVE_SHAPES } from './fourier';
import { net, type Spec } from './testutil';

function close(actual: number, expected: number, rel = 1e-9, abs = 1e-12) {
  const tol = Math.max(rel * Math.abs(expected), abs);
  if (!(Math.abs(actual - expected) <= tol)) throw new Error(`expected ${expected}, got ${actual}`);
}
const PER = (omega: number, phasor?: 'peak' | 'rms'): Analysis => ({ type: 'periodic', omega, ...(phasor ? { phasor } : {}) });
const q = (specs: Spec[], an: Analysis, find: Find) => computeQuantity(net(specs), an, find);

/** the waveforms as defined in types.ts (T = 1) */
function waveAt(shape: WaveShape, A: number, t: number): number {
  const x = t - Math.floor(t);
  switch (shape) {
    case 'square':
      return x < 0.5 ? A : -A;
    case 'triangle':
      return x < 0.25 ? 4 * A * x : x < 0.75 ? A * (2 - 4 * x) : A * (4 * x - 4);
    case 'sawtooth':
      return A * x;
    case 'half-rect':
      return Math.max(0, A * Math.cos(2 * Math.PI * x));
    case 'full-rect':
      return Math.abs(A * Math.cos(Math.PI * x));
  }
}

describe('Fourier series of the standard waveforms', () => {
  // numerical Fourier integrals (midpoint rule, 200 000 points) of the time-domain definitions
  const N = 200000;
  for (const shape of WAVE_SHAPES)
    it(`${shape}: coefficients match the numerical Fourier integral; rms / averages match the exact values`, () => {
      const A = 3;
      const sp = waveSpectrum(shape, A, 9);
      let a0 = 0;
      const ab = Array.from({ length: 10 }, () => [0, 0]);
      for (let i = 0; i < N; i++) {
        const t = (i + 0.5) / N;
        const x = waveAt(shape, A, t);
        a0 += x / N;
        for (let k = 1; k <= 9; k++) {
          ab[k][0] += (2 * x * Math.cos(2 * Math.PI * k * t)) / N;
          ab[k][1] += (2 * x * Math.sin(2 * Math.PI * k * t)) / N;
        }
      }
      close(sp.dc, a0, 1e-6, 1e-6);
      for (let k = 1; k <= 9; k++) {
        // x = a cos + b sin = amp·cos(kωt + φ) with amp cos φ = a, −amp sin φ = b
        const t = sp.terms.find((h) => h.k === k);
        const a = t ? t.amp * Math.cos((t.phase * Math.PI) / 180) : 0;
        const b = t ? -t.amp * Math.sin((t.phase * Math.PI) / 180) : 0;
        close(a, ab[k][0], 0, 2e-5);
        close(b, ab[k][1], 0, 2e-5);
        if (t) expect(t.amp).toBeGreaterThan(0);
      }
      // the engine's whole-waveform values of a long series approach the exact ones
      const specs: Spec[] = [
        { ref: 'Us', type: 'V', nodes: ['a', '0'], value: { wave: { shape, amp: A, upTo: 199 } } },
        { ref: 'R', type: 'R', nodes: ['a', '0'], value: 1 },
      ];
      const ex = waveExact(shape, A);
      const an = PER(2 * Math.PI);
      close(q(specs, an, { kind: 'v', el: 'R' }), ex.rms, 3e-3);
      close(q(specs, an, { kind: 'v', el: 'R', part: 'avg' }), ex.avg, 1e-9, 1e-9);
      close(q(specs, an, { kind: 'v', el: 'R', part: 'absavg' }), ex.absavg, 3e-3);
      // instantaneous value away from the jumps
      close(q(specs, an, { kind: 'v', el: 'R', t: 0.3 }), waveAt(shape, A, 0.3), 2e-2, 2e-2);
    });
});

describe('harmonic analysis of a series RL circuit', () => {
  // u = 10 + 100 cos ωt + 30 cos(3ωt − 30°), ω = 314 rad/s, R = 10 Ω, L = 31.8 mH
  const w = 314;
  const R = 10;
  const L = 0.0318;
  const specs: Spec[] = [
    {
      ref: 'Us',
      type: 'V',
      nodes: ['s', '0'],
      value: {
        harmonics: {
          dc: 10,
          terms: [
            { k: 1, amp: 100 },
            { k: 3, amp: 30, phase: -30 },
          ],
        },
      },
    },
    { ref: 'R', type: 'R', nodes: ['s', 'm'], value: R },
    { ref: 'L', type: 'L', nodes: ['m', '0'], value: L },
  ];
  const z = (k: number) => Math.hypot(R, k * w * L);
  const I0 = 10 / R;
  const I1m = 100 / z(1);
  const I3m = 30 / z(3);
  it('per-harmonic phasors (rms by default, peak on request)', () => {
    close(q(specs, PER(w), { kind: 'i', el: 'R', harmonic: 0 }), I0);
    close(q(specs, PER(w), { kind: 'i', el: 'R', harmonic: 1 }), I1m / Math.SQRT2);
    close(q(specs, PER(w), { kind: 'i', el: 'R', harmonic: 3 }), I3m / Math.SQRT2);
    close(q(specs, PER(w, 'peak'), { kind: 'i', el: 'R', harmonic: 3 }), I3m);
    close(q(specs, PER(w, 'peak'), { kind: 'i', el: 'R', harmonic: 3, part: 'rms' }), I3m / Math.SQRT2);
    close(q(specs, PER(w), { kind: 'i', el: 'R', harmonic: 3, part: 'phase' }), -30 - (Math.atan2(3 * w * L, R) * 180) / Math.PI);
    // inductor: no DC voltage
    close(q(specs, PER(w), { kind: 'v', el: 'L', harmonic: 0 }), 0);
    // a harmonic that no source contains
    close(q(specs, PER(w), { kind: 'i', el: 'R', harmonic: 5 }), 0);
  });
  it('rms, average power, Q, S and power factor', () => {
    const I = Math.sqrt(I0 ** 2 + I1m ** 2 / 2 + I3m ** 2 / 2);
    close(q(specs, PER(w), { kind: 'i', el: 'R' }), I);
    close(q(specs, PER(w), { kind: 'i', el: 'R', part: 'avg' }), I0);
    const P = I ** 2 * R;
    close(q(specs, PER(w), { kind: 'p', el: 'R' }), P);
    close(q(specs, PER(w), { kind: 'p', el: 'Us' }), -P);
    close(q(specs, PER(w), { kind: 'p', el: 'L' }), 0, 0, 1e-9);
    // P = U0 I0 + Σ U_k I_k cos φ_k for the source
    const Pk = (Um: number, k: number) => ((Um * Um) / (2 * z(k) ** 2)) * R;
    close(q(specs, PER(w), { kind: 'p', el: 'Us', harmonic: 3 }), -Pk(30, 3));
    close(q(specs, PER(w), { kind: 'q', el: 'L' }), (I1m ** 2 / 2) * w * L + (I3m ** 2 / 2) * 3 * w * L);
    const U = Math.sqrt(100 + 100 ** 2 / 2 + 30 ** 2 / 2);
    close(q(specs, PER(w), { kind: 'v', el: 'Us' }), U);
    close(q(specs, PER(w), { kind: 's', el: 'Us' }), U * I);
    close(q(specs, PER(w), { kind: 'pf', el: 'Us' }), P / (U * I));
  });
});

describe('harmonic filters and resonance', () => {
  // L1 ∥ C1 resonant at 3ω (trap) in series with the load R; ω = 1000 rad/s
  const w = 1000;
  const L1 = 0.01;
  const C1 = 1 / (9 * w * w * L1);
  const specs: Spec[] = [
    {
      ref: 'Us',
      type: 'V',
      nodes: ['s', '0'],
      value: {
        harmonics: {
          terms: [
            { k: 1, amp: 100 },
            { k: 3, amp: 20 },
          ],
        },
      },
    },
    { ref: 'L1', type: 'L', nodes: ['s', 'a'], value: L1 },
    { ref: 'C1', type: 'C', nodes: ['s', 'a'], value: C1 },
    { ref: 'R', type: 'R', nodes: ['a', '0'], value: 50 },
  ];
  it('a parallel LC tuned to 3ω blocks the 3rd harmonic; the fundamental passes', () => {
    close(q(specs, PER(w), { kind: 'v', el: 'R', harmonic: 3 }), 0, 0, 1e-9);
    // fundamental: Z_LC = jωL/(1 − ω²LC) = j10/(1 − 1/9) = j11.25
    close(q(specs, PER(w, 'peak'), { kind: 'v', el: 'R', harmonic: 1 }), (100 * 50) / Math.hypot(50, 11.25));
    // inside the trap a 3rd-harmonic current circulates: I_L3 = U3/(3ωL)
    close(q(specs, PER(w, 'peak'), { kind: 'i', el: 'L1', harmonic: 3 }), 20 / (3 * w * L1));
    close(q(specs, PER(w), { kind: 'f0', port: ['s', 'a'] }), (3 * w) / (2 * Math.PI), 1e-6);
    // seen from the load node with the source zeroed: R ∥ j11.25 Ω
    close(q(specs, PER(w), { kind: 'req', port: ['a', '0'], harmonic: 1 }), (50 * 11.25) / Math.hypot(50, 11.25));
    close(q(specs, PER(w), { kind: 'gain', out: ['a'], input: 'Us', harmonic: 1, part: 'mag' }), 50 / Math.hypot(50, 11.25));
  });
  it('rejects what has no meaning in periodic analysis', () => {
    expect(() => q(specs, PER(w), { kind: 'req', port: ['a', '0'] })).toThrow(/harmonic/);
    expect(() => q(specs, PER(w), { kind: 'v', el: 'R', part: 'phase' })).toThrow(/no single phasor/);
    expect(() => q(specs, PER(w), { kind: 'f0', harmonic: 1 })).toThrow(/leave out "harmonic"/);
    expect(() => q(specs, PER(w), { kind: 'v', el: 'R', harmonic: 1, part: 'absavg' })).toThrow(/whole periodic waveform/);
    expect(() => q(specs, PER(w), { kind: 'tau' })).toThrow(/not available/);
    expect(() => q(specs, { type: 'ac', omega: w }, { kind: 'v', el: 'R' })).toThrow(/periodic/);
    expect(() => q(specs, { type: 'tran' }, { kind: 'v', el: 'R', t: 0 })).toThrow(/periodic/);
    const z: Spec[] = [...specs, { ref: 'Z', type: 'Z', nodes: ['a', '0'], value: { re: 1, im: 1 } }];
    expect(() => q(z, PER(w), { kind: 'v', el: 'R' })).toThrow(/Z element/);
    const bad: Spec[] = [
      {
        ref: 'Us',
        type: 'V',
        nodes: ['s', '0'],
        value: {
          harmonics: {
            terms: [
              { k: 1, amp: 1 },
              { k: 1, amp: 2 },
            ],
          },
        },
      },
    ];
    expect(() => q(bad, PER(w), { kind: 'v', el: 'Us' })).toThrow(/twice/);
    const wv: Spec[] = [{ ref: 'Us', type: 'V', nodes: ['s', '0'], value: { wave: { shape: 'square', amp: 1 } } }];
    expect(() => q(wv, PER(w), { kind: 'v', el: 'Us' })).toThrow(/upTo/);
  });
});

describe('three-phase harmonics (zero sequence)', () => {
  // phase EMFs e_A = 220√2 cos ωt + 30√2 cos 3ωt, B and C shifted by −120°, +120° (k·shift for harmonic k)
  const w = 314;
  const emf = (shift: number) => ({
    harmonics: {
      terms: [
        { k: 1, amp: 220 * Math.SQRT2, phase: shift },
        { k: 3, amp: 30 * Math.SQRT2, phase: 3 * shift },
      ],
    },
  });
  const Y = (neutral: boolean): Spec[] => [
    { ref: 'Ea', type: 'V', nodes: ['A', 'N'], value: emf(0) },
    { ref: 'Eb', type: 'V', nodes: ['B', 'N'], value: emf(-120) },
    { ref: 'Ec', type: 'V', nodes: ['C', 'N'], value: emf(120) },
    { ref: 'Ra', type: 'R', nodes: ['A', 'n'], value: 10 },
    { ref: 'Rb', type: 'R', nodes: ['B', 'n'], value: 10 },
    { ref: 'Rc', type: 'R', nodes: ['C', 'n'], value: 10 },
    neutral ? { ref: 'RN', type: 'R', nodes: ['n', 'N'], value: 1e-9 } : { ref: 'RN', type: 'R', nodes: ['n', 'N'], value: 1e12 },
    { ref: 'G', type: 'R', nodes: ['N', '0'], value: 1 },
  ];
  it('with a neutral wire: the 3rd harmonics add up in the neutral (I_N = 3I_3)', () => {
    close(q(Y(true), PER(w), { kind: 'i', el: 'RN' }), 9, 1e-6);
    close(q(Y(true), PER(w), { kind: 'i', el: 'Ra' }), Math.hypot(22, 3), 1e-6);
  });
  it('without a neutral: no 3rd-harmonic line current; U_nN = E_3; the line voltage has no 3rd harmonic', () => {
    close(q(Y(false), PER(w), { kind: 'i', el: 'Ra', harmonic: 3 }), 0, 0, 1e-6);
    close(q(Y(false), PER(w), { kind: 'v', nodes: ['n', 'N'] }), 30, 1e-6);
    close(q(Y(false), PER(w), { kind: 'v', nodes: ['A', 'B'] }), 220 * Math.sqrt(3), 1e-9);
  });
  it('delta-connected sources: a 3rd-harmonic current circulates inside the delta', () => {
    // three windings A→B, B→C, C→A, each 220 V fundamental + 30 V 3rd harmonic, with 0.5 Ω each
    const D: Spec[] = [
      { ref: 'E1', type: 'V', nodes: ['A', 'x'], value: emf(0) },
      { ref: 'R1', type: 'R', nodes: ['x', 'B'], value: 0.5 },
      { ref: 'E2', type: 'V', nodes: ['B', 'y'], value: emf(-120) },
      { ref: 'R2', type: 'R', nodes: ['y', 'C'], value: 0.5 },
      { ref: 'E3', type: 'V', nodes: ['C', 'z'], value: emf(120) },
      { ref: 'R3', type: 'R', nodes: ['z', 'A'], value: 0.5 },
      { ref: 'G', type: 'R', nodes: ['A', '0'], value: 1 },
    ];
    // around the delta the fundamentals cancel, the 3rd harmonics add: I3 = 3·30/(3·0.5) = 60 A (rms)
    close(q(D, PER(w), { kind: 'i', el: 'R1', harmonic: 3 }), 60, 1e-9);
    close(q(D, PER(w), { kind: 'i', el: 'R1', harmonic: 1 }), 0, 0, 1e-9);
    // the open-circuit line voltage contains no 3rd harmonic: E3 − R·I3 = 0
    close(q(D, PER(w), { kind: 'v', nodes: ['A', 'B'], harmonic: 3 }), 0, 0, 1e-9);
  });
});

describe('cross-check with the time-domain (transient) solver', () => {
  // series R–L–C driven by 20 + 50 cos ωt + 15 cos(3ωt + 40°), ω = 500 rad/s. Transient: the same
  // source as DC + two {sin} sources in series, all storage initially empty (ic = 0), sampled over one
  // period after 40 time constants; numerical rms and average power vs the harmonic engine.
  const w = 500;
  const R = 20;
  const L = 0.05;
  const C = 40e-6;
  const per: Spec[] = [
    {
      ref: 'Us',
      type: 'V',
      nodes: ['s', '0'],
      value: {
        harmonics: {
          dc: 20,
          terms: [
            { k: 1, amp: 50 },
            { k: 3, amp: 15, phase: 40 },
          ],
        },
      },
    },
    { ref: 'R', type: 'R', nodes: ['s', 'a'], value: R },
    { ref: 'L', type: 'L', nodes: ['a', 'b'], value: L },
    { ref: 'C', type: 'C', nodes: ['b', '0'], value: C },
  ];
  const f = w / (2 * Math.PI);
  const tr: Spec[] = [
    { ref: 'U0', type: 'V', nodes: ['s', 'x1'], value: { step: { before: 20, after: 20 } } },
    { ref: 'U1', type: 'V', nodes: ['x1', 'x2'], value: { sin: { amp: 50, freq: f, phase: 90 } } },
    { ref: 'U3', type: 'V', nodes: ['x2', '0'], value: { sin: { amp: 15, freq: 3 * f, phase: 130 } } },
    { ref: 'R', type: 'R', nodes: ['s', 'a'], value: R },
    { ref: 'L', type: 'L', nodes: ['a', 'b'], value: L, ic: 0 },
    { ref: 'C', type: 'C', nodes: ['b', '0'], value: C, ic: 0 },
  ];
  it('rms of i and u_C, average power of R, and an instantaneous value agree', () => {
    const T = (2 * Math.PI) / w;
    const t0 = 40 * ((2 * L) / R) + 0; // envelope decays as e^(−Rt/2L)
    const n = 400;
    let i2 = 0;
    let uc2 = 0;
    let p = 0;
    let ucAvg = 0;
    for (let s = 0; s < n; s++) {
      const t = t0 + ((s + 0.5) * T) / n;
      const i = q(tr, { type: 'tran' }, { kind: 'i', el: 'R', t });
      const uc = q(tr, { type: 'tran' }, { kind: 'v', el: 'C', t });
      i2 += (i * i) / n;
      uc2 += (uc * uc) / n;
      p += (q(tr, { type: 'tran' }, { kind: 'v', el: 'R', t }) * i) / n;
      ucAvg += uc / n;
    }
    close(q(per, PER(w), { kind: 'i', el: 'R' }), Math.sqrt(i2), 1e-6);
    close(q(per, PER(w), { kind: 'v', el: 'C' }), Math.sqrt(uc2), 1e-6);
    close(q(per, PER(w), { kind: 'p', el: 'R' }), p, 1e-6);
    close(q(per, PER(w), { kind: 'v', el: 'C', part: 'avg' }), ucAvg, 1e-6);
    close(q(per, PER(w), { kind: 'i', el: 'R', t: t0 + 0.3 * T }), q(tr, { type: 'tran' }, { kind: 'i', el: 'R', t: t0 + 0.3 * T }), 1e-6, 1e-9);
  });
});
