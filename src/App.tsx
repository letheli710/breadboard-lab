import { lazy, Suspense, useEffect, useState } from 'react';
import { tr, type Lang } from './core/i18n';
import { loadAll } from './state/challenges';
import { loadProblems } from './state/problems';
import { useActiveChallenge } from './state/derived';
import { useLang, useStore, type Mode } from './state/store';
import { Carousel } from './ui/Carousel';
import { Icon } from './ui/Icons';
import { SidePanel } from './ui/Panel';
import { Workbench } from './ui/Workbench';

// pages off the 3D workbench are split into their own chunks
const Practice = lazy(() => import('./ui/Practice').then((m) => ({ default: m.Practice })));
const Guide = lazy(() => import('./ui/Guide').then((m) => ({ default: m.Guide })));
const ImportPage = lazy(() => import('./ui/ImportPage').then((m) => ({ default: m.ImportPage })));

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

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="clock">
      <div>{now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}</div>
      <div>{now.toLocaleTimeString('en-GB')}</div>
    </div>
  );
}

function PracticeProgressCard() {
  const problems = useStore((s) => s.problems);
  const done = useStore((s) => s.practiceDone);
  const n = problems.filter((p) => done[p.id]).length;
  return (
    <div className="progress-card">
      <Icon name="practice" size={22} />
      <div>
        <div className="pc-title">{tr('PRACTICE 理论练习', 'PRACTICE')}</div>
        <div className="pc-bar">
          <div style={{ width: problems.length ? `${(n / problems.length) * 100}%` : 0 }} />
        </div>
      </div>
      <b>
        {n}/{problems.length}
      </b>
    </div>
  );
}

function ProgressCard() {
  const challenges = useStore((s) => s.challenges);
  const completed = useStore((s) => s.completed);
  const mode = useStore((s) => s.mode);
  if (mode === 'practice') return <PracticeProgressCard />;
  const kind = mode === 'challenge' ? 'challenge' : 'lesson';
  const list = challenges.filter((c) => c.kind === kind);
  const done = list.filter((c) => completed[c.id]).length;
  return (
    <div className="progress-card">
      <Icon name={kind === 'lesson' ? 'book' : 'target'} size={22} />
      <div>
        <div className="pc-title">{kind === 'lesson' ? tr('BASICS 基础课程', 'BASICS') : tr('CHALLENGES 挑战', 'CHALLENGES')}</div>
        <div className="pc-bar">
          <div style={{ width: list.length ? `${(done / list.length) * 100}%` : 0 }} />
        </div>
      </div>
      <b>
        {done}/{list.length}
      </b>
    </div>
  );
}

function CelebrateModal() {
  const show = useStore((s) => s.celebrate);
  const setCelebrate = useStore((s) => s.setCelebrate);
  const challenges = useStore((s) => s.challenges);
  const completed = useStore((s) => s.completed);
  const open = useStore((s) => s.openChallenge);
  const ch = useActiveChallenge();
  if (!show || !ch) return null;
  const same = challenges.filter((c) => c.kind === ch.kind);
  const next = same.slice(same.indexOf(ch) + 1).find((c) => !completed[c.id]) ?? same.find((c) => !completed[c.id]);
  return (
    <div className="modal-bg" onClick={() => setCelebrate(false)}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="big-emoji">🎉</div>
        <h2>{tr('完全正确！', 'Perfect!')}</h2>
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
                open(next.id);
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
        <button key={o.l} className={lang === o.l ? 'on' : ''} onClick={() => setLang(o.l)}>
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
  const setChallenges = useStore((s) => s.setChallenges);
  const setProblems = useStore((s) => s.setProblems);

  // challenge text (and import diagnostics) are localized while parsing, so (re)load whenever
  // the language changes. Both are cheap: built-in problems come from a prebuilt index and
  // their full files are only parsed on demand (state/problems.ts).
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    const r = loadAll();
    setChallenges(r.challenges, r.invalid);
    const pr = loadProblems();
    setProblems(pr.problems, pr.invalid);
    const st = useStore.getState();
    if (st.mode === 'learn' && !st.activeId) {
      const first = r.challenges.find((c) => c.kind === 'lesson' && !st.completed[c.id]) ?? r.challenges.find((c) => c.kind === 'lesson');
      if (first) st.openChallenge(first.id);
    }
  }, [setChallenges, setProblems, lang]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const s = useStore.getState();
      if (e.key === 'Escape') {
        if (!s.cancelPlacement()) s.setTool('select');
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && s.selectedId) s.removePart(s.selectedId);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        s.undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const bench = mode === 'learn' || mode === 'challenge' || mode === 'sandbox';

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <Logo />
          <div>
            <div className="brand-title">BREADBOARD LAB</div>
            <div className="brand-sub">{tr('面包板实验室 · ', '')}EXPLORE · CONNECT · BUILD</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <button key={n.mode} className={mode === n.mode ? 'on' : ''} onClick={() => setMode(n.mode)}>
              <Icon name={n.icon} />
              <span>{tr(n.zh, n.en)}</span>
              {lang === 'zh' && <small>{n.en}</small>}
            </button>
          ))}
        </nav>
        <div className="top-right">
          <ProgressCard />
          <LangSwitch />
          <Clock />
        </div>
      </header>

      {bench && (
        <main className="main">
          <div className="left">
            <Workbench />
            {mode !== 'sandbox' && <Carousel kind={mode === 'learn' ? 'lesson' : 'challenge'} />}
          </div>
          <SidePanel />
        </main>
      )}
      {!bench && (
        <Suspense fallback={<PageLoading />}>
          {mode === 'practice' && <Practice />}
          {mode === 'guide' && <Guide />}
          {mode === 'import' && <ImportPage />}
        </Suspense>
      )}
      <CelebrateModal />
    </div>
  );
}
