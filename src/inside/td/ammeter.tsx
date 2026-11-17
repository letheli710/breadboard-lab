// Teardown: Ammeter. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'ammeter',
    title: tr('电流表', 'Ammeter'),
    subtitle: tr('分流电阻 + 毫伏表：为什么必须串联', 'a shunt plus a millivoltmeter: why it must go in series'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
