// Layer "02 2D 欧姆定律动态原理图": a DC source v on the left, the resistor R on the right, an
// ammeter in series, a voltmeter across R and a power meter on top. Dots on the wires move with
// the current (speed log-compressed so 0.1 mA … 90 mA all show). The PSC switch flips only the
// reference arrow and the sign of the equation; the short turns R into a wire (red over-current
// box), the open into two hollow terminals (the voltmeter still reads V_s, the dots stop).

import { useEffect } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useLit, useStage } from '../../stageStore';
import { Dock, Telemetry } from './Dock';
import { flowPeriod, ohms, si, useOhm, volts } from './model';
import './w1l3.css';

const X_SRC = 70;
const X_R = 360;
const X_V = 500;
const Y_TOP = 64;
const Y_BOT = 212;
const R_TOP = 96;
const R_BOT = 176;
/** source centre; its terminals are 24 above and below */
const Y_SRC = 138;

const hov = (id: string) => ({
  onPointerEnter: () => useStage.getState().setHover([id]),
  onPointerLeave: () => useStage.getState().setHover(null),
});

/** A vertical resistor zigzag from y0 to y1 at x. */
function zigzagV(x: number, y0: number, y1: number) {
  const n = 6;
  const pts = [`${x},${y0}`, `${x},${y0 + 10}`];
  const step = (y1 - y0 - 20) / (2 * n);
  for (let k = 0; k < 2 * n; k++) pts.push(`${x + (k % 2 ? -12 : 12)},${y0 + 10 + step * (k + 0.5)}`);
  pts.push(`${x},${y1 - 10}`, `${x},${y1}`);
  return pts.join(' ');
}

function zigzagH(x0: number, x1: number, y: number) {
  const n = 4;
  const pts = [`${x0},${y}`];
  const step = (x1 - x0) / (2 * n);
  for (let k = 0; k < 2 * n; k++) pts.push(`${x0 + step * (k + 0.5)},${y + (k % 2 ? 9 : -9)}`);
  pts.push(`${x1},${y}`);
  return pts.join(' ');
}

