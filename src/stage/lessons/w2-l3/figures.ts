// W2-L3 diagrams added here (not in the sheet), drawn in the sheet's dark board style (index.ts
// passes them through lightSvg; node dots are ink, which lightSvg keeps): the four self-test
// figures (each shows the set-up of its question, not the answer) and the act 6 method map.

const FONT = 'font-family="system-ui, -apple-system, sans-serif"';

/** clockwise mesh-current arc (centre, radius) */
const arc = (cx: number, cy: number, r: number, marker: string) =>
  `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx - r / 2} ${(cy + r * 0.866).toFixed(1)}" fill="none" stroke="#38bdf8" stroke-width="2.2" marker-end="url(#${marker})"/>`;

const markers = (p: string) => `<defs>
    <marker id="${p}-b" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9 Z" fill="#38bdf8"/></marker>
    <marker id="${p}-g" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,1 L9,5 L0,9 Z" fill="#10b981"/></marker>
  </defs>`;

/**
 * A two-mesh frame (left mesh 1, right mesh 2, mesh currents clockwise) with `mid` drawn in the
 * shared branch; `tags` are the mesh-current labels; `note` a line under the drawing.
 */
function twoMesh(p: { id: string; title: string; label: string; mid: string; tags: [string, string]; note: string }) {
  const L = 70;
  const M = 210;
  const R = 350;
  const T = 48;
  const B = 156;
  return `<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" ${FONT} role="img" aria-label="${p.label}">
  ${markers(p.id)}
  <rect width="420" height="200" rx="12" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="11.5" font-weight="600">${p.title}</text>
  <g stroke="#e2e8f0" stroke-width="2.2" fill="none" stroke-linejoin="round">
    <polyline points="${M},${T} ${L},${T} ${L},${B} ${M},${B}"/>
    <polyline points="${M},${T} ${R},${T} ${R},${B} ${M},${B}"/>
    <line x1="${M}" y1="${T}" x2="${M}" y2="${B}"/>
  </g>
  <rect x="${(L + M) / 2 - 18}" y="${T - 7}" width="36" height="14" rx="3" fill="#1e293b" stroke="#cbd5e1" stroke-width="1.8"/>
  <rect x="${(M + R) / 2 - 18}" y="${T - 7}" width="36" height="14" rx="3" fill="#1e293b" stroke="#cbd5e1" stroke-width="1.8"/>
  <rect x="${L - 7}" y="${(T + B) / 2 - 18}" width="14" height="36" rx="3" fill="#1e293b" stroke="#cbd5e1" stroke-width="1.8"/>
  <rect x="${R - 7}" y="${(T + B) / 2 - 18}" width="14" height="36" rx="3" fill="#1e293b" stroke="#cbd5e1" stroke-width="1.8"/>
  <circle cx="${M}" cy="${T}" r="3.5" fill="#1f2a44"/>
  <circle cx="${M}" cy="${B}" r="3.5" fill="#1f2a44"/>
  ${p.mid}
  ${arc(140, 104, 18, `${p.id}-b`)}
  ${arc(280, 104, 18, `${p.id}-b`)}
  <text x="140" y="109" fill="#38bdf8" font-size="13" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₁</text>
  <text x="280" y="109" fill="#38bdf8" font-size="13" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₂</text>
  <text x="140" y="142" fill="#bae6fd" font-size="11" font-weight="700" text-anchor="middle" font-family="monospace">${p.tags[0]}</text>
  <text x="280" y="142" fill="#bae6fd" font-size="11" font-weight="700" text-anchor="middle" font-family="monospace">${p.tags[1]}</text>
  <text x="210" y="186" fill="#cbd5e1" font-size="11" text-anchor="middle">${p.note}</text>
</svg>`;
}

