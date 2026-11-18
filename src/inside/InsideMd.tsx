// The markdown subset of src/ui/Md.tsx plus two inline tokens for teardowns and calc cards:
//   [[part|words]]  words linked to a part of the figure (hover / focus highlights it)
//   $…$             an inline formula in MathText markup (\frac{}{}, \sqrt{}, X_sub, ^{…})
// Lines starting with "$$" and ending with "$$" are a display formula on their own line.

import { Fragment, type ReactNode } from 'react';
import { MathText } from '../ui/mathText';
import { useFocusPart } from './focus';

function Term({ part, children }: { part: string; children: ReactNode }) {
  const { focus, setFocus } = useFocusPart();
  return (
    <span
      className={`td-term ${focus === part ? 'on' : ''}`}
      tabIndex={0}
      data-term={part}
      onMouseEnter={() => setFocus(part)}
      onMouseLeave={() => setFocus(null)}
      onFocus={() => setFocus(part)}
      onBlur={() => setFocus(null)}
      onClick={() => setFocus(part)}
    >
      {children}
    </span>
  );
}

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[\[[^\]|]+\|[^\]]+\]\]|\$[^$]+\$)/g;

export function inline(s: string, key = 0): ReactNode[] {
  return s.split(TOKEN).map((t, i) => {
    const k = `${key}-${i}`;
    if (t.startsWith('**') && t.endsWith('**') && t.length > 4) return <b key={k}>{inline(t.slice(2, -2), i + 100)}</b>;
    if (t.startsWith('`') && t.endsWith('`') && t.length > 2) return <code key={k}>{t.slice(1, -1)}</code>;
    if (t.startsWith('[[') && t.endsWith(']]')) {
      const [part, words] = t.slice(2, -2).split('|');
      return (
        <Term key={k} part={part.trim()}>
          {inline(words, i + 200)}
        </Term>
      );
    }
    if (t.startsWith('$') && t.endsWith('$') && t.length > 2)
      return (
        <span key={k} className="td-math">
          <MathText text={t.slice(1, -1)} />
        </span>
      );
    return <Fragment key={k}>{plain(t, k)}</Fragment>;
  });
}

// symbols like R_in, v_{out}, U_s in plain text get a real subscript
const SYM = /([A-Za-zα-ωΑ-Ω]_(?:\{[^}]+\}|[A-Za-z0-9]+))/g;
function plain(t: string, key: string): ReactNode[] {
  return t.split(SYM).map((p, i) =>
    i % 2 ? (
      <span key={`${key}-s${i}`} className="td-math">
        <MathText text={p} />
      </span>
    ) : (
      <Fragment key={`${key}-p${i}`}>{p}</Fragment>
    ),
  );
}

export function InsideMd({ text }: { text: string }) {
  const blocks: JSX.Element[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let table: string[][] = [];
  const flushList = () => {
    if (list) {
      const items = list.items.map((l, i) => <li key={i}>{inline(l)}</li>);
      blocks.push(list.ordered ? <ol key={blocks.length}>{items}</ol> : <ul key={blocks.length}>{items}</ul>);
    }
    list = null;
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((r) => !r.every((c) => /^:?-+:?$/.test(c.trim())));
    blocks.push(
      <div className="td-table-wrap" key={blocks.length}>
        <table className="cmp td-table">
          <thead>
            <tr>
              {rows[0].map((c, j) => (
                <th key={j}>{inline(c.trim())}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((r, i) => (
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
    const t = line.trim();
    if (t.startsWith('$$') && t.endsWith('$$') && t.length > 4) {
      flushList();
      blocks.push(
        <div className="td-display" key={blocks.length}>
          <MathText text={t.slice(2, -2).trim()} />
        </div>,
      );
      continue;
    }
    const ul = /^\s*[-*] (.*)$/.exec(line);
    const ol = /^\s*\d+[.)] (.*)$/.exec(line);
    if (ul || ol) {
      const ordered = !!ol;
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((ul ?? ol)![1]);
      continue;
    }
    flushList();
    if (t.startsWith('>')) blocks.push(<blockquote key={blocks.length}>{inline(t.replace(/^>\s*/, ''))}</blockquote>);
    else if (t.startsWith('#')) blocks.push(<h4 key={blocks.length}>{inline(t.replace(/^#+\s*/, ''))}</h4>);
    else if (t) blocks.push(<p key={blocks.length}>{inline(t)}</p>);
  }
  flushList();
  flushTable();
  return <div className="md td-md">{blocks}</div>;
}