export function SchematicLayer() {
  const { s, psc, limit, rs, v } = useOhm();
  const lit = useLit();
  const L = (id: string) => (lit.includes(id) ? 'lit' : '');
  useEffect(() => () => useStage.getState().setHover(null), []);
  const still = prefersReducedMotion();
  const period = flowPeriod(s.iPhys);
  const flowing = period > 0 && !still;
  const iTxt = si(s.iRef, 'A').text;
  const aTxt = s.dead ? 'OVER' : si(s.iPhys, 'A').text;
  const loop = `M ${X_SRC} ${Y_SRC - 24} L ${X_SRC} ${Y_TOP} L ${X_R} ${Y_TOP} L ${X_R} ${Y_BOT} L ${X_SRC} ${Y_BOT} L ${X_SRC} ${Y_SRC + 24}`;
  const shortLit = lit.includes('hl_short_limit');
  const openLit = lit.includes('hl_open_limit');
  return (
    <div className="l3-layer">
      <div className="l3-view">
        <svg viewBox="0 0 560 248" className="l3-svg" role="img" aria-label={`原理图：v = ${volts(v)}，R = ${ohms(s.rEff).text}，i = ${iTxt}，p = ${si(s.p, 'W').text}`}>
          <rect x="4" y="4" width="552" height="240" rx="14" className={`l3-bg ${s.dead || s.overload ? 'hot' : ''}`} />
          {/* wires */}
          <path d={`M ${X_SRC} ${Y_SRC - 24} L ${X_SRC} ${Y_TOP} L ${X_R} ${Y_TOP} L ${X_R} ${R_TOP}`} className="l3-wire" />
          <path d={`M ${X_R} ${R_BOT} L ${X_R} ${Y_BOT} L ${X_SRC} ${Y_BOT} L ${X_SRC} ${Y_SRC + 24}`} className="l3-wire" />
          <path d={`M ${X_R} ${Y_TOP} L ${X_V} ${Y_TOP} L ${X_V} ${Y_SRC - 20} M ${X_V} ${Y_SRC + 20} L ${X_V} ${Y_BOT} L ${X_R} ${Y_BOT}`} className="l3-wire thin" />
          {rs && <rect x="200" y={Y_TOP - 14} width="84" height="28" fill="#fff" />}
          {/* current dots */}
          {limit !== 'open' && period > 0 && (
            <path
              d={loop}
              className={`l3-flow ${s.dead ? 'dead' : ''} ${flowing ? '' : 'still'}`}
              style={{ animationDuration: `${period}s`, animationDirection: s.iPhys < 0 ? 'reverse' : 'normal' }}
            />
          )}
          {/* protective resistor */}
          {rs && (
            <g>
              <polyline points={zigzagH(206, 278, Y_TOP)} className="l3-res thin" />
              <text x="242" y={Y_TOP + 30} textAnchor="middle" className="l3-t small">
                R<tspan baselineShift="sub">s</tspan> = 1 kΩ
              </text>
            </g>
          )}
          {/* source */}
          <g>
            <circle cx={X_SRC} cy={Y_SRC} r="24" className="l3-src" />
            <text x={X_SRC} y={Y_SRC - 6} textAnchor="middle" className="l3-sign plus">
              +
            </text>
            <text x={X_SRC} y={Y_SRC + 20} textAnchor="middle" className="l3-sign minus">
              −
            </text>
            <text x={X_SRC + 32} y={Y_SRC - 4} className="l3-t">
              v<tspan baselineShift="sub">s</tspan>
            </text>
            <text x={X_SRC + 32} y={Y_SRC + 16} className="l3-t strong">
              {volts(v)}
            </text>
            {v < 0 && (
              <text x={X_SRC - 52} y="236" className="l3-t small muted">
                v 为负：实际极性与 +/− 标注相反
              </text>
            )}
          </g>
          {/* ammeter */}
          <g>
            <circle cx="150" cy={Y_TOP} r="16" className={`l3-meter ${s.dead ? 'bad' : ''}`} />
            <text x="150" y={Y_TOP + 5} textAnchor="middle" className="l3-meter-k">
              A
            </text>
            <rect x="104" y="22" width="92" height="24" rx="6" className={`l3-lcd ${s.dead ? 'bad' : ''}`} />
            <text x="150" y="39" textAnchor="middle" className="l3-lcd-t">
              {aTxt}
            </text>
          </g>
          {/* power meter */}
          <g className={`l3-hit ${L('hl_power_soa')}`} {...hov('hl_power_soa')}>
            <rect x="206" y="14" width="146" height="38" rx="8" className={`l3-pm ${s.overload ? 'bad' : ''}`} />
            <text x="220" y="39" className="l3-meter-k small">
              W
            </text>
            <text x="338" y="31" textAnchor="end" className="l3-lcd-t">
              p = {si(s.p, 'W').text}
            </text>
            <text x="338" y="46" textAnchor="end" className={`l3-t tiny ${s.overload ? 'bad blink' : 'muted'}`}>
              {s.overload ? 'OVERLOAD > 0.25 W' : `${(s.eta * 100).toFixed(1)}% × 1/4 W`}
            </text>
          </g>
          {/* the element under test */}
          {limit === 'none' && (
            <g>
              <g className={`l3-hit ${L('hl_geom_rho')}`} {...hov('hl_geom_rho')}>
                <rect x={X_R - 20} y={R_TOP} width="40" height={R_BOT - R_TOP} fill="transparent" />
                <polyline points={zigzagV(X_R, R_TOP, R_BOT)} className={`l3-res ${s.overload ? 'hot' : ''}`} />
              </g>
              <g className={`l3-hit ${L('hl_color_bands')}`} {...hov('hl_color_bands')}>
                <text x={X_R + 22} y="128" className="l3-t strong">
                  R = {ohms(s.rEff).text}
                </text>
              </g>
              <g className={`l3-hit ${L('hl_conductance')}`} {...hov('hl_conductance')}>
                <text x={X_R + 22} y="152" className="l3-t g">
                  G = {si(s.g, 'S').text}
                </text>
              </g>
            </g>
          )}
          {limit === 'open' && (
            <g className={`l3-hit ${L('hl_open_limit')}`} {...hov('hl_open_limit')}>
              <circle cx={X_R} cy={R_TOP + 6} r="6" className="l3-term" />
              <circle cx={X_R} cy={R_BOT - 6} r="6" className="l3-term" />
              <text x={X_R + 22} y="130" className="l3-t strong blue">
                i = 0 A
              </text>
              <text x={X_R + 22} y="150" className="l3-t small blue">
                R → ∞，G = 0
              </text>
            </g>
          )}
          {limit === 'short' && (
            <g className={`l3-hit ${L('hl_short_limit')}`} {...hov('hl_short_limit')}>
              <line x1={X_R} y1={R_TOP} x2={X_R} y2={R_BOT} className="l3-shortwire" />
              <rect x={X_R - 30} y={R_TOP - 8} width="112" height={R_BOT - R_TOP + 16} rx="8" className="l3-warnbox" />
              <text x={X_R + 14} y="122" className="l3-t strong bad">
                v = 0 V
              </text>
              <text x={X_R + 14} y="142" className="l3-t small bad">
                R = 0 Ω
              </text>
              <text x={X_R + 14} y="162" className="l3-t tiny bad">
                {s.dead ? 'i → ∞（电源被短接）' : 'i 由外电路决定'}
              </text>
            </g>
          )}
          {/* previews of the limits when the text points at them */}
          {limit !== 'short' && shortLit && (
            <g className="l3-ghost bad">
              <line x1={X_R - 2} y1={R_TOP} x2={X_R - 2} y2={R_BOT} />
              <text x={X_R - 28} y={R_BOT + 22} textAnchor="end" className="l3-t small bad">
                短路 ⇒ v = 0 V
              </text>
            </g>
          )}
          {limit !== 'open' && openLit && (
            <g className="l3-ghost blue">
              <circle cx={X_R} cy={R_TOP + 6} r="6" />
              <circle cx={X_R} cy={R_BOT - 6} r="6" />
              <text x={X_R - 28} y={R_BOT + 22} textAnchor="end" className="l3-t small blue">
                开路 ⇒ i = 0 A
              </text>
            </g>
          )}
          {/* reference polarity and reference current arrow */}
          <g className={`l3-hit ${L('hl_psc_sign')}`} {...hov('hl_psc_sign')}>
            <rect x="250" y={R_TOP - 6} width="96" height={R_BOT - R_TOP + 12} fill="transparent" />
            <text x={X_R - 22} y={R_TOP + 12} textAnchor="middle" className="l3-sign plus">
              +
            </text>
            <text x={X_R - 22} y={R_BOT - 2} textAnchor="middle" className="l3-sign minus">
              −
            </text>
            <text x={X_R - 22} y="142" textAnchor="middle" className="l3-t">
              v
            </text>
            {psc ? (
              <path d={`M 318 ${R_TOP + 8} L 318 130 M 311 121 L 318 132 L 325 121`} className="l3-arrow" />
            ) : (
              <path d={`M 318 ${R_BOT - 8} L 318 142 M 311 151 L 318 140 L 325 151`} className="l3-arrow bad" />
            )}
            <text x="308" y={psc ? 116 : 168} textAnchor="end" className={`l3-t strong ${psc ? 'arrowc' : 'bad'}`}>
              i = {iTxt}
            </text>
            <text x="308" y={psc ? 134 : 150} textAnchor="end" className={`l3-t small ${psc ? 'arrowc' : 'bad'}`}>
              {psc ? '进 + 出 −' : '进 − 出 +'}
            </text>
            <rect x="214" y="180" width="96" height="27" rx="7" className={`l3-eqbox ${psc ? '' : 'bad'}`} />
            <text x="262" y="198" textAnchor="middle" className="l3-t strong">
              {psc ? 'v = +iR' : 'v = −iR'}
            </text>
          </g>
          {/* voltmeter */}
          <g>
            <circle cx={X_V} cy={Y_SRC} r="20" className="l3-meter" />
            <text x={X_V} y={Y_SRC + 6} textAnchor="middle" className="l3-meter-k">
              V
            </text>
            <rect x={X_V - 46} y="168" width="92" height="24" rx="6" className="l3-lcd" />
            <text x={X_V} y="185" textAnchor="middle" className="l3-lcd-t">
              {s.vR.toFixed(2)} V
            </text>
          </g>
          {/* nodes */}
          <circle cx={X_R} cy={Y_TOP} r="4" className="l3-node" />
          <circle cx={X_R} cy={Y_BOT} r="4" className="l3-node" />
          {rs && (
            <>
              <text x={X_R + 8} y={Y_TOP - 8} className="l3-t small">
                a
              </text>
              <text x={X_R + 8} y={Y_BOT + 18} className="l3-t small">
                b
              </text>
            </>
          )}
        </svg>
      </div>
      <Dock />
      <Telemetry />
    </div>
  );
}
