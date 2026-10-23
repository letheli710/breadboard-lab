import { useEffect, useState } from 'react';
import { PHASES, type Challenge, type ChallengePhase } from '../core/challenge';
import { tr } from '../core/i18n';
import { useStore } from '../state/store';

/** Challenge groups: the original intro set (no "phase") and the four course phases. */
type Group = 'intro' | ChallengePhase;
const groupOf = (c: Challenge): Group => c.phase ?? 'intro';
const groupLabel = (g: Group) => (g === 'intro' ? tr('入门', 'Intro') : tr(`第${g}期`, `Phase ${g}`));
const groupTip = (g: Group) =>
  g === 'intro'
    ? tr('入门挑战：面包板、电源、LED', 'Intro challenges: breadboard, power, LEDs')
    : [
        tr('第 1 期：KCL/KVL、分压分流、电桥、电流源', 'Phase 1: KCL/KVL, dividers, bridge, current source'),
        tr('第 2 期：叠加、戴维宁、最大功率、运放', 'Phase 2: superposition, Thevenin, max power, op-amps'),
        tr('第 3 期：暂态（RC / RL / RLC）', 'Phase 3: transients (RC / RL / RLC)'),
        tr('第 4 期：正弦稳态与频率响应', 'Phase 4: AC steady state and frequency response'),
      ][g - 1];

const GROUP_KEY = 'bb.challengeGroup';
const readGroup = (): Group | null => {
  try {
    const v = localStorage.getItem(GROUP_KEY);
    if (v === 'intro') return 'intro';
    const n = Number(v);
    return PHASES.includes(n as ChallengePhase) ? (n as ChallengePhase) : null;
  } catch {
    return null;
  }
};
const writeGroup = (g: Group) => {
  try {
    localStorage.setItem(GROUP_KEY, String(g));
  } catch {
    /* storage unavailable */
  }
};

export function Carousel({ kind }: { kind: 'lesson' | 'challenge' }) {
  const challenges = useStore((s) => s.challenges);
  const activeId = useStore((s) => s.activeId);
  const completed = useStore((s) => s.completed);
  const open = useStore((s) => s.openChallenge);
  const all = challenges.filter((c) => c.kind === kind);

  // challenges are grouped by course phase (tabs); lessons stay one row
  const groups: Group[] = kind === 'challenge' ? (['intro', ...PHASES] as Group[]).filter((g) => all.some((c) => groupOf(c) === g)) : [];
  const active = all.find((c) => c.id === activeId);
  const [picked, setPicked] = useState<Group | null>(() => readGroup());
  // follow the open challenge into its group (e.g. after "next challenge")
  useEffect(() => {
    if (active && kind === 'challenge') setPicked(groupOf(active));
  }, [active?.id, kind]); // eslint-disable-line react-hooks/exhaustive-deps
  const group: Group | null = groups.length > 1 ? (picked !== null && groups.includes(picked) ? picked : active ? groupOf(active) : groups[0]) : null;
  const list = group === null ? all : all.filter((c) => groupOf(c) === group);
  const done = list.filter((c) => completed[c.id]).length;
  const pick = (g: Group) => {
    setPicked(g);
    writeGroup(g);
  };

  return (
    <section className="carousel-wrap">
      <div className="section-title">
        {kind === 'lesson' ? tr('课程 LESSONS', 'LESSONS') : tr('挑战 CHALLENGES', 'CHALLENGES')}
        {group !== null && (
          <span className="chips phase-tabs" role="tablist">
            {groups.map((g) => {
              const n = all.filter((c) => groupOf(c) === g);
              const allDone = n.every((c) => completed[c.id]);
              return (
                <button key={g} role="tab" aria-selected={g === group} className={g === group ? 'on' : ''} title={groupTip(g)} onClick={() => pick(g)}>
                  {groupLabel(g)}
                  <span className="phase-count">{allDone ? ' ✓' : ` ${n.length}`}</span>
                </button>
              );
            })}
          </span>
        )}
        <span className="muted">
          {done}/{list.length} {tr('完成', 'done')}
        </span>
      </div>
      {list.length === 0 ? (
        <div className="card empty-card">
          {kind === 'lesson' ? tr('没有找到课程文件。', 'No lesson files found.') : tr('还没有挑战题。', 'No challenges yet.')}{' '}
          {tr('把题目 JSON 放进项目的 ', 'Put challenge JSON files in the project\'s ')}
          <code>challenges/</code>
          {tr(' 文件夹，或在“导入”页面导入。', ' folder, or load them on the Import page.')}
        </div>
      ) : (
        <div className="carousel">
          {list.map((c, i) => (
            <button key={c.id} className={`lesson-card ${c.id === activeId ? 'on' : ''} ${completed[c.id] ? 'done' : ''}`} onClick={() => open(c.id)}>
              <div className="lc-num">{completed[c.id] ? '✓' : i + 1}</div>
              <div className="lc-body">
                <div className="lc-title">{c.title}</div>
                <div className="lc-meta">
                  {'★'.repeat(c.level)}
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
