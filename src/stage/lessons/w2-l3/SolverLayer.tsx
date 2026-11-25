// W2-L3 layer 03 · 网孔方程联立求解台 (acts 2–6): pick a circuit (act 2 standard, act 3 Case 1,
// act 4 Case 2, act 5 example); the 2×2 system R·i = v is shown entry by entry (symbols or
// numbers). Hovering a diagonal entry R_kk lights every resistor on mesh k's border, an
// off-diagonal −R_kj only the shared resistor, a right-hand entry its sources. Below: the Step
// A–D elimination board and the branch currents rebuilt from the mesh currents. The guided
// example's lines open as its steps are answered (ex_reveal).
// Stage params: l3_prob, l3_step, l3_num, ex_reveal.

import { useState } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { circuit, solve, texNum, type CaseId } from './circuits';
import { hoverOfFor, litElements, litMeshes } from './ids';
import { Schematic } from './Schematic';
import './w2l3.css';

type Tag = 'diag' | 'off' | 'rhs' | 'super' | 'kcl' | 'lock' | 'zero';

interface Cell {
  sym: string;
  num: number;
  els: string[];
  tag: Tag;
  /** a diagonal entry's mesh */
  mesh?: 0 | 1;
}

interface Sys {
  rows: [string, string];
  a: [[Cell, Cell], [Cell, Cell]];
  b: [Cell, Cell];
  steps: { label: string; tex: string[] }[];
}

const cell = (sym: string, num: number, els: string[], tag: Tag, mesh?: 0 | 1): Cell => ({ sym, num, els, tag, mesh });
const z = (num: number, tag: Tag = 'zero'): Cell => cell(String(num), num, [], tag);

const SYS: Record<CaseId, Sys> = {
  std: {
    rows: ['Mesh 1 KVL', 'Mesh 2 KVL'],
    a: [
      [cell('R_1 + R_2', 15, ['r1', 'r2'], 'diag', 0), cell('-R_2', -10, ['r2'], 'off')],
      [cell('-R_2', -10, ['r2'], 'off'), cell('R_2 + R_3', 15, ['r2', 'r3'], 'diag', 1)],
    ],
    b: [cell('V_1', 20, ['v1'], 'rhs'), cell('-V_2', -5, ['v2'], 'rhs')],
    steps: [
      { label: 'Step A · 代入数值列 KVL', tex: [String.raw`-20 + 5 i_1 + 10(i_1 - i_2) = 0`, String.raw`10(i_2 - i_1) + 5 i_2 + 5 = 0`] },
      {
        label: 'Step B · 合并同类项并约分',
        tex: [String.raw`15 i_1 - 10 i_2 = 20 \;\xrightarrow{\div 5}\; 3 i_1 - 2 i_2 = 4`, String.raw`-10 i_1 + 15 i_2 = -5 \;\xrightarrow{\div 5}\; -2 i_1 + 3 i_2 = -1`],
      },
      { label: 'Step C · 加减消元', tex: [String.raw`5 i_1 = 10 \implies i_1 = 2\text{ A}`, String.raw`-2(2) + 3 i_2 = -1 \implies i_2 = 1\text{ A}`] },
      { label: 'Step D · 还原支路电流并验算', tex: [String.raw`I_{R_2} = i_1 - i_2 = 1\text{ A}`, String.raw`-20 + 10 + 10 = 0, \qquad -10 + 5 + 5 = 0`] },
    ],
  },
  c1: {
    rows: ['Mesh 1 KVL', '边缘锁定'],
    a: [
      [cell('R_1 + R_2', 6, ['r1', 'r2'], 'diag', 0), cell('-R_2', -4, ['r2'], 'off')],
      [z(0, 'lock'), z(1, 'lock')],
    ],
    b: [cell('V_1', 24, ['v1'], 'rhs'), cell('-I_s', -3, ['is'], 'lock')],
    steps: [
      { label: 'Step A · 读取边缘电流源约束', tex: [String.raw`i_2 = -3\text{ A}`] },
      { label: 'Step B · Mesh 1 列 KVL', tex: [String.raw`-24 + 2 i_1 + 4(i_1 - i_2) = 0 \implies 6 i_1 - 4 i_2 = 24`] },
      { label: 'Step C · 代入求 i₁', tex: [String.raw`6 i_1 - 4(-3) = 24 \implies i_1 = 2\text{ A}`] },
      { label: 'Step D · 还原并核验', tex: [String.raw`I_{R_2} = 2 - (-3) = 5\text{ A}`, String.raw`V_a = 24 - 2 \times 2 = 20\text{ V} = 4 \times 5`] },
    ],
  },
  c2: {
    rows: ['超网孔 KVL', '内部 KCL'],
    a: [
      [cell('R_1', 6, ['r1'], 'super'), cell('R_2 + R_3', 14, ['r2', 'r3'], 'super')],
      [z(-1, 'kcl'), z(1, 'kcl')],
    ],
    b: [cell('V_1', 20, ['v1'], 'rhs'), cell('I_s', 6, ['is'], 'kcl')],
    steps: [
      { label: 'Step A · 超网孔大外环 KVL', tex: [String.raw`-20 + 6 i_1 + 10 i_2 + 4 i_2 = 0 \implies 3 i_1 + 7 i_2 = 10`] },
      { label: 'Step B · 内部 KCL 约束', tex: [String.raw`i_2 - i_1 = 6 \implies i_2 = i_1 + 6`] },
      { label: 'Step C · 代入求解', tex: [String.raw`3 i_1 + 7(i_1 + 6) = 10 \implies i_1 = -3.2\text{ A}`, String.raw`i_2 = -3.2 + 6 = 2.8\text{ A}`] },
      { label: 'Step D · 电位验算', tex: [String.raw`V_a = 20 - 6(-3.2) = 39.2\text{ V} = 14 \times 2.8`, String.raw`V_{I_s} = V_a + 2 \times 6 = 51.2\text{ V}`] },
    ],
  },
  ex: {
    rows: ['超网孔 KVL', '内部 KCL'],
    a: [
      [cell('R_1', 4, ['r1'], 'super'), cell('R_2 + R_3', 8, ['r2', 'r3'], 'super')],
      [z(1, 'kcl'), z(-1, 'kcl')],
    ],
    b: [cell('V_1 - V_2', 24, ['v1', 'v2'], 'rhs'), cell('I_s', 3, ['is'], 'kcl')],
    steps: [
      { label: 'Step A · 超网孔大外环 KVL', tex: [String.raw`-30 + 4 i_1 + (2 + 6) i_2 + 6 = 0 \implies i_1 + 2 i_2 = 6`] },
      { label: 'Step B · 内部 KCL 约束', tex: [String.raw`i_1 - i_2 = 3 \implies i_1 = i_2 + 3`] },
      { label: 'Step C · 代入求解', tex: [String.raw`(i_2 + 3) + 2 i_2 = 6 \implies i_2 = 1\text{ A}, \quad i_1 = 4\text{ A}`] },
      { label: 'Step D · 串联电阻与电流源端电压', tex: [String.raw`P_{R_s} = 3^2 \times 5 = 45\text{ W}, \quad V_{I_s} = 14 - 3 \times 5 = -1\text{ V}`] },
    ],
  },
};

