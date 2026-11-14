// Mastery: the mistake notebook (错题本), the spaced-review schedule over it, and quiz history.
// Pure functions — the clock is passed in (`Now`), so every transition is unit-tested with fixed
// dates; the zustand store that holds and saves this is state/masteryStore.ts.
//
// Notebook. A question part enters the notebook the first time it is answered wrong (a numeric
// value that is not accepted, a wrong option) or its answer is revealed — in normal practice, in a
// blind retry, in a review or in a quiz. Each entry keeps what was entered, the mistake the
// checker recognised (sign, ×10³, √2 …), when, and how it was resolved. It stays in the *active*
// list until it is answered correctly at the first try on a LATER calendar day than its last
// mistake; after that it is history (never deleted by being resolved; see `pruneMastery`).
//
// Review schedule (Leitner boxes). Every entry sits in a box 1–4; an entry in box b is due
// INTERVALS[b − 1] days after it got there (1, 3, 7, 21). Correct at the first try on a day it is
// due → next box; after box 4 it is *mastered* (box 5, no longer scheduled). Any mistake → back to
// box 1, due tomorrow. A mistake made today can't be cleared today: "tomorrow" is the earliest
// retry that counts, so "I just looked at the answer" is never mistaken for knowing it.

import { addDays, daysBetween, isDay } from './clock';
import type { PracticeRecord } from './practice';

/** what the answer checker (core/problem/answer.ts) recognised */
export const DIAGNOSES = ['sign', 'close', 'e3', 'e6', 'e9', 'sqrt2', 'sqrt3', '2pi', 'recip', 'rad', 'phase180'] as const;
/** + a wrong value with no recognised pattern, a wrong option, a revealed answer, a quiz question
 *  left blank, and mistakes saved before the notebook existed (no details) */
export const MISTAKE_TYPES = [...DIAGNOSES, 'wrong', 'choice', 'revealed', 'blank', 'old'] as const;
export type MistakeType = (typeof MISTAKE_TYPES)[number];
export const isMistakeType = (v: unknown): v is MistakeType => typeof v === 'string' && (MISTAKE_TYPES as readonly string[]).includes(v);

/** where an attempt happened */
export const VIAS = ['practice', 'retry', 'review', 'quiz'] as const;
export type Via = (typeof VIAS)[number];

export interface Attempt {
  /** epoch ms */
  at: number;
  /** local calendar day "YYYY-MM-DD" */
  day: string;
  via: Via;
  ok: boolean;
  /** what was entered (numeric: the text, ≤ INPUT_MAX chars; multiple choice: "B") */
  input?: string;
  type?: MistakeType;
}

export interface Note {
  pid: string;
  qid: string;
  /** day of the first mistake */
  first: string;
  /** day of the latest mistake */
  lastWrong: string;
  /** Leitner box 1–4; 5 = mastered (no longer scheduled) */
  box: number;
  /** day the entry is due for review */
  due: string;
  /** day it left the active list (correct at the first try on a later day); unset = active */
  resolved?: string;
  /** mistakes recorded (wrong answers + reveals) */
  wrongs: number;
  /** times it came back after being resolved */
  lapses: number;
  /** how often each kind of mistake was made */
  types: Partial<Record<MistakeType, number>>;
  /** the first attempt and the latest ones (LOG_MAX in all) */
  log: Attempt[];
}

export interface QuizItemResult {
  pid: string;
  qid: string;
  ok: boolean;
  input?: string;
  type?: MistakeType;
}

export interface QuizRecord {
  id: string;
  /** submitted, epoch ms */
  at: number;
  /** chapter ids; empty with `weak` for "due + weak areas" */
  chapters: string[];
  weak?: boolean;
  n: number;
  correct: number;
  /** time taken */
  seconds: number;
  /** time limit in seconds, 0 = none */
  limit: number;
  /** per-question results; dropped from all but the latest QUIZ_DETAIL_MAX quizzes */
  items?: QuizItemResult[];
}

export interface Mastery {
  v: 1;
  notes: Record<string, Note>;
  quizzes: QuizRecord[];
}

export interface Now {
  at: number;
  day: string;
}

export const INTERVALS = [1, 3, 7, 21] as const;
export const MASTERED = 5;
export const INPUT_MAX = 40;
export const LOG_MAX = 6;
/** pruning: resolved entries go first (mastered, then oldest), active ones only beyond NOTE_HARD_MAX */
export const NOTE_MAX = 400;
export const NOTE_HARD_MAX = 800;
export const QUIZ_MAX = 50;
export const QUIZ_DETAIL_MAX = 10;

