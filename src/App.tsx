import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { tr, type Lang } from './core/i18n';
import { ensureChallengeIndex, refreshChallenges, useActiveChallenge } from './state/challenges';
import { refreshProblems } from './state/problems';
import { startIndexLoads, startRouting } from './state/routeSync';
import { onPage, useLang, useStore, type Mode } from './state/store';
import { inCourseOrder, itemLabel, placeOf } from './core/course';
import { Icon } from './ui/Icons';
import { Toast } from './ui/Toast';
import { Mixed } from './ui/Mixed';

// every page is its own chunk; the 3D workbench (three.js) is only fetched for learn / challenge / sandbox
const Workbench = lazy(() => import('./ui/Workbench').then((m) => ({ default: m.Workbench })));
const SidePanel = lazy(() => import('./ui/Panel').then((m) => ({ default: m.SidePanel })));
const BenchBar = lazy(() => import('./ui/BenchBar').then((m) => ({ default: m.BenchBar })));
const CourseMap = lazy(() => import('./ui/CourseMap').then((m) => ({ default: m.CourseMap })));
const Practice = lazy(() => import('./ui/Practice').then((m) => ({ default: m.Practice })));
const Guide = lazy(() => import('./ui/Guide').then((m) => ({ default: m.Guide })));
// "N due today" on the Practice card (the review schedule is a lazy chunk too)
const DueChip = lazy(() => import('./ui/mastery/DueChip'));
const ImportPage = lazy(() => import('./ui/ImportPage').then((m) => ({ default: m.ImportPage })));

// the problem / challenge index the starting page needs is a chunk of its own: request it now,
// in parallel with the page's chunk (see state/routeSync.ts)
startIndexLoads();

function PageLoading() {
  useLang();
  return (
    <div className="page-loading" role="status">
      {tr('加载中…', 'Loading…')}
    </div>
  );
}

const NAV: { mode: Mode; zh: string; en: string; icon: string }[] = [
  { mode: 'learn', zh: '课程', en: 'Learn', icon: 'book' },
  { mode: 'challenge', zh: '挑战', en: 'Challenges', icon: 'target' },
  { mode: 'practice', zh: '练习', en: 'Practice', icon: 'practice' },
  { mode: 'sandbox', zh: '自由编辑', en: 'Sandbox', icon: 'edit' },
  { mode: 'guide', zh: '知识', en: 'Guide', icon: 'bulb' },
  { mode: 'import', zh: '导入', en: 'Import', icon: 'folder' },
];

function Logo() {
  return (
    <svg width="46" height="34" viewBox="0 0 46 34" aria-hidden>
      <rect x="1.5" y="1.5" width="43" height="31" rx="8" fill="#f7f2e7" stroke="#1f2a44" strokeWidth="3" />
      <line x1="7" y1="8" x2="39" y2="8" stroke="#e63946" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="7" y1="26" x2="39" y2="26" stroke="#2b59c3" strokeWidth="2.4" strokeLinecap="round" />
      {[11, 17, 23, 29, 35].map((x) => (
        <g key={x} fill="#1f2a44">
          <rect x={x - 1.6} y={13} width="3.2" height="3.2" />
          <rect x={x - 1.6} y={18} width="3.2" height="3.2" />
        </g>
      ))}
    </svg>
  );
}

/** Fetch an index once the page is idle (the Guide / Sandbox card; their page needs no index). */
function useIdleLoad(status: string, load: () => void) {
  useEffect(() => {
    if (status !== 'idle') return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void };
    if (w.requestIdleCallback) {
      const h = w.requestIdleCallback(load, { timeout: 3000 });
      return () => w.cancelIdleCallback?.(h);
    }
    const t = setTimeout(load, 1500);
    return () => clearTimeout(t);
  }, [status, load]);
}

/** Header progress: icon, label, bar, "done/total" — neutral ("–/–", no bar) until the counts are known. */
function ProgressView({ icon, label, done, total }: { icon: string; label: string; done: number; total: number | null }) {
  return (
    <div className={`progress-card ${total === null ? 'pending' : ''}`} aria-busy={total === null}>
      <Icon name={icon} size={22} />
      <div>
        <div className="pc-title">
          <Mixed text={label} />
        </div>
        <div
          className="pc-bar"
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={total ?? undefined}
          aria-valuenow={total === null ? undefined : done}
          aria-valuetext={total === null ? tr('加载中', 'Loading') : tr(`已完成 ${done} / ${total}`, `${done} of ${total} done`)}
        >
          <div style={{ width: total ? `${(done / total) * 100}%` : 0 }} />
        </div>
      </div>
      <b aria-hidden>{total === null ? '–/–' : `${done}/${total}`}</b>
    </div>
  );
}

