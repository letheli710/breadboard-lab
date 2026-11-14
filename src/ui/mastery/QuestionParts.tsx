// Building blocks shared by the blind retry, the review session and the quiz: the problem's
// statement and drawing (no hints, no solution), a question part answered "blind" with the normal
// feedback afterwards, and the feedback / solution view used after a quiz.

import { useState } from 'react';
import { tr } from '../../core/i18n';
import { formatAnswer, type AnswerCheck } from '../../core/problem/answer';
import type { Problem } from '../../core/problem/parse';
import type { Question } from '../../core/problem/types';
import type { Via } from '../../state/mastery';
import { useMastery } from '../../state/masteryStore';
import { useProblem, type ProblemEntry } from '../../state/problems';
import { grade, type Graded } from '../../state/quiz';
import { useStore } from '../../state/store';
import { GraphFigure } from '../GraphFigure';
import { Icon } from '../Icons';
import { ProblemSchematic } from '../ProblemSchematic';
import { PrMd, Sym } from '../richText';
import { UiPlot } from '../UiPlot';

/** The full problem of an index entry (null while loading; an error text when it can't load). */
export function useEntryProblem(pid: string): { entry: ProblemEntry | null; problem: Problem | null; error: string | null } {
  const entry = useStore((s) => s.problems.find((p) => p.id === pid)) ?? null;
  const r = useProblem(entry);
  return { entry, problem: r?.problem ?? null, error: r && !r.problem ? r.errors.join('; ') || tr('无法加载', "Can't be loaded") : null };
}

/** Statement + drawing only: no hints, no worked solution, no key-points link. */
export function ProblemContext({ p, highlight }: { p: Problem; highlight?: string[] }) {
  return (
    <div className="ms-context">
      <h3 className="ms-ptitle">
        <Sym text={p.title} />
      </h3>
      <div className="pr-statement">
        <PrMd text={p.statement} />
      </div>
      <div className="schem-card pr-schem ms-schem">
        <ProblemSchematic schematic={p.schematic} highlight={highlight} />
      </div>
      {p.schematic.plot && <UiPlot schematic={p.schematic} />}
      {p.schematic.graph && <GraphFigure graph={p.schematic.graph} />}
    </div>
  );
}

const highlightOf = (q: Question) => (q.find && 'el' in q.find && typeof q.find.el === 'string' ? [q.find.el] : q.find && 'input' in q.find ? [q.find.input] : undefined);

/** The normal feedback for a graded answer: ✓ / ✗ with the checker's diagnosis, the right answer,
 *  the option's explanation. */
export function Feedback({ q, g, showAnswer }: { q: Question; g: Graded; showAnswer: boolean }) {
  const why = q.choices && g.input ? q.choiceExplain?.[g.input.charCodeAt(0) - 65] : undefined;
  const check: AnswerCheck | undefined = g.check;
  return (
    <div className={`pr-feedback ${g.ok ? 'ok' : check?.close ? 'close' : 'bad'}`} role="status">
      <b>
        {g.ok
          ? `✓ ${tr('正确！', 'Correct!')}`
          : g.type === 'blank'
            ? `– ${tr('未作答', 'Not answered')}`
            : check?.close
              ? `≈ ${tr('很接近', 'Close')}`
              : `✗ ${tr('不对', 'Not quite')}`}
      </b>
      {!g.ok && check?.reason ? ` — ${check.reason}` : ''}
      {why ? (
        <>
          {' — '}
          <Sym text={why} />
        </>
      ) : null}
      {(showAnswer || g.ok) && (
        <span className="ms-answer">
          {' · '}
          {tr('标准答案', 'Answer')}:{' '}
          <b>
            {q.choices ? (
              <>
                {String.fromCharCode(65 + (q.correct ?? 0))}. <Sym text={q.choices[q.correct ?? 0]} />
              </>
            ) : (
              formatAnswer(q)
            )}
          </b>
        </span>
      )}
    </div>
  );
}

