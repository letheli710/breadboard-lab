import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Subs } from './StageLessonPage';

const html = (t: string) => renderToStaticMarkup(<Subs text={t} />);

describe('Subs', () => {
  it('turns letter_x and letter_{xy} into subscripts', () => {
    expect(html('v_o(t)')).toBe('v<sub>o</sub>(t)');
    expect(html('R_{Th} 与 I_s')).toBe('R<sub>Th</sub> 与 I<sub>s</sub>');
    expect(html('ω_c')).toBe('ω<sub>c</sub>');
  });
  it('leaves text without subscripts alone', () => {
    expect(html('台式可调直流电源（±9 V）')).toBe('台式可调直流电源（±9 V）');
  });
});
