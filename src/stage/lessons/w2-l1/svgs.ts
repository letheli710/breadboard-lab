// W2-L1 diagrams. SVG_ACT1…5 and MINI_STEP1…5 are the lesson sheet's own (drawn for a light canvas
// already, so no lightSvg), reproduced as given except: MINI_STEP5 no longer prints the step's
// answer (v₁ = +15 V and the direction of i₃ became “?”); PROBLEM is act 3's circuit with its
// marker ids renamed (it is shown a second time in the guided example). The quiz figures and the
// next-lesson preview are added in the sheet's style (figures.ts).

export const SVG_ACT1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 320" width="680" height="320" font-family="system-ui, -apple-system, sans-serif">
  <defs>
    <marker id="arr-blue-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB"/>
    </marker>
    <marker id="arr-red-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626"/>
    </marker>
  </defs>
  <rect width="680" height="320" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>

  <!-- Left Panel: Altitude / Water Pressure Analogy -->
  <text x="165" y="28" text-anchor="middle" font-size="14" font-weight="700" fill="#1E293B">物理直觉：海拔高度差驱动水流</text>
  <line x1="335" y1="20" x2="335" y2="300" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="5,5"/>

  <!-- Sea Level (0 m) -->
  <line x1="25" y1="265" x2="310" y2="265" stroke="#0284C7" stroke-width="2.5"/>
  <text x="30" y="286" font-size="12" font-weight="600" fill="#0369A1">海平面（参考基准 = 0 m）</text>

  <!-- Tank 1 (h1) -->
  <rect x="52" y="80" width="72" height="185" fill="#DBEAFE" stroke="#2563EB" stroke-width="2" rx="4"/>
  <text x="88" y="68" text-anchor="middle" font-size="13" font-weight="700" fill="#1D4ED8">水塔 1 (h₁)</text>
  <text x="88" y="130" text-anchor="middle" font-size="12" font-weight="600" fill="#1E40AF">高水位</text>

  <!-- Tank 2 (h2) -->
  <rect x="212" y="160" width="72" height="105" fill="#E0F2FE" stroke="#0284C7" stroke-width="2" rx="4"/>
  <text x="248" y="148" text-anchor="middle" font-size="13" font-weight="700" fill="#0369A1">水塔 2 (h₂)</text>
  <text x="248" y="208" text-anchor="middle" font-size="12" font-weight="600" fill="#075985">低水位</text>

  <!-- Pipe between Tank 1 and Tank 2 -->
  <path d="M 124 182 L 212 182" stroke="#2563EB" stroke-width="6" stroke-linecap="round"/>
  <line x1="138" y1="168" x2="196" y2="168" stroke="#2563EB" stroke-width="2" marker-end="url(#arr-blue-1)"/>
  <text x="168" y="156" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1D4ED8">水流 ∝ h₁ − h₂</text>

  <!-- Right Panel: 3-Node Circuit with Reference Ground -->
  <text x="508" y="28" text-anchor="middle" font-size="14" font-weight="700" fill="#1E293B">电路映射：节点电位与参考地 (n = 3)</text>

  <!-- Top Wires & Nodes -->
  <line x1="385" y1="95" x2="465" y2="95" stroke="#DC2626" stroke-width="3" data-node-id="node_v1"/>
  <line x1="545" y1="95" x2="625" y2="95" stroke="#2563EB" stroke-width="3" data-node-id="node_v2"/>
  <line x1="385" y1="245" x2="625" y2="245" stroke="#16A34A" stroke-width="3" data-node-id="node_gnd"/>

  <!-- Independent Current Source Is on left (x=385) -->
  <line x1="385" y1="95" x2="385" y2="145" stroke="#334155" stroke-width="2"/>
  <circle cx="385" cy="170" r="22" fill="#FFFFFF" stroke="#334155" stroke-width="2" data-source-id="src_Is1"/>
  <line x1="385" y1="183" x2="385" y2="157" stroke="#DC2626" stroke-width="2.2" marker-end="url(#arr-red-1)"/>
  <line x1="385" y1="192" x2="385" y2="245" stroke="#334155" stroke-width="2"/>
  <text x="355" y="175" text-anchor="end" font-size="13" font-weight="700" fill="#334155">Iₛ</text>

  <!-- Resistor R1 (v1 to ground, x=455) -->
  <line x1="455" y1="95" x2="455" y2="135" stroke="#334155" stroke-width="2"/>
  <polyline points="455,135 446,143 464,155 446,167 464,179 446,191 455,199" fill="none" stroke="#334155" stroke-width="2" data-branch-id="branch_R1"/>
  <line x1="455" y1="199" x2="455" y2="245" stroke="#334155" stroke-width="2"/>
  <text x="474" y="172" font-size="13" font-weight="600" fill="#334155">R₁</text>

  <!-- Resistor R2 (between v1 and v2, y=95) -->
  <polyline points="465,95 473,86 485,104 497,86 509,104 521,86 533,104 545,95" fill="none" stroke="#334155" stroke-width="2" data-branch-id="branch_R2"/>
  <text x="505" y="76" text-anchor="middle" font-size="13" font-weight="600" fill="#334155">R₂</text>

  <!-- Resistor R3 (v2 to ground, x=625) -->
  <line x1="625" y1="95" x2="625" y2="135" stroke="#334155" stroke-width="2"/>
  <polyline points="625,135 616,143 634,155 616,167 634,179 616,191 625,199" fill="none" stroke="#334155" stroke-width="2" data-branch-id="branch_R3"/>
  <line x1="625" y1="199" x2="625" y2="245" stroke="#334155" stroke-width="2"/>
  <text x="644" y="172" font-size="13" font-weight="600" fill="#334155">R₃</text>

  <!-- Node Bubbles -->
  <circle cx="455" cy="95" r="5" fill="#DC2626"/>
  <rect x="405" y="54" width="46" height="24" rx="12" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
  <text x="428" y="70" text-anchor="middle" font-size="13" font-weight="700" fill="#B91C1C">v₁</text>

  <circle cx="565" cy="95" r="5" fill="#2563EB"/>
  <rect x="560" y="54" width="46" height="24" rx="12" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>
  <text x="583" y="70" text-anchor="middle" font-size="13" font-weight="700" fill="#1D4ED8">v₂</text>

  <!-- Ground Symbol -->
  <line x1="505" y1="245" x2="505" y2="265" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="487" y1="265" x2="523" y2="265" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="493" y1="272" x2="517" y2="272" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="499" y1="279" x2="511" y2="279" stroke="#16A34A" stroke-width="2.5"/>
  <rect x="532" y="256" width="112" height="24" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5"/>
  <text x="588" y="272" text-anchor="middle" font-size="12" font-weight="700" fill="#15803D">参考地 = 0 V</text>
