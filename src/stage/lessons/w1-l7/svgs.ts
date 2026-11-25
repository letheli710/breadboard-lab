// W1-L7 act diagrams: the lesson sheet's inline SVGs (docs/lessons/W1-L7.md) with their geometry and
// labels, recoloured from the sheet's dark panel to the stage's light theme; label fixes are listed
// in index.ts.

export const SVG_ACT1 = `<svg viewBox="0 0 420 190" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="190" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <!-- Title -->
  <text x="20" y="24" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">图 1-1：一节 9V 电池的两大核心分配任务</text>
  <!-- Left Box: Voltage Division -->
  <rect x="20" y="38" width="180" height="136" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="110" y="56" fill="#0284c7" font-family="sans-serif" font-size="11" text-anchor="middle" font-weight="bold">任务 A：串联切电压</text>
  <!-- Source -->
  <circle cx="52" cy="112" r="14" fill="none" stroke="#dc2626" stroke-width="1.8"/>
  <text x="52" y="108" fill="#dc2626" font-family="sans-serif" font-size="10" text-anchor="middle">+</text>
  <text x="52" y="121" fill="#64748b" font-family="sans-serif" font-size="10" text-anchor="middle">−</text>
  <text x="52" y="140" fill="#dc2626" font-family="sans-serif" font-size="10" text-anchor="middle">9 V</text>
  <!-- Wires & R1 R2 -->
  <polyline points="52,98 52,74 132,74 132,82" fill="none" stroke="#334155" stroke-width="1.6"/>
  <polyline points="132,82 126,86 138,92 126,98 138,104 132,108" fill="none" stroke="#0284c7" stroke-width="1.8"/>
  <text x="155" y="98" fill="#334155" font-family="sans-serif" font-size="10">R1</text>
  <line x1="132" y1="108" x2="132" y2="120" stroke="#b45309" stroke-width="1.8"/>
  <circle cx="132" cy="114" r="3" fill="#b45309"/>
  <text x="166" y="117" fill="#b45309" font-family="sans-serif" font-size="10" font-weight="bold">6 V?</text>
  <polyline points="132,120 126,124 138,130 126,136 138,142 132,146" fill="none" stroke="#0284c7" stroke-width="1.8"/>
  <text x="155" y="138" fill="#334155" font-family="sans-serif" font-size="10">R2</text>
  <polyline points="132,146 132,158 52,158 52,126" fill="none" stroke="#334155" stroke-width="1.6"/>

  <!-- Right Box: Current Division -->
  <rect x="220" y="38" width="180" height="136" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="310" y="56" fill="#059669" font-family="sans-serif" font-size="11" text-anchor="middle" font-weight="bold">任务 B：并联切电流</text>
  <!-- Current Source / Input -->
  <circle cx="250" cy="112" r="14" fill="none" stroke="#059669" stroke-width="1.8"/>
  <line x1="250" y1="120" x2="250" y2="104" stroke="#059669" stroke-width="1.6"/>
  <polygon points="250,101 246,107 254,107" fill="#059669"/>
  <text x="250" y="140" fill="#059669" font-family="sans-serif" font-size="10" text-anchor="middle">i_总</text>
  <!-- Parallel Branches -->
  <polyline points="250,98 250,74 362,74 362,92" fill="none" stroke="#334155" stroke-width="1.6"/>
  <line x1="306" y1="74" x2="306" y2="92" stroke="#334155" stroke-width="1.6"/>
  <circle cx="306" cy="74" r="3" fill="#059669"/>
  <polyline points="306,92 300,96 312,102 300,108 312,114 306,118" fill="none" stroke="#0284c7" stroke-width="1.8"/>
  <text x="285" y="110" fill="#334155" font-family="sans-serif" font-size="10">R1</text>
  <polyline points="362,92 356,96 368,102 356,108 368,114 362,118" fill="none" stroke="#0284c7" stroke-width="1.8"/>
  <text x="374" y="110" fill="#334155" font-family="sans-serif" font-size="10">R2</text>
  <line x1="306" y1="118" x2="306" y2="158" stroke="#334155" stroke-width="1.6"/>
  <polyline points="362,118 362,158 250,158 250,126" fill="none" stroke="#334155" stroke-width="1.6"/>
  <text x="306" y="142" fill="#b45309" font-family="sans-serif" font-size="9" text-anchor="middle">i1?</text>
  <text x="362" y="142" fill="#b45309" font-family="sans-serif" font-size="9" text-anchor="middle">i2?</text>
</svg>`;

