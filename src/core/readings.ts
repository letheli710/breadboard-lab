// Measurement questions ("measurements" in a challenge file): the student types what THEIR
// board reads — an ammeter, the multimeter between two pins, a scope measurement — and the
// answer is judged against a value computed from their own board (their actual part values,
// within the challenge's tolerance), read with the same machinery the behaviour tests use
// (probeBoard in check.ts). Nothing here is a stored number.
//
// Typed values go through the practice pages' answer reader (readAnswer / checkAnswer in
// problem/answer.ts: prefixes, units, expressions, near-miss and mistake diagnoses).

import type { Challenge, MeasurementQuestion, MeasureQuantity } from './challenge';
import { applySet, checkCircuit, checkerView, probeBoard } from './check';
import { tr } from './i18n';
import { evalExpr } from './problem/expr';
import { checkAnswer, fmtNum, readAnswer, splitUnit, type AnswerCheck } from './problem/answer';
import type { Circuit } from './types';

/** The student's board as matched to the target: the checker's view of it plus the maps. */
export interface BoardMatch {
  circuit: Circuit;
  mapping: Map<string, string>;
  pinMap: Map<string, string>;
}

/** One stored answer (persisted with the challenge). */
export interface ReadingAnswer {
  /** the prediction as typed (before measuring) */
  predict?: string;
  /** the reading as typed */
  input?: string;
  /** multiple choice: the picked option */
  choice?: number;
  /** last verdict */
  ok?: boolean;
  /** board state the verdict was computed against (see questionKey) */
  key?: string;
  /** it was right, then the board changed and it no longer matches */
  stale?: boolean;
  tries?: number;
}

export interface ChallengeReadings {
  /** structureKey of the board when the circuit check last passed */
  passed?: string;
  answers: Record<string, ReadingAnswer>;
}

export const emptyReadings = (): ChallengeReadings => ({ answers: {} });

/* ------------------------------------------------------------------ fingerprints */

/** FNV-1a, base 36: short keys for localStorage. */
function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36) + s.length.toString(36);
}

const sortKeys = (v: unknown): unknown =>
  Array.isArray(v)
    ? v.map(sortKeys)
    : v && typeof v === 'object'
      ? Object.fromEntries(
          Object.entries(v)
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([k, x]) => [k, sortKeys(x)]),
        )
      : v;

/** Order-independent serialisation of a circuit (`omit` drops props per component). */
function serialize(c: Circuit, omit?: (type: string, key: string) => boolean): string {
  const comps = [...c.components]
    .sort((a, b) => (a.ref < b.ref ? -1 : 1))
    .map((x) => [x.ref, x.type, sortKeys(Object.fromEntries(Object.entries(x.props).filter(([k]) => !omit?.(x.type, k))))]);
  const nets = c.nets.map((n) => [...n.pins].sort().join(',')).sort();
  return JSON.stringify([comps, nets]);
}

/** Operating controls the student uses while measuring: pressing a button, flipping a switch,
 *  turning a knob, retuning the generator. Changing them keeps the circuit check valid. */
const CONTROL_KEYS = new Set(['pressed', 'position', 'wiper']);
const GEN_KEYS = new Set(['waveform', 'frequency', 'amplitude', 'offset']);

/** Fingerprint of what the circuit check judged: wiring and part values, without scope probes
 *  and the operating controls (unless the target pins a generator setting down). */
export function structureKey(ch: Challenge, board: Circuit): string {
  const view = checkerView(
    board,
    ch.target.components.some((c) => c.type === 'ammeter'),
  ).circuit;
  const pinnedGen = new Set(ch.target.components.filter((c) => c.type === 'function_gen').flatMap((c) => Object.keys(c.props)));
  return hash(serialize(view, (type, k) => CONTROL_KEYS.has(k) || (type === 'function_gen' && GEN_KEYS.has(k) && !pinnedGen.has(k))));
}

/** Match the board to the target (wiring + values only, no behaviour tests): null unless it matches. */
export function matchBoard(ch: Challenge, board: Circuit): BoardMatch | null {
  const r = checkCircuit({ ...ch, tests: [] }, board);
  if (!r.perfect) return null;
  return {
    circuit: checkerView(
      board,
      ch.target.components.some((c) => c.type === 'ammeter'),
    ).circuit,
    mapping: r.mapping,
    pinMap: r.pinMap,
  };
}

