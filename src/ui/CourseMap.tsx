// The course map (core/course.ts) as a dropdown list, opened from the header's course button (and
// the panel breadcrumb): World tabs, then the items grouped by unit. Browsing the tabs does not
// open anything; picking an item opens it and closes the map (`onPick`).

import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import type { Challenge } from '../core/challenge';
import { inCourseOrder, itemLabel, placeOf, WORLDS, worldChapters, type World } from '../core/course';
import { unitTitle, worldTitle } from '../core/courseText';
import { chapterById } from '../core/problem/chapters';
import { tr } from '../core/i18n';
import { ensureChallengeIndex } from '../state/challenges';
import { onPage, useStore } from '../state/store';
import { tabListKeys } from './a11y';
import { Icon } from './Icons';

/** Tabs: the five Worlds of the course map, then imported files outside it. */
type Group = World['id'] | 'other';
const groupOf = (c: Challenge): Group => placeOf(c.id)?.world.id ?? 'other';
const worldOf = (g: Group) => WORLDS.find((w) => w.id === g);
const groupLabel = (g: Group) => (g === 'other' ? tr('其他', 'Other') : (worldOf(g)?.label() ?? `World ${g}`));

export function CourseMap({ kind, onPick }: { kind: 'lesson' | 'challenge'; onPick?: () => void }) {
  const challenges = useStore((s) => s.challenges);
  const activeId = useStore((s) => s.activeId);
  const opening = useStore((s) => s.opening);
  const completed = useStore((s) => s.completed);
  const open = useStore((s) => s.openChallenge);
  const openSummary = useStore((s) => s.openSummary);
  const status = useStore((s) => s.challengeIndex);
  // Learn: every item of the course map in order; Challenges: the challenges and labs only
  const mode = kind === 'lesson' ? 'learn' : 'challenge';
  const all = inCourseOrder(challenges.filter((c) => onPage(c, mode)));
  const groups: Group[] = ([...WORLDS.map((w) => w.id), 'other'] as Group[]).filter((g) => all.some((c) => groupOf(c) === g));
  const active = all.find((c) => c.id === (opening ?? activeId));

  // the tab shown starts at the World of the item on the bench; switching tabs only browses
  const [picked, setPicked] = useState<Group | null>(null);
  const group: Group | null = groups.length === 0 ? null : picked && groups.includes(picked) ? picked : active ? groupOf(active) : groups[0];
  const list = group === null ? all : all.filter((c) => groupOf(c) === group);
  const world = group === null ? undefined : worldOf(group);
  const chapters = kind === 'lesson' && world ? worldChapters(world).filter((c) => chapterById(c)) : [];
  const done = list.filter((c) => completed[c.id]).length;

  // on open: the item on the bench is in view and has the focus (Tab reaches the tabs above it)
  const listRef = useRef<HTMLDivElement>(null);
  const focused = useRef(false);
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el || focused.current) return;
    const on = el.querySelector<HTMLElement>('.lesson-card.on') ?? el.querySelector<HTMLElement>('.lesson-card');
    if (!on) return;
    focused.current = true;
    // scroll the list only (not the page or the dropdown): the item in the middle
    el.scrollTop = Math.max(0, on.offsetTop - el.clientHeight / 2 + on.offsetHeight / 2);
    if (onPick) on.focus({ preventScroll: true });
  });

  const pick = (c: Challenge) => {
    open(c.id, mode);
    onPick?.();
  };

  // rows grouped by unit: a heading whenever the unit changes
  let lastUnit: string | null = null;

  return (
    <section className="carousel-wrap course-map" aria-label={kind === 'lesson' ? tr('课程地图', 'Course map') : tr('挑战列表', 'Challenges')}>
      <div className="section-title">
        {group !== null && groups.length > 1 && (
          <span className="chips phase-tabs" role="tablist" aria-label={tr('World', 'Worlds')} onKeyDown={tabListKeys}>
            {groups.map((g) => {
              const n = all.filter((c) => groupOf(c) === g);
              const allDone = n.every((c) => completed[c.id]);
              return (
                <button
                  key={g}
                  role="tab"
                  aria-selected={g === group}
                  aria-controls={`course-list-${kind}`}
                  tabIndex={g === group ? 0 : -1}
                  className={g === group ? 'on' : ''}
                  onClick={() => setPicked(g)}
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
      {world && (
        <p className="world-line">
          <b>
            {world.label()} · {worldTitle(world.id)}
          </b>{' '}
          <span className="muted">({world.books()})</span>
          {world.current && <span className="badge world-here">{tr('当前进度', 'You are here')}</span>}
        </p>
      )}
      {status === 'error' ? (
        <div className="card empty-card" role="alert">
          {tr('课程列表加载失败。', "Couldn't load the course list.")}{' '}
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
        <div
          className="course-list"
          ref={listRef}
          id={`course-list-${kind}`}
          role={group !== null && groups.length > 1 ? 'tabpanel' : undefined}
          aria-label={group !== null ? groupLabel(group) : undefined}
        >
          {list.map((c, i) => {
            const place = placeOf(c.id);
            const label = place ? itemLabel(place) : String(i + 1);
            const unitKey = place ? place.unit.num : 'other';
            const head = unitKey !== lastUnit ? unitKey : null;
            lastUnit = unitKey;
            return (
              <Fragment key={c.id}>
                {head && place && (
                  <div className="cm-unit" aria-hidden>
                    {place.unit.num} · {unitTitle(place.unit.num)}
                  </div>
                )}
                <button
                  className={`lesson-card ${c.id === active?.id ? 'on' : ''} ${completed[c.id] ? 'done' : ''}`}
                  aria-current={c.id === active?.id ? 'true' : undefined}
                  onClick={() => pick(c)}
                >
                  <div className="lc-num" aria-hidden={completed[c.id] ? true : undefined}>
                    {completed[c.id] ? '✓' : label}
                  </div>
                  <div className="lc-body">
                    <div className="lc-title">{c.title}</div>
                    <div className="lc-meta">
                      <span className="sr-only">
                        {place ? `${unitTitle(place.unit.num)}, ` : ''}
                        {completed[c.id] ? tr(`${label}，已完成，`, `${label}, done, `) : tr(`${label}，`, `${label}, `)}
                        {tr(`难度 ${c.level} / 5`, `level ${c.level} of 5`)}
                      </span>
                      <span aria-hidden>{'★'.repeat(c.level)}</span>
                      {c.kind === 'challenge' && kind === 'lesson' && <span className="badge lab">{c.phase ? tr('实验', 'Lab') : tr('挑战', 'Task')}</span>}
                      {c.source === 'imported' && <span className="badge src">{tr('导入', 'Imported')}</span>}
                    </div>
                  </div>
                </button>
              </Fragment>
            );
          })}
          {chapters.length > 0 && (
            <button
              className="lesson-card theory-card"
              onClick={() => {
                openSummary({ chapter: chapters[0] });
                onPick?.();
              }}
              title={chapters.map((c) => chapterById(c)!.title()).join(' · ')}
            >
              <div className="lc-num" aria-hidden>
                <Icon name="book" size={17} />
              </div>
              <div className="lc-body">
                <div className="lc-title">{tr(`${world!.label()} 的理论练习`, `${world!.label()} theory`)}</div>
                <div className="lc-meta">{tr(`${chapters.length} 章 · 从要点开始`, `${chapters.length} chapters · start with the key points`)}</div>
              </div>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
