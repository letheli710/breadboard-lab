// W3-L8 diagrams. The sheet's own SVGs (sheetSvgs.ts) go through `fix` (the changes listed there)
// and the shared `lightSvg`; the ADDED_* figures (the guided problem, the self-test, the self-test
// act) are drawn here in the same dark sheet style and recoloured the same way.

import { lightSvg } from '../../svgTheme';
import { SHEET_BOUNDARY, SHEET_DAC, SHEET_GAIN, SHEET_IA, SHEET_LAYOUT, SHEET_MINI1, SHEET_MINI2, SHEET_MINI3, SHEET_MINI4, SHEET_MINI5, SHEET_STAIRS } from './sheetSvgs';

/** Text swaps before `lightSvg`; each must be found (a sheet change shows up as an error). */
function fix(svg: string, swaps: [string, string][] = []): string {
  let s = svg;
  for (const [a, b] of swaps) {
    if (!s.includes(a)) throw new Error(`W3-L8 svg fix not found: ${a}`);
    s = s.split(a).join(b);
  }
  return lightSvg(s);
}

export const SVG_DAC = fix(SHEET_DAC);
export const SVG_STAIRS = fix(SHEET_STAIRS);
export const SVG_IA = fix(SHEET_IA);
/** figure 2.4: the hand-drawn curve missed its own R_G = 2 kΩ point (A_v = 26) by 10 px; the first
 *  Bézier control point moves so the curve runs through all five sample points */
export const SVG_GAIN = fix(SHEET_GAIN, [['C 125,135 160,175 215,213', 'C 125,162 160,175 215,213']]);
export const SVG_BOUNDARY = fix(SHEET_BOUNDARY);

/** figure 4.1, changed to match the 3D board of layer 03:
 *  - the chip is the course's LM358 (the sheet drew a TL072; same DIP-8 pinout);
 *  - the rails are as on the 3D board: top +9 V / V_ref, bottom GND / −9 V (the sheet had GND on
 *    top and V_ref at the bottom; on the board GND has to be next to the pull-downs, Pin 3 and the
 *    meter's black probe);
 *  - colours that do not survive the light theme: white labels on the coloured resistor, DIP and
 *    R_f boxes (`#ffffff`, `#fef2f2` would turn ink / dark red) stay white; the chip stays black;
 *    the grey leads `#334155` (→ beige on the light board) are ink. */
export const SVG_LAYOUT = fix(SHEET_LAYOUT, [
  ['4 位 DIP 拨码开关 + TL072）', '4 位 DIP 拨码开关 + LM358）'],
  ['<!-- DIP-8 Op-Amp (TL072) across trench -->', '<!-- DIP-8 Op-Amp (LM358) across trench -->'],
  ['font-weight="bold">TL072</text>', 'font-weight="bold">LM358</text>'],
  [
    '<line x1="48" y1="84" x2="772" y2="84" stroke="#2563eb" stroke-width="3"/>\n  <text x="52" y="97" fill="#1d4ed8" font-family="sans-serif" font-size="11" font-weight="bold">GND 公共地轨 (0V)</text>',
    '<line x1="48" y1="84" x2="772" y2="84" stroke="#f97316" stroke-width="3"/>\n  <text x="52" y="97" fill="#c2410c" font-family="sans-serif" font-size="11" font-weight="bold">Vref 基准轨 (1.000V 基准 / 5.000V 压力测试)</text>',
  ],
  [
    '<line x1="48" y1="252" x2="772" y2="252" stroke="#f97316" stroke-width="3"/>\n  <text x="52" y="246" fill="#c2410c" font-family="sans-serif" font-size="11" font-weight="bold">Vref 基准轨 (1.000V 基准 / 5.000V 压力测试)</text>',
    '<line x1="48" y1="252" x2="772" y2="252" stroke="#334155" stroke-width="3"/>\n  <text x="52" y="246" fill="#1f2a44" font-family="sans-serif" font-size="11" font-weight="bold">GND 公共地轨 (0V)</text>',
  ],
  ['<!-- Top Power Rails (+9V red, GND blue) -->', '<!-- Top Power Rails (+9V red, Vref orange) -->'],
  ['<!-- Bottom Power Rails (-9V cyan/blue, Vref orange) -->', '<!-- Bottom Power Rails (GND, -9V blue) -->'],
  [
    'fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold">4-BIT DIP SW',
    'fill="#fefefe" font-family="sans-serif" font-size="11" font-weight="bold">4-BIT DIP SW',
  ],
  ['fill="#fef2f2" font-family="monospace" font-size="10">b1 b2 b3 b4', 'fill="#fefefe" font-family="monospace" font-size="10">b1 b2 b3 b4'],
  ['<text x="267" y="130" fill="#ffffff">', '<text x="267" y="130" fill="#fefefe">'],
  ['<text x="264" y="156" fill="#ffffff">', '<text x="264" y="156" fill="#fefefe">'],
  ['<text x="264" y="188" fill="#ffffff">', '<text x="264" y="188" fill="#fefefe">'],
  ['<text x="264" y="214" fill="#ffffff">', '<text x="264" y="214" fill="#fefefe">'],
  ['fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold">Rf = 10kΩ', 'fill="#fefefe" font-family="sans-serif" font-size="10" font-weight="bold">Rf = 10kΩ'],
  [
    '<rect x="475" y="132" width="110" height="70" rx="4" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>',
    '<rect x="475" y="132" width="110" height="70" rx="4" fill="#26282c" stroke="#111111" stroke-width="2"/>',
  ],
  ['fill="#f8fafc" font-family="monospace" font-size="13" font-weight="bold">LM358', 'fill="#fefefe" font-family="monospace" font-size="13" font-weight="bold">LM358'],
  ['stroke="#334155" stroke-width="2"/>', 'stroke="#1f2a44" stroke-width="2"/>'],
]);

