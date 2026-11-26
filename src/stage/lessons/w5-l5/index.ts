// W5-L5 · 瞬时功率、平均功率、有效值（RMS）与交流最大功率传输 (lesson sheet: docs/lessons/W5-L5.md).
// Type D, strictly 2D (course owner rule for World 5: only L2, L8, L9 have a 3D bench): no three.js
// anywhere in this folder (lesson.test.ts checks it). The professor's opening and the text of the six
// acts, the act diagrams (svgs.ts), the guided example and the diagnostic quiz are reproduced from
// the sheet; [[id|…]] only links a term to the stage (the words are unchanged). Changes of form:
// - display formulas sit in ② / ③ cards (a lead-in sentence becomes the card's title); the display
//   formulas of a ① run inline in its text; the sub-headings (1.1, 2.1 …) are bold lines; the
//   professor's opening is the start of act 1; the blockquotes (the RMS definition, the safety
//   warning, the 8-vs-4 alarm, act 6's problem) are note cards; the longest display formulas of act 6
//   and the guided boards are broken at an "=" so they fit a phone;
// - plain-text symbols of the guided-example and quiz JSON (Z_Th, V_Th,rms …) are set as TeX; the
//   guided steps had no options: each gets three — the sheet's expected answer (praise), the mistake
//   its professor_intercept corrects (that intercept), and one more plausible mistake with its own
//   intercept; the right answer moves between positions;
// - the guided example and the quiz, which follow act 6 in the sheet, are their own closing part (badge
//   「引导例题」): in act 6 the guided steps would take the stage over from act 6's own worked example;
// - anti-spoiler: the guided example is its own problem (no act works it), so no ③ moves; its step
//   3–5 diagrams lost the answers they printed (svgs.ts), and its numbers on the stage stay covered
//   while it runs (stage param w55_g = steps solved; done_params uncovers them);
// - fixed: act 2's 「两端口元件」 (a two-port) is a two-terminal element, 「二端元件」;
// - left out (build instructions, not lesson text): the 「JSON」 of the guided-example heading, the
//   quiz's passing score (the site uses 4/4), the 「Claude 工程落地清单」.
// Conventions: every source of the sheet is a PEAK (amplitude) phasor unless it says RMS, so
// P_max = |V_Th|²/(8R_Th) = V_Th,rms²/(4R_Th) (quiz Q4 is the one RMS phasor: /4).
// Added (the sheet has none): the hover map; praise for right options and the guided example's
// conclusion; per-option quiz feedback written from the explanations; the quiz figures (figures.ts);
// the guided problem diagram.

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './figures';
import { L1, L2, L3, P } from './parts';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6, SVG_GUIDED } from './svgs';

const Layer01 = lazy(() => import('./ScopeLayer'));
const Layer02 = lazy(() => import('./RmsLayer'));
const Layer03 = lazy(() => import('./MatchLayer'));

const R = String.raw;
/** inline `code` inside a String.raw text */
const code = (s: string) => `\`${s}\``;

/** a guided step's stage: the guided circuit on layer 03, `solved` steps uncovered */
const G = (solved: number, extra: Record<string, unknown> = {}) => ({ [P.src]: 'gd', [P.g]: solved, ...extra });
const sync = (layer: string, halo: string[], params?: Record<string, unknown>): StageSync => ({ layer, halo, ...(params ? { params } : {}) });

