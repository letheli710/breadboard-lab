import { describe, expect, it } from 'vitest';
import { pickCorner } from './view';

const area = { x: 0, y: 0, w: 800, h: 420 };
const size = { w: 290, h: 380 };

describe('scope window corner', () => {
  it('stays bottom-right when nothing is under it', () => expect(pickCorner(area, size, [{ x: 100, y: 200 }])).toEqual({ dx: 0, dy: 0, covered: 0 }));
  it('moves to the left when a point is under the bottom-right corner', () => {
    const c = pickCorner(area, size, [{ x: 700, y: 300 }]);
    expect(c.covered).toBe(0);
    expect(c.dx).toBeLessThan(-400);
  });
  it('reports what it still covers when every corner covers something', () => {
    expect(
      pickCorner(area, size, [
        { x: 700, y: 210 },
        { x: 100, y: 210 },
      ]).covered,
    ).toBeGreaterThan(0);
  });
});
