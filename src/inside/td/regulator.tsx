// Teardown: Regulator / power module. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'regulator',
    title: tr('稳压器 / 电源模块', 'Regulator / power module'),
    subtitle: tr('LDO 内部：调整管 + 误差放大器 + 压差', 'inside an LDO: pass transistor, error amp, dropout'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
