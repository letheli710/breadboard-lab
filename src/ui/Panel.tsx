import { useEffect, useMemo, useRef, useState } from 'react';
import type { Challenge } from '../core/challenge';
import { checkCircuit } from '../core/check';
import type { Issue } from '../core/diagnostics';
import { stripLabel, HOLE_MAP } from '../core/breadboard';
import { formatSI, volts } from '../core/format';
import { tr } from '../core/i18n';
import { isMcu } from '../core/mcu';
import { isFloating } from '../core/netlist';
import { describeComponent, PARTS, terminalLabel } from '../core/parts';
import { simulate } from '../core/solver';
import { nodeAc, useActiveChallenge, useDerived, type Derived } from '../state/derived';
import { useStore, type PanelTab } from '../state/store';
import { ConfirmButton } from './Confirm';
import { Icon } from './Icons';
import { Inspector } from './Inspector';
import { SchematicView } from './SchematicView';
import { celebrate } from './celebrate';
import { buildChallengeFromBoard, downloadJson } from './exportChallenge';
import { MeasurementSection, StageBar, useMeasureState } from './Measurements';
import { HiddenReadingsNote } from './HiddenReadings';
import { HIDDEN, useReadingsHidden } from '../state/readingsHidden';
import { allAnswered, emptyReadings, matchBoard, revalidate, structureKey } from '../core/readings';

import { Md } from './Md';
import { Prereqs, StepStatus, useStepChecks } from './StepCheck';
import { useBenchUi } from '../state/benchUi';
import { tabListKeys } from './a11y';
import { Mixed } from './Mixed';

export function IssueList({ issues, emptyText }: { issues: Issue[]; emptyText?: string }) {
  const setHighlight = useStore((s) => s.setHighlight);
  const highlight = useStore((s) => s.highlight);
  if (issues.length === 0) return <div className="ok-box">{emptyText ?? tr('没有发现问题 👍', 'No problems found 👍')}</div>;
  return (
    <ul className="issues">
      {issues.map((i, k) => {
        const active = highlight && highlight.refs.join() === i.refs.join() && highlight.holes.join() === i.holes.join();
        return (
          <li
            key={k}
            className={`issue ${i.severity} ${active ? 'active' : ''}`}
            onMouseEnter={() => setHighlight({ refs: i.refs, holes: i.holes, tone: i.severity === 'info' ? 'info' : 'error' })}
            onMouseLeave={() => setHighlight(null)}
          >
            <div className="issue-title">
              <span className="sev" aria-hidden>
                {i.severity === 'error' ? '✕' : i.severity === 'warning' ? '!' : 'i'}
              </span>
              <span className="sr-only">{i.severity === 'error' ? tr('错误：', 'Error: ') : i.severity === 'warning' ? tr('警告：', 'Warning: ') : tr('提示：', 'Note: ')}</span>
              {i.title}
            </div>
            {i.detail && <div className="issue-detail">{i.detail}</div>}
          </li>
        );
      })}
    </ul>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" role="img" aria-label={tr(`难度 ${n} / 5`, `Level ${n} of 5`)}>
      {'★'.repeat(n) + '☆'.repeat(5 - n)}
    </span>
  );
}

