// The inline SVGs of the W4-L5 lesson sheet (docs/lessons/W4-L5.md), copied from the sheet by a
// script, not retyped: the six act diagrams and the five step diagrams of the guided-example JSON.
// They are drawn for a dark canvas; svgs.ts recolours them for the light theme and adjusts them.

export const SHEET_ACT1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 280" width="820" height="280">
  <rect width="820" height="280" rx="12" fill="#0f172a"/>
  <text x="410" y="28" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">Act 1: 单位阶跃函数 u(t) 与机械开关的等效建模</text>

  <!-- Left panel: u(t) waveform -->
  <rect x="20" y="46" width="240" height="212" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="140" y="70" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">单位阶跃函数 u(t)</text>
  <!-- Axes -->
  <line x1="45" y1="205" x2="242" y2="205" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="242,205 234,201 234,209" fill="#94a3b8"/>
  <line x1="135" y1="230" x2="135" y2="90" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="135,90 131,98 139,98" fill="#94a3b8"/>
  <text x="236" y="222" fill="#cbd5e1" font-family="sans-serif" font-size="12">t</text>
  <text x="145" y="98" fill="#cbd5e1" font-family="sans-serif" font-size="12">u(t)</text>
  <!-- Step waveform -->
  <line x1="55" y1="205" x2="135" y2="205" stroke="#f59e0b" stroke-width="3"/>
  <line x1="135" y1="205" x2="135" y2="130" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,3"/>
  <line x1="135" y1="130" x2="228" y2="130" stroke="#f59e0b" stroke-width="3"/>
  <circle cx="135" cy="205" r="4" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <circle cx="135" cy="130" r="4" fill="#f59e0b"/>
  <text x="115" y="135" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="bold">1</text>
  <text x="122" y="222" fill="#94a3b8" font-family="sans-serif" font-size="11">0</text>
  <text x="85" y="192" fill="#94a3b8" font-family="sans-serif" font-size="11">t &lt; 0: 0</text>
  <text x="155" y="120" fill="#fde68a" font-family="sans-serif" font-size="11">t &gt; 0: 1</text>
  <text x="140" y="246" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">区分换路前 0- 与换路后 0+</text>

  <!-- Middle panel: Physical switch circuit -->
  <rect x="280" y="46" width="245" height="212" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="402" y="70" text-anchor="middle" fill="#a78bfa" font-family="sans-serif" font-size="13" font-weight="bold">物理电路：开关 t = 0 闭合</text>
  <!-- Wires -->
  <polyline points="320,195 320,165" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <polyline points="320,135 320,105 352,105" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <!-- Switch -->
  <circle cx="352" cy="105" r="3" fill="#38bdf8"/>
  <line x1="352" y1="105" x2="386" y2="88" stroke="#38bdf8" stroke-width="2.5"/>
  <circle cx="390" cy="105" r="3" fill="#38bdf8"/>
  <path d="M 378 88 A 22 22 0 0 1 388 101" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="370" y="84" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11">t = 0</text>
  <!-- R and C -->
  <polyline points="390,105 405,105 410,97 418,113 426,97 434,113 442,97 447,105 480,105 480,145" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <text x="426" y="90" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12">R</text>
  <line x1="464" y1="145" x2="496" y2="145" stroke="#38bdf8" stroke-width="3"/>
  <line x1="464" y1="157" x2="496" y2="157" stroke="#38bdf8" stroke-width="3"/>
  <text x="504" y="155" fill="#38bdf8" font-family="sans-serif" font-size="12">C</text>
  <polyline points="480,157 480,195 320,195" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <!-- Voltage source -->
  <circle cx="320" cy="150" r="15" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="320" y="147" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">+</text>
  <text x="320" y="160" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">-</text>
  <text x="295" y="155" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12">Vs</text>
  <!-- Ground -->
  <line x1="392" y1="195" x2="392" y2="210" stroke="#94a3b8" stroke-width="2"/>
  <line x1="380" y1="210" x2="404" y2="210" stroke="#94a3b8" stroke-width="2"/>
  <line x1="384" y1="216" x2="400" y2="216" stroke="#94a3b8" stroke-width="2"/>
  <line x1="388" y1="222" x2="396" y2="222" stroke="#94a3b8" stroke-width="2"/>
  <text x="402" y="246" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">真实实验室开关动作</text>

  <!-- Equivalence Arrow -->
  <text x="541" y="158" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-size="22" font-weight="bold">≡</text>

  <!-- Right panel: Equivalent Step Source Circuit -->
  <rect x="558" y="46" width="242" height="212" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="679" y="70" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold">等效模型：Vs u(t) 阶跃源</text>
  <polyline points="605,195 605,165" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <polyline points="605,135 605,105 645,105 650,97 658,113 666,97 674,113 682,97 687,105 745,105 745,145" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <text x="666" y="90" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12">R</text>
  <line x1="729" y1="145" x2="761" y2="145" stroke="#38bdf8" stroke-width="3"/>
  <line x1="729" y1="157" x2="761" y2="157" stroke="#38bdf8" stroke-width="3"/>
  <text x="769" y="155" fill="#38bdf8" font-family="sans-serif" font-size="12">C</text>
  <text x="745" y="135" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11">+ vC(t)</text>
  <text x="745" y="176" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11">-</text>
  <polyline points="745,157 745,195 605,195" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <circle cx="605" cy="150" r="15" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="605" y="147" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-size="12" font-weight="bold">+</text>
  <text x="605" y="160" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-size="12" font-weight="bold">-</text>
  <text x="580" y="155" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11">Vs u(t)</text>
  <line x1="675" y1="195" x2="675" y2="210" stroke="#94a3b8" stroke-width="2"/>
  <line x1="663" y1="210" x2="687" y2="210" stroke="#94a3b8" stroke-width="2"/>
  <line x1="667" y1="216" x2="683" y2="216" stroke="#94a3b8" stroke-width="2"/>
  <line x1="671" y1="222" x2="679" y2="222" stroke="#94a3b8" stroke-width="2"/>
  <text x="679" y="246" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">适合直接列写非齐次 ODE</text>
