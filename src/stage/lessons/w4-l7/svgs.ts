// W4-L7 figures drawn for the light theme (not from the sheet, or the sheet's step diagrams with
// their answers taken out): the guided example's problem figure and its five step diagrams, the
// quiz figures (none shows its answer) and the quiz act's figure.

const R = String.raw;

const FONT = `font-family="ui-sans-serif, system-ui, sans-serif"`;
const INK = '#1f2a44';
const MUTED = '#5f626b';

/** the guided example: a source-free parallel RLC, R = 25 Ω, L = 0.4 H, C = 250 µF */
export const SVG_GD_PROBLEM = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 230" width="520" height="230" role="img" aria-label="引导例题：无源并联 RLC，R = 25 Ω，L = 0.4 H，C = 250 µF">
  <defs><marker id="w47gdArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1 L 10 5 L 0 9 z" fill="#ea580c"/></marker></defs>
  <rect x="1" y="1" width="518" height="228" rx="12" fill="#fff7ed" stroke="#fdba74" stroke-width="1.5"/>
  <text x="260" y="26" text-anchor="middle" ${FONT} font-size="14" font-weight="700" fill="#9a3412">无源并联 RLC（各支路电流参考方向均向下，与 v(t) 关联）</text>
  <line x1="60" y1="58" x2="460" y2="58" stroke="${INK}" stroke-width="2.4"/>
  <line x1="60" y1="190" x2="460" y2="190" stroke="${INK}" stroke-width="2.4"/>
  <circle cx="260" cy="58" r="4.5" fill="#ea580c"/>
  <text x="42" y="64" ${FONT} font-size="14" font-weight="700" fill="#c2410c">+</text>
  <text x="30" y="130" ${FONT} font-size="14" font-weight="700" fill="#c2410c">v(t)</text>
  <text x="44" y="196" ${FONT} font-size="14" font-weight="700" fill="#c2410c">−</text>
  <line x1="130" y1="58" x2="130" y2="92" stroke="${INK}" stroke-width="2"/>
  <polyline points="130,92 120,98 140,106 120,114 140,122 120,130 140,138 130,144" fill="none" stroke="#dc2626" stroke-width="2.4"/>
  <line x1="130" y1="144" x2="130" y2="190" stroke="${INK}" stroke-width="2"/>
  <text x="148" y="116" ${FONT} font-size="14" font-weight="700" fill="#b91c1c">R = 25 Ω</text>
  <line x1="112" y1="64" x2="112" y2="84" stroke="#ea580c" stroke-width="1.8" marker-end="url(#w47gdArr)"/>
  <text x="108" y="80" text-anchor="end" ${FONT} font-size="12" fill="#c2410c">i_R</text>
  <line x1="260" y1="58" x2="260" y2="92" stroke="${INK}" stroke-width="2"/>
  <path d="M 260 92 Q 277 99 260 106 Q 277 113 260 120 Q 277 127 260 134 Q 277 141 260 148" fill="none" stroke="#0284c7" stroke-width="2.4"/>
  <line x1="260" y1="148" x2="260" y2="190" stroke="${INK}" stroke-width="2"/>
  <text x="282" y="110" ${FONT} font-size="14" font-weight="700" fill="#0369a1">L = 0.4 H</text>
  <text x="282" y="128" ${FONT} font-size="12" fill="#0369a1">i_L(0) = 0.15 A</text>
  <line x1="242" y1="64" x2="242" y2="84" stroke="#ea580c" stroke-width="1.8" marker-end="url(#w47gdArr)"/>
  <text x="238" y="80" text-anchor="end" ${FONT} font-size="12" fill="#c2410c">i_L</text>
  <line x1="390" y1="58" x2="390" y2="112" stroke="${INK}" stroke-width="2"/>
  <line x1="370" y1="112" x2="410" y2="112" stroke="#059669" stroke-width="3"/>
  <line x1="370" y1="124" x2="410" y2="124" stroke="#059669" stroke-width="3"/>
  <line x1="390" y1="124" x2="390" y2="190" stroke="${INK}" stroke-width="2"/>
  <text x="418" y="114" ${FONT} font-size="14" font-weight="700" fill="#047857">C = 250 µF</text>
  <text x="418" y="132" ${FONT} font-size="12" fill="#047857">v(0) = 15 V</text>
  <line x1="372" y1="64" x2="372" y2="84" stroke="#ea580c" stroke-width="1.8" marker-end="url(#w47gdArr)"/>
  <text x="368" y="80" text-anchor="end" ${FONT} font-size="12" fill="#c2410c">i_C</text>
  <text x="260" y="216" text-anchor="middle" ${FONT} font-size="13" fill="${MUTED}">求 t ≥ 0 时的完整节点电压 v(t)</text>
