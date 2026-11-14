// Theory practice ("练习 Practice"): textbook circuit-analysis problems (circuit-problem/1).
// Left: chapters grouped by course phase with progress. Main: the problem card — statement,
// schematic, questions with answer checking, progressive hints and the worked solution.

import { lazy, Suspense, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { radioFocusKeys } from './a11y';
import { formatSI } from '../core/format';
import { tr } from '../core/i18n';
import { CHAPTERS, chapterById, type Chapter, type ChapterWorld } from '../core/problem/chapters';
import { WORLDS } from '../core/course';
import { answerTolerance, checkAnswer, formatAnswer, isPhaseQuestion, type AnswerCheck, type Problem } from '../core/problem/parse';
import type { Analysis, Question } from '../core/problem/types';
import { useMastery } from '../state/masteryStore';
import { dueNotes } from '../state/mastery';
import { countsAsDone, problemStatus, type QStatus } from '../state/practice';
import { exportProgress, parseProgress } from '../state/progressFile';
import { ensureProblemIndex, entryTitle, useProblem, type ProblemEntry } from '../state/problems';
import { useLang, useStore } from '../state/store';
import { hasSummary } from '../state/summaries';
import { celebrate } from './celebrate';
import { Icon } from './Icons';
import { ProblemSchematic } from './ProblemSchematic';
import { UiPlot } from './UiPlot';
import { GraphFigure } from './GraphFigure';
import { neighbours, practiceShortcut } from './practiceKeys';
import { prefersReducedMotion, revealIn, useUserScroll } from './reveal';
import { PrMd, Sym } from './richText';
import { SummaryPage } from './Summary';
import { MasteryNav } from './mastery/MasteryNav';
import { SymbolKeys } from './SymbolKeys';
import { Mixed } from './Mixed';

// the notebook / review / quiz pages are a chunk of their own
const MasteryPage = lazy(() => import('./mastery/MasteryPage'));

export { Sym };

/** Sidebar groups: the Worlds of the course map (core/course.ts), then the electives. */
const GROUPS: { n: ChapterWorld; label: () => string }[] = [
  ...WORLDS.map((w) => ({ n: w.id, label: () => tr(`World ${w.id} · ${w.title()}`, `World ${w.id} · ${w.title()}`) })),
  { n: 6, label: () => tr('选学（主线之外）', 'Electives (off the main path)') },
];
const groupName = (n: ChapterWorld | undefined) => (n === 6 ? tr('选学', 'Elective') : n ? `World ${n}` : '?');

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
  if (a.type === 'periodic') {
    const f1 = a.omega && !a.freq ? `ω₁ = ${a.omega} rad/s` : `f₁ = ${parseFloat((a.freq ?? 0).toPrecision(6))} Hz`;
    return `${tr('非正弦周期稳态 · 逐次谐波叠加', 'Non-sinusoidal periodic · harmonics superposed')} · ${f1} · ${a.phasor === 'peak' ? tr('谐波相量取幅值', 'peak phasors') : tr('谐波相量取有效值', 'rms phasors')}`;
  }
  const f = a.freq ?? (a.omega ? a.omega / (2 * Math.PI) : 0);
  const fx = a.omega && !a.freq ? `ω = ${a.omega} rad/s` : `f = ${f >= 1e4 ? formatSI(f, 'Hz', 6) : `${parseFloat(f.toPrecision(6))} Hz`}`;
  return `${tr('正弦稳态 AC', 'AC steady state')} · ${fx} · ${a.phasor === 'peak' ? tr('相量取幅值', 'peak phasors') : tr('相量取有效值', 'rms phasors')}`;
}

// ---------------------------------------------------------------- sidebar

/** Sidebar mark of a problem: how it was solved (null = not finished). Old progress without
 *  per-question records only has the done flag: it shows as solved unaided. */
function useStatusOf() {
  const done = useStore((s) => s.practiceDone);
  const answers = useStore((s) => s.practiceAnswers);
  return (p: ProblemEntry): QStatus | null => problemStatus(answers[p.id], p.qids) ?? (done[p.id] ? 'unaided' : null);
}

const STATUS_MARK: Record<QStatus, string> = { unaided: '✓', retried: '✓', revealed: '◐' };
const statusLabel = (s: QStatus) =>
  s === 'unaided'
    ? tr('独立答对', 'Solved unaided')
    : s === 'retried'
      ? tr('改正后答对', 'Solved after a wrong try')
      : tr('看过答案（复习，不计入完成数）', 'Answer seen (reviewed, not counted as done)');

