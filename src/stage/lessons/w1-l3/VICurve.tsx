// Layer "03 V-I 线性特性与开路/短路极限曲线": the i–v plane (v −12 … +12 V across, i −50 … +50 mA
// up, origin in the middle; a ±5 mA zoom shows kΩ slopes up close). The resistor's characteristic i = Gv is a line through the origin
// whose slope is G; the green working point Q can be dragged sideways to set the source voltage.
// The pale red zones are beyond the 0.25 W hyperbolas |v·i| = 0.25 W (the safe operating area);
// the open limit lays the line down on the v axis, the short stands it up on the i axis.

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { Dock, Telemetry } from './Dock';
import { I_MAX, P_RATED, RS, V_MAX, ohms, si, useOhm } from './model';
import './w1l3.css';

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 480, h: 320 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: Math.max(200, el.clientWidth), h: Math.max(150, el.clientHeight) });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

const hov = (id: string) => ({
  onPointerEnter: () => useStage.getState().setHover([id]),
  onPointerLeave: () => useStage.getState().setHover(null),
});

export function VICurveLayer() {
  const o = useOhm();
  const { s, psc, limit } = o;
  const lit = useLit();
  const L = (id: string) => (lit.includes(id) ? 'lit' : '');
  const [box, { w, h }] = useSize<HTMLDivElement>();
  const [drag, setDrag] = useState(false);
  // the i axis: ±50 mA (default, shows the 0.25 W hyperbolas) or ±5 mA (kΩ slopes up close)
  const [izoom, setIzoom] = useStageParam<boolean>('izoom', false);
  const iMax = izoom ? I_MAX / 10 : I_MAX;
  useEffect(() => () => useStage.getState().setHover(null), []);

  const small = w < 420;
  const m = { l: small ? 30 : 44, r: small ? 12 : 20, t: small ? 14 : 18, b: small ? 22 : 28 };
  const pw = w - m.l - m.r;
  const ph = h - m.t - m.b;
  const ox = m.l + pw / 2;
  const oy = m.t + ph / 2;
  const sx = pw / 2 / V_MAX; // px per volt
  const sy = ph / 2 / (iMax * 1000); // px per mA
  const X = (v: number) => ox + v * sx;
  const Y = (mA: number) => oy - mA * sy;
  const fs = small ? 10 : 12;

  // the characteristic's screen angle (0 = flat, 90 = upright)
  const slopePx = limit === 'open' ? 0 : limit === 'short' ? Infinity : (s.g * 1000 * sy) / sx;
  const deg = (Math.atan(slopePx) * 180) / Math.PI;
  const longLen = Math.hypot(w, h);

  // SOA: the region beyond |v·i| = P_RATED in each quadrant
  const vKnee = P_RATED / iMax; // 5 V
  const hyper: [number, number][] = [];
  for (let k = 0; k <= 24; k++) {
    const v = vKnee + ((V_MAX - vKnee) * k) / 24;
    hyper.push([v, (P_RATED / v) * 1000]);
  }
  const zone = (qx: number, qy: number) =>
    `M ${X(qx * vKnee)} ${Y(qy * iMax * 1000)} ` + hyper.map(([v, i]) => `L ${X(qx * v)} ${Y(qy * i)}`).join(' ') + ` L ${X(qx * V_MAX)} ${Y(qy * iMax * 1000)} Z`;
  const curve = (qx: number, qy: number) => `M ${X(qx * vKnee)} ${Y(qy * iMax * 1000)} ` + hyper.map(([v, i]) => `L ${X(qx * v)} ${Y(qy * i)}`).join(' ');

  // the working point (reference current), clamped to the plot
  const qv = s.vR;
  const qi = s.dead ? (s.iRef >= 0 ? Infinity : -Infinity) : s.iRef * 1000;
  const off = !Number.isFinite(qi) || Math.abs(qi) > iMax * 1000;
  const qiC = Math.max(-iMax * 1000, Math.min(iMax * 1000, Number.isFinite(qi) ? qi : Math.sign(qi) * iMax * 1000));
  const qx = X(qv);
  const qy = Y(qiC);

  const setFromPointer = (e: RPointerEvent<SVGElement>) => {
    const rect = (e.currentTarget.ownerSVGElement ?? (e.currentTarget as SVGSVGElement)).getBoundingClientRect();
    const vAt = Math.max(-V_MAX, Math.min(V_MAX, (e.clientX - rect.left - ox) / sx));
    // the source voltage that puts v_R there (through R_s when it is in)
    let vs = vAt;
    if (o.rs && limit === 'none') vs = (vAt * (o.r + RS)) / o.r;
    o.setV(Math.max(-V_MAX, Math.min(V_MAX, Math.round(vs * 2) / 2)));
  };

  const ticksV = [-10, -5, 5, 10];
  const ticksI = izoom ? [-4, -2, 2, 4] : [-40, -20, 20, 40];
  const lineCls = s.overload ? 'hot' : '';
  // slope triangle for G (in the first quadrant, inside the plot)
  const triDv = limit === 'none' ? Math.min(8, (0.8 * iMax) / s.g) : 0;
  const triV0 = limit === 'none' ? Math.min(2, V_MAX - triDv) : 0;
  const quadrants = psc ? [1, -1] : [-1, 1];
  const triRight = X(triV0 + triDv) > w - m.r - 70;

  return (
    <div className="l3-layer">
      <div className="l3-view" ref={box}>
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          className={`l3-svg vi ${drag ? 'dragging' : ''}`}
          role="img"
          aria-label={`i–v 平面：G = ${si(s.g, 'S').text}，工作点 Q(${s.vR.toFixed(2)} V, ${si(s.iRef, 'A').text})`}
          style={{ fontSize: fs }}
        >
          <defs>
            <clipPath id="l3-plot">
              <rect x={m.l} y={m.t} width={pw} height={ph} />
            </clipPath>
          </defs>
          <rect x={m.l} y={m.t} width={pw} height={ph} className="l3-plot" />
          {/* safe operating area */}
          <g className={`l3-soa ${L('hl_power_soa')} ${s.overload ? 'alarm' : ''}`} {...hov('hl_power_soa')}>
            {vKnee < V_MAX &&
              [
                [1, 1],
                [-1, -1],
                [-1, 1],
                [1, -1],
              ].map(([a, b]) => (
                <g key={`${a}${b}`}>
                  <path d={zone(a, b)} className="l3-soa-fill" />
                  <path d={curve(a, b)} className="l3-soa-line" />
                </g>
              ))}
            <text x={X(V_MAX) - 4} y={Y(iMax * 1000) + fs + 4} textAnchor="end" className="l3-t bad" style={{ fontSize: fs }}>
              {vKnee < V_MAX ? '|v·i| > 0.25 W' : ''}
            </text>
          </g>
          {/* grid and ticks */}
          {ticksV.map((v) => (
            <g key={`v${v}`}>
              <line x1={X(v)} y1={m.t} x2={X(v)} y2={m.t + ph} className="l3-grid" />
              <text x={X(v)} y={m.t + ph + fs + 4} textAnchor="middle" className="l3-tick" style={{ fontSize: fs - 1 }}>
                {v}
              </text>
            </g>
          ))}
          {ticksI.map((i) => (
            <g key={`i${i}`}>
              <line x1={m.l} y1={Y(i)} x2={m.l + pw} y2={Y(i)} className="l3-grid" />
              <text x={m.l - 4} y={Y(i) + 4} textAnchor="end" className="l3-tick" style={{ fontSize: fs - 1 }}>
                {i}
              </text>
            </g>
          ))}
          {/* axes: v (open limit) and i (short limit) */}
          <g className={`l3-axis open ${L('hl_open_limit')} ${limit === 'open' ? 'on' : ''}`} {...hov('hl_open_limit')}>
            <line x1={m.l} y1={oy} x2={m.l + pw} y2={oy} />
            <line x1={m.l} y1={oy} x2={m.l + pw} y2={oy} className="l3-axis-hit" />
            <text x={m.l + pw - 4} y={oy - 6} textAnchor="end" className="l3-axis-t">
              v (V)
            </text>
          </g>
          <g className={`l3-axis short ${L('hl_short_limit')} ${limit === 'short' ? 'on' : ''}`} {...hov('hl_short_limit')}>
            <line x1={ox} y1={m.t} x2={ox} y2={m.t + ph} />
            <line x1={ox} y1={m.t} x2={ox} y2={m.t + ph} className="l3-axis-hit" />
            <text x={ox + 6} y={m.t + fs + 2} className="l3-axis-t">
              i (mA)
            </text>
          </g>
          {/* PSC: where Q can live (p ≥ 0) */}
          {lit.includes('hl_psc_sign') &&
            quadrants.map((q) => (
              <g key={q} className="l3-quad">
                <path d={`M ${X(q * 2)} ${Y((psc ? q : -q) * 8)} L ${X(q * 7)} ${Y((psc ? q : -q) * 34)}`} markerEnd="url(#l3-qarrow)" />
              </g>
            ))}
          <defs>
            <marker id="l3-qarrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
          </defs>
          {lit.includes('hl_psc_sign') && (
            <text x={X(psc ? -11.5 : 0.6)} y={Y(46)} className="l3-t strong amber" style={{ fontSize: fs }}>
              {psc ? 'PSC：Q 只在 I / III 象限（p ≥ 0）' : 'Non-PSC：参考值落在 II / IV 象限'}
            </text>
          )}
          <g clipPath="url(#l3-plot)">
            {/* limit previews */}
            {lit.includes('hl_short_limit') && limit !== 'short' && (
              <g transform={`translate(${ox} ${oy})`}>
                <line x1={-longLen} y1="0" x2={longLen} y2="0" className="l3-preview bad" transform="rotate(-84)" />
              </g>
            )}
            {lit.includes('hl_open_limit') && limit !== 'open' && (
              <g transform={`translate(${ox} ${oy})`}>
                <line x1={-longLen} y1="0" x2={longLen} y2="0" className="l3-preview blue" transform="rotate(-5)" />
              </g>
            )}
            {/* Non-PSC: the reference current's mirror line */}
            {!psc && (
              <g transform={`translate(${ox} ${oy})`}>
                <g className="l3-rot" style={{ transform: `rotate(${deg}deg)` }}>
                  <line x1={-longLen} y1="0" x2={longLen} y2="0" className="l3-char mirror" />
                </g>
              </g>
            )}
            {/* the characteristic i = Gv */}
            <g transform={`translate(${ox} ${oy})`}>
              <g className="l3-rot" style={{ transform: `rotate(${-deg}deg)` }}>
                <g className={`l3-hit ${L('hl_conductance')} ${lit.includes('hl_geom_rho') ? 'blinking' : ''}`} {...hov('hl_conductance')}>
                  <line x1={-longLen} y1="0" x2={longLen} y2="0" className={`l3-char ${lineCls}`} />
                  <line x1={-longLen} y1="0" x2={longLen} y2="0" className="l3-axis-hit" />
                </g>
              </g>
            </g>
            {/* slope triangle Δi / Δv */}
            {lit.includes('hl_conductance') && limit === 'none' && (
              <g className="l3-tri">
                <path d={`M ${X(triV0)} ${Y(s.g * triV0 * 1000)} L ${X(triV0 + triDv)} ${Y(s.g * triV0 * 1000)} L ${X(triV0 + triDv)} ${Y(s.g * (triV0 + triDv) * 1000)} Z`} />
                <text x={X(triV0 + triDv / 2)} y={Y(s.g * triV0 * 1000) + fs + 3} textAnchor="middle" className="l3-t strong green" style={{ fontSize: fs }}>
                  Δv = {triDv.toFixed(triDv < 1 ? 2 : 1)} V
                </text>
                <text
                  x={X(triV0 + triDv) + (triRight ? -4 : 4)}
                  y={Y(s.g * (triV0 + triDv / 2) * 1000) + (triRight ? fs : 0)}
                  textAnchor={triRight ? 'end' : 'start'}
                  className="l3-t strong green qlabel"
                  style={{ fontSize: fs }}
                >
                  Δi = {si(s.g * triDv, 'A').text}
                </text>
              </g>
            )}
          </g>
          {/* line label: slope = G = 1/R */}
          <g className={`l3-hit ${L('hl_color_bands')}`} {...hov('hl_color_bands')}>
            <rect x={m.l + 6} y={m.t + 6} width={small ? 150 : 196} height={fs * 2 + 14} rx="6" className="l3-label" />
            <text x={m.l + 14} y={m.t + 8 + fs + 2} className="l3-t strong" style={{ fontSize: fs }}>
              i = Gv，斜率 G = 1/R
            </text>
            <text x={m.l + 14} y={m.t + 8 + 2 * fs + 6} className="l3-t" style={{ fontSize: fs }}>
              R = {limit === 'open' ? '∞' : ohms(s.rEff).text}，G = {limit === 'short' ? '∞' : si(s.g, 'S').text}
            </text>
          </g>
          {/* Q */}
          <g
            className={`l3-q ${off ? 'off' : ''}`}
            onPointerDown={(e) => {
              (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
              setDrag(true);
            }}
            onPointerMove={(e) => drag && setFromPointer(e)}
            onPointerUp={() => setDrag(false)}
            onPointerCancel={() => setDrag(false)}
          >
            <circle cx={qx} cy={qy} r={small ? 14 : 16} className="l3-q-hit" />
            <circle cx={qx} cy={qy} r={small ? 6 : 7} className="l3-q-dot" />
            <text
              x={qx + (qv > 6 ? -10 : 10)}
              y={qy + (qy - m.t < 30 ? fs + 16 : -10)}
              textAnchor={qv > 6 ? 'end' : 'start'}
              className="l3-t strong qlabel"
              style={{ fontSize: fs }}
            >
              Q({s.vR.toFixed(1)} V, {s.dead ? '∞' : si(s.iRef, 'A').text}){off ? ' 超出量程' : ''}
            </text>
          </g>
          {s.overload && (
            <text x={ox} y={m.t + ph - 8} textAnchor="middle" className="l3-t strong bad blink" style={{ fontSize: fs + 2 }}>
              OVERLOAD &gt; 0.25 W（p = {si(s.p, 'W').text}）
            </text>
          )}
          {s.dead && (
            <text x={ox + 8} y={m.t + ph - 8} className="l3-t strong bad" style={{ fontSize: fs }}>
              理想电源被短接：i → ∞
            </text>
          )}
        </svg>
        <button type="button" className={`l3-zoom ${izoom ? 'on' : ''}`} aria-pressed={izoom} onClick={() => setIzoom(!izoom)} title="切换 i 轴量程">
          i 轴 ±{izoom ? 5 : 50} mA
        </button>
      </div>
      <Dock />
      <Telemetry />
    </div>
  );
}
