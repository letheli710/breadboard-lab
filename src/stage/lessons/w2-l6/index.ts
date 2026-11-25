// W2-L6 · 电源变换 (lesson sheet: docs/lessons/W2-L6.md).
// The professor's text of acts 1–5, the derivations, the sheet's five diagrams, the guided example
// (guided_derivation JSON) and the diagnostic quiz (diagnostic_quiz JSON) are reproduced from the
// sheet; [[id|…]] only links a term to the stage (the words are unchanged). Changes of form only:
// - the professor's opening (教授导语) opens act 1; sub-headings 1.1 … 4.3 are bold lines, without
//   the "（内联 2D SVG）" notes; each sheet SVG sits where the sheet puts it, as a figure;
// - display formulas sit in the ①/②/③ cards: a numbered lead-in becomes a card title or a calc
//   step label, two display lines of one formula share a card (gathered);
// - act 5's "请引导学习者独立完成…" (an instruction to the tutor) is addressed to the student;
//   plain-text symbols of the JSON parts (R_eq1, i_o …) are set as TeX;
// - act 5 / 6 titles drop the "（guided_derivation JSON）" / "（diagnostic_quiz JSON）与 Claude 前端工程
//   落地清单" notes: the engineering hand-off (6.1 architecture diagram, 6.3 checklist) is built
//   into the stage, not shown to the student.
// Added (the sheet has none): the guided example's problem line, praise for its right answers and
// the closing line; act 6's intro line and checkpoint diagram; feedback for each wrong quiz option
// (from the sheet's explanations); a diagram for each quiz question.

