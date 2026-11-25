// Diagrams the W3-L6 sheet does not have (drawn for the light theme): the four quiz questions (no
// answers on them) and the W3-L8 preview (three-op-amp instrumentation amplifier).

const INK = '#1f2a44';
const RES = '#d97706';
const RES_T = '#b45309';
const V1 = '#0369a1';
const V2 = '#047857';
const NODE = '#a16207';
const OUT = '#6d28d9';
const BAD = '#dc2626';
const MUTED = '#5f626b';
const FONT = 'font-family="ui-monospace, monospace"';

function zigH(x1: number, x2: number, y: number, color = RES) {
  const d = (x2 - x1) / 7;
  const pts = [`${x1},${y}`];
  for (let k = 0; k < 6; k++) pts.push(`${x1 + d * (k + 1)},${y + (k % 2 ? 6 : -6)}`);
  pts.push(`${x2},${y}`);
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>`;
}
function zigV(x: number, y1: number, y2: number, color = RES) {
  const d = (y2 - y1) / 7;
  const pts = [`${x},${y1}`];
  for (let k = 0; k < 6; k++) pts.push(`${x + (k % 2 ? 6 : -6)},${y1 + d * (k + 1)}`);
  pts.push(`${x},${y2}`);
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>`;
}
const gnd = (x: number, y: number) =>
  `<g stroke="${INK}" stroke-width="1.6" stroke-linecap="round"><line x1="${x - 8}" y1="${y}" x2="${x + 8}" y2="${y}"/><line x1="${x - 5}" y1="${y + 4}" x2="${x + 5}" y2="${y + 4}"/><line x1="${x - 2}" y1="${y + 8}" x2="${x + 2}" y2="${y + 8}"/></g>`;
const t = (x: number, y: number, s: string, fill = INK, anchor = 'middle', size = 11, weight = 700) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const sub = (s: string) => `<tspan dy="3" font-size="78%">${s}</tspan><tspan dy="-3">&#8203;</tspan>`;

interface Amp {
  title: string;
  v1: string;
  v2: string | null;
  r1: string;
  r2: string;
  r3: string;
  r4: string;
  r4Bad?: boolean;
  nodeA?: string;
  nodeB?: string;
  out: string;
}

