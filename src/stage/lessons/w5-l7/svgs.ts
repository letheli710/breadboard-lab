// The W5-L7 diagrams. The sheet's act figures (sheetSvgs.ts, copied by a script) are drawn for a dark
// canvas and recoloured for the light theme by lightSvg; changes, of colour and typography only:
// - the minor log-grid lines of the act 4 / act 5 plots (#273449, not in the shared mapping: it would
//   stay a dark navy on white) become a pale hairline;
// - a symbol written with an underscore in the diagram text (V_i, ω_c, Z_R, ω_p1 …) gets its subscript
//   set low and small (the words are unchanged).
// The guided-step diagrams come from the sheet's JSON, with what gave a step's answer away replaced
// by "?" (anti-spoiler, see the comments); the guided problem figure, act 6's figure and the quiz
// figures are drawn here (the sheet has none), light theme.

import { lightSvg } from '../../svgTheme';
import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4_MAG, SHEET_ACT4_PHASE, SHEET_ACT5_REF } from './sheetSvgs';

/** set the subscript of underscore symbols in <text> low and small: "ω_p1=2.0" → ω, p1 (sub), "=2.0" */
export function subText(svg: string): string {
  return svg.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (_m, open: string, body: string, close: string) => {
    const parts = body.split(/(?<=[A-Za-zω])_([A-Za-z0-9]+)/);
    if (parts.length === 1) return open + body + close;
    let out = parts[0];
    for (let i = 1; i < parts.length; i += 2) out += `<tspan dy="3" font-size="78%">${parts[i]}</tspan><tspan dy="-3">${parts[i + 1] || '&#8203;'}</tspan>`;
    return open + out + close;
  });
}

function sheet(svg: string, label: string): string {
  const s = svg.replace('<svg ', `<svg role="img" aria-label="${label}" `).replace(/stroke="#273449"/g, 'stroke="#f1ead9"');
  return subText(lightSvg(s));
}

export const SVG_ACT1 = sheet(SHEET_ACT1, '一阶 RC 低通网络：频域复阻抗分压与传递函数黑箱映射');
export const SVG_ACT2 = sheet(SHEET_ACT2, '线性坐标 vs 半对数分贝坐标对比图');
export const SVG_ACT3 = sheet(SHEET_ACT3, '波特图四大基本因子特征全景图');
export const SVG_ACT4_MAG = sheet(SHEET_ACT4_MAG, '复合传递函数 200jω/[(jω+2)(jω+10)] 幅频波特图');
export const SVG_ACT4_PHASE = sheet(SHEET_ACT4_PHASE, '复合传递函数 200jω/[(jω+2)(jω+10)] 相频波特图');
/** act 5's reference plot: it prints the guided example's answers, so it stands after the guided block (通关复盘) */
export const SVG_GUIDED_REVIEW = sheet(SHEET_ACT5_REF, '引导例题 2000jω/[(jω+2)(jω+100)] 幅频波特图参考（通关复盘）');

const mini = (s: string) => subText(lightSvg(s)).replace('<svg ', '<svg style="max-width:380px" ');

