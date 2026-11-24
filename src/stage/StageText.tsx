// Inline text of a stage lesson: **bold**, `code`, $TeX$ and [[id,id|term]] (a term linked to
// stage objects: hovering or focusing it lights them, and a lit object lights the term back).
// TeX goes through KaTeX (bundled, so it works offline); should KaTeX reject a formula, the
// app's own formula layout (ui/mathText) draws it, so raw "$" or "\frac" never reaches the page.

import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Fragment, useMemo, type ReactNode } from 'react';
import { MathText } from '../ui/mathText';
import { useLit, useStage } from './stageStore';

const cache = new Map<string, string | null>();

function katexHtml(tex: string, display: boolean): string | null {
  const key = `${display ? 'D' : 'I'}${tex}`;
  if (!cache.has(key)) {
    let html: string | null;
    try {
      html = katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: 'ignore', output: 'htmlAndMathml' });
    } catch {
      html = null;
    }
    cache.set(key, html);
  }
  return cache.get(key)!;
}

/** Plain-text fallback for a formula KaTeX could not lay out. */
function fallbackText(tex: string): string {
  return tex
    .replace(/\\(?:text|mathrm|mathbf)\{([^}]*)\}/g, '$1')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\mu/g, 'μ')
    .replace(/\\pm/g, '±')
    .replace(/\\%/g, '%')
    .replace(/\\[ ,;:]/g, ' ');
}

export function Tex({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(() => katexHtml(tex, display), [tex, display]);
  if (html === null)
    return (
      <span className={display ? 'tex-fallback display' : 'tex-fallback'}>
        <MathText text={fallbackText(tex)} />
      </span>
    );
  return display ? <div className="tex-display" dangerouslySetInnerHTML={{ __html: html }} /> : <span className="tex-inline" dangerouslySetInnerHTML={{ __html: html }} />;
}

type Node = { k: 'text'; t: string } | { k: 'b'; c: Node[] } | { k: 'code'; t: string } | { k: 'tex'; t: string } | { k: 'link'; ids: string[]; c: Node[] };

// order matters: links may hold bold / code / TeX, bold may hold code / TeX
const TOKEN = /\[\[([a-z0-9_,]+)\|(.+?)\]\]|\*\*(.+?)\*\*|`([^`]+)`|\$([^$]+)\$/g;

export function parseInline(s: string): Node[] {
  const out: Node[] = [];
  let last = 0;
  for (const m of s.matchAll(TOKEN)) {
    if (m.index! > last) out.push({ k: 'text', t: s.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ k: 'link', ids: m[1].split(','), c: parseInline(m[2]) });
    else if (m[3] !== undefined) out.push({ k: 'b', c: parseInline(m[3]) });
    else if (m[4] !== undefined) out.push({ k: 'code', t: m[4] });
    else out.push({ k: 'tex', t: m[5] });
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push({ k: 'text', t: s.slice(last) });
  return out;
}

function LinkTerm({ ids, children }: { ids: string[]; children: ReactNode }) {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const on = ids.some((id) => lit.includes(id));
  return (
    <span
      className={`stage-term ${on ? 'lit' : ''}`}
      tabIndex={0}
      data-targets={ids.join(' ')}
      onPointerEnter={() => setHover(ids)}
      onPointerLeave={() => setHover(null)}
      onFocus={() => setHover(ids)}
      onBlur={() => setHover(null)}
    >
      {children}
    </span>
  );
}

function render(nodes: Node[]): ReactNode {
  return nodes.map((n, i) => (
    <Fragment key={i}>
      {n.k === 'text' ? (
        n.t
      ) : n.k === 'b' ? (
        <strong>{render(n.c)}</strong>
      ) : n.k === 'code' ? (
        <code>{n.t}</code>
      ) : n.k === 'tex' ? (
        <Tex tex={n.t} />
      ) : (
        <LinkTerm ids={n.ids}>{render(n.c)}</LinkTerm>
      )}
    </Fragment>
  ));
}

export function StageText({ text }: { text: string }) {
  const nodes = useMemo(() => parseInline(text), [text]);
  return <>{render(nodes)}</>;
}
