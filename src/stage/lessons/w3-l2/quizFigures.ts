// Diagrams for the W3-L2 self-test and the W3-L3 preview (new: the sheet has none), drawn in the
// sheet's dark style and recoloured like the act diagrams. None of them shows an answer.

import { light } from './svgs';

const R = String.raw;

/** an op-amp triangle with − on top, + below (apex to the right) */
const amp = (x: number, y: number, w = 70, h = 76, label = 'IDEAL') =>
  R`<polygon points="${x},${y} ${x},${y + h} ${x + w},${y + h / 2}" fill="#1e293b" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="${x + 7}" y="${y + 21}" fill="#f87171" font-family="monospace" font-size="14" font-weight="700">−</text>
  <text x="${x + 7}" y="${y + h - 10}" fill="#4ade80" font-family="monospace" font-size="14" font-weight="700">+</text>
  <text x="${x + w / 2 - 4}" y="${y + h / 2 + 4}" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="10" font-weight="700">${label}</text>`;

const ground = (x: number, y: number) =>
  R`<line x1="${x - 11}" y1="${y}" x2="${x + 11}" y2="${y}" stroke="#94a3b8" stroke-width="2"/>
  <line x1="${x - 7}" y1="${y + 5}" x2="${x + 7}" y2="${y + 5}" stroke="#94a3b8" stroke-width="2"/>
  <line x1="${x - 3}" y1="${y + 10}" x2="${x + 3}" y2="${y + 10}" stroke="#94a3b8" stroke-width="2"/>`;

const head = (t: string, h = 170) =>
  R`<rect width="420" height="${h}" rx="10" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">${t}</text>`;

/** Q1: an open-loop op amp, − at 0 V, + at +0.5 mV, rails ±15 V */
export const SVG_Q1 =
  light(R`<svg viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="开环理想运放：反相端 0 V，同相端 +0.5 mV，供电 ±15 V，没有反馈电阻">
  ${head('Q1 · 开环：没有任何反馈电阻')}
  ${amp(180, 50)}
  <line x1="130" y1="66" x2="180" y2="66" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="130" y1="114" x2="180" y2="114" stroke="#e2e8f0" stroke-width="2"/>
  <text x="124" y="70" text-anchor="end" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="700">v₁ = 0 V</text>
  <text x="124" y="118" text-anchor="end" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">v₂ = +0.5 mV</text>
  <line x1="250" y1="88" x2="330" y2="88" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="330" cy="88" r="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="340" y="93" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="700">vₒ = ?</text>
  <line x1="215" y1="36" x2="215" y2="58" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3,3"/>
  <text x="215" y="32" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="10">+15 V</text>
  <line x1="215" y1="120" x2="215" y2="146" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3,3"/>
  <text x="215" y="158" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="10">−15 V</text>
  <text x="404" y="158" text-anchor="end" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10">v₁ 与 v₂ 的关系？i₁、i₂？</text>
</svg>`);

