// The "watch later" queue: every portal the student set aside, with its source and target;
// tick it off once seen. Opened from the header on any page (modal dialog: Esc closes it, Tab
// stays inside, focus returns to the button).

import { useEffect, useRef } from 'react';
import { tr } from '../../core/i18n';
import { useCourse } from '../../state/courseStore';
import { enterPortal, parseRef, PORTALS, refHash, titleOfRef, useCatalog } from '../../state/course';
import { useLang } from '../../state/store';

export default function LaterDialog({ onClose }: { onClose: () => void }) {
  useLang();
  const cat = useCatalog();
  const later = useCourse((s) => s.later);
  const setDone = useCourse((s) => s.setLaterDone);
  const remove = useCourse((s) => s.removeLater);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>('h2')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab' && box.current) {
        const f = [...box.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled)')];
        if (!f.length) return;
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && (i === -1 || i === f.length - 1)) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      if (prev && document.contains(prev)) prev.focus();
    };
  }, [onClose]);

  const open = later.filter((x) => !x.done);
  const seen = later.filter((x) => x.done);
  const row = (x: (typeof later)[number]) => {
    const p = PORTALS.find((y) => y.id === x.portal);
    if (!p) return null;
    const from = parseRef(p.from);
    const to = parseRef(p.to);
    const fromHash = from && refHash(from, cat);
    const live = !!(to && refHash(to, cat));
    return (
      <li key={x.portal} className={`later-item ${x.done ? 'done' : ''}`}>
        <label className="later-check">
          <input type="checkbox" checked={!!x.done} onChange={(e) => setDone(x.portal, e.target.checked)} />
          <span className="sr-only">{tr('看完了', 'Seen')}</span>
        </label>
        <div className="later-body">
          <div className="later-to">{to ? titleOfRef(to, cat) : p.to}</div>
          <div className="muted">
            {tr('来自 ', 'from ')}
            {fromHash ? (
              <a href={fromHash} onClick={onClose}>
                {from ? titleOfRef(from, cat) : p.from}
              </a>
            ) : from ? (
              titleOfRef(from, cat)
            ) : (
              p.from
            )}
          </div>
        </div>
        <div className="row">
          <button
            className="primary"
            disabled={!live}
            onClick={() => {
              onClose();
              enterPortal(p, cat);
            }}
          >
            {live ? tr('进入', 'Go') : tr('即将上线', 'Soon')}
          </button>
          <button className="pr-link" onClick={() => remove(x.portal)} aria-label={tr('从待看里移除', 'Remove from the list')}>
            ✕
          </button>
        </div>
      </li>
    );
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal card later-dialog" ref={box} role="dialog" aria-modal="true" aria-labelledby="later-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="later-title" tabIndex={-1}>
          {tr('稍后再看', 'Watch later')}
        </h2>
        {later.length === 0 ? (
          <p className="muted">{tr('还没有。在任何传送门旁边点“稍后再看”，它就会出现在这里。', 'Nothing yet. Press "Watch later" next to any portal and it shows up here.')}</p>
        ) : (
          <>
            {open.length > 0 && <ul className="later-list">{open.map(row)}</ul>}
            {seen.length > 0 && (
              <>
                <h3 className="eyebrow">{tr('已看完', 'Seen')}</h3>
                <ul className="later-list">{seen.map(row)}</ul>
              </>
            )}
          </>
        )}
        <div className="row center">
          <button onClick={onClose}>{tr('关闭', 'Close')}</button>
        </div>
      </div>
    </div>
  );
}
