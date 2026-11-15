// A figure inside a lesson card (core/figures.ts, CHALLENGE_FORMAT.md §16.3): a circuit drawing,
// a strip of breadboard or a plot, with its caption underneath. Loaded on demand (Cards.tsx): only
// units that have figures fetch this chunk.

import type { ReactNode } from 'react';
import { HOLE_MAP, MAIN_ROWS, RAIL_ROWS, type RowId } from '../core/breadboard';
import { figText, type BoardPart, type BreadboardFigure, type CardFigure, type FigText, type PlotFigure, type Tone } from '../core/figures';
import { getLang, tr } from '../core/i18n';
import { FigureFrame } from './FigureFrame';
import { ProblemSchematic, Rich } from './ProblemSchematic';
import { richRuns } from './richRuns';
import { Sym } from './richText';

const txt = (t: FigText | undefined) => figText(t, getLang());
const runs = (t: FigText | undefined) => richRuns(txt(t));

const TONE: Record<Tone, { fill: string; ink: string }> = {
  1: { fill: 'var(--accent)', ink: 'var(--accent-ink)' },
  2: { fill: '#f4a261', ink: '#9a4f12' },
  3: { fill: '#9b5de5', ink: '#6a35b0' },
};
const WIRE: Record<string, string> = {
  red: '#d62f3c',
  black: '#2f3138',
  green: '#2a9d5c',
  yellow: '#e0b100',
  blue: '#2b59c3',
  white: '#e9e5da',
  orange: '#ee7d2b',
};
const LED_DOME: Record<string, string> = {
  red: '#e8505b',
  green: '#3fb36b',
  yellow: '#f2c230',
  blue: '#4a86e0',
  white: '#f4f1e8',
  orange: '#f08a3c',
};

