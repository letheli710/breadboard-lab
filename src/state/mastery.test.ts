import { describe, expect, it } from 'vitest';
import { addDays, dayOf, daysBetween } from './clock';
import {
  addQuiz,
  dueNotes,
  emptyMastery,
  isActive,
  MASTERED,
  mergeMastery,
  noteKey,
  notebookStats,
  NOTE_MAX,
  pruneMastery,
  QUIZ_DETAIL_MAX,
  QUIZ_MAX,
  recordAttempt,
  sanitizeMastery,
  seedFromAnswers,
  weakChapters,
  type Mastery,
  type Note,
  type Now,
  type Outcome,
  type Via,
} from './mastery';
import { exportProgress, parseProgress } from './progressFile';
import { exportPractice, type PracticeRecord } from './practice';

const at = (day: string, h = 10): Now => ({ day, at: Date.parse(`${day}T${String(h).padStart(2, '0')}:00:00Z`) });
const D0 = '2026-11-14';

/** apply a list of attempts on (pid, qid) */
function run(steps: [string, Outcome, Via?][], start?: Note): Note | undefined {
  let n = start;
  for (const [day, o, via] of steps) n = recordAttempt(n, 'p1', 'a', o, via ?? 'retry', at(day));
  return n;
}
const wrong = (type: 'sign' | 'sqrt2' | 'wrong' = 'wrong', input = '3'): Outcome => ({ kind: 'wrong', type, input });
const right = (unaided = true): Outcome => ({ kind: 'right', unaided });

describe('clock days', () => {
  it('adds and subtracts calendar days across months, years and DST', () => {
    expect(addDays('2026-11-14', 1)).toBe('2026-11-15');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30'); // EU DST change in between
    expect(daysBetween('2026-11-14', '2026-12-05')).toBe(21);
    expect(dayOf(new Date(2026, 10, 14, 23, 59).getTime())).toBe('2026-11-14');
  });
});

describe('notebook transitions', () => {
  it('a correct answer to a question never wrong adds nothing', () => {
    expect(run([[D0, right()]])).toBeUndefined();
  });

  it('a mistake creates an active entry in box 1, due tomorrow, with input and diagnosis', () => {
    const n = run([[D0, wrong('sqrt2', '7.07')]])!;
    expect(n).toMatchObject({ box: 1, due: addDays(D0, 1), first: D0, lastWrong: D0, wrongs: 1, types: { sqrt2: 1 } });
    expect(isActive(n)).toBe(true);
    expect(n.log[0]).toMatchObject({ ok: false, input: '7.07', type: 'sqrt2', day: D0 });
  });

  it('a correct retry the same day does not clear it; a first-try success the next day does', () => {
    let n = run([
      [D0, wrong()],
      [D0, right()],
    ])!;
    expect(isActive(n)).toBe(true);
    expect(n.box).toBe(1);
    n = run([[addDays(D0, 1), right()]], n)!;
    expect(isActive(n)).toBe(false);
    expect(n.resolved).toBe(addDays(D0, 1));
    expect(n.box).toBe(2);
    expect(n.due).toBe(addDays(D0, 4)); // box 2: 3 days
  });

  it('a success after a wrong try in the same attempt (not unaided) does not clear it', () => {
    const n = run([
      [D0, wrong()],
      [addDays(D0, 2), right(false)],
    ])!;
    expect(isActive(n)).toBe(true);
  });

  it('walks the Leitner boxes 1 → 3 → 7 → 21 days → mastered; early answers do not promote', () => {
    let d = D0;
    let n = run([[d, wrong()]])!;
    const gaps: number[] = [];
    while (n.box < MASTERED) {
      // a day before it is due: no promotion
      if (n.box > 1) {
        const early = recordAttempt(n, 'p1', 'a', right(), 'review', at(addDays(n.due, -1)))!;
        expect(early.box).toBe(n.box);
      }
      const box = n.box;
      const due = n.due;
      gaps.push(daysBetween(d, due));
      d = due;
      n = recordAttempt(n, 'p1', 'a', right(), 'review', at(d))!;
      expect(n.box).toBe(box + 1);
    }
    expect(gaps).toEqual([1, 3, 7, 21]);
    expect(dueNotes({ v: 1, notes: { k: n }, quizzes: [] }, addDays(d, 400))).toEqual([]);
  });

  it('a mistake on a resolved entry sends it back to box 1, active again, history kept', () => {
    let n = run([
      [D0, wrong('sign')],
      [addDays(D0, 1), right()],
    ])!;
    n = run([[addDays(D0, 4), wrong('sqrt2')]], n)!;
    expect(isActive(n)).toBe(true);
    expect(n.box).toBe(1);
    expect(n.lapses).toBe(1);
    expect(n.types).toEqual({ sign: 1, sqrt2: 1 });
    expect(n.log.map((a) => a.ok)).toEqual([false, true, false]);
  });

  it('a revealed answer counts as a mistake', () => {
    const n = run([[D0, { kind: 'reveal' }]])!;
    expect(n.types).toEqual({ revealed: 1 });
    expect(n.box).toBe(1);
  });

  it('keeps the first attempt and the latest ones; long input is clipped', () => {
    const steps: [string, Outcome][] = Array.from({ length: 12 }, (_, i) => [D0, wrong('wrong', String(i))]);
    const n = run([[D0, wrong('wrong', 'x'.repeat(100))], ...steps])!;
    expect(n.log.length).toBe(6);
    expect(n.log[0].input!.length).toBe(40);
    expect(n.log[5].input).toBe('11');
    expect(n.wrongs).toBe(13);
  });

  it('due list, stats per chapter and type, weak chapters', () => {
    const m = emptyMastery();
    const add = (pid: string, qid: string, o: Outcome, day = D0) => {
      const k = noteKey(pid, qid);
      const n = recordAttempt(m.notes[k], pid, qid, o, 'practice', at(day));
      if (n) m.notes[k] = n;
    };
    add('ac-1', 'a', wrong('sqrt2'));
    add('ac-2', 'a', wrong('sqrt2'));
    add('ac-2', 'b', wrong('sign'));
    add('dc-1', 'a', wrong('sign'), addDays(D0, 1));
    const chapterOf = (pid: string) => (pid.startsWith('ac') ? 'phasors' : 'basics');
    expect(dueNotes(m, D0)).toEqual([]);
    expect(dueNotes(m, addDays(D0, 1)).map((n) => n.pid)).toEqual(['ac-1', 'ac-2', 'ac-2']);
    expect(dueNotes(m, addDays(D0, 2)).length).toBe(4);
    const s = notebookStats(m, chapterOf);
    expect(s.byChapter).toEqual({ phasors: { active: 3, total: 3, times: 3 }, basics: { active: 1, total: 1, times: 1 } });
    expect(s.byType.sqrt2).toEqual({ active: 2, total: 2, times: 2 });
    expect(s.byType.sign).toEqual({ active: 2, total: 2, times: 2 });
    expect(weakChapters(m, chapterOf)).toEqual(['phasors', 'basics']);
  });
});