/** The board state a question's reading depends on: the board with the question's `set`
 *  applied (a swept generator's frequency left out), or, for a formula, the answers it uses. */
export function questionKey(q: MeasurementQuestion, m: BoardMatch, answers: Record<string, ReadingAnswer>): string {
  if (q.what?.kind === 'formula') return hash(q.what.uses.map((u) => `${u}=${answers[u]?.input ?? ''}`).join(';'));
  if (!q.what) return 'choice';
  let set = q.set;
  if (q.what.kind === 'scope' && q.what.solve) set = { ...set, [q.what.solve.el]: { ...set[q.what.solve.el], frequency: 1 } };
  return hash(serialize(applySet(m.circuit, set, m.mapping, m.pinMap)));
}

/* ------------------------------------------------------------------ board values */

/** Frequency of the damped oscillation after an edge (Hz): mean spacing of successive peaks that
 *  stand out of the settling curve by more than 2 % of the swing; 0 when nothing rings. */
export function ringFrequency(x: ArrayLike<number>, dt: number): number {
  const n = x.length;
  let hi = -Infinity;
  let lo = Infinity;
  for (let i = 0; i < n; i++) {
    hi = Math.max(hi, x[i]);
    lo = Math.min(lo, x[i]);
  }
  const pp = hi - lo;
  if (!(pp > 1e-9) || n < 8) return 0;
  // local maxima with quadratic interpolation, each with its prominence over the next minimum
  const peaks: { t: number; v: number }[] = [];
  for (let i = 1; i < n - 1; i++) {
    if (!(x[i] > x[i - 1] && x[i] >= x[i + 1])) continue;
    const a = x[i - 1];
    const b = x[i];
    const c = x[i + 1];
    const den = a - 2 * b + c;
    peaks.push({ t: i + (den !== 0 ? (0.5 * (a - c)) / den : 0), v: b });
  }
  const spacings: number[] = [];
  for (let k = 0; k + 1 < peaks.length; k++) {
    const p0 = peaks[k];
    const p1 = peaks[k + 1];
    let min = Infinity;
    for (let i = Math.ceil(p0.t); i <= Math.floor(p1.t); i++) min = Math.min(min, x[i]);
    if (p0.v - min > 0.02 * pp && p1.v - min > 0.02 * pp) spacings.push(p1.t - p0.t);
  }
  if (!spacings.length) return 0;
  // the edge-to-edge spacing (the generator period) is far longer than a ring: drop outliers
  spacings.sort((a, b) => a - b);
  const median = spacings[Math.floor(spacings.length / 2)];
  const ring = spacings.filter((s) => s < 1.5 * median);
  return 1 / ((ring.reduce((s, v) => s + v, 0) / ring.length) * dt);
}

type Scope = Extract<MeasureQuantity, { kind: 'scope' }>;

function scopeValue(q: MeasurementQuestion, w: Scope, m: BoardMatch, set = q.set): number {
  const probe = probeBoard(m.circuit, set, m.mapping, m.pinMap);
  if (w.measure === 'ring') {
    const t = probe.tran();
    const a = t.pin(probe.pin(w.pin));
    const r = w.ref ? t.pin(probe.pin(w.ref)) : null;
    return ringFrequency(r ? a.map((v, i) => v - r[i]) : a, t.dt);
  }
  return probe.scope(w.measure, w.pin, w.ref, w.vs, w.vsref);
}

/** Sweep the generator (log scale) for the frequency where the measure crosses `value`; NaN when it
 *  doesn't cross inside [from, to]. */
function solveFrequency(q: MeasurementQuestion, w: Scope, m: BoardMatch): number {
  const s = w.solve!;
  const at = (f: number) => scopeValue(q, w, m, { ...q.set, [s.el]: { ...q.set[s.el], frequency: f } }) - s.value;
  let lo = Math.log(s.from);
  let hi = Math.log(s.to);
  let flo = at(s.from);
  const fhi = at(s.to);
  if (!(Math.sign(flo) !== Math.sign(fhi))) return NaN;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const fm = at(Math.exp(mid));
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid;
      flo = fm;
    } else hi = mid;
  }
  return Math.exp((lo + hi) / 2);
}

const cache = new Map<string, number>();

/** What the student's board reads for a measured question (SI units). Formula questions need
 *  the student's answers (`numbers`: id → value). Throws on an unreadable formula. */
