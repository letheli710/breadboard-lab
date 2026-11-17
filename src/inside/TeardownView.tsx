// A teardown: text on the left (one section per layer), the figure on the right (sticky). Scrolling
// the text moves the figure from layer to layer (outside → x-ray → inside → model → formulas); the
// stepper above jumps to a layer. Linked words, table rows and leader-line labels highlight their
// part of the figure; hovering a part of the figure highlights the words that name it.

import './inside.css';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { tr } from '../core/i18n';
import { useLang } from '../state/store';
import { Icon } from '../ui/Icons';
import { MathText } from '../ui/mathText';
import { CalcChips } from './CalcChips';
import { FocusCtx, hasPart } from './focus';
import { inline, InsideMd } from './InsideMd';
import type { Callout, Layer, Teardown, TdTable } from './types';

const useIsoLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

function CalloutLayer({ callouts, focus, setFocus }: { callouts: Callout[]; focus: string | null; setFocus: (p: string | null) => void }) {
  return (
    <g className="td-callouts">
      {callouts.map((c, i) => {
        const on = focus === c.part;
        const right = c.lx >= c.x;
        return (
          <g key={`${c.part}-${i}`} className={`td-callout ${on ? 'on' : ''}`} onMouseEnter={() => setFocus(c.part)} onMouseLeave={() => setFocus(null)}>
            <line x1={c.lx} y1={c.ly} x2={c.x} y2={c.y} />
            <circle cx={c.x} cy={c.y} r={3.2} />
            <text
              x={c.lx + (c.anchor === 'middle' ? 0 : (c.anchor ?? (right ? 'start' : 'end')) === 'start' ? 4 : -4)}
              y={c.ly + (c.anchor === 'middle' ? -6 : 4)}
              textAnchor={c.anchor ?? (right ? 'start' : 'end')}
            >
              {c.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function TableBlock({ t }: { t: TdTable }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <FocusCtx.Consumer>
      {({ focus, setFocus }) => (
        <div className="td-table-wrap">
          <table className="cmp td-table">
            <thead>
              <tr>
                {t.head.map((h, j) => (
                  <th key={j} scope="col">
                    {inline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r, i) => {
                const part = t.parts?.[i] ?? null;
                return (
                  <tr
                    key={i}
                    className={part && (focus === part || hover === i) ? 'on' : ''}
                    tabIndex={part ? 0 : undefined}
                    onMouseEnter={() => {
                      setHover(i);
                      if (part) setFocus(part);
                    }}
                    onMouseLeave={() => {
                      setHover(null);
                      if (part) setFocus(null);
                    }}
                    onFocus={() => part && setFocus(part)}
                    onBlur={() => part && setFocus(null)}
                  >
                    {r.map((c, j) =>
                      j === 0 ? (
                        <th key={j} scope="row">
                          {inline(c)}
                        </th>
                      ) : (
                        <td key={j}>{inline(c)}</td>
                      ),
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </FocusCtx.Consumer>
  );
}

function LayerSection({ layer, i, n, active, onCalc }: { layer: Layer; i: number; n: number; active: boolean; onCalc?: (id: string) => void }) {
  return (
    <section className={`td-sec ${active ? 'active' : ''}`} data-layer={i} aria-labelledby={`td-h-${layer.id}`}>
      <div className="td-sec-num" aria-hidden>
        {String(i + 1).padStart(2, '0')}
        <span>/ {String(n).padStart(2, '0')}</span>
      </div>
      <h3 id={`td-h-${layer.id}`}>{layer.title}</h3>
      <InsideMd text={layer.body} />
      {layer.table && <TableBlock t={layer.table} />}
      {layer.formulas && layer.formulas.length > 0 && (
        <div className="td-formulas">
          {layer.formulas.map((f, k) => (
            <div className="td-formula" key={k}>
              <div className="td-formula-tex">
                <MathText text={f.tex} />
              </div>
              {f.note && <div className="td-formula-note">{inline(f.note)}</div>}
            </div>
          ))}
        </div>
      )}
      {layer.calcs && layer.calcs.length > 0 && <CalcChips ids={layer.calcs} onOpen={onCalc} />}
    </section>
  );
}

export function TeardownView({
  td,
  onDone,
  doneLabel,
  onCalc,
  compact,
}: {
  td: Teardown;
  onDone?: () => void;
  doneLabel?: string;
  onCalc?: (id: string) => void;
  /** inside the lesson's left area: the whole view scrolls in its own box */
  compact?: boolean;
}) {
  useLang();
  const [layer, setLayer] = useState(0);
  const [focus, setFocusRaw] = useState<string | null>(null);
  const setFocus = useCallback((p: string | null) => setFocusRaw(p), []);
  const scroller = useRef<HTMLDivElement>(null);
  /** a stepper click scrolls smoothly: the scroll position doesn't pick the layer until it arrives */
  const lockUntil = useRef(0);
  const fig = useRef<SVGSVGElement>(null);
  const n = td.layers.length;

  // the active layer follows the scroll position: the section nearest the upper third of the box
  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    const secs = [...box.querySelectorAll<HTMLElement>('.td-sec')];
    const pick = () => {
      if (performance.now() < lockUntil.current) return;
      const r = box.getBoundingClientRect();
      // compact: the box scrolls; page mode: the window scrolls
      const top = compact ? r.top : 0;
      const h = compact ? box.clientHeight : window.innerHeight;
      const line = top + h * 0.35;
      let best = 0;
      secs.forEach((s, i) => {
        if (s.getBoundingClientRect().top <= line) best = i;
      });
      // scrolled to the end: the last layer
      const atEnd = compact ? box.scrollTop + box.clientHeight >= box.scrollHeight - 4 : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atEnd) best = secs.length - 1;
      setLayer((l) => (l === best ? l : best));
    };
    pick();
    const target: HTMLElement | Window = compact ? box : window;
    target.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    return () => {
      target.removeEventListener('scroll', pick);
      window.removeEventListener('resize', pick);
    };
  }, [td.id, compact]);

  const go = (i: number) => {
    const box = scroller.current;
    const sec = box?.querySelector<HTMLElement>(`.td-sec[data-layer="${i}"]`);
    if (!sec || !box) return;
    lockUntil.current = performance.now() + 900;
    if (compact) box.scrollTo({ top: sec.offsetTop - 8, behavior: 'smooth' });
    else sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setLayer(i);
  };

  // highlight: every element whose data-part names the focused part
  useIsoLayoutEffect(() => {
    const svg = fig.current;
    if (!svg) return;
    svg.querySelectorAll<SVGElement>('[data-part]').forEach((el) => {
      el.classList.toggle('td-on', !!focus && hasPart(el.getAttribute('data-part'), focus));
    });
    svg.classList.toggle('has-focus', !!focus && !!svg.querySelector('.td-on'));
  }, [focus, layer, td]);

  const onFigOver = (e: React.PointerEvent) => {
    const el = (e.target as Element).closest('[data-part]');
    const p = el?.getAttribute('data-part')?.split(/\s+/)[0] ?? null;
    if (p !== focus) setFocus(p);
  };

  const ctx = useMemo(() => ({ focus, setFocus }), [focus, setFocus]);
  const cur = td.layers[Math.min(layer, n - 1)];

  return (
    <FocusCtx.Provider value={ctx}>
      <div className={`td ${compact ? 'compact' : ''}`} ref={compact ? scroller : undefined}>
        <header className="td-head">
          <div className="td-eyebrow">
            <Icon name="search" size={14} /> {tr('拆开看 · INSIDE', 'INSIDE · TEARDOWN')}
          </div>
          <h2 className="td-title">{td.title}</h2>
          <p className="td-sub">{td.subtitle}</p>
          <nav className="td-stepper" aria-label={tr('图层', 'Layers')}>
            {td.layers.map((l, i) => (
              <button key={l.id} className={i === layer ? 'cur' : i < layer ? 'past' : ''} aria-current={i === layer ? 'step' : undefined} onClick={() => go(i)}>
                <b>{i + 1}</b> {l.short}
              </button>
            ))}
          </nav>
        </header>
        <div className="td-body" ref={compact ? undefined : scroller}>
          <div className="td-text">
            {td.layers.map((l, i) => (
              <LayerSection key={l.id} layer={l} i={i} n={n} active={i === layer} onCalc={onCalc} />
            ))}
            {td.recap && (
              <section className="td-sec td-recap">
                <h3>{tr('一句话记住', 'Remember it in one line')}</h3>
                <InsideMd text={td.recap} />
              </section>
            )}
            {onDone && (
              <div className="td-done">
                <button className="primary big" onClick={onDone}>
                  {doneLabel ?? tr('明白了，去搭电路', 'Got it — build the circuit')} <Icon name="next" />
                </button>
              </div>
            )}
            <div className="td-tail" aria-hidden />
          </div>
          <div className="td-stage">
            <div className="td-stage-inner">
              <div className="td-stage-label" aria-live="polite">
                <b>{layer + 1}</b> · {cur.title}
              </div>
              <svg
                ref={fig}
                viewBox={td.viewBox}
                className={`td-fig layer-${layer}`}
                role="img"
                aria-label={`${td.title}: ${cur.title}`}
                onPointerOver={onFigOver}
                onPointerLeave={() => setFocus(null)}
              >
                {td.Figure({ layer })}
                {cur.callouts && <CalloutLayer callouts={cur.callouts} focus={focus} setFocus={setFocus} />}
              </svg>
              <div className="td-stage-nav">
                <button disabled={layer === 0} onClick={() => go(layer - 1)} aria-label={tr('上一层', 'Previous layer')}>
                  <Icon name="prev" />
                </button>
                <span>
                  {tr('第', 'Layer')} {layer + 1} / {n} {tr('层', '')}
                </span>
                <button disabled={layer >= n - 1} onClick={() => go(layer + 1)} aria-label={tr('下一层', 'Next layer')}>
                  <Icon name="next" />
                </button>
              </div>
              <p className="td-hint">
                {tr(
                  '把鼠标放在带下划线的词、表格行或图上：对应的部分会一起亮起来。',
                  'Hover an underlined word, a table row or the picture: the matching part lights up on both sides.',
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </FocusCtx.Provider>
  );
}

/** svg text with X_sub subscripts ("A·v_d", "R_out", "v_in") as tspans */
export function sub(text: string): React.ReactNode {
  const parts = text.split(/([A-Za-zα-ωΑ-Ω·]_[A-Za-z0-9]+)/g);
  return parts.map((p, i) => {
    const m = /^(.*?)([A-Za-zα-ωΑ-Ω])_([A-Za-z0-9]+)$/.exec(p);
    if (!m) return p;
    return (
      <tspan key={i}>
        {m[1]}
        {m[2]}
        <tspan baselineShift="sub" fontSize="0.75em">
          {m[3]}
        </tspan>
      </tspan>
    );
  });
}

/** Show / hide helper for figures: a group visible from layer `from` (and until `to`). */
export const vis = (layer: number, from: number, to = Infinity) => (layer >= from && layer <= to ? 'td-show' : 'td-hide');
