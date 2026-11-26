// W2-L1 added diagrams (the sheet has none for these): one small figure per quiz question, drawn so
// it sets the question up without answering it, and the W2-L2 preview. Light theme, the sheet's
// palette (v₁ red, v₂ blue, v₃ purple, reference green); arrowheads are plain polygons, so there
// are no marker ids to collide with the act diagrams.

const FONT = 'font-family="system-ui, -apple-system, sans-serif"';
const frame = (w: number, h: number, label: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${FONT} role="img" aria-label="${label}">
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
${body}
</svg>`;

/** vertical resistor zigzag from (x, y1) to (x, y2) */
const zigV = (x: number, y1: number, y2: number, stroke = '#334155') => {
  const p: string[] = [`${x},${y1}`];
  for (let i = 1; i < 7; i++) p.push(`${x + (i % 2 ? 8 : -8)},${(y1 + ((y2 - y1) * (i - 0.5)) / 6).toFixed(1)}`);
  p.push(`${x},${y2}`);
  return `<polyline points="${p.join(' ')}" fill="none" stroke="${stroke}" stroke-width="2"/>`;
};
const zigH = (x1: number, x2: number, y: number, stroke = '#334155') => {
  const p: string[] = [`${x1},${y}`];
  for (let i = 1; i < 7; i++) p.push(`${(x1 + ((x2 - x1) * (i - 0.5)) / 6).toFixed(1)},${y + (i % 2 ? -8 : 8)}`);
  p.push(`${x2},${y}`);
  return `<polyline points="${p.join(' ')}" fill="none" stroke="${stroke}" stroke-width="2"/>`;
};
/** arrowhead at (x, y) pointing in direction dir */
const head = (x: number, y: number, dir: 'up' | 'down' | 'left' | 'right', fill: string) => {
  const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
  const [ux, uy] = d;
  const bx = x - ux * 9;
  const by = y - uy * 9;
  return `<polygon points="${x},${y} ${bx - uy * 5},${by + ux * 5} ${bx + uy * 5},${by - ux * 5}" fill="${fill}"/>`;
};
const gnd = (x: number, y: number, c = '#16A34A') =>
  `<g stroke="${c}" stroke-width="2.4"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 14}"/><line x1="${x - 14}" y1="${y + 14}" x2="${x + 14}" y2="${y + 14}"/><line x1="${x - 9}" y1="${y + 20}" x2="${x + 9}" y2="${y + 20}"/><line x1="${x - 4}" y1="${y + 26}" x2="${x + 4}" y2="${y + 26}"/></g>`;
const pill = (x: number, y: number, w: number, text: string, stroke: string, fill: string, ink: string) =>
  `<rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${ink}">${text}</text>`;

/** Q1: example 1 with the ground moved to node 2; the new potentials are asked for */
export const SVG_Q1 = frame(
  440,
  200,
  '例题 1 电路，参考地改选在节点 2',
  `  <text x="20" y="26" font-size="12.5" font-weight="700" fill="#475569">Q1 · 例题 1 电路，参考地改到节点 2</text>
  <line x1="70" y1="86" x2="170" y2="86" stroke="#DC2626" stroke-width="3"/>
  ${zigH(170, 250, 86)}
  <text x="210" y="112" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">R₂ = 4 Ω</text>
  <line x1="250" y1="86" x2="370" y2="86" stroke="#16A34A" stroke-width="3"/>
  ${gnd(330, 86)}
  <line x1="70" y1="170" x2="370" y2="170" stroke="#0891B2" stroke-width="3"/>
  <line x1="70" y1="86" x2="70" y2="110" stroke="#334155" stroke-width="2"/>
  <circle cx="70" cy="128" r="17" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
  <line x1="70" y1="139" x2="70" y2="124" stroke="#DC2626" stroke-width="2.2"/>${head(70, 117, 'up', '#DC2626')}
  <line x1="70" y1="145" x2="70" y2="170" stroke="#334155" stroke-width="2"/>
  <text x="48" y="132" text-anchor="end" font-size="11.5" font-weight="700" fill="#B91C1C">5 A</text>
  <line x1="130" y1="86" x2="130" y2="104" stroke="#334155" stroke-width="2"/>${zigV(130, 104, 152)}<line x1="130" y1="152" x2="130" y2="170" stroke="#334155" stroke-width="2"/>
  <text x="142" y="134" font-size="11.5" font-weight="700" fill="#334155">R₁ = 2 Ω</text>
  <line x1="290" y1="86" x2="290" y2="104" stroke="#334155" stroke-width="2"/>${zigV(290, 104, 152)}<line x1="290" y1="152" x2="290" y2="170" stroke="#334155" stroke-width="2"/>
  <text x="272" y="134" text-anchor="end" font-size="11.5" font-weight="700" fill="#334155">R₃ = 6 Ω</text>
  <line x1="150" y1="86" x2="150" y2="50" stroke="#DC2626" stroke-width="2"/><line x1="150" y1="50" x2="196" y2="50" stroke="#334155" stroke-width="2"/>
  <circle cx="210" cy="50" r="14" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <line x1="219" y1="50" x2="206" y2="50" stroke="#D97706" stroke-width="2.2"/>${head(200, 50, 'left', '#D97706')}
  <line x1="224" y1="50" x2="270" y2="50" stroke="#334155" stroke-width="2"/><line x1="270" y1="50" x2="270" y2="86" stroke="#334155" stroke-width="2"/>
  <text x="236" y="40" font-size="11.5" font-weight="700" fill="#B45309">10 A</text>
  ${pill(392, 66, 76, 'v₂′ = 0 V', '#16A34A', '#DCFCE7', '#15803D')}
  ${pill(100, 64, 64, 'v₁′ = ?', '#DC2626', '#FEE2E2', '#B91C1C')}
  ${pill(392, 170, 76, 'v₀′ = ?', '#0891B2', '#CFFAFE', '#0E7490')}
  <text x="220" y="192" text-anchor="middle" font-size="11" fill="#64748B">原来（底部接地）：v₁ = 15 V，v₂ = −15 V</text>`,
);

