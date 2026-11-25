// The three switched RLC circuits of W4-L6, each drawn as one of the three snapshots:
//   pre  (t = 0⁻): old switch position, C → open terminals, L → short wire
//   zero (t = 0⁺): new switch position, C → voltage source v_C(0⁺), L → current source i_L(0⁺),
//                  with the passive-sign arrows (i_C into C's +, v_L + where i_L enters)
//   inf  (t = ∞):  new switch position, C → open, L → short
// TopoG: Vs, R1, L, node B with R2 ∥ (S + R3) ∥ C — the guided example (act 5) and, with symbols
// only, act 2's demo circuit. TopoE1: the SPDT example of act 3. TopoE2: the two-source example of
// act 4. What the guided example has not reached yet is drawn as "?" (Show).

import { EX1, EX2, GUIDED, fmt, type Bounds, type Moment } from './model';
import { Arrow, Bubble, C, Dot, Gnd, ISrc, Lbl, Mask, Obj, OpenV, ResH, ResV, VSrc, Wire } from './parts';

/** what may be shown: values at 0⁻, the replacement sources, i_C / v_L at 0⁺, final values; sym: symbols only */
export interface Show {
  pre: boolean;
  kind: boolean;
  jump: boolean;
  fin: boolean;
  sym: boolean;
}

interface Props {
  m: Moment;
  b: Bounds | null;
  show: Show;
}

const T0: Record<Moment, string> = { pre: '0⁻', zero: '0⁺', inf: '∞' };

/** "name = value unit", "name = ?" while hidden, or just the name for the symbolic demo */
function val(show: Show, name: string, x: number | undefined, unit: string, on: boolean) {
  if (show.sym || x === undefined) return name;
  return on ? `${name} = ${fmt(x, 2)} ${unit}` : `${name} = ?`;
}

/** a name over its value, left-aligned (the C column and the vertical L) */
function Two({ x, y, name, value, color }: { x: number; y: number; name: string; value: string | null; color: string }) {
  return (
    <g>
      <Lbl x={x} y={y} s={name} color={color} anchor="start" />
      {value !== null && <Lbl x={x} y={y + 14} s={value} color={color} anchor="start" cls="w46-val" />}
    </g>
  );
}
function twoVal(show: Show, x: number | undefined, unit: string, on: boolean): string | null {
  if (show.sym || x === undefined) return null;
  return on ? `= ${fmt(x, 2)} ${unit}` : '= ?';
}

/** the capacitor branch on a vertical wire at x, from yTop to the ground rail yG; labels to the right */
function CapBranch({ x, yTop, yG, yc, m, b, show }: Props & { x: number; yTop: number; yG: number; yc: number }) {
  const t = T0[m];
  const onV = m === 'inf' ? show.fin : show.pre;
  const vC = m === 'inf' ? b?.vCinf : b?.vC0;
  if (m === 'zero') {
    if (!show.kind)
      return (
        <g>
          <Wire d={`M ${x} ${yTop} V ${yc - 16} M ${x} ${yc + 16} V ${yG}`} />
          <Obj id="cap_vsrc" box={[x - 20, yc - 19, 40, 38]}>
            <Mask x={x} y={yc} w={34} h={32} text="C→?" />
          </Obj>
        </g>
      );
    return (
      <g>
        <Obj id="cap_vsrc" box={[x - 22, yc - 22, 66 + 22, 44]}>
          <Wire d={`M ${x} ${yTop} V ${yc - 17} M ${x} ${yc + 17} V ${yG}`} />
          <VSrc x={x} y={yc} color={C.cap} text={C.capT} />
          <Two x={x + 12 + 10} y={yc - 4} name={`v_C(${t})`} value={twoVal(show, vC, 'V', show.pre)} color={C.capT} />
        </Obj>
        <Obj id="psc_arrows" box={[x - 10, yTop + 6, 76, 34]}>
          <Arrow x={x} y={yTop + 22} dir="down" color={C.warn} />
          <Two x={x + 10} y={yTop + 18} name={`i_C(${t})`} value={twoVal(show, b?.iC0p, 'A', show.jump)} color={C.warnT} />
        </Obj>
      </g>
    );
  }
  return (
    <Obj id="cap_open" box={[x - 16, yc - 30, 76, 60]}>
      <Wire d={`M ${x} ${yTop} V ${yc - 21} M ${x} ${yc + 21} V ${yG}`} color={C.cap} />
      <OpenV x={x} y1={yc - 21} y2={yc + 21} />
      <text x={x - 9} y={yc - 14} className="w46-sym small" fill={C.capT}>
        +
      </text>
      <text x={x - 9} y={yc + 26} className="w46-sym small" fill={C.capT}>
        −
      </text>
      <Two x={x + 12} y={yc - 4} name={`v_C(${t})`} value={twoVal(show, vC, 'V', onV)} color={C.capT} />
    </Obj>
  );
}

