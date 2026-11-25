// Layer "01 环路电位爬坡/跌落剖面图" (Boylestad's altitude analogy): the loop on the left, the
// potential of each node along the clockwise walk D → A → B → C → D as bars on the right. The step
// walker moves the probe one element at a time and raises or drops the next bar (with the step
// change in a bubble); back at D the profile is at 0 V again. The reference node shifts every bar
// by the same amount and changes no step. Sliders change V1, V2, R1, R2 (the current arrow and
// the bars follow).

import { useEffect, useState, type CSSProperties } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useLit, useStage } from '../../stageStore';
import { ELEMS, fmt, PATH, signed, solve, type ElemId, type NodeId } from './model';
import { hoverProps, readL6, useCircuit, useL6 } from './params';
import { Lbl } from './Lbl';
import './w1-l6.css';

const NODE_XY: Record<NodeId, [number, number]> = { D: [70, 236], A: [70, 58], B: [262, 58], C: [262, 236] };
const BAR_ID: Record<NodeId, string> = { D: 'bar_node_d', A: 'bar_node_a', B: 'bar_node_b', C: 'bar_node_c' };
const NODE_TONE: Record<NodeId, string> = { D: 'tone-d', A: 'tone-a', B: 'tone-b', C: 'tone-c' };
const ELEM_ID: Record<ElemId, string> = { v1: 'elem_v1', r1: 'elem_r1', v2: 'elem_v2', r2: 'elem_r2' };
const GNDS: NodeId[] = ['D', 'A', 'B'];

/** Chart frame (right part of the SVG). */
const CH = { x0: 318, x1: 532, top: 40, bottom: 246 };
const SLOT = (CH.x1 - CH.x0) / 5;
const slotX = (k: number) => CH.x0 + SLOT * (k + 0.5);

function niceCeil(x: number) {
  const steps = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100];
  return steps.find((s) => s >= x) ?? Math.ceil(x / 50) * 50;
}

/** Zigzag between two points (horizontal). */
function zigzag(x0: number, x1: number, y: number) {
  const n = 6;
  const w = (x1 - x0) / n;
  let d = `M ${x0} ${y}`;
  for (let k = 0; k < n; k++) d += ` L ${x0 + w * (k + 0.5)} ${y + (k % 2 ? 9 : -9)}`;
  return `${d} L ${x1} ${y}`;
}

function GndGlyph({ at }: { at: NodeId }) {
  const [x, y] = NODE_XY[at];
  // bottom nodes: straight down; top nodes: out to the side, then down
  const gx = at === 'D' || at === 'C' ? x : x + (at === 'A' ? -22 : 22);
  const gy = at === 'D' || at === 'C' ? y + 12 : y + 10;
  return (
    <g className="l6-gnd">
      <path d={`M ${x} ${y} L ${gx} ${y} L ${gx} ${gy}`} />
      <path d={`M ${gx - 9} ${gy} L ${gx + 9} ${gy} M ${gx - 6} ${gy + 4} L ${gx + 6} ${gy + 4} M ${gx - 3} ${gy + 8} L ${gx + 3} ${gy + 8}`} />
    </g>
  );
}

