// The lesson sheet's inline SVGs (docs/lessons/W4-L1.md), copied as written: figures 1-1, 2-1,
// 3-1, 4-1 and 5-1, and the five mini_svg of the guided example. They are drawn for a dark canvas;
// svgs.ts fixes what needs fixing and recolours them with lightSvg.

export const SHEET_FIG11 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 320" width="820" height="320" role="img" aria-label="平行板电容电场极化与铝电解电容极性辨识图">
  <rect x="0" y="0" width="820" height="320" rx="12" fill="#0f172a"/>
  <text x="24" y="34" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">图 1-1：平行板电容电场储能透视（左）与铝电解电容极性辨识（右）</text>

  <!-- Left panel: Parallel plate capacitor -->
  <rect x="20" y="50" width="440" height="250" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="40" y="76" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold">平行板结构：C = εr · ε0 · A / d</text>

  <!-- Top lead & plate (+) -->
  <line x1="230" y1="90" x2="230" y2="115" stroke="#ef4444" stroke-width="3"/>
  <rect x="100" y="115" width="260" height="16" rx="2" fill="#ef4444"/>
  <text x="372" y="128" fill="#fca5a5" font-family="sans-serif" font-size="13" font-weight="bold">+q (正极板)</text>
  <text x="122" y="128" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold">+   +   +   +   +   +   +</text>

  <!-- Dielectric block -->
  <rect x="110" y="135" width="240" height="86" rx="4" fill="#334155" stroke="#64748b" stroke-dasharray="5,3"/>
  <text x="165" y="153" fill="#cbd5e1" font-family="sans-serif" font-size="12">电介质 (Dielectric, ε = εr·ε0)</text>

  <!-- Electric field arrows -->
  <g stroke="#facc15" stroke-width="2" fill="none">
    <line x1="145" y1="158" x2="145" y2="210"/>
    <polyline points="140,203 145,211 150,203"/>
    <line x1="205" y1="158" x2="205" y2="210"/>
    <polyline points="200,203 205,211 210,203"/>
    <line x1="265" y1="158" x2="265" y2="210"/>
    <polyline points="260,203 265,211 270,203"/>
    <line x1="325" y1="158" x2="325" y2="210"/>
    <polyline points="320,203 325,211 330,203"/>
  </g>
  <text x="155" y="190" fill="#fde047" font-family="sans-serif" font-size="12" font-weight="bold">电场 E</text>

  <!-- Dipoles inside dielectric -->
  <g font-family="monospace" font-size="10" text-anchor="middle">
    <ellipse cx="175" cy="184" rx="10" ry="16" fill="#475569" stroke="#94a3b8"/>
    <text x="175" y="179" fill="#93c5fd">-</text>
    <text x="175" y="195" fill="#fca5a5">+</text>
    <ellipse cx="295" cy="184" rx="10" ry="16" fill="#475569" stroke="#94a3b8"/>
    <text x="295" y="179" fill="#93c5fd">-</text>
    <text x="295" y="195" fill="#fca5a5">+</text>
  </g>

  <!-- Bottom plate (-) & lead -->
  <rect x="100" y="225" width="260" height="16" rx="2" fill="#3b82f6"/>
  <line x1="230" y1="241" x2="230" y2="268" stroke="#3b82f6" stroke-width="3"/>
  <text x="372" y="238" fill="#93c5fd" font-family="sans-serif" font-size="13" font-weight="bold">-q (负极板)</text>
  <text x="122" y="238" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold">-   -   -   -   -   -   -</text>

  <!-- Dimension d & A -->
  <line x1="78" y1="131" x2="78" y2="225" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="72" y1="131" x2="84" y2="131" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="72" y1="225" x2="84" y2="225" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="58" y="182" fill="#e2e8f0" font-family="sans-serif" font-size="13" font-weight="bold">d</text>
  <text x="100" y="286" fill="#94a3b8" font-family="sans-serif" font-size="12">正对面积 A 越大、间距 d 越小、εr 越大 → 电容量 C 越大</text>

  <!-- Right panel: Electrolytic capacitor polarity -->
  <rect x="480" y="50" width="320" height="250" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="500" y="76" fill="#f97316" font-family="sans-serif" font-size="14" font-weight="bold">铝电解电容极性辨识（严禁反接！）</text>

  <!-- Cylinder body -->
  <rect x="575" y="102" width="110" height="115" rx="10" fill="#1d4ed8" stroke="#60a5fa" stroke-width="1.5"/>
  <!-- Top aluminum cap -->
  <ellipse cx="630" cy="104" rx="55" ry="10" fill="#cbd5e1" stroke="#94a3b8"/>
  <line x1="608" y1="100" x2="652" y2="108" stroke="#64748b" stroke-width="1.5"/>
  <line x1="652" y1="100" x2="608" y2="108" stroke="#64748b" stroke-width="1.5"/>
  <!-- White negative stripe -->
  <rect x="655" y="110" width="26" height="105" fill="#e2e8f0"/>
  <text x="668" y="138" fill="#0f172a" font-family="monospace" font-size="18" font-weight="bold" text-anchor="middle">-</text>
  <text x="668" y="166" fill="#0f172a" font-family="monospace" font-size="18" font-weight="bold" text-anchor="middle">-</text>
  <text x="668" y="194" fill="#0f172a" font-family="monospace" font-size="18" font-weight="bold" text-anchor="middle">-</text>

  <!-- Label on blue body -->
  <text x="614" y="152" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">100 μF</text>
  <text x="614" y="172" fill="#fde047" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">25 V</text>

  <!-- Leads: Left long (+), Right short (-) -->
  <line x1="605" y1="217" x2="605" y2="282" stroke="#cbd5e1" stroke-width="4"/>
  <line x1="665" y1="217" x2="665" y2="260" stroke="#cbd5e1" stroke-width="4"/>

  <!-- Callouts -->
  <text x="500" y="255" fill="#4ade80" font-family="sans-serif" font-size="12" font-weight="bold">长脚 = 正极 (+)</text>
  <line x1="590" y1="251" x2="602" y2="251" stroke="#4ade80" stroke-width="1.5"/>

  <text x="692" y="155" fill="#f87171" font-family="sans-serif" font-size="12" font-weight="bold">白条 = 负极 (-)</text>
  <line x1="682" y1="151" x2="690" y2="151" stroke="#f87171" stroke-width="1.5"/>

  <text x="692" y="248" fill="#f87171" font-family="sans-serif" font-size="12" font-weight="bold">短脚 = 负极 (-)</text>
  <line x1="668" y1="244" x2="690" y2="244" stroke="#f87171" stroke-width="1.5"/>

  <text x="500" y="290" fill="#fde047" font-family="sans-serif" font-size="11">安全口诀：白条短脚接低电位，耐压 ≥ 2×电源电压</text>