</svg>`;

export const SVG_ACT2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 315" width="680" height="315" font-family="system-ui, -apple-system, sans-serif">
  <defs>
    <marker id="arr-red-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626"/>
    </marker>
    <marker id="arr-blue-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB"/>
    </marker>
    <marker id="arr-green-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#16A34A"/>
    </marker>
  </defs>
  <rect width="680" height="315" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="340" y="28" text-anchor="middle" font-size="14" font-weight="700" fill="#1E293B">“统一流出法”：站在当前节点看所有电阻支路（热身电路：5 A, 3 Ω, 6 Ω, 6 Ω）</text>

  <!-- Left Source 5 A -->
  <line x1="90" y1="120" x2="90" y2="158" stroke="#334155" stroke-width="2"/>
  <circle cx="90" cy="182" r="24" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
  <line x1="90" y1="196" x2="90" y2="168" stroke="#16A34A" stroke-width="2.5" marker-end="url(#arr-green-2)"/>
  <line x1="90" y1="206" x2="90" y2="258" stroke="#334155" stroke-width="2"/>
  <text x="56" y="187" text-anchor="end" font-size="13" font-weight="700" fill="#15803D">5 A</text>

  <!-- Node v1 bus -->
  <line x1="90" y1="120" x2="275" y2="120" stroke="#DC2626" stroke-width="3"/>
  <!-- Node v2 bus -->
  <line x1="395" y1="120" x2="580" y2="120" stroke="#2563EB" stroke-width="3"/>
  <!-- Ground bus -->
  <line x1="90" y1="258" x2="580" y2="258" stroke="#475569" stroke-width="2.5"/>

  <!-- R1 = 3 ohm (v1 to ground, x=205) -->
  <line x1="205" y1="120" x2="205" y2="152" stroke="#334155" stroke-width="2"/>
  <polyline points="205,152 195,160 215,172 195,184 215,196 195,208 205,216" fill="none" stroke="#334155" stroke-width="2"/>
  <line x1="205" y1="216" x2="205" y2="258" stroke="#334155" stroke-width="2"/>
  <text x="186" y="190" text-anchor="end" font-size="13" font-weight="700" fill="#334155">R₁ = 3 Ω</text>

  <!-- Outgoing arrow from v1 down R1 -->
  <line x1="224" y1="136" x2="224" y2="174" stroke="#DC2626" stroke-width="2" marker-end="url(#arr-red-2)"/>
  <text x="232" y="160" font-size="12" font-weight="700" fill="#B91C1C">(v₁ − 0)/3</text>

  <!-- R2 = 6 ohm (between v1 and v2, y=120) -->
  <polyline points="275,120 285,110 301,130 317,110 333,130 349,110 365,130 381,110 395,120" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="335" y="148" text-anchor="middle" font-size="13" font-weight="700" fill="#334155">R₂ = 6 Ω</text>

  <!-- Perspective 1: Standing at v1 (top red arrow right) -->
  <line x1="275" y1="88" x2="395" y2="88" stroke="#DC2626" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arr-red-2)"/>
  <rect x="265" y="52" width="140" height="24" rx="6" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.2"/>
  <text x="335" y="68" text-anchor="middle" font-size="11.5" font-weight="700" fill="#B91C1C">站 v₁ 看：(v₁ − v₂)/6</text>

  <!-- Perspective 2: Standing at v2 (bottom blue arrow left) -->
  <line x1="395" y1="168" x2="275" y2="168" stroke="#2563EB" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arr-blue-2)"/>
  <rect x="265" y="178" width="140" height="24" rx="6" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.2"/>
  <text x="335" y="194" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1D4ED8">站 v₂ 看：(v₂ − v₁)/6</text>

  <!-- R3 = 6 ohm (v2 to ground, x=580) -->
  <line x1="580" y1="120" x2="580" y2="152" stroke="#334155" stroke-width="2"/>
  <polyline points="580,152 570,160 590,172 570,184 590,196 570,208 580,216" fill="none" stroke="#334155" stroke-width="2"/>
  <line x1="580" y1="216" x2="580" y2="258" stroke="#334155" stroke-width="2"/>
  <text x="600" y="190" font-size="13" font-weight="700" fill="#334155">R₃ = 6 Ω</text>

  <!-- Outgoing arrow from v2 down R3 -->
  <line x1="560" y1="136" x2="560" y2="174" stroke="#2563EB" stroke-width="2" marker-end="url(#arr-blue-2)"/>
  <text x="552" y="160" text-anchor="end" font-size="12" font-weight="700" fill="#1D4ED8">(v₂ − 0)/6</text>

  <!-- Node Bubbles -->
  <circle cx="205" cy="120" r="5.5" fill="#DC2626"/>
  <rect x="142" y="76" width="52" height="26" rx="13" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
  <text x="168" y="94" text-anchor="middle" font-size="13" font-weight="700" fill="#B91C1C">v₁</text>

  <circle cx="485" cy="120" r="5.5" fill="#2563EB"/>
  <rect x="460" y="76" width="52" height="26" rx="13" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>
  <text x="486" y="94" text-anchor="middle" font-size="13" font-weight="700" fill="#1D4ED8">v₂</text>

  <!-- Ground Symbol -->
  <line x1="335" y1="258" x2="335" y2="276" stroke="#475569" stroke-width="2.5"/>
  <line x1="317" y1="276" x2="353" y2="276" stroke="#475569" stroke-width="2.5"/>
  <line x1="323" y1="283" x2="347" y2="283" stroke="#475569" stroke-width="2.5"/>
  <line x1="329" y1="290" x2="341" y2="290" stroke="#475569" stroke-width="2.5"/>
  <text x="364" y="285" font-size="12" font-weight="700" fill="#475569">参考地 (0 V)</text>
</svg>`;

