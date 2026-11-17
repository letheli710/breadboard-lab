// Teardown: Inductor. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'inductor',
    title: tr('电感', 'Inductor'),
    subtitle: tr('线圈、磁通、u = L di/dt、断电尖峰', 'a coil, flux, u = L di/dt, the turn-off spike'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
