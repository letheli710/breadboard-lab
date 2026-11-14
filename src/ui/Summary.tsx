// "要点 / Key points": the summary page of a Practice chapter (summaries/<chapter>.json).
// Key ideas (each linking the problems that practise it), a printable formula sheet, worked
// examples drawn with the problem schematic renderer, and common mistakes.

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { tr } from '../core/i18n';
import { chapterById } from '../core/problem/chapters';
import { formatAnswer } from '../core/problem/parse';
import { ideaOfProblem, type ChapterSummary, type SummaryExample } from '../core/summary/parse';
import { countsAsDone, problemStatus } from '../state/practice';
import { entryTitle, type ProblemEntry } from '../state/problems';
import { useStore } from '../state/store';
import { useSummary, type SummaryTarget } from '../state/summaries';
import { Icon } from './Icons';
import { ProblemSchematic } from './ProblemSchematic';
import { UiPlot } from './UiPlot';
import { GraphFigure } from './GraphFigure';
import { PrMd, Sym } from './richText';
import { MathText } from './mathText';
import { prefersReducedMotion } from './reveal';

type SectionKey = 'ideas' | 'formulas' | 'examples' | 'mistakes';

/** DOM id of a section or key idea ("idea-<id>" targets a key idea). */
const domId = (section: string) => `sum-${section}`;

function Section({
  k,
  title,
  count,
  open,
  onToggle,
  children,
  tools,
}: {
  k: SectionKey;
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  tools?: ReactNode;
}) {
  return (
    <section className={`sum-sec sum-${k}`} id={domId(k)}>
      <div className="sum-sec-head">
        <h2 className="sum-sec-h">
          <button className="sum-sec-toggle" onClick={onToggle} aria-expanded={open}>
            <span className={`sum-caret ${open ? 'open' : ''}`} aria-hidden>
              ▸
            </span>
            <span className="sum-sec-title">{title}</span>
            <span className="sum-sec-count">{count}</span>
          </button>
        </h2>
        {tools}
      </div>
      <div className="sum-sec-body" hidden={!open}>
        {children}
      </div>
    </section>
  );
}

function ProblemChips({ ids, problems }: { ids: string[]; problems: ProblemEntry[] }) {
  const answers = useStore((s) => s.practiceAnswers);
  const done = useStore((s) => s.practiceDone);
  const openProblem = useStore((s) => s.openProblem);
  const list = ids.map((id) => problems.find((p) => p.id === id)).filter((p): p is ProblemEntry => !!p);
  if (!list.length) return null;
  return (
    <div className="sum-practise">
      <span className="sum-practise-label">{tr('练习', 'Practise')}:</span>
      {list.map((p) => {
        const st = problemStatus(answers[p.id], p.qids) ?? (done[p.id] ? 'unaided' : null);
        return (
          <button key={p.id} className={`sum-chip ${countsAsDone(st) ? 'done' : ''}`} onClick={() => openProblem(p.id)}>
            {countsAsDone(st) ? '✓ ' : ''}
            <Sym text={entryTitle(p)} />
            <span className="pr-plevel">{'★'.repeat(p.level)}</span>
          </button>
        );
      })}
    </div>
  );
}

