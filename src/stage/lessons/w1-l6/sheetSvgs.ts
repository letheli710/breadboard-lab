// The diagrams of the lesson sheet (docs/lessons/W1-L6.md), as given there (dark palette; index.ts
// turns them into the page's light palette). Fix: the sheet writes subscripts with look-alike Unicode
// letters (Vᵦ is a Greek beta, Vᶜ / Vᵈ are superscripts); here they are real <tspan> subscripts.

export const SHEET_ACT1 = `<svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-amber-1" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
  </defs>
  <!-- Title -->
  <text x="16" y="24" fill="#e2e8f0" font-size="13" font-weight="700">Act 1 · 闭合回路与海拔电位剖面类比</text>
  <!-- Left: Simple Loop Circuit -->
  <g stroke="#94a3b8" stroke-width="2" fill="none">
    <path d="M 45 190 L 45 142 M 45 98 L 45 55 L 95 55"/>
    <!-- R1 zigzag -->
    <path d="M 95 55 L 103 45 L 113 65 L 123 45 L 133 65 L 143 45 L 151 55 L 195 55 L 195 92"/>
    <!-- R2 zigzag -->
    <path d="M 195 92 L 205 100 L 185 110 L 205 120 L 185 130 L 205 140 L 195 148 L 195 190 L 45 190"/>
  </g>
  <!-- Source Vs -->
  <circle cx="45" cy="120" r="22" fill="#1e293b" stroke="#10b981" stroke-width="2.2"/>
  <text x="45" y="114" fill="#10b981" font-size="14" font-weight="700" text-anchor="middle">+</text>
  <text x="45" y="135" fill="#10b981" font-size="15" font-weight="700" text-anchor="middle">−</text>
  <text x="15" y="124" fill="#10b981" font-size="11" font-weight="600" text-anchor="middle">12V</text>
  <!-- Polarity labels -->
  <text x="95" y="42" fill="#38bdf8" font-size="12" font-weight="700">+</text>
  <text x="123" y="42" fill="#38bdf8" font-size="11" font-weight="600" text-anchor="middle">v₁ = 7V</text>
  <text x="151" y="42" fill="#38bdf8" font-size="12" font-weight="700">−</text>
  <text x="210" y="96" fill="#a855f7" font-size="12" font-weight="700">+</text>
  <text x="212" y="124" fill="#a855f7" font-size="11" font-weight="600">v₂=5V</text>
  <text x="210" y="154" fill="#a855f7" font-size="12" font-weight="700">−</text>
  <!-- CW Loop Arrow -->
  <path d="M 95 105 A 28 28 0 1 1 95 145" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#arr-amber-1)"/>
  <text x="120" y="129" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">CW 巡检</text>
  <!-- Nodes -->
  <circle cx="45" cy="190" r="3.5" fill="#e2e8f0"/><text x="35" y="205" fill="#cbd5e1" font-size="10">D(0V)</text>
  <circle cx="45" cy="55" r="3.5" fill="#10b981"/><text x="35" y="47" fill="#10b981" font-size="10">A</text>
  <circle cx="195" cy="55" r="3.5" fill="#38bdf8"/><text x="200" y="49" fill="#38bdf8" font-size="10">B</text>
  <!-- Divider -->
  <line x1="255" y1="40" x2="255" y2="215" stroke="#334155" stroke-width="1" stroke-dasharray="4 4"/>
  <!-- Right: Elevation Profile Bar Chart -->
  <text x="335" y="48" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="middle">电位海拔剖面图 (V)</text>
  <line x1="270" y1="190" x2="405" y2="190" stroke="#64748b" stroke-width="1.5"/>
  <!-- Bar A: 12V -->
  <rect x="285" y="70" width="26" height="120" fill="#10b981" fill-opacity="0.75" rx="3"/>
  <text x="298" y="64" fill="#10b981" font-size="10" font-weight="700" text-anchor="middle">+12V</text>
  <text x="298" y="206" fill="#cbd5e1" font-size="10" text-anchor="middle">A</text>
  <!-- Bar B: 5V -->
  <rect x="330" y="140" width="26" height="50" fill="#38bdf8" fill-opacity="0.75" rx="3"/>
  <text x="343" y="134" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">+5V</text>
  <text x="343" y="206" fill="#cbd5e1" font-size="10" text-anchor="middle">B</text>
  <!-- Bar D: 0V -->
  <rect x="375" y="186" width="26" height="4" fill="#f59e0b" rx="1"/>
  <text x="388" y="179" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="middle">0V</text>
  <text x="388" y="206" fill="#cbd5e1" font-size="10" text-anchor="middle">D(回原点)</text>
  <!-- Step arrows -->
  <path d="M 312 72 L 328 138" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="2 2"/>
  <text x="334" y="102" fill="#94a3b8" font-size="9">−7V</text>
  <path d="M 357 142 L 373 185" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="2 2"/>
  <text x="378" y="160" fill="#94a3b8" font-size="9">−5V</text>
</svg>`;

