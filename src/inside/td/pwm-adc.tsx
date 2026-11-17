// Teardown: PWM and ADC. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'pwm-adc',
    title: tr('PWM 与 ADC', 'PWM and ADC'),
    subtitle: tr('占空比 → 平均值；电压 → 数字码', 'duty cycle → average; voltage → a number'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