/** Q2: an 8 A source across two non-reference nodes, arrow from v_a to v_b */
export const SVG_Q2 = frame(
  440,
  170,
  '电流源 8 A 跨接在 va 与 vb 之间，箭头由 va 指向 vb',
  `  <text x="20" y="26" font-size="12.5" font-weight="700" fill="#475569">Q2 · 跨接电流源：两边方程的右侧各写什么？</text>
  <line x1="60" y1="80" x2="160" y2="80" stroke="#DC2626" stroke-width="3"/>
  <line x1="280" y1="80" x2="380" y2="80" stroke="#2563EB" stroke-width="3"/>
  <circle cx="110" cy="80" r="5" fill="#DC2626"/><circle cx="330" cy="80" r="5" fill="#2563EB"/>
  ${pill(110, 56, 40, 'vₐ', '#DC2626', '#FEE2E2', '#B91C1C')}
  ${pill(330, 56, 40, 'v<tspan baseline-shift="sub" font-size="9">b</tspan>', '#2563EB', '#DBEAFE', '#1D4ED8')}
  <line x1="160" y1="80" x2="200" y2="80" stroke="#334155" stroke-width="2"/>
  <circle cx="220" cy="80" r="20" fill="#FEF3C7" stroke="#D97706" stroke-width="2.2"/>
  <line x1="207" y1="80" x2="226" y2="80" stroke="#D97706" stroke-width="2.4"/>${head(234, 80, 'right', '#D97706')}
  <line x1="240" y1="80" x2="280" y2="80" stroke="#334155" stroke-width="2"/>
  <text x="220" y="52" text-anchor="middle" font-size="12" font-weight="700" fill="#B45309">Iₛ = 8 A</text>
  <line x1="80" y1="80" x2="80" y2="100" stroke="#94A3B8" stroke-width="2" stroke-dasharray="4,3"/><text x="80" y="116" text-anchor="middle" font-size="10.5" fill="#64748B">其余支路…</text>
  <line x1="360" y1="80" x2="360" y2="100" stroke="#94A3B8" stroke-width="2" stroke-dasharray="4,3"/><text x="360" y="116" text-anchor="middle" font-size="10.5" fill="#64748B">其余支路…</text>
  <rect x="40" y="128" width="160" height="28" rx="7" fill="#FFFFFF" stroke="#DC2626" stroke-width="1.3"/>
  <text x="120" y="147" text-anchor="middle" font-size="12" font-weight="700" fill="#B91C1C">vₐ 方程右侧：？</text>
  <rect x="240" y="128" width="160" height="28" rx="7" fill="#FFFFFF" stroke="#2563EB" stroke-width="1.3"/>
  <text x="320" y="147" text-anchor="middle" font-size="12" font-weight="700" fill="#1D4ED8">v<tspan baseline-shift="sub" font-size="9">b</tspan> 方程右侧：？</text>`,
);

/** Q3: R23 between a +4 V node and a −4 V node; size and direction asked for */
export const SVG_Q3 = frame(
  440,
  150,
  'R23 = 8 Ω 接在 v2 = +4 V 与 v3 = −4 V 之间',
  `  <text x="20" y="26" font-size="12.5" font-weight="700" fill="#475569">Q3 · 一正一负两个节点之间的电阻</text>
  <line x1="70" y1="90" x2="170" y2="90" stroke="#2563EB" stroke-width="3"/>
  ${zigH(170, 270, 90)}
  <line x1="270" y1="90" x2="370" y2="90" stroke="#7C3AED" stroke-width="3"/>
  <circle cx="110" cy="90" r="5" fill="#2563EB"/><circle cx="330" cy="90" r="5" fill="#7C3AED"/>
  ${pill(110, 64, 88, 'v₂ = +4 V', '#2563EB', '#DBEAFE', '#1D4ED8')}
  ${pill(330, 64, 88, 'v₃ = −4 V', '#7C3AED', '#F3E8FF', '#6D28D9')}
  <text x="220" y="70" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">R₂₃ = 8 Ω</text>
  <text x="220" y="126" text-anchor="middle" font-size="13" font-weight="800" fill="#B45309">i = ?　方向：v₂ → v₃ 还是 v₃ → v₂ ？</text>`,
);

