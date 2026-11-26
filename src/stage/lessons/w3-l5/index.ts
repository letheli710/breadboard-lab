// W3-L5 · 反相加法器：Summing Amplifier 与音频混音直觉 (lesson sheet: docs/lessons/W3-L5.md).
// The professor's text of the six acts, the act diagrams (svgs.ts), the guided example and the
// self-test are reproduced from the sheet; [[id|…]] only links a term to the stage (the words are
// unchanged). Changes from the sheet, of form:
// - `$$…$$` display formulas sit in the ② blue / ③ green cards, the lead-in sentence as the card's
//   title; the numbered axioms of act 2's ① follow its card as a list, those of act 4's ① run as
//   one paragraph; the sub-bullets of a calc step share one aligned formula; the section headings
//   (### …) are bold lines; act 4's 深度验算 block quote is a ③ card (Step A–C);
// - in the guided example and the quiz, symbols the sheet writes in plain text (v_-, i1, Rf …) are
//   set in TeX; the step prompts split into a title and the question; act 4's table writes
//   |−8.00 V| with plain bars (the sheet's markdown-escaped `\|` would render as ‖ in KaTeX);
// - act 6: the sheet's title is 「诊断测验与 Claude 工程落地清单」; the checklist and the stage
//   architecture diagram are build instructions, not lesson text, so they are left out and the act
//   is the quiz; its diagram (figures.ts) is new;
// - anti-spoiler: the guided example (act 5) is not the worked example of any act, so no ③ card
//   moves; the stage's mixer preset (layer 03) is that example, so its readouts stay covered while
//   the steps are open and `done_params` uncovers them; the step 5 diagram, which drew the clipped
//   output, is redrawn (figures.ts);
// - fixed: step 1's intercept for option B said the simple average 0.7 V is what a passive
//   resistor mixer gives; that holds only for equal resistors with no load (here 4 / 6 / 12 kΩ
//   would give 1.0 V), so the sentence now says so;
// - added (the sheet has none): the hover map; one line in acts 1 and 4 pointing to the stage; the
//   right-answer remarks of the guided steps and its closing line; feedback for each wrong quiz
//   option (from the sheet's explanations and misconception notes); the quiz diagrams.

import { lazy } from 'react';
import type { StageLesson } from '../../types';
import { MINI_STEP5, SVG_ACT6, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './figures';
import { L1, L2, L3 } from './parts';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5 } from './svgs';

const VirtualGroundLayer = lazy(() => import('./VirtualGroundLayer'));
const MixerLayer = lazy(() => import('./MixerLayer'));
const SaturationLayer = lazy(() => import('./SaturationLayer'));

const R = String.raw;

/** layer 03 set to the act 5 mixer (the guided example), `shown` = steps solved */
const MIX3 = (shown: number, boost = false) => ({ w35_amp: 'socratic_3ch_mixer', w35_vcc: 10, w35_rl: 4, w35_boost: boost, w35_shown: shown });
const EX56 = { w35_amp: 'sadiku_example_5_6', w35_vcc: 12, w35_rl: 2, w35_boost: false };

