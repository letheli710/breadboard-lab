// W1-L5 · 基尔霍夫电流定律（KCL） (lesson sheet: docs/lessons/W1-L5.md).
// The lesson text, formulas, guided example and quiz are reproduced from the sheet as written;
// [[id|…]] only links a term to the stage (the words are unchanged). Changes:
// - TeX lost in the Docs export is restored (6,\Omega → 6\,\Omega; \text{in},,\mathcal{S} →
//   \text{in},\,\mathcal{S}); the plain-text maths of the guided example and quiz (i_o, 0.5 i_o …)
//   is typeset as TeX. Display formulas inside ① paragraphs are set inline (\displaystyle); the
//   lead-in sentence of each ② formula is the formula card's title.
// - Act 1 said "上节课我们用欧姆定律…": Ohm's law is W1-L3, the lesson before this one is W1-L4
//   (topology), so it reads "前面的课里". The prerequisites follow the registry (the sheet listed
//   "W1-L2 参考方向" and "W1-L4 欧姆定律", which are W1-L1 and W1-L3).
// - The guided example's problem statement, hints, board lines and conclusion, the quiz's
//   wrong-answer feedback and the two quiz diagrams are added (the sheet has none).
// - Act 7: the 下节预告 text and diagram come before the two questions (a quiz closes its act).
// - Act diagrams: recoloured to the light stage palette (diagrams.ts).
// Hover ids use underscores (hl_node_a …): the [[id|…]] markup takes [a-z0-9_] ids only.

import { lazy } from 'react';
import type { HoverTarget, StageLesson } from '../../types';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6, SVG_ACT7 } from './diagrams';
import { SVG_Q1, SVG_Q2 } from './quizFigures';

const NodeLayer = lazy(() => import('./NodeLayer').then((m) => ({ default: m.NodeLayer })));
const SurfaceLayer = lazy(() => import('./SurfaceLayer').then((m) => ({ default: m.SurfaceLayer })));

const EXTRA: Record<string, HoverTarget> = {
  kcl_is: { label: '独立电流源 I_s', desc: '箭头向上：把电流送进节点 a' },
  kcl_r1: { label: 'R₁ 支路', desc: '向下流过 R₁ 的电流（i₁ 或 i_o）就是受控源的控制量' },
  kcl_r2: { label: 'R₂ 支路', desc: '与 R₁ 并联在同一节点电压 v_o 两端' },
};

