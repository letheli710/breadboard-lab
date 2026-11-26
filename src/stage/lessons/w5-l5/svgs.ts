// The W5-L5 act diagrams and guided-step diagrams: the sheet's SVGs (sheetSvgs.ts, copied by a
// script), drawn for a dark canvas and recoloured for the light theme by lightSvg. Changes:
// - colour: four sheet colours lightSvg does not map are set here first — the navy info boxes
//   #0F2942 (a dark box under dark text on the light theme) → pale blue #e0f2fe, and the pale text
//   colours #E9D5FF, #FBCFE8, #F3E8FF (unreadable on white) → their deep shades;
// - a symbol written with an underscore (V_Th, I_rms, R_L, Z_Th*, V_Th,rms …) gets its subscript set
//   low and small (the words are unchanged);
// - act 1: the two red p(t) < 0 polygons started one sample late (at ωt = 50° and 230° instead of
//   the zero crossings at 45° and 225°); they now start on the crossings;
// - act 5: 「R_L = R_Th 时效率 50% 达峰值」 read as if the efficiency peaked; it is the power that
//   peaks (with the efficiency at 50%); the red curve gets the X_Th = R_Th it was drawn for;
// - anti-spoiler: the step 3 diagram printed Z_L = 5 − j3 Ω, the step 4 diagram 10 V (and the ÷√2
//   it asks about), the step 5 diagram both divisions and 5 W: those become "?" (the formulas stay).
// Added: the guided example's problem diagram (the sheet has none), in the style of its step diagrams.

import { lightSvg } from '../../svgTheme';
import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_ACT6, SHEET_MINI1, SHEET_MINI2, SHEET_MINI3, SHEET_MINI4, SHEET_MINI5 } from './sheetSvgs';

/** replace `a` by `b`, and fail loudly when the sheet text has changed under us */
export function must(s: string, a: string, b: string): string {
  if (!s.includes(a)) throw new Error(`W5-L5 svgs: "${a}" not found`);
  return s.split(a).join(b);
}

/** set the subscript of underscore symbols in <text> low and small: "V_Th,rms²" → V, "Th,rms" (sub), "²" */
export function subText(svg: string): string {
  return svg.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (_m, open: string, body: string, close: string) => {
    const parts = body.split(/(?<=[A-Za-z])_([A-Za-z0-9]+(?:,[A-Za-z]+)?)/);
    if (parts.length === 1) return open + body + close;
    let out = parts[0];
    for (let i = 1; i < parts.length; i += 2) out += `<tspan dy="3" font-size="78%">${parts[i]}</tspan><tspan dy="-3">${parts[i + 1] || '&#8203;'}</tspan>`;
    return open + out + close;
  });
}

/** sheet colours lightSvg leaves as they are, set for the light theme */
function prefix(svg: string): string {
  return svg
    .replace(/fill="#0F2942"/g, 'fill="#e0f2fe"')
    .replace(/fill="#E9D5FF"/g, 'fill="#7e22ce"')
    .replace(/fill="#FBCFE8"/g, 'fill="#be185d"')
    .replace(/fill="#F3E8FF"/g, 'fill="#6d28d9"');
}

function sheet(svg: string, label: string): string {
  return subText(lightSvg(prefix(svg).replace('<svg ', `<svg role="img" aria-label="${label}" `)));
}

const act1 = must(must(SHEET_ACT1, 'points="163.2,215.0 163.2,227.9', 'points="154.4,215.0 163.2,227.9'), 'points="480.7,215.0 480.7,227.9', 'points="471.9,215.0 480.7,227.9');
const act5 = must(
  must(SHEET_ACT5, '>回路化归为纯电阻分压：R_L = R_Th 时效率 50% 达峰值<', '>回路化归为纯电阻分压：R_L = R_Th 时功率达峰值（效率 50%）<'),
  '>未抵消电抗 (X_L = 0)</text>',
  '>未抵消电抗 (X_L = 0)</text>\n  <text x="565" y="182" fill="#FCA5A5" font-size="10" font-family="sans-serif">（图中设 X_Th = R_Th）</text>',
);

export const SVG_ACT1 = sheet(act1, '三曲线同屏示波器：v(t)、i(t) 与二倍频瞬时功率 p(t)，相位差 60°');
export const SVG_ACT2 = sheet(SHEET_ACT2, 'R、L、C 三类纯元件的瞬时功率与平均功率对照');
export const SVG_ACT3 = sheet(SHEET_ACT3, '有效值的焦耳热等效与平方波形削峰填谷');
export const SVG_ACT4 = sheet(SHEET_ACT4, 'DC+AC 混合信号的勾股合成与三类波形的 RMS 系数');
export const SVG_ACT5 = sheet(act5, '交流共轭匹配等效电路与归一化功率峰值曲线');
export const SVG_ACT6 = sheet(SHEET_ACT6, '综合实战电路：戴维南等效与峰值 /8、RMS /4 双轨校验');

