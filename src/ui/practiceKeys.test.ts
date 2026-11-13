import { describe, expect, it } from 'vitest';
import { neighbours, practiceShortcut } from './practiceKeys';

const key = (k: string, extra: Partial<{ ctrlKey: boolean; metaKey: boolean; altKey: boolean; isComposing: boolean; target: unknown }> = {}) =>
  practiceShortcut({ key: k, ctrlKey: false, metaKey: false, altKey: false, isComposing: false, target: null, ...extra } as Parameters<typeof practiceShortcut>[0]);

describe('practiceShortcut', () => {
  it('maps [ ] ? (and the full-width keys of a Chinese input method)', () => {
    expect(key('[')).toBe('prev');
    expect(key(']')).toBe('next');
    expect(key('【')).toBe('prev');
    expect(key('】')).toBe('next');
    expect(key('?')).toBe('help');
    expect(key('？')).toBe('help');
    expect(key('n')).toBeNull();
  });
  it('ignores keys typed into a field and modified keys', () => {
    expect(key(']', { target: { tagName: 'INPUT' } })).toBeNull();
    expect(key('[', { target: { tagName: 'TEXTAREA' } })).toBeNull();
    expect(key('[', { target: { tagName: 'SELECT' } })).toBeNull();
    expect(key('?', { target: { tagName: 'DIV', isContentEditable: true } })).toBeNull();
    expect(key(']', { target: { tagName: 'BUTTON' } })).toBe('next');
    expect(key(']', { ctrlKey: true })).toBeNull();
    expect(key(']', { metaKey: true })).toBeNull();
    expect(key(']', { altKey: true })).toBeNull();
    expect(key('】', { isComposing: true })).toBeNull();
  });
});

describe('neighbours', () => {
  const list = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
  it('prev is the one before; next skips finished ones', () => {
    const done = new Set(['c']);
    expect(neighbours(list, 'b', (p) => done.has(p.id))).toEqual({ i: 1, prev: { id: 'a' }, next: { id: 'd' } });
  });
  it('next falls back to the plain next one when the rest are finished', () => {
    expect(neighbours(list, 'b', () => true).next).toEqual({ id: 'c' });
  });
  it('ends of the list', () => {
    expect(neighbours(list, 'a', () => false).prev).toBeNull();
    expect(neighbours(list, 'd', () => false).next).toBeNull();
  });
});