export const SVG_ACT2 = `<svg viewBox="0 0 420 210" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="210" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="20" y="24" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">图 2-1：串联分压回路（KVL: Vs = v1 + v2）</text>
  <!-- Main Loop -->
  <polyline points="75,85 75,52 150,52" fill="none" stroke="#dc2626" stroke-width="2.2"/>
  <!-- Current arrow on top wire -->
  <polygon points="122,52 112,47 112,57" fill="#059669"/>
  <text x="78" y="42" fill="#059669" font-family="sans-serif" font-size="11" font-weight="bold">i = 1.5 mA</text>
  <!-- Voltage Source Vs -->
  <circle cx="75" cy="112" r="24" fill="#ffffff" stroke="#dc2626" stroke-width="2.2"/>
  <text x="75" y="105" fill="#dc2626" font-family="sans-serif" font-size="13" text-anchor="middle" font-weight="bold">+</text>
  <text x="75" y="128" fill="#64748b" font-family="sans-serif" font-size="14" text-anchor="middle">−</text>
  <text x="47" y="116" fill="#dc2626" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end">9 V</text>
  <!-- R1 horizontal -->
  <polyline points="150,52 158,42 168,62 178,42 188,62 198,42 208,62 216,52" fill="none" stroke="#0284c7" stroke-width="2.2"/>
  <text x="183" y="34" fill="#334155" font-family="sans-serif" font-size="11" text-anchor="middle">R1 = 2 kΩ</text>
  <text x="150" y="74" fill="#b45309" font-family="sans-serif" font-size="11">+</text>
  <text x="183" y="76" fill="#b45309" font-family="sans-serif" font-size="11" text-anchor="middle">v1 = 3.0 V</text>
  <text x="212" y="74" fill="#b45309" font-family="sans-serif" font-size="11">−</text>
  <!-- Wire to Mid Node -->
  <polyline points="216,52 295,52 295,82" fill="none" stroke="#b45309" stroke-width="2.2"/>
  <circle cx="295" cy="52" r="4.5" fill="#b45309"/>
  <text x="308" y="56" fill="#b45309" font-family="sans-serif" font-size="11" font-weight="bold">V_mid = 6.0 V</text>
  <!-- R2 vertical -->
  <polyline points="295,82 285,90 305,100 285,110 305,120 285,130 305,140 295,148" fill="none" stroke="#0284c7" stroke-width="2.2"/>
  <text x="315" y="110" fill="#334155" font-family="sans-serif" font-size="11">R2 = 4 kΩ</text>
  <text x="315" y="128" fill="#b45309" font-family="sans-serif" font-size="11" font-weight="bold">v2 = 6.0 V</text>
  <text x="272" y="92" fill="#b45309" font-family="sans-serif" font-size="12">+</text>
  <text x="272" y="148" fill="#b45309" font-family="sans-serif" font-size="12">−</text>
  <!-- Return wire GND -->
  <polyline points="295,148 295,176 75,176 75,136" fill="none" stroke="#2563eb" stroke-width="2.2"/>
  <!-- GND symbol -->
  <line x1="185" y1="176" x2="185" y2="188" stroke="#2563eb" stroke-width="2"/>
  <line x1="173" y1="188" x2="197" y2="188" stroke="#2563eb" stroke-width="2"/>
  <line x1="178" y1="194" x2="192" y2="194" stroke="#2563eb" stroke-width="1.6"/>
  <line x1="182" y1="199" x2="188" y2="199" stroke="#2563eb" stroke-width="1.4"/>
  <text x="206" y="193" fill="#2563eb" font-family="sans-serif" font-size="10">GND (0 V)</text>
</svg>`;

