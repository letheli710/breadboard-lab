import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { parseChallenge, type Challenge } from './challenge';
import { setLang } from './i18n';
import { buildNetlist } from './netlist';
import {
  allAnswered,
  boardValue,
  evalFormula,
  gradeReading,
  isAnswered,
  matchBoard,
  percentDiff,
  questionKey,
  referenceValues,
  revalidate,
  ringFrequency,
  structureKey,
  submitAnswer,
  type ChallengeReadings,
} from './readings';
import type { Layout } from './types';

const load = (file: string): Challenge => {
  const r = parseChallenge(JSON.parse(readFileSync(new URL(`../../challenges/${file}`, import.meta.url), 'utf8')));
  if (!r.challenge) throw new Error(r.errors.join('\n'));
  return r.challenge;
};

/** the challenge's solution with some parts' props changed */
const board = (ch: Challenge, edit: Record<string, Record<string, unknown>> = {}) => {
  const layout: Layout = { version: 1, parts: ch.solution!.parts.map((p) => (edit[p.ref] ? { ...p, props: { ...p.props, ...edit[p.ref] } } : p)) };
  return buildNetlist(layout).circuit;
};

const q = (ch: Challenge, id: string) => ch.measurements.find((x) => x.id === id)!;

describe('measurement questions', () => {
  let kcl: Challenge;
  beforeAll(() => {
    setLang('en');
    kcl = load('201-kcl-ammeters.json');
  });

  it('parses the questions with defaults (unit, tolerance, prediction, choice)', () => {
    const i1 = q(kcl, 'i1');
    expect(i1.what).toEqual({ kind: 'current', el: 'AM1', mode: 'dc' });
    expect(i1.unit).toBe('mA');
    expect(i1.tol).toBe(0.03);
    expect(i1.predict).toBe(true);
    expect(i1.required).toBe(true);
    const c = q(kcl, 'kcl');
    expect(c.what).toBeNull();
    expect(c.choices).toHaveLength(3);
    expect(c.ask).toMatch(/I2 \+ I3/);
  });

  it('reads the expected value off the reference board', () => {
    const m = matchBoard(kcl, board(kcl))!;
    expect(m).not.toBeNull();
    const v = referenceValues(kcl, m);
    expect(v.get('i1')).toBeCloseTo(9 / (330 + (1000 * 2200) / 3200), 5);
    expect(v.get('un')).toBeCloseTo(6.081, 2);
  });

  it('accepts a correct reading in any notation, and diagnoses close / prefix / sign / unit mistakes', () => {
    const m = matchBoard(kcl, board(kcl))!;
    const exp = boardValue(q(kcl, 'i1'), m, {}, kcl.measurements);
    const g = (s: string) => gradeReading(q(kcl, 'i1'), exp, s);
    expect(g('8.84').ok).toBe(true);
    expect(g('8.84 mA').ok).toBe(true);
    expect(g('0.00884 A').ok).toBe(true);
    expect(g('8.84e-3A').ok).toBe(true);
    expect(g('9/1.0175').ok).toBe(true);
    expect(g('8.5').diagnosis).toBe('close');
    expect(g('8.84 A').diagnosis).toBe('e3');
    const neg = g('-8.84');
    expect(neg.diagnosis).toBe('sign');
    expect(neg.reason).toMatch(/red \(\+\) lead/);
    const unit = g('8.84 V');
    expect(unit.ok).toBe(false);
    expect(unit.unreadable).toBe(true);
    expect(unit.reason).toMatch(/Wrong unit/);
    expect(g('12').ok).toBe(false);
  });

  it('voltage readings: a reversed meter is a probe swap, not a wrong value', () => {
    const m = matchBoard(kcl, board(kcl))!;
    const exp = boardValue(q(kcl, 'un'), m, {}, kcl.measurements);
    const r = gradeReading(q(kcl, 'un'), exp, '-6.08');
    expect(r.diagnosis).toBe('sign');
    expect(r.reason).toMatch(/leads/);
  });

  it("follows the student's own part values (a 1.05 kΩ R2 is allowed and changes the readings)", () => {
    const own = board(kcl, { R2: { resistance: 1050 } });
    const m = matchBoard(kcl, own)!;
    expect(m).not.toBeNull();
    const i2 = boardValue(q(kcl, 'i2'), m, {}, kcl.measurements);
    const par = (1050 * 2200) / 3250;
    expect(i2).toBeCloseTo((9 / (330 + par)) * (par / 1050), 5);
    // the textbook 6.08 mA is now wrong for this board (≈ 4 % off); the board's own 5.85 mA is right
    expect(gradeReading(q(kcl, 'i2'), i2, '6.08').ok).toBe(false);
    expect(gradeReading(q(kcl, 'i2'), i2, '5.85').ok).toBe(true);
  });

  it('a board that does not match the target gives no reading (questions stay locked)', () => {
    expect(matchBoard(kcl, board(kcl, { R2: { resistance: 2200 } }))).toBeNull();
  });

  it('marks an answer stale when the board changes under it, and re-validates it when it still holds', () => {
    const m0 = matchBoard(kcl, board(kcl))!;
    let rd: ChallengeReadings = { answers: {} };
    const s = submitAnswer(kcl, q(kcl, 'i2'), m0, rd.answers, '6.08');
    expect(s.grade.ok).toBe(true);
    rd = { answers: { i2: s.answer } };
    expect(isAnswered(q(kcl, 'i2'), rd.answers.i2, m0, rd.answers)).toBe(true);
    // same board: nothing to do
    expect(revalidate(kcl, rd, m0)).toBe(rd);
    // R2 swapped for 1.05 kΩ: the old reading no longer matches
    const m1 = matchBoard(kcl, board(kcl, { R2: { resistance: 1050 } }))!;
    expect(isAnswered(q(kcl, 'i2'), rd.answers.i2, m1, rd.answers)).toBe(false);
    const r1 = revalidate(kcl, rd, m1);
    expect(r1.answers.i2.ok).toBe(false);
    expect(r1.answers.i2.stale).toBe(true);
    // R3 changed instead (within tolerance): I2 hardly moves, the answer is re-validated and kept
    const m2 = matchBoard(kcl, board(kcl, { R3: { resistance: 2250 } }))!;
    const r2 = revalidate(kcl, rd, m2);
    expect(r2.answers.i2.ok).toBe(true);
    expect(r2.answers.i2.stale).toBe(false);
    expect(r2.answers.i2.key).toBe(questionKey(q(kcl, 'i2'), m2, r2.answers));
  });

  it('completion needs every required question, multiple choice included', () => {
    const m = matchBoard(kcl, board(kcl))!;
    const vals = referenceValues(kcl, m);
    let answers: ChallengeReadings['answers'] = {};
    for (const x of kcl.measurements) {
      if (!x.what) continue;
      answers = { ...answers, [x.id]: submitAnswer(kcl, x, m, answers, String(vals.get(x.id)! * 1000 ** (x.unit === 'mA' ? 1 : 0))).answer };
    }
    expect(allAnswered(kcl, { answers }, m)).toBe(false);
    const wrong = submitAnswer(kcl, q(kcl, 'kcl'), m, answers, 1);
    expect(wrong.grade.ok).toBe(false);
    answers = { ...answers, kcl: submitAnswer(kcl, q(kcl, 'kcl'), m, answers, 0).answer };
    expect(allAnswered(kcl, { answers }, m)).toBe(true);
    expect(allAnswered(kcl, { answers }, null)).toBe(false);
  });

  it('structure key ignores operating controls and probes but not part values', () => {
    const base = structureKey(kcl, board(kcl));
    expect(structureKey(kcl, board(kcl, { PSU1: { currentLimit: 0.2 } }))).not.toBe(base);
    expect(structureKey(kcl, board(kcl, { R1: { resistance: 340 } }))).not.toBe(base);
    const thev = load('222-thevenin-measure.json');
    const b = structureKey(thev, board(thev));
    expect(structureKey(thev, board(thev, { SW1: { pressed: true } }))).toBe(b);
  });
});

