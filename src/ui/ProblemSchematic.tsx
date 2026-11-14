// Textbook-style drawing of a theory-problem schematic (format circuit-problem/1).
// The picture uses the same geometry rules as extractNetlist (junction dots come from
// junctionPoints), so what the student sees is exactly the circuit the engine solves.

import { FigureFrame } from './FigureFrame';
import { useMemo, type ReactNode } from 'react';
import { parseNum } from '../core/analysis/circuit';
import { formatSI } from '../core/format';
import { getLang, tr } from '../core/i18n';
import { isTwoTerminal, junctionPoints, lineWidth, onSegment, terminalPoints, wireSegments } from '../core/problem/geometry';
import type { CtrlRef, LineElement, Pt, ProblemElement, Schematic, TwoTerminalElement } from '../core/problem/types';
import { subQ } from './subQ';

const U = 40; // px per grid unit
const SW = 1.7; // stroke width
const FS = 13; // label font size
const LOOP_R = 0.7 * U; // radius of a mesh-current arrow (1.4 grid units across)

type V2 = [number, number];
interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

// ---------------------------------------------------------------- rich text

/** A run of text: `it` = italic quantity letter, `sub` = subscript. */
interface Run {
  t: string;
  it?: boolean;
  sub?: boolean;
}

/** "u_R1" → u + subscript R1, "U_{ab}" → U + subscript ab; single letters are italic. A phasor dot
 *  (combining U+0307, e.g. "U̇_s", or precomposed "İ_1"), a hat (combining U+0302, or precomposed
 *  "û_1", "î_k", "Û", "Î") or a bar (combining U+0304, complex power "S̄_Us") stays on the base letter. */
export function richRuns(s: string): Run[] {
  const out: Run[] = [];
  const re = /([A-Za-zα-ωΑ-Ω][\u0307\u0302\u0304]?|[\u0130ûîÛÎ])_(\{([^}]*)\}|([A-Za-z0-9]+))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: s.slice(last, m.index) });
    let sub = m[3] ?? m[4];
    // juxtaposed products without braces ("U_lI_l", "z_12z_21", "U̇_AY_A"): a run that runs into the
    // next symbol's "_" gives its last letter back as that symbol
    let end = re.lastIndex;
    if (m[4] && sub.length > 1 && /[A-Za-zα-ωΑ-Ω]$/.test(sub) && (s[end] === '_' || (/[\u0307\u0302\u0304]/.test(s[end]) && s[end + 1] === '_'))) {
      sub = sub.slice(0, -1);
      end -= 1;
      re.lastIndex = end;
    }
    out.push({ t: m[1], it: true }, { t: sub, sub: true });
    last = end;
  }
  if (last < s.length) out.push({ t: s.slice(last) });
  if (out.length === 1 && /^(?:[A-Za-zα-ω][\u0307\u0302\u0304]?|[\u0130ûîÛÎ])$/.test(out[0].t)) out[0].it = true;
  return out;
}

/** Element refs / mark names: "R1" → R₁, "Us" → U_s, "RL" → R_L (unless they already use "_"). */
export function symbolText(ref: string): string {
  if (ref.includes('_')) return ref;
  const m = ref.match(/^([A-Za-z])([A-Za-z]{0,3}\d*|\d+)$/);
  return m && m[2] ? `${m[1]}_${m[2]}` : ref;
}

const textWidth = (runs: Run[], size = FS) =>
  runs.reduce((w, r) => {
    let n = 0;
    for (const ch of r.t) n += /[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? 1 : /[ .,:;!|]/.test(ch) ? 0.3 : 0.6;
    return w + n * size * (r.sub ? 0.75 : 1);
  }, 0);

function Rich({ runs, ...p }: { runs: Run[]; x: number; y: number; anchor?: 'start' | 'middle' | 'end'; className?: string; fill?: string }) {
  let dy = 0;
  return (
    <text x={p.x} y={p.y} textAnchor={p.anchor ?? 'start'} className={p.className} fill={p.fill}>
      {runs.map((r, i) => {
        const want = r.sub ? 3.5 : 0;
        const d = want - dy;
        dy = want;
        return (
          <tspan key={i} dy={d || undefined} fontStyle={r.it ? 'italic' : undefined} fontSize={r.sub ? '0.75em' : undefined}>
            {r.sub ? subQ(r.t, true) : r.t}
          </tspan>
        );
      })}
    </text>
  );
}

// ---------------------------------------------------------------- value labels

/** number or SI string ("2m", "4.7k") → number, with the same parser as the engine; null if unreadable */
function toNum(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  try {
    return parseNum(v, '');
  } catch {
    return null;
  }
}
/** 4 significant digits; unreadable input is shown as given */
const num = (v: unknown): string => {
  const n = toNum(v);
  return n === null ? String(v) : String(parseFloat(n.toPrecision(4)));
};

function siOrRaw(v: unknown, unit: string): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v === 'number' || typeof v === 'string') {
    const n = toNum(v);
    return n === null ? String(v) : formatSI(n, unit);
  }
  return null;
}

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
/** e⁻²ᵗ for integer rates, e^(−0.5t) otherwise */
function expText(alpha: number | null): string {
  if (alpha === null) return 'e^(−αt)';
  if (alpha === 0) return '';
  const a = Math.abs(alpha);
  const sign = alpha > 0 ? '⁻' : '';
  if (Number.isInteger(a)) return `e${sign}${a === 1 ? '' : [...String(a)].map((c) => SUP[c]).join('')}ᵗ`;
  return `e^(${alpha > 0 ? '−' : ''}${num(a)}t)`;
}

