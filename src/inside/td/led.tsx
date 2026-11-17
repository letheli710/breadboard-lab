// Teardown: LED. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'led',
    title: tr('LED 发光二极管', 'LED'),
    subtitle: tr('两只脚、芯片、PN 结、I–V 曲线、限流电阻', 'legs, die, PN junction, I–V curve, series resistor'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