</svg>`;

export const SHEET_ACT2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 360" width="820" height="360">
  <rect width="820" height="360" rx="12" fill="#0f172a"/>
  <text x="410" y="28" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">Act 2: RC 阶跃充电曲线 vC(t) = 5(1 - e^(-t/τ)) 与稳态/暂态分量拆解</text>

  <!-- Plot Background -->
  <rect x="75" y="48" width="690" height="260" rx="6" fill="#111827" stroke="#334155" stroke-width="1.5"/>

  <!-- Grid Lines (y=190 is 0V, 1V = 24px -> +5V at y=70, -5V at y=310 -> wait let's set 0V at y=195, 1V=22px: +5V=85, -5V=305) -->
  <!-- Horizontal Grid -->
  <line x1="75" y1="85" x2="765" y2="85" stroke="#1e293b" stroke-width="1"/>
  <line x1="75" y1="125.5" x2="765" y2="125.5" stroke="#1e293b" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="75" y1="195" x2="765" y2="195" stroke="#64748b" stroke-width="1.5"/>
  <line x1="75" y1="305" x2="765" y2="305" stroke="#1e293b" stroke-width="1"/>

  <!-- Vertical Grid: t=0 at x=115, 1tau = 110px (0..5tau -> x=115, 225, 335, 445, 555, 665) -->
  <line x1="115" y1="48" x2="115" y2="308" stroke="#64748b" stroke-width="1.5"/>
  <line x1="225" y1="48" x2="225" y2="308" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="335" y1="48" x2="335" y2="308" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="445" y1="48" x2="445" y2="308" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="555" y1="48" x2="555" y2="308" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="665" y1="48" x2="665" y2="308" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>

  <!-- Axis Labels -->
  <text x="65" y="89" text-anchor="end" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">+5.0V (Vs)</text>
  <text x="65" y="129" text-anchor="end" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">3.16V (63.2%)</text>
  <text x="65" y="199" text-anchor="end" fill="#cbd5e1" font-family="sans-serif" font-size="11">0 V</text>
  <text x="65" y="305" text-anchor="end" fill="#f43f5e" font-family="sans-serif" font-size="11">-5.0V (-Vs)</text>

  <text x="115" y="326" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">0</text>
  <text x="225" y="326" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">1τ (1s)</text>
  <text x="335" y="326" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">2τ</text>
  <text x="445" y="326" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">3τ</text>
  <text x="555" y="326" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">4τ</text>
  <text x="665" y="326" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">5τ (5s 充满)</text>
  <text x="748" y="210" fill="#cbd5e1" font-family="sans-serif" font-size="12">t (s)</text>

  <!-- 1. Forced / Steady-State Response: vf(t) = +5V (y=85) -->
  <line x1="115" y1="85" x2="740" y2="85" stroke="#34d399" stroke-width="2" stroke-dasharray="8,4"/>

  <!-- 2. Initial Tangent Line from (115, 195) to (225, 85) -->
  <line x1="115" y1="195" x2="225" y2="85" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="5,4"/>
  <circle cx="225" cy="85" r="3.5" fill="#fbbf24"/>
  <text x="233" y="75" fill="#fbbf24" font-family="sans-serif" font-size="11">初始斜率切线于 t = 1τ 交于 Vs</text>

  <!-- 3. Natural / Transient Component: vn(t) = -5 * e^(-t/tau)
       y = 195 + 110 * e^(-t/tau):
       t=0: 305; t=0.5: 261.7; t=1: 235.5; t=2: 209.9; t=3: 200.5; t=4: 197.0; t=5: 195.7 -->
  <path d="M 115 305 Q 165 258 225 235.5 T 335 209.9 T 445 200.5 T 555 197.0 T 665 195.7 L 740 195.3"
        fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-dasharray="6,3"/>

  <!-- 4. Total Step Response: vC(t) = 5*(1 - e^(-t/tau))
       y = 195 - 110*(1 - e^(-t/tau)) = 85 + 110*e^(-t/tau):
       t=0: 195; t=0.5: 151.7; t=1: 125.5; t=2: 99.9; t=3: 90.5; t=4: 87.0; t=5: 85.7 -->
  <path d="M 115 195 Q 165 148 225 125.5 T 335 99.9 T 445 90.5 T 555 87.0 T 665 85.7 L 740 85.3"
        fill="none" stroke="#38bdf8" stroke-width="3.5"/>

  <!-- Highlight points at 1tau and 5tau -->
  <circle cx="225" cy="125.5" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="236" y="114" width="142" height="24" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1"/>
  <text x="307" y="130" text-anchor="middle" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="bold">1τ: 63.2% (3.16 V)</text>

  <circle cx="665" cy="85.7" r="5" fill="#34d399" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="598" y="98" width="136" height="24" rx="4" fill="#064e3b" stroke="#34d399" stroke-width="1"/>
  <text x="666" y="114" text-anchor="middle" fill="#d1fae5" font-family="sans-serif" font-size="11" font-weight="bold">5τ: 99.3% (4.97 V)</text>

  <!-- Legend -->
  <rect x="470" y="232" width="280" height="66" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <line x1="482" y1="248" x2="508" y2="248" stroke="#38bdf8" stroke-width="3.5"/>
  <text x="516" y="252" fill="#e2e8f0" font-family="sans-serif" font-size="11">完全响应 vC(t) = vf + vn = 5(1 - e^-t)</text>
  <line x1="482" y1="266" x2="508" y2="266" stroke="#34d399" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="516" y="270" fill="#a7f3d0" font-family="sans-serif" font-size="11">强迫/稳态分量 vf = +5 V</text>
  <line x1="482" y1="284" x2="508" y2="284" stroke="#f43f5e" stroke-width="2.2" stroke-dasharray="5,3"/>
  <text x="516" y="288" fill="#fecdd3" font-family="sans-serif" font-size="11">自然/暂态分量 vn = -5 e^-t</text>
</svg>`;

