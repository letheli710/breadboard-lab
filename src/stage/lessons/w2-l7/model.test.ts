import { describe, expect, it } from 'vitest';
import { CASES, equivalent, halfHit, iIn, lab, loadPoint, RL_KNOWN } from './model';

const close = (x: number, y: number, d = 9) => expect(x).toBeCloseTo(y, d);

describe('W2-L7 Thevenin / Norton numbers (lesson sheet)', () => {
  it('Case 1 (Sadiku Ex. 4.8): V_Th = 30 V, R_Th = 4 Ω, I_N = 7.5 A, loads 6 / 16 / 36 Ω', () => {
    const e = equivalent(CASES.c1);
    close(e.vth, 30);
    close(e.rth, 4);
    close(e.iN, 7.5);
    close(e.v1Open, 30);
    const pts = [6, 16, 36].map((rl) => loadPoint(e, rl));
    expect(pts.map((p) => p.il)).toEqual([3, 1.5, 0.75]);
    expect(pts.map((p) => p.vl)).toEqual([18, 24, 27]);
  });

  it('Case 2 (2v_x): V_Th = 20 V; test source 1 V: v1 = 0.4 V, i_o = 0.1 A, R_Th = 10 Ω; i_sc = 2 A; wrong 7.33 Ω', () => {
    const e = equivalent(CASES.c2);
    close(e.vth, 20);
    close(e.v1Test, 0.4);
    close(e.io, 0.1);
    close(e.rth, 10);
    close(e.iN, 2);
    close(e.vth / e.iN, 10);
    close(e.rWrong, 6 + 4 / 3);
  });

  it('guided example (0.25 v_x): v_a = 1.5 v1, V_Th = 18 V, v1(test) = 0.5 V, i_o = 0.125 A, R_Th = 8 Ω, I_N = 2.25 A', () => {
    const e = equivalent(CASES.gd);
    close(e.v1Open, 12);
    close(e.vth, 18);
    close(e.v1Test, 0.5);
    close(e.io, 0.125);
    close(e.rth, 8);
    close(e.iN, 2.25);
    close(e.rWrong, 4);
  });

  it('negative resistance (3.5): R1 = 4 Ω ∥ 2 i_x up into a gives i_o = −0.25 A, R_Th = −4 Ω', () => {
    const r1 = 4;
    const vo = 1;
    const ix = vo / r1;
    const io = ix - 2 * ix; // KCL at a: i_o + 2 i_x = i_x
    close(io, -0.25);
    close(vo / io, -4);
    close(vo * io, -0.25);
  });

  it('test-source current is linear in v_o (homogeneity)', () => {
    close(iIn(CASES.c2, 2, false), 2 * iIn(CASES.c2, 1, false));
  });

  it('breadboard ×1000: 30 V, 4 kΩ, 7.5 mA; all powers under 1/4 W; textbook values burn', () => {
    const open = lab('open', 'safe', 4);
    close(open.va, 30);
    close(open.rth, 4000);
    close(open.parts.find((p) => p.id === 'hl_r2')!.p, 0.075);
    const half = lab('half', 'safe', 4);
    close(half.va, 15);
    expect(halfHit(half)).toBe(true);
    expect(halfHit(lab('half', 'safe', 4.1))).toBe(false);
    const two = lab('two', 'safe', 4);
    close(two.va, 18);
    close(RL_KNOWN * (two.vth / two.va - 1), 4);
    const short = lab('short', 'safe', 4);
    close(short.il, 0.0075);
    close(short.v1, 7.5);
    close(short.parts.find((p) => p.id === 'hl_r1')!.p, 0.1500625);
    close(short.parts.find((p) => p.id === 'hl_r3')!.p, 0.05625);
    for (const m of ['open', 'half', 'two', 'short'] as const) for (const pot of [0.5, 4, 10]) for (const p of lab(m, 'safe', pot).parts) expect(p.p).toBeLessThan(0.25);
    const burn = lab('short', 'orig', 4);
    close(burn.parts.find((p) => p.id === 'hl_r1')!.p, 150.0625);
    close(burn.parts.find((p) => p.id === 'hl_r3')!.p, 56.25);
    close(lab('open', 'orig', 4).parts.find((p) => p.id === 'hl_r2')!.p, 75);
  });
});
