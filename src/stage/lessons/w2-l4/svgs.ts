// W2-L4 diagrams for the right column. The sheet's six act figures and its five guided-step
// cards (sheetSvgs.ts, copied by a script) go through the shared lightSvg, plus local fixes:
// - text in pale tints lightSvg keeps as they are (#d1fae5, #ede9fe, #ffe4e6: unreadable on white)
//   is set in the deep shade of the same hue;
// - the three plain K3,3 edges of 图 5-1 (#64748b on the dark canvas → #94a3b8) get #64748b;
// - the wide two-panel figures get the class w24-wide (w2l4.css: on a phone they scroll sideways
//   at a readable size instead of shrinking to 4 px type).
// The guided steps show new step diagrams that leave the answer open (the sheet's cards state
// it: "网孔观察法 ✓", "→ +18 / −3 / +8", the summed self-resistances); the sheet's cards are shown
// unchanged in the 通关复盘 board after the example. The quiz figures are new, in the sheet's style.

import { lightSvg } from '../../svgTheme';
import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_ACT6, SHEET_MINI1, SHEET_MINI2, SHEET_MINI3, SHEET_MINI4, SHEET_MINI5 } from './sheetSvgs';

const PALE_TEXT: Record<string, string> = { '#d1fae5': '#065f46', '#ede9fe': '#5b21b6', '#ffe4e6': '#9f1239' };

