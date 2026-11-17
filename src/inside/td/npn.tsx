// Teardown: NPN transistor. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'npn',
    title: tr('NPN 三极管', 'NPN transistor'),
    subtitle: tr('三层半导体、I_C = βI_B、饱和开关', 'three layers, I_C = βI_B, the saturated switch'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
