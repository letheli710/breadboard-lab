// One calculation card: the formula, a live calculator (type values with SI prefixes: 4.7k, 100n),
// the figure, the derivation step by step, an example and the usual mistakes, with links on to the
// teardowns, lessons and practice chapter that use it.

import './inside.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatSI, parseValue } from '../core/format';
import { tr } from '../core/i18n';
import { useStore } from '../state/store';
import { Icon } from '../ui/Icons';
import { MathText } from '../ui/mathText';
import { useCalcs } from './hooks';
import { InsideMd } from './InsideMd';
import { tdById } from './registry';
import type { CalcCard } from './types';

const fmt = (v: number, unit: string) => {
  if (!Number.isFinite(v)) return '—';
  if (unit === '%') return `${parseFloat(v.toPrecision(3))} %`;
  if (unit === '') return `${parseFloat(v.toPrecision(5))}`;
  return formatSI(v, unit, 4);
};

function Calculator({ c }: { c: CalcCard }) {
  const [txt, setTxt] = useState<Record<string, string>>(() => Object.fromEntries(c.vars.map((v) => [v.sym, formatSI(v.def, '', 4).replace(/\s+$/, '').replace(' ', '')])));
  // reset when another card is shown
  const id = useRef(c.id);
  useEffect(() => {
    if (id.current === c.id) return;
    id.current = c.id;
    setTxt(Object.fromEntries(c.vars.map((v) => [v.sym, formatSI(v.def, '', 4).replace(/\s+$/, '').replace(' ', '')])));
  }, [c]);
  const vals: Record<string, number> = {};
  const bad = new Set<string>();
  for (const v of c.vars) {
    const raw = (txt[v.sym] ?? '').replace(/µ/g, 'u');
    const n = parseValue(raw.replace(/\/s$|V\/s$/i, ''));
    if (n === null) bad.add(v.sym);
    else vals[v.sym] = n;
  }
  const res = bad.size ? NaN : c.compute(vals);
  return (
    <div className="calc-calc">
      <div className="calc-inputs">
        {c.vars.map((v) => (
          <label key={v.sym} className={bad.has(v.sym) ? 'bad' : ''}>
            <span className="calc-sym">
              <MathText text={v.sym.replace(/^([A-Za-z])(\d+)$/, '$1_$2')} />
            </span>
            <span className="calc-name">{v.name}</span>
            <span className="calc-field">
              <input
                value={txt[v.sym] ?? ''}
                inputMode="decimal"
                spellCheck={false}
                aria-invalid={bad.has(v.sym)}
                onChange={(e) => setTxt((t) => ({ ...t, [v.sym]: e.target.value }))}
              />
              <span className="calc-unit">{v.unit}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="calc-out" aria-live="polite">
        <span className="calc-out-name">
          <MathText text={c.out.sym} /> · {c.out.name}
        </span>
        <b>{fmt(res, c.out.unit)}</b>
      </div>
      <p className="calc-tip">{tr('可以写 4.7k、100n、2.5m 这样的写法。改一个数，看结果怎么变。', 'Type 4.7k, 100n, 2.5m and so on. Change one number and watch the result.')}</p>
    </div>
  );
}

export function CalcCardView({ c, onTeardown, onClose }: { c: CalcCard; onTeardown?: (id: string) => void; onClose?: () => void }) {
  const open = useStore((s) => s.openChallenge);
  const challenges = useStore((s) => s.challenges);
  const openSummary = useStore((s) => s.openSummary);
  const lessons = (c.lessons ?? []).map((id) => challenges.find((x) => x.id === id)).filter(Boolean);
  return (
    <article className="calc-card card" aria-labelledby={`calc-h-${c.id}`}>
      <header className="calc-head">
        <h3 id={`calc-h-${c.id}`}>{c.title}</h3>
        <p className="calc-use">{c.use}</p>
      </header>
      <div className="calc-top">
        <div className="calc-formula">
          <MathText text={c.tex} />
        </div>
        {c.Figure && (
          <svg viewBox="0 0 260 150" className="calc-fig" role="img" aria-label={tr('电路图', 'Circuit')}>
            {c.Figure()}
          </svg>
        )}
      </div>
      <Calculator c={c} />
      <section className="calc-why">
        <h4>{tr('为什么是这个公式', 'Why this formula')}</h4>
        <InsideMd text={c.why} />
      </section>
      {c.example && (
        <section className="calc-ex">
          <h4>{tr('例子', 'Example')}</h4>
          <InsideMd text={c.example} />
        </section>
      )}
      {c.pitfalls && c.pitfalls.length > 0 && (
        <section className="calc-pit">
          <h4>{tr('容易错', 'Common mistakes')}</h4>
          <InsideMd text={c.pitfalls.map((p) => `- ${p}`).join('\n')} />
        </section>
      )}
      {(c.teardowns?.length || lessons.length || c.chapter) && (
        <footer className="calc-links">
          {c.teardowns?.map((t) => {
            const e = tdById(t);
            return (
              e && (
                <button key={t} className="chip" onClick={() => onTeardown?.(t)} disabled={!onTeardown}>
                  <Icon name="layers" size={14} /> {tr(`拆开看：${e.zh}`, `Inside: ${e.en}`)}
                </button>
              )
            );
          })}
          {lessons.map((l) => (
            <button
              key={l!.id}
              className="chip"
              onClick={() => {
                onClose?.();
                open(l!.id);
              }}
            >
              <Icon name={l!.kind === 'lesson' ? 'book' : 'target'} size={14} /> {l!.title}
            </button>
          ))}
          {c.chapter && (
            <button
              className="chip"
              onClick={() => {
                onClose?.();
                openSummary({ chapter: c.chapter! });
              }}
            >
              <Icon name="practice" size={14} /> {tr('去练习这一章', 'Practise this chapter')}
            </button>
          )}
        </footer>
      )}
    </article>
  );
}

/** chips naming calculation cards; clicking one opens it in a dialog (or calls onOpen) */
export function CalcChipsInner({ ids, onOpen }: { ids: string[]; onOpen?: (id: string) => void }) {
  const calcs = useCalcs();
  const [shown, setShown] = useState<string | null>(null);
  const cards = useMemo(() => ids.map((id) => calcs?.cards.find((c) => c.id === id)).filter(Boolean) as CalcCard[], [ids, calcs]);
  if (!cards.length) return null;
  return (
    <div className="calc-chips">
      <span className="calc-chips-lbl">
        <Icon name="calc" size={14} /> {tr('动手算：', 'Calculate:')}
      </span>
      {cards.map((c) => (
        <button key={c.id} className="chip calc-chip" onClick={() => (onOpen ? onOpen(c.id) : setShown(c.id))}>
          {c.title}
        </button>
      ))}
      {shown && <CalcDialog id={shown} onClose={() => setShown(null)} />}
    </div>
  );
}

/** a calculation card in a modal dialog (Esc / backdrop closes; focus returns) */
export function CalcDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const calcs = useCalcs();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      if (prev && document.contains(prev)) prev.focus();
    };
  }, [onClose]);
  const c = calcs?.cards.find((x) => x.id === id);
  return createPortal(
    <div className="modal-bg calc-modal-bg" onClick={onClose}>
      <div className="calc-modal" role="dialog" aria-modal="true" aria-label={c?.title ?? ''} tabIndex={-1} ref={box} onClick={(e) => e.stopPropagation()}>
        <button className="calc-close" onClick={onClose} aria-label={tr('关闭', 'Close')}>
          ✕
        </button>
        {c ? <CalcCardView c={c} onClose={onClose} /> : <div className="page-loading">{tr('加载中…', 'Loading…')}</div>}
      </div>
    </div>,
    document.body,
  );
}
