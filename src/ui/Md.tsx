import { Fragment, type ReactNode } from 'react';
import { MathText } from './mathText';

// inline formula "$…$" (no space right after the opening "$") or a "$$…$$" formula on its own line
const MATH_INLINE = /(\$[^$\s][^$]*?\$)/g;
const MATH_LINE = /^\$\$(.+)\$\$$/;

/** Tiny markdown subset: paragraphs, "- " lists, "## " headings, **bold**, `code`, tables, ``` blocks.
 *  With `math`, "$…$" is a formula (MathText: X_sub, \frac{}{}, \sqrt{}, ^{}) and a line that is
 *  "$$…$$" is a centred formula; lesson text opts in, the docs shown on the Import page do not
 *  (they mention `$schema`). */
export function Md({ text, math = false }: { text: string; math?: boolean }) {
  const blocks: JSX.Element[] = [];
  let list: string[] = [];
  const formulas = (s: string): ReactNode =>
    math && s.includes('$')
      ? s.split(MATH_INLINE).map((t, i) =>
          i % 2 === 1 ? (
            <span key={i} className="mx">
              <MathText text={t.slice(1, -1)} />
            </span>
          ) : (
            <Fragment key={i}>{t}</Fragment>
          ),
        )
      : s;
  // **bold** may hold `code` and formulas ("**`tp1`**"); code spans are literal
  const inline = (s: string, inBold = false): ReactNode[] =>
    s
      .split(inBold ? /(`[^`]+`)/g : /(\*\*(?:[^*]|\*(?!\*))+?\*\*|`[^`]+`)/g)
      .map((t, i) =>
        !inBold && t.startsWith('**') && t.endsWith('**') && t.length > 4 ? (
          <b key={i}>{inline(t.slice(2, -2), true)}</b>
        ) : t.startsWith('`') && t.endsWith('`') && t.length > 1 ? (
          <code key={i}>{t.slice(1, -1)}</code>
        ) : (
          <Fragment key={i}>{formulas(t)}</Fragment>
        ),
      );
  const flush = () => {
    if (list.length)
      blocks.push(
        <ul key={blocks.length}>
          {list.map((l, i) => (
            <li key={i}>{inline(l)}</li>
          ))}
        </ul>,
      );
    list = [];
  };
  let code: string[] | null = null;
  let table: string[][] = [];
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((r) => !r.every((c) => /^:?-+:?$/.test(c.trim())));
    blocks.push(
      <table key={blocks.length} className="cmp">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => (i === 0 ? <th key={j}>{inline(c.trim())}</th> : <td key={j}>{inline(c.trim())}</td>))}</tr>
          ))}
        </tbody>
      </table>,
    );
    table = [];
  };
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    if (line.trimStart().startsWith('```')) {
      if (code) {
        blocks.push(<pre key={blocks.length}>{code.join('\n')}</pre>);
        code = null;
      } else {
        flush();
        flushTable();
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(raw);
      continue;
    }
    if (line.trimStart().startsWith('|')) {
      flush();
      table.push(
        line
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|'),
      );
      continue;
    }
    flushTable();
    const display = math ? MATH_LINE.exec(line.trim()) : null;
    if (display) {
      flush();
      blocks.push(
        <p key={blocks.length} className="mx-block">
          <MathText text={display[1].trim()} />
        </p>,
      );
    } else if (/^\s*[-*] /.test(line)) list.push(line.replace(/^\s*[-*] /, ''));
    else if (/^\s*\d+\. /.test(line)) list.push(line.replace(/^\s*/, ''));
    else {
      flush();
      if (line.startsWith('#')) blocks.push(<h4 key={blocks.length}>{inline(line.replace(/^#+\s*/, ''))}</h4>);
      else if (line.trim()) blocks.push(<p key={blocks.length}>{inline(line)}</p>);
    }
  }
  flush();
  flushTable();
  if (code) blocks.push(<pre key={blocks.length}>{(code as string[]).join('\n')}</pre>);
  return <div className="md">{blocks}</div>;
}
