// Diagrams for the W2-L5 self-test (new: the sheet has none), drawn in the sheet's dark style and
// recoloured with lightSvg like the act diagrams. None of them shows the answer.

import { lightSvg } from '../../svgTheme';

/** Q1: a 12 V voltage source and a 5 A current source, each to be replaced by "?" when zeroed. */
export const SVG_Q1 = lightSvg(String.raw`<svg viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="12 V 独立电压源与 5 A 独立电流源各自置零后换成什么">
  <rect width="420" height="170" rx="10" fill="#0F172A"/>
  <text x="16" y="24" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">Q1 · 把两个独立源“关机”（置零）：各换成什么？</text>
  <line x1="50" y1="46" x2="50" y2="68" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="50" cy="90" r="22" fill="#0F172A" stroke="#38BDF8" stroke-width="2.2"/>
  <text x="50" y="85" fill="#38BDF8" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle">+</text>
  <text x="50" y="104" fill="#38BDF8" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle">−</text>
  <line x1="50" y1="112" x2="50" y2="134" stroke="#E2E8F0" stroke-width="2"/>
  <text x="50" y="154" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="700" text-anchor="middle">12 V</text>
  <line x1="84" y1="90" x2="116" y2="90" stroke="#F59E0B" stroke-width="2"/>
  <polygon points="116,85 125,90 116,95" fill="#F59E0B"/>
  <text x="104" y="80" fill="#F59E0B" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">置零</text>
  <rect x="134" y="62" width="56" height="56" rx="6" fill="#1E293B" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="162" y="97" fill="#F8FAFC" font-family="monospace" font-size="20" font-weight="700" text-anchor="middle">?</text>
  <line x1="262" y1="46" x2="262" y2="68" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="262" cy="90" r="22" fill="#0F172A" stroke="#34D399" stroke-width="2.2"/>
  <line x1="262" y1="102" x2="262" y2="80" stroke="#34D399" stroke-width="2"/>
  <polygon points="257,82 262,74 267,82" fill="#34D399"/>
  <line x1="262" y1="112" x2="262" y2="134" stroke="#E2E8F0" stroke-width="2"/>
  <text x="262" y="154" fill="#34D399" font-family="monospace" font-size="12" font-weight="700" text-anchor="middle">5 A</text>
  <line x1="296" y1="90" x2="328" y2="90" stroke="#F59E0B" stroke-width="2"/>
  <polygon points="328,85 337,90 328,95" fill="#F59E0B"/>
  <text x="316" y="80" fill="#F59E0B" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">置零</text>
  <rect x="346" y="62" width="56" height="56" rx="6" fill="#1E293B" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="374" y="97" fill="#F8FAFC" font-family="monospace" font-size="20" font-weight="700" text-anchor="middle">?</text>
</svg>`);

