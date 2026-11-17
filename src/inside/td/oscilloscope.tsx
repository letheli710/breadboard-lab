// Teardown: Oscilloscope. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'oscilloscope',
    title: tr('示波器', 'Oscilloscope'),
    subtitle: tr('衰减、采样、触发、伏/格和时间/格', 'attenuator, sampling, trigger, V/div and time/div'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
