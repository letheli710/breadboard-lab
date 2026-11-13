import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
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

/** Tiny markdown subset: paragraphs, "- " lists, "## " headings, **bold**, `code`. */
export function Md({ text }: { text: string }) {
  const blocks: JSX.Element[] = [];
  let list: string[] = [];
  const inline = (s: string) =>
    s
      .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
      .map((t, i) => (t.startsWith('**') ? <b key={i}>{t.slice(2, -2)}</b> : t.startsWith('`') ? <code key={i}>{t.slice(1, -1)}</code> : <Fragment key={i}>{t}</Fragment>));
  const flush = () => {
    if (list.length)
      blocks.push(
        <ul key={blocks.length}>
          {list.map((l, i) => (
            <li key={i}>{inline(l)}</li>
          ))}
        </ul>,
      );
    list = [];
  };
  let code: string[] | null = null;
  let table: string[][] = [];
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((r) => !r.every((c) => /^:?-+:?$/.test(c.trim())));
    blocks.push(
      <table key={blocks.length} className="cmp">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => (i === 0 ? <th key={j}>{inline(c.trim())}</th> : <td key={j}>{inline(c.trim())}</td>))}</tr>
          ))}
        </tbody>
      </table>,
    );
    table = [];
  };
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    if (line.trimStart().startsWith('```')) {
      if (code) {
        blocks.push(<pre key={blocks.length}>{code.join('\n')}</pre>);
        code = null;
      } else {
        flush();
        flushTable();
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(raw);
      continue;
    }
    if (line.trimStart().startsWith('|')) {
      flush();
      table.push(
        line
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|'),
      );
      continue;
    }
    flushTable();
    if (/^\s*[-*] /.test(line)) list.push(line.replace(/^\s*[-*] /, ''));
    else if (/^\s*\d+\. /.test(line)) list.push(line.replace(/^\s*/, ''));
    else {
      flush();
      if (line.startsWith('#')) blocks.push(<h4 key={blocks.length}>{inline(line.replace(/^#+\s*/, ''))}</h4>);
      else if (line.trim()) blocks.push(<p key={blocks.length}>{inline(line)}</p>);
    }
  }
  flush();
  flushTable();
  if (code) blocks.push(<pre key={blocks.length}>{(code as string[]).join('\n')}</pre>);
  return <div className="md">{blocks}</div>;
}

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
              <span className="sev">{i.severity === 'error' ? '✕' : i.severity === 'warning' ? '!' : 'i'}</span>
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
  return <span className="stars">{'★'.repeat(n) + '☆'.repeat(5 - n)}</span>;
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
  const runCheck = () => {
    const r = evaluate();
    setCheck(r);
    if (r.perfect) {
      markCompleted(ch.id);
      setCelebrate(true);
      celebrate();
    }
  };

  const nSteps = ch.steps.length;
  const cur = Math.min(step, Math.max(0, nSteps - 1));

  return (
    <div className="task">
      <div className="task-head">
        <span className={`badge ${ch.kind}`}>{ch.kind === 'lesson' ? tr('课程 LESSON', 'LESSON') : tr('挑战 CHALLENGE', 'CHALLENGE')}</span>
        <Stars n={ch.level} />
        {completed[ch.id] && <span className="badge done">✓ {tr('已完成', 'Done')}</span>}
        {ch.source !== 'folder' && <span className="badge src">{tr('导入', 'Imported')}</span>}
      </div>
      <h2>{ch.title}</h2>
      {ch.summary && <p className="summary">{ch.summary}</p>}

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
                  className={i === cur ? 'cur' : i < cur ? 'done' : ''}
                  aria-current={i === cur ? 'step' : undefined}
                  aria-label={tr(`第 ${i + 1} 步`, `Step ${i + 1}`)}
                  onClick={() => setStep(i)}
                >
                  {i < cur ? '✓' : i + 1}
                </button>
              ))}
            </span>
          </div>
          <div className="step-cur" aria-live="polite">
            <Md text={ch.steps[cur].text} />
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

      {hintsShown > 0 && (
        <ul className="hints">
          {ch.hints.slice(0, hintsShown).map((h, i) => (
            <li key={i}>
              <Icon name="bulb" size={14} /> {h}
            </li>
          ))}
        </ul>
      )}

      <details className="fold" open>
        <summary>{ch.kind === 'lesson' ? tr('课程说明', 'About this lesson') : tr('题目说明', 'About this task')}</summary>
        <Md text={ch.description} />
      </details>

      <details className="fold" open>
        <summary>{tr('目标电路图 TARGET SCHEMATIC', 'Target schematic')}</summary>
        <div className="schem-card">
          <SchematicView circuit={ch.target} sim={targetSim} showValues />
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
function NodeVolt({ d, net }: { d: Derived; net: string }) {
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
  const compOf = new Map(nl.circuit.components.map((c) => [c.ref, c]));
  // a dev board's unwired pins each sit on a one-pin net: keep them out of the netlist table
  const boardRefs = new Set(nl.circuit.components.filter((c) => isMcu(c.type)).map((c) => c.ref));

  return (
    <div className="schem-panel">
      <div className="eyebrow">{tr('我的电路 · 由面包板自动生成', 'My circuit · generated from the breadboard')}</div>
      <div className="schem-card">
        <SchematicView circuit={nl.circuit} sim={sim} ac={ac} hoverNet={activeNet} onHoverNet={setHoverNet} />
      </div>
      <p className="note">
        {tr(
          '电路图按电压从高到低排列：最上面是电源 +，最下面是 GND（⏚）。鼠标移到一条线上，3D 面包板里属于这个“节点”的所有孔都会亮起来。',
          'The schematic is drawn from high to low voltage: supply + at the top, GND (⏚) at the bottom. Hover a line and every hole on that node lights up on the 3D breadboard.',
        )}
      </p>
      {nl.circuit.nets.length > 0 && (
        <>
          <div className="eyebrow">{tr('节点表 NETLIST', 'NETLIST')}</div>
          <table className="netlist">
            <thead>
              <tr>
                <th>{tr('节点', 'Node')}</th>
                <th>{tr('电压', 'Voltage')}</th>
                <th>{tr('连接的引脚', 'Pins')}</th>
                <th>{tr('面包板位置', 'Breadboard holes')}</th>
              </tr>
            </thead>
            <tbody>
              {nl.circuit.nets
                .filter((n) => !(n.pins.length === 1 && boardRefs.has(n.pins[0].slice(0, n.pins[0].lastIndexOf('.')))))
                .map((n) => {
                  const strips = [...new Set((nl.netHoles.get(n.name) ?? []).map((h) => HOLE_MAP.get(h)!.strip))];
                  return (
                    <tr key={n.name} className={activeNet === n.name ? 'on' : ''} onMouseEnter={() => setHoverNet(n.name)} onMouseLeave={() => setHoverNet(null)}>
                      <td>
                        <b>{isFloating(n.name) ? tr('悬空', 'floating') : n.name}</b>
                      </td>
                      <td className="volt">
                        <NodeVolt d={d} net={n.name} />
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
            {tr('元件清单 BOM', 'Parts list (BOM)')}
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
    <aside className="side card">
      <div className="tabs" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={cur === k} className={cur === k ? 'on' : ''} onClick={() => setPanel(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="side-body" role="tabpanel">
        {cur === 'task' && ch && <TaskPanel ch={ch} />}
        {cur === 'schematic' && <SchematicPanel />}
        {cur === 'issues' && <IssuesPanel />}
        {cur === 'inspect' && <Inspector />}
      </div>
    </aside>
  );
}

export const partName = (t: keyof typeof PARTS) => PARTS[t].name;
