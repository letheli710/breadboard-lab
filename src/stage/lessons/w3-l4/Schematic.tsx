// Layer "01 2D 同相放大与分压反馈原理图": the non-inverting amplifier (v_i on IN+, R_1 from v− to
// ground, R_f from the output back to v−) with sliders for R_1, R_f and v_i, and the readouts A_v,
// the ideal v_o and the LM358's real v_o on the chosen supply (±9 V or single +9 V). A switch
// lights the R_f–R_1 divider chain; R_f = 0 shows the follower badge; a clipped output raises the
// saturation alarm with v− ≠ v+. The same layer draws Sadiku Example 5.5 (6 V via 4 kΩ into IN−,
// 4 V on IN+, R_f = 10 kΩ); while the guided example runs, the values not found yet read "?".
// A voltage gauge on the right shows the supply rails, the linear window and v_o.

import type { ReactNode } from 'react';
import { useStageParam } from '../../stageStore';
import { Cell, hoverProps, SupplySeg, useClearHoverOnUnmount, useEx55Reveal, useIsLit, useSupply } from './state';
import { EX55, fmtI, fmtR, fmtV, mixed, nonInverting, WINDOW, type Supply } from './model';

const TOP = 58; // R_f wire
const NEG = 125; // IN− wire
const POS = 195; // IN+ wire
const OUT = 160; // output wire
const OA = 270; // op-amp left edge
const OX = 440; // output node (R_f comes down here)

const zigH = (x1: number, x2: number, y: number, n = 6, a = 9) =>
  [x1, ...Array.from({ length: n }, (_, i) => x1 + ((i + 0.5) / n) * (x2 - x1)), x2]
    .map((x, i, all) => `${x.toFixed(1)},${i === 0 || i === all.length - 1 ? y : y + (i % 2 ? -a : a)}`)
    .join(' ');
const zigV = (x: number, y1: number, y2: number, n = 6, a = 10) =>
  [y1, ...Array.from({ length: n }, (_, i) => y1 + ((i + 0.5) / n) * (y2 - y1)), y2]
    .map((y, i, all) => `${i === 0 || i === all.length - 1 ? x : x + (i % 2 ? -a : a)},${y.toFixed(1)}`)
    .join(' ');

function Part({ id, cls = '', children, label }: { id: string; cls?: string; children: ReactNode; label?: string }) {
  const on = useIsLit()(id);
  return (
    <g className={`w34-part ${cls} ${on}`} data-hl={id} {...hoverProps([id])} tabIndex={0} role="img" aria-label={label}>
      {children}
    </g>
  );
}

function Ground({ x, y }: { x: number; y: number }) {
  return (
    <g className="w34-gnd">
      <line x1={x - 13} y1={y} x2={x + 13} y2={y} />
      <line x1={x - 8} y1={y + 6} x2={x + 8} y2={y + 6} />
      <line x1={x - 3} y1={y + 12} x2={x + 3} y2={y + 12} />
    </g>
  );
}

function Source({ x, y, id, name, value, cls = '' }: { x: number; y: number; id: string; name: string; value: string; cls?: string }) {
  return (
    <Part id={id} cls={cls} label={`${name} ${value}`}>
      <circle cx={x} cy={y} r={20} className="w34-src" />
      <text x={x} y={y - 4} className="w34-sign">
        +
      </text>
      <text x={x} y={y + 14} className="w34-sign">
        −
      </text>
      <text x={x - 26} y={y - 2} className="w34-name end">
        {name}
      </text>
      <text x={x - 26} y={y + 15} className="w34-val end">
        {value}
      </text>
    </Part>
  );
}

/** −9 … +9 V → y */
const gy = (v: number) => 150 - (Math.max(-9.6, Math.min(9.6, v)) * 110) / 9;

