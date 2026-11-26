// Course pieces that live in the app shell on every page: the header's "watch later" button
// (count from the small course store; the list itself is a lazy dialog) and the breadcrumb bar
// left by a portal ("← back to <source>"), shown while the student is on the portal's target.

import { lazy, Suspense, useEffect, useState } from 'react';
import { tr } from '../../core/i18n';
import { useCourse } from '../../state/courseStore';
import { useLang } from '../../state/store';
// the app shell's icon set (ui/IconCore): this file is on every page's start-up path
import { CoreIcon as Icon } from '../IconCore';

const LaterDialog = lazy(() => import('./LaterDialog'));

export function LaterButton() {
  useLang();
  const n = useCourse((s) => s.later.filter((x) => !x.done).length);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="later-btn" onClick={() => setOpen(true)} aria-haspopup="dialog" title={tr('稍后再看的传送门', 'Portals saved for later')}>
        <Icon name="later" size={18} />
        <span>{tr('待看', 'Later')}</span>
        {n > 0 && <b className="later-count">{n}</b>}
      </button>
      {open && (
        <Suspense fallback={null}>
          <LaterDialog onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}

/** "← Back to <source>" after going through a portal; gone once the student leaves the target. */
export function TrailBar() {
  useLang();
  const trail = useCourse((s) => s.trail);
  const setTrail = useCourse((s) => s.setTrail);
  const [hash, setHash] = useState(() => location.hash);
  useEffect(() => {
    const on = () => setHash(location.hash);
    window.addEventListener('hashchange', on);
    window.addEventListener('popstate', on);
    return () => {
      window.removeEventListener('hashchange', on);
      window.removeEventListener('popstate', on);
    };
  }, []);
  // left the target (or came back to the source): the trail is done
  useEffect(() => {
    if (trail && hash !== trail.to && hash !== '') setTrail(null);
  }, [hash, trail, setTrail]);
  if (!trail || hash !== trail.to) return null;
  return (
    <nav className="trail-bar" aria-label={tr('传送门面包屑', 'Portal breadcrumb')}>
      <a href={trail.from}>
        <Icon name="prev" size={15} /> {tr('返回', 'Back to')} {trail.fromTitle || tr('来源', 'where you came from')}
      </a>
      <button className="pr-link" onClick={() => setTrail(null)} aria-label={tr('关闭面包屑', 'Dismiss')}>
        ✕
      </button>
    </nav>
  );
}
