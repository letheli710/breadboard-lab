// W2-L4 layer 01 · 观察法矩阵直写对照台 (Gv = i / Ri = v). A 3-node circuit (nodal mode) or a
// 3-mesh planar circuit (mesh mode) beside its matrix equation. Every matrix cell and every branch
// is linked: a self cell (k,k) lights all the branches on node / mesh k, a mutual cell lights its
// mirror cell and the shared branch, with a dashed mapping arc. "数值例题" puts in the numbers of
// 图 3-1 (nodal) or 图 6-1 (mesh, the guided example: its cells stay hidden until the guided steps
// reach them, l1_reveal 0…4). "注入 1 个受控源" adds a VCCS / CCVS whose control term lands in
// cell (1,3) only: G13 ≠ G31, the symmetry is gone.
// Stage params: l1_mode ('nodal' | 'mesh'), l1_num, l1_dep, l1_reveal.

import { Fragment } from 'react';
import { useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { cramer, fmt, MESH_EX, meshByInspection, NODAL_EX, nodalByInspection } from './model';
import { CurSrc, CwArc, DepSrc, Lbl, ResBox, Seg, Switch, VoltSrc, fitScale, useBox, useLink } from './ui';

type Mode = 'nodal' | 'mesh';

const CW = 440;
const CH = 270;
const MW = 360;
const MH = 196;
const GAP = 14;

/* ------------------------------------------------------------- what each hover id lights */

const NODAL_LIGHTS: Record<string, string[]> = {
  gv_g11: ['G1', 'G12', 'G13', 'n1', 'c11'],
  gv_g22: ['G2', 'G12', 'G23', 'n2', 'c22'],
  gv_g33: ['G3', 'G13', 'G23', 'n3', 'c33'],
  gv_g12: ['G12', 'c12', 'c21'],
  gv_g13: ['G13', 'c13', 'c31'],
  gv_g23: ['G23', 'c23', 'c32'],
  gv_diag: ['c11', 'c22', 'c33', 'n1', 'n2', 'n3'],
  gv_offdiag: ['c12', 'c21', 'c13', 'c31', 'c23', 'c32', 'G12', 'G13', 'G23'],
  gv_rhs: ['i1', 'i2', 'i3', 'b1', 'b2', 'b3'],
  gv_ref: ['ref'],
  gv_dep: ['dep', 'c13'],
};
const MESH_LIGHTS: Record<string, string[]> = {
  ri_r11: ['R1', 'R12', 'R13', 'm1', 'c11'],
  ri_r22: ['R2', 'R12', 'R23', 'm2', 'c22'],
  ri_r33: ['R3', 'R13', 'R23', 'm3', 'c33'],
  ri_r12: ['R12', 'c12', 'c21'],
  ri_r13: ['R13', 'c13', 'c31'],
  ri_r23: ['R23', 'c23', 'c32'],
  ri_diag: ['c11', 'c22', 'c33', 'm1', 'm2', 'm3'],
  ri_offdiag: ['c12', 'c21', 'c13', 'c31', 'c23', 'c32', 'R12', 'R13', 'R23'],
  ri_rhs: ['V1', 'V2', 'V3', 'b1', 'b2', 'b3'],
  ri_cw: ['m1', 'm2', 'm3'],
  ri_dep: ['dep', 'c13'],
  ex_io: ['Io', 'R12'],
};

/** hover id of a cell (row, col), 0-based */
const cellId = (m: Mode, r: number, c: number) => {
  const [a, b] = r <= c ? [r, c] : [c, r];
  return `${m === 'nodal' ? 'gv_g' : 'ri_r'}${a + 1}${b + 1}`;
};

/* ------------------------------------------------------------- the two circuits */

// nodal circuit (图 1-1 / 图 3-1 topology)
const NY = 112; // node row
const RAIL = 236;
const ARCH = 46;
const NX = [124, 250, 372];
// mesh circuit (图 2-1 / 图 6-1 topology)
const MX = { l: 40, c: 220, r: 400 };
const MY = { t: 34, m: 120, b: 236 };

/** centre of each branch (for the mapping arcs) */
const BRANCH_AT: Record<string, [number, number]> = {
  G12: [187, NY],
  G23: [311, NY],
  G13: [248, ARCH],
  R12: [MX.c, 178],
  R13: [130, MY.m],
  R23: [310, MY.m],
};

/* ------------------------------------------------------------- numbers and labels */

const NOD = nodalByInspection(NODAL_EX);
const NOD_SOL = cramer(NOD.G, NOD.i);
const MES = meshByInspection(MESH_EX);
const MES_SOL = cramer(MES.R, MES.v);
const GM = 2; // S, the VCCS of the symmetry breaker (numeric mode)
const RM = 2; // Ω, the CCVS of the symmetry breaker

const SYM_CELLS: Record<Mode, string[][]> = {
  nodal: [
    ['G₁+G₁₂+G₁₃', '−G₁₂', '−G₁₃'],
    ['−G₁₂', 'G₂+G₁₂+G₂₃', '−G₂₃'],
    ['−G₁₃', '−G₂₃', 'G₃+G₁₃+G₂₃'],
  ],
  mesh: [
    ['R₁+R₁₂+R₁₃', '−R₁₂', '−R₁₃'],
    ['−R₁₂', 'R₂+R₁₂+R₂₃', '−R₂₃'],
    ['−R₁₃', '−R₂₃', 'R₃+R₁₃+R₂₃'],
  ],
};
const SYM_RHS: Record<Mode, string[]> = { nodal: ['i₁', 'i₂', 'i₃'], mesh: ['v₁', 'v₂', 'v₃'] };
const SYM_X: Record<Mode, string[]> = { nodal: ['v₁', 'v₂', 'v₃'], mesh: ['i₁', 'i₂', 'i₃'] };

/** HUD formula for a lit id (symbolic / numeric) */
const TEL: Record<string, [string, string]> = {
  gv_g11: [String.raw`G_{11} = G_1 + G_{12} + G_{13} > 0`, String.raw`G_{11} = \tfrac{1}{2} + \tfrac{1}{1} + \tfrac{1}{2} = 2\text{ S}`],
  gv_g22: [String.raw`G_{22} = G_2 + G_{12} + G_{23} > 0`, String.raw`G_{22} = \tfrac{1}{1} + \tfrac{1}{1} + \tfrac{1}{1} = 3\text{ S}`],
  gv_g33: [String.raw`G_{33} = G_3 + G_{13} + G_{23} > 0`, String.raw`G_{33} = \tfrac{1}{1} + \tfrac{1}{2} + \tfrac{1}{2} = 2\text{ S}`],
  gv_g12: [String.raw`(\mathbf{G})_{12} = (\mathbf{G})_{21} = -G_{12} \le 0`, String.raw`G_{12} = G_{21} = -\tfrac{1}{1} = -1\text{ S}`],
  gv_g13: [String.raw`(\mathbf{G})_{13} = (\mathbf{G})_{31} = -G_{13} \le 0`, String.raw`G_{13} = G_{31} = -\tfrac{1}{2} = -0.5\text{ S}`],
  gv_g23: [String.raw`(\mathbf{G})_{23} = (\mathbf{G})_{32} = -G_{23} \le 0`, String.raw`G_{23} = G_{32} = -\tfrac{1}{1} = -1\text{ S}`],
  gv_diag: [String.raw`G_{kk} = \textstyle\sum G_{\text{节点 }k} > 0`, String.raw`\operatorname{diag}\mathbf{G} = (2,\ 3,\ 2)\text{ S}`],
  gv_offdiag: [String.raw`G_{kj} = G_{jk} = -\textstyle\sum G_{kj}^{\text{branch}} \le 0`, String.raw`G_{12} = -1,\ G_{13} = -0.5,\ G_{23} = -1\ \text{S}`],
  gv_rhs: [String.raw`\mathbf{i} = [\,i_1,\ i_2,\ i_3\,]^T\ (\text{流入为正})`, String.raw`\mathbf{i} = [\,12,\ 4,\ -3\,]^T\text{ A}`],
  gv_ref: [String.raw`v_0 = 0\ (\text{参考节点，不列方程})`, String.raw`v_0 = 0\text{ V}`],
  gv_dep: [String.raw`(\mathbf{G})_{13} = -G_{13} + g_m \neq (\mathbf{G})_{31} = -G_{13}`, String.raw`(\mathbf{G})_{13} = -0.5 + ${GM} = 1.5 \neq (\mathbf{G})_{31} = -0.5`],
  ri_r11: [String.raw`R_{11} = R_1 + R_{12} + R_{13} > 0`, String.raw`R_{11} = 2 + 4 + 2 = 8\ \Omega`],
  ri_r22: [String.raw`R_{22} = R_2 + R_{12} + R_{23} > 0`, String.raw`R_{22} = 3 + 4 + 1 = 8\ \Omega`],
  ri_r33: [String.raw`R_{33} = R_3 + R_{13} + R_{23} > 0`, String.raw`R_{33} = 3 + 2 + 1 = 6\ \Omega`],
  ri_r12: [String.raw`(\mathbf{R})_{12} = (\mathbf{R})_{21} = -R_{12} \le 0`, String.raw`R_{12} = R_{21} = -4\ \Omega`],
  ri_r13: [String.raw`(\mathbf{R})_{13} = (\mathbf{R})_{31} = -R_{13} \le 0`, String.raw`R_{13} = R_{31} = -2\ \Omega`],
  ri_r23: [String.raw`(\mathbf{R})_{23} = (\mathbf{R})_{32} = -R_{23} \le 0`, String.raw`R_{23} = R_{32} = -1\ \Omega`],
  ri_diag: [String.raw`R_{kk} = \textstyle\sum R_{\text{网孔 }k} > 0`, String.raw`\operatorname{diag}\mathbf{R} = (8,\ 8,\ 6)\ \Omega`],
  ri_offdiag: [String.raw`R_{kj} = R_{jk} = -\textstyle\sum R_{\text{shared}(k,j)} \le 0`, String.raw`R_{12} = -4,\ R_{13} = -2,\ R_{23} = -1\ \Omega`],
  ri_rhs: [String.raw`v_k = \textstyle\sum (\text{CW 由 } - \text{ 到 } +) - \textstyle\sum (\text{由 } + \text{ 到 } -)`, String.raw`\mathbf{v} = [\,18,\ -3,\ 8\,]^T\text{ V}`],
  ri_cw: [String.raw`i_1,\ i_2,\ i_3\ \text{统一顺时针（CW）}`, String.raw`i_1,\ i_2,\ i_3\ \text{统一顺时针（CW）}`],
  ri_dep: [String.raw`(\mathbf{R})_{13} = -R_{13} - r_m \neq (\mathbf{R})_{31} = -R_{13}`, String.raw`(\mathbf{R})_{13} = -R_{13} - r_m \neq (\mathbf{R})_{31}`],
  ex_io: [String.raw`I_o = i_1 - i_2`, String.raw`I_o = i_1 - i_2 = 4 - 2 = 2\text{ A}\ (\text{向下})`],
};

/** in the guided example (mesh, numbers) a formula waits for its step: the reveal level it needs */
const NEEDS: Record<string, number> = {
  ri_r11: 1,
  ri_r22: 1,
  ri_r33: 1,
  ri_r12: 1,
  ri_r13: 1,
  ri_r23: 1,
  ri_diag: 1,
  ri_offdiag: 1,
  ri_rhs: 2,
  ex_io: 4,
};

export default function MatrixLayer() {
  const [mode, setMode] = useStageParam<Mode>('l1_mode', 'nodal');
  const [num, setNum] = useStageParam('l1_num', false);
  const [dep, setDep] = useStageParam('l1_dep', false);
  const [reveal, setReveal] = useStageParam('l1_reveal', 4);
  const { lit, bind } = useLink();
  const [wrapRef, box] = useBox<HTMLDivElement>();

  const guidedEx = mode === 'mesh' && num; // 图 6-1: the guided example
  const depOn = dep && !guidedEx;
  const rv = guidedEx ? reveal : 4;

  // arrangement: matrix beside the circuit or under it, whichever draws larger
  const wideS = fitScale(box, CW + GAP + MW, CH);
  const tallS = fitScale(box, CW, CH + GAP + MH);
  const wide = wideS >= tallS;
  const vbW = wide ? CW + GAP + MW : CW;
  const vbH = wide ? CH : CH + GAP + MH;
  const mx = wide ? CW + GAP : (CW - MW) / 2;
  const my = wide ? (CH - MH) / 2 : CH + GAP;

  const table = mode === 'nodal' ? NODAL_LIGHTS : MESH_LIGHTS;
  const keys = new Set(lit.flatMap((id) => (table[id] ? table[id].filter((k) => (k === 'dep' || id.endsWith('_dep') ? depOn : true)) : [])));
  const on = (k: string) => keys.has(k);
  const cls = (k: string, base: string) => `${base} ${on(k) ? 'lit' : ''}`;

  /* cell texts */
  const cellText = (r: number, c: number): string => {
    if (!num) {
      if (depOn && r === 0 && c === 2) return mode === 'nodal' ? '−G₁₃+g_m' : '−R₁₃−r_m';
      return SYM_CELLS[mode][r][c];
    }
    if (mode === 'nodal') {
      const v = NOD.G[r][c] + (depOn && r === 0 && c === 2 ? GM : 0);
      return fmt(v);
    }
    if (rv < 1) return '?';
    return fmt(MES.R[r][c] + (depOn && r === 0 && c === 2 ? -RM : 0));
  };
  const rhsText = (r: number) => (!num ? SYM_RHS[mode][r] : mode === 'nodal' ? fmt(NOD.i[r]) : rv < 2 ? '?' : fmt(MES.v[r]));

  /* HUD */
  const telId = lit.find((id) => TEL[id] && (table === NODAL_LIGHTS ? id.startsWith('gv_') : id.startsWith('ri_') || id === 'ex_io'));
  let hud: { tex?: string; text?: string };
  if (telId && guidedEx && (NEEDS[telId] ?? 0) > rv) hud = { text: '这一项要等你在右侧答对对应的引导步骤后才揭晓——先自己判断。' };
  else if (telId && !(telId.endsWith('_dep') && !depOn)) hud = { tex: TEL[telId][num ? 1 : 0] };
  else if (depOn)
    hud = {
      text:
        mode === 'nodal'
          ? '受控源的控制量 v₃ 只进了第 1 行：G₁₃ ≠ G₃₁，对称性失效 → 观察法禁用，回到标准 KCL 列式。'
          : '受控源的控制量 i₃ 只进了第 1 行：R₁₃ ≠ R₃₁，对称性失效 → 观察法禁用，回到标准 KVL 列式。',
    };
  else if (!num)
    hud = {
      tex:
        mode === 'nodal'
          ? String.raw`\mathbf{G}\mathbf{v} = \mathbf{i},\quad \mathbf{G} = \mathbf{G}^T`
          : String.raw`\mathbf{R}\mathbf{i} = \mathbf{v},\quad \mathbf{R} = \mathbf{R}^T`,
    };
  else if (mode === 'nodal')
    hud = {
      tex: String.raw`\Delta = ${fmt(NOD_SOL.d)} \Rightarrow \mathbf{v} = \mathbf{G}^{-1}\mathbf{i} = [\,${NOD_SOL.x.map((x) => fmt(x)).join(',\\ ')}\,]^T\text{ V}`,
    };
  else if (rv < 1) hud = { text: '例题 6-1：跟着右侧的引导例题一步一步把 R、v 填进矩阵。' };
  else if (rv < 3)
    hud = { tex: rv < 2 ? String.raw`\mathbf{R} = \mathbf{R}^T\ \checkmark\quad \mathbf{v} = \,?` : String.raw`\mathbf{R}\mathbf{i} = \mathbf{v}:\ \Delta = ?,\ \mathbf{i} = ?` };
  else if (rv < 4) hud = { tex: String.raw`\Delta = ${fmt(MES_SOL.d)} \Rightarrow \mathbf{i} = [\,${MES_SOL.x.map((x) => fmt(x)).join(',\\ ')}\,]^T\text{ A},\ I_o = ?` };
  else hud = { tex: String.raw`\mathbf{i} = [\,${MES_SOL.x.map((x) => fmt(x)).join(',\\ ')}\,]^T\text{ A},\quad I_o = i_1 - i_2 = ${fmt(MES_SOL.x[0] - MES_SOL.x[1])}\text{ A}` };

  /* mapping arcs: a lit mutual id draws a dashed curve from its branch to cell (k,j) */
  const arcs: { from: [number, number]; to: [number, number]; tone: string }[] = [];
  for (const id of lit) {
    const m = /^(gv_g|ri_r)(\d)(\d)$/.exec(id);
    if (!m || m[2] === m[3]) continue;
    if ((m[1] === 'gv_g') !== (mode === 'nodal')) continue;
    const r = +m[2] - 1;
    const c = +m[3] - 1;
    const br = BRANCH_AT[`${mode === 'nodal' ? 'G' : 'R'}${r + 1}${c + 1}`];
    const cx = mx + 18 + c * 88 + 41;
    const cy = my + 34 + r * 46 + 20;
    arcs.push({ from: br, to: [cx, cy], tone: `t${r + 1}${c + 1}` });
  }

  const sym = !depOn;
  return (
    <div className="w24-layer">
      <div className="w24-dock">
        <Seg
          label="矩阵模式"
          value={mode}
          onChange={setMode}
          options={[
            ['nodal', <Lbl key="n" long="节点电导矩阵 (Gv=i)" short="节点 Gv=i" />],
            ['mesh', <Lbl key="m" long="网孔电阻矩阵 (Ri=v)" short="网孔 Ri=v" />],
          ]}
        />
        <Switch on={num} onChange={setNum}>
          <Lbl long={`数值例题${num ? (mode === 'nodal' ? ' · 图 3-1' : ' · 图 6-1') : ''}`} short="数值" />
        </Switch>
        <Switch on={depOn} onChange={setDep} bad disabled={guidedEx} title={guidedEx ? '引导例题里没有受控源' : undefined}>
          <Lbl long="注入 1 个受控源" short="受控源" />
        </Switch>
        {guidedEx && rv < 4 && (
          <button className="w24-btn" onClick={() => setReveal(4)}>
            揭晓全部
          </button>
        )}
      </div>
      <div className="w24-svgwrap" ref={wrapRef}>
        <svg className="w24-svg" viewBox={`0 0 ${vbW} ${vbH}`} role="img" aria-label={mode === 'nodal' ? '3 节点电路与电导矩阵 G' : '3 网孔电路与电阻矩阵 R'}>
          <rect className="w24-panel" x={0.5} y={0.5} width={CW - 1} height={CH - 1} rx={10} />
          {mode === 'nodal' ? <NodalCircuit num={num} dep={depOn} cls={cls} bind={bind} /> : <MeshCircuit num={num} dep={depOn} rv={rv} cls={cls} bind={bind} />}

          {/* the matrix equation */}
          <g transform={`translate(${mx} ${my})`}>
            <rect className="w24-panel" x={0.5} y={0.5} width={MW - 1} height={MH - 1} rx={10} />
            <text className="w24-mat-title" x={14} y={22}>
              {mode === 'nodal' ? '观察法直写：G · v = i' : '观察法直写：R · i = v'}
            </text>
            <path className="w24-bracket" d={`M 18 34 h -8 v 134 h 8 M 282 34 h 8 v 134 h -8`} />
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => {
                const k = `c${r + 1}${c + 1}`;
                const broken = depOn && r === 0 && c === 2;
                const tone = r === c ? `d${r + 1}` : `t${Math.min(r, c) + 1}${Math.max(r, c) + 1}`;
                const t = cellText(r, c);
                return (
                  <g
                    key={k}
                    className={`w24-cell ${tone} ${on(k) ? 'lit' : ''} ${broken ? 'broken' : ''} ${t === '?' ? 'hidden' : ''}`}
                    {...bind(broken ? (mode === 'nodal' ? 'gv_dep' : 'ri_dep') : cellId(mode, r, c))}
                  >
                    <rect x={18 + c * 88} y={34 + r * 46} width={82} height={40} rx={6} />
                    <text x={18 + c * 88 + 41} y={34 + r * 46 + 25} className={t.length > 8 ? 'small' : ''}>
                      {t}
                    </text>
                  </g>
                );
              }),
            )}
            {[0, 1, 2].map((r) => (
              <Fragment key={r}>
                <text className={`w24-vec x${r + 1}`} x={298} y={34 + r * 46 + 25}>
                  {SYM_X[mode][r]}
                </text>
                <g className={`w24-rhs ${on(`b${r + 1}`) ? 'lit' : ''}`} {...bind(mode === 'nodal' ? 'gv_rhs' : 'ri_rhs')}>
                  <rect x={327} y={34 + r * 46 + 6} width={30} height={28} rx={5} />
                  <text x={342} y={34 + r * 46 + 25}>
                    {rhsText(r)}
                  </text>
                </g>
              </Fragment>
            ))}
            <text className="w24-eq" x={317} y={34 + 46 + 25}>
              =
            </text>
            <text className={`w24-sym ${sym ? 'ok' : 'bad'}`} x={14} y={MH - 10}>
              {sym
                ? mode === 'nodal'
                  ? '对称：Gkj = Gjk（纯独立源）'
                  : '对称：Rkj = Rjk（平面 + 统一 CW）'
                : mode === 'nodal'
                  ? '对称性失效：G₁₃ ≠ G₃₁ → 观察法禁用'
                  : '对称性失效：R₁₃ ≠ R₃₁ → 观察法禁用'}
            </text>
          </g>

          {arcs.map((a, i) => {
            const [x1, y1] = a.from;
            const [x2, y2] = a.to;
            const c1 = wide ? [x1 + 120, y1 - 70] : [x1 + 30, y1 + 120];
            const c2 = wide ? [x2 - 90, y2 - 60] : [x2, y2 - 90];
            return <path key={i} className={`w24-map ${a.tone}`} d={`M ${x1} ${y1} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${x2} ${y2}`} />;
          })}
        </svg>
      </div>
      <div className={`w24-hud ${depOn ? 'bad' : ''}`} aria-live="polite">
        {hud.tex ? <Tex tex={hud.tex} /> : <span>{hud.text}</span>}
      </div>
    </div>
  );
}

