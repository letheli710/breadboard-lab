// W2-L5 layer 02 · 分电路求解与分量累加台. Two presets: aiding (Sadiku Example 4.3: 6 V, 3 A up,
// 8 Ω, 4 Ω) and opposing (the act 6 challenge: 18 V, 3 A down, 4 Ω, 2 Ω). Tabs: the original
// circuit, sub-circuit 1 (only Vs, Is open), sub-circuit 2 (only Is, Vs shorted), and the
// algebraic sum (head-to-tail arrows on two number lines). Branch currents run as animated
// arrows; the readout panel holds v′, v″, v and i′, i″, i. The k slider scales every independent
// source (homogeneity, act 1). The opposing preset is the act 6 challenge, so its numbers stay
// covered until the guided example has reached them (w5_shown = steps solved) or the student
// asks. Stage params: w5_mode, w5_tab, w5_k, w5_shown.

import { useStageParam } from '../../stageStore';
import { AIDING, OPPOSING, fmt, superpose, type Solution } from './model';
import { Bubble, C, Dot, Flow, ISrc, L2, Obj, OpenGap, ShortWire, VSrc, Wire, useHot, useStepLayer, zigH, zigV } from './parts';
import './w2l5.css';

export type Tab = 'total' | 'sub1' | 'sub2' | 'sum';
type Mode = 'AIDING' | 'OPPOSING';

const TABS: { id: Tab; label: string; more: string }[] = [
  { id: 'total', label: '原电路', more: ' Total' },
  { id: 'sub1', label: '子电路 1', more: ' (仅 Vs)' },
  { id: 'sub2', label: '子电路 2', more: ' (仅 Is)' },
  { id: 'sum', label: '代数叠加对照', more: '' },
];

const TOP = 48;
const BOT = 168;
const MID = 108;
const XV = 48;
const XA = 222;
const XI = 372;

/** which pieces of the opposing preset are on show, by guided steps solved (5: all) */
function shownOf(mode: Mode, shown: number) {
  if (mode === 'AIDING') return { one: true, two: true, total: true, power: true };
  return { one: shown >= 2, two: shown >= 3, total: shown >= 4, power: shown >= 5 };
}

function Circuit({ tab, mode, sol, show, k }: { tab: Exclude<Tab, 'sum'>; mode: Mode; sol: Solution; show: boolean; k: number }) {
  const c = mode === 'AIDING' ? AIDING : OPPOSING;
  const vsOn = tab !== 'sub2';
  const isOn = tab !== 'sub1';
  const prime = tab === 'sub1' ? "'" : tab === 'sub2' ? "''" : '';
  const color = tab === 'sub1' ? C.vs : tab === 'sub2' ? C.is : C.total;
  const sub = mode === 'OPPOSING' ? 'ₒ' : '';
  const q = (x: number, unit: string) => (show ? `${fmt(x)} ${unit}` : `? ${unit}`);
  const up = c.Is > 0;
  return (
    <svg viewBox="0 0 420 200" className="w5-svg" role="img" aria-label={`${TABS.find((t) => t.id === tab)!.label} 电路图`}>
      <rect x="1" y="1" width="418" height="198" rx="10" className="w5-bg" />
      <Wire d={`M ${XV} ${TOP} H 92 M 152 ${TOP} H ${XI} M ${XV} ${BOT} H ${XI}`} />
      <Obj id={vsOn ? 'hl_vs' : 'hl_short'} box={[XV - 28, TOP + 6, 56, BOT - TOP - 12]}>
        {vsOn ? (
          <>
            <Wire d={`M ${XV} ${TOP} V ${MID - 19} M ${XV} ${MID + 19} V ${BOT}`} />
            <VSrc x={XV} y={MID} />
          </>
        ) : (
          <ShortWire x={XV} y1={TOP} y2={BOT} />
        )}
      </Obj>
      <text x={XV} y={BOT + 20} className="w5-lbl" textAnchor="middle" fill={C.vsT}>
        Vs = {fmt(c.Vs * k)} V
      </text>
      <Obj id="hl_r1" box={[88, TOP - 14, 68, 42]}>
        <polyline points={zigH(92, 152, TOP)} className="w5-res" />
        <text x={122} y={TOP + 24} className="w5-lbl" textAnchor="middle" fill={C.resT}>
          R₁ = {c.R1} Ω
        </text>
      </Obj>
      {show && <Flow x1={98} y1={TOP - 20} x2={146} y2={TOP - 20} I={sol.iR1} color={color} />}
      <Obj id="hl_r2" box={[XA - 70, 78, 136, 64]}>
        <Wire d={`M ${XA} ${TOP} V 80 M ${XA} 136 V ${BOT}`} />
        <polyline points={zigV(XA, 80, 136)} className="w5-res" />
        <text x={XA - 14} y={104} className="w5-lbl" textAnchor="end" fill={C.resT}>
          R₂ = {c.R2} Ω
        </text>
        <text x={XA - 14} y={120} className="w5-ref" fill="#5f626b" textAnchor="end">
          i{sub} 参考 ↓
        </text>
      </Obj>
      {show ? (
        <Flow x1={XA + 18} y1={86} x2={XA + 18} y2={130} I={sol.iR2} color={color} label={`i${sub}${prime} = ${fmt(sol.iR2)} A`} lx={XA + 28} ly={112} />
      ) : (
        <text x={XA + 22} y={112} className="w5-val" fill={color}>
          i{sub}
          {prime} = ? A
        </text>
      )}
      <Dot x={XA} y={TOP} />
      <Bubble x={XA + 8} y={TOP - 22} text={`v${sub}${prime} = ${q(sol.v, 'V')}`} color={C.ink} anchor="start" />
      <Obj id={isOn ? 'hl_is' : 'hl_open'} box={[XI - 52, TOP + 6, 72, BOT - TOP - 12]}>
        {isOn ? (
          <>
            <Wire d={`M ${XI} ${TOP} V ${MID - 19} M ${XI} ${MID + 19} V ${BOT}`} />
            <ISrc x={XI} y={MID} up={up} />
          </>
        ) : (
          <OpenGap x={XI} y1={TOP} y2={BOT} />
        )}
      </Obj>
      <text x={XI} y={BOT + 20} className="w5-lbl" textAnchor="middle" fill={C.isT}>
        Is = {fmt(Math.abs(c.Is) * k)} A {up ? '↑' : '↓'}
      </text>
    </svg>
  );
}