export const SHEET_ACT2 = `<svg viewBox="0 0 420 230" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-amber-2" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
  </defs>
  <text x="16" y="24" fill="#e2e8f0" font-size="13" font-weight="700">Act 2 · 顺时针巡检：“先碰到的符号就写什么号”</text>
  <!-- Main rectangular loop wires -->
  <g stroke="#94a3b8" stroke-width="2" fill="none">
    <path d="M 60 190 L 60 148 M 60 98 L 60 60 L 145 60"/>
    <path d="M 225 60 L 350 60 L 350 98 M 350 148 L 350 190 L 290 190"/>
    <path d="M 230 190 L 180 190 M 120 190 L 60 190"/>
  </g>
  <!-- Element 1 (Left): - bottom, + top -->
  <rect x="42" y="98" width="36" height="50" rx="5" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="60" y="127" fill="#10b981" font-size="12" font-weight="700" text-anchor="middle">v₁</text>
  <text x="32" y="108" fill="#10b981" font-size="13" font-weight="700">+</text>
  <text x="32" y="148" fill="#f59e0b" font-size="15" font-weight="700">−</text>
  <circle cx="36" cy="143" r="9" fill="none" stroke="#f59e0b" stroke-width="1.3" stroke-dasharray="2 2"/>
  <!-- Element 2 (Top): + left, - right -->
  <rect x="145" y="44" width="80" height="32" rx="5" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="185" y="64" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">v₂ = 8V</text>
  <text x="133" y="54" fill="#f59e0b" font-size="14" font-weight="700">+</text>
  <circle cx="137" cy="49" r="9" fill="none" stroke="#f59e0b" stroke-width="1.3" stroke-dasharray="2 2"/>
  <text x="231" y="54" fill="#38bdf8" font-size="14" font-weight="700">−</text>
  <!-- Element 3 (Right): + top, - bottom -->
  <rect x="332" y="98" width="36" height="50" rx="5" fill="#1e293b" stroke="#eab308" stroke-width="2"/>
  <text x="350" y="127" fill="#eab308" font-size="12" font-weight="700" text-anchor="middle">v₃?</text>
  <text x="375" y="108" fill="#f59e0b" font-size="14" font-weight="700">+</text>
  <circle cx="379" cy="103" r="9" fill="none" stroke="#f59e0b" stroke-width="1.3" stroke-dasharray="2 2"/>
  <text x="375" y="148" fill="#eab308" font-size="14" font-weight="700">−</text>
  <!-- Element 4 (Bottom Right): - right, + left -->
  <rect x="230" y="174" width="60" height="32" rx="5" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
  <text x="260" y="194" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">v₄=4V</text>
  <text x="296" y="182" fill="#f59e0b" font-size="15" font-weight="700">−</text>
  <circle cx="300" cy="177" r="9" fill="none" stroke="#f59e0b" stroke-width="1.3" stroke-dasharray="2 2"/>
  <text x="217" y="182" fill="#ef4444" font-size="13" font-weight="700">+</text>
  <!-- Element 5 (Bottom Left): + right, - left -->
  <rect x="120" y="174" width="60" height="32" rx="5" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
  <text x="150" y="194" fill="#a855f7" font-size="11" font-weight="700" text-anchor="middle">v₅=6V</text>
  <text x="186" y="182" fill="#f59e0b" font-size="14" font-weight="700">+</text>
  <circle cx="190" cy="177" r="9" fill="none" stroke="#f59e0b" stroke-width="1.3" stroke-dasharray="2 2"/>
  <text x="108" y="182" fill="#a855f7" font-size="14" font-weight="700">−</text>
  <!-- Center CW indicator & equation -->
  <path d="M 178 106 A 26 26 0 1 1 178 142" fill="none" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr-amber-2)"/>
  <text x="205" y="128" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">CW 巡检</text>
  <text x="205" y="158" fill="#e2e8f0" font-size="11" font-weight="600" text-anchor="middle">−v₁ + v₂ + v₃ − v₄ + v₅ = 0</text>
  <text x="205" y="220" fill="#94a3b8" font-size="10" text-anchor="middle">（虚线圈标出顺时针移动时每个元件“最先碰到的符号”）</text>
</svg>`;

