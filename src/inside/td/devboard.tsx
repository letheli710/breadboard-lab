// Teardown: Dev board GPIO. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'devboard',
    title: tr('开发板 GPIO', 'Dev board GPIO'),
    subtitle: tr('推挽输出级、输入、上下拉、3.3 V 稳压', 'push-pull output stage, inputs, pull-ups, the 3.3 V regulator'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
