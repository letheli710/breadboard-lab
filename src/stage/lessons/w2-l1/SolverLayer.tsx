// W2-L1 layer 03 · 节点方程联立求解台: the solver bench, one step at a time — ① the KCL rows,
// ② denominators cleared, ③ the conductance matrix G v = i (with the symmetry check), ④ the
// elimination down to one unknown, ⑤ back substitution, the branch currents with their true
// directions animated on the schematic, and the KCL check of every node. Works for any circuit
// and any reference node the other layers set.

import { useMemo } from 'react';
import { Tex } from '../../StageText';
import { useLit } from '../../stageStore';
import { NODE_ID, NODE_TEX, NODE_UNI, ctrlTex, current, currentTex, kclCheck, kclTex, matrixTex, nodal, rowTex, solve, symmetric, val, type Elem, type NodeId } from './model';
import { Arrow, Bubble, CircuitPicker, HiddenInfo, Schematic, arrowBeside, badgeOf, hoverProps, nodeColor, signed, useLayerFollow, useW21 } from './parts';

const STEPS = ['① 列 KCL', '② 通分', '③ 矩阵 Gv = i', '④ 消元', '⑤ 回代 · 验算'];
const SHORT = ['① KCL', '② 通分', '③ 矩阵', '④ 消元', '⑤ 回代'];

const uniCur = (t: string) =>
  t
    .replace(/[{}]/g, '')
    .replace(/_([0-9a-z]+)/g, (_m, s: string) => s.replace(/[0-9x]/g, (ch) => ({ '0': '₀', '1': '₁', '2': '₂', '3': '₃', x: 'ₓ' })[ch] ?? ch))
    .replace(/^I/, 'I');

/** "向下" … the true direction of a current running from node `from` */
function dirWord(e: Elem, from: NodeId): string {
  const [p, q] = from === e.a ? [e.pa, e.pb] : [e.pb, e.pa];
  if (Math.abs(p[0] - q[0]) < 1) return q[1] > p[1] ? '向下' : '向上';
  return q[0] > p[0] ? '向右' : '向左';
}

function Flow({ e, amps, lit }: { e: Elem; amps: number; lit: boolean }) {
  const from = amps >= 0 ? e.a : e.b;
  const a = Math.abs(amps);
  const name = uniCur(e.cur);
  const at = e.a === from ? e.bubA : e.bubB;
  if (e.kind !== 'R') {
    return <Bubble at={at} text={`${e.kind === 'CCCS' ? '2iₓ' : name} = ${String(+a.toFixed(3))} A`} color="#6d28d9" bg="#f5f3ff" />;
  }
  const [p, q] = arrowBeside(e, from);
  const neg = amps < 0;
  return (
    <g {...hoverProps([e.id])} className={`w21-flowg ${lit ? 'lit' : ''}`}>
      <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} className="w21-flow" style={{ strokeWidth: 2 + Math.min(4, a / 2) }} />
      <Arrow from={p} to={q} color={neg ? '#c2410c' : '#047857'} width={1.6} />
      <Bubble
        at={at}
        text={neg ? `${name} = −${String(+a.toFixed(3))} A（实际${dirWord(e, from)}）` : `${name} = ${String(+a.toFixed(3))} A`}
        color={neg ? '#c2410c' : '#047857'}
        bg={neg ? '#fff7ed' : '#ecfdf5'}
      />
    </g>
  );
}

