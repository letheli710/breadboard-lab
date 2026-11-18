// The parts toolbox grouped by how far into the course you need them (docs/REBUILD_PLAN.md):
// basics first (World 1), then signals and op-amps (Worlds 2–4), then microcontrollers and
// devices (World 5). Every part type is in exactly one group (partLevels.test.ts).

import { tr } from './i18n';
import type { PartType } from './types';

export type PartLevelId = 'basic' | 'signal' | 'mcu';

export interface PartLevel {
  id: PartLevelId;
  title: () => string;
  /** the Worlds of the course map whose lessons mostly use this group */
  worlds: number[];
  items: PartType[];
}

export const PART_LEVELS: PartLevel[] = [
  {
    id: 'basic',
    title: () => tr('基础 · World 1', 'Basics · World 1'),
    worlds: [1, 2],
    items: ['wire', 'resistor', 'capacitor', 'led', 'battery', 'power_module', 'bench_supply', 'pushbutton', 'switch', 'potentiometer', 'ammeter'],
  },
  {
    id: 'signal',
    title: () => tr('信号与 op-amp · World 2–4', 'Signals & op-amps · World 2–4'),
    worlds: [3, 4, 5, 7],
    items: ['opamp', 'function_gen', 'scope_probe', 'inductor', 'diode'],
  },
  {
    id: 'mcu',
    title: () => tr('单片机与器件 · World 5', 'MCU & devices · World 5'),
    worlds: [6, 8],
    items: ['esp32_devkit', 'stm32_bluepill', 'npn', 'nmos', 'relay', 'motor', 'buzzer', 'ldo', 'ldr', 'ntc'],
  },
];

/** The group a World's lessons mostly draw from (World 1 / unknown: the basics). */
export const levelOfWorld = (world: number | undefined): PartLevelId => PART_LEVELS.find((l) => world !== undefined && l.worlds.includes(world))?.id ?? 'basic';
