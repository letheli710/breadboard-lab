import { describe, expect, it } from 'vitest';
import { revealOffset, type RevealGeometry } from './reveal';

// a 400 px tall list at y = 100…500, 2000 px of content
const at = (scroll: number, itemStart: number, itemEnd: number): RevealGeometry => ({ viewStart: 100, viewEnd: 500, scroll, size: 400, scrollSize: 2000, itemStart, itemEnd });

describe('revealOffset', () => {
  it('leaves a fully visible item alone', () => {
    expect(revealOffset(at(0, 120, 150))).toBeNull();
    expect(revealOffset(at(300, 470, 500))).toBeNull();
  });
  it('centres an item below the visible part', () => {
    // item 30 px tall at content y = 1200 (screen 1300 with scroll 0): centre → 1200 - 185
    expect(revealOffset(at(0, 1300, 1330))).toBe(1015);
  });
  it('centres an item above the visible part', () => {
    // scrolled to 900; item at content y = 100 (screen 100 + 100 - 900 = -700)
    expect(revealOffset(at(900, -700, -670))).toBe(0);
    expect(revealOffset(at(900, -400, -370))).toBe(215);
  });
  it('centres a partly hidden item', () => {
    expect(revealOffset(at(0, 490, 520))).toBe(205);
  });
  it('clamps to the scroll range', () => {
    // the last item: content y = 1980…2000 → can scroll at most to 1600
    expect(revealOffset(at(0, 2080, 2100))).toBe(1600);
  });
  it('can be forced to centre a visible item', () => {
    expect(revealOffset(at(0, 300, 330))).toBeNull();
    expect(revealOffset(at(0, 300, 330), true)).toBe(15);
    expect(revealOffset(at(15, 285, 315), true)).toBeNull(); // already centred
  });
});
