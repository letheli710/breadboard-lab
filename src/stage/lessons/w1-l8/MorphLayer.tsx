// Layer "01 Y ↔ Δ 几何变形过渡原理图": a three-terminal network (ports a, b, c) that morphs from
// the Δ (sides R_a on b–c, R_b on a–c, R_c on a–b) to the Y (arms R_1, R_2, R_3 meeting in n)
// as t goes 0 → 1; at t ≈ 0.5 both are drawn (the "叠画记忆态"): hovering a Y arm marks its two
// adjacent Δ sides with an arc, hovering a Δ side points a dashed arrow at its opposite Y arm.
// Controls: the morph slider (and a play button), direction Δ → Y / Y → Δ (which side the
// sliders set), a virtual ohmmeter on a port pair (third port open; both networks read the
// same), the balanced lock (R_Δ = 3 R_Y) and the drawing style: slanted Δ / Y or the square
// Π / T of real schematics. Stage params: m_t, m_dir, m_ohm, m_bal, m_shape, m_ra … m_r3.

import { Tex } from '../../StageText';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { deltaToWye, fmt, portResistance, wyeToDelta, type Delta, type PortPair, type Wye } from './math';
import { clamp01, hoverProps, lerp, lerpPt, mid, Res, RName, useClearHoverOnUnmount, useTween, type Pt } from './parts';
import './w1-l8.css';

type Dir = 'd2y' | 'y2d';
type Ohm = 'off' | PortPair;
type Port = 'a' | 'b' | 'c';
type Side = 'ra' | 'rb' | 'rc';
type Arm = 'r1' | 'r2' | 'r3';

/** Geometry of the two drawing styles; the stage interpolates between them. */
interface Shape {
  port: Record<Port, Pt>;
  n: Pt;
  /** ends of the Δ sides (the Π's top corners and feet differ from the ports) */
  side: Record<Side, [Pt, Pt]>;
  /** where along a Δ side its box sits */
  boxAt: Record<Side, number>;
  /** the Π's foot line (node c) */
  foot: [Pt, Pt];
}

const SLANT: Shape = {
  port: { a: [52, 46], b: [308, 46], c: [180, 262] },
  n: [180, 118],
  side: {
    ra: [
      [308, 46],
      [180, 262],
    ],
    rb: [
      [52, 46],
      [180, 262],
    ],
    rc: [
      [52, 46],
      [308, 46],
    ],
  },
  boxAt: { ra: 0.5, rb: 0.5, rc: 0.5 },
  foot: [
    [180, 262],
    [180, 262],
  ],
};

const TPI: Shape = {
  port: { a: [44, 100], b: [316, 100], c: [180, 250] },
  n: [180, 100],
  side: {
    ra: [
      [316, 46],
      [316, 250],
    ],
    rb: [
      [44, 46],
      [44, 250],
    ],
    rc: [
      [44, 46],
      [316, 46],
    ],
  },
  boxAt: { ra: 0.66, rb: 0.66, rc: 0.5 },
  foot: [
    [44, 250],
    [316, 250],
  ],
};

function shapeAt(u: number): Shape {
  const P = (p: Pt, q: Pt) => lerpPt(p, q, u);
  const ports = (['a', 'b', 'c'] as Port[]).map((k) => [k, P(SLANT.port[k], TPI.port[k])]);
  const sides = (['ra', 'rb', 'rc'] as Side[]).map((k) => [k, [P(SLANT.side[k][0], TPI.side[k][0]), P(SLANT.side[k][1], TPI.side[k][1])]]);
  return {
    port: Object.fromEntries(ports) as Shape['port'],
    n: P(SLANT.n, TPI.n),
    side: Object.fromEntries(sides) as Shape['side'],
    boxAt: { ra: lerp(0.5, 0.66, u), rb: lerp(0.5, 0.66, u), rc: 0.5 },
    foot: [P(SLANT.foot[0], TPI.foot[0]), P(SLANT.foot[1], TPI.foot[1])],
  };
}

