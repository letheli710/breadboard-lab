// Teardown: N-MOSFET. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'mosfet',
    title: tr('N-MOSFET', 'N-MOSFET'),
    subtitle: tr('栅极电场开沟道、V_GS(th)、R_DS(on)', 'the gate field opens a channel, V_GS(th), R_DS(on)'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
