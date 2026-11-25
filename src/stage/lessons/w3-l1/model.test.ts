import { describe, expect, it } from 'vitest';
import { lm358Pin } from '../../Lm358';
import { CHIP_C0, dB, fromDb, kcl, kOs, linearWindow, OPAMP, PINS, pinsOf, transfer, vccPin, vcvs, VEE_PIN, VOS } from './model';

describe('W3-L1 the real op amp', () => {
  it('act 1: the two DIP-8 pinouts and the deadly V+ difference', () => {
    expect(vccPin('lm358')).toBe(8);
    expect(vccPin('lm741')).toBe(7);
    expect(VEE_PIN).toBe(4);
    // swapping chips without rewiring puts +9 V on the LM358's OUT2
    expect(PINS.lm358[vccPin('lm741')].name).toBe('OUT2');
    expect(PINS.lm741[6].role).toBe('out');
    expect(PINS.lm741[8].role).toBe('nc');
    expect(pinsOf('lm358', 'power')).toEqual([4, 8]);
    expect(pinsOf('lm741', 'power')).toEqual([4, 7]);
    expect(pinsOf('lm358', 'outputs')).toEqual([1, 7]);
    expect(pinsOf('lm741', 'outputs')).toEqual([6]);
    expect(pinsOf('lm358', 'inputs')).toEqual([2, 3, 5, 6]);
    // the lab chip straddles the trench: pins 1–4 in row f, 5–8 in row e, pin 1 and pin 8 in one column
    expect(lm358Pin(CHIP_C0, 1)).toEqual({ col: CHIP_C0, row: 'f' });
    expect(lm358Pin(CHIP_C0, 8)).toEqual({ col: CHIP_C0, row: 'e' });
  });

  it('act 2: Eq. (5.1) — sourcing at +5 V and sinking at −4 V into 1 kΩ', () => {
    const a = kcl('source', 1);
    expect(a.io).toBeCloseTo(5, 12);
    expect(a.im).toBe(-1);
    expect(a.ip).toBeCloseTo(5.9998, 12);
    expect(a.i1 + a.i2 + a.ip + a.im).toBeCloseTo(a.io, 12);
    // the inputs give 0.0002 mA of the 5 mA: 0.4 in ten thousand
    expect((a.i1 + a.i2) / a.io).toBeCloseTo(0.4e-4, 12);
    const b = kcl('sink', 1);
    expect(b.io).toBeCloseTo(-4, 12);
    expect(b.ip).toBe(1);
    expect(b.im).toBeCloseTo(-5.0002, 12);
    expect(b.i1 + b.i2 + b.ip + b.im).toBeCloseTo(b.io, 12);
    // quiz Q2 (inputs neglected): −4 − 1 = −5 mA
    expect(-4 - 0 - 0 - 1).toBe(-5);
  });

  it('act 3: dB gains, 25 pA, 4.8193 V and 3.61 % into 2 kΩ', () => {
    expect(dB(1e5)).toBeCloseTo(100, 12);
    expect(dB(1e8)).toBeCloseTo(160, 12);
    expect(dB(2e5)).toBeCloseTo(106.02, 2);
    // Table 5.1: 10^5 … 10^8 is 100 … 160 dB
    const m = vcvs(50e-6, 2000);
    expect(m.iin).toBeCloseTo(25e-12, 20);
    expect(m.voc).toBeCloseTo(5, 12);
    expect(m.vo).toBeCloseTo(4.8193, 4);
    expect(m.io * 1000).toBeCloseTo(2.4096, 4);
    expect(m.eps * 100).toBeCloseTo(3.61, 2);
    // a 10 Ω load: most of A·v_d drops inside R_o
    expect(vcvs(50e-6, 10).eps).toBeGreaterThan(0.85);
    // quiz Q3: 120 dB is 10^6
    expect(fromDb(120)).toBeCloseTo(1e6, 3);
  });

  it('act 4: the ±90 μV cliff, the 180 μV window and the 3 mV offset (33.3 ×)', () => {
    const [lo, hi] = linearWindow('dual');
    expect(hi).toBeCloseTo(90e-6, 15);
    expect(lo).toBeCloseTo(-90e-6, 15);
    expect(hi - lo).toBeCloseTo(180e-6, 15);
    expect(kOs()).toBeCloseTo(100 / 3, 10);
    // the offset is 33.3 × the boundary, 16.7 × the whole window
    expect(VOS / (hi - lo)).toBeCloseTo(50 / 3, 10);
    expect(transfer(VOS, 'dual').region).toBe('pos');
    expect(transfer(-VOS, 'dual').vo).toBe(-9);
    expect(transfer(VOS, 'dual', 'lm358').vo).toBe(7.5);
    // single +9 V / 0 V: no negative output; LM358 ≈ 0 V … +7.5 V
    expect(transfer(-VOS, 'single', 'lm358').vo).toBeCloseTo(0.01, 12);
    expect(transfer(VOS, 'single', 'lm358').vo).toBe(7.5);
    expect(OPAMP.vcc - 1.5).toBe(7.5);
    // act 5: 0.1 mV of difference is already past the 90 μV boundary
    expect(transfer(100e-6, 'dual').region).toBe('pos');
    expect(transfer(-100e-6, 'dual').region).toBe('neg');
  });

  it('guided example: ±9 V, A = 10⁵, R_o = 75 Ω, R_L = 1.5 kΩ, v₁ = 1.50000 V, v₂ = 1.50006 V', () => {
    const vd = 1.50006 - 1.5;
    expect(vd).toBeCloseTo(60e-6, 12);
    expect(transfer(vd, 'dual').region).toBe('lin');
    const m = vcvs(60e-6, 1500);
    expect(m.voc).toBeCloseTo(6, 12);
    expect(m.iin).toBeCloseTo(30e-12, 20);
    expect(m.vo).toBeCloseTo(5.714, 3);
    expect(m.io * 1000).toBeCloseTo(3.81, 3);
    expect(1500 / 1575).toBeCloseTo(0.9524, 4);
    // step 5: v₂ = 1.50016 V → v_d = 160 μV, A·v_d = 16 V > 9 V
    const s5 = transfer(1.50016 - 1.5, 'dual');
    expect(s5.lin).toBeCloseTo(16, 9);
    expect(s5.region).toBe('pos');
    expect(s5.vo).toBe(9);
  });
});