export default function SolverLayer() {
  useLayerFollow();
  const lit = useLit();
  const { c, ref, solve: level, setSolve } = useW21();
  const n = useMemo(() => nodal(c, ref), [c, ref]);
  const s = useMemo(() => (c.numeric ? solve(c, ref) : null), [c, ref]);
  const names = n.unknowns.map((u) => NODE_TEX[u]);
  const step = Math.max(0, Math.min(4, level));
  const known = (k: NodeId) => !!s && k !== ref && (step >= 4 || (step === 3 && k === s.firstFound));

  const badge = (k: NodeId) => {
    const col = nodeColor(k, ref);
    if (k === ref) return badgeOf(k === 'v0' ? '参考地 = 0 V' : `${NODE_UNI[k]} = 0 V（参考）`, col);
    return badgeOf(known(k) && s ? `${NODE_UNI[k]} = ${signed(val(s.v[k]))}` : `${NODE_UNI[k]} = ?`, col);
  };

  /* --- the board of the current step */
  let head = '';
  let tex: string[] = [];
  let note: string | null = null;
  if (!s) {
    if (step === 0) {
      head = '通用电路：每个非参考节点一条 KCL（流出电阻电流 = 流入电流源）';
      tex = n.unknowns.map((k) => kclTex(c, k, ref, true));
    } else if (step === 2 && ref === 'v0') {
      head = '电导标准形式（G₁ = 1/R₁，G₂ = 1/R₂，G₃ = 1/R₃）';
      tex = [String.raw`\begin{cases} (G_1 + G_2)v_1 - G_2 v_2 = I_s \\[6pt] -G_2 v_1 + (G_2 + G_3)v_2 = 0 \end{cases}`];
    } else {
      note = '通用电路只有字母：切到“热身”“例题 1”或“例题 2”，看数值通分、消元与回代。';
    }
  } else if (step === 0) {
    head = '每个非参考节点一条 KCL：流出电阻电流之和 = 流入独立电流源之和';
    tex = n.unknowns.map((k) => String.raw`\text{节点 } ${NODE_TEX[k]}:\;\; ${kclTex(c, k, ref, false)}`);
    const t = ctrlTex(c, ref, false);
    if (t) tex.push(String.raw`\text{控制变量约束：}\;\; ${t}`);
  } else if (step === 1) {
    head = '两边同乘分母的最小公倍数（能约的再约掉），得到整数系数的标准方程组';
    tex = s.rows.map((r, i) => rowTex(r, i, names));
  } else if (step === 2) {
    const sym = symmetric(n);
    head = '电导矩阵形式 G v = i（通分之前的电导值）';
    tex = [matrixTex(n)];
    note = sym
      ? '对称检验：G₁₂ = G₂₁ ✓ —— 无受控源的电阻网络，矩阵必然对称（注意：要在乘公倍数之前检验）。'
      : '不对称：受控源消元把控制节点的电位带进了被控节点的方程，G 不再对称——这不是算错。';
  } else if (step === 3) {
    head = '整数消元：每次消去一个未知数，直到只剩一个';
    tex = [...s.elim, s.back[0]];
  } else {
    head = '回代求其余节点电位，再反算每条支路的电流';
    tex = [...s.back.slice(1), ...c.elems.filter((e) => e.kind !== 'I').map((e) => currentTex(c, s, e))];
  }

  const flows = step >= 4 && s ? c.elems.map((e) => <Flow key={e.id} e={e} amps={val(current(c, s, e))} lit={lit.includes(e.id)} />) : null;

  return (
    <div className="w21-layer">
      <div className="w21-dock">
        <CircuitPicker />
        <div className="w21-seg steps" role="radiogroup" aria-label="求解步骤">
          {STEPS.map((t, i) => (
            <button key={t} role="radio" aria-checked={step === i} className={`${step === i ? 'on' : ''} ${i < step ? 'done' : ''}`} onClick={() => setSolve(i)}>
              <span className="full">{t}</span>
              <span className="short">{SHORT[i]}</span>
            </button>
          ))}
        </div>
        <button className="w21-btn" onClick={() => setSolve(Math.min(4, step + 1))} disabled={step >= 4}>
          下一步
        </button>
      </div>

      <Schematic c={c} refNode={ref} wire={(k) => nodeColor(k, ref)} badge={badge} ariaLabel={`求解台：${c.title}，第 ${step + 1} 步`}>
        {flows}
      </Schematic>

      <div className="w21-board" aria-live="polite" {...hoverProps(n.unknowns.map((k) => NODE_ID[k]))}>
        {head && <div className="w21-board-head">{head}</div>}
        {tex.map((t) => (
          <Tex key={t} tex={t} display />
        ))}
        {note && <div className="w21-board-note">{note}</div>}
        {step >= 4 && s && (
          <div className="w21-kcl">
            {c.nodes.map((k) => {
              const r = kclCheck(c, s, k);
              return (
                <span key={k} className="w21-chip ok" {...hoverProps([NODE_ID[k]])}>
                  {k === 'v0' ? '底部' : NODE_UNI[k]}：入 {String(+val(r.into).toFixed(3))} A = 出 {String(+val(r.out).toFixed(3))} A ✓
                </span>
              );
            })}
          </div>
        )}
      </div>

      <HiddenInfo
        items={
          c.id === 'core' && ref === 'v0'
            ? [
                '标准方程组：3v₁ − v₂ = 60，−3v₁ + 5v₂ = −120',
                step >= 4 ? '精确解：v₁ = +15 V，v₂ = −15 V（低于参考地 15 V）' : '精确解：完成“⑤ 回代”后显示',
                step >= 4 ? '反算闭环：i₁ = 7.5 A，i₂ = 7.5 A，i₃ = −2.5 A（真实方向自地向上流入 v₂）' : '反算闭环：完成“⑤ 回代”后显示',
              ]
            : ['标准方程组：见“② 通分”', '精确解：见“④ 消元”与“⑤ 回代”', '反算闭环：负号 = 真实电流与假设的“流出”方向相反']
        }
      />
    </div>
  );
}
