// W2-L3 layer 02 · 含电流源与超网孔外环绕行 (acts 3–5): Case 1 (fig. 3-1, the edge source locks
// i₂), Case 2 (fig. 4-1, the shared source and the supermesh) and the guided example (fig. 5-1).
// 构造超网孔 dims the shared branch (series resistor included) and runs the amber outer path;
// the KCL switch draws i₁ / i₂ at node b with the constraint; the slider changes the resistor in
// series with the current source: the mesh currents stay put, its power and the source voltage
// move. The guided example's numbers stay hidden until its steps are answered (ex_reveal).
// Stage params: l2_case, l2_cut, l2_kcl, l2_rs_c1 / l2_rs_c2 / l2_rs_ex, ex_reveal.

import { useLit, useStage, useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { circuit, fmt, SERIES_DEFAULT, solve, texNum, type CaseId, type Row } from './circuits';
import { hoverOfFor, litElements, litMeshes } from './ids';
import { Schematic } from './Schematic';
import './w2l3.css';

export type L2Case = Exclude<CaseId, 'std'>;

const CASES: [L2Case, string][] = [
  ['c1', 'Case 1 边缘电流源'],
  ['c2', 'Case 2 共享·超网孔'],
  ['ex', '第 5 幕例题'],
];

/** the KCL row as plain text, e.g. "i₂ − i₁ = 6" */
export function kclText(r: Row): string {
  return r.a[0] > 0 ? `i₁ − i₂ = ${fmt(r.b)}` : `i₂ − i₁ = ${fmt(r.b)}`;
}
export function kclTex(r: Row): string {
  return r.a[0] > 0 ? String.raw`i_1 - i_2 = ${texNum(r.b)}` : String.raw`i_2 - i_1 = ${texNum(r.b)}`;
}

/** supermesh KVL with the circuit's numbers */
function superTex(id: L2Case): string {
  return id === 'c2' ? String.raw`-20 + 6 i_1 + 10 i_2 + 4 i_2 = 0` : String.raw`-30 + 4 i_1 + 2 i_2 + 6 i_2 + 6 = 0`;
}

export default function SourceLayer() {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const [cid, setCase] = useStageParam<L2Case>('l2_case', 'c1');
  const [cutRaw, setCut] = useStageParam('l2_cut', false);
  const [kclRaw, setKcl] = useStageParam('l2_kcl', false);
  const [rs, setRs] = useStageParam(`l2_rs_${cid}`, SERIES_DEFAULT[cid] ?? 0);
  const [reveal, setReveal] = useStageParam('ex_reveal', 0);
  const c = circuit(cid, rs);
  const s = solve(c);
  const has = (id: string) => lit.includes(id);
  const edge = cid === 'c1';
  const cut = !edge && cutRaw;
  const kclOn = !edge && (kclRaw || has('kcl_node_b'));
  const ex = cid === 'ex';
  const show = (level: number) => !ex || reveal >= level;
  const kclRow = s.rows[1];
  const seriesName = edge ? 'R₃' : 'Rₛ';
  const seriesDefault = SERIES_DEFAULT[cid] ?? 0;
  const q = '?';

  return (
    <div className="w23-layer">
      <div className="w23-dock" role="group" aria-label="控制条">
        <div className="w23-row">
          <span className="w23-seg" role="group" aria-label="电路">
            {CASES.map(([id, label]) => (
              <button key={id} className={`w23-btn ${cid === id ? 'on' : ''}`} aria-pressed={cid === id} onClick={() => setCase(id)}>
                {label}
              </button>
            ))}
          </span>
        </div>
        <div className="w23-row">
          <button className={`w23-btn primary ${cut ? 'on' : ''}`} aria-pressed={cut} disabled={edge} onClick={() => setCut(!cutRaw)}>
            {cut ? '放回共享支路' : '构造超网孔（切除共享支路）'}
          </button>
          <button className={`w23-switch ${kclOn ? 'on' : ''}`} role="switch" aria-checked={kclOn} disabled={edge} onClick={() => setKcl(!kclRaw)}>
            <span className="knob" aria-hidden />
            节点 b 的 KCL
          </button>
          <label className="w23-slider inline">
            <span>
              {seriesName}（与 Is 串联）<b>{fmt(rs)} Ω</b>
            </span>
            <input type="range" min={0} max={20} step={1} value={rs} onChange={(e) => setRs(Number(e.target.value))} aria-label={`与电流源串联的电阻 ${seriesName}`} />
          </label>
          {rs !== seriesDefault && (
            <button className="w23-btn small" onClick={() => setRs(seriesDefault)}>
              复位 {fmt(seriesDefault)} Ω
            </button>
          )}
          {ex && reveal < 5 && (
            <button className="w23-btn small" onClick={() => setReveal(5)}>
              揭晓例题数值
            </button>
          )}
        </div>
      </div>

      <Schematic
        c={c}
        sol={show(4) ? s : null}
        litEls={litElements(c, lit)}
        litMesh={litMeshes(lit)}
        cut={cut}
        superPath={has('supermesh') && !edge}
        superLit={has('supermesh')}
        kcl={kclOn ? { eq: show(3) ? kclText(kclRow) : '？（放回共享支路列 KCL）' } : null}
        kclLit={has('kcl_node_b') || kclOn}
        va={show(4) ? `Vₐ = ${fmt(s.va)} V` : 'Vₐ = ?'}
        vaLit={has('node_a')}
        lock={edge ? `边缘锁定：i₂ = −Is = ${fmt(s.i2)} A` : null}
        split={edge && has('shared_r2') ? `I_R₂(向下) = i₁ − i₂ = ${fmt(s.iMid)} A` : null}
        flows={show(4)}
        hoverOf={hoverOfFor(c)}
        onHover={(id) => setHover(id ? [id] : null)}
        label={
          edge
            ? 'Case 1：V1 24 V，R1 2 Ω，R2 4 Ω，R3 与右侧向上 3 A 电流源串联'
            : ex
              ? '第 5 幕例题：V1 30 V，V2 6 V，R1 4 Ω，R2 2 Ω，R3 6 Ω，共享支路 Rs 串联向下 3 A'
              : 'Case 2：V1 20 V，R1 6 Ω，R2 10 Ω，R3 4 Ω，共享支路 Rs 串联向上 6 A'
        }
      />

      <div className="w23-telemetry" aria-label="实时网孔方程与验算">
        {edge ? (
          <>
            <span className={`w23-tm ok ${has('edge_is') ? 'lit' : ''}`}>
              边缘锁定
              <Tex tex={String.raw`i_2 = -I_s = ${texNum(s.i2)}\text{ A}`} />
            </span>
            <span className="w23-tm wide">
              Mesh 1 KVL
              <Tex tex={String.raw`-24 + 2 i_1 + 4(i_1 - i_2) = 0 \implies i_1 = ${texNum(s.i1)}\text{ A}`} />
            </span>
          </>
        ) : (
          <>
            <span className={`w23-tm wide ${has('supermesh') ? 'lit' : ''}`}>
              超网孔 KVL
              {show(2) ? <Tex tex={superTex(cid)} /> : <b>{q}</b>}
            </span>
            <span className={`w23-tm ${has('kcl_node_b') ? 'lit' : ''}`}>
              内部 KCL
              {show(3) ? <Tex tex={kclTex(kclRow)} /> : <b>{q}</b>}
            </span>
          </>
        )}
        <span className={`w23-tm ${has('mesh_i1') ? 'lit' : ''}`}>{show(4) ? <Tex tex={String.raw`i_1 = ${texNum(s.i1)}\text{ A}`} /> : <Tex tex="i_1 = ?" />}</span>
        <span className={`w23-tm ${has('mesh_i2') ? 'lit' : ''}`}>{show(4) ? <Tex tex={String.raw`i_2 = ${texNum(s.i2)}\text{ A}`} /> : <Tex tex="i_2 = ?" />}</span>
        <span className={`w23-tm ${has('node_a') ? 'lit' : ''}`}>{show(4) ? <Tex tex={String.raw`V_a = ${texNum(s.va)}\text{ V}`} /> : <Tex tex="V_a = ?" />}</span>
        <span className={`w23-tm ${has('series_r') ? 'lit' : ''}`}>
          {show(5) ? (
            <Tex tex={String.raw`P_{${edge ? 'R_3' : 'R_s'}} = I_s^2 ${edge ? 'R_3' : 'R_s'} = ${texNum(s.pSeries ?? 0)}\text{ W}`} />
          ) : (
            <Tex tex={String.raw`P_{R_s} = ?`} />
          )}
        </span>
        <span className={`w23-tm ${has('shared_is') || has('edge_is') ? 'lit' : ''}`}>
          {show(5) ? <Tex tex={String.raw`V_{I_s} = ${texNum(s.vIs ?? 0)}\text{ V}`} /> : <Tex tex={String.raw`V_{I_s} = ?`} />}
          <small>（上正下负）</small>
        </span>
        {rs !== seriesDefault && show(4) && (
          <span className="w23-tm ok wide">
            {seriesName} 从 {fmt(seriesDefault)} Ω 换成 {fmt(rs)} Ω：i₁、i₂ 纹丝不动，只有 {seriesName} 的功率与电流源端电压在变
          </span>
        )}
      </div>
    </div>
  );
}