export const SHEET_ACT3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 340" width="820" height="340">
  <rect width="820" height="340" rx="12" fill="#0f172a"/>
  <text x="410" y="26" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">Act 3: Sadiku 7.5 综合例题原图与 0- / 0+ / ∞ 三态等效切换</text>

  <!-- Top: Original Circuit -->
  <rect x="20" y="42" width="780" height="142" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="36" y="62" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">原始电路（理论值：低阻，3D面包板层按 1000x 缩放至 kΩ / μF）</text>

  <!-- Left branch: V1=18V, R1=3 Ohm, R2=6 Ohm -->
  <circle cx="80" cy="122" r="14" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="80" y="119" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">+</text>
  <text x="80" y="131" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">-</text>
  <text x="46" y="126" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11">18V</text>

  <polyline points="80,108 80,82 118,82 123,75 130,89 137,75 144,89 151,75 156,82 220,82" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <text x="137" y="70" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">R1=3Ω</text>
  <!-- R2 vertical -->
  <polyline points="200,82 200,102 193,107 207,114 193,121 207,128 193,135 200,140 200,164" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <text x="172" y="126" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">R2=6Ω</text>

  <!-- Switch A to B -->
  <circle cx="225" cy="82" r="4" fill="#38bdf8"/>
  <text x="225" y="71" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">A</text>
  <circle cx="295" cy="82" r="4" fill="#f59e0b"/>
  <text x="295" y="71" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-size="11" font-weight="bold">B</text>
  <circle cx="260" cy="108" r="4" fill="#f8fafc"/>
  <line x1="260" y1="108" x2="228" y2="85" stroke="#fbbf24" stroke-width="2.5"/>
  <path d="M 244 82 Q 260 66 278 80" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3,2"/>
  <polygon points="282,82 273,77 275,85" fill="#fbbf24"/>
  <text x="260" y="64" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="10">t = 0</text>

  <!-- Capacitor C = 0.25F -->
  <line x1="260" y1="112" x2="260" y2="128" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="244" y1="128" x2="276" y2="128" stroke="#38bdf8" stroke-width="3"/>
  <line x1="244" y1="138" x2="276" y2="138" stroke="#38bdf8" stroke-width="3"/>
  <line x1="260" y1="138" x2="260" y2="164" stroke="#e2e8f0" stroke-width="2"/>
  <text x="305" y="136" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">C=0.25F</text>
  <text x="236" y="136" text-anchor="end" fill="#fbbf24" font-family="sans-serif" font-size="11">+ vC -</text>

  <!-- Right branch: B node -> R4=12 Ohm parallel, R3=6 Ohm series, V2=36V -->
  <polyline points="299,82 475,82 480,75 487,89 494,75 501,89 508,75 513,82 590,82 590,108" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <text x="494" y="70" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">R3=6Ω</text>
  <!-- Current arrow i3 going left from V2 toward node B -->
  <line x1="565" y1="95" x2="525" y2="95" stroke="#f43f5e" stroke-width="2"/>
  <polygon points="525,95 533,91 533,99" fill="#f43f5e"/>
  <text x="545" y="110" text-anchor="middle" fill="#fb7185" font-family="sans-serif" font-size="11" font-weight="bold">i3(t)</text>

  <!-- R4 vertical -->
  <polyline points="390,82 390,102 383,107 397,114 383,121 397,128 383,135 390,140 390,164" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <text x="424" y="126" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">R4=12Ω</text>

  <!-- V2=36V -->
  <circle cx="590" cy="122" r="14" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="590" y="119" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-size="11" font-weight="bold">+</text>
  <text x="590" y="131" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-size="11" font-weight="bold">-</text>
  <text x="626" y="126" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-size="11">V2=36V</text>

  <!-- Bottom common ground bus -->
  <polyline points="80,136 80,164 590,164 590,136" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <line x1="335" y1="164" x2="335" y2="174" stroke="#94a3b8" stroke-width="2"/>
  <line x1="325" y1="174" x2="345" y2="174" stroke="#94a3b8" stroke-width="2"/>
  <line x1="329" y1="178" x2="341" y2="178" stroke="#94a3b8" stroke-width="2"/>

  <!-- Summary badge on top right -->
  <rect x="658" y="62" width="128" height="106" rx="6" fill="#0f172a" stroke="#475569" stroke-width="1"/>
  <text x="722" y="82" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">核心验算结果</text>
  <text x="722" y="102" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">Rth = 4 Ω</text>
  <text x="722" y="120" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">τ = 1.0 s</text>
  <text x="722" y="138" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11">vC = 24 - 12e^-t</text>
  <text x="722" y="156" text-anchor="middle" fill="#fb7185" font-family="sans-serif" font-size="11">i3 = 2 + 2e^-t</text>

  <!-- Bottom 3 Cards: 0- / 0+ / infinity -->
  <!-- Card 1: t=0- -->
  <rect x="20" y="198" width="248" height="126" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="144" y="218" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">状态 1: t = 0-（开关在 A）</text>
  <text x="34" y="242" fill="#e2e8f0" font-family="sans-serif" font-size="11">• 直流稳态：电容 C 等效开路</text>
  <text x="34" y="264" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">• vC(0-) = 18 × 6/(3+6) = 12 V</text>
  <text x="34" y="286" fill="#94a3b8" font-family="sans-serif" font-size="11">• B 侧独立分压：i3(0-) = 36/18 = 2 A</text>
  <text x="34" y="308" fill="#94a3b8" font-family="sans-serif" font-size="11">• 电容电流：iC(0-) = 0 A</text>

  <!-- Card 2: t=0+ -->
  <rect x="286" y="198" width="248" height="126" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="410" y="218" text-anchor="middle" fill="#fb7185" font-family="sans-serif" font-size="13" font-weight="bold">状态 2: t = 0+（切至 B 瞬间）</text>
  <text x="300" y="242" fill="#e2e8f0" font-family="sans-serif" font-size="11">• C 替换为 12 V 恒压源（连续）</text>
  <text x="300" y="264" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">• i3(0+) = (36 - 12)/6 = 4 A !!</text>
  <text x="300" y="286" fill="#fda4af" font-family="sans-serif" font-size="11">• 非状态变量突变：2 A → 4 A</text>
  <text x="300" y="308" fill="#fda4af" font-family="sans-serif" font-size="11">• iC(0+) = 4 - 12/12 = 3 A (突变)</text>

  <!-- Card 3: t=infinity -->
  <rect x="552" y="198" width="248" height="126" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
  <text x="676" y="218" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold">状态 3: t = ∞（新直流稳态）</text>
  <text x="566" y="242" fill="#e2e8f0" font-family="sans-serif" font-size="11">• 电容 C 再次等效开路</text>
  <text x="566" y="264" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">• vC(∞) = Vth = 36×12/18 = 24 V</text>
  <text x="566" y="286" fill="#e2e8f0" font-family="sans-serif" font-size="11">• i3(∞) = (36 - 24)/6 = 2 A</text>
  <text x="566" y="308" fill="#94a3b8" font-family="sans-serif" font-size="11">• Rth = 6 || 12 = 4 Ω, τ = 1 s</text>
