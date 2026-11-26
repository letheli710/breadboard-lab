// W1-L4's topology helpers (pure, unit-tested in topo.test.ts): the flood fill that colours one
// equipotential region of wire, and the series / parallel judge on a netlist.

export type Pt = readonly [number, number];

/** A piece of ideal wire: a polyline. Pieces touch where they share an end point (a corner or a
 *  T junction); a wire never runs through an element, so a fill stops at element terminals. */
export interface WireSeg {
  id: string;
  pts: Pt[];
}

const key = (p: Pt) => `${p[0]},${p[1]}`;

/** Breadth-first flood fill over wire pieces from `start`: every piece reached through 0 Ω wire,
 *  with its depth (number of junctions crossed), in visiting order. */
export function floodFill(segs: WireSeg[], start: string): { id: string; depth: number }[] {
  const byEnd = new Map<string, string[]>();
  for (const s of segs)
    for (const p of [s.pts[0], s.pts[s.pts.length - 1]]) {
      const k = key(p);
      byEnd.set(k, [...(byEnd.get(k) ?? []), s.id]);
    }
  const seg = new Map(segs.map((s) => [s.id, s]));
  if (!seg.has(start)) return [];
  const out: { id: string; depth: number }[] = [];
  const seen = new Set([start]);
  const queue: { id: string; depth: number }[] = [{ id: start, depth: 0 }];
  while (queue.length) {
    const cur = queue.shift()!;
    out.push(cur);
    const s = seg.get(cur.id)!;
    for (const p of [s.pts[0], s.pts[s.pts.length - 1]])
      for (const n of byEnd.get(key(p)) ?? [])
        if (!seen.has(n)) {
          seen.add(n);
          queue.push({ id: n, depth: cur.depth + 1 });
        }
  }
  return out;
}

/** Points where three or more wire ends meet (drawn as solder dots). */
export function junctions(segs: WireSeg[]): Pt[] {
  const count = new Map<string, { p: Pt; n: number }>();
  for (const s of segs)
    for (const p of [s.pts[0], s.pts[s.pts.length - 1]]) {
      const c = count.get(key(p));
      if (c) c.n++;
      else count.set(key(p), { p, n: 1 });
    }
  return [...count.values()].filter((c) => c.n >= 3).map((c) => c.p);
}

/* ------------------------------------------------------------- series / parallel judge */

/** A two-terminal element between nodes a and b. `role` marks the lesson's saboteurs. */
export interface NetEl {
  id: string;
  a: string;
  b: string;
  role?: 'tap' | 'sneak';
}

export const degree = (els: NetEl[], node: string) => els.filter((e) => e.a === node || e.b === node).length;

export type Verdict =
  | { kind: 'series'; node: string }
  | { kind: 'parallel'; nodes: [string, string] }
  | {
      kind: 'neither';
      /** the one node the two share, if any, and its degree */
      shared?: { node: string; deg: number };
      /** other branches on the shared node (they take current away) */
      third: string[];
      /** a sneak element that tears what would be one node into two */
      sneak?: string;
    };

export function judge(els: NetEl[], x: string, y: string): Verdict {
  const ex = els.find((e) => e.id === x)!;
  const ey = els.find((e) => e.id === y)!;
  const nx = [ex.a, ex.b];
  const ny = [ey.a, ey.b];
  const shared = nx.filter((n) => ny.includes(n));
  if (shared.length === 2) return { kind: 'parallel', nodes: [shared[0], shared[1]] };
  if (shared.length === 1) {
    const n = shared[0];
    const deg = degree(els, n);
    if (deg === 2) return { kind: 'series', node: n };
    const ox = nx.find((v) => v !== n)!;
    const oy = ny.find((v) => v !== n)!;
    const sneak = els.find((e) => e.role === 'sneak' && ((e.a === ox && e.b === oy) || (e.a === oy && e.b === ox)));
    const third = els.filter((e) => e.id !== x && e.id !== y && (e.a === n || e.b === n)).map((e) => e.id);
    return { kind: 'neither', shared: { node: n, deg }, third, sneak: sneak?.id };
  }
  return { kind: 'neither', third: [] };
}

/* ------------------------------------------------------------- easing */

/** CSS cubic-bezier(x1, y1, x2, y2) as a function of t in [0, 1]. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const bx = (s: number) => 3 * x1 * s * (1 - s) ** 2 + 3 * x2 * s * s * (1 - s) + s ** 3;
  const by = (s: number) => 3 * y1 * s * (1 - s) ** 2 + 3 * y2 * s * s * (1 - s) + s ** 3;
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (bx(mid) < t) lo = mid;
      else hi = mid;
    }
    return by((lo + hi) / 2);
  };
}
