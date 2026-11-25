// The 双通道示波器's screen (the HUD of the 3D bench): 10 × 8 divisions, CH1 yellow, CH2 cyan,
// MATH magenta, each with its ground marker on the left edge, a cursor and the readouts. A new
// `sweep` key replays the single-shot sweep left to right in real time (one screen = 10 div), so a
// 500 ms/div screen fills in 5 s, as on the bench.

import { fmt, type ScopeView, type Trace } from './model';
import { hoverProps, useIsLit } from './state';

const W = 300;
const H = 200;
const DX = W / 10;
const DY = H / 8;

const CH_ID: Record<Trace['ch'], string> = { ch1: 'ch1', ch2: 'ch2', math: 'math' };
const CH_TAG: Record<Trace['ch'], string> = { ch1: '1', ch2: '2', math: 'M' };

export function ScopeScreen({ view, sweep, locked, warn }: { view: ScopeView; sweep: number; locked?: string; warn?: boolean }) {
  const on = useIsLit();
  const t1 = view.t0 + view.tdiv * 10;
  const X = (t: number) => ((t - view.t0) / (t1 - view.t0)) * W;
  const Y = (v: number, pos: number) => H - (pos * DY + (v / view.vdiv) * DY);
  const N = 200;
  const path = (tr: Trace) =>
    Array.from({ length: N + 1 }, (_, k) => {
      const t = view.t0 + (k / N) * (t1 - view.t0);
      const y = Math.max(-2, Math.min(H + 2, Y(tr.v(t), tr.pos)));
      return `${k ? 'L' : 'M'} ${X(t).toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  const cur = view.cursor;
  const curTr = cur ? view.traces.find((t) => t.ch === cur.ch) : undefined;
  const dur = (t1 - view.t0).toFixed(2);
  return (
    <div className={`w45-scope ${warn ? 'warn' : ''} ${on('scope')}`} {...hoverProps(['scope'])}>
      <svg viewBox={`-14 -4 ${W + 18} ${H + 8}`} className="w45-scope-svg" role="img" aria-label="示波器屏幕">
        <rect x={0} y={0} width={W} height={H} className="w45-scope-bg" />
        {Array.from({ length: 11 }, (_, k) => (
          <line key={`v${k}`} x1={k * DX} x2={k * DX} y1={0} y2={H} className={`w45-sgrid ${k === 5 ? 'axis' : ''}`} />
        ))}
        {Array.from({ length: 9 }, (_, k) => (
          <line key={`h${k}`} x1={0} x2={W} y1={k * DY} y2={k * DY} className={`w45-sgrid ${k === 4 ? 'axis' : ''}`} />
        ))}
        {!locked && (
          <>
            <defs>
              <clipPath id="w45-sweep">
                <rect key={sweep} x={0} y={-4} width={W} height={H + 8} className="w45-sweep" style={{ animationDuration: `${dur}s` }} />
              </clipPath>
            </defs>
            {view.traces.map((tr) => (
              <g key={tr.ch} className={`w45-trace ${tr.ch} ${on(CH_ID[tr.ch])}`}>
                <polygon points={`-13,${Y(0, tr.pos) - 5} -5,${Y(0, tr.pos)} -13,${Y(0, tr.pos) + 5}`} className="w45-gmark" />
                <text x={-12} y={Y(0, tr.pos) - 7} className="w45-gtag">
                  {CH_TAG[tr.ch]}
                </text>
                <path d={path(tr)} clipPath="url(#w45-sweep)" />
              </g>
            ))}
            {cur && curTr && (
              <g className="w45-scur">
                <line x1={X(cur.t)} x2={X(cur.t)} y1={0} y2={H} />
                <circle cx={X(cur.t)} cy={Y(curTr.v(cur.t), curTr.pos)} r={3.5} />
              </g>
            )}
          </>
        )}
        {view.t0 < 0 && <polygon points={`${X(0) - 5},-4 ${X(0) + 5},-4 ${X(0)},3`} className="w45-trig" />}
      </svg>
      {locked && <div className="w45-scope-lock">{locked}</div>}
      <div className="w45-scope-read">
        {view.traces.map((tr) => (
          <span key={tr.ch} className={`w45-sr ${tr.ch}`} {...hoverProps([CH_ID[tr.ch]])}>
            {view.names[tr.ch]} · {fmt(view.vdiv, 0)} V/div
          </span>
        ))}
        <span className="w45-sr tb">{view.tdiv >= 1 ? `${view.tdiv} s` : `${view.tdiv * 1000} ms`}/div · Single ↑</span>
        {cur && curTr && !locked && (
          <span className="w45-sr cursor">
            游标 t = {fmt(cur.t)} s：{fmt(curTr.v(cur.t))} V
          </span>
        )}
      </div>
    </div>
  );
}
