// Bench actions shared by the details popover, the right-click menu and the keyboard: turn an
// off-board instrument, swap a two-legged part's legs.

import { tr } from '../core/i18n';
import { PARTS } from '../core/parts';
import { useStore } from '../state/store';
import { assignSlots, benchPose, isBenchPart, turned } from './slots';

/** Turn an off-board part a quarter turn about its centre (one undo step). */
export function turnBenchPart(id: string): boolean {
  const s = useStore.getState();
  const part = s.layout.parts.find((p) => p.id === id);
  if (!part || !isBenchPart(part.type)) return false;
  const { pose } = benchPose(part, assignSlots(s.layout.parts).get(id) ?? 0);
  s.setPose(id, turned(pose));
  return true;
}

/** Two legs, swapped (an LED / diode / battery flips its polarity). Null for other parts. */
export function swappedPins(id: string): Record<string, string> | null {
  const part = useStore.getState().layout.parts.find((p) => p.id === id);
  if (!part) return null;
  const def = PARTS[part.type];
  if (def.placement.kind !== 'two-point') return null;
  const [a, b] = def.placement.pins;
  if (!part.pins[a] || !part.pins[b]) return null;
  return { [a]: part.pins[b], [b]: part.pins[a] };
}

export function swapLegs(id: string) {
  const pins = swappedPins(id);
  const s = useStore.getState();
  const part = s.layout.parts.find((p) => p.id === id);
  if (!pins || !part) return;
  if (s.movePart(id, pins)) s.notify(tr(`${part.ref} 两只脚已对调`, `${part.ref}: legs swapped`));
}
