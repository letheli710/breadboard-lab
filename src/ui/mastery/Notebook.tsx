// The mistake notebook (错题本): every question part answered wrong or revealed, grouped by
// chapter or by mistake type, with counts, filters, the attempt history and a blind retry.

import { useMemo, useState } from 'react';
import { tr } from '../../core/i18n';
import { CHAPTERS, chapterById } from '../../core/problem/chapters';
import { dueNotes, isActive, lastFix, MASTERED, MISTAKE_TYPES, notebookStats, type MistakeType, type Note } from '../../state/mastery';
import { useMastery } from '../../state/masteryStore';
import { entryTitle, type ProblemEntry } from '../../state/problems';
import { useStore } from '../../state/store';
import { Icon } from '../Icons';
import { Sym } from '../richText';
import { BlindQuestion } from './QuestionParts';
import { dayLabel, mistakeLabel, qLetter, viaLabel } from './text';
import { Mixed } from '../Mixed';

type Status = 'active' | 'resolved' | 'all';
type Group = 'chapter' | 'type';

export const OTHER_CHAPTER = '_other';

/** pid → chapter id (from the problem index; problems that no longer exist go to OTHER_CHAPTER) */
export function useChapterOf(): (pid: string) => string {
  const problems = useStore((s) => s.problems);
  return useMemo(() => {
    const m = new Map(problems.map((p) => [p.id, p.chapter]));
    return (pid: string) => m.get(pid) ?? OTHER_CHAPTER;
  }, [problems]);
}

export const chapterName = (id: string) => (id === OTHER_CHAPTER ? tr('其他 / 已删除的题', 'Other / removed problems') : (chapterById(id)?.title() ?? id));
const chapterOrder = (id: string) => {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return i < 0 ? CHAPTERS.length : i;
};

/** the most frequent mistake of an entry */
const mainType = (n: Note): MistakeType =>
  (Object.entries(n.types) as [MistakeType, number][]).sort((a, b) => b[1] - a[1] || MISTAKE_TYPES.indexOf(a[0]) - MISTAKE_TYPES.indexOf(b[0]))[0]?.[0] ?? 'wrong';

function NoteCard({ n, entry, day, onRetry }: { n: Note; entry: ProblemEntry | undefined; day: string; onRetry: () => void }) {
  const [open, setOpen] = useState(false);
  const fix = lastFix(n);
  const lastWrong = [...n.log].reverse().find((a) => !a.ok);
  return (
    <li className={`ms-note ${isActive(n) ? 'active' : 'resolved'}`}>
      <div className="ms-note-head">
        <div className="ms-note-title">
          {entry ? <Sym text={entryTitle(entry)} /> : n.pid}
          <span className="ms-part">
            {' · '}
            {tr(`第 ${entry ? qLetter(entry.qids, n.qid) : n.qid} 问`, `part ${entry ? qLetter(entry.qids, n.qid) : n.qid}`)}
          </span>
        </div>
        <button
          className="primary ms-retry"
          onClick={onRetry}
          disabled={!entry}
          title={tr('不显示之前的答案和解答，重新做一遍', 'Answer again without your earlier answer or the solution')}
        >
          <Icon name="reset" size={14} /> {tr('盲做重试', 'Blind retry')}
        </button>
      </div>
      <div className="ms-chips">
        {(Object.entries(n.types) as [MistakeType, number][]).map(([t, k]) => (
          <span key={t} className={`ms-chip t-${t}`}>
            {mistakeLabel(t)}
            {k > 1 ? ` ×${k}` : ''}
          </span>
        ))}
      </div>
      <div className="ms-note-meta small">
        {lastWrong?.input !== undefined && (
          <span>
            {tr('上次填的', 'Last entered')}: <code>{lastWrong.input}</code>
          </span>
        )}
        <span>
          {tr('最近出错', 'Last mistake')}: {dayLabel(n.lastWrong, day)}
        </span>
        <span className="ms-state">
          {n.box >= MASTERED
            ? tr('✓ 已掌握', '✓ Mastered')
            : n.resolved
              ? tr(`✓ ${dayLabel(n.resolved, day)} 已改正 · 第 ${n.box} 盒`, `✓ Fixed ${dayLabel(n.resolved, day)} · box ${n.box}`)
              : tr(`第 ${n.box} 盒`, `Box ${n.box}`)}
          {n.box < MASTERED && ` · ${n.due <= day ? tr('今天该复习', 'due today') : tr(`${dayLabel(n.due, day)} 复习`, `review ${dayLabel(n.due, day)}`)}`}
        </span>
        {fix && !n.resolved && <span>{tr(`当时改正后答对（${viaLabel(fix.via)}）`, `then corrected (${viaLabel(fix.via)})`)}</span>}
        <button className="pr-link" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? tr('收起记录', 'Hide history') : tr(`记录（${n.log.length}）`, `History (${n.log.length})`)}
        </button>
      </div>
      {open && (
        <ol className="ms-log small">
          {n.log.map((a, i) => (
            <li key={i} className={a.ok ? 'ok' : 'bad'}>
              <span>{dayLabel(a.day, day)}</span>
              <span>{viaLabel(a.via)}</span>
              <span>{a.ok ? '✓' : `✗ ${a.type ? mistakeLabel(a.type) : ''}`}</span>
              {a.input !== undefined && <code>{a.input}</code>}
            </li>
          ))}
          {n.lapses > 0 && <li className="muted">{tr(`改正后又错过 ${n.lapses} 次`, `came back ${n.lapses} time(s) after being fixed`)}</li>}
        </ol>
      )}
    </li>
  );
}

