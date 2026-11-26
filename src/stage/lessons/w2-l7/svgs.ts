// W2-L7 diagrams. The sheet's SVGs (SHEET_*) are copied as written, drawn for a dark canvas; the
// exported SVG_* are their light-theme versions (lightSvg). Fixes made here before recolouring
// (colours lightSvg does not map, so they would stay pale or dark on white):
//  - act 5, panel ③: text #fecdd3 → #9f1239 (it sat on a #fee2e2 box), box #052e16 → #064e3b
//    (→ #d1fae5), text #bbf7d0 → #86efac (→ #15803d); the "⚠" glyph is dropped (no emoji in
//    the UI) and drawn as a small triangle instead.
// Added (the sheet has none): the 3.5 negative-resistance figure, the guided example's problem
// figure and the four self-test figures, drawn in the sheet's style and recoloured the same way.

import { lightSvg } from '../../svgTheme';

const SHEET_ACT1 = `<svg viewBox="0 0 860 270" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:12px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
  </defs>
  <text x="24" y="30" fill="#e2e8f0" font-size="15" font-weight="700">戴维南黑盒等效四步法（端口 a–b 外部完全等效）</text>

  <!-- Step 1: 拆负载 -->
  <g id="stage-step-1" transform="translate(20,50)">
    <rect x="0" y="0" width="185" height="195" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="12" y="22" fill="#38bdf8" font-size="12" font-weight="700">STEP 1：拆下负载 R_L</text>
    <rect x="16" y="48" width="76" height="90" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
    <text x="54" y="88" fill="#cbd5e1" font-size="11" text-anchor="middle">固定线性</text>
    <text x="54" y="105" fill="#cbd5e1" font-size="11" text-anchor="middle">网络 A</text>
    <line x1="92" y1="68" x2="128" y2="68" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="92" y1="118" x2="128" y2="118" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="128" cy="68" r="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="128" cy="118" r="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <text x="128" y="58" fill="#38bdf8" font-size="11" text-anchor="middle">a</text>
    <text x="128" y="135" fill="#38bdf8" font-size="11" text-anchor="middle">b</text>
    <!-- Detached RL -->
    <line x1="138" y1="68" x2="156" y2="68" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>
    <line x1="138" y1="118" x2="156" y2="118" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>
    <rect x="148" y="75" width="16" height="36" fill="none" stroke="#f59e0b" stroke-width="2"/>
    <line x1="156" y1="68" x2="156" y2="75" stroke="#f59e0b" stroke-width="1.5"/>
    <line x1="156" y1="111" x2="156" y2="118" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="169" y="98" fill="#f59e0b" font-size="11">R_L</text>
    <text x="92" y="176" fill="#94a3b8" font-size="11" text-anchor="middle">将端口 a–b 与负载分离</text>
  </g>

  <line x1="208" y1="145" x2="226" y2="145" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-cyan)"/>

  <!-- Step 2: 测 v_oc -->
  <g id="stage-step-2" transform="translate(230,50)">
    <rect x="0" y="0" width="185" height="195" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="12" y="22" fill="#38bdf8" font-size="12" font-weight="700">STEP 2：求开路电压</text>
    <rect x="16" y="48" width="76" height="90" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
    <text x="54" y="88" fill="#cbd5e1" font-size="11" text-anchor="middle">含全部电源</text>
    <text x="54" y="105" fill="#cbd5e1" font-size="11" text-anchor="middle">网络 A</text>
    <line x1="92" y1="68" x2="132" y2="68" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="92" y1="118" x2="132" y2="118" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="132" cy="68" r="4" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <circle cx="132" cy="118" r="4" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <text x="150" y="72" fill="#22c55e" font-size="12" font-weight="700">+</text>
    <text x="152" y="97" fill="#22c55e" font-size="12" font-weight="700">v_oc</text>
    <text x="150" y="122" fill="#22c55e" font-size="12" font-weight="700">−</text>
    <text x="92" y="176" fill="#22c55e" font-size="11" text-anchor="middle">V_Th = v_oc (端口开路)</text>
  </g>

  <line x1="418" y1="145" x2="436" y2="145" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-cyan)"/>

  <!-- Step 3: 求 R_Th -->
  <g id="stage-step-3" transform="translate(440,50)">
    <rect x="0" y="0" width="185" height="195" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="12" y="22" fill="#38bdf8" font-size="12" font-weight="700">STEP 3：求等效电阻</text>
    <rect x="16" y="48" width="76" height="90" rx="6" fill="#0f172a" stroke="#a855f7" stroke-width="2"/>
    <text x="54" y="84" fill="#d8b4fe" font-size="10.5" text-anchor="middle">独立源置零</text>
    <text x="54" y="102" fill="#f43f5e" font-size="10.5" text-anchor="middle">受控源保留!</text>
    <line x1="92" y1="68" x2="128" y2="68" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="92" y1="118" x2="128" y2="118" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="128" cy="68" r="4" fill="#0f172a" stroke="#a855f7" stroke-width="2"/>
    <circle cx="128" cy="118" r="4" fill="#0f172a" stroke="#a855f7" stroke-width="2"/>
    <text x="155" y="88" fill="#d8b4fe" font-size="11" text-anchor="middle">← 看入</text>
    <text x="155" y="105" fill="#d8b4fe" font-size="11" font-weight="700" text-anchor="middle">R_Th</text>
    <text x="92" y="166" fill="#94a3b8" font-size="10" text-anchor="middle">Case 1: 串并联化简</text>
    <text x="92" y="182" fill="#f43f5e" font-size="10" text-anchor="middle">Case 2: 外加 v_o=1V 求 i_o</text>
  </g>

  <line x1="628" y1="145" x2="646" y2="145" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-cyan)"/>

  <!-- Step 4: 接回负载 -->
  <g id="stage-step-4" transform="translate(650,50)">
    <rect x="0" y="0" width="190" height="195" rx="10" fill="#1e293b" stroke="#22c55e" stroke-width="1.5"/>
    <text x="12" y="22" fill="#22c55e" font-size="12" font-weight="700">STEP 4：等效接回 R_L</text>
    <!-- V_Th source -->
    <circle cx="38" cy="95" r="16" fill="none" stroke="#38bdf8" stroke-width="2"/>
    <text x="38" y="90" fill="#38bdf8" font-size="11" text-anchor="middle">+</text>
    <text x="38" y="106" fill="#38bdf8" font-size="11" text-anchor="middle">−</text>
    <text x="38" y="130" fill="#38bdf8" font-size="10.5" text-anchor="middle">V_Th</text>
    <!-- R_Th -->
    <line x1="38" y1="79" x2="38" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="38" y1="62" x2="64" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="64" y="54" width="38" height="16" fill="none" stroke="#a855f7" stroke-width="2"/>
    <text x="83" y="48" fill="#d8b4fe" font-size="10.5" text-anchor="middle">R_Th</text>
    <line x1="102" y1="62" x2="148" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <!-- Bottom wire -->
    <line x1="38" y1="111" x2="38" y2="138" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="38" y1="138" x2="148" y2="138" stroke="#e2e8f0" stroke-width="2"/>
    <!-- Terminals a, b -->
    <circle cx="122" cy="62" r="3.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <circle cx="122" cy="138" r="3.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <text x="122" y="52" fill="#22c55e" font-size="10.5" text-anchor="middle">a</text>
    <text x="122" y="152" fill="#22c55e" font-size="10.5" text-anchor="middle">b</text>
    <!-- Load RL -->
    <line x1="148" y1="62" x2="148" y2="80" stroke="#f59e0b" stroke-width="2"/>
    <rect x="140" y="80" width="16" height="38" fill="none" stroke="#f59e0b" stroke-width="2"/>
    <line x1="148" y1="118" x2="148" y2="138" stroke="#f59e0b" stroke-width="2"/>
    <text x="171" y="103" fill="#f59e0b" font-size="11" font-weight="700">R_L</text>
    <text x="95" y="176" fill="#22c55e" font-size="10.5" text-anchor="middle">I_L = V_Th / (R_Th + R_L)</text>
  </g>
</svg>`;

