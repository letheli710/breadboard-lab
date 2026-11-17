// Teardown: Resistor. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'resistor',
    title: tr('电阻', 'Resistor'),
    subtitle: tr('色环、碳膜螺旋、欧姆定律、额定功率', 'colour bands, the film spiral, Ohm’s law, power rating'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
