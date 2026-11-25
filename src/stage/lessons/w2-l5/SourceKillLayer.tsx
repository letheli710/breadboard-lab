// W2-L5 layer 01 · 独立源一键置零演示: the act 4 circuit (16 V, R1 = R2 = 4 Ω, CCCS 2 i_x, 6 A).
// Two switches zero the independent sources (Vs → a heavy short wire "v = 0 V", Is → a dashed
// open gap "i = 0 A"); the dependent source is locked in place — clicking it (or its badge)
// brings up the professor's intercept. The node voltage, i_x, the CCCS current and the KCL of
// the circuit on show update live. Stage params: w5_vs ('ACTIVE' | 'SHORT_ZERO'), w5_is ('ACTIVE' | 'OPEN_ZERO').

import { useEffect, useState } from 'react';
import { useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { DEP, fmt, solve } from './model';
import { Bubble, C, Diamond, Dot, ISrc, L1, Lock, Obj, OpenGap, ShortWire, VSrc, Wire, useStepLayer, zigH, zigV } from './parts';
import './w2l5.css';

const TOP = 50;
const BOT = 180;
const MID = 115;
const XV = 48;
const XA = 190;
const XD = 304;
const XI = 384;

export default function SourceKillLayer() {
  useStepLayer(L1);
  const [vsState, setVs] = useStageParam<'ACTIVE' | 'SHORT_ZERO'>('w5_vs', 'ACTIVE');
  const [isState, setIs] = useStageParam<'ACTIVE' | 'OPEN_ZERO'>('w5_is', 'ACTIVE');
  const [warn, setWarn] = useState(false);
  const vsOn = vsState === 'ACTIVE';
  const isOn = isState === 'ACTIVE';
  const s = solve(DEP, vsOn, isOn);
  const prime = vsOn && !isOn ? "'" : !vsOn && isOn ? "''" : '';
  const name = vsOn && isOn ? '原电路：Vs 与 Is 同时工作' : vsOn ? '子电路 1：仅保留 Vs（Is 开路）' : isOn ? '子电路 2：仅保留 Is（Vs 短路）' : '全部独立源置零：电路里没有激励';
  const v = `v${prime}`;
  const kcl = String.raw`${vsOn ? String.raw`\frac{${v} - 16}{4}` : String.raw`\frac{${v}}{4}`} + \frac{${v}}{4} + 2\left(\frac{${v}}{4}\right) = ${isOn ? 6 : 0} \implies ${v} = ${fmt(s.v)}\text{ V}`;

  useEffect(() => {
    if (!warn) return;
    const t = setTimeout(() => setWarn(false), 4500);
    return () => clearTimeout(t);
  }, [warn]);

  return (
    <div className="w5-layer">
      <div className="w5-controls">
        <button className={`w5-switch ${vsOn ? 'on' : 'zero'}`} onClick={() => setVs(vsOn ? 'SHORT_ZERO' : 'ACTIVE')} aria-pressed={!vsOn}>
          <span className="knob" aria-hidden />
          <span>
            <span className="w5-long">独立电压源 </span>Vs
          </span>
          <b>{vsOn ? '工作' : '置零 → 短路'}</b>
        </button>
        <button className={`w5-switch ${isOn ? 'on' : 'zero'}`} onClick={() => setIs(isOn ? 'OPEN_ZERO' : 'ACTIVE')} aria-pressed={!isOn}>
          <span className="knob" aria-hidden />
          <span>
            <span className="w5-long">独立电流源 </span>Is
          </span>
          <b>{isOn ? '工作' : '置零 → 开路'}</b>
        </button>
        <button className="w5-locked" onClick={() => setWarn(true)} title="受控源（锁定：始终原位保留）">
          <svg viewBox="0 0 14 16" width="12" height="14" aria-hidden>
            <path d="M 3.5 7 V 4.8 a 3.5 3.5 0 0 1 7 0 V 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <rect x="1.6" y="6.8" width="10.8" height="8.2" rx="1.6" fill="currentColor" />
          </svg>
          受控源 2iₓ
          <b>
            锁定<span className="w5-long"> · 原位保留</span>
          </b>
        </button>
      </div>

      <div className="w5-svgwrap">
        <svg viewBox="0 0 420 212" className="w5-svg" role="img" aria-label={`独立源置零演示：${name}`}>
          <rect x="1" y="1" width="418" height="210" rx="10" className="w5-bg" />
          {/* rails */}
          <Wire d={`M ${XV} ${TOP} H 88 M 148 ${TOP} H ${XI} M ${XV} ${BOT} H ${XI}`} />
          {/* Vs or its short */}
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
            Vs = 16 V
          </text>
          {/* R1 */}
          <Obj id="hl_r1" box={[84, TOP - 16, 68, 46]}>
            <polyline points={zigH(88, 148, TOP)} className="w5-res" />
            <text x={118} y={TOP + 24} className="w5-lbl" textAnchor="middle" fill={C.resT}>
              R₁ = 4 Ω
            </text>
          </Obj>
          {/* R2 and i_x */}
          <Obj id="hl_r2" box={[XA - 62, 80, 120, 72]}>
            <Wire d={`M ${XA} ${TOP} V 84 M ${XA} 146 V ${BOT}`} />
            <polyline points={zigV(XA, 84, 146)} className="w5-res" />
            <text x={XA - 14} y={112} className="w5-lbl" textAnchor="end" fill={C.resT}>
              R₂ = 4 Ω
            </text>
            <line x1={XA + 16} y1={92} x2={XA + 16} y2={132} stroke={C.vs} strokeWidth={2} />
            <polygon points={`${XA + 11},${130} ${XA + 16},${139} ${XA + 21},${130}`} fill={C.vs} />
            <text x={XA + 24} y={110} className="w5-val" fill={C.vsT}>
              iₓ{prime}
            </text>
            <text x={XA + 24} y={126} className="w5-val" fill={C.vsT}>
              = {fmt(s.iR2)} A
            </text>
          </Obj>
          <Dot x={XA} y={TOP} />
          <Bubble x={XA + 6} y={TOP - 22} text={`v${prime} = ${fmt(s.v)} V`} color={C.ink} anchor="start" />
          {/* the CCCS, locked */}
          <Obj id="hl_dep" box={[XD - 30, TOP + 18, 64, BOT - TOP - 36]} onClick={() => setWarn(true)} label="受控源 2iₓ：锁定，点击查看教授提示">
            <Wire d={`M ${XD} ${TOP} V ${MID - 22} M ${XD} ${MID + 22} V ${BOT}`} />
            <Diamond x={XD} y={MID} />
            <Lock x={XD + 22} y={MID - 26} />
          </Obj>
          <text x={XD} y={BOT + 20} className="w5-lbl" textAnchor="middle" fill={C.depT}>
            2iₓ{prime} = {fmt(s.iDep)} A
          </text>
          {/* Is or its open gap */}
          <Obj id={isOn ? 'hl_is' : 'hl_open'} box={[XI - 50, TOP + 6, 72, BOT - TOP - 12]}>
            {isOn ? (
              <>
                <Wire d={`M ${XI} ${TOP} V ${MID - 19} M ${XI} ${MID + 19} V ${BOT}`} />
                <ISrc x={XI} y={MID} up />
              </>
            ) : (
              <OpenGap x={XI} y1={TOP} y2={BOT} />
            )}
          </Obj>
          <text x={XI} y={BOT + 20} className="w5-lbl" textAnchor="middle" fill={C.isT}>
            Is = 6 A
          </text>
        </svg>
        {warn && (
          <div className="w5-intercept" role="alert">
            <b>教授拦截：</b>受控源属于电路内部线性关系，绝不可置零！
            <button onClick={() => setWarn(false)} aria-label="关闭">
              ×
            </button>
          </div>
        )}
      </div>

      <div className="w5-tele">
        <div className="w5-tele-name">{name}</div>
        <div className="w5-tele-tex">
          <Tex tex={kcl} />
        </div>
      </div>
    </div>
  );
}