describe('derived and scope questions', () => {
  beforeAll(() => setLang('en'));

  it("Thevenin: Req is computed from the student's own Uoc and Isc readings", () => {
    const ch = load('222-thevenin-measure.json');
    const m = matchBoard(ch, board(ch))!;
    const vals = referenceValues(ch, m);
    expect(vals.get('uoc')).toBeCloseTo((9 * 2.2) / 3.2, 2);
    expect(vals.get('req')).toBeGreaterThan(1150);
    expect(vals.get('req')).toBeLessThan(1170);
    let answers: ChallengeReadings['answers'] = {};
    answers = { ...answers, uoc: submitAnswer(ch, q(ch, 'uoc'), m, answers, '6.2').answer };
    answers = { ...answers, isc: submitAnswer(ch, q(ch, 'isc'), m, answers, '5.3').answer };
    expect(answers.uoc.ok && answers.isc.ok).toBe(true);
    // 6.2 / 5.3 mA = 1169.8 Ω — right for the numbers the student read, even though the board says 1158
    expect(submitAnswer(ch, q(ch, 'req'), m, answers, '1170').grade.ok).toBe(true);
    expect(submitAnswer(ch, q(ch, 'req'), m, answers, '6.2/0.0053').grade.ok).toBe(true);
    // Isc read again as 5.5 (still within 3 % of the board): the derived answer follows (the stored Req is re-validated)
    const req = submitAnswer(ch, q(ch, 'req'), m, answers, '1170').answer;
    answers = { ...answers, req, isc: submitAnswer(ch, q(ch, 'isc'), m, answers, '5.5').answer };
    const r = revalidate(ch, { answers }, m);
    expect(r.answers.req.ok).toBe(false);
    expect(r.answers.req.stale).toBe(true);
  });

  it('evalFormula substitutes values and rejects missing ones', () => {
    expect(evalFormula('uoc / isc', { uoc: 6, isc: 0.005 })).toBeCloseTo(1200, 9);
    expect(evalFormula('tr / ln(9)', { tr: 2.197e-3 })).toBeCloseTo(1e-3, 6);
    expect(evalFormula('a * b', { a: 2, b: NaN })).toBeNaN();
  });

  it('ringFrequency finds the frequency of a damped oscillation and 0 for a plain exponential', () => {
    const dt = 1e-6;
    const n = 5000;
    const ring = Float64Array.from({ length: n }, (_, i) => {
      const t = (i % 2500) * dt;
      const step = i < 2500 ? 1 : 0;
      return step - (step ? 1 : -1) * Math.exp(-t / 3e-4) * Math.cos(2 * Math.PI * 4000 * t);
    });
    expect(Math.abs(ringFrequency(ring, dt) / 4000 - 1)).toBeLessThan(0.01);
    const rc = Float64Array.from({ length: n }, (_, i) => (i < 2500 ? 1 - Math.exp(-(i * dt) / 2e-4) : Math.exp(-((i - 2500) * dt) / 2e-4)));
    expect(ringFrequency(rc, dt)).toBe(0);
  });

  it('percentDiff', () => {
    expect(percentDiff(8.84, 9.1)).toBe('+2.9%');
    expect(percentDiff(2, 1.5)).toBe('−25%');
    expect(percentDiff(0, 1)).toBe('');
  });
});

describe('phase readings', () => {
  it('±2° tolerance, and a flipped sign asks "leading or lagging?"', () => {
    setLang('en');
    const ch = load('261-rc-lowpass-bode.json');
    const ph = q(ch, 'ph');
    expect(ph.tolDeg).toBe(2);
    expect(gradeReading(ph, -45, '-43.5').ok).toBe(true);
    expect(gradeReading(ph, -45, '-42').ok).toBe(false);
    expect(gradeReading(ph, -45, '45').reason).toMatch(/leading or lagging/);
  });
});
