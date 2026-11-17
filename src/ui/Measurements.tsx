// Task panel, stage 2 of a lab: measurement questions (core/readings.ts). The student reads
// their own instruments and types the reading; it is judged against their own board. Locked
// until the circuit check passes (predictions can be written before); answers are re-graded,
// or marked stale, when the board changes.

import { useEffect, useMemo, useState } from 'react';
import type { Challenge, MeasurementQuestion } from '../core/challenge';
import { describeSet } from '../core/check';
import { tr } from '../core/i18n';
import {
  allAnswered,
  boardInState,
  emptyReadings,
  isAnswered,
  isUnlocked,
  matchBoard,
  percentDiff,
  revalidate,
  structureKey,
  submitAnswer,
  typedValue,
  type BoardMatch,
  type ChallengeReadings,
  type Grade,
  type ReadingAnswer,
} from '../core/readings';
import { fmtNum, splitUnit } from '../core/problem/answer';
import { useDerived } from '../state/derived';
import { useStore } from '../state/store';
import { Icon } from './Icons';
import { Md } from './Md';

export interface MeasureState {
  /** the circuit check passed for the board as it is now (wiring + values) */
  passed: boolean;
  /** it passed once, but the circuit has been changed since */
  changed: boolean;
  match: BoardMatch | null;
  readings: ChallengeReadings;
  done: number;
  required: number;
  complete: boolean;
}

/** Stage status of a challenge's measurement questions, kept in sync with the board. */
export function useMeasureState(ch: Challenge): MeasureState {
  const { nl } = useDerived();
  const rd = useStore((s) => s.readings[ch.id]) ?? EMPTY;
  const setReadings = useStore((s) => s.setReadings);
  const key = useMemo(() => (ch.measurements.length ? structureKey(ch, nl.circuit) : ''), [ch, nl.circuit]);
  const passed = !!rd.passed && rd.passed === key && nl.unplaced.length === 0;
  const match = useMemo(() => (passed ? matchBoard(ch, nl.circuit) : null), [passed, ch, nl.circuit]);
  // the board changed under stored answers: re-grade them against it (after paint: may simulate)
  useEffect(() => {
    if (!match) return;
    const t = setTimeout(() => {
      const cur = useStore.getState().readings[ch.id] ?? EMPTY;
      const next = revalidate(ch, cur, match);
      if (next !== cur) setReadings(ch.id, next);
    }, 120);
    return () => clearTimeout(t);
  }, [match, rd.answers, ch, setReadings]);
  const required = ch.measurements.filter((q) => q.required).length;
  const done = ch.measurements.filter((q) => q.required && isAnswered(q, rd.answers[q.id], match, rd.answers)).length;
  return { passed: !!match, changed: !!rd.passed && !passed, match, readings: rd, done, required, complete: !!match && allAnswered(ch, rd, match) };
}

const EMPTY: ChallengeReadings = emptyReadings();

/** "① Circuit ✓ → ② Measurements 2/5" */
export function StageBar({ circuitOk, st }: { circuitOk: boolean; st: MeasureState }) {
  return (
    <ol className="stages" aria-label={tr('完成进度', 'Progress')}>
      <li className={circuitOk ? 'ok' : ''}>
        <span className="stage-n">{circuitOk ? '✓' : '1'}</span> {tr('电路正确', 'Circuit right')}
      </li>
      <li className={st.complete ? 'ok' : circuitOk ? 'cur' : ''}>
        <span className="stage-n">{st.complete ? '✓' : '2'}</span> {tr('测量', 'Measurements')}{' '}
        <b>
          {st.done}/{st.required}
        </b>
      </li>
    </ol>
  );
}

/** A typed value shown in the question's unit: "8.84m" in a mA box → "8.84". */
function fmtTyped(q: MeasurementQuestion, text: string | undefined): string {
  const v = typedValue(q, text);
  if (v === null) return text ?? '';
  return fmtNum(parseFloat((v / (splitUnit(q.unit)?.scale ?? 1)).toPrecision(4)));
}

