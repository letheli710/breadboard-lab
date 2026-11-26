// The W4-L4 diagrams. The sheet's SVGs (sheetSvgs.ts, copied by a script) are drawn for a dark canvas
// and recoloured for the light theme by lightSvg. Changes, of colour and typography only, except
// where the anti-spoiler rule or the course owner asks for more:
// - colours lightSvg leaves pale or dark on white: the pale orange resistor labels #fdba74 → deep
//   orange, fig. 6-1's capacitor (#0284c7) and resistor (#9a3412) boxes → light tints so their
//   labels read;
// - a symbol written with an underscore in the diagram text (v_C, R_Th, i_R …) gets its subscript
//   set low and small (the words are unchanged);
// - fig. 3-1: "剩余 < 0.67%" at t ≥ 5τ reads "剩余 ≤ 0.67%" (at 5τ it is exactly 0.67 %);
// - fig. 6-1: the +5 V rail names its source, the 台式可调直流电源（5 V）;
// - anti-spoiler: fig. 5-1 is the guided example's circuit, so SVG_ACT5_TASK (shown before the
//   example) prints "?" for the capacitor's DC equivalent, the node voltages, R_Th and τ; the sheet's figure (SVG_ACT5) closes act 5
//   after the 通关复盘 board. The step 2–5 diagrams of the sheet print their step's answer (6 V → 6 V,
//   12 V → 4 V; R_Th = (R2 + R3) ∥ R4; 4 e^(−t/0.9); 2.7 / 0.6 J), so MINI_STEP2–5 ask the question
//   instead (same size, same style); MINI_STEP1's title no longer states "C 等效为开路".
// ADDED_* figures are drawn for the light theme: the four quiz questions (no answers on them) and
// the W4-L5 preview.

import { lightSvg } from '../../svgTheme';
import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_ACT6, SHEET_MINI1 } from './sheetSvgs';

/** replace `a` by `b`, and fail loudly when the sheet text has changed under us */
function must(s: string, a: string, b: string): string {
  if (!s.includes(a)) throw new Error(`W4-L4 svgs: "${a}" not found`);
  return s.split(a).join(b);
}

/** set the subscript of underscore symbols in <text> low and small: "v_C(t)" → v, C (sub), "(t)" */
export function subText(svg: string): string {
  return svg.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (_m, open: string, body: string, close: string) => {
    const parts = body.split(/(?<=[A-Za-z])_([A-Za-z0-9]+)/);
    if (parts.length === 1) return open + body + close;
    let out = parts[0];
    for (let i = 1; i < parts.length; i += 2) out += `<tspan dy="3" font-size="78%">${parts[i]}</tspan><tspan dy="-3">${parts[i + 1] || '&#8203;'}</tspan>`;
    return open + out + close;
  });
}

