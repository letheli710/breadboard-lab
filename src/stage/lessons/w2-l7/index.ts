// W2-L7 · 戴维南与诺顿定理（含受控源测试源法与面包板实测） (lesson sheet: docs/lessons/W2-L7.md).
// The professor's text of the six acts is reproduced from the sheet as written; [[id|…]] only links
// a term to the stage (the words are unchanged). Changes of form, none of wording:
// - `$$…$$` display formulas sit in the ② blue / ③ green cards (a lead-in sentence becomes the
//   card title); a bulleted ① runs as one paragraph; nested bullets (3.5 step 2, 5.2's two methods)
//   become ③ cards with one step per bullet; the 错误反例警示 of 3.4 splits the ③ card in two;
// - the sheet's JSON (guided example, quiz) is mapped onto types.ts: label_latex → option text in
//   $…$ (long ones split into words and TeX so they wrap), professor_intercept → feedback,
//   hint_latex → hint, board_append_latex → board; plain-text symbols in prompts and intercepts
//   (v_a, R_Th …) are set as TeX;
// - the sheet's breadboard_safety_and_scaling block (component table, rationale, short-circuit
//   warning) is shown in act 5; 6.3 (the developer checklist) is not lesson text and is left out,
//   so act 6's title drops "与工程落地清单"; the "`guided_derivation` JSON" / "`diagnostic_quiz`
//   JSON" tags are dropped from the 6.1 / 6.2 headings.
// Corrections: in the guided example's step 1, option C, "（向右向左为从 a 流向 1）" → "（向左，即从
// a 流向 1）". Added (the sheet has none): the hover map, the guided example's problem figure and
// conclusion, the 3.5 figure, the quiz figures and per-option feedback.
// Anti-spoiler: the guided example's circuit (0.25 v_x) is not one of the acts' worked examples,
// so no ③ calc had to move; while it is open the stage hides the guided circuit's answers (mask).

