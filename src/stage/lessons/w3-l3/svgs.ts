// W3-L3 diagrams. The sheet's figures (acts 1–6) and the guided example's step diagrams are drawn
// for a light canvas already, so they are not passed through lightSvg() (it would turn their dark
// wires pale); `tune` only puts the panel on the site's paper and deepens the green text
// (#059669 → #047857) to 4.5:1 on white.
// Changes to the sheet's SVGs: fig 6.1 shows the 台式可调直流电源（±9 V） (two outputs in series)
// in place of the two 9 V batteries; step 4's mini diagram no longer prints the step's answer (the
// 1.25 V drop); EX53_PROBLEM is fig 4.1's left panel without the answers (i₁, vₒ, iₒ), for the
// problem and the guided example — the full fig 4.1 closes act 4, after the 通关复盘.
// The quiz figures, the quiz act's figure and the W3-L4 preview are new (light theme).

/** the sheet's light SVG on the site's paper, green text deepened */
function tune(svg: string): string {
  return svg.replace(/(<rect\b[^>]*?)fill="#f8fafc"/, '$1fill="#fbf7ef"').replace(/(<text\b[^>]*?)fill="#059669"/g, '$1fill="#047857"');
}

export const SVG_ACT1 = tune(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 340" width="760" height="340" role="img" aria-label="反相端虚地特写与电流拐弯示意图">
  <defs>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
    <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="340" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="34" font-family="sans-serif" font-size="17" font-weight="700" fill="#0f172a">图 1.1 反相端“虚地 (Virtual Ground)”特写：电位 = 0 V，电流 100% 拐弯</text>

  <!-- Input vi & R1 -->
  <circle cx="70" cy="170" r="6" fill="#ffffff" stroke="#2563eb" stroke-width="2.5"/>
  <text x="58" y="152" font-family="sans-serif" font-size="15" font-weight="700" fill="#2563eb">vᵢ</text>
  <line x1="76" y1="170" x2="140" y2="170" stroke="#1e293b" stroke-width="2.5"/>
  <rect x="140" y="156" width="90" height="28" rx="4" fill="#fffbeb" stroke="#d97706" stroke-width="2.5"/>
  <text x="185" y="175" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#92400e">R₁</text>
  <line x1="230" y1="170" x2="340" y2="170" stroke="#1e293b" stroke-width="2.5"/>

  <!-- Current i1 arrow -->
  <line x1="242" y1="152" x2="312" y2="152" stroke="#2563eb" stroke-width="2.5" marker-end="url(#arrow-blue)"/>
  <text x="277" y="142" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#2563eb">i₁</text>

  <!-- Virtual Ground Node 1 -->
  <circle cx="340" cy="170" r="22" fill="#fef08a" fill-opacity="0.55" stroke="#eab308" stroke-width="2" stroke-dasharray="4 3"/>
  <circle cx="340" cy="170" r="5" fill="#dc2626"/>
  <rect x="242" y="205" width="166" height="44" rx="8" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.8"/>
  <text x="325" y="224" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#854d0e">节点 1：虚地 v₋ = 0 V</text>
  <text x="325" y="241" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#a16207">（未接物理地线！）</text>
  <line x1="335" y1="205" x2="339" y2="178" stroke="#ca8a04" stroke-width="1.5" stroke-dasharray="3 2"/>

  <!-- Feedback branch & Rf -->
  <polyline points="340,170 340,86 430,86" fill="none" stroke="#1e293b" stroke-width="2.5"/>
  <rect x="430" y="72" width="100" height="28" rx="4" fill="#ecfdf5" stroke="#059669" stroke-width="2.5"/>
  <text x="480" y="91" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#065f46">Rf</text>
  <polyline points="530,86 645,86 645,200" fill="none" stroke="#1e293b" stroke-width="2.5"/>

  <!-- Current bend arrow if = i1 -->
  <path d="M 355 152 Q 355 104 415 104" fill="none" stroke="#059669" stroke-width="2.5" marker-end="url(#arrow-green)"/>
  <text x="392" y="124" font-family="sans-serif" font-size="13" font-weight="700" fill="#059669">i_f = i₁（被迫拐弯）</text>

  <!-- Wire to inverting pin with Virtual Open X -->
  <line x1="340" y1="170" x2="450" y2="170" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="396" y1="161" x2="414" y2="179" stroke="#dc2626" stroke-width="3"/>
  <line x1="414" y1="161" x2="396" y2="179" stroke="#dc2626" stroke-width="3"/>
  <text x="405" y="152" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#dc2626">i₋ = 0（虚断）</text>

  <!-- Op-amp triangle -->
  <polygon points="450,140 450,260 580,200" fill="#ffffff" stroke="#0f172a" stroke-width="2.8"/>
  <text x="466" y="177" font-family="sans-serif" font-size="20" font-weight="700" fill="#dc2626">−</text>
  <text x="465" y="236" font-family="sans-serif" font-size="19" font-weight="700" fill="#2563eb">+</text>
  <text x="506" y="205" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#475569">理想运放</text>

  <!-- Non-inverting input grounded -->
  <polyline points="450,230 422,230 422,285" fill="none" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="406" y1="285" x2="438" y2="285" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="412" y1="292" x2="432" y2="292" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="418" y1="299" x2="426" y2="299" stroke="#1e293b" stroke-width="2"/>
  <text x="448" y="294" font-family="sans-serif" font-size="13" font-weight="700" fill="#0f172a">v₊ = 0 V（真实接地）</text>

  <!-- Output node -->
  <line x1="580" y1="200" x2="695" y2="200" stroke="#1e293b" stroke-width="2.5"/>
  <circle cx="645" cy="200" r="4.5" fill="#1e293b"/>
  <circle cx="695" cy="200" r="6" fill="#ffffff" stroke="#dc2626" stroke-width="2.5"/>
  <text x="712" y="205" font-family="sans-serif" font-size="15" font-weight="700" fill="#dc2626">vₒ</text>
</svg>`);

export const SVG_ACT2 =
  tune(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 360" width="760" height="360" role="img" aria-label="完整反相放大器原理图（对齐 Sadiku Fig. 5.10）">
  <defs>
    <marker id="arr-b2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
    <marker id="arr-g2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="360" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="32" font-family="sans-serif" font-size="16.5" font-weight="700" fill="#0f172a">图 2.1 反相放大器标准拓扑（对齐 Sadiku Fig. 5.10，含 ±9V 双电源轨）</text>

  <!-- Input voltage source vi -->
  <circle cx="95" cy="235" r="26" fill="#ffffff" stroke="#2563eb" stroke-width="2.4"/>
  <text x="95" y="228" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#2563eb">+</text>
  <text x="95" y="251" text-anchor="middle" font-family="sans-serif" font-size="17" font-weight="700" fill="#2563eb">−</text>
  <text x="52" y="240" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#2563eb">vᵢ</text>
  <polyline points="95,209 95,175 165,175" fill="none" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="95" y1="261" x2="95" y2="305" stroke="#1e293b" stroke-width="2.4"/>

  <!-- R1 -->
  <rect x="165" y="161" width="90" height="28" rx="4" fill="#fffbeb" stroke="#d97706" stroke-width="2.4"/>
  <text x="210" y="180" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#92400e">R₁ (10 kΩ)</text>
  <line x1="255" y1="175" x2="430" y2="175" stroke="#1e293b" stroke-width="2.4"/>

  <!-- Current i1 -->
  <line x1="265" y1="158" x2="315" y2="158" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-b2)"/>
  <text x="290" y="149" text-anchor="middle" font-family="sans-serif" font-size="13.5" font-weight="700" fill="#2563eb">i₁</text>

  <!-- Node 1 -->
  <circle cx="335" cy="175" r="5" fill="#dc2626"/>
  <text x="335" y="200" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#b45309">节点 1 (v₋=0)</text>

  <!-- Feedback Rf -->
  <polyline points="335,175 335,92 435,92" fill="none" stroke="#1e293b" stroke-width="2.4"/>
  <rect x="435" y="78" width="105" height="28" rx="4" fill="#ecfdf5" stroke="#059669" stroke-width="2.4"/>
  <text x="487" y="97" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#065f46">Rf (22 kΩ)</text>
  <polyline points="540,92 615,92 615,205" fill="none" stroke="#1e293b" stroke-width="2.4"/>

  <!-- Current if -->
  <line x1="365" y1="76" x2="420" y2="76" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-g2)"/>
  <text x="392" y="67" text-anchor="middle" font-family="sans-serif" font-size="13.5" font-weight="700" fill="#059669">i_f</text>

  <!-- Power rails +9V / -9V -->
  <line x1="485" y1="138" x2="485" y2="173" stroke="#dc2626" stroke-width="2.2"/>
  <circle cx="485" cy="134" r="4" fill="#dc2626"/>
  <text x="498" y="139" font-family="sans-serif" font-size="13" font-weight="700" fill="#dc2626">+9 V (Pin 8)</text>

  <line x1="485" y1="238" x2="485" y2="275" stroke="#2563eb" stroke-width="2.2"/>
  <circle cx="485" cy="279" r="4" fill="#2563eb"/>
  <text x="498" y="284" font-family="sans-serif" font-size="13" font-weight="700" fill="#2563eb">−9 V (Pin 4)</text>

  <!-- Op-amp -->
  <polygon points="430,145 430,265 560,205" fill="#ffffff" stroke="#0f172a" stroke-width="2.8"/>
  <text x="446" y="182" font-family="sans-serif" font-size="19" font-weight="700" fill="#dc2626">−</text>
  <text x="445" y="242" font-family="sans-serif" font-size="18" font-weight="700" fill="#2563eb">+</text>
  <text x="488" y="210" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#334155">LM358</text>

  <!-- Non-inverting terminal to ground -->
  <polyline points="430,235 385,235 385,305" fill="none" stroke="#1e293b" stroke-width="2.4"/>

  <!-- Output node & vo -->
  <line x1="560" y1="205" x2="675" y2="205" stroke="#1e293b" stroke-width="2.4"/>
  <circle cx="615" cy="205" r="4.5" fill="#1e293b"/>
  <circle cx="675" cy="205" r="5.5" fill="#ffffff" stroke="#dc2626" stroke-width="2.4"/>
  <text x="692" y="210" font-family="sans-serif" font-size="15" font-weight="700" fill="#dc2626">vₒ</text>
  <text x="675" y="232" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#dc2626">+</text>
  <text x="675" y="294" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#dc2626">−</text>
  <circle cx="675" cy="305" r="5.5" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>

  <!-- Common ground bus -->
  <line x1="95" y1="305" x2="670" y2="305" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="385" y1="305" x2="385" y2="324" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="369" y1="324" x2="401" y2="324" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="375" y1="331" x2="395" y2="331" stroke="#1e293b" stroke-width="2"/>
  <line x1="381" y1="338" x2="389" y2="338" stroke="#1e293b" stroke-width="1.8"/>

  <!-- Formula badge -->
  <rect x="572" y="20" width="166" height="44" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.6"/>
  <text x="655" y="40" text-anchor="middle" font-family="sans-serif" font-size="13.5" font-weight="700" fill="#1d4ed8">vₒ = −(Rf / R₁) · vᵢ</text>
  <text x="655" y="56" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#1e40af">Av = −22k / 10k = −2.2</text>
</svg>`);

