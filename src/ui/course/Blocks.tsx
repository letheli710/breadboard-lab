// The blocks of a learning unit (docs/UNIT_FORMAT.md §3): text, note, steps (revealed one at a
// time), predict (answer first, then the explanation), explore (sliders + live results), sim
// (predict → run → explain, per scenario), circuit, bench, problems, portal.

import { useId, useMemo, useState } from 'react';
import type { Block, Output, Param, Scenario } from '../../core/course/unit';
import { evaluateModel, sliderToValue, valueToSlider } from '../../core/course/model';
import { tt } from '../../core/course/text';
import { formatSI } from '../../core/format';
import { tr } from '../../core/i18n';
import { evalExpr } from '../../core/problem/expr';
import type { Schematic } from '../../core/problem/types';
import { PORTALS, useCatalog } from '../../state/course';
import { entryTitle } from '../../state/problems';
import { formatRoute } from '../../state/router';
import { useStore } from '../../state/store';
import { Icon } from '../Icons';
import { ProblemSchematic } from '../ProblemSchematic';
import { PortalCard } from './Portals';
import { Inline, UnitMd } from './UnitMd';

/* ---------------------------------------------------------------- number formatting */

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
export function fmtValue(v: number, o: { unit?: string; digits?: number; percent?: boolean }): string {
  const d = o.digits ?? 3;
  if (!Number.isFinite(v)) return '—';
  if (o.percent) return `${parseFloat((v * 100).toPrecision(d))} %`;
  if (o.unit) return formatSI(v, o.unit, d);
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) {
    const [m, e] = v.toExponential(d - 1).split('e');
    return `${parseFloat(m)}×10${String(parseInt(e, 10))
      .split('')
      .map((c) => SUP[c] ?? c)
      .join('')}`;
  }
  return String(parseFloat(v.toPrecision(d)));
}

const envOf = (params: Param[], over: Record<string, number> = {}) => ({ ...Object.fromEntries(params.map((p) => [p.id, p.value])), ...over });

