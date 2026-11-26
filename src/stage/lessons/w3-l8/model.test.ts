import { describe, expect, it } from 'vitest';
import { bitsOf, dac, dacIdeal, DAC_R, ia, IA_EX, IA_GD, iaGain, LM358_VOH, LM358_VOL, lsbOf, R_UNIT, RATING_W, rgFor, symClips } from './model';
import lesson from './index';

describe('W3-L8 binary-weighted DAC', () => {
  it('weights R, 2R, 4R, 8R and the code D = 8b1 + 4b2 + 2b3 + b4', () => {
    expect(DAC_R.map((r) => r / R_UNIT)).toEqual([1, 2, 4, 8]);
    expect(bitsOf(11)).toEqual([1, 0, 1, 1]);
    for (let d = 0; d < 16; d++) {
      const [b1, b2, b3, b4] = bitsOf(d);
      expect(8 * b1 + 4 * b2 + 2 * b3 + b4).toBe(d);
      // the KCL form −R_f (v1/R + v2/2R + v3/4R + v4/8R) equals −(R_f/8R)·V_ref·D
      const kcl = -10_000 * bitsOf(d).reduce((s, b, k) => s + (b * 5) / DAC_R[k], 0);
      expect(kcl).toBeCloseTo(dacIdeal(d, 5, 10_000), 12);
    }
  });

  it('the sheet’s 16-code table (V_ref 1 V and 5 V, R_f = 10 kΩ)', () => {
    for (let d = 0; d < 16; d++) {
      expect(dacIdeal(d, 1, 10_000)).toBeCloseTo(-0.125 * d, 12);
      expect(dacIdeal(d, 5, 10_000)).toBeCloseTo(-0.625 * d, 12);
    }
    expect(lsbOf(1, 10_000)).toBe(-0.125);
    expect(dacIdeal(15, 1, 10_000)).toBe(-1.875);
    expect(dacIdeal(8, 1, 10_000)).toBe(-1);
    expect(dacIdeal(15, 5, 10_000)).toBe(-9.375);
    // the fix: R_f = 4 kΩ at V_ref = 5 V
    expect(lsbOf(5, 4_000)).toBeCloseTo(-0.25, 12);
    expect(dacIdeal(15, 5, 4_000)).toBeCloseTo(-3.75, 12);
    expect(dac(15, 5, 4_000).state).toBe('linear');
    // V_ref = 1 V: all 16 codes linear, the virtual ground at 0
    for (let d = 0; d < 16; d++) {
      const s = dac(d, 1, 10_000);
      expect(s.state).toBe('linear');
      expect(Math.abs(s.vn)).toBeLessThan(2e-3);
      // KCL at the summing node: the branch currents all leave through R_f
      expect(s.ib.reduce((a, b) => a + b, 0)).toBeCloseTo(s.iF, 7);
    }
  });

  it('the LM358 on ±9 V (not ±7.5 V symmetric): where V_ref = 5 V clips', () => {
    expect(LM358_VOH).toBe(7.5);
    expect(LM358_VOL).toBeCloseTo(-8.2, 12);
    expect(dac(12, 5, 10_000).state).toBe('linear');
    expect(dac(13, 5, 10_000).state).toBe('edge');
    expect(dac(13, 5, 10_000).clipped).toBe(false);
    expect(dac(14, 5, 10_000).state).toBe('clip');
    expect(dac(14, 5, 10_000).vo).toBeCloseTo(-8.2, 12);
    expect(dac(14, 5, 10_000).voRail).toBe(-8.75); // an ideal rail-to-rail part would still be linear
    expect(dac(15, 5, 10_000).state).toBe('rail');
    expect(dac(15, 5, 10_000).voRail).toBe(-9);
    // a symmetric ±7.5 V part (TL072-like) clips from 1101: the sheet's claim
    expect(symClips(dacIdeal(12, 5, 10_000))).toBe(false);
    expect(symClips(dacIdeal(13, 5, 10_000))).toBe(true);
    // the sink current that sets the LM358 low-side limit is ≈ 0.8 mA (≫ its 50 µA pull-down)
    expect(dac(14, 5, 10_000).iF).toBeGreaterThan(0.8e-3);
  });

  it('clipped: Pin 2 leaves 0 V (checkpoint 3), and resistor power stays far below 1/4 W', () => {
    const s = dac(15, 5, 10_000);
    expect(s.vn).toBeCloseTo((75 + 8 * -8.2) / 23, 12);
    expect(s.vn).toBeCloseTo(0.409, 3);
    expect(s.ib.reduce((a, b) => a + b, 0)).toBeCloseTo(s.iF, 12);
    expect(s.pW.rf * 1000).toBeCloseTo(7.41, 2);
    expect(s.pW.pd[0] * 1000).toBeCloseTo(2.5, 9);
    for (let d = 0; d < 16; d++) for (const v of [1, 5]) for (const rf of [10_000, 4_000]) expect(dac(d, v, rf).pMax).toBeLessThan(RATING_W / 25);
    // an OFF bit's pull-down carries no current while the loop is closed
    const lin = dac(0b1011, 1, 10_000);
    expect(lin.ib[1]).toBeCloseTo(0, 6);
  });

  it('resistor spread of an N-bit weighted DAC: 2^(N−1)', () => {
    expect(2 ** 3 * 10_000).toBe(80_000);
    expect(2 ** 7 * 10_000).toBe(1_280_000);
    expect(2 ** 11 * 10_000).toBe(20_480_000);
    expect((1 / 2 ** 12) * 100).toBeCloseTo(0.0244, 4);
  });
});