export const SVG_ACT3 =
  tune(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 320" width="760" height="320" role="img" aria-label="反相放大器输入电阻等效模型（对齐 Sadiku Fig. 5.11）">
  <defs>
    <marker id="arr-b3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="320" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="32" font-family="sans-serif" font-size="16.5" font-weight="700" fill="#0f172a">图 3.1 反相放大器二端口等效模型（对齐 Sadiku Fig. 5.11，含前级加载分析）</text>

  <!-- Left box: Signal source with Rs -->
  <rect x="30" y="66" width="190" height="215" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 3"/>
  <text x="125" y="88" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#475569">前级信号源</text>
  <circle cx="80" cy="185" r="24" fill="#ffffff" stroke="#2563eb" stroke-width="2.2"/>
  <text x="80" y="179" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#2563eb">+</text>
  <text x="80" y="201" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#2563eb">−</text>
  <text x="44" y="190" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#2563eb">Vs</text>
  <polyline points="80,161 80,125 118,125" fill="none" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="118" y="113" width="66" height="24" rx="4" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>
  <text x="151" y="130" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#334155">Rs</text>
  <line x1="184" y1="125" x2="265" y2="125" stroke="#1e293b" stroke-width="2.2"/>
  <polyline points="80,209 80,255 265,255" fill="none" stroke="#1e293b" stroke-width="2.2"/>

  <!-- Input port arrow -->
  <line x1="200" y1="108" x2="248" y2="108" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-b3)"/>
  <text x="224" y="99" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2563eb">i₁</text>
  <circle cx="265" cy="125" r="4.5" fill="#2563eb"/>
  <circle cx="265" cy="255" r="4.5" fill="#1e293b"/>
  <text x="265" y="195" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#2563eb">vᵢ</text>
  <text x="265" y="148" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#2563eb">+</text>
  <text x="265" y="242" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#2563eb">−</text>

  <!-- Right box: Equivalent Inverting Amplifier (Fig. 5.11) -->
  <rect x="295" y="66" width="435" height="215" rx="8" fill="#eff6ff" fill-opacity="0.45" stroke="#3b82f6" stroke-width="1.8"/>
  <text x="512" y="88" text-anchor="middle" font-family="sans-serif" font-size="13.5" font-weight="700" fill="#1d4ed8">反相放大器等效电路（Sadiku Fig. 5.11）</text>

  <!-- Input side Rin = R1 -->
  <polyline points="265,125 365,125 365,152" fill="none" stroke="#1e293b" stroke-width="2.4"/>
  <rect x="349" y="152" width="32" height="72" rx="4" fill="#fffbeb" stroke="#d97706" stroke-width="2.4"/>
  <text x="422" y="182" font-family="sans-serif" font-size="14" font-weight="700" fill="#92400e">Rin = R₁</text>
  <text x="422" y="200" font-family="sans-serif" font-size="11.5" fill="#b45309">（因虚地等效接地）</text>
  <polyline points="365,224 365,255 265,255" fill="none" stroke="#1e293b" stroke-width="2.4"/>

  <!-- Output side VCVS -->
  <line x1="570" y1="125" x2="680" y2="125" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="570" y1="125" x2="570" y2="156" stroke="#1e293b" stroke-width="2.4"/>
  <polygon points="570,156 600,188 570,220 540,188" fill="#ffffff" stroke="#dc2626" stroke-width="2.4"/>
  <text x="570" y="177" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#dc2626">+</text>
  <text x="570" y="211" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#dc2626">−</text>
  <text x="570" y="242" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#dc2626">−(Rf/R₁) vᵢ</text>
  <line x1="570" y1="220" x2="570" y2="255" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="570" y1="255" x2="680" y2="255" stroke="#1e293b" stroke-width="2.4"/>

  <!-- Output terminals -->
  <circle cx="680" cy="125" r="5" fill="#ffffff" stroke="#dc2626" stroke-width="2.4"/>
  <circle cx="680" cy="255" r="5" fill="#ffffff" stroke="#1e293b" stroke-width="2.2"/>
  <text x="700" y="195" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#dc2626">vₒ</text>
  <text x="680" y="150" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#dc2626">+</text>
  <text x="680" y="242" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#dc2626">−</text>

  <!-- Ground symbol at bottom -->
  <line x1="365" y1="255" x2="570" y2="255" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="468" y1="255" x2="468" y2="294" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="452" y1="294" x2="484" y2="294" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="458" y1="301" x2="478" y2="301" stroke="#1e293b" stroke-width="2"/>
  <line x1="464" y1="308" x2="472" y2="308" stroke="#1e293b" stroke-width="1.8"/>
