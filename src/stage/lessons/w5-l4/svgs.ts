// The W5-L4 act diagrams and guided-step diagrams: the sheet's SVGs (sheetSvgs.ts, copied by a
// script), drawn for a dark canvas and recoloured for the light theme by lightSvg. Changes:
// - the sheet's act diagrams style their shapes with <style> class rules (.wire, .panel, .title …).
//   A <style> element in inline SVG applies to the whole page (the six diagrams reuse the same class
//   names with different rules, and .title / .sub / .box could hit the site's own CSS), and
//   lightSvg recolours attributes, not style sheets: so `inlineClasses` writes each rule onto the
//   elements that use it as presentation attributes and drops the <style>. Where an element sets a
//   colour of its own (e.g. the blue "▼ 按频率拆分 …" title, the grey "（端口 a-b 外特性完全等价）"),
//   the element's colour is kept (in the sheet the class rule silently overrode it);
// - a symbol written with an underscore in the diagram text (v_o, R_L, Z_Th, V_x …) gets its
//   subscript set low and small (the words are unchanged); "jωR_fC_f" gets a space, so both
//   subscripts read; act 2's grey note「（端口 a-b 外特性完全等价）」ran into the right panel, so it
//   is set at 11 px;
// - anti-spoiler: the guided example's step diagrams printed the step's own answer — step 2 drew L
//   as a short ("L短路") and C as an open ("C开路"), steps 3 and 4 labelled the ω-dependent
//   impedances (2+j2 Ω, −j2 Ω / 2+j4 Ω, −j1 Ω), step 5 printed the final v_o(t); those become
//   "?" (same place, same style).

import { lightSvg } from '../../svgTheme';
import { SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5, SHEET_ACT6, SHEET_MINI1, SHEET_MINI2, SHEET_MINI3, SHEET_MINI4, SHEET_MINI5 } from './sheetSvgs';

/** replace `a` by `b`, and fail loudly when the sheet text has changed under us */
function must(s: string, a: string, b: string): string {
  if (!s.includes(a)) throw new Error(`W5-L4 svgs: "${a}" not found`);
  return s.split(a).join(b);
}

/** write the <style> class rules of an SVG onto its elements as attributes, and drop the <style> */
export function inlineClasses(svg: string): string {
  const css = /<style>([\s\S]*?)<\/style>/.exec(svg)?.[1];
  if (!css) return svg;
  const rules = new Map<string, [string, string][]>();
  for (const m of css.matchAll(/\.([\w-]+)\s*\{([^}]*)\}/g)) {
    const decls = m[2]
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const i = d.indexOf(':');
        return [d.slice(0, i).trim(), d.slice(i + 1).trim()] as [string, string];
      });
    rules.set(m[1], decls);
  }
  const out = svg.replace(/\s*<defs>\s*<style>[\s\S]*?<\/style>\s*<\/defs>/, '');
  return out.replace(/<([a-zA-Z][\w:-]*)([^<>]*?)\sclass="([^"]+)"([^<>]*?)(\/?)>/g, (_m, tag: string, pre: string, cls: string, post: string, close: string) => {
    let attrs = `${pre}${post}`;
    for (const c of cls.split(/\s+/)) {
      for (const [prop, value] of rules.get(c) ?? []) {
        if (new RegExp(`\\s${prop}=`).test(attrs)) continue;
        attrs += ` ${prop}="${value}"`;
      }
    }
    return `<${tag}${attrs}${close}>`;
  });
}

/** set the subscript of underscore symbols in <text> low and small: "V_Th" → V, Th (sub) */
export function subText(svg: string): string {
  return svg.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (_m, open: string, body: string, close: string) => {
    const parts = body.split(/(?<=[A-Za-z])_([A-Za-z0-9]+)/);
    if (parts.length === 1) return open + body + close;
    let out = parts[0];
    for (let i = 1; i < parts.length; i += 2) out += `<tspan dy="3" font-size="78%">${parts[i]}</tspan><tspan dy="-3">${parts[i + 1] || '&#8203;'}</tspan>`;
    return open + out + close;
  });
}

const act = (s: string) => subText(lightSvg(inlineClasses(s)));

export const SVG_ACT1 = act(SHEET_ACT1);
export const SVG_ACT2 = act(must(SHEET_ACT2, '<text class="lbl" x="372" y="164" fill="#94a3b8">', '<text class="lbl" x="366" y="164" fill="#94a3b8" font-size="11px">'));
export const SVG_ACT3 = act(SHEET_ACT3);
export const SVG_ACT4 = act(SHEET_ACT4);
export const SVG_ACT5 = act(must(SHEET_ACT5, '(1+jωR_fC_f)', '(1+jωR_f C_f)'));
export const SVG_ACT6 = act(SHEET_ACT6);

/** a "?" box in the guided-step diagrams, in the sheet's dark style (lightSvg recolours it) */
const ASK = (x: number, y: number, w: number, h: number) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#1e293b" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="3 3"/>`;

export const MINI_STEP1 = subText(lightSvg(SHEET_MINI1));
export const MINI_STEP2 = subText(
  lightSvg(
    [
      ['<line x1="145" y1="30" x2="215" y2="30" stroke="#fbbf24" stroke-width="3"/>', ASK(150, 22, 60, 16)],
      ['>L短路<', '>L → ?<'],
      [
        '<line x1="238" y1="30" x2="238" y2="50" stroke="#475569" stroke-dasharray="4 3"/>',
        `<line x1="238" y1="30" x2="238" y2="38" stroke="#e2e8f0" stroke-width="2"/>${ASK(228, 38, 20, 14)}`,
      ],
      ['>C开路<', '>C → ?<'],
    ].reduce((s, [a, b]) => must(s, a, b), SHEET_MINI2),
  ),
);
export const MINI_STEP3 = subText(
  lightSvg(
    [
      ['>2+j2 Ω<', '>2 + Z_L1<'],
      ['>-j2Ω<', '>Z_C1 = ?<'],
    ].reduce((s, [a, b]) => must(s, a, b), SHEET_MINI3),
  ),
);
export const MINI_STEP4 = subText(
  lightSvg(
    [
      ['>2+j4 Ω<', '>2 + Z_L2<'],
      ['>-j1Ω<', '>Z_C2 = ?<'],
    ].reduce((s, [a, b]) => must(s, a, b), SHEET_MINI4),
  ),
);
export const MINI_STEP5 = subText(lightSvg(must(SHEET_MINI5, '>4 + 8.94cos(2t+63.43°) + 5.73cos(4t-66.37°) V<', '>v_o(t) = ?（每个分量带上自己的 ωt）<')));
