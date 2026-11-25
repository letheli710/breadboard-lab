// W1-L8 · Y–Δ 等效变换与电桥电阻化简 (lesson sheet: docs/lessons/W1-L8.md).
// Lesson text is reproduced from the sheet as written; [[id|…]] only links a term to the stage
// (the words are unchanged), symbols in the sheet's JSON blocks (R_ac, R_Σ …) are typeset as TeX,
// and the TeX backslashes lost in the Google Docs export are restored (10,\Omega → 10\,\Omega).
// Layout changes: the sheet's display equations become formula / calc cards (their lead-in
// sentence as the card title or step text); act 7 is split in two — the self-test (act 7) and
// "World 1 收官总结 & World 2 预告" (act 8) — because a quiz closes its act on the page. Added
// here: the guided example's hints, board lines and problem figure, the two quiz figures, and
// feedback for the one quiz option the sheet gives no trap text for. The sheet's act diagrams are
// used as given (svgs.ts); sheetSvg only adds an aria label and typesets R_xx with subscripts.
// Hover ids follow the sheet's map with "hl-" dropped and "-" → "_" (term_a, delta_ra, …); a few
// are added for objects the map leaves out (term_d, br_ac, br_ad, br_cb, br_db).

import { lazy } from 'react';
import type { StageLesson } from '../../types';
import { SVG_PROBLEM, SVG_Q1, SVG_Q2 } from './figures';
import { SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6, SVG_ACT7, SVG_STEP1, SVG_STEP2, SVG_STEP3 } from './svgs';

const MorphLayer = lazy(() => import('./MorphLayer'));
const BridgeLayer = lazy(() => import('./BridgeLayer'));

const SUB = (s: string) => `<tspan baseline-shift="sub" font-size="72%">${s}</tspan>`;

/** A diagram from the sheet: aria label, and "R_ac" / "P_Σ" / "R1" in labels set with subscripts. */
function sheetSvg(svg: string, label: string): string {
  return svg.replace('<svg ', `<svg role="img" aria-label="${label}" `).replace(/>([^<>]+)</g, (_m, t: string) => {
    const out = t
      .replace(/([RP])_([A-Za-z0-9ΔΣ]+)/g, (_x, m: string, s: string) => `${m}${SUB(s)}`)
      .replace(/(^|[^A-Za-z_])R([1-3abc])(?=$|[=\s])/g, (_x, pre: string, s: string) => `${pre}R${SUB(s)}`);
    return `>${out}<`;
  });
}

const MORPH = 'layer_01_y_delta_morph';
const BRIDGE = 'layer_02_bridge_reducer';

