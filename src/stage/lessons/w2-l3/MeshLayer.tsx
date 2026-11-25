// W2-L3 layer 01 · 顺时针网孔电流与共享支路叠加 (acts 1–2): the standard two-mesh circuit of
// fig. 2-1. View switch: 网孔窗格 (the two panes) / 大外环回路 (the outer loop: a loop, not a
// mesh) / 非平面反例 (K₃,₃). Hovering the shared resistor R₂ splits its current into i₁↓ and ↑i₂;
// the V₁ / V₂ sliders re-solve the meshes and the telemetry keeps both KVL sums at zero.
// Stage params: l1_view, l1_v1, l1_v2.

import { useLit, useStage, useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { circuit, fmt, solve, texNum, type Circuit } from './circuits';
import { hoverOfFor, litElements, litMeshes } from './ids';
import { K33, Schematic } from './Schematic';
import './w2l3.css';

export type L1View = 'mesh' | 'loop' | 'k33';

const VIEWS: [L1View, string][] = [
  ['mesh', '网孔窗格'],
  ['loop', '大外环回路'],
  ['k33', '非平面反例'],
];

export default function MeshLayer() {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const [view, setView] = useStageParam<L1View>('l1_view', 'mesh');
  const [v1, setV1] = useStageParam('l1_v1', 20);
  const [v2, setV2] = useStageParam('l1_v2', 5);
  const base = circuit('std');
  const c: Circuit = { ...base, left: [{ ...base.left[0], value: v1 }], right: [{ ...base.right[0], value: v2 }] };
  const s = solve(c);
  const has = (id: string) => lit.includes(id);
  const showK33 = view === 'k33';
  const split = has('shared_r2') ? `I_R₂(向下) = i₁ − i₂ = ${fmt(s.i1)} − ${s.i2 < 0 ? `(${fmt(s.i2)})` : fmt(s.i2)} = ${fmt(s.iMid)} A` : null;

  return (
    <div className="w23-layer">
      <div className="w23-dock" role="group" aria-label="控制条">
        <div className="w23-row">
          <span className="w23-seg" role="group" aria-label="视图">
            {VIEWS.map(([id, label]) => (
              <button key={id} className={`w23-btn ${view === id ? 'on' : ''}`} aria-pressed={view === id} onClick={() => setView(id)}>
                {label}
              </button>
            ))}
          </span>
        </div>
        {!showK33 && (
          <div className="w23-row w23-sliders">
            <label className="w23-slider">
              <span>
                V₁ <b>{fmt(v1)} V</b>
              </span>
              <input type="range" min={0} max={40} step={1} value={v1} onChange={(e) => setV1(Number(e.target.value))} aria-label="电压源 V1" />
            </label>
            <label className="w23-slider">
              <span>
                V₂ <b>{fmt(v2)} V</b>
              </span>
              <input type="range" min={0} max={20} step={1} value={v2} onChange={(e) => setV2(Number(e.target.value))} aria-label="电压源 V2" />
            </label>
            <button
              className="w23-btn small"
              onClick={() => {
                setV1(20);
                setV2(5);
              }}
              disabled={v1 === 20 && v2 === 5}
            >
              复位
            </button>
          </div>
        )}
      </div>

      {showK33 ? (
        <K33 lit={has('nonplanar_k33')} onHover={(id) => setHover(id ? [id] : null)} />
      ) : (
        <Schematic
          c={c}
          sol={s}
          litEls={litElements(c, lit)}
          litMesh={litMeshes(lit)}
          panes={view === 'mesh'}
          outerLoop={view === 'loop' || has('outer_loop')}
          outerLit={has('outer_loop')}
          split={split}
          flows
          hoverOf={hoverOfFor(c)}
          onHover={(id) => setHover(id ? [id] : null)}
          label={`标准双网孔电路：V1 ${fmt(v1)} V，R1 5 Ω，R2 10 Ω，R3 5 Ω，V2 ${fmt(v2)} V`}
        />
      )}

      {showK33 ? (
        <p className="w23-info">平面电路：至少存在一种无交叉的画法。K₃,₃ 怎么重画都有交叉，没有清晰的“窗格”，网孔分析法在这里失效。</p>
      ) : (
        <div className="w23-telemetry" aria-label="实时网孔电流与 KVL 验算">
          <span className={`w23-tm ${has('mesh_i1') ? 'lit' : ''}`}>
            <Tex tex={String.raw`i_1 = ${texNum(s.i1)}\text{ A}`} />
          </span>
          <span className={`w23-tm ${has('mesh_i2') ? 'lit' : ''}`}>
            <Tex tex={String.raw`i_2 = ${texNum(s.i2)}\text{ A}`} />
          </span>
          <span className={`w23-tm ${has('shared_r2') ? 'lit' : ''}`}>
            <Tex tex={String.raw`I_{R_2}^{\downarrow} = i_1 - i_2 = ${texNum(s.iMid)}\text{ A}`} />
          </span>
          <span className="w23-tm ok wide">
            Mesh 1 KVL
            <Tex tex={String.raw`-${texNum(v1)} + 5(${texNum(s.i1)}) + 10(${texNum(s.iMid)}) = ${texNum(s.kvl[0] ?? 0)}`} />
          </span>
          <span className="w23-tm ok wide">
            Mesh 2 KVL
            <Tex tex={String.raw`10(${texNum(-s.iMid)}) + 5(${texNum(s.i2)}) + ${texNum(v2)} = ${texNum(s.kvl[1] ?? 0)}`} />
          </span>
          <span className="w23-tm muted wide">虚线 = 真实支路电流：越快电流越大，倒着走表示与参考方向相反</span>
        </div>
      )}
    </div>
  );
}
