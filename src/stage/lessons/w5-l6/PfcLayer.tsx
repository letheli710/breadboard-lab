// W5-L6 layer 03 · parallel-capacitor power-factor correction and the line current it saves.
// Controls (the sheet's): two scenarios (Sadiku's 4 kW / 120 V / 60 Hz of act 4, the factory's
// 20 kW / 240 V / 60 Hz of the guided example, both pf1 = 0.80 lagging), the capacitor C (0 … 600 µF,
// marked where it gives the target pf2), the target pf2 (0.80 … 1.00 lagging) with a button that sets
// C to its exact value. Drawing (equal scales): P fixed, the original Q1 and S1 dashed, the purple
// Q_C = ωCV² pushing Q down, the net Q and S; beside it the line current before / now and the drops
// of current and line loss (∝ I²). Over-compensation (Q_C > Q1, leading) raises a warning.
// The factory scenario is the guided example: its numbers stay covered until the example reaches
// them (stage param w56_g = steps solved), and C is locked at 0 until step 4 is solved.

import { KIND_ZH, SCENARIOS, fmt, fmtPow, pfc, type ScenarioId } from './model';
import { Arrow, C, DEF, Lbl, Obj, P, Readouts, Seg, Slider, useClearHoverOnUnmount, useGuided, useNum, useScenario, type Cell } from './parts';
import './w5l6.css';

const SCN: { value: ScenarioId; label: string; short: string }[] = [
  { value: 'sadiku', label: 'Sadiku 经典 (4 kW / 120 V / 60 Hz)', short: '经典 4 kW' },
  { value: 'factory', label: '工厂实战 (20 kW / 240 V / 60 Hz)', short: '工厂 20 kW' },
];