/** the inductor on a horizontal wire from x1 to x2 at y; value labels below (or above for 0⁺) */
function IndH({ x1, x2, y, m, b, show }: Props & { x1: number; x2: number; y: number }) {
  const t = T0[m];
  const xc = (x1 + x2) / 2;
  if (m === 'zero') {
    if (!show.kind)
      return (
        <g>
          <Wire d={`M ${x1} ${y} H ${xc - 22} M ${xc + 22} ${y} H ${x2}`} />
          <Obj id="ind_isrc" box={[xc - 25, y - 17, 50, 34]}>
            <Mask x={xc} y={y} w={44} h={28} text="L→?" />
          </Obj>
        </g>
      );
    return (
      <g>
        <Obj id="ind_isrc" box={[xc - 36, y - 36, 72, 54]}>
          <Wire d={`M ${x1} ${y} H ${xc - 16} M ${xc + 16} ${y} H ${x2}`} />
          <ISrc x={xc} y={y} dir="right" />
          <Bubble x={xc} y={y - 26} text={val(show, `i_L(${t})`, b?.iL0, 'A', show.pre)} color={C.isrcT} />
        </Obj>
        <Obj id="psc_arrows" box={[xc - 52, y + 14, 104, 44]}>
          <text x={xc - 24} y={y + 28} className="w46-sym small" fill={C.warnT}>
            +
          </text>
          <text x={xc + 24} y={y + 28} className="w46-sym small" fill={C.warnT}>
            −
          </text>
          <Lbl x={xc} y={y + 28} s={`v_L(${t})`} color={C.warnT} />
          {!show.sym && <Bubble x={xc} y={y + 46} text={val(show, `v_L(${t})`, b?.vL0p, 'V', show.jump)} color={C.warnT} />}
        </Obj>
      </g>
    );
  }
  const on = m === 'inf' ? show.fin : show.pre;
  const iL = m === 'inf' ? b?.iLinf : b?.iL0;
  return (
    <Obj id="ind_short" box={[x1 + 4, y - 22, x2 - x1 - 8, 64]}>
      <Wire d={`M ${x1} ${y} H ${x2}`} color={C.ind} w={3.2} />
      <Arrow x={xc + 4} y={y} dir="right" color={C.ind} />
      <Lbl x={xc} y={y - 9} s="L 短路" color={C.indT} cls="w46-tag" />
      <Lbl x={xc} y={y + 18} s={`i_L(${t})`} color={C.indT} />
      {!show.sym && <Lbl x={xc} y={y + 32} s={twoVal(show, iL, 'A', on) ?? ''} color={C.indT} cls="w46-val" />}
    </Obj>
  );
}

