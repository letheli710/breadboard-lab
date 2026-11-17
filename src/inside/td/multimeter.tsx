// Teardown: Multimeter (volts). (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'multimeter',
    title: tr('万用表（电压档）', 'Multimeter (volts)'),
    subtitle: tr('10 MΩ 输入电阻、COM、为什么要并联', '10 MΩ input, COM, why it goes in parallel'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
