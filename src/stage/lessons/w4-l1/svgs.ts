// W4-L1 diagrams. The sheet's own SVGs (sheetSvgs.ts) go through `fix` (the swaps listed there)
// and the shared `lightSvg`; the figures added for this lesson (the water-tank analogy, the
// example 1 and example 3 diagrams, the self-test figures) are drawn here for the light theme
// directly and do not go through lightSvg.

import { lightSvg } from '../../svgTheme';
import { SHEET_FIG11, SHEET_FIG21, SHEET_FIG31, SHEET_FIG41, SHEET_FIG51, SHEET_MINI2, SHEET_MINI3, SHEET_MINI4, SHEET_MINI5 } from './sheetSvgs';

/** Text swaps before `lightSvg`; each must be found (a sheet change shows up as an error). */
function fix(svg: string, swaps: [string, string][] = []): string {
  let s = svg;
  for (const [a, b] of swaps) {
    if (!s.includes(a)) throw new Error(`W4-L1 svg fix not found: ${a}`);
    s = s.split(a).join(b);
  }
  // colours the shared light mapping does not know yet: the sheet's yellow labels (#fde047) and
  // lines (#facc15) and its light-orange labels (#fdba74) would stay pale on white
  return lightSvg(
    s
      .replace(/fill=(["'])#fde047\1/g, 'fill=$1#a16207$1')
      .replace(/stroke=(["'])#facc15\1/g, 'stroke=$1#ca8a04$1')
      .replace(/fill=(["'])#fdba74\1/g, 'fill=$1#c2410c$1'),
  );
}

/** figure 1-1: the labels printed on the coloured plates and on the blue can stay white (`#ffffff`
 *  would turn ink); the "25 V" on the can stays yellow; "电场 E" moves off the dipole */
export const SVG_FIG11 = fix(SHEET_FIG11, [
  // the sheet put "电场 E" on top of the left dipole: it moves between two field lines
  ['<text x="155" y="190" fill="#fde047"', '<text x="212" y="190" fill="#fde047"'],
  ['fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold">+ ', 'fill="#fefefe" font-family="monospace" font-size="13" font-weight="bold">+ '],
  ['fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold">- ', 'fill="#fefefe" font-family="monospace" font-size="13" font-weight="bold">- '],
  [
    'fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">100 μF',
    'fill="#fefefe" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">100 μF',
  ],
  [
    'fill="#fde047" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">25 V',
    'fill="#fde048" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">25 V',
  ],
]);
export const SVG_FIG21 = fix(SHEET_FIG21);
export const SVG_FIG31 = fix(SHEET_FIG31);
export const SVG_FIG41 = fix(SHEET_FIG41);
export const SVG_FIG51 = fix(SHEET_FIG51);

/** guided step 1: the sheet's mini drew C2 already as an open circuit with "C2 开路" — the step's
 *  answer. Drawn here with C2 as a capacitor and the question left open. */
export const MINI_STEP1 = lightSvg(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 110' width='320' height='110'><rect width='320' height='110' rx='8' fill='#1e293b'/><text x='16' y='24' fill='#a16207' font-family='sans-serif' font-size='12' font-weight='bold'>步骤 1：识别 R5 与 C2 串联支路</text><line x1='30' y1='62' x2='90' y2='62' stroke='#cbd5e1' stroke-width='2'/><rect x='90' y='52' width='56' height='20' fill='#334155' stroke='#ca8a04' stroke-width='1.5'/><text x='118' y='46' fill='#a16207' font-family='sans-serif' font-size='11' text-anchor='middle'>R5=2kΩ</text><line x1='146' y1='62' x2='214' y2='62' stroke='#f97316' stroke-width='2'/><line x1='214' y1='48' x2='214' y2='76' stroke='#f97316' stroke-width='3'/><line x1='226' y1='48' x2='226' y2='76' stroke='#f97316' stroke-width='3'/><text x='220' y='42' fill='#c2410c' font-family='sans-serif' font-size='11' text-anchor='middle'>C2=200μF</text><line x1='226' y1='62' x2='290' y2='62' stroke='#cbd5e1' stroke-width='2'/><text x='160' y='96' fill='#c2410c' font-family='sans-serif' font-size='11' text-anchor='middle'>直流稳态：C2 等效为？ iR5 = ?</text></svg>`,
);
/** guided step 2: "Rpar = 3k || 6k = 2 kΩ" is half the step's answer: it reads "= ?" */
export const MINI_STEP2 = fix(SHEET_MINI2, [['Rpar = 3k || 6k = 2 kΩ', 'Rpar = 3k || 6k = ?']]);
export const MINI_STEP3 = fix(SHEET_MINI3);
/** guided step 4: the sheet's mini wrote the answer ("vR5 = 0 V", "VC2 = V2"): it asks instead */
export const MINI_STEP4 = fix(SHEET_MINI4, [
  ['因 iR5 = 0 ⇒ vR5 = 0 V', 'vR5 = iR5 · R5 = ?'],
  ['故 VC2 = V2 - vR5 = V2', 'VC2 = V2 − vR5 = ?'],
]);
export const MINI_STEP5 = fix(SHEET_MINI5);

/* ------------------------------------------------------------- added figures (light theme) */

const HEAD = (w: number, h: number, label: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}"><rect x="0" y="0" width="${w}" height="${h}" rx="12" fill="#fbf7ef"/>`;
const T = (x: number, y: number, s: string, o: { size?: number; fill?: string; bold?: boolean; anchor?: string; mono?: boolean } = {}) =>
  `<text x="${x}" y="${y}" fill="${o.fill ?? '#1f2a44'}" font-family="${o.mono ? 'monospace' : 'sans-serif'}" font-size="${o.size ?? 12}"${o.bold ? ' font-weight="bold"' : ''}${o.anchor ? ` text-anchor="${o.anchor}"` : ''}>${s}</text>`;
const MARK = `<defs><marker id="w41a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#1d4ed8"/></marker></defs>`;

/** act 1: Boylestad's elastic-membrane water tank */
export const SVG_TANK =
  HEAD(600, 230, '弹性隔膜水箱类比：水流进左侧、隔膜鼓起、右侧等量流出') +
  MARK +
  T(20, 30, '弹性隔膜水箱：电子穿不过隔膜，但左边进多少、右边就出多少', { size: 15, bold: true }) +
  `<rect x="40" y="80" width="520" height="70" fill="#dbeafe" stroke="#475569" stroke-width="2"/>` +
  `<path d="M300 80 Q 352 115 300 150" fill="none" stroke="#be123c" stroke-width="4"/>` +
  `<path d="M60 115 h70" stroke="#1d4ed8" stroke-width="3" marker-end="url(#w41a)"/>` +
  `<path d="M440 115 h70" stroke="#1d4ed8" stroke-width="3" marker-end="url(#w41a)"/>` +
  `<rect x="6" y="96" width="34" height="38" rx="6" fill="#ffffff" stroke="#475569" stroke-width="2"/>` +
  T(23, 120, '泵', { size: 13, bold: true, anchor: 'middle' }) +
  T(60, 70, '水泵（电源）把水压进来', { size: 12, fill: '#1d4ed8' }) +
  T(400, 70, '右边被挤出等量的水', { size: 12, fill: '#1d4ed8' }) +
  T(330, 108, '隔膜鼓起', { size: 12, bold: true, fill: '#be123c' }) +
  T(330, 124, '（电介质 + 电场）', { size: 11, fill: '#be123c' }) +
  T(40, 178, '水滴（电子）无法穿透隔膜 → 外面看却有“充电电流”流进流出', { size: 12 }) +
  T(40, 198, '隔膜越绷越紧，反推力（电压 v）越大；等于泵压时水流停止（直流稳态开路）', { size: 12 }) +
  T(40, 218, '能量完完整整存在绷紧的隔膜（电场）里', { size: 12, bold: true, fill: '#15803d' }) +
  `</svg>`;

/** act 1 · example 1: the same plates, air then mica */
function plates(x: number, label: string, er: string, fill: string): string {
  return (
    `<rect x="${x}" y="70" width="200" height="12" rx="2" fill="#ef4444"/>` +
    `<rect x="${x + 6}" y="84" width="188" height="56" fill="${fill}" stroke="#94a3b8" stroke-dasharray="5,3"/>` +
    `<rect x="${x}" y="142" width="200" height="12" rx="2" fill="#3b82f6"/>` +
    T(x + 100, 116, er, { size: 13, bold: true, anchor: 'middle', fill: '#6d28d9' }) +
    T(x + 100, 56, label, { size: 13, bold: true, anchor: 'middle' }) +
    `<line x1="${x - 14}" y1="82" x2="${x - 14}" y2="142" stroke="#475569" stroke-width="1.5"/>` +
    `<line x1="${x - 20}" y1="82" x2="${x - 8}" y2="82" stroke="#475569" stroke-width="1.5"/>` +
    `<line x1="${x - 20}" y1="142" x2="${x - 8}" y2="142" stroke="#475569" stroke-width="1.5"/>` +
    T(x - 30, 116, 'd', { size: 13, bold: true, anchor: 'middle' })
  );
}
export const SVG_EX1 =
  HEAD(600, 210, '例题 1：同一对平行板，先空气后云母') +
  T(20, 30, '例题 1：A = 20 cm²、d = 1 mm 不变，只换电介质', { size: 15, bold: true }) +
  plates(70, '空气 εr1 = 1', 'εr = 1', '#f1f5f9') +
  plates(350, '云母 εr2 = 5', 'εr = 5', '#ede9fe') +
  T(300, 186, '几何尺寸一毫米没动：C ∝ εr', { size: 13, bold: true, anchor: 'middle', fill: '#15803d' }) +
  `</svg>`;

/** act 2 · example 3: the current steps and the voltage they build up from v(0) = 2 V */
export const SVG_EX3 = (() => {
  const X = (ms: number) => 80 + ms * 48;
  const Yv = (v: number) => 120 - v * 22;
  const Yi = (mA: number) => 210 - mA * 2.6;
  return (
    HEAD(600, 290, '例题 3：分段恒定电流积分得到电压，从初值 2 V 出发') +
    T(20, 28, '例题 3：C = 50 μF，v(0) = 2 V；电流分段恒定，电压从初值出发逐段累积', { size: 14, bold: true }) +
    `<line x1="80" y1="40" x2="80" y2="132" stroke="#5f626b"/><line x1="80" y1="120" x2="${X(10) + 10}" y2="120" stroke="#5f626b"/>` +
    T(20, 60, 'v(t) [V]', { size: 12, bold: true, fill: '#0369a1' }) +
    `<polyline points="${X(0)},${Yv(2)} ${X(4)},${Yv(3.2)} ${X(10)},${Yv(2)}" fill="none" stroke="#0284c7" stroke-width="3"/>` +
    `<line x1="${X(0)}" y1="${Yv(2)}" x2="${X(10)}" y2="${Yv(2)}" stroke="#94a3b8" stroke-dasharray="4,4"/>` +
    T(70, Yv(2) + 4, '2', { size: 11, anchor: 'end', mono: true }) +
    T(X(4), Yv(3.2) - 8, 'v(4 ms)', { size: 11, anchor: 'middle', fill: '#0369a1' }) +
    T(X(10), Yv(2) - 8, 'v(10 ms)', { size: 11, anchor: 'end', fill: '#0369a1' }) +
    `<line x1="80" y1="150" x2="80" y2="250" stroke="#5f626b"/><line x1="80" y1="210" x2="${X(10) + 10}" y2="210" stroke="#5f626b"/>` +
    T(20, 160, 'i(t) [mA]', { size: 12, bold: true, fill: '#c2410c' }) +
    `<rect x="${X(0)}" y="${Yi(15)}" width="${X(4) - X(0)}" height="${210 - Yi(15)}" fill="#fed7aa"/>` +
    `<rect x="${X(4)}" y="210" width="${X(10) - X(4)}" height="${Yi(-10) - 210}" fill="#dbeafe"/>` +
    `<polyline points="${X(0)},${Yi(15)} ${X(4)},${Yi(15)}" stroke="#ea580c" stroke-width="3" fill="none"/>` +
    `<polyline points="${X(4)},${Yi(-10)} ${X(10)},${Yi(-10)}" stroke="#ea580c" stroke-width="3" fill="none"/>` +
    `<line x1="${X(4)}" y1="${Yi(15)}" x2="${X(4)}" y2="${Yi(-10)}" stroke="#ea580c" stroke-dasharray="3,3"/>` +
    T(70, Yi(15) + 4, '+15', { size: 11, anchor: 'end', mono: true }) +
    T(70, Yi(-10) + 4, '−10', { size: 11, anchor: 'end', mono: true }) +
    T((X(0) + X(4)) / 2, 200, '充入 +60 μC', { size: 11, bold: true, anchor: 'middle', fill: '#9a3412' }) +
    T((X(4) + X(10)) / 2, 228, '放出 −60 μC', { size: 11, bold: true, anchor: 'middle', fill: '#1e3a8a' }) +
    [0, 4, 10].map((ms) => T(X(ms), 268, `${ms}${ms === 10 ? ' ms' : ''}`, { size: 12, anchor: 'middle', mono: true })).join('') +
    T(560, 284, '面积 = 电荷，别漏加 v(0)', { size: 12, bold: true, anchor: 'end', fill: '#15803d' }) +
    `</svg>`
  );
})();

/* ------------------------------------------------------------- self-test figures */

/** Q1: a 100 μF can between a 9 V rail and GND, which way round and what rating? */
export const SVG_Q1 =
  HEAD(360, 190, '一颗 100 μF 铝电解电容，插在 9 V 与 GND 之间，耐压与方向待选') +
  `<rect x="20" y="22" width="320" height="10" rx="3" fill="#e11d48"/>` +
  T(26, 50, '+9 V 电源轨', { size: 12, bold: true, fill: '#be123c' }) +
  `<rect x="20" y="160" width="320" height="10" rx="3" fill="#2b59c3"/>` +
  T(26, 154, 'GND', { size: 12, bold: true, fill: '#1d4ed8' }) +
  `<rect x="150" y="60" width="60" height="66" rx="8" fill="#1d4ed8"/>` +
  `<ellipse cx="180" cy="61" rx="30" ry="6" fill="#cbd5e1"/>` +
  `<rect x="192" y="66" width="14" height="58" fill="#e2e8f0"/>` +
  T(199, 84, '−', { size: 13, bold: true, anchor: 'middle' }) +
  T(199, 102, '−', { size: 13, bold: true, anchor: 'middle' }) +
  T(199, 120, '−', { size: 13, bold: true, anchor: 'middle' }) +
  T(172, 92, '100μF', { size: 10, bold: true, anchor: 'middle', fill: '#ffffff' }) +
  T(172, 108, '? V', { size: 11, bold: true, anchor: 'middle', fill: '#fde68a' }) +
  `<line x1="168" y1="126" x2="168" y2="150" stroke="#475569" stroke-width="3"/>` +
  `<line x1="196" y1="126" x2="196" y2="142" stroke="#475569" stroke-width="3"/>` +
  `<line x1="120" y1="32" x2="120" y2="160" stroke="#94a3b8" stroke-dasharray="4,4"/>` +
  T(118, 100, '?', { size: 18, bold: true, anchor: 'end', fill: '#b45309' }) +
  `<line x1="240" y1="32" x2="240" y2="160" stroke="#94a3b8" stroke-dasharray="4,4"/>` +
  T(246, 100, '?', { size: 18, bold: true, fill: '#b45309' }) +
  T(270, 84, '6.3 V', { size: 11, fill: '#5f626b' }) +
  T(270, 100, '10 V', { size: 11, fill: '#5f626b' }) +
  T(270, 116, '25 V', { size: 11, fill: '#5f626b' }) +
  `</svg>`;

/** Q2: the 2 V → 10 V ramp in 2 ms, and an impossible vertical jump crossed out */
export const SVG_Q2 =
  HEAD(360, 180, '电容电压 2 ms 内从 2 V 线性升到 10 V；旁边是一条被划掉的垂直跳变') +
  `<line x1="50" y1="20" x2="50" y2="150" stroke="#5f626b"/><line x1="50" y1="150" x2="330" y2="150" stroke="#5f626b"/>` +
  T(14, 30, 'v [V]', { size: 11, bold: true, fill: '#0369a1' }) +
  `<polyline points="60,126 90,126 170,46 210,46" fill="none" stroke="#0284c7" stroke-width="3"/>` +
  T(44, 130, '2', { size: 11, anchor: 'end', mono: true }) +
  T(44, 50, '10', { size: 11, anchor: 'end', mono: true }) +
  T(90, 168, '0', { size: 11, anchor: 'middle', mono: true }) +
  T(170, 168, '2 ms', { size: 11, anchor: 'middle', mono: true }) +
  T(132, 100, 'C = 10 μF', { size: 12, bold: true, fill: '#1f2a44' }) +
  `<polyline points="240,126 270,126 270,46 300,46" fill="none" stroke="#b91c1c" stroke-width="2.5" stroke-dasharray="5,3"/>` +
  `<line x1="255" y1="70" x2="285" y2="100" stroke="#b91c1c" stroke-width="3"/><line x1="285" y1="70" x2="255" y2="100" stroke="#b91c1c" stroke-width="3"/>` +
  T(270, 34, '垂直跳变？', { size: 11, bold: true, anchor: 'middle', fill: '#b91c1c' }) +
  `</svg>`;

/** Q3: two equal 50 μF capacitors in DC steady state, at 4 V and 8 V */
export const SVG_Q3 =
  HEAD(360, 170, '直流稳态下两颗 50 μF 电容，A 两端 4 V，B 两端 8 V') +
  [
    [90, 'A', '4 V'],
    [260, 'B', '8 V'],
  ]
    .map(
      ([x, n, v]) =>
        `<line x1="${x}" y1="30" x2="${x}" y2="72" stroke="#1f2a44" stroke-width="2"/>` +
        `<line x1="${Number(x) - 26}" y1="72" x2="${Number(x) + 26}" y2="72" stroke="#0284c7" stroke-width="4"/>` +
        `<line x1="${Number(x) - 26}" y1="88" x2="${Number(x) + 26}" y2="88" stroke="#0284c7" stroke-width="4"/>` +
        `<line x1="${x}" y1="88" x2="${x}" y2="130" stroke="#1f2a44" stroke-width="2"/>` +
        T(Number(x) + 34, 78, `电容 ${n}`, { size: 12, bold: true }) +
        T(Number(x) + 34, 94, `50 μF · ${v}`, { size: 12, fill: '#0369a1' }) +
        T(Number(x), 150, `i = ?  w = ?`, { size: 12, bold: true, anchor: 'middle', fill: '#b45309' }),
    )
    .join('') +
  T(180, 22, '直流稳态 dv/dt = 0', { size: 12, anchor: 'middle', fill: '#5f626b' }) +
  `</svg>`;

/** Q4: 30 μF and 60 μF in series on 12 V */
export const SVG_Q4 =
  HEAD(360, 170, '30 μF 与 60 μF 串联接 12 V，各分多少电压待求') +
  `<circle cx="50" cy="90" r="18" fill="#ffffff" stroke="#1f2a44" stroke-width="2"/>` +
  T(50, 86, '+', { size: 12, anchor: 'middle', mono: true }) +
  T(50, 102, '−', { size: 12, anchor: 'middle', mono: true }) +
  T(18, 60, '12 V', { size: 12, bold: true, fill: '#a16207' }) +
  `<polyline points="50,72 50,40 150,40" fill="none" stroke="#1f2a44" stroke-width="2"/>` +
  `<line x1="150" y1="24" x2="150" y2="56" stroke="#0284c7" stroke-width="4"/><line x1="162" y1="24" x2="162" y2="56" stroke="#0284c7" stroke-width="4"/>` +
  T(156, 18, '30 μF', { size: 12, bold: true, anchor: 'middle', fill: '#0369a1' }) +
  T(156, 76, 'V1 = ?', { size: 12, bold: true, anchor: 'middle', fill: '#b45309' }) +
  `<line x1="162" y1="40" x2="250" y2="40" stroke="#1f2a44" stroke-width="2"/>` +
  `<line x1="250" y1="24" x2="250" y2="56" stroke="#ea580c" stroke-width="4"/><line x1="262" y1="24" x2="262" y2="56" stroke="#ea580c" stroke-width="4"/>` +
  T(256, 18, '60 μF', { size: 12, bold: true, anchor: 'middle', fill: '#c2410c' }) +
  T(256, 76, 'V2 = ?', { size: 12, bold: true, anchor: 'middle', fill: '#b45309' }) +
  `<polyline points="262,40 320,40 320,140 50,140 50,108" fill="none" stroke="#1f2a44" stroke-width="2"/>` +
  T(190, 128, 'Ceq = ?（初始均未充电）', { size: 12, anchor: 'middle', fill: '#5f626b' }) +
  `</svg>`;

/** the self-test act: the four ideas the questions test */
export const SVG_QUIZ_ACT =
  HEAD(600, 150, '诊断测验的四个核心概念') +
  [
    ['极性与耐压', '白条短脚接低电位', '耐压 ≥ 2 × 电源'],
    ['i = C·dv/dt', '电压不能突变', '电流可以跳变'],
    ['直流稳态', '电容 = 开路', 'w = ½Cv²'],
    ['串联电容', '电荷相等', '反比分压'],
  ]
    .map(
      ([h, a, b], k) =>
        `<rect x="${14 + k * 146}" y="22" width="134" height="110" rx="10" fill="#ffffff" stroke="#e3d8c2" stroke-width="1.5"/>` +
        T(81 + k * 146, 52, h, { size: 14, bold: true, anchor: 'middle', fill: ['#be123c', '#0369a1', '#15803d', '#c2410c'][k] }) +
        T(81 + k * 146, 84, a, { size: 12, anchor: 'middle' }) +
        T(81 + k * 146, 106, b, { size: 12, anchor: 'middle' }),
    )
    .join('') +
  `</svg>`;