export default function PfcLayer() {
  useClearHoverOnUnmount();
  const [scn, setScn] = useScenario();
  const [cUf, setC] = useNum(P.c, DEF.c);
  const [pf2, setPf2] = useNum(P.pf2, DEF.pf2);
  const [g, setG] = useGuided();
  const sc = SCENARIOS[scn];
  const isG = scn === 'factory';
  /** a number of the guided example is shown once the example has solved `n` steps */
  const seen = (n: number) => !isG || g >= n;
  const locked = isG && g < 4;
  const C_ = locked ? 0 : cUf;
  const r = pfc(sc, C_, pf2);
  const q = (x: number, n: number, unit: 'W' | 'VA' | 'VAR') => (seen(n) ? fmtPow(x, unit) : `? ${unit}`);
  const a = (x: number, n: number, unit: string, d = 2) => (seen(n) ? `${fmt(x, d)} ${unit}` : `? ${unit}`);
  const pct = (x: number, n: number) => (seen(n) ? `${x >= 0 ? '−' : '+'}${fmt(Math.abs(100 * x), 2)}%` : '?');

  // triangle: origin (34, 196), P = 230 px, equal scale on Q
  const ox = 34;
  const oy = 196;
  const k = 230 / sc.P;
  const xP = ox + sc.P * k;
  const yQ1 = oy - r.Q1 * k;
  const yNet = oy - r.Qnet * k;
  const t1 = r.theta1;
  const tn = Math.atan2(r.Qnet, sc.P);
  const arc = (rad: number, th: number) => `M ${ox + rad} ${oy} A ${rad} ${rad} 0 0 ${th >= 0 ? 0 : 1} ${ox + rad * Math.cos(th)} ${oy - rad * Math.sin(th)}`;
  const t2 = Math.acos(pf2);

  // bars: scaled to I1
  const bw = 140;
  const iFrac = Math.min(1.25, r.Iline / r.I1);

  const switchScn = (s: ScenarioId) => {
    setScn(s);
    if (s === 'factory' && g < 4) setC(0);
  };

  const cells: Cell[] = [
    { id: 'q1_orig', label: '校正前 Q_1 = P tan θ_1', short: 'Q_1', text: q(r.Q1, 1, 'VAR'), color: C.lagT },
    { id: 'qc_vec', label: '电容发出 |Q_C| = ωCV²', short: '|Q_C|', text: q(r.Qc, 0, 'VAR'), color: C.qcT },
    { id: 'q2_net', label: '净无功 Q = Q_1 − |Q_C|', short: '净 Q', text: q(r.Qnet, 1, 'VAR'), color: r.kind === 'lead' ? C.leadT : C.lagT },
    { id: 'ro_pf_net', label: 'pf（母线）', short: 'pf', text: r.kind === 'unity' ? '1.0000' : `${fmt(r.pfNet, 4)} ${KIND_ZH[r.kind]}`, color: r.kind === 'lead' ? C.leadT : C.pT },
    { id: 's2_new', label: '视在功率 S', short: 'S', text: q(r.Snet, 5, 'VA'), color: C.sT },
    { id: 'i_bar', label: '线路电流 I_line', short: 'I_line', text: a(r.Iline, 5, 'A'), color: C.ink },
  ];

  return (
    <div className="w56-layer">
      <div className="w56-controls">
        <Seg<ScenarioId> label="场景" value={scn} onChange={switchScn} options={SCN} />
      </div>

      <div className="w56-svgwrap">
        <svg viewBox="0 0 480 250" className="w56-svg" role="img" aria-label={`并联电容功率因数校正：${SCN.find((s) => s.value === scn)!.label}，C = ${fmt(C_, 2, true)} µF`}>
          <rect x="1" y="1" width="478" height="248" rx="10" className="w56-bg" />
          {/* axes */}
          <line x1={ox - 14} y1={oy} x2={xP + 30} y2={oy} stroke={C.axis} strokeWidth={1.3} />
          <line x1={ox} y1={12} x2={ox} y2={240} stroke={C.axis} strokeWidth={1.3} />
          <Lbl x={xP + 30} y={oy + 14} s="+P" color={C.muted} anchor="end" size={11} />
          <Lbl x={ox + 5} y={20} s="+jQ" color={C.muted} anchor="start" size={11} />
          {/* original triangle (dashed) */}
          <polygon points={`${ox},${oy} ${xP},${oy} ${xP},${yQ1}`} fill={C.s} fillOpacity={0.07} />
          <Obj id="s1_orig">
            <Arrow x1={ox} y1={oy} x2={xP} y2={yQ1} color={C.s} w={2.4} dash="7 4" />
            <Lbl x={ox + (xP - ox) * 0.55 - 8} y={oy - (oy - yQ1) * 0.55 - 8} s={`校正前 S_1 = ${q(r.S1, 5, 'VA')}`} color={C.sT} size={10.5} rotate={(-t1 * 180) / Math.PI} />
          </Obj>
          <path d={arc(54, t1)} fill="none" stroke={C.s} strokeWidth={1.5} />
          <Lbl x={ox + 48} y={oy - 46} s={`θ_1 = ${fmt((t1 * 180) / Math.PI, 2)}°`} color={C.sT} anchor="end" size={10} />
          {/* target pf2 ray */}
          <line x1={ox} y1={oy} x2={ox + 250 * Math.cos(t2)} y2={oy - 250 * Math.sin(t2)} stroke="#64748b" strokeWidth={1} strokeDasharray="2 3" />
          <Lbl x={xP - 24} y={oy - (xP - 24 - ox) * Math.tan(t2) - 5} s={`目标 pf_2 = ${fmt(pf2, 2)}`} color={C.muted} anchor="end" size={9.5} />
          {/* Q1 */}
          <Obj id="q1_orig">
            <line x1={xP} y1={oy} x2={xP} y2={yQ1} stroke={C.lag} strokeWidth={2} strokeDasharray="5 3" />
            <Lbl x={xP - 20} y={yQ1 + 4} s={`Q_1 = ${q(r.Q1, 1, 'VAR')}`} color={C.lagT} anchor="end" size={10.5} />
          </Obj>
          {/* net Q (and S) */}
          {C_ > 0 && Math.abs(yNet - oy) > 1.5 && (
            <Obj id="q2_net">
              <line x1={xP} y1={oy} x2={xP} y2={yNet} stroke={C.lead} strokeWidth={3.2} />
              {Math.abs(yNet - oy) > 12 && <Lbl x={xP + 6} y={(oy + yNet) / 2 + 4} s="净 Q" color={C.leadT} anchor="start" size={10.5} />}
            </Obj>
          )}
          <Obj id="s2_new">
            {C_ > 0 && (
              <>
                <Arrow x1={ox} y1={oy} x2={xP} y2={yNet} color={C.lead} w={3.2} />
                {Math.abs(yNet - oy) > 16 && (
                  <Lbl x={ox + (xP - ox) * 0.7} y={oy - (oy - yNet) * 0.7 + (r.Qnet >= 0 ? 15 : -7)} s="校正后 S" color={C.leadT} size={10.5} rotate={(-tn * 180) / Math.PI} />
                )}
              </>
            )}
          </Obj>
          {/* Q_C pushing down */}
          {r.Qc * k > 2 && (
            <Obj id="qc_vec">
              <Arrow x1={xP - 12} y1={yQ1} x2={xP - 12} y2={yNet} color={C.qc} w={3.4} />
              <Lbl x={xP + 6} y={(yQ1 + yNet) / 2 + 4} s="Q_C" color={C.qcT} anchor="start" size={11.5} weight={800} />
            </Obj>
          )}
          <Obj id="p_fixed">
            <Arrow x1={ox} y1={oy} x2={xP} y2={oy} color={C.p} w={3.4} />
            <Lbl x={(ox + xP) / 2} y={oy + 16} s={`P = ${fmt(sc.P / 1000, 2)} kW（纹丝不动）`} color={C.pT} size={11} />
          </Obj>
          {r.over && (
            <Obj id="over_warn">
              <Lbl x={xP + 6} y={Math.min(244, yNet + 26)} s="超前！" color={C.sT} anchor="start" size={10.5} weight={800} />
            </Obj>
          )}

          {/* line current */}
          <rect x={318} y={12} width={154} height={226} rx={8} fill="#fff" stroke="#e3d8c2" />
          <Lbl x={395} y={30} s="线路电流对比" color={C.leadT} size={12} weight={800} />
          <Lbl x={395} y={45} s={`${fmt(sc.P / 1000, 0)} kW / ${sc.V} V / ${sc.f} Hz`} color={C.muted} size={9.5} />
          <Obj id="i_bar">
            <Lbl x={326} y={66} s={`校正前 I_1 (pf=${fmt(sc.pf1, 2)})`} color={C.muted} anchor="start" size={10} />
            <rect x={326} y={71} width={bw} height={16} rx={4} fill="#fda4af" />
            <Lbl x={326 + bw - 4} y={83} s={a(r.I1, 5, 'A')} color="#881337" anchor="end" size={10.5} weight={800} />
            <Lbl x={326} y={106} s={`现在 I_line (pf=${fmt(r.pfNet, 3)})`} color={C.muted} anchor="start" size={10} />
            {seen(5) ? (
              <rect x={326} y={111} width={Math.max(2, Math.min(bw, bw * iFrac))} height={16} rx={4} fill={r.over ? '#fcd34d' : '#6ee7b7'} />
            ) : (
              <rect x={326} y={111} width={bw} height={16} rx={4} fill="#f1f5f9" stroke="#94a3b8" strokeDasharray="3 3" />
            )}
            <Lbl x={330} y={123} s={a(r.Iline, 5, 'A')} color="#064e3b" anchor="start" size={10.5} weight={800} />
          </Obj>
          <Obj id="loss_drop">
            <rect x={326} y={140} width={66} height={44} rx={6} fill="#f8fafc" stroke="#7dd3fc" />
            <Lbl x={359} y={156} s="电流降幅" color={C.muted} size={9.5} />
            <Lbl x={359} y={175} s={pct(r.dI, 5)} color={C.pT} size={12} weight={800} />
            <rect x={400} y={140} width={66} height={44} rx={6} fill="#f8fafc" stroke="#6ee7b7" />
            <Lbl x={433} y={156} s="线损降幅" color={C.muted} size={9.5} />
            <Lbl x={433} y={175} s={pct(r.dLoss, 5)} color={C.leadT} size={12} weight={800} />
          </Obj>
          <Lbl x={395} y={206} s="P_loss ∝ I² ∝ 1 / pf²" color="#92400e" size={10.5} weight={800} />
          <Lbl x={395} y={224} s={`C = ${fmt(C_, 2, true)} µF`} color={C.qcT} size={11} weight={800} />
        </svg>
      </div>

      <div className="w56-controls">
        <Slider
          label="并联补偿电容 C"
          short="C"
          value={C_}
          min={0}
          max={600}
          step={5}
          text={`${fmt(C_, 2, true)} µF`}
          onChange={setC}
          hover="cap_slider"
          disabled={locked}
          note={locked ? '第 4 步求出 C 后解锁' : undefined}
          mark={seen(4) ? { at: r.cTarget, label: `pf₂ ${fmt(pf2, 2)}` } : null}
        />
        <div className="w56-row">
          <Slider label="目标功率因数 pf_2（滞后）" short="目标 pf_2" value={pf2} min={0.8} max={1} step={0.01} text={fmt(pf2, 2)} onChange={setPf2} hover="target_pf" />
          <button type="button" className="w56-btn" disabled={!seen(4)} onClick={() => setC(r.cTarget)}>
            C ← {seen(4) ? `${fmt(r.cTarget, 2)} µF` : '? µF'}
          </button>
        </div>
      </div>

      <div className="w56-readout">
        {r.over && <div className="w56-note warn">已过补偿进入超前区，继续增大电容反而会使线路电流回升并引发母线过电压！</div>}
        <Readouts cols={3} pcols={3} cells={cells} />
        {isG && g < 5 && (
          <div className="w56-readout-foot">
            <span className="w56-desk">
              目标 Q<sub>2</sub> = {q(r.Q2, 2, 'VAR')} · 所需 Q<sub>C</sub> = {q(r.QcTarget, 3, 'VAR')}
            </span>{' '}
            <button type="button" className="w56-btn" onClick={() => setG(5)}>
              揭晓数值<span className="w56-desk">（第 5 幕引导例题，先自己做）</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