export const SVG_ACT3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 340" width="680" height="340" font-family="system-ui, -apple-system, sans-serif">
  <defs>
    <marker id="arr-red-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626"/>
    </marker>
    <marker id="arr-amber-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706"/>
    </marker>
    <marker id="arr-blue-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB"/>
    </marker>
  </defs>
  <rect width="680" height="340" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="340" y="26" text-anchor="middle" font-size="14" font-weight="700" fill="#1E293B">经典例题 1：含两个独立电流源的 2 节点电路（Sadiku 3.2 核心模型）</text>

  <!-- Top Bridging Current Source Is2 = 10 A (from v2 to v1, arrow LEFT) -->
  <line x1="210" y1="145" x2="210" y2="70" stroke="#DC2626" stroke-width="2.5"/>
  <line x1="210" y1="70" x2="316" y2="70" stroke="#334155" stroke-width="2"/>
  <circle cx="340" cy="70" r="22" fill="#FEF3C7" stroke="#D97706" stroke-width="2.2" data-source-id="src_Is2"/>
  <line x1="354" y1="70" x2="326" y2="70" stroke="#D97706" stroke-width="2.5" marker-end="url(#arr-amber-3)"/>
  <line x1="362" y1="70" x2="470" y2="70" stroke="#334155" stroke-width="2"/>
  <line x1="470" y1="70" x2="470" y2="145" stroke="#2563EB" stroke-width="2.5"/>
  <text x="340" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="#B45309">Iₛ₂ = 10 A（从 v₂ 流入 v₁）</text>

  <!-- Node v1 Horizontal Bus -->
  <line x1="105" y1="145" x2="280" y2="145" stroke="#DC2626" stroke-width="3" data-node-id="node_v1"/>
  <!-- Node v2 Horizontal Bus -->
  <line x1="400" y1="145" x2="575" y2="145" stroke="#2563EB" stroke-width="3" data-node-id="node_v2"/>
  <!-- Reference Ground Bus -->
  <line x1="105" y1="280" x2="575" y2="280" stroke="#16A34A" stroke-width="3" data-node-id="node_gnd"/>

  <!-- Left Independent Current Source Is1 = 5 A (entering v1 from ground) -->
  <line x1="105" y1="145" x2="105" y2="188" stroke="#334155" stroke-width="2"/>
  <circle cx="105" cy="212" r="22" fill="#FEE2E2" stroke="#DC2626" stroke-width="2" data-source-id="src_Is1"/>
  <line x1="105" y1="226" x2="105" y2="198" stroke="#DC2626" stroke-width="2.5" marker-end="url(#arr-red-3)"/>
  <line x1="105" y1="234" x2="105" y2="280" stroke="#334155" stroke-width="2"/>
  <text x="74" y="216" text-anchor="end" font-size="13" font-weight="700" fill="#B91C1C">Iₛ₁ = 5 A</text>

  <!-- Resistor R1 = 2 ohm (v1 to ground, x=210) -->
  <line x1="210" y1="145" x2="210" y2="178" stroke="#334155" stroke-width="2"/>
  <polyline points="210,178 200,186 220,198 200,210 220,222 200,234 210,242" fill="none" stroke="#334155" stroke-width="2" data-branch-id="branch_R1"/>
  <line x1="210" y1="242" x2="210" y2="280" stroke="#334155" stroke-width="2"/>
  <text x="192" y="214" text-anchor="end" font-size="13" font-weight="700" fill="#334155">R₁ = 2 Ω</text>
  <!-- Branch current i1 arrow -->
  <line x1="230" y1="168" x2="230" y2="205" stroke="#DC2626" stroke-width="2" marker-end="url(#arr-red-3)"/>
  <text x="240" y="191" font-size="12" font-weight="700" fill="#B91C1C">i₁</text>

  <!-- Resistor R2 = 4 ohm (v1 to v2, y=145) -->
  <polyline points="280,145 290,135 306,155 322,135 338,155 354,135 370,155 386,135 400,145" fill="none" stroke="#334155" stroke-width="2" data-branch-id="branch_R2"/>
  <text x="340" y="175" text-anchor="middle" font-size="13" font-weight="700" fill="#334155">R₂ = 4 Ω</text>
  <!-- Branch current i2 arrow -->
  <line x1="312" y1="122" x2="368" y2="122" stroke="#2563EB" stroke-width="2" marker-end="url(#arr-blue-3)"/>
  <text x="340" y="114" text-anchor="middle" font-size="12" font-weight="700" fill="#1D4ED8">i₂</text>

  <!-- Resistor R3 = 6 ohm (v2 to ground, x=575) -->
  <line x1="575" y1="145" x2="575" y2="178" stroke="#334155" stroke-width="2"/>
  <polyline points="575,178 565,186 585,198 565,210 585,222 565,234 575,242" fill="none" stroke="#334155" stroke-width="2" data-branch-id="branch_R3"/>
  <line x1="575" y1="242" x2="575" y2="280" stroke="#334155" stroke-width="2"/>
  <text x="594" y="214" font-size="13" font-weight="700" fill="#334155">R₃ = 6 Ω</text>
  <!-- Branch current i3 arrow -->
  <line x1="554" y1="168" x2="554" y2="205" stroke="#2563EB" stroke-width="2" marker-end="url(#arr-blue-3)"/>
  <text x="544" y="191" text-anchor="end" font-size="12" font-weight="700" fill="#1D4ED8">i₃</text>

  <!-- Node Bubbles -->
  <circle cx="210" cy="145" r="5.5" fill="#DC2626"/>
  <rect x="130" y="106" width="56" height="26" rx="13" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
  <text x="158" y="124" text-anchor="middle" font-size="13" font-weight="700" fill="#B91C1C">v₁</text>

  <circle cx="470" cy="145" r="5.5" fill="#2563EB"/>
  <rect x="492" y="106" width="56" height="26" rx="13" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>
  <text x="520" y="124" text-anchor="middle" font-size="13" font-weight="700" fill="#1D4ED8">v₂</text>

  <!-- Ground Symbol -->
  <line x1="340" y1="280" x2="340" y2="298" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="322" y1="298" x2="358" y2="298" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="328" y1="305" x2="352" y2="305" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="334" y1="312" x2="346" y2="312" stroke="#16A34A" stroke-width="2.5"/>
  <text x="370" y="308" font-size="12" font-weight="700" fill="#15803D">参考节点 0 (0 V)</text>
