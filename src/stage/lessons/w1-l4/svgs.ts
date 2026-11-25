// The act diagrams of the W1-L4 lesson sheet (docs/lessons/W1-L4.md), reproduced as given, and
// the step diagrams of its guided-example JSON (copied from the sheet by a script, not retyped).
// Layout fixes (text only, nothing moved in the circuits): act 4's "A≠A' ⇒ V3≠V4" moves below the bottom
// rail (it ran over R3 and R4); act 5's "Vs" label moves left off the source circle; "R1 (树枝1)" (act 3)
// and "+ 10V" (act 5) drop to font-size 8.5, act 2's "Breadboard Col 11 | …" header to 9, so they stay inside their boxes.

export const SVG_ACT1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 200" width="420" height="200">
  <rect width="420" height="200" rx="10" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">ACT 1 · 等电位导线合并：把“折线与多T字路口”缩成 1 个真实节点</text>

  <!-- Left Panel: Messy bent wires -->
  <rect x="14" y="36" width="186" height="150" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="26" y="54" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="11" font-weight="700">视觉假象：看似 4 个点？</text>
  <!-- Top equipotential messy rail (amber) -->
  <polyline points="36,100 36,74 96,74 96,86 140,86 140,74 176,74 176,100" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linejoin="round"/>
  <line x1="96" y1="86" x2="96" y2="104" stroke="#f59e0b" stroke-width="3"/>
  <!-- Fake corner circles -->
  <circle cx="36" cy="74" r="5" fill="none" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="2,2"/>
  <circle cx="96" cy="86" r="4" fill="#f59e0b"/>
  <circle cx="140" cy="74" r="5" fill="none" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="2,2"/>
  <circle cx="176" cy="74" r="4" fill="#f59e0b"/>
  <!-- 3 resistor blocks below -->
  <rect x="28" y="100" width="16" height="36" rx="2" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="36" y="122" fill="#e2e8f0" font-size="9" text-anchor="middle" font-family="monospace">R1</text>
  <rect x="88" y="104" width="16" height="32" rx="2" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="96" y="124" fill="#e2e8f0" font-size="9" text-anchor="middle" font-family="monospace">R2</text>
  <rect x="168" y="100" width="16" height="36" rx="2" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="176" y="122" fill="#e2e8f0" font-size="9" text-anchor="middle" font-family="monospace">R3</text>
  <!-- Bottom rail -->
  <polyline points="36,136 36,158 176,158 176,136" fill="none" stroke="#10b981" stroke-width="2.5"/>
  <line x1="96" y1="136" x2="96" y2="158" stroke="#10b981" stroke-width="2.5"/>
  <text x="107" y="176" fill="#94a3b8" font-size="10" text-anchor="middle" font-family="system-ui, sans-serif">虚圈为 90° 拐角，不是节点</text>

  <!-- Middle Arrow -->
  <line x1="205" y1="112" x2="225" y2="112" stroke="#38bdf8" stroke-width="2.5"/>
  <polygon points="224,107 234,112 224,117" fill="#38bdf8"/>
  <text x="219" y="100" fill="#38bdf8" font-size="9" text-anchor="middle" font-family="system-ui, sans-serif">等电位</text>
  <text x="219" y="129" fill="#38bdf8" font-size="9" text-anchor="middle" font-family="system-ui, sans-serif">坍缩</text>

  <!-- Right Panel: Collapsed canonical node -->
  <rect x="238" y="36" width="168" height="150" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="250" y="54" fill="#10b981" font-family="system-ui, sans-serif" font-size="11" font-weight="700">拓扑真相：仅 1 个节点 a</text>
  <!-- Single collapsed Node a -->
  <line x1="322" y1="78" x2="272" y2="106" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="322" y1="78" x2="322" y2="106" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="322" y1="78" x2="372" y2="106" stroke="#f59e0b" stroke-width="2.5"/>
  <circle cx="322" cy="78" r="8" fill="#f59e0b" stroke="#fef3c7" stroke-width="2"/>
  <text x="322" y="81" fill="#0f172a" font-size="10" font-weight="800" text-anchor="middle" font-family="monospace">a</text>
  <!-- 3 resistors radiating to Node b -->
  <rect x="264" y="106" width="16" height="30" rx="2" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="272" y="125" fill="#e2e8f0" font-size="9" text-anchor="middle" font-family="monospace">R1</text>
  <rect x="314" y="106" width="16" height="30" rx="2" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="322" y="125" fill="#e2e8f0" font-size="9" text-anchor="middle" font-family="monospace">R2</text>
  <rect x="364" y="106" width="16" height="30" rx="2" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="372" y="125" fill="#e2e8f0" font-size="9" text-anchor="middle" font-family="monospace">R3</text>
  <!-- Single collapsed Node b -->
  <line x1="272" y1="136" x2="322" y2="160" stroke="#10b981" stroke-width="2.5"/>
  <line x1="322" y1="136" x2="322" y2="160" stroke="#10b981" stroke-width="2.5"/>
  <line x1="372" y1="136" x2="322" y2="160" stroke="#10b981" stroke-width="2.5"/>
  <circle cx="322" cy="160" r="8" fill="#10b981" stroke="#d1fae5" stroke-width="2"/>
  <text x="322" y="163" fill="#0f172a" font-size="10" font-weight="800" text-anchor="middle" font-family="monospace">b</text>
  <text x="322" y="180" fill="#cbd5e1" font-size="10" text-anchor="middle" font-family="monospace">b = 3, n = 2 (a, b)</text>
