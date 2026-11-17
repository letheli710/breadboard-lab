// Keeps the URL (state/router.ts) and the store in step:
//  - store → URL: a page or item change adds a history entry (pushState); board edits don't
//    touch the URL. The location is also remembered (bb.route) and the tab title updated.
//  - URL → store: on start, and on Back / Forward / an edited hash, the route is applied:
//    the page is opened and the item in it; an id that doesn't exist falls back to the page's
//    default with a toast, and the URL is corrected in place (replaceState).
// A challenge id may belong to a group whose chunk is not loaded yet: store.openChallenge
// loads it and marks it `opening` meanwhile, and the route follows `opening`, so the URL
// doesn't flip back to the previous challenge while the file loads.
// The built-in problem and challenge indexes are lazy chunks too (state/indexLoader.ts). A route
// whose item can only be resolved with an index that is not in yet is kept *pending*: its page is
// shown (with a loading state), the URL, the remembered location (bb.route) and the saved current
// problem are left alone, the tab title names only the page, and the route is applied once the
// index arrives — so a deep link never flashes or saves the first problem / lesson instead.

import { tr } from '../core/i18n';
import { chapterById } from '../core/problem/chapters';
import { ensureChallengeIndex } from './challenges';
import { ensureProblemIndex, entryTitle } from './problems';
import { formatRoute, modeOf, pageOf, parseRoute, startRoute, writeLastRoute, type Route } from './router';
import { useStore, type Mode } from './store';
import { tdById } from '../inside/registry';

type S = ReturnType<typeof useStore.getState>;

/** Guide section from the URL (the Guide has no store state of its own). */
let guideSection: string | undefined;
let started = false;
let scheduled = false;
let replaceNext = false;
/** a route waiting for its index (see the top of this file) */
let pending: Route | null = null;

type IndexName = 'problems' | 'challenges';
const isReady = (s: S, k: IndexName) => (k === 'problems' ? s.problemIndex : s.challengeIndex) === 'ready';
const ensureIndex = (k: IndexName) => void (k === 'problems' ? ensureProblemIndex() : ensureChallengeIndex());

/** The indexes a page shows (its list, the progress card): fetched as soon as the page is
 *  picked, in parallel with the page's own chunk. The Guide and the Sandbox need neither (the
 *  progress card fetches the lesson index at idle time). */
function indexesOf(mode: Mode): IndexName[] {
  if (mode === 'practice') return ['problems'];
  if (mode === 'learn' || mode === 'challenge') return ['challenges'];
  if (mode === 'import') return ['challenges', 'problems'];
  return [];
}

/** The index needed to resolve the item a route names (a chapter's key points need none). */
function indexToResolve(r: Route): IndexName | null {
  if (r.page === 'learn' || r.page === 'challenges') return 'challenges';
  if (r.page === 'practice' && !('summary' in r) && !('view' in r)) return 'problems';
  return null;
}

/** Start fetching what the starting route needs; call as early as possible (App module scope). */
export function startIndexLoads(route: Route = startRoute().route) {
  for (const k of indexesOf(modeOf(route))) ensureIndex(k);
}

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
      if (s.practiceView) return { page: 'practice', view: s.practiceView };
      if (s.practiceSummary) {
        const { chapter, section } = s.practiceSummary;
        return section ? { page: 'practice', summary: chapter, section } : { page: 'practice', summary: chapter };
      }
      return s.problems.some((p) => p.id === s.problemId) ? { page: 'practice', id: s.problemId! } : { page: 'practice' };
    case 'guide':
      return guideSection ? { page: 'guide', section: guideSection } : { page: 'guide' };
    case 'inside':
      return s.insideId ? { page: 'inside', id: s.insideId } : { page: 'inside' };
    case 'calc':
      return s.calcId ? { page: 'calc', id: s.calcId } : { page: 'calc' };
    default:
      return { page: s.mode };
  }
}

const APP = () => tr('面包板实验室', 'Breadboard Lab');