export const emptyMastery = (): Mastery => ({ v: 1, notes: {}, quizzes: [] });
export const noteKey = (pid: string, qid: string) => `${pid}#${qid}`;

export type Outcome =
  | { kind: 'wrong'; type: MistakeType; input?: string }
  | { kind: 'reveal' }
  /** `unaided`: correct at the first try of this attempt (no wrong answer, no reveal before it) */
  | { kind: 'right'; unaided: boolean; input?: string };

const clip = (s: string | undefined) => (s === undefined ? undefined : s.length > INPUT_MAX ? s.slice(0, INPUT_MAX - 1) + '…' : s);

function pushLog(log: Attempt[], a: Attempt): Attempt[] {
  const l = [...log, a];
  return l.length > LOG_MAX ? [l[0], ...l.slice(l.length - (LOG_MAX - 1))] : l;
}

/** Apply one attempt to a notebook entry. Returns the new entry, or undefined when there is
 *  nothing to keep (a correct answer to a question that was never wrong). */
export function recordAttempt(note: Note | undefined, pid: string, qid: string, o: Outcome, via: Via, now: Now): Note | undefined {
  const { day, at } = now;
  if (o.kind === 'right') {
    if (!note) return undefined;
    const n: Note = { ...note, log: pushLog(note.log, { at, day, via, ok: true, ...(o.input !== undefined ? { input: clip(o.input) } : {}) }) };
    // only a first-try success on a later day than the last mistake, on or after the due day, counts
    if (o.unaided && daysBetween(note.lastWrong, day) >= 1 && note.box < MASTERED && day >= note.due) {
      n.box = note.box + 1;
      if (n.box < MASTERED) n.due = addDays(day, INTERVALS[n.box - 1]);
      if (!n.resolved) n.resolved = day;
    }
    return n;
  }
  const type: MistakeType = o.kind === 'reveal' ? 'revealed' : o.type;
  const input = o.kind === 'wrong' ? clip(o.input) : undefined;
  const a: Attempt = { at, day, via, ok: false, type, ...(input !== undefined ? { input } : {}) };
  const base: Note = note ?? { pid, qid, first: day, lastWrong: day, box: 1, due: day, wrongs: 0, lapses: 0, types: {}, log: [] };
  const n: Note = {
    ...base,
    lastWrong: day,
    box: 1,
    due: addDays(day, INTERVALS[0]),
    wrongs: base.wrongs + 1,
    lapses: base.lapses + (base.resolved ? 1 : 0),
    types: { ...base.types, [type]: (base.types[type] ?? 0) + 1 },
    log: pushLog(base.log, a),
  };
  delete n.resolved;
  return n;
}

export const isActive = (n: Note) => !n.resolved;
export const isDue = (n: Note, day: string) => n.box < MASTERED && n.due <= day;

/** Entries due for review on `day`: oldest due date first, then the lower box. */
export function dueNotes(m: Mastery, day: string): Note[] {
  return Object.values(m.notes)
    .filter((n) => isDue(n, day))
    .sort((a, b) => a.due.localeCompare(b.due) || a.box - b.box || a.first.localeCompare(b.first));
}

/** How the entry was last resolved: the latest correct attempt (if it is newer than the last mistake). */
export function lastFix(n: Note): Attempt | undefined {
  const last = n.log[n.log.length - 1];
  return last?.ok ? last : undefined;
}

export interface Count {
  active: number;
  total: number;
  /** mistakes of this kind (an entry can have several) */
  times: number;
}

/** Entries per chapter and per mistake type (active / all). */
export function notebookStats(m: Mastery, chapterOf: (pid: string) => string): { byChapter: Record<string, Count>; byType: Partial<Record<MistakeType, Count>> } {
  const byChapter: Record<string, Count> = {};
  const byType: Partial<Record<MistakeType, Count>> = {};
  const bump = (c: Count | undefined, active: boolean, times: number): Count => ({
    active: (c?.active ?? 0) + (active ? 1 : 0),
    total: (c?.total ?? 0) + 1,
    times: (c?.times ?? 0) + times,
  });
  for (const n of Object.values(m.notes)) {
    const ch = chapterOf(n.pid);
    byChapter[ch] = bump(byChapter[ch], isActive(n), n.wrongs);
    for (const [t, k] of Object.entries(n.types)) if (isMistakeType(t) && k) byType[t] = bump(byType[t], isActive(n), k);
  }
  return { byChapter, byType };
}

/** Chapters with the most active entries (weak areas), most first. */
export function weakChapters(m: Mastery, chapterOf: (pid: string) => string, max = 3): string[] {
  const { byChapter } = notebookStats(m, chapterOf);
  return Object.entries(byChapter)
    .filter(([, c]) => c.active > 0)
    .sort((a, b) => b[1].active - a[1].active || b[1].times - a[1].times || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([k]) => k);
}

