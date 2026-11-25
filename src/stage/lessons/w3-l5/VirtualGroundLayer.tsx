// W3-L5 layer 01 · 虚地防串扰汇流原理图. The act 1 comparison: two channels (v₁ = 2 V fixed, v₂ on a
// slider 0–4 V) through 10 kΩ each into one node, either a passive node loaded by RL = 10 kΩ or the
// virtual ground of an op-amp summer (Rf = 10 kΩ). The readouts give the node voltage, i₁, i₂ and
// how far i₁ has moved from its v₂ = 0 value (the crosstalk error). Stage params: w35_topo,
// w35_l1v2.

import { useStageParam } from '../../stageStore';
import { fmt, idealSummer, passiveMixer } from './model';
import { Bubble, C, Dot, Flow, Ground, Obj, OpAmp, ResH, ResV, Src, Terminal, Wire, opIn, useHot } from './parts';
import './w3l5.css';

type Topo = 'passive' | 'summer';

const R = 10;
const V1 = 2;
const Y1 = 62;
const Y2 = 152;
const BUS = 206;
const NODE = 107;

export default function VirtualGroundLayer() {
  const [topo, setTopo] = useStageParam<Topo>('w35_topo', 'passive');
  const [v2, setV2] = useStageParam('w35_l1v2', 0);
  const passive = topo === 'passive';
  const p = passiveMixer(V1, v2, R, R, R);
  const s = idealSummer([V1, v2], [R, R], R);
  const vNode = passive ? p.vNode : 0;
  const i1 = passive ? p.i1 : s.i[0];
  const i2 = passive ? p.i2 : s.i[1];
  const i1Ref = passive ? passiveMixer(V1, 0, R, R, R).i1 : V1 / R;
  const err = ((i1 - i1Ref) / i1Ref) * 100;
  const back = passive && i2 < -1e-9;
  const press = passive && !back && v2 > 1e-9;
  const opY = 124;
  const { plus } = opIn(opY, 68);
  const tele = useHot(passive ? 'hl_crosstalk' : 'hl_vground');

  return (
    <div className="w35-layer">
      <div className="w35-controls">
        <div className="w35-seg" role="radiogroup" aria-label="汇流架构">
          <button role="radio" aria-checked={passive} className={passive ? 'on' : ''} onClick={() => setTopo('passive')}>
            无源电阻直连
          </button>
          <button role="radio" aria-checked={!passive} className={!passive ? 'on' : ''} onClick={() => setTopo('summer')}>
            运放虚地加法器
          </button>
        </div>
        <label className="w35-slider one">
          <span>
            v₂ 吉他 <b>{fmt(v2, 1)} V</b>
          </span>
          <input type="range" min={0} max={4} step={0.5} value={v2} onChange={(e) => setV2(Number(e.target.value))} aria-label="通道 2 电压 v₂" />
        </label>
      </div>

      <div className="w35-svgwrap">
        <svg viewBox="0 0 420 220" className="w35-svg" role="img" aria-label={passive ? '无源电阻直连混音' : '运放虚地加法器'}>
          <rect x="1" y="1" width="418" height="218" rx="10" className="w35-bg" />

          {/* channel 1 */}
          <Obj id="hl_v1" box={[4, 30, 196, 52]}>
            <Src x={32} y={Y1} color={C.ch[0]} />
            <text x={10} y={38} className="w35-lbl" fill={C.chT[0]}>
              v₁ = 2.0 V
            </text>
            <Wire d={`M 45 ${Y1} H 78 M 138 ${Y1} H ${BUS}`} />
            <ResH x1={78} x2={138} y={Y1} />
            <text x={108} y={Y1 + 4} className="w35-rv" textAnchor="middle">
              R₁ 10k
            </text>
            <Flow x1={146} y1={Y1} x2={196} y2={Y1} I={i1} color={C.ch[0]} />
            <text x={158} y={Y1 - 9} className="w35-val" textAnchor="middle" fill={C.chT[0]}>
              i₁ = {fmt(i1, 3)} mA
            </text>
          </Obj>
          {/* channel 2 */}
          <Obj id="hl_v2" box={[4, Y2 - 30, 196, 62]}>
            <Src x={32} y={Y2} color={C.ch[1]} />
            <text x={10} y={Y2 + 30} className="w35-lbl" fill={C.chT[1]}>
              v₂ = {fmt(v2, 1)} V
            </text>
            <Wire d={`M 45 ${Y2} H 78 M 138 ${Y2} H ${BUS}`} />
            <ResH x1={78} x2={138} y={Y2} />
            <text x={108} y={Y2 + 4} className="w35-rv" textAnchor="middle">
              R₂ 10k
            </text>
            <Flow x1={146} y1={Y2} x2={196} y2={Y2} I={i2} color={C.ch[1]} />
            <text x={158} y={Y2 + 19} className="w35-val" textAnchor="middle" fill={i2 < -1e-9 ? C.backT : C.chT[1]}>
              i₂ = {fmt(i2, 3)} mA
            </text>
          </Obj>

          <Wire d={`M ${BUS} ${Y1} V ${Y2}`} />

          {passive ? (
            <>
              <Obj id="hl_vmix" box={[BUS - 10, 66, 106, 52]}>
                <Dot x={BUS} y={NODE} color={C.bad} r={5} />
                <Bubble x={212} y={80} text={`v_mix = ${fmt(vNode, 3)} V`} color={C.badT} anchor="start" bg="#FEF3F2" />
              </Obj>
              <Obj id="hl_rl" box={[284, 100, 100, 104]}>
                <Wire d={`M ${BUS} ${NODE} H 300 V 125 M 300 175 V 190`} />
                <ResV x={300} y1={125} y2={175} />
                <Ground x={300} y={190} />
                <text x={316} y={148} className="w35-lbl" fill={C.ink}>
                  R_L = 10 kΩ
                </text>
                <Flow x1={284} y1={130} x2={284} y2={170} I={p.iL} color={C.wire} />
              </Obj>
              <Obj id="hl_crosstalk" box={[146, 70, 58, 74]}>
                {(back || press) && (
                  <path
                    d={back ? 'M 160 72 C 198 72, 198 142, 160 142' : 'M 160 142 C 198 142, 198 72, 160 72'}
                    fill="none"
                    stroke={C.bad}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    markerEnd="url(#w35-back)"
                  />
                )}
              </Obj>
              <defs>
                <marker id="w35-back" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={C.bad} />
                </marker>
              </defs>
              <text x={10} y={210} className="w35-tag" fill={C.badT}>
                {back ? '串扰回流！主唱电流倒灌进吉他口' : 'v₂ 抬高 v_mix，反压 i₁（串扰）'}
              </text>
            </>
          ) : (
            <>
              <Obj id="hl_vground" box={[BUS - 10, 66, 106, 52]}>
                <Dot x={BUS} y={NODE} color={C.node} r={5} />
                <Bubble x={212} y={80} text={`v₋ = ${fmt(0, 3)} V 虚地`} color={C.nodeT} anchor="start" bg="#ECFDF3" />
              </Obj>
              <Wire d={`M ${BUS} ${NODE} H 250 M 250 ${plus} H 236 V 182`} />
              <Ground x={236} y={182} />
              <Obj id="hl_opamp" box={[244, 86, 76, 76]}>
                <OpAmp x={250} y={opY} h={68} />
              </Obj>
              <Obj id="hl_rf" box={[200, 10, 166, 30]}>
                <Wire d={`M ${BUS} ${Y1} V 26 H 270 M 330 26 H 354 V ${opY}`} />
                <ResH x1={270} x2={330} y={26} color={C.rf} fill="#FEF3F2" />
                <text x={300} y={30} className="w35-rv" textAnchor="middle" fill={C.rfT}>
                  R_f 10k
                </text>
              </Obj>
              <Obj id="hl_if" box={[214, 30, 54, 24]}>
                <Flow x1={218} y1={40} x2={262} y2={40} I={s.iF} color={C.rf} />
              </Obj>
              <text x={268} y={46} className="w35-val" fill={C.rfT}>
                i_f = {fmt(s.iF, 3)} mA
              </text>
              <Obj id="hl_vo" box={[316, 112, 100, 50]}>
                <Wire d={`M 314 ${opY} H 392`} />
                <Dot x={354} y={opY} />
                <Terminal x={392} y={opY} />
                <Bubble x={402} y={opY + 24} text={`v_o = ${fmt(s.vo, 2)} V`} color={C.ink} anchor="end" />
              </Obj>
              <text x={10} y={210} className="w35-tag" fill={C.nodeT}>
                虚地钉住 0 V：i₁ = v₁ / R₁，与 v₂ 无关
              </text>
            </>
          )}
        </svg>
      </div>

      <div className={`w35-readout ${tele.lit ? 'lit' : ''}`} {...tele.on}>
        <span>
          {passive ? 'v_mix' : 'v₋'} <b>{fmt(vNode, 3)} V</b>
        </span>
        <span className="c1">
          i₁ <b>{fmt(i1, 3)} mA</b>
        </span>
        <span className="c2">
          i₂ <b>{fmt(i2, 3)} mA</b>
        </span>
        <span className={Math.abs(err) > 0.05 ? 'bad' : 'good'}>
          i₁ 串扰误差 <b>{fmt(err, 1, true)} %</b>
        </span>
      </div>
    </div>
  );
}