</svg>`;

export const SVG_ACT4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 350" width="680" height="350" font-family="system-ui, -apple-system, sans-serif">
  <defs>
    <marker id="arr-red-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626"/>
    </marker>
    <marker id="arr-orange-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#EA580C"/>
    </marker>
    <marker id="arr-purple-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#7C3AED"/>
    </marker>
  </defs>
  <rect width="680" height="350" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="340" y="26" text-anchor="middle" font-size="14" font-weight="700" fill="#1E293B">进阶例题 2：含受控电流源 (2iₓ) 的 3 节点电路（Sadiku 3.2 进阶模型）</text>

  <!-- Top Bridging Resistor R13 = 4 ohm (between v1 and v3, y=72) -->
  <line x1="150" y1="160" x2="150" y2="72" stroke="#DC2626" stroke-width="2.5"/>
  <line x1="150" y1="72" x2="295" y2="72" stroke="#334155" stroke-width="2"/>
  <polyline points="295,72 303,62 315,82 327,62 339,82 351,62 363,82 375,62 385,72" fill="none" stroke="#334155" stroke-width="2"/>
  <line x1="385" y1="72" x2="555" y2="72" stroke="#334155" stroke-width="2"/>
  <line x1="555" y1="72" x2="555" y2="160" stroke="#7C3AED" stroke-width="2.5"/>
  <text x="340" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="#334155">R₁₃ = 4 Ω</text>

  <!-- Middle Buses: v1, v2, v3 -->
  <line x1="85" y1="160" x2="200" y2="160" stroke="#DC2626" stroke-width="3" data-node-id="node_v1"/>
  <line x1="290" y1="160" x2="405" y2="160" stroke="#2563EB" stroke-width="3" data-node-id="node_v2"/>
  <line x1="495" y1="160" x2="585" y2="160" stroke="#7C3AED" stroke-width="3" data-node-id="node_v3"/>
  <!-- Reference Ground Bus -->
  <line x1="85" y1="290" x2="585" y2="290" stroke="#16A34A" stroke-width="3" data-node-id="node_gnd"/>

  <!-- Independent Source Is = 5 A (x=85, entering v1) -->
  <line x1="85" y1="160" x2="85" y2="200" stroke="#334155" stroke-width="2"/>
  <circle cx="85" cy="224" r="22" fill="#FEE2E2" stroke="#DC2626" stroke-width="2"/>
  <line x1="85" y1="238" x2="85" y2="210" stroke="#DC2626" stroke-width="2.5" marker-end="url(#arr-red-4)"/>
  <line x1="85" y1="246" x2="85" y2="290" stroke="#334155" stroke-width="2"/>
  <text x="56" y="229" text-anchor="end" font-size="13" font-weight="700" fill="#B91C1C">5 A</text>

  <!-- R12 = 2 ohm (between v1 and v2, with control current ix) -->
  <polyline points="200,160 208,150 220,170 232,150 244,170 256,150 268,170 280,150 290,160" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="245" y="188" text-anchor="middle" font-size="13" font-weight="700" fill="#334155">R₁₂ = 2 Ω</text>
  <!-- Control Current ix arrow -->
  <line x1="215" y1="136" x2="275" y2="136" stroke="#EA580C" stroke-width="2.5" marker-end="url(#arr-orange-4)"/>
  <rect x="225" y="106" width="40" height="22" rx="6" fill="#FFEDD5" stroke="#EA580C" stroke-width="1.2"/>
  <text x="245" y="121" text-anchor="middle" font-size="12" font-weight="700" fill="#C2410C">iₓ</text>

  <!-- R2g = 4 ohm (v2 to ground, x=350) -->
  <line x1="350" y1="160" x2="350" y2="192" stroke="#334155" stroke-width="2"/>
  <polyline points="350,192 340,200 360,212 340,224 360,236 340,248 350,256" fill="none" stroke="#334155" stroke-width="2"/>
  <line x1="350" y1="256" x2="350" y2="290" stroke="#334155" stroke-width="2"/>
  <text x="368" y="229" font-size="13" font-weight="700" fill="#334155">R₂g = 4 Ω</text>

  <!-- R23 = 8 ohm (between v2 and v3) -->
  <polyline points="405,160 413,150 425,170 437,150 449,170 461,150 473,170 485,150 495,160" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="450" y="188" text-anchor="middle" font-size="13" font-weight="700" fill="#334155">R₂₃ = 8 Ω</text>

  <!-- Dependent Current Source 2*ix (Diamond at x=585, leaving v3 downward to ground) -->
  <line x1="585" y1="160" x2="585" y2="195" stroke="#334155" stroke-width="2"/>
  <polygon points="585,195 612,224 585,253 558,224" fill="#F3E8FF" stroke="#7C3AED" stroke-width="2.2"/>
  <line x1="585" y1="210" x2="585" y2="238" stroke="#7C3AED" stroke-width="2.5" marker-end="url(#arr-purple-4)"/>
  <line x1="585" y1="253" x2="585" y2="290" stroke="#334155" stroke-width="2"/>
  <text x="622" y="229" font-size="13" font-weight="700" fill="#6D28D9">2iₓ</text>

  <!-- Node Bubbles -->
  <circle cx="150" cy="160" r="5.5" fill="#DC2626"/>
  <rect x="96" y="122" width="44" height="24" rx="12" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
  <text x="118" y="138" text-anchor="middle" font-size="13" font-weight="700" fill="#B91C1C">v₁</text>

  <circle cx="350" cy="160" r="5.5" fill="#2563EB"/>
  <rect x="328" y="122" width="44" height="24" rx="12" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>
  <text x="350" y="138" text-anchor="middle" font-size="13" font-weight="700" fill="#1D4ED8">v₂</text>

  <circle cx="555" cy="160" r="5.5" fill="#7C3AED"/>
  <rect x="502" y="122" width="44" height="24" rx="12" fill="#F3E8FF" stroke="#7C3AED" stroke-width="1.5"/>
  <text x="524" y="138" text-anchor="middle" font-size="13" font-weight="700" fill="#6D28D9">v₃</text>

  <!-- Ground Symbol -->
  <line x1="350" y1="290" x2="350" y2="308" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="332" y1="308" x2="368" y2="308" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="338" y1="315" x2="362" y2="315" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="344" y1="322" x2="356" y2="322" stroke="#16A34A" stroke-width="2.5"/>
  <text x="378" y="318" font-size="12" font-weight="700" fill="#15803D">参考节点 0 (0 V)</text>
</svg>`;

