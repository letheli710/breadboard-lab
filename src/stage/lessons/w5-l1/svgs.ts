// The W5-L1 act diagrams and guided-step diagrams: the sheet's SVGs (sheetSvgs.ts), drawn for a dark
// canvas and recoloured for the light theme by lightSvg. Changes:
// - figure 1.1: the green sample point on the wave sat at ωt = 35° while the pointer it projects
//   is at ωt + φ = 55° (φ = 30°), i.e. ωt = 25° — moved to x = 25, where the wave's value is the
//   pointer's real part (48.8 px); the "实时投影映射" bridge ran level from the pointer's tip, i.e.
//   from its imaginary part (69.6 px), into the wave at the wrong height — it now carries the real-
//   axis shadow upright on a small "Re 投影" ruler and across to the sample point, as the stage does;
// - figure 2.1: the three compass arrows pointed from ±sin / −cos back to +cos, against the rule
//   the act states (clockwise = −90°, counter-clockwise = +90°): they now start on +cos and turn to
//   the function's axis (+sin −90° clockwise, −sin +90° and −cos ±180° counter-clockwise); the
//   ruler's φ₁ = −130° and φ₂ = −100° marks are moved to their scale positions (x = 126.7, 181.7 on
//   the −180°…0° scale), with the Δφ arrow between them;
// - figure 5.1: V/(jω) drawn 55 px long, with V 75 px and jωV 115 px (ω ≈ 1.53): now 49 px = 75/1.53;
// - anti-spoiler: the five step diagrams printed their own step's answer (20∠−60° and its vector,
//   (6 + j8), 10∠53.13°, 20/10 = 2 and 2∠−113.13°, "v(t) = 2 cos(4t − 113.13°)" under a "验证通过"
//   banner): those become "?" (answers of earlier steps stay), same size and style.

import { lightSvg } from '../../svgTheme';
import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_MINI1, SHEET_MINI2, SHEET_MINI3, SHEET_MINI4, SHEET_MINI5 } from './sheetSvgs';

/** replace `a` by `b`, and fail loudly when the sheet text has changed under us */
function must(s: string, a: string, b: string): string {
  if (!s.includes(a)) throw new Error(`W5-L1 svgs: "${a}" not found`);
  return s.split(a).join(b);
}
const fix = (s: string, pairs: [string, string][]) => pairs.reduce((x, [a, b]) => must(x, a, b), s);

/** set the subscript of underscore symbols in <text> low and small: "V_m" → V, m (sub) */
export function subText(svg: string): string {
  return svg.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (_m, open: string, body: string, close: string) => {
    const parts = body.split(/(?<=[A-Za-z])_([A-Za-z0-9]+)/);
    if (parts.length === 1) return open + body + close;
    let out = parts[0];
    for (let i = 1; i < parts.length; i += 2) out += `<tspan dy="3" font-size="78%">${parts[i]}</tspan><tspan dy="-3">${parts[i + 1] || '&#8203;'}</tspan>`;
    return open + out + close;
  });
}
/** fixes, subscripts, light theme */
const light = (svg: string, pairs: [string, string][] = []) => lightSvg(subText(fix(svg, pairs)));

const T = 'font-family="sans-serif"';

export const SVG_ACT1 = light(SHEET_ACT1, [
  [
    `<line x1="203.8" y1="125.4" x2="365" y2="125.4" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5,5" opacity="0.75"/>`,
    `<line x1="300" y1="195" x2="300" y2="146.2" stroke="#22c55e" stroke-width="3.5"/><line x1="300" y1="146.2" x2="355" y2="146.2" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5,5" opacity="0.75"/>`,
  ],
  [
    `<text x="275" y="118" fill="#7dd3fc" ${T} font-size="11" text-anchor="middle">实时投影映射</text>`,
    `<text x="300" y="213" fill="#7dd3fc" ${T} font-size="11" text-anchor="middle">Re 投影</text><text x="300" y="227" fill="#7dd3fc" ${T} font-size="11" text-anchor="middle">实时投影映射</text>`,
  ],
  [`<circle cx="35" cy="-48.8" r="4.5" fill="#22c55e"/>`, `<circle cx="25" cy="-48.8" r="4.5" fill="#22c55e"/>`],
  [`<line x1="35" y1="0" x2="35" y2="-48.8"`, `<line x1="25" y1="0" x2="25" y2="-48.8"`],
]);