/* ------------------------------------------------------------- the guided example's step diagrams */

// Steps 1, 4 and 5 of the sheet draw the step's own answer into the diagram shown with the
// question (Δv = 50 mV; R_G = 1.0 kΩ; vo1 = 0.750 V … vo = 5.100 V). The house rule is not to
// give a guided answer away, so those values are "?" here; the board shows them once answered.
export const MINI_STEP1 = fix(SHEET_MINI1, [['>Δv = 50mV</text>', '>Δv = ?</text>']]);
export const MINI_STEP2 = fix(SHEET_MINI2);
export const MINI_STEP3 = fix(SHEET_MINI3);
export const MINI_STEP4 = fix(SHEET_MINI4, [
  ['>50 kΩ / RG = 50</text>', '>50 kΩ / RG = ?</text>'],
  ['>⇒ RG = 1.0 kΩ (标准 E24 阻值)</text>', '>⇒ RG = ?</text>'],
]);
export const MINI_STEP5 = fix(SHEET_MINI5, [
  ['>i = 50mV / 1kΩ = 50 μA</text>', '>i = 50mV / 1kΩ = ?</text>'],
  ['>vo1 = 2.000 − 1.250 = 0.750 V</text>', '>vo1 = v1 − i·R = ?</text>'],
  ['>vo2 = 2.050 + 1.250 = 3.300 V</text>', '>vo2 = v2 + i·R = ?</text>'],
  ['>vo = 2×(3.300−0.750) = 5.100 V ✓</text>', '>vo = 2×(vo2 − vo1) = ?</text>'],
]);

/* ------------------------------------------------------------- added figures (sheet style) */

const FONT = `font-family="'Segoe UI', system-ui, sans-serif"`;
const BG = (w: number, h: number) => `<rect width="${w}" height="${h}" rx="12" fill="#0f172a"/>`;
const zigH = (x1: number, x2: number, y: number, stroke: string) => {
  const n = 6;
  const pts = [`${x1},${y}`];
  for (let i = 0; i < n; i++) pts.push(`${(x1 + ((i + 0.5) / n) * (x2 - x1)).toFixed(1)},${y + (i % 2 ? 7 : -7)}`);
  pts.push(`${x2},${y}`);
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/>`;
};
const zigV = (x: number, y1: number, y2: number, stroke: string) => {
  const n = 6;
  const pts = [`${x},${y1}`];
  for (let i = 0; i < n; i++) pts.push(`${x + (i % 2 ? 7 : -7)},${(y1 + ((i + 0.5) / n) * (y2 - y1)).toFixed(1)}`);
  pts.push(`${x},${y2}`);
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/>`;
};
const wire = (pts: string, stroke = '#e2e8f0') => `<polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="2"/>`;
const amp = (x: number, y: number, h: number, name: string, minusTop = true) =>
  `<polygon points="${x},${y} ${x},${y + h} ${x + h * 0.85},${y + h / 2}" fill="#1e293b" stroke="#f8fafc" stroke-width="2"/>` +
  `<text x="${x + 6}" y="${y + h * 0.3 + 4}" fill="${minusTop ? '#fbbf24' : '#34d399'}" font-size="14" font-weight="700">${minusTop ? '−' : '+'}</text>` +
  `<text x="${x + 6}" y="${y + h * 0.78 + 4}" fill="${minusTop ? '#34d399' : '#fbbf24'}" font-size="14" font-weight="700">${minusTop ? '+' : '−'}</text>` +
  `<text x="${x + h * 0.25}" y="${y + h / 2 + 4}" fill="#e2e8f0" font-size="11" font-weight="700">${name}</text>`;
