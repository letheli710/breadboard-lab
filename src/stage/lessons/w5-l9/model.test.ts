import { describe, expect, it } from 'vitest';
import {
  activeHpf,
  activeLpf,
  AHPF,
  angDeg,
  bandPass,
  BPF,
  bode,
  CF,
  cornerHz,
  DESIGN,
  HPF,
  mag,
  maxInputVpp,
  metrics,
  par,
  passiveHpf,
  passiveLpf,
  R_STEPS,
  C_STEPS,
  RF,
  RI,
  RL,
  SHEET_PARTS,
  sweep,
  toDb,
  totalPhaseAlpf,
  VOH,
  VOL,
} from './model';

const db = (x: number) => toDb(x);

describe('act 2: the passive first-order RC filters', () => {
  it('low pass R = 22 kΩ, C = 10 nF: ωc = 4545.45 rad/s, fc = 723.43 Hz, −3.01 dB and −45° at fc', () => {
    expect(1 / (RF * CF)).toBeCloseTo(4545.45, 2);
    const fc = cornerHz(RF, CF);
    expect(fc).toBeCloseTo(723.43, 2);
    const h = passiveLpf(fc, RF, CF, null);
    expect(mag(h)).toBeCloseTo(0.7071, 4);
    expect(db(mag(h))).toBeCloseTo(-3.01, 2);
    expect(angDeg(h)).toBeCloseTo(-45, 6);
    expect(mag(passiveLpf(1e-3, RF, CF, null))).toBeCloseTo(1, 9);
  });
  it('high pass R = 10 kΩ, C = 100 nF: ωc = 1000 rad/s, fc = 159.15 Hz, +45° at fc', () => {
    expect(1 / (HPF.r * HPF.c)).toBeCloseTo(1000, 6);
    const fc = cornerHz(HPF.r, HPF.c);
    expect(fc).toBeCloseTo(159.15, 2);
    expect(angDeg(passiveHpf(fc, HPF.r, HPF.c, null))).toBeCloseTo(45, 6);
    expect(mag(passiveHpf(1e7, HPF.r, HPF.c, null))).toBeCloseTo(1, 4);
  });
});

describe('act 3: the loaded passive low pass (Thevenin)', () => {
  it('K = 10/32 = 0.3125 (−10.10 dB), Rth = 6.875 kΩ, fc = 2314.98 Hz = 3.20 × 723.43 Hz', () => {
    const m = metrics('plpf', SHEET_PARTS, true);
    expect(m.k).toBeCloseTo(0.3125, 12);
    expect(db(m.k)).toBeCloseTo(-10.1, 2);
    expect(par(RF, RL)).toBeCloseTo(6875, 6);
    expect(m.fc[0]).toBeCloseTo(2314.98, 2);
    expect(m.fc[0] / cornerHz(RF, CF)).toBeCloseTo(3.2, 9);
    // at its own corner the loaded curve is 3.01 dB under its pass band: −13.11 dB
    expect(db(mag(passiveLpf(m.fc[0], RF, CF, RL)))).toBeCloseTo(-13.11, 2);
  });
  it('quiz Q2 distractor: 226 Hz is 723.4 × 10/32 (a wrong formula), not the loaded corner', () => {
    expect(723.43 * 0.3125).toBeCloseTo(226, 0);
  });
});

