// The inline SVGs of the W5-L3 lesson sheet (docs/lessons/W5-L3.md), copied from the sheet by a
// script, not retyped: the five act diagrams and the five step diagrams of the guided-example JSON.
// They are drawn for a light canvas (#f8fafc), so they do NOT go through lightSvg; svgs.ts adjusts them.

export const SHEET_ACT1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 340" width="880" height="340" role="img" aria-label="时域电路到频域相量等效电路一键转换对照图">
  <defs>
    <marker id="arrow-blue-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1d4ed8"/>
    </marker>
    <marker id="arrow-emerald-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="880" height="340" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- Left Panel: Time Domain -->
  <rect x="20" y="20" width="365" height="245" rx="10" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
  <rect x="20" y="20" width="365" height="32" rx="10" fill="#e2e8f0"/>
  <text x="202" y="41" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">时域原电路（Time Domain, ω = 100 rad/s）</text>
  <!-- Top & Bottom Rails (Left) -->
  <line x1="70" y1="90" x2="345" y2="90" stroke="#1e293b" stroke-width="2"/>
  <line x1="70" y1="225" x2="345" y2="225" stroke="#1e293b" stroke-width="2"/>
  <!-- Node v(t) label -->
  <circle cx="205" cy="90" r="4.5" fill="#dc2626"/>
  <text x="205" y="77" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#dc2626">v(t)</text>
  <!-- Ground symbol left -->
  <line x1="205" y1="225" x2="205" y2="242" stroke="#1e293b" stroke-width="2"/>
  <line x1="191" y1="242" x2="219" y2="242" stroke="#1e293b" stroke-width="2"/>
  <line x1="196" y1="248" x2="214" y2="248" stroke="#1e293b" stroke-width="2"/>
  <line x1="201" y1="254" x2="209" y2="254" stroke="#1e293b" stroke-width="2"/>
  <!-- Current Source Left -->
  <line x1="70" y1="90" x2="70" y2="132" stroke="#1e293b" stroke-width="2"/>
  <circle cx="70" cy="157" r="24" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
  <line x1="70" y1="172" x2="70" y2="143" stroke="#1d4ed8" stroke-width="2.2" marker-end="url(#arrow-blue-1)"/>
  <line x1="70" y1="181" x2="70" y2="225" stroke="#1e293b" stroke-width="2"/>
  <text x="102" y="150" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#1d4ed8">i_s(t) =</text>
  <text x="102" y="166" font-family="sans-serif" font-size="11" fill="#1d4ed8">10cos(100t+30°)</text>
  <!-- Resistor R=20 Ohm -->
  <line x1="195" y1="90" x2="195" y2="122" stroke="#1e293b" stroke-width="2"/>
  <rect x="186" y="122" width="18" height="62" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
  <line x1="195" y1="184" x2="195" y2="225" stroke="#1e293b" stroke-width="2"/>
  <text x="195" y="205" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#92400e">R = 20 Ω</text>
  <!-- Inductor L=0.1 H -->
  <line x1="268" y1="90" x2="268" y2="120" stroke="#1e293b" stroke-width="2"/>
  <path d="M 268 120 C 282 120, 282 136, 268 136 C 282 136, 282 152, 268 152 C 282 152, 282 168, 268 168 C 282 168, 282 184, 268 184" fill="none" stroke="#7c3aed" stroke-width="2.2"/>
  <line x1="268" y1="184" x2="268" y2="225" stroke="#1e293b" stroke-width="2"/>
  <text x="268" y="205" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#6d28d9">L = 0.1 H</text>
  <!-- Capacitor C=0.5 mF -->
  <line x1="345" y1="90" x2="345" y2="148" stroke="#1e293b" stroke-width="2"/>
  <line x1="331" y1="148" x2="359" y2="148" stroke="#0f766e" stroke-width="2.8"/>
  <line x1="331" y1="160" x2="359" y2="160" stroke="#0f766e" stroke-width="2.8"/>
  <line x1="345" y1="160" x2="345" y2="225" stroke="#1e293b" stroke-width="2"/>
  <text x="342" y="205" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0f766e">C = 0.5 mF</text>

  <!-- Center Transform Arrow -->
  <line x1="395" y1="142" x2="480" y2="142" stroke="#059669" stroke-width="3.5" marker-end="url(#arrow-emerald-1)"/>
  <rect x="396" y="102" width="84" height="30" rx="6" fill="#d1fae5" stroke="#059669" stroke-width="1.2"/>
  <text x="438" y="121" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#065f46">相量变换</text>
  <text x="438" y="164" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#047857">L → jωL</text>
  <text x="438" y="180" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#047857">C → -j/(ωC)</text>

  <!-- Right Panel: Phasor Domain -->
  <rect x="495" y="20" width="365" height="245" rx="10" fill="#ffffff" stroke="#059669" stroke-width="1.8"/>
  <rect x="495" y="20" width="365" height="32" rx="10" fill="#d1fae5"/>
  <text x="677" y="41" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#065f46">频域相量等效电路（Phasor Domain）</text>
  <!-- Top & Bottom Rails (Right) -->
  <line x1="545" y1="90" x2="820" y2="90" stroke="#1e293b" stroke-width="2"/>
  <line x1="545" y1="225" x2="820" y2="225" stroke="#1e293b" stroke-width="2"/>
  <!-- Node V Phasor Bubble -->
  <rect x="652" y="62" width="56" height="22" rx="11" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="680" y="77" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#b91c1c">V (相量)</text>
  <circle cx="680" cy="90" r="4.5" fill="#dc2626"/>
  <!-- Ground symbol right -->
  <line x1="680" y1="225" x2="680" y2="242" stroke="#1e293b" stroke-width="2"/>
  <line x1="666" y1="242" x2="694" y2="242" stroke="#1e293b" stroke-width="2"/>
  <line x1="671" y1="248" x2="689" y2="248" stroke="#1e293b" stroke-width="2"/>
  <line x1="676" y1="254" x2="684" y2="254" stroke="#1e293b" stroke-width="2"/>
  <!-- Phasor Current Source -->
  <line x1="545" y1="90" x2="545" y2="132" stroke="#1e293b" stroke-width="2"/>
  <circle cx="545" cy="157" r="24" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
  <line x1="545" y1="172" x2="545" y2="143" stroke="#1d4ed8" stroke-width="2.2" marker-end="url(#arrow-blue-1)"/>
  <line x1="545" y1="181" x2="545" y2="225" stroke="#1e293b" stroke-width="2"/>
  <text x="577" y="153" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1d4ed8">I_s =</text>
  <text x="577" y="169" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1d4ed8">10∠30° A</text>
  <!-- Impedance Boxes -->
  <line x1="665" y1="90" x2="665" y2="122" stroke="#1e293b" stroke-width="2"/>
  <rect x="651" y="122" width="28" height="62" rx="4" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
  <text x="665" y="157" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#92400e">20Ω</text>
  <line x1="665" y1="184" x2="665" y2="225" stroke="#1e293b" stroke-width="2"/>

  <line x1="742" y1="90" x2="742" y2="122" stroke="#1e293b" stroke-width="2"/>
  <rect x="724" y="122" width="36" height="62" rx="4" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="742" y="157" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#5b21b6">j10Ω</text>
  <line x1="742" y1="184" x2="742" y2="225" stroke="#1e293b" stroke-width="2"/>

  <line x1="820" y1="90" x2="820" y2="122" stroke="#1e293b" stroke-width="2"/>
  <rect x="800" y="122" width="40" height="62" rx="4" fill="#ccfbf1" stroke="#0f766e" stroke-width="2"/>
  <text x="820" y="157" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#115e59">-j20Ω</text>
  <line x1="820" y1="184" x2="820" y2="225" stroke="#1e293b" stroke-width="2"/>

  <!-- Bottom Guard Banner -->
  <rect x="20" y="280" width="840" height="44" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="440" y="307" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#991b1b">同频红线：仅当全电路激励频率 ω 唯一相同时，才能合并至同一相量图求解（多频电路请移步 W5-L4 叠加定理）</text>
