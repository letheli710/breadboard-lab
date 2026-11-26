// Layer "01 2D 开关切换原理图": three switched circuits, each with t < 0 (switch on the source) and
// t > 0 (source-free) and a time slider in time constants:
// - 'rc': the breadboard RC of act 6 — 台式可调直流电源（5 V）, an SPDT (left: charge, right:
//   discharge), C = 100 µF, R = 10 kΩ; the node bubble shows v_C(t), the arrow i(t) = v/R;
// - 'rl': act 4's coil — a DC source sets I0 = 2 A in L = 0.5 H, then L circulates through R = 10 Ω;
// - 'net': act 5's network (fig. 5-1) — 24 V, S, R1 … R4, C = 0.2 F; t < 0 shows the steady state
//   (C open), t > 0 greys out V_s and R1 and can lay the R_Th overlay over R2, R3, R4. While the
//   guided example runs, its answers show as "?" (useReveal).

import { fmtA, fmtE, fmtR, fmtT, fmtV, LAB, NET, rc, rl, RL_EX, solveNet, SUPPLY_NAME } from './model';
import { Check, hov, MaskNote, Seg, TimeDock, useClearHoverOnUnmount, useIsLit, useReveal, useTime, type Topo } from './state';
import { useStageParam } from '../../stageStore';

/** "v_R2 = 4 V" → v with a small low "R2" (an underscore marks a subscript) */
function rich(s: string) {
  const parts = s.split(/_([A-Za-z0-9]+)/);
  return parts.map((p, i) =>
    i % 2 ? (
      <tspan key={i} dy={3} fontSize="78%">
        {p}
      </tspan>
    ) : (
      <tspan key={i} dy={i ? -3 : 0}>
        {p}
      </tspan>
    ),
  );
}

/* ------------------------------------------------------------- drawing helpers */

/** a vertical zigzag resistor from (x, y1) to (x, y2) */
function zigV(x: number, y1: number, y2: number, w = 9): string {
  const n = 6;
  const h = (y2 - y1) / n;
  let d = `M ${x} ${y1}`;
  for (let i = 0; i < n; i++) d += ` L ${x + (i % 2 ? -w : w)} ${y1 + h * (i + 0.5)}`;
  return `${d} L ${x} ${y2}`;
}
/** a horizontal zigzag resistor from (x1, y) to (x2, y) */
function zigH(x1: number, x2: number, y: number, w = 9): string {
  const n = 6;
  const h = (x2 - x1) / n;
  let d = `M ${x1} ${y}`;
  for (let i = 0; i < n; i++) d += ` L ${x1 + h * (i + 0.5)} ${y + (i % 2 ? w : -w)}`;
  return `${d} L ${x2} ${y}`;
}
/** a vertical coil from (x, y1) to (x, y2), four turns bulging right */
function coilV(x: number, y1: number, y2: number): string {
  const h = (y2 - y1) / 4;
  let d = `M ${x} ${y1}`;
  for (let i = 0; i < 4; i++) d += ` A ${h / 2} ${h / 2} 0 0 1 ${x} ${y1 + h * (i + 1)}`;
  return d;
}

/** an arrow head at (x, y) pointing along (dx, dy) */
function Head({ x, y, dx, dy, cls }: { x: number; y: number; dx: number; dy: number; cls: string }) {
  const L = 9;
  const W = 5;
  const px = -dy;
  const py = dx;
  const p = [
    [x, y],
    [x - dx * L + px * W, y - dy * L + py * W],
    [x - dx * L - px * W, y - dy * L - py * W],
  ];
  return <polygon points={p.map((q) => q.join(',')).join(' ')} className={cls} />;
}