describe('act 4: the inverting active filters', () => {
  it('low pass Ri 10 k, Rf 22 k, Cf 10 n: K = −2.20 (+6.85 dB), fc = 723.43 Hz, +3.84 dB and 1.56 Vpp at fc', () => {
    const m = metrics('alpf', SHEET_PARTS, true);
    expect(m.k).toBeCloseTo(-2.2, 12);
    expect(db(2.2)).toBeCloseTo(6.85, 2);
    const h = activeLpf(m.fc[0], RI, RF, CF);
    expect(mag(h)).toBeCloseTo(1.5556, 4);
    expect(db(mag(h))).toBeCloseTo(3.84, 2);
    expect(totalPhaseAlpf(m.fc[0])).toBeCloseTo(-225, 6);
    expect(mag(h) * 1.0).toBeCloseTo(1.56, 2);
  });
  it('the load never enters: the active low pass has no R_L term', () => {
    expect(metrics('alpf', SHEET_PARTS, true)).toEqual(metrics('alpf', SHEET_PARTS, false));
  });
  it('high pass Ri 10 k, Ci 100 n, Rf 33 k: |K∞| = 3.30 (+10.37 dB), fc = 159.15 Hz', () => {
    const m = metrics('ahpf', SHEET_PARTS, false);
    expect(m.k).toBeCloseTo(-3.3, 12);
    expect(db(3.3)).toBeCloseTo(10.37, 2);
    expect(m.fc[0]).toBeCloseTo(159.15, 2);
    expect(mag(activeHpf(1e7, AHPF.ri, AHPF.ci, AHPF.rf))).toBeCloseTo(3.3, 4);
  });
  it('quiz Q1: Ri 5 kΩ doubles the gain to −4.4 (+12.87 dB) and leaves fc at 723.4 Hz', () => {
    const m = metrics('alpf', { ri: 5e3, rf: RF, cf: CF }, false);
    expect(m.k).toBeCloseTo(-4.4, 12);
    expect(db(4.4)).toBeCloseTo(12.87, 2);
    expect(m.fc[0]).toBeCloseTo(723.43, 2);
    expect(2 * 723.43).toBeCloseTo(1446.9, 1);
  });
});

describe('act 5: the sweep table (1.00 Vpp in, 10 kΩ load)', () => {
  // f, |H|, dB, Vpp, total phase, passive loaded dB (the corrected rounding)
  const rows: [number, number, number, number, number, number][] = [
    [100, 2.179, 6.77, 2.18, -187.9, -10.11],
    [200, 2.12, 6.53, 2.12, -195.5, -10.14],
    [500, 1.81, 5.15, 1.81, -214.7, -10.3],
    [723.4, 1.556, 3.84, 1.56, -225.0, -10.51],
    [1000, 1.289, 2.21, 1.29, -234.1, -10.85],
    [2000, 0.748, -2.52, 0.75, -250.1, -12.52],
    [5000, 0.315, -10.03, 0.32, -261.8, -17.63],
    [10000, 0.159, -15.99, 0.16, -265.9, -23.04],
  ];
  it.each(rows)('%d Hz', (f, h, d, vpp, ph, pl) => {
    const a = mag(activeLpf(f, RI, RF, CF));
    expect(Math.abs(a - h)).toBeLessThan(0.0006);
    expect(Math.abs(db(a) - d)).toBeLessThan(0.006);
    expect(Math.abs(a - vpp)).toBeLessThan(0.006);
    expect(Math.abs(totalPhaseAlpf(f) - ph)).toBeLessThan(0.06);
    expect(Math.abs(db(mag(passiveLpf(f, RF, CF, RL))) - pl)).toBeLessThan(0.006);
  });
  it('1 kHz → 10 kHz drops 18.2 dB; at 100 Hz the active curve is ≈ 17 dB over the loaded passive one', () => {
    expect(db(mag(activeLpf(1000, RI, RF, CF))) - db(mag(activeLpf(10000, RI, RF, CF)))).toBeCloseTo(18.2, 1);
    expect(db(mag(activeLpf(100, RI, RF, CF))) - db(mag(passiveLpf(100, RF, CF, RL)))).toBeCloseTo(16.9, 1);
  });
  it('the sheet figure 5.1 used the same scale: fc at x = 353.9 / 429.7, +6.85 dB at y = 72.6', () => {
    const x = (f: number) => 75 + 150 * Math.log10(f / 10);
    const y = (d: number) => 100 - 4 * d;
    expect(x(cornerHz(RF, CF))).toBeCloseTo(353.9, 1);
    expect(x(metrics('plpf', SHEET_PARTS, true).fc[0])).toBeCloseTo(429.7, 1);
    expect(y(db(2.2))).toBeCloseTo(72.6, 1);
    expect(y(-13.11)).toBeCloseTo(152.4, 1);
  });
  it('the Bode samples run 10 Hz – 100 kHz; the pole phase of the inverting LPF goes 0 → −90°', () => {
    const pts = bode((f) => activeLpf(f, RI, RF, CF), true);
    expect(pts[0].f).toBeCloseTo(10, 9);
    expect(pts.at(-1)!.f).toBeCloseTo(1e5, 6);
    expect(pts[0].ph).toBeCloseTo(-0.79, 2);
    expect(pts.at(-1)!.ph).toBeGreaterThan(-90);
    expect(pts.at(-1)!.ph).toBeLessThan(-89);
  });
});

