// Reading a student's typed answer: numbers with SI prefixes and units, simple calculations
// (expr.ts), polar form; judging it against an answer with mistake diagnoses. Used by the
// practice pages (via parse.ts) and by lab measurement questions (core/readings.ts). Kept
// free of the analysis engine so the bench page can load it cheaply.

import { tr } from '../i18n';
import { evalExpr, type ExprError } from './expr';
import type { Part, Question } from './types';

/** Is this answer an angle (compared modulo 360°)? */
export const isPhaseQuestion = (q: { find?: { part?: Part }; unit?: string }) => q.find?.part === 'phase' || q.unit === '°' || q.unit === 'deg';

/** |a − b| for angles in degrees, wrapped into [0, 180]. */
export function angleDiff(a: number, b: number): number {
  const d = (((a - b) % 360) + 360) % 360;
  return Math.min(d, 360 - d);
}

/** Pretty number for messages: up to 6 significant digits, no float noise. */
export function fmtNum(v: number): string {
  if (!Number.isFinite(v)) return String(v);
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e-3 && a < 1e7) return String(parseFloat(v.toPrecision(6)));
  return v.toExponential(5).replace(/\.?0+e/, 'e');
}

// ---------------------------------------------------------------------------------------
// Student answers
// ---------------------------------------------------------------------------------------

const SI_PREFIX: Record<string, number> = { p: 1e-12, n: 1e-9, u: 1e-6, µ: 1e-6, μ: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };

/** Base units the student may type, with aliases → canonical symbol. */
const UNIT_ALIASES: Record<string, string> = {
  v: 'V',
  伏: 'V',
  伏特: 'V',
  a: 'A',
  安: 'A',
  安培: 'A',
  w: 'W',
  瓦: 'W',
  瓦特: 'W',
  var: 'var',
  乏: 'var',
  va: 'VA',
  伏安: 'VA',
  ω: 'Ω',
  ohm: 'Ω',
  ohms: 'Ω',
  欧: 'Ω',
  欧姆: 'Ω',
  s: 's',
  sec: 's',
  秒: 's',
  siemens: 'S',
  hz: 'Hz',
  赫: 'Hz',
  赫兹: 'Hz',
  f: 'F',
  法: 'F',
  h: 'H',
  亨: 'H',
  '°': '°',
  deg: '°',
  '°c': '°C',
  '℃': '°C',
  摄氏度: '°C',
  度: '°',
  db: 'dB',
  'rad/s': 'rad/s',
  rad: 'rad',
  弧度: 'rad',
  j: 'J',
  焦: 'J',
  焦耳: 'J',
  'v/v': 'V/V',
  'a/a': 'A/A',
  'v/s': 'V/s',
  'a/s': 'A/s',
  // transmission lines: lengths, speeds, per-metre constants (a bare "m" stays the milli prefix,
  // except in a question whose unit is "m", see unitOf)
  m: 'm',
  米: 'm',
  'm/s': 'm/s',
  'np/m': 'Np/m',
  'rad/m': 'rad/m',
};

/** Whole unit strings that carry a scale of their own (per-km line constants, km/s). */
const SCALED_UNITS: Record<string, [number, string]> = {
  'np/km': [1e-3, 'Np/m'],
  'rad/km': [1e-3, 'rad/m'],
  'km/s': [1e3, 'm/s'],
  千米: [1e3, 'm'],
  公里: [1e3, 'm'],
};

/** Canonical unit for a unit string (no prefix), or null. Case matters only for S vs s. */
function canonUnit(u: string): string | null {
  if (u === 'S') return 'S';
  if (u === 'Ω' || u === 'Ω') return 'Ω';
  return UNIT_ALIASES[u.toLowerCase()] ?? null;
}

/** Split "kΩ" → {scale: 1e3, unit: 'Ω'}; "m" → {scale 1e-3, unit: ''}; "" → {1, ''}. null if unreadable. */
export function splitUnit(raw: string): { scale: number; unit: string } | null {
  const s = raw.trim();
  if (!s) return { scale: 1, unit: '' };
  const sc = SCALED_UNITS[s.toLowerCase()];
  if (sc) return { scale: sc[0], unit: sc[1] };
  const whole = canonUnit(s);
  // a bare "m"/"M"/"k" … is a prefix, but "S", "s", "F", "H", "A", "V", "W" are units
  if (whole && !(s.length === 1 && s in SI_PREFIX)) return { scale: 1, unit: whole };
  if (s.length === 1 && s in SI_PREFIX) return { scale: SI_PREFIX[s], unit: '' };
  const p = s[0];
  if (p in SI_PREFIX) {
    const rest = canonUnit(s.slice(1));
    if (rest) return { scale: SI_PREFIX[p], unit: rest };
  }
  return null;
}