type Bind = ReturnType<typeof useLink>['bind'];
type Cls = (k: string, base: string) => string;

function NodalCircuit({ num, dep, cls, bind }: { num: boolean; dep: boolean; cls: Cls; bind: Bind }) {
  const [x1, x2, x3] = NX;
  const lab = (sym: string, ohm: string, s: string) => (num ? [ohm, s] : [sym, '']);
  const branch = (k: string, id: string, x: number, y: number, dir: 'h' | 'v', label: [string, string], lx: number, ly: number, anchor: 'start' | 'middle' | 'end' = 'start') => (
    <g className={cls(k, `w24-branch ${k}`)} {...bind(id)}>
      <ResBox x={x} y={y} dir={dir} />
      <text className="w24-lbl" x={lx} y={ly} textAnchor={anchor}>
        {label[0]}
      </text>
      {label[1] && (
        <text className="w24-lbl sub" x={lx} y={ly + 14} textAnchor={anchor}>
          {label[1]}
        </text>
      )}
    </g>
  );
  return (
    <g>
      {/* wires */}
      <g className="w24-wire">
        <polyline points={`34,${RAIL} 34,${NY} ${x1},${NY} ${x3},${NY}`} />
        <polyline points={`${x3},${NY} 418,${NY} 418,${RAIL}`} />
        <polyline points={`${x1},${NY} ${x1},${ARCH} ${x3},${ARCH} ${x3},${NY}`} />
        <line x1={x1} y1={NY} x2={x1} y2={RAIL} />
        <line x1={x2} y1={NY} x2={x2} y2={RAIL} />
        <line x1={x3} y1={NY} x2={x3} y2={RAIL} />
        <polyline points={`206,${RAIL} 206,146 ${x2},146`} />
        {dep && <line x1={78} y1={NY} x2={78} y2={RAIL} />}
      </g>
      <g className={cls('ref', 'w24-ref')} {...bind('gv_ref')}>
        <line x1={34} y1={RAIL} x2={418} y2={RAIL} />
        <path d={`M 290 ${RAIL} v 12 M 278 ${RAIL + 12} h 24 M 283 ${RAIL + 17} h 14 M 287 ${RAIL + 22} h 6`} />
        <text className="w24-lbl muted" x={308} y={RAIL + 22}>
          参考节点 0
        </text>
      </g>
      {/* branches */}
      {branch('G1', 'gv_g11', x1, 180, 'v', lab('G₁', '2 Ω', '(0.5 S)') as [string, string], x1 + 14, 176)}
      {branch('G2', 'gv_g22', x2, 180, 'v', lab('G₂', '1 Ω', '(1 S)') as [string, string], x2 + 14, 176)}
      {branch('G3', 'gv_g33', x3, 180, 'v', lab('G₃', '2 Ω', '(0.5 S)') as [string, string], x3 - 14, 176, 'end')}
      {branch('G12', 'gv_g12', 187, NY, 'h', [num ? '1 Ω (1 S)' : 'G₁₂', ''], 187, NY - 16, 'middle')}
      {branch('G23', 'gv_g23', 311, NY, 'h', [num ? '1 Ω (1 S)' : 'G₂₃', ''], 311, NY - 16, 'middle')}
      {branch('G13', 'gv_g13', 248, ARCH, 'h', [num ? '2 Ω (0.5 S)' : 'G₁₃', ''], 248, ARCH - 14, 'middle')}
      {/* sources */}
      <g className={cls('i1', 'w24-isrc s1')} {...bind('gv_rhs')}>
        <CurSrc x={34} y={180} dir="up" />
        <text className="w24-lbl" x={30} y={152} textAnchor="end">
          {num ? '12 A' : 'i₁'}
        </text>
      </g>
      <g className={cls('i2', 'w24-isrc s2')} {...bind('gv_rhs')}>
        <CurSrc x={206} y={190} dir="up" />
        <text className="w24-lbl" x={212} y={168}>
          {num ? '4 A' : 'i₂'}
        </text>
      </g>
      <g className={cls('i3', 'w24-isrc s3')} {...bind('gv_rhs')}>
        <CurSrc x={418} y={180} dir={num ? 'down' : 'up'} />
        <text className="w24-lbl" x={414} y={152} textAnchor="end">
          {num ? '3 A↓' : 'i₃'}
        </text>
      </g>
      {dep && (
        <g className={cls('dep', 'w24-dep')} {...bind('gv_dep')}>
          <DepSrc x={78} y={180} kind="current-down" />
          <text className="w24-lbl bad" x={78} y={212} textAnchor="middle">
            {num ? `${GM} v₃` : 'g_m v₃'}
          </text>
        </g>
      )}
      {/* nodes */}
      {NX.map((x, k) => (
        <g key={k} className={cls(`n${k + 1}`, `w24-node n${k + 1}`)} {...bind(`gv_g${k + 1}${k + 1}`)}>
          <circle cx={x} cy={NY} r={6.5} />
          <text x={x + (k === 2 ? -10 : 10)} y={NY - 10} textAnchor={k === 2 ? 'end' : 'start'}>
            {`v${'₁₂₃'[k]}`}
          </text>
        </g>
      ))}
    </g>
  );
}

