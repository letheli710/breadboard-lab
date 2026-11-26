// Pure trace maths of the shared oscilloscope (no three.js, no React): a channel's samples over the
// screen's time window, and their place on the 10 × 8 division graticule.

/** A trace: a function v(t) (t in s, v in V), or sampled [t, v] points in increasing t. */
export type TraceSource = ((t: number) => number) | ReadonlyArray<readonly [number, number]>;

export const DIVS_X = 10;
export const DIVS_Y = 8;

/** The time window of the screen: `div` s/div, `start` the time at the left edge (default 0). */
export interface TimeBase {
  div: number;
  start?: number;
}

/** A channel's vertical scale: `vdiv` V/div, `pos` the divisions above the centre where 0 V sits. */
export interface VScale {
  vdiv: number;
  pos?: number;
}

/**
 * [t, v] samples of a source over [t0, t1]: a function at n + 1 evenly spaced times; an array: the
 * points inside the window, plus the neighbour just outside each end so the trace reaches the edge.
 * Non-finite values are dropped.
 */
export function sampleTrace(src: TraceSource, t0: number, t1: number, n = 800): [number, number][] {
  const out: [number, number][] = [];
  if (typeof src === 'function') {
    for (let k = 0; k <= n; k++) {
      const t = t0 + ((t1 - t0) * k) / n;
      const v = src(t);
      if (Number.isFinite(v)) out.push([t, v]);
    }
    return out;
  }
  let first = -1;
  let last = -1;
  for (let k = 0; k < src.length; k++) {
    const t = src[k][0];
    if (t >= t0 && t <= t1) {
      if (first < 0) first = k;
      last = k;
    }
  }
  if (first < 0) {
    // no point inside: the segment that spans the window, if any
    const k = src.findIndex((p) => p[0] > t1);
    if (k > 0) {
      first = k - 1;
      last = k;
    } else return out;
  } else {
    first = Math.max(0, first - 1);
    last = Math.min(src.length - 1, last + 1);
  }
  for (let k = first; k <= last; k++) if (Number.isFinite(src[k][1])) out.push([src[k][0], src[k][1]]);
  return out;
}

/** how far past the graticule a trace may run before it is pinned to the edge, in divisions */
export const OVERSCAN = 0.15;

/**
 * Screen positions in divisions: x 0 … 10 from the left edge, y −4 … +4 from the centre (up = +).
 * Values off the screen are pinned just past its edge, as a real scope's trace runs along the top.
 */
export function toDivs(pts: ReadonlyArray<readonly [number, number]>, tb: TimeBase, vs: VScale): [number, number][] {
  const t0 = tb.start ?? 0;
  const lim = DIVS_Y / 2 + OVERSCAN;
  return pts.map(([t, v]) => [(t - t0) / tb.div, Math.max(-lim, Math.min(lim, v / vs.vdiv + (vs.pos ?? 0)))]);
}

/** The divisions of one channel on the screen: sampled over the window, then placed. */
export function traceDivs(src: TraceSource, tb: TimeBase, vs: VScale, n = 800): [number, number][] {
  const t0 = tb.start ?? 0;
  return toDivs(sampleTrace(src, t0, t0 + DIVS_X * tb.div, n), tb, vs);
}

/** A cheap fingerprint of screen points (to 1/200 division), so an unchanged screen is not redrawn. */
export function divsKey(pts: ReadonlyArray<readonly [number, number]>): string {
  let h = 2166136261;
  for (const [x, y] of pts) {
    h = Math.imul(h ^ Math.round(x * 200), 16777619);
    h = Math.imul(h ^ Math.round(y * 200), 16777619);
  }
  return `${pts.length}:${(h >>> 0).toString(36)}`;
}

/** the y (divisions from the centre) of a voltage on a channel, unclamped */
export const vToDiv = (v: number, vs: VScale) => v / vs.vdiv + (vs.pos ?? 0);
/** the x (divisions from the left) of a time */
export const tToDiv = (t: number, tb: TimeBase) => (t - (tb.start ?? 0)) / tb.div;
