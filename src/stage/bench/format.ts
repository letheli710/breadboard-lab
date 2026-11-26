// Pure text of the shared bench instruments (no three.js, no React): the supply's name and front
// panel, the generator's display, the scope's settings line. Numbers use a real minus sign (−).

import { BENCH_NAMES } from '../benchNames';

/** a number with at most `digits` decimals, trailing zeros dropped: 9 → "9", 2.50 → "2.5" */
export function trimNum(v: number, digits = 3): string {
  const s = Math.abs(v)
    .toFixed(digits)
    .replace(/\.?0+$/, '');
  return v < 0 && s !== '0' ? `−${s}` : s;
}

/** fixed decimals with a real minus sign: (−9, 2) → "−9.00" */
export const fixed = (v: number, digits = 2) => (v < 0 ? `−${(-v).toFixed(digits)}` : v.toFixed(digits));

/** signed, for set points: +9.00, −9.00, 0.00 */
export const signed = (v: number, digits = 2) => (v > 0 ? `+${v.toFixed(digits)}` : fixed(v, digits));

/** one value in engineering units: (0.00025, 's') → "250 µs"; (2, 'V') → "2 V"; (0.05, 'V') → "50 mV" */
export function eng(v: number, unit: string, digits = 3): string {
  if (v === 0) return `0 ${unit}`;
  const a = Math.abs(v);
  const steps: [number, string][] = [
    [1e6, 'M'],
    [1e3, 'k'],
    [1, ''],
    [1e-3, 'm'],
    [1e-6, 'µ'],
    [1e-9, 'n'],
  ];
  const [k, p] = steps.find(([k]) => a >= k * 0.9995) ?? steps[steps.length - 1];
  return `${trimNum(Number((v / k).toPrecision(digits)), 3)} ${p}${unit}`;
}

/** frequency for a front panel: 200 → "200 Hz", 1500 → "1.5 kHz", 10000 → "10 kHz" */
export const fmtHz = (f: number) => eng(f, 'Hz');

/** current for a front panel: 0.3 → "0.300 A", 0.0123 → "12.3 mA" */
export const fmtA = (i: number) => (Math.abs(i) >= 1 ? `${fixed(i, 2)} A` : Math.abs(i) >= 0.1 ? `${fixed(i, 3)} A` : eng(i, 'A'));

/* ------------------------------------------------------------- bench supply */

/** One output channel of the bench supply. */
export interface SupplyChannel {
  /** set voltage, V (a magnitude: the sign comes from the wiring / series mode) */
  v: number;
  /** current limit, A */
  limit?: number;
  /** live output current, A (shown as "12.3 mA · CV", or CC when it reaches the limit) */
  i?: number;
  /** replaces the channel's second display line */
  readout?: string;
  /** colour of the channel's + terminal (default red) */
  color?: string;
  /** this channel's output is off or unwired: its display lines dim and read OFF */
  off?: boolean;
}

/**
 * The supply's name: 「台式可调直流电源（5 V）」, 「（±9 V）」 for two equal channels in series,
 * 「（18 V / 36 V）」 for independent channels (and 「（±9 V / 2.5 V）」 with a third one).
 */
export function supplyLabel(channels: SupplyChannel[], series = false): string {
  const v = channels.map((c) => `${trimNum(c.v)} V`);
  let parts = v;
  if (series && channels.length >= 2) {
    const [a, b] = channels;
    const pm = Math.abs(a.v - b.v) < 1e-9 ? [`±${trimNum(a.v)} V`] : [`+${trimNum(a.v)} V`, `−${trimNum(b.v)} V`];
    parts = [...pm, ...v.slice(2)];
  }
  return `${BENCH_NAMES.supply}（${parts.join(' / ')}）`;
}

export type SupplyTerminal = '+' | 'com' | '-' | '1+' | '1-' | '2+' | '2-' | '3+' | '3-';

export interface TerminalSpec {
  key: SupplyTerminal;
  color: string;
  /** printed under the post */
  label: string;
}

export const LEAD_COLORS = { red: '#d62f2f', black: '#24262b', blue: '#2f5fd0', orange: '#f08a1c', yellow: '#e8c21c', green: '#16a34a' } as const;

/**
 * The supply's binding posts, left → right along the foot of the front panel.
 * Series: + (CH1 +, red), COM (CH1 − = CH2 +, black, the GND), − (CH2 −, blue), then CH3's pair.
 * Independent: each channel's + (red) and − (black). A single channel's posts are also '+' / '-'.
 */
export function supplyTerminals(channels: SupplyChannel[], series = false): TerminalSpec[] {
  const out: TerminalSpec[] = [];
  const pair = (n: number) => {
    const c = channels[n - 1];
    out.push({ key: `${n}+` as SupplyTerminal, color: c.color ?? LEAD_COLORS.red, label: `${n}+` });
    out.push({ key: `${n}-` as SupplyTerminal, color: LEAD_COLORS.black, label: `${n}−` });
  };
  if (series && channels.length >= 2) {
    out.push({ key: '+', color: channels[0].color ?? LEAD_COLORS.red, label: '+' });
    out.push({ key: 'com', color: LEAD_COLORS.black, label: 'COM' });
    out.push({ key: '-', color: LEAD_COLORS.blue, label: '−' });
    if (channels[2]) pair(3);
  } else if (channels.length === 1) {
    out.push({ key: '+', color: channels[0].color ?? LEAD_COLORS.red, label: '+' });
    out.push({ key: '-', color: LEAD_COLORS.black, label: '−' });
  } else channels.forEach((_, i) => pair(i + 1));
  return out;
}

