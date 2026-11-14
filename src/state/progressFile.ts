// The practice-progress file (Export / Import progress in Practice). Version 2 adds the mistake
// notebook, review schedule and quiz history (state/mastery.ts); version-1 files (progress only)
// still import. Kept out of state/practice.ts so the entry chunk doesn't carry it.

import { sanitizeMastery, type Mastery } from './mastery';
import { PRACTICE_EXPORT_FORMAT, parsePracticeExport, type PracticeRecord } from './practice';

export const PROGRESS_FORMAT_V2 = 'breadboard-lab-practice/2';

export interface ProgressFileV2 {
  format: typeof PROGRESS_FORMAT_V2;
  exported: string;
  done: Record<string, boolean>;
  answers: Record<string, PracticeRecord>;
  mastery: Mastery;
}

export function exportProgress(done: Record<string, boolean>, answers: Record<string, PracticeRecord>, mastery: Mastery, now = new Date()): ProgressFileV2 {
  return { format: PROGRESS_FORMAT_V2, exported: now.toISOString(), done, answers, mastery };
}

/** Parse a progress file of either version (null if it isn't one). `mastery` is null for version 1. */
export function parseProgress(json: unknown): { done: Record<string, boolean>; answers: Record<string, PracticeRecord>; mastery: Mastery | null } | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if (o.format === PRACTICE_EXPORT_FORMAT) {
    const p = parsePracticeExport(o);
    return p && { ...p, mastery: null };
  }
  if (o.format !== PROGRESS_FORMAT_V2) return null;
  // the progress part has the version-1 shape
  const p = parsePracticeExport({ ...o, format: PRACTICE_EXPORT_FORMAT });
  return p && { ...p, mastery: sanitizeMastery(o.mastery) ?? null };
}
