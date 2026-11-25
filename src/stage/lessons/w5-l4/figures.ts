// Diagrams the W5-L4 sheet does not have (drawn for the light theme): the guided example's circuit
// (its problem gives only words) and the four quiz questions. None shows an answer: the guided
// circuit carries the given values only; Q1 the two phasors with their different speeds, v(t)
// asked; Q2 the source to transform, I_s and Z_p asked; Q3 the test source and its measured
// current, Z_Th asked; Q4 the amplifier's elements and ω, A_v asked.

const INK = '#1f2a44';
const WIRE = '#334155';
const MUTED = '#5f626b';
const RES = '#d97706';
const RES_T = '#b45309';
const DC_T = '#b45309';
const W1 = '#059669';
const W1_T = '#047857';
const W2 = '#db2777';
const W2_T = '#be185d';
const IND = '#7c3aed';
const IND_T = '#6d28d9';
const CAP = '#0284c7';
const CAP_T = '#0369a1';
const DEP = '#9333ea';
const DEP_T = '#7e22ce';
const PORT = '#059669';
const FONT = 'font-family="ui-monospace, monospace"';

const t = (x: number, y: number, s: string, fill = INK, anchor = 'middle', size = 12, weight = 700) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
/** subscript inside a text: sub('o') */
const sub = (s: string) => `<tspan dy="3" font-size="78%">${s}</tspan><tspan dy="-3">&#8203;</tspan>`;
const svg = (w: number, h: number, label: string, body: string, max = 440) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${max}px"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10" fill="#fbf7ef" stroke="#e3d8c2"/>${body}</svg>`;
const wire = (d: string, col = WIRE, w = 2) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot = (x: number, y: number, col = INK) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${col}"/>`;
const port = (x: number, y: number, name: string) =>
  `<circle cx="${x}" cy="${y}" r="4.2" fill="#fff" stroke="${PORT}" stroke-width="2.2"/>${t(x + 10, y + 4, name, PORT, 'start', 12)}`;

function resH(x1: number, x2: number, y: number) {
  const n = 6;
  const pts = [`${x1},${y}`];
  for (let k = 0; k < n; k++) pts.push(`${x1 + ((x2 - x1) * (k + 1)) / (n + 1)},${y + (k % 2 ? 5 : -5)}`);
  pts.push(`${x2},${y}`);
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${RES}" stroke-width="2.2" stroke-linejoin="round"/>`;
}
function resV(x: number, y1: number, y2: number) {
  const n = 6;
  const pts = [`${x},${y1}`];
  for (let k = 0; k < n; k++) pts.push(`${x + (k % 2 ? 5 : -5)},${y1 + ((y2 - y1) * (k + 1)) / (n + 1)}`);
  pts.push(`${x},${y2}`);
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${RES}" stroke-width="2.2" stroke-linejoin="round"/>`;
}
function coil(x1: number, x2: number, y: number) {
  const s = (x2 - x1) / 4;
  let d = `M ${x1} ${y}`;
  for (let k = 0; k < 4; k++) d += ` a ${s / 2} ${s / 2} 0 0 1 ${s} 0`;
  return `<path d="${d}" fill="none" stroke="${IND}" stroke-width="2.2"/>`;
}
const capV = (x: number, y: number) =>
  `<g stroke="${CAP}" stroke-width="2.6"><line x1="${x - 10}" y1="${y - 3.5}" x2="${x + 10}" y2="${y - 3.5}"/><line x1="${x - 10}" y1="${y + 3.5}" x2="${x + 10}" y2="${y + 3.5}"/></g>`;
const capH = (x: number, y: number) =>
  `<g stroke="${CAP}" stroke-width="2.6"><line x1="${x - 3.5}" y1="${y - 10}" x2="${x - 3.5}" y2="${y + 10}"/><line x1="${x + 3.5}" y1="${y - 10}" x2="${x + 3.5}" y2="${y + 10}"/></g>`;
const vsrc = (x: number, y: number, col = RES, tc = DC_T) =>
  `<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="${col}" stroke-width="2.2"/>${t(x, y - 3, '+', tc, 'middle', 12, 800)}${t(x, y + 11, '−', tc, 'middle', 12, 800)}`;
const acsrc = (x: number, y: number) =>
  `<circle cx="${x}" cy="${y}" r="13" fill="#fff" stroke="${W1}" stroke-width="2.2"/><path d="M ${x - 7} ${y} q 3.5 -7 7 0 t 7 0" fill="none" stroke="${W1}" stroke-width="2"/>`;
