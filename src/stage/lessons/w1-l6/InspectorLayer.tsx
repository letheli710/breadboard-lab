// Layer "02 单回路 KVL 顺时针巡检台" (Sadiku's sign rule, series and parallel sources).
// Single loop: the probe walks the loop clockwise or counter-clockwise; at each element the sign
// it meets first flashes and the signed term flies into the equation tray below. [⇄] flips an
// element's polarity marking (a source is turned round; a resistor's v label is re-drawn) and the
// equation follows. Source bench: three sources in series between a and b (V_ab = V1 + V2 − V3,
// each one can be turned round) and the forbidden test: closing a 9 V source onto a 5 V one.

import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useLit, useStage } from '../../stageStore';
import { Tex } from '../../StageText';
import { ELEMS, fmt, kvlTerms, PATH, SERIES, seriesVab, solve, texNum, type Dir, type ElemId, type NodeId, type Term } from './model';
import { DEFAULTS, hoverProps, readL6, useCircuit, useL6 } from './params';
import { Lbl } from './Lbl';
import './w1-l6.css';

const NODE_XY: Record<NodeId, [number, number]> = { D: [110, 188], A: [110, 44], B: [430, 44], C: [430, 188] };
const ELEM_ID: Record<ElemId, string> = { v1: 'elem_v1', r1: 'elem_r1', v2: 'elem_v2', r2: 'elem_r2' };
const TERM_ID: Record<ElemId, string> = { v1: 'eq_term_v1', r1: 'eq_term_r1', v2: 'eq_term_v2', r2: 'eq_term_r2' };
/** where each element's two terminal signs sit: [at its clockwise "from" end, at its "to" end] */
const SIGN_XY: Record<ElemId, [[number, number], [number, number]]> = {
  v1: [
    [110, 126],
    [110, 102],
  ],
  r1: [
    [212, 62],
    [328, 62],
  ],
  v2: [
    [430, 102],
    [430, 126],
  ],
  r2: [
    [328, 166],
    [212, 166],
  ],
};

function zigzag(x0: number, x1: number, y: number) {
  const n = 6;
  const w = (x1 - x0) / n;
  let d = `M ${x0} ${y}`;
  for (let k = 0; k < n; k++) d += ` L ${x0 + w * (k + 0.5)} ${y + (k % 2 ? 10 : -10)}`;
  return `${d} L ${x1} ${y}`;
}

const termTex = (t: Term, first: boolean) => `${t.sign < 0 ? '-' : first ? '' : '+'}${t.sym}`;
const eqTex = (ts: Term[]) => ts.map((t, k) => termTex(t, k === 0)).join(' ');