const SHEET_ACT2 = `<svg viewBox="0 0 860 280" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:12px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="24" y="28" fill="#e2e8f0" font-size="15" font-weight="700">Case 1 经典例题（Sadiku Ex. 4.8）：原电路 vs 独立源置零求 R_Th</text>

  <!-- Left: Original Circuit for V_Th -->
  <g transform="translate(20,45)">
    <rect x="0" y="0" width="400" height="215" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="14" y="24" fill="#38bdf8" font-size="12.5" font-weight="700">(a) 拆下负载测开路电压 V_Th = v_oc</text>

    <!-- Bottom GND bus -->
    <line x1="48" y1="175" x2="350" y2="175" stroke="#94a3b8" stroke-width="2.5"/>
    <text x="200" y="196" fill="#94a3b8" font-size="11" text-anchor="middle">参考地 (0 V)</text>

    <!-- Vs = 32V -->
    <line x1="48" y1="175" x2="48" y2="132" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="48" cy="112" r="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <text x="48" y="107" fill="#38bdf8" font-size="13" font-weight="700" text-anchor="middle">+</text>
    <text x="48" y="124" fill="#38bdf8" font-size="13" font-weight="700" text-anchor="middle">−</text>
    <text x="15" y="116" fill="#38bdf8" font-size="11" font-weight="700">32V</text>
    <line x1="48" y1="92" x2="48" y2="62" stroke="#e2e8f0" stroke-width="2"/>

    <!-- R1 = 4 ohm -->
    <line x1="48" y1="62" x2="80" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="80" y="53" width="48" height="18" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="104" y="46" fill="#f59e0b" font-size="11" text-anchor="middle">R₁ = 4 Ω</text>
    <line x1="128" y1="62" x2="170" y2="62" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Node 1 -->
    <circle cx="170" cy="62" r="4" fill="#22c55e"/>
    <text x="170" y="47" fill="#22c55e" font-size="11" font-weight="700" text-anchor="middle">节点 1 (v₁)</text>

    <!-- R2 = 12 ohm -->
    <line x1="170" y1="62" x2="170" y2="88" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="161" y="88" width="18" height="52" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="142" y="118" fill="#f59e0b" font-size="11" text-anchor="end">R₂=12Ω</text>
    <line x1="170" y1="140" x2="170" y2="175" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Is = 2A pointing UP -->
    <line x1="170" y1="62" x2="235" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="235" y1="62" x2="235" y2="92" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="235" cy="112" r="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <line x1="235" y1="125" x2="235" y2="100" stroke="#38bdf8" stroke-width="2"/>
    <polygon points="235,96 230,104 240,104" fill="#38bdf8"/>
    <text x="260" y="116" fill="#38bdf8" font-size="11" font-weight="700">I_s=2A</text>
    <line x1="235" y1="132" x2="235" y2="175" stroke="#e2e8f0" stroke-width="2"/>

    <!-- R3 = 1 ohm to port a -->
    <line x1="235" y1="62" x2="275" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="275" y="53" width="44" height="18" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="297" y="46" fill="#f59e0b" font-size="11" text-anchor="middle">R₃ = 1 Ω</text>
    <line x1="319" y1="62" x2="350" y2="62" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Terminals a, b -->
    <circle cx="350" cy="62" r="4.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <circle cx="350" cy="175" r="4.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <text x="364" y="66" fill="#22c55e" font-size="12" font-weight="700">a (+)</text>
    <text x="364" y="179" fill="#22c55e" font-size="12" font-weight="700">b (−)</text>
    <text x="362" y="122" fill="#22c55e" font-size="12" font-weight="700">V_Th</text>
  </g>

  <!-- Right: Dead Network for R_Th -->
  <g transform="translate(440,45)">
    <rect x="0" y="0" width="400" height="215" rx="10" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="14" y="24" fill="#d8b4fe" font-size="12.5" font-weight="700">(b) 独立源置零求 R_Th（32V 短路，2A 开路）</text>

    <!-- Bottom GND bus -->
    <line x1="48" y1="175" x2="350" y2="175" stroke="#94a3b8" stroke-width="2.5"/>

    <!-- Vs SHORTED -->
    <line x1="48" y1="175" x2="48" y2="62" stroke="#f43f5e" stroke-width="2.5" stroke-dasharray="5,3"/>
    <text x="24" y="118" fill="#f43f5e" font-size="10.5" font-weight="700" text-anchor="middle">短路</text>
    <text x="24" y="132" fill="#94a3b8" font-size="9.5" text-anchor="middle">(Vs=0)</text>

    <!-- R1 = 4 ohm -->
    <line x1="48" y1="62" x2="80" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="80" y="53" width="48" height="18" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="104" y="46" fill="#f59e0b" font-size="11" text-anchor="middle">R₁ = 4 Ω</text>
    <line x1="128" y1="62" x2="170" y2="62" stroke="#e2e8f0" stroke-width="2"/>

    <!-- R2 = 12 ohm -->
    <circle cx="170" cy="62" r="4" fill="#d8b4fe"/>
    <line x1="170" y1="62" x2="170" y2="88" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="161" y="88" width="18" height="52" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="142" y="118" fill="#f59e0b" font-size="11" text-anchor="end">R₂=12Ω</text>
    <line x1="170" y1="140" x2="170" y2="175" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Is OPEN -->
    <line x1="170" y1="62" x2="275" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="230" y1="62" x2="230" y2="95" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
    <line x1="230" y1="140" x2="230" y2="175" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
    <text x="230" y="115" fill="#f43f5e" font-size="10.5" font-weight="700" text-anchor="middle">开路</text>
    <text x="230" y="129" fill="#94a3b8" font-size="9.5" text-anchor="middle">(Is=0)</text>

    <!-- R3 = 1 ohm -->
    <rect x="275" y="53" width="44" height="18" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="297" y="46" fill="#f59e0b" font-size="11" text-anchor="middle">R₃ = 1 Ω</text>
    <line x1="319" y1="62" x2="350" y2="62" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Terminals & R_Th arrow -->
    <circle cx="350" cy="62" r="4.5" fill="#0f172a" stroke="#a855f7" stroke-width="2"/>
    <circle cx="350" cy="175" r="4.5" fill="#0f172a" stroke="#a855f7" stroke-width="2"/>
    <text x="364" y="66" fill="#d8b4fe" font-size="12" font-weight="700">a</text>
    <text x="364" y="179" fill="#d8b4fe" font-size="12" font-weight="700">b</text>
    <text x="342" y="114" fill="#d8b4fe" font-size="11.5" font-weight="700" text-anchor="middle">← R_Th</text>
    <text x="330" y="132" fill="#22c55e" font-size="11" text-anchor="middle">R₃+(R₁∥R₂)</text>
    <text x="200" y="198" fill="#d8b4fe" font-size="11" text-anchor="middle">R₁ 与 R₂ 并联，再与 R₃ 串联 → R_Th = 4 Ω</text>
  </g>
</svg>`;