export const SVG_ACT5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 300" width="680" height="300" font-family="system-ui, -apple-system, sans-serif">
  <rect width="680" height="300" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="340" y="26" text-anchor="middle" font-size="14" font-weight="700" fill="#1E293B">参考地切换不变性：节点电位整体平移 +15 V，支路压差与电流完全不变</text>
  <line x1="340" y1="42" x2="340" y2="285" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="5,5"/>

  <!-- Left: Reference at Bottom Node 0 -->
  <text x="170" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="#334155">方案 A：底部为参考地 (0 V)</text>
  <line x1="65" y1="115" x2="125" y2="115" stroke="#DC2626" stroke-width="3"/>
  <polyline points="125,115 133,106 145,124 157,106 169,124 181,106 193,124 205,115" fill="none" stroke="#334155" stroke-width="2"/>
  <line x1="205" y1="115" x2="275" y2="115" stroke="#2563EB" stroke-width="3"/>
  <line x1="85" y1="115" x2="85" y2="225" stroke="#334155" stroke-width="2"/>
  <line x1="255" y1="115" x2="255" y2="225" stroke="#334155" stroke-width="2"/>
  <line x1="65" y1="225" x2="275" y2="225" stroke="#16A34A" stroke-width="3"/>

  <!-- Left Node Badges -->
  <rect x="40" y="76" width="80" height="24" rx="12" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
  <text x="80" y="92" text-anchor="middle" font-size="12" font-weight="700" fill="#B91C1C">v₁ = +15 V</text>
  <rect x="216" y="76" width="80" height="24" rx="12" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>
  <text x="256" y="92" text-anchor="middle" font-size="12" font-weight="700" fill="#1D4ED8">v₂ = −15 V</text>
  <text x="165" y="144" text-anchor="middle" font-size="12" font-weight="700" fill="#0F172A">R₂ = 4 Ω</text>
  <rect x="96" y="156" width="144" height="44" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
  <text x="168" y="174" text-anchor="middle" font-size="11.5" font-weight="700" fill="#92400E">Δv = 15 − (−15) = 30 V</text>
  <text x="168" y="191" text-anchor="middle" font-size="11.5" font-weight="700" fill="#92400E">i₂ = 30 / 4 = 7.5 A</text>

  <!-- Left Ground -->
  <line x1="170" y1="225" x2="170" y2="242" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="154" y1="242" x2="186" y2="242" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="160" y1="249" x2="180" y2="249" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="165" y1="256" x2="175" y2="256" stroke="#16A34A" stroke-width="2.5"/>
  <text x="170" y="274" text-anchor="middle" font-size="11.5" font-weight="700" fill="#15803D">v₀ = 0 V</text>

  <!-- Right: Reference Moved to Node 2 -->
  <text x="510" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="#334155">方案 B：节点 2 改为参考地 (0 V)</text>
  <line x1="405" y1="115" x2="465" y2="115" stroke="#DC2626" stroke-width="3"/>
  <polyline points="465,115 473,106 485,124 497,106 509,124 521,106 533,124 545,115" fill="none" stroke="#334155" stroke-width="2"/>
  <line x1="545" y1="115" x2="615" y2="115" stroke="#16A34A" stroke-width="3"/>
  <line x1="425" y1="115" x2="425" y2="225" stroke="#334155" stroke-width="2"/>
  <line x1="595" y1="115" x2="595" y2="225" stroke="#334155" stroke-width="2"/>
  <line x1="405" y1="225" x2="615" y2="225" stroke="#2563EB" stroke-width="3"/>

  <!-- Right Node Badges -->
  <rect x="380" y="76" width="80" height="24" rx="12" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
  <text x="420" y="92" text-anchor="middle" font-size="12" font-weight="700" fill="#B91C1C">v₁′ = +30 V</text>
  <rect x="554" y="76" width="80" height="24" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5"/>
  <text x="594" y="92" text-anchor="middle" font-size="12" font-weight="700" fill="#15803D">v₂′ = 0 V</text>
  <text x="505" y="144" text-anchor="middle" font-size="12" font-weight="700" fill="#0F172A">R₂ = 4 Ω</text>
  <rect x="436" y="156" width="144" height="44" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
  <text x="508" y="174" text-anchor="middle" font-size="11.5" font-weight="700" fill="#92400E">Δv = 30 − 0 = 30 V</text>
  <text x="508" y="191" text-anchor="middle" font-size="11.5" font-weight="700" fill="#92400E">i₂ = 30 / 4 = 7.5 A ✓</text>

  <!-- Right Ground on Node 2 -->
  <line x1="615" y1="115" x2="635" y2="115" stroke="#16A34A" stroke-width="2"/>
  <line x1="635" y1="115" x2="635" y2="132" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="621" y1="132" x2="649" y2="132" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="626" y1="139" x2="644" y2="139" stroke="#16A34A" stroke-width="2.5"/>
  <line x1="631" y1="146" x2="639" y2="146" stroke="#16A34A" stroke-width="2.5"/>

  <rect x="466" y="242" width="88" height="24" rx="12" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.5"/>
  <text x="510" y="258" text-anchor="middle" font-size="12" font-weight="700" fill="#1D4ED8">v₀′ = +15 V</text>
