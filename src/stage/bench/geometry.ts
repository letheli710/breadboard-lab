// Pure geometry of the shared bench instruments (no three.js, no React): board points, an
// instrument's local → world transform, and the paths of the leads between an instrument and the
// board. All in the board units of BreadboardXray (1 unit = 2.54 mm; the board's top at y = 0, the
// bench top at y = −1, the board's long side along x, +z towards the viewer).

import { colX, RAIL_Z, ROW_Z } from '../BreadboardXray';

export type V3 = [number, number, number];

/**
 * A point on the board:
 *  - a hole: 'a10', 'j63' (row letter + column);
 *  - a rail hole: 'T+3' top outer (red +), 'T-4' top inner (blue −), 'B+3' bottom inner (red +),
 *    'B-4' bottom outer (blue −) — the convention of every World 2–5 bench;
 *  - board coordinates [x, z].
 */
export type BoardPoint = string | [number, number];

/** The bench top: instruments stand on it (the board's own body is 1 unit thick). */
export const BENCH_Y = -1;

/** [x, z] of a board point. Throws on a malformed hole name (a typo should fail loudly in tests). */
export function boardXZ(p: BoardPoint): [number, number] {
  if (typeof p !== 'string') return p;
  const m = /^([TB])([+-])(\d+)$/.exec(p);
  if (m) {
    const top = m[1] === 'T';
    const z = top ? (m[2] === '+' ? RAIL_Z.tp : RAIL_Z.tn) : m[2] === '+' ? RAIL_Z.bp : RAIL_Z.bn;
    return [colX(Number(m[3])), z];
  }
  const h = /^([a-j])(\d+)$/.exec(p);
  if (!h) throw new Error(`not a board point: ${p}`);
  return [colX(Number(h[2])), ROW_Z[h[1]]];
}

/** Where an instrument stands: box centre [x, z] on the bench, a turn about the vertical, a size. */
export interface Placement {
  position: [number, number];
  /** turn about +y in radians; 0 = the front panel faces +z (towards the viewer) */
  yaw?: number;
  /** uniform size factor (1 = the standard instrument) */
  scale?: number;
}

/** A point given in the instrument's own frame (x right, y up from the bench, z out of the front) in world space. */
export function toWorld(pl: Placement, local: V3): V3 {
  const yaw = pl.yaw ?? 0;
  const s = pl.scale ?? 1;
  const c = Math.cos(yaw);
  const n = Math.sin(yaw);
  const [x, y, z] = [local[0] * s, local[1] * s, local[2] * s];
  return [pl.position[0] + x * c + z * n, BENCH_Y + y, pl.position[1] - x * n + z * c];
}

/** The direction the front panel faces, in world space (unit, horizontal). */
export function frontDir(pl: Placement): V3 {
  const yaw = pl.yaw ?? 0;
  return [Math.sin(yaw), 0, Math.cos(yaw)];
}

const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

/** horizontal unit vector from (x, z) towards (tx, tz); +z if they coincide */
function towards(x: number, z: number, tx: number, tz: number): [number, number] {
  const d = Math.hypot(tx - x, tz - z);
  return d < 1e-6 ? [0, 1] : [(tx - x) / d, (tz - z) / d];
}

/** how high a lead arcs over the bench for a run of `dist` units */
export const arcLift = (dist: number) => Math.min(5, 1.8 + dist * 0.09);

/**
 * A lead plugged straight into a hole (a supply lead ending in a stripped tip): out of the
 * terminal along `out`, an arc over the bench, then down into the hole.
 */
export function plugPath(from: V3, out: V3, to: BoardPoint, via: V3[] = []): V3[] {
  const [x, z] = boardXZ(to);
  const lead = add(from, out, 1.4);
  lead[1] = from[1] + 0.25;
  const [ux, uz] = towards(x, z, from[0], from[2]);
  const mid: V3[] = via.length ? via : [[(lead[0] + x) / 2, arcLift(Math.hypot(x - from[0], z - from[2])), (lead[2] + z) / 2]];
  return [from, lead, ...mid, [x + ux * 0.4, 2.0, z + uz * 0.4], [x, 0.9, z], [x, -0.3, z]];
}

/** Where an alligator clip bites on a board point: over a short stub wire standing in the hole. */
export function clipAt(to: BoardPoint): V3 {
  const [x, z] = boardXZ(to);
  return [x + 0.15, 1.5, z];
}

/**
 * A lead ending in an alligator clip (generator output, probe ground): out of the terminal along
 * `out`, an arc (or the given waypoints), then down onto the top of the clip at `clip`.
 */
export function clipPath(from: V3, out: V3, clip: V3, via: V3[] = []): V3[] {
  const [x, , z] = clip;
  const lead: V3 = [from[0] + out[0] * 1.5 + 1.6 * out[2], Math.max(from[1] + 1.0, 1.2), from[2] + out[2] * 1.5 - 1.6 * out[0]];
  const [ux, uz] = towards(x, z, from[0], from[2]);
  const mid: V3[] = via.length ? via : [[(lead[0] + x) / 2, arcLift(Math.hypot(x - from[0], z - from[2])), (lead[2] + z) / 2]];
  return [from, lead, ...mid, [x + ux * 1.1, clip[1] + 0.9, z + uz * 1.1], [x, clip[1] + 0.5, z]];
}

/** A scope probe's cable: from the top of the probe body at the tip hole, up, over, down to the jack. */
export function probeCablePath(tip: [number, number], jack: V3, out: V3): V3[] {
  const [x, z] = tip;
  const [ux, uz] = towards(x, z, jack[0], jack[2]);
  return [
    [x, 3.4, z],
    [x + ux * 1.2, 6.2, z + uz * 1.2],
    [(x + jack[0]) / 2, 6.5, (z + jack[2]) / 2],
    [jack[0] + out[0] * 2.6, 2.6, jack[2] + out[2] * 2.6],
    [jack[0] + out[0] * 0.4, jack[1], jack[2] + out[2] * 0.4],
  ];
}

/** A probe's ground lead: from the probe body down to its clip. */
export function groundLeadPath(tip: [number, number], clip: V3): V3[] {
  const [x, z] = tip;
  return [
    [x, 2.0, z + 0.2],
    [(x + clip[0]) / 2, Math.max(clip[1], 1.2) + 1.4, (z + clip[2]) / 2],
    [clip[0], clip[1] + 0.6, clip[2]],
  ];
}