function sheet(svg: string): string {
  const s = lightSvg(svg)
    .replace(/fill=(["'])#fdba74\1/g, 'fill=$1#c2410c$1')
    .replace(/stroke=(["'])#fdba74\1/g, 'stroke=$1#ea580c$1')
    .replace(/fill="#ffedd5"/g, 'fill="#9a3412"')
    .replace(/fill="#9a3412" stroke=/g, 'fill="#ffedd5" stroke=')
    .replace(/fill="#0284c7" stroke=/g, 'fill="#e0f2fe" stroke=');
  return subText(s);
}

export const SVG_ACT1 = sheet(SHEET_ACT1);
export const SVG_ACT2 = sheet(SHEET_ACT2);
export const SVG_ACT3 = sheet(must(SHEET_ACT3, '剩余 &lt; 0.67% (不足 1%)', '剩余 ≤ 0.67% (不足 1%)'));
export const SVG_ACT4 = sheet(SHEET_ACT4);
/** fig. 5-1 as in the sheet: the solved network (closes act 5, after the 通关复盘 board) */
export const SVG_ACT5 = sheet(SHEET_ACT5);
/** fig. 5-1 before the guided example: the node voltages, R_Th and τ are what the example asks */
export const SVG_ACT5_TASK = sheet(
  [
    ['（开关闭合稳态，C 视为开路）', '（开关闭合稳态，C 等效为 ?）'],
    ['>C 开路<', '>C ?<'],
    ['>A (12V)<', '>A (?)<'],
    ['>B (6V)<', '>B (?)<'],
    ['结果：v_C(0-) = v_B(0-) = 6 V', '求：v_C(0-) = v_B(0-) = ?'],
    ['R3=6Ω（与 R2 串联=18Ω）', 'R3=6Ω'],
    ['>R_Th = 18∥6<', '>R_Th = ?<'],
    ['结果：R_Th = 4.5 Ω, τ = R_Th·C = 0.9 s', '求：R_Th = ?，τ = R_Th·C = ?'],
  ].reduce((s, [a, b]) => must(s, a, b), SHEET_ACT5),
);
export const SVG_ACT6 = sheet(must(SHEET_ACT6, '>+5 V 电源轨<', '>+5 V 电源轨 ← 台式可调直流电源（5 V）<'));

/* ------------------------------------------------------------- guided-example step diagrams */

const mini = (s: string) => sheet(s).replace('<svg ', '<svg style="max-width:380px" ');
const F = `font-family='sans-serif'`;

/** step 1: the sheet's diagram titled the step's first answer (C 等效为开路); it asks instead */
export const MINI_STEP1 = mini(must(SHEET_MINI1, 't = 0- 稳态：C 等效为开路', 't = 0- 稳态：C 等效为什么？'));
/** step 2: which of the two may jump? (the sheet's diagram printed 6 V → 6 V and 12 V → 4 V) */
export const MINI_STEP2 = mini(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='24' fill='#f59e0b' font-size='11' ${F} text-anchor='middle'>换路瞬间 t = 0- → t = 0+</text><rect x='22' y='40' width='98' height='52' rx='6' fill='#1e293b' stroke='#38bdf8'/><text x='71' y='62' fill='#38bdf8' font-size='11' ${F} text-anchor='middle'>v_C 能突变吗？</text><text x='71' y='80' fill='#e2e8f0' font-size='11' ${F} text-anchor='middle'>6 V → ?</text><rect x='140' y='40' width='98' height='52' rx='6' fill='#1e293b' stroke='#f43f5e'/><text x='189' y='62' fill='#fda4af' font-size='11' ${F} text-anchor='middle'>v_R2 能突变吗？</text><text x='189' y='80' fill='#e2e8f0' font-size='11' ${F} text-anchor='middle'>12 V → ?</text></svg>`,
);
/** step 3: which resistors are still in the loop? (the sheet's diagram printed (R2 + R3) ∥ R4) */
export const MINI_STEP3 = mini(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='20' fill='#86efac' font-size='11' ${F} text-anchor='middle'>t &gt; 0：从 C 两端向左看，R_Th = ?</text><rect x='12' y='36' width='54' height='34' rx='6' fill='#1e293b' stroke='#64748b' stroke-dasharray='4,3'/><text x='39' y='57' fill='#94a3b8' font-size='10' ${F} text-anchor='middle'>R1=6Ω</text><rect x='72' y='36' width='54' height='34' rx='6' fill='#1e293b' stroke='#f97316'/><text x='99' y='57' fill='#fdba74' font-size='10' ${F} text-anchor='middle'>R2=12Ω</text><rect x='132' y='36' width='54' height='34' rx='6' fill='#1e293b' stroke='#f97316'/><text x='159' y='57' fill='#fdba74' font-size='10' ${F} text-anchor='middle'>R3=6Ω</text><rect x='192' y='36' width='54' height='34' rx='6' fill='#1e293b' stroke='#f97316'/><text x='219' y='57' fill='#fdba74' font-size='10' ${F} text-anchor='middle'>R4=6Ω</text><text x='130' y='92' fill='#cbd5e1' font-size='10' ${F} text-anchor='middle'>哪几个电阻还连在放电回路里？怎样串并联？</text></svg>`,
);
/** step 4: v_C(t) is given by the question; the ratio of v_R2 is asked */
export const MINI_STEP4 = mini(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='22' fill='#38bdf8' font-size='11' ${F} text-anchor='middle'>电容电压驱动两支路同步指数衰减</text><line x1='30' y1='90' x2='230' y2='90' stroke='#94a3b8' stroke-width='1.5'/><line x1='30' y1='90' x2='30' y2='34' stroke='#94a3b8' stroke-width='1.5'/><path d='M 30 38 Q 90 74 220 88' fill='none' stroke='#38bdf8' stroke-width='2.5'/><text x='150' y='52' fill='#7dd3fc' font-size='10' ${F}>v_C(t) = 6e^(-t/0.9)</text><text x='150' y='70' fill='#fcd34d' font-size='10' ${F}>v_R2(t) = ? · v_C(t)</text></svg>`,
);
/** step 5: the split of W0 is asked (the sheet's diagram printed 2.7 / 0.6 J) */
export const MINI_STEP5 = mini(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='22' fill='#86efac' font-size='11' ${F} text-anchor='middle'>总储能 W0 = ? 如何分给三个电阻</text><rect x='20' y='44' width='72' height='26' fill='#1e293b' stroke='#f97316'/><text x='56' y='61' fill='#fdba74' font-size='10' font-weight='bold' ${F} text-anchor='middle'>R4：?</text><rect x='94' y='44' width='72' height='26' fill='#1e293b' stroke='#38bdf8'/><text x='130' y='61' fill='#7dd3fc' font-size='10' font-weight='bold' ${F} text-anchor='middle'>R2：?</text><rect x='168' y='44' width='72' height='26' fill='#1e293b' stroke='#a78bfa'/><text x='204' y='61' fill='#c4b5fd' font-size='10' font-weight='bold' ${F} text-anchor='middle'>R3：?</text><text x='130' y='92' fill='#cbd5e1' font-size='10' ${F} text-anchor='middle'>W_R4 + W_R2 + W_R3 = W0 ?</text></svg>`,
);

/* ------------------------------------------------------------- added figures (light theme) */

const INK = '#1f2a44';
const RES = '#ea580c';
const RES_T = '#c2410c';
const CAP = '#0369a1';
const IND = '#6d28d9';
const GOOD = '#15803d';
const MUTED = '#5f626b';
const FONT = 'font-family="ui-sans-serif, system-ui, sans-serif"';

const t = (x: number, y: number, s: string, fill = INK, anchor = 'middle', size = 11, weight = 700) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const sub = (s: string) => `<tspan dy="3" font-size="78%">${s}</tspan><tspan dy="-3">&#8203;</tspan>`;
function zigV(x: number, y1: number, y2: number) {
  const d = (y2 - y1) / 7;
  const pts = [`${x},${y1}`];
  for (let k = 0; k < 6; k++) pts.push(`${x + (k % 2 ? 6 : -6)},${y1 + d * (k + 1)}`);
  pts.push(`${x},${y2}`);
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${RES}" stroke-width="2.2" stroke-linejoin="round"/>`;
}
const capV = (x: number, y: number) =>
  `<line x1="${x - 14}" y1="${y}" x2="${x + 14}" y2="${y}" stroke="${CAP}" stroke-width="3.2"/><line x1="${x - 14}" y1="${y + 9}" x2="${x + 14}" y2="${y + 9}" stroke="${CAP}" stroke-width="3.2"/>`;
function coilV(x: number, y1: number, y2: number) {
  const h = (y2 - y1) / 4;
  let d = `M ${x} ${y1}`;
  for (let i = 0; i < 4; i++) d += ` A ${h / 2} ${h / 2} 0 0 1 ${x} ${y1 + h * (i + 1)}`;
  return `<path d="${d}" fill="none" stroke="${IND}" stroke-width="2.6"/>`;
}
const wire = (d: string) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
const frame = (w: number, h: number, label: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10" fill="#fbf7ef" stroke="#e3d8c2"/>${body}</svg>`;

/** Q1: a discharging RC, the energy bar at t = τ asked */
export const ADDED_Q1 = frame(
  360,
  130,
  '无源 RC 放电：t = τ 时电容剩余储能占比？',
  wire('M 50 30 L 130 30 M 50 110 L 130 110 M 50 30 L 50 62 M 50 71 L 50 110 M 130 30 L 130 42 M 130 98 L 130 110') +
    capV(50, 62) +
    zigV(130, 42, 98) +
    t(26, 70, 'C', CAP) +
    t(146, 74, 'R', RES_T, 'start') +
    t(255, 30, `t = τ 时 w${sub('C')}(τ) / W${sub('0')} = ?`, INK, 'middle', 11.5) +
    `<rect x="190" y="48" width="130" height="16" rx="4" fill="#eef0f3"/><rect x="190" y="48" width="130" height="16" rx="4" fill="none" stroke="${CAP}" stroke-dasharray="4 3"/>` +
    t(255, 60, '?', CAP, 'middle', 12) +
    t(255, 90, `v(τ) = V${sub('0')} · e^(−1)`, MUTED, 'middle', 10.5, 600) +
    t(255, 108, `w${sub('C')} = ½ C v²`, MUTED, 'middle', 10.5, 600),
);

/** Q2: L = 40 mH, R1 = 8 Ω and R2 = 12 Ω in one series loop (L → R1 along the top → R2 down the right) */
export const ADDED_Q2 = frame(
  360,
  130,
  '无源 RL 回路：L = 40 mH，R1 = 8 Ω 与 R2 = 12 Ω 串联',
  wire('M 60 30 L 130 30 M 194 30 L 300 30 L 300 42 M 300 98 L 300 110 L 60 110 M 60 30 L 60 44 M 60 96 L 60 110') +
    `<polyline points="130,30 135,24 143,36 151,24 159,36 167,24 175,36 183,24 189,30 194,30" fill="none" stroke="${RES}" stroke-width="2.2" stroke-linejoin="round"/>` +
    coilV(60, 44, 96) +
    zigV(300, 42, 98) +
    t(30, 74, 'L', IND) +
    t(30, 90, '40 mH', IND, 'middle', 10) +
    t(162, 54, `R${sub('1')} = 8 Ω`, RES_T) +
    t(316, 74, `R${sub('2')}`, RES_T, 'start') +
    t(316, 90, '12 Ω', RES_T, 'start', 10) +
    t(240, 22, 'i(t) →', GOOD, 'middle', 10.5) +
    t(180, 84, 'τ = ?', INK, 'middle', 12),
);

/** Q3: an RC and an RL side by side, R_Th doubled in both */
export const ADDED_Q3 = frame(
  360,
  130,
  'RC 与 RL 电路的等效电阻同时加倍',
  wire('M 40 34 L 120 34 M 40 106 L 120 106 M 40 34 L 40 64 M 40 73 L 40 106 M 120 34 L 120 42 M 120 98 L 120 106') +
    capV(40, 64) +
    zigV(120, 42, 98) +
    t(80, 22, '无源 RC', CAP) +
    t(80, 124, `R${sub('Th')} → 2 R${sub('Th')}`, RES_T, 'middle', 10.5) +
    wire('M 220 34 L 300 34 M 220 106 L 300 106 M 220 34 L 220 44 M 220 96 L 220 106 M 300 34 L 300 42 M 300 98 L 300 106') +
    coilV(220, 44, 96) +
    zigV(300, 42, 98) +
    t(260, 22, '无源 RL', IND) +
    t(260, 124, `R${sub('Th')} → 2 R${sub('Th')}`, RES_T, 'middle', 10.5) +
    t(170, 74, 'τ ?', INK, 'middle', 14),
);

/** Q4: a charged capacitor across Ra = 10 kΩ ∥ Rb = 30 kΩ */
export const ADDED_Q4 = frame(
  360,
  130,
  '电容并联 Ra = 10 kΩ 与 Rb = 30 kΩ 放电',
  wire('M 50 30 L 260 30 M 50 110 L 260 110 M 50 30 L 50 62 M 50 71 L 50 110 M 160 30 L 160 42 M 160 98 L 160 110 M 260 30 L 260 42 M 260 98 L 260 110') +
    capV(50, 62) +
    zigV(160, 42, 98) +
    zigV(260, 42, 98) +
    t(24, 58, 'C', CAP) +
    t(24, 90, `W${sub('0')}`, CAP, 'middle', 10) +
    t(24, 104, '8 mJ', CAP, 'middle', 10) +
    t(176, 66, `R${sub('a')}`, RES_T, 'start') +
    t(176, 82, '10 kΩ', RES_T, 'start', 10) +
    t(276, 66, `R${sub('b')}`, RES_T, 'start') +
    t(276, 82, '30 kΩ', RES_T, 'start', 10) +
    t(210, 22, `W${sub('Ra')} = ?`, INK, 'middle', 11),
);

/** W4-L5 preview: a step response rising from x(0) to x(∞) */
const prevCurve = Array.from({ length: 41 }, (_, i) => {
  const u = (i / 40) * 5;
  return `${(60 + u * 56).toFixed(1)},${(150 - 100 * (1 - Math.exp(-u))).toFixed(1)}`;
}).join(' ');
export const ADDED_NEXT = frame(
  400,
  190,
  '下节预告：一阶阶跃响应从 x(0) 走向 x(∞)',
  `<line x1="60" y1="160" x2="350" y2="160" stroke="${INK}" stroke-width="1.6"/><line x1="60" y1="160" x2="60" y2="34" stroke="${INK}" stroke-width="1.6"/>` +
    `<line x1="60" y1="50" x2="350" y2="50" stroke="${GOOD}" stroke-width="1.4" stroke-dasharray="5 4"/>` +
    `<polyline points="${prevCurve}" fill="none" stroke="${CAP}" stroke-width="3"/>` +
    t(354, 46, 'x(∞)', GOOD, 'end', 11) +
    t(52, 154, 'x(0)', CAP, 'end', 11) +
    t(356, 176, 't', INK, 'end', 11) +
    t(205, 24, 'x(t) = x(∞) + [x(0) − x(∞)] e^(−t/τ)', INK, 'middle', 12) +
    t(220, 120, '三要素：初值、终值、τ', MUTED, 'middle', 11, 600),
);
