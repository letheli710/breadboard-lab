// W1-L0 · 实验箱与万用表极简前置卡 (lesson sheet: docs/lessons/W1-L0.md).
// Lesson text, formulas and the three act diagrams are reproduced from the sheet as written
// (one layout fix: in the act-2 diagram the 黑 and 金 labels drop a line so they don't overlap);
// the act-2 colour-code card (table + reader) is added here: the sheet reads one resistor only;
// [[id|…]] only links a term to the stage (the words are unchanged). The two quiz diagrams are
// added here (blueprint rule: every act has a local diagram); they show the options without
// giving the answer away.

import type { StageLesson } from '../types';

/* ------------------------------------------------------------- act diagrams (from the sheet) */

const SVG_ACT1 = `<svg viewBox="0 0 420 136" class="w-full h-auto" aria-label="面包板内部金属铜片导通规律图">
  <rect x="8" y="8" width="404" height="120" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
  <!-- Top Power Rail (Horizontal) -->
  <rect x="24" y="18" width="372" height="16" rx="4" fill="#fef2f2" stroke="#ef4444" stroke-width="1.4" />
  <text x="210" y="29" text-anchor="middle" fill="#b91c1c" font-size="9" font-weight="800" font-family="monospace">电源轨（+ / −）：整排横向连通 ━━━━━━━━━━━</text>

  <!-- Upper 5-hole vertical strips (a-e) -->
  <g fill="#eff6ff" stroke="#3b82f6" stroke-width="1.4">
    <rect x="44" y="42" width="22" height="30" rx="4" />
    <rect x="78" y="42" width="22" height="30" rx="4" />
    <rect x="112" y="42" width="22" height="30" rx="4" />
    <rect x="146" y="42" width="22" height="30" rx="4" />
  </g>
  <text x="106" y="60" text-anchor="middle" fill="#1d4ed8" font-size="8.5" font-weight="800">a–e 竖通</text>

  <!-- Center Trench -->
  <rect x="24" y="76" width="372" height="12" rx="3" fill="#e2e8f0" />
  <text x="210" y="85" text-anchor="middle" fill="#475569" font-size="8.5" font-weight="800" font-family="monospace">═══ 中央凹槽（上下完全绝缘 · 芯片跨插区）═══</text>

  <!-- Lower 5-hole vertical strips (f-j) -->
  <g fill="#ecfdf5" stroke="#10b981" stroke-width="1.4">
    <rect x="44" y="92" width="22" height="28" rx="4" />
    <rect x="78" y="92" width="22" height="28" rx="4" />
    <rect x="112" y="92" width="22" height="28" rx="4" />
    <rect x="146" y="92" width="22" height="28" rx="4" />
  </g>
  <text x="106" y="109" text-anchor="middle" fill="#047857" font-size="8.5" font-weight="800">f–j 竖通</text>

  <!-- Right side: Wrong vs Right Resistor Placement -->
  <rect x="200" y="42" width="90" height="28" rx="6" fill="#fff1f2" stroke="#f43f5e" />
  <text x="245" y="55" text-anchor="middle" fill="#be123c" font-size="8.5" font-weight="800">✕ 错：同列竖插</text>
  <text x="245" y="66" text-anchor="middle" fill="#9f1239" font-size="7.8">两脚直接短路</text>

  <rect x="302" y="42" width="94" height="28" rx="6" fill="#ecfdf5" stroke="#10b981" />
  <text x="349" y="55" text-anchor="middle" fill="#065f46" font-size="8.5" font-weight="800">✓ 对：跨列横插</text>
  <text x="349" y="66" text-anchor="middle" fill="#047857" font-size="7.8">或跨凹槽插接</text>

  <text x="298" y="110" text-anchor="middle" fill="#334155" font-size="8.5" font-weight="600">同一竖列 5 个孔 = 原理图上的“同一个节点”</text>
</svg>`;

