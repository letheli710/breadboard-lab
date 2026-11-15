// Where off-board equipment sits on the "bench" around the breadboard.
// Batteries, bench supplies, function generators and handheld meters (ammeters) share one
// sequence of spots behind / left of the board, in the order they were placed.

import * as THREE from 'three';
import { BOARD } from '../core/breadboard';
import type { BenchPose, PartType, PlacedPart } from '../core/types';

export type SlotKind = 'bench';

export function slotKind(t: PartType): SlotKind | null {
  if (t === 'battery' || t === 'bench_supply' || t === 'function_gen' || t === 'ammeter') return 'bench';
  return null;
}

export function slotPosition(slot: number, _kind: SlotKind = 'bench'): THREE.Vector3 {
  const back = -BOARD.depth / 2 - 4.5;
  const left = -BOARD.width / 2 - 5.5;
  const slots = [new THREE.Vector3(-9, 0, back), new THREE.Vector3(3, 0, back), new THREE.Vector3(14, 0, back), new THREE.Vector3(left, 0, -3), new THREE.Vector3(left, 0, 6)];
  return slots[slot % slots.length].clone();
}

/** part id → slot index within its kind's sequence */
export function assignSlots(parts: PlacedPart[]): Map<string, number> {
  const m = new Map<string, number>();
  const n: Record<SlotKind, number> = { bench: 0 };
  for (const p of parts) {
    const k = slotKind(p.type);
    if (k) m.set(p.id, n[k]++);
  }
  return m;
}

/** The slot a newly placed part of this type would get. */
export function nextSlot(parts: PlacedPart[], t: PartType): number {
  const k = slotKind(t);
  return k ? parts.filter((p) => slotKind(p.type) === k).length : 0;
}

/** Off-board equipment the student can move around the bench and turn (battery, bench supply,
 *  function generator, ammeter). */
export const isBenchPart = (t: PartType) => slotKind(t) === 'bench';

const Y = new THREE.Vector3(0, 1, 0);

/** Where an off-board part's body stands (the default spot of its slot unless the student moved
 *  it) and its turn about the vertical axis in radians. */
export function benchPose(part: PlacedPart, slot: number): { pos: THREE.Vector3; rot: number; pose: BenchPose } {
  const pose: BenchPose = part.pose ?? { ...xz(slotPosition(slot)), rot: 0 };
  return { pos: new THREE.Vector3(pose.x, 0, pose.z), rot: (pose.rot * Math.PI) / 2, pose };
}
const xz = (v: THREE.Vector3) => ({ x: v.x, z: v.z });

/** A point given in the body's own frame, on the bench. */
export function onBench(pos: THREE.Vector3, rot: number, local: THREE.Vector3): THREE.Vector3 {
  return local.clone().applyAxisAngle(Y, rot).add(pos);
}

/** The pose a quarter turn on (clockwise seen from above), about the body's centre. */
export function turned(pose: BenchPose): BenchPose {
  return { ...pose, rot: (pose.rot + 3) % 4 };
}
