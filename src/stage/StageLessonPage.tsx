// A stage lesson (#/lesson/<id>, curriculum blueprint v2): the stage on the left (lens bar +
// the active layer), the acts on the right. The act in the middle of the viewport drives the
// stage; picking a lens by hand pins the layer until "follow the lesson" is pressed again.

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { tr } from '../core/i18n';
import { tt } from '../core/course/text';
import { parseRef, refHash, titleOfRef, useCatalog, type Ref } from '../state/course';
import { useCourse } from '../state/courseStore';
import { setLessonTitles } from '../state/routeSync';
import { useLang, useStore } from '../state/store';
import { worldById, worldName } from '../state/worlds';
import { Icon } from '../ui/Icons';
import { genericLabel } from './BreadboardXray';
import { LESSON_LOADERS } from './lessons';
import { STAGE_LESSON_ENTRY } from './registry';
import { useLit, useStage } from './stageStore';
import { StageText, Tex } from './StageText';
import { ColorCodeCard } from './ColorCodeCard';
import type { Act, ActBlock, QuizItem, StageLesson, StageSync } from './types';
import './stage.css';

const BreadboardXray = lazy(() => import('./BreadboardXray'));
const DmmProbe = lazy(() => import('./DmmProbe'));

setLessonTitles((id) => {
  const e = STAGE_LESSON_ENTRY.get(id);
  return e && `${e.code} · ${tt(e.title)}`;
});

/** The items of a World in course order (every section, every kind), as refs. */
function worldOrder(worldId: string): Ref[] {
  const w = worldById(worldId);
  return (w?.sections ?? []).flatMap((s) => s.items.map(parseRef).filter((r): r is Ref => !!r));
}

/** The items before and after a stage lesson in its World. */
function neighbours(slug: string): { prev?: Ref; next?: Ref } {
  const e = STAGE_LESSON_ENTRY.get(slug);
  const order = e ? worldOrder(e.world) : [];
  const i = order.findIndex((r) => r.kind === 'lesson' && r.id === slug);
  return i < 0 ? {} : { prev: order[i - 1], next: order[i + 1] };
}

function RefLink({ r, primary, dir }: { r: Ref; primary?: boolean; dir: 'prev' | 'next' }) {
  const cat = useCatalog();
  const h = refHash(r, cat);
  const label = titleOfRef(r, cat);
  if (!h) return <span className="muted">{label}</span>;
  return (
    <a className={`button ${primary ? 'primary' : ''}`} href={h}>
      {dir === 'prev' && <Icon name="prev" size={15} />} {label} {dir === 'next' && <Icon name="next" size={15} />}
    </a>
  );
}

/* ------------------------------------------------------------- stage (left) */

function targetLabel(lesson: StageLesson, id: string) {
  return lesson.left_stage_spec.hover_map[id] ?? genericLabel(id);
}

function LensBar({ lesson }: { lesson: StageLesson }) {
  const layer = useStage((s) => s.layer);
  const manual = useStage((s) => s.manual);
  const pick = useStage((s) => s.pickLayer);
  const resume = useStage((s) => s.resumeAuto);
  return (
    <div className="lens-bar">
      <div className="lens-tabs" role="tablist" aria-label="观察视角">
        {lesson.left_stage_spec.layers.map((l) => (
          <button key={l.id} role="tab" aria-selected={layer === l.id} className={`lens ${layer === l.id ? 'on' : ''}`} onClick={() => pick(l.id)}>
            {l.label}
          </button>
        ))}
      </div>
      {manual ? (
        <button className="lens-mode manual" onClick={resume} title="回到由右侧讲解自动切换图层">
          <Icon name="layers" size={14} /> 手动复盘 · 点此回到自动跟随
        </button>
      ) : (
        <span className="lens-mode auto">
          <span className="dot" aria-hidden /> 跟随讲解自动切换
        </span>
      )}
    </div>
  );
}

function XraySlider() {
  const xray = useStage((s) => s.xray);
  const setXray = useStage((s) => s.setXray);
  return (
    <label className="xray-slider">
      <span>X-Ray 掀开塑料外壳</span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(xray * 100)}
        onChange={(e) => setXray(Number(e.target.value) / 100)}
        aria-valuetext={`${Math.round(xray * 100)}%`}
      />
      <b>{Math.round(xray * 100)}%</b>
    </label>
  );
}