export const SVG_ACT3 = `<svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="220" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="20" y="24" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">图 3-1：并联分流网络（KCL: i = i1 + i2，分流看对方）</text>
  <!-- Source -->
  <circle cx="66" cy="116" r="22" fill="#ffffff" stroke="#dc2626" stroke-width="2.2"/>
  <text x="66" y="110" fill="#dc2626" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">+</text>
  <text x="66" y="130" fill="#64748b" font-family="sans-serif" font-size="13" text-anchor="middle">−</text>
  <text x="40" y="120" fill="#dc2626" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="end">9 V</text>
  <!-- Top rail -->
  <polyline points="66,94 66,54 320,54 320,86" fill="none" stroke="#dc2626" stroke-width="2.2"/>
  <!-- Total current arrow -->
  <polygon points="150,54 140,49 140,59" fill="#059669"/>
  <text x="145" y="44" fill="#059669" font-family="sans-serif" font-size="11" text-anchor="middle" font-weight="bold">i = 6.75 mA</text>
  <!-- Node A -->
  <circle cx="205" cy="54" r="4.5" fill="#b45309"/>
  <text x="212" y="44" fill="#b45309" font-family="sans-serif" font-size="10">Node A (+9 V)</text>
  <!-- Branch 1 (R1) -->
  <line x1="205" y1="54" x2="205" y2="86" stroke="#334155" stroke-width="2"/>
  <polygon points="205,78 200,69 210,69" fill="#0284c7"/>
  <text x="198" y="78" text-anchor="end" fill="#0284c7" font-family="sans-serif" font-size="10" font-weight="bold">i1 = 4.5 mA</text>
  <polyline points="205,86 196,93 214,102 196,111 214,120 196,129 214,138 205,145" fill="none" stroke="#0284c7" stroke-width="2.2"/>
  <text x="164" y="120" fill="#334155" font-family="sans-serif" font-size="11">R1=2 kΩ</text>
  <line x1="205" y1="145" x2="205" y2="180" stroke="#2563eb" stroke-width="2"/>
  <!-- Branch 2 (R2) -->
  <polygon points="320,78 315,69 325,69" fill="#7c3aed"/>
  <text x="330" y="78" fill="#7c3aed" font-family="sans-serif" font-size="10" font-weight="bold">i2 = 2.25 mA</text>
  <polyline points="320,86 311,93 329,102 311,111 329,120 311,129 329,138 320,145" fill="none" stroke="#7c3aed" stroke-width="2.2"/>
  <text x="336" y="120" fill="#334155" font-family="sans-serif" font-size="11">R2=4 kΩ</text>
  <line x1="320" y1="145" x2="320" y2="180" stroke="#2563eb" stroke-width="2"/>
  <!-- Bottom Rail -->
  <polyline points="320,180 66,180 66,138" fill="none" stroke="#2563eb" stroke-width="2.2"/>
  <circle cx="205" cy="180" r="4" fill="#2563eb"/>
  <text x="205" y="198" fill="#2563eb" font-family="sans-serif" font-size="10" text-anchor="middle">公共地 GND (0 V) — R1 与 R2 共用 9 V 电压</text>
</svg>`;

