import { describe, expect, it } from 'vitest';
import {
  bench,
  C_F,
  critR,
  generalPoly,
  generalStep,
  L_H,
  overshoot,
  overshootOf,
  PAR,
  parallelStep,
  peakCurrent,
  PCB,
  R_BENCH_MIN,
  R_CRIT,
  seriesStep,
  solve2,
  squareWave,
  T_SQ,
} from './model';
import { SHEET_CURVES } from './svgs';
import { responseTex } from './tex';

describe('the general second-order solver (Sadiku 8.7: initial values, roots, final value, constants)', () => {
  it('satisfies the ODE and both initial conditions in every damping case', () => {
    for (const [a1, a0] of [
      [5, 6], // over
      [10, 25], // critical
      [2, 26], // under
    ]) {
      const s = solve2(a1, a0, 3, -1, 4);
      expect(s.x(0)).toBeCloseTo(-1, 12);
      expect(s.dx(0)).toBeCloseTo(4, 12);
      for (const t of [0.05, 0.3, 1.1]) {
        const h = 1e-5;
        const d2 = (s.dx(t + h) - s.dx(t - h)) / (2 * h);
        expect(d2 + a1 * s.dx(t) + a0 * s.x(t)).toBeCloseTo(a0 * 3, 4);
      }
      expect(s.x(60)).toBeCloseTo(3, 9);
    }
  });
});

describe('act 2: series RLC step, V_s = 5 V, L = 10 mH, C = 1 µF', () => {
  it('R = 56 Ω: α = 2800, ω0 = 10000, ω_d = 9600, B1 = −5, B2 = −35/24', () => {
    const s = seriesStep(56);
    expect(s.v.kind).toBe('under');
    expect(s.v.alpha).toBeCloseTo(2800, 9);
    expect(s.v.w0).toBeCloseTo(10000, 9);
    expect(s.v.wd).toBeCloseTo(9600, 6);
    expect(s.zeta).toBeCloseTo(0.28, 12);
    expect(s.v.k1).toBeCloseTo(-5, 12);
    expect(s.v.k2).toBeCloseTo(-35 / 24, 12);
    // i(t) = (5/96) e^{−2800t} sin 9600t A
    for (const t of [1e-4, 3e-4, 7e-4]) expect(s.i(t)).toBeCloseTo((5 / 96) * Math.exp(-2800 * t) * Math.sin(9600 * t), 12);
    expect(5 / 96).toBeCloseTo(0.05208, 5);
    const o = overshoot(s.v)!;
    expect(o.tp * 1000).toBeCloseTo(0.327, 3);
    expect(o.mp).toBeCloseTo(0.4, 4);
    expect(o.mp).toBeCloseTo(Math.exp((-7 * Math.PI) / 24), 12);
    expect(o.vpeak).toBeCloseTo(7.0, 3);
    expect(responseTex(s.v)).toBe(String.raw`5 - e^{-2800t}\left(5\cos 9600t + 1.458\sin 9600t\right)`);
  });

  it('R = 200 Ω is critical: v_C = 5 − (5 + 50000t) e^{−10000t}, 4.80 V at 0.5 ms', () => {
    expect(R_CRIT).toBeCloseTo(200, 12);
    const s = seriesStep(200);
    expect(s.v.kind).toBe('critical');
    expect(s.v.k1).toBeCloseTo(-5, 12);
    expect(s.v.k2).toBeCloseTo(-50000, 6);
    expect(s.v.x(0.5e-3)).toBeCloseTo(4.8, 2);
    expect(s.v.x(0.5e-3) / 5).toBeCloseTo(0.96, 2);
    expect(responseTex(s.v)).toBe('5 - (5 + 50000t)e^{-10000t}');
  });

  it('R = 250 Ω is over-damped: s = −5000, −20000; v_C = 5 − (20/3)e^{−5000t} + (5/3)e^{−20000t}, 4.45 V at 0.5 ms', () => {
    const s = seriesStep(250);
    expect(s.v.kind).toBe('over');
    expect(s.v.alpha).toBeCloseTo(12500, 9);
    expect(s.v.s1).toBeCloseTo(-5000, 6);
    expect(s.v.s2).toBeCloseTo(-20000, 6);
    expect(s.v.k1).toBeCloseTo(-20 / 3, 9);
    expect(s.v.k2).toBeCloseTo(5 / 3, 9);
    expect(s.v.x(0.5e-3)).toBeCloseTo(4.45, 2);
  });

  it('the sheet’s three plotted curves (2.3) match the model within half a pixel', () => {
    const cases: [keyof typeof SHEET_CURVES, number][] = [
      ['under', 56],
      ['critical', 200],
      ['over', 250],
    ];
    for (const [k, r] of cases) {
      const s = seriesStep(r);
      for (const p of SHEET_CURVES[k].split(' ')) {
        const [x, y] = p.split(',').map(Number);
        const t = ((x - 70) / 240) * 1e-3;
        expect(Math.abs(270 - 27.5 * s.v.x(t) - y), `${k} @ x = ${x}`).toBeLessThan(0.5);
      }
    }
  });

  it('the 200 Hz square wave: 2.5 ms covers 5/α = 1.79 ms at 56 Ω; peak +7.00 V, undershoot −2.00 V', () => {
    expect(5 / 2800).toBeCloseTo(1.786e-3, 6);
    expect(T_SQ).toBeCloseTo(5e-3, 12);
    const w = squareWave(56);
    expect(w.settled).toBe(true);
    expect(w.peak.v).toBeCloseTo(7.0, 2);
    expect(w.peak.t * 1000).toBeCloseTo(0.327, 2);
    expect(w.dip.v).toBeCloseTo(-2.0, 2);
    // the slider's lower end (20 Ω): 5/α = 5 ms > 2.5 ms, the waveform no longer settles
    expect(squareWave(20).settled).toBe(false);
    for (const r of [56, 200, 250]) expect(squareWave(r).settled).toBe(true);
  });
});