</svg>`;

export const SHEET_ACT2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 350" width="880" height="350" role="img" aria-label="交流节点分析法与复数电位气泡高亮电路图">
  <defs>
    <marker id="arr-blue-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1d4ed8"/>
    </marker>
    <marker id="arr-red-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
    <marker id="arr-amber-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="880" height="350" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="440" y="30" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a">经典例题 1（频域相量图，ω = 10 rad/s）：两节点交流电路 + CCCS 受控源</text>

  <!-- Node 1 Highlight Zone -->
  <rect x="85" y="72" width="235" height="34" rx="17" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="5,3"/>
  <rect x="165" y="42" width="128" height="24" rx="12" fill="#2563eb"/>
  <text x="229" y="58" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">节点 1 电位气泡 V₁</text>

  <!-- Node 2 Highlight Zone -->
  <rect x="530" y="72" width="260" height="34" rx="17" fill="#fce7f3" stroke="#db2777" stroke-width="1.5" stroke-dasharray="5,3"/>
  <rect x="596" y="42" width="128" height="24" rx="12" fill="#db2777"/>
  <text x="660" y="58" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">节点 2 电位气泡 V₂</text>

  <!-- Top Wires -->
  <line x1="120" y1="89" x2="365" y2="89" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="475" y1="89" x2="755" y2="89" stroke="#1e293b" stroke-width="2.2"/>
  <!-- Bottom Reference Rail -->
  <line x1="120" y1="275" x2="755" y2="275" stroke="#1e293b" stroke-width="2.4"/>
  <!-- Ground Symbol -->
  <line x1="440" y1="275" x2="440" y2="298" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="422" y1="298" x2="458" y2="298" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="429" y1="305" x2="451" y2="305" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="435" y1="312" x2="445" y2="312" stroke="#1e293b" stroke-width="2.2"/>
  <text x="440" y="332" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#475569">参考地（0 V）</text>

  <!-- Node dots -->
  <circle cx="275" cy="89" r="5" fill="#2563eb"/>
  <circle cx="585" cy="89" r="5" fill="#db2777"/>

  <!-- Branch 1: Independent Current Source Is = 5∠0° A -->
  <line x1="120" y1="89" x2="120" y2="152" stroke="#1e293b" stroke-width="2.2"/>
  <circle cx="120" cy="182" r="28" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2.2"/>
  <line x1="120" y1="200" x2="120" y2="164" stroke="#1d4ed8" stroke-width="2.5" marker-end="url(#arr-blue-2)"/>
  <line x1="120" y1="210" x2="120" y2="275" stroke="#1e293b" stroke-width="2.2"/>
  <text x="158" y="177" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1d4ed8">I_s = 5∠0° A</text>
  <text x="158" y="195" font-family="sans-serif" font-size="11" fill="#475569">5cos(10t) A</text>

  <!-- Branch 2: Capacitor Z_C = -j4 Ohm -->
  <line x1="275" y1="89" x2="275" y2="145" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="251" y="145" width="48" height="74" rx="6" fill="#ccfbf1" stroke="#0f766e" stroke-width="2.2"/>
  <text x="275" y="178" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#115e59">Z_C</text>
  <text x="275" y="197" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f766e">-j4 Ω</text>
  <line x1="275" y1="219" x2="275" y2="275" stroke="#1e293b" stroke-width="2.2"/>
  <text x="275" y="248" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">C = 25 mF</text>

  <!-- Bridge Branch: R1 = 4 Ohm + Control Current Ix -->
  <rect x="365" y="72" width="110" height="34" rx="6" fill="#fef3c7" stroke="#b45309" stroke-width="2.2"/>
  <text x="420" y="94" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#92400e">R₁ = 4 Ω</text>
  <line x1="378" y1="124" x2="462" y2="124" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red-2)"/>
  <text x="420" y="143" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#dc2626">I_x = (V₁ - V₂) / 4</text>

  <!-- Branch 3: Inductor Z_L = j2 Ohm -->
  <line x1="585" y1="89" x2="585" y2="145" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="561" y="145" width="48" height="74" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="2.2"/>
  <text x="585" y="178" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#5b21b6">Z_L</text>
  <text x="585" y="197" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#6d28d9">j2 Ω</text>
  <line x1="585" y1="219" x2="585" y2="275" stroke="#1e293b" stroke-width="2.2"/>
  <text x="585" y="248" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">L = 0.2 H</text>

  <!-- Branch 4: Dependent Source CCCS 2Ix (Diamond) -->
  <line x1="755" y1="89" x2="755" y2="147" stroke="#1e293b" stroke-width="2.2"/>
  <polygon points="755,147 788,182 755,217 722,182" fill="#fffbeb" stroke="#d97706" stroke-width="2.4"/>
  <line x1="755" y1="201" x2="755" y2="165" stroke="#d97706" stroke-width="2.5" marker-end="url(#arr-amber-2)"/>
  <line x1="755" y1="217" x2="755" y2="275" stroke="#1e293b" stroke-width="2.2"/>
  <text x="798" y="177" font-family="sans-serif" font-size="13" font-weight="bold" fill="#b45309">2 I_x</text>
  <text x="798" y="195" font-family="sans-serif" font-size="11" fill="#78350f">CCCS 受控源</text>
</svg>`;

