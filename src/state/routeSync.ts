// Keeps the URL (state/router.ts) and the store in step:
//  - store → URL: a page or item change adds a history entry (pushState); board edits don't
//    touch the URL. The location is also remembered (bb.route) and the tab title updated.
//  - URL → store: on start, and on Back / Forward / an edited hash, the route is applied:
//    the page is opened and the item in it; an id that doesn't exist falls back to the page's
//    default with a toast, and the URL is corrected in place (replaceState).
// A challenge id may belong to a group whose chunk is not loaded yet: store.openChallenge
// loads it and marks it `opening` meanwhile, and the route follows `opening`, so the URL
// doesn't flip back to the previous challenge while the file loads.

import { tr } from '../core/i18n';
import { chapterById } from '../core/problem/chapters';
import { entryTitle } from './problems';
import { formatRoute, modeOf, pageOf, parseRoute, startRoute, writeLastRoute, type Route } from './router';
import { useStore } from './store';

type S = ReturnType<typeof useStore.getState>;

/** Guide section from the URL (the Guide has no store state of its own). */
let guideSection: string | undefined;
let started = false;
let scheduled = false;
let replaceNext = false;

/** The route that describes what the store shows. */
export function routeOf(s: S): Route {
  switch (s.mode) {
    case 'learn':
    case 'challenge': {
      const id = s.opening ?? s.activeId;
      const ch = id ? s.challenges.find((c) => c.id === id) : undefined;
      if (ch) return { page: ch.kind === 'lesson' ? 'learn' : 'challenges', id: ch.id };
      return { page: pageOf(s.mode) as 'learn' | 'challenges' };
    }
    case 'practice':
      if (s.practiceSummary) {
        const { chapter, section } = s.practiceSummary;
        return section ? { page: 'practice', summary: chapter, section } : { page: 'practice', summary: chapter };
      }
      return s.problems.some((p) => p.id === s.problemId) ? { page: 'practice', id: s.problemId! } : { page: 'practice' };
    case 'guide':
      return guideSection ? { page: 'guide', section: guideSection } : { page: 'guide' };
    default:
      return { page: s.mode };
  }
}

const APP = () => tr('面包板实验室', 'Breadboard Lab');

/** Tab title for the page / item on screen, e.g. "LED 与电阻 · 课程 — 面包板实验室". */
export function titleOf(s: S): string {
  const r = routeOf(s);
  const page = {
    learn: tr('课程', 'Learn'),
    challenges: tr('挑战', 'Challenges'),
    practice: tr('练习', 'Practice'),
    sandbox: tr('自由编辑', 'Sandbox'),
    guide: tr('知识', 'Guide'),
    import: tr('导入', 'Import'),
  }[r.page];
  let item: string | undefined;
  if ((r.page === 'learn' || r.page === 'challenges') && r.id) item = s.challenges.find((c) => c.id === r.id)?.title;
  else if (r.page === 'practice' && 'summary' in r) {
    const c = chapterById(r.summary);
    item = c && `${tr('要点', 'Key points')} · ${c.title()}`;
  } else if (r.page === 'practice' && 'id' in r && r.id) {
    const p = s.problems.find((x) => x.id === r.id);
    item = p && entryTitle(p);
  }
  return `${item ? `${item} · ` : ''}${page} — ${APP()}`;
}

function sync() {
  scheduled = false;
  if (!started) return;
  const s = useStore.getState();
  const route = routeOf(s);
  const hash = formatRoute(route);
  const shown = parseRoute(location.hash);
  const replace = replaceNext || !shown || (shown.page === route.page && !('id' in shown && shown.id) && !('section' in shown && shown.section) && !('summary' in shown)) ||
    // a key-points page that resolved its section (opened from a problem) names it in place
    ('summary' in shown && 'summary' in route && shown.summary === route.summary && !shown.section);
  replaceNext = false;
  if (!shown || formatRoute(shown) !== hash) {
    if (replace) history.replaceState(history.state, '', hash);
    else history.pushState(history.state, '', hash);
  }
  writeLastRoute(route);
  const title = titleOf(s);
  if (document.title !== title) document.title = title;
}

