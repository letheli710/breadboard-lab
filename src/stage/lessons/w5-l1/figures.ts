// The self-test figures (the sheet has none): small light-theme diagrams of what each question
// gives, none of them drawing its answer.

const F = 'font-family="ui-monospace, monospace"';
const BG = '<rect x="1" y="1" width="278" height="128" rx="10" fill="#fbf7ef" stroke="#e3d8c2"/>';
const head = (label: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 130" width="280" height="130" role="img" aria-label="${label}">${BG}`;

/** Q1: the two waves as given and an empty trig compass */
export const SVG_Q1 = `${head('两个同频电压与三角罗盘')}
<circle cx="70" cy="66" r="44" fill="#fff" stroke="#d6c9ae" stroke-width="1.4"/>
<line x1="22" y1="66" x2="118" y2="66" stroke="#94a3b8" stroke-width="1.3"/><line x1="70" y1="18" x2="70" y2="114" stroke="#94a3b8" stroke-width="1.3"/>
<text x="121" y="70" fill="#1f2a44" font-size="10" font-weight="700" ${F}>+cos</text>
<text x="70" y="14" fill="#1f2a44" font-size="10" font-weight="700" text-anchor="middle" ${F}>−sin</text>
<text x="20" y="62" fill="#1f2a44" font-size="10" font-weight="700" text-anchor="end" ${F}>−cos</text>
<text x="70" y="126" fill="#1f2a44" font-size="10" font-weight="700" text-anchor="middle" ${F}>+sin</text>
<text x="70" y="70" fill="#5f626b" font-size="13" font-weight="800" text-anchor="middle" ${F}>?</text>
<text x="150" y="50" fill="#be123c" font-size="11" font-weight="700" ${F}>v₁ = −5sin(100t+20°)</text>
<text x="150" y="74" fill="#0369a1" font-size="11" font-weight="700" ${F}>v₂ = 8cos(100t+60°)</text>
<text x="150" y="98" fill="#5f626b" font-size="10" ${F}>先统一为正余弦，再比较</text>
</svg>`;

/** Q2: the point −5 + j5 in the complex plane, its angle asked */
export const SVG_Q2 = `${head('复平面上的 −5 + j5')}
<line x1="20" y1="80" x2="200" y2="80" stroke="#94a3b8" stroke-width="1.3"/><line x1="120" y1="122" x2="120" y2="12" stroke="#94a3b8" stroke-width="1.3"/>
<text x="198" y="94" fill="#5f626b" font-size="10" text-anchor="end" ${F}>Re</text><text x="125" y="20" fill="#5f626b" font-size="10" ${F}>Im</text>
<line x1="70" y1="30" x2="70" y2="80" stroke="#7c3aed" stroke-width="1.2" stroke-dasharray="3 3"/><line x1="70" y1="30" x2="120" y2="30" stroke="#7c3aed" stroke-width="1.2" stroke-dasharray="3 3"/>
<line x1="120" y1="80" x2="74" y2="34" stroke="#0284c7" stroke-width="2.6"/><circle cx="70" cy="30" r="4" fill="#0284c7"/>
<text x="14" y="18" fill="#0369a1" font-size="11" font-weight="800" ${F}>Z = −5 + j5</text>
<text x="70" y="94" fill="#6d28d9" font-size="10" text-anchor="middle" ${F}>x = −5</text><text x="126" y="34" fill="#6d28d9" font-size="10" ${F}>y = 5</text>
<text x="214" y="34" fill="#b45309" font-size="11" font-weight="800" ${F}>φ = ?</text>
<text x="214" y="50" fill="#5f626b" font-size="10" ${F}>r∠φ</text><text x="214" y="66" fill="#5f626b" font-size="10" ${F}>= ?</text>
</svg>`;

/** Q3: the current phasor 3∠−30° and the operator to apply */
export const SVG_Q3 = `${head('电流相量与求导算子')}
<line x1="20" y1="70" x2="170" y2="70" stroke="#94a3b8" stroke-width="1.3"/><line x1="80" y1="122" x2="80" y2="12" stroke="#94a3b8" stroke-width="1.3"/>
<text x="168" y="84" fill="#5f626b" font-size="10" text-anchor="end" ${F}>Re</text><text x="85" y="20" fill="#5f626b" font-size="10" ${F}>Im</text>
<line x1="80" y1="70" x2="129" y2="98" stroke="#0284c7" stroke-width="2.8"/><polygon points="134,101 124,100 128,93" fill="#0284c7"/>
<text x="136" y="114" fill="#0369a1" font-size="11" font-weight="800" ${F}>I = 3∠−30°</text>
<text x="190" y="44" fill="#be123c" font-size="12" font-weight="800" ${F}>d/dt ↔ ?</text>
<text x="190" y="66" fill="#1f2a44" font-size="10.5" ${F}>ω = 10 rad/s</text>
<text x="190" y="86" fill="#5f626b" font-size="10.5" ${F}>dI/dt 的相量 = ?</text>
</svg>`;

/** Q4: the two terms as given and the student's sum */
export const SVG_Q4 = `${head('两个余弦项与某同学的相量相加')}
<line x1="14" y1="48" x2="160" y2="48" stroke="#cbd5e1" stroke-width="1"/><line x1="14" y1="100" x2="160" y2="100" stroke="#cbd5e1" stroke-width="1"/>
<path d="${wave(14, 48, 146, 15, 1)}" fill="none" stroke="#0284c7" stroke-width="2"/>
<path d="${wave(14, 100, 146, 20, 2)}" fill="none" stroke="#d97706" stroke-width="2"/>
<text x="14" y="20" fill="#0369a1" font-size="10.5" font-weight="700" ${F}>3cos(10t)</text>
<text x="14" y="76" fill="#b45309" font-size="10.5" font-weight="700" ${F}>4cos(20t)</text>
<rect x="172" y="34" width="98" height="62" rx="7" fill="#fff" stroke="#e3d8c2"/>
<text x="221" y="54" fill="#1f2a44" font-size="10.5" font-weight="700" text-anchor="middle" ${F}>3∠0° + 4∠0°</text>
<text x="221" y="72" fill="#1f2a44" font-size="10.5" font-weight="700" text-anchor="middle" ${F}>= 7∠0° ?</text>
<text x="221" y="88" fill="#5f626b" font-size="9.5" text-anchor="middle" ${F}>对吗？</text>
</svg>`;

/** a cosine of `cycles` periods over [x0, x0 + w] around y */
function wave(x0: number, y: number, w: number, A: number, cycles: number): string {
  return Array.from({ length: 121 }, (_, i) => `${i ? 'L' : 'M'} ${(x0 + (i / 120) * w).toFixed(1)} ${(y - A * Math.cos((i / 120) * cycles * 2 * Math.PI)).toFixed(1)}`).join(' ');
}

const MAP_STEPS = ['sin → cos', 'd/dt → ×jω', '分母转极坐标', '复数除法', '逆变换还原'];
const MAP_COLS = ['#be123c', '#d97706', '#7c3aed', '#0284c7', '#16a34a'];

/** the guided example's road map: the five moves, no numbers */
export const SVG_GUIDED_MAP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" width="560" height="120" role="img" aria-label="相量法五步路线图">
<rect x="1" y="1" width="558" height="118" rx="10" fill="#fbf7ef" stroke="#e3d8c2"/>
<text x="16" y="26" fill="#1f2a44" font-size="12" font-weight="800" ${F}>2 dv/dt + 6v = 20sin(4t + 30°)  →  v(t) = ?</text>
${MAP_STEPS.map((t, i) => {
  const x = 14 + i * 109;
  const arrow = i < 4 ? `<path d="M ${x + 98} 72 h 6" stroke="#94a3b8" stroke-width="1.6"/><polygon points="${x + 109},72 ${x + 103},68.5 ${x + 103},75.5" fill="#94a3b8"/>` : '';
  return `<rect x="${x}" y="44" width="96" height="56" rx="8" fill="#fff" stroke="${MAP_COLS[i]}" stroke-width="1.6"/><text x="${x + 48}" y="66" fill="#5f626b" font-size="10" text-anchor="middle" ${F}>Step ${i + 1}</text><text x="${x + 48}" y="86" fill="#1f2a44" font-size="11" font-weight="700" text-anchor="middle" ${F}>${t}</text>${arrow}`;
}).join('')}
</svg>`;
