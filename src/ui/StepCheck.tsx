// Lesson steps with a "check" (core/stepCheck.ts): a live "done / still to do" line under the
// step text, and which steps have been done (for the step dots). Plus the "do this lesson
// first" links of a lab ("prereq").

import { useEffect, useMemo } from 'react';
import type { Challenge } from '../core/challenge';
import { tr } from '../core/i18n';
import { describeComponent } from '../core/parts';
import type { CompType } from '../core/types';
import { unmetStepChecks } from '../core/stepCheck';
import { useStore } from '../state/store';

const doneSteps = new Map<string, Set<number>>();
const EMPTY = new Set<number>();

/** Unmet items per step (null = the step has no check), live against the board. */
export function useStepChecks(ch: Challenge): { unmet: (string[] | null)[]; done: Set<number> } {
  const layout = useStore((s) => s.layout);
  const probe = useStore((s) => s.probe);
  const scope = useStore((s) => s.scope);
  const unmet = useMemo(() => ch.steps.map((s) => (s.check?.length ? unmetStepChecks(s.check, { layout, probe, scope }) : null)), [ch, layout, probe, scope]);
  // a step stays done once its check passed (a later step may undo it on purpose, e.g. move the
  // ammeter); remembered per lesson for the session, since the panel unmounts on a tab switch
  const done = useMemo(() => {
    const prev = doneSteps.get(ch.id);
    const fresh = unmet.flatMap((u, i) => (u && !u.length && !prev?.has(i) ? [i] : []));
    return fresh.length ? new Set([...(prev ?? []), ...fresh]) : (prev ?? EMPTY);
  }, [ch.id, unmet]);
  useEffect(() => {
    if (done !== EMPTY && done !== doneSteps.get(ch.id)) doneSteps.set(ch.id, done);
  }, [ch.id, done]);
  return { unmet, done };
}

export function StepStatus({ unmet }: { unmet: string[] | null }) {
  if (!unmet) return null;
  if (!unmet.length)
    return (
      <div className="step-check ok" role="status">
        ✓ {tr('这一步完成了，点“下一步”。', 'Step done — press Next.')}
      </div>
    );
  return (
    <div className="step-check todo" role="status">
      <span>{tr('还差：', 'Still to do:')}</span>
      <ul>
        {unmet.map((u, i) => (
          <li key={i}>{u}</li>
        ))}
      </ul>
    </div>
  );
}

/** After a placement in a lesson the step stays in view; this chip names the new part, with a way
 *  to its settings (the Properties tab) and to dismiss it. */
export function PlacedChip() {
  const selectedId = useStore((s) => s.selectedId);
  const part = useStore((s) => s.layout.parts.find((p) => p.id === s.selectedId));
  const setPanel = useStore((s) => s.setPanel);
  const select = useStore((s) => s.select);
  if (!selectedId || !part || part.type === 'wire') return null;
  return (
    // not a live region: a keyboard placement is announced by the keyboard form already (once)
    <div className="placed-chip" role="group" aria-label={tr('刚放好的元件', 'Part just placed')}>
      <span>
        {tr('刚放好：', 'Just placed: ')}
        <b>{part.ref}</b> · {describeComponent({ type: part.type as CompType, props: part.props })}
      </span>
      <button
        className="link"
        onClick={() => {
          setPanel('inspect');
          // this chip leaves with the task tab: keep keyboard focus on the panel that opened
          requestAnimationFrame(() => document.getElementById('side-panel')?.focus());
        }}
      >
        {tr('在“属性”里修改', 'Edit in Properties')}
      </button>
      <button className="chip-x" aria-label={tr('关闭', 'Dismiss')} onClick={() => select(null)}>
        ×
      </button>
    </div>
  );
}

/** "Do this lesson first: Lesson 9 · Multimeter →" */
export function Prereqs({ ch }: { ch: Challenge }) {
  const all = useStore((s) => s.challenges);
  const completed = useStore((s) => s.completed);
  const open = useStore((s) => s.openChallenge);
  const list = (ch.prereq ?? []).map((id) => all.find((c) => c.id === id)).filter((c): c is Challenge => !!c);
  if (!list.length) return null;
  return (
    <div className="prereq">
      <span className="eyebrow">{tr('先修课程', 'Do first')}</span>
      {list.map((c) => (
        <button key={c.id} className="link" onClick={() => open(c.id)}>
          {completed[c.id] ? '✓ ' : ''}
          {c.title} →
        </button>
      ))}
    </div>
  );
}