function isrc(x: number, y: number, col = W2, dep = false) {
  const body = dep
    ? `<polygon points="${x},${y - 16} ${x + 16},${y} ${x},${y + 16} ${x - 16},${y}" fill="#fff" stroke="${col}" stroke-width="2.2"/>`
    : `<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="${col}" stroke-width="2.2"/>`;
  return `${body}<path d="M ${x} ${y + 8} V ${y - 4}" stroke="${col}" stroke-width="2"/><polygon points="${x},${y - 9} ${x - 4.5},${y - 2} ${x + 4.5},${y - 2}" fill="${col}"/>`;
}
const gnd = (x: number, y: number) =>
  `<g stroke="${WIRE}" stroke-width="1.8" stroke-linecap="round"><line x1="${x - 8}" y1="${y}" x2="${x + 8}" y2="${y}"/><line x1="${x - 5}" y1="${y + 3.5}" x2="${x + 5}" y2="${y + 3.5}"/><line x1="${x - 2}" y1="${y + 7}" x2="${x + 2}" y2="${y + 7}"/></g>`;
const box = (x: number, y: number, w: number, h: number, col = CAP) =>
  `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="3" fill="#fff" stroke="${col}" stroke-width="2"/>`;

/** the guided example: V0 = 6 V + R1 = 2 Ω + L = 1 H; v1 = 10 cos 2t V + C = 0.25 F; i2 = 5 cos 4t A; R_L = 4 Ω */
export const SVG_GUIDED = svg(
  540,
  178,
  '引导例题电路：直流源、两个不同频率的交流源与负载接在同一节点 v_o',
  [
    wire('M 50 42 H 84 M 128 42 H 146 M 194 42 H 470 M 50 132 H 470'),
    gnd(250, 133),
    // branch 1: V0, R1, L
    wire('M 50 42 V 73 M 50 101 V 132'),
    vsrc(50, 87),
    t(72, 92, `V${sub('0')} = 6 V`, DC_T, 'start', 11),
    resH(84, 128, 42),
    t(106, 28, `R${sub('1')} = 2 Ω`, RES_T, 'middle', 11),
    coil(146, 194, 42),
    t(170, 28, 'L = 1 H', IND_T, 'middle', 11),
    dot(230, 42, '#a16207'),
    t(230, 28, `v${sub('o')}(t)`, '#a16207', 'middle', 12),
    // branch 2: C over v1
    wire('M 270 42 V 59.5 M 270 66.5 V 80 M 270 106 V 132'),
    capV(270, 63),
    t(286, 67, 'C = 0.25 F', CAP_T, 'start', 11),
    acsrc(270, 93),
    t(286, 97, `v${sub('1')} = 10cos(2t) V`, W1_T, 'start', 11),
    // branch 3: i2
    wire('M 410 42 V 73 M 410 101 V 132'),
    isrc(410, 87),
    t(410, 154, `i${sub('2')} = 5cos(4t) A`, W2_T, 'middle', 11),
    // branch 4: R_L
    wire('M 470 42 V 64 M 470 110 V 132'),
    resV(470, 64, 110),
    t(482, 92, `R${sub('L')} = 4 Ω`, RES_T, 'start', 11),
    t(270, 170, `求稳态输出 v${sub('o')}(t)`, MUTED, 'middle', 11, 600),
  ].join(''),
  540,
);

/** Q1: two phasors that turn at different speeds */
export const SVG_Q1 = svg(
  380,
  170,
  '两个不同频率的输出相量：v(t) 应如何写？',
  [
    `<line x1="40" y1="100" x2="200" y2="100" stroke="${MUTED}" stroke-width="1"/>`,
    `<line x1="110" y1="30" x2="110" y2="160" stroke="${MUTED}" stroke-width="1"/>`,
    t(204, 104, 'Re', MUTED, 'start', 10, 600),
    `<line x1="110" y1="100" x2="176" y2="100" stroke="${W1}" stroke-width="3"/><polygon points="180,100 171,95 171,105" fill="${W1}"/>`,
    `<line x1="110" y1="100" x2="110" y2="38" stroke="${W2}" stroke-width="3"/><polygon points="110,34 105,43 115,43" fill="${W2}"/>`,
    `<path d="M 162 70 A 55 55 0 0 0 140 54" fill="none" stroke="${W1}" stroke-width="1.6" stroke-dasharray="3 2"/>`,
    `<path d="M 80 52 A 55 55 0 0 0 60 75" fill="none" stroke="${W2}" stroke-width="1.6" stroke-dasharray="3 2"/>`,
    t(178, 122, `V${sub('1')} = 10∠0°`, W1_T, 'middle', 11),
    t(46, 34, `V${sub('2')} = 10∠90°`, W2_T, 'start', 11),
    t(230, 52, `ω${sub('1')} = 2 rad/s`, W1_T, 'start', 11),
    t(230, 72, `ω${sub('2')} = 5 rad/s`, W2_T, 'start', 11),
    t(230, 112, '两个指针转速不同', MUTED, 'start', 11, 600),
    t(230, 140, 'v(t) = ?', INK, 'start', 14),
  ].join(''),
  380,
);