</svg>`;

export const SVG_ACT2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 210" width="420" height="210">
  <rect width="420" height="210" rx="10" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">ACT 2 · 面包板物理透视：同一竖列 5 孔 (a–e) ＝ 原理图 1 个节点</text>

  <!-- Breadboard cutaway on left -->
  <rect x="16" y="38" width="218" height="156" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="28" y="56" fill="#cbd5e1" font-size="9" font-weight="700" font-family="monospace">Breadboard Col 11 | Col 12 | Col 13</text>

  <!-- Underlying copper busbar for Col 12 a-e -->
  <rect x="114" y="64" width="22" height="62" rx="4" fill="#38bdf8" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1.8"/>
  <!-- Underlying copper busbar for Col 12 f-j (isolated) -->
  <rect x="114" y="142" width="22" height="44" rx="4" fill="#475569" fill-opacity="0.3" stroke="#64748b" stroke-width="1.2" stroke-dasharray="3,2"/>

  <!-- Center Trench -->
  <rect x="24" y="129" width="202" height="10" rx="2" fill="#0f172a" stroke="#f43f5e" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="195" y="137" fill="#f43f5e" font-size="8" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif">中央凹槽(断路)</text>

  <!-- Row labels -->
  <g fill="#94a3b8" font-size="9" font-family="monospace">
    <text x="32" y="75">a</text><text x="32" y="87">b</text><text x="32" y="99">c</text><text x="32" y="111">d</text><text x="32" y="123">e</text>
    <text x="32" y="153">f</text><text x="32" y="165">g</text><text x="32" y="177">h</text>
  </g>

  <!-- Holes grid: Col 11 (x=76), Col 12 (x=125), Col 13 (x=174) -->
  <g fill="#0f172a" stroke="#64748b" stroke-width="1.2">
    <!-- Col 11 -->
    <rect x="72" y="68" width="8" height="7" rx="1"/><rect x="72" y="80" width="8" height="7" rx="1"/><rect x="72" y="92" width="8" height="7" rx="1"/><rect x="72" y="104" width="8" height="7" rx="1"/><rect x="72" y="116" width="8" height="7" rx="1"/>
    <rect x="72" y="146" width="8" height="7" rx="1"/><rect x="72" y="158" width="8" height="7" rx="1"/><rect x="72" y="170" width="8" height="7" rx="1"/>
    <!-- Col 13 -->
    <rect x="170" y="68" width="8" height="7" rx="1"/><rect x="170" y="80" width="8" height="7" rx="1"/><rect x="170" y="92" width="8" height="7" rx="1"/><rect x="170" y="104" width="8" height="7" rx="1"/><rect x="170" y="116" width="8" height="7" rx="1"/>
    <rect x="170" y="146" width="8" height="7" rx="1"/><rect x="170" y="158" width="8" height="7" rx="1"/><rect x="170" y="170" width="8" height="7" rx="1"/>
  </g>
  <!-- Col 12 highlighted holes -->
  <g fill="#38bdf8" stroke="#e0f2fe" stroke-width="1.2">
    <rect x="121" y="68" width="8" height="7" rx="1"/>
    <rect x="121" y="80" width="8" height="7" rx="1"/>
    <rect x="121" y="92" width="8" height="7" rx="1"/>
    <rect x="121" y="104" width="8" height="7" rx="1"/>
    <rect x="121" y="116" width="8" height="7" rx="1"/>
  </g>
  <g fill="#0f172a" stroke="#64748b" stroke-width="1.2">
    <rect x="121" y="146" width="8" height="7" rx="1"/><rect x="121" y="158" width="8" height="7" rx="1"/><rect x="121" y="170" width="8" height="7" rx="1"/>
  </g>

  <!-- 3 component leads plugged into a12, c12, e12 -->
  <line x1="56" y1="71" x2="125" y2="71" stroke="#f59e0b" stroke-width="2.2"/>
  <circle cx="125" cy="71" r="2.5" fill="#f59e0b"/>
  <text x="53" y="74" fill="#f59e0b" font-size="9" text-anchor="end" font-family="monospace">R1</text>

  <line x1="125" y1="95" x2="196" y2="95" stroke="#10b981" stroke-width="2.2"/>
  <circle cx="125" cy="95" r="2.5" fill="#10b981"/>
  <text x="200" y="98" fill="#10b981" font-size="9" font-family="monospace">R2</text>

  <line x1="125" y1="119" x2="196" y2="119" stroke="#a78bfa" stroke-width="2.2"/>
  <circle cx="125" cy="119" r="2.5" fill="#a78bfa"/>
  <text x="200" y="122" fill="#a78bfa" font-size="9" font-family="monospace">R3</text>

  <!-- Mapping arrow -->
  <line x1="242" y1="108" x2="266" y2="108" stroke="#38bdf8" stroke-width="2.5"/>
  <polygon points="265,103 275,108 265,113" fill="#38bdf8"/>
  <text x="258" y="96" fill="#38bdf8" font-size="9" text-anchor="middle" font-family="system-ui, sans-serif">等价映射</text>

  <!-- Schematic equivalent on right -->
  <rect x="280" y="38" width="124" height="156" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="342" y="56" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif">原理图拓扑等价</text>

  <line x1="342" y1="112" x2="300" y2="82" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="342" y1="112" x2="386" y2="82" stroke="#10b981" stroke-width="2.5"/>
  <line x1="342" y1="112" x2="342" y2="162" stroke="#a78bfa" stroke-width="2.5"/>

  <circle cx="342" cy="112" r="10" fill="#38bdf8" stroke="#e0f2fe" stroke-width="2"/>
  <text x="342" y="116" fill="#0f172a" font-size="11" font-weight="800" text-anchor="middle" font-family="monospace">A</text>

  <text x="294" y="78" fill="#f59e0b" font-size="10" font-family="monospace">R1</text>
  <text x="382" y="78" fill="#10b981" font-size="10" font-family="monospace">R2</text>
  <text x="342" y="176" fill="#a78bfa" font-size="10" text-anchor="middle" font-family="monospace">R3</text>
  <text x="342" y="190" fill="#94a3b8" font-size="9" text-anchor="middle" font-family="system-ui, sans-serif">Col 12 (a–e) = Node A</text>
</svg>`;

