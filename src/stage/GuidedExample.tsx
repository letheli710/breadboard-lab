// A Socratic guided example (blueprint v2, rule 4): the problem, then one step at a time — a small
// diagram, a question, a hint on demand, options whose wrong ones get the professor's intercept.
// A right answer writes the step's TeX on the blackboard (which grows step by step), lights the
// step's stage ids and moves on. "Start over" clears it.

import { useEffect, useRef, useState } from 'react';
import { useStage } from './stageStore';
import { StageText, Tex } from './StageText';
import type { GuidedBlock } from './types';

function Svg({ src }: { src: string }) {
  // lesson-sheet SVG source, bundled with the app (not user content)
  return <div className="act-svg" dangerouslySetInnerHTML={{ __html: src }} />;
}

export function GuidedExample({ b }: { b: GuidedBlock }) {
  const [step, setStep] = useState(0); // index of the open step; === steps.length when done
  const [picked, setPicked] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const setFocus = useStage((s) => s.setFocus);
  const setParams = useStage((s) => s.setParams);
  // re-applied when the stage starts following another act (following clears the focus)
  const activeKey = useStage((s) => s.activeKey);
  const done = step >= b.steps.length;
  const cur = done ? undefined : b.steps[step];

  // light the open step on the stage while its act is the one the stage follows (following an
  // act clears the focus, so it is applied again when this act comes back into view)
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!cur) return;
    const own = root.current?.closest<HTMLElement>('[data-sync-key]')?.dataset.syncKey;
    if (own && activeKey !== own) return;
    if (cur.halo) setFocus(cur.halo);
    if (cur.params) setParams(cur.params);
  }, [cur, activeKey, setFocus, setParams]);

  const choose = (i: number) => {
    setPicked(i);
  };
  const next = () => {
    setStep((n) => n + 1);
    setPicked(null);
    setHint(false);
  };
  const chosen = cur && picked !== null ? cur.options[picked] : undefined;

  return (
    <div className="guided" ref={root}>
      <div className="guided-head">
        <span className="guided-tag">苏格拉底引导例题</span>
        {b.source && <span className="guided-src">{b.source}</span>}
      </div>
      <h3 className="guided-title">
        <StageText text={b.title} />
      </h3>
      <p className="guided-problem">
        <StageText text={b.problem} />
      </p>
      {b.problem_svg && (
        <figure className="act-figure">
          <Svg src={b.problem_svg} />
        </figure>
      )}

      <ol className="guided-progress" aria-label="步骤">
        {b.steps.map((_, i) => (
          <li key={i} className={i < step ? 'done' : i === step ? 'on' : ''}>
            {i + 1}
          </li>
        ))}
      </ol>

      {cur && (
        <div className="guided-step" aria-live="polite">
          <div className="guided-step-title">
            <StageText text={cur.title} />
          </div>
          {cur.mini_svg && (
            <figure className="act-figure mini">
              <Svg src={cur.mini_svg} />
            </figure>
          )}
          <p className="guided-q">
            <StageText text={cur.question} />
          </p>
          <div className="quiz-options" role="radiogroup" aria-label={cur.title}>
            {cur.options.map((o, i) => (
              <button
                key={i}
                role="radio"
                aria-checked={picked === i}
                className={`quiz-opt ${picked === i ? (o.correct ? 'right' : 'wrong') : ''}`}
                onClick={() => choose(i)}
                disabled={!!chosen?.correct}
              >
                <span className="quiz-key">{'ABCDEF'[i]}</span>
                <span className="quiz-text">
                  <StageText text={o.text} />
                </span>
              </button>
            ))}
          </div>
          {chosen && (
            <div className={`quiz-feedback ${chosen.correct ? 'right' : 'wrong'}`} role="status">
              <b>{chosen.correct ? '教授：' : '教授拦截：'}</b>
              <StageText text={chosen.feedback} />
            </div>
          )}
          <div className="guided-actions">
            {!chosen?.correct && (
              <button className="button" onClick={() => setHint((h) => !h)} aria-expanded={hint}>
                {hint ? '收起提示' : '给我一点提示'}
              </button>
            )}
            {chosen?.correct && (
              <button className="button primary" onClick={next}>
                {step === b.steps.length - 1 ? '写完黑板' : '写上黑板，下一步'}
              </button>
            )}
          </div>
          {hint && !chosen?.correct && (
            <div className="guided-hint">
              <StageText text={cur.hint} />
            </div>
          )}
        </div>
      )}

      <div className={`guided-board ${step === 0 ? 'empty' : ''}`} aria-label="黑板">
        <div className="board-title">黑板</div>
        {step === 0 && <p className="board-empty">每答对一步，这里写上一行推导。</p>}
        {b.steps.slice(0, step).map((s, i) => (
          <div key={i} className="board-step">
            <span className="board-n">{i + 1}</span>
            <div className="board-lines">
              {s.board.map((t, k) => (
                <Tex key={k} tex={t} display />
              ))}
            </div>
          </div>
        ))}
      </div>

      {done && (
        <div className="guided-done" role="status">
          {b.conclusion && (
            <p>
              <StageText text={b.conclusion} />
            </p>
          )}
          <button
            className="button"
            onClick={() => {
              setStep(0);
              setPicked(null);
              setHint(false);
            }}
          >
            从头再做一遍
          </button>
        </div>
      )}
    </div>
  );
}
