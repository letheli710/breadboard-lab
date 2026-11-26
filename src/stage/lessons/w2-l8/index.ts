// W2-L8 · 最大功率传输定理 (lesson sheet: docs/lessons/W2-L8.md).
// The professor's text of the five acts is reproduced from the sheet as written; [[id|…]] only
// links a term to the stage (the words are unchanged). Changes of form, none of wording:
// - the opening remarks (教授开场白) open act 1; the sheet's numbered sub-headings (1.1 … 5.3) are
//   bold lines; a figure sits where the sheet puts it (`figure`), or closes the act (`inline_svg`);
// - display formulas sit in the ①/②/③ cards (a lead-in sentence becomes the card title); the
//   three formulas of act 3's ② share one card; the bulleted ① cards run as one paragraph;
// - the guided example (sheet §3.4) is an act of its own, between act 3 and act 4, so the stage can
//   show its network while it runs (act 3's worked example is another circuit: 12 V / 1 A, R_Th =
//   8 Ω; the guided example is 18 V / 3 A, R_Th = 6 Ω — so act 3's ③ stays before it);
// - plain-text symbols of the JSON parts (R_Th, V_Th, p_max, I_{R3} …) are set as TeX;
// - dev-facing words are left out: "（`breadboard_safety_and_scaling` 落地）" in 5.1, the renderer id
//   `3D_THREEJS_BREADBOARD` in act 5 (the layer's label instead), "的完整交互引导配置" and
//   "Claude 前端引擎可直接解析渲染" before the guided example, "可直接导入 Breadboard Lab 评测系统"
//   before the quiz.
// Added: the guided example's praise for the right options and its conclusion; the sheet's
// breadboard_safety_and_scaling block as a note and a table in act 5, and the 3D board's wiring
// table; a figure for the guided problem, each quiz question and the quiz act; per-option quiz
// feedback written from the sheet's explanations.

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import type { StageLesson, StageSync } from '../../types';
import {
  MINI_STEP1,
  MINI_STEP2,
  MINI_STEP3,
  MINI_STEP4,
  MINI_STEP5,
  SVG_ACT1,
  SVG_ACT2,
  SVG_ACT3,
  SVG_ACT4,
  SVG_ACT5,
  SVG_GD_PROBLEM,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
  SVG_QUIZ_ACT,
} from './svgs';

