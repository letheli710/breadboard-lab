// The two pages of the "Inside" content and the lesson overlay:
//  - InsidePage (#/inside[/<id>]): every teardown as a card; one open fills the page.
//  - CalcPage (#/calc[/<id>]): every calculation card, grouped, with a calculator each.
//  - BenchInside: a teardown shown in a lesson in place of the 3D bench.
//  - LookInside: the "look inside first" block at the top of a lesson's panel.

import { useEffect, useMemo, useState } from 'react';
import { tr } from '../core/i18n';
import { readStored, writeStored } from '../state/persist';
import { useLang, useStore } from '../state/store';
import { Icon } from '../ui/Icons';
import { MathText } from '../ui/mathText';
import { CalcCardView, CalcDialog } from './CalcCardView';
import { useCalcs, useTeardown } from './hooks';
import { inline, InsideMd } from './InsideMd';
import { TEARDOWNS, tdById, teardownsFor } from './registry';
import { TeardownView } from './TeardownView';

function Loading() {
  return (
    <div className="page-loading" role="status">
      {tr('加载中…', 'Loading…')}
    </div>
  );
}

/* ------------------------------------------------------------------ seen teardowns */

const SEEN_KEY = 'bb.inside.seen';
const readSeen = (): Record<string, true> => readStored<Record<string, true>>(SEEN_KEY, {}, (v) => (v && typeof v === 'object' ? (v as Record<string, true>) : undefined));
export const markSeen = (id: string) => writeStored(SEEN_KEY, { ...readSeen(), [id]: true });

/* ------------------------------------------------------------------ Inside page */

function TeardownPage({ id }: { id: string }) {
  const td = useTeardown(id);
  const openInside = useStore((s) => s.openInside);
  const openCalc = useStore((s) => s.openCalc);
  const lessons = useStore((s) => s.challenges);
  const open = useStore((s) => s.openChallenge);
  const e = tdById(id)!;
  const first = lessons.find((c) => e.lessons.includes(c.id));
  useEffect(() => {
    window.scrollTo(0, 0);
    markSeen(id);
  }, [id]);
  if (!td) return <Loading />;
  return (
    <div className="inside-page">
      <button className="link-btn inside-back" onClick={() => openInside(null)}>
        <Icon name="prev" size={14} /> {tr('全部拆解', 'All teardowns')}
      </button>
      <h1 className="sr-only">{td.title}</h1>
      <TeardownView
        td={td}
        onCalc={(c) => openCalc(c)}
        onDone={first ? () => open(first.id) : undefined}
        doneLabel={first ? tr(`去动手：${first.title}`, `Try it: ${first.title}`) : undefined}
      />
    </div>
  );
}