export const SVG_ACT3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 200" width="420" height="200">
  <rect width="420" height="200" rx="10" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">ACT 3 · 基本拓扑定理：生成树 (n−1=2 实线) + 连枝 (l=2 虚线) ＝ b=4</text>

  <!-- Nodes: a(70,66), b(220,66), c(bottom rail y=156) -->
  <!-- Spanning tree twigs (solid emerald): R1 (a-b) and R2 (b-c) -->
  <line x1="70" y1="66" x2="115" y2="66" stroke="#10b981" stroke-width="2.5"/>
  <rect x="115" y="56" width="54" height="20" rx="3" fill="#0f172a" stroke="#10b981" stroke-width="2.2"/>
  <text x="142" y="70" fill="#10b981" font-size="8.5" font-weight="700" text-anchor="middle" font-family="monospace">R1 (树枝1)</text>
  <line x1="169" y1="66" x2="220" y2="66" stroke="#10b981" stroke-width="2.5"/>

  <line x1="220" y1="66" x2="220" y2="90" stroke="#10b981" stroke-width="2.5"/>
  <rect x="206" y="90" width="28" height="42" rx="3" fill="#0f172a" stroke="#10b981" stroke-width="2.2"/>
  <text x="220" y="115" fill="#10b981" font-size="10" font-weight="700" text-anchor="middle" font-family="monospace">R2</text>
  <line x1="220" y1="132" x2="220" y2="156" stroke="#10b981" stroke-width="2.5"/>

  <!-- Link 1 (dashed sky blue): Vs on left (a-c) -->
  <line x1="70" y1="66" x2="70" y2="94" stroke="#38bdf8" stroke-width="2.2" stroke-dasharray="5,3"/>
  <circle cx="70" cy="111" r="17" fill="#0f172a" stroke="#38bdf8" stroke-width="2.2" stroke-dasharray="4,2"/>
  <text x="70" y="108" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle" font-family="monospace">+ Vs</text>
  <text x="70" y="121" fill="#38bdf8" font-size="9" text-anchor="middle" font-family="monospace">−</text>
  <line x1="70" y1="128" x2="70" y2="156" stroke="#38bdf8" stroke-width="2.2" stroke-dasharray="5,3"/>

  <!-- Link 2 (dashed amber): R3 on right (b-c) -->
  <polyline points="220,66 346,66 346,90" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-dasharray="5,3"/>
  <rect x="332" y="90" width="28" height="42" rx="3" fill="#0f172a" stroke="#f59e0b" stroke-width="2.2" stroke-dasharray="4,2"/>
  <text x="346" y="115" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="middle" font-family="monospace">R3</text>
  <line x1="346" y1="132" x2="346" y2="156" stroke="#f59e0b" stroke-width="2.2" stroke-dasharray="5,3"/>

  <!-- Bottom reference rail Node c -->
  <line x1="70" y1="156" x2="346" y2="156" stroke="#a78bfa" stroke-width="3"/>

  <!-- Loop curved arrows -->
  <path d="M 122 126 A 20 20 0 1 1 162 126" fill="none" stroke="#38bdf8" stroke-width="1.6"/>
  <polygon points="160,122 164,129 157,128" fill="#38bdf8"/>
  <text x="142" y="122" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle" font-family="monospace">Loop 1</text>

  <path d="M 264 126 A 20 20 0 1 1 304 126" fill="none" stroke="#f59e0b" stroke-width="1.6"/>
  <polygon points="302,122 306,129 299,128" fill="#f59e0b"/>
  <text x="284" y="122" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="middle" font-family="monospace">Loop 2</text>

  <!-- Node dots -->
  <circle cx="70" cy="66" r="6" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
  <text x="58" y="60" fill="#f8fafc" font-size="11" font-weight="700" font-family="monospace">a</text>
  <circle cx="220" cy="66" r="6" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
  <text x="220" y="54" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle" font-family="monospace">b</text>
  <circle cx="220" cy="156" r="6" fill="#a78bfa" stroke="#f8fafc" stroke-width="1.5"/>
  <text x="220" y="174" fill="#a78bfa" font-size="11" font-weight="700" text-anchor="middle" font-family="monospace">c (公共参考节点)</text>

  <!-- Legend badge -->
  <text x="210" y="191" fill="#cbd5e1" font-size="10" text-anchor="middle" font-family="monospace">验证：b(4) = l(2) + n(3) − 1  ✓</text>
