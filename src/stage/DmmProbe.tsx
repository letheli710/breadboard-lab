// Layer "02 万用表表笔接法台": a 9 V battery and a 1 kΩ resistor, and a multimeter set up one of
// three ways — voltage range across the resistor (safe), current range in a break of the loop
// (right), or the current range across the resistor (wrong: 9 V / 0.1 Ω = 90 A, the fuse
// blows). Moving dots show where current flows and how much. The range labels on the dial are
// stage objects (dmm_v_mode, dmm_a_mode) linked to the lesson text.

import { useEffect } from 'react';
import { prefersReducedMotion } from '../ui/reveal';
import { useLit, useStage } from './stageStore';
import type { DmmMode } from './types';

const A: [number, number] = [178, 70];
const B: [number, number] = [362, 70];
const GAP: [number, number] = [340, 384];
const JACK = { mA: 232, COM: 260, V: 288 };
const JY = 134;

const MODES: { mode: DmmMode; label: string; tone: 'good' | 'bad' }[] = [
  { mode: 'voltage', label: '测电压（并联安全）', tone: 'good' },
  { mode: 'current', label: '测电流（串联正确）', tone: 'good' },
  { mode: 'wrong', label: '错误示范：电流档直接并联', tone: 'bad' },
];

interface Reading {
  display: string;
  unit: string;
  rMeter: string;
  iMeter: string;
  effect: string;
  tone: 'good' | 'bad' | 'off';
}

function readingOf(mode: DmmMode, blown: boolean): Reading {
  if (mode === 'voltage') return { display: '9.00', unit: 'V', rMeter: 'R_V ≈ 10 MΩ', iMeter: '9 V ÷ 10 MΩ ≈ 0.9 µA', effect: '几乎不偷电流，电路照常工作', tone: 'good' };
  if (mode === 'current')
    return { display: '9.00', unit: 'mA', rMeter: 'R_A ≈ 0.1 Ω', iMeter: '9 V ÷ (1 kΩ + 0.1 Ω) ≈ 9.00 mA', effect: '表就是回路的一段导线，读到的就是电阻的电流', tone: 'good' };
  if (blown) return { display: 'FUSE', unit: '', rMeter: '保险丝已断（开路）', iMeter: '0 A', effect: '保险丝熔断，表的电流档报废，需要更换保险丝', tone: 'off' };
  return { display: '90.0', unit: 'A', rMeter: 'R_A ≈ 0.1 Ω', iMeter: '9 V ÷ 0.1 Ω = 90 A（理想估算）', effect: '表把电阻两端直接短接：电流全部挤进表里', tone: 'bad' };
}

/** A lead from a jack to a probe tip. */
const leadPath = (jx: number, tip: [number, number]) => `M ${jx} ${JY} C ${jx} ${JY - 34}, ${tip[0]} ${tip[1] + 44}, ${tip[0]} ${tip[1] + 8}`;

