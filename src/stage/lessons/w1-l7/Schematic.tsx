// Layer "01 2D 动态分压/分流原理图": the circuit of the chosen topology as a live schematic —
// wires coloured by node potential (Vs warm red, the divider node amber by its share, GND cool
// blue), moving dots whose speed follows each branch current, value floats next to every
// resistor, and the ×1000 scaling tag whose pop-up compares the textbook values (Ω) with the
// breadboard values (kΩ). Every part is a stage object (hover ↔ the text terms).

import { useState } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useLit } from '../../stageStore';
import { Controls, hoverProps, ScaleNotice, useCircuit, useClearHoverOnUnmount, type Circuit } from './circuit';
import { fmtI, fmtP, fmtR, fmtV, heatOf, isDivider, P_MAX, potentialColor, solve, type Part, type Solution } from './model';

/* ------------------------------------------------------------- drawing helpers */

type P = [number, number];

/** Zig-zag resistor body from a to b. */
function zigPoints(a: P, b: P, n = 6, amp = 9): string {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const pts: string[] = [`${x1},${y1}`];
  for (let k = 0; k < n; k++) {
    const t = ((k + 0.5) / n) * len;
    const s = k % 2 === 0 ? amp : -amp;
    pts.push(`${(x1 + ux * t - uy * s).toFixed(1)},${(y1 + uy * t + ux * s).toFixed(1)}`);
  }
  pts.push(`${x2},${y2}`);
  return pts.join(' ');
}

const pathOf = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ');

/** dot speed in px/s for a current in A: ∝ I (14 px/s per mA), clamped */
const speedOf = (a: number) => Math.min(240, Math.max(4, 14 * a * 1e3));

function Flow({ pts, amps, id }: { pts: P[]; amps: number; id?: string }) {
  if (prefersReducedMotion() || amps <= 0) return null;
  const dur = 16 / speedOf(amps);
  return <path d={pathOf(pts)} className={`l7-flow ${amps > 0.2 ? 'hot' : ''}`} style={{ animationDuration: `${dur.toFixed(2)}s` }} data-hl={id} />;
}

interface ResProps {
  part: Part;
  a: P;
  b: P;
  svgId: string;
  lit: string[];
  label: string;
  float: string;
  /** where the labels go, relative to the body's middle */
  side: 'left' | 'right' | 'above';
}