export const SVG_ACT4 = `<svg viewBox="0 0 420 210" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="210" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="20" y="24" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">图 4-1：带载分压器（RL 并联拉低 R2 等效阻值）</text>
  <!-- Vs -->
  <circle cx="62" cy="112" r="21" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
  <text x="62" y="107" fill="#dc2626" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">+</text>
  <text x="62" y="126" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">−</text>
  <text x="37" y="116" fill="#dc2626" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="end">9 V</text>
  <!-- Top wire & R1 -->
  <polyline points="62,91 62,54 115,54" fill="none" stroke="#dc2626" stroke-width="2"/>
  <polyline points="115,54 122,45 131,63 140,45 149,63 158,45 167,63 174,54" fill="none" stroke="#0284c7" stroke-width="2"/>
  <text x="145" y="38" fill="#334155" font-family="sans-serif" font-size="11" text-anchor="middle">R1 = 2 kΩ</text>
  <!-- Mid Node -->
  <line x1="174" y1="54" x2="320" y2="54" stroke="#b45309" stroke-width="2"/>
  <circle cx="225" cy="54" r="4.5" fill="#b45309"/>
  <text x="272" y="42" fill="#b45309" font-family="sans-serif" font-size="11" text-anchor="middle" font-weight="bold">v_out 跌至 4.50 V</text>
  <!-- Dashed box around R2 || RL -->
  <rect x="200" y="68" width="146" height="96" rx="6" fill="none" stroke="#d97706" stroke-width="1.3" stroke-dasharray="5,4"/>
  <text x="273" y="158" fill="#d97706" font-family="sans-serif" font-size="10" text-anchor="middle">R2 || RL = 2.0 kΩ</text>
  <!-- R2 -->
  <line x1="225" y1="54" x2="225" y2="82" stroke="#334155" stroke-width="1.8"/>
  <polyline points="225,82 217,88 233,96 217,104 233,112 217,120 233,128 225,134" fill="none" stroke="#0284c7" stroke-width="2"/>
  <text x="242" y="108" fill="#334155" font-family="sans-serif" font-size="10">R2</text>
  <text x="242" y="121" fill="#64748b" font-family="sans-serif" font-size="9">4 kΩ</text>
  <line x1="225" y1="134" x2="225" y2="178" stroke="#2563eb" stroke-width="1.8"/>
  <!-- RL -->
  <line x1="320" y1="54" x2="320" y2="82" stroke="#334155" stroke-width="1.8"/>
  <polyline points="320,82 312,88 328,96 312,104 328,112 312,120 328,128 320,134" fill="none" stroke="#db2777" stroke-width="2"/>
  <text x="355" y="108" fill="#db2777" font-family="sans-serif" font-size="10" font-weight="bold">RL</text>
  <text x="355" y="121" fill="#db2777" font-family="sans-serif" font-size="9">4 kΩ</text>
  <line x1="320" y1="134" x2="320" y2="178" stroke="#2563eb" stroke-width="1.8"/>
  <!-- Bottom Rail -->
  <polyline points="320,178 62,178 62,133" fill="none" stroke="#2563eb" stroke-width="2"/>
  <circle cx="225" cy="178" r="3.5" fill="#2563eb"/>
</svg>`;

