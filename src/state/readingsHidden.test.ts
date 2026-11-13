import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseChallenge } from '../core/challenge';
import { readingsHidden } from './readingsHidden';

const load = (f: string) => parseChallenge(JSON.parse(readFileSync(new URL(`../../challenges/${f}`, import.meta.url), 'utf8'))).challenge!;

describe('simulated readings are hidden while a lab has unanswered measurement questions', () => {
  const kcl = load('201-kcl-ammeters.json');
  const ids = kcl.measurements.map((q) => q.id);

  it('hidden until every required question is answered correctly', () => {
    expect(readingsHidden(kcl, undefined)).toBe(true);
    expect(readingsHidden(kcl, { answers: { i1: { input: '8.84', ok: true } } })).toBe(true);
    const all = Object.fromEntries(ids.map((id) => [id, { ok: true }]));
    expect(readingsHidden(kcl, { answers: all })).toBe(false);
    // an answer that went stale (board changed) hides them again
    expect(readingsHidden(kcl, { answers: { ...all, i2: { input: '6.08', ok: false, stale: true } } })).toBe(true);
  });

  it('optional questions do not keep them hidden', () => {
    const ch = { ...kcl, measurements: kcl.measurements.map((q) => (q.id === 'kcl' ? { ...q, required: false } : q)) };
    const answered = Object.fromEntries(ids.filter((id) => id !== 'kcl').map((id) => [id, { ok: true }]));
    expect(readingsHidden(ch, { answers: answered })).toBe(false);
  });

  it('labs without questions, lessons and no challenge (sandbox) are unaffected', () => {
    expect(readingsHidden(load('19-fix-the-circuit.json'), undefined)).toBe(false);
    expect(readingsHidden({ ...kcl, kind: 'lesson' }, undefined)).toBe(false);
    expect(readingsHidden(null, undefined)).toBe(false);
  });
});