</svg>`;

/** step 1: the three branches and their values (given in the problem) */
export const MINI_STEP1 = R`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='8' fill='#fff7ed' stroke='#fdba74'/><line x1='25' y1='25' x2='235' y2='25' stroke='#334155' stroke-width='2'/><line x1='25' y1='85' x2='235' y2='85' stroke='#334155' stroke-width='2'/><line x1='65' y1='25' x2='65' y2='85' stroke='#dc2626' stroke-width='2.5'/><text x='74' y='60' font-size='11' fill='#dc2626'>25Ω</text><line x1='135' y1='25' x2='135' y2='85' stroke='#0284c7' stroke-width='2.5'/><text x='144' y='60' font-size='11' fill='#0284c7'>0.4H</text><line x1='205' y1='25' x2='205' y2='85' stroke='#059669' stroke-width='2.5'/><text x='212' y='60' font-size='11' fill='#047857'>250µF</text></svg>`;

/** step 2: the two poles at σ = −α (given), their height still open */
export const MINI_STEP2 = R`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='8' fill='#f8fafc' stroke='#cbd5e1'/><line x1='20' y1='55' x2='240' y2='55' stroke='#64748b' stroke-width='1.5'/><line x1='200' y1='12' x2='200' y2='98' stroke='#64748b' stroke-width='1.5'/><line x1='120' y1='18' x2='120' y2='92' stroke='#94a3b8' stroke-dasharray='3,3'/><circle cx='120' cy='25' r='4' fill='#0284c7'/><circle cx='120' cy='85' r='4' fill='#0284c7'/><text x='45' y='28' font-size='11' fill='#0369a1'>s₁ = −80 + j ?</text><text x='45' y='90' font-size='11' fill='#0369a1'>s₂ = −80 − j ?</text><text x='124' y='68' font-size='10.5' fill='#5f626b'>σ = −α</text></svg>`;

/** step 3: t = 0⁺ in the solution form */
export const MINI_STEP3 = R`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='8' fill='#eff6ff' stroke='#93c5fd'/><text x='130' y='44' text-anchor='middle' font-size='13' font-weight='bold' fill='#1d4ed8'>t = 0⁺ : cos(0)=1, sin(0)=0</text><text x='130' y='74' text-anchor='middle' font-size='13' fill='#0f172a'>v(0⁺) = B₁ = ?</text></svg>`;

/** step 4: the node KCL at 0⁺ (the sum left to the student) */
export const MINI_STEP4 = R`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='8' fill='#fefce8' stroke='#fde047'/><text x='130' y='36' text-anchor='middle' font-size='12' font-weight='bold' fill='#854d0e'>KCL @ t = 0⁺</text><text x='130' y='60' text-anchor='middle' font-size='11.5' fill='#334155'>i_R = v(0⁺)/R，i_L = 0.15 A</text><text x='130' y='84' text-anchor='middle' font-size='11.5' font-weight='bold' fill='#b91c1c'>i_C(0⁺) = −(i_R + i_L) = ?</text></svg>`;

/** step 5: the derivative condition (the hint's equation), B₂ open */
export const MINI_STEP5 = R`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='8' fill='#ecfdf5' stroke='#6ee7b7'/><text x='130' y='40' text-anchor='middle' font-size='12' font-weight='bold' fill='#065f46'>−80(15) + 60 B₂ = −3000</text><text x='130' y='66' text-anchor='middle' font-size='12' fill='#047857'>60 B₂ = ? ⇒ B₂ = ?</text><text x='130' y='90' text-anchor='middle' font-size='11' fill='#334155'>再把 B₁、B₂ 填回通解</text></svg>`;

/* ------------------------------------------------------------------ the quiz */

const qbox = (h: number) => `<rect x="1" y="1" width="318" height="${h - 2}" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>`;

/** Q1: a critically damped parallel RLC, R doubled */
export const SVG_Q1 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" width="320" height="130" role="img" aria-label="临界阻尼并联 RLC，R 增大为 2 倍">
  ${qbox(130)}
  <line x1="40" y1="30" x2="230" y2="30" stroke="${INK}" stroke-width="2"/>
  <line x1="40" y1="104" x2="230" y2="104" stroke="${INK}" stroke-width="2"/>
  <line x1="70" y1="30" x2="70" y2="46" stroke="${INK}" stroke-width="2"/>
  <polyline points="70,46 62,51 78,58 62,65 78,72 62,79 70,84" fill="none" stroke="#dc2626" stroke-width="2.2"/>
  <line x1="70" y1="84" x2="70" y2="104" stroke="${INK}" stroke-width="2"/>
  <text x="82" y="70" ${FONT} font-size="12" font-weight="700" fill="#b91c1c">R → 2R</text>
  <path d="M 150 46 Q 164 52 150 58 Q 164 64 150 70 Q 164 76 150 82" fill="none" stroke="#0284c7" stroke-width="2.2"/>
  <line x1="150" y1="30" x2="150" y2="46" stroke="${INK}" stroke-width="2"/><line x1="150" y1="82" x2="150" y2="104" stroke="${INK}" stroke-width="2"/>
  <text x="166" y="70" ${FONT} font-size="12" fill="#0369a1">L</text>
  <line x1="210" y1="30" x2="210" y2="62" stroke="${INK}" stroke-width="2"/>
  <line x1="196" y1="62" x2="224" y2="62" stroke="#059669" stroke-width="2.6"/><line x1="196" y1="72" x2="224" y2="72" stroke="#059669" stroke-width="2.6"/>
  <line x1="210" y1="72" x2="210" y2="104" stroke="${INK}" stroke-width="2"/>
  <text x="228" y="70" ${FONT} font-size="12" fill="#047857">C</text>
  <text x="250" y="52" ${FONT} font-size="11.5" fill="${INK}">原来：</text>
  <text x="250" y="68" ${FONT} font-size="11.5" font-weight="700" fill="#047857">α = ω₀</text>
  <text x="250" y="90" ${FONT} font-size="11.5" fill="${MUTED}">L、C 不变</text>
  <text x="160" y="122" text-anchor="middle" ${FONT} font-size="11.5" fill="${MUTED}">R 加倍后：α 与 ω₀ 谁大？</text>
</svg>`;