/** Sync the URL after the current batch of store updates (one navigation = one entry). */
function schedule() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(sync);
}

const firstOf = (s: S, kind: 'lesson' | 'challenge') =>
  s.challenges.find((c) => c.kind === kind && !s.completed[c.id]) ?? s.challenges.find((c) => c.kind === kind);

function scrollToSection(section: string) {
  // the Guide is a lazy chunk: wait (briefly) for the card to exist
  let tries = 0;
  const go = () => {
    const el = document.getElementById(`guide-${section}`);
    if (el) el.scrollIntoView({ block: 'start' });
    else if (tries++ < 120) requestAnimationFrame(go);
  };
  go();
}

const notFound = () => useStore.getState().notify(tr('找不到这个链接指向的内容，已打开默认页面。', "That link points to something that doesn't exist; opened the default page instead."));

/** Open what the route names. */
export function applyRoute(r: Route) {
  replaceNext = true;
  const st = useStore.getState();
  guideSection = r.page === 'guide' ? r.section : undefined;
  if (r.page === 'learn' || r.page === 'challenges') {
    const kind = r.page === 'learn' ? 'lesson' : 'challenge';
    const want = r.id ? st.challenges.find((c) => c.id === r.id) : undefined;
    if (r.id && !want) notFound();
    if (want) {
      if (st.activeId !== want.id && st.opening !== want.id) st.openChallenge(want.id);
      else if (st.mode !== modeOf(r) && st.opening !== want.id) st.setMode(want.kind === 'lesson' ? 'learn' : 'challenge');
    } else if (st.mode !== modeOf(r) || !st.activeId) {
      // no item named: the page, with the challenge that was open on it or the first unfinished one
      st.setMode(modeOf(r));
      const s2 = useStore.getState();
      if (!s2.activeId && !s2.opening) {
        const first = firstOf(s2, kind);
        if (first) s2.openChallenge(first.id);
      }
    }
  } else if (r.page === 'practice' && 'summary' in r) {
    // a chapter's key points (Back from a problem returns here; a direct load opens only Practice)
    if (chapterById(r.summary)) {
      const cur = st.practiceSummary;
      if (st.mode !== 'practice' || cur?.chapter !== r.summary || cur.section !== r.section) st.openSummary({ chapter: r.summary, section: r.section, from: cur?.chapter === r.summary ? cur.from : undefined });
    } else {
      notFound();
      st.setMode('practice');
    }
  } else if (r.page === 'practice') {
    if (r.id && st.problems.some((p) => p.id === r.id)) {
      if (st.mode !== 'practice' || st.problemId !== r.id || st.practiceSummary) st.openProblem(r.id);
    } else {
      if (r.id) notFound();
      st.setMode('practice');
    }
  } else {
    st.setMode(modeOf(r));
    if (r.page === 'guide' && r.section) scrollToSection(r.section);
  }
  schedule();
}

const onUrl = () => {
  const r = parseRoute(location.hash);
  if (!r) {
    if (location.hash.replace(/^#\/?/, '') !== '') notFound();
    applyRoute({ page: 'learn' });
  } else applyRoute(r);
};

/** Start routing once the challenge / problem lists are in the store. Later calls only refresh
 *  the URL and title (e.g. after a language switch). */
export function startRouting() {
  if (started) {
    schedule();
    return;
  }
  started = true;
  const { route, badUrl } = startRoute();
  if (badUrl) notFound();
  applyRoute(route);
  useStore.subscribe((s, prev) => {
    if (s.mode !== prev.mode || s.activeId !== prev.activeId || s.opening !== prev.opening || s.problemId !== prev.problemId || s.practiceSummary !== prev.practiceSummary || s.challenges !== prev.challenges || s.problems !== prev.problems || s.lang !== prev.lang) {
      if (s.mode !== 'guide') guideSection = undefined;
      schedule();
    }
  });
  window.addEventListener('popstate', onUrl);
  window.addEventListener('hashchange', onUrl);
}
