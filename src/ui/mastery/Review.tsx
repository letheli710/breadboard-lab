// Today's review session (the Leitner schedule, state/mastery.ts) and the one-screen explainer.

import { useState } from 'react';
import { tr } from '../../core/i18n';
import { dueNotes, INTERVALS, MASTERED, noteKey } from '../../state/mastery';
import { useMastery } from '../../state/masteryStore';
import { entryTitle } from '../../state/problems';
import { useStore } from '../../state/store';
import { Icon } from '../Icons';
import { Sym } from '../richText';
import { BlindQuestion } from './QuestionParts';
import { dayLabel } from './text';
import { Mixed } from '../Mixed';

export function ReviewSession() {
  const data = useMastery((s) => s.data);
  const day = useMastery((s) => s.day);
  const problems = useStore((s) => s.problems);
  const ready = useStore((s) => s.problemIndex) === 'ready';
  const openView = useStore((s) => s.openPracticeView);
  // the items due when the session started (a new day or the clock hook starts a new session)
  const [session, setSession] = useState(() => ({ day, keys: dueNotes(data, day).map((n) => noteKey(n.pid, n.qid)) }));
  const [i, setI] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  if (session.day !== day) {
    setSession({ day, keys: dueNotes(data, day).map((n) => noteKey(n.pid, n.qid)) });
    setI(0);
    setResults([]);
  }
  const known = new Set(problems.map((p) => p.id));
  // entries of problems that no longer exist can't be served
  const keys = ready ? session.keys.filter((k) => known.has(data.notes[k]?.pid)) : session.keys;
  const next = Object.values(data.notes)
    .filter((n) => n.box < MASTERED && n.due > day)
    .sort((a, b) => a.due.localeCompare(b.due))[0];
  const nextCount = next ? Object.values(data.notes).filter((n) => n.box < MASTERED && n.due === next.due).length : 0;

  const head = (
    <>
      <div className="eyebrow">
        <Mixed text={tr('间隔复习 REVIEW', 'SPACED REVIEW')} />
      </div>
      <h2 className="pr-title">{tr('今日复习', "Today's review")}</h2>
    </>
  );

  if (!ready)
    return (
      <div className="ms-page">
        {head}
        <p className="muted">{tr('正在加载题目…', 'Loading the problems…')}</p>
      </div>
    );

  if (i >= keys.length) {
    const ok = results.filter(Boolean).length;
    return (
      <div className="ms-page">
        {head}
        {keys.length ? (
          <div className="ok-box big">
            {tr(
              `完成！${keys.length} 道里 ${ok} 道第一次就答对，升到下一盒；其余回到第 1 盒，明天再来。`,
              `Done! ${ok} of ${keys.length} right at the first try moved up a box; the rest went back to box 1 for tomorrow.`,
            )}
          </div>
        ) : (
          <p className="ms-empty">{tr('今天没有要复习的题。', 'Nothing is due today.')}</p>
        )}
        {next && <p>{tr(`下一次复习：${dayLabel(next.due, day)}（${nextCount} 道）`, `Next review: ${dayLabel(next.due, day)} (${nextCount} item(s))`)}</p>}
        <div className="row">
          <button onClick={() => openView('notebook')}>
            <Icon name="book" size={15} /> {tr('错题本', 'Mistake notebook')}
          </button>
          <button onClick={() => openView('quiz')}>
            <Icon name="practice" size={15} /> {tr('测验', 'Quiz')}
          </button>
        </div>
      </div>
    );
  }

  const n = data.notes[keys[i]];
  const entry = problems.find((p) => p.id === n.pid);
  return (
    <div className="ms-page">
      {head}
      <div className="ms-progress" role="status">
        <span>
          {i + 1} / {keys.length}
        </span>
        <span className="ms-pbar" aria-hidden>
          <span style={{ width: `${(i / keys.length) * 100}%` }} />
        </span>
        <span className="muted small">
          {tr(`第 ${n.box} 盒`, `Box ${n.box}`)}
          {entry && (
            <>
              {' · '}
              <Sym text={entryTitle(entry)} />
            </>
          )}
        </span>
      </div>
      <BlindQuestion
        key={keys[i]}
        pid={n.pid}
        qid={n.qid}
        via="review"
        onDone={(ok) => {
          setResults([...results, ok]);
          setI(i + 1);
          window.scrollTo({ top: 0 });
        }}
      />
    </div>
  );
}