const SHEET_ACT3 = `<svg viewBox="0 0 860 285" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:12px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="24" y="28" fill="#e2e8f0" font-size="15" font-weight="700">Case 2 含受控源核心例题：原电路（求 V_Th） vs 外加 v_o = 1 V 测试源（求 R_Th）</text>

  <!-- Left: Original Circuit -->
  <g transform="translate(20,45)">
    <rect x="0" y="0" width="400" height="220" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="14" y="24" fill="#38bdf8" font-size="12.5" font-weight="700">(a) 原电路求开路电压 V_Th = v_oc</text>

    <line x1="48" y1="180" x2="352" y2="180" stroke="#94a3b8" stroke-width="2.5"/>

    <!-- Dependent Voltage Source 2vx (diamond) -->
    <line x1="48" y1="180" x2="48" y2="136" stroke="#e2e8f0" stroke-width="2"/>
    <polygon points="48,92 68,114 48,136 28,114" fill="#0f172a" stroke="#f43f5e" stroke-width="2"/>
    <text x="48" y="109" fill="#f43f5e" font-size="12" font-weight="700" text-anchor="middle">+</text>
    <text x="48" y="126" fill="#f43f5e" font-size="12" font-weight="700" text-anchor="middle">−</text>
    <text x="22" y="96" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">2v_x</text>
    <line x1="48" y1="92" x2="48" y2="62" stroke="#e2e8f0" stroke-width="2"/>

    <!-- R1 = 4 ohm -->
    <line x1="48" y1="62" x2="82" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="82" y="53" width="46" height="18" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="105" y="46" fill="#f59e0b" font-size="11" text-anchor="middle">R₁ = 4 Ω</text>
    <line x1="128" y1="62" x2="170" y2="62" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Node 1 & R2 = 2 ohm with vx -->
    <circle cx="170" cy="62" r="4" fill="#22c55e"/>
    <text x="170" y="46" fill="#22c55e" font-size="11" font-weight="700" text-anchor="middle">节点 1 (v₁)</text>
    <line x1="170" y1="62" x2="170" y2="90" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="161" y="90" width="18" height="52" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="148" y="118" fill="#f59e0b" font-size="10.5" text-anchor="end">R₂=2Ω</text>
    <text x="187" y="98" fill="#f43f5e" font-size="11" font-weight="700">+</text>
    <text x="187" y="119" fill="#f43f5e" font-size="11" font-weight="700">v_x</text>
    <text x="187" y="140" fill="#f43f5e" font-size="11" font-weight="700">−</text>
    <line x1="170" y1="142" x2="170" y2="180" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Is = 5A pointing UP -->
    <line x1="170" y1="62" x2="238" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="238" y1="62" x2="238" y2="94" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="238" cy="114" r="19" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <line x1="238" y1="126" x2="238" y2="103" stroke="#38bdf8" stroke-width="2"/>
    <polygon points="238,98 233,106 243,106" fill="#38bdf8"/>
    <text x="262" y="118" fill="#38bdf8" font-size="11" font-weight="700">5 A</text>
    <line x1="238" y1="133" x2="238" y2="180" stroke="#e2e8f0" stroke-width="2"/>

    <!-- R3 = 6 ohm -->
    <line x1="238" y1="62" x2="278" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="278" y="53" width="44" height="18" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="300" y="46" fill="#f59e0b" font-size="11" text-anchor="middle">R₃ = 6 Ω</text>
    <line x1="322" y1="62" x2="352" y2="62" stroke="#e2e8f0" stroke-width="2"/>

    <circle cx="352" cy="62" r="4.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <circle cx="352" cy="180" r="4.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <text x="366" y="66" fill="#22c55e" font-size="12" font-weight="700">a</text>
    <text x="366" y="184" fill="#22c55e" font-size="12" font-weight="700">b</text>
    <text x="362" y="124" fill="#22c55e" font-size="11.5" font-weight="700">V_Th</text>
    <text x="200" y="204" fill="#94a3b8" font-size="11" text-anchor="middle">开路时 i(R₃)=0 → V_Th = v₁ = 20 V</text>
  </g>

  <!-- Right: Test Source vo = 1V -->
  <g transform="translate(440,45)">
    <rect x="0" y="0" width="400" height="220" rx="10" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="14" y="24" fill="#fda4af" font-size="12.5" font-weight="700">(b) 独立源 5A 开路、保留 2v_x，外加测试源 v_o = 1 V</text>

    <line x1="48" y1="180" x2="358" y2="180" stroke="#94a3b8" stroke-width="2.5"/>

    <!-- Dependent Voltage Source 2vx RETAINED -->
    <line x1="48" y1="180" x2="48" y2="136" stroke="#e2e8f0" stroke-width="2"/>
    <polygon points="48,92 68,114 48,136 28,114" fill="#0f172a" stroke="#f43f5e" stroke-width="2.5"/>
    <text x="48" y="109" fill="#f43f5e" font-size="12" font-weight="700" text-anchor="middle">+</text>
    <text x="48" y="126" fill="#f43f5e" font-size="12" font-weight="700" text-anchor="middle">−</text>
    <text x="22" y="96" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">2v_x</text>
    <text x="48" y="156" fill="#fda4af" font-size="9.5" text-anchor="middle">保留!</text>
    <line x1="48" y1="92" x2="48" y2="62" stroke="#e2e8f0" stroke-width="2"/>

    <!-- R1 = 4 ohm -->
    <line x1="48" y1="62" x2="82" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="82" y="53" width="46" height="18" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="105" y="46" fill="#f59e0b" font-size="11" text-anchor="middle">R₁ = 4 Ω</text>
    <line x1="128" y1="62" x2="170" y2="62" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Node 1 & R2 = 2 ohm -->
    <circle cx="170" cy="62" r="4" fill="#22c55e"/>
    <text x="170" y="46" fill="#22c55e" font-size="11" font-weight="700" text-anchor="middle">v₁</text>
    <line x1="170" y1="62" x2="170" y2="90" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="161" y="90" width="18" height="52" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="148" y="118" fill="#f59e0b" font-size="10.5" text-anchor="end">R₂=2Ω</text>
    <text x="187" y="119" fill="#f43f5e" font-size="11" font-weight="700">v_x</text>
    <line x1="170" y1="142" x2="170" y2="180" stroke="#e2e8f0" stroke-width="2"/>

    <!-- 5A OPEN -->
    <line x1="170" y1="62" x2="255" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <text x="220" y="116" fill="#64748b" font-size="10" text-anchor="middle">5A 已开路</text>

    <!-- R3 = 6 ohm -->
    <rect x="255" y="53" width="44" height="18" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="277" y="46" fill="#f59e0b" font-size="11" text-anchor="middle">R₃ = 6 Ω</text>
    <line x1="299" y1="62" x2="358" y2="62" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Current io arrow entering port a -->
    <line x1="342" y1="48" x2="312" y2="48" stroke="#38bdf8" stroke-width="2"/>
    <polygon points="308,48 316,44 316,52" fill="#38bdf8"/>
    <text x="328" y="42" fill="#38bdf8" font-size="11.5" font-weight="700" text-anchor="middle">i_o</text>

    <!-- Test Voltage Source vo = 1V at port a-b -->
    <circle cx="318" cy="62" r="3.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <circle cx="318" cy="180" r="3.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <line x1="358" y1="62" x2="358" y2="95" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="358" cy="116" r="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
    <text x="358" y="111" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">+</text>
    <text x="358" y="128" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">−</text>
    <text x="358" y="152" fill="#38bdf8" font-size="10.5" font-weight="700" text-anchor="middle">v_o=1V</text>
    <line x1="358" y1="136" x2="358" y2="180" stroke="#38bdf8" stroke-width="2"/>

    <text x="200" y="204" fill="#22c55e" font-size="11" text-anchor="middle">v₁ = 0.4 V → i_o = 0.1 A → R_Th = 1/0.1 = 10 Ω</text>
  </g>
</svg>`;

