// W4-L2's diagrams. The six act figures and the five step diagrams of the guided example are the
// lesson sheet's SVGs (docs/lessons/W4-L2.md), drawn for a light canvas, so they are used as they
// are (no lightSvg). Edits: figure 3.3 loses the lightning glyph and its flyback diode reads
// 1N4007 (the sheet's own rule: 1N4148 only below 150 mA; this coil carries 200 mA);
// SVG_DC_TASK is figure 5.2 with the answers of Example 5.1 left as "?" (act 5 comes before the
// guided example), SVG_GD_PROBLEM its left half (the guided example's problem); step 4's heading
// is set at 10 px so it fits its 320-wide box; figure 6.1's last safety line names the board's L
// (the shared drum-core power inductor, which the sheet also recommends). Added: the quiz figures.

export const SVG_SOLENOID = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 280" width="100%" height="280" role="img" aria-label="螺线管线圈磁通剖面图与物理几何参数">
  <defs>
    <marker id="arrow-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
    <marker id="arrow-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
    <marker id="arrow-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="280" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="30" font-family="sans-serif" font-size="15" font-weight="700" fill="#0f172a">螺线管电感物理结构与闭合磁通剖面（N 匝线圈 · 磁芯磁导率 μ = μ₀μᵣ）</text>

  <!-- Magnetic flux outer loops -->
  <path d="M 160 115 C 85 115, 85 45, 310 45 C 535 45, 535 115, 460 115" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-dasharray="6,4" marker-mid="url(#arrow-b)"/>
  <path d="M 160 165 C 85 165, 85 235, 310 235 C 535 235, 535 165, 460 165" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-dasharray="6,4"/>

  <!-- Ferrite core cylinder -->
  <rect x="175" y="102" width="270" height="76" rx="6" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
  <ellipse cx="445" cy="140" rx="12" ry="38" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
  <text x="310" y="128" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">铁氧体磁芯 (μ = μ₀μᵣ)</text>

  <!-- Internal magnetic field lines B -->
  <line x1="150" y1="140" x2="475" y2="140" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arrow-b)"/>
  <line x1="165" y1="156" x2="465" y2="156" stroke="#2563eb" stroke-width="1.8" marker-end="url(#arrow-b)"/>
  <text x="485" y="144" font-family="sans-serif" font-size="13" font-weight="700" fill="#2563eb">磁通 Φ / 磁场 B</text>

  <!-- Coil windings top (current out: dot) and bottom (current in: cross) -->
  <g fill="#fef3c7" stroke="#d97706" stroke-width="2">
    <circle cx="205" cy="96" r="8"/><circle cx="235" cy="96" r="8"/><circle cx="265" cy="96" r="8"/>
    <circle cx="295" cy="96" r="8"/><circle cx="325" cy="96" r="8"/><circle cx="355" cy="96" r="8"/>
    <circle cx="385" cy="96" r="8"/><circle cx="415" cy="96" r="8"/>
    <circle cx="205" cy="184" r="8"/><circle cx="235" cy="184" r="8"/><circle cx="265" cy="184" r="8"/>
    <circle cx="295" cy="184" r="8"/><circle cx="325" cy="184" r="8"/><circle cx="355" cy="184" r="8"/>
    <circle cx="385" cy="184" r="8"/><circle cx="415" cy="184" r="8"/>
  </g>
  <!-- Dots on top (out of page) -->
  <g fill="#dc2626">
    <circle cx="205" cy="96" r="2.6"/><circle cx="235" cy="96" r="2.6"/><circle cx="265" cy="96" r="2.6"/>
    <circle cx="295" cy="96" r="2.6"/><circle cx="325" cy="96" r="2.6"/><circle cx="355" cy="96" r="2.6"/>
    <circle cx="385" cy="96" r="2.6"/><circle cx="415" cy="96" r="2.6"/>
  </g>
  <!-- Crosses on bottom (into page) -->
  <g stroke="#dc2626" stroke-width="1.8">
    <line x1="201" y1="180" x2="209" y2="188"/><line x1="209" y1="180" x2="201" y2="188"/>
    <line x1="231" y1="180" x2="239" y2="188"/><line x1="239" y1="180" x2="231" y2="188"/>
    <line x1="261" y1="180" x2="269" y2="188"/><line x1="269" y1="180" x2="261" y2="188"/>
    <line x1="291" y1="180" x2="299" y2="188"/><line x1="299" y1="180" x2="291" y2="188"/>
    <line x1="321" y1="180" x2="329" y2="188"/><line x1="329" y1="180" x2="321" y2="188"/>
    <line x1="351" y1="180" x2="359" y2="188"/><line x1="359" y1="180" x2="351" y2="188"/>
    <line x1="381" y1="180" x2="389" y2="188"/><line x1="389" y1="180" x2="381" y2="188"/>
    <line x1="411" y1="180" x2="419" y2="188"/><line x1="419" y1="180" x2="411" y2="188"/>
  </g>

  <!-- Dimension length l -->
  <line x1="175" y1="212" x2="445" y2="212" stroke="#475569" stroke-width="1.5" marker-start="url(#arrow-dim)" marker-end="url(#arrow-dim)"/>
  <text x="310" y="228" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="600" fill="#334155">线圈有效长度 ℓ</text>

  <!-- Right-side parameter box -->
  <rect x="570" y="54" width="170" height="196" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="584" y="78" font-family="sans-serif" font-size="13" font-weight="700" fill="#0f172a">几何与材料决定电感 L</text>
  <text x="584" y="102" font-family="sans-serif" font-size="12" fill="#334155">• 匝数 N：L ∝ N²（平方级）</text>
  <text x="584" y="124" font-family="sans-serif" font-size="12" fill="#334155">• 截面积 A：A = πr²</text>
  <text x="584" y="146" font-family="sans-serif" font-size="12" fill="#334155">• 长度 ℓ：越短磁阻越小</text>
  <text x="584" y="168" font-family="sans-serif" font-size="12" fill="#2563eb">• 磁芯 μᵣ：铁氧体 ≫ 空气</text>
  <line x1="584" y1="184" x2="726" y2="184" stroke="#e2e8f0" stroke-width="1"/>
  <text x="584" y="205" font-family="sans-serif" font-size="12" font-weight="700" fill="#dc2626">图例说明：</text>
  <text x="584" y="224" font-family="sans-serif" font-size="11.5" fill="#475569">⊙ 上排电流穿出纸面</text>
  <text x="584" y="241" font-family="sans-serif" font-size="11.5" fill="#475569">⊗ 下排电流穿入纸面 → B 向右</text>