function sourceText(v: TwoTerminalElement['value'], unit: string): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v === 'number' || typeof v === 'string') return siOrRaw(v, unit);
  const o = v as Record<string, any>;
  if (o.step) return `${num(o.step.before)}→${num(o.step.after)} ${unit}`;
  if (o.harmonics) {
    // dc + Σ amp·cos(kωt + φ): short form "10 + 100cos ωt + 30cos(3ωt−30°) V" (authors usually give a label)
    const h = o.harmonics as { dc?: unknown; terms?: { k?: unknown; amp?: unknown; phase?: unknown }[] };
    const parts: string[] = [];
    const dc = toNum(h.dc ?? 0) ?? 0;
    if (dc) parts.push(num(dc));
    for (const t of Array.isArray(h.terms) ? h.terms : []) {
      const k = toNum(t.k ?? 1) ?? 1;
      const ph = toNum(t.phase ?? 0) ?? 0;
      const arg = `${k === 1 ? '' : num(k)}ωt`;
      parts.push(`${num(t.amp)}cos${ph ? `(${arg}${ph > 0 ? '+' : '−'}${num(Math.abs(ph))}°)` : ` ${arg}`}`);
    }
    return parts.length ? `${parts.join(' + ')} ${unit}` : null;
  }
  if (o.wave) return `${num(o.wave.amp)} ${unit}`;
  // s-domain chapter: area·δ(t), amp·e^(−αt) (t ≥ 0)
  if (o.impulse) {
    const a = toNum(o.impulse.area);
    return `${a === 1 ? '' : a === -1 ? '−' : num(o.impulse.area)}δ(t) ${unit}`;
  }
  if (o.exp) return `${num(o.exp.amp)}${expText(toNum(o.exp.alpha))} ${unit}`;
  if (o.sin) {
    const { amp, freq: f0, phase: p0, offset: o0 } = o.sin;
    const freq = toNum(f0) ?? NaN;
    const phase = toNum(p0) ?? 0;
    const offset = toNum(o0) ?? 0;
    const w = 2 * Math.PI * freq;
    const wt = Number.isFinite(w) && Math.abs(w - Math.round(w)) < 1e-6 * Math.max(1, w) ? `${Math.round(w)}t` : `2π·${num(f0)}t`;
    const ph = phase ? `${phase > 0 ? '+' : '−'}${num(Math.abs(phase))}°` : '';
    const off = offset ? `${num(offset)}+` : '';
    return `${off}${num(amp)}sin(${wt}${ph}) ${unit}`;
  }
  const parts: string[] = [];
  const dc = o.dc === undefined ? null : toNum(o.dc);
  if (o.dc !== undefined && (dc !== 0 || !o.ac)) parts.push(dc === null ? `${String(o.dc)} ${unit}` : formatSI(dc, unit));
  if (o.ac) parts.push(`${num(o.ac.mag)}∠${num(o.ac.phase ?? 0)}° ${unit}`);
  return parts.length ? parts.join(' + ') : null;
}

function ctrlSymbol(c: CtrlRef | undefined): string {
  const u = getLang() === 'zh' ? 'u' : 'v';
  if (!c) return '?';
  if ('i' in c) return `i_{${c.i}}`;
  if ('v' in c) return `${u}_{${c.v}}`;
  const [a, b] = c.vnodes;
  return /^(0|gnd)$/i.test(b) ? `${u}_{${a}}` : `${u}_{${a}${b}}`;
}

const NR_SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** Characteristic of a nonlinear resistor as a label: "i = 0.5u²", "u = i + i³", "U_on = 0.7 V";
 *  null for a piecewise-linear table (draw it with schematic.plot). */
export function lawText(law: unknown): string | null {
  if (!law || typeof law !== 'object') return null;
  const o = law as Record<string, unknown>;
  const poly = (y: string, x: string, c: unknown, min: unknown, max: unknown): string | null => {
    if (!Array.isArray(c)) return null;
    const terms: string[] = [];
    c.forEach((v, k) => {
      const n = toNum(v);
      if (!n) return;
      const mag = Math.abs(n);
      const coef = k > 0 && mag === 1 ? '' : num(mag);
      const pw =
        k === 0
          ? ''
          : k === 1
            ? x
            : `${x}${String(k)
                .split('')
                .map((d) => NR_SUP[+d])
                .join('')}`;
      terms.push(`${n < 0 ? (terms.length ? ' − ' : '−') : terms.length ? ' + ' : ''}${coef}${pw}`);
    });
    if (!terms.length) return null;
    const lo = toNum(min);
    const hi = toNum(max);
    const cond = lo !== null && hi !== null ? ` (${num(lo)} ≤ ${x} ≤ ${num(hi)})` : lo !== null ? ` (${x} ≥ ${num(lo)})` : hi !== null ? ` (${x} ≤ ${num(hi)})` : '';
    return `${y} = ${terms.join('')}${cond}`;
  };
  if ('i' in o) return poly('i', 'u', o.i, o.umin, o.umax);
  if ('u' in o) return poly('u', 'i', o.u, o.imin, o.imax);
  if ('diode' in o && o.diode && typeof o.diode === 'object') {
    const d = o.diode as Record<string, unknown>;
    const parts = [];
    if (toNum(d.uon)) parts.push(`U_on = ${formatSI(toNum(d.uon)!, 'V')}`);
    if (toNum(d.ron)) parts.push(`R_on = ${formatSI(toNum(d.ron)!, 'Ω')}`);
    return parts.length ? parts.join(', ') : null;
  }
  return null;
}