export const SHEET_ACT3 = `<svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="16" y="24" fill="#e2e8f0" font-size="13" font-weight="700">Act 3 · 串联电压源合并 vs. 违禁并联短路矛盾</text>
  <!-- Left Panel: Series Voltage Sources -->
  <text x="105" y="46" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">✓ 允许：串联代数叠加</text>
  <g stroke="#94a3b8" stroke-width="2" fill="none">
    <path d="M 65 62 L 65 76 M 65 104 L 65 118 M 65 146 L 65 160 M 65 188 L 65 204"/>
    <path d="M 65 62 L 155 62 M 65 204 L 155 204"/>
  </g>
  <!-- V1 (+) top -->
  <circle cx="65" cy="90" r="14" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="65" y="88" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">+</text>
  <text x="65" y="100" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">−</text>
  <text x="32" y="94" fill="#cbd5e1" font-size="10" text-anchor="middle">V₁=12V</text>
  <!-- V2 (+) top -->
  <circle cx="65" cy="132" r="14" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="65" y="130" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">+</text>
  <text x="65" y="142" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">−</text>
  <text x="32" y="136" fill="#cbd5e1" font-size="10" text-anchor="middle">V₂=5V</text>
  <!-- V3 (-) top, (+) bottom (Reversed!) -->
  <circle cx="65" cy="174" r="14" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
  <text x="65" y="172" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">−</text>
  <text x="65" y="184" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">+</text>
  <text x="32" y="178" fill="#ef4444" font-size="10" text-anchor="middle">V₃=3V</text>
  <!-- Terminals a, b -->
  <circle cx="155" cy="62" r="3.5" fill="#eab308"/><text x="166" y="66" fill="#eab308" font-size="11" font-weight="700">a (+)</text>
  <circle cx="155" cy="204" r="3.5" fill="#eab308"/><text x="166" y="208" fill="#eab308" font-size="11" font-weight="700">b (−)</text>
  <text x="155" y="128" fill="#eab308" font-size="11" font-weight="700" text-anchor="middle">V<tspan dy="3" font-size="0.75em">ab</tspan><tspan dy="-3"> = 14V</tspan></text>
  <text x="155" y="144" fill="#94a3b8" font-size="10" text-anchor="middle">(12 + 5 − 3)</text>
  <!-- Divider -->
  <line x1="215" y1="42" x2="215" y2="225" stroke="#334155" stroke-width="1" stroke-dasharray="4 4"/>
  <!-- Right Panel: Illegal Parallel Voltage Sources -->
  <text x="318" y="46" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">✕ 严禁：不同电压源并联</text>
  <g stroke="#ef4444" stroke-width="2.2" fill="none">
    <path d="M 265 80 L 370 80 L 370 112 M 370 148 L 370 180 L 265 180 L 265 148 M 265 112 L 265 80"/>
  </g>
  <!-- 9V Source -->
  <circle cx="265" cy="130" r="18" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
  <text x="265" y="126" fill="#ef4444" font-size="13" font-weight="700" text-anchor="middle">+</text>
  <text x="265" y="142" fill="#ef4444" font-size="13" font-weight="700" text-anchor="middle">−</text>
  <text x="236" y="134" fill="#fca5a5" font-size="11" font-weight="700" text-anchor="middle">9V</text>
  <!-- 5V Source -->
  <circle cx="370" cy="130" r="18" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
  <text x="370" y="126" fill="#ef4444" font-size="13" font-weight="700" text-anchor="middle">+</text>
  <text x="370" y="142" fill="#ef4444" font-size="13" font-weight="700" text-anchor="middle">−</text>
  <text x="398" y="134" fill="#fca5a5" font-size="11" font-weight="700" text-anchor="middle">5V</text>
  <!-- Red X & Contradiction -->
  <path d="M 303 115 L 333 145 M 333 115 L 303 145" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
  <text x="318" y="204" fill="#fca5a5" font-size="10.5" font-weight="700" text-anchor="middle">KVL: −9 + 5 = −4 ≠ 0 (矛盾!)</text>
  <text x="318" y="220" fill="#94a3b8" font-size="10" text-anchor="middle">理想环流 i → ∞，实测烧毁</text>
</svg>`;

