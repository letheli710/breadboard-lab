// Rich text of the theory area (problems, key-points pages): a markdown subset plus textbook
// symbols (X_sub, dotted phasors — richRuns) and formula layout (\frac, \sqrt, ^{…} — mathText).

import type { ReactNode } from 'react';
import { MathText } from './mathText';

/** Text with textbook symbols: "u_C(0+)" → u with subscript C (same rules as the drawing). */
export function Sym({ text }: { text: string }) {
  return <MathText text={text} />;
}

/** Markdown subset of the app's Md renderer (paragraphs, "- "/"1. " lists, "#" headings, **bold**,
 *  `code`) plus symbol subscripts, for problem text. */
export function PrMd({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((t, i) =>
      t.startsWith('**') && t.endsWith('**') && t.length > 4 ? (
        <b key={i}>
          <Sym text={t.slice(2, -2)} />
        </b>
      ) : t.startsWith('`') && t.endsWith('`') && t.length > 1 ? (
        <code key={i}>{t.slice(1, -1)}</code>
      ) : (
        <Sym key={i} text={t} />
      ),
    );
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; start: number; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const items = list.items.map((l, i) => <li key={i}>{inline(l)}</li>);
    // "4." after a bullet list keeps its number
    blocks.push(
      list.ordered ? (
        <ol key={blocks.length} start={list.start !== 1 ? list.start : undefined}>
          {items}
        </ol>
      ) : (
        <ul key={blocks.length}>{items}</ul>
      ),
    );
    list = null;
  };
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    const ul = /^\s*[-*] (.*)$/.exec(line);
    const ol = /^\s*(\d+)\. (.*)$/.exec(line);
    if (ul || ol) {
      const ordered = !!ol;
      if (list && list.ordered !== ordered) flush();
      if (!list) list = { ordered, start: ol ? parseInt(ol[1], 10) : 1, items: [] };
      list.items.push(ul ? ul[1] : ol![2]);
      continue;
    }
    flush();
    if (line.startsWith('#')) blocks.push(<h4 key={blocks.length}>{inline(line.replace(/^#+\s*/, ''))}</h4>);
    else if (line.trim()) blocks.push(<p key={blocks.length}>{inline(line)}</p>);
  }
  flush();
  return <div className="md">{blocks}</div>;
}
