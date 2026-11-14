// Practice sidebar links to the notebook, today's review and the quiz, with their counts.

import { tr } from '../../core/i18n';
import { dueNotes, isActive } from '../../state/mastery';
import { useMastery } from '../../state/masteryStore';
import { useLang, useStore } from '../../state/store';
import './mastery.css';
import { Icon } from '../Icons';

export function MasteryNav() {
  useLang();
  const view = useStore((s) => s.practiceView);
  const open = useStore((s) => s.openPracticeView);
  const notes = useMastery((s) => s.data.notes);
  const day = useMastery((s) => s.day);
  const quiz = useMastery((s) => s.quiz);
  const active = Object.values(notes).filter(isActive).length;
  const due = dueNotes({ v: 1, notes, quizzes: [] }, day).length;
  const item = (v: 'notebook' | 'due' | 'quiz', icon: string, label: string, n: number | string | null, title: string) => (
    <button className={`ms-navitem ${view === v ? 'on' : ''}`} aria-current={view === v ? 'page' : undefined} onClick={() => open(v)} title={title}>
      <Icon name={icon} size={15} />
      <span>{label}</span>
      {n !== null && n !== 0 && <b className={v === 'due' ? 'due' : ''}>{n}</b>}
    </button>
  );
  return (
    <nav className="ms-nav" aria-label={tr('错题与复习', 'Mistakes and review')}>
      {item('notebook', 'book', tr('错题本', 'Notebook'), active, tr('答错过或看过答案的题', 'Parts you got wrong or revealed'))}
      {item('due', 'target', tr('今日复习', 'Review'), due, tr('今天到期的复习', 'Reviews due today'))}
      {item('quiz', 'practice', tr('测验', 'Quiz'), quiz ? '●' : null, tr('章节测验 / 考试模式', 'Chapter quiz / exam mode'))}
    </nav>
  );
}
