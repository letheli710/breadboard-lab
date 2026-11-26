// The single-track rail (docs/RAIL_PLAN.md, CHALLENGE_FORMAT §17, core/rail.ts): the task panel
// as one vertical sequence. Only the active node is open (dark frame); done nodes fold to one line
// with a result chip and can be reopened; nodes still to come show only their title, in grey, and
// can't be opened. No tabs, no locks, nothing opens over the panel: a node shows the figure, the
// teardown layer, the derivation or the measurement question it needs, in place.

import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Challenge } from '../core/challenge';
import { tr } from '../core/i18n';
import { chapterById } from '../core/problem/chapters';
import { readAnswer, splitUnit } from '../core/problem/answer';
import { isAnswered, typedValue } from '../core/readings';
import type { Derivation, RailKind, RailNode } from '../core/rail';
import { fmtNum } from '../core/problem/answer';
import { readStored, writeStored } from '../state/persist';
import { useLang, useStore } from '../state/store';
import { useCalcs, useTeardown } from '../inside/hooks';
import { teardownsFor } from '../inside/registry';
import { markSeen } from '../inside/pages';
import { CalcCardView } from '../inside/CalcCardView';
import { TeardownSlice } from '../inside/TeardownView';
import { inline } from '../inside/InsideMd';
import { MathText } from './mathText';
import { Icon } from './Icons';
import { Md } from './Md';
import { Question, revealOf, useMeasureActions, type MeasureState } from './Measurements';
import { StepStatus } from './StepCheck';
import type { StepChecks } from './Cards';
import { NextInCourse } from './Cards';

const CardFigureView = lazy(() => import('./CardFigure'));

/* ------------------------------------------------------------------ stored position */

interface RailMemo {
  /** index of the active node */
  pos: number;
  /** steps without a check that the student marked done */
  ticked: number[];
  /** steps done, in order: a step counts once its check passed while it was the current step (a
   *  check such as "these holes are empty" can pass long before the step that asks for it) */
  done?: number[];
  /** derivations revealed to the end */
  derived?: string[];
}
const KEY = 'bb.rail';
const readAll = (): Record<string, RailMemo> =>
  readStored<Record<string, RailMemo>>(KEY, {}, (v) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, RailMemo>) : undefined));
const readMemo = (id: string): RailMemo => {
  const m = readAll()[id];
  return {
    pos: typeof m?.pos === 'number' && m.pos >= 0 ? m.pos : 0,
    ticked: Array.isArray(m?.ticked) ? m.ticked.filter((x) => typeof x === 'number') : [],
    done: Array.isArray(m?.done) ? m.done.filter((x) => typeof x === 'number') : [],
    derived: Array.isArray(m?.derived) ? m.derived.filter((x) => typeof x === 'string') : [],
  };
};
const writeMemo = (id: string, m: RailMemo) => writeStored(KEY, { ...readAll(), [id]: m });

/* ------------------------------------------------------------------ labels */

const KIND: Record<RailKind, { icon: string; zh: string; en: string }> = {
  look: { icon: 'search', zh: '先看一眼', en: 'Look first' },
  build: { icon: 'build', zh: '动手搭', en: 'Build' },
  measure: { icon: 'gauge', zh: '测一测', en: 'Measure' },
  think: { icon: 'bulb', zh: '想明白', en: 'Why' },
  wrap: { icon: 'wrap', zh: '带走', en: 'Take away' },
};
export const railKindLabel = (k: RailKind) => tr(KIND[k].zh, KIND[k].en);

/** The nodes shown: a file's rail, and for a rail made from cards, a "look" node first that
 *  shows the outside of each part this lab introduces (its teardowns' first layer). */
export function railNodes(ch: Challenge): RailNode[] {
  if (!ch.railAuto) return ch.rail;
  const tds = teardownsFor(ch.id);
  if (!tds.length) return ch.rail;
  const look: RailNode = {
    kind: 'look',
    title: tr(`先认识它：${tds.map((t) => t.zh).join('、')}`, `Meet it first: ${tds.map((t) => t.en).join(', ')}`),
    text: tds.map((t) => `![](inside:${t.id}#1)`).join('\n'),
    first: 0,
    count: 0,
    measure: [],
    practice: [],
  };
  return [look, ...ch.rail];
}