function Gauge({ supply, vo, ideal, show }: { supply: Supply; vo: number; ideal: number; show: boolean }) {
  const on = useIsLit();
  const [lo, hi] = WINDOW[supply];
  const x = 522;
  const clipped = show && Math.abs(ideal - vo) > 1e-6;
  return (
    <g className={`w34-gauge ${on('sat', 'psu')}`} data-hl="sat" {...hoverProps(['sat'])}>
      <rect x={x} y={gy(9)} width={16} height={gy(-9) - gy(9)} rx={4} className="w34-g-track" />
      <rect x={x + 1} y={gy(hi)} width={14} height={gy(lo) - gy(hi)} rx={3} className="w34-g-win" />
      {[9, hi, 0, lo, -9].map((v, i) => (
        <g key={i}>
          <line x1={x - 4} x2={x + 20} y1={gy(v)} y2={gy(v)} className={`w34-g-tick ${Math.abs(v) === 9 ? 'rail' : v === 0 ? 'zero' : 'lim'}`} />
          {!(supply === 'single' && i === 3) && (
            <text x={x + 24} y={gy(v) + 4} className="w34-g-lab">
              {v === 0 ? '0' : `${v > 0 ? '+' : '−'}${Math.abs(v) === 9 ? '9' : Math.abs(v).toFixed(1)}`}
            </text>
          )}
        </g>
      ))}
      {supply === 'single' && (
        <text x={x + 24} y={gy(-9) + 4} className="w34-g-lab gndlab">
          (GND)
        </text>
      )}
      {clipped && <line x1={x - 8} x2={x + 24} y1={gy(ideal)} y2={gy(ideal)} className="w34-g-ideal" />}
      {show && (
        <g className="w34-g-mark">
          <path d={`M ${x - 10} ${gy(vo) - 6} L ${x - 1} ${gy(vo)} L ${x - 10} ${gy(vo) + 6} Z`} />
        </g>
      )}
      <text x={x + 8} y={gy(9) - 10} className="w34-g-title">
        v_o
      </text>
    </g>
  );
}

