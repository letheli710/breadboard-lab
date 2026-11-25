// W3-L8 · 运放工程综合实战（二进制加权 DAC、仪表放大器与比较器边界总结） (lesson sheet:
// docs/lessons/W3-L8.md). The professor's text of the five acts, the figures, the guided example
// and the self-test are reproduced from the sheet; [[id|…]] only links a term to the stage (the
// words are unchanged). Changes of form:
// - the opening remarks open act 1; the sheet's numbered sub-headings (1.1 … 4.2) are bold lines
//   (without "（可复制内联 2D SVG）"); display formulas sit in the ① / ② / ③ cards (a lead-in
//   sentence becomes the card title); the numbered ① items run as one paragraph;
// - the guided example (sheet 5.1) and the self-test (5.2) are acts of their own (5 and 6); the
//   sheet's 3.3 (World 4 / Phase 2 preview) follows the self-test (after_quiz); the sheet's 5.3
//   (a checklist for the developers) and the JSON ids are left out;
// - the guided example is not one of the acts' worked examples (act 2's ③ is Sadiku 5.12 with
//   R2 = R1 = 10 kΩ, analysed; the guided example designs R_G for A_v = 102 with R2 = 20 kΩ), so
//   act 2's ③ stays in place; the stage hides the example's numbers until it is finished, and the
//   step diagrams of steps 1, 4, 5 no longer print their answers (svgs.ts).
// Changes of content (the course owner's chip, and the physics of that chip):
// - the breadboard's op amp is the course's LM358 (the sheet: TL072), in the 3D layer, figure 4.1
//   and the text of act 4;
// - output swing on ±9 V: the LM358 is not a symmetric ±7.5 V part. High side ≈ V+ − 1.5 V =
//   +7.5 V; low side within tens of mV of V− only when it sinks < ≈ 50 µA, and ≈ V− + 0.8 V ≈
//   −8.2 V while the DAC's output sinks |v_o| / R_f ≈ 0.8 mA. With V_ref = 5 V, R_f = 10 kΩ: 1100
//   (−7.5 V) is linear, 1101 (−8.125 V) is at the edge, clipping starts at 1110 (−8.75 V; the
//   sheet: from 1101, which holds for a symmetric ±7.5 V part such as the TL072). Act 1's case B
//   step 3, the 16-code table's last column, and act 4's checkpoint 3 say so.
// Added: the sheet's breadboard_safety_and_scaling block (safety rules, supply, swing, BOM) as a
// note and tables in act 4, the 3D board's wiring table, the guided example's problem figure and
// conclusion, the quiz figures and the quiz act's figure, per-option quiz feedback written from
// the sheet's explanations.

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import { LM358_PINS, type Lm358Pin } from '../../Lm358';
import type { StageLesson, StageSync } from '../../types';
import {
  MINI_STEP1,
  MINI_STEP2,
  MINI_STEP3,
  MINI_STEP4,
  MINI_STEP5,
  SVG_BOUNDARY,
  SVG_DAC,
  SVG_GAIN,
  SVG_GD_PROBLEM,
  SVG_IA,
  SVG_LAYOUT,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
  SVG_QUIZ_ACT,
  SVG_STAIRS,
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
const DAC = (p: Record<string, unknown> = {}): StageSync['params'] => ({ topo: 'dac', code: 15, vref: 1, rf: 10_000, ia: 'ex', iaReveal: 9, ...p });
const IA = (p: Record<string, unknown> = {}): StageSync['params'] => ({ topo: 'ia', ia: 'ex', iaReveal: 9, rg: 10_000, iaIn: 'diff', ...p });
const GD = (reveal: number): StageSync['params'] => IA({ ia: 'gd', iaReveal: reveal });

const ALL_R = 'dac_r1,dac_r2,dac_r3,dac_r4';

const W3_L8: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Schematic, [L2]: Curves, [L3]: Bench3D },
  describeTarget: (id) => {
    const m = /^dac_opamp_p([1-8])$/.exec(id);
    if (m) {
      const p = Number(m[1]) as Lm358Pin;
      const role: Record<number, string> = {
        1: '本课的 DAC 输出 v_o：红表笔点这里读输出；R_f 从这里接回 Pin 2',
        2: '本课的虚地求和节点：四路加权电流汇入这里；负反馈正常时读数钉在 0.000 V',
        3: '接 GND 轨：同相端接地，反相端才会被“虚短”到 0 V',
        4: '接 −9 V 轨（负电源）',
        5: 'B 通道（本课未用）',
        6: 'B 通道（本课未用）',
        7: 'B 通道（本课未用）',
        8: '接 +9 V 轨（正电源）',
      };
      return { label: `LM358 Pin ${p} · ${LM358_PINS[p].name}`, desc: `${LM358_PINS[p].zh}。${role[p]}` };
    }
    return genericLabel(id);
  },
  lesson_meta: {
    lesson_id: 'W3-L8',
    world: 'World 3',
    title: '运放工程综合实战（二进制加权 DAC、仪表放大器与比较器边界总结）',
    subtitle: '从数字阶梯到微伏传感器调理，为线性负反馈与非线性比较器划下终极界碑',
    lesson_type: 'C',
    lesson_type_label: 'Type C（工程综合实战 + 3D 面包板实测课）',
    estimated_minutes: 55,
    textbook_primary: {
      book: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits, 2026 Release',
      sections: [
        'Section 5.10 Applications (Digital-to-Analog Converter & Instrumentation Amplifiers) · p. 194–198',
        'Example 5.11 (4-Bit Binary-Weighted DAC)',
        'Example 5.12 (Three-Op-Amp Instrumentation Amplifier)',
      ],
    },
    prerequisites: ['W3-L1', 'W3-L2', 'W3-L3', 'W3-L4', 'W3-L5', 'W3-L6', 'W3-L7'],
    pass_message: '随堂自测通过！World 3 运算放大器全章通关。',
    next_lesson: 'W4-L1',
    next_lesson_title: '电容：物理结构、伏安关系与储能',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 DAC / 仪表放大器原理图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 2D 4 位二进制加权 DAC 与仪表放大器切换原理图：DAC 页点开关 b1–b4 拨码、切 Vref（1 V / 5 V）与 Rf，看支路电流与虚地节点；仪表放大器页拖 R_G（1–100 kΩ），看 v1、v2、vo1、vo2、vo 的节点电位。',
      },
      {
        id: L2,
        label: '02 阶梯波形 / 增益曲线',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 DAC 16 级阶梯输出（理想虚线 / 面包板 LM358 实线，叠加 −9 V 电源轨、LM358 低端极限与对称 ±7.5 V 参考线，点台阶选码字）/ 仪表放大器 A_v(R_G) 双曲线（对数横轴，光标读增益与输出）。',
      },
      {
        id: L3,
        label: '03 3D 面包板 DAC 实测',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption:
          '03 3D 面包板 4 位拨码开关 DAC 实测（±9 V 双电源）：台式可调直流电源供 ±9 V 与 Vref，点 DIP 白色拨键切换 0000–1111，万用表红笔点 Pin 1（vo）或 Pin 2（虚地）；镜头可切正面俯视 / DIP 开关特写 / 运放引脚特写。',
      },
    ],
    hover_map: {
      dac_vref: { label: '参考电压 Vref（逻辑 1）', desc: '开关拨到 1 时支路接 Vref：1.000 V 标准基准或 5.000 V 压力测试；面包板上是顶部内侧的 Vref 轨，由台式电源 CH3 供电' },
      dac_b1: { label: '开关 b1（MSB）', desc: '最高有效位，权值 8：接 R = 10 kΩ；拨到 1 接 Vref，拨到 0 接地（面包板上经 10 kΩ 下拉到 GND）' },
      dac_b2: { label: '开关 b2', desc: '权值 4：接 2R = 20 kΩ' },
      dac_b3: { label: '开关 b3', desc: '权值 2：接 4R = 40 kΩ' },
      dac_b4: { label: '开关 b4（LSB）', desc: '最低有效位，权值 1：接 8R = 80 kΩ' },
      dac_r1: { label: '加权电阻 R = 10 kΩ（b1）', desc: '棕-黑-橙-棕（1%）：电流 b1·Vref / R，是 LSB 支路的 8 倍' },
      dac_r2: { label: '加权电阻 2R = 20 kΩ（b2）', desc: '红-黑-橙-棕（1%）' },
      dac_r3: { label: '加权电阻 4R = 40 kΩ（b3）', desc: '黄-黑-橙-棕（实际可用 39 kΩ + 1 kΩ 串联）' },
      dac_r4: { label: '加权电阻 8R = 80 kΩ（b4）', desc: '灰-黑-橙-棕（实际可用 82 kΩ 或两颗 40 kΩ 串联）' },
      dac_sum: { label: '虚地求和节点 v−（Pin 2）', desc: '四路支路电流在这里汇合后全部流过 Rf；负反馈正常时 v− = v+ = 0 V，输出一贴轨就离开 0 V' },
      dac_rf: { label: '反馈电阻 Rf', desc: '10 kΩ（1 LSB = −0.125 V @ Vref = 1 V）；Vref = 5 V 时换成 4 kΩ 可让满量程回到 −3.750 V；面包板上竖插在 Pin 1 与 Pin 2 两列之间' },
      dac_opamp: { label: '运放 LM358（±9 V）', desc: 'DIP-8 双运放，本课用 A 通道（Pin 1–4）。非轨到轨：±9 V 下高端约 +7.5 V，低端在输出吸入约 0.8 mA 时约 −8.2 V' },
      dac_vo: { label: '输出 vo（Pin 1）', desc: 'vo = −(Rf/8R)·Vref·D：16 级等距阶梯；超出 LM358 摆幅即削顶' },
      stair: { label: '理想 16 级阶梯', desc: '每增加 1 LSB 输出下降 Rf·Vref/(8R)：Vref = 1 V、Rf = 10 kΩ 时 0.125 V，满量程 −1.875 V' },
      rail_line: { label: '−9 V 电源轨', desc: '即使理想轨到轨运放，输出也越不过电源轨：Vref = 5 V 的 1111（理想 −9.375 V）被钳在 −9.0 V' },
      vol_line: { label: 'LM358 低端极限 ≈ −8.2 V', desc: '输出要经 Rf 吸入约 0.8 mA，LM358 低端停在 V− 上方约 0.8 V；轻载（几十 µA）时才能贴近 −9 V' },
      sym_line: { label: '对称 ±7.5 V 参考线', desc: '摆幅约 ±7.5 V 的对称非轨到轨运放（如 TL072）在 ±9 V 下的极限：它从 1101（−8.125 V）起就削顶' },
      ia_v1: { label: '输入 v1（接 A1 同相端）', desc: '传感器一端：直接进同相端，输入阻抗近似 ∞' },
      ia_v2: { label: '输入 v2（接 A2 同相端）', desc: '传感器另一端；v2 − v1 是要放大的差模信号，两者共有的部分是共模' },
      ia_a1: { label: '前级运放 A1', desc: '同相输入的高阻缓冲 + 增益级：虚短把它的反相端钉在 v1' },
      ia_a2: { label: '前级运放 A2', desc: '同相输入的高阻缓冲 + 增益级：虚短把它的反相端钉在 v2' },
      ia_a3: { label: '后级运放 A3（差分放大级）', desc: 'W3-L6 的四电阻差分放大器：vo = (R2/R1)(vo2 − vo1)' },
      ia_vshort: { label: 'R_G 两端的虚短电位', desc: 'v1− = v1、v2− = v2：R_G 两端电压直接等于输入差模电压 v2 − v1' },
      ia_r: { label: '前级反馈电阻 R（两颗）', desc: '本课 R = 25 kΩ；R_G 的电流原封不动地串联流过上下两颗 R' },
      ia_rg: { label: '外接增益电阻 R_G', desc: '唯一调增益的元件：A_v = (R2/R1)(1 + 2R/R_G)，R_G 越小增益越大；拔掉（∞）时 A_v → R2/R1' },
      ia_i: { label: 'R_G 电流 i', desc: 'i = (v2 − v1)/R_G，自下而上；共模输入时 i = 0' },
      ia_vo1: { label: '前级输出 vo1', desc: 'vo1 = v1 − i·R' },
      ia_vo2: { label: '前级输出 vo2', desc: 'vo2 = v2 + i·R' },
      ia_r1: { label: '后级电阻 R1（两颗）', desc: '10 kΩ，必须成对精密匹配' },
      ia_r2: { label: '后级电阻 R2（两颗）', desc: 'Sadiku Ex. 5.12：10 kΩ；引导例题：20 kΩ（后级增益 2）' },
      ia_vo: { label: '仪表放大器输出 vo', desc: 'vo = (R2/R1)(1 + 2R/R_G)(v2 − v1)' },
      gain_curve: { label: '增益曲线 A_v(R_G)', desc: 'R_G 越小增益呈双曲线陡增；R = 25 kΩ、R1 = R2 = 10 kΩ 时 1 kΩ → 51，10 kΩ → 6，100 kΩ → 1.5' },
      gain_pts: { label: 'Sadiku Ex. 5.12 采样点', desc: 'R_G = 1 k、2 k、5 k、10 k、100 kΩ 时的增益' },
      gain_asym: { label: 'R_G → ∞ 渐近线', desc: '拔掉 R_G：前级退化为两颗电压跟随器，A_v → R2/R1' },
      bb_psu: { label: '台式可调直流电源（±9 V）', desc: 'CH1 +9 V → 顶部外侧轨，CH2 −9 V → 底部外侧轨，COM → GND 轨（公共地），CH3 提供 Vref（1.000 V / 5.000 V，负端接 COM）' },
      rail_p9: { label: '+9 V 电源轨（顶部外侧）', desc: '红色跳线 a23 → 此轨：LM358 Pin 8（V+）' },
      rail_vref: { label: 'Vref 基准轨（顶部内侧）', desc: '四根橙色跳线把 DIP 开关的上排引脚（e15–e18）接到这里：开关 ON 时该位接 Vref' },
      rail_gnd: { label: 'GND 公共地轨（底部内侧）', desc: '电源 COM、四颗下拉电阻、LM358 Pin 3 与万用表黑表笔都接这里；上电前先确认它和双电源的公共地可靠相连' },
      rail_n9: { label: '−9 V 电源轨（底部外侧）', desc: '蓝色跳线 j26 → 此轨：LM358 Pin 4（V−）' },
      bb_dip: { label: '4 位 DIP 拨码开关（15–18 列）', desc: '跨中央凹槽：每一位把上排（Vref 侧）与下排（该位节点 b_k）接通；拨键推向 ON 侧 = 1' },
      bb_pulldown: { label: '下拉电阻 4 × 10 kΩ', desc: 'j15–j18 → GND 轨：开关断开时该位节点经 10 kΩ 接地，不悬空拾取 50/60 Hz 工频干扰；运放线性工作时它们不改变各位权值' },
      bb_link: { label: '黄色汇流跳线 i9 → i24', desc: '每列只有 5 个孔，开关脚 + 下拉 + 四颗电阻放不下：R、2R 向左汇到第 9 列，这根跳线把第 9 列并到 Pin 2 列——同一个虚地节点' },
      dmm: { label: '数字万用表（DC V）', desc: '黑表笔接 GND 轨（B+33），红表笔点 LM358 的 Pin 1（读 vo）或 Pin 2（读虚地）' },
      center_trench: { label: '中央绝缘凹槽', desc: 'e 与 f 之间绝缘：DIP 开关与 LM358 都跨在凹槽上，两排引脚互不相通' },
      scale_note: { label: '安全与缩放', desc: '±9 V 双电源、阻值全为 kΩ 级：不需要缩放；最大电阻功耗只有几毫瓦，远低于 1/4 W 额定' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '数字世界到模拟世界的桥梁——4 位二进制加权 DAC',
      sync: { layer: L1, halo: ['dac_r1', 'dac_r2', 'dac_r3', 'dac_r4', 'dac_sum'], params: DAC() },
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：同学们，经过前七节课的层层递进，你手里已经攒齐了运算放大器的全套“乐高积木”——反相放大器（W3-L3）、同相放大器与电压跟随器（W3-L4）、反相加法器（W3-L5）、差分放大器（W3-L6）以及多级级联分析（W3-L7）。今天是 **World 3 的工程综合收官战**。我们要把这些单块积木拼成两台真实世界里每天都在运转的精密仪器：**4 位二进制加权数模转换器（DAC）** 和 **三运放仪表放大器（IA）**；最后，我们要站在工程全局高度，给“线性负反馈放大”与“开环比较器”划出一道永不混淆的物理边界，再亲自上 3D 面包板通电实测！`,
        },
        { kind: 'p', text: `**1.1 工程问题引入：如何把 ${code('0')} 和 ${code('1')} 变成连续电压？**` },
        {
          kind: 'p',
          text: `在单片机、音乐播放器或示波器信号源内部，所有信息都是由 ${code('0')} 和 ${code('1')} 组成的二进制数字码；但扬声器的振膜、电机的转速、模拟仪表的指针只认连续变化的**模拟电压**。把数字码翻译成模拟电压的核心器件，就是 **数模转换器（Digital-to-Analog Converter, DAC）**。`,
        },
        {
          kind: 'formula',
          title: '回想 **W3-L5 反相加法器**：只要把多个输入电压通过不同电阻汇总到运放的反相输入端（[[dac_sum|虚地]]），输出电压就是各路输入的加权和：',
          tex: R`v_o = -\left(\frac{R_f}{R_1}v_1 + \frac{R_f}{R_2}v_2 + \frac{R_f}{R_3}v_3 + \frac{R_f}{R_4}v_4\right)`,
        },
        {
          kind: 'p',
          text: R`教授请你灵机一动：二进制数的每一位权值天然是 $2$ 的幂次（$2^3, 2^2, 2^1, 2^0$，或者归一化为 $1, \frac{1}{2}, \frac{1}{4}, \frac{1}{8}$）。如果我们故意把反相加法器的四路输入电阻按 **二进制权值递增** 设为 [[${ALL_R}|$R, 2R, 4R, 8R$]]，每路前端接一个[[dac_b1,dac_b2,dac_b3,dac_b4|受数字位控制的开关]]（${code('1')} 接[[dac_vref|参考电压 $V_{\text{ref}}$]]，${code('0')} 接地），会发生什么？一颗普通运放加五颗电阻，瞬间就变成了一台 **4 位二进制加权 DAC**！`,
        },
        { kind: 'p', text: '**1.2 4 位二进制加权 DAC 原理图**' },
        { kind: 'figure', svg: SVG_DAC, caption: '图 1-1：4 位二进制加权 DAC 开关阵列原理图（Sadiku Fig. 5.39 / Example 5.11）' },
        { kind: 'p', text: '**1.3 三段式教授板书推导：4 位二进制加权 DAC**' },
        {
          kind: 'note',
          tone: 'tip',
          text: '**板书铁律提醒**：严禁符号与数字混写！我们严格按照 **① 公理溯源 → ② 纯符号通式 → ③ 代入数值逐步化简** 完成推导。',
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`该电路存在从输出端 $v_o$ 经 [[dac_rf|$R_f$]] 返回反相输入端（$-$）的**负反馈回路**，在运放未饱和的线性区内满足理想运放两大基本公理：1. **虚短公理**：$v_- = v_+ = 0\text{ V}$（反相端为[[dac_sum|虚地节点]]）。2. **虚断公理**：$i_- = i_+ = 0\text{ A}$（无电流流入运放输入端）。3. **基尔霍夫电流定律（KCL）**：在反相输入端虚地节点处，流入节点的四路支路电流之和等于经反馈电阻 $R_f$ 流出的电流：$i_1 + i_2 + i_3 + i_4 = i_f$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：将欧姆定律代入 KCL（各支路电阻分别为 $R, 2R, 4R, 8R$）：`,
          tex: R`\frac{v_1 - v_-}{R} + \frac{v_2 - v_-}{2R} + \frac{v_3 - v_-}{4R} + \frac{v_4 - v_-}{8R} = \frac{v_- - v_o}{R_f}`,
        },
        {
          kind: 'formula',
          title: R`代入虚地条件 $v_- = 0$，整理得 **4 位二进制加权 DAC 纯符号输出通式**：`,
          tex: R`v_o = -R_f \left(\frac{v_1}{R} + \frac{v_2}{2R} + \frac{v_3}{4R} + \frac{v_4}{8R}\right) = -\frac{R_f}{R}\left(v_1 + \frac{1}{2}v_2 + \frac{1}{4}v_3 + \frac{1}{8}v_4\right)`,
        },
        {
          kind: 'formula',
          title: R`若记 4 位二进制输入码为 $b_1 b_2 b_3 b_4 \in \{0, 1\}^4$（其中 $b_1$ 为最高有效位 MSB，$b_4$ 为最低有效位 LSB），且逻辑 ${code('1')} 对应参考电压 $V_{\text{ref}}$、逻辑 ${code('0')} 对应 $0\text{ V}$，则 $v_k = b_k V_{\text{ref}}$，令十进制码值 $D = 8b_1 + 4b_2 + 2b_3 + b_4 \in \{0, 1, \dots, 15\}$，通式可写为极其优美的阶梯形式：`,
          tex: R`v_o(D) = -\frac{R_f}{8R} V_{\text{ref}} \cdot D = D \cdot \Delta v_{\text{LSB}}`,
        },
        { kind: 'p', text: '其中：' },
        {
          kind: 'ul',
          items: [
            R`**最小分辨率（1 LSB 步长）**：$\Delta v_{\text{LSB}} = -\frac{R_f}{8R} V_{\text{ref}}$`,
            R`**满量程输出（Full-Scale, ${code('1111')}, $D=15$）**：$v_{o,\text{FS}} = -\frac{15 R_f}{8R} V_{\text{ref}}$`,
          ],
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（对标 Sadiku Example 5.11 与 $\pm 9\text{ V}$ 饱和校验）`,
          steps: [
            {
              label: '已知电路参数',
              text: R`$R = 10\text{ k}\Omega$，$2R = 20\text{ k}\Omega$，$4R = 40\text{ k}\Omega$，$8R = 80\text{ k}\Omega$，$R_f = 10\text{ k}\Omega$，电源轨为 $\pm 9\text{ V}$。`,
            },
            { label: R`**情形 A（标准基准 $V_{\text{ref}} = 1\text{ V}$，Sadiku Example 5.11）**` },
            { label: 'A-1', text: R`比例系数：$\frac{R_f}{R} = \frac{10\text{ k}\Omega}{10\text{ k}\Omega} = 1$` },
            { label: 'A-2', text: R`最小步长（${code('0001')}）：$\Delta v_{\text{LSB}} = -\frac{1}{8} \times 1\text{ V} = -0.125\text{ V}$` },
            { label: 'A-3', text: R`满量程输出（${code('1111')}, $D=15$）：$v_{o,\text{FS}} = 15 \times (-0.125\text{ V}) = -1.875\text{ V}$` },
            { label: 'A-4', text: R`**饱和校验**：$|-1.875\text{ V}| \ll 7.5\text{ V} < 9.0\text{ V}$，全部 16 级码字均处于深度线性区，**100% 不饱和**！` },
            { label: R`**情形 B（5V 逻辑电平压力测试 $V_{\text{ref}} = 5\text{ V}$）**` },
            { label: 'B-1', text: R`最小步长（${code('0001')}）：$\Delta v_{\text{LSB}} = -\frac{1}{8} \times 5\text{ V} = -0.625\text{ V}$` },
            { label: 'B-2', text: R`满量程理想计算值（${code('1111')}, $D=15$）：$v_{o,\text{ideal}}(15) = 15 \times (-0.625\text{ V}) = -9.375\text{ V}$` },
            {
              label: 'B-3',
              text: R`**饱和警报！**：$-9.375\text{ V}$ 已经**突破 $-9.0\text{ V}$ 负电源轨**！即使在理想轨到轨运放下，${code('1111')} 也会被钳位在 $-9.0\text{ V}$；而真实面包板常用的非轨到轨运放摆幅更小：摆幅约 $\pm 7.5\text{ V}$ 的对称型（如 TL072）从 ${code('1101')}（$-8.125\text{ V}$）起就会出现明显削顶失真；本课面包板上的 [[dac_opamp|LM358]] 并不对称——高端只到约 $V_+ - 1.5\text{ V} = +7.5\text{ V}$，低端在输出要经 $R_f$ 吸入约 $0.8\text{ mA}$ 时约为 $V_- + 0.8\text{ V} \approx -8.2\text{ V}$，所以 ${code('1101')} 贴着极限（临界），从 ${code('1110')}（$-8.750\text{ V}$）起明显削顶。`,
            },
            {
              label: 'B-4',
              text: R`**工程修复方案**：若必须直接用 $V_{\text{ref}} = 5\text{ V}$ 驱动，只需将反馈电阻调整为 [[dac_rf|$R_f = 4\text{ k}\Omega$]]，此时 $\Delta v_{\text{LSB}} = -0.250\text{ V}$，满量程 $v_{o,\text{FS}} = -3.750\text{ V}$，留出超过 $3.7\text{ V}$ 的安全裕量。`,
            },
          ],
        },
        { kind: 'p', text: '**1.4 4 位 DAC 完整 16 级真值与输出电压全码表（SymPy 验算）**' },
        {
          kind: 'table',
          caption: R`最后一列按本课面包板上的 LM358 校核（低端极限 $\approx -8.2\text{ V}$）；对称 $\pm 7.5\text{ V}$ 的运放从 ${code('1101')} 起就削顶`,
          head: [
            R`二进制码 $(b_1 b_2 b_3 b_4)$`,
            R`十进制 $D$`,
            R`$v_o$ ($V_{\text{ref}}=1\text{ V}, R_f=10\text{ k}\Omega$)`,
            R`$v_o$ 理想值 ($V_{\text{ref}}=5\text{ V}, R_f=10\text{ k}\Omega$)`,
            R`$\pm 9\text{ V}$ 双电源状态 ($V_{\text{ref}}=5\text{ V}$)`,
          ],
          rows: [
            [code('0000'), '0', R`$0.000\text{ V}$`, R`$0.000\text{ V}$`, '线性区'],
            [`${code('0001')} (LSB)`, '1', R`$-0.125\text{ V}$`, R`$-0.625\text{ V}$`, '线性区'],
            [code('0010'), '2', R`$-0.250\text{ V}$`, R`$-1.250\text{ V}$`, '线性区'],
            [code('0011'), '3', R`$-0.375\text{ V}$`, R`$-1.875\text{ V}$`, '线性区'],
            [code('0100'), '4', R`$-0.500\text{ V}$`, R`$-2.500\text{ V}$`, '线性区'],
            [code('0101'), '5', R`$-0.625\text{ V}$`, R`$-3.125\text{ V}$`, '线性区'],
            [code('0110'), '6', R`$-0.750\text{ V}$`, R`$-3.750\text{ V}$`, '线性区'],
            [code('0111'), '7', R`$-0.875\text{ V}$`, R`$-4.375\text{ V}$`, '线性区'],
            [`${code('1000')} (MSB)`, '8', R`$-1.000\text{ V}$`, R`$-5.000\text{ V}$`, '线性区'],
            [code('1001'), '9', R`$-1.125\text{ V}$`, R`$-5.625\text{ V}$`, '线性区'],
            [code('1010'), '10', R`$-1.250\text{ V}$`, R`$-6.250\text{ V}$`, '线性区'],
            [code('1011'), '11', R`$-1.375\text{ V}$`, R`$-6.875\text{ V}$`, '线性区'],
            [code('1100'), '12', R`$-1.500\text{ V}$`, R`$-7.500\text{ V}$`, R`线性区（对称 $\pm 7.5\text{ V}$ 运放的临界点）`],
            [code('1101'), '13', R`$-1.625\text{ V}$`, R`$-8.125\text{ V}$`, R`理想线性 / LM358 临界（距极限约 $0.08\text{ V}$）/ 对称 $\pm 7.5\text{ V}$ 运放已削顶`],
            [code('1110'), '14', R`$-1.750\text{ V}$`, R`$-8.750\text{ V}$`, R`理想线性 / LM358 削顶（约 $-8.2\text{ V}$）`],
            [`${code('1111')} (FS)`, '15', R`$-1.875\text{ V}$`, R`$-9.375\text{ V}$`, R`**击穿 $-9\text{ V}$ 电源轨，彻底饱和！**`],
          ],
        },
        { kind: 'p', text: '**1.5 DAC 16 级阶梯输出波形图**' },
        { kind: 'figure', svg: SVG_STAIRS, caption: '图 1-2：4 位 DAC 16 级等距阶梯输出波形（Vref = 1 V, R = Rf = 10 kΩ）；左侧 02 层可切 Vref、Rf 并对照 ±9 V 电源轨' },
        { kind: 'p', text: '**1.6 工程痛点剖析与 R-2R 梯形网络预告**' },
        {
          kind: 'p',
          text: R`二进制加权 DAC 在 4 位时看起来非常优雅，但教授必须告诉你一个残酷的工程事实：**一旦位数升高，电阻跨度会呈指数爆炸！** 对于 $N$ 位二进制加权 DAC，最小电阻与最大电阻之比为 $2^{N-1}$：`,
        },
        {
          kind: 'ul',
          items: [
            R`**4 位**：$R_{\max}/R_{\min} = 2^3 = 8$（$10\text{ k}\Omega$ 到 $80\text{ k}\Omega$，面包板勉强凑齐）。`,
            R`**8 位**：$R_{\max}/R_{\min} = 2^7 = 128$（$10\text{ k}\Omega$ 到 $1.28\text{ M}\Omega$）。`,
            R`**12 位**：$R_{\max}/R_{\min} = 2^{11} = 2048$（$10\text{ k}\Omega$ 到 $20.48\text{ M}\Omega$，且最高位 MSB 电阻的误差必须小于 $\frac{1}{2^{12}} \approx 0.024\%$，否则低位全被淹没！）。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**工程预告（R-2R 梯形网络）**：正是为了消灭这个“电阻跨度爆炸”的痛点，现代集成 DAC 普遍采用 **R-2R 梯形网络（R-2R Ladder DAC）**——无论做到 8 位、12 位还是 16 位，整张电路图里**永远只需要 $R$ 和 $2R$ 这两种阻值**，片上匹配精度极高，而且你可以直接用 World 2 学过的戴维南等效定理一口气推出来！`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '从毫伏噪声中“打捞”微弱信号——三运放仪表放大器 (IA)',
      sync: { layer: L1, halo: ['ia_rg', 'ia_vshort'], params: IA() },
      blocks: [
        { kind: 'p', text: '**2.1 为什么单运放差分放大器扛不住精密传感器？**' },
        {
          kind: 'p',
          text: R`在 **W3-L6 差分放大器** 中，我们已经学会了用一颗运放和四颗电阻放大两路输入之差 $v_o = \frac{R_2}{R_1}(v_2 - v_1)$。既然如此，为什么心电图机（ECG）、工业称重应变片电桥（Wheatstone Bridge）和热电偶放大器不直接用一颗差分放大器，而偏偏要花三颗运放的成本去搭 **仪表放大器（Instrumentation Amplifier, IA）**？`,
        },
        { kind: 'p', text: '原因有两个致命工程硬伤：' },
        {
          kind: 'ol',
          items: [
            R`**输入阻抗太低且不对称**：单运放差分放大器的反相端输入阻抗只有 $R_1$，同相端是 $R_1 + R_2$。一旦传感器自身内阻高达几十千欧（比如人体皮肤电极或高阻电桥），差分放大器就会像“吸管”一样抽走信号电流，产生严重的负载分压失真，甚至破坏电桥平衡！`,
            R`**增益调节极其痛苦**：在单运放差分放大器里，想改增益必须同时按精确比例更换两对（共四颗）电阻；只要有一颗电阻失配 $1\%$，共模抑制比（CMRR）立刻断崖式暴跌，50/60 Hz 工频噪声瞬间淹没微弱的毫伏信号。`,
          ],
        },
        { kind: 'p', text: '**破局之道（回链 W3-L4 + W3-L6）**：' },
        {
          kind: 'p',
          text: R`在[[ia_a3|差分放大器 $A_3$]] 的前面，给 [[ia_v1|$v_1$]] 和 [[ia_v2|$v_2$]] 各自加装[[ia_a1,ia_a2|一颗同相输入运放（$A_1, A_2$）]]作为高输入阻抗缓冲与前置增益级！更绝妙的是，我们在 $A_1$ 和 $A_2$ 的反相输入端之间跨接[[ia_rg|**唯一一颗外接增益电阻 $R_G$**]]。结果是：`,
        },
        {
          kind: 'ul',
          items: [
            R`输入阻抗直冲 $\infty$（$A_1, A_2$ 同相端直接接传感器）；`,
            R`整机增益可以**仅通过旋动一颗电位器 [[ia_rg|$R_G$]] 无级调节**，完全不需要动后面[[ia_r1,ia_r2|四颗精密匹配电阻]]！`,
          ],
        },
        { kind: 'p', text: '**2.2 三运放仪表放大器完整拓扑图**' },
        { kind: 'figure', svg: SVG_IA, caption: '图 2-1：三运放仪表放大器完整拓扑，标出 R_G 两端虚短电位 v1 与 v2（Sadiku Fig. 5.42 / Example 5.12）' },
        { kind: 'p', text: R`**2.3 三段式教授板书推导：三运放仪表放大器总增益公式**` },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`全电路三颗运放 $A_1, A_2, A_3$ 均工作在深度负反馈线性区：1. **前级 $A_1, A_2$ 虚短公理**：$v_{1-} = v_{1+} = v_1$，且 $v_{2-} = v_{2+} = v_2$。**教授拍案叫绝时刻**：请盯紧电阻 [[ia_rg|$R_G$]] 的上下两端！它的上端电位被 $A_1$ 虚短死死钉在 $v_1$，下端电位被 $A_2$ 虚短死死钉在 $v_2$——这意味着 [[ia_vshort|$R_G$ 两端电压**直接等于输入差模电压 $v_2 - v_1$**]]！2. **前级 $A_1, A_2$ 虚断公理**：$i_{1-} = i_{2-} = 0\text{ A}$。因此，流过 $R_G$ 的[[ia_i|电流 $i$]] 没有任何旁路可逃，**必然原封不动地串联流过[[ia_r|上下两颗反馈电阻 $R$]]**！3. **后级 $A_3$ 差分放大定理（W3-L6 结论）**：当后级满足四电阻成对匹配（两个 $R_1$、两个 $R_2$）时，有：$v_o = \frac{R_2}{R_1}(v_{o2} - v_{o1})$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · **第一步（求流过 $R_G$ 的电流 $i$）**：取自下而上（从 $v_{2-}$ 到 $v_{1-}$）为参考方向：`,
          tex: R`i = \frac{v_{2-} - v_{1-}}{R_G} = \frac{v_2 - v_1}{R_G}`,
        },
        {
          kind: 'formula',
          title: R`**第二步（由欧姆定律求第一级输出差分电压 $v_{o2} - v_{o1}$）**：因电流 $i$ 依次流过下支路 $R$、中间 $R_G$、上支路 $R$（三颗电阻等效串联承载同一电流 $i$）：`,
          tex: R`v_{o2} - v_{o1} = i (R + R_G + R) = i (2R + R_G)`,
        },
        {
          kind: 'formula',
          title: R`将 $i = \frac{v_2 - v_1}{R_G}$ 代入上式：`,
          tex: R`v_{o2} - v_{o1} = \frac{2R + R_G}{R_G}(v_2 - v_1) = \left(1 + \frac{2R}{R_G}\right)(v_2 - v_1)`,
        },
        {
          kind: 'formula',
          title: R`**第三步（级联后级差分放大器 $A_3$）**：将 $v_{o2} - v_{o1}$ 代入后级公式 $v_o = \frac{R_2}{R_1}(v_{o2} - v_{o1})$，即得 **三运放仪表放大器总传输通式**：`,
          tex: R`v_o = \frac{R_2}{R_1}\left(1 + \frac{2R}{R_G}\right)(v_2 - v_1)`,
        },
        { kind: 'formula', title: '总差模电压增益为：', tex: R`A_v = \frac{v_o}{v_2 - v_1} = \frac{R_2}{R_1}\left(1 + \frac{2R}{R_G}\right)` },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**共模抑制妙处**：如果输入端叠加了完全相同的工频共模干扰 $v_1 = v_2 = v_{\text{cm}}$，那么 $R_G$ 两端电压为 $v_{\text{cm}} - v_{\text{cm}} = 0\text{ V} \implies i = 0$，前级只对共模信号提供 **单位增益 $1$**（绝不放大共模噪声，避免前级饱和！），随后后级 $A_3$ 将共模电压彻底相减抵消！（左侧 01 层把输入切到「共模」，看 $i$ 归零、$v_o = 0$。）`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（对标 Sadiku Example 5.12）',
          steps: [
            {
              label: '已知',
              text: R`设某工业仪表放大器参数为：[[ia_r|$R = 25\text{ k}\Omega$]]，[[ia_r1|$R_1 = 10\text{ k}\Omega$]]，[[ia_r2|$R_2 = 10\text{ k}\Omega$]]，外接增益电阻 [[ia_rg|$R_G$]] 在 $1\text{ k}\Omega$ 至 $100\text{ k}\Omega$ 间可调。`,
            },
            { label: '1', text: R`后级增益系数：$\frac{R_2}{R_1} = \frac{10\text{ k}\Omega}{10\text{ k}\Omega} = 1$` },
            { label: '2', text: R`分子常数：$2R = 2 \times 25\text{ k}\Omega = 50\text{ k}\Omega$` },
            {
              label: '3',
              text: R`当 $R_G = 1\text{ k}\Omega$ 时，取得最大增益：`,
              tex: R`A_{v,\max} = 1 \times \left(1 + \frac{50\text{ k}\Omega}{1\text{ k}\Omega}\right) = 1 + 50 = 51`,
            },
            { label: '4', text: R`当 $R_G = 10\text{ k}\Omega$ 时：`, tex: R`A_v = 1 \times \left(1 + \frac{50\text{ k}\Omega}{10\text{ k}\Omega}\right) = 1 + 5 = 6` },
            {
              label: '5',
              text: R`当 $R_G = 100\text{ k}\Omega$ 时，取得最小增益：`,
              tex: R`A_{v,\min} = 1 \times \left(1 + \frac{50\text{ k}\Omega}{100\text{ k}\Omega}\right) = 1 + 0.5 = 1.5`,
            },
            { label: '6', text: R`**极限检验**：若直接拔掉 $R_G$（$R_G \to \infty$ 开路），[[gain_asym|$A_v \to \frac{R_2}{R_1} = 1$]]，前级退化为两颗纯电压跟随器！` },
          ],
        },
        { kind: 'p', text: R`**2.4 仪表放大器 $A_v(R_G)$ 增益调节曲线**` },
      ],
      inline_svg: SVG_GAIN,
      figure_caption: '图 2-2：仪表放大器增益 A_v 随外接电阻 R_G 变化的双曲线（Sadiku Example 5.12 参数）；左侧 02 层可拖 R_G 读光标',
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: 'World 3 收官总览——线性负反馈放大 vs 开环比较器边界',
      sync: { layer: L2, halo: ['rail_line', 'vol_line', 'dac_vo'], params: DAC({ vref: 5, code: 15, yfit: 'rails' }) },
      blocks: [
        { kind: 'p', text: '**3.1 World 3 全章 6 大经典线性拓扑与比较器全景决策表**' },
        {
          kind: 'p',
          text: '学完整个 World 3，面对一张陌生运放电路图时，你第一眼该看什么？**先看反馈路径连到了哪一个输入端！** 下表把整章 6 大经典线性拓扑与非线性比较器的核心规律一网打尽：',
        },
        {
          kind: 'table',
          head: ['类别', '拓扑名称', '反馈类型', R`虚短 $v_+ = v_-$ 是否成立？`, '核心输入-输出公式', R`典型输入阻抗 $R_{\text{in}}$`, '典型工程应用场景'],
          rows: [
            ['**线性区**', '1. 反相放大器 (W3-L3)', '负反馈', '**成立**', R`$v_o = -\frac{R_f}{R_1}v_i$`, R`$R_1$（中低）`, '信号反相缩放、电流-电压转换'],
            ['**线性区**', '2. 同相放大器 (W3-L4)', '负反馈', '**成立**', R`$v_o = \left(1+\frac{R_f}{R_1}\right)v_i$`, R`$\approx \infty$（极高）`, '高阻传感器同相放大'],
            ['**线性区**', '3. 电压跟随器 (W3-L4)', '100% 负反馈', '**成立**', R`$v_o = v_i$`, R`$\approx \infty$（极高）`, '阻抗隔离缓冲级、消除负载效应'],
            ['**线性区**', '4. 反相加法器 / 加权 DAC (W3-L5, L8)', '负反馈', '**成立**', R`$v_o = -R_f\sum \frac{v_k}{R_k}$`, R`各支路 $R_k$`, '音频混音器、二进制加权 DAC'],
            ['**线性区**', '5. 单运放差分放大器 (W3-L6)', '负反馈', '**成立**', R`$v_o = \frac{R_2}{R_1}(v_2 - v_1)$`, R`$R_1$ 与 $R_1+R_2$`, '低阻差分采样、高侧电流检测'],
            [
              '**线性区**',
              '6. 级联 / 三运放仪表放大器 (W3-L7, L8)',
              '负反馈',
              '**成立**',
              R`$v_o = \frac{R_2}{R_1}\left(1+\frac{2R}{R_G}\right)(v_2-v_1)$`,
              R`$\approx \infty$（对称极高）`,
              '应变片电桥、ECG 心电、热电偶调理',
            ],
            [
              '**非线性区**',
              '7. 开环比较器 / 正反馈滞回比较器',
              '**无反馈 / 正反馈**',
              '**彻底失效！**',
              R`$v_o = \begin{cases}+V_{\text{sat}}, & v_+ > v_- \\ -V_{\text{sat}}, & v_+ < v_-\end{cases}$`,
              R`$\approx \infty$`,
              '过零检测、阈值报警、PWM 生成',
            ],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 02 层停在 $V_{\text{ref}} = 5\text{ V}$ 的 ${code('1111')}：负反馈接得再对，[[dac_vo|输出]]一撞上 [[vol_line|LM358 的摆幅极限]]或 [[rail_line|$-9\text{ V}$ 电源轨]]，就从“线性区”掉进“饱和区”，[[dac_sum|虚短]]随之失效——这正是下图右翼比较器一直待着的地方。`,
        },
        { kind: 'p', text: '**3.2 线性负反馈 vs 开环比较器边界对比图**' },
      ],
      inline_svg: SVG_BOUNDARY,
      figure_caption: '图 3-1：World 3 终极物理边界——线性负反馈放大区与开环 / 正反馈比较器非线性饱和区',
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '3D 面包板实测工坊——4 位拨码开关 DAC 实操 (±9V 双电源)',
      sync: { layer: L3, halo: ['bb_psu', 'bb_dip', 'dac_opamp'], params: DAC({ code: 0, cam: 'bench', probe: 'pin2' }) },
      blocks: [
        {
          kind: 'note',
          tone: 'tip',
          text: R`**Type C 实测指引**：左侧舞台第 3 层（${code('03 3D 面包板 4位拨码开关 DAC 实测')}）已为你搭建好双 $\pm 9\text{ V}$ 供电的 3D 面包板实景。请按以下工程验收流程逐步操作并对照万用表读数。`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`[[scale_note|**面包板安全与供电说明**]]：① 上电前必须先核对双 9V 电源的公共地 (GND) 已与面包板[[rail_gnd|地轨]]可靠短接，严禁浮地测试。② 严禁将 DIP-8 运放芯片插反（缺口/圆点朝左对应 Pin 1），防止 +9V 与 -9V 电源反接烧毁芯片。③ 4 位拨码开关未接高电平时，输入支路必须通过[[bb_pulldown|下拉电阻]]或单刀双掷切换至 GND，严禁悬空引入 50/60 Hz 工频干扰。本实验阻值全为 $\text{k}\Omega$ 级，**按原值搭建、无需缩放**；最热的电阻也只有几毫瓦（下表），远低于 $1/4\text{ W}$ 额定。`,
        },
        {
          kind: 'table',
          caption: R`供电、摆幅与功耗校核（按本课的 LM358 校核摆幅）`,
          head: ['项目', '数值', '说明'],
          rows: [
            [
              '供电',
              R`[[bb_psu|台式可调直流电源（$\pm 9\text{ V}$）]]`,
              R`CH1 $+9\text{ V}$、CH2 $-9\text{ V}$、COM 接 GND 轨；CH3 提供 $V_{\text{ref}}$（$1.000\text{ V}$ 基准 / $5.000\text{ V}$ 压力测试）`,
            ],
            [
              '运放摆幅',
              R`[[dac_opamp|LM358]]：约 $-8.2\text{ V}$ 至 $+7.5\text{ V}$`,
              R`非轨到轨且不对称：高端约 $V_+ - 1.5\text{ V}$；低端轻载时贴近 $V_-$，本 DAC 输出要经 $R_f$ 吸入约 $0.8\text{ mA}$，停在 $V_- + 0.8\text{ V}$ 左右。理想轨到轨钳位 $\pm 9.0\text{ V}$`,
            ],
            [R`饱和校核（$R = R_f = 10\text{ k}\Omega$）`, R`$V_{\text{ref}} = 1\text{ V}$：满量程 $-1.875\text{ V}$`, '16 级全部线性，完全不饱和'],
            [
              '',
              R`$V_{\text{ref}} = 5\text{ V}$：满量程理想 $-9.375\text{ V}$`,
              R`击穿 $-9\text{ V}$ 轨；LM358 上 ${code('1101')} 临界、${code('1110')} 起削顶。修复：$R_f$ 缩至 $4\text{ k}\Omega$（满量程 $-3.750\text{ V}$）或改用 $V_{\text{ref}} = 1\text{ V}$`,
            ],
            [
              '电阻功耗',
              R`最大约 $7.4\text{ mW}$`,
              R`$V_{\text{ref}} = 5\text{ V}$ 的 ${code('1111')} 削顶时 $R_f$ 上 $(0.41 + 8.2)^2 / 10\text{ k}\Omega$；$10\text{ k}\Omega$ 支路与下拉各 $5^2/10\text{ k}\Omega = 2.5\text{ mW}$；都远低于 $250\text{ mW}$`,
            ],
            ['阻值缩放', '不需要', R`全部为 $\text{k}\Omega$ 级，按原值搭建`],
          ],
        },
        { kind: 'p', text: '**4.1 4 位拨码开关 DAC 面包板物理布局俯视图**' },
        {
          kind: 'figure',
          svg: SVG_LAYOUT,
          caption:
            '图 4-1：3D 面包板实物接线映射图（±9 V 双电源 + 4 位 DIP 拨码开关 + LM358）。示意图把四路电阻画在同一条虚地汇聚列上；3D 板上 R、2R 先汇到第 9 列，再由黄色跳线并到 Pin 2 列——同一个节点',
        },
        {
          kind: 'table',
          caption: '左侧 03 层的逐孔接线（830 孔面包板：a–e、f–j 同列竖通，e 与 f 之间是中央凹槽；顶部外侧 +9 V、内侧 Vref，底部内侧 GND、外侧 −9 V）',
          head: ['元件 / 导线', '位置', '作用'],
          rows: [
            [
              '[[bb_psu|台式可调直流电源（±9 V）]]',
              '[[rail_p9|+9 V 轨]] / [[rail_vref|Vref 轨]] / [[rail_gnd|GND 轨]] / [[rail_n9|−9 V 轨]] 左端',
              'CH1 +9 V、CH3 Vref、COM、CH2 −9 V 各用一根引线接到轨上',
            ],
            ['[[bb_dip|4 位 DIP 拨码开关]]', '15–18 列跨凹槽', R`第 $k$ 位接通 e(14+k) 与 f(14+k)；f 排是该位节点 $b_k$`],
            ['橙色跳线 × 4', 'a15–a18 → Vref 轨', '开关上排接 Vref：拨到 ON = 1'],
            ['[[bb_pulldown|下拉电阻 10 kΩ × 4]]', 'j15–j18 → GND 轨', '拨到 0 时该位经 10 kΩ 接地'],
            ['[[dac_r1|R = 10 kΩ]] / [[dac_r2|2R = 20 kΩ]]', 'g15 → g9 / h16 → h9', 'b1、b2 两路向左汇到第 9 列'],
            ['[[dac_r3|4R = 40 kΩ]] / [[dac_r4|8R = 80 kΩ]]', 'g17 → g24 / h18 → h24', 'b3、b4 两路直接进 Pin 2 列'],
            ['[[bb_link|黄色汇流跳线]]', 'i9 → i24', R`第 9 列并到 Pin 2 列：[[dac_sum|虚地求和节点]]`],
            ['[[dac_opamp|LM358]]', '23–26 列跨凹槽（缺口朝左）', 'Pin 1 = 第 23 列 f、Pin 2 = 第 24 列、Pin 3 = 25、Pin 4 = 26；Pin 8 在第 23 列 e'],
            ['[[dac_rf|Rf（竖插）]]', 'j23 ↔ j24', 'Pin 1 → Pin 2 的负反馈'],
            ['红 / 黑 / 蓝跳线', 'a23 → +9 V 轨；j25 → GND 轨；j26 → −9 V 轨', 'Pin 8 = V+，Pin 3 = 同相端接地，Pin 4 = V−'],
            ['[[dmm|万用表（DC V）]]', '黑表笔 GND 轨（B+33），红表笔点 Pin 1 或 Pin 2', R`读 $v_o$ 或虚地 $v_-$`],
          ],
        },
        { kind: 'p', text: '**4.2 3D 面包板四步实测验收清单**' },
        {
          kind: 'ol',
          items: [
            R`**检查点 1（虚地验证，${code('0000')} 与 ${code('1000')}）**：将红色探针点触 [[dac_opamp|LM358]] 的 [[dac_opamp_p2|Pin 2]]（反相输入端），黑色探针接[[rail_gnd|地轨]]。无论你如何拨动 [[bb_dip|4 位 DIP 开关]]，只要运放未饱和，Pin 2 读数应死死钉在 **$0.000\text{ V}$（误差 $< \pm 2\text{ mV}$）**。`,
            R`**检查点 2（LSB 与 MSB 权值验证，$V_{\text{ref}} = 1.000\text{ V}$）**：仅拨高 ${code('b4')}（码字 ${code('0001')}）：万用表测得 [[dac_opamp_p1|Pin 1]] 输出 $v_o = -0.125\text{ V}$；仅拨高 ${code('b1')}（码字 ${code('1000')}）：万用表测得 $v_o = -1.000\text{ V}$（精确为 LSB 的 $8$ 倍）；四位全拨高（码字 ${code('1111')}）：万用表测得 $v_o = -1.875\text{ V}$，波形图 16 级台阶均匀无畸变。`,
            R`**检查点 3（故意触发饱和故障排查，$V_{\text{ref}} = 5.000\text{ V}$）**：在左侧舞台把 [[dac_vref|$V_{\text{ref}}$]] 切到 ${code('5.0 V')}，并将 DIP 开关拨到 ${code('1111')}。观察两大现象：① Pin 1 输出被削顶在 $-V_{\text{sat}}$（理想模型 $-9.0\text{ V}$，面包板上的 LM358 约 $-8.2\text{ V}$），达不到理论值 $-9.375\text{ V}$；② 此时再测 Pin 2，你会震惊地发现 **Pin 2 不再是 $0\text{ V}$ 虚地**！因为输出贴轨后负反馈环路已经断裂，虚短公理瞬间失效！`,
            R`**检查点 4（工程修复）**：切回 $V_{\text{ref}} = 1.0\text{ V}$ 或将 [[dac_rf|$R_f$]] 更换为 $4\text{ k}\Omega$，重新测试 ${code('1111')}，确认 Pin 2 恢复 $0.000\text{ V}$ 虚地且输出回到线性区。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`对照左侧 03 层的读数：检查点 3 时 Pin 1 读 $-8.200\text{ V}$、Pin 2 读约 $+0.409\text{ V}$——节点方程 $\dfrac{5 - v_-}{R \parallel 2R \parallel 4R \parallel 8R} = \dfrac{v_- - v_o}{R_f}$ 给出 $v_- = \dfrac{75 + 8 v_o}{23}$（单位 V），$v_o$ 不再由虚短决定，$v_-$ 也就离开了 $0\text{ V}$。把 [[dac_opamp_p2|Pin 2]] 换成 [[dac_opamp_p1|Pin 1]] 用镜头里的“运放引脚特写”最清楚。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 5: the guided example (sheet 5.1) */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: R`苏格拉底式 5 步引导例题（三运放仪表放大器增益推导与 $R_G$ 选型）`,
      sync: { layer: L1, halo: ['ia_v1', 'ia_v2'], params: GD(0) },
      blocks: [
        {
          kind: 'guided',
          // all steps answered: the stage uncovers the example's numbers
          done_params: { iaReveal: 9, rg: 1_000 },
          title: R`三运放仪表放大器增益推导、$R_G$ 选型与饱和核验`,
          source: 'W3-L8-SOCRATIC-IA-01 · Alexander, Sadiku & Fredette (2026) Section 5.10',
          problem: R`**题目背景**：某工业称重应变片电桥输出两路微弱电压 [[ia_v1|$v_1 = 2.000\text{ V}$]]、[[ia_v2|$v_2 = 2.050\text{ V}$]]（包含 $50\text{ mV}$ 有效差模信号与 $2.000\text{ V}$ 共模直流偏置）。现采用 $\pm 9\text{ V}$ 供电的三运放仪表放大器，已知前级两颗反馈电阻 [[ia_r|$R = 25\text{ k}\Omega$]]，后级差分放大器 [[ia_r1|$R_1 = 10\text{ k}\Omega$]]、[[ia_r2|$R_2 = 20\text{ k}\Omega$]]。请分 5 步完成整机增益推导、设计外接电阻 [[ia_rg|$R_G$]] 使总差模增益达到 $A_v = 102$，并核验前级与后级输出是否饱和。`,
          problem_svg: SVG_GD_PROBLEM,
          steps: [
            {
              title: '① 锁定 RG 两端虚短电位',
              mini_svg: MINI_STEP1,
              question: '在三运放仪表放大器的第一级中，A1 与 A2 均处于负反馈线性区。请判断外接增益电阻 RG 上下两端（即 A1− 与 A2− 节点）的电位差 v(A2−) − v(A1−) 等于多少？',
              hint: R`$v_{1-} = v_{1+} = v_1,\quad v_{2-} = v_{2+} = v_2 \implies v_{2-} - v_{1-} = v_2 - v_1$`,
              options: [
                {
                  text: '0 V（因为双运放把 RG 两端都拉到了虚地）',
                  correct: false,
                  feedback: '小心别把“虚短”背成了“虚地”！只有同相端接地时反相端才是 0V；这里 A1+ 接 v1、A2+ 接 v2，所以两个反相端分别被钉在 v1 和 v2。',
                },
                {
                  text: 'v2 − v1 = 0.050 V（50 mV）',
                  correct: true,
                  feedback: '漂亮！这就是三运放仪表放大器最绝妙的一步：A1 和 A2 的虚短把输入差模电压原封不动地搬到了 RG 两端！',
                },
                { text: 'v2 + v1 = 4.050 V', correct: false, feedback: '电位差是相减而不是相加哦！再看看 RG 两端分别连着哪两个节点。' },
                { text: '取决于 RG 的阻值大小，无法直接确定', correct: false, feedback: '只要 A1、A2 没饱和，虚短公理就会强迫 v1− = v1、v2− = v2，跟 RG 阻值无关！' },
              ],
              board: [R`v_{1-} = v_1,\; v_{2-} = v_2 \implies i_{R_G} = \frac{v_2 - v_1}{R_G}`],
              halo: ['ia_vshort', 'ia_rg'],
              params: GD(0),
            },
            {
              title: '② 推导第一级差分输出表达式',
              mini_svg: MINI_STEP2,
              question: '根据运放虚断公理（i1− = i2− = 0），流过 RG 的电流 i 必然串联流过上下两颗反馈电阻 R。由此可得第一级差分输出 vo2 − vo1 的纯符号通式为：',
              hint: R`$v_{o2} - v_{o1} = i_{R_G}(R + R_G + R) = \frac{v_2 - v_1}{R_G}(2R + R_G)$`,
              options: [
                { text: '(1 + R / RG) · (v2 − v1)', correct: false, feedback: '漏掉了一颗反馈电阻 R！上面 A1 有一颗 R，下面 A2 也有一颗 R，电流 i 把两颗 R 全都走了一遍。' },
                { text: '(2R / RG) · (v2 − v1)', correct: false, feedback: '别忘了中间 RG 自己也有压降 i·RG = v2 − v1，合起来是 i·(R + RG + R)，所以有个“1 +”！' },
                { text: '(1 + 2R / RG) · (v2 − v1)', correct: true, feedback: '完全正确！三颗电阻 R、RG、R 串联承担同一电流，总压降自然是 i·(2R + RG) = (1 + 2R/RG)(v2 − v1)。' },
                { text: '−(1 + 2R / RG) · (v2 − v1)', correct: false, feedback: '检查一下正负号方向：当 v2 > v1 时，电流自下而上流，所以 vo2 电位高于 vo1，vo2 − vo1 为正！' },
              ],
              board: [R`v_{o2} - v_{o1} = \left(1 + \frac{2R}{R_G}\right)(v_2 - v_1)`],
              halo: ['ia_r', 'ia_rg', 'ia_i'],
              params: GD(1),
            },
            {
              title: '③ 级联后级并拆分目标增益',
              mini_svg: MINI_STEP3,
              question: '已知后级差分放大器 A3 的电阻为 R1 = 10 kΩ、R2 = 20 kΩ，整机目标总差模增益为 Av = 102。请问第一级需要提供的差模增益 Av1 = 1 + 2R/RG 应当是多少？',
              hint: R`$A_v = A_{v1} \cdot A_{v2} = \left(1 + \frac{2R}{R_G}\right)\cdot\frac{R_2}{R_1} = 102$`,
              options: [
                { text: 'Av1 = 51', correct: true, feedback: '精准！后级 A3 提供 Av2 = R2/R1 = 20k/10k = 2，因此前级只需提供 Av1 = 102 / 2 = 51。' },
                { text: 'Av1 = 102', correct: false, feedback: '注意看后级参数：R2 = 20 kΩ, R1 = 10 kΩ，所以后级自己已经提供了 2 倍增益，不是 1 倍哦！' },
                { text: 'Av1 = 204', correct: false, feedback: '总增益是两级相乘 Av = Av1 × Av2，已知 Av = 102、Av2 = 2，求 Av1 应该做除法而不是乘法。' },
                { text: 'Av1 = 50', correct: false, feedback: '102 除以 2 等于 51，别急着提前减 1，那一步留到算 RG 时再减！' },
              ],
              board: [R`A_{v2} = \frac{R_2}{R_1} = \frac{20\text{ k}\Omega}{10\text{ k}\Omega} = 2 \implies A_{v1} = 1 + \frac{2R}{R_G} = \frac{102}{2} = 51`],
              halo: ['ia_r1', 'ia_r2', 'ia_a3'],
              params: GD(2),
            },
            {
              title: '④ 反解外接增益电阻 RG 选型',
              mini_svg: MINI_STEP4,
              question: '已知前级反馈电阻 R = 25 kΩ，且需要 Av1 = 1 + 2R/RG = 51。请计算所需的外接单颗增益电阻 RG 阻值：',
              hint: R`$R_G = \frac{2R}{A_{v1} - 1} = \frac{2 \times 25\text{ k}\Omega}{51 - 1}$`,
              options: [
                { text: 'RG = 500 Ω', correct: false, feedback: '检查一下分子：2R = 2 × 25 kΩ = 50 kΩ，50 kΩ / 50 = 1 kΩ，你多除了一次 2！' },
                { text: 'RG = 1.0 kΩ', correct: true, feedback: '教科书级的精准选型！RG = 1.0 kΩ 恰好是实验室最常见的 1% 金属膜标准阻值。' },
                { text: 'RG = 2.0 kΩ', correct: false, feedback: '若 RG = 2 kΩ，则 1 + 50/2 = 26，总增益只有 52，比目标少了一半。' },
                { text: 'RG = 980 Ω', correct: false, feedback: '你忘了先从 51 里减去那个“1”！51 − 1 = 50，所以 RG = 50 kΩ / 50 = 1.0 kΩ，非常整洁的标准阻值！' },
              ],
              board: [R`R_G = \frac{2R}{A_{v1} - 1} = \frac{50\text{ k}\Omega}{50} = 1.0\text{ k}\Omega`],
              halo: ['ia_rg', 'ia_r'],
              params: GD(3),
            },
            {
              title: '⑤ 全链路节点电压与 ±9V 饱和核验',
              mini_svg: MINI_STEP5,
              question:
                '最后一步工程闭环核验：代入 v1 = 2.000 V、v2 = 2.050 V（RG = 1.0 kΩ, R = 25 kΩ），求出中间节点 vo1、vo2 以及最终输出 vo，并判断在 ±9V 双电源下是否安全不饱和：',
              hint: R`$i = \frac{0.050}{1000} = 50\,\mu\text{A},\; v_{o1} = v_1 - iR,\; v_{o2} = v_2 + iR,\; v_o = A_v(v_2 - v_1)$`,
              options: [
                {
                  text: 'vo1 = 0.750 V, vo2 = 3.300 V, vo = 5.100 V，全级安全不饱和',
                  correct: true,
                  feedback: '满分通关！你不仅算出了 vo = 5.100 V，还验证了中间级 vo1 = 0.750 V、vo2 = 3.300 V 均在 ±7.5V 线性安全窗内——这才是真正的硬件工程师素养！',
                },
                {
                  text: 'vo1 = −1.250 V, vo2 = +1.300 V, vo = 5.100 V，全级安全不饱和',
                  correct: false,
                  feedback: '别忘了前级对 2.000V 的共模电压有单位增益（+1 倍）！vo1 = v1 − i·R = 2.000 − 1.250 = 0.750 V，不是从 0 往下减。',
                },
                {
                  text: 'vo1 = 0.750 V, vo2 = 3.300 V, vo = 10.200 V，后级 A3 饱和',
                  correct: false,
                  feedback: '再算一下 102 × 0.050 V！0.050 V 是 50 毫伏不是 100 毫伏，所以 vo = 5.100 V，远没有到 9V 电源轨！',
                },
                {
                  text: 'vo1 = 2.000 V, vo2 = 2.050 V, vo = 5.100 V，全级安全不饱和',
                  correct: false,
                  feedback: '若 vo1=2.000V、vo2=2.050V，那第一级增益就成了 1，后面的 A3 怎么可能把 50mV 放大成 5.100V 呢？',
                },
              ],
              board: [
                R`v_{o1} = 0.750\text{ V},\; v_{o2} = 3.300\text{ V},\; v_o = 102 \times 0.050\text{ V} = 5.100\text{ V} \in [-7.5\text{ V}, +7.5\text{ V}]\;(\text{安全不饱和})`,
              ],
              halo: ['ia_vo1', 'ia_vo2', 'ia_vo'],
              params: GD(4),
            },
          ],
          conclusion: R`五步通关：$A_{v2} = 2$，$A_{v1} = 51$，$R_G = 1.0\text{ k}\Omega$；$i = 50\,\mu\text{A}$ 在两颗 $25\text{ k}\Omega$ 上各压降 $1.25\text{ V}$，$v_{o1} = 0.750\text{ V}$、$v_{o2} = 3.300\text{ V}$、$v_o = 5.100\text{ V}$，都在 LM358 的 $\pm 9\text{ V}$ 摆幅（约 $-8.2\text{ V}$ 至 $+7.5\text{ V}$）之内。左侧 01 原理图已揭晓各节点电压，02 层可看这台 $R_2/R_1 = 2$ 的增益曲线。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 6: the diagnostic quiz (sheet 5.2) */
    {
      act_index: 6,
      badge: '诊断测验',
      title: 'W3-L8 运放工程综合实战诊断测验',
      sync: { layer: L1, halo: [], params: DAC({ code: 0 }) },
      blocks: [
        {
          kind: 'p',
          text: '以下 4 道诊断题覆盖本课四个考点：DAC 码字换算、加权电阻跨度、仪表放大器的 $R_G$、负反馈与比较器的边界。四题全部答对即通关本课，也为整个 World 3 收官。',
        },
      ],
      inline_svg: SVG_QUIZ_ACT,
      figure_caption: '诊断测验的四个考点',
      quiz: [
        {
          id: 'w3l8_q1',
          question:
            '某 4 位二进制加权 DAC 参数为 R = 10 kΩ（2R = 20 kΩ, 4R = 40 kΩ, 8R = 80 kΩ），反馈电阻 Rf = 10 kΩ，电源为 ±9V。若逻辑“1”对应 Vref = 2.0 V、逻辑“0”对应 0 V，当输入二进制码为 1011（b1=MSB, b4=LSB）时，输出电压 vo 为多少？',
          options: [
            {
              key: 'A',
              text: '−2.250 V',
              correct: false,
              feedback: R`$-2.250\text{ V}$ 对应 $D = 9$（码字 1001）：把 1011 的第三位 $b_3$（权值 2）漏掉了。1011 的十进制是 $8 + 0 + 2 + 1 = 11$。`,
            },
            { key: 'B', text: '−2.750 V', correct: true },
            {
              key: 'C',
              text: '+2.750 V',
              correct: false,
              feedback: R`数值对了，符号反了：所有支路电流都从 $V_{\text{ref}}$ 流进虚地、再经 $R_f$ 流向输出端，反相结构的输出必为负，$v_o = -(R_f/8R)\cdot V_{\text{ref}}\cdot D$。`,
            },
            {
              key: 'D',
              text: '−5.500 V',
              correct: false,
              feedback: R`这是把分母 $8R$ 写成了 $4R$（多了一倍）：LSB 支路是 $8R = 80\text{ k}\Omega$，$|v_o| = \frac{10}{80} \times 2.0 \times 11 = 2.750\text{ V}$。`,
            },
          ],
          feedback_correct: R`二进制 1011 对应十进制 $D = 8 + 0 + 2 + 1 = 11$。代入公式 $v_o = -(R_f / 8R)\cdot V_{\text{ref}}\cdot D = -(1/8)\times 2.0\times 11 = -2.750\text{ V}$，在 $\pm 9\text{V}$ 电源下安全不饱和。`,
          feedback_wrong: R`先把 1011 换成十进制 $D$（$b_1$ 权值 8），再代入 $v_o = -(R_f/8R)\cdot V_{\text{ref}}\cdot D$。`,
          figure: SVG_Q1,
          sync: { halo: ['dac_b1', 'dac_b2', 'dac_b3', 'dac_b4'] },
        },
        {
          id: 'w3l8_q2',
          question: '若将上述二进制加权 DAC 扩展为 8 位，且最高位 MSB 电阻仍取 R = 10 kΩ，那么最低位 LSB 支路电阻需要多大？这暴露了二进制加权 DAC 什么核心工程缺陷？',
          options: [
            {
              key: 'A',
              text: '80 kΩ；缺陷是功耗过大',
              correct: false,
              feedback: R`$80\text{ k}\Omega$ 是 4 位 DAC 的 LSB 电阻（$2^3 R$）；8 位要 $2^7 R$。而且电阻越大电流越小，功耗反而更低，缺陷不在功耗。`,
            },
            {
              key: 'B',
              text: '160 kΩ；缺陷是输出必然饱和',
              correct: false,
              feedback: R`$160\text{ k}\Omega = 2^4 R$ 只是第 5 位的电阻。输出是否饱和取决于 $V_{\text{ref}}$ 与 $R_f$ 的选取，跟位数多少无关。`,
            },
            { key: 'C', text: '1.28 MΩ；缺陷是高位数时电阻跨度呈 2^(N−1) 指数爆炸，难以精密匹配', correct: true },
            {
              key: 'D',
              text: '2.56 MΩ；缺陷是运放输入阻抗不够高',
              correct: false,
              feedback: R`$2.56\text{ M}\Omega = 2^8 R$ 多翻了一倍：8 位从 $b_1$ 的 $R$ 到 $b_8$ 只翻 7 次。加权电阻接在虚地上，运放输入阻抗也不是问题所在。`,
            },
          ],
          feedback_correct: R`8 位二进制加权 DAC 的 LSB 电阻为 $2^{(8-1)}\cdot R = 128 \times 10\text{ k}\Omega = 1.28\text{ M}\Omega$。阻值跨度极大且高位精度要求极苛刻，因此高位数 DAC 工程上改用仅需 $R$ 与 $2R$ 两种阻值的 R-2R 梯形网络。`,
          feedback_wrong: R`第 $k$ 位的电阻是 $2^{k-1}R$：8 位的 LSB 是第 8 位。`,
          figure: SVG_Q2,
        },
        {
          id: 'w3l8_q3',
          question:
            '在三运放仪表放大器中（R = 20 kΩ, R1 = 10 kΩ, R2 = 10 kΩ），原本接有 RG = 5 kΩ。若调试时不慎将外接电阻 RG 拔掉（RG 开路，趋于 ∞），整机差模增益 Av 将如何变化？',
          options: [
            { key: 'A', text: '从 9 降为 1（前级退化为两颗电压跟随器，后级维持单位差分增益）', correct: true },
            {
              key: 'B',
              text: '从 9 暴增至 ∞，运放立即饱和',
              correct: false,
              feedback: R`$R_G$ 在 $2R/R_G$ 的分母上：$R_G \to \infty$ 时这一项趋于 0，增益是变小而不是变大。增益趋于 $\infty$ 的是反过来把 $R_G$ 短路（$R_G \to 0$）。`,
            },
            {
              key: 'C',
              text: '从 9 降为 0，整机无任何输出',
              correct: false,
              feedback: R`$A_v = \frac{R_2}{R_1}\left(1 + \frac{2R}{R_G}\right)$ 里还有那个“1”：$R_G$ 开路后 $A_1$、$A_2$ 成了电压跟随器，差模信号照样原样送到后级，$A_v \to R_2/R_1 = 1$，不是 0。`,
            },
            {
              key: 'D',
              text: '保持 9 不变',
              correct: false,
              feedback: R`$R_G$ 正是唯一的调益电阻：拔掉它，流过两颗 $R$ 的电流变为 0，前级增益 $1 + 2R/R_G$ 从 9 掉到 1，整机增益随之改变。`,
            },
          ],
          feedback_correct: R`原增益 $A_v = (R_2/R_1)(1 + 2R/R_G) = 1\times(1 + 40/5) = 9$。当 $R_G \to \infty$ 开路时，$2R/R_G \to 0$，流过反馈电阻 $R$ 的电流为 0，$A_1$ 与 $A_2$ 退化为两颗纯电压跟随器，总增益平滑降至 $R_2/R_1 = 1$。`,
          feedback_wrong: R`先用 $A_v = (R_2/R_1)(1 + 2R/R_G)$ 算出原增益，再让 $R_G \to \infty$ 看哪一项消失。`,
          figure: SVG_Q3,
          sync: { layer: L1, halo: ['ia_rg'], params: IA() },
        },
        {
          id: 'w3l8_q4',
          question: '一位同学在面包板上测试反相加法器/DAC 时，把反馈电阻 Rf 误插到了运放的同相输入端（+）而非反相输入端（−），或将 Rf 彻底拔掉变成开环。此时下列哪项判断是正确的？',
          options: [
            {
              key: 'A',
              text: '只要输入电压足够小，虚短 v+ = v− 依然严格成立',
              correct: false,
              feedback: R`虚短不是“输入小”给的，而是负反馈给的：开环增益 $A \approx 10^5$ 时，几十微伏的 $v_+ - v_-$ 就足以把输出推到电源轨，此时 $v_+$ 与 $v_-$ 并不相等。`,
            },
            { key: 'B', text: '电路失去负反馈，进入开环/正反馈非线性比较器区，虚短失效，输出直接贴向 +Vsat 或 −Vsat', correct: true },
            {
              key: 'C',
              text: '输出电压仅极性反转，其余线性放大功能不变',
              correct: false,
              feedback: R`把反馈接到同相端是正反馈：偏差会被越放越大，输出直接冲到 $\pm V_{\text{sat}}$，根本不存在“线性放大、只是反相”的工作点。`,
            },
            {
              key: 'D',
              text: '电路自动变成电压跟随器，输出等于输入',
              correct: false,
              feedback: R`电压跟随器要求输出 100% 接回**反相端**（负反馈）。$R_f$ 接到同相端或被拔掉，都没有这条负反馈路径。`,
            },
          ],
          feedback_correct: R`虚短公理（$v_+ = v_-$）的物理前提是存在稳定的深度负反馈且输出未饱和。一旦失去负反馈（开环）或接成正反馈，运放开环增益 $A \approx 10^5$ 会瞬间把输出推向电源轨（$\pm V_{\text{sat}}$），虚短彻底失效。`,
          feedback_wrong: R`回到第 3 幕的决策表：先看反馈路径连到了哪一个输入端。`,
          figure: SVG_Q4,
          sync: { layer: L2, halo: ['rail_line', 'vol_line'], params: DAC({ vref: 5, code: 15, yfit: 'rails' }) },
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**承上启下：通往 World 4 与 Phase 2 ESP32 的桥梁**' },
        {
          kind: 'ul',
          items: [
            R`**预告 World 4（储能元件与动态运放）**：到今天为止，我们只在运放周围放了纯电阻 $R$。一旦进入 World 4 把反馈电阻换成电容 $C$，反相放大器就会瞬间进化为**运放积分器（Integrator）与微分器（Differentiator）**，能够直接用硬件完成微积分运算与有源滤波！`,
            R`**预告 Phase 2（ESP32 ADC 传感器信号调理）**：当你后续把称重传感器或心电电极接到 ESP32 开发板时，传感器只输出几毫伏的差分信号，而 ESP32 的 ADC 量程是 $0\text{–}3.3\text{ V}$。你今天亲手推导的**三运放仪表放大器**，正是把 $10\text{ mV}$ 传感器信号干净放大到 $2.0\text{ V}$ 送入 ESP32 ADC 的核心模拟前端（AFE）！`,
          ],
        },
      ],
    },
  ],
};

export default W3_L8;
