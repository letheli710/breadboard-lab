// W1-L7 · 串联分压、并联分流与 3D 面包板实测 (lesson sheet: docs/lessons/W1-L7.md).
// The professor's text of the eight acts is reproduced from the sheet as written; [[id|…]] only
// links a term to the stage (the words are unchanged). Formatting changes only: the sheet's display
// formulas sit in the ①/②/③ cards (a lead-in sentence becomes the card title, two formulas of one
// line may share one card), plain-text symbols in the JSON parts (R_eq, i_o, v_out, 10^3 Ω …) are
// set as TeX, and TeX lost in the Google-Docs export is restored (25% → 25\%, 3.2% → 3.2\%,
// 3.6% → 3.6\% inside math). Act titles are plain text on the page, so act 6's title spells R_eq.
// Added: the sheet's breadboard_safety_and_scaling block and its hole-by-hole wiring tables
// (left_stage_spec 2.2) as tables in act 5; hints and blackboard lines of the guided example; the
// quiz's wrong-answer hints and two quiz diagrams; a fifth stage topology (three branches) so
// act 7 has its circuit on the stage. Corrections are listed in the lesson commit message.

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import type { StageLesson, StageSync } from '../../types';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6, SVG_ACT7, SVG_ACT8 } from './svgs';

const Schematic = lazy(() => import('./Schematic'));
const Curves = lazy(() => import('./Curves'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;

/** stage circuit of an act (every act sets all of it, so scrolling back restores the act's circuit) */
const circuit = (p: Partial<{ topo: string; vs: number; r1: number; r2: number; rl: number; r3: number; scale: string; meter: string }> = {}): StageSync['params'] => ({
  topo: 'series_vdiv',
  vs: 9,
  r1: 2,
  r2: 4,
  rl: 4,
  r3: 3,
  scale: 'board',
  meter: 'V',
  ...p,
});

const MIXED = circuit({ topo: 'mixed_socratic', r1: 1, r2: 6, r3: 3 });

/* ------------------------------------------------------------- quiz diagrams (added) */

const SVG_Q1 = `<svg viewBox="0 0 420 150" aria-label="分压器 R1 = 3 kΩ、R2 = 6 kΩ，RL = 6 kΩ 并在 R2 两端">
  <rect x="1" y="1" width="418" height="148" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <circle cx="56" cy="80" r="18" fill="#fff" stroke="#dc2626" stroke-width="2"/>
  <text x="56" y="76" fill="#dc2626" font-size="11" text-anchor="middle" font-weight="bold">+</text>
  <text x="56" y="92" fill="#64748b" font-size="11" text-anchor="middle">−</text>
  <text x="30" y="84" fill="#dc2626" font-size="11" text-anchor="end" font-weight="bold">9 V</text>
  <polyline points="56,62 56,34 110,34" fill="none" stroke="#dc2626" stroke-width="2"/>
  <polyline points="110,34 116,26 124,42 132,26 140,42 148,26 156,42 162,34" fill="none" stroke="#0284c7" stroke-width="2"/>
  <text x="136" y="18" fill="#334155" font-size="11" text-anchor="middle">R1 = 3 kΩ</text>
  <line x1="162" y1="34" x2="330" y2="34" stroke="#b45309" stroke-width="2"/>
  <circle cx="230" cy="34" r="4" fill="#b45309"/>
  <text x="230" y="24" fill="#b45309" font-size="11" text-anchor="middle" font-weight="bold">v_out = ?</text>
  <line x1="230" y1="34" x2="230" y2="54" stroke="#334155" stroke-width="1.8"/>
  <polyline points="230,54 222,60 238,68 222,76 238,84 222,92 238,100 230,106" fill="none" stroke="#0284c7" stroke-width="2"/>
  <text x="246" y="84" fill="#334155" font-size="11">R2 = 6 kΩ</text>
  <line x1="230" y1="106" x2="230" y2="128" stroke="#2563eb" stroke-width="1.8"/>
  <line x1="330" y1="34" x2="330" y2="54" stroke="#334155" stroke-width="1.8" stroke-dasharray="4,3"/>
  <polyline points="330,54 322,60 338,68 322,76 338,84 322,92 338,100 330,106" fill="none" stroke="#db2777" stroke-width="2"/>
  <text x="346" y="84" fill="#db2777" font-size="11" font-weight="bold">RL = 6 kΩ</text>
  <line x1="330" y1="106" x2="330" y2="128" stroke="#2563eb" stroke-width="1.8" stroke-dasharray="4,3"/>
  <polyline points="330,128 56,128 56,98" fill="none" stroke="#2563eb" stroke-width="2"/>
  <text x="140" y="144" fill="#475569" font-size="10" text-anchor="middle">虚线：新并上的负载 RL</text>
</svg>`;

const SVG_Q2 = `<svg viewBox="0 0 420 140" aria-label="并联节点流入 10 mA，支路 R1 = 2 kΩ 与 R2 = 8 kΩ">
  <rect x="1" y="1" width="418" height="138" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <line x1="40" y1="36" x2="330" y2="36" stroke="#dc2626" stroke-width="2"/>
  <polygon points="92,36 82,31 82,41" fill="#059669"/>
  <text x="80" y="24" fill="#059669" font-size="11" text-anchor="middle" font-weight="bold">i = 10 mA</text>
  <circle cx="170" cy="36" r="4" fill="#b45309"/>
  <line x1="170" y1="36" x2="170" y2="56" stroke="#334155" stroke-width="1.8"/>
  <polyline points="170,56 162,62 178,70 162,78 178,86 162,94 178,102 170,108" fill="none" stroke="#0284c7" stroke-width="2"/>
  <text x="186" y="80" fill="#334155" font-size="11">R1 = 2 kΩ</text>
  <text x="186" y="96" fill="#b45309" font-size="11" font-weight="bold">i1 = ?</text>
  <line x1="170" y1="108" x2="170" y2="122" stroke="#2563eb" stroke-width="1.8"/>
  <line x1="330" y1="36" x2="330" y2="56" stroke="#334155" stroke-width="1.8"/>
  <polyline points="330,56 322,62 338,70 322,78 338,86 322,94 338,102 330,108" fill="none" stroke="#7c3aed" stroke-width="2"/>
  <text x="346" y="80" fill="#334155" font-size="11">R2 = 8 kΩ</text>
  <line x1="330" y1="108" x2="330" y2="122" stroke="#2563eb" stroke-width="1.8"/>
  <line x1="40" y1="122" x2="330" y2="122" stroke="#2563eb" stroke-width="2"/>
</svg>`;

/* ------------------------------------------------------------- the lesson */

const W1_L7: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { schematic: Schematic, curves: Curves, bench3d: Bench3D },
  describeTarget: (id) => (id === 'col_strip_a10' ? { label: '第 10 列 a–e', desc: '这 5 个孔底下是同一块铜片：纵向连通，是同一个节点' } : genericLabel(id)),
  lesson_meta: {
    lesson_id: 'W1-L7',
    world: 'World 1 · 电学公理与基本定律',
    title: '串联分压、并联分流与 3D 面包板实测',
    subtitle: 'Series Voltage Division, Parallel Current Division & 9V Breadboard Lab',
    lesson_type: 'C',
    lesson_type_label: 'Type C (经典电路拓扑 + 3D 面包板实测课)',
    estimated_minutes: 35,
    textbook_primary: {
      book: 'Alexander & Sadiku, Fundamentals of Electric Circuits, 2026 Release',
      sections: ['Ch. 2.5 (Series Resistors and Voltage Division)', 'Ch. 2.6 (Parallel Resistors and Current Division)'],
    },
    textbook_supplement:
      'Robert L. Boylestad, Introductory Circuit Analysis (14th Ed.) · Ch. 5 (Series dc Circuits — Voltage Divider Rule), Ch. 6 (Parallel dc Circuits — Current Divider Rule)',
    prerequisites: ['W1-L4: 欧姆定律与功率耗散 (P = I² R = V² / R)', 'W1-L5: 节点、支路与回路拓扑识别', 'W1-L6: 基尔霍夫电压定律 (KVL) 与电流定律 (KCL)'],
    next_lesson: 'W1-L8',
    next_lesson_title: 'Y–Δ（星-三角）等效变换与惠斯通电桥化简',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: 'schematic',
        label: '01 动态原理图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '01 2D 动态分压/分流原理图：实时呈现拓扑、节点电位、支路电流箭头与动态公式代入：拖动滑块，看节点颜色、电流粒子和每颗电阻旁的数值一起变。',
      },
      {
        id: 'curves',
        label: '02 比例/负载曲线',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '02 比例权重与负载效应曲线：实时绘制分压比/分流比随阻值变化的非线性曲线与负载塌陷轨迹：工作点跟着 R1、R2、RL 滑块走。',
      },
      {
        id: 'bench3d',
        label: '03 3D 面包板实测',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption: '03 3D 面包板 9V 实测接线台：单 9V 电源供电的 MB-102 面包板：按接线表逐孔插好的色环电阻、跳线与万用表表笔，读数与功耗实时计算。',
      },
    ],
    hover_map: {
      tok_vs: { label: '9V 输入电源 Vs', desc: '单 9 V 直流电源（滑块 1–12 V），接面包板顶部 Rail(+) / Rail(−) 第 2 列' },
      tok_r1: { label: '电阻 R1', desc: '串联时插 e5–e12，并联时插 e8–f8；面包板值 2 kΩ = 红-黑-红-金' },
      tok_r2: { label: '电阻 R2', desc: '串联时插 d12–d19，并联时插 e10–f10；面包板值 4 kΩ = 黄-黑-红-金' },
      tok_node_mid: { label: '中间分压节点 v_mid', desc: 'R1 与 R2 的公共节点：面包板第 12 列 a–e 竖条（并联时为 Node A：第 8、10 列）' },
      tok_v2: { label: '分压输出 v2', desc: 'R2 两端电压：万用表 DC V 档红笔 b12、黑笔 b19，默认读 6.00 V' },
      tok_i1: { label: '并联支路电流 i1', desc: '流过 R1 的支路电流：DC mA 档串入 j8 → Rail(−)，默认读 4.50 mA' },
      tok_rl: { label: '负载电阻 RL', desc: '并在 R2 两端的负载（面包板 c12–c19），把下臂变成 R2 || RL' },
      tok_safety_scale: { label: '安全缩放警报', desc: '1/4 W 电阻：超过 125 mW 橙色预警，超过 250 mW 冒烟；教材 Ω 级阻值 ×1000 上板，比例不变' },
      tok_r3: { label: '电阻 R3', desc: '混联例题中与 R2 并联的支路（面包板 c12–c25）；三支路并联时的第 3 条支路' },
      tok_i: { label: '干路总电流 i', desc: '电源送出的总电流 i = Vs / R_eq' },
      tok_io: { label: '支路电流 i_o', desc: '混联例题中流过 R3 的电流：DC mA 档串入 a25 → Rail(−)' },
      tok_i2: { label: '支路电流 i2', desc: '流过 R2 的支路电流' },
      tok_v1: { label: 'R1 两端电压 v1', desc: 'v1 = i · R1' },
      rail_pos: { label: '红色 + 电源轨 Rail(+)', desc: '顶部整排横向连通，接 9 V 正极' },
      rail_neg: { label: '蓝色 − 地线轨 Rail(−)', desc: '顶部整排横向连通，接电源负极（GND）' },
      center_trench: { label: '中央绝缘凹槽', desc: 'e 与 f 之间完全绝缘；并联实测时 R1、R2 跨凹槽插在 e–f 之间' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '开篇悬念 — 手头只有一颗 9 V 电池，怎么“切”出精准的 6 V 和 3 V？',
      sync: { layer: 'schematic', halo: ['tok_vs', 'tok_r1', 'tok_r2'], params: circuit() },
      blocks: [
        {
          kind: 'p',
          text: '同学们好！上一讲我们刚把基尔霍夫电压定律（KVL）、电流定律（KCL）和欧姆定律这“电路三板斧”练熟。今天这节课，我们要把这三把斧头锻造成电路设计中最常用、也最容易踩坑的两个工程利器：**串联分压器（Voltage Divider）与并联分流器（Current Divider）**。',
        },
        {
          kind: 'p',
          text: '先看一个你在实验室第一周就会撞上的真实场景：你的实验箱里只有一颗 [[tok_vs|**9 V 直流电池**]]，但你手上的传感器参考电压需要 [[tok_v2|**6.0 V**]]，或者你需要把一路总电流按 **2 : 1** 的精确比例分配给两条不同阻值的支路。你手边没有昂贵的稳压芯片，只有一把碳膜电阻。怎么办？',
        },
        { kind: 'p', text: '答案非常优雅：' },
        {
          kind: 'ul',
          items: [
            R`**想“切”电压** $\rightarrow$ 把两个电阻 **串联** 起来，让它们按阻值比例分担 9 V；`,
            R`**想“切”电流** $\rightarrow$ 把两个电阻 **并联** 起来，让总电流按“阻力越小分得越多”的规律自动分流。`,
          ],
        },
        {
          kind: 'p',
          text: R`**先看一眼左侧的三层舞台**：你可以在 01 2D 动态原理图 里拖动滑块改变 [[tok_r1|$R_1$]] 和 [[tok_r2|$R_2$]]，观察 02 比例权重曲线 的实时移动，同时 03 3D 面包板 上的真实色环电阻和万用表读数会同步跳动。不过在正式通电之前，后面第 5 幕我还要告诉你一个[[tok_safety_scale|**保命秘诀**]]：为什么教材例题里写的 $2\ \Omega$ 和 $4\ \Omega$，到了 9 V 面包板上必须乘以 $1000$ 变成 $2\text{ k}\Omega$ 和 $4\text{ k}\Omega$？卖个关子，咱们先从最严谨的公理推导开始！`,
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '图 1-1：一节 9V 电池的两大核心分配任务',
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '串联等效电阻与分压公式 — 为什么“分压看自己”？',
      sync: { layer: 'schematic', halo: ['tok_r1', 'tok_r2', 'tok_v2'], params: circuit() },
      blocks: [
        {
          kind: 'p',
          text: R`在 Alexander & Sadiku 第 2.5 节中，串联（Series）有一个极其严格的拓扑定义：**两个元件首尾相连，且公共节点上没有任何第三条支路分流**。因此，流过 [[tok_r1|$R_1$]] 和 [[tok_r2|$R_2$]] 的电流必然完全相等，记为同一个电流 [[tok_i|$i$]]。`,
        },
        {
          kind: 'p',
          text: R`下面我们用最严谨的三段式推导，把串联等效电阻和分压公式从基尔霍夫公理里“推”出来（以单 9 V 电源、安全缩放后的 $R_1 = 2\text{ k}\Omega$、$R_2 = 4\text{ k}\Omega$ 为例）：`,
        },
        {
          kind: 'origin',
          title: '推导 2.1：串联等效电阻与分压公式 · ① 公理溯源（KVL + 欧姆定律）',
          text: R`沿单一闭合回路顺时针列写 KVL 方程，并结合各电阻的欧姆定律本构关系：$-v + v_1 + v_2 = 0 \implies v = v_1 + v_2, \qquad v_1 = i R_1, \qquad v_2 = i R_2$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（消去电流 $i$，导出 $R_{\text{eq}}$ 与分压公式）：将欧姆定律代入 KVL 方程，提取公共电流 $i$`,
          tex: R`v = i R_1 + i R_2 = i(R_1 + R_2) \implies R_{\text{eq}} = \frac{v}{i} = R_1 + R_2`,
        },
        {
          kind: 'formula',
          title: R`由此解得回路电流 $i = \dfrac{v}{R_1 + R_2}$。再代回各电阻的欧姆定律，即得**两电阻分压公式**：`,
          tex: R`v_1 = i R_1 = \frac{R_1}{R_1 + R_2} v, \qquad v_2 = i R_2 = \frac{R_2}{R_1 + R_2} v`,
        },
        {
          kind: 'formula',
          title: R`推广至 $N$ 个电阻串联，任意第 $n$ 个电阻上的电压为：`,
          tex: R`v_n = \frac{R_n}{R_1 + R_2 + \cdots + R_N} v = \frac{R_n}{R_{\text{eq}}} v`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（$v = V_s = 9\text{ V},\ R_1 = 2\text{ k}\Omega,\ R_2 = 4\text{ k}\Omega$）`,
          steps: [
            { label: 'Step A', tex: R`R_{\text{eq}} = 2\text{ k}\Omega + 4\text{ k}\Omega = 6\text{ k}\Omega` },
            { label: 'Step B', tex: R`i = \frac{9\text{ V}}{6\text{ k}\Omega} = 1.5\text{ mA}` },
            { label: 'Step C', tex: R`v_1 = \frac{2\text{ k}\Omega}{2\text{ k}\Omega + 4\text{ k}\Omega} \times 9\text{ V} = \frac{2}{6} \times 9\text{ V} = 3.00\text{ V}` },
            { label: 'Step D', tex: R`v_2 = \frac{4\text{ k}\Omega}{2\text{ k}\Omega + 4\text{ k}\Omega} \times 9\text{ V} = \frac{4}{6} \times 9\text{ V} = 6.00\text{ V}` },
            { label: '检验 KVL', text: R`$v_1 + v_2 = 3.00\text{ V} + 6.00\text{ V} = 9.00\text{ V} = V_s$，严丝合缝！` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授划重点（物理直觉）—— “分压看自己”** 为什么求 [[tok_v2|$v_2$]] 时分子放的是**它自己的阻值 [[tok_r2|$R_2$]]**？想象水流过两段串联的狭窄管道，流量（电流 $i$）被迫完全相同。谁的管子越细、阻力（$R_n$）越大，推动水流通过它所消耗的水压（电压 $v_n = i R_n$）就越高！所以：**串联电路中，电阻越大，分得的电压越大；公式分子写自己的阻值。**`,
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '图 2-1：串联分压回路（KVL: Vs = v1 + v2）',
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '并联等效电阻与分流公式 — 为什么“分流看对方”？',
      sync: { layer: 'schematic', halo: ['tok_i1', 'tok_r2'], params: circuit({ topo: 'parallel_cdiv' }) },
      blocks: [
        {
          kind: 'p',
          text: R`现在我们把左侧舞台切换到 并联分流 (R1 || R2) 模式。按照 Alexander & Sadiku 第 2.6 节的定义，**两个电阻并联，意味着它们的两端分别连接在同一对节点上**，因此两个电阻两端的电压必然完全相同，记为同一个电压 $v$。`,
        },
        { kind: 'p', text: '这一次，主导规律不再是 KVL，而是上节点处的 **KCL（基尔霍夫电流定律）**。让我们依然严格走完三段式推导：' },
        {
          kind: 'origin',
          title: '推导 3.1：并联等效电阻与分流公式 · ① 公理溯源（KCL + 欧姆定律）',
          text: R`在并联上节点列写 KCL 方程，并用欧姆定律将各支路电流写成电压与电阻之比：$i = i_1 + i_2, \qquad i_1 = \dfrac{v}{R_1}, \qquad i_2 = \dfrac{v}{R_2}$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（导出 $R_{\text{eq}}$ 与两支路分流公式）：将支路电流代入 KCL，提取公共电压 $v$`,
          tex: R`i = v\left(\frac{1}{R_1} + \frac{1}{R_2}\right) = \frac{v}{R_{\text{eq}}} \implies \frac{1}{R_{\text{eq}}} = \frac{1}{R_1} + \frac{1}{R_2}`,
        },
        {
          kind: 'formula',
          title: '通分取倒数，得到两电阻并联的经典**“积除以和”**公式：',
          tex: R`R_{\text{eq}} = R_1 \parallel R_2 = \frac{R_1 R_2}{R_1 + R_2}`,
        },
        {
          kind: 'formula',
          title: R`由此反解公共节点电压 $v = i R_{\text{eq}} = i \dfrac{R_1 R_2}{R_1 + R_2}$。代回支路欧姆定律 $i_1 = \dfrac{v}{R_1}$ 与 $i_2 = \dfrac{v}{R_2}$，约去 $R_1$ 或 $R_2$，立刻得出**两支路分流公式（Current Divider Rule）**：`,
          tex: R`\begin{aligned} i_1 &= \frac{v}{R_1} = \frac{1}{R_1} \cdot \left(i \frac{R_1 R_2}{R_1 + R_2}\right) = \frac{R_2}{R_1 + R_2} i \\ i_2 &= \frac{v}{R_2} = \frac{1}{R_2} \cdot \left(i \frac{R_1 R_2}{R_1 + R_2}\right) = \frac{R_1}{R_1 + R_2} i \end{aligned}`,
        },
        {
          kind: 'p',
          text: R`(若用**电导** $G_k = 1/R_k$ 表达，则 $N$ 条并联支路具有与分压完全对偶的优美通式：$i_n = \dfrac{G_n}{G_1 + G_2 + \cdots + G_N} i$。)`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（$V_s = 9\text{ V}$ 供电，$R_1 = 2\text{ k}\Omega,\ R_2 = 4\text{ k}\Omega$）`,
          steps: [
            {
              label: 'Step A',
              tex: R`R_{\text{eq}} = \frac{2\text{ k}\Omega \times 4\text{ k}\Omega}{2\text{ k}\Omega + 4\text{ k}\Omega} = \frac{8}{6}\text{ k}\Omega = \frac{4}{3}\text{ k}\Omega \approx 1.333\text{ k}\Omega`,
            },
            { label: 'Step B', text: '总干路电流为：', tex: R`i = \frac{9\text{ V}}{(4/3)\text{ k}\Omega} = 6.75\text{ mA}` },
            {
              label: 'Step C',
              text: R`用分流公式求 支路 1 电流 [[tok_i1|$i_1$]] 与支路 2 电流 [[tok_i2|$i_2$]]：`,
              tex: R`i_1 = \frac{R_2}{R_1 + R_2} i = \frac{4\text{ k}\Omega}{2\text{ k}\Omega + 4\text{ k}\Omega} \times 6.75\text{ mA} = \frac{4}{6} \times 6.75\text{ mA} = 4.50\text{ mA}`,
            },
            {
              label: 'Step D',
              tex: R`i_2 = \frac{R_1}{R_1 + R_2} i = \frac{2\text{ k}\Omega}{2\text{ k}\Omega + 4\text{ k}\Omega} \times 6.75\text{ mA} = \frac{2}{6} \times 6.75\text{ mA} = 2.25\text{ mA}`,
            },
            {
              label: '检验 KCL',
              text: R`$i_1 + i_2 = 4.50\text{ mA} + 2.25\text{ mA} = 6.75\text{ mA} = i$，且独立验算 $9\text{ V}/2\text{ k}\Omega = 4.50\text{ mA}$，完全吻合！`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**全课最重要口诀 —— “分压看自己，分流看对方”** 很多同学一到考试就把分流公式的分子写反。请你用物理直觉把它锁死在脑子里： 电流是极其“懒惰”的，它永远偏爱阻力小的路径。在两条并联支路中，如果你想知道流进 [[tok_r1|$R_1$]] 的电流 [[tok_i1|$i_1$]] 有多大，关键看**对面那条路 [[tok_r2|$R_2$]] 有多堵**！对面 $R_2$ 越堵（阻值越大），电流就被逼着往你这边 $R_1$ 钻得越多。`,
        },
        {
          kind: 'ul',
          items: [
            R`极限检验 1：如果对面 $R_2 \to \infty$（开路，彻底堵死），则 $i_1 = \frac{\infty}{R_1+\infty} i = i$，电流全走你这边；`,
            R`极限检验 2：如果对面 $R_2 \to 0$（短路，畅通无阻），则 $i_1 = \frac{0}{R_1+0} i = 0$，电流全被对面抢走！`,
          ],
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '图 3-1：并联分流网络（KCL: i = i1 + i2，分流看对方）',
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '负载效应（Loading Effect）与比例权重曲线 — 为什么接上负载后电压“掉链子”？',
      sync: { layer: 'curves', halo: ['tok_rl', 'tok_node_mid'], params: circuit({ topo: 'loaded_vdiv' }) },
      blocks: [
        {
          kind: 'p',
          text: R`很多新手第一次在面包板上搭出 6.00 V 分压器后，得意洋洋地把一个 [[tok_rl|负载电阻 $R_L = 4\text{ k}\Omega$]]（比如一个待测模块）并联接到 [[tok_r2|$R_2$]] 两端，拿万用表一测——傻眼了：电压怎么从 **6.00 V 暴跌到了 4.50 V**？`,
        },
        {
          kind: 'p',
          text: R`这就是工程上赫赫有名的**负载效应（Loading Effect）**。一旦你在[[tok_node_mid|分压节点]]接出负载 $R_L$，公共节点就多了一条分流支路，$R_1$ 和 $R_2$ **不再是单纯串联**，而是变成 **$R_1$ 与 $(R_2 \parallel R_L)$ 串联**！`,
        },
        { kind: 'p', text: '请结合左侧 02 比例权重与负载效应曲线，看我们的三段式推导：' },
        {
          kind: 'origin',
          title: '推导 4.1：带载分压器的输出电压塌陷公式 · ① 公理溯源（并联等效 + 串联分压）',
          text: R`负载 $R_L$ 与下臂电阻 $R_2$ 共享分压节点与地节点，构成并联支路 $R_{2L} = R_2 \parallel R_L$；该等效块再与 $R_1$ 串联分压：$R_{2L} = \dfrac{R_2 R_L}{R_2 + R_L}, \qquad v_{\text{out}} = \dfrac{R_{2L}}{R_1 + R_{2L}} V_s$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（引入负载比 $\alpha = R_L / R_2$）：将 $R_{2L} = \dfrac{\alpha}{1 + \alpha} R_2$ 代入分压公式，化简得`,
          tex: R`v_{\text{out}} = \frac{R_2 \parallel R_L}{R_1 + (R_2 \parallel R_L)} V_s = \frac{R_2}{R_1 \left(1 + \dfrac{R_2}{R_L}\right) + R_2} V_s`,
        },
        { kind: 'p', text: R`显然，由于 $R_2 \parallel R_L < R_2$，带载输出电压 $v_{\text{out}}$ 必然**严格低于**空载电压 $v_{2,\text{空载}}$。` },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（$V_s = 9\text{ V},\ R_1 = 2\text{ k}\Omega,\ R_2 = 4\text{ k}\Omega$）`,
          steps: [
            {
              label: '情形 A',
              text: R`**重负载 $R_L = 4\text{ k}\Omega$（$\alpha = 1$）**`,
              tex: R`\begin{gathered} R_{2L} = \frac{4\text{ k}\Omega \times 4\text{ k}\Omega}{4\text{ k}\Omega + 4\text{ k}\Omega} = 2\text{ k}\Omega \\ v_{\text{out}} = \frac{2\text{ k}\Omega}{2\text{ k}\Omega + 2\text{ k}\Omega} \times 9\text{ V} = 4.50\text{ V} \quad (\text{压降损失高达 } 25\%!) \end{gathered}`,
            },
            {
              label: '情形 B',
              text: R`**轻负载 $R_L = 40\text{ k}\Omega$（满足工程“十倍硬分压准则” $R_L \ge 10 R_2$）**`,
              tex: R`\begin{gathered} R_{2L} = \frac{4\text{ k}\Omega \times 40\text{ k}\Omega}{4\text{ k}\Omega + 40\text{ k}\Omega} = \frac{160}{44}\text{ k}\Omega \approx 3.636\text{ k}\Omega \\ v_{\text{out}} = \frac{3.636\text{ k}\Omega}{2\text{ k}\Omega + 3.636\text{ k}\Omega} \times 9\text{ V} \approx 5.81\text{ V} \quad (\text{误差仅 } 3.2\%) \end{gathered}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**工程黄金法则**：如果你希望用纯电阻分压器给下一级提供较稳定的参考电压，务必满足 **$R_L \ge 10 R_2$**（更严格时取 $100 R_2$）。在左侧 [[tok_rl|02 负载效应曲线]] 上，你会直观看到曲线在 $R_L / R_2 = 10$ 之后才逐渐趋平并逼近 6.00 V 虚线！`,
        },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '图 4-1：带载分压器（RL 并联拉低 R2 等效阻值）',
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '3D 面包板 9V 实测与“1000× 阻值安全缩放法则” — 保护你的实验箱不冒烟！',
      sync: { layer: 'bench3d', halo: ['tok_v2', 'tok_safety_scale'], params: circuit() },
      blocks: [
        {
          kind: 'p',
          text: R`现在揭晓第 1 幕留下的悬念！翻开 Alexander & Sadiku 或 Boylestad 的纸面习题，你会频繁看到 $R_1 = 2\ \Omega$、$R_2 = 4\ \Omega$ 这样的小整数。**千万别照着纸面阻值直接往 9 V 面包板上插！**`,
        },
        { kind: 'p', text: '让我们用功率公式做一次严格的 [[tok_safety_scale|三段式安全校验]]：' },
        {
          kind: 'origin',
          title: R`推导 5.1：教材原值 vs. $1000\times$ 缩放后的功耗与比例不变性证明 · ① 公理溯源（分压/分流齐次性 + 焦耳功耗定律）`,
          text: R`若将电路中所有电阻同时乘以正比例因子 $k > 0$（即 $R_n' = k R_n$），则电阻功耗遵循：$P_n = i^2 R_n = \dfrac{v_n^2}{R_n}$ 实验室常用四环碳膜电阻额定功率为 $P_{\max} = \dfrac{1}{4}\text{ W} = 250\text{ mW}$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（证明缩放因子 $k$ 在比例中完全约去，功耗缩小 $k$ 倍）`,
          tex: R`\begin{gathered} v_n' = \frac{k R_n}{k R_1 + k R_2} V_s = \frac{R_n}{R_1 + R_2} V_s = v_n \quad (\text{分压比完全不变}) \\ i_1' = \frac{k R_2}{k R_1 + k R_2} i' = \frac{R_2}{R_1 + R_2} i' \quad (\text{分流比完全不变}) \\ i' = \frac{V_s}{k R_{\text{eq}}} = \frac{i}{k}, \qquad P_n' = \frac{v_n^2}{k R_n} = \frac{P_n}{k} \quad (\text{电流与功耗同缩 } k \text{ 倍！}) \end{gathered}`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（$V_s = 9\text{ V},\ k = 1000$）`,
          steps: [
            {
              label: '未缩放',
              text: R`**（教材原值 $R_1 = 2\ \Omega,\ R_2 = 4\ \Omega$）**：`,
              tex: R`\begin{gathered} i = \frac{9\text{ V}}{2\ \Omega + 4\ \Omega} = 1.5\text{ A}, \\ P_{R_2} = \frac{(6\text{ V})^2}{4\ \Omega} = 9.0\text{ W} = 36 \times P_{\max} \implies \text{瞬间冒烟烧毁！} \end{gathered}`,
            },
            {
              label: '等比例放大 1000×',
              text: R`**（面包板安全值 $R_1' = 2\text{ k}\Omega,\ R_2' = 4\text{ k}\Omega$）**：`,
              tex: R`\begin{gathered} i' = \frac{9\text{ V}}{2\text{ k}\Omega + 4\text{ k}\Omega} = 1.5\text{ mA}, \\ P_{R_2}' = \frac{(6\text{ V})^2}{4\text{ k}\Omega} = 9.0\text{ mW} = 3.6\% \times P_{\max} \implies \text{冰凉安全！} \end{gathered}`,
            },
          ],
        },
        { kind: 'p', text: '**3D 面包板实操守则（对照左侧 03 3D 面包板 9V 实测接线台）**：' },
        {
          kind: 'ul',
          items: [
            R`**认准色环**：$2\text{ k}\Omega$ 为 [[tok_r1|**红-黑-红-金**]]，$4\text{ k}\Omega$ 为 [[tok_r2|**黄-黑-红-金**]]；`,
            '**测电压要并联**：DMM 拨至 DC V 档，红表笔点 b12（[[tok_node_mid|中间分压节点]]），黑表笔点 b19（GND），屏显 [[tok_v2|**6.00 V**]]；',
            R`**测电流要串联**：DMM 拨至 DC mA 档，必须断开支路回流线并将表笔**串入回路**——**绝对禁止**在电流档把红黑表笔直接戳在 $+9\text{ V}$ 和 GND 上，那会瞬间烧断万用表保险丝！`,
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: '[[tok_safety_scale|**等比例放大以保护实验箱，分压比/增益不变**]]：教材为了口算方便常写 2 Ω 和 4 Ω，但在 3D 面包板 9 V 实测台上，我们必须将所有阻值等比例放大 1000 倍至 2 kΩ 与 4 kΩ——分压比与分流比完全不变，但电流从 1.5 A 降至 1.5 mA，功耗从 13.5 W 降至 13.5 mW，保护了实验箱不冒烟！',
        },
        {
          kind: 'table',
          caption:
            '安全缩放对照：9 V 单电源，1/4 W（0.25 W）四环碳膜电阻（±5%），安全工作上限 0.125 W，烧毁阈值 0.25 W；教材原题出现任意阻值 R < 100 Ω 时强制 ×1000',
          head: ['', '教材原值', '面包板安全值（×1000）'],
          rows: [
            ['R₁ / R₂', `2 Ω / 4 Ω`, `2 kΩ / 4 kΩ`],
            ['总电流', '1.5 A', '1.5 mA'],
            ['P(R₁) / P(R₂)', '4.5 W / 9.0 W', '4.5 mW / 9.0 mW'],
            ['总功耗', '13.5 W', '13.5 mW'],
            [
              '判定',
              '严重过载（R2 功耗达 9 W，是 0.25 W 电阻额定值的 36 倍，通电瞬间冒烟烧毁，9V 方块电池亦会急剧发热压降）',
              '绝对安全（R2 功耗仅 9 mW，仅为 0.25 W 额定值的 3.6%，无温升）',
            ],
            ['比例不变性', `(k·R₂) / (k·R₁ + k·R₂) = R₂ / (R₁ + R₂)`, `分压比、分流比与 k 无关`],
          ],
        },
        {
          kind: 'table',
          caption: `模式 A：串联分压实测台（Vs = 9 V, R₁ = 2 kΩ, R₂ = 4 kΩ）· 坐标系：顶部红色正电源轨 Rail(+)，顶部蓝色负电源轨（GND）Rail(-)；主体区 a–e、f–j 同列竖通，e 与 f 之间由中央绝缘凹槽隔开`,
          head: ['序号', '元件 / 导线', '型号与规格（默认）', '起点孔位', '终点孔位', '电气节点归属', '实测预期读数'],
          rows: [
            ['1', '[[tok_vs|9V 电源正极线（红）]]', '9.0 V DC 正极', '电源正极端子', '[[rail_pos|Rail(+)-Col 2]]', `节点 VCC (+9.00 V)`, `+9.00 V`],
            ['2', '9V 电源负极线（黑）', '0 V GND 参考地', '电源负极端子', '[[rail_neg|Rail(-)-Col 2]]', `节点 GND (0.00 V)`, `0.00 V`],
            ['3', '红色跳线 J1', '22 AWG 实心跳线', 'Rail(+)-Col 5', 'a5', 'VCC 引入第 5 列', `+9.00 V`],
            ['4', '[[tok_r1|电阻 R1]]', `2 kΩ（红-黑-红-金，1/4 W）`, 'e5', 'e12', '串联桥接 Col 5 → Col 12', `v₁ = 3.00 V`],
            ['5', '[[tok_r2|电阻 R2]]', `4 kΩ（黄-黑-红-金，1/4 W）`, 'd12', 'd19', '串联桥接 Col 12 → Col 19', `v₂ = 6.00 V`],
            ['6', '黑色跳线 J2', '22 AWG 实心跳线', 'a19', 'Rail(-)-Col 19', '第 19 列回流至 GND', `0.00 V`],
            ['7', `万用表红表笔（测 v₂）`, 'DMM VΩmA 孔（DC V 档）', 'DMM 正极', '[[tok_node_mid|b12（中间分压节点）]]', '节点 V_MID', '[[tok_v2|**屏显 6.00 V**]]'],
            ['8', `万用表黑表笔（测 v₂）`, 'DMM COM 孔（DC V 档）', 'DMM 负极', 'b19（公共地节点）', '节点 GND', '参考地 0.00 V'],
          ],
        },
        {
          kind: 'table',
          caption: `模式 B：并联分流实测台（Vs = 9 V, R₁ = 2 kΩ ∥ R₂ = 4 kΩ）· 电源接线同模式 A 的 1、2 行`,
          head: ['序号', '元件 / 导线', '型号与规格（默认）', '起点孔位', '终点孔位', '电气节点归属', '实测预期读数'],
          rows: [
            ['1', '红色跳线 J_top', '主干输入跳线', 'Rail(+)-Col 8', 'a8', '并联公共上节点 Node_A', `+9.00 V`],
            ['2', '[[tok_r1|电阻 R1（支路 1）]]', `2 kΩ（红-黑-红-金）`, 'e8', '[[center_trench|f8（跨中央凹槽）]]', 'Node_A → 支路 1 下端 Col 8(f–j)', `i₁ = 4.50 mA`],
            ['3', '[[tok_r2|电阻 R2（支路 2）]]', `4 kΩ（黄-黑-红-金）`, 'e10', 'f10（跨中央凹槽）', '需 c8→c10 橙色短跳线连通上节点', `i₂ = 2.25 mA`],
            ['4', '橙色上节点跳线 J_bus', '支路等电位桥接', 'c8', 'c10', '保证 R1 与 R2 上端同属 Node_A', `+9.00 V`],
            ['5', '黑色回流跳线 J_gnd2', '支路 2 接地线', 'j10', 'Rail(-)-Col 10', 'R2 下端直连 GND', `0.00 V`],
            ['6', `万用表串联测 i₁`, 'DMM 拨至 DC mA 档', '红笔接 j8', '黑笔接 Rail(-)-Col 8', '**串入支路 1 回流路径**', '[[tok_i1|**屏显 4.50 mA**]]'],
          ],
        },
      ],
      inline_svg: SVG_ACT5,
      figure_caption: '图 5-1：9V 面包板接线与 DMM 电压并联实测示意',
    },
    /* ---------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式分步引导例题 — 混联电路中求解 R_eq、i 与支路分流 i_o',
      sync: { layer: 'schematic', halo: ['tok_r2', 'tok_r3'], params: MIXED },
      blocks: [
        {
          kind: 'p',
          text: R`下面我们把串联与并联揉进同一张电路里（改编自 Alexander & Sadiku Ch. 2.6 & Boylestad Ch. 6 经典混联例题，并已按安全规则采用 $\text{k}\Omega$ 级阻值与单 9 V 供电）：`,
        },
        {
          kind: 'guided',
          title: R`混联电路三步解剖：从总阻值到支路分流 $i_o$`,
          source: 'W1-L7-SOCRATIC-01 · 改编自 Alexander & Sadiku Ch. 2.6 & Boylestad Ch. 6',
          problem: R`**题干**：如图所示的混联电路由 $V_s = 9\text{ V}$ 供电，其中干路电阻 [[tok_r1|$R_1 = 1\text{ k}\Omega$]] 与两条并联支路 [[tok_r2|$R_2 = 6\text{ k}\Omega$]]、[[tok_r3|$R_3 = 3\text{ k}\Omega$]] 相串联。请分三步依次求出：电路总等效电阻 $R_{\text{eq}}$；电源输出的总干路电流 [[tok_i|$i$]]；流过 $R_3 = 3\text{ k}\Omega$ 支路的电流 [[tok_io|$i_o$]]。`,
          problem_svg: SVG_ACT6,
          steps: [
            {
              title: R`Step 1 · 求解电路总等效电阻 $R_{\text{eq}}$`,
              mini_svg: MINI_STEP1,
              question: R`观察 Node A 右侧的 $R_2$ (6 kΩ) 与 $R_3$ (3 kΩ)：它们两端分别连在 Node A 和 GND 上，构成并联；并联后再与干路的 $R_1$ (1 kΩ) 串联。请问整个电路从电源两端看进去的总等效电阻 $R_{\text{eq}}$ 是多少？`,
              hint: '先找出哪两个电阻接在同一对节点之间：它们是并联，用“积除以和”合成一颗；剩下的那颗与这个并联块首尾相连，直接相加。',
              options: [
                {
                  text: '10 kΩ',
                  correct: false,
                  feedback: '停一下！你把 1 + 6 + 3 直接相加了。再看一眼 Node A，R2 和 R3 是肩并肩连在同两个节点上的，它们不是串联，而是并联！先用“积除以和”算出 R2 || R3 试试。',
                },
                {
                  text: '3 kΩ',
                  correct: true,
                  feedback: R`漂亮！先算并联 $R_2 \parallel R_3 = (6 \times 3) / (6 + 3) = 2\text{ k}\Omega$，再与干路 $R_1 = 1\text{ k}\Omega$ 串联，得到 $R_{\text{eq}} = 1 + 2 = 3\text{ k}\Omega$。注意并联等效阻值一定小于其中最小的那个电阻！`,
                },
                {
                  text: '2 kΩ',
                  correct: false,
                  feedback: '你把并联部分算对了（6 kΩ || 3 kΩ = 2 kΩ），但别忘了前面干路上还串联着一颗 R1 = 1 kΩ 呢！把它们加起来再选一次。',
                },
              ],
              board: [
                R`R_2 \parallel R_3 = \frac{6\text{ k}\Omega \times 3\text{ k}\Omega}{6\text{ k}\Omega + 3\text{ k}\Omega} = 2\text{ k}\Omega`,
                R`R_{\text{eq}} = R_1 + (R_2 \parallel R_3) = 1\text{ k}\Omega + 2\text{ k}\Omega = 3\text{ k}\Omega`,
              ],
              halo: ['tok_r2', 'tok_r3'],
              params: MIXED,
            },
            {
              title: R`Step 2 · 求解电源输出的总干路电流 $i$`,
              mini_svg: MINI_STEP2,
              question: R`既然电源眼里的整个网络等效为一颗 $R_{\text{eq}} = 3\text{ k}\Omega$ 的电阻，那么在 9 V 单电源驱动下，干路总电流 $i$ 是多少？（务必注意单位！）`,
              hint: R`把整个网络看成一颗 $R_{\text{eq}}$，直接用欧姆定律 $i = V_s / R_{\text{eq}}$；分子是伏特、分母是千欧时，商的单位是什么？`,
              options: [
                {
                  text: '3 A',
                  correct: false,
                  feedback: R`数值 9 / 3 = 3 没错，但分母的单位是 kΩ（$10^3\ \Omega$）！伏特除以千欧得到的是毫安（mA），不是安培（A）。要是真流过 3 A，面包板早就冒烟啦！`,
                },
                { text: '3 mA', correct: true, feedback: R`精准！$i = 9\text{ V} / 3\text{ k}\Omega = 3\text{ mA}$。记住这个工程速算习惯：V / kΩ = mA。` },
                {
                  text: '0.9 mA',
                  correct: false,
                  feedback: R`你是用 9 V / 10 kΩ 算的吗？刚才 Step 1 我们已经确认总等效电阻是 $R_{\text{eq}} = 3\text{ k}\Omega$，请用 9 V 除以 3 kΩ。`,
                },
              ],
              board: [R`i = \frac{V_s}{R_{\text{eq}}} = \frac{9\text{ V}}{3\text{ k}\Omega} = 3.00\text{ mA}`],
              halo: ['tok_vs', 'tok_i'],
              params: MIXED,
            },
            {
              title: R`Step 3 · 用分流公式求流过 $R_3 = 3\text{ k}\Omega$ 支路的电流 $i_o$`,
              mini_svg: MINI_STEP3,
              question: R`干路总电流 $i = 3\text{ mA}$ 冲进 Node A 后，将在 $R_2 = 6\text{ k}\Omega$ 和 $R_3 = 3\text{ k}\Omega$ 两条并联支路之间分流。请用分流公式计算流过 $R_3 = 3\text{ k}\Omega$ 支路的电流 $i_o$：`,
              hint: '两支路分流公式：求哪条支路的电流，分子就放“对方”那条支路的阻值，分母是两条支路阻值之和。再做个直觉检查：阻值小的那条路应该分得更多。',
              options: [
                {
                  text: '1 mA（算式：3 / (6+3) × 3 mA）',
                  correct: false,
                  feedback:
                    '【错路拦截：你把分流分子写反了！】你是不是顺手把 R3 = 3 kΩ 放到了分子上？停下来做个物理直觉检查：R3 (3 kΩ) 比 R2 (6 kΩ) 阻力小了一半，它是一条更宽敞的路，怎么可能只分到总电流的 1/3（1 mA）呢？记住口诀“分压看自己，分流看对方”——求 R3 的电流，分子必须放对面支路的阻值 R2！',
                },
                {
                  text: '2 mA（算式：6 / (6+3) × 3 mA）',
                  correct: true,
                  feedback: R`满分通关！求 R3 支路的电流 $i_o$，分子放“对方” $R_2 = 6\text{ k}\Omega$：$i_o = [6 / (6 + 3)] \times 3\text{ mA} = 2\text{ mA}$。此时 R2 支路分得 1 mA，两条支路压降同为 $2\text{ mA} \times 3\text{ k}\Omega = 1\text{ mA} \times 6\text{ k}\Omega = 6\text{ V}$，加上 R1 上的 3 V 刚好等于 9 V！`,
                },
                {
                  text: '1.5 mA（两条支路平分）',
                  correct: false,
                  feedback: '只有当两条并联支路阻值完全相等时，电流才会对半平分。这里 R3 = 3 kΩ 只有 R2 = 6 kΩ 的一半，电流会更多地涌向阻力更小的 R3。',
                },
              ],
              board: [R`i_o = \frac{R_2}{R_2 + R_3}\, i = \frac{6\text{ k}\Omega}{6\text{ k}\Omega + 3\text{ k}\Omega} \times 3.00\text{ mA} = 2.00\text{ mA}`],
              halo: ['tok_io', 'tok_r2'],
              params: MIXED,
            },
          ],
          conclusion: R`三步通关：$R_{\text{eq}} = 3\text{ k}\Omega$，$i = 3.00\text{ mA}$，$i_o = 2.00\text{ mA}$。在左侧 03 3D 面包板 上切到「混联例题」和 DC mA 档，万用表串在 R3 的回流路径（a25 → GND）里读到的正是 2.00 mA。`,
        },
        {
          kind: 'origin',
          title: '例题完整三段式规范解答汇总 · ① 公理溯源',
          text: R`$R_{\text{eq}} = R_1 + (R_2 \parallel R_3)$，$i = \dfrac{V_s}{R_{\text{eq}}}$，$i_o = \dfrac{R_2}{R_2 + R_3} i$。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式',
          tex: R`R_{\text{eq}} = R_1 + \frac{R_2 R_3}{R_2 + R_3}, \qquad i_o = \frac{R_2}{R_2 + R_3} \cdot \frac{V_s}{R_1 + \dfrac{R_2 R_3}{R_2 + R_3}}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A',
              tex: R`R_{23} = \frac{6\text{ k}\Omega \times 3\text{ k}\Omega}{6\text{ k}\Omega + 3\text{ k}\Omega} = 2\text{ k}\Omega \implies R_{\text{eq}} = 1\text{ k}\Omega + 2\text{ k}\Omega = 3\text{ k}\Omega`,
            },
            {
              label: 'Step B',
              tex: R`i = \frac{9\text{ V}}{3\text{ k}\Omega} = 3.00\text{ mA}, \qquad i_o = \frac{6\text{ k}\Omega}{6\text{ k}\Omega + 3\text{ k}\Omega} \times 3.00\text{ mA} = 2.00\text{ mA}`,
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 7 */
    {
      act_index: 7,
      badge: '第 7 幕',
      title: '工程防坑清单 — 三支路并联绝不能套“对方之和”！',
      sync: { layer: 'schematic', halo: ['tok_i1', 'tok_r2', 'tok_r3'], params: circuit({ topo: 'parallel3', vs: 11, r1: 2, r2: 3, r3: 6 }) },
      blocks: [
        {
          kind: 'p',
          text: '恭喜你闯过了混联例题！但作为你的课程教授，我必须在下课前帮你排掉全班 60% 学生在作业里都会踩中的**头号大坑**：**三支路及以上并联时的分流公式误用**。',
        },
        {
          kind: 'p',
          text: R`不少同学把两支路口诀“分流看对方”生搬硬套到三条并联支路（$R_1 \parallel R_2 \parallel R_3$）上，随手写出错误式子 $i_1 \stackrel{\text{错!}}{=} \dfrac{R_2 + R_3}{R_1 + R_2 + R_3} i$。**为什么错了？** 因为另外两条支路 [[tok_r2|$R_2$]] 和 [[tok_r3|$R_3$]] 是**并联**在一起充当“对方”的，而不是串联！`,
        },
        {
          kind: 'origin',
          title: '推导 7.1：三支路并联分流的正确通式 · ① 公理溯源（公共电压相等 + 并联总等效电阻）',
          text: R`三支路共享同一端电压 $v = i R_{\text{eq}}$，其中 $\dfrac{1}{R_{\text{eq}}} = \dfrac{1}{R_1} + \dfrac{1}{R_2} + \dfrac{1}{R_3}$。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（等效电阻法 / 电导法）',
          tex: R`i_1 = \frac{v}{R_1} = \frac{R_{\text{eq}}}{R_1} i = \frac{G_1}{G_1 + G_2 + G_3} i = \frac{R_2 \parallel R_3}{R_1 + (R_2 \parallel R_3)} i`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（$i = 11\text{ mA},\ R_1 = 2\text{ k}\Omega,\ R_2 = 3\text{ k}\Omega,\ R_3 = 6\text{ k}\Omega$）`,
          steps: [
            {
              label: 'Step A',
              tex: R`\frac{1}{R_{\text{eq}}} = \frac{1}{2} + \frac{1}{3} + \frac{1}{6} = \frac{3 + 2 + 1}{6} = 1\text{ mS} \implies R_{\text{eq}} = 1\text{ k}\Omega`,
            },
            { label: 'Step B', tex: R`i_1 = \frac{R_{\text{eq}}}{R_1} i = \frac{1\text{ k}\Omega}{2\text{ k}\Omega} \times 11\text{ mA} = 5.50\text{ mA}` },
            {
              label: '检验',
              text: R`(检验另两支路：$i_2 = \frac{1}{3}\times 11 = 3.67\text{ mA}$，$i_3 = \frac{1}{6}\times 11 = 1.83\text{ mA}$，三者之和 $= 11.00\text{ mA}$！若按错误公式算 $(3+6)/(2+3+6)\times 11 = 9\text{ mA}$，谬以千里！)`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '左侧原理图已切到「三支路并联」：电源调到 11 V，三条支路共享 11 V，干路正好是 11 mA。拖动 R2、R3 滑块，看 i1 怎么跟着“对方的并联值”变。',
        },
      ],
      inline_svg: SVG_ACT7,
      figure_caption: '图 7-1：三支路并联分流防坑图（正确式：i1 = (R_eq / R1) · i）',
    },
    /* ---------------------------------------------------------------- act 8 */
    {
      act_index: 8,
      badge: '第 8 幕',
      title: '随堂自测与下节预告（W1-L8 Y–Δ 变换）',
      sync: { layer: 'schematic', params: circuit() },
      blocks: [{ kind: 'p', text: '**随堂自测（2 题）**：答对两题即通关本课。' }],
      quiz: [
        {
          id: 'w1l7_q1',
          question: R`你在 9 V 面包板上用 R1 = 3 kΩ 和 R2 = 6 kΩ 搭了一个空载输出 6.0 V 的分压器。若现在将一个 RL = 6 kΩ 的负载并联在 R2 两端，此时万用表测得的输出电压 $v_{\text{out}}$ 变为多少？若改把所有阻值缩小 1000 倍至 3 Ω / 6 Ω / 6 Ω，会发生什么？`,
          options: [
            { key: 'A', text: R`$v_{\text{out}}$ 保持 6.0 V 不变；缩小 1000 倍后电流不变`, correct: false },
            { key: 'B', text: R`$v_{\text{out}}$ 降至 4.5 V；缩小 1000 倍后输出电压仍为 4.5 V，但电阻功耗放大 1000 倍至瓦级并冒烟烧毁`, correct: true },
            { key: 'C', text: R`$v_{\text{out}}$ 升至 7.2 V；缩小 1000 倍后分压比也会缩小 1000 倍`, correct: false },
            { key: 'D', text: R`$v_{\text{out}}$ 降至 3.0 V；缩小 1000 倍后电路更安全`, correct: false },
          ],
          feedback_correct: R`并联负载后 $R_2 \parallel R_L = 6\text{ k}\Omega \parallel 6\text{ k}\Omega = 3\text{ k}\Omega$，与 $R_1 = 3\text{ k}\Omega$ 串联均分 9 V，故 $v_{\text{out}} = [3 / (3 + 3)] \times 9\text{ V} = 4.5\text{ V}$。若阻值同缩 1000 倍，比例因子约去，电压仍为 4.5 V，但 R1 功耗从 $(4.5^2)/3000 = 6.75\text{ mW}$ 暴增至 $(4.5^2)/3 = 6.75\text{ W}$，远超 1/4 W 碳膜电阻极限而冒烟。`,
          feedback_wrong: '再想一想：RL 并上去之后，下臂已经不是 R2 一颗，而是 R2 || RL；先合成它，再和 R1 串联分压。至于阻值同缩 1000 倍：比例里的 k 会约掉，可电流和功耗呢？',
          figure: SVG_Q1,
          sync: { layer: 'schematic', halo: ['tok_rl', 'tok_v2'], params: circuit({ r1: 3, r2: 6, rl: 6 }) },
        },
        {
          id: 'w1l7_q2',
          question: '某并联节点流入总电流 i = 10 mA，下接两条并联支路 R1 = 2 kΩ 与 R2 = 8 kΩ。流过阻值较小的 R1 支路的电流 i1 是多少？',
          options: [
            { key: 'A', text: '2 mA', correct: false, feedback: '你是不是把分流分子写反了？求 R1 支路的电流，分子要放“对方” R2 = 8 kΩ，而不是 R1 自己。' },
            { key: 'B', text: '5 mA', correct: false },
            { key: 'C', text: '8 mA', correct: true },
            { key: 'D', text: '10 mA', correct: false },
          ],
          feedback_correct: R`依据“分流看对方”公式：$i_1 = [R_2 / (R_1 + R_2)] \times i = [8 / (2 + 8)] \times 10\text{ mA} = 8\text{ mA}$。R1 阻值仅为 R2 的 1/4，因此吸纳了 4 倍于 R2 的电流（8 mA vs. 2 mA）。选 A 的同学请注意检查是否把分流分子写反了！`,
          feedback_wrong: '只有两条支路阻值相等时才会平分，电流也不会全走一条路。用“分流看对方”：求 R1 的电流，分子放 R2。',
          figure: SVG_Q2,
          sync: { layer: 'schematic', halo: ['tok_i1'], params: circuit({ topo: 'parallel_cdiv', r1: 2, r2: 8 }) },
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**下节预告：W1-L8 — 当串并联化简彻底失灵：Y–Δ（星-三角）变换**' },
        {
          kind: 'p',
          text: '学完今天这节课，你已经能用“串联相加 + 并联积除以和”秒杀绝大多数混联电路了。但是，请看下面这张经典的**惠斯通电桥（Wheatstone Bridge）**电路图：',
        },
        { kind: 'figure', svg: SVG_ACT8, caption: '图 8-1：W1-L8 悬念预告 — 串并联化简失效的惠斯通电桥' },
        { kind: 'p', text: R`仔细找一找——里面有**任何两个电阻是纯串联或纯并联的吗**？答案是：**一个都没有！** 中间那颗跨接电阻 $R_5$ 把整个网络锁死了，今天的公式瞬间集体失灵。` },
        {
          kind: 'p',
          text: R`下一讲 **W1-L8（Y–Δ 等效变换）**，我们将祭出一把神奇的拓扑手术刀，把三角形（$\Delta$）电阻网络无缝变成星形（$\text{Y}$）网络，一刀切开电桥死结！我们下节课见！`,
        },
      ],
    },
  ],
};

export default W1_L7;