function NiCircuit({ r1, rf, vi, supply, divider }: { r1: number; rf: number; vi: number; supply: Supply; divider: boolean }) {
  const on = useIsLit();
  const n = nonInverting(vi, r1, rf, supply);
  const follower = rf === 0;
  const dim = divider ? 'dim' : '';
  return (
    <>
      {divider && (
        <path
          d={`M ${OX} ${OUT} L ${OX} ${TOP} L 225 ${TOP} L 225 ${NEG} L 100 ${NEG} L 100 250`}
          className={`w34-chain ${on('divider')}`}
          data-hl="divider"
          {...hoverProps(['divider'])}
        />
      )}
      {/* IN− side: R_1 to ground, the node v− */}
      <line x1={100} y1={NEG} x2={OA} y2={NEG} className="w34-wire" />
      <Part id="r1" label={`R_1 = ${fmtR(r1)}`}>
        <line x1={100} y1={NEG} x2={100} y2={150} className="w34-wire" />
        <polyline points={zigV(100, 150, 214)} className="w34-zig-hit" />
        <polyline points={zigV(100, 150, 214)} className="w34-zig r1" />
        <line x1={100} y1={214} x2={100} y2={250} className="w34-wire" />
        <text x={118} y={178} className="w34-name r1">
          R_1
        </text>
        <text x={118} y={196} className="w34-val">
          {fmtR(r1)}
        </text>
      </Part>
      <Ground x={100} y={250} />
      <Part id="vminus" label={`反相端 v− = ${fmtV(n.vminus)}`}>
        <circle cx={225} cy={NEG} r={5} className="w34-node amber" />
        <text x={262} y={143} className="w34-bubble end amber">
          v− = {fmtV(n.vminus)}
        </text>
      </Part>
      {/* R_f from the output back to v− */}
      <Part id="rf" label={follower ? 'R_f = 0（短接线）' : `R_f = ${fmtR(rf)}`}>
        <line x1={225} y1={NEG} x2={225} y2={TOP} className="w34-wire" />
        <line x1={225} y1={TOP} x2={275} y2={TOP} className="w34-wire" />
        {follower ? (
          <line x1={275} y1={TOP} x2={355} y2={TOP} className="w34-short" />
        ) : (
          <>
            <polyline points={zigH(275, 355, TOP)} className="w34-zig-hit" />
            <polyline points={zigH(275, 355, TOP)} className="w34-zig rf" />
          </>
        )}
        <line x1={355} y1={TOP} x2={OX} y2={TOP} className="w34-wire" />
        <line x1={OX} y1={TOP} x2={OX} y2={OUT} className="w34-wire" />
        <text x={315} y={TOP - 15} className="w34-name rf mid">
          R_f = {follower ? '0（短接线）' : fmtR(rf)}
        </text>
      </Part>
      <g className={`w34-part ${on('ifb')} ${dim}`} data-hl="ifb" {...hoverProps(['ifb'])}>
        <path d={`M 345 ${TOP + 16} L 290 ${TOP + 16} M 297 ${TOP + 11} L 289 ${TOP + 16} L 297 ${TOP + 21}`} className="w34-iarrow" />
        <text x={318} y={TOP + 33} className="w34-cur mid">
          i_f = i_1 = {fmtI(n.i1)}
        </text>
      </g>
      {/* the op amp */}
      <Part id="opamp" cls={dim} label="运放（LM358 的运放 A）">
        <polygon points={`${OA},95 ${OA},225 380,${OUT}`} className="w34-amp" />
        <text x={OA + 9} y={NEG + 6} className="w34-pm neg">
          −
        </text>
        <text x={OA + 9} y={POS + 6} className="w34-pm pos">
          +
        </text>
        <text x={OA + 30} y={OUT + 5} className="w34-amp-lab">
          LM358
        </text>
        <text x={OA + 16} y={NEG + 22} className="w34-tiny">
          i− = 0
        </text>
      </Part>
      <g className={`w34-part ${on('psu')} ${dim}`} data-hl="psu" {...hoverProps(['psu'])}>
        <line x1={325} y1={128} x2={325} y2={106} className="w34-rail pos" />
        <text x={331} y={110} className="w34-tiny rail">
          +9 V
        </text>
        <line x1={325} y1={192} x2={325} y2={214} className="w34-rail neg" />
        <text x={331} y={214} className="w34-tiny rail">
          {supply === 'dual' ? '−9 V' : 'GND'}
        </text>
      </g>
      {/* IN+ side: the input */}
      <g className={dim}>
        <Part id="vi" cls="in" label={`输入 v_i = ${fmtV(vi)}`}>
          <line x1={180} y1={216} x2={180} y2={POS} className="w34-wire in" />
          <line x1={180} y1={POS} x2={OA} y2={POS} className="w34-wire in" />
          <circle cx={180} cy={236} r={20} className="w34-src in" />
          <text x={180} y={232} className="w34-sign">
            +
          </text>
          <text x={180} y={250} className="w34-sign">
            −
          </text>
          <text x={154} y={234} className="w34-name in end">
            v_i
          </text>
          <text x={154} y={251} className="w34-val end">
            {fmtV(vi)}
          </text>
          <text x={228} y={POS - 8} className="w34-bubble mid in">
            v+ = {fmtV(vi)}
          </text>
        </Part>
        <line x1={180} y1={256} x2={180} y2={262} className="w34-wire" />
        <Ground x={180} y={262} />
        <g className={`w34-part ${on('iplus')}`} data-hl="iplus" {...hoverProps(['iplus'])}>
          <text x={232} y={POS + 18} className="w34-tiny mid cyan">
            i+ = 0（虚断）
          </text>
        </g>
      </g>
      {/* output */}
      <Part id="vo" cls={n.sat ? 'sat' : ''} label={`输出 v_o = ${fmtV(n.vo)}`}>
        <line x1={380} y1={OUT} x2={478} y2={OUT} className="w34-wire out" />
        <circle cx={OX} cy={OUT} r={4.5} className="w34-node out" />
        <circle cx={478} cy={OUT} r={5} className="w34-term out" />
        <text x={478} y={OUT - 14} className="w34-name out mid">
          v_o
        </text>
        <text x={478} y={OUT + 24} className="w34-val out mid">
          {fmtV(n.vo)}
        </text>
      </Part>
      {divider && (
        <g className={`w34-chainnote ${on('divider')}`} {...hoverProps(['divider'])}>
          <rect x={284} y={228} width={226} height={66} rx={8} />
          <text x={294} y={246}>
            分压链（i− = 0）：
          </text>
          <text x={294} y={265}>
            v− = R_1/(R_1 + R_f) · v_o
          </text>
          <text x={294} y={284}>
            = {(r1 / (r1 + rf)).toFixed(3)} × {fmtV(n.vo)} = {fmtV(n.vminus)}
          </text>
        </g>
      )}
      <Gauge supply={supply} vo={n.vo} ideal={n.ideal} show />
    </>
  );
}