/* ------------------------------------------------------------ saved progress → notebook */

/** Build the notebook from progress saved before it existed: every question part with a wrong
 *  attempt or a revealed answer becomes an active entry, due today. Its mistakes happened at an
 *  unknown earlier time (marked 'old', or 'choice' / 'revealed' when that is known), so they count
 *  as before today: a correct first try today already clears them. */
export function seedFromAnswers(answers: Record<string, PracticeRecord>, now: Now): Mastery {
  const m = emptyMastery();
  const before = addDays(now.day, -1);
  for (const [pid, rec] of Object.entries(answers)) {
    for (const [qid, p] of Object.entries(rec)) {
      const wrong = p.wrong ?? 0;
      const revealed = !!p.revealed || p.status === 'revealed';
      if (!wrong && !revealed) continue;
      const types: Partial<Record<MistakeType, number>> = {};
      const picks = p.picks?.length ?? 0;
      if (picks) types.choice = picks;
      if (wrong > picks) types.old = wrong - picks;
      if (revealed) types.revealed = 1;
      const log: Attempt[] = [{ at: now.at, day: before, via: 'practice', ok: false, type: revealed ? 'revealed' : picks ? 'choice' : 'old' }];
      if (p.picks?.length) log[0].input = p.picks.map((i) => String.fromCharCode(65 + i)).join(', ');
      if (p.status) log.push({ at: now.at, day: before, via: 'practice', ok: true });
      m.notes[noteKey(pid, qid)] = { pid, qid, first: before, lastWrong: before, box: 1, due: now.day, wrongs: wrong + (revealed ? 1 : 0), lapses: 0, types, log };
    }
  }
  return m;
}

/* ------------------------------------------------------------ validation (localStorage, import) */

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, max = 200): v is string => typeof v === 'string' && v.length > 0 && v.length <= max;
const nat = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;

function sanitizeAttempt(v: unknown): Attempt | null {
  if (!isObj(v) || !nat(v.at) || !isDay(v.day) || !(VIAS as readonly unknown[]).includes(v.via) || typeof v.ok !== 'boolean') return null;
  const a: Attempt = { at: v.at, day: v.day, via: v.via as Via, ok: v.ok };
  if (typeof v.input === 'string') a.input = clip(v.input);
  if (isMistakeType(v.type)) a.type = v.type;
  return a;
}

function sanitizeNote(v: unknown): Note | null {
  if (!isObj(v) || !str(v.pid) || !str(v.qid) || !isDay(v.first) || !isDay(v.lastWrong) || !isDay(v.due)) return null;
  if (!nat(v.box) || v.box < 1 || v.box > MASTERED) return null;
  const types: Partial<Record<MistakeType, number>> = {};
  if (isObj(v.types)) for (const [t, k] of Object.entries(v.types)) if (isMistakeType(t) && nat(k) && k > 0) types[t] = k;
  const log = (Array.isArray(v.log) ? v.log : [])
    .map(sanitizeAttempt)
    .filter((a): a is Attempt => !!a)
    .slice(-LOG_MAX);
  const n: Note = {
    pid: v.pid,
    qid: v.qid,
    first: v.first,
    lastWrong: v.lastWrong,
    box: v.box,
    due: v.due,
    wrongs: nat(v.wrongs) ? v.wrongs : 0,
    lapses: nat(v.lapses) ? v.lapses : 0,
    types,
    log,
  };
  if (isDay(v.resolved)) n.resolved = v.resolved;
  return n;
}

function sanitizeQuiz(v: unknown): QuizRecord | null {
  if (!isObj(v) || !str(v.id, 60) || !nat(v.at) || !nat(v.n) || !nat(v.correct) || v.correct > v.n || !nat(v.seconds) || !nat(v.limit)) return null;
  const chapters = Array.isArray(v.chapters) ? v.chapters.filter((c): c is string => str(c, 60)) : [];
  const q: QuizRecord = { id: v.id, at: v.at, chapters, n: v.n, correct: v.correct, seconds: v.seconds, limit: v.limit };
  if (v.weak === true) q.weak = true;
  if (Array.isArray(v.items)) {
    q.items = v.items
      .filter((x): x is Record<string, unknown> => isObj(x) && str(x.pid) && str(x.qid) && typeof x.ok === 'boolean')
      .map((x) => ({
        pid: x.pid as string,
        qid: x.qid as string,
        ok: x.ok as boolean,
        ...(typeof x.input === 'string' ? { input: clip(x.input) } : {}),
        ...(isMistakeType(x.type) ? { type: x.type } : {}),
      }));
  }
  return q;
}

