// Layer "01 元件极性与功率符号判定台": a generic two-terminal element with a voltage reference
// (+ / −) and a current reference arrow i. The student sets v, i, flips either reference and the
// duration Δt; the box glows amber (absorbing), green (supplying) or grey (no exchange), energy
// arrows point in or out, moving dots show the real current, and the meter fills with w = p·Δt.
// Stage objects: v_polarity, i_arrow, psc_enter, psc_leave, energy_bar (lesson hover map).

import { useEffect } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { fmt, fmtSigned, psc } from './model';
import { Knob, Toggle, hoverProps, kwhText } from './controls';
import './workbench.css';

const PRESETS: { label: string; v: number; i: number; topPlus: boolean; iEntersTop: boolean }[] = [
  { label: '正常耗电 (+12 V, +2 A)', v: 12, i: 2, topPlus: true, iEntersTop: true },
  { label: '反号电流 (+12 V, −2 A)', v: 12, i: -2, topPlus: true, iEntersTop: true },
  { label: '电池放电（正出）', v: 12, i: 3, topPlus: true, iEntersTop: false },
  { label: '手机充电（正进）', v: 5, i: 2, topPlus: true, iEntersTop: true },
];

/** |w| that fills half the meter: 20 V × 10 A × 60 s */
const W_FULL = 12000;

const CX = 200;
const TOP_T = 44;
const BOX = { x: 145, y: 78, w: 110, h: 120 };
const BOT_T = 232;

