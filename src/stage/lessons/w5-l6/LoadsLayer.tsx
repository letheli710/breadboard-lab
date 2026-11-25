// W5-L6 layer 02 · the complex-power sum of three parallel loads on a 220 V bus. Controls (the
// sheet's): load 1 S1 (kVA, pf 0.8 lagging), load 2 P2 (kW, pf 1), load 3 S3 (kVA, pf 0.6 leading),
// each with an on/off switch. Drawing: the complex-power plane (equal scales on P and Q, fitted to
// the chain), S1 → S2 → S3 head to tail and the resultant S_total; beside it the true |S_total|
// against the wrong scalar sum Σ|S_k|. Readouts: S_total = P + jQ, |S_total|, pf_total, bus current.

import { BUS_V, KIND_ZH, fmt, sumLoads } from './model';
import { Arrow, C, DEF, Lbl, Obj, P, Readouts, Slider, Toggle, useBool, useClearHoverOnUnmount, useNum } from './parts';
import './w5l6.css';

const COL = [C.lag, C.p, C.lead];
const COL_T = [C.lagT, C.pT, C.leadT];
const IDS = ['s1_vec', 's2_vec', 's3_vec'];

export default function LoadsLayer() {
  useClearHoverOnUnmount();
  const [s1, setS1] = useNum(P.l1, DEF.l1);
  const [p2, setP2] = useNum(P.l2, DEF.l2);
  const [s3, setS3] = useNum(P.l3, DEF.l3);
  const [on1, setOn1] = useBool(P.on1, true);
  const [on2, setOn2] = useBool(P.on2, true);
  const [on3, setOn3] = useBool(P.on3, true);
  const r = sumLoads(s1, p2, s3, [on1, on2, on3]);

  // the chain's points (kW, kVAR), and an equal-scale fit into the plane 36…318 × 22…214
  const pts = [{ P: 0, Q: 0 }];
  for (const l of r.loads) pts.push({ P: pts[pts.length - 1].P + l.P, Q: pts[pts.length - 1].Q + l.Q });
  const pMax = Math.max(4, ...pts.map((p) => p.P));
  const qMax = Math.max(1, ...pts.map((p) => p.Q));
  const qMin = Math.min(-1, ...pts.map((p) => p.Q));
  const X0 = 40;
  const X1 = 312;
  const Y0 = 36;
  const Y1 = 210;
  const k = Math.min((X1 - X0) / pMax, (Y1 - Y0) / (qMax - qMin));
  // centre the chain's Q span in the plane
  const oy = Y0 + (Y1 - Y0 - k * (qMax - qMin)) / 2 + k * qMax;
  const yOf = (q: number) => oy - k * q;
  const xOf = (p: number) => X0 + k * p;
  const end = pts[3];
  const kind = r.kind;
  const tColT = C.sT;

  // the comparison bars, scaled to Σ|S_k|
  const full = Math.max(r.scalar, 1e-9);
  const bw = 128;

  return (
    <div className="w56-layer">
      <div className="w56-svgwrap">
        <svg viewBox="0 0 480 250" className="w56-svg" role="img" aria-label={`多负载复功率叠加：S_total = ${fmt(r.P, 2)} + j${fmt(r.Q, 2)} kVA`}>
          <rect x="1" y="1" width="478" height="248" rx="10" className="w56-bg" />
          {/* axes */}
          <line x1={X0 - 14} y1={yOf(0)} x2={X1 + 12} y2={yOf(0)} stroke={C.axis} strokeWidth={1.3} />
          <line x1={X0} y1={14} x2={X0} y2={236} stroke={C.axis} strokeWidth={1.3} />
          <Lbl x={X1 + 12} y={yOf(0) + (end.Q < 0 ? -6 : 15)} s="P (kW)" color={C.muted} anchor="end" size={11} />
          <Lbl x={X0 + 5} y={20} s="+jQ (kVAR)" color={C.muted} anchor="start" size={11} />
          {/* the resultant's projections */}
          {r.S > 0 && (
            <g>
              <line x1={xOf(end.P)} y1={yOf(end.Q)} x2={xOf(end.P)} y2={yOf(0)} stroke={C.s} strokeWidth={1.2} strokeDasharray="4 3" />
            </g>
          )}
          {r.loads.map((l, i) =>
            l.S > 0 ? (
              <Obj key={i} id={IDS[i]}>
                <Arrow x1={xOf(pts[i].P)} y1={yOf(pts[i].Q)} x2={xOf(pts[i + 1].P)} y2={yOf(pts[i + 1].Q)} color={COL[i]} w={3} />
                <Lbl
                  x={(xOf(pts[i].P) + xOf(pts[i + 1].P)) / 2 + (i === 2 ? 8 : i === 0 ? -6 : 0)}
                  y={(yOf(pts[i].Q) + yOf(pts[i + 1].Q)) / 2 + (i === 1 ? -7 : i === 0 ? -6 : 0)}
                  s={`S${i + 1}`}
                  color={COL_T[i]}
                  anchor={i === 2 ? 'start' : i === 0 ? 'end' : 'middle'}
                  size={12}
                  weight={800}
                />
              </Obj>
            ) : null,
          )}
          {r.S > 0 && (
            <Obj id="stot_vec">
              <Arrow x1={xOf(0)} y1={yOf(0)} x2={xOf(end.P)} y2={yOf(end.Q)} color={C.s} w={3.6} />
              <Lbl x={(xOf(0) + xOf(end.P)) / 2 + 4} y={(yOf(0) + yOf(end.Q)) / 2 + (end.Q >= 0 ? -8 : 16)} s="S_total" color={tColT} size={12} weight={800} />
            </Obj>
          )}
          {r.S === 0 && <Lbl x={176} y={120} s="三个负载都断开了" color={C.muted} size={12} />}

          {/* comparison */}
          <rect x={330} y={14} width={140} height={222} rx={8} fill="#fff" stroke="#e3d8c2" />
          <Lbl x={400} y={34} s="严禁标量相加！" color={C.sT} size={12} weight={800} />
          <Obj id="bar_scalar">
            <Lbl x={336} y={58} s="错误：Σ|S_k|" color={C.muted} anchor="start" size={11} />
            <rect x={336} y={64} width={bw} height={16} rx={4} fill="#fecaca" />
            <Lbl x={336 + bw - 4} y={76} s={`${fmt(r.scalar, 2)} kVA ✗`} color="#991b1b" anchor="end" size={10.5} weight={800} />
          </Obj>
          <Obj id="bar_true">
            <Lbl x={336} y={104} s="正确：|S_total|" color={C.muted} anchor="start" size={11} />
            <rect x={336} y={110} width={Math.max(2, (bw * r.S) / full)} height={16} rx={4} fill="#a7f3d0" />
            <rect x={336} y={110} width={bw} height={16} rx={4} fill="none" stroke="#cbd5e1" strokeDasharray="3 3" />
            <Lbl x={340} y={122} s={`${fmt(r.S, 2)} kVA ✓`} color="#065f46" anchor="start" size={10.5} weight={800} />
          </Obj>
          <Lbl x={400} y={150} s={`差 ${fmt(r.scalar - r.S, 2)} kVA`} color={C.ink} size={11.5} />
          <Lbl x={400} y={166} s={r.scalar > 0 ? `（${fmt((100 * (r.scalar - r.S)) / r.scalar, 1)}%）` : ''} color={C.muted} size={10.5} />
          <Lbl x={400} y={192} s={`ΣP = ${fmt(r.P, 2)} kW`} color={C.pT} size={10.5} />
          <Lbl x={400} y={208} s={`ΣQ = ${r.Q >= 0 ? '+' : ''}${fmt(r.Q, 2)} kVAR`} color={kind === 'lead' ? C.leadT : kind === 'lag' ? C.lagT : C.pT} size={10.5} />
          <Lbl x={400} y={226} s="P 相加 · Q 带号相加" color={C.muted} size={10} />
        </svg>
      </div>

      <div className="w56-controls">
        <div className="w56-loadrow">
          <Toggle on={on1} onChange={setOn1} label="1" title="负载 1（感性电机）接入 / 断开" hover="s1_vec" />
          <Slider label="S1 感性 pf 0.8 滞后" short="S1 感性" value={s1} min={0} max={20} step={1} text={`${fmt(s1, 0)} kVA`} onChange={setS1} hover="s1_vec" disabled={!on1} />
        </div>
        <div className="w56-loadrow">
          <Toggle on={on2} onChange={setOn2} label="2" title="负载 2（纯阻加热炉）接入 / 断开" hover="s2_vec" />
          <Slider label="P2 纯阻 pf 1.0" short="P2 纯阻" value={p2} min={0} max={15} step={1} text={`${fmt(p2, 0)} kW`} onChange={setP2} hover="s2_vec" disabled={!on2} />
        </div>
        <div className="w56-loadrow">
          <Toggle on={on3} onChange={setOn3} label="3" title="负载 3（容性补偿 / 同步机）接入 / 断开" hover="s3_vec" />
          <Slider label="S3 容性 pf 0.6 超前" short="S3 容性" value={s3} min={0} max={15} step={1} text={`${fmt(s3, 0)} kVA`} onChange={setS3} hover="s3_vec" disabled={!on3} />
        </div>
      </div>

      <div className="w56-readout">
        <Readouts
          cols={4}
          cells={[
            { id: 'stot_vec', label: 'S_total = ΣP + jΣQ', text: `${fmt(r.P, 2)} ${r.Q < 0 ? '−' : '+'} j${fmt(Math.abs(r.Q), 2)} kVA`, color: C.sT },
            { id: 'bar_true', label: '|S_total|', text: `${fmt(r.S, 2)} kVA`, color: '#065f46' },
            {
              id: 'stot_vec',
              label: 'pf_total',
              text: r.S === 0 ? '—' : kind === 'unity' ? '1.0000' : `${fmt(r.pf, 4)} ${KIND_ZH[kind]}`,
              color: kind === 'lead' ? C.leadT : C.lagT,
            },
            { id: 'stot_vec', label: `I_total（${BUS_V} V）`, text: `${fmt(r.I, 2)} A`, color: C.ink },
          ]}
        />
      </div>
    </div>
  );
}
