// In the UI font (Barlow) a capital Q at subscript size differs from the digit 0 only by a
// one-pixel tick, so U_Q (operating point) reads as U_0. Inside subscripts the letter Q is
// therefore drawn in a fallback font whose Q has a clear tail (class "sub-q", see styles.css);
// the textbook notation itself is unchanged.

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