/** Explanation of the part + the worked solution (collapsed). */
export function SolutionBlock({ p, q }: { p: Problem; q: Question }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {q.explain && (
        <div className="pr-explain">
          <PrMd text={q.explain} />
        </div>
      )}
      {p.solution && (
        <div className={`pr-solution ${open ? 'open' : ''}`}>
          <button className="pr-sol-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
            <Icon name="book" size={16} />
            {open ? tr('收起解答过程', 'Hide the worked solution') : tr('查看完整解答过程', 'Show the worked solution')}
          </button>
          {open && (
            <div className="pr-sol-body">
              <PrMd text={p.solution} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

/** Answer input for one part: a text box (+ unit) or the options. No feedback of its own. */
export function AnswerInput({
  q,
  input,
  choice,
  onInput,
  onChoice,
  onSubmit,
  label,
  disabled,
}: {
  q: Question;
  input: string;
  choice: number | undefined;
  onInput: (s: string) => void;
  onChoice: (i: number) => void;
  onSubmit?: () => void;
  label: string;
  disabled?: boolean;
}) {
  if (q.choices)
    return (
      <div className="pr-choices" role="radiogroup" aria-label={label}>
        {q.choices.map((c, i) => (
          <button key={i} role="radio" aria-checked={choice === i} className={`pr-choice ${choice === i ? 'picked' : ''}`} disabled={disabled} onClick={() => onChoice(i)}>
            <span className="pr-choice-key">{String.fromCharCode(65 + i)}</span>
            <span>
              <Sym text={c} />
            </span>
          </button>
        ))}
      </div>
    );
  return (
    <form
      className="pr-answer"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="pr-input">
        <input
          value={input}
          spellCheck={false}
          autoComplete="off"
          disabled={disabled}
          placeholder={tr('输入答案或算式', 'Answer or calculation')}
          aria-label={label}
          onChange={(e) => onInput(e.target.value)}
        />
        {q.unit ? <span className="pr-unit">{q.unit}</span> : null}
      </div>
      {onSubmit && (
        <button type="submit" className="primary" disabled={disabled || !input.trim()}>
          <Icon name="check" size={16} /> {tr('检查', 'Check')}
        </button>
      )}
    </form>
  );
}

/** A question part answered blind (previous answers and the solution hidden): the first answer
 *  decides — a first-try success on a later day clears / promotes the notebook entry, a mistake
 *  sends it back to box 1. Then the normal feedback, further tries, the answer and the solution. */
export function BlindQuestion({ pid, qid, via, onDone }: { pid: string; qid: string; via: Exclude<Via, 'quiz' | 'practice'>; onDone?: (ok: boolean) => void }) {
  const { problem: p, error } = useEntryProblem(pid);
  const record = useMastery((s) => s.record);
  const [input, setInput] = useState('');
  const [choice, setChoice] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<Graded | null>(null);
  const [tries, setTries] = useState(0);
  const [firstOk, setFirstOk] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  if (error) return <p className="pr-feedback bad">{error}</p>;
  if (!p) return <p className="muted">{tr('正在加载题目…', 'Loading the problem…')}</p>;
  const q = p.questions.find((x) => x.id === qid);
  if (!q) return <p className="pr-feedback bad">{tr('这道题的这一问已经不存在了。', 'This question part no longer exists.')}</p>;
  const solved = !!result?.ok;
  const finished = solved || revealed;

  const attempt = (a: { input?: string; choice?: number }) => {
    const g = grade(q, a);
    // unreadable input (no value) isn't an attempt, as in practice
    if (!g.ok && g.check && g.check.value === undefined) {
      setResult(g);
      return;
    }
    setResult(g);
    if (g.type === 'blank') return;
    const first = tries === 0 && !revealed;
    setTries(tries + 1);
    if (first) setFirstOk(g.ok);
    if (g.ok) record(pid, qid, { kind: 'right', unaided: first, input: g.input }, via);
    else record(pid, qid, { kind: 'wrong', type: g.type ?? 'wrong', input: g.input }, via);
  };
  const reveal = () => {
    setRevealed(true);
    if (firstOk === null) setFirstOk(false);
    if (!solved) record(pid, qid, { kind: 'reveal' }, via);
  };

  return (
    <div className="ms-blind" data-pid={pid} data-qid={qid}>
      <ProblemContext p={p} highlight={highlightOf(q)} />
      <div className={`pr-q ${solved ? 'solved' : ''}`}>
        <div className="pr-q-head">
          <span className="pr-q-num">{solved ? '✓' : String.fromCharCode(97 + p.questions.indexOf(q))}</span>
          <div className="pr-q-ask">
            <PrMd text={q.ask} />
          </div>
        </div>
        <AnswerInput
          q={q}
          input={input}
          choice={choice}
          disabled={finished}
          label={tr('答案', 'Answer')}
          onInput={(s) => {
            setInput(s);
            setResult(null);
          }}
          onChoice={(i) => {
            setChoice(i);
            attempt({ choice: i });
          }}
          onSubmit={() => attempt({ input })}
        />
        {result && <Feedback q={q} g={result} showAnswer={revealed} />}
        {!finished && (
          <div className="pr-q-tools">
            <button className="pr-link" onClick={reveal}>
              <Icon name="eye" size={15} /> {tr('看答案', 'Show answer')}
            </button>
          </div>
        )}
        {revealed && !solved && (
          <p className="pr-revealed">
            {tr('答案', 'Answer')}:{' '}
            <b>
              {q.choices ? (
                <>
                  {String.fromCharCode(65 + (q.correct ?? 0))}. <Sym text={q.choices[q.correct ?? 0]} />
                </>
              ) : (
                formatAnswer(q)
              )}
            </b>
          </p>
        )}
        {finished && <SolutionBlock p={p} q={q} />}
      </div>
      {onDone && (finished || tries > 0) && (
        <div className="row ms-next">
          {!finished && <span className="muted small">{tr('可以再试一次，或看答案后继续。', 'Try again, or show the answer and go on.')}</span>}
          <button className="primary" onClick={() => onDone(!!firstOk)}>
            {tr('下一题', 'Next')} <Icon name="next" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
