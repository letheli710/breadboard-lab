// W4-L3 · figures added for the lesson (not in the sheet): the four self-test figures, the quiz
// act's overview and the 通关复盘 waveform. Drawn for the light theme directly (paper background,
// ink text), so they do not go through lightSvg. None of them shows its question's answer.

const FONT = 'font-family="ui-sans-serif, system-ui, sans-serif"';
const INK = '#1f2a44';
const MUTED = '#5f626b';
const AMBER = '#b45309';
const TEAL = '#0e7490';
const GREEN = '#15803d';
const RED = '#b91c1c';

const bg = (w: number, h: number) => `<rect x="0" y="0" width="${w}" height="${h}" rx="12" fill="#fbf7ef" stroke="#e3d8c2"/>`;

/** a zigzag resistor from (x, y) to (x + len, y) */
const zig = (x: number, y: number, len: number, color: string) => {
  const n = 6;
  const w = len / n;
  let d = `M${x} ${y}`;
  for (let i = 0; i < n; i++) d += ` L${x + w * (i + 0.5)} ${y + (i % 2 ? 7 : -7)}`;
  return `<path d="${d} L${x + len} ${y}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>`;
};
const cap = (x: number, y: number, color = AMBER) =>
  `<line x1="${x - 5}" y1="${y - 14}" x2="${x - 5}" y2="${y + 14}" stroke="${color}" stroke-width="3"/><line x1="${x + 5}" y1="${y - 14}" x2="${x + 5}" y2="${y + 14}" stroke="${color}" stroke-width="3"/>`;
const wire = (d: string) => `<path d="${d}" fill="none" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>`;
const amp = (x: number, y: number) =>
  `<polygon points="${x},${y - 32} ${x},${y + 32} ${x + 62},${y}" fill="#fff" stroke="${INK}" stroke-width="2"/><text x="${x + 8}" y="${y - 12}" fill="${RED}" font-size="15" font-weight="800">−</text><text x="${x + 7}" y="${y + 23}" fill="${GREEN}" font-size="15" font-weight="800">+</text>`;
const gnd = (x: number, y: number) =>
  `<line x1="${x - 11}" y1="${y}" x2="${x + 11}" y2="${y}" stroke="#64748b" stroke-width="2"/><line x1="${x - 7}" y1="${y + 5}" x2="${x + 7}" y2="${y + 5}" stroke="#64748b" stroke-width="2"/><line x1="${x - 3}" y1="${y + 10}" x2="${x + 3}" y2="${y + 10}" stroke="#64748b" stroke-width="2"/>`;

/** the inverting skeleton: input element(s) at y 110 from x 40 to 150, node at 170, op amp at 200, feedback at y 50 */
function skeleton(input: string, feedback: string, extra = '') {
  return `${wire('M150 110 H200 M170 110 V50 H220 M280 50 H300 V128 M262 128 H330')}${amp(200, 128)}${wire('M200 146 H184 V170')}${gnd(184, 170)}
  <circle cx="170" cy="110" r="4" fill="${GREEN}"/><text x="158" y="128" fill="${GREEN}" font-size="10.5" text-anchor="end">v− = 0</text>
  <circle cx="34" cy="110" r="4.5" fill="#fff" stroke="${INK}" stroke-width="2"/><text x="26" y="98" fill="${INK}" font-size="12" font-weight="700">v_i</text>
  <circle cx="334" cy="128" r="4.5" fill="#fff" stroke="#6d28d9" stroke-width="2"/><text x="324" y="114" fill="#6d28d9" font-size="12" font-weight="700">v_o</text>
  ${input}${feedback}${extra}`;
}

export const SVG_Q1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 200" ${FONT} role="img" aria-label="积分器：R = 20 kΩ，C = 50 nF，输入恒定 −4.0 V">
  ${bg(520, 200)}
  ${skeleton(
    `${wire('M38 110 H70 M130 110 H150')}${zig(70, 110, 60, '#0284c7')}<text x="100" y="94" fill="#0369a1" font-size="12" font-weight="700" text-anchor="middle">R = 20 kΩ</text>`,
    `${wire('M220 50 H245 M255 50 H280')}${cap(250, 50)}<text x="250" y="28" fill="${AMBER}" font-size="12" font-weight="700" text-anchor="middle">C = 50 nF</text>`,
  )}
  <rect x="368" y="40" width="136" height="120" rx="10" fill="#fff" stroke="#e3d8c2"/>
  <text x="436" y="64" fill="${MUTED}" font-size="11.5" text-anchor="middle">这段时间内</text>
  <text x="436" y="90" fill="${AMBER}" font-size="14" font-weight="800" text-anchor="middle">v_i = −4.0 V</text>
  <text x="436" y="126" fill="${TEAL}" font-size="14" font-weight="800" text-anchor="middle">dv_o/dt = ?</text>
  <text x="436" y="146" fill="${MUTED}" font-size="10.5" text-anchor="middle">先算 RC，再看符号</text>
