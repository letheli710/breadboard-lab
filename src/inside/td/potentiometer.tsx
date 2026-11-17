// Teardown: Potentiometer. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'potentiometer',
    title: tr('电位器', 'Potentiometer'),
    subtitle: tr('电阻轨道 + 滑动端 = 可调分压器', 'a resistive track plus a wiper = an adjustable divider'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
