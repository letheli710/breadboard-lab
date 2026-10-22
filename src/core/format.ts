// Engineering-value parsing / formatting and the resistor colour code.

const PREFIX: Record<string, number> = {
  p: 1e-12,
  n: 1e-9,
  u: 1e-6,
  µ: 1e-6,
  m: 1e-3,
  k: 1e3,
  K: 1e3,
  M: 1e6,
  G: 1e9,
};

/** Parses "330", "4.7k", "4k7", "1M", "220Ω", "10uF", "0.1µF", 470 → number. */
export function parseValue(v: string | number | undefined | null): number | null {
  if (v === undefined || v === null) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  let s = v.trim().replace(/\s+/g, '').replace(/(ohms?|Ω|F|V|A)$/i, '');
  // "4k7" style
  const mid = s.match(/^(\d+)([pnuµmkKMG])(\d+)$/);
  if (mid) s = `${mid[1]}.${mid[3]}${mid[2]}`;
  const m = s.match(/^(-?\d*\.?\d+(?:e-?\d+)?)([pnuµmkKMG]?)$/);
  if (!m) return null;
  const n = parseFloat(m[1]) * (m[2] ? PREFIX[m[2]] : 1);
  return Number.isFinite(n) ? n : null;
}

export function formatSI(v: number, unit: string, digits = 3): string {
  if (!Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  const table: [number, string][] = [
    [1e9, 'G'],
    [1e6, 'M'],
    [1e3, 'k'],
    [1, ''],
    [1e-3, 'm'],
    [1e-6, 'µ'],
    [1e-9, 'n'],
    [1e-12, 'p'],
  ];
  if (a === 0) return `0 ${unit}`;
  for (const [f, p] of table) {
    if (a >= f * 0.9995) {
      const n = v / f;
      return `${parseFloat(n.toPrecision(digits))} ${p}${unit}`;
    }
  }
  return `${parseFloat((v / 1e-12).toPrecision(digits))} p${unit}`;
}

export const ohms = (v: number) => formatSI(v, 'Ω');
export const volts = (v: number) => formatSI(Math.abs(v) < 5e-4 ? 0 : v, 'V');
export const amps = (v: number) => formatSI(Math.abs(v) < 5e-7 ? 0 : v, 'A');

export const BAND_COLORS = [
  { name: '黑 black', hex: '#1b1b1b' },
  { name: '棕 brown', hex: '#7a4a24' },
  { name: '红 red', hex: '#d0312d' },
  { name: '橙 orange', hex: '#ec7a1c' },
  { name: '黄 yellow', hex: '#f2c81f' },
  { name: '绿 green', hex: '#2f9e44' },
  { name: '蓝 blue', hex: '#2563c9' },
  { name: '紫 violet', hex: '#8048b8' },
  { name: '灰 grey', hex: '#8a8a8a' },
  { name: '白 white', hex: '#f4f4f4' },
];
export const GOLD = { name: '金 gold (±5%)', hex: '#c9a227' };

/** 4-band colour code: [digit1, digit2, multiplier, tolerance] */
export function resistorBands(r: number): { name: string; hex: string }[] {
  if (!(r > 0)) return [BAND_COLORS[0], BAND_COLORS[0], BAND_COLORS[0], GOLD];
  let exp = Math.floor(Math.log10(r)) - 1;
  let sig = Math.round(r / 10 ** exp);
  if (sig >= 100) {
    sig = Math.round(sig / 10);
    exp += 1;
  }
  const d1 = Math.floor(sig / 10);
  const d2 = sig % 10;
  const mult =
    exp >= 0 && exp <= 9
      ? BAND_COLORS[exp]
      : exp === -1
        ? { name: '金 gold (×0.1)', hex: '#c9a227' }
        : { name: '银 silver (×0.01)', hex: '#bfc3c7' };
  return [BAND_COLORS[d1], BAND_COLORS[d2], mult, GOLD];
}