</svg>`;

export const MINI_STEP1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140" width="320" height="140" font-family="system-ui, sans-serif"><rect width="320" height="140" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><line x1="40" y1="45" x2="140" y2="45" stroke="#DC2626" stroke-width="3"/><line x1="180" y1="45" x2="280" y2="45" stroke="#2563EB" stroke-width="3"/><line x1="40" y1="105" x2="280" y2="105" stroke="#16A34A" stroke-width="3"/><circle cx="90" cy="45" r="5" fill="#DC2626"/><text x="90" y="30" text-anchor="middle" font-size="12" font-weight="700" fill="#B91C1C">节点 1 (v₁)</text><circle cx="230" cy="45" r="5" fill="#2563EB"/><text x="230" y="30" text-anchor="middle" font-size="12" font-weight="700" fill="#1D4ED8">节点 2 (v₂)</text><text x="160" y="126" text-anchor="middle" font-size="12" font-weight="700" fill="#15803D">底部公共母线 = 参考节点 0 (0 V)</text></svg>`;

export const MINI_STEP2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150" width="320" height="150" font-family="system-ui, sans-serif"><rect width="320" height="150" rx="8" fill="#FFF7ED" stroke="#FDBA74"/><circle cx="150" cy="75" r="8" fill="#DC2626"/><text x="150" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="#B91C1C">节点 v₁</text><line x1="45" y1="75" x2="136" y2="75" stroke="#16A34A" stroke-width="2.5"/><text x="86" y="66" text-anchor="middle" font-size="11.5" font-weight="700" fill="#15803D">5 A 流入 →</text><line x1="150" y1="15" x2="150" y2="62" stroke="#D97706" stroke-width="2.5"/><text x="215" y="32" text-anchor="middle" font-size="11.5" font-weight="700" fill="#B45309">↓ 10 A 流入</text><line x1="150" y1="85" x2="150" y2="135" stroke="#DC2626" stroke-width="2"/><text x="108" y="122" text-anchor="middle" font-size="11.5" font-weight="700" fill="#B91C1C">↓ v₁/2</text><line x1="162" y1="75" x2="275" y2="75" stroke="#DC2626" stroke-width="2"/><text x="232" y="95" text-anchor="middle" font-size="11.5" font-weight="700" fill="#B91C1C">→ (v₁−v₂)/4</text></svg>`;

