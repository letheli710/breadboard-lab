import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from './store';

const s = () => useStore.getState();
const place = (tool: Parameters<ReturnType<typeof s>['setTool']>[0], ...holes: string[]) => {
  s().setTool(tool);
  for (const h of holes) s().clickHole(h);
  s().setTool('select');
  return s().layout.parts[s().layout.parts.length - 1];
};

describe('edit history', () => {
  beforeEach(() => s().loadLayout({ version: 1, parts: [] }, false));

  it('a slider drag is one undo step and keeps the earlier history', () => {
    place('resistor', 'a1', 'a5');
    const pot = place('potentiometer', 'c10');
    const before = s().past.length;
    s().beginEdit();
    for (let i = 0; i <= 100; i++) s().updateProps(pot.id, { wiper: i / 100 });
    expect(s().past.length).toBe(before);
    s().endEdit();
    expect(s().past.length).toBe(before + 1);
    expect(s().layout.parts[1].props.wiper).toBe(1);
    s().undo();
    expect(s().layout.parts[1].props.wiper).toBe(0.5);
    s().undo();
    s().undo();
    expect(s().layout.parts).toHaveLength(0);
  });

  it('a click without movement adds no step; non-slider edits are one step each', () => {
    const r = place('resistor', 'a1', 'a5');
    const n = s().past.length;
    s().beginEdit();
    s().endEdit();
    expect(s().past.length).toBe(n);
    s().updateProps(r.id, { resistance: 1000 });
    s().updateProps(r.id, { resistance: 2200 });
    expect(s().past.length).toBe(n + 2);
  });

  it('redo replays undone steps; a new edit clears redo', () => {
    place('resistor', 'a1', 'a5');
    place('led', 'c1', 'c3');
    s().undo();
    expect(s().layout.parts).toHaveLength(1);
    s().redo();
    expect(s().layout.parts.map((p) => p.type)).toEqual(['resistor', 'led']);
    s().undo();
    s().undo();
    expect(s().future).toHaveLength(2);
    place('diode', 'e1', 'e4');
    expect(s().future).toHaveLength(0);
    s().redo();
    expect(s().layout.parts.map((p) => p.type)).toEqual(['diode']);
  });

  it('pressing a button or flipping a switch does not use up history', () => {
    place('resistor', 'a1', 'a5');
    const b = place('pushbutton', 'e20');
    const sw = place('switch', 'c25');
    const n = s().past.length;
    for (let i = 0; i < 100; i++) s().togglePart(b.id);
    s().togglePart(sw.id);
    s().updateProps(b.id, { pressed: true });
    expect(s().past.length).toBe(n);
    // undoing a build step keeps the current button / switch state
    s().undo();
    expect(s().layout.parts.find((p) => p.id === b.id)?.props.pressed).toBe(true);
    s().redo();
    expect(s().layout.parts.find((p) => p.id === sw.id)?.props.position).toBe('b');
  });

  it('delete shows an undo toast', () => {
    const r = place('resistor', 'a1', 'a5');
    s().removePart(r.id);
    expect(s().layout.parts).toHaveLength(0);
    expect(s().toastUndo).toBe(true);
    s().undo();
    expect(s().layout.parts).toHaveLength(1);
    expect(s().toast).toBeNull();
  });
});
