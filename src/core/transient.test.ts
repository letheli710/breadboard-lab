import { describe, expect, it } from 'vitest';
import { simulate } from './solver';
import { freq, simulateTransient } from './transient';
import type { CComponent, Circuit, CompType, PartProps } from './types';

const comp = (ref: string, type: CompType, props: PartProps = {}): CComponent => ({ ref, type, props });
const ckt = (components: CComponent[], nets: Record<string, string[]>): Circuit => ({
  components,
  nets: Object.entries(nets).map(([name, pins]) => ({ name, pins })),
});

const gen = (props: PartProps) => comp('FG1', 'function_gen', { waveform: 'sine', frequency: 1000, amplitude: 1, offset: 0, ...props });

describe('transient: RC / RL / RLC', () => {
  it('RC low-pass at fc: gain 1/√2 and −45° (vs generator terminal)', () => {
    const R = 1000;
    const C = 100e-9;
    const fc = 1 / (2 * Math.PI * R * C);
    const c = ckt([gen({ frequency: fc }), comp('R1', 'resistor', { resistance: R }), comp('C1', 'capacitor', { capacitance: C })], {
      VIN: ['FG1.+', 'R1.1'],
      VOUT: ['R1.2', 'C1.1'],
      GND: ['C1.2', 'FG1.-'],
    });
    const tr = simulateTransient(c);
    expect(tr.converged).toBe(true);
    const g = tr.measure('gain', 'C1.1', undefined, 'FG1.+');
    const ph = tr.measure('phase', 'C1.1', undefined, 'FG1.+');
    expect(Math.abs(g - Math.SQRT1_2) / Math.SQRT1_2).toBeLessThan(0.02);
    expect(Math.abs(ph + 45) / 45).toBeLessThan(0.02);
    expect(tr.measure('freq', 'C1.1') / fc).toBeCloseTo(1, 2);
    // generator loaded through 50 Ω: Vpp at its terminal slightly < 2 V
    expect(tr.measure('vpp', 'FG1.+')).toBeLessThan(2);
    expect(tr.measure('vpp', 'FG1.+')).toBeGreaterThan(1.9);
    expect(tr.stats.ms).toBeLessThan(200);
  });

  it('RC high-pass: phase leads +45° at fc', () => {
    const R = 10000;
    const C = 10e-9;
    const fc = 1 / (2 * Math.PI * R * C);
    const c = ckt([gen({ frequency: fc }), comp('C1', 'capacitor', { capacitance: C }), comp('R1', 'resistor', { resistance: R })], {
      VIN: ['FG1.+', 'C1.1'],
      VOUT: ['C1.2', 'R1.1'],
      GND: ['R1.2', 'FG1.-'],
    });
    const tr = simulateTransient(c);
    expect(tr.measure('phase', 'R1.1', undefined, 'FG1.+')).toBeCloseTo(45, 0);
    expect(tr.measure('vavg', 'R1.1')).toBeCloseTo(0, 3);
  });

  it('RC square wave: capacitor charges with tau = (R + 50 Ω)·C', () => {
    const R = 950;
    const C = 1e-6; // tau = 1 ms
    const tau = (R + 50) * C;
    const T = 20 * tau;
    const c = ckt([gen({ waveform: 'square', frequency: 1 / T, amplitude: 2.5, offset: 2.5 }), comp('R1', 'resistor', { resistance: R }), comp('C1', 'capacitor', { capacitance: C })], {
      VIN: ['FG1.+', 'R1.1'],
      VOUT: ['R1.2', 'C1.1'],
      GND: ['C1.2', 'FG1.-'],
    });
    const tr = simulateTransient(c, { periods: 1 });
    const v = tr.pin('C1.1');
    expect(tr.measure('vmax', 'C1.1')).toBeCloseTo(5, 2);
    expect(tr.measure('vmin', 'C1.1')).toBeCloseTo(0, 2);
    // time for the rising edge (t=0) to reach 63.2 %
    const target = 5 * (1 - Math.exp(-1));
    let j = 0;
    while (v[j] < target) j++;
    const tCross = (j - 1 + (target - v[j - 1]) / (v[j] - v[j - 1])) * tr.dt;
    expect(Math.abs(tCross - tau) / tau).toBeLessThan(0.02);
  });

  it('RL: inductor current rises with tau = L/(R+1Ω+50Ω)', () => {
    const L = 10e-3;
    const R = 49;
    const tau = L / (R + 1 + 50); // 0.1 ms
    const T = 20 * tau;
    const c = ckt([gen({ waveform: 'square', frequency: 1 / T, amplitude: 0.5, offset: 0.5 }), comp('R1', 'resistor', { resistance: R }), comp('L1', 'inductor', { inductance: L })], {
      VIN: ['FG1.+', 'R1.1'],
      N1: ['R1.2', 'L1.1'],
      GND: ['L1.2', 'FG1.-'],
    });
    const tr = simulateTransient(c, { periods: 1 });
    const i = tr.current('L1')!;
    const imax = 1 / 100;
    expect(Math.max(...i)).toBeCloseTo(imax, 4);
    let j = 0;
    while (i[j] < imax * (1 - Math.exp(-1))) j++;
    const target = imax * (1 - Math.exp(-1));
    const tCross = (j - 1 + (target - i[j - 1]) / (i[j] - i[j - 1])) * tr.dt;
    expect(Math.abs(tCross - tau) / tau).toBeLessThan(0.02);
  });

  it('RLC ringing frequency', () => {
    const L = 10e-3;
    const C = 100e-9;
    const R = 10; // + 50 Ω gen + 1 Ω winding → underdamped
    const Rt = R + 51;
    const w0 = 1 / Math.sqrt(L * C);
    const alpha = Rt / (2 * L);
    const fd = Math.sqrt(w0 * w0 - alpha * alpha) / (2 * Math.PI); // ≈ 5 kHz
    const c = ckt([gen({ waveform: 'square', frequency: 200, amplitude: 1, offset: 1 }), comp('R1', 'resistor', { resistance: R }), comp('L1', 'inductor', { inductance: L }), comp('C1', 'capacitor', { capacitance: C })], {
      VIN: ['FG1.+', 'R1.1'],
      N1: ['R1.2', 'L1.1'],
      VOUT: ['L1.2', 'C1.1'],
      GND: ['C1.2', 'FG1.-'],
    });
    const tr = simulateTransient(c, { periods: 1 });
    // find successive maxima of v(C) after the rising edge
    const v = tr.pin('C1.1');
    const peaks: number[] = [];
    for (let j = 1; j < v.length / 2 - 1; j++) if (v[j] > v[j - 1] && v[j] >= v[j + 1] && v[j] > 2.05) peaks.push(j);
    expect(peaks.length).toBeGreaterThanOrEqual(3);
    const fMeas = 1 / ((peaks[1] - peaks[0]) * tr.dt);
    expect(Math.abs(fMeas - fd) / fd).toBeLessThan(0.02);
    expect(tr.measure('vmax', 'C1.1')).toBeGreaterThan(3); // overshoot
  });
});