describe('W3-L8 instrumentation amplifier', () => {
  it('Sadiku Ex. 5.12: R = 25 kΩ, R1 = R2 = 10 kΩ', () => {
    const g = (rg: number) => iaGain(25_000, 10_000, 10_000, rg);
    expect(g(1_000)).toBe(51);
    expect(g(2_000)).toBe(26);
    expect(g(5_000)).toBe(11);
    expect(g(10_000)).toBe(6);
    expect(g(100_000)).toBe(1.5);
    expect(g(1e15)).toBeCloseTo(1, 9);
    // common mode: no current in R_G, unity front end, zero output
    const cm = ia({ ...IA_EX, v2: IA_EX.v1, RG: 10_000 });
    expect(cm.i).toBe(0);
    expect(cm.vo1).toBe(2);
    expect(cm.vo).toBe(0);
  });

  it('the guided example: A_v2 = 2, A_v1 = 51, R_G = 1 kΩ, vo1 = 0.75 V, vo2 = 3.3 V, vo = 5.1 V', () => {
    const { R, R1, R2, v1, v2, target } = IA_GD;
    expect(R2 / R1).toBe(2);
    expect(target / (R2 / R1)).toBe(51);
    expect(rgFor(R, R1, R2, target)).toBeCloseTo(1_000, 9);
    const s = ia({ R, R1, R2, RG: 1_000, v1, v2 });
    expect(s.i).toBeCloseTo(50e-6, 12);
    expect(s.i * R).toBeCloseTo(1.25, 12);
    expect(s.vo1).toBeCloseTo(0.75, 12);
    expect(s.vo2).toBeCloseTo(3.3, 12);
    expect(s.av).toBeCloseTo(102, 12);
    expect(s.vo).toBeCloseTo(5.1, 12);
    expect(s.linear).toBe(true);
    // the wrong options of step 4
    expect(iaGain(R, R1, R2, 2_000)).toBe(52);
  });

  it('quiz: 1011 at 2 V → −2.75 V; 8-bit LSB 1.28 MΩ; R_G = 5 kΩ → 9, open → 1', () => {
    expect(dacIdeal(0b1011, 2, 10_000)).toBeCloseTo(-2.75, 12);
    expect(dacIdeal(0b1001, 2, 10_000)).toBeCloseTo(-2.25, 12);
    expect(2 ** (8 - 1) * 10_000).toBe(1_280_000);
    expect(iaGain(20_000, 10_000, 10_000, 5_000)).toBe(9);
    expect(iaGain(20_000, 10_000, 10_000, Infinity)).toBe(1);
  });
});

describe('W3-L8 lesson data', () => {
  it('every quiz question has one right option, the others their own feedback', () => {
    const quiz = lesson.right_acts.flatMap((a) => a.quiz ?? []);
    expect(quiz).toHaveLength(4);
    for (const q of quiz) {
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      for (const o of q.options) if (!o.correct) expect(o.feedback?.length).toBeGreaterThan(10);
      expect(q.figure).toBeTruthy();
    }
  });

  it('linked ids are named on the stage, and the board has no TL072', () => {
    const known = new Set(Object.keys(lesson.left_stage_spec.hover_map));
    const text = JSON.stringify(lesson.right_acts);
    for (const m of text.matchAll(/\[\[([a-z0-9_,-]+)\|/g)) for (const id of m[1].split(',')) expect(known.has(id) || !!lesson.describeTarget?.(id), id).toBe(true);
    // the chip on the board is the LM358; the TL072 is only named as a symmetric reference part
    for (const m of text.matchAll(/TL072/g)) expect(text.slice(Math.max(0, m.index! - 40), m.index! + 10)).toMatch(/如 TL072|对称/);
  });
});
