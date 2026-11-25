// W1-L4 · 支路、节点与回路拓扑识别 (lesson sheet: docs/lessons/W1-L4.md).
// The professor's text, formulas, the act diagrams (svgs.ts), the guided example (Sadiku
// Example 2.4) and the self-test are reproduced from the sheet. Changes from the sheet, all of
// form, none of wording:
// - TeX the Google-Docs export broke is restored: `0,\Omega` → `0\,\Omega`, `0.002%` →
//   `0.002\%`, `{A, B}` → `\{A, B\}` (the set braces were lost) …;
// - `$$…$$` display formulas sit in the ② blue / ③ green cards; prose between two display
//   formulas stays next to them; the bulleted ① of act 4 runs as one paragraph;
// - act 3's title carries `b = l + n − 1` as plain text (act titles are not TeX-rendered);
// - in act 6 the W1-L5 preview comes before the self-test (the quiz closes the act);
// - [[id|…]] only links a term to the stage (the words are unchanged);
// - added (the sheet has none): the guided example's problem line, its three hints and board
//   lines; feedback for the wrong quiz options; diagrams for the two quiz questions.

import { lazy } from 'react';
import type { HoverTarget, StageLesson } from '../../types';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6 } from './svgs';

const EquipotentialLayer = lazy(() => import('./EquipotentialLayer'));
const SeriesParallelLayer = lazy(() => import('./SeriesParallelLayer'));

const L1 = 'layer-01-equipotential';
const L2 = 'layer-02-series-parallel';

/* ------------------------------------------------------------- quiz diagrams (added, sheet style) */

/** Q1: six two-terminal elements on four separate five-hole strips (the numbers are the elements). */
const SVG_Q1 = (() => {
  const xs = [80, 170, 260, 350];
  const strips = xs
    .map(
      (x) =>
        `<rect x="${x - 9}" y="52" width="18" height="68" rx="4" fill="#38bdf8" fill-opacity="0.18" stroke="#38bdf8" stroke-width="1.4"/>` +
        [0, 1, 2, 3, 4].map((k) => `<rect x="${x - 3}" y="${57 + k * 13}" width="6" height="6" rx="1" fill="#0f172a" stroke="#64748b"/>`).join(''),
    )
    .join('');
  const row = (r: number) => 60 + r * 13;
  const box = (x: number, y: number, n: number) =>
    `<rect x="${x - 12}" y="${y - 7}" width="24" height="14" rx="2" fill="#0f172a" stroke="#f59e0b" stroke-width="1.6"/><text x="${x}" y="${y + 3.5}" fill="#fcd34d" font-size="9" font-weight="700" text-anchor="middle" font-family="monospace">${n}</text>`;
  const straight = (x1: number, x2: number, r: number, n: number) =>
    `<line x1="${x1}" y1="${row(r)}" x2="${x2}" y2="${row(r)}" stroke="#94a3b8" stroke-width="1.8"/>${box((x1 + x2) / 2, row(r), n)}`;
  const arc = (x1: number, r1: number, x2: number, r2: number, ym: number, n: number) =>
    `<path d="M ${x1} ${row(r1)} C ${x1} ${ym}, ${x2} ${ym}, ${x2} ${row(r2)}" fill="none" stroke="#94a3b8" stroke-width="1.8"/>${box((x1 + x2) / 2, (row(r1) + row(r2)) / 2 + (ym - (row(r1) + row(r2)) / 2) * 0.75, n)}`;
  // leads (column: rows): 1: a b e · 2: b c d · 3: c d e · 4: a d e — 12 leads, 6 elements
  const leads: [number, number][] = [
    [0, 0],
    [0, 1],
    [0, 4],
    [1, 1],
    [1, 2],
    [1, 3],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, 0],
    [3, 3],
    [3, 4],
  ];
  return `<svg viewBox="0 0 420 200" aria-label="6 个二端元件插在 4 条互不相连的面包板竖列上">
  <rect width="420" height="200" rx="10" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">Q1 · 6 个二端元件 · 4 条互不相连的 5 孔竖列 (a–e)</text>
  ${strips}
  ${arc(80, 0, 350, 0, 28, 6)}
  ${straight(80, 170, 1, 1)}
  ${straight(170, 260, 2, 2)}
  ${straight(260, 350, 3, 3)}
  ${arc(80, 4, 260, 4, 182, 4)}
  ${arc(170, 3, 350, 4, 196, 5)}
  <g fill="#f59e0b">${leads.map(([c, r]) => `<circle cx="${xs[c]}" cy="${row(r)}" r="2.6"/>`).join('')}</g>
</svg>`;
})();

