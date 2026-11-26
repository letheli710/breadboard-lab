// W5-L1 · 正弦波、相位比较与相量变换（Sinusoids & Phasors） (lesson sheet: docs/lessons/W5-L1.md).
// The sheet calls it Type D; it is the one World 5 lesson without a breadboard, so the whole stage is
// 2D SVG / HTML: no three.js and no 3D shared part anywhere in this folder (lesson.test.ts checks).
// The professor's opening and the text of the five acts, the act figures (svgs.ts), the guided
// example and the diagnostic quiz are reproduced from the sheet; [[id|…]] only links a term to the
// stage (the words are unchanged). Changes of form:
// - the opening remarks open act 1; the sub-headings (1.1 … 5.3) are bold lines; each figure stands
//   where the sheet has it; display formulas sit in ② / ③ cards or run inline (a lead-in sentence
//   becomes the card title, a long one stays a paragraph above its card); the nested bullets of 3.2
//   are a list of their own;
// - the guided example (the sheet's Socratic JSON, after the five acts) and the quiz are an act of
//   their own (6): inside act 5 the open guided step would take the stage over from act 5's ×jω
//   demo while act 5 is read; plain-text maths of the JSON (20 sin(4t + 30°) …) is set as TeX; the
//   right option moves between positions (the sheet put it second four times); the design note's
//   summary is the act's first line (its field names are dropped), the quiz's passing score (the
//   site uses 4/4) and the 「Claude 工程落地清单」 are left out; the closing remark (教授收官点睛,
//   the next-lesson preview) follows the quiz; `\angle{-}60^\circ` keeps the minus of an angle unary;
// - anti-spoiler: the guided example (2 dv/dt + 6v = 20 sin(4t + 30°)) is a problem of its own — no
//   act works it — so no ③ card moves; its step diagrams no longer print their answers (svgs.ts);
//   on the stage, its equation (layer 03 「引导题」) shows each number only once the steps reach it
//   (stage param w51_g = steps solved; done_params uncovers the rest).
// Fixed in the sheet's figures (svgs.ts): figure 1.1's projection point and bridge, figure 2.1's
// compass arrows and ruler marks, figure 5.1's ÷jω length.
// Added (the sheet has none): the hover map; praise for the right options and the guided example's
// conclusion; per-option quiz feedback written from the explanations; the quiz figures and the
// guided example's road map (figures.ts); a stage pointer under example 5.1.

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { SVG_GUIDED_MAP, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './figures';
import { argDeg, EX31 } from './model';
import { L1, L2, L3, P } from './parts';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5 } from './svgs';

const PhasorLayer = lazy(() => import('./PhasorLayer'));
const PhaseLayer = lazy(() => import('./PhaseLayer'));
const OperatorLayer = lazy(() => import('./OperatorLayer'));

const R = String.raw;

const at = (layer: string, halo: string[], params: Record<string, unknown>): StageSync => ({ layer, halo, params });
/** a guided step's stage: `solved` steps uncovered */
const G = (solved: number, extra: Record<string, unknown> = {}) => ({ [P.g]: solved, ...extra });