export const SHEET_ACT4 = `<svg viewBox="0 0 420 230" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-sky-4" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
  </defs>
  <text x="16" y="24" fill="#e2e8f0" font-size="13" font-weight="700">Act 4 · 单回路求解黄金三步法（KVL + 欧姆定律）</text>
  <!-- Wires & Resistors -->
  <g stroke="#94a3b8" stroke-width="2" fill="none">
    <path d="M 75 190 L 75 144 M 75 96 L 75 60 L 155 60"/>
    <!-- R1 -->
    <path d="M 155 60 L 163 48 L 175 72 L 187 48 L 199 72 L 211 48 L 220 60 L 325 60 L 325 90"/>
    <!-- R2 -->
    <path d="M 325 90 L 337 98 L 313 110 L 337 122 L 313 134 L 337 146 L 325 154 L 325 190 L 75 190"/>
  </g>
  <!-- Source Vs -->
  <circle cx="75" cy="120" r="24" fill="#1e293b" stroke="#10b981" stroke-width="2.2"/>
  <text x="75" y="114" fill="#10b981" font-size="15" font-weight="700" text-anchor="middle">+</text>
  <text x="75" y="136" fill="#10b981" font-size="15" font-weight="700" text-anchor="middle">−</text>
  <text x="34" y="124" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">Vₛ=18V</text>
  <!-- R1 Labels (PSC) -->
  <text x="150" y="46" fill="#38bdf8" font-size="13" font-weight="700">+</text>
  <text x="188" y="44" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">v₁ (R₁=2Ω)</text>
  <text x="223" y="46" fill="#38bdf8" font-size="13" font-weight="700">−</text>
  <!-- R2 Labels (PSC) -->
  <text x="342" y="96" fill="#a855f7" font-size="13" font-weight="700">+</text>
  <text x="372" y="125" fill="#a855f7" font-size="11" font-weight="700" text-anchor="middle">v₂ (R₂=4Ω)</text>
  <text x="342" y="158" fill="#a855f7" font-size="13" font-weight="700">−</text>
  <!-- Current arrow on wire -->
  <line x1="95" y1="60" x2="132" y2="60" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-sky-4)"/>
  <text x="114" y="49" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">i</text>
  <!-- Center formula summary -->
  <rect x="135" y="96" width="135" height="62" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="202" y="116" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">Step 1: 设顺时针 i</text>
  <text x="202" y="133" fill="#38bdf8" font-size="11" font-weight="600" text-anchor="middle">Step 2: 电流进+出−</text>
  <text x="202" y="150" fill="#10b981" font-size="11" font-weight="600" text-anchor="middle">Step 3: −18+2i+4i=0</text>
  <text x="210" y="216" fill="#cbd5e1" font-size="11" text-anchor="middle">解得 i = 3 A，v₁ = 6 V，v₂ = 12 V</text>
</svg>`;