export default function CardFigureView({ fig }: { fig: CardFigure }) {
  const caption = txt(fig.caption);
  let body: ReactNode;
  if (fig.kind === 'schematic') body = <ProblemSchematic schematic={fig.schematic} highlight={fig.highlight} className="cf-schematic" />;
  else if (fig.kind === 'breadboard') body = <BoardFigure fig={fig} caption={caption} />;
  else body = <PlotView fig={fig} caption={caption} />;
  return (
    <figure className={`card-figure cf-${fig.kind}`} data-fig={fig.id}>
      {body}
      <figcaption>
        <Sym text={caption} />
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------- breadboard

const P = 22; // hole pitch, px
const HOLE = 7;

/** rough width of a label (CJK ≈ 1 em, others ≈ 0.6 em), to keep it inside the viewBox */
const estW = (t: string, size = 12) => [...t].reduce((w, ch) => w + (/[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? size : /[ .,:;!|]/.test(ch) ? size * 0.3 : size * 0.6), 0);

function BoardFigure({ fig, caption }: { fig: BreadboardFigure; caption: string }) {
  const [c0, c1] = fig.cols ?? [1, 12];
  const rowsShown = fig.rows ?? 'both';
  const railsShown = fig.rails ?? (rowsShown === 'top' ? 'top' : rowsShown === 'bottom' ? 'bottom' : 'both');
  const parts = fig.parts ?? [];
  const battery = parts.some((p) => p.type === 'battery');

  // vertical layout: row → y
  const Y = new Map<RowId, number>();
  let y = 30; // room for column numbers / labels above
  const take = (r: RowId, gap = 18) => {
    Y.set(r, y);
    y += gap;
  };
  if (railsShown === 'top' || railsShown === 'both') {
    take('tp');
    take('tn', 28);
  }
  if (rowsShown !== 'bottom') {
    for (const r of ['a', 'b', 'c', 'd'] as RowId[]) take(r);
    take('e', 30);
  }
  const gapY = y - 15;
  if (rowsShown !== 'top') {
    for (const r of ['f', 'g', 'h', 'i'] as RowId[]) take(r);
    take('j', 28);
  }
  if (railsShown === 'bottom' || railsShown === 'both') {
    take('bp');
    take('bn');
  }
  const left = battery ? 92 : 34;
  const X = (c: number) => left + (c - c0) * P;
  const right = X(c1) + 16;
  const bottom = y + 6;
  const pos = (id: string): [number, number] | null => {
    const h = HOLE_MAP.get(id);
    if (!h || h.col < c0 || h.col > c1) return null;
    const yy = Y.get(h.row);
    return yy === undefined ? null : [X(h.col), yy];
  };
  const shownRows = [...RAIL_ROWS, ...MAIN_ROWS].filter((r) => Y.has(r));
  const isRail = (r: RowId) => (RAIL_ROWS as readonly string[]).includes(r);

  // shaded groups
  const shades: ReactNode[] = [];
  for (const r of shownRows.filter(isRail)) {
    const yy = Y.get(r)!;
    shades.push(
      <rect key={`rail${r}`} x={X(c0) - 9} y={yy - 7} width={X(c1) - X(c0) + 18} height={14} rx={7} fill={r.endsWith('p') ? 'var(--plus)' : 'var(--minus)'} opacity={0.14} />,
    );
  }
  const labelsAbove: ReactNode[] = [];
  (fig.strips ?? []).forEach((s, i) => {
    const h = HOLE_MAP.get(s.at);
    if (!h) return;
    const tone = TONE[s.tone ?? 1];
    if (isRail(h.row)) {
      const yy = Y.get(h.row);
      if (yy === undefined) return;
      shades.push(<rect key={`s${i}`} x={X(c0) - 10} y={yy - 9} width={X(c1) - X(c0) + 20} height={18} rx={9} fill={tone.fill} opacity={0.32} />);
    } else {
      const half = 'abcde'.includes(h.row) ? ['a', 'b', 'c', 'd', 'e'] : ['f', 'g', 'h', 'i', 'j'];
      const ys = half.map((r) => Y.get(r as RowId)).filter((v): v is number => v !== undefined);
      if (!ys.length || h.col < c0 || h.col > c1) return;
      const y0 = Math.min(...ys);
      const y1 = Math.max(...ys);
      shades.push(<rect key={`s${i}`} x={X(h.col) - 9} y={y0 - 9} width={18} height={y1 - y0 + 18} rx={9} fill={tone.fill} opacity={0.3} />);
      if (s.label) {
        const top = half[0] === 'a';
        labelsAbove.push(<Rich key={`sl${i}`} runs={runs(s.label)} x={X(h.col)} y={top ? y0 - 14 : y1 + 22} anchor="middle" className="cf-note" fill={tone.ink} />);
      }
    }
  });

  const holes: ReactNode[] = [];
  for (const r of shownRows)
    for (let c = c0; c <= c1; c++) holes.push(<rect key={`${r}${c}`} x={X(c) - HOLE / 2} y={Y.get(r)! - HOLE / 2} width={HOLE} height={HOLE} rx={1.2} className="cf-hole" />);

  const rowNames = shownRows.map((r) => (
    <text
      key={r}
      x={X(c0) - 16}
      y={Y.get(r)! + 4}
      className={isRail(r) ? 'cf-rail-name' : 'cf-row-name'}
      textAnchor="end"
      fill={isRail(r) ? (r.endsWith('p') ? 'var(--plus-ink)' : 'var(--minus)') : undefined}
    >
      {isRail(r) ? (r.endsWith('p') ? '+' : '−') : r}
    </text>
  ));
  const firstMain = (['a', 'f'] as RowId[]).find((r) => Y.has(r));
  // column numbers, except where a strip label above row a covers them
  const covered = (fig.strips ?? []).flatMap((s) => {
    const h = HOLE_MAP.get(s.at);
    if (!h || !s.label || !'abcde'.includes(h.row)) return [];
    const w = estW(txt(s.label)) / 2 + 8;
    return [[X(h.col) - w, X(h.col) + w]];
  });
  const colNums: ReactNode[] = [];
  if (firstMain)
    for (let c = c0; c <= c1; c++)
      if ((c === c0 || c === c1 || c % 5 === 0) && !covered.some(([a, b]) => X(c) > a && X(c) < b))
        colNums.push(
          <text key={c} x={X(c)} y={Y.get(firstMain)! - 12} textAnchor="middle" className="cf-col-num">
            {c}
          </text>,
        );

  const drawn = parts.map((p, i) => <BoardPartView key={i} p={p} pos={pos} left={left} />);

  const apart = (fig.apart ?? []).map(([a, b], i) => {
    const pa = pos(a);
    const pb = pos(b);
    if (!pa || !pb) return null;
    const mx = (pa[0] + pb[0]) / 2;
    const my = (pa[1] + pb[1]) / 2;
    return (
      <g key={`x${i}`} className="cf-apart">
        <line x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} strokeDasharray="3 3" />
        <line x1={mx - 6} y1={my - 6} x2={mx + 6} y2={my + 6} />
        <line x1={mx - 6} y1={my + 6} x2={mx + 6} y2={my - 6} />
      </g>
    );
  });

  // the drawing grows to hold every label (notes beside the board, strip labels near its edge)
  const box = { x0: 0, y0: 0, x1: right + 12, y1: bottom };
  const fit = (x: number, y: number, t: string, anchor: 'start' | 'middle' | 'end') => {
    const w = estW(t);
    const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
    box.x0 = Math.min(box.x0, x0 - 4);
    box.x1 = Math.max(box.x1, x0 + w + 4);
    box.y0 = Math.min(box.y0, y - 14);
    box.y1 = Math.max(box.y1, y + 6);
  };
  (fig.strips ?? []).forEach((s) => {
    const h = HOLE_MAP.get(s.at);
    if (h && s.label) fit(X(h.col), Y.get(h.row) ?? 0, txt(s.label), 'middle');
  });
  const notes = (fig.notes ?? []).map((n, i) => {
    const p = pos(n.at);
    if (!p) return null;
    const side = n.side ?? 'right';
    const dx = side === 'right' ? 12 : side === 'left' ? -12 : 0;
    const dy = side === 'above' ? -12 : side === 'below' ? 18 : 4;
    const anchor = side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle';
    fit(p[0] + dx, p[1] + dy, txt(n.text), anchor);
    return <Rich key={`n${i}`} runs={runs(n.text)} x={p[0] + dx} y={p[1] + dy} anchor={anchor} className="cf-note" />;
  });
  for (const p of parts) {
    const a = pos(p.from);
    if (a && p.label) fit(a[0], a[1] - 30, txt(p.label), 'start');
  }

  const w = box.x1 - box.x0;
  const h = box.y1 - box.y0;
  return (
    <FigureFrame label={caption || tr('面包板示意图', 'Breadboard diagram')}>
      <svg className="cf-svg" viewBox={`${box.x0} ${box.y0} ${w} ${h}`} style={{ maxWidth: Math.round(w * 1.25) }} role="img" aria-label={caption}>
        <rect x={left - 30} y={4} width={right - left + 38} height={bottom - 8} rx={10} className="cf-board" />
        {rowsShown === 'both' && <rect x={left - 30} y={gapY - 5} width={right - left + 38} height={10} className="cf-gap" />}
        {shades}
        {holes}
        {rowNames}
        {colNums}
        {labelsAbove}
        {apart}
        {drawn}
        {notes}
      </svg>
    </FigureFrame>
  );
}

function BoardPartView({ p, pos, left }: { p: BoardPart; pos: (id: string) => [number, number] | null; left: number }) {
  const a = pos(p.from);
  const b = p.to ? pos(p.to) : null;
  const label = p.label ? runs(p.label) : null;
  if (!a) return null;
  const end = (q: [number, number], col: string) => <circle cx={q[0]} cy={q[1]} r={3.2} fill={col} />;
  if (p.type === 'probe') {
    const col = WIRE[p.color ?? 'red'];
    const tip: [number, number] = [a[0] + 2, a[1] - 3];
    const back: [number, number] = [a[0] + 26, a[1] - 34];
    return (
      <g className="cf-probe">
        <line x1={back[0]} y1={back[1]} x2={tip[0] + 5} y2={tip[1] - 6} stroke={col} strokeWidth={6} strokeLinecap="round" />
        <line x1={tip[0] + 5} y1={tip[1] - 6} x2={tip[0]} y2={tip[1]} stroke="#9aa0a6" strokeWidth={2.2} strokeLinecap="round" />
        {label && <Rich runs={label} x={back[0] + 6} y={back[1] - 2} className="cf-note" fill={p.color === 'black' ? 'var(--ink)' : 'var(--plus-ink)'} />}
      </g>
    );
  }
  if (!b) return null;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const horiz = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]);
  if (p.type === 'wire') {
    const col = WIRE[p.color ?? 'green'];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const bow = Math.min(22, 6 + len * 0.18);
    // bow away from the board's middle: up for a horizontal wire, sideways for a vertical one
    const cx = horiz ? mx : mx + bow;
    const cy = horiz ? my - bow : my;
    return (
      <g className="cf-wire">
        <path d={`M${a[0]},${a[1]} Q${cx},${cy} ${b[0]},${b[1]}`} stroke={col === WIRE.white ? '#bdb6a5' : col} strokeWidth={3.4} fill="none" strokeLinecap="round" />
        {end(a, col)}
        {end(b, col)}
        {label && <Rich runs={label} x={cx + (horiz ? 0 : 8)} y={cy - (horiz ? 4 : -4)} anchor={horiz ? 'middle' : 'start'} className="cf-note" />}
      </g>
    );
  }
  if (p.type === 'resistor') {
    const L = Math.min(30, Math.hypot(b[0] - a[0], b[1] - a[1]) - 8);
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    return (
      <g className="cf-resistor">
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#8e8a80" strokeWidth={1.8} />
        <g transform={`translate(${mx},${my}) rotate(${ang})`}>
          <rect x={-L / 2} y={-5.5} width={L} height={11} rx={4} fill="#dcc394" stroke="#9c8358" strokeWidth={1} />
          {[-0.28, -0.1, 0.08].map((f, i) => (
            <rect key={i} x={L * f - 1.5} y={-5.5} width={3} height={11} fill={['#c0392b', '#c0392b', '#6b3e1e'][i]} />
          ))}
          <rect x={L * 0.3 - 1.5} y={-5.5} width={3} height={11} fill="#c9a227" />
        </g>
        {end(a, '#8e8a80')}
        {end(b, '#8e8a80')}
        {label && <Rich runs={label} x={horiz ? mx : mx + 11} y={horiz ? my - 11 : my + 4} anchor={horiz ? 'middle' : 'start'} className="cf-note" />}
      </g>
    );
  }
  if (p.type === 'led') {
    const dome = LED_DOME[p.color ?? 'red'];
    // the LED stands up from its two holes: a dome above the pair, the longer leg (+) is `from`
    const top: [number, number] = horiz ? [mx, Math.min(a[1], b[1]) - 20] : [Math.max(a[0], b[0]) + 20, my];
    return (
      <g className="cf-led">
        <line x1={a[0]} y1={a[1]} x2={top[0] - (horiz ? 4 : 0)} y2={top[1] + (horiz ? 0 : -4)} stroke="#8e8a80" strokeWidth={1.8} />
        <line x1={b[0]} y1={b[1]} x2={top[0] + (horiz ? 4 : 0)} y2={top[1] + (horiz ? 0 : 4)} stroke="#8e8a80" strokeWidth={1.8} />
        <circle cx={top[0]} cy={top[1]} r={9} fill={dome} stroke="rgba(0,0,0,.35)" strokeWidth={1} />
        <circle cx={top[0] - 3} cy={top[1] - 3} r={2.4} fill="#fff" opacity={0.6} />
        <text x={a[0] + (horiz ? (a[0] < b[0] ? -8 : 8) : 0)} y={a[1] + (horiz ? -6 : a[1] < b[1] ? -8 : 14)} textAnchor="middle" className="cf-pol" fill="var(--plus-ink)">
          +
        </text>
        {end(a, '#8e8a80')}
        {end(b, '#8e8a80')}
        {label && <Rich runs={label} x={top[0] + (horiz ? 0 : 14)} y={top[1] + (horiz ? -14 : 4)} anchor={horiz ? 'middle' : 'start'} className="cf-note" />}
      </g>
    );
  }
  // battery: a box left of the board, leads to its two holes (+ = from)
  const bx = left - 80;
  const by = Math.min(a[1], b[1]) - 4;
  const bh = Math.max(36, Math.abs(b[1] - a[1]) + 8);
  return (
    <g className="cf-battery">
      <rect x={bx} y={by} width={34} height={bh} rx={4} fill="#2f3138" />
      <rect x={bx} y={by} width={34} height={bh * 0.4} rx={4} fill="#c9a227" />
      <text x={bx + 17} y={by + bh * 0.2 + 4} textAnchor="middle" className="cf-pol" fill="#2f3138">
        +
      </text>
      <text x={bx + 17} y={by + bh * 0.72 + 4} textAnchor="middle" className="cf-pol" fill="#f3f1ea">
        −
      </text>
      <path d={`M${bx + 34},${by + bh * 0.2} C${bx + 52},${by + bh * 0.2} ${a[0] - 24},${a[1]} ${a[0]},${a[1]}`} stroke={WIRE.red} strokeWidth={3} fill="none" />
      <path d={`M${bx + 34},${by + bh * 0.72} C${bx + 52},${by + bh * 0.72} ${b[0] - 24},${b[1]} ${b[0]},${b[1]}`} stroke={WIRE.black} strokeWidth={3} fill="none" />
      {end(a, WIRE.red)}
      {end(b, WIRE.black)}
      {label && <Rich runs={label} x={bx + 17} y={by + bh + 14} anchor="middle" className="cf-note" />}
    </g>
  );
}