function TaskPanel({ ch }: { ch: Challenge }) {
  const step = useStore((s) => s.step);
  const setStep = useStore((s) => s.setStep);
  const hintsShown = useStore((s) => s.hintsShown);
  const showHint = useStore((s) => s.showHint);
  const check = useStore((s) => s.check);
  const setCheck = useStore((s) => s.setCheck);
  const loadLayout = useStore((s) => s.loadLayout);
  const markCompleted = useStore((s) => s.markCompleted);
  const completed = useStore((s) => s.completed);
  const setCelebrate = useStore((s) => s.setCelebrate);
  const { nl, issues } = useDerived();
  const targetSim = useMemo(() => simulate(ch.target), [ch]);

  const evaluate = () => {
    const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
    const boardErrors = issues.filter((i) => i.severity === 'error');
    if (r.perfect && boardErrors.length) {
      r.perfect = false;
      r.issues.push(...boardErrors);
    }
    if (nl.unplaced.length) {
      r.perfect = false;
      r.issues.unshift(...issues.filter((i) => i.code === 'unplaced'));
    }
    return r;
  };
  // the check result is text in the current language: when the challenge is re-parsed (language
  // switch) re-evaluate it in place, without celebrating again
  const lastCh = useRef(ch);
  useEffect(() => {
    if (lastCh.current === ch) return;
    const same = lastCh.current.id === ch.id;
    lastCh.current = ch;
    if (same && useStore.getState().check) setCheck(evaluate());
  }, [ch]); // eslint-disable-line react-hooks/exhaustive-deps
  // labs with measurement questions: the circuit check is stage 1, the readings stage 2
  const hasM = ch.measurements.length > 0;
  const ms = useMeasureState(ch);
  const setReadings = useStore((s) => s.setReadings);
  const complete = () => {
    markCompleted(ch.id);
    setCelebrate(true);
    celebrate();
  };
  const runCheck = () => {
    const r = evaluate();
    setCheck(r);
    if (!r.perfect) return;
    if (!hasM) return complete();
    const cur = useStore.getState().readings[ch.id] ?? emptyReadings();
    const m = matchBoard(ch, nl.circuit);
    const next = m ? revalidate(ch, { ...cur, passed: structureKey(ch, nl.circuit) }, m) : cur;
    setReadings(ch.id, next);
    if (m && allAnswered(ch, next, m)) complete();
  };

  // the phone task bar (BenchBar) has its own Check button
  const runCheckRef = useRef(runCheck);
  runCheckRef.current = runCheck;
  useEffect(() => {
    const on = () => runCheckRef.current();
    window.addEventListener('bb-run-check', on);
    return () => window.removeEventListener('bb-run-check', on);
  }, []);

  const nSteps = ch.steps.length;
  const cur = Math.min(step, Math.max(0, nSteps - 1));
  const sc = useStepChecks(ch);
  // a step counts as done when its check passed (steps without a check: once passed)
  const stepDone = (i: number) => (sc.unmet[i] ? sc.done.has(i) : i < cur);

  return (
    <div className="task">
      <div className="task-head">
        <span className={`badge ${ch.kind}`}>
          <Mixed text={ch.kind === 'lesson' ? tr('课程 LESSON', 'LESSON') : tr('挑战 CHALLENGE', 'CHALLENGE')} />
        </span>
        <Stars n={ch.level} />
        {completed[ch.id] && <span className="badge done">✓ {tr('已完成', 'Done')}</span>}
        {ch.source !== 'folder' && <span className="badge src">{tr('导入', 'Imported')}</span>}
      </div>
      <h2>{ch.title}</h2>
      {ch.summary && <p className="summary">{ch.summary}</p>}
      <Prereqs ch={ch} />
      {hasM && <StageBar circuitOk={ms.passed} st={ms} />}

      {nSteps > 0 && (
        <section className="steps" aria-label={tr('步骤', 'Steps')}>
          <div className="steps-head">
            <span className="eyebrow">
              {tr('步骤', 'Step')} {cur + 1} / {nSteps}
            </span>
            <span className="step-dots">
              {ch.steps.map((_, i) => (
                <button
                  key={i}
                  className={i === cur ? 'cur' : stepDone(i) ? 'done' : ''}
                  aria-current={i === cur ? 'step' : undefined}
                  aria-label={tr(`第 ${i + 1} 步`, `Step ${i + 1}`)}
                  onClick={() => setStep(i)}
                >
                  {i !== cur && stepDone(i) ? '✓' : i + 1}
                </button>
              ))}
            </span>
          </div>
          <div className="step-cur">
            {/* only the step text is live (announced on Back / Next); the check list is a status of its own */}
            <div aria-live="polite">
              <Md text={ch.steps[cur].text} />
            </div>
            <StepStatus unmet={sc.unmet[cur]} />
          </div>
          <div className="row">
            <button disabled={cur === 0} onClick={() => setStep(cur - 1)}>
              <Icon name="prev" /> {tr('上一步', 'Back')}
            </button>
            <button className="primary" disabled={cur >= nSteps - 1} onClick={() => setStep(cur + 1)}>
              {tr('下一步', 'Next')} <Icon name="next" />
            </button>
          </div>
        </section>
      )}

      {/* a live region that is always there, so the result of every check is announced once */}
      <div className="check-live" aria-live="polite" aria-atomic="false">
        {check && (
          <div className="check-result">
            {!check.undecided && (
              <div className="progress-row">
                <span>{tr('连接正确度', 'Connections correct')}</span>
                <div className="bar">
                  <div style={{ width: `${Math.round(check.progress * 100)}%` }} />
                </div>
                <b>{Math.round(check.progress * 100)}%</b>
              </div>
            )}
            {check.undecided ? (
              <IssueList issues={check.issues} />
            ) : check.perfect && hasM && !ms.complete ? (
              <div className="ok-box big">
                ✓{' '}
                {tr(
                  `电路正确${check.testsTotal ? `，${check.testsTotal} 项功能测试全部通过` : ''}。第 1 步完成——现在用仪表读你的面包板，完成下面的 ${ms.required} 道测量题。`,
                  `The circuit is right${check.testsTotal ? ` and all ${check.testsTotal} function tests pass` : ''}. Stage 1 done — now read your board's instruments and answer the ${ms.required} measurement questions below.`,
                )}
              </div>
            ) : check.perfect ? (
              <div className="ok-box big">
                🎉{' '}
                {tr(
                  `完全正确！连接关系与目标电路一致${check.testsTotal ? `，${check.testsTotal} 项功能测试全部通过` : ''}。`,
                  `Perfect! The connections match the target circuit${check.testsTotal ? ` and all ${check.testsTotal} function tests pass` : ''}.`,
                )}
              </div>
            ) : (
              <>
                <p className="note">
                  {tr('把鼠标移到下面的条目上，3D 视图会高亮出相关的元件和孔位。', 'Hover an item below to highlight the parts and holes involved in the 3D view.')}
                </p>
                <IssueList issues={check.issues} />
              </>
            )}
          </div>
        )}
      </div>

      {hintsShown > 0 && (
        <ul className="hints">
          {ch.hints.slice(0, hintsShown).map((h, i) => (
            <li key={i}>
              <Icon name="bulb" size={14} /> {h}
            </li>
          ))}
        </ul>
      )}

      {hasM && <MeasurementSection ch={ch} st={ms} onComplete={complete} />}

      <details className="fold" open>
        <summary>{ch.kind === 'lesson' ? tr('课程说明', 'About this lesson') : tr('题目说明', 'About this task')}</summary>
        <Md text={ch.description} />
      </details>

      <details className="fold" open>
        <summary>
          <Mixed text={tr('目标电路图 TARGET SCHEMATIC', 'Target schematic')} />
        </summary>
        <div className="schem-card">
          {/* with measurement questions the target's simulated currents / voltages would give the readings away */}
          <SchematicView circuit={ch.target} sim={targetSim} showValues hideReadings={hasM} />
        </div>
        <p className="note">
          {tr(
            '原理图只说明“谁和谁连在一起”，不规定插在面包板哪个孔。只要连接关系一样就算对。',
            'A schematic only says what connects to what — not which breadboard holes to use. Any layout with the same connections counts as correct.',
          )}
        </p>
      </details>

      {/* sticky at the bottom of the scrolling panel: always on screen */}
      <div className="actions">
        <button className="primary big" onClick={runCheck}>
          <Icon name="check" /> {tr('检查我的电路', 'Check my circuit')}
        </button>
        <div className="row">
          {ch.hints.length > 0 && (
            <button onClick={showHint} disabled={hintsShown >= ch.hints.length}>
              <Icon name="bulb" /> {tr('提示', 'Hint')} ({hintsShown}/{ch.hints.length})
            </button>
          )}
          <ConfirmButton
            message={tr('重置面包板到初始状态？（可以撤销）', 'Reset the breadboard to its starting state? (You can undo.)')}
            confirmLabel={tr('重置', 'Reset')}
            onConfirm={() => loadLayout(ch.start ?? { version: 1, parts: [] })}
          >
            <Icon name="reset" /> {tr('重置', 'Reset')}
          </ConfirmButton>
          {ch.solution && (
            <ConfirmButton
              message={tr('加载参考答案？当前面包板会被替换（可以撤销）。', 'Load the reference answer? It replaces your current board (you can undo).')}
              confirmLabel={tr('看答案', 'Show answer')}
              onConfirm={() => loadLayout(ch.solution!)}
            >
              <Icon name="eye" /> {tr('看答案', 'Show answer')}
            </ConfirmButton>
          )}
        </div>
      </div>
    </div>
  );
}