</svg>`;

export const SVG_WAVES = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 360" width="100%" height="360" role="img" aria-label="分段电感电流 i(t) 与感应电压 v(t) 波形对齐图">
  <defs>
    <marker id="axis-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="360" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="28" font-family="sans-serif" font-size="15" font-weight="700" fill="#0f172a">电感伏安波形对齐：L = 10 mH，上盘 i(t) 斜率直接决定下盘 v(t) = L·di/dt</text>

  <!-- Vertical alignment guide lines for t = 2, 5, 6 ms -->
  <!-- Origin x=90, scale: 1 ms = 90 px -> 2ms=270, 5ms=540, 6ms=630 -->
  <line x1="270" y1="48" x2="270" y2="335" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,4"/>
  <line x1="540" y1="48" x2="540" y2="335" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,4"/>
  <line x1="630" y1="48" x2="630" y2="335" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,4"/>

  <!-- TOP PANEL: i(t) -->
  <text x="24" y="64" font-family="sans-serif" font-size="13" font-weight="700" fill="#2563eb">i(t) [mA]</text>
  <!-- Axes -->
  <line x1="90" y1="160" x2="700" y2="160" stroke="#334155" stroke-width="1.8" marker-end="url(#axis-arr)"/>
  <line x1="90" y1="170" x2="90" y2="52" stroke="#334155" stroke-width="1.8" marker-end="url(#axis-arr)"/>
  <text x="708" y="164" font-family="sans-serif" font-size="12" fill="#334155">t (ms)</text>
  <!-- Y ticks -->
  <line x1="84" y1="80" x2="90" y2="80" stroke="#334155" stroke-width="1.5"/>
  <text x="78" y="84" text-anchor="end" font-family="sans-serif" font-size="12" fill="#334155">40</text>
  <text x="78" y="164" text-anchor="end" font-family="sans-serif" font-size="12" fill="#334155">0</text>
  <!-- Waveform i(t): (0,0)->(2,40)->(5,40)->(6,0)->(6.5,0) -->
  <polygon points="90,160 270,80 540,80 630,160" fill="#dbeafe" opacity="0.55"/>
  <polyline points="90,160 270,80 540,80 630,160 680,160" fill="none" stroke="#2563eb" stroke-width="3"/>
  <!-- Slope labels -->
  <text x="165" y="106" font-family="sans-serif" font-size="12" font-weight="600" fill="#1d4ed8">斜率 +20 A/s</text>
  <text x="405" y="70" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#0f766e">恒流平台：di/dt = 0</text>
  <text x="605" y="104" font-family="sans-serif" font-size="12" font-weight="600" fill="#dc2626">斜率 -40 A/s</text>

  <!-- BOTTOM PANEL: v(t) -->
  <text x="24" y="206" font-family="sans-serif" font-size="13" font-weight="700" fill="#dc2626">v(t) [mV]</text>
  <!-- Axes (zero line y=250; +200mV -> y=215; -400mV -> y=320) -->
  <line x1="90" y1="250" x2="700" y2="250" stroke="#334155" stroke-width="1.8" marker-end="url(#axis-arr)"/>
  <line x1="90" y1="335" x2="90" y2="190" stroke="#334155" stroke-width="1.8" marker-end="url(#axis-arr)"/>
  <text x="708" y="254" font-family="sans-serif" font-size="12" fill="#334155">t (ms)</text>
  <!-- Y ticks -->
  <line x1="84" y1="215" x2="90" y2="215" stroke="#334155" stroke-width="1.5"/>
  <text x="78" y="219" text-anchor="end" font-family="sans-serif" font-size="12" fill="#16a34a">+200</text>
  <text x="78" y="254" text-anchor="end" font-family="sans-serif" font-size="12" fill="#334155">0</text>
  <line x1="84" y1="320" x2="90" y2="320" stroke="#334155" stroke-width="1.5"/>
  <text x="78" y="324" text-anchor="end" font-family="sans-serif" font-size="12" fill="#dc2626">-400</text>

  <!-- Shaded regions for v(t) -->
  <rect x="90" y="215" width="180" height="35" fill="#bbf7d0" opacity="0.7"/>
  <rect x="540" y="250" width="90" height="70" fill="#fecaca" opacity="0.75"/>
  <!-- Waveform v(t) -->
  <polyline points="90,250 90,215 270,215 270,250 540,250 540,320 630,320 630,250 680,250" fill="none" stroke="#dc2626" stroke-width="3"/>
  <!-- Annotations -->
  <text x="180" y="208" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#15803d">v₁ = +200 mV (吸能)</text>
  <text x="405" y="242" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#0f766e">v₂ = 0 V (短路)</text>
  <text x="585" y="338" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#b91c1c">v₃ = -400 mV (放能)</text>

  <!-- X-axis time ticks -->
  <text x="90" y="268" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#475569">0</text>
  <text x="270" y="268" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#475569">2</text>
  <text x="540" y="268" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#475569">5</text>
  <text x="630" y="268" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#475569">6</text>
</svg>`;

