// W4-L2 · 电感的物理结构、电磁感应伏安关系与磁场储能 (lesson sheet: docs/lessons/W4-L2.md).
// The professor's text of the six acts, the figures, the guided example and the self-test are
// reproduced from the sheet; [[id|…]] only links a term to the stage (the words are unchanged).
// Changes of form:
// - the opening remarks open act 1; the "左侧舞台联动" lines become tip notes (without renderer
//   names, and without "右侧" for the 断开开关 button, which sits on the stage); the numbered
//   sub-headings are bold lines, without "内联 2D 矢量图：" (a format label); display formulas sit
//   in the ① / ② / ③ cards (a lead-in sentence becomes the card title); a display formula inside
//   a ① runs inline;
// - anti-spoiler: act 5's 「③ 代入数值 · 逐步化简」 (the Example 5.1 solution) moved behind the
//   guided example (act 6) as the 「通关复盘」 board, with figure 5.2 in full and figure 6.1 (the
//   energy split and safety card, which print the answers); act 5 keeps ① and ② and shows figure
//   5.2 with the answers as "?" (svgs.ts). On the stage, Example 5.1's numbers stay hidden while
//   the example runs (stage param ex51 = steps solved; done_params uncovers them); step 1 keeps
//   the original circuit on the desk, since its answer is the L-short / C-open swap. With 6.1 moved,
//   act 6's sub-headings lose their numbers (6.2 would come before 6.1);
// - plain-text symbols of the guided-example and quiz JSON are set as TeX; the sheet's JSON ids,
//   the passing score (the site uses 4/4) and the 「Claude 工程落地清单」 are left out.
// Changes of content (reported):
// - Example 1.1 step 3: 200 × 98.70 µH is 19 740 µH, not 19 739.2; the unrounded 98.696 µH gives
//   the sheet's 19 739.2 µH, so the product uses 98.696;
// - guided step 1, option A: "L = di/dt 给出 v_L = 0" reads v_L = L di/dt = 0;
// - guided step 1, option C: the "电池" shorted by the capacitor is the lab's 台式可调直流电源（9 V）
//   (course rule: the lab supply is never a battery);
// - figure 3.3 and act 3's stage note: the flyback diode for the 200 mA relay coil is a 1N4007,
//   not a 1N4148 (the sheet's own safety rule: 1N4148 only below 150 mA); the safety note calls
//   the 1N4007 a rectifier, not a fast-recovery diode.
// Added: the safety block (breadboard_safety_and_scaling) as notes in act 1 and a table in act 5;
// the hover map; a tip in act 5 pointing to the guided example; the guided example's problem
// figure and conclusion; per-option quiz feedback written from the explanations; the quiz figures.

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { L1, L2, L3, L4 } from './state';
import {
  MINI_STEP1,
  MINI_STEP2,
  MINI_STEP3,
  MINI_STEP4,
  MINI_STEP5,
  SVG_DC,
  SVG_DC_TASK,
  SVG_ENERGY,
  SVG_GD_PROBLEM,
  SVG_KICK,
  SVG_NET,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
  SVG_SOLENOID,
  SVG_WAVES,
} from './svgs';

const Bench3D = lazy(() => import('./Bench3D'));
const Coil3D = lazy(() => import('./Coil3D'));
const Waves = lazy(() => import('./Waves'));
const DcBench = lazy(() => import('./DcBench'));

const R = String.raw;

/** Example 5.1 on the stage with its answers hidden (every act sets it, so scrolling back restores it) */
const HIDE = { ex51: 0, dcCase: 'ex51' };
const EX21 = { wmode: 'wave', wL: 10, ipk: 40, t1: 2, t2: 5, t3: 6 };
const at = (layer: string, halo: string[], params: Record<string, unknown>): StageSync => ({ layer, halo, params: { ...HIDE, ...params } });