/** Q2: the bench loop with the inductor's own winding resistance */
export const SVG_Q2 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" width="320" height="130" role="img" aria-label="面包板串联 RLC：电位器 R_pot、电感寄生电阻 R_L = 12 Ω、10 mH、1 µF">
  ${qbox(130)}
  <path d="M 30 40 L 60 40 M 110 40 L 130 40 M 240 40 L 290 40 L 290 62 M 290 74 L 290 100 L 30 100 L 30 40" fill="none" stroke="${INK}" stroke-width="2"/>
  <polyline points="60,40 65,32 73,48 81,32 89,48 97,32 105,48 110,40" fill="none" stroke="#b45309" stroke-width="2.2"/>
  <line x1="66" y1="54" x2="104" y2="26" stroke="#b45309" stroke-width="1.6"/>
  <text x="85" y="66" text-anchor="middle" ${FONT} font-size="11.5" font-weight="700" fill="#b45309">R_pot = ?</text>
  <rect x="128" y="22" width="114" height="36" rx="6" fill="none" stroke="#94a3b8" stroke-dasharray="4,3"/>
  <polyline points="130,40 134,34 140,46 146,34 152,46 156,40" fill="none" stroke="#dc2626" stroke-width="2"/>
  <line x1="156" y1="40" x2="170" y2="40" stroke="${INK}" stroke-width="2"/>
  <path d="M 170 40 Q 178 28 186 40 Q 194 28 202 40 Q 210 28 218 40 Q 226 28 234 40" fill="none" stroke="#0284c7" stroke-width="2.2"/>
  <line x1="234" y1="40" x2="240" y2="40" stroke="${INK}" stroke-width="2"/>
  <text x="143" y="72" text-anchor="middle" ${FONT} font-size="11" fill="#b91c1c">R_L = 12 Ω</text>
  <text x="204" y="72" text-anchor="middle" ${FONT} font-size="11" fill="#0369a1">10 mH</text>
  <text x="185" y="16" text-anchor="middle" ${FONT} font-size="10.5" fill="${MUTED}">真实电感 = 理想 L + 绕组电阻</text>
  <line x1="276" y1="62" x2="304" y2="62" stroke="#059669" stroke-width="2.6"/><line x1="276" y1="74" x2="304" y2="74" stroke="#059669" stroke-width="2.6"/>
  <text x="252" y="88" text-anchor="end" ${FONT} font-size="11" fill="#047857">1 µF</text>
  <text x="160" y="120" text-anchor="middle" ${FONT} font-size="11.5" fill="${MUTED}">R_pot 与 R_L 串在同一个回路里</text>
