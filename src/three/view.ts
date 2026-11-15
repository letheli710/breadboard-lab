// Where breadboard holes are on screen, for 2D overlays that must stay clear of them (the scope
// window avoids the current step's holes). The 3D scene registers a projector and bumps the
// version when the camera or the canvas size changes; overlays subscribe.

export type HoleProjector = (hole: string) => { x: number; y: number } | null;
/** client coordinates of a point in the scene */
export type PointProjector = (x: number, y: number, z: number) => { x: number; y: number } | null;

let projector: HoleProjector | null = null;
let pointProjector: PointProjector | null = null;

export function setPointProjector(p: PointProjector | null) {
  pointProjector = p;
  bumpView();
}
export const projectPoint: PointProjector = (x, y, z) => pointProjector?.(x, y, z) ?? null;
let version = 0;
let queued = false;
const subs = new Set<() => void>();

export function setHoleProjector(p: HoleProjector | null) {
  projector = p;
  bumpView();
}

/** the camera or the canvas changed: overlays re-measure (at most once per frame) */
export function bumpView() {
  if (queued) return;
  queued = true;
  const run = () => {
    queued = false;
    version++;
    for (const f of subs) f();
  };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
  else run();
}

/** client coordinates of a hole, or null (no scene, unknown hole) */
export const projectHole = (hole: string) => projector?.(hole) ?? null;

export function subscribeView(f: () => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}
export const getViewVersion = () => version;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Pick the overlay's corner inside `area`: the first of bottom-right, bottom-left, top-right,
 * top-left whose rectangle (with `margin`) covers none of `points`; else the one covering the
 * fewest. Returns the offset from the bottom-right corner and how many points it still covers.
 */
export function pickCorner(area: Rect, size: { w: number; h: number }, points: { x: number; y: number }[], margin = 14): { dx: number; dy: number; covered: number } {
  const left = -(area.w - size.w - 2 * margin);
  const up = -(area.h - size.h - 2 * margin);
  const cands = [
    { dx: 0, dy: 0 },
    { dx: Math.min(0, left), dy: 0 },
    { dx: 0, dy: Math.min(0, up) },
    { dx: Math.min(0, left), dy: Math.min(0, up) },
  ];
  let best = { ...cands[0], covered: Infinity };
  for (const c of cands) {
    const x0 = area.x + area.w - margin - size.w + c.dx - 8;
    const y0 = area.y + area.h - margin - size.h + c.dy - 8;
    const covered = points.filter((p) => p.x >= x0 && p.x <= x0 + size.w + 16 && p.y >= y0 && p.y <= y0 + size.h + 16).length;
    if (covered < best.covered) best = { ...c, covered };
    if (covered === 0) break;
  }
  return best;
}