const W1_L8: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [MORPH]: MorphLayer, [BRIDGE]: BridgeLayer },
  lesson_meta: {
    lesson_id: 'W1-L8',
    world: 'World 1 · 直流电路基础与等效化简',
    title: 'Y–Δ 等效变换与电桥电阻化简',
    subtitle: 'Wye–Delta (T–Π) Transformations & Bridge Network Reduction',
    lesson_type: 'B',
    lesson_type_label: 'Type B (公式推导与电路化简方法课)',
    estimated_minutes: 35,
    textbook_primary: {
      book: 'Charles K. Alexander & Matthew N. O. Sadiku, Fundamentals of Electric Circuits (2026 Release)',
      sections: ['Ch. 2.7: Wye-Delta Transformations'],
    },
    textbook_supplement: 'Robert L. Boylestad, Introductory Circuit Analysis, Ch. 7: Series-Parallel dc Networks (Bridge Networks & Y-Δ Conversion)',
    prerequisites: ['W1-L7 复杂串并联网络与分压/分流综合化简'],
    next_lesson: 'W2-L1',
    next_lesson_title: '节点分析法（Nodal Analysis）',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: MORPH,
        label: '01 Y ↔ Δ 变形原理图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: 'Y ↔ Δ 几何变形过渡原理图：拖动变形滑块 t：0 是纯 Δ，0.5 是「叠画记忆态」，1 是纯 Y；打开端口欧姆表，两侧读数始终相等。',
      },
      {
        id: BRIDGE,
        label: '02 电桥一键化简台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '电桥电路一键化简实战台：5 电阻惠斯通电桥，一键把顶部 Δ 变形为 Y，或按 0–4 步逐步化简；原图上点两颗电阻做串并联检验。',
      },
    ],
    hover_map: {
      term_a: { label: '端口 a', desc: '三端网络的端口 a（Layer 01 左上）；电桥的顶端点 a（Layer 02）' },
      term_b: { label: '端口 b', desc: '三端网络的端口 b（Layer 01 右上）；电桥的底端点 b（Layer 02）' },
      term_c: { label: '端口 c / 节点 c', desc: '三端网络的端口 c（Layer 01 正下）；电桥的左侧节点 c（Layer 02，度数 3）' },
      term_d: { label: '节点 d', desc: '电桥的右侧节点 d：连着 Rad、Rcd、Rdb，度数 3' },
      node_n: { label: '中心节点 n', desc: '星形中心节点（虚拟中性点）：三条 Y 臂在这里汇合' },
      delta_ra: { label: 'Δ 边 Ra（b–c）', desc: '位于 b–c 之间，正对端口 a，与 Y 臂 R₁ 相对' },
      delta_rb: { label: 'Δ 边 Rb（a–c）', desc: '位于 a–c 之间，正对端口 b，与 Y 臂 R₂ 相对' },
      delta_rc: { label: 'Δ 边 Rc（a–b）', desc: '位于 a–b 之间，正对端口 c，与 Y 臂 R₃ 相对' },
      wye_r1: { label: 'Y 臂 R₁', desc: '连向端口 a 的 Y 臂（电桥里：a 与 n 之间）' },
      wye_r2: { label: 'Y 臂 R₂', desc: '连向端口 b 的 Y 臂（电桥里：n 与左侧节点 c 之间）' },
      wye_r3: { label: 'Y 臂 R₃', desc: '连向端口 c 的 Y 臂（电桥里：n 与右侧节点 d 之间）' },
      overlay_adj_r1: { label: '求 R₁：相邻两臂 Rb、Rc 之积', desc: '站在端口 a 上，伸手摸到的两条 Δ 边就是 R₁ 的相邻两臂' },
      overlay_opp_ra: { label: '求 Ra：除以对面电阻 R₁', desc: 'Ra 正对端口 a，笔直指向它的 Y 臂 R₁ 就是对面电阻' },
      bridge_top_delta: { label: '顶部 Δ（a–c–d 三角）', desc: 'Rac、Rad、Rcd 首尾相连围成的闭合三角形' },
      bridge_mid: { label: '桥臂电阻 Rcd', desc: '横跨 c、d 的桥臂：它让所有电阻既不串联也不并联' },
      bridge_series_left: { label: '左侧串联支路 R₂ + Rcb', desc: 'Δ → Y 之后，n–c–b 这一路只剩两颗串联电阻' },
      bridge_series_right: { label: '右侧串联支路 R₃ + Rdb', desc: 'Δ → Y 之后，n–d–b 这一路只剩两颗串联电阻' },
      br_ac: { label: 'Rac（左上臂）', desc: '节点 a 与 c 之间，顶部 Δ 的一条边' },
      br_ad: { label: 'Rad（右上臂）', desc: '节点 a 与 d 之间，顶部 Δ 的一条边' },
      br_cb: { label: 'Rcb（左下臂）', desc: '节点 c 与 b 之间，Δ → Y 时保持不变' },
      br_db: { label: 'Rdb（右下臂）', desc: '节点 d 与 b 之间，Δ → Y 时保持不变' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------------ act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '困局破冰——为什么惠斯通电桥里的 5 颗电阻既不串联也不并联？',
      sync: { layer: BRIDGE, halo: ['term_c', 'term_d', 'bridge_mid'], params: { b_preset: 'classic', b_step: 0, b_quiz: false } },
      blocks: [
        {
          kind: 'p',
          text: '前七节课，我们靠串联相加、并联倒数相加，一路披荆斩棘，几乎拆解了所有常规直流电阻网络。但是今天，我要给你看一张在电工史上鼎鼎大名的电路——**惠斯通电桥（Wheatstone Bridge）**。',
        },
        { kind: 'p', text: '请你盯着这张图看 5 秒钟，试着找出哪怕**一对**串联或并联的电阻：' },
        {
          kind: 'ul',
          items: [
            String.raw`[[br_ac|$R_{ac}$]] 和 [[br_cb|$R_{cb}$]] 是串联吗？**不是！**因为它们之间的[[term_c|节点 c]] 还挂着一根横跨中央的“桥臂电阻” [[bridge_mid|$R_{cd}$]]。只要电流流过 $R_{cd}$，流入 $R_{ac}$ 的电流就不再等于流入 $R_{cb}$ 的电流——**串联的充要条件是两元件共享一个“度数为 2”（没有第三条支路分流）的节点**，这里节点 c 的度数是 3，串联宣告破产。`,
            String.raw`那 [[br_ac|$R_{ac}$]] 和 [[br_ad|$R_{ad}$]] 是并联吗？**也不是！**它们虽然在顶部共同连着[[term_a|节点 a]]，但底部一个连着 c，一个连着 d——中间被 [[bridge_mid|$R_{cd}$]] 隔开了。**并联的充要条件是两元件两端连接在完全相同的两个节点上**，这里 $V_c \neq V_d$（不平衡电桥），并联也宣告破产。`,
          ],
        },
        {
          kind: 'p',
          text: String.raw`以此类推，你把这 5 颗电阻两两配对检查完全部 $\binom{5}{2} = 10$ 种组合，会发现一个令人头皮发麻的事实：**任意两颗电阻之间，既不串联，也不并联！**`,
        },
        {
          kind: 'p',
          text: '这不是你的眼力问题，而是**拓扑结构**决定的：电桥里的[[term_a,term_b,term_c,term_d|四个节点 a, b, c, d]] 全部都是 3 条及以上支路交汇的节点，形成了一个“死结”。要解开这个死结，我们不能再靠“两两合并”，而必须把视角从“二端元件”升级到**“三端网络等效变换”**——也就是本课的主角：**Y–Δ（星形–三角形）等效变换**。',
        },
      ],
      inline_svg: sheetSvg(SVG_ACT1, '经典 5 电阻惠斯通电桥（无任何串联/并联对）'),
      figure_caption: '经典 5 电阻惠斯通电桥：桥臂打破了所有串并联关系',
    },

    /* ------------------------------------------------------------------ act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '几何变形与公理溯源——从端口等效推导出 Δ → Y 变换',
      sync: {
        layer: MORPH,
        halo: ['term_a', 'term_b'],
        params: { m_dir: 'd2y', m_ohm: 'ab', m_t: 0.5, m_bal: false, m_shape: 'slant', m_ra: 15, m_rb: 10, m_rc: 25 },
      },
      blocks: [
        {
          kind: 'p',
          text: String.raw`仔细观察第 1 幕电桥的上半部分：节点 a, c, d 之间由三颗电阻围成了一个闭合三角形——我们叫它 **$\Delta$（Delta，三角形）网络**。如果我们能把这个“三端黑盒”内部的三颗电阻，换成另一种连法——从中心引出一个[[node_n|中性点 n]]，分别连向三个端口形成一个 **Y（Wye，星形）网络**——只要对外暴露的三个端口 a, b, c 之间任意两端的等效电阻完全一致，外部电路根本察觉不到黑盒里被掉包了！`,
        },
        {
          kind: 'p',
          text: '按照 Alexander & Sadiku（Ch. 2.7）的标准记法，我们给三端网络的三个端口命名为 [[term_a|a（左上）]]、[[term_b|b（右上）]]、[[term_c|c（正下）]]：',
        },
        {
          kind: 'ul',
          items: [
            String.raw`**$\Delta$ 网络的三条边**：[[delta_ra|$R_a$]] 位于 b–c 之间（正对端口 a），[[delta_rb|$R_b$]] 位于 a–c 之间（正对端口 b），[[delta_rc|$R_c$]] 位于 a–b 之间（正对端口 c）。`,
            String.raw`**Y 网络的三条臂**：[[wye_r1|$R_1$]] 连向端口 a，[[wye_r2|$R_2$]] 连向端口 b，[[wye_r3|$R_3$]] 连向端口 c，三者在内部汇合于[[node_n|中心节点 n]]。`,
          ],
        },
        { kind: 'p', text: String.raw`下面我们严格按三段式推导 $\Delta \to Y$ 的精确公式：` },
        {
          kind: 'origin',
          title: '① 公理溯源（端口两两开路等效电阻相等）',
          text: String.raw`要使 $\Delta$ 网络与 Y 网络对外部完全等效，将第三个端口悬空（开路）时，其余任意两端口之间测得的等效电阻必须严格相等：`,
        },
        {
          kind: 'formula',
          title: String.raw`**端口 a–b 间（c 端开路）**：Y 侧为 [[wye_r1,wye_r2|$R_1, R_2$]] 串联；$\Delta$ 侧为 [[delta_rc|$R_c$]] 与 [[delta_ra,delta_rb|$(R_a + R_b)$]] 并联：`,
          tex: String.raw`R_{ab}(Y) = R_{ab}(\Delta) \implies R_1 + R_2 = \frac{R_c(R_a + R_b)}{R_a + R_b + R_c} \tag{1}`,
        },
        {
          kind: 'formula',
          title: '**端口 b–c 间（a 端开路）**：',
          tex: String.raw`R_{bc}(Y) = R_{bc}(\Delta) \implies R_2 + R_3 = \frac{R_a(R_b + R_c)}{R_a + R_b + R_c} \tag{2}`,
        },
        {
          kind: 'formula',
          title: '**端口 c–a 间（b 端开路）**：',
          tex: String.raw`R_{ca}(Y) = R_{ca}(\Delta) \implies R_3 + R_1 = \frac{R_b(R_c + R_a)}{R_a + R_b + R_c} \tag{3}`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式 · 用 $(1) + (3) - (2)$ 消去 $R_2$ 与 $R_3$：`,
          tex: String.raw`\begin{aligned} 2R_1 &= \frac{(R_c R_a + R_c R_b) + (R_b R_c + R_b R_a) - (R_a R_b + R_a R_c)}{R_a + R_b + R_c} \\ &= \frac{2 R_b R_c}{R_a + R_b + R_c} \end{aligned}`,
        },
        {
          kind: 'formula',
          title: String.raw`两边同除以 $2$，再由三端口轮换对称性直接写出全部三条 **$\Delta \to Y$ 通式**：`,
          tex: String.raw`R_1 = \frac{R_b R_c}{R_a + R_b + R_c}, \qquad R_2 = \frac{R_c R_a}{R_a + R_b + R_c}, \qquad R_3 = \frac{R_a R_b}{R_a + R_b + R_c}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '题设',
              text: String.raw`设已知一个 $\Delta$ 网络的三条边为 $R_a = 15\,\Omega$、$R_b = 10\,\Omega$、$R_c = 25\,\Omega$，求其等效 Y 网络的 $R_1, R_2, R_3$：`,
            },
            { label: 'Step A', text: '先算公共分母（三臂之和）：', tex: String.raw`R_\Sigma = R_a + R_b + R_c = 15 + 10 + 25 = 50\,\Omega` },
            {
              label: 'Step B',
              text: '分别代入三条通式：',
              tex: String.raw`\begin{gathered} R_1 = \frac{R_b R_c}{R_\Sigma} = \frac{10 \times 25}{50} = \frac{250}{50} = 5\,\Omega \\ R_2 = \frac{R_c R_a}{R_\Sigma} = \frac{25 \times 15}{50} = \frac{375}{50} = 7.5\,\Omega \\ R_3 = \frac{R_a R_b}{R_\Sigma} = \frac{15 \times 10}{50} = \frac{150}{50} = 3\,\Omega \end{gathered}`,
            },
            {
              label: '端口复核',
              text: String.raw`测 a–b 端口，Y 侧 $R_1 + R_2 = 5 + 7.5 = 12.5\,\Omega$；$\Delta$ 侧 $25 \parallel (15 + 10) = 25 \parallel 25 = 12.5\,\Omega$，分毫不差！`,
            },
          ],
        },
      ],
      inline_svg: sheetSvg(SVG_ACT2, '端口两两开路等效：c 端开路时 Δ 与 Y 的 R_ab 都是 12.5 Ω'),
      figure_caption: '端口两两开路等效（c 端开路）：Δ 与 Y 的 a–b 端电阻完全相等',
    },

    /* ------------------------------------------------------------------ act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '逆向推导与“叠画记忆法”——永不背错 6 条公式的视觉秘诀',
      sync: {
        layer: MORPH,
        halo: ['overlay_adj_r1', 'overlay_opp_ra'],
        params: { m_t: 0.5, m_dir: 'y2d', m_ohm: 'off', m_bal: false, m_shape: 'slant', m_r1: 5, m_r2: 7.5, m_r3: 3 },
      },
      blocks: [
        {
          kind: 'p',
          text: String.raw`既然能从 $\Delta$ 变到 Y，反过来，如果手里是 Y 网络，怎么还原出 $\Delta$ 网络？我们先严格推导出 $Y \to \Delta$ 通式，再教你一个**一辈子不会背错 6 条公式的图形记忆法**。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源（端口等效方程组的逆解）',
          text: String.raw`承接第 2 幕由端口两两开路等效导出的 $\Delta \to Y$ 三式：`,
        },
        {
          kind: 'formula',
          title: String.raw`$\Delta \to Y$ 三式`,
          tex: String.raw`R_1 = \frac{R_b R_c}{R_\Sigma}, \qquad R_2 = \frac{R_c R_a}{R_\Sigma}, \qquad R_3 = \frac{R_a R_b}{R_\Sigma} \quad (R_\Sigma = R_a + R_b + R_c)`,
        },
        {
          kind: 'formula',
          title: String.raw`为了把分母里的 $R_\Sigma$ 与乘积项凑成整齐的对称结构，我们计算 Y 网络三个电阻的**两两乘积之和**：`,
          tex: String.raw`\begin{aligned} R_1 R_2 + R_2 R_3 + R_3 R_1 &= \frac{R_a R_b R_c^2 + R_a^2 R_b R_c + R_a R_b^2 R_c}{R_\Sigma^2} \\ &= \frac{R_a R_b R_c (R_c + R_a + R_b)}{R_\Sigma^2} = \frac{R_a R_b R_c}{R_\Sigma} \end{aligned}`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式 · 把上式分别除以 $R_1$、$R_2$、$R_3$，公共因子 $\frac{1}{R_\Sigma}$ 与对应的两项乘积瞬间约分干净，得到全部三条 **$Y \to \Delta$ 通式**：`,
          tex: String.raw`R_a = \frac{R_1 R_2 + R_2 R_3 + R_3 R_1}{R_1}, \qquad R_b = \frac{R_1 R_2 + R_2 R_3 + R_3 R_1}{R_2}, \qquad R_c = \frac{R_1 R_2 + R_2 R_3 + R_3 R_1}{R_3}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '题设',
              text: String.raw`把第 2 幕算出的 Y 网络（$R_1 = 5\,\Omega$、$R_2 = 7.5\,\Omega$、$R_3 = 3\,\Omega$）代回逆变换公式，验证是否能精确还原：`,
            },
            {
              label: 'Step A',
              text: '先算公共分子（两两乘积之和）：',
              tex: String.raw`P_\Sigma = R_1 R_2 + R_2 R_3 + R_3 R_1 = (5)(7.5) + (7.5)(3) + (3)(5) = 37.5 + 22.5 + 15 = 75\,\Omega^2`,
            },
            {
              label: 'Step B',
              text: '分别除以各自**对面**的 Y 电阻：',
              tex: String.raw`R_a = \frac{P_\Sigma}{R_1} = \frac{75}{5} = 15\,\Omega, \qquad R_b = \frac{P_\Sigma}{R_2} = \frac{75}{7.5} = 10\,\Omega, \qquad R_c = \frac{P_\Sigma}{R_3} = \frac{75}{3} = 25\,\Omega`,
            },
          ],
        },
        { kind: 'p', text: '完美还原！' },
        { kind: 'p', text: String.raw`**教授的独家图形记忆法：“把 $\Delta$ 叠画在 Y 外面”**` },
        {
          kind: 'p',
          text: String.raw`考试时题目绝不会乖乖按 $R_1, R_2, R_3$ 和 $R_a, R_b, R_c$ 给你编号，可能全是 $R_x, R_y, R_z$ 甚至 $R_{10}, R_{20}, R_{30}$。**死记字母下标是踩坑之源！** 你只需要在草稿纸上把 $\Delta$ 直接叠画在 Y 的外框上（见下方示意图），记住两句口诀，哪怕字母全打乱也绝不会错：`,
        },
        {
          kind: 'ul',
          items: [
            String.raw`**$\Delta \to Y$（已知外框，求内部星形臂）**：**“相邻两臂之积，除以三臂之和。”** 站在你想求的 Y 臂（如 [[overlay_adj_r1|$R_1$]]）所连的端口（[[term_a|端口 a]]）上，伸出双手摸到的两条 $\Delta$ 边（[[delta_rb|$R_b$]] 和 [[delta_rc|$R_c$]]）就是它的**相邻两臂**。 $\displaystyle R_{\text{内}} = \frac{\text{相邻两外边之积}}{\text{三外边之和}}$`,
            String.raw`**$Y \to \Delta$（已知内部，求外框三角边）**：**“两两乘积之和，除以对面电阻。”** 站在你想求的 $\Delta$ 边（如 [[overlay_opp_ra|$R_a$]]）上往三角形内部看，笔直指向你正对面的那条 Y 臂（[[wye_r1|$R_1$]]）就是你的**对面电阻**。 $\displaystyle R_{\text{外}} = \frac{\text{三内臂两两乘积之和}}{\text{正对面的那条内臂}}$`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: String.raw`**量纲自检技巧**：$\Delta \to Y$ 分子是 $\Omega^2$、分母是 $\Omega$，商为 $\Omega$；$Y \to \Delta$ 分子是 $\Omega^2$、分母是 $\Omega$，商也是 $\Omega$。凡是写反了分子分母，量纲一秒钟就会露馅！`,
        },
      ],
      inline_svg: sheetSvg(SVG_ACT3, '图形记忆法：把 Δ 叠画在 Y 外面，相邻两臂与对面电阻'),
      figure_caption: '图形记忆法：“把 Δ 叠画在 Y 外面”（相邻 vs 对面）',
    },

    /* ------------------------------------------------------------------ act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '对称网络秒杀技巧——RΔ = 3 RY 与工程直觉',
      sync: {
        layer: MORPH,
        halo: ['term_a', 'term_b'],
        params: { m_bal: true, m_dir: 'd2y', m_ra: 30, m_rb: 30, m_rc: 30, m_t: 0.5, m_ohm: 'ab', m_shape: 'slant' },
      },
      blocks: [
        {
          kind: 'p',
          text: '在三相电力系统、传感器电桥和芯片匹配网络中，三颗电阻阻值完全相等的**平衡（对称）网络**出现频率极高。此时你完全不需要列分数，一眼就能心算秒杀！',
        },
        {
          kind: 'origin',
          title: '① 公理溯源（对称约束代入通式）',
          text: String.raw`当 $\Delta$ 网络满足 $R_a = R_b = R_c = R_\Delta$，或 Y 网络满足 $R_1 = R_2 = R_3 = R_Y$ 时，三端口完全对称，必有变换后的三颗电阻也全部相等。`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式 · 代入 $\Delta \to Y$ 通式：`,
          tex: String.raw`R_Y = \frac{R_\Delta \cdot R_\Delta}{R_\Delta + R_\Delta + R_\Delta} = \frac{R_\Delta^2}{3 R_\Delta} = \frac{R_\Delta}{3}`,
        },
        {
          kind: 'formula',
          title: String.raw`反之，代入 $Y \to \Delta$ 通式：`,
          tex: String.raw`R_\Delta = \frac{R_Y^2 + R_Y^2 + R_Y^2}{R_Y} = \frac{3 R_Y^2}{R_Y} = 3 R_Y`,
        },
        { kind: 'formula', title: '于是得到电路学中最常用的心算黄金法则：', tex: String.raw`R_\Delta = 3 R_Y \iff R_Y = \frac{R_\Delta}{3}` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '秒杀案例', text: String.raw`一个 5 电阻惠斯通电桥，5 颗电阻全部为 $30\,\Omega$，求 $R_{ab}$。` },
            {
              label: 'Step A',
              text: String.raw`**顶部 $\Delta \to Y$ 秒杀**：顶部三颗 $30\,\Omega$ 构成对称 $\Delta$，除以 $3$ 直接变为三颗 $R_Y = \frac{30}{3} = 10\,\Omega$ 的 Y 网络。`,
            },
            { label: 'Step B', text: String.raw`**退化为串并联** · 左侧支路：$R_{\text{left}} = 10 + 30 = 40\,\Omega$` },
            { label: 'Step C', text: String.raw`右侧支路：$R_{\text{right}} = 10 + 30 = 40\,\Omega$` },
            { label: 'Step D', text: String.raw`并联后与顶部 $10\,\Omega$ 串联：`, tex: String.raw`R_{ab} = 10 + (40 \parallel 40) = 10 + 20 = 30\,\Omega` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: String.raw`**物理直觉防反记**：很多同学考场上会犹豫“到底是 $R_\Delta = 3 R_Y$ 还是 $R_Y = 3 R_\Delta$？”记住一个物理事实就永远不会反：**在 $\Delta$ 里，电流从 a 走到 b 有两条并联路（直接走 [[delta_rc|$R_c$]]，或者绕道 [[delta_rb,delta_ra|$R_b + R_a$]]），并联会让总电阻变小；而在 Y 里，电流只能串联走过 [[wye_r1,wye_r2|$R_1 + R_2$]]。为了对外呈现相同的阻值，并联的 $\Delta$ 每一条边必须比串联的 Y 更大——正好大 3 倍（$\Delta$ 大 Y 小）！**`,
        },
      ],
      inline_svg: sheetSvg(SVG_ACT4, '对称网络：每边 30 Ω 的 Δ 等效于每臂 10 Ω 的 Y'),
      figure_caption: '对称网络秒杀：Δ 大 Y 小，系数为 3',
    },

    /* ------------------------------------------------------------------ act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '电桥拆解实战——苏格拉底式分步引导例题',
      sync: { layer: BRIDGE, halo: ['bridge_top_delta'], params: { b_preset: 'classic', b_step: 1, b_quiz: true } },
      blocks: [
        { kind: 'p', text: '现在轮到你亲自操刀！下面是一个**不平衡的 5 电阻电桥**：' },
        {
          kind: 'ul',
          items: [
            String.raw`顶部两臂：[[br_ac|$R_{ac} = 12\,\Omega$]]（左上），[[br_ad|$R_{ad} = 18\,\Omega$]]（右上）`,
            String.raw`中间桥臂：[[bridge_mid|$R_{cd} = 6\,\Omega$]]`,
            String.raw`底部两臂：[[br_cb|$R_{cb} = 10\,\Omega$]]（左下），[[br_db|$R_{db} = 21\,\Omega$]]（右下）`,
          ],
        },
        { kind: 'p', text: String.raw`我们要严格按照三步求出端口 a–b 之间的总等效电阻 $R_{ab}$。请在下方苏格拉底引导卡片中完成每一步推理：` },
        {
          kind: 'guided',
          title: String.raw`经典 5 电阻不平衡电桥求 $R_{ab}$（3 步破局）`,
          problem: String.raw`已知 5 电阻电桥：$R_{ac} = 12\ \Omega$，$R_{ad} = 18\ \Omega$，桥臂 $R_{cd} = 6\ \Omega$，$R_{cb} = 10\ \Omega$，$R_{db} = 21\ \Omega$。请通过 $\Delta \to Y$ 变换求出端口 a 与 b 之间的等效电阻 $R_{ab}$。`,
          problem_svg: SVG_PROBLEM,
          steps: [
            {
              title: 'Step 1 · 识别待转换的 Δ',
              mini_svg: sheetSvg(SVG_STEP1, '顶部 Δ 候选：12 Ω、18 Ω、6 Ω 围成的三角形'),
              question: '图中没有任何串联或并联电阻对。要一次性解开电桥死结，我们只需把其中 1 个闭合三角形（Δ）转换成星形（Y）。以下哪一组电阻构成了顶部 Δ（连接节点 a, c, d）？',
              hint: String.raw`Δ 的三条边必须首尾相连、两两共享一个节点，围成一个闭合回路。从节点 a 出发，沿两条上臂走到 c 和 d，再看 c、d 之间被哪颗电阻连通。`,
              options: [
                {
                  text: String.raw`$R_{ac}$ (12 Ω)、$R_{ad}$ (18 Ω)、$R_{cd}$ (6 Ω)`,
                  correct: true,
                  feedback: String.raw`精准识别！这三颗电阻首尾相连于节点 a, c, d，构成完美的顶部 Δ，三臂之和 $R_\Sigma = 12 + 18 + 6 = 36\ \Omega$。`,
                },
                {
                  text: String.raw`$R_{ac}$ (12 Ω)、$R_{cb}$ (10 Ω)、$R_{ad}$ (18 Ω)`,
                  correct: false,
                  feedback: String.raw`这三颗电阻并没有围成闭合三角形（缺少把 c 和 b、d 闭合的第三边）。请盯着中间桥臂 $R_{cd}$，看它和顶部哪两颗电阻围成了 Δ。`,
                },
                {
                  text: '把顶部 Δ 和底部 Δ 同时都转换成 Y',
                  correct: false,
                  feedback: String.raw`千万别这么做！顶部 Δ 和底部 Δ 共享同一颗桥臂电阻 $R_{cd}$，不能同时转换；而且只要转换其中任意一个 Δ，桥臂就已经消失，电路立刻变成普通串并联！`,
                },
              ],
              board: [String.raw`\text{顶部 }\Delta:\ R_{ac},\ R_{ad},\ R_{cd}`, String.raw`R_\Sigma = R_{ac} + R_{ad} + R_{cd} = 12 + 18 + 6 = 36\,\Omega`],
              halo: ['bridge_top_delta'],
              params: { b_preset: 'classic', b_step: 1, b_quiz: true },
            },
            {
              title: 'Step 2 · 代入 Δ → Y 公式',
              mini_svg: sheetSvg(SVG_STEP2, '顶部 Δ 变为中心节点 n 的 Y：R_1、R_2、R_3 待求'),
              question: String.raw`将顶部 Δ（$R_{ac} = 12\ \Omega$, $R_{ad} = 18\ \Omega$, $R_{cd} = 6\ \Omega$，三臂之和 36 Ω）转换为中心节点为 n 的 Y 网络。其中 $R_1$ 连接顶部节点 a，$R_2$ 连接左侧节点 c，$R_3$ 连接右侧节点 d。请问 $R_1$、$R_2$、$R_3$ 分别是多少？`,
              hint: String.raw`口诀：相邻两臂之积，除以三臂之和。先站到每条 Y 臂所连的节点上，看哪两条 Δ 边直接碰着这个节点——比如节点 a 碰着的是 $R_{ac}$ 和 $R_{ad}$。`,
              options: [
                {
                  text: String.raw`$R_1 = 6\ \Omega$，$R_2 = 2\ \Omega$，$R_3 = 3\ \Omega$`,
                  correct: true,
                  feedback: String.raw`完全正确！$R_1$ 连向节点 a，相邻两臂是 12 Ω 与 18 Ω → (12×18)/36 = 6 Ω；$R_2$ 连向 c，相邻两臂 12 Ω 与 6 Ω → (12×6)/36 = 2 Ω；$R_3$ 连向 d，相邻两臂 18 Ω 与 6 Ω → (18×6)/36 = 3 Ω。`,
                },
                {
                  text: String.raw`$R_1 = 2\ \Omega$，$R_2 = 6\ \Omega$，$R_3 = 3\ \Omega$`,
                  correct: false,
                  feedback: String.raw`【错路拦截：选错相邻电阻！】你把 $R_1$ 和 $R_2$ 的相邻两臂搞混了！请站在节点 a 往下看：直接碰着节点 a 的两条 Δ 边是 $R_{ac}$ (12 Ω) 和 $R_{ad}$ (18 Ω)，而不是底部的 6 Ω。所以 $R_1$ = (12×18)/36 = 6 Ω。`,
                },
                {
                  text: String.raw`$R_1 = 3\ \Omega$，$R_2 = 6\ \Omega$，$R_3 = 2\ \Omega$`,
                  correct: false,
                  feedback: String.raw`【错路拦截：选错相邻电阻！】把 18 Ω 和 6 Ω 算到 $R_1$ 头上了——它们交汇在节点 d，对应的是 $R_3$！口诀再默念一遍：哪个端口的 Y 臂，就乘直接连在这个端口上的两条 Δ 边。`,
                },
              ],
              board: [
                String.raw`R_1 = \frac{R_{ac} R_{ad}}{R_\Sigma} = \frac{12 \times 18}{36} = 6\,\Omega`,
                String.raw`R_2 = \frac{R_{ac} R_{cd}}{R_\Sigma} = \frac{12 \times 6}{36} = 2\,\Omega`,
                String.raw`R_3 = \frac{R_{ad} R_{cd}}{R_\Sigma} = \frac{18 \times 6}{36} = 3\,\Omega`,
              ],
              halo: ['wye_r1', 'wye_r2', 'wye_r3', 'node_n'],
              params: { b_preset: 'classic', b_step: 2, b_quiz: true },
            },
            {
              title: 'Step 3 · 串并联收尾',
              mini_svg: sheetSvg(SVG_STEP3, '退化后的串并联：6 Ω 串联 (2+10 Ω) 与 (3+21 Ω) 的并联'),
              question: String.raw`顶部 Δ 替换为 Y（$R_1 = 6\ \Omega$, $R_2 = 2\ \Omega$, $R_3 = 3\ \Omega$）后，$R_2$ 与左下 $R_{cb}$ (10 Ω) 串联，$R_3$ 与右下 $R_{db}$ (21 Ω) 串联，两支路并联后再与 $R_1$ 串联。最终 $R_{ab}$ 等于多少？`,
              hint: String.raw`先把每条支路内部的串联加起来；再看两条支路的两端——一端都在 n，另一端都在 b。最后别忘了 a 与 n 之间还有 $R_1$。`,
              options: [
                {
                  text: '14 Ω',
                  correct: true,
                  feedback: String.raw`漂亮！左侧串联 2 + 10 = 12 Ω，右侧串联 3 + 21 = 24 Ω；两者并联 $12 \parallel 24$ = (12×24)/(12+24) = 8 Ω；最后加上顶部串联的 $R_1$ = 6 Ω，得 $R_{ab}$ = 6 + 8 = 14 Ω。`,
                },
                {
                  text: '42 Ω',
                  correct: false,
                  feedback: '你把左侧 12 Ω 和右侧 24 Ω 直接相加（6 + 12 + 24 = 42 Ω）了！注意这两条支路一端共同连在中心节点 n，另一端共同连在节点 b，它们是并联关系。',
                },
                {
                  text: '8 Ω',
                  correct: false,
                  feedback: String.raw`8 Ω 只是下面两条支路并联后的等效阻值（$12 \parallel 24$ = 8 Ω），别忘了节点 a 与中心节点 n 之间还串联着一颗 $R_1$ = 6 Ω！`,
                },
              ],
              board: [
                String.raw`R_{\text{left}} = R_2 + R_{cb} = 2 + 10 = 12\,\Omega,\quad R_{\text{right}} = R_3 + R_{db} = 3 + 21 = 24\,\Omega`,
                String.raw`R_{ab} = R_1 + (R_{\text{left}} \parallel R_{\text{right}}) = 6 + \frac{12 \times 24}{12 + 24} = 6 + 8 = 14\,\Omega`,
              ],
              halo: ['bridge_series_left', 'bridge_series_right'],
              params: { b_preset: 'classic', b_step: 4, b_quiz: true },
            },
          ],
          conclusion: String.raw`一次 $\Delta \to Y$ 就解开了电桥死结：$R_{ab} = 14\ \Omega$。在左侧点「一键将顶部 Δ 变形为 Y」，把完整的化简动画再看一遍。`,
        },
        { kind: 'p', text: '**本题完整三段式规范解答复盘**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: String.raw`将[[bridge_top_delta|顶部 $\Delta$（节点 a, c, d 间的 $R_{ac}, R_{ad}, R_{cd}$）]]替换为端口等效的星形网络（[[wye_r1,wye_r2,wye_r3|$R_1, R_2, R_3$]]），消除跨接桥臂。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式',
          tex: String.raw`\begin{gathered} R_1 = \frac{R_{ac} R_{ad}}{R_\Sigma}, \quad R_2 = \frac{R_{ac} R_{cd}}{R_\Sigma}, \quad R_3 = \frac{R_{ad} R_{cd}}{R_\Sigma} \quad (R_\Sigma = R_{ac} + R_{ad} + R_{cd}) \\ R_{ab} = R_1 + \big[(R_2 + R_{cb}) \parallel (R_3 + R_{db})\big] \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: 'Step A', tex: String.raw`R_\Sigma = 12 + 18 + 6 = 36\,\Omega` },
            {
              label: 'Step B',
              tex: String.raw`R_1 = \frac{12 \times 18}{36} = 6\,\Omega, \qquad R_2 = \frac{12 \times 6}{36} = 2\,\Omega, \qquad R_3 = \frac{18 \times 6}{36} = 3\,\Omega`,
            },
            {
              label: 'Step C',
              tex: String.raw`R_{\text{left}} = R_2 + R_{cb} = 2 + 10 = 12\,\Omega, \qquad R_{\text{right}} = R_3 + R_{db} = 3 + 21 = 24\,\Omega`,
            },
            { label: 'Step D', tex: String.raw`R_{ab} = 6 + (12 \parallel 24) = 6 + \frac{12 \times 24}{12 + 24} = 6 + 8 = 14\,\Omega` },
          ],
        },
      ],
      inline_svg: sheetSvg(SVG_ACT5, '电桥顶部 Δ → Y 后退化为普通串并联，R_ab = 14 Ω'),
      figure_caption: '实战拆解：电桥顶部 Δ → Y 后瞬间退化为普通串并联',
    },

    /* ------------------------------------------------------------------ act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '工程避坑指南——T–Π 变形识别与转换方向选择',
      sync: { layer: MORPH, halo: ['term_c'], params: { m_shape: 'tpi', m_t: 0.5, m_ohm: 'off', m_bal: false } },
      blocks: [
        {
          kind: 'p',
          text: '很多学生在教材例题里能一眼认出电桥，一到真实原理图或 Boylestad Ch. 7 的复杂梯形网络就傻眼了——原因只有一个：**工程师画 PCB 原理图习惯用横平竖直的直角走线，而不是斜着画三角形或 Y 字！**',
        },
        { kind: 'p', text: '请记住这两个**拓扑等价变装**：' },
        {
          kind: 'ul',
          items: [
            String.raw`**T 型网络 $\equiv$ Y 型网络**：把 Y 的[[wye_r1,wye_r2|两条上臂]]拉平变成水平，[[wye_r3|下臂]]垂直，就是一个标准的 **T 字**。`,
            String.raw`**$\Pi$（Pi）型网络 $\equiv$ $\Delta$ 型网络**：把 $\Delta$ 底部的单个[[term_c|节点 c]] 拉长成一整条水平公共底线（地线），三角形立刻变成一座门框形的 **$\Pi$ 字**。`,
          ],
        },
        { kind: 'p', text: '**转换方向怎么选？记住两条实战军规**：' },
        {
          kind: 'ul',
          items: [
            String.raw`**优先做 $\Delta \to Y$**：因为绝大多数复杂网络（电桥、双桥、梯形衰减器）只要把一个 $\Delta$ 缩成 Y，节点间的交叉连接立刻断开，极易退化为串并联。`,
            String.raw`**什么时候做 $Y \to \Delta$？** 当一个 Y 网络的外部已经并联着其他电阻时，把内部的 Y 撑开成 $\Delta$，新生成的三条边会恰好与外部电阻**直接并联**，一步合并三组电阻！`,
            String.raw`**千万别把要测电压/电流的目标支路吞掉！** 如果题目要求的是桥臂电阻 $R_{cd}$ 上的电流 $I_{cd}$，把顶部 $\Delta$ 转成 Y 后 $R_{cd}$ 就消失了——此时先求总电流 $I_{ab}$，或者留到下节课用 **World 2 节点分析法** 一招通吃。`,
          ],
        },
      ],
      inline_svg: sheetSvg(SVG_ACT6, '原理图变装识别：T 型等价于 Y 型，Π 型等价于 Δ 型'),
      figure_caption: '原理图“变装识别”：T 型 ≡ Y 型，Π 型 ≡ Δ 型',
    },

    /* ------------------------------------------------------------------ act 7 */
    {
      act_index: 7,
      badge: '第 7 幕',
      title: '随堂自测与 World 1 收官 · World 2 预告',
      sync: { layer: BRIDGE, params: { b_preset: 'custom', b_step: 0, b_quiz: false } },
      blocks: [{ kind: 'p', text: '完成下面 2 道随堂自测，检验你是否已经彻底拿下 Y–Δ 变换与电桥化简：' }],
      quiz: [
        {
          id: 'w1l8_q1',
          question: String.raw`一个 5 电阻惠斯通电桥中，5 颗电阻的阻值全部为 18 Ω。利用对称 $\Delta \to Y$ 变换，端口 a 与 b 之间的等效电阻 $R_{ab}$ 等于多少？`,
          options: [
            { key: 'A', text: '6 Ω', correct: false, feedback: String.raw`选 A (6 Ω) 是只算出了单臂 $R_Y$。` },
            { key: 'B', text: '12 Ω', correct: false, feedback: '选 B (12 Ω) 是漏加了顶部的 6 Ω 串联臂。' },
            { key: 'C', text: '18 Ω', correct: true },
            { key: 'D', text: '27 Ω', correct: false },
          ],
          feedback_correct: String.raw`顶部 3 颗 18 Ω 电阻构成对称 Δ，由 $R_Y = R_\Delta / 3$ 直接变为 3 颗 6 Ω 的 Y 臂。随后左右两支路分别为 6 + 18 = 24 Ω，两者并联得 $24 \parallel 24$ = 12 Ω，最后串联顶部 6 Ω 臂：$R_{ab}$ = 6 + 12 = 18 Ω。（也可从平衡电桥视角交叉验证：桥臂无电流开路，$(18+18) \parallel (18+18)$ = 18 Ω。）`,
          feedback_wrong: String.raw`再算一遍：先由 $R_Y = R_\Delta / 3$ 把顶部 Δ 变成 3 颗 6 Ω 的 Y 臂，再按“左右支路各自串联 → 两支路并联 → 加上顶部 Y 臂”收尾。可以在左侧「自定义阻值」里把 5 颗电阻都拖到 18 Ω 核对。`,
          figure: SVG_Q1,
          sync: { layer: BRIDGE, params: { b_preset: 'custom', b_step: 0, b_quiz: false } },
        },
        {
          id: 'w1l8_q2',
          question: String.raw`已知某 Y 网络的三条臂分别为：$R_1 = 4\ \Omega$（连端口 a）、$R_2 = 6\ \Omega$（连端口 b）、$R_3 = 12\ \Omega$（连端口 c）。将其转换为等效 Δ 网络后，位于端口 b 与 c 之间的电阻 $R_a$ 等于多少？`,
          options: [
            { key: 'A', text: '12 Ω', correct: false, feedback: String.raw`选 A (12 Ω) 是误除以了 $R_3 = 12\ \Omega$。` },
            { key: 'B', text: '22 Ω', correct: false, feedback: '选 B (22 Ω) 是把三臂直接相加。' },
            { key: 'C', text: '24 Ω', correct: false, feedback: String.raw`选 C (24 Ω) 是误除以了 $R_2 = 6\ \Omega$。` },
            { key: 'D', text: '36 Ω', correct: true },
          ],
          feedback_correct: String.raw`第一步算公共分子（两两乘积之和）：$P_\Sigma = R_1 R_2 + R_2 R_3 + R_3 R_1 = (4)(6) + (6)(12) + (12)(4) = 24 + 72 + 48 = 144\ \Omega^2$。第二步找 $R_a$ 的对面电阻：$R_a$ 跨接在 b 与 c 之间，正对端口 a，因此其对面电阻为 $R_1 = 4\ \Omega$。故 $R_a = 144 / 4 = 36\ \Omega$。`,
          feedback_wrong: String.raw`先算两两乘积之和 $P_\Sigma$，再除以 $R_a$ 正对面的那条 Y 臂。`,
          figure: SVG_Q2,
          sync: { layer: MORPH, params: { m_dir: 'y2d', m_t: 0.5, m_shape: 'slant', m_bal: false, m_ohm: 'off' } },
        },
      ],
      after_quiz: [
        {
          kind: 'p',
          text: '恭喜你通关 **World 1（直流电路基础与等效化简）** 的全部 8 节课！回顾这一路，你已经集齐了经典直流电阻化简的完整工具箱：',
        },
        {
          kind: 'ul',
          items: [
            String.raw`**底层公理**：欧姆定律（$V = IR$）、基尔霍夫电流定律（KCL）与电压定律（KVL）；`,
            '**常规武器**：串联分压、并联分流与复杂串并联等效；',
            '**破局大招**：Y–Δ（T–Π）三端等效变换，彻底攻克无串并联的电桥网络。',
          ],
        },
        {
          kind: 'p',
          text: '**下一站：W2-L1 节点分析法（Nodal Analysis）** 你有没有想过一个问题：如果电路里不再只有一个电源，而是塞进了 3 个独立电压源、2 个电流源，外加好几个交错的电桥——难道我们还要一遍遍画 $\\Delta \\to Y$ 吗？',
        },
        {
          kind: 'p',
          text: '答案是：**不需要！** 在 **World 2**，我们将正式告别“看图拼乐高式”的几何化简，进入现代电路仿真器（如 SPICE）真正使用的**系统化代数引擎**。下一节 **W2-L1 节点分析法**，你将看到如何仅凭 KCL 列出两个线性方程，**连电桥都不拆**，直接秒算出今天第 5 幕这道不平衡电桥里每一个节点的精确电压与每一条支路的电流。我们 World 2 见！',
        },
        { kind: 'figure', svg: sheetSvg(SVG_ACT7, 'World 1 通关路线图，下一站 W2-L1 节点分析法'), caption: 'World 1 通关路线图 → World 2 节点分析法启程' },
      ],
    },
  ],
};

export default W1_L8;
