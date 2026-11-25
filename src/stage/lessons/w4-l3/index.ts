// W4-L3 · 运放积分器与微分器：用虚地把波形送进微积分流水线 (lesson sheet: docs/lessons/W4-L3.md).
// The professor's text of the six acts is reproduced from the sheet as written; [[id|…]] only links
// a term to the stage (the words are unchanged). Changes of form, none of wording:
// - the opening address leads act 1; the sheet's sub-headings (1.1, 1.2 …) are bold lines; display
//   formulas sit in the ①/②/③ cards (a lead-in sentence becomes the card title; the numbered ①
//   items run as one paragraph); the sheet's italic asides and 教授划重点 are tip notes; the
//   diagnostic quiz is its own closing act;
// - plain-text symbols of the JSON parts (R = 10 kΩ, v_o(0), f_c …) are set as TeX;
// - anti-spoiler: §2.2's 250 Hz square-wave example is the guided example. Act 2 keeps the problem,
//   ① and ②; its ③ calculation moves behind the guided block as the 「通关复盘」 board (with a
//   waveform figure). The scope shows the example's circuit while it runs (param `scn` = 'ex')
//   and uncovers CH2 and its readouts step by step (param `g`), `done_params` uncovers the rest;
//   the mini diagrams of steps 2–4 no longer draw their own answers (sheetSvgs.ts);
// - supply (course-owner rule): the sheet's "两节 9V 电池串联" is the 台式可调直流电源（±9 V） — two 9 V
//   outputs in series, the middle COM = GND, red / black / blue leads to the +9 V / GND / −9 V rails
//   — in the safety note, the act-6 table, figure 6-1 and the 3D bench (wording as W3-L3 / W3-L4;
//   the supply's outputs are called 第 1 路 / 第 2 路, since CH1 / CH2 are the scope's here);
// - LM358 swing on ±9 V: about +7.5 V high and about −8.9 V low at light load. The sheet's −8.8 V
//   is −8.9 V (acts 2, 3, 6), and t ≈ 1.76 ms in §2.2 (c) is 1.78 ms; §2.2 (c) also notes that the
//   output sinks 0.5 mA there, so its low limit is a little higher than at light load. The sheet's
//   symmetric ±7.5 V stays as the conservative design limit;
// - dev-facing text is left out: the YAML keys and the closing "Claude 工程落地清单" (its stage spec
//   is what the three layers build).
// Added: the bench safety / scaling note in act 6 (from the sheet's YAML), a tip on the real swing in
// act 2, stage tips in acts 3–5, the 3D board's wiring table, the guided steps' praise lines and
// conclusion, the quiz figures and per-option feedback (written from the sheet's explanations), and
// a mixed answer order in the quiz (the sheet's right answers are B, B, B, A).

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import type { StageLesson, StageSync } from '../../types';
import { MINI_1, MINI_2, MINI_3, MINI_4, MINI_5, SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_ACT6 } from './sheetSvgs';
import { SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4, SVG_QUIZ_ACT, SVG_REVIEW } from './svgs';

