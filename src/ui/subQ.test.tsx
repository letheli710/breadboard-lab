import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MathText } from './mathText';
import { subQ } from './subQ';

describe('subscript Q legibility', () => {
  it('wraps Q in subscripts, leaves digits and other letters alone', () => {
    expect(renderToStaticMarkup(<MathText text="U_Q, I_{Q}, U_0, Q, U_1m" />)).toBe(
      '<i>U</i><sub><span class="sub-q">Q</span></sub>, <i>I</i><sub><span class="sub-q">Q</span></sub>, <i>U</i><sub>0</sub>, Q, <i>U</i><sub>1m</sub>',
    );
  });
  it('handles Q inside a mathText _{…} subscript and in SVG', () => {
    expect(renderToStaticMarkup(<MathText text="∫_{Q}" />)).toMatch(/<sub>(<i>)?<span class="sub-q">Q<\/span>/);
    expect(renderToStaticMarkup(<svg>{subQ('Q2', true)}</svg>)).toBe('<svg><tspan class="sub-q">Q</tspan>2</svg>');
  });
});