export function boardValue(q: MeasurementQuestion, m: BoardMatch, answers: Record<string, ReadingAnswer>, questions: MeasurementQuestion[]): number {
  const w = q.what;
  if (!w) return NaN;
  const key = `${q.id}:${questionKey(q, m, answers)}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  let v: number;
  if (w.kind === 'formula') {
    const vals: Record<string, number> = {};
    for (const u of w.uses) {
      const uq = questions.find((x) => x.id === u);
      const a = answers[u];
      const r = uq && a?.input !== undefined ? readAnswer({ unit: uq.unit }, a.input) : null;
      vals[u] = r && 'value' in r ? r.value : NaN;
    }
    v = evalFormula(w.expr, vals);
  } else if (w.kind === 'current') v = probeBoard(m.circuit, q.set, m.mapping, m.pinMap).current(w.el, w.mode);
  else if (w.kind === 'voltage') v = probeBoard(m.circuit, q.set, m.mapping, m.pinMap).voltage(w.pin, w.ref);
  else v = w.solve ? solveFrequency(q, w, m) : scopeValue(q, w, m);
  if (cache.size > 500) cache.clear();
  if (w.kind !== 'formula') cache.set(key, v);
  return v;
}

/** Evaluate "uoc / isc" with the given values (NaN if a value is missing or the result isn't finite). */
export function evalFormula(expr: string, vals: Record<string, number>): number {
  let missing = false;
  const text = expr.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (name) => {
    if (!(name in vals)) return name;
    const v = vals[name];
    if (!Number.isFinite(v)) missing = true;
    return `(${v.toExponential(12)})`;
  });
  if (missing) return NaN;
  const r = evalExpr(text);
  return 'value' in r ? r.value : NaN;
}

/** Board values of every measured question for a layout matched to the target — used by the
 *  validator on the reference solution (formulas fed with the board's own values). */
export function referenceValues(ch: Challenge, m: BoardMatch): Map<string, number> {
  const out = new Map<string, number>();
  const answers: Record<string, ReadingAnswer> = {};
  for (const q of ch.measurements) {
    if (!q.what) continue;
    const v = boardValue(q, m, answers, ch.measurements);
    out.set(q.id, v);
    // later formulas see this value as if the student had typed it exactly
    if (Number.isFinite(v)) answers[q.id] = { input: `${v / (splitUnit(q.unit)?.scale ?? 1)}` };
  }
  return out;
}

/* ------------------------------------------------------------------ grading */

export interface Grade extends AnswerCheck {
  /** the typed value could not be read (no verdict) */
  unreadable?: boolean;
}

/** Judge a typed reading against the board's value. */
export function gradeReading(q: MeasurementQuestion, expected: number, input: string): Grade {
  if (!Number.isFinite(expected))
    return { ok: false, reason: tr('这块面包板上读不出这个量（检查电路和设置）。', "This quantity can't be read on your board (check the circuit and settings).") };
  const r = readAnswer({ unit: q.unit }, input);
  if ('reason' in r) return { ok: false, reason: r.reason, unreadable: true };
  if (q.tolAbs > 0 && Math.abs(r.value - expected) <= q.tolAbs) return { ok: true, value: r.value };
  const res: Grade = checkAnswer({ id: q.id, ask: q.ask, answer: expected, unit: q.unit, tol: q.tol, tolDeg: q.tolDeg }, input);
  // phase: the reader's own "leading or lagging?" fits; amplitudes and currents get the instrument wording
  if (res.diagnosis === 'sign' && !(q.what?.kind === 'scope' && q.what.measure === 'phase')) {
    const w = q.what;
    res.reason =
      w?.kind === 'current'
        ? tr(
            '大小对了，符号反了——电流表的表笔方向和题目的参考方向相反？读数为正时电流从红表笔（+）流进。',
            "Right size, wrong sign — are the meter's leads the other way round from the reference direction? A positive reading means the current enters at the red (+) lead.",
          )
        : w?.kind === 'formula'
          ? tr('大小对了，符号反了——检查你代入的读数的正负。', 'Right size, wrong sign — check the signs of the readings you used.')
          : tr(
              '大小对了，符号反了——红黑表笔（或探头和参考点）是不是对调了？读数 = V(红) − V(黑)。',
              'Right size, wrong sign — are the red and black leads (or the probe and its reference) swapped? The reading is V(red) − V(black).',
            );
  }
  return res;
}

/** Percent difference of a measured value from a prediction ("+3.2 %"), or '' when meaningless. */
export function percentDiff(predicted: number, measured: number): string {
  if (!Number.isFinite(predicted) || !Number.isFinite(measured) || Math.abs(predicted) < 1e-15) return '';
  const d = ((measured - predicted) / Math.abs(predicted)) * 100;
  return `${d >= 0 ? '+' : '−'}${fmtNum(parseFloat(Math.abs(d).toPrecision(2)))}%`;
}

/** The value typed for a question, in SI units (null when unreadable / empty). */
export function typedValue(q: MeasurementQuestion, text: string | undefined): number | null {
  if (text === undefined || !text.trim()) return null;
  const r = readAnswer({ unit: q.unit }, text);
  return 'value' in r ? r.value : null;
}

/** A question's answer counts: right, and graded against the board as it is now. */
export function isAnswered(q: MeasurementQuestion, a: ReadingAnswer | undefined, m: BoardMatch | null, answers: Record<string, ReadingAnswer>): boolean {
  if (!a?.ok) return false;
  if (!q.what) return true;
  return !!m && a.key === questionKey(q, m, answers);
}

/** Formula questions open once every question they use is answered. */
export function isUnlocked(q: MeasurementQuestion, answers: Record<string, ReadingAnswer>): boolean {
  return q.what?.kind !== 'formula' || q.what.uses.every((u) => answers[u]?.ok);
}

/** Submit a typed reading / a choice: the new stored answer and its grade. */
export function submitAnswer(
  ch: Challenge,
  q: MeasurementQuestion,
  m: BoardMatch,
  answers: Record<string, ReadingAnswer>,
  input: string | number,
): { answer: ReadingAnswer; grade: Grade } {
  const prev = answers[q.id] ?? {};
  if (!q.what) {
    const choice = input as number;
    const ok = choice === q.correct;
    return { answer: { ...prev, choice, ok, stale: false, tries: (prev.tries ?? 0) + 1 }, grade: { ok } };
  }
  const text = String(input);
  const grade = gradeReading(q, boardValue(q, m, answers, ch.measurements), text);
  if (grade.unreadable) return { answer: prev, grade };
  return { answer: { ...prev, input: text, ok: grade.ok, key: questionKey(q, m, answers), stale: false, tries: (prev.tries ?? 0) + 1 }, grade };
}

/**
 * Re-grade stored readings whose board state changed since they were judged (the student
 * edited the board, or a formula's inputs changed). A reading that was right and no longer
 * matches is marked stale. Returns the same object when nothing changed.
 */
export function revalidate(ch: Challenge, rd: ChallengeReadings, m: BoardMatch): ChallengeReadings {
  let answers = rd.answers;
  let changed = false;
  for (const q of ch.measurements) {
    const a = answers[q.id];
    if (!q.what || a?.input === undefined || a.ok === undefined) continue;
    const key = questionKey(q, m, answers);
    if (key === a.key) continue;
    const g = gradeReading(q, boardValue(q, m, answers, ch.measurements), a.input);
    answers = { ...answers, [q.id]: { ...a, ok: g.ok, key, stale: (a.ok || a.stale) && !g.ok } };
    changed = true;
  }
  return changed ? { ...rd, answers } : rd;
}

/** Every required question answered against the current board. */
export function allAnswered(ch: Challenge, rd: ChallengeReadings, m: BoardMatch | null): boolean {
  return ch.measurements.every((q) => !q.required || isAnswered(q, rd.answers[q.id], m, rd.answers));
}

/** Is the board (as matched) already in the state the question's reading is taken in? A
 *  swept generator's frequency is not compared (the student is tuning it). */
export function boardInState(q: MeasurementQuestion, m: BoardMatch): boolean {
  let set = q.set;
  if (q.what?.kind === 'scope' && q.what.solve) {
    const { frequency: _f, ...rest } = set[q.what.solve.el] ?? {};
    void _f;
    set = { ...set, [q.what.solve.el]: rest };
  }
  const after = applySet(m.circuit, set, m.mapping, m.pinMap);
  return m.circuit.components.every((c, i) => c === after.components[i] || JSON.stringify(sortKeys(c.props)) === JSON.stringify(sortKeys(after.components[i].props)));
}