export const MINI_STEP3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150" width="320" height="150" font-family="system-ui, sans-serif"><rect width="320" height="150" rx="8" fill="#EFF6FF" stroke="#93C5FD"/><circle cx="165" cy="75" r="8" fill="#2563EB"/><text x="165" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="#1D4ED8">节点 v₂</text><line x1="165" y1="62" x2="165" y2="18" stroke="#D97706" stroke-width="2.5"/><text x="230" y="32" text-anchor="middle" font-size="11.5" font-weight="700" fill="#B45309">↑ 10 A 流出</text><line x1="152" y1="75" x2="45" y2="75" stroke="#2563EB" stroke-width="2"/><text x="95" y="95" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1D4ED8">← (v₂−v₁)/4</text><line x1="165" y1="85" x2="165" y2="135" stroke="#2563EB" stroke-width="2"/><text x="215" y="122" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1D4ED8">↓ v₂/6</text></svg>`;

export const MINI_STEP4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="320" height="120" font-family="system-ui, sans-serif"><rect width="320" height="120" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><text x="160" y="34" text-anchor="middle" font-size="13" font-weight="700" fill="#1E293B">标准方程组（消元台）</text><text x="160" y="64" text-anchor="middle" font-size="13" font-weight="700" fill="#B91C1C">(1)  3v₁ − v₂ = 60</text><text x="160" y="92" text-anchor="middle" font-size="13" font-weight="700" fill="#1D4ED8">(2) −3v₁ + 5v₂ = −120</text></svg>`;

export const MINI_STEP5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" width="320" height="130" font-family="system-ui, sans-serif"><rect width="320" height="130" rx="8" fill="#F0FDF4" stroke="#86EFAC"/><rect x="28" y="28" width="110" height="32" rx="10" fill="#FEE2E2" stroke="#DC2626"/><text x="83" y="49" text-anchor="middle" font-size="13" font-weight="700" fill="#B91C1C">v₁ = ?</text><rect x="182" y="28" width="110" height="32" rx="10" fill="#DBEAFE" stroke="#2563EB"/><text x="237" y="49" text-anchor="middle" font-size="13" font-weight="700" fill="#1D4ED8">v₂ = −15 V</text><text x="160" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#15803D">i₃ = v₂/6 = ?（真实方向？）</text></svg>`;

/** act 3's circuit again, for the guided example (marker ids renamed so they stay unique) */
export const PROBLEM = SVG_ACT3.replace(/arr-(red|amber|blue)-3/g, 'g-arr-$1-3');