export function HowItWorks() {
  const openView = useStore((s) => s.openPracticeView);
  return (
    <div className="ms-page ms-how">
      <div className="eyebrow">
        <Mixed text={tr('说明 HOW IT WORKS', 'HOW IT WORKS')} />
      </div>
      <h2 className="pr-title">{tr('错题本、复习和测验是怎么运作的', 'How the notebook, review and quizzes work')}</h2>
      <div className="ms-how-grid">
        <section>
          <h3>
            <Icon name="book" size={16} /> {tr('1 · 错题本', '1 · Mistake notebook')}
          </h3>
          <p>
            {tr(
              '任何一问只要答错过一次，或者点了“看答案”，就自动记进错题本：你填了什么、系统识别出的错误类型（符号、×10³ 前缀、√2 峰值/有效值……）、哪天、后来怎么解决的。',
              'Any question part you answer wrong once, or whose answer you reveal, goes in automatically: what you entered, the mistake the checker recognised (sign, ×10³ prefix, √2 peak/RMS …), when, and how it was resolved.',
            )}
          </p>
          <p>
            {tr(
              '只有在出错之后的某一天，不看答案、第一次就答对，它才离开“待改正”列表（记录永远保留）。按类型的计数能告诉你：“我总是把峰值和有效值弄混”。',
              'It leaves the active list only when you get it right at the first try, without the answer, on a later day than the mistake (the history stays). The counts per type show patterns like "I keep mixing up peak and RMS".',
            )}
          </p>
        </section>
        <section>
          <h3>
            <Icon name="target" size={16} /> {tr('2 · 间隔复习（莱特纳盒子）', '2 · Spaced review (Leitner boxes)')}
          </h3>
          <ol className="ms-boxes" aria-label={tr('复习间隔', 'Review intervals')}>
            {INTERVALS.map((d, k) => (
              <li key={k}>
                <b>{tr(`第 ${k + 1} 盒`, `Box ${k + 1}`)}</b>
                <span>{tr(`${d} 天后`, `after ${d} day${d > 1 ? 's' : ''}`)}</span>
              </li>
            ))}
            <li className="done">
              <b>✓</b>
              <span>{tr('掌握', 'mastered')}</span>
            </li>
          </ol>
          <p>
            {tr(
              '每条错题从第 1 盒开始，第二天到期。到期那天第一次就答对 → 升一盒，间隔变长（1、3、7、21 天）；第 4 盒也答对就算掌握。答错或看答案 → 回到第 1 盒。页眉上的“今日复习”显示今天到期的数量。日期按本机时钟。',
              'Each entry starts in box 1, due the next day. Right at the first try on its due day → up one box, and the gap grows (1, 3, 7, 21 days); right in box 4 means mastered. Wrong or revealed → back to box 1. The header shows how many are due today. Dates follow this device’s clock.',
            )}
          </p>
        </section>
        <section>
          <h3>
            <Icon name="practice" size={16} /> {tr('3 · 测验', '3 · Quiz')}
          </h3>
          <p>
            {tr(
              '选章节（或“到期 + 薄弱章节”）、题数和时间，系统按难度分层抽题。测验中没有对错反馈、提示、解答和要点链接，交卷前可以随时改答案；计时器可以暂停。交卷后看分数、每题的正常反馈和解答，答错的自动记进错题本。判分和练习完全一样（同样的误差范围）。',
              'Pick chapters (or "due + weak areas"), the number of questions and a time limit; questions are drawn stratified by difficulty. During the quiz there is no right/wrong feedback, no hints, solutions or key-point links, and you can change answers until you submit; the timer can be paused. Afterwards: your score, the normal feedback and solution for each question, and wrong ones go into the notebook. Answers are checked exactly as in practice (same tolerances).',
            )}
          </p>
        </section>
      </div>
      <p className="note">
        {tr(
          '一切都只存在这个浏览器里。换设备前用侧栏的“导出进度”保存（包括错题本、复习安排和测验记录），再在新设备上“导入进度”。',
          'Everything is stored in this browser only. Use "Export progress" in the sidebar (it includes the notebook, the schedule and quiz history) and "Import progress" on the other device.',
        )}
      </p>
      <div className="row">
        <button className="primary" onClick={() => openView('notebook')}>
          <Icon name="book" size={15} /> {tr('打开错题本', 'Open the notebook')}
        </button>
      </div>
    </div>
  );
}
