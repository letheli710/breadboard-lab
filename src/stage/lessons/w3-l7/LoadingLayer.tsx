// W3-L7 layer 01 · 无源级联加载塌陷 vs 运放级联零加载对比. Two R–R dividers (vᵢ = 10 V, R = 10 kΩ):
// stage 2 is two equal resistors of R_in2 / 2, so its own gain stays ½ while its input resistance
// R_in2 follows the slider. "无源直连": stage 2 hangs straight on the stage-1 tap and pulls it
// down (R_th1 = R ∥ R = 5 kΩ); "理想运放隔离": a voltage follower (i₊ = 0, R_o = 0) sits between
// them and supplies the stage-2 current itself, so v₁ stays at 5 V. Readouts: v₁, vₒ, the
// actual gain, the product of the unloaded gains (0.25) and the loading error. Stage params:
// ld_mode ('passive' | 'buffer'), ld_rin2 (kΩ).

import { useStageParam } from '../../stageStore';
import { cascade2, fmt } from './model';
import { Bubble, C, Chip, Ground, Obj, OpAmp, Res, Seg, Slider, Wire } from './parts';
import './w3l7.css';

type Mode = 'passive' | 'buffer';
const VI = 10;
const R = 10;
const Y = 84;
const RAIL = 214;

export default function LoadingLayer() {
  const [mode, setMode] = useStageParam<Mode>('ld_mode', 'passive');
  const [rin2, setRin2] = useStageParam('ld_rin2', 20);
  const buf = mode === 'buffer';
  const r = cascade2(VI, R, rin2, buf);
  const half = rin2 / 2;
  const kOhm = (x: number) => `${fmt(x, 1)}k`;
  const v1Col = buf ? C.tealT : C.redT;
  const v1Bg = buf ? C.tealSoft : C.redSoft;
  const iW = 1.5 + Math.min(5, r.iLoad * 4);

  // gain bars (right): 0.25 is 120 units tall
  const BASE = 200;
  const bh = (a: number) => (a / 0.25) * 120;

  return (
    <div className="w37-layer">
      <div className="w37-controls">
        <Seg<Mode>
          label="级联模式切换"
          value={mode}
          onPick={setMode}
          hot="ld_buffer"
          options={[
            { v: 'passive', text: '无源直连（加载塌陷）', short: '无源直连' },
            { v: 'buffer', text: '理想运放隔离（零加载）', short: '运放隔离' },
          ]}
        />
        <Slider label="后级等效输入电阻 R_in2" value={rin2} min={2} max={100} step={2} onChange={setRin2} show={`${rin2} kΩ`} />
      </div>

      <div className="w37-svgwrap">
        <svg viewBox="0 0 600 252" className="w37-svg" role="img" aria-label={`两级分压器级联：${buf ? '中间插入理想电压跟随器' : '无源直连'}，后级输入电阻 ${rin2} kΩ`}>
          <defs>
            <marker id="w37-ld-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={buf ? C.teal : C.red} />
            </marker>
          </defs>
          <rect x="1" y="1" width="598" height="250" rx="10" className="w37-bg" />

          {/* source and stage-1 divider */}
          <Obj id="ld_src" box={[6, 50, 50, 46]}>
            <circle cx={30} cy={Y} r={5} fill={C.ink} />
            <text x={30} y={66} className="w37-lbl" textAnchor="middle">
              vᵢ = 10 V
            </text>
          </Obj>
          <Wire
            pts={[
              [35, Y],
              [56, Y],
            ]}
          />
          <Obj id="ld_r1" box={[52, 66, 58, 34]}>
            <Res x={56} y={Y - 9} w={48} h={18} label="10k" />
          </Obj>
          <Wire
            pts={[
              [104, Y],
              [buf ? 196 : 312, Y],
            ]}
          />
          <Obj id="ld_r2" box={[112, 104, 50, 64]}>
            <Wire
              pts={[
                [140, Y],
                [140, 110],
              ]}
            />
            <Res x={131} y={110} w={18} h={50} label="10k" side="left" />
            <Wire
              pts={[
                [140, 160],
                [140, RAIL],
              ]}
            />
          </Obj>

          {/* Thevenin view of the stage-1 output */}
          <Obj id="ld_rth" box={[6, 176, 120, 34]}>
            <text x={12} y={190} className="w37-tag" fill={buf ? C.tealT : C.redT}>
              {buf ? '跟随器输出内阻' : '前级输出内阻'}
            </text>
            <text x={12} y={204} className="w37-tag" fill={buf ? C.tealT : C.redT}>
              {buf ? 'R_o = 0' : `R_th1 = R ∥ R = ${fmt(r.Rth, 1)} kΩ`}
            </text>
          </Obj>

          {/* the follower (buffer mode) */}
          {buf && (
            <Obj id="ld_buffer" box={[164, 60, 112, 108]}>
              <text x={156} y={Y - 6} className="w37-tag" fill={C.tealT}>
                i₊ = 0
              </text>
              <OpAmp x={196} y={Y + 14} top="+" color={C.tealT} name="" />
              <Wire
                pts={[
                  [246, Y + 14],
                  [262, Y + 14],
                  [262, 150],
                  [184, 150],
                  [184, Y + 28],
                  [196, Y + 28],
                ]}
                color={C.tealT}
                width={1.8}
              />
              <circle cx={262} cy={Y + 14} r={3.5} fill={C.teal} />
              <rect x={204} y={156} width={64} height={18} rx={9} fill={C.tealSoft} stroke={C.teal} />
              <text x={236} y={169} className="w37-tag" fill={C.tealT} textAnchor="middle">
                R_o = 0
              </text>
              <Wire
                pts={[
                  [262, Y + 14],
                  [278, Y + 14],
                  [278, Y],
                  [312, Y],
                ]}
              />
            </Obj>
          )}

          {/* node v1 */}
          <Obj id="ld_v1" box={[96, 26, 88, 66]}>
            <circle cx={140} cy={Y} r={4.5} fill={buf ? C.teal : C.red} />
            <Bubble x={140} y={40} text={`v₁ = ${fmt(r.v1, 2, false, true)} V${buf ? '' : ' ↓'}`} color={v1Col} bg={v1Bg} />
          </Obj>

          {/* the current stage 2 draws */}
          <Obj id="ld_iload" box={buf ? [266, Y - 30, 56, 30] : [160, 92, 130, 40]}>
            <line
              x1={buf ? 280 : 170}
              y1={buf ? Y - 8 : Y + 12}
              x2={buf ? 306 : 270}
              y2={buf ? Y - 8 : Y + 12}
              stroke={buf ? C.teal : C.red}
              strokeWidth={iW}
              markerEnd="url(#w37-ld-arr)"
            />
            <text x={buf ? 292 : 220} y={buf ? Y - 16 : Y + 38} className="w37-tag" textAnchor="middle" fill={buf ? C.tealT : C.redT}>
              {buf ? `${fmt(r.iLoad, 2, false, true)} mA` : `i_load = ${fmt(r.iLoad, 2, false, true)} mA`}
            </text>
          </Obj>

          {/* stage 2 */}
          <Obj id="ld_stage2" box={[300, 54, 162, 176]}>
            <rect x={304} y={58} width={154} height={168} rx={8} fill="none" stroke="#94a3b8" strokeDasharray="5 4" />
            <Res x={316} y={Y - 9} w={50} h={18} label={kOhm(half)} />
            <Wire
              pts={[
                [312, Y],
                [316, Y],
              ]}
            />
            <Wire
              pts={[
                [366, Y],
                [430, Y],
              ]}
            />
            <Wire
              pts={[
                [420, Y],
                [420, 110],
              ]}
            />
            <Res x={411} y={110} w={18} h={50} label={kOhm(half)} side="right" />
            <Wire
              pts={[
                [420, 160],
                [420, RAIL],
              ]}
            />
            <text x={312} y={124} className="w37-tag" fill={C.muted}>
              后级分压器
            </text>
            <text x={312} y={139} className="w37-tag" fill={C.muted}>
              自身 A₂ = 0.5
            </text>
            <text x={312} y={154} className="w37-tag" fill={C.muted}>
              R_in2 = {rin2} kΩ
            </text>
          </Obj>
          <Obj id="ld_vo" box={[376, 26, 88, 66]}>
            <circle cx={420} cy={Y} r={4.5} fill={buf ? C.teal : C.red} />
            <Bubble x={420} y={40} text={`vₒ = ${fmt(r.vo, 2, false, true)} V`} color={v1Col} bg={v1Bg} />
          </Obj>

          {/* ground rail */}
          <Wire
            pts={[
              [140, RAIL],
              [420, RAIL],
            ]}
            color={C.gnd}
          />
          <Wire
            pts={[
              [280, RAIL],
              [280, RAIL + 8],
            ]}
            color={C.gnd}
          />
          <Ground x={280} y={RAIL + 8} />

          {/* gain bars */}
          <g>
            <text x={530} y={30} className="w37-lbl" textAnchor="middle">
              总增益对比
            </text>
            <line x1={480} y1={BASE} x2={584} y2={BASE} stroke={C.wire} strokeWidth={1.2} />
            <line x1={480} y1={BASE - 120} x2={584} y2={BASE - 120} stroke="#94a3b8" strokeDasharray="4 3" />
            <rect x={490} y={BASE - bh(r.A)} width={32} height={bh(r.A)} rx={3} fill={buf ? C.teal : C.red} />
            <rect x={540} y={BASE - 120} width={32} height={120} rx={3} fill="#cbd5e1" />
            <text x={506} y={BASE - bh(r.A) - 6} className="w37-val" textAnchor="middle" fill={buf ? C.tealT : C.redT}>
              {fmt(r.A, 3)}
            </text>
            <text x={556} y={BASE - 126} className="w37-val" textAnchor="middle" fill={C.ink}>
              0.25
            </text>
            <text x={506} y={BASE + 15} className="w37-tag" textAnchor="middle">
              实际 A
            </text>
            <text x={556} y={BASE + 15} className="w37-tag" textAnchor="middle">
              A₁·A₂
            </text>
            <text x={530} y={BASE + 34} className="w37-tag" textAnchor="middle" fill={buf ? C.tealT : C.redT}>
              误差 {fmt(r.errPct, 1, true, true)}%
            </text>
          </g>
        </svg>
      </div>

      <div className="w37-tele">
        <Chip k="v₁ 前级输出" v={`${fmt(r.v1, 2, false, true)} V`} tone={buf ? 'ok' : 'bad'} id="ld_v1" />
        <Chip k="vₒ 后级输出" v={`${fmt(r.vo, 2, false, true)} V`} id="ld_vo" />
        <Chip k="A 实际" v={fmt(r.A, 3)} tone={buf ? 'ok' : 'bad'} />
        <Chip k="A₁·A₂ 理想" v="0.25" />
        <Chip k="加载误差" v={`${fmt(r.errPct, 1, true, true)}%`} tone={buf ? 'ok' : 'bad'} id="ld_iload" />
      </div>
    </div>
  );
}