describe('act 6: the cascaded band pass', () => {
  it('fc1 = 338.6 Hz, fc2 = 3288.3 Hz, f0 = 1055.2 Hz, B = 2949.7 Hz, nominal +2.2 (+6.85 dB) in phase', () => {
    const m = metrics('bpf', SHEET_PARTS, false);
    expect(m.fc[0]).toBeCloseTo(338.6, 1);
    expect(m.fc[1]).toBeCloseTo(3288.3, 1);
    expect(m.peak!.f0).toBeCloseTo(1055.2, 1);
    expect(m.fc[1] - m.fc[0]).toBeCloseTo(2949.7, 1);
    expect(m.k).toBeCloseTo(2.2, 12);
    // two inversions: at f0 the output is (nearly) in phase
    expect(Math.abs(angDeg(bandPass(m.peak!.f0)))).toBeLessThan(1e-6);
  });
  it('the real peak at f0 is ≈ 1.99 (+6.0 dB): fc2/fc1 ≈ 9.7 is not ≫ 1; the −3 dB edges are ≈ 285 Hz / 3.91 kHz', () => {
    const m = metrics('bpf', SHEET_PARTS, false);
    expect(m.fc[1] / m.fc[0]).toBeCloseTo(9.71, 2);
    expect(m.peak!.k).toBeCloseTo(1.995, 3);
    expect(db(m.peak!.k)).toBeCloseTo(6.0, 1);
    expect(m.peak!.edges[0]).toBeCloseTo(284.7, 0);
    expect(m.peak!.edges[1]).toBeCloseTo(3910, -1);
    expect(BPF.rf1 / BPF.ri1).toBe(1);
  });
});

describe('act 6: the breadboard (LM358 on the 台式可调直流电源（±9 V）, GBW 1 MHz)', () => {
  it('reads the sheet: 2.18 Vpp at 100 Hz, 1.56 Vpp and −225° at 723 Hz, 0.16 Vpp at 10 kHz', () => {
    expect(sweep(100, 1).vpp).toBeCloseTo(2.18, 2);
    const c = sweep(723.43, 1);
    expect(c.vpp).toBeCloseTo(1.56, 2);
    expect(c.phase).toBeCloseTo(-225, 0);
    expect(sweep(10000, 1).vpp).toBeCloseTo(0.16, 2);
    expect(sweep(100, 1).clipped).toBe(false);
  });
  it('the 1 MHz gain-bandwidth does not limit the 100 Hz – 10 kHz sweep (< 0.02 dB, < 1°)', () => {
    for (const f of [100, 723.43, 1000, 10000]) {
      const ideal = activeLpf(f, RI, RF, CF);
      const real = activeLpf(f, RI, RF, CF, true);
      expect(Math.abs(db(mag(real)) - db(mag(ideal)))).toBeLessThan(0.02);
      expect(Math.abs(angDeg(real) - angDeg(ideal))).toBeLessThan(1);
    }
    // closed-loop bandwidth of the stage: GBW / (1 + Rf/Ri) ≈ 312 kHz, 30× over 10 kHz
    expect(1e6 / (1 + RF / RI) / 10e3).toBeGreaterThan(30);
  });
  it('the swing on ±9 V: +7.5 V / −8.9 V; 1 Vpp in gives 1.1 V peak; the pass band clips above ≈ 6.8 Vpp in', () => {
    expect(VOH).toBe(7.5);
    expect(VOL).toBe(-8.9);
    expect(sweep(100, 1).want).toBeCloseTo(1.09, 2);
    expect(maxInputVpp()).toBeCloseTo(6.82, 2);
    expect(sweep(100, 6.5).clipped).toBe(false);
    const s = sweep(100, 8);
    expect(s.clipped).toBe(true);
    // the positive half clips first (+7.5 V), the negative one only at −8.9 V
    expect(s.vpp).toBeCloseTo(7.5 + 8.7, 0);
  });
});

