import { useLayoutEffect, useRef } from 'react';
import type { Challenge } from '../core/challenge';
import { inCourseOrder, itemLabel, placeOf, WORLDS, worldChapters, type World } from '../core/course';
import { chapterById } from '../core/problem/chapters';
import { unitTitle, worldBlurb, worldTitle } from '../core/courseText';
import { tabListKeys } from './a11y';
import { tr } from '../core/i18n';
import { ensureChallengeIndex } from '../state/challenges';
import { onPage, useStore } from '../state/store';
import { revealIn, useUserScroll } from './reveal';
import { Mixed } from './Mixed';

/** Tabs: the five Worlds of the course map (core/course.ts), then imported files outside it. */
type Group = World['id'] | 'other';
const groupOf = (c: Challenge): Group => placeOf(c.id)?.world.id ?? 'other';
const worldOf = (g: Group) => WORLDS.find((w) => w.id === g);
const groupLabel = (g: Group) => (g === 'other' ? tr('其他', 'Other') : `World ${g}`);
const groupTip = (g: Group) => {
  const w = worldOf(g);
  return w ? `${worldTitle(w.id)} — ${worldBlurb(w.id)} (${w.books})` : tr('不在课程地图里的文件（例如导入的题目）', 'Files outside the course map (for example imported ones)');
};

export function Carousel({ kind }: { kind: 'lesson' | 'challenge' }) {
  const challenges = useStore((s) => s.challenges);
  const activeId = useStore((s) => s.activeId);
  const completed = useStore((s) => s.completed);
  const open = useStore((s) => s.openChallenge);
  const openSummary = useStore((s) => s.openSummary);
  // Learn: every item of the course map in order; Challenges: the challenges and labs only
  const mode = kind === 'lesson' ? 'learn' : 'challenge';
  const all = inCourseOrder(challenges.filter((c) => onPage(c, mode)));

  const groups: Group[] = ([...WORLDS.map((w) => w.id), 'other'] as Group[]).filter((g) => all.some((c) => groupOf(c) === g));
  // The tab shown is always the group of the item on the bench (or the one loading), and picking
  // a tab opens that group's first unfinished item, so the carousel, the side panel and the URL
  // never disagree.
  const opening = useStore((s) => s.opening);
  const active = all.find((c) => c.id === (opening ?? activeId));
  const group: Group | null = groups.length > 1 ? (active ? groupOf(active) : groups[0]) : null;
  const list = group === null ? all : all.filter((c) => groupOf(c) === group);
  const done = list.filter((c) => completed[c.id]).length;
  const status = useStore((s) => s.challengeIndex);
  const world = group === null ? undefined : worldOf(group);
  const chapters = kind === 'lesson' && world ? worldChapters(world).filter((c) => chapterById(c)) : [];

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
    if (first) open(first.id, mode);
  };

  return (
    <section className="carousel-wrap" aria-label={kind === 'lesson' ? tr('课程列表', 'Lessons') : tr('挑战列表', 'Challenges')}>
      <div className="section-title">
        <Mixed text={kind === 'lesson' ? tr('课程 LEARN', 'LEARN') : tr('挑战 CHALLENGES', 'CHALLENGES')} />
        {group !== null && (
          <span className="chips phase-tabs" role="tablist" aria-label={tr('World', 'Worlds')} ref={tabsRef} onKeyDown={tabListKeys}>
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
        {world && <span className="world-name">{worldTitle(world.id)}</span>}
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
          {list.map((c, i) => {
            const place = placeOf(c.id);
            const label = place ? itemLabel(place) : String(i + 1);
            const unitStart = place && place.pos === 0 && i > 0;
            return (
              <button
                key={c.id}
                className={`lesson-card ${c.id === active?.id ? 'on' : ''} ${completed[c.id] ? 'done' : ''} ${unitStart ? 'unit-start' : ''}`}
                aria-current={c.id === active?.id ? 'true' : undefined}
                title={place ? `${place.unit.num} ${unitTitle(place.unit.num)}` : undefined}
                onClick={() => open(c.id, mode)}
              >
                <div className="lc-num" aria-hidden={completed[c.id] ? true : undefined}>
                  {completed[c.id] ? '✓' : label}
                </div>
                <div className="lc-body">
                  <div className="lc-title">{c.title}</div>
                  <div className="lc-meta">
                    <span className="sr-only">
                      {completed[c.id] ? tr(`${label}，已完成，`, `${label}, done, `) : tr(`${label}，`, `${label}, `)}
                      {tr(`难度 ${c.level} / 5`, `level ${c.level} of 5`)}
                    </span>
                    <span aria-hidden>{'★'.repeat(c.level)}</span>
                    {c.kind === 'challenge' && kind === 'lesson' && <span className="badge lab">{c.phase ? tr('实验', 'Lab') : tr('挑战', 'Task')}</span>}
                    {c.source === 'imported' && <span className="badge src">{tr('导入', 'Imported')}</span>}
                  </div>
                </div>
              </button>
            );
          })}
          {chapters.length > 0 && (
            <button className="lesson-card theory-card" onClick={() => openSummary({ chapter: chapters[0] })} title={chapters.map((c) => chapterById(c)!.title()).join(' · ')}>
              <div className="lc-num" aria-hidden>
                📘
              </div>
              <div className="lc-body">
                <div className="lc-title">{tr(`World ${world!.id} 的理论练习`, `World ${world!.id} theory`)}</div>
                <div className="lc-meta">{tr(`${chapters.length} 章 · 从要点开始`, `${chapters.length} chapters · start with the key points`)}</div>
              </div>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