function Example({ ex, n, ideaTitle, jump }: { ex: SummaryExample; n: number; ideaTitle: (id: string) => string; jump: (section: string) => () => void }) {
  const p = ex.problem;
  return (
    <div className="sum-example" id={domId(`example-${ex.id}`)}>
      <h3 className="sum-ex-title">
        <span className="sum-num">{tr(`例 ${n}`, `Example ${n}`)}</span> <Sym text={p.title} />
      </h3>
      <div className="pr-meta">
        {ex.ideas.map((id) => (
          <button key={id} className="pr-tag sum-tag" onClick={jump(`idea-${id}`)}>
            <Sym text={ideaTitle(id)} />
          </button>
        ))}
      </div>
      <div className="sum-ex-body">
        <div className="sum-ex-left">
          <div className="pr-statement">
            <PrMd text={p.statement} />
          </div>
          <div className="schem-card pr-schem">
            <ProblemSchematic schematic={p.schematic} />
          </div>
          {p.schematic.plot && <UiPlot schematic={p.schematic} />}
          {p.schematic.graph && <GraphFigure graph={p.schematic.graph} />}
        </div>
        <div className="sum-ex-right">
          <div className="eyebrow">{tr('解题步骤', 'Step by step')}</div>
          <div className="sum-steps">
            <PrMd text={p.solution} />
          </div>
          <div className="sum-results">
            <div className="eyebrow">{tr('结果（已由引擎核对）', 'Results (checked by the engine)')}</div>
            <ul>
              {p.questions.map((q) => (
                <li key={q.id}>
                  <span className="sum-res-ask">
                    <Sym text={q.ask.replace(/\s*=\s*[?？]\s*$/, '')} />
                  </span>
                  <b>{formatAnswer(q)}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SummaryBody({ s, target, problems }: { s: ChapterSummary; target: SummaryTarget; problems: ProblemEntry[] }) {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({ ideas: true, formulas: true, examples: true, mistakes: true });
  const toggle = (k: SectionKey) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const ideaTitle = (id: string) => s.ideas.find((x) => x.id === id)?.title ?? id;
  const ideaNum = (id: string) => s.ideas.findIndex((x) => x.id === id) + 1;
  const focus = target.section ?? (target.problem ? ideaOfProblem(s, target.problem) && `idea-${ideaOfProblem(s, target.problem)}` : undefined);
  const [flash, setFlash] = useState<string | undefined>(focus);
  const openSummary = useStore((st) => st.openSummary);
  // opened from a problem: put the key idea it resolved to into the URL (replaces the entry)
  useEffect(() => {
    if (focus && !target.section) openSummary({ ...target, section: focus });
  }, [focus, target, openSummary]);

  // scroll to the requested key idea / section (opening its section first)
  useEffect(() => {
    if (!focus) return;
    const sec: SectionKey = focus.startsWith('idea-') ? 'ideas' : focus.startsWith('example-') ? 'examples' : (focus as SectionKey);
    if (sec in open) setOpen((o) => (o[sec] ? o : { ...o, [sec]: true }));
    setFlash(focus);
    const t = setTimeout(() => document.getElementById(domId(focus))?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' }), 30);
    const t2 = setTimeout(() => setFlash(undefined), 2200);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, s]);

  const byIdea = useMemo(() => s.ideas.map((idea) => ({ idea, formulas: s.formulas.filter((f) => f.idea === idea.id) })).filter((g) => g.formulas.length), [s]);

  const printFormulas = () => {
    document.body.classList.add('print-formulas');
    const done = () => {
      document.body.classList.remove('print-formulas');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
  };

  // buttons, not #anchors: the location hash belongs to the app's router
  const jump = (section: string) => () => {
    const sec = section.startsWith('idea-') ? 'ideas' : (section as SectionKey);
    setOpen((o) => ({ ...o, [sec]: true }));
    setFlash(section);
    setTimeout(() => document.getElementById(domId(section))?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' }), 30);
  };

  return (
    <>
      {s.intro && (
        <div className="sum-intro">
          <PrMd text={s.intro} />
        </div>
      )}
      <nav className="sum-toc no-print" aria-label={tr('本页目录', 'On this page')}>
        {(
          [
            ['ideas', tr('要点', 'Key ideas'), s.ideas.length],
            ['formulas', tr('公式表', 'Formula sheet'), s.formulas.length],
            ['examples', tr('例题', 'Worked examples'), s.examples.length],
            ['mistakes', tr('易错点', 'Common mistakes'), s.mistakes.length],
          ] as const
        ).map(([k, label, n]) => (
          <button key={k} className="sum-toc-item" onClick={jump(k)}>
            {label} <span className="sum-sec-count">{n}</span>
          </button>
        ))}
      </nav>

      <Section k="ideas" title={tr('要点', 'Key ideas')} count={s.ideas.length} open={open.ideas} onToggle={() => toggle('ideas')}>
        <ol className="sum-ideas">
          {s.ideas.map((idea, i) => (
            <li key={idea.id} id={domId(`idea-${idea.id}`)} className={`sum-idea ${flash === `idea-${idea.id}` ? 'flash' : ''}`}>
              <h3>
                <span className="sum-num">{i + 1}</span> <Sym text={idea.title} />
              </h3>
              <PrMd text={idea.text} />
              <ProblemChips ids={idea.problems} problems={problems} />
            </li>
          ))}
        </ol>
      </Section>

      <Section
        k="formulas"
        title={tr('公式表', 'Formula sheet')}
        count={s.formulas.length}
        open={open.formulas}
        onToggle={() => toggle('formulas')}
        tools={
          <button className="pr-link no-print" onClick={printFormulas} title={tr('只打印公式表', 'Print just the formula sheet')}>
            <Icon name="download" size={14} /> {tr('打印', 'Print')}
          </button>
        }
      >
        <div className="sum-print-title">
          {chapterById(s.chapter)?.title()} · {tr('公式表', 'Formula sheet')}
        </div>
        {byIdea.map(({ idea, formulas }) => (
          <div key={idea.id} className="sum-fgroup">
            <div className="sum-fgroup-head">
              <button className="sum-linkish" onClick={jump(`idea-${idea.id}`)}>
                {ideaNum(idea.id)}. <Sym text={idea.title} />
              </button>
            </div>
            {formulas.map((f) => (
              <div key={f.id} className="sum-formula">
                <div className="sum-f-name">
                  <Sym text={f.name} />
                </div>
                <div className="sum-f-expr">
                  <MathText text={f.expr} />
                </div>
                <div className="sum-f-when">
                  <PrMd text={f.when} />
                  {f.note && (
                    <div className="sum-f-note">
                      <PrMd text={f.note} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </Section>

      <Section k="examples" title={tr('例题', 'Worked examples')} count={s.examples.length} open={open.examples} onToggle={() => toggle('examples')}>
        {s.examples.map((ex, i) => (
          <Example key={ex.id} ex={ex} n={i + 1} ideaTitle={ideaTitle} jump={jump} />
        ))}
      </Section>

      <Section k="mistakes" title={tr('易错点', 'Common mistakes')} count={s.mistakes.length} open={open.mistakes} onToggle={() => toggle('mistakes')}>
        <ul className="sum-mistakes">
          {s.mistakes.map((m) => (
            <li key={m.id}>
              <span className="sum-warn" aria-hidden>
                !
              </span>
              <div>
                <PrMd text={m.text} />
                {m.idea && (
                  <button className="sum-linkish sum-back-idea no-print" onClick={jump(`idea-${m.idea}`)}>
                    → {ideaNum(m.idea)}. <Sym text={ideaTitle(m.idea)} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

export function SummaryPage({ target, problems }: { target: SummaryTarget; problems: ProblemEntry[] }) {
  const r = useSummary(target.chapter);
  const from = target.from;
  const openProblem = useStore((s) => s.openProblem);
  const chapter = chapterById(target.chapter);
  const back = from ? problems.find((p) => p.id === from) : undefined;
  const first = problems.find((p) => p.chapter === target.chapter);

  return (
    <article className="pr-main card sum-main">
      <header className="pr-head">
        <div className="pr-crumbs no-print">
          <span className="eyebrow">
            {tr(`第 ${chapter?.phase ?? '?'} 期`, `Phase ${chapter?.phase ?? '?'}`)} · {chapter?.title()}
          </span>
          {back ? (
            <button className="pr-link" onClick={() => openProblem(back.id)}>
              <Icon name="prev" size={15} /> {tr('回到题目', 'Back to the problem')}
            </button>
          ) : first ? (
            <button className="pr-link" onClick={() => openProblem(first.id)}>
              {tr('开始做题', 'Start the problems')} <Icon name="next" size={15} />
            </button>
          ) : null}
        </div>
        <div className="task-head">
          <span className="badge sum-badge">{tr('要点 KEY POINTS', 'KEY POINTS')}</span>
        </div>
        <h1 className="pr-title">{chapter?.title() ?? target.chapter}</h1>
      </header>
      {r?.summary ? (
        <SummaryBody s={r.summary} target={target} problems={problems} />
      ) : r ? (
        <ul>
          {r.errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">{tr('正在加载本章要点…', 'Loading the key points…')}</p>
      )}
    </article>
  );
}