/** The scale and unit of a question's own `unit`: like splitUnit, but a question asking in metres
 *  ("m") means metres, not the milli prefix. */
export function unitOf(raw: string): { scale: number; unit: string } | null {
  return raw.trim() === 'm' ? { scale: 1, unit: 'm' } : splitUnit(raw);
}

/** Normalise full-width digits / signs / separators that Chinese IMEs produce. */
function normalizeInput(input: string): string {
  let s = input
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[−－–—﹣]/g, '-')
    .replace(/[＋]/g, '+')
    .replace(/[．。]/g, '.')
    .replace(/[，、]/g, ',')
    .replace(/[ＥｅＥ]/g, 'e')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/／/g, '/')
    .replace(/＊/g, '*')
    .replace(/％/g, '%')
    .replace(/＾/g, '^')
    .replace(/º/g, '°')
    .replace(/Ω/g, 'Ω')
    .replace(/\/_/g, '∠')
    .replace(/\s+/g, '');
  // "1,234.5" → thousands separators; a lone "1,5" → decimal comma
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?/.test(s)) s = s.replace(/,/g, '');
  else s = s.replace(',', '.');
  // 1.2x10^-3, 2x3 → multiplication; the old "1.2×10-3" shorthand (exponent without ^) → 1.2e-3
  s = s.replace(/(\d)[xX](?=[\d(.])/g, '$1*');
  s = s.replace(/^([+-]?(?:\d+\.?\d*|\.\d+))[×*·]10(-\d+)$/, '$1e$2');
  // superscript exponents: 10⁻³ → 10^(-3)
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  s = s.replace(/([⁻⁺]?)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, sg: string, d: string) => `^(${sg === '⁻' ? '-' : ''}${[...d].map((c) => SUP.indexOf(c)).join('')})`);
  return s;
}

export interface AnswerCheck {
  ok: boolean;
  /** the student's value in SI base units */
  value?: number;
  /** why it can't be accepted / a nudge (sign, prefix …) — already localised */
  reason?: string;
  /** wrong, but within a few percent: a rounding problem rather than a wrong method */
  close?: boolean;
  /** which mistake was recognised (for tests / analytics) */
  diagnosis?: 'sign' | 'close' | 'e3' | 'e6' | 'e9' | 'sqrt2' | 'sqrt3' | '2pi' | 'recip' | 'rad' | 'phase180';
}

/** relative tolerance used when a question has no `tol` */
export const DEFAULT_TOL = 0.02;
/** absolute tolerance for angles (degrees, compared modulo 360°) */
export const PHASE_TOL_DEG = 1;
/** "very close" band: within this relative error (5°/… for angles) the student hears "check the rounding" */
const CLOSE_REL = 0.05;
const CLOSE_DEG = 5;

/** The tolerance a question's answer is judged with, for display: "±2%" or "±1°". */
export function answerTolerance(q: Pick<Question, 'unit' | 'tol' | 'tolDeg'> & { find?: { part?: Part } }): string {
  if (isPhaseQuestion(q)) return `±${q.tolDeg ?? PHASE_TOL_DEG}°`;
  return `±${fmtNum((q.tol ?? DEFAULT_TOL) * 100)}%`;
}

const answerExamples = () => tr('例如 2.5、-3m、4.7k、1.2e-3、12/6、2√2、sqrt(2)、π/6、60%、4∠30', 'e.g. 2.5, -3m, 4.7k, 1.2e-3, 12/6, 2√2, sqrt(2), π/6, 60%, 4∠30');

function exprMessage(e: ExprError, input: string): string {
  const shown = input.trim();
  switch (e.code) {
    case 'name':
      return tr(
        `不认识“${e.name}”。可以写数字、算式和单位，${answerExamples()}`,
        `Unknown word "${e.name}". Type a number or a calculation with an optional unit, ${answerExamples()}`,
      );
    case 'char':
      return tr(`答案里不能有“${e.char}”。${answerExamples()}`, `"${e.char}" can't appear in an answer. ${answerExamples()}`);
    case 'div0':
      return tr('算式里除以了 0', 'The calculation divides by 0');
    case 'nan':
      return tr('这个算式算不出一个有限的数（负数开方？数太大？）', "That calculation doesn't give a finite number (square root of a negative? too large?)");
    default:
      return tr(`看不懂“${shown}”——请输入一个数或算式，${answerExamples()}`, `Can't read "${shown}" — type a number or a calculation, ${answerExamples()}`);
  }
}