function Resistor({ part, a, b, svgId, lit, label, float, side }: ResProps) {
  const on = lit.includes(part.id);
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const heat = heatOf(part.p);
  const [tx, ty, anchor] = side === 'left' ? [mx - 28, my - 6, 'end'] : side === 'right' ? [mx + 18, my - 6, 'start'] : [mx, my - 22, 'middle'];
  const fy = side === 'above' ? my + 30 : ty + 17;
  return (
    <g id={svgId} data-hl={part.id} className={`l7-part ${on ? 'lit' : ''} heat-${heat}`} {...hoverProps([part.id])}>
      <polyline points={zigPoints(a, b)} className="zig-hit" />
      <polyline points={zigPoints(a, b)} className="zig" />
      <text x={tx} y={ty} textAnchor={anchor} className="l7-rlabel">
        {label}
      </text>
      <text x={tx} y={fy} textAnchor={anchor} className="l7-float">
        {float.split('\n').map((line, i) => (
          <tspan key={i} x={tx} dy={i ? 15 : 0}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function Wire({ pts, color }: { pts: P[]; color: string }) {
  return <path d={pathOf(pts)} className="l7-wire" style={{ stroke: color }} />;
}

function NodeDot({
  at,
  id,
  lit,
  label,
  color,
  dx = 8,
  dy = -8,
  anchor = 'start',
}: {
  at: P;
  id?: string;
  lit: string[];
  label: string;
  color: string;
  dx?: number;
  dy?: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  const on = !!id && lit.includes(id);
  return (
    <g className={`l7-node ${on ? 'lit' : ''}`} {...(id ? { id: 'svg_node_mid_dot', 'data-hl': id, ...hoverProps([id]) } : {})}>
      <circle cx={at[0]} cy={at[1]} r={on ? 7 : 5} style={{ fill: color }} />
      <text x={at[0] + dx} y={at[1] + dy} textAnchor={anchor} className="l7-nodelabel" style={{ fill: color }}>
        {label}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------- the schematic */

const TOP = 44;
const BOT = 262;
const SRC: P = [74, 150];

function Source({ s, lit }: { s: Solution; lit: string[] }) {
  const on = lit.includes('tok_vs');
  return (
    <g id="svg_vs_source" data-hl="tok_vs" className={`l7-src ${on ? 'lit' : ''}`} {...hoverProps(['tok_vs'])}>
      <circle cx={SRC[0]} cy={SRC[1]} r="24" />
      <text x={SRC[0]} y={SRC[1] - 6} textAnchor="middle" className="sign plus">
        +
      </text>
      <text x={SRC[0]} y={SRC[1] + 16} textAnchor="middle" className="sign">
        −
      </text>
      <text x={SRC[0] - 30} y={SRC[1] + 5} textAnchor="end" className="l7-vs">
        {s.vs} V
      </text>
    </g>
  );
}

function Ground({ x }: { x: number }) {
  return (
    <g className="l7-gnd">
      <line x1={x} y1={BOT} x2={x} y2={BOT + 10} />
      <line x1={x - 12} y1={BOT + 10} x2={x + 12} y2={BOT + 10} />
      <line x1={x - 7} y1={BOT + 15} x2={x + 7} y2={BOT + 15} />
      <line x1={x - 3} y1={BOT + 20} x2={x + 3} y2={BOT + 20} />
      <text x={x + 18} y={BOT + 19} className="l7-nodelabel gnd">
        GND 0 V
      </text>
    </g>
  );
}

function VArrow({ x, y1, y2, lit, label }: { x: number; y1: number; y2: number; lit: string[]; label: string }) {
  const on = lit.includes('tok_v2');
  return (
    <g id="svg_v2_arrow" data-hl="tok_v2" className={`l7-varrow ${on ? 'lit' : ''}`} {...hoverProps(['tok_v2'])}>
      <line x1={x} y1={y1 + 8} x2={x} y2={y2 - 8} />
      <path d={`M ${x - 4} ${y1 + 14} L ${x} ${y1 + 6} L ${x + 4} ${y1 + 14}`} />
      <text x={x} y={y1} textAnchor="middle" className="pm">
        +
      </text>
      <text x={x} y={y2 + 8} textAnchor="middle" className="pm">
        −
      </text>
      <text x={x - 8} y={(y1 + y2) / 2 + 30} textAnchor="end" className="l7-vlabel">
        {label}
      </text>
    </g>
  );
}

function DividerSchematic({ s, lit }: { s: Solution; lit: string[] }) {
  const loaded = s.topo !== 'series_vdiv';
  const x2 = loaded ? 350 : 400;
  const xl = 452;
  const [r1, r2, r3] = s.parts;
  const vcc = potentialColor(1);
  const mid = potentialColor(s.vmid / s.vs);
  const gnd = potentialColor(0);
  const R1A: P = [150, TOP];
  const R1B: P = [250, TOP];
  const k = (r: number) => fmtR(r);
  const mixed = s.topo === 'mixed_socratic';
  return (
    <>
      <Wire pts={[[SRC[0], SRC[1] - 24], [SRC[0], TOP], R1A]} color={vcc} />
      <Wire pts={[R1B, [loaded ? xl : x2, TOP]]} color={mid} />
      <Wire
        pts={[
          [x2, TOP],
          [x2, 92],
        ]}
        color={mid}
      />
      <Wire
        pts={[
          [x2, 200],
          [x2, BOT],
          [SRC[0], BOT],
          [SRC[0], SRC[1] + 24],
        ]}
        color={gnd}
      />
      {loaded && (
        <>
          <Wire
            pts={[
              [xl, TOP],
              [xl, 92],
            ]}
            color={mid}
          />
          <Wire
            pts={[
              [xl, 200],
              [xl, BOT],
              [x2, BOT],
            ]}
            color={gnd}
          />
          <rect x={x2 - 22} y={80} width={xl - x2 + 120} height={132} rx="8" className="l7-box" />
          <text x={xl + 8} y={226} className="l7-boxlabel">
            {mixed ? 'R2 || R3' : 'R2 || RL'} = {fmtR(1 / (1 / r2.ohms + 1 / r3.ohms))}
          </text>
        </>
      )}
      <Flow
        pts={[
          [SRC[0], SRC[1] - 24],
          [SRC[0], TOP],
          [x2, TOP],
        ]}
        amps={s.i}
        id="tok_i"
      />
      <Flow
        pts={[
          [x2, TOP],
          [x2, BOT],
        ]}
        amps={r2.i}
      />
      {loaded && (
        <Flow
          pts={[
            [x2, TOP],
            [xl, TOP],
            [xl, BOT],
            [x2, BOT],
          ]}
          amps={r3.i}
          id={mixed ? 'tok_io' : undefined}
        />
      )}
      <Flow
        pts={[
          [x2, BOT],
          [SRC[0], BOT],
          [SRC[0], SRC[1] + 24],
        ]}
        amps={s.i}
      />
      <Source s={s} lit={lit} />
      <Resistor part={r1} a={R1A} b={R1B} svgId="svg_resistor_r1" lit={lit} side="above" label={`R1 = ${k(r1.ohms)}`} float={`v1 = ${fmtI(s.i)} × ${k(r1.ohms)} = ${fmtV(r1.v)}`} />
      <Resistor
        part={r2}
        a={[x2, 92]}
        b={[x2, 200]}
        svgId="svg_resistor_r2"
        lit={lit}
        side="left"
        label={`R2 = ${k(r2.ohms)}`}
        float={loaded ? `i2 = ${fmtI(r2.i)}` : `v2 = ${k(r2.ohms)}/(${k(r1.ohms)}+${k(r2.ohms)}) × ${s.vs} V`}
      />
      {loaded && (
        <Resistor
          part={r3}
          a={[xl, 92]}
          b={[xl, 200]}
          svgId={mixed ? 'svg_resistor_r3' : 'svg_resistor_rl'}
          lit={lit}
          side="right"
          label={`${r3.name} = ${k(r3.ohms)}`}
          float={`${mixed ? 'i_o' : 'iL'} = ${fmtI(r3.i)}`}
        />
      )}
      <VArrow x={x2 - 14} y1={96} y2={196} lit={lit} label={`${loaded ? 'v_out' : 'v2'} = ${fmtV(s.vmid)}`} />
      <NodeDot at={[310, TOP]} id="tok_node_mid" lit={lit} color={mid} label={`${mixed ? 'Node A' : 'v_mid'} = ${fmtV(s.vmid)}`} dx={0} dy={-12} anchor="middle" />
      <NodeDot at={[SRC[0], TOP]} lit={lit} color={vcc} label={`VCC +${fmtV(s.vs)}`} dx={10} dy={-10} />
      <Ground x={(SRC[0] + x2) / 2} />
      <text x={(SRC[0] + x2) / 2 + 30} y={BOT - 8} textAnchor="middle" className="l7-ilabel">
        i = {fmtI(s.i)} → R_eq = {fmtR(s.req)}
      </text>
    </>
  );
}

function ParallelSchematic({ s, lit }: { s: Solution; lit: string[] }) {
  const three = s.parts.length === 3;
  const xs = three ? [210, 330, 450] : [260, 440];
  const vcc = potentialColor(1);
  const gnd = potentialColor(0);
  const last = xs[xs.length - 1];
  const svgIds = ['svg_resistor_r1', 'svg_resistor_r2', 'svg_resistor_r3'];
  const iName = ['i1', 'i2', 'i3'];
  const sumAfter = (k: number) => s.parts.slice(k).reduce((t, p) => t + p.i, 0);
  return (
    <>
      <Wire
        pts={[
          [SRC[0], SRC[1] - 24],
          [SRC[0], TOP],
          [last, TOP],
        ]}
        color={vcc}
      />
      <Wire
        pts={[
          [last, BOT],
          [SRC[0], BOT],
          [SRC[0], SRC[1] + 24],
        ]}
        color={gnd}
      />
      {xs.map((x) => (
        <g key={x}>
          <Wire
            pts={[
              [x, TOP],
              [x, 92],
            ]}
            color={vcc}
          />
          <Wire
            pts={[
              [x, 200],
              [x, BOT],
            ]}
            color={gnd}
          />
        </g>
      ))}
      <Flow
        pts={[
          [SRC[0], SRC[1] - 24],
          [SRC[0], TOP],
          [xs[0], TOP],
        ]}
        amps={s.i}
        id="tok_i"
      />
      {xs.map((x, k) => (
        <g key={x}>
          {k > 0 && (
            <Flow
              pts={[
                [xs[k - 1], TOP],
                [x, TOP],
              ]}
              amps={sumAfter(k)}
            />
          )}
          <Flow
            pts={[
              [x, TOP],
              [x, BOT],
            ]}
            amps={s.parts[k].i}
            id={k === 0 ? 'tok_i1' : undefined}
          />
          {k > 0 && (
            <Flow
              pts={[
                [x, BOT],
                [xs[k - 1], BOT],
              ]}
              amps={sumAfter(k)}
            />
          )}
        </g>
      ))}
      <Flow
        pts={[
          [xs[0], BOT],
          [SRC[0], BOT],
          [SRC[0], SRC[1] + 24],
        ]}
        amps={s.i}
      />
      {/* the branch-1 current arrow (tok_i1) */}
      <g id="svg_i1_flow_path" data-hl="tok_i1" className={`l7-iarrow ${lit.includes('tok_i1') ? 'lit' : ''}`} {...hoverProps(['tok_i1'])}>
        <line x1={xs[0]} y1={TOP + 8} x2={xs[0]} y2={84} className="hit" />
        <path d={`M ${xs[0] - 6} 64 L ${xs[0]} 76 L ${xs[0] + 6} 64 Z`} />
      </g>
      <Source s={s} lit={lit} />
      {s.parts.map((p, k) => (
        <Resistor
          key={p.id}
          part={p}
          a={[xs[k], 92]}
          b={[xs[k], 200]}
          svgId={svgIds[k]}
          lit={lit}
          side="right"
          label={`${p.name} = ${fmtR(p.ohms)}`}
          float={three ? `${iName[k]} = ${fmtI(p.i)}` : `${iName[k]} = ${s.vs} V/${fmtR(p.ohms)}\n= ${fmtI(p.i)}`}
        />
      ))}
      <NodeDot at={[xs[0], TOP]} id="tok_node_mid" lit={lit} color={vcc} label={`Node A +${fmtV(s.vs)}`} dx={8} dy={-10} anchor="start" />
      <Ground x={(SRC[0] + xs[0]) / 2 + 20} />
      <g className={`l7-ilabel-g ${lit.includes('tok_i') ? 'lit' : ''}`} {...hoverProps(['tok_i'])}>
        <text x={xs[0] - 16} y={TOP - 10} textAnchor="end" className="l7-ilabel">
          i = {fmtI(s.i)}
        </text>
      </g>
    </>
  );
}

/* ------------------------------------------------------------- the scaling pop-up */

function ScaleTag({ c, lit, open, onToggle }: { c: Circuit; lit: string[]; open: boolean; onToggle: () => void }) {
  const on = lit.includes('tok_safety_scale');
  const over = c.sol.parts.some((p) => p.p > P_MAX);
  return (
    <g
      id="svg_power_warning_tag"
      data-hl="tok_safety_scale"
      className={`l7-scaletag ${on ? 'lit' : ''} ${over ? 'bad' : ''}`}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
      {...hoverProps(['tok_safety_scale'])}
    >
      <rect x="404" y="2" width="170" height="28" rx="8" />
      <text x="489" y="20" textAnchor="middle">
        {over ? '功耗警报！点开对比' : c.scale === 'board' ? '×1000 安全缩放 · 点开对比' : '教材原值 · 点开对比'}
      </text>
    </g>
  );
}

function compareRows(c: Circuit) {
  const tb = solve(c.topo, c.vs, c.r1, c.r2, c.rl, c.r3, 'textbook');
  const bb = solve(c.topo, c.vs, c.r1, c.r2, c.rl, c.r3, 'board');
  const rows: [string, string, string][] = tb.parts.map((p, k) => [p.name, fmtR(p.ohms), fmtR(bb.parts[k].ohms)]);
  rows.push(['电源电流 i', fmtI(tb.i), fmtI(bb.i)]);
  tb.parts.forEach((p, k) => rows.push([`P_${p.name}`, fmtP(p.p), fmtP(bb.parts[k].p)]));
  const tot = (x: Solution) => x.parts.reduce((t, p) => t + p.p, 0);
  rows.push(['总功耗', fmtP(tot(tb)), fmtP(tot(bb))]);
  if (isDivider(c.topo)) rows.push(['分压节点电压', fmtV(tb.vmid), fmtV(bb.vmid)]);
  else rows.push(['分流比 i1 / i', (tb.parts[0].i / tb.i).toFixed(3), (bb.parts[0].i / bb.i).toFixed(3)]);
  const verdict = (x: Solution) => {
    const m = Math.max(...x.parts.map((p) => p.p));
    const who = x.parts.find((p) => p.p === m)!.name;
    return m > P_MAX
      ? `严重过载：${who} 功耗 ${fmtP(m)}，是 0.25 W 额定值的 ${(m / P_MAX).toFixed(1)} 倍，通电瞬间冒烟烧毁`
      : `安全：${who} 功耗 ${fmtP(m)}，仅为 0.25 W 额定值的 ${((m / P_MAX) * 100).toFixed(1)}%`;
  };
  return { rows, tb: verdict(tb), bb: verdict(bb) };
}

function ScalePopup({ c, onClose }: { c: Circuit; onClose: () => void }) {
  const { rows, tb, bb } = compareRows(c);
  return (
    <div className="l7-popup" role="dialog" aria-label="教材原值与面包板安全值的功耗对比" {...hoverProps(['tok_safety_scale'])}>
      <div className="l7-popup-head">
        <b>功耗警报对比：教材原值 (Ω) vs. 面包板安全值 (kΩ)</b>
        <button className="l7-x" onClick={onClose} aria-label="关闭">
          ×
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th scope="col" />
            <th scope="col" className="bad">
              教材原值 (Ω)
            </th>
            <th scope="col" className="good">
              面包板安全值 (kΩ)
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <th scope="row">{r[0]}</th>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="bad">{tb}</p>
      <p className="good">{bb}</p>
      <p className="muted">所有阻值同乘 k = 1000：分压比 / 分流比完全不变，电流与功耗同缩 1000 倍。</p>
    </div>
  );
}

/* ------------------------------------------------------------- readouts */

function Chip({ id, k, v, tone, core }: { id?: string; k: string; v: string; tone?: string; core?: boolean }) {
  const lit = useLit();
  return (
    <div className={`l7-chip ${tone ?? ''} ${core ? 'core' : ''} ${id && lit.includes(id) ? 'lit' : ''}`} {...(id ? hoverProps([id]) : {})}>
      <span>{k}</span>
      <b>{v}</b>
    </div>
  );
}

export function Readouts({ c }: { c: Circuit }) {
  const s = c.sol;
  const [r1, r2, r3] = s.parts;
  const chips: { id?: string; k: string; v: string; tone?: string; core?: boolean }[] = [{ id: 'tok_vs', k: 'Vs', v: fmtV(s.vs) }];
  if (s.topo === 'series_vdiv') {
    chips.push(
      { k: 'R_eq = R1 + R2', v: fmtR(s.req) },
      { id: 'tok_i', k: 'i = Vs / R_eq', v: fmtI(s.i), core: true },
      { id: 'tok_v1', k: 'v1', v: fmtV(r1.v), core: true },
      { id: 'tok_v2', k: 'v2', v: fmtV(r2.v), core: true },
    );
    chips.push({ k: 'KVL：v1 + v2', v: fmtV(r1.v + r2.v), tone: 'good' });
  } else if (s.topo === 'loaded_vdiv' || s.topo === 'mixed_socratic') {
    const mixed = s.topo === 'mixed_socratic';
    chips.push({ k: mixed ? 'R2 || R3' : 'R2 || RL', v: fmtR(s.req - r1.ohms) }, { k: 'R_eq', v: fmtR(s.req), core: mixed }, { id: 'tok_i', k: 'i', v: fmtI(s.i), core: mixed });
    chips.push({ id: mixed ? 'tok_node_mid' : 'tok_v2', k: mixed ? 'v_A' : 'v_out', v: fmtV(s.vmid), core: !mixed });
    if (mixed) chips.push({ id: 'tok_i2', k: 'i(R2)', v: fmtI(r2.i) }, { id: 'tok_io', k: 'i_o(R3)', v: fmtI(r3.i), core: true });
    else
      chips.push(
        { k: '空载 v2', v: fmtV(s.vNoLoad), core: true },
        { id: 'tok_rl', k: '跌落', v: `${(((s.vNoLoad - s.vmid) / s.vNoLoad) * 100).toFixed(1)}%`, tone: s.vmid < 0.95 * s.vNoLoad ? 'warn' : 'good', core: true },
      );
  } else {
    chips.push({ k: 'R_eq', v: fmtR(s.req) }, { id: 'tok_i', k: 'i', v: fmtI(s.i), core: true });
    s.parts.forEach((p, k) => chips.push({ id: k === 0 ? 'tok_i1' : k === 1 ? 'tok_i2' : undefined, k: `i${k + 1}`, v: fmtI(p.i), core: true }));
    chips.push({ k: `KCL：${s.parts.map((_, k) => `i${k + 1}`).join(' + ')}`, v: fmtI(s.parts.reduce((t, p) => t + p.i, 0)), tone: 'good' });
  }
  for (const p of s.parts) {
    const h = heatOf(p.p);
    chips.push({ id: 'tok_safety_scale', k: `P_${p.name}`, v: fmtP(p.p), tone: h === 'ok' ? '' : h === 'warm' ? 'warn' : 'bad', core: h !== 'ok' });
  }
  return (
    <div className="l7-readouts" aria-live="polite">
      {chips.map((x, i) => (
        <Chip key={i} {...x} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- the layer */

export default function Schematic() {
  const c = useCircuit();
  const lit = useLit();
  const [popup, setPopup] = useState(false);
  useClearHoverOnUnmount();
  const s = c.sol;
  const divider = isDivider(c.topo);
  return (
    <div className="l7-layer">
      <Controls c={c} />
      <div className="l7-sch-wrap">
        <svg
          viewBox="0 0 580 290"
          className="l7-sch"
          role="img"
          aria-label={`${divider ? '分压' : '分流'}原理图：Vs ${fmtV(s.vs)}，${s.parts.map((p) => `${p.name} ${fmtR(p.ohms)}`).join('，')}`}
        >
          {divider ? <DividerSchematic s={s} lit={lit} /> : <ParallelSchematic s={s} lit={lit} />}
          <ScaleTag c={c} lit={lit} open={popup} onToggle={() => setPopup((o) => !o)} />
        </svg>
        {popup && <ScalePopup c={c} onClose={() => setPopup(false)} />}
      </div>
      <Readouts c={c} />
      <ScaleNotice c={c} />
    </div>
  );
}