export const SHEET_ACT3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 350" width="880" height="350" role="img" aria-label="交流双网孔与超网孔复数方程求解原理图">
  <defs>
    <marker id="arr-indigo-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4f46e5"/>
    </marker>
    <marker id="arr-rose-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#e11d48"/>
    </marker>
    <marker id="arr-emerald-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="880" height="350" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="440" y="30" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a">经典例题 2（频域相量图，ω = 5 rad/s）：交流超网孔（Supermesh）分析</text>

  <!-- Supermesh Outer Dashed Highlight -->
  <rect x="78" y="56" width="724" height="248" rx="18" fill="none" stroke="#059669" stroke-width="2.5" stroke-dasharray="10,6"/>
  <rect x="335" y="42" width="210" height="24" rx="12" fill="#059669"/>
  <text x="440" y="58" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">超网孔外大环路（Supermesh KVL）</text>

  <!-- Outer Loop Wires -->
  <line x1="120" y1="95" x2="175" y2="95" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="265" y1="95" x2="310" y2="95" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="400" y1="95" x2="490" y2="95" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="585" y1="95" x2="760" y2="95" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="120" y1="275" x2="760" y2="275" stroke="#1e293b" stroke-width="2.2"/>

  <!-- Left Branch: Voltage Source Vs = 20∠0° V -->
  <line x1="120" y1="95" x2="120" y2="155" stroke="#1e293b" stroke-width="2.2"/>
  <circle cx="120" cy="185" r="28" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2.2"/>
  <text x="120" y="177" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1d4ed8">+</text>
  <text x="120" y="203" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1d4ed8">-</text>
  <line x1="120" y1="213" x2="120" y2="275" stroke="#1e293b" stroke-width="2.2"/>
  <text x="156" y="180" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1d4ed8">V_s = 20∠0° V</text>
  <text x="156" y="198" font-family="sans-serif" font-size="11" fill="#475569">20cos(5t) V</text>

  <!-- Mesh 1 Top Elements: R1 = 4 Ohm, Z_L = j2 Ohm -->
  <rect x="175" y="78" width="90" height="34" rx="6" fill="#fef3c7" stroke="#b45309" stroke-width="2.2"/>
  <text x="220" y="100" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#92400e">R₁ = 4 Ω</text>
  <rect x="310" y="78" width="90" height="34" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="2.2"/>
  <text x="355" y="100" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#5b21b6">Z_L = j2 Ω</text>

  <!-- Shared Center Branch: Current Source Is = -j4 A -->
  <circle cx="445" cy="95" r="4.5" fill="#1e293b"/>
  <circle cx="445" cy="275" r="4.5" fill="#1e293b"/>
  <line x1="445" y1="95" x2="445" y2="155" stroke="#e11d48" stroke-width="2.2" stroke-dasharray="4,3"/>
  <circle cx="445" cy="185" r="28" fill="#fff1f2" stroke="#e11d48" stroke-width="2.4"/>
  <line x1="445" y1="202" x2="445" y2="167" stroke="#e11d48" stroke-width="2.6" marker-end="url(#arr-rose-3)"/>
  <line x1="445" y1="213" x2="445" y2="275" stroke="#e11d48" stroke-width="2.2" stroke-dasharray="4,3"/>
  <text x="480" y="176" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#be123c">I_s = 4∠-90°</text>
  <text x="480" y="194" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#be123c">= -j4 A</text>
  <text x="480" y="212" font-family="sans-serif" font-size="10.5" fill="#881337">约束：I₂ - I₁ = -j4</text>

  <!-- Mesh 2 Elements: Z_C = -j4 Ohm (top), R2 = 2 Ohm (right) -->
  <rect x="490" y="78" width="95" height="34" rx="6" fill="#ccfbf1" stroke="#0f766e" stroke-width="2.2"/>
  <text x="537" y="100" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#115e59">Z_C = -j4 Ω</text>

  <line x1="760" y1="95" x2="760" y2="145" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="736" y="145" width="48" height="80" rx="6" fill="#fef3c7" stroke="#b45309" stroke-width="2.2"/>
  <text x="760" y="182" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#92400e">R₂</text>
  <text x="760" y="200" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#92400e">2 Ω</text>
  <line x1="760" y1="225" x2="760" y2="275" stroke="#1e293b" stroke-width="2.2"/>

  <!-- Mesh 1 Clockwise Loop Arrow -->
  <path d="M 272 185 A 36 36 0 1 1 308 221" fill="none" stroke="#4f46e5" stroke-width="2.5" marker-end="url(#arr-indigo-3)"/>
  <text x="308" y="191" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#4338ca">I₁</text>

  <!-- Mesh 2 Clockwise Loop Arrow -->
  <path d="M 605 185 A 36 36 0 1 1 641 221" fill="none" stroke="#4f46e5" stroke-width="2.5" marker-end="url(#arr-indigo-3)"/>
  <text x="641" y="191" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#4338ca">I₂</text>

  <!-- Footer Tip -->
  <text x="440" y="330" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#065f46">手算黄金法则：方程合并与加减一律用直角坐标（a+jb），最后一步复数乘除切换极坐标（M∠θ）！</text>