export const SVG_ACT2 = light(SHEET_ACT2, [
  [`M 5 74 A 74 74 0 0 0 74 5`, `M 74 5 A 74 74 0 0 1 5 74`],
  [`M 5 -74 A 74 74 0 0 1 74 -5`, `M 74 -5 A 74 74 0 0 0 5 -74`],
  [`M -72 -12 A 74 74 0 0 1 68 -26`, `M 68 -26 A 74 74 0 0 0 -72 -12`],
  [
    `<text x="-115" y="5" fill="#f43f5e" ${T} font-size="13" font-weight="bold" text-anchor="end">−cos (±180°)</text>`,
    `<text x="-112" y="-3" fill="#f43f5e" ${T} font-size="13" font-weight="bold" text-anchor="end">−cos</text><text x="-112" y="13" fill="#f43f5e" ${T} font-size="13" font-weight="bold" text-anchor="end">(±180°)</text>`,
  ],
  [`<line x1="130" y1="126" x2="130" y2="148"`, `<line x1="126.7" y1="126" x2="126.7" y2="148"`],
  [`<circle cx="130" cy="138" r="5"`, `<circle cx="126.7" cy="138" r="5"`],
  [`<text x="130" y="166"`, `<text x="120" y="166"`],
  [`<line x1="187" y1="126" x2="187" y2="148"`, `<line x1="181.7" y1="126" x2="181.7" y2="148"`],
  [`<circle cx="187" cy="138" r="5"`, `<circle cx="181.7" cy="138" r="5"`],
  [`<text x="200" y="166"`, `<text x="194" y="166"`],
  [`<line x1="136" y1="115" x2="181" y2="115"`, `<line x1="131" y1="115" x2="176" y2="115"`],
  [`<text x="158" y="106"`, `<text x="154" y="106"`],
]);

export const SVG_ACT3 = light(SHEET_ACT3);
export const SVG_ACT4 = light(SHEET_ACT4);
export const SVG_ACT5 = light(SHEET_ACT5, [[`<line x1="0" y1="0" x2="27.5" y2="47.6"`, `<line x1="0" y1="0" x2="24.5" y2="42.4"`]]);

export const MINI_STEP1 = light(SHEET_MINI1, [
  [
    `<line x1="70" y1="55" x2="90" y2="90" stroke="#38bdf8" stroke-width="2.5"/><text x="95" y="88" fill="#38bdf8" ${T} font-size="11">20∠−60°</text>`,
    `<text x="102" y="49" fill="#94a3b8" ${T} font-size="10">+cos</text><text x="75" y="95" fill="#94a3b8" ${T} font-size="10">+sin</text><text x="22" y="30" fill="#38bdf8" ${T} font-size="11">V_s = 20∠?</text>`,
  ],
  [`30° − 90° = −60°`, `30° ? 90° = ?`],
]);
export const MINI_STEP2 = light(SHEET_MINI2, [[`(6 + j8) V = 20∠−60°`, `(6 + ?) V = 20∠−60°`]]);
export const MINI_STEP3 = light(SHEET_MINI3, [[`>10∠53.13°<`, `>r∠θ = ?<`]]);
export const MINI_STEP4 = light(SHEET_MINI4, [
  [`20 / 10 = 2`, `20 / 10 = ?`],
  [`−60° − 53.13° = −113.13°`, `−60° − 53.13° = ?`],
  [`V = 2∠−113.13° V`, `V = ? V`],
]);
export const MINI_STEP5 = light(SHEET_MINI5, [
  [`稳态特解验证通过！`, `逆变换：相量 → 时域`],
  [`font-size="14" font-weight="bold" text-anchor="middle">v(t) = 2 cos(4t − 113.13°) V`, `font-size="13" font-weight="bold" text-anchor="middle">V = 2∠−113.13° V ⇒ v(t) = ?`],
]);
