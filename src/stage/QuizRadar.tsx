// The self-test's mistake radar: once the quiz is passed, each tested concept (QuizItem.concept)
// is one spoke, full length when the first answer was right and short when it was not. Concepts
// missed at the first try are listed under it with a "回到第 N 幕" button (QuizItem.review_act).

import { StageText } from './StageText';
import type { Act, QuizItem } from './types';

/** Scroll the lesson to an act (its card carries data-sync-key="act-N"). */
export function goToAct(n: number) {
  document.querySelector<HTMLElement>(`[data-sync-key="act-${n}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function ReviewButton({ act, acts }: { act: number; acts: Act[] }) {
  const a = acts.find((x) => x.act_index === act);
  if (!a) return null;
  return (
    <button type="button" className="quiz-review" onClick={() => goToAct(act)}>
      回到{a.badge}复习
    </button>
  );
}

interface Spoke {
  concept: string;
  ok: boolean;
  review?: number;
}

/** One spoke per concept (questions sharing a concept count as missed if any was missed). */
export function spokesOf(items: QuizItem[], firstTry: Record<string, boolean>): Spoke[] {
  const by = new Map<string, Spoke>();
  for (const q of items) {
    if (!q.concept || firstTry[q.id] === undefined) continue;
    const s = by.get(q.concept) ?? { concept: q.concept, ok: true, review: q.review_act };
    s.ok = s.ok && firstTry[q.id];
    s.review ??= q.review_act;
    by.set(q.concept, s);
  }
  return [...by.values()];
}

function RadarSvg({ spokes }: { spokes: Spoke[] }) {
  const n = spokes.length;
  const R = 70;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [100 + r * Math.cos(a), 92 + r * Math.sin(a)] as const;
  };
  const ring = (f: number) => spokes.map((_, i) => pt(i, R * f).join(',')).join(' ');
  const shape = spokes.map((s, i) => pt(i, R * (s.ok ? 1 : 0.32)).join(',')).join(' ');
  return (
    <svg viewBox="0 0 200 184" className="radar-svg" role="img" aria-label="错因雷达">
      {[0.32, 0.66, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="var(--line)" />
      ))}
      {spokes.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={100} y1={92} x2={x} y2={y} stroke="var(--line)" />;
      })}
      <polygon points={shape} fill="rgba(59,79,184,0.18)" stroke="#3b4fb8" strokeWidth={1.8} />
      {spokes.map((s, i) => {
        const [x, y] = pt(i, R * (s.ok ? 1 : 0.32));
        return <circle key={i} cx={x} cy={y} r={4} fill={s.ok ? '#16a34a' : '#dc2626'} />;
      })}
      {spokes.map((_s, i) => {
        const [x, y] = pt(i, R + 12);
        return (
          <text key={i} x={x} y={y + 3} fontSize={9.5} textAnchor={x < 95 ? 'end' : x > 105 ? 'start' : 'middle'} fill="var(--ink)">
            {i + 1}
          </text>
        );
      })}
    </svg>
  );
}

export function MistakeRadar({ items, firstTry, acts }: { items: QuizItem[]; firstTry: Record<string, boolean>; acts: Act[] }) {
  const spokes = spokesOf(items, firstTry);
  if (!spokes.length) return null;
  const missed = spokes.filter((s) => !s.ok);
  return (
    <div className="quiz-radar">
      <div className="radar-head">
        <b>错因雷达</b>
        <span className="muted">{missed.length ? `第一次作答错了 ${missed.length} 个知识点` : '每个知识点都是一次答对'}</span>
      </div>
      <div className="radar-body">
        {spokes.length >= 3 && <RadarSvg spokes={spokes} />}
        <ol className="radar-list">
          {spokes.map((s) => (
            <li key={s.concept} className={s.ok ? 'ok' : 'miss'}>
              <span className="radar-mark" aria-hidden>
                {s.ok ? '✓' : '✗'}
              </span>
              <StageText text={s.concept} />
              {!s.ok && s.review && <ReviewButton act={s.review} acts={acts} />}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