export const SVG_KICK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 285" width="100%" height="285" role="img" aria-label="感性负载开关断开瞬间无保护反电动势打火与续流二极管钳位对比图">
  <defs>
    <marker id="arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
    <marker id="arr-grn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#16a34a"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="285" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="28" font-family="sans-serif" font-size="15" font-weight="700" fill="#0f172a">感性负载断电瞬间对比（L = 10 mH，I₀ = 200 mA，开关断开 Δt = 1 μs）</text>

  <!-- LEFT CARD: Unprotected -->
  <rect x="20" y="42" width="350" height="226" rx="10" fill="#fff1f2" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="36" y="66" font-family="sans-serif" font-size="13.5" font-weight="700" fill="#b91c1c">✕ 危险：无续流二极管（高压反电动势打火）</text>
  <!-- Circuit lines -->
  <line x1="70" y1="95" x2="210" y2="95" stroke="#334155" stroke-width="2"/>
  <line x1="70" y1="95" x2="70" y2="140" stroke="#334155" stroke-width="2"/>
  <circle cx="70" cy="158" r="18" fill="#ffffff" stroke="#334155" stroke-width="2"/>
  <text x="70" y="154" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#334155">+</text>
  <text x="70" y="170" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#334155">−</text>
  <text x="38" y="162" font-family="sans-serif" font-size="11.5" font-weight="600" fill="#334155">12V</text>
  <line x1="70" y1="176" x2="70" y2="230" stroke="#334155" stroke-width="2"/>
  <line x1="70" y1="230" x2="210" y2="230" stroke="#334155" stroke-width="2"/>
  <!-- Inductor coil -->
  <path d="M 210 95 L 210 112 C 224 112, 224 124, 210 124 C 224 124, 224 136, 210 136 C 224 136, 224 148, 210 148 C 224 148, 224 160, 210 160 L 210 175" fill="none" stroke="#1e293b" stroke-width="2.4"/>
  <text x="230" y="138" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">L = 10 mH</text>
  <!-- Polarity flip -->
  <text x="192" y="114" font-family="sans-serif" font-size="13" font-weight="700" fill="#dc2626">−</text>
  <text x="192" y="168" font-family="sans-serif" font-size="13" font-weight="700" fill="#dc2626">+</text>
  <text x="230" y="156" font-family="sans-serif" font-size="12" font-weight="700" fill="#dc2626">v_L = −2000 V!</text>
  <!-- Open switch with spark -->
  <circle cx="210" cy="175" r="3.5" fill="#334155"/>
  <line x1="210" y1="175" x2="230" y2="205" stroke="#334155" stroke-width="2.2"/>
  <circle cx="210" cy="212" r="3.5" fill="#334155"/>
  <line x1="210" y1="212" x2="210" y2="230" stroke="#334155" stroke-width="2"/>
  <!-- Spark zigzag -->
  <polyline points="204,185 215,191 205,197 216,204" fill="none" stroke="#f59e0b" stroke-width="2.6"/>
  <text x="242" y="200" font-family="sans-serif" font-size="12" font-weight="700" fill="#d97706">触点拉弧/击穿!</text>
  <text x="36" y="254" font-family="sans-serif" font-size="11.5" fill="#7f1d1d">电流无泄放通道 → di/dt → −∞ → 极性翻转击穿开关</text>

  <!-- RIGHT CARD: Protected with Flyback Diode -->
  <rect x="390" y="42" width="350" height="226" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
  <text x="406" y="66" font-family="sans-serif" font-size="13.5" font-weight="700" fill="#15803d">✓ 安全：反并续流二极管（钳位在 −0.7 V）</text>
  <!-- Circuit lines -->
  <line x1="440" y1="95" x2="565" y2="95" stroke="#334155" stroke-width="2"/>
  <line x1="440" y1="95" x2="440" y2="140" stroke="#334155" stroke-width="2"/>
  <circle cx="440" cy="158" r="18" fill="#ffffff" stroke="#334155" stroke-width="2"/>
  <text x="440" y="154" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#334155">+</text>
  <text x="440" y="170" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#334155">−</text>
  <text x="408" y="162" font-family="sans-serif" font-size="11.5" font-weight="600" fill="#334155">12V</text>
  <line x1="440" y1="176" x2="440" y2="230" stroke="#334155" stroke-width="2"/>
  <line x1="440" y1="230" x2="565" y2="230" stroke="#334155" stroke-width="2"/>
  <!-- Inductor coil -->
  <path d="M 565 95 L 565 112 C 579 112, 579 124, 565 124 C 579 124, 579 136, 565 136 C 579 136, 579 148, 565 148 C 579 148, 579 160, 565 160 L 565 175" fill="none" stroke="#1e293b" stroke-width="2.4"/>
  <!-- Open switch (clean, no spark) -->
  <circle cx="565" cy="175" r="3.5" fill="#334155"/>
  <line x1="565" y1="175" x2="583" y2="203" stroke="#334155" stroke-width="2.2"/>
  <circle cx="565" cy="212" r="3.5" fill="#334155"/>
  <line x1="565" y1="212" x2="565" y2="230" stroke="#334155" stroke-width="2"/>

  <!-- Flyback diode parallel branch -->
  <line x1="565" y1="95" x2="655" y2="95" stroke="#16a34a" stroke-width="2.2"/>
  <line x1="565" y1="170" x2="655" y2="170" stroke="#16a34a" stroke-width="2.2"/>
  <line x1="655" y1="95" x2="655" y2="122" stroke="#16a34a" stroke-width="2.2"/>
  <line x1="655" y1="142" x2="655" y2="170" stroke="#16a34a" stroke-width="2.2"/>
  <!-- Diode pointing UP (cathode at top) -->
  <polygon points="643,142 667,142 655,122" fill="#bbf7d0" stroke="#15803d" stroke-width="2"/>
  <line x1="643" y1="122" x2="667" y2="122" stroke="#15803d" stroke-width="2.4"/>
  <text x="673" y="130" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#15803d">D₁ 续流</text>
  <text x="673" y="146" font-family="sans-serif" font-size="11" fill="#15803d">1N4007</text>

  <!-- Circulating current arrows -->
  <line x1="600" y1="170" x2="632" y2="170" stroke="#16a34a" stroke-width="2.4" marker-end="url(#arr-grn)"/>
  <line x1="632" y1="95" x2="600" y2="95" stroke="#16a34a" stroke-width="2.4" marker-end="url(#arr-grn)"/>
  <text x="610" y="192" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#15803d">i_flyback 顺畅续流</text>
  <text x="610" y="208" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#15803d">v_L 钳位在 −0.7 V</text>
  <text x="406" y="254" font-family="sans-serif" font-size="11.5" fill="#14532d">磁场储能 ½LI₀² 在闭合小环路中平缓衰减，开关安然无恙</text>
</svg>`;

export const SVG_NET = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 220" width="100%" height="220" role="img" aria-label="混联电感网络逐步等效化简图">
  <defs>
    <marker id="arr-step" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="220" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="28" font-family="sans-serif" font-size="14.5" font-weight="700" fill="#0f172a">无互感混联电感网络化简：L₁ = 4 mH，L₂ = 6 mH，L₃ = 8 mH，L₄ = 4 mH</text>

  <!-- Original network -->
  <circle cx="48" cy="74" r="4" fill="#0f172a"/><text x="34" y="78" font-family="sans-serif" font-size="12" font-weight="700" fill="#0f172a">a</text>
  <line x1="52" y1="74" x2="72" y2="74" stroke="#1e293b" stroke-width="2"/>
  <!-- L1 horizontal -->
  <path d="M 72 74 C 72 60, 86 60, 86 74 C 86 60, 100 60, 100 74 C 100 60, 114 60, 114 74 C 114 60, 128 60, 128 74" fill="none" stroke="#1e293b" stroke-width="2.2"/>
  <text x="100" y="54" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#1e293b">L₁ = 4 mH</text>
  <line x1="128" y1="74" x2="290" y2="74" stroke="#1e293b" stroke-width="2"/>

  <!-- L2 vertical -->
  <line x1="175" y1="74" x2="175" y2="95" stroke="#1e293b" stroke-width="2"/>
  <path d="M 175 95 C 189 95, 189 109, 175 109 C 189 109, 189 123, 175 123 C 189 123, 189 137, 175 137 C 189 137, 189 151, 175 151" fill="none" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="175" y1="151" x2="175" y2="180" stroke="#1e293b" stroke-width="2"/>
  <text x="166" y="128" text-anchor="end" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#1e293b">L₂ = 6 mH</text>

  <!-- L3 + L4 vertical branch (highlighted box) -->
  <rect x="255" y="82" width="110" height="90" rx="6" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="290" y1="74" x2="290" y2="88" stroke="#1e293b" stroke-width="2"/>
  <path d="M 290 88 C 302 88, 302 98, 290 98 C 302 98, 302 108, 290 108 C 302 108, 302 118, 290 118" fill="none" stroke="#2563eb" stroke-width="2.2"/>
  <text x="308" y="107" font-family="sans-serif" font-size="11" font-weight="700" fill="#1d4ed8">L₃ = 8 mH</text>
  <line x1="290" y1="118" x2="290" y2="132" stroke="#2563eb" stroke-width="2"/>
  <path d="M 290 132 C 302 132, 302 142, 290 142 C 302 142, 302 152, 290 152 C 302 152, 302 162, 290 162" fill="none" stroke="#2563eb" stroke-width="2.2"/>
  <text x="308" y="152" font-family="sans-serif" font-size="11" font-weight="700" fill="#1d4ed8">L₄ = 4 mH</text>
  <line x1="290" y1="162" x2="290" y2="180" stroke="#1e293b" stroke-width="2"/>

  <!-- Bottom return line -->
  <line x1="52" y1="180" x2="290" y2="180" stroke="#1e293b" stroke-width="2"/>
  <circle cx="48" cy="180" r="4" fill="#0f172a"/><text x="34" y="184" font-family="sans-serif" font-size="12" font-weight="700" fill="#0f172a">b</text>

  <!-- Step 1 arrow -->
  <line x1="382" y1="126" x2="430" y2="126" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-step)"/>
  <text x="406" y="114" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563eb">串联</text>

  <!-- Step 2 intermediate box -->
  <rect x="442" y="64" width="132" height="126" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="508" y="88" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#0f172a">中间化简</text>
  <text x="508" y="112" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#1d4ed8">L₃₄ = 8 + 4 = 12 mH</text>
  <text x="508" y="138" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#0f766e">L₂₃₄ = 6 ∥ 12</text>
  <text x="508" y="158" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#0f766e">= 4 mH</text>
  <text x="508" y="180" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">再与 L₁ 串联</text>

  <!-- Step 2 arrow -->
  <line x1="582" y1="126" x2="622" y2="126" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-step)"/>

  <!-- Final Leq -->
  <rect x="632" y="76" width="108" height="102" rx="10" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
  <text x="686" y="106" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#166534">等效电感</text>
  <text x="686" y="136" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="800" fill="#15803d">L_eq = 8 mH</text>
  <text x="686" y="160" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#166534">(4 mH + 4 mH)</text>
</svg>`;

