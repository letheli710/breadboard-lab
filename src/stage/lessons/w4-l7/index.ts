// W4-L7 · 无源串联/并联 RLC 自然响应（特征方程与三种阻尼状态） (lesson sheet: docs/lessons/W4-L7.md).
// The professor's text of the six acts, the figures, the guided example and the self-test are
// reproduced from the sheet; [[id|…]] only links a term to the stage (the words are unchanged).
// Changes of form:
// - the opening remarks open act 1; the sheet's numbered sub-headings (1.1 … 6.1) are bold lines;
//   display formulas sit in the ① / ② / ③ cards (a lead-in sentence becomes the card title); the
//   numbered steps of act 3 run as paragraphs around the semicircle formula;
// - the guided example (the sheet's Socratic JSON) and the self-test (its quiz JSON) are acts of
//   their own (7 and 8); the JSON ids, the passing score and the developer checklist are left out;
// - the guided example (a parallel RLC, R = 25 Ω, L = 0.4 H, C = 250 µF) is not one of the acts'
//   worked examples (act 4: series Sadiku 8.3; act 5: parallel R = 50 Ω, 160 mH, 25 µF), so the ③
//   cards stay in place; the stage hides the example's α, ω0, ω_d, B1, B2, dv/dt(0⁺), the poles and
//   the waveform until each is found (reveal levels, done_params), and the step diagrams of steps
//   2–5 no longer print their answers (svgs.ts); the options of the guided steps and of the quiz
//   are reordered (the sheet always put the right one first / second).
// Added: the sheet's breadboard_safety_and_scaling block as act 6's table (bench supply, parts,
// scope settings, why no 1000× scaling), stage pointers (tips), the guided example's problem
// figure, praise for the right options and its conclusion, the quiz figures and per-option quiz
// feedback written from the sheet's explanations.
// Fixed: step 1's intercept for option C (the sheet: "漏乘了 2 … 1/(RC) = 160" — 160 is not the
// option's 125); act 6's undershoot range (the sheet's scope note: "+5 V 至 −3.5 V"; R = 40 Ω gives
// −2.6 V, the pot at 0 Ω (R_L only) −4.3 V).

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import { lightSvg } from '../../svgTheme';
import type { StageLesson } from '../../types';
import { SVG_BENCH_DARK, SVG_BENCH_LIGHT, SVG_COMPARE, SVG_DUAL, SVG_EX1_DARK, SVG_EX1_LIGHT, SVG_EX2, SVG_SPLANE } from './sheetSvgs';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_GD_PROBLEM, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4, SVG_QUIZ_ACT } from './svgs';
import { presetParams } from './state';