</svg>`);

export const SVG_ACT4 =
  tune(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 350" width="760" height="350" role="img" aria-label="Sadiku Example 5.3 反相放大器与 Example 5.4 跨阻放大器电路图">
  <defs>
    <marker id="arr-b4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
    <marker id="arr-r4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="350" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="30" font-family="sans-serif" font-size="16" font-weight="700" fill="#0f172a">图 4.1 经典例题对照：左为 Example 5.3（电压放大），右为 Example 5.4（跨阻放大器 TIA）</text>

  <!-- LEFT PANEL: Example 5.3 -->
  <rect x="18" y="48" width="420" height="284" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.4"/>
  <text x="32" y="72" font-family="sans-serif" font-size="13.5" font-weight="700" fill="#1d4ed8">Example 5.3（Sadiku Fig. 5.12）</text>

  <!-- vi = 0.5V & R1 = 10k -->
  <circle cx="48" cy="182" r="5" fill="#ffffff" stroke="#2563eb" stroke-width="2.2"/>
  <text x="48" y="166" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#2563eb">vᵢ=0.5V</text>
  <line x1="53" y1="182" x2="88" y2="182" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="88" y="170" width="66" height="24" rx="3" fill="#fffbeb" stroke="#d97706" stroke-width="2"/>
  <text x="121" y="187" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#92400e">10 kΩ</text>
  <line x1="154" y1="182" x2="230" y2="182" stroke="#1e293b" stroke-width="2.2"/>

  <!-- i1 = 50uA -->
  <line x1="158" y1="168" x2="196" y2="168" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-b4)"/>
  <text x="177" y="160" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#2563eb">i₁=50µA</text>

  <!-- Node 1 & Rf = 25k -->
  <circle cx="195" cy="182" r="4" fill="#dc2626"/>
  <polyline points="195,182 195,112 240,112" fill="none" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="240" y="100" width="68" height="24" rx="3" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
  <text x="274" y="117" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#065f46">25 kΩ</text>
  <polyline points="308,112 355,112 355,204" fill="none" stroke="#1e293b" stroke-width="2.2"/>

  <!-- Op-amp -->
  <polygon points="230,158 230,250 320,204" fill="#ffffff" stroke="#0f172a" stroke-width="2.4"/>
  <text x="242" y="188" font-family="sans-serif" font-size="16" font-weight="700" fill="#dc2626">−</text>
  <text x="241" y="234" font-family="sans-serif" font-size="15" font-weight="700" fill="#2563eb">+</text>
  <polyline points="230,228 205,228 205,274" fill="none" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="193" y1="274" x2="217" y2="274" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="197" y1="280" x2="213" y2="280" stroke="#1e293b" stroke-width="1.8"/>
  <line x1="202" y1="286" x2="208" y2="286" stroke="#1e293b" stroke-width="1.6"/>

  <!-- Output & io -->
  <line x1="320" y1="204" x2="405" y2="204" stroke="#1e293b" stroke-width="2.2"/>
  <circle cx="355" cy="204" r="4" fill="#1e293b"/>
  <circle cx="405" cy="204" r="5" fill="#ffffff" stroke="#dc2626" stroke-width="2.2"/>
  <text x="396" y="191" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#dc2626">vₒ=−1.25V</text>
  <line x1="322" y1="220" x2="348" y2="220" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-r4)"/>
  <text x="355" y="236" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#dc2626">iₒ=−50µA (灌流)</text>
  <text x="32" y="314" font-family="sans-serif" font-size="11.5" fill="#475569">注：若输出外接 RL=5kΩ 到地，则 iₒ = −300 µA</text>

  <!-- RIGHT PANEL: Example 5.4 TIA -->
  <rect x="452" y="48" width="290" height="284" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.4"/>
  <text x="466" y="72" font-family="sans-serif" font-size="13.5" font-weight="700" fill="#059669">Example 5.4（跨阻放大器 TIA）</text>

  <!-- Current source is = 200 uA -->
  <circle cx="496" cy="224" r="20" fill="#ffffff" stroke="#059669" stroke-width="2.2"/>
  <line x1="496" y1="236" x2="496" y2="212" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-b4)"/>
  <text x="496" y="182" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#059669">i_s=200µA</text>
  <polyline points="496,204 496,192 560,192" fill="none" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="496" y1="244" x2="496" y2="274" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="484" y1="274" x2="508" y2="274" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="488" y1="280" x2="504" y2="280" stroke="#1e293b" stroke-width="1.8"/>

  <!-- Feedback Rf = 20k -->
  <circle cx="534" cy="192" r="4" fill="#dc2626"/>
  <polyline points="534,192 534,116 575,116" fill="none" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="575" y="104" width="66" height="24" rx="3" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
  <text x="608" y="121" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#065f46">20 kΩ</text>
  <polyline points="641,116 680,116 680,210" fill="none" stroke="#1e293b" stroke-width="2.2"/>

  <!-- Op-amp -->
  <polygon points="560,168 560,252 645,210" fill="#ffffff" stroke="#0f172a" stroke-width="2.4"/>
  <text x="571" y="197" font-family="sans-serif" font-size="16" font-weight="700" fill="#dc2626">−</text>
  <text x="570" y="238" font-family="sans-serif" font-size="15" font-weight="700" fill="#2563eb">+</text>
  <polyline points="560,232 538,232 538,274" fill="none" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="526" y1="274" x2="550" y2="274" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="530" y1="280" x2="546" y2="280" stroke="#1e293b" stroke-width="1.8"/>

  <!-- Output -->
  <line x1="645" y1="210" x2="716" y2="210" stroke="#1e293b" stroke-width="2.2"/>
  <circle cx="680" cy="210" r="4" fill="#1e293b"/>
  <circle cx="716" cy="210" r="5" fill="#ffffff" stroke="#dc2626" stroke-width="2.2"/>
  <text x="698" y="242" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#dc2626">vₒ=−4.0V</text>
  <text x="466" y="314" font-family="sans-serif" font-size="12" font-weight="700" fill="#065f46">vₒ = −Rf · i_s（光电二极管前级）</text>
</svg>`);