export const SVG_DC = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 295" width="100%" height="295" role="img" aria-label="含电阻电感电容的直流稳态等效替换对比图">
  <defs>
    <marker id="arr-dc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
    <marker id="arr-il" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#16a34a"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="295" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="28" font-family="sans-serif" font-size="14.5" font-weight="700" fill="#0f172a">直流稳态等效替换：V_s = 9 V，R₁ = 100 Ω，R₂ = 300 Ω，R₃ = 150 Ω，R₄ = 200 Ω，L = 20 mH，C = 10 μF</text>

  <!-- LEFT: Original RLC circuit -->
  <rect x="18" y="42" width="335" height="236" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="32" y="64" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#334155">原始 R-L-C 混合电路</text>
  <!-- Source -->
  <line x1="56" y1="95" x2="56" y2="142" stroke="#1e293b" stroke-width="2"/>
  <circle cx="56" cy="160" r="18" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
  <text x="56" y="156" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700">+</text>
  <text x="56" y="172" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700">−</text>
  <text x="26" y="164" font-family="sans-serif" font-size="11" font-weight="700" fill="#1e293b">9V</text>
  <line x1="56" y1="178" x2="56" y2="245" stroke="#1e293b" stroke-width="2"/>
  <!-- R1 -->
  <line x1="56" y1="95" x2="82" y2="95" stroke="#1e293b" stroke-width="2"/>
  <rect x="82" y="87" width="44" height="16" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="104" y="81" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">R₁ 100Ω</text>
  <line x1="126" y1="95" x2="310" y2="95" stroke="#1e293b" stroke-width="2"/>
  <!-- Node A -->
  <circle cx="160" cy="95" r="4" fill="#2563eb"/>
  <text x="160" y="82" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563eb">节点 A</text>

  <!-- Branch 1: R2 -->
  <line x1="160" y1="95" x2="160" y2="135" stroke="#1e293b" stroke-width="2"/>
  <rect x="152" y="135" width="16" height="48" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="148" y="162" text-anchor="end" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">R₂ 300Ω</text>
  <line x1="160" y1="183" x2="160" y2="245" stroke="#1e293b" stroke-width="2"/>

  <!-- Branch 2: L + R3 -->
  <line x1="232" y1="95" x2="232" y2="112" stroke="#1e293b" stroke-width="2"/>
  <path d="M 232 112 C 244 112, 244 122, 232 122 C 244 122, 244 132, 232 132 C 244 132, 244 142, 232 142" fill="none" stroke="#16a34a" stroke-width="2.2"/>
  <text x="246" y="130" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#15803d">L 20mH</text>
  <line x1="232" y1="142" x2="232" y2="166" stroke="#1e293b" stroke-width="2"/>
  <rect x="224" y="166" width="16" height="44" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="220" y="192" text-anchor="end" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">R₃ 150Ω</text>
  <line x1="232" y1="210" x2="232" y2="245" stroke="#1e293b" stroke-width="2"/>

  <!-- Branch 3: R4 + C -->
  <line x1="310" y1="95" x2="310" y2="114" stroke="#1e293b" stroke-width="2"/>
  <rect x="302" y="114" width="16" height="40" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="322" y="138" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">R₄</text>
  <line x1="310" y1="154" x2="310" y2="184" stroke="#1e293b" stroke-width="2"/>
  <line x1="298" y1="184" x2="322" y2="184" stroke="#dc2626" stroke-width="2.5"/>
  <line x1="298" y1="194" x2="322" y2="194" stroke="#dc2626" stroke-width="2.5"/>
  <text x="324" y="194" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#dc2626">C</text>
  <line x1="310" y1="194" x2="310" y2="245" stroke="#1e293b" stroke-width="2"/>
  <!-- Ground rail -->
  <line x1="56" y1="245" x2="310" y2="245" stroke="#1e293b" stroke-width="2"/>
  <text x="184" y="264" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">参考地 GND (0 V)</text>

  <!-- Center Arrow -->
  <line x1="360" y1="160" x2="400" y2="160" stroke="#2563eb" stroke-width="2.8" marker-end="url(#arr-dc)"/>
  <text x="380" y="142" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563eb">直流稳态</text>
  <text x="380" y="182" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#15803d">L → 短路</text>
  <text x="380" y="196" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#dc2626">C → 开路</text>

  <!-- RIGHT: DC Steady-State Equivalent -->
  <rect x="408" y="42" width="335" height="236" rx="10" fill="#ffffff" stroke="#93c5fd" stroke-width="1.8"/>
  <text x="422" y="64" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1d4ed8">直流稳态等效电路（t → ∞）</text>
  <!-- Source -->
  <line x1="446" y1="95" x2="446" y2="142" stroke="#1e293b" stroke-width="2"/>
  <circle cx="446" cy="160" r="18" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
  <text x="446" y="156" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700">+</text>
  <text x="446" y="172" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700">−</text>
  <text x="416" y="164" font-family="sans-serif" font-size="11" font-weight="700" fill="#1e293b">9V</text>
  <line x1="446" y1="178" x2="446" y2="245" stroke="#1e293b" stroke-width="2"/>
  <!-- R1 -->
  <line x1="446" y1="95" x2="472" y2="95" stroke="#1e293b" stroke-width="2"/>
  <rect x="472" y="87" width="44" height="16" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="494" y="81" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">100Ω</text>
  <line x1="516" y1="95" x2="700" y2="95" stroke="#1e293b" stroke-width="2"/>
  <!-- Node A -->
  <circle cx="550" cy="95" r="4.5" fill="#2563eb"/>
  <text x="550" y="80" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563eb">v_A = 4.5 V</text>

  <!-- Branch 1: R2 -->
  <line x1="550" y1="95" x2="550" y2="135" stroke="#1e293b" stroke-width="2"/>
  <rect x="542" y="135" width="16" height="48" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="538" y="162" text-anchor="end" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">300Ω</text>
  <line x1="550" y1="183" x2="550" y2="245" stroke="#1e293b" stroke-width="2"/>

  <!-- Branch 2: L replaced by SHORT + R3 -->
  <line x1="622" y1="95" x2="622" y2="166" stroke="#16a34a" stroke-width="3"/>
  <line x1="622" y1="112" x2="622" y2="146" stroke="#16a34a" stroke-width="2.5" marker-end="url(#arr-il)"/>
  <text x="630" y="128" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#15803d">i_L = 30 mA</text>
  <text x="630" y="143" font-family="sans-serif" font-size="10" fill="#15803d">(L 短路)</text>
  <rect x="614" y="166" width="16" height="44" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="610" y="192" text-anchor="end" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">150Ω</text>
  <line x1="622" y1="210" x2="622" y2="245" stroke="#1e293b" stroke-width="2"/>

  <!-- Branch 3: R4 (0 A) + C replaced by OPEN -->
  <line x1="700" y1="95" x2="700" y2="114" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/>
  <rect x="692" y="114" width="16" height="36" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="712" y="132" font-family="sans-serif" font-size="10" fill="#64748b">i=0</text>
  <line x1="700" y1="150" x2="700" y2="176" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/>
  <circle cx="700" cy="176" r="4" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
  <circle cx="700" cy="212" r="4" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
  <text x="710" y="182" font-family="sans-serif" font-size="11" font-weight="700" fill="#dc2626">+</text>
  <text x="710" y="216" font-family="sans-serif" font-size="11" font-weight="700" fill="#dc2626">−</text>
  <text x="688" y="198" text-anchor="end" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#dc2626">v_C=4.5V</text>
  <line x1="700" y1="216" x2="700" y2="245" stroke="#1e293b" stroke-width="2"/>
  <!-- Ground rail -->
  <line x1="446" y1="245" x2="700" y2="245" stroke="#1e293b" stroke-width="2"/>
  <text x="574" y="264" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1d4ed8">I_s = 45 mA · w_total = 110.25 μJ</text>