const opampBase = (extra: CComponent[], nets: Record<string, string[]>, supply = 9) =>
  ckt([comp('V1', 'dc_source', { voltage: supply }), comp('U1', 'opamp'), ...extra], nets);

describe('op-amp', () => {
  it('non-inverting amplifier, DC: gain 1 + Rf/Rg', () => {
    const c = opampBase(
      [comp('V2', 'bench_supply', { voltage: 0.5, currentLimit: 1 }), comp('RF', 'resistor', { resistance: 10000 }), comp('RG', 'resistor', { resistance: 1000 })],
      {
        VCC: ['V1.+', 'U1.v+'],
        GND: ['V1.-', 'U1.v-', 'V2.-', 'RG.2'],
        VIN: ['V2.+', 'U1.inA+'],
        FB: ['U1.inA-', 'RF.2', 'RG.1'],
        VOUT: ['U1.outA', 'RF.1'],
      },
    );
    const s = simulate(c);
    expect(s.converged).toBe(true);
    expect(s.nodeV.get('VOUT')!).toBeCloseTo(5.5, 2);
    expect(s.opamps.get('U1')!.A.mode).toBe('linear');
    expect(s.opamps.get('U1')!.powered).toBe(true);
  });

  it('clips at V+ − 1.5 V in DC', () => {
    const c = opampBase(
      [comp('V2', 'bench_supply', { voltage: 1, currentLimit: 1 }), comp('RF', 'resistor', { resistance: 10000 }), comp('RG', 'resistor', { resistance: 1000 })],
      {
        VCC: ['V1.+', 'U1.v+'],
        GND: ['V1.-', 'U1.v-', 'V2.-', 'RG.2'],
        VIN: ['V2.+', 'U1.inA+'],
        FB: ['U1.inA-', 'RF.2', 'RG.1'],
        VOUT: ['U1.outA', 'RF.1'],
      },
    );
    const s = simulate(c);
    expect(s.nodeV.get('VOUT')!).toBeCloseTo(7.5, 1);
    expect(s.opamps.get('U1')!.A.mode).toBe('high');
  });

  it('unpowered op-amp is off', () => {
    const c = ckt([comp('V2', 'dc_source', { voltage: 1 }), comp('U1', 'opamp'), comp('R1', 'resistor', { resistance: 1000 })], {
      VIN: ['V2.+', 'U1.inA+'],
      GND: ['V2.-', 'R1.2'],
      VOUT: ['U1.outA', 'U1.inA-', 'R1.1'],
    });
    const s = simulate(c);
    expect(s.opamps.get('U1')!.powered).toBe(false);
    expect(Math.abs(s.nodeV.get('VOUT')!)).toBeLessThan(0.01);
  });

  it('inverting amplifier in AC (split ±9 V): gain −10, phase 180°, and clipping', () => {
    const build = (amp: number) =>
      ckt(
        [
          comp('V1', 'dc_source', { voltage: 9 }),
          comp('V2', 'dc_source', { voltage: 9 }),
          comp('U1', 'opamp'),
          gen({ amplitude: amp, frequency: 1000 }),
          comp('RIN', 'resistor', { resistance: 1000 }),
          comp('RF', 'resistor', { resistance: 10000 }),
        ],
        {
          VCC: ['V1.+', 'U1.v+'],
          GND: ['V1.-', 'V2.+', 'FG1.-', 'U1.inB+', 'U1.inA+'],
          VEE: ['V2.-', 'U1.v-'],
          VIN: ['FG1.+', 'RIN.1'],
          SUM: ['RIN.2', 'RF.2', 'U1.inA-'],
          VOUT: ['U1.outA', 'RF.1'],
        },
      );
    const tr = simulateTransient(build(0.3));
    expect(tr.measure('gain', 'U1.outA', undefined, 'FG1.+')).toBeCloseTo(10, 1);
    expect(Math.abs(tr.measure('phase', 'U1.outA', undefined, 'FG1.+'))).toBeCloseTo(180, 0);
    expect(tr.clipping.size).toBe(0);
    const big = simulateTransient(build(2));
    expect(big.measure('vmax', 'U1.outA')).toBeCloseTo(7.5, 1);
    expect(big.measure('vmin', 'U1.outA')).toBeCloseTo(-9, 1);
    expect(big.clipping.has('U1.A')).toBe(true);
  });

  it('non-inverting amplifier in AC with offset on single supply', () => {
    const c = opampBase(
      [gen({ amplitude: 0.2, offset: 1, frequency: 500 }), comp('RF', 'resistor', { resistance: 10000 }), comp('RG', 'resistor', { resistance: 10000 })],
      {
        VCC: ['V1.+', 'U1.v+'],
        GND: ['V1.-', 'U1.v-', 'FG1.-', 'RG.2'],
        VIN: ['FG1.+', 'U1.inA+'],
        FB: ['U1.inA-', 'RF.2', 'RG.1'],
        VOUT: ['U1.outA', 'RF.1'],
      },
    );
    const tr = simulateTransient(c);
    expect(tr.measure('vavg', 'U1.outA')).toBeCloseTo(2, 2);
    expect(tr.measure('vpp', 'U1.outA')).toBeCloseTo(0.8, 2);
    expect(tr.measure('phase', 'U1.outA', undefined, 'FG1.+')).toBeCloseTo(0, 0);
  });
});