describe('act 7: the guided design', () => {
  it('step 2: E24 51 kΩ → |K| 5.10 (+14.15 dB); 47 k → +13.44 dB; 56 k → +14.96 dB; target 5 → +13.98 dB', () => {
    expect(DESIGN.rf / DESIGN.ri).toBeCloseTo(5.1, 12);
    expect(db(5.1)).toBeCloseTo(14.15, 2);
    expect(db(4.7)).toBeCloseTo(13.44, 2);
    expect(db(5.6)).toBeCloseTo(14.96, 2);
    expect(db(5)).toBeCloseTo(13.98, 2);
  });
  it('step 3: Cf = 1/(2π · 51 kΩ · 1 kHz) = 3.12 nF → E12 3.3 nF; the wrong 15.9 nF uses Ri', () => {
    expect(1 / (2 * Math.PI * 51e3 * 1e3)).toBeCloseTo(3.12e-9, 11);
    expect(1 / (2 * Math.PI * 10e3 * 1e3)).toBeCloseTo(15.9e-9, 10);
    expect(C_STEPS).toContain(3.3e-9);
  });
  it('step 4: fc = 945.66 Hz (−5.4 %), 10 kHz at −6.37 dB, 20.52 dB under the pass band; 4823 Hz uses Ri', () => {
    const m = metrics('design', SHEET_PARTS, false);
    expect(m.fc[0]).toBeCloseTo(945.66, 2);
    expect((m.fc[0] - 1000) / 1000).toBeCloseTo(-0.054, 3);
    const g = db(mag(activeLpf(10e3, DESIGN.ri, DESIGN.rf, DESIGN.cf)));
    expect(g).toBeCloseTo(-6.37, 2);
    expect(db(5.1) - g).toBeCloseTo(20.52, 2);
    expect(cornerHz(10e3, 3.3e-9)).toBeCloseTo(4823, 0);
    expect(db(5.1) - 3.0103).toBeCloseTo(11.14, 2);
  });
  it('step 5: 5.10 × 1.2 V = 6.12 V < +7.5 V (margin 1.38 V); the corrected option B is 5.1 × 2.4 = 12.24 V', () => {
    const vpk = (DESIGN.rf / DESIGN.ri) * DESIGN.vinPk;
    expect(vpk).toBeCloseTo(6.12, 12);
    expect(VOH - vpk).toBeCloseTo(1.38, 12);
    expect(-vpk).toBeGreaterThan(VOL);
    expect(5.1 * 2.4).toBeCloseTo(12.24, 12);
  });
  it('step 1: 1.2 V into 100 Ω is 12 mA', () => {
    expect(1.2 / 100).toBeCloseTo(0.012, 12);
  });
  it('the sliders step through E12 from 1 kΩ to 100 kΩ and 1 nF to 100 nF (the sheet parts included)', () => {
    expect(R_STEPS[0]).toBe(1000);
    expect(R_STEPS.at(-1)).toBe(100000);
    expect(R_STEPS).toContain(RI);
    expect(R_STEPS).toContain(RF);
    expect(C_STEPS).toContain(CF);
  });
});