</svg>`;

export const SVG_DC_TASK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 295" width="100%" height="295" role="img" aria-label="含电阻电感电容的直流稳态等效替换对比图（待求量留空）">
  <defs>
    <marker id="arr-dc-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
    <marker id="arr-il-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#16a34a"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="295" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="28" font-family="sans-serif" font-size="14.5" font-weight="700" fill="#0f172a">直流稳态等效替换：V_s = 9 V，R₁ = 100 Ω，R₂ = 300 Ω，R₃ = 150 Ω，R₄ = 200 Ω，L = 20 mH，C = 10 μF</text>

  <!-- LEFT: Original RLC circuit -->
  <rect x="18" y="42" width="335" height="236" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="32" y="64" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#334155">原始 R-L-C 混合电路</text>
  <!-- Source -->
  <line x1="56" y1="95" x2="56" y2="142" stroke="#1e293b" stroke-width="2"/>
  <circle cx="56" cy="160" r="18" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
  <text x="56" y="156" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700">+</text>
  <text x="56" y="172" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700">−</text>
  <text x="26" y="164" font-family="sans-serif" font-size="11" font-weight="700" fill="#1e293b">9V</text>
  <line x1="56" y1="178" x2="56" y2="245" stroke="#1e293b" stroke-width="2"/>
  <!-- R1 -->
  <line x1="56" y1="95" x2="82" y2="95" stroke="#1e293b" stroke-width="2"/>
  <rect x="82" y="87" width="44" height="16" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="104" y="81" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">R₁ 100Ω</text>
  <line x1="126" y1="95" x2="310" y2="95" stroke="#1e293b" stroke-width="2"/>
  <!-- Node A -->
  <circle cx="160" cy="95" r="4" fill="#2563eb"/>
  <text x="160" y="82" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563eb">节点 A</text>

  <!-- Branch 1: R2 -->
  <line x1="160" y1="95" x2="160" y2="135" stroke="#1e293b" stroke-width="2"/>
  <rect x="152" y="135" width="16" height="48" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="148" y="162" text-anchor="end" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">R₂ 300Ω</text>
  <line x1="160" y1="183" x2="160" y2="245" stroke="#1e293b" stroke-width="2"/>

  <!-- Branch 2: L + R3 -->
  <line x1="232" y1="95" x2="232" y2="112" stroke="#1e293b" stroke-width="2"/>
  <path d="M 232 112 C 244 112, 244 122, 232 122 C 244 122, 244 132, 232 132 C 244 132, 244 142, 232 142" fill="none" stroke="#16a34a" stroke-width="2.2"/>
  <text x="246" y="130" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#15803d">L 20mH</text>
  <line x1="232" y1="142" x2="232" y2="166" stroke="#1e293b" stroke-width="2"/>
  <rect x="224" y="166" width="16" height="44" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="220" y="192" text-anchor="end" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">R₃ 150Ω</text>
  <line x1="232" y1="210" x2="232" y2="245" stroke="#1e293b" stroke-width="2"/>

  <!-- Branch 3: R4 + C -->
  <line x1="310" y1="95" x2="310" y2="114" stroke="#1e293b" stroke-width="2"/>
  <rect x="302" y="114" width="16" height="40" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="322" y="138" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">R₄</text>
  <line x1="310" y1="154" x2="310" y2="184" stroke="#1e293b" stroke-width="2"/>
  <line x1="298" y1="184" x2="322" y2="184" stroke="#dc2626" stroke-width="2.5"/>
  <line x1="298" y1="194" x2="322" y2="194" stroke="#dc2626" stroke-width="2.5"/>
  <text x="324" y="194" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#dc2626">C</text>
  <line x1="310" y1="194" x2="310" y2="245" stroke="#1e293b" stroke-width="2"/>
  <!-- Ground rail -->
  <line x1="56" y1="245" x2="310" y2="245" stroke="#1e293b" stroke-width="2"/>
  <text x="184" y="264" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">参考地 GND (0 V)</text>

  <!-- Center Arrow -->
  <line x1="360" y1="160" x2="400" y2="160" stroke="#2563eb" stroke-width="2.8" marker-end="url(#arr-dc-t)"/>
  <text x="380" y="142" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563eb">直流稳态</text>
  <text x="380" y="182" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#15803d">L → 短路</text>
  <text x="380" y="196" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#dc2626">C → 开路</text>

  <!-- RIGHT: DC Steady-State Equivalent -->
  <rect x="408" y="42" width="335" height="236" rx="10" fill="#ffffff" stroke="#93c5fd" stroke-width="1.8"/>
  <text x="422" y="64" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1d4ed8">直流稳态等效电路（t → ∞）</text>
  <!-- Source -->
  <line x1="446" y1="95" x2="446" y2="142" stroke="#1e293b" stroke-width="2"/>
  <circle cx="446" cy="160" r="18" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
  <text x="446" y="156" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700">+</text>
  <text x="446" y="172" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700">−</text>
  <text x="416" y="164" font-family="sans-serif" font-size="11" font-weight="700" fill="#1e293b">9V</text>
  <line x1="446" y1="178" x2="446" y2="245" stroke="#1e293b" stroke-width="2"/>
  <!-- R1 -->
  <line x1="446" y1="95" x2="472" y2="95" stroke="#1e293b" stroke-width="2"/>
  <rect x="472" y="87" width="44" height="16" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="494" y="81" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">100Ω</text>
  <line x1="516" y1="95" x2="700" y2="95" stroke="#1e293b" stroke-width="2"/>
  <!-- Node A -->
  <circle cx="550" cy="95" r="4.5" fill="#2563eb"/>
  <text x="550" y="80" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563eb">v_A = ?</text>

  <!-- Branch 1: R2 -->
  <line x1="550" y1="95" x2="550" y2="135" stroke="#1e293b" stroke-width="2"/>
  <rect x="542" y="135" width="16" height="48" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="538" y="162" text-anchor="end" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">300Ω</text>
  <line x1="550" y1="183" x2="550" y2="245" stroke="#1e293b" stroke-width="2"/>

  <!-- Branch 2: L replaced by SHORT + R3 -->
  <line x1="622" y1="95" x2="622" y2="166" stroke="#16a34a" stroke-width="3"/>
  <line x1="622" y1="112" x2="622" y2="146" stroke="#16a34a" stroke-width="2.5" marker-end="url(#arr-il-t)"/>
  <text x="630" y="128" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#15803d">i_L = ?</text>
  <text x="630" y="143" font-family="sans-serif" font-size="10" fill="#15803d">(L 短路)</text>
  <rect x="614" y="166" width="16" height="44" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
  <text x="610" y="192" text-anchor="end" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#92400e">150Ω</text>
  <line x1="622" y1="210" x2="622" y2="245" stroke="#1e293b" stroke-width="2"/>

  <!-- Branch 3: R4 (0 A) + C replaced by OPEN -->
  <line x1="700" y1="95" x2="700" y2="114" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/>
  <rect x="692" y="114" width="16" height="36" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="712" y="132" font-family="sans-serif" font-size="10" fill="#64748b">i=0</text>
  <line x1="700" y1="150" x2="700" y2="176" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/>
  <circle cx="700" cy="176" r="4" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
  <circle cx="700" cy="212" r="4" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
  <text x="710" y="182" font-family="sans-serif" font-size="11" font-weight="700" fill="#dc2626">+</text>
  <text x="710" y="216" font-family="sans-serif" font-size="11" font-weight="700" fill="#dc2626">−</text>
  <text x="688" y="198" text-anchor="end" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#dc2626">v_C = ?</text>
  <line x1="700" y1="216" x2="700" y2="245" stroke="#1e293b" stroke-width="2"/>
  <!-- Ground rail -->
  <line x1="446" y1="245" x2="700" y2="245" stroke="#1e293b" stroke-width="2"/>
  <text x="574" y="264" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1d4ed8">I_s = ? · w_total = ?</text>
</svg>`;