</svg>`;

export const SVG_ACT4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 220" width="420" height="220">
  <rect width="420" height="220" rx="10" fill="#0f172a"/>
  <text x="16" y="22" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">ACT 4 · 拓扑照妖镜：拆穿“假串联”与“假并联”</text>

  <!-- Left Half: True vs Fake Series -->
  <rect x="14" y="34" width="190" height="174" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="26" y="52" fill="#10b981" font-size="10.5" font-weight="700" font-family="system-ui, sans-serif">✓ 真串联 (deg = 2 独占节点)</text>
  <line x1="28" y1="74" x2="54" y2="74" stroke="#94a3b8" stroke-width="2"/>
  <rect x="54" y="65" width="38" height="18" rx="2" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
  <text x="73" y="78" fill="#e2e8f0" font-size="9" text-anchor="middle" font-family="monospace">R1</text>
  <line x1="92" y1="74" x2="126" y2="74" stroke="#10b981" stroke-width="2.5"/>
  <circle cx="109" cy="74" r="5" fill="#10b981"/>
  <rect x="126" y="65" width="38" height="18" rx="2" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
  <text x="145" y="78" fill="#e2e8f0" font-size="9" text-anchor="middle" font-family="monospace">R2</text>
  <line x1="164" y1="74" x2="190" y2="74" stroke="#94a3b8" stroke-width="2"/>
  <text x="109" y="96" fill="#6ee7b7" font-size="9" text-anchor="middle" font-family="monospace">I1 = I2 (无分流)</text>

  <line x1="24" y1="108" x2="194" y2="108" stroke="#334155" stroke-width="1" stroke-dasharray="3,3"/>

  <text x="26" y="126" fill="#f43f5e" font-size="10.5" font-weight="700" font-family="system-ui, sans-serif">✗ 假串联 (deg = 3 第三支路破局)</text>
  <line x1="28" y1="148" x2="54" y2="148" stroke="#94a3b8" stroke-width="2"/>
  <rect x="54" y="139" width="38" height="18" rx="2" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="73" y="152" fill="#e2e8f0" font-size="9" text-anchor="middle" font-family="monospace">R1</text>
  <line x1="92" y1="148" x2="126" y2="148" stroke="#f43f5e" stroke-width="2.5"/>
  <rect x="126" y="139" width="38" height="18" rx="2" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="145" y="152" fill="#e2e8f0" font-size="9" text-anchor="middle" font-family="monospace">R2</text>
  <line x1="164" y1="148" x2="190" y2="148" stroke="#94a3b8" stroke-width="2"/>
  <!-- Tap branch -->
  <line x1="109" y1="148" x2="109" y2="170" stroke="#f43f5e" stroke-width="2.2"/>
  <rect x="97" y="170" width="24" height="22" rx="2" fill="#0f172a" stroke="#f43f5e" stroke-width="2"/>
  <text x="109" y="184" fill="#fda4af" font-size="8" text-anchor="middle" font-family="monospace">Rtap</text>
  <circle cx="109" cy="148" r="5.5" fill="#f43f5e"/>
  <text x="158" y="186" fill="#fda4af" font-size="9" text-anchor="middle" font-family="monospace">I1 ≠ I2!</text>

  <!-- Right Half: True vs Fake Parallel -->
  <rect x="216" y="34" width="190" height="174" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="228" y="52" fill="#38bdf8" font-size="10.5" font-weight="700" font-family="system-ui, sans-serif">✓ 真并联 (共享节点对 {A, B})</text>
  <!-- Top rail A -->
  <line x1="256" y1="64" x2="366" y2="64" stroke="#38bdf8" stroke-width="2.8"/>
  <text x="246" y="68" fill="#38bdf8" font-size="10" font-weight="700" font-family="monospace">A</text>
  <!-- Bottom rail B -->
  <line x1="256" y1="100" x2="366" y2="100" stroke="#10b981" stroke-width="2.8"/>
  <text x="246" y="104" fill="#10b981" font-size="10" font-weight="700" font-family="monospace">B</text>
  <!-- R3 and R4 -->
  <line x1="280" y1="64" x2="280" y2="100" stroke="#94a3b8" stroke-width="2"/>
  <rect x="270" y="71" width="20" height="22" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="280" y="85" fill="#e2e8f0" font-size="8.5" text-anchor="middle" font-family="monospace">R3</text>
  <line x1="342" y1="64" x2="342" y2="100" stroke="#94a3b8" stroke-width="2"/>
  <rect x="332" y="71" width="20" height="22" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="342" y="85" fill="#e2e8f0" font-size="8.5" text-anchor="middle" font-family="monospace">R4</text>
  <text x="311" y="86" fill="#7dd3fc" font-size="9" text-anchor="middle" font-family="monospace">V3=V4</text>

  <line x1="226" y1="112" x2="396" y2="112" stroke="#334155" stroke-width="1" stroke-dasharray="3,3"/>

  <text x="228" y="128" fill="#f43f5e" font-size="10.5" font-weight="700" font-family="system-ui, sans-serif">✗ 假并联 (夹塞元件撕裂节点)</text>
  <!-- Top rail split into A (sky) and A' (amber) by Rsneak -->
  <line x1="256" y1="146" x2="294" y2="146" stroke="#38bdf8" stroke-width="2.8"/>
  <rect x="294" y="138" width="34" height="16" rx="2" fill="#0f172a" stroke="#a78bfa" stroke-width="2"/>
  <text x="311" y="149" fill="#ddd6fe" font-size="8" text-anchor="middle" font-family="monospace">Rs</text>
  <line x1="328" y1="146" x2="366" y2="146" stroke="#f59e0b" stroke-width="2.8"/>
  <text x="246" y="150" fill="#38bdf8" font-size="10" font-weight="700" font-family="monospace">A</text>
  <text x="374" y="150" fill="#f59e0b" font-size="10" font-weight="700" font-family="monospace">A'</text>
  <!-- Bottom rail B -->
  <line x1="256" y1="188" x2="366" y2="188" stroke="#10b981" stroke-width="2.8"/>
  <text x="246" y="192" fill="#10b981" font-size="10" font-weight="700" font-family="monospace">B</text>
  <!-- R3 and R4 -->
  <line x1="274" y1="146" x2="274" y2="188" stroke="#94a3b8" stroke-width="2"/>
  <rect x="264" y="156" width="20" height="22" rx="2" fill="#0f172a" stroke="#94a3b8" stroke-width="1.8"/>
  <text x="274" y="170" fill="#e2e8f0" font-size="8.5" text-anchor="middle" font-family="monospace">R3</text>
  <line x1="348" y1="146" x2="348" y2="188" stroke="#94a3b8" stroke-width="2"/>
  <rect x="338" y="156" width="20" height="22" rx="2" fill="#0f172a" stroke="#94a3b8" stroke-width="1.8"/>
  <text x="348" y="170" fill="#e2e8f0" font-size="8.5" text-anchor="middle" font-family="monospace">R4</text>
  <text x="311" y="203" fill="#fda4af" font-size="9" text-anchor="middle" font-family="monospace">A≠A' ⇒ V3≠V4</text>
</svg>`;

