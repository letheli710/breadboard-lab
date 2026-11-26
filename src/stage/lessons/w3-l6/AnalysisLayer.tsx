// W3-L6 layer 02 · 节点法与叠加法双视角拆解台. The four-resistor difference amplifier (Sadiku
// Fig. 5.19) in three views: the whole circuit for node analysis (KCL at a and b, virtual open
// i₋ = i₊ = 0, virtual short v_a = v_b), sub-circuit A (v2 = 0: an inverting amplifier, R3/R4 carry
// no current so v_b1 = 0) and sub-circuit B (v1 = 0: the R3/R4 divider, then a non-inverting
// amplifier). Presets: the matched gain-10 amplifier of acts 2–4, Sadiku Example 5.7 and Practice
// Problem 5.7; three input pairs. Example 5.7 is the guided example of act 5, so R2, R4 and what
// follows from them stay covered until the example has reached them (w36_ex = steps solved) or the
// student asks. Stage params: w36_view, w36_preset, w36_in, w36_ex.

import type { ReactNode } from 'react';
import { useStageParam } from '../../stageStore';
import { EX_5_7, MATCHED_10, PP_5_7, coeffs, fmt, kOhm, nodal, superpose, type Four } from './model';
import { Bubble, C, Dot, Gnd, Obj, OpAmp, Subs, Wire, useEx57, useHot, zigH, zigV } from './parts';
import './w3l6.css';

export type View = 'nodal_full' | 'superposition_v1_only' | 'superposition_v2_only';
export type Preset = 'matched_gain_10' | 'sadiku_example_5_7' | 'sadiku_practice_5_7';
export type Inputs = 'sensor' | 'cm2' | 'mix';

const VIEWS: { id: View; label: string; more: string }[] = [
  { id: 'nodal_full', label: '节点法整体', more: '' },
  { id: 'superposition_v1_only', label: '子电路 A', more: ' · v₂ = 0' },
  { id: 'superposition_v2_only', label: '子电路 B', more: ' · v₁ = 0' },
];
const PRESETS: Record<Preset, { r: Four; label: string }> = {
  matched_gain_10: { r: MATCHED_10, label: '配对增益 10（10k/100k/10k/100k）' },
  sadiku_example_5_7: { r: EX_5_7, label: 'Sadiku Ex 5.7（vₒ = −5v₁ + 3v₂）' },
  sadiku_practice_5_7: { r: PP_5_7, label: 'Practice 5.7（增益 4：10k/40k/10k/40k）' },
};
const INPUTS: Record<Inputs, { v1: number; v2: number; label: string }> = {
  sensor: { v1: 4.995, v2: 5.005, label: '含噪传感 4.995 / 5.005 V' },
  cm2: { v1: 2, v2: 2, label: '纯共模 2 / 2 V' },
  mix: { v1: 1, v2: 2, label: '一般输入 1 / 2 V' },
};

const YA = 66;
const YB = 130;
const XN = 150;
const XOP = 240;
const YO = 98;
const XO = 350;