const gnd = (x: number, y: number) =>
  `<line x1="${x - 10}" y1="${y}" x2="${x + 10}" y2="${y}" stroke="#34d399" stroke-width="2"/><line x1="${x - 6}" y1="${y + 5}" x2="${x + 6}" y2="${y + 5}" stroke="#34d399" stroke-width="2"/><line x1="${x - 2}" y1="${y + 10}" x2="${x + 2}" y2="${y + 10}" stroke="#34d399" stroke-width="2"/>`;

/** The guided example's circuit: the three-op-amp IA with R = 25 kΩ, R1 = 10 kΩ, R2 = 20 kΩ,
 *  v1 = 2.000 V, v2 = 2.050 V, R_G to be found. */
export const SVG_GD_PROBLEM =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 260" ${FONT} role="img" aria-label="引导例题电路：三运放仪表放大器，R = 25 kΩ，R1 = 10 kΩ，R2 = 20 kΩ，v1 = 2.000 V，v2 = 2.050 V，外接电阻 R_G 待求">
  ${BG(640, 260)}
  <text x="20" y="26" fill="#f8fafc" font-size="14" font-weight="700">引导例题：应变片电桥 → 三运放仪表放大器（±9 V），目标 A_v = 102</text>
  <line x1="322" y1="40" x2="322" y2="248" stroke="#334155" stroke-width="1.4" stroke-dasharray="6,4"/>
  ${wire('40,70 120,70', '#34d399')}<circle cx="40" cy="70" r="4" fill="#34d399"/>
  <text x="30" y="58" fill="#34d399" font-size="12" font-weight="700">v1 = 2.000 V</text>
  ${wire('40,206 120,206', '#34d399')}<circle cx="40" cy="206" r="4" fill="#34d399"/>
  <text x="30" y="230" fill="#34d399" font-size="12" font-weight="700">v2 = 2.050 V</text>
  ${amp(120, 52, 54, 'A1', false)}
  ${amp(120, 170, 54, 'A2', true)}
  ${wire('120,94 104,94 104,112 240,112', '#fbbf24')}
  ${wire('120,182 104,182 104,164 240,164', '#fbbf24')}
  ${wire('166,79 300,79')}${wire('166,197 300,197')}
  <circle cx="240" cy="79" r="3" fill="#e2e8f0"/><circle cx="240" cy="197" r="3" fill="#e2e8f0"/>
  ${zigV(240, 84, 108, '#38bdf8')}${zigV(240, 168, 192, '#38bdf8')}
  ${zigV(240, 116, 160, '#ef4444')}
  <text x="226" y="100" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="end">R = 25 kΩ</text>
  <text x="226" y="186" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="end">R = 25 kΩ</text>
  <text x="254" y="136" fill="#fca5a5" font-size="12" font-weight="700">R_G</text>
  <text x="254" y="152" fill="#fca5a5" font-size="13" font-weight="700">= ?</text>
  <text x="292" y="72" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="end">vo1</text>
  <text x="292" y="214" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="end">vo2</text>
  ${wire('300,79 340,79')}${zigH(340, 388, 79, '#a78bfa')}${wire('388,79 410,79 410,124 440,124')}
  ${wire('300,197 340,197')}${zigH(340, 388, 197, '#a78bfa')}${wire('388,197 410,197 410,170 440,170')}
  <text x="364" y="100" fill="#a78bfa" font-size="11" font-weight="700" text-anchor="middle">R1 = 10 kΩ</text>
  <text x="364" y="186" fill="#a78bfa" font-size="11" font-weight="700" text-anchor="middle">R1 = 10 kΩ</text>
  ${wire('410,79 410,52 452,52')}${zigH(452, 500, 52, '#a78bfa')}${wire('500,52 548,52 548,147')}
  <text x="476" y="42" fill="#a78bfa" font-size="11" font-weight="700" text-anchor="middle">R2 = 20 kΩ</text>
  ${wire('410,197 410,206')}${zigV(410, 206, 232, '#a78bfa')}
  <text x="424" y="224" fill="#a78bfa" font-size="11" font-weight="700">R2 = 20 kΩ</text>
  ${gnd(410, 236)}
  ${amp(440, 112, 70, 'A3', true)}
  ${wire('500,147 600,147', '#34d399')}<circle cx="600" cy="147" r="4" fill="#34d399"/>
  <text x="572" y="138" fill="#34d399" font-size="13" font-weight="700">vo = ?</text>