export const SVG_ACT5 = `<svg viewBox="0 0 420 210" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="210" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="20" y="24" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">图 5-1：9V 面包板接线与 DMM 电压并联实测示意</text>
  <!-- Breadboard Body -->
  <rect x="20" y="38" width="245" height="154" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Power Rails -->
  <line x1="32" y1="54" x2="253" y2="54" stroke="#dc2626" stroke-width="2"/>
  <text x="25" y="57" fill="#dc2626" font-family="sans-serif" font-size="10" font-weight="bold">+</text>
  <line x1="32" y1="68" x2="253" y2="68" stroke="#2563eb" stroke-width="2"/>
  <text x="25" y="71" fill="#2563eb" font-family="sans-serif" font-size="10" font-weight="bold">−</text>
  <!-- Center Trench -->
  <rect x="30" y="138" width="225" height="10" rx="2" fill="#e2e8f0"/>
  <text x="84" y="146" fill="#475569" font-family="sans-serif" font-size="8" text-anchor="middle">中央绝缘凹槽 (e / f 分界)</text>
  <!-- Columns 5, 12, 19 -->
  <rect x="58" y="82" width="16" height="50" rx="3" fill="#cbd5e1"/>
  <text x="66" y="170" fill="#64748b" font-family="sans-serif" font-size="9" text-anchor="middle">Col 5</text>
  <rect x="134" y="82" width="16" height="50" rx="3" fill="#fef3c7" stroke="#b45309" stroke-width="1"/>
  <text x="142" y="170" fill="#b45309" font-family="sans-serif" font-size="9" text-anchor="middle">Col 12</text>
  <rect x="210" y="82" width="16" height="50" rx="3" fill="#dbeafe" stroke="#2563eb" stroke-width="1"/>
  <text x="218" y="170" fill="#2563eb" font-family="sans-serif" font-size="9" text-anchor="middle">Col 19</text>
  <!-- Jumpers J1, J2 -->
  <line x1="66" y1="54" x2="66" y2="90" stroke="#dc2626" stroke-width="2.5"/>
  <circle cx="66" cy="90" r="3" fill="#dc2626"/>
  <line x1="218" y1="68" x2="218" y2="90" stroke="#2563eb" stroke-width="2.5"/>
  <circle cx="218" cy="90" r="3" fill="#2563eb"/>
  <!-- R1 (e5 to e12) -->
  <line x1="66" y1="122" x2="86" y2="122" stroke="#64748b" stroke-width="2"/>
  <rect x="86" y="114" width="36" height="16" rx="4" fill="#d6b48c" stroke="#92400e" stroke-width="1"/>
  <rect x="92" y="114" width="4" height="16" fill="#dc2626"/>
  <rect x="100" y="114" width="4" height="16" fill="#151515"/>
  <rect x="108" y="114" width="4" height="16" fill="#dc2626"/>
  <line x1="122" y1="122" x2="142" y2="122" stroke="#64748b" stroke-width="2"/>
  <text x="104" y="109" fill="#334155" font-family="sans-serif" font-size="9" text-anchor="middle">R1=2kΩ</text>
  <!-- R2 (d12 to d19) -->
  <line x1="142" y1="110" x2="162" y2="110" stroke="#64748b" stroke-width="2"/>
  <rect x="162" y="102" width="36" height="16" rx="4" fill="#d6b48c" stroke="#92400e" stroke-width="1"/>
  <rect x="168" y="102" width="4" height="16" fill="#eab308"/>
  <rect x="176" y="102" width="4" height="16" fill="#151515"/>
  <rect x="184" y="102" width="4" height="16" fill="#dc2626"/>
  <line x1="198" y1="110" x2="218" y2="110" stroke="#64748b" stroke-width="2"/>
  <text x="180" y="97" fill="#334155" font-family="sans-serif" font-size="9" text-anchor="middle">R2=4kΩ</text>

  <!-- DMM Unit -->
  <rect x="282" y="42" width="120" height="146" rx="8" fill="#ffffff" stroke="#b45309" stroke-width="1.6"/>
  <text x="342" y="58" fill="#b45309" font-family="sans-serif" font-size="10" text-anchor="middle" font-weight="bold">数字万用表 (DC V)</text>
  <rect x="294" y="66" width="96" height="36" rx="4" fill="#ecfdf5" stroke="#10b981" stroke-width="1.2"/>
  <text x="342" y="90" fill="#059669" font-family="monospace" font-size="18" text-anchor="middle" font-weight="bold">6.00 V</text>
  <text x="342" y="118" fill="#64748b" font-family="sans-serif" font-size="9" text-anchor="middle">P_R2 = 9.0 mW</text>
  <rect x="296" y="126" width="92" height="18" rx="4" fill="#d1fae5"/>
  <text x="342" y="138" fill="#047857" font-family="sans-serif" font-size="9" text-anchor="middle">✓ 安全 (&lt; 250 mW)</text>
  <!-- Probe Wires to b12 and b19 -->
  <path d="M 315 168 C 315 184, 142 195, 142 96" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4,2"/>
  <circle cx="142" cy="96" r="3" fill="#dc2626"/>
  <path d="M 368 168 C 368 196, 218 198, 218 96" fill="none" stroke="#64748b" stroke-width="1.8" stroke-dasharray="4,2"/>
  <circle cx="218" cy="96" r="3" fill="#64748b"/>
  <text x="315" y="162" fill="#dc2626" font-family="sans-serif" font-size="9" text-anchor="middle">红(b12)</text>
  <text x="368" y="162" fill="#64748b" font-family="sans-serif" font-size="9" text-anchor="middle">黑(b19)</text>
</svg>`;