</svg>`;

export const SHEET_ACT4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 310" width="820" height="310">
  <rect width="820" height="310" rx="12" fill="#0f172a"/>
  <text x="410" y="26" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">Act 4: 一阶 RL 阶跃响应原理图与感性反电动势 vL(0+) = -12V 突变波形</text>

  <!-- Left: RL Circuit -->
  <rect x="20" y="44" width="380" height="248" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="210" y="66" text-anchor="middle" fill="#a78bfa" font-family="sans-serif" font-size="13" font-weight="bold">Sadiku 7.6 RL 开关电路（t = 0 断开 S）</text>

  <!-- Voltage source Vs=24V -->
  <circle cx="66" cy="170" r="15" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="66" y="167" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">+</text>
  <text x="66" y="179" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">-</text>
  <text x="38" y="174" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11">24V</text>

  <!-- Top wire with R1=4 Ohm and R2=4 Ohm -->
  <polyline points="66,155 66,118 96,118 101,111 108,125 115,111 122,125 129,111 134,118 175,118 180,111 187,125 194,111 201,125 208,111 213,118 338,118" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <text x="115" y="105" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">R1=4Ω</text>
  <text x="194" y="142" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">R2=4Ω</text>

  <!-- Switch S across R2 -->
  <polyline points="164,118 164,86 180,86" stroke="#fbbf24" stroke-width="2" fill="none"/>
  <line x1="180" y1="86" x2="210" y2="74" stroke="#fbbf24" stroke-width="2.5"/>
  <polyline points="212,86 226,86 226,118" stroke="#fbbf24" stroke-width="2" fill="none"/>
  <circle cx="180" cy="86" r="3" fill="#fbbf24"/>
  <circle cx="212" cy="86" r="3" fill="#fbbf24"/>
  <text x="196" y="70" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="10">S (t=0 断开)</text>

  <!-- R3=8 Ohm vertical -->
  <polyline points="266,118 266,142 259,147 273,154 259,161 273,168 259,175 266,180 266,222" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <text x="236" y="168" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">R3=8Ω</text>

  <!-- Inductor L=2H vertical (4 coils) -->
  <line x1="338" y1="118" x2="338" y2="140" stroke="#e2e8f0" stroke-width="2"/>
  <path d="M 338 140 A 8 8 0 0 1 338 156 A 8 8 0 0 1 338 172 A 8 8 0 0 1 338 188 A 8 8 0 0 1 338 204" fill="none" stroke="#38bdf8" stroke-width="2.8"/>
  <line x1="338" y1="204" x2="338" y2="222" stroke="#e2e8f0" stroke-width="2"/>
  <text x="370" y="175" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">L=2H</text>
  <text x="316" y="138" fill="#fb7185" font-family="sans-serif" font-size="11">+ vL</text>
  <text x="316" y="210" fill="#fb7185" font-family="sans-serif" font-size="11">-</text>
  <!-- Current arrow iL -->
  <line x1="354" y1="126" x2="354" y2="146" stroke="#38bdf8" stroke-width="2"/>
  <polygon points="354,148 350,140 358,140" fill="#38bdf8"/>
  <text x="372" y="140" fill="#38bdf8" font-family="sans-serif" font-size="11">iL</text>

  <!-- Bottom wire & ground -->
  <polyline points="66,185 66,222 338,222" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <line x1="200" y1="222" x2="200" y2="236" stroke="#94a3b8" stroke-width="2"/>
  <line x1="188" y1="236" x2="212" y2="236" stroke="#94a3b8" stroke-width="2"/>
  <line x1="192" y1="242" x2="208" y2="242" stroke="#94a3b8" stroke-width="2"/>

  <text x="210" y="274" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">Rth = (4+4) || 8 = 4 Ω,  τ = L / Rth = 0.5 s</text>

  <!-- Right: Dual Waveform Plot -->
  <rect x="418" y="44" width="382" height="248" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="609" y="66" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">iL(t) 连续衰减 vs. vL(t) 反向尖峰突变</text>

  <!-- Upper subplot: iL(t) -->
  <line x1="468" y1="158" x2="778" y2="158" stroke="#64748b" stroke-width="1.2"/>
  <line x1="518" y1="78" x2="518" y2="164" stroke="#64748b" stroke-width="1.2"/>
  <text x="462" y="96" text-anchor="end" fill="#38bdf8" font-family="sans-serif" font-size="10">6 A</text>
  <text x="462" y="128" text-anchor="end" fill="#34d399" font-family="sans-serif" font-size="10">3 A</text>
  <text x="462" y="160" text-anchor="end" fill="#94a3b8" font-family="sans-serif" font-size="10">0</text>
  <!-- Steady line 3A -->
  <line x1="518" y1="125" x2="770" y2="125" stroke="#34d399" stroke-width="1.2" stroke-dasharray="4,3"/>
  <!-- iL(t): t<0 is 6A (y=92), t>=0 decays from 92 to 125 -->
  <line x1="472" y1="92" x2="518" y2="92" stroke="#38bdf8" stroke-width="2.8"/>
  <path d="M 518 92 Q 565 114 618 121 T 765 124.8" fill="none" stroke="#38bdf8" stroke-width="2.8"/>
  <circle cx="518" cy="92" r="4" fill="#38bdf8"/>
  <text x="650" y="96" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">iL(t) = 3 + 3e^-2t A（连续）</text>

  <!-- Lower subplot: vL(t) -->
  <line x1="468" y1="198" x2="778" y2="198" stroke="#64748b" stroke-width="1.2"/>
  <line x1="518" y1="184" x2="518" y2="274" stroke="#64748b" stroke-width="1.2"/>
  <text x="462" y="201" text-anchor="end" fill="#94a3b8" font-family="sans-serif" font-size="10">0 V</text>
  <text x="462" y="264" text-anchor="end" fill="#fb7185" font-family="sans-serif" font-size="10">-12 V</text>
  <!-- vL(t): t<0 is 0V (y=198), jumps to -12V (y=262) at t=0+, decays back to 198 -->
  <line x1="472" y1="198" x2="518" y2="198" stroke="#f43f5e" stroke-width="2.5"/>
  <line x1="518" y1="198" x2="518" y2="262" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,2"/>
  <path d="M 518 262 Q 565 218 618 205 T 765 198.4" fill="none" stroke="#f43f5e" stroke-width="2.8"/>
  <circle cx="518" cy="198" r="3.5" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <circle cx="518" cy="262" r="4" fill="#f43f5e"/>
  <text x="530" y="266" fill="#fda4af" font-family="sans-serif" font-size="11" font-weight="bold">vL(0+) = -12 V（反电动势突变!）</text>
  <text x="765" y="213" text-anchor="end" fill="#94a3b8" font-family="sans-serif" font-size="10">t (s)</text>
</svg>`;