/** One question: optional prediction, then the reading (or the options of a multiple choice). */
function Question({
  q,
  n,
  st,
  feedback,
  onAnswer,
  onPredict,
  busy,
}: {
  q: MeasurementQuestion;
  n: number;
  st: MeasureState;
  feedback: Grade | undefined;
  onAnswer: (q: MeasurementQuestion, input: string | number) => void;
  onPredict: (q: MeasurementQuestion, text: string) => void;
  busy: boolean;
}) {
  const a: ReadingAnswer = st.readings.answers[q.id] ?? {};
  const [draft, setDraft] = useState(a.input ?? '');
  const [pdraft, setPdraft] = useState(a.predict ?? '');
  const [perr, setPerr] = useState<string | null>(null);
  useEffect(() => setDraft(a.input ?? ''), [a.input]);
  useEffect(() => setPdraft(a.predict ?? ''), [a.predict]);

  const answered = isAnswered(q, a, st.match, st.readings.answers);
  const needsPredict = q.predict && !a.predict;
  const unlocked = isUnlocked(q, st.readings.answers);
  const waiting = q.what?.kind === 'formula' && !unlocked ? q.what.uses.filter((u) => !st.readings.answers[u]?.ok) : [];
  const canMeasure = st.passed && unlocked && !needsPredict;
  const predicted = q.predict ? typedValue(q, a.predict) : null;
  const measured = answered ? typedValue(q, a.input) : null;
  const setDesc = Object.keys(q.set).length ? describeSet(q.set, st.match?.mapping, st.match?.pinMap) : '';
  const offState = st.match && setDesc && !answered && !boardInState(q, st.match);
  const status = answered ? 'ok' : a.stale ? 'stale' : a.ok === false ? 'bad' : '';
  const label = tr(`第 ${n} 题`, `Question ${n}`);

  return (
    <li className={`mq ${status} ${canMeasure || answered ? '' : 'locked'}`}>
      <div className="mq-head">
        <span className="mq-n" aria-hidden>
          {answered ? '✓' : n}
        </span>
        <div className="mq-ask">
          <Md text={q.ask} />
          {setDesc && (
            <div className={`mq-state ${offState ? 'off' : ''}`}>
              {tr('状态：', 'State: ')}
              {setDesc}
              {offState ? tr('——你的面包板现在不是这个状态，先调好再读数', ' — your board is not in this state now; set it first, then read') : ''}
            </div>
          )}
        </div>
      </div>

      {q.predict && (
        <form
          className="mq-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (a.input !== undefined) return;
            if (typedValue(q, pdraft) === null) {
              setPerr(tr('预测要写成一个数，例如 8.8 或 9/1.02', 'Write the prediction as a number, e.g. 8.8 or 9/1.02'));
              return;
            }
            setPerr(null);
            onPredict(q, pdraft);
          }}
        >
          <span className="mq-label">{tr('预测', 'Predict')}</span>
          {a.input !== undefined ? (
            <span className="mq-fixed">
              {fmtTyped(q, a.predict) || '—'} {q.unit}
            </span>
          ) : (
            <>
              <div className="pr-input">
                <input
                  value={pdraft}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder={tr('算出来的值', 'Your calculation')}
                  aria-label={`${label}: ${tr('预测值', 'prediction')}`}
                  onChange={(e) => setPdraft(e.target.value)}
                />
                {q.unit ? <span className="pr-unit">{q.unit}</span> : null}
              </div>
              <button type="submit" disabled={!pdraft.trim() || pdraft === a.predict}>
                <Icon name="edit" size={15} /> {a.predict ? tr('修改', 'Update') : tr('记下', 'Save')}
              </button>
            </>
          )}
        </form>
      )}
      {perr && <div className="pr-feedback bad mq-fb">{perr}</div>}

      {q.choices ? (
        <div className="mq-choices" role="group" aria-label={label}>
          {q.choices.map((c, i) => {
            const picked = a.choice === i;
            const cls = picked ? (i === q.correct ? 'right' : 'wrong') : '';
            return (
              <button key={i} className={`pr-choice ${cls}`} disabled={!st.passed || busy || answered} onClick={() => onAnswer(q, i)}>
                <span className="pr-choice-key">{String.fromCharCode(65 + i)}</span>
                <span>{c}</span>
                {cls === 'right' && <Icon name="check" size={16} />}
                {cls === 'wrong' && <span aria-hidden>✗</span>}
                {cls && <span className="sr-only">{cls === 'right' ? tr('（正确）', ' (right)') : tr('（不对）', ' (wrong)')}</span>}
              </button>
            );
          })}
        </div>
      ) : answered ? (
        <div className="mq-row">
          <span className="mq-label">{q.what?.kind === 'formula' ? tr('计算', 'Result') : tr('读数', 'Reading')}</span>
          <span className="mq-fixed">
            {fmtTyped(q, a.input)} {q.unit}
          </span>
        </div>
      ) : (
        <form
          className="mq-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (canMeasure && draft.trim()) onAnswer(q, draft);
          }}
        >
          <span className="mq-label">{q.what?.kind === 'formula' ? tr('计算', 'Result') : tr('读数', 'Reading')}</span>
          <div className={`pr-input ${status === 'ok' ? 'ok' : status ? (feedback?.close ? 'close' : 'bad') : ''}`}>
            <input
              value={draft}
              spellCheck={false}
              autoComplete="off"
              disabled={!canMeasure}
              placeholder={
                !st.passed
                  ? tr('先通过电路检查', 'Pass the circuit check first')
                  : needsPredict
                    ? tr('先写下预测', 'Predict first')
                    : waiting.length
                      ? tr('先答出前面的读数', 'Answer the readings first')
                      : q.what?.kind === 'formula'
                        ? tr('用你的读数算', 'From your readings')
                        : tr('你的面包板上的读数', 'What your board reads')
              }
              aria-label={`${label}: ${q.what?.kind === 'formula' ? tr('计算结果', 'result') : tr('读数', 'reading')}`}
              onChange={(e) => setDraft(e.target.value)}
            />
            {q.unit ? <span className="pr-unit">{q.unit}</span> : null}
          </div>
          <button type="submit" className="primary" disabled={!canMeasure || !draft.trim() || busy}>
            <Icon name="check" size={15} /> {busy ? '…' : tr('提交', 'Submit')}
          </button>
        </form>
      )}

      {a.stale && !answered ? (
        <div className="pr-feedback close mq-fb" role="status">
          <b>
            <Icon name="alert" size={14} /> {tr('面包板变了', 'The board changed')}
          </b>{' '}
          —{' '}
          {q.what?.kind === 'formula'
            ? tr('它用到的读数改了，按新的读数重新算。', 'the readings it uses have changed; work it out again from them.')
            : tr('这个读数和现在的电路对不上了，重新测量。', 'this reading no longer matches the circuit as it is now; measure it again.')}
        </div>
      ) : feedback && !answered ? (
        <div className={`pr-feedback ${feedback.close ? 'close' : 'bad'} mq-fb`} role="status">
          <b>
            {feedback.unreadable || feedback.value === undefined
              ? `✗ ${tr('无法判断', "Can't check")}`
              : feedback.close
                ? `≈ ${tr('很接近', 'Close')}`
                : `✗ ${tr('不对', 'Not quite')}`}
          </b>
          {feedback.reason
            ? ` — ${feedback.reason}`
            : q.choices
              ? tr(' — 再想想，对照你的读数。', ' — think again, using your readings.')
              : tr(' — 再看一次仪表：表笔接对地方了吗？状态调对了吗？', ' — look at the instrument again: are the leads in the right place, and is the board in the right state?')}
        </div>
      ) : !answered && a.ok === false && !st.passed ? null : !answered && a.ok === false ? (
        <div className="pr-feedback bad mq-fb">✗ {tr('上次的答案不对', 'Your last answer was wrong')}</div>
      ) : null}

      {answered && (
        <div className="pr-feedback ok mq-fb" role="status">
          <b>✓ {q.choices ? tr('正确', 'Right') : tr('和你的面包板一致', 'Matches your board')}</b>
          {predicted !== null && measured !== null && (
            <span className="mq-cmp">
              {tr('预测', 'predicted')} {fmtTyped(q, a.predict)} {q.unit} · {tr('测得', 'measured')} {fmtTyped(q, a.input)} {q.unit} ·{' '}
              <b>{percentDiff(predicted, measured) || '—'}</b>
            </span>
          )}
        </div>
      )}
      {answered && q.explain && (
        <div className="mq-explain">
          <Md text={q.explain} />
        </div>
      )}
    </li>
  );
}