</svg>`;

export const SHEET_FIG21 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 390" width="820" height="390" role="img" aria-label="分段线性电压波形与对应方波电流波形对齐图">
  <rect x="0" y="0" width="820" height="390" rx="12" fill="#0f172a"/>
  <text x="24" y="32" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">图 2-1：C = 2 μF 分段线性电压 v(t) 与微分电流 i(t) = C·dv/dt 波形精准对齐</text>

  <!-- Vertical time grid lines (x=100 is t=0, step 80px per 1ms, t=0..8ms -> x=100..740) -->
  <g stroke="#334155" stroke-width="1" stroke-dasharray="4,4">
    <line x1="260" y1="50" x2="260" y2="355"/>
    <line x1="420" y1="50" x2="420" y2="355"/>
    <line x1="580" y1="50" x2="580" y2="355"/>
    <line x1="740" y1="50" x2="740" y2="355"/>
  </g>

  <!-- Top Plot: v(t) (y=120 is 0V, +10V at y=65, -10V at y=175) -->
  <text x="24" y="64" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">v(t) [V]</text>
  <!-- Axes -->
  <line x1="100" y1="52" x2="100" y2="188" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="92" y1="120" x2="765" y2="120" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="772" y="124" fill="#94a3b8" font-family="sans-serif" font-size="12">t (ms)</text>
  <!-- Y ticks -->
  <text x="64" y="70" fill="#cbd5e1" font-family="monospace" font-size="12">+10</text>
  <text x="78" y="124" fill="#cbd5e1" font-family="monospace" font-size="12">0</text>
  <text x="64" y="179" fill="#cbd5e1" font-family="monospace" font-size="12">-10</text>
  <line x1="95" y1="65" x2="105" y2="65" stroke="#94a3b8"/>
  <line x1="95" y1="175" x2="105" y2="175" stroke="#94a3b8"/>

  <!-- v(t) polyline: (0,0)->(2,10)->(4,10)->(6,-10)->(8,0) -->
  <polyline points="100,120 260,65 420,65 580,175 740,120" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linejoin="round"/>
  <!-- Slope annotations -->
  <text x="148" y="84" fill="#7dd3fc" font-family="sans-serif" font-size="11">斜率 +5000 V/s</text>
  <text x="305" y="58" fill="#7dd3fc" font-family="sans-serif" font-size="11">斜率 0 V/s</text>
  <text x="488" y="106" fill="#7dd3fc" font-family="sans-serif" font-size="11">斜率 -10000 V/s</text>
  <text x="620" y="168" fill="#7dd3fc" font-family="sans-serif" font-size="11">斜率 +5000 V/s</text>

  <!-- Bottom Plot: i(t) (y=265 is 0mA, +10mA at y=225, -20mA at y=345) -->
  <text x="20" y="218" fill="#f97316" font-family="sans-serif" font-size="13" font-weight="bold">i(t) [mA]</text>
  <!-- Axes -->
  <line x1="100" y1="208" x2="100" y2="360" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="92" y1="265" x2="765" y2="265" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="772" y="269" fill="#94a3b8" font-family="sans-serif" font-size="12">t (ms)</text>
  <!-- Y ticks -->
  <text x="64" y="229" fill="#cbd5e1" font-family="monospace" font-size="12">+10</text>
  <text x="78" y="269" fill="#cbd5e1" font-family="monospace" font-size="12">0</text>
  <text x="64" y="349" fill="#cbd5e1" font-family="monospace" font-size="12">-20</text>
  <line x1="95" y1="225" x2="105" y2="225" stroke="#94a3b8"/>
  <line x1="95" y1="345" x2="105" y2="345" stroke="#94a3b8"/>

  <!-- X axis labels -->
  <text x="96" y="376" fill="#e2e8f0" font-family="monospace" font-size="12">0</text>
  <text x="256" y="376" fill="#e2e8f0" font-family="monospace" font-size="12">2</text>
  <text x="416" y="376" fill="#e2e8f0" font-family="monospace" font-size="12">4</text>
  <text x="576" y="376" fill="#e2e8f0" font-family="monospace" font-size="12">6</text>
  <text x="736" y="376" fill="#e2e8f0" font-family="monospace" font-size="12">8 ms</text>

  <!-- i(t) square segments -->
  <line x1="100" y1="225" x2="260" y2="225" stroke="#f97316" stroke-width="3.5"/>
  <line x1="260" y1="225" x2="260" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="260" y1="265" x2="420" y2="265" stroke="#f97316" stroke-width="3.5"/>
  <line x1="420" y1="265" x2="420" y2="345" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="420" y1="345" x2="580" y2="345" stroke="#f97316" stroke-width="3.5"/>
  <line x1="580" y1="345" x2="580" y2="225" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="580" y1="225" x2="740" y2="225" stroke="#f97316" stroke-width="3.5"/>

  <!-- Value badges -->
  <text x="155" y="218" fill="#fdba74" font-family="monospace" font-size="12" font-weight="bold">+10 mA</text>
  <text x="320" y="256" fill="#fdba74" font-family="monospace" font-size="12" font-weight="bold">0 mA</text>
  <text x="475" y="338" fill="#fdba74" font-family="monospace" font-size="12" font-weight="bold">-20 mA</text>
  <text x="635" y="218" fill="#fdba74" font-family="monospace" font-size="12" font-weight="bold">+10 mA</text>
</svg>`;