/** Tab title for the page / item on screen, e.g. "LED 与电阻 · 课程 — 面包板实验室". */
export function titleOf(s: S, r: Route = routeOf(s)): string {
  const page = {
    learn: tr('课程', 'Learn'),
    challenges: tr('挑战', 'Challenges'),
    practice: tr('练习', 'Practice'),
    sandbox: tr('自由编辑', 'Sandbox'),
    guide: tr('知识', 'Guide'),
    import: tr('导入', 'Import'),
    inside: tr('拆开看', 'Inside'),
    calc: tr('计算', 'Calculations'),
  }[r.page];
  let item: string | undefined;
  if ((r.page === 'learn' || r.page === 'challenges') && r.id) item = s.challenges.find((c) => c.id === r.id)?.title;
  else if (r.page === 'practice' && 'view' in r)
    item = { notebook: tr('错题本', 'Mistake notebook'), due: tr('今日复习', 'Review'), how: tr('学习方法说明', 'How it works'), quiz: tr('测验', 'Quiz') }[r.view];
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
  if (pending) {
    // the URL keeps naming the item that is loading; the title names the page only
    const title = titleOf(s, { page: pending.page } as Route);
    if (document.title !== title) document.title = title;
    return;
  }
  const route = routeOf(s);
  const hash = formatRoute(route);
  const shown = parseRoute(location.hash);
  const replace =
    replaceNext ||
    !shown ||
    (shown.page === route.page && !('id' in shown && shown.id) && !('section' in shown && shown.section) && !('summary' in shown) && !('view' in shown)) ||
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

const firstOf = (s: S, kind: 'lesson' | 'challenge') => s.challenges.find((c) => c.kind === kind && !s.completed[c.id]) ?? s.challenges.find((c) => c.kind === kind);

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

const notFound = () =>
  useStore.getState().notify(tr('找不到这个链接指向的内容，已打开默认页面。', "That link points to something that doesn't exist; opened the default page instead."));

/** Open what the route names. */
export function applyRoute(r: Route) {
  replaceNext = true;
  const st = useStore.getState();
  guideSection = r.page === 'guide' ? r.section : undefined;
  const need = indexToResolve(r);
  if (need && !isReady(st, need)) {
    pending = r;
    ensureIndex(need);
    if (st.mode !== modeOf(r)) st.setMode(modeOf(r));
    schedule();
    return;
  }
  pending = null;
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
  } else if (r.page === 'practice' && 'view' in r) {
    // the notebook / review / quiz pages need no index to open (they show a loading state)
    if (st.mode !== 'practice' || st.practiceView !== r.view) st.openPracticeView(r.view);
  } else if (r.page === 'practice' && 'summary' in r) {
    // a chapter's key points (Back from a problem returns here; a direct load opens only Practice)
    if (chapterById(r.summary)) {
      const cur = st.practiceSummary;
      if (st.mode !== 'practice' || cur?.chapter !== r.summary || cur.section !== r.section)
        st.openSummary({ chapter: r.summary, section: r.section, from: cur?.chapter === r.summary ? cur.from : undefined });
    } else {
      notFound();
      st.setMode('practice');
    }
  } else if (r.page === 'practice') {
    if (r.id && st.problems.some((p) => p.id === r.id)) {
      if (st.mode !== 'practice' || st.problemId !== r.id || st.practiceSummary || st.practiceView) st.openProblem(r.id);
    } else {
      if (r.id) notFound();
      st.setMode('practice');
      if (useStore.getState().practiceView) useStore.getState().openPracticeView(null);
    }
  } else if (r.page === 'inside') {
    const id = r.id && tdById(r.id) ? r.id : null;
    if (r.id && !id) notFound();
    if (st.mode !== 'inside' || st.insideId !== id) st.openInside(id);
  } else if (r.page === 'calc') {
    if (st.mode !== 'calc' || st.calcId !== (r.id ?? null)) st.openCalc(r.id ?? null);
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
    if (s.mode !== prev.mode) {
      for (const k of indexesOf(s.mode)) if (!isReady(s, k)) ensureIndex(k);
      // another page was picked while a route waited for its index: forget that route
      if (pending && s.mode !== modeOf(pending)) pending = null;
    }
    const need = pending && indexToResolve(pending);
    if (pending && need && isReady(s, need) && !isReady(prev, need)) {
      applyRoute(pending); // the index arrived: open what the URL names
      return;
    }
    if (
      s.problemIndex !== prev.problemIndex ||
      s.challengeIndex !== prev.challengeIndex ||
      s.mode !== prev.mode ||
      s.activeId !== prev.activeId ||
      s.opening !== prev.opening ||
      s.problemId !== prev.problemId ||
      s.practiceSummary !== prev.practiceSummary ||
      s.practiceView !== prev.practiceView ||
      s.insideId !== prev.insideId ||
      s.calcId !== prev.calcId ||
      s.challenges !== prev.challenges ||
      s.problems !== prev.problems ||
      s.lang !== prev.lang
    ) {
      if (s.mode !== 'guide') guideSection = undefined;
      schedule();
    }
  });
  window.addEventListener('popstate', onUrl);
  window.addEventListener('hashchange', onUrl);
}
