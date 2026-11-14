// Phones and touch tablets: the lesson / challenge panel sits below a tall 3D canvas, so a compact
// bar fixed to the bottom of the screen keeps the current step, Back / Next and Check in thumb
// reach. Its Check runs the side panel's check (event 'bb-run-check'); "Details" scrolls to the
// result there. Hidden on desktop layouts (styles.css).

import { useState } from 'react';
import { tr } from '../core/i18n';
import { useActiveChallenge } from '../state/derived';
import { useStore } from '../state/store';
import { Icon } from './Icons';
import { Md } from './Md';

export function BenchBar() {
  const ch = useActiveChallenge();
  const step = useStore((s) => s.step);
  const setStep = useStore((s) => s.setStep);
  const check = useStore((s) => s.check);
  const [open, setOpen] = useState(false);
  if (!ch) return null;
  const n = ch.steps.length;
  const cur = Math.min(step, Math.max(0, n - 1));
  const runCheck = () => {
    useStore.getState().setPanel('task');
    // the task panel may have to mount first
    requestAnimationFrame(() => window.dispatchEvent(new Event('bb-run-check')));
  };
  const details = () => {
    useStore.getState().setPanel('task');
    requestAnimationFrame(() => document.querySelector('.side .check-result, .side')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  return (
    <section className={`bench-bar ${open ? 'open' : ''}`} aria-label={tr('当前步骤', 'Current step')}>
      {n > 0 && (
        <button className="bench-bar-text" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span className="eyebrow">
            {tr('步骤', 'Step')} {cur + 1} / {n}
          </span>
          <span className="bench-bar-md">
            <Md text={ch.steps[cur].text} />
          </span>
        </button>
      )}
      <div className="bench-bar-row">
        {n > 0 && (
          <>
            <button disabled={cur === 0} onClick={() => setStep(cur - 1)} aria-label={tr('上一步', 'Back')}>
              <Icon name="prev" />
            </button>
            <button disabled={cur >= n - 1} onClick={() => setStep(cur + 1)} aria-label={tr('下一步', 'Next')}>
              <Icon name="next" />
            </button>
          </>
        )}
        {check && (
          <button className={`bench-bar-result ${check.perfect ? 'ok' : 'bad'}`} onClick={details}>
            {check.perfect ? '✓' : `${Math.round(check.progress * 100)}%`} {tr('详情', 'Details')}
          </button>
        )}
        <button className="primary bench-bar-check" onClick={runCheck}>
          <Icon name="check" /> {tr('检查', 'Check')}
        </button>
      </div>
    </section>
  );
}