const W1_L5: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { kcl_node: NodeLayer, kcl_surface: SurfaceLayer },
  describeTarget: (id) => EXTRA[id] ?? null,
  lesson_meta: {
    lesson_id: 'W1-L5',
    world: 'World 1 — 直流电路基石（DC Fundamentals）',
    title: '基尔霍夫电流定律（KCL）',
    subtitle: "基尔霍夫电流定律（Kirchhoff's Current Law, KCL）· 从电荷守恒到封闭曲面：掌握节点电流的绝对铁律",
    lesson_type: 'B',
    lesson_type_label: 'Type B（公式与分析法课 · 纯 2D 交互推导）',
    estimated_minutes: 18,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander & Sadiku)',
      sections: ["Ch. 2.4（上）Kirchhoff's Current Law (KCL)"],
    },
    textbook_supplement: 'Boylestad, Introductory Circuit Analysis · Ch. 6 Parallel dc Circuits — KCL 水流类比',
    prerequisites: ['W1-L1 电流与电压参考方向', 'W1-L3 欧姆定律', 'W1-L4 支路、节点与回路'],
    learning_objectives: [
      '从电荷守恒公理解释为什么理想节点与封闭曲面都不能囤积电荷',
      '熟练使用“流入为正/流出为负”与“流入等于流出”两种形式列写多支路节点 KCL 方程，并正确解读负电流',
      '将 KCL 从单点推广至任意封闭曲面（广义节点），理解内部支路电流相互抵消的代数机制',
      '掌握并联电流源等效合并规则，并能用 KCL 证明两个不同电流源绝不能串联',
      '联立 KCL 与欧姆定律求解含受控电流源的并联电路未知量 $i_o$ 与 $v_o$',
    ],
    next_lesson: 'W1-L6',
    next_lesson_title: '基尔霍夫电压定律（KVL）',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: 'kcl_node',
        label: '01 多支路节点合流台',
        short: '01 节点合流',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '拖动三条输入支路的电流，第四条支路自动守恒；可切换水流管道类比与符号约定。另有含受控源的并联节点（第 5、6 幕）。',
      },
      {
        id: 'kcl_surface',
        label: '02 封闭曲面 KCL 演示台',
        short: '02 封闭曲面',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '一键切出封闭曲面 𝒮：内部支路两两抵消，只剩穿越边界的电流；电流源实验里试试并联合并与串联禁区。',
      },
    ],
    hover_map: {
      hl_node_a: { label: '节点 A', desc: '理想节点：没有体积、不能存储电荷，dq/dt = 0' },
      hl_water_junction: { label: '水管四通接头', desc: '水不可压缩：灌进多少，就必须流出多少' },
      hl_branch_in: { label: '流入支路 1、2、3', desc: '参考方向指向节点：Σ i_in' },
      hl_branch_out: { label: '自动守恒支路 4', desc: 'i₄ = i₁ + i₂ + i₃，实时锁死：Σ i_out' },
      hl_neg_current: { label: '负电流', desc: '真实流向与参考箭头相反：大小不变，方向反过来' },
      hl_closed_surface: { label: '封闭曲面 𝒮', desc: '广义节点：穿越边界的电流代数和为零' },
      hl_internal_cancel: { label: '内部支路对消', desc: '每条内部支路对一端是 −i、对另一端是 +i，相加抵消' },
      hl_opamp_ic: { label: 'LM741 运放封装', desc: '整片芯片当封闭曲面：i_o = i₁ + i₂ + i₊ + i₋（Sadiku Eq. 5.1）' },
      hl_parallel_merge: { label: '并联电流源合并', desc: '同一对节点间的电流源按方向取代数和：I_T = I₁ − I₂ + I₃' },
      hl_series_conflict: { label: '串联禁区', desc: '不同电流源串联：中间节点 KCL 变成 2 A = 5 A，电路非法' },
      hl_cccs_branch: { label: '受控电流源（菱形）', desc: '电流大小听命于另一条支路的电流：2i₁、0.5i_o' },
    },
  },
  right_acts: [
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '节点不是“电荷仓库”——电荷守恒与水流直觉',
      sync: { layer: 'kcl_node', halo: ['hl_node_a', 'hl_water_junction'], params: { l1Scene: 'node', i1: 4, i2: 3, i3: -1, conv: 'in' } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`欢迎来到 **W1-L5**。前面的课里我们用欧姆定律搞定了单个电阻的“脾气”（$v = iR$），但现实电路动辄几十上百个元件连在一起，光靠欧姆定律远远不够。从今天起，我们要请出电路分析的两大“宪法级”定律——基尔霍夫定律。今天先拿下第一条：**基尔霍夫电流定律（Kirchhoff's Current Law，简称 KCL）**。`,
        },
        {
          kind: 'p',
          text: String.raw`别被名字吓住，它的物理直觉你其实早就懂了。把目光移到左侧的 **01 多支路节点动态合流台**，切换一下「[[hl_water_junction|水流管道类比模式]]」（Boylestad Ch. 6 的经典直觉）：想象四根装满水的水管焊在同一个金属接头上。水是不可压缩的，如果左边三根管子每秒一共灌进来 6 升水，右边第四根管子每秒必须正好流出去 6 升水——既不能多，也不能少。如果只流出 5 升，那多出来的 1 升水往哪儿藏？接头要么瞬间憋爆，要么你得变出一个隐藏水箱。`,
        },
        {
          kind: 'p',
          text: String.raw`把水管换成铜导线，把水流换成自由电子的定向移动，就得到了电路里最硬核的物理根源：**[[hl_node_a|电荷守恒定律（Law of Conservation of Charge）]]**。一个[[hl_node_a|理想节点（Node）]]只是一个没有体积、也没有电容存储能力的几何连接点，它**绝对不能囤积电荷，也不能凭空消灭电荷**。只要多滞留哪怕一微库仑的多余电子，同性相斥的静电力就会瞬间把后续电子顶回去。你可以拖动左侧的[[hl_branch_in|三条输入支路滑块]]试试看：无论你怎么折腾 $i_1, i_2, i_3$，[[hl_branch_out|第四条输出支路 $i_4$]]都会像被一只无形的手死死拽住一样，实时[[hl_branch_out|自动守恒]]。`,
        },
        { kind: 'p', text: '现在，我们用最严谨的三段式数学语言，把这句物理直觉铸成公式：' },
        {
          kind: 'origin',
          title: '① 公理溯源（电荷守恒与电流定义）',
          text: String.raw`在任意时间段内，[[hl_node_a|节点 $A$]] 处净累积的电荷量变化率为零： $\displaystyle \frac{dq_{\text{node}}}{dt} = 0$ 由电流定义 $i_n = \frac{dq_n}{dt}$，若约定流入节点的电荷变化率为正、流出为负，则进入节点的总电荷变化率必须恒等于零： $\displaystyle \sum_{n=1}^{N} \frac{dq_n}{dt} = 0$`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式（KCL 两种等价表达）：将 $\frac{dq_n}{dt} = i_n$ 代入，得到 KCL 的标准代数和形式（Alexander & Sadiku Eq. 2.19）`,
          tex: String.raw`\sum_{n=1}^{N} i_n = 0`,
        },
        {
          kind: 'formula',
          title: String.raw`将所有[[hl_branch_in|流入节点的电流]]归到等号左边、[[hl_branch_out|流出节点的电流]]移到等号右边，得到工程中最顺手的流入等于流出等价形式`,
          tex: String.raw`\sum i_{\text{in}} = \sum i_{\text{out}}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（四支路节点默认工况）',
          steps: [
            {
              label: 'Step A · 列式',
              text: String.raw`在左侧默认状态中，节点 $A$ 有三条流入支路 $i_1 = 4\text{ A}$、$i_2 = 3\text{ A}$、$i_3 = -1\text{ A}$（参考方向指向节点 $A$），以及一条流出支路 $i_4$（参考方向背离节点 $A$）。按“流入为正、流出为负”列式：`,
              tex: String.raw`i_1 + i_2 + i_3 - i_4 = 0`,
            },
            { label: 'Step B · 移项代入', text: '移项并代入数值：', tex: String.raw`i_4 = i_1 + i_2 + i_3 = 4\text{ A} + 3\text{ A} + (-1\text{ A}) = 6\text{ A}` },
            {
              label: 'Step C · 复核',
              text: String.raw`验证流入与流出平衡：[[hl_branch_in|实际流入电流]]为 $4 + 3 = 7\text{ A}$，[[hl_branch_out|实际流出电流]]为 $1 + 6 = 7\text{ A}$，电荷收支绝对平衡。`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '水流管道类比（Boylestad）与电路节点模型（Sadiku）',
    },
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '正负号的铁律——参考方向、代数和与“负电流”真相',
      sync: { layer: 'kcl_node', halo: ['hl_neg_current', 'hl_branch_in', 'hl_branch_out'], params: { l1Scene: 'node', i3: -1 } },
      blocks: [
        { kind: 'p', text: '很多同学刚学 KCL 时，最容易在正负号上栽跟头：“老师，我怎么知道哪条支路是真正流入的？万一我把符号写反了怎么办？”' },
        {
          kind: 'p',
          text: String.raw`答案特别干脆：**你根本不需要提前猜对真实方向！** KCL 认的是你图上标好的**[[hl_neg_current|参考方向（Reference Direction）]]**。只要你在同一个节点上坚持同一套正负约定，列出来的方程就是百分百正确的。如果最后解出来[[hl_neg_current|某个电流是负值]]（比如$i_3 = -1\text{ A}$），它**绝对不代表你算错了**，它只是电路在诚实地告诉你：“你画的参考箭头指反了，真实电流大小是 $1\text{ A}$，方向与你的箭头正好相反。”`,
        },
        {
          kind: 'p',
          text: '我们拿 Alexander & Sadiku Ch. 2.4 经典的五支路节点来验证一下：无论你用“流入为正、流出为负”，还是反过来用“流出为正、流入为负”，得到的物理结论完全一模一样。你可以在左侧 Layer 01 点击「符号约定切换按钮」亲眼验证。',
        },
        {
          kind: 'origin',
          title: '① 公理溯源（节点电流代数和守恒）',
          text: String.raw`对包含 $N=5$ 条支路的节点 $B$，应用 KCL 电荷守恒通式： $\displaystyle \sum_{n=1}^{5} i_n = 0$ 图中参考方向设定为：$i_1, i_3, i_4$ 指向节点 $B$（[[hl_branch_in|流入]]）；$i_2, i_5$ 背离节点 $B$（[[hl_branch_out|流出]]）。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（两种约定等价证明）：约定 A（流入为正，流出为负）',
          tex: String.raw`(+i_1) + (-i_2) + (+i_3) + (+i_4) + (-i_5) = 0 \implies i_1 + i_3 + i_4 = i_2 + i_5`,
        },
        { kind: 'formula', title: '约定 B（流出为正，流入为负）', tex: String.raw`(-i_1) + (+i_2) + (-i_3) + (-i_4) + (+i_5) = 0` },
        { kind: 'p', text: String.raw`将约定 B 两边同乘 $-1$，立刻还原为 $i_1 + i_3 + i_4 = i_2 + i_5$，两种约定**完全等价**。` },
        {
          kind: 'calc',
          title: String.raw`③ 代入数值逐步化简（求解未知支路电流 $i_5$）`,
          steps: [
            {
              label: 'Step A · 移项',
              text: String.raw`已知 $i_1 = 5\text{ A}$，$i_2 = 8\text{ A}$，$i_3 = -2\text{ A}$，$i_4 = 1\text{ A}$，求 $i_5$：`,
              tex: String.raw`i_5 = i_1 + i_3 + i_4 - i_2`,
            },
            { label: 'Step B · 代入', text: '代入数值：', tex: String.raw`i_5 = 5\text{ A} + (-2\text{ A}) + 1\text{ A} - 8\text{ A} = -4\text{ A}` },
            {
              label: 'Step C · 物理翻译',
              text: String.raw`[[hl_neg_current|$i_5 = -4\text{ A}$]] 意味着，尽管参考箭头画成“流出节点 $B$”，但实际上有 $4\text{ A}$ 的电流正在**流入**节点 $B$。`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '五支路节点 B：参考方向与负电流物理含义',
    },
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '跳出单个“点”——封闭曲面（广义节点）与 World 3 运放伏笔',
      sync: { layer: 'kcl_surface', halo: ['hl_closed_surface', 'hl_internal_cancel'], params: { l2Tab: 'surface', preset: 'bridge' } },
      blocks: [
        {
          kind: 'p',
          text: '到这里，我要带你完成一次思维升维。请把左侧切换到 **02 封闭曲面/超级节点 KCL 演示台**，点击**「[[hl_closed_surface|一键切出封闭虚线边界]]」**。',
        },
        {
          kind: 'p',
          text: '很多初学者以为 KCL 只能对着一根导线交叉出来的“几何点”来写。错！**KCL 对空间中任意一个[[hl_closed_surface|封闭曲面（Closed Surface，又称广义节点或超级节点边界）]]都严格成立！**',
        },
        {
          kind: 'p',
          text: String.raw`为什么？理由美妙得像魔术一样：假设你用一把虚线剪刀，把一大块包含几十个电阻、甚至一整块黑盒芯片的子电路圈进一个[[hl_closed_surface|封闭边界 $\mathcal{S}$]] 里。只要你把边界里面每一个独立节点的 KCL 方程全部加在一起，任何一条**两端都在边界内部**的支路（比如连接内部节点 $a$ 和 $b$ 的支路 $i_{\text{int}}$），对节点 $a$ 来说是“流出（$-i_{\text{int}}$）”，对节点 $b$ 来说就必然是“流入（$+i_{\text{int}}$）”。两式相加，所有[[hl_internal_cancel|内部支路电流都会两两精确抵消]]，最后剩下的**全都是穿越封闭边界的外部电流**！`,
        },
        {
          kind: 'p',
          text: String.raw`**【重磅伏笔：[[hl_opamp_ic|World 3 运算放大器 Eq. 5.1]]】** 赶紧点击左侧的「[[hl_opamp_ic|LM741 运放封装预设]]」，提前看一眼我们将在 **World 3** 遇到的核心元件——运算放大器（Op-Amp）。一块运放芯片内部密密麻麻藏着二三十个晶体管，但如果你把它整片芯片当成一个封闭曲面来列 KCL（正是 Alexander & Sadiku **Eq. 5.1**），你会立刻看穿一个让无数工程师踩坑的真相： $\displaystyle i_o = i_1 + i_2 + i_+ + i_-$ 理想运放的两个输入脚几乎不吸电流（$i_1 \approx 0, i_2 \approx 0$），那输出脚哗哗往外送的 $i_o$ 是从哪儿来的？**全是从正负电源脚 $i_+, i_-$ 抽进来的！** 封闭曲面 KCL 让你一眼看穿黑盒芯片的能量与电流去向。`,
        },
        { kind: 'p', text: '我们用最简洁的双内部节点子电路，完成封闭曲面 KCL 的三段式证明：' },
        {
          kind: 'origin',
          title: '① 公理溯源（对边界内每个节点分别应用 KCL）',
          text: String.raw`设封闭曲面 $\mathcal{S}$ 内包含节点 $a$ 与节点 $b$，二者之间连有一条内部支路电流 $i_{\text{int}}$（由 $a$ 流向 $b$）。外部有 $i_A, i_B$ 流入 $\mathcal{S}$（分别接至 $a, b$），$i_C, i_D$ 流出 $\mathcal{S}$（分别接自 $a, b$）。按“流入为正、流出为负”： $\displaystyle \text{节点 } a:\quad i_A - i_C - i_{\text{int}} = 0$ $\quad\displaystyle \text{节点 } b:\quad i_B + i_{\text{int}} - i_D = 0$`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式（两式相加消去内部支路）：将节点 $a$ 与节点 $b$ 的 KCL 方程相加`,
          tex: String.raw`(i_A - i_C - i_{\text{int}}) + (i_B + i_{\text{int}} - i_D) = 0`,
        },
        {
          kind: 'formula',
          title: String.raw`[[hl_internal_cancel|内部支路 $-i_{\text{int}}$ 与 $+i_{\text{int}}$ 精确抵消]]，得到[[hl_closed_surface|封闭曲面 $\mathcal{S}$]] 的宏观 KCL`,
          tex: String.raw`i_A + i_B - i_C - i_D = 0 \implies \sum i_{\text{in},\,\mathcal{S}} = \sum i_{\text{out},\,\mathcal{S}}`,
        },
        {
          kind: 'calc',
          title: String.raw`③ 代入数值逐步化简（求解外部未知引脚电流 $i_D$）`,
          steps: [
            {
              label: 'Step A · 只看边界',
              text: String.raw`设外部流入电流 $i_A = 5\text{ A}$、$i_B = 3\text{ A}$，外部流出电流 $i_C = 2\text{ A}$，无论内部电阻如何变动（哪怕内部环流 $i_{\text{int}}$ 从 $1\text{ A}$ 变成 $100\text{ A}$），外部流出电流 $i_D$ 恒为：`,
              tex: String.raw`i_D = i_A + i_B - i_C = 5\text{ A} + 3\text{ A} - 2\text{ A} = 6\text{ A}`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '封闭曲面（广义节点）KCL：内部支路精确抵消',
    },
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '并联电流源的等效合并与“串联禁区”',
      sync: { layer: 'kcl_surface', halo: ['hl_parallel_merge', 'hl_series_conflict'], params: { l2Tab: 'sources', src: 'parallel', merged: false } },
      blocks: [
        {
          kind: 'p',
          text: '掌握了 KCL，我们立刻就能解锁一个极实用的化简技巧——**[[hl_parallel_merge|并联电流源的等效合并]]**，顺便彻底搞懂电路里的一条“高压红线”——**[[hl_series_conflict|两个不同电流源绝不能串联]]**。',
        },
        {
          kind: 'p',
          text: String.raw`先看**并联**：如果有三个独立电流源并联在相同的两个节点 $a$ 和 $b$ 之间，它们共同向外部电路送出总电流 $I_T$。你只需对顶部的公共节点 $a$ 列一次 KCL，就能把这三个源合并成一个等效电流源 $I_T$，大小等于各支路电流源的**代数和**（箭头同向相加，反向相减）。可以在左侧 Layer 02 切换到「电流源实验」点击「[[hl_parallel_merge|一键合并]]」看动画。`,
        },
        {
          kind: 'p',
          text: String.raw`再看**[[hl_series_conflict|串联禁区]]**：假如你手滑把一个 $2\text{ A}$ 的理想电流源和一个 $5\text{ A}$ 的理想电流源首尾直接串联起来，会发生什么？对它们俩中间的那个连接节点列 KCL：左边强行每秒塞进来 2 库仑电荷，右边强行每秒抽走 5 库仑电荷——KCL 瞬间变成 $2\text{ A} = 5\text{ A}$！这不仅在数学上是赤裸裸的荒谬，在物理上更是直接违背了电荷守恒（理想电流源内阻无穷大，为对抗这 $3\text{ A}$ 的差值，中间节点电压会瞬间飙升至无穷大并击穿器件）。**记住铁律：不同电流值的理想电流源绝对禁止串联（只有电流值与方向完全一致时才在数学上不矛盾，但工程上也绝不这样画）。**`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源（公共节点 KCL 与反证法）· 并联情形',
          text: String.raw`对[[hl_parallel_merge|并联电流源]]顶部节点 $a$ 列 KCL（流入为正、流出为负），$I_1, I_3$ 向上流入节点 $a$，$I_2$ 向下流出节点 $a$，等效总电流 $I_T$ 向右流出节点 $a$： $\displaystyle \sum_{n=1}^{4} i_n = 0 \implies I_1 - I_2 + I_3 - I_T = 0$`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源 · 串联禁区（反证）',
          text: String.raw`设 $I_A$ 与 $I_B$（$I_A \neq I_B$）串联于同一无分支路径，对[[hl_series_conflict|中间节点 $m$]] 列 KCL： $\displaystyle I_A - I_B = 0 \implies I_A = I_B$ 与前提 $I_A \neq I_B$ 直接矛盾。`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式（并联电流源等效合并公式）：由节点 $a$ 的 KCL 移项即得等效合并通式（Alexander & Sadiku Ch. 2.4）`,
          tex: String.raw`I_T = I_1 - I_2 + I_3`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A · 并联合并',
              text: String.raw`设 $I_1 = 5\text{ A}$（向上）、$I_2 = 2\text{ A}$（向下）、$I_3 = 4\text{ A}$（向上），则等效单一电流源为：`,
              tex: String.raw`I_T = 5\text{ A} - 2\text{ A} + 4\text{ A} = 7\text{ A}\quad(\text{方向向上流出节点 } a)`,
            },
            {
              label: 'Step B · 串联禁区',
              text: String.raw`而在[[hl_series_conflict|串联禁区]]中，若 $I_A = 2\text{ A}$ 与 $I_B = 5\text{ A}$ 串联，中间节点得出 $2\text{ A} - 5\text{ A} = -3\text{ A} \neq 0$，**电路非法**。`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '合法：并联电流源等效合并 · 非法：不同源串联',
    },
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '综合实战——含受控电流源的 KCL + 欧姆定律联立',
      sync: { layer: 'kcl_node', halo: ['hl_cccs_branch'], params: { l1Scene: 'cccs', cccs: 'ex5', Is: 15, depDir: 'down', reveal: true } },
      blocks: [
        {
          kind: 'p',
          text: '理论讲完，我们来啃一块考试和工程里最常碰见的硬骨头：当电路里出现一个**菱形符号的[[hl_cccs_branch|受控电流源（Dependent Current Source）]]**时，KCL 怎么列？',
        },
        {
          kind: 'p',
          text: '记住教授的一句口诀：**“把受控源当普通电流支路先写进 KCL，再用欧姆定律把所有未知量拧成一根绳。”** 菱形框并不神秘，它只是电流大小听命于电路里另一条支路的电流（或电压）罢了。',
        },
        {
          kind: 'p',
          text: String.raw`来看下面这道并联电路：一个 [[kcl_is|$I_s = 15\text{ A}$ 的独立电流源]]、两个电阻 [[kcl_r1|$R_1 = 6\,\Omega$]] 和 [[kcl_r2|$R_2 = 3\,\Omega$]]、以及一个[[hl_cccs_branch|受控电流源 $\alpha i_1$]]（其中 $\alpha = 2$，方向向下流出顶部节点 $a$）全部并联在[[hl_node_a|节点 $a$]] 与参考地之间。我们需要求出节点电压 $v_o$ 和各支路电流 $i_1, i_2$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源（节点 KCL + 电阻欧姆定律）',
          text: String.raw`对顶部节点 $a$ 应用 KCL（$\sum i_{\text{in}} = \sum i_{\text{out}}$），同时对并联在节点 $a$ 与参考地之间的两条电阻支路应用欧姆定律： $\displaystyle I_s = i_1 + i_2 + \alpha i_1$ $\quad\displaystyle i_1 = \frac{v_o}{R_1}, \qquad i_2 = \frac{v_o}{R_2}$`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式（消元并解出 $v_o$）：合并 KCL 中的 $i_1$ 项，并将欧姆定律代入，全部统一为未知数 $v_o$`,
          tex: String.raw`I_s = (1 + \alpha) i_1 + i_2 = (1 + \alpha)\frac{v_o}{R_1} + \frac{v_o}{R_2} = v_o \left(\frac{1 + \alpha}{R_1} + \frac{1}{R_2}\right)`,
        },
        { kind: 'formula', title: '解出纯符号通式', tex: String.raw`v_o = \frac{I_s}{\dfrac{1 + \alpha}{R_1} + \dfrac{1}{R_2}}` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A · 代入',
              text: String.raw`代入 $I_s = 15\text{ A}$、$R_1 = 6\,\Omega$、$R_2 = 3\,\Omega$、$\alpha = 2$：`,
              tex: String.raw`v_o = \frac{15}{\dfrac{1 + 2}{6} + \dfrac{1}{3}} = \frac{15}{\dfrac{3}{6} + \dfrac{2}{6}} = \frac{15}{\dfrac{5}{6}} = 15 \times \frac{6}{5} = 18\text{ V}`,
            },
            {
              label: 'Step B · 反代',
              text: '反代求各支路电流并做 KCL 复核：',
              tex: String.raw`i_1 = \frac{18\text{ V}}{6\,\Omega} = 3\text{ A}, \qquad i_2 = \frac{18\text{ V}}{3\,\Omega} = 6\text{ A}, \qquad 2i_1 = 6\text{ A}`,
            },
            { label: 'Step C · 复核', text: String.raw`总流出 $= 3 + 6 + 6 = 15\text{ A} = I_s$，完美闭合！` },
          ],
        },
      ],
      inline_svg: SVG_ACT5,
      figure_caption: '含电流控制电流源（CCCS）的 KCL + 欧姆定律联立电路',
    },
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式分步引导例题（含受控电流源与符号方向错路拦截）',
      sync: { layer: 'kcl_node', halo: ['hl_cccs_branch', 'hl_node_a'], params: { l1Scene: 'cccs', cccs: 'ex6', Is: 6, depDir: 'up', reveal: false } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`现在轮到你亲自操刀了！下面这道题是 **Alexander & Sadiku Example 2.6** 的经典变体：注意看清楚右侧菱形[[hl_cccs_branch|受控电流源 $0.5 i_o$]] 的箭头方向是**向上流入节点 $a$**的——这正是考试里最隐蔽的符号陷阱。请先看清电路图，再一步步完成 3 步苏格拉底引导求解 $i_o$ 与 $v_o$。`,
        },
        {
          kind: 'guided',
          title: String.raw`含受控电流源的多支路节点求解（求 $i_o$ 与 $v_o$）`,
          source: 'Alexander & Sadiku Example 2.6 变体',
          problem: String.raw`$I_s = 6\text{ A}$ 的独立电流源（向上流入节点 $a$）、$R_1 = 2\,\Omega$（电流 $i_o$ 向下）、$R_2 = 4\,\Omega$（电流 $i_2$ 向下）与受控电流源 $0.5\,i_o$（向上流入节点 $a$）全部并联在节点 $a$ 与参考地之间。求 $i_o$ 与节点电压 $v_o$。`,
          problem_svg: SVG_ACT6,
          steps: [
            {
              title: '① 公理溯源：列写节点 a 的 KCL 方程',
              mini_svg: MINI_STEP1,
              question: String.raw`请先盯紧[[hl_node_a|节点 $a$]] 的 4 条支路箭头方向：按“流入之和 = 流出之和”，节点 $a$ 正确的 KCL 方程是哪一个？`,
              hint: String.raw`先把四条支路分成两队：箭头指向节点 $a$ 的算“流入”，箭头背离节点 $a$ 的算“流出”。特别留意最右侧[[hl_cccs_branch|菱形框]]里箭头的朝向。`,
              options: [
                {
                  text: String.raw`$6 + 0.5\,i_o = i_o + i_2$`,
                  correct: true,
                  feedback: String.raw`漂亮！你精准抓住了受控源 $0.5\,i_o$ 的向上箭头——它与 $6\text{ A}$ 独立源一起向节点 $a$ 灌入电流，共同供给向下流出的 $i_o$ 和 $i_2$。`,
                },
                {
                  text: String.raw`$6 = i_o + i_2 + 0.5\,i_o$`,
                  correct: false,
                  feedback: String.raw`【符号方向错路拦截】停一下！看看最右侧菱形框里的箭头——它是指向上方（流入节点 $a$）的，而不是向下流出！你把它错放到了“流出”那一侧，请把 $0.5\,i_o$ 移回等号左侧的“流入”阵营。`,
                },
                {
                  text: String.raw`$6 + i_o + i_2 + 0.5\,i_o = 0$`,
                  correct: false,
                  feedback: String.raw`【符号方向错路拦截】四条支路不能全取正号！流入节点（$6\text{ A}$、$0.5\,i_o$）与流出节点（$i_o$、$i_2$）必须取相反的符号，否则违背电荷守恒。`,
                },
              ],
              board: [String.raw`\text{节点 } a:\quad 6 + 0.5\,i_o = i_o + i_2`],
              halo: ['hl_node_a', 'hl_cccs_branch'],
              params: { l1Scene: 'cccs', cccs: 'ex6', Is: 6, depDir: 'up', reveal: false },
            },
            {
              title: String.raw`② 纯符号消元：用 $i_o$ 表示 $i_2$`,
              mini_svg: MINI_STEP2,
              question: String.raw`现在方程里有两个未知数 $i_o$ 和 $i_2$。注意到 [[kcl_r1|$R_1 = 2\,\Omega$]] 与 [[kcl_r2|$R_2 = 4\,\Omega$]] 并联在同一节点电压 $v_o$ 两端，如何用欧姆定律把 $i_2$ 改写成关于 $i_o$ 的表达式？`,
              hint: String.raw`两条电阻支路共用同一个节点电压：先写出 $v_o = 2\,i_o$ 与 $v_o = 4\,i_2$，再让两式相等。`,
              options: [
                {
                  text: String.raw`$i_2 = (R_1 / R_2)\, i_o = 0.5\, i_o$`,
                  correct: true,
                  feedback: String.raw`完全正确！因为 $v_o = 2\,i_o = 4\,i_2$，所以电阻大一倍的 $4\,\Omega$ 支路分得的电流只有 $2\,\Omega$ 支路的一半，即 $i_2 = 0.5\,i_o$。`,
                },
                {
                  text: String.raw`$i_2 = (R_2 / R_1)\, i_o = 2\, i_o$`,
                  correct: false,
                  feedback: String.raw`【物理直觉拦截】反啦！两电阻两端电压相同，$4\,\Omega$ 比 $2\,\Omega$ 更“难走”，流过它的电流怎么可能反而更大呢？再检查一次 $v_o = i_o \cdot 2 = i_2 \cdot 4$ 的移项。`,
                },
                {
                  text: String.raw`$i_2 = -0.5\, i_o$`,
                  correct: false,
                  feedback: String.raw`【符号方向错路拦截】$i_o$ 与 $i_2$ 都是从高电位的节点 $a$ 向下流向参考地，方向完全一致，不需要加负号。`,
                },
              ],
              board: [String.raw`v_o = R_1 i_o = R_2 i_2 \;\Rightarrow\; 2\,i_o = 4\,i_2 \;\Rightarrow\; i_2 = 0.5\,i_o`],
              halo: ['kcl_r1', 'kcl_r2'],
            },
            {
              title: String.raw`③ 代入数值逐步化简：求解 $i_o$ 与 $v_o$`,
              mini_svg: MINI_STEP3,
              question: String.raw`把 $i_2 = 0.5\,i_o$ 代回第 1 步的 KCL 方程 $6 + 0.5\,i_o = i_o + i_2$，最终求得的 $i_o$ 与 $v_o$ 分别是多少？`,
              hint: String.raw`代入后右边是 $i_o + 0.5\,i_o = 1.5\,i_o$，两边的 $0.5\,i_o$ 可以直接消掉。求出 $i_o$ 后，别忘了 $i_o$ 流过的是哪一个电阻。`,
              options: [
                {
                  text: String.raw`$i_o = 6\text{ A}$，$v_o = 12\text{ V}$`,
                  correct: true,
                  feedback: String.raw`满分通关！方程两边同消 $0.5\,i_o$ 直接得到 $i_o = 6\text{ A}$，再由 $v_o = R_1 i_o = 2 \times 6 = 12\text{ V}$。复核：流入 $= 6 + 3 = 9\text{ A}$，流出 $= 6 + 3 = 9\text{ A}$，滴水不漏！`,
                },
                {
                  text: String.raw`$i_o = 3\text{ A}$，$v_o = 6\text{ V}$`,
                  correct: false,
                  feedback: String.raw`【错路溯源】你算出 $3\text{ A}$ 是因为不小心按 $6 = 2\,i_o$ 来解了——这正是把 $0.5\,i_o$ 的方向看反（当成流出）才会得到的陷阱答案！重新核对 $6 + 0.5\,i_o = 1.5\,i_o$。`,
                },
                {
                  text: String.raw`$i_o = 6\text{ A}$，$v_o = 24\text{ V}$`,
                  correct: false,
                  feedback: String.raw`$i_o = 6\text{ A}$ 算对了，但 $v_o$ 用错了电阻！$i_o$ 流过的是 $R_1 = 2\,\Omega$ 电阻，所以 $v_o = 2 \times 6 = 12\text{ V}$（若用 $R_2 = 4\,\Omega$，则应乘以 $i_2 = 3\text{ A}$，同样得 $12\text{ V}$）。`,
                },
              ],
              board: [
                String.raw`6 + 0.5\,i_o = i_o + 0.5\,i_o \;\Rightarrow\; i_o = 6\ \text{A}`,
                String.raw`v_o = R_1 i_o = 2 \times 6 = 12\ \text{V}, \qquad i_2 = 3\ \text{A}`,
                String.raw`\text{复核：}\ 6 + 0.5 \times 6 = 9\ \text{A} = 6 + 3`,
              ],
              halo: ['hl_node_a'],
            },
          ],
          conclusion: String.raw`$i_o = 6\text{ A}$，$v_o = 12\text{ V}$。点左侧「揭晓数值」核对；再把菱形箭头翻成「↓ 流出 a」，看看陷阱答案 $i_o = 3\text{ A}$ 是怎么来的。`,
        },
      ],
    },
    {
      act_index: 7,
      badge: '第 7 幕',
      title: '随堂自测与下节预告（W1-L6 基尔霍夫电压定律 KVL）',
      sync: { layer: 'kcl_surface', halo: ['hl_closed_surface'], params: { l2Tab: 'surface', surface: true } },
      blocks: [
        {
          kind: 'p',
          text: '在收工之前，用下面 2 道随堂自测题检验你对**[[hl_closed_surface|封闭曲面 KCL]]** 与**[[hl_parallel_merge,hl_series_conflict|电流源串并联规则]]**的掌握程度：',
        },
      ],
      quiz: [
        {
          id: 'w1l5_q1',
          concept: '封闭曲面 KCL',
          review_act: 3,
          question: '某未知黑盒集成电路芯片共有 4 个外部引脚。实测引脚 1 流入 12 mA，引脚 2 流出 4 mA，引脚 3 流入 5 mA。假设芯片处于稳态工作，引脚 4 的电流大小与方向应为？',
          options: [
            { key: 'A', text: '流出 13 mA', correct: true },
            { key: 'B', text: '流入 13 mA', correct: false },
            { key: 'C', text: '流出 3 mA', correct: false },
            {
              key: 'D',
              text: '无法确定，必须知道芯片内部电路结构',
              correct: false,
              feedback: '不需要！这正是封闭曲面 KCL 的威力：把整片芯片圈进一个封闭曲面，内部无论多复杂都两两抵消，只看穿越边界的 4 根引脚就够了。',
            },
          ],
          feedback_correct: String.raw`将整片黑盒芯片视为封闭曲面 $\mathcal{S}$，内部无论包含多少晶体管或环流都会两两抵消。由 $\sum i_{\text{in}} = \sum i_{\text{out}}$ 得：$12\text{ mA} + 5\text{ mA} = 4\text{ mA} + i_4$（流出），解得 $i_4 = 13\text{ mA}$（流出）。`,
          feedback_wrong: String.raw`先把已知的三根引脚分成两队：流入 $12 + 5 = 17\text{ mA}$，流出 $4\text{ mA}$。整片芯片当封闭曲面，$\sum i_{\text{in}} = \sum i_{\text{out}}$，第四根引脚必须补上差额——想想它该朝哪个方向。`,
          figure: SVG_Q1,
          sync: { layer: 'kcl_surface', halo: ['hl_closed_surface', 'hl_opamp_ic'], params: { l2Tab: 'surface', preset: 'opamp', surface: true } },
        },
        {
          id: 'w1l5_q2',
          concept: '电流源并联合并与串联禁区',
          review_act: 4,
          question: '关于理想独立电流源的连接方式，以下说法中唯一正确的是？',
          options: [
            { key: 'A', text: '将 3 A 与 5 A 两个理想电流源同向串联，可等效为 8 A 的单一电流源', correct: false },
            { key: 'B', text: '将 3 A（向上）与 5 A（向下）两个理想电流源并联在同一对节点间，可等效为 2 A（向下）的单一电流源', correct: true },
            { key: 'C', text: '将 3 A（向上）与 5 A（向下）并联时，会因为方向相反违背 KCL 而烧毁电路', correct: false },
            { key: 'D', text: '任意两个不同的理想电流源既不能并联也不能串联', correct: false },
          ],
          feedback_correct: String.raw`并联电流源完全合法，其等效值为代数和：$I_T = 3\text{ A} - 5\text{ A} = -2\text{ A}$（即 $2\text{ A}$ 向下）。而选项 A 将不同电流源串联会直接导致中间节点 $3\text{ A} \neq 5\text{ A}$，违背 KCL。`,
          feedback_wrong: String.raw`回到第 4 幕：并联在同一对节点间的电流源按方向取代数和，方向相反也完全合法；真正违背 KCL 的，是把电流值不同的理想电流源串联——中间节点会出现 $3\text{ A} \neq 5\text{ A}$。`,
          figure: SVG_Q2,
          sync: { layer: 'kcl_surface', halo: ['hl_parallel_merge', 'hl_series_conflict'], params: { l2Tab: 'sources', src: 'parallel', merged: false, dirs: [1, -1, 1] } },
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**下节预告：W1-L6 基尔霍夫电压定律（KVL）**' },
        {
          kind: 'p',
          text: String.raw`今天我们用**电荷守恒**锁死了电路中每一个“节点”和“封闭曲面”的电流收支（$\sum i_n = 0$）。下一课 **W1-L6**，我们要把视角从“点（节点）”切换到“圈（闭合回路）”，从物理学的另一座丰碑——**能量守恒定律**出发，推导基尔霍夫双璧的另一半：**基尔霍夫电压定律（$\sum_{m=1}^{M} v_m = 0$）**，并彻底搞懂串联电压源合并与“不同电压源绝不能并联”的对偶禁区！`,
        },
        { kind: 'figure', svg: SVG_ACT7, caption: '基尔霍夫双璧对偶预告：W1-L5 (KCL) → W1-L6 (KVL)' },
      ],
    },
  ],
};

export default W1_L5;
