// The lazy portal box for lessons / labs, key-points pages and problems: reverse links at the
// top, portals at the bottom. Nothing is loaded where the page has neither.

import { lazy, Suspense } from 'react';
import { hasBacklinks, hasPortals } from '../../state/portalIndex';

const CoursePortals = lazy(() => import('./Portals'));

export function PortalSlot({ kind, id, part }: { kind: 'challenge' | 'chapter' | 'problem'; id: string; part: 'top' | 'bottom' }) {
  if (!(part === 'top' ? hasBacklinks(kind, id) : hasPortals(kind, id))) return null;
  return (
    <Suspense fallback={null}>
      <CoursePortals kind={kind} id={id} part={part} />
    </Suspense>
  );
}