/** The value part of an element's label ("2 kΩ", "10∠30° V", "2u_R1"), or null. */
export function elementValueText(el: TwoTerminalElement): string | null {
  const v = el.value;
  switch (el.type) {
    case 'R':
      return siOrRaw(v, 'Ω');
    case 'C':
      return siOrRaw(v, 'F');
    case 'L':
      return siOrRaw(v, 'H');
    case 'V':
      return sourceText(v, 'V');
    case 'I':
      return sourceText(v, 'A');
    case 'Z': {
      if (v && typeof v === 'object' && 're' in v) {
        const o = v as { re?: unknown; im?: unknown };
        const re = toNum(o.re ?? 0) ?? 0;
        const im = toNum(o.im ?? 0) ?? 0;
        if (!im) return formatSI(re, 'Ω');
        const j = `j${num(Math.abs(im))}`;
        return re ? `${num(re)}${im < 0 ? '−' : '+'}${j} Ω` : `${im < 0 ? '−' : ''}${j} Ω`;
      }
      return siOrRaw(v, 'Ω');
    }
    case 'NR':
      return lawText(el.law);
    case 'VCVS':
    case 'VCCS':
    case 'CCVS':
    case 'CCCS': {
      const g = toNum(v);
      const sym = ctrlSymbol(el.ctrl);
      return g === null ? sym : g === 1 ? sym : g === -1 ? `−${sym}` : `${num(g)}${sym}`;
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------- symbol sizes

/** body length along the element and half-width across it, px */
function bodySize(el: TwoTerminalElement): { B: number; hw: number } {
  switch (el.type) {
    case 'R':
      return { B: 48, hw: 9 };
    case 'NR':
      return el.law && 'diode' in el.law ? { B: 20, hw: 11 } : { B: 48, hw: 14 };
    case 'Z':
      return { B: 48, hw: 10 };
    case 'C':
      return { B: 10, hw: 14 };
    case 'L':
      return { B: 48, hw: 8 };
    case 'V':
    case 'I':
      return { B: 34, hw: 17 };
    case 'VCVS':
    case 'VCCS':
    case 'CCVS':
    case 'CCCS':
      return { B: 36, hw: 15 };
    case 'SW':
      return { B: 36, hw: 16 };
    default:
      return { B: 28, hw: 14 };
  }
}

const isAC = (v: unknown) => !!v && typeof v === 'object' && ('ac' in (v as object) || 'sin' in (v as object));

/** text under a transmission line: "Z_c = 50 Ω  l = 30 m" (lossless) or "l = 300 km" (RLGC) */
export function lineValueText(el: LineElement): string | null {
  if (el.label) return el.label;
  if (el.hideValue || !el.line || typeof el.line !== 'object') return null;
  const len = toNum(el.line.length);
  const l = len === null ? String(el.line.length) : len >= 1000 ? `${num(len / 1000)} km` : `${num(len)} m`;
  const z = el.line.zc !== undefined ? siOrRaw(el.line.zc, 'Ω') : null;
  return [z && `Z_c = ${z}`, l && `l = ${l}`].filter(Boolean).join('　') || null;
}

/** Uniform transmission line: two parallel conductors from terminals 1–1′ (start, x = 0) to 2–2′
 *  (end), faint shunt ticks for the distributed capacitance, the x axis (→) and x′ from the end (←). */
function drawLine(
  el: LineElement,
  [x, y]: V2,
  col: string,
  common: Record<string, unknown>,
  bodies: ReactNode[],
  decor: ReactNode[],
  addText: (runs: Run[], x: number, y: number, anchor: 'start' | 'middle' | 'end', cls: string, fill?: string, size?: number) => Box,
  hl: boolean,
): void {
  const w = lineWidth(el) * U;
  const y2 = y + 2 * U;
  const lead = 0.35 * U;
  const ticks: string[] = [];
  for (let k = 1; k < lineWidth(el); k++) ticks.push(`M${x + k * U},${y + 5}V${y2 - 5}`);
  bodies.push(
    <g key={`tl${el.ref}`}>
      <path d={`M${x},${y}H${x + w}M${x},${y2}H${x + w}`} {...common} />
      <path d={`M${x + lead},${y}H${x + w - lead}M${x + lead},${y2}H${x + w - lead}`} {...common} strokeWidth={SW * 2.4} strokeLinecap="butt" />
      <path d={ticks.join('')} stroke={col} strokeWidth={1} strokeDasharray="2 3" opacity={0.45} fill="none" />
    </g>,
  );
  // x axis under the line: x from the start (→), x′ from the end (←)
  const ya = y2 + 16;
  const ax0 = x + 0.2 * U;
  const ax1 = x + 1.5 * U;
  const bx0 = x + w - 0.2 * U;
  const bx1 = x + w - 1.5 * U;
  decor.push(
    <g key={`tlx${el.ref}`} stroke={col} strokeWidth={1.1} fill="none">
      <path d={`M${ax0},${ya}H${ax1 - 6}M${ax0},${ya - 4}V${ya + 4}`} />
      <path d={`M${bx0},${ya}H${bx1 + 6}M${bx0},${ya - 4}V${ya + 4}`} />
      <polygon points={arrowHead([ax1, ya], [1, 0], 8, 3.5)} fill={col} stroke="none" />
      <polygon points={arrowHead([bx1, ya], [-1, 0], 8, 3.5)} fill={col} stroke="none" />
    </g>,
  );
  addText([{ t: 'x', it: true }], ax1 + 9, ya + 4, 'start', 'ps-val', hl ? col : undefined);
  addText([{ t: 'x', it: true }, { t: '′' }], bx1 - 9, ya + 4, 'end', 'ps-val', hl ? col : undefined);
  const v = lineValueText(el);
  if (v) addText(richRuns(v), x + w / 2, y - 9, 'middle', 'ps-val', hl ? col : undefined);
}

function arrowHead(tip: V2, dir: V2, len = 9, half = 4): string {
  const [dx, dy] = dir;
  const bx = tip[0] - dx * len;
  const by = tip[1] - dy * len;
  return `${tip[0]},${tip[1]} ${bx - dy * half},${by + dx * half} ${bx + dy * half},${by - dx * half}`;
}

// ---------------------------------------------------------------- layout

const DIRS: Record<string, V2> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

interface Geo {
  el: TwoTerminalElement;
  a: V2;
  b: V2;
  d: V2; // unit p→n
  nrm: V2; // local +y in global coords
  mid: V2;
  len: number;
  B: number;
  hw: number;
  angle: number;
  vertical: boolean;
}

function geoOf(el: TwoTerminalElement): Geo | null {
  const [x1, y1] = el.from;
  const [x2, y2] = el.to;
  if (x1 !== x2 && y1 !== y2) return null;
  const a: V2 = [x1 * U, y1 * U];
  const b: V2 = [x2 * U, y2 * U];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (len === 0) return null;
  const d: V2 = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const { B, hw } = bodySize(el);
  return {
    el,
    a,
    b,
    d,
    nrm: [-d[1], d[0]],
    mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
    len,
    B: Math.min(B, len - 8),
    hw,
    angle: (Math.atan2(d[1], d[0]) * 180) / Math.PI,
    vertical: x1 === x2,
  };
}

const T = (g: Geo, lx: number, ly: number): V2 => [g.mid[0] + g.d[0] * lx + g.nrm[0] * ly, g.mid[1] + g.d[1] * lx + g.nrm[1] * ly];

const boxHits = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
const segBox = (p: V2, q: V2, pad = 3): Box => ({
  x0: Math.min(p[0], q[0]) - pad,
  y0: Math.min(p[1], q[1]) - pad,
  x1: Math.max(p[0], q[0]) + pad,
  y1: Math.max(p[1], q[1]) + pad,
});

interface Props {
  schematic: Schematic;
  /** element refs drawn in the accent colour */
  highlight?: string[];
  className?: string;
}

export function ProblemSchematic({ schematic, highlight, className }: Props) {
  const lang = getLang();
  const hlKey = (highlight ?? []).join('|');
  const out = useMemo(() => drawSchematic(schematic, new Set(highlight ?? [])), [schematic, hlKey, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <FigureFrame label={tr('电路图', 'Circuit diagram')} className={`ps-wrap ${className ?? ''}`}>
      <svg
        className="ps-svg"
        viewBox={`${out.box.x0} ${out.box.y0} ${out.box.x1 - out.box.x0} ${out.box.y1 - out.box.y0}`}
        style={{ maxWidth: Math.round((out.box.x1 - out.box.x0) * 1.1) }}
        role="img"
        aria-label={tr('电路图', 'Circuit diagram')}
      >
        {out.body}
      </svg>
    </FigureFrame>
  );
}

function drawSchematic(s: Schematic, hl: Set<string>): { body: ReactNode; box: Box } {
  const zh = getLang() === 'zh';
  const elements: ProblemElement[] = Array.isArray(s.elements) ? s.elements : [];
  const segs = wireSegments(s);
  const px = (p: Pt): V2 => [p[0] * U, p[1] * U];

  // ---- bounding box
  const bb: Box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const ext = (b: Box) => {
    bb.x0 = Math.min(bb.x0, b.x0);
    bb.y0 = Math.min(bb.y0, b.y0);
    bb.x1 = Math.max(bb.x1, b.x1);
    bb.y1 = Math.max(bb.y1, b.y1);
  };

  // ---- obstacles for label placement
  const obstacles: Box[] = [];
  for (const [p, q] of segs) obstacles.push(segBox(px(p), px(q)));
  const geos: Geo[] = [];
  for (const el of elements) {
    if (isTwoTerminal(el)) {
      const g = geoOf(el);
      if (!g) continue;
      geos.push(g);
      obstacles.push(segBox(g.a, g.b, 3));
      obstacles.push(segBox(T(g, -g.B / 2, -g.hw), T(g, g.B / 2, g.hw), 1));
    } else if (el.type === 'OPAMP' || el.type === 'XFMR') {
      const [x, y] = px(el.at);
      obstacles.push({ x0: x - 2 * U, y0: y - 1.45 * U, x1: x + 2 * U, y1: y + 1.45 * U });
    } else if (el.type === 'TL' && Array.isArray(el.at)) {
      const [x, y] = px(el.at);
      obstacles.push({ x0: x, y0: y - 4, x1: x + lineWidth(el) * U, y1: y + 2 * U + 30 });
    }
  }
  // keep element labels out of the gap between magnetically coupled inductors
  for (const el of elements) {
    if (el.type !== 'K') continue;
    const g1 = geos.find((q) => q.el.ref === el.l1);
    const g2 = geos.find((q) => q.el.ref === el.l2);
    if (g1 && g2) obstacles.push(segBox(g1.mid, g2.mid, 14));
  }
  // mesh / loop current arrows: reserve their circles so element labels go elsewhere
  const loops = (Array.isArray(s.loops) ? s.loops : []).filter((l) => Array.isArray(l?.at) && Number.isFinite(l.at[0]) && Number.isFinite(l.at[1]));
  for (const l of loops) {
    const [x, y] = px(l.at);
    obstacles.push({ x0: x - LOOP_R - 3, y0: y - LOOP_R - 3, x1: x + LOOP_R + 3, y1: y + LOOP_R + 3 });
  }
  for (const w of s.wires ?? []) for (const p of w) if (Array.isArray(p)) ext(segBox(px(p), px(p), 0));
  for (const el of elements) for (const q of Object.values(terminalPoints(el))) if (Array.isArray(q)) ext(segBox(px(q), px(q), 0));
  const gridBox = { ...bb }; // extent of the grid geometry only (for "on the outline" tests)
  for (const o of obstacles) ext(o);
  const hits = (b: Box) => obstacles.reduce((n, o) => n + (boxHits(b, o) ? 1 : 0), 0);

  /** free directions at a grid point (no wire / element leaving that way) */
  const blocked = (p: Pt): Set<string> => {
    const out = new Set<string>();
    const mark = (dx: number, dy: number) => {
      for (const [k, v] of Object.entries(DIRS)) if (v[0] === Math.sign(dx) && v[1] === Math.sign(dy)) out.add(k);
    };
    for (const [a, b] of segs) {
      if (!onSegment(p, a, b)) continue;
      for (const q of [a, b]) if (q[0] !== p[0] || q[1] !== p[1]) mark(q[0] - p[0], q[1] - p[1]);
    }
    for (const el of elements) {
      if (isTwoTerminal(el)) {
        if (el.from[0] === p[0] && el.from[1] === p[1]) mark(el.to[0] - p[0], el.to[1] - p[1]);
        if (el.to[0] === p[0] && el.to[1] === p[1]) mark(el.from[0] - p[0], el.from[1] - p[1]);
      } else if (el.type === 'OPAMP' || el.type === 'XFMR') {
        for (const q of Object.values(terminalPoints(el))) if (q[0] === p[0] && q[1] === p[1]) mark(el.at[0] - p[0], 0);
      } else if (el.type === 'TL' && Array.isArray(el.at)) {
        const mid = el.at[0] + lineWidth(el) / 2;
        for (const q of Object.values(terminalPoints(el))) if (q[0] === p[0] && q[1] === p[1]) mark(mid - p[0], 0);
      }
    }
    return out;
  };

  const wiresOut: ReactNode[] = [];
  const bodies: ReactNode[] = [];
  const texts: ReactNode[] = [];
  const decor: ReactNode[] = [];
  const addText = (runs: Run[], x: number, y: number, anchor: 'start' | 'middle' | 'end', cls: string, fill?: string, size = FS) => {
    const w = textWidth(runs, size);
    const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
    const b = { x0, y0: y - size * 0.8, x1: x0 + w, y1: y + size * 0.3 };
    ext(b);
    obstacles.push(b);
    texts.push(<Rich key={`t${texts.length}`} runs={runs} x={x} y={y} anchor={anchor} className={cls} fill={fill} />);
    return b;
  };

  // ---- wires
  {
    const d = (s.wires ?? [])
      .filter((w) => Array.isArray(w) && w.length >= 2)
      .map((w) => 'M' + w.map((p) => `${p[0] * U},${p[1] * U}`).join('L'))
      .join(' ');
    wiresOut.push(<path key="w" d={d} className="ps-line" fill="none" strokeWidth={SW} />);
  }

  // ---- two-terminal elements
  const markSideOf = new Map<string, V2>();
  for (const g of geos) {
    const el = g.el;
    const isHl = hl.has(el.ref);
    const col = isHl ? 'var(--accent)' : 'var(--ink)';
    const valueStr = el.hideValue ? null : elementValueText(el);
    const refRuns = richRuns(symbolText(el.ref));
    let lines: Run[][];
    if (el.label) lines = [richRuns(el.label)];
    else if (g.vertical) lines = valueStr ? [refRuns, richRuns(valueStr)] : [refRuns];
    else lines = valueStr ? [[...refRuns, { t: '  ' }, ...richRuns(valueStr)]] : [refRuns];
    if (el.type === 'SW') lines = [...lines, [{ t: 't', it: true }, { t: '=0' }]];
    if (!g.vertical && lines.length > 1) lines = [lines.flatMap((l, i) => (i ? [{ t: '  ' }, ...l] : l))];

    // choose label side
    const widths = lines.map((l) => textWidth(l));
    const W = Math.max(...widths);
    const LH = 15;
    const H = lines.length * LH;
    const cand: { side: V2; box: Box; score: number }[] = [];
    const sides: V2[] = g.vertical ? [DIRS.right, DIRS.left] : [DIRS.up, DIRS.down];
    for (const side of sides) {
      const off = (el.type === 'SW' ? 26 : g.hw) + 6;
      let box: Box;
      if (g.vertical) {
        const x = g.mid[0] + side[0] * off;
        box = { x0: side[0] > 0 ? x : x - W, x1: side[0] > 0 ? x + W : x, y0: g.mid[1] - H / 2, y1: g.mid[1] + H / 2 };
      } else {
        const y = g.mid[1] + side[1] * off;
        box = { x0: g.mid[0] - W / 2, x1: g.mid[0] + W / 2, y0: side[1] > 0 ? y : y - H, y1: side[1] > 0 ? y + H : y };
      }
      let score = hits(box) * 10;
      // on the outline of the drawing, prefer the outside
      const onEdge = g.vertical
        ? (g.a[0] <= gridBox.x0 + 1 && side[0] < 0) || (g.a[0] >= gridBox.x1 - 1 && side[0] > 0)
        : (g.a[1] <= gridBox.y0 + 1 && side[1] < 0) || (g.a[1] >= gridBox.y1 - 1 && side[1] > 0);
      if (!onEdge && side !== sides[0]) score += 1;
      if (onEdge) score -= 2;
      cand.push({ side, box, score });
    }
    cand.sort((p, q) => p.score - q.score);
    const side = cand[0].side;
    const ls = Math.sign(side[0] * g.nrm[0] + side[1] * g.nrm[1]) || 1; // label side in local y
    markSideOf.set(el.ref, [-side[0], -side[1]]);

    // label text
    const off = (el.type === 'SW' ? 26 : g.hw) + 6;
    lines.forEach((l, i) => {
      if (g.vertical) {
        const x = g.mid[0] + side[0] * off;
        const y = g.mid[1] - H / 2 + i * LH + 11;
        addText(l, x, y, side[0] > 0 ? 'start' : 'end', i === 0 && !el.label ? 'ps-ref' : 'ps-val', isHl ? 'var(--accent)' : undefined);
      } else {
        const y = side[1] < 0 ? g.mid[1] - off - (lines.length - 1 - i) * LH - 2 : g.mid[1] + off + i * LH + 10;
        addText(l, g.mid[0], y, 'middle', 'ps-ref', isHl ? 'var(--accent)' : undefined);
      }
    });

    // leads
    const pa = T(g, -g.B / 2, 0);
    const pb = T(g, g.B / 2, 0);
    wiresOut.push(<path key={`l${el.ref}`} d={`M${g.a[0]},${g.a[1]}L${pa[0]},${pa[1]}M${pb[0]},${pb[1]}L${g.b[0]},${g.b[1]}`} stroke={col} strokeWidth={SW} fill="none" />);

    // symbol body in local coords
    const h = g.B / 2;
    const common = { stroke: col, strokeWidth: SW, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
    const upright: ReactNode[] = [];
    const sym = (t: string, lx: number, ly: number, size = 13, cls = 'ps-sym') => {
      const [x, y] = T(g, lx, ly);
      upright.push(
        <text key={upright.length} x={x} y={y + size * 0.35} textAnchor="middle" fontSize={size} className={cls} fill={col}>
          {t}
        </text>,
      );
    };
    let body: ReactNode = null;
    switch (el.type) {
      case 'R':
        body = zh ? (
          <rect x={-h} y={-8} width={2 * h} height={16} {...common} fill="var(--paper)" />
        ) : (
          <polyline
            points={[-h, ...[0, 1, 2, 3, 4, 5].map((i) => -h + (2 * h * (2 * i + 1)) / 12), h]
              .map((x, i, arr) => `${x},${i === 0 || i === arr.length - 1 ? 0 : i % 2 ? -8 : 8}`)
              .join(' ')}
            {...common}
          />
        );
        break;
      case 'NR':
        // nonlinear resistor: the resistor box crossed by an oblique stroke with a short foot
        // (textbook symbol); the ideal-diode models use the diode symbol, anode at p
        body =
          el.law && 'diode' in el.law ? (
            <g {...common}>
              <polygon points={`${-h},-10 ${-h},10 ${h},0`} fill="var(--paper)" />
              <line x1={h} y1={-10} x2={h} y2={10} />
            </g>
          ) : (
            <g {...common}>
              <rect x={-h} y={-8} width={2 * h} height={16} fill="var(--paper)" />
              <polyline points={`${-h - 6},13 ${-h + 4},13 ${h - 4},-13`} />
            </g>
          );
        break;
      case 'Z':
        body = <rect x={-h} y={-9} width={2 * h} height={18} {...common} fill="var(--paper)" />;
        sym('Z', 0, 0, 12, 'ps-sym ps-it');
        break;
      case 'C':
        body = (
          <g {...common}>
            <line x1={-h} y1={-14} x2={-h} y2={14} />
            <line x1={h} y1={-14} x2={h} y2={14} />
          </g>
        );
        break;
      case 'L': {
        const n = 4;
        const r = h / n;
        const sweep = ls < 0 ? 1 : 0;
        let d = `M${-h},0`;
        for (let i = 0; i < n; i++) d += ` a${r},${r} 0 0 ${sweep} ${2 * r},0`;
        body = <path d={d} {...common} />;
        break;
      }
      case 'V':
        body = <circle r={h} {...common} fill="var(--paper)" />;
        if (isAC(el.value)) {
          const [cx, cy] = g.mid;
          upright.push(<path key="ac" d={`M${cx - 9},${cy} q4.5,-9 9,0 t9,0`} {...common} />);
          sym('+', -h - 6, -ls * 11);
          sym('−', h + 6, -ls * 11);
        } else {
          sym('+', -h + 8, 0);
          sym('−', h - 8, 0);
        }
        break;
      case 'I':
        body = (
          <g>
            <circle r={h} {...common} fill="var(--paper)" />
            <line x1={-h + 7} y1={0} x2={h - 12} y2={0} {...common} />
            <polygon points={arrowHead([h - 6, 0], [1, 0], 8, 4)} fill={col} />
          </g>
        );
        break;
      case 'VCVS':
      case 'CCVS':
      case 'VCCS':
      case 'CCCS': {
        const k = g.hw;
        body = <polygon points={`${-h},0 0,${-k} ${h},0 0,${k}`} {...common} fill="var(--paper)" />;
        if (el.type === 'VCVS' || el.type === 'CCVS') {
          sym('+', -h + 9, 0, 12);
          sym('−', h - 9, 0, 12);
        } else {
          body = (
            <g>
              {body}
              <line x1={-h + 8} y1={0} x2={h - 12} y2={0} {...common} />
              <polygon points={arrowHead([h - 7, 0], [1, 0], 7, 3.5)} fill={col} />
            </g>
          );
        }
        break;
      }
      case 'SW': {
        const before = el.state?.before ?? 'open';
        const after = el.state?.after ?? (before === 'open' ? 'closed' : 'open');
        const piv = -h + 2;
        const R = h * 2 - 4;
        // the lever and the curved arrow sit on the label side (local y = ls)
        const ang = (deg: number, r = R): V2 => [piv + r * Math.cos((deg * Math.PI) / 180), ls * r * Math.sin((deg * Math.PI) / 180)];
        const lever = before === 'closed' ? ang(3) : ang(30);
        const from = before === 'closed' ? 12 : 40;
        const to = after === 'closed' ? 12 : 40;
        const ra = R + 6;
        const arc: V2[] = [];
        for (let i = 0; i <= 12; i++) arc.push(ang(from + ((to - from) * i) / 12, ra));
        const p1 = arc[arc.length - 1];
        const q = arc[arc.length - 2];
        const tl = Math.hypot(p1[0] - q[0], p1[1] - q[1]) || 1;
        const tdir: V2 = [(p1[0] - q[0]) / tl, (p1[1] - q[1]) / tl];
        body = (
          <g>
            <line x1={-h} y1={0} x2={piv} y2={0} {...common} />
            <line x1={h - 2} y1={0} x2={h} y2={0} {...common} />
            <line x1={piv} y1={0} x2={lever[0]} y2={lever[1]} {...common} />
            <circle cx={piv} cy={0} r={2.4} {...common} fill="var(--paper)" />
            <circle cx={h - 2} cy={0} r={2.4} {...common} fill="var(--paper)" />
            {from !== to && (
              <g>
                <polyline points={arc.map((v) => v.join(',')).join(' ')} {...common} strokeWidth={1.1} />
                <polygon points={arrowHead([p1[0] + tdir[0] * 2, p1[1] + tdir[1] * 2], tdir, 6, 2.8)} fill={col} />
              </g>
            )}
          </g>
        );
        break;
      }
      case 'ammeter':
      case 'voltmeter':
        body = <circle r={h} {...common} fill="var(--paper)" />;
        sym(el.type === 'ammeter' ? 'A' : 'V', 0, 0, 14, 'ps-sym ps-meter');
        break;
    }
    bodies.push(
      <g key={`b${el.ref}`}>
        <g transform={`translate(${g.mid[0]},${g.mid[1]}) rotate(${g.angle})`}>{body}</g>
        {upright}
      </g>,
    );
  }

  // ---- marks (reference directions)
  for (const m of s.marks ?? []) {
    const g = geos.find((q) => q.el.ref === m.el);
    if (!g) continue;
    const col = hl.has(g.el.ref) ? 'var(--accent)' : 'var(--ink)';
    const ms = markSideOf.get(g.el.ref)!;
    const msl = Math.sign(ms[0] * g.nrm[0] + ms[1] * g.nrm[1]) || 1;
    const name = m.name ?? (m.kind === 'i' ? `i_{${g.el.ref}}` : `${zh ? 'u' : 'v'}_{${g.el.ref}}`);
    const runs = richRuns(symbolText(name));
    if (m.kind === 'i') {
      const leadLen = g.len / 2 - g.B / 2;
      const c = T(g, -g.B / 2 - leadLen / 2, 0);
      const tip: V2 = [c[0] + g.d[0] * 4.5, c[1] + g.d[1] * 4.5];
      decor.push(<polygon key={`mi${g.el.ref}`} points={arrowHead(tip, g.d, 9, 4)} fill={col} />);
      const t = T(g, -g.B / 2 - leadLen / 2, msl * 12);
      if (g.vertical) addText(runs, t[0] + (ms[0] > 0 ? 0 : 0), t[1] + 4, ms[0] > 0 ? 'start' : 'end', 'ps-mark', col);
      else addText(runs, t[0], ms[1] < 0 ? t[1] - 1 : t[1] + 10, 'middle', 'ps-mark', col);
    } else {
      const w = textWidth(runs);
      const off = g.hw + 10;
      if (g.vertical) {
        const e = Math.max(g.B / 2, 14);
        const x = g.mid[0] + ms[0] * off;
        const anchor = ms[0] > 0 ? 'start' : 'end';
        const pPos = T(g, -e, 0);
        const nPos = T(g, e, 0);
        addText([{ t: '+' }], x + ms[0] * 3, pPos[1] + 5, anchor, 'ps-pm', col, 14);
        addText([{ t: '−' }], x + ms[0] * 3, nPos[1] + 5, anchor, 'ps-pm', col, 14);
        addText(runs, x, g.mid[1] + 4, anchor, 'ps-mark', col);
      } else {
        const e = Math.max(g.B / 2, w / 2 + 10);
        const y = g.mid[1] + ms[1] * off + (ms[1] > 0 ? 10 : -1);
        const pPos = T(g, -e, 0);
        const nPos = T(g, e, 0);
        addText([{ t: '+' }], pPos[0], y + 1, 'middle', 'ps-pm', col, 14);
        addText([{ t: '−' }], nPos[0], y + 1, 'middle', 'ps-pm', col, 14);
        addText(runs, g.mid[0], y, 'middle', 'ps-mark', col);
      }
    }
  }

  // ---- op-amps, transformers, couplings
  for (const el of elements) {
    const col = hl.has(el.ref) ? 'var(--accent)' : 'var(--ink)';
    const common = { stroke: col, strokeWidth: SW, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
    if (el.type === 'OPAMP') {
      if (!Array.isArray(el.at)) continue;
      const [x, y] = px(el.at);
      const sx = el.orient === 'left' ? -1 : 1;
      const tp = terminalPoints(el);
      const back = x - sx * 1.2 * U;
      const apex = x + sx * 1.2 * U;
      const mi = px(tp.minus);
      const pl = px(tp.plus);
      const o = px(tp.out);
      bodies.push(
        <g key={`op${el.ref}`}>
          <path d={`M${mi[0]},${mi[1]}H${back}M${pl[0]},${pl[1]}H${back}M${apex},${y}H${o[0]}`} {...common} />
          <polygon points={`${back},${y - 1.45 * U} ${apex},${y} ${back},${y + 1.45 * U}`} {...common} fill="var(--paper)" />
          <text x={back + sx * 9} y={mi[1] + 5} textAnchor="middle" fontSize={16} className="ps-sym" fill={col}>
            −
          </text>
          <text x={back + sx * 9} y={pl[1] + 5} textAnchor="middle" fontSize={15} className="ps-sym" fill={col}>
            +
          </text>
          {zh && (
            <text x={x - sx * 0.3 * U} y={y + 5} textAnchor="middle" fontSize={14} className="ps-sym" fill={col}>
              ∞
            </text>
          )}
          {zh && (
            <text x={x + sx * 0.45 * U} y={y - 4} textAnchor="middle" fontSize={9} className="ps-sym" fill={col}>
              ▷
            </text>
          )}
        </g>,
      );
      addText(richRuns(symbolText(el.ref)), x + sx * 0.35 * U, y - 0.75 * U, sx > 0 ? 'start' : 'end', 'ps-ref', hl.has(el.ref) ? col : undefined);
      // output-current mark: {kind:'i', el:<opamp>} is the current flowing OUT of the output
      // terminal, so the arrow sits on the output lead and points away from the op-amp
      const om = (s.marks ?? []).find((m) => m?.el === el.ref && m.kind === 'i');
      if (om) {
        const cx = apex + (o[0] - apex) * 0.6;
        const dir: V2 = [sx, 0];
        decor.push(<polygon key={`mo${el.ref}`} points={arrowHead([cx + sx * 4.5, y], dir, 9, 4)} fill={col} />);
        const runs = richRuns(symbolText(om.name ?? `i_{${el.ref}}`));
        const w = textWidth(runs);
        const above = { x0: cx - w / 2, x1: cx + w / 2, y0: y - 8 - FS * 0.8, y1: y - 8 + FS * 0.3 };
        const below = { x0: cx - w / 2, x1: cx + w / 2, y0: y + 19 - FS * 0.8, y1: y + 19 + FS * 0.3 };
        const up = hits(above) <= hits(below);
        addText(runs, cx, up ? y - 8 : y + 19, 'middle', 'ps-mark', col);
      }
    } else if (el.type === 'XFMR') {
      if (!Array.isArray(el.at)) continue;
      const [x, y] = px(el.at);
      const cxL = x - 0.5 * U;
      const cxR = x + 0.5 * U;
      const r = U / 4; // 4 humps over 2 units
      let dl = `M${x - 2 * U},${y - U}H${cxL}`;
      for (let i = 0; i < 4; i++) dl += ` a${r},${r} 0 0 1 0,${2 * r}`;
      dl += `H${x - 2 * U}`;
      let dr = `M${x + 2 * U},${y - U}H${cxR}`;
      for (let i = 0; i < 4; i++) dr += ` a${r},${r} 0 0 0 0,${2 * r}`;
      dr += `H${x + 2 * U}`;
      bodies.push(
        <g key={`xf${el.ref}`}>
          <path d={dl} {...common} />
          <path d={dr} {...common} />
          <line x1={x - 3} y1={y - U} x2={x - 3} y2={y + U} {...common} strokeWidth={1.2} />
          <line x1={x + 3} y1={y - U} x2={x + 3} y2={y + U} {...common} strokeWidth={1.2} />
          <circle cx={cxL - 9} cy={y - 0.62 * U} r={3.2} fill={col} />
          <circle cx={cxR + 9} cy={y - 0.62 * U} r={3.2} fill={col} />
        </g>,
      );
      addText(richRuns(symbolText(el.ref)), x, y - U - 11, 'middle', 'ps-ref', hl.has(el.ref) ? col : undefined);
      addText([{ t: `${typeof el.n === 'number' ? num(el.n) : '?'}:1` }], x, y + U + 17, 'middle', 'ps-val', hl.has(el.ref) ? col : undefined);
    } else if (el.type === 'TL') {
      if (!Array.isArray(el.at)) continue;
      drawLine(el, px(el.at), col, common, bodies, decor, addText, hl.has(el.ref));
    } else if (el.type === 'K') {
      const g1 = geos.find((q) => q.el.ref === el.l1);
      const g2 = geos.find((q) => q.el.ref === el.l2);
      if (!g1 || !g2) continue;
      // dots at each inductor's p end, on the side away from its label
      for (const g of [g1, g2]) {
        const ms = markSideOf.get(g.el.ref)!;
        const msl = Math.sign(ms[0] * g.nrm[0] + ms[1] * g.nrm[1]) || 1;
        const p = T(g, -g.B / 2 + 3, msl * 9);
        decor.push(<circle key={`kd${el.ref}${g.el.ref}`} cx={p[0]} cy={p[1]} r={3.2} fill={col} />);
      }
      // double-headed arc between the coils with the M / k label
      const c1 = g1.mid;
      const c2 = g2.mid;
      const dx = c2[0] - c1[0];
      const dy = c2[1] - c1[1];
      const dist = Math.hypot(dx, dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;
      const s1: V2 = [c1[0] + ux * (g1.hw + 6), c1[1] + uy * (g1.hw + 6)];
      const s2: V2 = [c2[0] - ux * (g2.hw + 6), c2[1] - uy * (g2.hw + 6)];
      const bulge = Math.min(18, dist * 0.2);
      const ctrl: V2 = [(s1[0] + s2[0]) / 2 + uy * bulge, (s1[1] + s2[1]) / 2 - ux * bulge];
      const dirAt = (from: V2, to: V2): V2 => {
        const l = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
        return [(to[0] - from[0]) / l, (to[1] - from[1]) / l];
      };
      decor.push(
        <g key={`k${el.ref}`}>
          <path d={`M${s1[0]},${s1[1]} Q${ctrl[0]},${ctrl[1]} ${s2[0]},${s2[1]}`} stroke={col} strokeWidth={1.1} fill="none" />
          <polygon points={arrowHead(s1, dirAt(ctrl, s1), 7, 3)} fill={col} />
          <polygon points={arrowHead(s2, dirAt(ctrl, s2), 7, 3)} fill={col} />
        </g>,
      );
      const top: V2 = [(s1[0] + 2 * ctrl[0] + s2[0]) / 4, (s1[1] + 2 * ctrl[1] + s2[1]) / 4];
      const mv = el.M !== undefined ? toNum(el.M) : null;
      const txt = el.M !== undefined ? `M = ${mv !== null ? formatSI(mv, 'H') : el.M}` : `k = ${num(el.k ?? 0)}`;
      const runs: Run[] = [{ t: txt[0], it: true }, { t: txt.slice(1) }];
      const w = textWidth(runs);
      // candidates: over the arc, beyond the p ends of the coils, beyond their n ends
      const pEnd = (g: Geo) => T(g, -g.len / 2, 0);
      const nEnd = (g: Geo) => T(g, g.len / 2, 0);
      const avg = (p: V2, q: V2): V2 => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      const pm = avg(pEnd(g1), pEnd(g2));
      const nm = avg(nEnd(g1), nEnd(g2));
      const cands: V2[] = [
        [top[0], top[1] - 6],
        [pm[0] + (pm[0] - nm[0]) * 0.001, pm[1] + Math.sign(pm[1] - nm[1] || -1) * 12 + 4],
        [nm[0], nm[1] + Math.sign(nm[1] - pm[1] || 1) * 12 + 4],
      ];
      const scored = cands.map((c, i) => ({ c, n: hits({ x0: c[0] - w / 2, x1: c[0] + w / 2, y0: c[1] - 11, y1: c[1] + 3 }) * 10 + i }));
      scored.sort((p, q) => p.n - q.n);
      const at = scored[0].c;
      addText(runs, at[0], at[1], 'middle', 'ps-val', hl.has(el.ref) ? col : undefined);
    }
  }

  // ---- junction dots
  for (const p of junctionPoints(s)) {
    const [x, y] = px(p);
    decor.push(<circle key={`j${x},${y}`} cx={x} cy={y} r={3.4} fill="var(--ink)" />);
  }

  // ---- mesh / loop currents: an open circular arc (300°) with an arrowhead, name in the middle.
  // Angles are screen angles (y down), so increasing θ turns clockwise as seen on screen.
  loops.forEach((l, i) => {
    const [cx, cy] = px(l.at);
    const cw = l.dir !== 'ccw';
    const sg = cw ? 1 : -1;
    const deg = Math.PI / 180;
    const pt = (th: number): V2 => [cx + LOOP_R * Math.cos(th), cy + LOOP_R * Math.sin(th)];
    // the 60° gap is centred at the top; the arrowhead ends at the gap's far side
    const th0 = -90 * deg + sg * 30 * deg;
    const th1 = th0 + sg * 300 * deg;
    const head = 10;
    const thArc = th1 - sg * (head / LOOP_R); // stop the line where the arrowhead starts
    const a = pt(th0);
    const b = pt(thArc);
    const tip = pt(th1);
    const tl = Math.hypot(tip[0] - b[0], tip[1] - b[1]) || 1;
    const dir: V2 = [(tip[0] - b[0]) / tl, (tip[1] - b[1]) / tl];
    decor.push(
      <g key={`lp${i}`} className="ps-loop">
        <path d={`M${a[0]},${a[1]} A${LOOP_R},${LOOP_R} 0 1 ${cw ? 1 : 0} ${b[0]},${b[1]}`} fill="none" stroke="var(--muted)" strokeWidth={1.4} strokeLinecap="round" />
        <polygon points={arrowHead(tip, dir, head, 4.5)} fill="var(--muted)" />
      </g>,
    );
    ext({ x0: cx - LOOP_R - 4, y0: cy - LOOP_R - 4, x1: cx + LOOP_R + 4, y1: cy + LOOP_R + 4 });
    if (typeof l.name === 'string' && l.name) {
      const runs = richRuns(symbolText(l.name));
      texts.push(<Rich key={`lt${i}`} runs={runs} x={cx} y={cy + 4.5} anchor="middle" className="ps-loop-name" />);
    }
  });

  // ---- grounds
  (s.grounds ?? []).forEach((p, i) => {
    if (!Array.isArray(p)) return;
    const bl = blocked(p);
    const dir = ['down', 'left', 'right', 'up'].find((d) => !bl.has(d)) ?? 'down';
    const rot = { down: 0, left: 90, up: 180, right: 270 }[dir as 'down'];
    const [x, y] = px(p);
    decor.push(
      <g key={`g${i}`} transform={`translate(${x},${y}) rotate(${rot})`} stroke="var(--ink)" strokeWidth={SW} strokeLinecap="round">
        <line x1={0} y1={0} x2={0} y2={13} />
        <line x1={-12} y1={13} x2={12} y2={13} />
        <line x1={-7.5} y1={18} x2={7.5} y2={18} />
        <line x1={-3} y1={23} x2={3} y2={23} />
      </g>,
    );
    const v = DIRS[dir];
    ext({ x0: x + v[0] * 25 - 13, x1: x + v[0] * 25 + 13, y0: y + v[1] * 25 - 13, y1: y + v[1] * 25 + 13 });
    obstacles.push(segBox([x, y], [x + v[0] * 24, y + v[1] * 24], 12));
  });

  // ---- open terminals
  for (const [i, t] of (s.terminals ?? []).entries()) {
    if (!Array.isArray(t?.at)) continue;
    const [x, y] = px(t.at);
    const bl = blocked(t.at);
    // put the name on the outside: opposite a blocked direction, else the first free one
    const opp: Record<string, string> = { left: 'right', right: 'left', up: 'down', down: 'up' };
    const pref = ['left', 'right', 'up', 'down'].filter((d) => bl.has(opp[d]) && !bl.has(d));
    const dir = pref[0] ?? ['left', 'right', 'up', 'down'].find((d) => !bl.has(d)) ?? 'left';
    decor.push(<circle key={`tm${i}`} cx={x} cy={y} r={4.2} fill="var(--paper)" stroke="var(--ink)" strokeWidth={SW} />);
    const v = DIRS[dir];
    const runs = richRuns(symbolText(t.name));
    if (v[0]) addText(runs, x + v[0] * 10, y + 5, v[0] > 0 ? 'start' : 'end', 'ps-node', undefined, 15);
    else addText(runs, x, v[1] > 0 ? y + 21 : y - 9, 'middle', 'ps-node', undefined, 15);
  }

  // ---- node labels
  const termKeys = new Set((s.terminals ?? []).map((t) => `${t.at?.[0]},${t.at?.[1]}`));
  const juncKeys = new Set(junctionPoints(s).map((p) => `${p[0]},${p[1]}`));
  for (const [i, l] of (s.labels ?? []).entries()) {
    if (l.hidden || !Array.isArray(l.at)) continue;
    const [x, y] = px(l.at);
    const k = `${l.at[0]},${l.at[1]}`;
    if (!termKeys.has(k) && !juncKeys.has(k)) decor.push(<circle key={`ld${i}`} cx={x} cy={y} r={3} fill="var(--ink)" />);
    const runs = richRuns(symbolText(l.name));
    const w = textWidth(runs, 14);
    const opts: { x: number; y: number; anchor: 'start' | 'end' }[] = [
      { x: x + 6, y: y - 7, anchor: 'start' },
      { x: x - 6, y: y - 7, anchor: 'end' },
      { x: x + 6, y: y + 17, anchor: 'start' },
      { x: x - 6, y: y + 17, anchor: 'end' },
    ];
    const best = opts
      .map((o, idx) => {
        const x0 = o.anchor === 'start' ? o.x : o.x - w;
        return { o, n: hits({ x0, x1: x0 + w, y0: o.y - 11, y1: o.y + 3 }) * 10 + idx };
      })
      .sort((a, b) => a.n - b.n)[0].o;
    addText(runs, best.x, best.y, best.anchor, 'ps-node', undefined, 14);
  }

  // ---- notes
  const lang = getLang();
  for (const [i, n] of (s.notes ?? []).entries()) {
    if (!Array.isArray(n?.at)) continue;
    const text = n.i18n?.[lang] ?? n.text ?? '';
    const [x, y] = px(n.at);
    String(text)
      .split('\n')
      .forEach((line, j) => addText(richRuns(line), x, y + 5 + j * 16, 'start', 'ps-note', undefined, 13));
    void i;
  }

  if (!Number.isFinite(bb.x0)) Object.assign(bb, { x0: 0, y0: 0, x1: 4 * U, y1: 2 * U });
  const M = 14;
  const box = { x0: Math.floor(bb.x0 - M), y0: Math.floor(bb.y0 - M), x1: Math.ceil(bb.x1 + M), y1: Math.ceil(bb.y1 + M) };
  return {
    body: (
      <>
        <g className="ps-wires">{wiresOut}</g>
        <g>{bodies}</g>
        <g>{decor}</g>
        <g>{texts}</g>
      </>
    ),
    box,
  };
}
