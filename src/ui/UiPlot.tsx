// u–i characteristic of a nonlinear resistor (schematic.plot): the curve, the load line of the
// linear part (dashed) and the operating points — computed by the engine (src/core/problem/plot.ts).

import { useMemo } from 'react';
import { tr } from '../core/i18n';
import { plotData } from '../core/problem/plot';
import type { Schematic } from '../core/problem/types';
import { richRuns } from './ProblemSchematic';
import { subQ } from './subQ';

const W = 300;
const H = 220;
const M = { l: 44, r: 14, t: 14, b: 34 };

/** "nice" tick values covering [lo, hi] */
function ticks(lo: number, hi: number, n = 5): number[] {
  const raw = (hi - lo) / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * p).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9 * step; v += step) out.push(Math.abs(v) < 1e-12 * step ? 0 : v);
  return out;
}
const fmt = (v: number) => String(parseFloat(v.toPrecision(4)));

export function UiPlot({ schematic }: { schematic: Schematic }) {
  const d = useMemo(() => plotData(schematic), [schematic]);
  if (!d) return null;
  const { plot, curve, load, points } = d;
  const k = plot.iUnit === 'mA' ? 1e3 : plot.iUnit === 'µA' ? 1e6 : 1;
  const [u0, u1] = plot.u;
  const [i0, i1] = plot.i;
  const X = (u: number) => M.l + ((u - u0) / (u1 - u0)) * (W - M.l - M.r);
  const Y = (i: number) => H - M.b - ((i - i0) / (i1 - i0)) * (H - M.t - M.b);
  const clip = (u: number, i: number) => [Math.max(M.l, Math.min(W - M.r, X(u))), Math.max(M.t, Math.min(H - M.b, Y(i)))];
  const ax = { x: u0 <= 0 && u1 >= 0 ? X(0) : M.l, y: i0 <= 0 && i1 >= 0 ? Y(0) : H - M.b };
  const name = richRuns(plot.el.replace(/^([A-Za-z])(\w+)$/, '$1_$2'));
  return (
    <figure className="uiplot">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={tr(`${plot.el} 的 u–i 特性`, `u–i characteristic of ${plot.el}`)}>
        <defs>
          <clipPath id={`uiclip-${plot.el}`}>
            <rect x={M.l} y={M.t} width={W - M.l - M.r} height={H - M.t - M.b} />
          </clipPath>
        </defs>
        {ticks(u0, u1).map((u) => (
          <g key={`u${u}`}>
            <line x1={X(u)} x2={X(u)} y1={M.t} y2={H - M.b} className="uiplot-grid" />
            <text x={X(u)} y={H - M.b + 14} textAnchor="middle" className="uiplot-tick">
              {fmt(u)}
            </text>
          </g>
        ))}
        {ticks(i0 * k, i1 * k).map((i) => (
          <g key={`i${i}`}>
            <line x1={M.l} x2={W - M.r} y1={Y(i / k)} y2={Y(i / k)} className="uiplot-grid" />
            <text x={M.l - 5} y={Y(i / k) + 4} textAnchor="end" className="uiplot-tick">
              {fmt(i)}
            </text>
          </g>
        ))}
        <line x1={M.l} x2={W - M.r} y1={ax.y} y2={ax.y} className="uiplot-axis" />
        <line x1={ax.x} x2={ax.x} y1={M.t} y2={H - M.b} className="uiplot-axis" />
        <text x={W - M.r} y={H - 4} textAnchor="end" className="uiplot-label">
          <tspan fontStyle="italic">u</tspan> / V
        </text>
        <text x={6} y={M.t + 2} className="uiplot-label" transform={`rotate(-90 6 ${M.t + 2})`} textAnchor="end">
          <tspan fontStyle="italic">i</tspan> / {plot.iUnit ?? 'A'}
        </text>
        <g clipPath={`url(#uiclip-${plot.el})`}>
          {curve.map((line, n) => (
            <polyline key={n} points={line.map(([u, i]) => clip(u, i).join(',')).join(' ')} className="uiplot-curve" />
          ))}
          {load && <line x1={X(load[0][0])} y1={Y(load[0][1])} x2={X(load[1][0])} y2={Y(load[1][1])} className="uiplot-load" />}
        </g>
        {points.map(([u, i], n) => (
          <g key={n}>
            <circle cx={X(u)} cy={Y(i)} r={3.6} className="uiplot-q" />
            <text x={X(u) + 6} y={Y(i) - 6} className="uiplot-qlabel">
              Q{points.length > 1 ? <tspan fontSize="0.75em" dy={3}>{n + 1}</tspan> : null}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        {name.map((r, n) => (r.sub ? <sub key={n}>{subQ(r.t)}</sub> : <i key={n}>{r.t}</i>))}
        {tr(' 的 u–i 特性', ' u–i characteristic')}
        {load ? tr('；虚线：线性部分的负载线', '; dashed: load line of the linear part') : ''}
      </figcaption>
    </figure>
  );
}