export function Notebook() {
  const data = useMastery((s) => s.data);
  const day = useMastery((s) => s.day);
  const problems = useStore((s) => s.problems);
  const ready = useStore((s) => s.problemIndex) === 'ready';
  const openView = useStore((s) => s.openPracticeView);
  const chapterOf = useChapterOf();
  const [status, setStatus] = useState<Status>('active');
  const [group, setGroup] = useState<Group>('chapter');
  const [chapter, setChapter] = useState<string>('');
  const [type, setType] = useState<MistakeType | ''>('');
  const [retry, setRetry] = useState<Note | null>(null);

  const byId = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);
  const all = Object.values(data.notes);
  const stats = useMemo(() => notebookStats(data, chapterOf), [data, chapterOf]);
  const due = dueNotes(data, day).length;
  const active = all.filter(isActive).length;

  if (retry) {
    return (
      <div className="ms-page">
        <button className="pr-link" onClick={() => setRetry(null)}>
          <Icon name="prev" size={14} /> {tr('回到错题本', 'Back to the notebook')}
        </button>
        <div className="eyebrow">{tr('盲做重试 · 不显示之前的答案和解答', 'Blind retry · your earlier answer and the solution are hidden')}</div>
        <BlindQuestion key={`${retry.pid}#${retry.qid}`} pid={retry.pid} qid={retry.qid} via="retry" onDone={() => setRetry(null)} />
        <p className="note">
          {tr(
            '第一次就答对、并且是在上次出错之后的某一天，这条才会从“待改正”里移走；今天刚错的题，明天再来。',
            'An entry leaves the active list only when you get it right at the first try on a later day than its last mistake — a mistake from today can be cleared tomorrow.',
          )}
        </p>
      </div>
    );
  }

  const list = all
    .filter((n) => (status === 'all' ? true : status === 'active' ? isActive(n) : !isActive(n)))
    .filter((n) => !chapter || chapterOf(n.pid) === chapter)
    .filter((n) => !type || (n.types[type] ?? 0) > 0);
  const groups = new Map<string, Note[]>();
  for (const n of list) {
    const k = group === 'chapter' ? chapterOf(n.pid) : type || mainType(n);
    groups.set(k, [...(groups.get(k) ?? []), n]);
  }
  const keys = [...groups.keys()].sort((a, b) =>
    group === 'chapter' ? chapterOrder(a) - chapterOrder(b) : MISTAKE_TYPES.indexOf(a as MistakeType) - MISTAKE_TYPES.indexOf(b as MistakeType),
  );
  const typeRows = (Object.entries(stats.byType) as [MistakeType, { active: number; total: number; times: number }][]).sort((a, b) => b[1].times - a[1].times);
  const chapterRows = Object.entries(stats.byChapter).sort((a, b) => chapterOrder(a[0]) - chapterOrder(b[0]));
  const maxCh = Math.max(1, ...chapterRows.map(([, c]) => c.total));

  return (
    <div className="ms-page">
      <div className="eyebrow">
        <Mixed text={tr('错题本 MISTAKES', 'MISTAKE NOTEBOOK')} />
      </div>
      <h2 className="pr-title">{tr('错题本', 'Mistake notebook')}</h2>
      <div className="ms-summary">
        <div className="ms-stat">
          <b>{active}</b>
          <span>{tr('待改正', 'to fix')}</span>
        </div>
        <div className="ms-stat">
          <b>{all.length - active}</b>
          <span>{tr('已改正', 'fixed')}</span>
        </div>
        <div className="ms-stat">
          <b>{due}</b>
          <span>{tr('今天该复习', 'due today')}</span>
        </div>
        <div className="ms-actions">
          <button className="primary" disabled={!due} onClick={() => openView('due')}>
            <Icon name="target" size={15} /> {tr('开始今日复习', "Start today's review")}
          </button>
          <button onClick={() => openView('quiz')}>
            <Icon name="practice" size={15} /> {tr('测验', 'Quiz')}
          </button>
          <button className="pr-link" onClick={() => openView('how')}>
            <Icon name="bulb" size={14} /> {tr('这是怎么运作的？', 'How does this work?')}
          </button>
        </div>
      </div>

      {all.length === 0 ? (
        <p className="ms-empty">
          {tr(
            '还没有错题。练习时答错一次、或者点了“看答案”的题，会自动记到这里，并按间隔复习。',
            'No mistakes yet. Any question part you answer wrong once, or whose answer you reveal, is collected here automatically and scheduled for review.',
          )}
        </p>
      ) : (
        <>
          <div className="ms-stats">
            <section>
              <h3>{tr('按错误类型', 'By mistake type')}</h3>
              <ul className="ms-types">
                {typeRows.map(([t, c]) => (
                  <li key={t}>
                    <button className={`ms-chip t-${t} ${type === t ? 'on' : ''}`} aria-pressed={type === t} onClick={() => setType(type === t ? '' : t)}>
                      {mistakeLabel(t)}
                      <b>{c.times}</b>
                    </button>
                    <span className="muted small">{tr(`${c.total} 道（${c.active} 道待改正）`, `${c.total} part(s), ${c.active} to fix`)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3>{tr('按章节', 'By chapter')}</h3>
              <ul className="ms-chapters">
                {chapterRows.map(([ch, c]) => (
                  <li key={ch}>
                    <button className={`ms-chbar ${chapter === ch ? 'on' : ''}`} aria-pressed={chapter === ch} onClick={() => setChapter(chapter === ch ? '' : ch)}>
                      <span className="ms-chname">{ready || ch !== OTHER_CHAPTER ? chapterName(ch) : '…'}</span>
                      <span className="ms-bar" aria-hidden>
                        <span className="fixed" style={{ width: `${((c.total - c.active) / maxCh) * 100}%` }} />
                        <span className="open" style={{ width: `${(c.active / maxCh) * 100}%` }} />
                      </span>
                      <span className="ms-chnum">
                        {c.active}/{c.total}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="ms-filters" role="group" aria-label={tr('筛选', 'Filters')}>
            <label>
              {tr('状态', 'Status')}
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                <option value="active">{tr('待改正', 'To fix')}</option>
                <option value="resolved">{tr('已改正（历史）', 'Fixed (history)')}</option>
                <option value="all">{tr('全部', 'All')}</option>
              </select>
            </label>
            <label>
              {tr('章节', 'Chapter')}
              <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
                <option value="">{tr('全部章节', 'All chapters')}</option>
                {chapterRows.map(([ch]) => (
                  <option key={ch} value={ch}>
                    {chapterName(ch)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {tr('错误类型', 'Mistake')}
              <select value={type} onChange={(e) => setType(e.target.value as MistakeType | '')}>
                <option value="">{tr('全部类型', 'All types')}</option>
                {typeRows.map(([t]) => (
                  <option key={t} value={t}>
                    {mistakeLabel(t)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {tr('分组', 'Group by')}
              <select value={group} onChange={(e) => setGroup(e.target.value as Group)}>
                <option value="chapter">{tr('按章节', 'Chapter')}</option>
                <option value="type">{tr('按错误类型', 'Mistake type')}</option>
              </select>
            </label>
          </div>

          {list.length === 0 && <p className="ms-empty">{tr('没有符合筛选条件的错题。', 'No entries match these filters.')}</p>}
          {keys.map((k) => (
            <section key={k} className="ms-group">
              <h3>
                {group === 'chapter' ? chapterName(k) : mistakeLabel(k as MistakeType)} <span className="muted">({groups.get(k)!.length})</span>
              </h3>
              <ul className="ms-notes">
                {groups
                  .get(k)!
                  .sort((a, b) => b.lastWrong.localeCompare(a.lastWrong))
                  .map((n) => (
                    <NoteCard key={`${n.pid}#${n.qid}`} n={n} entry={byId.get(n.pid)} day={day} onRetry={() => setRetry(n)} />
                  ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