describe('the breadboard (layer 03 and the act-5 tables)', () => {
  it('loop resistance 50 Ω (generator) + 4 Ω (DCR) + pot: 56 / 200 / 250 Ω need 2 / 146 / 196 Ω', () => {
    expect(R_BENCH_MIN).toBe(54);
    expect(bench(56, 'gnd').rPot).toBeCloseTo(2, 12);
    expect(bench(200, 'gnd').rPot).toBeCloseTo(146, 12);
    expect(bench(250, 'gnd').rPot).toBeCloseTo(196, 12);
    expect(bench(30, 'gnd').clamped).toBe(true);
    // with the sheet's extra 47 Ω guard resistor the loop could not go below ≈ 101 Ω: 56 Ω unreachable
    expect(47 + 50 + 4).toBeGreaterThan(56);
  });

  it('peak current ≈ 34.35 mA (not the 52.1 mA amplitude), peak power 66 mW, average 5 mW in all', () => {
    const p = peakCurrent(56);
    expect(p.i * 1000).toBeCloseTo(34.35, 2);
    expect(p.t * 1000).toBeCloseTo(0.134, 3);
    expect(p.i).toBeLessThan(5 / (L_H * 9600));
    expect(p.i * p.i * 56 * 1000).toBeCloseTo(66, 0);
    const b = bench(56, 'gnd');
    expect(Math.abs(b.iPeak * 1000 - 34.35)).toBeLessThan(0.01);
    expect(b.pAvg.total * 1000).toBeCloseTo(C_F * 25 * 200 * 1000, 9);
    expect(b.pAvg.total * 1000).toBeCloseTo(5, 9);
    expect(b.pAvg.gen + b.pAvg.dcr + b.pAvg.pot).toBeCloseTo(b.pAvg.total, 12);
    // capacitor and inductor ratings: 25 V, 150 mA
    expect(b.wave.peak.v).toBeLessThan(25);
    expect(b.iPeak).toBeLessThan(0.15);
  });

  it('CH1 at the generator terminal dips by 50 Ω × i; a ground clip on N1–N3 cuts the excitation', () => {
    const b = bench(56, 'gnd');
    const t = 0.134e-3;
    expect(b.ch1(t)).toBeCloseTo(5 - 50 * b.wave.i(t), 9);
    expect(b.ch1(2.4e-3)).toBeCloseTo(5, 2);
    for (const c of ['n1', 'n2', 'n3'] as const) {
      const f = bench(56, c);
      expect(f.fault).toBe(true);
      expect(f.ch2(0.3e-3)).toBe(0);
    }
  });
});

