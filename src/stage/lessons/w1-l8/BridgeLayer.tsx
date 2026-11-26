// Layer "02 电桥电路一键化简实战台": the 5-resistor Wheatstone bridge (a top, c left, d right,
// b bottom; R_ac, R_ad, bridge arm R_cd, R_cb, R_db). The one-click button runs the sheet's
// 1.2 s three-phase animation: the top Δ (a–c–d) pulses, R_ac / R_ad / R_cd shrink into the
// star R_2 / R_3 / R_1 around a new node n, then the two series branches light (orange
// R_2 + R_cb, purple R_3 + R_db) and the "已退化为普通串并联！" tag shows. The 5-step stepper
// walks the same reduction; at step 0 clicking two resistors runs a series / parallel check
// (node-degree message). Presets: the lesson's unbalanced bridge (→ 14 Ω), all 30 Ω (→ 30 Ω),
// or custom values. Stage params: b_preset, b_step, b_ac … b_db, and b_quiz: while the guided
// example asks for a number the stage would show (R_1 … R_3 at step 2, R_ab at step 4) it shows
// "?" instead; any stage control clears it.

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { Tex } from '../../StageText';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { fmt, reduceBridge, type Bridge } from './math';
import { hoverProps, lerpPt, mid, Res, RName, useClearHoverOnUnmount, useTween, type Pt } from './parts';
import './w1-l8.css';

type Preset = 'classic' | 'sym' | 'custom';
type Node = 'a' | 'b' | 'c' | 'd';
type Key = keyof Bridge;

const PRESETS: { v: Preset; label: string }[] = [
  { v: 'classic', label: '经典不平衡电桥' },
  { v: 'sym', label: '全对称 30 Ω' },
  { v: 'custom', label: '自定义阻值' },
];
const CLASSIC: Bridge = { ac: 12, ad: 18, cd: 6, cb: 10, db: 21 };
const SYM: Bridge = { ac: 30, ad: 30, cd: 30, cb: 30, db: 30 };

const STEPS = ['原图', '圈 Δ', 'Δ → Y', '串联', '求 R_ab'];

const P: Record<Node | 'n', Pt> = { a: [180, 40], c: [62, 150], d: [298, 150], b: [180, 262], n: [180, 108] };

/** the five resistors: ends, stage id, nodes for the series / parallel check */
const RES: { key: Key; sub: string; id: string; nodes: [Node, Node] }[] = [
  { key: 'ac', sub: 'ac', id: 'br_ac', nodes: ['a', 'c'] },
  { key: 'ad', sub: 'ad', id: 'br_ad', nodes: ['a', 'd'] },
  { key: 'cd', sub: 'cd', id: 'bridge_mid', nodes: ['c', 'd'] },
  { key: 'cb', sub: 'cb', id: 'br_cb', nodes: ['c', 'b'] },
  { key: 'db', sub: 'db', id: 'br_db', nodes: ['d', 'b'] },
];
/** each node's branches (the resistors at it, plus the port lead at a and b) */
const BRANCHES: Record<Node, string[]> = {
  a: ['R_ac', 'R_ad', '端口引线'],
  b: ['R_cb', 'R_db', '端口引线'],
  c: ['R_ac', 'R_cd', 'R_cb'],
  d: ['R_ad', 'R_cd', 'R_db'],
};

/** Why two bridge resistors are neither in series nor in parallel. */
function checkPair(i: number, j: number): string {
  const A = RES[i];
  const B = RES[j];
  const shared = A.nodes.filter((n) => B.nodes.includes(n));
  const name = (r: (typeof RES)[number]) => `R_${r.sub}`;
  if (shared.length === 0) return `${name(A)} 与 ${name(B)} 没有公共节点：既不串联，也不并联。`;
  const n = shared[0];
  const others = [A.nodes.find((x) => x !== n)!, B.nodes.find((x) => x !== n)!];
  const extra = BRANCHES[n].filter((x) => x !== name(A) && x !== name(B));
  return `${name(A)} 与 ${name(B)} 不串联：公共节点 ${n} 的度数是 ${BRANCHES[n].length}（还连着 ${extra.join('、')}）；也不并联：另一端分别在 ${others[0]}、${others[1]}，不是同一对节点。`;
}