export const SHEET_FIG31 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 300" width="820" height="300" role="img" aria-label="直流稳态含双电容网络与开路等效电路对比图">
  <rect x="0" y="0" width="820" height="300" rx="12" fill="#0f172a"/>
  <text x="24" y="32" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">图 3-1：例题 4 直流稳态分析 — 原电路（左）与开路等效电路（右）</text>

  <!-- Left Box: Original Circuit -->
  <rect x="20" y="48" width="375" height="234" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="36" y="72" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">原电路（直流稳态：dv/dt = 0）</text>

  <!-- Source Vs=12V -->
  <circle cx="62" cy="170" r="18" fill="none" stroke="#f8fafc" stroke-width="2"/>
  <text x="62" y="166" fill="#f8fafc" font-family="monospace" font-size="13" text-anchor="middle">+</text>
  <text x="62" y="182" fill="#f8fafc" font-family="monospace" font-size="13" text-anchor="middle">-</text>
  <text x="32" y="146" fill="#fde047" font-family="sans-serif" font-size="12" font-weight="bold">12V</text>

  <!-- Wires left circuit -->
  <polyline points="62,152 62,108 100,108" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <!-- R1 = 3k -->
  <rect x="100" y="100" width="46" height="16" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="123" y="94" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">R1=3kΩ</text>
  <line x1="146" y1="108" x2="255" y2="108" stroke="#cbd5e1" stroke-width="2"/>
  <!-- Node A -->
  <circle cx="176" cy="108" r="3.5" fill="#38bdf8"/>
  <text x="176" y="96" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">A</text>

  <!-- R2 = 6k vertical -->
  <line x1="176" y1="108" x2="176" y2="144" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="168" y="144" width="16" height="46" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="176" y1="190" x2="176" y2="236" stroke="#cbd5e1" stroke-width="2"/>
  <text x="150" y="172" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">R2=6k</text>

  <!-- C1 = 10uF parallel to R2 -->
  <line x1="226" y1="108" x2="226" y2="160" stroke="#38bdf8" stroke-width="2"/>
  <line x1="214" y1="160" x2="238" y2="160" stroke="#38bdf8" stroke-width="3"/>
  <line x1="214" y1="172" x2="238" y2="172" stroke="#38bdf8" stroke-width="3"/>
  <line x1="226" y1="172" x2="226" y2="236" stroke="#38bdf8" stroke-width="2"/>
  <text x="226" y="152" fill="#7dd3fc" font-family="sans-serif" font-size="10" text-anchor="middle">C1=10μF</text>

  <!-- R3 = 2k horizontal -->
  <rect x="255" y="100" width="46" height="16" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="278" y="94" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">R3=2kΩ</text>
  <line x1="301" y1="108" x2="365" y2="108" stroke="#cbd5e1" stroke-width="2"/>
  <!-- Node B -->
  <circle cx="322" cy="108" r="3.5" fill="#f97316"/>
  <text x="322" y="96" fill="#f97316" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">B</text>

  <!-- R4 = 4k vertical -->
  <line x1="322" y1="108" x2="322" y2="144" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="314" y="144" width="16" height="46" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="322" y1="190" x2="322" y2="236" stroke="#cbd5e1" stroke-width="2"/>
  <text x="300" y="172" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="end">R4=4k</text>

  <!-- C2 = 20uF parallel to R4 -->
  <line x1="365" y1="108" x2="365" y2="160" stroke="#f97316" stroke-width="2"/>
  <line x1="353" y1="160" x2="377" y2="160" stroke="#f97316" stroke-width="3"/>
  <line x1="353" y1="172" x2="377" y2="172" stroke="#f97316" stroke-width="3"/>
  <line x1="365" y1="172" x2="365" y2="236" stroke="#f97316" stroke-width="2"/>
  <text x="364" y="152" fill="#fdba74" font-family="sans-serif" font-size="10" text-anchor="middle">C2=20μF</text>

  <!-- Ground rail left -->
  <polyline points="62,188 62,236 365,236" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <text x="210" y="258" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">参考地 GND (0 V)</text>

  <!-- Middle arrow -->
  <text x="410" y="168" fill="#4ade80" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">⇒</text>

  <!-- Right Box: DC Open-Circuit Equivalent -->
  <rect x="425" y="48" width="375" height="234" rx="8" fill="#1e293b" stroke="#4ade80" stroke-width="1.5"/>
  <text x="441" y="72" fill="#4ade80" font-family="sans-serif" font-size="13" font-weight="bold">直流稳态开路等效（iC1 = 0, iC2 = 0）</text>

  <!-- Source Vs=12V -->
  <circle cx="467" cy="170" r="18" fill="none" stroke="#f8fafc" stroke-width="2"/>
  <text x="467" y="166" fill="#f8fafc" font-family="monospace" font-size="13" text-anchor="middle">+</text>
  <text x="467" y="182" fill="#f8fafc" font-family="monospace" font-size="13" text-anchor="middle">-</text>
  <text x="442" y="146" fill="#fde047" font-family="sans-serif" font-size="12" font-weight="bold">12V</text>

  <polyline points="467,152 467,108 505,108" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="505" y="100" width="46" height="16" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="528" y="94" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">3kΩ</text>
  <line x1="551" y1="108" x2="660" y2="108" stroke="#cbd5e1" stroke-width="2"/>
  <circle cx="581" cy="108" r="3.5" fill="#38bdf8"/>
  <text x="581" y="96" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">VA=6V</text>

  <!-- R2 = 6k -->
  <line x1="581" y1="108" x2="581" y2="144" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="573" y="144" width="16" height="46" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="581" y1="190" x2="581" y2="236" stroke="#cbd5e1" stroke-width="2"/>
  <text x="556" y="172" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">6kΩ</text>

  <!-- Open circuit C1 -->
  <line x1="631" y1="108" x2="631" y2="152" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,3"/>
  <circle cx="631" cy="154" r="3.5" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="631" cy="182" r="3.5" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <line x1="631" y1="184" x2="631" y2="236" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="631" y="172" fill="#7dd3fc" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">VC1=6V</text>

  <!-- R3 = 2k -->
  <rect x="660" y="100" width="46" height="16" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="683" y="94" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">2kΩ</text>
  <line x1="706" y1="108" x2="770" y2="108" stroke="#cbd5e1" stroke-width="2"/>
  <circle cx="727" cy="108" r="3.5" fill="#f97316"/>
  <text x="727" y="96" fill="#f97316" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">VB=4V</text>

  <!-- R4 = 4k -->
  <line x1="727" y1="108" x2="727" y2="144" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="719" y="144" width="16" height="46" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="727" y1="190" x2="727" y2="236" stroke="#cbd5e1" stroke-width="2"/>
  <text x="706" y="172" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="end">4kΩ</text>

  <!-- Open circuit C2 -->
  <line x1="770" y1="108" x2="770" y2="152" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,3"/>
  <circle cx="770" cy="154" r="3.5" fill="none" stroke="#f97316" stroke-width="2"/>
  <circle cx="770" cy="182" r="3.5" fill="none" stroke="#f97316" stroke-width="2"/>
  <line x1="770" y1="184" x2="770" y2="236" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="768" y="172" fill="#fdba74" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">VC2=4V</text>

  <polyline points="467,188 467,236 770,236" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <text x="615" y="258" fill="#4ade80" font-family="sans-serif" font-size="11" text-anchor="middle">I总 = 2 mA  |  wC1 = 180 μJ  |  wC2 = 160 μJ  |  w总 = 340 μJ</text>
