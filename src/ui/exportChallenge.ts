import { FORMAT_ID } from '../core/challenge';
import { getLang, tr } from '../core/i18n';
import { isFloating } from '../core/netlist';
import type { Circuit, Layout } from '../core/types';

/** Turn the current board into a challenge file (target = what's built, solution = this layout). */
export function buildChallengeFromBoard(layout: Layout, circuit: Circuit, id: string, title: string) {
  return {
    format: FORMAT_ID,
    id,
    title,
    kind: 'challenge',
    level: 2,
    summary: '',
    lang: getLang(),
    description: tr('按照电路图在面包板上搭出这个电路。', 'Build this circuit on the breadboard by following the schematic.'),
    components: circuit.components.map((c) => ({ ref: c.ref, type: c.type, ...c.props })),
    nets: circuit.nets.filter((n) => !isFloating(n.name)).map((n) => ({ name: n.name, pins: n.pins })),
    tests: [],
    hints: [],
    solution: {
      parts: layout.parts.map((p) => ({
        type: p.type,
        ref: p.ref,
        pins: p.pins,
        ...(p.type === 'wire' ? { color: p.props.wireColor } : { props: p.props }),
      })),
    },
  };
}

export function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