const SVG_ACT2 = `<svg viewBox="0 0 420 108" class="w-full h-auto" aria-label="四色环 10k 电阻读法示意图">
  <!-- Leads -->
  <line x1="36" y1="48" x2="108" y2="48" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
  <line x1="312" y1="48" x2="384" y2="48" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
  <!-- Resistor Body -->
  <rect x="108" y="24" width="204" height="48" rx="16" fill="#f5deb3" stroke="#b45309" stroke-width="2" />
  <!-- 4 Color Bands: Brown, Black, Orange, Gold -->
  <rect x="136" y="24" width="16" height="48" fill="#78350f" />
  <rect x="172" y="24" width="16" height="48" fill="#0f172a" />
  <rect x="208" y="24" width="16" height="48" fill="#f97316" />
  <rect x="264" y="24" width="16" height="48" fill="#eab308" />
  <!-- Callout Labels -->
  <g font-size="9" font-weight="800" text-anchor="middle" font-family="monospace">
    <text x="144" y="90" fill="#78350f">棕 = 1</text>
    <text x="180" y="102" fill="#0f172a">黑 = 0</text>
    <text x="216" y="90" fill="#ea580c">橙 = ×10³</text>
    <text x="272" y="102" fill="#a16207">金 = ±5%</text>
  </g>
  <text x="210" y="15" text-anchor="middle" fill="#1e293b" font-size="9.5" font-weight="800">实验室最常见阻值：棕-黑-橙-金 = 10 kΩ (±5%)</text>
</svg>`;

const SVG_ACT3 = `<svg viewBox="0 0 420 116" class="w-full h-auto" aria-label="万用表测电压并联与测电流串联对比图">
  <!-- Left: Voltage Parallel (Safe) -->
  <rect x="8" y="8" width="196" height="100" rx="9" fill="#ecfdf5" stroke="#34d399" stroke-width="1.5" />
  <text x="106" y="24" text-anchor="middle" fill="#065f46" font-size="9.5" font-weight="800">✓ 测电压：并联（跨接两端）</text>
  <line x1="28" y1="62" x2="72" y2="62" stroke="#334155" stroke-width="2.2" />
  <rect x="72" y="52" width="68" height="20" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.8" />
  <text x="106" y="65" text-anchor="middle" fill="#0f172a" font-size="9" font-weight="800" font-family="monospace">被测电阻 R</text>
  <line x1="140" y1="62" x2="184" y2="62" stroke="#334155" stroke-width="2.2" />
  <!-- Voltmeter in parallel -->
  <path d="M 56 62 L 56 88 L 90 88 M 122 88 L 156 88 L 156 62" fill="none" stroke="#059669" stroke-width="2" />
  <circle cx="106" cy="88" r="13" fill="#065f46" />
  <text x="106" y="92" text-anchor="middle" fill="#ffffff" font-size="10.5" font-weight="800">V</text>
  <text x="106" y="44" text-anchor="middle" fill="#047857" font-size="8.2" font-family="monospace">内阻 ≈ 10 MΩ（不短路）</text>

  <!-- Right: Current Series (Safe) -->
  <rect x="216" y="8" width="196" height="100" rx="9" fill="#eff6ff" stroke="#38bdf8" stroke-width="1.5" />
  <text x="314" y="24" text-anchor="middle" fill="#1e40af" font-size="9.5" font-weight="800">✓ 测电流：断开线路串联</text>
  <line x1="232" y1="66" x2="258" y2="66" stroke="#334155" stroke-width="2.2" />
  <circle cx="274" cy="66" r="14" fill="#1d4ed8" />
  <text x="274" y="70" text-anchor="middle" fill="#ffffff" font-size="10.5" font-weight="800">A</text>
  <line x1="288" y1="66" x2="316" y2="66" stroke="#0284c7" stroke-width="2.2" />
  <rect x="316" y="56" width="60" height="20" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.8" />
  <text x="346" y="69" text-anchor="middle" fill="#0f172a" font-size="9" font-weight="800" font-family="monospace">电阻 R</text>
  <line x1="376" y1="66" x2="398" y2="66" stroke="#334155" stroke-width="2.2" />
  <text x="314" y="44" text-anchor="middle" fill="#1d4ed8" font-size="8.2" font-family="monospace">内阻 ≈ 0.1 Ω（严禁并联！）</text>
  <text x="314" y="96" text-anchor="middle" fill="#be123c" font-size="8.2" font-weight="700">并联电流档 = 直接短路烧保险丝</text>
</svg>`;