/** Q2: the practical voltage source to transform */
export const SVG_Q2 = svg(
  420,
  150,
  '把电压源串联复阻抗变换为电流源并联复阻抗：I_s 与 Z_p 各是多少？',
  [
    wire('M 40 40 H 76 M 136 40 H 170 M 40 116 H 170 M 40 40 V 64 M 40 92 V 116'),
    vsrc(40, 78),
    t(14, 136, `V${sub('s')} = 12∠30° V`, DC_T, 'start', 11),
    box(106, 40, 60, 16),
    t(106, 26, `Z${sub('s')} = 3 + j4 Ω`, CAP_T, 'middle', 11),
    port(170, 40, 'a'),
    port(170, 116, 'b'),
    `<line x1="196" y1="78" x2="232" y2="78" stroke="${RES}" stroke-width="2.4"/><polygon points="236,78 227,73 227,83" fill="${RES}"/><polygon points="192,78 201,73 201,83" fill="${RES}"/>`,
    wire('M 262 40 H 380 M 262 116 H 380 M 262 40 V 64 M 262 92 V 116 M 322 40 V 60 M 322 96 V 116'),
    isrc(262, 78, RES),
    box(322, 78, 16, 36),
    t(262, 136, `I${sub('s')} = ?`, DC_T, 'middle', 12),
    t(334, 82, `Z${sub('p')} = ?`, CAP_T, 'start', 12),
    port(380, 40, 'a'),
    port(380, 116, 'b'),
  ].join(''),
  420,
);

/** Q3: the 1∠0° V test source and its measured current */
export const SVG_Q3 = svg(
  420,
  150,
  '外加 1∠0° V 测试源测得 I_t：Z_Th 是多少？',
  [
    `<rect x="20" y="24" width="160" height="104" rx="10" fill="#fff" stroke="${DEP}" stroke-width="1.8" stroke-dasharray="5 3"/>`,
    t(100, 46, '含受控源网络', DEP_T, 'middle', 12),
    t(100, 64, '独立源已置零', MUTED, 'middle', 11, 600),
    isrc(100, 96, DEP, true),
    wire('M 180 44 H 330 M 180 112 H 330 M 330 44 V 64 M 330 92 V 112'),
    port(220, 44, 'a'),
    port(220, 112, 'b'),
    vsrc(330, 78, W1, W1_T),
    t(352, 74, `V${sub('t')}`, W1_T, 'start', 12),
    t(352, 90, '1∠0° V', W1_T, 'start', 11),
    `<line x1="300" y1="32" x2="262" y2="32" stroke="${W1}" stroke-width="2.2"/><polygon points="258,32 266,27.5 266,36.5" fill="${W1}"/>`,
    t(280, 24, `I${sub('t')} = 0.1 − j0.1 A`, W1_T, 'middle', 11),
    t(100, 146, `Z${sub('Th')} = ?`, INK, 'middle', 13),
  ].join(''),
  420,
);

/** Q4: the inverting amplifier with R_f ∥ C_f at ω = 1000 rad/s */
export const SVG_Q4 = svg(
  420,
  160,
  '反相交流运放：A_v 是多少？',
  [
    // feedback
    wire('M 150 24 H 223.5 M 230.5 24 H 290 M 150 52 H 196 M 244 52 H 290 M 150 24 V 86 M 290 24 V 100'),
    capH(227, 24),
    t(252, 18, `C${sub('f')} = 0.1 µF`, CAP_T, 'start', 11),
    resH(196, 244, 52),
    t(154, 45, `R${sub('f')} = 10 kΩ`, RES_T, 'start', 11),
    // input
    `<circle cx="30" cy="86" r="5" fill="#fff" stroke="${CAP}" stroke-width="2"/>`,
    t(30, 74, `V${sub('i')}`, CAP_T, 'middle', 12),
    wire('M 35 86 H 64 M 112 86 H 196'),
    resH(64, 112, 86),
    t(88, 74, `R${sub('1')} = 2 kΩ`, RES_T, 'middle', 11),
    dot(150, 86),
    // op amp
    `<polygon points="196,70 196,130 256,100" fill="#fff" stroke="${RES}" stroke-width="2.4"/>`,
    t(204, 90, '−', DC_T, 'middle', 13, 800),
    t(204, 124, '+', DC_T, 'middle', 13, 800),
    wire('M 196 120 H 176 V 140'),
    gnd(176, 140),
    wire('M 256 100 H 330'),
    dot(290, 100),
    `<circle cx="335" cy="100" r="5" fill="#fff" stroke="${W1}" stroke-width="2"/>`,
    t(335, 88, `V${sub('o')}`, W1_T, 'middle', 12),
    t(300, 136, 'ω = 1000 rad/s', INK, 'middle', 11),
    t(300, 152, `A${sub('v')} = V${sub('o')}/V${sub('i')} = ?`, INK, 'middle', 12),
  ].join(''),
  420,
);
