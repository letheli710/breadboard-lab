// Phase 5 parts in the auto-drawn schematic: every new type lays out with finite coordinates
// and renders, including dev boards whose pins are logical roles (challenge targets).

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PARTS } from '../core/parts';
import { buildNetlist } from '../core/netlist';
import { layoutSchematic } from '../core/schematic';
import { simulate } from '../core/solver';
import type { Circuit, Layout, PartType, PlacedPart } from '../core/types';
import { SchematicView } from './SchematicView';

const finite = (c: Circuit) => {
  const s = layoutSchematic(c, simulate(c));
  for (const e of s.elements) {
    expect([e.x, e.y].every(Number.isFinite)).toBe(true);
    for (const l of e.leads) expect([l.x1, l.y1, l.x2, l.y2].every(Number.isFinite)).toBe(true);
  }
  for (const b of s.buses) expect(Number.isFinite(b.y)).toBe(true);
  return s;
};

let n = 0;
const part = (type: PartType, anchor: string | [string, string], props = {}): PlacedPart => {
  const def = PARTS[type];
  const pins = def.placement.kind === 'footprint' ? def.placement.footprint(anchor as string)! : { [def.placement.pins[0]]: (anchor as string[])[0], [def.placement.pins[1]]: (anchor as string[])[1] };
  expect(pins).toBeTruthy();
  return { id: `p${n++}`, ref: `${def.refPrefix}${n}`, type, props: { ...def.defaults, ...props }, pins };
};

describe('schematic: phase 5 parts', () => {
  it('board with every device lays out and renders', () => {
    const layout: Layout = {
      version: 1,
      parts: [
        part('esp32_devkit', 'b2', { pins: { GPIO23: { mode: 'out_high' }, GPIO32: { mode: 'adc' } } }),
        part('npn', 'f24'),
        part('nmos', 'g26'),
        part('relay', 'e22'),
        part('ldo', 'a26'),
        part('motor', ['j22', 'j23']),
        part('buzzer', ['a22', 'a24']),
        part('ldr', ['j25', 'j27']),
        part('ntc', ['j28', 'j30']),
        part('wire', ['a3', 'a24']),
        part('wire', ['a4', 'g24']),
      ],
    };
    const nl = buildNetlist(layout);
    const s = finite(nl.circuit);
    // unwired board pins get no bus of their own
    expect(s.buses.length).toBeLessThan(25);
    const board = s.elements.find((e) => e.comp.type === 'esp32_devkit')!;
    expect(board.box).toBeTruthy();
    expect(board.labels!.some((l) => l.text === 'GPIO23')).toBe(true);
    expect(s.elements.filter((e) => e.comp.type === 'relay').map((e) => e.sub)).toEqual(['coil', 'contact']);
    const html = renderToStaticMarkup(<SchematicView circuit={nl.circuit} sim={simulate(nl.circuit)} />);
    expect(html).toContain('GPIO23');
  });

  it('generic mcu with logical role pins (challenge target)', () => {
    const c: Circuit = {
      components: [
        { ref: 'U1', type: 'mcu', props: { pins: { GPIO_OUT1: { mode: 'out_high' } } } },
        { ref: 'R1', type: 'resistor', props: { resistance: 330 } },
        { ref: 'D1', type: 'led', props: { color: 'red' } },
        { ref: 'Q1', type: 'npn', props: {} },
      ],
      nets: [
        { name: 'N1', pins: ['U1.GPIO_OUT1', 'R1.1'] },
        { name: 'N2', pins: ['R1.2', 'Q1.b'] },
        { name: 'N3', pins: ['U1.5V', 'D1.anode'] },
        { name: 'N4', pins: ['D1.cathode', 'Q1.c'] },
        { name: 'GND', pins: ['U1.GND', 'Q1.e'] },
      ],
    };
    const s = finite(c);
    expect(s.elements[0].labels!.map((l) => l.text)).toContain('GPIO_OUT1');
    expect(s.buses.find((b) => b.isGround)?.net).toBe('GND');
    expect(() => renderToStaticMarkup(<SchematicView circuit={c} sim={simulate(c)} />)).not.toThrow();
  });
});
