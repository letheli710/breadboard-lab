// W3-L5 layer 03 · 反相加法器与饱和边界验算台. Sadiku Example 5.6 or the act 5 three-channel mixer
// with ±Vcc rails and a load RL. Linear while |vₒ,ideal| ≤ Vcc (v₋ = 0); beyond it the output sticks
// to the rail, the op amp turns red and v₋ follows from KCL at node a (virtual ground gone). The
// gauge under the schematic puts the ideal output (hollow) and the real one (solid) against the
// rails. Added to the sheet's controls: the step-5 switch "CH1 飙高音 3.0 V" of the mixer preset.
// The mixer preset is the act 5 guided example, so its numbers stay covered until the guided
// steps reach them (w35_shown = steps solved) or the student asks. Stage params: w35_amp, w35_vcc,
// w35_rl, w35_boost, w35_shown.

import { useStageParam } from '../../stageStore';
import { AMP_PRESETS, BOOST_V1, fmt, solveSummer, type AmpPreset } from './model';
import { Bubble, C, Dot, Flow, Ground, Obj, OpAmp, ResH, ResV, Src, Terminal, Wire, opIn, shownOr, useHot } from './parts';
import './w3l5.css';

const BUS = 170;
const NODE = 96;
const OPX = 210;
const OPY = NODE + 17;
const TIP = OPX + 64;
const JF = 312;
const XL = 392;

/** which values of the guided example are on show: by steps solved (5: all) */
function maskOf(guided: boolean, boost: boolean, shown: number) {
  if (!guided || shown >= 5) return { vm: true, br: true, f: true, out: true };
  if (boost) return { vm: false, br: false, f: false, out: false };
  return { vm: shown >= 1, br: shown >= 2, f: shown >= 3, out: shown >= 4 };
}

function Gauge({ vcc, ideal, actual, show, sat }: { vcc: number; ideal: number; actual: number; show: boolean; sat: boolean }) {
  const S = 16;
  const X0 = 30;
  const X1 = 400;
  const x = (v: number) => X0 + ((Math.max(-S, Math.min(S, v)) + S) / (2 * S)) * (X1 - X0);
  const Y = 228;
  return (
    <g>
      <rect x={X0} y={Y - 7} width={x(-vcc) - X0} height={14} fill="#FEE4E2" />
      <rect x={x(vcc)} y={Y - 7} width={X1 - x(vcc)} height={14} fill="#FEE4E2" />
      <rect x={x(-vcc)} y={Y - 7} width={x(vcc) - x(-vcc)} height={14} fill="#D1FADF" />
      {[-15, -10, -5, 0, 5, 10, 15].map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={Y + 7} x2={x(t)} y2={Y + 10} stroke={C.wire} />
          <text x={x(t)} y={Y + 19} className="w35-tick" textAnchor="middle">
            {fmt(t, 0)}
          </text>
        </g>
      ))}
      <line x1={x(-vcc)} y1={Y - 11} x2={x(-vcc)} y2={Y + 9} stroke={C.bad} strokeWidth={2} />
      <line x1={x(vcc)} y1={Y - 11} x2={x(vcc)} y2={Y + 9} stroke={C.bad} strokeWidth={2} />
      <text x={x(-vcc)} y={Y - 14} className="w35-tag" textAnchor="middle" fill={C.badT}>
        −{fmt(vcc, 0)} V
      </text>
      <text x={x(vcc)} y={Y - 14} className="w35-tag" textAnchor="middle" fill={C.badT}>
        +{fmt(vcc, 0)} V
      </text>
      {show ? (
        <>
          {sat && <circle cx={x(ideal)} cy={Y} r={6} fill="#fff" stroke={C.muted} strokeWidth={2} strokeDasharray="2 2" />}
          <circle cx={x(actual)} cy={Y} r={6} fill={sat ? C.bad : C.ink} />
        </>
      ) : (
        <text x={x(0)} y={Y + 4} className="w35-val" textAnchor="middle" fill={C.ink}>
          v_o = ?
        </text>
      )}
    </g>
  );
}

