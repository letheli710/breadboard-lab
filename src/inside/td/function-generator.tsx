// Teardown: Function generator. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'function-generator',
    title: tr('信号发生器', 'Function generator'),
    subtitle: tr('理想电压源 + 50 Ω 内阻、幅度 / 偏置', 'an ideal source plus 50 Ω, amplitude / offset'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
