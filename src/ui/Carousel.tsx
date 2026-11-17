import { useLayoutEffect, useRef } from 'react';
import type { Challenge } from '../core/challenge';
import { tabListKeys } from './a11y';
import { tr } from '../core/i18n';
import { ensureChallengeIndex } from '../state/challenges';
import { useStore } from '../state/store';
import { byCourseOrder, placeOf, WORLDS, worldById, worldName } from '../state/worlds';
import { tt } from '../core/course/text';
import { revealIn, useUserScroll } from './reveal';
import { Mixed } from './Mixed';

/** Challenge groups: the Worlds of course/worlds.json (labs not placed in one go to "other"). */
type Group = string;
const groupOf = (c: Challenge): Group => placeOf('challenge', c.id)?.world.id ?? 'other';
const groupLabel = (g: Group) => {
  const w = worldById(g);
  return w ? (w.n !== undefined ? `W${w.n}` : 'UB') : tr('其他', 'Other');
};
const groupTip = (g: Group) => {
  const w = worldById(g);
  return w ? `${worldName(w)} — ${tt(w.course)}` : tr('还没有放进 World 的挑战', 'Challenges not placed in a World yet');
};
const GROUP_ORDER: Group[] = [...WORLDS.map((w) => w.id), 'other'];

export function Carousel({ kind }: { kind: 'lesson' | 'challenge' }) {
  const challenges = useStore((s) => s.challenges);
  const activeId = useStore((s) => s.activeId);
  const completed = useStore((s) => s.completed);
  const open = useStore((s) => s.openChallenge);
  const ofKind = challenges.filter((c) => c.kind === kind);
  // challenges are grouped by World (tabs) in course order; lessons stay one row, in their own order
  const all = kind === 'challenge' ? byCourseOrder(ofKind) : ofKind;
  const groups: Group[] = kind === 'challenge' ? GROUP_ORDER.filter((g) => all.some((c) => groupOf(c) === g)) : [];
  // The tab shown is always the group of the challenge on the bench (or the one loading), and
  // picking a tab opens that group's first unfinished challenge, so the carousel, the side
  // panel and the URL never disagree.
  const opening = useStore((s) => s.opening);
  const active = all.find((c) => c.id === (opening ?? activeId));
  const group: Group | null = groups.length > 1 ? (active ? groupOf(active) : groups[0]) : null;
  const list = group === null ? all : all.filter((c) => groupOf(c) === group);
  const done = list.filter((c) => completed[c.id]).length;
  const status = useStore((s) => s.challengeIndex);

  // keep the active card (and its group tab, where the tabs scroll) in view: on a direct load,
  // a tab pick, Back / Forward and "Next" — not while the user scrolls the row themselves
  const { ref: rowRef, el: rowEl, busy } = useUserScroll<HTMLDivElement>();
  const tabsRef = useRef<HTMLSpanElement>(null);
  const revealed = useRef<string | null>(null);
  const activeKey = active ? `${kind}:${active.id}` : '';
  useLayoutEffect(() => {
    if (!activeKey || revealed.current === activeKey) return;
    const row = rowEl();
    const card = row?.querySelector<HTMLElement>('.lesson-card.on');
    if (!row || !card) return;
    const first = revealed.current === null;
    revealed.current = activeKey;
    if (!busy()) revealIn(row, card, 'x', first);
    const tab = tabsRef.current?.querySelector<HTMLElement>('button.on');
    if (tab) revealIn(tabsRef.current!, tab, 'x', first);
  });

  const pick = (g: Group) => {
    if (g === group) return;
    const inGroup = all.filter((c) => groupOf(c) === g);
    const first = inGroup.find((c) => !completed[c.id]) ?? inGroup[0];
    if (first) open(first.id);
  };

  return (
    <section className="carousel-wrap" aria-label={kind === 'lesson' ? tr('课程列表', 'Lessons') : tr('挑战列表', 'Challenges')}>
      <div className="section-title">
        <Mixed text={kind === 'lesson' ? tr('课程 LESSONS', 'LESSONS') : tr('挑战 CHALLENGES', 'CHALLENGES')} />
        {group !== null && (
          <span className="chips phase-tabs" role="tablist" aria-label={tr('分组', 'Groups')} ref={tabsRef} onKeyDown={tabListKeys}>
            {groups.map((g) => {
              const n = all.filter((c) => groupOf(c) === g);
              const allDone = n.every((c) => completed[c.id]);
              return (
                <button
                  key={g}
                  role="tab"
                  aria-selected={g === group}
                  aria-controls={`carousel-${kind}`}
                  tabIndex={g === group ? 0 : -1}
                  className={g === group ? 'on' : ''}
                  title={groupTip(g)}
                  onClick={() => pick(g)}
                >
                  {groupLabel(g)}
                  <span className="phase-count">{allDone ? <span aria-label={tr('全部完成', 'all done')}> ✓</span> : ` ${n.length}`}</span>
                </button>
              );
            })}
          </span>
        )}
        <span className="muted">
          {done}/{list.length} {tr('完成', 'done')}
        </span>
      </div>
      {status === 'error' ? (
        <div className="card empty-card" role="alert">
          {kind === 'lesson' ? tr('课程列表加载失败。', "Couldn't load the lesson list.") : tr('挑战列表加载失败。', "Couldn't load the challenge list.")}{' '}
          <button className="primary" onClick={() => void ensureChallengeIndex()}>
            {tr('重试', 'Try again')}
          </button>
        </div>
      ) : status !== 'ready' ? (
        <div className="card empty-card muted" role="status">
          {tr('加载中…', 'Loading…')}
        </div>
      ) : list.length === 0 ? (
        <div className="card empty-card">
          {kind === 'lesson' ? tr('没有找到课程文件。', 'No lesson files found.') : tr('还没有挑战题。', 'No challenges yet.')}{' '}
          {tr('把题目 JSON 放进项目的 ', "Put challenge JSON files in the project's ")}
          <code>challenges/</code>
          {tr(' 文件夹，或在“导入”页面导入。', ' folder, or load them on the Import page.')}
        </div>
      ) : (
        <div className="carousel" ref={rowRef} id={`carousel-${kind}`} role={group !== null ? 'tabpanel' : undefined} aria-label={group !== null ? groupLabel(group) : undefined}>
          {list.map((c, i) => (
            <button
              key={c.id}
              className={`lesson-card ${c.id === active?.id ? 'on' : ''} ${completed[c.id] ? 'done' : ''}`}
              aria-current={c.id === active?.id ? 'true' : undefined}
              onClick={() => open(c.id)}
            >
              <div className="lc-num" aria-hidden={completed[c.id] ? true : undefined}>
                {completed[c.id] ? '✓' : i + 1}
              </div>
              <div className="lc-body">
                <div className="lc-title">{c.title}</div>
                <div className="lc-meta">
                  <span className="sr-only">
                    {completed[c.id] ? tr('已完成，', 'done, ') : ''}
                    {tr(`难度 ${c.level} / 5`, `level ${c.level} of 5`)}
                  </span>
                  <span aria-hidden>{'★'.repeat(c.level)}</span>
                  {c.source === 'imported' && <span className="badge src">{tr('导入', 'Imported')}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