describe('act 3: the guided example (parallel RLC, I_s = 6 A, R = 5 Ω, L = 2 H, C = 20 mF)', () => {
  it('α = ω0 = 5 (critical), i_L = 6 − (6 + 30t)e^{−5t}, v = 300 t e^{−5t}, v_max = 22.07 V at 0.2 s', () => {
    const p = parallelStep();
    expect(1 / (2 * PAR.R * PAR.C)).toBeCloseTo(5, 12);
    expect(PAR.R / (2 * PAR.L)).toBeCloseTo(1.25, 12); // step 2 option A (the series formula)
    expect(1 / (PAR.R * PAR.C)).toBeCloseTo(10, 12); // step 2 option C (the ½ forgotten)
    expect(p.kind).toBe('critical');
    expect(p.alpha).toBeCloseTo(5, 12);
    expect(p.w0).toBeCloseTo(5, 12);
    expect(p.x(0)).toBe(0);
    expect(p.dx(0)).toBeCloseTo(0, 12);
    expect(p.k1).toBeCloseTo(-6, 12);
    expect(p.k2).toBeCloseTo(-30, 12);
    expect(responseTex(p)).toBe('6 - (6 + 30t)e^{-5t}');
    const v = (t: number) => PAR.L * p.dx(t);
    for (const t of [0.1, 0.2, 0.7]) expect(v(t)).toBeCloseTo(300 * t * Math.exp(-5 * t), 9);
    expect(v(0.2)).toBeCloseTo(22.07, 2);
    // step 1 option B (3 A/s) is wrong: v(0+) = 0 gives i_L'(0+) = 0; v'(0+) = I_s / C = 300 V/s
    expect((v(1e-7) - v(0)) / 1e-7).toBeCloseTo(PAR.Is / PAR.C, 0);
    expect(p.x(100)).toBeCloseTo(6, 9);
  });
});

describe('act 4: the general circuit (V_s = 12 V, R1 = 4 Ω, L = 1 H, R2 = 2 Ω, C = 0.5 F)', () => {
  it('s² + 5s + 6 = 0, roots −2 and −3, v_C(∞) = 4 V, v_C = 4 − 12e^{−2t} + 8e^{−3t}, i_L = 2 + 6e^{−2t} − 8e^{−3t}', () => {
    const { a1, a0 } = generalPoly();
    expect(a1).toBeCloseTo(5, 12);
    expect(a0).toBeCloseTo(6, 12);
    const g = generalStep();
    expect(g.vc.kind).toBe('over');
    expect(g.vc.s1).toBeCloseTo(-2, 12);
    expect(g.vc.s2).toBeCloseTo(-3, 12);
    expect(g.vc.xss).toBeCloseTo(4, 12);
    expect(g.vc.k1).toBeCloseTo(-12, 12);
    expect(g.vc.k2).toBeCloseTo(8, 12);
    expect(responseTex(g.vc)).toBe('4 - 12e^{-2t} + 8e^{-3t}');
    for (const t of [0, 0.3, 1.5]) expect(g.iL(t)).toBeCloseTo(2 + 6 * Math.exp(-2 * t) - 8 * Math.exp(-3 * t), 12);
    // self-check: i_L'(0+) = v_L(0+)/L = 12 A/s, i_L(∞) = 2 A
    expect((g.iL(1e-7) - g.iL(0)) / 1e-7).toBeCloseTo(12, 3);
    expect(g.iL(50)).toBeCloseTo(2, 9);
    // quiz Q4's wrong options
    expect(4 / 1 + 1 / (2 * 0.5)).not.toBe(4);
    expect((12 * 4) / (4 + 2)).toBe(8);
  });
});

describe('act 5 and the quiz', () => {
  it('PCB trace: R_crit = 100 Ω, ζ = 0.15 → more than 60 % overshoot', () => {
    expect(critR(PCB.L, PCB.C)).toBeCloseTo(100, 9);
    expect(PCB.Rout / critR(PCB.L, PCB.C)).toBeCloseTo(0.15, 12);
    expect(overshootOf(0.15)).toBeGreaterThan(0.6);
  });

  it('Q1: complete response 10 + A1 e^{−2t} + A2 e^{−5t} from zero state', () => {
    // a series RLC with s1 s2 = 1/LC = 10 and s1 + s2 = −R/L = −7
    const s = solve2(7, 10, 10, 0, 0);
    expect(s.kind).toBe('over');
    expect(s.s1).toBeCloseTo(-2, 12);
    expect(s.s2).toBeCloseTo(-5, 12);
    expect(10 + s.k1 + s.k2).toBeCloseTo(0, 12);
    expect(-2 * s.k1 - 5 * s.k2).toBeCloseTo(0, 12);
  });

  it('Q2: 200 Ω critical; the wrong options 50 / 100 / 400 Ω', () => {
    expect(seriesStep(200).v.kind).toBe('critical');
    expect(overshootOf(seriesStep(50).zeta)).toBeCloseTo(0.44, 2);
    expect(overshootOf(seriesStep(100).zeta)).toBeCloseTo(0.16, 2);
    expect(seriesStep(400).v.kind).toBe('over');
    expect(seriesStep(400).v.s1).toBeCloseTo(-2680, -1);
  });

  it('Q3: doubling a parallel R halves α → under-damped', () => {
    const p = parallelStep({ ...PAR, R: 2 * PAR.R });
    expect(p.kind).toBe('under');
    expect(p.alpha).toBeCloseTo(parallelStep().alpha / 2, 12);
  });
});
