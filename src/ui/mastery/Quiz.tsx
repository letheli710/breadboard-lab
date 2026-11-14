// Chapter quiz / exam mode: setup → the running quiz (no feedback, hints or solutions; answers
// can be changed until submitting; pausable timer) → results with the normal feedback and
// solutions; history of past quizzes.

import { useEffect, useMemo, useRef, useState } from 'react';
import { tr } from '../../core/i18n';
import { CHAPTERS } from '../../core/problem/chapters';
import type { Problem } from '../../core/problem/parse';
import { nowMs } from '../../state/clock';
import { dueNotes, noteKey, weakChapters, type QuizItemResult, type QuizRecord } from '../../state/mastery';
import { quizElapsed, useMastery, type ActiveQuiz } from '../../state/masteryStore';
import { getProblem, loadChapter, type ProblemEntry } from '../../state/problems';
import { drawQuiz, gradable, grade, remaining, score, unreadable, type PoolItem } from '../../state/quiz';
import { useStore } from '../../state/store';
import { ConfirmButton } from '../Confirm';
import { Icon } from '../Icons';
import { PrMd, Sym } from '../richText';
import { chapterName, useChapterOf } from './Notebook';
import { AnswerInput, Feedback, ProblemContext, SolutionBlock, useEntryProblem } from './QuestionParts';
import { mistakeLabel, qLetter } from './text';
import { Mixed } from '../Mixed';

const COUNTS = [5, 10, 15, 20];
const LIMITS = [0, 5, 10, 20, 30, 45, 60];

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Load the full problems of these entries (their chapter chunks). */
async function loadProblems(entries: ProblemEntry[]): Promise<Map<string, Problem>> {
  await Promise.all([...new Set(entries.map((e) => e.chapter))].map((c) => loadChapter(c).catch(() => undefined)));
  const out = new Map<string, Problem>();
  for (const e of entries) {
    const p = getProblem(e)?.problem;
    if (p) out.set(e.id, p);
  }
  return out;
}

