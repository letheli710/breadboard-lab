import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatRoute, modeOf, pageOf, parseRoute, startRoute, type Route } from './router';

describe('routes', () => {
  const routes: Route[] = [
    { page: 'learn' },
    { page: 'learn', id: 'lesson-01-led' },
    { page: 'challenges', id: 'exp3-rl-square' },
    { page: 'challenges' },
    { page: 'practice', id: 'opamp-02-noninverting-amp' },
    { page: 'practice' },
    { page: 'practice', summary: 'first-order' },
    { page: 'practice', summary: 'basics', section: 'idea-kcl' },
    { page: 'sandbox' },
    { page: 'guide' },
    { page: 'guide', section: 'ground' },
    { page: 'import' },
    // ids with characters that need encoding survive the round trip
    { page: 'challenges', id: '我的 题目/1?x#y' },
  ];

  it('format → parse round-trips', () => {
    for (const r of routes) expect(parseRoute(formatRoute(r))).toEqual(r);
  });

  it('formats the documented scheme', () => {
    expect(formatRoute({ page: 'learn', id: 'a-b' })).toBe('#/learn/a-b');
    expect(formatRoute({ page: 'challenges' })).toBe('#/challenges');
    expect(formatRoute({ page: 'guide', section: 'led' })).toBe('#/guide/led');
    expect(formatRoute({ page: 'sandbox' })).toBe('#/sandbox');
  });

  it('formats and parses chapter key-points routes', () => {
    expect(formatRoute({ page: 'practice', summary: 'three-phase' })).toBe('#/practice/summary/three-phase');
    expect(formatRoute({ page: 'practice', summary: 'basics', section: 'formulas' })).toBe('#/practice/summary/basics/formulas');
    expect(parseRoute('#/practice/summary/basics/idea-kcl/extra')).toEqual({ page: 'practice', summary: 'basics', section: 'idea-kcl' });
    // no chapter: just the Practice page
    expect(parseRoute('#/practice/summary')).toEqual({ page: 'practice' });
    expect(parseRoute('#/practice/summary/')).toEqual({ page: 'practice' });
  });

  it('accepts loose forms', () => {
    expect(parseRoute('#/learn/x/')).toEqual({ page: 'learn', id: 'x' });
    expect(parseRoute('learn/x')).toEqual({ page: 'learn', id: 'x' });
    expect(parseRoute('#/Practice')).toEqual({ page: 'practice' });
    expect(parseRoute('#/sandbox/whatever')).toEqual({ page: 'sandbox' });
    expect(parseRoute('#/learn/x?utm=1')).toEqual({ page: 'learn', id: 'x' });
  });

  it('rejects empty and unknown routes', () => {
    expect(parseRoute('')).toBeNull();
    expect(parseRoute('#')).toBeNull();
    expect(parseRoute('#/')).toBeNull();
    expect(parseRoute('#/nowhere/1')).toBeNull();
    // malformed escape: the page still opens, without an item
    expect(parseRoute('#/learn/%E0%A4%A')).toEqual({ page: 'learn' });
  });

  it('maps pages to store modes and back', () => {
    for (const r of routes) expect(pageOf(modeOf(r))).toBe(r.page);
    expect(modeOf({ page: 'challenges' })).toBe('challenge');
  });

  it('starts from the URL, else the remembered location, else Learn', () => {
    expect(startRoute('#/practice/p1')).toEqual({ route: { page: 'practice', id: 'p1' }, fromUrl: true, badUrl: false });
    // no storage in this test environment: a first-time visitor
    expect(startRoute('')).toEqual({ route: { page: 'learn' }, fromUrl: false, badUrl: false });
    expect(startRoute('#/bogus')).toEqual({ route: { page: 'learn' }, fromUrl: false, badUrl: true });
  });
});

class MemStorage {
  m = new Map<string, string>();
  get length() {
    return this.m.size;
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, String(v));
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}

describe('remembered location', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('is used when the URL names no page, and the store starts on that page', async () => {
    const ls = new MemStorage();
    vi.stubGlobal('localStorage', ls);
    vi.resetModules();
    const r = await import('./router');
    r.writeLastRoute({ page: 'practice', id: 'p 1' });
    expect(ls.getItem('bb.route')).toBe(JSON.stringify('#/practice/p%201'));
    expect(r.startRoute('')).toEqual({ route: { page: 'practice', id: 'p 1' }, fromUrl: false, badUrl: false });
    // the URL wins over the remembered location
    expect(r.startRoute('#/guide').route).toEqual({ page: 'guide' });
    vi.stubGlobal('location', { hash: '' });
    const { useStore } = await import('./store');
    expect(useStore.getState().mode).toBe('practice');
  });

  it('a corrupt remembered value is discarded (first-visit fallback)', async () => {
    const ls = new MemStorage();
    ls.setItem('bb.route', JSON.stringify('#/nowhere'));
    vi.stubGlobal('localStorage', ls);
    vi.resetModules();
    const r = await import('./router');
    expect(r.readLastRoute()).toBeNull();
    expect(ls.getItem('bb.route')).toBeNull();
    ls.setItem('bb.route', '{oops');
    expect(r.startRoute('').route).toEqual({ page: 'learn' });
  });
});
