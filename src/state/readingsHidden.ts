// While a lab still has unanswered measurement questions, the app's debug readouts of the
// simulation (node voltages in the netlist / schematic / hole tooltip, part currents and
// voltages in the inspector and part labels) are hidden: the student is meant to read those
// numbers off the instruments (ammeter, multimeter, scope), which keep working. Once every
// required question is answered correctly they come back. Labs without questions, lessons
// and the sandbox are unaffected.

import type { Challenge } from '../core/challenge';
import type { ChallengeReadings } from '../core/readings';
import { useActiveChallenge } from './challenges';
import { useStore } from './store';

export function readingsHidden(ch: Pick<Challenge, 'kind' | 'measurements'> | null, rd: ChallengeReadings | undefined): boolean {
  if (!ch || ch.kind === 'lesson' || !ch.measurements.length) return false;
  return ch.measurements.some((q) => q.required && !rd?.answers[q.id]?.ok);
}

export function useReadingsHidden(): boolean {
  const ch = useActiveChallenge();
  const rd = useStore((s) => (ch ? s.readings[ch.id] : undefined));
  return readingsHidden(ch, rd);
}

/** "—" in place of a simulated value while readings are hidden. */
export const HIDDEN = '—';
