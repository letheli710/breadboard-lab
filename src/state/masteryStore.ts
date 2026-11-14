// The mistake notebook, review schedule and quizzes (state/mastery.ts, state/quiz.ts) as a store,
// saved in localStorage ("bb.practice.mastery", the running quiz in "bb.practice.quiz").
// A lazy chunk: the main store sends practice attempts here with a dynamic import, and the pages
// that show it (Practice, the header's "due today") load it themselves — nothing here is on the
// critical path.
//
// First run with progress saved by an older version: the notebook is built from it
// (seedFromAnswers); the saved progress itself (bb.practice.answers) is never changed here.

import { create } from 'zustand';
import { dayOf, nowMs, onClockChange, today } from './clock';
import {
  addQuiz,
  mergeMastery,
  noteKey,
  recordAttempt,
  sanitizeMastery,
  seedFromAnswers,
  type Mastery,
  type MistakeType,
  type Now,
  type Outcome,
  type QuizItemResult,
  type Via,
} from './mastery';
import { readStored, writeStoredLater } from './persist';
import type { PracticeEvent, QProgress } from './practice';
import type { QuizAnswer } from './quiz';
import { useStore } from './store';

export const MASTERY_KEY = 'bb.practice.mastery';
export const QUIZ_KEY = 'bb.practice.quiz';

export interface ActiveQuiz {
  id: string;
  seed: number;
  chapters: string[];
  weak: boolean;
  /** seconds, 0 = no limit */
  limit: number;
  items: { pid: string; qid: string }[];
  answers: Record<number, QuizAnswer>;
  /** time spent before the current run (ms) */
  elapsed: number;
  /** running since (epoch ms); null = paused */
  since: number | null;
}

interface MasteryState {
  data: Mastery;
  /** today on the device clock (refreshed on focus, every minute and by the test hook) */
  day: string;
  quiz: ActiveQuiz | null;
  /** the quiz whose results are on screen */
  resultId: string | null;
  record(pid: string, qid: string, o: Outcome, via: Via): void;
  startQuiz(q: Omit<ActiveQuiz, 'answers' | 'elapsed' | 'since'>): void;
  answerQuiz(i: number, a: QuizAnswer): void;
  pauseQuiz(paused: boolean): void;
  finishQuiz(results: QuizItemResult[]): void;
  discardQuiz(): void;
  closeResult(): void;
  importMastery(m: Mastery): void;
}

const now = (): Now => {
  const at = nowMs();
  return { at, day: dayOf(at) };
};

/** time spent on a quiz so far (ms) */
export const quizElapsed = (q: ActiveQuiz, at = nowMs()) => q.elapsed + (q.since === null ? 0 : Math.max(0, at - q.since));

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function sanitizeQuiz(v: unknown): ActiveQuiz | null | undefined {
  if (v === null) return null;
  if (!isObj(v) || typeof v.id !== 'string' || !Array.isArray(v.items) || !isObj(v.answers)) return undefined;
  const items = v.items.filter((x): x is { pid: string; qid: string } => isObj(x) && typeof x.pid === 'string' && typeof x.qid === 'string');
  if (!items.length) return undefined;
  const answers: Record<number, QuizAnswer> = {};
  for (const [k, a] of Object.entries(v.answers)) {
    const i = Number(k);
    if (!Number.isInteger(i) || i < 0 || i >= items.length || !isObj(a)) continue;
    const x: QuizAnswer = {};
    if (typeof a.input === 'string') x.input = a.input.slice(0, 200);
    if (Number.isInteger(a.choice) && (a.choice as number) >= 0) x.choice = a.choice as number;
    answers[i] = x;
  }
  const n = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : 0);
  return {
    id: v.id,
    seed: n(v.seed),
    chapters: Array.isArray(v.chapters) ? v.chapters.filter((c): c is string => typeof c === 'string') : [],
    weak: v.weak === true,
    limit: n(v.limit),
    items,
    answers,
    elapsed: n(v.elapsed),
    since: typeof v.since === 'number' && Number.isFinite(v.since) ? v.since : null,
  };
}

function loadMastery(): Mastery {
  const saved = readStored<Mastery | null>(MASTERY_KEY, null, (v) => sanitizeMastery(v));
  if (saved) return saved;
  const seeded = seedFromAnswers(useStore.getState().practiceAnswers, now());
  writeStoredLater(MASTERY_KEY, seeded);
  return seeded;
}

