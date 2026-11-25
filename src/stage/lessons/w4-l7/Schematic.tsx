// Layer "01 2D 串联/并联 RLC 切换原理图": the source-free series RLC (one loop, the shared current
// i(t), KVL arrow) or parallel RLC (one node pair, the shared voltage v(t), three KCL branch
// currents), switched with the topology control. Next to it, the live α / ω0 panel: both rates as
// bars, the damping ratio and case, and α(R) against the flat ω0 line — the case boundary R_crit
// (α = ω0) is where they cross. α's formula lights up R where it sits (series numerator, parallel
// denominator).

import { fmtC, fmtL, fmtR, fmtRate, fmtV, REGIME_LABEL, rRange, sig } from './model';
import { GuidedNote, hoverProps, RSlider, TopoSwitch, useClearHoverOnUnmount, useIsLit, useLab, type Lab } from './state';

const INK = '#1f2a44';

function Zig({ x, y, vertical = false }: { x: number; y: number; vertical?: boolean }) {
  // a 60-unit resistor zigzag starting at (x, y)
  const pts = [0, 6, 14, 22, 30, 38, 46, 54, 60].map((d, k) => {
    const o = k === 0 || k === 8 ? 0 : k % 2 ? -9 : 9;
    return vertical ? `${x + o},${y + d}` : `${x + d},${y + o}`;
  });
  return <polyline points={pts.join(' ')} className="w47-zig" />;
}

function Coil({ x, y, vertical = false }: { x: number; y: number; vertical?: boolean }) {
  const d = [0, 1, 2, 3].map((k) => (vertical ? `Q ${x + 16} ${y + k * 15 + 7.5} ${x} ${y + (k + 1) * 15}` : `Q ${x + k * 15 + 7.5} ${y - 16} ${x + (k + 1) * 15} ${y}`));
  return <path d={`M ${x} ${y} ${d.join(' ')}`} className="w47-coil" />;
}

function Series({ lab }: { lab: Lab }) {
  const on = useIsLit();
  const { R, L, C, v0, i0 } = lab.c;
  return (
    <g>
      {/* loop: top wire with R and L, C on the right, bottom return */}
      <path d="M 40 70 L 80 70 M 140 70 L 170 70 M 230 70 L 290 70 L 290 112 M 290 136 L 290 190 L 40 190 L 40 70" className={`w47-wire ${on('sch_loop')}`} />
      <g className={`w47-part ${on('sch_r')}`} {...hoverProps(['sch_r'])}>
        <rect x={74} y={48} width={72} height={44} className="w47-hit" />
        <Zig x={80} y={70} />
        <text x={110} y={42} className="w47-t r mid">
          R = {fmtR(R)}
        </text>
      </g>
      <g className={`w47-part ${on('sch_l')}`} {...hoverProps(['sch_l'])}>
        <rect x={164} y={44} width={72} height={40} className="w47-hit" />
        <Coil x={170} y={70} />
        <text x={200} y={42} className="w47-t l mid">
          L = {fmtL(L)}
        </text>
      </g>
      <g className={`w47-part ${on('sch_c')}`} {...hoverProps(['sch_c'])}>
        <rect x={262} y={104} width={120} height={40} className="w47-hit" />
        <line x1={270} y1={112} x2={310} y2={112} className="w47-plate" />
        <line x1={270} y1={136} x2={310} y2={136} className="w47-plate" />
        <text x={262} y={111} className="w47-t c end">
          +
        </text>
        <text x={262} y={146} className="w47-t c end">
          −
        </text>
        <text x={318} y={122} className="w47-t c">
          C = {fmtC(C)}
        </text>
        <text x={318} y={140} className="w47-t c small">
          v_C(0) = {fmtV(v0, 0)}
        </text>
      </g>
      <g className={`w47-part ${on('sch_loop')}`} {...hoverProps(['sch_loop'])}>
        <path d="M 120 160 A 70 30 0 1 1 230 160" className="w47-loop" markerEnd="url(#w47-arr-blue)" />
        <text x={175} y={150} className="w47-t i mid">
          i(t) · KVL
        </text>
        <text x={175} y={180} className="w47-t i small mid">
          i(0) = {sig(i0)} A
        </text>
      </g>
    </g>
  );
}