export const SHEET_ACT5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 330" width="820" height="330">
  <rect width="820" height="330" rx="12" fill="#0f172a"/>
  <text x="410" y="26" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">Act 5: 示波器探头地线夹共地防短路警示图（红线短路路径 vs. 正确 CH1-CH2 差分）</text>

  <!-- LEFT PANEL: HAZARD WRONG CONNECTION -->
  <rect x="18" y="44" width="386" height="270" rx="8" fill="#2a1215" stroke="#ef4444" stroke-width="2"/>
  <text x="211" y="66" text-anchor="middle" fill="#fca5a5" font-family="sans-serif" font-size="13" font-weight="bold">❌ 致命错误：黑色地线夹跨接悬浮电阻 R</text>

  <!-- Circuit inside Left Panel -->
  <circle cx="64" cy="150" r="14" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="64" y="147" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">+</text>
  <text x="64" y="159" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">-</text>
  <text x="40" y="154" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11">5V</text>

  <polyline points="64,136 64,104 115,104 120,97 127,111 134,97 141,111 148,97 153,104 206,104 206,142" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <text x="134" y="91" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">R = 10kΩ</text>
  <line x1="192" y1="142" x2="220" y2="142" stroke="#38bdf8" stroke-width="3"/>
  <line x1="192" y1="152" x2="220" y2="152" stroke="#38bdf8" stroke-width="3"/>
  <text x="234" y="150" fill="#38bdf8" font-family="sans-serif" font-size="11">C</text>
  <polyline points="206,152 206,196 64,196 64,164" stroke="#e2e8f0" stroke-width="2" fill="none"/>

  <!-- PSU Ground symbol connected to PE -->
  <line x1="110" y1="196" x2="110" y2="216" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="98" y1="216" x2="122" y2="216" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="102" y1="221" x2="118" y2="221" stroke="#ef4444" stroke-width="2"/>
  <text x="110" y="236" text-anchor="middle" fill="#fca5a5" font-family="sans-serif" font-size="10">电源地 (PE)</text>

  <!-- Scope Box Left -->
  <rect x="275" y="96" width="110" height="72" rx="6" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="330" y="116" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="bold">台式示波器</text>
  <text x="330" y="134" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="10">CH1 探头</text>
  <text x="330" y="152" text-anchor="middle" fill="#fca5a5" font-family="sans-serif" font-size="10">BNC外壳接 PE</text>

  <!-- Wrong probe red hook to left of R -->
  <polyline points="275,112 246,112 246,78 90,78 90,104" stroke="#fbbf24" stroke-width="2" fill="none"/>
  <circle cx="90" cy="104" r="3.5" fill="#fbbf24"/>

  <!-- Wrong black alligator clip to node between R and C -->
  <polyline points="275,134 252,134 252,104 206,104" stroke="#ef4444" stroke-width="3" fill="none"/>
  <circle cx="206" cy="104" r="5" fill="#ef4444"/>
  <text x="234" y="96" fill="#fca5a5" font-family="sans-serif" font-size="10" font-weight="bold">黑夹夹此!</text>

  <!-- RED SHORT CIRCUIT PATH through PE Earth -->
  <polyline points="330,168 330,256 110,256 110,240" stroke="#ef4444" stroke-width="3.5" stroke-dasharray="6,3" fill="none"/>
  <polygon points="110,240 105,249 115,249" fill="#ef4444"/>
  <rect x="140" y="244" width="166" height="22" rx="4" fill="#7f1d1d" stroke="#ef4444" stroke-width="1"/>
  <text x="223" y="259" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold">市电 PE 大地隐蔽短路回路!</text>
  <text x="211" y="296" text-anchor="middle" fill="#fecaca" font-family="sans-serif" font-size="11">后果：电容 C 被直接短接，节点拉死至 0V，过流烧毁!</text>

  <!-- RIGHT PANEL: SAFE CH1 - CH2 DIFFERENTIAL CONNECTION -->
  <rect x="416" y="44" width="386" height="270" rx="8" fill="#0d261f" stroke="#10b981" stroke-width="2"/>
  <text x="609" y="66" text-anchor="middle" fill="#6ee7b7" font-family="sans-serif" font-size="13" font-weight="bold">✅ 正确接法：黑夹统一接 GND + MATH (CH1 - CH2)</text>

  <!-- Circuit inside Right Panel -->
  <circle cx="462" cy="150" r="14" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="462" y="147" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">+</text>
  <text x="462" y="159" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">-</text>
  <text x="438" y="154" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11">5V</text>

  <polyline points="462,136 462,104 513,104 518,97 525,111 532,97 539,111 546,97 551,104 604,104 604,142" stroke="#e2e8f0" stroke-width="2" fill="none"/>
  <text x="532" y="91" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">R = 10kΩ</text>
  <line x1="590" y1="142" x2="618" y2="142" stroke="#38bdf8" stroke-width="3"/>
  <line x1="590" y1="152" x2="618" y2="152" stroke="#38bdf8" stroke-width="3"/>
  <text x="632" y="150" fill="#38bdf8" font-family="sans-serif" font-size="11">C</text>
  <polyline points="604,152 604,196 462,196 462,164" stroke="#38bdf8" stroke-width="2.5" fill="none"/>
  <text x="534" y="213" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="10" font-weight="bold">面包板蓝色公共 GND 轨</text>

  <!-- Scope Box Right -->
  <rect x="673" y="92" width="114" height="92" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="730" y="112" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="bold">台式示波器</text>
  <text x="730" y="130" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="10">CH1: 测 vA (5V)</text>
  <text x="730" y="146" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="10">CH2: 测 vC(t)</text>
  <rect x="683" y="154" width="94" height="22" rx="4" fill="#065f46"/>
  <text x="730" y="169" text-anchor="middle" fill="#a7f3d0" font-family="sans-serif" font-size="10" font-weight="bold">MATH: CH1-CH2</text>

  <!-- CH1 probe to left of R -->
  <polyline points="673,112 642,112 642,78 488,78 488,104" stroke="#fbbf24" stroke-width="2" fill="none"/>
  <circle cx="488" cy="104" r="3.5" fill="#fbbf24"/>
  <text x="488" y="96" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="10">CH1</text>

  <!-- CH2 probe to node between R and C -->
  <polyline points="673,132 648,132 648,104 604,104" stroke="#38bdf8" stroke-width="2" fill="none"/>
  <circle cx="604" cy="104" r="3.5" fill="#38bdf8"/>
  <text x="626" y="97" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="10">CH2</text>

  <!-- Common black alligator clip safely on blue GND rail -->
  <polyline points="673,170 652,170 652,196 604,196" stroke="#10b981" stroke-width="2.5" fill="none"/>
  <circle cx="604" cy="196" r="4.5" fill="#10b981"/>
  <text x="646" y="213" text-anchor="middle" fill="#6ee7b7" font-family="sans-serif" font-size="10" font-weight="bold">双黑夹同接 GND</text>

  <text x="609" y="256" text-anchor="middle" fill="#a7f3d0" font-family="sans-serif" font-size="11">vR(t) = vA(t) - vC(t) = CH1 - CH2</text>
  <text x="609" y="276" text-anchor="middle" fill="#d1fae5" font-family="sans-serif" font-size="11">无任何接地环路短路风险，安全测得真实充放电波形!</text>