describe('ammeter + LED in AC', () => {
  it('ammeter in series reads the DC current', () => {
    const c = ckt([comp('V1', 'dc_source', { voltage: 9 }), comp('AM1', 'ammeter'), comp('R1', 'resistor', { resistance: 1000 })], {
      VCC: ['V1.+', 'AM1.+'],
      N1: ['AM1.-', 'R1.1'],
      GND: ['R1.2', 'V1.-'],
    });
    const s = simulate(c);
    expect(s.meters.get('AM1')!.current).toBeCloseTo(9 / 1000.12, 5);
  });

  it('LED on a sine generator: average current decides "on"', () => {
    const c = ckt([gen({ amplitude: 5, frequency: 50 }), comp('R1', 'resistor', { resistance: 220 }), comp('D1', 'led', { color: 'red' }), comp('AM1', 'ammeter')], {
      VIN: ['FG1.+', 'R1.1'],
      A: ['R1.2', 'AM1.+'],
      B: ['AM1.-', 'D1.anode'],
      GND: ['D1.cathode', 'FG1.-'],
    });
    const tr = simulateTransient(c);
    const led = tr.leds.get('D1')!;
    expect(led.on).toBe(true);
    expect(led.onFraction).toBeGreaterThan(0.2);
    expect(led.onFraction).toBeLessThan(0.5);
    expect(tr.meters.get('AM1')!.dc).toBeCloseTo(led.avgCurrent, 6);
    expect(led.peakCurrent).toBeCloseTo((5 - 1.8) / (220 + 50 + 12 + 0.1), 3);
  });

  it('slow square wave makes the LED flicker', () => {
    const c = ckt([gen({ waveform: 'square', amplitude: 2.5, offset: 2.5, frequency: 2 }), comp('R1', 'resistor', { resistance: 330 }), comp('D1', 'led')], {
      VIN: ['FG1.+', 'R1.1'],
      A: ['R1.2', 'D1.anode'],
      GND: ['D1.cathode', 'FG1.-'],
    });
    const led = simulateTransient(c).leds.get('D1')!;
    expect(led.flicker).toBe(true);
    expect(led.onFraction).toBeCloseTo(0.5, 1);
  });
});