/** Q4: the CCCS 2i_x controlled by the current through R12, and an empty 3 × 3 G */
export const SVG_Q4 = frame(
  440,
  180,
  '受控电流源 2ix，ix 为流经 R12 的电流；3×3 电导矩阵待填',
  `  <text x="20" y="26" font-size="12.5" font-weight="700" fill="#475569">Q4 · 受控源进入节点方程之后</text>
  <line x1="30" y1="80" x2="70" y2="80" stroke="#DC2626" stroke-width="3"/>
  ${zigH(70, 140, 80)}
  <line x1="140" y1="80" x2="180" y2="80" stroke="#2563EB" stroke-width="3"/>
  <text x="105" y="106" text-anchor="middle" font-size="11.5" font-weight="700" fill="#334155">R₁₂ = 2 Ω</text>
  <line x1="82" y1="56" x2="122" y2="56" stroke="#EA580C" stroke-width="2.4"/>${head(130, 56, 'right', '#EA580C')}
  <text x="105" y="47" text-anchor="middle" font-size="11.5" font-weight="800" fill="#C2410C">iₓ</text>
  <text x="34" y="70" font-size="11.5" font-weight="700" fill="#B91C1C">v₁</text><text x="168" y="70" font-size="11.5" font-weight="700" fill="#1D4ED8">v₂</text>
  <line x1="215" y1="64" x2="215" y2="88" stroke="#7C3AED" stroke-width="3"/>
  <text x="226" y="72" font-size="11.5" font-weight="700" fill="#6D28D9">v₃</text>
  <polygon points="215,88 236,112 215,136 194,112" fill="#F3E8FF" stroke="#7C3AED" stroke-width="2"/>
  <line x1="215" y1="101" x2="215" y2="118" stroke="#7C3AED" stroke-width="2.2"/>${head(215, 125, 'down', '#7C3AED')}
  <text x="244" y="116" font-size="12" font-weight="800" fill="#6D28D9">2iₓ</text>
  <line x1="215" y1="136" x2="215" y2="146" stroke="#334155" stroke-width="2"/>${gnd(215, 146)}
  <text x="355" y="52" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">G 对称吗？</text>
  <path d="M 300 64 L 294 64 L 294 160 L 300 160 M 410 64 L 416 64 L 416 160 L 410 160" fill="none" stroke="#334155" stroke-width="1.8"/>
  <g font-size="13" font-weight="700" fill="#64748B" text-anchor="middle">
    <text x="320" y="88">G₁₁</text><text x="355" y="88">?</text><text x="390" y="88">?</text>
    <text x="320" y="118">?</text><text x="355" y="118">G₂₂</text><text x="390" y="118">?</text>
    <text x="320" y="148">?</text><text x="355" y="148">?</text><text x="390" y="148">G₃₃</text>
  </g>`,
);

/** W2-L2 preview: a voltage source floating between two non-reference nodes, wrapped as a supernode */
export const SVG_NEXT = frame(
  440,
  170,
  '下节预告：悬空电压源与超节点',
  `  <text x="20" y="26" font-size="12.5" font-weight="700" fill="#475569">W2-L2 预告 · 电压源跨在两个非参考节点之间</text>
  <ellipse cx="220" cy="78" rx="150" ry="36" fill="none" stroke="#D97706" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="220" y="132" text-anchor="middle" font-size="12" font-weight="700" fill="#B45309">超节点（Supernode）：把 v₁、v₂ 和电压源圈成一个“大节点”</text>
  <line x1="90" y1="78" x2="180" y2="78" stroke="#DC2626" stroke-width="3"/>
  <line x1="260" y1="78" x2="350" y2="78" stroke="#2563EB" stroke-width="3"/>
  <circle cx="220" cy="78" r="20" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
  <text x="211" y="83" text-anchor="middle" font-size="13" font-weight="800" fill="#B91C1C">+</text><text x="230" y="83" text-anchor="middle" font-size="13" font-weight="800" fill="#334155">−</text>
  <line x1="180" y1="78" x2="200" y2="78" stroke="#334155" stroke-width="2"/><line x1="240" y1="78" x2="260" y2="78" stroke="#334155" stroke-width="2"/>
  <text x="220" y="50" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">Vₛ：电流写不出来</text>
  <text x="110" y="68" font-size="12" font-weight="700" fill="#B91C1C">v₁</text><text x="320" y="68" font-size="12" font-weight="700" fill="#1D4ED8">v₂</text>
  <text x="220" y="156" text-anchor="middle" font-size="11" fill="#64748B">约束方程：v₁ − v₂ = Vₛ（少一个未知数）</text>`,
);