</svg>`;

export const SHEET_ACT6 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 180" width="820" height="180">
  <rect width="820" height="180" rx="12" fill="#0f172a"/>
  <text x="410" y="26" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold">Act 6: 一阶电路三要素通解 5 步标准解题流</text>

  <!-- Step 1 -->
  <rect x="18" y="48" width="142" height="108" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="89" y="70" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Step 1: 求 0- 稳态</text>
  <text x="89" y="94" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">C 开路 / L 短路</text>
  <text x="89" y="114" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">算出状态变量初值</text>
  <text x="89" y="136" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">vC(0-) 或 iL(0-)</text>

  <polygon points="165,102 175,97 175,107" fill="#94a3b8"/>

  <!-- Step 2 -->
  <rect x="178" y="48" width="142" height="108" rx="8" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="249" y="70" text-anchor="middle" fill="#a78bfa" font-family="sans-serif" font-size="12" font-weight="bold">Step 2: 戴维南与 τ</text>
  <text x="249" y="94" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">t &gt; 0 独立源置零</text>
  <text x="249" y="114" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">求端口电阻 Rth</text>
  <text x="249" y="136" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">τ = Rth C 或 L/Rth</text>

  <polygon points="325,102 335,97 335,107" fill="#94a3b8"/>

  <!-- Step 3 -->
  <rect x="338" y="48" width="142" height="108" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
  <text x="409" y="70" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">Step 3: 求 ∞ 稳态</text>
  <text x="409" y="94" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">t = ∞ 再次直流稳态</text>
  <text x="409" y="114" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">C 开路 / L 短路</text>
  <text x="409" y="136" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">得 vC(∞) 与 x(∞)</text>

  <polygon points="485,102 495,97 495,107" fill="#94a3b8"/>

  <!-- Step 4 -->
  <rect x="498" y="48" width="142" height="108" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="569" y="70" text-anchor="middle" fill="#fb7185" font-family="sans-serif" font-size="12" font-weight="bold">Step 4: 0+ 现算!</text>
  <text x="569" y="94" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">状态变量连续保值</text>
  <text x="569" y="114" text-anchor="middle" fill="#fda4af" font-family="sans-serif" font-size="11">非状态变量必须</text>
  <text x="569" y="136" text-anchor="middle" fill="#fb7185" font-family="sans-serif" font-size="11" font-weight="bold">在 0+ 等效图现算!</text>

  <polygon points="645,102 655,97 655,107" fill="#94a3b8"/>

  <!-- Step 5 -->
  <rect x="658" y="48" width="144" height="108" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="730" y="70" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">Step 5: 代入通解</text>
  <text x="730" y="94" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">x(∞)+[x(0+)-x(∞)]</text>
  <text x="730" y="114" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11">× e^(-t/τ)</text>
  <text x="730" y="136" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">KCL / 微分交叉验算</text>
</svg>`;

