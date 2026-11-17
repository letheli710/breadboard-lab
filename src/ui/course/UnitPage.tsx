// A learning unit (#/unit/<id>): header (World, code, the one question, time, what it connects
// back to), reverse links, the layers in their fixed order, the portals not placed inline, and
// "mark as done" with the previous / next unit of the World.

import { useEffect } from 'react';
import { LAYERS, unitBlocks, type Layer } from '../../core/course/unit';
import { tt } from '../../core/course/text';
import { tr } from '../../core/i18n';
import { useCourse } from '../../state/courseStore';
import { parseRef, refHash, titleOfRef, UNITS, unitErrors, useCatalog, type Ref } from '../../state/course';
import { setUnitTitles } from '../../state/routeSync';
import { useLang, useStore } from '../../state/store';
import { worldById, worldName } from '../../state/worlds';
import { Icon } from '../Icons';
import { BlockView } from './Blocks';
import { Backlinks, PortalList } from './Portals';
import { Inline } from './UnitMd';

setUnitTitles((id) => {
  const u = UNITS.get(id);
  return u && `${u.code ? `${u.code} · ` : ''}${tt(u.title)}`;
});

const LAYER_TITLE: Record<Layer, () => string> = {
  intuition: () => tr('① 直觉', '① Intuition'),
  derive: () => tr('② 推导', '② Derivation'),
  sim: () => tr('③ 仿真', '③ Simulation'),
  bench: () => tr('④ 面包板', '④ Breadboard'),
  connect: () => tr('⑤ 回链：接回学过的内容', '⑤ Connect it back'),
};

/** Units of a World in course order. */
function unitsOf(worldId: string): string[] {
  const w = worldById(worldId);
  return (w?.sections ?? []).flatMap((s) => s.items.filter((x) => x.startsWith('unit:')).map((x) => x.slice(5)));
}

export default function UnitPage() {
  useLang();
  const id = useStore((s) => s.unitId);
  const cat = useCatalog();
  const done = useCourse((s) => (id ? !!s.unitsDone[id] : false));
  const setDone = useCourse((s) => s.setUnitDone);
  const u = id ? UNITS.get(id) : undefined;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!u) {
    const bad = unitErrors.find((e) => e.file.includes(`/${id}.json`));
    return (
      <main id="main" className="course-page">
        <div className="card unit-missing">
          <h1>{tr('找不到这个单元', "This unit doesn't exist")}</h1>
          {bad && (
            <ul>
              {bad.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          <a href="#/map">{tr('回到学习路线', 'Back to the map')}</a>
        </div>
      </main>
    );
  }
  const w = worldById(u.world);
  const order = unitsOf(u.world);
  const i = order.indexOf(u.id);
  const prev = i > 0 ? order[i - 1] : undefined;
  const next = i >= 0 && i < order.length - 1 ? order[i + 1] : undefined;
  const self: Ref = { kind: 'unit', id: u.id };
  const placed = unitBlocks(u).flatMap((b) => (b.type === 'portal' ? [b.id] : []));
  const connects = u.connects.map(parseRef).filter((r): r is Ref => !!r);
  const layers = [...u.layers].sort((a, b) => LAYERS.indexOf(a.layer) - LAYERS.indexOf(b.layer));

  return (
    <main id="main" className="course-page unit-page">
      <article className="card unit">
        <header className="unit-head">
          <nav className="unit-crumbs" aria-label={tr('位置', 'Location')}>
            <a href="#/map">{tr('学习路线', 'Map')}</a>
            {w && (
              <>
                {' / '}
                <a href={`#/map/${w.id}`}>{worldName(w)}</a>
              </>
            )}
          </nav>
          <div className="eyebrow">
            {u.code && <span className="unit-code">{u.code}</span>} <Icon name="clock" size={14} /> {tr(`约 ${u.minutes} 分钟`, `about ${u.minutes} min`)}
            {done && <span className="badge done">{tr('已完成', 'Done')}</span>}
          </div>
          <h1>{tt(u.title)}</h1>
          <p className="unit-question">
            <b>{tr('这个单元回答：', 'The question: ')}</b>
            <Inline text={tt(u.question)} />
          </p>
          {connects.length > 0 && (
            <p className="unit-connects">
              <b>{tr('接回：', 'Builds on: ')}</b>
              {connects.map((r, k) => {
                const h = refHash(r, cat);
                return (
                  <span key={k}>
                    {k > 0 && tr('、', ', ')}
                    {h ? <a href={h}>{titleOfRef(r, cat)}</a> : titleOfRef(r, cat)}
                  </span>
                );
              })}
            </p>
          )}
        </header>
        <Backlinks target={self} />
        {layers.map((l) => (
          <section key={l.layer} className={`unit-layer layer-${l.layer}`} aria-labelledby={`layer-${l.layer}`}>
            <h2 id={`layer-${l.layer}`}>{l.title ? tt(l.title) : LAYER_TITLE[l.layer]()}</h2>
            {l.blocks.map((b, k) => (
              <BlockView key={k} b={b} />
            ))}
          </section>
        ))}
        <PortalList source={self} skip={placed} />
        <footer className="unit-foot">
          <label className="unit-done">
            <input type="checkbox" checked={done} onChange={(e) => setDone(u.id, e.target.checked)} /> {tr('我学完了这个单元', 'I have finished this unit')}
          </label>
          <div className="row between">
            {prev ? (
              <a className="button" href={`#/unit/${prev}`}>
                <Icon name="prev" size={15} /> {titleOfRef({ kind: 'unit', id: prev }, cat)}
              </a>
            ) : (
              <span />
            )}
            {next && (
              <a className="button primary" href={`#/unit/${next}`}>
                {titleOfRef({ kind: 'unit', id: next }, cat)} <Icon name="next" size={15} />
              </a>
            )}
          </div>
        </footer>
      </article>
    </main>
  );
}