function Parallel({ lab }: { lab: Lab }) {
  const on = useIsLit();
  const { R, L, C, v0, i0 } = lab.c;
  const arrow = (x: number, id: string, name: string) => (
    <g className={`w47-part ${on(id)}`} {...hoverProps([id])}>
      <line x1={x - 16} y1={60} x2={x - 16} y2={84} className="w47-iarr" markerEnd="url(#w47-arr-orange)" />
      <text x={x - 20} y={76} className="w47-t node end small">
        {name}
      </text>
    </g>
  );
  return (
    <g>
      <path d="M 40 50 L 300 50 M 40 196 L 300 196" className={`w47-wire ${on('sch_node')}`} />
      <path d="M 90 50 L 90 92 M 90 152 L 90 196 M 190 50 L 190 92 M 190 152 L 190 196 M 290 50 L 290 112 M 290 136 L 290 196" className="w47-wire" />
      <g className={`w47-part ${on('sch_node')}`} {...hoverProps(['sch_node'])}>
        <circle cx={190} cy={50} r={4.5} className="w47-node" />
        <text x={28} y={56} className="w47-t node end">
          +
        </text>
        <text x={28} y={128} className="w47-t node end">
          v(t)
        </text>
        <text x={28} y={202} className="w47-t node end">
          −
        </text>
        <text x={190} y={36} className="w47-t node mid small">
          KCL 节点：i_R + i_L + i_C = 0
        </text>
      </g>
      <g className={`w47-part ${on('sch_r')}`} {...hoverProps(['sch_r'])}>
        <rect x={70} y={88} width={56} height={68} className="w47-hit" />
        <Zig x={90} y={92} vertical />
        <text x={104} y={127} className="w47-t r">
          R
        </text>
        <text x={104} y={143} className="w47-t r small">
          {fmtR(R)}
        </text>
      </g>
      <g className={`w47-part ${on('sch_l')}`} {...hoverProps(['sch_l'])}>
        <rect x={176} y={88} width={64} height={68} className="w47-hit" />
        <Coil x={190} y={92} vertical />
        <text x={212} y={127} className="w47-t l">
          L
        </text>
        <text x={212} y={143} className="w47-t l small">
          {fmtL(L)}
        </text>
      </g>
      <g className={`w47-part ${on('sch_c')}`} {...hoverProps(['sch_c'])}>
        <rect x={262} y={104} width={130} height={40} className="w47-hit" />
        <line x1={272} y1={112} x2={308} y2={112} className="w47-plate" />
        <line x1={272} y1={136} x2={308} y2={136} className="w47-plate" />
        <text x={316} y={122} className="w47-t c">
          C = {fmtC(C)}
        </text>
        <text x={316} y={140} className="w47-t c small">
          v(0) = {fmtV(v0, 0)}
        </text>
      </g>
      {arrow(90, 'sch_ir', 'i_R')}
      {arrow(190, 'sch_il', 'i_L')}
      {arrow(290, 'sch_ic', 'i_C')}
      <text x={212} y={176} className="w47-t l small">
        i_L(0) = {sig(i0)} A
      </text>
    </g>
  );
}

/** α(R) against ω0 over the slider's range: the crossing is R_crit. */
function AlphaChart({ lab }: { lab: Lab }) {
  const on = useIsLit();
  const { topo, L, C, R } = lab.c;
  const s = lab.s;
  const r = rRange(topo, L, C, topo === 'series' ? lab.rl : 0);
  const X0 = 34;
  const X1 = 226;
  const Y0 = 96;
  const Y1 = 12;
  const fx = (x: number) => (r.log ? Math.log(x / r.lo) / Math.log(r.hi / r.lo) : (x - r.lo) / (r.hi - r.lo));
  const X = (x: number) => X0 + Math.min(1, Math.max(0, fx(x))) * (X1 - X0);
  const aMax = 2.5 * s.w0;
  const Y = (a: number) => Y0 - (Math.min(a, aMax) / aMax) * (Y0 - Y1);
  const n = 80;
  const at = (k: number) => (r.log ? r.lo * (r.hi / r.lo) ** (k / n) : r.lo + (k / n) * (r.hi - r.lo));
  const alphaAt = (x: number) => (topo === 'series' ? x / (2 * L) : 1 / (2 * x * C));
  const path = Array.from({ length: n + 1 }, (_, k) => `${k ? 'L' : 'M'} ${X(at(k)).toFixed(1)} ${Y(alphaAt(at(k))).toFixed(1)}`).join(' ');
  const xc = X(s.rcrit);
  const under = topo === 'series' ? [X0, xc] : [xc, X1];
  const over = topo === 'series' ? [xc, X1] : [X0, xc];
  return (
    <svg viewBox="0 0 240 124" className="w47-achart" role="img" aria-label="α 随 R 变化与 ω₀ 的交点 R_crit">
      <rect x={under[0]} y={Y1} width={under[1] - under[0]} height={Y0 - Y1} className="w47-zone under" />
      <rect x={over[0]} y={Y1} width={over[1] - over[0]} height={Y0 - Y1} className="w47-zone over" />
      <text x={(under[0] + under[1]) / 2} y={Y1 + 11} className="w47-zt under mid">
        欠阻尼
      </text>
      <text x={(over[0] + over[1]) / 2} y={Y1 + 11} className="w47-zt over mid">
        过阻尼
      </text>
      <line x1={X0} x2={X1} y1={Y0} y2={Y0} className="w47-axis" />
      <line x1={X0} x2={X0} y1={Y0} y2={Y1} className="w47-axis" />
      <g className={`w47-cg ${on('omega0')}`} {...hoverProps(['omega0'])}>
        <line x1={X0} x2={X1} y1={Y(s.w0)} y2={Y(s.w0)} className="w47-w0line" />
        <text x={X0 - 3} y={Y(s.w0) + 4} className="w47-tk end w0">
          ω₀
        </text>
      </g>
      <g className={`w47-cg ${on('alpha_box')}`} {...hoverProps(['alpha_box'])}>
        <path d={path} className="w47-aline" />
        <text x={X0 - 3} y={Y1 + 8} className="w47-tk end a">
          α
        </text>
      </g>
      <g className={`w47-cg ${on('r_crit')}`} {...hoverProps(['r_crit'])}>
        <line x1={xc} x2={xc} y1={Y0} y2={Y(s.w0)} className="w47-critline" />
        <circle cx={xc} cy={Y(s.w0)} r={4} className="w47-critdot" />
        <text x={xc} y={Y0 + 12} className="w47-tk mid crit">
          R_crit {fmtR(s.rcrit)}
        </text>
      </g>
      <circle cx={X(R)} cy={Y(s.alpha)} r={4.5} className="w47-rdot" />
      <text x={X1} y={Y0 + 24} className="w47-tk end">
        R{r.log ? '（对数）' : ''} →
      </text>
    </svg>
  );
}

