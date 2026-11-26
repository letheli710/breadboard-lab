import { describe, expect, it } from 'vitest';
import { dragFrequency, eng, fmtA, fmtHz, fmtTdiv, fmtVdiv, genLcd, knobAngle, resolveTerminal, supplyLabel, supplyLcd, supplyTerminals, trimNum } from './format';

describe('numbers', () => {
  it('trims and uses a real minus sign', () => {
    expect(trimNum(9)).toBe('9');
    expect(trimNum(2.5)).toBe('2.5');
    expect(trimNum(-9)).toBe('−9');
    expect(trimNum(-0.0001)).toBe('0');
  });
  it('writes engineering units', () => {
    expect(eng(0.00025, 's')).toBe('250 µs');
    expect(eng(2, 'V')).toBe('2 V');
    expect(eng(0.05, 'V')).toBe('50 mV');
    expect(fmtHz(200)).toBe('200 Hz');
    expect(fmtHz(1500)).toBe('1.5 kHz');
    expect(fmtHz(10000)).toBe('10 kHz');
    expect(fmtA(0.3)).toBe('0.300 A');
    expect(fmtA(0.0123)).toBe('12.3 mA');
    expect(fmtVdiv(0.5)).toBe('500 mV/div');
    expect(fmtTdiv(1e-3)).toBe('1 ms/div');
  });
});

describe('supplyLabel', () => {
  it('names one channel, a series ±V pair and independent channels', () => {
    expect(supplyLabel([{ v: 5 }])).toBe('台式可调直流电源（5 V）');
    expect(supplyLabel([{ v: 9 }, { v: 9 }], true)).toBe('台式可调直流电源（±9 V）');
    expect(supplyLabel([{ v: 18 }, { v: 36 }])).toBe('台式可调直流电源（18 V / 36 V）');
    expect(supplyLabel([{ v: 9 }, { v: 9 }, { v: 2.5 }], true)).toBe('台式可调直流电源（±9 V / 2.5 V）');
    expect(supplyLabel([{ v: 12 }, { v: 5 }], true)).toBe('台式可调直流电源（+12 V / −5 V）');
  });
});

describe('supply terminals and display', () => {
  it('lays out the posts', () => {
    expect(supplyTerminals([{ v: 5 }]).map((t) => t.key)).toEqual(['+', '-']);
    expect(supplyTerminals([{ v: 9 }, { v: 9 }], true).map((t) => t.key)).toEqual(['+', 'com', '-']);
    expect(supplyTerminals([{ v: 9 }, { v: 9 }, { v: 2.5, color: '#f08a1c' }], true).map((t) => t.key)).toEqual(['+', 'com', '-', '3+', '3-']);
    expect(supplyTerminals([{ v: 18 }, { v: 36 }]).map((t) => t.key)).toEqual(['1+', '1-', '2+', '2-']);
    const one = supplyTerminals([{ v: 5 }]);
    expect(resolveTerminal('1+', one)?.key).toBe('+');
    expect(resolveTerminal('com', one)).toBeUndefined();
  });
  it('shows set points, limits and live current', () => {
    expect(supplyLcd([{ v: 5, limit: 0.3 }]).map((l) => l.text)).toEqual(['5.00 V', '限流 0.300 A']);
    expect(supplyLcd([{ v: 32, i: 0.0123, limit: 0.5 }]).map((l) => l.text)).toEqual(['32.00 V', '12.3 mA · CV']);
    expect(supplyLcd([{ v: 5, i: 0.3, limit: 0.3 }])[1].text).toBe('0.300 A · CC');
    expect(supplyLcd([{ v: 9 }, { v: 9 }], true).map((l) => l.text)).toEqual(['CH1 +9.00 V', 'CH2 −9.00 V', '串联 · COM = GND']);
    expect(supplyLcd([{ v: 9 }, { v: 9 }, { v: 2.5, readout: 'Vref 2.500 V' }], true).map((l) => l.text)).toEqual([
      'CH1 +9.00 V',
      'CH2 −9.00 V',
      'CH3 2.50 V',
      'Vref 2.500 V',
      '串联 · COM = GND',
    ]);
  });
});

describe('generator', () => {
  it('reads out waveform, amplitude and output', () => {
    expect(genLcd({ waveform: 'square', frequency: 200, vpp: 5, offset: 2.5, readout: 'span', impedance: 50 }).map((l) => l.text)).toEqual([
      'SQUARE 200 Hz',
      '0 … 5.00 V · 50 Ω',
      'OUTPUT ON',
    ]);
    expect(genLcd({ waveform: 'sine', frequency: 1000, vpp: 1, output: false, offNote: '安全拦截' }).map((l) => l.text)).toEqual([
      'SINE 1 kHz',
      '1.00 Vpp · OFS 0 V',
      'OUTPUT OFF · 安全拦截',
    ]);
    expect(genLcd({ waveform: 'triangle', frequency: 50, vpp: 10, readout: 'span' })[1].text).toBe('−5 … 5.00 V');
  });
  it('maps the knob on a log scale and drags a decade per 200 px', () => {
    expect(knobAngle(100, [100, 10000])).toBeCloseTo(-0.75 * Math.PI);
    expect(knobAngle(1000, [100, 10000])).toBeCloseTo(0);
    expect(knobAngle(1e6, [100, 10000])).toBeCloseTo(0.75 * Math.PI);
    expect(dragFrequency(1000, 200, 0, [100, 10000])).toBe(10000);
    expect(dragFrequency(1000, 0, 200, [100, 10000])).toBe(100);
    expect(dragFrequency(1000, 30, 0, [100, 10000])).toBe(1400);
  });
});

describe('supply display, minor and off lines', () => {
  it('marks currents and the series note minor, and an off channel dim', () => {
    const l = supplyLcd(
      [
        { v: 9, i: 0.001 },
        { v: 9, off: true, readout: '未接' },
      ],
      true,
    );
    expect(l.map((x) => x.text)).toEqual(['CH1 +9.00 V', '1 mA · CV', 'CH2 −9.00 V · OFF', '未接', '串联 · COM = GND']);
    expect(l.filter((x) => x.minor).length).toBe(3);
    expect(l.filter((x) => x.dim).length).toBe(2);
  });
});