</svg>`;

export const SHEET_ACT4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 310" width="880" height="310" role="img" aria-label="苏格拉底式交流节点分析实战电路主图">
  <defs>
    <marker id="arr-blue-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1d4ed8"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="880" height="310" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="440" y="28" text-anchor="middle" font-family="sans-serif" font-size="14.5" font-weight="bold" fill="#0f172a">苏格拉底实战题（时域原图，ω = 100 rad/s）：求稳态节点电压 v₁(t) 与 v₂(t)</text>
  <!-- Wires -->
  <line x1="120" y1="80" x2="405" y2="80" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="425" y1="80" x2="740" y2="80" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="120" y1="245" x2="740" y2="245" stroke="#1e293b" stroke-width="2.2"/>
  <!-- Ground -->
  <line x1="415" y1="245" x2="415" y2="265" stroke="#1e293b" stroke-width="2"/>
  <line x1="400" y1="265" x2="430" y2="265" stroke="#1e293b" stroke-width="2"/>
  <line x1="406" y1="271" x2="424" y2="271" stroke="#1e293b" stroke-width="2"/>
  <line x1="411" y1="277" x2="419" y2="277" stroke="#1e293b" stroke-width="2"/>
  <!-- Node Labels -->
  <circle cx="275" cy="80" r="5" fill="#2563eb"/>
  <text x="275" y="64" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#2563eb">节点 1: v₁(t)</text>
  <circle cx="585" cy="80" r="5" fill="#db2777"/>
  <text x="585" y="64" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#db2777">节点 2: v₂(t)</text>
  <!-- Current Source -->
  <line x1="120" y1="80" x2="120" y2="136" stroke="#1e293b" stroke-width="2.2"/>
  <circle cx="120" cy="162" r="26" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2.2"/>
  <line x1="120" y1="178" x2="120" y2="146" stroke="#1d4ed8" stroke-width="2.4" marker-end="url(#arr-blue-4)"/>
  <line x1="120" y1="188" x2="120" y2="245" stroke="#1e293b" stroke-width="2.2"/>
  <text x="155" y="158" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1d4ed8">i_s(t) =</text>
  <text x="155" y="176" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1d4ed8">6sin(100t) A</text>
  <!-- R1 = 10 Ohm -->
  <line x1="275" y1="80" x2="275" y2="125" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="263" y="125" width="24" height="74" fill="#fef3c7" stroke="#b45309" stroke-width="2.2"/>
  <line x1="275" y1="199" x2="275" y2="245" stroke="#1e293b" stroke-width="2.2"/>
  <text x="315" y="166" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#92400e">R₁ = 10 Ω</text>
  <!-- C = 1 mF -->
  <line x1="405" y1="62" x2="405" y2="98" stroke="#0f766e" stroke-width="3"/>
  <line x1="425" y1="62" x2="425" y2="98" stroke="#0f766e" stroke-width="3"/>
  <text x="415" y="118" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#0f766e">C = 1 mF</text>
  <!-- R2 = 10 Ohm -->
  <line x1="585" y1="80" x2="585" y2="125" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="573" y="125" width="24" height="74" fill="#fef3c7" stroke="#b45309" stroke-width="2.2"/>
  <line x1="585" y1="199" x2="585" y2="245" stroke="#1e293b" stroke-width="2.2"/>
  <text x="625" y="166" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#92400e">R₂ = 10 Ω</text>
  <!-- L = 0.1 H -->
  <line x1="740" y1="80" x2="740" y2="125" stroke="#1e293b" stroke-width="2.2"/>
  <path d="M 740 125 C 756 125, 756 143, 740 143 C 756 143, 756 161, 740 161 C 756 161, 756 179, 740 179 C 756 179, 756 197, 740 197" fill="none" stroke="#7c3aed" stroke-width="2.4"/>
  <line x1="740" y1="197" x2="740" y2="245" stroke="#1e293b" stroke-width="2.2"/>
  <text x="795" y="166" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#6d28d9">L = 0.1 H</text>
</svg>`;

