// Diagrams the W4-L6 sheet does not have (drawn for the light theme): the four quiz questions.
// None of them shows its answer: Q1 the four variables at the switching instant, each with "?";
// Q2 the C and L to be replaced, each pointing to "?"; Q3 the replaced capacitor with its given
// current, the slope asked; Q4 the two instants t = 0⁺ and t = ∞, both derivatives asked.

const INK = '#1f2a44';
const MUTED = '#5f626b';
const CAP = '#047857';
const IND = '#6d28d9';
const WARN = '#be123c';
const AMBER = '#b45309';
const FONT = 'font-family="ui-monospace, monospace"';

const t = (x: number, y: number, s: string, fill = INK, anchor = 'middle', size = 12, weight = 700) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const sub = (s: string) => `<tspan dy="3" font-size="78%">${s}</tspan><tspan dy="-3">&#8203;</tspan>`;
const svg = (w: number, h: number, label: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:440px"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10" fill="#fbf7ef" stroke="#e3d8c2"/>${body}</svg>`;

/** Q1: v_C, i_L, i_C, v_L across the switching instant, all with a question mark */
export const SVG_Q1 = svg(
  360,
  130,
  '开关动作瞬间的四个量：哪一组允许跃变？',
  [
    `<line x1="180" y1="18" x2="180" y2="122" stroke="${AMBER}" stroke-width="1.6" stroke-dasharray="4 3"/>`,
    t(180, 14, 't = 0（开关动作）', AMBER, 'middle', 10),
    ...[
      ['v', 'C', CAP, 34],
      ['i', 'L', IND, 58],
      ['i', 'C', WARN, 82],
      ['v', 'L', AMBER, 106],
    ].map(([a, b, c, y]) =>
      [
        t(26, (y as number) + 4, `${a}${sub(b as string)}`, c as string, 'start', 12),
        `<line x1="64" y1="${y}" x2="176" y2="${y}" stroke="${c}" stroke-width="2.4"/>`,
        `<circle cx="180" cy="${y}" r="3.6" fill="#fff" stroke="${c}" stroke-width="2"/>`,
        t(230, (y as number) + 4, '0⁺：连续还是跳？', MUTED, 'start', 10, 600),
        t(206, (y as number) + 5, '?', c as string, 'middle', 14, 800),
      ].join(''),
    ),
  ].join(''),
);

/** Q2: C (v_C(0⁻) = 10 V) and L (i_L(0⁻) = 2 A), each to be replaced by "?" at t = 0⁺ */
export const SVG_Q2 = svg(
  360,
  120,
  't=0⁺ 冻结替换：电容与电感各换成什么？',
  [
    t(180, 20, 't = 0⁺ 冻结替换台', AMBER, 'middle', 12),
    // capacitor
    `<line x1="60" y1="40" x2="60" y2="58" stroke="${CAP}" stroke-width="2"/><line x1="44" y1="58" x2="76" y2="58" stroke="${CAP}" stroke-width="3"/><line x1="44" y1="68" x2="76" y2="68" stroke="${CAP}" stroke-width="3"/><line x1="60" y1="68" x2="60" y2="86" stroke="${CAP}" stroke-width="2"/>`,
    t(60, 104, `v${sub('C')}(0⁻) = 10 V`, CAP, 'middle', 11),
    `<line x1="88" y1="63" x2="122" y2="63" stroke="${INK}" stroke-width="1.6"/><polygon points="128,63 120,59 120,67" fill="${INK}"/>`,
    `<rect x="134" y="46" width="34" height="34" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="3 3"/>`,
    t(151, 69, '?', MUTED, 'middle', 16, 800),
    // inductor
    `<path d="M 200 63 a 7 7 0 0 1 14 0 a 7 7 0 0 1 14 0 a 7 7 0 0 1 14 0 a 7 7 0 0 1 14 0" fill="none" stroke="${IND}" stroke-width="2.4"/>`,
    t(228, 104, `i${sub('L')}(0⁻) = 2 A`, IND, 'middle', 11),
    `<line x1="262" y1="63" x2="296" y2="63" stroke="${INK}" stroke-width="1.6"/><polygon points="302,63 294,59 294,67" fill="${INK}"/>`,
    `<rect x="308" y="46" width="34" height="34" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="3 3"/>`,
    t(325, 69, '?', MUTED, 'middle', 16, 800),
  ].join(''),
);

/** Q3: C = 0.25 F replaced by a 36 V source (+ on top), i_C(0⁺) = −3 A into its + end */
export const SVG_Q3 = svg(
  360,
  130,
  't=0⁺：电容替换为 36 V 电压源，i_C(0⁺) = −3 A 从“+”端流入',
  [
    `<line x1="120" y1="14" x2="120" y2="44" stroke="${INK}" stroke-width="2"/>`,
    `<polygon points="120,40 115,31 125,31" fill="${WARN}"/>`,
    t(128, 32, `i${sub('C')}(0⁺) = −3 A`, WARN, 'start', 11),
    `<circle cx="120" cy="68" r="22" fill="#fff" stroke="${CAP}" stroke-width="2.4"/>`,
    t(120, 62, '+', CAP, 'middle', 14, 800),
    t(120, 84, '−', CAP, 'middle', 14, 800),
    `<line x1="120" y1="90" x2="120" y2="120" stroke="${INK}" stroke-width="2"/>`,
    t(150, 72, `36 V（C = 0.25 F）`, CAP, 'start', 11),
    t(150, 108, `dv${sub('C')}(0⁺)/dt = ?`, INK, 'start', 13, 800),
  ].join(''),
);

/** Q4: the two instants t = 0⁺ and t = ∞, both derivatives asked */
export const SVG_Q4 = svg(
  360,
  112,
  't=0⁺ 与 t=∞ 两个时刻的导数各是多少？',
  [
    `<line x1="24" y1="86" x2="336" y2="86" stroke="${INK}" stroke-width="1.6"/><polygon points="342,86 334,82 334,90" fill="${INK}"/>`,
    t(340, 104, 't', INK, 'end', 11),
    `<line x1="70" y1="80" x2="70" y2="92" stroke="${AMBER}" stroke-width="2"/>`,
    `<line x1="290" y1="80" x2="290" y2="92" stroke="#0369a1" stroke-width="2"/>`,
    t(70, 104, 't = 0⁺', AMBER, 'middle', 11),
    t(290, 104, 't = ∞', '#0369a1', 'middle', 11),
    `<rect x="14" y="14" width="112" height="54" rx="8" fill="#fff" stroke="${AMBER}" stroke-width="1.5"/>`,
    t(70, 36, `dv${sub('C')}/dt = ?`, CAP, 'middle', 11),
    t(70, 56, `di${sub('L')}/dt = ?`, IND, 'middle', 11),
    `<rect x="234" y="14" width="112" height="54" rx="8" fill="#fff" stroke="#0369a1" stroke-width="1.5"/>`,
    t(290, 36, `dv${sub('C')}/dt = ?`, CAP, 'middle', 11),
    t(290, 56, `di${sub('L')}/dt = ?`, IND, 'middle', 11),
    t(180, 46, '直流激励', MUTED, 'middle', 10, 600),
  ].join(''),
);