export const SVG_ENERGY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 190" width="100%" height="190" role="img" aria-label="例题5.1磁电储能占比条形图与面包板安全核验卡">
  <rect x="0" y="0" width="760" height="190" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="28" font-family="sans-serif" font-size="14.5" font-weight="700" fill="#0f172a">稳态储能分布（w_total = 110.25 μJ）与面包板安全自检</text>

  <!-- Energy bar -->
  <rect x="24" y="50" width="440" height="36" rx="6" fill="#e2e8f0"/>
  <!-- w_L = 9 / 110.25 = 8.16% -> 36 px -->
  <rect x="24" y="50" width="36" height="36" rx="6" fill="#16a34a"/>
  <!-- w_C = 101.25 / 110.25 = 91.84% -> 404 px -->
  <rect x="60" y="50" width="404" height="36" rx="4" fill="#2563eb"/>
  <text x="262" y="73" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#ffffff">电场储能 w_C = 101.25 μJ (91.8%)</text>
  <text x="24" y="106" font-family="sans-serif" font-size="12" font-weight="700" fill="#15803d">■ 磁场储能 w_L = 9.00 μJ (8.2%)</text>
  <text x="24" y="128" font-family="sans-serif" font-size="11.5" fill="#475569">工程启示：在常规低压 mA 级面包板电路中，同等体积的电解电容储能密度远高于色环电感。</text>
  <text x="24" y="150" font-family="sans-serif" font-size="11.5" fill="#475569">只有在大电流功率变换器（如 Buck/Boost 电源）中，½Li² 才成为主角。</text>

  <!-- Safety verification card -->
  <rect x="490" y="44" width="248" height="126" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
  <text x="506" y="68" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#166534">面包板安全核验通过 ✓</text>
  <text x="506" y="92" font-family="sans-serif" font-size="11.5" fill="#14532d">• 最大电阻功耗 P_R1 = 0.203 W &lt; 0.25 W</text>
  <text x="506" y="114" font-family="sans-serif" font-size="11.5" fill="#14532d">• 电感电流 i_L = 30 mA ≪ I_sat (≥150 mA)</text>
  <text x="506" y="136" font-family="sans-serif" font-size="11.5" fill="#14532d">• 断电建议：若接开关，请给 L 反并 1N4148</text>
  <text x="506" y="156" font-family="sans-serif" font-size="11.5" fill="#14532d">• 元件核对：L 为 20 mH 工字功率电感</text>