function QuizSetup() {
  const problems = useStore((s) => s.problems);
  const ready = useStore((s) => s.problemIndex) === 'ready';
  const notify = useStore((s) => s.notify);
  const data = useMastery((s) => s.data);
  const day = useMastery((s) => s.day);
  const startQuiz = useMastery((s) => s.startQuiz);
  const chapterOf = useChapterOf();
  const withProblems = CHAPTERS.filter((c) => problems.some((p) => p.chapter === c.id));
  const weak = useMemo(() => weakChapters(data, chapterOf), [data, chapterOf]);
  const due = dueNotes(data, day);
  const [mode, setMode] = useState<'chapters' | 'weak'>('chapters');
  const [picked, setPicked] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [limit, setLimit] = useState(20);
  const [busy, setBusy] = useState(false);
  const canWeak = weak.length > 0 || due.length > 0;
  const chapters = mode === 'weak' ? [...new Set([...weak, ...due.map((n) => chapterOf(n.pid))])] : picked;

  const start = async () => {
    setBusy(true);
    try {
      const entries = problems.filter((p) => chapters.includes(p.chapter));
      const full = await loadProblems(entries);
      const level = new Map(entries.map((e) => [e.id, e.level]));
      const pool: PoolItem[] = [];
      const dueKeys = new Set(due.map((n) => noteKey(n.pid, n.qid)));
      for (const e of entries) {
        const p = full.get(e.id);
        if (!p) continue;
        const inWeak = mode === 'chapters' || weak.includes(e.chapter);
        for (const q of p.questions)
          if (gradable(q) && (inWeak || dueKeys.has(noteKey(e.id, q.id)))) pool.push({ pid: e.id, qid: q.id, chapter: e.chapter, level: level.get(e.id) ?? 1 });
      }
      const seed = nowMs() % 2 ** 31;
      const items = drawQuiz(pool, count, seed, dueKeys);
      if (!items.length) {
        notify(tr('这些章节里没有可以自动判分的题。', 'No auto-graded questions in these chapters.'));
        return;
      }
      startQuiz({
        id: `q${nowMs().toString(36)}`,
        seed,
        chapters: mode === 'weak' ? [] : chapters,
        weak: mode === 'weak',
        limit: limit * 60,
        items: items.map(({ pid, qid }) => ({ pid, qid })),
      });
      window.scrollTo({ top: 0 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="ms-setup">
      <h3>{tr('出一套测验', 'Set up a quiz')}</h3>
      <div className="ms-modes" role="radiogroup" aria-label={tr('出题范围', 'Questions from')}>
        <label>
          <input type="radio" name="qmode" checked={mode === 'chapters'} onChange={() => setMode('chapters')} /> {tr('选章节', 'Chapters I pick')}
        </label>
        <label className={canWeak ? '' : 'muted'}>
          <input type="radio" name="qmode" disabled={!canWeak} checked={mode === 'weak'} onChange={() => setMode('weak')} />{' '}
          {tr(`到期复习 + 薄弱章节（${due.length} 道到期）`, `Due reviews + weak areas (${due.length} due)`)}
        </label>
      </div>
      {mode === 'chapters' ? (
        <fieldset className="ms-chpick">
          <legend>
            {tr('章节', 'Chapters')}{' '}
            <button type="button" className="pr-link" onClick={() => setPicked(picked.length === withProblems.length ? [] : withProblems.map((c) => c.id))}>
              {picked.length === withProblems.length ? tr('全不选', 'None') : tr('全选', 'All')}
            </button>
          </legend>
          {!ready && <p className="muted">{tr('正在加载题目…', 'Loading the problems…')}</p>}
          {withProblems.map((c) => (
            <label key={c.id}>
              <input type="checkbox" checked={picked.includes(c.id)} onChange={(e) => setPicked(e.target.checked ? [...picked, c.id] : picked.filter((x) => x !== c.id))} />{' '}
              {c.title()}
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="muted small">
          {tr('薄弱章节：', 'Weak areas: ')}
          {weak.length ? weak.map(chapterName).join(tr('、', ', ')) : tr('（无）', '(none)')}
        </p>
      )}
      <div className="ms-filters">
        <label>
          {tr('题数', 'Questions')}
          <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {COUNTS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          {tr('时间限制', 'Time limit')}
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            {LIMITS.map((n) => (
              <option key={n} value={n}>
                {n ? tr(`${n} 分钟`, `${n} min`) : tr('不限时', 'None')}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted small">
        {tr(
          '按难度分层抽题。测验中没有对错反馈、提示和解答；交卷前可以随时改答案。',
          'Drawn stratified by difficulty. No feedback, hints or solutions during the quiz; change any answer until you submit.',
        )}
      </p>
      <button className="primary" disabled={busy || !ready || !chapters.length} onClick={() => void start()}>
        <Icon name="next" size={16} /> {busy ? tr('正在出题…', 'Drawing…') : tr('开始测验', 'Start the quiz')}
      </button>
    </section>
  );
}

function QuizItemView({ q: quiz, i }: { q: ActiveQuiz; i: number }) {
  const item = quiz.items[i];
  const { problem: p, error } = useEntryProblem(item.pid);
  const answerQuiz = useMastery((s) => s.answerQuiz);
  if (error) return <p className="pr-feedback bad">{error}</p>;
  if (!p) return <p className="muted">{tr('正在加载题目…', 'Loading the problem…')}</p>;
  const q = p.questions.find((x) => x.id === item.qid);
  if (!q) return <p className="pr-feedback bad">{tr('这一问已经不存在了。', 'This question part no longer exists.')}</p>;
  const a = quiz.answers[i] ?? {};
  const bad = unreadable(q, a.input ?? '');
  return (
    <div className="ms-qitem" data-pid={item.pid} data-qid={item.qid}>
      <ProblemContext p={p} />
      <div className="pr-q">
        <div className="pr-q-head">
          <span className="pr-q-num">{i + 1}</span>
          <div className="pr-q-ask">
            <PrMd text={q.ask} />
          </div>
        </div>
        <AnswerInput
          q={q}
          input={a.input ?? ''}
          choice={a.choice}
          label={tr(`第 ${i + 1} 题的答案`, `Answer to question ${i + 1}`)}
          onInput={(s) => answerQuiz(i, { input: s })}
          onChoice={(c) => answerQuiz(i, { choice: c })}
        />
        {bad && (
          <p className="ms-unreadable small" role="status">
            ⚠ {tr('读不出这个输入（不是对错判断）：', "This input can't be read (not a right/wrong judgement): ")}
            {bad}
          </p>
        )}
      </div>
    </div>
  );
}

function QuizRunner({ q }: { q: ActiveQuiz }) {
  const problems = useStore((s) => s.problems);
  const pauseQuiz = useMastery((s) => s.pauseQuiz);
  const finishQuiz = useMastery((s) => s.finishQuiz);
  const discardQuiz = useMastery((s) => s.discardQuiz);
  const [i, setI] = useState(0);
  const [, tick] = useState(0);
  const submitting = useRef(false);
  const paused = q.since === null;
  const left = remaining(q.limit, quizElapsed(q));
  const elapsed = Math.floor(quizElapsed(q) / 1000);
  const answered = q.items.filter((_, k) => {
    const a = q.answers[k];
    return a && (a.choice !== undefined || !!a.input?.trim());
  }).length;

  const submit = async () => {
    if (submitting.current) return;
    submitting.current = true;
    const entries = q.items.map((it) => problems.find((p) => p.id === it.pid)).filter((e): e is ProblemEntry => !!e);
    const full = await loadProblems(entries);
    const results: QuizItemResult[] = [];
    q.items.forEach((it, k) => {
      const qq = full.get(it.pid)?.questions.find((x) => x.id === it.qid);
      if (!qq) return; // removed since: not graded
      const g = grade(qq, q.answers[k]);
      results.push({ pid: it.pid, qid: it.qid, ok: g.ok, ...(g.input !== undefined ? { input: g.input } : {}), ...(g.type ? { type: g.type } : {}) });
    });
    finishQuiz(results);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => tick((n) => n + 1), 500);
    return () => clearInterval(t);
  }, [paused]);
  useEffect(() => {
    if (left === 0 && !paused) void submit();
  });

  const low = left !== null && left <= 60;
  return (
    <div className="ms-quiz">
      <div className={`ms-timer ${low ? 'low' : ''}`} role="timer" aria-live="off">
        <span className="ms-time" aria-label={tr('剩余时间', 'Time left')}>
          {left !== null ? clock(left) : clock(elapsed)}
          <small>{left !== null ? tr(' 剩余', ' left') : tr(' 已用', ' used')}</small>
        </span>
        {left !== null && (
          <span className="ms-pbar" aria-hidden>
            <span style={{ width: `${(left / q.limit) * 100}%` }} />
          </span>
        )}
        <span className="muted small">{tr(`已答 ${answered}/${q.items.length}`, `${answered}/${q.items.length} answered`)}</span>
        <button onClick={() => pauseQuiz(!paused)} aria-pressed={paused}>
          {paused ? tr('▶ 继续', '▶ Resume') : tr('❚❚ 暂停', '❚❚ Pause')}
        </button>
      </div>
      <nav className="ms-qnav" aria-label={tr('题目', 'Questions')}>
        {q.items.map((_, k) => {
          const a = q.answers[k];
          const done = a && (a.choice !== undefined || !!a.input?.trim());
          return (
            <button key={k} className={`${k === i ? 'on' : ''} ${done ? 'done' : ''}`} aria-current={k === i ? 'step' : undefined} onClick={() => setI(k)} disabled={paused}>
              {k + 1}
            </button>
          );
        })}
      </nav>
      {paused ? (
        <div className="ms-paused card">
          <p>{tr('已暂停：题目暂时隐藏，计时停止。', 'Paused: the questions are hidden and the clock is stopped.')}</p>
          <button className="primary" onClick={() => pauseQuiz(false)}>
            {tr('▶ 继续', '▶ Resume')}
          </button>
        </div>
      ) : (
        <QuizItemView key={i} q={q} i={i} />
      )}
      <div className="row between ms-quiz-foot">
        <div className="row">
          <button disabled={i === 0 || paused} onClick={() => setI(i - 1)}>
            <Icon name="prev" size={16} /> {tr('上一题', 'Previous')}
          </button>
          <button disabled={i === q.items.length - 1 || paused} onClick={() => setI(i + 1)}>
            {tr('下一题', 'Next')} <Icon name="next" size={16} />
          </button>
        </div>
        <div className="row">
          <ConfirmButton
            className="pr-link"
            message={tr('放弃这次测验？答案不会保存。', 'Discard this quiz? The answers are not kept.')}
            confirmLabel={tr('放弃', 'Discard')}
            onConfirm={discardQuiz}
          >
            <Icon name="trash" size={14} /> {tr('放弃', 'Discard')}
          </ConfirmButton>
          <ConfirmButton
            className="primary"
            message={
              answered < q.items.length
                ? tr(`还有 ${q.items.length - answered} 题没答，确定交卷？`, `${q.items.length - answered} question(s) unanswered. Submit anyway?`)
                : tr('交卷后就不能再改了。', "You can't change answers after submitting.")
            }
            confirmLabel={tr('交卷', 'Submit')}
            onConfirm={() => void submit()}
          >
            <Icon name="check" size={16} /> {tr('交卷', 'Submit')}
          </ConfirmButton>
        </div>
      </div>
    </div>
  );
}

function ResultItem({ r, k }: { r: QuizItemResult; k: number }) {
  const { entry, problem: p, error } = useEntryProblem(r.pid);
  const [ctx, setCtx] = useState(false);
  if (error) return <li className="ms-ritem bad">{error}</li>;
  if (!p) return <li className="ms-ritem muted">{tr('正在加载…', 'Loading…')}</li>;
  const q = p.questions.find((x) => x.id === r.qid);
  if (!q) return null;
  const a = q.choices ? (r.input ? { choice: r.input.charCodeAt(0) - 65 } : {}) : { input: r.input };
  // the normal feedback, re-checked in the current language
  const g = grade(q, a);
  return (
    <li className={`ms-ritem ${g.ok ? 'ok' : 'bad'}`}>
      <div className="ms-rhead">
        <span className="pr-q-num">{g.ok ? '✓' : '✗'}</span>
        <b>
          {k + 1}. <Sym text={p.title} />
          <span className="muted"> · {tr(`第 ${entry ? qLetter(entry.qids, q.id) : q.id} 问`, `part ${entry ? qLetter(entry.qids, q.id) : q.id}`)}</span>
        </b>
        {!g.ok && g.type && <span className={`ms-chip t-${g.type}`}>{mistakeLabel(g.type)}</span>}
      </div>
      <div className="pr-q-ask">
        <PrMd text={q.ask} />
      </div>
      <p className="small">
        {tr('你的答案', 'Your answer')}: <code>{r.input ?? '—'}</code>
      </p>
      <Feedback q={q} g={g} showAnswer />
      <button className="pr-link" aria-expanded={ctx} onClick={() => setCtx(!ctx)}>
        {ctx ? tr('收起题目和电路图', 'Hide the problem and drawing') : tr('显示题目和电路图', 'Show the problem and drawing')}
      </button>
      {ctx && <ProblemContext p={p} />}
      <SolutionBlock p={p} q={q} />
    </li>
  );
}

const chaptersText = (r: QuizRecord) => (r.weak ? tr('到期 + 薄弱章节', 'Due + weak areas') : r.chapters.map(chapterName).join(tr('、', ', ')));
const dateText = (at: number) => new Date(at).toLocaleString(tr('zh-CN', 'en-US'), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function QuizResults({ r }: { r: QuizRecord }) {
  const close = useMastery((s) => s.closeResult);
  const openView = useStore((s) => s.openPracticeView);
  const s = score(r.items ?? []);
  return (
    <div className="ms-results">
      <div className={`ms-score ${s.percent >= 80 ? 'good' : s.percent >= 60 ? 'ok' : 'low'}`}>
        <b>{r.n ? Math.round((100 * r.correct) / r.n) : 0}</b>
        <span>
          {tr(`分 · 答对 ${r.correct}/${r.n}`, `% · ${r.correct}/${r.n} correct`)}
          <br />
          {tr(`用时 ${clock(r.seconds)}`, `time ${clock(r.seconds)}`)}
          {r.limit ? tr(` / 限时 ${clock(r.limit)}`, ` / limit ${clock(r.limit)}`) : ''}
        </span>
      </div>
      <p className="muted small">
        {chaptersText(r)} · {dateText(r.at)}
        {r.correct < r.n && ` · ${tr('答错的已记进错题本', 'the wrong ones are in the notebook now')}`}
      </p>
      {r.items ? (
        <ol className="ms-ritems">
          {r.items.map((it, k) => (
            <ResultItem key={k} r={it} k={k} />
          ))}
        </ol>
      ) : (
        <p className="muted">{tr('较早的测验只保留了分数。', 'Only the score is kept for older quizzes.')}</p>
      )}
      <div className="row">
        <button className="primary" onClick={close}>
          <Icon name="reset" size={15} /> {tr('再测一次', 'New quiz')}
        </button>
        <button onClick={() => openView('notebook')}>
          <Icon name="book" size={15} /> {tr('错题本', 'Mistake notebook')}
        </button>
      </div>
    </div>
  );
}

function QuizHistory() {
  const quizzes = useMastery((s) => s.data.quizzes);
  if (!quizzes.length) return null;
  return (
    <section className="ms-history">
      <h3>{tr('测验记录', 'Quiz history')}</h3>
      <table>
        <thead>
          <tr>
            <th>{tr('日期', 'Date')}</th>
            <th>{tr('范围', 'Chapters')}</th>
            <th>{tr('得分', 'Score')}</th>
            <th>{tr('用时', 'Time')}</th>
          </tr>
        </thead>
        <tbody>
          {[...quizzes].reverse().map((r) => (
            <tr key={r.id}>
              <td>
                {r.items ? (
                  <button className="pr-link" onClick={() => useMastery.setState({ resultId: r.id })}>
                    {dateText(r.at)}
                  </button>
                ) : (
                  dateText(r.at)
                )}
              </td>
              <td>{chaptersText(r)}</td>
              <td>
                {r.correct}/{r.n} ({r.n ? Math.round((100 * r.correct) / r.n) : 0}%)
              </td>
              <td>{clock(r.seconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function QuizPage() {
  const quiz = useMastery((s) => s.quiz);
  const resultId = useMastery((s) => s.resultId);
  const result = useMastery((s) => s.data.quizzes.find((x) => x.id === resultId));
  return (
    <div className="ms-page">
      <div className="eyebrow">
        <Mixed text={tr('测验 QUIZ', 'QUIZ')} />
      </div>
      <h2 className="pr-title">{quiz ? tr('测验进行中', 'Quiz in progress') : result ? tr('测验结果', 'Quiz results') : tr('章节测验', 'Chapter quiz')}</h2>
      {quiz ? (
        <QuizRunner q={quiz} />
      ) : result ? (
        <QuizResults r={result} />
      ) : (
        <>
          <QuizSetup />
          <QuizHistory />
        </>
      )}
    </div>
  );
}
