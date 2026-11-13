// Practice progress: how each question was solved, saved-data migration, and export / import.
// Pure functions; the zustand store (store.ts) holds the state and persists it.

/** How a question was finally answered correctly. Only 'unaided' and 'retried' count as done;
 *  'revealed' (after "Show answer", or by elimination in multiple choice) counts as reviewed. */
export type QStatus = 'unaided' | 'retried' | 'revealed';

export interface QProgress {
  status?: QStatus;
  /** wrong numeric attempts / wrong choices before it was solved */
  wrong?: number;
  /** the answer was shown before it was solved */
  revealed?: boolean;
  /** multiple choice: the distinct wrong options picked, in order (the first is the first wrong pick) */
  picks?: number[];
}

/** question id → progress */
export type PracticeRecord = Record<string, QProgress>;

export type PracticeEvent =
  | { kind: 'wrong'; choice?: number }
  | { kind: 'reveal' }
  /** `choices`: number of options of a multiple-choice question (to detect solving by elimination) */
  | { kind: 'right'; choices?: number };

const RANK: Record<QStatus, number> = { unaided: 0, retried: 1, revealed: 2 };
const better = (a: QStatus | undefined, b: QStatus | undefined): QStatus | undefined => (!a ? b : !b ? a : RANK[a] <= RANK[b] ? a : b);
const isStatus = (v: unknown): v is QStatus => v === 'unaided' || v === 'retried' || v === 'revealed';

/** Apply one attempt to a question's progress. Once solved, the status never gets worse. */
export function applyEvent(p: QProgress | undefined, ev: PracticeEvent): QProgress {
  const cur: QProgress = { ...p };
  if (cur.status) {
    // already solved: later attempts don't change how it was solved
    return cur;
  }
  if (ev.kind === 'wrong') {
    cur.wrong = (cur.wrong ?? 0) + 1;
    if (ev.choice !== undefined && !(cur.picks ?? []).includes(ev.choice)) cur.picks = [...(cur.picks ?? []), ev.choice];
  } else if (ev.kind === 'reveal') cur.revealed = true;
  else {
    // multiple choice where every other option was already tried: that's elimination, not knowledge
    const eliminated = ev.choices !== undefined && (cur.picks?.length ?? 0) >= ev.choices - 1;
    cur.status = cur.revealed || eliminated ? 'revealed' : cur.wrong ? 'retried' : 'unaided';
  }
  return cur;
}

/** Status of a whole problem: null until every question is solved; else the worst question status. */
export function problemStatus(rec: PracticeRecord | undefined, qids: string[]): QStatus | null {
  if (!rec || !qids.length) return null;
  let worst: QStatus = 'unaided';
  for (const q of qids) {
    const s = rec[q]?.status;
    if (!s) return null;
    if (RANK[s] > RANK[worst]) worst = s;
  }
  return worst;
}

/** Counts toward the progress number ("done"): solved without looking at the answer. */
export const countsAsDone = (s: QStatus | null | undefined) => s === 'unaided' || s === 'retried';

/** Read saved answers of any version. Version 1 stored `true` per solved question: it becomes
 *  'unaided' (how it was solved wasn't recorded, so the student keeps the credit). */
export function migrateAnswers(raw: unknown): Record<string, PracticeRecord> {
  const out: Record<string, PracticeRecord> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [pid, rec] of Object.entries(raw as Record<string, unknown>)) {
    if (!rec || typeof rec !== 'object') continue;
    const r: PracticeRecord = {};
    for (const [qid, v] of Object.entries(rec as Record<string, unknown>)) {
      if (v === true) r[qid] = { status: 'unaided' };
      else if (v && typeof v === 'object') {
        const o = v as Record<string, unknown>;
        const p: QProgress = {};
        if (isStatus(o.status)) p.status = o.status;
        if (typeof o.wrong === 'number' && o.wrong > 0) p.wrong = Math.floor(o.wrong);
        if (o.revealed === true) p.revealed = true;
        if (Array.isArray(o.picks)) p.picks = o.picks.filter((x): x is number => Number.isInteger(x));
        if (Object.keys(p).length) r[qid] = p;
      }
    }
    if (Object.keys(r).length) out[pid] = r;
  }
  return out;
}

/** Merge imported progress into the current one, keeping the better result per question. */
export function mergeAnswers(a: Record<string, PracticeRecord>, b: Record<string, PracticeRecord>): Record<string, PracticeRecord> {
  const out: Record<string, PracticeRecord> = { ...a };
  for (const [pid, rec] of Object.entries(b)) {
    const r: PracticeRecord = { ...out[pid] };
    for (const [qid, p] of Object.entries(rec)) {
      const c = r[qid];
      if (!c) r[qid] = p;
      else {
        const status = better(c.status, p.status);
        // the attempt details belong to whichever record has the kept status
        r[qid] = status && status === p.status && status !== c.status ? p : c;
      }
    }
    out[pid] = r;
  }
  return out;
}

export const PRACTICE_EXPORT_FORMAT = 'breadboard-lab-practice/1';

export interface PracticeExport {
  format: typeof PRACTICE_EXPORT_FORMAT;
  exported: string;
  /** problem id → done (every question solved without revealing) */
  done: Record<string, boolean>;
  answers: Record<string, PracticeRecord>;
}

export function exportPractice(done: Record<string, boolean>, answers: Record<string, PracticeRecord>, now = new Date()): PracticeExport {
  return { format: PRACTICE_EXPORT_FORMAT, exported: now.toISOString(), done, answers };
}

/** Parse an exported progress file (null if it isn't one). */
export function parsePracticeExport(json: unknown): { done: Record<string, boolean>; answers: Record<string, PracticeRecord> } | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if (o.format !== PRACTICE_EXPORT_FORMAT) return null;
  const done: Record<string, boolean> = {};
  if (o.done && typeof o.done === 'object') for (const [k, v] of Object.entries(o.done as Record<string, unknown>)) if (v === true) done[k] = true;
  return { done, answers: migrateAnswers(o.answers) };
}