function AlphaPanel({ lab }: { lab: Lab }) {
  const on = useIsLit();
  const s = lab.s;
  const series = lab.c.topo === 'series';
  if (lab.hidden(1))
    return (
      <div className="w47-apanel">
        <div className="w47-ap-left">
          <b className="w47-ap-title">α 与 ω₀ 实时对比</b>
          <p className="w47-ap-wait">引导例题第 1 步：α、ω₀ 与阻尼状态等你算出后揭晓。</p>
        </div>
      </div>
    );
  const top = Math.max(s.alpha, s.w0) * 1.08;
  return (
    <div className="w47-apanel">
      <div className="w47-ap-left">
        <b className="w47-ap-title">α 与 ω₀ 实时对比</b>
        <div className={`w47-bar a ${on('alpha_box')}`} {...hoverProps(['alpha_box'])}>
          <span className="w47-bar-name">
            α = {series ? <em className="r">R</em> : '1'}/
            {series ? (
              '(2L)'
            ) : (
              <>
                (2·<em className="r">R</em>·C)
              </>
            )}
          </span>
          <span className="w47-bar-track">
            <i style={{ width: `${(s.alpha / top) * 100}%` }} />
          </span>
          <b>{fmtRate(s.alpha, 'Np/s')}</b>
        </div>
        <div className={`w47-bar w ${on('omega0')}`} {...hoverProps(['omega0'])}>
          <span className="w47-bar-name">ω₀ = 1/√(LC)</span>
          <span className="w47-bar-track">
            <i style={{ width: `${(s.w0 / top) * 100}%` }} />
          </span>
          <b>{fmtRate(s.w0, 'rad/s')}</b>
        </div>
        <p className={`w47-ap-case ${s.regime}`}>
          ζ = α/ω₀ = <b>{sig(s.zeta)}</b> → <b>{REGIME_LABEL[s.regime]}</b>
          <span> · {series ? 'R ↑ → α ↑（阻尼增强）' : 'R ↑ → α ↓（阻尼减弱）'}</span>
        </p>
      </div>
      <AlphaChart lab={lab} />
    </div>
  );
}

export default function Schematic() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const series = lab.c.topo === 'series';
  return (
    <div className="w47-layer">
      <div className="w47-dock">
        <TopoSwitch lab={lab} />
        <RSlider lab={lab} />
      </div>
      <div className="w47-sch-row">
        <div className="w47-sch-wrap">
          <svg viewBox="0 0 400 230" className="w47-sch" role="img" aria-label={series ? '无源串联 RLC 原理图' : '无源并联 RLC 原理图'}>
            <defs>
              <marker id="w47-arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
              </marker>
              <marker id="w47-arr-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ea580c" />
              </marker>
            </defs>
            <text x={8} y={18} className="w47-t title" fill={INK}>
              {series ? '无源串联 RLC（Section 8.3 · KVL 回路）' : '无源并联 RLC（Section 8.4 · KCL 节点）'}
            </text>
            {series ? <Series lab={lab} /> : <Parallel lab={lab} />}
            <text x={8} y={222} className="w47-t small muted">
              {series ? '共享电流 i(t)：LC·v_C″ + RC·v_C′ + v_C = 0' : '共享电压 v(t)：v″ + v′/(RC) + v/(LC) = 0'}
            </text>
          </svg>
        </div>
        <AlphaPanel lab={lab} />
      </div>
      {lab.locked && <GuidedNote />}
    </div>
  );
}