export const SHEET_ACT5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 280" width="880" height="280" role="img" aria-label="单频合法相量电路与双频陷阱电路对照决策图">
  <rect x="0" y="0" width="880" height="280" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- Left Card: Legal Single Frequency -->
  <rect x="20" y="20" width="405" height="240" rx="10" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
  <rect x="20" y="20" width="405" height="36" rx="10" fill="#10b981"/>
  <text x="222" y="43" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">允许直接画单张相量图（同频 ω₁ = ω₂）</text>
  <!-- Mini Schematic Left -->
  <line x1="65" y1="100" x2="380" y2="100" stroke="#064e3b" stroke-width="2"/>
  <line x1="65" y1="190" x2="380" y2="190" stroke="#064e3b" stroke-width="2"/>
  <line x1="65" y1="100" x2="65" y2="190" stroke="#064e3b" stroke-width="2"/>
  <circle cx="65" cy="145" r="18" fill="#ffffff" stroke="#059669" stroke-width="2"/>
  <text x="65" y="150" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#059669">V₁</text>
  <rect x="145" y="86" width="56" height="28" rx="4" fill="#ffffff" stroke="#059669" stroke-width="2"/>
  <text x="173" y="105" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#065f46">jωL</text>
  <line x1="255" y1="100" x2="255" y2="190" stroke="#064e3b" stroke-width="2"/>
  <rect x="235" y="128" width="40" height="34" rx="4" fill="#ffffff" stroke="#059669" stroke-width="2"/>
  <text x="255" y="149" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#065f46">R</text>
  <line x1="380" y1="100" x2="380" y2="190" stroke="#064e3b" stroke-width="2"/>
  <circle cx="380" cy="145" r="18" fill="#ffffff" stroke="#059669" stroke-width="2"/>
  <text x="380" y="150" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#059669">V₂</text>
  <text x="222" y="218" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#065f46">v₁ = 10cos(50t) V，v₂ = 5sin(50t) V</text>
  <text x="222" y="240" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#047857">结论：全电路唯一 ω = 50 rad/s → 直接用本课节点/网孔法！</text>

  <!-- Right Card: Forbidden Multi Frequency -->
  <rect x="455" y="20" width="405" height="240" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
  <rect x="455" y="20" width="405" height="36" rx="10" fill="#ef4444"/>
  <text x="657" y="43" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">严禁画在同一相量图（异频 ω₁ ≠ ω₂）</text>
  <!-- Mini Schematic Right -->
  <line x1="500" y1="100" x2="815" y2="100" stroke="#7f1d1d" stroke-width="2"/>
  <line x1="500" y1="190" x2="815" y2="190" stroke="#7f1d1d" stroke-width="2"/>
  <line x1="500" y1="100" x2="500" y2="190" stroke="#7f1d1d" stroke-width="2"/>
  <circle cx="500" cy="145" r="18" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
  <text x="500" y="150" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#dc2626">ω₁</text>
  <rect x="572" y="86" width="76" height="28" rx="4" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
  <text x="610" y="105" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#991b1b">jω₁L ≠ jω₂L</text>
  <line x1="690" y1="100" x2="690" y2="190" stroke="#7f1d1d" stroke-width="2"/>
  <rect x="670" y="128" width="40" height="34" rx="4" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
  <text x="690" y="149" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#991b1b">R</text>
  <line x1="815" y1="100" x2="815" y2="190" stroke="#7f1d1d" stroke-width="2"/>
  <circle cx="815" cy="145" r="18" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
  <text x="815" y="150" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#dc2626">ω₂</text>
  <text x="657" y="218" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#991b1b">v₁ = 10cos(50t) V，v₂ = 5cos(120t) V（或直流 5 V）</text>
  <text x="657" y="240" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#b91c1c">结论：阻抗不唯一 → 必须移步 W5-L4 叠加定理分频求解！</text>