/** Q2: the inverting input node and the output node, each with a "KCL ?" */
export const SVG_Q2 = light(R`<svg viewBox="0 0 420 186" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="理想运放节点分析：反相节点 1 与输出节点 o，先对哪个节点列 KCL">
  ${head('Q2 · 求 vₒ：第一步对哪个节点列 KCL？', 186)}
  <g transform="translate(0 16)">
  ${amp(170, 52)}
  <line x1="100" y1="68" x2="170" y2="68" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="100" cy="68" r="4" fill="#fbbf24"/>
  <text x="100" y="58" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="11" font-weight="700">节点 1</text>
  <line x1="100" y1="68" x2="100" y2="138" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="92" y="96" width="16" height="30" rx="2" fill="#1e293b" stroke="#fbbf24" stroke-width="1.6"/>
  <text x="84" y="116" text-anchor="end" fill="#fbbf24" font-family="monospace" font-size="10">R₁</text>
  ${ground(100, 138)}
  <line x1="100" y1="68" x2="100" y2="40" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="100" y1="40" x2="300" y2="40" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="180" y="32" width="50" height="16" rx="2" fill="#1e293b" stroke="#38bdf8" stroke-width="1.6"/>
  <text x="205" y="29" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="10">R_f</text>
  <line x1="300" y1="40" x2="300" y2="90" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="240" y1="90" x2="350" y2="90" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="300" cy="90" r="4" fill="#38bdf8"/>
  <text x="310" y="84" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="700">节点 o</text>
  <line x1="300" y1="90" x2="300" y2="138" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/>
  <text x="308" y="128" fill="#94a3b8" font-family="monospace" font-size="10">R_L</text>
  <line x1="250" y1="102" x2="282" y2="102" stroke="#4ade80" stroke-width="2"/>
  <polygon points="282,97 290,102 282,107" fill="#4ade80"/>
  <text x="266" y="120" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="11" font-weight="700">iₒ</text>
  <text x="58" y="74" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="13" font-weight="700">KCL ?</text>
  <text x="372" y="94" fill="#e2e8f0" font-family="monospace" font-size="13" font-weight="700">KCL ?</text>
</g>
</svg>`);

/** Q3: a student's pencil wire drawn between the two inputs, with a question mark */
export const SVG_Q3 =
  light(R`<svg viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="学生把理想运放两输入端用导线短接，并画了一条从同相端流向反相端的电流">
  ${head('Q3 · 一位同学的草稿：把“虚短”画成了导线')}
  ${amp(220, 48, 80, 84)}
  <line x1="80" y1="66" x2="220" y2="66" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="80" y1="114" x2="220" y2="114" stroke="#e2e8f0" stroke-width="2"/>
  <text x="74" y="70" text-anchor="end" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="700">v₁</text>
  <text x="74" y="118" text-anchor="end" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">v₂</text>
  <line x1="170" y1="66" x2="170" y2="114" stroke="#f472b6" stroke-width="2.5"/>
  <circle cx="170" cy="66" r="4" fill="#f472b6"/>
  <circle cx="170" cy="114" r="4" fill="#f472b6"/>
  <line x1="184" y1="106" x2="184" y2="80" stroke="#f472b6" stroke-width="2"/>
  <polygon points="179,82 184,74 189,82" fill="#f472b6"/>
  <text x="194" y="95" fill="#f472b6" font-family="monospace" font-size="12" font-weight="700">i ?</text>
  <text x="120" y="96" text-anchor="middle" fill="#f472b6" font-family="system-ui, sans-serif" font-size="10">铅笔导线</text>
  <line x1="300" y1="90" x2="350" y2="90" stroke="#e2e8f0" stroke-width="2"/>
  <text x="358" y="95" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="700">vₒ</text>
  <text x="404" y="158" text-anchor="end" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10">这样画错在哪里？</text>
</svg>`);