/** the inductor on a vertical wire at x from y1 to y2 (i_L downward); labels to the right */
function IndV({ x, y1, y2, m, b, show }: Props & { x: number; y1: number; y2: number }) {
  const t = T0[m];
  const yc = (y1 + y2) / 2;
  if (m === 'zero') {
    if (!show.kind)
      return (
        <g>
          <Wire d={`M ${x} ${y1} V ${yc - 18} M ${x} ${yc + 18} V ${y2}`} />
          <Obj id="ind_isrc" box={[x - 20, yc - 20, 40, 40]}>
            <Mask x={x} y={yc} w={34} h={34} text="L→?" />
          </Obj>
        </g>
      );
    return (
      <g>
        <Obj id="ind_isrc" box={[x - 20, yc - 22, 112, 40]}>
          <Wire d={`M ${x} ${y1} V ${yc - 16} M ${x} ${yc + 16} V ${y2}`} />
          <ISrc x={x} y={yc} dir="down" />
          <Two x={x + 22} y={yc - 14} name={`i_L(${t})`} value={twoVal(show, b?.iL0, 'A', show.pre)} color={C.isrcT} />
        </Obj>
        <Obj id="psc_arrows" box={[x - 22, yc - 24, 14, 50]}>
          <text x={x - 14} y={yc - 10} className="w46-sym small" fill={C.warnT}>
            +
          </text>
          <text x={x - 14} y={yc + 18} className="w46-sym small" fill={C.warnT}>
            −
          </text>
        </Obj>
        <Obj id="psc_arrows" box={[x + 18, yc + 4, 100, 34]}>
          <Two x={x + 22} y={yc + 16} name={`v_L(${t})`} value={twoVal(show, b?.vL0p, 'V', show.jump)} color={C.warnT} />
        </Obj>
      </g>
    );
  }
  const on = m === 'inf' ? show.fin : show.pre;
  const iL = m === 'inf' ? b?.iLinf : b?.iL0;
  return (
    <Obj id="ind_short" box={[x - 10, y1 + 2, 102, y2 - y1 - 4]}>
      <Wire d={`M ${x} ${y1} V ${y2}`} color={C.ind} w={3.2} />
      <Arrow x={x} y={yc + 4} dir="down" color={C.ind} />
      <Two x={x + 10} y={yc - 6} name={`L 短路 i_L(${t})`} value={twoVal(show, iL, 'A', on)} color={C.indT} />
    </Obj>
  );
}

/* --------------------------------------------------------------- TopoG */

/** Vs, R1, L to node B; B: R2, S + R3 (closed before t = 0, open after), C */
export function TopoG({ m, b, show }: Props) {
  const Y = 46;
  const YG = 204;
  const XV = 30;
  const XB = 214;
  const XS = 284;
  const XC = 362;
  const sym = show.sym;
  const closed = m === 'pre';
  return (
    <g>
      {/* ground rail and top rail */}
      <Wire d={`M ${XV} ${YG} H ${XC}`} />
      <Gnd x={XB} y={YG} />
      <Obj id="vs" box={[XV - 22, 98, 70, 54]}>
        <Wire d={`M ${XV} ${Y} V ${125 - 17} M ${XV} ${125 + 17} V ${YG}`} />
        <VSrc x={XV} y={125} />
        <Lbl x={XV + 22} y={122} s="V_s" color={C.vsrcT} anchor="start" />
        {!sym && <Lbl x={XV + 22} y={136} s={`${GUIDED.Vs} V`} color={C.vsrcT} anchor="start" cls="w46-val" />}
      </Obj>
      <Wire d={`M ${XV} ${Y} H 54`} />
      <Obj id="r1" box={[50, Y - 12, 58, 40]}>
        <ResH x1={54} x2={104} y={Y} />
        <Lbl x={79} y={Y + 20} s={sym ? 'R₁' : `R₁ ${GUIDED.R1}Ω`} color={C.resT} />
      </Obj>
      <IndH x1={104} x2={188} y={Y} m={m} b={b} show={show} />
      <Wire d={`M 188 ${Y} H ${XC}`} />
      <Obj id="node_b" box={[XB - 9, Y - 22, 18, 30]}>
        <Dot x={XB} y={Y} color={C.node} r={4.4} />
        <Lbl x={XB} y={Y - 10} s="B" color={C.node} />
      </Obj>
      <Dot x={XS} y={Y} />

      {/* R2 */}
      <Obj id="r2" box={[XB - 10, 74, 66, 80]}>
        <Wire d={`M ${XB} ${Y} V 80 M ${XB} 148 V ${YG}`} />
        <ResV x={XB} y1={80} y2={148} />
        <Lbl x={XB + 12} y={112} s="R₂" color={C.resT} anchor="start" />
        {!sym && <Lbl x={XB + 12} y={126} s={`${GUIDED.R2} Ω`} color={C.resT} anchor="start" cls="w46-val" />}
      </Obj>

      {/* S + R3: closed for t < 0, open from t = 0 on */}
      <Obj id={closed ? 'switch_before' : 'switch_after'} box={[XS - 12, 56, 58, 46]}>
        <Wire d={`M ${XS} ${Y} V 62`} />
        <circle cx={XS} cy={64} r={2.6} fill={C.ink} />
        <circle cx={XS} cy={94} r={2.6} fill={C.ink} />
        {closed ? (
          <line x1={XS} y1={64} x2={XS} y2={94} stroke={C.capT} strokeWidth={2.4} />
        ) : (
          <line x1={XS} y1={94} x2={XS + 17} y2={68} stroke={C.warn} strokeWidth={2.4} strokeLinecap="round" />
        )}
        <Lbl x={XS + 10} y={closed ? 84 : 98} s={closed ? 'S 闭合' : 'S 断开'} color={closed ? C.capT : C.warnT} anchor="start" cls="w46-tag" />
      </Obj>
      <Obj id="r3" box={[XS - 10, 104, 62, 64]}>
        <g className={closed ? '' : 'w46-off'}>
          <Wire d={`M ${XS} 94 V 110 M ${XS} 162 V ${YG}`} />
          <ResV x={XS} y1={110} y2={162} />
          <Lbl x={XS + 12} y={134} s="R₃" color={C.resT} anchor="start" />
          {!sym && <Lbl x={XS + 12} y={148} s={`${GUIDED.R3} Ω`} color={C.resT} anchor="start" cls="w46-val" />}
        </g>
      </Obj>

      <CapBranch x={XC} yTop={Y} yG={YG} yc={126} m={m} b={b} show={show} />
      {!sym && <Lbl x={XC + 12} y={182} s={`C = ${GUIDED.C} F`} color={C.capT} anchor="start" cls="w46-tag" />}
      {!sym && <Lbl x={146} y={m === 'zero' ? Y + 72 : Y + 52} s={`L = ${GUIDED.L} H`} color={C.indT} cls="w46-tag" />}
    </g>
  );
}