/** one number line: a′ then a″ head to tail above it, the total below it */
function NumberLine({ y, a, b, show, unit, sym }: { y: number; a: number; b: number; show: { one: boolean; two: boolean; total: boolean }; unit: string; sym: string }) {
  const t = a + b;
  const lo = Math.min(0, a, t, b) - 0.5;
  const hi = Math.max(0, a, t, b) + 0.5;
  const X0 = 30;
  const X1 = 390;
  const x = (v: number) => X0 + ((v - lo) / (hi - lo)) * (X1 - X0);
  const span = hi - lo;
  const step = span > 24 ? 5 : span > 10 ? 2 : span > 4 ? 1 : 0.5;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100);
  const arrow = (from: number, to: number, yy: number, color: string) => {
    if (Math.abs(to - from) < 1e-9) return <circle cx={x(from)} cy={yy} r={3} fill={color} />;
    const dir = to > from ? 1 : -1;
    const xe = x(to);
    return (
      <g>
        <line x1={x(from)} y1={yy} x2={xe - dir * 8} y2={yy} stroke={color} strokeWidth={4} strokeLinecap="round" />
        <polygon points={`${xe},${yy} ${xe - dir * 10},${yy - 6} ${xe - dir * 10},${yy + 6}`} fill={color} />
      </g>
    );
  };
  return (
    <g>
      <line x1={X0} y1={y} x2={X1} y2={y} stroke={C.wire} strokeWidth={1.4} />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={x(v)} y1={y - 4} x2={x(v)} y2={y + 4} stroke={C.wire} strokeWidth={v === 0 ? 2 : 1} />
          <text x={x(v)} y={y + 16} className="w5-tick" fill="#5f626b" textAnchor="middle">
            {fmt(v)}
          </text>
        </g>
      ))}
      <text x={X1 + 6} y={y + 4} className="w5-tick" fill="#5f626b" textAnchor="start">
        {unit}
      </text>
      {show.one ? arrow(0, a, y - 34, C.vs) : null}
      {show.two ? arrow(show.one ? a : 0, show.one ? t : b, y - 18, C.is) : null}
      <text x={X0} y={y - 46} className="w5-val" textAnchor="start" fill={C.vsT}>
        {sym}' = {show.one ? fmt(a) : '?'} {unit}
      </text>
      <text x={X0 + 88} y={y - 46} className="w5-val" textAnchor="start" fill={C.isT}>
        {sym}'' = {show.two ? fmt(b, true) : '?'} {unit}
      </text>
      <Obj id="hl_readout" box={[X0 + 172, y - 60, 196, 22]}>
        <text x={X0 + 180} y={y - 46} className="w5-val" textAnchor="start" fill={C.total}>
          {sym} = {sym}' + {sym}'' = {show.total ? fmt(t) : '?'} {unit}
        </text>
      </Obj>
      {show.total ? arrow(0, t, y + 30, C.total) : null}
    </g>
  );
}

