import { Fragment } from 'react';

/** Tiny markdown subset: paragraphs, "- " lists, "## " headings, **bold**, `code`. */
export function Md({ text }: { text: string }) {
  const blocks: JSX.Element[] = [];
  let list: string[] = [];
  const inline = (s: string) =>
    s
      .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
      .map((t, i) => (t.startsWith('**') ? <b key={i}>{t.slice(2, -2)}</b> : t.startsWith('`') ? <code key={i}>{t.slice(1, -1)}</code> : <Fragment key={i}>{t}</Fragment>));
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
    if (/^\s*[-*] /.test(line)) list.push(line.replace(/^\s*[-*] /, ''));
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
