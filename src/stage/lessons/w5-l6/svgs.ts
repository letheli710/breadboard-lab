// The W5-L6 act diagrams and guided-step diagrams: the sheet's SVGs (sheetSvgs.ts), drawn for a
// dark canvas and recoloured for the light theme by lightSvg, plus the quiz figures (drawn here for
// the light theme). Changes to the sheet's drawings:
// - a symbol written with an underscore in the diagram text (V_rms, Q_C, S_total, I_line …) gets
//   its subscript set low and small (the words are unchanged);
// - act 4 (the compressed triangle): the sheet drew P at 80 px/kW but Q at 60 px/kVAR, so the
//   drawn angles were 29.4° and 13.9° under labels θ1 = 36.87° and θ2 = 18.19°; the triangle now
//   uses 60 px per kW and per kVAR (P = 240 px), so the angles are the labelled ones;
// - guided steps 1–3: the same (the triangles were 170 px wide and 72 / 32 px tall, i.e. 22.9° and
//   10.7° under the labels 36.87° and 18.19°); now P = 120 px, Q1 = 90 px, Q2 = 39.4 px;
// - anti-spoiler: the act 5 wiring diagram printed the guided example's answers (I_line 104.2 →
//   87.7 A, C = 388.05 µF, Q_C = −8.43 kVAR) before the example: SVG_ACT5_ASKED shows them as "?",
//   the full diagram (SVG_ACT5) follows the guided block as its review; the step 5 diagram printed
//   that step's answers (104.17 A, 87.72 A, 29.09 %, and the 87.72 A bar's length): they are "?".

import { lightSvg } from '../../svgTheme';
import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_MINI1, SHEET_MINI2, SHEET_MINI3, SHEET_MINI4, SHEET_MINI5 } from './sheetSvgs';

/** replace `a` by `b`, and fail loudly when the sheet text has changed under us */
function must(s: string, a: string, b: string): string {
  if (!s.includes(a)) throw new Error(`W5-L6 svgs: "${a}" not found`);
  return s.split(a).join(b);
}
const edits = (s: string, pairs: [string, string][]) => pairs.reduce((acc, [a, b]) => must(acc, a, b), s);

/** set the subscript of underscore symbols in <text> low and small: "V_rms" → V, rms (sub) */
export function subText(svg: string): string {
  return svg.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (_m, open: string, body: string, close: string) => {
    const parts = body.split(/(?<=[A-Za-z])_([A-Za-z0-9]+)/);
    if (parts.length === 1) return open + body + close;
    let out = parts[0];
    for (let i = 1; i < parts.length; i += 2) out += `<tspan dy="3" font-size="78%">${parts[i]}</tspan><tspan dy="-3">${parts[i + 1] || '&#8203;'}</tspan>`;
    return open + out + close;
  });
}

function sheet(svg: string, label: string): string {
  // #e9d5ff (pale lavender text) is not in lightSvg's table and stays unreadable on white
  return subText(lightSvg(svg.replace('<svg ', `<svg role="img" aria-label="${label}" `).replace(/fill="#e9d5ff"/g, 'fill="#6b21a8"')));
}

export const SVG_ACT1 = sheet(SHEET_ACT1, '啤酒杯功率直觉与滞后/超前相量判别');
export const SVG_ACT2 = sheet(SHEET_ACT2, '感性（滞后）与容性（超前）功率三角形对照');
export const SVG_ACT3 = sheet(SHEET_ACT3, '多负载复功率首尾相接矢量合成');