export const SHEET_ACT5 = `<svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-amber-5" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
  </defs>
  <text x="16" y="24" fill="#e2e8f0" font-size="13" font-weight="700">Act 5 · Sadiku 经典双电源对抗 + 反向标注单回路</text>
  <!-- Wires & Resistors -->
  <g stroke="#94a3b8" stroke-width="2" fill="none">
    <path d="M 75 188 L 75 144 M 75 96 L 75 60 L 160 60"/>
    <!-- R1 top -->
    <path d="M 160 60 L 168 48 L 180 72 L 192 48 L 204 72 L 216 48 L 224 60 L 345 60 L 345 96"/>
    <!-- Right wire & R2 bottom -->
    <path d="M 345 144 L 345 188 L 245 188"/>
    <path d="M 245 188 L 237 200 L 225 176 L 213 200 L 201 176 L 189 200 L 181 188 L 75 188"/>
  </g>
  <!-- V1 (20V) -->
  <g id="elem-v1">
    <circle cx="75" cy="120" r="24" fill="#1e293b" stroke="#10b981" stroke-width="2.2"/>
    <text x="75" y="114" fill="#10b981" font-size="15" font-weight="700" text-anchor="middle">+</text>
    <text x="75" y="136" fill="#10b981" font-size="15" font-weight="700" text-anchor="middle">−</text>
    <text x="34" y="124" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">V₁=20V</text>
  </g>
  <!-- V2 (5V, Opposing!) -->
  <g id="elem-v2">
    <circle cx="345" cy="120" r="24" fill="#1e293b" stroke="#ef4444" stroke-width="2.2"/>
    <text x="345" y="114" fill="#ef4444" font-size="15" font-weight="700" text-anchor="middle">+</text>
    <text x="345" y="136" fill="#ef4444" font-size="15" font-weight="700" text-anchor="middle">−</text>
    <text x="392" y="124" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">V₂=5V</text>
  </g>
  <!-- R1 Labels -->
  <g id="elem-r1">
    <text x="152" y="47" fill="#38bdf8" font-size="13" font-weight="700">+</text>
    <text x="192" y="44" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">v₁ (R₁ = 2Ω)</text>
    <text x="228" y="47" fill="#38bdf8" font-size="13" font-weight="700">−</text>
  </g>
  <!-- R2 Labels (Reversed polarity!) -->
  <g id="elem-r2">
    <text x="172" y="216" fill="#a855f7" font-size="13" font-weight="700">+</text>
    <text x="213" y="217" fill="#a855f7" font-size="11" font-weight="700" text-anchor="middle">v₂ (R₂ = 3Ω)</text>
    <text x="249" y="216" fill="#a855f7" font-size="13" font-weight="700">−</text>
    <rect x="164" y="170" width="98" height="54" rx="6" fill="none" stroke="#a855f7" stroke-width="1.2" stroke-dasharray="3 3"/>
  </g>
  <!-- CW current loop -->
  <path d="M 185 104 A 24 24 0 1 1 185 138" fill="none" stroke="#f59e0b" stroke-width="2.2" marker-end="url(#arr-amber-5)"/>
  <text x="210" y="124" fill="#f59e0b" font-size="12" font-weight="700" text-anchor="middle">i = 3A</text>
  <text x="210" y="152" fill="#cbd5e1" font-size="10.5" text-anchor="middle">−20 + v₁ + 5 − v₂ = 0</text>
  <text x="210" y="234" fill="#a855f7" font-size="10" text-anchor="middle">注意：电流 i 从右向左进入 R₂ 的「−」端，故 v₂ = −3i = −9 V</text>
</svg>`;