</svg>`;

export const SHEET_FIG41 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 310" width="820" height="310" role="img" aria-label="电容串并联与电阻镜像对照及混联网络化简图">
  <rect x="0" y="0" width="820" height="310" rx="12" fill="#0f172a"/>
  <text x="24" y="32" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">图 4-1：电容与电阻串并联“镜像对照”（左）与例题 5 混联电容网络（右）</text>

  <!-- Left Panel: Mirror Comparison Table -->
  <rect x="20" y="48" width="385" height="242" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="40" y="74" fill="#fde047" font-family="sans-serif" font-size="14" font-weight="bold">镜像口诀：电容并联像电阻串联，电容串联像电阻并联</text>

  <!-- Parallel box -->
  <rect x="34" y="88" width="357" height="88" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2"/>
  <text x="48" y="109" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">并联 (Parallel)：极板面积 A 相加 → 越并越大</text>
  <text x="48" y="133" fill="#f8fafc" font-family="monospace" font-size="13">电容：Ceq = C1 + C2 + ... + CN</text>
  <text x="48" y="157" fill="#94a3b8" font-family="monospace" font-size="12">对照电阻：1/Req = 1/R1 + 1/R2 + ... (倒数相加)</text>

  <!-- Series box -->
  <rect x="34" y="188" width="357" height="88" rx="6" fill="#0f172a" stroke="#f97316" stroke-width="1.2"/>
  <text x="48" y="209" fill="#f97316" font-family="sans-serif" font-size="13" font-weight="bold">串联 (Series)：极板间距 d 相加 → 越串越小</text>
  <text x="48" y="233" fill="#f8fafc" font-family="monospace" font-size="13">电容：1/Ceq = 1/C1 + 1/C2 + ... (反比分压)</text>
  <text x="48" y="257" fill="#94a3b8" font-family="monospace" font-size="12">对照电阻：Req = R1 + R2 + ... (直接相加)</text>

  <!-- Right Panel: Example 5 Mixed Network -->
  <rect x="420" y="48" width="380" height="242" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="440" y="74" fill="#4ade80" font-family="sans-serif" font-size="14" font-weight="bold">例题 5：四电容混联网络（Vs = 9 V）</text>

  <!-- Source 9V -->
  <circle cx="462" cy="176" r="18" fill="none" stroke="#f8fafc" stroke-width="2"/>
  <text x="462" y="172" fill="#f8fafc" font-family="monospace" font-size="13" text-anchor="middle">+</text>
  <text x="462" y="188" fill="#f8fafc" font-family="monospace" font-size="13" text-anchor="middle">-</text>
  <text x="438" y="150" fill="#fde047" font-family="sans-serif" font-size="12" font-weight="bold">9V</text>

  <!-- Top wire + C1=60uF -->
  <polyline points="462,158 462,114 516,114" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="516" y1="100" x2="516" y2="128" stroke="#38bdf8" stroke-width="3"/>
  <line x1="528" y1="100" x2="528" y2="128" stroke="#38bdf8" stroke-width="3"/>
  <text x="522" y="94" fill="#7dd3fc" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">C1=60μF</text>
  <line x1="528" y1="114" x2="720" y2="114" stroke="#cbd5e1" stroke-width="2"/>

  <!-- Branch C2 = 20uF -->
  <circle cx="610" cy="114" r="3.5" fill="#cbd5e1"/>
  <line x1="610" y1="114" x2="610" y2="168" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="596" y1="168" x2="624" y2="168" stroke="#4ade80" stroke-width="3"/>
  <line x1="596" y1="180" x2="624" y2="180" stroke="#4ade80" stroke-width="3"/>
  <line x1="610" y1="180" x2="610" y2="236" stroke="#cbd5e1" stroke-width="2"/>
  <text x="562" y="178" fill="#86efac" font-family="sans-serif" font-size="11" font-weight="bold">C2=20μF</text>

  <!-- Branch C3=20uF in series with C4=20uF -->
  <line x1="720" y1="114" x2="720" y2="142" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="706" y1="142" x2="734" y2="142" stroke="#f97316" stroke-width="3"/>
  <line x1="706" y1="152" x2="734" y2="152" stroke="#f97316" stroke-width="3"/>
  <text x="742" y="151" fill="#fdba74" font-family="sans-serif" font-size="11">C3=20μF</text>

  <line x1="720" y1="152" x2="720" y2="194" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="706" y1="194" x2="734" y2="194" stroke="#f97316" stroke-width="3"/>
  <line x1="706" y1="204" x2="734" y2="204" stroke="#f97316" stroke-width="3"/>
  <text x="742" y="203" fill="#fdba74" font-family="sans-serif" font-size="11">C4=20μF</text>
  <line x1="720" y1="204" x2="720" y2="236" stroke="#cbd5e1" stroke-width="2"/>

  <!-- Bottom return wire -->
  <polyline points="462,194 462,236 720,236" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <text x="610" y="270" fill="#fde047" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">化简结果：C34 = 10 μF → C234 = 30 μF → Ceq = 20 μF</text>
</svg>`;