/* --------------------------------------------------------------- TopoE1 */

/** SPDT: V1 at a (t < 0), V2 at b (t ≥ 0); R1, L to the node; R2 ∥ C */
export function TopoE1({ m, b, show }: Props) {
  const Y = 46;
  const YG = 204;
  const XA = 24;
  const XBt = 100;
  const PIV = 62;
  const XN = 262;
  const XC = 350;
  const atA = m === 'pre';
  const tip = atA ? [XA, 86] : [XBt, 86];
  return (
    <g>
      <Wire d={`M ${XA} ${YG} H ${XC}`} />
      <Gnd x={XN} y={YG} />
      {/* the two sources */}
      <Obj id="vs" box={[XA - 20, 106, XBt - XA + 76, 50]}>
        <Wire d={`M ${XA} 86 V ${130 - 17} M ${XA} ${130 + 17} V ${YG} M ${XBt} 86 V ${130 - 17} M ${XBt} ${130 + 17} V ${YG}`} />
        <VSrc x={XA} y={130} color={atA ? C.vsrc : C.faint} text={atA ? C.vsrcT : C.muted} />
        <VSrc x={XBt} y={130} color={atA ? C.faint : C.vsrc} text={atA ? C.muted : C.vsrcT} />
        <Lbl x={XA + 20} y={127} s="V₁" color={atA ? C.vsrcT : C.muted} anchor="start" />
        <Lbl x={XA + 20} y={141} s={`${EX1.V1} V`} color={atA ? C.vsrcT : C.muted} anchor="start" cls="w46-val" />
        <Lbl x={XBt + 20} y={127} s="V₂" color={atA ? C.muted : C.vsrcT} anchor="start" />
        <Lbl x={XBt + 20} y={141} s={`${EX1.V2} V`} color={atA ? C.muted : C.vsrcT} anchor="start" cls="w46-val" />
      </Obj>
      {/* SPDT: pivot on the top rail, contacts a and b above the sources */}
      <Obj id={atA ? 'switch_before' : 'switch_after'} box={[XA - 14, Y - 10, XBt - XA + 30, 50]}>
        <circle cx={XA} cy={86} r={2.8} fill={C.ink} />
        <circle cx={XBt} cy={86} r={2.8} fill={C.ink} />
        <circle cx={PIV} cy={Y} r={2.8} fill={C.ink} />
        <line x1={PIV} y1={Y} x2={tip[0]} y2={tip[1]} stroke={atA ? C.capT : C.warn} strokeWidth={2.4} strokeLinecap="round" />
        <Lbl x={XA - 10} y={80} s="a" color={C.muted} cls="w46-tag" />
        <Lbl x={XBt + 10} y={80} s="b" color={C.muted} cls="w46-tag" />
        <Lbl x={PIV} y={Y - 14} s={atA ? 'S 接 a' : 'S 切到 b'} color={atA ? C.capT : C.warnT} cls="w46-tag" />
      </Obj>
      <Wire d={`M ${PIV} ${Y} H 116`} />
      <Obj id="r1" box={[112, Y - 12, 52, 40]}>
        <ResH x1={116} x2={160} y={Y} />
        <Lbl x={138} y={Y + 20} s={`R₁ ${EX1.R1}Ω`} color={C.resT} />
      </Obj>
      <IndH x1={160} x2={240} y={Y} m={m} b={b} show={show} />
      <Wire d={`M 240 ${Y} H ${XC}`} />
      <Dot x={XN} y={Y} color={C.node} r={4} />
      <Obj id="r2" box={[XN - 10, 74, 62, 80]}>
        <Wire d={`M ${XN} ${Y} V 84 M ${XN} 152 V ${YG}`} />
        <ResV x={XN} y1={84} y2={152} />
        <Lbl x={XN + 12} y={114} s="R₂" color={C.resT} anchor="start" />
        <Lbl x={XN + 12} y={128} s={`${EX1.R2} Ω`} color={C.resT} anchor="start" cls="w46-val" />
      </Obj>
      <CapBranch x={XC} yTop={Y} yG={YG} yc={126} m={m} b={b} show={show} />
      <Lbl x={XC + 12} y={182} s={`C = ${EX1.C} F`} color={C.capT} anchor="start" cls="w46-tag" />
      <Lbl x={200} y={m === 'zero' ? Y + 72 : Y + 52} s={`L = ${EX1.L} H`} color={C.indT} cls="w46-tag" />
    </g>
  );
}

