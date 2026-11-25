// Layer "01 2D 戴维南带载原理图": the Thévenin source V_Th with R_Th inside a dashed black box,
// port a–b, and the variable load R_L (slider-driven, arrow across it). Moving dots show the loop
// current (speed ∝ I_L); the readouts under the drawing give I_L, V_L, P_L, the heat in R_Th, η
// and P_max. The black box can show the original two-source network of act 3 or of the guided
// example instead of its equivalent; while the guided example runs, the values not found yet
// stay "?".

import type { ReactNode } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { Dock, hoverProps, ScaleNotice, useCircuit, useClearHoverOnUnmount, useIsLit, type Circuit } from './state';
import { fmtI, fmtP, fmtPct, fmtR, fmtV, LAB } from './model';

const TOP = 80;
const BOT = 230;
const PORT_X = 372;
const LOAD_X = 480;

const zigH = (x1: number, x2: number, y: number, n = 6, a = 10) =>
  [x1, ...Array.from({ length: n }, (_, i) => x1 + ((i + 0.5) / n) * (x2 - x1)), x2]
    .map((x, i, all) => `${x.toFixed(1)},${i === 0 || i === all.length - 1 ? y : y + (i % 2 ? -a : a)}`)
    .join(' ');
const zigV = (x: number, y1: number, y2: number, n = 6, a = 11) =>
  [y1, ...Array.from({ length: n }, (_, i) => y1 + ((i + 0.5) / n) * (y2 - y1)), y2]
    .map((y, i, all) => `${i === 0 || i === all.length - 1 ? x : x + (i % 2 ? -a : a)},${y.toFixed(1)}`)
    .join(' ');

function Part({ id, cls, children, label }: { id: string; cls: string; children: ReactNode; label?: string }) {
  return (
    <g className={`w8-part ${cls}`} data-hl={id} {...hoverProps([id])} tabIndex={0} role="img" aria-label={label}>
      {children}
    </g>
  );
}

function VSource({ x, y, r = 26, name, value, id, lit }: { x: number; y: number; r?: number; name: string; value: string; id: string; lit: string }) {
  return (
    <Part id={id} cls={lit} label={`${name} ${value}`}>
      <line x1={x} y1={TOP} x2={x} y2={y - r} className="w8-wire" />
      <line x1={x} y1={y + r} x2={x} y2={BOT} className="w8-wire" />
      <circle cx={x} cy={y} r={r} className="w8-src" />
      <text x={x} y={y - 6} className="w8-sign">
        +
      </text>
      <text x={x} y={y + 15} className="w8-sign">
        −
      </text>
      <text x={x - r - 6} y={y - 4} className="w8-name end">
        {name}
      </text>
      <text x={x - r - 6} y={y + 13} className="w8-val end">
        {value}
      </text>
    </Part>
  );
}

function ISource({ x, name, value, id, lit }: { x: number; name: string; value: string; id: string; lit: string }) {
  const y = 155;
  return (
    <Part id={id} cls={`${lit} isrc`} label={`${name} ${value}（由地向上注入）`}>
      <line x1={x} y1={TOP} x2={x} y2={y - 20} className="w8-wire" />
      <line x1={x} y1={y + 20} x2={x} y2={BOT} className="w8-wire" />
      <circle cx={x} cy={y} r={20} className="w8-src isrc" />
      <path d={`M ${x} ${y + 12} L ${x} ${y - 10} M ${x - 6} ${y - 3} L ${x} ${y - 11} L ${x + 6} ${y - 3}`} className="w8-iarrow" />
      <text x={x + 25} y={y - 3} className="w8-name">
        {name}
      </text>
      <text x={x + 25} y={y + 13} className="w8-val">
        {value}
      </text>
    </Part>
  );
}

