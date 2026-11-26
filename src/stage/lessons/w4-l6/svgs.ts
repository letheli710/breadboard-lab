// The W4-L6 act diagrams and guided-step diagrams: the sheet's SVGs (sheetSvgs.ts, copied by a
// script), drawn for a dark canvas and recoloured for the light theme by lightSvg. Changes, of
// colour and typography only, except where the anti-spoiler rule asks for more:
// - a symbol written with an underscore in the diagram text (v_C, i_L(0⁺), dv_C/dt, R_p …) gets its
//   subscript set low and small (the words are unchanged);
// - the dark inner boxes #0f172a become the paper tint (lightSvg), the slate axis lines of act 1's
//   little waveforms (#475569 → a pale hairline) are set a shade darker so the t axis still reads;
// - anti-spoiler: the step 2 diagram drew the answer (L as a 4 A current source, C as a 12 V voltage
//   source, with their symbols), so MINI_STEP2 asks it instead (same size, same style); the step 3
//   diagram printed i_R2 = 12/6 = 2 A (half of the KCL it asks for) and the step 4 diagram the
//   divisions 2/0.5 and 0/0.25, so those numbers become "?" (the formulas stay).

import { lightSvg } from '../../svgTheme';
import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_MINI1, SHEET_MINI3, SHEET_MINI4, SHEET_MINI5 } from './sheetSvgs';

/** replace `a` by `b`, and fail loudly when the sheet text has changed under us */
function must(s: string, a: string, b: string): string {
  if (!s.includes(a)) throw new Error(`W4-L6 svgs: "${a}" not found`);
  return s.split(a).join(b);
}

/** set the subscript of underscore symbols in <text> low and small: "v_C(0⁻)" → v, C (sub), "(0⁻)" */
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
  const s = lightSvg(svg.replace('<svg ', `<svg role="img" aria-label="${label}" `)).replace(/stroke="#cbd5e1" stroke-width="1"\/>/g, 'stroke="#94a3b8" stroke-width="1"/>');
  return subText(s);
}

export const SVG_ACT1 = sheet(SHEET_ACT1, '二阶电路 6 个边界值与守恒/跃变物理边界对照图');
export const SVG_ACT2 = sheet(SHEET_ACT2, '同一 RLC 电路在 t=0⁻、t=0⁺、t=∞ 的三联等效替换对比图');
export const SVG_ACT3 = sheet(SHEET_ACT3, '例题一：串联型 SPDT 开关 RLC 三时刻等效电路图');
export const SVG_ACT4 = sheet(SHEET_ACT4, '例题二：混合型双电源 RLC 三时刻等效电路图');
export const SVG_ACT5 = sheet(SHEET_ACT5, '交互引导例题：开关 S 在 t=0 断开的二阶 RLC 电路');

const mini = (s: string) => subText(lightSvg(s)).replace('<svg ', '<svg style="max-width:380px" ');

export const MINI_STEP1 = mini(SHEET_MINI1);
/** step 2: which source replaces L and which replaces C, asked (the sheet's diagram drew them) */
export const MINI_STEP2 = mini(
  String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 110" width="300" height="110"><rect x="0" y="0" width="300" height="110" rx="8" fill="#0F172A"/><text x="150" y="22" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">t=0⁺ 冻结替换台</text><rect x="52" y="40" width="60" height="42" rx="8" fill="#1E293B" stroke="#A78BFA" stroke-width="2" stroke-dasharray="4,3"/><text x="82" y="67" text-anchor="middle" fill="#A78BFA" font-family="sans-serif" font-size="16" font-weight="bold">L → ?</text><text x="82" y="98" text-anchor="middle" fill="#A78BFA" font-family="sans-serif" font-size="11">i_L(0⁺) = 4A 被锁死</text><rect x="188" y="40" width="60" height="42" rx="8" fill="#1E293B" stroke="#34D399" stroke-width="2" stroke-dasharray="4,3"/><text x="218" y="67" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="16" font-weight="bold">C → ?</text><text x="218" y="98" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="11">v_C(0⁺) = 12V 被锁死</text></svg>`,
);
export const MINI_STEP3 = mini(must(SHEET_MINI3, '>i_R2=12/6=2A<', '>i_R2 = ?<'));
export const MINI_STEP4 = mini(must(must(SHEET_MINI4, '>= 2 / 0.5<', '>= ? V/s<'), '>= 0 / 0.25<', '>= ? A/s<'));
export const MINI_STEP5 = mini(SHEET_MINI5);