export const SVG_ACT5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 210" width="420" height="210">
  <rect width="420" height="210" rx="10" fill="#0f172a"/>
  <text x="16" y="22" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">ACT 5 · 实战例题 (Sadiku Ex 2.4 拓扑)：5 元件电路图</text>

  <!-- Node b (Top-left/mid rail, amber) -->
  <polyline points="52,100 52,58 242,58" fill="none" stroke="#f59e0b" stroke-width="2.8" stroke-linejoin="round"/>
  <line x1="142" y1="58" x2="142" y2="86" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="232" y1="58" x2="232" y2="86" stroke="#f59e0b" stroke-width="2.5"/>
  <circle cx="142" cy="58" r="4" fill="#f59e0b"/>
  <circle cx="232" cy="58" r="4" fill="#f59e0b"/>
  <text x="142" y="47" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle" font-family="monospace">Node b</text>

  <!-- Node a (Top-right exclusive corner, sky blue) -->
  <polyline points="310,58 366,58 366,86" fill="none" stroke="#38bdf8" stroke-width="2.8" stroke-linejoin="round"/>
  <circle cx="366" cy="58" r="4.5" fill="#38bdf8"/>
  <text x="372" y="48" fill="#38bdf8" font-size="11" font-weight="700" font-family="monospace">Node a</text>

  <!-- Node c (Bottom rail, emerald) -->
  <polyline points="52,136 52,166 366,166 366,136" fill="none" stroke="#10b981" stroke-width="2.8" stroke-linejoin="round"/>
  <line x1="142" y1="136" x2="142" y2="166" stroke="#10b981" stroke-width="2.5"/>
  <line x1="232" y1="136" x2="232" y2="166" stroke="#10b981" stroke-width="2.5"/>
  <circle cx="142" cy="166" r="4" fill="#10b981"/>
  <circle cx="232" cy="166" r="4" fill="#10b981"/>
  <text x="209" y="185" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle" font-family="monospace">Node c (参考底轨)</text>

  <!-- Element 1: Vs = 10V -->
  <circle cx="52" cy="118" r="18" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <text x="52" y="114" fill="#f8fafc" font-size="8.5" font-weight="700" text-anchor="middle" font-family="monospace">+ 10V</text>
  <text x="52" y="128" fill="#f8fafc" font-size="10" text-anchor="middle" font-family="monospace">−</text>
  <text x="15" y="121" fill="#cbd5e1" font-size="9.5" font-family="monospace">Vs</text>

  <!-- Element 2: R3 = 6 ohm -->
  <rect x="130" y="86" width="24" height="50" rx="3" fill="#0f172a" stroke="#e2e8f0" stroke-width="2"/>
  <text x="142" y="109" fill="#e2e8f0" font-size="9.5" font-weight="700" text-anchor="middle" font-family="monospace">R3</text>
  <text x="142" y="122" fill="#94a3b8" font-size="8.5" text-anchor="middle" font-family="monospace">6Ω</text>

  <!-- Element 3: R4 = 2 ohm -->
  <rect x="220" y="86" width="24" height="50" rx="3" fill="#0f172a" stroke="#e2e8f0" stroke-width="2"/>
  <text x="232" y="109" fill="#e2e8f0" font-size="9.5" font-weight="700" text-anchor="middle" font-family="monospace">R4</text>
  <text x="232" y="122" fill="#94a3b8" font-size="8.5" text-anchor="middle" font-family="monospace">2Ω</text>

  <!-- Element 4: R1 = 5 ohm (horizontal top-right) -->
  <rect x="242" y="47" width="68" height="22" rx="3" fill="#0f172a" stroke="#e2e8f0" stroke-width="2"/>
  <text x="276" y="61" fill="#e2e8f0" font-size="9.5" font-weight="700" text-anchor="middle" font-family="monospace">R1 (5Ω)</text>

  <!-- Element 5: R2 = 3 ohm (vertical far-right) -->
  <rect x="354" y="86" width="24" height="50" rx="3" fill="#0f172a" stroke="#e2e8f0" stroke-width="2"/>
  <text x="366" y="109" fill="#e2e8f0" font-size="9.5" font-weight="700" text-anchor="middle" font-family="monospace">R2</text>
  <text x="366" y="122" fill="#94a3b8" font-size="8.5" text-anchor="middle" font-family="monospace">3Ω</text>
