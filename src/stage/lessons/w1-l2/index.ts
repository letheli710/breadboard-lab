// W1-L2 · 功率、无源符号约定与独立/受控源 (lesson sheet: docs/lessons/W1-L2.md).
// Lesson text, formulas, the act diagrams, the guided example and the self-test are reproduced
// from the sheet as written; [[id|…]] only links a term to the stage (the words are unchanged).
// Display formulas inside the sheet's prose sit in the formula / calc cards (their titles carry
// the lead-in sentence); "Step A …" labels of the calc cards are added. TeX lost in the export is
// restored (\, \; and the \\ line breaks of the aligned / cases blocks). The quiz's per-option
// feedback on wrong answers is added (the sheet gives one explanation per question).
// Hover-map ids are the sheet's with "-" → "_" and the "hover-" prefix dropped (the inline link
// syntax takes [a-z0-9_] only).

import { lazy } from 'react';
import type { StageLesson } from '../../types';
import { SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6, SVG_ACT7, SVG_STEP1, SVG_STEP2, SVG_STEP3 } from './svgs';

const PscWorkbench = lazy(() => import('./PscWorkbench'));
const DepSourcesWorkbench = lazy(() => import('./DepSourcesWorkbench'));

const W1_L2: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { psc_workbench: PscWorkbench, dep_sources: DepSourcesWorkbench },
  lesson_meta: {
    lesson_id: 'W1-L2',
    world: 'World 1 · 基本电量与电路定律',
    title: '功率、无源符号约定与独立/受控源',
    subtitle: 'Power, Passive Sign Convention, and Independent / Dependent Sources',
    lesson_type: 'B',
    lesson_type_label: 'Type B（公式与基础概念课）',
    estimated_minutes: 35,
    textbook_primary: { book: 'Alexander & Sadiku, Fundamentals of Electric Circuits (2026 Release)', sections: ['Ch. 1.5 Power and Energy', 'Ch. 1.6 Circuit Elements'] },
    textbook_supplement: "Boylestad, Introductory Circuit Analysis · Ch. 4 Ohm's Law, Power, and Energy（功率物理直觉与能量转换速率）",
    prerequisites: ['W1-L1 电荷、电流与电压（参考方向与极性）'],
    next_lesson: 'W1-L3',
    next_lesson_title: '欧姆定律、电阻与焦耳热功率',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: 'psc_workbench',
        label: '01 元件极性与功率符号判定台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '通用二端元件：拨动 v 和 i、翻转参考极性与电流箭头，看它在吸收还是发出功率；能量条按 w = p·Δt 蓄能。',
      },
      {
        id: 'dep_sources',
        label: '02 四类受控源互动台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '左侧控制端测出 v_x 或 i_x，经增益（μ、r、g、β）驱动右侧的菱形受控源，看它对测试负载发出多少功率。',
      },
    ],
    hover_map: {
      v_polarity: { label: '电压参考极性 (+ / −) 与 v', desc: '先画好的记账坐标；v 为负说明真实高电位在标 − 的那一端' },
      i_arrow: { label: '电流参考方向箭头 i', desc: '假设的电流方向；i 为负说明真实电流逆着箭头流' },
      psc_enter: { label: '正极流入：p = +vi', desc: '参考电流从参考 + 端流入，满足无源符号约定，吸收功率取 +vi' },
      psc_leave: { label: '正极流出：p = −vi', desc: '参考电流从参考 + 端流出，吸收功率必须补上负号取 −vi' },
      energy_bar: { label: '能量条 w = ∫ p dt', desc: '恒定功率时 w = p·Δt，随时间线性累积（1 kWh = 3.6 MJ）' },
      dep_control: { label: '控制变量 v_x / i_x 与控制链路', desc: '左侧传感器测得的控制量，经虚线链路按增益送到受控端' },
      dep_diamond: { label: '受控源菱形符号', desc: '受控源一律画成菱形：内部 + / − 是电压源，箭头是电流源' },
      vcvs_opamp: { label: 'VCVS 电压增益 μ · 运放伏笔', desc: 'v_s = μ v_x，μ 无量纲 (V/V)；World 3 的运放就是超高增益的 VCVS' },
      ccvs_transres: { label: 'CCVS 跨阻 r', desc: 'v_s = r i_x，r 的单位是 Ω = V/A' },
      vccs_transcond: { label: 'VCCS 跨导 g', desc: 'i_s = g v_x，g 的单位是 S = A/V（MOSFET 的 g_m v_gs）' },
      cccs_beta: { label: 'CCCS 电流增益 β', desc: 'i_s = β i_x，β 无量纲 (A/A)（BJT 的 i_C = β i_B）' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '从“做功有多快”说起——功率与能量的物理直觉',
      sync: { layer: 'psc_workbench', halo: ['energy_bar'], params: { psc_v: 12, psc_i: 2.5, psc_topPlus: true, psc_iEntersTop: true, psc_dt: 40 } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`上一节课（W1-L1），我们认识了电路里的两位主角：[[v_polarity|**电压 $v$**]]（推动单位电荷做功的“落差”）和[[i_arrow|**电流 $i$**]]（单位时间流过截面的“流量”）。但如果你拆开一台电水壶或者看一眼家里每月的电费账单，你会发现日常世界里最常被提起的词并不是库仑或伏特，而是**瓦特（W）和度（kWh）**。`,
        },
        {
          kind: 'p',
          text: String.raw`这就是 Boylestad 在讨论功率时最强调的直觉：**能量（Energy，$w$）是你总共干了多少活，而功率（Power，$p$）是你干活有多快。** 一壶水烧开需要的总热能是固定的（比如 $300\text{ kJ}$）。用一个 $1000\text{ W}$ 的小电炉去烧，需要 $5$ 分钟；换一个 $2000\text{ W}$ 的快煮壶，只要 $2.5$ 分钟。总能量一模一样，但后者的能量转换**速率**快了一倍——这就是功率的本质。`,
        },
        { kind: 'p', text: '那么，在电路里，怎么把功率和我们刚学过的电压、电流连起来？不需要死记硬背，微积分的链式法则一秒钟就能把真相摊开在你面前：' },
        {
          kind: 'origin',
          title: '推导 1.1：瞬时功率公式与能量积分 · ① 公理溯源',
          text: String.raw`根据物理学中功率、电压与电流的原始定义：$\displaystyle p \triangleq \frac{dw}{dt}, \qquad v \triangleq \frac{dw}{dq}, \qquad i \triangleq \frac{dq}{dt}$`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式：对 $p = \frac{dw}{dt}$ 应用链式法则（Chain Rule），插入微元电荷 $dq$：`,
          tex: String.raw`p = \frac{dw}{dt} = \frac{dw}{dq} \cdot \frac{dq}{dt} = v i`,
        },
        {
          kind: 'formula',
          title: String.raw`将上式两端在时间区间 $[t_0, t]$ 上积分，即得元件在该时段内吸收或发出的总能量：`,
          tex: String.raw`w = \int_{t_0}^{t} p\,dt = \int_{t_0}^{t} v i\,dt`,
        },
        { kind: 'p', text: String.raw`当电压与电流均为恒定直流（DC）时，功率 $p$ 为常数，积分退化为乘法：$w = p(t - t_0) = v i\,\Delta t$。` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A · 功率与能量',
              text: String.raw`设一台便携式直流加热片接在 $v = 12\text{ V}$ 的电源上，稳定工作电流为 $i = 2.5\text{ A}$，持续通电 $\Delta t = 40\text{ s}$：`,
              tex: String.raw`\begin{aligned} p &= v i = (12\text{ V})(2.5\text{ A}) = 30\text{ W} \\ w &= \int_{0}^{40} 30\,dt = 30\text{ W} \times 40\text{ s} = 1200\text{ J} = 1.2\text{ kJ} \end{aligned}`,
            },
            {
              label: 'Step B · 千瓦时',
              text: String.raw`顺便建立一个生活刻度：电力公司按“千瓦时（$\text{kWh}$，俗称 1 度电）”收费，它其实是一个**能量**单位而不是功率单位：`,
              tex: String.raw`1\text{ kWh} = 1000\text{ W} \times 3600\text{ s} = 3.6 \times 10^{6}\text{ J} = 3.6\text{ MJ}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: String.raw`**教授提醒**：注意区分瞬时量与总量。$p(t)$ 是某一瞬间能量流动的“流速”（瓦特），而 $w$ 是这段时间里累积下来的“总水量”（焦耳或千瓦时）。你可以试着在左侧 **图层 01** 中拖动时间滑块 $\Delta t$，观察下方[[energy_bar|能量条]]如何随时间线性累积。`,
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '功率与能量转换示意图',
    },
    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '电路里的“红绿灯”——无源符号约定（Passive Sign Convention）',
      sync: { layer: 'psc_workbench', halo: ['psc_enter', 'psc_leave'], params: { psc_v: 4, psc_i: -3, psc_topPlus: true, psc_iEntersTop: true, psc_dt: 10 } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`算出 $v \times i$ 的大小很容易，但电路分析里真正让人栽跟头的，永远是那个**正负号**：一个元件算出 $12\text{ W}$，它到底是在**吃掉** $12\text{ W}$（比如发热的电阻），还是在**吐出** $12\text{ W}$（比如供电的电池）？`,
        },
        { kind: 'p', text: '为了不让全世界工程师鸡同鸭讲，电路理论定下了一条铁律——**无源符号约定（Passive Sign Convention，简称 PSC）**。请你把下面这两句话刻进肌肉记忆里：' },
        {
          kind: 'formula',
          title: String.raw`[[psc_enter|**当参考电流 $i$ 从参考电压 $v$ 的正极（$+$）流入元件时**]]，我们就称电压与电流满足**无源符号约定**。此时，该元件**吸收的功率**记为：`,
          tex: 'p = +vi',
        },
        {
          kind: 'ul',
          items: [
            String.raw`如果代入具体数值后算出 $p > 0$，说明元件**真实吸收**了这么多功率；`,
            String.raw`如果代入具体数值后算出 $p < 0$，说明元件**真实发出**了 $|p|$ 这么多的功率！`,
          ],
        },
        {
          kind: 'formula',
          title: String.raw`[[psc_leave|**当参考电流 $i$ 从参考电压 $v$ 的正极（$+$）流出（即从负极流入）元件时**]]，它不满足无源符号约定。此时，该元件**吸收的功率**必须补上一个负号：`,
          tex: 'p = -vi',
        },
        { kind: 'ul', items: [String.raw`同样地，若算得 $p > 0$ 则真实吸收；若算得 $p < 0$ 则真实发出 $|p|$。`] },
        {
          kind: 'p',
          text: String.raw`很多初学者会困惑：“为什么要搞得这么绕？不能直接说正的就是吸收吗？”关键在于：**在解复杂电路之前，你根本不知道真实电流往哪边流、哪端电位更高**，所以你只能先随便画一套参考方向。无源符号约定就像是“记账坐标系”——只要你严格按「[[psc_enter|正进取 $+vi$]]、[[psc_leave|正出取 $-vi$]]」算出**吸收功率 $p$**，无论你当初参考方向猜对了还是猜反了，最终算出来的 $p$ 的正负号永远指向同一个物理真相！`,
        },
        {
          kind: 'origin',
          title: '推导 2.1：同一物理元件在两种参考方向下的符号一致性 · ① 公理溯源',
          text: String.raw`依据无源符号约定（Alexander & Sadiku, Ch. 1.5）：$\displaystyle p_{\text{abs}} = \begin{cases} +vi, & \text{电流 } i \text{ 从 } + \text{ 端流入} \\ -vi, & \text{电流 } i \text{ 从 } + \text{ 端流出} \end{cases}$ 且永远有：$p_{\text{absorbed}} = -p_{\text{supplied}}$。`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式：设某元件两端真实电压为上正下负 $v > 0$，真实电流大小为 $I_0 > 0$ 且**向上流**（从上端 $+$ 流出）：`,
          tex: String.raw`\text{记法 A：}\ p_{\text{abs}} = +v i_A,\ i_A = -I_0 \qquad \text{记法 B：}\ p_{\text{abs}} = -v i_B,\ i_B = +I_0`,
        },
        {
          kind: 'ul',
          items: [
            String.raw`**记法 A（参考箭头向下，从 $+$ 流入）**：满足 PSC，$p_{\text{abs}} = +v i_A$，而参考方向与真实电流相反，故 $i_A = -I_0$；`,
            String.raw`**记法 B（参考箭头向上，从 $+$ 流出）**：不满足 PSC，$p_{\text{abs}} = -v i_B$，而参考方向与真实电流相同，故 $i_B = +I_0$。`,
          ],
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A · 两种记法分别代入',
              text: String.raw`取 $v = 4\text{ V}$，$I_0 = 3\text{ A}$：`,
              tex: String.raw`\begin{aligned} \text{记法 A：}\quad p_{\text{abs}} &= +v i_A = +(4\text{ V})(-3\text{ A}) = -12\text{ W} \quad (\text{发出 } 12\text{ W}) \\ \text{记法 B：}\quad p_{\text{abs}} &= -v i_B = -(4\text{ V})(+3\text{ A}) = -12\text{ W} \quad (\text{发出 } 12\text{ W}) \end{aligned}`,
            },
            { label: 'Step B · 结论', text: String.raw`两种画法殊途同归，物理结论纹丝不动：**该元件正在发出 $12\text{ W}$ 功率。**` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '**互动实验**：现在去左侧 **图层 01** 点一下「[[i_arrow|翻转电流参考方向]]」按钮，同时把电流数值调成相反数，看看右下角的物理结论会不会改变？不会！这就是参考方向体系自洽的美感。',
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '无源符号约定左右对比图',
    },
    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '账本必须配平——电路中的能量守恒（∑p = 0）',
      sync: { layer: 'psc_workbench', halo: ['psc_enter', 'psc_leave'], params: { psc_v: 10, psc_i: 2, psc_topPlus: true, psc_iEntersTop: true, psc_dt: 10 } },
      blocks: [
        { kind: 'p', text: '掌握了单个元件的“记账规则”之后，我们把镜头拉远，看整个闭合电路。' },
        {
          kind: 'p',
          text: String.raw`物理学最不可撼动的底线是能量守恒：能量不会凭空冒出来，也不会凭空消失。放在电路里，这意味着在任意时刻，**有人发出多少瓦特的电功率，就必须有其他元件一分不差地吸收同样多的瓦特**。如果我们把全电路所有 $N$ 个元件的吸收功率（按第 2 幕的 PSC 规则带正负号计算）全部加起来，结果必然严格等于零：`,
        },
        { kind: 'formula', title: '电路功率守恒（Tellegen 推论）', tex: String.raw`\sum_{k=1}^{N} p_k = 0` },
        {
          kind: 'p',
          text: String.raw`在工程实战与考试中，这条公式是你最忠实的**防错校验器（Sanity Check）**。哪怕电路里有十个支路、五个电源，只要你最后把所有元件的功率一加发现不等于 $0$，不用怀疑人生，一定是前面某个节点的电流方向或者某处正负号抄错了——立刻回头查账！`,
        },
        {
          kind: 'origin',
          title: '推导 3.1：四元件闭合回路的功率配平校验 · ① 公理溯源',
          text: String.raw`根据能量守恒定律（电路形式为 Tellegen 定理的功率推论）：$\displaystyle \sum_{k=1}^{N} p_k = 0 \iff \sum p_{\text{absorbed}} = \sum p_{\text{supplied}}$`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式：设某闭合电路包含 $4$ 个元件（编号 $1, 2, 3, 4$），各自按无源符号约定算得的吸收功率为 $p_1, p_2, p_3, p_4$：`,
          tex: 'p_1 + p_2 + p_3 + p_4 = 0',
        },
        { kind: 'formula', title: '若已知前三个元件的功率，则第四个元件的吸收功率必被唯一锁定为：', tex: 'p_4 = -(p_1 + p_2 + p_3)' },
        {
          kind: 'calc',
          title: String.raw`③ 代入数值逐步化简：考虑下图所示的 4 元件串联闭环（顺时针电流 $i = 2\text{ A}$）`,
          steps: [
            { label: 'Step A', text: String.raw`元件 1（$24\text{ V}$ 电源，电流从 $+$ 端流出）：$p_1 = -v_1 i = -(24\text{ V})(2\text{ A}) = -48\text{ W}$` },
            { label: 'Step B', text: String.raw`元件 2（$10\text{ V}$ 负载，电流从 $+$ 端流入）：$p_2 = +v_2 i = +(10\text{ V})(2\text{ A}) = +20\text{ W}$` },
            { label: 'Step C', text: String.raw`元件 3（$6\text{ V}$ 负载，电流从 $+$ 端流入）：$p_3 = +v_3 i = +(6\text{ V})(2\text{ A}) = +12\text{ W}$` },
            { label: 'Step D', text: String.raw`元件 4（$8\text{ V}$ 负载，电流从 $+$ 端流入）：$p_4 = +v_4 i = +(8\text{ V})(2\text{ A}) = +16\text{ W}$` },
            { label: 'Step E · 逐项求和校验', tex: String.raw`\sum_{k=1}^{4} p_k = (-48) + 20 + 12 + 16 = -48 + 48 = 0\text{ W}` },
            { label: 'Step F · 配平', text: String.raw`账本完美配平：总发出功率 $48\text{ W} =$ 总吸收功率 $(20 + 12 + 16)\text{ W} = 48\text{ W}$。` },
          ],
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '四元件闭合回路功率守恒示意图',
    },
    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '谁给能量、谁耗能量？——有源元件、无源元件与独立源',
      sync: { layer: 'psc_workbench', halo: ['psc_leave', 'psc_enter'], params: { psc_v: 12, psc_i: 3, psc_topPlus: true, psc_iEntersTop: false, psc_dt: 10 } },
      blocks: [
        { kind: 'p', text: '既然电路里有发出能量的“金主”，也有吸收能量的“消费者”，Alexander & Sadiku（Ch. 1.6）据此把所有电路元件分成两大阵营：' },
        {
          kind: 'ul',
          items: [
            '**有源元件（Active Elements）**：能够**持续产生或向外部提供净能量**的元件。典型代表：电池、发电机、运算放大器（Op-Amp）、独立源与受控源。',
            '**无源元件（Passive Elements）**：不能凭空产生能量，只能**消耗能量（发热）或暂时储存能量**的元件。典型代表：**电阻（Resistor）、电容（Capacitor）、电感（Inductor）**。',
          ],
        },
        { kind: 'p', text: '在有源元件中，最基础的一类叫做**理想独立源（Ideal Independent Sources）**——它们在电路图里一律用**圆形（Circle）**表示：' },
        {
          kind: 'ul',
          items: [
            String.raw`**理想独立电压源（Independent Voltage Source）**：无论外部接了什么电路、需要流过多少电流，它都死死守住自己的端电压 $v_s$ 不变；至于流过它的电流 $i$ 是多少、往哪边流，**完全由外电路决定**。`,
            String.raw`**理想独立电流源（Independent Current Source）**：无论外部怎么变化，它都死死守住自己的输出电流 $i_s$ 不变；至于它两端的电压 $v$ 是多少，**完全由外电路决定**。`,
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: String.raw`**打破一个经典误区**：很多同学以为“电源永远只能发出功率”。错了！当你把快没电的汽车电瓶或手机电池插上充电器时，充电器的电压高于电池电压，把电流硬生生从电池的[[psc_enter|**正极（$+$）压了进去**]]。此时，这个独立电压源就在**吸收功率**（把电能转回化学能存起来）！`,
        },
        {
          kind: 'origin',
          title: '推导 4.1：独立电压源在放电 vs 充电两种工况下的功率 · ① 公理溯源',
          text: String.raw`根据无源符号约定与理想独立电压源特性（端电压恒定为 $v_s$）：$\displaystyle p_{\text{abs}} = \begin{cases} -v_s i, & \text{电流 } i \text{ 从正极流出（放电）} \\ +v_s i, & \text{电流 } i \text{ 从正极流入（充电）} \end{cases}$`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式：设电池等效为恒定独立电压源 $v_s$，工作电流大小为 $I$：`,
          tex: String.raw`\begin{aligned} \text{放电工况：}\quad p_{\text{discharge}} &= -v_s I < 0 \quad (\text{对外供能}) \\ \text{充电工况：}\quad p_{\text{charge}} &= +v_s I > 0 \quad (\text{吸收能量}) \end{aligned}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A · 放电与充电',
              text: String.raw`取一块 $v_s = 12\text{ V}$ 的蓄电池，放电与充电电流均为 $I = 3\text{ A}$：`,
              tex: String.raw`\begin{aligned} \text{放电时：}\quad p_{\text{discharge}} &= -(12\text{ V})(3\text{ A}) = -36\text{ W} \quad (\text{向外发出 } 36\text{ W}) \\ \text{充电时：}\quad p_{\text{charge}} &= +(12\text{ V})(3\text{ A}) = +36\text{ W} \quad (\text{从充电器吸收 } 36\text{ W}) \end{aligned}`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '独立电压源与独立电流源符号及充放电对比',
    },
    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '电路里的“传声筒”与放大器灵魂——四类受控源（Dependent Sources）',
      sync: { layer: 'dep_sources', halo: ['dep_diamond', 'vcvs_opamp'], params: { dep_type: 'VCVS', dep_x: 0.5, dep_k: 10, dep_ext: 0.4, dep_opamp: true } },
      blocks: [
        {
          kind: 'p',
          text: '如果世界里只有独立源和电阻，你只能做出手电筒和电暖气，永远造不出手机、音响和芯片。真正让电子电路拥有“放大信号”和“信息处理”能力的，是**受控源（Dependent / Controlled Sources）**。',
        },
        {
          kind: 'p',
          text: String.raw`在电路图上，受控源一律画成[[dep_diamond|**菱形（Diamond）**]]。它像一个忠实的“远程遥控执行器”：它自己输出的电压或电流，**严格正比于电路中另一个地方的[[dep_control|电压 $v_x$ 或电流 $i_x$]]**。`,
        },
        {
          kind: 'p',
          text: String.raw`按照“谁控制谁（输入 $\to$ 输出）”的组合，受控源恰好有 $2 \times 2 = 4$ 种类型。请切换左侧到 **图层 02（四类受控源互动台）**，边看边记：`,
        },
        {
          kind: 'table',
          head: ['类型简称', '中文全称', '控制方程', '增益系数与物理量纲', '真实电子器件原型'],
          rows: [
            ['**VCVS**', '电压控制电压源', String.raw`$ {v_s = \mu v_x}$`, String.raw`[[vcvs_opamp|$\mu$]]（无量纲，$\text{V/V}$）`, '**运算放大器（Op-Amp）核心模型**'],
            ['**CCVS**', '电流控制电压源', String.raw`$ {v_s = r i_x}$`, String.raw`[[ccvs_transres|$r$（跨阻，单位 $ {\Omega = \text{V/A}}$）]]`, '光电二极管跨阻放大器（TIA）'],
            [
              '**VCCS**',
              '电压控制电流源',
              String.raw`$ {i_s = g v_x}$`,
              String.raw`[[vccs_transcond|$g$（跨导，单位 $ {\text{S} = \text{A/V}}$）]]`,
              String.raw`**MOSFET / 场效应管**小信号模型（$g_m v_{gs}$）`,
            ],
            [
              '**CCCS**',
              '电流控制电流源',
              String.raw`$ {i_s = \beta i_x}$`,
              String.raw`[[cccs_beta|$\beta$（无量纲，$\text{A/A}$）]]`,
              String.raw`**BJT 三极管**放大模型（$i_C = \beta i_B$）`,
            ],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: String.raw`**关键伏笔（回链 World 3 运放）**：请你特别多看 [[vcvs_opamp|**VCVS**]] 一眼！到了 **World 3（运算放大器）**，你会看到那个三角形的运放芯片，其实在内部电路建模时，它的灵魂正是一个超高增益的 **VCVS**：$v_{\text{out}} = A_v (v_+ - v_-)$。只要你今天看懂了菱形 VCVS 怎么用微弱的输入电压 $v_x$ 去驾驭大功率的输出端 $v_s$，你以后学运放、做音频放大器就会有一种“原来老早就见过你”的通透感！`,
        },
        {
          kind: 'origin',
          title: '推导 5.1：VCVS（运放前导模型）的量纲验证与输出功率计算 · ① 公理溯源',
          text: String.raw`根据理想 VCVS 的线性控制关系与无源符号约定：$v_s = \mu v_x, \qquad p_s = -v_s i_{\text{out}} \quad (\text{电流 } i_{\text{out}} \text{ 从受控源正极流出})$`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式：校验增益 $\mu$ 的量纲：`,
          tex: String.raw`[\mu] = \frac{[v_s]}{[v_x]} = \frac{\text{V}}{\text{V}} = 1 \quad (\text{无量纲电压放大倍数})`,
        },
        { kind: 'formula', title: String.raw`将 $v_s = \mu v_x$ 代入功率公式，得受控源对外输出功率（以吸收功率记为负值）：`, tex: String.raw`p_s = -(\mu v_x)\,i_{\text{out}}` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A · 输出电压与功率',
              text: String.raw`设某麦克风前置放大级等效为一个 VCVS，电压增益 $\mu = 10$，麦克风端输入电压 $v_x = 0.5\text{ V}$，此时放大级向外接扬声器送出电流 $i_{\text{out}} = 0.4\text{ A}$（从受控源正极流出）：`,
              tex: String.raw`\begin{aligned} v_s &= \mu v_x = 10 \times 0.5\text{ V} = 5.0\text{ V} \\ p_s &= -v_s i_{\text{out}} = -(5.0\text{ V})(0.4\text{ A}) = -2.0\text{ W} \end{aligned}`,
            },
            { label: 'Step B · 结论', text: String.raw`该 VCVS 正在向扬声器**发出 $2.0\text{ W}$ 功率**（这些能量在真实硬件里来自运放背后的直流供电轨）。` },
          ],
        },
      ],
      inline_svg: SVG_ACT5,
      figure_caption: '四类受控源标准菱形符号全景图',
    },
    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式分步引导例题——含受控源电路的功率守恒实战',
      sync: { layer: 'dep_sources', halo: ['dep_diamond', 'cccs_beta'], params: { dep_type: 'CCCS', dep_x: 5, dep_k: 0.2, dep_ext: 8, dep_opamp: false } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`光看定义还不够，我们现在把今天学的三件武器——**无源符号约定**、[[dep_diamond|**受控源读数**]]和**功率守恒 $\sum p = 0$**——拧成一股绳，来拆一道 Alexander & Sadiku 风格的经典综合题。`,
        },
        {
          kind: 'guided',
          title: '含 CCCS 受控源电路的功率守恒校验',
          source: 'Alexander & Sadiku 风格综合题',
          problem: String.raw`**题干**：如下图所示电路包含 4 个元件：左侧为 $20\text{ V}$ 独立电压源（$p_1$），上方为 $12\text{ V}$ 元件（$p_2$），流经它们的电流为 $I = 5\text{ A}$；中间竖直支路为 $8\text{ V}$ 元件（$p_3$），向下电流为 $6\text{ A}$；最右侧是一个[[cccs_beta|**电流控制电流源（CCCS）** $0.2 I$]]（$p_4$），方向向上，与其并联的端电压同样为 $8\text{ V}$（上正下负）。请分 3 步算出每个元件的功率，并校验全电路是否满足 $\sum p = 0$。`,
          problem_svg: SVG_ACT6,
          steps: [
            {
              title: 'Step 1 · 拆解左侧支路：计算 p₁ 与 p₂',
              mini_svg: SVG_STEP1,
              question: '先看左侧的 20 V 独立源（p₁）和上方的 12 V 元件（p₂）。电流 I = 5 A 顺时针流动，按无源符号约定，p₁ 和 p₂ 的吸收功率分别是多少？',
              options: [
                {
                  text: 'p₁ = −100 W，p₂ = +60 W',
                  correct: true,
                  feedback:
                    '非常敏锐！电流 I = 5 A 从 20 V 电源的正极（+）流出，所以 p₁ = −(20)(5) = −100 W（对外发出 100 W）；接着它从 12 V 元件的左端正极（+）流入，所以 p₂ = +(12)(5) = +60 W（吸收 60 W）。',
                },
                {
                  text: 'p₁ = +100 W，p₂ = +60 W',
                  correct: false,
                  feedback: '停一下！看看 20 V 圆形电源的顶端：箭头 I = 5 A 是从正极（+）流出来的，还是流进去的？正极流出必须补负号，p₁ = −vi！',
                },
                {
                  text: 'p₁ = −100 W，p₂ = −60 W',
                  correct: false,
                  feedback: 'p₁ 的符号判断很准，但再盯一眼 12 V 元件左侧的“+”号：电流是从左边流进正极的，满足无源符号约定，所以 p₂ 应该是 +60 W 而不是负值。',
                },
              ],
              hint: '顺着蓝色箭头 I = 5 A 走一遍：离开 20 V 的“+”端（取负），一头扎进 12 V 的“+”端（取正）。',
              board: [
                String.raw`\text{① 公理溯源：} p_{\text{abs}} = \pm vi \quad (\text{正进取 } +, \text{ 正出取 } -)`,
                String.raw`\text{② 纯符号通式：} p_1 = -v_1 I,\quad p_2 = +v_2 I`,
                String.raw`\text{③ 代入数值：} p_1 = -(20\text{ V})(5\text{ A}) = -100\text{ W},`,
                String.raw`\phantom{\text{③ 代入数值：}} p_2 = +(12\text{ V})(5\text{ A}) = +60\text{ W}`,
              ],
              halo: ['dep_control'],
            },
            {
              title: 'Step 2 · 攻克菱形受控源：计算 p₃ 与 p₄',
              mini_svg: SVG_STEP2,
              question:
                '现在看右侧并联的两条支路（端电压均为上正下负 8 V）。已知 I = 5 A，中间元件 p₃ 向下流过 6 A，右侧 CCCS 受控源为 0.2I 且箭头向上。请问 p₃ 和 p₄ 分别是多少？',
              options: [
                {
                  text: 'p₃ = +48 W，p₄ = +8 W',
                  correct: false,
                  feedback: '你把 0.2 × 5 = 1 A 算对了，但掉进了最常见的符号陷阱！看菱形里的箭头是朝上的，而电压的“+”号在上方——电流从上端“+”流出，按 PSC 必须取负号 p₄ = −vi！',
                },
                {
                  text: 'p₃ = +48 W，p₄ = −8 W',
                  correct: true,
                  feedback:
                    '精准命中！受控源电流 i₄ = 0.2 × 5 A = 1 A，箭头向上意味着它从上端正极（+）流出，所以 p₄ = −(8 V)(1 A) = −8 W，这个受控源也在协同向外供电！而中间 6 A 向下进入正极，p₃ = +(8)(6) = +48 W。',
                },
                {
                  text: 'p₃ = −48 W，p₄ = −8 W',
                  correct: false,
                  feedback: '再确认一下中间支路 p₃：电压是上正下负，6 A 电流是向下流进顶端的“+”号的，所以 p₃ 是吸收功率（+48 W）。',
                },
              ],
              hint: '先算受控源电流 i₄ = 0.2I = 0.2 × 5 = 1 A；再看箭头方向相对上方“+”号是流入还是流出。',
              board: [
                String.raw`\text{① 公理溯源：} i_4 = \beta I,\quad p_{\text{abs}} = \pm vi`,
                String.raw`\text{② 纯符号通式：} p_3 = +v_3 i_3,\quad p_4 = -v_4 (0.2 I)`,
                String.raw`\text{③ 代入数值：} p_3 = +(8\text{ V})(6\text{ A}) = +48\text{ W},`,
                String.raw`\phantom{\text{③ 代入数值：}} p_4 = -(8\text{ V})(0.2 \times 5\text{ A}) = -8\text{ W}`,
              ],
              halo: ['dep_diamond', 'cccs_beta'],
              params: { dep_type: 'CCCS', dep_x: 5, dep_k: 0.2, dep_ext: 8 },
            },
            {
              title: 'Step 3 · 终极对账：校验功率守恒 ∑p = 0',
              mini_svg: SVG_STEP3,
              question: '把四个元件的功率全部汇总：p₁ = −100 W，p₂ = +60 W，p₃ = +48 W，p₄ = −8 W。关于该电路的能量收支，以下哪项结论完全正确？',
              options: [
                {
                  text: '∑p = 0 W；独立源与受控源共发出 108 W，两个无源元件共吸收 108 W',
                  correct: true,
                  feedback: '满分通关！−100 + 60 + 48 − 8 = 0 W。你会发现，受控源虽然听命于外部变量 I，但它在能量账本上同样可以充当“有源元件”，与独立源一起对外输出 108 W 的功率！',
                },
                {
                  text: '∑p = +16 W；电路能量不守恒，受控源产生了额外能量',
                  correct: false,
                  feedback:
                    '算术没算错，但你把 p₄ 的符号当成 +8 W 了！回头看第 2 步：p₄ = −8 W，所以 (−100) + 60 + 48 + (−8) 严格等于 0 W。任何物理合法的电路都不可能违背能量守恒。',
                },
                {
                  text: '∑p = 0 W；仅由独立源发出 100 W，其余三个元件共同吸收 100 W',
                  correct: false,
                  feedback: '仔细看 p₄ = −8 W 的负号：它是负的，说明受控源也在发出功率，而不是在吸收功率。总发出功率是 100 + 8 = 108 W。',
                },
              ],
              hint: '把所有负值（发出）归为一类求和，所有正值（吸收）归为一类求和，看看两边是不是严丝合缝。',
              board: [
                String.raw`\text{① 公理溯源：} \sum_{k=1}^{4} p_k = 0`,
                String.raw`\text{② 纯符号通式：} p_1 + p_2 + p_3 + p_4 = 0`,
                String.raw`\text{③ 代入数值：} (-100) + (+60) + (+48) + (-8) = -108 + 108 = 0\text{ W} \quad (\text{校验通过})`,
              ],
              halo: ['dep_diamond'],
            },
          ],
        },
      ],
    },
    /* ------------------------------------------------------------- act 7 */
    {
      act_index: 7,
      badge: '第 7 幕',
      title: '随堂自测与下节预告（W1-L3 欧姆定律）',
      sync: { layer: 'psc_workbench', halo: ['psc_enter', 'v_polarity'] },
      blocks: [
        {
          kind: 'p',
          text: String.raw`在合上今天这本“功率账本”之前，请你独立完成下面 2 道随堂自测题。它们专门针对本节课最容易失分的两个高危点：**负电压叠加无源符号约定**，以及**用 $\sum p = 0$ 反推受控源支路电流**。`,
        },
        { kind: 'p', text: '**下节预告：W1-L3 欧姆定律、电阻与焦耳热功率**' },
        {
          kind: 'p',
          text: String.raw`今天我们只用通用黑盒讨论了 $p = vi$，还没有拆开最常见的无源元件——**电阻（Resistor）**。下一节课 **W1-L3**，我们将引入电路学的第一条元件约束定律——**欧姆定律（$v = iR$）**。当你把 $v = iR$ 代入今天刚学完的 $p = vi$，会瞬间撞见著名的焦耳热公式：`,
        },
        { kind: 'formula', title: '焦耳热公式（W1-L3 预告）', tex: String.raw`p = i^2 R = \frac{v^2}{R} \ge 0` },
        {
          kind: 'p',
          text: String.raw`因为平方项永远非负，这从数学上彻底锁死了：**只要电阻 $R > 0$，它就永远只能吸收电能并转化为热量，绝无可能对外发电**。同时，我们也将正式告别纯公式热身，在 W1-L3 第一次点亮 Breadboard Lab 的实测面包板！`,
        },
      ],
      inline_svg: SVG_ACT7,
      figure_caption: '随堂自测配图与下节 W1-L3 欧姆定律桥梁图',
      quiz: [
        {
          id: 'w1l2_q1',
          question: '如上图所示，某二端元件的参考电压为 v = −10 V，参考电流 i = 4 A 从参考正极（+）流入。关于该元件的功率，以下哪项正确？',
          options: [
            {
              key: 'A',
              text: '吸收 40 W 功率',
              correct: false,
              feedback: String.raw`符号没跟上：$v = -10\text{ V}$ 本身就是负的。电流从参考正极流入，取 $p_{\text{abs}} = +vi$，再把 $-10$ 原样代进去，结果是正还是负？`,
            },
            { key: 'B', text: '发出 40 W 功率', correct: true },
            { key: 'C', text: '吸收 2.5 W 功率', correct: false, feedback: String.raw`$2.5$ 是 $10 \div 4$——功率是电压与电流的**乘积** $p = vi$，不是比值。` },
            {
              key: 'D',
              text: '无法判断，因为不知道内部是电阻还是电源',
              correct: false,
              feedback: '无源符号约定只看参考方向和代数值，不需要知道黑盒里装的是什么：先按“正进取 +vi”选好公式，再代入数值，符号自己会告诉你答案。',
            },
          ],
          feedback_correct: String.raw`答对了！① 公理溯源：电流从参考正极(+)流入，满足无源符号约定 $p_{\text{abs}} = +vi$；② 纯符号通式：$p_{\text{abs}} = +vi$；③ 代入数值：$p_{\text{abs}} = +(-10\text{ V})(4\text{ A}) = -40\text{ W} < 0 \implies$ 该元件实际发出 $40\text{ W}$ 功率。`,
          feedback_wrong: '再按无源符号约定走一遍：先看电流从哪一端流入，选好 +vi 还是 −vi，再把带符号的 v 代进去。',
          sync: { layer: 'psc_workbench', halo: ['psc_enter', 'v_polarity'], params: { psc_v: 0, psc_i: 4, psc_topPlus: true, psc_iEntersTop: true, psc_dt: 10 } },
        },
        {
          id: 'w1l2_q2',
          question:
            '某闭合电路仅包含 3 个元件：独立电源发出 50 W，一个无源负载吸收 35 W，第三个元件是一个 VCVS（v_s = 3 v_x），已知控制电压 v_x = 5 V。若电流 i_s 从该 VCVS 的正极（+）流入，则 i_s 等于多少？',
          options: [
            {
              key: 'A',
              text: 'i_s = −1 A',
              correct: false,
              feedback: String.raw`注意电流 $i_s$ 从 VCVS 的**正极流入**，满足无源符号约定，$p_3 = +v_s i_s$。先用 $\sum p = 0$ 求出 $p_3$，看看它是正还是负。`,
            },
            { key: 'B', text: 'i_s = +1 A', correct: true },
            { key: 'C', text: 'i_s = +3 A', correct: false, feedback: String.raw`$3$ 是电压增益 $\mu$，不是电流。先算 $v_s = \mu v_x$，再由 $p_3 = v_s i_s$ 求电流。` },
            {
              key: 'D',
              text: 'i_s = +5 A',
              correct: false,
              feedback: String.raw`$5\text{ V}$ 是控制电压 $v_x$，不是 $i_s$。先由 $\sum p = 0$ 得出 $p_3$，再除以 $v_s = 3 \times 5\text{ V}$。`,
            },
          ],
          feedback_correct: String.raw`答对了！① 公理溯源：$\sum p = 0,\; v_s = \mu v_x,\; p_3 = +v_s i_s$；② 纯符号通式：$p_3 = -(p_1 + p_2),\; i_s = \frac{p_3}{\mu v_x}$；③ 代入数值：$p_1 = -50\text{ W},\; p_2 = +35\text{ W} \implies p_3 = -(-50 + 35) = +15\text{ W}$；又 $v_s = 3 \times 5\text{ V} = 15\text{ V}$，故 $i_s = \frac{+15\text{ W}}{15\text{ V}} = +1\text{ A}$。`,
          feedback_wrong: String.raw`先把三个元件的吸收功率按符号写好（发出记负、吸收记正），用 $\sum p = 0$ 求出 VCVS 的 $p_3$，再除以它的端电压。`,
          sync: { layer: 'dep_sources', halo: ['vcvs_opamp', 'dep_control'], params: { dep_type: 'VCVS', dep_x: 5, dep_k: 3, dep_ext: 0, dep_opamp: false } },
        },
      ],
    },
  ],
};

export default W1_L2;