/** Q2: Ra and Rc between X and Y, Rb between Y and Z; Y carries only these three. */
const SVG_Q2 = `<svg viewBox="0 0 420 180" aria-label="Ra、Rc 跨接 X 与 Y，Rb 跨接 Y 与 Z">
  <rect width="420" height="180" rx="10" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">Q2 · 三颗电阻与节点 X、Y、Z</text>
  <path d="M 80 100 C 80 58, 230 58, 230 100" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <path d="M 80 100 C 80 142, 230 142, 230 100" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <line x1="230" y1="100" x2="360" y2="100" stroke="#94a3b8" stroke-width="2"/>
  <rect x="137" y="58" width="36" height="16" rx="2" fill="#0f172a" stroke="#e2e8f0" stroke-width="1.8"/>
  <text x="155" y="70" fill="#e2e8f0" font-size="9.5" font-weight="700" text-anchor="middle" font-family="monospace">Ra</text>
  <rect x="137" y="126" width="36" height="16" rx="2" fill="#0f172a" stroke="#e2e8f0" stroke-width="1.8"/>
  <text x="155" y="138" fill="#e2e8f0" font-size="9.5" font-weight="700" text-anchor="middle" font-family="monospace">Rc</text>
  <rect x="277" y="92" width="36" height="16" rx="2" fill="#0f172a" stroke="#e2e8f0" stroke-width="1.8"/>
  <text x="295" y="104" fill="#e2e8f0" font-size="9.5" font-weight="700" text-anchor="middle" font-family="monospace">Rb</text>
  <circle cx="80" cy="100" r="7" fill="#38bdf8"/><text x="62" y="104" fill="#38bdf8" font-size="12" font-weight="800" font-family="monospace">X</text>
  <circle cx="230" cy="100" r="7" fill="#f59e0b"/><text x="230" y="88" fill="#f59e0b" font-size="12" font-weight="800" text-anchor="middle" font-family="monospace">Y</text>
  <circle cx="360" cy="100" r="7" fill="#10b981"/><text x="372" y="104" fill="#10b981" font-size="12" font-weight="800" font-family="monospace">Z</text>
  <text x="210" y="168" fill="#cbd5e1" font-size="10" text-anchor="middle" font-family="monospace">节点 Y 只连 Ra、Rb、Rc（无其他支路）</text>
</svg>`;

/* ------------------------------------------------------------- stage ids not in the sheet's hover map */

const EXTRA: Record<string, HoverTarget> = {
  ex24_branches: { label: 'Ex 2.4 的二端元件', desc: '一个一个点名：每个二端元件就是 1 条支路' },
  ex24_wires: { label: 'Ex 2.4 的全部导线', desc: '顺着导线涂色：没撞上元件，就还是同一个节点' },
};

/* ------------------------------------------------------------- the lesson */

