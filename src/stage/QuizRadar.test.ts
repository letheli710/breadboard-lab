import { describe, expect, it } from 'vitest';
import { spokesOf } from './QuizRadar';
import type { QuizItem } from './types';

const q = (id: string, concept?: string, review_act?: number): QuizItem => ({ id, question: id, options: [], feedback_correct: '', feedback_wrong: '', concept, review_act });

describe('mistake radar spokes', () => {
  it('one spoke per concept, missed if any of its questions was missed at the first try', () => {
    const items = [q('a', '虚短', 2), q('b', '虚短', 3), q('c', '虚断', 4), q('d')];
    const s = spokesOf(items, { a: true, b: false, c: true, d: false });
    expect(s).toEqual([
      { concept: '虚短', ok: false, review: 2 },
      { concept: '虚断', ok: true, review: 4 },
    ]);
  });
  it('skips questions not answered yet', () => {
    expect(spokesOf([q('a', 'x')], {})).toEqual([]);
  });
});