</svg>`;

export const MINI_STEP1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 90" width="320" height="90"><rect width="320" height="90" rx="8" fill="#f8fafc" stroke="#cbd5e1"/><text x="16" y="26" font-family="sans-serif" font-size="12" font-weight="700" fill="#0f172a">直流稳态：di/dt = 0, dv/dt = 0</text><line x1="24" y1="58" x2="130" y2="58" stroke="#16a34a" stroke-width="3"/><text x="77" y="78" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#15803d">L → ?</text><line x1="185" y1="58" x2="220" y2="58" stroke="#dc2626" stroke-width="2.5"/><circle cx="224" cy="58" r="3.5" fill="#fff" stroke="#dc2626" stroke-width="2"/><circle cx="256" cy="58" r="3.5" fill="#fff" stroke="#dc2626" stroke-width="2"/><line x1="260" y1="58" x2="295" y2="58" stroke="#dc2626" stroke-width="2.5"/><text x="240" y="78" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#b91c1c">C → ?</text></svg>`;

export const MINI_STEP2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 90" width="320" height="90"><rect width="320" height="90" rx="8" fill="#f8fafc" stroke="#cbd5e1"/><circle cx="40" cy="45" r="4" fill="#2563eb"/><text x="26" y="35" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563eb">A</text><line x1="44" y1="45" x2="100" y2="45" stroke="#64748b" stroke-width="2" stroke-dasharray="4,3"/><rect x="100" y="35" width="54" height="20" fill="#f1f5f9" stroke="#64748b" stroke-width="1.8"/><text x="127" y="49" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">R₄ 200Ω</text><line x1="154" y1="45" x2="206" y2="45" stroke="#64748b" stroke-width="2" stroke-dasharray="4,3"/><circle cx="210" cy="45" r="4" fill="#fff" stroke="#dc2626" stroke-width="2"/><circle cx="250" cy="45" r="4" fill="#fff" stroke="#dc2626" stroke-width="2"/><line x1="254" y1="45" x2="295" y2="45" stroke="#334155" stroke-width="2"/><text x="230" y="72" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#dc2626">C 开路 (i_C = 0)</text></svg>`;

export const MINI_STEP3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 90" width="320" height="90"><rect width="320" height="90" rx="8" fill="#f8fafc" stroke="#cbd5e1"/><text x="18" y="30" font-family="sans-serif" font-size="12" font-weight="700" fill="#0f172a">分压化简：9 V → R₁ (100Ω) → R₂∥R₃</text><rect x="24" y="44" width="86" height="26" rx="4" fill="#fef3c7" stroke="#b45309"/><text x="67" y="61" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#92400e">R₁ = 100 Ω</text><line x1="110" y1="57" x2="156" y2="57" stroke="#2563eb" stroke-width="2"/><circle cx="133" cy="57" r="4" fill="#2563eb"/><text x="133" y="46" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563eb">v_A</text><rect x="156" y="44" width="136" height="26" rx="4" fill="#dbeafe" stroke="#2563eb"/><text x="224" y="61" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#1d4ed8">R₂∥R₃ = 300∥150 = ?</text></svg>`;

export const MINI_STEP4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 90" width="320" height="90"><rect width="320" height="90" rx="8" fill="#f8fafc" stroke="#cbd5e1"/><text x="12" y="30" font-family="sans-serif" font-size="10" font-weight="700" fill="#15803d">电感支路：v_A = 4.5 V ──(L短路)── R₃ (150Ω) ── GND</text><line x1="40" y1="58" x2="130" y2="58" stroke="#16a34a" stroke-width="3"/><text x="85" y="50" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#15803d">i_L →</text><rect x="130" y="46" width="72" height="24" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/><text x="166" y="62" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#92400e">R₃ = 150 Ω</text><line x1="202" y1="58" x2="280" y2="58" stroke="#334155" stroke-width="2"/><text x="265" y="50" font-family="sans-serif" font-size="11" fill="#475569">0 V</text></svg>`;

export const MINI_STEP5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 90" width="320" height="90"><rect width="320" height="90" rx="8" fill="#f8fafc" stroke="#cbd5e1"/><text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#0f172a">总储能结算：w_total = ½ L i_L² + ½ C v_C²</text><rect x="20" y="42" width="130" height="32" rx="6" fill="#dcfce7" stroke="#22c55e"/><text x="85" y="62" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#15803d">w_L = ½(20mH)(30mA)²</text><rect x="166" y="42" width="134" height="32" rx="6" fill="#dbeafe" stroke="#2563eb"/><text x="233" y="62" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#1d4ed8">w_C = ½(10μF)(4.5V)²</text></svg>`;

/** the guided example's problem: the original circuit of figure 5.2 (left half), no answers */
export const SVG_GD_PROBLEM = SVG_DC_TASK.replace(/<!-- Center Arrow -->[\s\S]*(?=<\/svg>)/, '')
  .replace('viewBox="0 0 760 295" width="100%" height="295"', 'viewBox="12 38 348 246" width="100%" height="246"')
  .replace('aria-label="含电阻电感电容的直流稳态等效替换对比图（待求量留空）"', 'aria-label="例题 5.1 原始 R-L-C 混合电路"')
  .replace(/arr-dc-t/g, 'arr-dc-p')
  .replace(/arr-il-t/g, 'arr-il-p');

const F = 'font-family="sans-serif"';
const turns = (n: number, x0: number, dx: number, rx: number) =>
  Array.from({ length: n }, (_, k) => `<ellipse cx="${x0 + k * dx}" cy="65" rx="${rx}" ry="20" fill="none" stroke="#d97706" stroke-width="2.2"/>`).join('');