function PracticeProgressCard() {
  const problems = useStore((s) => s.problems);
  const done = useStore((s) => s.practiceDone);
  const ready = useStore((s) => s.problemIndex) === 'ready';
  const n = problems.filter((p) => done[p.id]).length;
  return (
    <>
      <ProgressView icon="practice" label={tr('PRACTICE 理论练习', 'PRACTICE')} done={n} total={ready ? problems.length : null} />
      <Suspense fallback={null}>
        <DueChip />
      </Suspense>
    </>
  );
}

/** Top right: the Practice progress (the course map button sits next to the logo, CourseButton). */
function ProgressCard() {
  const mode = useStore((s) => s.mode);
  return mode === 'practice' ? <PracticeProgressCard /> : null;
}

/** Next to the logo: where you are in the course and how much is done. It opens the course map as
 *  a panel down the left side (also opened by the task panel's breadcrumb, event
 *  "bb-open-course-map"); Esc, a click outside or opening another item / page closes it. */
function CourseButton() {
  const challenges = useStore((s) => s.challenges);
  const completed = useStore((s) => s.completed);
  const mode = useStore((s) => s.mode);
  const activeId = useStore((s) => s.activeId);
  const status = useStore((s) => s.challengeIndex);
  // the counts need the challenge index: fetch it at idle on pages that don't load it themselves
  useIdleLoad(mode === 'practice' ? 'ready' : status, ensureChallengeIndex);
  const page = mode === 'challenge' ? 'challenge' : 'learn';
  const list = challenges.filter((c) => onPage(c, page));
  const done = list.filter((c) => completed[c.id]).length;
  const total = status === 'ready' ? list.length : null;
  const place = activeId && (mode === 'learn' || mode === 'challenge') ? placeOf(activeId) : undefined;
  const where = place ? `World ${place.world.id} · ${itemLabel(place)}` : '';
  const name = page === 'learn' ? tr('课程地图', 'Course map') : tr('挑战', 'Challenges');

  // open for one page + item: navigating anywhere closes it without an effect
  const key = `${mode}|${activeId ?? ''}`;
  const keyRef = useRef(key);
  keyRef.current = key;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = openKey === key;
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  // the side panel starts just below the button (the header's height changes with the width)
  const [top, setTop] = useState(80);
  useEffect(() => {
    if (!open) return;
    const place = () => setTop(Math.round((btn.current?.getBoundingClientRect().bottom ?? 72) + 8));
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [open]);
  useEffect(() => {
    const on = () => setOpenKey(keyRef.current);
    window.addEventListener('bb-open-course-map', on);
    return () => window.removeEventListener('bb-open-course-map', on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      setOpenKey(null);
      btn.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!pop.current?.contains(t) && !btn.current?.contains(t)) setOpenKey(null);
    };
    window.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div className="course-btn-wrap">
      <button
        ref={btn}
        className={`progress-card course-btn ${total === null ? 'pending' : ''} ${open ? 'open' : ''}`}
        aria-expanded={open}
        aria-controls="course-map-pop"
        aria-haspopup="dialog"
        aria-label={`${name}${where ? `：${where}` : ''}，${total === null ? tr('加载中', 'loading') : tr(`已完成 ${done} / ${total}`, `${done} of ${total} done`)}`}
        onClick={() => setOpenKey(open ? null : key)}
      >
        <Icon name={page === 'learn' ? 'book' : 'target'} size={22} />
        <div aria-hidden>
          <div className="pc-title">
            <Mixed text={page === 'learn' ? tr('课程地图 COURSE MAP', 'COURSE MAP') : tr('挑战 CHALLENGES', 'CHALLENGES')} />
          </div>
          <div className="pc-where">{where || tr('点开选一课', 'pick a unit')}</div>
        </div>
        <b aria-hidden>{total === null ? '–/–' : `${done}/${total}`}</b>
        <span className="pc-chev" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="course-pop" id="course-map-pop" ref={pop} role="dialog" aria-label={name} style={{ top }}>
          <Suspense fallback={<PageLoading />}>
            <CourseMap kind={page === 'learn' ? 'lesson' : 'challenge'} onPick={() => setOpenKey(null)} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

function CelebrateModal() {
  const show = useStore((s) => s.celebrate);
  const ch = useActiveChallenge();
  if (!show || !ch) return null;
  return <CelebrateDialog />;
}

/** Modal dialog: Esc closes it, Tab stays inside, focus returns to where it was. */
function CelebrateDialog() {
  const setCelebrate = useStore((s) => s.setCelebrate);
  const challenges = useStore((s) => s.challenges);
  const completed = useStore((s) => s.completed);
  const open = useStore((s) => s.openChallenge);
  const ch = useActiveChallenge()!;
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    (box.current?.querySelector<HTMLElement>('button.primary') ?? box.current?.querySelector<HTMLElement>('button'))?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        setCelebrate(false);
      } else if (e.key === 'Tab' && box.current) {
        const f = [...box.current.querySelectorAll<HTMLElement>('button:not(:disabled)')];
        if (!f.length) return;
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && (i === -1 || i === f.length - 1)) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      if (prev && document.contains(prev)) prev.focus();
    };
  }, [setCelebrate]);
  // next in course order on this page (Learn: the whole course map; Challenges: labs only)
  const page = useStore.getState().mode === 'learn' ? 'learn' : 'challenge';
  const same = inCourseOrder(challenges.filter((c) => onPage(c, page)));
  const next = same.slice(same.indexOf(ch) + 1).find((c) => !completed[c.id]) ?? same.find((c) => !completed[c.id]);
  return (
    <div className="modal-bg" onClick={() => setCelebrate(false)}>
      <div className="modal card" ref={box} role="dialog" aria-modal="true" aria-labelledby="celebrate-title" onClick={(e) => e.stopPropagation()}>
        <div className="big-emoji" aria-hidden>
          🎉
        </div>
        <h2 id="celebrate-title">{tr('完全正确！', 'Perfect!')}</h2>
        <p>
          {tr(
            `你在面包板上搭出的电路与「${ch.title}」的目标电路完全一致${ch.tests.length ? `，并通过了全部 ${ch.tests.length} 项功能测试` : ''}。`,
            `The circuit on your breadboard matches the target circuit of "${ch.title}"${ch.tests.length ? ` and passes all ${ch.tests.length} function tests` : ''}.`,
          )}
        </p>
        <div className="row center">
          <button onClick={() => setCelebrate(false)}>{tr('留在这里', 'Stay here')}</button>
          {next && (
            <button
              className="primary"
              onClick={() => {
                setCelebrate(false);
                open(next.id, page);
              }}
            >
              {tr('下一个：', 'Next: ')}
              {next.title} <Icon name="next" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Move keyboard focus to the page's h1 (in #main); waits for a lazily loaded page to render it. */
function focusPageHeading(tries = 40) {
  const h = document.querySelector<HTMLElement>('#main h1');
  if (!h) {
    if (tries > 0) setTimeout(() => focusPageHeading(tries - 1), 50);
    return;
  }
  if (!h.hasAttribute('tabindex')) h.tabIndex = -1;
  h.focus({ preventScroll: true });
}

/** On every change of page / item (not on the first load, not on a language switch) focus goes
 *  to the new page's heading, so a screen reader announces where the user now is — except when
 *  the change came from the lesson carousel or its group tabs, where focus stays on the card. */
function RouteFocus() {
  const key = useStore(
    (s) => `${s.mode}|${s.mode === 'practice' ? (s.practiceView ? 'view:' + s.practiceView : s.practiceSummary ? 'sum:' + s.practiceSummary.chapter : s.problemId) : s.activeId}`,
  );
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const a = document.activeElement;
    if (a && a.closest('.carousel-wrap')) return;
    // the item may still be loading: focus once its heading is there
    requestAnimationFrame(() => focusPageHeading());
  }, [key]);
  return null;
}

/** Bench pages: the page's h1 (visually hidden — the task panel shows the title). */
function BenchHeading() {
  const mode = useStore((s) => s.mode);
  const ch = useActiveChallenge();
  useLang();
  const page = mode === 'learn' ? tr('课程', 'Learn') : mode === 'challenge' ? tr('挑战', 'Challenges') : tr('自由编辑', 'Sandbox');
  return <h1 className="sr-only">{mode !== 'sandbox' && ch ? tr(`${page}：${ch.title}`, `${page}: ${ch.title}`) : page}</h1>;
}

function LangSwitch() {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const opts: { l: Lang; label: string }[] = [
    { l: 'zh', label: '中文' },
    { l: 'en', label: 'EN' },
  ];
  return (
    <div className="lang-switch" role="group" aria-label="Language / 语言">
      {opts.map((o) => (
        <button key={o.l} className={lang === o.l ? 'on' : ''} aria-pressed={lang === o.l} lang={o.l === 'zh' ? 'zh-CN' : 'en'} onClick={() => setLang(o.l)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  // App re-renders on a language switch, and with it every (non-memoised) component below,
  // so all tr() text updates in place — the 3D scene is not remounted.
  const lang = useLang();
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);

  // challenge text (and import diagnostics) are localized while parsing, so rebuild the lists
  // whenever the language changes (once their index is in; until then this does nothing, and
  // the lists are built when it arrives). Both are cheap: built-in problems come from a prebuilt
  // index and their full files are only parsed on demand (state/problems.ts).
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    refreshChallenges();
    refreshProblems();
    // open the page / item the URL names (or the remembered one); after a language switch this
    // only refreshes the tab title
    startRouting();
  }, [lang]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      // text fields keep their own keys; a slider still lets Ctrl+Z / Ctrl+Y through
      const slider = el instanceof HTMLInputElement && el.type === 'range';
      if ((tag === 'INPUT' && !slider) || tag === 'TEXTAREA') return;
      if (slider && !(e.ctrlKey || e.metaKey)) return;
      const s = useStore.getState();
      if (e.key === 'Escape') {
        if (!s.cancelPlacement()) s.setTool('select');
      }
      // removePart shows an "Undo" toast, so a stray Backspace is recoverable
      if ((e.key === 'Delete' || e.key === 'Backspace') && s.selectedId) {
        e.preventDefault();
        s.removePart(s.selectedId);
      }
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ((k === 'z' && e.shiftKey) || (k === 'y' && !e.shiftKey))) {
        e.preventDefault();
        s.redo();
      } else if ((e.ctrlKey || e.metaKey) && k === 'z') {
        e.preventDefault();
        s.undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const bench = mode === 'learn' || mode === 'challenge' || mode === 'sandbox';

  return (
    <div className={`app ${bench ? 'is-bench' : ''}`}>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          focusPageHeading();
        }}
      >
        {tr('跳到正文', 'Skip to content')}
      </a>
      <header className="top">
        <div className="brand">
          <Logo />
          <div>
            <div className="brand-title" lang="en">
              BREADBOARD LAB
            </div>
            <div className="brand-sub">
              {tr('面包板实验室 · ', '')}
              <span lang="en">EXPLORE · CONNECT · BUILD</span>
            </div>
          </div>
        </div>
        <CourseButton />
        <nav className="nav" aria-label={tr('主导航', 'Main')}>
          {NAV.map((n) => (
            <button key={n.mode} className={mode === n.mode ? 'on' : ''} aria-current={mode === n.mode ? 'page' : undefined} onClick={() => setMode(n.mode)}>
              <Icon name={n.icon} />
              <span>{tr(n.zh, n.en)}</span>
              {lang === 'zh' && (
                <small lang="en" aria-hidden>
                  {n.en}
                </small>
              )}
            </button>
          ))}
        </nav>
        <div className="top-right">
          <ProgressCard />
          <LangSwitch />
        </div>
      </header>

      {bench && (
        <Suspense fallback={<PageLoading />}>
          <main className="main" id="main">
            <BenchHeading />
            <div className="left">
              <Workbench />
            </div>
            <SidePanel />
            {mode !== 'sandbox' && <BenchBar />}
          </main>
        </Suspense>
      )}
      {!bench && (
        <Suspense fallback={<PageLoading />}>
          {mode === 'practice' && <Practice />}
          {mode === 'guide' && <Guide />}
          {mode === 'import' && <ImportPage />}
        </Suspense>
      )}
      <Toast />
      <CelebrateModal />
      <RouteFocus />
    </div>
  );
}