export default function PscWorkbench() {
  const [v, setV] = useStageParam('psc_v', 12);
  const [i, setI] = useStageParam('psc_i', 2);
  const [topPlus, setTopPlus] = useStageParam('psc_topPlus', true);
  const [iEntersTop, setEntersTop] = useStageParam('psc_iEntersTop', true);
  const [dt, setDt] = useStageParam('psc_dt', 10);
  const setParams = useStage((s) => s.setParams);
  const setHover = useStage((s) => s.setHover);
  const lit = useLit();
  const still = prefersReducedMotion();
  const r = psc({ v, i, topPlus, iEntersTop, dt });

  useEffect(() => () => setHover(null), [setHover]);

  const on = (id: string) => (lit.includes(id) ? 'lit' : '');
  const sTop = topPlus ? '+' : '−';
  const sBot = topPlus ? '−' : '+';
  // the real high-potential end: the + reference when v > 0, the − reference when v < 0
  const realHighTop = v < 0 ? !topPlus : topPlus;
  // dots move with the real current: along the arrow when i > 0, against it when i < 0
  const realDown = i === 0 ? null : i > 0 === iEntersTop;
  const flowDur = i === 0 ? 0 : 2.4 / Math.max(0.5, Math.abs(i) / 2);
  const presetOn = PRESETS.findIndex((p) => p.v === v && p.i === i && p.topPlus === topPlus && p.iEntersTop === iEntersTop);
  const wFrac = Math.max(-1, Math.min(1, r.w / W_FULL));
  const modeText = r.mode === 'absorb' ? '吸收功率' : r.mode === 'supply' ? '发出功率' : '无能量交换';
  const modeSub = r.mode === 'absorb' ? '负载 / 充电模式' : r.mode === 'supply' ? '电源 / 放电模式' : 'p = 0';
  const arrowY = iEntersTop ? TOP_T + 8 : BOT_T - 22;

  return (
    <div className="l2w-layer">
      <div className="l2w-pills" role="group" aria-label="典型工况一键预设">
        {PRESETS.map((p, k) => (
          <button
            key={p.label}
            className={`l2w-pill ${presetOn === k ? 'on' : ''}`}
            aria-pressed={presetOn === k}
            onClick={() => setParams({ psc_v: p.v, psc_i: p.i, psc_topPlus: p.topPlus, psc_iEntersTop: p.iEntersTop })}
          >
            {p.label}
          </button>
        ))}
      </div>

      <svg
        viewBox="0 0 400 290"
        className={`l2w-svg ${still ? 'still' : ''}`}
        role="img"
        aria-label={`二端元件：v = ${fmt(v)} V，i = ${fmt(i)} A，${r.entersPlus ? '电流从正极流入' : '电流从正极流出'}，${modeText} ${fmt(Math.abs(r.p))} W`}
      >
        <rect x="2" y="2" width="396" height="286" rx="12" className="l2w-bg" />

        {/* PSC badges */}
        <g className={`l2w-badge ${r.entersPlus ? 'act' : ''} ${on('psc_enter')}`} id="svg-l1-psc-badge-plus" {...hoverProps(setHover, 'psc_enter')}>
          <rect x="10" y="8" width="128" height="26" rx="13" />
          <text x="74" y="25" textAnchor="middle">
            正进：p = +vi
          </text>
        </g>
        <g className={`l2w-badge leave ${!r.entersPlus ? 'act' : ''} ${on('psc_leave')}`} id="svg-l1-psc-badge-minus" {...hoverProps(setHover, 'psc_leave')}>
          <rect x="262" y="8" width="128" height="26" rx="13" />
          <text x="326" y="25" textAnchor="middle">
            正出：p = −vi
          </text>
        </g>

        {/* wires, terminals and the real current */}
        <line x1={CX} y1={TOP_T} x2={CX} y2={BOX.y} className="l2w-wire" />
        <line x1={CX} y1={BOX.y + BOX.h} x2={CX} y2={BOT_T} className="l2w-wire" />
        {realDown !== null && (
          <g className={`l2w-flow ${realDown ? 'down' : 'up'}`}>
            <line x1={CX} y1={TOP_T} x2={CX} y2={BOX.y} style={{ animationDuration: `${flowDur}s` }} />
            <line x1={CX} y1={BOX.y + BOX.h} x2={CX} y2={BOT_T} style={{ animationDuration: `${flowDur}s` }} />
          </g>
        )}
        <circle cx={CX} cy={TOP_T} r="5" className="l2w-term" />
        <circle cx={CX} cy={BOT_T} r="5" className="l2w-term" />

        {/* energy flow arrows (in: absorbing, out: supplying) */}
        <g className={`l2w-energy in ${r.mode === 'absorb' ? 'act' : ''} ${on('psc_enter')}`} id="svg-l1-energy-in" {...hoverProps(setHover, 'psc_enter')}>
          <text x="306" y="104" textAnchor="middle">
            能量流入
          </text>
          <line x1="352" y1="114" x2="270" y2="114" />
          <polygon points="262,114 274,107 274,121" />
        </g>
        <g className={`l2w-energy out ${r.mode === 'supply' ? 'act' : ''} ${on('psc_leave')}`} id="svg-l1-energy-out" {...hoverProps(setHover, 'psc_leave')}>
          <text x="306" y="156" textAnchor="middle">
            能量流出
          </text>
          <line x1="262" y1="166" x2="344" y2="166" />
          <polygon points="352,166 340,159 340,173" />
        </g>

        {/* the element */}
        <g className={`l2w-box ${r.mode}`}>
          <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx="12" />
          <text x={CX} y="120" textAnchor="middle" className="l2w-box-mode">
            {modeText}
          </text>
          <text x={CX} y="140" textAnchor="middle" className="l2w-box-sub">
            {modeSub}
          </text>
          <text x={CX} y="170" textAnchor="middle" className="l2w-box-p">
            |p| = {fmt(Math.abs(r.p))} W
          </text>
        </g>

        {/* voltage reference */}
        <g className={`l2w-vref ${on('v_polarity')}`} {...hoverProps(setHover, 'v_polarity')}>
          <rect x="70" y="84" width="74" height="112" rx="8" className="l2w-hit" />
          <text x="122" y="106" textAnchor="middle" className={`l2w-sign ${topPlus ? 'plus' : 'minus'}`} id={topPlus ? 'svg-l1-v-plus' : 'svg-l1-v-minus'}>
            {sTop}
          </text>
          <text x="122" y="192" textAnchor="middle" className={`l2w-sign ${topPlus ? 'minus' : 'plus'}`} id={topPlus ? 'svg-l1-v-minus' : 'svg-l1-v-plus'}>
            {sBot}
          </text>
          <text x="104" y="146" textAnchor="middle" className="l2w-vlabel" id="svg-l1-v-label">
            v = {fmt(v)} V
          </text>
        </g>
        {v < 0 && (
          <g className="l2w-realhigh">
            <circle cx="122" cy={realHighTop ? 100 : 186} r="13" />
            <text x="58" y={realHighTop ? 72 : 222} textAnchor="middle">
              真实高电位端
            </text>
          </g>
        )}

        {/* current reference arrow */}
        <g className={`l2w-iref ${on('i_arrow')}`} id="svg-l1-i-arrow" {...hoverProps(setHover, 'i_arrow')}>
          <rect x="212" y={arrowY - 8} width="86" height="30" rx="6" className="l2w-hit" />
          <line x1="222" y1={arrowY} x2="222" y2={arrowY + 14} />
          {iEntersTop ? (
            <polygon points={`216,${arrowY + 10} 228,${arrowY + 10} 222,${arrowY + 20}`} />
          ) : (
            <polygon points={`216,${arrowY + 4} 228,${arrowY + 4} 222,${arrowY - 6}`} />
          )}
          <text x="234" y={arrowY + 13} id="svg-l1-i-label">
            i = {fmt(i)} A
          </text>
        </g>

        {/* energy meter */}
        <g className={`l2w-meter ${on('energy_bar')}`} id="svg-l1-energy-meter" {...hoverProps(setHover, 'energy_bar')}>
          <text x="20" y="258" className="l2w-meter-l">
            发出 ←
          </text>
          <text x="380" y="258" textAnchor="end" className="l2w-meter-l">
            → 吸收
          </text>
          <text x={CX} y="258" textAnchor="middle" className="l2w-meter-v">
            w = p·Δt = {fmt(r.w, 1)} J
          </text>
          <rect x="20" y="264" width="360" height="14" rx="7" className="l2w-meter-track" />
          {wFrac !== 0 && (
            <rect x={wFrac > 0 ? CX : CX + wFrac * 180} y="264" width={Math.abs(wFrac) * 180} height="14" rx="3" className={`l2w-meter-fill ${wFrac > 0 ? 'abs' : 'sup'}`} />
          )}
          <line x1={CX} y1="261" x2={CX} y2="281" className="l2w-meter-zero" />
        </g>
      </svg>

      <div className="l2w-controls">
        <Knob label="端电压 v" unit="V" min={-20} max={20} step={1} value={v} onChange={setV} id="v_polarity" lit={lit} />
        <Knob label="支路电流 i" unit="A" min={-10} max={10} step={0.5} value={i} onChange={setI} id="i_arrow" lit={lit} />
        <Knob label="持续时间 Δt" unit="s" min={1} max={60} step={1} value={dt} onChange={setDt} id="energy_bar" lit={lit} />
        <div className="l2w-toggles">
          <Toggle label="翻转电压参考极性" state={topPlus ? '上正下负' : '上负下正'} on={!topPlus} onClick={() => setTopPlus(!topPlus)} id="v_polarity" lit={lit} />
          <Toggle label="翻转电流参考方向" state={iEntersTop ? '从上端流入' : '从下端流入'} on={!iEntersTop} onClick={() => setEntersTop(!iEntersTop)} id="i_arrow" lit={lit} />
        </div>
      </div>

      <ol className="l2w-readout" aria-live="polite">
        <li>
          <span className="n">1</span>约定检测：电流参考方向从 <b>{r.entersPlus ? '正极 (+)' : '负极 (−)'}</b> 流入 ──▶ 采用公式 <b>p_abs = {r.entersPlus ? '+vi' : '−vi'}</b>
        </li>
        <li>
          <span className="n">2</span>瞬时功率：p_abs = ({r.sign > 0 ? '+' : '−'}) ({fmt(v)} V) × ({fmt(i)} A) = <b>{fmtSigned(r.p)} W</b>
        </li>
        <li className={r.mode}>
          <span className="n">3</span>物理结论：该元件正在{' '}
          <b>{r.mode === 'absorb' ? `吸收 ${fmt(r.p)} W` : r.mode === 'supply' ? `发出 ${fmt(-r.p)} W` : '既不吸收也不发出功率'}</b>
        </li>
        <li>
          <span className="n">4</span>累计能量：w = ∫ p dt = p × Δt = <b>{fmt(r.w, 1)} J</b>（= {kwhText(r.kwh)} kWh）
        </li>
      </ol>
    </div>
  );
}