/** "R_ac" in a plain string → R with a subscript (HTML). */
function Subbed({ text }: { text: string }) {
  const parts = text.split(/(R_[a-z0-9Σ]+)/);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('R_') ? (
          <span key={i}>
            R<sub>{p.slice(2)}</sub>
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export default function BridgeLayer() {
  useClearHoverOnUnmount();
  const lit = useLit();
  const setParams = useStage((s) => s.setParams);
  const [preset, setPreset] = useStageParam<Preset>('b_preset', 'classic');
  const [step, setStepParam] = useStageParam('b_step', 0);
  const [quiz] = useStageParam('b_quiz', false);
  const setStep = (n: number) => setParams({ b_step: n, b_quiz: false });
  const hideY = quiz && step === 2;
  const hideAB = quiz && step >= 4;
  const shown = (x: number, hide: boolean) => (hide ? '?' : fmt(x));
  const custom: Bridge = {
    ac: useStageParam('b_ac', 12)[0],
    ad: useStageParam('b_ad', 18)[0],
    cd: useStageParam('b_cd', 6)[0],
    cb: useStageParam('b_cb', 10)[0],
    db: useStageParam('b_db', 21)[0],
  };
  const v = preset === 'classic' ? CLASSIC : preset === 'sym' ? SYM : custom;
  const r = reduceBridge(v);
  const s = useTween(step >= 2 ? 1 : 0, 520);
  const [sel, setSel] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const on = new Set(lit);
  const post = s >= 0.5;

  // the sheet's three-phase animation: 0–0.4 s pulse the top Δ, 0.4–0.9 s morph, 0.9–1.2 s colour
  const transform = () => {
    timers.current.forEach(clearTimeout);
    setSel([]);
    if (step >= 2) {
      setStep(0);
      return;
    }
    if (prefersReducedMotion()) {
      setStep(3);
      return;
    }
    setPlaying(true);
    setStep(1);
    timers.current = [setTimeout(() => setStepParam(2), 400), setTimeout(() => setStepParam(3), 900), setTimeout(() => setPlaying(false), 1200)];
  };

  const pick = (i: number) => {
    if (step >= 2) return;
    setSel((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : cur.length >= 2 ? [cur[1], i] : [...cur, i]));
  };
  const msg = sel.length === 2 ? checkPair(sel[0], sel[1]) : null;

  // where each element sits as the top Δ turns into the star (s: 0 → 1)
  const seg: Record<Key, [Pt, Pt]> = {
    ac: [lerpPt(P.a, P.n, s), P.c],
    ad: [lerpPt(P.a, P.n, s), P.d],
    cd: [lerpPt(P.c, P.a, s), lerpPt(P.d, P.n, s)],
    cb: [P.c, P.b],
    db: [P.d, P.b],
  };
  const postName: Partial<Record<Key, { sub: string; id: string; value: number }>> = {
    ac: { sub: '2', id: 'wye_r2', value: r.r2 },
    ad: { sub: '3', id: 'wye_r3', value: r.r3 },
    cd: { sub: '1', id: 'wye_r1', value: r.r1 },
  };

  const topLit = on.has('bridge_top_delta') || step === 1;
  const leftLit = on.has('bridge_series_left') || step >= 3;
  const rightLit = on.has('bridge_series_right') || step >= 3;
  const nodeLit = (n: Node | 'n') => on.has(n === 'n' ? 'node_n' : `term_${n}`);

  return (
    <div className="br-layer">
      <div className="yd-controls">
        <button className="br-cta" onClick={transform} disabled={playing}>
          {step >= 2 ? '还原电桥原图' : '一键将顶部 Δ 变形为 Y'}
        </button>
        <div className="yd-seg" role="radiogroup" aria-label="拓扑预设">
          {PRESETS.map((p) => (
            <button
              key={p.v}
              role="radio"
              aria-checked={preset === p.v}
              className={preset === p.v ? 'on' : ''}
              onClick={() => {
                setPreset(p.v);
                setParams({ b_quiz: false });
                setSel([]);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <ol className="br-stepper" aria-label="分步化简">
        {STEPS.map((label, i) => (
          <li key={i}>
            <button
              className={i === step ? 'on' : i < step ? 'done' : ''}
              aria-current={i === step ? 'step' : undefined}
              onClick={() => {
                timers.current.forEach(clearTimeout);
                setPlaying(false);
                setSel([]);
                setStep(i);
              }}
            >
              <span className="n">{i}</span> <Subbed text={label} />
            </button>
          </li>
        ))}
      </ol>

      <svg viewBox="0 0 360 300" className="yd-svg br-svg" role="img" aria-label={`电桥，第 ${step} 步，R_ab = ${fmt(r.rab)} Ω`}>
        <rect x="2" y="2" width="356" height="296" rx="12" className="yd-bg" />

        {/* series-branch backdrops (after the transform) */}
        {post && (
          <>
            <path
              d={`M ${P.n[0]} ${P.n[1]} L ${P.c[0]} ${P.c[1]} L ${P.b[0]} ${P.b[1]}`}
              className={`br-branch left ${leftLit ? 'on' : ''}`}
              {...hoverProps(['bridge_series_left'])}
            />
            <path
              d={`M ${P.n[0]} ${P.n[1]} L ${P.d[0]} ${P.d[1]} L ${P.b[0]} ${P.b[1]}`}
              className={`br-branch right ${rightLit ? 'on' : ''}`}
              {...hoverProps(['bridge_series_right'])}
            />
          </>
        )}

        {/* the top Δ outline */}
        {(topLit || (step === 2 && s < 1)) && (
          <polygon
            points={[P.a, P.c, P.d].map((p) => p.join(',')).join(' ')}
            className={`br-top ${playing && step === 1 ? 'pulse' : ''} ${on.has('bridge_top_delta') ? 'lit' : ''}`}
            transform="translate(180 113) scale(1.08) translate(-180 -113)"
            {...hoverProps(['bridge_top_delta'])}
          />
        )}

        {/* port leads */}
        <line x1={P.a[0]} y1={P.a[1]} x2={P.a[0]} y2={16} className="yd-wire plain" />
        <line x1={P.b[0]} y1={P.b[1]} x2={P.b[0]} y2={286} className="yd-wire plain" />

        {/* wires */}
        {RES.map((e) => {
          const [p, q] = seg[e.key];
          const top = e.key === 'ac' || e.key === 'ad' || e.key === 'cd';
          const cls = top ? (post ? 'wye' : e.key === 'cd' ? 'mid' : 'delta') : 'plain';
          return <line key={e.key} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} className={`yd-wire ${cls}`} />;
        })}

        {/* resistor boxes */}
        {RES.map((e, i) => {
          const [p, q] = seg[e.key];
          const pn = postName[e.key];
          const showPost = post && pn;
          const id = showPost ? pn.id : e.id;
          const isLit = on.has(id);
          const tone = showPost ? 'wye' : e.key === 'cd' ? 'mid' : e.key === 'ac' || e.key === 'ad' ? 'delta' : 'plain';
          const fade = pn ? Math.abs(s - 0.5) * 2 : 1; // names cross-fade half way through the morph
          return (
            <Res
              key={e.key}
              at={mid(p, q)}
              sub={showPost ? pn.sub : e.sub}
              value={`${showPost ? shown(pn.value, hideY) : fmt(v[e.key])}Ω`}
              tone={tone}
              lit={isLit}
              selected={sel.includes(i)}
              opacity={0.25 + 0.75 * fade}
              width={66}
              hover={[id]}
              onClick={step < 2 ? () => pick(i) : undefined}
              label={step < 2 ? `R_${e.sub}，点选做串并联检验` : undefined}
            />
          );
        })}

        {/* node n */}
        {s > 0.01 && (
          <g opacity={s} {...hoverProps(['node_n'])}>
            <circle cx={P.n[0]} cy={P.n[1]} r={nodeLit('n') ? 9 : 0} className="yd-node-glow n" />
            <circle cx={P.n[0]} cy={P.n[1]} r={5} className={`yd-node n ${nodeLit('n') ? 'lit' : ''}`} />
            <text x={P.n[0] + 10} y={P.n[1] + 4} className="yd-node-label n">
              n
            </text>
          </g>
        )}

        {/* nodes a, b, c, d */}
        {(['a', 'b', 'c', 'd'] as Node[]).map((n) => {
          const pos = P[n];
          const port = n === 'a' || n === 'b';
          const lp: Pt = n === 'a' ? [pos[0] + 12, pos[1] - 8] : n === 'b' ? [pos[0] + 12, pos[1] + 16] : n === 'c' ? [pos[0] - 8, pos[1] - 12] : [pos[0] + 8, pos[1] - 12];
          return (
            <g key={n} {...hoverProps([`term_${n}`])}>
              <circle cx={pos[0]} cy={pos[1]} r={nodeLit(n) ? 12 : 0} className="yd-node-glow port" />
              <circle cx={pos[0]} cy={pos[1]} r={port ? 6 : 5.5} className={`yd-node ${port ? 'port' : 'inner'} ${nodeLit(n) ? 'lit' : ''}`} />
              <text x={lp[0]} y={lp[1]} textAnchor={n === 'c' ? 'end' : 'start'} className={`yd-node-label ${port ? 'port' : 'inner'}`}>
                {n}
              </text>
              {step === 0 && (
                <text x={port ? pos[0] - 12 : pos[0]} y={n === 'a' ? pos[1] - 8 : n === 'b' ? pos[1] + 16 : pos[1] + 30} textAnchor={port ? 'end' : 'middle'} className="br-degree">
                  度数 3
                </text>
              )}
            </g>
          );
        })}

        {/* labels of the later steps */}
        {step >= 3 && s > 0.9 && (
          <g className="br-tag">
            <rect x="212" y="8" width="136" height="20" rx="10" />
            <text x="280" y="22" textAnchor="middle">
              已退化为普通串并联！
            </text>
          </g>
        )}
        {step >= 3 && s > 0.9 && (
          <>
            <text x="34" y="226" className="br-sum left">
              <RName sub="2" /> + <RName sub="cb" /> = {fmt(r.left)}Ω
            </text>
            <text x="326" y="226" textAnchor="end" className="br-sum right">
              <RName sub="3" /> + <RName sub="db" /> = {fmt(r.right)}Ω
            </text>
          </>
        )}
        {step >= 4 && s > 0.9 && (
          <text x="180" y="178" textAnchor="middle" className="br-par">
            {fmt(r.left)} ∥ {fmt(r.right)} = {shown(r.parallel, hideAB)}Ω
          </text>
        )}
      </svg>

      <div className="br-status" role="status">
        {msg ? (
          <p className="br-check">
            <Subbed text={msg} />
          </p>
        ) : step === 0 ? (
          <p>原始 5 电阻电桥：四个节点的度数都是 3。点选任意两颗电阻，做一次「串联 / 并联检验」。</p>
        ) : step === 1 ? (
          <p>
            圈定顶部 Δ（a–c–d 三角）：
            <Tex tex={String.raw`R_{ac},\ R_{ad},\ R_{cd}`} />
            ，三臂之和 <Tex tex={String.raw`R_\Sigma = ${fmt(r.sum)}\,\Omega`} />
          </p>
        ) : step === 2 ? (
          <p>
            {hideY ? (
              <>
                <Tex tex={String.raw`R_1,\ R_2,\ R_3 = \ ?`} />
                （先在右侧引导例题里算出来）
              </>
            ) : (
              <Tex
                tex={String.raw`R_1 = \tfrac{${fmt(v.ac)}\times${fmt(v.ad)}}{${fmt(r.sum)}} = ${fmt(r.r1)},\ R_2 = \tfrac{${fmt(v.ac)}\times${fmt(v.cd)}}{${fmt(r.sum)}} = ${fmt(r.r2)},\ R_3 = \tfrac{${fmt(v.ad)}\times${fmt(v.cd)}}{${fmt(r.sum)}} = ${fmt(r.r3)}\ (\Omega)`}
              />
            )}
          </p>
        ) : step === 3 ? (
          <p>
            <Tex tex={String.raw`R_{\text{left}} = R_2 + R_{cb} = ${fmt(r.left)}\,\Omega,\quad R_{\text{right}} = R_3 + R_{db} = ${fmt(r.right)}\,\Omega`} />
          </p>
        ) : (
          <p className="br-result">
            <Tex
              tex={String.raw`R_{ab} = R_1 + (R_{\text{left}} \parallel R_{\text{right}}) = ${fmt(r.r1)} + ${shown(r.parallel, hideAB)} = \mathbf{${shown(r.rab, hideAB)}\,\Omega}`}
            />
          </p>
        )}
      </div>

      {preset === 'custom' && (
        <div className="yd-sliders br-sliders">
          {RES.map((e) => (
            <label key={e.key} className="yd-slider">
              <span>
                R<sub>{e.sub}</sub>
              </span>
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={custom[e.key]}
                onChange={(ev) => setParams({ [`b_${e.key}`]: Number(ev.target.value) })}
                aria-valuetext={`${custom[e.key]} Ω`}
              />
              <b>{fmt(custom[e.key])} Ω</b>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