export default function DmmProbe() {
  const mode = useStage((s) => s.dmm);
  const blown = useStage((s) => s.fuseBlown);
  const setDmm = useStage((s) => s.setDmm);
  const setFuse = useStage((s) => s.setFuse);
  const setHover = useStage((s) => s.setHover);
  const lit = useLit();
  const r = readingOf(mode, blown);
  const still = prefersReducedMotion();

  // a hovered button / dial label that unmounts gets no pointerleave
  useEffect(() => () => setHover(null), [setHover]);

  // the wrong set-up: a flash, then the fuse goes
  useEffect(() => {
    if (mode !== 'wrong' || blown) return;
    const t = setTimeout(() => setFuse(true), still ? 0 : 1100);
    return () => clearTimeout(t);
  }, [mode, blown, setFuse, still]);

  const series = mode === 'current';
  const shorting = mode === 'wrong' && !blown;
  const redJack = mode === 'voltage' ? JACK.V : JACK.mA;
  const redTip: [number, number] = series ? [GAP[0], 70] : A;
  const blackTip: [number, number] = series ? [GAP[1], 70] : B;
  const vLit = lit.includes('dmm_v_mode');
  const aLit = lit.includes('dmm_a_mode');
  const hover = (id: string) => ({ onPointerEnter: () => setHover([id]), onPointerLeave: () => setHover(null) });

  // the loop: battery + (65,120) up, along the top through the resistor, down the right, back
  const loopTop = series ? `M 65 120 L 65 70 L ${GAP[0]} 70` : 'M 65 120 L 65 70 L 420 70';
  const loopRest = series ? `M ${GAP[1]} 70 L 420 70 L 420 270 L 65 270 L 65 220` : 'M 420 70 L 420 270 L 65 270 L 65 220';
  // current through the meter: in along the red lead, out along the black one (the inside is hidden)
  const meterIn = `M ${redTip[0]} ${redTip[1] + 8} C ${redTip[0]} ${redTip[1] + 44}, ${redJack} ${JY - 34}, ${redJack} ${JY}`;
  const meterOut = `M ${JACK.COM} ${JY} C ${JACK.COM} ${JY - 34}, ${blackTip[0]} ${blackTip[1] + 44}, ${blackTip[0]} ${blackTip[1] + 8}`;

  return (
    <div className="dmm-layer">
      <div className="dmm-modes" role="radiogroup" aria-label="万用表接法">
        {MODES.map((m) => (
          <button
            key={m.mode}
            role="radio"
            aria-checked={mode === m.mode}
            className={`dmm-mode ${m.tone} ${mode === m.mode ? 'on' : ''}`}
            onClick={() => {
              setDmm(m.mode);
              if (m.mode !== 'wrong') setFuse(false);
            }}
            {...hover(m.mode === 'voltage' ? 'dmm_v_mode' : 'dmm_a_mode')}
          >
            {m.label}
          </button>
        ))}
      </div>
      <svg
        viewBox="0 0 480 300"
        className={`dmm-svg ${still ? 'still' : ''} ${shorting ? 'shorting' : ''}`}
        role="img"
        aria-label={`9 V 电池与 1 kΩ 电阻回路，万用表${MODES.find((m) => m.mode === mode)!.label}，读数 ${r.display} ${r.unit}`}
      >
        <rect x="6" y="6" width="468" height="288" rx="14" className="dmm-bg" />
        {/* loop wires */}
        <path d={loopTop} className="wire" />
        <path d={loopRest} className="wire" />
        {series && (
          <g>
            <text x={(GAP[0] + GAP[1]) / 2} y="58" textAnchor="middle" className="dmm-note">
              断口：表串进来
            </text>
          </g>
        )}
        {/* current in the loop: 9 mA (blown fuse: the loop is fine again) */}
        <path d={loopTop} className="flow loop" />
        <path d={loopRest} className="flow loop" />
        {/* battery */}
        <g>
          <rect x="40" y="120" width="50" height="100" rx="6" className="batt" />
          <rect x="54" y="112" width="22" height="9" rx="2" className="batt-cap" />
          <text x="65" y="160" textAnchor="middle" className="batt-text">
            9 V
          </text>
          <text x="65" y="138" textAnchor="middle" className="batt-sign">
            +
          </text>
          <text x="65" y="212" textAnchor="middle" className="batt-sign">
            −
          </text>
        </g>
        {/* resistor 1 kΩ */}
        <g>
          <rect x="214" y="58" width="112" height="24" rx="8" className="res" />
          {[234, 252, 270, 304].map((x, i) => (
            <rect key={x} x={x} y="58" width="8" height="24" fill={['#7a4a1f', '#151515', '#c0261b', '#d4a72c'][i]} />
          ))}
          <text x="270" y="102" textAnchor="middle" className="res-text">
            1 kΩ
          </text>
        </g>
        {/* node dots */}
        {!series && (
          <>
            <circle cx={A[0]} cy={A[1]} r="4" className="node" />
            <circle cx={B[0]} cy={B[1]} r="4" className="node" />
          </>
        )}
        {/* meter body */}
        <g>
          <rect x="196" y="120" width="128" height="150" rx="14" className="dmm-body" />
          <rect x="208" y="148" width="104" height="38" rx="6" className={`dmm-lcd ${r.tone}`} />
          <text x="300" y="176" textAnchor="end" className={`dmm-digits ${r.tone}`}>
            {r.display}
            <tspan className="dmm-unit"> {r.unit}</tspan>
          </text>
          {/* jacks */}
          {(['mA', 'COM', 'V'] as const).map((k) => (
            <g key={k}>
              <circle cx={JACK[k]} cy={JY} r="6" className={`jack ${k === 'COM' ? 'black' : 'red'}`} />
              <text x={JACK[k]} y={JY + 18} textAnchor="middle" className="jack-text">
                {k === 'V' ? 'VΩ' : k}
              </text>
            </g>
          ))}
          {/* fuse behind the mA jack */}
          <g className={`fuse ${blown ? 'blown' : ''}`}>
            <rect x="204" y="194" width="14" height="30" rx="3" />
            {blown ? <path d="M 211 197 L 211 206 M 209 212 L 213 221" /> : <path d="M 211 197 L 211 221" />}
            <text x="211" y="236" textAnchor="middle">
              保险丝
            </text>
          </g>
          {/* dial */}
          <circle cx="268" cy="225" r="24" className="dial" />
          <line x1="268" y1="225" x2={mode === 'voltage' ? 247 : 289} y2={212} className="dial-pointer" />
          <g className={`dial-label ${mode === 'voltage' ? 'sel' : ''} ${vLit ? 'lit' : ''}`} {...hover('dmm_v_mode')}>
            <rect x="226" y="198" width="22" height="14" rx="3" />
            <text x="237" y="209" textAnchor="middle">
              V⎓
            </text>
          </g>
          <g className={`dial-label ${mode !== 'voltage' ? 'sel' : ''} ${aLit ? 'lit' : ''}`} {...hover('dmm_a_mode')}>
            <rect x="288" y="198" width="26" height="14" rx="3" />
            <text x="301" y="209" textAnchor="middle">
              mA
            </text>
          </g>
          <text x="268" y="262" textAnchor="middle" className="jack-text">
            {mode === 'voltage' ? '内阻 ≈ 10 MΩ' : '内阻 ≈ 0.1 Ω'}
          </text>
        </g>
        {/* leads and probes */}
        <path d={leadPath(redJack, redTip)} className="lead red" />
        <path d={leadPath(JACK.COM, blackTip)} className="lead black" />
        <circle cx={redTip[0]} cy={redTip[1]} r="5" className="tip red" />
        <circle cx={blackTip[0]} cy={blackTip[1]} r="5" className="tip black" />
        {/* current through the meter */}
        {!(blown && mode === 'wrong') && (
          <>
            <path d={meterIn} className={`flow meter ${mode}`} />
            <path d={meterOut} className={`flow meter ${mode}`} />
          </>
        )}
        {shorting && (
          <g className="spark">
            <circle cx="211" cy="209" r="16" />
            <text x="150" y="196" textAnchor="middle">
              90 A！
            </text>
          </g>
        )}
      </svg>
      <dl className={`dmm-readout ${r.tone}`}>
        <div>
          <dt>表的内阻</dt>
          <dd>{r.rMeter}</dd>
        </div>
        <div>
          <dt>流过表的电流</dt>
          <dd>{r.iMeter}</dd>
        </div>
        <div>
          <dt>后果</dt>
          <dd>{r.effect}</dd>
        </div>
      </dl>
      {blown && mode === 'wrong' && (
        <button className="button dmm-reset" onClick={() => setFuse(false)}>
          换一根保险丝，再试一次
        </button>
      )}
    </div>
  );
}