/* ------------------------------------------------------------- quiz diagrams (added) */

/** Q1: three ways to put a resistor in, each on a small piece of board (columns 9–15). */
function placementsSvg(): string {
  const panel = (x0: number, key: string, from: [string, number], to: [string, number], label: string) => {
    const rowY = (r: string) => ('abcde'.includes(r) ? 30 + 'abcde'.indexOf(r) * 10 : 92 + 'fghij'.indexOf(r) * 10);
    const colX = (c: number) => x0 + 14 + (c - 9) * 17;
    let holes = '';
    for (let c = 9; c <= 15; c++) for (const r of 'abcdefghij') holes += `<rect x="${colX(c) - 2.5}" y="${rowY(r) - 2.5}" width="5" height="5" rx="1" fill="#475569" />`;
    const [x1, y1, x2, y2] = [colX(from[1]), rowY(from[0]), colX(to[1]), rowY(to[0])];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const horiz = y1 === y2;
    const body = horiz
      ? `<rect x="${mx - 16}" y="${my - 5}" width="32" height="10" rx="4" fill="#f5deb3" stroke="#b45309" stroke-width="1.2" />`
      : `<rect x="${mx - 5}" y="${my - 12}" width="10" height="24" rx="4" fill="#f5deb3" stroke="#b45309" stroke-width="1.2" />`;
    return `<g>
    <rect x="${x0}" y="14" width="128" height="140" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
    <text x="${x0 + 8}" y="10" fill="#0f172a" font-size="9.5" font-weight="800">${key}) ${label}</text>
    <rect x="${x0 + 6}" y="76" width="116" height="10" rx="2" fill="#e2e8f0" />
    <text x="${x0 + 4}" y="33" fill="#64748b" font-size="7" font-family="monospace">a</text>
    <text x="${x0 + 4}" y="73" fill="#64748b" font-size="7" font-family="monospace">e</text>
    <text x="${x0 + 4}" y="95" fill="#64748b" font-size="7" font-family="monospace">f</text>
    <text x="${x0 + 4}" y="135" fill="#64748b" font-size="7" font-family="monospace">j</text>
    <text x="${colX(10)}" y="147" text-anchor="middle" fill="#64748b" font-size="7" font-family="monospace">10</text>
    <text x="${colX(15)}" y="147" text-anchor="middle" fill="#64748b" font-size="7" font-family="monospace">15</text>
    ${holes}
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="1.8" stroke-linecap="round" />
    <circle cx="${x1}" cy="${y1}" r="3.2" fill="#0f766e" /><circle cx="${x2}" cy="${y2}" r="3.2" fill="#0f766e" />
    ${body}
  </g>`;
  };
  return `<svg viewBox="0 0 420 160" class="w-full h-auto" aria-label="三种电阻插法：a10–e10、e10–f10、a10–a15">
  ${panel(6, 'a', ['a', 10], ['e', 10], 'a10 – e10')}
  ${panel(146, 'b', ['e', 10], ['f', 10], 'e10 – f10')}
  ${panel(286, 'c', ['a', 10], ['a', 15], 'a10 – a15')}
</svg>`;
}

