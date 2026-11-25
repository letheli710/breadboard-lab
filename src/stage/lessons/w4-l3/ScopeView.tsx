// The oscilloscope screen as a live SVG: 10 × 8 divisions, both channels on one 2.5 V/div scale
// (so the rails +7.5 V / −8.9 V and the ±2 V input fit together), CH1 amber (input), CH2 teal
// (output), the LM358's swing limits dashed, and the 50 kHz glitch as a band around a trace.
// Used by the scope layer (full size) and by the scope on the 3D bench (compact).

import type { Trace } from './model';
import { VOH, VOL } from './model';
import { hoverProps } from './state';

const W = 600;
const H = 320;
const VDIV = 2.5;
const DIVS_Y = 8;
const DIVS_X = 10;

const Y = (v: number) => H / 2 - (v / (VDIV * DIVS_Y)) * H;

/** a clean path through the per-column [min, max] pairs, with vertical strokes where a column spans a jump */
function colsPath(cols: [number, number][], upto: number): string {
  const n = cols.length;
  const last = Math.min(n, Math.ceil(upto * n));
  let d = '';
  let prev: number | null = null;
  for (let c = 0; c < last; c++) {
    const x = ((c + 0.5) / n) * W;
    const [lo, hi] = cols[c];
    const pts: number[] = hi - lo < 0.06 ? [(lo + hi) / 2] : prev !== null && Math.abs(prev - hi) < Math.abs(prev - lo) ? [hi, lo] : [lo, hi];
    for (const v of pts) {
      d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${Y(v).toFixed(1)}`;
      prev = v;
    }
  }
  return d;
}

/** a band ±b around the column means, clipped to the output window */
function bandPath(cols: [number, number][], b: number, lim: [number, number], upto = 1): string {
  const n = cols.length;
  const last = Math.min(n, Math.ceil(upto * n));
  if (last < 2) return '';
  const up: string[] = [];
  const dn: string[] = [];
  for (let c = 0; c < last; c++) {
    const x = (((c + 0.5) / n) * W).toFixed(1);
    const hi = Math.min(lim[1], cols[c][1] + b);
    const lo = Math.max(lim[0], cols[c][0] - b);
    up.push(`${x} ${Y(hi).toFixed(1)}`);
    dn.push(`${x} ${Y(lo).toFixed(1)}`);
  }
  return `M${up.join('L')}L${dn.reverse().join('L')}Z`;
}

export interface Mark {
  /** fraction of the window */
  x: number;
  v: number;
  label: string;
}

export function ScopeView({
  tr,
  periods = 2,
  f,
  showIn = true,
  showOut = true,
  outUpto = 1,
  bandIn = 0,
  bandOut = 0,
  marks = [],
  compact = false,
  caption,
}: {
  tr: Trace;
  periods?: number;
  f: number;
  showIn?: boolean;
  showOut?: boolean;
  /** CH2 is drawn up to this fraction of the window (the rest is still hidden) */
  outUpto?: number;
  bandIn?: number;
  bandOut?: number;
  marks?: Mark[];
  compact?: boolean;
  caption?: string;
}) {
  const span = periods / f;
  const msDiv = (span * 1000) / DIVS_X;
  const ticks = Array.from({ length: periods * 2 + 1 }, (_, i) => i / (periods * 2));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`w43-scope ${compact ? 'compact' : ''}`} role="img" aria-label={caption ?? '示波器屏幕'}>
      <rect x={0} y={0} width={W} height={H} className="w43-screen" />
      {Array.from({ length: DIVS_X + 1 }, (_, i) => (
        <line key={`x${i}`} x1={(i / DIVS_X) * W} x2={(i / DIVS_X) * W} y1={0} y2={H} className={`w43-div ${i === DIVS_X / 2 ? 'axis' : ''}`} />
      ))}
      {Array.from({ length: DIVS_Y + 1 }, (_, i) => (
        <line key={`y${i}`} x1={0} x2={W} y1={(i / DIVS_Y) * H} y2={(i / DIVS_Y) * H} className={`w43-div ${i === DIVS_Y / 2 ? 'axis' : ''}`} />
      ))}
      <g className="w43-sat-lines" {...hoverProps(['sat'])}>
        <line x1={0} x2={W} y1={Y(VOH)} y2={Y(VOH)} className="w43-rail" />
        <line x1={0} x2={W} y1={Y(VOL)} y2={Y(VOL)} className="w43-rail" />
        {!compact && (
          <>
            <text x={W - 6} y={Y(VOH) - 5} className="w43-st end rail">
              +7.5 V 正饱和
            </text>
            <text x={W - 6} y={Y(VOL) - 5} className="w43-st end rail">
              −8.9 V 负饱和
            </text>
          </>
        )}
      </g>
      {showIn && (
        <g {...hoverProps(['ch1'])}>
          {bandIn > 0 && <path d={bandPath(tr.colsIn, bandIn, [-20, 20])} className="w43-band in" />}
          <path d={colsPath(tr.colsIn, 1)} className="w43-trace in" />
        </g>
      )}
      {showOut && outUpto > 0 && (
        <g {...hoverProps(['ch2'])}>
          {bandOut > 0.02 && <path d={bandPath(tr.cols, bandOut, [VOL, VOH], outUpto)} className="w43-band out" />}
          <path d={colsPath(tr.cols, outUpto)} className="w43-trace out" />
        </g>
      )}
      {marks.map((m, i) => (
        <g key={i} className="w43-mark">
          <circle cx={m.x * W} cy={Y(m.v)} r={compact ? 7 : 5} />
          {!compact && (
            <text x={m.x * W + 10} y={Y(m.v) + (m.v < -5 ? -8 : 18)} className="w43-st">
              {m.label}
            </text>
          )}
        </g>
      ))}
      {!compact && (
        <>
          {ticks.map((k) => (
            <text key={k} x={Math.min(W - 4, Math.max(4, k * W))} y={H - 6} className={`w43-st ${k === 0 ? '' : k === 1 ? 'end' : 'mid'}`}>
              {Number((k * span * 1000).toFixed(2))} ms
            </text>
          ))}
          <text x={6} y={16} className="w43-st">
            2.5 V/div · {Number(msDiv.toFixed(2))} ms/div
          </text>
          <text x={6} y={Y(0) - 5} className="w43-st faint">
            0 V
          </text>
        </>
      )}
    </svg>
  );
}
