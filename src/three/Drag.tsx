// Drag-to-move in select mode: press on a placed part and drag it to other holes (a jumper wire
// grabbed near one end moves only that end). A translucent preview follows the pointer, red when
// the drop would be rejected; releasing calls the store's movePart (validated, one undo step).
// Off-board equipment (battery, bench supply, generator, ammeter) grabbed by its body moves freely
// around the bench instead (its leads stay plugged in); grabbed at a lead's end, that lead moves.
// Also here: which part a right click landed on (the bench's context menu) and eraser strokes.

import type { ThreeEvent } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { create } from 'zustand';
import { HOLES, HOLE_MAP } from '../core/breadboard';
import { PARTS } from '../core/parts';
import type { BenchPose, PlacedPart } from '../core/types';
import { useBenchUi } from '../state/benchUi';
import { moveError, useStore } from '../state/store';
import type { PartCtxValue } from './common';
import { PartView } from './Parts';
import { assignSlots, benchPose, isBenchPart } from './slots';
import { rowIndex, shiftHole } from './touchPick';

interface Drag {
  part: PlacedPart;
  /** hole nearest to where the part was grabbed */
  grab: string;
  /** a jumper-wire end being moved alone, or null to move the whole part */
  end: string | null;
  /** board-plane offset from the press point to the grabbed hole (keeps the part under the cursor) */
  dx: number;
  dz: number;
  /** footprint parts: the anchor hole whose footprint the part occupies */
  anchor: string | null;
  /** client coordinates of the press (the drag starts after a few pixels) */
  x0: number;
  y0: number;
  active: boolean;
  /** pins at the current pointer position (null: nowhere valid to show) */
  pins: Record<string, string> | null;
  /** an off-board body being moved: where it would stand, and the press point's offset from it */
  body: { pose: BenchPose; ox: number; oz: number } | null;
}

/** The part the last right-button press landed on (read by the bench's context menu on release;
 *  the stage clears it at the start of every press). */
export const rightPick: { id: string | null } = { id: null };

/** Pointer travel of the current press, so a click that ends a drag (a pan) isn't taken as a click. */
const press = { x: 0, y: 0, moved: false };
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    (e) => {
      press.x = e.clientX;
      press.y = e.clientY;
      press.moved = false;
      // an eraser stroke can start anywhere on the board, not only on a part
      if (e.button === 0 && (e.target as Element | null)?.tagName === 'CANVAS' && useStore.getState().tool === 'eraser') erasing = true;
    },
    true,
  );
  window.addEventListener('pointermove', (e) => !press.moved && e.buttons && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 5 && (press.moved = true), true);
}
export const pressWasDrag = () => press.moved;

/** Eraser: a stroke is in progress (the left button went down on a part or the board). */
let erasing = false;
if (typeof window !== 'undefined') {
  const stop = () => (erasing = false);
  window.addEventListener('pointerup', stop, true);
  window.addEventListener('pointercancel', stop, true);
}

/** Pointer entering / leaving a part: the eraser tints it, and erases it while a stroke is held. */
export function hoverPart(part: PlacedPart, on: boolean, e: ThreeEvent<PointerEvent>) {
  if (useStore.getState().tool !== 'eraser') return;
  const ui = useBenchUi.getState();
  if (on) {
    e.stopPropagation();
    if (erasing && e.buttons & 1) useStore.getState().erasePart(part.id);
    else if (ui.eraseHover !== part.id) ui.setEraseHover(part.id);
  } else if (ui.eraseHover === part.id) ui.setEraseHover(null);
}

/** The OrbitControls of the scene (set by DragLayer), so grabPart can pause them. */
const sceneControls: { current: { enabled: boolean } | null } = { current: null };

const useDrag = create<{ drag: Drag | null }>(() => ({ drag: null }));
const setDrag = (d: Drag | null) => useDrag.setState({ drag: d });

const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hitPoint = new THREE.Vector3();

/** Nearest hole to a point on the board plane (within `reach`, ~a pitch), or null. */
export function nearestHole(p: { x: number; z: number }, reach = 0.8): string | null {
  let best: string | null = null;
  let bd = reach * reach;
  for (const h of HOLES) {
    const d = (h.x - p.x) ** 2 + (h.z - p.z) ** 2;
    if (d < bd) {
      bd = d;
      best = h.id;
    }
  }
  return best;
}

