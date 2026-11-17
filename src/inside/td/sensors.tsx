// Teardown: LDR and NTC. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'sensors',
    title: tr('光敏电阻与热敏电阻', 'LDR and NTC'),
    subtitle: tr('电阻随光 / 温度变，接成分压器去读', 'resistance that follows light / heat, read through a divider'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