function ResH({ x1, x2, name, value, id, lit }: { x1: number; x2: number; name: string; value: string; id: string; lit: string }) {
  return (
    <Part id={id} cls={lit} label={`${name} ${value}`}>
      <polyline points={zigH(x1, x2, TOP)} className="w8-zig-hit" />
      <polyline points={zigH(x1, x2, TOP)} className="w8-zig" />
      <text x={(x1 + x2) / 2} y={TOP - 18} className="w8-name mid">
        {name} <tspan className="w8-val">{value}</tspan>
      </text>
    </Part>
  );
}

function ResV({ x, name, value, id, lit }: { x: number; name: string; value: string; id: string; lit: string }) {
  return (
    <Part id={id} cls={lit} label={`${name} ${value}`}>
      <line x1={x} y1={TOP} x2={x} y2={122} className="w8-wire" />
      <polyline points={zigV(x, 122, 190)} className="w8-zig-hit" />
      <polyline points={zigV(x, 122, 190)} className="w8-zig" />
      <line x1={x} y1={190} x2={x} y2={BOT} className="w8-wire" />
      <text x={x - 16} y={152} className="w8-name end">
        {name}
      </text>
      <text x={x - 16} y={169} className="w8-val end">
        {value}
      </text>
    </Part>
  );
}

/** The inside of the black box: the equivalent, or one of the two original networks. */
function BoxInside({ c }: { c: Circuit }) {
  const on = useIsLit();
  const show = (k: number, v: string) => (c.reveal >= k ? v : '?');
  if (c.mode === 'lab' || c.view === 'eq') {
    const v = c.mode === 'lab' ? '5 V' : show(2, `${c.src.vth} V`);
    const r = c.mode === 'lab' ? '1 kΩ' : show(1, `${c.src.rth} Ω`);
    return (
      <>
        <line x1={90} y1={TOP} x2={170} y2={TOP} className="w8-wire" />
        <line x1={250} y1={TOP} x2={PORT_X} y2={TOP} className="w8-wire" />
        <line x1={90} y1={BOT} x2={PORT_X} y2={BOT} className="w8-wire" />
        <VSource x={90} y={155} name="V_Th" value={v} id="vth" lit={on('vth')} />
        <ResH x1={170} x2={250} name="R_Th" value={`= ${r}`} id="rth" lit={on('rth')} />
      </>
    );
  }
  const gd = c.kase === 'gd';
  const n = gd
    ? { vs: '18 V', r1: '6 Ω', r2: '3 Ω', r3: '4 Ω', is: '3 A', isX: 206, r3x: [240, 300] }
    : { vs: '12 V', r1: '6 Ω', r2: '12 Ω', r3: '4 Ω', is: '1 A', isX: 296, r3x: [184, 244] };
  return (
    <>
      <line x1={48} y1={TOP} x2={72} y2={TOP} className="w8-wire" />
      <line x1={132} y1={TOP} x2={n.r3x[0]} y2={TOP} className="w8-wire" />
      <line x1={n.r3x[1]} y1={TOP} x2={PORT_X} y2={TOP} className="w8-wire" />
      <line x1={48} y1={BOT} x2={PORT_X} y2={BOT} className="w8-wire" />
      <VSource x={48} y={155} r={20} name="" value="" id="net_vs" lit={on('net_vs')} />
      <text x={58} y={204} className="w8-name">
        V_s
      </text>
      <text x={58} y={220} className="w8-val">
        {n.vs}
      </text>
      <ResH x1={72} x2={132} name="R1" value={n.r1} id="net_r1" lit={on('net_r1')} />
      <circle cx={156} cy={TOP} r={4.5} className="w8-node" />
      <text x={164} y={TOP + 18} className="w8-node-label">
        A
      </text>
      <ResV x={156} name="R2" value={n.r2} id="net_r2" lit={on('net_r2')} />
      <ResH x1={n.r3x[0]} x2={n.r3x[1]} name="R3" value={n.r3} id="net_r3" lit={on('net_r3')} />
      <ISource x={n.isX} name="I_s" value={n.is} id="net_is" lit={on('net_is')} />
    </>
  );
}