/** Netlist voltage cell: DC value, or average + AC swing when a generator is on the board. */
function NodeVolt({ d, net, hide }: { d: Derived; net: string; hide?: boolean }) {
  if (hide) return <>{HIDDEN}</>;
  const a = nodeAc(d, net);
  if (!a) return <>{(d.sim.nodeV.get(net) ?? 0).toFixed(2)}V</>;
  return (
    <>
      <div>
        {tr('平均', 'avg')} {volts(a.avg)}
      </div>
      <div className="ac">{a.pp >= 1e-3 ? `${tr('交流', 'AC')} ${formatSI(a.pp, 'Vpp')}` : tr('无交流', 'no AC')}</div>
    </>
  );
}

/** "Export as challenge JSON": an inline form (id + title) instead of the browser's prompt(). */
function ExportChallenge() {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState('my-circuit');
  const [title, setTitle] = useState('');
  const layout = useStore((s) => s.layout);
  const { nl } = useDerived();
  const btn = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) first.current?.select();
  }, [open]);
  const idOk = /^[A-Za-z0-9-]+$/.test(id);
  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => btn.current?.focus());
  };
  if (!open)
    return (
      <button ref={btn} onClick={() => setOpen(true)} aria-expanded={false}>
        <Icon name="download" /> {tr('导出为题目 JSON', 'Export as challenge JSON')}
      </button>
    );
  return (
    <form
      className="export-form"
      aria-label={tr('导出为题目 JSON', 'Export as challenge JSON')}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          close();
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!idOk) return;
        const t = title.trim() || tr('我的电路', 'My circuit');
        downloadJson(`${id}.json`, buildChallengeFromBoard(layout, nl.circuit, id, t));
        close();
      }}
    >
      <label>
        <span>{tr('题目 id（字母 / 数字 / -）', 'Challenge id (letters / digits / -)')}</span>
        <input ref={first} value={id} onChange={(e) => setId(e.target.value.trim())} aria-invalid={!idOk} spellCheck={false} />
      </label>
      {!idOk && <div className="form-err">{tr('id 只能包含字母、数字和 -', 'The id may contain only letters, digits and -')}</div>}
      <label>
        <span>{tr('题目标题', 'Challenge title')}</span>
        <input value={title} placeholder={tr('我的电路', 'My circuit')} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <div className="row">
        <button type="button" onClick={close}>
          {tr('取消', 'Cancel')}
        </button>
        <button type="submit" className="primary" disabled={!idOk}>
          <Icon name="download" /> {tr('下载 JSON', 'Download JSON')}
        </button>
      </div>
    </form>
  );
}