const SHEET_ACT4 = `<svg viewBox="0 0 860 300" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:12px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="24" y="28" fill="#e2e8f0" font-size="15" font-weight="700">戴维南 ↔ 诺顿对偶互换与端口 v–i 特性直线（以 Case 1：V_Th=30V, R_Th=4Ω, I_N=7.5A 为例）</text>

  <!-- Left: Thevenin <-> Norton Equivalence -->
  <g transform="translate(20,48)">
    <rect x="0" y="0" width="380" height="232" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="14" y="24" fill="#38bdf8" font-size="12.5" font-weight="700">(a) 戴维南等效 ↔ 诺顿等效互换</text>

    <!-- Thevenin Top -->
    <g transform="translate(15,38)">
      <text x="0" y="14" fill="#cbd5e1" font-size="11" font-weight="700">戴维南等效 (串联)</text>
      <circle cx="38" cy="52" r="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      <text x="38" y="48" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">+</text>
      <text x="38" y="62" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">−</text>
      <text x="8" y="56" fill="#38bdf8" font-size="10.5" font-weight="700">30V</text>
      <line x1="38" y1="36" x2="38" y2="26" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="38" y1="26" x2="68" y2="26" stroke="#e2e8f0" stroke-width="2"/>
      <rect x="68" y="18" width="44" height="16" fill="#0f172a" stroke="#a855f7" stroke-width="2"/>
      <text x="90" y="13" fill="#d8b4fe" font-size="10.5" text-anchor="middle">R_Th=4Ω</text>
      <line x1="112" y1="26" x2="148" y2="26" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="38" y1="68" x2="38" y2="78" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="38" y1="78" x2="148" y2="78" stroke="#e2e8f0" stroke-width="2"/>
      <circle cx="148" cy="26" r="3.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
      <circle cx="148" cy="78" r="3.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
      <text x="158" y="30" fill="#22c55e" font-size="11">a</text>
      <text x="158" y="82" fill="#22c55e" font-size="11">b</text>
    </g>

    <!-- Double Arrow -->
    <text x="190" y="112" fill="#f59e0b" font-size="13" font-weight="700" text-anchor="middle">⇄</text>
    <text x="190" y="128" fill="#f59e0b" font-size="10" text-anchor="middle">V_Th = I_N · R_Th</text>

    <!-- Norton Right/Bottom -->
    <g transform="translate(195,38)">
      <text x="20" y="14" fill="#cbd5e1" font-size="11" font-weight="700">诺顿等效 (并联)</text>
      <line x1="36" y1="26" x2="146" y2="26" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="36" y1="78" x2="146" y2="78" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="36" y1="26" x2="36" y2="36" stroke="#e2e8f0" stroke-width="2"/>
      <circle cx="36" cy="52" r="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      <line x1="36" y1="62" x2="36" y2="44" stroke="#38bdf8" stroke-width="2"/>
      <polygon points="36,40 32,47 40,47" fill="#38bdf8"/>
      <text x="36" y="94" fill="#38bdf8" font-size="10.5" font-weight="700" text-anchor="middle">I_N=7.5A</text>
      <line x1="36" y1="68" x2="36" y2="78" stroke="#e2e8f0" stroke-width="2"/>

      <line x1="94" y1="26" x2="94" y2="36" stroke="#e2e8f0" stroke-width="2"/>
      <rect x="86" y="36" width="16" height="32" fill="#0f172a" stroke="#a855f7" stroke-width="2"/>
      <text x="108" y="56" fill="#d8b4fe" font-size="10.5">R_N=4Ω</text>
      <line x1="94" y1="68" x2="94" y2="78" stroke="#e2e8f0" stroke-width="2"/>

      <circle cx="146" cy="26" r="3.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
      <circle cx="146" cy="78" r="3.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
      <text x="156" y="30" fill="#22c55e" font-size="11">a</text>
      <text x="156" y="82" fill="#22c55e" font-size="11">b</text>
    </g>

    <!-- Summary Formula Box -->
    <rect x="20" y="152" width="340" height="64" rx="8" fill="#0f172a" stroke="#334155"/>
    <text x="190" y="176" fill="#e2e8f0" font-size="11.5" font-weight="700" text-anchor="middle">三量知二求一铁律</text>
    <text x="190" y="198" fill="#22c55e" font-size="11.5" text-anchor="middle">V_Th = v_oc = 30 V  |  I_N = i_sc = 7.5 A  |  R_Th = R_N = 4 Ω</text>
  </g>

  <!-- Right: Port v-i Characteristic Line -->
  <g transform="translate(420,48)">
    <rect x="0" y="0" width="420" height="232" rx="10" fill="#1e293b" stroke="#22c55e" stroke-width="1.5"/>
    <text x="14" y="24" fill="#22c55e" font-size="12.5" font-weight="700">(b) 端口 v–i 特性直线：v = V_Th − R_Th · i</text>

    <!-- Axes -->
    <line x1="65" y1="195" x2="385" y2="195" stroke="#94a3b8" stroke-width="2"/>
    <line x1="65" y1="195" x2="65" y2="42" stroke="#94a3b8" stroke-width="2"/>
    <polygon points="390,195 382,191 382,199" fill="#94a3b8"/>
    <polygon points="65,37 61,45 69,45" fill="#94a3b8"/>
    <text x="392" y="199" fill="#cbd5e1" font-size="11.5">i (A)</text>
    <text x="58" y="45" fill="#cbd5e1" font-size="11.5" text-anchor="end">v (V)</text>

    <!-- Grid dashed lines -->
    <line x1="65" y1="114" x2="181" y2="114" stroke="#334155" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="181" y1="114" x2="181" y2="195" stroke="#334155" stroke-width="1" stroke-dasharray="4,3"/>

    <!-- Source V-I line: (0, 30V) -> (65, 60) to (7.5A, 0) -> (355, 195) -->
    <!-- Scale: x = 65 + i*(290/7.5), y = 195 - v*(135/30) = 195 - 4.5*v -->
    <!-- i=3A -> x=65+116=181; v=18V -> y=195-81=114 -->
    <line x1="65" y1="60" x2="355" y2="195" stroke="#38bdf8" stroke-width="3"/>

    <!-- Load line RL = 6 ohm: passes (0,0) and (3A, 18V) -> (181, 114) to (220, 87) -->
    <line x1="65" y1="195" x2="239" y2="73.5" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,3"/>
    <text x="244" y="75" fill="#f59e0b" font-size="11" font-weight="700">负载线 R_L = 6 Ω</text>

    <!-- Intercepts & Operating Point -->
    <circle cx="65" cy="60" r="5" fill="#22c55e"/>
    <text x="74" y="57" fill="#22c55e" font-size="11" font-weight="700">开路纵截距 V_Th = 30 V</text>

    <circle cx="355" cy="195" r="5" fill="#f43f5e"/>
    <text x="355" y="213" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">短路横截距 I_N = 7.5 A</text>

    <circle cx="181" cy="114" r="5.5" fill="#f59e0b" stroke="#0f172a" stroke-width="1.5"/>
    <text x="192" y="118" fill="#fde68a" font-size="11" font-weight="700">工作点 Q (3 A, 18 V)</text>
    <text x="181" y="211" fill="#94a3b8" font-size="10.5" text-anchor="middle">3 A</text>
    <text x="58" y="118" fill="#94a3b8" font-size="10.5" text-anchor="end">18 V</text>

    <!-- Slope label -->
    <text x="295" y="148" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">斜率 = −R_Th = −4 Ω</text>
  </g>
</svg>`;