const W5_L5: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Layer01, [L2]: Layer02, [L3]: Layer03 },
  lesson_meta: {
    lesson_id: 'W5-L5',
    world: 'World 5',
    title: '瞬时功率、平均功率、有效值（RMS）与交流最大功率传输',
    subtitle: 'Instantaneous & Average Power, Effective (RMS) Value, and AC Maximum Average Power Transfer',
    lesson_type: 'D',
    lesson_type_label: 'Type D · 动态波形示波器课（纯 2D 示波器工作台）',
    estimated_minutes: 55,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Section 11.1–11.4: Instantaneous and Average Power, Maximum Average Power Transfer, Effective or RMS Value'],
    },
    textbook_supplement: 'Introductory Circuit Analysis, 14th Ed. (Robert L. Boylestad) · Chapter 19（AC Power — 热效应直觉与三曲线同屏对照）',
    prerequisites: ['W2-L8 直流最大功率传输', 'W5-L4 交流戴维南等效'],
    learning_objectives: [
      '掌握瞬时功率 $p(t)$ 的二倍频脉动分解，理解 $p(t) < 0$ 区间储能元件向电源回馈能量的物理图景',
      '熟练计算纯电阻、纯电感、纯电容及一般 RLC 负载的平均功率（有功功率）$P$',
      '从焦耳热等效出发推导正弦波与非正弦 / DC + AC 混合波形的有效值（RMS），辨析家用 120 V / 220 V 的峰值与有效值',
      R`掌握交流最大平均功率传输定理（共轭匹配 $\mathbf{Z}_L = \mathbf{Z}_{Th}^*$），并严格区分峰值相量分母 8 与 RMS 相量分母 4`,
    ],
    next_lesson: 'W5-L6',
    next_lesson_title: '视在功率、复功率、功率三角形与功率因数校正',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 三曲线示波器',
        short: '01 三曲线示波器',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '电压 v(t) / 电流 i(t) / 瞬时功率 p(t) 三曲线同屏示波器：红色阴影是 p(t) < 0 的负功率回流区，琥珀虚线是平均功率 P = ½·Vm·Im·cos(Δθ)，紫色标尺是二倍频周期 T_p = T/2。',
      },
      {
        id: L2,
        label: '02 RMS 面积台',
        short: '02 RMS 面积台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '交流热效应等效 RMS 面积演示台：v(t) 与平方热功率波形 v²(t) 同步；“削峰填谷”把正弦平方波高出中线的波峰填进波谷，拼成高为 V_rms² 的等面积矩形；北美 120 V RMS（170 V 峰值）/ 中国 220 V RMS（311 V 峰值）一键预设。',
      },
      {
        id: L3,
        label: '03 共轭匹配台',
        short: '03 共轭匹配台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '交流共轭匹配 (ZL = ZTh*) 功率峰值台：X_Th + X_L = 0 时谐振绿灯点亮，R_L = R_Th 时锁定峰值 P_max；双轨同步显示 |V_Th|²/(8R_Th) 与 V_Th,rms²/(4R_Th)。',
      },
    ],
    hover_map: {
      sc_v: { label: '电压 v(t)', desc: '蓝色：v(t) = V_m cos(ωt + θ_v)，θ_v = θ_i + Δθ；高度按 V_m 滑块成比例' },
      sc_i: { label: '电流 i(t)', desc: '绿色：i(t) = I_m cos(ωt + θ_i)，舞台取 θ_i = −15°（第 1 幕的电流）' },
      sc_p: { label: '瞬时功率 p(t) = v(t)·i(t)', desc: '紫色（自动量程）：恒定分量 + 以 2ω 脉动的余弦项' },
      sc_avg: { label: '平均功率 P', desc: '琥珀虚线：P = ½V_m I_m cos(θ_v − θ_i)，即 p(t) 的恒定分量（电表计量的有功功率）' },
      sc_neg: { label: 'p(t) < 0 负功率回流区', desc: '红色阴影：v 与 i 异号，电感磁场 / 电容电场把储存的能量送回电源；占周期的 |Δθ|/180°' },
      sc_tp: { label: '功率脉动周期 T_p = T/2', desc: '相邻两个 p(t) 峰之间：功率以 2ω 起伏，一个电源周期里两次' },
      sc_ext: { label: 'p_max 与 p_min', desc: '½V_m I_m [cos(θ_v − θ_i) ± 1]：平均值上下各一个 ½V_m I_m' },
      sc_dth: { label: '相位差 θ_v − θ_i', desc: '0° 纯电阻，+90° 纯电感，−90° 纯电容；阻抗角 θ_Z' },
      rms_v: { label: '波形 v(t)', desc: '一个周期：正弦、方波、三角波，或直流 + 交流（DC + AC 模式下是交流分量的有效值 V_1,rms）' },
      rms_peak: { label: '峰值 V_p', desc: '波形冲到的最大瞬时值；市电 120 V / 220 V 的峰值是 170 V / 311 V' },
      rms_line: { label: '有效值 V_rms', desc: '在同一只电阻上发热相同的直流电压：√((1/T)∫v²dt)' },
      rms_sq: { label: '平方波形 v²(t)', desc: '1 Ω 电阻上的瞬时热功率；它的面积就是一个周期的焦耳热' },
      rms_rect: { label: '等面积矩形 V_rms² · T', desc: '高为 v² 的周期平均值：面积与 v²(t) 下的面积相等' },
      rms_dc: { label: '直流分量 V_dc', desc: 'DC + AC 模式：直流偏置；与交流分量正交，总有效值按勾股合成' },
      mt_vth: { label: '戴维南电压 V_Th', desc: '端口 a-b 的开路电压相量（本台的电路都给峰值相量；RMS 模式显示 |V_Th|/√2）' },
      mt_zth: { label: '戴维南阻抗 Z_Th = R_Th + jX_Th', desc: '独立源置零后从 a-b 向左看的复阻抗' },
      mt_zl: { label: '可调负载 Z_L = R_L + jX_L', desc: '只有 R_L 消耗平均功率；X_L 用来抵消 X_Th' },
      mt_lamp: { label: '谐振灯 X_Th + X_L = 0', desc: '回路电抗清零（串联谐振）时点亮：剩下纯电阻分压' },
      mt_curve: { label: '功率曲线 P(R_L)（当前 X_L）', desc: '蓝色：电抗没抵消时，整条曲线都被压低' },
      mt_conj: { label: '功率曲线 P(R_L)（X_L = −X_Th）', desc: '绿色虚线：电抗已抵消，峰值落在 R_L = R_Th' },
      mt_peak: { label: '峰值点 P_max', desc: '共轭匹配 Z_L = Z_Th*：R_L = R_Th 且 X_L = −X_Th；负载正好在这里时锁定' },
      mt_op: { label: '当前负载的工作点', desc: '负载功率 P = |V_Th|² R_L / (2[(R_Th + R_L)² + (X_Th + X_L)²])（峰值相量）' },
      mt_div8: { label: '峰值相量公式 |V_Th|²/(8R_Th)', desc: 'V_Th 是峰值（幅值）相量时用分母 8' },
      mt_div4: { label: 'RMS 相量公式 V_Th,rms²/(4R_Th)', desc: 'V_Th 是 RMS 有效值相量时用分母 4（与直流 V²/(4R) 同形）' },
      gd_vs: { label: '引导例题电源 V_s', desc: '20∠0° V，峰值相量' },
      gd_r1: { label: '串联电阻 R_1 = 10 Ω', desc: '引导例题：电源与中间节点之间' },
      gd_c: { label: '并联容抗 −j10 Ω', desc: '引导例题：中间节点对地' },
      gd_l: { label: '串联感抗 +j8 Ω', desc: '引导例题：中间节点通往端口 a' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '瞬时功率的二倍频脉动与能量回流',
      sync: sync(L1, ['sc_p', 'sc_neg'], { [P.vm]: 120, [P.im]: 10, [P.dth]: 60 }),
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎回到 Breadboard Lab！前两周我们已经把交流电路的“语法”打通了——相量、阻抗、以及上一讲（${code('W5-L4')}）的交流戴维南等效。但工程师造电路绝不是为了把电压电流算出来摆在纸面上欣赏的，我们的终极目标永远是**能量的搬运与做功**。`,
        },
        {
          kind: 'p',
          text: R`在直流电路里，功率简单得像小学生乘法：$P = VI$。可一旦换上正弦交流电，电压和电流每秒钟翻转一百次，还常常“步调不一致”（存在相位差）。此时你可能会立刻冒出三个灵魂拷问：`,
        },
        {
          kind: 'ol',
          items: [
            R`电压和电流时正时负，交流功率是不是忽正忽负？**“负功率”到底意味着什么？**`,
            R`墙上插座写着 **120 V**（北美）或 **220 V**（中国），电压明明在剧烈波动，这个定值到底是怎么定义出来的？`,
            R`回想 ${code('W2-L8')} 直流电路里“$R_L = R_{Th}$ 时负载获得最大功率”，到了交流电路，负载变成了复阻抗 $\mathbf{Z}_L = R_L + jX_L$，难道是 $\mathbf{Z}_L = \mathbf{Z}_{Th}$ 吗？**大错特错！** 今天我们要揭晓工程界最优雅的匹配法则——**共轭匹配**。`,
          ],
        },
        { kind: 'p', text: R`打开你左侧的 **2D 示波器工作台**，我们一幕一幕把交流功率的底细看透！` },
        { kind: 'p', text: R`**1.1 物理图景：为什么功率会以 $2\omega$ 脉动，还会掉进“负区”？**` },
        {
          kind: 'p',
          text: R`打开左侧示波器 **Layer 01（三曲线同屏示波器）**。假设一个线性交流单口网络两端电压为 [[sc_v|$v(t) = V_m \cos(\omega t + \theta_v)$]]，流入端口的电流为 [[sc_i|$i(t) = I_m \cos(\omega t + \theta_i)$]]（遵循关联参考方向）。`,
        },
        { kind: 'p', text: R`在任意瞬时 $t$，网络吸收的[[sc_p|**瞬时功率**]] $p(t) = v(t)i(t)$ 并不是恒定值，而是由两股力量叠加而成：` },
        {
          kind: 'ol',
          items: [
            R`**一个恒定不变的直流偏置项**：$\frac{1}{2} V_m I_m \cos(\theta_v - \theta_i)$，它决定了整个周期净吸收的[[sc_avg|平均功率]]；`,
            R`**一个以二倍角频率 $2\omega$ 剧烈振荡的正弦项**：$\frac{1}{2} V_m I_m \cos(2\omega t + \theta_v + \theta_i)$。为什么频率翻倍？因为在一个电源周期 $T$ 内，电压和电流同为正时乘积为正，同为负时“负负得正”乘积依然为正——功率在一个周期里完成了[[sc_tp|**两次完整的起伏**]]！`,
          ],
        },
        {
          kind: 'p',
          text: R`最精彩的是图中的[[sc_neg|**红色阴影区（$p(t) < 0$）**]]：当电压和电流存在相位差（$\theta_v \neq \theta_i$）时，每个半周里都会有短暂的瞬间出现 **$v(t)$ 与 $i(t)$ 异号**，导致 $p(t) < 0$。`,
        },
        {
          kind: 'ul',
          items: [
            R`**$p(t) > 0$**：电源把能量输送给负载（电阻发热，或者电感/电容正在“充电蓄能”）；`,
            R`**$p(t) < 0$**：**能量倒流！** 负载里的电感磁场或电容电场把先前储存的能量**原路送回电源**。记住 Boylestad 教材里的经典比喻：电阻是“只进不出的单向黑洞”，而电感和电容是“借了还要还的弹簧”。`,
          ],
        },
        { kind: 'p', text: '**1.2 三段式教授板书推导：瞬时功率分解**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`根据关联参考方向下的瞬时电功率定义及三角积化和差恒等式：$p(t) = v(t)\,i(t)$，$\cos A \cos B = \dfrac{1}{2}\big[\cos(A - B) + \cos(A + B)\big]$`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式：设端口正弦稳态电压与电流分别为',
          tex: R`v(t) = V_m \cos(\omega t + \theta_v), \qquad i(t) = I_m \cos(\omega t + \theta_i)`,
        },
        {
          kind: 'formula',
          title: R`令 $A = \omega t + \theta_v$、$B = \omega t + \theta_i$，则 $A - B = \theta_v - \theta_i$，$A + B = 2\omega t + \theta_v + \theta_i$。代入积化和差恒等式，立即得到**瞬时功率基本公式**（Alexander & Sadiku Eq. 11.4）：`,
          tex: R`p(t) = \underbrace{\frac{1}{2} V_m I_m \cos(\theta_v - \theta_i)}_{\text{恒定分量（平均功率 } P \text{）}} + \underbrace{\frac{1}{2} V_m I_m \cos(2\omega t + \theta_v + \theta_i)}_{\text{二倍频脉动分量（频率 } 2\omega \text{）}}`,
        },
        {
          kind: 'formula',
          title: '由通式可直接读出瞬时功率的上下极值边界：',
          tex: R`p_{\max} = \frac{1}{2} V_m I_m \big[\cos(\theta_v - \theta_i) + 1\big], \qquad p_{\min} = \frac{1}{2} V_m I_m \big[\cos(\theta_v - \theta_i) - 1\big]`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '', text: '设某感性负载两端电压与电流为：', tex: R`v(t) = 120\cos(377t + 45^\circ)\text{ V}, \qquad i(t) = 10\cos(377t - 15^\circ)\text{ A}` },
            { label: '', text: R`提取纯数值参数：$V_m = 120\text{ V}$，$I_m = 10\text{ A}$，$\theta_v = 45^\circ$，$\theta_i = -15^\circ$，$\omega = 377\text{ rad/s}$。` },
            { label: '1. 计算相位差与相位和', tex: R`\theta_v - \theta_i = 45^\circ - (-15^\circ) = 60^\circ, \qquad \theta_v + \theta_i = 45^\circ + (-15^\circ) = 30^\circ` },
            { label: R`2. 计算系数 $\frac{1}{2} V_m I_m$`, tex: R`\frac{1}{2} V_m I_m = \frac{1}{2} \times 120 \times 10 = 600\text{ VA}` },
            { label: '3. 代入瞬时功率通式', tex: R`p(t) = 600\cos(60^\circ) + 600\cos(2 \times 377t + 30^\circ) = 300 + 600\cos(754t + 30^\circ)\text{ W}` },
            { label: '4. 检验极值与回流区间', tex: R`p_{\max} = 300 + 600 = +900\text{ W}, \qquad p_{\min} = 300 - 600 = -300\text{ W}` },
            {
              label: '',
              text: R`可见瞬时功率在 $+900\text{ W}$ 与 $-300\text{ W}$ 之间以 $2\omega = 754\text{ rad/s}$ 剧烈脉动，确实存在明显的 [[sc_neg|$p(t) < 0$ 负功率回流区间]]！`,
            },
          ],
        },
        { kind: 'p', text: '**1.3 内联示波器图：三曲线同屏与负功率回流区**' },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '三曲线同屏示波器：v(t)、i(t) 与二倍频瞬时功率 p(t)（相位差 Δθ = 60°）',
    },
    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '平均功率（有功功率）与 R / L / C 元件的功率画像',
      sync: sync(L1, ['sc_avg', 'sc_dth'], { [P.vm]: 100, [P.im]: 10, [P.dth]: 90 }),
      blocks: [
        { kind: 'p', text: '**2.1 物理图景：电表到底在计量什么？**' },
        {
          kind: 'p',
          text: R`电费账单不会按瞬时功率每毫秒跳动来收钱，机械瓦特表和数字电表测量的都是瞬时功率在一个周期 $T$ 内的**时间平均值**——这就是[[sc_avg|**平均功率（Average Power / Active Power）$P$**]]，单位瓦特（$\text{W}$）。`,
        },
        {
          kind: 'p',
          text: R`因为二倍频脉动项 $\frac{1}{2}V_m I_m \cos(2\omega t + \theta_v + \theta_i)$ 在一个周期 $T$ 内正好完成了两次完整的正负对称起伏，它的周期积分**严格为零**！真正留下来做净功的，只有第一项恒定偏置。`,
        },
        {
          kind: 'p',
          text: R`把左侧示波器 **Layer 01** 的[[sc_dth|相位差滑块]]依次拖到 $0^\circ$、$+90^\circ$ 和 $-90^\circ$，你会看到三类基本理想元件截然不同的“功率人格”：`,
        },
        {
          kind: 'ul',
          items: [
            R`**纯电阻 $R$（$\theta_v - \theta_i = 0^\circ$）**：电压与电流完全同相，$p(t)$ 永远不小于零，没有任何回流阴影，能量 100% 不可逆地转化为焦耳热；`,
            R`**纯电感 $L$（$\theta_v - \theta_i = +90^\circ$）**：电压超前电流 $90^\circ$，$p(t)$ 围绕零轴上下对称摆动，前半个四分之一周期建立磁场吸能，后半个四分之一周期磁场塌缩全额退还，**平均功率恒为 $0\text{ W}$**；`,
            R`**纯电容 $C$（$\theta_v - \theta_i = -90^\circ$）**：电流超前电压 $90^\circ$，同样在电场中周期性吞吐能量，**平均功率也恒为 $0\text{ W}$**。`,
          ],
        },
        { kind: 'p', text: '**2.2 三段式教授板书推导：平均功率与相量表达**' },
        { kind: 'origin', title: '① 公理溯源', text: R`周期信号的平均功率定义为一周期内的时间平均积分：$P = \dfrac{1}{T}\displaystyle\int_0^T p(t)\,dt$` },
        {
          kind: 'formula',
          title: R`② 纯符号通式：将第 1 幕导出的 $p(t)$ 代入积分：`,
          tex: R`P = \frac{1}{T}\int_0^T \frac{1}{2} V_m I_m \cos(\theta_v - \theta_i)\,dt + \frac{1}{T}\int_0^T \frac{1}{2} V_m I_m \cos(2\omega t + \theta_v + \theta_i)\,dt`,
        },
        {
          kind: 'formula',
          title: R`因为 $\omega T = 2\pi$，第二项在 $[0, T]$ 上积分跨越两个完整余弦周期，其值为 $0$，于是得到**交流平均功率核心公式**（Alexander & Sadiku Eq. 11.8）：`,
          tex: R`P = \frac{1}{2} V_m I_m \cos(\theta_v - \theta_i) = \frac{1}{2}\,\text{Re}\big[\mathbf{V}\mathbf{I}^*\big]`,
        },
        { kind: 'p', text: R`对三类理想无源元件分别代入阻抗角 $\theta_Z = \theta_v - \theta_i$：` },
        {
          kind: 'ul',
          items: [
            R`纯电阻（$\theta_v - \theta_i = 0^\circ$）：$P_R = \frac{1}{2} V_m I_m = \frac{1}{2} I_m^2 R = \frac{V_m^2}{2R}$；`,
            R`纯电感（$\theta_v - \theta_i = +90^\circ$）：$P_L = \frac{1}{2} V_m I_m \cos(+90^\circ) = 0\text{ W}$；`,
            R`纯电容（$\theta_v - \theta_i = -90^\circ$）：$P_C = \frac{1}{2} V_m I_m \cos(-90^\circ) = 0\text{ W}$。`,
          ],
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '',
              text: R`已知某二端元件两端相量电压 $\mathbf{V} = 100\angle 30^\circ\text{ V}$（峰值相量），串联阻抗 $\mathbf{Z} = 6 + j8\ \Omega$，求该网络吸收的平均功率 $P$。`,
            },
            {
              label: R`1. 先求阻抗极坐标形式与电流峰值相量 $\mathbf{I}$`,
              tex: R`|\mathbf{Z}| = \sqrt{6^2 + 8^2} = 10\ \Omega, \qquad \theta_Z = \arctan\!\left(\frac{8}{6}\right) \approx 53.13^\circ`,
            },
            { label: '', tex: R`\mathbf{I} = \frac{\mathbf{V}}{\mathbf{Z}} = \frac{100\angle 30^\circ}{10\angle 53.13^\circ} = 10\angle{-23.13^\circ}\text{ A}` },
            {
              label: '2. 代入平均功率公式（方法一：角度法）',
              tex: R`P = \frac{1}{2} V_m I_m \cos(\theta_v - \theta_i) = \frac{1}{2} \times 100 \times 10 \times \cos(53.13^\circ) = 500 \times 0.6 = 300\text{ W}`,
            },
            {
              label: '3. 交叉校验（方法二：仅电阻耗功法）',
              text: R`因为纯电感 $j8\ \Omega$ 平均功率恒为 $0\text{ W}$，全部平均功率必由 $R = 6\ \Omega$ 消耗：`,
              tex: R`P = \frac{1}{2} I_m^2 R = \frac{1}{2} \times 10^2 \times 6 = 300\text{ W}`,
            },
            { label: '', text: '两种方法严丝合缝！' },
          ],
        },
        { kind: 'p', text: '**2.3 内联示波器图：R / L / C 三联功率画像对比**' },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: 'R / L / C 三类纯元件的瞬时功率 p(t) 与平均功率 P 对照',
    },
    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '有效值（RMS）的热效应定义与家用市电解密',
      sync: sync(L2, ['rms_sq', 'rms_rect'], { [P.wave]: 'sine', [P.vp]: 311, [P.fold]: true }),
      blocks: [
        { kind: 'p', text: '**3.1 物理图景：为什么需要一个“等效直流值”？**' },
        {
          kind: 'p',
          text: R`现在切换到左侧舞台 **Layer 02（交流热效应等效 RMS 面积演示台）**。假如你买了一台电热水壶，铭牌上写着“220 V”。但交流电一秒钟有 100 次过零点，平均值明明是 $0\text{ V}$！工程师要怎么用一个**单一实数**来衡量交流电的“烧水本领”？`,
        },
        { kind: 'p', text: '答案就是**焦耳热等效思想**（Boylestad Ch. 19 核心直觉）：' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`把同一只电阻 $R$ 分别接到周期交流电流 $i(t)$ 和恒定直流电流 $I_{\text{eff}}$ 上。如果在一个完整周期 $T$ 内，两者在电阻 $R$ 上**发出的热量完全相等**，那么这个等效直流值 $I_{\text{eff}}$ 就称为交流电的**有效值（Effective Value）**，从数学运算顺序（先平方、再求平均、最后开根号）又称为[[rms_line|**均方根值（RMS, Root-Mean-Square）**]]。`,
        },
        {
          kind: 'p',
          text: R`看看右侧的面积演示图：[[rms_sq|正弦平方波 $i^2(t) = I_m^2 \cos^2(\omega t)$]] 在 $0$ 和 $I_m^2$ 之间上下起伏，而如果把高于中线 $\frac{1}{2}I_m^2$ 的“波峰”一刀切下来，**严丝合缝地填进下面的“波谷”**，正好拼出一个高为 $\frac{1}{2}I_m^2$ 的[[rms_rect|水平矩形]]！因此正弦波的有效值满足 $I_{\text{rms}}^2 = \frac{1}{2}I_m^2$，开根号即得 $I_{\text{rms}} = \frac{I_m}{\sqrt{2}} \approx 0.707\,I_m$。`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**生活安全警示**：北美家用插座标称 **120 V**、中国家用插座标称 **220 V**，**全部都是 RMS 有效值**！它们在每个周期内冲到的真实[[rms_peak|峰值电压]]分别高达 **$120\sqrt{2} \approx 169.7\text{ V} \approx 170\text{ V}$** 和 **$220\sqrt{2} \approx 311.1\text{ V} \approx 311\text{ V}$**！选型整流桥或滤波电容耐压时，如果你按 220 V 选了一颗 250 V 耐压的电容，通电瞬间就会被 311 V 的波峰直接击穿炸裂！`,
        },
        { kind: 'p', text: '**3.2 三段式教授板书推导：RMS 定义与功率公式改写**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`周期交流电流 $i(t)$ 与等效直流电流 $I_{\text{eff}}$ 在电阻 $R$ 上一个周期 $T$ 内消耗的平均功率（焦耳热）相等：$P_{\text{ac}} = \dfrac{1}{T}\displaystyle\int_0^T i^2(t)\,R\,dt = I_{\text{eff}}^2\,R = P_{\text{dc}}$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：两边消去非零电阻 $R$ 并开算术平方根，得到**任意周期信号的有效值通用定义**（Alexander & Sadiku Eq. 11.24）：`,
          tex: R`I_{\text{rms}} = I_{\text{eff}} = \sqrt{\frac{1}{T}\int_0^T i^2(t)\,dt}, \qquad V_{\text{rms}} = \sqrt{\frac{1}{T}\int_0^T v^2(t)\,dt}`,
        },
        {
          kind: 'formula',
          title: R`对正弦波 $i(t) = I_m \cos(\omega t + \theta_i)$（其中 $\omega = \frac{2\pi}{T}$），利用降幂公式 $\cos^2\alpha = \frac{1}{2}(1 + \cos 2\alpha)$：`,
          tex: R`I_{\text{rms}} = \sqrt{\frac{I_m^2}{T}\int_0^T \frac{1 + \cos(2\omega t + 2\theta_i)}{2}\,dt} = \sqrt{\frac{I_m^2}{2}} = \frac{I_m}{\sqrt{2}} \approx 0.7071\,I_m`,
        },
        {
          kind: 'formula',
          title: R`同理 $V_{\text{rms}} = \frac{V_m}{\sqrt{2}}$。将其代回平均功率公式 $P = \frac{1}{2}V_m I_m \cos(\theta_v - \theta_i)$，恼人的系数 $\frac{1}{2}$ 瞬间消失：`,
          tex: R`P = \frac{V_m}{\sqrt{2}}\cdot\frac{I_m}{\sqrt{2}}\cos(\theta_v - \theta_i) = V_{\text{rms}}\,I_{\text{rms}}\cos(\theta_v - \theta_i)`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '1. 家用市电峰值换算', text: R`北美市电：$V_{\text{rms}} = 120\text{ V} \implies V_m = 120\sqrt{2} \approx 169.71\text{ V} \approx 170\text{ V}$；` },
            { label: '', text: R`中国市电：$V_{\text{rms}} = 220\text{ V} \implies V_m = 220\sqrt{2} \approx 311.13\text{ V} \approx 311\text{ V}$。` },
            {
              label: '2. 用 RMS 值直接复算第 1 幕功率',
              text: R`已知 $V_m = 120\text{ V}$，$I_m = 10\text{ A}$，$\theta_v - \theta_i = 60^\circ$：`,
              tex: R`V_{\text{rms}} = \frac{120}{\sqrt{2}} = 60\sqrt{2}\text{ V} \approx 84.85\text{ V}, \qquad I_{\text{rms}} = \frac{10}{\sqrt{2}} = 5\sqrt{2}\text{ A} \approx 7.07\text{ A}`,
            },
            { label: '', tex: R`P = V_{\text{rms}}\,I_{\text{rms}}\cos(60^\circ) = (60\sqrt{2})(5\sqrt{2})(0.5) = 600 \times 0.5 = 300\text{ W}` },
          ],
        },
        { kind: 'p', text: '**3.3 内联示波器图：RMS 热效应等面积“削峰填谷”演示**' },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '有效值（RMS）的物理本质：焦耳热等效与平方波形“削峰填谷”',
    },
    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '非正弦周期波与 DC + AC 混合信号的 RMS 实战',
      sync: sync(L2, ['rms_line', 'rms_dc'], { [P.wave]: 'dcac', [P.vp]: 12, [P.v1]: 5 }),
      blocks: [
        { kind: 'p', text: R`**4.1 物理图景：别把 $/\sqrt{2}$ 当成万金油！**` },
        { kind: 'p', text: R`很多初学者最容易犯的错误，就是看见任何周期波形都条件反射地除以 $\sqrt{2}$。**大错特错！**` },
        {
          kind: 'ul',
          items: [
            R`系数 $1/\sqrt{2} \approx 0.707$ **只属于纯正弦波**；`,
            R`如果是**对称方波**（在 $+V_p$ 和 $-V_p$ 之间跳变），平方后恒等于 $V_p^2$，所以 $V_{\text{rms}} = V_p$；`,
            R`如果是**对称三角波**或**锯齿波**，波峰尖瘦，能量占比低，积分得出 $V_{\text{rms}} = \frac{V_p}{\sqrt{3}} \approx 0.577\,V_p$；`,
          ],
        },
        {
          kind: 'formula',
          title: R`更常见于开关电源纹波与放大器偏置的，是[[rms_dc|**DC + AC 混合信号**]] $v(t) = V_{dc} + V_{1m}\cos(\omega t)$。因为直流分量与交流正弦分量在一个周期内**互相正交**（交叉乘积项积分严格为 $0$），它们的总有效值服从**能量勾股定理**：`,
          tex: R`V_{\text{rms}} = \sqrt{V_{dc}^2 + V_{1,\text{rms}}^2}`,
        },
        { kind: 'p', text: R`**绝不是**简单相加 $V_{dc} + V_{1,\text{rms}}$！` },
        { kind: 'p', text: '**4.2 三段式教授板书推导：DC+AC 正交叠加与三角波积分**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`均方根值的普遍积分定义对一切周期 $T$ 的可积波形均成立：$V_{\text{rms}} = \sqrt{\dfrac{1}{T}\displaystyle\int_0^T v^2(t)\,dt}$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · 1. **DC + AC 混合波** $v(t) = V_{dc} + V_{1m}\cos(\omega t)$（其中 $\omega = \frac{2\pi}{T}$）：`,
          tex: R`V_{\text{rms}}^2 = \frac{1}{T}\int_0^T \Big[V_{dc}^2 + 2 V_{dc} V_{1m}\cos(\omega t) + V_{1m}^2\cos^2(\omega t)\Big]\,dt`,
        },
        {
          kind: 'formula',
          title: R`中间交叉项 $\frac{1}{T}\int_0^T 2 V_{dc} V_{1m}\cos(\omega t)\,dt = 0$，第三项平均值为 $\frac{1}{2}V_{1m}^2 = V_{1,\text{rms}}^2$，故：`,
          tex: R`V_{\text{rms}} = \sqrt{V_{dc}^2 + \frac{1}{2}V_{1m}^2} = \sqrt{V_{dc}^2 + V_{1,\text{rms}}^2}`,
        },
        {
          kind: 'formula',
          title: R`2. **对称三角波**（峰值为 $V_p$，在 $[0, T/4]$ 上线性上升 $v(t) = \frac{4V_p}{T}t$，四个四分之一周期平方对称）：`,
          tex: R`V_{\text{rms}} = \sqrt{\frac{4}{T}\int_0^{T/4} \left(\frac{4V_p}{T}t\right)^2 dt} = \sqrt{\frac{64 V_p^2}{T^3}\left[\frac{t^3}{3}\right]_0^{T/4}} = \sqrt{\frac{V_p^2}{3}} = \frac{V_p}{\sqrt{3}} \approx 0.5774\,V_p`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '', text: R`设某直流电源输出端带有交流纹波：$v(t) = 12 + 5\sqrt{2}\cos(377t)\text{ V}$，求其真有效值 $V_{\text{rms}}$。` },
            {
              label: '1. 拆解直流与交流有效值分量',
              tex: R`V_{dc} = 12\text{ V}, \qquad V_{1m} = 5\sqrt{2}\text{ V} \implies V_{1,\text{rms}} = \frac{5\sqrt{2}}{\sqrt{2}} = 5\text{ V}`,
            },
            { label: '2. 代入正交叠加通式（经典 5-12-13 勾股数组）', tex: R`V_{\text{rms}} = \sqrt{12^2 + 5^2} = \sqrt{144 + 25} = \sqrt{169} = 13\text{ V}` },
            {
              label: '',
              text: R`（对比常见误算：$12 + 5 = 17\text{ V}$ 是完全错误的；若该信号加在 $13\ \Omega$ 电阻上，平均功率为 $P = \frac{V_{\text{rms}}^2}{R} = \frac{13^2}{13} = 13\text{ W}$。）`,
            },
          ],
        },
        { kind: 'p', text: '**4.3 内联示波器图：DC+AC 勾股合成与三类波形 RMS 系数对比**' },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '非正弦波与 DC+AC 混合信号的 RMS：正交叠加（勾股合成）',
    },
    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: R`交流最大平均功率传输定理——共轭匹配 $\mathbf{Z}_L = \mathbf{Z}_{Th}^*$`,
      sync: sync(L3, ['mt_lamp', 'mt_peak'], { [P.src]: 'a5', [P.rl]: 4, [P.xl]: 0, [P.mode]: 'peak' }),
      blocks: [
        { kind: 'p', text: R`**5.1 物理图景：回链 ${code('W2-L8')} 与 ${code('W5-L4')}，为什么必须“共轭”？**` },
        {
          kind: 'p',
          text: R`切换到左侧舞台 **Layer 03（交流共轭匹配功率峰值台）**。回想我们在 ${code('W2-L8')} 学过的直流最大功率传输定理：把负载左侧的复杂网络化简为戴维南等效（$V_{Th}, R_{Th}$），当 $R_L = R_{Th}$ 时负载获得最大功率 $P_{\max} = \frac{V_{Th}^2}{4 R_{Th}}$。`,
        },
        {
          kind: 'p',
          text: R`现在到了交流稳态电路，借助上一讲 ${code('W5-L4')} 的**交流戴维南等效**，任意线性含源网络在端口 $a\text{--}b$ 处都可化简为一个[[mt_vth|相量电压源 $\mathbf{V}_{Th}$]] 串联一个[[mt_zth|复阻抗 $\mathbf{Z}_{Th} = R_{Th} + jX_{Th}$]]，右接[[mt_zl|可调复负载 $\mathbf{Z}_L = R_L + jX_L$]]。`,
        },
        { kind: 'p', text: R`想让负载电阻 $R_L$ 吃到的平均功率 $P$ 达到最大，分两步直觉思考就豁然开朗：` },
        {
          kind: 'ol',
          items: [
            R`**第一步（消除路障）**：电抗部分 $j(X_{Th} + X_L)$ 既不做功（纯储能元件平均功率为 $0$），又白白增大回路总阻抗、拖小电流！怎样让它彻底消失？只需让负载电抗与内电抗**大小相等、符号相反**：$X_L = -X_{Th}$。此时感抗与容抗互相抵消，回路进入[[mt_lamp|**串联谐振**]]！`,
            R`**第二步（回到 ${code('W2-L8')}）**：一旦电抗清零，整个交流回路就退化成了一个纯电阻分压回路，此时只需让电阻相等 $R_L = R_{Th}$，负载就能榨取出[[mt_peak|理论最大平均功率]]！`,
          ],
        },
        {
          kind: 'formula',
          title: '合二为一，这就是射频、通信与天线匹配的核心法则——**复共轭匹配（Conjugate Matching）**：',
          tex: R`\mathbf{Z}_L = \mathbf{Z}_{Th}^* = R_{Th} - jX_{Th}`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**铁血防坑警报：分母 8 还是分母 4？** 若 $\mathbf{V}_{Th}$ 是**峰值（幅值）相量**（如 $v_{Th}(t) = V_m \cos(\omega t + \phi) \leftrightarrow \mathbf{V}_{Th} = V_m\angle\phi$），则 [[mt_div8|$P_{\max} = \dfrac{|\mathbf{V}_{Th}|^2}{8 R_{Th}}$]]；若 $\mathbf{V}_{Th}$ 已经标明是 **RMS 有效值相量**（$V_{Th,\text{rms}} = |\mathbf{V}_{Th}|/\sqrt{2}$），则 [[mt_div4|$P_{\max} = \dfrac{V_{Th,\text{rms}}^2}{4 R_{Th}}$]]。考试中一半以上的丢分，都源于把峰值相量错代进了分母 $4$，或者把 RMS 相量错代进了分母 $8$！`,
        },
        { kind: 'p', text: '**5.2 三段式教授板书推导：二元偏导极值与双分母关系**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`在交流戴维南等效回路中，负载电流峰值相量为 $\mathbf{I} = \dfrac{\mathbf{V}_{Th}}{\mathbf{Z}_{Th} + \mathbf{Z}_L}$，只有负载实部电阻 $R_L$ 消耗平均功率：$P = \dfrac{1}{2}|\mathbf{I}|^2 R_L$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：将 $\mathbf{Z}_{Th} = R_{Th} + jX_{Th}$ 与 $\mathbf{Z}_L = R_L + jX_L$ 代入平均功率表达式（以峰值相量 $|\mathbf{V}_{Th}|$ 记）：`,
          tex: R`P(R_L, X_L) = \frac{|\mathbf{V}_{Th}|^2 R_L}{2\big[(R_{Th} + R_L)^2 + (X_{Th} + X_L)^2\big]}`,
        },
        {
          kind: 'formula',
          title: R`分别对独立变量 $X_L$ 和 $R_L$ 求一阶偏导并令其为零（Alexander & Sadiku Section 11.3）。1. 对 $X_L$ 求偏导：`,
          tex: R`\frac{\partial P}{\partial X_L} = \frac{-|\mathbf{V}_{Th}|^2 R_L (X_{Th} + X_L)}{\big[(R_{Th} + R_L)^2 + (X_{Th} + X_L)^2\big]^2} = 0 \implies X_L = -X_{Th}`,
        },
        {
          kind: 'formula',
          title: R`2. 将 $X_L = -X_{Th}$ 代入 $P$ 后，再对 $R_L$ 求导：`,
          tex: R`\begin{gathered} P(R_L, -X_{Th}) = \frac{|\mathbf{V}_{Th}|^2 R_L}{2(R_{Th} + R_L)^2} \\[6pt] \frac{\partial P}{\partial R_L} = \frac{|\mathbf{V}_{Th}|^2 (R_{Th} - R_L)}{2(R_{Th} + R_L)^3} = 0 \implies R_L = R_{Th} \end{gathered}`,
        },
        { kind: 'formula', title: '综合两式得**共轭匹配条件**：', tex: R`\mathbf{Z}_L = R_L + jX_L = R_{Th} - jX_{Th} = \mathbf{Z}_{Th}^*` },
        {
          kind: 'formula',
          title: R`将 $R_L = R_{Th}, X_L = -X_{Th}$ 代回 $P$，结合 $V_{Th,\text{rms}} = \frac{|\mathbf{V}_{Th}|}{\sqrt{2}}$，得到**峰值相量 / RMS 相量双形式最大功率通式**：`,
          tex: R`P_{\max} = \frac{|\mathbf{V}_{Th}|^2}{8 R_{Th}} = \frac{V_{Th,\text{rms}}^2}{4 R_{Th}}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '', text: R`假设某射频功放输出端的戴维南等效为 $\mathbf{V}_{Th} = 16\angle 0^\circ\text{ V}$（峰值相量），$\mathbf{Z}_{Th} = 4 + j3\ \Omega$：` },
            { label: '1. 求共轭匹配负载', tex: R`\mathbf{Z}_L = \mathbf{Z}_{Th}^* = 4 - j3\ \Omega` },
            { label: '', text: R`（即串联 $4\ \Omega$ 电阻与容抗 $-j3\ \Omega$，刚好抵消源端 $+j3\ \Omega$ 感抗。）` },
            { label: R`2. 用峰值相量公式（分母 $8$）计算`, tex: R`P_{\max} = \frac{16^2}{8 \times 4} = \frac{256}{32} = 8\text{ W}` },
            {
              label: R`3. 用 RMS 相量公式（分母 $4$）交叉验算`,
              tex: R`V_{Th,\text{rms}} = \frac{16}{\sqrt{2}} = 8\sqrt{2}\text{ V} \implies P_{\max} = \frac{(8\sqrt{2})^2}{4 \times 4} = \frac{128}{16} = 8\text{ W}`,
            },
          ],
        },
        { kind: 'p', text: '**5.3 内联示波器图：交流共轭匹配等效电路与功率峰值曲线**' },
      ],
      inline_svg: SVG_ACT5,
      figure_caption: '交流最大平均功率传输：共轭匹配等效电路与功率峰值曲线',
    },
    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '综合实战——先求交流戴维南，再双轨验算共轭匹配',
      sync: sync(L3, ['mt_zth', 'mt_zl', 'mt_div8', 'mt_div4'], { [P.src]: 'a6', [P.rl]: 3.2, [P.xl]: 2.4, [P.mode]: 'peak' }),
      blocks: [
        { kind: 'p', text: '**6.1 经典工程母题**' },
        {
          kind: 'p',
          text: R`在真实电路（或期末考试大题）里，题目绝不会直接把 $\mathbf{V}_{Th}$ 和 $\mathbf{Z}_{Th}$ 喂到你嘴边。你必须先执行 ${code('W5-L4')} 的**交流戴维南等效**，再无缝衔接本讲的**共轭匹配**。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**实战例题**：如图所示频域电路中，独立正弦电源 $\mathbf{V}_s = 20\angle 0^\circ\text{ V}$（**峰值相量**），串联支路阻抗 $\mathbf{Z}_1 = 4 + j2\ \Omega$，并联支路为电容抗 $\mathbf{Z}_2 = -j4\ \Omega$，端口 $a\text{--}b$ 接入可调复负载 $\mathbf{Z}_L$。求：(1) 负载 $\mathbf{Z}_L$ 取何值时可获得最大平均功率？(2) 分别用**峰值相量公式（$/8$）**与**RMS 相量公式（$/4$）**双重校验最大平均功率 $P_{\max}$。`,
        },
        { kind: 'p', text: '**6.2 三段式教授板书推导：完整求解与双轨核验**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. 交流戴维南定理：移去 $\mathbf{Z}_L$，独立源置零求端口输入阻抗 $\mathbf{Z}_{Th}$，恢复电源求端口开路电压 $\mathbf{V}_{Th}$；2. 交流最大平均功率传输定理：$\mathbf{Z}_L = \mathbf{Z}_{Th}^* = R_{Th} - jX_{Th}$，且 $P_{\max} = \dfrac{|\mathbf{V}_{Th}|^2}{8 R_{Th}} = \dfrac{V_{Th,\text{rms}}^2}{4 R_{Th}}$。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式',
          tex: R`\begin{gathered} \mathbf{Z}_{Th} = \mathbf{Z}_1 \parallel \mathbf{Z}_2 = \frac{\mathbf{Z}_1 \mathbf{Z}_2}{\mathbf{Z}_1 + \mathbf{Z}_2}, \qquad \mathbf{V}_{Th} = \mathbf{V}_s \cdot \frac{\mathbf{Z}_2}{\mathbf{Z}_1 + \mathbf{Z}_2} \\[6pt] \mathbf{Z}_L = \mathbf{Z}_{Th}^*, \qquad P_{\max} = \frac{|\mathbf{V}_{Th}|^2}{8\,\text{Re}(\mathbf{Z}_{Th})} = \frac{(|\mathbf{V}_{Th}|/\sqrt{2})^2}{4\,\text{Re}(\mathbf{Z}_{Th})} \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`1. **求戴维南阻抗 $\mathbf{Z}_{Th}$**（电源 $\mathbf{V}_s$ 短路置零，$\mathbf{Z}_1$ 与 $\mathbf{Z}_2$ 并联）`,
              tex: R`\mathbf{Z}_{Th} = \frac{(4 + j2)(-j4)}{(4 + j2) + (-j4)} = \frac{8 - j16}{4 - j2} = \frac{(8 - j16)(4 + j2)}{4^2 + 2^2}`,
            },
            { label: '', tex: R`= \frac{32 + j16 - j64 + 32}{20} = \frac{64 - j48}{20} = 3.2 - j2.4\ \Omega` },
            { label: '', text: R`由此提取实部电阻 [[mt_zth|$R_{Th} = 3.2\ \Omega$，虚部电抗 $X_{Th} = -2.4\ \Omega$（容性）]]。` },
            { label: R`2. **求共轭匹配负载 $\mathbf{Z}_L$**`, tex: R`\mathbf{Z}_L = \mathbf{Z}_{Th}^* = 3.2 + j2.4\ \Omega` },
            { label: '', text: R`（负载必须呈**感性** $+j2.4\ \Omega$，恰好与戴维南等效容抗 $-j2.4\ \Omega$ 抵消！）` },
            {
              label: R`3. **求戴维南开路电压 $\mathbf{V}_{Th}$**（分压公式）`,
              tex: R`\mathbf{V}_{Th} = 20 \times \frac{-j4}{4 - j2} = \frac{-j80(4 + j2)}{20} = -j4(4 + j2) = 8 - j16\text{ V}`,
            },
            {
              label: '',
              text: '计算模值与幅角：',
              tex: R`|\mathbf{V}_{Th}| = \sqrt{8^2 + (-16)^2} = \sqrt{64 + 256} = \sqrt{320} = 8\sqrt{5} \approx 17.89\text{ V}, \qquad \theta_{Th} = \arctan(-2) \approx -63.43^\circ`,
            },
            {
              label: R`4. **双轨验算最大平均功率 $P_{\max}$**`,
              text: R`[[mt_div8|**路径 A（峰值相量，分母 $8 R_{Th}$）**]]：`,
              tex: R`P_{\max} = \frac{|\mathbf{V}_{Th}|^2}{8 R_{Th}} = \frac{(8\sqrt{5})^2}{8 \times 3.2} = \frac{320}{25.6} = 12.5\text{ W}`,
            },
            {
              label: '',
              text: R`[[mt_div4|**路径 B（RMS 相量，分母 $4 R_{Th}$）**]]：`,
              tex: R`V_{Th,\text{rms}} = \frac{8\sqrt{5}}{\sqrt{2}} = 4\sqrt{10}\text{ V} \implies V_{Th,\text{rms}}^2 = 160\text{ V}^2`,
            },
            { label: '', tex: R`P_{\max} = \frac{V_{Th,\text{rms}}^2}{4 R_{Th}} = \frac{160}{4 \times 3.2} = \frac{160}{12.8} = 12.5\text{ W}` },
            { label: '', text: R`两条路径均精确给出 **$12.5\text{ W}$**，验证完毕！` },
          ],
        },
        { kind: 'p', text: '**6.3 内联电路与双轨校验图**' },
      ],
      inline_svg: SVG_ACT6,
      figure_caption: '经典综合实战电路：戴维南等效与峰值 (/8) / RMS (/4) 双轨校验',
    },
    /* ------------------------------------------------------------- the guided example and the quiz */
    {
      act_index: 7,
      badge: '引导例题',
      title: '苏格拉底式分步引导例题（5 步交互通关）',
      sync: sync(L3, ['gd_vs', 'gd_r1', 'gd_c', 'gd_l'], { [P.src]: 'gd', [P.mode]: 'peak' }),
      blocks: [
        {
          kind: 'p',
          text: R`**题目背景**：频域电路中独立电源 $\mathbf{V}_s = 20\angle 0^\circ\text{ V}$（峰值相量），左侧串联 $R_1 = 10\ \Omega$，中间节点对地并联容抗 $-j10\ \Omega$，右侧经串联感抗 $+j8\ \Omega$ 通向输出端口 $a\text{--}b$（接可调负载 $\mathbf{Z}_L$）。引导学员分 5 步完成从交流戴维南等效到共轭匹配与双轨功率校验的全流程。`,
        },
        {
          kind: 'guided',
          title: '五步通关：从交流戴维南等效到共轭匹配与双轨功率验算',
          problem: R`给定交流电路：电源 $\mathbf{V}_s = 20\angle 0^\circ\text{ V}$（峰值相量），串联电阻 $R_1 = 10\ \Omega$，中间节点并联容抗 $-j10\ \Omega$，再经串联感抗 $+j8\ \Omega$ 连至端口 a-b 接负载 $\mathbf{Z}_L$。请分步求出戴维南等效电路、共轭匹配负载 $\mathbf{Z}_L$ 及最大平均功率 $P_{\max}$。`,
          problem_svg: SVG_GUIDED,
          steps: [
            {
              title: R`第 1 步：独立源置零，求交流戴维南阻抗 $\mathbf{Z}_{Th}$`,
              mini_svg: MINI_STEP1,
              question: R`把负载 $\mathbf{Z}_L$ 从端口 a-b 摘除，并将独立电压源 $\mathbf{V}_s = 20\angle 0^\circ\text{ V}$ 置零（短路）。从端口 a-b 向左看，$10\ \Omega$ 与 $-j10\ \Omega$ 并联后再与 $+j8\ \Omega$ 串联，请问 $\mathbf{Z}_{Th}$ 等于多少？`,
              hint: R`$\mathbf{Z}_{Th} = (10 \parallel -j10) + j8 = \dfrac{10(-j10)}{10 - j10} + j8$`,
              options: [
                {
                  text: R`$5 + j8\ \Omega$`,
                  correct: false,
                  feedback: R`慢着！检查一下你的并联运算：$10$ 与 $-j10$ 并联不是实数，分母 $(10 - j10)$ 必须同乘共轭 $(10 + j10)$ 有理化，得出 $5 - j5\ \Omega$，再加上串联的 $+j8\ \Omega$，看看虚部怎么合并？`,
                },
                {
                  text: R`$5 + j3\ \Omega$`,
                  correct: true,
                  feedback: R`漂亮！$\dfrac{10(-j10)}{10 - j10}$ 有理化得 $5 - j5\ \Omega$，再串上 $+j8\ \Omega$：虚部 $-5 + 8 = +3$，这是一个感性的戴维南内阻抗。`,
                },
                {
                  text: R`$5 + j13\ \Omega$`,
                  correct: false,
                  feedback: R`符号翻了！$\dfrac{-j100}{10 - j10}$ 有理化后虚部是负的：电容支路让并联结果呈**容性**，是 $5 - j5\ \Omega$ 而不是 $5 + j5\ \Omega$。负的虚部再与 $+j8$ 合并，才是正确的虚部。`,
                },
              ],
              board: [R`\mathbf{Z}_{Th} = \frac{-j100(10 + j10)}{200} + j8`, R`= (5 - j5) + j8 = 5 + j3\ \Omega`],
              halo: ['gd_r1', 'gd_c', 'gd_l'],
              params: G(0, { [P.rl]: 2, [P.xl]: 0 }),
              layer: L3,
            },
            {
              title: R`第 2 步：恢复电源，求开路戴维南电压 $\mathbf{V}_{Th}$`,
              mini_svg: MINI_STEP2,
              question: R`恢复独立源 $\mathbf{V}_s = 20\angle 0^\circ\text{ V}$，端口 a-b 保持开路。注意观察串联电感 $+j8\ \Omega$ 中有没有电流？请用分压公式求开路电压 $\mathbf{V}_{Th}$（直角坐标或极坐标均可）。`,
              hint: R`$\mathbf{V}_{Th} = 20\angle 0^\circ \cdot \dfrac{-j10}{10 - j10}$`,
              options: [
                {
                  text: R`$0.77 - j3.85\text{ V}$`,
                  correct: false,
                  feedback: R`别把 $+j8\ \Omega$ 算进分压里！端口 a-b 是开路的，流过 $+j8\ \Omega$ 的电流严格为 $0$，所以它两端压降为 $0$，$\mathbf{V}_{Th}$ 就等于电容 $-j10\ \Omega$ 两端的分压电压！`,
                },
                {
                  text: R`$20\angle 0^\circ\text{ V}$（与 $\mathbf{V}_s$ 相同）`,
                  correct: false,
                  feedback: R`端口开路只让 $+j8\ \Omega$ 这一段没有电流；$10\ \Omega$ 与 $-j10\ \Omega$ 仍和电源组成闭合回路，电流照样流过 $10\ \Omega$ 并产生压降。$\mathbf{V}_{Th}$ 是电容 $-j10\ \Omega$ 两端分到的电压，不是整个 $\mathbf{V}_s$。`,
                },
                {
                  text: R`$10 - j10\text{ V}$（即 $10\sqrt{2}\angle{-45^\circ}\text{ V}$）`,
                  correct: true,
                  feedback: R`正确！开路时 $+j8\ \Omega$ 无电流、无压降，$\mathbf{V}_{Th}$ 就是 $-j10\ \Omega$ 上的分压：分子分母同除以 $10$ 得 $20 \cdot \dfrac{-j}{1 - j}$，再有理化。`,
                },
              ],
              board: [R`\mathbf{V}_{Th} = 20 \cdot \frac{-j}{1 - j} = 10(1 - j)`, R`= 10\sqrt{2}\angle{-45^\circ}\text{ V}`],
              halo: ['gd_vs', 'gd_r1', 'gd_c'],
              params: G(1),
              layer: L3,
            },
            {
              title: R`第 3 步：应用共轭匹配定理确定最佳负载 $\mathbf{Z}_L$`,
              mini_svg: MINI_STEP3,
              question: R`已知 $\mathbf{Z}_{Th} = 5 + j3\ \Omega$，为使负载 $\mathbf{Z}_L$ 获得最大平均功率，$\mathbf{Z}_L$ 应取何值？`,
              hint: R`$\mathbf{Z}_L = \mathbf{Z}_{Th}^* = R_{Th} - jX_{Th}$`,
              options: [
                {
                  text: R`$5 - j3\ \Omega$`,
                  correct: true,
                  feedback: R`对！取复共轭：$-j3$ 的容抗把内阻抗的 $+j3$ 感抗抵消为零（串联谐振），剩下 $R_L = R_{Th} = 5\ \Omega$ 的纯电阻匹配。`,
                },
                {
                  text: R`$5 + j3\ \Omega$`,
                  correct: false,
                  feedback: R`警惕“直接相等”陷阱！如果你取 $\mathbf{Z}_L = 5 + j3\ \Omega$，总电抗会变成 $+j6\ \Omega$ 反而翻倍，必须取复共轭让 $+j3$ 与 $-j3$ 抵消为零！`,
                },
                {
                  text: R`$5\ \Omega$（纯电阻，与 $R_{Th}$ 相等）`,
                  correct: false,
                  feedback: R`只对上了实部：$+j3\ \Omega$ 的内电抗还留在回路里，白白增大总阻抗、拖小电流。这里 $\mathbf{Z}_L$ 的电抗也可以调，就该让它与 $X_{Th}$ 大小相等、符号相反，把回路电抗清零。`,
                },
              ],
              board: [R`\mathbf{Z}_L = (5 + j3)^* = 5 - j3\ \Omega`],
              halo: ['mt_zl', 'mt_lamp'],
              params: G(2),
              layer: L3,
            },
            {
              title: '第 4 步：辨析峰值相量与 RMS 相量',
              mini_svg: MINI_STEP4,
              question: R`原题给的 $\mathbf{V}_s = 20\angle 0^\circ\text{ V}$ 是峰值相量，因此我们算出的 $|\mathbf{V}_{Th}| = 10\sqrt{2}\text{ V}$ 也是峰值幅值。请问它对应的 RMS 有效值 $V_{Th,\text{rms}}$ 是多少伏？`,
              hint: R`$V_{Th,\text{rms}} = \dfrac{|\mathbf{V}_{Th}|}{\sqrt{2}}$`,
              options: [
                {
                  text: R`$20\text{ V}$`,
                  correct: false,
                  feedback: R`记住正弦波换算铁律：有效值永远比峰值小，是峰值除以 $\sqrt{2}$，而不是乘以 $\sqrt{2}$！`,
                },
                {
                  text: R`$10\text{ V}$`,
                  correct: true,
                  feedback: R`没错：峰值除以 $\sqrt{2}$。同一个电源，峰值相量写作 $10\sqrt{2}\angle{-45^\circ}\text{ V}$，RMS 相量写作 $10\angle{-45^\circ}\text{ V}$——只是标定方式不同。`,
                },
                {
                  text: R`$10\sqrt{2} \approx 14.14\text{ V}$`,
                  correct: false,
                  feedback: R`这是峰值本身。题目已注明 $\mathbf{V}_s$ 是峰值相量，由它分压得到的 $|\mathbf{V}_{Th}|$ 也是峰值；只有标明为 RMS 的相量，它的模才直接就是有效值。`,
                },
              ],
              board: [R`V_{Th,\text{rms}} = \frac{10\sqrt{2}}{\sqrt{2}} = 10\text{ V}`],
              halo: ['mt_vth', 'mt_div4'],
              params: G(3, { [P.rl]: 5, [P.xl]: -3, [P.mode]: 'rms' }),
              layer: L3,
            },
            {
              title: R`第 5 步：用 /8 与 /4 双公式校验最大平均功率 $P_{\max}$`,
              mini_svg: MINI_STEP5,
              question: R`已知 $R_{Th} = 5\ \Omega$、$|\mathbf{V}_{Th}| = 10\sqrt{2}\text{ V}$、$V_{Th,\text{rms}} = 10\text{ V}$，请计算最大平均功率 $P_{\max}$（单位 W），并确认两条公式结果完全一致。`,
              hint: R`$P_{\max} = \dfrac{|\mathbf{V}_{Th}|^2}{8 R_{Th}} = \dfrac{V_{Th,\text{rms}}^2}{4 R_{Th}}$`,
              options: [
                {
                  text: R`$10\text{ W}$`,
                  correct: false,
                  feedback: R`如果你算出 $10\text{ W}$，一定是把峰值 $10\sqrt{2}$ 直接代进了分母 $4R_{Th}$！记住口诀：“峰值除八，有效除四”。`,
                },
                {
                  text: R`$2.5\text{ W}$`,
                  correct: false,
                  feedback: R`反方向的错代：你把有效值 $10\text{ V}$ 代进了峰值公式的分母 $8R_{Th}$，$\dfrac{100}{40} = 2.5\text{ W}$，少算了一半。有效值配分母 $4$，峰值配分母 $8$。`,
                },
                {
                  text: R`$5\text{ W}$（两条公式结果一致）`,
                  correct: true,
                  feedback: R`双轨一致！$\dfrac{(10\sqrt{2})^2}{8 \times 5} = \dfrac{200}{40}$，$\dfrac{10^2}{4 \times 5} = \dfrac{100}{20}$——峰值除八，有效除四，殊途同归。`,
                },
              ],
              board: [R`P_{\max} = \frac{(10\sqrt{2})^2}{8 \times 5} = \frac{10^2}{4 \times 5} = 5\text{ W}`],
              halo: ['mt_div8', 'mt_div4', 'mt_peak'],
              params: G(4),
              layer: L3,
            },
          ],
          done_params: { [P.g]: 5 },
          conclusion: R`通关！$\mathbf{Z}_{Th} = 5 + j3\ \Omega$，$\mathbf{V}_{Th} = 10\sqrt{2}\angle{-45^\circ}\text{ V}$（峰值相量），共轭匹配负载 $\mathbf{Z}_L = 5 - j3\ \Omega$，$P_{\max} = 5\text{ W}$。左侧 03 层已揭晓引导例题的全部数值：拖动 $R_L$、$X_L$，看功率怎样从峰值滑落；切换“峰值相量 ÷8 / RMS 相量 ÷4”，看两种标定给出同一个 $P_{\max}$。`,
        },
        { kind: 'p', text: '**诊断测验（4 题精准排雷）**' },
      ],
      quiz: [
        {
          id: 'w5l5_q1',
          concept: '瞬时功率的负功率回流',
          review_act: 1,
          question: R`某线性交流网络端口电压为 $v(t) = 100\cos(377t + 30^\circ)\text{ V}$，电流为 $i(t) = 8\cos(377t - 30^\circ)\text{ A}$。关于其瞬时功率 $p(t)$，下列哪项描述完全正确？`,
          options: [
            {
              key: 'A',
              text: R`$p(t)$ 以 $377\text{ rad/s}$ 脉动，且恒大于零，无能量回流`,
              correct: false,
              feedback: R`两处都不对：$p = v\,i$ 是两个 $\omega$ 余弦相乘，积化和差后的脉动项是 $\cos(2\omega t + \theta_v + \theta_i)$，频率翻倍；而平均功率为正并不保证瞬时功率恒正——只要电压电流有相位差，脉动幅值 $\frac{1}{2}V_m I_m$ 就大于平均值，每个半周都会掉到零以下。`,
            },
            { key: 'B', text: R`$p(t)$ 以 $754\text{ rad/s}$ 脉动，平均功率为 $200\text{ W}$，存在 $p(t) < 0$ 的负功率回流区间`, correct: true },
            {
              key: 'C',
              text: R`$p(t)$ 以 $754\text{ rad/s}$ 脉动，平均功率为 $400\text{ W}$，最小值恰好为 $0\text{ W}$`,
              correct: false,
              feedback: R`$400$ 是 $\frac{1}{2}V_m I_m$，只是脉动项的幅值（单位 VA）；平均功率还要乘上 $\cos(\theta_v - \theta_i)$，这里相位差不为零，它小于 $1$。“最小值恰好为 $0$”只在电压电流同相（纯电阻）时成立。`,
            },
            {
              key: 'D',
              text: R`$p(t)$ 恒等于 $200\text{ W}$，不随时间变化`,
              correct: false,
              feedback: R`恒定不变的功率属于直流电路（或三相平衡系统的总瞬时功率）。单相正弦稳态下 $p(t)$ 总带着一个 $2\omega$ 的脉动项，恒定的只是它的平均值。`,
            },
          ],
          feedback_correct: R`$p(t) = \frac{1}{2}(100)(8)\cos(60^\circ) + \frac{1}{2}(100)(8)\cos(754t + 0^\circ) = 200 + 400\cos(754t)\text{ W}$。脉动角频率为 $2\omega = 754\text{ rad/s}$，最小值为 $200 - 400 = -200\text{ W} < 0$，存在储能元件向电源回馈能量的负功率区。`,
          feedback_wrong: R`回到第 1 幕：先算 $\theta_v - \theta_i$ 与 $\frac{1}{2}V_m I_m$，再看脉动项的频率和幅值。`,
          figure: SVG_Q1,
          sync: { layer: L1, halo: ['sc_p'] },
        },
        {
          id: 'w5l5_q2',
          concept: '纯电抗的平均功率为零',
          review_act: 2,
          question: R`将一台理想纯电感 $L = 50\text{ mH}$ 直接接到 $220\text{ V}$（RMS）、$50\text{ Hz}$ 的交流电源上，该电感在一个完整周期内吸收的平均功率 $P$ 等于多少？`,
          options: [
            { key: 'A', text: R`$0\text{ W}$`, correct: true },
            {
              key: 'B',
              text: R`约 $3.08\text{ kW}$`,
              correct: false,
              feedback: R`$\dfrac{V_{\text{rms}}^2}{X_L} = \dfrac{220^2}{2\pi \times 50 \times 0.05} \approx \dfrac{48400}{15.71} \approx 3.08\text{ k}$ 算出的是无功功率 $Q$（单位 var），它描述磁场来回吞吐能量的幅度，并不是被消耗掉的平均功率 $P$。`,
            },
            {
              key: 'C',
              text: R`约 $1.54\text{ kW}$`,
              correct: false,
              feedback: R`再除以 $2$ 也改变不了性质：这依然是拿电抗 $X_L$ 当耗能电阻在算。电抗不消耗能量——理想电感里 $\theta_v - \theta_i = +90^\circ$，平均功率里的 $\cos(\theta_v - \theta_i)$ 会把一切乘成零。`,
            },
            {
              key: 'D',
              text: '取决于初始合闸相位',
              correct: false,
              feedback: R`合闸相位只影响刚接通时的暂态冲击电流；题目问的是正弦稳态下一个完整周期的平均功率，它只由 $\cos(\theta_v - \theta_i)$ 决定，与合闸时刻无关。`,
            },
          ],
          feedback_correct: R`纯电感中电压超前电流 $90^\circ$，即 $\theta_v - \theta_i = +90^\circ$，因此 $P = V_{\text{rms}} I_{\text{rms}} \cos(90^\circ) = 0\text{ W}$。它在周期内仅进行磁场能量的周期性吞吐，净消耗平均功率严格为零。`,
          feedback_wrong: '回到第 2 幕的 R / L / C 三联画像：纯电感的 p(t) 正负面积是什么关系？',
          figure: SVG_Q2,
          sync: { layer: L1, halo: ['sc_avg'] },
        },
        {
          id: 'w5l5_q3',
          concept: 'DC + AC 混合有效值',
          review_act: 4,
          question: R`某开关电源输出电压为 $v(t) = 6 + 8\sqrt{2}\cos(1000t)\text{ V}$，该电压的有效值 $V_{\text{rms}}$ 为多少？`,
          options: [
            {
              key: 'A',
              text: R`$14\text{ V}$`,
              correct: false,
              feedback: R`$14 = 6 + 8$ 是把直流分量与交流有效值直接代数相加。两者在一个周期内正交（交叉项积分为 $0$），要按能量勾股定理合成，而不是相加。`,
            },
            { key: 'B', text: R`$10\text{ V}$`, correct: true },
            {
              key: 'C',
              text: R`$6 + 8\sqrt{2} \approx 17.31\text{ V}$`,
              correct: false,
              feedback: R`$6 + 8\sqrt{2}$ 是波形冲到的最大瞬时值（峰值），不是有效值；有效值由 $v^2$ 的周期平均决定，对这样起伏的波形必然小于峰值。`,
            },
            {
              key: 'D',
              text: R`约 $7.07\text{ V}$`,
              correct: false,
              feedback: R`这是把整个混合波形当成一个正弦波、整体再除以 $\sqrt{2}$。可直流分量平方后恒为 $V_{dc}^2$，它的有效值就是 $V_{dc}$ 本身，不能除以 $\sqrt{2}$；只有交流正弦分量才换算 $V_{1,\text{rms}} = V_{1m}/\sqrt{2}$。`,
            },
          ],
          feedback_correct: R`直流分量 $V_{dc} = 6\text{ V}$，交流正弦分量有效值 $V_{1,\text{rms}} = \frac{8\sqrt{2}}{\sqrt{2}} = 8\text{ V}$。由于直流与交流在一个周期内正交，总有效值满足 $V_{\text{rms}} = \sqrt{6^2 + 8^2} = \sqrt{100} = 10\text{ V}$。`,
          feedback_wrong: '先把直流分量和交流分量各自的有效值找出来，再想它们该怎样合成。',
          figure: SVG_Q3,
          sync: { layer: L2, halo: ['rms_line'] },
        },
        {
          id: 'w5l5_q4',
          concept: '共轭匹配：分母 8 还是 4',
          review_act: 5,
          question: R`某交流网络的戴维南等效为 $\mathbf{V}_{Th} = 12\angle 0^\circ\text{ V}$（RMS 有效值相量），$\mathbf{Z}_{Th} = 3 - j4\ \Omega$。要使负载 $\mathbf{Z}_L$ 获得最大平均功率，$\mathbf{Z}_L$ 与 $P_{\max}$ 分别为多少？`,
          options: [
            {
              key: 'A',
              text: R`$\mathbf{Z}_L = 3 - j4\ \Omega$，$P_{\max} = 12\text{ W}$`,
              correct: false,
              feedback: R`$\mathbf{Z}_L = \mathbf{Z}_{Th}$ 不是匹配：总电抗变成 $-j8\ \Omega$，容抗叠加翻倍，电流被拖小，负载功率远小于最大值。必须取复共轭，让负载电抗与 $-j4\ \Omega$ 抵消。`,
            },
            {
              key: 'B',
              text: R`$\mathbf{Z}_L = 3 + j4\ \Omega$，$P_{\max} = 6\text{ W}$`,
              correct: false,
              feedback: R`负载取对了，功率却踩进了“分母 8 vs 4”陷阱：题干明确 $\mathbf{V}_{Th}$ 是 RMS 有效值相量，你却把它代进了峰值公式 $\dfrac{|\mathbf{V}_{Th}|^2}{8R_{Th}}$，结果少了一半。`,
            },
            { key: 'C', text: R`$\mathbf{Z}_L = 3 + j4\ \Omega$，$P_{\max} = 12\text{ W}$`, correct: true },
            {
              key: 'D',
              text: R`$\mathbf{Z}_L = 5\ \Omega$（纯电阻），$P_{\max} = 12\text{ W}$`,
              correct: false,
              feedback: R`$R_L = |\mathbf{Z}_{Th}| = 5\ \Omega$ 是负载只能取纯电阻时的最佳值；纯电阻抵消不了 $-j4\ \Omega$ 的内电抗，负载功率只有 $\dfrac{12^2 \times 5}{8^2 + 4^2} = 9\text{ W}$，严格小于共轭匹配能拿到的最大值。`,
            },
          ],
          feedback_correct: R`共轭匹配要求 $\mathbf{Z}_L = \mathbf{Z}_{Th}^* = 3 + j4\ \Omega$。特别注意题干已明确给出 $\mathbf{V}_{Th}$ 为 RMS 有效值相量，故应使用分母为 4 的公式：$P_{\max} = \dfrac{V_{Th,\text{rms}}^2}{4 R_{Th}} = \dfrac{12^2}{4 \times 3} = \dfrac{144}{12} = 12\text{ W}$。`,
          feedback_wrong: '两件事分开判断：负载要不要取共轭？题干给的是峰值相量还是 RMS 相量？',
          figure: SVG_Q4,
          sync: { layer: L3, halo: ['mt_div4'] },
        },
      ],
    },
  ],
};

export default W5_L5;
