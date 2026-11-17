// Teardown: Relay. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'relay',
    title: tr('继电器', 'Relay'),
    subtitle: tr('线圈 + 衔铁 + 触点，以及续流二极管', 'coil, armature, contacts, and the flyback diode'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