export const SHEET_MINI1 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='20' text-anchor='middle' fill='#38bdf8' font-size='11' font-family='sans-serif'>t = 0- (A 侧直流稳态，C 开路)</text><text x='32' y='66' fill='#34d399' font-size='11' font-family='sans-serif'>18V</text><line x1='56' y1='62' x2='90' y2='62' stroke='#e2e8f0' stroke-width='2'/><rect x='90' y='54' width='36' height='16' fill='#1e293b' stroke='#e2e8f0'/><text x='108' y='66' text-anchor='middle' fill='#e2e8f0' font-size='10' font-family='sans-serif'>3Ω</text><line x1='126' y1='62' x2='170' y2='62' stroke='#e2e8f0' stroke-width='2'/><rect x='158' y='70' width='24' height='26' fill='#1e293b' stroke='#e2e8f0'/><text x='170' y='87' text-anchor='middle' fill='#e2e8f0' font-size='10' font-family='sans-serif'>6Ω</text><text x='220' y='66' text-anchor='middle' fill='#fbbf24' font-size='11' font-family='sans-serif'>vC(0-)=?</text></svg>`;

export const SHEET_MINI2 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='20' text-anchor='middle' fill='#a78bfa' font-size='11' font-family='sans-serif'>t &gt; 0 独立源置零求 Rth</text><text x='46' y='66' fill='#38bdf8' font-size='11' font-family='sans-serif'>C端口 →</text><rect x='98' y='44' width='48' height='22' fill='#1e293b' stroke='#e2e8f0'/><text x='122' y='59' text-anchor='middle' fill='#e2e8f0' font-size='10' font-family='sans-serif'>R4=12Ω</text><text x='160' y='59' text-anchor='middle' fill='#fbbf24' font-size='12' font-family='sans-serif'>||</text><rect x='172' y='44' width='48' height='22' fill='#1e293b' stroke='#e2e8f0'/><text x='196' y='59' text-anchor='middle' fill='#e2e8f0' font-size='10' font-family='sans-serif'>R3=6Ω</text><text x='130' y='92' text-anchor='middle' fill='#94a3b8' font-size='10' font-family='sans-serif'>τ = Rth × 0.25 F</text></svg>`;

