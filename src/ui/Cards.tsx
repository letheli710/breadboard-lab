// Card-style units (CHALLENGE_FORMAT §16, docs/REBUILD_PLAN.md): one card at a time — try it
// first, understand why, build and measure, take it with you. Each card owns a run of the
// lesson steps; the step navigator is the same one the classic lessons use.

import { lazy, Suspense, useEffect, useRef, type ReactNode } from 'react';
import type { CardKind, Challenge, ChallengeCard } from '../core/challenge';
import { inCourseOrder } from '../core/course';
import { chapterById } from '../core/problem/chapters';
import { tr } from '../core/i18n';
import { onPage, useStore } from '../state/store';
import { Icon } from './Icons';
import { Md } from './Md';
import { StepStatus } from './StepCheck';

// figures are a chunk of their own (the circuit drawing code): only units that have figures load it
const CardFigureView = lazy(() => import('./CardFigure'));

/** Renders `![](fig:<id>)` lines of a challenge's card and step text (core/figures.ts). */
export function figureOf(ch: Challenge): ((id: string) => ReactNode) | undefined {
  const figs = ch.figures;
  if (!figs || !Object.keys(figs).length) return undefined;
  return (id) =>
    figs[id] ? (
      <Suspense fallback={<div className="card-figure cf-loading" aria-hidden />}>
        <CardFigureView fig={figs[id]} />
      </Suspense>
    ) : null;
}

const KIND: Record<CardKind, { icon: string; zh: string; en: string }> = {
  try: { icon: 'try', zh: '试一试', en: 'Try it' },
  explain: { icon: 'bulb', zh: '想明白', en: 'Why' },
  build: { icon: 'build', zh: '动手做', en: 'Build' },
  wrap: { icon: 'wrap', zh: '带走', en: 'Take away' },
};
export const cardKindLabel = (k: CardKind) => tr(KIND[k].zh, KIND[k].en);

/** The card that hosts the measurement questions: the build card, else the last card with steps. */
export function measureCardOf(cards: ChallengeCard[]): number {
  const b = cards.findIndex((c) => c.kind === 'build');
  if (b >= 0) return b;
  for (let i = cards.length - 1; i >= 0; i--) if (cards[i].count > 0) return i;
  return cards.length - 1;
}

export interface StepChecks {
  unmet: (string[] | null)[];
  done: Set<number>;
}

/** Step navigator over steps[from … to − 1]; at the last step `onEnd` (if given) becomes the Next action. */
export function StepNav({ ch, from, to, sc, endLabel, onEnd }: { ch: Challenge; from: number; to: number; sc: StepChecks; endLabel?: string; onEnd?: () => void }) {
  const step = useStore((s) => s.step);
  const setStep = useStore((s) => s.setStep);
  const n = to - from;
  const cur = Math.min(Math.max(step, from), to - 1);
  // a step counts as done when its check passed (steps without a check: once passed)
  const stepDone = (i: number) => (sc.unmet[i] ? sc.done.has(i) : i < cur);
  const last = cur >= to - 1;
  return (
    <section className="steps" aria-label={tr('步骤', 'Steps')}>
      <div className="steps-head">
        <span className="eyebrow">
          {tr('步骤', 'Step')} {cur - from + 1} / {n}
        </span>
        <span className="step-dots">
          {Array.from({ length: n }, (_, k) => {
            const i = from + k;
            return (
              <button
                key={i}
                className={i === cur ? 'cur' : stepDone(i) ? 'done' : ''}
                aria-current={i === cur ? 'step' : undefined}
                aria-label={tr(`第 ${k + 1} 步`, `Step ${k + 1}`)}
                onClick={() => setStep(i)}
              >
                {i !== cur && stepDone(i) ? '✓' : k + 1}
              </button>
            );
          })}
        </span>
      </div>
      <div className="step-cur">
        {/* only the step text is live (announced on Back / Next); the check list is a status of its own */}
        <div aria-live="polite">
          <Md text={ch.steps[cur].text} math figure={figureOf(ch)} />
        </div>
        <StepStatus unmet={sc.unmet[cur]} />
      </div>
      <div className="row">
        <button disabled={cur === from} onClick={() => setStep(cur - 1)}>
          <Icon name="prev" /> {tr('上一步', 'Back')}
        </button>
        {last && onEnd ? (
          <button className="primary" onClick={onEnd}>
            {endLabel} <Icon name="next" />
          </button>
        ) : (
          <button className="primary" disabled={last} onClick={() => setStep(cur + 1)}>
            {tr('下一步', 'Next')} <Icon name="next" />
          </button>
        )}
      </div>
    </section>
  );
}

