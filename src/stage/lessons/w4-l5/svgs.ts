// The lesson's diagrams on the light theme. The sheet's SVGs (sheetSvgs.ts, drawn for a dark
// canvas) go through lightSvg(); a few colours the shared mapping does not know are fixed here.
// Anti-spoiler: act 3's figure is Sadiku 7.5 — the guided example — so the act shows it with the
// answers replaced by "?"; the full figure is the 「通关复盘」 board after the guided block. Step 5's
// mini diagram had the step's own answer: it reads "= ?" while the step is open. The quiz figures
// are drawn here for the light theme (none gives its answer away).

import { lightSvg } from '../../svgTheme';
import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_ACT6, SHEET_MINI1, SHEET_MINI2, SHEET_MINI3, SHEET_MINI4, SHEET_MINI5 } from './sheetSvgs';

/** colours the shared mapping leaves dark: the safe panel's green-black */
const fix = (svg: string) => lightSvg(svg).replace(/#0d261f/g, '#f0fdf4');

/** replace each [from, to] once; throws when a string is missing (the sheet copy changed) */
function swap(svg: string, pairs: [string, string][]): string {
  let s = svg;
  for (const [a, b] of pairs) {
    if (!s.includes(a)) throw new Error(`svg: "${a}" not found`);
    s = s.replace(a, b);
  }
  return s;
}

export const SVG_FIG1 = fix(SHEET_ACT1);
export const SVG_FIG2 = fix(SHEET_ACT2);

const ACT3_MASK: [string, string][] = [
  ['>核心验算结果<', '>核心验算结果（引导例题后揭晓）<'],
  ['>Rth = 4 Ω<', '>Rth = ?<'],
  ['>τ = 1.0 s<', '>τ = ?<'],
  ['>vC = 24 - 12e^-t<', '>vC(t) = ?<'],
  ['>i3 = 2 + 2e^-t<', '>i3(t) = ?<'],
  ['>• vC(0-) = 18 × 6/(3+6) = 12 V<', '>• vC(0-) = 18 × 6/(3+6) = ?<'],
  ['>• B 侧独立分压：i3(0-) = 36/18 = 2 A<', '>• B 侧独立分压：i3(0-) = 36/18 = ?<'],
  ['>• C 替换为 12 V 恒压源（连续）<', '>• C 替换为 vC(0+) 恒压源（连续）<'],
  ['>• i3(0+) = (36 - 12)/6 = 4 A !!<', '>• i3(0+) = ?（必须现算！）<'],
  ['>• 非状态变量突变：2 A → 4 A<', '>• 非状态变量突变：i3(0-) → i3(0+)<'],
  ['>• iC(0+) = 4 - 12/12 = 3 A (突变)<', '>• iC(0+) = ? (突变)<'],
  ['>• vC(∞) = Vth = 36×12/18 = 24 V<', '>• vC(∞) = Vth = ?<'],
  ['>• i3(∞) = (36 - 24)/6 = 2 A<', '>• i3(∞) = ?<'],
  ['>• Rth = 6 || 12 = 4 Ω, τ = 1 s<', '>• Rth = ?,  τ = ?<'],
];

/** act 3: the circuit and the three snapshots with the answers hidden */
export const SVG_FIG3_MASKED = fix(swap(SHEET_ACT3, ACT3_MASK));
/** the 「通关复盘」 board: the sheet's figure as drawn */
export const SVG_FIG3 = fix(SHEET_ACT3);
/** the guided example's problem diagram: the top panel of the masked figure (the circuit) */
export const SVG_PROBLEM = SVG_FIG3_MASKED.replace('viewBox="0 0 820 340" width="820" height="340"', 'viewBox="10 36 800 156" width="800" height="156"');

export const SVG_FIG4 = fix(SHEET_ACT4);
export const SVG_FIG5 = fix(
  swap(SHEET_ACT5, [
    ['❌ 致命错误', '✗ 致命错误'],
    ['✅ 正确接法', '✓ 正确接法'],
  ]),
);
export const SVG_FIG6 = fix(SHEET_ACT6);

export const MINI_STEP1 = fix(SHEET_MINI1);
export const MINI_STEP2 = fix(SHEET_MINI2);
export const MINI_STEP3 = fix(SHEET_MINI3);
export const MINI_STEP4 = fix(SHEET_MINI4);
export const MINI_STEP5 = fix(
  swap(SHEET_MINI5, [
    ['三要素：2 + (4 - 2)e^(-t) = 2 + 2e^(-t) A', '三要素：2 + (4 - 2)e^(-t) = ?'],
    ['欧姆法：[36 - (24 - 12e^-t)]/6 = 2 + 2e^(-t) A', '欧姆法：[36 - (24 - 12e^-t)]/6 = ?'],
  ]),
);

/* ------------------------------------------------------------------ quiz figures (light theme) */

const F = 'font-family="sans-serif"';

/** Q1: the kit and the scope cursor at t = 1.0 s */
export const SVG_Q1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 150" role="img" aria-label="5 V 经 10 kΩ 给 100 µF 充电，示波器游标停在 1.0 s">
  <rect width="360" height="150" rx="10" fill="#fbf7ef"/>
  <circle cx="36" cy="80" r="14" fill="#fff" stroke="#059669" stroke-width="2"/>
  <text x="36" y="77" text-anchor="middle" fill="#047857" ${F} font-size="11" font-weight="bold">+</text>
  <text x="36" y="89" text-anchor="middle" fill="#047857" ${F} font-size="11" font-weight="bold">−</text>
  <text x="36" y="112" text-anchor="middle" fill="#047857" ${F} font-size="11">5 V</text>
  <polyline points="36,66 36,36 62,36 66,29 72,43 78,29 84,43 90,29 94,36 120,36 120,70" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="78" y="24" text-anchor="middle" fill="#1f2a44" ${F} font-size="11">10 kΩ</text>
  <line x1="106" y1="70" x2="134" y2="70" stroke="#0284c7" stroke-width="3"/>
  <line x1="106" y1="79" x2="134" y2="79" stroke="#0284c7" stroke-width="3"/>
  <text x="140" y="79" fill="#0369a1" ${F} font-size="11">100 µF</text>
  <polyline points="120,79 120,126 36,126 36,94" fill="none" stroke="#334155" stroke-width="2"/>
  <rect x="190" y="22" width="156" height="106" rx="6" fill="#0f2027"/>
  <g stroke="#334155" stroke-width="0.8">
    <line x1="190" y1="48" x2="346" y2="48"/><line x1="190" y1="75" x2="346" y2="75"/><line x1="190" y1="102" x2="346" y2="102"/>
    <line x1="221" y1="22" x2="221" y2="128"/><line x1="252" y1="22" x2="252" y2="128"/><line x1="283" y1="22" x2="283" y2="128"/><line x1="314" y1="22" x2="314" y2="128"/>
  </g>
  <line x1="221" y1="22" x2="221" y2="128" stroke="#f59e0b" stroke-width="1.6" stroke-dasharray="4,3"/>
  <text x="225" y="40" fill="#fcd34d" ${F} font-size="11" font-weight="bold">t = 1.0 s</text>
  <text x="268" y="120" text-anchor="middle" fill="#67e8f9" ${F} font-size="12" font-weight="bold">CH2 = ? V</text>
  <text x="268" y="144" text-anchor="middle" fill="#5f626b" ${F} font-size="10">1 V/div · 500 ms/div</text>
</svg>`;

/** Q2: a resistor branch with i_R(0⁻) = i_R(∞) = 2 A and the 0⁺ value asked */
export const SVG_Q2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 140" role="img" aria-label="电阻电流的三个时刻：0⁻ 为 2 A，∞ 为 2 A，0⁺ 未知">
  <rect width="360" height="140" rx="10" fill="#fbf7ef"/>
  <line x1="30" y1="104" x2="336" y2="104" stroke="#64748b" stroke-width="1.4"/>
  <line x1="120" y1="20" x2="120" y2="112" stroke="#64748b" stroke-width="1.4"/>
  <text x="336" y="122" text-anchor="end" fill="#5f626b" ${F} font-size="11">t</text>
  <text x="120" y="126" text-anchor="middle" fill="#5f626b" ${F} font-size="11">0</text>
  <line x1="36" y1="72" x2="120" y2="72" stroke="#e11d48" stroke-width="2.6"/>
  <text x="44" y="64" fill="#be123c" ${F} font-size="11" font-weight="bold">i_R(0⁻) = 2 A</text>
  <line x1="200" y1="72" x2="330" y2="72" stroke="#e11d48" stroke-width="2.6" stroke-dasharray="6,4"/>
  <text x="326" y="64" text-anchor="end" fill="#be123c" ${F} font-size="11" font-weight="bold">i_R(∞) = 2 A</text>
  <circle cx="120" cy="40" r="11" fill="#fff" stroke="#d97706" stroke-width="2"/>
  <text x="120" y="45" text-anchor="middle" fill="#b45309" ${F} font-size="13" font-weight="bold">?</text>
  <text x="138" y="36" fill="#a16207" ${F} font-size="11" font-weight="bold">i_R(0⁺)：电容在 0⁺ 钳位</text>
  <text x="160" y="94" text-anchor="middle" fill="#5f626b" ${F} font-size="10">0⁺ 到 ∞ 之间怎么走？</text>
</svg>`;

/** Q3: the act-4 RL circuit with τ and v_L(0⁺) asked */
export const SVG_Q3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 150" role="img" aria-label="RL 电路：L = 2 H，R_th = 4 Ω，i_L 从 6 A 到 3 A">
  <rect width="360" height="150" rx="10" fill="#fbf7ef"/>
  <rect x="24" y="34" width="110" height="78" rx="8" fill="#fff" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="5,3"/>
  <text x="79" y="66" text-anchor="middle" fill="#1f2a44" ${F} font-size="12" font-weight="bold">戴维南等效</text>
  <text x="79" y="86" text-anchor="middle" fill="#3a4560" ${F} font-size="11">R_th = 4 Ω</text>
  <polyline points="134,52 196,52 196,58" fill="none" stroke="#334155" stroke-width="2"/>
  <path d="M 196 58 a 7 7 0 0 1 0 14 a 7 7 0 0 1 0 14 a 7 7 0 0 1 0 14" fill="none" stroke="#0284c7" stroke-width="2.6"/>
  <polyline points="196,100 196,106 134,106" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="212" y="84" fill="#0369a1" ${F} font-size="12" font-weight="bold">L = 2 H</text>
  <text x="212" y="64" fill="#be123c" ${F} font-size="11">+ v_L(0⁺) = ?</text>
  <text x="212" y="104" fill="#be123c" ${F} font-size="11">−</text>
  <text x="250" y="130" text-anchor="middle" fill="#047857" ${F} font-size="11">i_L：6 A（0⁻）→ 3 A（∞），τ = ?</text>
</svg>`;

/** Q4: the floating resistor and three candidate clip points */
export const SVG_Q4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 150" role="img" aria-label="5 V、R、接地电容 C 与示波器的两个探头">
  <rect width="360" height="150" rx="10" fill="#fbf7ef"/>
  <circle cx="34" cy="80" r="14" fill="#fff" stroke="#059669" stroke-width="2"/>
  <text x="34" y="77" text-anchor="middle" fill="#047857" ${F} font-size="11" font-weight="bold">+</text>
  <text x="34" y="89" text-anchor="middle" fill="#047857" ${F} font-size="11" font-weight="bold">−</text>
  <polyline points="34,66 34,40 70,40 74,33 80,47 86,33 92,47 98,33 102,40 140,40 140,70" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="86" y="28" text-anchor="middle" fill="#1f2a44" ${F} font-size="11">R 10 kΩ（悬浮）</text>
  <line x1="126" y1="70" x2="154" y2="70" stroke="#0284c7" stroke-width="3"/>
  <line x1="126" y1="79" x2="154" y2="79" stroke="#0284c7" stroke-width="3"/>
  <text x="160" y="79" fill="#0369a1" ${F} font-size="11">C</text>
  <polyline points="140,79 140,120 34,120 34,94" fill="none" stroke="#2563eb" stroke-width="2.6"/>
  <text x="88" y="138" text-anchor="middle" fill="#1d4ed8" ${F} font-size="11" font-weight="bold">蓝色 GND 轨</text>
  <circle cx="58" cy="40" r="4" fill="#d97706"/>
  <circle cx="140" cy="40" r="4" fill="#d97706"/>
  <text x="52" y="58" fill="#a16207" ${F} font-size="10">5 V 端</text>
  <text x="146" y="56" fill="#a16207" ${F} font-size="10">R–C 节点</text>
  <rect x="226" y="34" width="116" height="74" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="1.4"/>
  <text x="284" y="54" text-anchor="middle" fill="#1f2a44" ${F} font-size="11" font-weight="bold">双通道示波器</text>
  <text x="284" y="74" text-anchor="middle" fill="#a16207" ${F} font-size="10">CH1 · CH2 · MATH</text>
  <text x="284" y="94" text-anchor="middle" fill="#b91c1c" ${F} font-size="10">黑夹接哪里？</text>
</svg>`;