</svg>`);

/** Q1: the 4-bit DAC with V_ref = 2.0 V and the code 1011 on its switches. */
export const SVG_Q1 =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 180" ${FONT} role="img" aria-label="4 位加权 DAC：Vref = 2.0 V，开关码字 1011，R 至 8R 汇入虚地，Rf = 10 kΩ">
  ${BG(420, 180)}
  <line x1="30" y1="34" x2="30" y2="154" stroke="#ef4444" stroke-width="2.4"/>
  <text x="14" y="24" fill="#fca5a5" font-size="11" font-weight="700">Vref = 2.0 V</text>
  ${[0, 1, 2, 3]
    .map((k) => {
      const y = 44 + k * 34;
      const b = [1, 0, 1, 1][k];
      return (
        `<line x1="30" y1="${y}" x2="60" y2="${y}" stroke="#ef4444" stroke-width="2"/>` +
        `<rect x="62" y="${y - 10}" width="24" height="20" rx="3" fill="${b ? '#7f1d1d' : '#1e293b'}" stroke="#ef4444" stroke-width="1.5"/>` +
        `<text x="74" y="${y + 4}" fill="${b ? '#fca5a5' : '#94a3b8'}" font-size="12" font-weight="700" text-anchor="middle">${b}</text>` +
        wire(`86,${y} 120,${y}`) +
        zigH(120, 172, y, '#38bdf8') +
        `<text x="146" y="${y - 10}" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">${['R', '2R', '4R', '8R'][k]}</text>` +
        wire(`172,${y} 220,${y}`, '#fbbf24')
      );
    })
    .join('')}
  <line x1="220" y1="44" x2="220" y2="146" stroke="#fbbf24" stroke-width="2.4"/>
  ${wire('220,96 270,96', '#fbbf24')}
  ${amp(270, 76, 60, 'OA', true)}
  ${wire('240,96 240,30 280,30')}${zigH(280, 320, 30, '#a78bfa')}${wire('320,30 350,30 350,106')}
  <text x="300" y="20" fill="#a78bfa" font-size="10" font-weight="700" text-anchor="middle">Rf = 10 kΩ</text>
  ${wire('321,106 396,106', '#34d399')}
  <text x="358" y="128" fill="#34d399" font-size="13" font-weight="700">vo = ?</text>
  <text x="14" y="172" fill="#94a3b8" font-size="10.5">R = 10 kΩ … 8R = 80 kΩ · ±9 V 电源 · b1 为 MSB</text>
</svg>`);

/** Q2: an 8-bit weighted ladder, MSB R = 10 kΩ, the LSB branch unknown. */
export const SVG_Q2 =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 180" ${FONT} role="img" aria-label="8 位二进制加权 DAC 的输入支路：MSB 电阻 10 kΩ，阻值逐位翻倍，LSB 支路阻值待求">
  ${BG(420, 180)}
  <text x="16" y="24" fill="#f8fafc" font-size="13" font-weight="700">8 位加权 DAC：每低一位，电阻翻一倍</text>
  ${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((k) => {
      const x = 22 + k * 49;
      const h = 18 + k * 12;
      const last = k === 7;
      return (
        `<rect x="${x}" y="${150 - h}" width="36" height="${h}" rx="4" fill="${last ? '#7f1d1d' : '#1e293b'}" stroke="${last ? '#ef4444' : '#38bdf8'}" stroke-width="1.6"/>` +
        `<text x="${x + 18}" y="${144 - h}" fill="${last ? '#fca5a5' : '#38bdf8'}" font-size="10" font-weight="700" text-anchor="middle">${last ? '?' : ['10k', '20k', '40k', '…', '…', '…', '…'][k]}</text>` +
        `<text x="${x + 18}" y="166" fill="#94a3b8" font-size="10" text-anchor="middle">b${k + 1}</text>`
      );
    })
    .join('')}
  <text x="16" y="44" fill="#94a3b8" font-size="10">MSB → LSB</text>
</svg>`);