const unitChar = (c: string | undefined) => !!c && c !== 'π' && (/\p{L}/u.test(c) || c === '°' || c === 'Ω' || c === '℃');

/** Split a trailing unit ("2.5kΩ" → "2.5" + "kΩ", "π/6rad" → "π/6" + "rad"); "2pi" keeps its "pi". */
function splitSuffix(s: string): { body: string; suffix: string } {
  let i = s.length;
  while (i > 0 && (unitChar(s[i - 1]) || (s[i - 1] === '/' && unitChar(s[i]) && unitChar(s[i - 2])))) i--;
  const run = s.slice(i);
  for (let k = 0; k < run.length; k++) {
    const suf = run.slice(k);
    if (suf[0] !== '/' && splitUnit(suf)) return { body: s.slice(0, i + k), suffix: suf };
  }
  return { body: s, suffix: '' };
}

type Quantity1 = { value: number; unit: string; scaled: boolean; suffix: string };

/** One number / calculation with an optional unit suffix, scaled by the typed prefix. */
function readQuantity(text: string, input: string): Quantity1 | { reason: string } {
  const { body, suffix } = splitSuffix(text);
  if (!body) return { reason: suffix ? tr(`“${suffix}”前面要有一个数`, `Put a number before "${suffix}"`) : tr('请先输入一个数', 'Type a number first') };
  const r = evalExpr(body);
  if ('error' in r) return { reason: exprMessage(r.error, input) };
  const u = suffix ? splitUnit(suffix)! : { scale: 1, unit: '' };
  return { value: r.value * u.scale, unit: u.unit, scaled: !!suffix || r.prefixed, suffix };
}

const wrongUnit = (q: Pick<Question, 'unit'>, suffix: string) => ({
  reason: tr(`单位不对：这里要的是 ${q.unit}，你写的是 ${suffix}`, `Wrong unit: this asks for ${q.unit}, you wrote ${suffix}`),
});

const RAD = 180 / Math.PI;

/** Read the student's input as a number in SI base units (degrees for angles), honouring prefixes,
 *  the question's unit, simple calculations ("12/6", "2√2", "π/6 rad") and polar form ("4∠30"). */
export function readAnswer(q: Pick<Question, 'unit'> & { find?: { part?: Part } }, input: string): { value: number; unit?: string } | { reason: string } {
  // "-2 1/s", "3 s⁻¹": the unit 1/s can't be told apart from a division once spaces are gone
  let raw = input.trim();
  const perSecond = /(?:\s+1\/s|\s*s⁻¹|\s*s\^-1)$/.exec(raw);
  if (perSecond && perSecond.index > 0) {
    if (q.unit !== '1/s') return wrongUnit(q, perSecond[0].trim());
    raw = raw.slice(0, perSecond.index);
  }
  let s = normalizeInput(raw);
  if (!s) return { reason: tr('请先输入一个数', 'Type a number first') };
  const phase = isPhaseQuestion(q);
  const expected = unitOf(q.unit ?? '');
  // "200 m" in a question asked in metres: the trailing "m" is the unit, not milli
  if (expected?.unit === 'm' && /[\d.)\s]m$/.test(s)) s = s.slice(0, -1) + '米';
  // temperature: °C / ℃ always; a bare "C" or "K" only where a temperature is asked (elsewhere "K" is kilo)
  if (expected?.unit === '°C') {
    const t = /^(.*?)(°C|°c|℃|C|K)$/.exec(s);
    if (t && t[1] && !unitChar(t[1][t[1].length - 1])) {
      const r = readQuantity(t[1], input);
      if ('reason' in r) return r;
      if (r.unit) return wrongUnit(q, r.suffix + t[2]);
      const v = t[2] === 'K' ? r.value - 273.15 : r.value;
      if (!Number.isFinite(v)) return { reason: tr('这个数太大了', 'That number is too large') };
      return { value: v, unit: t[2] === 'K' ? 'K' : '°C' };
    }
  }
  const sides = s.split('∠');
  if (sides.length > 2) return { reason: exprMessage({ code: 'syntax' }, input) };

  const asAngle = (r: Quantity1) => {
    if (r.unit && r.unit !== '°' && r.unit !== 'rad') return { reason: tr(`角度的单位应该是 ° 或 rad，你写的是 ${r.suffix}`, `An angle is in ° or rad, you wrote ${r.suffix}`) };
    return { value: r.unit === 'rad' ? r.value * RAD : r.value, unit: r.unit || undefined };
  };
  const asValue = (r: Quantity1) => {
    if (r.unit && expected?.unit && r.unit !== expected.unit) return wrongUnit(q, r.suffix);
    // nothing typed after the number → it is in the unit shown next to the box (which may be "mA", "kΩ" …)
    const v = r.scaled ? r.value : r.value * (expected?.scale ?? 1);
    if (!Number.isFinite(v)) return { reason: tr('这个数太大了', 'That number is too large') };
    return { value: v, unit: r.unit || undefined };
  };

  if (sides.length === 2) {
    const m = readQuantity(sides[0], input);
    if ('reason' in m) return m;
    const a = readQuantity(sides[1], input);
    if ('reason' in a) return a;
    const ang = asAngle(a);
    if ('reason' in ang) return ang;
    if (phase) return ang;
    const mag = asValue(m);
    if ('reason' in mag) return mag;
    const part = q.find?.part;
    const k = part === 're' ? Math.cos(ang.value / RAD) : part === 'im' ? Math.sin(ang.value / RAD) : 1;
    return { value: mag.value * k, unit: mag.unit };
  }
  const r = readQuantity(s, input);
  if ('reason' in r) return r;
  return phase ? asAngle(r) : asValue(r);
}