/** a four-resistor difference amplifier (Sadiku Fig. 5.19), labels as given; v2 null = grounded */
function diffAmp(a: Amp) {
  const w = (d: string) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const off = a.v2 === null;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 186" role="img" aria-label="${a.title}">
<rect x="1" y="1" width="378" height="184" rx="10" fill="#fbf7ef" stroke="#e3d8c2"/>
${t(14, 17, a.title, INK, 'start', 10.5)}
${w('M 44 66 H 60 M 120 66 H 200 M 150 66 V 34 H 180 M 240 34 H 310 V 94 M 44 122 H 60 M 120 122 H 200 M 150 122 V 130 M 150 166 V 170 M 272 94 H 330')}
${off ? `${w('M 44 122 V 136')}${gnd(44, 136)}${t(44, 112, 'v' + sub('2') + ' = 0', MUTED, 'middle', 10)}` : `<circle cx="40" cy="122" r="4" fill="#fff" stroke="${V2}" stroke-width="2"/>${t(40, 108, a.v2 ?? '', V2, 'middle', 10.5)}`}
<circle cx="40" cy="66" r="4" fill="#fff" stroke="${V1}" stroke-width="2"/>${t(40, 52, a.v1, V1, 'middle', 10.5)}
${zigH(60, 120, 66)}${t(90, 86, a.r1, RES_T)}
${zigH(180, 240, 34)}${t(246, 28, a.r2, RES_T, 'start')}
${zigH(60, 120, 122, off ? '#94a3b8' : RES)}${t(90, 142, a.r3, off ? MUTED : RES_T)}
${zigV(150, 130, 166, a.r4Bad ? BAD : off ? '#94a3b8' : RES)}${t(160, 152, a.r4, a.r4Bad ? '#b91c1c' : off ? MUTED : RES_T, 'start')}
${gnd(150, 170)}
<circle cx="150" cy="66" r="4" fill="${NODE}"/><circle cx="150" cy="122" r="4" fill="${NODE}"/>
${t(144, 58, 'a', NODE, 'end', 10.5)}${t(144, 114, 'b', NODE, 'end', 10.5)}
${a.nodeA ? t(154, 86, a.nodeA, NODE, 'start', 10.5) : ''}${a.nodeB ? t(154, 108, a.nodeB, NODE, 'start', 10.5) : ''}
<polygon points="200,40 200,148 272,94" fill="#fff" stroke="${INK}" stroke-width="2"/>
${t(210, 71, '−', '#b91c1c', 'middle', 14, 800)}${t(210, 127, '+', '#047857', 'middle', 14, 800)}
<circle cx="310" cy="94" r="3.5" fill="${INK}"/><circle cx="334" cy="94" r="4" fill="#fff" stroke="${OUT}" stroke-width="2"/>
${t(334, 118, a.out, OUT, 'middle', 11)}
</svg>`;
}

export const SVG_Q1 = diffAmp({
  title: 'Q1 · 共模完全抑制，求 R₄ 与 vₐ',
  v1: 'v₁ = 2 V',
  v2: 'v₂ = 3 V',
  r1: 'R₁ = 10k',
  r2: 'R₂ = 40k',
  r3: 'R₃ = 20k',
  r4: 'R₄ = ?',
  nodeA: 'vₐ = ?',
  out: 'vₒ',
});

export const SVG_Q2 = diffAmp({
  title: 'Q2 · 叠加法子电路：令 v₂ = 0',
  v1: 'v₁',
  v2: null,
  r1: 'R₁',
  r2: 'R₂',
  r3: 'R₃',
  r4: 'R₄',
  nodeB: 'v' + sub('b1') + ' = ?',
  out: 'vₒ₁',
});

export const SVG_Q3 = diffAmp({
  title: 'Q3 · R₄ 装配偏大 +5%，纯共模 5 V 输入',
  v1: 'v₁ = 5 V',
  v2: 'v₂ = 5 V',
  r1: 'R₁ = 10k',
  r2: 'R₂ = 100k',
  r3: 'R₃ = 10k',
  r4: 'R₄ = 105k',
  r4Bad: true,
  out: 'vₒ = ?',
});

/** Q4: a high-impedance sensor on the single-op-amp difference amplifier */
export const SVG_Q4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 170" role="img" aria-label="Q4 · 高内阻传感器接单运放差分放大器">
<rect x="1" y="1" width="378" height="168" rx="10" fill="#fbf7ef" stroke="#e3d8c2"/>
${t(14, 18, 'Q4 · 高内阻传感器 → 单运放差分放大器', INK, 'start', 11)}
<rect x="14" y="40" width="74" height="100" rx="8" fill="#f0f9ff" stroke="${V1}" stroke-width="1.5"/>
${t(51, 58, '传感器', V1, 'middle', 10.5)}
${zigH(24, 78, 76, '#0284c7')}${t(51, 94, 'R' + sub('s'), V1, 'middle', 10)}
${zigH(24, 78, 116, '#0284c7')}${t(51, 134, 'R' + sub('s'), V1, 'middle', 10)}
<path d="M 88 76 H 130 M 88 116 H 130" fill="none" stroke="${INK}" stroke-width="2"/>
<rect x="130" y="52" width="130" height="88" rx="8" fill="#fff" stroke="${INK}" stroke-width="1.6"/>
${t(195, 72, '四电阻差分放大器', INK, 'middle', 10.5)}
${t(195, 96, 'R' + sub('in1') + ' = ?', NODE, 'middle', 10.5)}
${t(195, 116, 'R' + sub('in2') + ' = ?', NODE, 'middle', 10.5)}
${t(195, 132, '增益怎么调？', MUTED, 'middle', 10)}
<path d="M 260 96 H 330" fill="none" stroke="${INK}" stroke-width="2"/>
<circle cx="334" cy="96" r="4" fill="#fff" stroke="${OUT}" stroke-width="2"/>${t(334, 118, 'vₒ', OUT)}
${t(195, 160, '短板在哪？出路在哪？', MUTED, 'middle', 10)}
</svg>`;

/** after the quiz: the W3-L8 preview — two non-inverting buffers sharing one gain resistor, then today's amplifier */
export const SVG_NEXT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 176" role="img" aria-label="预告：三运放仪表放大器">
<rect x="1" y="1" width="398" height="174" rx="10" fill="#fbf7ef" stroke="#e3d8c2"/>
${t(14, 18, '预告 W3-L8 · 三运放仪表放大器', INK, 'start', 11)}
<path d="M 32 42 H 70 M 32 142 H 70 M 118 52 H 222 M 150 52 V 80 H 60 V 62 H 70 M 118 132 H 222 M 150 132 V 104 H 60 V 122 H 70" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
<circle cx="28" cy="42" r="4" fill="#fff" stroke="${V1}" stroke-width="2"/>${t(28, 32, 'v₁', V1)}
<circle cx="28" cy="142" r="4" fill="#fff" stroke="${V2}" stroke-width="2"/>${t(28, 162, 'v₂', V2)}
<polygon points="70,32 70,72 118,52" fill="#f0f9ff" stroke="${V1}" stroke-width="1.8"/>${t(77, 47, '+', '#047857', 'middle', 12, 800)}${t(77, 67, '−', '#b91c1c', 'middle', 12, 800)}
<polygon points="70,112 70,152 118,132" fill="#ecfdf5" stroke="${V2}" stroke-width="1.8"/>${t(77, 127, '−', '#b91c1c', 'middle', 12, 800)}${t(77, 147, '+', '#047857', 'middle', 12, 800)}
${zigV(60, 80, 104, BAD)}${t(48, 96, 'R' + sub('G'), '#b91c1c', 'end', 11)}
${t(105, 96, '高阻缓冲', MUTED, 'middle', 10)}
<rect x="222" y="30" width="122" height="124" rx="8" fill="#fff" stroke="${OUT}" stroke-width="1.6" stroke-dasharray="5 3"/>
${t(283, 46, '今天的配对', OUT, 'middle', 10.5)}${t(283, 60, '差分放大器', OUT, 'middle', 10.5)}
<polygon points="256,80 256,124 300,102" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
<path d="M 222 52 H 240 V 91 H 256 M 222 132 H 240 V 113 H 256 M 300 102 H 372" fill="none" stroke="${INK}" stroke-width="1.8"/>
<circle cx="376" cy="102" r="4" fill="#fff" stroke="${OUT}" stroke-width="2"/>${t(376, 124, 'vₒ', OUT)}
${t(283, 146, '一颗 R' + sub('G') + ' 调增益', MUTED, 'middle', 10)}
</svg>`;