/** step 1: the sheet's diagram printed the product of the constants (2 × 100 = 200), i.e. the division that gives K; asked instead */
export const MINI_STEP1 = mini(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='360' height='110'><rect width='360' height='110' rx='8' fill='#0f172a'/><text x='180' y='34' fill='#38bdf8' font-size='13' font-weight='700' text-anchor='middle'>H(ω) = 2000·jω / [(jω+2)(jω+100)]</text><text x='180' y='62' fill='#fbbf24' font-size='12' text-anchor='middle'>↓ 提取分母常数 ? × ? = ?</text><text x='180' y='90' fill='#34d399' font-size='13' font-weight='700' text-anchor='middle'>H(ω) = K · jω / [(1+jω/2)(1+jω/100)]</text></svg>`,
);
/** step 2: the sheet's diagram (both numbers asked) */
export const MINI_STEP2 = mini(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='360' height='110'><rect width='360' height='110' rx='8' fill='#0f172a'/><line x1='40' y1='88' x2='320' y2='88' stroke='#475569'/><line x1='60' y1='84' x2='240' y2='24' stroke='#fbbf24' stroke-width='2.5' stroke-dasharray='5,3'/><circle cx='180' cy='44' r='4.5' fill='#38bdf8'/><text x='188' y='40' fill='#38bdf8' font-size='11' font-weight='700'>ω = 1 rad/s: ? dB</text><text x='92' y='62' fill='#fbbf24' font-size='11'>斜率 = ? dB/dec</text></svg>`,
);
/** step 3: the sheet's diagram drew the whole asymptote (flat, then falling: the slopes asked); only the low-frequency line (step 2) stays */
export const MINI_STEP3 = mini(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='360' height='110'><rect width='360' height='110' rx='8' fill='#0f172a'/><polyline points='30,90 120,34' fill='none' stroke='#fbbf24' stroke-width='2.6' stroke-dasharray='6,3'/><line x1='120' y1='30' x2='120' y2='100' stroke='#475569' stroke-dasharray='3,3'/><line x1='250' y1='30' x2='250' y2='100' stroke='#475569' stroke-dasharray='3,3'/><circle cx='120' cy='34' r='4' fill='#f43f5e'/><text x='120' y='22' fill='#fda4af' font-size='11' text-anchor='middle'>ω_p1=2</text><text x='250' y='22' fill='#fda4af' font-size='11' text-anchor='middle'>ω_p2=100</text><text x='70' y='86' fill='#fbbf24' font-size='10' text-anchor='middle'>+20 dB/dec</text><text x='185' y='52' fill='#34d399' font-size='11' font-weight='700' text-anchor='middle'>平顶 = ? dB</text><text x='185' y='70' fill='#fbbf24' font-size='11' text-anchor='middle'>? dB/dec</text><text x='300' y='70' fill='#fbbf24' font-size='11' text-anchor='middle'>? dB/dec</text></svg>`,
);
/** step 4: the sheet's diagram printed the answer ("向下偏离 ≈ 3.01 dB") and drew the curve under the corners; asked instead */
export const MINI_STEP4 = mini(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='360' height='110'><rect width='360' height='110' rx='8' fill='#0f172a'/><polyline points='40,90 120,30 240,30 320,90' fill='none' stroke='#fbbf24' stroke-width='2' stroke-dasharray='5,3'/><circle cx='120' cy='30' r='4' fill='#fbbf24'/><circle cx='240' cy='30' r='4' fill='#fbbf24'/><text x='120' y='50' fill='#38bdf8' font-size='11' font-weight='700' text-anchor='middle'>精确 = ?</text><text x='240' y='50' fill='#38bdf8' font-size='11' font-weight='700' text-anchor='middle'>精确 = ?</text><text x='180' y='22' fill='#fbbf24' font-size='11' text-anchor='middle'>渐近平顶</text><text x='180' y='82' fill='#fb7185' font-size='11' font-weight='700' text-anchor='middle'>极点转折处精确曲线偏离 ? dB</text></svg>`,
);
/** step 5: the sheet's diagram drew +90° → −90° and printed ω_0 = √(p1·p2); asked instead */
export const MINI_STEP5 = mini(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='360' height='110'><rect width='360' height='110' rx='8' fill='#0f172a'/><line x1='30' y1='55' x2='330' y2='55' stroke='#64748b' stroke-dasharray='3,3'/><text x='36' y='50' fill='#cbd5e1' font-size='10'>0°</text><text x='40' y='24' fill='#cbd5e1' font-size='11'>极低频：?°</text><text x='320' y='96' fill='#cbd5e1' font-size='11' text-anchor='end'>极高频：?°</text><circle cx='180' cy='55' r='4.5' fill='#34d399'/><text x='190' y='72' fill='#34d399' font-size='11' font-weight='700'>ω_0 = ? → 0°</text></svg>`,
);

/** the guided example's problem: semilog paper with the two given corners, nothing drawn yet */
export const SVG_GUIDED_PROBLEM = (() => {
  const x = (w: number) => 50 + ((Math.log10(w) + 1) / 4) * 380;
  let grid = '';
  for (const d of [0.1, 1, 10, 100])
    for (let m = 1; m <= 9; m++) {
      const w = d * m;
      grid += `<line x1="${x(w).toFixed(1)}" y1="40" x2="${x(w).toFixed(1)}" y2="136" stroke="${m === 1 ? '#475569' : '#334155'}" stroke-width="${m === 1 ? 1.1 : 0.7}"/>`;
    }
  grid += `<line x1="${x(1000)}" y1="40" x2="${x(1000)}" y2="136" stroke="#475569" stroke-width="1.1"/>`;
  const labels = [0.1, 1, 10, 100, 1000].map((w) => `<text x="${x(w).toFixed(1)}" y="150" fill="#94a3b8" font-size="10" text-anchor="middle">${w}</text>`).join('');
  return subText(
    lightSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 170" width="460" height="170" role="img" aria-label="引导例题：半对数坐标纸，两个转折频率 2 与 100 rad/s 已标出，曲线待画"><rect x="0" y="0" width="460" height="170" rx="10" fill="#0f172a"/><text x="230" y="24" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle">H(ω) = 2000 jω / [(jω + 2)(jω + 100)]：渐近线待画</text><rect x="50" y="40" width="380" height="96" fill="#1e293b" stroke="#334155"/>${grid}<line x1="${x(2).toFixed(1)}" y1="40" x2="${x(2).toFixed(1)}" y2="136" stroke="#f43f5e" stroke-width="1.3" stroke-dasharray="3,3"/><line x1="${x(100).toFixed(1)}" y1="40" x2="${x(100).toFixed(1)}" y2="136" stroke="#f43f5e" stroke-width="1.3" stroke-dasharray="3,3"/><text x="${(x(2) + 4).toFixed(1)}" y="54" fill="#fb7185" font-size="10" font-weight="700">ω = 2</text><text x="${(x(100) + 4).toFixed(1)}" y="54" fill="#fb7185" font-size="10" font-weight="700">ω = 100</text><text x="44" y="92" fill="#94a3b8" font-size="10" text-anchor="end">? dB</text><text x="240" y="96" fill="#94a3b8" font-size="12" text-anchor="middle">K = ?　斜率 = ?　平顶 = ?　ω_0 = ?</text>${labels}<text x="430" y="164" fill="#94a3b8" font-size="10" text-anchor="end">ω (rad/s)</text></svg>`,
    ),
  );
})();