export const SHEET_ACT6 = `<svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="16" y="24" fill="#e2e8f0" font-size="13" font-weight="700">Act 6 · 参考地（GND）与回路节点电位分布</text>
  <!-- Left: Circuit with Node Potential Bubbles -->
  <g stroke="#94a3b8" stroke-width="2" fill="none">
    <path d="M 48 180 L 48 136 M 48 96 L 48 60 L 105 60"/>
    <path d="M 105 60 L 111 50 L 121 70 L 131 50 L 141 70 L 149 60 L 208 60 L 208 96"/>
    <path d="M 208 136 L 208 180 L 152 180"/>
    <path d="M 152 180 L 146 190 L 136 170 L 126 190 L 116 170 L 108 180 L 48 180"/>
    <!-- GND Symbol at Node D -->
    <path d="M 48 180 L 48 198 M 36 198 L 60 198 M 40 204 L 56 204 M 44 210 L 52 210" stroke="#f59e0b" stroke-width="2"/>
  </g>
  <!-- Sources -->
  <circle cx="48" cy="116" r="18" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="48" y="112" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">+</text>
  <text x="48" y="126" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">−</text>
  <text x="18" y="120" fill="#10b981" font-size="9.5" text-anchor="middle">20V</text>
  <circle cx="208" cy="116" r="18" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
  <text x="208" y="112" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">+</text>
  <text x="208" y="126" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">−</text>
  <text x="234" y="120" fill="#ef4444" font-size="9.5" text-anchor="middle">5V</text>
  <!-- Node Bubbles -->
  <circle cx="48" cy="60" r="4" fill="#10b981"/>
  <rect x="16" y="34" width="64" height="18" rx="9" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
  <text x="48" y="46" fill="#6ee7b7" font-size="9.5" font-weight="700" text-anchor="middle">V<tspan dy="3" font-size="0.75em">A</tspan><tspan dy="-3">=+20V</tspan></text>
  <circle cx="208" cy="60" r="4" fill="#38bdf8"/>
  <rect x="176" y="34" width="64" height="18" rx="9" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1"/>
  <text x="208" y="46" fill="#7dd3fc" font-size="9.5" font-weight="700" text-anchor="middle">V<tspan dy="3" font-size="0.75em">B</tspan><tspan dy="-3">=+14V</tspan></text>
  <circle cx="208" cy="180" r="4" fill="#a855f7"/>
  <rect x="178" y="192" width="60" height="18" rx="9" fill="#3b0764" stroke="#a855f7" stroke-width="1"/>
  <text x="208" y="204" fill="#d8b4fe" font-size="9.5" font-weight="700" text-anchor="middle">V<tspan dy="3" font-size="0.75em">C</tspan><tspan dy="-3">=+9V</tspan></text>
  <circle cx="48" cy="180" r="4" fill="#f59e0b"/>
  <text x="78" y="206" fill="#f59e0b" font-size="9.5" font-weight="700">GND (V<tspan dy="3" font-size="0.75em">D</tspan><tspan dy="-3">=0V)</tspan></text>
  <!-- Right: Mini Elevation Staircase -->
  <line x1="262" y1="42" x2="262" y2="215" stroke="#334155" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="342" y="48" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="middle">电位阶梯 (以 D 为 0V)</text>
  <line x1="274" y1="192" x2="408" y2="192" stroke="#64748b" stroke-width="1.5"/>
  <!-- Bars: 20V=120px, 14V=84px, 9V=54px, 0V=3px -->
  <rect id="bar-node-a" x="282" y="72" width="22" height="120" fill="#10b981" fill-opacity="0.8" rx="2"/>
  <text x="293" y="66" fill="#10b981" font-size="9" font-weight="700" text-anchor="middle">20V</text>
  <text x="293" y="206" fill="#cbd5e1" font-size="9.5" text-anchor="middle">A</text>
  <rect id="bar-node-b" x="315" y="108" width="22" height="84" fill="#38bdf8" fill-opacity="0.8" rx="2"/>
  <text x="326" y="102" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">14V</text>
  <text x="326" y="206" fill="#cbd5e1" font-size="9.5" text-anchor="middle">B</text>
  <rect id="bar-node-c" x="348" y="138" width="22" height="54" fill="#a855f7" fill-opacity="0.8" rx="2"/>
  <text x="359" y="132" fill="#a855f7" font-size="9" font-weight="700" text-anchor="middle">9V</text>
  <text x="359" y="206" fill="#cbd5e1" font-size="9.5" text-anchor="middle">C</text>
  <rect id="bar-node-d" x="381" y="189" width="22" height="3" fill="#f59e0b" rx="1"/>
  <text x="392" y="183" fill="#f59e0b" font-size="9" font-weight="700" text-anchor="middle">0V</text>
  <text x="392" y="206" fill="#cbd5e1" font-size="9.5" text-anchor="middle">D</text>
</svg>`;