/** Export / import of practice progress as a JSON file (it otherwise lives only in this browser). */
function ProgressFile() {
  useLang();
  const done = useStore((s) => s.practiceDone);
  const answers = useStore((s) => s.practiceAnswers);
  const importPractice = useStore((s) => s.importPractice);
  const notify = useStore((s) => s.notify);
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const data = exportProgress(done, answers, useMastery.getState().data);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `breadboard-practice-${data.exported.slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const doImport = async (f: File) => {
    try {
      const parsed = parseProgress(JSON.parse(await f.text()));
      if (!parsed) throw new Error('format');
      importPractice(parsed);
      // version-2 files also carry the notebook, review schedule and quiz history
      if (parsed.mastery) useMastery.getState().importMastery(parsed.mastery);
      notify(
        tr(
          `已导入 ${Object.keys(parsed.answers).length} 道题的进度（保留每题更好的结果）`,
          `Imported progress of ${Object.keys(parsed.answers).length} problem(s) (keeping the better result per question)`,
        ),
      );
    } catch {
      notify(tr('这个文件不是练习进度文件', "That file isn't a practice-progress file"));
    }
  };

  return (
    <div className="pr-progress-file">
      <div className="pr-legend">
        {(['unaided', 'retried', 'revealed'] as const).map((k) => (
          <span key={k} className={`pr-legend-item st-${k}`}>
            <span className="pr-tick">{STATUS_MARK[k]}</span> {statusLabel(k)}
          </span>
        ))}
      </div>
      <div className="row">
        <button className="pr-link" onClick={doExport} title={tr('把练习进度保存为 JSON 文件', 'Save your practice progress as a JSON file')}>
          <Icon name="download" size={14} /> {tr('导出进度', 'Export progress')}
        </button>
        <button className="pr-link" onClick={() => fileRef.current?.click()} title={tr('从导出的 JSON 文件恢复进度', 'Restore progress from an exported JSON file')}>
          <Icon name="upload" size={14} /> {tr('导入进度', 'Import progress')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) void doImport(f);
          }}
        />
      </div>
    </div>
  );
}

const SHORTCUTS: { keys: string[]; zh: string; en: string }[] = [
  { keys: ['['], zh: '上一题', en: 'Previous problem' },
  { keys: [']'], zh: '下一题（下一道未完成的）', en: 'Next problem (the next unfinished one)' },
  { keys: ['?'], zh: '显示 / 隐藏这份说明', en: 'Show / hide this list' },
  { keys: ['Esc'], zh: '关闭', en: 'Close' },
];

/** Keyboard button + popover listing the Practice keyboard shortcuts (? toggles it too). */
function ShortcutHelp() {
  useLang();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        box.current?.querySelector('button')?.focus();
      } else if (practiceShortcut(e) === 'help') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (open && box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);
  return (
    <div className="pr-keys" ref={box}>
      <button
        className="pr-keys-btn"
        aria-expanded={open}
        aria-controls="pr-keys-pop"
        title={tr('键盘快捷键（?）', 'Keyboard shortcuts (?)')}
        aria-label={tr('键盘快捷键', 'Keyboard shortcuts')}
        onClick={() => setOpen(!open)}
      >
        <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden>
          <rect x="1" y="1.5" width="16" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 5h1M7 5h1M10 5h1M13 5h1M4 8h1M13 8h1M7 8h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="pr-keys-pop card" id="pr-keys-pop" role="dialog" aria-label={tr('键盘快捷键', 'Keyboard shortcuts')}>
          <div className="eyebrow">{tr('键盘快捷键', 'Keyboard shortcuts')}</div>
          <dl>
            {SHORTCUTS.map((k) => (
              <div key={k.en}>
                <dt>
                  {k.keys.map((x) => (
                    <kbd key={x}>{x}</kbd>
                  ))}
                </dt>
                <dd>{tr(k.zh, k.en)}</dd>
              </div>
            ))}
          </dl>
          <p className="muted small">{tr('在答案输入框里打字时不起作用。', "They don't apply while you type in an answer field.")}</p>
        </div>
      )}
    </div>
  );
}

function ChapterList({ problems, current, summary, ready }: { problems: ProblemEntry[]; current: ProblemEntry | null; summary: string | null; ready: boolean }) {
  useLang();
  const statusOf = useStatusOf();
  const done = (p: ProblemEntry) => countsAsDone(statusOf(p));
  const open = useStore((s) => s.openProblem);
  const openSummary = useStore((s) => s.openSummary);
  const curChapter = summary ?? current?.chapter;
  const activeKey = summary ? `sum:${summary}` : current ? `p:${current.id}` : '';
  // the open problem's chapter is expanded (also when it was collapsed by hand and the next
  // problem opens); moving to another chapter collapses the rest, so the list stays short
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => (curChapter ? { [curChapter]: true } : {}));
  const [shownFor, setShownFor] = useState({ key: activeKey, chapter: curChapter });
  if (activeKey !== shownFor.key) {
    setShownFor({ key: activeKey, chapter: curChapter });
    if (curChapter) setExpanded(curChapter !== shownFor.chapter ? { [curChapter]: true } : (e) => (e[curChapter] ? e : { ...e, [curChapter]: true }));
  }

  // keep the active item in view: centred in the sidebar (which scrolls on its own), on a direct
  // load and on every move to another problem / key-points page, unless the user is scrolling
  // the sidebar right now or the item is already fully visible
  const { ref: sideRef, el: sideEl, busy } = useUserScroll<HTMLElement>();
  const revealed = useRef<string | null>(null);
  useLayoutEffect(() => {
    const side = sideEl();
    if (!side || !activeKey || !ready || revealed.current === activeKey) return;
    const item = side.querySelector<HTMLElement>('.pr-pitem.on');
    if (!item) return; // its chapter is expanding: runs again after that render
    const first = revealed.current === null;
    revealed.current = activeKey;
    if (!busy()) revealIn(side, item, 'y', first);
  });

  /** "jump to chapter": expand it and scroll its heading to the top of the sidebar */
  const jump = (id: string) => {
    setExpanded((e) => ({ ...e, [id]: true }));
    requestAnimationFrame(() => {
      const side = sideEl();
      const head = side?.querySelector<HTMLElement>(`[data-chapter="${CSS.escape(id)}"]`);
      if (!side || !head) return;
      const top = side.scrollTop + head.getBoundingClientRect().top - side.getBoundingClientRect().top - (side.querySelector<HTMLElement>('.pr-side-tools')?.offsetHeight ?? 0) - 4;
      side.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      head.querySelector<HTMLElement>('.pr-ch-head')?.focus({ preventScroll: true });
    });
  };

  const byChapter = useMemo(() => {
    const m = new Map<string, ProblemEntry[]>();
    for (const p of problems) m.set(p.chapter, [...(m.get(p.chapter) ?? []), p]);
    return m;
  }, [problems]);

  const chapterRow = (c: Chapter, num: number) => {
    const list = byChapter.get(c.id) ?? [];
    const n = list.filter(done).length;
    const isOpen = !!expanded[c.id] && list.length > 0;
    return (
      <div key={c.id} data-chapter={c.id} className={`pr-chapter ${list.length || !ready ? '' : 'empty'} ${curChapter === c.id ? 'cur' : ''}`}>
        <button
          className="pr-ch-head"
          disabled={!list.length}
          onClick={() => setExpanded({ ...expanded, [c.id]: !isOpen })}
          aria-expanded={isOpen}
          aria-controls={isOpen ? `pr-list-${c.id}` : undefined}
        >
          <span className="pr-ch-num">{num}</span>
          <span className="pr-ch-title">{c.title()}</span>
          {/* no counts until the index is in (not "soon" for every chapter) */}
          {ready && <span className={`pr-ch-count ${list.length && n === list.length ? 'all' : ''}`}>{list.length ? `${n}/${list.length}` : tr('待出题', 'soon')}</span>}
        </button>
        {isOpen && (
          <ul className="pr-plist" id={`pr-list-${c.id}`} aria-label={c.title()}>
            {hasSummary(c.id) && (
              <li>
                <button
                  className={`pr-pitem pr-sumitem ${summary === c.id ? 'on' : ''}`}
                  aria-current={summary === c.id ? 'page' : undefined}
                  onClick={() => openSummary({ chapter: c.id })}
                >
                  <span className="pr-tick pr-sumicon" aria-hidden>
                    <Icon name="book" size={11} />
                  </span>
                  <span className="pr-ptitle">{tr('要点', 'Key points')}</span>
                </button>
              </li>
            )}
            {list.map((p) => {
              const st = statusOf(p);
              return (
                <li key={p.id}>
                  <button
                    className={`pr-pitem ${p.id === current?.id && !summary ? 'on' : ''} ${st ? `done st-${st}` : ''}`}
                    aria-current={p.id === current?.id && !summary ? 'page' : undefined}
                    onClick={() => open(p.id)}
                    title={st ? statusLabel(st) : undefined}
                  >
                    <span className="pr-tick" aria-hidden>
                      {st ? STATUS_MARK[st] : ''}
                    </span>
                    {st && <span className="sr-only">{statusLabel(st) + tr('：', ': ')}</span>}
                    <span className="pr-ptitle">
                      <Sym text={entryTitle(p)} />
                    </span>
                    <span className="pr-plevel" title={tr(`难度 ${p.level}`, `Level ${p.level}`)} aria-hidden>
                      {'★'.repeat(p.level)}
                    </span>
                    <span className="sr-only">{tr(`，难度 ${p.level}`, `, level ${p.level}`)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  let num = 0;
  let optNum = 0;
  return (
    <aside id="pr-side" className="pr-side card" ref={sideRef} aria-busy={!ready} aria-label={tr('章节与题目', 'Chapters and problems')}>
      <div className="pr-side-tools">
        <select
          className="pr-jump"
          value=""
          aria-label={tr('跳到章节', 'Jump to chapter')}
          onChange={(e) => {
            if (e.target.value) jump(e.target.value);
          }}
        >
          <option value="">{tr('跳到章节…', 'Jump to chapter…')}</option>
          {GROUPS.map((ph) => (
            <optgroup key={ph.n} label={ph.label()}>
              {CHAPTERS.filter((c) => c.world === ph.n).map((c) => {
                const list = byChapter.get(c.id) ?? [];
                return (
                  <option key={c.id} value={c.id} disabled={ready && !list.length}>
                    {++optNum}. {c.title()}
                    {list.length ? ` (${list.filter(done).length}/${list.length})` : ''}
                  </option>
                );
              })}
            </optgroup>
          ))}
        </select>
        <ShortcutHelp />
      </div>
      <MasteryNav />
      {GROUPS.map((ph) => {
        const chs = CHAPTERS.filter((c) => c.world === ph.n);
        const all = chs.flatMap((c) => byChapter.get(c.id) ?? []);
        const d = all.filter(done).length;
        return (
          <section key={ph.n} className="pr-phase">
            <div className="eyebrow pr-phase-head">
              <span>{ph.label()}</span>
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
      <ProgressFile />
    </aside>
  );
}

/** Phones / narrow tablets: a bar at the bottom, in thumb reach — the problem list (a drawer) and
 *  previous / next problem. Hidden on wide screens, where the sidebar and header buttons do this. */
function PhoneNav({
  problems,
  current,
  summary,
  drawer,
  setDrawer,
}: {
  problems: ProblemEntry[];
  current: ProblemEntry | null;
  summary: string | null;
  drawer: boolean;
  setDrawer: (v: boolean) => void;
}) {
  const open = useStore((s) => s.openProblem);
  const practiceDone = useStore((s) => s.practiceDone);
  const view = useStore((s) => s.practiceView);
  const notes = useMastery((s) => s.data.notes);
  const day = useMastery((s) => s.day);
  const due = dueNotes({ v: 1, notes, quizzes: [] }, day).length;
  // notebook / review / quiz: a menu above the bar (the sidebar links live in the drawer)
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [view, current?.id, summary]);
  // open: focus its first link; Esc (or a tap outside) closes it, Esc returns focus to the button
  useEffect(() => {
    if (!menu) return;
    requestAnimationFrame(() => document.querySelector<HTMLElement>('#pr-phone-menu button, #pr-phone-menu a')?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setMenu(false);
      document.querySelector<HTMLElement>('.pr-phone-review')?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      if (!t.closest('#pr-phone-menu, .pr-phone-review')) setMenu(false);
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onDown, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onDown, true);
    };
  }, [menu]);
  let prev: ProblemEntry | null = null;
  let next: ProblemEntry | null = null;
  let pos = '';
  if (summary) {
    const first = problems.findIndex((x) => x.chapter === summary);
    next = first < 0 ? null : problems[first];
    prev = first < 1 ? null : problems[first - 1];
    pos = tr('要点', 'Key points');
  } else if (current) {
    const n = neighbours(problems, current.id, (x) => !!practiceDone[x.id]);
    prev = n.prev;
    next = n.next;
    pos = `${n.i + 1} / ${problems.length}`;
  }
  return (
    <nav className="pr-phone-nav" aria-label={tr('题目导航', 'Problem navigation')}>
      <button className={drawer ? 'on' : ''} aria-expanded={drawer} aria-controls="pr-side" onClick={() => setDrawer(!drawer)}>
        <Icon name="book" size={18} /> <span className="pr-phone-label">{tr('题目', 'Problems')}</span>
      </button>
      <button className={`pr-phone-review ${menu || view ? 'on' : ''}`} aria-expanded={menu} aria-controls="pr-phone-menu" onClick={() => setMenu(!menu)}>
        <Icon name="target" size={18} /> <span className="pr-phone-label">{tr('复习', 'Review')}</span>
        {due > 0 && <b aria-label={tr(`${due} 道今日到期`, `${due} due today`)}>{due}</b>}
      </button>
      {menu && (
        <div className="pr-phone-menu" id="pr-phone-menu">
          <MasteryNav />
        </div>
      )}
      <span className="pr-phone-pos">{pos}</span>
      <button disabled={!prev} onClick={() => prev && open(prev.id)} aria-label={tr('上一题', 'Previous problem')}>
        <Icon name="prev" size={18} />
      </button>
      <button className="primary" disabled={!next} onClick={() => next && open(next.id)} aria-label={tr('下一题', 'Next problem')}>
        <Icon name="next" size={18} />
      </button>
    </nav>
  );
}

// ---------------------------------------------------------------- questions

/** "本章要点" link: opens the chapter's key-points page at the key idea that practises this problem. */
function KeyPointsLink({ p, label }: { p: Problem; label?: string }) {
  const openSummary = useStore((s) => s.openSummary);
  if (!hasSummary(p.chapter)) return null;
  return (
    <button
      className="pr-link pr-keypoints"
      onClick={() => openSummary({ chapter: p.chapter, problem: p.id, from: p.id })}
      title={tr('打开本章要点：方法、公式、例题', "Open the chapter's key points: methods, formulas, worked examples")}
    >
      <Icon name="book" size={15} /> {label ?? tr('本章要点', 'Chapter key points')}
    </button>
  );
}

interface QState {
  input: string;
  result: AnswerCheck | null;
  choice: number | null;
  revealed: boolean;
}

function QuestionCard({ p, q, index, onHover }: { p: Problem; q: Question; index: number; onHover: (q: Question | null) => void }) {
  const prog = useStore((s) => s.practiceAnswers[p.id]?.[q.id]);
  const practiceEvent = useStore((s) => s.practiceEvent);
  useLang();
  const [st0, setSt] = useState<QState>({ input: '', result: null, choice: null, revealed: false });
  const inputRef = useRef<HTMLInputElement>(null);
  // the feedback text is localised: re-check in the current language instead of keeping old text
  const st = st0.result ? { ...st0, result: checkAnswer(q, st0.input) } : st0;
  const statusBefore = prog?.status;
  const solvedBefore = !!statusBefore;
  const correctNow = st.result?.ok || (q.choices && st.choice === q.correct);
  const solved = solvedBefore || !!correctNow;
  const reviewed = statusBefore === 'revealed';
  const showExplain = (correctNow || st.revealed || solvedBefore) && !!q.explain;

  const submit = () => {
    const r = checkAnswer(q, st.input);
    setSt({ ...st, result: r });
    if (r.ok) practiceEvent(p.id, q.id, { kind: 'right', input: st.input });
    // unreadable input isn't an attempt
    else if (r.value !== undefined) practiceEvent(p.id, q.id, { kind: 'wrong', input: st.input, diag: r.diagnosis });
  };
  const choose = (i: number) => {
    setSt({ ...st, choice: i });
    if (i === q.correct) practiceEvent(p.id, q.id, { kind: 'right', choices: q.choices?.length });
    else practiceEvent(p.id, q.id, { kind: 'wrong', choice: i });
  };
  const reveal = () => {
    setSt({ ...st, revealed: true });
    practiceEvent(p.id, q.id, { kind: 'reveal' });
  };
  const choiceWhy = st.choice !== null ? q.choiceExplain?.[st.choice] : undefined;
  const qid = useId();
  const qLetter = String.fromCharCode(97 + index);

  return (
    <div className={`pr-q ${solved ? 'solved' : ''} ${reviewed ? 'reviewed' : ''}`} onMouseEnter={() => onHover(q)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(q)}>
      <div className="pr-q-head">
        <span className="pr-q-num" title={statusBefore ? statusLabel(statusBefore) : undefined} aria-hidden>
          {solved ? (reviewed ? STATUS_MARK.revealed : '✓') : qLetter}
        </span>
        <div className="pr-q-ask" id={`${qid}-ask`}>
          <span className="sr-only">
            {tr(`第 ${qLetter} 问`, `Question ${qLetter}`)}
            {solved ? tr(`（${reviewed ? statusLabel('revealed') : '已答对'}）`, ` (${reviewed ? statusLabel('revealed') : 'answered'})`) : ''}:{' '}
          </span>
          <PrMd text={q.ask} />
        </div>
      </div>

      {q.choices ? (
        <div className="pr-choices" role="radiogroup" aria-labelledby={`${qid}-ask`} onKeyDown={radioFocusKeys}>
          {q.choices.map((c, i) => {
            const picked = st.choice === i;
            const cls = (picked || st.revealed || solvedBefore) && i === q.correct ? 'right' : picked ? 'wrong' : '';
            return (
              <button key={i} role="radio" aria-checked={picked} tabIndex={(st.choice ?? 0) === i ? 0 : -1} className={`pr-choice ${cls}`} onClick={() => choose(i)}>
                <span className="pr-choice-key">{String.fromCharCode(65 + i)}</span>
                {cls && <span className="sr-only">{cls === 'right' ? tr('（正确答案）', ' (correct answer)') : tr('（不对）', ' (wrong)')}</span>}
                <span>
                  <Sym text={c} />
                </span>
                {cls === 'right' && <Icon name="check" size={16} />}
                {cls === 'wrong' && (
                  <span className="pr-choice-x" aria-hidden>
                    ✗
                  </span>
                )}
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
          <div className={`pr-input ${st.result ? (st.result.ok ? 'ok' : st.result.close ? 'close' : 'bad') : ''}`}>
            <input
              ref={inputRef}
              value={st.input}
              spellCheck={false}
              autoComplete="off"
              placeholder={tr('输入答案或算式', 'Answer or calculation')}
              aria-labelledby={`${qid}-ask`}
              aria-describedby={q.unit ? `${qid}-unit` : undefined}
              onChange={(e) => setSt({ ...st, input: e.target.value, result: null })}
            />
            {q.unit ? (
              <span className="pr-unit" id={`${qid}-unit`}>
                <span className="sr-only">{tr('单位：', 'unit: ')}</span>
                {q.unit}
              </span>
            ) : null}
          </div>
          <button type="submit" className="primary" disabled={!st.input.trim()}>
            <Icon name="check" size={16} /> {tr('检查', 'Check')}
          </button>
          <SymbolKeys input={inputRef} onChange={(v) => setSt({ ...st, input: v, result: null })} />
        </form>
      )}

      {/* always present, so each new verdict is announced once (the verdicts themselves are not live) */}
      <div className="pr-live" aria-live="polite">
        {st.result && !q.choices && (
          <div className={`pr-feedback ${st.result.ok ? 'ok' : st.result.close ? 'close' : 'bad'}`}>
            {st.result.ok ? (
              <>
                <b>✓ {tr('正确！', 'Correct!')}</b> {tr('标准答案', 'Answer')}: {formatAnswer(q)}
              </>
            ) : (
              <>
                <b>{st.result.value === undefined ? `✗ ${tr('无法判断', "Can't check")}` : st.result.close ? `≈ ${tr('很接近', 'Close')}` : `✗ ${tr('不对', 'Not quite')}`}</b>
                {st.result.reason ? ` — ${st.result.reason}` : tr(' — 再算一次，或看看提示。', ' — try again, or take a hint.')}
                {st.result.value !== undefined && <KeyPointsLink p={p} label={tr('复习本章要点', 'Review the key points')} />}
              </>
            )}
          </div>
        )}
        {q.choices && st.choice !== null && (
          <div className={`pr-feedback ${st.choice === q.correct ? 'ok' : 'bad'}`}>
            <b>{st.choice === q.correct ? `✓ ${tr('正确！', 'Correct!')}` : `✗ ${tr('不对', 'Not quite')}`}</b>
            {choiceWhy ? (
              <>
                {' — '}
                <Sym text={choiceWhy} />
              </>
            ) : st.choice !== q.correct ? (
              tr(' — 再想想。', ' — think again.')
            ) : null}
            {st.choice !== q.correct && <KeyPointsLink p={p} label={tr('复习本章要点', 'Review the key points')} />}
          </div>
        )}
      </div>
      {solvedBefore && !correctNow && !st.result && st.choice === null && (
        <div className="pr-feedback ok soft">
          {statusBefore === 'revealed' ? STATUS_MARK.revealed : '✓'} {statusLabel(statusBefore!)}
          {!q.choices && ` · ${formatAnswer(q)}`}
        </div>
      )}

      {!solved && (
        <div className="pr-q-tools">
          {!st.revealed && !prog?.revealed ? (
            <button className="pr-link" onClick={reveal} title={tr('看过答案后再答对只算“复习”，不计入完成数', 'Answering after this counts as reviewed, not done')}>
              <Icon name="eye" size={15} /> {tr('看答案', 'Show answer')}
            </button>
          ) : (
            <span className="pr-revealed">
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

/** "±2%, phase ±1°" — the tolerances a problem's numeric questions are judged with. */
function toleranceNote(p: Problem): string {
  const rel = new Set<string>();
  let phase = false;
  for (const q of p.questions) {
    if (typeof q.answer !== 'number') continue;
    if (isPhaseQuestion(q)) phase = true;
    else rel.add(answerTolerance(q));
  }
  const parts = [...rel];
  if (phase) parts.push(tr(`相位 ${answerTolerance({ unit: '°' })}`, `phase ${answerTolerance({ unit: '°' })}`));
  return parts.join(tr('，', ', '));
}

// ---------------------------------------------------------------- problem card

function ProblemView({ p, list }: { p: Problem; list: ProblemEntry[] }) {
  const open = useStore((s) => s.openProblem);
  const done = useStore((s) => s.practiceDone);
  const resetProblem = useStore((s) => s.resetProblem);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [hover, setHover] = useState<Question | null>(null);
  const [round, setRound] = useState(0);
  const isDone = !!done[p.id];
  const [wasDone] = useState(isDone);
  const status = useStore((s) =>
    problemStatus(
      s.practiceAnswers[p.id],
      p.questions.map((q) => q.id),
    ),
  );
  const reviewedAll = !isDone && status === 'revealed';

  useEffect(() => {
    if (isDone && !wasDone) celebrate();
  }, [isDone, wasDone]);

  const { i, prev, next } = neighbours(list, p.id, (x) => !!done[x.id]);
  const chapter = chapterById(p.chapter);
  const highlight =
    hover?.find && 'el' in hover.find && typeof hover.find.el === 'string' ? [hover.find.el] : hover?.find && 'input' in hover.find ? [hover.find.input] : undefined;

  return (
    <article className="pr-main card">
      <header className="pr-head">
        <div className="pr-crumbs">
          <span className="eyebrow">
            {groupName(chapter?.world)} · {chapter?.title()}
          </span>
          <div className="row">
            <KeyPointsLink p={p} />
            <button className="pr-head-nav" disabled={!prev} onClick={() => prev && open(prev.id)} title={tr('上一题（[）', 'Previous problem ([)')}>
              <Icon name="prev" size={16} />
            </button>
            <span className="muted small pr-head-nav">
              {i + 1} / {list.length}
            </span>
            <button className="pr-head-nav" disabled={!next} onClick={() => next && open(next.id)} title={tr('下一题（]）', 'Next problem (])')}>
              <Icon name="next" size={16} />
            </button>
          </div>
        </div>
        <div className="task-head">
          <span className="badge practice">
            <Mixed text={tr('练习 PRACTICE', 'PRACTICE')} />
          </span>
          <Stars n={p.level} />
          {isDone && <span className="badge done">✓ {tr('已完成', 'Done')}</span>}
          {reviewedAll && (
            <span className="badge reviewed">
              {STATUS_MARK.revealed} {tr('已复习', 'Reviewed')}
            </span>
          )}
          {p.source !== 'folder' && <span className="badge src">{tr('导入', 'Imported')}</span>}
        </div>
        <h1 className="pr-title">
          <Sym text={p.title} />
        </h1>
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
          <div className="eyebrow">
            <Mixed text={tr('电路图 CIRCUIT', 'CIRCUIT')} />
          </div>
          <div className="schem-card pr-schem">
            <ProblemSchematic schematic={p.schematic} highlight={highlight} />
          </div>
          {p.schematic.plot && <UiPlot schematic={p.schematic} />}
          {p.schematic.graph && <GraphFigure graph={p.schematic.graph} />}
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
          {p.questions.some((q) => typeof q.answer === 'number') && (
            <p className="note">
              {tr(
                '可以写算式和单位前缀：12/6、2√2、sqrt(3)/2、π/6 rad、2.5k、-3m、4.7µ、1.2e-3、60% 都行。',
                'Calculations and unit prefixes are fine: 12/6, 2√2, sqrt(3)/2, π/6 rad, 2.5k, -3m, 4.7µ, 1.2e-3, 60% all work.',
              )}{' '}
              <b>{tr(`允许误差：${toleranceNote(p)}`, `Tolerance: ${toleranceNote(p)}`)}</b>
            </p>
          )}

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

          {reviewedAll && (
            <div className="pr-reviewed-box">
              {tr(
                '都答完了，但有的题是看过答案后答对的：算作“复习”，不计入完成数。过几天点“重做这道题”，不看答案再做一遍吧。',
                'All answered, but some only after seeing the answer: that counts as reviewed, not done. Come back later, press "Start this problem over" and solve it without the answer.',
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
  const full = useProblem(current);
  const bad = invalid.filter((f) => f.errors.length).length;
  const summary = useStore((s) => s.practiceSummary);
  const view = useStore((s) => s.practiceView);
  const indexStatus = useStore((s) => s.problemIndex);
  const practiceDone = useStore((s) => s.practiceDone);
  const openProblem = useStore((s) => s.openProblem);
  // phones: the chapter list is a drawer, closed again by any move to another page
  const [drawer, setDrawer] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setDrawer(false);
  }, [current?.id, summary?.chapter, view]);
  useEffect(() => {
    if (!drawer) return;
    // focus into the drawer (its open item); Esc closes it and returns focus to the toggle
    const side = document.querySelector<HTMLElement>('.pr-page > .pr-side');
    requestAnimationFrame(() => (side?.querySelector<HTMLElement>('.pr-pitem.on, .pr-ch-head, select') ?? side)?.focus({ preventScroll: true }));
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setDrawer(false);
      document.querySelector<HTMLElement>('.pr-phone-nav button[aria-controls="pr-side"]')?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer]);

  // [ / ] previous / next problem (on a key-points page: the chapter's first problem / the one before it)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = practiceShortcut(e);
      if ((k !== 'prev' && k !== 'next') || !problems.length) return;
      let to: ProblemEntry | null = null;
      if (summary) {
        const first = problems.findIndex((x) => x.chapter === summary.chapter);
        to = first < 0 ? null : k === 'next' ? problems[first] : (problems[first - 1] ?? null);
      } else if (current) {
        const n = neighbours(problems, current.id, (x) => !!practiceDone[x.id]);
        to = k === 'prev' ? n.prev : n.next;
      }
      if (!to) return;
      e.preventDefault();
      openProblem(to.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [problems, current, summary, practiceDone, openProblem]);

  return (
    <main id="main" className={`pr-page ${drawer ? 'drawer-open' : ''}`}>
      <ChapterList problems={problems} current={view ? null : current} summary={summary?.chapter ?? null} ready={indexStatus === 'ready'} />
      <button className="pr-drawer-bg" tabIndex={-1} aria-hidden onClick={() => setDrawer(false)} />
      <PhoneNav problems={problems} current={view ? null : current} summary={summary?.chapter ?? null} drawer={drawer} setDrawer={setDrawer} />
      {view ? (
        <Suspense
          fallback={
            <div className="pr-main card pr-empty" role="status">
              <p className="muted">{tr('加载中…', 'Loading…')}</p>
            </div>
          }
        >
          <MasteryPage view={view} />
        </Suspense>
      ) : summary ? (
        <SummaryPage key={summary.chapter} target={summary} problems={problems} />
      ) : current && full?.problem ? (
        <ProblemView key={current.id} p={full.problem} list={problems} />
      ) : current ? (
        <div className="pr-main card pr-empty">
          {full ? (
            <>
              <h1 className="pr-title">{tr('这道题无法加载', "This problem can't be loaded")}</h1>
              <ul>
                {full.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="muted">{tr('正在加载题目…', 'Loading the problem…')}</p>
          )}
        </div>
      ) : indexStatus === 'error' ? (
        <div className="pr-main card pr-empty" role="alert">
          <h1 className="pr-title">{tr('题目列表加载失败', "Couldn't load the problem list")}</h1>
          <p>{tr('请检查网络连接后重试。', 'Check the connection and try again.')}</p>
          <button className="primary" onClick={() => void ensureProblemIndex()}>
            <Icon name="reset" size={15} /> {tr('重试', 'Try again')}
          </button>
        </div>
      ) : indexStatus !== 'ready' ? (
        <div className="pr-main card pr-empty" role="status">
          <p className="muted">{tr('正在加载题目…', 'Loading the problem…')}</p>
        </div>
      ) : (
        <div className="pr-main card pr-empty">
          <div className="eyebrow">
            <Mixed text={tr('练习 PRACTICE', 'PRACTICE')} />
          </div>
          <h1 className="pr-title">{tr('还没有理论题', 'No theory problems yet')}</h1>
          <p>
            {tr('把 ', 'Put ')}
            <code>circuit-problem/1</code>
            {tr(' 格式的题目放进项目的 ', " problem files in the project's ")}
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