</svg>`;

export const SVG_Q2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 200" ${FONT} role="img" aria-label="反馈电容两端并联一颗 100 kΩ 电阻 R_f">
  ${bg(520, 200)}
  ${skeleton(
    `${wire('M38 110 H70 M130 110 H150')}${zig(70, 110, 60, '#0284c7')}<text x="100" y="94" fill="#0369a1" font-size="12" font-weight="700" text-anchor="middle">R = 10 kΩ</text>`,
    `${wire('M220 50 H245 M255 50 H280')}${cap(250, 50)}<text x="232" y="76" fill="${AMBER}" font-size="11.5" font-weight="700">C 100 nF</text>`,
    `${wire('M170 50 V20 H220 M280 20 H300 V50')}${zig(220, 20, 60, GREEN)}<rect x="214" y="8" width="72" height="24" rx="6" fill="none" stroke="${GREEN}" stroke-dasharray="4 3"/><text x="300" y="16" fill="${GREEN}" font-size="12" font-weight="800">R_f = 100 kΩ</text>`,
  )}
  <rect x="368" y="40" width="136" height="120" rx="10" fill="#fff" stroke="#e3d8c2"/>
  <text x="436" y="68" fill="${MUTED}" font-size="11.5" text-anchor="middle">对直流：C 开路</text>
  <text x="436" y="92" fill="${MUTED}" font-size="11.5" text-anchor="middle">对交流：C 导通</text>
  <text x="436" y="132" fill="${GREEN}" font-size="14" font-weight="800" text-anchor="middle">R_f 为谁而加？</text>
</svg>`;

export const SVG_Q3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 200" ${FONT} role="img" aria-label="微分器：C = 100 nF，R = 10 kΩ，输入斜率 +2.5 V/ms 的上升斜坡">
  ${bg(520, 200)}
  ${skeleton(
    `${wire('M38 110 H95 M105 110 H150')}${cap(100, 110)}<text x="100" y="88" fill="${AMBER}" font-size="12" font-weight="700" text-anchor="middle">C = 100 nF</text>`,
    `${wire('M220 50 H220 M280 50 H280')}${zig(220, 50, 60, '#0284c7')}<text x="250" y="32" fill="#0369a1" font-size="12" font-weight="700" text-anchor="middle">R = 10 kΩ</text>`,
  )}
  <rect x="368" y="40" width="136" height="120" rx="10" fill="#fff" stroke="#e3d8c2"/>
  <line x1="384" y1="104" x2="488" y2="104" stroke="#cbd5e1"/>
  <path d="M384 120 L470 62" fill="none" stroke="#ca8a04" stroke-width="2.6"/>
  <text x="436" y="58" fill="${AMBER}" font-size="12" font-weight="800" text-anchor="middle">+2.5 V/ms</text>
  <text x="436" y="146" fill="${TEAL}" font-size="14" font-weight="800" text-anchor="middle">v_o = ?</text>
</svg>`;

export const SVG_Q4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 200" ${FONT} role="img" aria-label="微分器的输入电容前串联 R_s = 1 kΩ">
  ${bg(520, 200)}
  ${skeleton(
    `${wire('M38 110 H48 M92 110 H112 M122 110 H150')}${zig(48, 110, 44, '#0284c7')}<rect x="42" y="94" width="56" height="32" rx="6" fill="none" stroke="#0284c7" stroke-dasharray="4 3"/><text x="70" y="88" fill="#0369a1" font-size="11.5" font-weight="800" text-anchor="middle">R_s = 1 kΩ</text>${cap(117, 110)}<text x="117" y="142" fill="${AMBER}" font-size="11" font-weight="700" text-anchor="middle">100 nF</text>`,
    `${wire('M220 50 H220 M280 50 H280')}${zig(220, 50, 60, '#6d28d9')}<text x="250" y="32" fill="#6d28d9" font-size="12" font-weight="700" text-anchor="middle">R = 10 kΩ</text>`,
  )}
  <rect x="368" y="40" width="136" height="120" rx="10" fill="#fff" stroke="#e3d8c2"/>
  <text x="436" y="66" fill="${MUTED}" font-size="11.5" text-anchor="middle">频率很高时</text>
  <text x="436" y="88" fill="${MUTED}" font-size="11.5" text-anchor="middle">电容容抗 X_C → 0</text>
  <text x="436" y="128" fill="#0369a1" font-size="14" font-weight="800" text-anchor="middle">|A| → ?</text>
</svg>`;