export const SVG_ACT6 = `<svg viewBox="0 0 420 210" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="210" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="20" y="24" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">图 6-1：混联综合例题（求 R_eq、总电流 i 与支路电流 i_o）</text>
  <!-- Source -->
  <circle cx="58" cy="116" r="21" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
  <text x="58" y="111" fill="#dc2626" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">+</text>
  <text x="58" y="130" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">−</text>
  <text x="33" y="120" fill="#dc2626" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="end">9 V</text>
  <!-- Top wire + i arrow -->
  <polyline points="58,95 58,56 112,56" fill="none" stroke="#dc2626" stroke-width="2"/>
  <polygon points="94,56 85,51 85,61" fill="#059669"/>
  <text x="86" y="45" fill="#059669" font-family="sans-serif" font-size="11" font-weight="bold">i</text>
  <!-- R1 -->
  <polyline points="112,56 119,47 128,65 137,47 146,65 155,47 164,65 171,56" fill="none" stroke="#0284c7" stroke-width="2"/>
  <text x="142" y="39" fill="#334155" font-family="sans-serif" font-size="11" text-anchor="middle">R1 = 1 kΩ</text>
  <!-- Node A to Parallel -->
  <line x1="171" y1="56" x2="335" y2="56" stroke="#b45309" stroke-width="2"/>
  <circle cx="235" cy="56" r="4.5" fill="#b45309"/>
  <text x="235" y="44" fill="#b45309" font-family="sans-serif" font-size="10" text-anchor="middle">Node A</text>
  <!-- R2 branch -->
  <line x1="235" y1="56" x2="235" y2="86" stroke="#334155" stroke-width="1.8"/>
  <polyline points="235,86 227,93 243,101 227,109 243,117 227,125 243,133 235,140" fill="none" stroke="#7c3aed" stroke-width="2"/>
  <text x="200" y="116" fill="#334155" font-family="sans-serif" font-size="11" text-anchor="middle">R2=6 kΩ</text>
  <line x1="235" y1="140" x2="235" y2="178" stroke="#2563eb" stroke-width="1.8"/>
  <!-- R3 branch (target i_o) -->
  <line x1="335" y1="56" x2="335" y2="86" stroke="#334155" stroke-width="1.8"/>
  <polygon points="335,78 330,69 340,69" fill="#b45309"/>
  <text x="358" y="77" fill="#b45309" font-family="sans-serif" font-size="11" font-weight="bold">i_o = ?</text>
  <polyline points="335,86 327,93 343,101 327,109 343,117 327,125 343,133 335,140" fill="none" stroke="#059669" stroke-width="2.2"/>
  <text x="372" y="116" fill="#059669" font-family="sans-serif" font-size="11" text-anchor="middle">R3=3 kΩ</text>
  <line x1="335" y1="140" x2="335" y2="178" stroke="#2563eb" stroke-width="1.8"/>
  <!-- Bottom Rail -->
  <polyline points="335,178 58,178 58,137" fill="none" stroke="#2563eb" stroke-width="2"/>
  <circle cx="235" cy="178" r="3.5" fill="#2563eb"/>
</svg>`;

export const SVG_ACT7 = `<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="200" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="20" y="24" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">图 7-1：三支路并联分流防坑图（正确式：i1 = (R_eq / R1) · i）</text>
  <!-- Input Current -->
  <line x1="28" y1="54" x2="340" y2="54" stroke="#dc2626" stroke-width="2"/>
  <polygon points="82,54 72,49 72,59" fill="#059669"/>
  <text x="68" y="42" fill="#059669" font-family="sans-serif" font-size="11" text-anchor="middle" font-weight="bold">i = 11 mA</text>
  <!-- Branch 1 -->
  <circle cx="130" cy="54" r="3.5" fill="#b45309"/>
  <line x1="130" y1="54" x2="130" y2="80" stroke="#334155" stroke-width="1.8"/>
  <polyline points="130,80 123,86 137,93 123,100 137,107 123,114 137,121 130,127" fill="none" stroke="#0284c7" stroke-width="2"/>
  <text x="100" y="106" fill="#0284c7" font-family="sans-serif" font-size="10" text-anchor="middle">R1=2k</text>
  <text x="138" y="150" fill="#0284c7" font-family="sans-serif" font-size="10" font-weight="bold">i1=5.5mA</text>
  <line x1="130" y1="127" x2="130" y2="162" stroke="#2563eb" stroke-width="1.8"/>
  <!-- Dashed box for R2 || R3 -->
  <rect x="200" y="66" width="175" height="90" rx="6" fill="none" stroke="#7c3aed" stroke-width="1.4" stroke-dasharray="4,3"/>
  <text x="288" y="150" fill="#7c3aed" font-family="sans-serif" font-size="10" text-anchor="middle" stroke="#f8fafc" stroke-width="4" paint-order="stroke">对方是 R2 || R3 = 2kΩ（非相加！）</text>
  <!-- Branch 2 -->
  <circle cx="240" cy="54" r="3.5" fill="#b45309"/>
  <line x1="240" y1="54" x2="240" y2="80" stroke="#334155" stroke-width="1.8"/>
  <polyline points="240,80 233,86 247,93 233,100 247,107 233,114 247,121 240,127" fill="none" stroke="#7c3aed" stroke-width="2"/>
  <text x="252" y="108" fill="#334155" font-family="sans-serif" font-size="9">R2=3kΩ</text>
  <line x1="240" y1="127" x2="240" y2="162" stroke="#2563eb" stroke-width="1.8"/>
  <!-- Branch 3 -->
  <line x1="340" y1="54" x2="340" y2="80" stroke="#334155" stroke-width="1.8"/>
  <polyline points="340,80 333,86 347,93 333,100 347,107 333,114 347,121 340,127" fill="none" stroke="#7c3aed" stroke-width="2"/>
  <text x="352" y="108" fill="#334155" font-family="sans-serif" font-size="9">R3=6kΩ</text>
  <line x1="340" y1="127" x2="340" y2="162" stroke="#2563eb" stroke-width="1.8"/>
  <!-- Bottom Rail -->
  <line x1="28" y1="162" x2="340" y2="162" stroke="#2563eb" stroke-width="2"/>
  <text x="210" y="184" fill="#dc2626" font-family="sans-serif" font-size="10" text-anchor="middle">✗ 严禁写作 (R2+R3)/(R1+R2+R3) · i</text>
</svg>`;

