// Teardown: Bench supply CV / CC. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'bench-supply',
    title: tr('稳压电源 CV / CC', 'Bench supply CV / CC'),
    subtitle: tr('两个环路：恒压和恒流谁说了算', 'two loops: when constant voltage or constant current rules'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