/** Q2: the meter on the mA range, (a) across the resistor, (b) in the break of the loop. */
const SVG_Q2 = `<svg viewBox="0 0 420 128" class="w-full h-auto" aria-label="电流档两种接法：跨接在电阻两端，或串进断口">
  <g>
    <rect x="8" y="8" width="196" height="112" rx="9" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4" />
    <text x="20" y="24" fill="#0f172a" font-size="9.5" font-weight="800">a) 表笔跨接在电阻两端</text>
    <path d="M 40 46 L 40 92 M 40 46 L 84 46 M 132 46 L 172 46 L 172 92 L 40 92" fill="none" stroke="#334155" stroke-width="2" />
    <rect x="30" y="58" width="20" height="22" rx="3" fill="#fff" stroke="#334155" stroke-width="1.6" />
    <text x="40" y="73" text-anchor="middle" fill="#0f172a" font-size="8" font-weight="800">9V</text>
    <rect x="84" y="37" width="48" height="18" rx="4" fill="#fff" stroke="#334155" stroke-width="1.6" />
    <text x="108" y="50" text-anchor="middle" fill="#0f172a" font-size="8.5" font-weight="800" font-family="monospace">1 kΩ</text>
    <path d="M 74 46 L 74 72 L 94 72 M 122 72 L 142 72 L 142 46" fill="none" stroke="#475569" stroke-width="1.6" stroke-dasharray="3 2" />
    <circle cx="108" cy="72" r="12" fill="#334155" />
    <text x="108" y="76" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="800">mA</text>
    <circle cx="74" cy="46" r="2.6" fill="#b91c1c" /><circle cx="142" cy="46" r="2.6" fill="#0f172a" />
  </g>
  <g>
    <rect x="216" y="8" width="196" height="112" rx="9" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4" />
    <text x="228" y="24" fill="#0f172a" font-size="9.5" font-weight="800">b) 拔开电阻一端，串进断口</text>
    <path d="M 248 46 L 248 92 M 248 46 L 270 46 M 302 46 L 324 46 M 372 46 L 388 46 L 388 92 L 248 92" fill="none" stroke="#334155" stroke-width="2" />
    <rect x="238" y="58" width="20" height="22" rx="3" fill="#fff" stroke="#334155" stroke-width="1.6" />
    <text x="248" y="73" text-anchor="middle" fill="#0f172a" font-size="8" font-weight="800">9V</text>
    <circle cx="286" cy="46" r="12" fill="#334155" />
    <text x="286" y="50" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="800">mA</text>
    <rect x="324" y="37" width="48" height="18" rx="4" fill="#fff" stroke="#334155" stroke-width="1.6" />
    <text x="348" y="50" text-anchor="middle" fill="#0f172a" font-size="8.5" font-weight="800" font-family="monospace">1 kΩ</text>
    <text x="318" y="110" text-anchor="middle" fill="#475569" font-size="8">断口</text>
  </g>
</svg>`;

/* ------------------------------------------------------------- the lesson */