/** Pins of the dragged part if the grabbed hole were dropped on `to`. */
function targetPins(d: Drag, to: string): Record<string, string> | null {
  const { part } = d;
  if (d.end) {
    const key = Object.keys(part.pins).find((k) => part.pins[k] === d.end);
    return key ? { ...part.pins, [key]: to } : null;
  }
  const g = HOLE_MAP.get(d.grab)!;
  const t = HOLE_MAP.get(to)!;
  const dc = t.col - g.col;
  const dr = rowIndex(t.row) - rowIndex(g.row);
  const def = PARTS[part.type];
  if (def.placement.kind === 'footprint') {
    // footprints usually pin their anchor to one row (dev boards): fall back to a sideways move
    const fp = def.placement.footprint;
    for (const r of dr === 0 ? [0] : [dr, 0]) {
      const a = d.anchor ? shiftHole(d.anchor, dc, r) : null;
      const pins = a ? fp(a) : null;
      if (pins) return pins;
    }
    return null;
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(part.pins)) {
    const n = shiftHole(v, dc, dr);
    if (!n) return null;
    out[k] = n;
  }
  return out;
}

const samePins = (a: Record<string, string>, b: Record<string, string>) => Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([k, v]) => b[k] === v);

/** Start a (potential) drag: pointer pressed on a placed part. Stable; passed to PartView. */
export function grabPart(part: PlacedPart, e: ThreeEvent<PointerEvent>) {
  if (e.button === 2) {
    rightPick.id = part.id;
    return;
  }
  const tool = useStore.getState().tool;
  if (tool === 'eraser' && e.button === 0) {
    e.stopPropagation();
    erasing = true;
    useBenchUi.getState().setEraseHover(null);
    useStore.getState().erasePart(part.id);
    return;
  }
  if (tool !== 'select' || e.button !== 0) return;
  if (!e.ray.intersectPlane(plane, hitPoint)) return;
  const pinHoles = Object.values(part.pins).filter((h) => HOLE_MAP.has(h));
  if (pinHoles.length === 0) return;
  // grabbed hole: nearest pin hole for the whole part (so the part moves in whole pitches)
  let grab = pinHoles[0];
  let gd = Infinity;
  for (const id of pinHoles) {
    const h = HOLE_MAP.get(id)!;
    const d = Math.hypot(h.x - hitPoint.x, h.z - hitPoint.z);
    if (d < gd) {
      gd = d;
      grab = id;
    }
  }
  let end: string | null = null;
  if (part.type === 'wire' && pinHoles.length === 2) {
    const [a, b] = pinHoles.map((id) => HOLE_MAP.get(id)!);
    const len = Math.hypot(a.x - b.x, a.z - b.z);
    if (gd < Math.min(1.5, len * 0.35)) end = grab;
  }
  if (isBenchPart(part.type)) {
    e.stopPropagation();
    const controls = sceneControls.current;
    if (controls) controls.enabled = false;
    const gh = HOLE_MAP.get(grab)!;
    if (gd < 1.5) {
      // at a lead's plug: re-plug that lead
      setDrag({
        part,
        grab,
        end: grab,
        anchor: null,
        dx: gh.x - hitPoint.x,
        dz: gh.z - hitPoint.z,
        x0: e.nativeEvent.clientX,
        y0: e.nativeEvent.clientY,
        active: false,
        pins: null,
        body: null,
      });
    } else {
      // the body: move it around the bench
      const { pose } = benchPose(part, assignSlots(useStore.getState().layout.parts).get(part.id) ?? 0);
      setDrag({
        part,
        grab,
        end: null,
        anchor: null,
        dx: 0,
        dz: 0,
        x0: e.nativeEvent.clientX,
        y0: e.nativeEvent.clientY,
        active: false,
        pins: null,
        body: { pose, ox: pose.x - hitPoint.x, oz: pose.z - hitPoint.z },
      });
    }
    return;
  }
  let anchor: string | null = null;
  const def = PARTS[part.type];
  if (!end && def.placement.kind === 'footprint') {
    const fp = def.placement.footprint;
    anchor =
      HOLES.find((h) => {
        const f = fp(h.id);
        return !!f && samePins(f, part.pins);
      })?.id ?? null;
    if (!anchor) return; // unknown shape: leave the part alone
  }
  e.stopPropagation();
  // hold the camera still while the part is being dragged (OrbitControls reads this on its own pointerdown)
  const controls = sceneControls.current;
  if (controls) controls.enabled = false;
  const gh = HOLE_MAP.get(grab)!;
  setDrag({ part, grab, end, anchor, dx: gh.x - hitPoint.x, dz: gh.z - hitPoint.z, x0: e.nativeEvent.clientX, y0: e.nativeEvent.clientY, active: false, pins: null, body: null });
}