export const SVG_ACT5 =
  tune(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 390" width="760" height="390" role="img" aria-label="反相放大器传输特性曲线与 ±9V 双电源及单 +9V 削波对比图">
  <defs>
    <marker id="axis-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="390" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="30" font-family="sans-serif" font-size="16" font-weight="700" fill="#0f172a">图 5.1 传输特性曲线（Av = −2.2）：±9V 双电源线性窗口 vs 单 +9V 供电 0V 削波死锁</text>

  <!-- Coordinate system: origin at (360, 200), x-scale: 48px/V (-6V to +6V), y-scale: 14px/V (-10V to +10V) -->
  <!-- Shaded linear region: vi from -3.41V (x=196.3) to +4.09V (x=556.3) -->
  <rect x="196" y="60" width="360" height="280" fill="#ecfdf5" fill-opacity="0.7"/>
  <text x="376" y="78" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#047857">±9V 双电源线性区：−3.41 V ≤ vᵢ ≤ +4.09 V</text>

  <!-- Grid lines for rails -->
  <line x1="72" y1="95" x2="660" y2="95" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4 4"/>
  <text x="668" y="99" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#475569">+7.5V (正饱和)</text>
  <line x1="72" y1="326" x2="660" y2="326" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4 4"/>
  <text x="668" y="330" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#475569">−9.0V (负饱和)</text>

  <!-- Axes -->
  <line x1="72" y1="200" x2="665" y2="200" stroke="#334155" stroke-width="2" marker-end="url(#axis-arr)"/>
  <line x1="360" y1="355" x2="360" y2="50" stroke="#334155" stroke-width="2" marker-end="url(#axis-arr)"/>
  <text x="676" y="205" font-family="sans-serif" font-size="14" font-weight="700" fill="#0f172a">vᵢ (V)</text>
  <text x="370" y="56" font-family="sans-serif" font-size="14" font-weight="700" fill="#0f172a">vₒ (V)</text>
  <text x="346" y="216" font-family="sans-serif" font-size="12" fill="#475569">0</text>

  <!-- Critical vertical markers -->
  <line x1="196" y1="95" x2="196" y2="200" stroke="#059669" stroke-width="1.3" stroke-dasharray="3 3"/>
  <text x="196" y="218" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#047857">−3.41V</text>
  <line x1="556" y1="200" x2="556" y2="326" stroke="#059669" stroke-width="1.3" stroke-dasharray="3 3"/>
  <text x="556" y="191" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#047857">+4.09V</text>

  <!-- Dual +-9V Curve (Blue solid): (-6,7.5)->(-3.41,7.5)->(0,0)->(4.09,-9.0)->(6,-9.0) -->
  <polyline points="72,95 196,95 360,200 556,326 648,326" fill="none" stroke="#2563eb" stroke-width="3.2"/>
  <circle cx="196" cy="95" r="4.5" fill="#2563eb"/>
  <circle cx="556" cy="326" r="4.5" fill="#2563eb"/>
  <text x="455" y="248" font-family="sans-serif" font-size="13" font-weight="700" fill="#1d4ed8">斜率 = −Rf / R₁ = −2.2</text>

  <!-- Single +9V Failure Curve (Red dashed): for vi > 0, clipped at 0V -->
  <polyline points="360,200 648,200" fill="none" stroke="#dc2626" stroke-width="3.2" stroke-dasharray="8 5"/>
  <rect x="404" y="138" width="236" height="42" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="522" y="156" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#b91c1c">单 +9V 供电错误曲线（红虚线）</text>
  <text x="522" y="172" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#dc2626">vᵢ &gt; 0 时输出死锁 0 V 削波！</text>
  <line x1="505" y1="180" x2="480" y2="198" stroke="#dc2626" stroke-width="1.6"/>

  <!-- Legend -->
  <rect x="30" y="346" width="700" height="32" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
  <line x1="52" y1="362" x2="92" y2="362" stroke="#2563eb" stroke-width="3"/>
  <text x="100" y="366" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">±9V 双电源 LM358 实测曲线</text>
  <line x1="305" y1="362" x2="345" y2="362" stroke="#dc2626" stroke-width="3" stroke-dasharray="7 4"/>
  <text x="353" y="366" font-family="sans-serif" font-size="12" font-weight="700" fill="#b91c1c">单 +9V 误接 0V 削波曲线</text>
  <text x="530" y="366" font-family="sans-serif" font-size="11.5" fill="#475569">单电源方案需加 Vcc/2 偏置</text>
</svg>`);

export const SVG_ACT6 =
  tune(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 350" width="760" height="350" role="img" aria-label="LM358 DIP-8 ±9V 双电源面包板接线俯视示意图（台式可调直流电源供电）">
  <rect x="0" y="0" width="760" height="350" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="24" y="30" font-family="sans-serif" font-size="16" font-weight="700" fill="#0f172a">图 6.1 LM358 (DIP-8) ±9V 双电源面包板实测接线俯视图</text>

  <!-- Breadboard body -->
  <rect x="215" y="54" width="515" height="270" rx="10" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
  <!-- Top +9V rail -->
  <rect x="230" y="66" width="485" height="20" rx="4" fill="#fee2e2" stroke="#dc2626" stroke-width="1.4"/>
  <text x="242" y="80" font-family="sans-serif" font-size="12" font-weight="700" fill="#b91c1c">+9 V 电源轨（红）</text>
  <!-- Bottom GND & -9V rails -->
  <rect x="230" y="266" width="485" height="20" rx="4" fill="#f1f5f9" stroke="#334155" stroke-width="1.4"/>
  <text x="242" y="280" font-family="sans-serif" font-size="12" font-weight="700" fill="#0f172a">0 V 参考地轨 GND（黑，电源两路串联公共端 COM）</text>
  <rect x="230" y="294" width="485" height="20" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="1.4"/>
  <text x="242" y="308" font-family="sans-serif" font-size="12" font-weight="700" fill="#1d4ed8">−9 V 电源轨（蓝）</text>

  <!-- Center trench -->
  <rect x="230" y="172" width="485" height="16" fill="#e2e8f0"/>
  <text x="645" y="184" font-family="sans-serif" font-size="10.5" fill="#64748b">中央隔离槽</text>

  <!-- 台式可调直流电源（±9 V）: two 9 V outputs in series, CH1 − linked to CH2 + = COM -->
  <rect x="14" y="44" width="170" height="256" rx="10" fill="#ffffff" stroke="#475569" stroke-width="1.6"/>
  <text x="99" y="62" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0f172a">台式可调直流电源（±9 V）</text>
  <rect x="26" y="74" width="146" height="92" rx="8" fill="#fffbeb" stroke="#d97706" stroke-width="1.8"/>
  <text x="99" y="96" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#92400e">CH1 输出 (9 V)</text>
  <text x="99" y="116" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#dc2626">+ 极 → +9V 轨</text>
  <text x="99" y="138" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#0f172a">− 极 → 串联公共端 COM</text>

  <rect x="26" y="196" width="146" height="92" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="1.8"/>
  <text x="99" y="218" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1d4ed8">CH2 输出 (9 V)</text>
  <text x="99" y="238" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#0f172a">+ 极 → 串联公共端 COM</text>
  <text x="99" y="260" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#2563eb">− 极 → −9V 轨</text>

  <!-- Power feed wires -->
  <polyline points="172,96 200,96 200,76 230,76" fill="none" stroke="#dc2626" stroke-width="2.5"/>
  <polyline points="172,150 188,150 188,214 172,214" fill="none" stroke="#0f172a" stroke-width="2.5"/>
  <circle cx="188" cy="182" r="4.5" fill="#0f172a"/>
  <polyline points="188,182 204,182 204,276 230,276" fill="none" stroke="#0f172a" stroke-width="2.5"/>
  <polyline points="172,262 194,262 194,304 230,304" fill="none" stroke="#2563eb" stroke-width="2.5"/>

  <!-- LM358 DIP-8 IC -->
  <rect x="380" y="142" width="170" height="76" rx="6" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
  <path d="M 380 168 A 12 12 0 0 1 380 192" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <text x="468" y="185" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#f8fafc">LM358 (DIP-8)</text>

  <!-- Pins 1-4 (bottom) and 8-5 (top) -->
  <!-- Pin 8 (+9V) -->
  <rect x="396" y="130" width="12" height="12" fill="#cbd5e1" stroke="#475569"/>
  <text x="402" y="158" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#f8fafc">8</text>
  <line x1="402" y1="130" x2="402" y2="86" stroke="#dc2626" stroke-width="2.6"/>
  <text x="442" y="112" font-family="sans-serif" font-size="11" font-weight="700" fill="#dc2626">Pin 8 → +9V</text>

  <!-- Pin 1 (OUT1) -->
  <rect x="396" y="218" width="12" height="12" fill="#cbd5e1" stroke="#475569"/>
  <text x="402" y="212" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#f8fafc">1</text>
  <!-- Pin 2 (IN1-) -->
  <rect x="440" y="218" width="12" height="12" fill="#cbd5e1" stroke="#475569"/>
  <text x="446" y="212" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#f8fafc">2</text>
  <!-- Pin 3 (IN1+) -->
  <rect x="484" y="218" width="12" height="12" fill="#cbd5e1" stroke="#475569"/>
  <text x="490" y="212" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#f8fafc">3</text>
  <!-- Pin 4 (V-) -->
  <rect x="528" y="218" width="12" height="12" fill="#cbd5e1" stroke="#475569"/>
  <text x="534" y="212" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#f8fafc">4</text>

  <!-- Pin 3 to GND -->
  <line x1="490" y1="230" x2="490" y2="266" stroke="#0f172a" stroke-width="2.6"/>
  <text x="490" y="253" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#0f172a">Pin3→GND</text>

  <!-- Pin 4 to -9V -->
  <line x1="534" y1="230" x2="534" y2="294" stroke="#2563eb" stroke-width="2.6"/>
  <text x="572" y="254" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563eb">Pin 4 → −9V</text>

  <!-- R1 = 10k from vi to Pin 2 -->
  <circle cx="268" cy="242" r="5" fill="#2563eb"/>
  <text x="268" y="229" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#2563eb">输入 vᵢ</text>
  <line x1="273" y1="242" x2="296" y2="242" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="296" y="232" width="76" height="20" rx="4" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
  <text x="334" y="246" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#92400e">R₁ 10kΩ</text>
  <polyline points="372,242 446,242 446,230" fill="none" stroke="#1e293b" stroke-width="2.2"/>

  <!-- Rf = 22k from Pin 2 to Pin 1 -->
  <polyline points="446,230 446,256 402,256 402,230" fill="none" stroke="#059669" stroke-width="2.2"/>
  <rect x="384" y="247" width="78" height="18" rx="4" fill="#d1fae5" stroke="#059669" stroke-width="1.8"/>
  <text x="423" y="260" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#065f46">Rf 22kΩ</text>

  <!-- DMM Probe callout at Pin 1 -->
  <polyline points="402,230 342,196 290,196" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-dasharray="4 3"/>
  <rect x="234" y="126" width="128" height="44" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="298" y="145" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#b91c1c">万用表红表笔测点</text>
  <text x="298" y="161" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#dc2626">Pin 1 (vₒ) / Pin 2 (虚地)</text>
</svg>`);