export const W1_L0: StageLesson = {
  format: 'lesson-stage/2',
  lesson_meta: {
    lesson_id: 'W1-L0',
    world: 'World 1 · 电学公理与基本定律',
    title: '实验箱与万用表极简前置卡',
    subtitle: '5 分钟看懂面包板内部铜片、色环电阻与万用表防烧铁律',
    lesson_type: 'A',
    lesson_type_label: 'Type A (轻量工具前置卡)',
    estimated_minutes: 5,
    textbook_primary: { book: 'Introductory Circuit Analysis, 14th Edition (Boylestad)', sections: ['Ch. 3 电阻色环与测量仪表常识'] },
    textbook_supplement: 'Breadboard Lab 3D 实验箱操作规范（不引入长篇 DIY）',
    prerequisites: [],
    next_lesson: 'W1-L1',
    next_lesson_title: '电荷、电流、电压与参考方向',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: 'bb_xray',
        label: '01 3D 面包板导通透视',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption: '830 孔标准面包板：拖动 X-Ray 滑块掀开塑料外壳，看底部的金属弹性夹片。',
      },
      {
        id: 'dmm_probe',
        label: '02 万用表表笔接法台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '9 V 电池 + 1 kΩ 电阻：切换「测电压」「测电流」和错误示范，看表里流过多少电流。',
      },
    ],
    hover_map: {
      rail_pos: { label: '红色 + 电源轨', desc: '整排横向连通，把电源正极送到板子各处' },
      rail_neg: { label: '蓝色 − 地线轨', desc: '整排横向连通，把地线送到板子各处' },
      col_strip_a10: { label: '第 10 列 a10–e10', desc: '中间区域同一列 5 孔纵向连通 = 同一个节点' },
      center_trench: { label: '中央凹槽', desc: '上下两半完全绝缘，DIP-8 芯片（如 LM358）骑跨在这里' },
      resistor_10k: { label: '10 kΩ 电阻', desc: '棕-黑-橙-金 = 10 × 10³ Ω ± 5%' },
      dmm_v_mode: { label: '电压档 V', desc: '内部电阻 ≈ 10 MΩ，并联安全' },
      dmm_a_mode: { label: '电流档 A / mA', desc: '内部电阻 ≈ 0.1 Ω，必须串联' },
    },
  },
  right_acts: [
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '掀开面包板：隐藏在塑料壳下面的金属高速公路',
      sync: { layer: 'bb_xray', xray: 0.75, halo: ['col_strip_a10', 'center_trench'], camera: 'focus' },
      blocks: [
        {
          kind: 'p',
          text: '很多同学第一次拿到面包板，会把电阻的两条腿插在同一竖列（比如 `a10` 和 `b10`）里，结果通电后发现电路完全不工作——因为你把这颗电阻**直接短路了**。',
        },
        { kind: 'p', text: '看左侧已经半透明透视的面包板：塑料孔下面其实藏着两套方向完全垂直的金属铜片。你只需要死记三条铁律：' },
        {
          kind: 'ol',
          items: [
            '[[rail_pos,rail_neg|**上下电源轨（红/蓝线）**]]：**横向**整排连通，专门负责把电源正极和地线送到板子各处；',
            '[[col_strip_a10|**中间实验区（`a–e` 与 `f–j`）**]]：同一列里的 5 个孔**纵向**连通，同一行相邻列之间完全断开；',
            '[[center_trench|**中间凹槽（Center Trench）**]]：把上半部 `a–e` 和下半部 `f–j` 彻底隔开——以后插 LM358 这种双排芯片，必须骑在凹槽正中间。',
          ],
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '面包板内部金属铜片导通规律图',
    },
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '30 秒读懂四色环电阻（实验室最常用）',
      sync: { layer: 'bb_xray', xray: 0.35, halo: ['resistor_10k'], camera: 'resistor' },
      blocks: [
        { kind: 'p', text: '真实电阻身上没有印数字，而是画了 4 道彩色条纹。记法非常像科学计数法：' },
        {
          kind: 'ul',
          items: [
            String.raw`**第 1、2 环**：前两位有效数字（$d_1 d_2$）；`,
            String.raw`**第 3 环**：后面跟几个零，即倍率 $10^{m}$；`,
            String.raw`**第 4 环**：制造误差（金色代表 $\pm 5\%$）。`,
          ],
        },
        { kind: 'formula', title: '① 读数通式（General Formula）', tex: String.raw`R = (10\,d_1 + d_2) \times 10^{m}\ \Omega \quad (\pm \text{容差})` },
        {
          kind: 'calc',
          title: String.raw`② 代入实例（以运放课最常用的 $10\text{ k}\Omega$「棕-黑-橙-金」为例）`,
          steps: [
            { label: 'Step A · 查色环数字', text: String.raw`棕 = $1$，黑 = $0$，橙 = $3$（即 $10^3$），金 = $\pm 5\%$` },
            {
              label: 'Step B · 代入通式计算',
              tex: String.raw`R = (10 \times 1 + 0) \times 10^{3}\ \Omega = 10 \times 1000\ \Omega = \mathbf{10\text{ k}\Omega} \pm 5\%`,
            },
          ],
        },
        {
          kind: 'colorcode',
          title: '③ 色环速查卡（动手读一读）',
          intro: '上面只讲了「棕-黑-橙-金」一颗。下面是全部颜色的对照表：在读数器里换几种色环试试，左侧 3D 面包板上那颗电阻会跟着换颜色。',
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '四色环 10k 电阻读法示意图',
    },
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '万用表防烧铁律：电压并联、电流串联',
      sync: { layer: 'dmm_probe', dmm: 'voltage', halo: ['dmm_v_mode', 'dmm_a_mode'] },
      blocks: [
        { kind: 'p', text: '大一实验室里 90% 被烧掉的万用表保险丝，都是因为同一件事：**把电流档像电压档一样直接并联在了元件两端**。' },
        { kind: 'p', text: '原因其实用下一章的欧姆定律一眼就能看穿：' },
        {
          kind: 'ul',
          items: [
            String.raw`[[dmm_v_mode|**电压档（V）**]]：内部电阻高达 $R_V \approx 10\text{ M}\Omega$（像一堵墙），**并联**在元件两端只偷走不到 $1\ \mu\text{A}$ 的微弱电流，不会打扰原电路；`,
            String.raw`[[dmm_a_mode|**电流档（A / mA）**]]：内部电阻低至 $R_A \approx 0.1\ \Omega$（相当于一根导线！），必须**断开电路把表串进去**让电流流过表身。如果你把它直接并联在 9 V 电池两端，瞬间短路电流高达 $9\text{ V} / 0.1\ \Omega = 90\text{ A}$，保险丝当场熔断！`,
          ],
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '万用表测电压并联与测电流串联对比图',
    },
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '2 道入场安全检验（通关即可进入 W1-L1）',
      sync: { layer: 'dmm_probe', dmm: 'current' },
      blocks: [],
      quiz: [
        {
          id: 'w1l0_q1',
          question: '你想把一颗 10 kΩ 电阻插在面包板中间实验区，哪种插法会把电阻直接短路？',
          options: [
            { key: 'a', text: '两条引脚分别插在 a10 和 e10（同一竖列）', correct: true },
            { key: 'b', text: '两条引脚分别插在 e10 和 f10（跨过中央凹槽）', correct: false },
            { key: 'c', text: '两条引脚分别插在 a10 和 a15（跨列横插）', correct: false },
          ],
          feedback_correct: '答对了！中间实验区同一竖列的 a10–e10 底部是同一块铜片，把两条腿插在同一列等于用导线把电阻直接短接。',
          feedback_wrong: '再看一眼第 1 幕的透视图：a10–e10 属于同一块竖向铜片，两条腿插在同一列才会短路；跨凹槽（e10 到 f10）或跨列（a10 到 a15）都是绝缘分开的。',
          figure: placementsSvg(),
          sync: { layer: 'bb_xray', xray: 0.75, halo: ['col_strip_a10', 'center_trench'], camera: 'trench' },
        },
        {
          id: 'w1l0_q2',
          question: '把万用表拧到「直流电流档（mA）」后，想测 9 V 电池给 1 kΩ 电阻供的电流，正确接法是？',
          options: [
            { key: 'a', text: '红黑表笔直接跨接在 1 kΩ 电阻两端（并联）', correct: false },
            { key: 'b', text: '先拔开电阻一端，把万用表串进断口处让电流流过表身（串联）', correct: true },
          ],
          feedback_correct: '安全通关！记住「压并流串」四个字，你已经具备安全进入 World 1 正式电路课的全部实验常识。',
          feedback_wrong: '危险！电流档内阻几乎为 0 Ω，并联在元件两端会形成短路、瞬间烧毁万用表保险丝。测电流必须断开回路串联接入！',
          figure: SVG_Q2,
          sync: { layer: 'dmm_probe', dmm: 'current', halo: ['dmm_a_mode'] },
        },
      ],
    },
  ],
};