import { lazy } from 'react';
import type { StageLesson } from '../../types';
import { MINI_STEPS, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './svgs';

const BlackboxLayer = lazy(() => import('./BlackboxLayer'));
const MorphLayer = lazy(() => import('./MorphLayer'));
const PipelineLayer = lazy(() => import('./PipelineLayer'));

const L1 = 'layer_01_blackbox_probe';
const L2 = 'layer_02_source_morph';
const L3 = 'layer_03_reduction_pipeline';

const R = String.raw;

const guidedStep = (k: number) => ({ pl_circuit: 'guided', pl_step: k, pl_merge: true });

const W2_L6: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: BlackboxLayer, [L2]: MorphLayer, [L3]: PipelineLayer },
  lesson_meta: {
    lesson_id: 'W2-L6',
    world: 'World 2 · 网络分析与电路定理',
    title: '电源变换',
    subtitle: 'Source Transformation · 电路化简工具箱里最锋利的一把“变形手术刀”',
    lesson_type: 'B',
    lesson_type_label: 'Type B (纯公式/方法论课：端口等效原理与多级网络化简)',
    estimated_minutes: 35,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits (2026 Release)（Alexander, Sadiku & Fredette）',
      sections: ['Section 4.4 Source Transformation'],
    },
    textbook_supplement: 'Introductory Circuit Analysis (14th Ed.)（Boylestad）· Chapter 8',
    prerequisites: ['W1-L3 欧姆定律', 'W1-L7 串并联等效'],
    next_lesson: 'W2-L7',
    next_lesson_title: '戴维南与诺顿定理（含受控源测试源法与面包板实测）',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 端口等效黑盒验证 (Voc 与 Isc)',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '两个密封黑盒接同一个负载：拨动负载开关（开路 / 2 Ω / 短路），端口读数分毫不差；切到“内部功耗”，盒子里的电阻发热截然不同。',
      },
      {
        id: L2,
        label: '02 电压源↔电流源一键变形原理图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '点击电路一键变形：串联 R 摆进并联位置，+/− 变成箭头；翻转极性，箭头跟着 + 极走；切到受控源，红框锁住控制变量 v_x 支路。',
      },
      {
        id: L3,
        label: '03 多级逐层化简流水线',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '拖动步进滑块 0 … 4（或点击高亮的“下一刀”），逐步执行电源变换与串并联合并；红框里的待求支路一步都不动，它的电压 / 电流每一步都不变。',
      },
    ],
    hover_map: {
      box_a: { label: '黑盒 A（实际电压源）', desc: '内部：12 V 独立电压源与 4 Ω 串联，只伸出端口 a、b' },
      box_b: { label: '黑盒 B（实际电流源）', desc: '内部：3 A 独立电流源与 4 Ω 并联，只伸出端口 a、b' },
      port_ab: { label: '端口 a–b', desc: '外部负载唯一能感知的地方：端口电压 v 与流出端口的电流 i' },
      load: { label: '外部负载 R_L', desc: '同一个负载同时接在两个黑盒上：开路 / 2 Ω / 短路' },
      src_v: { label: '电压源 v_s', desc: '实际电压源模型：独立电压源配串联电阻 R' },
      src_i: { label: '电流源 i_s', desc: '实际电流源模型：独立电流源配并联电阻 R，i_s = v_s / R' },
      r_series: { label: '串联电阻 R（黑盒 A 内部）', desc: '端口开路时没有电流，功耗为 0' },
      r_parallel: { label: '并联电阻 R（黑盒 B 内部）', desc: '端口开路时 i_s 全部灌进它，功耗 i_s²R' },
      voc: { label: '开路电压 v_oc', desc: '端口悬空（i = 0）时的端口电压：伏安直线的纵截距' },
      isc: { label: '短路电流 i_sc', desc: '端口短接（v = 0）时的端口电流：伏安直线的横截距' },
      vi_line: { label: '端口伏安直线 v(i)', desc: 'v = v_s − iR 与 v = i_sR − iR：截距与斜率相同，两条直线重合' },
      p_internal: { label: '内部电阻功耗', desc: '变换前后不等：负载 2 Ω 时 16 W vs. 4 W，空载时 0 W vs. 36 W' },
      polarity_rule: { label: '方向铁律', desc: '电流源的箭头指向电压源的正极（+）那一端' },
      dep_src: { label: '菱形受控源', desc: '0.25 v_x（压控电流源）∥ 4 Ω ⟺ v_x（压控电压源）串联 4 Ω' },
      ctrl_vx: { label: '控制变量支路 2 Ω（v_x）', desc: '受控源的 v_x 定义在这颗电阻上：绝不能拿去变换' },
      red_box: { label: '红框隔离区', desc: '待求量或控制变量所在的支路：从头到尾一步都不许动' },
      target: { label: '待求支路（红框内）', desc: 'Sadiku 4.4：8 Ω 上的 v_o；引导例题：12 Ω 中的 i_o' },
      merge_series: { label: '串联合并', desc: '串联电压源代数相加，串联电阻直接相加' },
      merge_parallel: { label: '并联合并', desc: '并联电流源代数相加，并联电阻直接并联' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '端口等效黑盒直觉 — 外部负载的“盲测”与内外有别',
      sync: { layer: L1, halo: ['box_a', 'box_b'], params: { bb_load: 'open', bb_overlay: 'voc_isc' } },
      blocks: [
        {
          kind: 'note',
          tone: 'tip',
          text: '**教授导语（Breadboard Lab 课堂开场）**：欢迎回到 Breadboard Lab。上一阶段我们用节点电压法与网孔电流法硬刚复杂电路，但工程现场的电路分析讲究“降维打击”——与其一上来就列三阶、四阶线性方程组，不如先用结构等效把网络一层层压缩。今天这节 **W2-L6：电源变换**（对应 Sadiku 第 4.4 节与 Boylestad 第 8 章），就是电路化简工具箱里最锋利的一把“变形手术刀”：它能把串联结构瞬间翻成并联结构，再把并联结构翻回串联结构，让原本卡死的电阻与电源像拉链一样逐级合并。但请牢记一条铁律：**端口等效只对外部成立，内部元件不可等同，更绝不能把待求支路或受控源的控制变量支路给吞并掉。**',
        },
        { kind: 'p', text: R`**1.1 站在端口 $a\text{–}b$ 外面看：负载根本分不出黑盒里是谁**` },
        { kind: 'p', text: '想象实验台上有两个密封金属黑盒，每个盒子只伸出两个接线柱 **$a$** 和 **$b$**（Boylestad 第 8 章的经典直觉）：' },
        {
          kind: 'ul',
          items: [
            '[[box_a|**黑盒 A（实际电压源模型）**]]：内部是一个独立电压源 $v_s$ 与电阻 $R$ **串联**。',
            '[[box_b|**黑盒 B（实际电流源模型）**]]：内部是一个独立电流源 $i_s$ 与电阻 $R$ **并联**。',
          ],
        },
        {
          kind: 'p',
          text: R`无论你在外部[[port_ab|端口 $a\text{–}b$]] 之间接上什么[[load|负载 $R_L$]]（电阻、LED、甚至另一整块复杂网络），外部负载唯一能“感知”的物理量，只有端口电压 $v$ 与流出端口的电流 $i$。如果满足：`,
        },
        {
          kind: 'ol',
          items: [
            '**开路盲测一致**：端口悬空（$i = 0$）时，两盒测得的[[voc|开路电压 $v_{oc}$]] 完全相等；',
            '**短路盲测一致**：端口短接（$v = 0$）时，两盒测得的[[isc|短路电流 $i_{sc}$]] 完全相等；',
          ],
        },
        { kind: 'p', text: '那么由于内部都是线性元件，两者的[[vi_line|外部端口伏安特性直线完全重合]]——**外部世界彻底无法区分黑盒 A 和黑盒 B**。' },
        { kind: 'figure', svg: SVG_ACT1, caption: '端口等效黑盒对比图：实际电压源与实际电流源' },
        { kind: 'p', text: '**1.3 两条不可逾越的物理边界**' },
        { kind: 'p', text: '1. **理想源的不可变换性**：' },
        {
          kind: 'ul',
          items: [
            R`理想独立电压源没有串联电阻（$R = 0$），若强行计算等效电流源，会得到 $i_s = v_s / 0 \to \infty$，物理上不存在。`,
            R`理想独立电流源没有并联电阻（$R = \infty$），若强行计算等效电压源，会得到 $v_s = i_s \cdot \infty \to \infty$，同样不存在。`,
            R`**结论**：只有**非零有限电阻 $0 < R < \infty$** 与源相配（电压源串联 $R$、电流源并联 $R$），才能实施电源变换。`,
          ],
        },
        {
          kind: 'p',
          text: R`2. **内外有别原则**：电源变换保证的是**端口 $a\text{–}b$ 以外的所有电压、电流和功率完全不变**；但[[p_internal|黑盒内部那个电阻 $R$ 上的电流、电压以及发热功率]]，在变换前后**完全不同**！下一幕我们用板书严格证明这一点。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '三段式教授板书 — 端口伏安方程证明、极性铁律与内部功耗拆解',
      sync: { layer: L2, halo: ['polarity_rule'], params: { sm_kind: 'independent', sm_form: 'voltage', sm_pol: 'normal_up' } },
      blocks: [
        { kind: 'p', text: '**2.1 极性与箭头方向严格对应示意图**' },
        {
          kind: 'p',
          text: '很多同学公式背得滚瓜烂熟，一做题就差一个负号。核心原因只有一个：**没有把[[polarity_rule|电流源的箭头死死钉在电压源的正极（$+$）那一端]]**。请看下图正反两种极性的严格映射：',
        },
        { kind: 'figure', svg: SVG_ACT2, caption: '电压源极性与电流源箭头方向一一对应图' },
        { kind: 'p', text: '**2.2 三段式教授板书推导：端口等效性证明与内部功耗差异**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: R`设两黑盒端口 $a\text{–}b$ 的参考方向完全一致：端口电压 $v = v_{ab}$（$a$ 正 $b$ 负），端口流出电流为 $i$。`,
        },
        { kind: 'formula', title: '1. **对[[box_a|黑盒 A（串联模型）]]列 KVL**：', tex: R`-v_s + i R + v = 0 \implies v = v_s - i R` },
        {
          kind: 'ul',
          items: [R`令端口开路（$i = 0$），得开路电压：$v_{oc,\text{A}} = v_s$。`, R`令端口短路（$v = 0$），得短路电流：$i_{sc,\text{A}} = \frac{v_s}{R}$。`],
        },
        { kind: 'formula', title: '2. **对[[box_b|黑盒 B（并联模型）]]在节点 $a$ 列 KCL**：', tex: R`i_s = \frac{v}{R} + i \implies v = i_s R - i R` },
        {
          kind: 'ul',
          items: [R`令端口开路（$i = 0$），得开路电压：$v_{oc,\text{B}} = i_s R$。`, R`令端口短路（$v = 0$），得短路电流：$i_{sc,\text{B}} = i_s$。`],
        },
        {
          kind: 'p',
          text: R`3. **端口等效判定**：当且仅当 $v_s = i_s R$ 且两电阻同为 $R$ 时，两黑盒的端口伏安方程 $v(i)$ 具有完全相同的纵截距（$v_{oc}$）、横截距（$i_{sc}$）与斜率（$-R$），因此在端口 $a\text{–}b$ 外接任何负载时，端口电压 $v$ 与电流 $i$ 严格相等。`,
        },
        { kind: 'p', text: '4. **内部功耗不等效的符号证明**：考虑端口开路（$i = 0$）的极端工况：' },
        {
          kind: 'ul',
          items: [
            R`黑盒 A 内部串联电阻无电流通过，内部功耗 $P_{R,\text{A}} = i^2 R = 0$；`,
            R`黑盒 B 内部电流源的全部电流 $i_s$ 都灌入并联电阻 $R$，内部功耗 $P_{R,\text{B}} = i_s^2 R \neq 0$！`,
          ],
        },
        { kind: 'p', text: '可见：**外部端口完全等效，但内部能量耗散截然不同**。' },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula）',
          tex: R`\begin{gathered} v_s = i_s R, \qquad i_s = \frac{v_s}{R}, \qquad R_{\text{series}} = R_{\text{parallel}} = R \\[6pt] v = v_s - i R \;\Longleftrightarrow\; i = i_s - \frac{v}{R} \end{gathered}`,
        },
        {
          kind: 'p',
          text: R`**数值验证例题**：已知实际电压源 $v_s = 12\text{ V}$ 串联 $R_s = 4\ \Omega$，求其等效实际电流源；并对比外接负载 $R_L = 2\ \Omega$ 以及空载开路时，两者的外部负载功率与内部电阻功耗。`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            { label: '1. 计算等效电流源参数', tex: R`i_s = \frac{v_s}{R_s} = \frac{12}{4} = 3\text{ A}, \qquad R_p = R_s = 4\ \Omega` },
            { label: '极性', text: '[[polarity_rule|电流源箭头指向电压源正极端口 $a$]]。' },
            {
              label: R`2. 外接负载 $R_L = 2\ \Omega$ 时的外部与内部对比`,
              text: '**电压源模型（黑盒 A）**：',
              tex: R`\begin{gathered} i_L = \frac{v_s}{R_s + R_L} = \frac{12}{4 + 2} = 2\text{ A}, \qquad v_L = i_L R_L = 2 \times 2 = 4\text{ V} \\ P_L = v_L i_L = 4 \times 2 = 8\text{ W}, \qquad P_{R_s} = i_L^2 R_s = 2^2 \times 4 = 16\text{ W} \end{gathered}`,
            },
            {
              label: '电流源模型（黑盒 B）',
              tex: R`\begin{gathered} R_{\text{eq}} = R_p \parallel R_L = \frac{4 \times 2}{4 + 2} = \frac{4}{3}\ \Omega, \qquad v_L = i_s R_{\text{eq}} = 3 \times \frac{4}{3} = 4\text{ V} \\ i_L = \frac{v_L}{R_L} = \frac{4}{2} = 2\text{ A}, \qquad P_L = v_L i_L = 4 \times 2 = 8\text{ W} \\ P_{R_p} = \frac{v_L^2}{R_p} = \frac{4^2}{4} = 4\text{ W} \end{gathered}`,
            },
            {
              label: R`3. 空载开路（$R_L = \infty$）对比`,
              text: R`两盒端口开路电压均为 $v_{oc} = 12\text{ V}$；黑盒 A 内部功耗 $P_{R_s,\text{oc}} = 0\text{ W}$，而黑盒 B 内部功耗高达：`,
              tex: R`P_{R_p,\text{oc}} = i_s^2 R_p = 3^2 \times 4 = 36\text{ W}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授点睛**：负载端 $v_L = 4\text{ V}, i_L = 2\text{ A}, P_L = 8\text{ W}$ 分毫不差；[[p_internal|内部电阻功耗却是 $16\text{ W}$ vs. $4\text{ W}$（空载更是 $0\text{ W}$ vs. $36\text{ W}$）]]。以后任何考题问你“原电路中与源串联的电阻功率”，**绝不能用变换后的并联电阻来算**！`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '多级逐层化简流水线 — Sadiku 4.4 经典多电源网络实战',
      sync: { layer: L3, halo: ['red_box', 'target'], params: { pl_circuit: 'sadiku', pl_step: 0, pl_merge: true } },
      blocks: [
        { kind: 'p', text: '**3.1 动手前先画“红框隔离区”**' },
        { kind: 'p', text: '在 Sadiku Section 4.4 的多电源网络中，电源变换真正威力在于**串联↔并联交替折叠**：' },
        {
          kind: 'ul',
          items: [
            '[[merge_series|串联电压源可直接代数相加，串联电阻直接相加]]；',
            '[[merge_parallel|并联电流源可直接代数相加，并联电阻直接并联]]；',
            '唯一禁区：**在动第一刀之前，先用[[red_box|红色虚线框]]把[[target|待求量（例如 $v_o$）所在的支路]]彻底隔离锁定**。红框内的电阻，从头到尾一步都不许动！',
          ],
        },
        { kind: 'p', text: '**3.2 多级逐层化简演变原理图**' },
        { kind: 'p', text: R`下面我们用一张四阶段演变图，完整展示如何将经典的 Sadiku 4.4 多电源电路（求 $8\ \Omega$ 电阻两端电压 $v_o$）逐级压缩为单节点并联电路：` },
        { kind: 'figure', svg: SVG_ACT3, caption: 'Sadiku 4.4 多电源网络四步电源变换逐级化简演变图' },
        { kind: 'p', text: '**3.3 三段式教授板书推导：多电源网络逐级压缩**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: '多级电源变换的底层公理是 **KVL 的串联叠加性**、**KCL 的并联叠加性** 以及 **端口局部替换定理**：',
        },
        {
          kind: 'ul',
          items: [
            '当多组电阻和电源交替出现串联与并联时，单靠串并联电阻公式无法化简；',
            '通过将某支路的并联电流源翻成串联电压源，就能把被隔开的电阻拉进同一条串联链中相加；再翻回并联电流源，就能与邻近并联支路按 KCL 直接代数合并。',
            '只要[[target|待求支路 $R_o$]] 始终位于被替换子网络的外部，其端电压 $v_o$ 在每一步变换中都严格保持不变。',
          ],
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula）· [[merge_series|串联源与串联电阻合并]]：',
          tex: R`v_{\text{eq}} = \sum_{k} (\pm v_{sk}), \qquad R_{\text{ser}} = R_1 + R_2`,
        },
        {
          kind: 'formula',
          title: '[[merge_parallel|并联源与并联电阻合并]]：',
          tex: R`i_{\text{eq}} = \sum_{k} (\pm i_{sk}), \qquad R_{\text{par}} = R_1 \parallel R_2 = \frac{R_1 R_2}{R_1 + R_2}`,
        },
        {
          kind: 'formula',
          title: R`最终并联节点端电压（设净电流源 $i_{\text{net}}$ 向下流出顶部节点）：`,
          tex: R`v_o = -i_{\text{net}} \cdot \left(R_{\text{par}} \parallel R_o\right)`,
        },
        {
          kind: 'p',
          text: R`**题目（Sadiku Section 4.4 经典改编）**：如阶段 0 所示，左侧为 $12\text{ V}$ 电压源（上负下正）串联 $3\ \Omega$；中间红框支路为 $8\ \Omega$ 电阻（$v_o$ 上正下负）；桥接串联电阻 $2\ \Omega$；右侧为 $3\text{ A}$ 电流源（箭头向上）并联 $4\ \Omega$。用电源变换求 $v_o$。`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            {
              label: '第 1 步（右侧电流源 → 电压源）',
              text: R`将右侧 $3\text{ A}\uparrow$ 与 $4\ \Omega$ 并联支路变换为电压源串联 $4\ \Omega$：`,
              tex: R`v_{sR} = i_{sR} R_{R1} = 3 \times 4 = 12\text{ V} \quad (\text{正极朝上})`,
            },
            { label: '第 2 步（右侧串联电阻合并）', text: R`变换后的 $4\ \Omega$ 与桥接电阻 $2\ \Omega$ 形成纯串联：`, tex: R`R_R = 4 + 2 = 6\ \Omega` },
            {
              label: R`第 3 步（左右两侧同步转为电流源，红框 $8\ \Omega$ 纹丝不动）`,
              text: R`**左侧**（注意 $12\text{ V}$ 源上负下正，正极在底端！）：`,
              tex: R`i_{sL} = \frac{12}{3} = 4\text{ A} \quad (\text{箭头向下 } \downarrow), \qquad R_L = 3\ \Omega`,
            },
            {
              label: '第 3 步（续）',
              text: R`**右侧**（$12\text{ V}$ 源正极在顶端）：`,
              tex: R`i_{sR}' = \frac{12}{6} = 2\text{ A} \quad (\text{箭头向上 } \uparrow), \qquad R_R = 6\ \Omega`,
            },
            {
              label: '第 4 步（并联电流源与并联电阻合并）',
              text: R`合并并联电流源（向下为 $4\text{ A}$，向上为 $2\text{ A}$）：`,
              tex: R`i_{\text{net}} = 4 - 2 = 2\text{ A} \quad (\text{箭头向下 } \downarrow)`,
            },
            {
              label: '第 4 步（续）',
              text: R`合并红框以外的并联电阻 $3\ \Omega$ 与 $6\ \Omega$：`,
              tex: R`R_{\text{eq}} = 3 \parallel 6 = \frac{3 \times 6}{3 + 6} = \frac{18}{9} = 2\ \Omega`,
            },
            {
              label: R`第 5 步（单节点直接求解 $v_o$）`,
              text: R`此时仅剩 $2\text{ A}\downarrow$、$2\ \Omega$ 与红框内的 $8\ \Omega$ 三者并联。因 $v_o$ 与 $2\ \Omega$ 两端电压相同，先求并联总阻：`,
              tex: R`R_{\text{tot}} = 2 \parallel 8 = \frac{2 \times 8}{2 + 8} = \frac{16}{10} = 1.6\ \Omega`,
            },
            {
              label: '第 5 步（续）',
              text: R`由于 $2\text{ A}$ 电流源箭头向下（从顶部节点抽走电流），顶部节点电位低于底部参考节点：`,
              tex: R`v_o = -2 \times 1.6 = -3.2\text{ V}`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '受控源的电源变换 — “红框隔离区”与保护控制变量铁律',
      sync: { layer: L2, halo: ['red_box', 'ctrl_vx'], params: { sm_kind: 'dependent', sm_form: 'current', sm_pol: 'normal_up', sm_guard: true, sm_left: 'voltage' } },
      blocks: [
        { kind: 'p', text: '**4.1 受控源也能变，但控制变量支路是“高压红线”**' },
        { kind: 'p', text: '很多学生以为电源变换只适用于圆形的独立源。其实 **[[dep_src|菱形受控源]]（VCVS、CCVS、VCCS、CCCS）同样完全满足电源变换公式**！' },
        { kind: 'p', text: '但受控源多了一条生死红线（Sadiku Section 4.4 核心强调）：' },
        {
          kind: 'note',
          tone: 'warn',
          text: '**绝不能对包含[[ctrl_vx|控制变量（如 $v_x$ 或 $i_x$）]]的电阻/支路实施电源变换！** 一旦把控制变量所在的电阻从串联翻成并联，该电阻上的电压/电流就不再是原来的 $v_x$ 或 $i_x$，整个受控源的物理定义会被当场破坏。',
        },
        { kind: 'p', text: '**4.2 受控源电源变换与“[[red_box|红框隔离区]]”示意图**' },
        { kind: 'figure', svg: SVG_ACT4, caption: '受控源电源变换示意图：红框隔离控制变量 v_x 支路' },
        { kind: 'p', text: '**4.3 三段式教授板书推导：含受控源的电源变换**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: R`对于线性压控电流源 $i_d = g_m v_x$ 与电阻 $R_p$ 并联的二端网络，只要控制变量 $v_x$ 位于该二端网络的**外部**，对端口 $a\text{–}b$ 列 KCL 依然得到 $v = (g_m v_x) R_p - i R_p$。这与受控电压源 $v_d = (g_m R_p) v_x$ 串联电阻 $R_p$ 的端口方程完全一致。反之，若把包含 $v_x$ 的 $2\ \Omega$ 支路拿去变换，$v_x$ 所依附的物理电阻就会被拓扑改写，控制关系随即失效。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula）',
          tex: R`\begin{gathered} v_d = i_d R_p = (g_m v_x) R_p, \qquad i_d = \frac{v_d}{R_s} = \frac{\mu v_x}{R_s} \\[6pt] \text{约束条件：} R_{\text{ctrl}} \notin \text{被变换子网络（必须位于红框隔离区内）} \end{gathered}`,
        },
        {
          kind: 'p',
          text: R`**题目**：如上左图所示，左侧为 $16\text{ V}$ 独立电压源串联 $2\ \Omega$ 电阻（$v_x$ 定义在 $2\ \Omega$ 两端，左正右负）；右侧为压控电流源 $0.25 v_x$（箭头向上）并联 $4\ \Omega$ 电阻。用电源变换求 $v_x$。`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            {
              label: '1. [[red_box|红框锁定]]',
              text: R`$v_x$ 定义在 $2\ \Omega$ 电阻上，因此**绝不能**将左侧 $16\text{ V}$ 串联 $2\ \Omega$ 变换为 $8\text{ A} \parallel 2\ \Omega$。`,
            },
            {
              label: '2. 仅变换右侧受控电流源支路',
              text: R`将 $i_d = 0.25 v_x$（箭头向上）并联 $4\ \Omega$ 变换为受控电压源串联 $4\ \Omega$：`,
              tex: R`v_d = i_d \cdot R_p = (0.25 v_x) \times 4 = v_x \quad (\text{正极朝上})`,
            },
            { label: '3. 对变换后的单回路列 KVL', text: '设顺时针回路电流为 $i$：', tex: '-16 + 2i + 4i + v_x = 0' },
            {
              label: '4. 代入控制变量约束方程',
              text: R`由欧姆定律，$2\ \Omega$ 电阻上的电压为 $v_x = 2i$，代入 KVL：`,
              tex: R`-16 + 2i + 4i + 2i = 0 \implies 8i = 16 \implies i = 2\text{ A}`,
            },
            { label: '5. 求得目标量 $v_x$', tex: R`v_x = 2i = 2 \times 2 = 4\text{ V}` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '苏格拉底式分步引导例题',
      sync: { layer: L3, halo: ['target'], params: guidedStep(0) },
      blocks: [
        { kind: 'p', text: R`请独立完成下面这道 5 步级联网络化简题，求最右侧[[target|红框内 $12\ \Omega$ 电阻]]向下的电流 $i_o$：` },
        {
          kind: 'guided',
          title: R`五步电源变换流水线：求 $12\,\Omega$ 支路电流 $i_o$`,
          source: 'Sadiku Section 4.4 Practice Problem Style',
          problem: R`最左侧 $6\text{ A}$ 电流源（箭头向上）并联 $4\ \Omega$；顶部桥接串联 $4\ \Omega$；中间 $1\text{ A}$ 电流源（箭头向下）并联 $8\ \Omega$；最右侧红框内为 $12\ \Omega$，$i_o$ 向下流过。用多级电源变换求 $i_o$（左侧舞台 03 同步显示每一步，答对一步才前进一步）。`,
          problem_svg: SVG_ACT5,
          steps: [
            {
              title: '第 1 步 · 最左侧电流源 → 电压源',
              mini_svg: MINI_STEPS[0],
              question: '观察最左侧的 6A（向上）与 4Ω 并联支路，我们先把它变换为电压源串联电阻。变换后的电压源数值与极性是什么？',
              hint: R`$v_{s1} = i_{s1} R_1 = 6 \times 4$`,
              options: [
                {
                  text: '24 V（正极朝上）串联 4 Ω',
                  correct: true,
                  feedback: R`对！数值 $6 \times 4 = 24\text{ V}$，6 A 箭头朝上，所以正极（+）朝上；电阻仍是 4 Ω，只是从并联挪到了串联。`,
                },
                {
                  text: '1.5 V（正极朝上）串联 4 Ω',
                  correct: false,
                  feedback: R`停一下！你把乘法算成除法了。电流源变电压源时是 $v_s = i_s \cdot R$，不是 $i_s / R$。请重新核对量纲：A × Ω = V。`,
                },
                { text: '24 V（正极朝下）串联 4 Ω', correct: false, feedback: '极性反了！记住方向铁律：6 A 电流源箭头朝上，所以变换后电压源的正极（+）必须朝上。' },
              ],
              board: [R`\text{Step 1: } 6\,\text{A}\uparrow \parallel 4\,\Omega \implies v_{s1} = 6 \times 4 = 24\,\text{V}\,(+\text{上})\text{ 串联 } 4\,\Omega`],
              halo: ['merge_parallel'],
              params: guidedStep(0),
            },
            {
              title: '第 2 步 · 合并串联电阻',
              mini_svg: MINI_STEPS[1],
              question: R`现在左侧 24 V 源串联的 4 Ω 与中间顶部桥接的 4 Ω 串联在一起，合并后的等效电阻 $R_{\text{eq1}}$ 是多少？`,
              hint: R`$R_{\text{eq1}} = R_1 + R_2 = 4 + 4$`,
              options: [
                {
                  text: '2 Ω（并联合并）',
                  correct: false,
                  feedback: '看清连接方式！变换后左侧 4 Ω 已经在主干道上，与顶部 4 Ω 之间没有其他分叉支路，它们流过同一电流，是纯串联而非并联。',
                },
                { text: '8 Ω（串联相加）', correct: true, feedback: R`对！两颗 4 Ω 之间没有分叉，流过同一电流：$4 + 4 = 8\ \Omega$，左侧现在是 24 V 串联 8 Ω。` },
                { text: '4 Ω（保持不变）', correct: false, feedback: '不能忽略桥接的 4 Ω！把两个串联电阻合并成 8 Ω，才能为下一步转回电流源铺路。' },
              ],
              board: [R`\text{Step 2: } R_{\text{eq1}} = 4 + 4 = 8\,\Omega \quad (24\,\text{V 串联 } 8\,\Omega)`],
              halo: ['merge_series'],
              params: guidedStep(1),
            },
            {
              title: '第 3 步 · 电压源 → 电流源',
              mini_svg: MINI_STEPS[2],
              question: '为了与右侧并联的 1 A（向下）电流源和 8 Ω 电阻合并，我们将 24 V（正极朝上）串联 8 Ω 再变回电流源。结果是什么？',
              hint: R`$i_{s2} = \frac{v_{s1}}{R_{\text{eq1}}} = \frac{24}{8}$`,
              options: [
                { text: '3 A（箭头向上）并联 8 Ω', correct: true, feedback: R`对！$24 / 8 = 3\text{ A}$，正极在上方，所以箭头向上；8 Ω 从串联挪到并联。` },
                { text: '3 A（箭头向下）并联 8 Ω', correct: false, feedback: '箭头又指反了！24 V 电压源的正极在上方，所以变换出的 3 A 电流源箭头必须向上。' },
                { text: '192 A（箭头向上）并联 8 Ω', correct: false, feedback: '电压源变电流源用欧姆定律除法 $i = v / R$，不是乘法！24 / 8 = 3 A。' },
              ],
              board: [R`\text{Step 3: } 24\,\text{V}\,(+\text{上})\text{ 串 } 8\,\Omega \implies i_{s2} = \frac{24}{8} = 3\,\text{A}\uparrow \parallel 8\,\Omega`],
              halo: ['merge_series'],
              params: guidedStep(2),
            },
            {
              title: '第 4 步 · 合并并联支路（红框除外）',
              mini_svg: MINI_STEPS[3],
              question: '现在红框（12 Ω）左侧全是并联支路：3 A↑、8 Ω、1 A↓、8 Ω。请合并电流源与红框外电阻（严禁吞并 12 Ω！）。',
              hint: R`$i_{\text{net}} = 3 - 1 = 2\,\text{A}\uparrow, \quad R_p = 8 \parallel 8 = 4\,\Omega$`,
              options: [
                { text: '4 A（向上）并联 4 Ω', correct: false, feedback: '注意方向！3 A 向上、1 A 向下，方向相反应该相减（3 − 1 = 2 A↑），不是相加。' },
                { text: '2 A（向上）并联 4 Ω', correct: true, feedback: R`对！方向相反的电流源相减：$3 - 1 = 2\text{ A}\uparrow$；红框外的两颗 8 Ω 并联成 4 Ω，12 Ω 原封不动。` },
                {
                  text: '2 A（向上）并联 3 Ω（把 12 Ω 也并进去了）',
                  correct: false,
                  feedback: '触发红框警报！12 Ω 是待求电流 $i_o$ 所在的支路，绝不能把它并进等效电阻里，否则 $i_o$ 会直接消失！',
                },
              ],
              board: [R`\text{Step 4: } i_{\text{net}} = 3 - 1 = 2\,\text{A}\uparrow, \quad R_p = 8 \parallel 8 = 4\,\Omega`],
              halo: ['merge_parallel', 'target'],
              params: guidedStep(3),
            },
            {
              title: '第 5 步 · 分流求 $i_o$',
              mini_svg: MINI_STEPS[4],
              question: '现在电路已压缩为 2 A（向上）电流源给 4 Ω 与红框 12 Ω 两条并联支路分流。用分流公式求出 $i_o$！',
              hint: R`$i_o = i_{\text{net}} \cdot \frac{R_p}{R_p + 12} = 2 \times \frac{4}{4 + 12}$`,
              options: [
                { text: R`$i_o = 0.5\text{ A}$`, correct: true, feedback: R`漂亮！分流看对方：$i_o = 2 \times \frac{4}{4 + 12} = 0.5\text{ A}$，方向与参考方向一致，取正值。` },
                {
                  text: R`$i_o = 1.5\text{ A}$`,
                  correct: false,
                  feedback: '分流公式分子放反了！并联分流时，电阻越大分到的电流越小，分子应该放“另一条支路的电阻” 4 Ω，即 2 × 4 / (4 + 12)。',
                },
                {
                  text: R`$i_o = -0.5\text{ A}$`,
                  correct: false,
                  feedback: '检查方向：2 A 电流源向上注入顶部节点，随后向下流过 12 Ω 电阻，与 $i_o$ 的参考方向一致，所以是正值 +0.5 A。',
                },
              ],
              board: [R`\text{Step 5: } i_o = 2 \times \frac{4}{4 + 12} = \frac{8}{16} = 0.5\,\text{A}`],
              halo: ['target'],
              params: guidedStep(4),
            },
          ],
          conclusion: R`通关！$i_o = 0.5\,\text{A}$。从第 0 步到第 4 步，红框里的 $12\ \Omega$ 一刀未动，所以流过它的电流在每一级变换中都严格保持不变——现在可以在左侧舞台揭晓 $i_o$ 验证。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '高区分度诊断测验',
      sync: { layer: L2, halo: [], params: { sm_kind: 'independent', sm_form: 'voltage', sm_pol: 'normal_up' } },
      blocks: [
        {
          kind: 'p',
          text: '最后用 4 道高区分度诊断题检验今天的“变形手术刀”。每道题都对准一个高频误区：极性反转、吞并目标电阻、内部功耗误区与理想源边界。答错时回到对应的幕次，对照左侧舞台再选一次。',
        },
        { kind: 'figure', svg: SVG_ACT6, caption: '动手变换前的四个检查点（Q1–Q4）' },
      ],
      quiz: [
        {
          id: 'w2l6_q1',
          question: '某二端网络由一个 15 V 电压源（上端为负极 −，下端为正极 +）与一个 5 Ω 电阻串联而成，引出上端 a、下端 b。将其电源变换为等效电流源后，结果应为：',
          options: [
            {
              key: 'A',
              text: '3 A 电流源（箭头向上指向 a）并联 5 Ω',
              correct: false,
              feedback: '大小 3 A 没错，方向反了：这个电压源的正极（+）在下端 b，不在 a。电流源的箭头要钉在原电压源的正极那一端。',
            },
            { key: 'B', text: '3 A 电流源（箭头向下指向 b）并联 5 Ω', correct: true },
            {
              key: 'C',
              text: '75 A 电流源（箭头向下指向 b）并联 5 Ω',
              correct: false,
              feedback: '方向对了，大小算错：电压源变电流源用除法 $i_s = v_s / R$，不是乘法。核对量纲：V ÷ Ω = A，而 V × Ω 根本不是电流。',
            },
            {
              key: 'D',
              text: '3 A 电流源（箭头向下指向 b）串联 5 Ω',
              correct: false,
              feedback:
                '大小和方向都对，接法错了：电压源配**串联** R，变成电流源后同一个 R 必须改为**并联**。理想电流源再串一颗电阻，对外仍是恒定 3 A 的理想电流源，已经不是原来的实际电压源了。',
            },
          ],
          feedback_correct: R`电流源大小为 $i_s = 15 / 5 = 3\text{ A}$，电阻由串联转为并联仍为 5 Ω；因原电压源正极（+）在下端 b，根据“电流源箭头必须指向电压源正极”的铁律，箭头必须向下指向 b。`,
          feedback_wrong: '再想一想：数值用乘还是除？电阻是串还是并？箭头跟着哪一极走？回到第 2 幕的极性对照图看一眼。',
          figure: SVG_Q1,
          sync: { layer: L2, halo: [], params: { sm_kind: 'independent', sm_form: 'voltage', sm_pol: 'normal_up' } },
        },
        {
          id: 'w2l6_q2',
          question:
            '电路中要求计算 10 Ω 电阻上的电压 $v_o$，而该 10 Ω 电阻恰好与一个 2 A 电流源直接并联。关于是否可以将这对“2 A ∥ 10 Ω”直接电源变换为“20 V 串 10 Ω”再继续化简，以下说法正确的是：',
          options: [
            {
              key: 'A',
              text: '可以，只要变换完再把 10 Ω 上的电压算出来就是 $v_o$',
              correct: false,
              feedback: '变换完以后，那颗 10 Ω 已经是等效黑盒的内部元件了：它从并联变成了串联，上面的电压不再是原电路里的 $v_o$。电源变换只保证端口外部等效。',
            },
            { key: 'B', text: '不可以，因为变换后 10 Ω 电阻从并联变为串联，其两端电压不再等于原电路的 $v_o$', correct: true },
            {
              key: 'C',
              text: '只有当 2 A 是独立源时可以，受控源时不可以',
              correct: false,
              feedback: '这和源是独立的还是受控的无关：无论哪种，只要把待求量所在的电阻卷进变换，它就成了等效黑盒里的元件，电压随之改变。',
            },
            {
              key: 'D',
              text: '可以，因为电阻值仍然是 10 Ω，欧姆定律形式不变',
              correct: false,
              feedback: '阻值不变，不代表它两端的电压不变：变换后这颗 10 Ω 换了位置（由并联挪到串联），流过它的电流和它两端的电压都和原电路不同。',
            },
          ],
          feedback_correct:
            '电源变换只保证端口外部等效！一旦把待求量 $v_o$ 所在的 10 Ω 电阻卷入变换，变换后的 10 Ω 电阻属于等效黑盒内部元件，其电压与原电路的 $v_o$ 完全不同。必须先将 10 Ω 锁进红框隔离区。',
          feedback_wrong: '再想一想：电源变换保证的是端口外部，还是盒子内部？回到第 3 幕看看红框里的电阻是怎么处理的。',
          figure: SVG_Q2,
          sync: { layer: L3, halo: [], params: { pl_circuit: 'sadiku', pl_step: 0, pl_merge: true } },
        },
        {
          id: 'w2l6_q3',
          question: '实际电压源（10 V 串联 5 Ω）与其等效实际电流源（2 A 并联 5 Ω）在端口 a–b 均处于开路（不接负载）状态时，两个黑盒内部 5 Ω 电阻消耗的功率分别是多少？',
          options: [
            { key: 'A', text: '均为 0 W，因为两者完全等效', correct: false, feedback: '“完全等效”只对端口外部成立。开路时，并联模型里电流源的 2 A 还能流到哪里去？' },
            {
              key: 'B',
              text: '均为 20 W，因为开路电压都是 10 V',
              correct: false,
              feedback: '“开路电压都是 10 V”说的是端口两端；串联模型的电阻在回路里，开路时回路电流为 0，这颗电阻两端并没有 10 V。',
            },
            { key: 'C', text: '电压源模型内部为 0 W，电流源模型内部为 20 W', correct: true },
            {
              key: 'D',
              text: '电压源模型内部为 20 W，电流源模型内部为 0 W',
              correct: false,
              feedback: '两个模型对调了。想一想：开路时串联模型的回路里有没有电流？并联模型里电流源的电流又能流向哪里？',
            },
          ],
          feedback_correct: R`开路时，串联模型中电流为 0，内部 5 Ω 电阻功耗 $P = 0\text{ W}$；而并联模型中 2 A 电流全部流过内部 5 Ω 电阻，功耗 $P = 2^2 \times 5 = 20\text{ W}$。电源变换绝不等效内部功耗！`,
          feedback_wrong: '再想一想：开路时每个盒子里有没有电流在流？回到第 1 幕，把左侧舞台的探针切到“内部功耗”看看。',
          figure: SVG_Q3,
          sync: { layer: L1, halo: [], params: { bb_load: '2ohm', bb_overlay: 'voc_isc' } },
        },
        {
          id: 'w2l6_q4',
          question: '关于理想独立电源（内阻 R = 0 的理想电压源、内阻 R = ∞ 的理想电流源）能否直接进行电源变换，以下判断正确的是：',
          options: [
            {
              key: 'A',
              text: '理想电压源可直接变换为 0 A 电流源',
              correct: false,
              feedback: '理想电压源 R = 0，按公式 $i_s = v_s / R$ 得到的是 $v_s / 0$，不是 0 A；而且 0 A 电流源对外相当于开路，端口电压不可能还是 $v_s$。',
            },
            {
              key: 'B',
              text: '理想电流源可直接变换为 0 V 电压源',
              correct: false,
              feedback: R`理想电流源 R = ∞，按公式 $v_s = i_s R$ 得到的是 $i_s \cdot \infty$，不是 0 V；而且 0 V 电压源对外相当于短路，端口电流不可能还是 $i_s$。`,
            },
            { key: 'C', text: '两者都无法直接进行电源变换，因为公式会导致除以 0 或乘以无穷大', correct: true },
            {
              key: 'D',
              text: '只有理想电流源可以变换，理想电压源不可以',
              correct: false,
              feedback: '把理想电流源的“并联电阻” R = ∞ 代进 $v_s = i_s R$ 试试：两种理想源对这条公式的处境其实是对称的。',
            },
          ],
          feedback_correct: R`电源变换要求 $0 < R < \infty$。理想电压源 R = 0 时 $i_s = v_s / 0$ 无定义；理想电流源 R = ∞ 时 $v_s = i_s \cdot \infty$ 无定义。因此理想电源均不能直接执行电源变换。`,
          feedback_wrong: '再想一想：把 R = 0 和 R = ∞ 分别代进 $i_s = v_s / R$ 与 $v_s = i_s R$。回到第 1 幕的“两条不可逾越的物理边界”。',
          figure: SVG_Q4,
          sync: { layer: L2, halo: [], params: { sm_kind: 'independent', sm_form: 'voltage', sm_pol: 'normal_up' } },
        },
      ],
    },
  ],
};

export default W2_L6;