/** act 4, with the triangle at equal scales (60 px per kW and per kVAR) */
export const SVG_ACT4 = sheet(
  edits(SHEET_ACT4, [
    ['points="75,265 395,265 395,85"', 'points="75,265 315,265 315,85"'],
    ['points="75,265 395,265 395,186"', 'points="75,265 315,265 315,186"'],
    ['x1="75" y1="265" x2="391" y2="265"', 'x1="75" y1="265" x2="311" y2="265"'],
    ['<text x="235" y="285"', '<text x="195" y="285"'],
    ['x1="395" y1="265" x2="395" y2="186"', 'x1="315" y1="265" x2="315" y2="186"'],
    ['<text x="405" y="232"', '<text x="325" y="232"'],
    ['<text x="405" y="247"', '<text x="325" y="247"'],
    ['x1="395" y1="85" x2="395" y2="181"', 'x1="315" y1="85" x2="315" y2="181"'],
    ['<text x="405" y="130"', '<text x="325" y="130"'],
    ['<text x="405" y="146"', '<text x="325" y="146"'],
    ['x1="75" y1="265" x2="390" y2="88"', 'x1="75" y1="265" x2="311" y2="88"'],
    [
      '<text x="210" y="160" fill="#fb7185" font-size="12" font-weight="bold" transform="rotate(-29.4 210 160)">',
      '<text x="144" y="201" fill="#fb7185" font-size="12" font-weight="bold" transform="rotate(-36.87 144 201)">',
    ],
    ['x1="75" y1="265" x2="390" y2="187"', 'x1="75" y1="265" x2="310" y2="187"'],
    [
      '<text x="235" y="218" fill="#6ee7b7" font-size="12" font-weight="bold" transform="rotate(-13.8 235 218)">',
      '<text x="141" y="235" fill="#6ee7b7" font-size="11.5" font-weight="bold" transform="rotate(-18.19 141 235)">',
    ],
    ['d="M 140 265 A 65 65 0 0 0 132 233"', 'd="M 140 265 A 65 65 0 0 0 127 226"'],
    ['<text x="148" y="232" fill="#fb7185" font-size="11">', '<text x="120" y="216" fill="#fb7185" font-size="11" text-anchor="end">'],
    ['d="M 175 265 A 100 100 0 0 0 172 241"', 'd="M 175 265 A 100 100 0 0 0 170 234"'],
  ]),
  '并联电容校正前后功率三角形压缩对比',
);

const ASKED: [string, string][] = [
  ['>I_line: 104.2 → 87.7 A<', '>I_line: ? → ? A<'],
  ['>388.05 µF<', '>C = ? µF<'],
  ['>Q_C = -8.43 kVAR<', '>Q_C = ?<'],
];
/** act 5's wiring diagram with the guided example's answers asked (shown before the example) */
export const SVG_ACT5_ASKED = sheet(edits(SHEET_ACT5, ASKED), '工厂 20 kW 感性车间并联电容校正接线图（待求量为 ?）');
/** the full diagram, after the guided example */
export const SVG_ACT5 = sheet(SHEET_ACT5, '工厂 20 kW 感性车间并联电容校正接线图');

const mini = (s: string) => subText(lightSvg(s)).replace('<svg ', '<svg style="max-width:380px" ');

/** steps 1–3 at equal scales: P = 120 px, Q1 = 0.75 P = 90 px, Q2 = 0.3287 P = 39.4 px */
export const MINI_STEP1 = mini(
  edits(SHEET_MINI1, [
    ['points="30,98 200,98 200,26"', 'points="30,98 150,98 150,8"'],
    ['x1="30" y1="98" x2="200" y2="98"', 'x1="30" y1="98" x2="150" y2="98"'],
    ['<text x="115" y="113"', '<text x="90" y="113"'],
    ['<text x="208" y="66"', '<text x="158" y="58"'],
  ]),
);
export const MINI_STEP2 = mini(
  edits(SHEET_MINI2, [
    ['points="30,98 200,98 200,26"', 'points="30,98 150,98 150,8"'],
    ['points="30,98 200,98 200,66"', 'points="30,98 150,98 150,59"'],
    ['<text x="115" y="113"', '<text x="90" y="113"'],
    ['<text x="206" y="86"', '<text x="156" y="82"'],
  ]),
);
export const MINI_STEP3 = mini(
  edits(SHEET_MINI3, [
    ['x1="30" y1="98" x2="195" y2="98"', 'x1="30" y1="98" x2="150" y2="98"'],
    ['x1="195" y1="98" x2="195" y2="66"', 'x1="150" y1="98" x2="150" y2="59"'],
    ['x1="195" y1="24" x2="195" y2="62"', 'x1="150" y1="8" x2="150" y2="51"'],
    ['points="191,58 199,58 195,66"', 'points="146,51 154,51 150,59"'],
    ['<text x="204" y="48"', '<text x="158" y="36"'],
  ]),
);
export const MINI_STEP4 = mini(SHEET_MINI4);
/** step 5: I1, I2 and the loss drop asked */
export const MINI_STEP5 = mini(
  edits(SHEET_MINI5, [
    ['>104.17 A<', '>? A<'],
    [
      '<rect x="16" y="78" width="177" height="16" rx="3" fill="#10b981"/>',
      '<rect x="16" y="78" width="210" height="16" rx="3" fill="#1e293b" stroke="#94a3b8" stroke-dasharray="3,3"/>',
    ],
    ['<text x="188" y="90"', '<text x="220" y="90"'],
    ['>87.72 A<', '>? A<'],
    ['>线损降幅 = 29.09%<', '>线损降幅 = ?<'],
  ]),
);

/* ------------------------------------------------------------------ quiz figures (light theme) */