</svg>`;

export const SHEET_MINI1 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='360' height='110'><rect x='2' y='2' width='356' height='106' rx='8' fill='#f8fafc' stroke='#cbd5e1'/><text x='180' y='28' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='bold' fill='#0f172a'>步骤 1：余弦基准相量转换（ω = 100 rad/s）</text><rect x='16' y='44' width='100' height='48' rx='6' fill='#eff6ff' stroke='#2563eb'/><text x='66' y='65' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#1d4ed8'>6sin(100t)</text><text x='66' y='82' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#1e3a8a'>→ I_s = ?</text><rect x='130' y='44' width='100' height='48' rx='6' fill='#ccfbf1' stroke='#0f766e'/><text x='180' y='65' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#0f766e'>C = 1 mF</text><text x='180' y='82' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#115e59'>→ Z_C = ?</text><rect x='244' y='44' width='100' height='48' rx='6' fill='#ede9fe' stroke='#7c3aed'/><text x='294' y='65' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#6d28d9'>L = 0.1 H</text><text x='294' y='82' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#4c1d95'>→ Z_L = ?</text></svg>`;

export const SHEET_MINI2 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='360' height='110'><rect x='2' y='2' width='356' height='106' rx='8' fill='#f8fafc' stroke='#cbd5e1'/><circle cx='95' cy='46' r='18' fill='#dbeafe' stroke='#2563eb' stroke-width='2'/><text x='95' y='51' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='bold' fill='#1d4ed8'>V₁</text><line x1='113' y1='46' x2='247' y2='46' stroke='#0f766e' stroke-width='2.5'/><rect x='152' y='34' width='56' height='24' rx='4' fill='#ccfbf1' stroke='#0f766e'/><text x='180' y='50' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#115e59'>-j10 Ω</text><circle cx='265' cy='46' r='18' fill='#fce7f3' stroke='#db2777' stroke-width='2'/><text x='265' y='51' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='bold' fill='#be185d'>V₂</text><text x='180' y='92' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#334155'>提示：1/(-j10) = +j0.1 S，1/(j10) = -j0.1 S</text></svg>`;