const Schematic = lazy(() => import('./Schematic'));
const Waveform = lazy(() => import('./Waveform'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;

const L1 = '01_schematic';
const L2 = '02_waveform_splane';
const L3 = '03_breadboard_3d';

const SUPPLY = '台式可调直流电源（5 V）';

/** the guided example's stage: its circuit, with what has been found so far */
const GD = (reveal: number) => presetParams('gd', { reveal });

const W4_L7: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Schematic, [L2]: Waveform, [L3]: Bench3D },
  describeTarget: (id) => genericLabel(id),
  lesson_meta: {
    lesson_id: 'W4-L7',
    world: 'World 4',
    title: '无源串联/并联 RLC 自然响应（特征方程与三种阻尼状态）',
    subtitle: '从二阶齐次微分方程到 s 平面极点轨迹与面包板实测振铃归零',
    lesson_type: 'D',
    lesson_type_label: 'Type D（动态阻尼波形 + 3D 面包板实操课）',
    estimated_minutes: 55,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Section 8.3: The Source-Free Series RLC Circuit', 'Section 8.4: The Source-Free Parallel RLC Circuit'],
    },
    prerequisites: ['W4-L4', 'W4-L6'],
    learning_objectives: [
      R`写出无源串联/并联 RLC 的二阶方程与 $\alpha$、$\omega_0$，识别并联 $\alpha = 1/(2RC)$ 的反直觉`,
      '由特征根判别式区分过阻尼、临界阻尼、欠阻尼三种响应形式',
      '在 $s$ 平面上读极点位置，判断振荡与衰减快慢（含慢主导极点）',
      '用初值 $v(0^+)$ 与 $dv/dt(0^+)$ 求待定系数，并在面包板上拧电位器观察振铃消失',
    ],
    pass_message: '随堂自测通过！三种阻尼状态，你已经能从特征方程一眼判出。',
    next_lesson: 'W4-L8',
    next_lesson_title: 'RLC 阶跃响应与一般二阶电路通用求解流程',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 2D 串联/并联 RLC 切换原理图',
        short: '01 RLC 原理图',
        render_mode: '2D_SCHEMATIC_SVG',
        caption: '01 串联 RLC（KVL 回路、共享电流 i）⇄ 并联 RLC（KCL 节点、共享电压 v）一键切换；拖 R 看右侧 α 与 ω₀ 对比浮窗：α(R) 与 ω₀ 水平线的交点就是临界电阻 R_crit。',
      },
      {
        id: L2,
        label: '02 实时示波器阻尼波形对比台（三态同屏 + s 平面极点）',
        short: '02 阻尼对比',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 v_C(t) 随 R、L、C 滑块实时重算：标出包络 ±M·e^(−αt) 与 1/α、无阻尼周期 T₀ = 2π/ω₀、振铃周期 T_d = 2π/ω_d；R 滑块上的绿色刻度是 R_crit（α = ω₀，滑块会吸附）。「三态同屏」叠加 ζ = 1.5 / 1 / 0.2 三条曲线；右侧 s 平面看极点沿半径 ω₀ 的半圆滑动、在 −ω₀ 相撞、再沿实轴分裂。',
      },
      {
        id: L3,
        label: '03 3D 面包板拧电位器实时观察欠阻尼振荡消失',
        short: '03 3D 电位器',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption: `03 ${SUPPLY}经 SPDT 开关给 1 µF 充电，拨到「放电」触发示波器单次捕捉；拖动 0–1 kΩ 电位器旋钮（或上方滑块），看双通道示波器上 v_C(t) 的振铃在 R = R_pot + R_L = 200 Ω 处消失。镜头可切全景 / 电位器特写 / 示波器屏幕。`,
      },
    ],
    hover_map: {
      sch_r: { label: '电阻 R（刹车手）', desc: '串联：α = R/(2L)，R 越大阻尼越强；并联：α = 1/(2RC)，R 越大阻尼越弱' },
      sch_l: { label: '电感 L', desc: '储存磁场能 ½Li²；电流不能突变。和 C 一起决定 ω₀ = 1/√(LC)' },
      sch_c: { label: '电容 C', desc: '储存电场能 ½Cv²；电压不能突变。v_C(0⁺) = v_C(0⁻) 是第一个初值' },
      sch_loop: { label: '串联回路电流 i(t)（KVL）', desc: '单回路：R、L、C 共享同一个电流；按关联方向 i = C·dv_C/dt' },
      sch_node: { label: '并联节点电压 v(t)（KCL）', desc: '单节点对：R、L、C 共享同一个电压；三条支路电流之和为零' },
      sch_ir: { label: '电阻支路电流 i_R = v/R', desc: '向下流出节点；R 越大它越小，电阻消耗的功率 v²/R 越少' },
      sch_il: { label: '电感支路电流 i_L', desc: '向下流出节点；i_L(0⁺) = i_L(0⁻) 是并联电路的第二个初值' },
      sch_ic: { label: '电容支路电流 i_C = C·dv/dt', desc: 'KCL：i_C = −(i_R + i_L)，由它得到 dv/dt(0⁺)' },
      alpha_box: { label: '尼珀频率 α（阻尼系数）', desc: '包络衰减的快慢：串联 α = R/(2L)，并联 α = 1/(2RC)，单位 Np/s' },
      omega0: { label: '无阻尼谐振角频率 ω₀', desc: 'ω₀ = 1/√(LC)，串联与并联完全同式；只由 L、C 的能量交换节拍决定' },
      r_crit: { label: '临界电阻 R_crit（α = ω₀）', desc: '串联 R_crit = 2√(L/C)，并联 R_crit = ½√(L/C)；三种阻尼状态的分界' },
      wf_curve: { label: '电容电压 v_C(t)', desc: '二阶齐次方程 x″ + 2αx′ + ω₀²x = 0 的解；颜色随阻尼状态变化（红过阻尼 / 绿临界 / 蓝欠阻尼）' },
      wf_env: { label: '指数包络 ±M·e^(−αt)', desc: '欠阻尼振荡被它夹紧：M = √(B₁² + B₂²)，t = 1/α 时降到 M/e' },
      wf_alpha: { label: '1/α 与慢模态', desc: '1/α 是包络的时间常数；过阻尼时真正拖尾的是离虚轴最近的慢极点 s₁' },
      wf_w0: { label: '无阻尼周期 T₀ = 2π/ω₀', desc: '纯 LC（R = 0 串联 / R → ∞ 并联）时的振荡周期；有阻尼时振铃变慢：T_d > T₀' },
      wf_wd: { label: '阻尼振荡角频率 ω_d', desc: 'ω_d = √(ω₀² − α²)；振铃周期 T_d = 2π/ω_d，两次同向过零之间' },
      wf_over: { label: '过阻尼残影（ζ = 1.5）', desc: '两个不等负实根：不振荡，但慢模态拖着长尾巴' },
      wf_critical: { label: '临界阻尼残影（ζ = 1）', desc: '二重根 −α：无超调前提下最快回零' },
      wf_under: { label: '欠阻尼残影（ζ = 0.2）', desc: '共轭复根 −α ± jω_d：衰减正弦振铃，向下冲破 0 V' },
      wf_start: { label: '初值与初始斜率', desc: 'v_C(0⁺) 与 dv_C/dt(0⁺)：串联 = i(0⁺)/C，并联 = −[v(0⁺)/R + i_L(0⁺)]/C' },
      sp_poles: { label: '特征根（极点）s₁、s₂', desc: 's₁,₂ = −α ± √(α² − ω₀²)：横坐标管衰减，纵坐标管振荡' },
      sp_circle: { label: '半径 ω₀ 的半圆轨迹', desc: '欠阻尼时 |s| = √(α² + ω_d²) = ω₀：极点沿半圆向左滑，在 −ω₀ 处相撞' },
      sp_slow: { label: '慢主导极点 s₁', desc: '过阻尼时离虚轴最近的极点：s₁ ≈ −ω₀²/(2α) → 0⁻，决定拖尾有多长' },
      bb_psu: { label: SUPPLY, desc: '+ 端 → 顶部外侧 +5 V 轨，COM → 顶部内侧 GND 轨；限流 0.30 A。上电前确认输出为 5.00 V' },
      rail_p5: { label: '+5 V 电源轨（顶部外侧）', desc: `由${SUPPLY}供电；红色跳线 a10 → 此轨，接 SPDT 的「充电」端` },
      rail_gnd: { label: 'GND 公共地轨（顶部内侧）', desc: '电源 COM、SPDT 的「放电」端、电容下端（第 26 列）都接这里' },
      bb_spdt: { label: 'SPDT 拨动开关（第 10–12 列）', desc: '公共端第 11 列：拨到「充电」接 +5 V，C 充到 5 V；拨到「放电」接 GND，RLC 回路闭合成无源放电态，示波器单次触发' },
      nd_com: { label: '开关公共端 → 电位器', desc: '橙色跳线 b11 → b16：SPDT 公共端接电位器一端' },
      bb_pot: { label: '0–1 kΩ 线性电位器（B1K）', desc: '端脚 e16 + 滑动端 e17 当可变电阻用；旋钮 0°–270° 对应 0–1 kΩ。拖动黑色旋钮拧它' },
      nd_wiper: { label: '电位器滑动端 → 电感', desc: '绿色跳线 b17 → b21' },
      bb_l: { label: '10 mH 工字电感（c21–c23）', desc: '铁氧体工字电感，绕组寄生直流电阻 R_L ≈ 10 Ω（8–15 Ω）：电位器拧到 0 回路也还剩 R_L' },
      nd_vc: { label: 'L–C 节点（v_C，第 23 列）', desc: '电感与电容的连接点：示波器 CH1 探头钩在 a23，读的就是电容电压 v_C(t)' },
      bb_c: { label: '1 µF 无极性薄膜电容（e23–e26）', desc: 'CBB 薄膜电容，耐压 ≥ 50 V。欠阻尼时 v_C 会反向到负值，不能用有极性电解电容' },
      bb_probe: { label: '示波器 CH1 探头', desc: '探针钩在 L–C 节点（a23），读电容电压 v_C(t)' },
      bb_gnd_clip: { label: '探头地线夹', desc: '夹在电容的接地端（c26，与 GND 轨同电位）；地线夹只能接地，不能夹在别的节点上' },
      bb_scope: { label: '双通道示波器（CH1 跨接 C）', desc: 'DC 耦合 2 V/div，200 µs/div（10 格 = 2 ms），下降沿触发 +4.5 V，单次捕捉；屏上显示最低点与振铃频率' },
      scale_note: { label: '安全与缩放', desc: '5 V 台式电源、无极性薄膜电容；峰值电流约 v₀/√(L/C) = 50 mA（< 250 mA）；按原值搭建，不需要 1000× 缩放' },
      center_trench: { label: '中央绝缘凹槽', desc: 'e 与 f 之间绝缘；本课电路全部搭在上半区（a–e 行）' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: R`从一阶到二阶——无源串联与并联 RLC 的对偶方程与 $\alpha$ 的“反直觉陷阱”`,
      sync: { layer: L1, halo: ['sch_r', 'alpha_box'], params: presetParams('demo') },
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：同学们好！欢迎回到 Breadboard Lab。在 **W4-L4** 里，我们见识了一阶 RC 和 RL 电路的“单调宿命”——无论你怎么改电阻和电容，一阶电路的能量只会像漏水的水桶一样乖乖地单调指数衰减，永远翻不起浪花。而在 **W4-L6** 中，我们已经练就了给二阶电路求“出发点” $x(0^+)$ 和“出发斜率” $\frac{dx}{dt}(0^+)$ 的硬功夫。`,
        },
        {
          kind: 'p',
          text: R`今天这一讲（对应 Sadiku《电路基础》2026 版 **Section 8.3 & 8.4**），我们要把[[sch_l|电感 $L$]] 和[[sch_c|电容 $C$]] 关进同一个无源笼子里，看看当磁场能量 $\frac{1}{2}Li^2$ 和电场能量 $\frac{1}{2}Cv^2$ 开始“互相倒腾”时，[[sch_r|电阻 $R$]] 这只“刹车手”如何通过一个小小的二次特征方程，把电路命运彻底划分为**过阻尼、临界阻尼、欠阻尼**三种截然不同的戏剧性结局。`,
        },
        { kind: 'p', text: '**1.1 教授导学：为什么一换拓扑，电阻的“刹车效果”就完全反了？**' },
        { kind: 'p', text: R`很多同学刚学二阶电路时，最容易栽在一个致命误区里：**以为电阻 $R$ 越大，电路的阻尼就一定越强。**` },
        {
          kind: 'p',
          text: R`这句话在**[[sch_loop|串联 RLC]]** 里千真万确，但在**[[sch_node|并联 RLC]]** 里却**完全相反**！让我们先看下面这张对偶原理图，再一起用基尔霍夫定律把两个二阶齐次微分方程原原本本地推出来。`,
        },
        { kind: 'figure', svg: SVG_DUAL, caption: '图 1-1：无源串联 RLC vs. 并联 RLC 对偶结构与阻尼系数对比' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 01 层：$L = 10\text{ mH}$、$C = 1\ \mu\text{F}$、$R = 100\ \Omega$ 时串联与并联的 $\alpha$ 恰好相等（$5000\text{ Np/s}$）。切换拓扑后把 R 往右拖，看浮窗里的 [[alpha_box|α]] 一个变大、一个变小，而 [[omega0|ω₀]] 纹丝不动；α 线与 ω₀ 线的交点就是 [[r_crit|R_crit]]。`,
        },
        { kind: 'p', text: '**1.2 三段式教授板书推导：标准二阶齐次方程与特征方程**' },
        {
          kind: 'origin',
          title: '① 公理溯源（物理定律与元件 VCR）',
          text: R`**[[sch_loop|无源串联 RLC（单回路共享电流 $i(t)$）]]**：沿回路顺时针列写 KVL，并代入电阻、电感、电容的伏安关系（采用关联参考方向）：$v_R(t) + v_L(t) + v_C(t) = 0 \implies R i(t) + L\frac{di(t)}{dt} + \frac{1}{C}\int_{-\infty}^{t} i(\tau)\,d\tau = 0$ **[[sch_node|无源并联 RLC（单节点共享电压 $v(t)$）]]**：对上节点列写 KCL，流出电流之和为零：$i_R(t) + i_L(t) + i_C(t) = 0 \implies \frac{v(t)}{R} + \frac{1}{L}\int_{-\infty}^{t} v(\tau)\,d\tau + C\frac{dv(t)}{dt} = 0$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（消去积分并标准化）：对上述两式分别关于时间 $t$ 求一次导数以消去积分号，再分别除以最高阶导数的系数 $L$ 和 $C$。**串联 RLC**：`,
          tex: R`\frac{d^2 i}{dt^2} + \frac{R}{L}\frac{di}{dt} + \frac{1}{LC} i = 0`,
        },
        { kind: 'formula', title: '**并联 RLC**：', tex: R`\frac{d^2 v}{dt^2} + \frac{1}{RC}\frac{dv}{dt} + \frac{1}{LC} v = 0` },
        {
          kind: 'formula',
          title: R`**教授点睛**：请注意！不论你是求串联里的 $i(t)$、$v_C(t)$ 还是并联里的 $v(t)$、$i_L(t)$，同一个线性电路里所有支路变量都共享**完全相同的齐次微分方程左端算子**！我们统一引入两个具有清晰物理意义的常数——**[[alpha_box|尼珀频率（阻尼系数）$\alpha$]]** 与 **[[omega0|无阻尼谐振角频率 $\omega_0$]]**：`,
          tex: R`\frac{d^2 x}{dt^2} + 2\alpha \frac{dx}{dt} + \omega_0^2 x = 0`,
        },
        {
          kind: 'formula',
          title: R`将指数试探解 $x(t) = A e^{st}$（其中 $A \neq 0$）代入，消去公因子 $A e^{st}$，立即得到电路的“基因密码”——**特征方程（Characteristic Equation）**：`,
          tex: R`s^2 + 2\alpha s + \omega_0^2 = 0`,
        },
        {
          kind: 'formula',
          title: R`用一元二次方程求根公式解出两个**[[sp_poles|自然频率（特征根 / 极点）]]**：`,
          tex: R`s_{1,2} = -\alpha \pm \sqrt{\alpha^2 - \omega_0^2}`,
        },
        { kind: 'p', text: '**③ 串联 vs. 并联核心参数醒目对照表**' },
        {
          kind: 'table',
          head: ['对比维度', '无源串联 RLC（Section 8.3）', '无源并联 RLC（Section 8.4）', '物理直觉与防踩坑口诀'],
          rows: [
            ['**控制方程定律**', 'KVL（电压环路和为零）', 'KCL（电流节点和为零）', R`串联看 $i(t)$，并联看 $v(t)$，完全对偶`],
            [
              R`**[[omega0|谐振角频率 $\omega_0$]]**`,
              R`$\omega_0 = \dfrac{1}{\sqrt{LC}}$`,
              R`$\omega_0 = \dfrac{1}{\sqrt{LC}}$`,
              R`**完全同式**！只由 $L$ 和 $C$ 的能量交换节拍决定`,
            ],
            [R`**[[alpha_box|尼珀频率 $\alpha$]]**`, R`$\alpha = \dfrac{R}{2L}$`, R`$\alpha = \dfrac{1}{2RC}$`, R`**串联正比于 $R$，并联反比于 $R$！**`],
            [
              R`**[[r_crit|临界电阻 $R_{\text{crit}}$]]**`,
              R`$R_{\text{crit}} = 2\sqrt{\dfrac{L}{C}}$`,
              R`$R_{\text{crit}} = \dfrac{1}{2}\sqrt{\dfrac{L}{C}}$`,
              R`令 $\alpha = \omega_0$ 解出，注意系数是 $2$ 还是 $\frac{1}{2}$`,
            ],
            [
              R`**电阻 $R$ 增大时的趋势**`,
              R`$\alpha \uparrow \Rightarrow$ **阻尼增强**（趋向过阻尼）`,
              R`$\alpha \downarrow \Rightarrow$ **阻尼减弱**（趋向欠阻尼）`,
              R`并联电阻越大，分流消耗功率 $P_R = v^2/R$ 越小！`,
            ],
            ['**无损极限（纯 LC 振荡）**', R`$R = 0$（电阻短路）`, R`$R \to \infty$（电阻开路）`, '把耗能元件彻底“请出局”的方式截然相反'],
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '特征根判别式——三种阻尼形态的数学基因与同屏波形对比',
      sync: { layer: L2, halo: ['wf_env', 'wf_wd', 'r_crit'], params: presetParams('fig2', { ghost: true }) },
      blocks: [
        { kind: 'p', text: R`**2.1 教授导学：根号里的 $\alpha^2 - \omega_0^2$ 决定了电路的三种“性格”**` },
        {
          kind: 'p',
          text: R`盯着特征根公式 $s_{1,2} = -\alpha \pm \sqrt{\alpha^2 - \omega_0^2}$ 看：根号内部 $\Delta = \alpha^2 - \omega_0^2$ 的正负号，直接把所有无源 RLC 电路分成了三大阵营。这里我们也可以顺带认识工程里常用的无量纲**阻尼比** $\zeta = \frac{\alpha}{\omega_0}$：`,
        },
        { kind: 'p', text: R`**1. [[wf_over|过阻尼]]（Overdamped, $\alpha > \omega_0$ 或 $\zeta > 1$）**` },
        { kind: 'ul', items: [R`根号为正，特征根为两个**不相等的负实数** $s_1, s_2$（记 $s_1$ 更靠近原点，$s_2$ 更远离原点）。`] },
        { kind: 'formula', title: '通解形式：', tex: R`x(t) = A_1 e^{s_1 t} + A_2 e^{s_2 t}` },
        {
          kind: 'ul',
          items: [
            R`**物理画像**：刹车踩太死！能量来不及在 $L$ 与 $C$ 之间反弹，就被 $R$ 消耗殆尽。虽然完全不振荡，但由于[[wf_alpha|慢模态 $e^{s_1 t}$]] 拖后腿，它回到零反而**很慢（有长拖尾）**。`,
          ],
        },
        { kind: 'p', text: R`**2. [[wf_critical|临界阻尼]]（Critically Damped, $\alpha = \omega_0$ 或 $\zeta = 1$）**` },
        { kind: 'ul', items: [R`根号恰好为零，特征根为**二重负实根** $s_1 = s_2 = -\alpha$。`] },
        { kind: 'formula', title: R`通解形式（因为重根需要补一个线性独立项 $t e^{-\alpha t}$）：`, tex: R`x(t) = (A_1 + A_2 t) e^{-\alpha t}` },
        {
          kind: 'ul',
          items: [R`**物理画像**：黄金平衡点！在**绝对不产生振荡过冲**的前提下，以**最快速度**回归平衡态。汽车减震器、高档指针仪表、门闭门器的理想调校目标就是临界阻尼。`],
        },
        { kind: 'p', text: R`**3. [[wf_under|欠阻尼]]（Underdamped, $\alpha < \omega_0$ 或 $\zeta < 1$）**` },
        {
          kind: 'ul',
          items: [R`根号为负，引入**[[wf_wd|阻尼振荡角频率]]** $\omega_d = \sqrt{\omega_0^2 - \alpha^2}$，特征根为一对**共轭复根** $s_{1,2} = -\alpha \pm j\omega_d$。`],
        },
        {
          kind: 'formula',
          title: R`由欧拉公式 $e^{\pm j\omega_d t} = \cos\omega_d t \pm j\sin\omega_d t$ 化为实函数通解：`,
          tex: R`x(t) = e^{-\alpha t}\left(B_1 \cos\omega_d t + B_2 \sin\omega_d t\right) = M e^{-\alpha t}\cos(\omega_d t - \phi)`,
        },
        { kind: 'p', text: R`其中包络初始幅值 $M = \sqrt{B_1^2 + B_2^2}$，相位 $\phi = \operatorname{atan2}(B_2, B_1)$。` },
        {
          kind: 'ul',
          items: [
            R`**物理画像**：刹车太轻！电容放电完毕时，电感里还蓄满磁场能量 $\frac{1}{2}Li^2$，于是电感强行把电容**反向充电**；反向充满后电容再反推电感……电场与磁场来回倒腾能量，每一轮被电阻 $R$ 抽走一部分“过路费”，形成被[[wf_env|指数包络线 $\pm M e^{-\alpha t}$]] 夹紧的**衰减正弦振荡（Ringing）**。`,
          ],
        },
        { kind: 'p', text: '**2.2 精确同屏对比图：过阻尼 vs. 临界阻尼 vs. 欠阻尼（含指数包络线）**' },
        {
          kind: 'p',
          text: R`下图由 Python 逐点精确计算绘制（设定 $\omega_0 = 10\text{ rad/s}$，初始状态 $v_C(0) = 12\text{ V},\ \frac{dv_C}{dt}(0^+) = 0$）：`,
        },
        {
          kind: 'ul',
          items: [
            R`[[wf_over|过阻尼（红）]]：$\alpha = 15\text{ Np/s}$（$\zeta = 1.5$）`,
            R`[[wf_critical|临界阻尼（绿）]]：$\alpha = 10\text{ Np/s}$（$\zeta = 1.0$）`,
            R`[[wf_under|欠阻尼（蓝）]]：$\alpha = 2\text{ Np/s}$（$\zeta = 0.2,\ \omega_d \approx 9.80\text{ rad/s}$），并叠加虚线[[wf_env|指数包络 $\pm 12.25 e^{-2t}$]]。`,
          ],
        },
        { kind: 'figure', svg: lightSvg(SVG_COMPARE), caption: '图 2-1：过阻尼 / 临界阻尼 / 欠阻尼三曲线同屏精确对比（ω₀ = 10 rad/s, v_C(0) = 12 V, i(0) = 0 A）' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 02 层就是这张图的活版：同一组 $L = 0.5\text{ H}$、$C = 0.02\text{ F}$（$\omega_0 = 10\text{ rad/s}$）已打开「三态同屏」，三条残影对应 $R = 15, 10, 2\ \Omega$。拖动 R 滑块，实线随之重算；滑块上的绿色刻度是 [[r_crit|R_crit = 10 Ω]]，拖到它附近会自动吸附。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: R`复平面 $s$ 极点轨迹——一眼看穿“欠阻尼震荡、临界最快、过阻尼拖尾”的几何本质`,
      sync: { layer: L2, halo: ['sp_poles', 'sp_circle'], params: presetParams('ex1', { R: 6, ghost: true }) },
      blocks: [
        { kind: 'p', text: '**3.1 教授导学：把特征根画在复平面上，规律会自己开口说话**' },
        {
          kind: 'p',
          text: R`请记住一条贯穿整个信号与系统、自动控制和模拟电路的黄金法则：**[[sp_poles|极点]]在复平面 $s = \sigma + j\omega$ 上的位置，就是时域波形的“基因地图”**：`,
        },
        {
          kind: 'ul',
          items: [
            R`**纵坐标 $|\omega_d|$** 控制**振荡有多快**（只要离开实轴，波形就会振荡）；`,
            R`**横坐标 $-\sigma$（距虚轴的水平距离）** 控制**衰减有多快**（越往左，衰减越快；最靠近虚轴的那个极点称为**[[sp_slow|主导极点]]**，它决定了波形的拖尾有多长！）。`,
          ],
        },
        {
          kind: 'p',
          text: R`现在固定 $\omega_0 = 10\text{ rad/s}$，让阻尼系数 $\alpha$ 从 $0$ 一路增大到 $+\infty$，观察特征根 $s_{1,2} = -\alpha \pm \sqrt{\alpha^2 - \omega_0^2}$ 的运动轨迹：`,
        },
        { kind: 'p', text: R`1. **无阻尼起点（$\alpha = 0$）**：两极点稳稳落在虚轴上的 $(0, \pm 10)$，距离虚轴为 $0$，不衰减、纯振荡。` },
        {
          kind: 'formula',
          title: R`2. **欠阻尼半圆（$0 < \alpha < \omega_0$）**：算一下极点到原点的距离：`,
          tex: R`|s_{1,2}| = \sqrt{(-\alpha)^2 + (\pm\omega_d)^2} = \sqrt{\alpha^2 + (\omega_0^2 - \alpha^2)} = \omega_0 = 10`,
        },
        { kind: 'p', text: R`太神奇了！所有欠阻尼极点都严格沿着[[sp_circle|**左半平面以原点为圆心、半径为 $\omega_0$ 的半圆**]]向左滑动！` },
        {
          kind: 'p',
          text: R`3. **临界阻尼碰撞（$\alpha = \omega_0$）**：上下两个共轭极点终于在负实轴 $(-10, 0)$ 迎头相撞，形成二重实根！此时它离虚轴的水平距离达到所有“最慢极点”里的最大值 $\omega_0$——**这就是为什么临界阻尼能做到“无超调且衰减最快”的几何证明！**`,
        },
        {
          kind: 'p',
          text: R`4. **过阻尼分裂（$\alpha > \omega_0$）**：相撞后两极点分道扬镳：一个飞速冲向 $-\infty$（快模态 $s_2$，瞬间消失），**另一个却反向往原点 $0^-$ 退缩**（[[sp_slow|慢模态 $s_1 \approx -\frac{\omega_0^2}{2\alpha} \to 0^-$]]）。它离虚轴越来越近，拖垮了整个电路的回零速度！`,
        },
        { kind: 'figure', svg: SVG_SPLANE, caption: '图 3-1：复平面 s 极点轨迹（固定 ω₀ = 10 rad/s，α 从 0 增大至 ∞），标出例题 1 的三组精确极点' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 02 层右边的 s 平面：现在是例题 1 的 $R = 6\ \Omega$（$-6 \pm j8$），淡色叉是三态残影的极点。把 R 从 $0$ 拖到 $50\ \Omega$，看两极点沿[[sp_circle|半圆]]滑到 $-10$ 相撞，再沿实轴分裂——其中[[sp_slow|慢极点 $s_1$]] 往原点退。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '经典例题精讲（Sadiku 8.3）——串联 RLC 旋转电阻开关遍历三种阻尼状态',
      sync: { layer: L2, halo: ['wf_curve', 'r_crit'], params: presetParams('ex1', { R: 12.5 }) },
      blocks: [
        { kind: 'p', text: '**4.1 题目设定**' },
        {
          kind: 'p',
          text: R`一个无源串联 RLC 电路中，[[sch_l|电感 $L = 0.5\text{ H}$]]，[[sch_c|电容 $C = 0.02\text{ F}$]]。初始时刻（由 **W4-L6** 换路定则确定）电容电压 $v_C(0) = 12\text{ V}$，[[sch_loop|回路电流 $i(0) = 0\text{ A}$]]（参考方向与电容电压关联，即 $i = C\frac{dv_C}{dt}$）。`,
        },
        { kind: 'p', text: '现在通过三位旋转开关依次将串联电阻切换为：' },
        { kind: 'ul', items: [R`**档位 ①**：$R = 12.5\ \Omega$`, R`**档位 ②**：$R = 10\ \Omega$`, R`**档位 ③**：$R = 6\ \Omega$`] },
        { kind: 'p', text: R`请分别求出 $t \ge 0$ 时电容电压 $v_C(t)$ 与回路电流 $i(t)$ 的完整解析表达式。` },
        { kind: 'figure', svg: SVG_EX1_LIGHT + lightSvg(SVG_EX1_DARK), caption: '图 4-1：例题 1（Sadiku 8.3）三位开关切换 R 遍历三种阻尼，及回路电流 i(t) 对比' },
        { kind: 'p', text: '**4.2 三段式教授板书推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`串联无源 RLC 回路满足 KVL 且电流 $i = C\frac{dv_C}{dt}$，将 $i$ 消去后，$v_C(t)$ 同样满足标准二阶齐次微分方程：$LC\frac{d^2 v_C}{dt^2} + RC\frac{dv_C}{dt} + v_C = 0 \implies \frac{d^2 v_C}{dt^2} + \frac{R}{L}\frac{dv_C}{dt} + \frac{1}{LC} v_C = 0$ 由 W4-L6 初值定理，电容电压与电感电流不可突变，故：$v_C(0^+) = v_C(0^-),\qquad \frac{dv_C}{dt}(0^+) = \frac{i(0^+)}{C}$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：先计算与电阻 $R$ 无关的[[omega0|固有谐振角频率]]和[[r_crit|临界电阻]]，以及随 $R$ 变化的[[alpha_box|尼珀频率]]：`,
          tex: R`\omega_0 = \frac{1}{\sqrt{LC}},\qquad \alpha = \frac{R}{2L},\qquad R_{\text{crit}} = 2\sqrt{\frac{L}{C}}`,
        },
        { kind: 'p', text: '待定系数由两个初值方程联立解出：' },
        {
          kind: 'ul',
          items: [
            R`**过阻尼（$\alpha > \omega_0$）**：$v_C(t) = A_1 e^{s_1 t} + A_2 e^{s_2 t}$，联立 $A_1 + A_2 = v_C(0^+)$ 与 $s_1 A_1 + s_2 A_2 = v_C'(0^+)$；`,
            R`**临界阻尼（$\alpha = \omega_0$）**：$v_C(t) = (A_1 + A_2 t)e^{-\alpha t}$，联立 $A_1 = v_C(0^+)$ 与 $A_2 - \alpha A_1 = v_C'(0^+)$；`,
            R`**欠阻尼（$\alpha < \omega_0$）**：$v_C(t) = e^{-\alpha t}(B_1 \cos\omega_d t + B_2 \sin\omega_d t)$，联立 $B_1 = v_C(0^+)$ 与 $-\alpha B_1 + \omega_d B_2 = v_C'(0^+)$。`,
          ],
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '先算公共不变量与初值导数：',
              tex: R`\omega_0 = \frac{1}{\sqrt{0.5 \times 0.02}} = \frac{1}{\sqrt{0.01}} = 10\text{ rad/s},\qquad R_{\text{crit}} = 2\sqrt{\frac{0.5}{0.02}} = 2\sqrt{25} = 10\ \Omega`,
            },
            { label: '', tex: R`v_C(0^+) = 12\text{ V},\qquad \frac{dv_C}{dt}(0^+) = \frac{i(0^+)}{C} = \frac{0}{0.02} = 0\text{ V/s}` },
            { label: R`**档位 ①：$R = 12.5\ \Omega$（过阻尼）**`, tex: R`\alpha = \frac{12.5}{2 \times 0.5} = 12.5\text{ Np/s} > \omega_0 = 10\text{ rad/s}` },
            { label: '', tex: R`s_{1,2} = -12.5 \pm \sqrt{12.5^2 - 10^2} = -12.5 \pm \sqrt{56.25} = -12.5 \pm 7.5 \implies s_1 = -5\text{ s}^{-1},\ s_2 = -20\text{ s}^{-1}` },
            { label: '代入初值条件：', tex: R`\begin{cases} A_1 + A_2 = 12 \\ -5 A_1 - 20 A_2 = 0 \end{cases} \implies A_1 = 16\text{ V},\quad A_2 = -4\text{ V}` },
            {
              label: '故完整解为（已通过 SymPy 回代校验）：',
              tex: R`v_C(t) = 16 e^{-5t} - 4 e^{-20t}\text{ V},\qquad i(t) = C\frac{dv_C}{dt} = 1.6\left(e^{-20t} - e^{-5t}\right)\text{ A}\quad (t \ge 0)`,
            },
            { label: R`**档位 ②：$R = 10\ \Omega$（临界阻尼）**`, tex: R`\alpha = \frac{10}{2 \times 0.5} = 10\text{ Np/s} = \omega_0 \implies s_1 = s_2 = -10\text{ s}^{-1}` },
            { label: '代入初值条件：', tex: R`\begin{cases} A_1 = 12 \\ A_2 - 10 A_1 = 0 \end{cases} \implies A_1 = 12\text{ V},\quad A_2 = 120\text{ V/s}` },
            { label: '故完整解为：', tex: R`v_C(t) = (12 + 120t) e^{-10t}\text{ V},\qquad i(t) = C\frac{dv_C}{dt} = -24 t e^{-10t}\text{ A}\quad (t \ge 0)` },
            {
              label: R`**档位 ③：$R = 6\ \Omega$（欠阻尼）**`,
              tex: R`\alpha = \frac{6}{2 \times 0.5} = 6\text{ Np/s} < \omega_0 = 10\text{ rad/s},\qquad \omega_d = \sqrt{10^2 - 6^2} = 8\text{ rad/s}`,
            },
            { label: '', tex: R`s_{1,2} = -6 \pm j8\text{ s}^{-1}` },
            { label: '代入初值条件：', tex: R`\begin{cases} B_1 = 12 \\ -6 B_1 + 8 B_2 = 0 \end{cases} \implies B_1 = 12\text{ V},\quad B_2 = 9\text{ V}` },
            {
              label: '故完整解为：',
              tex: R`v_C(t) = e^{-6t}(12\cos 8t + 9\sin 8t)\text{ V} = 15 e^{-6t}\cos(8t - 36.87^\circ)\text{ V},\qquad i(t) = -3 e^{-6t}\sin 8t\text{ A}\quad (t \ge 0)`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授快速体检**：看看 $i(t)$ 的符号为什么一开始是负的？因为我们按关联参考方向定义了 $i$ 流入电容正极板，而 $t=0$ 时电容正极板带 $+12\text{ V}$ 正在向外**放电**，所以电流自然为负！在档位 ③ 中，$i(t) = -3e^{-6t}\sin 8t$ 在 $t = \pi/8 \approx 0.393\text{ s}$ 时过零变正，说明电感惯性已经把电容反向充到了负电压，开始第二轮反推！`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 02 层已载入例题 1（档位 ①）：把 R 滑块依次拖到 $12.5$、$10$（吸附在 [[r_crit|R_crit]]）、$6\ \Omega$，读下方的 [[alpha_box|α]]、$s_{1,2}$ 与系数 $A_1, A_2$ / $B_1, B_2$，和上面的板书逐一对照。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: R`经典例题精讲（Sadiku 8.4）——并联 RLC 欠阻尼全流程求解 $v(t)$`,
      sync: { layer: L2, halo: ['wf_curve', 'wf_start'], params: presetParams('ex2') },
      blocks: [
        { kind: 'p', text: '**5.1 题目设定**' },
        {
          kind: 'p',
          text: R`一个无源并联 RLC 电路如图所示，元件参数为 [[sch_r|$R = 50\ \Omega$]]，[[sch_l|$L = 160\text{ mH}$]]，[[sch_c|$C = 25\ \mu\text{F}$]]。已知 $t = 0$ 时刻电容初始电压 $v(0) = 12\text{ V}$，[[sch_il|电感初始电流 $i_L(0) = 0.15\text{ A}$]]（参考方向均向下，与节点电压 $v(t)$ 关联）。求 $t \ge 0$ 时公共节点电压 $v(t)$ 的完整表达式。`,
        },
        { kind: 'figure', svg: lightSvg(SVG_EX2), caption: '图 5-1：例题 2（Sadiku 8.4）并联 RLC 欠阻尼精确电压波形与初值切线' },
        { kind: 'p', text: '**5.2 三段式教授板书推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`在无源并联 RLC [[sch_node|公共节点]]处应用 KCL（[[sch_ir,sch_il,sch_ic|三个支路均采用关联参考方向向下流出]]）：$i_R(t) + i_L(t) + i_C(t) = 0 \implies \frac{v(t)}{R} + i_L(t) + C\frac{dv(t)}{dt} = 0$ 由 W4-L6 换路定则，$v(0^+) = v(0^-)$ 且 $i_L(0^+) = i_L(0^-)$，在 $t = 0^+$ 时刻立即解出节点电压的一阶导数初值：$\frac{dv}{dt}(0^+) = -\frac{1}{C}\left[\frac{v(0^+)}{R} + i_L(0^+)\right]$`,
        },
        { kind: 'formula', title: '② 纯符号通式：并联 RLC 的特征参数为：', tex: R`\alpha = \frac{1}{2RC},\qquad \omega_0 = \frac{1}{\sqrt{LC}}` },
        {
          kind: 'formula',
          title: R`当 $\alpha < \omega_0$ 时进入欠阻尼状态，[[wf_wd|阻尼振荡角频率]] $\omega_d = \sqrt{\omega_0^2 - \alpha^2}$，通解及导数为：`,
          tex: R`\begin{gathered} v(t) = e^{-\alpha t}\left(B_1 \cos\omega_d t + B_2 \sin\omega_d t\right) \\ \frac{dv}{dt} = e^{-\alpha t}\left[(-\alpha B_1 + \omega_d B_2)\cos\omega_d t + (-\alpha B_2 - \omega_d B_1)\sin\omega_d t\right] \end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`令 $t = 0^+$，得到确定 $B_1, B_2$ 的万能公式：`,
          tex: R`B_1 = v(0^+),\qquad B_2 = \frac{1}{\omega_d}\left[\frac{dv}{dt}(0^+) + \alpha B_1\right]`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '1. **判别阻尼状态**：', tex: R`\alpha = \frac{1}{2RC} = \frac{1}{2 \times 50 \times 25 \times 10^{-6}} = 400\text{ Np/s}` },
            { label: '', tex: R`\omega_0 = \frac{1}{\sqrt{LC}} = \frac{1}{\sqrt{0.16 \times 25 \times 10^{-6}}} = \frac{1}{\sqrt{4 \times 10^{-6}}} = 500\text{ rad/s}` },
            {
              label: '',
              text: R`因为 $\alpha = 400 < \omega_0 = 500$（注意：$R = 50\ \Omega > R_{\text{crit, parallel}} = 40\ \Omega$，再次印证并联电路电阻越大越容易欠阻尼！），电路处于**欠阻尼**状态：`,
              tex: R`\omega_d = \sqrt{500^2 - 400^2} = 300\text{ rad/s},\qquad s_{1,2} = -400 \pm j300\text{ s}^{-1}`,
            },
            { label: R`2. **求 $t = 0^+$ 导数初值**：`, tex: R`i_R(0^+) = \frac{v(0^+)}{R} = \frac{12}{50} = 0.24\text{ A}` },
            { label: '', tex: R`\frac{dv}{dt}(0^+) = -\frac{0.24 + 0.15}{25 \times 10^{-6}} = -\frac{0.39}{25 \times 10^{-6}} = -15600\text{ V/s}` },
            { label: R`3. **求解 $B_1, B_2$ 并回代检验**：`, tex: R`B_1 = v(0^+) = 12\text{ V}` },
            { label: '', tex: R`B_2 = \frac{-15600 + 400 \times 12}{300} = \frac{-15600 + 4800}{300} = \frac{-10800}{300} = -36\text{ V}` },
            {
              label: R`因此完整响应为（SymPy 验证微分方程残差 $= 0$，初值与初导数完全吻合）：`,
              tex: R`v(t) = e^{-400t}\left(12\cos 300t - 36\sin 300t\right)\text{ V}\quad (t \ge 0)`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 02 层已载入例题 2：读下方的 [[wf_start|$dv/dt(0^+) = -15600\text{ V/s}$]] 与 $B_1 = 12$、$B_2 = -36$；把 R 往左拖过 [[r_crit|R_crit = 40 Ω]]，并联电路反而进入过阻尼——和串联正好相反。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: R`3D 面包板实操实验台——拧动 $1\text{ k}\Omega$ 电位器亲眼见证欠阻尼振铃归零`,
      sync: { layer: L3, halo: ['bb_pot', 'bb_scope'], params: presetParams('bench', { cam: 'bench', sw: 'release' }) },
      blocks: [
        { kind: 'p', text: '**6.1 教授导学：把黑板公式搬到真实面包板，必须跨过的三个工程门槛**' },
        {
          kind: 'p',
          text: R`教材例题里的 $0.5\text{ H}$ 和 $0.02\text{ F}$ 在真实实验桌上并不好用（$0.02\text{ F}$ 往往是有极性大电解电容，一反向振荡就会鼓包损坏）。在 **Breadboard Lab 3D 实操台**上，我们选用工程最舒适的音频段观测参数：`,
        },
        {
          kind: 'ul',
          items: [
            R`**[[bb_l|电感]]**：$L = 10\text{ mH}$（工字功率电感）`,
            R`**[[bb_c|电容]]**：$C = 1\ \mu\text{F}$（无极性 CBB 薄膜电容）`,
            R`**固有谐振频率**：$\omega_0 = \frac{1}{\sqrt{10^{-2} \times 10^{-6}}} = 10^4\text{ rad/s} \implies f_0 = \frac{\omega_0}{2\pi} \approx 1.59\text{ kHz}$（周期 $T_0 \approx 628\ \mu\text{s}$，普通[[bb_scope|示波器]]调到 $200\ \mu\text{s/div}$ 即可清晰定格！）`,
            R`**串联临界电阻**：$R_{\text{crit}} = 2\sqrt{\frac{L}{C}} = 2\sqrt{\frac{10^{-2}}{10^{-6}}} = 200\ \Omega$。`,
            R`**[[bb_pot|电位器选型]]**：配一只 **$0\text{–}1\text{ k}\Omega$ 线性电位器**。当你把旋钮从 $0\ \Omega$ 慢慢顺时针拧大：`,
          ],
        },
        {
          kind: 'ol',
          items: [
            R`**$R_{\text{total}} \approx 40\ \Omega$**（欠阻尼）：示波器屏幕上出现剧烈的 $1.56\text{ kHz}$ 衰减正弦振铃，电压向下冲破 $0\text{ V}$ 线；`,
            R`**$R_{\text{total}} = 200\ \Omega$**（临界阻尼）：振铃恰好被彻底“掐死”，波形以最利落的弧线一头扎回 $0\text{ V}$ 且纹丝不动；`,
            R`**$R_{\text{total}} \ge 500\ \Omega$**（过阻尼）：继续拧大电阻，波形反而不干脆了，拖出一条长长的迟钝尾巴！`,
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**实验室真实踩坑预警（寄生电阻 $R_L$）**：真实 $10\text{ mH}$ 电感并不是理想零电阻，它的铜线绕组自带 **[[bb_l|$R_L \approx 8\text{–}15\ \Omega$]]** 的直流电阻！因此就算你把电位器拧到 $0\ \Omega$，回路总电阻 $R_{\text{total}} = R_{\text{pot}} + R_L$ 依然不为零，波形总会慢慢衰减；同时临界阻尼对应的电位器读数也不是 $200\ \Omega$，而是 $R_{\text{pot}} = 200\ \Omega - R_L$！`,
        },
        { kind: 'figure', svg: SVG_BENCH_LIGHT + lightSvg(SVG_BENCH_DARK), caption: '图 6-1：3D 面包板实操蓝图：L = 10 mH, C = 1 µF, R_crit = 200 Ω（f₀ ≈ 1.59 kHz）' },
        { kind: 'p', text: '**实验安全与示波器设置**' },
        {
          kind: 'table',
          head: ['项目', '本实验台的做法'],
          rows: [
            [
              '[[bb_psu,bb_spdt|激励源]]',
              R`**${SUPPLY}** + SPDT 拨动开关：拨到「充电」让 $C$ 充到 $5\text{ V}$；拨到「放电」把 RLC 回路无缝切换成短接放电态，示波器单次捕捉自然响应。（也可用函数信号发生器输出 $0\text{–}5\text{ V}$、$100\text{ Hz}$ 方波周期性触发——它约 $50\ \Omega$ 的输出阻抗会串进回路，临界点随之左移。）`,
            ],
            [
              '[[bb_l|电感 L]]',
              R`$10\text{ mH}$ 铁氧体工字电感或色环功率电感，绕组电阻 $R_L \approx 8\text{–}15\ \Omega$（本台按 $10\ \Omega$）；最大电流 $250\text{ mA}$，本实验峰值只有约 $v_0/\sqrt{L/C} = 5\text{ V}/100\ \Omega = 50\text{ mA}$`,
            ],
            ['[[bb_c|电容 C]]', R`$1\ \mu\text{F}$ 薄膜（CBB）或无极性瓷片电容，耐压 $\ge 50\text{ V}$。欠阻尼时电容电压会反向过冲至负值，**严禁使用有极性铝电解电容**`],
            [
              '[[bb_pot|电阻 R]]',
              R`$0\text{–}1\text{ k}\Omega$ 线性单圈电位器（B1K）当可变电阻；回路总电阻 $R = R_{\text{pot}} + R_L$，临界点在 $R_{\text{pot}} = 200\ \Omega - R_L \approx 190\ \Omega$`,
            ],
            [
              '[[bb_scope,bb_probe|示波器]]',
              R`CH1 跨接在 $C$ 两端（探头地线夹接电容的接地端），DC 耦合 $2\text{ V/div}$；$200\ \mu\text{s/div}$（10 格共 $2\text{ ms}$，约 3 个自然周期 $T_0 \approx 628\ \mu\text{s}$）；下降沿触发、触发电平 $+4.5\text{ V}$，单次（Single）捕捉`,
            ],
            [
              '屏上的反向过冲',
              R`$R = 40\ \Omega$ 时首个负峰约 $-2.6\text{ V}$；电位器拧到 $0$（只剩 $R_L \approx 10\ \Omega$）时约 $-4.3\text{ V}$——都在 $2\text{ V/div}$ 的屏幕之内`,
            ],
            [
              '[[scale_note|为什么不做 1000× 缩放]]',
              R`阻尼状态只取决于 $R$ 与 $\sqrt{L/C} = 100\ \Omega$ 之比，元件按原值搭建；十几欧的回路电阻也不会过流，$L$、$C$ 本身把峰值电流限在约 $50\text{ mA}$`,
            ],
            ['拔线安全', '严禁在电感带大电流时直接拔线开路；用 SPDT 开关把 RLC 回路切换到短接放电态，避免高压反电动势打火'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 03 层就是这张蓝图的 3D 实验台：[[bb_psu|${SUPPLY}]]经 [[bb_spdt|SPDT 开关]]充电，点白色拨钮「放电」触发[[bb_scope|示波器]]；拖动[[bb_pot|电位器]]的黑色旋钮（或上方 R_pot 滑块），在 $R_{\text{pot}} \approx 190\ \Omega$（滑块上的绿色刻度）看振铃消失，再拧到 $490\ \Omega$ 以上看过阻尼拖尾。镜头切到「示波器」可看清屏幕。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 7: the guided example */
    {
      act_index: 7,
      badge: '第 7 幕',
      title: '苏格拉底引导：求无源并联 RLC 欠阻尼完整响应 v(t)',
      sync: { layer: L1, halo: ['sch_node'], params: GD(0) },
      blocks: [
        {
          kind: 'guided',
          // all steps answered: the stage uncovers the example's numbers and its waveform
          done_params: { reveal: 9 },
          title: '5 步通关：无源并联 RLC 欠阻尼求解',
          source: 'Alexander, Sadiku & Fredette (2026) Section 8.4',
          problem: R`一个无源并联 RLC 电路中，[[sch_r|R = 25 Ω]]，[[sch_l|L = 0.4 H]]，[[sch_c|C = 250 μF]]。已知 t = 0 时刻电容电压 v(0) = 15 V，[[sch_il|电感电流 i_L(0) = 0.15 A]]（[[sch_ir,sch_il,sch_ic|各支路参考方向均向下，与 v(t) 关联]]）。请一步步求出 t ≥ 0 时的完整节点电压表达式 v(t)。`,
          problem_svg: SVG_GD_PROBLEM,
          steps: [
            {
              title: '第一步：算出并联电路的 α 与 ω₀，避开“串联公式混用”陷阱',
              mini_svg: MINI_STEP1,
              question: '请先计算该无源并联 RLC 电路的尼珀频率 α 和无阻尼谐振角频率 ω₀，并判断它的阻尼状态。',
              hint: R`$\alpha = \frac{1}{2RC} = \frac{1}{2 \times 25 \times 250 \times 10^{-6}},\quad \omega_0 = \frac{1}{\sqrt{LC}} = \frac{1}{\sqrt{0.4 \times 250 \times 10^{-6}}}$`,
              options: [
                {
                  text: 'α = 31.25 Np/s，ω₀ = 100 rad/s → 欠阻尼',
                  correct: false,
                  feedback: '抓到啦！31.25 = 25/(2×0.4) 是串联公式 R/(2L)！请立刻抬头看图：这是并联 RLC，阻尼系数必须是 α = 1/(2RC)。',
                },
                {
                  text: 'α = 80 Np/s，ω₀ = 100 rad/s → 欠阻尼',
                  correct: true,
                  feedback: '漂亮！并联用 α = 1/(2RC) = 1/0.0125 = 80 Np/s，ω₀ = 1/√(10⁻⁴) = 100 rad/s；α < ω₀，欠阻尼。',
                },
                {
                  text: 'α = 125 Np/s，ω₀ = 100 rad/s → 过阻尼',
                  correct: false,
                  feedback:
                    '检查一下分母里的系数 2 和单位换算！250 μF = 2.5×10^-4 F，2 × 25 × 2.5×10^-4 = 0.0125，α = 1/0.0125 = 80 Np/s；漏乘 2 会算成 1/(RC) = 160，125 并不是 1/(2RC) 的结果，“过阻尼”也就无从谈起。',
                },
              ],
              board: [R`\alpha = 80\text{ Np/s} < \omega_0 = 100\text{ rad/s} \implies \text{欠阻尼 (Underdamped)}`],
              halo: ['sch_r', 'alpha_box', 'omega0'],
              params: GD(0),
              layer: L1,
            },
            {
              title: '第二步：写出特征根与欠阻尼通解骨架',
              mini_svg: MINI_STEP2,
              question: '已知 α = 80 Np/s、ω₀ = 100 rad/s，阻尼振荡角频率 ω_d 和通解骨架分别是什么？',
              hint: R`$\omega_d = \sqrt{\omega_0^2 - \alpha^2} = \sqrt{100^2 - 80^2} = 60\text{ rad/s}$`,
              options: [
                {
                  text: 'ω_d = 100 rad/s，v(t) = e^(-80t)(B₁ cos 100t + B₂ sin 100t)',
                  correct: false,
                  feedback: '小心！三角函数里的角频率是阻尼频率 ω_d = √(ω₀² - α²)，不是无阻尼频率 ω₀。有阻尼时振荡节拍会被拉慢。',
                },
                {
                  text: 'ω_d = 60 rad/s，v(t) = (B₁ + B₂ t)e^(-80t)',
                  correct: false,
                  feedback: '(B₁ + B₂ t)e^(-αt) 是临界阻尼（重实根）的专属模板，共轭复根必须用余弦和正弦组合！',
                },
                {
                  text: 'ω_d = 60 rad/s，v(t) = e^(-80t)(B₁ cos 60t + B₂ sin 60t)',
                  correct: true,
                  feedback: '正确！ω_d = √(100² − 80²) = 60 rad/s，一对共轭复根 −80 ± j60 对应被 e^(−80t) 夹紧的余弦 + 正弦组合。',
                },
              ],
              board: [R`s_{1,2} = -80 \pm j60\text{ s}^{-1},\quad v(t) = e^{-80t}(B_1\cos 60t + B_2\sin 60t)`],
              halo: ['sp_poles', 'sp_circle'],
              params: GD(1),
              layer: L2,
            },
            {
              title: '第三步：利用换路定则确定第一个系数 B₁',
              mini_svg: MINI_STEP3,
              question: '把 t = 0⁺ 代入通解 v(t) = e^(-80t)(B₁ cos 60t + B₂ sin 60t)，结合已知初值 v(0) = 15 V，B₁ 等于多少？',
              hint: R`$v(0^+) = e^{0}(B_1\cos 0 + B_2\sin 0) = B_1 = v(0^-)$`,
              options: [
                { text: 'B₁ = 15 V', correct: true, feedback: '对！t = 0⁺ 时指数因子为 1、正弦项为 0，v(0⁺) 恰好就是 B₁；电容电压不能突变，B₁ = 15 V。' },
                { text: 'B₁ = 0 V', correct: false, feedback: 't = 0 时 cos(0) = 1 而 sin(0) = 0，因此 v(0⁺) 恰好就等于 B₁，不会是 0。' },
                { text: 'B₁ = -15 V', correct: false, feedback: '题目已给出 v(0) = +15 V，电容电压不可突变，保持正号即可。' },
              ],
              board: [R`B_1 = v(0^+) = 15\text{ V}`],
              halo: ['sch_c', 'wf_start'],
              params: GD(2),
              layer: L2,
            },
            {
              title: '第四步：用节点 KCL 算出导数初值 dv/dt(0⁺)',
              mini_svg: MINI_STEP4,
              question:
                '回顾 W4-L6：在 t = 0⁺ 时刻，三个并联支路满足 i_R(0⁺) + i_L(0⁺) + C·dv/dt(0⁺) = 0。已知 v(0⁺)=15 V、R=25 Ω、i_L(0⁺)=0.15 A、C=250 μF，请问 dv/dt(0⁺) 等于多少？',
              hint: R`$\frac{dv}{dt}(0^+) = \frac{i_C(0^+)}{C} = -\frac{v(0^+)/R + i_L(0^+)}{C} = -\frac{0.60 + 0.15}{250 \times 10^{-6}}$`,
              options: [
                { text: '-2400 V/s', correct: false, feedback: '你只算了电阻支路电流 0.60 A，忘记加上电感初始电流 i_L(0⁺) = 0.15 A 了！两个支路同时从电容抽水。' },
                { text: '+3000 V/s', correct: false, feedback: '符号反了！因为 i_R + i_L + i_C = 0，移项后 i_C = -(i_R + i_L) = -0.75 A，电容正在剧烈放电，电压必然迅速下降！' },
                { text: '-3000 V/s', correct: true, feedback: '完全正确！i_C(0⁺) = −(0.60 + 0.15) = −0.75 A，除以 C = 2.5×10⁻⁴ F 得 −3000 V/s：电容在两条支路的夹击下快速放电。' },
              ],
              board: [R`\frac{dv}{dt}(0^+) = -\frac{0.75}{2.5 \times 10^{-4}} = -3000\text{ V/s}`],
              halo: ['sch_ir', 'sch_il', 'sch_ic'],
              params: GD(3),
              layer: L1,
            },
            {
              title: '第五步：求导代入解出 B₂，拼装最终表达式',
              mini_svg: MINI_STEP5,
              question: '利用欠阻尼导数初值关系 dv/dt(0⁺) = -α B₁ + ω_d B₂，代入 α=80、ω_d=60、B₁=15、dv/dt(0⁺)=-3000，求 B₂ 并写出完整 v(t)。',
              hint: R`$-\alpha B_1 + \omega_d B_2 = \frac{dv}{dt}(0^+) \implies -80(15) + 60 B_2 = -3000$`,
              options: [
                {
                  text: 'B₂ = -50 V，v(t) = e^(-80t)(15 cos 60t - 50 sin 60t) V',
                  correct: false,
                  feedback: '这是经典粗心错误：直接拿 -3000 / 60 = -50，忘了乘积求导法则里还有 -α B₁ = -1200 这一项！',
                },
                {
                  text: 'B₂ = -30 V，v(t) = e^(-80t)(15 cos 60t - 30 sin 60t) V',
                  correct: true,
                  feedback: '通关！60 B₂ = −3000 + 1200 = −1800，B₂ = −30 V；代回通解即得完整响应。',
                },
                {
                  text: 'B₂ = -70 V，v(t) = e^(-80t)(15 cos 60t - 70 sin 60t) V',
                  correct: false,
                  feedback: '移项符号出错了！-1200 移到等号右边要变加号：-3000 + 1200 = -1800，而不是 -3000 - 1200 = -4200。',
                },
              ],
              board: [R`B_2 = -30\text{ V} \implies v(t) = e^{-80t}(15\cos 60t - 30\sin 60t)\text{ V}\quad (t \ge 0)`],
              halo: ['wf_curve', 'wf_env'],
              params: GD(4),
              layer: L2,
            },
          ],
          conclusion: R`五步通关：$\alpha = 80\text{ Np/s} < \omega_0 = 100\text{ rad/s}$（$R = 25\ \Omega > R_{\text{crit}} = \frac{1}{2}\sqrt{L/C} = 20\ \Omega$），$\omega_d = 60\text{ rad/s}$，$B_1 = 15\text{ V}$，$\frac{dv}{dt}(0^+) = -3000\text{ V/s}$，$B_2 = -30\text{ V}$：$v(t) = e^{-80t}(15\cos 60t - 30\sin 60t)\text{ V}$。左侧 02 层已揭晓这条波形、它的包络与极点 $-80 \pm j60$；滑块也已解锁，把 R 拖到 $20\ \Omega$ 以下看它变成过阻尼。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 8: the quiz */
    {
      act_index: 8,
      badge: '诊断测验',
      title: 'W4-L7 随堂诊断测验：特征方程与三种阻尼状态',
      sync: { layer: L1, halo: [], params: presetParams('demo') },
      blocks: [
        { kind: 'p', text: '以下 4 道诊断题覆盖本课四个考点：串联与并联阻尼的反直觉对偶、面包板实用临界电阻、s 平面极点与慢主导模态、欠阻尼的待定系数。四题全部答对即通关本课。' },
      ],
      inline_svg: SVG_QUIZ_ACT,
      figure_caption: '诊断测验的四个考点',
      quiz: [
        {
          id: 'w4l7_q1',
          concept: '串并联阻尼反直觉对偶',
          review_act: 1,
          question: '一个处于临界阻尼状态的无源并联 RLC 电路，如果保持 L 和 C 不变，将并联电阻 R 增大为原来的 2 倍，电路将变为哪种阻尼状态？',
          options: [
            {
              key: 'A',
              text: '过阻尼，因为电阻越大消耗能量越快',
              correct: false,
              feedback: R`“电阻越大越耗能”只在串联里成立：并联电阻上的功率是 $v^2/R$，R 加倍后支路电流 $i_R = v/R$ 减半、耗能变少；$\alpha = 1/(2RC)$ 跟着减半，阻尼变弱而不是变强。`,
            },
            {
              key: 'B',
              text: '保持临界阻尼，因为 ω₀ = 1/√(LC) 没有变化',
              correct: false,
              feedback: R`$\omega_0$ 确实没变，但临界的条件是 $\alpha = \omega_0$：并联的 $\alpha = 1/(2RC)$ 会随 R 加倍而减半，两者不再相等。`,
            },
            { key: 'C', text: '欠阻尼，因为并联电路中 α = 1/(2RC)，R 增大导致分流耗能减弱', correct: true },
            {
              key: 'D',
              text: '无法判断，取决于初始电压大小',
              correct: false,
              feedback: R`阻尼状态只由特征方程 $s^2 + 2\alpha s + \omega_0^2 = 0$ 的根决定，也就是只由 R、L、C 决定；初始电压只影响待定系数的大小。`,
            },
          ],
          feedback_correct: R`在并联 RLC 电路中，尼珀频率 $\alpha = 1/(2RC)$ 与 R 成反比。原临界态 $\alpha = \omega_0$；R 加倍后 α 减半，变为 $\alpha < \omega_0$，因此进入欠阻尼状态。物理上并联电阻增大导致支路电流 $i_R = v/R$ 减小，耗能功率 $v^2/R$ 下降，阻尼变弱。`,
          feedback_wrong: R`先写出并联 RLC 的 $\alpha = 1/(2RC)$，再比较 R 加倍后的 α 与 $\omega_0$。`,
          figure: SVG_Q1,
          sync: { layer: L1, halo: ['sch_r', 'alpha_box'], params: { ...presetParams('demo'), topo: 'parallel', R: 50, preset: 'free' } },
        },
        {
          id: 'w4l7_q2',
          concept: '面包板临界电阻计算',
          review_act: 6,
          question:
            '在 Breadboard Lab 面包板实验中，你选用 L = 10 mH、C = 1 μF 搭建串联 RLC 电路，已知电感自身绕组寄生直流电阻 R_L = 12 Ω。为了使电路恰好达到临界阻尼，外接电位器 R_pot 应调至多少欧姆？',
          options: [
            { key: 'A', text: '188 Ω', correct: true },
            {
              key: 'B',
              text: '200 Ω',
              correct: false,
              feedback: R`$200\ \Omega$ 是回路的**总**临界电阻 $2\sqrt{L/C}$；电感绕组自带的 $12\ \Omega$ 已经串在回路里，电位器只需补上剩下的部分。`,
            },
            {
              key: 'C',
              text: '212 Ω',
              correct: false,
              feedback: R`寄生电阻 $R_L$ 和电位器串联在同一个回路里，它是“白送”的阻尼，应当从 $200\ \Omega$ 里减去，而不是再加上。`,
            },
            {
              key: 'D',
              text: '38 Ω',
              correct: false,
              feedback: R`$38 = 50 - 12$ 用的是并联临界电阻 $\frac{1}{2}\sqrt{L/C} = 50\ \Omega$；这是串联回路，临界总电阻是 $2\sqrt{L/C} = 200\ \Omega$。`,
            },
          ],
          feedback_correct: R`串联临界总电阻 $R_{\text{crit}} = 2\sqrt{L/C} = 2\sqrt{10^{-2} / 10^{-6}} = 200\ \Omega$。由于电感自带 $12\ \Omega$ 串联寄生电阻，外接电位器只需调至 $R_{\text{pot}} = 200 - 12 = 188\ \Omega$。`,
          feedback_wrong: R`先求回路的总临界电阻 $2\sqrt{L/C}$，再想想电感绕组的 $R_L$ 在回路里扮演什么角色。`,
          figure: SVG_Q2,
          sync: { layer: L3, halo: ['bb_l', 'bb_pot'], params: presetParams('bench') },
        },
        {
          id: 'w4l7_q3',
          concept: 's 平面极点与慢主导模态',
          review_act: 3,
          question: '某无源 RLC 电路的特征根为 s₁ = -2 s⁻¹ 和 s₂ = -50 s⁻¹。关于该电路的响应形态，以下说法最准确的是：',
          options: [
            {
              key: 'A',
              text: '欠阻尼振荡，振荡频率为 50 rad/s',
              correct: false,
              feedback: R`欠阻尼要求一对共轭复根 $-\alpha \pm j\omega_d$；这里两根的虚部都为 0，波形不会振荡，50 也不是任何振荡频率。`,
            },
            {
              key: 'B',
              text: '临界阻尼，将在 1/50 s 内迅速归零',
              correct: false,
              feedback: R`临界阻尼是二重根 $s_1 = s_2$；这里 $-2 \neq -50$，是两个不相等的负实根。而且 $e^{-2t}$ 在 $1/50\text{ s}$ 时还剩约 $96\%$，远没有归零。`,
            },
            {
              key: 'C',
              text: '不稳定发散，因为有两个负实根',
              correct: false,
              feedback: R`负实根对应 $e^{-2t}$、$e^{-50t}$ 这样的衰减指数，极点都在左半平面，电路是稳定的；只有根的实部为正（右半平面）才会发散。`,
            },
            { key: 'D', text: '过阻尼，且长期拖尾速度由靠近虚轴的慢主导极点 s₁ = -2 s⁻¹ 决定', correct: true },
          ],
          feedback_correct: R`两不等负实根对应过阻尼状态，通解为 $A_1e^{-2t} + A_2e^{-50t}$。快模态 $e^{-50t}$ 在不到 $0.1\text{ s}$ 内即衰减殆尽，剩余的漫长衰减拖尾完全由离虚轴更近的慢极点 $s_1 = -2\text{ s}^{-1}$ 主导。`,
          feedback_wrong: R`先看两根是实根还是复根、相等还是不等，再看哪一个离虚轴更近。`,
          figure: SVG_Q3,
          sync: { layer: L2, halo: ['sp_slow', 'sp_poles'], params: presetParams('ex1', { R: 12.5 }) },
        },
        {
          id: 'w4l7_q4',
          concept: '欠阻尼初值与待定系数',
          review_act: 5,
          question: '某欠阻尼电路自然响应通解为 v(t) = e^(-3t)(B₁ cos 4t + B₂ sin 4t) V。若已知 v(0⁺) = 10 V 且 dv/dt(0⁺) = 10 V/s，则待定系数 B₁ 和 B₂ 分别为：',
          options: [
            {
              key: 'A',
              text: 'B₁ = 10 V，B₂ = 2.5 V',
              correct: false,
              feedback: R`$2.5 = 10/4$ 只用了 $\omega_d B_2 = \frac{dv}{dt}(0^+)$，漏掉了乘积求导带出的 $-\alpha B_1 = -30$ 这一项。`,
            },
            { key: 'B', text: 'B₁ = 10 V，B₂ = 10 V', correct: true },
            {
              key: 'C',
              text: 'B₁ = 10 V，B₂ = -5 V',
              correct: false,
              feedback: R`$-5 = (10 - 30)/4$：移项时 $-\alpha B_1 = -30$ 的符号没有变号；应为 $4B_2 = 10 + 30 = 40$。`,
            },
            {
              key: 'D',
              text: 'B₁ = 10 V，B₂ = 5 V',
              correct: false,
              feedback: R`代回检验：$B_2 = 5$ 时 $\frac{dv}{dt}(0^+) = -3 \times 10 + 4 \times 5 = -10\text{ V/s}$，与已知的 $+10\text{ V/s}$ 不符。`,
            },
          ],
          feedback_correct: R`由 $v(0^+) = B_1$ 得 $B_1 = 10\text{ V}$；再由 $\frac{dv}{dt}(0^+) = -\alpha B_1 + \omega_d B_2$，代入 $-3(10) + 4 B_2 = 10$，得 $4 B_2 = 40$，故 $B_2 = 10\text{ V}$。`,
          feedback_wrong: R`$B_1$ 直接由 $v(0^+)$ 读出；$B_2$ 要用导数初值 $\frac{dv}{dt}(0^+) = -\alpha B_1 + \omega_d B_2$。`,
          figure: SVG_Q4,
          sync: { layer: L2, halo: ['wf_start'], params: presetParams('ex1', { R: 6 }) },
        },
      ],
    },
  ],
};

export default W4_L7;