const mini = (s: string, label: string) => sheet(s, label).replace('<svg ', '<svg style="max-width:400px" ');

export const MINI_STEP1 = mini(SHEET_MINI1, '第 1 步：电源置零后从 a-b 向左看');
export const MINI_STEP2 = mini(SHEET_MINI2, '第 2 步：端口开路，+j8 Ω 中无电流');
/** step 3: Z_L asked (the sheet's diagram printed it) */
export const MINI_STEP3 = mini(must(must(SHEET_MINI3, '>Z_L = 5 - j3 Ω<', '>Z_L = ?<'), '>容性共轭抵消<', '>电抗怎样抵消？<'), '第 3 步：内阻抗与待定负载');
/** step 4: V_Th,rms and the operation asked */
export const MINI_STEP4 = mini(must(must(SHEET_MINI4, 'text-anchor="middle">10 V</text>', 'text-anchor="middle">? V</text>'), '>÷√2<', '>? √2<'), '第 4 步：峰值与有效值');
/** step 5: both formulas kept, their numbers asked */
export const MINI_STEP5 = mini(
  must(
    must(SHEET_MINI5, '>峰值公式: (10√2)² / (8×5) = 200/40 = 5 W<', '>峰值公式: |V_Th|² / (8 R_Th) = ? W<'),
    '>RMS公式:  10² / (4×5) = 100/20 = 5 W<',
    '>RMS公式: V_Th,rms² / (4 R_Th) = ? W<',
  ),
  '第 5 步：两条最大功率公式',
);

/** the guided example's circuit (drawn here in the step diagrams' style; the sheet gives none) */
export const SVG_GUIDED = mini(
  String.raw`<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="120" rx="6" fill="#0F172A"/><circle cx="34" cy="62" r="15" fill="#1E293B" stroke="#38BDF8" stroke-width="1.8"/><text x="34" y="66" fill="#38BDF8" font-size="10" text-anchor="middle">Vs</text><text x="12" y="112" fill="#94A3B8" font-size="9.5">Vs = 20∠0° V（峰值相量）</text><line x1="34" y1="47" x2="34" y2="35" stroke="#E2E8F0" stroke-width="2"/><line x1="34" y1="35" x2="75" y2="35" stroke="#E2E8F0" stroke-width="2"/><rect x="75" y="24" width="42" height="22" rx="3" fill="#1E293B" stroke="#10B981"/><text x="96" y="39" fill="#34D399" font-size="10" text-anchor="middle">10 Ω</text><line x1="117" y1="35" x2="195" y2="35" stroke="#E2E8F0" stroke-width="2"/><line x1="145" y1="35" x2="145" y2="52" stroke="#E2E8F0" stroke-width="2"/><rect x="122" y="52" width="46" height="22" rx="3" fill="#1E293B" stroke="#F472B6"/><text x="145" y="67" fill="#F472B6" font-size="10" text-anchor="middle">-j10 Ω</text><line x1="145" y1="74" x2="145" y2="90" stroke="#E2E8F0" stroke-width="2"/><rect x="195" y="24" width="46" height="22" rx="3" fill="#1E293B" stroke="#38BDF8"/><text x="218" y="39" fill="#38BDF8" font-size="10" text-anchor="middle">+j8 Ω</text><line x1="241" y1="35" x2="266" y2="35" stroke="#E2E8F0" stroke-width="2"/><line x1="34" y1="77" x2="34" y2="90" stroke="#E2E8F0" stroke-width="2"/><line x1="34" y1="90" x2="266" y2="90" stroke="#E2E8F0" stroke-width="2"/><circle cx="266" cy="35" r="3.5" fill="#FBBF24"/><circle cx="266" cy="90" r="3.5" fill="#FBBF24"/><text x="266" y="27" fill="#FBBF24" font-size="11" text-anchor="middle">a</text><text x="266" y="105" fill="#FBBF24" font-size="11" text-anchor="middle">b</text><path d="M 266 35 H 293 V 48 M 293 78 V 90 H 266" fill="none" stroke="#E2E8F0" stroke-width="2" stroke-dasharray="3,2"/><rect x="278" y="48" width="30" height="30" rx="3" fill="#1E293B" stroke="#FBBF24" stroke-dasharray="3,2"/><text x="293" y="67" fill="#FBBF24" font-size="10" text-anchor="middle">Z_L</text></svg>`,
  '引导例题电路：20∠0° V 峰值相量源、10 Ω、并联 −j10 Ω、串联 +j8 Ω、端口 a-b 接负载 Z_L',
);