export const MINI_STEP1 = tune(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect width="260" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1"/><polygon points="120,24 120,86 190,55" fill="#fff" stroke="#0f172a" stroke-width="2"/><text x="130" y="46" font-size="13" font-weight="700" fill="#dc2626">−</text><text x="129" y="73" font-size="13" font-weight="700" fill="#2563eb">+</text><line x1="55" y1="42" x2="120" y2="42" stroke="#1e293b" stroke-width="2"/><circle cx="85" cy="42" r="11" fill="#fef08a" stroke="#ca8a04" stroke-dasharray="3 2"/><text x="85" y="25" text-anchor="middle" font-size="11" font-weight="700" fill="#854d0e">v₋ = ?</text><polyline points="120,68 95,68 95,94" fill="none" stroke="#1e293b" stroke-width="2"/><line x1="85" y1="94" x2="105" y2="94" stroke="#1e293b" stroke-width="2"/><text x="112" y="98" font-size="10.5" fill="#0f172a">v₊=0V</text></svg>`,
);

export const MINI_STEP2 = tune(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect width="260" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1"/><circle cx="34" cy="58" r="4.5" fill="#2563eb"/><text x="34" y="42" text-anchor="middle" font-size="11.5" font-weight="700" fill="#2563eb">0.5 V</text><line x1="39" y1="58" x2="76" y2="58" stroke="#1e293b" stroke-width="2"/><rect x="76" y="46" width="68" height="24" rx="3" fill="#fffbeb" stroke="#d97706" stroke-width="2"/><text x="110" y="62" text-anchor="middle" font-size="11.5" font-weight="700" fill="#92400e">10 kΩ</text><line x1="144" y1="58" x2="212" y2="58" stroke="#1e293b" stroke-width="2"/><circle cx="212" cy="58" r="5" fill="#dc2626"/><text x="212" y="42" text-anchor="middle" font-size="11.5" font-weight="700" fill="#854d0e">v₋=0 V</text><text x="176" y="84" text-anchor="middle" font-size="11.5" font-weight="700" fill="#2563eb">i₁ → ?</text></svg>`,
);

export const MINI_STEP3 = tune(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect width="260" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1"/><line x1="30" y1="76" x2="150" y2="76" stroke="#1e293b" stroke-width="2"/><circle cx="85" cy="76" r="4" fill="#dc2626"/><polyline points="85,76 85,28 135,28" fill="none" stroke="#1e293b" stroke-width="2"/><rect x="135" y="18" width="64" height="20" rx="3" fill="#ecfdf5" stroke="#059669" stroke-width="2"/><text x="167" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#065f46">25 kΩ</text><line x1="114" y1="69" x2="128" y2="83" stroke="#dc2626" stroke-width="2.4"/><line x1="128" y1="69" x2="114" y2="83" stroke="#dc2626" stroke-width="2.4"/><text x="122" y="98" text-anchor="middle" font-size="10.5" font-weight="700" fill="#dc2626">i₋ = 0</text><text x="110" y="52" font-size="11" font-weight="700" fill="#059669">i_f = ?</text></svg>`,
);