export const SHEET_ACT7 = `<svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="16" y="24" fill="#e2e8f0" font-size="13" font-weight="700">Act 7 · 知识闭环与 W1-L7（串联分压）预告伏笔</text>
  <!-- Left: Classic Series Divider Preview -->
  <g stroke="#94a3b8" stroke-width="2" fill="none">
    <path d="M 55 182 L 55 138 M 55 98 L 55 56 L 165 56 L 165 72"/>
    <!-- R1 vertical -->
    <path d="M 165 72 L 175 78 L 155 88 L 175 98 L 155 108 L 165 114 L 165 130"/>
    <!-- R2 vertical -->
    <path d="M 165 130 L 175 136 L 155 146 L 175 156 L 155 166 L 165 172 L 165 182 L 55 182"/>
    <!-- Output tap -->
    <path d="M 165 122 L 212 122" stroke="#eab308" stroke-width="2"/>
    <path d="M 165 182 L 212 182" stroke="#eab308" stroke-width="2"/>
  </g>
  <circle cx="55" cy="118" r="20" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="55" y="114" fill="#10b981" font-size="12" font-weight="700" text-anchor="middle">+</text>
  <text x="55" y="129" fill="#10b981" font-size="12" font-weight="700" text-anchor="middle">−</text>
  <text x="24" y="122" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">Vₛ</text>
  <text x="138" y="96" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">R₁</text>
  <text x="138" y="156" fill="#a855f7" font-size="11" font-weight="700" text-anchor="middle">R₂</text>
  <circle cx="212" cy="122" r="3.5" fill="#eab308"/>
  <circle cx="212" cy="182" r="3.5" fill="#eab308"/>
  <text x="218" y="156" fill="#eab308" font-size="11" font-weight="700">v₂ = ?</text>
  <!-- Right: Preview Card -->
  <rect x="260" y="54" width="144" height="132" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="332" y="78" fill="#38bdf8" font-size="11.5" font-weight="700" text-anchor="middle">下节直通 · W1-L7</text>
  <text x="332" y="100" fill="#cbd5e1" font-size="10.5" text-anchor="middle">跳过中间电流 i</text>
  <text x="332" y="118" fill="#cbd5e1" font-size="10.5" text-anchor="middle">一步直出分压公式：</text>
  <text x="332" y="146" fill="#eab308" font-size="13" font-weight="700" text-anchor="middle">v₂ = Vₛ · R₂/(R₁+R₂)</text>
  <text x="332" y="172" fill="#94a3b8" font-size="9.5" text-anchor="middle">串联分压 &amp; 并联分流</text>
</svg>`;

/** the guided example's problem diagram (the sheet's mini_svg) */
export const SHEET_MINI = `<svg viewBox='0 0 260 150' xmlns='http://www.w3.org/2000/svg' style='background:#0f172a;border-radius:6px;'><path d='M35 125V95M35 55V25H85L91 18 99 32 107 18 115 32 121 25H225V55M225 95V125H165L159 132 151 118 143 132 135 118 129 125H35' stroke='#94a3b8' stroke-width='1.8' fill='none'/><circle cx='35' cy='75' r='18' fill='#1e293b' stroke='#10b981' stroke-width='1.8'/><text x='35' y='71' fill='#10b981' font-size='11' text-anchor='middle'>+</text><text x='35' y='87' fill='#10b981' font-size='11' text-anchor='middle'>−</text><text x='11' y='78' fill='#10b981' font-size='9'>20V</text><circle cx='225' cy='75' r='18' fill='#1e293b' stroke='#ef4444' stroke-width='1.8'/><text x='225' y='71' fill='#ef4444' font-size='11' text-anchor='middle'>+</text><text x='225' y='87' fill='#ef4444' font-size='11' text-anchor='middle'>−</text><text x='249' y='78' fill='#ef4444' font-size='9' text-anchor='middle'>5V</text><text x='80' y='17' fill='#38bdf8' font-size='10'>+</text><text x='103' y='15' fill='#38bdf8' font-size='9' text-anchor='middle'>v₁(2Ω)</text><text x='124' y='17' fill='#38bdf8' font-size='10'>−</text><text x='122' y='142' fill='#a855f7' font-size='10'>+</text><text x='147' y='144' fill='#a855f7' font-size='9' text-anchor='middle'>v₂(3Ω)</text><text x='168' y='142' fill='#a855f7' font-size='10'>−</text><text x='130' y='80' fill='#f59e0b' font-size='11' font-weight='700' text-anchor='middle'>↻ i (CW)</text></svg>`;