describe('transient performance', () => {
  it('moderate board (op-amp + RC filters + LEDs + slow coupling cap) stays fast', () => {
    const c = ckt(
      [
        comp('V1', 'dc_source', { voltage: 9 }),
        comp('U1', 'opamp'),
        gen({ amplitude: 0.5, frequency: 1000 }),
        comp('CC', 'capacitor', { capacitance: 10e-6 }),
        comp('RB1', 'resistor', { resistance: 100000 }),
        comp('RB2', 'resistor', { resistance: 100000 }),
        comp('RF', 'resistor', { resistance: 22000 }),
        comp('RG', 'resistor', { resistance: 10000 }),
        comp('CG', 'capacitor', { capacitance: 10e-6 }),
        comp('R2', 'resistor', { resistance: 1000 }),
        comp('C2', 'capacitor', { capacitance: 100e-9 }),
        comp('RL', 'resistor', { resistance: 470 }),
        comp('D1', 'led', { color: 'green' }),
        comp('D2', 'led', { color: 'red' }),
        comp('AM1', 'ammeter'),
      ],
      {
        VCC: ['V1.+', 'U1.v+', 'RB1.1'],
        GND: ['V1.-', 'U1.v-', 'FG1.-', 'RB2.2', 'CG.2', 'C2.2', 'D1.cathode'],
        VIN: ['FG1.+', 'CC.1'],
        BIAS: ['CC.2', 'RB1.2', 'RB2.1', 'U1.inA+'],
        FB: ['U1.inA-', 'RF.2', 'RG.1'],
        CGN: ['RG.2', 'CG.1'],
        VOUT: ['U1.outA', 'RF.1', 'R2.1', 'AM1.+'],
        F: ['R2.2', 'C2.1'],
        L: ['AM1.-', 'RL.1'],
        LD: ['RL.2', 'D1.anode', 'D2.cathode'],
        LD2: ['D2.anode', 'U1.outB', 'U1.inB-'],
        X: ['U1.inB+', 'F'],
      },
    );
    // fix "X" net: inB+ follows the filter output
    c.nets = c.nets.filter((n) => n.name !== 'X');
    c.nets.find((n) => n.name === 'F')!.pins.push('U1.inB+');
    const t0 = performance.now();
    const tr = simulateTransient(c);
    const ms = performance.now() - t0;
    expect(tr.converged).toBe(true);
    expect(ms).toBeLessThan(150);
    // AC gain of the bias-coupled non-inverting stage ≈ 1 + 22k/10k
    expect(tr.measure('gain', 'U1.outA', undefined, 'FG1.+')).toBeCloseTo(3.2, 1);
    expect(tr.measure('vavg', 'U1.outA')).toBeCloseTo(4.5, 1);
  });
});