const SHEET_ACT5 = `<svg viewBox="0 0 860 250" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:12px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="24" y="28" fill="#e2e8f0" font-size="15" font-weight="700">3D 面包板安全实测三步接线示意（1000× 缩放后：V_Th = 30 V, R_Th = 4 kΩ, I_N = 7.5 mA）</text>

  <!-- Method 1: Open Circuit V_Th -->
  <g transform="translate(20,46)">
    <rect x="0" y="0" width="260" height="184" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="12" y="22" fill="#38bdf8" font-size="12" font-weight="700">① 开路测 V_Th（DMM 电压档）</text>
    <rect x="18" y="48" width="96" height="84" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
    <text x="66" y="82" fill="#cbd5e1" font-size="10.5" text-anchor="middle">1000× 缩放</text>
    <text x="66" y="99" fill="#f59e0b" font-size="10.5" text-anchor="middle">4k / 12k / 1k</text>
    <line x1="114" y1="68" x2="164" y2="68" stroke="#ef4444" stroke-width="2"/>
    <line x1="114" y1="112" x2="164" y2="112" stroke="#94a3b8" stroke-width="2"/>
    <rect x="164" y="54" width="78" height="72" rx="6" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <text x="203" y="76" fill="#94a3b8" font-size="9.5" text-anchor="middle">DMM (DC V)</text>
    <text x="203" y="102" fill="#22c55e" font-size="14" font-weight="700" text-anchor="middle">30.00 V</text>
    <text x="130" y="160" fill="#94a3b8" font-size="10.5" text-anchor="middle">V_Th 严格不变，功耗仅 75 mW</text>
  </g>

  <!-- Method 2: Half-Voltage Method -->
  <g transform="translate(300,46)">
    <rect x="0" y="0" width="260" height="184" rx="10" fill="#1e293b" stroke="#22c55e" stroke-width="1.5"/>
    <text x="12" y="22" fill="#22c55e" font-size="12" font-weight="700">② 半压法测 R_Th（零短路最安全）</text>
    <rect x="16" y="48" width="76" height="84" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
    <text x="54" y="94" fill="#cbd5e1" font-size="10.5" text-anchor="middle">黑盒端口</text>
    <line x1="92" y1="68" x2="170" y2="68" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="92" y1="112" x2="170" y2="112" stroke="#e2e8f0" stroke-width="2"/>
    <!-- Potentiometer -->
    <line x1="130" y1="68" x2="130" y2="76" stroke="#f59e0b" stroke-width="2"/>
    <rect x="122" y="76" width="16" height="28" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <line x1="130" y1="104" x2="130" y2="112" stroke="#f59e0b" stroke-width="2"/>
    <line x1="114" y1="100" x2="146" y2="80" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="130" y="132" fill="#f59e0b" font-size="10" text-anchor="middle">调至 R_L=4kΩ</text>
    <!-- DMM -->
    <rect x="170" y="54" width="74" height="72" rx="6" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
    <text x="207" y="76" fill="#94a3b8" font-size="9.5" text-anchor="middle">V_Th / 2</text>
    <text x="207" y="102" fill="#22c55e" font-size="14" font-weight="700" text-anchor="middle">15.00 V</text>
    <text x="130" y="160" fill="#22c55e" font-size="10.5" text-anchor="middle">断电测电位器阻值 → R_Th = 4.00 kΩ</text>
  </g>

  <!-- Method 3: Safety Warning on Short-Circuit -->
  <g transform="translate(580,46)">
    <rect x="0" y="0" width="260" height="184" rx="10" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="12" y="22" fill="#fda4af" font-size="12" font-weight="700">③ 电流档直测 I_N 安全警示</text>
    <rect x="18" y="44" width="224" height="60" rx="6" fill="#450a0a" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="130" y="66" fill="#fecdd3" font-size="11" font-weight="700" text-anchor="middle">⚠ 严禁在真实低阻电源直接短路</text>
    <text x="130" y="88" fill="#fda4af" font-size="10" text-anchor="middle">原题 7.5 A 极易熔断万用表保险丝！</text>
    <rect x="18" y="112" width="224" height="54" rx="6" fill="#052e16" stroke="#22c55e" stroke-width="1.5"/>
    <text x="130" y="134" fill="#bbf7d0" font-size="10.5" font-weight="700" text-anchor="middle">✓ 本课 kΩ 限流保护下安全实测</text>
    <text x="130" y="153" fill="#4ade80" font-size="10.5" text-anchor="middle">I_N = 7.50 mA（或改用带载双点法）</text>
  </g>
</svg>`;

const SHEET_MINI1 = `<svg viewBox='0 0 360 150' xmlns='http://www.w3.org/2000/svg' style='background:#0f172a;border-radius:8px;font-family:sans-serif'><line x1='30' y1='125' x2='330' y2='125' stroke='#94a3b8' stroke-width='2'/><circle cx='30' cy='82' r='14' fill='none' stroke='#38bdf8' stroke-width='2'/><text x='30' y='86' fill='#38bdf8' font-size='9' text-anchor='middle'>12V</text><line x1='30' y1='96' x2='30' y2='125' stroke='#e2e8f0' stroke-width='2'/><line x1='30' y1='68' x2='30' y2='40' stroke='#e2e8f0' stroke-width='2'/><rect x='56' y='33' width='36' height='14' fill='none' stroke='#f59e0b' stroke-width='2'/><text x='74' y='28' fill='#f59e0b' font-size='10' text-anchor='middle'>4Ω</text><line x1='30' y1='40' x2='56' y2='40' stroke='#e2e8f0' stroke-width='2'/><line x1='92' y1='40' x2='140' y2='40' stroke='#e2e8f0' stroke-width='2'/><circle cx='140' cy='40' r='3.5' fill='#22c55e'/><text x='140' y='28' fill='#22c55e' font-size='10' text-anchor='middle'>v₁(=v_x)</text><rect x='133' y='64' width='14' height='36' fill='none' stroke='#f59e0b' stroke-width='2'/><line x1='140' y1='40' x2='140' y2='64' stroke='#e2e8f0' stroke-width='2'/><line x1='140' y1='100' x2='140' y2='125' stroke='#e2e8f0' stroke-width='2'/><text x='122' y='86' fill='#f59e0b' font-size='10' text-anchor='end'>4Ω</text><line x1='140' y1='40' x2='186' y2='40' stroke='#e2e8f0' stroke-width='2'/><rect x='186' y='33' width='36' height='14' fill='none' stroke='#f59e0b' stroke-width='2'/><text x='204' y='28' fill='#f59e0b' font-size='10' text-anchor='middle'>2Ω</text><line x1='222' y1='40' x2='315' y2='40' stroke='#e2e8f0' stroke-width='2'/><polygon points='270,66 286,82 270,98 254,82' fill='none' stroke='#f43f5e' stroke-width='2'/><text x='270' y='86' fill='#f43f5e' font-size='11' text-anchor='middle'>↑</text><text x='292' y='86' fill='#f43f5e' font-size='10'>0.25v_x</text><line x1='270' y1='40' x2='270' y2='66' stroke='#e2e8f0' stroke-width='2'/><line x1='270' y1='98' x2='270' y2='125' stroke='#e2e8f0' stroke-width='2'/><circle cx='315' cy='40' r='3.5' fill='#0f172a' stroke='#22c55e' stroke-width='2'/><circle cx='315' cy='125' r='3.5' fill='#0f172a' stroke='#22c55e' stroke-width='2'/><text x='328' y='44' fill='#22c55e' font-size='10'>a</text><text x='328' y='129' fill='#22c55e' font-size='10'>b</text></svg>`;

