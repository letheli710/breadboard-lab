// URL routes (hash based, so the app works from any static host without server rewrites).
//
//   #/learn[/<lessonId>]        a lesson (Learn page)
//   #/challenges[/<id>]         a lab challenge
//   #/practice[/<problemId>]    a theory problem
//   #/practice/summary/<chapter>[/<section>]
//                               a chapter's key points (section: "idea-<id>", "formulas", …)
//   #/sandbox                   free editing
//   #/guide[/<section>]         field guide, optionally scrolled to a section card
//   #/import                    import page
//
// Ids are URI-encoded. This module is pure (no store, no React) so the store can read the
// starting page from it and the tests can run it without a DOM; the wiring between the URL and
// the store is in state/routeSync.ts.

import type { Mode } from './store';
import { readStored, writeStored } from './persist';

export type Route =
  | { page: 'learn'; id?: string }
  | { page: 'challenges'; id?: string }
  | { page: 'practice'; id?: string }
  | { page: 'practice'; summary: string; section?: string }
  | { page: 'sandbox' }
  | { page: 'guide'; section?: string }
  | { page: 'import' };

export type Page = Route['page'];

export const PAGES: readonly Page[] = ['learn', 'challenges', 'practice', 'sandbox', 'guide', 'import'];

const MODE_OF: Record<Page, Mode> = {
  learn: 'learn',
  challenges: 'challenge',
  practice: 'practice',
  sandbox: 'sandbox',
  guide: 'guide',
  import: 'import',
};

export const modeOf = (r: Route): Mode => MODE_OF[r.page];
export const pageOf = (m: Mode): Page => (m === 'challenge' ? 'challenges' : m);

const decode = (s: string): string | null => {
  try {
    return decodeURIComponent(s);
  } catch {
    return null;
  }
};

/** Parse a location hash ("#/learn/x", "/learn/x" or "learn/x"). null when it is empty or names
 *  no known page; the item id is not checked against the content here. */
export function parseRoute(hash: string): Route | null {
  const path = hash.replace(/^#/, '').replace(/[?].*$/, '');
  const parts = path.split('/').filter((p) => p !== '');
  if (!parts.length) return null;
  const page = parts[0].toLowerCase() as Page;
  if (!PAGES.includes(page)) return null;
  // ids never contain "/", so anything after the item is ignored
  const raw = parts[1];
  const item = raw === undefined ? undefined : decode(raw);
  if (item === null || item === '') return { page } as Route;
  if (page === 'practice' && item === 'summary') {
    const chapter = parts[2] === undefined ? null : decode(parts[2]);
    if (!chapter) return { page };
    const section = parts[3] === undefined ? null : decode(parts[3]);
    return section ? { page, summary: chapter, section } : { page, summary: chapter };
  }
  switch (page) {
    case 'learn':
    case 'challenges':
    case 'practice':
      return (item === undefined ? { page } : { page, id: item }) as Route;
    case 'guide':
      return item === undefined ? { page } : { page, section: item };
    default:
      return { page };
  }
}

export function formatRoute(r: Route): string {
  if ('summary' in r) return `#/practice/summary/${encodeURIComponent(r.summary)}${r.section ? `/${encodeURIComponent(r.section)}` : ''}`;
  const item = 'id' in r ? r.id : 'section' in r ? r.section : undefined;
  return `#/${r.page}${item ? `/${encodeURIComponent(item)}` : ''}`;
}

export const sameRoute = (a: Route | null, b: Route | null) => (a && b ? formatRoute(a) === formatRoute(b) : a === b);

/* ------------------------------------------------------------- remembered location */

const LAST_KEY = 'bb.route';

/** The last location (saved on every navigation), or null for a first-time visitor. */
export const readLastRoute = (): Route | null => {
  const h = readStored<string | null>(LAST_KEY, null, (v) => (typeof v === 'string' && parseRoute(v) ? v : undefined));
  return h ? parseRoute(h) : null;
};

export const writeLastRoute = (r: Route) => {
  writeStored(LAST_KEY, formatRoute(r));
};

const currentHash = () => (typeof location === 'undefined' ? '' : location.hash);

/** Where the app starts: the URL, else the remembered location, else Learn. */
export function startRoute(hash = currentHash()): { route: Route; fromUrl: boolean; badUrl: boolean } {
  const fromHash = parseRoute(hash);
  if (fromHash) return { route: fromHash, fromUrl: true, badUrl: false };
  const badUrl = hash.replace(/^#\/?/, '') !== '';
  return { route: readLastRoute() ?? { page: 'learn' }, fromUrl: false, badUrl };
}
