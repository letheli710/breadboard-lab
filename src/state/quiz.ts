// Chapter quiz / exam mode: drawing question parts (stratified by difficulty, deterministic for a
// seed) and grading them with exactly the checker practice uses (core/problem/answer.ts).
// Pure; the running quiz lives in state/masteryStore.ts, its pages in ui/mastery/.

import { checkAnswer, readAnswer, type AnswerCheck } from '../core/problem/answer';
import type { Question } from '../core/problem/types';
import type { MistakeType } from './mastery';

export interface PoolItem {
  pid: string;
  qid: string;
  chapter: string;
  level: number;
}

/** Small seeded PRNG (mulberry32): the same seed draws the same quiz. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rand: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** How many to draw per level: proportional to the pool (largest remainder), at most what a
 *  level has; what one level can't fill goes to the others. */
export function quotas(sizes: Record<number, number>, n: number): Record<number, number> {
  const levels = Object.keys(sizes)
    .map(Number)
    .filter((l) => sizes[l] > 0)
    .sort((a, b) => a - b);
  const total = levels.reduce((s, l) => s + sizes[l], 0);
  const want = Math.min(n, total);
  const q: Record<number, number> = {};
  if (!want) return q;
  const exact = levels.map((l) => (want * sizes[l]) / total);
  levels.forEach((l, i) => (q[l] = Math.floor(exact[i])));
  let left = want - levels.reduce((s, l) => s + q[l], 0);
  const byFrac = levels.map((l, i) => ({ l, f: exact[i] - Math.floor(exact[i]) })).sort((a, b) => b.f - a.f || a.l - b.l);
  for (const { l } of byFrac) {
    if (!left) break;
    q[l]++;
    left--;
  }
  return q;
}

/** Draw `n` question parts from the pool, stratified by level, preferring one part per problem
 *  and (within a level) the `prefer`red keys "pid#qid" (due review items). Ordered by level, then
 *  draw order. Deterministic for a given pool order and seed. */
export function drawQuiz(pool: PoolItem[], n: number, seed: number, prefer: ReadonlySet<string> = new Set()): PoolItem[] {
  const rand = rng(seed);
  const seen = new Set<string>();
  const uniq = pool.filter((p) => {
    const k = `${p.pid}#${p.qid}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const byLevel = new Map<number, PoolItem[]>();
  for (const p of uniq) byLevel.set(p.level, [...(byLevel.get(p.level) ?? []), p]);
  const q = quotas(Object.fromEntries([...byLevel].map(([l, a]) => [l, a.length])), n);
  const out: PoolItem[] = [];
  for (const level of [...byLevel.keys()].sort((a, b) => a - b)) {
    const items = shuffle(byLevel.get(level)!, rand);
    // preferred first, then one part per problem before a second part of the same problem
    const rank = (p: PoolItem) => (prefer.has(`${p.pid}#${p.qid}`) ? 0 : 1);
    const ordered = items.sort((a, b) => rank(a) - rank(b));
    const picked: PoolItem[] = [];
    const used = new Set<string>();
    for (let round = 0; picked.length < (q[level] ?? 0) && round < 50; round++) {
      for (const p of ordered) {
        if (picked.length >= (q[level] ?? 0)) break;
        if (picked.includes(p) || (used.has(p.pid) && round === 0)) continue;
        picked.push(p);
        used.add(p.pid);
      }
    }
    out.push(...picked);
  }
  return out;
}

/** Can this question be graded automatically (a numeric answer or multiple choice)? */
export const gradable = (q: Question) => typeof q.answer === 'number' || (!!q.choices?.length && typeof q.correct === 'number');

export interface QuizAnswer {
  input?: string;
  choice?: number;
}

/** The notebook's mistake type for a wrong numeric check. */
export const mistakeOf = (c: AnswerCheck): MistakeType => c.diagnosis ?? 'wrong';

export interface Graded {
  ok: boolean;
  type?: MistakeType;
  /** numeric questions with an answer typed: the normal checker result (feedback text) */
  check?: AnswerCheck;
  /** what was entered, for the notebook ("B" for an option) */
  input?: string;
}

/** Grade one answer exactly as practice does. */
export function grade(q: Question, a: QuizAnswer | undefined): Graded {
  if (q.choices?.length) {
    if (a?.choice === undefined) return { ok: false, type: 'blank' };
    const input = String.fromCharCode(65 + a.choice);
    return a.choice === q.correct ? { ok: true, input } : { ok: false, type: 'choice', input };
  }
  const text = a?.input?.trim() ?? '';
  if (!text) return { ok: false, type: 'blank' };
  const check = checkAnswer(q, text);
  return check.ok ? { ok: true, check, input: text } : { ok: false, check, type: mistakeOf(check), input: text };
}

/** During the quiz: only whether the typed text can be read at all (never right / wrong). */
export function unreadable(q: Question, input: string): string | null {
  if (q.choices?.length || !input.trim()) return null;
  const r = readAnswer(q, input);
  return 'reason' in r ? r.reason : null;
}

export interface Score {
  n: number;
  correct: number;
  /** 0–100, rounded */
  percent: number;
}

export function score(results: { ok: boolean }[]): Score {
  const correct = results.filter((r) => r.ok).length;
  return { n: results.length, correct, percent: results.length ? Math.round((100 * correct) / results.length) : 0 };
}

/** Seconds left (never below 0); null without a limit. */
export const remaining = (limitS: number, elapsedMs: number) => (limitS > 0 ? Math.max(0, Math.ceil(limitS - elapsedMs / 1000)) : null);
