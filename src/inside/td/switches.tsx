// Teardown: Push button & slide switch. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'switches',
    title: tr('按键与拨动开关', 'Push button & slide switch'),
    subtitle: tr('四只脚里哪两只是一体的', 'which of the four legs are joined inside'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