// ---------------------------------------------------------------- plot

function PlotView({ fig, caption }: { fig: PlotFigure; caption: string }) {
  const W = 300;
  const H = 210;
  const m = { l: 40, r: 14, t: 26, b: 40 };
  const sx = (v: number) => m.l + ((v - fig.x.min) / (fig.x.max - fig.x.min)) * (W - m.l - m.r);
  const sy = (v: number) => H - m.b - ((v - fig.y.min) / (fig.y.max - fig.y.min)) * (H - m.t - m.b);
  const clipX = (v: number) => Math.min(Math.max(v, fig.x.min), fig.x.max);
  const clipY = (v: number) => Math.min(Math.max(v, fig.y.min), fig.y.max);
  const num = (v: number) => String(Math.round(v * 1000) / 1000);
  const x0 = sx(fig.x.min);
  const y0 = sy(fig.y.min);
  return (
    <FigureFrame label={caption || tr('曲线图', 'Plot')}>
      <svg className="cf-svg cf-plot" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: Math.round(W * 1.25) }} role="img" aria-label={caption}>
        {/* guide lines */}
        {(fig.hlines ?? []).map((l, i) => (
          <g key={`h${i}`} className="cf-guide">
            <line x1={x0} x2={sx(fig.x.max)} y1={sy(clipY(l.y))} y2={sy(clipY(l.y))} strokeDasharray={l.dashed === false ? undefined : '4 4'} />
            {l.label && <Rich runs={runs(l.label)} x={x0 + 6} y={sy(clipY(l.y)) - 5} className="cf-note" />}
          </g>
        ))}
        {(fig.vlines ?? []).map((l, i) => (
          <g key={`v${i}`} className="cf-guide">
            <line x1={sx(clipX(l.x))} x2={sx(clipX(l.x))} y1={y0} y2={sy(fig.y.max)} strokeDasharray={l.dashed === false ? undefined : '4 4'} />
            {l.label && <Rich runs={runs(l.label)} x={sx(clipX(l.x)) + 5} y={sy(fig.y.max) + 10} className="cf-note" />}
          </g>
        ))}
        {/* axes with arrow heads */}
        <g className="cf-axis">
          <line x1={x0} y1={y0} x2={W - m.r + 6} y2={y0} />
          <polygon points={`${W - m.r + 10},${y0} ${W - m.r + 2},${y0 - 3.5} ${W - m.r + 2},${y0 + 3.5}`} />
          <line x1={x0} y1={y0} x2={x0} y2={m.t - 10} />
          <polygon points={`${x0},${m.t - 14} ${x0 - 3.5},${m.t - 6} ${x0 + 3.5},${m.t - 6}`} />
        </g>
        {(fig.x.ticks ?? []).map((t) => (
          <g key={`xt${t}`} className="cf-tick">
            <line x1={sx(t)} x2={sx(t)} y1={y0} y2={y0 + 4} />
            <text x={sx(t)} y={y0 + 16} textAnchor="middle">
              {num(t)}
            </text>
          </g>
        ))}
        {(fig.y.ticks ?? []).map((t) => (
          <g key={`yt${t}`} className="cf-tick">
            <line x1={x0 - 4} x2={x0} y1={sy(t)} y2={sy(t)} />
            <text x={x0 - 7} y={sy(t) + 4} textAnchor="end">
              {num(t)}
            </text>
          </g>
        ))}
        <Rich runs={runs(fig.x.label)} x={W - m.r + 8} y={y0 + 32} anchor="end" className="cf-axis-label" />
        <Rich runs={runs(fig.y.label)} x={x0 + 8} y={m.t - 8} className="cf-axis-label" />
        {fig.curves.map((c, i) => {
          const tone = TONE[c.tone ?? 1];
          const pts = c.points.map(([x, y]) => `${sx(clipX(x))},${sy(clipY(y))}`).join(' ');
          const last = c.points[c.points.length - 1];
          return (
            <g key={`c${i}`}>
              <polyline points={pts} fill="none" stroke={tone.fill} strokeWidth={2.4} strokeLinejoin="round" strokeDasharray={c.dashed ? '6 4' : undefined} />
              {c.label &&
                (c.labelAt ? (
                  <Rich runs={runs(c.label)} x={sx(c.labelAt[0])} y={sy(c.labelAt[1])} anchor="middle" className="cf-note" fill={tone.ink} />
                ) : (
                  <Rich runs={runs(c.label)} x={sx(clipX(last[0])) - 4} y={sy(clipY(last[1])) - 8} anchor="end" className="cf-note" fill={tone.ink} />
                ))}
            </g>
          );
        })}
        {(fig.dots ?? []).map((d, i) => {
          const tone = TONE[d.tone ?? 1];
          return (
            <g key={`d${i}`}>
              <circle cx={sx(d.at[0])} cy={sy(d.at[1])} r={4.2} fill={tone.fill} stroke="var(--paper)" strokeWidth={1.5} />
              {d.label && <Rich runs={runs(d.label)} x={sx(d.at[0]) + 8} y={sy(d.at[1]) + 4} className="cf-note" fill={tone.ink} />}
            </g>
          );
        })}
      </svg>
    </FigureFrame>
  );
}