describe('freq() on whole-period windows', () => {
  const N = 256; // samples per period
  const dt = 1e-3 / N; // 1 kHz
  const shape = (w: 'sine' | 'square' | 'triangle', ph: number) => {
    const f = ((ph % 1) + 1) % 1;
    if (w === 'sine') return Math.sin(2 * Math.PI * f);
    if (w === 'square') return f < 0.5 ? 1 : -1;
    return f <= 0.25 ? 4 * f : f <= 0.75 ? 2 - 4 * f : 4 * f - 4;
  };
  const make = (w: 'sine' | 'square' | 'triangle', periods: number, o: { amp?: number; off?: number; phase?: number } = {}) => {
    const x = new Float64Array(N * periods);
    for (let i = 0; i < x.length; i++) x[i] = (o.off ?? 0) + (o.amp ?? 1) * shape(w, i / N + (o.phase ?? 0));
    return x;
  };

  for (const w of ['sine', 'square', 'triangle'] as const)
    for (const periods of [1, 2, 3])
      for (const phase of [0, 0.25, 0.5, 0.75, 0.13])
        it(`${w}, ${periods} period(s), phase ${phase}`, () => {
          expect(freq(make(w, periods, { phase }), dt)).toBeCloseTo(1000, 6);
          // DC offset
          expect(freq(make(w, periods, { phase, off: 2.5 }), dt)).toBeCloseTo(1000, 6);
        });

  it('sine starting exactly at its mid level (regression: reported 500 Hz)', () => {
    expect(freq(make('sine', 2, { off: 2.5, amp: 1.2 }), dt)).toBeCloseTo(1000, 6);
    expect(freq(make('sine', 3), dt)).toBeCloseTo(1000, 6);
  });

  it('low amplitude on a large offset', () => {
    expect(freq(make('sine', 2, { amp: 0.5e-3, off: 5 }), dt)).toBeCloseTo(1000, 6);
    expect(freq(make('triangle', 3, { amp: 1e-4, off: -3 }), dt)).toBeCloseTo(1000, 6);
  });

  it('flat / numerically-flat traces give 0', () => {
    expect(freq(new Float64Array(512).fill(2.5), dt)).toBe(0);
    const x = new Float64Array(512).fill(5);
    x[100] += 1e-12;
    expect(freq(x, dt)).toBe(0);
  });

  it('small ringing does not double-count', () => {
    const x = make('square', 2, { phase: 0.1 });
    for (let i = 0; i < x.length; i++) x[i] += 0.15 * Math.sin((2 * Math.PI * 20 * i) / N);
    expect(freq(x, dt)).toBeCloseTo(1000, 6);
  });

  it('non-periodic slice uses the crossing span', () => {
    const x = make('sine', 3, { phase: 0.3 }).subarray(0, Math.round(N * 2.6));
    expect(freq(x, dt, false)).toBeCloseTo(1000, 0);
    expect(freq(make('sine', 1).subarray(0, N / 2), dt, false)).toBe(0);
  });

  it('RC board: 1 kHz sine measures 1 kHz at both nodes', () => {
    const c = ckt([gen({ frequency: 1000, amplitude: 1, offset: 2.5 }), comp('R1', 'resistor', { resistance: 1000 }), comp('C1', 'capacitor', { capacitance: 100e-9 })], {
      VIN: ['FG1.+', 'R1.1'],
      VOUT: ['R1.2', 'C1.1'],
      GND: ['C1.2', 'FG1.-'],
    });
    const tr = simulateTransient(c);
    expect(tr.measure('freq', 'FG1.+')).toBeCloseTo(1000, 3);
    expect(tr.measure('freq', 'C1.1')).toBeCloseTo(1000, 3);
    const t3 = simulateTransient(c, { periods: 3 });
    expect(t3.measure('freq', 'FG1.+')).toBeCloseTo(1000, 3);
  });
});