function FlipButton({ x, y, label, onClick }: { x: number; y: number; label: string; onClick: () => void }) {
  return (
    <g
      className="l6-flip"
      role="button"
      tabIndex={0}
      aria-label={`翻转 ${label} 的极性`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <circle cx={x} cy={y} r="14" />
      <text x={x} y={y + 5} textAnchor="middle">
        ⇄
      </text>
    </g>
  );
}

function LoopBench() {
  const c = useCircuit();
  const s = solve(c);
  const [dir, setDir] = useL6('l6_dir');
  const [walk, setWalk] = useL6('l6_walk');
  const [nums, setNums] = useL6('l6_nums');
  const [flip, setFlip] = useL6('l6_flip');
  const [auto, setAuto] = useState(false);
  const lit = useLit();
  const still = prefersReducedMotion();
  const on = (id: string) => lit.includes(id);

  useEffect(() => {
    if (!auto) return;
    if (readL6('l6_walk') >= 4) useStage.getState().setParams({ l6_walk: 0 });
    const t = setInterval(
      () => {
        const k = readL6('l6_walk');
        if (k >= 4) setAuto(false);
        else useStage.getState().setParams({ l6_walk: k + 1 });
      },
      still ? 450 : 1000,
    );
    return () => clearInterval(t);
  }, [auto, still]);

  const terms = kvlTerms(c, dir);
  const cw = kvlTerms(c, 'cw');
  const path = dir === 'cw' ? PATH : (['D', 'C', 'B', 'A', 'D'] as NodeId[]);
  const [px, py] = NODE_XY[path[walk]];
  const crossed = new Set(terms.slice(0, walk).map((t) => t.elem));
  const latest = walk > 0 ? terms[walk - 1].elem : null;
  const trail = path
    .slice(0, walk + 1)
    .map((n, k) => `${k ? 'L' : 'M'} ${NODE_XY[n][0]} ${NODE_XY[n][1]}`)
    .join(' ');

  const pickDir = (d: Dir) => {
    setDir(d);
    useStage.getState().setParams({ l6_walk: 0 });
    setAuto(true);
  };
  const toggle = (id: ElemId) => setFlip({ ...flip, [id]: !flip[id] });

  /** the element's two signs: [at "from", at "to"] */
  const signs = (id: ElemId): [string, string] => (s.plusAtEnd[id] ? ['−', '+'] : ['+', '−']);
  /** index (0 = "from") of the sign met first walking in `dir` */
  const firstEnd = dir === 'cw' ? 0 : 1;

  const label = (id: ElemId) => {
    const e = ELEMS.find((x) => x.id === id)!;
    if (e.source) return nums ? `${e.name} = ${fmt(id === 'v1' ? c.V1 : c.V2)} V` : e.name;
    const v = id === 'r1' ? 'v₁' : 'v₂';
    return nums ? `${e.name} = ${fmt(id === 'r1' ? c.R1 : c.R2)} Ω · ${v} = ${fmt(s.v[id])} V` : `${e.name} · 标注 ${v}`;
  };

  const numTex =
    terms
      .map((t, k) => {
        const mag = texNum(s.v[t.elem]);
        return `${t.sign < 0 ? '-' : k === 0 ? '' : '+'}${t.sign < 0 || k > 0 ? ' ' : ''}${mag}`;
      })
      .join(' ') + ' = 0';

  return (
    <>
      <div className="l6-controls" role="group" aria-label="巡检方向">
        <span className="l6-seg" role="radiogroup" aria-label="巡检方向">
          <button role="radio" aria-checked={dir === 'cw'} className={dir === 'cw' ? 'on' : ''} onClick={() => pickDir('cw')}>
            <Lbl long="↻ 顺时针 CW" short="↻ CW" />
          </button>
          <button role="radio" aria-checked={dir === 'ccw'} className={dir === 'ccw' ? 'on' : ''} onClick={() => pickDir('ccw')}>
            <Lbl long="↺ 逆时针 CCW" short="↺ CCW" />
          </button>
        </span>
        <button className="l6-btn" onClick={() => setWalk(Math.max(0, walk - 1))} disabled={walk === 0}>
          ◀
        </button>
        <button className="l6-btn primary" onClick={() => setWalk(Math.min(4, walk + 1))} disabled={walk === 4}>
          <Lbl long="下一个元件 ▶" short="▶" />
        </button>
        <button className={`l6-btn ${auto ? 'on' : ''}`} onClick={() => setAuto((a) => !a)} aria-pressed={auto}>
          {auto ? '暂停' : <Lbl long="巡检一圈" short="巡检" />}
        </button>
        <button
          className="l6-btn"
          onClick={() => {
            setAuto(false);
            useStage.getState().setParams({ l6_walk: 0, l6_flip: DEFAULTS.l6_flip });
          }}
        >
          <Lbl long="↺ 复位" short="↺" />
        </button>
        <label className="l6-check">
          <input type="checkbox" checked={nums} onChange={(e) => setNums(e.target.checked)} />
          <Lbl long="显示数值" short="数值" />
        </label>
      </div>

      <svg
        viewBox="0 0 540 232"
        className={`l6-svg inspector ${still ? 'still' : ''}`}
        role="img"
        aria-label={`单回路 KVL 巡检：${dir === 'cw' ? '顺时针' : '逆时针'}，已跨过 ${walk} 个元件`}
      >
        <rect x="2" y="2" width="536" height="228" rx="12" className="l6-bg" />
        <g className="l6-wires">
          <path d="M 110 188 L 110 140 M 110 92 L 110 44 L 230 44 M 310 44 L 430 44 L 430 92 M 430 140 L 430 188 L 310 188 M 230 188 L 110 188" />
        </g>
        <path d="M 110 188 L 110 44 L 430 44 L 430 188 Z" className={`l6-loop ${on('kvl_probe_path') ? 'lit' : ''}`} {...hoverProps('kvl_probe_path')} />
        {walk > 0 && <path d={trail} className="l6-trail" />}

        {ELEMS.map((e) => {
          const id = e.id;
          const sg = signs(id);
          const isLit = on(ELEM_ID[id]) || on(TERM_ID[id]);
          const termLit = on(TERM_ID[id]);
          return (
            <g key={id} className={`l6-elem ${id} ${isLit ? 'lit' : ''} ${crossed.has(id) ? 'crossed' : ''}`} {...hoverProps(ELEM_ID[id])}>
              {id === 'v1' || id === 'v2' ? (
                <circle cx={id === 'v1' ? 110 : 430} cy="116" r="24" className="l6-src" />
              ) : (
                <>
                  <rect x="222" y={id === 'r1' ? 20 : 164} width="96" height="48" rx="8" className="l6-hl" />
                  <path d={zigzag(230, 310, id === 'r1' ? 44 : 188)} className="l6-res" />
                </>
              )}
              {[0, 1].map((k) => {
                const first = k === firstEnd;
                const flash = first && (latest === id || termLit);
                return (
                  <text
                    key={`${k}-${dir}-${latest === id ? walk : 0}-${termLit ? 1 : 0}`}
                    x={SIGN_XY[id][k][0]}
                    y={SIGN_XY[id][k][1] + 6}
                    textAnchor="middle"
                    className={`l6-sign ${e.source ? 'in' : ''} ${first && crossed.has(id) ? 'first' : ''} ${flash ? 'flash' : ''}`}
                    style={{ transformOrigin: `${SIGN_XY[id][k][0]}px ${SIGN_XY[id][k][1]}px` }}
                  >
                    {sg[k]}
                  </text>
                );
              })}
              {id === 'v1' && (
                <text x="146" y="121" className="l6-name">
                  {label(id)}
                </text>
              )}
              {id === 'v2' && (
                <text x="394" y="121" textAnchor="end" className="l6-name">
                  {label(id)}
                </text>
              )}
              {id === 'r1' && (
                <text x="270" y="14" textAnchor="middle" className="l6-name small">
                  {label(id)}
                </text>
              )}
              {id === 'r2' && (
                <text x="270" y="224" textAnchor="middle" className="l6-name small">
                  {label(id)}
                </text>
              )}
            </g>
          );
        })}
        <FlipButton x={58} y={116} label="V₁" onClick={() => toggle('v1')} />
        <FlipButton x={482} y={116} label="V₂" onClick={() => toggle('v2')} />
        <FlipButton x={372} y={22} label="R₁ 的 v₁ 标注" onClick={() => toggle('r1')} />
        <FlipButton x={372} y={210} label="R₂ 的 v₂ 标注" onClick={() => toggle('r2')} />
        {(['A', 'B', 'C', 'D'] as NodeId[]).map((n) => (
          <g key={n} className="l6-node plain">
            <circle cx={NODE_XY[n][0]} cy={NODE_XY[n][1]} r="4" />
            <text
              x={NODE_XY[n][0] + (n === 'A' || n === 'D' ? -10 : 10)}
              y={NODE_XY[n][1] + (n === 'A' || n === 'B' ? -6 : 16)}
              textAnchor={n === 'A' || n === 'D' ? 'end' : 'start'}
              className="l6-node-name"
            >
              {n}
            </text>
          </g>
        ))}
        <text x="270" y="110" textAnchor="middle" className="l6-dir">
          {dir === 'cw' ? '↻ 顺时针巡检' : '↺ 逆时针巡检'}
        </text>
        <text x="270" y="130" textAnchor="middle" className="l6-dir-sub">
          先碰到的符号就写什么号
        </text>
        <circle r="7" className="l6-probe" style={{ transform: `translate(${px}px, ${py}px)` }} />
      </svg>

      <div className="l6-tray" aria-live="polite">
        <div className="l6-tray-title">KVL 方程拼装槽 · {dir === 'cw' ? '顺时针' : '逆时针'}（从 D 出发）</div>
        <div className="l6-tray-eq">
          {terms.map((t, k) =>
            k < walk ? (
              <span
                key={`${dir}-${t.elem}-${t.sign}`}
                className={`l6-chip ${t.elem} ${on(TERM_ID[t.elem]) ? 'lit' : ''}`}
                tabIndex={0}
                {...hoverProps(TERM_ID[t.elem])}
                onFocus={() => useStage.getState().setHover([TERM_ID[t.elem]])}
                onBlur={() => useStage.getState().setHover(null)}
              >
                <Tex tex={termTex(t, false)} />
              </span>
            ) : (
              <span key={`slot-${k}`} className="l6-chip slot" aria-hidden>
                ?
              </span>
            ),
          )}
          <span className="l6-eq0">= 0</span>
        </div>
        {walk === 4 && (
          <div className="l6-tray-lines">
            {dir === 'ccw' && (
              <div>
                <Tex tex={String.raw`${eqTex(terms)} = 0 \iff -\left(${eqTex(cw)}\right) = 0`} />
                <span className="l6-note">逆时针方程 = 顺时针方程 × (−1)</span>
              </div>
            )}
            {nums && (
              <div>
                <Tex tex={numTex} />
                <span className="l6-note">i = {fmt(s.i, 2)} A（顺时针）</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function SourceBench() {
  const [up, setUp] = useL6('l6_sup');
  const [par, setPar] = useL6('l6_par');
  const [parv, setParv] = useL6('l6_parv');
  const lit = useLit();
  const on = (id: string) => lit.includes(id);
  const vab = seriesVab(up);
  const names = ['V_1', 'V_2', 'V_3'];
  const ys = [70, 128, 186];
  const clash = par && parv !== 9;
  // KVL around b → sources → a → port → b, written in the sheet's order (V1, V2, V3, V_ab)
  const kvl = names.map((n, k) => `${up[k] ? '-' : '+'} ${n}`).join(' ') + ' + V_{ab} = 0';
  const sum = names.map((n, k) => `${up[k] ? (k ? '+' : '') : '-'} ${n}`).join(' ');
  const sumNum = SERIES.map((V, k) => `${up[k] ? (k ? '+' : '') : '-'} ${V}`).join(' ');

  return (
    <>
      <div className="l6-controls">
        <button className={`l6-btn danger ${par ? 'on' : ''}`} onClick={() => setPar(!par)} aria-pressed={par} {...hoverProps('group_illegal_par')}>
          {par ? '断开并联开关' : `尝试并联 9V 与 ${parv}V 电源`}
        </button>
        <span className="l6-seg" role="radiogroup" aria-label="第二个电源">
          <span className="l6-seg-lbl">第二个电源</span>
          {[5, 9].map((v) => (
            <button key={v} role="radio" aria-checked={parv === v} className={parv === v ? 'on' : ''} onClick={() => setParv(v)}>
              {v} V
            </button>
          ))}
        </span>
        <button className="l6-btn" onClick={() => useStage.getState().setParams({ l6_sup: DEFAULTS.l6_sup, l6_par: false, l6_parv: 5 })}>
          ↺ 复位
        </button>
      </div>
      <svg
        viewBox="0 0 540 256"
        className={`l6-svg sources ${clash ? 'clash' : ''}`}
        role="img"
        aria-label={`串联电压源 Vab = ${vab} V；并联测试${par ? '开关已合上' : '开关断开'}`}
      >
        <rect x="2" y="2" width="536" height="252" rx="12" className="l6-bg" />
        <text x="134" y="22" textAnchor="middle" className="l6-panel-title ok">
          允许：串联代数叠加
        </text>
        <g className={`l6-series ${on('group_series_v') ? 'lit' : ''}`} {...hoverProps('group_series_v')}>
          <rect x="22" y="38" width="126" height="180" rx="10" className="l6-group" />
          <g className="l6-wires">
            <path d="M 80 50 L 80 34 L 210 34 M 80 90 L 80 108 M 80 148 L 80 166 M 80 206 L 80 226 L 210 226" />
          </g>
          {ys.map((y, k) => (
            <g key={k} className={`l6-elem ${up[k] ? 'src-up' : 'src-down'}`}>
              <circle cx="80" cy={y} r="20" className="l6-src" />
              <text x="80" y={y - 4} textAnchor="middle" className="l6-sign in small">
                {up[k] ? '+' : '−'}
              </text>
              <text x="80" y={y + 15} textAnchor="middle" className="l6-sign in small">
                {up[k] ? '−' : '+'}
              </text>
              <text x="52" y={y - 2} textAnchor="end" className="l6-name small">
                V{'₁₂₃'[k]}
              </text>
              <text x="52" y={y + 13} textAnchor="end" className="l6-val">
                {SERIES[k]} V
              </text>
            </g>
          ))}
        </g>
        {ys.map((y, k) => (
          <FlipButton key={k} x={124} y={y} label={`V${'₁₂₃'[k]}`} onClick={() => setUp(up.map((u, j) => (j === k ? !u : u)))} />
        ))}
        <g className="l6-port">
          <circle cx="210" cy="34" r="4.5" />
          <circle cx="210" cy="226" r="4.5" />
          <text x="222" y="39">
            a (+)
          </text>
          <text x="222" y="231">
            b (−)
          </text>
          <line x1="210" y1="46" x2="210" y2="214" />
          <text x="218" y="124" className="l6-vab">
            V
            <tspan dy="4" fontSize="0.75em">
              ab
            </tspan>
          </text>
          <text x="218" y="142" className="l6-vab">
            = {vab} V
          </text>
        </g>

        <line x1="276" y1="30" x2="276" y2="236" className="l6-divider" />
        <text x="410" y="22" textAnchor="middle" className="l6-panel-title bad">
          严禁：不同电压源并联
        </text>
        <g className={`l6-par ${on('group_illegal_par') ? 'lit' : ''} ${clash ? 'alarm' : ''}`} {...hoverProps('group_illegal_par')}>
          <path d="M 330 104 L 330 52 L 396 52 M 424 52 L 490 52 L 490 104 M 490 152 L 490 204 L 330 204 L 330 152" className="l6-par-wire" />
          <line x1="396" y1="52" x2={par ? 424 : 420} y2={par ? 52 : 32} className="l6-switch" />
          <circle cx="396" cy="52" r="3.5" className="l6-switch-dot" />
          <circle cx="424" cy="52" r="3.5" className="l6-switch-dot" />
          <text x="410" y="74" textAnchor="middle" className="l6-val">
            {par ? '开关已合上' : '开关断开'}
          </text>
          {[330, 490].map((x, k) => (
            <g key={x}>
              <circle cx={x} cy="128" r="22" className="l6-src" />
              <text x={x} y="124" textAnchor="middle" className="l6-sign in small">
                +
              </text>
              <text x={x} y="143" textAnchor="middle" className="l6-sign in small">
                −
              </text>
              <text x={k ? x - 30 : x + 30} y="133" textAnchor={k ? 'end' : 'start'} className="l6-name">
                {k ? parv : 9} V
              </text>
            </g>
          ))}
          {par && (
            <text x="410" y="230" textAnchor="middle" className={`l6-par-kvl ${clash ? 'bad' : 'ok'}`}>
              {clash ? `KVL: −9 + ${parv} = ${parv - 9} ≠ 0` : 'KVL: −9 + 9 = 0'}
            </text>
          )}
        </g>
      </svg>
      <div className="l6-tray">
        <div className="l6-tray-title">串联等效合并（顺时针：b → 电源 → a → 端口 → b）</div>
        <div className="l6-tray-lines">
          <div>
            <Tex tex={kvl} />
          </div>
          <div>
            <Tex tex={String.raw`V_{ab} = ${sum} = ${sumNum} = ${vab}\text{ V}`} />
          </div>
        </div>
        {par &&
          (clash ? (
            <div className="l6-alarm" role="alert">
              <b>
                <Tex tex={String.raw`-9\text{ V} + ${parv}\text{ V} = ${parv - 9}\text{ V} \neq 0`} />
              </b>
              <span>
                理论环流 <Tex tex={String.raw`i \to \infty`} /> · 禁止并联不同电压源！
              </span>
            </div>
          ) : (
            <div className="l6-ok" role="status">
              <Tex tex={String.raw`-9\text{ V} + 9\text{ V} = 0`} /> 电压值完全相等、极性相同，才允许并联。
            </div>
          ))}
      </div>
    </>
  );
}

export default function InspectorLayer() {
  const [mode, setMode] = useL6('l6_mode');
  useEffect(() => () => useStage.getState().setHover(null), []);
  return (
    <div className="l6-layer">
      <div className="l6-tabs" role="tablist" aria-label="巡检台">
        <button role="tab" aria-selected={mode === 'loop'} className={mode === 'loop' ? 'on' : ''} onClick={() => setMode('loop')}>
          单回路巡检
        </button>
        <button role="tab" aria-selected={mode === 'sources'} className={mode === 'sources' ? 'on' : ''} onClick={() => setMode('sources')}>
          电源串联 / 违禁并联
        </button>
      </div>
      {mode === 'loop' ? <LoopBench /> : <SourceBench />}
    </div>
  );
}
