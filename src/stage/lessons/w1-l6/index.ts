// W1-L6 · 基尔霍夫电压定律（KVL）与单回路求解 (lesson sheet: docs/lessons/W1-L6.md).
// The professor's text is reproduced from the sheet as written; [[id|…]] only links a term to the
// stage (the words are unchanged). Formulas are split into the ① origin / ② blue formula / ③ green
// calculation cards: the sheet's lead-in sentences of ② are the titles of its formula cards, its ③
// sentences the Step A / B / C … lines. The sheet's seven diagrams (sheetSvgs.ts) are shown in the
// page's light palette (light()); the guided example's per-step diagrams and the two quiz diagrams are
// added (blueprint rule: every step and question gets a local diagram), drawn in the same style. The
// sheet gives no hints and no blackboard lines for the guided example: they are written here from its
// own derivation. The "⚠️ 错路拦截：" prefix of the wrong-answer feedback is dropped (no emoji in the UI;
// the page already labels it 教授拦截). Act 7: the quiz always closes the act, so the 下节预告 text and
// its diagram (a figure block) come before the two questions.
//
// Stage ids: the sheet's hover map names each object twice (#elem-v1 / sync-v1 …); one id per object
// here, written with "_" (elem_v1 …), since [[id|…]] links take [a-z0-9_] ids.

import { lazy } from 'react';
import type { GuidedStep, QuizItem, StageLesson } from '../../types';
import { NO_FLIP, stageParams } from './params';
import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_ACT6, SHEET_ACT7, SHEET_MINI } from './sheetSvgs';

const ProfileLayer = lazy(() => import('./ProfileLayer'));
const InspectorLayer = lazy(() => import('./InspectorLayer'));

const L1 = 'layer_01_elevation_profile';
const L2 = 'layer_02_kvl_inspector';

/* ------------------------------------------------------------- diagrams */