const W3_L5: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: VirtualGroundLayer, [L2]: MixerLayer, [L3]: SaturationLayer },
  lesson_meta: {
    lesson_id: 'W3-L5',
    world: 'World 3',
    title: '反相加法器：Summing Amplifier 与音频混音直觉',
    subtitle: '虚地隔离防串扰、多路电流无损汇流与电源轨饱和边界验算',
    lesson_type: 'B',
    lesson_type_label: 'Type B · 纯公式与方法论课（2D 交互原理图驱动）',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Section 5.6 Summing Amplifier（p. 183–185；Fig. 5.17、Fig. 5.18、Eq. 5.14、Example 5.6）'],
    },
    prerequisites: ['W1-L5 KCL（基尔霍夫电流定律）', 'W2-L5 叠加定理（Superposition Theorem）', 'W3-L3 反相放大器（Inverting Amplifier）'],
    learning_objectives: [
      '定量阐明无源电阻直连混音产生通道串扰与加载效应的物理根源，并对比运放虚地节点的零电位隔离机制',
      '掌握三段式推导（公理溯源 → 纯符号通式 → 代入数值逐步化简），导出三路及多路加权反相加法器通式 Eq. 5.14',
      '能根据工程需求快速设计等权加法器、反相平均器、多轨音频混音器以及双极性转单极性电平偏置移位电路',
      '完整求解 Sadiku Example 5.6 的输出电压、反馈电流、负载电流与运放输出电流，并定量检验电源轨饱和边界及饱和后虚地瓦解现象',
    ],
    next_lesson: 'W3-L6',
    next_lesson_title: '差分放大器（双解法推导与共模抑制）',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 虚地防串扰汇流原理图',
        short: '01 虚地汇流',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '两种架构对照：无源电阻直连（公共节点浮动，RL = 10 kΩ）与运放虚地加法器（Rf = 10 kΩ）。v₁ = 2.0 V 固定，拖动 v₂，看通道 1 的电流 i₁ 与串扰误差变不变；橙色箭头表示电流反向倒灌。',
      },
      {
        id: L2,
        label: '02 多路加权电流实时合成台',
        short: '02 加权合成',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '三通道混音台：预设决定各路输入电阻 Rₖ，Rf 滑块是总音量；箭头粗细随 |iₖ| 变化，每路标出权重 wₖ = Rf / Rₖ。下方把 −wₖvₖ 首尾相接成 vₒ；电平移位预设则画出双极性信号被抬进 ADC 窗口 [0, 3.3 V] 的波形。',
      },
      {
        id: L3,
        label: '03 反相加法器与饱和边界验算台',
        short: '03 饱和边界',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          'Sadiku Example 5.6 与第 5 幕三路混音：调电源轨 ±VCC 与负载 RL。理想输出超出电源轨时，输出钉在轨上、运放变红，反相端 v₋ 由 KCL 反算（虚地瓦解）；下方标尺比较理想输出（空心）与实际输出（实心）。第 5 幕实战题的数值在引导例题解到之前先遮住。',
      },
    ],
    hover_map: {
      hl_v1: { label: '通道 1 输入支路（v₁、R₁、i₁）', desc: '主唱：线性区内 i₁ = v₁ / R₁，只由自己这一路决定' },
      hl_v2: { label: '通道 2 输入支路（v₂、R₂、i₂）', desc: '吉他：线性区内 i₂ = v₂ / R₂' },
      hl_v3: { label: '通道 3 输入支路（v₃、R₃、i₃）', desc: '贝斯：负电压时 i₃ < 0，从节点 a 往外抽电流（橙色反向箭头）' },
      hl_vmix: { label: '无源公共节点 v_mix', desc: '电位浮动：谁的电压大，谁就把节点抬高，把别的通道电流顶回去' },
      hl_crosstalk: { label: '串扰回流路径', desc: 'v₂ 静音时主唱电流倒灌进吉他口；v₂ 变大时 v_mix 被抬高，i₁ 被压制' },
      hl_rl: { label: '负载电阻 RL', desc: '无源直连时接在公共节点上；加法器里接在输出端到地' },
      hl_vground: { label: '节点 a · 虚地（v₋ = 0 V）', desc: '负反馈 + 同相端接地：线性区内 v₋ = v₊ = 0 V，各路互不影响；饱和后不再成立' },
      hl_opamp: { label: '理想运放（同相端接地）', desc: '虚断 i₋ = i₊ = 0；线性区内虚短 v₋ = v₊' },
      hl_rf: { label: '反馈电阻 Rf（总音量 Master）', desc: '所有权重 wₖ = Rf / Rₖ 同时随它缩放' },
      hl_if: { label: '反馈电流 i_f', desc: '虚断：流入节点 a 的电流全部经 Rf 流走，i_f = Σ iₖ（虚地 → 输出为正）' },
      hl_vo: { label: '输出电压 vₒ', desc: 'vₒ = −i_f·Rf = −Σ (Rf / Rₖ)·vₖ（线性区）' },
      hl_weights: { label: '通道权重 wₖ = Rf / Rₖ', desc: 'Rₖ 越小，这一路音量越大：输入电阻是“反向推子”' },
      hl_sum: { label: '加权求和条', desc: '各路贡献 −wₖvₖ 首尾相接，终点就是 vₒ（叠加定理）' },
      hl_shift: { label: '电平偏置移位 · ADC 窗口', desc: '叠加 Vref = −3.3 V（w = 0.5）：vₒ = −v_sig + 1.65 V，落进 [0, 3.3 V]' },
      hl_il: { label: '负载电流 i_L = vₒ / RL', desc: '输出为负时 i_L < 0：电流从地经 RL 倒流向输出端' },
      hl_io: { label: '运放输出电流 iₒ = i_L − i_f', desc: '负值表示电流灌入（Sink）运放输出端' },
      hl_rails: { label: '电源轨 ±VCC', desc: '线性区边界：−VCC ≤ vₒ ≤ +VCC' },
      hl_sat: { label: '饱和削波 · 虚地瓦解', desc: '理想输出越过电源轨：vₒ 钉在轨上，虚短失效，v₋ 由 KCL 反算（虚断仍近似成立）' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '工程痛点——为什么不能用普通电阻把多路音源直接拧在一起？',
      sync: { layer: L1, halo: ['hl_vmix', 'hl_crosstalk'], params: { w35_topo: 'passive', w35_l1v2: 0 } },
      blocks: [
        { kind: 'p', text: '**教授开场白**' },
        {
          kind: 'p',
          text: '各位同学，今天我们把实验室变成一间录音棚。假设你手里有两路音源：一路是主唱麦克风信号 $v_1$，另一路是木吉他信号 $v_2$，你想把它们混合成一路输出送给功放或耳机。',
        },
        {
          kind: 'p',
          text: R`一个刚学完分压器的初学者可能会立刻拍大腿：“这还不简单？给 $v_1$ 串一个 $10\text{ k}\Omega$ 电阻，给 $v_2$ 也串一个 $10\text{ k}\Omega$ 电阻，再把两根线的尾巴直接拧在一起接到负载 $R_L = 10\text{ k}\Omega$ 上不就行了吗？”`,
        },
        {
          kind: 'p',
          text: '**千万别这么干！** 一旦你把无源电阻的尾巴直接拧在一起，就会遭遇模拟电路里最令人头疼的[[hl_crosstalk|**通道串扰与加载效应（Crosstalk & Loading Effect）**]]。',
        },
        { kind: 'p', text: '让我们先看一眼左右两种架构的物理真相：' },
        { kind: 'figure', svg: SVG_ACT1, caption: '无源电阻直连串扰与运放虚地隔离对比图' },
        { kind: 'p', text: '**定量对比：为什么无源混音一定会“打架”？**' },
        {
          kind: 'p',
          text: R`我们用一组最直观的数字（已由 Python 精确验算）来验证这两者的天壤之别：设 $R_1 = R_2 = R_L = R_f = 10\text{ k}\Omega$，固定主唱通道 $v_1 = 2.0\text{ V}$，现在让吉他通道 $v_2$ 从 $0\text{ V}$（静音）推到 $4.0\text{ V}$（扫弦高潮）：`,
        },
        {
          kind: 'table',
          head: ['测试架构', R`工况 A：$v_1=2.0\text{ V},\ v_2=0.0\text{ V}$`, R`工况 B：$v_1=2.0\text{ V},\ v_2=4.0\text{ V}$`, '通道 1 电流 $i_1$ 变化', '工程诊断'],
          rows: [
            [
              '[[hl_vmix|**无源电阻直连**]]',
              R`$v_{\text{mix}} = 0.667\text{ V}$，$i_1 = 0.133\text{ mA}$，$i_2 = -0.067\text{ mA}$`,
              R`$v_{\text{mix}} = 2.000\text{ V}$，$i_1 = 0.000\text{ mA}$，$i_2 = 0.200\text{ mA}$`,
              '**骤降 100%（彻底被顶死）**',
              '严重串扰：$v_2$ 静音时主唱电流倒灌进吉他口；$v_2$ 变大时主唱被压制',
            ],
            [
              '[[hl_vground|**运放虚地加法器**]]',
              R`$v_- = 0.000\text{ V}$，$i_1 = 0.200\text{ mA}$，$i_2 = 0.000\text{ mA}$，$v_o = -2.00\text{ V}$`,
              R`$v_- = 0.000\text{ V}$，$i_1 = 0.200\text{ mA}$，$i_2 = 0.400\text{ mA}$，$v_o = -6.00\text{ V}$`,
              '**0.0% 变化（纹丝不动）**',
              '完美隔离：虚地节点把各通道彻底解耦为独立电流源',
            ],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授点睛**：把多路电阻直接拧在一起，公共节点 [[hl_vmix|$v_{\text{mix}}$]] 的电位是**浮动**的——谁嗓门大，谁就把节点电压抬高，直接把其他通道的电流顶回去。而反相加法器通过负反馈把反相输入端死死钉在[[hl_vground|**虚地（Virtual Ground，$v_- = 0\text{ V}$）**]]。对第 $k$ 路输入源而言，它看到的永远是一端接地的纯电阻 $R_k$，根本“看不见”隔壁还有没有其他通道，因此支路电流永远严格满足 $i_k = v_k / R_k$，在虚地节点无损汇流！`,
        },
        {
          kind: 'p',
          text: R`左侧 01 舞台可以亲手试：在两种架构之间切换，把 $v_2$ 从 $0\text{ V}$ 推到 $4.0\text{ V}$，看 $i_1$ 和串扰误差怎样变化。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '虚地汇流与三段式教授板书推导（Sadiku Fig. 5.17 & Eq. 5.14）',
      sync: { layer: L2, halo: ['hl_vground', 'hl_if'], params: { w35_mix: 'weighted_mixer', w35_v1: 1, w35_v2: 0.5, w35_v3: -2, w35_rf: 20 } },
      blocks: [
        { kind: 'p', text: '**标准三路反相加法器原理图（沿 Sadiku Fig. 5.17）**' },
        { kind: 'p', text: '下面我们把通道数扩展到教材标准的三路输入（Sadiku Fig. 5.17），并在图中明确标出每一个节点电位与电流参考方向：' },
        { kind: 'figure', svg: SVG_ACT2, caption: 'Sadiku Fig. 5.17 三路输入反相加法器完整原理图' },
        { kind: 'p', text: '**三段式教授板书推导（严禁符号与数字混写）**' },
        { kind: 'origin', title: '① 公理溯源', text: '本电路建立在三条铁打不动的电路公理之上：' },
        {
          kind: 'ol',
          items: [
            R`**理想运放虚短公理（Virtual Short）**：由于存在负反馈且运放工作在线性区，两输入端电位相等。又因同相端直接接地，故[[hl_vground|节点 $a$ 为虚地节点]]：$v_a = v_- = v_+ = 0\text{ V}$`,
            R`**理想运放虚断公理（Virtual Open）**：[[hl_opamp|理想运放]]输入阻抗无穷大，没有电流流入运放输入端：$i_- = i_+ = 0\text{ A}$`,
            R`**节点 $a$ 处基尔霍夫电流定律（KCL，${'`'}W1-L5${'`'}）与欧姆定律**：流入节点 $a$ 的各支路电流之和，必须全部经由[[hl_rf|反馈电阻 $R_f$]] 流出：$i_1 + i_2 + i_3 = i_- + i_f = i_f$`,
          ],
        },
        {
          kind: 'formula',
          title: '② 纯符号通式：将每一条输入支路及反馈支路的欧姆定律表达式代入节点 $a$ 的 KCL 方程：',
          tex: R`i_1 = \frac{v_1 - v_a}{R_1},\quad i_2 = \frac{v_2 - v_a}{R_2},\quad i_3 = \frac{v_3 - v_a}{R_3},\quad i_f = \frac{v_a - v_o}{R_f}`,
        },
        {
          kind: 'formula',
          title: '代入虚地条件 $v_a = 0$，得：',
          tex: R`\frac{v_1}{R_1} + \frac{v_2}{R_2} + \frac{v_3}{R_3} = \frac{0 - v_o}{R_f} = -\frac{v_o}{R_f}`,
        },
        {
          kind: 'formula',
          title: '两边同乘 $-R_f$，即得 **Sadiku Eq. (5.14)**：',
          tex: R`v_o = -\left(\frac{R_f}{R_1}v_1 + \frac{R_f}{R_2}v_2 + \frac{R_f}{R_3}v_3\right)`,
        },
        {
          kind: 'formula',
          title: R`若将输入扩展至 $n$ 路，令第 $k$ 路通道[[hl_weights|权重系数 $w_k = \frac{R_f}{R_k}$]]，则一般多路通式为：`,
          tex: R`v_o = -\sum_{k=1}^{n} \frac{R_f}{R_k} v_k = -\sum_{k=1}^{n} w_k v_k`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**叠加定理交叉印证（链接 ${'`'}W2-L5${'`'} & ${'`'}W3-L3${'`'}）**：由于理想运放在线性区是严格线性元件，令 $v_2 = v_3 = 0$ 时，虚地节点 $v_- = 0\text{ V}$ 使 $R_2, R_3$ 两端电位均为 $0\text{ V}$（零电流、如同开路），电路退化为标准反相放大器，$v_{o1} = -\frac{R_f}{R_1}v_1$。同理得 $v_{o2} = -\frac{R_f}{R_2}v_2$、$v_{o3} = -\frac{R_f}{R_3}v_3$，三者[[hl_sum|相加]]完全吻合 Eq. (5.14)！`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简：以一组三路测试信号演示严格代入规范：已知 $R_f = 20\text{ k}\Omega$，$R_1 = 10\text{ k}\Omega$（$v_1 = 1.0\text{ V}$），$R_2 = 5\text{ k}\Omega$（$v_2 = 0.5\text{ V}$），$R_3 = 20\text{ k}\Omega$（$v_3 = -2.0\text{ V}$）。`,
          steps: [
            { label: '**写出纯符号通式**', tex: R`v_o = -\left(\frac{R_f}{R_1}v_1 + \frac{R_f}{R_2}v_2 + \frac{R_f}{R_3}v_3\right)` },
            {
              label: '**整行代入带单位数值**',
              tex: R`v_o = -\left(\frac{20\text{ k}\Omega}{10\text{ k}\Omega}\times 1.0\text{ V} + \frac{20\text{ k}\Omega}{5\text{ k}\Omega}\times 0.5\text{ V} + \frac{20\text{ k}\Omega}{20\text{ k}\Omega}\times (-2.0\text{ V})\right)`,
            },
            {
              label: '**逐项化简权重与加权电压**',
              tex: R`v_o = -\left(2 \times 1.0\text{ V} + 4 \times 0.5\text{ V} + 1 \times (-2.0\text{ V})\right) = -(2.0\text{ V} + 2.0\text{ V} - 2.0\text{ V}) = -2.0\text{ V}`,
            },
            {
              label: '**支路电流验算（独立 KCL 校核）**',
              tex: R`\begin{aligned} i_1 &= \frac{1.0\text{ V}}{10\text{ k}\Omega} = 0.100\text{ mA} \\ i_2 &= \frac{0.5\text{ V}}{5\text{ k}\Omega} = 0.100\text{ mA} \\ i_3 &= \frac{-2.0\text{ V}}{20\text{ k}\Omega} = -0.100\text{ mA} \\ i_f &= i_1 + i_2 + i_3 = 0.100 + 0.100 - 0.100 = 0.100\text{ mA} \\ v_o &= -i_f R_f = -(0.100\text{ mA})(20\text{ k}\Omega) = -2.0\text{ V}\ \text{（验算一致）。} \end{aligned}`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '三种核心工程变体——等权加法器、反相平均器与音频混音/电平偏置移位',
      sync: { layer: L2, halo: ['hl_weights', 'hl_shift'], params: { w35_mix: 'adc_level_shifter', w35_v1: 1, w35_rf: 10 } },
      blocks: [
        {
          kind: 'p',
          text: '反相加法器之所以成为模拟前端的“瑞士军刀”，全靠调节电阻比值 [[hl_weights|$w_k = R_f / R_k$]] 即可一秒切换三种完全不同的工程职能。',
        },
        { kind: 'figure', svg: SVG_ACT3, caption: '权重系数与音频混音通道滑块及电平偏置移位示意图' },
        { kind: 'p', text: '**三大高频工程拓扑速查**' },
        { kind: 'p', text: '**1. 等权加法器（Unity-Gain Summer）**' },
        { kind: 'ul', items: ['**选型条件**：令 $R_1 = R_2 = R_3 = R_f = R$。'] },
        { kind: 'formula', title: '**输出公式**：', tex: R`v_o = -(v_1 + v_2 + v_3)` },
        { kind: 'ul', items: ['**直觉**：每一路输入权重均为 $1$，直接对多路电压做纯净求和再反相。'] },
        { kind: 'p', text: '**2. 反相平均器（Inverting Averager）**' },
        {
          kind: 'formula',
          title: R`**选型条件**：若有 $n$ 路输入，令所有输入电阻相等 $R_1 = R_2 = \dots = R_n = R$，且取反馈电阻为输入电阻的 $\frac{1}{n}$，即：`,
          tex: R`R_f = \frac{R}{n}`,
        },
        { kind: 'formula', title: '**输出公式**：', tex: R`v_o = -\frac{1}{n}\left(v_1 + v_2 + \dots + v_n\right)` },
        {
          kind: 'ul',
          items: [
            R`**工程应用**：例如工业测温阵列中将 4 个温度传感器取 $R = 20\text{ k}\Omega$、$R_f = 5\text{ k}\Omega$，硬件级实时求平均，既防溢出又将随机白噪声标准差压低一半（$\frac{1}{\sqrt{4}} = 0.5$）。`,
          ],
        },
        { kind: 'p', text: '**3. 音频混音器与电平偏置移位（Audio Mixer & DC Level Shifter）**' },
        {
          kind: 'ul',
          items: [
            '**音频混音器**：在每一路输入端串联可调电位器（作为可变 $R_k$），即可独立调节单轨音量权重 [[hl_weights|$w_k = R_f/R_k$]]；而在反馈回路放置[[hl_rf|总电位器 $R_f$]]，即可一键控制所有通道的总音量（Master Gain），且各通道推子互不影响。',
            '[[hl_shift|**电平偏置移位（双极性 → 单极性 ADC）**]]：',
          ],
        },
        {
          kind: 'ul',
          items: [
            R`实际音频或交流传感器信号常为双极性 $v_{\text{sig}} \in [-1.0\text{ V}, +1.0\text{ V}]$，而常见单片机（STM32/ESP32）的 ADC 只能采集 $[0\text{ V}, 3.3\text{ V}]$，负半周会被直接削掉甚至损坏引脚。`,
            R`**解法**：使用两路反相加法器，通道 1 接 $v_{\text{sig}}$（取 $R_1 = R_f = 10\text{ k}\Omega$，$w_1 = 1$）；通道 2 接负参考直流源 $V_{\text{ref}} = -3.3\text{ V}$（取 $R_2 = 20\text{ k}\Omega$，$w_2 = \frac{10\text{ k}\Omega}{20\text{ k}\Omega} = 0.5$）。`,
          ],
        },
        {
          kind: 'calc',
          title: '**代入验证**：',
          steps: [
            { label: '代入', tex: R`v_o = -\left(1 \cdot v_{\text{sig}} + 0.5 \cdot (-3.3\text{ V})\right) = -v_{\text{sig}} + 1.65\text{ V}` },
            {
              label: '三个特征点',
              text: R`当 $v_{\text{sig}} = -1.0\text{ V}$ 时 $v_o = +2.65\text{ V}$；当 $v_{\text{sig}} = 0\text{ V}$ 时 $v_o = +1.65\text{ V}$；当 $v_{\text{sig}} = +1.0\text{ V}$ 时 $v_o = +0.65\text{ V}$。整段波形稳稳悬浮在 [[hl_shift|$[0.65\text{ V}, 2.65\text{ V}] \subset [0\text{ V}, 3.3\text{ V}]$ 安全区内]]！（若系统要求不反相，只需在后级再级联一级单位增益反相器，或在 MCU 软件里对采样值做 ${'`'}3.3V - v_adc${'`'} 即可。）`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '教材经典精讲——Sadiku Example 5.6 完整求解与饱和边界验算',
      sync: { layer: L3, halo: ['hl_io', 'hl_il'], params: EX56 },
      blocks: [
        { kind: 'p', text: '**题目与电路图（100% 沿 Sadiku Section 5.6 Example 5.6 / Fig. 5.18）**' },
        {
          kind: 'p',
          text: R`**Sadiku Example 5.6**：在下图所示理想运放加法电路中，已知两路输入分别为 $v_1 = 2\text{ V}$（经 $R_1 = 5\text{ k}\Omega$）、$v_2 = 1\text{ V}$（经 $R_2 = 2.5\text{ k}\Omega$），反馈电阻 $R_f = 10\text{ k}\Omega$，输出端接对地[[hl_il|负载电阻 $R_L = 2\text{ k}\Omega$]]。`,
        },
        {
          kind: 'ol',
          items: [
            '求输出电压 [[hl_vo|$v_o$]]、[[hl_if|反馈电流 $i_f$]]（取从虚地节点流向输出端为正方向）以及[[hl_io|运放输出端流出的总电流 $i_o$]]。',
            R`**工程边界检验**：若该运放分别采用 [[hl_rails|$\pm 12\text{ V}$ 与 $\pm 5\text{ V}$ 双电源]]供电，电路是否会发生[[hl_sat|饱和削波]]？若发生饱和，虚地电位 $v_-$ 会变成多少？`,
          ],
        },
        { kind: 'figure', svg: SVG_ACT4, caption: 'Sadiku Example 5.6 电路图与电流标注' },
        { kind: 'p', text: '**严格三段式板书求解**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. 假设运放工作在线性区，依据理想运放虚短与虚断公理：$v_- = v_+ = 0\text{ V}$，$i_- = 0\text{ A}$。 2. 节点 $a$ 处 KCL：$i_1 + i_2 = i_f$。 3. **[[hl_io|输出节点处 KCL（常见易错点！）]]**：运放输出端必须同时承担流向负载电阻 $R_L$ 的电流 $i_L$ 与流向反馈电阻 $R_f$ 的电流（注意方向：从输出端流向虚地节点的电流为 $-i_f$）：$i_o = i_L + (-i_f) = \frac{v_o - 0}{R_L} + \frac{v_o - v_-}{R_f}$ 4. **[[hl_rails|线性区边界条件]]**：输出电压必须满足 $-V_{CC} \le v_o \le +V_{CC}$；一旦越界，运放立即饱和削波，虚短条件 $v_- = 0\text{ V}$ 随即失效。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式',
          tex: R`\begin{gathered} v_o = -\left(\frac{R_f}{R_1}v_1 + \frac{R_f}{R_2}v_2\right) \\[4pt] i_1 = \frac{v_1}{R_1},\quad i_2 = \frac{v_2}{R_2},\quad i_f = i_1 + i_2 = -\frac{v_o}{R_f} \\[4pt] i_L = \frac{v_o}{R_L},\quad i_o = \frac{v_o}{R_L} + \frac{v_o}{R_f} = i_L - i_f \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '**求解输出电压 $v_o$**',
              tex: R`\begin{aligned} v_o &= -\left(\frac{10\text{ k}\Omega}{5\text{ k}\Omega} \times 2\text{ V} + \frac{10\text{ k}\Omega}{2.5\text{ k}\Omega} \times 1\text{ V}\right) \\ &= -(2 \times 2\text{ V} + 4 \times 1\text{ V}) = -(4\text{ V} + 4\text{ V}) = -8\text{ V} \end{aligned}`,
            },
            {
              label: '**求解各输入支路电流与反馈电流 $i_f$**',
              tex: R`\begin{gathered} i_1 = \frac{2\text{ V}}{5\text{ k}\Omega} = 0.4\text{ mA},\qquad i_2 = \frac{1\text{ V}}{2.5\text{ k}\Omega} = 0.4\text{ mA} \\[4pt] i_f = i_1 + i_2 = 0.4\text{ mA} + 0.4\text{ mA} = 0.8\text{ mA} \\[4pt] \text{（交叉校核：}i_f = \frac{0 - (-8\text{ V})}{10\text{ k}\Omega} = 0.8\text{ mA}\text{，完全吻合。）} \end{gathered}`,
            },
            {
              label: '**求解负载电流 $i_L$ 与运放输出总电流 $i_o$**',
              tex: R`\begin{gathered} i_L = \frac{-8\text{ V}}{2\text{ k}\Omega} = -4.0\text{ mA} \\[4pt] i_o = i_L - i_f = -4.0\text{ mA} - 0.8\text{ mA} = -4.8\text{ mA} \end{gathered}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**物理含义**：[[hl_io|$i_o = -4.8\text{ mA}$]] 中的负号表示电流实际**灌入（Sink）**运放输出端——左侧反馈支路涌来 $0.8\text{ mA}$，右侧负载电阻从地向 $-8\text{ V}$ 节点倒流来 $4.0\text{ mA}$，两股电流汇合成 $4.8\text{ mA}$ 被运放内部下拉晶体管吸走。`,
        },
        { kind: 'p', text: '**电源轨饱和边界检验（Saturation Boundary Check）**' },
        {
          kind: 'table',
          head: ['供电方案', R`理论线性解 $v_{o,\text{ideal}}$`, '边界判定', R`实际输出 $v_{o,\text{actual}}$`, '实际反相端电位 $v_-$', '反馈电流 $i_f$ 与隔离状态'],
          rows: [
            [
              R`**方案 A：$\pm 12\text{ V}$**`,
              R`$-8.00\text{ V}$`,
              R`$|-8.00\text{ V}| \le 12\text{ V}$（线性区）`,
              R`**$-8.00\text{ V}$**`,
              R`**$0.000\text{ V}$（虚地成立）**`,
              R`$i_f = 0.800\text{ mA}$，两通道完美隔离`,
            ],
            [
              R`**方案 B：$\pm 5\text{ V}$**`,
              R`$-8.00\text{ V}$`,
              R`$-8.00\text{ V} < -5\text{ V}$（[[hl_sat|**负向饱和削波**]]）`,
              R`**$-5.00\text{ V}$（钳位）**`,
              R`**$+\frac{3}{7}\text{ V} \approx +0.429\text{ V}$（虚地瓦解！）**`,
              R`$i_f = \frac{19}{35}\text{ mA} \approx 0.543\text{ mA}$，通道重新串扰`,
            ],
          ],
        },
        {
          kind: 'calc',
          title: '**深度验算（饱和后如何求真实 $v_-$？）**',
          steps: [
            {
              label: 'Step A',
              text: R`当供电仅为 $\pm 5\text{ V}$ 时，$v_o$ 被钉死在 $-5\text{ V}$，负反馈环路失去调节余量，虚短 $v_- = 0\text{ V}$ **不再成立**；但运放输入阻抗依然极高，虚断 $i_- \approx 0\text{ A}$ 仍可近似成立。对节点 $a$ 列 KCL：`,
              tex: R`\frac{v_- - 2\text{ V}}{5\text{ k}\Omega} + \frac{v_- - 1\text{ V}}{2.5\text{ k}\Omega} + \frac{v_- - (-5\text{ V})}{10\text{ k}\Omega} = 0`,
            },
            {
              label: 'Step B',
              text: R`两边同乘 $10\text{ k}\Omega$：`,
              tex: R`\begin{gathered} 2(v_- - 2) + 4(v_- - 1) + (v_- + 5) = 0 \\ \implies 7v_- = 3 \implies v_- = \frac{3}{7}\text{ V} \approx 0.429\text{ V} \end{gathered}`,
            },
            {
              label: 'Step C',
              text: R`此时 $i_1 = \frac{2 - 3/7}{5\text{ k}\Omega} \approx 0.314\text{ mA}$，$i_2 = \frac{1 - 3/7}{2.5\text{ k}\Omega} \approx 0.229\text{ mA}$，两路支路电流都因饱和被压扁，音频输出产生刺耳[[hl_sat|削波失真]]！`,
            },
          ],
        },
        {
          kind: 'p',
          text: R`左侧 03 验算台可以亲手验证：把电源轨从 $\pm 12\text{ V}$ 拖到 $\pm 5\text{ V}$，看输出怎样钉在电源轨上、反相端 $v_-$ 怎样离开 $0\text{ V}$。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '苏格拉底式分步引导例题（3 路不等权音频混音器实战）',
      sync: { layer: L3, halo: ['hl_vground'], params: { w35_amp: 'socratic_3ch_mixer', w35_vcc: 10, w35_rl: 4, w35_boost: false } },
      blocks: [
        { kind: 'p', text: '**实战任务背景与电路图**' },
        {
          kind: 'guided',
          title: '3 路不等权音频混音器分步求解与削波边界验算',
          problem: R`某录音棚 3 轨模拟混音模块采用反相加法器拓扑，[[hl_rails|供电电源轨为 $\pm 10\text{ V}$]]，反馈电阻 $R_f = 12\text{ k}\Omega$，输出端接后级功放等效负载 $R_L = 4\text{ k}\Omega$。当前三路瞬时输入信号如下：**CH1（主唱）**：$v_1 = 1.2\text{ V}$，$R_1 = 4\text{ k}\Omega$；**CH2（吉他）**：$v_2 = 1.5\text{ V}$，$R_2 = 6\text{ k}\Omega$；**CH3（贝斯）**：$v_3 = -0.6\text{ V}$，$R_3 = 12\text{ k}\Omega$。`,
          problem_svg: SVG_ACT5,
          // all five steps answered: layer 03 uncovers the example's numbers
          done_params: { w35_shown: 5 },
          steps: [
            {
              title: '第 1 步 · 锁定虚地节点电位与隔离前提',
              mini_svg: MINI_STEP1,
              question:
                '在动手算任何电流之前，先看同相输入端接地且存在 $R_f$ 负反馈。假设运放处于线性区，节点 $a$ 的电位 $v_-$ 等于多少？它为什么能防止主唱、吉他、贝斯三路互相串扰？',
              hint: R`$v_- = v_+ = 0\text{ V} \quad (\text{理想运放虚短公理})$`,
              options: [
                {
                  text: R`$v_- = 0\text{ V}$（虚地），各支路右端电位恒为 $0\text{ V}$，互不抬高或拉低彼此电位`,
                  correct: true,
                  feedback: R`对！负反馈把节点 $a$ 钉在 $v_+ = 0\text{ V}$：每一路只看见自己的 $R_k$ 一端接地，谁也抬不动谁的电位。`,
                },
                {
                  text: R`$v_- = (v_1 + v_2 + v_3) / 3 = 0.7\text{ V}$，由三路电阻分压决定`,
                  correct: false,
                  feedback: R`停一下！那是没有运放、三路电阻相等且不接负载时无源直连的结果。加上负反馈运放后，虚短公理会强制把 $v_-$ 钉死在 $v_+ = 0\text{ V}$，绝对不会随输入电压浮动！`,
                },
                {
                  text: R`$v_- = -10\text{ V}$，由负电源轨直接钳位`,
                  correct: false,
                  feedback: R`别把电源轨和输入端混为一谈：电源轨限制的是输出端 $v_o$ 的摆幅，而线性区反相输入端永远紧跟同相端 $v_+ = 0\text{ V}$。`,
                },
              ],
              board: [R`\text{Step 1: } v_a = v_- = v_+ = 0\text{ V},\quad i_- = 0\text{ A}`],
              halo: ['hl_vground', 'hl_opamp'],
              params: MIX3(0),
              layer: L3,
            },
            {
              title: '第 2 步 · 独立求解三路输入电流与通道权重',
              mini_svg: MINI_STEP2,
              question: '既然节点 $a$ 锁定在 $0\\text{ V}$，三路输入彻底解耦。请计算通道 1、2、3 的输入支路电流 $(i_1, i_2, i_3)$（向右流入节点 $a$ 为正）。',
              hint: R`$i_k = \frac{v_k - 0}{R_k},\quad w_k = \frac{R_f}{R_k}$`,
              options: [
                {
                  text: R`$i_1 = 0.30\text{ mA},\ i_2 = 0.25\text{ mA},\ i_3 = +0.05\text{ mA}$`,
                  correct: false,
                  feedback: R`注意贝斯通道的极性！$v_3 = -0.6\text{ V}$ 是负电压，按向右参考方向 $i_3 = (v_3 - 0) / R_3 = -0.6\text{ V} / 12\text{ k}\Omega = -0.05\text{ mA}$，正负号丢不得！`,
                },
                {
                  text: R`$i_1 = 0.30\text{ mA},\ i_2 = 0.25\text{ mA},\ i_3 = -0.05\text{ mA}$`,
                  correct: true,
                  feedback: R`正确：三路各算各的，$i_k = v_k / R_k$；贝斯通道是负电压，它在从节点 $a$ 往外抽电流。`,
                },
                {
                  text: R`$i_1 = 0.10\text{ mA},\ i_2 = 0.125\text{ mA},\ i_3 = -0.05\text{ mA}$`,
                  correct: false,
                  feedback: R`你把分母全都用成了 $R_f = 12\text{ k}\Omega$！每一路支路电流只看它自己的输入电阻 $R_k$，不要错代反馈电阻。`,
                },
              ],
              board: [
                R`\text{Step 2: } i_1 = \frac{1.2\text{ V}}{4\text{ k}\Omega} = 0.30\text{ mA},\ i_2 = \frac{1.5\text{ V}}{6\text{ k}\Omega} = 0.25\text{ mA},`,
                R`i_3 = \frac{-0.6\text{ V}}{12\text{ k}\Omega} = -0.05\text{ mA}`,
              ],
              halo: ['hl_v1', 'hl_v2', 'hl_v3'],
              params: MIX3(1),
              layer: L3,
            },
            {
              title: '第 3 步 · 节点 a 处 KCL 汇流求反馈总电流 $i_f$',
              mini_svg: MINI_STEP3,
              question: R`因为理想运放虚断 $i_- = 0\text{ A}$，三路支路电流汇入节点 $a$ 后无处可逃，必须全部流过反馈电阻 $R_f = 12\text{ k}\Omega$。请问反馈电流 $i_f$ 是多少？`,
              hint: '$i_f = i_1 + i_2 + i_3$',
              options: [
                {
                  text: R`$i_f = 0.60\text{ mA}$`,
                  correct: false,
                  feedback: R`你把 $i_3 = -0.05\text{ mA}$ 当成了正数加进去！负电压通道实际上在从节点 $a$ 抽走 $0.05\text{ mA}$，所以总汇流会减少而不是增加。`,
                },
                { text: R`$i_f = 0.50\text{ mA}$`, correct: true, feedback: R`正确：KCL 带符号相加，$0.30 + 0.25 - 0.05 = 0.50\text{ mA}$，全部流过 $R_f$。` },
                {
                  text: R`$i_f = 0.55\text{ mA}$`,
                  correct: false,
                  feedback: R`别漏掉 CH3！$0.30 + 0.25$ 只是前两路之和，还得代数加上第三路的 $-0.05\text{ mA}$。`,
                },
              ],
              board: [R`\text{Step 3: } i_f = 0.30\text{ mA} + 0.25\text{ mA} + (-0.05\text{ mA}) = 0.50\text{ mA}`],
              halo: ['hl_if', 'hl_rf'],
              params: MIX3(2),
              layer: L3,
            },
            {
              title: '第 4 步 · 计算输出电压 $v_o$ 与运放输出总电流 $i_o$',
              mini_svg: MINI_STEP4,
              question: R`已知 $i_f = 0.50\text{ mA}$ 流过 $R_f = 12\text{ k}\Omega$（从 $0\text{ V}$ 流向 $v_o$），且输出端接负载 $R_L = 4\text{ k}\Omega$ 到地。请算出输出电压 $v_o$ 以及离开运放输出端的总电流 $i_o$。`,
              hint: R`$v_o = -i_f R_f,\quad i_o = \frac{v_o}{R_L} - i_f$`,
              options: [
                {
                  text: R`$v_o = -6.00\text{ V},\ i_o = -1.50\text{ mA}$`,
                  correct: false,
                  feedback: R`$v_o = -6.00\text{ V}$ 算得非常准！但算 $i_o$ 时你只算了负载电流 $i_L = -6\text{ V} / 4\text{ k}\Omega = -1.50\text{ mA}$，忘记把反馈支路涌过来的 $0.50\text{ mA}$ 也合并进去（$i_o = i_L - i_f$）。`,
                },
                {
                  text: R`$v_o = -6.00\text{ V},\ i_o = -2.00\text{ mA}$`,
                  correct: true,
                  feedback: R`正确：$i_o = -2.00\text{ mA}$ 的负号表示电流灌入（Sink）运放输出端——负载倒流来的 $1.50\text{ mA}$ 加上反馈支路涌来的 $0.50\text{ mA}$。`,
                },
                {
                  text: R`$v_o = +6.00\text{ V},\ i_o = +2.00\text{ mA}$`,
                  correct: false,
                  feedback: R`反相加法器的核心特征就是反相：电流从 $0\text{ V}$ 流向 $v_o$，顺流方向电位必然下降，所以 $v_o = 0 - i_f R_f = -6.00\text{ V}$，绝对是负电压！`,
                },
              ],
              board: [
                R`\text{Step 4: } v_o = -(0.50\text{ mA})(12\text{ k}\Omega) = -6.00\text{ V},`,
                R`i_o = \frac{-6.00\text{ V}}{4\text{ k}\Omega} - 0.50\text{ mA} = -2.00\text{ mA}`,
              ],
              halo: ['hl_vo', 'hl_io', 'hl_il'],
              params: MIX3(3),
              layer: L3,
            },
            {
              title: '第 5 步 · 电源轨饱和边界极限检验',
              mini_svg: MINI_STEP5,
              question: R`突然间主唱飙高音，$v_1$ 从 $1.2\text{ V}$ 飙升至 $3.0\text{ V}$（$v_2 = 1.5\text{ V}$、$v_3 = -0.6\text{ V}$ 不变），供电仍为 $\pm 10\text{ V}$。此时实际输出 $v_o$ 会是多少？电路是否削波？`,
              hint: R`$v_{o,\text{ideal}} = -\left(3 v_1 + 2 v_2 + 1 v_3\right),\quad \text{比较 } |v_{o,\text{ideal}}| \text{ 与 } V_{CC}$`,
              options: [
                {
                  text: R`理论值 $v_o = -11.40\text{ V}$，超出 $-10\text{ V}$ 轨，发生负向饱和削波，实际输出钳位在 $-10.0\text{ V}$`,
                  correct: true,
                  feedback: R`正确：理想公式要 $-11.40\text{ V}$，输出却摆不出电源轨，只能钉在 $-10\text{ V}$。这时虚地也随之瓦解（第 4 幕的深度验算）：左侧 03 验算台上看得到真实的 $v_-$。`,
                },
                {
                  text: R`实际输出 $v_o = -11.40\text{ V}$，理想运放不会受电源轨限制`,
                  correct: false,
                  feedback: R`工程大忌！任何实体运放的输出电压都不可能突破电源供电轨（$\pm 10\text{ V}$），超过后立刻削波，音乐会瞬间爆音破音。`,
                },
                {
                  text: R`理论值 $v_o = -9.60\text{ V}$，仍在 $\pm 10\text{ V}$ 线性区内，不削波`,
                  correct: false,
                  feedback: R`核对一下 CH1 权重：$w_1 = 12\text{k}/4\text{k} = 3$，$3 \times 3.0\text{ V} = 9.0\text{ V}$，再加上 CH2 的 $2 \times 1.5\text{ V} = 3.0\text{ V}$ 减去 CH3 的 $0.6\text{ V}$，合起来是 $-11.40\text{ V}$，已经踩穿 $-10\text{ V}$ 底线了！`,
                },
              ],
              board: [
                R`\text{Step 5: } v_{o,\text{ideal}} = -(3\times 3.0 + 2\times 1.5 - 0.6) = -11.40\text{ V} < -10\text{ V}`,
                R`\implies v_{o,\text{actual}} = -10.0\text{ V (饱和削波)}`,
              ],
              halo: ['hl_rails', 'hl_sat'],
              params: MIX3(4, true),
              layer: L3,
            },
          ],
          conclusion: R`通关！正常演唱时 $i_f = 0.50\text{ mA}$、$v_o = -6.00\text{ V}$、$i_o = -2.00\text{ mA}$；主唱飙到 $3.0\text{ V}$ 时理想值 $-11.40\text{ V}$ 踩穿 $-10\text{ V}$ 轨，实际输出削波在 $-10\text{ V}$。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '诊断测验',
      sync: { layer: L1, halo: ['hl_vground'], params: { w35_topo: 'summer', w35_l1v2: 0 } },
      blocks: [{ kind: 'p', text: '**诊断测验（4 题核心验收）**' }],
      inline_svg: SVG_ACT6,
      figure_caption: '反相加法器 · 四句话复盘',
      quiz: [
        {
          id: 'w3l5_q1',
          concept: '虚地隔离防串扰',
          review_act: 1,
          question:
            '在理想三路反相加法器（线性区工作）中，若把通道 2 的输入电阻 $R_2$ 从 $10\\text{ k}\\Omega$ 调小为 $5\\text{ k}\\Omega$，同时保持 $v_1$、$R_1$、$R_f$ 不变，通道 1 的输入电流 $i_1$ 会如何变化？',
          options: [
            {
              key: 'A',
              text: '$i_1$ 增大，因为总并联输入阻抗变小',
              correct: false,
              feedback: R`“并联阻抗变小”是无源网络的思路。这里 $R_1$ 的右端接在虚地上，$i_1 = v_1 / R_1$ 只由 $v_1$ 和 $R_1$ 决定；调小 $R_2$ 只会让 $i_2$ 和 $i_f$ 变大，$i_1$ 一点也不会多。`,
            },
            {
              key: 'B',
              text: '$i_1$ 减小，因为通道 2 抢占了更多汇流份额',
              correct: false,
              feedback: R`“抢份额”是无源电阻直连时的现象（第 1 幕）：公共节点电位浮动，各路才会互相挤压。虚地节点钉在 $0\text{ V}$，通道 2 的电流再大也抬不动它，$i_1$ 不受影响。`,
            },
            { key: 'C', text: R`$i_1$ 保持绝对不变，因为虚地节点始终锁定 $v_- = 0\text{ V}$`, correct: true },
            {
              key: 'D',
              text: '无法判断，取决于输出端负载电阻 $R_L$ 的大小',
              correct: false,
              feedback: R`$R_L$ 接在输出端，它的电流由运放输出级供给（$i_o = i_L - i_f$），碰不到反相输入端的虚地，所以与 $i_1$ 无关。`,
            },
          ],
          feedback_correct: R`只要运放未饱和，反相输入端始终维持虚地 $v_- = 0\text{ V}$。通道 1 的输入电流严格为 $i_1 = v_1 / R_1$，与其他通道的电阻、电压及输出负载完全无关。`,
          feedback_wrong: '只要运放没饱和，节点 $a$ 就是虚地：$i_1$ 只取决于哪两个量？',
          figure: SVG_Q1,
          sync: { layer: L2, halo: ['hl_v1'], params: { w35_mix: 'unity_summer', w35_rf: 10 } },
        },
        {
          id: 'w3l5_q2',
          concept: '加权求和计算',
          review_act: 2,
          question:
            '一个三路反相加法器的反馈电阻 $R_f = 15\\text{ k}\\Omega$，三路参数为：$R_1 = 5\\text{ k}\\Omega$ ($v_1 = +1.0\\text{ V}$)、$R_2 = 15\\text{ k}\\Omega$ ($v_2 = -2.0\\text{ V}$)、$R_3 = 7.5\\text{ k}\\Omega$ ($v_3 = +0.5\\text{ V}$)，供电 $\\pm 15\\text{ V}$。则输出电压 $v_o$ 等于：',
          options: [
            { key: 'A', text: R`$-2.0\text{ V}$`, correct: true },
            {
              key: 'B',
              text: R`$+2.0\text{ V}$`,
              correct: false,
              feedback: '加权和本身算对了，却丢了 Eq. 5.14 最外层的负号：反相加法器输出的是加权和的相反数。',
            },
            {
              key: 'C',
              text: R`$-6.0\text{ V}$`,
              correct: false,
              feedback: R`你把 $v_2 = -2.0\text{ V}$ 的负号漏掉了：$w_2 v_2 = 1 \times (-2.0\text{ V})$ 在加权和里是减去 $2.0\text{ V}$，不是加上。`,
            },
            {
              key: 'D',
              text: R`$-4.0\text{ V}$`,
              correct: false,
              feedback: R`$-4.0\text{ V}$ 相当于只算了通道 1 和通道 3（$3 \times 1.0 + 2 \times 0.5$），漏掉了通道 2：负电压通道也要带符号加进去。`,
            },
          ],
          feedback_correct: R`三路权重依次为 $w_1 = 15/5 = 3$、$w_2 = 15/15 = 1$、$w_3 = 15/7.5 = 2$。代入 Eq. 5.14：$v_o = -(3\times 1.0 + 1\times(-2.0) + 2\times 0.5) = -(3.0 - 2.0 + 1.0) = -2.0\text{ V}$。`,
          feedback_wrong: '先求三路权重 $w_k = R_f / R_k$，再带符号相加，最后别忘了最外层的负号。',
          figure: SVG_Q2,
          sync: { layer: L2, halo: ['hl_weights'] },
        },
        {
          id: 'w3l5_q3',
          concept: '反相平均器设计',
          review_act: 3,
          question:
            '某多传感器前端需要把 4 路同规格压力传感器电压做实时反相平均（$v_o = -(v_1+v_2+v_3+v_4)/4$）。已知每路输入电阻均选用 $R = 20\\text{ k}\\Omega$，则反馈电阻 $R_f$ 应选用：',
          options: [
            {
              key: 'A',
              text: R`$80\text{ k}\Omega$`,
              correct: false,
              feedback: R`你把比例倒过来了（$R_f = n \cdot R$）：这样每路权重 $R_f / R = 4$，输出是总和的 4 倍，而不是平均值。`,
            },
            {
              key: 'B',
              text: R`$20\text{ k}\Omega$`,
              correct: false,
              feedback: R`$R_f = R$ 时每路权重为 1，这是等权加法器：输出 $-(v_1+v_2+v_3+v_4)$，是平均值的 4 倍。`,
            },
            { key: 'C', text: R`$5\text{ k}\Omega$`, correct: true },
            {
              key: 'D',
              text: R`$4\text{ k}\Omega$`,
              correct: false,
              feedback: R`$R_f = 4\text{ k}\Omega$ 时每路权重为 $4/20 = 1/5$，那是 5 路平均器的权重：4 路信号只会得到平均值的 $4/5$。`,
            },
          ],
          feedback_correct: R`反相平均器要求每路权重 $R_f / R = 1 / n$。当 $n = 4$、$R = 20\text{ k}\Omega$ 时，$R_f = R / 4 = 20\text{ k}\Omega / 4 = 5\text{ k}\Omega$。`,
          feedback_wrong: '平均器要求每路权重 $R_f / R$ 等于多少？',
          figure: SVG_Q3,
          sync: { layer: L2, halo: ['hl_rf', 'hl_weights'] },
        },
        {
          id: 'w3l5_q4',
          concept: '饱和后虚地瓦解',
          review_act: 4,
          question:
            '在 Sadiku Example 5.6（$R_1=5\\text{ k}\\Omega$, $v_1=2\\text{ V}$; $R_2=2.5\\text{ k}\\Omega$, $v_2=1\\text{ V}$; $R_f=10\\text{ k}\\Omega$）中，若把电源轨从 $\\pm 12\\text{ V}$ 降低到 $\\pm 5\\text{ V}$，以下哪项物理现象是正确的？',
          options: [
            {
              key: 'A',
              text: R`$v_o$ 钳位在 $-5\text{ V}$，但虚地节点依然严格保持 $v_- = 0\text{ V}$`,
              correct: false,
              feedback: R`饱和不只影响 $v_o$：虚短 $v_- = v_+$ 是靠负反馈调节出来的。$v_o$ 被钳在 $-5\text{ V}$ 后，反馈支路拉不走全部输入电流，$v_-$ 就不再是 $0\text{ V}$。`,
            },
            {
              key: 'B',
              text: R`$v_o$ 钳位在 $-5\text{ V}$，负反馈失效导致 $v_-$ 抬升至正电位（约 $+0.429\text{ V}$），各支路电流偏离理想值`,
              correct: true,
            },
            {
              key: 'C',
              text: R`运放自动把输入权重减半，使 $v_o$ 保持线性输出 $-4\text{ V}$`,
              correct: false,
              feedback: R`运放不会自己改权重：权重只由电阻比 $R_f/R_k$ 决定。理论输出 $-8\text{ V}$ 摆不出来时，输出只是被钳在电源轨上。`,
            },
            {
              key: 'D',
              text: R`反馈电流 $i_f$ 瞬间变为 $0\text{ mA}$`,
              correct: false,
              feedback: R`$R_f$ 两端是 $v_-$ 与 $v_o = -5\text{ V}$，只要两者不相等就有电流 $i_f = (v_- - v_o)/R_f$。两路正输入还在往节点 $a$ 灌电流，虚断下它们只能经 $R_f$ 流走，$i_f$ 不可能为零。`,
            },
          ],
          feedback_correct: R`理论输出 $-8\text{ V}$ 超过 $-5\text{ V}$ 电源轨，运放进入负向饱和，$v_o$ 被钳位在 $-5\text{ V}$。此时反馈支路无法拉走全部理想输入电流，虚短瓦解，经 KCL 联立可解得 $v_- = 3/7\text{ V} \approx +0.429\text{ V}$，通道隔离随之破坏。`,
          feedback_wrong: '饱和以后，哪条理想运放公理还成立、哪条失效了？',
          figure: SVG_Q4,
          sync: { layer: L3, halo: ['hl_rails'], params: EX56 },
        },
      ],
    },
  ],
};

export default W3_L5;