export const MINI_STEP4 = tune(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect width="260" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1"/><circle cx="38" cy="58" r="4.5" fill="#dc2626"/><text x="38" y="40" text-anchor="middle" font-size="11" font-weight="700" fill="#854d0e">0 V</text><line x1="43" y1="58" x2="82" y2="58" stroke="#1e293b" stroke-width="2"/><rect x="82" y="46" width="72" height="24" rx="3" fill="#ecfdf5" stroke="#059669" stroke-width="2"/><text x="118" y="62" text-anchor="middle" font-size="11.5" font-weight="700" fill="#065f46">25 kΩ</text><line x1="154" y1="58" x2="214" y2="58" stroke="#1e293b" stroke-width="2"/><circle cx="214" cy="58" r="4.5" fill="#dc2626"/><text x="214" y="40" text-anchor="middle" font-size="11.5" font-weight="700" fill="#dc2626">vₒ = ?</text><text x="118" y="90" text-anchor="middle" font-size="11" fill="#059669">50 µA 从 0 V 向右流过 25 kΩ</text></svg>`,
);

export const MINI_STEP5 = tune(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect width="260" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1"/><polygon points="54,32 54,88 118,60" fill="#fff" stroke="#0f172a" stroke-width="2"/><line x1="118" y1="60" x2="216" y2="60" stroke="#1e293b" stroke-width="2"/><line x1="176" y1="20" x2="176" y2="60" stroke="#059669" stroke-width="2"/><circle cx="176" cy="60" r="4" fill="#1e293b"/><text x="212" y="34" text-anchor="middle" font-size="11" font-weight="700" fill="#059669">i_f=50µA ↓</text><text x="144" y="84" text-anchor="middle" font-size="11.5" font-weight="700" fill="#dc2626">iₒ → ?</text><text x="218" y="84" text-anchor="middle" font-size="10.5" fill="#64748b">(空载开路)</text></svg>`,
);

export const EX53_PROBLEM =
  tune(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 40 436 300" width="436" height="300" role="img" aria-label="Sadiku Example 5.3 反相放大器题图（R₁ = 10 kΩ，R_f = 25 kΩ，vᵢ = 0.5 V）">
  <defs>
    <marker id="arr-b4p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
    <marker id="arr-r4p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
  </defs>
  <rect x="18" y="48" width="420" height="284" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.4"/>
  <text x="32" y="72" font-family="sans-serif" font-size="13.5" font-weight="700" fill="#1d4ed8">Example 5.3（Sadiku Fig. 5.12）· 题图</text>
  <!-- vi = 0.5V & R1 = 10k -->
  <circle cx="48" cy="182" r="5" fill="#ffffff" stroke="#2563eb" stroke-width="2.2"/>
  <text x="48" y="166" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#2563eb">vᵢ=0.5V</text>
  <line x1="53" y1="182" x2="88" y2="182" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="88" y="170" width="66" height="24" rx="3" fill="#fffbeb" stroke="#d97706" stroke-width="2"/>
  <text x="121" y="187" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#92400e">10 kΩ</text>
  <line x1="154" y1="182" x2="230" y2="182" stroke="#1e293b" stroke-width="2.2"/>

  <!-- i1 = 50uA -->
  <line x1="158" y1="168" x2="196" y2="168" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-b4p)"/>
  <text x="177" y="160" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#2563eb">i₁ = ?</text>

  <!-- Node 1 & Rf = 25k -->
  <circle cx="195" cy="182" r="4" fill="#dc2626"/>
  <polyline points="195,182 195,112 240,112" fill="none" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="240" y="100" width="68" height="24" rx="3" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
  <text x="274" y="117" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#065f46">25 kΩ</text>
  <polyline points="308,112 355,112 355,204" fill="none" stroke="#1e293b" stroke-width="2.2"/>

  <!-- Op-amp -->
  <polygon points="230,158 230,250 320,204" fill="#ffffff" stroke="#0f172a" stroke-width="2.4"/>
  <text x="242" y="188" font-family="sans-serif" font-size="16" font-weight="700" fill="#dc2626">−</text>
  <text x="241" y="234" font-family="sans-serif" font-size="15" font-weight="700" fill="#2563eb">+</text>
  <polyline points="230,228 205,228 205,274" fill="none" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="193" y1="274" x2="217" y2="274" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="197" y1="280" x2="213" y2="280" stroke="#1e293b" stroke-width="1.8"/>
  <line x1="202" y1="286" x2="208" y2="286" stroke="#1e293b" stroke-width="1.6"/>

  <!-- Output & io -->
  <line x1="320" y1="204" x2="405" y2="204" stroke="#1e293b" stroke-width="2.2"/>
  <circle cx="355" cy="204" r="4" fill="#1e293b"/>
  <circle cx="405" cy="204" r="5" fill="#ffffff" stroke="#dc2626" stroke-width="2.2"/>
  <text x="396" y="191" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#dc2626">vₒ = ?</text>
  <line x1="322" y1="220" x2="348" y2="220" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-r4p)"/>
  <text x="355" y="236" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#dc2626">iₒ = ?</text>
  <text x="32" y="314" font-family="sans-serif" font-size="11.5" fill="#475569">求：Aᵥ、vₒ、i₁、i_f 与空载 iₒ（再试 RL = 5 kΩ）</text>

</svg>`);

/* ------------------------------------------------------------- new figures (light theme) */

const F = 'font-family="sans-serif"';

/** an op-amp triangle with − on top, + below; inputs at x0, output at x0 + w */
function amp(x0: number, yc: number, w = 70, h = 70): string {
  const t = yc - h / 2;
  const b = yc + h / 2;
  return `<polygon points="${x0},${t} ${x0},${b} ${x0 + w},${yc}" fill="#ffffff" stroke="#1f2a44" stroke-width="2.2"/>
  <text x="${x0 + 7}" y="${yc - h / 4 + 6}" ${F} font-size="15" font-weight="700" fill="#dc2626">−</text>
  <text x="${x0 + 6}" y="${yc + h / 4 + 6}" ${F} font-size="14" font-weight="700" fill="#2563eb">+</text>`;
}
const gnd = (x: number, y: number) =>
  `<path d="M ${x} ${y} v 8 M ${x - 11} ${y + 8} h 22 M ${x - 7} ${y + 13} h 14 M ${x - 3} ${y + 18} h 6" stroke="#334155" stroke-width="2" fill="none"/>`;
const res = (x: number, y: number, w: number, label: string, tone: 'r1' | 'rf' | 'rl' = 'r1') => {
  const c = { r1: ['#fffbeb', '#d97706', '#92400e'], rf: ['#ecfdf5', '#059669', '#065f46'], rl: ['#f1f5f9', '#64748b', '#334155'] }[tone];
  return `<rect x="${x}" y="${y - 11}" width="${w}" height="22" rx="3" fill="${c[0]}" stroke="${c[1]}" stroke-width="2"/>
  <text x="${x + w / 2}" y="${y + 4.5}" text-anchor="middle" ${F} font-size="11.5" font-weight="700" fill="${c[2]}">${label}</text>`;
};
const W = 'stroke="#334155" stroke-width="2" fill="none"';
const frame = (w: number, h: number, label: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">
  <rect x="0" y="0" width="${w}" height="${h}" rx="10" fill="#fbf7ef" stroke="#e3d8c2" stroke-width="1.2"/>`;