export default function ProfileLayer() {
  const c = useCircuit();
  const s = solve(c);
  const [step, setStep] = useL6('l6_step');
  const [gnd, setGnd] = useL6('l6_gnd');
  const [, setV1] = useL6('l6_v1');
  const [, setV2] = useL6('l6_v2');
  const [, setR1] = useL6('l6_r1');
  const [, setR2] = useL6('l6_r2');
  const [auto, setAuto] = useState(false);
  const [showParams, setShowParams] = useState(() => typeof matchMedia !== 'function' || matchMedia('(min-width: 961px)').matches);
  const lit = useLit();
  const still = prefersReducedMotion();
  const on = (id: string) => lit.includes(id);

  useEffect(() => () => useStage.getState().setHover(null), []);

  // auto walk: one element per beat until the probe is back at D
  useEffect(() => {
    if (!auto) return;
    if (readL6('l6_step') >= 4) useStage.getState().setParams({ l6_step: 0 });
    const t = setInterval(
      () => {
        const k = readL6('l6_step');
        if (k >= 4) setAuto(false);
        else useStage.getState().setParams({ l6_step: k + 1 });
      },
      still ? 500 : 1100,
    );
    return () => clearInterval(t);
  }, [auto, still]);

  const off = s.pot[gnd];
  const rel = (n: NodeId) => s.pot[n] - off;
  const profile = PATH.map((n, k) => (k === 4 ? s.closeAt - off : rel(n)));
  // one scale for every reference node, so switching the ground visibly shifts the bars
  const all = (['D', 'A', 'B', 'C'] as NodeId[]).map((n) => s.pot[n]);
  const offs = GNDS.map((g) => s.pot[g]);
  const hi = niceCeil(Math.max(1, Math.max(...all) - Math.min(...offs)));
  const lo = -niceCeil(Math.max(1, Math.max(...offs) - Math.min(...all)));
  const y = (v: number) => CH.top + ((hi - v) / (hi - lo)) * (CH.bottom - CH.top);
  const y0 = y(0);
  const tickStep = niceCeil((hi - lo) / 5);
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / tickStep) * tickStep; v <= hi; v += tickStep) ticks.push(v);

  const deltas = ELEMS.map((e) => s.rise[e.id]);
  const climbed = deltas.slice(0, step);
  const rises = deltas.filter((d) => d > 0).reduce((a, d) => a + d, 0);
  const drops = -deltas.filter((d) => d < 0).reduce((a, d) => a + d, 0);
  const closed = step >= 4;

  const [px, py] = NODE_XY[PATH[step]];
  const trail = PATH.slice(0, step + 1)
    .map((n, k) => `${k ? 'L' : 'M'} ${NODE_XY[n][0]} ${NODE_XY[n][1]}`)
    .join(' ');
  const iw = Math.min(7, 1.5 + Math.abs(s.i) * 1.1);
  const iDir = s.i >= 0 ? 1 : -1;
  const plus = s.plusAtEnd;

  /** "+"/"−" marks of an element at its from / to ends. */
  const marks = (id: ElemId): [string, string] => (plus[id] ? ['−', '+'] : ['+', '−']);

  const sliders: { key: 'l6_v1' | 'l6_v2' | 'l6_r1' | 'l6_r2'; label: string; min: number; max: number; stepBy: number; unit: string; val: number; set: (v: number) => void }[] = [
    { key: 'l6_v1', label: 'V₁', min: 5, max: 30, stepBy: 1, unit: 'V', val: c.V1, set: setV1 },
    { key: 'l6_v2', label: 'V₂', min: 0, max: 15, stepBy: 1, unit: 'V', val: c.V2, set: setV2 },
    { key: 'l6_r1', label: 'R₁', min: 1, max: 10, stepBy: 0.5, unit: 'Ω', val: c.R1, set: setR1 },
    { key: 'l6_r2', label: 'R₂', min: 1, max: 10, stepBy: 0.5, unit: 'Ω', val: c.R2, set: setR2 },
  ];

  return (
    <div className="l6-layer">
      <div className="l6-controls" role="group" aria-label="顺时针巡检步进控制器">
        <button className="l6-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} aria-label="上一步">
          <Lbl long="◀ 上一步" short="◀" />
        </button>
        <button className="l6-btn primary" onClick={() => setStep(Math.min(4, step + 1))} disabled={step === 4}>
          下一步 ▶
        </button>
        <button className={`l6-btn ${auto ? 'on' : ''}`} onClick={() => setAuto((a) => !a)} aria-pressed={auto}>
          {auto ? '暂停' : <Lbl long="自动巡检" short="自动" />}
        </button>
        <button
          className="l6-btn"
          aria-label="复位"
          onClick={() => {
            setAuto(false);
            setStep(0);
          }}
        >
          <Lbl long="↺ 复位" short="↺" />
        </button>
        <button className={`l6-btn ${showParams ? 'on' : ''}`} onClick={() => setShowParams((v) => !v)} aria-expanded={showParams}>
          参数 {showParams ? '▴' : '▾'}
        </button>
      </div>
      <div className="l6-controls">
        <span className="l6-seg" role="radiogroup" aria-label="参考零电位（ctrl_gnd_selector）">
          <span className="l6-seg-lbl">参考地</span>
          {GNDS.map((g) => (
            <button key={g} role="radio" aria-checked={gnd === g} className={gnd === g ? 'on' : ''} onClick={() => setGnd(g)} {...hoverProps(BAR_ID[g])}>
              <Lbl long={`${g} = 0 V`} short={g} />
            </button>
          ))}
        </span>
        <label className="l6-range step">
          <input type="range" min={0} max={4} step={1} value={step} onChange={(e) => setStep(Number(e.target.value))} aria-label="巡检进度" aria-valuetext={`Step ${step}`} />
          <b>Step {step}/4</b>
        </label>
      </div>
      {showParams && (
        <div className="l6-sliders">
          {sliders.map((sl) => (
            <label key={sl.key} className="l6-range">
              <span>{sl.label}</span>
              <input type="range" min={sl.min} max={sl.max} step={sl.stepBy} value={sl.val} onChange={(e) => sl.set(Number(e.target.value))} aria-label={sl.label} />
              <b>
                {fmt(sl.val)} {sl.unit}
              </b>
            </label>
          ))}
        </div>
      )}

      <svg viewBox="0 0 540 326" className={`l6-svg ${still ? 'still' : ''}`} role="img" aria-label={`闭合回路与电位剖面：巡检到第 ${step} 步，回路电流 ${fmt(s.i, 2)} A`}>
        <rect x="2" y="2" width="536" height="322" rx="12" className="l6-bg" />
        {/* ---------- circuit */}
        <g className="l6-wires">
          <path d={`M 70 236 L 70 172 M 70 124 L 70 58 L 132 58`} />
          <path d={`M 200 58 L 262 58 L 262 124 M 262 172 L 262 236 L 200 236 M 132 236 L 70 236`} />
          {c.V2 === 0 && <path d="M 262 124 L 262 172" />}
        </g>
        {/* walked trail and the whole loop path (lit) */}
        <path d="M 70 236 L 70 58 L 262 58 L 262 236 Z" className={`l6-loop ${on('kvl_probe_path') ? 'lit' : ''}`} {...hoverProps('kvl_probe_path')} />
        {step > 0 && <path d={trail} className="l6-trail" />}

        {/* R1 (top) */}
        <g className={`l6-elem r1 ${on(ELEM_ID.r1) ? 'lit' : ''}`} {...hoverProps(ELEM_ID.r1)}>
          <rect x="108" y="30" width="116" height="58" rx="8" className="l6-hl" />
          <path d={zigzag(132, 200, 58)} className="l6-res" />
          <text x="166" y="26" textAnchor="middle" className="l6-name">
            R₁ = {fmt(c.R1)} Ω
          </text>
          <text x="119" y="82" textAnchor="middle" className="l6-sign">
            {marks('r1')[0]}
          </text>
          <text x="213" y="82" textAnchor="middle" className="l6-sign">
            {marks('r1')[1]}
          </text>
          <text x="166" y="84" textAnchor="middle" className="l6-val">
            v₁ = {signed(s.v.r1)} V
          </text>
        </g>
        {/* R2 (bottom) */}
        <g className={`l6-elem r2 ${on(ELEM_ID.r2) ? 'lit' : ''}`} {...hoverProps(ELEM_ID.r2)}>
          <rect x="108" y="206" width="116" height="58" rx="8" className="l6-hl" />
          <path d={zigzag(132, 200, 236)} className="l6-res" />
          <text x="166" y="280" textAnchor="middle" className="l6-name">
            R₂ = {fmt(c.R2)} Ω
          </text>
          {/* R2 runs C → D clockwise: its "from" end is on the right */}
          <text x="213" y="220" textAnchor="middle" className="l6-sign">
            {marks('r2')[0]}
          </text>
          <text x="119" y="220" textAnchor="middle" className="l6-sign">
            {marks('r2')[1]}
          </text>
          <text x="166" y="216" textAnchor="middle" className="l6-val">
            v₂ = {signed(s.v.r2)} V
          </text>
        </g>
        {/* V1 (left) */}
        <g className={`l6-elem v1 ${on(ELEM_ID.v1) ? 'lit' : ''}`} {...hoverProps(ELEM_ID.v1)}>
          <circle cx="70" cy="148" r="24" className="l6-src" />
          <text x="70" y="141" textAnchor="middle" className="l6-sign in">
            {marks('v1')[1]}
          </text>
          <text x="70" y="165" textAnchor="middle" className="l6-sign in">
            {marks('v1')[0]}
          </text>
          <text x="102" y="146" className="l6-name">
            V₁
          </text>
          <text x="102" y="162" className="l6-val">
            {fmt(c.V1)} V
          </text>
        </g>
        {/* V2 (right) */}
        <g className={`l6-elem v2 ${on(ELEM_ID.v2) ? 'lit' : ''} ${c.V2 === 0 ? 'zero' : ''}`} {...hoverProps(ELEM_ID.v2)}>
          {c.V2 === 0 ? (
            <rect x="244" y="124" width="36" height="48" rx="6" className="l6-hl" />
          ) : (
            <>
              <circle cx="262" cy="148" r="24" className="l6-src" />
              <text x="262" y="141" textAnchor="middle" className="l6-sign in">
                {marks('v2')[0]}
              </text>
              <text x="262" y="165" textAnchor="middle" className="l6-sign in">
                {marks('v2')[1]}
              </text>
            </>
          )}
          <text x="230" y="146" textAnchor="end" className="l6-name">
            V₂
          </text>
          <text x="230" y="162" textAnchor="end" className="l6-val">
            {c.V2 === 0 ? '0 V（导线）' : `${fmt(c.V2)} V`}
          </text>
        </g>
        {/* current arrow on the top wire */}
        <g className="l6-current">
          <line x1={iDir > 0 ? 82 : 122} y1="58" x2={iDir > 0 ? 118 : 86} y2="58" strokeWidth={iw} />
          <path d={iDir > 0 ? 'M 126 58 L 116 52 L 116 64 Z' : 'M 78 58 L 88 52 L 88 64 Z'} />
          <text x="100" y="47" textAnchor="middle">
            i = {fmt(Math.abs(s.i), 2)} A
          </text>
        </g>
        {/* nodes */}
        {(['A', 'B', 'C', 'D'] as NodeId[]).map((n) => {
          const [x, yy] = NODE_XY[n];
          const top = n === 'A' || n === 'B';
          const left = n === 'A' || n === 'D';
          return (
            <g
              key={n}
              className={`l6-node ${NODE_TONE[n]} ${on(BAR_ID[n]) ? 'lit' : ''} ${GNDS.includes(n) ? 'pick' : ''}`}
              {...hoverProps(BAR_ID[n])}
              onClick={GNDS.includes(n) ? () => setGnd(n) : undefined}
            >
              <circle cx={x} cy={yy} r="9" className="l6-node-hit" />
              <circle cx={x} cy={yy} r="4.5" />
              <text x={x + (left ? -12 : 12)} y={yy + (top ? -24 : 18)} textAnchor={left ? 'end' : 'start'} className="l6-node-name">
                {n}
              </text>
              <text x={x + (left ? -12 : 12)} y={yy + (top ? -8 : 34)} textAnchor={left ? 'end' : 'start'} className="l6-node-pot">
                {signed(rel(n))}
              </text>
            </g>
          );
        })}
        <GndGlyph at={gnd} />
        {/* probe dot */}
        <circle r="7" className="l6-probe" style={{ transform: `translate(${px}px, ${py}px)` }} />

        {/* ---------- profile */}
        <line x1="300" y1="30" x2="300" y2="282" className="l6-divider" />
        <text x={(CH.x0 + CH.x1) / 2} y="22" textAnchor="middle" className="l6-ch-title">
          电位海拔剖面（V）
        </text>
        {ticks.map((v) => {
          return (
            <g key={v} className="l6-grid">
              <line x1={CH.x0} x2={CH.x1} y1={y(v)} y2={y(v)} />
              <text x={CH.x0 - 4} y={y(v) + 4} textAnchor="end">
                {fmt(v, 0)}
              </text>
            </g>
          );
        })}
        <line x1={CH.x0} x2={CH.x1} y1={y0} y2={y0} className={`l6-zero ${on('bar_node_d') ? 'lit' : ''}`} {...hoverProps('bar_node_d')} />
        {profile.map((v, k) => {
          const n = PATH[k];
          const shown = k <= step;
          const top = Math.min(y(v), y0);
          const h = Math.max(Math.abs(y(v) - y0), 3);
          const x = slotX(k);
          const id = BAR_ID[n];
          const [nx, ny] = NODE_XY[n];
          return (
            <g key={k} className={`l6-bar ${NODE_TONE[n]} ${shown ? 'shown' : 'ghost'} ${on(id) ? 'lit' : ''}`} {...hoverProps(id)}>
              {on(id) && k < 4 && <line x1={x} y1={y(v)} x2={nx} y2={ny} className="l6-proj" />}
              <rect x={x - 13} width="26" rx="3" style={{ y: shown ? top : y0 - 1.5, height: shown ? h : 3 } as CSSProperties} />
              {shown && (
                <text x={x} y={h > 22 ? (v >= 0 ? top + 15 : top + h - 6) : v >= 0 ? top - 5 : top + h + 13} textAnchor="middle" className={`l6-bar-val ${h > 22 ? 'inside' : ''}`}>
                  {fmt(v)}
                </text>
              )}
              <text x={x} y={CH.bottom + 36} textAnchor="middle" className="l6-bar-name">
                {k === 4 ? 'D（回）' : n}
              </text>
            </g>
          );
        })}
        {/* step bubbles: the change across each element crossed so far */}
        {climbed.map((d, j) => {
          const xa = slotX(j) + 13;
          const xb = slotX(j + 1) - 13;
          const ya = y(profile[j]);
          const yb = y(profile[j + 1]);
          const e = ELEMS[j];
          return (
            <g key={j} className={`l6-delta ${d >= 0 ? 'up' : 'down'} ${on(ELEM_ID[e.id]) ? 'lit' : ''}`} {...hoverProps(ELEM_ID[e.id])}>
              <path d={`M ${xa} ${ya} L ${xb} ${yb}`} />
              <rect x={(xa + xb) / 2 - 19} y={(ya + yb) / 2 - 9} width="38" height="17" rx="8.5" />
              <text x={(xa + xb) / 2} y={(ya + yb) / 2 + 4} textAnchor="middle">
                {signed(d)}
              </text>
            </g>
          );
        })}
        {/* readout strip */}
        <g className={`l6-strip ${closed ? 'closed' : ''}`} role="status">
          <rect x="8" y="294" width="524" height="26" rx="8" />
          <text x="20" y="312" className="l6-strip-main">
            {closed ? `回到 D：净变化 ${fmt(profile[4] - profile[0])} V · 能量守恒闭环确认` : `巡检光点在 ${PATH[step]}，已累计变化 ${signed(profile[step] - profile[0])} V`}
          </text>
          <text x="520" y="312" textAnchor="end" className="l6-strip-sum">
            压升之和 {fmt(rises)} V = 压降之和 {fmt(drops)} V
          </text>
        </g>
      </svg>
    </div>
  );
}