const W4_L2: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Bench3D, [L2]: Coil3D, [L3]: Waves, [L4]: DcBench },
  lesson_meta: {
    lesson_id: 'W4-L2',
    world: 'World 4',
    title: '电感的物理结构、电磁感应伏安关系与磁场储能',
    subtitle: 'Inductors, Electromagnetic V-I Relations, Magnetic Energy & DC Steady-State Analysis',
    lesson_type: 'A',
    lesson_type_label: 'Type A（器件导论课 — 含 3D 线圈磁通剥壳 + 3D 面包板实操）',
    estimated_minutes: 55,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Section 6.4 Inductors', 'Section 6.5 Series and Parallel Inductors', 'Table 6.1（电容与电感的重要特性对照）'],
    },
    textbook_supplement: 'Introductory Circuit Analysis, 14th Ed. (Boylestad), Ch. 11',
    prerequisites: ['W1-L3 欧姆定律', 'W4-L1 电容与微积分伏安关系'],
    next_lesson: 'W4-L3',
    next_lesson_title: '运放积分器与微分器：用虚地把波形送进微积分流水线',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 3D 色环/绕线电感封装与面包板插法',
        render_mode: '3D_THREEJS_DEVICE_AND_BREADBOARD',
        caption:
          '01 轴向色环电感、工字绕线电感与环形磁芯电感 3D 模型，色环电感与 1/4 W 电阻并排对比；面包板上搭好例题 5.1（台式可调直流电源 9 V 供电，万用表可测节点 A、电容、电感与 R₄ 两端），右侧演示两颗电感留足间距的防耦合摆法。',
      },
      {
        id: L2,
        label: '02 3D 线圈磁通透视与右手定则',
        render_mode: '3D_THREEJS_TEARDOWN',
        caption: '02 拖“剥壳”滑块剖开色环外壳，看漆包线绕组与磁芯（空气 / 铁氧体 μr = 200）、电流流向、右手螺旋定则与穿过截面 A 的闭合磁力线 Φ；改匝数 N 看 L ∝ N²。',
      },
      {
        id: L3,
        label: '03 2D 原理图与 i(t)↔v(t) 波形及反电动势续流演示',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '03 拖动 i(t) 的拐点，下面的 v(t) = L di/dt 跟着阶跃；切到“断电续流”，断开开关对比无保护的 −2000 V 打火与续流二极管钳位在 −0.7 V 的安全续流。',
      },
      {
        id: L4,
        label: '04 直流稳态（电容开路 + 电感短路）混合分析台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '04 一键切换例题 5.1 的原始 R-L-C 电路与直流稳态等效网络（C → 开路、L → 短路），R₄ 支路电流清零；读 i_L、v_C、电源电流、R₁ 功耗与磁电储能条。',
      },
    ],
    hover_map: {
      /* layer 01 */
      supply: {
        label: '台式可调直流电源（9 V）',
        desc: '例题 5.1 的 V_s = 9 V：面包板上是一台单路台式可调直流电源，+ 接顶部外侧 +9 V 轨，− 接 GND 轨；04 分析台上画成理想电压源 V_s',
      },
      rail_p9: { label: '+9 V 电源轨（顶部外侧）', desc: '红色跳线 T+13 → a14：R₁ 的上端接这里' },
      rail_gnd: { label: 'GND 轨', desc: '顶部内侧轨接电源 −；一根长黑跳线把它并到底部外侧轨。R₂、R₃ 与电容负极都回到这里' },
      r1: { label: 'R₁ = 100 Ω', desc: '棕-黑-棕-金：c14 → c20，电源到节点 A 的串联电阻；全电源电流都流过它，直流稳态下它的功耗最大，必须核算低于 0.25 W' },
      r2: { label: 'R₂ = 300 Ω', desc: '橙-黑-棕-金：节点 A → GND（b20 → 顶部 GND 轨）' },
      r3: { label: 'R₃ = 150 Ω', desc: '棕-绿-棕-金：电感支路的下半段（b23 → 顶部 GND 轨）；电感短路后它两端就是 v_A' },
      r4: { label: 'R₄ = 200 Ω', desc: '红-黑-棕-金：跨中央凹槽 e20 → h20，与电容串联；直流稳态下这条支路电流为 0，R₄ 上没有压降' },
      ind_l: {
        label: '电感 L = 20 mH（工字功率电感）',
        desc: '工字（鼓形）铁氧体功率电感，额定电流 ≥ 200 mA（执行稿推荐的实验电感），两脚插 d20、d23。直流稳态等效为短路（v_L = 0）；实物还有 R_DCR 与 R₃ 串联，会让 i_L 略小于理想值',
      },
      cap_c: { label: '电容 C = 10 µF（电解）', desc: '长脚（+）插 i20、短脚（−，白色条纹一侧）插 i22 再跳线到 GND；直流稳态等效为开路（i_C = 0），两端电压 v_C 仍要标出' },
      node_a: { label: '节点 A', desc: 'R₁、R₂、L、R₄ 汇合的节点（面包板第 20 列上半区）：v_A = V_s · R₂₃ /(R₁ + R₂₃)' },
      dmm: { label: '数字万用表（DC V）', desc: '红、黑表笔按测点选择：节点 A 对地、电容两端、电感两端（直流稳态读 0 V：短路）、R₄ 两端（0 V：无电流）' },
      p_check: { label: '面包板功耗核验', desc: 'P = I²R 逐颗检查，必须低于 1/4 W 额定；最大的是 R₁' },
      safety: { label: '面包板安全规范', desc: '5–12 V 供电、电阻功耗 < 0.25 W、电感电流 10–50 mA（远低于 I_sat）；切断感性负载必须反并续流二极管' },
      couple_pair: { label: '两颗相邻电感的摆法', desc: '拉开间距（或让两颗电感的轴线正交），彼此的磁力线互不穿过，互感 M ≈ 0；紧贴摆放时磁通互相穿过，串并联公式不再成立' },
      tray_res: { label: '1/4 W 碳膜电阻', desc: '米黄底色、四道色环，读数单位是 Ω：与色环电感外观极像' },
      tray_ring: { label: '0410 轴向色环电感', desc: '淡绿或湖蓝底色、两端呈哑铃状鼓起，色环读数单位是 µH；I_sat 通常仅 100–300 mA，R_DCR 1–30 Ω' },
      tray_drum: { label: '工字绕线电感', desc: '铁氧体工字磁芯上绕漆包线，立式插板；同体积下电流能力比色环电感大' },
      tray_toroid: { label: '环形磁芯电感', desc: '磁通闭合在环形磁芯里，几乎不向外泄漏，对相邻元件干扰最小' },
      /* layer 02 */
      coil: { label: 'N 匝漆包线绕组', desc: '电流沿绕组流动（红色箭头）；L ∝ N²：匝数翻倍，L 变为 4 倍。漆包线本身有直流电阻 R_DCR' },
      core: { label: '磁芯（空气 / 铁氧体）', desc: 'μ = μ₀μᵣ：插入 μᵣ = 200 的铁氧体，同一线圈的 L 放大 200 倍；电流超过 I_sat 时磁芯饱和，μᵣ 暴跌' },
      shell: { label: '色环外壳', desc: '淡绿环氧外壳与四道色环（0410 色环电感的样子）；拖“剥壳”滑块剖开它' },
      flux: { label: '闭合磁力线 Φ', desc: '从线圈内部穿过截面 A，再从外部绕回：Φ = BA，N 匝的总磁链 λ = NΦ = Li' },
      rhr: { label: '右手螺旋定则', desc: '四指顺着线圈电流方向弯曲，大拇指指向线圈内部磁场 B 的方向；电流反向，B 也反向' },
      coil_dim: { label: '几何尺寸 ℓ 与 A', desc: '例题 1.1：线圈长度 ℓ = 40 mm，半径 r = 5 mm，A = πr² ≈ 7.854 × 10⁻⁵ m²' },
      /* layer 03 */
      i_wave: { label: '电流 i(t)', desc: '电感电流是连续的：可以有折角，但不能跳变' },
      v_wave: { label: '电压 v(t) = L di/dt', desc: '只看电流的斜率：斜率一变就阶跃；平台段（直流）v = 0' },
      slope: { label: '电流斜率 di/dt', desc: '例题 2.1：上升段 +20 A/s、下降段 −40 A/s；乘以 L 就是电压' },
      plateau: { label: '恒流平台', desc: 'di/dt = 0 → v = 0：两端没有压降却能通过电流，就是短路' },
      cursor: { label: '时间光标', desc: '拖动它读该时刻的 i、di/dt、v、功率 p = vi 与储能 w = ½Li²' },
      kick_src: { label: '台式可调直流电源（12 V）', desc: '给继电器线圈供电：12 V / 60 Ω 绕组 = 200 mA' },
      relay_coil: { label: '继电器线圈 L = 10 mH', desc: '绕组电阻 12 V / 200 mA = 60 Ω；断电时储能 ½LI₀² = 0.2 mJ 必须找地方释放' },
      kick_sw: { label: '开关（触点 / MOSFET）', desc: '1 μs 内强行断开 200 mA：v_L = L Δi/Δt = −2000 V' },
      flyback_d: {
        label: '续流二极管 D₁（1N4007）',
        desc: '反向并联：阴极接正电源、阳极接开关端。通电时反偏截止；断电瞬间正偏导通，把线圈电压钳位在约 −0.7 V，电流在小环路里续流衰减',
      },
      spark: { label: '反电动势尖峰 / 拉弧', desc: '没有续流通路：电感翻转极性（下正上负），开关两端叠加超过 2000 V，击穿 MOSFET 或在触点间拉弧' },
      /* layer 04 */
      i_l: { label: '电感电流 i_L', desc: '直流稳态：i_L = v_A / R₃（电感短路）' },
      v_c: { label: '电容电压 v_C', desc: '直流稳态：R₄ 上无压降，v_C = v_A' },
      e_bar: { label: '磁电储能占比', desc: 'w_L = ½Li_L²（绿）与 w_C = ½Cv_C²（蓝）；毫安级面包板电路里电容储能占大头' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '从“飞轮惯性”到绕线螺线管 — 电感的物理结构与磁通剥壳',
      sync: at(L2, ['coil', 'core', 'flux'], { peel: 0.55, mu: 'ferrite', N: 200, idir: 1 }),
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎回到 Breadboard Lab。上一讲（W4-L1）我们认识了**电容**——它是用“电场”存能量的器件，最讨厌**电压**发生突变。今天，我们将迎来无源电路三大基本元件的最后一位主角，也是电容在电磁世界里的完美镜像——**电感（Inductor）**。如果说电容像一只蓄水池或一根弹簧，那么电感就像一块沉重的高速旋转飞轮：一旦电流转起来，你休想在一瞬间把它按停。准备好了吗？让我们从[[shell|剥开一颗电感的外壳]]开始。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**左侧舞台**：切换至「01 3D 色环/绕线电感封装与面包板插法」与「02 3D 线圈磁通透视与右手定则」，旋转观察[[tray_ring,shell|轴向色环电感（淡绿底色、略微鼓腹）]]与[[tray_drum|工字绕线电感]]的内部[[coil|漆包线匝数 $N$]] 及[[core|铁氧体磁芯]]。`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**面包板安全 · 感性瞬变**：严禁在未并联续流二极管（Flyback Diode）的情况下，用机械拨动开关或裸 MOSFET 直接切断携带大电流的感性负载（继电器线圈、大电感、直流电机）。电感电流无法瞬时归零，强行断路将产生数百至数千伏的负向反电动势尖峰（$v_L = L\,di/dt$），可能击穿半导体器件或在面包板触点处拉弧打火。在所有开关驱动的电感两端反向并联二极管（如 1N4148 快速二极管用于 $<150\text{ mA}$ 信号级，1N4007 整流管或 1N5819 肖特基二极管用于功率级），将断电瞬间的反向电压钳位在 $-0.7\text{ V}$（或 $-0.3\text{ V}$）以内。`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**面包板安全 · 饱和电流**：面包板常用的 0410/0510 [[tray_ring|轴向色环电感]]（外观极似 [[tray_res|1/4 W 碳膜电阻]]，底色通常为淡绿或湖蓝）受限于细漆包线与微小铁氧体磁芯，其额定饱和电流 $I_{\text{sat}}$ 通常仅为 $100\text{ mA}$–$300\text{ mA}$，直流寄生电阻 $R_{\text{DCR}}$ 可达 $1\ \Omega$–$30\ \Omega$。超过 $I_{\text{sat}}$ 后磁芯饱和，电感量 $L$ 骤降并剧烈发热。`,
        },
        { kind: 'p', text: '**1.1 物理直觉：为什么电流也有“惯性”？（Boylestad 飞轮类比）**' },
        {
          kind: 'p',
          text: '在力学里，质量越大的飞轮，启动它旋转越费劲；可一旦它高速转起来，想让它立刻刹停同样需要极大的制动力矩。电感在电路中扮演的正是**电气飞轮（Electrical Flywheel）**的角色：',
        },
        {
          kind: 'ul',
          items: [
            R`**电流 $i$ 对应飞轮转速 $\omega$**：只要电流流过[[coil|螺线管线圈]]，根据奥斯特电磁效应与[[rhr|**右手螺旋定则**]]（四指顺着线圈电流方向弯曲，大拇指指向线圈内部磁场 $\vec{B}$ 方向），线圈内部就会建立起[[flux|磁场]]。`,
            R`**电感量 $L$ 对应转动惯量 $J$**：电感量越大，建立相同电流所需的磁场能量越多，它反抗电流变化的“脾气”就越大。`,
            R`**工程防呆提醒（面包板实操）**：在实验室里，新手最容易把 [[tray_ring,shell|**0410 轴向色环电感**]] 误当成 [[tray_res|1/4 W 碳膜电阻]]！两者都有四道色环，但色环电感的底色通常是**淡绿色或湖蓝色**，两端呈轻微哑铃状鼓起，且读数单位是 **微亨（$\mu\text{H}$）** 而非欧姆。此外，绕线电感有两大隐形参数不可忽视：一是[[coil|漆包线]]本身的**直流寄生电阻 $R_{\text{DCR}}$**，二是[[core|磁芯]]的**饱和电流 $I_{\text{sat}}$**——当电流超过 $I_{\text{sat}}$ 时，铁氧体磁畴全部对齐饱和，磁导率 $\mu_r$ 暴跌，电感瞬间退化成一根发热的普通导线。`,
          ],
        },
        { kind: 'p', text: '**1.2 螺线管磁通剖面与右手定则示意**' },
        { kind: 'figure', svg: SVG_SOLENOID, caption: '图 1-2：螺线管电感物理结构与闭合磁通剖面（N 匝线圈 · 磁芯磁导率 μ = μ₀μᵣ）' },
        { kind: 'p', text: '**1.3 教授三段式板书推导：螺线管电感量公式与空心/磁芯对比**' },
        {
          kind: 'p',
          text: R`**例题 1.1**：绕制一个均匀长直螺线管，[[coil|匝数 $N = 200$ 匝]]，[[coil_dim|线圈半径 $r = 5\text{ mm}$，线圈长度 $\ell = 40\text{ mm}$]]。分别计算：（a）空心状态（$\mu_r = 1$）下的电感量 $L_{\text{air}}$；（b）插入相对磁导率 $\mu_r = 200$ 的[[core|铁氧体磁芯]]后的电感量 $L_{\text{ferrite}}$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`由安培环路定律（Ampère's Law），长直螺线管内部均匀磁感应强度 $B$ 与电流 $i$ 满足：$B = \mu \dfrac{N i}{\ell}, \quad \mu = \mu_0 \mu_r$ 穿过单匝线圈横截面积 $A$ 的[[flux|磁通量]]为 $\Phi = B A$，则 $N$ 匝线圈的总磁链（Flux Linkage）为 $\lambda = N \Phi$。根据电感的定义 $\lambda = L i$，即可消去电流 $i$ 得到仅由几何尺寸与磁芯材料决定的电感量。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式',
          tex: R`\lambda = N \Phi = N (B A) = N \left( \mu_0 \mu_r \frac{N i}{\ell} \right) A = \frac{N^2 \mu_0 \mu_r A}{\ell} \cdot i`,
        },
        { kind: 'formula', title: '因此，螺线管电感量的纯符号通式为：', tex: R`L = \frac{N^2 \mu_0 \mu_r A}{\ell} = \frac{N^2 \mu_0 \mu_r (\pi r^2)}{\ell}` },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简：已知真空磁导率 $\mu_0 = 4\pi \times 10^{-7}\text{ H/m}$，$N = 200$，$r = 5 \times 10^{-3}\text{ m}$，$\ell = 4 \times 10^{-2}\text{ m}$：`,
          steps: [
            {
              label: '步骤 1',
              text: R`计算横截面积 $A$`,
              tex: R`A = \pi r^2 = \pi \times (5 \times 10^{-3})^2 = 25\pi \times 10^{-6}\text{ m}^2 \approx 7.854 \times 10^{-5}\text{ m}^2`,
            },
            {
              label: '步骤 2',
              text: R`空心电感量 $\mu_r = 1$`,
              tex: R`L_{\text{air}} = \frac{200^2 \times (4\pi \times 10^{-7}) \times 1 \times (25\pi \times 10^{-6})}{4 \times 10^{-2}} = \frac{4 \times 10^4 \times 100\pi^2 \times 10^{-13}}{4 \times 10^{-2}} = 10^{-5}\pi^2\text{ H} \approx 98.70\text{ }\mu\text{H}`,
            },
            {
              label: '步骤 3',
              text: R`插入铁氧体磁芯 $\mu_r = 200$`,
              tex: R`L_{\text{ferrite}} = \mu_r \cdot L_{\text{air}} = 200 \times 98.696\text{ }\mu\text{H} = 19\,739.2\text{ }\mu\text{H} \approx 19.74\text{ mH}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授点评**：看到了吗？同一副线圈，插进一根[[core|铁氧体磁芯]]，电感量直接放大 200 倍，从微亨级跃升到接近 $20\text{ mH}$！同时请牢记 $L \propto N^2$：匝数翻倍，电感量不是翻倍，而是变为 **4 倍**——因为匝数翻倍既让磁场 $B$ 翻倍，又让切割磁通的线圈数翻倍。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '电磁感应的微积分伏安关系 — 从电流斜率到电压波形',
      sync: at(L3, ['i_wave', 'v_wave'], { ...EX21, tc: 1 }),
      blocks: [
        {
          kind: 'note',
          tone: 'tip',
          text: R`**左侧舞台**：「03 2D 原理图与 i(t)↔v(t) 波形及反电动势续流演示」——拖动[[cursor|时间轴]]观察电流上升段、[[plateau|恒流平台段]]与急速下降段对应的[[v_wave|感应电压极性]]。`,
        },
        { kind: 'p', text: '**2.1 法拉第电磁感应定律与被动参考方向**' },
        {
          kind: 'formula',
          title: R`在电路分析中，我们采用**被动参考方向（Passive Sign Convention）**：电流 $i(t)$ 从电感电压 $v(t)$ 的正极（$+$）流入、负极（$-$）流出。根据法拉第电磁感应定律 $v = \frac{d\lambda}{dt}$，结合线性电感 $\lambda = L i$，立得电感最核心的**微分伏安关系**：`,
          tex: R`v(t) = L \frac{di(t)}{dt}`,
        },
        { kind: 'formula', title: R`将两端从初始时刻 $t_0$ 积分到当前时刻 $t$，得到电感的**积分记忆形式**：`, tex: R`i(t) = \frac{1}{L} \int_{t_0}^{t} v(\tau)\,d\tau + i(t_0)` },
        { kind: 'p', text: '这两条公式背后藏着两条决定整个电路分析命运的铁律：' },
        {
          kind: 'ol',
          items: [
            R`**直流稳态等效为短路**：若流过电感的电流是恒定直流（$i(t) = I_{\text{DC}}$），则 $\frac{di}{dt} = 0 \implies v(t) = 0\text{ V}$。两端压降为零却能通过任意恒定电流——这正是[[plateau|**理想导线（短路）**]]的定义！`,
            R`**电感电流不能发生瞬时突变**：若电流在 $\Delta t \to 0$ 内跳变，则 $\frac{di}{dt} \to \infty$，需要无穷大的端电压，这在物理上不可能。因此，在任何有限电压激励下，[[i_wave|电感电流必须连续]]：$i_L(t_0^+) = i_L(t_0^-)$。`,
          ],
        },
        { kind: 'p', text: R`**2.2 分段 $i(t)$ 与 $v(t) = L\frac{di}{dt}$ 波形对齐图**` },
        { kind: 'figure', svg: SVG_WAVES, caption: '图 2-2：电感伏安波形对齐（L = 10 mH）：上盘 i(t) 斜率直接决定下盘 v(t) = L·di/dt' },
        { kind: 'p', text: '**2.3 教授三段式板书推导：微分求电压与积分求电流**' },
        {
          kind: 'p',
          text: R`**例题 2.1（微分求分段电压）**：已知电感 $L = 10\text{ mH}$，流过它的分段线性电流 [[i_wave|$i(t)$]] 如上图所示：在 $0 \le t < 2\text{ ms}$ 内由 $0$ 线性升至 $40\text{ mA}$；在 $2\text{ ms} \le t < 5\text{ ms}$ 保持 $40\text{ mA}$ 不变；在 $5\text{ ms} \le t < 6\text{ ms}$ 内由 $40\text{ mA}$ 线性降至 $0$。求各时间段的感应电压 [[v_wave|$v(t)$]]。`,
        },
        { kind: 'origin', title: '① 公理溯源', text: R`在被动参考方向下，理想电感端电压与电流变化率成正比，满足 $v(t) = L \frac{di(t)}{dt}$。` },
        { kind: 'formula', title: R`② 纯符号通式：对于任意线性段 $[t_a, t_b]$，若电流由 $I_a$ 线性变至 $I_b$，则：`, tex: R`v(t) = L \frac{I_b - I_a}{t_b - t_a}` },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（$L = 10 \times 10^{-3}\text{ H}$）：`,
          steps: [
            {
              label: '区间 1',
              text: R`$0 < t < 2\text{ ms}$`,
              tex: R`v_1 = (10 \times 10^{-3}) \times \frac{40 \times 10^{-3} - 0}{2 \times 10^{-3} - 0} = 10^{-2} \times 20 = +0.2\text{ V} = +200\text{ mV}`,
            },
            {
              label: '区间 2',
              text: R`$2\text{ ms} < t < 5\text{ ms}$`,
              tex: R`v_2 = (10 \times 10^{-3}) \times \frac{40 \times 10^{-3} - 40 \times 10^{-3}}{3 \times 10^{-3}} = 0\text{ V}`,
            },
            {
              label: '区间 3',
              text: R`$5\text{ ms} < t < 6\text{ ms}$`,
              tex: R`v_3 = (10 \times 10^{-3}) \times \frac{0 - 40 \times 10^{-3}}{1 \times 10^{-3}} = 10^{-2} \times (-40) = -0.4\text{ V} = -400\text{ mV}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**关键洞察**：注意看[[v_wave|下盘图形]]！电流 $i(t)$ 是连续的，但电压 $v(t)$ 却可以在 $t = 0, 2, 5, 6\text{ ms}$ 处发生**垂直阶跃跳变**。并且，电感电压的正负面积恰好抵消：$(+200\text{ mV})(2\text{ ms}) + (-400\text{ mV})(1\text{ ms}) = 0$，这保证了 $t = 6\text{ ms}$ 时电流精准回到 $0$！`,
        },
        {
          kind: 'p',
          text: R`**例题 2.2（积分求衰减电压下的电流）**：若一个 $L = 20\text{ mH}$ 的电感初始电流 $i(0) = 100\text{ mA}$，在 $t \ge 0$ 时两端施加衰减电压 $v(t) = 6e^{-500t}\text{ V}$。求 $i(t)$ 的解析式、$t = 2\text{ ms}$ 时的电流值以及 $t \to \infty$ 时的稳态电流与最终磁场储能。`,
        },
        { kind: 'origin', title: '① 公理溯源', text: R`由 $v(t) = L\frac{di}{dt}$ 两端积分，得电感的积分记忆伏安关系。` },
        {
          kind: 'formula',
          title: R`② 纯符号通式：对于指数电压 $v(t) = V_0 e^{-\alpha t}$：`,
          tex: R`i(t) = i(0) + \frac{1}{L}\int_{0}^{t} V_0 e^{-\alpha \tau}\,d\tau = i(0) + \frac{V_0}{\alpha L}\left(1 - e^{-\alpha t}\right)`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（$L = 0.02\text{ H}, V_0 = 6\text{ V}, \alpha = 500\text{ s}^{-1}, i(0) = 0.1\text{ A}$）：`,
          steps: [
            { label: '步骤 1', tex: R`\frac{V_0}{\alpha L} = \frac{6}{500 \times 0.02} = \frac{6}{10} = 0.6\text{ A}` },
            { label: '步骤 2', tex: R`i(t) = 0.1 + 0.6\left(1 - e^{-500t}\right) = 0.7 - 0.6e^{-500t}\text{ A} \quad (t \ge 0)` },
            { label: '步骤 3', text: R`当 $t = 2\text{ ms} = 0.002\text{ s}$ 时：$500t = 1$，$i(2\text{ ms}) = 0.7 - 0.6 e^{-1} \approx 0.7 - 0.2207 = 0.4793\text{ A}$。` },
            {
              label: '步骤 4',
              text: R`当 $t \to \infty$ 时：$e^{-500t} \to 0$，故 $i(\infty) = 0.7\text{ A}$，最终磁场储能 $w(\infty) = \frac{1}{2} L i^2(\infty) = \frac{1}{2}(0.02)(0.7)^2 = 4.90\text{ mJ}$。`,
            },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '磁场储能、水锤效应与续流二极管保护',
      sync: at(L3, ['relay_coil', 'kick_sw', 'flyback_d'], { wmode: 'kick', sw: 'closed', diode: false }),
      blocks: [
        {
          kind: 'note',
          tone: 'tip',
          text: R`**左侧舞台**：保持在「03 2D 原理图与 i(t)↔v(t) 波形及反电动势续流演示」，点击“[[kick_sw|断开开关]]”按钮，对比未加保护时的 [[spark|$-2000\text{ V}$ 电弧击穿]]与并联 1N4007 [[flyback_d|续流二极管]]后的安全续流。`,
        },
        { kind: 'p', text: '**3.1 磁场储能公式推导（三段式板书）**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`在被动参考方向下，电感吸收的瞬时电功率为 $p(t) = v(t)i(t)$。理想电感不消耗热能，所有吸收的能量全部转化为线圈周围空间及磁芯中的**磁场能** $w_L(t) = \int_{-\infty}^{t} p(\tau)\,d\tau$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：将 $v = L\frac{di}{dt}$ 代入功率积分（设初始电流 $i(-\infty) = 0$）：`,
          tex: R`w_L(t) = \int_{-\infty}^{t} \left(L\frac{di}{d\tau}\right) i\,d\tau = L \int_{0}^{i(t)} i'\,di' = \frac{1}{2} L i^2(t)`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简：以例题 2.1 中 $L = 10\text{ mH}$ 电感在恒流平台段（$i = 40\text{ mA}$）为例，其峰值磁场储能为：`,
          steps: [
            {
              label: '峰值储能',
              tex: R`w_{\max} = \frac{1}{2} (10 \times 10^{-3}) (40 \times 10^{-3})^2 = 5 \times 10^{-3} \times 1.6 \times 10^{-3} = 8.00 \times 10^{-6}\text{ J} = 8.00\text{ }\mu\text{J}`,
            },
          ],
        },
        { kind: 'p', text: '**3.2 水锤效应与断电反电动势（Inductive Kickback）**' },
        {
          kind: 'p',
          text: 'Boylestad 在第 11 章用了一个极佳的工程比喻：**水锤效应（Water Hammer）**。当消防水龙带里高速奔涌的水流被瞬间砸死阀门时，水流巨大的动量无处释放，会在阀门处撞出极高的瞬间水压，甚至震裂钢管。',
        },
        {
          kind: 'calc',
          title: R`在电路里，如果你用一个[[kick_sw|开关]]强行切断正在流过 $I_0 = 200\text{ mA}$ 电流的 $L = 10\text{ mH}$ [[relay_coil|继电器线圈]]，假设触点在 $\Delta t = 1\text{ }\mu\text{s}$ 内强行断开：`,
          steps: [{ label: '反电动势', tex: R`v_L = L \frac{\Delta i}{\Delta t} = (10 \times 10^{-3}) \times \frac{0 - 0.2}{1 \times 10^{-6}} = -2000\text{ V}` }],
        },
        {
          kind: 'p',
          text: R`**负两千伏！** 电感为了维持电流继续向下流动，会瞬间翻转自身极性（下正上负），在开关两端叠加出超过 $2000\text{ V}$ 的[[spark|高压尖峰]]，直接击穿驱动它的 MOSFET 或在面包板机械开关触点间拉出蓝白色电弧。`,
        },
        { kind: 'p', text: R`**工程救星——[[flyback_d|续流二极管（Flyback Diode / Freewheeling Diode）]]**：` },
        { kind: 'p', text: '解决方法极其优雅：在电感两端**反向并联**一只二极管（阴极接正电源，阳极接开关端）。' },
        {
          kind: 'ul',
          items: [
            '**开关闭合正常供电时**：二极管承受反向电压，处于截止状态，完全不干涉电路。',
            R`**开关突然断开瞬间**：电感企图向下维持电流并产生负向反电动势，此时二极管立刻**正向导通**！它为电感里的 $200\text{ mA}$ 电流提供了一条闭合的“环形跑道”，把反向电压死死钳位在 $-V_D \approx -0.7\text{ V}$，让磁场储能 $\frac{1}{2}LI_0^2$ 平缓地消耗在二极管压降与线圈内阻 $R_{\text{DCR}}$ 上。`,
          ],
        },
        { kind: 'p', text: '**3.3 开关断开瞬间反电动势打火 vs 续流二极管保护回路**' },
        { kind: 'figure', svg: SVG_KICK, caption: '图 3-3：感性负载断电瞬间对比（L = 10 mH，I₀ = 200 mA，开关断开 Δt = 1 μs）：无续流二极管打火 vs 反并 1N4007 钳位' },
      ],
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '电感的串并联等效与电容—电感完整对偶律',
      sync: at(L1, ['couple_pair'], { cam: 'couple', couple: 'ortho' }),
      blocks: [
        {
          kind: 'note',
          tone: 'tip',
          text: R`**左侧舞台**：切换回「01 3D 色环/绕线电感封装与面包板插法」，注意观察面包板上[[couple_pair|两颗相邻电感保持正交或适当间距]]以尽量避免磁通互感耦合（$M \approx 0$）。`,
        },
        { kind: 'p', text: '**4.1 串并联等效公式（与电阻完全同构）**' },
        { kind: 'p', text: '当多个电感之间没有磁耦合（无互感）时，用 KVL 和 KCL 即可立证：' },
        {
          kind: 'formula',
          title: R`**电感串联**（共用同一电流 $i$，电压相加）：`,
          tex: R`v = v_1 + v_2 + \dots + v_n = (L_1 + L_2 + \dots + L_n)\frac{di}{dt} \implies L_{\text{eq,s}} = \sum_{k=1}^{n} L_k`,
        },
        {
          kind: 'formula',
          title: R`**电感并联**（共用同一电压 $v$，电流相加）：`,
          tex: R`i = \sum_{k=1}^{n} \frac{1}{L_k}\int v\,dt \implies \frac{1}{L_{\text{eq,p}}} = \sum_{k=1}^{n} \frac{1}{L_k}`,
        },
        { kind: 'p', text: R`对于两只电感并联：$L_{\text{eq,p}} = \frac{L_1 L_2}{L_1 + L_2}$。` },
        { kind: 'note', tone: 'tip', text: '**防混淆记忆法**：**电感串并联像电阻（串加并倒），电容串并联反着来（并加串倒）**！' },
        { kind: 'p', text: '**4.2 混联电感网络化简示意**' },
        { kind: 'figure', svg: SVG_NET, caption: '图 4-2：无互感混联电感网络化简：L₁ = 4 mH，L₂ = 6 mH，L₃ = 8 mH，L₄ = 4 mH' },
        { kind: 'p', text: '**4.3 教授三段式板书推导：混联电感等效计算**' },
        { kind: 'origin', title: '① 公理溯源', text: R`无互感电感串联满足 $L_{\text{eq,s}} = \sum L_k$，并联满足 $\frac{1}{L_{\text{eq,p}}} = \sum \frac{1}{L_k}$。` },
        {
          kind: 'formula',
          title: R`② 纯符号通式：由拓扑结构，先串 $L_3, L_4$，再与 $L_2$ 并联，最后与 $L_1$ 串联：`,
          tex: R`L_{\text{eq}} = L_1 + \frac{L_2 (L_3 + L_4)}{L_2 + (L_3 + L_4)}`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（$L_1 = 4\text{ mH}, L_2 = 6\text{ mH}, L_3 = 8\text{ mH}, L_4 = 4\text{ mH}$）：`,
          steps: [
            { label: '步骤 1', tex: R`L_{34} = L_3 + L_4 = 8 + 4 = 12\text{ mH}` },
            { label: '步骤 2', tex: R`L_{234} = L_2 \parallel L_{34} = \frac{6 \times 12}{6 + 12} = \frac{72}{18} = 4\text{ mH}` },
            { label: '步骤 3', tex: R`L_{\text{eq}} = L_1 + L_{234} = 4 + 4 = 8\text{ mH}` },
          ],
        },
        { kind: 'p', text: '**4.4 电容与电感完整对偶表（Alexander & Sadiku Table 6.1 精编）**' },
        { kind: 'p', text: '把下面这张表刻进脑海里，后面学一阶、二阶动态电路时，你只需记一半公式，另一半自动对偶推导：' },
        {
          kind: 'table',
          head: ['对比维度', R`电容（Capacitor, $C$）`, R`电感（Inductor, $L$）`],
          rows: [
            ['**物理储能形式**', R`电场能（两极板间电场 $\vec{E}$）`, R`磁场能（线圈与磁芯内磁场 $\vec{B}$）`],
            ['**微分伏安关系**', R`$i = C\dfrac{dv}{dt}$`, R`$v = L\dfrac{di}{dt}$`],
            [
              '**积分伏安关系**',
              R`$v(t) = \dfrac{1}{C}\displaystyle\int_{t_0}^{t} i(\tau)\,d\tau + v(t_0)$`,
              R`$i(t) = \dfrac{1}{L}\displaystyle\int_{t_0}^{t} v(\tau)\,d\tau + i(t_0)$`,
            ],
            ['**储能公式**', R`$w_C = \dfrac{1}{2} C v^2$`, R`$w_L = \dfrac{1}{2} L i^2$`],
            ['**直流稳态等效**', R`**开路（Open Circuit，$i_C = 0$）**`, R`**短路（Short Circuit，$v_L = 0$）**`],
            ['**不能突变的物理量**', R`**电压 $v_C$ 不能突变**`, R`**电流 $i_L$ 不能突变**`],
            ['**串联等效公式**', R`$\dfrac{1}{C_{\text{eq,s}}} = \dfrac{1}{C_1} + \dfrac{1}{C_2}$（同并联电阻）`, R`$L_{\text{eq,s}} = L_1 + L_2$（同串联电阻）`],
            ['**并联等效公式**', R`$C_{\text{eq,p}} = C_1 + C_2$（同串联电阻）`, R`$\dfrac{1}{L_{\text{eq,p}}} = \dfrac{1}{L_1} + \dfrac{1}{L_2}$（同并联电阻）`],
            ['**力学直觉类比**', '弹性弹簧 / 蓄水池', '高速旋转飞轮 / 管道水锤惯性'],
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '直流稳态混合网络分析 — 电容开路与电感短路实战',
      sync: at(L4, ['ind_l', 'cap_c'], { dcView: 'orig' }),
      blocks: [
        {
          kind: 'note',
          tone: 'tip',
          text: R`**左侧舞台**：切换至「04 直流稳态（电容开路 + 电感短路）混合分析台」，点击“进入直流稳态（t → ∞）”按钮，观察 [[cap_c|$C$ 化为断开端点]]、[[ind_l|$L$ 化为绿色短接线]]，以及 [[r4|$R_4$ 支路电流清零]]的瞬间。`,
        },
        { kind: 'p', text: '**5.1 直流稳态混合电路四步法**' },
        {
          kind: 'p',
          text: R`当一个包含电阻 $R$、电感 $L$ 与电容 $C$ 的电路在恒定直流电源下运行足够长时间达到**直流稳态（DC Steady State）**时，所有电压电流不再随时间变化（$\frac{dv}{dt} = 0, \frac{di}{dt} = 0$）：`,
        },
        {
          kind: 'ol',
          items: [
            R`**电容换开路**：把每个[[cap_c|电容]]替换为断路，但务必保留两端标号以标注待求电压 $v_C$。`,
            R`**电感换短路**：把每个[[ind_l|电感]]替换为理想导线，并标出待求支路电流 $i_L$ 的方向。`,
            R`**求解纯电阻直流网络**：利用欧姆定律、分压/分流或节点分析求 $v_C$ 与 $i_L$。**特别留意与开路电容串联的电阻**：该支路电流为零，电阻上压降也为零！`,
            R`**代回计算磁电总储能**：$w_L = \frac{1}{2}Li_L^2$，$w_C = \frac{1}{2}Cv_C^2$，$w_{\text{total}} = w_L + w_C$。`,
          ],
        },
        { kind: 'p', text: R`**5.2 含 $R, L, C$ 直流稳态等效替换图**` },
        { kind: 'figure', svg: SVG_DC_TASK, caption: '图 5-2：直流稳态等效替换（例题 5.1 的待求量先留作“?”，第 6 幕的引导例题通关后揭晓）' },
        { kind: 'p', text: R`**5.3 教授三段式板书推导：含 $R, L, C$ 直流稳态例题完整求解**` },
        {
          kind: 'p',
          text: R`**例题 5.1**：在如上所示的面包板安全级电路中，$V_s = 9\text{ V}$，$R_1 = 100\text{ }\Omega$，$R_2 = 300\text{ }\Omega$，$R_3 = 150\text{ }\Omega$，$R_4 = 200\text{ }\Omega$，$L = 20\text{ mH}$，$C = 10\text{ }\mu\text{F}$。求直流稳态下的[[i_l|电感电流 $i_L$]]、[[v_c|电容电压 $v_C$]]、以及电路总储能 $w_{\text{total}}$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`在直流稳态下，$\frac{di_L}{dt} = 0 \implies v_L = 0$（[[ind_l|电感等效为短路]]）；$\frac{dv_C}{dt} = 0 \implies i_C = 0$（[[cap_c|电容等效为开路]]）。由 KCL，[[r4|$R_4$]] 与电容 $C$ 串联，故 $i_{R4} = i_C = 0$，由欧姆定律 $v_{R4} = i_{R4} R_4 = 0$，因此电容电压直接等于[[node_a|节点 $A$]] 对地电压 $v_C = v_A$。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式',
          tex: R`\begin{gathered} R_{23} = \frac{R_2 R_3}{R_2 + R_3}, \qquad v_A = V_s \cdot \frac{R_{23}}{R_1 + R_{23}} \\[8pt] v_C = v_A, \qquad i_L = \frac{v_A}{R_3} \\[8pt] w_L = \frac{1}{2} L i_L^2, \qquad w_C = \frac{1}{2} C v_C^2, \qquad w_{\text{total}} = w_L + w_C \end{gathered}`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '③ 代入数值这一步先不写：第 6 幕的苏格拉底引导例题就是这道题。自己闯关之后，完整求解作为“通关复盘”板书紧跟在引导例题后面；左侧 01 面包板与 04 分析台上的例题 5.1 数值，也会等你闯到哪一步才亮出哪一步。',
        },
        {
          kind: 'table',
          head: ['面包板安全与缩放规范', '本课取值'],
          rows: [
            ['供电电压范围', '5 V – 12 V（教学例题默认 9 V：台式可调直流电源（9 V））'],
            ['电阻功耗上限', '0.25 W（1/4 W 碳膜电阻，逐颗核算 $P = I^2R$）'],
            ['目标电感电流', R`10 mA – 50 mA（远低于色环电感 $I_{\text{sat}}$）`],
            ['推荐实验电感', '10 mH / 20 mH 轴向色环电感或工字功率电感（标注额定电流 ≥ 200 mA）'],
          ],
          caption: '本课阻值已是百欧级、电流为毫安级（最小 100 Ω，不低于 100 Ω），无需 1000× 等比缩放，按原数值上板。',
        },
      ],
    },
    /* ---------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式分步引导实战、诊断测验与工程落地',
      sync: at(L4, ['node_a', 'ind_l', 'cap_c'], { dcView: 'dc' }),
      blocks: [
        {
          kind: 'note',
          tone: 'tip',
          text: '**左侧舞台**：保持「04 直流稳态（电容开路 + 电感短路）混合分析台」，学生每完成一个苏格拉底引导步骤，左侧电路自动高亮对应节点、支路电流与储能条形图。',
        },
        { kind: 'p', text: '**苏格拉底式分步引导例题（5 步完整交互剧本）**' },
        {
          kind: 'guided',
          title: R`含 R-L-C 混合网络直流稳态求解（$i_L$、$v_C$ 与总储能）`,
          source: '本课例题 5.1 · 面包板安全级 R-L-C 混合电路（Sadiku Section 6.4–6.5 直流稳态等效）',
          problem: R`**例题 5.1**：在如图所示的面包板安全级电路中，$V_s = 9\text{ V}$，$R_1 = 100\text{ }\Omega$，$R_2 = 300\text{ }\Omega$，$R_3 = 150\text{ }\Omega$，$R_4 = 200\text{ }\Omega$，$L = 20\text{ mH}$，$C = 10\text{ }\mu\text{F}$。求直流稳态下的电感电流 $i_L$、电容电压 $v_C$、以及电路总储能 $w_{\text{total}}$。`,
          problem_svg: SVG_GD_PROBLEM,
          done_params: { ex51: 5, dcView: 'dc' },
          steps: [
            {
              title: '第 1 步：直流稳态元件等效替换',
              mini_svg: MINI_STEP1,
              question: R`电路已接通 9 V 直流电源很长时间达到稳态。我们要把图中的[[ind_l|电感 $L$（20 mH）]]和[[cap_c|电容 $C$（10 μF）]]分别替换为什么等效模型？`,
              hint: R`$v_L = L\frac{di_L}{dt} = 0 \implies \text{短路}, \quad i_C = C\frac{dv_C}{dt} = 0 \implies \text{开路}$`,
              options: [
                {
                  text: R`$L$ 换为短路（$v_L = 0$），$C$ 换为开路（$i_C = 0$）`,
                  correct: true,
                  feedback: R`完全正确！直流下电流恒定，$v_L = L\,di/dt = 0$（短路）；电压恒定，$i_C = C\,dv/dt = 0$（开路）。`,
                },
                {
                  text: R`$L$ 换为开路（$i_L = 0$），$C$ 换为短路（$v_C = 0$）`,
                  correct: false,
                  feedback: '哎呀，把对偶关系记反啦！想想看：电容中间隔着绝缘介质，直流根本过不去，所以电容才是开路；电感本质是一卷铜线，直流畅通无阻，所以电感是短路。',
                },
                {
                  text: R`$L$ 和 $C$ 都换为短路`,
                  correct: false,
                  feedback: R`如果电容在直流下也是短路，台式可调直流电源（9 V）接上电容不就立刻炸短路了吗？再检查一下 $i_C = C\,dv/dt$。`,
                },
                { text: R`$L$ 和 $C$ 都换为开路`, correct: false, feedback: '电感是一卷绕好的铜漆包线，稳态直流电流完全可以顺利流过，它不会变成开路哦。' },
              ],
              board: [R`\text{步骤 1：直流稳态下 } L \to \text{短路 } (v_L = 0), \quad C \to \text{开路 } (i_C = 0)`],
              halo: ['ind_l', 'cap_c'],
              params: { ex51: 0, dcView: 'orig' },
              layer: L4,
            },
            {
              title: '第 2 步：识破 R₄ 支路陷阱',
              mini_svg: MINI_STEP2,
              question: R`电容 $C$ 变为开路后，与它串联的[[r4|电阻 $R_4 = 200\ \Omega$]] 中流过多少电流？它对[[node_a|节点 A]] 的等效电阻有没有贡献？`,
              hint: R`$i_{R_4} = i_C = 0 \implies v_{R_4} = 0\text{ V} \implies v_C = v_A$`,
              options: [
                {
                  text: R`$i_{R4} = 0\text{ A}$，$R_4$ 上压降为 $0\text{ V}$，故 $v_C = v_A$ 且 $R_4$ 不参与并联`,
                  correct: true,
                  feedback: R`漂亮！一针见血。开路支路没有电流，串联在里面的 $R_4$ 就像一根没有压降的延长线，因此电容两端的开路电压直接等于节点 A 的电位 $v_A$。`,
                },
                {
                  text: R`$R_4$ 与 $R_2$、$R_3$ 三者并联，一起分担节点 A 电流`,
                  correct: false,
                  feedback: R`小心！$R_4$ 的另一端悬空在开路电容上，电流根本流不过去，所以它绝不能并进等效电阻里。`,
                },
                {
                  text: R`$i_{R4} = 9\text{ V} / 200\ \Omega = 45\text{ mA}$，故 $v_C = 0\text{ V}$`,
                  correct: false,
                  feedback: R`支路已经断开，怎么可能还有 $45\text{ mA}$ 的电流呢？用欧姆定律 $v_{R4} = i_{R4} \cdot R_4$ 再算一遍。`,
                },
              ],
              board: [R`\text{步骤 2：} i_{R_4} = 0 \implies v_{R_4} = 0, \quad v_C = v_A`],
              halo: ['r4', 'cap_c'],
              params: { ex51: 1, dcView: 'dc' },
              layer: L4,
            },
            {
              title: '第 3 步：求解节点 A 电压与电容电压 v_C',
              mini_svg: MINI_STEP3,
              question: R`剔除开路支路后，[[node_a|节点 A]] 对地只剩 [[r2|$R_2 = 300\ \Omega$]] 与 [[r3|$R_3 = 150\ \Omega$]] 并联，再与 [[r1|$R_1 = 100\ \Omega$]] 串联接 9 V 电源。请算出 $v_A$（即 $v_C$）。`,
              hint: R`$R_{23} = \frac{300 \times 150}{300 + 150} = 100\,\Omega, \quad v_A = 9 \times \frac{R_{23}}{R_1 + R_{23}}$`,
              options: [
                { text: R`$v_C = 3.0\text{ V}$`, correct: false, feedback: R`再核对一下并联电阻：$300\ \Omega$ 与 $150\ \Omega$ 并联等于 $100\ \Omega$，不是 $50\ \Omega$ 哦。` },
                {
                  text: R`$v_C = 4.5\text{ V}$`,
                  correct: true,
                  feedback: R`精准！$R_2 \parallel R_3 = (300\times150)/(300+150) = 100\ \Omega$，恰好与 $R_1 = 100\ \Omega$ 形成 1:1 对半分压，$v_A = v_C = 4.5\text{ V}$。`,
                },
                {
                  text: R`$v_C = 6.0\text{ V}$`,
                  correct: false,
                  feedback: R`如果 $v_A = 6.0\text{ V}$，那意味着 $R_2 \parallel R_3 = 200\ \Omega$，这比单个 $150\ \Omega$ 电阻还大，违背了并联越并越小的铁律！`,
                },
                { text: R`$v_C = 9.0\text{ V}$`, correct: false, feedback: R`电源前面还串着 $R_1 = 100\ \Omega$ 呢，它要分走一半电压。` },
              ],
              board: [R`\text{步骤 3：} R_{23} = 100\,\Omega \implies v_C = v_A = 9 \times \frac{100}{100 + 100} = 4.5\text{ V}`],
              halo: ['node_a', 'r1', 'r2', 'r3'],
              params: { ex51: 2, dcView: 'dc' },
              layer: L4,
            },
            {
              title: '第 4 步：求解电感稳态电流 i_L',
              mini_svg: MINI_STEP4,
              question: R`既然节点 A 电压为 $4.5\text{ V}$，且[[ind_l|电感 $L$]] 已等效为短路直接连着 [[r3|$R_3 = 150\ \Omega$]] 到地，流过电感的稳态电流 $i_L$ 是多少？`,
              hint: R`$i_L = \frac{v_A}{R_3} = \frac{4.5\text{ V}}{150\,\Omega}$`,
              options: [
                {
                  text: R`$i_L = 15\text{ mA}$`,
                  correct: false,
                  feedback: R`$15\text{ mA}$ 是流过 $R_2 = 300\ \Omega$ 的电流，电感 $L$ 串联在 $R_3 = 150\ \Omega$ 这条支路上哦。`,
                },
                {
                  text: R`$i_L = 30\text{ mA}$`,
                  correct: true,
                  feedback: R`太棒了！$i_L = v_A / R_3 = 4.5\text{ V} / 150\ \Omega = 0.030\text{ A} = 30\text{ mA}$。同时顺手验证 KCL：$15\text{ mA} + 30\text{ mA} = 45\text{ mA} = I_s$，严丝合缝！`,
                },
                { text: R`$i_L = 45\text{ mA}$`, correct: false, feedback: R`$45\text{ mA}$ 是电源输出的总电流 $I_s$，到节点 A 后会分流给 $R_2$ 和 $R_3$。` },
                {
                  text: R`$i_L = 60\text{ mA}$`,
                  correct: false,
                  feedback: R`你是不是误用 $9\text{ V}$ 直接除以 $150\ \Omega$ 了？节点 A 的电压是 $4.5\text{ V}$，不是 $9\text{ V}$。`,
                },
              ],
              board: [R`\text{步骤 4：} i_L = \frac{4.5}{150} = 30\text{ mA} \quad (\text{远低于色环电感 } I_{\text{sat}})`],
              halo: ['ind_l', 'r3', 'i_l'],
              params: { ex51: 3, dcView: 'dc' },
              layer: L4,
            },
            {
              title: '第 5 步：计算磁场储能 w_L、电场储能 w_C 与总储能',
              mini_svg: MINI_STEP5,
              question: R`最后一步！已知 $L = 20\text{ mH}$，$i_L = 30\text{ mA}$，$C = 10\ \mu\text{F}$，$v_C = 4.5\text{ V}$。电路储存的总能量 $w_{\text{total}} = w_L + w_C$ 是多少？`,
              hint: R`$w_L = \frac{1}{2}(20\times 10^{-3})(30\times 10^{-3})^2, \quad w_C = \frac{1}{2}(10\times 10^{-6})(4.5)^2$`,
              options: [
                {
                  text: R`$w_L = 9.00\ \mu\text{J}$，$w_C = 101.25\ \mu\text{J}$，$w_{\text{total}} = 110.25\ \mu\text{J}$`,
                  correct: true,
                  feedback: '满分通关！你已经彻底打通了电容与电感在直流稳态下的协同分析与储能计算。',
                },
                {
                  text: R`$w_L = 18.00\ \mu\text{J}$，$w_C = 202.50\ \mu\text{J}$，$w_{\text{total}} = 220.50\ \mu\text{J}$`,
                  correct: false,
                  feedback: R`哎呀，忘记乘以公式前面那个 $1/2$ 系数啦！不管是 $\frac{1}{2}Li^2$ 还是 $\frac{1}{2}Cv^2$，前面都有 $1/2$。`,
                },
                {
                  text: R`$w_L = 90.00\ \mu\text{J}$，$w_C = 101.25\ \mu\text{J}$，$w_{\text{total}} = 191.25\ \mu\text{J}$`,
                  correct: false,
                  feedback: R`检查一下单位换算：$(30\text{ mA})^2 = (3\times10^{-2})^2 = 9\times10^{-4}\text{ A}^2$，再乘 $\frac{1}{2}\times20\times10^{-3}\text{ H}$ 等于 $9\times10^{-6}\text{ J} = 9\ \mu\text{J}$，不是 $90\ \mu\text{J}$。`,
                },
                {
                  text: R`$w_L = 9.00\ \mu\text{J}$，$w_C = 22.50\ \mu\text{J}$，$w_{\text{total}} = 31.50\ \mu\text{J}$`,
                  correct: false,
                  feedback: R`计算电场储能时，$4.5\text{ V}$ 要平方哦（$4.5^2 = 20.25$），不能直接乘 $4.5$。`,
                },
              ],
              board: [R`\text{步骤 5：} w_L = 9.00\,\mu\text{J}, \quad w_C = 101.25\,\mu\text{J} \implies w_{\text{total}} = 110.25\,\mu\text{J}`],
              halo: ['e_bar', 'ind_l', 'cap_c'],
              params: { ex51: 4, dcView: 'dc' },
              layer: L4,
            },
          ],
          conclusion: R`通关！直流稳态下 $L$ 短路、$C$ 开路，$R_4$ 支路没有电流：$v_C = v_A = 4.5\text{ V}$，$i_L = 30\text{ mA}$，$w_L = 9.00\ \mu\text{J}$、$w_C = 101.25\ \mu\text{J}$，$w_{\text{total}} = 110.25\ \mu\text{J}$。左侧 01 面包板与 04 分析台上的例题 5.1 数值已经揭晓，下面的通关复盘把这道题的板书完整写一遍。`,
        },
        { kind: 'p', text: '**通关复盘 · 三段式推导（例题 5.1 完整求解）**' },
        { kind: 'figure', svg: SVG_DC, caption: '图 5-2（揭晓）：直流稳态等效替换——V_s = 9 V，R₁ = 100 Ω，R₂ = 300 Ω，R₃ = 150 Ω，R₄ = 200 Ω，L = 20 mH，C = 10 μF' },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '步骤 1', text: '**并联支路等效电阻**', tex: R`R_{23} = \frac{300 \times 150}{300 + 150} = \frac{45\,000}{450} = 100\text{ }\Omega` },
            { label: '步骤 2', text: R`**节点 $A$ 电压与电容电压 $v_C$**（精确 1:1 分压）`, tex: R`v_C = v_A = 9 \times \frac{100}{100 + 100} = 4.5\text{ V}` },
            {
              label: '步骤 3',
              text: R`**总电流与电感电流 $i_L$**`,
              tex: R`I_s = \frac{9}{100 + 100} = 45\text{ mA}, \qquad i_L = \frac{4.5}{150} = 0.030\text{ A} = 30\text{ mA}`,
            },
            {
              label: '安全核验',
              text: R`[[p_check|$P_{R1} = (0.045)^2(100) = 0.2025\text{ W} < 0.25\text{ W}$]]，$P_{R2} = 0.0675\text{ W}$，$P_{R3} = 0.135\text{ W}$，$i_L = 30\text{ mA} \ll I_{\text{sat}}$，完全满足面包板安全规范！`,
            },
            {
              label: '步骤 4',
              text: '**磁场储能、电场储能与总储能**',
              tex: R`\begin{gathered} w_L = \frac{1}{2} (20 \times 10^{-3}) (30 \times 10^{-3})^2 = 9.00 \times 10^{-6}\text{ J} = 9.00\text{ }\mu\text{J} \\[6pt] w_C = \frac{1}{2} (10 \times 10^{-6}) (4.5)^2 = 101.25 \times 10^{-6}\text{ J} = 101.25\text{ }\mu\text{J} \\[6pt] w_{\text{total}} = w_L + w_C = 9.00 + 101.25 = 110.25\text{ }\mu\text{J} \end{gathered}`,
            },
          ],
        },
        { kind: 'p', text: '**直流稳态磁电储能分布与面包板安全核验卡**' },
        { kind: 'figure', svg: SVG_ENERGY, caption: '图 6-1：例题 5.1 磁电储能占比条形图与面包板安全核验卡' },
        { kind: 'p', text: '**诊断测验（4 题全覆盖）**' },
      ],
      quiz: [
        {
          id: 'w4l2_q1',
          question: R`一个空心螺线管的电感量为 $100\ \mu\text{H}$。若保持线圈长度 $\ell$、横截面积 $A$ 与磁芯材料不变，仅将绕组匝数 $N$ 增加为原来的 2 倍，新的电感量是多少？`,
          options: [
            {
              key: 'A',
              text: R`$100\ \mu\text{H}$`,
              correct: false,
              feedback: R`匝数变了，电感量不可能原地不动：$L = N^2\mu A/\ell$ 里 $N$ 是平方项，只有 $\ell$、$A$、磁芯保持不变而已。`,
            },
            {
              key: 'B',
              text: R`$200\ \mu\text{H}$`,
              correct: false,
              feedback: R`这是“匝数翻倍、电感翻倍”的线性直觉：匝数翻倍既让磁场 $B$ 翻倍，又让交链磁通的匝数翻倍，所以是 $2^2$ 倍而不是 2 倍。`,
            },
            { key: 'C', text: R`$400\ \mu\text{H}$`, correct: true },
            {
              key: 'D',
              text: R`$800\ \mu\text{H}$`,
              correct: false,
              feedback: R`这是 $2^3 = 8$ 倍，相当于把 $N$ 当成三次方：$N$ 在公式里只出现两次——一次在 $B = \mu N i/\ell$，一次在 $\lambda = N\Phi$。`,
            },
          ],
          feedback_correct: R`由螺线管电感公式 $L = N^2\mu A/\ell$ 可知，$L$ 与匝数 $N$ 的平方成正比。$N$ 变为 2 倍，$L$ 变为 $2^2 = 4$ 倍，即 $400\ \mu\text{H}$。`,
          feedback_wrong: R`回到第 1 幕的 $L = N^2\mu_0\mu_r A/\ell$：$N$ 是几次方？`,
          figure: SVG_Q1,
          sync: at(L2, ['coil'], { peel: 1, mu: 'air', N: 200, idir: 1, ex51: 5 }),
        },
        {
          id: 'w4l2_q2',
          question: R`流过一个 $L = 50\text{ mH}$ 理想电感的电流在 $5\text{ ms}$ 内从 0 线性增加到 $200\text{ mA}$。在此上升期间，电感两端的感应电压 $v_L$ 与上升结束时的磁场储能 $w_L$ 分别为多少？`,
          options: [
            { key: 'A', text: R`$v_L = 2.0\text{ V}$，$w_L = 1.0\text{ mJ}$`, correct: true },
            {
              key: 'B',
              text: R`$v_L = 2.0\text{ V}$，$w_L = 2.0\text{ mJ}$`,
              correct: false,
              feedback: R`电压算对了，储能却漏了 $\frac{1}{2}$：$w_L = \frac{1}{2}Li^2 = 0.5 \times 0.05 \times (0.2)^2 = 1.0\text{ mJ}$，$Li^2$ 才是 $2.0\text{ mJ}$。`,
            },
            {
              key: 'C',
              text: R`$v_L = 0.2\text{ V}$，$w_L = 1.0\text{ mJ}$`,
              correct: false,
              feedback: R`储能对了，电压小了 10 倍：斜率是 $0.2\text{ A} / 0.005\text{ s} = 40\text{ A/s}$（不是 $4\text{ A/s}$），$v_L = 0.05 \times 40 = 2.0\text{ V}$。`,
            },
            {
              key: 'D',
              text: R`$v_L = 4.0\text{ V}$，$w_L = 0.5\text{ mJ}$`,
              correct: false,
              feedback: R`两个数都偏了一倍：$di/dt = 0.2/0.005 = 40\text{ A/s}$，乘 $L = 0.05\text{ H}$ 得 $2.0\text{ V}$；$w_L = \frac{1}{2}(0.05)(0.2)^2 = 1.0\text{ mJ}$。`,
            },
          ],
          feedback_correct: R`电流斜率 $di/dt = 0.2\text{ A} / 0.005\text{ s} = 40\text{ A/s}$，故 $v_L = L\,di/dt = 0.05 \times 40 = 2.0\text{ V}$；结束时储能 $w_L = \frac{1}{2} L i^2 = 0.5 \times 0.05 \times (0.2)^2 = 0.001\text{ J} = 1.0\text{ mJ}$。`,
          feedback_wrong: R`先求斜率 $di/dt$ 再乘 $L$；储能别忘了 $\frac{1}{2}$。`,
          figure: SVG_Q2,
          sync: at(L3, ['v_wave', 'slope'], { ...EX21, tc: 1, ex51: 5 }),
        },
        {
          id: 'w4l2_q3',
          question: '在用 MOSFET 或机械开关控制继电器线圈（感性负载）通断时，必须在继电器线圈两端反向并联一只续流二极管（Flyback Diode），其根本物理原因是什么？',
          options: [
            {
              key: 'A',
              text: '增大线圈在直流稳态下的工作电流，让继电器吸合更快',
              correct: false,
              feedback: '续流二极管在正常通电时承受反向电压、处于截止状态，根本不流电流：它既不改变线圈的工作电流，也不影响吸合速度。',
            },
            {
              key: 'B',
              text: R`电感电流不能瞬时突变，开关断开时会产生极高反向电动势 $v_L = L\,di/dt$，续流二极管提供闭合泄放通道并将反压钳位在约 $0.7\text{ V}$`,
              correct: true,
            },
            {
              key: 'C',
              text: '防止电感在直流稳态下变成开路导致电路断电',
              correct: false,
              feedback: R`直流稳态下理想电感是短路（$v_L = 0$），不会变成开路；续流二极管要对付的是断电那一瞬间的 $di/dt$，不是稳态。`,
            },
            {
              key: 'D',
              text: R`抵消线圈的直流寄生电阻 $R_{\text{DCR}}$，提高效率`,
              correct: false,
              feedback: R`并联的二极管抵消不了串在绕组里的 $R_{\text{DCR}}$；断电续流时，磁场储能反而正是消耗在二极管压降与 $R_{\text{DCR}}$ 上。`,
            },
          ],
          feedback_correct: R`强行切断电感电流会导致 $di/dt$ 极大负值，产生数千伏反电动势击穿开关；反并续流二极管在正常通电时反偏截止，在断电瞬间正偏导通，安全释放 $\frac{1}{2}Li^2$ 磁场储能。`,
          feedback_wrong: '回到第 3 幕的水锤效应：断电瞬间电感电流想往哪里去？',
          figure: SVG_Q3,
          sync: at(L3, ['flyback_d', 'kick_sw'], { wmode: 'kick', sw: 'closed', diode: false, ex51: 5 }),
        },
        {
          id: 'w4l2_q4',
          question: R`将 $L_1 = 6\text{ mH}$ 与 $L_2 = 12\text{ mH}$ 并联后，再与 $L_3 = 2\text{ mH}$ 串联（无互感）。该网络的总等效电感 $L_{\text{eq}}$ 以及它在直流稳态下的端口等效特性分别是？`,
          options: [
            {
              key: 'A',
              text: R`$L_{\text{eq}} = 20\text{ mH}$，直流稳态等效为短路`,
              correct: false,
              feedback: R`$6 + 12 + 2 = 20$：把三颗全当成串联直接相加了。$L_1$、$L_2$ 是并联，要用“积除以和”：$6 \parallel 12 = 4\text{ mH}$，再串 $L_3$。`,
            },
            {
              key: 'B',
              text: R`$L_{\text{eq}} = 6\text{ mH}$，直流稳态等效为开路`,
              correct: false,
              feedback: R`$6\text{ mH}$ 算对了，可直流稳态下 $di/dt = 0 \Rightarrow v = 0$，电感是短路；开路是电容的直流特性。`,
            },
            { key: 'C', text: R`$L_{\text{eq}} = 6\text{ mH}$，直流稳态等效为短路`, correct: true },
            {
              key: 'D',
              text: R`$L_{\text{eq}} = 4\text{ mH}$，直流稳态等效为短路`,
              correct: false,
              feedback: R`只算了并联部分 $6 \parallel 12 = 4\text{ mH}$，忘了它还要与 $L_3 = 2\text{ mH}$ 串联。`,
            },
          ],
          feedback_correct: R`电感串并联与电阻同构：$L_1 \parallel L_2 = (6\times12)/(6+12) = 4\text{ mH}$，再串联 $L_3 = 2\text{ mH}$ 得 $L_{\text{eq}} = 6\text{ mH}$；直流稳态下 $di/dt = 0$，理想电感端口压降为零，等效为短路。`,
          feedback_wrong: '先并后串（并联积除以和），再想直流稳态下电感的端口压降。',
          figure: SVG_Q4,
          sync: at(L1, ['couple_pair'], { cam: 'couple', couple: 'ortho', ex51: 5 }),
        },
      ],
    },
  ],
};

export default W4_L2;