</svg>`;

export const SVG_ACT6 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 190" width="420" height="190">
  <rect width="420" height="190" rx="10" fill="#0f172a"/>
  <text x="16" y="22" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">ACT 6 · 下节预告 W1-L5 (KCL)：把今日的“真实节点”变成明日的“电流账本”</text>

  <!-- Central zoomed Node b -->
  <circle cx="210" cy="102" r="22" fill="#f59e0b" fill-opacity="0.2" stroke="#f59e0b" stroke-width="2.5"/>
  <circle cx="210" cy="102" r="9" fill="#f59e0b"/>
  <text x="210" y="106" fill="#0f172a" font-size="11" font-weight="800" text-anchor="middle" font-family="monospace">b</text>
  <text x="210" y="138" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif">真实节点 b (deg = 3)</text>

  <!-- Incoming current I_in from left -->
  <line x1="48" y1="102" x2="188" y2="102" stroke="#38bdf8" stroke-width="3"/>
  <polygon points="132,96 146,102 132,108" fill="#38bdf8"/>
  <text x="116" y="88" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle" font-family="monospace">I_in = 10 mA</text>

  <!-- Outgoing current I1 to top-right -->
  <line x1="229" y1="92" x2="362" y2="54" stroke="#10b981" stroke-width="3"/>
  <polygon points="292,68 307,70 296,80" fill="#10b981"/>
  <text x="326" y="48" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle" font-family="monospace">I_1 = 6 mA</text>

  <!-- Outgoing current I2 to bottom-right -->
  <line x1="229" y1="112" x2="362" y2="150" stroke="#a78bfa" stroke-width="3"/>
  <polygon points="296,124 307,134 292,136" fill="#a78bfa"/>
  <text x="326" y="164" fill="#a78bfa" font-size="11" font-weight="700" text-anchor="middle" font-family="monospace">I_2 = 4 mA</text>

  <!-- KCL teaser formula bar -->
  <rect x="60" y="156" width="180" height="22" rx="5" fill="#1e293b" stroke="#334155"/>
  <text x="150" y="171" fill="#e2e8f0" font-size="10.5" font-weight="700" text-anchor="middle" font-family="monospace">W1-L5 预告：ΣI_in = ΣI_out</text>
</svg>`;

