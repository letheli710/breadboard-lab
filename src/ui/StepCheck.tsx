// Lesson steps with a "check" (core/stepCheck.ts): a live "done / still to do" line under the
// step text, and which steps have been done (for the step dots). Plus the "do this lesson
// first" links of a lab ("prereq").

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Challenge } from '../core/challenge';
import { tr } from '../core/i18n';
import { unmetStepChecks } from '../core/stepCheck';
import { useStore } from '../state/store';

/** Unmet items per step (null = the step has no check), live against the board. */
export function useStepChecks(ch: Challenge): { unmet: (string[] | null)[]; done: Set<number> } {
  const layout = useStore((s) => s.layout);
  const probe = useStore((s) => s.probe);
  const scope = useStore((s) => s.scope);
  const unmet = useMemo(() => ch.steps.map((s) => (s.check?.length ? unmetStepChecks(s.check, { layout, probe, scope }) : null)), [ch, layout, probe, scope]);
  // a step stays done once its check passed (a later step may undo it on purpose, e.g. move the ammeter)
  const [done, setDone] = useState<Set<number>>(() => new Set());
  const id = useRef(ch.id);
  useEffect(() => {
    const fresh = id.current !== ch.id;
    id.current = ch.id;
    setDone((d) => {
      const next = new Set(fresh ? [] : d);
      unmet.forEach((u, i) => u && !u.length && next.add(i));
      return next.size === d.size && [...next].every((i) => d.has(i)) ? d : next;
    });
  }, [ch.id, unmet]);
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