/** Q1: a 0 V reading on Pin 2 — and the tempting jumper to GND */
export const SVG_Q1 = `${frame(380, 190, 'Q1 图：反相放大器 Pin 2 实测 0 V，是否该用跳线把它接到 GND？')}
  <text x="14" y="22" ${F} font-size="12.5" font-weight="700" fill="#1f2a44">Q1 · Pin 2 实测 0 V，它“是地”吗？</text>
  <path d="M 30 92 H 50" ${W}/>
  ${res(50, 92, 62, 'R₁ 10 kΩ')}
  <path d="M 112 92 H 196 M 150 92 V 46 H 196 M 262 46 H 300 V 107" ${W}/>
  ${res(196, 46, 66, 'Rf 22 kΩ', 'rf')}
  <circle cx="30" cy="92" r="4.5" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
  <text x="22" y="80" ${F} font-size="11.5" font-weight="700" fill="#1d4ed8">vᵢ</text>
  ${amp(196, 107, 66, 60)}
  <path d="M 262 107 H 330" ${W}/>
  <text x="334" y="111" ${F} font-size="12" font-weight="700" fill="#b91c1c">vₒ</text>
  <path d="M 196 122 H 182 V 150" ${W}/>
  ${gnd(182, 150)}
  <circle cx="150" cy="92" r="11" fill="#fef08a" fill-opacity="0.6" stroke="#ca8a04" stroke-width="1.6" stroke-dasharray="3 2"/>
  <circle cx="150" cy="92" r="3.5" fill="#dc2626"/>
  <rect x="88" y="112" width="74" height="22" rx="5" fill="#ffffff" stroke="#6b7c55" stroke-width="1.4"/>
  <text x="125" y="127" text-anchor="middle" ${F} font-size="11.5" font-weight="700" fill="#1a2a12">Pin 2：0.00 V</text>
  <path d="M 150 103 C 150 150 120 158 120 172" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4" fill="none"/>
  ${gnd(120, 170).replace('#334155', '#94a3b8')}
  <text x="40" y="176" ${F} font-size="11" font-weight="700" fill="#5f626b">跳线接 GND？</text>
</svg>`;

/** Q2: a 1 kΩ source into a 1 kΩ input resistor */
export const SVG_Q2 = `${frame(380, 190, 'Q2 图：内阻 1 kΩ 的传感器接入 R₁ = 1 kΩ、Rf = 10 kΩ 的反相放大器')}
  <text x="14" y="22" ${F} font-size="12.5" font-weight="700" fill="#1f2a44">Q2 · 传感器带着内阻接进来</text>
  <rect x="12" y="40" width="112" height="132" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="5 3"/>
  <text x="68" y="56" text-anchor="middle" ${F} font-size="11" font-weight="700" fill="#475569">传感器</text>
  <circle cx="34" cy="122" r="16" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
  <text x="34" y="119" text-anchor="middle" ${F} font-size="11" font-weight="700" fill="#2563eb">+</text>
  <text x="34" y="133" text-anchor="middle" ${F} font-size="12" font-weight="700" fill="#2563eb">−</text>
  <text x="56" y="152" ${F} font-size="11" font-weight="700" fill="#1d4ed8">Vs 1.0 V</text>
  <path d="M 34 106 V 84 H 56 M 106 84 H 150" ${W}/>
  ${res(56, 84, 50, 'Rs 1k', 'rl')}
  ${res(150, 84, 54, 'R₁ 1 kΩ')}
  <path d="M 204 84 H 238 M 222 84 V 46 H 252 M 312 46 H 336 V 98" ${W}/>
  ${res(252, 46, 60, 'Rf 10 kΩ', 'rf')}
  ${amp(238, 98, 64, 56)}
  <path d="M 302 98 H 362" ${W}/>
  <text x="314" y="128" ${F} font-size="12" font-weight="700" fill="#b91c1c">vₒ = ?</text>
  <path d="M 34 138 V 172 M 238 112 H 226 V 150" ${W}/>
  ${gnd(226, 150)}
  <text x="134" y="120" ${F} font-size="11" fill="#5f626b">±9 V 供电，未饱和</text>
</svg>`;

/** Q3: Example 5.3 with a 5 kΩ load */
export const SVG_Q3 = `${frame(380, 200, 'Q3 图：Example 5.3 输出端接 RL = 5 kΩ 负载，求运放输出电流')}
  <text x="14" y="22" ${F} font-size="12.5" font-weight="700" fill="#1f2a44">Q3 · Example 5.3 接上 RL = 5 kΩ</text>
  <circle cx="22" cy="86" r="4.5" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
  <text x="12" y="74" ${F} font-size="11" font-weight="700" fill="#1d4ed8">+0.5 V</text>
  <path d="M 26 86 H 44 M 104 86 H 170 M 132 86 V 44 H 168 M 232 44 H 262 V 100" ${W}/>
  ${res(44, 86, 60, '10 kΩ')}
  ${res(168, 44, 64, '25 kΩ', 'rf')}
  ${amp(170, 100, 64, 56)}
  <path d="M 234 100 H 330 M 300 100 V 120" ${W}/>
  <circle cx="262" cy="100" r="3.5" fill="#334155"/>
  <circle cx="300" cy="100" r="3.5" fill="#334155"/>
  <rect x="290" y="120" width="20" height="40" rx="3" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>
  <text x="316" y="145" ${F} font-size="11.5" font-weight="700" fill="#334155">RL 5 kΩ</text>
  <path d="M 300 160 V 170" ${W}/>
  ${gnd(300, 170)}
  <text x="334" y="96" ${F} font-size="11" font-weight="700" fill="#b91c1c">−1.25 V</text>
  <path d="M 170 114 H 156 V 150" ${W}/>
  ${gnd(156, 150)}
  <path d="M 236 122 h 18" stroke="#dc2626" stroke-width="2"/>
  <path d="M 254 118 l 7 4 l -7 4 z" fill="#dc2626"/>
  <text x="222" y="142" ${F} font-size="11.5" font-weight="700" fill="#b91c1c">iₒ = ?</text>
</svg>`;