export const SHEET_FIG51 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 270" width="820" height="270" role="img" aria-label="苏格拉底五步引导题直流稳态含电容网络电路图">
  <rect x="0" y="0" width="820" height="270" rx="12" fill="#0f172a"/>
  <text x="24" y="32" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">图 5-1：苏格拉底 5 步实战引导题 — 9 V 直流稳态含电容网络（注意 R5 支路！）</text>

  <!-- Source 9V -->
  <circle cx="80" cy="150" r="20" fill="none" stroke="#f8fafc" stroke-width="2"/>
  <text x="80" y="146" fill="#f8fafc" font-family="monospace" font-size="14" text-anchor="middle">+</text>
  <text x="80" y="162" fill="#f8fafc" font-family="monospace" font-size="14" text-anchor="middle">-</text>
  <text x="48" y="122" fill="#fde047" font-family="sans-serif" font-size="13" font-weight="bold">Vs = 9 V</text>

  <!-- R1 = 1k -->
  <polyline points="80,130 80,82 140,82" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="140" y="73" width="60" height="18" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="170" y="66" fill="#e2e8f0" font-family="sans-serif" font-size="12" text-anchor="middle">R1 = 1 kΩ</text>
  <line x1="200" y1="82" x2="410" y2="82" stroke="#cbd5e1" stroke-width="2"/>

  <!-- Node 1 -->
  <circle cx="260" cy="82" r="4.5" fill="#38bdf8"/>
  <text x="260" y="68" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">节点 1 (V1)</text>

  <!-- R2 = 3k vertical -->
  <line x1="260" y1="82" x2="260" y2="122" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="251" y="122" width="18" height="54" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="260" y1="176" x2="260" y2="220" stroke="#cbd5e1" stroke-width="2"/>
  <text x="242" y="153" fill="#e2e8f0" font-family="sans-serif" font-size="12" text-anchor="end">R2=3kΩ</text>

  <!-- C1 = 100uF parallel to R2 -->
  <line x1="345" y1="82" x2="345" y2="142" stroke="#38bdf8" stroke-width="2"/>
  <line x1="330" y1="142" x2="360" y2="142" stroke="#38bdf8" stroke-width="3"/>
  <line x1="330" y1="154" x2="360" y2="154" stroke="#38bdf8" stroke-width="3"/>
  <line x1="345" y1="154" x2="345" y2="220" stroke="#38bdf8" stroke-width="2"/>
  <text x="345" y="132" fill="#7dd3fc" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">C1 = 100 μF</text>

  <!-- R3 = 3k horizontal -->
  <rect x="410" y="73" width="60" height="18" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="440" y="66" fill="#e2e8f0" font-family="sans-serif" font-size="12" text-anchor="middle">R3 = 3 kΩ</text>
  <line x1="470" y1="82" x2="610" y2="82" stroke="#cbd5e1" stroke-width="2"/>

  <!-- Node 2 -->
  <circle cx="535" cy="82" r="4.5" fill="#f97316"/>
  <text x="535" y="68" fill="#f97316" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">节点 2 (V2)</text>

  <!-- R4 = 3k vertical -->
  <line x1="535" y1="82" x2="535" y2="122" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="526" y="122" width="18" height="54" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="535" y1="176" x2="535" y2="220" stroke="#cbd5e1" stroke-width="2"/>
  <text x="518" y="153" fill="#e2e8f0" font-family="sans-serif" font-size="12" text-anchor="end">R4=3kΩ</text>

  <!-- R5 = 2k in series with C2 = 200uF -->
  <rect x="610" y="73" width="60" height="18" fill="#334155" stroke="#facc15" stroke-width="1.8"/>
  <text x="640" y="66" fill="#fde047" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">R5 = 2 kΩ</text>
  <polyline points="670,82 725,82 725,142" fill="none" stroke="#f97316" stroke-width="2"/>
  <line x1="710" y1="142" x2="740" y2="142" stroke="#f97316" stroke-width="3"/>
  <line x1="710" y1="154" x2="740" y2="154" stroke="#f97316" stroke-width="3"/>
  <line x1="725" y1="154" x2="725" y2="220" stroke="#f97316" stroke-width="2"/>
  <text x="725" y="132" fill="#fdba74" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">C2 = 200 μF</text>

  <!-- Ground rail -->
  <polyline points="80,170 80,220 725,220" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <text x="410" y="248" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">参考地 GND (0 V)  |  所有电容额定耐压 25 V，极性上正下负</text>
