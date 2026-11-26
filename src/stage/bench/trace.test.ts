import { describe, expect, it } from 'vitest';
import { scopeScreen } from './Oscilloscope';
import { divsKey, OVERSCAN, sampleTrace, toDivs, traceDivs } from './trace';

describe('sampleTrace', () => {
  it('samples a function evenly over the window', () => {
    const s = sampleTrace((t) => 2 * t, 0, 1, 4);
    expect(s).toEqual([
      [0, 0],
      [0.25, 0.5],
      [0.5, 1],
      [0.75, 1.5],
      [1, 2],
    ]);
    expect(sampleTrace(() => NaN, 0, 1, 4)).toEqual([]);
  });
  it('keeps the array points in the window and one neighbour each side', () => {
    const pts: [number, number][] = [0, 1, 2, 3, 4, 5].map((t) => [t, t * 10]);
    expect(sampleTrace(pts, 1.5, 3.5).map((p) => p[0])).toEqual([1, 2, 3, 4]);
    // a window between two samples: the segment that spans it
    expect(sampleTrace(pts, 2.2, 2.8).map((p) => p[0])).toEqual([2, 3]);
    expect(sampleTrace(pts, 7, 8)).toEqual([]);
  });
});

describe('toDivs', () => {
  it('places points on the 10 × 8 graticule and pins them just past the edge', () => {
    const tb = { div: 1e-3, start: -1e-3 };
    const vs = { vdiv: 2, pos: -2 };
    const d = toDivs(
      [
        [-1e-3, 0],
        [4e-3, 5],
        [9e-3, 40],
        [9e-3, -40],
      ],
      tb,
      vs,
    );
    expect(d[0]).toEqual([0, -2]);
    expect(d[1][0]).toBeCloseTo(5);
    expect(d[1][1]).toBeCloseTo(0.5);
    expect(d[2][1]).toBe(4 + OVERSCAN);
    expect(d[3][1]).toBe(-4 - OVERSCAN);
  });
  it('covers the whole screen for a function trace', () => {
    const d = traceDivs((t) => t, { div: 1 }, { vdiv: 1 }, 10);
    expect(d[0][0]).toBe(0);
    expect(d[d.length - 1][0]).toBe(10);
  });
});

describe('scope screen', () => {
  const ch1 = { data: (t: number) => (t > 0 ? 5 : 0), vdiv: 2, pos: -2 };
  it('changes its fingerprint only when what it shows changes', () => {
    const a = scopeScreen({ ch1, time: { div: 1e-3, start: -1e-3 } });
    const b = scopeScreen({ ch1: { ...ch1 }, time: { div: 1e-3, start: -1e-3 } });
    const c = scopeScreen({ ch1: { ...ch1, vdiv: 1 }, time: { div: 1e-3, start: -1e-3 } });
    expect(a.key).toBe(b.key);
    expect(a.key).not.toBe(c.key);
    expect(divsKey([[0, 1]])).not.toBe(divsKey([[0, 1.1]]));
  });
  it('builds the settings line: V/div per channel, s/div, trigger', () => {
    const s = scopeScreen({
      ch1,
      ch2: { data: () => 1, vdiv: 0.5 },
      time: { div: 250e-6 },
      trigger: { source: 'ch1', level: 2.5 },
    });
    expect(s.osd.map((o) => o.text)).toEqual(['CH1 2 V/div', 'CH2 500 mV/div', '250 µs/div', 'Trig ↑ CH1 +2.50 V']);
    expect(s.spec.trigger).toEqual({ level: expect.closeTo(-0.75), at: 0, color: '#fbbf24' });
    expect(s.spec.traces.map((t) => t.marker)).toEqual(['1', '2']);
  });
  it('places cursors in divisions on their channel', () => {
    const s = scopeScreen({
      ch1,
      time: { div: 1e-3, start: -1e-3 },
      cursors: [
        { kind: 'v', ch: 'ch1', at: 5 },
        { kind: 't', at: 2e-3, label: 't_p' },
      ],
    });
    expect(s.spec.cursors[0].at).toBeCloseTo(0.5);
    expect(s.spec.cursors[1].at).toBeCloseTo(3);
  });
});