/** Q2: a linear network holding 2 independent voltage sources, 1 independent current source and 2 dependent sources. */
export const SVG_Q2 =
  lightSvg(String.raw`<svg viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="线性电路：2 个独立电压源、1 个独立电流源、1 个 VCVS 与 1 个 CCCS">
  <rect width="420" height="170" rx="10" fill="#0F172A"/>
  <text x="16" y="24" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">Q2 · 一个线性电路里的全部电源（电阻网络省略）</text>
  <rect x="16" y="38" width="388" height="104" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
  <circle cx="60" cy="84" r="20" fill="#0F172A" stroke="#38BDF8" stroke-width="2.2"/>
  <text x="60" y="79" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="700" text-anchor="middle">+</text>
  <text x="60" y="96" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="700" text-anchor="middle">−</text>
  <text x="60" y="126" fill="#38BDF8" font-family="monospace" font-size="11" text-anchor="middle">V₁</text>
  <circle cx="130" cy="84" r="20" fill="#0F172A" stroke="#38BDF8" stroke-width="2.2"/>
  <text x="130" y="79" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="700" text-anchor="middle">+</text>
  <text x="130" y="96" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="700" text-anchor="middle">−</text>
  <text x="130" y="126" fill="#38BDF8" font-family="monospace" font-size="11" text-anchor="middle">V₂</text>
  <circle cx="200" cy="84" r="20" fill="#0F172A" stroke="#34D399" stroke-width="2.2"/>
  <line x1="200" y1="95" x2="200" y2="75" stroke="#34D399" stroke-width="2"/>
  <polygon points="195,77 200,69 205,77" fill="#34D399"/>
  <text x="200" y="126" fill="#34D399" font-family="monospace" font-size="11" text-anchor="middle">I₁</text>
  <polygon points="275,62 297,84 275,106 253,84" fill="#0F172A" stroke="#A78BFA" stroke-width="2.2"/>
  <text x="275" y="80" fill="#A78BFA" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">+</text>
  <text x="275" y="97" fill="#A78BFA" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">−</text>
  <text x="275" y="126" fill="#A78BFA" font-family="monospace" font-size="11" text-anchor="middle">μvₓ (VCVS)</text>
  <polygon points="355,62 377,84 355,106 333,84" fill="#0F172A" stroke="#A78BFA" stroke-width="2.2"/>
  <line x1="355" y1="95" x2="355" y2="75" stroke="#A78BFA" stroke-width="2"/>
  <polygon points="350,77 355,69 360,77" fill="#A78BFA"/>
  <text x="355" y="126" fill="#A78BFA" font-family="monospace" font-size="11" text-anchor="middle">βiₓ (CCCS)</text>
  <text x="210" y="160" fill="#CBD5E1" font-family="system-ui, sans-serif" font-size="10.5" text-anchor="middle">圆形 = 独立源，菱形 = 受控源</text>
</svg>`);

/** Q3 / Q4: one 5 Ω resistor and the current each source alone drives through it. */
function powerFigure(n: 3 | 4) {
  const bLeft = n === 4;
  const arrow = (y: number, color: string, left: boolean, label: string) => {
    const [x1, x2] = left ? [262, 158] : [158, 262];
    const tip = left ? `${x2 + 10},${y - 5} ${x2},${y} ${x2 + 10},${y + 5}` : `${x2 - 10},${y - 5} ${x2},${y} ${x2 - 10},${y + 5}`;
    return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="2.4"/><polygon points="${tip}" fill="${color}"/><text x="276" y="${y + 4}" fill="${color}" font-family="monospace" font-size="11.5" font-weight="700">${label}</text>`;
  };
  return lightSvg(`<svg viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="5 Ω 电阻：源 A、源 B 各自单独作用时的电流">
  <rect width="420" height="170" rx="10" fill="#0F172A"/>
  <text x="16" y="24" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">Q${n} · 同一个 5 Ω 电阻，两个独立源各自单独作用${bLeft ? '（B 已反接）' : ''}</text>
  <line x1="40" y1="64" x2="150" y2="64" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="150,64 158,54 168,74 178,54 188,74 198,54 208,74 218,54 228,74 238,54 248,74 262,64" fill="none" stroke="#F59E0B" stroke-width="2.4"/>
  <line x1="262" y1="64" x2="380" y2="64" stroke="#E2E8F0" stroke-width="2"/>
  <text x="206" y="44" fill="#F59E0B" font-family="monospace" font-size="12" font-weight="700" text-anchor="middle">R = 5 Ω</text>
  <circle cx="40" cy="64" r="3.5" fill="#94A3B8"/>
  <circle cx="380" cy="64" r="3.5" fill="#94A3B8"/>
  <text x="40" y="99" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="11">仅源 A</text>
  ${arrow(95, '#38BDF8', false, '2 A 向右（20 W）')}
  <text x="40" y="125" fill="#34D399" font-family="system-ui, sans-serif" font-size="11">仅源 B</text>
  ${arrow(121, '#34D399', bLeft, bLeft ? '4 A 向左（80 W）' : '4 A 向右（80 W）')}
  <text x="210" y="156" fill="#CBD5E1" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">A、B 同时作用：p = ?</text>
</svg>`);
}

export const SVG_Q3 = powerFigure(3);
export const SVG_Q4 = powerFigure(4);
