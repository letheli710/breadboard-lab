// The course map (#/map): 8 main-line Worlds and the UB bridge area, each with its QCC course,
// textbook chapters, progress and items (units, lessons / labs, theory chapters), plus the units
// still to be built. Generated from course/worlds.json.

import { isDone, type Ref, type World } from '../../core/course/catalog';
import { tt } from '../../core/course/text';
import { tr } from '../../core/i18n';
import { COURSE, parseRef, refHash, titleOfRef, useCatalog, useProgress } from '../../state/course';
import { useLang } from '../../state/store';
import { PENDING, WORLDS, worldLabel } from '../../state/worlds';
import { Icon } from '../Icons';
import { Inline } from './UnitMd';

const KIND: Record<string, () => string> = {
  unit: () => tr('单元', 'Unit'),
  lesson: () => tr('新版课', 'Lesson'),
  challenge: () => tr('面包板', 'Bench'),
  chapter: () => tr('理论', 'Theory'),
};

function useWorldProgress(w: World) {
  const cat = useCatalog();
  const progress = useProgress();
  const refs = w.sections
    .flatMap((s) => s.items)
    .map(parseRef)
    .filter((r): r is Ref => !!r);
  return { done: refs.filter((r) => isDone(r, progress, cat, COURSE)).length, total: refs.length };
}

function WorldCard({ w }: { w: World }) {
  const cat = useCatalog();
  const progress = useProgress();
  const { done, total } = useWorldProgress(w);
  const pending = PENDING.filter((p) => p.world === w.id && !cat.units.has(p.id) && !cat.challenges.has(p.id));
  return (
    <details className={`world card ${w.current ? 'current' : ''} ${w.elective ? 'elective' : ''}`} id={`world-${w.id}`} open={w.current || undefined}>
      <summary>
        <span className="world-n">{worldLabel(w)}</span>
        <h2 className="world-title">
          {tt(w.title)}
          {w.current && <span className="badge world-here">📍 {tr('当前进度', 'You are here')}</span>}
        </h2>
        <span className="world-meta">
          {tt(w.course)}
          {w.textbook && ` · ${tt(w.textbook)}`}
        </span>
        <span className="world-progress" aria-label={tr(`完成 ${done} / ${total}`, `${done} of ${total} done`)}>
          <span className="world-bar" aria-hidden>
            <span style={{ width: total ? `${(done / total) * 100}%` : 0 }} />
          </span>
          <span aria-hidden>
            {done}/{total}
          </span>
        </span>
      </summary>
      {w.note && (
        <p className="world-note">
          <Inline text={tt(w.note)} />
        </p>
      )}
      {w.sections.map((s, i) => (
        <section key={i} className="world-section">
          <h3>
            <Inline text={tt(s.title)} />
          </h3>
          {s.note && (
            <p className="muted">
              <Inline text={tt(s.note)} />
            </p>
          )}
          <ul className="world-items">
            {s.items.map((item) => {
              const r = parseRef(item);
              if (!r) return null;
              const h = refHash(r, cat);
              const ok = isDone(r, progress, cat, COURSE);
              return (
                <li key={item} className={`world-item kind-${r.kind} ${ok ? 'done' : ''}`}>
                  <span className="wi-kind">{KIND[r.kind]?.()}</span>
                  {h ? <a href={h}>{titleOfRef(r, cat)}</a> : <span className="muted">{titleOfRef(r, cat)}</span>}
                  {ok && (
                    <span className="wi-done" aria-label={tr('已完成', 'done')}>
                      ✓
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {pending.length > 0 && (
        <section className="world-section">
          <h3>{tr('即将上线', 'Coming soon')}</h3>
          <ul className="world-items soon">
            {pending.map((p) => (
              <li key={p.id} className="world-item">
                <span className="wi-kind">{tr('待建', 'Planned')}</span>
                <span>
                  <b>{tt(p.title)}</b> <span className="muted">— {tt(p.what)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </details>
  );
}

export default function MapPage() {
  useLang();
  const cat = useCatalog();
  const progress = useProgress();
  const main = WORLDS.filter((w) => !w.elective);
  const refs = main
    .flatMap((w) => w.sections.flatMap((s) => s.items))
    .map(parseRef)
    .filter((r): r is Ref => !!r);
  const done = refs.filter((r) => isDone(r, progress, cat, COURSE)).length;
  return (
    <main id="main" className="course-page map-page">
      <div className="guide-hero card">
        <div className="eyebrow">
          <Icon name="map" size={16} /> {tr('学习路线 COURSE MAP', 'COURSE MAP')}
        </div>
        <h1>{tr('8 个 World，从基础定律到单片机', '8 Worlds, from basic laws to microcontrollers')}</h1>
        <p>
          {tr(
            '每个 World 对应一门 QCC 课程和教材章节。📍 是现在的进度。单元之间有传送门：讲到别处才展开的想法，点进去就到；看完一键回来。',
            'Each World matches a QCC course and textbook chapters. 📍 marks where you are now. Portals connect ideas across Worlds: step through, then come straight back.',
          )}
        </p>
        <p className="muted">{tr(`主线进度：${done} / ${refs.length}（UB 衔接区不计入）`, `Main line: ${done} of ${refs.length} done (the UB area is not counted)`)}</p>
      </div>
      {WORLDS.map((w) => (
        <WorldCard key={w.id} w={w} />
      ))}
    </main>
  );
}
