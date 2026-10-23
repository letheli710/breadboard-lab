// Theory practice ("练习 Practice"): textbook circuit-analysis problems (circuit-problem/1).
// Left: chapters grouped by course phase with progress. Main: the problem card — statement,
// schematic, questions with answer checking, progressive hints and the worked solution.

import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { tr } from '../core/i18n';
import { CHAPTERS, chapterById, type Chapter } from '../core/problem/chapters';
import { checkAnswer, formatAnswer, type AnswerCheck, type Problem } from '../core/problem/parse';
import type { Analysis, Question } from '../core/problem/types';
import { useStore } from '../state/store';
import { celebrate } from './celebrate';
import { Icon } from './Icons';
import { ProblemSchematic, richRuns } from './ProblemSchematic';

const PHASES: { n: 1 | 2 | 3 | 4; zh: string; en: string }[] = [
  { n: 1, zh: '电阻电路基础', en: 'Resistive circuit basics' },
  { n: 2, zh: '分析方法与电路定理', en: 'Analysis methods & theorems' },
  { n: 3, zh: '动态电路', en: 'Dynamic circuits' },
  { n: 4, zh: '正弦稳态与交流', en: 'Sinusoidal steady state & AC' },
];

/** Text with textbook symbols: "u_C(0+)" → u with subscript C (same rules as the drawing). */
function Sym({ text }: { text: string }) {
  return (
    <>
      {richRuns(text).map((r, i) => (r.sub ? <sub key={i}>{r.t}</sub> : r.it ? <i key={i}>{r.t}</i> : <Fragment key={i}>{r.t}</Fragment>))}
    </>
  );
}

/** Markdown subset of the app's Md renderer (paragraphs, "- "/"1. " lists, "#" headings, **bold**,
 *  `code`) plus symbol subscripts, for problem text. */