const ARM_PORT: Record<Arm, Port> = { r1: 'a', r2: 'b', r3: 'c' };
/** the Y arm opposite each Δ side */
const ARM_OF: Record<Side, Arm> = { ra: 'r1', rb: 'r2', rc: 'r3' };
/** the two Δ sides that touch each port */
const ADJ: Record<Port, [Side, Side]> = { a: ['rb', 'rc'], b: ['rc', 'ra'], c: ['ra', 'rb'] };
const SUB: Record<Side | Arm, string> = { ra: 'a', rb: 'b', rc: 'c', r1: '1', r2: '2', r3: '3' };
const ID = {
  side: (s: Side) => `delta_${s}`,
  arm: (a: Arm) => `wye_${a}`,
  port: (p: Port) => `term_${p}`,
};
const OHM_OPTS: { v: Ohm; label: string }[] = [
  { v: 'off', label: '关' },
  { v: 'ab', label: 'R_ab（c 开路）' },
  { v: 'bc', label: 'R_bc（a 开路）' },
  { v: 'ca', label: 'R_ca（b 开路）' },
];
const OPEN_OF: Record<PortPair, Port> = { ab: 'c', bc: 'a', ca: 'b' };

/** An arc around port `p` from the direction of q1 to the direction of q2 (the smaller way). */
function arcPath(p: Pt, q1: Pt, q2: Pt, r: number): string {
  const b1 = Math.atan2(q1[1] - p[1], q1[0] - p[0]);
  const b2 = Math.atan2(q2[1] - p[1], q2[0] - p[0]);
  let d = b2 - b1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const a1 = d < 0 ? b2 : b1;
  d = Math.abs(d);
  const s: Pt = [p[0] + r * Math.cos(a1), p[1] + r * Math.sin(a1)];
  const e: Pt = [p[0] + r * Math.cos(a1 + d), p[1] + r * Math.sin(a1 + d)];
  return `M ${s[0]} ${s[1]} A ${r} ${r} 0 0 1 ${e[0]} ${e[1]}`;
}

function Slider({
  label,
  sub,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="yd-slider">
      <span>
        {label}
        <sub>{sub}</sub>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={`${fmt(value)} Ω`} />
      <b>{fmt(value)} Ω</b>
    </label>
  );
}