export const MINI_STEP1 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 100'><rect width='240' height='100' rx='6' fill='#0f172a'/><line x1='24' y1='24' x2='140' y2='24' stroke='#475569' stroke-width='2'/><line x1='24' y1='80' x2='212' y2='80' stroke='#475569' stroke-width='2'/><circle cx='24' cy='52' r='11' fill='#1e293b' stroke='#38bdf8' stroke-width='2'/><text x='24' y='55' fill='#38bdf8' font-size='8' text-anchor='middle'>1</text><rect x='76' y='38' width='16' height='28' fill='#1e293b' stroke='#38bdf8' stroke-width='2'/><text x='84' y='55' fill='#38bdf8' font-size='8' text-anchor='middle'>2</text><rect x='132' y='38' width='16' height='28' fill='#1e293b' stroke='#38bdf8' stroke-width='2'/><text x='140' y='55' fill='#38bdf8' font-size='8' text-anchor='middle'>3</text><rect x='158' y='16' width='34' height='16' fill='#1e293b' stroke='#38bdf8' stroke-width='2'/><text x='175' y='27' fill='#38bdf8' font-size='8' text-anchor='middle'>4</text><rect x='204' y='38' width='16' height='28' fill='#1e293b' stroke='#38bdf8' stroke-width='2'/><text x='212' y='55' fill='#38bdf8' font-size='8' text-anchor='middle'>5</text><line x1='24' y1='24' x2='24' y2='41' stroke='#475569' stroke-width='2'/><line x1='24' y1='63' x2='24' y2='80' stroke='#475569' stroke-width='2'/><line x1='84' y1='24' x2='84' y2='38' stroke='#475569' stroke-width='2'/><line x1='84' y1='66' x2='84' y2='80' stroke='#475569' stroke-width='2'/><line x1='140' y1='24' x2='140' y2='38' stroke='#475569' stroke-width='2'/><line x1='140' y1='66' x2='140' y2='80' stroke='#475569' stroke-width='2'/><line x1='140' y1='24' x2='158' y2='24' stroke='#475569' stroke-width='2'/><polyline points='192,24 212,24 212,38' fill='none' stroke='#475569' stroke-width='2'/><line x1='212' y1='66' x2='212' y2='80' stroke='#475569' stroke-width='2'/></svg>`;