function Results({ outputs, values, caption }: { outputs: Output[]; values: number[]; caption: string }) {
  return (
    <table className="cmp u-results">
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {outputs.map((o, i) => (
          <tr key={i}>
            <th scope="row">
              <Inline text={tt(o.label)} />
            </th>
            <td>
              <output>{fmtValue(values[i], o)}</output>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---------------------------------------------------------------- steps */

function Steps({ b }: { b: Extract<Block, { type: 'steps' }> }) {
  const [shown, setShown] = useState(1);
  const all = shown >= b.steps.length;
  return (
    <section className="u-steps">
      {b.title && (
        <h3 className="u-title">
          <Inline text={tt(b.title)} />
        </h3>
      )}
      <ol aria-live="polite">
        {b.steps.slice(0, shown).map((s, i) => (
          <li key={i}>
            <UnitMd text={tt(s)} />
          </li>
        ))}
      </ol>
      <div className="row">
        {!all && (
          <button className="primary" onClick={() => setShown(shown + 1)}>
            {tr(`下一步（${shown}/${b.steps.length}）`, `Next step (${shown}/${b.steps.length})`)} <Icon name="next" size={15} />
          </button>
        )}
        {!all && <button onClick={() => setShown(b.steps.length)}>{tr('全部展开', 'Show all')}</button>}
        {all && shown > 1 && (
          <button className="pr-link" onClick={() => setShown(1)}>
            {tr('收起，从头再看', 'Collapse and start over')}
          </button>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- predict */

const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();

/** Grade a typed number: SI prefixes and arithmetic allowed ("10k", "1/11"), a trailing unit ignored. */
export function gradeNumber(input: string, answer: number, tol = 0.05, unit?: string): boolean | null {
  let s = input.trim().replace(/,/g, '.');
  if (unit && s.endsWith(unit)) s = s.slice(0, -unit.length).trim();
  if (!s) return null;
  const r = evalExpr(s);
  if ('error' in r) return null;
  return answer === 0 ? Math.abs(r.value) < 1e-9 : Math.abs(r.value - answer) <= Math.abs(answer) * tol;
}

function Predict({ b }: { b: Extract<Block, { type: 'predict' }> }) {
  const id = useId();
  const [pick, setPick] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<'right' | 'wrong' | 'shown' | null>(null);
  const [bad, setBad] = useState(false);
  const submit = () => {
    if (b.choices) {
      if (pick === null) return;
      setResult(pick === b.correct ? 'right' : 'wrong');
    } else if (b.answer !== undefined) {
      const g = gradeNumber(text, b.answer, b.tol, b.unit);
      if (g === null) return setBad(true);
      setBad(false);
      setResult(g ? 'right' : 'wrong');
    } else if (b.text) {
      if (!text.trim()) return;
      setResult(b.text.some((t) => norm(t) === norm(text)) ? 'right' : 'wrong');
    }
  };
  const answerText = b.choices ? tt(b.choices[b.correct!]) : b.answer !== undefined ? `${fmtValue(b.answer, { digits: 4 })}${b.unit ? ` ${b.unit}` : ''}` : (b.text?.[0] ?? '');
  return (
    <section className={`u-predict ${result ?? ''}`} aria-labelledby={`${id}-q`}>
      <div className="eyebrow">{tr('先预测', 'Predict first')}</div>
      <div id={`${id}-q`} className="u-ask">
        <UnitMd text={tt(b.ask)} />
      </div>
      {b.choices ? (
        <div className="u-choices" role="radiogroup" aria-labelledby={`${id}-q`}>
          {b.choices.map((c, i) => (
            <label key={i} className={result && i === b.correct ? 'ok' : result === 'wrong' && i === pick ? 'no' : ''}>
              <input type="radio" name={id} checked={pick === i} onChange={() => setPick(i)} disabled={!!result} />
              <span>
                <Inline text={tt(c)} />
              </span>
            </label>
          ))}
        </div>
      ) : (
        <div className="row u-answer">
          <input
            className="u-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            disabled={!!result}
            aria-labelledby={`${id}-q`}
            aria-invalid={bad || undefined}
            inputMode={b.answer !== undefined ? 'decimal' : 'text'}
            placeholder={b.answer !== undefined ? tr('填数字，可以写 10k、1/11', 'a number; 10k or 1/11 also work') : tr('填答案', 'your answer')}
          />
          {b.unit && <span className="muted">{b.unit}</span>}
        </div>
      )}
      {bad && <p className="u-bad">{tr('看不懂这个数，请只填数字（可以带 k、m 这类前缀）。', "Couldn't read that number; type digits (k, m prefixes are fine).")}</p>}
      {!result ? (
        <div className="row">
          <button className="primary" onClick={submit} disabled={b.choices ? pick === null : !text.trim()}>
            {tr('提交', 'Check')}
          </button>
          <button className="pr-link" onClick={() => setResult('shown')}>
            {tr('直接看答案', 'Just show me')}
          </button>
        </div>
      ) : (
        <div className="u-reveal" role="status">
          <p className="u-verdict">
            {result === 'right'
              ? tr('✓ 对了。', '✓ Right.')
              : result === 'wrong'
                ? tr(`✗ 不对。答案是 ${answerText}。`, `✗ Not quite. The answer is ${answerText}.`)
                : tr(`答案是 ${answerText}。`, `The answer is ${answerText}.`)}
          </p>
          <UnitMd text={tt(b.explain)} />
          <button
            className="pr-link"
            onClick={() => {
              setResult(null);
              setPick(null);
              setText('');
            }}
          >
            {tr('再做一次', 'Try again')}
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- explore */

function Slider({ p, value, onChange }: { p: Param; value: number; onChange: (v: number) => void }) {
  const id = useId();
  const log = !!p.log;
  return (
    <div className="u-slider">
      <label htmlFor={id}>
        <span>
          <Inline text={tt(p.label)} />
        </span>
        <output htmlFor={id}>{fmtValue(value, { unit: p.unit, digits: 3 })}</output>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={1000}
        step={1}
        value={valueToSlider(value, p.min!, p.max!, log)}
        aria-valuetext={fmtValue(value, { unit: p.unit, digits: 3 })}
        onChange={(e) => {
          let v = sliderToValue(Number(e.target.value), p.min!, p.max!, log);
          // round to 3 significant figures so the numbers stay readable
          v = parseFloat(v.toPrecision(3));
          onChange(v);
        }}
      />
      <div className="u-range muted" aria-hidden>
        <span>{fmtValue(p.min!, { unit: p.unit })}</span>
        <span>{fmtValue(p.max!, { unit: p.unit })}</span>
      </div>
    </div>
  );
}

function Explore({ b }: { b: Extract<Block, { type: 'explore' }> }) {
  const [vals, setVals] = useState<Record<string, number>>(() => envOf(b.params));
  const values = useMemo(() => evaluateModel(b.outputs, vals), [b.outputs, vals]);
  return (
    <section className="u-explore card">
      <div className="eyebrow">{tr('动手调一调', 'Try it')}</div>
      {b.title && (
        <h3 className="u-title">
          <Inline text={tt(b.title)} />
        </h3>
      )}
      <div className="u-explore-grid">
        <div className="u-sliders">
          {b.params.map((p) => (
            <Slider key={p.id} p={p} value={vals[p.id]} onChange={(v) => setVals((s) => ({ ...s, [p.id]: v }))} />
          ))}
          <button className="pr-link" onClick={() => setVals(envOf(b.params))}>
            <Icon name="reset" size={14} /> {tr('恢复初始值', 'Reset')}
          </button>
        </div>
        <Results outputs={b.outputs} values={values} caption={tr('计算结果', 'Results')} />
      </div>
      {b.note && <UnitMd text={tt(b.note)} />}
    </section>
  );
}

/* ---------------------------------------------------------------- sim */

function ScenarioCard({ s, b, index }: { s: Scenario; b: Extract<Block, { type: 'sim' }>; index: number }) {
  const id = useId();
  const [pick, setPick] = useState<number | null>(null);
  const [ran, setRan] = useState(false);
  const values = useMemo(() => evaluateModel(b.outputs, envOf(b.params, s.set)), [b, s]);
  // one level below the sim's own title, if it has one
  const H = b.title ? 'h4' : 'h3';
  return (
    <article className={`u-scenario ${ran ? 'ran' : ''}`} aria-labelledby={`${id}-t`}>
      <H id={`${id}-t`}>
        {index + 1}. <Inline text={tt(s.label)} />
      </H>
      <div className="u-ask">
        <UnitMd text={tt(s.ask)} />
      </div>
      <div className="u-choices" role="radiogroup" aria-label={tr('你的预测', 'Your prediction')}>
        {s.choices.map((c, i) => (
          <label key={i} className={ran && i === s.correct ? 'ok' : ran && i === pick && pick !== s.correct ? 'no' : ''}>
            <input type="radio" name={id} checked={pick === i} onChange={() => setPick(i)} disabled={ran} />
            <span>
              <Inline text={tt(c)} />
            </span>
          </label>
        ))}
      </div>
      {!ran ? (
        <div className="row">
          <button className="primary" onClick={() => setRan(true)} disabled={pick === null}>
            ▶ {tr('运行仿真', 'Run')}
          </button>
          {pick === null && <span className="muted">{tr('先选一个预测', 'Pick a prediction first')}</span>}
        </div>
      ) : (
        <div className="u-reveal" role="status">
          <Results outputs={b.outputs} values={values} caption={tr('仿真结果', 'Simulation result')} />
          <p className="u-verdict">
            {pick === s.correct ? tr('✓ 和你的预测一样。', '✓ As you predicted.') : tr('✗ 和你的预测不一样，看看为什么：', '✗ Not what you predicted. Here is why:')}
          </p>
          <UnitMd text={tt(s.explain)} />
          <button
            className="pr-link"
            onClick={() => {
              setRan(false);
              setPick(null);
            }}
          >
            {tr('重新预测', 'Predict again')}
          </button>
        </div>
      )}
    </article>
  );
}

function Sim({ b }: { b: Extract<Block, { type: 'sim' }> }) {
  return (
    <section className="u-sim card">
      <div className="eyebrow">{tr('仿真：先预测，再运行', 'Simulation: predict, then run')}</div>
      {b.title && (
        <h3 className="u-title">
          <Inline text={tt(b.title)} />
        </h3>
      )}
      {b.intro && <UnitMd text={tt(b.intro)} />}
      <div className="u-scenarios">
        {b.scenarios.map((s, i) => (
          <ScenarioCard key={i} s={s} b={b} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- links */

function Bench({ b }: { b: Extract<Block, { type: 'bench' }> }) {
  const ch = useStore((s) => s.challenges.find((c) => c.id === b.challenge));
  const done = useStore((s) => !!s.completed[b.challenge]);
  const href = formatRoute({ page: ch?.kind === 'lesson' ? 'learn' : 'challenges', id: b.challenge });
  return (
    <section className="u-bench card">
      <div className="eyebrow">{tr('上面包板', 'On the breadboard')}</div>
      <h3 className="u-title">
        <a href={href}>{ch?.title ?? b.challenge}</a> {done && <span className="badge done">{tr('已完成', 'Done')}</span>}
      </h3>
      <UnitMd text={tt(b.note)} />
      <a className="button primary" href={href}>
        {tr('打开面包板', 'Open the breadboard')} <Icon name="next" size={15} />
      </a>
    </section>
  );
}

function Problems({ b }: { b: Extract<Block, { type: 'problems' }> }) {
  const problems = useStore((s) => s.problems);
  const done = useStore((s) => s.practiceDone);
  return (
    <section className="u-problems">
      <div className="eyebrow">{tr('练习区的题', 'Practice problems')}</div>
      {b.note && <UnitMd text={tt(b.note)} />}
      <ul>
        {b.ids.map((pid) => {
          const p = problems.find((x) => x.id === pid);
          return (
            <li key={pid}>
              <a href={formatRoute({ page: 'practice', id: pid })}>{p ? entryTitle(p) : pid}</a>
              {p && <span className="muted"> {'★'.repeat(p.level)}</span>}
              {done[pid] && <span className="badge done">{tr('已完成', 'Done')}</span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PortalBlock({ id }: { id: string }) {
  useCatalog();
  const p = PORTALS.find((x) => x.id === id);
  return p ? <PortalCard portal={p} /> : null;
}

/* ---------------------------------------------------------------- dispatch */

export function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case 'text':
      return <UnitMd text={tt(b.md)} />;
    case 'note':
      return (
        <div className={`u-note ${b.tone}`} role="note">
          <UnitMd text={tt(b.md)} />
        </div>
      );
    case 'steps':
      return <Steps b={b} />;
    case 'predict':
      return <Predict b={b} />;
    case 'explore':
      return <Explore b={b} />;
    case 'sim':
      return <Sim b={b} />;
    case 'circuit':
      return (
        <figure className="u-circuit">
          <ProblemSchematic schematic={b.schematic as Schematic} />
          <figcaption>
            <Inline text={tt(b.caption)} />
          </figcaption>
        </figure>
      );
    case 'bench':
      return <Bench b={b} />;
    case 'problems':
      return <Problems b={b} />;
    case 'portal':
      return <PortalBlock id={b.id} />;
  }
}