/** Check a student's numeric answer against q.answer: relative tolerance q.tol ?? 2 %; angles ±1° modulo 360°.
 *  Wrong answers are diagnosed (sign, prefix, √2, √3, 2π, reciprocal, radians, rounding). */
export function checkAnswer(q: Question, input: string): AnswerCheck {
  if (typeof q.answer !== 'number') return { ok: false, reason: tr('这道题没有数值答案', 'This question has no numeric answer') };
  const r = readAnswer(q, input);
  if ('reason' in r) return { ok: false, reason: r.reason };
  const v = r.value;
  const ans = q.answer;
  const tol = q.tol ?? DEFAULT_TOL;
  const no = (diagnosis: AnswerCheck['diagnosis'], reason: string): AnswerCheck => ({ ok: false, value: v, reason, diagnosis, close: diagnosis === 'close' || undefined });

  if (isPhaseQuestion(q)) {
    const tolDeg = q.tolDeg ?? PHASE_TOL_DEG;
    const d = angleDiff(v, ans);
    if (d <= tolDeg) return { ok: true, value: v };
    if (r.unit !== 'rad' && Math.abs(v) <= 2 * Math.PI + 0.01 && angleDiff(v * RAD, ans) <= tolDeg)
      return no(
        'rad',
        tr(
          `看起来你填的是弧度（${fmtNum(v)} rad = ${fmtNum(parseFloat((v * RAD).toPrecision(4)))}°）——这里默认按度（°）读；用弧度请写成“${fmtNum(v)} rad”。`,
          `Looks like radians (${fmtNum(v)} rad = ${fmtNum(parseFloat((v * RAD).toPrecision(4)))}°) — a bare number is read in degrees; write "${fmtNum(v)} rad" to use radians.`,
        ),
      );
    if (d <= CLOSE_DEG)
      return no(
        'close',
        tr(
          `非常接近了！差了 ${fmtNum(parseFloat(d.toPrecision(2)))}°，允许误差 ±${tolDeg}°——检查四舍五入，中间结果多保留几位有效数字。`,
          `Very close! ${fmtNum(parseFloat(d.toPrecision(2)))}° off, the tolerance is ±${tolDeg}° — check your rounding and keep more significant figures in between.`,
        ),
      );
    if (angleDiff(v, ans + 180) <= tolDeg)
      return no('phase180', tr('差了 180°——相量方向反了？检查图上的参考方向。', 'Off by 180° — the phasor points the other way? Check the reference direction in the drawing.'));
    if (Math.abs(ans) > tolDeg && angleDiff(-v, ans) <= tolDeg)
      return no('sign', tr('大小对了，但角度的符号反了——是超前还是滞后？', 'Right size, wrong sign of the angle — leading or lagging?'));
    return { ok: false, value: v };
  }

  // (1 + 1e-9): an answer exactly on the edge (2.04 for 2 at ±2 %) is in, despite float rounding
  const lim = Math.max(tol * Math.abs(ans) * (1 + 1e-9), 1e-9);
  if (Math.abs(v - ans) <= lim) return { ok: true, value: v };
  if (Math.abs(ans) <= 1e-9 || v === 0) return { ok: false, value: v };
  if (Math.abs(v + ans) <= lim) return no('sign', tr('大小对了，但符号反了——再看看图上的参考方向。', 'Right size, wrong sign — check the reference direction in the drawing.'));
  const rel = Math.abs(v - ans) / Math.abs(ans);
  if (rel <= CLOSE_REL + 1e-9)
    return no(
      'close',
      tr(
        `非常接近了！差了 ${fmtNum(parseFloat((rel * 100).toPrecision(2)))}%，允许误差 ±${fmtNum(tol * 100)}%——检查四舍五入，中间结果多保留几位有效数字。`,
        `Very close! ${fmtNum(parseFloat((rel * 100).toPrecision(2)))}% off, the tolerance is ±${fmtNum(tol * 100)}% — check your rounding and keep more significant figures in between.`,
      ),
    );

  const ratio = Math.abs(v / ans);
  const near = (x: number, k: number) => Math.abs(x / k - 1) <= Math.max(tol, 0.01);
  const factor = (k: number) => near(ratio, k) || near(ratio, 1 / k);
  const signToo = v / ans < 0 ? tr('（而且符号也反了）', ' (and the sign is flipped too)') : '';
  if (factor(1e3)) return no('e3', tr('数字对了，但差了 1000 倍——检查单位前缀（m、k、µ）。', 'Right digits, off by a factor of 1000 — check the unit prefix (m, k, µ).') + signToo);
  if (factor(1e6))
    return no(
      'e6',
      tr(
        '数字对了，但差了 10⁶ 倍——检查单位前缀：µ 和无前缀、m 和 k、无前缀和 M 是不是弄混了。',
        'Right digits, off by a factor of 10⁶ — check the unit prefix: µ vs none, m vs k, or none vs M.',
      ) + signToo,
    );
  if (factor(1e9))
    return no(
      'e9',
      tr(
        '数字对了，但差了 10⁹ 倍——检查单位前缀：n 和无前缀、µ 和 k、无前缀和 G 是不是弄混了。',
        'Right digits, off by a factor of 10⁹ — check the unit prefix: n vs none, µ vs k, or none vs G.',
      ) + signToo,
    );
  if (factor(Math.SQRT2))
    return no('sqrt2', tr('差了 √2 倍——峰值（幅值）和有效值弄混了？有效值 = 峰值 / √2。', 'Off by a factor of √2 — peak (amplitude) and RMS mixed up? RMS = peak / √2.') + signToo);
  if (factor(Math.sqrt(3)))
    return no(
      'sqrt3',
      tr(
        '差了 √3 倍——线电压/线电流和相电压/相电流弄混了？Y 接 U_线 = √3·U_相，Δ 接 I_线 = √3·I_相。',
        'Off by a factor of √3 — line and phase quantities mixed up? Wye: U_line = √3·U_phase; delta: I_line = √3·I_phase.',
      ) + signToo,
    );
  if (factor(2 * Math.PI))
    return no(
      '2pi',
      tr('差了 2π 倍——角频率 ω（rad/s）和频率 f（Hz）弄混了？ω = 2πf。', 'Off by a factor of 2π — angular frequency ω (rad/s) and frequency f (Hz) mixed up? ω = 2πf.') + signToo,
    );
  // reciprocal, compared in the unit shown next to the box (0.5 typed for 2 kΩ in a kΩ box)
  const shown = unitOf(q.unit ?? '')?.scale ?? 1;
  if (near(Math.abs((v / shown) * (ans / shown)), 1))
    return no(
      'recip',
      tr(
        '像是倒数——电阻和电导（G = 1/R）、周期和频率（f = 1/T）、时间常数和 1/τ 是不是弄混了？',
        'Looks like the reciprocal — resistance vs conductance (G = 1/R), period vs frequency (f = 1/T), or τ vs 1/τ mixed up?',
      ) + signToo,
    );
  return { ok: false, value: v };
}

/** The answer formatted for display in the question's unit (e.g. 0.0025 A with unit "mA" → "2.5 mA"). */
export function formatAnswer(q: Pick<Question, 'answer' | 'unit'>): string {
  if (typeof q.answer !== 'number') return '';
  const u = unitOf(q.unit ?? '');
  const scale = u?.scale ?? 1;
  const v = q.answer / scale;
  return `${fmtNum(parseFloat(v.toPrecision(4)))}${q.unit ? ` ${q.unit}` : ''}`;
}