function SchematicPanel() {
  const d = useDerived();
  const { nl, sim, ac } = d;
  const hoverNet = useStore((s) => s.hoverNet);
  const hoverHole = useStore((s) => s.hoverHole);
  const setHoverNet = useStore((s) => s.setHoverNet);
  const mode = useStore((s) => s.mode);
  const layout = useStore((s) => s.layout);
  const activeNet = hoverNet ?? (hoverHole ? (nl.holeNet.get(hoverHole) ?? null) : null);
  const hide = useReadingsHidden();
  const compOf = new Map(nl.circuit.components.map((c) => [c.ref, c]));
  // a dev board's unwired pins each sit on a one-pin net: keep them out of the netlist table
  const boardRefs = new Set(nl.circuit.components.filter((c) => isMcu(c.type)).map((c) => c.ref));

  return (
    <div className="schem-panel">
      <div className="eyebrow">{tr('我的电路 · 由面包板自动生成', 'My circuit · generated from the breadboard')}</div>
      <div className="schem-card">
        <SchematicView circuit={nl.circuit} sim={sim} ac={ac} hideReadings={hide} hoverNet={activeNet} onHoverNet={setHoverNet} />
      </div>
      {hide && <HiddenReadingsNote />}
      <p className="note">
        {tr(
          '电路图按电压从高到低排列：最上面是电源 +，最下面是 GND（⏚）。鼠标移到一条线上，3D 面包板里属于这个“结点”的所有孔都会亮起来。',
          'The schematic is drawn from high to low voltage: supply + at the top, GND (⏚) at the bottom. Hover a line and every hole on that node lights up on the 3D breadboard.',
        )}
      </p>
      {nl.circuit.nets.length > 0 && (
        <>
          <div className="eyebrow">
            <Mixed text={tr('结点表 NETLIST', 'NETLIST')} />
          </div>
          <table className="netlist">
            <caption className="sr-only">{tr('结点表：每个结点的电压、连接的引脚和面包板位置', 'Netlist: voltage, connected pins and breadboard holes of every node')}</caption>
            <thead>
              <tr>
                <th scope="col">{tr('结点', 'Node')}</th>
                <th scope="col">{tr('电压', 'Voltage')}</th>
                <th scope="col">{tr('连接的引脚', 'Pins')}</th>
                <th scope="col">{tr('面包板位置', 'Breadboard holes')}</th>
              </tr>
            </thead>
            <tbody>
              {nl.circuit.nets
                .filter((n) => !(n.pins.length === 1 && boardRefs.has(n.pins[0].slice(0, n.pins[0].lastIndexOf('.')))))
                .map((n) => {
                  const strips = [...new Set((nl.netHoles.get(n.name) ?? []).map((h) => HOLE_MAP.get(h)!.strip))];
                  return (
                    <tr key={n.name} className={activeNet === n.name ? 'on' : ''} onMouseEnter={() => setHoverNet(n.name)} onMouseLeave={() => setHoverNet(null)}>
                      <th scope="row">
                        <b>{isFloating(n.name) ? tr('悬空', 'floating') : n.name}</b>
                      </th>
                      <td className="volt">
                        <NodeVolt d={d} net={n.name} hide={hide} />
                      </td>
                      <td>
                        {n.pins.map((p) => {
                          const [ref, pin] = [p.slice(0, p.lastIndexOf('.')), p.slice(p.lastIndexOf('.') + 1)];
                          const c = compOf.get(ref);
                          return <div key={p}>{c ? terminalLabel(c, pin) : p}</div>;
                        })}
                      </td>
                      <td className="strips">{strips.map(stripLabel).join('、') || '—'}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </>
      )}
      {mode === 'sandbox' && nl.circuit.components.length > 0 && (
        <div className="row">
          <ExportChallenge />
          <button onClick={() => downloadJson('breadboard-layout.json', layout)}>
            <Icon name="download" /> {tr('导出面包板布局', 'Export board layout')}
          </button>
        </div>
      )}
    </div>
  );
}

function IssuesPanel() {
  const { issues, nl } = useDerived();
  const counts = nl.circuit.components.reduce<Record<string, number>>((m, c) => ((m[describeComponent(c)] = (m[describeComponent(c)] ?? 0) + 1), m), {});
  return (
    <div>
      <div className="eyebrow">{tr('实时诊断 · 常见错误检测', 'Live diagnostics · common mistakes')}</div>
      <IssueList
        issues={issues}
        emptyText={tr(
          '没有检测到常见错误 👍（这不代表电路一定符合题目要求——用“检查”按钮核对）',
          'No common mistakes found 👍 (that doesn\'t mean it matches the task — use the "Check" button for that)',
        )}
      />
      {Object.keys(counts).length > 0 && (
        <>
          <div className="eyebrow" style={{ marginTop: 16 }}>
            <Mixed text={tr('元件清单 BOM', 'Parts list (BOM)')} />
          </div>
          <ul className="bom">
            {Object.entries(counts).map(([k, v]) => (
              <li key={k}>
                <span>{k}</span>
                <b>× {v}</b>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function SidePanel() {
  const panel = useStore((s) => s.panel);
  const setPanel = useStore((s) => s.setPanel);
  const ch = useActiveChallenge();
  const { issues } = useDerived();
  const nErr = issues.filter((i) => i.severity !== 'info').length;
  const tabs: [PanelTab, string][] = [
    ...(ch ? ([['task', ch.kind === 'lesson' ? tr('课程', 'Lesson') : tr('题目', 'Task')]] as [PanelTab, string][]) : []),
    ['schematic', tr('我的电路图', 'My schematic')],
    ['issues', tr('诊断', 'Diagnostics') + (nErr ? ` (${nErr})` : '')],
    ['inspect', tr('属性', 'Properties')],
  ];
  const cur = panel === 'task' && !ch ? 'schematic' : panel;
  return (
    <aside className="side card" aria-label={tr('任务与电路', 'Task and circuit')}>
      <div className="side-top">
        <div className="tabs" role="tablist" aria-label={tr('面板', 'Panel')} onKeyDown={tabListKeys}>
          {tabs.map(([k, label]) => (
            <button
              key={k}
              id={`side-tab-${k}`}
              role="tab"
              aria-selected={cur === k}
              aria-controls="side-panel"
              tabIndex={cur === k ? 0 : -1}
              className={cur === k ? 'on' : ''}
              onClick={() => setPanel(k)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          className="side-collapse"
          onClick={() => useBenchUi.getState().setSide(useBenchUi.getState().sideW, true)}
          title={tr('收起面板，让面包板更宽（拖动中间的分隔条也行）', 'Hide the panel to widen the board (or drag the divider)')}
          aria-label={tr('收起面板', 'Hide the panel')}
        >
          ›
        </button>
      </div>
      <div className="side-body" role="tabpanel" id="side-panel" tabIndex={-1} aria-labelledby={`side-tab-${cur}`}>
        {cur === 'task' && ch && <TaskPanel ch={ch} />}
        {cur === 'schematic' && <SchematicPanel />}
        {cur === 'issues' && <IssuesPanel />}
        {cur === 'inspect' && <Inspector />}
      </div>
    </aside>
  );
}

export const partName = (t: keyof typeof PARTS) => PARTS[t].name;