/** Stage 2 section of the task panel. */
export function MeasurementSection({ ch, st, onComplete }: { ch: Challenge; st: MeasureState; onComplete: () => void }) {
  const setReadings = useStore((s) => s.setReadings);
  const [feedback, setFeedback] = useState<Record<string, Grade>>({});
  const [busy, setBusy] = useState<string | null>(null);
  // feedback text is for the board it was given on
  useEffect(() => setFeedback({}), [st.match]);

  const save = (answers: Record<string, ReadingAnswer>) => {
    const cur = useStore.getState().readings[ch.id] ?? EMPTY;
    const next = { ...cur, answers };
    setReadings(ch.id, next);
    return next;
  };
  const onPredict = (q: MeasurementQuestion, text: string) => {
    const cur = useStore.getState().readings[ch.id] ?? EMPTY;
    save({ ...cur.answers, [q.id]: { ...cur.answers[q.id], predict: text } });
  };
  const onAnswer = (q: MeasurementQuestion, input: string | number) => {
    const m = st.match;
    if (!m) return;
    setBusy(q.id);
    // let the "…" paint first: a frequency sweep runs a few dozen simulations
    setTimeout(() => {
      try {
        const cur = useStore.getState().readings[ch.id] ?? EMPTY;
        const { answer, grade } = submitAnswer(ch, q, m, cur.answers, input);
        setFeedback((f) => ({ ...f, [q.id]: grade }));
        if (answer !== cur.answers[q.id]) {
          const next = save({ ...cur.answers, [q.id]: answer });
          if (grade.ok && allAnswered(ch, next, m)) onComplete();
        }
      } finally {
        setBusy(null);
      }
    }, 20);
  };

  return (
    <section className="mq-section" aria-label={tr('测量', 'Measurements')}>
      <div className="mq-title">
        <span className="eyebrow">{tr('测量 · 读你自己的仪表', 'Measurements · read your own instruments')}</span>
        <b className="mq-count">
          {st.done}/{st.required}
        </b>
      </div>
      {!st.passed && (
        <p className="mq-lock" role="note">
          <Icon name="lock" size={14} />{' '}
          {st.changed
            ? tr(
                '你改动了电路。再点一次「检查我的电路」，通过后继续测量（已答的读数会按新电路重新核对）。',
                'You changed the circuit. Press "Check my circuit" again; once it passes, carry on (answered readings are re-checked against the new circuit).',
              )
            : tr(
                '先搭好电路并通过「检查我的电路」，读数框才会解锁。预测现在就可以写。',
                'Build the circuit and pass "Check my circuit" to unlock the reading boxes. You can write your predictions now.',
              )}
        </p>
      )}
      {st.passed && (
        <p className="note">
          {tr(
            '答案按你自己面包板上的元件值来判（不是课本上的数）：电流表、万用表、示波器上读到什么就填什么。可以写单位前缀或算式，如 8.84m、1.2e-3、9/1.02。',
            'Answers are judged against your own board (its actual part values, not the textbook numbers): type what the ammeter, multimeter or scope shows. Prefixes and calculations are fine, e.g. 8.84m, 1.2e-3, 9/1.02.',
          )}
        </p>
      )}
      <ol className="mq-list">
        {ch.measurements.map((q, i) => (
          <Question key={q.id} q={q} n={i + 1} st={st} feedback={feedback[q.id]} onAnswer={onAnswer} onPredict={onPredict} busy={busy === q.id} />
        ))}
      </ol>
      {st.complete && ch.compare && (
        <details className="fold" open>
          <summary>{tr('对比 · 计算与读数', 'Compare · calculation vs readings')}</summary>
          <Md text={ch.compare} />
        </details>
      )}
    </section>
  );
}