/* ---------------------------------------------------------------- act 6 and quiz figures (light theme) */

const INK = '#1f2a44';
const MUTED = '#5f626b';
const head = (w: number, h: number, label: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}" style="max-width:${w}px;font-family:'PingFang SC','Noto Sans CJK SC',sans-serif"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10" fill="#fbf7ef" stroke="#e3d8c2"/>`;

/** act 6: what the four questions check (no answers) */
export const SVG_ACT6 = (() => {
  const items: [string, string, string][] = [
    ['① 分贝刻度', '电压比 ↔ 功率比 ↔ dB', '#0369a1'],
    ['② 标准形式', '先提常数，再读 K', '#6d28d9'],
    ['③ 读斜率', '斜率变化 → 零点 / 极点', '#b45309'],
    ['④ 二阶因子', '高频斜率与谐振尖峰', '#be123c'],
  ];
  const box = items
    .map(
      ([t, s, c], i) =>
        `<rect x="${16 + i * 152}" y="44" width="140" height="62" rx="9" fill="#fff" stroke="${c}" stroke-width="1.6"/><text x="${86 + i * 152}" y="68" fill="${c}" font-size="13" font-weight="700" text-anchor="middle">${t}</text><text x="${86 + i * 152}" y="90" fill="${MUTED}" font-size="11" text-anchor="middle">${s}</text>`,
    )
    .join('');
  return `${head(624, 122, '诊断测验四题考点')}<text x="16" y="28" fill="${INK}" font-size="14" font-weight="700">诊断测验：四道题，四个考点</text>${box}</svg>`;
})();

/** Q1: the output amplitude at ω_c is 0.707 of the mid-band maximum */
export const SVG_Q1 = subText(
  `${head(300, 120, '截止频率处输出电压降为中频最大值的 0.707 倍')}<line x1="30" y1="96" x2="280" y2="96" stroke="#94a3b8"/><rect x="60" y="26" width="46" height="70" rx="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/><text x="83" y="20" fill="#0369a1" font-size="11" font-weight="700" text-anchor="middle">中频 V_max</text><text x="83" y="112" fill="${MUTED}" font-size="10.5" text-anchor="middle">V = 1</text><rect x="170" y="46.5" width="46" height="49.5" rx="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4 3"/><text x="193" y="40" fill="#0369a1" font-size="11" font-weight="700" text-anchor="middle">在 ω_c 处</text><text x="193" y="112" fill="${MUTED}" font-size="10.5" text-anchor="middle">V = 1/√2 ≈ 0.707</text><text x="254" y="66" fill="#be123c" font-size="12" font-weight="700" text-anchor="middle">P = ?</text><text x="254" y="84" fill="#be123c" font-size="12" font-weight="700" text-anchor="middle">dB = ?</text></svg>`,
);