function MeshCircuit({ num, dep, rv, cls, bind }: { num: boolean; dep: boolean; rv: number; cls: Cls; bind: Bind }) {
  const { l, c, r } = MX;
  const { t, m, b } = MY;
  const res = (k: string, id: string, x: number, y: number, dir: 'h' | 'v', sym: string, val: string, lx: number, ly: number, anchor: 'start' | 'middle' | 'end' = 'start') => (
    <g className={cls(k, `w24-branch ${k}`)} {...bind(id)}>
      <ResBox x={x} y={y} dir={dir} len={dir === 'h' ? 48 : 36} />
      <text className="w24-lbl" x={lx} y={ly} textAnchor={anchor}>
        {num ? val : sym}
      </text>
    </g>
  );
  return (
    <g>
      <g className="w24-wire">
        <rect x={l} y={t} width={r - l} height={b - t} fill="none" />
        <line x1={l} y1={m} x2={r} y2={m} />
        <line x1={c} y1={m} x2={c} y2={b} />
      </g>
      {res('R3', 'ri_r33', 130, t, 'h', 'R₃', '3 Ω', 130, t - 10, 'middle')}
      {res('R13', 'ri_r13', 130, m, 'h', 'R₁₃', '2 Ω', 130, m - 14, 'middle')}
      {res('R23', 'ri_r23', 310, m, 'h', 'R₂₃', '1 Ω', 310, m - 14, 'middle')}
      {res('R1', 'ri_r11', l, 152, 'v', 'R₁', '2 Ω', l + 14, 156)}
      {res('R12', 'ri_r12', c, 178, 'v', 'R₁₂', '4 Ω', c + 14, 182)}
      {res('R2', 'ri_r22', r, 152, 'v', 'R₂', '3 Ω', r - 14, 156, 'end')}
      <g className={cls('V1', 'w24-vsrc s1')} {...bind('ri_rhs')}>
        <VoltSrc x={l} y={204} plus="top" />
        <text className="w24-lbl" x={l + 20} y={208}>
          {num ? '18 V' : 'Vs₁'}
        </text>
      </g>
      <g className={cls('V2', 'w24-vsrc s2')} {...bind('ri_rhs')}>
        <VoltSrc x={r} y={204} plus="top" />
        <text className="w24-lbl" x={r - 20} y={208} textAnchor="end">
          {num ? '3 V' : 'Vs₂'}
        </text>
      </g>
      <g className={cls('V3', 'w24-vsrc s3')} {...bind('ri_rhs')}>
        <VoltSrc x={300} y={t} plus="right" />
        <text className="w24-lbl" x={300} y={t + 30} textAnchor="middle">
          {num ? '8 V' : 'Vs₃'}
        </text>
      </g>
      {dep && (
        <g className={cls('dep', 'w24-dep')} {...bind('ri_dep')}>
          <DepSrc x={130} y={b} kind="voltage-lr" />
          <text className="w24-lbl bad" x={130} y={b + 28} textAnchor="middle">
            r_m i₃
          </text>
        </g>
      )}
      {/* clockwise mesh currents */}
      {[
        [130, 186, 18, 'm1', 'i₁'],
        [310, 186, 18, 'm2', 'i₂'],
        [220, 77, 16, 'm3', 'i₃'],
      ].map(([x, y, rr, k, name]) => (
        <g key={k as string} className={cls(k as string, `w24-mesh ${k}`)} {...bind('ri_cw')}>
          <CwArc x={x as number} y={y as number} r={rr as number} />
          <text x={x as number} y={(y as number) + 5}>
            {num && rv >= 3 ? `${name}=${fmt(MES_SOL.x[+(k as string)[1] - 1])}A` : (name as string)}
          </text>
        </g>
      ))}
      {num && (
        <g className={cls('Io', 'w24-io')} {...bind('ex_io')}>
          <line x1={c - 18} y1={160} x2={c - 18} y2={192} />
          <polygon points={`${c - 18},${199} ${c - 22.5},${190} ${c - 13.5},${190}`} />
          <text x={c - 24} y={184} textAnchor="end">
            {rv >= 4 ? `Iₒ=${fmt(MES_SOL.x[0] - MES_SOL.x[1])}A` : 'Iₒ'}
          </text>
        </g>
      )}
    </g>
  );
}