/** the quiz act's overview: the four concepts */
export const SVG_QUIZ_ACT = (() => {
  const card = (x: number, title: string, sub: string, icon: string) =>
    `<rect x="${x}" y="44" width="158" height="140" rx="10" fill="#fff" stroke="#e3d8c2" stroke-width="1.5"/>
  <text x="${x + 79}" y="68" fill="${INK}" font-size="12.5" font-weight="700" text-anchor="middle">${title}</text>
  <text x="${x + 79}" y="172" fill="${MUTED}" font-size="11" text-anchor="middle">${sub}</text>
  <g transform="translate(${x + 29} 82)">${icon}</g>`;
  const i1 = `<line x1="0" y1="10" x2="40" y2="10" stroke="#ca8a04" stroke-width="2.4"/><line x1="40" y1="10" x2="40" y2="40" stroke="#ca8a04" stroke-width="2.4"/><line x1="40" y1="40" x2="100" y2="40" stroke="#ca8a04" stroke-width="2.4"/><path d="M0 26 L40 52" stroke="#0891b2" stroke-width="2.2" fill="none" stroke-dasharray="4 3"/><text x="70" y="62" fill="${TEAL}" font-size="11" text-anchor="middle">斜率的符号？</text>`;
  const i2 = `${zig(10, 14, 60, GREEN)}${cap(40, 40)}<text x="50" y="68" fill="${GREEN}" font-size="11" text-anchor="middle">并联它为了啥？</text>`;
  const i3 = `<path d="M0 44 L50 8 L100 44" fill="none" stroke="#ca8a04" stroke-width="2.2"/><text x="50" y="64" fill="${TEAL}" font-size="11" text-anchor="middle">斜坡 → 电平？</text>`;
  const i4 = `<path d="M0 44 L30 8 L60 36 L100 4" fill="none" stroke="${RED}" stroke-width="1.6"/><line x1="0" y1="20" x2="100" y2="20" stroke="#0284c7" stroke-width="2" stroke-dasharray="5 3"/><text x="50" y="64" fill="#0369a1" font-size="11" text-anchor="middle">高频增益封顶</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 200" ${FONT} role="img" aria-label="诊断测验的四个核心概念">
  ${bg(700, 200)}
  <text x="20" y="28" fill="${INK}" font-size="15" font-weight="700">诊断测验：运放积分器与微分器的四个核心概念</text>
  ${card(16, 'Q1 积分器斜率与极性', '−v_i / RC', i1)}
  ${card(186, 'Q2 有损积分器', '为什么并联 R_f', i2)}
  ${card(356, 'Q3 微分器波形变换', '−RC · dv_i/dt', i3)}
  ${card(526, 'Q4 实用微分器', '串联 R_s 抗噪', i4)}
</svg>`;
})();

/** the 通关复盘 picture: the example's input and output, 0–4 ms (shown only after the guided block) */
export const SVG_REVIEW = (() => {
  const X = (ms: number) => 70 + ms * 120;
  const Y = (v: number) => 110 - v * 13;
  const vo = [0, 2, 4].map((ms, i) => `${X(ms)},${Y([0, -6, 0][i])}`).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240" ${FONT} role="img" aria-label="通关复盘：250 Hz ±3 V 方波积分，输出 0 V → −6 V → 0 V">
  ${bg(640, 240)}
  <text x="20" y="26" fill="${INK}" font-size="14" font-weight="700">通关复盘：250 Hz ±3 V 方波 → 理想积分器（RC = 1 ms，v_o(0) = 0）</text>
  ${[0, 1, 2, 3, 4].map((ms) => `<line x1="${X(ms)}" y1="40" x2="${X(ms)}" y2="216" stroke="#eee5d3"/><text x="${X(ms)}" y="232" fill="${MUTED}" font-size="11" text-anchor="middle">${ms} ms</text>`).join('')}
  ${[3, 0, -3, -6].map((v) => `<line x1="${X(0)}" y1="${Y(v)}" x2="${X(4)}" y2="${Y(v)}" stroke="${v === 0 ? '#cbd5e1' : '#eee5d3'}"/><text x="${X(0) - 8}" y="${Y(v) + 4}" fill="${MUTED}" font-size="11" text-anchor="end">${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)} V</text>`).join('')}
  <line x1="${X(0)}" y1="${Y(-7.5)}" x2="${X(4)}" y2="${Y(-7.5)}" stroke="${RED}" stroke-dasharray="6 4"/>
  <text x="${X(4)}" y="${Y(-7.5) - 5}" fill="${RED}" font-size="10.5" text-anchor="end">−7.5 V 设计红线</text>
  <polyline points="${X(0)},${Y(3)} ${X(2)},${Y(3)} ${X(2)},${Y(-3)} ${X(4)},${Y(-3)}" fill="none" stroke="#ca8a04" stroke-width="2.6"/>
  <polyline points="${vo}" fill="none" stroke="#0891b2" stroke-width="3"/>
  <circle cx="${X(2)}" cy="${Y(-6)}" r="4.5" fill="#0891b2"/>
  <text x="${X(2) + 8}" y="${Y(-6) + 4}" fill="${TEAL}" font-size="12" font-weight="700">v_o(2 ms) = −6.0 V</text>
  <text x="${X(0.5)}" y="${Y(-1.2)}" fill="${TEAL}" font-size="11.5" font-weight="700">k₁ = −3 V/ms</text>
  <text x="${X(2.9)}" y="${Y(-1.2)}" fill="${TEAL}" font-size="11.5" font-weight="700">k₂ = +3 V/ms</text>
  <text x="${X(0.1)}" y="${Y(3) - 6}" fill="${AMBER}" font-size="11.5" font-weight="700">CH1 v_i = +3 V</text>
</svg>`;
})();