const INK = '#1f2a44';
const MUTED = '#5f626b';
const BLUE = '#0369a1';
const AMBER = '#b45309';
const GREEN = '#047857';
const ROSE = '#be123c';
const PURPLE = '#7e22ce';
const FONT = `font-family="ui-sans-serif, system-ui, 'PingFang SC', sans-serif"`;

const t = (x: number, y: number, s: string, fill = INK, anchor = 'middle', size = 12, weight = 700) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const sub = (s: string) => `<tspan dy="3" font-size="78%">${s}</tspan><tspan dy="-3">&#8203;</tspan>`;
const svg = (w: number, h: number, label: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:440px"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10" fill="#fbf7ef" stroke="#e3d8c2"/>${body}</svg>`;
const arrow = (x1: number, y1: number, x2: number, y2: number, c: string, w = 2.6) => {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const bx = x2 - ux * 9;
  const by = y2 - uy * 9;
  return `<line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/><polygon points="${x2},${y2} ${(bx - uy * 4).toFixed(1)},${(by + ux * 4).toFixed(1)} ${(bx + uy * 4).toFixed(1)},${(by - ux * 4).toFixed(1)}" fill="${c}"/>`;
};
const at = (cx: number, cy: number, len: number, deg: number) => [cx + len * Math.cos((deg * Math.PI) / 180), cy - len * Math.sin((deg * Math.PI) / 180)] as const;

/** Q1: V = 100∠20°, I = 5∠−10° on a phasor diagram; S and the load's nature asked */
export const SVG_Q1 = (() => {
  const [vx, vy] = at(60, 92, 150, 20);
  const [ix, iy] = at(60, 92, 110, -10);
  return svg(
    360,
    150,
    '电压相量 100∠20° V 与电流相量 5∠−10° A：复功率是多少？',
    [
      `<line x1="40" y1="92" x2="240" y2="92" stroke="#cbd5e1" stroke-dasharray="4 3"/><line x1="60" y1="20" x2="60" y2="136" stroke="#cbd5e1" stroke-dasharray="4 3"/>`,
      arrow(60, 92, vx, vy, '#0284c7', 3),
      t(vx + 6, vy, `V${sub('rms')} = 100∠20° V`, BLUE, 'start', 11.5),
      arrow(60, 92, ix, iy, '#d97706', 3),
      t(ix + 6, iy + 12, `I${sub('rms')} = 5∠−10° A`, AMBER, 'start', 11.5),
      t(150, 140, '（均为有效值相量）', MUTED, 'middle', 10, 600),
      `<rect x="262" y="52" width="86" height="50" rx="8" fill="#fff" stroke="#94a3b8" stroke-dasharray="3 3"/>`,
      t(305, 74, 'S = ?', ROSE, 'middle', 14, 800),
      t(305, 93, '滞后还是超前？', MUTED, 'middle', 10, 600),
    ].join(''),
  );
})();

/** Q2: two loads on one bus (8 kVA at 0.8 lagging, 5 kVA at 0.6 leading); S_total asked */
export const SVG_Q2 = svg(
  360,
  140,
  '同一母线上并联的两个负载：总视在功率是多少？',
  [
    `<line x1="30" y1="30" x2="330" y2="30" stroke="${INK}" stroke-width="2.2"/><line x1="30" y1="122" x2="330" y2="122" stroke="${INK}" stroke-width="2.2"/>`,
    t(30, 22, '母线', MUTED, 'start', 10, 600),
    `<line x1="110" y1="30" x2="110" y2="52" stroke="${INK}" stroke-width="2"/><line x1="110" y1="100" x2="110" y2="122" stroke="${INK}" stroke-width="2"/>`,
    `<rect x="62" y="52" width="96" height="48" rx="8" fill="#fff" stroke="#d97706" stroke-width="2"/>`,
    t(110, 71, '负载 A', AMBER, 'middle', 12),
    t(110, 90, '8 kVA · 0.8 滞后', AMBER, 'middle', 10.5, 600),
    `<line x1="230" y1="30" x2="230" y2="52" stroke="${INK}" stroke-width="2"/><line x1="230" y1="100" x2="230" y2="122" stroke="${INK}" stroke-width="2"/>`,
    `<rect x="182" y="52" width="96" height="48" rx="8" fill="#fff" stroke="#059669" stroke-width="2"/>`,
    t(230, 71, '负载 B', GREEN, 'middle', 12),
    t(230, 90, '5 kVA · 0.6 超前', GREEN, 'middle', 10.5, 600),
    `<rect x="290" y="56" width="62" height="40" rx="8" fill="#fff" stroke="#94a3b8" stroke-dasharray="3 3"/>`,
    t(321, 74, `S${sub('total')}`, ROSE, 'middle', 12, 800),
    t(321, 90, '= ?', ROSE, 'middle', 12, 800),
  ].join(''),
);

/** Q3: a motor with a capacitor bank across a constant-voltage bus; which quantity stays? */
export const SVG_Q3 = svg(
  360,
  150,
  '恒压母线上感性电机两端并联电容器：哪个量不变？',
  [
    `<circle cx="40" cy="80" r="17" fill="#fff" stroke="#0284c7" stroke-width="2"/><path d="M 30 80 Q 35 70 40 80 T 50 80" fill="none" stroke="#0284c7" stroke-width="1.8"/>`,
    t(40, 112, '恒压母线', BLUE, 'middle', 10, 600),
    `<polyline points="40,63 40,30 330,30 330,48" fill="none" stroke="${INK}" stroke-width="2"/><polyline points="40,97 40,132 330,132 330,112" fill="none" stroke="${INK}" stroke-width="2"/>`,
    arrow(70, 20, 110, 20, ROSE, 2.2),
    t(116, 24, `I${sub('line')} ?`, ROSE, 'start', 11),
    `<line x1="210" y1="30" x2="210" y2="72" stroke="#9333ea" stroke-width="2"/><line x1="194" y1="72" x2="226" y2="72" stroke="#9333ea" stroke-width="3"/><line x1="194" y1="82" x2="226" y2="82" stroke="#9333ea" stroke-width="3"/><line x1="210" y1="82" x2="210" y2="132" stroke="#9333ea" stroke-width="2"/>`,
    t(190, 80, '电容器组', PURPLE, 'end', 10.5),
    `<rect x="272" y="48" width="76" height="64" rx="8" fill="#fff" stroke="#d97706" stroke-width="2"/>`,
    t(310, 72, '感性电机', AMBER, 'middle', 11.5),
    t(310, 90, 'pf 0.75 → 0.95', AMBER, 'middle', 10, 600),
    t(310, 104, '（滞后）', AMBER, 'middle', 9.5, 600),
    t(120, 66, `S${sub('total')} ?`, ROSE, 'middle', 11),
    t(120, 86, 'P ?', BLUE, 'middle', 11),
    t(120, 106, `I${sub('line')}²R${sub('line')} ?`, ROSE, 'middle', 11),
  ].join(''),
);

/** Q4: the power triangle of the 10 kW load, pf 0.70 → 0.95 at 220 V, 50 Hz; C asked */
export const SVG_Q4 = (() => {
  const ox = 30;
  const oy = 132;
  const Pp = 110; // P = 10 kW → 110 px (equal scales: Q1 = 1.02 P, Q2 = 0.33 P)
  const q1 = Pp * Math.tan(Math.acos(0.7));
  const q2 = Pp * Math.tan(Math.acos(0.95));
  return svg(
    360,
    150,
    '10 kW 感性负载从 pf 0.70 校正到 0.95（220 V、50 Hz）：需要多大电容？',
    [
      `<polygon points="${ox},${oy} ${ox + Pp},${oy} ${ox + Pp},${(oy - q1).toFixed(1)}" fill="#e11d48" fill-opacity="0.07" stroke="#e11d48" stroke-width="1.6" stroke-dasharray="6 4"/>`,
      `<polygon points="${ox},${oy} ${ox + Pp},${oy} ${ox + Pp},${(oy - q2).toFixed(1)}" fill="#059669" fill-opacity="0.14" stroke="#059669" stroke-width="2"/>`,
      arrow(ox, oy, ox + Pp, oy, '#0284c7', 3),
      t(ox + Pp / 2, oy + 15, 'P = 10 kW', BLUE, 'middle', 11),
      arrow(ox + Pp + 10, oy - q1, ox + Pp + 10, oy - q2, '#9333ea', 3),
      t(ox + Pp + 16, Math.round(oy - (q1 + q2) / 2 + 4), `Q${sub('C')} = ?`, PURPLE, 'start', 11.5, 800),
      t(ox + 30, oy - 50, 'pf 0.70', ROSE, 'end', 10.5),
      t(ox + 52, oy - 6, 'pf 0.95', GREEN, 'start', 10.5),
      `<rect x="250" y="40" width="98" height="64" rx="8" fill="#fff" stroke="#94a3b8" stroke-dasharray="3 3"/>`,
      t(299, 62, '220 V · 50 Hz', MUTED, 'middle', 10.5, 600),
      t(299, 88, 'C = ? µF', PURPLE, 'middle', 14, 800),
    ].join(''),
  );
})();