const PROBS: [CaseId, string][] = [
  ['std', '标准双网孔'],
  ['c1', 'Case 1 边缘源'],
  ['c2', 'Case 2 超网孔'],
  ['ex', '第 5 幕例题'],
];

const TAG_ID: Record<Tag, string | undefined> = {
  diag: 'mat_diag',
  off: 'mat_off',
  rhs: 'mat_rhs',
  super: 'supermesh',
  kcl: 'kcl_node_b',
  lock: 'edge_is',
  zero: undefined,
};

/** ex: what the guided example must have answered before a row / step / result shows */
const EX_ROW_LEVEL = [2, 3];
const EX_STEP_LEVEL = [2, 3, 4, 5];

export default function SolverLayer() {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const [pid, setProb] = useStageParam<CaseId>('l3_prob', 'std');
  const [step, setStep] = useStageParam('l3_step', 0);
  const [num, setNum] = useStageParam('l3_num', false);
  const [reveal] = useStageParam('ex_reveal', 0);
  const [pick, setPick] = useState<Cell | null>(null);
  const sys = SYS[pid];
  const c = circuit(pid);
  const s = solve(c);
  const ex = pid === 'ex';
  const has = (id: string) => lit.includes(id);
  const rowShown = (k: number) => !ex || reveal >= EX_ROW_LEVEL[k];
  const stepShown = (k: number) => !ex || reveal >= EX_STEP_LEVEL[k];
  const solved = !ex || reveal >= 4;

  // the self / mutual resistance ids only mean something where the system has those entries
  const litHere = pid === 'std' || pid === 'c1' ? lit : lit.filter((id) => id !== 'mat_diag' && id !== 'mat_off');
  const litEls = pick ? new Set(pick.els) : litElements(c, litHere);
  const litMesh: [boolean, boolean] = pick ? [pick.mesh === 0, pick.mesh === 1] : litMeshes(litHere);
  const cellLit = (x: Cell) => (pick ? pick === x : !!TAG_ID[x.tag] && has(TAG_ID[x.tag]!));

  const entry = (x: Cell, shown: boolean, key: string) => (
    <span
      key={key}
      className={`w23-cell tag-${x.tag} ${cellLit(x) ? 'lit' : ''}`}
      tabIndex={shown && x.els.length ? 0 : -1}
      onPointerEnter={() => {
        if (!shown || !x.els.length) return;
        setPick(x);
        const id = TAG_ID[x.tag];
        if (id) setHover([id]);
      }}
      onPointerLeave={() => {
        setPick(null);
        setHover(null);
      }}
      onFocus={() => shown && x.els.length && setPick(x)}
      onBlur={() => setPick(null)}
    >
      {shown ? <Tex tex={num || !x.els.length ? texNum(x.num) : x.sym} /> : <Tex tex="?" />}
    </span>
  );

  const k = Math.min(step, sys.steps.length - 1);
  const branches: [string, string, number][] = [
    [c.left.map((e) => e.name).join('、'), 'i_1\\ (\\uparrow)', s.i1],
    [c.topL.name, 'i_1\\ (\\rightarrow)', s.i1],
    [`${c.mid.map((e) => e.name).join('、')}（共享）`, 'i_1 - i_2\\ (\\downarrow)', s.iMid],
    [c.topR.name, 'i_2\\ (\\rightarrow)', s.i2],
    [c.right.map((e) => e.name).join('、'), 'i_2\\ (\\downarrow)', s.i2],
  ];

  return (
    <div className="w23-layer w23-solver">
      <div className="w23-dock" role="group" aria-label="控制条">
        <div className="w23-row">
          <span className="w23-seg" role="group" aria-label="电路">
            {PROBS.map(([id, label]) => (
              <button
                key={id}
                className={`w23-btn ${pid === id ? 'on' : ''}`}
                aria-pressed={pid === id}
                onClick={() => {
                  setProb(id);
                  setStep(0);
                }}
              >
                {label}
              </button>
            ))}
          </span>
          <button className={`w23-switch ${num ? 'on' : ''}`} role="switch" aria-checked={num} onClick={() => setNum(!num)}>
            <span className="knob" aria-hidden />
            显示数值
          </button>
        </div>
      </div>

      <div className="w23-solver-scroll">
        <div className="w23-solver-top">
          <Schematic
            c={c}
            sol={null}
            litEls={litEls}
            litMesh={litMesh}
            className="compact"
            superPath={pid === 'c2' || pid === 'ex' ? has('supermesh') || pick?.tag === 'super' : false}
            superLit
            hoverOf={hoverOfFor(c)}
            onHover={(id) => setHover(id ? [id] : null)}
            label="求解台的电路"
          />
          <div className="w23-matrix-wrap" aria-label="网孔方程矩阵 R i = v">
            <div className="w23-rowtags">
              {sys.rows.map((r, i) => (
                <span key={i} className={rowShown(i) ? '' : 'hidden'}>
                  {r}
                </span>
              ))}
            </div>
            <div className="w23-matrix">
              <div className="w23-br grid2">{sys.a.map((row, i) => row.map((x, j) => entry(x, rowShown(i), `${i}${j}`)))}</div>
              <div className="w23-br vec">
                <span className="w23-cell">
                  <Tex tex="i_1" />
                </span>
                <span className="w23-cell">
                  <Tex tex="i_2" />
                </span>
              </div>
              <span className="w23-eq">=</span>
              <div className="w23-br vec">{sys.b.map((x, i) => entry(x, rowShown(i), `b${i}`))}</div>
            </div>
            <p className="w23-mat-note">
              {pid === 'std'
                ? '悬停主对角线：该网孔边框上的全部电阻；悬停非对角线：只有共享电阻。'
                : pid === 'c1'
                  ? '第 2 行不是 KVL：边缘电流源直接锁死 i₂。'
                  : '第 1 行绕大外环（不含 Rₛ），第 2 行是共享支路的 KCL。'}
            </p>
          </div>
        </div>

        <div className={`w23-board ${has('solve_board') ? 'lit' : ''}`} aria-label="消元板书">
          <div className="w23-board-tabs" role="tablist" aria-label="步骤">
            {sys.steps.map((st, i) => (
              <button key={i} role="tab" aria-selected={k === i} className={`w23-tab ${k === i ? 'on' : ''}`} onClick={() => setStep(i)}>
                {st.label.slice(0, 6)}
              </button>
            ))}
          </div>
          <div className="w23-board-body">
            <b>{sys.steps[k].label}</b>
            {stepShown(k) ? (
              sys.steps[k].tex.map((t, i) => <Tex key={i} tex={t} display />)
            ) : (
              <p className="w23-locked">在第 5 幕引导例题里答对第 {EX_STEP_LEVEL[k] - 1} 步后显示。</p>
            )}
          </div>
        </div>

        <div className={`w23-branches ${has('branch_rebuild') ? 'lit' : ''}`} aria-label="支路电流还原">
          <b>支路电流还原</b>
          {branches.map(([name, rel, v], i) => (
            <span key={i} className="w23-branch">
              <span>{name}</span>
              <Tex tex={solved ? String.raw`${rel} = ${texNum(v)}\text{ A}` : String.raw`${rel} = ?`} />
            </span>
          ))}
          {solved && <span className="w23-branch muted">负值：真实电流与括号里的参考方向相反</span>}
        </div>
      </div>
    </div>
  );
}