</svg>`;

/** Q3: two real poles at −2 and −50 (given in the question) */
export const SVG_Q3 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" width="320" height="130" role="img" aria-label="s 平面：s₁ = −2，s₂ = −50">
  ${qbox(130)}
  <line x1="16" y1="66" x2="304" y2="66" stroke="#64748b" stroke-width="1.5"/>
  <line x1="280" y1="16" x2="280" y2="114" stroke="#64748b" stroke-width="1.5"/>
  <text x="300" y="58" text-anchor="end" ${FONT} font-size="11" fill="${MUTED}">σ</text>
  <text x="285" y="26" ${FONT} font-size="11" fill="${MUTED}">jω</text>
  <g stroke="#334155" stroke-width="2.4"><path d="M 264 60 L 276 72 M 276 60 L 264 72"/><path d="M 34 60 L 46 72 M 46 60 L 34 72"/></g>
  <text x="270" y="90" text-anchor="middle" ${FONT} font-size="11.5" font-weight="700" fill="${INK}">s₁ = −2</text>
  <text x="40" y="90" text-anchor="middle" ${FONT} font-size="11.5" font-weight="700" fill="${INK}">s₂ = −50</text>
  <text x="160" y="40" text-anchor="middle" ${FONT} font-size="11" fill="${MUTED}">两根都在负实轴上（单位 s⁻¹，比例示意）</text>
  <text x="160" y="116" text-anchor="middle" ${FONT} font-size="11" fill="${MUTED}">哪一个离虚轴更近？</text>
</svg>`;

/** Q4: the given start value and start slope */
export const SVG_Q4 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" width="320" height="130" role="img" aria-label="v(0⁺) = 10 V，dv/dt(0⁺) = 10 V/s">
  ${qbox(130)}
  <line x1="40" y1="100" x2="300" y2="100" stroke="#64748b" stroke-width="1.4"/>
  <line x1="40" y1="20" x2="40" y2="110" stroke="#64748b" stroke-width="1.4"/>
  <text x="34" y="54" text-anchor="end" ${FONT} font-size="11" fill="${INK}">10 V</text>
  <line x1="36" y1="50" x2="44" y2="50" stroke="#64748b"/>
  <circle cx="40" cy="50" r="4.5" fill="#0284c7"/>
  <line x1="40" y1="50" x2="140" y2="34" stroke="#d97706" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="146" y="36" ${FONT} font-size="11.5" fill="#a16207">斜率 dv/dt(0⁺) = 10 V/s</text>
  <text x="170" y="74" text-anchor="middle" ${FONT} font-size="12" fill="${INK}">v(t) = e^(−3t)(B₁ cos 4t + B₂ sin 4t)</text>
  <text x="300" y="116" text-anchor="end" ${FONT} font-size="11" fill="${MUTED}">t</text>
</svg>`;

/** the quiz act: what the four questions test */
export const SVG_QUIZ_ACT = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 120" width="520" height="120" role="img" aria-label="诊断测验的四个考点">
  <rect x="1" y="1" width="518" height="118" rx="12" fill="#f8fafc" stroke="#cbd5e1"/>
  <g ${FONT} font-size="12.5">
    <rect x="14" y="16" width="116" height="88" rx="8" fill="#fff7ed" stroke="#fdba74"/>
    <text x="72" y="44" text-anchor="middle" font-weight="700" fill="#9a3412">① 串并联对偶</text>
    <text x="72" y="66" text-anchor="middle" fill="${INK}">α = R/(2L)</text>
    <text x="72" y="86" text-anchor="middle" fill="${INK}">α = 1/(2RC)</text>
    <rect x="140" y="16" width="116" height="88" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
    <text x="198" y="44" text-anchor="middle" font-weight="700" fill="#1d4ed8">② 面包板临界</text>
    <text x="198" y="66" text-anchor="middle" fill="${INK}">2√(L/C)</text>
    <text x="198" y="86" text-anchor="middle" fill="${INK}">寄生 R_L</text>
    <rect x="266" y="16" width="116" height="88" rx="8" fill="#fef2f2" stroke="#fca5a5"/>
    <text x="324" y="44" text-anchor="middle" font-weight="700" fill="#b91c1c">③ 极点与拖尾</text>
    <text x="324" y="66" text-anchor="middle" fill="${INK}">s₁, s₂</text>
    <text x="324" y="86" text-anchor="middle" fill="${INK}">主导极点</text>
    <rect x="392" y="16" width="116" height="88" rx="8" fill="#ecfdf5" stroke="#6ee7b7"/>
    <text x="450" y="44" text-anchor="middle" font-weight="700" fill="#047857">④ 待定系数</text>
    <text x="450" y="66" text-anchor="middle" fill="${INK}">B₁ = v(0⁺)</text>
    <text x="450" y="86" text-anchor="middle" fill="${INK}">−αB₁ + ω_dB₂</text>
  </g>
</svg>`;
