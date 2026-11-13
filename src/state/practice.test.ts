import { describe, expect, it } from 'vitest';
import { applyEvent, countsAsDone, exportPractice, mergeAnswers, migrateAnswers, parsePracticeExport, problemStatus, type PracticeEvent, type QProgress } from './practice';

const run = (...evs: PracticeEvent[]) => evs.reduce<QProgress | undefined>((p, e) => applyEvent(p, e), undefined)!;

describe('practice progress', () => {
  it('records how a question was solved', () => {
    expect(run({ kind: 'right' }).status).toBe('unaided');
    expect(run({ kind: 'wrong' }, { kind: 'wrong' }, { kind: 'right' })).toEqual({ status: 'retried', wrong: 2 });
    expect(run({ kind: 'reveal' }, { kind: 'right' }).status).toBe('revealed');
    expect(run({ kind: 'wrong' }, { kind: 'reveal' }, { kind: 'right' }).status).toBe('revealed');
  });
  it('a solved question never gets worse', () => {
    expect(run({ kind: 'right' }, { kind: 'reveal' }, { kind: 'wrong' })).toEqual({ status: 'unaided' });
  });
  it('multiple choice: records the first wrong pick, elimination counts as revealed', () => {
    const two = run({ kind: 'wrong', choice: 0 }, { kind: 'right', choices: 2 });
    expect(two).toMatchObject({ status: 'revealed', picks: [0] });
    const four = run({ kind: 'wrong', choice: 2 }, { kind: 'wrong', choice: 2 }, { kind: 'right', choices: 4 });
    expect(four).toMatchObject({ status: 'retried', picks: [2], wrong: 2 });
    expect(run({ kind: 'wrong', choice: 0 }, { kind: 'wrong', choice: 1 }, { kind: 'wrong', choice: 3 }, { kind: 'right', choices: 4 }).status).toBe('revealed');
  });
  it('problem status is the worst question; revealed is not done', () => {
    expect(problemStatus({ a: { status: 'unaided' } }, ['a', 'b'])).toBeNull();
    expect(problemStatus({ a: { status: 'unaided' }, b: { status: 'retried' } }, ['a', 'b'])).toBe('retried');
    expect(problemStatus({ a: { status: 'revealed' }, b: { status: 'unaided' } }, ['a', 'b'])).toBe('revealed');
    expect(countsAsDone('retried')).toBe(true);
    expect(countsAsDone('revealed')).toBe(false);
  });
  it('migrates version-1 saved progress without losing it', () => {
    expect(migrateAnswers({ p1: { a: true, b: false }, p2: { x: { status: 'retried', wrong: 1 } }, bad: 3 })).toEqual({
      p1: { a: { status: 'unaided' } },
      p2: { x: { status: 'retried', wrong: 1 } },
    });
    expect(migrateAnswers(null)).toEqual({});
  });
  it('merge keeps the better result per question', () => {
    const m = mergeAnswers(
      { p: { a: { status: 'revealed', revealed: true }, b: { status: 'unaided' } } },
      { p: { a: { status: 'retried', wrong: 1 }, b: { status: 'revealed' }, c: { wrong: 2 } }, q: { z: { status: 'unaided' } } },
    );
    expect(m).toEqual({ p: { a: { status: 'retried', wrong: 1 }, b: { status: 'unaided' }, c: { wrong: 2 } }, q: { z: { status: 'unaided' } } });
  });
  it('export / import round trip', () => {
    const answers = { p: { a: { status: 'retried' as const, wrong: 1 } } };
    const file = JSON.parse(JSON.stringify(exportPractice({ p: true }, answers, new Date('2026-01-02T03:04:05Z'))));
    expect(file.format).toBe('breadboard-lab-practice/1');
    expect(parsePracticeExport(file)).toEqual({ done: { p: true }, answers });
    expect(parsePracticeExport({ format: 'other' })).toBeNull();
    expect(parsePracticeExport('x')).toBeNull();
  });
});
