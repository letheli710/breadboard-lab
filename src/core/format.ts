// Engineering-value parsing / formatting and the resistor colour code.

import { tr } from './i18n';

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
  let s = v
    .trim()
    .replace(/\s+/g, '')
    .replace(/(ohms?|Ω|Hz|F|V|A|H)$/i, '');
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

/** Node voltage under AC: average (DC) value plus its peak-to-peak swing.
 *  short: "2.5 V ~1.2 Vpp" (schematic labels); long: "平均 2.5 V，交流 1.2 Vpp" / "avg 2.5 V, AC 1.2 Vpp".
 *  A swing under 1 mVpp counts as none and only the average is shown. */
export function acVolts(avg: number, pp: number, long = false): string {
  const a = volts(avg);
  if (!(pp >= 1e-3)) return long ? tr(`${a}（无交流）`, `${a} (no AC)`) : a;
  const s = formatSI(pp, 'Vpp');
  return long ? tr(`平均 ${a}，交流 ${s}`, `avg ${a}, AC ${s}`) : `${a} ~${s}`;
}

/** Colour band; the name is bilingual in Chinese mode ("红 red"), English-only otherwise. */
const band = (zh: string, en: string, hex: string) => ({
  get name() {
    return tr(`${zh} ${en}`, en);
  },
  hex,
});

export const BAND_COLORS = [
  band('黑', 'black', '#1b1b1b'),
  band('棕', 'brown', '#7a4a24'),
  band('红', 'red', '#d0312d'),
  band('橙', 'orange', '#ec7a1c'),
  band('黄', 'yellow', '#f2c81f'),
  band('绿', 'green', '#2f9e44'),
  band('蓝', 'blue', '#2563c9'),
  band('紫', 'violet', '#8048b8'),
  band('灰', 'grey', '#8a8a8a'),
  band('白', 'white', '#f4f4f4'),
];
export const GOLD = band('金', 'gold (±5%)', '#c9a227');

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
  const mult = exp >= 0 && exp <= 9 ? BAND_COLORS[exp] : exp === -1 ? band('金', 'gold (×0.1)', '#c9a227') : band('银', 'silver (×0.01)', '#bfc3c7');
  return [BAND_COLORS[d1], BAND_COLORS[d2], mult, GOLD];
}