describe('migration of saved progress', () => {
  const answers: Record<string, PracticeRecord> = {
    p1: { a: { status: 'unaided' }, b: { status: 'retried', wrong: 2 }, c: { status: 'revealed', revealed: true } },
    p2: { a: { wrong: 1 }, b: { status: 'retried', wrong: 1, picks: [2] } },
  };

  it('every part with a wrong try or a revealed answer becomes an active entry due today', () => {
    const m = seedFromAnswers(answers, at(D0));
    expect(Object.keys(m.notes).sort()).toEqual(['p1#b', 'p1#c', 'p2#a', 'p2#b']);
    for (const n of Object.values(m.notes)) {
      expect(isActive(n)).toBe(true);
      expect(n.due).toBe(D0);
    }
    expect(m.notes['p1#b'].types).toEqual({ old: 2 });
    expect(m.notes['p1#c'].types).toEqual({ revealed: 1 });
    expect(m.notes['p2#b'].types).toEqual({ choice: 1 });
    expect(m.notes['p2#b'].log[0].input).toBe('C');
    // the old mistake counts as before today: a first-try success today clears it
    const n = recordAttempt(m.notes['p1#b'], 'p1', 'b', right(), 'review', at(D0))!;
    expect(isActive(n)).toBe(false);
  });

  it('round-trips through the validator; garbage is dropped, not fatal', () => {
    const m = seedFromAnswers(answers, at(D0));
    expect(sanitizeMastery(JSON.parse(JSON.stringify(m)))).toEqual(m);
    expect(sanitizeMastery(null)).toBeUndefined();
    expect(sanitizeMastery({ v: 2 })).toBeUndefined();
    const bad = { v: 1, notes: { x: { pid: 'p', qid: 'q', first: 'nope' }, y: 5 }, quizzes: [{ id: 'a' }, 7] };
    expect(sanitizeMastery(bad)).toEqual(emptyMastery());
  });
});