export const SVG_ACT8 = `<svg viewBox="0 0 420 190" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="190" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="20" y="24" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">图 8-1：W1-L8 悬念预告 — 串并联化简失效的惠斯通电桥</text>
  <!-- Top & Bottom Terminals -->
  <line x1="210" y1="36" x2="210" y2="50" stroke="#dc2626" stroke-width="2"/>
  <circle cx="210" cy="50" r="4" fill="#dc2626"/>
  <line x1="210" y1="158" x2="210" y2="174" stroke="#2563eb" stroke-width="2"/>
  <circle cx="210" cy="158" r="4" fill="#2563eb"/>
  <!-- Diamond Bridge Edges -->
  <line x1="210" y1="50" x2="120" y2="104" stroke="#0284c7" stroke-width="2.2"/>
  <line x1="210" y1="50" x2="300" y2="104" stroke="#0284c7" stroke-width="2.2"/>
  <line x1="120" y1="104" x2="210" y2="158" stroke="#7c3aed" stroke-width="2.2"/>
  <line x1="300" y1="104" x2="210" y2="158" stroke="#7c3aed" stroke-width="2.2"/>
  <!-- Center Bridge Resistor R5 -->
  <line x1="120" y1="104" x2="176" y2="104" stroke="#b45309" stroke-width="2.2"/>
  <polyline points="176,104 182,96 190,112 198,96 206,112 214,96 222,112 230,96 238,112 244,104" fill="none" stroke="#b45309" stroke-width="2.2"/>
  <line x1="244" y1="104" x2="300" y2="104" stroke="#b45309" stroke-width="2.2"/>
  <circle cx="120" cy="104" r="4" fill="#b45309"/>
  <circle cx="300" cy="104" r="4" fill="#b45309"/>
  <!-- Labels -->
  <text x="150" y="70" fill="#334155" font-family="sans-serif" font-size="11">R1</text>
  <text x="262" y="70" fill="#334155" font-family="sans-serif" font-size="11">R2</text>
  <text x="150" y="148" fill="#334155" font-family="sans-serif" font-size="11">R3</text>
  <text x="262" y="148" fill="#334155" font-family="sans-serif" font-size="11">R4</text>
  <text x="210" y="86" fill="#b45309" font-family="sans-serif" font-size="11" text-anchor="middle" font-weight="bold">R5（桥臂锁死！）</text>
  <text x="355" y="108" fill="#db2777" font-family="sans-serif" font-size="10" text-anchor="middle">→ W1-L8</text>
  <text x="355" y="122" fill="#db2777" font-family="sans-serif" font-size="10" text-anchor="middle">Y–Δ 解锁</text>
</svg>`;