export const MINI_STEP2 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 100'><rect width='240' height='100' rx='6' fill='#0f172a'/><polyline points='24,42 24,24 158,24' fill='none' stroke='#f59e0b' stroke-width='3'/><line x1='84' y1='24' x2='84' y2='40' stroke='#f59e0b' stroke-width='2.5'/><line x1='140' y1='24' x2='140' y2='40' stroke='#f59e0b' stroke-width='2.5'/><text x='84' y='16' fill='#f59e0b' font-size='9' text-anchor='middle'>Node b</text><polyline points='192,24 212,24 212,40' fill='none' stroke='#38bdf8' stroke-width='3'/><text x='212' y='16' fill='#38bdf8' font-size='9' text-anchor='middle'>Node a</text><polyline points='24,64 24,80 212,80 212,64' fill='none' stroke='#10b981' stroke-width='3'/><line x1='84' y1='64' x2='84' y2='80' stroke='#10b981' stroke-width='2.5'/><line x1='140' y1='64' x2='140' y2='80' stroke='#10b981' stroke-width='2.5'/><text x='118' y='94' fill='#10b981' font-size='9' text-anchor='middle'>Node c</text><rect x='158' y='18' width='34' height='12' fill='#1e293b' stroke='#94a3b8'/><rect x='78' y='40' width='12' height='24' fill='#1e293b' stroke='#94a3b8'/><rect x='134' y='40' width='12' height='24' fill='#1e293b' stroke='#94a3b8'/><rect x='206' y='40' width='12' height='24' fill='#1e293b' stroke='#94a3b8'/><circle cx='24' cy='53' r='10' fill='#1e293b' stroke='#94a3b8'/></svg>`;

export const MINI_STEP3 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 100'><rect width='240' height='100' rx='6' fill='#0f172a'/><rect x='72' y='28' width='80' height='48' rx='4' fill='#38bdf8' fill-opacity='0.14' stroke='#38bdf8' stroke-dasharray='3,2'/><text x='112' y='56' fill='#38bdf8' font-size='8.5' text-anchor='middle'>R3 ∥ R4 (b-c)</text><path d='M 158 24 L 212 24 L 212 72' fill='none' stroke='#10b981' stroke-width='3'/><circle cx='212' cy='24' r='4' fill='#10b981'/><text x='194' y='44' fill='#10b981' font-size='8.5' text-anchor='middle'>R1+R2</text><text x='194' y='56' fill='#10b981' font-size='8' text-anchor='middle'>串联(独占a)</text><text x='120' y='92' fill='#f59e0b' font-size='9' text-anchor='middle'>l = b − n + 1 = 5 − 3 + 1 = 3</text></svg>`;