const PREVIEW_OK: PartCtxValue = { ghost: true, tint: 'none' };
const PREVIEW_BAD: PartCtxValue = { ghost: true, tint: 'error' };

/** Tracks the pointer during a drag, draws the preview, commits the move on release. */
export function DragLayer() {
  const drag = useDrag((s) => s.drag);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const raycaster = useThree((s) => s.raycaster);
  const controls = useThree((s) => s.controls) as unknown as { enabled: boolean } | null;
  const invalidate = useThree((s) => s.invalidate);
  const layout = useStore((s) => s.layout);
  sceneControls.current = controls;

  const dragging = !!drag;
  useEffect(() => {
    if (!dragging) return;
    const ndc = new THREE.Vector2();
    const move = (ev: PointerEvent) => {
      const d = useDrag.getState().drag;
      if (!d) return;
      if (!d.active && Math.hypot(ev.clientX - d.x0, ev.clientY - d.y0) < 5) return;
      const r = gl.domElement.getBoundingClientRect();
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (d.body) {
        if (!raycaster.ray.intersectPlane(plane, hitPoint)) return;
        const r = (v: number) => Math.round(v * 10) / 10;
        const pose = { ...d.body.pose, x: r(Math.max(-60, Math.min(60, hitPoint.x + d.body.ox))), z: r(Math.max(-45, Math.min(45, hitPoint.z + d.body.oz))) };
        setDrag({ ...d, active: true, body: { ...d.body, pose } });
        invalidate();
        return;
      }
      const to = raycaster.ray.intersectPlane(plane, hitPoint) ? nearestHole(hitPoint.add(new THREE.Vector3(d.dx, 0, d.dz))) : null;
      if (!to) {
        // between holes (trench, off the board): keep the last target, just start the drag
        if (!d.active) setDrag({ ...d, active: true });
        return;
      }
      const pins = targetPins(d, to);
      if (d.active && (pins === d.pins || (pins && d.pins && samePins(pins, d.pins)))) return;
      setDrag({ ...d, active: true, pins });
      invalidate();
    };
    const up = () => {
      const d = useDrag.getState().drag;
      setDrag(null);
      if (controls) controls.enabled = true;
      invalidate();
      if (!d?.active) return; // a plain click: selection is handled by the part's onClick
      const st = useStore.getState();
      if (d.body) {
        st.setPose(d.part.id, d.body.pose);
        st.select(d.part.id);
        return;
      }
      if (d.pins && !samePins(d.pins, d.part.pins)) st.movePart(d.part.id, d.pins);
      st.select(d.part.id);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging, camera, gl, raycaster, controls, invalidate]);

  const slot = drag ? (assignSlots(layout.parts).get(drag.part.id) ?? 0) : 0;
  if (drag?.active && drag.body) return <PartView part={{ ...drag.part, id: 'drag-preview', pose: drag.body.pose }} slot={slot} ctx={PREVIEW_OK} label={false} />;
  const preview = drag?.active && drag.pins ? { ...drag.part, id: 'drag-preview', pins: drag.pins } : null;
  if (!drag || !preview) return null;
  const ok = moveError(layout, drag.part.id, preview.pins) === null;
  return <PartView part={preview} slot={slot} ctx={ok ? PREVIEW_OK : PREVIEW_BAD} label={false} />;
}
