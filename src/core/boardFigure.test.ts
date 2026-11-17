// Text on breadboard figures (boardFigure.placeLabels): tags on the board never cover strips,
// parts or marks, never overlap each other, and labels with no good spot leave the board.
import { describe, expect, it } from 'vitest';
import { boardGeom, hitRect, padRect, partRect, placeLabels, textWidth, type LabelSpec, type Rect } from './boardFigure';
import type { BreadboardFigure } from './figures';

const strips: BreadboardFigure = {
  kind: 'breadboard',
  caption: 'x',
  cols: [1, 9],
  strips: [
    { at: 'a3', tone: 1, label: 'a–e 是一条' },
    { at: 'f3', tone: 2, label: 'f–j 另一条' },
    { at: 'a7', tone: 3, label: '第 7 列' },
  ],
  apart: [['e3', 'f3']],
};

function specs(fig: BreadboardFigure): { g: ReturnType<typeof boardGeom>; labels: LabelSpec[]; fixed: Rect[] } {
  const g = boardGeom(fig);
  const labels: LabelSpec[] = (fig.strips ?? []).map((s, i) => {
    const ids = Array.isArray(s.at) ? s.at : [s.at];
    return {
      key: `s${i}`,
      text: String(s.label),
      targets: ids.map((id) => g.stripRect(id)!),
      cores: ids.map((id) => g.stripCore(id)!),
      top: /^[a-e]/.test(ids[0]),
      gutters: ids.map((id) => g.X(Number(id.slice(1))) + 11),
    };
  });
  const fixed = [
    ...(fig.parts ?? []).map((p) => partRect(g, p)!),
    ...(fig.apart ?? []).map(([a, b]) => {
      const pa = g.pos(a)!;
      const pb = g.pos(b)!;
      return { x: pa[0] - 9, y: pa[1], w: 18, h: pb[1] - pa[1] };
    }),
  ];
  return { g, labels, fixed };
}

describe('labels on breadboard figures', () => {
  it('put short labels on the board, clear of strips, marks and each other', () => {
    const { g, labels, fixed } = specs(strips);
    const lay = placeLabels(g, labels, fixed);
    expect(lay.labels.map((l) => l.kind)).toEqual(['tag', 'tag', 'tag']);
    for (const t of lay.labels) {
      const L = labels.find((l) => l.key === t.key)!;
      for (const o of labels) if (o !== L) for (const r of o.targets) expect(hitRect(t.box, r)).toBe(false);
      for (const c of L.cores) expect(hitRect(t.box, padRect(c, 0.5))).toBe(false);
      for (const f of fixed) expect(hitRect(t.box, f)).toBe(false);
      for (const u of lay.labels) if (u !== t) expect(hitRect(t.box, u.box)).toBe(false);
      // inside the board, next to what it names
      expect(t.box.x).toBeGreaterThanOrEqual(g.frame.x);
      expect(t.box.x + t.box.w).toBeLessThanOrEqual(g.frame.x + g.frame.w);
    }
    // the tags sit in the hole-free lanes: nothing is covered
    expect(lay.dimmed.size).toBe(0);
  });

  it('one label can name several strips', () => {
    const fig: BreadboardFigure = {
      kind: 'breadboard',
      caption: 'x',
      cols: [2, 12],
      rows: 'top',
      rails: 'none',
      strips: [
        { at: 'a4', tone: 2, label: '✗ 同一条：短路' },
        { at: ['a8', 'a11'], tone: 1, label: '✓ 分在两条上' },
      ],
      parts: [
        { type: 'resistor', from: 'a4', to: 'd4' },
        { type: 'resistor', from: 'b8', to: 'b11' },
      ],
    };
    const { g, labels, fixed } = specs(fig);
    expect(labels[1].targets).toHaveLength(2);
    const lay = placeLabels(g, labels, fixed);
    expect(lay.labels.every((l) => l.kind === 'tag')).toBe(true);
    for (const t of lay.labels) for (const f of fixed) expect(hitRect(t.box, f)).toBe(false);
  });

  it('send labels with no good spot off the board, with leaders, without overlapping', () => {
    const long = '这是一段很长很长的说明文字，板上放不下';
    const fig: BreadboardFigure = {
      kind: 'breadboard',
      caption: 'x',
      cols: [1, 6],
      rows: 'top',
      rails: 'none',
      strips: [1, 2, 3, 4, 5, 6].map((c) => ({ at: `a${c}`, tone: 1 as const, label: `${long}${c}` })),
    };
    const { g, labels, fixed } = specs(fig);
    const lay = placeLabels(g, labels, fixed);
    const out = lay.labels.filter((l) => l.kind === 'callout');
    expect(out.length).toBeGreaterThan(0);
    for (const c of out) {
      if (c.kind !== 'callout') continue;
      expect(c.box.y + c.box.h).toBeLessThanOrEqual(g.frame.y); // above the board (top-half targets)
      expect(c.leaders.length).toBe(1);
      for (const d of out) if (d !== c) expect(hitRect(c.box, d.box)).toBe(false);
    }
    expect(lay.bounds.y).toBeLessThan(0); // the drawing grows upward to hold them
    expect(textWidth(long)).toBeGreaterThan(200);
  });
});