/** The card deck: tabs, the current card's text, its steps, and the links of a "take away" card. */
export function CardDeck({ ch, sc }: { ch: Challenge; sc: StepChecks }) {
  const cards = ch.cards;
  const card = useStore((s) => Math.min(s.card, cards.length - 1));
  const setCard = useStore((s) => s.setCard);
  const setStep = useStore((s) => s.setStep);
  const openSummary = useStore((s) => s.openSummary);
  const head = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const c = cards[card];

  const go = (i: number) => {
    if (i < 0 || i >= cards.length) return;
    moved.current = true;
    setCard(i);
    // a card opens at its first step: the steps are a sequence, and a check such as "these holes are
    // empty" can count as done long before the step that asks for it
    if (cards[i].count > 0) setStep(cards[i].first);
  };
  // after a card change by the user, move focus to the card heading (read once, not a live region)
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    head.current?.focus();
  }, [card]);

  const cardDone = (i: number) => {
    const k = cards[i];
    if (k.count === 0) return i < card;
    return Array.from({ length: k.count }, (_, j) => k.first + j).every((s) => (sc.unmet[s] ? sc.done.has(s) : i < card));
  };
  const nextLabel = card < cards.length - 1 ? tr(`下一张：${cardKindLabel(cards[card + 1].kind)}`, `Next card: ${cardKindLabel(cards[card + 1].kind)}`) : undefined;

  return (
    <section className={`unit-cards kind-${c.kind}`} aria-label={tr('课程卡片', 'Lesson cards')}>
      <nav className="card-tabs" aria-label={tr('卡片', 'Cards')}>
        {cards.map((k, i) => (
          <button key={i} className={`${i === card ? 'on' : ''} ${cardDone(i) ? 'done' : ''}`} aria-current={i === card ? 'step' : undefined} onClick={() => go(i)}>
            <Icon name={cardDone(i) && i !== card ? 'check' : KIND[k.kind].icon} size={15} /> {cardKindLabel(k.kind)}
          </button>
        ))}
      </nav>
      <div className="card-body">
        <h3 ref={head} tabIndex={-1} className="card-title">
          <span className="sr-only">{tr(`卡片 ${card + 1} / ${cards.length}，${cardKindLabel(c.kind)}：`, `Card ${card + 1} of ${cards.length}, ${cardKindLabel(c.kind)}: `)}</span>
          {c.title}
        </h3>
        {c.text && <Md text={c.text} math figure={figureOf(ch)} />}
        {c.kind === 'wrap' && c.practice.length > 0 && (
          <div className="card-practice">
            <span className="eyebrow">{tr('趁热练理论题', 'Practise the theory while it is fresh')}</span>
            <div className="row wrap">
              {c.practice.map((id) => (
                <button key={id} className="pr-link" onClick={() => openSummary({ chapter: id })}>
                  <Icon name="book" size={15} /> {chapterById(id)?.title() ?? id}
                </button>
              ))}
            </div>
          </div>
        )}
        {c.kind === 'wrap' && <NextInCourse ch={ch} />}
      </div>
      {c.count > 0 ? (
        <StepNav ch={ch} from={c.first} to={c.first + c.count} sc={sc} endLabel={nextLabel} onEnd={nextLabel ? () => go(card + 1) : undefined} />
      ) : (
        <div className="row card-nav">
          <button disabled={card === 0} onClick={() => go(card - 1)}>
            <Icon name="prev" /> {tr('上一张', 'Previous card')}
          </button>
          {nextLabel && (
            <button className="primary" onClick={() => go(card + 1)}>
              {nextLabel} <Icon name="next" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/** "Next in the course" from a take-away card (the Learn page's order). */
function NextInCourse({ ch }: { ch: Challenge }) {
  const challenges = useStore((s) => s.challenges);
  const completed = useStore((s) => s.completed);
  const mode = useStore((s) => s.mode);
  const open = useStore((s) => s.openChallenge);
  const page = mode === 'learn' ? 'learn' : 'challenge';
  const list = inCourseOrder(challenges.filter((x) => onPage(x, page)));
  const next = list[list.findIndex((x) => x.id === ch.id) + 1];
  if (!next) return null;
  return (
    <p className="card-next">
      {!completed[ch.id] && <span className="muted">{tr('别忘了先点「检查我的电路」。', "Don't forget to press “Check my circuit” first.")} </span>}
      <button className="pr-link" onClick={() => open(next.id, page)}>
        {tr('下一个：', 'Next: ')}
        {next.title} →
      </button>
    </p>
  );
}
