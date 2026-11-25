// The W3-L6 act diagrams and guided-step diagrams: the sheet's SVGs (sheetSvgs.ts, copied by a
// script), drawn for a dark canvas and recoloured for the light theme by lightSvg. Changes, of
// colour, typography and layout only, except where the anti-spoiler rule asks for more:
// - colours lightSvg leaves dark or pale on white: the panel fill #172033 → a light paper tint, the
//   pale red label #fecaca (act 4's R4) → deep red, the pink current arrows #f472b6 (act 2) → a
//   deeper pink;
// - the `height="auto"` attribute is dropped (not a valid SVG length; the browser logs an error);
// - a symbol written with an underscore in the diagram text (v_1, R_in1, v_o,cm, i_− …) gets its
//   subscript set low and small (the words are unchanged);
// - marker ids are prefixed per diagram, so two diagrams on one page cannot share an id;
// - act 2: the two KCL lines of the equation card drop to font-size 10 (they ran past the card);
// - anti-spoiler: act 5's circuit is the guided example (Sadiku Ex 5.7), so SVG_ACT5_TASK is the
//   sheet's figure 5.1 with R2 and R4 as "?" and the check card turned into the design target; the
//   full figure (SVG_ACT5) follows the guided example in the 通关复盘 board. The step 1, 3 and 5
//   diagrams of the sheet print their step's answer (Eq. 5.16 must be used; gain 6 and ratio 1/2;
//   −4 V and A_cm = −2), so MINI_STEP1/3/5 ask the question instead (same size, same style).

import { lightSvg } from '../../svgTheme';
import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_MINI2, SHEET_MINI4 } from './sheetSvgs';

/** replace `a` by `b`, and fail loudly when the sheet text has changed under us */
function must(s: string, a: string, b: string): string {
  if (!s.includes(a)) throw new Error(`W3-L6 svgs: "${a}" not found`);
  return s.split(a).join(b);
}

/** set the subscript of underscore symbols in <text> low and small: "v_b1 = 0" → v, b1 (sub), " = 0" */
export function subText(svg: string): string {
  return svg.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (_m, open: string, body: string, close: string) => {
    const parts = body.split(/(?<=[A-Za-z])_([A-Za-z0-9]+(?:,[A-Za-z0-9]+)?|[−+])/);
    if (parts.length === 1) return open + body + close;
    let out = parts[0];
    for (let i = 1; i < parts.length; i += 2) out += `<tspan dy="3" font-size="78%">${parts[i]}</tspan><tspan dy="-3">${parts[i + 1] || '&#8203;'}</tspan>`;
    return open + out + close;
  });
}

function sheet(svg: string, idPrefix: string): string {
  let s = svg.replace(/\sheight="auto"/, '');
  s = s.replace(/id="arr-/g, `id="${idPrefix}-arr-`).replace(/url\(#arr-/g, `url(#${idPrefix}-arr-`);
  s = lightSvg(s)
    .replace(/fill="#172033"/g, 'fill="#f6f1e6"')
    .replace(/fill="#fecaca"/g, 'fill="#991b1b"')
    .replace(/(fill|stroke)="#f472b6"/g, '$1="#db2777"');
  return subText(s);
}

export const SVG_ACT1 = sheet(SHEET_ACT1, 'w36a1');
/** act 2: the KCL lines of the equation card drop to font-size 10 (at 11 they ran past the card) */
export const SVG_ACT2 = sheet(must(must(SHEET_ACT2, 'font-size="11">1) KCL@a', 'font-size="10">1) KCL@a'), 'font-size="11">2) KCL@b', 'font-size="10">2) KCL@b'), 'w36a2');
export const SVG_ACT3 = sheet(SHEET_ACT3, 'w36a3');
export const SVG_ACT4 = sheet(SHEET_ACT4, 'w36a4');
/** figure 5.1 as in the sheet: the finished Ex 5.7 design (for the 通关复盘 board) */
export const SVG_ACT5 = sheet(SHEET_ACT5, 'w36a5');

/** figure 5.1 before the guided example: R2, R4 unknown, the check card states the target */
export const SVG_ACT5_TASK = sheet(
  [
    ['图 5.1 Sadiku Example 5.7 成品电路（目标：v_o = −5 v_1 + 3 v_2）', '图 5.1 Sadiku Example 5.7 待设计电路（目标：v_o = −5 v_1 + 3 v_2）'],
    ['>R_2 = 50 kΩ<', '>R_2 = ?<'],
    ['>R_4 = 10 kΩ<', '>R_4 = ?<'],
    ['设计系数回代验算：', '待定系数（逐项匹配 Eq. 5.16）：'],
    ['反相系数: −R_2/R_1 = −50/10 = −5', '反相系数: −R_2/R_1 = −5'],
    ['同相系数: (1+5)/(1+10/10) = 6/2 = +3', '同相系数: (1+R_2/R_1)/(1+R_3/R_4) = +3'],
    ['总输出: v_o = −5 v_1 + 3 v_2 (✓)', '求 R_2、R_4（已知 R_1 = R_3 = 10 kΩ）'],
    ['aria-label="Sadiku Example 5.7 成品设计电路图 vo = -5v1 + 3v2"', 'aria-label="Sadiku Example 5.7 待设计电路图 vo = -5v1 + 3v2"'],
  ].reduce((s, [a, b]) => must(s, a, b), SHEET_ACT5),
  'w36a5t',
);

const mini = (s: string) => subText(lightSvg(s)).replace('<svg ', '<svg style="max-width:380px" ');

/** step 1: is the matched formula usable here? (the sheet's diagram printed the answer) */
export const MINI_STEP1 = mini(
  String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90"><rect width="260" height="90" rx="8" fill="#0f172a"/><text x="130" y="26" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="13" font-weight="bold">目标：v_o = -5 v_1 + 3 v_2</text><text x="130" y="50" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11">Eq. 5.18：v_o = (R_2/R_1)(v_2 - v_1)</text><text x="130" y="74" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">两式里 v_1、v_2 的系数对得上吗？</text></svg>`,
);
export const MINI_STEP2 = mini(SHEET_MINI2);
/** step 3: the non-inverting gain and the divider ratio, both asked */
export const MINI_STEP3 = mini(
  String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90"><rect width="260" height="90" rx="8" fill="#0f172a"/><text x="130" y="28" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="12">同相本体增益 = 1 + R_2/R_1 = ?</text><text x="130" y="52" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="12">? × [R_4 / (R_3 + R_4)] = 3</text><text x="130" y="76" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="11">⇒ 分压比 = ?</text></svg>`,
);
export const MINI_STEP4 = mini(SHEET_MINI4);
/** step 5: the pure common-mode test, output asked */
export const MINI_STEP5 = mini(
  String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90"><rect width="260" height="90" rx="8" fill="#0f172a"/><text x="130" y="28" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="12">v_1 = v_2 = 2 V (纯共模)</text><text x="130" y="52" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="13" font-weight="bold">v_o = -5(2) + 3(2) = ?</text><text x="130" y="76" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">A_cm 等于 0 吗？</text></svg>`,
);
