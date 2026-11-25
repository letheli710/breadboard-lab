// The resistor colour code (IEC 60062) for the 4-band reader: digit, multiplier, tolerance.

export interface BandColor {
  key: string;
  zh: string;
  en: string;
  /** swatch fill */
  hex: string;
  /** text colour on the swatch */
  ink: string;
  digit?: number;
  /** power of ten of the multiplier band */
  exp?: number;
  /** tolerance band, % */
  tol?: number;
}

export const COLORS: BandColor[] = [
  { key: 'black', zh: '黑', en: 'black', hex: '#151515', ink: '#fff', digit: 0, exp: 0 },
  { key: 'brown', zh: '棕', en: 'brown', hex: '#7a4a1f', ink: '#fff', digit: 1, exp: 1, tol: 1 },
  { key: 'red', zh: '红', en: 'red', hex: '#c0261b', ink: '#fff', digit: 2, exp: 2, tol: 2 },
  { key: 'orange', zh: '橙', en: 'orange', hex: '#f07a1a', ink: '#1f1300', digit: 3, exp: 3 },
  { key: 'yellow', zh: '黄', en: 'yellow', hex: '#f2cf1d', ink: '#1f1a00', digit: 4, exp: 4 },
  { key: 'green', zh: '绿', en: 'green', hex: '#2f9a45', ink: '#fff', digit: 5, exp: 5, tol: 0.5 },
  { key: 'blue', zh: '蓝', en: 'blue', hex: '#2b59c3', ink: '#fff', digit: 6, exp: 6, tol: 0.25 },
  { key: 'violet', zh: '紫', en: 'violet', hex: '#7c3aed', ink: '#fff', digit: 7, exp: 7, tol: 0.1 },
  { key: 'grey', zh: '灰', en: 'grey', hex: '#8a8f98', ink: '#fff', digit: 8, exp: 8, tol: 0.05 },
  { key: 'white', zh: '白', en: 'white', hex: '#f8f8f6', ink: '#1f2a44', digit: 9, exp: 9 },
  { key: 'gold', zh: '金', en: 'gold', hex: '#d4a72c', ink: '#1f1600', exp: -1, tol: 5 },
  { key: 'silver', zh: '银', en: 'silver', hex: '#c0c4ca', ink: '#1f2a44', exp: -2, tol: 10 },
];

export const COLOR_BY_KEY = new Map(COLORS.map((c) => [c.key, c]));

/** Colours a band position can take: 1–2 digits, 3 multiplier, 4 tolerance. */
export const BAND_CHOICES: string[][] = [
  COLORS.filter((c) => c.digit !== undefined && c.digit > 0).map((c) => c.key),
  COLORS.filter((c) => c.digit !== undefined).map((c) => c.key),
  COLORS.filter((c) => c.exp !== undefined).map((c) => c.key),
  COLORS.filter((c) => c.tol !== undefined).map((c) => c.key),
];

export type Bands = [string, string, string, string];
export const BANDS_10K: Bands = ['brown', 'black', 'orange', 'gold'];

/** Resistance in ohms and tolerance in % of four bands. */
export function bandValue(b: Bands): { ohms: number; tol: number } {
  const [d1, d2, m, t] = b.map((k) => COLOR_BY_KEY.get(k)!);
  return { ohms: (10 * d1.digit! + d2.digit!) * Math.pow(10, m.exp!), tol: t.tol! };
}

/** "10 kΩ", "4.7 kΩ", "220 Ω", "0.47 Ω". */
export function formatOhms(ohms: number): string {
  const fmt = (x: number) => String(Number(x.toPrecision(3)));
  if (ohms >= 1e9) return `${fmt(ohms / 1e9)} GΩ`;
  if (ohms >= 1e6) return `${fmt(ohms / 1e6)} MΩ`;
  if (ohms >= 1e3) return `${fmt(ohms / 1e3)} kΩ`;
  return `${fmt(ohms)} Ω`;
}

/** The value as TeX: "10\\text{ k}\\Omega". */
export function ohmsTex(ohms: number): string {
  const [num, unit] = formatOhms(ohms).split(' ');
  const prefix = unit.slice(0, -1);
  return `${num}\\text{ ${prefix}}\\Omega`;
}

export const superscript = (n: number) =>
  String(n)
    .replace(/-/g, '⁻')
    .replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);

/** What each band of `b` means, for the labels on the stage: "棕 = 1", "橙 = ×10³", "金 = ±5%". */
export function bandMeanings(b: Bands): string[] {
  const sup = (n: number) =>
    String(n)
      .replace(/-/g, '⁻')
      .replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
  return b.map((k, i) => {
    const c = COLOR_BY_KEY.get(k)!;
    if (i < 2) return `${c.zh} = ${c.digit}`;
    if (i === 2) return `${c.zh} = ×10${sup(c.exp!)}`;
    return `${c.zh} = ±${c.tol}%`;
  });
}