/** '+' / '-' on a single-channel supply are CH1's posts; any key resolves to one of supplyTerminals() */
export function resolveTerminal(key: SupplyTerminal, terms: TerminalSpec[]): TerminalSpec | undefined {
  const direct = terms.find((t) => t.key === key);
  if (direct) return direct;
  const alias: Partial<Record<SupplyTerminal, SupplyTerminal>> = { '1+': '+', '1-': '-', '+': '1+', '-': '1-' };
  const a = alias[key];
  return a ? terms.find((t) => t.key === a) : undefined;
}

/** A display line: `strong` lines are the big set-point digits. */
export interface LcdLine {
  text: string;
  strong?: boolean;
  /** a secondary line (currents, the series note): hidden on narrow screens so the display stays small */
  minor?: boolean;
  /** greyed out (an output that is off) */
  dim?: boolean;
}

function channelSub(c: SupplyChannel): string | null {
  if (c.readout) return c.readout;
  if (c.i !== undefined) {
    const cc = c.limit !== undefined && Math.abs(c.i) >= c.limit * 0.999;
    return `${fmtA(c.i)} · ${cc ? 'CC' : 'CV'}`;
  }
  if (c.limit !== undefined) return `限流 ${fmtA(c.limit)}`;
  return null;
}

/** The supply's front-panel display, one or two lines per channel. */
export function supplyLcd(channels: SupplyChannel[], series = false): LcdLine[] {
  const lines: LcdLine[] = [];
  const isSeries = series && channels.length >= 2;
  channels.forEach((c, k) => {
    const v = isSeries && k === 1 ? -Math.abs(c.v) : Math.abs(c.v);
    const head = channels.length === 1 ? `${fixed(v)} V` : `CH${k + 1} ${isSeries && k < 2 ? signed(v) : fixed(v)} V`;
    lines.push({ text: c.off ? `${head} · OFF` : head, strong: true, dim: c.off });
    const sub = c.off ? (c.readout ?? null) : channelSub(c);
    if (sub) lines.push({ text: sub, minor: true, dim: c.off });
  });
  if (isSeries) lines.push({ text: '串联 · COM = GND', minor: true });
  return lines;
}

/* ------------------------------------------------------------- function generator */

export type Waveform = 'sine' | 'square' | 'triangle';

export const WAVE_NAME: Record<Waveform, string> = { sine: 'SINE', square: 'SQUARE', triangle: 'TRIANGLE' };

export interface GenReadout {
  waveform: Waveform;
  /** Hz */
  frequency: number;
  /** peak-to-peak amplitude, V */
  vpp: number;
  /** DC offset, V */
  offset?: number;
  output?: boolean;
  /** 'vpp': "5.00 Vpp · OFS 2.50 V"; 'span': "0 … 5.00 V" (low … high) */
  readout?: 'vpp' | 'span';
  /** output impedance, Ω (appended as "· 50 Ω") */
  impedance?: number;
  /** appended to "OUTPUT OFF" (e.g. "安全拦截") */
  offNote?: string;
}

/** The generator's display: waveform and frequency, amplitude, output state. */
export function genLcd(g: GenReadout): LcdLine[] {
  const off = g.offset ?? 0;
  const amp =
    g.readout === 'span'
      ? `${trimNum(Number((off - g.vpp / 2).toFixed(2)), 2)} … ${fixed(off + g.vpp / 2)} V`
      : `${fixed(g.vpp)} Vpp · OFS ${trimNum(Number(off.toFixed(2)), 2)} V`;
  const out = g.output ?? true;
  return [
    { text: `${WAVE_NAME[g.waveform]} ${fmtHz(g.frequency)}`, strong: true },
    { text: g.impedance ? `${amp} · ${trimNum(g.impedance)} Ω` : amp },
    { text: out ? 'OUTPUT ON' : g.offNote ? `OUTPUT OFF · ${g.offNote}` : 'OUTPUT OFF' },
  ];
}

/** frequency knob angle (radians, −135° … +135°) for f on a log scale over [lo, hi] */
export function knobAngle(f: number, [lo, hi]: [number, number]): number {
  const p = Math.log(Math.min(hi, Math.max(lo, f)) / lo) / Math.log(hi / lo);
  return (-0.75 + 1.5 * p) * Math.PI;
}

/** the frequency after dragging the knob by (dx, dy) px from f0: right / up turns it up, 200 px = one decade; two significant digits */
export function dragFrequency(f0: number, dx: number, dy: number, [lo, hi]: [number, number]): number {
  const v = Math.min(hi, Math.max(lo, f0 * 10 ** ((dx - dy) / 200)));
  const p = 10 ** (Math.floor(Math.log10(v)) - 1);
  return Math.min(hi, Math.max(lo, Math.round(v / p) * p));
}

/* ------------------------------------------------------------- oscilloscope */

/** "2 V/div", "500 mV/div" */
export const fmtVdiv = (v: number) => `${eng(v, 'V')}/div`;
/** "250 µs/div", "1 ms/div" */
export const fmtTdiv = (t: number) => `${eng(t, 's')}/div`;