const Schematic = lazy(() => import('./Schematic'));
const Scope = lazy(() => import('./Scope'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;
/** inline code inside String.raw text */
const code = (s: string) => '`' + s + '`';

const L1 = 'schematic';
const L2 = 'scope';
const L3 = 'bench3d';

const SUPPLY = '台式可调直流电源（±9 V）';

/** the 2D layers' set-up (every act sets all of it, so scrolling back restores it) */
const scope = (p: Record<string, unknown> = {}): StageSync['params'] => ({
  scn: 'free',
  mode: 'int',
  wave: 'square',
  f: 500,
  amp: 2,
  vos: false,
  glitch: false,
  ic: 'sym',
  ...p,
});
/** the 3D bench's set-up */
const bench = (p: Record<string, unknown> = {}): StageSync['params'] => ({
  bpre: 'int',
  brf: true,
  brs: true,
  bwave: 'square',
  bf: 500,
  bamp: 2,
  bgen: true,
  bglitch: false,
  cam: 'bench',
  ...p,
});
/** the guided example on the scope, `g` = steps answered so far */
const ex = (g: number, exAmp = 3): StageSync['params'] => ({ scn: 'ex', g, exAmp });

const PIN = (n: number, name: string, zh: string, hole: string) => ({ label: `LM358 Pin ${n}（${name}）`, desc: `${zh}；本课面包板上插在 ${hole}` });

const W4_L3: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Schematic, [L2]: Scope, [L3]: Bench3D },
  describeTarget: genericLabel,
  lesson_meta: {
    lesson_id: 'W4-L3',
    world: 'World 4',
    title: '运放积分器与微分器：用虚地把波形送进微积分流水线',
    subtitle: '强回链 World 3 运放虚地 + 双通道示波器与 3D 面包板实操',
    lesson_type: 'D',
    lesson_type_label: 'Type D（动态波形 + 3D 面包板实操课）',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits, 2026 Release',
      sections: ['Section 6.6 Applications: Integrator & Differentiator'],
    },
    prerequisites: ['W3-L1 理想运放与实际失调电压（LM358 V_OS ≈ 3 mV）', 'W3-L3 反相放大器（虚地 v− = 0 与节点 KCL）', 'W4-L1 电容微分伏安关系（i_C = C dv_C/dt）'],
    next_lesson: 'W4-L4',
    next_lesson_title: '无源 RC/RL 一阶自然响应（时间常数 τ 与指数衰减）',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 积分器/微分器原理图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 2D 积分器/微分器切换原理图：一键切换理想积分器 / 有损积分器（+R_f）/ 理想微分器 / 实用微分器（+R_s），虚地节点 v− = 0 V 呼吸发光，输入支路与反馈支路的电流动态箭头；下方是这一模式的通式与 RC、f_c、f_b、|A_max| 等数值。',
      },
      {
        id: L2,
        label: '02 实时双通道示波器',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 实时双通道示波器：CH1（黄）输入方波 / 三角波 / 接地，CH2（青）输出由实时数值积分算出，按 LM358 在 ±9 V 下的摆幅（+7.5 V / −8.9 V）限幅并点亮 CLIPPING 警报；可调频率 100–2000 Hz、幅值 0.5–5 V，开关 3 mV 失调（附上电 0–4 s 漂移慢扫描）与 50 kHz 高频毛刺。',
      },
      {
        id: L3,
        label: '03 3D LM358 面包板实操',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption:
          '03 3D LM358 ±9V 双电源面包板：台式可调直流电源（±9 V）经红 / 黑 / 蓝导线接 +9 V / GND / −9 V 轨，函数信号发生器的红夹接输入节点，示波器 CH1 / CH2 探头钩住输入与 Pin 1；可一键切换有损积分器 / 实用微分器，拔掉 R_f 或 R_s 看翻车，示波器屏幕实时显示波形。',
      },
    ],
    hover_map: {
      vi: { label: '输入 v_i(t)', desc: '函数信号发生器送来的方波 / 三角波；面包板上是第 18 列（信号源红夹 j18，CH1 探头 g18）' },
      r_in: { label: '输入电阻 R（积分器）', desc: 'R = 10 kΩ（棕-黑-橙-金）：虚地让 i_R = v_i/R，只由输入决定；面包板 h18 → h24' },
      c_fb: { label: '反馈电容 C（积分器）', desc: 'C = 100 nF（104 薄膜电容，无极性）跨接 v− 与输出：i_C = C dv_C/dt，电荷累积 = 积分；面包板 i24 → i28' },
      rf: { label: '并联反馈电阻 R_f', desc: 'R_f = 100 kΩ（棕-黑-黄-金）并在 C 两端：把直流增益锁在 1 + R_f/R = 11，3 mV 失调只输出 33 mV；f_c = 1/(2πR_fC) ≈ 15.92 Hz' },
      c_in: { label: '输入电容 C（微分器）', desc: 'C = 100 nF 挪到输入端：i_C = C dv_i/dt，输入变化越快电流越大' },
      r_fb: { label: '反馈电阻 R（微分器）', desc: 'R = 10 kΩ 跨接 v− 与输出：v_o = −R·i_C = −RC dv_i/dt；面包板 j24 → j28' },
      rs: { label: '串联电阻 R_s', desc: 'R_s = 1 kΩ（棕-黑-红-金）串在输入电容前：高频时 X_C → 0，增益封顶在 R/R_s = 10；f_b = 1/(2πR_sC) ≈ 1.59 kHz' },
      vn: {
        label: '虚地节点 v− = 0 V',
        desc: '同相端接地，负反馈 + 虚短把反相端钉在 0 V；虚断 i− = 0，输入支路电流一滴不漏地流过反馈元件。面包板上是 Pin 2，橙色跳线引到第 24 列',
      },
      opamp: { label: '运放（LM358 的运放 A）', desc: '高增益差分放大级：在负反馈下不断调节 v_o，让 v− 跟住 v+ = 0' },
      gnd: { label: '同相端接地（Pin 3）', desc: '运放 A 的同相输入 Pin 3 直接接 GND（黑色跳线），所以反相端是“虚地”' },
      vo: { label: '输出 v_o(t)', desc: '运放 A 的输出 Pin 1，示波器 CH2 探头钩在这里（g28）' },
      i_r: { label: '电阻支路电流 i_R', desc: '积分器：i_R = v_i/R（流进虚地）；微分器：i_R = −v_o/R（从虚地流向输出）' },
      i_c: { label: '电容支路电流 i_C', desc: '积分器：i_C = −C dv_o/dt；微分器：i_C = C dv_i/dt。虚断使 i_R = i_C' },
      rc: { label: '时间常数 RC', desc: 'RC = 10 kΩ × 100 nF = 1.0 ms：积分器斜率 dv_o/dt = −v_i/RC，微分器 v_o = −RC dv_i/dt' },
      slope: { label: '输出斜率 k', desc: '积分器对恒定输入：k = −V/RC（±2 V 方波 → ∓2 V/ms）；正输入向下斜坡，负输入向上斜坡' },
      sat: { label: '饱和削顶（电源轨）', desc: 'LM358 在 ±9 V 下：最高约 +7.5 V，最低轻载约 −8.9 V（灌电流时略高）；本课按 ±7.5 V 作保守的线性安全上限' },
      vos: { label: '输入失调电压 V_OS', desc: 'LM358 典型约 3 mV：理想积分器对它不断积分，3 V/s，2.5 s 撞 +7.5 V 轨；并联 R_f 后只剩 (1 + R_f/R) × 3 mV = 33 mV' },
      noise: { label: '50 kHz 高频毛刺', desc: 'V_n = 50 mV、f_n = 50 kHz：理想微分器增益 2πf_nRC ≈ 314，输出约 15.7 V（撞两轨）；串联 R_s 后约 10 倍，只剩约 0.50 V' },
      fc: { label: '转折频率 f_c / f_b', desc: '有损积分器 f_c = 1/(2πR_fC) ≈ 15.92 Hz（信号应 ≥ 10 f_c）；实用微分器 f_b = 1/(2πR_sC) ≈ 1.59 kHz' },
      ch1: { label: '示波器 CH1（黄）', desc: '测输入 v_i(t)：探头钩在输入节点（g18），地夹接 GND 轨' },
      ch2: { label: '示波器 CH2（青）', desc: '测输出 v_o(t)：探头钩在 Pin 1（g28），地夹接 GND 轨（严禁误夹 −9 V 轨）' },
      scope: { label: '双通道示波器', desc: '两个通道的地夹都接 ±9 V 的中点 GND；屏幕 2.5 V/div，两通道同一刻度' },
      fgen: { label: '函数信号发生器', desc: '方波 / 三角波，默认 500 Hz、±2 V（4 Vpp）、直流偏置 0 V；红夹接输入节点，黑夹接 GND。先确认电源与接地无误再打开输出' },
      psu: { label: SUPPLY, desc: '两路 9 V 输出串联，中点 COM 作 GND：红线 + 接顶部红轨（+9 V），黑线 COM 接 GND 轨，蓝线 − 接底部蓝轨（−9 V）' },
      rail_p9: { label: '+9 V 电源轨', desc: '顶部红轨，接台式电源 +（红线）；红色跳线送到 Pin 8' },
      rail_gnd: { label: 'GND 公共地', desc: '顶部蓝轨与底部红轨，接台式电源 COM（黑线，±9 V 的中点）；信号源与示波器的地夹都夹在这里' },
      rail_m9: { label: '−9 V 电源轨', desc: '底部蓝轨，接台式电源 −（蓝线）；蓝色跳线送到 Pin 4' },
      chip_lm358: { label: 'LM358 双运放（DIP-8）', desc: '缺口朝左骑跨中央凹槽：Pin 1–4 在 f 行（左 → 右），Pin 8–5 在 e 行；本课只用运放 A（Pin 1–2–3）' },
      chip_lm358_p1: PIN(1, 'OUT A', '运放 A 输出 v_o（CH2）', 'f28'),
      chip_lm358_p2: PIN(2, 'IN− A', '运放 A 反相输入 = 虚地', 'f29'),
      chip_lm358_p3: PIN(3, 'IN+ A', '运放 A 同相输入，接 GND', 'f30'),
      chip_lm358_p4: PIN(4, 'V−', '负电源 −9 V', 'f31'),
      chip_lm358_p5: PIN(5, 'IN+ B', '运放 B 同相输入（本课不用）', 'e31'),
      chip_lm358_p6: PIN(6, 'IN− B', '运放 B 反相输入（本课不用）', 'e30'),
      chip_lm358_p7: PIN(7, 'OUT B', '运放 B 输出（本课不用）', 'e29'),
      chip_lm358_p8: PIN(8, 'V+', '正电源 +9 V', 'e28'),
      center_trench: { label: '中央凹槽（Center Ravine）', desc: 'e 行与 f 行之间绝缘：DIP-8 芯片骑跨在上面，两排引脚互不相通' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '从反相放大器到积分器——用一颗电容“改造”虚地节点',
      sync: { layer: L1, halo: ['vn', 'c_fb'], params: scope() },
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎回到 Breadboard Lab！在 World 3 的 ${code('W3-L3')} 里，我们用两颗电阻搭出了反相放大器，当时你已经尝到了“[[vn|虚地（Virtual Ground）]]”的甜头——它就像一只看不见的手，把反相输入端死死钉在 $0\text{ V}$。今天，我们只做一件极其大胆的小动作：**拔掉反相放大器里的一颗电阻，换上 ${code('W4-L1')} 刚学过的电容 $C$**。你会亲眼在[[scope|示波器]]上看到，一块平平无奇的 [[chip_lm358|LM358]] 芯片，瞬间变成了一台能实时执行高等数学“积分”和“微分”的模拟计算机！更关键的是，我们不仅要推导出课本里漂亮的理想公式，还要亲手揭穿它在真实面包板上“一上电就撞墙饱和”与“高频毛刺炸屏”的两大工程坑，并用两颗不起眼的小电阻把它们彻底治好。`,
        },
        { kind: 'p', text: '**1.1 强回链 World 3：为什么虚地是模拟微积分的“发动机”？**' },
        {
          kind: 'p',
          text: R`在 ${code('W3-L3 反相放大器')} 中，输出电压 $v_o = -\frac{R_f}{R} v_i$ 的本质是什么？是**[[r_in|输入电阻 $R$]] 把输入电压 $v_i$ 变成了精确的电流 $i_R = \frac{v_i}{R}$**，而虚断（$i_- = 0$）强迫这股电流**一滴不漏地流过反馈元件**。`,
        },
        { kind: 'p', text: R`现在，我们把反馈支路的电阻 $R_f$ 拔掉，插上一颗容量为 $C$ 的无极性电容：` },
        {
          kind: 'ul',
          items: [
            R`输入端依然是电阻 $R$，因为 [[vn|$v_- = v_+ = 0\text{ V}$]]，流进虚地节点的电流仍然只由输入电压决定：[[i_r|$i_R = \frac{v_i(t)}{R}$]]。`,
            R`反馈端换成了[[c_fb|电容 $C$]]，根据 ${code('W4-L1')} 的电容伏安定律，流过电容的电流与电容两端电压的**变化率**成正比。既然电流被输入端强行“灌”进电容，电容的电压就必须不断累积电荷——**电荷的累积，在数学上就是积分！**`,
          ],
        },
        { kind: 'figure', svg: SHEET_ACT1, caption: '图 1-1：反相放大器到运放积分器拓扑演变图' },
        { kind: 'p', text: '**1.2 教授板书：理想运放积分器的三段式推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. **理想运放虚短规则**（${code('W3-L3')}）：[[gnd|同相端直接接地]]，故 $v_- = v_+ = 0$。　2. **理想运放虚断规则**（${code('W3-L3')}）：输入端不吸取电流，$i_- = 0$。　3. **[[vn|虚地节点]] KCL**：流入节点的电阻电流全部流向反馈电容，即 $i_R(t) = i_C(t)$。　4. **元件伏安关系**：输入电阻欧姆定律：$i_R(t) = \frac{v_i(t) - v_-}{R}$；反馈电容微分律（${code('W4-L1')}，按左正右负关联参考方向 $v_C = v_- - v_o$）：$i_C(t) = C\frac{dv_C(t)}{dt} = C\frac{d(v_- - v_o)}{dt}$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：将 $v_- = 0$ 代入上述两支路电流并令 $i_R(t) = i_C(t)$：`,
          tex: R`\frac{v_i(t)}{R} = C\frac{d\big(0 - v_o(t)\big)}{dt} = -C\frac{dv_o(t)}{dt}`,
        },
        { kind: 'formula', title: R`分离出输出电压变化率（[[slope|**斜率公式**]]，画波形最顺手的武器）：`, tex: R`\frac{dv_o(t)}{dt} = -\frac{1}{RC}\,v_i(t)` },
        {
          kind: 'formula',
          title: R`对时间从 $0$ 到 $t$ 两边定积分，得到**运放积分器时域通式**：`,
          tex: R`v_o(t) = -\frac{1}{RC}\int_{0}^{t} v_i(\tau)\,d\tau + v_o(0)`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授划重点**：请死死盯住那个**负号**！当输入 $v_i > 0$ 时，$\frac{dv_o}{dt} < 0$，输出电压是**向下斜坡**；当输入 $v_i < 0$ 时，$\frac{dv_o}{dt} > 0$，输出电压是**向上斜坡**。[[rc|$RC$]] 被称为积分时间常数，它决定了斜坡的陡峭程度。`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（面包板标准参数）',
          steps: [
            { label: '已知', text: R`采用本课面包板安全标定参数：$R = 10\text{ k}\Omega = 10 \times 10^3\text{ }\Omega$，$C = 100\text{ nF} = 100 \times 10^{-9}\text{ F}$。` },
            {
              label: R`1. 计算时间常数 [[rc|$RC$]]：`,
              tex: R`RC = (10 \times 10^3\text{ }\Omega) \times (100 \times 10^{-9}\text{ F}) = 1.0 \times 10^{-3}\text{ s} = 1.0\text{ ms}`,
            },
            { label: R`2. 计算积分增益系数 $-\frac{1}{RC}$：`, tex: R`-\frac{1}{RC} = -\frac{1}{1.0 \times 10^{-3}\text{ s}} = -1000\text{ s}^{-1} = -1.0\text{ ms}^{-1}` },
            {
              label: R`3. 当输入施加恒定电平 $v_i = +2.0\text{ V}$ 时，[[slope|输出斜率]]为：`,
              tex: R`\frac{dv_o}{dt} = -1000\text{ s}^{-1} \times (+2.0\text{ V}) = -2000\text{ V/s} = -2.0\text{ V/ms}`,
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 2: §2.2 is the guided example */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '示波器里的魔法——方波变三角波的精确几何与饱和红线',
      sync: { layer: L2, halo: ['ch1', 'ch2'], params: { ...scope(), g: 0 } },
      blocks: [
        { kind: 'p', text: '**2.1 双通道示波器实测形态：500 Hz 方波 → 倒相三角波**' },
        {
          kind: 'p',
          text: R`如果我们给上面这套 $RC = 1.0\text{ ms}$ 的积分器送入一个 **[[ch1|$f = 500\text{ Hz}$、幅值 $\pm 2.0\text{ V}$（峰峰值 $4.0\text{ V}_{pp}$）的对称方波]]**：`,
        },
        {
          kind: 'ul',
          items: [
            R`周期 $T = \frac{1}{500\text{ Hz}} = 2.0\text{ ms}$，半周期 $T/2 = 1.0\text{ ms}$。`,
            R`**正半周（$0 \le t < 1.0\text{ ms}$）**：$v_i = +2.0\text{ V}$，斜率 $k_1 = -2.0\text{ V/ms}$，经过 $1.0\text{ ms}$，输出变化量 $\Delta v_o = (-2.0\text{ V/ms}) \times 1.0\text{ ms} = -2.0\text{ V}$。在稳态对称工作下，输出从 $+1.0\text{ V}$ 笔直滑落到 $-1.0\text{ V}$。`,
            R`**负半周（$1.0\text{ ms} \le t < 2.0\text{ ms}$）**：$v_i = -2.0\text{ V}$，斜率 $k_2 = +2.0\text{ V/ms}$，经过 $1.0\text{ ms}$，输出变化量 $\Delta v_o = +2.0\text{ V}$，从 $-1.0\text{ V}$ 笔直爬回 $+1.0\text{ V}$。`,
            R`**最终波形**：一个完美的 [[ch2|$\pm 1.0\text{ V}$（峰峰值 $V_{pp,\text{out}} = 2.0\text{ V}$）对称三角波]]，远远低于 LM358 在 $\pm 9\text{ V}$ 供电下的 [[sat|$\pm 7.5\text{ V}$ 线性上限]]！`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`LM358 不是轨到轨运放：在 $\pm 9\text{ V}$ 上它的输出最高约 $+7.5\text{ V}$，最低在轻载时约 $-8.9\text{ V}$（灌电流较大时会再高一些）。本课把对称的 $\pm 7.5\text{ V}$ 当作保守的线性安全上限；左侧示波器按真实的 $+7.5\text{ V}$ / $-8.9\text{ V}$ 削顶。`,
        },
        { kind: 'figure', svg: SHEET_ACT2, caption: '图 2-1：双通道示波器方波变三角波精确波形图' },
        { kind: 'p', text: '**2.2 Sadiku Section 6.6 典型波形变换例题完整求解（含饱和校验）**' },
        {
          kind: 'formula',
          title: R`**题目（对标 Sadiku 6.6）**：已知某理想运放积分器采用 $R = 10\text{ k}\Omega$、$C = 100\text{ nF}$，采用 $\pm 9\text{ V}$ 双电源供电（LM358 线性输出安全上限取 $\pm 7.5\text{ V}$），初始时刻电容未储能，即 $v_o(0) = 0\text{ V}$。若输入端接入频率 $f = 250\text{ Hz}$（周期 $T = 4.0\text{ ms}$）的方波信号：`,
          tex: R`v_i(t) = \begin{cases} +3.0\text{ V}, & 0 \le t < 2.0\text{ ms} \\ -3.0\text{ V}, & 2.0\text{ ms} \le t < 4.0\text{ ms} \end{cases}`,
        },
        {
          kind: 'p',
          text: R`求：(a) $0 \le t \le 4.0\text{ ms}$ 内输出电压 $v_o(t)$ 的分段表达式、各段斜率与峰峰值；(b) 校验运放是否发生饱和；(c) 若将输入方波幅值增大到 $\pm 5.0\text{ V}$，会发生什么现象？`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`采用分段定积分法则：对于任意分段区间 $[t_k, t_{k+1}]$，输出电压满足连续性条件（电容电压不可突变）：$v_o(t) = v_o(t_k) - \frac{1}{RC}\int_{t_k}^{t} v_i(\tau)\,d\tau$`,
        },
        { kind: 'formula', title: R`② 纯符号通式：当 $v_i(\tau) = V_k$ 为该段常数值时：`, tex: R`v_o(t) = v_o(t_k) - \frac{V_k}{RC}(t - t_k), \quad k_k = -\frac{V_k}{RC}` },
        {
          kind: 'note',
          tone: 'tip',
          text: '③ 代入数值这一步先不写：下面的苏格拉底引导例题就是这道题。自己闯关之后，完整的逐段数值推导与饱和校验作为“通关复盘”板书紧跟在后面。',
        },
        { kind: 'p', text: '**苏格拉底式分步引导例题**' },
        {
          kind: 'guided',
          // all steps answered: the scope uncovers CH2 and every readout of the example
          done_params: { g: 9, exAmp: 3 },
          title: '方波积分器逐段波形求解、饱和校验与抗漂移设计',
          source: 'W4-L3-SOCRATIC-01 · 对标 Alexander, Sadiku & Fredette (2026) Section 6.6',
          problem: R`某运放积分器采用 LM358（$\pm 9\text{ V}$ 双电源，线性安全上限 $\pm 7.5\text{ V}$），[[r_in|$R = 10\text{ k}\Omega$]]，[[c_fb|$C = 100\text{ nF}$]]，初始输出 $v_o(0) = 0\text{ V}$。输入 250 Hz（$T = 4\text{ ms}$）对称方波：0~2 ms 为 $+3\text{ V}$，2~4 ms 为 $-3\text{ V}$。`,
          steps: [
            {
              title: R`Step 1 · 锁定虚地与时间常数 $RC$`,
              mini_svg: MINI_1,
              question: R`在计算输出波形前，第一步必须先求出电路的积分时间常数 $RC$ 与比例系数 $-1/(RC)$。已知 $R = 10\text{ k}\Omega$, $C = 100\text{ nF}$，请问 $RC$ 等于多少？`,
              hint: R`$RC = (10 \times 10^{3}\,\Omega) \times (100 \times 10^{-9}\,\text{F}) = 10^{-3}\,\text{s}$`,
              options: [
                { text: '0.1 ms', correct: false, feedback: R`小心数量级！100 nF 是 $10^{-7}\text{ F}$ 而不是 $10^{-8}\text{ F}$，再把 $10^4$ 乘以 $10^{-7}$ 算一遍。` },
                {
                  text: '1.0 ms',
                  correct: true,
                  feedback: R`对！$10^4\,\Omega \times 10^{-7}\,\text{F} = 10^{-3}\,\text{s}$，所以 $-1/(RC) = -1000\,\text{s}^{-1}$：每伏输入每毫秒让输出走 1 V。`,
                },
                {
                  text: '10.0 ms',
                  correct: false,
                  feedback: R`多乘了一个 10 哦！$10\text{ k}\Omega = 10^4\,\Omega$，$100\text{ nF} = 100 \times 10^{-9}\text{ F} = 10^{-7}\text{ F}$，指数相加 $4 + (-7) = -3$。`,
                },
                { text: '1.0 s', correct: false, feedback: '那是 100 μF 时的结果，我们面包板上插的是 100 nF（104 薄膜电容），差了 1000 倍！' },
              ],
              board: [R`RC = 1.0\,\text{ms}, \quad -\frac{1}{RC} = -1000\,\text{s}^{-1} = -1.0\,\text{ms}^{-1}`],
              halo: ['rc', 'r_in', 'c_fb'],
            },
            {
              title: 'Step 2 · 求第一段（0 ~ 2 ms）输出斜率与终点电压',
              mini_svg: MINI_2,
              question: R`在 $0 \le t < 2\text{ ms}$ 期间，输入恒定为 $v_i = +3.0\text{ V}$，初始输出 $v_o(0) = 0\text{ V}$。请问这段时间内输出的斜率和 $t = 2\text{ ms}$ 时的终点电压 $v_o(2\text{ ms})$ 分别是多少？`,
              hint: R`$\frac{dv_o}{dt} = -\frac{v_i}{RC} = -\frac{+3.0\,\text{V}}{1.0\,\text{ms}}, \quad v_o(2\,\text{ms}) = v_o(0) + k_1 \cdot \Delta t$`,
              options: [
                { text: '斜率 +3.0 V/ms，终点 +6.0 V', correct: false, feedback: '丢掉了积分器最关键的负号！输入接在反相端，正输入必产生负斜率。' },
                { text: '斜率 −3.0 V/ms，终点 −3.0 V', correct: false, feedback: '斜率算对了（−3.0 V/ms），但注意第一段持续的时间是 2.0 ms，不是 1.0 ms！' },
                {
                  text: '斜率 −3.0 V/ms，终点 −6.0 V',
                  correct: true,
                  feedback: R`漂亮！$k_1 = -3.0\text{ V/ms}$，持续 2.0 ms，从 0 V 一路滑到 $-6.0\text{ V}$。看左侧示波器：CH2 的第一段已经画出来了。`,
                },
                { text: '斜率 −1.5 V/ms，终点 −3.0 V', correct: false, feedback: R`斜率公式是 $-v_i / (RC)$，不需要除以持续时间 2 ms。` },
              ],
              board: [R`0 \le t < 2\,\text{ms}:\quad k_1 = -3.0\,\text{V/ms},\quad v_o(2\,\text{ms}) = -6.0\,\text{V}`],
              halo: ['ch1', 'slope'],
              params: ex(1),
              layer: L2,
            },
            {
              title: 'Step 3 · 求第二段（2 ~ 4 ms）终点电压与输出峰峰值',
              mini_svg: MINI_3,
              question: R`进入 $2 \le t \le 4\text{ ms}$ 后，输入翻转为 $v_i = -3.0\text{ V}$。因为电容电压不能突变，第二段从 $v_o(2\text{ ms}) = -6.0\text{ V}$ 出发。请问 $t = 4\text{ ms}$ 时的输出电压和整周期峰峰值 $V_{pp}$ 分别是多少？`,
              hint: R`$v_o(4\,\text{ms}) = v_o(2\,\text{ms}) + \left(-\frac{-3.0\,\text{V}}{1.0\,\text{ms}}\right)(2.0\,\text{ms})$`,
              options: [
                {
                  text: R`$v_o(4\text{ ms}) = 0\text{ V}$，$V_{pp} = 6.0\text{ V}$`,
                  correct: true,
                  feedback: R`完全正确！$-6.0\text{ V} + (+3.0\text{ V/ms})(2.0\text{ ms}) = 0\text{ V}$，输出在 0 V 与 $-6.0\text{ V}$ 之间往复，$V_{pp} = 6.0\text{ V}$。`,
                },
                {
                  text: R`$v_o(4\text{ ms}) = +6.0\text{ V}$，$V_{pp} = 12.0\text{ V}$`,
                  correct: false,
                  feedback: R`第二段是从 $-6.0\text{ V}$ 出发，加上 $(+3.0\text{ V/ms}) \times 2.0\text{ ms} = +6.0\text{ V}$，正好回到 0 V，不是 $+6.0\text{ V}$！`,
                },
                {
                  text: R`$v_o(4\text{ ms}) = -12.0\text{ V}$，$V_{pp} = 12.0\text{ V}$`,
                  correct: false,
                  feedback: '负输入经过反相积分器产生正斜率（+3.0 V/ms），输出会向上爬升而不是继续下降。',
                },
                { text: R`$v_o(4\text{ ms}) = 0\text{ V}$，$V_{pp} = 3.0\text{ V}$`, correct: false, feedback: '峰峰值是最高点（0 V）减去最低点（−6.0 V），结果应该是 6.0 V。' },
              ],
              board: [R`2 \le t \le 4\,\text{ms}:\quad k_2 = +3.0\,\text{V/ms},`, R`v_o(4\,\text{ms}) = 0\,\text{V},\quad V_{pp,\text{out}} = 6.0\,\text{V}`],
              halo: ['ch2', 'vo'],
              params: ex(2),
              layer: L2,
            },
            {
              title: 'Step 4 · 电源轨饱和校验与极限预警',
              mini_svg: MINI_4,
              question: R`已知 LM358 在 $\pm 9\text{ V}$ 双电源下的线性安全上限为 $\pm 7.5\text{ V}$。请问刚才的 $\pm 3\text{ V}$ 方波输入是否安全？若把输入幅值加大到 $\pm 5\text{ V}$（频率不变），会发生什么？`,
              hint: R`$\Delta v_{o,5\text{V}} = -\frac{5.0\,\text{V}}{1.0\,\text{ms}} \times 2.0\,\text{ms} = -10.0\,\text{V} < -7.5\,\text{V}$`,
              options: [
                {
                  text: R`$\pm 3\text{ V}$ 不饱和；$\pm 5\text{ V}$ 也不饱和`,
                  correct: false,
                  feedback: R`再算一下 $\pm 5\text{ V}$ 在 2 ms 内的积分增量：$(-5\text{ V/ms}) \times 2\text{ ms} = -10\text{ V}$，早就超过 $-9\text{ V}$ 电源轨啦！`,
                },
                {
                  text: R`$\pm 3\text{ V}$ 不饱和；$\pm 5\text{ V}$ 理论达 $-10\text{ V}$，撞负轨削顶`,
                  correct: true,
                  feedback: R`满分！谷值 $-6.0\text{ V}$ 安全；$\pm 5\text{ V}$ 时理论谷值 $-10\text{ V}$，LM358 的输出到不了，在约 $-8.9\text{ V}$ 被削平。左侧示波器换成了 $\pm 5\text{ V}$：看 CLIPPING 灯。`,
                },
                {
                  text: R`$\pm 3\text{ V}$ 已经饱和；$\pm 5\text{ V}$ 烧毁电容`,
                  correct: false,
                  feedback: R`谷值 $-6.0\text{ V}$ 的绝对值小于 $7.5\text{ V}$，在 $\pm 9\text{ V}$ 供电下完全不会饱和。`,
                },
                { text: '两者都会在正电源轨饱和', correct: false, feedback: '初始值 0 V 且第一段为正输入，输出向下摆动，先撞上的是负电源轨。' },
              ],
              board: [R`|v_o|_{\max}=6.0\,\text{V}<7.5\,\text{V}\,(\text{安全});`, R`V_i=\pm 5\,\text{V} \Rightarrow v_{o,\text{ideal}}=-10\,\text{V}\,(\text{负轨削顶})`],
              halo: ['sat'],
              params: ex(3),
              layer: L2,
            },
            {
              title: R`Step 5 · 实操防翻车：为 250 Hz 积分器选配并联电阻 $R_f$`,
              mini_svg: MINI_5,
              question: R`为防止 LM358 的 3 mV 直流失调导致积分器上电 2.5 秒就撞轨，必须在 100 nF 电容两端并联反馈电阻 $R_f$，且需满足 $f_{\text{signal}} \ge 10 f_c$（这里 $f_{\text{signal}} = 250\text{ Hz}$）。选以下哪颗标准电阻最合适？`,
              hint: R`$f_c = \frac{1}{2\pi R_f C} \le \frac{250\,\text{Hz}}{10} = 25\,\text{Hz} \implies R_f \ge \frac{1}{2\pi (25)(100\times 10^{-9})} \approx 63.7\,\text{k}\Omega$`,
              options: [
                {
                  text: R`$R_f = 1\text{ k}\Omega$（$f_c \approx 1592\text{ Hz}$）`,
                  correct: false,
                  feedback: '1 kΩ 的转折频率高达 1.59 kHz，250 Hz 信号几乎全走电阻不走电容，变成普通放大器了！',
                },
                {
                  text: R`$R_f = 10\text{ k}\Omega$（$f_c \approx 159\text{ Hz}$）`,
                  correct: false,
                  feedback: R`10 kΩ 对应的 $f_c = 159\text{ Hz}$，250 Hz 只比 $f_c$ 高一点点，积分波形会严重弯曲成指数曲线。`,
                },
                {
                  text: R`$R_f = 100\text{ k}\Omega$（$f_c \approx 15.9\text{ Hz}$）`,
                  correct: true,
                  feedback: R`就是它！$f_c \approx 15.9\text{ Hz} < 25\text{ Hz}$，250 Hz 是 $f_c$ 的 15.7 倍，积分几乎不受影响；直流失调只剩 $11 \times 3\text{ mV} = 33\text{ mV}$。`,
                },
                { text: R`不并联任何电阻（$R_f = \infty$）`, correct: false, feedback: '不并 R_f 的话，3 mV 失调电压会在 2.5 秒内把运放彻底顶死在电源轨上！' },
              ],
              board: [R`R_f = 100\,\text{k}\Omega \Rightarrow f_c \approx 15.92\,\text{Hz} < 25\,\text{Hz},`, R`V_{o,\text{DC}} = 11\times 3\,\text{mV} = 33\,\text{mV}`],
              halo: ['rf', 'vos'],
              params: ex(4, 5),
              layer: L2,
            },
          ],
          conclusion: R`五步通关：$RC = 1.0\text{ ms}$；第一段 $k_1 = -3.0\text{ V/ms}$、$v_o(2\text{ ms}) = -6.0\text{ V}$；第二段 $k_2 = +3.0\text{ V/ms}$、$v_o(4\text{ ms}) = 0\text{ V}$，$V_{pp} = 6.0\text{ V}$，不饱和；$\pm 5\text{ V}$ 时理论谷值 $-10\text{ V}$，撞负轨削平；并联 $R_f = 100\text{ k}\Omega$（$f_c \approx 15.92\text{ Hz}$）防漂移。左侧示波器的读数已经全部揭晓。下面的通关复盘把这道题的板书完整写一遍。`,
        },
        { kind: 'p', text: '**通关复盘 · 方波积分器逐段波形与饱和校验 ③**' },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '已知', text: R`已知 $RC = (10 \times 10^3\text{ }\Omega)(100 \times 10^{-9}\text{ F}) = 1.0\text{ ms}$。` },
            {
              label: R`1. **第一段（$0 \le t < 2.0\text{ ms}$，$V_1 = +3.0\text{ V}$）**`,
              text: R`斜率：$k_1 = -\frac{+3.0\text{ V}}{1.0\text{ ms}} = -3.0\text{ V/ms} = -3000\text{ V/s}$；表达式：$v_o(t) = 0 - 3000t\text{ V}$（若 $t$ 以 $\text{ms}$ 计，则 $v_o(t) = -3t\text{ V}$）；终点值：`,
              tex: R`v_o(2.0\text{ ms}) = 0 + (-3.0\text{ V/ms}) \times 2.0\text{ ms} = -6.0\text{ V}`,
            },
            {
              label: R`2. **第二段（$2.0\text{ ms} \le t \le 4.0\text{ ms}$，$V_2 = -3.0\text{ V}$）**`,
              text: R`斜率：$k_2 = -\frac{-3.0\text{ V}}{1.0\text{ ms}} = +3.0\text{ V/ms} = +3000\text{ V/s}$；表达式：$v_o(t) = -6.0 + 3000(t - 0.002)\text{ V}$（若 $t$ 以 $\text{ms}$ 计，则 $v_o(t) = -6.0 + 3(t - 2)\text{ V}$）；终点值：`,
              tex: R`v_o(4.0\text{ ms}) = -6.0\text{ V} + (+3.0\text{ V/ms}) \times 2.0\text{ ms} = 0\text{ V}`,
            },
            {
              label: '3. **峰峰值与饱和校验**',
              text: R`输出在 $0\text{ V}$ 与 $-6.0\text{ V}$ 之间往复摆动，峰峰值 $V_{pp,\text{out}} = 0 - (-6.0) = 6.0\text{ V}$。最大绝对值 $|v_o|_{\max} = 6.0\text{ V} < 7.5\text{ V}$，**未发生饱和**，波形完整无失真。`,
            },
            {
              label: R`4. **若输入幅值增至 $\pm 5.0\text{ V}$ 的饱和分析**`,
              text: R`第一段理论斜率为 $-5.0\text{ V/ms}$，理论终点值 $v_{o,\text{ideal}}(2.0\text{ ms}) = -10.0\text{ V}$。由于 LM358 负电源轨为 $-9\text{ V}$（保守线性上限 $-7.5\text{ V}$，极限负摆幅轻载约 $-8.9\text{ V}$），输出在 $t \approx 1.5\text{ ms}$（达 $-7.5\text{ V}$）至 $1.78\text{ ms}$（达 $-8.9\text{ V}$）时便会**[[sat|撞上负电源轨并被硬削平（Clipping）]]**，失去三角波的尖底！（此时输出还要灌入 $i_R = 5\text{ V} / 10\text{ k}\Omega = 0.5\text{ mA}$，实际负摆幅比轻载时略高，削平只会更早出现。）`,
            },
          ],
        },
        { kind: 'figure', svg: SVG_REVIEW, caption: '通关复盘：CH1 ±3 V 方波与 CH2 输出（0 V → −6.0 V → 0 V）' },
      ],
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '工程防翻车（一）——为什么理想积分器一上电就“撞墙”？',
      sync: { layer: L2, halo: ['vos', 'sat'], params: scope({ wave: 'gnd', vos: true }) },
      blocks: [
        { kind: 'p', text: '**3.1 强回链 W3-L1：3 mV 失调电压引发的“2.5 秒死亡倒计时”**' },
        {
          kind: 'p',
          text: R`如果你照着第一幕的理想电路图直接插上面包板，哪怕把输入端直接接地（$v_i = 0$），上电 3 秒后拿万用表量输出端——你会惊恐地发现输出不是 $0\text{ V}$，而是死死卡在 [[sat|$+7.5\text{ V}$ 或 $-8.9\text{ V}$]] 一动不动！`,
        },
        {
          kind: 'p',
          text: R`**凶手就是你在 ${code('W3-L1')} 见过的老熟人：[[vos|运放输入失调电压 $V_{OS}$]]**（LM358 典型值约 $3\text{ mV}$）。对直流信号来说，电容 $C$ 相当于**开路**（阻抗 $X_C = \frac{1}{2\pi f C} \to \infty$），反馈回路彻底断开，运放把这微小的 $3\text{ mV}$ 直流误差不断积分，一路狂奔直到撞上电源轨！`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. 直流失调电压 $V_{OS}$ 等效串联在同相端，对反相积分器产生恒定失调漂移率。　2. 在电容 $C$ 两端[[rf|并联一颗大电阻 $R_f$]] 后，构成**有损积分器（Lossy / Practical Integrator）**：对直流（$f = 0$）：电容开路，电路退化为反馈电阻为 $R_f$ 的反相放大器，对 $V_{OS}$ 的直流噪声增益被死死锁在 $1 + \frac{R_f}{R}$。对交流信号：当信号频率远高于[[fc|转折频率 $f_c = \frac{1}{2\pi R_f C}$]] 时，电容容抗 $X_C \ll R_f$，大部分电流依然走电容，积分功能几乎不受影响。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式：理想积分器直流漂移率与撞轨时间：',
          tex: R`\left|\frac{dv_o}{dt}\right|_{\text{drift}} = \frac{V_{OS}}{RC}, \qquad t_{\text{sat}} = \frac{V_{\text{sat}}}{\left|dv_o/dt\right|_{\text{drift}}} = \frac{V_{\text{sat}}\cdot RC}{V_{OS}}`,
        },
        {
          kind: 'formula',
          title: R`有损积分器（并联 $R_f$）的直流输出失调上限与转折频率：`,
          tex: R`V_{o,\text{DC}} = \left(1 + \frac{R_f}{R}\right) V_{OS}, \qquad f_c = \frac{1}{2\pi R_f C}`,
        },
        { kind: 'p', text: R`工程黄金法则：确保目标信号频率满足 $f_{\text{signal}} \ge 10 f_c$。` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '已知',
              text: R`取 $R = 10\text{ k}\Omega$，$C = 100\text{ nF}$（$RC = 1.0\text{ ms}$），LM358 失调 $V_{OS} = 3\text{ mV}$，正饱和上限 $V_{\text{sat}} = 7.5\text{ V}$：`,
            },
            {
              label: R`1. **理想积分器（无 $R_f$）翻车计算**`,
              tex: R`\begin{gathered} \left|\frac{dv_o}{dt}\right|_{\text{drift}} = \frac{3 \times 10^{-3}\text{ V}}{1.0 \times 10^{-3}\text{ s}} = 3.0\text{ V/s} \\[6pt] t_{\text{sat}} = \frac{7.5\text{ V}}{3.0\text{ V/s}} = 2.5\text{ s} \end{gathered}`,
            },
            { label: '结论', text: '（仅需 **2.5 秒**，输出就彻底撞轨锁死！）' },
            {
              label: R`2. **并联 [[rf|$R_f = 100\text{ k}\Omega$]] 后的工程挽救**`,
              text: '直流输出失调被钳制在：',
              tex: R`V_{o,\text{DC}} = \left(1 + \frac{100\text{ k}\Omega}{10\text{ k}\Omega}\right) \times 3\text{ mV} = 11 \times 3\text{ mV} = 33\text{ mV} = 0.033\text{ V}`,
            },
            { label: '对比', text: R`（从撞轨 $7.5\text{ V}$ 骤降到几乎可忽略的 $33\text{ mV}$！）` },
            {
              label: '转折频率',
              tex: R`f_c = \frac{1}{2\pi \times (100 \times 10^3\text{ }\Omega) \times (100 \times 10^{-9}\text{ F})} = \frac{1}{0.06283\text{ s}} \approx 15.92\text{ Hz}`,
            },
            { label: '校验', text: R`校验实验频率 $f = 500\text{ Hz}$：$\frac{f}{f_c} = \frac{500}{15.92} \approx 31.4 \gg 10$，完美兼顾“不漂移”与“真积分”！` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`（若需对 $50\text{ Hz}$ 左右的极低频信号积分，可选 $R_f = 1\text{ M}\Omega$，此时 $f_c \approx 1.59\text{ Hz}$，直流输出失调为 $101 \times 3\text{ mV} = 303\text{ mV}$，依然完全安全。）`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**左侧舞台 02 层**：输入接地、[[vos|失调 $V_{OS} = 3\text{ mV}$]] 打开，下方的慢扫描从上电开始计时——理想积分器的直流电平以 $3\text{ V/s}$ 爬升，$2.5\text{ s}$ 撞上 [[sat|$+7.5\text{ V}$]]；切到「有损积分器 $+R_f$」，它稳稳停在 $33\text{ mV}$。再把输入换回方波看看：没有 $R_f$ 时，三角波会一路漂上去，顶端贴着 $+7.5\text{ V}$ 被削平。`,
        },
      ],
      inline_svg: SHEET_ACT3,
      figure_caption: '图 3-1：实际改进型有损积分器电路图与直流漂移对比图',
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: R`把 $R$ 和 $C$ 调换位置——运放微分器与三角波变方波`,
      sync: { layer: L1, halo: ['c_in', 'r_fb'], params: scope({ mode: 'diff', wave: 'tri' }) },
      blocks: [
        { kind: 'p', text: '**4.1 逆向魔法：当电容挪到输入端**' },
        { kind: 'p', text: R`既然把 $C$ 放在反馈端可以实现“积分（方波 → 三角波）”，那如果我们把输入端的 $R$ 和反馈端的 $C$ **彻底对调**呢？` },
        {
          kind: 'ul',
          items: [
            R`输入支路变成[[c_in|电容 $C$]]：输入电压 $v_i(t)$ 变化得越快，电容充放电电流 [[i_c|$i_C = C\frac{dv_i}{dt}$]] 就越大！`,
            R`反馈支路变回[[r_fb|电阻 $R$]]：这股正比于“输入斜率”的电流全部流过电阻 $R$，瞬间在输出端形成压降 $v_o = -R i_C$。`,
          ],
        },
        { kind: 'p', text: '结果就是：**运放微分器（Op-Amp Differentiator）**——专门检测信号变化斜率（边缘）的模拟微分机！' },
        { kind: 'p', text: '**4.2 教授板书：理想运放微分器的三段式推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. **虚短与虚断**：[[vn|$v_- = v_+ = 0$]]，$i_- = 0$。　2. **虚地节点 KCL**：$i_C(t) = i_R(t)$。　3. **元件伏安关系**：输入电容微分律（${code('W4-L1')}）：$i_C(t) = C\frac{d(v_i - v_-)}{dt}$；反馈电阻欧姆定律：$i_R(t) = \frac{v_- - v_o(t)}{R}$`,
        },
        { kind: 'formula', title: R`② 纯符号通式：将 $v_- = 0$ 代入并令 $i_C(t) = i_R(t)$：`, tex: R`C\frac{dv_i(t)}{dt} = -\frac{v_o(t)}{R}` },
        { kind: 'formula', title: '整理得到**运放微分器时域通式**：', tex: R`v_o(t) = -RC\frac{dv_i(t)}{dt}` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（500 Hz 三角波 → 倒相方波）',
          steps: [
            {
              label: '已知',
              text: R`沿用相同的标准元件：$C = 100\text{ nF}$，$R = 10\text{ k}\Omega \implies RC = 1.0\text{ ms}$。输入端接入 $f = 500\text{ Hz}$（$T = 2.0\text{ ms}$，$T/2 = 1.0\text{ ms}$）、峰值为 $\pm 2.0\text{ V}$（$V_{pp,\text{in}} = 4.0\text{ V}$）的对称三角波：`,
            },
            {
              label: R`1. **上升沿（$0 \le t < 1.0\text{ ms}$）**：$v_i(t)$ 从 $-2.0\text{ V}$ 线性升至 $+2.0\text{ V}$：`,
              tex: R`\begin{gathered} \frac{dv_i}{dt} = \frac{+2.0\text{ V} - (-2.0\text{ V})}{1.0\text{ ms}} = +4.0\text{ V/ms} = +4000\text{ V/s} \\[6pt] v_o(t) = -(1.0 \times 10^{-3}\text{ s}) \times (+4000\text{ V/s}) = -4.0\text{ V} \end{gathered}`,
            },
            {
              label: R`2. **下降沿（$1.0\text{ ms} \le t < 2.0\text{ ms}$）**：$v_i(t)$ 从 $+2.0\text{ V}$ 线性降至 $-2.0\text{ V}$：`,
              tex: R`\begin{gathered} \frac{dv_i}{dt} = \frac{-2.0\text{ V} - (+2.0\text{ V})}{1.0\text{ ms}} = -4.0\text{ V/ms} = -4000\text{ V/s} \\[6pt] v_o(t) = -(1.0 \times 10^{-3}\text{ s}) \times (-4000\text{ V/s}) = +4.0\text{ V} \end{gathered}`,
            },
            {
              label: '3. **输出特征与饱和校验**',
              text: R`输出为 [[ch2|$\pm 4.0\text{ V}$（峰峰值 $V_{pp,\text{out}} = 8.0\text{ V}$）的**倒相方波**]]；由于 [[sat|$|v_o|_{\max} = 4.0\text{ V} < 7.5\text{ V}$]]，运放工作在线性区，波形边缘利落！`,
            },
          ],
        },
      ],
      inline_svg: SHEET_ACT4,
      figure_caption: '图 4-1：运放微分器原理图与三角波变方波波形图',
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '工程防翻车（二）——高频毛刺放大器与实用抗噪微分器',
      sync: { layer: L2, halo: ['noise', 'rs'], params: scope({ mode: 'diff', wave: 'tri', glitch: true }) },
      blocks: [
        { kind: 'p', text: '**5.1 为什么硬件工程师最怕理想微分器？**' },
        {
          kind: 'p',
          text: R`在真实实验室里，信号线上总会混入微弱的高频开关噪声或电磁干扰（比如[[noise|幅值只有 $50\text{ mV}$、频率 $f_n = 50\text{ kHz}$ 的微小毛刺]]）。普通放大器几乎看不见它，但**理想微分器却像打了鸡血一样把它放大几百倍**！`,
        },
        {
          kind: 'p',
          text: R`原因非常简单：高频噪声虽然“个子矮”，但它的**斜率极其陡峭**（$\frac{d}{dt}\sin(2\pi f t) = 2\pi f \cos(2\pi f t)$），频率越高，斜率越大，理想微分器的增益 $|A(f)| = 2\pi f RC$ 会随频率线性飙升到无穷大，不仅把有用信号彻底淹没在毛刺里，还会诱发运放高频自激振荡！`,
        },
        { kind: 'p', text: R`**5.2 教授板书：高频噪声灾难与串联 $R_s$ 限幅的三段式推导**` },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. 正弦高频干扰 $v_{\text{noise}}(t) = V_n \sin(2\pi f_n t)$ 的最大斜率为 $2\pi f_n V_n$。　2. **工程改造方案**：在输入电容 $C$ 之前[[rs|**串联一颗小电阻 $R_s$**]]（构成**实用抗噪微分器**）。当频率很高时，电容容抗 $X_C \to 0$，电路自动退化为普通反相放大器，高频增益被死死封顶在 $\frac{R}{R_s}$！`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式：理想微分器在频率 $f$ 处的增益与输出噪声幅值：',
          tex: R`|A_{\text{ideal}}(f)| = 2\pi f RC, \qquad V_{o,\text{noise,ideal}} = 2\pi f_n RC \cdot V_n`,
        },
        {
          kind: 'formula',
          title: R`串联 $R_s$ 后的实用微分器[[fc|转折频率]]、高频增益上限与精确幅频响应：`,
          tex: R`\begin{gathered} f_b = \frac{1}{2\pi R_s C}, \qquad |A_{\max}| = \frac{R}{R_s}, \\[6pt] |A_{\text{prac}}(f)| = \frac{2\pi f RC}{\sqrt{1 + (2\pi f R_s C)^2}} \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '已知',
              text: R`取 $R = 10\text{ k}\Omega$，$C = 100\text{ nF}$（$RC = 1.0\text{ ms}$），假设输入混入 $V_n = 50\text{ mV}$、$f_n = 50\text{ kHz}$ 的高频毛刺：`,
            },
            {
              label: R`1. **理想微分器（无 $R_s$）炸屏计算**`,
              tex: R`\begin{gathered} |A_{\text{ideal}}(50\text{ kHz})| = 2\pi \times (50 \times 10^3\text{ Hz}) \times (1.0 \times 10^{-3}\text{ s}) \approx 314.16 \\[6pt] V_{o,\text{noise,ideal}} = 314.16 \times 0.05\text{ V} \approx 15.71\text{ V} \end{gathered}`,
            },
            { label: '结论', text: R`（区区 $50\text{ mV}$ 毛刺，输出竟然飙到 **$15.71\text{ V}$**，瞬间把 $\pm 9\text{ V}$ 电源轨干穿！）` },
            {
              label: R`2. **输入串联 [[rs|$R_s = 1.0\text{ k}\Omega$]] 后的工程封顶**：高频增益天花板`,
              tex: R`|A_{\max}| = \frac{R}{R_s} = \frac{10\text{ k}\Omega}{1.0\text{ k}\Omega} = 10.0`,
            },
            {
              label: '限幅转折频率',
              tex: R`f_b = \frac{1}{2\pi \times (1.0 \times 10^3\text{ }\Omega) \times (100 \times 10^{-9}\text{ F})} \approx 1591.55\text{ Hz} \approx 1.59\text{ kHz}`,
            },
            {
              label: R`在 $50\text{ kHz}$ 处的实际噪声输出`,
              tex: R`|A_{\text{prac}}(50\text{ kHz})| = \frac{314.16}{\sqrt{1 + (31.416)^2}} \approx 9.995 \implies V_{o,\text{noise,prac}} \approx 9.995 \times 0.05\text{ V} \approx 0.50\text{ V}`,
            },
            {
              label: '目标信号',
              text: R`而在目标信号 $500\text{ Hz}$ 处：$|A_{\text{ideal}}(500\text{ Hz})| \approx 3.142$，$|A_{\text{prac}}(500\text{ Hz})| \approx 2.997$，仅衰减约 $4.6\%$，完美保留了微分能力，同时将高频毛刺压制了 **31 倍以上**！`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**左侧舞台 02 层**：[[noise|50 kHz 毛刺]]已经打开。理想微分器的 CH2 被毛刺带撑满两条电源轨；切到「实用微分器 $+R_s$」，毛刺带缩成约 $\pm 0.5\text{ V}$ 的细边，三角波变出的方波重新清晰（边沿因 $R_sC = 0.1\text{ ms}$ 略带圆角）。`,
        },
      ],
      inline_svg: SHEET_ACT5,
      figure_caption: '图 5-1：实用抗噪微分器电路图与高频增益限幅 Bode 对比图',
    },
    /* ---------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '3D 面包板实操工坊——LM358 ±9V 双电源搭接与探头测量',
      sync: { layer: L3, halo: ['chip_lm358', 'psu'], params: bench() },
      blocks: [
        {
          kind: 'note',
          tone: 'warn',
          text: R`**面包板安全与元件标定**：供电用 [[psu|${SUPPLY}]]——两路 $9\text{ V}$ 输出串联，中点 COM 作为参考地 (GND)，红 / 黑 / 蓝三根导线分别接 [[rail_p9|$+9\text{ V}$]] / [[rail_gnd|GND]] / [[rail_m9|$-9\text{ V}$]] 轨，严禁反接 V+ (Pin 8) 与 V- (Pin 4)。电容必须选用无极性薄膜或陶瓷电容 (100 nF)，严禁使用有极性电解电容承受正负交替电压。[[ch1,ch2|示波器 CH1 与 CH2 探头接地夹]]必须共同夹在双电源中心地 (GND) 上，严禁误夹 $-9\text{ V}$ 轨造成短路。先确认电源与接地无误再开启[[fgen|函数信号发生器]]，防止输入端超过运放电源轨导致 ESD 保护二极管烧毁。元件：$R = 10\text{ k}\Omega$（1/4 W，1% 金属膜）、$C = 100\text{ nF}$（104）、$RC = 1.0\text{ ms}$，$R_f = 100\text{ k}\Omega$（低频可选 $1\text{ M}\Omega$），$R_s = 1\text{ k}\Omega$（$|A_{\max}| = 10$）；信号源 500 Hz、$\pm 2.0\text{ V}$（$4.0\text{ V}_{pp}$）、直流偏置 $0\text{ V}$。各支路电流只有零点几毫安，远低于 1/4 W 电阻的额定功耗，无需阻抗缩放。`,
        },
        { kind: 'p', text: '**6.1 器件清单与 LM358 引脚地图**' },
        { kind: 'p', text: R`现在切换到左侧舞台第 3 层 ${code('03 3D LM358 ±9V 双电源面包板')}，让我们亲手把理论变成示波器上跳动的真实波形！` },
        {
          kind: 'table',
          head: ['器件 / 仪器', '规格与标称值', '面包板接法要点'],
          rows: [
            [
              '**[[chip_lm358|运算放大器]]**',
              'LM358（8-Pin DIP）',
              '跨接面包板[[center_trench|中央凹槽]]，缺口朝左；**[[chip_lm358_p8|Pin 8]] 接 +9V**，**[[chip_lm358_p4|Pin 4]] 接 -9V**',
            ],
            [
              '**[[psu|双电源供电]]**',
              SUPPLY,
              '两路 9 V 输出串联：第 1 路的负极与第 2 路的正极相连作中点 COM，即 **[[rail_gnd|GND（0V 参考地）]]**；红线（+）接 +9 V 红轨，黑线（COM）接 GND 轨，蓝线（−）接 −9 V 蓝轨',
            ],
            [
              '**积分器套件**',
              R`[[r_in|$R=10\text{ k}\Omega$]]，[[c_fb|$C=100\text{ nF}$]]，[[rf|$R_f=100\text{ k}\Omega$]]`,
              R`$R$ 接输入到 [[chip_lm358_p2|Pin 2]]；$C$ 与 $R_f$ 并联跨接在 Pin 2 与 [[chip_lm358_p1|Pin 1]] 之间；[[chip_lm358_p3|Pin 3]] 直接接 GND`,
            ],
            [
              '**微分器套件**',
              R`[[rs|$R_s=1\text{ k}\Omega$]]，[[c_in|$C=100\text{ nF}$]]，[[r_fb|$R=10\text{ k}\Omega$]]`,
              R`$R_s$ 与 $C$ 串联接输入到 Pin 2；$R$ 跨接在 Pin 2 与 Pin 1 之间；Pin 3 直接接 GND`,
            ],
            ['**[[scope,fgen|示波器与信号源]]**', '500 Hz ±2V 方波/三角波', '信号源红夹接输入节点，**[[ch1|CH1 探头]]接输入节点，[[ch2|CH2 探头]]接 Pin 1**，所有黑夹共接 GND'],
          ],
        },
        { kind: 'figure', svg: SHEET_ACT6, caption: `图 6-1：LM358 双电源面包板接线俯视图与示波器探头连接示意（${SUPPLY}供电）` },
        { kind: 'p', text: '**6.2 面包板常见 3 大翻车现场与排错指南**' },
        {
          kind: 'ol',
          items: [
            R`**示波器 CH2 是一条死在 $+7.5\text{ V}$ 或 $-8.9\text{ V}$ 的水平直线**：忘了并联 [[rf|$100\text{ k}\Omega$ 反馈电阻 $R_f$]]，或者信号源带有较大的直流偏置（DC Offset），导致积分器饱和。`,
            R`**输出三角波顶部或底部被“削成平头”**：输入频率设得太低（例如误设为 $50\text{ Hz}$）或输入幅值过大，使单半周期积分增量 $|\Delta v_o| = \frac{V_i}{2 f RC}$ 超过了 $\pm 7.5\text{ V}$。调高频率至 $500\text{ Hz}$ 即可恢复尖角。`,
            R`**微分器输出方波上有密集毛刺或高频抖动**：漏接了[[rs|输入串联电阻 $R_s = 1\text{ k}\Omega$]]，或长飞线引入了空间电磁干扰。补上 $R_s$ 并剪短电容引脚即可立竿见影。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 03 层动手复现：「拔掉 $R_f$」后关掉信号源输出，CH2 在约 $2.5\text{ s}$ 内爬到 $+7.5\text{ V}$ 变成一条直线（信号源开着时，三角波一路漂上去、顶端贴着 $+7.5\text{ V}$ 被削平）；把频率拖到 $50\text{ Hz}$ 看平头；切到「实用微分器」，打开「长飞线毛刺」再「拔掉 $R_s$」，看毛刺带撑满屏幕。`,
        },
        {
          kind: 'table',
          caption: '左侧 03 层的逐孔接线（830 孔面包板：a–e、f–j 同列竖通，e 与 f 之间是中央凹槽；LM358 缺口朝左，Pin 1 / Pin 8 在第 28 列）',
          head: ['元件 / 导线', '起点', '终点', '作用'],
          rows: [
            [
              '[[psu|台式可调直流电源（±9 V）]]',
              '+ / COM / − 端子',
              '[[rail_p9|顶部 + 轨]] / [[rail_gnd|顶部 − 轨与底部 + 轨]] / [[rail_m9|底部 − 轨]]',
              R`$+9\text{ V}$ / GND / $-9\text{ V}$（红 / 黑 / 蓝线）`,
            ],
            ['红色跳线', '顶部 + 轨第 27 列', '[[chip_lm358_p8|a28（Pin 8）]]', R`$V_+ = +9\text{ V}$`],
            ['蓝色跳线', '[[chip_lm358_p4|j31（Pin 4）]]', '底部 − 轨第 33 列', R`$V_- = -9\text{ V}$`],
            ['黑色跳线', '[[chip_lm358_p3|j30（Pin 3）]]', '底部 + 轨（GND）第 30 列', '[[gnd|同相端接地]]'],
            ['橙色跳线', '[[chip_lm358_p2|g29（Pin 2）]]', 'g24', '[[vn|虚地节点 v−]] 引到第 24 列'],
            ['**积分器**：[[r_in|R 10 kΩ（棕-黑-橙-金）]]', 'h18（输入节点）', 'h24', '输入电阻'],
            ['[[c_fb|C 100 nF（104）]]', 'i24', '[[chip_lm358_p1|i28（Pin 1）]]', '反馈电容'],
            ['[[rf|R_f 100 kΩ（棕-黑-黄-金）]]', 'j24', 'j28（Pin 1）', '与 C 并联，防漂移'],
            ['**微分器**：[[rs|R_s 1 kΩ（棕-黑-红-金）]]', 'h18', 'h21', '限制高频增益'],
            ['[[c_in|C 100 nF（104）]]', 'i21（拔掉 R_s 时 i18）', 'i24', '输入电容'],
            ['[[r_fb|R 10 kΩ（棕-黑-橙-金）]]', 'j24', 'j28（Pin 1）', '反馈电阻'],
            ['[[fgen|函数信号发生器]]', '红夹 / 黑夹', '[[vi|j18（输入节点）]] / 顶部 − 轨（GND）', '500 Hz ±2 V 方波或三角波'],
            ['[[scope|双通道示波器]]', '[[ch1|CH1 探头]] / [[ch2|CH2 探头]]', 'g18 / [[vo|g28（Pin 1）]]', '两个地夹都接顶部 − 轨（GND）'],
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 7: the diagnostic quiz */
    {
      act_index: 7,
      badge: '诊断测验',
      title: 'W4-L3 运放积分器与微分器核心诊断测验',
      sync: { layer: L1, halo: [], params: scope() },
      blocks: [
        {
          kind: 'p',
          text: '以下 4 道诊断题覆盖本课的核心概念：积分器斜率与极性、有损积分器为什么要并联 R_f、微分器把斜坡变成电平、实用微分器的高频增益封顶。四题全部答对即通关本课。',
        },
      ],
      inline_svg: SVG_QUIZ_ACT,
      figure_caption: '诊断测验的四个核心概念',
      quiz: [
        {
          id: 'w4l3_q1',
          question: R`某理想运放积分器参数为 $R = 20\text{ k}\Omega$，$C = 50\text{ nF}$。若在某时间段内输入恒定直流电压 $v_i = -4.0\text{ V}$，则输出电压 $v_o(t)$ 的变化斜率 $dv_o/dt$ 为多少？`,
          options: [
            {
              key: 'A',
              text: '−4.0 V/ms',
              correct: false,
              feedback: R`$RC = (20\text{ k}\Omega)(50\text{ nF}) = 1.0\text{ ms}$ 算对了，但丢了反相积分器的负号：斜率是 $-v_i/(RC)$，输入本身为负（$-4.0\text{ V}$），两个负号相乘，输出是向上的斜坡。`,
            },
            {
              key: 'B',
              text: '−2.0 V/ms',
              correct: false,
              feedback: R`数值和符号都偏了：$(20 \times 10^3\,\Omega)(50 \times 10^{-9}\,\text{F}) = 1.0 \times 10^{-3}\text{ s}$，不是 2 ms；而且负输入经过反相积分器产生的是正斜率。`,
            },
            { key: 'C', text: '+4.0 V/ms', correct: true },
            {
              key: 'D',
              text: '+2.0 V/ms',
              correct: false,
              feedback: R`符号对了（负输入 → 向上斜坡），但 $RC$ 不是 2 ms：$20\text{ k}\Omega \times 50\text{ nF} = 1.0\text{ ms}$，斜率大小应是 $4.0\text{ V} \div 1.0\text{ ms}$。`,
            },
          ],
          feedback_correct: R`$RC = (20\text{ k}\Omega)(50\text{ nF}) = 1.0\text{ ms}$；由斜率公式 $dv_o/dt = -v_i/(RC) = -(-4.0\text{ V})/(1.0\text{ ms}) = +4.0\text{ V/ms}$。`,
          feedback_wrong: R`两步走：先算 $RC$（注意 $\text{k}$ 与 $\text{n}$ 的指数），再用 $dv_o/dt = -v_i/(RC)$，别丢负号。`,
          figure: SVG_Q1,
        },
        {
          id: 'w4l3_q2',
          question: R`在实际面包板搭接运放积分器时，在反馈电容 $C$ 两端并联一颗 $100\text{ k}\Omega$ 大电阻 $R_f$ 的最核心目的是什么？`,
          options: [
            {
              key: 'A',
              text: '提高积分器对高频方波的放大倍数',
              correct: false,
              feedback: R`$R_f$ 并在 $C$ 上只会让反馈阻抗变小、增益变小，不会提高放大倍数；而在信号频率远高于 $f_c$ 时 $X_C \ll R_f$，电流几乎全走电容，$R_f$ 对高频方波的积分几乎没有影响——它真正管的是直流。`,
            },
            {
              key: 'B',
              text: '消除输出波形与输入波形之间的 180° 反相关系',
              correct: false,
              feedback: R`反相来自信号从反相端输入（$v_o = -\frac{1}{RC}\int v_i\,d\tau$ 里的负号），并联 $R_f$ 后输出照样倒相；要去掉负号得再串一级反相器。`,
            },
            {
              key: 'C',
              text: '让运放可以在单电源下直接输出负电压',
              correct: false,
              feedback: '运放的输出不可能低于它的负电源轨：单电源时下限接近 0 V，并联几颗电阻都改变不了。本课用 ±9 V 双电源，正是为了让输出能摆到负电压。',
            },
            { key: 'D', text: '为直流失调电流提供直流通路，限制直流增益，防止运放漂移撞轨饱和', correct: true },
          ],
          feedback_correct: R`电容对直流开路，理想积分器会对微小直流失调 $V_{OS}$ 持续积分直至饱和；并联 $R_f$ 后将直流噪声增益限制在 $1 + R_f/R$，彻底解决上电撞轨问题。`,
          feedback_wrong: R`想一想：对直流（$f = 0$）来说电容是什么？没有 $R_f$ 时，3 mV 的失调电压会被怎样处理？`,
          figure: SVG_Q2,
        },
        {
          id: 'w4l3_q3',
          question: R`某运放微分器采用 $C = 100\text{ nF}$、$R = 10\text{ k}\Omega$。若输入一个斜率为 $+2.5\text{ V/ms}$ 的上升三角波斜坡，则该段时间内微分器的输出电压 $v_o$ 应为多少？`,
          options: [
            { key: 'A', text: '−2.5 V', correct: true },
            {
              key: 'B',
              text: '+2.5 V',
              correct: false,
              feedback: R`大小对了，符号丢了：微分器 $v_o = -RC\,\frac{dv_i}{dt}$，信号从反相端进入，上升斜坡（正斜率）给出的是负电平。`,
            },
            {
              key: 'C',
              text: '−25 V',
              correct: false,
              feedback: R`多了一个数量级：$RC = 10\text{ k}\Omega \times 100\text{ nF} = 1.0\text{ ms}$，$-(1.0\text{ ms})(+2.5\text{ V/ms}) = -2.5\text{ V}$。何况 $-25\text{ V}$ 远超 $\pm 9\text{ V}$ 电源轨，LM358 根本输出不了。`,
            },
            {
              key: 'D',
              text: '随时间线性下降的斜坡',
              correct: false,
              feedback: '微分把“斜率”变成“电平”：斜率恒定的斜坡，导数是一个常数，所以这段时间输出是一条水平直线。把电平变成斜坡的是积分器。',
            },
          ],
          feedback_correct: R`$RC = 1.0\text{ ms}$；微分器输出 $v_o = -RC(dv_i/dt) = -(1.0\text{ ms})(+2.5\text{ V/ms}) = -2.5\text{ V}$（恒定负电平）。`,
          feedback_wrong: R`代入 $v_o = -RC\,\frac{dv_i}{dt}$：先算 $RC$，再乘上斜率，最后别忘了负号。`,
          figure: SVG_Q3,
        },
        {
          id: 'w4l3_q4',
          question: R`在运放微分器（$R = 10\text{ k}\Omega$, $C = 100\text{ nF}$）的输入电容前串联一颗 $R_s = 1\text{ k}\Omega$ 小电阻，其对电路高频特性的直接影响是什么？`,
          options: [
            {
              key: 'A',
              text: '使电路变成低通积分器，彻底失去微分功能',
              correct: false,
              feedback: R`$R_s$ 只在频率高于 $f_b = 1/(2\pi R_s C) \approx 1.59\text{ kHz}$ 时起作用：在 500 Hz 的目标信号处增益约 2.997，仅比理想的 3.142 低约 4.6%，电路仍在微分，并没有变成积分器。`,
            },
            { key: 'B', text: '将高频增益上限封顶在 R/Rs = 10 倍，大幅抑制高频噪声放大与自激振荡', correct: true },
            {
              key: 'C',
              text: '将高频噪声增益再提高 10 倍',
              correct: false,
              feedback: R`方向反了：理想微分器的增益 $2\pi f RC$ 随频率一路上升（50 kHz 时约 314 倍），串联 $R_s$ 后高频时电容近似短路，增益被压到 $R/R_s = 10$，是大幅降低。`,
            },
            {
              key: 'D',
              text: '改变虚地电位，使 v- 不再等于 0 V',
              correct: false,
              feedback: R`$R_s$ 串在输入支路里，同相端仍然接地，负反馈照样把 $v_-$ 钉在 0 V；它改变的是输入支路的阻抗，不是虚地的电位。`,
            },
          ],
          feedback_correct: R`当频率远高于 $f_b = 1/(2\pi R_s C) \approx 1.59\text{ kHz}$ 时，电容近似短路，电路退化为反相放大器，高频增益被安全限制在 $R/R_s = 10$ 倍。`,
          feedback_wrong: R`想象频率非常高、电容近似一根导线：这时输入支路只剩 $R_s$，电路像什么放大器？增益是多少？`,
          figure: SVG_Q4,
        },
      ],
    },
  ],
};

export default W4_L3;