function Ex55Circuit({ supply, reveal }: { supply: Supply; reveal: number }) {
  const on = useIsLit();
  const m = mixed(supply);
  const q = (k: number, v: string) => (reveal >= k ? v : '?');
  return (
    <>
      <text x={14} y={24} className="w34-title">
        Sadiku Example 5.5（Fig. 5.19）：V_s1 经 R_1 进反相端，V_s2 直连同相端
      </text>
      {/* V_s1 via R_1 */}
      <Source x={74} y={190} id="vs1" name="V_s1" value={`${EX55.vs1} V`} />
      <line x1={74} y1={170} x2={74} y2={NEG} className="w34-wire" />
      <line x1={74} y1={NEG} x2={110} y2={NEG} className="w34-wire" />
      <line x1={74} y1={210} x2={74} y2={250} className="w34-wire" />
      <Ground x={74} y={250} />
      <Part id="r1" label={`R_1 = ${fmtR(EX55.r1)}`}>
        <polyline points={zigH(110, 190, NEG)} className="w34-zig-hit" />
        <polyline points={zigH(110, 190, NEG)} className="w34-zig r1" />
        <text x={150} y={NEG - 17} className="w34-name r1 mid">
          R_1 = {fmtR(EX55.r1)}
        </text>
      </Part>
      <line x1={190} y1={NEG} x2={OA} y2={NEG} className="w34-wire" />
      <g className={`w34-part ${on('i1')}`} data-hl="i1" {...hoverProps(['i1'])}>
        <path d={`M 122 ${NEG + 18} L 176 ${NEG + 18} M 169 ${NEG + 13} L 177 ${NEG + 18} L 169 ${NEG + 23}`} className="w34-iarrow" />
        <text x={150} y={NEG + 36} className="w34-cur mid">
          i_1 = {q(2, fmtI(m.i1))}
        </text>
      </g>
      <Part id="vminus" label="反相端节点 v−">
        <circle cx={225} cy={NEG} r={5} className="w34-node amber" />
        <text x={262} y={143} className="w34-bubble end amber">
          v− = {q(1, fmtV(m.vminus))}
        </text>
      </Part>
      <Part id="rf" label={`R_f = ${fmtR(EX55.rf)}`}>
        <line x1={225} y1={NEG} x2={225} y2={TOP} className="w34-wire" />
        <line x1={225} y1={TOP} x2={275} y2={TOP} className="w34-wire" />
        <polyline points={zigH(275, 355, TOP)} className="w34-zig-hit" />
        <polyline points={zigH(275, 355, TOP)} className="w34-zig rf" />
        <line x1={355} y1={TOP} x2={OX} y2={TOP} className="w34-wire" />
        <line x1={OX} y1={TOP} x2={OX} y2={OUT} className="w34-wire" />
        <text x={315} y={TOP - 15} className="w34-name rf mid">
          R_f = {fmtR(EX55.rf)}
        </text>
      </Part>
      <g className={`w34-part ${on('ifb')}`} data-hl="ifb" {...hoverProps(['ifb'])}>
        <path d={`M 290 ${TOP + 16} L 345 ${TOP + 16} M 338 ${TOP + 11} L 346 ${TOP + 16} L 338 ${TOP + 21}`} className="w34-iarrow" />
        <text x={318} y={TOP + 33} className="w34-cur mid">
          i_f = {q(3, fmtI(m.ifb))}
        </text>
      </g>
      <Part id="opamp" label="运放（LM358 的运放 A）">
        <polygon points={`${OA},95 ${OA},225 380,${OUT}`} className="w34-amp" />
        <text x={OA + 9} y={NEG + 6} className="w34-pm neg">
          −
        </text>
        <text x={OA + 9} y={POS + 6} className="w34-pm pos">
          +
        </text>
        <text x={OA + 30} y={OUT + 5} className="w34-amp-lab">
          LM358
        </text>
      </Part>
      <g className={`w34-part ${on('iminus')}`} data-hl="iminus" {...hoverProps(['iminus'])}>
        <text x={OA + 16} y={NEG + 22} className="w34-tiny">
          i− = {q(3, '0')}
        </text>
      </g>
      <g className={`w34-part ${on('psu')}`} data-hl="psu" {...hoverProps(['psu'])}>
        <line x1={325} y1={128} x2={325} y2={106} className="w34-rail pos" />
        <text x={331} y={110} className="w34-tiny rail">
          +9 V
        </text>
        <line x1={325} y1={192} x2={325} y2={214} className="w34-rail neg" />
        <text x={331} y={214} className="w34-tiny rail">
          {supply === 'dual' ? '−9 V' : 'GND'}
        </text>
      </g>
      {/* V_s2 straight on IN+ */}
      <Part id="vs2" cls="in" label={`V_s2 = ${EX55.vs2} V（直连同相端）`}>
        <line x1={180} y1={216} x2={180} y2={POS} className="w34-wire in" />
        <line x1={180} y1={POS} x2={OA} y2={POS} className="w34-wire in" />
        <circle cx={180} cy={236} r={20} className="w34-src in" />
        <text x={180} y={232} className="w34-sign">
          +
        </text>
        <text x={180} y={250} className="w34-sign">
          −
        </text>
        <text x={154} y={234} className="w34-name in end">
          V_s2
        </text>
        <text x={154} y={251} className="w34-val end">
          {EX55.vs2} V
        </text>
        <text x={228} y={POS - 8} className="w34-bubble mid in">
          v+ = {EX55.vs2.toFixed(2)} V
        </text>
      </Part>
      <line x1={180} y1={256} x2={180} y2={262} className="w34-wire" />
      <Ground x={180} y={262} />
      <g className={`w34-part ${on('iplus')}`} data-hl="iplus" {...hoverProps(['iplus'])}>
        <text x={232} y={POS + 18} className="w34-tiny mid cyan">
          i+ = 0（虚断）
        </text>
      </g>
      <Part id="vo" cls={m.sat && reveal >= 4 ? 'sat' : ''} label="输出 v_o">
        <line x1={380} y1={OUT} x2={478} y2={OUT} className="w34-wire out" />
        <circle cx={OX} cy={OUT} r={4.5} className="w34-node out" />
        <circle cx={478} cy={OUT} r={5} className="w34-term out" />
        <text x={478} y={OUT - 14} className="w34-name out mid">
          v_o
        </text>
        <text x={478} y={OUT + 24} className="w34-val out mid">
          {q(4, fmtV(m.vo))}
        </text>
      </Part>
      <Gauge supply={supply} vo={m.vo} ideal={m.ideal} show={reveal >= 4} />
    </>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  fmt,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fmt: string;
  onChange: (v: number) => void;
}) {
  const on = useIsLit()(id);
  return (
    <label className={`w34-slider ${on}`} {...hoverProps([id])}>
      <span className="w34-sl-name">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} aria-valuetext={fmt} />
      <b>{fmt}</b>
    </label>
  );
}