export default function AccumulatorLayer() {
  useStepLayer(L2);
  const [tab, setTab] = useStageParam<Tab>('w5_tab', 'total');
  const [mode, setMode] = useStageParam<Mode>('w5_mode', 'AIDING');
  const [k, setK] = useStageParam('w5_k', 1);
  const [shown, setShown] = useStageParam('w5_shown', 0);
  const c = mode === 'AIDING' ? AIDING : OPPOSING;
  const s = superpose(c, k);
  const sh = shownOf(mode, shown);
  const sub = mode === 'OPPOSING' ? 'ₒ' : '';
  const cell = (x: number, unit: string, on: boolean, signed = false) => (on ? `${fmt(x, signed)} ${unit}` : '?');
  const colOn = (col: 'sub1' | 'sub2' | 'total') => tab === col || tab === 'sum';
  const masked = mode === 'OPPOSING' && shown < 5;
  const scale = useHot('hl_scale');
  const readout = useHot('hl_readout');

  return (
    <div className="w5-layer">
      <div className="w5-controls">
        <div className="w5-seg" role="tablist" aria-label="子电路">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
              {t.label}
              <small>{t.more}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="w5-controls">
        <div className="w5-seg small" role="radiogroup" aria-label="电流源方向">
          <button role="radio" aria-checked={mode === 'AIDING'} className={mode === 'AIDING' ? 'on' : ''} onClick={() => setMode('AIDING')}>
            同向增强<small> · Ex 4.3</small>
          </button>
          <button role="radio" aria-checked={mode === 'OPPOSING'} className={mode === 'OPPOSING' ? 'on' : ''} onClick={() => setMode('OPPOSING')}>
            反向抵消<small> · 第 6 幕</small>
          </button>
        </div>
        <label className={`w5-k ${scale.lit ? 'lit' : ''}`} {...scale.on}>
          齐次性 k
          <input type="range" min={0} max={3} step={0.5} value={k} onChange={(e) => setK(Number(e.target.value))} aria-label="所有独立源同乘 k" />
          <b>×{fmt(k)}</b>
        </label>
      </div>

      <div className="w5-svgwrap">
        {tab === 'sum' ? (
          <svg viewBox="0 0 420 214" className="w5-svg" role="img" aria-label="代数叠加对照：分量首尾相接">
            <rect x="1" y="1" width="418" height="212" rx="10" className="w5-bg" />
            <NumberLine y={72} a={s.one.iR2} b={s.two.iR2} show={sh} unit="A" sym={`i${sub}`} />
            <NumberLine y={170} a={s.one.v} b={s.two.v} show={sh} unit="V" sym={`v${sub}`} />
          </svg>
        ) : (
          <Circuit
            tab={tab}
            mode={mode}
            sol={tab === 'sub1' ? s.one : tab === 'sub2' ? s.two : s.total}
            show={tab === 'sub1' ? sh.one : tab === 'sub2' ? sh.two : sh.total}
            k={k}
          />
        )}
      </div>

      <div className={`w5-readout ${readout.lit ? 'lit' : ''}`} {...readout.on}>
        <div className="w5-rgrid" role="table" aria-label="分量累加读数">
          <div className="w5-rrow w5-rhead" role="row">
            <span role="columnheader" className="c1">
              子电路 1（仅 Vs）
            </span>
            <span role="columnheader" className="c2">
              子电路 2（仅 Is）
            </span>
            <span role="columnheader" className="c3">
              代数叠加
            </span>
          </div>
          {(
            [
              ['v', 'V', s.one.v, s.two.v, s.total.v],
              ['i', 'A', s.one.iR2, s.two.iR2, s.total.iR2],
            ] as const
          ).map(([q, unit, a, b, t]) => (
            <div key={q} className="w5-rrow" role="row">
              <span role="cell" className={`c1 ${colOn('sub1') ? 'on' : ''}`}>
                {q}
                {sub}' = {cell(a, unit, sh.one)}
              </span>
              <span role="cell" className={`c2 ${colOn('sub2') ? 'on' : ''}`}>
                {q}
                {sub}'' = {cell(b, unit, sh.two, true)}
              </span>
              <span role="cell" className={`c3 ${colOn('total') ? 'on' : ''}`}>
                {q}
                {sub} = {cell(t, unit, sh.total)}
              </span>
            </div>
          ))}
        </div>
        <div className="w5-readout-foot">
          {masked ? (
            <button className="w5-btn" onClick={() => setShown(5)}>
              揭晓数值（第 6 幕实战题，先自己做）
            </button>
          ) : (
            <span>
              R₂ 功率 p = i{sub}²R₂ = {cell(s.total.pR2, 'W', sh.power)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