const W1_L4: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: EquipotentialLayer, [L2]: SeriesParallelLayer },
  describeTarget: (id) => EXTRA[id] ?? null,
  lesson_meta: {
    lesson_id: 'W1-L4',
    world: 'World 1 · 电学公理与基本定律',
    title: '支路、节点与回路拓扑识别',
    subtitle: '治好“数错节点、拐弯当新点、假串假并”的电路透视术',
    lesson_type: 'B',
    lesson_type_label: 'Type B (纯拓扑与方法论课)',
    estimated_minutes: 25,
    textbook_primary: { book: 'Fundamentals of Electric Circuits (2026 Release)（Alexander & Sadiku）', sections: ['Ch. 2.3 Nodes, Branches, and Loops (含 Example 2.4)'] },
    textbook_supplement: 'Introductory Circuit Analysis（Boylestad）· Ch. 5 Series-Parallel Circuits（节点度与串并联拓扑识别）',
    prerequisites: ['W1-L1 电荷、电流与参考方向', 'W1-L2 电压、电位与参考节点（地）', 'W1-L3 欧姆定律与理想导线零压降模型'],
    next_lesson: 'W1-L5',
    next_lesson_title: '基尔霍夫电流定律（KCL）——节点的流量守恒账本',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 等电位节点染色高亮台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '点击任意一段导线：沿 0 Ω 导线洪泛染色，整片等电位区域涂成同一种颜色；再按“一键拉直”看折线缩成一个点。',
      },
      {
        id: L2,
        label: '02 串联 vs 并联拓扑判定台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '依次点击两颗元件判定真/假串并联；拨动“破坏者”开关、拖动元件和节点重排，看结论变不变。',
      },
    ],
    hover_map: {
      hl_branch_def: { label: '支路（二端元件）', desc: '每个二端元件（电阻、电压源、电流源）就是 1 条支路；纯导线不是支路' },
      hl_node_collapse: { label: '节点 B 的整片导线', desc: '3 个 T 字路口、拐角和一圈导线全是 0 Ω 导线：缩成 1 个节点' },
      hl_fake_corner: { label: '90° 拐角', desc: '0 Ω 导线，非新节点' },
      hl_bb_5hole: { label: '第 12 列 a12–e12 铜片', desc: '5 个孔共用一条磷青铜簧片 = 原理图节点 A' },
      hl_bb_trench: { label: '中央凹槽', desc: '断路隔离：e 与 f 不连通' },
      hl_topo_tree: { label: '生成树与连枝', desc: 'n − 1 = 2 条树枝（实线）+ l = 2 条连枝（虚线）= b = 4 条支路' },
      hl_true_series: { label: '真串联（独占 2 度节点）', desc: '中间节点只连这两颗元件：deg = 2，流过同一电流' },
      hl_fake_series: { label: '第三支路 Rtap（3 度节点）', desc: '中间节点多挂一条支路：deg = 3，电流在此一分为二' },
      hl_true_parallel: { label: '真并联（同一对节点轨）', desc: '上下两条公共节点轨：两元件承受同一电压 V1 = V2' },
      hl_fake_parallel: { label: '夹塞元件 Rsneak', desc: '把同色的顶轨劈成 A 与 A′ 两个节点：不再是同一对节点' },
      hl_ex24_circuit: { label: 'Sadiku Ex 2.4 五元件电路', desc: '1 个 10 V 电压源 + 4 颗电阻，顶部和底部留了 T 字路口与拐角' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '拆掉“拐弯焦虑”——什么是支路（Branch）与真实节点（Node）？',
      sync: { layer: L1, halo: ['hl_node_collapse', 'hl_fake_corner'], params: { l1_straight: false, l1_bb: false } },
      blocks: [
        {
          kind: 'p',
          text: '各位同学，欢迎回到 Breadboard Lab。前三节课我们把电压、电流和欧姆定律都装进了工具箱，但在下节课正式写基尔霍夫方程之前，我必须先替大家动一个小手术——专治电路初学者最顽固的“视觉近视症”：**一看到原理图里导线拐了个 90° 的弯，或者多了两个 T 字路口，就忍不住把它数成新的节点**。',
        },
        { kind: 'p', text: '如果你节点数错了，后面列方程就像给大楼画错了承重墙，算得越认真，错得越离谱。' },
        {
          kind: 'p',
          text: '先定死第一个概念：[[hl_branch_def|**支路（Branch）**]]。在 Sadiku 第 2.3 节里，支路的定义干脆利落——**电路中的任意一个单一二端元件（一颗电阻、一个电压源、一个电流源）就是一条支路**。数支路数 $b$ 从来不需要动脑筋，只要像点人头一样数清楚图里有几个二端元件就行；**纯导线不是支路**。',
        },
        {
          kind: 'p',
          text: '真正让人栽跟头的是第二个概念：**节点（Node）**。书上说“节点是两条或多条支路的连接点”，听起来很乖巧，可一旦画成方方正正的原理图，很多同学就会把 [[hl_fake_corner|90° 拐角]] 或者分开画的三个 T 字焊点当成三个不同节点。',
        },
        { kind: 'p', text: '为什么它们其实是[[hl_node_collapse|**同一个节点**]]？我们不能靠感觉，要靠电路最底层的**理想导线公理**来推导。' },
        { kind: 'p', text: '**三段式严谨推导：等电位导线合并原则**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: String.raw`依据集总参数电路的理想导体模型与欧姆定律：原理图中连接各元件端子的理想导线电阻恒为零（$R_{\text{wire}} = 0$），且导线内部不储存电场或磁场能量，任意两点 $P, Q$ 之间的电位差由欧姆定律给出。`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式：设流过理想导线片段 $PQ$ 的任意有限电流为 $I$，导线电阻为 $R_{\text{wire}}$，则两点间电压降为：`,
          tex: String.raw`\Delta V_{PQ} = V_P - V_Q = I \cdot R_{\text{wire}}`,
        },
        { kind: 'formula', title: String.raw`代入理想导线公理 $R_{\text{wire}} = 0$：`, tex: String.raw`V_P - V_Q = I \cdot 0 = 0 \implies V_P = V_Q` },
        {
          kind: 'p',
          text: '由此得出**等电位导线合并原则**：只要两点之间存在一条**不经过任何元件**的纯导线路径，无论这条导线拐了多少个弯、分了多少个 T 字叉，整片连通区域处处电位严格相等，在拓扑上必须[[hl_node_collapse|坍缩（Collapse）为 **1 个节点**]]。',
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A',
              text: String.raw`假设某段包含 2 个 90° 拐角和 3 个 T 字焊点的顶部铜线中流过电流 $I = 2.5\text{ A}$，理想模型下 $R_{\text{wire}} = 0\,\Omega$，左端焊点电位 $V_1 = 12\text{ V}$，求最右端焊点电位 $V_3$：`,
            },
            { label: 'Step B', tex: String.raw`\Delta V_{13} = I \cdot R_{\text{wire}} = 2.5\text{ A} \times 0\,\Omega = 0\text{ V}` },
            { label: 'Step C', tex: String.raw`V_3 = V_1 - \Delta V_{13} = 12\text{ V} - 0\text{ V} = 12\text{ V}` },
            {
              label: 'Step D',
              text: String.raw`因为 $V_1 = V_2 = V_3 = 12\text{ V}$，这 3 个看似分散的焊点与 2 个拐角在电路方程里只贡献 **1 个**电位变量，故 真实节点数 $n_{\text{top}} = 1$，绝不是 3 或 5。`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '**教授口诀**：数节点时，请把你的手指想象成一支**荧光笔**——只要不撞上元件，顺着导线一路涂到底；一种颜色涂满一整片连通导线，最后数**用了几种颜色**，那就是真实的节点数 $n$！请立刻去左侧 01 等电位节点染色高亮台 点一下顶部导线，再按一下“一键拉直”亲自看它缩成一个点。',
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '等电位导线合并：把“折线与多 T 字路口”缩成 1 个真实节点',
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '从原理图落到实体——为什么面包板同一竖列 5 个孔只是 1 个节点？',
      sync: { layer: L1, halo: ['hl_bb_5hole', 'hl_bb_trench'], params: { l1_bb: true } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`很多同学在纸上画图很顺，一拿到实体面包板就傻眼：“老师，原理图里 $R_1$、$R_2$、$R_3$ 明明焊在同一个小黑点上，可面包板一个孔只能插一根电阻脚，我把它们分别插在第 12 列的 a12、c12、e12，这不就变成 3 个不同的点了吗？”`,
        },
        {
          kind: 'p',
          text: '这就是我们为什么叫 **Breadboard Lab**。如果你把面包板背面的双面胶撕开，你会立刻豁然开朗：[[hl_bb_5hole|**同一竖列的 5 个孔（`a–e`）下面藏着一整条连体的磷青铜弹片（Spring-Clip Busbar）**]]。只要你把三颗元件的引脚插进同一竖列的任意孔位，它们在地下就被这条金属夹片紧紧咬合在了一起。',
        },
        {
          kind: 'p',
          text: '而面包板正中间那条长长的 [[hl_bb_trench|**中央凹槽（Center Trench / DIP Ravine）**]]，则是特意用来切断连接的物理绝缘沟：e12 和 f12 虽然只隔着两毫米，但地下金属片彻底断开，分属**两个完全独立的节点**。至于最上和最下的红色 + / 蓝色 - 电源轨，则是横向一整条贯通的金属条，整条电源轨本身就是原理图上的 1 个超级大节点（常用来做公共参考地 GND）。',
        },
        { kind: 'p', text: '让我们用三段式 LaTeX 严格检验一下：实体弹片的微小接触电阻，为什么允许我们在拓扑上把 5 个孔合并成 1 个理想节点？' },
        { kind: 'p', text: '**三段式严谨推导：面包板 5 孔竖列的等电位近似**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: String.raw`依据串联分压原理与集总电路近似条件：实体面包板单条金属簧片及接触电阻 $R_{\text{clip}}$ 极小，当其远小于外接支路负载电阻 $R_{\text{load}}$（即 $R_{\text{clip}} \ll R_{\text{load}}$）时，簧片两端压降可忽略不计，该金属条覆盖的全部 5 个插孔在电路分析中等效为一个理想等电位节点。`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式：设流经同一竖列相邻插孔 $i$ 与 $j$ 之间簧片的电流为 $I_{\text{strip}}$，簧片等效电阻为 $R_{\text{clip}}$，电路工作电压为 $V_{\text{sys}}$，则两孔电位差与相对误差为：`,
          tex: String.raw`\Delta V_{ij} = I_{\text{strip}} \cdot R_{\text{clip}}, \qquad \varepsilon_V = \frac{\Delta V_{ij}}{V_{\text{sys}}} = \frac{I_{\text{strip}} \cdot R_{\text{clip}}}{V_{\text{sys}}}`,
        },
        { kind: 'p', text: String.raw`当 $\varepsilon_V \ll 1$ 时，$V_a \approx V_b \approx V_c \approx V_d \approx V_e$，5 个物理插孔合并为 1 个拓扑节点。` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A',
              text: String.raw`在常规面包板实验中，取 $V_{\text{sys}} = 5\text{ V}$，支路负载电阻 $R_{\text{load}} = 1\text{ k}\Omega$，流过簧片电流 $I_{\text{strip}} = \dfrac{5\text{ V}}{1000\,\Omega} = 5\text{ mA} = 5 \times 10^{-3}\text{ A}$，优质磷青铜弹片典型接触电阻 $R_{\text{clip}} = 20\text{ m}\Omega = 2 \times 10^{-2}\,\Omega$：`,
            },
            { label: 'Step B', tex: String.raw`\Delta V_{ae} = (5 \times 10^{-3}\text{ A}) \times (2 \times 10^{-2}\,\Omega) = 1.0 \times 10^{-4}\text{ V} = 0.1\text{ mV}` },
            { label: 'Step C', tex: String.raw`\varepsilon_V = \frac{1.0 \times 10^{-4}\text{ V}}{5\text{ V}} = 2 \times 10^{-5} = 0.002\%` },
            { label: 'Step D', text: '电位差仅有万分之零点二，因此在拓扑与 KCL/KVL 计算中，a12–e12 这 5 个孔毫无疑问就是原理图上的 **1 个节点**！' },
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: '**实验室踩坑提醒**：以后搭电路时，**千万不要把一颗电阻的两条腿插在同一竖列里**（比如 a12 和 e12）——那相当于用底下的铜片把这颗电阻直接短路了！正确做法是跨列插接（如 a12 到 a17），或者跨越中央凹槽（如 e12 到 f12）。',
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '面包板物理透视：同一竖列 5 孔 (a–e) ＝ 原理图 1 个节点',
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '回路（Loop）与基本拓扑定理 b = l + n − 1 的公理推导',
      sync: { layer: L1, halo: ['hl_topo_tree'], params: { l1_bb: false } },
      blocks: [
        { kind: 'p', text: '数清了支路 $b$ 和节点 $n$，我们来看第三个核心概念：**回路（Loop）**。' },
        {
          kind: 'p',
          text: 'Sadiku 给出的定义非常精准：**回路是电路中任意一条闭合路径**——从某个节点出发，沿着元件走一圈回到起点，中途**不重复经过任何中间节点**。',
        },
        {
          kind: 'p',
          text: '但问题来了：如果一个电路有两个相邻的“小窗户”（左窗、右窗），加上把它们合起来的外围“大框框”，一共能走出 3 条闭合路径。那我们以后列基尔霍夫电压定律（KVL）方程时，是不是要列 3 个方程？**不需要！** 因为外围大框的电压降等于左窗加右窗，第三个方程只是前两个方程相加的“复读机”，在线性代数里叫**线性相关**。',
        },
        {
          kind: 'p',
          text: '真正有用的，是**独立回路数 $l$（Independent Loops）**——每条独立回路至少包含一条别的独立回路没有走过的支路。为了防止你在复杂电路里漏数或重复数独立回路，Sadiku Ch. 2.3 给了我们一把极其锋利的拓扑验算尺：**基本网络拓扑定理 $b = l + n - 1$**。',
        },
        { kind: 'p', text: '它不是天上掉下来的经验公式，而是图论中[[hl_topo_tree|**连通图生成树（Spanning Tree）**]]的必然推论。下面我们按三段式把它彻底推明白。' },
        { kind: 'p', text: '**三段式严谨推导：基本网络拓扑定理 $b = l + n - 1$**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: '依据图论中的连通图生成树公理：对于任意一个包含 $n$ 个节点与 $b$ 条支路的连通无向网络图，其任意一棵生成树（Spanning Tree）连接全部 $n$ 个节点且不含任何回路，所含树枝（Twigs）数量严格等于 $n - 1$。每向该生成树中添加 1 条剩余支路（连枝 / Link），都唯一地闭合出 1 个包含该新支路的独立基本回路。',
        },
        { kind: 'formula', title: '② 纯符号通式：设网络总支路数为 $b$，生成树树枝数为 $t$，剩余连枝数（即独立回路数）为 $l$。由支路集合的互斥划分：', tex: 'b = t + l' },
        { kind: 'formula', title: '代入生成树公理 $t = n - 1$，得到基本网络拓扑定理：', tex: 'b = l + n - 1' },
        { kind: 'formula', title: '移项求解独立回路数 $l$，即得实战验算通式：', tex: 'l = b - n + 1' },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: 'Step A', text: '考察下方双网孔电路（含 1 个电压源 $V_s$ 与 3 颗电阻 $R_1, R_2, R_3$）：' },
            { label: 'Step B', text: '数二端元件得支路数：$b = 4$（$V_s, R_1, R_2, R_3$）；' },
            { label: 'Step C', text: '等电位缩点得真实节点数：$n = 3$（左上角节点 $a$、中上节点 $b$、底轨参考节点 $c$）；' },
            { label: 'Step D', text: '代入独立回路通式逐步化简：', tex: 'l = b - n + 1 = 4 - 3 + 1 = 2' },
            { label: 'Step E', text: '反向代入原定理验算：', tex: String.raw`b = l + n - 1 \implies 4 = 2 + 3 - 1 = 4 \quad \checkmark` },
            { label: 'Step F', text: '结论：尽管该电路肉眼可走出 3 条闭合路径（左网孔、右网孔、外圈大回路），但**独立回路数严格只有 $l = 2$ 个**。' },
          ],
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '基本拓扑定理：生成树 (n − 1 = 2 实线) + 连枝 (l = 2 虚线) ＝ b = 4',
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '专治“假串联”与“假并联”——Boylestad 节点判定铁律',
      sync: { layer: L2, halo: ['hl_true_series', 'hl_fake_series'], params: { l2_preset: 1, l2_sabotage: false, l2_pick: [] } },
      blocks: [
        { kind: 'p', text: '现在我们来治好初学者的第二号顽疾：**看长相判串并联**。' },
        { kind: 'p', text: '我改过无数份作业，最常看到的两个“冤假错案”是：' },
        {
          kind: 'ul',
          items: [
            String.raw`[[hl_fake_series|**假串联（伪串联）**]]：两颗电阻 $R_1$、$R_2$ 在图纸上头尾相接、横着排成一条直线，同学脱口而出“它们串联！”——完全没看见它们中间那个节点往下还挂了[[hl_fake_series|第三条支路 $R_{\text{tap}}$]]！`,
            String.raw`[[hl_fake_parallel|**假并联（伪并联）**]]：两颗电阻 $R_3$、$R_4$ 在图纸上画成两根平行的竖线，像铁轨一样齐整，同学立刻说“它们并联！”——完全没注意它们上面的导线之间悄悄夹了一颗电阻 [[hl_fake_parallel|$R_{\text{sneak}}$]]！`,
          ],
        },
        { kind: 'p', text: '请记住 Boylestad 第 5 章和 Sadiku 第 2.3 节共同确立的**拓扑铁律——永远不要看几何形状，只看节点连接关系**：' },
        {
          kind: 'ul',
          items: [
            String.raw`[[hl_true_series|**真串联铁律**]]：两元件共享一个**独占节点**（节点度数 $\deg(N) = 2$，绝无第三条支路接入）$\iff$ 必流过**同一电流**。一旦中间接入第三条支路（$\deg(N) \ge 3$），就沦为**假串联**。`,
            String.raw`[[hl_true_parallel|**真并联铁律**]]：两元件的两端严格跨接在**同一对节点** $\{A, B\}$ 之间 $\iff$ 必承受**同一电压**。一旦两元件的顶轨或底轨之间被任何额外元件隔断，它们跨接的不再是同一对节点，就沦为**假并联**。`,
          ],
        },
        { kind: 'p', text: '**三段式严谨推导：节点度数与节点对如何锁定同流/同压**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: String.raw`依据电荷守恒（任意节点净流出电流为零）与电场保守性（两点间电位差与路径无关）：若节点 $N$ 仅连接元件 $E_1$ 与 $E_2$（$\deg(N)=2$），则无分流路径；若元件 $E_3$ 与 $E_4$ 的正负极分别接入同一对等电位节点 $A$ 与 $B$，则两者端电压均等于节点电位差 $V_A - V_B$。`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式 · 串联判定式：设流向共享节点 $N$ 的电流为 $I_1$，流出至 $E_2$ 的电流为 $I_2$，流出至第三支路（若有）的电流为 $I_{\text{tap}}$：`,
          tex: String.raw`I_1 = I_2 + I_{\text{tap}}`,
        },
        { kind: 'p', text: String.raw`当且仅当节点独占（无第三支路，$I_{\text{tap}} \equiv 0$）时，必有 $I_1 = I_2$（真串联）。` },
        {
          kind: 'formula',
          title: String.raw`并联判定式：设 $E_3$ 跨接节点 $(A, B)$，$E_4$ 跨接节点 $(A', B)$，中间夹塞元件压降为 $V_{\text{sneak}} = V_A - V_{A'}$：`,
          tex: String.raw`V_3 = V_A - V_B, \qquad V_4 = V_{A'} - V_B = V_3 - V_{\text{sneak}}`,
        },
        { kind: 'p', text: String.raw`当且仅当无夹塞元件（$A$ 与 $A'$ 为同一等电位节点，$V_{\text{sneak}} \equiv 0$）时，必有 $V_3 = V_4$（真并联）。` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A · 拆穿假串联',
              text: String.raw`设 $I_1 = 10\text{ mA}$ 进入 $R_1$ 与 $R_2$ 的共享节点，若中间挂接第三支路分走 $I_{\text{tap}} = 4\text{ mA}$，则流过 $R_2$ 的电流为：`,
              tex: String.raw`I_2 = I_1 - I_{\text{tap}} = 10\text{ mA} - 4\text{ mA} = 6\text{ mA} \neq 10\text{ mA}`,
            },
            { label: 'Step B', text: String.raw`因为 $I_1 \neq I_2$，即便 $R_1$ 与 $R_2$ 排成一条直线，也**不是串联**。` },
            {
              label: 'Step C · 拆穿假并联',
              text: String.raw`设 $V_A = 12\text{ V}$，$V_B = 0\text{ V}$，则 $R_3$ 端电压 $V_3 = 12\text{ V} - 0\text{ V} = 12\text{ V}$；若 $R_3$ 与 $R_4$ 顶部之间夹塞了一颗产生 $V_{\text{sneak}} = 3\text{ V}$ 压降的电阻，则 $V_{A'} = 12\text{ V} - 3\text{ V} = 9\text{ V}$，$R_4$ 端电压为：`,
              tex: String.raw`V_4 = V_{A'} - V_B = 9\text{ V} - 0\text{ V} = 9\text{ V} \neq 12\text{ V}`,
            },
            { label: 'Step D', text: String.raw`因为 $V_3 \neq V_4$，即便 $R_3$ 与 $R_4$ 画成平行竖线，也**不是并联**。` },
          ],
        },
        { kind: 'p', text: '现在切到左侧 02 串联 vs 并联拓扑判定台，拨动「插入/拔出“破坏者”支路」开关，再拖一拖元件，你会彻底告别视觉误判！' },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '拓扑照妖镜：拆穿“假串联”与“假并联”',
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '苏格拉底式分步引导例题（Sadiku Example 2.4 拓扑实战）',
      sync: { layer: L2, halo: ['hl_ex24_circuit'], params: { l2_preset: 3, l2_pick: [] } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`光听不练，上战场还是会手抖。下面这张 [[hl_ex24_circuit|5 元件实战电路图]] 改编自 Sadiku Ch. 2.3 的经典例题 **Example 2.4**：包含 1 个 $10\text{ V}$ 电压源 $V_s$ 与 4 颗电阻（$R_3 = 6\,\Omega$、$R_4 = 2\,\Omega$、$R_1 = 5\,\Omega$、$R_2 = 3\,\Omega$），我特意在顶部和底部保留了多个 T 字路口和 90° 拐角来考验你的“拓扑透视眼”。`,
        },
        { kind: 'p', text: '先看主图与三段式标准验算，再按下方 3 步苏格拉底引导逐关闯关！' },
        { kind: 'figure', svg: SVG_ACT5, caption: '实战例题 (Sadiku Ex 2.4 拓扑)：5 元件电路图' },
        { kind: 'p', text: '**三段式严谨推导：例题拓扑参数交叉验算**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: '依据 Sadiku Ch. 2.3 支路定义、等电位导线合并原则与基本网络拓扑定理：连通网络中每个二端元件贡献 1 条支路，每片零电阻连通导线区域坍缩为 1 个节点，独立回路数满足 $b = l + n - 1$。',
        },
        { kind: 'formula', title: '② 纯符号通式', tex: 'l = b - n + 1' },
        { kind: 'p', text: String.raw`其中串联判据为 $\deg(N_{\text{shared}}) = 2$，并联判据为 $\text{Nodes}(E_i) = \text{Nodes}(E_j)$。` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: 'Step A', text: String.raw`元件集合 $\{V_s, R_3, R_4, R_1, R_2\} \implies b = 5$；` },
            { label: 'Step B', text: String.raw`染色等电位区域 $\{a, b, c\} \implies n = 3$；` },
            { label: 'Step C', text: '独立回路数：', tex: 'l = b - n + 1 = 5 - 3 + 1 = 3' },
            { label: 'Step D', text: String.raw`节点拓扑判定：节点 $a$ 仅连 $R_1$ 与 $R_2$（$\deg(a) = 2$）$\implies$ **$R_1$ 与 $R_2$ 真串联**；` },
            { label: 'Step E', text: String.raw`$R_3$ 与 $R_4$ 均跨接在节点对 $\{b, c\}$ 之间 $\implies$ **$R_3$ 与 $R_4$ 真并联**（且与 $V_s$ 共并联于 $\{b, c\}$）。` },
          ],
        },
        {
          kind: 'guided',
          title: '苏格拉底拓扑透视实战（改编自 Sadiku Example 2.4）',
          source: 'Alexander & Sadiku, Fundamentals of Electric Circuits (2026), Ch. 2.3 Example 2.4',
          problem: '对上面的 5 元件电路图（左侧舞台预设 3 同步显示）：数出支路数 $b$、真实节点数 $n$，算出独立回路数 $l$，再判定哪两颗电阻真串联、哪两颗电阻真并联。',
          steps: [
            {
              title: '第一步：点清人头——数出支路数 b',
              mini_svg: MINI_STEP1,
              question: '先别管导线怎么拐弯。根据支路定义，图里一共有多少条支路 b？（元件包括 Vs=10V、R3=6Ω、R4=2Ω、R1=5Ω、R2=3Ω）',
              hint: '支路只认二端元件：把图里每一个有两只“脚”的元件挨个点名（电源也有两只脚），导线一律跳过。',
              options: [
                {
                  text: 'b = 4（只数 4 颗电阻，不算电源）',
                  correct: false,
                  feedback: '拦截！电压源 Vs 同样是一个二端元件，它既有端电压也有流过的电流，必须算作一条独立支路。再数一次全部二端元件！',
                },
                { text: 'b = 5（1 个电源 + 4 颗电阻，共 5 个二端元件）', correct: true, feedback: '漂亮！b = 5。记住：数支路就是数二端元件的总个数，不漏电源、不数纯导线。' },
                {
                  text: 'b = 7（把顶部和底部的几段水平导线也算作支路）',
                  correct: false,
                  feedback: '拦截！理想导线电阻为 0 Ω，不构成独立元件，因此纯导线不能算作支路。请只数元件实体（电源 + 电阻）。',
                },
              ],
              board: [String.raw`b = 5 \quad (V_s,\ R_3,\ R_4,\ R_1,\ R_2)`],
              halo: ['ex24_branches'],
              params: { l2_ex24_colored: false },
            },
            {
              title: '第二步：荧光笔染色——数出真实节点数 n',
              mini_svg: MINI_STEP2,
              question: '现在拿起等电位荧光笔：凡是没有被元件隔开的纯导线全部涂成同一种颜色。请问这张图一共需要几种颜色（即真实节点数 n）？',
              hint: '从任意一段导线出发顺着走，只要没撞上元件就一直用同一种颜色；一片涂满再换下一种颜色。T 字路口和拐角都不换色。',
              options: [
                { text: 'n = 3（顶轨左中段 b、右上独占角 a、整条底轨 c）', correct: true, feedback: '完全正确！n = 3。用荧光笔缩点后，整张图清爽得只剩 3 种颜色：a、b、c。' },
                {
                  text: 'n = 6（把上轨两个 T 字点、右上拐角和底轨三个点分开数）',
                  correct: false,
                  feedback: '拦截！你掉进了“T 字路口与拐角陷阱”。上轨 Vs(+)、R3 上端、R4 上端、R1 左端之间全是 0 Ω 纯导线，必须合并为 1 个节点 b；底轨同理合并为 1 个节点 c！',
                },
                {
                  text: 'n = 4（把底轨左半段和右半段拆成两个节点）',
                  correct: false,
                  feedback: '拦截！请沿着最底部那条绿色导线从 Vs(−) 一直走到 R2 下端——中间有撞到任何元件吗？没有！所以整条底轨都是同一个等电位节点 c。',
                },
              ],
              board: [String.raw`n = 3 \quad (a,\ b,\ c)`],
              halo: ['ex24_wires'],
              params: { l2_ex24_colored: false },
            },
            {
              title: '第三步：定理验算 l 并精准判定串并联',
              mini_svg: MINI_STEP3,
              question: '已知 b = 5、n = 3。请用基本拓扑定理算出独立回路数 l，并判断哪两颗电阻真并联、哪两颗电阻真串联？',
              hint: String.raw`先把 $b$、$n$ 代入 $l = b - n + 1$；再逐个看节点：哪个节点只接了两颗元件（$\deg = 2$）？哪两颗电阻的两端落在同一对节点上？左侧判定台可以点两颗元件试一试。`,
              options: [
                {
                  text: 'l = 3；R3 与 R4 并联，R1 与 R2 串联',
                  correct: true,
                  feedback: '满分通关！b = 5, n = 3, l = 3；R3(6Ω) ∥ R4(2Ω) 共跨节点对 {b, c}，R1(5Ω) 与 R2(3Ω) 共享独占节点 a 构成真串联。',
                },
                {
                  text: 'l = 3；R4 与 R1 串联，R3 与 R2 并联',
                  correct: false,
                  feedback:
                    '拦截！检查两个细节：① R4 和 R1 共享的是节点 b，但节点 b 还连着 Vs 和 R3（deg(b)=4），不是独占节点，所以 R4 与 R1 是假串联！② R3 跨接 {b, c}，而 R2 跨接 {a, c}，节点对不同，所以 R3 与 R2 是假并联！',
                },
                {
                  text: 'l = 2；只有 R3 与 R4 并联，没有串联电阻',
                  correct: false,
                  feedback: '拦截！代入公式 l = b − n + 1 = 5 − 3 + 1 = 3，共有 3 个独立网孔；并且右上角节点 a 只连接 R1 和 R2（deg(a)=2），所以 R1 与 R2 严格串联！',
                },
              ],
              board: [String.raw`l = b - n + 1 = 5 - 3 + 1 = 3`, String.raw`R_3 \parallel R_4:\ \text{Nodes} = \{b, c\}`, String.raw`R_1,\ R_2\ \text{串联}:\ \deg(a) = 2`],
              halo: ['hl_ex24_circuit'],
              params: { l2_ex24_colored: true },
            },
          ],
          conclusion: '满分通关！b = 5, n = 3, l = 3；R3(6Ω) ∥ R4(2Ω) 共跨节点对 {b, c}，R1(5Ω) 与 R2(3Ω) 共享独占节点 a 构成真串联。',
        },
      ],
    },

    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '随堂自测与下节预告（W1-L5 基尔霍夫电流定律 KCL）',
      sync: { layer: L1, halo: ['hl_topo_tree'], params: { l1_bb: false, l1_straight: true } },
      blocks: [
        { kind: 'p', text: '走到这一步，你已经把电路分析最核心的“透视眼镜”戴稳了。每次拿到一张新电路图或一块插满线的面包板，按这套三步法扫一遍：' },
        {
          kind: 'ul',
          items: [
            '[[hl_branch_def|**点元件定 $b$**]]（所有二端元件，含电源，不数纯导线）；',
            '[[hl_node_collapse|**涂色缩点定 $n$**]]（遇导线一路涂到底，[[hl_bb_5hole|面包板同列 5 孔即 1 点]]）；',
            '[[hl_topo_tree|**算 $l = b - n + 1$**]]**，查度数与节点对定串并联**（独占 2 度点＝真串联，同一节点对＝真并联）。',
          ],
        },
        { kind: 'p', text: '**下节预告：W1-L5 基尔霍夫电流定律（KCL）——节点的流量守恒账本**' },
        {
          kind: 'p',
          text: String.raw`为什么我们今天花整整一节课死磕“把节点数准”？因为下节课 **W1-L5（基尔霍夫电流定律 KCL）** 的第一句话就是：**对任意一个真实节点，流入电流之和等于流出电流之和（$\sum I_{\text{in}} = \sum I_{\text{out}}$）**。`,
        },
        {
          kind: 'p',
          text: '如果今天没学会把整片等电位导线合并成 1 个节点，下节课你就会在同一个节点上漏算支路电流；而当你拥有了今天的拓扑透视眼，下节课看任何一个节点，都能一眼看清哪几条支路的电流汇入、哪几条支路的电流分出。下节课，我们把电荷守恒写成电路分析的第一把计算利刃，不见不散！',
        },
        { kind: 'figure', svg: SVG_ACT6, caption: '下节预告 W1-L5 (KCL)：把今日的“真实节点”变成明日的“电流账本”' },
        { kind: 'p', text: '先把下面 2 道随堂自测题拿下，检验今天的透视功力！' },
      ],
      quiz: [
        {
          id: 'w1l4_q1',
          question:
            '某同学在面包板上搭了一个包含 6 个二端元件的连通电路，所有元件引脚恰好分布并插接在 4 条互不相连的面包板 5 孔竖列上（未跨接任何额外跳线）。请问该电路的真实节点数 n 与独立回路数 l 分别是多少？',
          options: [
            { key: 'A', text: 'n = 20，l = 15', correct: false, feedback: '把每个孔都当成了节点。同一竖列的 5 个孔底下是同一条簧片——回到第 2 幕再看一眼。' },
            { key: 'B', text: 'n = 4，l = 3', correct: true },
            { key: 'C', text: 'n = 4，l = 2', correct: false, feedback: 'n 数对了。再把 b = 6、n = 4 代入 $l = b - n + 1$ 仔细算一遍。' },
            { key: 'D', text: 'n = 6，l = 1', correct: false, feedback: '这是把元件个数当成了节点数。节点要数的是互不相连的竖列，元件个数是支路数 b。' },
          ],
          feedback_correct:
            '每条面包板 5 孔竖列底层由同一条金属簧片短接，因此 4 条互不相连的竖列严格对应 n = 4 个真实节点（不是 4×5=20）。已知支路数 b = 6，代入基本拓扑定理 l = b − n + 1 = 6 − 4 + 1 = 3。',
          feedback_wrong: '再想一想：一条 5 孔竖列是几个节点？然后把 b、n 代入 l = b − n + 1。',
          figure: SVG_Q1,
          sync: { layer: L1, halo: ['hl_bb_5hole'], params: { l1_bb: true } },
        },
        {
          id: 'w1l4_q2',
          question:
            '在某电路中，电阻 Ra 跨接在节点 X 与 Y 之间，电阻 Rb 跨接在节点 Y 与 Z 之间，电阻 Rc 也跨接在节点 X 与 Y 之间；已知节点 Y 仅连接了 Ra、Rb 和 Rc 三颗电阻（无其他支路）。下列说法正确的是？',
          options: [
            { key: 'A', text: 'Ra 与 Rb 串联，因为它们共享节点 Y', correct: false, feedback: '只共享一个节点还不够：节点 Y 还连着第三颗电阻 Rc，deg(Y) = 3 ≠ 2，不是独占节点。' },
            { key: 'B', text: 'Ra 与 Rc 并联，且 Ra 与 Rb 不是串联', correct: true },
            { key: 'C', text: 'Rb 与 Rc 并联，因为它们都连着节点 Y', correct: false, feedback: 'Rb 跨接 {Y, Z}，Rc 跨接 {X, Y}——节点对不同。只共享一个节点不算并联。' },
            { key: 'D', text: '三颗电阻两两既不串联也不并联', correct: false, feedback: '再看 Ra 与 Rc：它们的两端各自落在哪一对节点上？' },
          ],
          feedback_correct:
            '① Ra 与 Rc 的两端均严格跨接在同一对节点 {X, Y} 之间，满足真并联判定法（同电压）；② 节点 Y 连接了 Ra、Rb、Rc 三条支路，节点度数 deg(Y) = 3 ≠ 2，不是独占节点，因此 Ra 与 Rb 属于假串联。',
          feedback_wrong: '逐对检查：两元件是否共享同一对节点（并联）？共享的单个节点是否只连这两颗元件（串联）？',
          figure: SVG_Q2,
          sync: { layer: L2, halo: [], params: { l2_preset: 1, l2_sabotage: false, l2_pick: [] } },
        },
      ],
    },
  ],
};

export default W1_L4;