export const SHEET_MINI3 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='20' text-anchor='middle' fill='#34d399' font-size='11' font-family='sans-serif'>t = ∞ (B 侧分压稳态)</text><text x='130' y='54' text-anchor='middle' fill='#e2e8f0' font-size='11' font-family='sans-serif'>vC(∞) = 36V × 12 / (6 + 12)</text><text x='130' y='84' text-anchor='middle' fill='#34d399' font-size='11' font-family='sans-serif'>vC(t) = vC(∞) + [vC(0+)-vC(∞)]e^(-t/τ)</text></svg>`;

export const SHEET_MINI4 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#2a1215'/><text x='130' y='20' text-anchor='middle' fill='#fb7185' font-size='11' font-family='sans-serif'>t = 0+ 等效电路（C 换 12V 恒压源）</text><text x='42' y='64' fill='#38bdf8' font-size='11' font-family='sans-serif'>12V</text><rect x='84' y='52' width='56' height='18' fill='#1e293b' stroke='#fb7185'/><text x='112' y='65' text-anchor='middle' fill='#e2e8f0' font-size='10' font-family='sans-serif'>R3=6Ω</text><text x='166' y='64' fill='#fbbf24' font-size='11' font-family='sans-serif'>← i3(0+)</text><text x='224' y='64' fill='#f59e0b' font-size='11' font-family='sans-serif'>36V</text><text x='130' y='94' text-anchor='middle' fill='#fda4af' font-size='10' font-family='sans-serif'>电阻电流不连续，严禁照搬 i3(0-)!</text></svg>`;

export const SHEET_MINI5 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0d261f'/><text x='130' y='22' text-anchor='middle' fill='#34d399' font-size='11' font-family='sans-serif'>三要素法 vs. 欧姆定律交叉验算</text><text x='130' y='52' text-anchor='middle' fill='#e2e8f0' font-size='11' font-family='sans-serif'>三要素：2 + (4 - 2)e^(-t) = 2 + 2e^(-t) A</text><text x='130' y='80' text-anchor='middle' fill='#a7f3d0' font-size='11' font-family='sans-serif'>欧姆法：[36 - (24 - 12e^-t)]/6 = 2 + 2e^(-t) A</text></svg>`;