/** The sheet's dark diagram palette → the light palette of the page (same hues, darker for contrast on white). */
const LIGHT: Record<string, string> = {
  '#0f172a': '#f8fafc', // panel background
  '#e2e8f0': '#0f172a', // titles
  '#cbd5e1': '#475569', // labels
  '#94a3b8': '#64748b', // wires, notes
  '#64748b': '#94a3b8', // axis
  '#1e293b': '#ffffff', // element fill
  '#334155': '#cbd5e1', // dividers
  '#10b981': '#059669',
  '#38bdf8': '#0284c7',
  '#a855f7': '#9333ea',
  '#ef4444': '#dc2626',
  '#f59e0b': '#d97706',
  '#eab308': '#a16207',
  '#fca5a5': '#b91c1c',
  '#6ee7b7': '#047857',
  '#064e3b': '#ecfdf5',
  '#7dd3fc': '#0369a1',
  '#0c4a6e': '#f0f9ff',
  '#d8b4fe': '#7e22ce',
  '#3b0764': '#faf5ff',
};
const light = (svg: string) =>
  svg.replace(/#[0-9a-f]{6}\b/gi, (c) => LIGHT[c.toLowerCase()] ?? c).replace(/style=(["'])background:#f8fafc;/, 'style=$1background:#f8fafc;border:1px solid #e2e8f0;');

const SVG_ACT1 = light(SHEET_ACT1);
const SVG_ACT2 = light(SHEET_ACT2);
const SVG_ACT3 = light(SHEET_ACT3);
const SVG_ACT4 = light(SHEET_ACT4);
const SVG_ACT5 = light(SHEET_ACT5);
const SVG_ACT6 = light(SHEET_ACT6);
const SVG_ACT7 = light(SHEET_ACT7);
// layout fix: the sheet's 20V / 5V labels sit on the source circles; the view box is widened and they move out
const SVG_PROBLEM = light(SHEET_MINI)
  .replace("<svg viewBox='0 0 260 150'", `<svg aria-label="双电压源对抗 + 反向压降标注的单回路" viewBox='-14 0 288 150'`)
  .replace("<text x='11' y='78'", "<text x='-10' y='78'")
  .replace("<text x='249' y='78'", "<text x='262' y='78'");

/** The guided example's diagram with an overlay for one step (added; same geometry as the sheet's mini_svg). */
const miniStep = (overlay: string, label: string) => SVG_PROBLEM.replace(/aria-label="[^"]*"/, `aria-label="${label}"`).replace('</svg>', `${overlay}</svg>`);

/** an amber arrowhead on a wire, pointing along the clockwise walk */
const walkArrow = (x: number, y: number, deg: number) => `<path d='M -5 -4 L 4 0 L -5 4 Z' fill='#d97706' transform='translate(${x} ${y}) rotate(${deg})'/>`;

const MINI_STEP1 = miniStep(
  walkArrow(35, 112, -90) +
    walkArrow(35, 40, -90) +
    walkArrow(60, 25, 0) +
    walkArrow(175, 25, 0) +
    walkArrow(225, 40, 90) +
    walkArrow(225, 112, 90) +
    walkArrow(200, 125, 180) +
    walkArrow(80, 125, 180) +
    `<text x='130' y='98' fill='#64748b' font-size='9' text-anchor='middle'>沿箭头走一圈：每个元件先碰到哪个符号？</text>`,
  '第 1 步：顺时针巡检时每个元件最先碰到哪个符号',
);
const MINI_STEP2 = miniStep(
  `<rect x='116' y='108' width='60' height='40' rx='5' fill='none' stroke='#9333ea' stroke-width='1.2' stroke-dasharray='3 3'/>` +
    `<path d='M 212 116 L 182 116' stroke='#0284c7' stroke-width='2'/><path d='M 178 116 L 186 112 L 186 120 Z' fill='#0284c7'/>` +
    `<text x='196' y='110' fill='#0284c7' font-size='9' font-weight='700' text-anchor='middle'>i</text>` +
    `<text x='130' y='98' fill='#64748b' font-size='9' text-anchor='middle'>i 在底部从右向左，先进 R₂ 的哪一端？</text>`,
  '第 2 步：电流 i 从哪一端流入 R₂',
);
const MINI_STEP3 = miniStep(
  `<text x='130' y='98' fill='#0f172a' font-size='10' font-weight='700' text-anchor='middle'>i = 3 A：v₁ = ?　v₂ = ?</text>`,
  '第 3 步：已知 i = 3 A，求 v₁ 与 v₂',
);

/** A single-loop question diagram in the style of the act 5 figure (added for the quiz). */
function loopSvg(o: { title: string; left: [string, string, string]; right: [string, string, string]; top: [string, string, string]; bottom: [string, string, string] }) {
  const src = (x: number, [plusTop, label, tone]: [string, string, string], lx: number, anchor: string) => `
  <circle cx="${x}" cy="120" r="24" fill="#ffffff" stroke="${tone}" stroke-width="2.2"/>
  <text x="${x}" y="114" fill="${tone}" font-size="15" font-weight="700" text-anchor="middle">${plusTop === '+' ? '+' : '−'}</text>
  <text x="${x}" y="136" fill="${tone}" font-size="15" font-weight="700" text-anchor="middle">${plusTop === '+' ? '−' : '+'}</text>
  <text x="${lx}" y="124" fill="${tone}" font-size="11" font-weight="700" text-anchor="${anchor}">${label}</text>`;
  // signs at the zigzag ends, the label on the inner side of the wire
  const res = (top: boolean, [l, label, r]: [string, string, string], tone: string) => `
  <text x="${top ? 152 : 172}" y="${top ? 47 : 216}" fill="${tone}" font-size="13" font-weight="700">${l}</text>
  <text x="${top ? 192 : 213}" y="${top ? 92 : 166}" fill="${tone}" font-size="11.5" font-weight="700" text-anchor="middle">${label}</text>
  <text x="${top ? 228 : 249}" y="${top ? 47 : 216}" fill="${tone}" font-size="13" font-weight="700">${r}</text>`;
  return `<svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;" aria-label="${o.title.replace(/<[^>]+>/g, '')}">
  <text x="16" y="24" fill="#0f172a" font-size="13" font-weight="700">${o.title}</text>
  <g stroke="#64748b" stroke-width="2" fill="none">
    <path d="M 75 188 L 75 144 M 75 96 L 75 60 L 160 60"/>
    <path d="M 160 60 L 168 48 L 180 72 L 192 48 L 204 72 L 216 48 L 224 60 L 345 60 L 345 96"/>
    <path d="M 345 144 L 345 188 L 245 188"/>
    <path d="M 245 188 L 237 200 L 225 176 L 213 200 L 201 176 L 189 200 L 181 188 L 75 188"/>
  </g>
  ${src(75, o.left, 34, 'middle')}
  ${src(345, o.right, 392, 'middle')}
  ${res(true, o.top, '#0284c7')}
  ${res(false, o.bottom, '#9333ea')}
  <text x="210" y="126" fill="#d97706" font-size="12" font-weight="700" text-anchor="middle">↻ 顺时针巡检</text>
</svg>`;
}

const SVG_Q1 = loopSvg({
  title: 'Q1 · 两电源顺接助推，求下支路标注电压 vₓ',
  left: ['+', 'V₁=15V', '#059669'],
  right: ['−', 'V₂=6V', '#dc2626'],
  top: ['+', 'v₁ = 4V', '−'],
  bottom: ['+', 'vₓ = ?', '−'],
});
const SVG_Q2 = loopSvg({
  title: 'Q2 · 两电源对抗，求顺时针电流 i 与 v<tspan dy="3" font-size="0.75em">R2</tspan>',
  left: ['+', 'V₁=30V', '#059669'],
  right: ['+', 'V₂=10V', '#dc2626'],
  top: [' ', 'R₁ = 4Ω', ' '],
  bottom: ['−', 'v<tspan dy="3" font-size="0.75em">R2</tspan><tspan dy="-3">（R₂ = 6Ω）</tspan>', '+'],
});

/* ------------------------------------------------------------- guided example (act 5) */

const STEPS: GuidedStep[] = [
  {
    title: 'Step 1 · 沿顺时针方向列出用 $v_1$、$v_2$ 表示的 KVL 原始方程',
    mini_svg: MINI_STEP1,
    question: '从左下角出发按顺时针（CW）走一圈，严守“先碰到的符号就写什么号”，下列哪一条是正确的 KVL 方程？',
    hint: String.raw`从左下角 $D$ 出发向上穿过 $20\text{ V}$ 电源：先碰到它的哪一端？右支路向下走时，$5\text{ V}$ 电源上方是 $+$ 还是 $-$？底部从右往左走时，最先碰到 $v_2$ 标注的哪一端？`,
    options: [
      {
        text: '$-20 + v_1 + 5 - v_2 = 0$',
        correct: true,
        feedback: '精准无误！左支路向上先碰 20V 的「−」，上支路向右先碰 $v_1$ 的「+」，右支路向下先碰 5V 的「+」，下支路向左先碰 $v_2$ 的「−」。',
      },
      {
        text: '$-20 + v_1 + 5 + v_2 = 0$',
        correct: false,
        feedback: '你把下支路 $v_2$ 的极性看反了！顺时针经过底部支路时是从右往左走，最先碰到的是 $v_2$ 右侧的「−」号，因此这一项必须是 $-v_2$。',
      },
      {
        text: '$-20 + v_1 - 5 - v_2 = 0$',
        correct: false,
        feedback: '右侧 5V 电源的「+」端在上方！顺时针向下穿过右支路时，你最先碰到的是「+」号，所以应该写 $+5$，而不是 $-5$。',
      },
    ],
    board: [String.raw`-V_1 + v_1 + V_2 - v_2 = 0`, String.raw`-20 + v_1 + 5 - v_2 = 0`],
    halo: ['elem_v1', 'elem_r1', 'elem_v2', 'elem_r2'],
    params: stageParams({ l6_mode: 'loop', l6_dir: 'cw', l6_walk: 0 }),
  },
  {
    title: 'Step 2 · 结合欧姆定律（注意 PSC 符号）求出顺时针回路电流 $i$',
    mini_svg: MINI_STEP2,
    question: '顺时针电流 $i$ 从左向右流过 $R_1 = 2\\ \\Omega$，从右向左流过 $R_2 = 3\\ \\Omega$。请先写出 $v_1$、$v_2$ 与 $i$ 的关系，代入第 1 步的 KVL 方程求电流 $i$：',
    hint: String.raw`看电流从电阻的哪一端流入：从「+」端流入写 $v = +iR$，从「−」端流入写 $v = -iR$。再看两个电源：正极都朝上，在回路里是相加还是相减？`,
    options: [
      {
        text: String.raw`$v_1 = 2i$，$v_2 = -3i$，代入得 $i = 3\text{ A}$`,
        correct: true,
        feedback: String.raw`太稳了！因为 $i$ 从 $R_2$ 的「−」端流入，违反被动符号约定，必须写 $v_2 = -3i$；代入 $-20 + 2i + 5 - (-3i) = 0$，负负得正变成 $-15 + 5i = 0$，解得 $i = 3\text{ A}$！`,
      },
      {
        text: String.raw`$v_1 = 2i$，$v_2 = +3i$，代入得 $i = -15\text{ A}$`,
        correct: false,
        feedback: String.raw`经典陷阱！电流 $i$ 在底部是从右向左流，先撞进 $v_2$ 的「−」端，因此不能写 $v_2 = +3i$，必须加负号写成 $v_2 = -3i$（否则就会出现 $2i - 3i = -i$ 的物理荒谬：两颗电阻怎么可能互相抵消？）。`,
      },
      {
        text: String.raw`$v_1 = 2i$，$v_2 = -3i$，代入得 $i = 5\text{ A}$`,
        correct: false,
        feedback: String.raw`你把两个电压源算成相加（$20+5=25$）了！注意它们正极都朝上，在回路中是“顶牛”相减的（$20 - 5 = 15\text{ V}$）。`,
      },
    ],
    board: [String.raw`v_1 = +iR_1 = 2i`, String.raw`v_2 = -iR_2 = -3i`, String.raw`-20 + 2i + 5 - (-3i) = 0`, String.raw`\implies -15 + 5i = 0 \implies i = 3\text{ A}`],
    halo: ['elem_r2', 'eq_term_r2'],
    params: stageParams({ l6_mode: 'loop', l6_dir: 'cw', l6_walk: 4 }),
  },
  {
    title: 'Step 3 · 回代电流 $i$，求各电阻标注电压 $v_1$ 和 $v_2$',
    mini_svg: MINI_STEP3,
    question: String.raw`已知顺时针电流 $i = 3\text{ A}$，则图纸上标注的 $v_1$ 和 $v_2$ 分别是多少？`,
    hint: String.raw`把 $i = 3\text{ A}$ 代回第 2 步写下的 $v_1 = 2i$ 与 $v_2 = -3i$，符号一个都不能丢；再代回第 1 步的方程验算是否等于 $0$。`,
    options: [
      {
        text: String.raw`$v_1 = +6\text{ V}$，$v_2 = -9\text{ V}$`,
        correct: true,
        feedback: String.raw`满分通关！$v_2 = -9\text{ V}$ 中的负号具有明确的物理意义：说明 $R_2$ 的实际高电位在右侧（比左侧高 $9\text{ V}$），与图纸预设的「左+右−」正好相反。验算 KVL：$-20 + 6 + 5 - (-9) = 0\text{ V}$！`,
      },
      {
        text: String.raw`$v_1 = +6\text{ V}$，$v_2 = +9\text{ V}$`,
        correct: false,
        feedback: String.raw`你算出了压降大小 $9\text{ V}$，却丢掉了 $v_2$ 的负号！把 $+9\text{ V}$ 代回第 1 步方程 $-20 + 6 + 5 - 9 = -18 \neq 0$，KVL 立即报警。记住：电压是有方向的代数量！`,
      },
    ],
    board: [
      String.raw`v_1 = (3\text{ A})(2\ \Omega) = +6\text{ V}`,
      String.raw`v_2 = -(3\text{ A})(3\ \Omega) = -9\text{ V}`,
      String.raw`-20 + 6 + 5 - (-9) = 0\text{ V}\ \checkmark`,
    ],
    halo: ['elem_r1', 'elem_r2'],
    params: stageParams({ l6_mode: 'loop', l6_dir: 'cw', l6_walk: 4 }),
  },
];

/* ------------------------------------------------------------- quiz (act 7) */

const QUIZ: QuizItem[] = [
  {
    id: 'w1l6_q1',
    question:
      '某单回路按顺时针方向依次包含四个元件：① 左支路电压源 $V_1 = 15\\text{ V}$（上+下−）；② 上支路电阻压降 $v_1 = 4\\text{ V}$（左+右−）；③ 右支路电压源 $V_2 = 6\\text{ V}$（上−下+，注意极性与 $V_1$ 顺接助推）；④ 下支路电阻标注电压 $v_x$（左+右−）。则 $v_x$ 等于多少？',
    options: [
      { key: 'A', text: '$+17\\text{ V}$', correct: false, feedback: '漏掉了下支路顺时针向左走时先碰到「−」号的条件，误写成了 $+v_x$。' },
      {
        key: 'B',
        text: '$-17\\text{ V}$',
        correct: true,
        feedback: String.raw`按顺时针“先碰到的符号就写什么号”列 KVL：左支路向上先碰「−」得 $-15$；上支路向右先碰「+」得 $+4$；右支路向下先碰「−」得 $-6$；下支路向左先碰「−」得 $-v_x$。因此 $-15 + 4 - 6 - v_x = 0 \Rightarrow -17 - v_x = 0 \Rightarrow v_x = -17\text{ V}$。两电源串联同向助推共提供 $21\text{ V}$，$v_1$ 消耗 $4\text{ V}$，剩余 $17\text{ V}$ 跌落在下支路电阻上，且与 $v_x$ 标注方向相反。`,
      },
      { key: 'C', text: '$+5\\text{ V}$', correct: false, feedback: '把右侧顺接助推的 6 V 电源误当成反向对抗电源（$+6$），且漏掉 $v_x$ 负号。' },
      { key: 'D', text: '$-5\\text{ V}$', correct: false, feedback: '把右侧顺接助推的 6 V 电源误当成反向对抗电源（写成 $+6$）。' },
    ],
    feedback_correct: '答对了！',
    feedback_wrong: '再按顺时针“先碰到的符号”逐项检查一遍。',
    figure: SVG_Q1,
    sync: {
      layer: L2,
      halo: ['elem_v2', 'elem_r2'],
      params: stageParams({ l6_mode: 'loop', l6_walk: 0, l6_v1: 15, l6_v2: 6, l6_flip: { ...NO_FLIP, v2: true } }),
    },
  },
  {
    id: 'w1l6_q2',
    question:
      '在单回路电路中，左侧电压源 $V_1 = 30\\text{ V}$（上+下−）与右侧电压源 $V_2 = 10\\text{ V}$（上+下−）形成对抗，上支路串联 $R_1 = 4\\ \\Omega$，下支路串联 $R_2 = 6\\ \\Omega$（其压降 $v_{R2}$ 标为右+左−，符合顺时针电流被动符号约定）。求顺时针电流 $i$ 与压降 $v_{R2}$：',
    options: [
      {
        key: 'A',
        text: String.raw`$i = 4\text{ A}$，$v_{R2} = 24\text{ V}$`,
        correct: false,
        feedback: String.raw`误将对抗电源 $V_2$ 当作助推电源相加（$30 + 10 = 40\text{ V}$），算出 $40/10 = 4\text{ A}$。`,
      },
      {
        key: 'B',
        text: String.raw`$i = 2\text{ A}$，$v_{R2} = 12\text{ V}$`,
        correct: true,
        feedback: String.raw`沿顺时针列 KVL 并代入欧姆定律：$-30 + 4i + 10 + 6i = 0 \Rightarrow 10i = 20 \Rightarrow i = 2\text{ A}$。由于 $v_{R2}$ 标为右+左−，顺时针电流从右向左正好从「+」端进入，满足 PSC，故 $v_{R2} = i \cdot R_2 = 2\text{ A} \times 6\ \Omega = +12\text{ V}$。验算 KVL：$-30 + 8 + 10 + 12 = 0\text{ V}$。`,
      },
      { key: 'C', text: String.raw`$i = 2\text{ A}$，$v_{R2} = -12\text{ V}$`, correct: false, feedback: String.raw`电流计算正确，但错误地给符合 PSC 的 $v_{R2}$ 加了负号。` },
      {
        key: 'D',
        text: String.raw`$i = 3\text{ A}$，$v_{R2} = 18\text{ V}$`,
        correct: false,
        feedback: String.raw`忽略了右侧 $10\text{ V}$ 电源的存在，直接用 $30/10 = 3\text{ A}$ 计算。`,
      },
    ],
    feedback_correct: '答对了！',
    feedback_wrong: '先列 KVL，再看电流从 $v_{R2}$ 的哪一端流入。',
    figure: SVG_Q2,
    sync: {
      layer: L2,
      halo: ['elem_v1', 'elem_v2', 'elem_r2'],
      params: stageParams({ l6_mode: 'loop', l6_walk: 0, l6_v1: 30, l6_v2: 10, l6_r1: 4, l6_r2: 6, l6_flip: { ...NO_FLIP, r2: true } }),
    },
  },
];

/* ------------------------------------------------------------- the lesson */

const W1_L6: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: ProfileLayer, [L2]: InspectorLayer },
  lesson_meta: {
    lesson_id: 'W1-L6',
    world: 'World 1 · 电学公理与基本定律',
    title: '基尔霍夫电压定律（KVL）与单回路求解',
    subtitle: '从环路海拔守恒到“先碰到的符号就写什么号”的系统化回路分析',
    lesson_type: 'B',
    lesson_type_label: 'Type B（公式与分析法课）',
    estimated_minutes: 35,
    textbook_primary: { book: 'Alexander & Sadiku, Fundamentals of Electric Circuits (2026 Release)', sections: ["Ch. 2.4 Kirchhoff's Voltage Law", 'Examples 2.5–2.6'] },
    textbook_supplement: 'Boylestad, Introductory Circuit Analysis, Ch. 5（环路爬坡电位/海拔剖面类比）',
    prerequisites: ['W1-L3（欧姆定律与被动符号约定 PSC）', 'W1-L5（基尔霍夫电流定律 KCL 与节点分析初探）'],
    next_lesson: 'W1-L7',
    next_lesson_title: '串联分压与并联分流',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 环路电位爬坡/跌落剖面图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '顺时针巡检 D → A → B → C → D：每跨过一个元件，右侧电位柱升起或跌落，回到 D 时精准归零；切换参考地，所有柱子整体平移，台阶落差不变。',
      },
      {
        id: L2,
        label: '02 单回路 KVL 顺时针巡检台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '选顺时针或逆时针巡检：先碰到的符号闪烁并飞进方程槽；⇄ 翻转元件极性；另一页是串联电压源合并与违禁并联实验。',
      },
    ],
    hover_map: {
      kvl_probe_path: { label: '闭合巡检光点与路径', desc: '绕闭合回路一周，电位变化的代数和为 0' },
      elem_v1: { label: '主电压源 V₁', desc: '顺时针从「−」进、「+」出：压升（第 5 幕为 20 V）' },
      elem_v2: { label: '反向电压源 V₂', desc: '正极朝上与 V₁ 顶牛：顺时针先碰「+」（第 5 幕为 5 V）' },
      elem_r1: { label: '上支路电阻 R₁ 与压降 v₁', desc: 'v₁ 左+右−，电流从「+」端流入：v₁ = +iR₁' },
      elem_r2: { label: '下支路电阻 R₂ 与反向标注 v₂', desc: 'v₂ 左+右−，电流从「−」端流入：v₂ = −iR₂' },
      bar_node_a: { label: '节点 A 电位柱', desc: '以 D 为地：跨过 V₁ 爬升到 +20 V（第 5 幕）' },
      bar_node_b: { label: '节点 B 电位柱', desc: '跨过 R₁ 跌落 6 V：20 − 6 = +14 V（第 5 幕）' },
      bar_node_c: { label: '节点 C 电位柱', desc: '跨过 V₂ 再跌落 5 V：14 − 5 = +9 V（第 5 幕）' },
      bar_node_d: { label: '参考地节点 D（0 V）', desc: '0 V 基准线；绕一圈回到这里，电位归零' },
      group_series_v: { label: '串联电压源合并组 Vab', desc: 'Vab = V₁ + V₂ − V₃：同向相加、反向相减' },
      group_illegal_par: { label: '违禁并联短路回路', desc: '−9 + 5 = −4 ≠ 0，理论环流 i → ∞' },
      eq_term_v1: { label: '方程拼装槽：V₁ 项', desc: '顺时针向上先碰 V₁ 的「−」：写 −V₁' },
      eq_term_r1: { label: '方程拼装槽：v₁ 项', desc: '顺时针向右先碰 v₁ 的「+」：写 +v₁' },
      eq_term_v2: { label: '方程拼装槽：V₂ 项', desc: '顺时针向下先碰 V₂ 的「+」：写 +V₂' },
      eq_term_r2: { label: '方程拼装槽：v₂ 项', desc: '顺时针向左先碰 v₂ 的「−」：写 −v₂' },
    },
  },
  right_acts: [
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '绕山走一圈回到原地——KVL 的物理根源与能量守恒',
      // the act-1 example on the stage: 12 V, loads 7 Ω and 5 Ω at 1 A (V2 = 0: a wire; v2 marked + where i enters)
      sync: {
        layer: L1,
        halo: ['kvl_probe_path'],
        params: stageParams({ l6_v1: 12, l6_v2: 0, l6_r1: 7, l6_r2: 5, l6_flip: { ...NO_FLIP, r2: true }, l6_step: 0 }),
      },
      blocks: [
        {
          kind: 'p',
          text: "上一节课（W1-L5）我们学了基尔霍夫电流定律（KCL），它本质上是**电荷守恒**——流进水管的每一滴水都必须流出来。今天我们来看它的孪生兄弟：**基尔霍夫电压定律（Kirchhoff's Voltage Law，简称 KVL）**。",
        },
        {
          kind: 'p',
          text: '请先忘掉复杂的电路符号，想象你周末去爬山。你从海拔 0 米的山脚大本营出发，先坐缆车一口气爬升了 1200 米（获得势能），接着沿着山脊步道向下走了 700 米，最后又沿着石阶向下走了 500 米，正好回到了出发时的山脚大本营。请问：你这一整圈走下来，**净海拔变化是多少？**',
        },
        { kind: 'p', text: '一定是 **0 米**！只要起点和终点是同一个点，无论你中间翻过几座山峰、下过几道山谷，**向上爬的总高度一定严格等于向下跌的总高度**。' },
        {
          kind: 'p',
          text: '在电路里，“海拔”就是**电位（Potential）**，“高度差”就是**电压（Voltage）**。单位正电荷在静电场中绕任意闭合回路走一圈回到起点，电场力对它做的净功必为零——这就是物理学中最铁板钉钉的**能量守恒定律**。[[elem_v1|电源]]就像缆车，把电荷从低电位“抬升”到高电位（压升）；[[elem_r1,elem_r2|电阻]]就像下山步道，电荷把能量以热能形式释放出去，电位随之“跌落”（压降）。点击左侧 Layer 01 的步进按钮，看着[[kvl_probe_path|巡检光点]]绕回路走一圈，你会亲眼看到右侧的[[bar_node_a,bar_node_b,bar_node_c,bar_node_d|海拔柱状图]]精准归零。',
        },
        { kind: 'p', text: '**三段式严谨推导：KVL 的数学表述**' },
        {
          kind: 'origin',
          title: '① 公理溯源（能量守恒与静电场保守性）',
          text: String.raw`由静电场保守场公理，电荷 $q$ 沿任意闭合路径 $L$ 移动一周，电场力所做总功 $W_{\text{closed}} = 0$。由于电功与电压满足 $W = qv$，对闭合回路中的 $M$ 个元件分段求和必有： $\displaystyle \sum_{m=1}^{M} W_m = q \sum_{m=1}^{M} v_m = 0 \quad (q \neq 0)$`,
        },
        { kind: 'formula', title: '② 纯符号通式（KVL 两种等价表达）· 消去非零电荷量 $q$，即得基尔霍夫电压定律（KVL）的标准代数和形式：', tex: String.raw`\sum_{m=1}^{M} v_m = 0` },
        {
          kind: 'formula',
          title: '若将回路中电位升高的项移至等号右侧，电位跌落的项留在左侧，则得到直觉最强的等价形式：',
          tex: String.raw`\sum v_{\text{drops}} = \sum v_{\text{rises}}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（单电源双负载爬坡验算）',
          steps: [
            {
              label: 'Step A',
              text: String.raw`以左侧电路为例：[[elem_v1|直流电源 $V_s = 12\text{ V}$]] 提供压升，两颗串联负载分别产生压降 [[elem_r1|$v_1 = 7\text{ V}$]] 与 [[elem_r2|$v_2 = 5\text{ V}$]]。沿顺时针绕行一周代入 KVL：`,
              tex: String.raw`-V_s + v_1 + v_2 = 0`,
            },
            { label: 'Step B', tex: String.raw`-12\text{ V} + 7\text{ V} + 5\text{ V} = 0\text{ V}` },
            {
              label: 'Step C',
              text: '移项验证“压降之和 = 压升之和”：',
              tex: String.raw`7\text{ V} + 5\text{ V} = 12\text{ V} \implies 12\text{ V} = 12\text{ V} \quad (\text{闭合回路能量守恒成立})`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '闭合回路与海拔电位剖面类比',
    },
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '永远不列错正负号的铁律——“先碰到的符号就写什么号”',
      sync: { layer: L2, halo: ['kvl_probe_path'], params: stageParams({ l6_mode: 'loop', l6_dir: 'cw', l6_walk: 4 }) },
      blocks: [
        {
          kind: 'p',
          text: '同学在做电路题时，最容易丢分的不是不会算加减法，而是**列 KVL 方程时把正负号写反**。其实，Sadiku 教材第 2.4 节早就给了一个极简、零失误的机械化操作规则，我把它浓缩成一句话，请你刻在脑子里：',
        },
        { kind: 'note', tone: 'tip', text: '**顺时针沿闭合回路走一圈，每跨过一个元件，先碰到的正负号是什么，就在方程里写什么号！**' },
        { kind: 'p', text: '让我们来慢动作回放一遍：' },
        {
          kind: 'ul',
          items: [
            '选定一个起点（比如左下角节点），固定按[[kvl_probe_path|**顺时针（CW）**]]方向沿导线前进。',
            String.raw`跨过元件 1 时，你从它的 **“$-$”端进入、“$+$”端离开** $\implies$ 先碰到的是负号，立刻写下 **$-v_1$**。`,
            String.raw`跨过元件 2 时，你从它的 **“$+$”端进入、“$-$”端离开** $\implies$ 先碰到的是正号，立刻写下 **$+v_2$**。`,
            '依此类推，绕回起点后，把所有项加起来令其等于 $0$。',
          ],
        },
        {
          kind: 'p',
          text: '有的同学会问：“教授，如果我偏要**逆时针（CCW）绕一圈呢？”没问题！你可以去左侧 Layer 02 拨动 [↺ 逆时针 CCW] 开关看看：逆时针时每个元件你先碰到的符号正好全部反过来，相当于把顺时针方程左右两边同时乘以 $-1$，解出来的未知数一模一样**。不过在工程与考试中，**强迫自己永远默认顺时针**，能把低级笔误率降到接近于零。',
        },
        { kind: 'p', text: '**三段式严谨推导：5 元件闭合回路的顺/逆时针等价性与未知压降求解**' },
        {
          kind: 'origin',
          title: '① 公理溯源（KVL 代数和规则与方向不变性）',
          text: String.raw`根据基尔霍夫电压定律 $\sum_{m=1}^{M} v_m = 0$，规定沿选定绕行方向，从元件“$+$”极性端进入记为正，从“$-$”极性端进入记为负。`,
        },
        { kind: 'formula', title: '② 纯符号通式（顺时针 vs. 逆时针）· 对下方含 5 个元件的闭合回路，从左下角出发按顺时针巡检：', tex: String.raw`-v_1 + v_2 + v_3 - v_4 + v_5 = 0` },
        { kind: 'formula', title: '若改按逆时针巡检，每项先碰到的极性均反转：', tex: String.raw`+v_1 - v_2 - v_3 + v_4 - v_5 = 0 \iff -(-v_1 + v_2 + v_3 - v_4 + v_5) = 0` },
        { kind: 'formula', title: '可见两种方向完全等价。由顺时针通式解出未知电压 $v_3$：', tex: String.raw`v_3 = v_1 - v_2 + v_4 - v_5` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A',
              text: String.raw`已知 $v_1 = 20\text{ V}$，$v_2 = 8\text{ V}$，$v_4 = 4\text{ V}$，$v_5 = 6\text{ V}$，代入顺时针 KVL 方程：`,
              tex: String.raw`-20 + 8 + v_3 - 4 + 6 = 0`,
            },
            { label: 'Step B', text: '合并常数项：', tex: String.raw`(-20 + 8 - 4 + 6) + v_3 = 0 \implies -10 + v_3 = 0` },
            { label: 'Step C', text: '解得：', tex: String.raw`v_3 = 10\text{ V}` },
          ],
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '顺时针巡检：“先碰到的符号就写什么号”（虚线圈为每个元件最先碰到的符号）',
    },
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '串联电压源的合并与“绝不能并联不同电压源”的死胡同',
      sync: { layer: L2, halo: ['group_series_v', 'group_illegal_par'], params: stageParams({ l6_mode: 'sources' }) },
      blocks: [
        {
          kind: 'p',
          text: '在实际电路和面包板供电中，我们经常把几节干电池首尾相接（[[group_series_v|**串联**]]）来获得更高的电压。那么串联后的总电压怎么算？不需要背诵新公式，直接用 KVL 扫一眼就一清二楚！',
        },
        {
          kind: 'p',
          text: '把若干个电压源串联在端口 $a$ 和 $b$ 之间，顺着从 $b$ 到 $a$ 的方向看：凡是“从 $-$ 进、从 $+$ 出”的电池都在帮你往高处抬电位（取正号）；凡是不小心装反了的电池（“从 $+$ 进、从 $-$ 出”）都在往下拉电位（取负号）。这就是手电筒里如果把 3 节 1.5 V 电池中的 1 节装反，总电压会从 4.5 V 暴跌到 1.5 V 的原因。',
        },
        { kind: 'p', text: '现在来思考一个工程界最致命的红线问题：**既然电压源可以串联，那我把一个 9 V 电池和一个 5 V 电池直接并联起来，端口电压会变成多少？7 V 吗？**' },
        {
          kind: 'p',
          text: String.raw`**绝对不行！** 一旦把两个不同电压值的理想电压源直接并联，它们之间就形成了一个只包含这两个电源的[[group_illegal_par|闭合小回路]]。对这个小回路列 KVL： $\displaystyle -V_1 + V_2 = 0 \implies V_1 = V_2$`,
        },
        {
          kind: 'p',
          text: String.raw`如果你硬把 $9\text{ V}$ 和 $5\text{ V}$ 并联，KVL 就会被迫写出 **$-9 + 5 = -4 \neq 0$** 的逻辑矛盾！在理想模型里，两根导线间没有电阻，环流 $i = \frac{9 - 5}{0} \to \infty$；在真实实验室里，9 V 电池会拼命向 5 V 电池倒灌大电流，轻则触发电源过流保护，重则电池发烫鼓包甚至起火。记住：**只有电压值完全相等的同极性理想电压源才能并联；不同电压源绝不允许直接并联！**（你可以点击左侧 Layer 02 的[[group_illegal_par|红色警报测试按钮]]亲自验证。）`,
        },
        { kind: 'p', text: '**三段式严谨推导：串联电压源等效合并**' },
        {
          kind: 'origin',
          title: '① 公理溯源（端口闭合回路 KVL）',
          text: String.raw`将[[group_series_v|串联的三个电压源 $V_1, V_2, V_3$]] 与等效端口电压 $V_{ab}$（规定 $a$ 端为 $+$，$b$ 端为 $-$）视为一个闭合回路，应用基尔霍夫电压定律 $\sum_{m=1}^{M} v_m = 0$。`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式（串联电压源代数和）· 设 $V_1, V_2$ 极性朝上（与 $V_{ab}$ 同向），$V_3$ 极性朝下（反接）。沿顺时针方向从 $b$ 经电源至 $a$ 再经端口 $V_{ab}$ 返回 $b$，按“先碰到的符号”列 KVL：`,
          tex: String.raw`-V_1 - V_2 + V_3 + V_{ab} = 0`,
        },
        { kind: 'formula', title: '移项即得串联电压源等效合并公式：', tex: String.raw`V_{ab} = V_1 + V_2 - V_3` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A',
              text: String.raw`取 $V_1 = 12\text{ V}$，$V_2 = 5\text{ V}$，$V_3 = 3\text{ V}$（反接），代入通式：`,
              tex: String.raw`V_{ab} = 12\text{ V} + 5\text{ V} - 3\text{ V} = 17\text{ V} - 3\text{ V} = 14\text{ V}`,
            },
            { label: 'Step B', text: String.raw`（若为 3 节 1.5 V 干电池装反 1 节，则 $V_{ab} = 1.5 + 1.5 - 1.5 = 1.5\text{ V}$。）` },
          ],
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '串联电压源合并 vs. 违禁并联短路矛盾',
    },
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '单回路电路求解的黄金三步法（KVL + 欧姆定律联立）',
      // the act-4 example on the stage: 18 V, 2 Ω and 4 Ω (V2 = 0: a wire; v2 marked by the PSC, + where i enters)
      sync: {
        layer: L1,
        halo: ['elem_r1', 'elem_r2'],
        params: stageParams({ l6_v1: 18, l6_v2: 0, l6_r1: 2, l6_r2: 4, l6_flip: { ...NO_FLIP, r2: true }, l6_step: 4 }),
      },
      blocks: [
        {
          kind: 'p',
          text: '前两幕我们解决的都是“已知部分电压求剩余电压”，但在真实的电路分析中，图纸上往往只告诉你**[[elem_v1|电源电压 $V_s$]] 和电阻阻值 [[elem_r1,elem_r2|$R_1, R_2$]]**，要你求出**回路电流 $i$ 和每颗电阻上的压降**。',
        },
        {
          kind: 'p',
          text: '由于单回路中所有元件串联在同一条路径上，根据上节课的 KCL，**流过每一个元件的电流都完全相同**，记为同一个未知量 $i$。要零失误解出任何单回路电路，请严格执行以下**黄金三步法**：',
        },
        {
          kind: 'ol',
          items: [
            '**定电流方向**：在回路中央画一个顺时针电流箭头，标为 $i$。',
            '**标电阻极性（被动符号约定 PSC）**：对每一颗电阻，凡是电流 $i$ **流入的那一端标 $+$，流出的那一端标 $-$**。只要遵守 PSC，欧姆定律就永远是清爽的正号 $v_k = +i R_k$。',
            '**顺时针列 KVL 并代入欧姆定律**：用“先碰到的符号就写什么号”列出电压方程，把每个 $v_k$ 替换成 $i R_k$，解出一元一次方程即可。',
          ],
        },
        { kind: 'p', text: '**三段式严谨推导：标准单回路电流与压降通解**' },
        {
          kind: 'origin',
          title: '① 公理溯源（KCL 串联等流 + KVL + 欧姆定律）',
          text: String.raw`由 KCL 可知串联单回路各处电流均为 $i$；由被动符号约定（PSC）下的欧姆定律有 [[elem_r1|$v_1 = iR_1$]]、[[elem_r2|$v_2 = iR_2$]]；由 KVL 有 $\sum_{m=1}^{M} v_m = 0$。`,
        },
        { kind: 'formula', title: '② 纯符号通式（联立求解）· 沿顺时针巡检单电源双电阻回路：', tex: String.raw`-V_s + v_1 + v_2 = 0` },
        { kind: 'formula', title: '代入 $v_1 = iR_1$ 与 $v_2 = iR_2$：', tex: String.raw`-V_s + iR_1 + iR_2 = 0 \implies i(R_1 + R_2) = V_s` },
        { kind: 'formula', title: '解得回路电流与各电阻压降的纯符号通式：', tex: String.raw`i = \frac{V_s}{R_1 + R_2}, \quad v_1 = iR_1, \quad v_2 = iR_2` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A',
              text: String.raw`设 $V_s = 18\text{ V}$，$R_1 = 2\ \Omega$，$R_2 = 4\ \Omega$：`,
              tex: String.raw`i = \frac{18\text{ V}}{2\ \Omega + 4\ \Omega} = \frac{18}{6} = 3\text{ A}`,
            },
            { label: 'Step B', text: '回代求各电阻压降：', tex: String.raw`v_1 = 3\text{ A} \times 2\ \Omega = 6\text{ V}, \quad v_2 = 3\text{ A} \times 4\ \Omega = 12\text{ V}` },
            { label: 'Step C', text: String.raw`验算 KVL：$-18 + 6 + 12 = 0\text{ V}$，完全吻合。` },
          ],
        },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '单回路求解黄金三步法（KVL + 欧姆定律）',
    },
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '当电压源“顶牛”遇上反向标注的电阻——苏格拉底式分步引导例题',
      sync: { layer: L2, halo: ['elem_v2', 'elem_r2'], params: stageParams({ l6_mode: 'loop', l6_dir: 'cw', l6_walk: 0 }) },
      blocks: [
        { kind: 'p', text: '恭喜你已经掌握了标准单回路！但考场上（尤其是 Sadiku 教材 Example 2.5 / 2.6 的经典出题套路）教授最喜欢设置两个“双重陷阱”：' },
        {
          kind: 'ul',
          items: [
            String.raw`**双电压源对抗（顶牛）**：左边 [[elem_v1|$V_1 = 20\text{ V}$]] 想把电流往顺时针推，右边 [[elem_v2|$V_2 = 5\text{ V}$]] 却顶着头把电流往逆时针推；`,
            String.raw`**预设反向极性标注**：题目**提前**在下支路[[elem_r2|电阻 $R_2 = 3\ \Omega$]] 上标好了电压 $v_2$（**左 $+$、右 $-$**），这正好与顺时针电流 $i$ 的方向**相反**！`,
          ],
        },
        {
          kind: 'p',
          text: '遇到这种题千万不要强行涂改题目给的 $v_2$ 极性！只需要死守两条铁律：**KVL 看“先碰到的符号”，欧姆定律看“电流是否从 $+$ 进”**（如果电流从 $-$ 进，欧姆定律就带负号 [[eq_term_r2|$v_2 = -iR_2$]]）。先别急着看完整推导，请完成下方的苏格拉底三步引导挑战！',
        },
        {
          kind: 'guided',
          title: '双电压源对抗 + 反向压降标注的单回路求解',
          source: 'Adapted from Alexander & Sadiku (2026), Examples 2.5 & 2.6',
          problem: String.raw`$V_1 = 20\text{ V}$（左支路，上+下−）；$R_1 = 2\ \Omega$（上支路，$v_1$ 标为左+右−）；$V_2 = 5\text{ V}$（右支路，上+下−）；$R_2 = 3\ \Omega$（下支路，$v_2$ 标为左+右−）；假设电流 $i$ 为顺时针（CW）。求 $i$、$v_1$、$v_2$。`,
          problem_svg: SVG_PROBLEM,
          steps: STEPS,
          conclusion: String.raw`黑板写满：$i = 3\text{ A}$，$v_1 = +6\text{ V}$，$v_2 = -9\text{ V}$。下面是同一道题的完整三段式推导。`,
        },
        { kind: 'p', text: '**三段式严谨推导：双电源反向标注单回路完整解**' },
        {
          kind: 'origin',
          title: '① 公理溯源（KVL + 欧姆定律广义被动符号约定）',
          text: String.raw`沿顺时针闭合回路应用 KVL $\sum_{m=1}^{M} v_m = 0$。对[[elem_r1|电阻 $R_1$]]，电流 $i$ 由“$+$”端流入，满足 $v_1 = +iR_1$；对[[elem_r2|电阻 $R_2$]]，电流 $i$ 由“$-$”端流入，满足 $v_2 = -iR_2$。`,
        },
        { kind: 'formula', title: '② 纯符号通式 · 顺时针列 KVL：', tex: String.raw`-V_1 + v_1 + V_2 - v_2 = 0` },
        { kind: 'formula', title: '将 $v_1 = iR_1$ 与 $v_2 = -iR_2$ 代入：', tex: String.raw`-V_1 + iR_1 + V_2 - (-iR_2) = 0 \implies i(R_1 + R_2) = V_1 - V_2` },
        { kind: 'formula', title: '解得电流与各标注电压通式：', tex: String.raw`i = \frac{V_1 - V_2}{R_1 + R_2}, \quad v_1 = iR_1, \quad v_2 = -iR_2` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A',
              text: String.raw`代入 $V_1 = 20\text{ V}$，$V_2 = 5\text{ V}$，$R_1 = 2\ \Omega$，$R_2 = 3\ \Omega$：`,
              tex: String.raw`i = \frac{20 - 5}{2 + 3} = \frac{15}{5} = 3\text{ A}`,
            },
            { label: 'Step B', tex: String.raw`v_1 = (3\text{ A})(2\ \Omega) = +6\text{ V}, \quad v_2 = -(3\text{ A})(3\ \Omega) = -9\text{ V}` },
            {
              label: 'Step C',
              text: String.raw`能量与 KVL 双重校验：$-20 + 6 + 5 - (-9) = 0\text{ V}$；总功率 $P_{V1} + P_{V2} + P_{R1} + P_{R2} = (-60) + 15 + 18 + 27 = 0\text{ W}$。`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT5,
      figure_caption: 'Sadiku 经典双电源对抗 + 反向标注单回路',
    },
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '面包板实测视角——电位参考点（GND）与节点电压的诞生',
      sync: { layer: L1, halo: ['bar_node_a', 'bar_node_b', 'bar_node_c', 'bar_node_d'], params: stageParams({ l6_step: 4, l6_gnd: 'D' }) },
      blocks: [
        {
          kind: 'p',
          text: String.raw`在真实的面包板实验里，当你拿起数字万用表测量刚才第 5 幕那个电路时，你总得把**黑色表笔**插在某一个点上（我们称它为[[bar_node_d|**参考地 GND，电位规定为 $0\text{ V}$**]]），然后用**红色表笔**去依次点触回路的各个角落。`,
        },
        { kind: 'p', text: String.raw`把第 5 幕电路的左下角节点 $D$ 接地（$V_D = 0\text{ V}$），现在用红表笔顺时针绕一圈测量每个节点的绝对电位：` },
        {
          kind: 'ul',
          items: [
            String.raw`点触左上角 $A$：跨过 $20\text{ V}$ 电源的爬坡，读数 [[bar_node_a|$V_A = +20\text{ V}$]]；`,
            String.raw`点触右上角 $B$：跨过 $R_1$ 跌落了 $6\text{ V}$，读数 [[bar_node_b|$V_B = 20 - 6 = +14\text{ V}$]]；`,
            String.raw`点触右下角 $C$：跨过 $5\text{ V}$ 反向电源再跌落 $5\text{ V}$，读数 [[bar_node_c|$V_C = 14 - 5 = +9\text{ V}$]]；`,
            String.raw`点触回左下角 $D$：跨过 $R_2$ 跌落了 $9\text{ V}$，读数 [[bar_node_d|$V_D = 9 - 9 = 0\text{ V}$]]——稳稳落回地平面！`,
          ],
        },
        {
          kind: 'p',
          text: String.raw`此时回看 [[elem_r2|$v_2 = V_D - V_C = 0 - 9 = -9\text{ V}$]]，你就彻底秒懂为什么刚才算出 $v_2$ 是负值了：因为 $C$ 点电位（$+9\text{ V}$）比 $D$ 点电位（$0\text{ V}$）高了整整 $9\text{ V}$！你可以去左侧 Layer 01 点击切换 ctrl_gnd_selector，把地线换到节点 $B$，你会发现所有节点电位都减去了 14 V（$V_A = +6\text{ V}, V_B = 0\text{ V}, V_C = -5\text{ V}, V_D = -14\text{ V}$），但**每颗元件两端的压差与电流 $i$ 丝毫不变**。这就是下一周“节点电压法”的伏笔！`,
        },
        { kind: 'p', text: '**三段式严谨推导：节点电位差与 KVL 的代数恒等性**' },
        { kind: 'origin', title: '① 公理溯源（电压的电位差定义）', text: '任意两点 $X, Y$ 之间的电压定义为两点电位之差：$v_{XY} = V_X - V_Y$。' },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式（闭合回路望远镜求和相消）· 对由节点 $A, B, C, D$ 构成的闭合回路，将各段支路电压展开为节点电位差并求和：`,
          tex: String.raw`\begin{aligned} &v_{DA} + v_{AB} + v_{BC} + v_{CD} \\ &= (V_D - V_A) + (V_A - V_B) + (V_B - V_C) + (V_C - V_D) \equiv 0 \end{aligned}`,
        },
        { kind: 'p', text: '所有节点电位两两正负相消，从代数层面再次证明 KVL 与参考地选取无关。' },
        {
          kind: 'calc',
          title: String.raw`③ 代入数值逐步化简（取 $V_D = 0\text{ V}$）`,
          steps: [
            { label: 'Step A', text: '由第 5 幕已知支路压差，顺时针逐点推算节点电位：', tex: String.raw`V_A = V_D + 20 = 0 + 20 = +20\text{ V}` },
            { label: 'Step B', tex: String.raw`V_B = V_A - v_1 = 20 - 6 = +14\text{ V}` },
            { label: 'Step C', tex: String.raw`V_C = V_B - 5 = 14 - 5 = +9\text{ V}` },
            { label: 'Step D', tex: String.raw`V_D = V_C - 9 = 9 - 9 = 0\text{ V} \implies v_2 = V_D - V_C = 0 - 9 = -9\text{ V}` },
          ],
        },
      ],
      inline_svg: SVG_ACT6,
      figure_caption: '参考地（GND）与回路节点电位分布',
    },
    {
      act_index: 7,
      badge: '第 7 幕',
      title: '随堂自测与下节预告（W1-L7 串联分压与并联分流）',
      sync: { layer: L1, halo: ['kvl_probe_path'], params: stageParams({ l6_step: 4, l6_gnd: 'D' }) },
      blocks: [
        { kind: 'p', text: '在合上今天的笔记本前，请把下面三条“防错护身符”默念一遍：' },
        {
          kind: 'ul',
          items: [
            '**物理底线**：KVL 是能量守恒，绕回原点电位变化必为 0，不同电压值的理想电压源[[group_illegal_par|**绝不能并联**]]。',
            '**列式铁律**：永远默认**顺时针**巡检，**先碰到的符号就写什么号**。',
            '**联立细节**：把 $v$ 换成 $iR$ 时，检查电流 $i$ 是否从标定的“$+$”端进入；若是“$-$”端进入，果断写 $v = -iR$。',
          ],
        },
        { kind: 'p', text: '**下节预告：W1-L7 串联分压与并联分流**' },
        {
          kind: 'p',
          text: String.raw`今天我们每次求串联电阻上的电压，都要老老实实走完“列 KVL → 求电流 $i$ → 再乘以 $R_k$”三步曲。你有没有发现刚才第 4 幕的最终结果里藏着一个漂亮的规律？$18\text{ V}$ 电源接 $2\ \Omega$ 和 $4\ \Omega$，它们分到的电压分别是 $6\text{ V}$ 和 $12\text{ V}$——**正好按电阻比例瓜分了总电压！**`,
        },
        {
          kind: 'p',
          text: String.raw`下一节课 **W1-L7（串联分压与并联分流）**，我们将把 KVL 和 KCL 浓缩成工程界出场率最高的两把“瑞士军刀”：**分压公式** $v_k = \frac{R_k}{R_1 + R_2} V_s$ 与**分流公式**，让你不用列方程也能一眼看穿电位器、传感器分压电路的电压分配！`,
        },
        { kind: 'figure', svg: SVG_ACT7, caption: '知识闭环与 W1-L7（串联分压）预告伏笔' },
        { kind: 'p', text: '**随堂自测题（共 2 题）**' },
      ],
      quiz: QUIZ,
    },
  ],
};

export default W1_L6;