/** Q2: the given form and the shape of its standard form, K asked */
export const SVG_Q2 = `${head(320, 104, '把 50(jω+4)/[(jω+2)(jω+20)] 化为标准形式')}<text x="160" y="32" fill="#0369a1" font-size="13" font-weight="700" text-anchor="middle">H(ω) = 50(jω+4) / [(jω+2)(jω+20)]</text><text x="160" y="56" fill="#b45309" font-size="12" text-anchor="middle">↓ 每个 (jω+p) 都写成 p(1+jω/p)</text><text x="160" y="82" fill="#047857" font-size="13" font-weight="700" text-anchor="middle">H(ω) = K·(1+jω/4) / [(1+jω/2)(1+jω/20)]，K = ?</text></svg>`;

/** Q3: the asymptote described in the question */
export const SVG_Q3 = (() => {
  const x = (w: number) => 30 + ((Math.log10(w) - 0) / 3) * 260;
  return `${head(320, 120, '幅频渐近线：ω<10 水平，10 到 100 之间 −20 dB/dec，ω>100 恢复水平')}<line x1="30" y1="96" x2="290" y2="96" stroke="#94a3b8"/><polyline points="30,40 ${x(10)},40 ${x(100)},80 290,80" fill="none" stroke="#d97706" stroke-width="2.4" stroke-dasharray="7 4"/><line x1="${x(10)}" y1="30" x2="${x(10)}" y2="96" stroke="#e11d48" stroke-dasharray="3 3"/><line x1="${x(100)}" y1="30" x2="${x(100)}" y2="96" stroke="#e11d48" stroke-dasharray="3 3"/><text x="${x(10)}" y="110" fill="${MUTED}" font-size="10.5" text-anchor="middle">10</text><text x="${x(100)}" y="110" fill="${MUTED}" font-size="10.5" text-anchor="middle">100</text><text x="60" y="34" fill="#b45309" font-size="10.5" text-anchor="middle">0 dB/dec</text><text x="${(x(10) + x(100)) / 2 + 22}" y="56" fill="#b45309" font-size="10.5" text-anchor="middle">−20 dB/dec</text><text x="262" y="74" fill="#b45309" font-size="10.5" text-anchor="middle">0 dB/dec</text><text x="${x(10)}" y="24" fill="#be123c" font-size="11" font-weight="700" text-anchor="middle">?</text><text x="${x(100)}" y="24" fill="#be123c" font-size="11" font-weight="700" text-anchor="middle">?</text><text x="300" y="110" fill="${MUTED}" font-size="10" text-anchor="end">ω (rad/s)</text></svg>`;
})();

/** Q4: the standard second-order low-pass, its slope and peak asked */
export const SVG_Q4 = subText(
  `${head(320, 112, '标准二阶低通环节，高频斜率与谐振尖峰条件待判断')}<text x="160" y="30" fill="#be123c" font-size="13" font-weight="700" text-anchor="middle">H(ω) = 1 / [1 + j2ζ(ω/ω_n) − (ω/ω_n)²]</text><line x1="40" y1="88" x2="290" y2="88" stroke="#94a3b8"/><polyline points="40,60 160,60" fill="none" stroke="#d97706" stroke-width="2.4" stroke-dasharray="7 4"/><line x1="160" y1="46" x2="160" y2="96" stroke="#e11d48" stroke-dasharray="3 3"/><text x="160" y="106" fill="${MUTED}" font-size="10.5" text-anchor="middle">ω_n</text><text x="230" y="64" fill="#b45309" font-size="11" font-weight="700" text-anchor="middle">高频斜率 = ?</text><text x="100" y="52" fill="${MUTED}" font-size="10.5" text-anchor="middle">0 dB</text><text x="230" y="82" fill="#be123c" font-size="11" text-anchor="middle">何时出现尖峰？ζ = ?</text></svg>`,
);