/* --------------------------------------------------------------- TopoE2 */

/** Vs, R1 to A; A: R2 + L to ground; S (closes at t = 0) + R3 from A to B; B: Is, R4, C */
export function TopoE2({ m, b, show }: Props) {
  const Y = 46;
  const YG = 204;
  const XV = 26;
  const XA = 116;
  const XB = 240;
  const XI = 240;
  const XR4 = 300;
  const XC = 362;
  const closed = m !== 'pre';
  const vA = m === 'zero' ? b?.vA0p : m === 'inf' ? b?.vAinf : undefined;
  const vB = m === 'zero' ? b?.vC0 : m === 'inf' ? b?.vBinf : undefined;
  const onA = m === 'zero' ? show.jump : show.fin;
  const onB = m === 'zero' ? show.pre : show.fin;
  return (
    <g>
      <Wire d={`M ${XV} ${YG} H ${XC}`} />
      <Gnd x={XB + 30} y={YG} />
      <Obj id="vs" box={[XV - 22, 98, 64, 54]}>
        <Wire d={`M ${XV} ${Y} V ${125 - 17} M ${XV} ${125 + 17} V ${YG}`} />
        <VSrc x={XV} y={125} />
        <Lbl x={XV + 20} y={122} s="V_s" color={C.vsrcT} anchor="start" />
        <Lbl x={XV + 20} y={136} s={`${EX2.Vs} V`} color={C.vsrcT} anchor="start" cls="w46-val" />
      </Obj>
      <Wire d={`M ${XV} ${Y} H 48`} />
      <Obj id="r1" box={[44, Y - 14, 52, 40]}>
        <ResH x1={48} x2={92} y={Y} />
        <Lbl x={70} y={Y + 20} s={`R₁ ${EX2.R1}Ω`} color={C.resT} cls="w46-tag" />
      </Obj>
      <Wire d={`M 92 ${Y} H ${XA + 14}`} />
      <Obj id="node_a" box={[XA - 30, 8, 60, 46]}>
        <Dot x={XA} y={Y} color={C.node} r={4.4} />
        {vA !== undefined && closed ? <Bubble x={XA} y={22} text={val(show, 'v_A', vA, 'V', onA)} color={C.node} /> : <Lbl x={XA} y={Y - 10} s="A" color={C.node} />}
      </Obj>
      {/* A column: R2 then L */}
      <Obj id="r2" box={[XA - 10, 56, 50, 56]}>
        <Wire d={`M ${XA} ${Y} V 62 M ${XA} 104 V 112`} />
        <ResV x={XA} y1={62} y2={104} />
        <Lbl x={XA + 10} y={88} s={`R₂ ${EX2.R2}Ω`} color={C.resT} anchor="start" cls="w46-tag" />
      </Obj>
      <IndV x={XA} y1={112} y2={YG} m={m} b={b} show={show} />
      {/* S + R3 between A and B */}
      <Obj id={closed ? 'switch_after' : 'switch_before'} box={[XA + 12, Y - 20, 44, 44]}>
        <Wire d={`M ${XA + 14} ${Y} H ${XA + 18}`} />
        <circle cx={XA + 20} cy={Y} r={2.6} fill={C.ink} />
        <circle cx={XA + 48} cy={Y} r={2.6} fill={C.ink} />
        {closed ? (
          <line x1={XA + 20} y1={Y} x2={XA + 48} y2={Y} stroke={C.capT} strokeWidth={2.4} />
        ) : (
          <line x1={XA + 20} y1={Y} x2={XA + 44} y2={Y - 15} stroke={C.warn} strokeWidth={2.4} strokeLinecap="round" />
        )}
        <Lbl x={XA + 34} y={Y + 18} s={closed ? 'S 闭合' : 'S 断开'} color={closed ? C.capT : C.warnT} cls="w46-tag" />
      </Obj>
      <Obj id="r3" box={[XA + 50, Y - 14, 70, 40]}>
        <g className={closed ? '' : 'w46-off'}>
          <Wire d={`M ${XA + 48} ${Y} H ${XA + 60} M ${XA + 104} ${Y} H ${XB}`} />
          <ResH x1={XA + 60} x2={XA + 104} y={Y} />
          <Lbl x={XA + 82} y={Y + 20} s={`R₃ ${EX2.R3}Ω`} color={C.resT} cls="w46-tag" />
        </g>
      </Obj>
      <Wire d={`M ${XB} ${Y} H ${XC}`} />
      <Obj id="node_b" box={[XB - 30, 8, 60, 46]}>
        <Dot x={XB} y={Y} color={C.node} r={4.4} />
        {vB !== undefined && closed ? <Bubble x={XB} y={22} text={val(show, 'v_B', vB, 'V', onB)} color={C.node} /> : <Lbl x={XB} y={Y - 10} s="B" color={C.node} />}
      </Obj>
      {/* B: Is up, R4, C */}
      <Obj id="is" box={[XI - 20, 100, 60, 52]}>
        <Wire d={`M ${XI} ${Y} V ${126 - 16} M ${XI} ${126 + 16} V ${YG}`} />
        <ISrc x={XI} y={126} dir="up" />
        <Lbl x={XI + 20} y={122} s="I_s" color={C.isrcT} anchor="start" />
        <Lbl x={XI + 20} y={136} s={`${EX2.Is} A`} color={C.isrcT} anchor="start" cls="w46-val" />
      </Obj>
      <Dot x={XR4} y={Y} />
      <Obj id="r4" box={[XR4 - 10, 84, 50, 82]}>
        <Wire d={`M ${XR4} ${Y} V 92 M ${XR4} 160 V ${YG}`} />
        <ResV x={XR4} y1={92} y2={160} />
        <Lbl x={XR4 + 10} y={122} s="R₄" color={C.resT} anchor="start" />
        <Lbl x={XR4 + 10} y={136} s={`${EX2.R4} Ω`} color={C.resT} anchor="start" cls="w46-val" />
      </Obj>
      <CapBranch x={XC} yTop={Y} yG={YG} yc={126} m={m} b={b} show={show} />
      <Lbl x={XC + 12} y={182} s={`C = ${EX2.C} F`} color={C.capT} anchor="start" cls="w46-tag" />
      <Lbl x={XA - 12} y={198} s={`L ${EX2.L} H`} color={C.indT} anchor="end" cls="w46-tag" />
    </g>
  );
}