/** Q1: circuit 甲, a planar ladder drawn as panes; circuit 乙, the three-by-three wiring. */
export const SVG_Q1 = (() => {
  const tops = [262, 322, 382];
  const lines = tops.flatMap((x) => tops.map((x2) => `<line x1="${x}" y1="64" x2="${x2}" y2="146"/>`)).join('');
  const dots = tops.map((x) => `<circle cx="${x}" cy="64" r="4" fill="#f43f5e"/><circle cx="${x}" cy="146" r="4" fill="#f43f5e"/>`).join('');
  return `<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" ${FONT} role="img" aria-label="电路甲：画成窗格的梯形电路；电路乙：三个节点各接三个节点">
  <rect width="420" height="200" rx="12" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="11.5" font-weight="600">Q1 · 两张拓扑图：电路甲与电路乙</text>
  <rect x="20" y="40" width="190" height="126" rx="10" fill="#1e293b" stroke="#334155"/>
  <g stroke="#e2e8f0" stroke-width="2" fill="none">
    <rect x="40" y="62" width="150" height="84"/>
    <line x1="90" y1="62" x2="90" y2="146"/>
    <line x1="140" y1="62" x2="140" y2="146"/>
  </g>
  <g fill="#1e293b" stroke="#cbd5e1" stroke-width="1.6">
    <rect x="58" y="56" width="16" height="12" rx="2"/><rect x="108" y="56" width="16" height="12" rx="2"/><rect x="158" y="56" width="16" height="12" rx="2"/>
    <rect x="84" y="96" width="12" height="18" rx="2"/><rect x="134" y="96" width="12" height="18" rx="2"/>
  </g>
  <circle cx="40" cy="104" r="10" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="115" y="160" fill="#cbd5e1" font-size="11" text-anchor="middle">电路甲</text>
  <rect x="222" y="40" width="182" height="126" rx="10" fill="#1e293b" stroke="#334155"/>
  <g stroke="#cbd5e1" stroke-width="1.8">${lines}</g>
  ${dots}
  <text x="313" y="160" fill="#cbd5e1" font-size="11" text-anchor="middle">电路乙：上 3 点各连下 3 点</text>
  <text x="210" y="188" fill="#94a3b8" font-size="11" text-anchor="middle">交叉处没有节点（导线只是“架桥”越过）</text>
</svg>`;
})();

/** Q2: the shared resistor between the two meshes, with the mesh currents given. */
export const SVG_Q2 = twoMesh({
  id: 'w23q2',
  title: 'Q2 · 已知两股顺时针网孔电流，求共享电阻 R₂ 上的真实电流',
  label: '双网孔电路，i1 = 2 A，i2 = −3 A，求共享电阻 R2 向下的电流',
  mid: `<rect x="203" y="84" width="14" height="40" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="2.2"/>
  <text x="226" y="100" fill="#fde68a" font-size="11.5" font-weight="700" font-family="monospace">R₂</text>
  <text x="226" y="116" fill="#fde68a" font-size="11" font-family="monospace">I↓ = ?</text>`,
  tags: ['i₁ = 2 A', 'i₂ = −3 A'],
  note: '两股网孔电流都按顺时针设定',
});

/** Q3: an upward 4 A source in the shared branch. */
export const SVG_Q3 = twoMesh({
  id: 'w23q3',
  title: 'Q3 · 共享支路里一个向上的 4 A 电流源',
  label: '双网孔电路，共享支路含向上 4 A 电流源，求内部 KCL 约束',
  mid: `<circle cx="210" cy="102" r="15" fill="#0f172a" stroke="#10b981" stroke-width="2.2"/>
  <line x1="210" y1="112" x2="210" y2="94" stroke="#10b981" stroke-width="2.4" marker-end="url(#w23q3-g)"/>
  <text x="232" y="106" fill="#6ee7b7" font-size="11.5" font-weight="700" font-family="monospace">4 A</text>`,
  tags: ['顺时针', '顺时针'],
  note: '超网孔配套的内部 KCL 约束 = ?',
});

/** Q4: a 5 A source with a series resistor that is changed from 10 Ω to 20 Ω. */
export const SVG_Q4 = twoMesh({
  id: 'w23q4',
  title: 'Q4 · 与共享电流源串联的电阻：10 Ω 换成 20 Ω',
  label: '双网孔电路，共享支路 5 A 电流源串联电阻，电阻从 10 Ω 换成 20 Ω',
  mid: `<rect x="203" y="58" width="14" height="28" rx="3" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="224" y="76" fill="#fda4af" font-size="11" font-weight="700" font-family="monospace">10 Ω → 20 Ω</text>
  <circle cx="210" cy="124" r="14" fill="#0f172a" stroke="#10b981" stroke-width="2.2"/>
  <line x1="210" y1="134" x2="210" y2="116" stroke="#10b981" stroke-width="2.4" marker-end="url(#w23q4-g)"/>
  <text x="230" y="128" fill="#6ee7b7" font-size="11.5" font-weight="700" font-family="monospace">5 A</text>`,
  tags: ['i₁ = ?', 'i₂ = ?'],
  note: '换电阻之后，哪些量会变、哪些不变？',
});