export const SHEET_MINI3 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='360' height='110'><rect x='2' y='2' width='356' height='106' rx='8' fill='#f8fafc' stroke='#cbd5e1'/><text x='180' y='34' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='bold' fill='#0f172a'>步骤 3：高斯消元（直角坐标合并）</text><rect x='45' y='48' width='270' height='42' rx='6' fill='#fef3c7' stroke='#d97706'/><text x='180' y='74' text-anchor='middle' font-family='sans-serif' font-size='13' font-weight='bold' fill='#92400e'>(1 + j)V₁ - j(jV₁) = -j60</text></svg>`;

export const SHEET_MINI4 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='360' height='110'><rect x='2' y='2' width='356' height='106' rx='8' fill='#f8fafc' stroke='#cbd5e1'/><text x='180' y='30' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='bold' fill='#0f172a'>步骤 4：极坐标除法求模角</text><text x='180' y='58' text-anchor='middle' font-family='sans-serif' font-size='12' fill='#1d4ed8'>V₁ = (60∠-90°) / (2.2361∠26.57°)</text><text x='180' y='84' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='bold' fill='#db2777'>V₂ = jV₁ → 模值相等，相角超前 +90°</text></svg>`;

export const SHEET_MINI5 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='360' height='110'><rect x='2' y='2' width='356' height='106' rx='8' fill='#ecfdf5' stroke='#059669'/><text x='180' y='32' text-anchor='middle' font-family='sans-serif' font-size='12.5' font-weight='bold' fill='#065f46'>步骤 5：频域 → 时域还原（ω = 100 rad/s）</text><text x='180' y='62' text-anchor='middle' font-family='sans-serif' font-size='12' fill='#047857'>v(t) = Re{ M∠θ · e^(jωt) } = M cos(ωt + θ)</text><text x='180' y='88' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#065f46'>物理核验：v₂(t) 与 v₁(t) 振幅相同且严格超前 90°！</text></svg>`;