export default function SaturationLayer() {
  const [preset, setPreset] = useStageParam<AmpPreset>('w35_amp', 'sadiku_example_5_6');
  const [vcc, setVcc] = useStageParam('w35_vcc', 12);
  const [RL, setRL] = useStageParam('w35_rl', 2);
  const [boost, setBoost] = useStageParam('w35_boost', false);
  const [shown, setShown] = useStageParam('w35_shown', 0);
  const P = AMP_PRESETS[preset];
  const guided = preset === 'socratic_3ch_mixer';
  const up = guided && boost;
  const v = up ? [BOOST_V1, ...P.v.slice(1)] : P.v;
  const s = solveSummer(v, P.R, P.Rf, RL, vcc);
  const m = maskOf(guided, up, shown);
  const masked = guided && shown < 5;
  const n = v.length;
  const YS = n === 2 ? [62, 130] : [46, 96, 146];
  const { plus } = opIn(OPY, 68);
  const sat = useHot('hl_sat');
  const names = n === 2 ? ['v₁', 'v₂'] : ['CH1 主唱', 'CH2 吉他', 'CH3 贝斯'];
  const kOf = (r: number) => `${fmt(r, r % 1 ? 1 : 0)}k`;

  const pick = (p: AmpPreset) => {
    setPreset(p);
    setVcc(AMP_PRESETS[p].Vcc);
    setRL(AMP_PRESETS[p].RL);
    setBoost(false);
  };

  return (
    <div className="w35-layer">
      <div className="w35-controls">
        <div className="w35-seg" role="radiogroup" aria-label="电路预设">
          {(Object.keys(AMP_PRESETS) as AmpPreset[]).map((k) => (
            <button key={k} role="radio" aria-checked={preset === k} className={preset === k ? 'on' : ''} onClick={() => pick(k)}>
              <span className="w35-long">{AMP_PRESETS[k].label}</span>
              <span className="w35-short">{AMP_PRESETS[k].short}</span>
            </button>
          ))}
        </div>
        {guided && (
          <button className={`w35-toggle ${boost ? 'on' : ''}`} aria-pressed={boost} onClick={() => setBoost(!boost)}>
            <span className="w35-long">CH1 </span>飙高音 3.0 V
          </button>
        )}
      </div>
      <div className="w35-sliders two">
        <label className="rail">
          <span>
            电源轨 ±V_CC <b>±{fmt(vcc, 0)} V</b>
          </span>
          <input type="range" min={5} max={15} step={1} value={vcc} onChange={(e) => setVcc(Number(e.target.value))} aria-label="电源轨 Vcc" />
        </label>
        <label className="load">
          <span>
            负载 R_L <b>{fmt(RL, 1)} kΩ</b>
          </span>
          <input type="range" min={1} max={10} step={0.5} value={RL} onChange={(e) => setRL(Number(e.target.value))} aria-label="负载电阻 RL" />
        </label>
      </div>

      <div className="w35-svgwrap">
        <svg viewBox="0 0 420 252" className="w35-svg" role="img" aria-label={`${P.label} 饱和边界验算`}>
          <rect x="1" y="1" width="418" height="250" rx="10" className="w35-bg" />
          {YS.map((y, k) => (
            <Obj key={k} id={`hl_v${k + 1}`} box={[4, y - 27, 162, 46]}>
              <Src x={22} y={y} color={C.ch[k]} r={12} />
              <text x={38} y={y - 15} className="w35-tag" fill={C.chT[k]}>
                {names[k]} = {fmt(v[k], 1)} V
              </text>
              <Wire d={`M 34 ${y} H 54 M 100 ${y} H ${BUS}`} />
              <ResH x1={54} x2={100} y={y} />
              <text x={77} y={y + 4} className="w35-rv" textAnchor="middle">
                {kOf(P.R[k])}
              </text>
              <Flow x1={108} y1={y} x2={162} y2={y} I={s.i[k]} color={C.ch[k]} show={m.br} />
              <text x={135} y={y + 15} className="w35-val" textAnchor="middle" fill={m.br && s.i[k] < -1e-9 ? C.backT : C.chT[k]}>
                {shownOr(m.br, fmt(s.i[k], 3), 'mA')}
              </text>
            </Obj>
          ))}
          <Wire d={`M ${BUS} ${YS[0]} V ${YS[n - 1]}`} />
          <Obj id="hl_vground" box={[BUS - 8, NODE - 8, 16, 16]}>
            <Dot x={BUS} y={NODE} color={s.saturated && m.vm ? C.bad : C.node} r={5} />
          </Obj>
          <Obj id="hl_vground" box={[174, 172, 104, 24]}>
            <Bubble
              x={176}
              y={186}
              text={`a: v₋ = ${shownOr(m.vm, fmt(s.vMinus, 3, true), 'V')}`}
              color={s.saturated && m.vm ? C.badT : C.nodeT}
              anchor="start"
              bg={s.saturated && m.vm ? '#FEF3F2' : '#ECFDF3'}
            />
          </Obj>
          <Wire d={`M ${BUS} ${NODE} H ${OPX} M ${OPX} ${plus} H 198 V 150`} />
          <Ground x={198} y={150} />
          <Obj id="hl_rails" box={[214, 52, 44, 124]}>
            <Wire d={`M 234 92 V 66 M 234 134 V 156`} color={C.muted} dashed />
            <text x={234} y={62} className="w35-tag" textAnchor="middle" fill={C.muted}>
              +{fmt(vcc, 0)} V
            </text>
            <text x={234} y={168} className="w35-tag" textAnchor="middle" fill={C.muted}>
              −{fmt(vcc, 0)} V
            </text>
          </Obj>
          <Obj id="hl_opamp" box={[OPX - 6, OPY - 38, 76, 76]}>
            <OpAmp x={OPX} y={OPY} h={68} sat={s.saturated && m.out} />
          </Obj>
          <Obj id="hl_rf" box={[BUS + 6, 4, JF - BUS, 26]}>
            <Wire d={`M ${BUS} ${YS[0]} V 18 H 232 M 292 18 H ${JF} V ${OPY}`} />
            <ResH x1={232} x2={292} y={18} color={C.rf} fill="#FEF3F2" />
            <text x={262} y={22} className="w35-rv" textAnchor="middle" fill={C.rfT}>
              {kOf(P.Rf)}
            </text>
          </Obj>
          <Obj id="hl_if" box={[BUS + 6, 26, 60, 26]}>
            <Flow x1={180} y1={33} x2={222} y2={33} I={s.iF} color={C.rf} show={m.f} />
            <text x={201} y={47} className="w35-val" textAnchor="middle" fill={C.rfT}>
              i_f {shownOr(m.f, fmt(s.iF, 3), 'mA')}
            </text>
          </Obj>
          <Wire d={`M ${TIP} ${OPY} H 412 M ${XL} ${OPY} V 128 M ${XL} 172 V 182`} />
          <Dot x={JF} y={OPY} />
          <Dot x={XL} y={OPY} />
          <Obj id="hl_io" box={[254, 72, 56, 50]}>
            <Flow x1={280} y1={OPY - 7} x2={306} y2={OPY - 7} I={s.io} color={C.out} show={m.out} />
            <text x={308} y={84} className="w35-val" textAnchor="end" fill={C.outT}>
              i_o
            </text>
            <text x={308} y={96} className="w35-val" textAnchor="end" fill={C.outT}>
              {shownOr(m.out, fmt(s.io, 2), 'mA')}
            </text>
          </Obj>
          <Obj id="hl_il" box={[340, 124, 72, 70]}>
            <ResV x={XL} y1={128} y2={172} />
            <Ground x={XL} y={182} />
            <text x={XL - 22} y={142} className="w35-rv" textAnchor="end">
              R_L {fmt(RL, 1)}k
            </text>
            <Flow x1={XL - 14} y1={150} x2={XL - 14} y2={176} I={s.iL} color={C.out} show={m.out} />
            <text x={XL - 22} y={168} className="w35-val" textAnchor="end" fill={C.outT}>
              i_L {shownOr(m.out, fmt(s.iL, 2), '')}
            </text>
          </Obj>
          <Obj id="hl_vo" box={[322, OPY - 32, 94, 40]}>
            <Terminal x={412} y={OPY} />
            <Bubble x={414} y={OPY - 18} text={`v_o ${shownOr(m.out, fmt(s.vo, 2), 'V')}`} color={s.saturated && m.out ? C.badT : C.ink} anchor="end" />
          </Obj>
          <Obj id="hl_sat" box={[4, 200, 412, 48]}>
            <Gauge vcc={vcc} ideal={s.voIdeal} actual={s.vo} show={m.out} sat={s.saturated} />
            {m.out && (
              <text x={215} y={207} className="w35-tag" textAnchor="middle" fill={s.saturated ? C.badT : C.nodeT}>
                {s.saturated ? `${s.vo < 0 ? '负' : '正'}向饱和削波 · 虚地瓦解` : '线性区 · 虚地成立'}
              </text>
            )}
          </Obj>
        </svg>
      </div>

      <div className={`w35-readout grid ${masked ? '' : 'phone-off'} ${sat.lit ? 'lit' : ''}`} {...sat.on}>
        <span className="dup">
          v_o 理想 <b>{shownOr(m.out, fmt(s.voIdeal, 2), 'V')}</b>
        </span>
        <span className={`dup ${m.out && s.saturated ? 'bad' : ''}`}>
          v_o 实际 <b>{shownOr(m.out, fmt(s.vo, 2), 'V')}</b>
        </span>
        <span className={`dup ${m.vm && s.saturated ? 'bad' : 'good'}`}>
          v₋ <b>{shownOr(m.vm, fmt(s.vMinus, 3, true), 'V')}</b>
        </span>
        <span className={`dup flag ${m.out ? (s.saturated ? 'bad' : 'good') : ''}`}>
          <b>{m.out ? (s.saturated ? `${s.vo < 0 ? '负' : '正'}向饱和 · 虚地瓦解` : '线性区 · 虚地成立') : '状态 ?'}</b>
        </span>
        <span className="dup rf">
          i_f <b>{shownOr(m.f, fmt(s.iF, 3), 'mA')}</b>
        </span>
        <span className="dup out">
          i_L <b>{shownOr(m.out, fmt(s.iL, 2), 'mA')}</b>
        </span>
        <span className="dup out">
          i_o <b>{shownOr(m.out, fmt(s.io, 2), 'mA')}</b>
        </span>
        {masked ? (
          <button className="w35-reveal" onClick={() => setShown(5)}>
            揭晓数值（第 5 幕实战题）
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