/** a current arrow along a straight piece: width and opacity follow `k` (0 … 1 of the peak) */
function Flow({
  x1,
  y1,
  x2,
  y2,
  k,
  label,
  lx,
  ly,
  anchor = 'middle',
  id,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  k: number;
  label: string;
  lx: number;
  ly: number;
  anchor?: 'start' | 'middle' | 'end';
  id: string;
}) {
  const isLit = useIsLit();
  const len = Math.hypot(x2 - x1, y2 - y1);
  const dx = (x2 - x1) / len;
  const dy = (y2 - y1) / len;
  const on = k > 0.004;
  return (
    <g className={`w44-obj flow ${isLit(id)} ${on ? '' : 'off'}`} {...hov([id])}>
      {on && (
        <>
          <line x1={x1} y1={y1} x2={x2 - dx * 6} y2={y2 - dy * 6} className="w44-flow" style={{ strokeWidth: 1.6 + 3.4 * Math.min(1, k), opacity: 0.35 + 0.65 * Math.min(1, k) }} />
          <Head x={x2} y={y2} dx={dx} dy={dy} cls="w44-flowhead" />
        </>
      )}
      <text x={lx} y={ly} textAnchor={anchor} className="w44-lbl cur">
        {label}
      </text>
    </g>
  );
}