function Readout({ id, name, value, hint }: { id: string; name: string; value: string; hint?: string }) {
  const on = useIsLit()(id);
  return (
    <div className={`w8-cell ${on}`} data-hl={id} {...hoverProps([id])} tabIndex={0}>
      <span>{name}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export default function Schematic() {
  const c = useCircuit();
  const on = useIsLit();
  useClearHoverOnUnmount();
  const s = c.sol;
  const all = c.reveal >= 9;
  const rlShown = c.reveal >= 3 || all;
  const eqView = c.mode === 'lab' || c.view === 'eq';
  const ratio = Math.max(0.02, s.il / (s.vth / s.rth));
  const still = prefersReducedMotion();
  const flow = eqView
    ? `M 90 129 L 90 ${TOP} L ${LOAD_X} ${TOP} L ${LOAD_X} ${BOT} L 90 ${BOT} L 90 181`
    : `M ${PORT_X} ${TOP} L ${LOAD_X} ${TOP} L ${LOAD_X} ${BOT} L ${PORT_X} ${BOT}`;
  const boxTitle =
    c.mode === 'lab' ? '左侧固定网络（面包板：5 V 电源 + 1 kΩ）' : eqView ? '左侧固定网络（戴维南等效电路）' : `左侧原网络（${c.kase === 'gd' ? '引导例题' : '第三幕例题'}）`;
  const q = (v: string) => (all ? v : '?');
  return (
    <div className="w8-layer">
      <Dock
        c={c}
        extra={
          <>
            {c.mode === 'theory' && (
              <div className="w8-seg small" role="radiogroup" aria-label="黑盒内部">
                <button role="radio" aria-checked={c.view === 'eq'} className={c.view === 'eq' ? 'on' : ''} onClick={() => c.set({ view: 'eq' })}>
                  <span className="full">黑盒：戴维南等效</span>
                  <span className="short">等效</span>
                </button>
                <button role="radio" aria-checked={c.view === 'net'} className={c.view === 'net' ? 'on' : ''} onClick={() => c.set({ view: 'net' })}>
                  <span className="full">黑盒：原网络</span>
                  <span className="short">原网络</span>
                </button>
              </div>
            )}
            {!all && (
              <button className="w8-fold" onClick={() => c.set({ reveal: 9 })} title="引导例题进行中：等效参数待你求出">
                揭晓等效结果
              </button>
            )}
          </>
        }
      />
      <div className="w8-sch-wrap">
        <svg viewBox="0 0 640 296" className="w8-sch" role="img" aria-label={`戴维南带载原理图：R_L = ${fmtR(c.rl, c.mode)}`}>
          {/* the black box: port a–b sits on its edge */}
          <g className={`w8-box ${on('port_ab')}`} data-hl="port_ab" {...hoverProps(['port_ab'])}>
            <rect x="14" y="30" width="344" height="232" rx="10" />
            <text x="28" y="254" className="w8-boxtitle">
              {boxTitle}
            </text>
          </g>
          <BoxInside c={c} />
          {!eqView && (
            <text x="186" y="284" className={`w8-eqline ${on('vth', 'rth')}`}>
              从 a–b 看进去 ⇒ V_Th = {c.reveal >= 2 ? `${c.src.vth} V` : '?'}，R_Th = {c.reveal >= 1 ? `${c.src.rth} Ω` : '?'}
            </text>
          )}
          {/* port a–b and the load */}
          <line x1={PORT_X} y1={TOP} x2={LOAD_X} y2={TOP} className="w8-wire" />
          <line x1={PORT_X} y1={BOT} x2={LOAD_X} y2={BOT} className="w8-wire" />
          {!still && <path d={flow} className="w8-flow" style={{ animationDuration: `${(0.7 / ratio).toFixed(2)}s` }} />}
          <g className={`w8-port ${on('port_ab')}`} {...hoverProps(['port_ab'])}>
            <circle cx={PORT_X} cy={TOP} r="5.5" />
            <circle cx={PORT_X} cy={BOT} r="5.5" />
            <text x={PORT_X} y={TOP - 12}>
              a
            </text>
            <text x={PORT_X} y={BOT + 22}>
              b
            </text>
          </g>
          <g className={`w8-part ${on('il')}`} data-hl="il" {...hoverProps(['il'])}>
            <path d={`M ${PORT_X + 22} ${TOP - 14} L ${PORT_X + 76} ${TOP - 14}`} className="w8-iline" />
            <path d={`M ${PORT_X + 68} ${TOP - 19} L ${PORT_X + 77} ${TOP - 14} L ${PORT_X + 68} ${TOP - 9}`} className="w8-iline" />
            <text x={PORT_X + 49} y={TOP - 22} className="w8-name mid il">
              I_L = {q(fmtI(s.il, c.mode))}
            </text>
          </g>
          <Part id="rl" cls={`${on('rl')} load ${s.matched && all ? 'matched' : ''}`} label={`可调负载 R_L = ${fmtR(c.rl, c.mode)}`}>
            <line x1={LOAD_X} y1={TOP} x2={LOAD_X} y2={112} className="w8-wire" />
            <polyline points={zigV(LOAD_X, 112, 198)} className="w8-zig-hit" />
            <polyline points={zigV(LOAD_X, 112, 198)} className="w8-zig load" />
            <line x1={LOAD_X} y1={198} x2={LOAD_X} y2={BOT} className="w8-wire" />
            <path d={`M ${LOAD_X - 26} ${190} L ${LOAD_X + 26} ${120}`} className="w8-varrow" />
            <path d={`M ${LOAD_X + 15} ${122} L ${LOAD_X + 27} ${118} L ${LOAD_X + 25} ${131}`} className="w8-varrow" />
            <text x={LOAD_X + 34} y={150} className="w8-name load">
              R_L（可调）
            </text>
            <text x={LOAD_X + 34} y={170} className="w8-val load">
              {rlShown ? fmtR(c.rl, c.mode) : '?'}
            </text>
          </Part>
          <g className={`w8-part ${on('vl')}`} data-hl="vl" {...hoverProps(['vl'])}>
            <text x={LOAD_X - 48} y={124} className="w8-vl">
              +
            </text>
            <text x={LOAD_X - 48} y={160} className="w8-vl">
              V_L
            </text>
            <text x={LOAD_X - 48} y={178} className="w8-vl small">
              {q(fmtV(s.vl))}
            </text>
            <text x={LOAD_X - 48} y={208} className="w8-vl">
              −
            </text>
          </g>
          {s.matched && all && (
            <g className="w8-matched">
              <rect x={LOAD_X + 30} y={186} width="122" height="24" rx="6" />
              <text x={LOAD_X + 91} y={202}>
                MATCHED: P_max
              </text>
            </g>
          )}
          <g className="w8-sticky">
            <rect x={398} y={250} width={236} height={26} rx="6" />
            <text x={516} y={267}>
              两端归零：R_L→0 (V_L=0) | R_L→∞ (I_L=0)
            </text>
          </g>
        </svg>
      </div>
      <div className="w8-cells">
        <Readout id="il" name="回路电流 I_L" value={q(fmtI(s.il, c.mode))} />
        <Readout id="vl" name="负载电压 V_L" value={q(fmtV(s.vl))} />
        <Readout id="pl" name="负载功率 P_L" value={q(fmtP(s.pl, c.mode))} />
        <Readout id="pth" name="内阻发热 P_Th" value={q(fmtP(s.pth, c.mode))} />
        <Readout id="eta" name="效率 η" value={q(fmtPct(s.eta))} />
        <Readout id="pmax" name="峰值 P_max" value={q(fmtP(s.pmax, c.mode))} hint={all ? `R_L = ${fmtR(c.mode === 'lab' ? LAB.rth : c.src.rth, c.mode)}` : undefined} />
      </div>
      <ScaleNotice c={c} />
    </div>
  );
}
