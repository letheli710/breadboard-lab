// W3-L7 layer 03 · 局部级联 vs 跨级全局反馈辨析台 (act 5's circuit, ±15 V): inverting stage
// R₁ = 10k / Rf₁ = 20k → non-inverting stage R₂ = 10k / Rf₂ = 20k (A₂ = +3). The switch puts the
// cross-stage resistor R_G = 30 kΩ from vₒ back to v₋₁ in or out. Out: a pure cascade, A = A₁A₂
// (each stage clipped at the rails); in: the KCL at v₋₁ couples v_o1 and vₒ, the badge switches to
// the nodal result A = −A₂Rf₁R_G / (R₁(R_G + A₂Rf₁)) and the three branch currents into v₋₁ are
// listed with their zero sum. Stage params: gf_rg (boolean), gf_vi.

import { useStageParam } from '../../stageStore';
import { GF, fmt, globalCircuit } from './model';
import { Bubble, C, Chip, Ground, Obj, OpAmp, Res, STAGE_COL, Seg, Slider, Wire, useHot } from './parts';
import './w3l7.css';

const Y = 132;
const TOP = 46;

export default function GlobalLayer() {
  const [rg, setRg] = useStageParam('gf_rg', true);
  const [vi, setVi] = useStageParam('gf_vi', 1);
  const r = globalCircuit(vi, rg);
  const badge = useHot('gf_badge');
  const gCol = rg ? C.red : '#94a3b8';
  const u1 = STAGE_COL[0];
  const u2 = STAGE_COL[1];

  return (
    <div className="w37-layer">
      <div className="w37-controls">
        <Seg<'open' | 'closed'>
          label="跨级全局反馈电阻 R_G"
          value={rg ? 'closed' : 'open'}
          onPick={(v) => setRg(v === 'closed')}
          hot="gf_rg"
          options={[
            { v: 'open', text: '断开（纯级联，A = A1·A2）', short: '断开 R_G' },
            { v: 'closed', text: '闭合 R_G = 30 kΩ（全局反馈）', short: '闭合 R_G' },
          ]}
        />
        <Slider label="输入电压 vᵢ" value={vi} min={-3} max={3} step={0.5} onChange={setVi} show={`${fmt(vi, 1, true, true)} V`} />
      </div>

      <div className="w37-svgwrap">
        <svg viewBox="0 0 640 252" className="w37-svg" role="img" aria-label={`两级运放：反相级 → 同相级，跨级电阻 R_G ${rg ? '闭合' : '断开'}`}>
          <rect x="1" y="1" width="638" height="250" rx="10" className="w37-bg" />

          {/* the cross-stage resistor */}
          <Obj id="gf_rg" box={[110, TOP - 26, 380, 42]}>
            <Wire
              pts={[
                [120, Y],
                [120, TOP],
                [162, TOP],
              ]}
              color={gCol}
              width={rg ? 2.4 : 1.6}
              dashed={!rg}
            />
            <rect x={162} y={TOP - 11} width={80} height={22} rx={4} fill={rg ? C.redSoft : '#f1f5f9'} stroke={gCol} strokeWidth={1.8} />
            <text x={202} y={TOP + 4} className="w37-val" textAnchor="middle" fill={rg ? C.redT : '#5f626b'}>
              R_G = 30k
            </text>
            <Wire
              pts={[
                [242, TOP],
                [480, TOP],
                [480, Y + 28],
              ]}
              color={gCol}
              width={rg ? 2.4 : 1.6}
              dashed={!rg}
            />
            <text x={362} y={TOP - 8} className="w37-tag" textAnchor="middle" fill={rg ? C.redT : '#5f626b'}>
              {rg ? '跨级全局反馈支路（破坏级联）' : '断开：没有跨级支路'}
            </text>
          </Obj>

          {/* input and R1 */}
          <circle cx={28} cy={Y} r={4.5} fill="#1e40af" />
          <Bubble x={46} y={Y - 34} text={`vᵢ = ${fmt(vi, 1, false, true)} V`} color="#1e40af" bg="#eff6ff" />
          <Wire
            pts={[
              [32, Y],
              [50, Y],
            ]}
          />
          <Res x={50} y={Y - 9} w={52} h={18} label="R₁ 10k" />
          <Wire
            pts={[
              [102, Y],
              [170, Y],
            ]}
          />

          {/* v-1 node */}
          <Obj id="gf_vm1" box={[64, Y - 10, 82, 58]}>
            <circle cx={132} cy={Y} r={4.5} fill={rg ? C.red : C.ink} />
            <text x={104} y={Y + 24} className="w37-tag" textAnchor="middle" fill={rg ? C.redT : C.ink}>
              v₋₁ = 0
            </text>
            <text x={104} y={Y + 38} className="w37-tag" textAnchor="middle" fill={C.muted}>
              {rg ? '三条支路汇聚' : '两条支路'}
            </text>
          </Obj>
          {rg && <circle cx={120} cy={Y} r={3} fill={C.red} />}

          {/* Rf1 */}
          <Wire
            pts={[
              [144, Y],
              [144, Y - 40],
              [156, Y - 40],
            ]}
            width={1.7}
          />
          <Obj id="gf_rf1" box={[152, Y - 53, 66, 26]}>
            <Res x={156} y={Y - 49} w={58} h={18} label="Rf₁ 20k" />
          </Obj>
          <Wire
            pts={[
              [214, Y - 40],
              [236, Y - 40],
              [236, Y + 14],
            ]}
            width={1.7}
          />
          <circle cx={144} cy={Y} r={3} fill={C.ink} />

          {/* U1 */}
          <Obj id="gf_u1" box={[166, Y - 20, 58, 68]}>
            <OpAmp x={170} y={Y + 14} top="−" color={u1.line} fill={u1.soft} name="U₁" />
          </Obj>
          <Wire
            pts={[
              [170, Y + 28],
              [158, Y + 28],
              [158, Y + 56],
            ]}
            width={1.7}
          />
          <Ground x={158} y={Y + 56} />
          <Wire
            pts={[
              [220, Y + 14],
              [340, Y + 14],
            ]}
          />

          {/* vo1 */}
          <Obj id="gf_vo1" box={[230, Y - 22, 132, 42]}>
            <circle cx={236} cy={Y + 14} r={4} fill={C.teal} />
            <Bubble x={300} y={Y - 14} text={`v_o1 = ${fmt(r.vo1, 3)} V`} color={C.tealT} bg={C.tealSoft} />
          </Obj>

          {/* U2 (non-inverting, A2 = +3) */}
          <Obj id="gf_u2" box={[336, Y - 22, 112, 84]}>
            <OpAmp x={340} y={Y + 28} top="+" color={u2.line} fill={u2.soft} name="U₂" />
            <text x={372} y={Y - 8} className="w37-tag" fill={u2.text}>
              局部 A₂ = +3
            </text>
          </Obj>
          <Wire
            pts={[
              [340, Y + 42],
              [324, Y + 42],
              [324, Y + 80],
            ]}
            width={1.7}
          />
          <circle cx={324} cy={Y + 80} r={3} fill={C.ink} />
          <Wire
            pts={[
              [324, Y + 80],
              [310, Y + 80],
            ]}
            width={1.7}
          />
          <Res x={258} y={Y + 71} w={52} h={18} label="R₂ 10k" />
          <Wire
            pts={[
              [258, Y + 80],
              [246, Y + 80],
              [246, Y + 88],
            ]}
            width={1.7}
          />
          <Ground x={246} y={Y + 88} />
          <Wire
            pts={[
              [324, Y + 80],
              [340, Y + 80],
            ]}
            width={1.7}
          />
          <Res x={340} y={Y + 71} w={58} h={18} label="Rf₂ 20k" />
          <Wire
            pts={[
              [398, Y + 80],
              [420, Y + 80],
              [420, Y + 28],
            ]}
            width={1.7}
          />
          <Wire
            pts={[
              [390, Y + 28],
              [604, Y + 28],
            ]}
          />
          <circle cx={420} cy={Y + 28} r={3} fill={C.ink} />

          {/* vo */}
          <Obj id="gf_vo" box={[496, Y + 30, 140, 56]}>
            <circle cx={604} cy={Y + 28} r={4.5} fill={C.purpleT} />
            <Bubble x={560} y={Y + 58} text={`vₒ = ${fmt(r.vo, 2, false, true)} V${r.sat ? ' 钳位' : ''}`} color={r.sat ? C.redT : C.purpleT} bg={r.sat ? C.redSoft : '#f3e8ff'} />
          </Obj>
          {rg && <circle cx={480} cy={Y + 28} r={3.5} fill={C.red} />}

          <text x={630} y={244} className="w37-tag" textAnchor="end" fill={C.muted}>
            电源轨 ±{GF.rail} V
          </text>
        </svg>
      </div>

      <div className={`w37-badge ${rg ? 'bad' : 'ok'} ${badge.lit ? 'lit' : ''}`} {...badge.on}>
        {rg ? `存在跨级反馈：禁止乘法，已切换全局节点法 A = ${fmt(r.Atrue, 2, true)}` : `纯级联成立：A = A₁ × A₂ = (−2) × (+3) = ${fmt(r.Anaive, 2, true)}`}
        {rg && (
          <span className="kcl">
            节点 v₋₁ 的 KCL：vᵢ/R₁ + v_o1/Rf₁ + vₒ/R_G = {fmt(r.i1, 3, false, true)} {r.if1 < 0 ? '−' : '+'} {fmt(Math.abs(r.if1), 3, false, true)} {r.iG < 0 ? '−' : '+'}{' '}
            {fmt(Math.abs(r.iG), 3, false, true)} = 0 mA
          </span>
        )}
      </div>
      <div className="w37-tele">
        <Chip k="v_o1" v={`${fmt(r.vo1, 3)} V`} id="gf_vo1" />
        <Chip k="vₒ" v={`${fmt(r.vo, 2, false, true)} V`} tone={r.sat ? 'bad' : undefined} id="gf_vo" />
        <Chip k="乘法法则 A₁A₂" v={fmt(r.Anaive, 2, true)} tone={rg ? 'bad' : 'ok'} />
        <Chip k="真实增益（节点法）" v={fmt(r.Atrue, 3, true)} tone="info" id="gf_badge" />
      </div>
    </div>
  );
}
