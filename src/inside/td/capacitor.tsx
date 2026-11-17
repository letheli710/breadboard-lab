// Teardown: Capacitor. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'capacitor',
    title: tr('电容', 'Capacitor'),
    subtitle: tr('两块极板、q = Cu、i = C du/dt、充放电', 'two plates, q = Cu, i = C du/dt, charging'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