const SHEET_MINI2 = `<svg viewBox='0 0 360 110' xmlns='http://www.w3.org/2000/svg' style='background:#0f172a;border-radius:8px;font-family:sans-serif'><text x='180' y='34' fill='#38bdf8' font-size='12' font-weight='700' text-anchor='middle'>节点 1 KCL 联立求解</text><text x='180' y='62' fill='#e2e8f0' font-size='12' text-anchor='middle'>(v₁ − 12)/4 + v₁/4 + (v₁ − 1.5v₁)/2 = 0</text><text x='180' y='90' fill='#22c55e' font-size='11.5' text-anchor='middle'>先解出 v₁，再乘以 1.5 得 V_Th = v_a</text></svg>`;

const SHEET_MINI3 = `<svg viewBox='0 0 360 150' xmlns='http://www.w3.org/2000/svg' style='background:#0f172a;border-radius:8px;font-family:sans-serif'><line x1='30' y1='125' x2='335' y2='125' stroke='#94a3b8' stroke-width='2'/><line x1='30' y1='40' x2='30' y2='125' stroke='#f43f5e' stroke-width='2.5' stroke-dasharray='4,3'/><text x='15' y='86' fill='#f43f5e' font-size='9.5' text-anchor='middle'>短路</text><rect x='56' y='33' width='36' height='14' fill='none' stroke='#f59e0b' stroke-width='2'/><line x1='30' y1='40' x2='56' y2='40' stroke='#e2e8f0' stroke-width='2'/><line x1='92' y1='40' x2='140' y2='40' stroke='#e2e8f0' stroke-width='2'/><rect x='133' y='64' width='14' height='36' fill='none' stroke='#f59e0b' stroke-width='2'/><line x1='140' y1='40' x2='140' y2='64' stroke='#e2e8f0' stroke-width='2'/><line x1='140' y1='100' x2='140' y2='125' stroke='#e2e8f0' stroke-width='2'/><line x1='140' y1='40' x2='180' y2='40' stroke='#e2e8f0' stroke-width='2'/><rect x='180' y='33' width='36' height='14' fill='none' stroke='#f59e0b' stroke-width='2'/><line x1='216' y1='40' x2='325' y2='40' stroke='#e2e8f0' stroke-width='2'/><polygon points='258,66 274,82 258,98 242,82' fill='none' stroke='#f43f5e' stroke-width='2'/><text x='258' y='86' fill='#f43f5e' font-size='11' text-anchor='middle'>↑</text><text x='258' y='112' fill='#fda4af' font-size='9' text-anchor='middle'>保留!</text><line x1='258' y1='40' x2='258' y2='66' stroke='#e2e8f0' stroke-width='2'/><line x1='258' y1='98' x2='258' y2='125' stroke='#e2e8f0' stroke-width='2'/><circle cx='325' cy='82' r='15' fill='none' stroke='#38bdf8' stroke-width='2'/><text x='325' y='86' fill='#38bdf8' font-size='9.5' text-anchor='middle'>1V</text><line x1='325' y1='40' x2='325' y2='67' stroke='#38bdf8' stroke-width='2'/><line x1='325' y1='97' x2='325' y2='125' stroke='#38bdf8' stroke-width='2'/><text x='296' y='32' fill='#38bdf8' font-size='10'>← i_o</text></svg>`;

const SHEET_MINI4 = `<svg viewBox='0 0 360 110' xmlns='http://www.w3.org/2000/svg' style='background:#0f172a;border-radius:8px;font-family:sans-serif'><text x='180' y='34' fill='#d8b4fe' font-size='12' font-weight='700' text-anchor='middle'>测试源 v_o = 1 V 下的节点 1 方程</text><text x='180' y='62' fill='#e2e8f0' font-size='12.5' text-anchor='middle'>v₁/4 + v₁/4 + (v₁ − 1)/2 = 0</text><text x='180' y='88' fill='#94a3b8' font-size='11' text-anchor='middle'>提示：4Ω ∥ 4Ω = 2Ω，与右侧 2Ω 恰好构成等比分压！</text></svg>`;

const SHEET_MINI5 = `<svg viewBox='0 0 360 115' xmlns='http://www.w3.org/2000/svg' style='background:#0f172a;border-radius:8px;font-family:sans-serif'><text x='180' y='30' fill='#22c55e' font-size='12' font-weight='700' text-anchor='middle'>端口 a 的 KCL（流入 = 流出）</text><text x='180' y='58' fill='#e2e8f0' font-size='12' text-anchor='middle'>i_o + 0.25 v_x = (v_o − v₁) / 2</text><text x='180' y='88' fill='#38bdf8' font-size='11.5' text-anchor='middle'>代入 v_o = 1 V, v₁ = v_x = 0.5 V → 求 i_o 与 R_Th</text></svg>`;

/* ------------------------------------------------------------- added figures (sheet style, dark) */