</svg>`;

export const SHEET_MINI1 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 110' width='320' height='110'><rect width='320' height='110' rx='8' fill='#1e293b'/><text x='16' y='24' fill='#fde047' font-family='sans-serif' font-size='12' font-weight='bold'>步骤 1：识别 R5 与 C2 串联支路</text><line x1='30' y1='62' x2='90' y2='62' stroke='#cbd5e1' stroke-width='2'/><rect x='90' y='52' width='56' height='20' fill='#334155' stroke='#facc15' stroke-width='1.5'/><text x='118' y='46' fill='#fde047' font-family='sans-serif' font-size='11' text-anchor='middle'>R5=2kΩ</text><line x1='146' y1='62' x2='200' y2='62' stroke='#f97316' stroke-width='2' stroke-dasharray='4,3'/><circle cx='204' cy='62' r='4' fill='none' stroke='#f97316' stroke-width='2'/><circle cx='236' cy='62' r='4' fill='none' stroke='#f97316' stroke-width='2'/><line x1='240' y1='62' x2='290' y2='62' stroke='#cbd5e1' stroke-width='2'/><text x='220' y='92' fill='#fdba74' font-family='sans-serif' font-size='11' text-anchor='middle'>C2 开路 → iR5 = ?</text></svg>`;

export const SHEET_MINI2 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 110' width='320' height='110'><rect width='320' height='110' rx='8' fill='#1e293b'/><text x='16' y='24' fill='#38bdf8' font-family='sans-serif' font-size='12' font-weight='bold'>步骤 2：纯电阻网络归并</text><text x='24' y='56' fill='#e2e8f0' font-family='monospace' font-size='12'>R3 + R4 = 3k + 3k = 6 kΩ</text><text x='24' y='78' fill='#e2e8f0' font-family='monospace' font-size='12'>Rpar = 3k || 6k = 2 kΩ</text><text x='24' y='98' fill='#4ade80' font-family='monospace' font-size='12'>Req = R1 + Rpar = ?</text></svg>`;

