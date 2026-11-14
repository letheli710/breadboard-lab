import { describe, expect, it } from 'vitest';
import { checkAnswer } from '../core/problem/answer';
import type { Question } from '../core/problem/types';
import { drawQuiz, gradable, grade, quotas, remaining, rng, score, unreadable, type PoolItem } from './quiz';

function pool(): PoolItem[] {
  const out: PoolItem[] = [];
  // 30 problems: levels 1 (12), 2 (9), 3 (6), 4 (3); 2 parts each
  const levels = [...Array(12).fill(1), ...Array(9).fill(2), ...Array(6).fill(3), ...Array(3).fill(4)];
  levels.forEach((level, i) => {
    for (const qid of ['a', 'b']) out.push({ pid: `p${i}`, qid, chapter: i % 2 ? 'basics' : 'methods', level });
  });
  return out;
}

describe('quiz drawing', () => {
  it('the same seed draws the same quiz; another seed another one', () => {
    const a = drawQuiz(pool(), 10, 42);
    expect(drawQuiz(pool(), 10, 42)).toEqual(a);
    expect(drawQuiz(pool(), 10, 43)).not.toEqual(a);
    expect(rng(1)()).toBe(rng(1)());
  });

  it('is stratified by level (largest remainder) and ordered by level', () => {
    const q = drawQuiz(pool(), 10, 7);
    const per = (l: number) => q.filter((x) => x.level === l).length;
    // pool shares 24/18/12/6 of 60 → 4 / 3 / 2 / 1
    expect([per(1), per(2), per(3), per(4)]).toEqual([4, 3, 2, 1]);
    expect(q.map((x) => x.level)).toEqual([...q.map((x) => x.level)].sort());
    expect(quotas({ 1: 1, 2: 10 }, 5)).toEqual({ 1: 0, 2: 5 });
    expect(quotas({ 1: 2, 2: 2, 3: 2 }, 4)).toEqual({ 1: 2, 2: 1, 3: 1 });
  });

  it('prefers one part per problem, then allows second parts; never repeats; caps at the pool', () => {
    const q = drawQuiz(pool(), 10, 3);
    expect(new Set(q.map((x) => x.pid)).size).toBe(10);
    const small = pool().filter((p) => p.level === 4); // 3 problems × 2 parts
    const all = drawQuiz(small, 10, 3);
    expect(all.length).toBe(6);
    expect(new Set(all.map((x) => `${x.pid}#${x.qid}`)).size).toBe(6);
  });

  it('draws preferred (due) items first within their level', () => {
    const prefer = new Set(['p0#b', 'p1#a']);
    for (const seed of [1, 2, 3]) {
      const q = drawQuiz(pool(), 4, seed, prefer);
      expect(q.map((x) => `${x.pid}#${x.qid}`)).toEqual(expect.arrayContaining(['p0#b', 'p1#a']));
    }
  });
});

describe('quiz grading uses the practice checker', () => {
  const num: Question = { id: 'a', ask: 'I?', answer: 0.0025, unit: 'mA' };
  const ac: Question = { id: 'b', ask: 'U?', answer: 10, unit: 'V' };
  const mc: Question = { id: 'c', ask: 'Which?', choices: ['x', 'y', 'z'], correct: 1 };

  it('numeric: same verdict and diagnosis as checkAnswer, tolerances included', () => {
    for (const input of ['2.5', '2.54', '2.56', '-2.5', '2500', '2.5m', '3']) {
      const g = grade(num, { input });
      const c = checkAnswer(num, input);
      expect(g.ok).toBe(c.ok);
      if (!c.ok) expect(g.type).toBe(c.diagnosis ?? 'wrong');
    }
    expect(grade(num, { input: '-2.5' }).type).toBe('sign');
    expect(grade(ac, { input: '14.14' }).type).toBe('sqrt2');
    expect(grade(ac, { input: '10000' }).type).toBe('e3');
    expect(grade(num, { input: ' ' }).type).toBe('blank');
    expect(grade(num, undefined).type).toBe('blank');
  });

  it('multiple choice, blank, unreadable input, gradable', () => {
    expect(grade(mc, { choice: 1 })).toEqual({ ok: true, input: 'B' });
    expect(grade(mc, { choice: 2 })).toEqual({ ok: false, type: 'choice', input: 'C' });
    expect(grade(mc, {}).type).toBe('blank');
    expect(unreadable(num, '2.5 kg')).toBeTruthy();
    expect(unreadable(num, '2.5')).toBeNull();
    expect(gradable(num) && gradable(mc)).toBe(true);
    expect(gradable({ id: 'x', ask: 'explain' })).toBe(false);
  });

  it('score and timer', () => {
    expect(score([{ ok: true }, { ok: false }, { ok: true }])).toEqual({ n: 3, correct: 2, percent: 67 });
    expect(remaining(600, 0)).toBe(600);
    expect(remaining(600, 599_100)).toBe(1);
    expect(remaining(600, 700_000)).toBe(0);
    expect(remaining(0, 5000)).toBeNull();
  });
});