export default function AnalysisLayer() {
  const [view, setView] = useStageParam<View>('w36_view', 'nodal_full');
  const [preset, setPreset] = useStageParam<Preset>('w36_preset', 'matched_gain_10');
  const [inp, setInp] = useStageParam<Inputs>('w36_in', 'sensor');
  const [ex, setEx] = useEx57();
  const r = PRESETS[preset].r;
  const { v1, v2 } = INPUTS[inp];
  const n = nodal(r, v1, v2);
  const s = superpose(r, v1, v2);
  const k = coeffs(r);

  // Example 5.7: what the guided example has reached so far
  const ex57 = preset === 'sadiku_example_5_7';
  const seen = (step: number) => !ex57 || ex >= step;
  const showR2 = seen(2);
  const showDiv = seen(3);
  const showR4 = seen(4);
  const showOut = seen(5);
  const masked = ex57 && ex < 5;
  const q = (on: boolean, x: number, unit = 'V', dp = 3) => (on ? `${fmt(x, dp)} ${unit}` : `? ${unit}`);

  const A = view === 'superposition_v1_only';
  const B = view === 'superposition_v2_only';
  const vaShown = A ? 0 : B ? s.vb2 : n.va;
  const vaOn = A ? true : showDiv;
  const voShown = A ? s.vo1 : B ? s.vo2 : n.vo;
  const voOn = A ? showR2 : showOut;
  const sub = A ? '1' : B ? '2' : '';

  const cells: { id: string; label: ReactNode; text: string; on: boolean }[] = [
    {
      id: 'ro_va',
      label: (
        <>
          v<sub>a</sub> = v<sub>b</sub>
        </>
      ),
      text: q(showDiv, n.va),
      on: view === 'nodal_full',
    },
    {
      id: 'ro_vo1',
      label: (
        <>
          v<sub>o1</sub> 反相通道
        </>
      ),
      text: q(showR2, s.vo1),
      on: A,
    },
    {
      id: 'ro_vo2',
      label: (
        <>
          v<sub>o2</sub> 同相通道
        </>
      ),
      text: q(showOut, s.vo2),
      on: B,
    },
    {
      id: 'ro_vo',
      label: (
        <>
          v<sub>o</sub> = v<sub>o1</sub> + v<sub>o2</sub>
        </>
      ),
      text: q(showOut, s.vo),
      on: true,
    },
  ];

  return (
    <div className="w36-layer">
      <div className="w36-controls">
        <div className="w36-seg" role="radiogroup" aria-label="分析视角">
          {VIEWS.map((v) => (
            <button key={v.id} role="radio" aria-checked={view === v.id} className={view === v.id ? 'on' : ''} onClick={() => setView(v.id)}>
              {v.label}
              <small>{v.more}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="w36-controls">
        <select className="w36-select" value={preset} onChange={(e) => setPreset(e.target.value as Preset)} aria-label="电路预设">
          {(Object.keys(PRESETS) as Preset[]).map((p) => (
            <option key={p} value={p}>
              {PRESETS[p].label}
            </option>
          ))}
        </select>
        <select className="w36-select" value={inp} onChange={(e) => setInp(e.target.value as Inputs)} aria-label="输入电压 v₁ / v₂">
          {(Object.keys(INPUTS) as Inputs[]).map((p) => (
            <option key={p} value={p}>
              {INPUTS[p].label}
            </option>
          ))}
        </select>
      </div>

      <div className="w36-svgwrap">
        <svg viewBox="0 0 440 214" className="w36-svg" role="img" aria-label={`差分放大器 · ${VIEWS.find((v) => v.id === view)!.label}`}>
          <rect x="1" y="1" width="438" height="212" rx="10" className="w36-bg" />

          {/* v1 → R1 → node a */}
          {B ? (
            <Obj id="gnd_v1" box={[22, YA - 12, 40, 42]}>
              <Wire d={`M 46 ${YA} H 62 M 46 ${YA} V ${YA + 14}`} />
              <Gnd x={46} y={YA + 14} />
              <text x={30} y={YA - 4} className="w36-tag" textAnchor="middle" fill={C.muted}>
                v₁=0
              </text>
            </Obj>
          ) : (
            <Obj id="in_v1" box={[4, YA - 16, 58, 40]}>
              <circle cx={40} cy={YA} r={4} fill="#fff" stroke={C.v1} strokeWidth={2} />
              <Wire d={`M 44 ${YA} H 62`} />
              <text x={30} y={YA + 4} className="w36-lbl" textAnchor="end" fill={C.v1T}>
                v₁
              </text>
              <text x={36} y={YA + 18} className="w36-tag" textAnchor="middle" fill={C.v1T}>
                {fmt(v1, 3)} V
              </text>
            </Obj>
          )}
          <Obj id="r1" box={[60, YA - 12, 66, 32]}>
            <polyline points={zigH(62, 122, YA)} className="w36-res" />
            <text x={92} y={YA + 18} className="w36-lbl" textAnchor="middle" fill={C.resT}>
              R₁ = {kOhm(r.R1)}
            </text>
          </Obj>
          {view === 'nodal_full' && (
            <text x={92} y={YA - 12} className="w36-tag" textAnchor="middle" fill={C.v1T}>
              i₁ →
            </text>
          )}
          <Wire d={`M 122 ${YA} H ${XOP}`} />

          {/* R2 feedback */}
          <Wire d={`M ${XN} ${YA} V 26 H 190 M 260 26 H ${XO} V ${YO}`} />
          <Obj id="r2" box={[186, 8, 78, 32]}>
            <polyline points={zigH(190, 260, 26)} className="w36-res" />
            <text x={225} y={16} className="w36-lbl" textAnchor="middle" fill={C.resT}>
              R₂ = {showR2 ? kOhm(r.R2) : '?'}
            </text>
          </Obj>
          {view === 'nodal_full' && (
            <text x={290} y={20} className="w36-tag" textAnchor="middle" fill={C.v1T}>
              i₂ →
            </text>
          )}

          {/* v2 → R3 → node b, R4 to ground */}
          {A ? (
            <Obj id="gnd_v2" box={[22, YB - 12, 40, 42]}>
              <Wire d={`M 46 ${YB} H 62 M 46 ${YB} V ${YB + 14}`} />
              <Gnd x={46} y={YB + 14} />
              <text x={30} y={YB - 4} className="w36-tag" textAnchor="middle" fill={C.muted}>
                v₂=0
              </text>
            </Obj>
          ) : (
            <Obj id="in_v2" box={[4, YB - 16, 58, 40]}>
              <circle cx={40} cy={YB} r={4} fill="#fff" stroke={C.v2} strokeWidth={2} />
              <Wire d={`M 44 ${YB} H 62`} />
              <text x={30} y={YB + 4} className="w36-lbl" textAnchor="end" fill={C.v2T}>
                v₂
              </text>
              <text x={36} y={YB + 18} className="w36-tag" textAnchor="middle" fill={C.v2T}>
                {fmt(v2, 3)} V
              </text>
            </Obj>
          )}
          <Obj id="divider" box={[56, YB - 16, 120, 92]} dim={A}>
            {null}
          </Obj>
          <Obj id="r3" box={[60, YB - 12, 66, 32]} dim={A}>
            <polyline points={zigH(62, 122, YB)} className={`w36-res${A ? ' off' : ''}`} />
            <text x={92} y={YB + 18} className="w36-lbl" textAnchor="middle" fill={A ? C.muted : C.resT}>
              R₃ = {kOhm(r.R3)}
            </text>
          </Obj>
          {view === 'nodal_full' && (
            <text x={92} y={YB - 12} className="w36-tag" textAnchor="middle" fill={C.v2T}>
              i₃ →
            </text>
          )}
          <Wire d={`M 122 ${YB} H ${XOP} M ${XN} ${YB} V 146 M ${XN} 196 V 200`} dashed={false} />
          <Obj id="r4" box={[96, 142, 76, 58]} dim={A}>
            <polyline points={zigV(XN, 146, 196)} className={`w36-res${A ? ' off' : ''}`} />
            <text x={XN - 12} y={174} className="w36-lbl" textAnchor="end" fill={A ? C.muted : C.resT}>
              R₄ = {showR4 ? kOhm(r.R4) : '?'}
            </text>
          </Obj>
          {view === 'nodal_full' && (
            <text x={XN + 10} y={168} className="w36-tag" fill={C.v2T}>
              i₄ ↓
            </text>
          )}
          <Gnd x={XN} y={200} />

          {/* nodes a, b and the two golden rules */}
          <Obj id="node_a" box={[XN - 8, YA - 8, 16, 16]}>
            <Dot x={XN} y={YA} color={C.node} r={4.5} />
          </Obj>
          <Obj id="node_b" box={[XN - 8, YB - 8, 16, 16]}>
            <Dot x={XN} y={YB} color={C.node} r={4.5} />
          </Obj>
          <text x={XN - 4} y={YA - 8} className="w36-tag" textAnchor="end" fill={C.node}>
            a
          </text>
          <text x={XN - 8} y={YB + 15} className="w36-tag" textAnchor="end" fill={C.node}>
            b
          </text>
          <Obj id="ro_va" box={[136, YA + 6, 92, 52]}>
            <Bubble x={182} y={YA + 18} text={`v_a${sub} = ${vaOn ? fmt(vaShown, 3) : '?'} V`} color={C.node} />
            <Bubble x={182} y={YB - 16} text={`v_b${sub} = ${vaOn ? fmt(vaShown, 3) : '?'} V`} color={C.node} />
          </Obj>
          <Obj id="vshort" box={[226, YA + 4, 12, YB - YA - 8]}>
            <line x1={232} y1={YA + 6} x2={232} y2={YB - 6} stroke={C.node} strokeWidth={1.6} strokeDasharray="4 3" />
          </Obj>
          <Obj id="vopen" box={[196, YA - 16, 44, 12]}>
            <text x={236} y={YA - 6} className="w36-tag" textAnchor="end" fill={C.muted}>
              i₋ = 0
            </text>
          </Obj>
          <Obj id="vopen" box={[196, YB + 4, 44, 12]}>
            <text x={236} y={YB + 14} className="w36-tag" textAnchor="end" fill={C.muted}>
              i₊ = 0
            </text>
          </Obj>

          {/* the op amp and the output */}
          <Obj id="opamp" box={[XOP - 4, YO - 66, 92, 132]}>
            <OpAmp x={XOP} y={YO} w={86} h={128} />
            <text x={XOP + 34} y={YO + 4} className="w36-tag" textAnchor="middle" fill={C.muted}>
              理想运放
            </text>
          </Obj>
          <Wire d={`M ${XOP + 86} ${YO} H 410`} />
          <Dot x={XO} y={YO} />
          <Obj id="out_vo" box={[362, YO - 30, 76, 62]}>
            <circle cx={410} cy={YO} r={4} fill="#fff" stroke={C.out} strokeWidth={2} />
            <text x={410} y={YO - 10} className="w36-lbl" textAnchor="middle" fill={C.outT}>
              <Subs s={`v_o${sub}`} />
            </text>
            <Bubble x={398} y={YO + 22} text={voOn ? `${fmt(voShown, 3, true)} V` : '? V'} color={C.out} />
          </Obj>

          {/* view notes */}
          {A && (
            <text x={XN + 24} y={196} className="w36-tag" fill={C.node}>
              <Subs s="i₊ = 0 ⇒ R₃∥R₄ 无压降 ⇒ v_b1 = 0" />
            </text>
          )}
          {B && (
            <text x={XN + 24} y={196} className="w36-tag" fill={C.node}>
              <Subs s={`v_b2 = R₄/(R₃ + R₄) · v₂${showDiv ? ` = ${fmt(s.vb2, 3)} V` : ''}`} />
            </text>
          )}
          {view === 'nodal_full' && (
            <text x={XN + 24} y={196} className="w36-tag" fill={C.node}>
              <Subs s="虚短 v_a = v_b（不是虚地！）" />
            </text>
          )}
        </svg>
      </div>

      <div className="w36-readout">
        <div className="w36-rgrid">
          {cells.map((c) => (
            <Cell key={c.id} id={c.id} label={c.label} text={c.text} on={c.on} />
          ))}
        </div>
        <div className={`w36-readout-foot${masked ? ' has-btn' : ''}`}>
          {masked ? (
            <button className="w36-btn" onClick={() => setEx(5)}>
              揭晓数值（第 5 幕例题，先自己做）
            </button>
          ) : (
            <span>
              Eq. 5.16：v<sub>o</sub> = {fmt(k.a, 3)}·v₂ − {fmt(k.b, 3)}·v₁
              {Math.abs(k.a - k.b) < 1e-9 ? `（配对：= ${fmt(k.b, 3)}·(v₂ − v₁)）` : '（不配对：加权减法）'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Cell({ id, label, text, on }: { id: string; label: ReactNode; text: string; on: boolean }) {
  const hot = useHot(id);
  return (
    <div className={`w36-cell${on ? ' on' : ''}${hot.lit ? ' lit' : ''}`} {...hot.on}>
      <span className="k">{label}</span>
      <b>{text}</b>
    </div>
  );
}