export const MINI_STEP1 = `<svg viewBox="0 0 420 110" xmlns="http://www.w3.org/2000/svg"><rect width="420" height="110" rx="8" fill="#f8fafc" stroke="#e2e8f0"/><text x="16" y="22" fill="#64748b" font-size="11" font-family="sans-serif">Step 1 化简视角：先算 R2 || R3，再加 R1</text><line x1="30" y1="64" x2="85" y2="64" stroke="#334155" stroke-width="2"/><rect x="85" y="50" width="65" height="28" rx="4" fill="#ffffff" stroke="#0284c7" stroke-width="1.8"/><text x="117" y="68" fill="#0284c7" font-size="11" text-anchor="middle" font-family="sans-serif">R1=1kΩ</text><line x1="150" y1="64" x2="200" y2="64" stroke="#b45309" stroke-width="2"/><rect x="200" y="38" width="130" height="52" rx="6" fill="#ffffff" stroke="#7c3aed" stroke-width="1.8" stroke-dasharray="4,3"/><text x="265" y="60" fill="#7c3aed" font-size="11" text-anchor="middle" font-family="sans-serif">R2 || R3 = 6k || 3k</text><text x="265" y="78" fill="#b45309" font-size="11" text-anchor="middle" font-family="sans-serif">= ? kΩ</text><line x1="330" y1="64" x2="385" y2="64" stroke="#2563eb" stroke-width="2"/></svg>`;

export const MINI_STEP2 = `<svg viewBox="0 0 420 110" xmlns="http://www.w3.org/2000/svg"><rect width="420" height="110" rx="8" fill="#f8fafc" stroke="#e2e8f0"/><text x="16" y="22" fill="#64748b" font-size="11" font-family="sans-serif">Step 2 等效单回路：i = Vs / R_eq</text><circle cx="80" cy="64" r="18" fill="#ffffff" stroke="#dc2626" stroke-width="2"/><text x="80" y="68" fill="#dc2626" font-size="11" text-anchor="middle" font-family="sans-serif">9 V</text><line x1="98" y1="64" x2="210" y2="64" stroke="#059669" stroke-width="2"/><polygon points="165,64 155,59 155,69" fill="#059669"/><text x="158" y="52" fill="#059669" font-size="11" text-anchor="middle" font-family="sans-serif">i = ?</text><rect x="210" y="48" width="110" height="32" rx="5" fill="#ffffff" stroke="#0284c7" stroke-width="1.8"/><text x="265" y="68" fill="#0284c7" font-size="11" text-anchor="middle" font-family="sans-serif">R_eq = 3 kΩ</text><line x1="320" y1="64" x2="375" y2="64" stroke="#2563eb" stroke-width="2"/></svg>`;

export const MINI_STEP3 = `<svg viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg"><rect width="420" height="120" rx="8" fill="#f8fafc" stroke="#e2e8f0"/><text x="16" y="20" fill="#64748b" font-size="11" font-family="sans-serif">Step 3 节点分流：3 mA 在 6 kΩ 与 3 kΩ 之间如何分配？</text><line x1="35" y1="66" x2="130" y2="66" stroke="#059669" stroke-width="2.2"/><polygon points="100,66 90,61 90,71" fill="#059669"/><text x="75" y="54" fill="#059669" font-size="11" text-anchor="middle" font-family="sans-serif">i = 3 mA</text><circle cx="130" cy="66" r="4" fill="#b45309"/><polyline points="130,66 170,40 310,40" fill="none" stroke="#7c3aed" stroke-width="2"/><rect x="210" y="28" width="72" height="22" rx="4" fill="#ffffff" stroke="#7c3aed"/><text x="246" y="43" fill="#7c3aed" font-size="10" text-anchor="middle" font-family="sans-serif">R2 = 6 kΩ</text><polyline points="130,66 170,92 310,92" fill="none" stroke="#059669" stroke-width="2.2"/><rect x="210" y="80" width="72" height="22" rx="4" fill="#ffffff" stroke="#059669"/><text x="246" y="95" fill="#059669" font-size="10" text-anchor="middle" font-family="sans-serif">R3 = 3 kΩ</text><text x="348" y="96" fill="#b45309" font-size="11" font-weight="bold" font-family="sans-serif">i_o = ?</text></svg>`;
