// The small amount of formula layout the theory text needs on top of the symbol rules of
// richRuns (X_sub, dotted phasors): fractions, square roots with a bar, superscripts and
// subscripts on non-letters (∫_{0}^{t}). Markup (only these four, braces may nest):
//   \frac{num}{den}   \sqrt{x}   x^{sup}   ∫_{0}^{t}
// Everything else is plain text with the usual X_sub rules. In JSON the backslash is doubled:
// "\\frac{U_s}{R_1 + R_2}".

import { Fragment, type ReactNode } from 'react';
import { richRuns } from './ProblemSchematic';

export type MathNode =
  | { k: 'text'; t: string }
  | { k: 'frac'; num: MathNode[]; den: MathNode[] }
  | { k: 'sqrt'; x: MathNode[] }
  | { k: 'sup'; x: MathNode[] }
  | { k: 'sub'; x: MathNode[] };

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
const SYMBOL_END = /(?:[A-Za-zα-ωΑ-Ω\u0130]|\u0307)$/;

/** Parse the formula markup; unmatched or unknown markup stays text. */
export function mathNodes(s: string): MathNode[] {
  const out: MathNode[] = [];
  let text = '';
  const flush = () => {
    if (text) out.push({ k: 'text', t: text });
    text = '';
  };
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    const cmd = /^\\(frac|sqrt)\{/.exec(rest);
    if (cmd) {
      const a0 = i + cmd[0].length - 1;
      const a1 = closeBrace(s, a0);
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

function Runs({ t }: { t: string }) {
  return <>{richRuns(t).map((r, i) => (r.sub ? <sub key={i}>{r.t}</sub> : r.it ? <i key={i}>{r.t}</i> : <Fragment key={i}>{r.t}</Fragment>))}</>;
}

function render(nodes: MathNode[]): ReactNode {
  return nodes.map((n, i) => {
    switch (n.k) {
      case 'text':
        return <Runs key={i} t={n.t} />;
      case 'frac':
        return (
          <span key={i} className="mx-frac">
            <span className="mx-num">{render(n.num)}</span>
            <span className="mx-den">{render(n.den)}</span>
          </span>
        );
      case 'sqrt':
        return (
          <span key={i} className="mx-sqrt">
            √<span className="mx-rad">{render(n.x)}</span>
          </span>
        );
      case 'sup':
        return <sup key={i}>{render(n.x)}</sup>;
      case 'sub':
        return <sub key={i}>{render(n.x)}</sub>;
    }
  });
}

/** Rich text: X_sub symbols plus \frac, \sqrt, ^{…}, _{…} (see mathNodes). */
export function MathText({ text }: { text: string }) {
  return <>{render(mathNodes(text))}</>;
}