import { lazy } from 'react';
import type { StageLesson } from '../../types';
import { MINI, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_GUIDED, SVG_NEG, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './svgs';

const BlackboxLayer = lazy(() => import('./BlackboxLayer'));
const PortLineLayer = lazy(() => import('./PortLineLayer'));
const Bench3D = lazy(() => import('./Bench3D'));

const L1 = 'layer_01_2d_blackbox';
const L2 = 'layer_02_vi_characteristic';
const L3 = 'layer_03_3d_breadboard';

const R = String.raw;

const W2_L7: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: BlackboxLayer, [L2]: PortLineLayer, [L3]: Bench3D },
  lesson_meta: {
    lesson_id: 'W2-L7',
    world: 'World 2',
    title: '戴维南与诺顿定理（含受控源测试源法与面包板实测）',
    subtitle: 'Thevenin & Norton Theorems: Independent Sources, Dependent-Source Test Source Method, and Safe Breadboard Measurement',
    lesson_type: 'C',
    lesson_type_label: 'Type C · 经典拓扑 + 3D 面包板实测课',
    estimated_minutes: 55,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release（Alexander, Sadiku & Fredette）',
      sections: ["Section 4.5 Thevenin's Theorem", "Section 4.6 Norton's Theorem"],
    },
    textbook_supplement: "Introductory Circuit Analysis, 14th Ed.（Boylestad）· Chapter 9 Network Theorems — Thevenin's Black-Box Intuition",
    prerequisites: ['W1-L7 分压分流', 'W2-L1 节点分析法', 'W2-L5 叠加置零', 'W2-L6 电源变换'],
    learning_objectives: [
      '理解戴维南与诺顿黑盒等效的工程动机，能在负载反复变化时用等效模型秒算负载电流与电压。',
      '掌握 Case 1（纯独立源电路）通过独立源置零与串并联化简求解 $R_{Th}$ 的完整三段式推导。',
      R`掌握 Case 2（含受控源电路）的测试源法：保留受控源，在端口外加 $v_o = 1\text{ V}$ 或 $i_o = 1\text{ A}$ 求 $R_{Th} = v_o / i_o$，并用 $R_{Th} = v_{oc} / i_{sc}$ 交叉验算。`,
      '理解纯受控源网络中负等效电阻 $R_{Th} < 0$ 的物理意义与 $v_{oc} / i_{sc} = 0/0$ 失效边界。',
      R`掌握戴维南与诺顿等效电路的互换关系及端口 $v\text{–}i$ 特性直线的截距与斜率几何意义。`,
      R`掌握 Type C 面包板 $1000\times$ 阻抗安全缩放原则，以及真实实验室中半压法与带载双点法测 $R_{Th}$ 的安全操作规范。`,
    ],
    next_lesson: 'W2-L8',
    next_lesson_title: '最大功率传输定理',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 2D 黑盒等效步骤图',
        short: '01 黑盒等效',
        render_mode: 'SVG_2D_INTERACTIVE',
        caption: '分步展示拆负载 → 测 v_oc → 独立源置零 / 外加 1V 测试源求 R_Th → 接回可变负载 R_L 的拓扑动画与节点高亮。',
      },
      {
        id: L2,
        label: '02 戴维南↔诺顿端口特性线',
        short: '02 端口特性线',
        render_mode: 'SVG_2D_PLOT_INTERACTIVE',
        caption: '交互式端口 v-i 特性曲线：展示纵截距 V_Th、横截距 I_N、斜率 -R_Th，拖动负载 R_L 滑块实时移动负载线并读取工作点 (I_L, V_L)。',
      },
      {
        id: L3,
        label: '03 3D 面包板开路/带载实测',
        short: '03 3D 实测',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption:
          '基于 1000x 安全缩放后的 4 kΩ / 12 kΩ / 1 kΩ 面包板实景搭建，由台式可调直流电源（32 V）经导线供电，配可切换档位的 3D 数字万用表、可调电位器（半压法）与过载热感警示。',
      },
    ],
    hover_map: {
      hl_network: { label: '固定线性网络 A', desc: '负载以左 99% 固定不变的电路：独立源、受控源与线性电阻' },
      hl_port: { label: '端口 a–b', desc: '黑盒对外的唯一接口；等效只对端口外部（负载的电压、电流、功率）成立' },
      hl_load: { label: '负载 R_L', desc: '唯一在变的部分：先拆下求等效，最后再接回（6 Ω / 16 Ω / 36 Ω …）' },
      hl_voc: { label: '开路电压 v_oc = V_Th', desc: '拆掉负载后 a–b 之间的电压：Case 1 为 30 V，Case 2 为 20 V' },
      hl_rth: { label: '戴维南等效电阻 R_Th', desc: '独立源置零后从 a–b 看进去的电阻：Case 1 为 4 Ω，Case 2 为 10 Ω' },
      hl_thev: { label: '戴维南等效电路', desc: 'V_Th 串联 R_Th：接任何负载都有 I_L = V_Th / (R_Th + R_L)' },
      hl_norton: { label: '诺顿等效电路', desc: 'I_N 并联 R_N（R_N = R_Th）：Case 1 为 7.5 A 并联 4 Ω' },
      hl_vs: { label: '独立电压源 V_s', desc: '外部激励：求 R_Th 时置零 → 短路（Case 1 为 32 V）' },
      hl_is: { label: '独立电流源 I_s', desc: '外部激励：求 R_Th 时置零 → 开路（Case 1 为 2 A，Case 2 为 5 A）' },
      hl_dep: { label: '受控源', desc: '电路内部的耦合关系（2v_x / 0.25v_x）：求 R_Th 时必须完整保留' },
      hl_vx: { label: '控制量 v_x', desc: 'R₂ 两端电压（上正下负），即 v_x = v₁' },
      hl_test: { label: '外加测试源 v_o = 1 V', desc: '独立源置零、受控源保留后，在 a–b 施加 1 V（a 正 b 负）' },
      hl_io: { label: '测试电流 i_o', desc: '测试源流入端口 a 的电流；R_Th = v_o / i_o' },
      hl_node1: { label: '节点 1（v₁）', desc: 'R₁、R₂、R₃ 与电流源的汇合点；Case 1、2 开路时 V_Th = v₁' },
      hl_r1: { label: 'R₁', desc: '原题 4 Ω；面包板 ×1000 → 4 kΩ（黄-黑-黑-棕-棕）' },
      hl_r2: { label: 'R₂', desc: 'Case 1 原题 12 Ω；面包板 ×1000 → 12 kΩ（棕-红-橙-金）' },
      hl_r3: { label: 'R₃', desc: '节点 1 到端口 a 的串联电阻；Case 1 原题 1 Ω → 面包板 1 kΩ（棕-黑-红-金）' },
      vi_line: { label: '端口特性直线', desc: 'v = V_Th − R_Th · i：网络对端口外部的全部信息' },
      vi_vth: { label: '纵截距 V_Th', desc: 'i = 0（开路）时 v = V_Th' },
      vi_in: { label: '横截距 I_N', desc: 'v = 0（短路）时 i = I_N = V_Th / R_Th' },
      vi_slope: { label: '斜率 −R_Th', desc: 'dv/di = −R_Th：直线越陡，内阻越大' },
      vi_load: { label: '负载线 v = R_L · i', desc: '过原点、斜率 R_L；拖动 R_L 滑块它会转动' },
      vi_q: { label: '工作点 Q (I_L, V_L)', desc: '端口特性线与负载线的唯一交点：接入 R_L 后的真实电流与电压' },
      lab_supply: { label: '台式可调直流电源（32 V）', desc: '放在实验台上，用红黑导线接到面包板顶部 + / − 电源轨；V_s = 32 V 缩放后严格不变' },
      lab_isrc: { label: '2 mA 恒流源模块', desc: '原题 I_s = 2 A ÷ 1000：从参考地向上把 2 mA 注入节点 1（第 17 列）' },
      lab_pot: { label: '10 kΩ 精密多圈电位器', desc: '半压法的可变负载：调到 V_L = V_Th / 2 = 15.00 V 时 R_L = R_Th' },
      lab_rl6k: { label: '已知负载 R_L = 6 kΩ', desc: '带载双点法：V_L = 18.00 V → R_Th = 6 × (30/18 − 1) = 4 kΩ' },
      lab_dmm: { label: '数字万用表', desc: 'DC V 档并联在 a–b 上读 V_Th / V_L；DC mA 档短接 a–b 读 I_N' },
      lab_scale: { label: '1000× 阻抗安全缩放', desc: '电阻 ×1000、电流源 ÷1000、电压源不变：V_Th 不变，R_Th ×1000，I_N 与功耗 ÷1000' },
      lab_short: { label: '短路测 I_N 安全警示', desc: '仅在 kΩ 级限流（I_N = 7.5 mA）时可用电流档直测；真实低阻电源严禁短接' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '黑盒等效直觉与戴维南定理公理',
      sync: { layer: L1, halo: ['hl_port', 'hl_load'], params: { case: 'c1', step: 'detach', mask: 'none' } },
      blocks: [
        {
          kind: 'p',
          text: "**教授开场白**：欢迎回到 Breadboard Lab！前两节课我们刚刚练熟了叠加定理的“独立源置零”以及电压源与电流源的“电源变换”。今天我们要迎来线性电路分析中**工程价值最高、考试区分度最大**的王牌工具——**戴维南定理（Thevenin's Theorem）与诺顿定理（Norton's Theorem）**。学完今天这一课，你不仅能把几十个元件的复杂网络打包成一个“黑盒”，更能彻底攻克电路学里最容易踩坑的硬骨头——**含受控源电路的测试源法**，并亲手在 3D 面包板上完成安全实测。",
        },
        { kind: 'p', text: '**1.1 为什么工程上离不开戴维南黑盒？（Boylestad Ch.9 坡度直觉）**' },
        {
          kind: 'p',
          text: R`设想你正在实验室里调试一台音频功放的输出级，或者给一块传感器主板匹配不同规格的[[hl_load|负载电阻 $R_L$]]。前面的供电与偏置网络包含 10 个电阻、3 个电源甚至晶体管受控源——这部分电路**已经焊死在 PCB 上、99% 固定不变**；唯一变化的是接在[[hl_port|输出端口 $a\text{–}b$]] 上的负载 $R_L$（你需要依次测试 $R_L = 6\ \Omega$、$16\ \Omega$、$36\ \Omega$ 甚至 50 个不同阻值）。`,
        },
        {
          kind: 'p',
          text: '如果每次换一个 $R_L$，你都要重新列一遍节点方程或网孔方程，工作量会爆炸。法国电报工程师 **Léon Charles Thévenin** 在 1883 年提出了一个极其优雅的洞察：',
        },
        {
          kind: 'p',
          text: R`**戴维南定理（Sadiku Section 4.5）**：任何由独立源、线性受控源和线性电阻构成的[[hl_network|**线性双端网络**]]，从外部负载端口 $a\text{–}b$ 看进去，对外电路的伏安特性都可以**完全等效**为一个独立电压源 $V_{Th}$ 与一个电阻 $R_{Th}$ 的串联组合：`,
        },
        {
          kind: 'ul',
          items: [
            R`[[hl_voc|**戴维南等效电压 $V_{Th}$**]]：等于将负载拆掉后，端口 $a\text{–}b$ 之间的**开路电压** $v_{oc}$（open-circuit voltage）。`,
            R`[[hl_rth|**戴维南等效电阻 $R_{Th}$**]]：等于将网络内部所有**独立源置零**后，从端口 $a\text{–}b$ 看进去的**等效输入电阻** $R_{in}$。`,
          ],
        },
        {
          kind: 'formula',
          title: R`一旦把前面 99% 固定不变的电路“打包”成 1 个 $V_{Th}$ 和 1 个 $R_{Th}$，无论后面怎么更换负载 $R_L$，负载电流和电压都只需一行串联分压/欧姆定律就能秒算：`,
          tex: R`I_L = \frac{V_{Th}}{R_{Th} + R_L}, \qquad V_L = V_{Th} \cdot \frac{R_L}{R_{Th} + R_L}`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授敲黑板（边界提醒）**：等效仅对[[hl_port|**端口 $a\text{–}b$ 外部**]]（即负载 $R_L$ 的电压、电流、功率）完全成立；黑盒**内部**的功率损耗并不等于原电路内部的实际功率损耗！`,
        },
        { kind: 'p', text: '**1.2 2D 黑盒等效四步流程图（左舞台 `01` 联动）**' },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '戴维南黑盒等效四步法（端口 a–b 外部完全等效）',
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: 'Case 1 纯独立源电路 — 独立源置零串并联法',
      sync: { layer: L1, halo: ['hl_vs', 'hl_is', 'hl_rth'], params: { case: 'c1', step: 'rth', mask: 'none' } },
      blocks: [
        {
          kind: 'p',
          text: '当黑盒内部**只有独立电源和线性电阻（不含任何受控源）**时，我们称其为 **Case 1**。此时回想我们在 `W2-L5 叠加置零` 中学过的铁律：',
        },
        {
          kind: 'ul',
          items: [
            R`[[hl_vs|独立电压源置零]] $\implies$ 电压为 $0\text{ V}$ $\implies$ **短路（Short Circuit）**；`,
            R`[[hl_is|独立电流源置零]] $\implies$ 电流为 $0\text{ A}$ $\implies$ **开路（Open Circuit）**。`,
          ],
        },
        { kind: 'p', text: R`置零后，整个黑盒退化成一个纯电阻网络，直接从端口 $a\text{–}b$ 往里看做串并联化简，即可得到 [[hl_rth|$R_{Th}$]]。` },
        { kind: 'p', text: '**2.1 Case 1 经典例题（Sadiku Section 4.5 Example 4.8 原题数值）**' },
        {
          kind: 'p',
          text: R`**题目**：如下图所示，左侧[[hl_vs|电压源 $V_s = 32\text{ V}$]] 串联 [[hl_r1|$R_1 = 4\ \Omega$]] 接至[[hl_node1|节点 $1$]]；节点 $1$ 对参考地接有 [[hl_r2|$R_2 = 12\ \Omega$]] 电阻，同时有一[[hl_is|独立电流源 $I_s = 2\text{ A}$]] 向上注入节点 $1$；节点 $1$ 经 [[hl_r3|$R_3 = 1\ \Omega$]] 接至输出端口 $a$，参考地直连端口 $b$。`,
        },
        {
          kind: 'ol',
          items: [
            R`求端口 $a\text{–}b$ 左侧网络的戴维南等效电路（$V_{Th}$ 与 $R_{Th}$）；`,
            R`利用戴维南等效电路，分别计算当负载 $R_L = 6\ \Omega$、$16\ \Omega$、$36\ \Omega$ 时的负载电流 $I_L$。`,
          ],
        },
        { kind: 'figure', svg: SVG_ACT2, caption: 'Case 1 经典例题（Sadiku Ex. 4.8）：原电路 vs 独立源置零求 R_Th' },
        { kind: 'p', text: '**2.2 三段式教授板书推导（Case 1）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: R`**求 $R_{Th}$**：依据戴维南定理 Case 1，网络中无受控源，将独立电压源置零（短路）、独立电流源置零（开路）后，由电阻串并联等效公理求端口看入电阻。**求 $V_{Th}$**：端口 $a\text{–}b$ 开路时，端口电流 $i_a = 0$，由欧姆定律可知串联电阻 $R_3$ 上无压降，故 $V_{Th} = v_a = v_1$。对节点 $1$ 应用基尔霍夫电流定律（KCL，流出电流之和等于流入电流之和）。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（General Formula）· 1. **等效电阻通式**：$R_1$ 与 $R_2$ 并联后再与 $R_3$ 串联：`,
          tex: R`R_{Th} = R_3 + \left(R_1 \parallel R_2\right) = R_3 + \frac{R_1 R_2}{R_1 + R_2}`,
        },
        { kind: 'formula', title: R`2. **开路电压通式**：节点 $1$ 的 KCL 方程为：`, tex: R`\frac{v_1 - V_s}{R_1} + \frac{v_1}{R_2} = I_s` },
        {
          kind: 'formula',
          title: R`移项合并 $v_1$ 项：`,
          tex: R`v_1 \left(\frac{1}{R_1} + \frac{1}{R_2}\right) = \frac{V_s}{R_1} + I_s \implies V_{Th} = v_1 = \frac{V_s R_2 + I_s R_1 R_2}{R_1 + R_2}`,
        },
        { kind: 'formula', title: R`3. **接回任意负载 $R_L$ 后的负载电流通式**：`, tex: R`I_L = \frac{V_{Th}}{R_{Th} + R_L}` },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            { label: '已知', text: R`$V_s = 32\text{ V}$，$I_s = 2\text{ A}$，$R_1 = 4\ \Omega$，$R_2 = 12\ \Omega$，$R_3 = 1\ \Omega$` },
            { label: R`1. **计算 $R_{Th}$**`, tex: R`R_{Th} = 1 + \frac{4 \times 12}{4 + 12} = 1 + \frac{48}{16} = 1 + 3 = 4\ \Omega` },
            { label: R`2. **计算 $V_{Th}$**`, tex: R`\frac{v_1 - 32}{4} + \frac{v_1}{12} = 2` },
            {
              label: R`两边同乘最小公倍数 $12$`,
              tex: R`\begin{gathered} 3(v_1 - 32) + v_1 = 24 \\ 3v_1 - 96 + v_1 = 24 \implies 4v_1 = 120 \implies v_1 = 30\text{ V} \end{gathered}`,
            },
            { label: R`由于开路时流过 $R_3 = 1\ \Omega$ 的电流为 $0$，因此`, tex: R`V_{Th} = v_{oc} = v_1 = 30\text{ V}` },
            { label: R`3. **体会黑盒威力：秒算三组不同负载 $R_L$**` },
            { label: R`当 $R_L = 6\ \Omega$ 时`, text: R`$I_L = \dfrac{30}{4 + 6} = 3\text{ A}$，$V_L = 3 \times 6 = 18\text{ V}$；` },
            { label: R`当 $R_L = 16\ \Omega$ 时`, text: R`$I_L = \dfrac{30}{4 + 16} = 1.5\text{ A}$，$V_L = 1.5 \times 16 = 24\text{ V}$；` },
            { label: R`当 $R_L = 36\ \Omega$ 时`, text: R`$I_L = \dfrac{30}{4 + 36} = 0.75\text{ A}$，$V_L = 0.75 \times 36 = 27\text{ V}$。` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: 'Case 2 含受控源电路 — 外加测试源法与负等效电阻剖析（核心必讲！）',
      sync: { layer: L1, halo: ['hl_dep', 'hl_test', 'hl_io'], params: { case: 'c2', step: 'rth', mask: 'none' } },
      blocks: [
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授红色警戒**：这是整门电路学考试中**失分率最高**的知识点！很多同学做完 Case 1 就形成肌肉记忆：“求 $R_{Th}$ 不就是把所有电源置零，然后直接串并联吗？” **错！大错特错！**`,
        },
        { kind: 'p', text: '**3.1 为什么受控源绝对不能置零？**' },
        {
          kind: 'p',
          text: '独立电源是外部施加的“固定激励”，置零意味着撤掉外部激励；而[[hl_dep|**受控源（Dependent Source）**]]本质上是放大器、晶体管、运放等内部物理器件的**耦合关系**，它受电路内部的电压或电流控制，**是电路结构的一部分**，绝不是外部激励！',
        },
        {
          kind: 'ul',
          items: [
            R`**铁律**：求 $R_{Th}$ 时，**只将所有独立源置零，必须完整保留所有受控源及其控制量**。`,
            '一旦保留了受控源，你就再也无法用简单的“串联/并联”公式直接看出端口电阻。怎么办？回到电阻最原始的定义——**欧姆定律**！',
          ],
        },
        { kind: 'p', text: '**3.2 外加测试源法（Test Source Method）**' },
        {
          kind: 'p',
          text: R`在将内部所有独立源置零、保留全部受控源后，我们像手持一台理想欧姆表一样，在端口 $a\text{–}b$ 人为接上一个已知的[[hl_test|外部测试源]]：`,
        },
        {
          kind: 'formula',
          title: R`**做法 A（外加测试电压源）**：在端口 $a\text{–}b$ 施加 $v_o = 1\text{ V}$（$a$ 正 $b$ 负），用节点分析或网孔分析求出**流入端口 $a$** 的[[hl_io|测试电流 $i_o$]]，则：`,
          tex: R`R_{Th} = \frac{v_o}{i_o} = \frac{1\text{ V}}{i_o}`,
        },
        {
          kind: 'formula',
          title: R`**做法 B（外加测试电流源）**：在端口 $a\text{–}b$ 注入 $i_o = 1\text{ A}$（流入端口 $a$），求出端口电压 $v_o = v_{ab}$，则：`,
          tex: R`R_{Th} = \frac{v_o}{i_o} = \frac{v_o}{1\text{ A}}`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**为什么可以随便选 $1\text{ V}$ 或 $1\text{ A}$？** 因为网络完全由线性元件构成（齐次性）：如果你把测试电压翻倍为 $v_o = 2\text{ V}$，电流 $i_o$ 也会严格翻倍，比值 $R_{Th} = v_o / i_o$ **绝对不变**！选 $1\text{ V}$ 或 $1\text{ A}$ 纯粹是为了让算术最简单。`,
        },
        { kind: 'p', text: '**3.3 Case 2 经典例题（含受控电压源，Sadiku Section 4.5 风格）**' },
        {
          kind: 'p',
          text: R`**题目**：如下图所示，左侧为[[hl_dep|受控电压源 $2v_x$]]（上正下负）串联 $R_1 = 4\ \Omega$ 接至节点 $1$；节点 $1$ 下接 $R_2 = 2\ \Omega$ 到参考地，[[hl_vx|控制量 $v_x$]] 定义为 $R_2$ 两端电压（上正下负，即 $v_x = v_1$）；同时有一独立电流源 $I_s = 5\text{ A}$ 向上注入节点 $1$；节点 $1$ 经 $R_3 = 6\ \Omega$ 接至端口 $a$，参考地直连端口 $b$。`,
        },
        {
          kind: 'p',
          text: R`请用**外加 $v_o = 1\text{ V}$ 测试源法**求端口 $a\text{–}b$ 左侧的戴维南等效电路，并用通用法 $R_{Th} = v_{oc}/i_{sc}$ 交叉验算。`,
        },
        { kind: 'figure', svg: SVG_ACT3, caption: 'Case 2 含受控源核心例题：原电路（求 V_Th） vs 外加 v_o = 1 V 测试源（求 R_Th）' },
        { kind: 'p', text: '**3.4 三段式教授板书推导（Case 2 测试源法）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: R`**求 $V_{Th}$**：端口 $a\text{–}b$ 开路时流过 $R_3$ 的电流为 $0$，故 $V_{Th} = v_a = v_1$。对节点 $1$ 列写 KCL，并代入受控源约束方程 $v_x = v_1$。**求 $R_{Th}$**：因网络含受控电压源 $\mu v_x$（$\mu = 2$），遵循 Case 2 原则：将独立电流源 $I_s$ 置零（开路），**保留受控电压源 $\mu v_x$**；在端口 $a\text{–}b$ 施加测试电压源 $v_o$（令 $v_a = v_o$），联立节点 $1$ 的 KCL 与端口支路欧姆定律求出流入端口电流 $i_o$，由 $R_{Th} = v_o / i_o$ 定出等效电阻。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（General Formula）· 1. **开路电压 $V_{Th}$ 通式**（$v_x = v_1$）：`,
          tex: R`\frac{v_1 - \mu v_1}{R_1} + \frac{v_1}{R_2} = I_s \implies v_1 \left(\frac{1 - \mu}{R_1} + \frac{1}{R_2}\right) = I_s \implies V_{Th} = \frac{I_s R_1 R_2}{(1 - \mu)R_2 + R_1}`,
        },
        {
          kind: 'formula',
          title: R`2. **外加测试电压源 $v_o$ 时的节点 $1$ KCL 通式**（$I_s = 0$，$v_a = v_o$，$v_x = v_1$）：`,
          tex: R`\frac{v_1 - \mu v_1}{R_1} + \frac{v_1}{R_2} + \frac{v_1 - v_o}{R_3} = 0`,
        },
        { kind: 'formula', title: R`解出 $v_1$：`, tex: R`v_1 \left(\frac{1 - \mu}{R_1} + \frac{1}{R_2} + \frac{1}{R_3}\right) = \frac{v_o}{R_3}` },
        {
          kind: 'formula',
          title: R`流入端口 $a$ 的测试电流 $i_o$ 与戴维南电阻通式：`,
          tex: R`i_o = \frac{v_o - v_1}{R_3}, \qquad R_{Th} = \frac{v_o}{i_o} = R_3 + \frac{R_1 R_2}{(1 - \mu)R_2 + R_1}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            { label: '已知', text: R`$\mu = 2$，$I_s = 5\text{ A}$，$R_1 = 4\ \Omega$，$R_2 = 2\ \Omega$，$R_3 = 6\ \Omega$` },
            {
              label: R`1. **计算开路电压 $V_{Th}$**`,
              tex: R`\begin{gathered} \frac{v_1 - 2v_1}{4} + \frac{v_1}{2} = 5 \\ -\frac{v_1}{4} + \frac{2v_1}{4} = 5 \implies \frac{v_1}{4} = 5 \implies v_1 = 20\text{ V} \end{gathered}`,
            },
            { label: '故', tex: R`V_{Th} = v_{oc} = 20\text{ V}` },
            {
              label: R`2. **外加测试源 $v_o = 1\text{ V}$ 计算 $R_{Th}$**（$I_s = 5\text{ A}$ 开路，保留 $2v_x$）`,
              tex: R`\frac{v_1 - 2v_1}{4} + \frac{v_1}{2} + \frac{v_1 - 1}{6} = 0`,
            },
            { label: '先化简前两项', text: R`$-\dfrac{v_1}{4} + \dfrac{v_1}{2} = \dfrac{v_1}{4}$，方程变为：`, tex: R`\frac{v_1}{4} + \frac{v_1 - 1}{6} = 0` },
            { label: R`两边同乘 $12$`, tex: R`3v_1 + 2(v_1 - 1) = 0 \implies 5v_1 = 2 \implies v_1 = 0.4\text{ V}` },
            { label: R`求流入端口 $a$ 的测试电流 $i_o$`, tex: R`i_o = \frac{v_o - v_1}{R_3} = \frac{1 - 0.4}{6} = \frac{0.6}{6} = 0.1\text{ A}` },
            { label: '因此，戴维南等效电阻为', tex: R`R_{Th} = \frac{v_o}{i_o} = \frac{1\text{ V}}{0.1\text{ A}} = 10\ \Omega` },
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**错误反例警示**：如果你把[[hl_dep|受控源 $2v_x$]] 误当成独立电压源短路掉，算出的结果是 $R_{\text{错}} = 6 + (4 \parallel 2) = 6 + \frac{4}{3} = 7.33\ \Omega \neq 10\ \Omega$！受控源的反馈效应将端口电阻从 $7.33\ \Omega$ 抬升到了 $10\ \Omega$。`,
        },
        {
          kind: 'calc',
          title: R`3. **通用法 $R_{Th} = v_{oc} / i_{sc}$ 交叉验算**`,
          steps: [
            {
              label: R`保留全部独立源与受控源，将端口 $a\text{–}b$ 短路（$v_a = 0$），列节点 $1$ 的 KCL`,
              tex: R`\frac{v_{1,\text{sc}} - 2v_{1,\text{sc}}}{4} + \frac{v_{1,\text{sc}}}{2} + \frac{v_{1,\text{sc}} - 0}{6} = 5 \implies \left(\frac{1}{4} + \frac{1}{6}\right)v_{1,\text{sc}} = 5 \implies \frac{5}{12}v_{1,\text{sc}} = 5 \implies v_{1,\text{sc}} = 12\text{ V}`,
            },
            {
              label: '端口短路电流',
              text: R`$i_{sc} = \dfrac{v_{1,\text{sc}}}{6} = \dfrac{12}{6} = 2\text{ A}$，于是：`,
              tex: R`R_{Th} = \frac{v_{oc}}{i_{sc}} = \frac{20\text{ V}}{2\text{ A}} = 10\ \Omega \quad \checkmark\text{（与测试源法完全一致！）}`,
            },
          ],
        },
        { kind: 'p', text: R`**3.5 深度拓展：当 $R_{Th} < 0$（负等效电阻）出现时意味着什么？**` },
        {
          kind: 'p',
          text: R`考虑一个**不含任何独立源、仅含受控源**的极简网络：端口 $a\text{–}b$ 之间并联一个 $R_1 = 4\ \Omega$ 电阻（向下流过电流 $i_x$）和一个受控电流源 $2i_x$（箭头向上指向端口 $a$）。`,
        },
        { kind: 'figure', svg: SVG_NEG, caption: '纯受控源网络：外加 v_o = 1 V，测试电流反向流出 → R_Th = −4 Ω' },
        {
          kind: 'ol',
          items: [
            R`**为什么通用法 $v_{oc}/i_{sc}$ 彻底失效？** 因为内部没有任何独立源，端口开路时 $v_{oc} = 0\text{ V}$，短路时 $i_{sc} = 0\text{ A}$，$R_{Th} = 0/0$ 无定义！**此时只能用测试源法！**`,
          ],
        },
        {
          kind: 'calc',
          title: R`2. **施加测试源 $v_o = 1\text{ V}$**`,
          steps: [
            { label: R`流下 $R_1$ 的控制电流`, text: R`$i_x = \dfrac{v_o}{R_1} = \dfrac{1}{4} = 0.25\text{ A}$；` },
            { label: '受控电流源向上注入端口 $a$ 的电流', text: R`$2i_x = 0.5\text{ A}$；` },
            { label: '端口 $a$ 的 KCL', text: R`$i_o + 2i_x = i_x \implies i_o = -i_x = -0.25\text{ A}$；` },
            { label: '等效电阻', tex: R`R_{Th} = \frac{v_o}{i_o} = \frac{1\text{ V}}{-0.25\text{ A}} = -4\ \Omega < 0` },
          ],
        },
        { kind: 'p', text: '3. **物理意义解读**：' },
        {
          kind: 'ul',
          items: [
            R`算出了负数，千万别以为自己算错了！$i_o = -0.25\text{ A}$ 意味着你在端口施加 $+1\text{ V}$ 正电压时，电流没有“被网络吸收”，反而从网络内部**向外倒灌流出**；`,
            R`按无源符号约定，网络吸收功率 $p = v_o i_o = (1\text{ V})(-0.25\text{ A}) = -0.25\text{ W} < 0$，即**内部有源受控源正在向外电路提供 $0.25\text{ W}$ 净功率**。`,
            '在真实模拟电子工程中，这种特性被称为**有源负阻（Active Negative Resistance）**，广泛用于运放负阻抗变换器（NIC）与正反馈振荡器中。',
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '诺顿定理与戴维南↔诺顿端口特性线',
      sync: { layer: L2, halo: ['vi_vth', 'vi_in', 'vi_q'], params: { case: 'c1', rl: 6, model: 'thev', mask: 'none' } },
      blocks: [
        { kind: 'p', text: '**4.1 诺顿定理（Sadiku Section 4.6）与对偶互换**' },
        { kind: 'p', text: '1926 年，贝尔实验室工程师 **Edward Lawry Norton** 提出了戴维南定理的电流源对偶版本：' },
        {
          kind: 'p',
          text: R`[[hl_norton|**诺顿定理**]]：任何线性双端网络从端口 $a\text{–}b$ 看进去，都可以等效为一个独立电流源 $I_N$ 与一个电阻 $R_N$ 的**并联**组合：`,
        },
        {
          kind: 'ul',
          items: [R`[[vi_in|**诺顿电流 $I_N$**]]：等于将端口 $a\text{–}b$ **短路**时的短路电流 $i_{sc}$；`, R`**诺顿电阻 $R_N$**：与戴维南电阻**完全相同**，即 $R_N = R_{Th}$。`],
        },
        {
          kind: 'formula',
          title: '结合我们在 `W2-L6 电源变换` 中学过的互换公式，戴维南与诺顿等效电路完全是同一枚硬币的两面：',
          tex: R`V_{Th} = I_N R_{Th}, \qquad I_N = \frac{V_{Th}}{R_{Th}}, \qquad R_N = R_{Th}`,
        },
        {
          kind: 'p',
          text: R`以第 2 幕 Case 1 例题（$V_{Th} = 30\text{ V}$，$R_{Th} = 4\ \Omega$）为例，它的诺顿等效模型立即可得：$I_N = \frac{30}{4} = 7.5\text{ A}$，$R_N = 4\ \Omega$。`,
        },
        { kind: 'p', text: '**4.2 端口 $v\\text{–}i$ 特性直线（左舞台 `02` 联动）**' },
        {
          kind: 'formula',
          title: R`对戴维南等效电路的外部端口 $a\text{–}b$（设端口电压为 $v$，**流出**端口 $a$ 进入负载的电流为 $i$）列写 KVL：`,
          tex: R`v = V_{Th} - R_{Th} \cdot i`,
        },
        { kind: 'p', text: R`这条方程在 $(i, v)$ 平面上是一条清晰的[[vi_line|向下倾斜直线]]：` },
        {
          kind: 'ul',
          items: [
            R`[[vi_vth|**纵轴截距（$i = 0$，开路）**]]：$v = V_{Th} = 30\text{ V}$；`,
            R`[[vi_in|**横轴截距（$v = 0$，短路）**]]：$i = \dfrac{V_{Th}}{R_{Th}} = I_N = 7.5\text{ A}$；`,
            R`[[vi_slope|**直线斜率**]]：$\dfrac{\mathrm{d}v}{\mathrm{d}i} = -R_{Th} = -4\ \Omega$；`,
            R`[[vi_q|**实际工作点**]]：在图上画出[[vi_load|负载线 $v = R_L i$]]，两条直线的唯一交点 $(I_L, V_L)$ 就是接入该负载后的真实电流与电压！`,
          ],
        },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '戴维南 ↔ 诺顿对偶互换与端口 v–i 特性直线（Case 1：V_Th = 30 V，R_Th = 4 Ω，I_N = 7.5 A）',
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: R`3D 面包板安全缩放与真实实验室 $R_{Th}$ 实测法（Type C 实操核心）`,
      sync: { layer: L3, halo: ['lab_supply', 'lab_scale'], params: { lab: 'open', scale: 'safe', pot: 10, cam: 'bench' } },
      blocks: [
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授实验室安全训话**：在纸上算题用 $4\ \Omega$、$12\ \Omega$、$1\ \Omega$ 非常痛快，但如果你直接拿这三颗电阻插上实验室的面包板，再把[[lab_supply|直流电源]]拧到 $32\text{ V}$——**恭喜你，三秒内实验室就会飘起烤焦电阻的蓝烟！**`,
        },
        { kind: 'p', text: R`**5.1 面包板安全与 $1000\times$ 阻抗缩放铁律**` },
        { kind: 'p', text: '我们来算一笔真实的功耗账（以第 2 幕 Sadiku Example 4.8 原题数值为例）：' },
        { kind: 'p', text: '**原题直接搭建的毁灭性后果**：' },
        {
          kind: 'ul',
          items: [
            R`哪怕端口 $a\text{–}b$ 开路，节点电压 $v_1 = 30\text{ V}$，电阻 [[hl_r2|$R_2 = 12\ \Omega$]] 的功耗就高达 $P_{R_2} = \dfrac{30^2}{12} = 75\text{ W}$！`,
            R`若端口 $a\text{–}b$ 短路测 $I_N = 7.5\text{ A}$，节点电压 $v_{1,\text{sc}} = 7.5\text{ V}$，电阻 [[hl_r1|$R_1 = 4\ \Omega$]] 功耗飙升至 $P_{R_1} = \dfrac{(32-7.5)^2}{4} = 150.06\text{ W}$，[[hl_r3|$R_3 = 1\ \Omega$]] 功耗高达 $56.25\text{ W}$！而实验室常见的色环碳膜电阻额定功率只有 $0.25\text{ W}$（$250\text{ mW}$），超载高达 **600 倍**！`,
          ],
        },
        {
          kind: 'p',
          text: R`[[lab_scale|**Type C 黄金缩放法则（等比例放大 $1000\times$ 至 $\text{k}\Omega$ 级）**]]：因为原题阻值 $< 100\ \Omega$，在 3D 面包板实测层必须将**所有电阻等比例放大 $1000\times$**（$4\ \Omega \to 4\text{ k}\Omega$、$12\ \Omega \to 12\text{ k}\Omega$、$1\ \Omega \to 1\text{ k}\Omega$），同时保持电压源 $V_s = 32\text{ V}$ 不变、将独立电流源同比例缩小 $1000\times$（$2\text{ A} \to 2\text{ mA}$）。`,
        },
        {
          kind: 'table',
          head: ['物理量', 'Sadiku 原题理论值', R`3D 面包板 $1000\times$ 安全缩放值`, '缩放规律与安全意义'],
          rows: [
            [
              R`支路电阻 $R_1, R_2, R_3$`,
              R`$4\ \Omega,\ 12\ \Omega,\ 1\ \Omega$`,
              R`$4\text{ k}\Omega,\ 12\text{ k}\Omega,\ 1\text{ k}\Omega$`,
              R`全部放大 $1000\times$ 至 $\text{k}\Omega$ 级`,
            ],
            [R`独立电源 $V_s, I_s$`, R`$32\text{ V},\ 2\text{ A}$`, R`$32\text{ V},\ 2\text{ mA}$`, R`电压源不变，电流源缩小 $1000\times$`],
            [R`**开路电压 $V_{Th}$**`, R`**$30\text{ V}$**`, R`**$30\text{ V}$**`, '**严格不变！**'],
            [R`**等效电阻 $R_{Th}$**`, R`**$4\ \Omega$**`, R`**$4\text{ k}\Omega$**`, R`**同步放大 $1000\times$**`],
            [R`**短路电流 $I_N$**`, R`**$7.5\text{ A}$**`, R`**$7.5\text{ mA}$**`, '**缩小为毫安级安全电流**'],
            [R`极端短路最大功耗 $P_{R_1}$`, R`$150.06\text{ W}$（瞬间烧毁）`, R`$150.06\text{ mW}$（安全，$< 250\text{ mW}$）`, '保护实验箱电源与电阻不烧毁'],
          ],
        },
        {
          kind: 'table',
          caption:
            '元件缩放对照（等比例放大以保护实验箱，分压比/增益不变）：Sadiku 原题使用 1 Ω ~ 12 Ω 低阻值以简化手算；若直接按原阻值在 32 V 直流电源与面包板上搭建，短路及开路支路功率高达 56 W ~ 150 W，会瞬间烧毁 1/4 W 碳膜电阻并触发电源过流保护。',
          head: ['元件', '理论值', '面包板缩放值'],
          rows: [
            ['[[hl_r1|R1]]', '4 Ω', '4 kΩ (标准色环: 黄-黑-黑-棕-棕 或 3.9 kΩ + 100 Ω 串联)'],
            ['[[hl_r2|R2]]', '12 Ω', '12 kΩ (标准色环: 棕-红-橙-金)'],
            ['[[hl_r3|R3]]', '1 Ω', '1 kΩ (标准色环: 棕-黑-红-金)'],
            ['[[lab_supply|Vs (独立电压源)]]', '32 V', '32 V (严格不变)，由台式可调直流电源（32 V）经导线接入电源轨'],
            ['[[lab_isrc|Is (独立电流源)]]', '2 A', '2 mA (同步缩小 1000x，保证所有节点电压严格不变)'],
            ['[[lab_pot,lab_rl6k|RL (可变测试负载)]]', '6 Ω / 16 Ω / 36 Ω', '6 kΩ / 16 kΩ / 36 kΩ (或 10 kΩ 精密多圈电位器)'],
          ],
        },
        { kind: 'p', text: R`**5.2 真实实验室如何安全测量 $R_{Th}$？**` },
        {
          kind: 'p',
          text: R`在真实的黑盒电路（例如带有内部稳压器或受控源、且无法拆开置零电源的模块）上，**绝对不能把数字万用表拨到欧姆档直接插到带电端口 $a\text{–}b$ 上**（会烧表或读数错乱），也**不要在真实电源上直接用万用表电流档短路强测 $I_N$**（极易烧断万用表保险丝甚至击穿电源输出级；仅在像本课 $\text{k}\Omega$ 级限流保护、$I_N = 7.5\text{ mA}$ 时才安全）。工程上最标准、最安全的两大实测方法是：`,
        },
        {
          kind: 'calc',
          title: '1. [[lab_pot|**半压法（Half-Voltage Method）**]]',
          steps: [
            { label: 'Step 1', text: R`端口 $a\text{–}b$ 开路，用[[lab_dmm|万用表]]直流电压档测得 $V_{Th} = 30.00\text{ V}$；` },
            {
              label: 'Step 2',
              text: R`在端口 $a\text{–}b$ 接一只 $10\text{ k}\Omega$ 精密电位器作为可变负载 $R_L$，缓慢旋转旋钮，盯住万用表，直到端口电压恰好下降为开路电压的一半：`,
              tex: R`V_L = \frac{V_{Th}}{2} = 15.00\text{ V}`,
            },
            {
              label: 'Step 3',
              text: R`由串联分压原理 $V_L = V_{Th}\dfrac{R_L}{R_{Th} + R_L} = \dfrac{V_{Th}}{2}$，此时必然有 $R_L = R_{Th}$！将电位器从电路拆下（**断电测量！**），用欧姆档测得其阻值 $4.00\text{ k}\Omega$，即为 $R_{Th}$。`,
            },
          ],
        },
        {
          kind: 'calc',
          title: '2. [[lab_rl6k|**带载双点法（Two-Point Loaded Method）**]]',
          steps: [
            {
              label: 'Step 1',
              text: R`若手头没有电位器，只需找一颗已知阻值的安全负载电阻（例如 $R_L = 6\text{ k}\Omega$），接在端口 $a\text{–}b$ 上测得带载电压 $V_L = 18.00\text{ V}$；`,
            },
            {
              label: 'Step 2',
              text: '代入分压反推公式，全程零短路风险：',
              tex: R`R_{Th} = R_L \left(\frac{V_{Th}}{V_L} - 1\right) = 6\text{ k}\Omega \times \left(\frac{30}{18} - 1\right) = 6\text{ k}\Omega \times \frac{2}{3} = 4\text{ k}\Omega`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`[[lab_short|**短路测 $I_N$ 安全警示**]]：真实实验箱或未知内阻电源上，严禁直接用万用表电流档（mA/10A）短接输出端口强测短路电流 $I_N$，否则极易瞬间熔断万用表保险丝甚至损坏电源输出级；仅在确认电路已处于 $\text{k}\Omega$ 级限流保护（如本课缩放后 $I_N = 7.5\text{ mA}$）时方可安全测量。`,
        },
        {
          kind: 'p',
          text: '左侧 03 实测台上依次切换「开路测 V_Th」「半压法调 R_L」「带载双点法」「安全限流测 I_N」，再拨到「原题直插预警演示」看看 Ω 级阻值直接上 32 V 会发生什么。',
        },
      ],
      inline_svg: SVG_ACT5,
      figure_caption: '3D 面包板安全实测三步接线示意（1000× 缩放后：V_Th = 30 V，R_Th = 4 kΩ，I_N = 7.5 mA）',
    },

    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式分步引导例题与诊断测验',
      sync: { layer: L1, halo: ['hl_dep', 'hl_port'], params: { case: 'gd', step: 'detach', mask: 'all' } },
      blocks: [
        { kind: 'p', text: '**6.1 苏格拉底式分步引导例题（含受控源测试源法）**' },
        { kind: 'figure', svg: SVG_GUIDED, caption: '引导例题电路：V_s = 12 V，R₁ = R₂ = 4 Ω，R₃ = 2 Ω，端口 a 对地并联压控电流源 0.25v_x' },
        {
          kind: 'guided',
          // all steps answered: the stage uncovers the example's numbers
          done_params: { mask: 'none' },
          title: '含压控电流源（VCCS）电路的戴维南等效与测试源法',
          source: 'Sadiku Section 4.5 Case 2 — Dependent Source Test Source Method · 难度 Hard',
          problem: R`**本例题电路设定**（独立于第 3 幕例题的新拓扑，用于检验迁移掌握度）：左侧[[hl_vs|独立电压源 $V_s = 12\text{ V}$]] 串联 $R_1 = 4\ \Omega$ 接至节点 $1$；节点 $1$ 对地接 $R_2 = 4\ \Omega$（[[hl_vx|控制电压 $v_x$]] 标于 $R_2$ 两端，上正下负，即 $v_x = v_1$）；节点 $1$ 经 $R_3 = 2\ \Omega$ 接至端口 $a$；端口 $a$ 对参考地并联一个[[hl_dep|**压控电流源（VCCS）$0.25v_x$**]]（箭头向上指向端口 $a$）。求端口 $a\text{–}b$ 左侧的戴维南等效电路（$V_{Th}$ 与 $R_{Th}$）。`,
          steps: [
            {
              title: R`Step 1 · 开路状态下的端口节点 KCL：建立 $v_a$ 与 $v_1$ 的关系`,
              mini_svg: MINI[0],
              question: R`第一步求开路电压 $V_{Th} = v_a$。端口 $a\text{–}b$ 开路时，外部负载电流为 0。请对端口节点 $a$ 列写 KCL（注意流过 $R_3 = 2\ \Omega$ 的电流与受控电流源 $0.25\,v_x$ 共同汇聚在节点 $a$），由此判断 $v_a$ 与 $v_1$（即 $v_x$）的关系是：`,
              hint: R`$\text{节点 } a \text{ 的 KCL：}\frac{v_a - v_1}{2} - 0.25 v_x = 0,\quad \text{且 } v_x = v_1$`,
              options: [
                {
                  text: '$v_a = v_1$',
                  correct: false,
                  feedback: R`慢着！这里端口 $a$ 下面还并联着一个受控电流源 $0.25\,v_x$！即使端口 $a\text{–}b$ 开路，受控电流源发出的电流依然会向左倒流经过 $R_3 = 2\ \Omega$，所以 $R_3$ 上有压降，$v_a$ 不等于 $v_1$！`,
                },
                {
                  text: R`$v_a = 1.5\,v_1$`,
                  correct: true,
                  feedback: R`漂亮！端口 $a$ 的 KCL 为 $(v_a - v_1)/2 = 0.25\,v_1$，解得 $v_a - v_1 = 0.5\,v_1$，因此 $v_a = 1.5\,v_1$。`,
                },
                {
                  text: R`$v_a = 0.5\,v_1$`,
                  correct: false,
                  feedback: R`方向弄反了！受控电流源 $0.25\,v_x$ 箭头向上注入节点 $a$，流出到 $R_3$（向左，即从 $a$ 流向 $1$），所以 $v_a$ 必须高于 $v_1$，而不是低于 $v_1$。`,
                },
              ],
              board: [R`\text{Step 1 (节点 } a \text{ KCL): } \frac{v_a - v_1}{2} = 0.25 v_1 \implies v_a = 1.5\,v_1`],
              halo: ['hl_dep', 'hl_r3', 'hl_port'],
              params: { case: 'gd', step: 'voc', mask: 'all' },
            },
            {
              title: R`Step 2 · 联立节点 1 的 KCL，解出开路电压 $V_{Th}$`,
              mini_svg: MINI[1],
              question: R`现在对节点 1 列写 KCL：$(v_1 - 12)/4 + v_1/4 + (v_1 - v_a)/2 = 0$。将 Step 1 得到的 $v_a = 1.5\,v_1$ 代入后，开路电压 $V_{Th} = v_a$ 等于多少？`,
              hint: R`$\frac{v_1 - 12}{4} + \frac{v_1}{4} + \frac{-0.5 v_1}{2} = 0 \implies \frac{v_1 - 12}{4} = 0$`,
              options: [
                {
                  text: R`$V_{Th} = 12\text{ V}$`,
                  correct: false,
                  feedback: R`你只算到了一半！$v_1 = 12\text{ V}$ 没错，但端口开路电压是 $v_a = 1.5\,v_1$，别忘了最后一步乘以 1.5！`,
                },
                {
                  text: R`$V_{Th} = 18\text{ V}$`,
                  correct: true,
                  feedback: R`完全正确！代入 $v_a = 1.5\,v_1$ 后，节点 1 方程化简为 $(v_1 - 12)/4 + v_1/4 - v_1/4 = 0$，直接得出 $v_1 = 12\text{ V}$，进而 $V_{Th} = v_a = 1.5 \times 12 = 18\text{ V}$！`,
                },
                {
                  text: R`$V_{Th} = 6\text{ V}$`,
                  correct: false,
                  feedback: R`$6\text{ V}$ 是忽略受控源时 $4\ \Omega$ 与 $4\ \Omega$ 简单分压的结果。受控电流源会改变节点 1 的电流平衡，必须代入 $(v_1 - v_a)/2 = -0.25\,v_1$。`,
                },
              ],
              board: [
                R`\text{Step 2 (节点 } 1 \text{ KCL): } \frac{v_1 - 12}{4} + \frac{v_1}{4} - \frac{v_1}{4} = 0 \implies v_1 = 12\text{ V} \implies V_{Th} = 1.5 v_1 = 18\text{ V}`,
              ],
              halo: ['hl_node1', 'hl_voc'],
              params: { case: 'gd', step: 'voc', mask: 'all' },
            },
            {
              title: R`Step 3 · 准备求 $R_{Th}$：正确执行置零与外加测试源`,
              mini_svg: MINI[2],
              question: R`接下来求戴维南等效电阻 $R_{Th}$。因为电路中含有受控电流源 $0.25\,v_x$，下列哪一种操作是唯一正确的？`,
              hint: R`$\text{Case 2 铁律：独立源置零（电压源短路），受控源完整保留，端口外加 } v_o = 1\text{ V}$`,
              options: [
                {
                  text: R`把 $12\text{ V}$ 短路、把 $0.25\,v_x$ 开路，直接算 $R_{Th} = 2 + (4 \parallel 4) = 4\ \Omega$`,
                  correct: false,
                  feedback: R`踩中头号陷阱！$0.25\,v_x$ 是受控源，绝对不能开路置零！把受控源删掉相当于破坏了电路本身的物理结构，$4\ \Omega$ 是错误答案。`,
                },
                {
                  text: R`把 $12\text{ V}$ 短路、保留 $0.25\,v_x$，在端口 $a\text{–}b$ 外加测试电压源 $v_o = 1\text{ V}$ 求 $i_o$`,
                  correct: true,
                  feedback: R`教科书级标准操作！独立源置零（$12\text{ V}$ 短路），保留受控源 $0.25\,v_x$，在端口外加 $v_o = 1\text{ V}$ 测出流入端口电流 $i_o$。`,
                },
                {
                  text: R`保留 $12\text{ V}$ 与 $0.25\,v_x$，直接外加 $v_o = 1\text{ V}$ 求 $i_o$`,
                  correct: false,
                  feedback: R`别忘了先把独立电压源 $12\text{ V}$ 置零（短路）！若不置零，$i_o$ 会混入 $12\text{ V}$ 独立源产生的电流，$v_o/i_o$ 就不再是纯等效电阻。`,
                },
              ],
              board: [R`\text{Step 3 (Case 2 置零): } V_s = 0\text{ (短路)},\; \text{保留 } 0.25 v_x,\; \text{端口施加 } v_a = v_o = 1\text{ V}`],
              halo: ['hl_vs', 'hl_dep'],
              params: { case: 'gd', step: 'voc', mask: 'rth' },
            },
            {
              title: R`Step 4 · 在测试源 $v_o = 1\text{ V}$ 激励下求节点电压 $v_1$`,
              mini_svg: MINI[3],
              question: R`施加 $v_o = 1\text{ V}$（即 $v_a = 1\text{ V}$）且 $12\text{ V}$ 独立源已短路后，节点 1 通过 $4\ \Omega$ 到地、$4\ \Omega$ 到地、以及 $2\ \Omega$ 连接到 $v_a = 1\text{ V}$。请用节点 1 的 KCL 求出此时 $v_1$（即 $v_x$）的值：`,
              hint: R`$\frac{v_1}{4} + \frac{v_1}{4} + \frac{v_1 - 1}{2} = 0 \implies v_1 = 0.5\text{ V}$`,
              options: [
                {
                  text: R`$v_1 = 0.5\text{ V}$`,
                  correct: true,
                  feedback: R`极其敏锐！$v_1/4 + v_1/4 + (v_1 - 1)/2 = 0$ 化简为 $v_1 = 0.5\text{ V}$（也可以一眼看出 $4\ \Omega \parallel 4\ \Omega = 2\ \Omega$，与 $2\ \Omega$ 平分 $1\text{ V}$ 得 $0.5\text{ V}$）。`,
                },
                {
                  text: R`$v_1 = 0.25\text{ V}$`,
                  correct: false,
                  feedback: R`再核对一下方程：$v_1/4 + v_1/4 = v_1/2$，加上 $(v_1 - 1)/2 = 0$，合并得 $v_1 - 0.5 = 0$，所以 $v_1 = 0.5\text{ V}$ 而不是 $0.25\text{ V}$。`,
                },
                {
                  text: R`$v_1 = 1\text{ V}$`,
                  correct: false,
                  feedback: R`如果 $v_1 = 1\text{ V}$，流过 $2\ \Omega$ 的电流为 0，那两个 $4\ \Omega$ 支路下地的电流从哪来？不满足节点 1 的 KCL。`,
                },
              ],
              board: [R`\text{Step 4 (测试态节点 } 1 \text{): } \frac{v_1}{4} + \frac{v_1}{4} + \frac{v_1 - 1}{2} = 0 \implies v_1 = v_x = 0.5\text{ V}`],
              halo: ['hl_node1', 'hl_test'],
              params: { case: 'gd', step: 'rth', mask: 'rth' },
            },
            {
              title: R`Step 5 · 求流入端口的测试电流 $i_o$ 与最终 $R_{Th}$`,
              mini_svg: MINI[4],
              question: R`最后一步！已知 $v_a = v_o = 1\text{ V}$，$v_1 = v_x = 0.5\text{ V}$。对端口 $a$ 列写 KCL 求出由测试源流入端口 $a$ 的电流 $i_o$，进而计算 $R_{Th} = v_o / i_o$：`,
              hint: R`$i_o = \frac{1 - 0.5}{2} - 0.25(0.5) = 0.25 - 0.125 = 0.125\text{ A},\quad R_{Th} = \frac{1}{0.125}$`,
              options: [
                {
                  text: R`$i_o = 0.25\text{ A},\quad R_{Th} = 4\ \Omega$`,
                  correct: false,
                  feedback: R`你漏掉了向上注入端口 $a$ 的受控电流源 $0.25\,v_x = 0.125\text{ A}$！流向左方 $2\ \Omega$ 的总电流是 $0.25\text{ A}$，但其中一半（$0.125\text{ A}$）由受控源提供，测试源只需提供另外一半！`,
                },
                {
                  text: R`$i_o = 0.125\text{ A},\quad R_{Th} = 8\ \Omega$`,
                  correct: true,
                  feedback: R`满分通关！$i_o = (1 - 0.5)/2 - 0.25 \times 0.5 = 0.25 - 0.125 = 0.125\text{ A} = 1/8\text{ A}$，故 $R_{Th} = 1 / 0.125 = 8\ \Omega$！与短路口验算 $i_{sc} = 2.25\text{ A}$、$18 / 2.25 = 8\ \Omega$ 严丝合缝！`,
                },
                {
                  text: R`$i_o = 0.375\text{ A},\quad R_{Th} = 2.67\ \Omega$`,
                  correct: false,
                  feedback: R`符号加反了！受控电流源箭头向上流入节点 $a$，和测试电流 $i_o$ 方向相同（都在帮着往 $2\ \Omega$ 送电流），所以 $i_o = 0.25 - 0.125$，而不是相加。`,
                },
              ],
              board: [
                R`\text{Step 5 (最终结论): } i_o = 0.25 - 0.125 = 0.125\text{ A} \implies R_{Th} = \frac{1}{0.125} = 8\ \Omega \quad (V_{Th}=18\text{ V},\; I_N=2.25\text{ A})`,
              ],
              halo: ['hl_io', 'hl_dep', 'hl_test'],
              params: { case: 'gd', step: 'rth', mask: 'io' },
            },
          ],
          conclusion: R`最终答案：$V_{Th} = 18\text{ V}$，$R_{Th} = 8\ \Omega$，$I_N = 2.25\text{ A}$。左侧 01 舞台点“显示答案”，再切到「④ 接回负载 R_L」用滑块试几组负载。`,
        },
        { kind: 'p', text: '**6.2 高区分度诊断测验（4 题）**' },
      ],
      quiz: [
        {
          id: 'w2l7_q1',
          concept: '受控源不可置零',
          review_act: 3,
          question: R`某线性双端网络内部既包含独立电压源，又包含一个压控电压源 $2v_x$。在求端口 $a\text{–}b$ 的戴维南等效电阻 $R_{Th}$ 时，下列做法正确的是：`,
          options: [
            {
              key: 'A',
              text: '将独立电压源与受控电压源全部短路，直接对剩余电阻做串并联化简',
              correct: false,
              feedback: R`受控源 $2v_x$ 不是外部激励，而是电路内部器件的耦合关系；把它也短路，等于改掉了电路本身的结构，化简出来的电阻已不是这个网络的 $R_{Th}$。`,
            },
            { key: 'B', text: R`只将独立电压源短路，完整保留受控电压源 $2v_x$，再于端口外加测试源求 $v_o/i_o$`, correct: true },
            {
              key: 'C',
              text: R`保留独立电压源，将受控电压源开路后用串联分压求 $R_{Th}$`,
              correct: false,
              feedback: '两处都反了：独立电压源必须置零（短路），否则端口电流里混着它的贡献；受控源反而必须保留，把它开路同样破坏了电路结构。',
            },
            {
              key: 'D',
              text: '把独立电压源改为开路、受控电压源改为短路后再串并联',
              correct: false,
              feedback: '置零规则是“电压源 → 短路、电流源 → 开路”，而且只对独立源执行；这里把独立电压源开路、又把受控源短路，两步都不对。',
            },
          ],
          feedback_correct: R`受控源反映电路内部器件的线性耦合关系，绝不可置零。求 $R_{Th}$ 时只能将独立源置零（电压源短路、电流源开路），必须完整保留受控源并外加测试源求 $R_{Th} = v_o / i_o$。`,
          feedback_wrong: '回想第 3 幕的 Case 2 铁律：哪些源要置零，哪些源必须保留？',
          figure: SVG_Q1,
          sync: { layer: L1, halo: ['hl_dep'], params: { case: 'c2', step: 'detach', mask: 'none' } },
        },
        {
          id: 'w2l7_q2',
          concept: '测试源的齐次性',
          review_act: 3,
          question: R`在含受控源电路的测试源法中，教材常用 $v_o = 1\text{ V}$ 的测试电压源。如果某同学改用 $v_o = 2\text{ V}$ 的测试电压源，或者改用 $i_o = 1\text{ A}$ 的测试电流源，求得的 $R_{Th}$ 会如何变化？`,
          options: [
            {
              key: 'A',
              text: R`改为 $v_o = 2\text{ V}$ 时 $R_{Th}$ 变为原来的 2 倍`,
              correct: false,
              feedback: R`测试电压翻倍时，置零后线性网络里的所有响应都同步翻倍，$i_o$ 也跟着变成 2 倍，两者之比并没有变。`,
            },
            {
              key: 'B',
              text: R`改为 $i_o = 1\text{ A}$ 时 $R_{Th}$ 变为原来的倒数`,
              correct: false,
              feedback: R`换成测试电流源只是换了激励方式：注入 $i_o = 1\text{ A}$ 后测出的 $v_o$ 在数值上正好等于 $R_{Th}$，算的仍是 $v_o / i_o$，不会变成倒数。`,
            },
            { key: 'C', text: R`严格保持不变，因为置零后的线性网络满足齐次性，端口比值 $v_o / i_o$ 为常数`, correct: true },
            {
              key: 'D',
              text: '仅当电路中不含受控源时不变，含受控源时会随测试源幅值变化',
              correct: false,
              feedback: '线性受控源的输出与控制量成正比，本身就满足齐次性；含线性受控源的网络，端口比值照样与测试源幅值无关。',
            },
          ],
          feedback_correct: R`独立源置零后，由线性电阻和线性受控源构成的网络满足严格的线性齐次性：端口激励放大 $k$ 倍，端口响应同步放大 $k$ 倍，故比值 $R_{Th} = v_o / i_o$ 与测试源类型（电压源或电流源）及数值大小完全无关。`,
          feedback_wrong: '想一想齐次性：激励放大 k 倍，响应会怎样？',
          figure: SVG_Q2,
          sync: { layer: L1, halo: ['hl_test', 'hl_io'], params: { case: 'c2', step: 'rth', mask: 'none' } },
        },
        {
          id: 'w2l7_q3',
          concept: '1000× 安全缩放',
          review_act: 5,
          question: R`为了在 3D 面包板上安全复现 Sadiku Example 4.8（原题 $R_1 = 4\ \Omega$, $R_2 = 12\ \Omega$, $R_3 = 1\ \Omega$, $V_s = 32\text{ V}$, $I_s = 2\text{ A}$，理论值 $V_{Th} = 30\text{ V}$, $R_{Th} = 4\ \Omega$, $I_N = 7.5\text{ A}$），我们将所有电阻等比例放大 1000 倍至 $\text{k}\Omega$ 级，保持 $V_s = 32\text{ V}$ 不变并将 $I_s$ 缩小 1000 倍至 $2\text{ mA}$。缩放后以下哪项完全正确？`,
          options: [
            { key: 'A', text: R`$V_{Th}$ 严格不变（$30\text{ V}$），$R_{Th}$ 放大为 $4\text{ k}\Omega$，$I_N$ 缩小为 $7.5\text{ mA}$`, correct: true },
            {
              key: 'B',
              text: R`$V_{Th}$ 缩小 1000 倍（$30\text{ mV}$），$R_{Th}$ 放大为 $4\text{ k}\Omega$，$I_N$ 保持 $7.5\text{ A}$ 不变`,
              correct: false,
              feedback: R`电压源 $V_s$ 没变、所有电阻同比例放大、电流源同比例缩小，节点电压（含 $V_{Th}$）一个都不会变；而 $I_N = V_{Th}/R_{Th}$ 的分母放大了，不可能还是 $7.5\text{ A}$。`,
            },
            {
              key: 'C',
              text: R`$V_{Th}$、$R_{Th}$、$I_N$ 全部同步放大 1000 倍`,
              correct: false,
              feedback: R`三个量的缩放方向各不相同：$V_s$ 都没变，$V_{Th}$ 不可能凭空放大到 $30\text{ kV}$；$I_N$ 是电压除以电阻，电阻放大它只会缩小。`,
            },
            {
              key: 'D',
              text: R`$V_{Th}$ 严格不变（$30\text{ V}$），$R_{Th}$ 放大为 $4\text{ k}\Omega$，$I_N$ 也放大为 $7500\text{ A}$`,
              correct: false,
              feedback: R`前两项都对，但 $I_N = V_{Th} / R_{Th}$：分子不变、分母放大 1000 倍，$I_N$ 只能缩小 1000 倍，而不是放大。`,
            },
          ],
          feedback_correct: R`阻抗等比例放大 $k = 1000$ 倍（$R \to 1000R$，$V_s$ 不变，$I_s \to I_s/1000$）时，电路中所有节点电压（含开路电压 $V_{Th}$）严格不变；等效电阻 $R_{Th}$ 同步放大 1000 倍至 $4\text{ k}\Omega$；短路电流 $I_N = V_{Th} / R_{Th}$ 同步缩小 1000 倍至 $7.5\text{ mA}$ 安全毫安级。`,
          feedback_wrong: '分别看三个量：节点电压由什么决定？电阻放大后，电压除以电阻会怎样？',
          figure: SVG_Q3,
          sync: { layer: L1, halo: ['hl_r1', 'hl_r2', 'hl_r3'], params: { case: 'c1', step: 'detach', mask: 'none' } },
        },
        {
          id: 'w2l7_q4',
          concept: '负等效电阻',
          review_act: 3,
          question: R`某线性双端网络内部不含任何独立源，仅含线性电阻与受控源。在其端口外加测试电压源 $v_o = 1\text{ V}$（$a$ 正 $b$ 负），测得流入端口 $a$ 的电流为 $i_o = -0.25\text{ A}$，求得 $R_{Th} = -4\ \Omega$。下列说法正确的是：`,
          options: [
            {
              key: 'A',
              text: '等效电阻不可能为负，一定是列写 KCL 时正负号写反了',
              correct: false,
              feedback: R`负号没有写错：外加 $+1\text{ V}$ 时电流从网络里向外倒灌（$i_o < 0$），说明内部受控源在向外送功率——对含受控源的有源网络，$R_{Th} < 0$ 是真实特性。`,
            },
            {
              key: 'B',
              text: R`因为没有独立源，可以直接用 $R_{Th} = v_{oc} / i_{sc}$ 算出同样的 $-4\ \Omega$`,
              correct: false,
              feedback: R`恰恰相反：没有独立源时 $v_{oc} = 0$、$i_{sc} = 0$，$v_{oc}/i_{sc} = 0/0$ 无定义，通用法在这里失效。`,
            },
            {
              key: 'C',
              text: R`$R_{Th} = -4\ \Omega$ 物理上合理，表示外加正电压时内部受控源向外输出净功率（有源负阻）；且因 $v_{oc} = 0$, $i_{sc} = 0$，通用法失效，必须用测试源法`,
              correct: true,
            },
            {
              key: 'D',
              text: R`该网络的戴维南等效电压 $V_{Th} = -4\text{ V}$，诺顿电流 $I_N = 1\text{ A}$`,
              correct: false,
              feedback: R`网络里没有任何独立源，开路时端口上根本没有电压，短路时也没有电流；$-4\ \Omega$ 是电阻，不能当成 $V_{Th}$。`,
            },
          ],
          feedback_correct: R`不含独立源的纯受控源网络必然有 $V_{Th} = v_{oc} = 0$、$I_N = i_{sc} = 0$，因此 $v_{oc} / i_{sc} = 0/0$ 失效，只能使用测试源法；$R_{Th} < 0$ 表示外加正电压时电流倒灌流出，即网络内部受控源向外提供净功率，呈现有源负阻特性。`,
          feedback_wrong: '回到第 3 幕 3.5：没有独立源时 v_oc 和 i_sc 各是多少？i_o < 0 又说明了什么？',
          figure: SVG_Q4,
          sync: { layer: L1, halo: ['hl_test', 'hl_io'], params: { case: 'c2', step: 'rth', mask: 'none' } },
        },
      ],
    },
  ],
};

export default W2_L7;
