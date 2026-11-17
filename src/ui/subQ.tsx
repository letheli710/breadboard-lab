// Subscript Q (U_Q, the operating point) must not read as U_0. Every Q inside a subscript is
// wrapped in class "sub-q", a hook for styling it apart; the UI font (HarmonyOS Sans) draws Q
// with a clear tail even at subscript size, so the class currently needs no style of its own.
// The textbook notation itself is unchanged.

import { Fragment, type ReactNode } from 'react';

/** Subscript text with every "Q" wrapped in <span class="sub-q"> (a <tspan> inside SVG). */
export function subQ(t: string, svg = false): ReactNode {
  if (!t.includes('Q')) return t;
  return t.split(/(Q)/).map((part, i) =>
    part === 'Q' ? (
      svg ? (
        <tspan key={i} className="sub-q">
          Q
        </tspan>
      ) : (
        <span key={i} className="sub-q">
          Q
        </span>
      )
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