const W5_L1: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: PhasorLayer, [L2]: PhaseLayer, [L3]: OperatorLayer },
  lesson_meta: {
    lesson_id: 'W5-L1',
    world: 'World 5',
    title: '正弦波、相位比较与相量变换（Sinusoids & Phasors）',
    subtitle: '旋转指针 → 正弦波 → t=0 复平面快照：相位比较铁律、复数四则运算与 d/dt ↔ jω',
    lesson_type: 'D',
    lesson_type_label: '纯 2D 动态旋转相量课（纯数学相量入门，不挂 3D 面包板）',
    estimated_minutes: 50,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Section 9.1–9.3: Introduction, Sinusoids, Phasors'],
    },
    textbook_supplement: 'Introductory Circuit Analysis, 14th Ed. (Boylestad) — Ch. 13–14',
    prerequisites: ['W4-L4 一阶微分方程', 'W4-L5 稳态响应'],
    learning_objectives: [
      R`由旋转相量的投影读出正弦波的幅值 $V_m$、角频率 $\omega$ 与初相 $\phi$`,
      '把两个同频正弦统一成正幅值余弦，判断谁超前、谁滞后、相差多少度',
      '用欧拉公式在时域正弦与相量之间互换，直角坐标转极坐标时校正象限',
      R`用相量加法合成同频正弦波，用 $\frac{d}{dt} \leftrightarrow j\omega$ 把交流稳态微分方程化为代数方程`,
    ],
    next_lesson: 'W5-L2',
    next_lesson_title: '元件相量关系、复阻抗与 3D 面包板 RC 相移实操',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 相量旋转',
        short: '01 相量旋转',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '2D 旋转相量矢量图 ↔ 时域正弦波实时投影：长度 Vₘ 的指针以 ω 逆时针旋转，实轴投影就是 Vₘ cos(ωt + φ)；“冻结 t=0 快照”剥离 e^(jωt)，锁定静态相量 V = Vₘ∠φ。',
      },
      {
        id: L2,
        label: '02 相位比较',
        short: '02 相位比较',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: 'sin↔cos 统一化简与超前/滞后相位差尺：三角罗盘把 ±sin、−cos 对齐到 +cos 基准轴，标尺读出 Δφ = φ₂ − φ₁ 与超前/滞后判定；可叠加同频相量平行四边形。',
      },
      {
        id: L3,
        label: '03 微积分旋转',
        short: '03 微积分旋转',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '复平面微积分旋转 (×jω / ÷jω) 演示台：乘以 jω 逆时针转 90° 并伸缩 ω 倍，除以 jω 顺时针转 90° 并伸缩 1/ω 倍；“方程拼合”把微积分方程各项相量首尾相接，拼到激励源相量上。',
      },
    ],
    hover_map: {
      ph_vec: { label: '旋转指针（复平面矢量）', desc: '长度 Vₘ，以角速度 ω 逆时针旋转；任意时刻与实轴的夹角都是 ωt + φ' },
      ph_amp: { label: '幅值 Vₘ（指针长度）', desc: '决定波形的最高峰 +Vₘ 与最低谷 −Vₘ' },
      ph_omega: { label: '角频率 ω（转动快慢）', desc: '转满一圈 2π rad 用时一个周期 T：ω = 2πf = 2π/T（单位 rad/s）' },
      ph_period: { label: '周期 T = 2π/ω', desc: '时间轴上相邻两个波峰的间隔；频率 f = 1/T（Hz）' },
      ph_phi: { label: '初相位 φ（t = 0 的起跑角）', desc: 'φ > 0：t = 0 时指针已逆时针转过 φ，波形向左平移、提前到达峰值' },
      ph_proj: { label: '实轴投影 Vₘ cos(ωt + φ)', desc: '指针尖端在水平实轴上的影子；竖直展开后就是右侧时域波形的当前值' },
      ph_wave: { label: '时域余弦波 v(t)', desc: '投影值随时间的记录：v(t) = Vₘ cos(ωt + φ) = Re{Vₘ e^(j(ωt+φ))}' },
      ph_snap: { label: 't = 0 快照：相量 V = Vₘ∠φ', desc: '剥离公共旋转因子 e^(jωt) 后剩下的、不含时间 t 的复数' },
      ph_rect: { label: '直角坐标 x + jy', desc: 'x = r cos φ，y = r sin φ：做加减法时必须用它' },
      ph_quad: { label: '象限校正', desc: 'x < 0 时 arctan(y/x) 落错象限：第二象限 +180°，第三象限 −180°' },
      cmp_pcos: { label: '罗盘 +cos 轴（0°）', desc: '基准轴：所有波形统一成正幅值 cos 再比较、再写相量' },
      cmp_nsin: { label: '罗盘 −sin 轴（+90°）', desc: '−sin(ωt + θ) = cos(ωt + θ + 90°)：负正弦超前余弦 90°' },
      cmp_ncos: { label: '罗盘 −cos 轴（±180°）', desc: '−cos(ωt + θ) = cos(ωt + θ ± 180°)：负号等于翻转 180°' },
      cmp_psin: { label: '罗盘 +sin 轴（−90°）', desc: 'sin(ωt + θ) = cos(ωt + θ − 90°)：正弦落后余弦 90°' },
      pc_v1: { label: '波形 1（统一为正余弦后）', desc: '从它的函数轴出发、再转过自身相位 θ，落在 φ₁ = θ + 偏移' },
      pc_v2: { label: '波形 2（统一为正余弦后）', desc: '从它的函数轴出发、再转过自身相位 θ，落在 φ₂ = θ + 偏移' },
      pc_ruler: { label: '相位差标尺 Δφ = φ₂ − φ₁', desc: '只有同频率、同为 cos、正幅值之后读出的相位差才算数' },
      pc_verdict: { label: '超前 / 滞后判定', desc: 'Δφ > 0：波形 2 超前波形 1；Δφ < 0：波形 2 滞后' },
      pc_waves: { label: '两条同频余弦波', desc: '超前的那条先到达峰值（峰值点在左）' },
      pc_para: { label: '矢量平行四边形', desc: '同频相量相加：实部加实部、虚部加虚部' },
      pc_sum: { label: '合相量', desc: '两相量之和，转回极坐标后贴回 cos(ωt + φ)' },
      op_base: { label: '原相量 I = |I|∠φ', desc: '被求导或积分的那个正弦量的相量' },
      op_diff: { label: '求导相量 jωI', desc: 'd/dt ↔ ×jω：逆时针旋转 90°，长度 × ω' },
      op_int: { label: '积分相量 I/(jω)', desc: '∫dt ↔ ÷jω：顺时针旋转 90°，长度 × 1/ω' },
      op_rot_p: { label: '×jω：逆时针 +90°', desc: 'j = 1∠+90°，乘以 jω 还要把长度乘以 ω' },
      op_rot_m: { label: '÷jω：顺时针 −90°', desc: '1/j = −j = 1∠−90°，除以 jω 还要把长度除以 ω' },
      eq_src: { label: '激励源相量 Vₛ', desc: '方程右边的正弦激励，统一为正余弦后拍下的 t = 0 快照' },
      eq_chain: { label: '各项相量首尾拼合', desc: 'a·X、b·X/(jω)、c·jωX 首尾相接；X 取到解时恰好闭合到激励相量' },
      eq_d: { label: '系数复数 D = a + j(ωc − b/ω)', desc: '把公因子提出后剩下的复数：微分方程变成 D·X = Vₛ' },
      eq_sol: { label: '响应相量 X = Vₛ / D', desc: '一步复数除法得到稳态解，再逆变换回 cos(ωt + φ)' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '从旋转指针到正弦波——三要素与几何投影直觉',
      sync: at(L1, ['ph_vec', 'ph_proj'], { [P.vm]: 12, [P.w]: 50, [P.phi]: 10, [P.play]: true }),
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎进入交流电路（AC Circuits）的真正大门！上周我们在 **W4-L4 一阶微分方程** 和 **W4-L5 稳态响应** 里，为了求一个正弦激励下的特解，不得不硬着头皮设待定系数 $A\cos\omega t + B\sin\omega t$、求导、联立方程组，算得满头大汗。如果以后电路里有三个电感、四个电容，难道我们要解七阶微分方程吗？`,
        },
        {
          kind: 'p',
          text: '十九世纪的电气工程大师施泰因梅茨（Charles Proteus Steinmetz）说：**“不需要！”** 今天这堂纯 2D 数学武器课，我们把面包板先放一边，专注于打造交流电路史上最伟大的“降维打击”工具——**相量变换（Phasor Transform）**。学完今天这 5 幕，你会亲眼看到：令人头疼的微积分方程，如何在复平面上瞬间退化成初中的四则运算！',
        },
        { kind: 'p', text: '**1.1 教授导学与几何直觉（Boylestad Ch. 13–14 坡度补位）**' },
        {
          kind: 'p',
          text: R`很多同学第一次背正弦波公式 $v(t) = V_m \cos(\omega t + \phi)$ 时，脑子里只有一条上下扭动的曲线。但我要请你先看左侧舞台 **图层 01**：把正弦波想象成游乐场里一架**匀速逆时针旋转的摩天轮**（或者一根在复平面上以角速度 $\omega$ 逆时针旋转的[[ph_vec|发光指针]]）：`,
        },
        {
          kind: 'ol',
          items: [
            R`[[ph_amp|**指针的长度**]]就是**幅值（Amplitude）$V_m$**：它决定了波形能达到的最高峰和最低谷。`,
            R`[[ph_omega|**指针转动的快慢**]]就是**角频率（Angular Frequency）$\omega$**（单位 $\text{rad/s}$）：指针转满一圈是 $2\pi$ 弧度，所用时间就是一个[[ph_period|**周期 $T$**]]（单位 $\text{s}$），每秒转的圈数就是**频率 $f = 1/T$**（单位 $\text{Hz}$），因此三者死死锁定为：$\displaystyle\omega = 2\pi f = \frac{2\pi}{T}$`,
            R`[[ph_phi|**指针在 $t = 0$ 时的起跑角度**]]就是**初相位（Phase）$\phi$**：如果 $\phi > 0$，说明在发令枪响（$t=0$）之前，指针就已经提前逆时针转过了 $\phi$ 角度；波形在时间轴上反而**向左平移**（提前达到峰值！）。`,
            R`**余弦波的本质**：在任何时刻 $t$，这根旋转指针与水平轴（实轴）的夹角都是 $\omega t + \phi$。此时指针尖端向**水平实轴（或按竖直展开投影轴）**投下的[[ph_proj|影子长度]]，不多不少，正好就是 [[ph_wave|$V_m \cos(\omega t + \phi)$]]！`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**为什么电路学界（Sadiku 标准）偏爱 $\cos$ 而不是 $\sin$？** 因为欧拉公式 $e^{j\theta} = \cos\theta + j\sin\theta$ 中，$\cos\theta$ 是**实部（$\text{Re}$）**，直接对应水平实轴的投影。把所有波形统一成 $\cos$，后续做相量变换时零摩擦、零符号错误！`,
        },
        { kind: 'p', text: '**1.2 幕内 2D 教学图：旋转相量圆与右侧展开正弦波联动投影图**' },
        { kind: 'figure', svg: SVG_ACT1 },
        { kind: 'p', text: '**1.3 三段式教授板书推导：正弦波三要素提取（Sadiku Example 9.1 同型题）**' },
        {
          kind: 'p',
          text: R`**例题 1.1**：已知某交流电压源的输出波形为 $v(t) = 12\cos(50t + 10^\circ)\text{ V}$，求该正弦波的幅值 $V_m$、初相位 $\phi$、角频率 $\omega$、周期 $T$ 与频率 $f$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`根据标准余弦波定义（Sadiku Eq. 9.1–9.5），任意正弦时域信号均可表示为：$v(t) = V_m \cos(\omega t + \phi)$ 其中角频率 $\omega$、周期 $T$ 与频率 $f$ 满足圆周运动基本关系：$\omega T = 2\pi, \qquad f = \dfrac{1}{T}$`,
        },
        { kind: 'formula', title: '② 纯符号通式：将实测信号表达式与标准型逐项比对系数，得到各参数的纯符号解：', tex: R`T = \frac{2\pi}{\omega}, \qquad f = \frac{\omega}{2\pi}` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: R`将 $V_m = 12\text{ V}$、$\omega = 50\text{ rad/s}$、$\phi = +10^\circ$ 代入纯符号通式：` },
            { label: '1. 幅值', text: R`$V_m = 12\text{ V}$` },
            { label: '2. 初相位', text: R`$\phi = +10^\circ$（说明波形比基准 $\cos(50t)$ 提前了 $10^\circ$）` },
            { label: '3. 角频率', text: R`$\omega = 50\text{ rad/s}$` },
            { label: '4. 周期：', tex: R`T = \frac{2\pi}{50} = \frac{\pi}{25} \approx 0.1257\text{ s} = 125.66\text{ ms}` },
            { label: '5. 频率：', tex: R`f = \frac{50}{2\pi} \approx 7.958\text{ Hz}` },
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授防坑提醒**：注意 $50t + 10^\circ$ 里隐藏着电路学最经典的“混搭写法”——$50t$ 的单位是**弧度（rad）**，而 $10^\circ$ 的单位是**角度（deg）**！如果要在计算器里代具体时间 $t$ 求瞬时电压，**必须先把两边单位统一**（全部转成弧度或全部转成角度），否则算出来的数值会错得离谱！`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '相位超前与滞后的比较铁律——统一余弦正幅值法则',
      sync: at(L2, ['cmp_pcos', 'cmp_nsin', 'cmp_ncos', 'cmp_psin'], {
        [P.f1]: '-cos',
        [P.a1]: 10,
        [P.p1]: 50,
        [P.f2]: '+sin',
        [P.a2]: 12,
        [P.p2]: -10,
        [P.para]: false,
        [P.sym]: 'v',
      }),
      blocks: [
        { kind: 'p', text: '**2.1 教授导学：为什么不能凭肉眼直接比相位？**' },
        { kind: 'formula', title: '考试里最容易丢分的陷阱长这样：', tex: R`v_1(t) = -10\cos(\omega t + 50^\circ)\text{ V}, \qquad v_2(t) = 12\sin(\omega t - 10^\circ)\text{ V}` },
        { kind: 'p', text: R`很多同学扫一眼 $+50^\circ$ 和 $-10^\circ$，脱口而出：“$v_1$ 超前 $v_2$ $60^\circ$！”——**全错！**` },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**Breadboard Lab 相位比较铁律（缺一不可）**：在比较两个同频正弦波的超前（Lead）或滞后（Lag）关系前，**必须同时满足三条铁律**：`,
        },
        {
          kind: 'ol',
          items: [
            R`**同频率**：角频率 $\omega$ 必须完全相同（不同频的波相位差一直在变，无法谈论固定超前/滞后）；`,
            R`**同函数**：全部统一转换为[[cmp_pcos|**余弦函数 $\cos$**]]；`,
            R`**正幅值**：余弦函数前面的幅值系数必须为**正数（$V_m > 0$）**。`,
          ],
        },
        {
          kind: 'p',
          text: R`只要记住下面这组[[cmp_pcos,cmp_nsin,cmp_ncos,cmp_psin|**三角罗盘转换口诀**]]（在右侧罗盘图上，顺时针走 $90^\circ$ 是减 $90^\circ$，逆时针走 $90^\circ$ 是加 $90^\circ$）：`,
        },
        {
          kind: 'ul',
          items: [
            R`[[cmp_psin|$\sin(\omega t + \theta) = \cos(\omega t + \theta - 90^\circ)$]]（正弦落后余弦 $90^\circ$）`,
            R`[[cmp_nsin|$-\sin(\omega t + \theta) = \cos(\omega t + \theta + 90^\circ)$]]（负正弦超前余弦 $90^\circ$）`,
            R`[[cmp_ncos|$-\cos(\omega t + \theta) = \cos(\omega t + \theta \pm 180^\circ)$]]（负号等于翻转 $180^\circ$，选加或减让最终角度落在 $(-180^\circ, +180^\circ]$ 内）`,
          ],
        },
        { kind: 'p', text: R`统一完成后，设 $v_1(t) = V_{m1}\cos(\omega t + \phi_1)$ 与 $v_2(t) = V_{m2}\cos(\omega t + \phi_2)$：` },
        {
          kind: 'ul',
          items: [R`若 $\phi_2 > \phi_1$，则 [[pc_verdict|**$v_2$ 超前 $v_1$**]]，超前角为 [[pc_ruler|$\Delta\phi = \phi_2 - \phi_1$]]（等价于 $v_1$ 滞后 $v_2$ $\Delta\phi$）。`],
        },
        { kind: 'p', text: R`**2.2 幕内 2D 教学图：$\sin \leftrightarrow \cos$ 统一化简罗盘与超前/滞后相位差标尺**` },
        { kind: 'figure', svg: SVG_ACT2 },
        { kind: 'p', text: '**2.3 三段式教授板书推导：相位超前/滞后判定（Sadiku Example 9.2）**' },
        {
          kind: 'formula',
          title: '**例题 2.1**：计算以下两个同频正弦电压之间的相位角差，并判断谁超前、谁滞后：',
          tex: R`v_1(t) = -10\cos(\omega t + 50^\circ)\text{ V}, \qquad v_2(t) = 12\sin(\omega t - 10^\circ)\text{ V}`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`依据三角函数诱导公式（相位比较铁律）：$-\cos(\theta) = \cos(\theta \pm 180^\circ), \qquad \sin(\theta) = \cos(\theta - 90^\circ)$ 两同频正幅值余弦波 $V_{m1}\cos(\omega t + \phi_1)$ 与 $V_{m2}\cos(\omega t + \phi_2)$ 的相位差定义为 $\Delta\phi = \phi_2 - \phi_1$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：设原始信号为 $v_1(t) = -A\cos(\omega t + \alpha)$ 与 $v_2(t) = B\sin(\omega t + \beta)$（其中 $A, B > 0$），则统一化为正幅值余弦波后的标准初相角为：`,
          tex: R`\phi_1 = \alpha - 180^\circ, \qquad \phi_2 = \beta - 90^\circ`,
        },
        { kind: 'formula', title: '相位差为：', tex: R`\Delta\phi = \phi_2 - \phi_1 = (\beta - 90^\circ) - (\alpha - 180^\circ) = \beta - \alpha + 90^\circ` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: R`代入 $A = 10\text{ V}$、$\alpha = +50^\circ$、$B = 12\text{ V}$、$\beta = -10^\circ$：` },
            { label: R`1. 化简 $v_1(t)$：`, tex: R`\phi_1 = 50^\circ - 180^\circ = -130^\circ \implies v_1(t) = 10\cos(\omega t - 130^\circ)\text{ V}` },
            { label: R`2. 化简 $v_2(t)$：`, tex: R`\phi_2 = -10^\circ - 90^\circ = -100^\circ \implies v_2(t) = 12\cos(\omega t - 100^\circ)\text{ V}` },
            { label: '3. 计算相位差并判定：', tex: R`\Delta\phi = \phi_2 - \phi_1 = (-100^\circ) - (-130^\circ) = +30^\circ` },
            { label: R`由于 $\phi_2 > \phi_1$，结论为：**$v_2(t)$ 超前 $v_1(t)$ $30^\circ$**（等价表述：$v_1(t)$ 滞后 $v_2(t)$ $30^\circ$）。` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: R`欧拉公式与相量变换——给旋转矢量拍一张 $t=0$ 的复平面快照`,
      sync: at(L1, ['ph_snap', 'ph_rect', 'ph_quad'], { [P.vm]: 5, [P.w]: 50, [P.phi]: Number(argDeg(EX31.z1).toFixed(2)), [P.play]: false }),
      blocks: [
        { kind: 'p', text: '**3.1 教授导学：相量到底是什么？**' },
        {
          kind: 'formula',
          title: R`很多教材把相量讲得很玄乎，其实它只靠一条史上最美的公式——**欧拉公式（Euler's Identity）**：`,
          tex: R`e^{j\theta} = \cos\theta + j\sin\theta \qquad (j = \sqrt{-1})`,
        },
        { kind: 'p', text: R`（注：电路学里为了不与电流 $i$ 冲突，虚数单位永远写作 $j$ 而不是 $i$。）` },
        {
          kind: 'formula',
          title: R`现在把我们的正弦电压 $v(t) = V_m\cos(\omega t + \phi)$ 改写成复指数的**实部**：`,
          tex: R`v(t) = V_m\cos(\omega t + \phi) = \text{Re}\left\{ V_m e^{j(\omega t + \phi)} \right\} = \text{Re}\left\{ \underbrace{V_m e^{j\phi}}_{\text{相量 }\mathbf{V}} \cdot \underbrace{e^{j\omega t}}_{\text{公共旋转因子}} \right\}`,
        },
        { kind: 'p', text: '请立刻盯着上面这个拆解式看三秒钟！' },
        {
          kind: 'p',
          text: R`在一个**线性、单一频率 $\omega$** 的交流稳态电路里，**每一个节点电压、每一条支路电流都带着完全一模一样的旋转因子 $e^{j\omega t}$**！就像一整个车队都在以同样的速度 $\omega$ 绕着操场跑圈，如果我们只关心每辆车之间的相对位置和车长，完全可以[[ph_snap|**在 $t=0$ 时刻按一下快门，拍一张静止的俯视快照**]]——把公共因子 $e^{j\omega t}$ 暂时剥离出去，剩下的就是不含时间 $t$ 的复数**相量（Phasor）**：`,
        },
        { kind: 'formula', title: '相量（Phasor）', tex: R`\mathbf{V} = V_m e^{j\phi} = V_m \angle \phi` },
        {
          kind: 'ul',
          items: [
            R`**正变换（时域 $\to$ 频域/相量域）**：$v(t) = V_m\cos(\omega t + \phi) \;\Longrightarrow\; \mathbf{V} = V_m \angle \phi$`,
            R`**逆变换（频域/相量域 $\to$ 时域）**：$\mathbf{V} = V_m \angle \phi \;\Longrightarrow\; v(t) = \text{Re}\{\mathbf{V} e^{j\omega t}\} = V_m\cos(\omega t + \phi)$`,
          ],
        },
        { kind: 'p', text: '**3.2 复数直角坐标 ↔ 极坐标互转与四则运算法则**' },
        { kind: 'p', text: '相量本质上是一个复数，有两种最常用的“穿衣方式”：' },
        {
          kind: 'ul',
          items: [
            R`[[ph_rect|**直角坐标（Rectangular Form）**]]：$\mathbf{Z} = x + jy$（**做加减法时必须用它！**实部加实部，虚部加虚部）`,
            R`[[ph_snap|**极坐标（Polar Form）**]]：$\mathbf{Z} = r \angle \phi$（**做乘除法时必须用它！**模相乘/除，角相加/减）`,
          ],
        },
        { kind: 'p', text: '互转公式：' },
        {
          kind: 'ul',
          items: [
            R`极坐标 $\to$ 直角坐标：$x = r\cos\phi,\quad y = r\sin\phi$`,
            R`直角坐标 $\to$ 极坐标：$r = \sqrt{x^2 + y^2}$，而相角 $\phi$ **绝对不能无脑按计算器的 $\arctan(y/x)$**！因为 $\arctan$ 的值域只有 $(-90^\circ, +90^\circ)$，当实部 $x < 0$（复数落在第二或第三象限）时，[[ph_quad|**必须进行 $\pm 180^\circ$ 象限校正**]]：`,
          ],
        },
        {
          kind: 'ul',
          items: [
            R`第一、四象限（$x > 0$）：$\phi = \arctan\left(\frac{y}{x}\right)$`,
            R`**第二象限（$x < 0, y > 0$）**：$\phi = 180^\circ + \arctan\left(\frac{y}{x}\right)$`,
            R`**第三象限（$x < 0, y < 0$）**：$\phi = -180^\circ + \arctan\left(\frac{y}{x}\right)$`,
          ],
        },
        { kind: 'p', text: '**3.3 幕内 2D 教学图：四象限复平面极坐标标注图（含第二/三象限校正警示）**' },
        { kind: 'figure', svg: SVG_ACT3 },
        { kind: 'p', text: '**3.4 三段式教授板书推导：跨象限极坐标转换与复数乘除**' },
        {
          kind: 'p',
          text: R`**例题 3.1**：已知两个复数 $\mathbf{Z}_1 = -3 + j4$ 与 $\mathbf{Z}_2 = -6 - j8$，将其转为极坐标形式，并计算乘积 $\mathbf{Z}_1\mathbf{Z}_2$ 与商 $\mathbf{Z}_1/\mathbf{Z}_2$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`直角坐标 $\mathbf{Z} = x + jy$ 与极坐标 $r\angle\phi$ 的映射公理为：$\displaystyle r = \sqrt{x^2 + y^2}, \qquad \phi = \begin{cases} \arctan(y/x), & x > 0 \\ \arctan(y/x) + 180^\circ, & x < 0,\; y \ge 0 \\ \arctan(y/x) - 180^\circ, & x < 0,\; y < 0 \end{cases}$ 极坐标乘除公理为：$\displaystyle (r_1\angle\phi_1)(r_2\angle\phi_2) = (r_1 r_2)\angle(\phi_1 + \phi_2), \qquad \frac{r_1\angle\phi_1}{r_2\angle\phi_2} = \left(\frac{r_1}{r_2}\right)\angle(\phi_1 - \phi_2)$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：设 $\mathbf{Z}_1 = x_1 + jy_1$（第二象限：$x_1 < 0, y_1 > 0$），$\mathbf{Z}_2 = x_2 + jy_2$（第三象限：$x_2 < 0, y_2 < 0$），则：`,
          tex: R`\begin{gathered} r_1 = \sqrt{x_1^2 + y_1^2}, \quad \phi_1 = \arctan\left(\frac{y_1}{x_1}\right) + 180^\circ \\ r_2 = \sqrt{x_2^2 + y_2^2}, \quad \phi_2 = \arctan\left(\frac{y_2}{x_2}\right) - 180^\circ \\ \mathbf{Z}_1\mathbf{Z}_2 = r_1 r_2 \angle (\phi_1 + \phi_2), \qquad \frac{\mathbf{Z}_1}{\mathbf{Z}_2} = \frac{r_1}{r_2} \angle (\phi_1 - \phi_2) \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: R`代入 $x_1 = -3, y_1 = 4$ 与 $x_2 = -6, y_2 = -8$：` },
            {
              label: R`1. 转换 $\mathbf{Z}_1$（第二象限）：`,
              tex: R`r_1 = \sqrt{(-3)^2 + 4^2} = 5, \qquad \phi_1 = \arctan\left(\frac{4}{-3}\right) + 180^\circ = -53.13^\circ + 180^\circ = +126.87^\circ`,
            },
            { label: '', tex: R`\implies \mathbf{Z}_1 = 5\angle 126.87^\circ` },
            {
              label: R`2. 转换 $\mathbf{Z}_2$（第三象限）：`,
              tex: R`r_2 = \sqrt{(-6)^2 + (-8)^2} = 10, \qquad \phi_2 = \arctan\left(\frac{-8}{-6}\right) - 180^\circ = 53.13^\circ - 180^\circ = -126.87^\circ`,
            },
            { label: '', tex: R`\implies \mathbf{Z}_2 = 10\angle{-}126.87^\circ` },
            { label: '3. 极坐标乘法：', tex: R`\mathbf{Z}_1\mathbf{Z}_2 = (5 \times 10)\angle(126.87^\circ + (-126.87^\circ)) = 50\angle 0^\circ = 50` },
            {
              label: '4. 极坐标除法：',
              tex: R`\frac{\mathbf{Z}_1}{\mathbf{Z}_2} = \left(\frac{5}{10}\right)\angle(126.87^\circ - (-126.87^\circ)) = 0.5\angle 253.74^\circ = 0.5\angle{-}106.26^\circ`,
            },
            { label: R`（减 $360^\circ$ 将主值角度规整到 $(-180^\circ, +180^\circ]$ 区间，展开为直角坐标即 $-0.14 - j0.48$。）` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '同频正弦波的相量叠加——用矢量平行四边形终结三角恒等式地狱',
      sync: at(L2, ['pc_para', 'pc_sum'], { [P.f1]: '+cos', [P.a1]: 4, [P.p1]: 30, [P.f2]: '+sin', [P.a2]: 5, [P.p2]: -20, [P.para]: true, [P.sym]: 'i' }),
      blocks: [
        { kind: 'p', text: '**4.1 教授导学：KCL / KVL 在交流电路里的救星**' },
        {
          kind: 'p',
          text: R`设想一个交流节点汇入了两条支路电流：$i_1(t) = 4\cos(\omega t + 30^\circ)\text{ A}$ 和 $i_2(t) = 5\sin(\omega t - 20^\circ)\text{ A}$。按 KCL，总电流 $i(t) = i_1(t) + i_2(t)$。如果直接在时域硬算，你得把 $\cos(\omega t + 30^\circ)$ 和 $\sin(\omega t - 20^\circ)$ 全部用和角公式拆开，再合并 $\cos\omega t$ 与 $\sin\omega t$ 的系数，再辅助角合成——不仅慢，而且极易算错符号。`,
        },
        { kind: 'formula', title: '借助相量变换的**线性性质（Linearity）**：', tex: R`i_1(t) + i_2(t) \;\Longleftrightarrow\; \mathbf{I}_1 + \mathbf{I}_2` },
        { kind: 'p', text: R`我们只需四步走完“**时域 $\to$ 极坐标相量 $\to$ 直角坐标相加 $\to$ 极坐标还原时域**”：` },
        {
          kind: 'ol',
          items: [
            R`把所有正弦波按第 2 幕铁律统一成**正幅值 $\cos$**；`,
            R`写出各自极坐标相量 $\mathbf{I}_1, \mathbf{I}_2$；`,
            R`各自转成直角坐标 $(x + jy)$，实部加实部、虚部加虚部（几何上就是复平面上的[[pc_para|**矢量平行四边形法则**]]！）；`,
            R`把[[pc_sum|合相量 $\mathbf{I}$]] 转回极坐标 $I_m\angle\phi$，贴回 $\cos(\omega t + \phi)$ 完工！`,
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**铁律警示**：不同频率的两个正弦波（例如 $3\cos(10t)$ 与 $4\cos(20t)$）**绝对不能**直接用相量相加！因为它们的旋转因子 $e^{j10t}$ 与 $e^{j20t}$ 转速不同，无法提公因式消去。`,
        },
        { kind: 'p', text: '**4.2 幕内 2D 教学图：相量相加矢量平行四边形图（Sadiku Example 9.6）**' },
        { kind: 'figure', svg: SVG_ACT4 },
        { kind: 'p', text: '**4.3 三段式教授板书推导：同频正弦叠加（Sadiku Example 9.6）**' },
        {
          kind: 'formula',
          title: '**例题 4.1**：利用相量法将以下两个同频交流电流合成单一正弦波：',
          tex: R`i(t) = i_1(t) + i_2(t) = 4\cos(\omega t + 30^\circ) + 5\sin(\omega t - 20^\circ)\text{ A}`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`由相量变换的线性公理与三角诱导公式：$A\cos(\omega t + \phi_1) + B\sin(\omega t + \theta_2) \;\Longleftrightarrow\; \mathbf{I}_1 + \mathbf{I}_2 = A\angle\phi_1 + B\angle(\theta_2 - 90^\circ)$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：令 $\phi_2 = \theta_2 - 90^\circ$，将两相量展开至直角坐标求和：`,
          tex: R`I_x = A\cos\phi_1 + B\cos\phi_2, \qquad I_y = A\sin\phi_1 + B\sin\phi_2`,
        },
        { kind: 'formula', title: R`合成幅值与初相角（若 $I_x > 0$，无需象限校正）：`, tex: R`I_m = \sqrt{I_x^2 + I_y^2}, \qquad \phi = \arctan\left(\frac{I_y}{I_x}\right)` },
        { kind: 'p', text: R`最终时域表达式为 $i(t) = I_m\cos(\omega t + \phi)$。` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: R`代入 $A = 4\text{ A}, \phi_1 = 30^\circ, B = 5\text{ A}, \theta_2 = -20^\circ$：` },
            {
              label: '1. 统一为正余弦并写相量：',
              tex: R`\phi_2 = -20^\circ - 90^\circ = -110^\circ \implies \mathbf{I}_1 = 4\angle 30^\circ\text{ A}, \quad \mathbf{I}_2 = 5\angle{-}110^\circ\text{ A}`,
            },
            { label: '2. 转直角坐标并求和：', tex: R`I_x = 4\cos(30^\circ) + 5\cos(-110^\circ) = 3.4641 + (-1.7101) = 1.7540\text{ A}` },
            { label: '', tex: R`I_y = 4\sin(30^\circ) + 5\sin(-110^\circ) = 2.0000 + (-4.6985) = -2.6985\text{ A}` },
            { label: R`3. 转极坐标（$I_x > 0, I_y < 0$，位于第四象限）：`, tex: R`I_m = \sqrt{(1.7540)^2 + (-2.6985)^2} = \sqrt{3.0765 + 7.2819} = 3.2184\text{ A}` },
            { label: '', tex: R`\phi = \arctan\left(\frac{-2.6985}{1.7540}\right) = -56.98^\circ` },
            { label: '4. 还原为时域波形：', tex: R`i(t) = 3.218\cos(\omega t - 56.98^\circ)\text{ A}` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: R`微积分降维打击——$\frac{d}{dt} \leftrightarrow j\omega$ 与相量法秒杀微分方程`,
      sync: at(L3, ['op_diff', 'op_int', 'op_rot_p', 'op_rot_m'], { [P.wc]: 2, [P.ia]: 4, [P.ip]: 30, [P.mode]: 'all', [P.eq]: 'off' }),
      blocks: [
        { kind: 'p', text: '**5.1 教授导学：今天最震撼的魔法时刻**' },
        {
          kind: 'formula',
          title: R`前面 4 幕都是热身，现在迎来本节课的终极高潮！请看对一个正弦电压 $v(t) = \text{Re}\{\mathbf{V} e^{j\omega t}\}$ 求时间导数会发生什么：`,
          tex: R`\frac{dv(t)}{dt} = \frac{d}{dt}\text{Re}\left\{\mathbf{V} e^{j\omega t}\right\} = \text{Re}\left\{ \mathbf{V} \cdot \frac{d}{dt}(e^{j\omega t}) \right\} = \text{Re}\left\{ \underbrace{(j\omega \mathbf{V})}_{\text{导数的相量}} e^{j\omega t} \right\}`,
        },
        { kind: 'p', text: R`看到没有？！因为指数函数 $e^{j\omega t}$ 求导只是把系数 $j\omega$ 掉下来，所以：` },
        {
          kind: 'ul',
          items: [
            R`[[op_diff|**时域求导 $\dfrac{d}{dt}$ $\;\Longleftrightarrow\;$ 频域乘以 $j\omega$**]]：由于 $j = 1\angle{+}90^\circ$，求导在几何上就是把原相量[[op_rot_p|**逆时针旋转 $90^\circ$**]]，长度伸缩 $\omega$ 倍！`,
            R`[[op_int|**时域积分 $\displaystyle\int dt$ $\;\Longleftrightarrow\;$ 频域除以 $j\omega$**]]：由于 $\frac{1}{j} = -j = 1\angle{-}90^\circ$，积分在几何上就是把原相量[[op_rot_m|**顺时针旋转 $90^\circ$**]]，长度伸缩 $1/\omega$ 倍！`,
          ],
        },
        { kind: 'p', text: '**这意味着什么？**' },
        {
          kind: 'p',
          text: R`上周我们在 W4-L4/W4-L5 费尽九牛二虎之力解的交流稳态微分方程，今天只要一进相量域，所有 $\frac{d}{dt}$ 换成 $j\omega$，所有 $\int dt$ 换成 $\frac{1}{j\omega}$，**微分方程瞬间变成了一元一次代数方程**！一步除法就能直接拿到交流稳态特解！`,
        },
        { kind: 'p', text: R`**5.2 幕内 2D 教学图：复平面微积分旋转（$\times j\omega$ 与 $\div j\omega$）演示图**` },
        { kind: 'figure', svg: SVG_ACT5 },
        { kind: 'p', text: '**5.3 三段式教授板书推导：相量法秒杀微积分方程（Sadiku Example 9.7）**' },
        {
          kind: 'formula',
          title: R`**例题 5.1**：利用相量法求以下微积分方程的稳态特解 $i(t)$：`,
          tex: R`4i(t) + 8\int i(t)\,dt - 3\frac{di(t)}{dt} = 50\cos(2t + 75^\circ)`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`依据相量变换的线性、微分与积分性质（Sadiku Section 9.3）：$i(t) \leftrightarrow \mathbf{I}, \qquad \dfrac{di(t)}{dt} \leftrightarrow j\omega\mathbf{I}, \qquad \displaystyle\int i(t)\,dt \leftrightarrow \frac{\mathbf{I}}{j\omega}$`,
        },
        { kind: 'formula', title: '② 纯符号通式：设一般线性常系数微积分方程为：', tex: R`a\,i(t) + b\int i(t)\,dt + c\frac{di(t)}{dt} = V_m\cos(\omega t + \phi_s)` },
        {
          kind: 'formula',
          title: R`两边同时作相量变换，提取[[eq_chain|公因子 $\mathbf{I}$]]：`,
          tex: R`\left(a + \frac{b}{j\omega} + j\omega c\right)\mathbf{I} = V_m\angle\phi_s`,
        },
        {
          kind: 'formula',
          title: R`利用 $\frac{1}{j} = -j$ 整理[[eq_d|系数分母 $\mathbf{D} = a + j\left(\omega c - \frac{b}{\omega}\right)$]]，直接解得[[eq_sol|响应相量]]：`,
          tex: R`\mathbf{I} = \frac{V_m\angle\phi_s}{a + j\left(\omega c - \dfrac{b}{\omega}\right)}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: R`对照题干，提取参数 $a = 4, b = 8, c = -3, \omega = 2\text{ rad/s}, V_m = 50, \phi_s = 75^\circ$：` },
            { label: R`1. 计算分母复数 $\mathbf{D}$：`, tex: R`\mathbf{D} = 4 + \frac{8}{j2} - 3(j2) = 4 - j4 - j6 = 4 - j10` },
            { label: R`2. 将分母 $\mathbf{D}$ 转为极坐标（$x = 4 > 0, y = -10 < 0$，第四象限）：`, tex: R`|\mathbf{D}| = \sqrt{4^2 + (-10)^2} = \sqrt{116} \approx 10.7703` },
            { label: '', tex: R`\theta_D = \arctan\left(\frac{-10}{4}\right) = -68.20^\circ \implies \mathbf{D} = 10.7703\angle{-}68.20^\circ` },
            {
              label: R`3. 极坐标除法求相量 $\mathbf{I}$：`,
              tex: R`\mathbf{I} = \frac{50\angle 75^\circ}{10.7703\angle{-}68.20^\circ} = \left(\frac{50}{10.7703}\right)\angle\left(75^\circ - (-68.20^\circ)\right) = 4.6424\angle 143.20^\circ\text{ A}`,
            },
            { label: '4. 逆变换还原为时域稳态特解：', tex: R`i(t) = 4.642\cos(2t + 143.20^\circ)\text{ A}` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**舞台提示**：左侧图层 03 选「方程拼合 · 例题 5.1」，拖动滑块试探 $\mathbf{I}$：[[eq_chain|$4\mathbf{I}$、$\dfrac{8\mathbf{I}}{j\omega}$、$-3 \cdot j\omega\mathbf{I}$ 三项首尾相接]]；点“代入解”，三项恰好闭合到[[eq_src|激励相量 $50\angle 75^\circ$]]。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 6: guided example and quiz */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式分步引导例题 · 诊断测验',
      sync: at(L2, ['cmp_psin', 'cmp_pcos'], {}),
      blocks: [
        { kind: 'p', text: R`本题针对典型一阶交流稳态微分方程，完整覆盖“$\sin\to\cos$ 转换 → 微分相量化 → 极坐标转换 → 复数除法 → 时域还原”五大核心动作。` },
        {
          kind: 'guided',
          title: '相量法秒杀一阶交流稳态微分方程',
          problem: R`已知 $2\dfrac{dv(t)}{dt} + 6v(t) = 20\sin(4t + 30^\circ)\text{ V}$。求该一阶线性微分方程的交流稳态特解 $v(t)$。`,
          problem_svg: SVG_GUIDED_MAP,
          steps: [
            {
              title: 'Step 1 · 激励源标准化与提取相量',
              mini_svg: MINI_STEP1,
              question: R`方程右侧激励源是 $20\sin(4t + 30^\circ)\text{ V}$。在进入相量域之前，必须先统一为正幅值余弦函数。请问右侧激励的角频率 $\omega$ 和标准余弦相量 $\mathbf{V}_s$ 是多少？`,
              hint: R`$\sin(\omega t + \theta) = \cos(\omega t + \theta - 90^\circ)$`,
              options: [
                {
                  text: R`$\omega = 4\text{ rad/s}$，$\mathbf{V}_s = 20\angle 30^\circ\text{ V}$`,
                  correct: false,
                  feedback: '停！你直接把 sin 的角度抄进相量里了！记住我们的铁律：相量默认以 cos 为基准，sin 必须先减 90° 变成 cos 才能拍快照！',
                },
                {
                  text: R`$\omega = 4\text{ rad/s}$，$\mathbf{V}_s = 20\angle 120^\circ\text{ V}$`,
                  correct: false,
                  feedback: R`方向反啦！$+\sin$ 滞后于 $+\cos$ $90^\circ$，所以是 $\theta - 90^\circ$，只有 $-\sin$ 才是 $+90^\circ$。`,
                },
                {
                  text: R`$\omega = 4\text{ rad/s}$，$\mathbf{V}_s = 20\angle{-}60^\circ\text{ V}$`,
                  correct: true,
                  feedback: R`对！$t$ 前面的系数就是 $\omega = 4\text{ rad/s}$；$+\sin$ 在罗盘上位于 $-90^\circ$，$30^\circ - 90^\circ = -60^\circ$，激励的快照是 $20\angle{-}60^\circ\text{ V}$。`,
                },
              ],
              board: [R`\omega = 4\text{ rad/s},`, R`20\sin(4t + 30^\circ)`, R`= 20\cos(4t - 60^\circ)`, R`\implies \mathbf{V}_s = 20\angle{-}60^\circ\text{ V}`],
              halo: ['cmp_psin', 'cmp_pcos'],
              params: G(0),
              layer: L2,
            },
            {
              title: 'Step 2 · 微分项相量化（降维打击）',
              mini_svg: MINI_STEP2,
              question: R`已知 $\omega = 4\text{ rad/s}$，现在把方程左侧 $2\dfrac{dv(t)}{dt} + 6v(t)$ 整体转换到相量域，提取公因子 $\mathbf{V}$ 后，左侧变成什么？`,
              hint: R`$\dfrac{dv(t)}{dt} \leftrightarrow j\omega \mathbf{V} = j(4)\mathbf{V}$`,
              options: [
                {
                  text: R`$(6 + j8)\mathbf{V}$`,
                  correct: true,
                  feedback: R`正是如此：$\dfrac{d}{dt}$ 换成 $j\omega = j4$，$2 \times j4 = j8$，再加上 $6\mathbf{V}$——微分方程变成了一元一次复数方程 $(6 + j8)\mathbf{V} = 20\angle{-}60^\circ$。`,
                },
                {
                  text: R`$(6 + j2)\mathbf{V}$`,
                  correct: false,
                  feedback: R`别忘了乘以角频率 $\omega = 4$！求导对应的算子是 $j\omega$，而不是单独的 $j$，所以系数是 $2 \times j4 = j8$。`,
                },
                {
                  text: R`$(6 - j8)\mathbf{V}$`,
                  correct: false,
                  feedback: R`符号搞反了！除以 $j\omega$（积分）才会出现负号 $-j$，求导是乘以 $+j\omega$。`,
                },
              ],
              board: [R`2(j4\mathbf{V}) + 6\mathbf{V} = (6 + j8)\mathbf{V}`, R`= 20\angle{-}60^\circ`],
              halo: ['eq_src'],
              params: G(1, { [P.eq]: 'guided' }),
              layer: L3,
            },
            {
              title: 'Step 3 · 分母复数转极坐标',
              mini_svg: MINI_STEP3,
              question: R`接下来要做复数除法 $\mathbf{V} = \dfrac{20\angle{-}60^\circ}{6 + j8}$。为了顺手相除，先把分母 $6 + j8$ 转为极坐标形式：`,
              hint: R`$r = \sqrt{6^2 + 8^2},\quad \theta = \arctan\left(\dfrac{8}{6}\right)$`,
              options: [
                {
                  text: R`$14\angle 53.13^\circ$`,
                  correct: false,
                  feedback: R`复数的模不是实部加虚部！$6$ 和 $8$ 是直角三角形的两条直角边，斜边是 $\sqrt{6^2 + 8^2} = 10$。`,
                },
                {
                  text: R`$10\angle 53.13^\circ$`,
                  correct: true,
                  feedback: R`漂亮！$6$-$8$-$10$ 直角三角形：模 $\sqrt{36 + 64} = 10$；实部 $6 > 0$ 在第一象限，$\arctan(8/6) = 53.13^\circ$ 无需校正。`,
                },
                {
                  text: R`$10\angle 36.87^\circ$`,
                  correct: false,
                  feedback: R`正切比值写倒啦！相角是 $\arctan(\text{虚部}/\text{实部}) = \arctan(8/6) = 53.13^\circ$，不是 $\arctan(6/8)$。`,
                },
              ],
              board: [R`6 + j8 = \sqrt{6^2 + 8^2}\angle\arctan\left(\frac{8}{6}\right)`, R`= 10\angle 53.13^\circ`],
              halo: ['eq_d'],
              params: G(2, { [P.eq]: 'guided' }),
              layer: L3,
            },
            {
              title: 'Step 4 · 极坐标除法求解响应相量',
              mini_svg: MINI_STEP4,
              question: R`计算 $\mathbf{V} = \dfrac{20\angle{-}60^\circ}{10\angle 53.13^\circ}$，得到响应电压相量 $\mathbf{V}$ 为：`,
              hint: R`$\dfrac{r_1\angle\phi_1}{r_2\angle\phi_2} = \dfrac{r_1}{r_2}\angle(\phi_1 - \phi_2)$`,
              options: [
                {
                  text: R`$2\angle{-}113.13^\circ\text{ V}$`,
                  correct: true,
                  feedback: R`完全正确：模相除 $20 / 10 = 2$，角相减 $-60^\circ - 53.13^\circ = -113.13^\circ$。相量落在第三象限。`,
                },
                {
                  text: R`$2\angle{-}6.87^\circ\text{ V}$`,
                  correct: false,
                  feedback: R`极坐标除法是“分子相角减分母相角”：$(-60^\circ) - (+53.13^\circ) = -113.13^\circ$，不是相加哦！`,
                },
                {
                  text: R`$0.5\angle{-}113.13^\circ\text{ V}$`,
                  correct: false,
                  feedback: R`分子是 $20$，分母是 $10$，模相除应该是 $20 / 10 = 2$，别把分子分母写反了。`,
                },
              ],
              board: [R`\mathbf{V} = \frac{20\angle{-}60^\circ}{10\angle 53.13^\circ} = 2\angle(-60^\circ - 53.13^\circ)`, R`= 2\angle{-}113.13^\circ\text{ V}`],
              halo: ['eq_sol', 'eq_d'],
              params: G(3, { [P.eq]: 'guided' }),
              layer: L3,
            },
            {
              title: 'Step 5 · 逆变换还原时域稳态特解',
              mini_svg: MINI_STEP5,
              question: R`最后一步：将相量 $\mathbf{V} = 2\angle{-}113.13^\circ\text{ V}$（对应 $\omega = 4\text{ rad/s}$）还原回时域稳态电压 $v(t)$：`,
              hint: R`$v(t) = \text{Re}\{\mathbf{V} e^{j\omega t}\} = V_m\cos(\omega t + \phi)$`,
              options: [
                {
                  text: R`$v(t) = 2\sin(4t - 113.13^\circ)\text{ V}$`,
                  correct: false,
                  feedback: '小心临门一脚踩坑！我们第 1 步已经把全题统一到 cos 基准下了，所以相量还原回时域时必须写 cos，不能写回 sin！',
                },
                {
                  text: R`$v(t) = 2\cos(4t + 113.13^\circ)\text{ V}$`,
                  correct: false,
                  feedback: R`相角里的负号丢掉了，$-113.13^\circ$ 必须原封不动带回余弦括号里。`,
                },
                {
                  text: R`$v(t) = 2\cos(4t - 113.13^\circ)\text{ V}$`,
                  correct: true,
                  feedback: R`通关！$\text{Re}\{2\angle{-}113.13^\circ \cdot e^{j4t}\} = 2\cos(4t - 113.13^\circ)$：模是幅值，角是初相，$\omega = 4$ 原样贴回。`,
                },
              ],
              board: [R`v(t) = 2\cos(4t - 113.13^\circ)\text{ V}`],
              halo: ['ph_snap', 'ph_wave'],
              params: G(4, { [P.vm]: 2, [P.w]: 4, [P.phi]: -113.13, [P.play]: true }),
              layer: L1,
            },
          ],
          done_params: { [P.g]: 5 },
          conclusion: R`五步走完：$\sin \to \cos$ 得 $\mathbf{V}_s = 20\angle{-}60^\circ$，$\frac{d}{dt} \to j4$ 得 $(6 + j8)\mathbf{V}$，分母 $10\angle 53.13^\circ$，一步除法 $\mathbf{V} = 2\angle{-}113.13^\circ\text{ V}$，还原 $v(t) = 2\cos(4t - 113.13^\circ)\text{ V}$。左侧图层 03 的「方程拼合 · 引导例题」已经揭晓：点“代入解”，看 $6\mathbf{V}$ 与 $j8\mathbf{V}$ 首尾相接，恰好闭合到激励相量 $20\angle{-}60^\circ$。`,
        },
        { kind: 'p', text: '**诊断测验（4 题）**' },
      ],
      quiz: [
        {
          id: 'w5l1_q1',
          concept: '相位比较铁律',
          review_act: 2,
          question: R`已知两个同频电压 $v_1(t) = -5\sin(100t + 20^\circ)\text{ V}$ 与 $v_2(t) = 8\cos(100t + 60^\circ)\text{ V}$，下列说法正确的是：`,
          options: [
            { key: 'A', text: R`$v_1$ 超前 $v_2$ $50^\circ$`, correct: true },
            {
              key: 'B',
              text: R`$v_1$ 滞后 $v_2$ $40^\circ$`,
              correct: false,
              feedback: R`$40^\circ$ 是直接拿原始角度 $60^\circ - 20^\circ$ 比出来的：$v_1$ 是 $-\sin$，必须先按 $-\sin\theta = \cos(\theta + 90^\circ)$ 统一成正幅值余弦，才能和 $v_2$ 的 $60^\circ$ 比较；“超前 / 滞后”的方向也要在统一之后重新判断。`,
            },
            {
              key: 'C',
              text: R`$v_2$ 超前 $v_1$ $130^\circ$`,
              correct: false,
              feedback: R`$130^\circ$ 来自把 $-\sin$ 当成了 $+\sin$（$20^\circ - 90^\circ = -70^\circ$）：前面的负号再翻转 $180^\circ$，$-\sin$ 在罗盘上位于 $+90^\circ$，应当加 $90^\circ$。`,
            },
            {
              key: 'D',
              text: R`$v_1$ 与 $v_2$ 同相位`,
              correct: false,
              feedback: R`同相要求统一为正幅值余弦后初相完全相等。$v_1$ 统一后的初相不是 $60^\circ$——先过一遍罗盘再比较。`,
            },
          ],
          feedback_correct: R`按相位比较铁律统一为正幅值余弦：$-\sin(\theta) = \cos(\theta + 90^\circ)$，故 $v_1(t) = 5\cos(100t + 20^\circ + 90^\circ) = 5\cos(100t + 110^\circ)\text{ V}$。对比 $v_2(t) = 8\cos(100t + 60^\circ)\text{ V}$，$\Delta\phi = 110^\circ - 60^\circ = +50^\circ$，因此 $v_1$ 超前 $v_2$ $50^\circ$。`,
          feedback_wrong: '先过三条铁律：同频率、同为 cos、正幅值。−sin 在罗盘上在哪个方向？',
          figure: SVG_Q1,
          sync: { layer: L2, halo: ['cmp_nsin', 'pc_verdict'] },
        },
        {
          id: 'w5l1_q2',
          concept: '复数象限校正',
          review_act: 3,
          question: R`将复数 $\mathbf{Z} = -5 + j5$ 转换为极坐标形式 $r\angle\phi$，正确结果是：`,
          options: [
            {
              key: 'A',
              text: R`$7.071\angle{-}45^\circ$`,
              correct: false,
              feedback: R`这是计算器 $\arctan(5/(-5)) = -45^\circ$ 的原样输出：$-45^\circ$ 指向第四象限，可 $\mathbf{Z}$ 的实部 $x = -5 < 0$、虚部 $y = 5 > 0$，它在第二象限，必须做象限校正。`,
            },
            {
              key: 'B',
              text: R`$7.071\angle 45^\circ$`,
              correct: false,
              feedback: R`$45^\circ$ 指向第一象限（实部、虚部都为正），而 $-5 + j5$ 的实部是负的：只看了比值的大小，把实部的符号和所在象限丢了。`,
            },
            { key: 'C', text: R`$7.071\angle 135^\circ$`, correct: true },
            {
              key: 'D',
              text: R`$10\angle 135^\circ$`,
              correct: false,
              feedback: R`角度对了，模算错了：模是直角三角形的斜边 $\sqrt{(-5)^2 + 5^2} = \sqrt{50}$，不是两条直角边相加 $5 + 5 = 10$。`,
            },
          ],
          feedback_correct: R`模 $r = \sqrt{(-5)^2 + 5^2} = 5\sqrt{2} \approx 7.071$。因为实部 $x = -5 < 0$、虚部 $y = +5 > 0$，该复数位于第二象限，必须进行 $+180^\circ$ 校正：$\phi = \arctan(5/(-5)) + 180^\circ = -45^\circ + 180^\circ = 135^\circ$。`,
          feedback_wrong: R`先看实部的符号：$x < 0$ 时，$\arctan(y/x)$ 要做 $\pm 180^\circ$ 校正。`,
          figure: SVG_Q2,
          sync: { layer: L1, halo: ['ph_quad', 'ph_rect'] },
        },
        {
          id: 'w5l1_q3',
          concept: R`频域求导算子 $\times j\omega$`,
          review_act: 5,
          question: R`已知正弦电流 $i(t) = 3\cos(10t - 30^\circ)\text{ A}$，其导数 $\dfrac{di(t)}{dt}$ 对应的相量是：`,
          options: [
            {
              key: 'A',
              text: R`$3\angle 60^\circ\text{ A/s}$`,
              correct: false,
              feedback: R`旋转 $+90^\circ$ 做对了，但忘了伸缩：求导乘的是 $j\omega$ 而不是 $j$，模还要乘以 $\omega = 10$。`,
            },
            { key: 'B', text: R`$30\angle 60^\circ\text{ A/s}$`, correct: true },
            {
              key: 'C',
              text: R`$30\angle{-}120^\circ\text{ A/s}$`,
              correct: false,
              feedback: R`模对了，方向转反了：乘以 $j$ 是逆时针 $+90^\circ$（$-30^\circ + 90^\circ$）；$-120^\circ$ 是顺时针转了 $90^\circ$，那是乘以 $-j$。`,
            },
            {
              key: 'D',
              text: R`$0.3\angle{-}120^\circ\text{ A/s}$`,
              correct: false,
              feedback: R`这是积分的相量 $\mathbf{I}/(j\omega)$：除以 $j\omega$ 才会模 $\div\,\omega$、顺时针 $-90^\circ$。题目问的是导数。`,
            },
          ],
          feedback_correct: R`原电流相量 $\mathbf{I} = 3\angle{-}30^\circ\text{ A}$，角频率 $\omega = 10\text{ rad/s}$。时域求导对应频域乘以 $j\omega = 10\angle 90^\circ$，故导数相量为 $(10\angle 90^\circ)(3\angle{-}30^\circ) = 30\angle 60^\circ\text{ A/s}$。`,
          feedback_wrong: R`求导 $\leftrightarrow$ 乘以 $j\omega$：转多少度？长度乘多少？`,
          figure: SVG_Q3,
          sync: { layer: L3, halo: ['op_diff', 'op_rot_p'], params: { [P.mode]: 'all', [P.eq]: 'off' } },
        },
        {
          id: 'w5l1_q4',
          concept: '相量叠加须同频',
          review_act: 4,
          question: R`某同学想用相量法直接计算 $v(t) = 3\cos(10t) + 4\cos(20t)$ 的合成幅值，他写下 $\mathbf{V} = 3\angle 0^\circ + 4\angle 0^\circ = 7\angle 0^\circ$。对此评价正确的是：`,
          options: [
            {
              key: 'A',
              text: R`完全正确，两波形初相均为 $0^\circ$，幅值可直接相加`,
              correct: false,
              feedback: R`初相相同还不够：相量能相加的前提是两者共享同一个旋转因子 $e^{j\omega t}$。$10\text{ rad/s}$ 与 $20\text{ rad/s}$ 的两根指针转速不同，相对夹角时刻在变，合成结果不是任何一个 $7\cos(\omega t)$。`,
            },
            {
              key: 'B',
              text: R`只差一步，合成后的角频率应取平均值 $15\text{ rad/s}$`,
              correct: false,
              feedback: '两个不同频率的正弦之和根本不是一个单一频率的正弦，不存在可以取平均的“合成角频率”；问题出在相加这一步本身。',
            },
            {
              key: 'C',
              text: R`方法非法，两正弦波角频率不同（$10 \neq 20\text{ rad/s}$），不能在同一相量域直接相加`,
              correct: true,
            },
            {
              key: 'D',
              text: '只需把第二项除以 2 即可统一频率后相加',
              correct: false,
              feedback: R`把幅值或系数除以 $2$ 改变的是信号本身，$\cos(20t)$ 并不会因此变成 $\cos(10t)$；不同频率的项只能各自在自己的频率下处理，最后在时域叠加。`,
            },
          ],
          feedback_correct: R`相量变换之所以能剥离时间因子，前提是所有信号共享同一个旋转因子 $e^{j\omega t}$。当 $\omega_1 \neq \omega_2$ 时，两个指针转速不同，相对夹角随时间不断变化，不能直接做相量叠加（需在后续课程中用叠加定理分频独立求解）。`,
          feedback_wrong: '回到第 4 幕的铁律警示：相量相加之前，先检查什么？',
          figure: SVG_Q4,
          sync: { layer: L2, halo: ['pc_para', 'pc_sum'] },
        },
      ],
      after_quiz: [
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授收官点睛**：还记得上周为了求一个类似方程花了整整一黑板吗？今天四行代数就干干净净出了答案！下节课（W5-L2），我们将把今天这把“$j\omega$ 手术刀”直接切进电阻、电感、电容的元件方程里，正式请出交流电路的三巨头——**阻抗（Impedance）**！`,
        },
      ],
    },
  ],
};

export default W5_L1;