/** 3.5: R1 = 4 Ω ∥ a dependent current source 2 i_x (up into a), test source v_o = 1 V. */
const ADD_NEG = `<svg viewBox="0 0 520 275" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:12px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="20" y="26" fill="#e2e8f0" font-size="14" font-weight="700">3.5 纯受控源网络：R₁ = 4 Ω ∥ 受控电流源 2i_x，外加 v_o = 1 V</text>
  <rect x="16" y="40" width="488" height="220" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <line x1="120" y1="70" x2="420" y2="70" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="120" y1="180" x2="420" y2="180" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="120" y1="70" x2="120" y2="100" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="111" y="100" width="18" height="50" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <line x1="120" y1="150" x2="120" y2="180" stroke="#e2e8f0" stroke-width="2"/>
  <text x="102" y="130" fill="#f59e0b" font-size="11" text-anchor="end">R₁ = 4 Ω</text>
  <line x1="142" y1="104" x2="142" y2="138" stroke="#22c55e" stroke-width="2"/>
  <polygon points="142,145 137,136 147,136" fill="#22c55e"/>
  <text x="150" y="128" fill="#22c55e" font-size="11.5" font-weight="700">i_x</text>
  <line x1="230" y1="70" x2="230" y2="103" stroke="#e2e8f0" stroke-width="2"/>
  <polygon points="230,103 252,125 230,147 208,125" fill="#0f172a" stroke="#f43f5e" stroke-width="2"/>
  <line x1="230" y1="139" x2="230" y2="115" stroke="#f43f5e" stroke-width="2"/>
  <polygon points="230,110 225,118 235,118" fill="#f43f5e"/>
  <line x1="230" y1="147" x2="230" y2="180" stroke="#e2e8f0" stroke-width="2"/>
  <text x="258" y="129" fill="#f43f5e" font-size="11.5" font-weight="700">2i_x</text>
  <circle cx="330" cy="70" r="4.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <circle cx="330" cy="180" r="4.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <text x="330" y="58" fill="#22c55e" font-size="12" font-weight="700" text-anchor="middle">a</text>
  <text x="330" y="198" fill="#22c55e" font-size="12" font-weight="700" text-anchor="middle">b</text>
  <line x1="398" y1="58" x2="368" y2="58" stroke="#38bdf8" stroke-width="2"/>
  <polygon points="362,58 370,54 370,62" fill="#38bdf8"/>
  <text x="383" y="50" fill="#38bdf8" font-size="11.5" font-weight="700" text-anchor="middle">i_o</text>
  <line x1="420" y1="70" x2="420" y2="105" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="420" cy="125" r="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
  <text x="420" y="120" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">+</text>
  <text x="420" y="137" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">−</text>
  <line x1="420" y1="145" x2="420" y2="180" stroke="#38bdf8" stroke-width="2"/>
  <text x="452" y="129" fill="#38bdf8" font-size="11" font-weight="700">v_o=1V</text>
  <text x="260" y="218" fill="#cbd5e1" font-size="11.5" text-anchor="middle">i_x = 1/4 = 0.25 A，2i_x = 0.5 A；KCL(a)：i_o + 2i_x = i_x ⇒ i_o = −0.25 A</text>
  <text x="260" y="242" fill="#f43f5e" font-size="12" font-weight="700" text-anchor="middle">R_Th = 1 V / (−0.25 A) = −4 Ω（v_oc = 0、i_sc = 0，只能用测试源法）</text>
</svg>`;

/** The guided example's circuit (values only; nothing of the answer). */
const ADD_GUIDED = `<svg viewBox="0 0 520 250" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:12px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="20" y="26" fill="#e2e8f0" font-size="14" font-weight="700">引导例题：含压控电流源 0.25v_x 的网络，求 a–b 左侧的戴维南等效</text>
  <rect x="16" y="40" width="488" height="196" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <line x1="80" y1="205" x2="430" y2="205" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="80" y1="205" x2="80" y2="160" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="80" cy="140" r="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="80" y="135" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">+</text>
  <text x="80" y="152" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">−</text>
  <text x="40" y="136" fill="#38bdf8" font-size="11.5" font-weight="700" text-anchor="middle">V_s</text><text x="40" y="152" fill="#38bdf8" font-size="11.5" font-weight="700" text-anchor="middle">12 V</text>
  <line x1="80" y1="120" x2="80" y2="75" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="80" y1="75" x2="95" y2="75" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="95" y="66" width="50" height="18" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="120" y="59" fill="#f59e0b" font-size="11" text-anchor="middle">R₁ = 4 Ω</text>
  <line x1="145" y1="75" x2="275" y2="75" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="190" cy="75" r="4" fill="#22c55e"/>
  <text x="190" y="59" fill="#22c55e" font-size="11" font-weight="700" text-anchor="middle">节点 1 (v₁)</text>
  <line x1="190" y1="75" x2="190" y2="110" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="181" y="110" width="18" height="52" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <line x1="190" y1="162" x2="190" y2="205" stroke="#e2e8f0" stroke-width="2"/>
  <text x="172" y="140" fill="#f59e0b" font-size="11" text-anchor="end">R₂ = 4 Ω</text>
  <text x="207" y="118" fill="#f43f5e" font-size="11" font-weight="700">+</text>
  <text x="207" y="140" fill="#f43f5e" font-size="11" font-weight="700">v_x</text>
  <text x="207" y="162" fill="#f43f5e" font-size="11" font-weight="700">−</text>
  <rect x="275" y="66" width="50" height="18" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="300" y="59" fill="#f59e0b" font-size="11" text-anchor="middle">R₃ = 2 Ω</text>
  <line x1="325" y1="75" x2="430" y2="75" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="370" y1="75" x2="370" y2="118" stroke="#e2e8f0" stroke-width="2"/>
  <polygon points="370,118 392,140 370,162 348,140" fill="#0f172a" stroke="#f43f5e" stroke-width="2"/>
  <line x1="370" y1="154" x2="370" y2="130" stroke="#f43f5e" stroke-width="2"/>
  <polygon points="370,125 365,133 375,133" fill="#f43f5e"/>
  <line x1="370" y1="162" x2="370" y2="205" stroke="#e2e8f0" stroke-width="2"/>
  <text x="398" y="144" fill="#f43f5e" font-size="11.5" font-weight="700">0.25v_x</text>
  <circle cx="430" cy="75" r="4.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <circle cx="430" cy="205" r="4.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <text x="444" y="79" fill="#22c55e" font-size="12" font-weight="700">a</text>
  <text x="444" y="209" fill="#22c55e" font-size="12" font-weight="700">b</text>
  <text x="470" y="144" fill="#22c55e" font-size="12" font-weight="700" text-anchor="middle">V_Th ?</text>
  <text x="470" y="162" fill="#d8b4fe" font-size="12" font-weight="700" text-anchor="middle">R_Th ?</text>
  <text x="250" y="228" fill="#94a3b8" font-size="11" text-anchor="middle">参考地直连端口 b；v_x 标在 R₂ 两端（上正下负，v_x = v₁）</text>
</svg>`;

/* ------------------------------------------------------------- self-test figures (no answers) */

const ADD_Q1 = `<svg viewBox="0 0 420 160" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="16" y="24" fill="#94a3b8" font-size="11" font-weight="600">Q1 · 网络内部：独立电压源 + 压控电压源 2v_x</text>
  <rect x="30" y="38" width="250" height="108" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5,4"/>
  <circle cx="80" cy="92" r="18" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="80" y="88" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">+</text>
  <text x="80" y="103" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">−</text>
  <text x="80" y="132" fill="#38bdf8" font-size="10.5" text-anchor="middle">独立源 V_s</text>
  <polygon points="160,72 180,92 160,112 140,92" fill="#0f172a" stroke="#f43f5e" stroke-width="2"/>
  <text x="160" y="89" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">+</text>
  <text x="160" y="103" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">−</text>
  <text x="160" y="132" fill="#f43f5e" font-size="10.5" text-anchor="middle">受控源 2v_x</text>
  <rect x="210" y="84" width="44" height="16" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="232" y="132" fill="#f59e0b" font-size="10.5" text-anchor="middle">电阻</text>
  <line x1="280" y1="62" x2="330" y2="62" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="280" y1="122" x2="330" y2="122" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="330" cy="62" r="4.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <circle cx="330" cy="122" r="4.5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <text x="344" y="66" fill="#22c55e" font-size="12" font-weight="700">a</text>
  <text x="344" y="126" fill="#22c55e" font-size="12" font-weight="700">b</text>
  <text x="372" y="97" fill="#d8b4fe" font-size="12" font-weight="700" text-anchor="middle">R_Th = ?</text>
</svg>`;