/** Q1: the same solenoid wound with N and with 2N turns */
export const SVG_Q1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 130" width="100%" height="130" role="img" aria-label="同一骨架绕 N 匝与 2N 匝的螺线管">
<rect width="360" height="130" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<rect x="24" y="48" width="120" height="34" rx="4" fill="#e2e8f0" stroke="#64748b"/>
${turns(6, 36, 19, 5)}
<text x="84" y="30" text-anchor="middle" ${F} font-size="12" font-weight="700" fill="#0f172a">N 匝 · 空心</text>
<text x="84" y="108" text-anchor="middle" ${F} font-size="12" font-weight="700" fill="#2563eb">L = 100 μH</text>
<line x1="160" y1="65" x2="196" y2="65" stroke="#2563eb" stroke-width="2.2"/><path d="M196 60 L206 65 L196 70 z" fill="#2563eb"/>
<rect x="216" y="48" width="120" height="34" rx="4" fill="#e2e8f0" stroke="#64748b"/>
${turns(12, 224, 9.6, 3.6)}
<text x="276" y="30" text-anchor="middle" ${F} font-size="12" font-weight="700" fill="#0f172a">2N 匝 · ℓ、A、磁芯不变</text>
<text x="276" y="108" text-anchor="middle" ${F} font-size="12" font-weight="700" fill="#2563eb">L = ?</text>
</svg>`;

/** Q2: the current ramp through 50 mH */
export const SVG_Q2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 140" width="100%" height="140" role="img" aria-label="50 mH 电感电流 5 ms 内由 0 线性升到 200 mA">
<rect width="360" height="140" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<line x1="50" y1="110" x2="320" y2="110" stroke="#334155" stroke-width="1.6"/><path d="M320 106 L328 110 L320 114 z" fill="#334155"/>
<line x1="50" y1="118" x2="50" y2="20" stroke="#334155" stroke-width="1.6"/><path d="M46 20 L50 12 L54 20 z" fill="#334155"/>
<text x="56" y="22" ${F} font-size="11" font-weight="700" fill="#2563eb">i (mA)</text>
<text x="330" y="128" text-anchor="end" ${F} font-size="11" fill="#334155">t (ms)</text>
<line x1="44" y1="36" x2="50" y2="36" stroke="#334155"/><text x="40" y="40" text-anchor="end" ${F} font-size="11" fill="#334155">200</text>
<text x="40" y="114" text-anchor="end" ${F} font-size="11" fill="#334155">0</text>
<polyline points="50,110 230,36" fill="none" stroke="#2563eb" stroke-width="3"/>
<line x1="230" y1="36" x2="230" y2="110" stroke="#94a3b8" stroke-dasharray="4,3"/>
<text x="230" y="126" text-anchor="middle" ${F} font-size="11" fill="#334155">5</text>
<text x="250" y="58" ${F} font-size="12" font-weight="700" fill="#0f172a">L = 50 mH</text>
<text x="250" y="78" ${F} font-size="12" font-weight="700" fill="#dc2626">v_L = ?</text>
<text x="250" y="96" ${F} font-size="12" font-weight="700" fill="#15803d">w_L(5 ms) = ?</text>
</svg>`;

/** Q3: a relay coil switched by a MOSFET, a diode drawn dashed across the coil */
export const SVG_Q3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 160" width="100%" height="160" role="img" aria-label="MOSFET 控制继电器线圈，线圈两端反并一只二极管">
<rect width="360" height="160" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<text x="24" y="24" ${F} font-size="12" font-weight="700" fill="#0f172a">+V</text>
<line x1="50" y1="20" x2="150" y2="20" stroke="#334155" stroke-width="2"/>
<line x1="150" y1="20" x2="150" y2="36" stroke="#334155" stroke-width="2"/>
<path d="M150 36 C164 36,164 48,150 48 C164 48,164 60,150 60 C164 60,164 72,150 72 C164 72,164 84,150 84" fill="none" stroke="#1e293b" stroke-width="2.4"/>
<text x="136" y="64" text-anchor="end" ${F} font-size="11.5" font-weight="700" fill="#1e293b">继电器线圈</text>
<line x1="150" y1="84" x2="150" y2="104" stroke="#334155" stroke-width="2"/>
<rect x="134" y="104" width="32" height="26" rx="4" fill="#fff" stroke="#334155" stroke-width="1.8"/>
<text x="150" y="121" text-anchor="middle" ${F} font-size="10" font-weight="700" fill="#334155">MOS</text>
<line x1="150" y1="130" x2="150" y2="146" stroke="#334155" stroke-width="2"/>
<line x1="136" y1="146" x2="164" y2="146" stroke="#334155" stroke-width="2"/>
<line x1="150" y1="20" x2="230" y2="20" stroke="#16a34a" stroke-width="2" stroke-dasharray="5,3"/>
<line x1="230" y1="20" x2="230" y2="46" stroke="#16a34a" stroke-width="2" stroke-dasharray="5,3"/>
<polygon points="218,66 242,66 230,46" fill="#dcfce7" stroke="#15803d" stroke-width="1.8" stroke-dasharray="4,2"/>
<line x1="218" y1="46" x2="242" y2="46" stroke="#15803d" stroke-width="2.2"/>
<line x1="230" y1="66" x2="230" y2="94" stroke="#16a34a" stroke-width="2" stroke-dasharray="5,3"/>
<line x1="150" y1="94" x2="230" y2="94" stroke="#16a34a" stroke-width="2" stroke-dasharray="5,3"/>
<text x="252" y="56" ${F} font-size="12" font-weight="700" fill="#15803d">续流二极管</text>
<text x="252" y="74" ${F} font-size="12" font-weight="700" fill="#15803d">为什么必须加？</text>
</svg>`;

const coil = (x: number) =>
  `<path d="M${x} 58 C${x + 12} 58,${x + 12} 68,${x} 68 C${x + 12} 68,${x + 12} 78,${x} 78 C${x + 12} 78,${x + 12} 88,${x} 88 C${x + 12} 88,${x + 12} 98,${x} 98" fill="none" stroke="#2563eb" stroke-width="2.2"/>`;

/** Q4: L1 ∥ L2, then L3 in series */
export const SVG_Q4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 150" width="100%" height="150" role="img" aria-label="L1 与 L2 并联后再与 L3 串联">
<rect width="360" height="150" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<circle cx="28" cy="40" r="4" fill="#0f172a"/><text x="14" y="44" ${F} font-size="12" font-weight="700" fill="#0f172a">a</text>
<circle cx="28" cy="124" r="4" fill="#0f172a"/><text x="14" y="128" ${F} font-size="12" font-weight="700" fill="#0f172a">b</text>
<line x1="32" y1="40" x2="70" y2="40" stroke="#1e293b" stroke-width="2"/>
<path d="M70 40 C70 28,84 28,84 40 C84 28,98 28,98 40 C98 28,112 28,112 40 C112 28,126 28,126 40" fill="none" stroke="#1e293b" stroke-width="2.2"/>
<text x="98" y="20" text-anchor="middle" ${F} font-size="11.5" font-weight="700" fill="#1e293b">L₃ = 2 mH</text>
<line x1="126" y1="40" x2="270" y2="40" stroke="#1e293b" stroke-width="2"/>
<line x1="190" y1="40" x2="190" y2="58" stroke="#1e293b" stroke-width="2"/>
${coil(190)}
<line x1="190" y1="98" x2="190" y2="124" stroke="#1e293b" stroke-width="2"/>
<text x="180" y="84" text-anchor="end" ${F} font-size="11.5" font-weight="700" fill="#1d4ed8">L₁ = 6 mH</text>
<line x1="270" y1="40" x2="270" y2="58" stroke="#1e293b" stroke-width="2"/>
${coil(270)}
<line x1="270" y1="98" x2="270" y2="124" stroke="#1e293b" stroke-width="2"/>
<text x="284" y="84" ${F} font-size="11.5" font-weight="700" fill="#1d4ed8">L₂ = 12 mH</text>
<line x1="32" y1="124" x2="270" y2="124" stroke="#1e293b" stroke-width="2"/>
<text x="84" y="88" text-anchor="middle" ${F} font-size="12" font-weight="700" fill="#0f172a">L_eq = ?</text>
<text x="84" y="106" text-anchor="middle" ${F} font-size="11" fill="#475569">直流稳态端口：?</text>
</svg>`;
