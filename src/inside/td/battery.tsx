// Teardown: Battery. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'battery',
    title: tr('电池', 'Battery'),
    subtitle: tr('化学电动势 + 内阻：为什么带载电压会掉', 'EMF plus internal resistance: why the voltage sags under load'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
