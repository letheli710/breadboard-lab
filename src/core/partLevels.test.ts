import { describe, expect, it } from 'vitest';
import { PART_ORDER } from './parts';
import { levelOfWorld, PART_LEVELS } from './partLevels';

describe('toolbox groups by course level', () => {
  it('put every part in exactly one group', () => {
    const all = PART_LEVELS.flatMap((l) => l.items);
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual([...PART_ORDER].sort());
  });
  it('start with the basics and map Worlds to groups', () => {
    expect(PART_LEVELS[0].items.slice(0, 3)).toEqual(['wire', 'resistor', 'capacitor']);
    expect(levelOfWorld(1)).toBe('basic');
    expect(levelOfWorld(3)).toBe('signal');
    expect(levelOfWorld(5)).toBe('mcu');
    expect(levelOfWorld(undefined)).toBe('basic');
  });
});