function PrMd({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((t, i) =>
      t.startsWith('**') && t.endsWith('**') && t.length > 4 ? (
        <b key={i}>
          <Sym text={t.slice(2, -2)} />
        </b>
      ) : t.startsWith('`') && t.endsWith('`') && t.length > 1 ? (
        <code key={i}>{t.slice(1, -1)}</code>
      ) : (
        <Sym key={i} text={t} />
      ),
    );
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const items = list.items.map((l, i) => <li key={i}>{inline(l)}</li>);
    blocks.push(list.ordered ? <ol key={blocks.length}>{items}</ol> : <ul key={blocks.length}>{items}</ul>);
    list = null;
  };
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    const ul = /^\s*[-*] (.*)$/.exec(line);
    const ol = /^\s*\d+\. (.*)$/.exec(line);
    if (ul || ol) {
      const ordered = !!ol;
      if (list && list.ordered !== ordered) flush();
      if (!list) list = { ordered, items: [] };
      list.items.push((ul ?? ol)![1]);
      continue;
    }
    flush();
    if (line.startsWith('#')) blocks.push(<h4 key={blocks.length}>{inline(line.replace(/^#+\s*/, ''))}</h4>);
    else if (line.trim()) blocks.push(<p key={blocks.length}>{inline(line)}</p>);
  }
  flush();
  return <div className="md">{blocks}</div>;
}

function Stars({ n }: { n: number }) {
  return <span className="stars">{'★'.repeat(n) + '☆'.repeat(5 - n)}</span>;
}

/** Width of the drawing in grid units (wide drawings get the full card width). */
function schematicWidth(p: Problem): number {
  const xs: number[] = [];
  for (const e of p.schematic.elements) {
    if ('from' in e) xs.push(e.from[0], e.to[0]);
    else if ('at' in e) xs.push(e.at[0] - 3, e.at[0] + 3);
  }
  for (const w of p.schematic.wires) for (const pt of w) xs.push(pt[0]);
  return xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
}

function analysisLabel(a: Analysis): string {
  if (a.type === 'dc') return tr('直流 DC', 'DC');
  if (a.type === 'tran') return tr('暂态 · 开关在 t = 0 动作', 'Transient · switching at t = 0');
  const f = a.freq ?? (a.omega ? a.omega / (2 * Math.PI) : 0);
  const fx = a.omega && !a.freq ? `ω = ${a.omega} rad/s` : `f = ${parseFloat(f.toPrecision(6))} Hz`;
  return `${tr('正弦稳态 AC', 'AC steady state')} · ${fx} · ${a.phasor === 'peak' ? tr('相量取幅值', 'peak phasors') : tr('相量取有效值', 'rms phasors')}`;
}

// ---------------------------------------------------------------- sidebar

function ChapterList({ problems, current }: { problems: Problem[]; current: Problem | null }) {
  const done = useStore((s) => s.practiceDone);
  const open = useStore((s) => s.openProblem);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => (current ? { [current.chapter]: true } : {}));
  useEffect(() => {
    if (current) setExpanded((e) => (e[current.chapter] ? e : { ...e, [current.chapter]: true }));
  }, [current]);

  const byChapter = useMemo(() => {
    const m = new Map<string, Problem[]>();
    for (const p of problems) m.set(p.chapter, [...(m.get(p.chapter) ?? []), p]);
    return m;
  }, [problems]);

  const chapterRow = (c: Chapter, num: number) => {
    const list = byChapter.get(c.id) ?? [];
    const n = list.filter((p) => done[p.id]).length;
    const isOpen = !!expanded[c.id] && list.length > 0;
    return (
      <div key={c.id} className={`pr-chapter ${list.length ? '' : 'empty'} ${current?.chapter === c.id ? 'cur' : ''}`}>
        <button className="pr-ch-head" disabled={!list.length} onClick={() => setExpanded({ ...expanded, [c.id]: !isOpen })} aria-expanded={isOpen}>
          <span className="pr-ch-num">{num}</span>
          <span className="pr-ch-title">{c.title()}</span>
          <span className={`pr-ch-count ${list.length && n === list.length ? 'all' : ''}`}>{list.length ? `${n}/${list.length}` : tr('待出题', 'soon')}</span>
        </button>
        {isOpen && (
          <ul className="pr-plist">
            {list.map((p) => (
              <li key={p.id}>
                <button className={`pr-pitem ${p.id === current?.id ? 'on' : ''} ${done[p.id] ? 'done' : ''}`} onClick={() => open(p.id)}>
                  <span className="pr-tick">{done[p.id] ? '✓' : ''}</span>
                  <span className="pr-ptitle">
                    <Sym text={p.title} />
                  </span>
                  <span className="pr-plevel" title={tr(`难度 ${p.level}`, `Level ${p.level}`)}>
                    {'★'.repeat(p.level)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  let num = 0;
  return (
    <aside className="pr-side card">
      {PHASES.map((ph) => {
        const chs = CHAPTERS.filter((c) => c.phase === ph.n);
        const all = chs.flatMap((c) => byChapter.get(c.id) ?? []);
        const d = all.filter((p) => done[p.id]).length;
        return (
          <section key={ph.n} className="pr-phase">
            <div className="eyebrow pr-phase-head">
              <span>
                {tr(`第 ${ph.n} 期 · ${ph.zh}`, `Phase ${ph.n} · ${ph.en}`)}
              </span>
              {all.length > 0 && (
                <span>
                  {d}/{all.length}
                </span>
              )}
            </div>
            {chs.map((c) => chapterRow(c, ++num))}
          </section>
        );
      })}
    </aside>
  );
}

// ---------------------------------------------------------------- questions

interface QState {
  input: string;
  result: AnswerCheck | null;
  choice: number | null;
  revealed: boolean;
}

function QuestionCard({ p, q, index, onHover }: { p: Problem; q: Question; index: number; onHover: (q: Question | null) => void }) {
  const solvedBefore = useStore((s) => !!s.practiceAnswers[p.id]?.[q.id]);
  const markQuestion = useStore((s) => s.markQuestion);
  const [st, setSt] = useState<QState>({ input: '', result: null, choice: null, revealed: false });
  const correctNow = st.result?.ok || (q.choices && st.choice === q.correct);
  const solved = solvedBefore || !!correctNow;
  const showExplain = (correctNow || st.revealed || solvedBefore) && !!q.explain;

  const submit = () => {
    const r = checkAnswer(q, st.input);
    setSt({ ...st, result: r });
    if (r.ok) markQuestion(p.id, q.id);
  };
  const choose = (i: number) => {
    setSt({ ...st, choice: i });
    if (i === q.correct) markQuestion(p.id, q.id);
  };

  return (
    <div className={`pr-q ${solved ? 'solved' : ''}`} onMouseEnter={() => onHover(q)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(q)}>
      <div className="pr-q-head">
        <span className="pr-q-num">{solved ? '✓' : `${String.fromCharCode(97 + index)}`}</span>
        <div className="pr-q-ask">
          <PrMd text={q.ask} />
        </div>
      </div>

      {q.choices ? (
        <div className="pr-choices">
          {q.choices.map((c, i) => {
            const picked = st.choice === i;
            const cls = (picked || st.revealed || solvedBefore) && i === q.correct ? 'right' : picked ? 'wrong' : '';
            return (
              <button key={i} className={`pr-choice ${cls}`} onClick={() => choose(i)}>
                <span className="pr-choice-key">{String.fromCharCode(65 + i)}</span>
                <span>
                  <Sym text={c} />
                </span>
                {cls === 'right' && <Icon name="check" size={16} />}
              </button>
            );
          })}
        </div>
      ) : (
        <form
          className="pr-answer"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className={`pr-input ${st.result ? (st.result.ok ? 'ok' : 'bad') : ''}`}>
            <input
              value={st.input}
              inputMode="decimal"
              spellCheck={false}
              autoComplete="off"
              placeholder={tr('输入答案', 'Your answer')}
              aria-label={tr(`第 ${index + 1} 问的答案`, `Answer to question ${index + 1}`)}
              onChange={(e) => setSt({ ...st, input: e.target.value, result: null })}
            />
            {q.unit ? <span className="pr-unit">{q.unit}</span> : null}
          </div>
          <button type="submit" className="primary" disabled={!st.input.trim()}>
            <Icon name="check" size={16} /> {tr('检查', 'Check')}
          </button>
        </form>
      )}

      {st.result && !q.choices && (
        <div className={`pr-feedback ${st.result.ok ? 'ok' : 'bad'}`}>
          {st.result.ok ? (
            <>
              <b>✓ {tr('正确！', 'Correct!')}</b> {tr('标准答案', 'Answer')}: {formatAnswer(q)}
            </>
          ) : (
            <>
              <b>✗ {st.result.value === undefined ? tr('无法判断', "Can't check") : tr('不对', 'Not quite')}</b>
              {st.result.reason ? ` — ${st.result.reason}` : tr(' — 再算一次，或看看提示。', ' — try again, or take a hint.')}
            </>
          )}
        </div>
      )}
      {q.choices && st.choice !== null && (
        <div className={`pr-feedback ${st.choice === q.correct ? 'ok' : 'bad'}`}>
          <b>{st.choice === q.correct ? `✓ ${tr('正确！', 'Correct!')}` : `✗ ${tr('不对，再想想。', 'Not quite — think again.')}`}</b>
        </div>
      )}
      {solvedBefore && !correctNow && !st.result && st.choice === null && (
        <div className="pr-feedback ok soft">
          ✓ {tr('之前已答对', 'Answered correctly before')}
          {!q.choices && ` · ${formatAnswer(q)}`}
        </div>
      )}

      {!solved && (
        <div className="pr-q-tools">
          {!st.revealed ? (
            <button className="pr-link" onClick={() => setSt({ ...st, revealed: true })}>
              <Icon name="eye" size={15} /> {tr('看答案', 'Show answer')}
            </button>
          ) : (
            <span className="pr-revealed">
              {tr('答案', 'Answer')}: <b>{q.choices ? `${String.fromCharCode(65 + (q.correct ?? 0))}. ${q.choices[q.correct ?? 0]}` : formatAnswer(q)}</b>
            </span>
          )}
        </div>
      )}
      {showExplain && (
        <div className="pr-explain">
          <PrMd text={q.explain!} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- problem card

function ProblemView({ p, list }: { p: Problem; list: Problem[] }) {
  const open = useStore((s) => s.openProblem);
  const done = useStore((s) => s.practiceDone);
  const resetProblem = useStore((s) => s.resetProblem);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [hover, setHover] = useState<Question | null>(null);
  const [round, setRound] = useState(0);
  const isDone = !!done[p.id];
  const [wasDone] = useState(isDone);

  useEffect(() => {
    if (isDone && !wasDone) celebrate();
  }, [isDone, wasDone]);

  const i = list.findIndex((x) => x.id === p.id);
  const prev = i > 0 ? list[i - 1] : null;
  const next = list.slice(i + 1).find((x) => !done[x.id]) ?? list[i + 1] ?? null;
  const chapter = chapterById(p.chapter);
  const highlight = hover?.find && 'el' in hover.find && typeof hover.find.el === 'string' ? [hover.find.el] : hover?.find && 'input' in hover.find ? [hover.find.input] : undefined;

  return (
    <article className="pr-main card">
      <header className="pr-head">
        <div className="pr-crumbs">
          <span className="eyebrow">
            {tr(`第 ${chapter?.phase ?? '?'} 期`, `Phase ${chapter?.phase ?? '?'}`)} · {chapter?.title()}
          </span>
          <div className="row">
            <button disabled={!prev} onClick={() => prev && open(prev.id)} title={tr('上一题', 'Previous problem')}>
              <Icon name="prev" size={16} />
            </button>
            <span className="muted small">
              {i + 1} / {list.length}
            </span>
            <button disabled={!next} onClick={() => next && open(next.id)} title={tr('下一题', 'Next problem')}>
              <Icon name="next" size={16} />
            </button>
          </div>
        </div>
        <div className="task-head">
          <span className="badge practice">{tr('练习 PRACTICE', 'PRACTICE')}</span>
          <Stars n={p.level} />
          {isDone && <span className="badge done">✓ {tr('已完成', 'Done')}</span>}
          {p.source !== 'folder' && <span className="badge src">{tr('导入', 'Imported')}</span>}
        </div>
        <h2 className="pr-title">
          <Sym text={p.title} />
        </h2>
        <div className="pr-meta">
          <span className="pr-analysis">{analysisLabel(p.analysis)}</span>
          {p.tags.map((t) => (
            <span key={t} className="pr-tag">
              {t}
            </span>
          ))}
        </div>
      </header>

      <div className={`pr-body ${schematicWidth(p) > 11 ? 'wide' : ''}`}>
        <section className="pr-left">
          <div className="pr-statement">
            <PrMd text={p.statement} />
          </div>
          <div className="eyebrow">{tr('电路图 CIRCUIT', 'CIRCUIT')}</div>
          <div className="schem-card pr-schem">
            <ProblemSchematic schematic={p.schematic} highlight={highlight} />
          </div>
          <p className="note">
            {tr(
              '箭头是电流的参考方向，+/− 是电压的参考极性；算出来是负数，说明实际方向与参考方向相反。',
              'Arrows are current reference directions and +/− marks are voltage reference polarities; a negative result means the actual direction is opposite.',
            )}
          </p>
        </section>

        <section className="pr-right">
          <div className="eyebrow">
            {tr('问题', 'Questions')} · {p.questions.length}
          </div>
          <div className="pr-questions" key={round}>
            {p.questions.map((q, k) => (
              <QuestionCard key={q.id} p={p} q={q} index={k} onHover={setHover} />
            ))}
          </div>
          <p className="note">
            {tr('可以带单位前缀：2.5k、-3m、4.7µ、1.2e-3 都行。', 'Unit prefixes are fine: 2.5k, -3m, 4.7µ, 1.2e-3 all work.')}
          </p>

          {isDone && (
            <div className="ok-box big pr-done">
              🎉 {tr('全部答对！', 'All correct!')}
              {next && (
                <button className="primary" onClick={() => open(next.id)}>
                  {tr('下一题', 'Next problem')} <Icon name="next" size={16} />
                </button>
              )}
            </div>
          )}

          <div className="pr-help">
            {p.hints.length > 0 && (
              <>
                <button onClick={() => setHints(hints + 1)} disabled={hints >= p.hints.length}>
                  <Icon name="bulb" size={16} /> {tr('提示', 'Hint')} ({hints}/{p.hints.length})
                </button>
                {hints > 0 && (
                  <ul className="hints">
                    {p.hints.slice(0, hints).map((h, k) => (
                      <li key={k}>
                        <Icon name="bulb" size={14} /> <PrMd text={h} />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            {p.solution && (
              <div className={`pr-solution ${showSolution ? 'open' : ''}`}>
                <button className="pr-sol-toggle" onClick={() => setShowSolution(!showSolution)} aria-expanded={showSolution}>
                  <Icon name={showSolution ? 'prev' : 'book'} size={16} />
                  {showSolution ? tr('收起解答过程', 'Hide the worked solution') : tr('查看完整解答过程', 'Show the worked solution')}
                </button>
                {showSolution && (
                  <div className="pr-sol-body">
                    <PrMd text={p.solution} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="row between pr-foot">
            <button
              className="pr-link"
              onClick={() => {
                resetProblem(p.id);
                setHints(0);
                setShowSolution(false);
                setRound(round + 1);
              }}
            >
              <Icon name="reset" size={15} /> {tr('重做这道题', 'Start this problem over')}
            </button>
            {next && (
              <button className="primary" onClick={() => open(next.id)}>
                {tr('下一题', 'Next problem')} <Icon name="next" size={16} />
              </button>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}

export function Practice() {
  const problems = useStore((s) => s.problems);
  const problemId = useStore((s) => s.problemId);
  const invalid = useStore((s) => s.problemInvalid);
  const setMode = useStore((s) => s.setMode);
  const current = problems.find((p) => p.id === problemId) ?? problems[0] ?? null;
  const bad = invalid.filter((f) => f.errors.length).length;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [current?.id]);

  return (
    <main className="pr-page">
      <ChapterList problems={problems} current={current} />
      {current ? (
        <ProblemView key={current.id} p={current} list={problems} />
      ) : (
        <div className="pr-main card pr-empty">
          <div className="eyebrow">{tr('练习 PRACTICE', 'PRACTICE')}</div>
          <h2 className="pr-title">{tr('还没有理论题', 'No theory problems yet')}</h2>
          <p>
            {tr('把 ', 'Put ')}
            <code>circuit-problem/1</code>
            {tr(' 格式的题目放进项目的 ', ' problem files in the project\'s ')}
            <code>problems/&lt;chapter&gt;/</code>
            {tr(' 文件夹，或在“导入”页面导入。', ' folder, or load them on the Import page.')}
          </p>
        </div>
      )}
      {bad > 0 && (
        <button className="pr-invalid" onClick={() => setMode('import')}>
          ! {tr(`${bad} 个题目文件有错误，点此查看`, `${bad} problem file(s) have errors — view them`)}
        </button>
      )}
    </main>
  );
}