const ADD_Q2 = `<svg viewBox="0 0 420 160" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="16" y="24" fill="#94a3b8" font-size="11" font-weight="600">Q2 · 独立源已置零的线性网络，端口换三种测试源</text>
  <rect x="24" y="44" width="120" height="96" rx="8" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
  <text x="84" y="86" fill="#d8b4fe" font-size="11" text-anchor="middle">置零后的网络</text>
  <text x="84" y="104" fill="#f43f5e" font-size="10.5" text-anchor="middle">（受控源保留）</text>
  <line x1="144" y1="64" x2="176" y2="64" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="144" y1="122" x2="176" y2="122" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="176" cy="64" r="4" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <circle cx="176" cy="122" r="4" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <text x="176" y="54" fill="#22c55e" font-size="11" font-weight="700" text-anchor="middle">a</text>
  <text x="176" y="140" fill="#22c55e" font-size="11" font-weight="700" text-anchor="middle">b</text>
  <g>
    <circle cx="232" cy="93" r="17" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <text x="232" y="90" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">+</text>
    <text x="232" y="104" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">−</text>
    <text x="232" y="132" fill="#38bdf8" font-size="10.5" font-weight="700" text-anchor="middle">v_o = 1 V</text>
  </g>
  <g>
    <circle cx="310" cy="93" r="17" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <text x="310" y="90" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">+</text>
    <text x="310" y="104" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">−</text>
    <text x="310" y="132" fill="#38bdf8" font-size="10.5" font-weight="700" text-anchor="middle">v_o = 2 V</text>
  </g>
  <g>
    <circle cx="384" cy="93" r="17" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <line x1="384" y1="104" x2="384" y2="86" stroke="#f59e0b" stroke-width="2"/>
    <polygon points="384,80 379,88 389,88" fill="#f59e0b"/>
    <text x="384" y="132" fill="#f59e0b" font-size="10.5" font-weight="700" text-anchor="middle">i_o = 1 A</text>
  </g>
  <text x="308" y="56" fill="#cbd5e1" font-size="11" text-anchor="middle">R_Th = v_o / i_o 会变吗？</text>
</svg>`;

const ADD_Q3 = `<svg viewBox="0 0 420 165" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="16" y="24" fill="#94a3b8" font-size="11" font-weight="600">Q3 · Sadiku Ex. 4.8 搬上面包板：阻抗等比例放大 k = 1000</text>
  <rect x="20" y="38" width="170" height="112" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="105" y="60" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="middle">原题（Ω 级）</text>
  <text x="105" y="84" fill="#f59e0b" font-size="11" text-anchor="middle">R₁ 4 Ω · R₂ 12 Ω · R₃ 1 Ω</text>
  <text x="105" y="106" fill="#38bdf8" font-size="11" text-anchor="middle">V_s 32 V · I_s 2 A</text>
  <text x="105" y="132" fill="#22c55e" font-size="10.5" text-anchor="middle">V_Th 30 V · R_Th 4 Ω · I_N 7.5 A</text>
  <line x1="196" y1="94" x2="222" y2="94" stroke="#f59e0b" stroke-width="2"/>
  <polygon points="228,94 220,89 220,99" fill="#f59e0b"/>
  <text x="212" y="84" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="middle">×1000</text>
  <rect x="232" y="38" width="170" height="112" rx="8" fill="#1e293b" stroke="#22c55e" stroke-width="1.5"/>
  <text x="317" y="60" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="middle">面包板（kΩ 级）</text>
  <text x="317" y="84" fill="#f59e0b" font-size="11" text-anchor="middle">R₁ 4 kΩ · R₂ 12 kΩ · R₃ 1 kΩ</text>
  <text x="317" y="106" fill="#38bdf8" font-size="11" text-anchor="middle">V_s 32 V · I_s 2 mA</text>
  <text x="317" y="132" fill="#d8b4fe" font-size="10.5" text-anchor="middle">V_Th ? · R_Th ? · I_N ?</text>
</svg>`;

const ADD_Q4 = `<svg viewBox="0 0 420 160" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="16" y="24" fill="#94a3b8" font-size="11" font-weight="600">Q4 · 无独立源的网络，外加 v_o = 1 V 测得 i_o = −0.25 A</text>
  <rect x="24" y="40" width="160" height="104" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="104" y="80" fill="#cbd5e1" font-size="11" text-anchor="middle">线性电阻 + 受控源</text>
  <text x="104" y="100" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">无任何独立源</text>
  <line x1="184" y1="62" x2="300" y2="62" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="184" y1="124" x2="300" y2="124" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="214" cy="62" r="4" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <circle cx="214" cy="124" r="4" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <text x="214" y="52" fill="#22c55e" font-size="11" font-weight="700" text-anchor="middle">a</text>
  <text x="214" y="142" fill="#22c55e" font-size="11" font-weight="700" text-anchor="middle">b</text>
  <line x1="272" y1="50" x2="246" y2="50" stroke="#38bdf8" stroke-width="2"/>
  <polygon points="240,50 248,46 248,54" fill="#38bdf8"/>
  <text x="258" y="38" fill="#38bdf8" font-size="10.5" font-weight="700" text-anchor="middle">i_o = −0.25 A</text>
  <line x1="300" y1="62" x2="300" y2="75" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="300" cy="93" r="18" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="300" y="89" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">+</text>
  <text x="300" y="104" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">−</text>
  <line x1="300" y1="111" x2="300" y2="124" stroke="#38bdf8" stroke-width="2"/>
  <text x="330" y="97" fill="#38bdf8" font-size="11" font-weight="700">v_o = 1 V</text>
</svg>`;

/* ------------------------------------------------------------- light-theme exports */

/** sheet colours lightSvg leaves pale or dark on white (see the header) */
const fixAct5 = (s: string) =>
  s
    .replace('fill="#fecdd3" font-size="11" font-weight="700" text-anchor="middle">⚠ 严禁', 'fill="#fecdd3" font-size="11" font-weight="700" text-anchor="middle">严禁')
    .replace(/#fecdd3/g, '#9f1239')
    .replace(/#052e16/g, '#064e3b')
    .replace(/#bbf7d0/g, '#86efac')
    .replace(
      '<rect x="18" y="44" width="224" height="60" rx="6" fill="#450a0a" stroke="#f43f5e" stroke-width="1.5"/>',
      '<rect x="18" y="44" width="224" height="60" rx="6" fill="#450a0a" stroke="#f43f5e" stroke-width="1.5"/><polygon points="40,57 49,72 31,72" fill="#f43f5e"/><text x="40" y="70.5" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">!</text>',
    );

export const SVG_ACT1 = lightSvg(SHEET_ACT1);
export const SVG_ACT2 = lightSvg(SHEET_ACT2);
export const SVG_ACT3 = lightSvg(SHEET_ACT3);
export const SVG_ACT4 = lightSvg(SHEET_ACT4);
export const SVG_ACT5 = lightSvg(fixAct5(SHEET_ACT5));
export const SVG_NEG = lightSvg(ADD_NEG);
export const SVG_GUIDED = lightSvg(ADD_GUIDED);
export const MINI = [SHEET_MINI1, SHEET_MINI2, SHEET_MINI3, SHEET_MINI4, SHEET_MINI5].map(lightSvg);
export const SVG_Q1 = lightSvg(ADD_Q1);
export const SVG_Q2 = lightSvg(ADD_Q2);
export const SVG_Q3 = lightSvg(ADD_Q3);
export const SVG_Q4 = lightSvg(ADD_Q4);
