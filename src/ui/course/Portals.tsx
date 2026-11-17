// Portal cards ("behind the door", prerequisites with the student's status, time, "watch later")
// and reverse links, generated from course/portals.json (docs/PORTALS.md). A door never locks:
// unmet prerequisites only change the status line to "do World X first".

import { tt } from '../../core/course/text';
import { tr } from '../../core/i18n';
import { useCourse } from '../../state/courseStore';
import {
  backlinksTo,
  COURSE,
  enterPortal,
  parseRef,
  portalReadiness,
  portalsFrom,
  refHash,
  resolveRef,
  titleOfRef,
  useCatalog,
  useProgress,
  type Portal,
  type Ref,
} from '../../state/course';
import { worldLabel } from '../../state/worlds';
import { useLang } from '../../state/store';
import { Icon } from '../Icons';
import { Inline } from './UnitMd';

export function PortalCard({ portal }: { portal: Portal }) {
  useLang();
  const cat = useCatalog();
  const progress = useProgress();
  const later = useCourse((s) => s.later.some((x) => x.portal === portal.id));
  const toggleLater = useCourse((s) => s.toggleLater);
  const to = parseRef(portal.to);
  const target = to ? resolveRef(to, cat, COURSE) : null;
  const live = target?.state === 'live';
  const title = to ? titleOfRef(to, cat) : portal.to;
  const ready = portalReadiness(portal, progress, COURSE, cat);
  const prereqs = portal.prereq.map(parseRef).filter((r): r is Ref => !!r);
  return (
    <article className={`portal card ${live ? '' : 'soon'}`} aria-label={tr(`传送门：${title}`, `Portal: ${title}`)}>
      <div className="portal-head">
        <span className="portal-icon" aria-hidden>
          ◎
        </span>
        <div>
          <div className="eyebrow">{live ? tr('传送门', 'Portal') : tr('传送门 · 即将上线', 'Portal · coming soon')}</div>
          <h3 className="portal-title">{title}</h3>
        </div>
      </div>
      <p className="portal-what">
        <b>{tr('门后讲什么：', 'Behind the door: ')}</b>
        <Inline text={tt(portal.what)} />
      </p>
      {prereqs.length > 0 && (
        <p className="portal-pre">
          <b>{tr('前置要求：', 'First understand: ')}</b>
          {prereqs.map((r, i) => {
            const h = refHash(r, cat);
            const t = titleOfRef(r, cat);
            return (
              <span key={i}>
                {i > 0 && tr('、', ', ')}
                {h ? <a href={h}>{t}</a> : <span className="muted">{t}</span>}
              </span>
            );
          })}
        </p>
      )}
      <div className="portal-meta">
        <span className={`portal-status ${ready.ready ? 'ok' : 'later'}`}>
          {ready.ready
            ? tr('✓ 现在可看', '✓ Ready now')
            : ready.world
              ? tr(`建议先学 ${worldLabel(ready.world)}`, `Best after ${worldLabel(ready.world)}`)
              : tr('建议先学前置内容', 'Best after the prerequisites')}
        </span>
        <span className="muted">
          <Icon name="clock" size={14} /> {tr(`约 ${portal.minutes} 分钟`, `about ${portal.minutes} min`)}
        </span>
      </div>
      <div className="row portal-actions">
        {live ? (
          <button className="primary" onClick={() => enterPortal(portal, cat)}>
            {tr('进入', 'Go through')} <Icon name="next" size={15} />
          </button>
        ) : (
          <button disabled>{tr('即将上线', 'Coming soon')}</button>
        )}
        <button aria-pressed={later} onClick={() => toggleLater(portal.id)}>
          {later ? tr('✓ 已加入待看', '✓ In watch later') : tr('稍后再看', 'Watch later')}
        </button>
      </div>
    </article>
  );
}

/** The portals that start at `source`, except those placed elsewhere on the page. */
export function PortalList({ source, skip = [], title }: { source: Ref; skip?: string[]; title?: string }) {
  useLang();
  const list = portalsFrom(source, COURSE).filter((p) => !skip.includes(p.id));
  if (!list.length) return null;
  return (
    <section className="portal-list" aria-label={title ?? tr('传送门', 'Portals')}>
      <h2 className="eyebrow">{title ?? tr('传送门：这个想法在别处展开', 'Portals: where this idea goes next')}</h2>
      <div className="portal-grid">
        {list.map((p) => (
          <PortalCard key={p.id} portal={p} />
        ))}
      </div>
    </section>
  );
}

/** Reverse links: portals that lead here, each pointing back to its source. */
export function Backlinks({ target }: { target: Ref }) {
  useLang();
  const cat = useCatalog();
  const list = backlinksTo(target, COURSE, cat);
  if (!list.length) return null;
  return (
    <section className="backlinks" aria-label={tr('从别处传送过来', 'Portals that lead here')}>
      {list.map((p) => {
        const from = parseRef(p.from);
        const h = from && refHash(from, cat);
        const t = from ? titleOfRef(from, cat) : p.from;
        return (
          <p key={p.id} className="backlink">
            <span aria-hidden>↩ </span>
            {tr('从 ', 'From ')}
            {h ? <a href={h}>{t}</a> : <b>{t}</b>}
            {tr('：', ': ')}
            <Inline text={tt(p.back)} />
          </p>
        );
      })}
    </section>
  );
}

/** Reverse links + portals for a lesson / lab / chapter / problem page (lazy-loaded box). */
export default function CoursePortals({ kind, id, part }: { kind: 'challenge' | 'chapter' | 'problem'; id: string; part: 'top' | 'bottom' }) {
  const ref: Ref = { kind, id };
  return part === 'top' ? <Backlinks target={ref} /> : <PortalList source={ref} />;
}
