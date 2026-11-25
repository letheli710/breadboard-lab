import { describe, expect, it } from 'vitest';
import { bandMeanings, bandValue, BANDS_10K, formatOhms } from './colorCode';

describe('resistor colour code', () => {
  it('reads brown-black-orange-gold as 10 kΩ ±5%', () => {
    expect(bandValue(BANDS_10K)).toEqual({ ohms: 10_000, tol: 5 });
    expect(formatOhms(10_000)).toBe('10 kΩ');
    expect(bandMeanings(BANDS_10K)).toEqual(['棕 = 1', '黑 = 0', '橙 = ×10³', '金 = ±5%']);
  });
  it('reads other common values', () => {
    expect(formatOhms(bandValue(['yellow', 'violet', 'red', 'gold']).ohms)).toBe('4.7 kΩ');
    expect(formatOhms(bandValue(['red', 'red', 'brown', 'gold']).ohms)).toBe('220 Ω');
    expect(formatOhms(bandValue(['brown', 'black', 'green', 'silver']).ohms)).toBe('1 MΩ');
    expect(formatOhms(bandValue(['yellow', 'violet', 'gold', 'gold']).ohms)).toBe('4.7 Ω');
    expect(bandMeanings(['yellow', 'violet', 'silver', 'red'])[2]).toBe('银 = ×10⁻²');
  });
});

describe('value as TeX', () => {
  it('keeps the prefix upright next to Ω', async () => {
    const { ohmsTex } = await import('./colorCode');
    expect(ohmsTex(10_000)).toBe('10\\text{ k}\\Omega');
    expect(ohmsTex(220)).toBe('220\\text{ }\\Omega');
  });
});