/** Q3: the IA's R_G pulled out (open circuit). */
export const SVG_Q3 =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 180" ${FONT} role="img" aria-label="仪表放大器前级：R = 20 kΩ 两颗，中间的 R_G = 5 kΩ 被拔掉成开路">
  ${BG(420, 180)}
  <text x="16" y="24" fill="#f8fafc" font-size="13" font-weight="700">前级电阻链：R – R_G – R（R1 = R2 = 10 kΩ）</text>
  ${wire('60,44 60,60')}${zigV(60, 60, 84, '#38bdf8')}${wire('60,84 60,96')}
  <circle cx="60" cy="96" r="3.5" fill="#fbbf24"/>
  <rect x="44" y="104" width="32" height="26" rx="4" fill="#1e293b" stroke="#ef4444" stroke-width="1.6" stroke-dasharray="4,3"/>
  <line x1="46" y1="106" x2="74" y2="128" stroke="#ef4444" stroke-width="2.2"/><line x1="74" y1="106" x2="46" y2="128" stroke="#ef4444" stroke-width="2.2"/>
  <circle cx="60" cy="138" r="3.5" fill="#fbbf24"/>
  ${wire('60,138 60,146')}${zigV(60, 146, 166, '#38bdf8')}
  <text x="84" y="76" fill="#38bdf8" font-size="11" font-weight="700">R = 20 kΩ</text>
  <text x="84" y="122" fill="#fca5a5" font-size="11" font-weight="700">R_G = 5 kΩ → 拔掉（开路）</text>
  <text x="84" y="162" fill="#38bdf8" font-size="11" font-weight="700">R = 20 kΩ</text>
  <rect x="250" y="62" width="150" height="70" rx="8" fill="#1e293b" stroke="#a78bfa" stroke-width="1.6"/>
  <text x="325" y="88" fill="#a78bfa" font-size="12" font-weight="700" text-anchor="middle">拔掉前 A_v = ?</text>
  <text x="325" y="114" fill="#a78bfa" font-size="12" font-weight="700" text-anchor="middle">拔掉后 A_v = ?</text>
</svg>`);

/** Q4: R_f moved to the + input (or pulled out). */
export const SVG_Q4 = lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 180" ${FONT} role="img" aria-label="反馈电阻 Rf 被误插到运放同相输入端，或干脆拔掉开环">
  ${BG(420, 180)}
  <text x="16" y="24" fill="#f8fafc" font-size="13" font-weight="700">Rf 插错脚（接到 +）或拔掉 → 输出会怎样？</text>
  ${wire('30,80 80,80')}${zigH(80, 128, 80, '#38bdf8')}${wire('128,80 170,80')}
  <text x="104" y="68" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">输入支路</text>
  ${amp(170, 62, 64, 'OA', true)}
  ${wire('170,114 150,114 150,140')}${gnd(150, 140)}
  ${wire('224,94 330,94', '#34d399')}
  <text x="338" y="98" fill="#34d399" font-size="13" font-weight="700">vo = ?</text>
  ${wire('300,94 300,152 260,152', '#f97316')}${zigH(212, 260, 152, '#f97316')}${wire('212,152 160,152 160,114', '#f97316')}<circle cx="160" cy="114" r="3.5" fill="#f97316"/>
  <text x="236" y="172" fill="#fdba74" font-size="10.5" font-weight="700" text-anchor="middle">Rf 误接到同相端 +</text>
  <line x1="240" y1="40" x2="300" y2="40" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3"/>
  <text x="312" y="44" fill="#fca5a5" font-size="10.5" font-weight="700">原来的 Rf（已拔掉）</text>
</svg>`);

/** The self-test act: the four traps of the lesson. */
export const SVG_QUIZ_ACT =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 170" ${FONT} role="img" aria-label="诊断测验的四个考点：DAC 码字换算、加权电阻跨度、R_G 开路、负反馈与比较器边界">
  ${BG(700, 170)}
  <text x="20" y="28" fill="#f8fafc" font-size="15" font-weight="700">诊断测验：四个考点</text>
  ${[
    ['① 码字 → 电压', '1011 → D = ?', '#38bdf8'],
    ['② 加权电阻跨度', '8 位：2^(N−1) 倍', '#fbbf24'],
    ['③ R_G 开路', 'A_v → R2/R1 ?', '#ef4444'],
    ['④ 反馈接错', '虚短还成立吗？', '#f97316'],
  ]
    .map(
      ([t, s, c], i) =>
        `<rect x="${20 + i * 168}" y="48" width="156" height="98" rx="10" fill="#1e293b" stroke="${c}" stroke-width="1.8"/>` +
        `<text x="${98 + i * 168}" y="86" fill="${c}" font-size="14" font-weight="700" text-anchor="middle">${t}</text>` +
        `<text x="${98 + i * 168}" y="116" fill="#cbd5e1" font-size="12" text-anchor="middle">${s}</text>`,
    )
    .join('')}
</svg>`);