export const SHEET_MINI3 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 110' width='320' height='110'><rect width='320' height='110' rx='8' fill='#1e293b'/><text x='16' y='24' fill='#38bdf8' font-family='sans-serif' font-size='12' font-weight='bold'>步骤 3：求节点 1 电压 VC1</text><text x='24' y='56' fill='#e2e8f0' font-family='monospace' font-size='12'>Vs = 9 V, Is = 3 mA, R1 = 1 kΩ</text><text x='24' y='82' fill='#7dd3fc' font-family='monospace' font-size='13'>VC1 = V1 = Vs - Is·R1 = Is·Rpar</text></svg>`;

export const SHEET_MINI4 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 110' width='320' height='110'><rect width='320' height='110' rx='8' fill='#1e293b'/><text x='16' y='24' fill='#f97316' font-family='sans-serif' font-size='12' font-weight='bold'>步骤 4：分压求 V2 并跨越 R5</text><text x='24' y='54' fill='#e2e8f0' font-family='monospace' font-size='12'>V2 = V1 · R4 / (R3 + R4)</text><text x='24' y='78' fill='#fde047' font-family='monospace' font-size='12'>因 iR5 = 0 ⇒ vR5 = 0 V</text><text x='24' y='98' fill='#fdba74' font-family='monospace' font-size='12'>故 VC2 = V2 - vR5 = V2</text></svg>`;

export const SHEET_MINI5 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 110' width='320' height='110'><rect width='320' height='110' rx='8' fill='#1e293b'/><text x='16' y='24' fill='#4ade80' font-family='sans-serif' font-size='12' font-weight='bold'>步骤 5：电场储能汇总</text><text x='24' y='54' fill='#7dd3fc' font-family='monospace' font-size='12'>wC1 = 0.5 × 100μF × (6V)^2</text><text x='24' y='76' fill='#fdba74' font-family='monospace' font-size='12'>wC2 = 0.5 × 200μF × (3V)^2</text><text x='24' y='98' fill='#4ade80' font-family='monospace' font-size='12'>w_total = wC1 + wC2 = ?</text></svg>`;