export function InsidePage() {
  useLang();
  const id = useStore((s) => s.insideId);
  const openInside = useStore((s) => s.openInside);
  if (id && tdById(id)) return <TeardownPage id={id} />;
  const seen = readSeen();
  const unknown = id && !tdById(id);
  return (
    <div className="inside-page">
      {unknown && (
        <p className="note" role="status">
          {tr(`找不到拆解“${id}”，下面是全部拆解。`, `There is no teardown "${id}"; here are all of them.`)}
        </p>
      )}
      <section className="inside-hero card">
        <h1>
          <Icon name="layers" size={26} /> {tr('拆开看', 'Inside')} <small lang="en">TEARDOWNS</small>
        </h1>
        <p>
          {tr(
            '每遇到一个新东西——面包板、LED、电池、万用表、LM358……先把它拆开：外形 → 透视 → 内部结构 → 等效电路 → 怎么计算。左边一层层讲，右边的图跟着一层层拆；带下划线的词会在图上亮出对应的部分。',
            'Every new thing — the breadboard, an LED, a battery, the multimeter, the LM358 … — gets taken apart first: outside → x-ray → inner structure → equivalent circuit → how to calculate with it. The text on the left goes layer by layer while the picture on the right comes apart with it; underlined words light up their part of the picture.',
          )}
        </p>
      </section>
      <div className="inside-grid">
        {TEARDOWNS.map((t) => (
          <button key={t.id} className="inside-card card" onClick={() => openInside(t.id)}>
            <span className="inside-card-title">{tr(t.zh, t.en)}</span>
            <span className="inside-card-sub">{tr(t.zhSub, t.enSub)}</span>
            {seen[t.id] && <span className="badge done">✓ {tr('看过', 'Seen')}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Calculations page */

export function CalcPage() {
  useLang();
  const calcs = useCalcs();
  const id = useStore((s) => s.calcId);
  const openCalc = useStore((s) => s.openCalc);
  const openInside = useStore((s) => s.openInside);
  const [q, setQ] = useState('');
  useEffect(() => {
    if (!id || !calcs) return;
    // open card: scroll to it
    requestAnimationFrame(() => document.getElementById(`calc-${id}`)?.scrollIntoView({ block: 'start' }));
  }, [id, calcs]);
  const list = useMemo(() => {
    if (!calcs) return [];
    const s = q.trim().toLowerCase();
    return calcs.groups.map((g) => ({
      g,
      cards: calcs.cards.filter((c) => c.group === g.id && (!s || `${c.title} ${c.use} ${c.tex}`.toLowerCase().includes(s))),
    }));
  }, [calcs, q]);
  if (!calcs) return <Loading />;
  return (
    <div className="calc-page">
      <section className="inside-hero card">
        <h1>
          <Icon name="calc" size={26} /> {tr('计算', 'Calculations')} <small lang="en">FORMULAS</small>
        </h1>
        <p>
          {tr(
            '电子工程离不开计算。这里是课程和实验里用到的每一个公式：公式本身、一个能改数字的计算器、一步步的推导（为什么是这样）、例子和容易错的地方。',
            'Electronics is calculation. Here is every formula the lessons and labs use: the formula, a calculator you can change, the derivation step by step (why it is so), an example and the usual mistakes.',
          )}
        </p>
        <button className="link-btn" onClick={() => openInside(null)}>
          <Icon name="layers" size={14} /> {tr(`全部 ${TEARDOWNS.length} 个拆解（拆开看）→`, `All ${TEARDOWNS.length} teardowns (Inside) →`)}
        </button>
        <label className="calc-search">
          <Icon name="search" size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr('搜索：分压、LED、op-amp、RC …', 'Search: divider, LED, op-amp, RC …')}
            aria-label={tr('搜索公式', 'Search formulas')}
          />
        </label>
      </section>
      <div className="calc-layout">
        <nav className="calc-toc card" aria-label={tr('公式目录', 'Formula index')}>
          {list.map(({ g, cards }) =>
            cards.length ? (
              <div key={g.id}>
                <div className="calc-toc-g">{g.title}</div>
                {cards.map((c) => (
                  <a
                    key={c.id}
                    href={`#/calc/${c.id}`}
                    className={c.id === id ? 'on' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      openCalc(c.id);
                    }}
                  >
                    {c.title}
                  </a>
                ))}
              </div>
            ) : null,
          )}
        </nav>
        <div className="calc-list">
          {list.map(({ g, cards }) =>
            cards.length ? (
              <section key={g.id} className="calc-group" aria-labelledby={`calc-g-${g.id}`}>
                <h2 id={`calc-g-${g.id}`}>{g.title}</h2>
                <div className="calc-group-intro">
                  <InsideMd text={g.intro} />
                </div>
                {cards.map((c) => (
                  <div key={c.id} id={`calc-${c.id}`} className={`calc-anchor ${c.id === id ? 'target' : ''}`}>
                    <CalcCardView c={c} onTeardown={(t) => openInside(t)} />
                  </div>
                ))}
              </section>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ in a lesson */

/** the teardown in place of the 3D bench (lesson / challenge pages) */
export function BenchInside({ id }: { id: string }) {
  const td = useTeardown(id);
  const close = useStore((s) => s.setBenchInside);
  const [calc, setCalc] = useState<string | null>(null);
  useEffect(() => {
    markSeen(id);
  }, [id]);
  return (
    <div className="bench-inside card">
      <div className="bench-inside-bar">
        <span>
          <Icon name="layers" size={16} /> {tr('拆开看：先认识它，再动手搭', 'Inside: understand it first, then build')}
        </span>
        <button onClick={() => close(null)}>
          <Icon name="prev" size={14} /> {tr('回到面包板', 'Back to the breadboard')}
        </button>
      </div>
      {td ? <TeardownView td={td} compact onDone={() => close(null)} onCalc={setCalc} /> : <Loading />}
      {calc && <CalcDialog id={calc} onClose={() => setCalc(null)} />}
    </div>
  );
}

/** "Look inside first": the teardowns this lesson / challenge introduces (top of its panel) */
/** `compact`: the reminder on the "Take away" card (no auto-open, a shorter head) */
export function LookInside({ chId, compact }: { chId: string; compact?: boolean }) {
  useLang();
  const list = teardownsFor(chId);
  const shown = useStore((s) => s.benchInside);
  const show = useStore((s) => s.setBenchInside);
  // the first time a lesson with a teardown opens, show the teardown instead of the empty board
  useEffect(() => {
    // browser-test builds start lessons on the bench (their suites drive the board)
    if (__E2E__ || compact) return;
    const seen = readSeen();
    const first = list.find((t) => !seen[t.id]);
    if (first && !useStore.getState().benchInside) show(first.id);
  }, [chId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!list.length) return null;
  const seen = readSeen();
  return (
    <section className={`look-inside ${compact ? 'compact' : ''}`} aria-label={compact ? tr('再拆开看一次', 'Look inside again') : tr('先拆开看', 'Look inside first')}>
      <div className="eyebrow">
        <Icon name="layers" size={14} />{' '}
        {compact
          ? tr('带走之前：再拆开看一次，对照你刚做的', 'Before you go: look inside again and compare with what you built')
          : tr('第 0 步 · 先拆开看', 'Step 0 · Look inside first')}
      </div>
      {list.map((t) => (
        <button key={t.id} className={`look-inside-btn ${shown === t.id ? 'on' : ''}`} onClick={() => show(shown === t.id ? null : t.id)} aria-pressed={shown === t.id}>
          <b>{tr(t.zh, t.en)}</b>
          <span>{tr(t.zhSub, t.enSub)}</span>
          <em>
            {shown === t.id
              ? tr('正在看 · 点这里回面包板', 'Showing · click to go back')
              : seen[t.id]
                ? tr('✓ 看过 · 再看一遍', '✓ seen · open again')
                : tr('打开拆解 →', 'Open →')}
          </em>
        </button>
      ))}
    </section>
  );
}

/** formula chips in a lesson panel: the calcs whose `lessons` include this lesson */
export function LessonCalcs({ chId }: { chId: string }) {
  const calcs = useCalcs();
  const [open, setOpen] = useState<string | null>(null);
  const cards = calcs?.cards.filter((c) => c.lessons?.includes(chId)) ?? [];
  if (!cards.length) return null;
  return (
    <section className="lesson-calcs" aria-label={tr('这节课用到的计算', 'Calculations in this lesson')}>
      <div className="eyebrow">
        <Icon name="calc" size={14} /> {tr('这一课要会算', 'Calculations you need here')}
      </div>
      <ul>
        {cards.map((c) => (
          <li key={c.id}>
            <button className="lesson-calc" onClick={() => setOpen(c.id)}>
              <span className="lesson-calc-t">{inline(c.title)}</span>
              <span className="lesson-calc-f">
                <MathText text={c.tex} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open && <CalcDialog id={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