/** lightSvg, then deepen the pale text tints it leaves alone */
function light(svg: string): string {
  return lightSvg(svg).replace(/<text\b[^>]*>/g, (tag) =>
    tag.replace(/fill=(["'])(#[0-9a-fA-F]{6})\1/, (m, q: string, c: string) => (PALE_TEXT[c.toLowerCase()] ? `fill=${q}${PALE_TEXT[c.toLowerCase()]}${q}` : m)),
  );
}

const wide = (svg: string) => svg.replace(/^<svg /, '<svg class="w24-wide" ');

export const SVG_ACT1 = wide(light(SHEET_ACT1));
export const SVG_ACT2 = wide(light(SHEET_ACT2));
export const SVG_ACT3 = wide(light(SHEET_ACT3));
export const SVG_ACT4 = wide(light(SHEET_ACT4));
export const SVG_ACT5 = wide(light(SHEET_ACT5).replace(/stroke="#94a3b8" stroke-width="2"\/>/g, 'stroke="#64748b" stroke-width="2"/>'));
export const SVG_ACT6 = wide(light(SHEET_ACT6));

/* ------------------------------------------------------------- helpers for the new diagrams */

const FONT = `font-family="'Inter','PingFang SC',sans-serif"`;

/** clockwise mesh arrow: from the left point over the top to the bottom, head pointing left */
const cw = (x: number, y: number, r: number, c: string) =>
  `<path d="M ${x - r} ${y} A ${r} ${r} 0 1 1 ${x} ${y + r}" fill="none" stroke="${c}" stroke-width="2"/><polygon points="${x - 2},${y + r} ${x + 6},${y + r - 4.5} ${x + 6},${y + r + 4.5}" fill="${c}"/>`;
/** counter-clockwise mesh arrow: from the right point over the top to the bottom, head pointing right */
const ccw = (x: number, y: number, r: number, c: string) =>
  `<path d="M ${x + r} ${y} A ${r} ${r} 0 1 0 ${x} ${y + r}" fill="none" stroke="${c}" stroke-width="2"/><polygon points="${x + 2},${y + r} ${x - 6},${y + r - 4.5} ${x - 6},${y + r + 4.5}" fill="${c}"/>`;
const resV = (x: number, y: number, h = 34, c = '#e2e8f0') =>
  `<rect x="${x - 8}" y="${y - h / 2}" width="16" height="${h}" rx="3" fill="#1e293b" stroke="${c}" stroke-width="1.8"/>`;
const resH = (x: number, y: number, w = 38, c = '#e2e8f0') =>
  `<rect x="${x - w / 2}" y="${y - 8}" width="${w}" height="16" rx="3" fill="#1e293b" stroke="${c}" stroke-width="1.8"/>`;
/** current source, arrow up (or down) */
const isrc = (x: number, y: number, c: string, down = false) =>
  `<circle cx="${x}" cy="${y}" r="12" fill="#0f172a" stroke="${c}" stroke-width="1.8"/>` +
  (down
    ? `<line x1="${x}" y1="${y - 7}" x2="${x}" y2="${y + 3}" stroke="${c}" stroke-width="1.8"/><polygon points="${x},${y + 8} ${x - 4},${y + 1} ${x + 4},${y + 1}" fill="${c}"/>`
    : `<line x1="${x}" y1="${y + 7}" x2="${x}" y2="${y - 3}" stroke="${c}" stroke-width="1.8"/><polygon points="${x},${y - 8} ${x - 4},${y - 1} ${x + 4},${y - 1}" fill="${c}"/>`);
const isrcH = (x: number, y: number, c: string) =>
  `<circle cx="${x}" cy="${y}" r="12" fill="#0f172a" stroke="${c}" stroke-width="1.8"/><line x1="${x - 7}" y1="${y}" x2="${x + 3}" y2="${y}" stroke="${c}" stroke-width="1.8"/><polygon points="${x + 8},${y} ${x + 1},${y - 4} ${x + 1},${y + 4}" fill="${c}"/>`;
const text = (x: number, y: number, s: string, c = '#e2e8f0', size = 11, anchor = 'start', weight = 700) =>
  `<text x="${x}" y="${y}" fill="${c}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${s}</text>`;
/** a small diagram is drawn at most 1.5× its viewBox size (not stretched across a wide column) */
const capped = (svg: string, w: number) => svg.replace(/^<svg /, `<svg style="max-width:${Math.round(w * 1.5)}px;margin:0 auto" `);
const frame = (w: number, h: number, body: string, label: string) =>
  capped(
    lightSvg(
      `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" ${FONT} role="img" aria-label="${label}"><rect width="${w}" height="${h}" rx="10" fill="#0f172a"/>${body}</svg>`,
    ),
    w,
  );

/* ------------------------------------------------------------- guided-example step diagrams */

/** Step 1: count both ways (no verdict) */
export const MINI_STEP1 = frame(
  260,
  110,
  `<rect x="12" y="18" width="108" height="74" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>${text(66, 42, '节点法', '#38bdf8', 11, 'middle')}${text(66, 62, '非参考节点：? 个', '#cbd5e1', 10, 'middle', 600)}${text(66, 80, '超节点：有没有？', '#cbd5e1', 10, 'middle', 600)}` +
    `<rect x="140" y="18" width="108" height="74" rx="6" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5"/>${text(194, 42, '网孔法', '#a78bfa', 11, 'middle')}${text(194, 62, '网孔：? 个', '#cbd5e1', 10, 'middle', 600)}${text(194, 80, '超网孔：有没有？', '#cbd5e1', 10, 'middle', 600)}`,
  '两种方法各数一数方程数',
);

/** Step 2: what each entry of R is made of (values left open) */
export const MINI_STEP2 = frame(
  260,
  110,
  `${text(130, 22, '自电阻与共享电阻核对', '#7dd3fc', 11, 'middle')}${text(18, 46, 'R11 = 网孔 1 周界 = ?', '#38bdf8', 10.5)}${text(18, 68, 'R22 = 网孔 2 周界 = ?', '#a78bfa', 10.5)}${text(18, 90, 'R33 = 网孔 3 周界 = ?', '#34d399', 10.5)}` +
    `${text(160, 46, 'R12 = R21 = ?', '#f59e0b', 10.5)}${text(160, 68, 'R13 = R31 = ?', '#f59e0b', 10.5)}${text(160, 90, 'R23 = R32 = ?', '#f59e0b', 10.5)}`,
  '电阻矩阵各元素的组成',
);

/** Step 3: where each clockwise mesh current crosses its source (the sign is left to read off) */
export const MINI_STEP3 = frame(
  260,
  110,
  `${text(130, 22, '顺时针（CW）穿行电压源', '#fcd34d', 11, 'middle')}${text(18, 46, 'M1：i₁ 沿左侧向上穿过 18 V → ±?', '#38bdf8', 10.5)}${text(18, 68, 'M2：i₂ 沿右侧向下穿过 3 V → ±?', '#a78bfa', 10.5)}${text(18, 90, 'M3：i₃ 沿顶部向右穿过 8 V → ±?', '#34d399', 10.5)}`,
  '三个网孔电流各自穿过哪个电压源',
);

/** Step 4: the sheet's card (the determinants are given in the question) */
export const MINI_STEP4 = capped(light(SHEET_MINI4), 260);

/** Step 5: the shared 4 Ω branch with both clockwise mesh currents beside it */
export const MINI_STEP5 = frame(
  260,
  120,
  `<line x1="130" y1="14" x2="130" y2="100" stroke="#e2e8f0" stroke-width="2.2"/><line x1="40" y1="14" x2="220" y2="14" stroke="#e2e8f0" stroke-width="2.2"/><line x1="40" y1="100" x2="220" y2="100" stroke="#e2e8f0" stroke-width="2.2"/>` +
    `${resV(130, 57, 40, '#f59e0b')}${text(140, 61, '4 Ω', '#fef3c7', 11)}` +
    `${cw(80, 52, 17, '#38bdf8')}${text(80, 56, 'i₁', '#38bdf8', 11, 'middle')}${text(80, 92, 'i₁ = 4 A (CW)', '#38bdf8', 10, 'middle')}` +
    `${cw(190, 52, 17, '#a78bfa')}${text(190, 56, 'i₂', '#a78bfa', 11, 'middle')}${text(190, 92, 'i₂ = 2 A (CW)', '#a78bfa', 10, 'middle')}` +
    `<line x1="116" y1="40" x2="116" y2="68" stroke="#fcd34d" stroke-width="2"/><polygon points="116,75 112,67 120,67" fill="#fcd34d"/>${text(110, 50, 'Iₒ', '#fcd34d', 11, 'end')}${text(130, 115, '目标 Iₒ 向下', '#fcd34d', 10.5, 'middle')}`,
  '中心 4 Ω 支路两侧的顺时针网孔电流',
);

/* ------------------------------------------------------------- 通关复盘: the sheet's five step cards */

const card = (svg: string, x: number, y: number, n: number) => {
  const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return `<g transform="translate(${x} ${y})"><rect width="260" height="110" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1"/><svg width="260" height="110" viewBox="0 0 260 110">${inner}</svg><circle cx="14" cy="14" r="10" fill="#38bdf8"/><text x="14" y="18" fill="#0f172a" font-size="11" font-weight="800" text-anchor="middle">${n}</text></g>`;
};
export const SVG_REVIEW = light(
  `<svg viewBox="0 0 540 372" xmlns="http://www.w3.org/2000/svg" ${FONT} role="img" aria-label="引导例题五步的板书卡片"><rect width="540" height="372" rx="12" fill="#0f172a"/>` +
    card(SHEET_MINI1, 6, 6, 1) +
    card(SHEET_MINI2, 274, 6, 2) +
    card(SHEET_MINI3, 6, 128, 3) +
    card(SHEET_MINI4, 274, 128, 4) +
    card(SHEET_MINI5, 140, 250, 5) +
    `</svg>`,
);

/* ------------------------------------------------------------- quiz diagrams */

/** Q1: 3 nodes, 2 independent current sources and a VCCS 2v_x */
export const SVG_Q1 = frame(
  420,
  190,
  `${text(16, 22, 'Q1 · 3 节点电阻电路：2 个独立电流源 + 1 个压控电流源', '#94a3b8', 11, 'start', 600)}` +
    `<line x1="40" y1="160" x2="330" y2="160" stroke="#94a3b8" stroke-width="2.4"/><line x1="40" y1="70" x2="330" y2="70" stroke="#e2e8f0" stroke-width="2"/>` +
    // node 1 (x 70), node 2 (x 190), node 3 (x 300)
    `<line x1="40" y1="70" x2="40" y2="160" stroke="#e2e8f0" stroke-width="2"/>${isrc(40, 115, '#38bdf8')}` +
    `<line x1="90" y1="70" x2="90" y2="160" stroke="#e2e8f0" stroke-width="2"/>${resV(90, 115)}` +
    `${resH(140, 70)}${text(140, 58, 'vₓ', '#fcd34d', 11, 'middle')}${text(118, 58, '+', '#fcd34d', 11, 'middle')}${text(162, 58, '−', '#fcd34d', 11, 'middle')}` +
    `<line x1="200" y1="70" x2="200" y2="160" stroke="#e2e8f0" stroke-width="2"/><polygon points="200,101 214,115 200,129 186,115" fill="#0f172a" stroke="#fb7185" stroke-width="2"/><line x1="200" y1="107" x2="200" y2="119" stroke="#fb7185" stroke-width="1.8"/><polygon points="200,124 196,117 204,117" fill="#fb7185"/>${text(220, 119, '2vₓ', '#fb7185', 11)}` +
    `${resH(250, 70)}<line x1="300" y1="70" x2="300" y2="160" stroke="#e2e8f0" stroke-width="2"/>${resV(300, 115)}` +
    `<line x1="330" y1="70" x2="330" y2="160" stroke="#e2e8f0" stroke-width="2"/>${isrc(330, 115, '#38bdf8')}` +
    `<circle cx="90" cy="70" r="5" fill="#38bdf8"/><circle cx="200" cy="70" r="5" fill="#a78bfa"/><circle cx="300" cy="70" r="5" fill="#34d399"/>` +
    `${text(90, 58, '1', '#38bdf8', 11, 'middle')}${text(200, 58, '2', '#a78bfa', 11, 'middle')}${text(300, 58, '3', '#34d399', 11, 'middle')}` +
    // the matrix the student wants to write
    `<text x="352" y="92" fill="#e2e8f0" font-size="12" font-weight="700">G = ?</text>` +
    [0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${352 + c * 20}" y="${102 + r * 18}" width="16" height="14" rx="2" fill="#1e293b" stroke="#64748b"/>`).join('')).join('') +
    `${text(185, 182, '参考节点 0', '#94a3b8', 10, 'middle', 600)}`,
  '含 2 个独立电流源和 1 个压控电流源的 3 节点电路',
);

/** Q2: a network homeomorphic to K3,3 with four independent voltage sources on its branches */
export const SVG_Q2 = (() => {
  const top = [80, 210, 340].map((x) => [x, 56]);
  const bot = [80, 210, 340].map((x) => [x, 150]);
  const edges = top.flatMap((a) => bot.map((b) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#94a3b8" stroke-width="1.8"/>`)).join('');
  const vs = [
    // on A–D, C–F, A–E and B–F, away from every crossing
    [80, 103],
    [340, 103],
    [112, 80],
    [308, 126],
  ]
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="9" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/><text x="${x}" y="${y + 3.5}" fill="#38bdf8" font-size="8.5" font-weight="800" text-anchor="middle">Vs</text>`,
    )
    .join('');
  const dots = [...top, ...bot].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="6" fill="${i < 3 ? '#38bdf8' : '#a78bfa'}"/>`).join('');
  return frame(
    420,
    186,
    `${text(16, 22, 'Q2 · 立体电阻网络：与 K₃,₃ 同胚，含 4 个独立电压源', '#94a3b8', 11, 'start', 600)}${edges}${vs}${dots}${text(210, 176, '（其余支路为电阻；交叉处没有焊点）', '#94a3b8', 10, 'middle', 600)}`,
    '与 K3,3 同胚、含 4 个独立电压源的电阻网络',
  );
})();

/** Q3: 3 nodes (with the reference), 7 branches: 4 independent current sources and 3 resistors */
export const SVG_Q3 = frame(
  420,
  190,
  `${text(16, 22, 'Q3 · N = 3（含参考节点），B = 7：4 个独立电流源 + 3 个电阻', '#94a3b8', 11, 'start', 600)}` +
    `<line x1="40" y1="160" x2="380" y2="160" stroke="#94a3b8" stroke-width="2.4"/>` +
    `<line x1="40" y1="80" x2="160" y2="80" stroke="#e2e8f0" stroke-width="2"/><line x1="260" y1="80" x2="380" y2="80" stroke="#e2e8f0" stroke-width="2"/>` +
    [40, 100, 160].map((x) => `<line x1="${x}" y1="80" x2="${x}" y2="160" stroke="#e2e8f0" stroke-width="2"/>`).join('') +
    [260, 320, 380].map((x) => `<line x1="${x}" y1="80" x2="${x}" y2="160" stroke="#e2e8f0" stroke-width="2"/>`).join('') +
    `${isrc(40, 120, '#38bdf8')}${isrc(100, 120, '#38bdf8')}${resV(160, 120)}` +
    `${resV(260, 120)}${isrc(320, 120, '#a78bfa')}${isrc(380, 120, '#a78bfa', true)}` +
    `<line x1="160" y1="80" x2="260" y2="80" stroke="#e2e8f0" stroke-width="2"/>${resH(210, 80)}` +
    `<path d="M 160 80 L 160 44 L 260 44 L 260 80" fill="none" stroke="#e2e8f0" stroke-width="2"/>${isrcH(210, 44, '#38bdf8')}` +
    `<circle cx="160" cy="80" r="5" fill="#38bdf8"/><circle cx="260" cy="80" r="5" fill="#a78bfa"/>${text(150, 74, '1', '#38bdf8', 11, 'end')}${text(270, 74, '2', '#a78bfa', 11)}${text(210, 180, '参考节点 0', '#94a3b8', 10, 'middle', 600)}`,
  '3 个节点、7 条支路的电路：4 个电流源和 3 个电阻',
);

/** Q4: two meshes sharing 5 Ω, mesh 1 clockwise, mesh 2 drawn counter-clockwise */
export const SVG_Q4 = frame(
  420,
  180,
  `${text(16, 22, 'Q4 · 两个网孔共享 5 Ω：网孔 2 的电流方向取反了', '#94a3b8', 11, 'start', 600)}` +
    `<rect x="60" y="44" width="300" height="110" fill="none" stroke="#e2e8f0" stroke-width="2"/><line x1="210" y1="44" x2="210" y2="154" stroke="#e2e8f0" stroke-width="2"/>` +
    `${resV(210, 99, 40, '#f59e0b')}${text(222, 103, '5 Ω', '#fef3c7', 11)}${resH(135, 44)}${resH(285, 44)}` +
    `<circle cx="60" cy="99" r="12" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>${text(60, 95, '+', '#38bdf8', 10, 'middle')}${text(60, 108, '−', '#38bdf8', 10, 'middle')}` +
    `<circle cx="360" cy="99" r="12" fill="#0f172a" stroke="#a78bfa" stroke-width="1.8"/>${text(360, 95, '+', '#a78bfa', 10, 'middle')}${text(360, 108, '−', '#a78bfa', 10, 'middle')}` +
    `${cw(135, 96, 20, '#38bdf8')}${text(135, 100, 'i₁', '#38bdf8', 12, 'middle')}${text(135, 172, '网孔 1：顺时针', '#38bdf8', 10.5, 'middle')}` +
    `${ccw(285, 96, 20, '#fb7185')}${text(285, 100, 'i₂', '#fb7185', 12, 'middle')}${text(285, 172, '网孔 2：逆时针', '#fb7185', 10.5, 'middle')}` +
    `${text(222, 132, 'R₁₂ = ?', '#fcd34d', 11)}`,
  '两个网孔共享一个 5 欧电阻，网孔 1 顺时针、网孔 2 逆时针',
);
