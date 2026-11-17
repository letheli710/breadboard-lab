// Teardown: Diode. (placeholder until written — see docs/INSIDE.md)

import { tr } from '../../core/i18n';
import type { Teardown } from '../types';

export default function build(): Teardown {
  return {
    id: 'diode',
    title: tr('二极管', 'Diode'),
    subtitle: tr('PN 结、单向导电、正向压降、反接保护', 'PN junction, one-way conduction, forward drop, reverse protection'),
    viewBox: '0 0 560 440',
    Figure: () => null,
    layers: [{ id: 'soon', short: tr('即将', 'Soon'), title: tr('正在编写', 'Being written'), body: tr('这个拆解还在编写中。', 'This teardown is being written.') }],
  };
}