export default function Schematic() {
  useClearHoverOnUnmount();
  const [sch, setSch] = useStageParam<'ni' | 'ex55'>('sch', 'ni');
  const [r1, setR1] = useStageParam('r1', 10e3);
  const [rf, setRf] = useStageParam('rf', 20e3);
  const [vi, setVi] = useStageParam('vi', 1.5);
  const [divider, setDivider] = useStageParam('divider', false);
  const [, setReveal] = useStageParam('ex55', 0);
  const [supply] = useSupply();
  const reveal = useEx55Reveal();
  const isNi = sch === 'ni';
  const n = nonInverting(vi, r1, rf, supply);
  const m = mixed(supply);
  const all = reveal >= 9;
  const q = (k: number, v: string) => (reveal >= k ? v : '?');

  let alarm: ReactNode = null;
  if (isNi && n.sat)
    alarm = (
      <p className="w34-alarm" role="alert" {...hoverProps(['sat'])}>
        <b>饱和警报</b>
        <span className="short">
          理想 {fmtV(n.ideal)}，输出卡在 {fmtV(n.vo)}；v− ≠ v+，虚短失效
        </span>
        <span className="full">
          理想 v_o = {fmtV(n.ideal)} {n.sat === 'high' ? `超出 LM358 上限 +${WINDOW[supply][1]} V，削顶` : `低于下限 ${fmtV(WINDOW[supply][0])}，削底`}；v− = {fmtV(n.vminus)} ≠ v+
          = {fmtV(vi)}，虚短失效
          {n.negInput ? '（单电源下输入为负，芯片输出不可能为负）' : ''}
        </span>
      </p>
    );
  else if (!isNi && m.sat && reveal >= 4)
    alarm = (
      <p className="w34-alarm" role="alert" {...hoverProps(['sat'])}>
        <b>饱和警报</b>
        <span className="short">
          变不出 {fmtV(m.ideal)}：输出卡在 {fmtV(m.vo)}，虚短失效
        </span>
        <span className="full">
          单 +9 V 供电变不出 {fmtV(m.ideal)}：输出卡在约 {fmtV(m.vo)}，v− = {fmtV(m.vminus)} ≠ v+ = {fmtV(m.vplus)}，虚短失效
        </span>
      </p>
    );

  return (
    <div className="w34-layer">
      <div className="w34-dock">
        <div className="w34-row">
          <div className="w34-seg" role="radiogroup" aria-label="电路">
            <button role="radio" aria-checked={isNi} className={isNi ? 'on' : ''} onClick={() => setSch('ni')}>
              <span className="full">同相放大器</span>
              <span className="short">同相</span>
            </button>
            <button role="radio" aria-checked={!isNi} className={!isNi ? 'on' : ''} onClick={() => setSch('ex55')}>
              <span className="full">Example 5.5 双源</span>
              <span className="short">例 5.5</span>
            </button>
          </div>
          <SupplySeg />
          {isNi && (
            <button className={`w34-toggle ${divider ? 'on' : ''}`} aria-pressed={divider} onClick={() => setDivider(!divider)} {...hoverProps(['divider'])}>
              分压链高亮
            </button>
          )}
          {!isNi && !all && (
            <button className="w34-toggle" onClick={() => setReveal(9)} title="引导例题进行中：数值待你求出">
              揭晓答案
            </button>
          )}
        </div>
        {isNi && (
          <div className="w34-sliders">
            <Slider id="r1" label="R_1" value={r1} min={1000} max={50000} step={1000} fmt={fmtR(r1)} onChange={setR1} />
            <Slider id="rf" label="R_f" value={rf} min={0} max={100000} step={1000} fmt={rf === 0 ? '0 Ω' : fmtR(rf)} onChange={setRf} />
            <Slider id="vi" label="v_i" value={vi} min={-5} max={5} step={0.1} fmt={fmtV(vi, 1)} onChange={(v) => setVi(Math.round(v * 10) / 10)} />
          </div>
        )}
      </div>
      <div className="w34-sch-wrap">
        <svg viewBox="0 0 580 296" className="w34-sch" role="img" aria-label={isNi ? `同相放大器原理图：A_v = ${n.av.toFixed(2)}` : 'Sadiku Example 5.5 电路'}>
          {isNi && rf === 0 && (
            <g className="w34-badge">
              <rect x={10} y={10} width={232} height={26} rx={13} />
              <text x={126} y={28}>
                已退化为电压跟随器 A_v = 1
              </text>
            </g>
          )}
          {isNi ? <NiCircuit r1={r1} rf={rf} vi={vi} supply={supply} divider={divider} /> : <Ex55Circuit supply={supply} reveal={reveal} />}
        </svg>
      </div>
      {alarm}
      {isNi ? (
        <div className="w34-cells">
          <Cell id="av" name="增益 A_v" short="A_v" value={n.av.toFixed(2)} hint="1 + R_f/R_1" />
          <Cell id="vo" name="理想 v_o" short="理想" value={fmtV(n.ideal)} hint="A_v · v_i" />
          <Cell id="sat" name="实际 v_o" short="实际" value={fmtV(n.vo)} hint={n.sat ? '已饱和' : '线性区'} cls={n.sat ? 'bad' : 'good'} />
          <Cell id="vminus" name="反相端 v−" short="v−" value={fmtV(n.vminus)} hint={n.sat ? '≠ v+' : '= v+'} />
          <Cell id="ifb" name="i_f = i_1" short="i_f" value={fmtI(n.i1)} />
          <Cell id="iplus" name="输入电阻 R_in" short="R_in" value="→ ∞" hint="i+ = 0" />
        </div>
      ) : (
        <div className="w34-cells">
          <Cell id="vs2" name="同相端 v+" short="v+" value={`${EX55.vs2.toFixed(2)} V`} hint="= V_s2" />
          <Cell id="vminus" name="反相端 v−" short="v−" value={q(1, fmtV(m.vminus))} />
          <Cell id="i1" name="输入电流 i_1" short="i_1" value={q(2, fmtI(m.i1))} />
          <Cell id="ifb" name="反馈电流 i_f" short="i_f" value={q(3, fmtI(m.ifb))} />
          <Cell id="iminus" name="i− 与 i+" short="i−, i+" value={q(3, '0 mA')} />
          <Cell id="vo" name="输出 v_o" short="v_o" value={q(4, fmtV(m.vo))} cls={reveal >= 4 ? (m.sat ? 'bad' : 'good') : ''} />
        </div>
      )}
    </div>
  );
}