/** First line of a step's text, without markdown, for a folded step. */
function plainLine(text: string, n = 46): string {
  const l = text
    .split('\n')
    .find((x) => x.trim() && !x.trim().startsWith('!['))
    ?.replace(/\*\*|`|\$|#+\s/g, '')
    .trim();
  if (!l) return '';
  return l.length > n ? `${l.slice(0, n)}…` : l;
}

/* ------------------------------------------------------------------ embeds */

function InsideEmbed({ id, layer }: { id: string; layer: number }) {
  const td = useTeardown(id);
  const show = useStore((s) => s.setBenchInside);
  useEffect(() => {
    markSeen(id);
  }, [id]);
  if (!td) return <div className="td-slice td-slice-loading" aria-hidden />;
  return <TeardownSlice td={td} layer={layer} onOpen={() => show(id)} />;
}

function CalcEmbed({ id }: { id: string }) {
  const calcs = useCalcs();
  const show = useStore((s) => s.setBenchInside);
  const c = calcs?.cards.find((x) => x.id === id);
  if (!calcs) return <div className="calc-inline cf-loading" aria-hidden />;
  if (!c) return null;
  return (
    <div className="calc-inline">
      <CalcCardView c={c} onTeardown={(t) => show(t)} />
    </div>
  );
}

/** Calculation cards of a rail made from cards: chips that open the card in place (not a dialog). */
function CalcChipsInline({ chId }: { chId: string }) {
  const calcs = useCalcs();
  const [open, setOpen] = useState<string | null>(null);
  const cards = calcs?.cards.filter((c) => c.lessons?.includes(chId)) ?? [];
  if (!cards.length) return null;
  return (
    <div className="rail-calcs">
      <div className="eyebrow">
        <Icon name="calc" size={14} /> {tr('这一步要会算', 'The calculations behind it')}
      </div>
      <ul>
        {cards.map((c) => (
          <li key={c.id}>
            <button className={`lesson-calc ${open === c.id ? 'on' : ''}`} aria-expanded={open === c.id} onClick={() => setOpen(open === c.id ? null : c.id)}>
              <span className="lesson-calc-t">{inline(c.title)}</span>
              <span className="lesson-calc-f">
                <MathText text={c.tex} />
              </span>
            </button>
            {open === c.id && (
              <div className="calc-inline">
                <CalcCardView c={c} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A derivation, one line at a time on a vertical spine; an optional typed result at the end. */
function DeriveBlock({ d, done, onDone }: { d: Derivation; done: boolean; onDone: () => void }) {
  const [shown, setShown] = useState(done ? d.steps.length : 1);
  const [draft, setDraft] = useState('');
  const [verdict, setVerdict] = useState<'ok' | 'bad' | null>(done && d.check ? 'ok' : null);
  const all = shown >= d.steps.length;
  useEffect(() => {
    if (all && !d.check && !done) onDone();
  }, [all]); // eslint-disable-line react-hooks/exhaustive-deps
  const check = () => {
    if (!d.check) return;
    const r = readAnswer({ unit: d.check.unit }, draft);
    if (!('value' in r)) return setVerdict('bad');
    const want = d.check.answer * (splitUnit(d.check.unit)?.scale ?? 1);
    const ok = Math.abs(r.value - want) <= Math.max(Math.abs(want) * d.check.tol, 1e-12);
    setVerdict(ok ? 'ok' : 'bad');
    if (ok) onDone();
  };
  return (
    <div className="derive" role="group" aria-label={d.title || tr('推导', 'Derivation')}>
      {d.title && <div className="derive-title">{d.title}</div>}
      <ol className="derive-spine">
        {d.steps.slice(0, shown).map((s, i) => (
          <li key={i} className={i === shown - 1 && !all ? 'cur' : ''}>
            <Md text={s} math />
          </li>
        ))}
      </ol>
      {!all ? (
        <button className="derive-next" onClick={() => setShown(shown + 1)}>
          {tr('下一行', 'Next line')} ({shown}/{d.steps.length}) <Icon name="down" size={14} />
        </button>
      ) : d.check ? (
        <form
          className="derive-check"
          onSubmit={(e) => {
            e.preventDefault();
            check();
          }}
        >
          <span>{tr('算出来是', 'It comes to')}</span>
          <div className={`pr-input ${verdict === 'ok' ? 'ok' : verdict === 'bad' ? 'bad' : ''}`}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              aria-label={tr('推导的结果', 'Result of the derivation')}
              disabled={verdict === 'ok'}
            />
            {d.check.unit && <span className="pr-unit">{d.check.unit}</span>}
          </div>
          {verdict !== 'ok' && (
            <button type="submit" className="primary" disabled={!draft.trim()}>
              {tr('核对', 'Check')}
            </button>
          )}
          {verdict === 'ok' && <span className="derive-ok">✓</span>}
          {verdict === 'bad' && (
            <span className="derive-bad" role="status">
              {tr('再算一次', 'Not quite — try again')}
            </span>
          )}
        </form>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ the rail */

interface Props {
  ch: Challenge;
  sc: StepChecks;
  ms: MeasureState;
  onComplete: () => void;
  /** the starting kit note (shown in the first build node) */
  startKit?: ReactNode;
  /** the target schematic (in the drawer at the top) */
  target: ReactNode;
  targetLabel: string;
  /** the result of "Check my circuit": shown under the active node, where the student is looking */
  checkSlot?: ReactNode;
}

export function RailPanel({ ch, sc, ms, onComplete, startKit, target, targetLabel, checkSlot }: Props) {
  useLang();
  const nodes = useMemo(() => railNodes(ch), [ch]);
  const [memo, setMemo] = useState<RailMemo>(() => readMemo(ch.id));
  useEffect(() => setMemo(readMemo(ch.id)), [ch.id]);
  const save = (m: RailMemo) => {
    setMemo(m);
    writeMemo(ch.id, m);
  };
  const pos = Math.min(memo.pos, nodes.length - 1);
  const [review, setReview] = useState(false);
  const [openPast, setOpenPast] = useState<Set<number>>(new Set());
  const [drawer, setDrawer] = useState(false);
  const setStep = useStore((s) => s.setStep);
  const act = useMeasureActions(ch, ms, onComplete);
  const figure = useMemo(() => {
    const figs = ch.figures;
    if (!figs || !Object.keys(figs).length) return undefined;
    return (id: string) =>
      figs[id] ? (
        <Suspense fallback={<div className="card-figure cf-loading" aria-hidden />}>
          <CardFigureView fig={figs[id]} />
        </Suspense>
      ) : null;
  }, [ch]);

  const ticked = useMemo(() => new Set(memo.ticked), [memo.ticked]);
  const doneSet = useMemo(() => new Set(memo.done ?? []), [memo.done]);
  const stepDone = (k: number) => doneSet.has(k);
  // advance through the steps in order, up to the active node: the current step is done when its
  // check passes now (or, without a check, when the student ticked it)
  useEffect(() => {
    const set = new Set(memo.done ?? []);
    let changed = false;
    const lastStep = nodes.slice(0, pos + 1).reduce((m, n) => Math.max(m, n.first + n.count), 0);
    for (let k = 0; k < lastStep; k++) {
      if (set.has(k)) continue;
      const u = sc.unmet[k];
      if (u ? u.length === 0 : ticked.has(k)) {
        set.add(k);
        changed = true;
      } else break;
    }
    if (changed) save({ ...memo, done: [...set].sort((a, b) => a - b) });
  }, [sc.unmet, pos, ticked]); // eslint-disable-line react-hooks/exhaustive-deps
  const qById = (id: string) => ch.measurements.find((q) => q.id === id);
  const qDone = (id: string) => {
    const q = qById(id);
    if (!q) return true;
    return isAnswered(q, ms.readings.answers[q.id], ms.match, ms.readings.answers) || !q.required || !!revealOf(ch, q, ms);
  };
  const nodeDone = (n: RailNode) => {
    for (let k = n.first; k < n.first + n.count; k++) if (!stepDone(k)) return false;
    return n.measure.every(qDone);
  };

  // the board highlights the current step of the active node
  const active = nodes[pos];
  const curStep = useMemo(() => {
    if (!active?.count) return -1;
    for (let k = active.first; k < active.first + active.count; k++) if (!stepDone(k)) return k;
    return active.first + active.count - 1;
  }, [active, doneSet]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (curStep >= 0) setStep(curStep);
  }, [curStep, setStep]);

  // a node change by the student: scroll it into view and move focus to its heading
  const moved = useRef(false);
  const activeRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    const h = activeRef.current;
    if (!h) return;
    h.focus({ preventScroll: true });
    h.closest('.rail-node')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [pos]);
  const go = (i: number) => {
    moved.current = true;
    save({ ...memo, pos: Math.max(0, Math.min(i, nodes.length - 1)) });
  };

  const firstBuild = nodes.findIndex((n) => n.kind === 'build');
  const chipOf = (n: RailNode): string | null => {
    for (let i = n.measure.length - 1; i >= 0; i--) {
      const q = qById(n.measure[i]);
      const a = q && ms.readings.answers[q.id];
      if (q && a?.ok) {
        if (q.choices) return '✓';
        const v = typedValue(q, a.input);
        return v === null ? '✓' : `${fmtNum(parseFloat((v / (splitUnit(q.unit)?.scale ?? 1)).toPrecision(3)))} ${q.unit}`;
      }
    }
    if (n.count && nodeDone(n)) return tr('已搭好', 'built');
    return null;
  };

  /** the questions above each embed of a node's text: a picture or derivation placed after a
   *  question explains its answer, so it appears once the question is answered */
  const asksAbove = (n: RailNode) => {
    const out = new Map<string, string[]>();
    const seen: string[] = [];
    for (const l of n.text.split('\n')) {
      const m = /^\s*!\[[^\]]*\]\((measure|inside|derive|calc):([A-Za-z0-9_#-]+)\)\s*$/.exec(l);
      if (!m) continue;
      if (m[1] === 'measure') seen.push(m[2]);
      else out.set(`${m[1]}:${m[2]}`, [...seen]);
    }
    return out;
  };
  const embed = (n: RailNode) => (kind: string, arg: string) => {
    const waitFor =
      asksAbove(n)
        .get(`${kind}:${arg}`)
        ?.filter((id) => !qDone(id)) ?? [];
    if (waitFor.length)
      return (
        <p className="rail-after" key={`${kind}:${arg}`}>
          <Icon name="bulb" size={14} /> {tr('答完上面的题，这里会出现“为什么”。', 'Answer the question above and the “why” appears here.')}
        </p>
      );
    if (kind === 'measure') {
      const q = qById(arg);
      if (!q) return null;
      return questionHere(arg);
    }
    if (kind === 'inside') {
      const [id, l] = arg.split('#');
      return <InsideEmbed id={id} layer={Math.max(0, (parseInt(l, 10) || 1) - 1)} />;
    }
    if (kind === 'derive') {
      const d = ch.derivations[arg];
      if (!d) return null;
      const done = !!memo.derived?.includes(arg);
      return <DeriveBlock key={arg} d={d} done={done} onDone={() => !done && save({ ...memo, derived: [...(memo.derived ?? []), arg] })} />;
    }
    if (kind === 'calc') return <CalcEmbed id={arg} />;
    if (kind === 'steps') return n.count > 0 ? stepList(n, nodes.indexOf(n)) : null;
    return null;
  };

  function questionHere(id: string) {
    const q = qById(id)!;
    const n = ch.measurements.indexOf(q) + 1;
    const stepReady = q.after !== undefined && stepDone(q.after);
    return (
      <ol className="mq-list rail-mq" key={id}>
        <Question
          q={q}
          n={n}
          st={ms}
          feedback={act.feedback[q.id]}
          onAnswer={act.onAnswer}
          onPredict={act.onPredict}
          busy={act.busy === q.id}
          stepReady={stepReady}
          reveal={revealOf(ch, q, ms)}
        />
      </ol>
    );
  }

  const stepList = (n: RailNode, i: number) => (
    <ol className="rail-steps" aria-label={tr('这一步的操作', 'What to do here')}>
      {Array.from({ length: n.count }, (_, j) => {
        const k = n.first + j;
        const done = stepDone(k);
        const cur = k === curStep && i === pos && !done;
        const st = done ? 'done' : cur ? 'cur' : 'todo';
        return (
          <li key={k} className={`rail-step ${st}`} aria-current={cur ? 'step' : undefined}>
            <span className="rail-step-n" aria-hidden>
              {done ? '✓' : j + 1}
            </span>
            <div className="rail-step-body">
              {cur || (i !== pos && !done) ? (
                <>
                  <Md text={ch.steps[k].text} math figure={figure} />
                  <StepStatus unmet={sc.unmet[k]} />
                  {cur && !sc.unmet[k] && (
                    <button className="rail-tick" onClick={() => save({ ...memo, ticked: [...memo.ticked, k] })}>
                      <Icon name="check" size={14} /> {tr('做好了', 'Done')}
                    </button>
                  )}
                </>
              ) : done ? (
                <details>
                  <summary>{plainLine(ch.steps[k].text)}</summary>
                  <Md text={ch.steps[k].text} math figure={figure} />
                </details>
              ) : (
                <span className="rail-step-later">{plainLine(ch.steps[k].text, 30)}</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );

  const nodeBody = (n: RailNode, i: number) => {
    const stepsInText = /^\s*!\[[^\]]*\]\(steps:here\)\s*$/m.test(n.text);
    const inText = new Set(n.text.split('\n').flatMap((l) => /^\s*!\[[^\]]*\]\(measure:([A-Za-z0-9_-]+)\)\s*$/.exec(l)?.[1] ?? []));
    const rest = n.measure.filter((id) => !inText.has(id));
    const needsBoard = n.measure.some((id) => {
      const q = qById(id);
      return q && q.what && !qDone(id);
    });
    return (
      <>
        {i === firstBuild && startKit}
        {n.text && <Md text={n.text} math figure={figure} embed={embed(n)} />}
        {n.count > 0 && !stepsInText && stepList(n, i)}
        {rest.length > 0 && (
          <ol className="mq-list rail-mq">
            {rest.map((id) => {
              const q = qById(id)!;
              return (
                <Question
                  key={id}
                  q={q}
                  n={ch.measurements.indexOf(q) + 1}
                  st={ms}
                  feedback={act.feedback[id]}
                  onAnswer={act.onAnswer}
                  onPredict={act.onPredict}
                  busy={act.busy === id}
                  stepReady={q.after !== undefined && stepDone(q.after)}
                  reveal={revealOf(ch, q, ms)}
                />
              );
            })}
          </ol>
        )}
        {needsBoard && !ms.passed && (
          <div className="rail-gate" role="note">
            <p>
              {ms.changed
                ? tr(
                    '你改动了电路。再检查一次，读数框就会打开（答过的读数会按新电路重新核对）。',
                    'You changed the circuit. Check it again and the reading boxes open (answered readings are re-checked).',
                  )
                : tr(
                    '读数要在你自己的电路上量：先搭好，再检查一次。预测现在就可以写。',
                    'Readings are taken on your own circuit: build it, then check it. You can write predictions now.',
                  )}
            </p>
            <button className="primary" onClick={() => window.dispatchEvent(new Event('bb-run-check'))}>
              <Icon name="check" size={15} /> {tr('检查我的电路', 'Check my circuit')}
            </button>
          </div>
        )}
        {ms.complete && ch.compare && n.measure.length > 0 && n === nodes.filter((x) => x.measure.length).at(-1) && (
          <details className="fold" open>
            <summary>{tr('对比 · 计算与读数', 'Compare · calculation vs readings')}</summary>
            <Md text={ch.compare} />
          </details>
        )}
        {ch.railAuto && n.kind === 'think' && <CalcChipsInline chId={ch.id} />}
        {n.kind === 'wrap' && n.practice.length > 0 && <Practice ids={n.practice} />}
        {n.kind === 'wrap' && <NextInCourse ch={ch} />}
      </>
    );
  };

  const doneCount = nodes.filter((n, i) => i < pos || (i === pos && nodeDone(n) && i === nodes.length - 1)).length;
  const pct = Math.round((doneCount / nodes.length) * 100);
  const reachedEnd = pos === nodes.length - 1;

  return (
    <section className="rail" aria-label={tr('课程轨道', 'Lesson rail')}>
      <div className="rail-top">
        <div className="rail-progress" role="progressbar" aria-valuemin={0} aria-valuemax={nodes.length} aria-valuenow={pos + 1} aria-label={tr('进度', 'Progress')}>
          <div style={{ width: `${Math.max(pct, 3)}%` }} />
        </div>
        <span className="rail-count">
          {pos + 1} / {nodes.length}
        </span>
        <button className={`rail-drawer-btn ${drawer ? 'on' : ''}`} aria-expanded={drawer} aria-controls="rail-target" onClick={() => setDrawer(!drawer)}>
          <Icon name="schematic" size={14} /> {targetLabel} <Icon name="down" size={12} />
        </button>
      </div>
      {drawer && (
        <div className="rail-drawer" id="rail-target">
          {target}
        </div>
      )}

      <ol className="rail-ticks" aria-hidden>
        {nodes.map((_, i) => (
          <li key={i} className={i < pos ? 'past' : i === pos ? 'cur' : ''} />
        ))}
      </ol>

      <ol className="rail-stream">
        {nodes.map((n, i) => {
          const state = review ? 'active' : i < pos ? 'past' : i === pos ? 'active' : 'future';
          const label = railKindLabel(n.kind);
          if (state === 'future')
            return (
              <li key={i} className="rail-node future">
                <span className="rail-dot" aria-hidden>
                  ○
                </span>{' '}
                <span className="sr-only">{tr(`第 ${i + 1} 步（还没到）：`, `Step ${i + 1} (later): `)}</span>
                {i + 1}. {n.title}
              </li>
            );
          if (state === 'past' && !openPast.has(i)) {
            const chip = chipOf(n);
            return (
              <li key={i} className={`rail-node past kind-${n.kind}`}>
                <button className="rail-past" aria-expanded={false} onClick={() => setOpenPast(new Set(openPast).add(i))}>
                  <span className="rail-check" aria-hidden>
                    ✓
                  </span>
                  <span className="sr-only">{tr(`第 ${i + 1} 步，已完成：`, `Step ${i + 1}, done: `)}</span>
                  <span className="rail-past-title">
                    {i + 1}. {n.title}
                  </span>
                  {chip && <span className="rail-chip">{chip}</span>}
                  <span className="rail-past-more">{tr('回看', 'Review')} ▸</span>
                </button>
              </li>
            );
          }
          const isActive = i === pos && !review;
          const done = nodeDone(n);
          const last = i === nodes.length - 1;
          return (
            <li key={i} className={`rail-node ${isActive ? 'active' : 'open'} kind-${n.kind}`} aria-current={isActive ? 'step' : undefined}>
              <div className="rail-eyebrow">
                <Icon name={KIND[n.kind].icon} size={13} /> {tr(`第 ${i + 1} 步`, `Step ${i + 1}`)} · {label}
                {state === 'past' && (
                  <button
                    className="rail-fold"
                    onClick={() => {
                      const s = new Set(openPast);
                      s.delete(i);
                      setOpenPast(s);
                    }}
                  >
                    {tr('收起', 'Fold')} ▴
                  </button>
                )}
              </div>
              <h3 className="rail-title" ref={isActive ? activeRef : undefined} tabIndex={-1}>
                {n.title}
              </h3>
              {nodeBody(n, i)}
              {isActive && checkSlot}
              {isActive && !last && (
                <div className="rail-next">
                  {!done && (
                    <span className="rail-wait">
                      {n.count > 0 && !n.measure.length
                        ? tr('完成上面的操作就能继续', 'Finish the steps above to go on')
                        : n.measure.length
                          ? tr('答完这一步的题就能继续', 'Answer the questions here to go on')
                          : ''}
                    </span>
                  )}
                  <button className="primary" disabled={!done} onClick={() => go(i + 1)}>
                    {tr('下一步', 'Next')} <Icon name="down" size={15} />
                  </button>
                </div>
              )}
              {isActive && last && reachedEnd && (
                <div className="rail-next">
                  <button onClick={() => setReview(true)}>
                    <Icon name="layers" size={15} /> {tr('展开全部，复习一遍', 'Open everything to review')}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {review && checkSlot}
      {review && (
        <div className="rail-next">
          <button onClick={() => setReview(false)}>{tr('收起复习', 'Close the review')}</button>
        </div>
      )}
      {pos > 0 && !review && (
        <p className="rail-restart">
          <button className="link" onClick={() => go(0)}>
            {tr('从第 1 步重新走一遍', 'Walk the rail again from step 1')}
          </button>
        </p>
      )}
    </section>
  );
}

function Practice({ ids }: { ids: string[] }) {
  const openSummary = useStore((s) => s.openSummary);
  return (
    <div className="card-practice">
      <span className="eyebrow">{tr('趁热练理论题', 'Practise the theory while it is fresh')}</span>
      <div className="row wrap">
        {ids.map((id) => (
          <button key={id} className="pr-link" onClick={() => openSummary({ chapter: id })}>
            <Icon name="book" size={15} /> {chapterById(id)?.title() ?? id}
          </button>
        ))}
      </div>
    </div>
  );
}