/** Q4: Fig. 5.9 with a 3 kΩ load on the output, vₒ and iₒ unknown */
export const SVG_Q4 = light(R`<svg viewBox="0 0 420 186" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Example 5.2 电路在输出节点并联 3 kΩ 接地负载，求 vₒ 与 iₒ">
  ${head('Q4 · Fig. 5.9 + 输出端并联 R_L = 3 kΩ（供电 ±15 V）', 186)}
  <g transform="translate(0 16)">
  ${amp(190, 48)}
  <line x1="110" y1="64" x2="190" y2="64" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="110" cy="64" r="4" fill="#fbbf24"/>
  <line x1="110" y1="64" x2="110" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="102" y="98" width="16" height="32" rx="2" fill="#1e293b" stroke="#fbbf24" stroke-width="1.6"/>
  <text x="96" y="112" text-anchor="end" fill="#fbbf24" font-family="monospace" font-size="10">R₁</text>
  <text x="96" y="125" text-anchor="end" fill="#cbd5e1" font-family="monospace" font-size="9">10 kΩ</text>
  <line x1="110" y1="64" x2="110" y2="38" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="110" y1="38" x2="310" y2="38" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="190" y="30" width="58" height="16" rx="2" fill="#1e293b" stroke="#38bdf8" stroke-width="1.6"/>
  <text x="219" y="26" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="9">R_f = 20 kΩ</text>
  <line x1="310" y1="38" x2="310" y2="86" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="260" y1="86" x2="360" y2="86" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="310" cy="86" r="4" fill="#38bdf8"/>
  <line x1="310" y1="86" x2="310" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="302" y="104" width="16" height="32" rx="2" fill="#1e293b" stroke="#c084fc" stroke-width="1.6"/>
  <text x="324" y="118" fill="#c084fc" font-family="monospace" font-size="10">R_L</text>
  <text x="324" y="131" fill="#cbd5e1" font-family="monospace" font-size="9">3 kΩ</text>
  ${ground(310, 146)}
  <text x="366" y="90" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="700">vₒ = ?</text>
  <line x1="266" y1="98" x2="292" y2="98" stroke="#4ade80" stroke-width="2"/>
  <polygon points="292,93 300,98 292,103" fill="#4ade80"/>
  <text x="276" y="114" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="11" font-weight="700">iₒ = ?</text>
  <line x1="190" y1="112" x2="160" y2="112" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="160" y1="112" x2="160" y2="118" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="160" cy="132" r="14" fill="#0f172a" stroke="#4ade80" stroke-width="2"/>
  <text x="160" y="129" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="10" font-weight="700">+</text>
  <text x="160" y="141" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="10" font-weight="700">−</text>
  <text x="136" y="160" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="10">vₛ = 2 V</text>
  <line x1="160" y1="146" x2="160" y2="150" stroke="#e2e8f0" stroke-width="2"/>
</g>
</svg>`);

/** W3-L3 preview: the inverting amplifier, + input grounded, the virtual ground at the − input */
export const SVG_NEXT = light(R`<svg viewBox="0 0 420 186" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="下节预告：反相放大器，同相端接地，反相端成为虚地">
  ${head('W3-L3 预告 · 反相放大器：同相端接地 ⇒ 反相端“虚地”', 186)}
  <g transform="translate(0 16)">
  ${amp(210, 54)}
  <circle cx="50" cy="70" r="4" fill="#0f172a" stroke="#4ade80" stroke-width="2"/>
  <text x="44" y="64" text-anchor="end" fill="#4ade80" font-family="monospace" font-size="11" font-weight="700">vₛ</text>
  <line x1="54" y1="70" x2="90" y2="70" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="90" y="62" width="50" height="16" rx="2" fill="#1e293b" stroke="#fbbf24" stroke-width="1.6"/>
  <text x="115" y="58" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="10">R₁</text>
  <line x1="140" y1="70" x2="210" y2="70" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="170" cy="70" r="4" fill="#fbbf24"/>
  <text x="202" y="98" text-anchor="end" fill="#fbbf24" font-family="monospace" font-size="11" font-weight="700">v₁ = 0（虚地）</text>
  <line x1="170" y1="70" x2="170" y2="40" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="170" y1="40" x2="320" y2="40" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="220" y="32" width="50" height="16" rx="2" fill="#1e293b" stroke="#38bdf8" stroke-width="1.6"/>
  <text x="245" y="29" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="10">R_f</text>
  <line x1="320" y1="40" x2="320" y2="92" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="280" y1="92" x2="360" y2="92" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="320" cy="92" r="4" fill="#38bdf8"/>
  <text x="366" y="96" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="700">vₒ</text>
  <line x1="210" y1="118" x2="190" y2="118" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="190" y1="118" x2="190" y2="140" stroke="#e2e8f0" stroke-width="2"/>
  ${ground(190, 140)}
  <text x="182" y="134" text-anchor="end" fill="#4ade80" font-family="monospace" font-size="10">v₂ = 0</text>
</g>
</svg>`);
