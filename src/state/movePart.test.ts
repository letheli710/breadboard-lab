import { beforeEach, describe, expect, it } from 'vitest';
import { PARTS } from '../core/parts';
import { moveError, useStore } from './store';

const s = () => useStore.getState();

describe('movePart', () => {
  beforeEach(() => {
    s().loadLayout({ version: 1, parts: [] }, false);
  });
  const place = (tool: Parameters<ReturnType<typeof s>['setTool']>[0], ...holes: string[]) => {
    s().setTool(tool);
    for (const h of holes) s().clickHole(h);
    s().setTool('select');
    return s().layout.parts[s().layout.parts.length - 1];
  };

  it('moves a two-point part as one undo step', () => {
    const r = place('resistor', 'a1', 'a5');
    const past = s().past.length;
    expect(s().movePart(r.id, { '1': 'b10', '2': 'b14' })).toBe(true);
    expect(s().layout.parts[0].pins).toEqual({ '1': 'b10', '2': 'b14' });
    expect(s().past.length).toBe(past + 1);
    s().undo();
    expect(s().layout.parts[0].pins).toEqual({ '1': 'a1', '2': 'a5' });
  });

  it('rejects occupied holes, bad holes and broken footprints', () => {
    const r = place('resistor', 'a1', 'a5');
    place('led', 'c1', 'c3');
    const before = s().layout;
    expect(s().movePart(r.id, { '1': 'c1', '2': 'c9' })).toBe(false);
    expect(s().movePart(r.id, { '1': 'zz1', '2': 'c9' })).toBe(false);
    expect(s().movePart(r.id, { '1': 'c9', '2': 'c9' })).toBe(false);
    expect(s().layout).toBe(before);
    // moving onto its own old holes is fine
    expect(moveError(s().layout, r.id, { '1': 'a5', '2': 'a1' })).toBeNull();

    const btn = place('pushbutton', 'e20');
    const fp = (PARTS.pushbutton.placement as { footprint: (a: string) => Record<string, string> | null }).footprint;
    expect(s().movePart(btn.id, fp('e25')!)).toBe(true);
    const skewed = { ...fp('e10')!, [Object.keys(fp('e10')!)[0]]: 'a29' };
    expect(moveError(s().layout, btn.id, skewed)).not.toBeNull();
  });
});