const save = (data: Mastery) => writeStoredLater(MASTERY_KEY, data);
const saveQuiz = (q: ActiveQuiz | null) => writeStoredLater(QUIZ_KEY, q);

export const useMastery = create<MasteryState>()((set, get) => ({
  data: loadMastery(),
  day: today(),
  quiz: readStored<ActiveQuiz | null>(QUIZ_KEY, null, sanitizeQuiz),
  resultId: null,

  record(pid, qid, o, via) {
    const t = now();
    const s = get();
    const k = noteKey(pid, qid);
    const n = recordAttempt(s.data.notes[k], pid, qid, o, via, t);
    if (!n) return;
    const data = { ...s.data, notes: { ...s.data.notes, [k]: n } };
    save(data);
    set({ data, day: t.day });
  },
  startQuiz(q) {
    const quiz: ActiveQuiz = { ...q, answers: {}, elapsed: 0, since: nowMs() };
    saveQuiz(quiz);
    set({ quiz, resultId: null });
  },
  answerQuiz(i, a) {
    const q = get().quiz;
    if (!q) return;
    const quiz = { ...q, answers: { ...q.answers, [i]: a } };
    saveQuiz(quiz);
    set({ quiz });
  },
  pauseQuiz(paused) {
    const q = get().quiz;
    if (!q || paused === (q.since === null)) return;
    const at = nowMs();
    const quiz = paused ? { ...q, elapsed: quizElapsed(q, at), since: null } : { ...q, since: at };
    saveQuiz(quiz);
    set({ quiz });
  },
  finishQuiz(results) {
    const q = get().quiz;
    if (!q) return;
    const t = now();
    let data = get().data;
    // wrong ones go into the notebook; right ones count as a first-try success there
    const notes = { ...data.notes };
    for (const r of results) {
      const k = noteKey(r.pid, r.qid);
      const o: Outcome = r.ok ? { kind: 'right', unaided: true, input: r.input } : { kind: 'wrong', type: (r.type ?? 'wrong') as MistakeType, input: r.input };
      const n = recordAttempt(notes[k], r.pid, r.qid, o, 'quiz', t);
      if (n) notes[k] = n;
    }
    data = addQuiz(
      { ...data, notes },
      {
        id: q.id,
        at: t.at,
        chapters: q.chapters,
        ...(q.weak ? { weak: true } : {}),
        n: results.length,
        correct: results.filter((r) => r.ok).length,
        seconds: Math.round(quizElapsed(q, t.at) / 1000),
        limit: q.limit,
        items: results,
      },
    );
    save(data);
    saveQuiz(null);
    set({ data, quiz: null, resultId: q.id, day: t.day });
  },
  discardQuiz() {
    saveQuiz(null);
    set({ quiz: null });
  },
  closeResult() {
    set({ resultId: null });
  },
  importMastery(m) {
    const data = mergeMastery(get().data, m);
    save(data);
    set({ data });
  },
}));

const refreshDay = () => {
  const day = today();
  if (useMastery.getState().day !== day) useMastery.setState({ day });
};
onClockChange(refreshDay);
if (typeof window !== 'undefined') {
  window.addEventListener('focus', refreshDay);
  document.addEventListener('visibilitychange', refreshDay);
  setInterval(refreshDay, 60_000);
}

/** A practice attempt (from the main store): the first solve of a question decides whether it
 *  was a first-try success; attempts on an already solved question don't change the notebook. */
export function fromPractice(pid: string, qid: string, ev: PracticeEvent, prev: QProgress | undefined, next: QProgress) {
  if (prev?.status) return;
  const m = useMastery.getState();
  if (ev.kind === 'wrong') {
    const type: MistakeType = ev.choice !== undefined ? 'choice' : ((ev.diag as MistakeType | undefined) ?? 'wrong');
    m.record(pid, qid, { kind: 'wrong', type, input: ev.choice !== undefined ? String.fromCharCode(65 + ev.choice) : ev.input }, 'practice');
  } else if (ev.kind === 'reveal') m.record(pid, qid, { kind: 'reveal' }, 'practice');
  else m.record(pid, qid, { kind: 'right', unaided: next.status === 'unaided', input: ev.input }, 'practice');
}