/** Act 6: the method in one picture. */
export const SVG_ACT6 = `<svg viewBox="0 0 820 300" xmlns="http://www.w3.org/2000/svg" ${FONT} role="img" aria-label="网孔分析法解题决策图：平面电路？统一顺时针设网孔电流，按电流源位置分三种情况">
  <defs>
    <marker id="act6m-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9 Z" fill="#94a3b8"/></marker>
  </defs>
  <rect width="820" height="300" rx="14" fill="#0f172a"/>
  <text x="24" y="34" fill="#f8fafc" font-size="15.5" font-weight="700">图 6-1：网孔分析法解题决策图（考前一页纸）</text>

  <rect x="24" y="74" width="160" height="64" rx="10" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
  <text x="104" y="100" fill="#d8b4fe" font-size="13.5" font-weight="700" text-anchor="middle">① 是平面电路吗？</text>
  <text x="104" y="122" fill="#94a3b8" font-size="11.5" text-anchor="middle">能否画成无非节点交叉</text>

  <rect x="24" y="212" width="160" height="52" rx="10" fill="#4c0519" stroke="#f43f5e" stroke-width="1.8"/>
  <text x="104" y="243" fill="#fda4af" font-size="13" font-weight="700" text-anchor="middle">改用节点电压法</text>
  <line x1="104" y1="138" x2="104" y2="206" stroke="#94a3b8" stroke-width="2" marker-end="url(#act6m-arr)"/>
  <text x="114" y="178" fill="#fda4af" font-size="12" font-weight="700">否</text>

  <line x1="184" y1="106" x2="222" y2="106" stroke="#94a3b8" stroke-width="2" marker-end="url(#act6m-arr)"/>
  <text x="203" y="98" fill="#6ee7b7" font-size="12" font-weight="700" text-anchor="middle">是</text>
  <rect x="228" y="74" width="170" height="64" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="313" y="100" fill="#bae6fd" font-size="13.5" font-weight="700" text-anchor="middle">② 统一顺时针</text>
  <text x="313" y="122" fill="#94a3b8" font-size="11.5" text-anchor="middle">设网孔电流 i₁ … iₙ</text>

  <line x1="398" y1="106" x2="434" y2="106" stroke="#94a3b8" stroke-width="2" marker-end="url(#act6m-arr)"/>
  <rect x="440" y="74" width="134" height="64" rx="10" fill="#1e293b" stroke="#cbd5e1" stroke-width="2"/>
  <text x="507" y="100" fill="#f8fafc" font-size="13.5" font-weight="700" text-anchor="middle">③ 电流源在哪？</text>
  <text x="507" y="122" fill="#94a3b8" font-size="11.5" text-anchor="middle">看它属于几个网孔</text>

  <path d="M 574 106 C 590 106, 590 74, 606 74" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#act6m-arr)"/>
  <line x1="574" y1="106" x2="606" y2="140" stroke="#94a3b8" stroke-width="2" marker-end="url(#act6m-arr)"/>
  <path d="M 574 106 C 590 106, 590 206, 606 206" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#act6m-arr)"/>

  <rect x="610" y="50" width="194" height="50" rx="9" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.6"/>
  <text x="707" y="70" fill="#bae6fd" font-size="12" font-weight="700" text-anchor="middle">没有电流源</text>
  <text x="707" y="89" fill="#e0f2fe" font-size="11.5" text-anchor="middle">每个网孔列 KVL（R i = v）</text>

  <rect x="610" y="116" width="194" height="50" rx="9" fill="#064e3b" stroke="#10b981" stroke-width="1.6"/>
  <text x="707" y="136" fill="#6ee7b7" font-size="12" font-weight="700" text-anchor="middle">外围边缘支路（1 个网孔）</text>
  <text x="707" y="155" fill="#a7f3d0" font-size="11.5" text-anchor="middle">直接锁死 iₖ = ±Is</text>

  <rect x="610" y="182" width="194" height="50" rx="9" fill="#451a03" stroke="#f59e0b" stroke-width="1.6"/>
  <text x="707" y="202" fill="#fcd34d" font-size="12" font-weight="700" text-anchor="middle">共享支路（2 个网孔）</text>
  <text x="707" y="221" fill="#fde68a" font-size="11.5" text-anchor="middle">超网孔：大外环 KVL + 内部 KCL</text>

  <text x="707" y="258" fill="#94a3b8" font-size="11.5" text-anchor="middle">与电流源串联的电阻：不进方程，</text>
  <text x="707" y="276" fill="#94a3b8" font-size="11.5" text-anchor="middle">只改变功率 I²R 与电流源端电压</text>
</svg>`;