export default function MorphLayer() {
  useClearHoverOnUnmount();
  const lit = useLit();
  const [tParam, setT] = useStageParam('m_t', 0.5);
  const [dir] = useStageParam<Dir>('m_dir', 'd2y');
  const [ohm, setOhm] = useStageParam<Ohm>('m_ohm', 'off');
  const [bal, setBal] = useStageParam('m_bal', false);
  const [shapeP, setShape] = useStageParam<'slant' | 'tpi'>('m_shape', 'slant');
  const [ra, setRa] = useStageParam('m_ra', 15);
  const [rb, setRb] = useStageParam('m_rb', 10);
  const [rc, setRc] = useStageParam('m_rc', 25);
  const [r1, setR1] = useStageParam('m_r1', 5);
  const [r2, setR2] = useStageParam('m_r2', 7.5);
  const [r3, setR3] = useStageParam('m_r3', 3);

  const t = useTween(tParam, 1100);
  const u = useTween(shapeP === 'tpi' ? 1 : 0, 700);
  const g = useStage((s) => s.setParams);

  // the given side and the computed one
  const d: Delta = dir === 'd2y' ? { ra, rb, rc } : wyeToDelta({ r1, r2, r3 });
  const y: Wye = dir === 'd2y' ? deltaToWye({ ra, rb, rc }) : { r1, r2, r3 };
  const sum = d.ra + d.rb + d.rc;
  const psum = y.r1 * y.r2 + y.r2 * y.r3 + y.r3 * y.r1;

  // what is lit, with the two overlay ids expanded
  const on = new Set(lit);
  const arcs = new Set<Port>();
  const arrows = new Set<Side>();
  if (on.has('overlay_adj_r1')) {
    ['wye_r1', 'delta_rb', 'delta_rc'].forEach((i) => on.add(i));
    arcs.add('a');
  }
  if (on.has('overlay_opp_ra')) {
    ['delta_ra', 'wye_r1'].forEach((i) => on.add(i));
    arrows.add('ra');
  }
  const overlay = t > 0.22 && t < 0.78;
  if (overlay) {
    for (const a of ['r1', 'r2', 'r3'] as Arm[])
      if (lit.includes(ID.arm(a))) {
        arcs.add(ARM_PORT[a]);
        ADJ[ARM_PORT[a]].forEach((s) => on.add(ID.side(s)));
      }
    for (const s of ['ra', 'rb', 'rc'] as Side[])
      if (lit.includes(ID.side(s))) {
        arrows.add(s);
        on.add(ID.arm(ARM_OF[s]));
      }
  }

  const sh = shapeAt(u);
  const dAlpha = t <= 0.5 ? 1 : clamp01(1 - (t - 0.5) * 2);
  const grow = clamp01(t / 0.5);
  const dashed = t > 0.12;

  const sideBox = (s: Side): Pt => lerpPt(sh.side[s][0], sh.side[s][1], sh.boxAt[s]);
  const armEnd = (a: Arm, k: number): Pt => lerpPt(sh.port[ARM_PORT[a]], sh.n, k);
  const armBox = (a: Arm): Pt => mid(sh.port[ARM_PORT[a]], sh.n);

  const toggleDir = () => {
    // carry the current values over so the picture stays put
    if (dir === 'd2y') g({ m_dir: 'y2d', m_r1: y.r1, m_r2: y.r2, m_r3: y.r3 });
    else g({ m_dir: 'd2y', m_ra: d.ra, m_rb: d.rb, m_rc: d.rc });
  };
  const toggleBal = () => {
    if (bal) return setBal(false);
    if (dir === 'd2y') g({ m_bal: true, m_rb: ra, m_rc: ra });
    else g({ m_bal: true, m_r2: r1, m_r3: r1 });
  };
  const ohmPorts: Port[] = ohm === 'off' ? [] : [ohm[0] as Port, ohm[1] as Port];
  const reading = ohm === 'off' ? null : portResistance(ohm, d, y);

  const cyan = String.raw`\color{#0369a1}`;
  const amber = String.raw`\color{#b45309}`;
  const rowsD2Y: { arm: Arm; ids: string[]; tex: string }[] = (['r1', 'r2', 'r3'] as Arm[]).map((a) => {
    // R_1 = R_b R_c / Σ, R_2 = R_c R_a / Σ, R_3 = R_a R_b / Σ (the sheet's order)
    const [p, q] = ADJ[ARM_PORT[a]];
    return {
      arm: a,
      ids: [ID.arm(a), ID.side(p), ID.side(q)],
      tex: String.raw`{${amber} R_${SUB[a]}} = \frac{${cyan} R_${SUB[p]} R_${SUB[q]}}{R_\Sigma} = \frac{${fmt(d[p])} \times ${fmt(d[q])}}{${fmt(sum)}} = ${fmt(y[a])}\,\Omega`,
    };
  });
  const rowsY2D: { side: Side; ids: string[]; tex: string }[] = (['ra', 'rb', 'rc'] as Side[]).map((s) => ({
    side: s,
    ids: [ID.side(s), ID.arm(ARM_OF[s])],
    tex: String.raw`{${cyan} R_${SUB[s]}} = \frac{P_\Sigma}{${amber} R_${SUB[ARM_OF[s]]}} = \frac{${fmt(psum)}}{${fmt(y[ARM_OF[s]])}} = ${fmt(d[s])}\,\Omega`,
  }));

  return (
    <div className="yd-layer">
      <div className="yd-controls">
        <div className="yd-seg" role="radiogroup" aria-label="变换方向">
          <button role="radio" aria-checked={dir === 'd2y'} className={dir === 'd2y' ? 'on' : ''} onClick={() => dir !== 'd2y' && toggleDir()}>
            Δ → Y
          </button>
          <button role="radio" aria-checked={dir === 'y2d'} className={dir === 'y2d' ? 'on' : ''} onClick={() => dir !== 'y2d' && toggleDir()}>
            Y → Δ
          </button>
        </div>
        <div className="yd-seg" role="radiogroup" aria-label="画法">
          <button role="radio" aria-checked={shapeP === 'slant'} className={shapeP === 'slant' ? 'on' : ''} onClick={() => setShape('slant')}>
            斜线 Δ / Y
          </button>
          <button role="radio" aria-checked={shapeP === 'tpi'} className={shapeP === 'tpi' ? 'on' : ''} onClick={() => setShape('tpi')}>
            直角 Π / T
          </button>
        </div>
        <button className={`yd-toggle ${bal ? 'on' : ''}`} aria-pressed={bal} onClick={toggleBal}>
          对称锁定
        </button>
      </div>

      <div className="yd-morph">
        <span className="yd-end delta">Δ</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(tParam * 100)}
          onChange={(e) => setT(Number(e.target.value) / 100)}
          aria-label="变形进度 t"
          aria-valuetext={`t = ${tParam.toFixed(2)}`}
        />
        <span className="yd-end wye">Y</span>
        <b className="yd-tval">t = {tParam.toFixed(2)}</b>
        <button className="yd-play" onClick={() => setT(tParam < 0.5 ? 1 : 0)}>
          {tParam < 0.5 ? '变成 Y' : '变回 Δ'}
        </button>
        <button className={`yd-play ${Math.abs(tParam - 0.5) < 0.01 ? 'on' : ''}`} onClick={() => setT(0.5)}>
          叠画
        </button>
      </div>

      <svg
        viewBox="0 0 360 296"
        className="yd-svg"
        role="img"
        aria-label={`三端网络，t = ${tParam.toFixed(2)}，Δ：R_a ${fmt(d.ra)}、R_b ${fmt(d.rb)}、R_c ${fmt(d.rc)} Ω；Y：R_1 ${fmt(y.r1)}、R_2 ${fmt(y.r2)}、R_3 ${fmt(y.r3)} Ω`}
      >
        <defs>
          <marker id="yd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
          </marker>
        </defs>
        <rect x="2" y="2" width="356" height="292" rx="12" className="yd-bg" />

        {/* Π foot (node c drawn long) */}
        <line x1={sh.foot[0][0]} y1={sh.foot[0][1]} x2={sh.foot[1][0]} y2={sh.foot[1][1]} className="yd-foot" opacity={u} />

        {/* Δ sides */}
        {(['ra', 'rb', 'rc'] as Side[]).map((s) => {
          const isOn = on.has(ID.side(s));
          const op = Math.max(dAlpha, isOn ? 0.85 : 0);
          if (op <= 0.01) return null;
          const [p, q] = sh.side[s];
          return (
            <g key={s} opacity={op}>
              <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} className={`yd-wire delta ${dashed ? 'dashed' : ''} ${isOn ? 'lit' : ''}`} />
              <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} className="yd-hit" {...hoverProps([ID.side(s)])} />
            </g>
          );
        })}

        {/* Y arms */}
        {(['r1', 'r2', 'r3'] as Arm[]).map((a) => {
          const isOn = on.has(ID.arm(a));
          const k = isOn ? 1 : grow;
          if (k <= 0.01) return null;
          const p = sh.port[ARM_PORT[a]];
          const e = armEnd(a, k);
          return (
            <g key={a} opacity={isOn ? 1 : Math.min(1, 0.25 + grow)}>
              <line x1={p[0]} y1={p[1]} x2={e[0]} y2={e[1]} className={`yd-wire wye ${isOn ? 'lit' : ''}`} />
              <line x1={p[0]} y1={p[1]} x2={e[0]} y2={e[1]} className="yd-hit" {...hoverProps([ID.arm(a)])} />
            </g>
          );
        })}

        {/* adjacency arcs and opposite arrows (the overlay memory aid) */}
        {u < 0.5 &&
          [...arcs].map((p) => {
            const [s1, s2] = ADJ[p];
            const far = (s: Side) => (sh.side[s][0][0] === sh.port[p][0] && sh.side[s][0][1] === sh.port[p][1] ? sh.side[s][1] : sh.side[s][0]);
            return <path key={p} d={arcPath(sh.port[p], far(s1), far(s2), 34)} className="yd-arc" />;
          })}
        {[...arrows].map((s) => {
          const from = armBox(ARM_OF[s]);
          const to = sideBox(s);
          const k = 0.2;
          const p0 = lerpPt(from, to, k);
          const p1 = lerpPt(from, to, 1 - k);
          return <line key={s} x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} className="yd-opp" markerEnd="url(#yd-arrow)" />;
        })}

        {/* boxes: Δ sides, then Y arms */}
        {(['ra', 'rb', 'rc'] as Side[]).map((s) => {
          const isOn = on.has(ID.side(s));
          const op = Math.max(dAlpha, isOn ? 0.9 : 0);
          if (op <= 0.01) return null;
          return <Res key={s} at={sideBox(s)} sub={SUB[s]} value={`${fmt(d[s])}Ω`} tone="delta" lit={isOn} opacity={op} hover={[ID.side(s)]} />;
        })}
        {(['r1', 'r2', 'r3'] as Arm[]).map((a) => {
          const isOn = on.has(ID.arm(a));
          const op = isOn ? 1 : clamp01((grow - 0.35) / 0.65);
          if (op <= 0.01) return null;
          return <Res key={a} at={armBox(a)} sub={SUB[a]} value={`${fmt(y[a])}Ω`} tone="wye" lit={isOn} opacity={op} width={64} hover={[ID.arm(a)]} />;
        })}

        {/* centre node n */}
        {(grow > 0.01 || on.has('node_n')) && (
          <g opacity={on.has('node_n') ? 1 : grow} {...hoverProps(['node_n'])}>
            <circle cx={sh.n[0]} cy={sh.n[1]} r={on.has('node_n') ? 9 : 0} className="yd-node-glow n" />
            <circle cx={sh.n[0]} cy={sh.n[1]} r={5} className={`yd-node n ${on.has('node_n') ? 'lit' : ''}`} />
            <text x={sh.n[0] + 9} y={sh.n[1] + (u > 0.5 ? -8 : 16)} className="yd-node-label n">
              n
            </text>
          </g>
        )}

        {/* ports */}
        {(['a', 'b', 'c'] as Port[]).map((p) => {
          const pos = sh.port[p];
          const isOn = on.has(ID.port(p));
          const lp: Pt = p === 'a' ? [pos[0] - 16, pos[1] + 20] : p === 'b' ? [pos[0] + 16, pos[1] + 20] : [pos[0] + 14, pos[1] + 18];
          const open = ohm !== 'off' && OPEN_OF[ohm] === p;
          return (
            <g key={p} {...hoverProps([ID.port(p)])}>
              <circle cx={pos[0]} cy={pos[1]} r={isOn ? 12 : 0} className="yd-node-glow port" />
              <circle cx={pos[0]} cy={pos[1]} r={6} className={`yd-node port ${isOn ? 'lit' : ''}`} />
              <text x={lp[0]} y={lp[1]} textAnchor="middle" className="yd-node-label port">
                {p}
              </text>
              {open && (
                <text
                  x={pos[0] + (p === 'a' ? -2 : p === 'b' ? 2 : 0)}
                  y={pos[1] + (p === 'c' ? 30 : -24)}
                  textAnchor={p === 'a' ? 'start' : p === 'b' ? 'end' : 'middle'}
                  className="yd-open"
                >
                  开路
                </text>
              )}
            </g>
          );
        })}

        {/* ohmmeter probes */}
        {ohmPorts.map((p, i) => {
          const pos = sh.port[p];
          const dx = p === 'a' ? -1 : p === 'b' ? 1 : 0;
          const dy = p === 'c' ? 1 : -1;
          const tip: Pt = [pos[0] + dx * 4, pos[1] + dy * 4];
          const end: Pt = [pos[0] + dx * 22, pos[1] + dy * 26];
          return (
            <g key={p} className={`yd-probe ${i === 0 ? 'red' : 'black'}`}>
              <line x1={tip[0]} y1={tip[1]} x2={end[0]} y2={end[1]} />
              <circle cx={end[0]} cy={end[1]} r={4} />
            </g>
          );
        })}

        {bal && (
          <text x="180" y="20" textAnchor="middle" className="yd-bal-note">
            对称锁定：
            <RName sub="Δ" /> = {fmt(d.ra)} Ω = 3 × <RName sub="Y" /> = 3 × {fmt(y.r1)} Ω
          </text>
        )}
      </svg>

      {reading && ohm !== 'off' && (
        <div className="yd-ohm-read" role="status">
          <span className="delta">
            Δ 侧 <Tex tex={ohmTexDelta(ohm, d)} />
          </span>
          <span className="eq">=</span>
          <span className="wye">
            Y 侧 <Tex tex={ohmTexWye(ohm, y)} />
          </span>
        </div>
      )}

      <div className={`yd-formulas ${dir}`} aria-label="公式条">
        <div className="yd-formula-head">
          {dir === 'd2y' ? (
            <>
              Δ → Y：相邻两臂之积 ÷ 三臂之和 <Tex tex={String.raw`R_\Sigma = ${fmt(d.ra)} + ${fmt(d.rb)} + ${fmt(d.rc)} = ${fmt(sum)}\,\Omega`} />
            </>
          ) : (
            <>
              Y → Δ：两两乘积之和 ÷ 对面电阻 <Tex tex={String.raw`P_\Sigma = R_1R_2 + R_2R_3 + R_3R_1 = ${fmt(psum)}\,\Omega^2`} />
            </>
          )}
        </div>
        {dir === 'd2y'
          ? rowsD2Y.map((r) => (
              <div key={r.arm} className={`yd-formula ${r.ids.some((i) => on.has(i)) ? 'lit' : ''}`} {...hoverProps(r.ids)}>
                <Tex tex={r.tex} />
              </div>
            ))
          : rowsY2D.map((r) => (
              <div key={r.side} className={`yd-formula ${r.ids.some((i) => on.has(i)) ? 'lit' : ''}`} {...hoverProps(r.ids)}>
                <Tex tex={r.tex} />
              </div>
            ))}
      </div>

      <div className="yd-bottom">
        <div className="yd-seg small" role="radiogroup" aria-label="端口虚拟欧姆表">
          <span className="yd-seg-label">欧姆表</span>
          {OHM_OPTS.map((o) => (
            <button key={o.v} role="radio" aria-checked={ohm === o.v} className={ohm === o.v ? 'on' : ''} onClick={() => setOhm(o.v)}>
              {o.label.startsWith('R_') ? (
                <>
                  R<sub>{o.label.slice(2, 4)}</sub>
                  {o.label.slice(4)}
                </>
              ) : (
                o.label
              )}
            </button>
          ))}
        </div>
        <div className="yd-sliders">
          {dir === 'd2y' ? (
            bal ? (
              <Slider label="R" sub="Δ" value={ra} min={3} max={60} step={1} onChange={(v) => g({ m_ra: v, m_rb: v, m_rc: v })} />
            ) : (
              <>
                <Slider label="R" sub="a" value={ra} min={3} max={60} step={1} onChange={setRa} />
                <Slider label="R" sub="b" value={rb} min={3} max={60} step={1} onChange={setRb} />
                <Slider label="R" sub="c" value={rc} min={3} max={60} step={1} onChange={setRc} />
              </>
            )
          ) : bal ? (
            <Slider label="R" sub="Y" value={r1} min={1} max={20} step={0.5} onChange={(v) => g({ m_r1: v, m_r2: v, m_r3: v })} />
          ) : (
            <>
              <Slider label="R" sub="1" value={r1} min={1} max={20} step={0.5} onChange={setR1} />
              <Slider label="R" sub="2" value={r2} min={1} max={20} step={0.5} onChange={setR2} />
              <Slider label="R" sub="3" value={r3} min={1} max={20} step={0.5} onChange={setR3} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ohmTexDelta(pair: PortPair, d: Delta): string {
  const [x, p, q] = pair === 'ab' ? (['c', 'a', 'b'] as const) : pair === 'bc' ? (['a', 'b', 'c'] as const) : (['b', 'c', 'a'] as const);
  const v = (k: 'a' | 'b' | 'c') => fmt(d[`r${k}`]);
  const r = (d[`r${x}`] * (d[`r${p}`] + d[`r${q}`])) / (d.ra + d.rb + d.rc);
  return String.raw`R_${x} \parallel (R_${p} + R_${q}) = ${v(x)} \parallel ${fmt(d[`r${p}`] + d[`r${q}`])} = ${fmt(r)}\,\Omega`;
}

function ohmTexWye(pair: PortPair, y: Wye): string {
  const [i, j] = pair === 'ab' ? ([1, 2] as const) : pair === 'bc' ? ([2, 3] as const) : ([3, 1] as const);
  return String.raw`R_${i} + R_${j} = ${fmt(y[`r${i}`])} + ${fmt(y[`r${j}`])} = ${fmt(y[`r${i}`] + y[`r${j}`])}\,\Omega`;
}