describe('progress file v2', () => {
  const answers: Record<string, PracticeRecord> = { p1: { a: { status: 'retried', wrong: 1 } } };
  const done = { p1: true };

  it('exports and imports notebook, schedule and quizzes', () => {
    let m = seedFromAnswers(answers, at(D0));
    m = addQuiz(m, {
      id: 'q1',
      at: at(D0).at,
      chapters: ['basics'],
      n: 5,
      correct: 3,
      seconds: 300,
      limit: 600,
      items: [{ pid: 'p1', qid: 'a', ok: false, input: '2', type: 'sign' }],
    });
    const file = JSON.parse(JSON.stringify(exportProgress(done, answers, m, new Date(at(D0).at))));
    const back = parseProgress(file)!;
    expect(back.done).toEqual(done);
    expect(back.answers).toEqual(answers);
    expect(back.mastery).toEqual(m);
  });

  it('version-1 files still import (no mastery part)', () => {
    const v1 = JSON.parse(JSON.stringify(exportPractice(done, answers)));
    const back = parseProgress(v1)!;
    expect(back.answers).toEqual(answers);
    expect(back.mastery).toBeNull();
    expect(parseProgress({ format: 'something-else' })).toBeNull();
  });

  it('merging joins entries and quizzes and keeps the later schedule state', () => {
    const a = emptyMastery();
    const b = emptyMastery();
    a.notes['p1#a'] = run([[D0, wrong('sign', 'x')]])!;
    b.notes['p1#a'] = run([
      [D0, wrong('sign', 'x')],
      [addDays(D0, 1), right()],
    ])!;
    b.notes['p2#a'] = recordAttempt(undefined, 'p2', 'a', wrong(), 'quiz', at(D0))!;
    a.quizzes = [{ id: 'q1', at: 1, chapters: [], n: 1, correct: 1, seconds: 1, limit: 0 }];
    b.quizzes = [
      { id: 'q1', at: 1, chapters: [], n: 1, correct: 1, seconds: 1, limit: 0 },
      { id: 'q2', at: 2, chapters: [], n: 1, correct: 0, seconds: 1, limit: 0 },
    ];
    const m = mergeMastery(a, b);
    expect(Object.keys(m.notes).sort()).toEqual(['p1#a', 'p2#a']);
    expect(m.notes['p1#a'].resolved).toBe(addDays(D0, 1));
    expect(m.notes['p1#a'].log.length).toBe(2); // the shared attempt once
    expect(m.quizzes.map((q) => q.id)).toEqual(['q1', 'q2']);
  });
});

describe('size cap and pruning', () => {
  /** heavy user: 291 problems × 3 parts of progress, 200 notebook entries with full logs, 50 quizzes */
  function heavy(): { answers: Record<string, PracticeRecord>; m: Mastery } {
    const answers: Record<string, PracticeRecord> = {};
    for (let p = 0; p < 291; p++) {
      const pid = `chapter-name-${String(p).padStart(2, '0')}-some-problem-title`;
      answers[pid] = { a: { status: 'unaided' }, b: { status: 'retried', wrong: 2 }, c: { status: 'revealed', revealed: true, wrong: 1, picks: [1] } };
    }
    let m = emptyMastery();
    const pids = Object.keys(answers);
    for (let i = 0; i < 200; i++) {
      const pid = pids[i];
      let n: Note | undefined;
      for (let k = 0; k < 8; k++) n = recordAttempt(n, pid, 'b', k % 2 ? right() : wrong('sqrt2', '12.345 mA'), 'review', at(addDays(D0, k)));
      m.notes[noteKey(pid, 'b')] = n!;
    }
    for (let i = 0; i < 60; i++)
      m = addQuiz(m, {
        id: `q${i}`,
        at: at(D0).at + i,
        chapters: ['ac-analysis', 'phasors'],
        n: 20,
        correct: 12,
        seconds: 1500,
        limit: 1800,
        items: Array.from({ length: 20 }, (_, k) => ({ pid: pids[k], qid: 'a', ok: k % 3 > 0, input: '1.234k', ...(k % 3 ? {} : { type: 'e3' as const }) })),
      });
    return { answers, m };
  }

  it('stays bounded for a heavy user (bytes reported)', () => {
    const { answers, m } = heavy();
    expect(m.quizzes.length).toBe(QUIZ_MAX);
    expect(m.quizzes.filter((q) => q.items).length).toBe(QUIZ_DETAIL_MAX);
    const progress = JSON.stringify(answers).length;
    const mastery = JSON.stringify(m).length;
    console.log(`[size] heavy user: bb.practice.answers ${(progress / 1000).toFixed(1)} kB, bb.practice.mastery ${(mastery / 1000).toFixed(1)} kB`);
    // ≈ 171 kB in Nov 2026 (200 entries × 6 attempts ≈ 150 kB, 10 detailed quizzes ≈ 17 kB); localStorage allows ≈ 5 MB
    expect(mastery).toBeLessThan(200_000);
  });

  it('drops mastered, then resolved entries first; keeps active ones', () => {
    const m = emptyMastery();
    for (let i = 0; i < NOTE_MAX + 50; i++) {
      let n = recordAttempt(undefined, `p${i}`, 'a', wrong(), 'practice', at(D0, 1))!;
      if (i < 100) n = recordAttempt(n, `p${i}`, 'a', right(), 'review', at(addDays(D0, 1)))!;
      m.notes[noteKey(`p${i}`, 'a')] = n;
    }
    const p = pruneMastery(m);
    const left = Object.values(p.notes);
    expect(left.length).toBe(NOTE_MAX);
    expect(left.filter(isActive).length).toBe(NOTE_MAX + 50 - 100);
  });
});