/** Q4: the readings of the faulty board */
export const SVG_Q4 = `${frame(380, 190, 'Q4 图：LM358 反相放大器实测 vₒ ≈ +0.01 V、Pin 2 ≈ +0.69 V')}
  <text x="14" y="22" ${F} font-size="12.5" font-weight="700" fill="#1f2a44">Q4 · 面包板实测读数（vᵢ = +1.0 V）</text>
  <circle cx="22" cy="92" r="4.5" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
  <text x="12" y="80" ${F} font-size="11" font-weight="700" fill="#1d4ed8">+1.0 V</text>
  <path d="M 26 92 H 44 M 104 92 H 182 M 140 92 V 48 H 176 M 240 48 H 268 V 107" ${W}/>
  ${res(44, 92, 60, 'R₁ 10 kΩ')}
  ${res(176, 48, 64, 'Rf 22 kΩ', 'rf')}
  ${amp(182, 107, 66, 60)}
  <path d="M 215 92 V 74 M 215 122 V 140" stroke="#64748b" stroke-width="2"/>
  <text x="221" y="78" ${F} font-size="10.5" font-weight="700" fill="#5f626b">V⁺</text>
  <text x="221" y="142" ${F} font-size="10.5" font-weight="700" fill="#5f626b">V⁻</text>
  <path d="M 248 107 H 300" ${W}/>
  <path d="M 182 122 H 168 V 156" ${W}/>
  ${gnd(168, 156)}
  <rect x="96" y="118" width="64" height="22" rx="5" fill="#ffe4e6" stroke="#be123c" stroke-width="1.4"/>
  <text x="128" y="133" text-anchor="middle" ${F} font-size="11" font-weight="700" fill="#9f1239">+0.69 V</text>
  <path d="M 140 96 V 118" stroke="#be123c" stroke-width="1.2" stroke-dasharray="3 2"/>
  <rect x="290" y="122" width="78" height="24" rx="5" fill="#c9d8b0" stroke="#6b7c55" stroke-width="1.4"/>
  <text x="329" y="138" text-anchor="middle" ${F} font-size="11.5" font-weight="700" fill="#1a2a12">vₒ ≈ +0.01 V</text>
  <path d="M 300 107 V 122" stroke="#6b7c55" stroke-width="1.2" stroke-dasharray="3 2"/>
  <text x="14" y="178" ${F} font-size="11" fill="#5f626b">理论 vₒ 应为 −2.2 V，Pin 2 应为 0 V</text>
</svg>`;

/** the quiz act: four traps */
export const SVG_QUIZ_ACT = `${frame(340, 220, '诊断测验的四个概念陷阱')}
  <text x="14" y="24" ${F} font-size="13.5" font-weight="700" fill="#1f2a44">四个高频陷阱</text>
  ${[
    ['Q1', '虚地 ≠ 接地', '0 V 的节点能接地线吗？', '#ca8a04', '#fef9c3'],
    ['Q2', 'R_in = R₁', '信号源内阻吃掉多少？', '#d97706', '#fffbeb'],
    ['Q3', '带载 iₒ', '接上负载运放吸多少？', '#dc2626', '#fff1f2'],
    ['Q4', '电源轨', '输出为何卡在 0 V？', '#2563eb', '#eff6ff'],
  ]
    .map(([k, t, s, c, bg], i) => {
      const x = 14 + (i % 2) * 160;
      const y = 36 + Math.floor(i / 2) * 90;
      return `<rect x="${x}" y="${y}" width="152" height="80" rx="9" fill="${bg}" stroke="${c}" stroke-width="1.6"/>
  <text x="${x + 10}" y="${y + 20}" ${F} font-size="11.5" font-weight="800" fill="#1f2a44">${k}</text>
  <text x="${x + 10}" y="${y + 44}" ${F} font-size="14" font-weight="700" fill="#1f2a44">${t}</text>
  <text x="${x + 10}" y="${y + 66}" ${F} font-size="11" fill="#475569">${s}</text>`;
    })
    .join('\n  ')}
</svg>`;

/** next lesson: the non-inverting amplifier */
export const SVG_NEXT = `${frame(520, 200, '下节预告 W3-L4：同相放大器，信号从同相端输入')}
  <text x="16" y="26" ${F} font-size="13.5" font-weight="700" fill="#1f2a44">W3-L4 · 同相放大器：信号换到 + 端</text>
  <circle cx="40" cy="135" r="4.5" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
  <text x="26" y="120" ${F} font-size="12" font-weight="700" fill="#1d4ed8">vᵢ</text>
  <path d="M 44 135 H 200" ${W}/>
  <path d="M 200 100 H 160 V 52 H 236 M 300 52 H 340 V 117" ${W}/>
  ${res(236, 52, 64, 'Rf', 'rf')}
  <path d="M 160 100 V 140" ${W}/>
  <rect x="149" y="140" width="22" height="32" rx="3" fill="#fffbeb" stroke="#d97706" stroke-width="2"/>
  <text x="126" y="161" ${F} font-size="11.5" font-weight="700" fill="#92400e">R₁</text>
  ${gnd(160, 172)}
  <polygon points="200,82 200,152 270,117" fill="#ffffff" stroke="#1f2a44" stroke-width="2.2"/>
  <text x="207" y="108" ${F} font-size="15" font-weight="700" fill="#dc2626">−</text>
  <text x="206" y="141" ${F} font-size="14" font-weight="700" fill="#2563eb">+</text>
  <path d="M 270 117 H 380" ${W}/>
  <text x="384" y="121" ${F} font-size="12" font-weight="700" fill="#b91c1c">vₒ</text>
  <rect x="340" y="146" width="168" height="40" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.4"/>
  <text x="424" y="163" text-anchor="middle" ${F} font-size="12" font-weight="700" fill="#1d4ed8">vₒ 与 vᵢ 同相</text>
  <text x="424" y="179" text-anchor="middle" ${F} font-size="11" fill="#1e3a8a">输入端几乎不取电流</text>
</svg>`;

/** act 6.3: the meter's "fingerprint" of each fault, v_i = +1 V */
export const SVG_FAULTS = `${frame(720, 230, '常见面包板故障的万用表读数对照：正确接线、Pin 4 误接 GND、Rf 虚插、Pin 2 误接 GND')}
  <text x="18" y="26" ${F} font-size="14" font-weight="700" fill="#1f2a44">vᵢ = +1.00 V 时，红表笔点 Pin 1（vₒ）与 Pin 2（v₋）</text>
  ${[
    ['接线正确', '−2.20 V', '0.00 V', '虚地成立，线性放大', '#059669', '#ecfdf5'],
    ['Pin 4 误接 GND', '≈ 0 V', '+0.69 V', '单 +9 V：输出降不下去', '#dc2626', '#fff1f2'],
    ['Rf 虚插 / 开路', '−9.00 V', '+1.00 V', '开环比较器：撞轨跳变', '#d97706', '#fffbeb'],
    ['Pin 2 误接 GND', '0.00 V', '0.00 V', '真地顶替虚地，vₒ 不跟 vᵢ', '#2563eb', '#eff6ff'],
  ]
    .map(([t, vo, vm, s, c, bg], i) => {
      const x = 18 + i * 174;
      return `<rect x="${x}" y="42" width="162" height="172" rx="10" fill="${bg}" stroke="${c}" stroke-width="1.6"/>
  <text x="${x + 12}" y="66" ${F} font-size="13" font-weight="800" fill="#1f2a44">${t}</text>
  <rect x="${x + 12}" y="80" width="138" height="34" rx="6" fill="#c9d8b0" stroke="#6b7c55" stroke-width="1.3"/>
  <text x="${x + 20}" y="102" ${F} font-size="11" font-weight="700" fill="#1a2a12">Pin 1</text>
  <text x="${x + 142}" y="102" text-anchor="end" ${F} font-size="14" font-weight="800" fill="#1a2a12">${vo}</text>
  <rect x="${x + 12}" y="122" width="138" height="34" rx="6" fill="#c9d8b0" stroke="#6b7c55" stroke-width="1.3"/>
  <text x="${x + 20}" y="144" ${F} font-size="11" font-weight="700" fill="#1a2a12">Pin 2</text>
  <text x="${x + 142}" y="144" text-anchor="end" ${F} font-size="14" font-weight="800" fill="#1a2a12">${vm}</text>
  <text x="${x + 12}" y="186" ${F} font-size="11.5" font-weight="700" fill="#475569">${s}</text>`;
    })
    .join('\n  ')}
</svg>`;