const Schematic = lazy(() => import('./Schematic'));
const Curves = lazy(() => import('./Curves'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;
/** inline code inside String.raw text */
const code = (s: string) => '`' + s + '`';

const L1 = 'schematic';
const L2 = 'curves';
const L3 = 'bench3d';

/** the stage circuit of an act (every act sets all of it, so scrolling back restores it) */
const theory = (p: Record<string, unknown> = {}): StageSync['params'] => ({ mode: 'theory', case: 'ex3', view: 'eq', rlT: 8, reveal: 9, ...p });
const GD = (reveal: number, p: Record<string, unknown> = {}) => theory({ case: 'gd', view: 'net', reveal, rlT: 3, ...p });

const W2_L8: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Schematic, [L2]: Curves, [L3]: Bench3D },
  describeTarget: genericLabel,
  lesson_meta: {
    lesson_id: 'W2-L8',
    world: 'World 2',
    title: '最大功率传输定理',
    subtitle: 'Maximum Power Transfer',
    lesson_type: 'D',
    lesson_type_label: 'Type D（动态曲线 + 3D 面包板实操课）',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits, 2026 Release',
      sections: ['Section 4.8 Maximum Power Transfer'],
    },
    textbook_supplement: 'Robert L. Boylestad, Introductory Circuit Analysis (14th Ed.) · Chapter 9 Maximum Power Transfer Theorem (Curve Intuition & Asymmetry)',
    prerequisites: ['W1-L2: 功率公式 (P = VI = I²R = V²/R)', 'W1-L7: 分压定律 (Voltage Division)', 'W2-L7: 戴维南定理 (Thevenin’s Theorem)'],
    learning_objectives: [
      '通过边界极限直觉理解负载功率随负载电阻变化必然存在唯一峰值，且右侧衰减比左侧平缓。',
      R`独立完成戴维南等效带载功率函数的微积分求导，严格证明最大功率传输条件 $R_L = R_{Th}$ 及峰值公式 $p_{\max} = V_{Th}^2 / (4 R_{Th})$。`,
      '熟练求解含多源电阻网络的戴维南等效电路，进而确定最大功率负载阻值与峰值功率。',
      R`深刻区分最大功率传输（效率 $\eta = 50\%$，用于射频/音响/传感器等小信号匹配）与高效率输电（$R_L \gg R_{Th}$，$\eta > 95\%$，用于电力电网）的工程权衡。`,
      '在 3D 面包板上搭建安全 kΩ 级戴维南等效电路，通过拧动电位器、测量 $V_L$ 实时计算 $P_L = V_L^2 / R_L$，亲手捕捉 $V_L = V_{Th} / 2$ 处的功率峰值点。',
    ],
    next_lesson: 'W3-L1',
    next_lesson_title: '认识真实运放',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 戴维南带载原理图',
        short: '01 带载原理图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '01 2D 戴维南带载原理图：V_Th 与 R_Th 装在端口 a–b 左侧的虚线黑盒里，右侧可调负载 R_L 跟着滑块变；下方实时显示 I_L、V_L、P_L 与内阻发热 P_Th。',
      },
      {
        id: L2,
        label: '02 P_L–R_L 峰值曲线',
        short: '02 功率曲线',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '02 实时 P_L–R_L 峰值曲线与效率曲线双图：左陡右缓的功率峰（蓝）与单调上升的效率 η（绿），红色虚线锁定 R_L = R_Th，游标跟着滑块与 3D 旋钮走。',
      },
      {
        id: L3,
        label: '03 3D 面包板拧电位器',
        short: '03 3D 电位器',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption: '03 3D 面包板拧电位器找最大功率实操：5 V 台式电源 + 1 kΩ（R_Th）+ B10K 电位器（R_L），万用表并在电位器两端读 V_L；拖动旋钮，仪器面板实时算 P_L = V_L²/R_L。',
      },
    ],
    hover_map: {
      vth: { label: '戴维南等效电压源 V_Th', desc: '端口 a–b 开路时的电压：理论例题 16 V；面包板上由台式可调直流电源提供 5 V（面包板 USB 稳压模块同样可用）' },
      rth: { label: '戴维南等效内阻 R_Th', desc: '独立源置零后从 a–b 看进去的电阻：理论例题 8 Ω；面包板上是 1 kΩ 棕-黑-红-金电阻（c10–c18）' },
      rl: { label: '可调负载 R_L', desc: '滑块或 3D 电位器旋钮调节；面包板上是 B10K 线性电位器（引脚 j18 / j20 / j22），θ 0–270° 对应 50 Ω–10 kΩ' },
      port_ab: { label: '端口 a–b', desc: '戴维南黑盒与负载的分界；面包板上端口 a 是第 18 列（橙色跳线 e18–f18 跨凹槽），端口 b 是 GND 轨' },
      il: { label: '回路电流 I_L', desc: 'I_L = V_Th / (R_Th + R_L)：R_L 越小越大，短路时达到 I_sc = V_Th / R_Th' },
      vl: { label: '负载电压 V_L', desc: 'V_L = V_Th · R_L / (R_Th + R_L)；万用表 DC V 档红表笔 b18（端口 a）、黑表笔 GND 轨读到的就是它' },
      pl: { label: '负载功率 P_L', desc: 'P_L = V_L · I_L = V_L² / R_L：R_L → 0 与 R_L → ∞ 两端都为零，R_L = R_Th 时最大' },
      pth: { label: '内阻发热 P_Th', desc: 'P_Th = I_L² · R_Th：匹配时与 P_L 相等，各占电源发出功率的一半' },
      pmax: { label: '峰值 P_max（R_L = R_Th）', desc: 'p_max = V_Th² / (4 R_Th)：红色虚线锁定 R_L = R_Th，理论例题 8 W，面包板 6.25 mW' },
      eta: { label: '传输效率 η', desc: 'η = R_L / (R_Th + R_L)：随 R_L 单调增加、趋近 100%，匹配点恰为 50%' },
      pair: { label: '0.5 R_Th 与 2 R_Th 对照点', desc: '两点功率相同（都是 88.9% P_max），但右侧效率 66.7% 是左侧 33.3% 的两倍' },
      net_vs: { label: '独立电压源 V_s', desc: '第三幕例题 12 V，引导例题 18 V；求 R_Th 时置零 = 短路' },
      net_r1: { label: '电阻 R1', desc: '接在 V_s 与节点 A 之间（6 Ω）' },
      net_r2: { label: '电阻 R2', desc: '接在节点 A 与参考地之间（第三幕例题 12 Ω，引导例题 3 Ω）' },
      net_r3: { label: '电阻 R3', desc: '节点 A 到端口 a 的串联电阻（4 Ω）；端口开路时其上没有电流' },
      net_is: { label: '独立电流源 I_s', desc: '第三幕例题 1 A 注入端口 a，引导例题 3 A 注入节点 A；求 R_Th 时置零 = 开路' },
      pot_short: { label: 'Pin 2–Pin 3 短接线（绿色）', desc: '电位器滑动端（Pin 2）与一侧固定端（Pin 3）短接（h20–h22），接成两脚可变电阻，防止滑动端悬空开路' },
      scale_note: { label: '安全缩放', desc: '教材 8 Ω / 16 V（峰值 8 W、1 A）不能上 1/4 W 面包板；缩放为 1 kΩ / 5 V，峰值仅 6.25 mW，R_Th 最大发热 25 mW（10 倍裕量）' },
      samples: { label: '已记录的数据点', desc: '在 03 面包板层点「记录当前数据点」写入的 (R_L, V_L, P_L, η)，留在 02 曲线上' },
      rail_pos: { label: '+5 V 电源轨', desc: '顶部红色轨，接台式可调直流电源正极（V_Th）' },
      rail_neg: { label: 'GND 接地轨（端口 b）', desc: '底部蓝色轨，接电源负极；电位器 Pin 3 与万用表黑表笔都接在这里' },
      center_trench: { label: '中央绝缘凹槽', desc: 'e 与 f 之间绝缘：端口 a 的上下两半由橙色跳线 e18–f18 连通' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '物理直觉与边界夹逼——为什么峰值一定藏在中间？',
      sync: { layer: L1, halo: ['vth', 'rth', 'port_ab', 'rl'], params: theory() },
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：同学们好，欢迎回到 Breadboard Lab。上一讲（${code('W2-L7')}）我们学会了一项极其优雅的“降维打击”本领——**戴维南定理**：无论负载左侧的线性电路多么盘根错节，站在[[port_ab|负载端口 $a\text{–}b$]] 往左看，它统统等价于一个[[vth|独立电压源 $V_{Th}$]] 串联一个[[rth|等效内阻 $R_{Th}$]]。`,
        },
        {
          kind: 'p',
          text: R`今天，我们紧接着追问电路设计中最核心的工程问题之一：**既然左侧电源网络的 $V_{Th}$ 和 $R_{Th}$ 已经给定，我手里有一堆不同阻值的负载电阻 [[rl|$R_L$]]（比如不同阻抗的扬声器、射频天线或传感器后级），究竟该选多大的 $R_L$，才能从这个电路里“榨”出最大的功率？**`,
        },
        {
          kind: 'p',
          text: '先别急着背结论。这节课我们将按工程师的真实思维走完五幕：**边界直觉 → 微积分严格证明 → 戴维南综合实战 → 50% 效率的残酷工程真相 → 3D 面包板亲手拧电位器抓峰值**。请把目光投向左侧舞台，我们开始第一幕。',
        },
        { kind: 'p', text: '**1.1 把复杂网络装进戴维南黑盒**' },
        {
          kind: 'p',
          text: R`假设你正在设计一个音频功放或无线电接收机前端。根据 ${code('W2-L7 戴维南定理')}，任何只含独立源、受控源与线性电阻的复杂供电网络，只要把[[rl|负载电阻 $R_L$]] 摘下来，[[port_ab|端口 $a\text{–}b$]] 左侧就能等效为 [[vth|$V_{Th}$]] 与 [[rth|$R_{Th}$]] 的串联。`,
        },
        {
          kind: 'p',
          text: R`把可调负载 $R_L$ 重新接回 $a\text{–}b$ 端口后，整个世界瞬间简化为一个单回路分压电路（回顾 ${code('W1-L7 分压定律')} 与 ${code('W1-L2 功率公式')}）：`,
        },
        {
          kind: 'ul',
          items: [
            R`[[il|回路电流]]：$I_L = \dfrac{V_{Th}}{R_{Th} + R_L}$`,
            R`[[vl|负载电压]]：$V_L = V_{Th} \cdot \dfrac{R_L}{R_{Th} + R_L}$`,
            R`[[pl|负载吸收功率]]：$P_L = V_L \cdot I_L$`,
          ],
        },
        { kind: 'figure', svg: SVG_ACT1, caption: '图 1-1：戴维南等效网络驱动可变负载 R_L（端口 a–b 视角）' },
        { kind: 'p', text: '**1.3 Boylestad 坡度直觉：先看两个极端，再看中间的拔河**' },
        {
          kind: 'p',
          text: R`在动笔求导之前，我们先用 Boylestad 教材最经典的“边界夹逼法”建立物理直觉。负载功率是**电压与电流的乘积**（$P_L = V_L I_L$），而 [[vl|$V_L$]] 和 [[il|$I_L$]] 在 $R_L$ 变化时正好是一场此消彼长的拔河：`,
        },
        { kind: 'p', text: R`**1. 极端一：$R_L \to 0$（负载短路）**` },
        {
          kind: 'ul',
          items: [
            R`此时回路电流冲到最大值 $I_{sc} = V_{Th}/R_{Th}$，看起来声势浩大；`,
            R`但短路电阻两端的电压 $V_L = I_L R_L = 0$！所有电压全被内阻 $R_{Th}$ 吞掉了；`,
            R`结果：$P_L = 0 \times I_{sc} = 0\text{ W}$。`,
          ],
        },
        { kind: 'p', text: R`**2. 极端二：$R_L \to \infty$（负载开路）**` },
        {
          kind: 'ul',
          items: [R`此时负载两端拿到了全部的开路电压 $V_L = V_{Th}$，电压登顶；`, R`但断路里根本没有电流流过，$I_L = 0$！`, R`结果：$P_L = V_{Th} \times 0 = 0\text{ W}$。`],
        },
        { kind: 'p', text: '**3. 中间必然存在唯一峰值，且曲线“左陡右缓”**' },
        {
          kind: 'ul',
          items: [
            R`既然 $R_L = 0$ 时功率为 $0$，$R_L \to \infty$ 时功率也趋于 $0$，而只要 $0 < R_L < \infty$ 就有正功率 $P_L > 0$，根据连续函数性质，中间必然存在一个[[pmax|**最大功率峰值**]]！`,
            R`更微妙的是曲线形状：从 $0$ 增加到峰值只跨越了有限区间 $[0, R_{Th}]$，因此**左侧爬坡非常陡峭**；而越过峰值后，横轴一直延伸到 $+\infty$ 才慢慢回落到 $0$，因此**右侧衰减比左侧平缓得多**。记住这个“偏态山峰”特征，它在第四幕的工程选型里会派上大用场。`,
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: R`微积分严格推导——锁定 $R_L = R_{Th}$ 与峰值双曲线`,
      sync: { layer: L2, halo: ['pmax', 'eta', 'pair'], params: theory() },
      blocks: [
        {
          kind: 'p',
          text: '现在我们把直觉变成铁打的数学定理。以下板书严格遵守 **① 公理溯源 → ② 纯符号通式 → ③ 数值验算** 三段式，绝不把符号和具体数字混在一起写。',
        },
        { kind: 'p', text: '**2.1 三段式教授板书推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: R`由 ${code('W2-L7 戴维南定理')}，端口 $a\text{–}b$ 左侧线性有源网络等效为电压源 [[vth|$V_{Th}$]] 串联电阻 [[rth|$R_{Th}$]]，且两者仅由左侧网络决定，**相对于可调负载 $R_L$ 均为常数**。由 ${code('W1-L2 功率公式')} 与欧姆定律，串联回路电流为 $i_L = \dfrac{V_{Th}}{R_{Th} + R_L}$，负载吸收功率为 $p(R_L) = i_L^2 R_L$。为寻找 $p(R_L)$ 在 $R_L \in (0, +\infty)$ 上的极大值点，对自变量 $R_L$ 求一阶导数并令 $\dfrac{dp}{dR_L} = 0$（运用微积分商的求导法则 $\left(\dfrac{u}{v}\right)' = \dfrac{u'v - uv'}{v^2}$）。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（General Formula）：先写出[[pl|负载功率]]关于 $R_L$ 的纯符号目标函数`,
          tex: R`p(R_L) = i_L^2 R_L = \left(\frac{V_{Th}}{R_{Th} + R_L}\right)^2 R_L = V_{Th}^2 \frac{R_L}{(R_{Th} + R_L)^2}`,
        },
        {
          kind: 'formula',
          title: R`对 $R_L$ 求一阶导数（$V_{Th}$、$R_{Th}$ 视为常数）：`,
          tex: R`\frac{dp}{dR_L} = V_{Th}^2 \cdot \frac{1 \cdot (R_{Th} + R_L)^2 - R_L \cdot 2(R_{Th} + R_L)}{(R_{Th} + R_L)^4}`,
        },
        {
          kind: 'formula',
          title: R`分子提取公因式 $(R_{Th} + R_L)$ 并与分母约去一次方：`,
          tex: R`\frac{dp}{dR_L} = V_{Th}^2 \cdot \frac{(R_{Th} + R_L) - 2R_L}{(R_{Th} + R_L)^3} = V_{Th}^2 \cdot \frac{R_{Th} - R_L}{(R_{Th} + R_L)^3}`,
        },
        {
          kind: 'formula',
          title: R`令一阶导数为零 $\dfrac{dp}{dR_L} = 0$（因 $V_{Th} \neq 0$ 且分母 $(R_{Th}+R_L)^3 > 0$）：`,
          tex: R`R_{Th} - R_L = 0 \implies R_L = R_{Th}`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**极值性质检验**：当 $R_L < R_{Th}$ 时，$\dfrac{dp}{dR_L} > 0$（功率严格递增）；当 $R_L > R_{Th}$ 时，$\dfrac{dp}{dR_L} < 0$（功率严格递减）。因此 [[pmax|$R_L = R_{Th}$ 是全局唯一极大值点]]！`,
        },
        {
          kind: 'formula',
          title: R`将 $R_L = R_{Th}$ 回代至 $p(R_L)$，得到[[pmax|**最大传输功率公式**]]：`,
          tex: R`p_{\max} = \left(\frac{V_{Th}}{R_{Th} + R_{Th}}\right)^2 R_{Th} = \frac{V_{Th}^2}{4 R_{Th}^2} \cdot R_{Th} = \frac{V_{Th}^2}{4 R_{Th}}`,
        },
        {
          kind: 'formula',
          title: R`同时，写出此时[[eta|**戴维南等效电路的功率传输效率**]]（负载功率占电源总发出功率之比）：`,
          tex: R`\eta(R_L) = \frac{P_L}{P_{\text{total}}} = \frac{i_L^2 R_L}{i_L^2 (R_{Th} + R_L)} = \frac{R_L}{R_{Th} + R_L}`,
        },
        { kind: 'formula', title: R`当满足最大功率匹配条件 $R_L = R_{Th}$ 时：`, tex: R`\eta_{\text{match}} = \frac{R_{Th}}{R_{Th} + R_{Th}} = \frac{1}{2} = 50\%` },
        {
          kind: 'formula',
          title: R`同时，此时[[vl|负载端电压]]恰好分得一半的开路电压（实验室抓峰值的黄金判据）：`,
          tex: R`V_{L,\text{match}} = V_{Th} \cdot \frac{R_{Th}}{R_{Th} + R_{Th}} = \frac{V_{Th}}{2}`,
        },
        {
          kind: 'p',
          text: R`为了看清曲线为何“左陡右缓”，我们定义无量纲负载比 $x = \dfrac{R_L}{R_{Th}}$，则功率归一化公式为 $\dfrac{p(x)}{p_{\max}} = \dfrac{4x}{(1+x)^2}$，效率为 $\eta(x) = \dfrac{x}{1+x}$：`,
        },
        {
          kind: 'calc',
          title: '③ 归一化数值验算（验证曲线偏态与对称律）',
          steps: [
            {
              label: R`当 $x = 0.5$（即 $R_L = 0.5 R_{Th}$）`,
              tex: R`\frac{p}{p_{\max}} = \frac{4 \times 0.5}{(1 + 0.5)^2} = \frac{2}{2.25} = \frac{8}{9} \approx 88.89\%, \qquad \eta = \frac{0.5}{1.5} = 33.33\%`,
            },
            {
              label: R`当 $x = 1.0$（即 $R_L = R_{Th}$，**峰值匹配点**）`,
              tex: R`\frac{p}{p_{\max}} = \frac{4 \times 1}{(1 + 1)^2} = 100.00\%, \qquad \eta = \frac{1}{2} = 50.00\%`,
            },
            {
              label: R`当 $x = 2.0$（即 $R_L = 2 R_{Th}$）`,
              tex: R`\frac{p}{p_{\max}} = \frac{4 \times 2}{(1 + 2)^2} = \frac{8}{9} \approx 88.89\%, \qquad \eta = \frac{2}{3} = 66.67\%`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授点睛**：你发现了吗？[[pair|$R_L = 0.5 R_{Th}$ 和 $R_L = 2 R_{Th}$]] 的传输功率**一模一样**（都是峰值的 $88.89\%$）！但前者只往左偏了 $0.5 R_{Th}$，后者却往右偏了整整 $1.0 R_{Th}$——这就是右侧更平缓的数学根源；更妙的是，右侧 $2 R_{Th}$ 的效率（$66.67\%$）正好是左侧 $0.5 R_{Th}$（$33.33\%$）的**两倍**！`,
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '图 2-1：归一化功率 P_L / P_max（偏态钟形）与效率 η（单调递增）同屏对比',
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '综合实战——先求戴维南等效，再求最大功率（Sadiku 4.8 典范）',
      sync: { layer: L1, halo: ['port_ab', 'net_vs', 'net_is'], params: theory({ view: 'net' }) },
      blocks: [
        {
          kind: 'p',
          text: R`在真实考试和工程分析中，题目**绝不会**直接把 $V_{Th}$ 和 $R_{Th}$ 端到你面前。你必须先动用 ${code('W2-L7')} 的戴维南定理，把负载 $R_L$ 摘下来，化简左侧的多源网络，再套用最大功率定理。`,
        },
        { kind: 'p', text: '**3.1 典范例题描述**' },
        {
          kind: 'p',
          text: R`如下图所示的含双独立源直流网络中，[[net_vs|独立电压源 $V_s = 12\text{ V}$]] 经[[net_r1|电阻 $R_1 = 6\ \Omega$]] 接至节点 $A$，[[net_r2|电阻 $R_2 = 12\ \Omega$]] 接于节点 $A$ 与参考地之间，[[net_r3|电阻 $R_3 = 4\ \Omega$]] 接于节点 $A$ 与输出端 $a$ 之间，另有一[[net_is|独立电流源 $I_s = 1\text{ A}$]] 由参考地向上注入输出端 $a$。[[rl|可变负载电阻 $R_L$]] 跨接在[[port_ab|端口 $a\text{–}b$]] 之间。`,
        },
        { kind: 'p', text: '**求解目标**：' },
        {
          kind: 'ol',
          items: [
            R`为使 $R_L$ 获得最大功率，$R_L$ 应取多大阻值？此时最大功率 $p_{\max}$ 是多少？`,
            R`分别计算当 $R_L = 0.5 R_{Th}$ 与 $R_L = 2 R_{Th}$ 时的负载功率与传输效率，验证曲线偏态规律。`,
          ],
        },
        { kind: 'figure', svg: SVG_ACT3, caption: '图 3-1：先摘除 R_L 求端口 a–b 左侧戴维南等效，再求最大功率' },
        { kind: 'p', text: '**3.3 三段式标准求解板书**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: R`先断开负载 $R_L$，使端口 $a\text{–}b$ 处于开路状态。独立源置零法则：将[[net_vs|电压源 $V_s$]] 短路、[[net_is|电流源 $I_s$]] 开路，从端口 $a\text{–}b$ 向左看入求[[rth|等效内阻 $R_{Th}$]]。叠加定理（或节点电压法）：分别计算 $V_s$ 单独作用与 $I_s$ 单独作用在开路端口 $a\text{–}b$ 产生的电压，代数相加得 [[vth|$V_{Th}$]]。应用最大功率传输定理：令 $R_L = R_{Th}$ 求 $p_{\max}$，并对比偏离匹配点后的功率与效率。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula）',
          tex: R`\begin{gathered} R_{Th} = (R_1 \parallel R_2) + R_3 = \frac{R_1 R_2}{R_1 + R_2} + R_3 \\[4pt] V_{Th} = V_{Th1} + V_{Th2} = V_s \frac{R_2}{R_1 + R_2} + I_s \left(R_3 + \frac{R_1 R_2}{R_1 + R_2}\right) \\[4pt] R_{L,\text{opt}} = R_{Th}, \qquad p_{\max} = \frac{V_{Th}^2}{4 R_{Th}}, \\[4pt] p(R_L) = \left(\frac{V_{Th}}{R_{Th} + R_L}\right)^2 R_L, \qquad \eta(R_L) = \frac{R_L}{R_{Th} + R_L} \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            {
              label: 'Step 1',
              text: R`**求戴维南等效内阻 $R_{Th}$**（将 $12\text{ V}$ 电压源短路、$1\text{ A}$ 电流源开路）`,
              tex: R`\begin{gathered} R_1 \parallel R_2 = \frac{6 \times 12}{6 + 12} = \frac{72}{18} = 4\ \Omega \\ R_{Th} = 4 + 4 = 8\ \Omega \end{gathered}`,
            },
            { label: 'Step 2', text: R`**求戴维南开路电压 $V_{Th}$**（采用叠加定理，端口 $a\text{–}b$ 开路）` },
            {
              label: 'Step 2a',
              text: R`**仅 $V_s = 12\text{ V}$ 作用（$I_s$ 开路）**：因端口 $a\text{–}b$ 开路，流过 $R_3 = 4\ \Omega$ 的电流为 $0$，其压降为 $0$，故 $V_{Th1}$ 等于节点 $A$ 的分压：`,
              tex: R`V_{Th1} = 12 \times \frac{12}{6 + 12} = 12 \times \frac{2}{3} = 8\text{ V}`,
            },
            {
              label: 'Step 2b',
              text: R`**仅 $I_s = 1\text{ A}$ 作用（$V_s$ 短路）**：$1\text{ A}$ 电流全部向左流经 $R_3 = 4\ \Omega$，再流入 $(R_1 \parallel R_2) = 4\ \Omega$ 到地，总输入电阻为 $4 + 4 = 8\ \Omega$：`,
              tex: R`V_{Th2} = 1 \times (4 + 4) = 8\text{ V}`,
            },
            { label: 'Step 2c', text: '**叠加求和**：', tex: R`V_{Th} = V_{Th1} + V_{Th2} = 8 + 8 = 16\text{ V}` },
            {
              label: 'Step 3',
              text: R`**求最大功率负载 $R_{L,\text{opt}}$ 与最大功率 $p_{\max}$**`,
              tex: R`\begin{gathered} R_{L,\text{opt}} = R_{Th} = 8\ \Omega \\ p_{\max} = \frac{V_{Th}^2}{4 R_{Th}} = \frac{16^2}{4 \times 8} = \frac{256}{32} = 8\text{ W} \end{gathered}`,
            },
            {
              label: 'Step 3 验算',
              text: R`（此时回路电流 $I_L = \dfrac{16}{8 + 8} = 1\text{ A}$，负载电压 $V_L = 8\text{ V}$，效率 $\eta = 50.00\%$。）`,
            },
            { label: 'Step 4', text: R`**对比 $R_L = 0.5 R_{Th} = 4\ \Omega$ 与 $R_L = 2 R_{Th} = 16\ \Omega$**` },
            {
              label: 'Step 4a',
              text: R`当 $R_L = 4\ \Omega$（$0.5 R_{Th}$）：`,
              tex: R`\begin{gathered} I_L = \frac{16}{8 + 4} = \frac{4}{3}\text{ A} \approx 1.333\text{ A}, \quad V_L = \frac{16}{3}\text{ V} \approx 5.333\text{ V} \\ p(4\ \Omega) = \left(\frac{4}{3}\right)^2 \times 4 = \frac{64}{9}\text{ W} \approx 7.111\text{ W} \ (88.89\%\ p_{\max}), \quad \eta = \frac{4}{8 + 4} = 33.33\% \end{gathered}`,
            },
            {
              label: 'Step 4b',
              text: R`当 $R_L = 16\ \Omega$（$2 R_{Th}$）：`,
              tex: R`\begin{gathered} I_L = \frac{16}{8 + 16} = \frac{2}{3}\text{ A} \approx 0.667\text{ A}, \quad V_L = \frac{32}{3}\text{ V} \approx 10.667\text{ V} \\ p(16\ \Omega) = \left(\frac{2}{3}\right)^2 \times 16 = \frac{64}{9}\text{ W} \approx 7.111\text{ W} \ (88.89\%\ p_{\max}), \quad \eta = \frac{16}{8 + 16} = 66.67\% \end{gathered}`,
            },
          ],
        },
        {
          kind: 'table',
          head: ['工况对比', R`$R_L$ ($\Omega$)`, R`$I_L$ (A)`, R`$V_L$ (V)`, R`负载功率 $P_L$ (W)`, '占峰值比例', R`效率 $\eta$`],
          rows: [
            [R`欠匹配 ($0.5 R_{Th}$)`, R`$4\ \Omega$`, R`$1.333\text{ A}$`, R`$5.333\text{ V}$`, R`$7.111\text{ W}$`, R`$88.89\%$`, R`$33.33\%$`],
            [R`**最佳匹配 ($1.0 R_{Th}$)**`, R`**$8\ \Omega$**`, R`**$1.000\text{ A}$**`, R`**$8.000\text{ V}$**`, R`**$8.000\text{ W}$**`, R`**$100.00\%$**`, R`**$50.00\%$**`],
            [R`过匹配 ($2.0 R_{Th}$)`, R`$16\ \Omega$`, R`$0.667\text{ A}$`, R`$10.667\text{ V}$`, R`$7.111\text{ W}$`, R`$88.89\%$`, R`$66.67\%$`],
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 4: the guided example (sheet §3.4) */
    {
      act_index: 4,
      badge: '第 3 幕 · 引导例题',
      title: '苏格拉底式分步引导例题——含双独立源网络的最大功率求解',
      sync: { layer: L1, halo: ['net_vs', 'net_is'], params: GD(0) },
      blocks: [
        {
          kind: 'p',
          text: R`以下为独立练习题（Sadiku 4.8 综合题型：$V_s = 18\text{ V}$ 经 $R_1 = 6\ \Omega$ 接至节点 $A$，$R_2 = 3\ \Omega$ 接节点 $A$ 至地，$I_s = 3\text{ A}$ 向上注入节点 $A$，$R_3 = 4\ \Omega$ 从节点 $A$ 接至端口 $a$；求使 $R_L$ 获得最大功率的阻值及 $p_{\max}$）。`,
        },
        {
          kind: 'guided',
          // all steps answered: the stage uncovers the example's numbers
          done_params: { reveal: 9 },
          title: '苏格拉底引导实战：含双独立源网络的最大功率求解',
          source: 'W2-L8-GD-01 · Alexander, Sadiku & Fredette (2026) Section 4.8 综合题型',
          problem: R`直流网络左侧包含：[[net_vs|18 V 电压源]]串联 [[net_r1|$R_1 = 6\ \Omega$]] 接至节点 A；[[net_r2|$R_2 = 3\ \Omega$]] 接于节点 A 与地之间；[[net_is|3 A 独立电流源]]由地向上注入节点 A；[[net_r3|$R_3 = 4\ \Omega$]] 串联在节点 A 与输出端 a 之间。[[port_ab|端口 a–b]] 接可变负载 [[rl|$R_L$]]。请逐步求得使 $R_L$ 获得最大功率的阻值及最大功率 $p_{\max}$。`,
          problem_svg: SVG_GD_PROBLEM,
          steps: [
            {
              title: '第一步：正确摘除负载并置零独立源',
              mini_svg: MINI_STEP1,
              question: R`要从端口 a–b 向左求戴维南等效电阻 $R_{Th}$，我们先把 $R_L$ 摘除。接下来处理 18 V 电压源和 3 A 电流源时，应该怎么做？`,
              hint: R`$V_s = 0 \implies \text{短路 (Short Circuit)}, \quad I_s = 0 \implies \text{开路 (Open Circuit)}$`,
              options: [
                {
                  text: '将 18 V 电压源短路，将 3 A 电流源开路',
                  correct: true,
                  feedback: '正确！电压源置零就是令两端电压为 0（两端等电位）——短路；电流源置零就是令通过的电流为 0——开路。',
                },
                {
                  text: '将 18 V 电压源开路，将 3 A 电流源短路',
                  correct: false,
                  feedback:
                    '停一下！你把独立源置零的物理含义记反了：电压源电压归零（V=0）意味着两端等电位，即【短路】；电流源电流归零（I=0）意味着没有电流通过，即【开路】。千万别把短路和开路弄反！',
                },
                {
                  text: '把 18 V 电压源和 3 A 电流源同时短路',
                  correct: false,
                  feedback: '如果把 3 A 电流源短路，节点 A 就会直接接地，把 R2 整条支路短接掉！电流源置零是令电流为 0，必须【开路】移去。',
                },
              ],
              board: [R`\text{Step 1: 摘除 } R_L,\; V_s \to \text{短路},\; I_s \to \text{开路}`],
              halo: ['net_vs', 'net_is'],
              params: GD(0),
            },
            {
              title: R`第二步：计算戴维南等效内阻 $R_{Th}$`,
              mini_svg: MINI_STEP2,
              question: R`独立源置零后，从端口 a–b 向左看入，$R_1 = 6\ \Omega$、$R_2 = 3\ \Omega$ 与 $R_3 = 4\ \Omega$ 的等效总电阻 $R_{Th}$ 是多少？`,
              hint: R`$R_{Th} = (R_1 \parallel R_2) + R_3 = \dfrac{6 \times 3}{6 + 3} + 4$`,
              options: [
                {
                  text: R`$R_{Th} = 13\ \Omega$`,
                  correct: false,
                  feedback:
                    '你是把 6 + 3 + 4 直接串联相加了吧？注意 18 V 电压源短路后，R1 左端和 R2 下端都连在参考地上，右端/上端都连在节点 A，因此 R1 与 R2 是【并联】关系，不是串联！',
                },
                {
                  text: R`$R_{Th} = 6\ \Omega$`,
                  correct: true,
                  feedback: R`漂亮！电压源短路后 $R_1$ 与 $R_2$ 并联：$6 \parallel 3 = 2\ \Omega$，再串上通往端口的 $R_3 = 4\ \Omega$，$R_{Th} = 6\ \Omega$。`,
                },
                {
                  text: R`$R_{Th} = 2\ \Omega$`,
                  correct: false,
                  feedback: '你算出了 R1 || R2 = 2 Ω，非常棒！但别忘了从端口 a 往里走，还得先经过串联在路上的 R3 = 4 Ω，所以总内阻是 2 + 4 = 6 Ω。',
                },
              ],
              board: [R`R_{Th} = (6 \parallel 3) + 4 = 2 + 4 = 6\ \Omega`],
              halo: ['net_r1', 'net_r2', 'net_r3'],
              params: GD(0),
            },
            {
              title: R`第三步：列写节点 A 方程求开路电压 $V_{Th}$`,
              mini_svg: MINI_STEP3,
              question: R`恢复 18 V 电压源与 3 A 电流源，保持端口 a–b 开路。流过 $R_3 = 4\ \Omega$ 的电流是多少？节点 A 的电压 $V_A$（即 $V_{Th}$）等于多少？`,
              hint: R`$\dfrac{V_A - 18}{6} + \dfrac{V_A}{3} = 3 \implies V_A - 18 + 2V_A = 18 \implies 3V_A = 36$`,
              options: [
                {
                  text: R`流过 $R_3$ 的电流为 3 A，因此 $V_{Th} = 12 - 3 \times 4 = 0\text{ V}$`,
                  correct: false,
                  feedback: R`看清电流源的位置！3 A 电流源接在节点 A，而端口 a–b 是【开路】的，电流根本没有回路从 R3 往右流出！所以 $I_{R_3} = 0$，R3 上压降为 0，直接有 $V_{Th} = V_A$。`,
                },
                {
                  text: R`流过 $R_3$ 的电流为 0，但漏掉了 3 A 电流源，算出 $V_{Th} = 6\text{ V}$`,
                  correct: false,
                  feedback: R`6 V 只是 18 V 电压源单独在 6 Ω 与 3 Ω 上分压的结果！别忘了还有 3 A 电流源注入节点 A，它在 (6 || 3) = 2 Ω 上还会额外抬升 3 × 2 = 6 V，合计 $V_{Th} = 6 + 6 = 12\text{ V}$。`,
                },
                {
                  text: R`流过 $R_3$ 的电流为 0，且 $V_{Th} = V_A = 12\text{ V}$`,
                  correct: true,
                  feedback: R`完全正确！端口开路，$R_3$ 上没有电流、没有压降，$V_{Th} = V_A$；节点 A 的 KCL 给出 $3V_A = 36$，$V_A = 12\text{ V}$。`,
                },
              ],
              board: [R`I_{R_3} = 0 \implies V_{Th} = V_A = 12\text{ V}`],
              halo: ['net_r3', 'net_is'],
              params: GD(1),
            },
            {
              title: R`第四步：应用最大功率传输条件确定 $R_L$`,
              mini_svg: MINI_STEP4,
              question: R`现在我们拿到了完整的戴维南等效参数：$V_{Th} = 12\text{ V}$，$R_{Th} = 6\ \Omega$。要让可变负载 $R_L$ 吸收最大功率，$R_L$ 应调到多大？`,
              hint: R`$R_{L,\text{opt}} = R_{Th}$`,
              options: [
                {
                  text: R`$R_L = 4\ \Omega$（等于端口旁边的 $R_3$）`,
                  correct: false,
                  feedback: R`常见陷阱！$R_L$ 必须匹配整个左侧网络的等效戴维南电阻 $R_{Th} = 6\ \Omega$，而不是只匹配离端口最近的那一颗电阻 $R_3 = 4\ \Omega$。`,
                },
                {
                  text: R`$R_L = R_{Th} = 6\ \Omega$`,
                  correct: true,
                  feedback: R`对！负载要匹配的是整个左侧网络的戴维南内阻：$R_{L,\text{opt}} = R_{Th} = 6\ \Omega$。`,
                },
                {
                  text: R`$R_L$ 越小越好（趋近 $0\ \Omega$）`,
                  correct: false,
                  feedback: R`如果 $R_L$ 趋近 0 Ω，虽然电流很大，但负载两端电压 $V_L$ 趋近 0 V，导致功率 $P_L = V_L I_L$ 归零！只有令 $R_L = R_{Th}$ 时功率才达到峰值。`,
                },
              ],
              board: [R`R_{L,\text{opt}} = R_{Th} = 6\ \Omega`],
              halo: ['rl', 'port_ab'],
              params: GD(2),
            },
            {
              title: R`第五步：计算最大传输功率 $p_{\max}$`,
              mini_svg: MINI_STEP5,
              question: R`将 $V_{Th} = 12\text{ V}$ 与 $R_{Th} = 6\ \Omega$ 代入最大功率公式，求得 $p_{\max}$ 是多少？`,
              hint: R`$p_{\max} = \dfrac{V_{Th}^2}{4 R_{Th}} = \dfrac{12^2}{4 \times 6}$`,
              options: [
                {
                  text: R`$p_{\max} = 24\text{ W}$`,
                  correct: false,
                  feedback: R`漏掉分母上的系数 4 啦！24 W 是 $V_{Th}^2 / R_{Th}$（即把全部 12 V 直接加在 6 Ω 上，完全忽略串联内阻的分压）。因为 $R_L = R_{Th}$ 时负载只分得一半电压（6 V），功率必须是 $(V_{Th}/2)^2 / R_{Th} = V_{Th}^2 / (4 R_{Th}) = 6\text{ W}$！`,
                },
                {
                  text: R`$p_{\max} = 12\text{ W}$`,
                  correct: false,
                  feedback: R`12 W 是电源 $V_{Th}$ 发出的【总功率】（$I_L = 1\text{ A}$，$P_{\text{total}} = 12\text{ V} \times 1\text{ A} = 12\text{ W}$）！记住匹配时效率只有 50%，其中一半（6 W）在内阻 $R_{Th}$ 上发热耗散，只有另一半（6 W）真正传给了负载 $R_L$。`,
                },
                {
                  text: R`$p_{\max} = 6\text{ W}$`,
                  correct: true,
                  feedback: R`满分通关！$p_{\max} = 12^2 / (4 \times 6) = 6\text{ W}$：负载分得一半电压 6 V、电流 1 A，电源发出的 12 W 一半给负载，一半在内阻上发热。`,
                },
              ],
              board: [R`p_{\max} = \frac{12^2}{4 \times 6} = \frac{144}{24} = 6\text{ W} \quad (\eta = 50\%)`],
              halo: ['pmax', 'pl'],
              params: GD(3, { rlT: 6 }),
            },
          ],
          conclusion: R`五步通关：$R_{Th} = 6\ \Omega$，$V_{Th} = 12\text{ V}$，$R_{L,\text{opt}} = 6\ \Omega$，$p_{\max} = 6\text{ W}$（$\eta = 50\%$）。点左侧 01 原理图上的「揭晓等效结果」，看匹配时 $I_L = 1\text{ A}$、$V_L = 6\text{ V}$ 与内阻发热 $P_{Th} = 6\text{ W}$ 的读数。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 5 (sheet act 4) */
    {
      act_index: 5,
      badge: '第 4 幕',
      title: '50% 效率的工程权衡——为什么电力电网绝不用最大功率传输？',
      sync: { layer: L2, halo: ['eta', 'pth'], params: theory() },
      blocks: [
        {
          kind: 'p',
          text: R`同学们，刚才我们在第三幕里算出了一个令人警醒的数字：当 $R_L = R_{Th}$ 时，[[eta|效率 $\eta$]] **恰好只有 $50\%$**！这意味着每往负载送出 $1\text{ W}$ 的有用功率，电源内阻 $R_{Th}$ 自己就要[[pth|白白烧掉 $1\text{ W}$ 的废热]]！`,
        },
        {
          kind: 'p',
          text: R`这就引出了整个电路学中最重要的工程分水岭：**什么时候该追求“最大功率（$R_L = R_{Th}$）”，什么时候必须追求“最高效率（$R_L \gg R_{Th}$）”？**`,
        },
        { kind: 'p', text: '**4.1 两大工程阵营的鲜明对比**' },
        {
          kind: 'table',
          head: ['维度', '阵营 A：小信号与通信系统（阻抗匹配）', '阵营 B：电力系统与大功率供电（高效率输电）'],
          rows: [
            [
              '**典型场景**',
              R`射频天线（$50\ \Omega$）、有线电视同轴电缆（$75\ \Omega$）、微弱传感器前端、音频功放与扬声器匹配`,
              '发电厂 → 变电站 → 城市电网、电动车电池包驱动电机、主板 DC-DC 稳压电源',
            ],
            [
              '**核心矛盾**',
              R`信号源功率极其微弱（微瓦 $\mu\text{W}$ 到毫瓦 $\text{mW}$ 级），怕信号被噪声淹没，必须“寸土必争”榨取最大功率（同时在高频下消除信号反射）`,
              R`传输功率高达兆瓦（$\text{MW}$）至吉瓦（$\text{GW}$）级，如果效率只有 $50\%$，意味着一半的发电量全变成热能，会瞬间烧毁发电机与输电线，且经济成本不可承受`,
            ],
            ['**设计准则**', R`**$R_L = R_{Th}$（最大功率匹配）**`, R`**$R_L \gg R_{Th}$（极低内阻供电）**`],
            [R`**传输效率 $\eta$**`, R`**$50\%$**（可接受，因为绝对发热量极小）`, R`**$> 90\% \sim 98\%$**（强制要求）`],
            ['**关键误区警报**', R`只有在 $R_{Th}$ **无法改变**时才令 $R_L = R_{Th}$；如果能降低 $R_{Th}$，功率还能进一步飙升！`, '绝不能为了“匹配”而人为增大发电机或输电线电阻！'],
          ],
        },
        { kind: 'figure', svg: SVG_ACT4, caption: '图 4-1：小信号阻抗匹配（η = 50%）vs. 电力电网高效率输电（η > 95%）' },
        { kind: 'p', text: '**4.3 教授必敲黑板：最容易掉进去的“反直觉”大坑**' },
        {
          kind: 'p',
          text: R`很多同学背完 $R_L = R_{Th}$ 后，看到一道题问：“**如果负载 $R_L$ 固定为 $8\ \Omega$ 不变，现在允许你修改电源内阻 $R_{Th}$，请问 $R_{Th}$ 设为多大时负载功率最大？**”——竟脱口而出“$R_{Th} = R_L = 8\ \Omega$”！`,
        },
        { kind: 'formula', title: '**大错特错！** 看公式：', tex: R`p = \left(\frac{V_{Th}}{R_{Th} + R_L}\right)^2 R_L` },
        {
          kind: 'ul',
          items: [
            R`当 **$R_{Th}$ 固定、调节 $R_L$** 时，$R_L$ 同时出现在分子和分母，存在折中峰值 $R_L = R_{Th}$；`,
            R`当 **$R_L$ 固定、调节 $R_{Th}$** 时，$R_{Th}$ **只出现在分母**！$R_{Th}$ 越小，分母越小，电流越大，负载功率严格单调递增——理想极限是 $R_{Th} \to 0$，此时负载拿满全部电压 $V_{Th}$，功率高达 $V_{Th}^2 / R_L$（是 $R_{Th}=R_L$ 时的 **4 倍**），效率直逼 **$100\%$**！`,
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 6 (sheet act 5) */
    {
      act_index: 6,
      badge: '第 5 幕',
      title: R`3D 面包板实操——拧动电位器捕捉 $6.25\text{ mW}$ 峰值`,
      sync: { layer: L3, halo: ['rl', 'vl', 'scale_note'], params: { mode: 'lab', rlB: 200, cam: 'bench', reveal: 9 } },
      blocks: [
        { kind: 'p', text: '理论推导完成，现在切换到左侧舞台 **Layer 03（03 3D 面包板拧电位器找最大功率实操）**，我们亲手在面包板上做一次真实实验！' },
        { kind: 'p', text: '**5.1 安全缩放说明**' },
        {
          kind: 'p',
          text: R`第三幕的理论例题中，$R_{Th} = 8\ \Omega < 100\ \Omega$、$V_{Th} = 16\text{ V}$，峰值功率高达 $8\text{ W}$、电流 $1\text{ A}$。实验室桌面常见的碳膜/金属膜电阻与旋转电位器额定功率仅为 $1/4\text{ W} = 250\text{ mW}$，[[scale_note|直接按原值搭建会在 $2$ 秒内冒烟烧毁]]！`,
        },
        { kind: 'p', text: R`因此，我们在 3D 面包板层执行标准 [[scale_note|**$\text{k}\Omega$ 级等比例安全缩放**]]：` },
        {
          kind: 'ul',
          items: [
            R`**电源电压**：[[vth|$V_{Th} = 5.0\text{ V}$]]（面包板红蓝电源轨标准 USB 稳压供电）`,
            R`**固定内阻**：[[rth|$R_{Th} = 1\text{ k}\Omega$]]（色环：**棕-黑-红-金**，额定 $250\text{ mW}$，即便负载完全短路，最大热功耗仅 $5^2 / 1000 = 25\text{ mW}$，留有 $10$ 倍安全裕量！）`,
            R`**可调负载**：[[rl|$0\text{–}10\text{ k}\Omega$ 线性旋转电位器（B10K）]]，将滑动端（Pin 2）与一侧固定端（Pin 3）[[pot_short|短接]]，接成安全的两脚可变电阻，防止旋转接触瞬间悬空。`,
          ],
        },
        {
          kind: 'calc',
          title: '理论预测峰值',
          steps: [
            { label: '匹配阻值', tex: R`R_{L,\text{opt}} = R_{Th} = 1.00\text{ k}\Omega` },
            {
              label: '峰值负载电压',
              text: R`[[vl|$V_{L,\text{opt}} = \dfrac{V_{Th}}{2} = 2.50\text{ V}$]]（**无需拆电路测电流，盯紧万用表电压读数是否到达电源一半即可！**）`,
            },
            { label: '峰值电流', tex: R`I_{L,\text{opt}} = \frac{5.0}{1000 + 1000} = 2.50\text{ mA}` },
            { label: '最大功率', tex: R`P_{\max} = \frac{V_{L,\text{opt}}^2}{R_{L,\text{opt}}} = \frac{2.50^2}{1000} = 6.25\text{ mW}` },
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`[[scale_note|**面包板安全与缩放规则**]]：若理论例题中 $R_{Th} < 100\ \Omega$（例如本课综合例题 $R_{Th} = 8\ \Omega$、$V_{Th} = 16\text{ V}$、$p_{\max} = 8\text{ W}$，若直接搭在普通 1/4 W 面包板电路上，电流达 1 A、热功耗超 1/4 W 电阻额定值 32 倍，会瞬间烧毁电阻与电位器），在 3D 面包板实操层必须进行等比例阻抗放大与安全降压缩放。`,
        },
        {
          kind: 'table',
          caption: R`安全缩放对照：阻值按 $R_L / R_{Th}$ 比例放大到 $\text{k}\Omega$ 级、电源降到 5 V——归一化功率曲线 $P_L / P_{\max}$ 与效率 $\eta$ 完全不变，峰值仍在 $R_L = R_{Th}$、$V_L = V_{Th} / 2$`,
          head: ['', '理论例题（教材原值）', '面包板安全值'],
          rows: [
            [R`$V_{Th}$`, '16.0 V', '5.0 V（台式可调直流电源 / USB 稳压）'],
            [R`$R_{Th}$`, '8 Ω', '1 kΩ（棕-黑-红-金，5%，1/4 W）'],
            [R`$R_L$`, '0.1–40 Ω', 'B10K 线性旋转电位器（0–10 kΩ，1/4 W），接成两脚可变电阻'],
            [R`匹配 $R_{L,\text{opt}}$ / $V_{L,\text{opt}}$`, '8 Ω / 8 V', '1 kΩ / 2.5 V'],
            [R`匹配电流 $I_{L,\text{opt}}$`, '1.0 A', '2.5 mA'],
            [R`峰值 $P_{\max}$`, '8.0 W', '6.25 mW'],
            [R`负载短路时 $R_{Th}$ 发热`, '32 W', '25 mW（额定 250 mW 的 1/10，10 倍裕量）'],
            ['判定', '不能直接上面包板（UNSAFE_FOR_RAW_BREADBOARD）', '面包板实操安全（SAFE_FOR_BREADBOARD_LAB）'],
          ],
        },
        { kind: 'p', text: '**5.2 面包板接线与测量拓扑图**' },
        { kind: 'figure', svg: SVG_ACT5, caption: '图 5-1：安全 kΩ 级戴维南实操（V_Th = 5 V, R_Th = 1 kΩ, B10K 电位器）' },
        {
          kind: 'table',
          caption: '左侧 03 层的逐孔接线（830 孔面包板：顶部红色 + 轨、底部蓝色 − 轨；a–e、f–j 同列竖通，e 与 f 之间是中央凹槽）',
          head: ['元件 / 导线', '起点', '终点', '作用'],
          rows: [
            ['[[vth|台式可调直流电源（5 V）]]', '+ 端子 / − 端子', '[[rail_pos|顶部 + 轨第 3 列]] / [[rail_neg|底部 − 轨第 3 列]]', R`提供 $V_{Th} = 5\text{ V}$`],
            ['红色跳线', '顶部 + 轨第 10 列', 'a10', '+5 V 引到第 10 列'],
            [R`[[rth|1 kΩ 电阻（$R_{Th}$）]]`, 'c10', 'c18', R`内阻 $R_{Th}$`],
            ['[[port_ab|橙色跳线]]', 'e18', '[[center_trench|f18（跨中央凹槽）]]', '连通端口 a 的上下两半'],
            ['[[rl|B10K 电位器]]', 'Pin 1 / 2 / 3 = j18 / j20 / j22', '—', R`Pin 1 接端口 a，作可调负载 $R_L$`],
            ['[[pot_short|绿色短接线]]', 'h20（Pin 2 滑动端）', 'h22（Pin 3）', '接成两脚可变电阻'],
            ['黑色跳线', 'g22（Pin 3）', '底部 − 轨第 27 列', 'Pin 3 接 GND（端口 b）'],
            ['[[vl|万用表（DC V 档）]]', '红表笔 b18（端口 a）', '黑表笔 底部 − 轨第 30 列', R`并联读 $V_L$`],
          ],
        },
        { kind: 'p', text: '**5.3 3D 实操实验记录表（标准参考数据）**' },
        {
          kind: 'p',
          text: R`请拖动 3D 面包板上的 [[rl|B10K 电位器旋钮]]，依次记录以下 6 个阻值挡位的[[vl|万用表电压 $V_L$]] 与[[pl|实时功率 $P_L = V_L^2 / R_L$]]，并与左侧 Layer 02 双图中的游标位置一一核对：`,
        },
        {
          kind: 'table',
          head: ['实验点', R`电位器阻值 $R_L$`, R`实测电压 $V_L$ (V)`, R`计算功率 $P_L = V_L^2/R_L$ (mW)`, R`传输效率 $\eta$`, '曲线位置观察'],
          rows: [
            ['1', R`$200\ \Omega$`, R`$0.833\text{ V}$`, R`$3.472\text{ mW}$`, R`$16.7\%$`, '左侧陡峭爬坡段'],
            ['2', R`$500\ \Omega$`, R`$1.667\text{ V}$`, R`$5.556\text{ mW}$`, R`$33.3\%$`, R`接近山顶（$88.9\%\ P_{\max}$）`],
            ['**3**', R`**$1000\ \Omega$ ($1\text{ k}\Omega$)**`, R`**$2.500\text{ V}$ ($V_{Th}/2$)**`, R`**$6.250\text{ mW}$ (峰值)**`, R`**$50.0\%$**`, '**唯一峰值匹配点**'],
            ['4', R`$2000\ \Omega$ ($2\text{ k}\Omega$)`, R`$3.333\text{ V}$`, R`$5.556\text{ mW}$`, R`$66.7\%$`, '右侧平缓下降（与点 2 同功率，效率翻倍）'],
            ['5', R`$5000\ \Omega$ ($5\text{ k}\Omega$)`, R`$4.167\text{ V}$`, R`$3.472\text{ mW}$`, R`$83.3\%$`, '与点 1 同功率，但效率飙升 5 倍'],
            ['6', R`$10000\ \Omega$ ($10\text{ k}\Omega$)`, R`$4.545\text{ V}$`, R`$2.066\text{ mW}$`, R`$90.9\%$`, '逼近高效率电压源供电区'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 03 层的仪器面板会记录你拧到过的最大 $P_L$（峰值历史）；点「记录当前数据点」把 $(R_L, V_L, P_L, \eta)$ 存下来，它们会[[samples|留在 02 曲线上]]。万用表读到 $2.50\text{ V} \pm 0.05\text{ V}$ 时，面板亮起绿色的「峰值锁定」。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 7: the diagnostic quiz */
    {
      act_index: 7,
      badge: '诊断测验',
      title: '诊断测验——四个高频概念陷阱',
      sync: { layer: L1, halo: [], params: theory() },
      blocks: [
        {
          kind: 'p',
          text: R`以下 4 道高区分度诊断题专门针对最大功率传输定理的核心概念陷阱设计（固定 $R_L$ 调 $R_{Th}$ 误区、电网为什么不匹配、右侧偏态工程容差、实验室半电压判据）。四题全部答对即通关本课。`,
        },
      ],
      inline_svg: SVG_QUIZ_ACT,
      figure_caption: '诊断测验的四个概念陷阱',
      quiz: [
        {
          id: 'w2l8_q1',
          concept: '固定 $R_L$ 时调 $R_{Th}$',
          review_act: 5,
          question: R`一个固定负载电阻 $R_L = 10\ \Omega$ 连接到一个戴维南电压源 $V_{Th} = 20\text{ V}$ 上，现在允许你自由调节电源的串联内阻 $R_{Th}$（范围 $1\ \Omega$ 至 $20\ \Omega$）。为了让这个 $10\ \Omega$ 负载吸收尽可能大的功率，$R_{Th}$ 应该设为多少？`,
          options: [
            {
              key: 'A',
              text: R`$R_{Th} = 10\ \Omega$（满足 $R_{Th} = R_L$ 最大功率传输条件）`,
              correct: false,
              feedback: R`这正是第 4 幕的“反直觉”大坑：$R_L = R_{Th}$ 是在 **$R_{Th}$ 固定、调 $R_L$** 时才成立的结论。本题反过来固定 $R_L$、调 $R_{Th}$，$R_{Th} = 10\ \Omega$ 时 $P_L = (20/20)^2 \times 10 = 10\text{ W}$，并不是最大。`,
            },
            { key: 'B', text: R`$R_{Th} = 1\ \Omega$（在允许范围内尽可能小）`, correct: true },
            {
              key: 'C',
              text: R`$R_{Th} = 20\ \Omega$（内阻越大电源输出能力越强）`,
              correct: false,
              feedback: R`内阻越大，分母 $R_{Th} + R_L$ 越大，电流越小，负载功率只会越低：$R_{Th} = 20\ \Omega$ 时 $P_L = (20/30)^2 \times 10 \approx 4.44\text{ W}$，是允许范围里最差的一档。`,
            },
            {
              key: 'D',
              text: R`$R_{Th}$ 设为任意值，负载功率都一样`,
              correct: false,
              feedback: R`$P_L = \left(\dfrac{V_{Th}}{R_{Th} + R_L}\right)^2 R_L$ 里明明含有 $R_{Th}$：改变内阻就改变回路电流，负载功率当然跟着变。`,
            },
          ],
          feedback_correct: R`最大功率传输条件 $R_L = R_{Th}$ 的前提是【$R_{Th}$ 固定、调节 $R_L$】。本题是【$R_L$ 固定、调节 $R_{Th}$】：由 $P_L = \left(\dfrac{V_{Th}}{R_{Th} + R_L}\right)^2 R_L$ 可知，$R_{Th}$ 仅出现在分母中！$R_{Th}$ 越小，分母越小，功率严格越大。当 $R_{Th} = 1\ \Omega$ 时 $P_L = (20/11)^2 \times 10 \approx 33.06\text{ W}$，远高于 $R_{Th} = 10\ \Omega$ 时的 $10\text{ W}$！`,
          feedback_wrong: R`先看清谁固定、谁在调：$R_{Th}$ 在 $P_L$ 的式子里出现在哪里？`,
          figure: SVG_Q1,
        },
        {
          id: 'w2l8_q2',
          concept: '50% 效率与电网',
          review_act: 5,
          question: '为什么国家电网和发电厂在向城市输电时，绝对不会让输电系统工作在“最大功率传输”状态？',
          options: [
            {
              key: 'A',
              text: '因为交流电不存在最大功率传输定理',
              correct: false,
              feedback: '交流电路同样有最大功率传输定理（负载阻抗取电源内阻抗的共轭时功率最大）。电网不用它，不是因为定理失效，而是因为匹配时的效率。',
            },
            {
              key: 'B',
              text: '因为最大功率传输状态下传输效率仅为 50%，意味着一半的发电功率会在发电机内阻和输电线路上变成废热，导致严重能源浪费和设备烧毁',
              correct: true,
            },
            {
              key: 'C',
              text: R`因为电网的负载电阻 $R_L$ 总是比发电机内阻 $R_{Th}$ 小得多`,
              correct: false,
              feedback: R`恰好说反了：电网正是靠 $R_L \gg R_{Th}$（发电机与线路内阻远小于用户负载）才做到 $\eta > 95\%$。`,
            },
            {
              key: 'D',
              text: '因为最大功率传输时负载电压过高，超过了绝缘极限',
              correct: false,
              feedback: R`匹配时 $V_L = V_{Th}/2$，负载只分到开路电压的一半——电压不是过高，而是偏低。`,
            },
          ],
          feedback_correct: R`当 $R_L = R_{Th}$ 时，效率 $\eta = R_L / (R_{Th} + R_L) = 50\%$，发电机与输电线自身消耗的废热等于送给用户的有用功。电力系统追求高效率（通常 $\eta > 95\%$），必须保持 $R_L \gg R_{Th}$。`,
          feedback_wrong: R`想一想：$R_L = R_{Th}$ 时，电源发出的功率有多少落在负载上、多少落在内阻上？`,
          figure: SVG_Q2,
        },
        {
          id: 'w2l8_q3',
          concept: '曲线右偏与选型',
          review_act: 2,
          question: R`某传感器前端戴维南等效内阻 $R_{Th} = 1\text{ k}\Omega$，由于标准电阻规格限制，你只能在 $R_L = 500\ \Omega$（$0.5 R_{Th}$）和 $R_L = 2\text{ k}\Omega$（$2 R_{Th}$）两个方案中二选一。从负载功率和电源效率两个维度综合评估，哪项判断正确？`,
          options: [
            {
              key: 'A',
              text: '两者获得的负载功率完全相同（均为峰值的 88.9%），但 2 kΩ 方案效率高达 66.7%（是 500 Ω 方案 33.3% 的两倍），功耗更低、更优',
              correct: true,
            },
            {
              key: 'B',
              text: '500 Ω 距离 1 kΩ 更近（仅差 500 Ω），因此 500 Ω 方案获得的负载功率远大于 2 kΩ 方案',
              correct: false,
              feedback: R`曲线“左陡右缓”，不能按阻值差的远近判断：代入 $P_L/P_{\max} = 4x/(1+x)^2$，$x = 0.5$ 与 $x = 2$ 都得 $8/9$，两方案功率相同。`,
            },
            {
              key: 'C',
              text: '2 kΩ 方案获得的负载功率更大，但效率更低',
              correct: false,
              feedback: R`两处都不对：两方案的功率一样大（都是 $88.9\%\ P_{\max}$）；而效率 $\eta = x/(1+x)$ 随 $R_L$ 增大，2 kΩ 方案的效率反而更高。`,
            },
            {
              key: 'D',
              text: '两个方案的功率与效率完全相同，任选其一即可',
              correct: false,
              feedback: R`功率确实相同，但效率不同：$x = 0.5$ 时 $\eta = 33.3\%$，$x = 2$ 时 $\eta = 66.7\%$，差了一倍。`,
            },
          ],
          feedback_correct: R`由归一化公式 $P_L / P_{\max} = 4x / (1+x)^2$，代入 $x = 0.5$ 与 $x = 2$ 均得到 $8/9 \approx 88.89\%$，这正是功率曲线“左陡右缓”的对数对称性；而效率 $\eta = x/(1+x)$ 在 $x = 2$ 时为 $66.7\%$，是 $x = 0.5$ 时（$33.3\%$）的两倍。`,
          feedback_wrong: R`把两个方案写成 $x = R_L / R_{Th}$，分别代入 $4x/(1+x)^2$ 与 $x/(1+x)$ 比一比。`,
          figure: SVG_Q3,
        },
        {
          id: 'w2l8_q4',
          concept: '半电压峰值判据',
          review_act: 6,
          question: R`在面包板实验中，一个电源模块的戴维南等效参数为 $V_{Th} = 10\text{ V}$、$R_{Th} = 1\text{ k}\Omega$。你在输出端接上一个可调电位器 $R_L$ 并用电压表监测 $V_L$。当你缓慢拧动电位器直到负载功率 $P_L$ 恰好达到最大值时，电压表读数 $V_L$ 和最大功率 $P_{\max}$ 分别是多少？`,
          options: [
            {
              key: 'A',
              text: R`$V_L = 10\text{ V}$，$P_{\max} = 100\text{ mW}$`,
              correct: false,
              feedback: R`10 V 是开路电压 $V_{Th}$（$R_L \to \infty$ 时才读到，此时没有电流、功率为 0）；100 mW 是 $V_{Th}^2 / R_{Th}$，漏掉了匹配时只分得一半电压。`,
            },
            { key: 'B', text: R`$V_L = 5\text{ V}$，$P_{\max} = 25\text{ mW}$`, correct: true },
            {
              key: 'C',
              text: R`$V_L = 5\text{ V}$，$P_{\max} = 50\text{ mW}$`,
              correct: false,
              feedback: R`$V_L = 5\text{ V}$ 对了，但 50 mW 是电源发出的总功率（$10\text{ V} \times 5\text{ mA}$）；其中一半在 $R_{Th}$ 上发热，负载只得 $5^2 / 1000 = 25\text{ mW}$。`,
            },
            {
              key: 'D',
              text: R`$V_L = 2.5\text{ V}$，$P_{\max} = 6.25\text{ mW}$`,
              correct: false,
              feedback: R`这是本课 3D 面包板 5 V 电源的数值。本题 $V_{Th} = 10\text{ V}$，峰值处 $V_L = V_{Th}/2$ 要按 10 V 来算。`,
            },
          ],
          feedback_correct: R`最大功率传输发生在 $R_L = R_{Th} = 1\text{ k}\Omega$ 时，根据分压定律 $V_L = V_{Th} / 2 = 5\text{ V}$；此时最大功率 $P_{\max} = V_{Th}^2 / (4 R_{Th}) = 10^2 / (4 \times 1000) = 0.025\text{ W} = 25\text{ mW}$（也可由 $V_L^2 / R_L = 5^2 / 1000 = 25\text{ mW}$ 交叉验证）。`,
          feedback_wrong: R`峰值处 $R_L = R_{Th}$：先用分压求 $V_L$，再用 $V_L^2 / R_L$ 求功率。`,
          figure: SVG_Q4,
        },
      ],
    },
  ],
};

export default W2_L8;