function Pointing({ lesson }: { lesson: StageLesson }) {
  const hover = useStage((s) => s.hover);
  const halo = useStage((s) => s.halo);
  const setHover = useStage((s) => s.setHover);
  const lit = useLit();
  if (hover && hover.length) {
    const t = targetLabel(lesson, hover[0]);
    return (
      <div className="stage-pointing" aria-live="polite">
        {t ? (
          <>
            <b>{hover.map((id) => targetLabel(lesson, id)?.label ?? id).join(' · ')}</b>
            <span>{t.desc}</span>
          </>
        ) : null}
      </div>
    );
  }
  if (!halo.length) return <div className="stage-pointing quiet">把鼠标移到面包板的孔上，或移到右侧带下划线的术语上</div>;
  return (
    <div className="stage-pointing">
      <span className="lbl">本幕高亮</span>
      {halo.map((id) => (
        <button
          key={id}
          className={`halo-chip ${lit.includes(id) ? 'lit' : ''}`}
          onPointerEnter={() => setHover([id])}
          onPointerLeave={() => setHover(null)}
          onFocus={() => setHover([id])}
          onBlur={() => setHover(null)}
        >
          {targetLabel(lesson, id)?.label ?? id}
        </button>
      ))}
    </div>
  );
}

function Stage({ lesson }: { lesson: StageLesson }) {
  const layer = useStage((s) => s.layer);
  const spec = lesson.left_stage_spec.layers.find((l) => l.id === layer)!;
  return (
    <aside className="stage-left" aria-label="左侧舞台">
      <LensBar lesson={lesson} />
      <p className="stage-caption">{spec.caption}</p>
      <div className={`stage-view layer-${layer}`}>
        <Suspense fallback={<div className="stage-loading">{tr('加载中…', 'Loading…')}</div>}>
          {layer === 'bb_xray' && (
            <>
              <XraySlider />
              <div className="bb3d-wrap">
                <BreadboardXray />
              </div>
              <p className="bb3d-hint">拖动旋转 · 滚轮缩放 · 上下两组电源轨之间并不相通，要用跳线连起来</p>
            </>
          )}
          {layer === 'dmm_probe' && <DmmProbe />}
        </Suspense>
      </div>
      <Pointing lesson={lesson} />
    </aside>
  );
}

/* ------------------------------------------------------------- acts (right) */

function Block({ b }: { b: ActBlock }) {
  switch (b.kind) {
    case 'p':
      return (
        <p className="act-p">
          <StageText text={b.text} />
        </p>
      );
    case 'ol':
    case 'ul': {
      const L = b.kind;
      return (
        <L className="act-list">
          {b.items.map((t, i) => (
            <li key={i}>
              <StageText text={t} />
            </li>
          ))}
        </L>
      );
    }
    case 'origin':
      return (
        <div className="deriv origin">
          <div className="deriv-title">
            <StageText text={b.title} />
          </div>
          <p>
            <StageText text={b.text} />
          </p>
        </div>
      );
    case 'formula':
      return (
        <div className="deriv formula">
          <div className="deriv-title">
            <StageText text={b.title} />
          </div>
          <Tex tex={b.tex} display />
        </div>
      );
    case 'calc':
      return (
        <div className="deriv calc">
          <div className="deriv-title">
            <StageText text={b.title} />
          </div>
          <ol className="calc-steps">
            {b.steps.map((s, i) => (
              <li key={i}>
                <span className="step-label">{s.label}</span>
                {s.text && (
                  <>
                    ：<StageText text={s.text} />
                  </>
                )}
                {s.tex && <Tex tex={s.tex} display />}
              </li>
            ))}
          </ol>
        </div>
      );
    case 'colorcode':
      return <ColorCodeCard title={b.title} intro={b.intro} />;
    case 'note':
      return (
        <div className={`act-note ${b.tone}`}>
          <StageText text={b.text} />
        </div>
      );
  }
}

