// W5-L6 layer 01 · the power triangle of one load and its lagging / leading view. Controls (the
// sheet's): impedance angle θ = θ_v − θ_i (−85° … 85°), V_rms (100 … 240 V), I_rms (1 … 20 A); a
// switch for the "forgot the conjugate" trap (the wrong product V·I drawn as a red dashed mirror
// triangle, its Q flipped) and one that turns the phasor pair (V and I rotate together, the angle
// between them fixed). Drawing: the phasors (V at θ_v = 0, I at θ_i = −θ), the triangle P / Q / S in
// quadrant I (lagging, amber) or IV (leading, green), and the beer mug (liquid = pf of the glass,
// foam the rest). Readouts: S, P, Q, pf with its label.

import { useEffect, useState } from 'react';
import { DEG, KIND_ZH, fmt, triangle, withoutConjugate } from './model';
import { Arrow, C, DEF, Lbl, Obj, P, Readouts, Slider, Toggle, useBool, useClearHoverOnUnmount, useNum } from './parts';
import './w5l6.css';

/** turning speed of the phasor pair (rad/s): slow enough to follow */
const SPIN = 0.9;

function useSpin(on: boolean): number {
  const [a, setA] = useState(0);
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    let t0: number | null = null;
    const tick = (t: number) => {
      if (t0 === null) t0 = t;
      setA(((t - t0) / 1000) * SPIN);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return on ? a : 0;
}

export default function TriangleLayer() {
  useClearHoverOnUnmount();
  const [theta, setTheta] = useNum(P.theta, DEF.theta);
  const [V, setV] = useNum(P.v, DEF.v);
  const [I, setI] = useNum(P.i, DEF.i);
  const [trap, setTrap] = useBool(P.trap, false);
  const [spin, setSpin] = useState(false);
  const a = useSpin(spin);
  const t = triangle(theta, V, I);
  const wrong = withoutConjugate(theta, V, I);
  const col = t.kind === 'lag' ? C.lag : t.kind === 'lead' ? C.lead : C.unity;
  const colT = t.kind === 'lag' ? C.lagT : t.kind === 'lead' ? C.leadT : C.pT;
  const quad = t.kind === 'lag' ? '第一象限 · Lagging 滞后 / 吸收无功' : t.kind === 'lead' ? '第四象限 · Leading 超前 / 发出无功' : '单位功率因数 pf = 1.00';

  // phasors: centre (30, 125); V along θ_v (+ spin), I along θ_i = −θ (+ spin); SVG y grows downward
  const cx = 34;
  const cy = 125;
  const pv = (len: number, ang: number) => [cx + len * Math.cos(ang), cy - len * Math.sin(ang)] as const;
  const [vx, vy] = pv(112, a);
  const [ix, iy] = pv(88, a - theta * DEG);
  const arcR = 36;
  const [ax1, ay1] = pv(arcR, a);
  const [ax2, ay2] = pv(arcR, a - theta * DEG);
  const [lx, ly] = pv(arcR + 14, a - (theta * DEG) / 2);
  const iTag = t.kind === 'lag' ? 'I（滞后）' : t.kind === 'lead' ? 'I（超前）' : 'I（同相）';

  // the triangle: S drawn at a fixed length (the numbers are in the labels), origin (186, 125)
  const ox = 186;
  const oy = 125;
  const R = 104;
  const pxP = R * Math.cos(theta * DEG);
  const pxQ = R * Math.sin(theta * DEG);
  const tx = ox + pxP;
  const ty = oy - pxQ;
  const wy = oy + pxQ; // the wrong product's Q (flipped)
  const tArc = `M ${ox + 30} ${oy} A 30 30 0 0 ${theta > 0 ? 0 : 1} ${ox + 30 * Math.cos(theta * DEG)} ${oy - 30 * Math.sin(theta * DEG)}`;

  // the beer mug: glass 382…440 × 44…214; liquid = pf of the height, foam above it
  const gx = 396;
  const gw = 56;
  const gTop = 46;
  const gH = 166;
  const liquid = gH * t.pf;
  const foam = gH - liquid;

  return (
    <div className="w56-layer">
      <div className="w56-svgwrap">
        <svg viewBox="0 0 480 250" className="w56-svg" role="img" aria-label={`功率三角形：θ = ${fmt(theta, 1, true)}°，${quad}`}>
          <rect x="1" y="1" width="478" height="248" rx="10" className="w56-bg" />
          {/* phasors */}
          <Lbl x={86} y={20} s="相量图（θ_v = 0°）" color={C.muted} size={11} />
          <line x1={cx - 10} y1={cy} x2={158} y2={cy} stroke={C.faint} strokeDasharray="4 3" />
          <line x1={cx} y1={36} x2={cx} y2={214} stroke={C.faint} strokeDasharray="4 3" />
          <Obj id="v_phasor">
            <Arrow x1={cx} y1={cy} x2={vx} y2={vy} color={C.p} w={3} />
            <Lbl x={vx + (Math.cos(a) >= 0 ? 4 : -4)} y={vy - 6} s="V" color={C.pT} anchor={Math.cos(a) >= 0 ? 'start' : 'end'} size={13} weight={800} />
          </Obj>
          <Obj id="i_phasor">
            <Arrow x1={cx} y1={cy} x2={ix} y2={iy} color={col} w={3} />
            <Lbl x={ix + (ix >= cx ? -2 : 2)} y={iy + (iy >= cy ? 16 : -7)} s={iTag} color={colT} anchor={ix >= cx ? 'middle' : 'end'} size={12} weight={800} />
          </Obj>
          {Math.abs(theta) >= 1 && (
            <Obj id="theta_arc">
              <path d={`M ${ax1} ${ay1} A ${arcR} ${arcR} 0 0 ${theta > 0 ? 1 : 0} ${ax2} ${ay2}`} fill="none" stroke={C.s} strokeWidth={2} />
              <Lbl x={lx + 2} y={ly + 4} s={`θ ${theta > 0 ? '>' : '<'} 0`} color={C.sT} anchor="start" size={11} />
            </Obj>
          )}
          <Lbl x={86} y={236} s={`θ = θ_v − θ_i = ${fmt(theta, 1, true)}°`} color={colT} size={11} />

          {/* power triangle */}
          <line x1={168} y1={oy} x2={352} y2={oy} stroke={C.axis} strokeWidth={1.2} />
          <line x1={ox} y1={18} x2={ox} y2={232} stroke={C.axis} strokeWidth={1.2} />
          <Lbl x={352} y={oy - 5} s="+P" color={C.muted} anchor="end" size={11} />
          <Lbl x={ox - 4} y={28} s="+jQ" color={C.muted} anchor="end" size={11} />
          <Lbl x={ox - 4} y={230} s="−jQ" color={C.muted} anchor="end" size={11} />
          <polygon points={`${ox},${oy} ${tx},${oy} ${tx},${ty}`} fill={col} fillOpacity={0.14} />
          {trap && Math.abs(theta) >= 1 && (
            <Obj id="conj_trap">
              <polygon points={`${ox},${oy} ${tx},${oy} ${tx},${wy}`} fill={C.s} fillOpacity={0.06} stroke={C.s} strokeWidth={2} strokeDasharray="6 4" />
              <Lbl x={tx + 6} y={wy + (theta > 0 ? 4 : 8)} s="V·I ✗" color={C.sT} anchor="start" size={11} weight={800} />
            </Obj>
          )}
          <Obj id="p_side">
            <Arrow x1={ox} y1={oy} x2={tx} y2={oy} color={C.p} w={3} />
            <Lbl x={(ox + tx) / 2} y={oy + (theta >= 0 ? 16 : -7)} s={`P = ${fmt(t.P, 1)} W`} color={C.pT} size={11.5} />
          </Obj>
          {Math.abs(pxQ) > 2 && (
            <Obj id="q_side">
              <Arrow x1={tx} y1={oy} x2={tx} y2={ty} color={col} w={3} />
              <Lbl x={tx + 6} y={(oy + ty) / 2 - 2} s={t.Q >= 0 ? '+jQ' : '−j|Q|'} color={colT} anchor="start" size={11.5} />
              <Lbl x={tx + 6} y={(oy + ty) / 2 + 12} s={`${fmt(t.Q, 1)} VAR`} color={colT} anchor="start" size={10.5} />
            </Obj>
          )}
          <Obj id="s_side">
            <Arrow x1={ox} y1={oy} x2={tx} y2={ty} color={C.s} w={3.2} />
            <Lbl
              x={ox + pxP * 0.42 - (theta >= 0 ? 6 : -6) * Math.sin(theta * DEG)}
              y={oy - pxQ * 0.42 - (theta >= 0 ? 8 : -22) * Math.cos(theta * DEG)}
              s={`S = ${fmt(t.S, 0)} VA`}
              color={C.sT}
              size={11.5}
              rotate={-theta}
            />
          </Obj>
          {Math.abs(theta) >= 1 && <path d={tArc} fill="none" stroke={C.ink} strokeWidth={1.6} />}
          <Lbl x={268} y={theta >= 0 ? 242 : 15} s={quad} color={colT} size={10.5} />

          {/* beer mug */}
          <Lbl x={424} y={20} s="一杯交流电啤酒" color={C.muted} size={11} />
          <Obj id="beer_mug">
            <path
              d={`M ${gx + gw} ${gTop + 34} C ${gx + gw + 26} ${gTop + 34}, ${gx + gw + 26} ${gTop + 120}, ${gx + gw} ${gTop + 120}`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={7}
              strokeLinecap="round"
            />
            <rect x={gx - 4} y={gTop - 4} width={gw + 8} height={gH + 8} rx={8} fill="none" stroke="#475569" strokeWidth={2.4} />
            <line x1={gx - 14} y1={gTop - 2} x2={gx - 14} y2={gTop + gH + 2} stroke={C.s} strokeWidth={2} />
            <line x1={gx - 19} y1={gTop - 2} x2={gx - 9} y2={gTop - 2} stroke={C.s} strokeWidth={2} />
            <line x1={gx - 19} y1={gTop + gH + 2} x2={gx - 9} y2={gTop + gH + 2} stroke={C.s} strokeWidth={2} />
            <Lbl x={gx - 20} y={gTop + gH / 2} s="整杯 S" color={C.sT} size={10.5} rotate={-90} />
          </Obj>
          {foam > 0.5 && (
            <Obj id="beer_foam">
              <rect x={gx} y={gTop} width={gw} height={foam} rx={4} fill="#eef2f7" stroke="#cbd5e1" />
              {foam > 16 && <Lbl x={gx + gw / 2} y={gTop + foam / 2 + 4} s="泡沫 Q" color={C.ink} size={10.5} />}
            </Obj>
          )}
          <Obj id="beer_liquid">
            <rect x={gx} y={gTop + foam} width={gw} height={liquid} rx={3} fill="#f59e0b" fillOpacity={0.85} />
            {liquid > 16 && <Lbl x={gx + gw / 2} y={gTop + foam + liquid / 2 + 4} s="酒液 P" color="#451a03" size={10.5} />}
          </Obj>
          <Lbl x={424} y={236} s={`含酒量 pf = ${fmt(t.pf, 2)}`} color={colT} size={11} />
        </svg>
      </div>

      <div className="w56-controls">
        <Slider
          label="阻抗角 θ = θ_v − θ_i"
          short="θ"
          value={theta}
          min={-85}
          max={85}
          step={1}
          text={`${fmt(theta, Number.isInteger(theta) ? 0 : 2)}°`}
          onChange={setTheta}
          hover="theta_arc"
        />
        <Slider label="电源有效值 V_rms" short="V_rms" value={V} min={100} max={240} step={10} text={`${fmt(V, 0)} V`} onChange={setV} hover="v_phasor" />
        <Slider label="负载电流有效值 I_rms" short="I_rms" value={I} min={1} max={20} step={0.5} text={`${fmt(I, 1)} A`} onChange={setI} hover="i_phasor" />
        <div className="w56-row">
          <Toggle on={trap} onChange={setTrap} label="忘记取共轭陷阱演示" hover="conj_trap" />
          <Toggle on={spin} onChange={setSpin} label="转动相量" title="V 与 I 一起旋转，夹角 θ 不变" />
        </div>
      </div>

      <div className="w56-readout">
        {trap && (
          <div className="w56-note bad">
            红色虚线 = 未取共轭的 V·I：辐角变成 θ<sub>v</sub> + θ<sub>i</sub> = {fmt(-theta, 1, true)}°，Q 算成 {fmt(wrong.Q, 1)} VAR，符号整个反了
          </div>
        )}
        <Readouts
          cols={4}
          cells={[
            { id: 's_side', label: 'S = V_rms I_rms', short: 'S', text: `${fmt(t.S, 1)} VA`, color: C.sT },
            { id: 'p_side', label: 'P = S cos θ', short: 'P', text: `${fmt(t.P, 1)} W`, color: C.pT },
            { id: 'q_side', label: 'Q = S sin θ', short: 'Q', text: `${fmt(t.Q, 1)} VAR`, color: colT },
            { id: 'ro_pf', label: 'pf = cos θ', short: 'pf', text: t.kind === 'unity' ? '1.00（单位）' : `${fmt(t.pf, 3)} ${KIND_ZH[t.kind]}`, color: colT },
          ]}
        />
      </div>
    </div>
  );
}
