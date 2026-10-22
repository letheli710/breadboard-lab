import { Fragment, useMemo } from 'react';
import type { Challenge } from '../core/challenge';
import { checkCircuit } from '../core/check';
import type { Issue } from '../core/diagnostics';
import { stripLabel, HOLE_MAP } from '../core/breadboard';
import { describeComponent, PARTS, terminalLabel } from '../core/parts';
import { simulate } from '../core/solver';
import { useActiveChallenge, useDerived } from '../state/derived';
import { useStore, type PanelTab } from '../state/store';
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
    s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((t, i) =>
      t.startsWith('**') ? <b key={i}>{t.slice(2, -2)}</b> : t.startsWith('`') ? <code key={i}>{t.slice(1, -1)}</code> : <Fragment key={i}>{t}</Fragment>,
    );
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
            <tr key={i}>
              {r.map((c, j) => (i === 0 ? <th key={j}>{inline(c.trim())}</th> : <td key={j}>{inline(c.trim())}</td>))}
            </tr>
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
      table.push(line.trim().replace(/^\||\|$/g, '').split('|'));
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
  if (issues.length === 0) return <div className="ok-box">{emptyText ?? '没有发现问题 👍'}</div>;
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

  const runCheck = () => {
    const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
    const boardErrors = issues.filter((i) => i.severity === 'error');
    if (r.perfect && boardErrors.length) {
      r.perfect = false;
      r.issues.push(...boardErrors);
    }
    if (nl.unplaced.length) {
      r.perfect = false;
      r.issues.unshift(...issues.filter((i) => i.title.includes('还没有插好')));
    }
    setCheck(r);
    if (r.perfect) {
      markCompleted(ch.id);
      setCelebrate(true);
      celebrate();
    }
  };

  return (
    <div className="task">
      <div className="task-head">
        <span className={`badge ${ch.kind}`}>{ch.kind === 'lesson' ? '课程 LESSON' : '挑战 CHALLENGE'}</span>
        <Stars n={ch.level} />
        {completed[ch.id] && <span className="badge done">✓ 已完成</span>}
        {ch.source !== 'folder' && <span className="badge src">导入</span>}
      </div>
      <h2>{ch.title}</h2>
      {ch.summary && <p className="summary">{ch.summary}</p>}
      <Md text={ch.description} />

      <div className="eyebrow">目标电路图 TARGET SCHEMATIC</div>
      <div className="schem-card">
        <SchematicView circuit={ch.target} sim={targetSim} showValues />
      </div>
      <p className="note">原理图只说明“谁和谁连在一起”，不规定插在面包板哪个孔。只要连接关系一样就算对。</p>

      {ch.steps.length > 0 && (
        <div className="steps">
          <div className="eyebrow">
            步骤 {step + 1} / {ch.steps.length}
          </div>
          <ol>
            {ch.steps.map((s, i) => (
              <li key={i} className={i === step ? 'cur' : i < step ? 'done' : ''} onClick={() => setStep(i)}>
                <Md text={s.text} />
              </li>
            ))}
          </ol>
          <div className="row">
            <button disabled={step === 0} onClick={() => setStep(step - 1)}>
              <Icon name="prev" /> 上一步
            </button>
            <button className="primary" disabled={step >= ch.steps.length - 1} onClick={() => setStep(step + 1)}>
              下一步 <Icon name="next" />
            </button>
          </div>
        </div>
      )}

      <div className="actions">
        <button className="primary big" onClick={runCheck}>
          <Icon name="check" /> 检查我的电路
        </button>
        <div className="row">
          {ch.hints.length > 0 && (
            <button onClick={showHint} disabled={hintsShown >= ch.hints.length}>
              <Icon name="bulb" /> 提示 ({hintsShown}/{ch.hints.length})
            </button>
          )}
          <button
            onClick={() => {
              if (confirm('重置面包板到初始状态？')) loadLayout(ch.start ?? { version: 1, parts: [] });
            }}
          >
            <Icon name="reset" /> 重置
          </button>
          {ch.solution && (
            <button
              onClick={() => {
                if (confirm('加载参考答案？当前面包板会被替换（可以撤销）。')) loadLayout(ch.solution!);
              }}
            >
              <Icon name="eye" /> 看答案
            </button>
          )}
        </div>
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

      {check && (
        <div className="check-result">
          <div className="progress-row">
            <span>连接正确度</span>
            <div className="bar">
              <div style={{ width: `${Math.round(check.progress * 100)}%` }} />
            </div>
            <b>{Math.round(check.progress * 100)}%</b>
          </div>
          {check.perfect ? (
            <div className="ok-box big">🎉 完全正确！连接关系与目标电路一致{check.testsTotal ? `，${check.testsTotal} 项功能测试全部通过` : ''}。</div>
          ) : (
            <>
              <p className="note">把鼠标移到下面的条目上，3D 视图会高亮出相关的元件和孔位。</p>
              <IssueList issues={check.issues} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SchematicPanel() {
  const { nl, sim } = useDerived();
  const hoverNet = useStore((s) => s.hoverNet);
  const hoverHole = useStore((s) => s.hoverHole);
  const setHoverNet = useStore((s) => s.setHoverNet);
  const mode = useStore((s) => s.mode);
  const layout = useStore((s) => s.layout);
  const activeNet = hoverNet ?? (hoverHole ? (nl.holeNet.get(hoverHole) ?? null) : null);
  const compOf = new Map(nl.circuit.components.map((c) => [c.ref, c]));

  return (
    <div className="schem-panel">
      <div className="eyebrow">我的电路 · 由面包板自动生成</div>
      <div className="schem-card">
        <SchematicView circuit={nl.circuit} sim={sim} hoverNet={activeNet} onHoverNet={setHoverNet} />
      </div>
      <p className="note">
        电路图按电压从高到低排列：最上面是电源 +，最下面是 GND（⏚）。鼠标移到一条线上，3D 面包板里属于这个“节点”的所有孔都会亮起来。
      </p>
      {nl.circuit.nets.length > 0 && (
        <>
          <div className="eyebrow">节点表 NETLIST</div>
          <table className="netlist">
            <thead>
              <tr>
                <th>节点</th>
                <th>电压</th>
                <th>连接的引脚</th>
                <th>面包板位置</th>
              </tr>
            </thead>
            <tbody>
              {nl.circuit.nets.map((n) => {
                const strips = [...new Set((nl.netHoles.get(n.name) ?? []).map((h) => HOLE_MAP.get(h)!.strip))];
                return (
                  <tr key={n.name} className={activeNet === n.name ? 'on' : ''} onMouseEnter={() => setHoverNet(n.name)} onMouseLeave={() => setHoverNet(null)}>
                    <td>
                      <b>{n.name.startsWith('悬空') ? '悬空' : n.name}</b>
                    </td>
                    <td>{(sim.nodeV.get(n.name) ?? 0).toFixed(2)}V</td>
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
          <button
            onClick={() => {
              const id = prompt('给这个题目起一个 id（字母/数字/-）', 'my-circuit');
              if (!id) return;
              const title = prompt('题目标题', '我的电路') ?? id;
              downloadJson(`${id}.json`, buildChallengeFromBoard(layout, nl.circuit, id, title));
            }}
          >
            <Icon name="download" /> 导出为题目 JSON
          </button>
          <button onClick={() => downloadJson('breadboard-layout.json', layout)}>
            <Icon name="download" /> 导出面包板布局
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
      <div className="eyebrow">实时诊断 · 常见错误检测</div>
      <IssueList issues={issues} emptyText="没有检测到常见错误 👍（这不代表电路一定符合题目要求——用“检查”按钮核对）" />
      {Object.keys(counts).length > 0 && (
        <>
          <div className="eyebrow" style={{ marginTop: 16 }}>
            元件清单 BOM
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
    ...(ch ? ([['task', ch.kind === 'lesson' ? '课程' : '题目']] as [PanelTab, string][]) : []),
    ['schematic', '我的电路图'],
    ['issues', nErr ? `诊断 (${nErr})` : '诊断'],
    ['inspect', '属性'],
  ];
  const cur = panel === 'task' && !ch ? 'schematic' : panel;
  return (
    <aside className="side card">
      <div className="tabs">
        {tabs.map(([k, label]) => (
          <button key={k} className={cur === k ? 'on' : ''} onClick={() => setPanel(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="side-body">
        {cur === 'task' && ch && <TaskPanel ch={ch} />}
        {cur === 'schematic' && <SchematicPanel />}
        {cur === 'issues' && <IssuesPanel />}
        {cur === 'inspect' && <Inspector />}
      </div>
    </aside>
  );
}

export const partName = (t: keyof typeof PARTS) => PARTS[t].name;