function Tag({ x, y, text, id, tone = '', w }: { x: number; y: number; text: string; id: string; tone?: string; w?: number }) {
  const isLit = useIsLit();
  const width = w ?? Math.max(56, text.length * 8.6 + 14);
  return (
    <g className={`w44-obj tag ${tone} ${isLit(id)}`} {...hov([id])}>
      <rect x={x - width / 2} y={y - 13} width={width} height={20} rx={6} className="tagbox" />
      <text x={x} y={y + 2} textAnchor="middle" className="w44-vtag">
        {rich(text)}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------- the SPDT circuits (rc, rl) */

const GY = 250;
const PIV: [number, number] = [330, 118];
const CL: [number, number] = [250, 70];
const CR: [number, number] = [410, 70];

function Spdt({ sw }: { sw: 'charge' | 'discharge' }) {
  const isLit = useIsLit();
  const to = sw === 'charge' ? CL : CR;
  return (
    <g className={`w44-obj sw ${isLit('spdt')}`} {...hov(['spdt'])}>
      <rect x={232} y={42} width={196} height={92} rx={10} className="hit" />
      <line x1={PIV[0]} y1={PIV[1]} x2={to[0] + (sw === 'charge' ? 4 : -4)} y2={to[1] + 3} className="blade" />
      <circle cx={PIV[0]} cy={PIV[1]} r={4.5} className="pin" />
      <circle cx={CL[0]} cy={CL[1]} r={4.5} className={`pin ${sw === 'charge' ? 'on' : ''}`} />
      <circle cx={CR[0]} cy={CR[1]} r={4.5} className={`pin ${sw === 'discharge' ? 'on' : ''}`} />
      <text x={CL[0]} y={CL[1] - 12} textAnchor="middle" className="w44-lbl sub">
        左 · 充电
      </text>
      <text x={CR[0]} y={CR[1] - 12} textAnchor="middle" className="w44-lbl sub">
        右 · 放电
      </text>
      <text x={PIV[0]} y={PIV[1] + 4} dx={-12} textAnchor="end" className="w44-lbl sub">
        SPDT
      </text>
    </g>
  );
}

function SpdtCircuit({ kind }: { kind: 'rc' | 'rl' }) {
  const isLit = useIsLit();
  const { sw, tn } = useTime();
  const on = sw === 'discharge';
  const isRc = kind === 'rc';
  const a = rc(LAB.v0, LAB.r, LAB.c);
  const b = rl(RL_EX.i0, RL_EX.l, RL_EX.r);
  const tau = isRc ? a.tau : b.tau;
  const t = on ? tn * tau : 0;
  const k = on ? Math.exp(-tn) : 0;
  const v = isRc ? (on ? a.v(t) : LAB.v0) : 0;
  const i = isRc ? (on ? a.i(t) : 0) : on ? b.i(t) : RL_EX.i0;
  return (
    <g>
      {/* ground rail */}
      <g className={`w44-obj ${isLit('gnd')}`} {...hov(['gnd'])}>
        <path d={`M 90 ${GY} L 500 ${GY}`} className="w44-wire" />
        <path d={`M 300 ${GY + 8} L 360 ${GY + 8} M 312 ${GY + 15} L 348 ${GY + 15} M 324 ${GY + 22} L 336 ${GY + 22}`} className="w44-wire thin" />
        <path d={`M 330 ${GY} L 330 ${GY + 8}`} className="w44-wire thin" />
      </g>
      {/* the source */}
      <g className={`w44-obj src ${isLit(isRc ? 'supply' : 'src_rl')} ${on ? 'off' : ''}`} {...hov([isRc ? 'supply' : 'src_rl'])}>
        <path d={`M 90 136 L 90 70 L ${CL[0]} 70 M 90 184 L 90 ${GY}`} className="w44-wire" />
        <circle cx={90} cy={160} r={24} className="body" />
        {isRc ? (
          <>
            <text x={90} y={154} textAnchor="middle" className="w44-pm p">
              +
            </text>
            <text x={90} y={178} textAnchor="middle" className="w44-pm m">
              −
            </text>
            <text x={16} y={284} className="w44-lbl src">
              {SUPPLY_NAME}
            </text>
          </>
        ) : (
          <>
            <path d="M 90 174 L 90 148" className="w44-wire" />
            <Head x={90} y={144} dx={0} dy={-1} cls="w44-arrow" />
            <text x={16} y={284} className="w44-lbl src">
              直流源（换路前 I₀ = 2 A）
            </text>
          </>
        )}
      </g>
      <Spdt sw={sw} />
      {/* the storage element on the switch's common pin */}
      {isRc ? (
        <g className={`w44-obj cap ${isLit('cap', 'v_node')}`} {...hov(['cap'])}>
          <path d={`M ${PIV[0]} ${PIV[1]} L 330 168 M 330 184 L 330 ${GY}`} className="w44-wire" />
          <path d="M 304 168 L 356 168 M 304 184 L 356 184" className="plate" />
          <text x={362} y={166} className="w44-pm p">
            +
          </text>
          <text x={364} y={204} className="w44-lbl">
            C = 100 µF
          </text>
        </g>
      ) : (
        <g className={`w44-obj ind ${isLit('ind', 'i_l')}`} {...hov(['ind'])}>
          <path d={`M ${PIV[0]} ${PIV[1]} L 330 146 M 330 226 L 330 ${GY}`} className="w44-wire" />
          <path d={coilV(330, 146, 226)} className="coil" />
          <text x={366} y={204} className="w44-lbl">
            L = 0.5 H
          </text>
        </g>
      )}
      {/* the resistor on the right throw */}
      <g className={`w44-obj res ${isLit(isRc ? 'res' : 'res_l')}`} {...hov([isRc ? 'res' : 'res_l'])}>
        <path d={`M ${CR[0]} 70 L 500 70 L 500 112 M 500 202 L 500 ${GY}`} className="w44-wire" />
        <path d={zigV(500, 112, 202)} className="body-line" />
        <text x={516} y={162} className="w44-lbl res">
          {isRc ? 'R = 10 kΩ' : 'R = 10 Ω'}
        </text>
      </g>
      {/* currents */}
      {isRc ? (
        on ? (
          <Flow id="i_r" x1={424} y1={88} x2={480} y2={88} k={k} label={`i(t) = ${fmtA(i)}`} lx={452} ly={106} />
        ) : (
          <Flow id="i_r" x1={150} y1={58} x2={210} y2={58} k={0} label="i = 0（已充满，C 视为开路）" lx={150} ly={40} />
        )
      ) : on ? (
        <>
          <Flow id="i_l" x1={480} y1={88} x2={424} y2={88} k={k} label={`i(t) = ${fmtA(i)}`} lx={452} ly={106} />
          <Flow id="i_l" x1={346} y1={150} x2={346} y2={200} k={k} label="" lx={0} ly={0} />
        </>
      ) : (
        <>
          <Flow id="i_l" x1={150} y1={58} x2={210} y2={58} k={1} label="I₀ = 2 A" lx={180} ly={44} />
          <Flow id="i_l" x1={346} y1={150} x2={346} y2={200} k={1} label="" lx={0} ly={0} />
        </>
      )}
      {/* state readout */}
      {isRc ? <Tag x={238} y={178} id="v_node" text={`v_C = ${fmtV(v)}`} tone="node" /> : <Tag x={238} y={178} id="i_l" text={`i_L = ${fmtA(i)}`} tone="node" />}
      <g className={`w44-obj ${isLit('tau')}`} {...hov(['tau'])}>
        <text x={572} y={200} className="w44-lbl sub">
          {isRc ? 'τ = RC' : 'τ = L/R'}
        </text>
        <text x={572} y={218} className="w44-lbl strong">
          {isRc ? '= 1.00 s' : '= 50 ms'}
        </text>
      </g>
      <text x={572} y={240} className="w44-lbl sub">
        t =
      </text>
      <text x={572} y={258} className="w44-lbl strong">
        {on ? fmtT(t) : '< 0'}
      </text>
      {!isRc && (
        <text x={572} y={282} className="w44-lbl sub">
          {rich(on ? `v_L = ${fmtV(-RL_EX.r * i)}` : 'v_L = 0（短路）')}
        </text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------- the act-5 network */

function NetCircuit() {
  const isLit = useIsLit();
  const { sw, tn } = useTime();
  const r = useReveal();
  const [thev] = useStageParam('thev', false);
  const s = solveNet(NET);
  const on = sw === 'discharge';
  const t = on ? tn * s.tau : 0;
  const vC = on ? s.vC(t) : s.v0;
  const k = on ? Math.exp(-tn) : 0;
  const q = '?';
  const dim = on ? 'gone' : '';
  // the S blade: closed along the wire, open tilted up
  const blade = on ? 'M 95 80 L 126 60' : 'M 95 80 L 130 80';
  const showRth = on && thev;
  return (
    <g>
      <g className={`w44-obj ${isLit('gnd')}`} {...hov(['gnd'])}>
        <path d={`M ${on ? 240 : 60} ${GY} L 470 ${GY}`} className="w44-wire" />
        {on && <path d={`M 60 ${GY} L 240 ${GY}`} className="w44-wire gone" />}
      </g>
      {/* source and S */}
      <g className={`w44-obj src ${dim} ${isLit('vs')}`} {...hov(['vs'])}>
        <path d={`M 60 143 L 60 80 L 95 80 M 60 187 L 60 ${GY}`} className={`w44-wire ${dim}`} />
        <circle cx={60} cy={165} r={22} className="body" />
        <text x={60} y={160} textAnchor="middle" className="w44-pm p">
          +
        </text>
        <text x={60} y={182} textAnchor="middle" className="w44-pm m">
          −
        </text>
        <text x={60} y={284} textAnchor="middle" className="w44-lbl src">
          {rich('V_s = 24 V')}
        </text>
      </g>
      <g className={`w44-obj sw ${isLit('sw')}`} {...hov(['sw'])}>
        <rect x={86} y={46} width={52} height={44} rx={8} className="hit" />
        <path d={blade} className="blade" />
        <circle cx={95} cy={80} r={4} className="pin" />
        <circle cx={130} cy={80} r={4} className="pin" />
        <text x={112} y={104} textAnchor="middle" className={`w44-lbl ${on ? 'x' : 'sub'}`}>
          {on ? 'S 断开' : 'S 闭合'}
        </text>
      </g>
      <g className={`w44-obj res ${dim} ${isLit('r1')}`} {...hov(['r1'])}>
        <path d="M 130 80 L 142 80 M 202 80 L 240 80" className={`w44-wire ${dim}`} />
        <path d={zigH(142, 202, 80)} className="body-line" />
        <text x={172} y={62} textAnchor="middle" className="w44-lbl res">
          R₁ = 6 Ω
        </text>
      </g>
      {/* R2, R3, R4 */}
      <g className={`w44-obj res ${isLit('r2')}`} {...hov(['r2'])}>
        <path d={`M 240 80 L 240 118 M 240 208 L 240 ${GY}`} className="w44-wire" />
        <path d={zigV(240, 118, 208)} className="body-line" />
        <text x={254} y={168} className="w44-lbl res">
          R₂ = 12 Ω
        </text>
      </g>
      <g className={`w44-obj res ${isLit('r3')}`} {...hov(['r3'])}>
        <path d="M 240 80 L 268 80 M 328 80 L 370 80" className="w44-wire" />
        <path d={zigH(268, 328, 80)} className="body-line" />
        <text x={298} y={62} textAnchor="middle" className="w44-lbl res">
          R₃ = 6 Ω
        </text>
      </g>
      <g className={`w44-obj res ${isLit('r4')}`} {...hov(['r4'])}>
        <path d={`M 370 80 L 370 118 M 370 208 L 370 ${GY}`} className="w44-wire" />
        <path d={zigV(370, 118, 208)} className="body-line" />
        <text x={384} y={168} className="w44-lbl res">
          R₄ = 6 Ω
        </text>
      </g>
      <g className={`w44-obj cap ${isLit('cap_net')}`} {...hov(['cap_net'])}>
        <path d={`M 370 80 L 470 80 L 470 160 M 470 174 L 470 ${GY}`} className={`w44-wire ${on ? '' : 'open'}`} />
        <path d="M 446 160 L 494 160 M 446 174 L 494 174" className="plate" />
        <text x={498} y={200} className="w44-lbl">
          C = 0.2 F
        </text>
        {!on && (
          <text x={500} y={171} className="w44-lbl sub">
            （开路）
          </text>
        )}
      </g>
      {/* nodes */}
      <circle cx={240} cy={80} r={4.5} className={`w44-jn ${isLit('node_a')}`} />
      <circle cx={370} cy={80} r={4.5} className={`w44-jn ${isLit('node_b')}`} />
      <Tag x={240} y={36} id="node_a" text={on ? `v_A = ${r.shown('wave') ? fmtV(s.k2 * vC) : q}` : `v_A = ${r.shown('v0') ? fmtV(s.vA0, 0) : q}`} tone="node" />
      <Tag x={370} y={36} id="node_b" text={`v_C = ${(on ? r.shown('wave') || (tn === 0 && r.shown('cont')) : r.shown('v0')) ? fmtV(vC) : q}`} tone="node" />
      {/* currents */}
      {on ? (
        <>
          <Flow id="i_r4" x1={384} y1={110} x2={384} y2={136} k={k} label={r.shown('wave') ? fmtA(vC / NET.r4) : 'i₄'} lx={392} ly={130} anchor="start" />
          <Flow id="i_r23" x1={352} y1={96} x2={320} y2={96} k={k / 3} label={r.shown('wave') ? fmtA(vC / s.r23) : 'i₂₃'} lx={298} ly={112} />
          <Flow id="i_r23" x1={226} y1={110} x2={226} y2={136} k={k / 3} label="" lx={0} ly={0} />
        </>
      ) : (
        <>
          <Flow id="i_r1" x1={150} y1={98} x2={194} y2={98} k={1} label={r.shown('v0') ? fmtA(s.i1) : 'i₁'} lx={172} ly={116} />
          <Flow id="i_r2" x1={226} y1={110} x2={226} y2={136} k={0.5} label={r.shown('v0') ? fmtA(s.iR2) : ''} lx={220} ly={130} anchor="end" />
          <Flow id="i_r34" x1={276} y1={98} x2={320} y2={98} k={0.5} label={r.shown('v0') ? fmtA(s.iR34) : ''} lx={298} ly={116} />
        </>
      )}
      {/* Thévenin overlay */}
      {showRth && (
        <g className={`w44-obj thev ${isLit('r_th')}`} {...hov(['r_th'])}>
          <rect x={204} y={64} width={210} height={202} rx={12} className="box" />
          <path d="M 456 226 L 424 226" className="w44-wire thin" />
          <Head x={418} y={226} dx={-1} dy={0} cls="w44-arrow" />
          <text x={309} y={284} textAnchor="middle" className="w44-lbl th">
            {rich(r.shown('rth') ? `R_Th = (R₂+R₃) ∥ R₄ = ${fmtR(s.rth)}` : 'R_Th = ?（从 C 两端向左看）')}
          </text>
        </g>
      )}
      {/* side readout */}
      <g className="w44-side">
        <text x={572} y={66} className="w44-lbl sub">
          t =
        </text>
        <text x={572} y={84} className="w44-lbl strong">
          {on ? (r.shown('rth') ? fmtT(t) : `${tn.toFixed(2)} τ`) : '0⁻（稳态）'}
        </text>
        <g className={`w44-obj ${isLit('tau', 'r_th')}`} {...hov(['tau'])}>
          <text x={572} y={108} className="w44-lbl sub">
            {rich('τ = R_Th C')}
          </text>
          <text x={572} y={126} className="w44-lbl strong">
            {r.shown('rth') ? `= ${fmtT(s.tau)}` : '= ?'}
          </text>
        </g>
        {on && (
          <g className={`w44-obj ${isLit('jump', 'r2')}`} {...hov(['jump'])}>
            <text x={572} y={150} className="w44-lbl sub">
              {rich('v_R2 在 t = 0 跳变')}
            </text>
            <text x={572} y={168} className="w44-lbl strong x">
              {r.shown('wave') ? `${fmtV(s.vA0, 0)} → ${fmtV(s.vR2at0p, 0)}` : r.shown('cont') ? `${fmtV(s.vA0, 0)} → ?（跳变）` : '? → ?'}
            </text>
          </g>
        )}
        {on && r.shown('energy') && <EnergySplit tn={tn} />}
      </g>
    </g>
  );
}

/** the heat each resistor has taken by t: W_k(1 − e^(−2t/τ)) */
function EnergySplit({ tn }: { tn: number }) {
  const isLit = useIsLit();
  const s = solveNet(NET);
  const f = 1 - Math.exp(-2 * tn);
  const rows: [string, string, number, string][] = [
    ['r4', 'R₄', s.wR4, 'e4'],
    ['r2', 'R₂', s.wR2, 'e2'],
    ['r3', 'R₃', s.wR3, 'e3'],
  ];
  return (
    <g className={`w44-obj ${isLit('energy_net')}`} {...hov(['energy_net'])}>
      <text x={572} y={194} className="w44-lbl sub">
        已耗热 / W₀ = {fmtE(s.w0)}
      </text>
      {rows.map(([id, name, w, cls], i) => (
        <g key={id} className={`w44-obj ${isLit(id)}`} {...hov([id])}>
          <text x={572} y={214 + i * 18} className="w44-lbl sub">
            {name}
          </text>
          <rect x={592} y={205 + i * 18} width={40} height={11} rx={3} className="w44-ebar bg" />
          <rect x={592} y={205 + i * 18} width={(40 * w * f) / s.wR4} height={11} rx={3} className={`w44-ebar ${cls}`} />
          <text x={636} y={214 + i * 18} className="w44-lbl tiny">
            {fmtE(w * f)}
          </text>
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------- the layer */

const TOPOS: { value: Topo; label: string; short: string; hover: string[] }[] = [
  { value: 'rc', label: '面包板 RC（5 V · 10 kΩ · 100 µF）', short: '面包板 RC', hover: ['cap', 'res'] },
  { value: 'rl', label: 'RL 线圈（0.5 H · 10 Ω）', short: 'RL', hover: ['ind', 'res_l'] },
  { value: 'net', label: '第 5 幕例题网络（24 V）', short: '例题网络', hover: ['sw', 'r_th'] },
];

export default function Schematic() {
  useClearHoverOnUnmount();
  const [topo, setTopo] = useStageParam<Topo>('topo', 'rc');
  const [thev, setThev] = useStageParam('thev', false);
  const { sw } = useTime();
  const label = topo === 'rc' ? '面包板 RC 放电电路' : topo === 'rl' ? '无源 RL 衰减电路' : '带开关多电阻 RC 网络';
  return (
    <div className="w44-layer">
      <div className="w44-ctrl">
        <div className="w44-row">
          <Seg label="电路" value={topo} onChange={setTopo} options={TOPOS} />
          {topo === 'net' && <Check label="戴维南等效 R_Th" on={thev} set={setThev} hover={['r_th']} />}
          {topo === 'net' && <MaskNote />}
        </div>
        <TimeDock chargeLabel={topo === 'net' ? 't < 0 S 闭合' : 't < 0 充电'} hover={topo === 'net' ? ['sw'] : ['spdt']} />
      </div>
      <div className="w44-sch-wrap">
        <svg viewBox="0 0 680 300" className="w44-sch" role="img" aria-label={`${label}：${sw === 'charge' ? '换路前稳态' : '换路后无源放电'}`}>
          {topo === 'net' ? <NetCircuit /> : <SpdtCircuit kind={topo} />}
        </svg>
      </div>
    </div>
  );
}
