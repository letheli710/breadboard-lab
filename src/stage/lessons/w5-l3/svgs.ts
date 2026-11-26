// The W5-L3 act diagrams and guided-step diagrams: the sheet's SVGs (sheetSvgs.ts, copied by a
// script). They are drawn for a light canvas already, so they do NOT go through lightSvg. One
// change, of typography only: a symbol written with an underscore in the diagram text (I_s, Z_C,
// V_s, i_s(t), I_x …) gets its subscript set low and small (the words are unchanged). No diagram
// prints a guided-step answer before its step (checked in lesson.test.ts), so nothing else moves.

import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_MINI1, SHEET_MINI2, SHEET_MINI3, SHEET_MINI4, SHEET_MINI5 } from './sheetSvgs';

/** set the subscript of underscore symbols in <text> low and small: "Z_C" → Z, C (sub) */
export function subText(svg: string): string {
  return svg.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (_m, open: string, body: string, close: string) => {
    const parts = body.split(/(?<=[A-Za-z])_([A-Za-z0-9]+)/);
    if (parts.length === 1) return open + body + close;
    let out = parts[0];
    for (let i = 1; i < parts.length; i += 2) out += `<tspan dy="3" font-size="78%">${parts[i]}</tspan><tspan dy="-3">${parts[i + 1] || '&#8203;'}</tspan>`;
    return open + out + close;
  });
}

export const SVG_ACT1 = subText(SHEET_ACT1);
export const SVG_ACT2 = subText(SHEET_ACT2);
export const SVG_ACT3 = subText(SHEET_ACT3);
export const SVG_ACT4 = subText(SHEET_ACT4);
export const SVG_ACT5 = subText(SHEET_ACT5);
export const MINI_STEP1 = subText(SHEET_MINI1);
export const MINI_STEP2 = subText(SHEET_MINI2);
export const MINI_STEP3 = subText(SHEET_MINI3);
export const MINI_STEP4 = subText(SHEET_MINI4);
export const MINI_STEP5 = subText(SHEET_MINI5);