/** Saved / imported mastery data, cleaned; undefined when it isn't mastery data at all. */
export function sanitizeMastery(v: unknown): Mastery | undefined {
  if (!isObj(v) || v.v !== 1) return undefined;
  const m = emptyMastery();
  if (isObj(v.notes))
    for (const x of Object.values(v.notes)) {
      const n = sanitizeNote(x);
      if (n) m.notes[noteKey(n.pid, n.qid)] = n;
    }
  if (Array.isArray(v.quizzes)) {
    const seen = new Set<string>();
    for (const x of v.quizzes) {
      const q = sanitizeQuiz(x);
      if (q && !seen.has(q.id)) {
        seen.add(q.id);
        m.quizzes.push(q);
      }
    }
    m.quizzes.sort((a, b) => a.at - b.at);
  }
  return pruneMastery(m);
}

const lastAt = (n: Note) => n.log.reduce((t, a) => Math.max(t, a.at), 0);

/** Keep the saved data bounded: at most NOTE_MAX entries (dropping mastered, then resolved
 *  entries, least recently touched first; active ones only past NOTE_HARD_MAX), QUIZ_MAX quizzes
 *  with per-question details on the latest QUIZ_DETAIL_MAX. */
export function pruneMastery(m: Mastery): Mastery {
  let notes = m.notes;
  const keys = Object.keys(notes);
  if (keys.length > NOTE_MAX) {
    const rank = (n: Note) => (n.box === MASTERED ? 0 : n.resolved ? 1 : 2);
    const order = keys.sort((a, b) => rank(notes[a]) - rank(notes[b]) || lastAt(notes[a]) - lastAt(notes[b]));
    const drop = new Set<string>();
    for (const k of order) {
      if (keys.length - drop.size <= NOTE_MAX) break;
      if (rank(notes[k]) === 2 && keys.length - drop.size <= NOTE_HARD_MAX) break;
      drop.add(k);
    }
    notes = Object.fromEntries(Object.entries(notes).filter(([k]) => !drop.has(k)));
  }
  let quizzes = m.quizzes.slice(-QUIZ_MAX);
  const cut = quizzes.length - QUIZ_DETAIL_MAX;
  if (cut > 0 && quizzes.slice(0, cut).some((q) => q.items))
    quizzes = quizzes.map((q, i) => {
      if (i >= cut || !q.items) return q;
      const rest = { ...q };
      delete rest.items;
      return rest;
    });
  return notes === m.notes && quizzes.length === m.quizzes.length && quizzes.every((q, i) => q === m.quizzes[i]) ? m : { v: 1, notes, quizzes };
}

/** Merge imported mastery data into the current one: entries are combined (attempt logs
 *  joined, the later state of the schedule kept), quizzes joined by id. */
export function mergeMastery(a: Mastery, b: Mastery): Mastery {
  const notes: Record<string, Note> = { ...a.notes };
  for (const [k, y] of Object.entries(b.notes)) {
    const x = notes[k];
    if (!x) {
      notes[k] = y;
      continue;
    }
    const [older, newer] = lastAt(x) >= lastAt(y) ? [y, x] : [x, y];
    const seen = new Set<string>();
    const log = [...x.log, ...y.log]
      .sort((p, q) => p.at - q.at)
      .filter((t) => {
        const id = `${t.at}|${t.via}|${t.ok}|${t.input ?? ''}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    const types: Partial<Record<MistakeType, number>> = { ...older.types };
    for (const [t, c] of Object.entries(newer.types)) types[t as MistakeType] = Math.max(types[t as MistakeType] ?? 0, c ?? 0);
    notes[k] = {
      ...newer,
      first: x.first < y.first ? x.first : y.first,
      lastWrong: x.lastWrong > y.lastWrong ? x.lastWrong : y.lastWrong,
      wrongs: Math.max(x.wrongs, y.wrongs),
      lapses: Math.max(x.lapses, y.lapses),
      types,
      log: log.length > LOG_MAX ? [log[0], ...log.slice(log.length - (LOG_MAX - 1))] : log,
    };
  }
  const byId = new Map<string, QuizRecord>();
  for (const q of [...a.quizzes, ...b.quizzes]) if (!byId.has(q.id)) byId.set(q.id, q);
  return pruneMastery({ v: 1, notes, quizzes: [...byId.values()].sort((p, q) => p.at - q.at) });
}

/** Add a finished quiz (pruned). */
export const addQuiz = (m: Mastery, q: QuizRecord): Mastery => pruneMastery({ ...m, quizzes: [...m.quizzes.filter((x) => x.id !== q.id), q] });
