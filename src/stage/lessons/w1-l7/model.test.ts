// The lesson sheet's numbers (docs/lessons/W1-L7.md), recomputed by the stage model.

import { describe, expect, it } from 'vitest';
import { bandsOf, bandsText, readingOf, solve, vLoaded } from './model';

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('W1-L7 circuit model', () => {
  it('series divider 9 V, 2 kΩ + 4 kΩ: 1.5 mA, 3 V / 6 V, the DMM at b12–b19 reads 6.00 V', () => {
    const s = solve('series_vdiv', 9, 2, 4, 4, 3, 'board');
    close(s.req, 6000);
    close(s.i, 1.5e-3);
    close(s.parts[0].v, 3);
    close(s.parts[1].v, 6);
    close(s.parts[1].p, 9e-3);
    expect(readingOf(s, 'V').display).toBe('6.00');
    expect(readingOf(s, 'mA').display).toBe('1.50');
  });
  it('textbook values 2 Ω + 4 Ω: 1.5 A, P_R2 = 9 W (36 × 0.25 W), ratio unchanged', () => {
    const s = solve('series_vdiv', 9, 2, 4, 4, 3, 'textbook');
    close(s.i, 1.5);
    close(s.parts[1].p, 9);
    close(s.parts[0].p + s.parts[1].p, 13.5);
    close(s.vmid, 6);
    expect(readingOf(s, 'mA').blown).toBe(true);
  });
  it('current divider 2 kΩ || 4 kΩ at 9 V: 6.75 mA → 4.50 + 2.25 mA; the DMM at j8 reads 4.50 mA', () => {
    const s = solve('parallel_cdiv', 9, 2, 4, 4, 3, 'board');
    close(s.req, 4000 / 3, 1e-6);
    close(s.i, 6.75e-3);
    close(s.parts[0].i, 4.5e-3);
    close(s.parts[1].i, 2.25e-3);
    expect(readingOf(s, 'mA').display).toBe('4.50');
  });
  it('loading: RL = 4 kΩ → 4.50 V; RL = 40 kΩ → 5.81 V (3.2 % low)', () => {
    close(solve('loaded_vdiv', 9, 2, 4, 4, 3, 'board').vmid, 4.5);
    const v = solve('loaded_vdiv', 9, 2, 4, 40, 3, 'board').vmid;
    expect(v.toFixed(2)).toBe('5.81');
    expect((((6 - v) / 6) * 100).toFixed(1)).toBe('3.2');
    close(vLoaded(9, 2, 4, 10), solve('loaded_vdiv', 9, 2, 4, 40, 3, 'board').vmid);
  });
  it('guided example: 1 kΩ + 6 kΩ || 3 kΩ at 9 V → R_eq 3 kΩ, i 3 mA, i_o 2 mA', () => {
    const s = solve('mixed_socratic', 9, 1, 6, 4, 3, 'board');
    close(s.req, 3000);
    close(s.i, 3e-3);
    close(s.parts[2].i, 2e-3);
    close(s.parts[1].i, 1e-3);
    close(s.vmid, 6);
    expect(readingOf(s, 'mA').display).toBe('2.00');
  });
  it('three branches 2 k / 3 k / 6 k carrying 11 mA (11 V): 5.50 / 3.67 / 1.83 mA', () => {
    const s = solve('parallel3', 11, 2, 3, 4, 6, 'board');
    close(s.req, 1000);
    close(s.i, 11e-3);
    expect(s.parts.map((p) => (p.i * 1e3).toFixed(2))).toEqual(['5.50', '3.67', '1.83']);
  });
  it('quiz: 3 kΩ + 6 kΩ || 6 kΩ → 4.5 V; scaled down 1000×, P_R1 = 6.75 W', () => {
    const s = solve('loaded_vdiv', 9, 3, 6, 6, 3, 'board');
    close(s.vmid, 4.5);
    close(s.parts[0].p, 6.75e-3);
    close(solve('loaded_vdiv', 9, 3, 6, 6, 3, 'textbook').parts[0].p, 6.75);
  });
  it('colour bands', () => {
    expect(bandsText(bandsOf(2000))).toBe('红-黑-红-金');
    expect(bandsText(bandsOf(4000))).toBe('黄-黑-红-金');
    expect(bandsText(bandsOf(500))).toBe('绿-黑-棕-金');
    expect(bandsText(bandsOf(2))).toBe('红-黑-金-金');
    expect(bandsText(bandsOf(12500))).toBe('棕-红-绿-红-棕');
  });
});
