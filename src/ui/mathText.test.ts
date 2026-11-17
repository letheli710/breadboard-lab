// Formula text: common TeX words (\approx, \times, \text{…}) become their characters instead of
// showing as raw markup; \frac / \sqrt / \mat keep their layout.
import { describe, expect, it } from 'vitest';
import { mathNodes, texWords } from './mathText';

describe('formula text', () => {
  it('turns TeX words into characters', () => {
    expect(texWords('I \\approx 23\\ \\text{mA}')).toBe('I ≈ 23 mA');
    expect(texWords('R_1 \\parallel R_2, \\quad 2 \\times 3 \\cdot 4')).toBe('R_1 ∥ R_2,   2 × 3 · 4');
    expect(texWords('\\left( a \\right) \\unknown')).toBe('( a ) \\unknown');
  });
  it('keeps fractions and roots', () => {
    const n = mathNodes('\\frac{9\\ \\text{V}}{R_{eq}} \\approx \\sqrt{2}');
    expect(n[0]).toMatchObject({ k: 'frac', num: [{ k: 'text', t: '9 V' }] });
    expect(n.some((x) => x.k === 'text' && x.t.includes('≈'))).toBe(true);
    expect(n.some((x) => x.k === 'sqrt')).toBe(true);
  });
});
