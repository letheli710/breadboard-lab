import { FORMAT_ID } from '../core/challenge';
import { getLang, tr } from '../core/i18n';
import { isMcu } from '../core/mcu';
import { isFloating } from '../core/netlist';
import type { Circuit, CompType, Layout, PartProps } from '../core/types';

/** In challenge files a dev board's pin modes are written as "modes" (PartProps.pins inside). */
function asChallengeProps(type: CompType, props: PartProps): Record<string, unknown> {
  if (!isMcu(type)) return { ...props };
  const { pins, ...rest } = props;
  return pins && Object.keys(pins).length ? { ...rest, modes: pins } : rest;
}

/** Turn the current board into a challenge file (target = what's built, solution = this layout). */
export function buildChallengeFromBoard(layout: Layout, circuit: Circuit, id: string, title: string) {
  const boards = new Set(circuit.components.filter((c) => isMcu(c.type)).map((c) => c.ref));
  // scope probes are measuring tools, not part of a target circuit (the parser rejects them there);
  // they stay in the solution layout
  const probes = new Set(circuit.components.filter((c) => c.type === 'scope_probe').map((c) => c.ref));
  const owner = (pin: string) => pin.slice(0, pin.lastIndexOf('.'));
  return {
    format: FORMAT_ID,
    id,
    title,
    kind: 'challenge',
    level: 2,
    summary: '',
    lang: getLang(),
    description: tr('按照电路图在面包板上搭出这个电路。', 'Build this circuit on the breadboard by following the schematic.'),
    components: circuit.components.filter((c) => !probes.has(c.ref)).map((c) => ({ ref: c.ref, type: c.type, ...asChallengeProps(c.type, c.props) })),
    // a dev board's unwired pins each sit on a one-pin net: leave those out
    nets: circuit.nets
      .map((n) => ({ name: n.name, pins: n.pins.filter((p) => !probes.has(owner(p))) }))
      .filter((n) => n.pins.length > 0 && !isFloating(n.name) && !(n.pins.length === 1 && boards.has(owner(n.pins[0])))),
    tests: [],
    hints: [],
    solution: {
      parts: layout.parts.map((p) => ({
        type: p.type,
        ref: p.ref,
        pins: p.pins,
        ...(p.type === 'wire' ? { color: p.props.wireColor } : { props: asChallengeProps(p.type, p.props) }),
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
