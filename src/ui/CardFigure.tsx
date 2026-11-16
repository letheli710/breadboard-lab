// A figure inside a lesson card (core/figures.ts, CHALLENGE_FORMAT.md §16.3): a circuit drawing,
// a strip of breadboard or a plot, with its caption underneath. Loaded on demand (Cards.tsx): only
// units that have figures fetch this chunk.

import { useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { HOLE_MAP, RAIL_ROWS, type RowId } from '../core/breadboard';
import { boardGeom, gutterNear, HOLE_PX, padRect, partRect, PITCH, placeLabels, type LabelSpec, type Rect } from '../core/boardFigure';
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

/** The board, its parts and its text. All text goes through boardFigure.placeLabels: on the board
 *  where a good spot exists, else above / below it with a leader. Pointing at a label (or tapping
 *  it) outlines what it is about. */
function BoardFigure({ fig, caption }: { fig: BreadboardFigure; caption: string }) {
  const g = boardGeom(fig);
  const parts = fig.parts ?? [];
  const isRail = (r: RowId) => (RAIL_ROWS as readonly string[]).includes(r);
  const rowOf = (id: string) => HOLE_MAP.get(id)?.row;
  const topHalf = (id: string) => {
    const r = rowOf(id);
    return r === 'tp' || r === 'tn' || (r !== undefined && 'abcde'.includes(r));
  };
  const gutterFor = (id: string) => {
    const h = HOLE_MAP.get(id);
    if (!h) return g.X(g.c1) - PITCH / 2;
    return isRail(h.row) ? g.X(g.c1) - PITCH / 2 : h.col < g.c1 ? g.X(h.col) + PITCH / 2 : g.X(h.col) - PITCH / 2;
  };

  // labels: strips, notes, part labels
  type Lab = LabelSpec & { runs: ReturnType<typeof runs>; tone?: Tone };
  const labels: Lab[] = [];
  const stripTargets = (fig.strips ?? []).map((s) => (Array.isArray(s.at) ? s.at : [s.at]));
  (fig.strips ?? []).forEach((s, i) => {
    if (!s.label) return;
    const ids = stripTargets[i].filter((id) => g.stripRect(id));
    if (!ids.length) return;
    labels.push({
      key: `s${i}`,
      text: txt(s.label),
      runs: runs(s.label),
      tone: s.tone ?? 1,
      targets: ids.map((id) => g.stripRect(id)!),
      cores: ids.map((id) => g.stripCore(id)!),
      top: topHalf(ids[0]),
      gutters: ids.map(gutterFor),
    });
  });
  (fig.notes ?? []).forEach((n, i) => {
    const r = g.holeRect(n.at);
    if (!r) return;
    labels.push({ key: `n${i}`, text: txt(n.text), runs: runs(n.text), targets: [padRect(r, 3)], cores: [r], top: topHalf(n.at), gutters: [gutterFor(n.at)], side: n.side });
  });
  parts.forEach((p, i) => {
    const r = partRect(g, p);
    // (a dev board prints its name on itself)
    if (!p.label || !r || p.type === 'board') return;
    labels.push({ key: `p${i}`, text: txt(p.label), runs: runs(p.label), targets: [r], cores: [r], top: r.y + r.h / 2 < g.bottom / 2, gutters: [gutterNear(g, r.x + r.w / 2)] });
  });
  // never covered: parts, ✗ marks, shaded strips that carry no label
  const fixed: Rect[] = [
    ...parts.map((p) => partRect(g, p)).filter((r): r is Rect => !!r),
    ...(fig.apart ?? []).flatMap(([a, b]) => {
      const pa = g.pos(a);
      const pb = g.pos(b);
      return pa && pb ? [{ x: Math.min(pa[0], pb[0]) - 9, y: Math.min(pa[1], pb[1]), w: Math.abs(pb[0] - pa[0]) + 18, h: Math.abs(pb[1] - pa[1]) }] : [];
    }),
    ...(fig.strips ?? []).flatMap((s, i) =>
      s.label
        ? []
        : stripTargets[i]
            .map((id) => g.stripRect(id))
            .filter((r): r is Rect => !!r)
            .map((r) => padRect(r, 2)),
    ),
  ];
  const lay = placeLabels(g, labels, fixed);
  const labelOf = new Map(labels.map((l) => [l.key, l]));

  // pointing at a label, a strip or its tag outlines it; a tap pins it until the next tap
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const on = hover ?? pinned;
  const link = (key: string) => ({
    onPointerEnter: (e: ReactPointerEvent) => e.pointerType === 'mouse' && setHover(key),
    onPointerLeave: (e: ReactPointerEvent) => e.pointerType === 'mouse' && setHover(null),
    onClick: () => setPinned((k) => (k === key ? null : key)),
  });
  const cls = (key: string, base: string) => `${base}${on ? (on === key ? ' on' : ' off') : ''}`;

  const shades: ReactNode[] = [];
  for (const r of g.rows.filter(isRail)) {
    const yy = g.Y.get(r)!;
    shades.push(
      <rect
        key={`rail${r}`}
        x={g.X(g.c0) - 9}
        y={yy - 7}
        width={g.X(g.c1) - g.X(g.c0) + 18}
        height={14}
        rx={7}
        fill={r.endsWith('p') ? 'var(--plus)' : 'var(--minus)'}
        opacity={0.14}
      />,
    );
  }
  (fig.strips ?? []).forEach((s, i) => {
    const tone = TONE[s.tone ?? 1];
    const key = `s${i}`;
    stripTargets[i].forEach((id, j) => {
      const r = g.stripRect(id);
      if (!r) return;
      shades.push(
        <rect
          key={`s${i}-${j}`}
          className={s.label ? cls(key, 'cf-shade linked') : 'cf-shade'}
          x={r.x}
          y={r.y}
          width={r.w}
          height={r.h}
          rx={9}
          fill={tone.fill}
          {...(s.label ? link(key) : {})}
        />,
      );
    });
  });

  const holes: ReactNode[] = [];
  for (const r of g.rows)
    for (let c = g.c0; c <= g.c1; c++)
      holes.push(
        <rect
          key={`${r}${c}`}
          className={lay.dimmed.has(`${r}${c}`) ? 'cf-hole dim' : 'cf-hole'}
          x={g.X(c) - HOLE_PX / 2}
          y={g.Y.get(r)! - HOLE_PX / 2}
          width={HOLE_PX}
          height={HOLE_PX}
          rx={1.2}
        />,
      );

  const rowNames = g.rows.map((r) => (
    <text
      key={r}
      x={g.X(g.c0) - 16}
      y={g.Y.get(r)! + 4}
      className={isRail(r) ? 'cf-rail-name' : 'cf-row-name'}
      textAnchor="end"
      fill={isRail(r) ? (r.endsWith('p') ? 'var(--plus-ink)' : 'var(--minus)') : undefined}
    >
      {isRail(r) ? (r.endsWith('p') ? '+' : '−') : r}
    </text>
  ));
  const colNums = g.colNums
    .filter((c) => !lay.hiddenCols.has(c))
    .map((c) => (
      <text key={c} x={g.X(c)} y={g.Y.get(g.firstMain!)! - 12} textAnchor="middle" className="cf-col-num">
        {c}
      </text>
    ));

  const apart = (fig.apart ?? []).map(([a, b], i) => {
    const pa = g.pos(a);
    const pb = g.pos(b);
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

  // outlines of what each label is about (shown while it is pointed at)
  const rings = labels.flatMap((l) =>
    l.targets.map((t, j) => {
      const r = padRect(t, 3);
      return <rect key={`r${l.key}-${j}`} className={`cf-ring${on === l.key ? ' on' : ''}`} x={r.x} y={r.y} width={r.w} height={r.h} rx={10} />;
    }),
  );

  const texts = lay.labels.map((p) => {
    const l = labelOf.get(p.key)!;
    const tone = l.tone ? TONE[l.tone] : null;
    const ink = tone?.ink ?? 'var(--ink)';
    if (p.kind === 'tag') {
      const cx = p.box.x + p.box.w / 2;
      return (
        <g key={p.key} className={cls(p.key, 'cf-tag')} {...link(p.key)}>
          {p.pointers.map(([a, b], i) => (
            <g key={i}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={ink} strokeWidth={1.4} />
              <circle cx={b[0]} cy={b[1]} r={2.4} fill={ink} />
            </g>
          ))}
          <rect x={p.box.x} y={p.box.y} width={p.box.w} height={p.box.h} rx={p.box.h / 2} stroke={tone?.fill ?? 'var(--line-2)'} />
          <Rich runs={l.runs} x={cx} y={p.box.y + p.box.h / 2 + 4.3} anchor="middle" className="cf-label" fill={ink} />
        </g>
      );
    }
    return (
      <g key={p.key} className={cls(p.key, 'cf-callout')} {...link(p.key)}>
        {p.leaders.map((pts, i) => (
          <g key={i}>
            <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={ink} strokeWidth={1.3} />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.6} fill={ink} />
          </g>
        ))}
        <Rich runs={l.runs} x={p.at[0]} y={p.at[1]} anchor="middle" className="cf-label" fill={ink} />
      </g>
    );
  });

  const box = {
    x0: Math.min(0, lay.bounds.x),
    y0: Math.min(0, lay.bounds.y),
    x1: Math.max(g.right + 12, lay.bounds.x + lay.bounds.w),
    y1: Math.max(g.bottom, lay.bounds.y + lay.bounds.h),
  };
  const w = box.x1 - box.x0;
  const h = box.y1 - box.y0;
  return (
    <FigureFrame label={caption || tr('面包板示意图', 'Breadboard diagram')}>
      <svg
        className={`cf-svg cf-board-svg${on ? ' has-on' : ''}`}
        viewBox={`${box.x0} ${box.y0} ${w} ${h}`}
        style={{ maxWidth: Math.round(w * 1.25) }}
        role="img"
        aria-label={caption}
      >
        <rect x={g.frame.x} y={g.frame.y} width={g.frame.w} height={g.frame.h} rx={10} className="cf-board" />
        {g.gapY !== null && <rect x={g.frame.x} y={g.gapY - 5} width={g.frame.w} height={10} className="cf-gap" />}
        {shades}
        {holes}
        {rowNames}
        {colNums}
        {apart}
        {parts.map((p, i) => (
          <BoardPartView key={i} p={p} pos={g.pos} left={g.left} />
        ))}
        {rings}
        {texts}
      </svg>
    </FigureFrame>
  );
}

function BoardPartView({ p, pos, left }: { p: BoardPart; pos: (id: string) => [number, number] | null; left: number }) {
  const a = pos(p.from);
  const b = p.to ? pos(p.to) : null;
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
      </g>
    );
  }
  if (p.type === 'button') {
    // a four-leg pushbutton: `from` and `to` are opposite corners (e.g. e5 and f7, across the trench)
    const x0 = Math.min(a[0], b[0]);
    const y0 = Math.min(a[1], b[1]);
    const w = Math.abs(b[0] - a[0]);
    const h = Math.abs(b[1] - a[1]);
    return (
      <g className="cf-button">
        <rect x={x0 - 5} y={y0 - 5} width={w + 10} height={h + 10} rx={3} fill="#3a3d45" />
        <circle cx={x0 + w / 2} cy={y0 + h / 2} r={Math.min(w, h) / 2 - 2} fill="#d9d3c4" stroke="#8e8a80" strokeWidth={1} />
        {[
          [x0, y0],
          [x0 + w, y0],
          [x0, y0 + h],
          [x0 + w, y0 + h],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.6} fill="#b8b2a3" />
        ))}
      </g>
    );
  }
  if (p.type === 'board') {
    // a dev board: a PCB over the holes from `from` to `to` (opposite corners), its name printed on it
    const x0 = Math.min(a[0], b[0]);
    const y0 = Math.min(a[1], b[1]);
    const w = Math.abs(b[0] - a[0]);
    const h = Math.abs(b[1] - a[1]);
    return (
      <g className="cf-board-part">
        <rect x={x0 - 6} y={y0 - 6} width={w + 12} height={h + 12} rx={3} fill="#1f4e79" />
        {Array.from({ length: Math.round(w / 22) + 1 }, (_, i) => (
          <g key={i}>
            <circle cx={x0 + i * 22} cy={y0} r={2.6} fill="#e3c26a" />
            <circle cx={x0 + i * 22} cy={y0 + h} r={2.6} fill="#e3c26a" />
          </g>
        ))}
        {/* a tall board shows its chip with the name under it; a short one only the name */}
        {h >= 50 && <rect x={x0 + w / 2 - 14} y={y0 + h / 2 - 16} width={28} height={18} rx={2} fill="#2f3138" />}
        {p.label && <Rich runs={runs(p.label)} x={x0 + w / 2} y={h >= 50 ? y0 + h / 2 + 16 : y0 + h / 2 + 4.5} anchor="middle" className="cf-label" fill="#f3f1ea" />}
      </g>
    );
  }
  if (p.type === 'capacitor' || p.type === 'electrolytic') {
    // it stands up from its two holes; an electrolytic's − side (the stripe) is `to`
    const top: [number, number] = horiz ? [mx, Math.min(a[1], b[1]) - 16] : [Math.max(a[0], b[0]) + 14, my];
    return (
      <g className="cf-cap">
        <line x1={a[0]} y1={a[1]} x2={top[0] - (horiz ? 4 : 0)} y2={top[1] + (horiz ? 0 : -4)} stroke="#8e8a80" strokeWidth={1.8} />
        <line x1={b[0]} y1={b[1]} x2={top[0] + (horiz ? 4 : 0)} y2={top[1] + (horiz ? 0 : 4)} stroke="#8e8a80" strokeWidth={1.8} />
        {p.type === 'capacitor' ? (
          <ellipse cx={top[0]} cy={top[1]} rx={9} ry={8} fill="#e4a83a" stroke="#a8741c" strokeWidth={1} />
        ) : (
          <g>
            <rect x={top[0] - 9} y={top[1] - 11} width={18} height={22} rx={3} fill="#2b4a8f" />
            <rect
              x={horiz ? (a[0] < b[0] ? top[0] + 3 : top[0] - 9) : top[0] - 9}
              y={horiz ? top[1] - 11 : a[1] < b[1] ? top[1] + 5 : top[1] - 11}
              width={horiz ? 6 : 18}
              height={horiz ? 22 : 6}
              fill="#c9d3e6"
            />
          </g>
        )}
        {end(a, '#8e8a80')}
        {end(b, '#8e8a80')}
      </g>
    );
  }
  if (p.type === 'inductor' || p.type === 'diode') {
    const L = Math.min(30, Math.hypot(b[0] - a[0], b[1] - a[1]) - 8);
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    return (
      <g className={`cf-${p.type}`}>
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#8e8a80" strokeWidth={1.8} />
        <g transform={`translate(${mx},${my}) rotate(${ang})`}>
          {p.type === 'inductor' ? (
            <g>
              <rect x={-L / 2} y={-6} width={L} height={12} rx={5} fill="#3f6b4a" />
              {[-0.3, -0.1, 0.1, 0.3].map((f, i) => (
                <rect key={i} x={L * f - 1.5} y={-6} width={3} height={12} fill={['#6b3e1e', '#2f3138', '#c0392b', '#c9a227'][i]} />
              ))}
            </g>
          ) : (
            <g>
              {/* a glass / black body with the band at the cathode (`to`) end */}
              <rect x={-L / 2} y={-5} width={L} height={10} rx={3} fill="#2f3138" />
              <rect x={L / 2 - 7} y={-5} width={4} height={10} fill="#d9d3c4" />
            </g>
          )}
        </g>
        {end(a, '#8e8a80')}
        {end(b, '#8e8a80')}
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