function Figure({ svg, caption }: { svg: string; caption?: string }) {
  return (
    <figure className="act-figure">
      {/* lesson-sheet SVG source, bundled with the app (not user content) */}
      <div className="act-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function QuizCard({ q, n, onResult }: { q: QuizItem; n: number; onResult: (id: string, ok: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = q.options.find((o) => o.key === picked);
  return (
    <div className="quiz-card" data-sync-key={`q-${q.id}`}>
      <div className="quiz-q">
        <span className="quiz-n">Q{n}</span>
        <StageText text={q.question} />
      </div>
      {q.figure && <Figure svg={q.figure} />}
      <div className="quiz-options" role="radiogroup" aria-label={`Q${n}`}>
        {q.options.map((o) => {
          const state = picked === o.key ? (o.correct ? 'right' : 'wrong') : picked && o.correct && chosen?.correct ? 'right' : '';
          return (
            <button
              key={o.key}
              role="radio"
              aria-checked={picked === o.key}
              className={`quiz-opt ${state}`}
              onClick={() => {
                setPicked(o.key);
                onResult(q.id, o.correct);
              }}
            >
              <span className="quiz-key">{o.key}</span>
              <StageText text={o.text} />
            </button>
          );
        })}
      </div>
      {chosen && (
        <div className={`quiz-feedback ${chosen.correct ? 'right' : 'wrong'}`} role="status">
          <StageText text={chosen.correct ? q.feedback_correct : q.feedback_wrong} />
          {!chosen.correct && <span className="quiz-retry">再选一次</span>}
        </div>
      )}
    </div>
  );
}

function Quiz({ act, lesson }: { act: Act; lesson: StageLesson }) {
  const items = act.quiz!;
  const slug = lesson.lesson_meta.lesson_id.toLowerCase();
  const [right, setRight] = useState<Record<string, boolean>>({});
  const [passedBefore] = useState(() => !!useCourse.getState().lessonsDone[slug]);
  const setDone = useCourse((s) => s.setLessonDone);
  const allRight = items.every((q) => right[q.id]);
  useEffect(() => {
    if (allRight) setDone(slug, true);
  }, [allRight, slug, setDone]);
  const m = lesson.lesson_meta;
  const { next } = neighbours(slug);
  const planned = m.next_lesson && !LESSON_LOADERS[m.next_lesson.toLowerCase()];
  return (
    <div className="quiz">
      {items.map((q, i) => (
        <QuizCard key={q.id} q={q} n={i + 1} onResult={(id, ok) => setRight((r) => ({ ...r, [id]: ok }))} />
      ))}
      {(allRight || passedBefore) && (
        <div className="quiz-pass" role="status">
          <Icon name="party" size={20} />
          <div>
            <b>{allRight ? '入场安全检验通过！' : '你之前已经通过了这道入场检验。'}</b>
            {next && (
              <p>
                World 1 接下来：
                <RefLink r={next} primary dir="next" />
              </p>
            )}
            {planned && (
              <p className="muted">
                新版主线下一课 {m.next_lesson} {m.next_lesson_title} <span className="badge">即将上线</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActCard({ act, lesson, total }: { act: Act; lesson: StageLesson; total: number }) {
  const activeKey = useStage((s) => s.activeKey);
  const key = `act-${act.act_index}`;
  const active = activeKey === key || (!!act.quiz && !!activeKey?.startsWith('q-'));
  const layer = lesson.left_stage_spec.layers.find((l) => l.id === act.sync.layer)!;
  return (
    <section className={`act-card ${active ? 'active' : ''}`} data-sync-key={key} aria-labelledby={`${key}-h`}>
      <header className="act-head">
        <span className="act-badge">
          {act.badge}
          <small> / {total}</small>
        </span>
        <span className="act-layer">左侧 · {act.quiz ? '随题目切换' : layer.label}</span>
      </header>
      <h2 id={`${key}-h`}>{act.title}</h2>
      {act.blocks.map((b, i) => (
        <Block key={i} b={b} />
      ))}
      {act.inline_svg && <Figure svg={act.inline_svg} caption={act.figure_caption} />}
      {act.quiz && <Quiz act={act} lesson={lesson} />}
    </section>
  );
}

/** The sync settings of every element the observer watches, by key. */
function syncTable(lesson: StageLesson): Map<string, Partial<StageSync>> {
  const m = new Map<string, Partial<StageSync>>();
  for (const a of lesson.right_acts) {
    m.set(`act-${a.act_index}`, a.sync);
    for (const q of a.quiz ?? []) m.set(`q-${q.id}`, { ...a.sync, ...q.sync });
  }
  return m;
}

function useScrollDrive(lesson: StageLesson, root: React.RefObject<HTMLElement | null>) {
  const follow = useStage((s) => s.follow);
  useEffect(() => {
    const table = syncTable(lesson);
    const first = `act-${lesson.right_acts[0].act_index}`;
    follow(first, table.get(first)!);
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    // the element crossing a band a little above the middle of the viewport drives the stage;
    // quiz items sit inside the last act, so the innermost match wins
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const k = (e.target as HTMLElement).dataset.syncKey!;
          if (e.isIntersecting) visible.add(k);
          else visible.delete(k);
        }
        const keys = [...visible];
        const pick = keys.find((k) => k.startsWith('q-')) ?? keys[keys.length - 1];
        if (pick && table.has(pick)) follow(pick, table.get(pick)!);
      },
      { rootMargin: '-38% 0px -52% 0px' },
    );
    el.querySelectorAll<HTMLElement>('[data-sync-key]').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [lesson, root, follow]);
}

/* ------------------------------------------------------------- page */

function LessonView({ lesson }: { lesson: StageLesson }) {
  const right = useRef<HTMLDivElement>(null);
  const reset = useStage((s) => s.reset);
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => reset();
  }, [lesson, reset]);
  useScrollDrive(lesson, right);
  const m = lesson.lesson_meta;
  const slug = m.lesson_id.toLowerCase();
  const entry = STAGE_LESSON_ENTRY.get(slug);
  const w = entry ? worldById(entry.world) : undefined;
  const done = useCourse((s) => !!s.lessonsDone[slug]);
  const { prev, next } = neighbours(slug);
  return (
    <main id="main" className="stage-page">
      <Stage lesson={lesson} />
      <div className="stage-right" ref={right}>
        <header className="lesson-head">
          <nav className="unit-crumbs" aria-label={tr('位置', 'Location')}>
            <a href="#/map">{tr('学习路线', 'Map')}</a>
            {w && (
              <>
                {' / '}
                <a href={`#/map/${w.id}`}>{worldName(w)}</a>
              </>
            )}
          </nav>
          <div className="lesson-chips">
            <span className="chip id">{m.lesson_id}</span>
            <span className="chip type">{m.lesson_type_label}</span>
            <span className="chip">
              约 {m.estimated_minutes} 分钟 · {lesson.right_acts.length} 幕
            </span>
            {done && <span className="chip done">✓ {tr('已通关', 'Passed')}</span>}
          </div>
          <h1>{m.title}</h1>
          <p className="lesson-sub">{m.subtitle}</p>
          <dl className="lesson-books">
            <div>
              <dt>主教材</dt>
              <dd>
                {m.textbook_primary.book} · {m.textbook_primary.sections.join('、')}
              </dd>
            </div>
            {m.textbook_supplement && (
              <div>
                <dt>补充</dt>
                <dd>{m.textbook_supplement}</dd>
              </div>
            )}
            <div>
              <dt>前置</dt>
              <dd>{m.prerequisites.length ? m.prerequisites.join('、') : '无（零基础起点）'}</dd>
            </div>
          </dl>
        </header>
        {lesson.right_acts.map((a) => (
          <ActCard key={a.act_index} act={a} lesson={lesson} total={lesson.right_acts.length} />
        ))}
        {(prev || next) && (
          <nav className="lesson-foot" aria-label={tr('上一项 / 下一项', 'Previous / next')}>
            {prev ? <RefLink r={prev} dir="prev" /> : <span />}
            {next && <RefLink r={next} primary={done} dir="next" />}
          </nav>
        )}
      </div>
    </main>
  );
}

export default function StageLessonPage() {
  useLang();
  const id = useStore((s) => s.lessonId)?.toLowerCase();
  const load = id ? LESSON_LOADERS[id] : undefined;
  const [lesson, setLesson] = useState<StageLesson | null>(null);
  useEffect(() => {
    let live = true;
    setLesson(null);
    void load?.().then((l) => live && setLesson(l));
    return () => {
      live = false;
    };
  }, [load]);
  if (load && !lesson) return <div className="stage-loading page">{tr('加载中…', 'Loading…')}</div>;
  if (!lesson)
    return (
      <main id="main" className="course-page">
        <div className="card unit-missing">
          <h1>{tr('找不到这节课', "This lesson doesn't exist")}</h1>
          <a href="#/map">{tr('回到学习路线', 'Back to the map')}</a>
        </div>
      </main>
    );
  return <LessonView lesson={lesson} />;
}
