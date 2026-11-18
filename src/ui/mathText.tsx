// The small amount of formula layout the theory text needs on top of the symbol rules of
// richRuns (X_sub, dotted phasors): fractions, square roots with a bar, superscripts and
// subscripts on non-letters (∫_{0}^{t}) and matrices. Markup (only these, braces may nest):
//   \frac{num}{den}   \sqrt{x}   x^{sup}   ∫_{0}^{t}   \mat{a & b ; c & d}
// In \mat{…} cells are separated by "&" and rows by ";" (at brace depth 0).
// Everything else is plain text with the usual X_sub rules. In JSON the backslash is doubled:
// "\\frac{U_s}{R_1 + R_2}".

import { Fragment, type ReactNode } from 'react';
import { richRuns } from './richRuns';
import { subQ } from './subQ';

export type MathNode =
  | { k: 'text'; t: string }
  | { k: 'frac'; num: MathNode[]; den: MathNode[] }
  | { k: 'sqrt'; x: MathNode[] }
  | { k: 'sup'; x: MathNode[] }
  | { k: 'sub'; x: MathNode[] }
  | { k: 'mat'; rows: MathNode[][][] };

/** Split at `sep` characters that are not inside braces. */
function splitTop(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') depth--;
    else if (s[i] === sep && depth === 0) {
      out.push(s.slice(start, i));
      start = i + 1;
    }
  }
  out.push(s.slice(start));
  return out;
}

/** Index just past the "}" matching the "{" at `open`, or -1. */
function closeBrace(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}' && --depth === 0) return i + 1;
  }
  return -1;
}

// a "_" after one of these belongs to richRuns' X_sub rule
const SYMBOL_END = /(?:[A-Za-zα-ωΑ-Ω\u0130ûîÛÎ]|[\u0307\u0302\u0304])$/;

// common TeX words written in lesson text, shown as the character they stand for
const WORDS: Record<string, string> = {
  approx: '≈',
  times: '×',
  cdot: '·',
  parallel: '∥',
  dots: '…',
  quad: '\u2003',
  qquad: '\u2003\u2003',
  le: '≤',
  ge: '≥',
  ne: '≠',
  pm: '±',
  infty: '∞',
  to: '→',
  angle: '∠',
  circ: '°',
  Omega: 'Ω',
  omega: 'ω',
  pi: 'π',
  mu: 'µ',
  Delta: 'Δ',
  tau: 'τ',
  phi: 'φ',
  theta: 'θ',
  left: '',
  right: '',
};

/** \text{…} → its text, "\ " → a space, \approx and friends → their character. */
export function texWords(s: string): string {
  return (
    s
      .replace(/\\text\{([^{}]*)\}/g, '$1')
      .replace(/\\ /g, ' ')
      // TeX spacing commands are a thin space
      .replace(/\\[,;:]/g, '\u2009')
      .replace(/\\([A-Za-z]+)(?![A-Za-z])/g, (m, w: string) => (w in WORDS ? WORDS[w] : m))
  );
}

/** Parse the formula markup; unmatched or unknown markup stays text. */
export function mathNodes(src: string): MathNode[] {
  const s = texWords(src);
  const out: MathNode[] = [];
  let text = '';
  const flush = () => {
    if (text) out.push({ k: 'text', t: text });
    text = '';
  };
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    const cmd = /^\\(frac|sqrt|mat)\{/.exec(rest);
    if (cmd) {
      const a0 = i + cmd[0].length - 1;
      const a1 = closeBrace(s, a0);
      if (a1 > 0 && cmd[1] === 'mat') {
        flush();
        const rows = splitTop(s.slice(a0 + 1, a1 - 1), ';').map((r) => splitTop(r, '&').map((c) => mathNodes(c.trim())));
        out.push({ k: 'mat', rows });
        i = a1;
        continue;
      }
      if (a1 > 0 && cmd[1] === 'sqrt') {
        flush();
        out.push({ k: 'sqrt', x: mathNodes(s.slice(a0 + 1, a1 - 1)) });
        i = a1;
        continue;
      }
      if (a1 > 0 && s[a1] === '{') {
        const b1 = closeBrace(s, a1);
        if (b1 > 0) {
          flush();
          out.push({ k: 'frac', num: mathNodes(s.slice(a0 + 1, a1 - 1)), den: mathNodes(s.slice(a1 + 1, b1 - 1)) });
          i = b1;
          continue;
        }
      }
    }
    if ((s[i] === '^' || (s[i] === '_' && !SYMBOL_END.test(text))) && s[i + 1] === '{') {
      const e = closeBrace(s, i + 1);
      if (e > 0) {
        flush();
        out.push({ k: s[i] === '^' ? 'sup' : 'sub', x: mathNodes(s.slice(i + 2, e - 1)) });
        i = e;
        continue;
      }
    }
    text += s[i];
    i++;
  }
  flush();
  return out;
}

function Runs({ t, inSub }: { t: string; inSub: boolean }) {
  return (
    <>
      {richRuns(t).map((r, i) =>
        r.sub ? <sub key={i}>{subQ(r.t)}</sub> : r.it ? <i key={i}>{inSub ? subQ(r.t) : r.t}</i> : <Fragment key={i}>{inSub ? subQ(r.t) : r.t}</Fragment>,
      )}
    </>
  );
}

function render(nodes: MathNode[], inSub = false): ReactNode {
  return nodes.map((n, i) => {
    switch (n.k) {
      case 'text':
        return <Runs key={i} t={n.t} inSub={inSub} />;
      case 'frac':
        return (
          <span key={i} className="mx-frac">
            <span className="mx-num">{render(n.num, inSub)}</span>
            <span className="mx-den">{render(n.den, inSub)}</span>
          </span>
        );
      case 'sqrt':
        return (
          <span key={i} className="mx-sqrt">
            √<span className="mx-rad">{render(n.x, inSub)}</span>
          </span>
        );
      case 'sup':
        return <sup key={i}>{render(n.x)}</sup>;
      case 'sub':
        return <sub key={i}>{render(n.x, true)}</sub>;
      case 'mat': {
        const cols = Math.max(...n.rows.map((r) => r.length));
        return (
          <span key={i} className="mx-mat-wrap">
            <span className="mx-mat" role="table">
              <span className="mx-mat-grid" style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}>
                {n.rows.flatMap((r, ri) => Array.from({ length: cols }, (_, ci) => <span key={`${ri}-${ci}`}>{r[ci] ? render(r[ci], inSub) : null}</span>))}
              </span>
            </span>
          </span>
        );
      }
    }
  });
}

/** Rich text: X_sub symbols plus \frac, \sqrt, \mat, ^{…}, _{…} (see mathNodes). */
export function MathText({ text }: { text: string }) {
  return <>{render(mathNodes(text))}</>;
}
