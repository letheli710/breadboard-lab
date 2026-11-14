// Header (Practice progress card): "N due today" — opens today's review. A lazy chunk.

import { tr } from '../../core/i18n';
import { dueNotes } from '../../state/mastery';
import { useMastery } from '../../state/masteryStore';
import { useLang, useStore } from '../../state/store';
import './mastery.css';

export default function DueChip() {
  useLang();
  const data = useMastery((s) => s.data);
  const day = useMastery((s) => s.day);
  const open = useStore((s) => s.openPracticeView);
  const n = dueNotes(data, day).length;
  if (!n) return null;
  return (
    <button className="pc-due" onClick={() => open('due')} title={tr('打开今日复习', "Open today's review")}>
      {tr(`今日复习 ${n}`, `${n} due today`)}
    </button>
  );
}
