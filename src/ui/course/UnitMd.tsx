// Text of learning units and portals: the theory area's markdown subset (paragraphs, "- "/"1. "
// lists, "#" headings, **bold**, `code`, symbol subscripts and \frac / ^{…} formula layout) plus
// "| tables |" (first row = header). See docs/UNIT_FORMAT.md §2.

import type { ReactNode } from 'react';
import { Sym } from '../richText';

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

/** One line of text (no blocks): for labels, questions, choices. */
export const Inline = ({ text }: { text: string }) => <>{inline(text)}</>;

export function UnitMd({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; start: number; items: string[] } | null = null;
  let table: string[][] = [];
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((l, i) => <li key={i}>{inline(l)}</li>);
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
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((r) => !r.every((c) => /^\s*:?-+:?\s*$/.test(c)));
    const [head, ...body] = rows;
    blocks.push(
      <div className="u-table-wrap" key={blocks.length}>
        <table className="cmp u-table">
          <thead>
            <tr>
              {head.map((c, j) => (
                <th key={j} scope="col">
                  {inline(c.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j}>{inline(c.trim())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    table = [];
  };
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    if (line.trimStart().startsWith('|')) {
      flushList();
      table.push(
        line
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|'),
      );
      continue;
    }
    flushTable();
    const ul = /^\s*[-*] (.*)$/.exec(line);
    const ol = /^\s*(\d+)\. (.*)$/.exec(line);
    if (ul || ol) {
      const ordered = !!ol;
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, start: ol ? parseInt(ol[1], 10) : 1, items: [] };
      list.items.push(ul ? ul[1] : ol![2]);
      continue;
    }
    flushList();
    // under a unit layer's h2
    if (line.startsWith('#'))
      blocks.push(
        <h3 key={blocks.length} className="u-title">
          {inline(line.replace(/^#+\s*/, ''))}
        </h3>,
      );
    else if (line.trim()) blocks.push(<p key={blocks.length}>{inline(line)}</p>);
  }
  flushList();
  flushTable();
  return <div className="md u-md">{blocks}</div>;
}
