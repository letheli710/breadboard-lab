// The inline SVGs of the W5-L4 lesson sheet (docs/lessons/W5-L4.md), copied from the sheet by a
// script, not retyped: the six act diagrams and the five step diagrams of the guided-example JSON.
// They are drawn for a dark canvas with <style> classes; svgs.ts inlines the classes, recolours
// them for the light theme and adjusts them.

export const SHEET_ACT1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 470" width="960" height="470" role="img" aria-label="多频率激励三子电路拆分原理图">
  <defs>
    <style>
      .bg { fill: #0f172a; }
      .panel { fill: #1e293b; stroke: #334155; stroke-width: 1.5; rx: 10; }
      .wire { stroke: #e2e8f0; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
      .wire-dim { stroke: #475569; stroke-width: 1.5; stroke-dasharray: 5 4; fill: none; }
      .comp { stroke: #38bdf8; stroke-width: 2; fill: none; }
      .src-dc { stroke: #f59e0b; stroke-width: 2; fill: #1e293b; }
      .src-w1 { stroke: #34d399; stroke-width: 2; fill: #1e293b; }
      .src-w2 { stroke: #f472b6; stroke-width: 2; fill: #1e293b; }
      .node { fill: #f8fafc; }
      .title { fill: #f8fafc; font-family: system-ui, -apple-system, sans-serif; font-size: 15px; font-weight: 700; }
      .sub { fill: #94a3b8; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; }
      .lbl { fill: #e2e8f0; font-family: monospace; font-size: 12px; }
      .lbl-dc { fill: #fbbf24; font-family: monospace; font-size: 12px; font-weight: 700; }
      .lbl-w1 { fill: #34d399; font-family: monospace; font-size: 12px; font-weight: 700; }
      .lbl-w2 { fill: #f472b6; font-family: monospace; font-size: 12px; font-weight: 700; }
      .badge { font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; }
    </style>
  </defs>
  <rect class="bg" x="0" y="0" width="960" height="470"/>
  <!-- Top Panel: Original Mixed-Frequency Circuit -->
  <rect class="panel" x="20" y="14" width="920" height="175"/>
  <text class="title" x="38" y="38">原始多频率混合电路（同时含 DC、ω₁ = 2 rad/s、ω₂ = 5 rad/s — 禁止直接写单一相量方程！）</text>
  <!-- Top bus and ground bus -->
  <line class="wire" x1="120" y1="68" x2="820" y2="68"/>
  <line class="wire" x1="120" y1="168" x2="820" y2="168"/>
  <circle class="node" cx="500" cy="68" r="4"/>
  <text class="lbl" x="485" y="57">v_o(t)</text>
  <!-- Branch 1: V0=12V + R1=4 + L=2H -->
  <line class="wire" x1="120" y1="68" x2="120" y2="92"/>
  <circle class="src-dc" cx="120" cy="112" r="18"/>
  <text class="lbl-dc" x="115" y="109">+</text>
  <text class="lbl-dc" x="116" y="124">-</text>
  <line class="wire" x1="120" y1="130" x2="120" y2="168"/>
  <text class="lbl-dc" x="38" y="110">V₀ = 12 V</text>
  <text class="sub" x="38" y="126">(ω₀ = 0)</text>
  <!-- R1 on top wire -->
  <rect x="160" y="60" width="54" height="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text class="lbl" x="163" y="54">R₁=4Ω</text>
  <!-- L on top wire -->
  <path class="comp" d="M245,68 q8,-14 16,0 q8,-14 16,0 q8,-14 16,0 q8,-14 16,0"/>
  <text class="lbl" x="255" y="52">L=2H</text>
  <!-- Branch 2: v1(t)=20cos(2t) + C=0.25F -->
  <line class="wire" x1="380" y1="68" x2="380" y2="85"/>
  <line class="comp" x1="366" y1="85" x2="394" y2="85"/>
  <line class="comp" x1="366" y1="95" x2="394" y2="95"/>
  <text class="lbl" x="398" y="95">C=0.25F</text>
  <line class="wire" x1="380" y1="95" x2="380" y2="112"/>
  <circle class="src-w1" cx="380" cy="130" r="17"/>
  <path d="M372,130 q4,-8 8,0 t8,0" stroke="#34d399" stroke-width="2" fill="none"/>
  <line class="wire" x1="380" y1="147" x2="380" y2="168"/>
  <text class="lbl-w1" x="404" y="132">v₁(t)=20cos(2t)V</text>
  <!-- Branch 3: RL=4 ohm -->
  <line class="wire" x1="590" y1="68" x2="590" y2="92"/>
  <rect x="582" y="92" width="16" height="52" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <line class="wire" x1="590" y1="144" x2="590" y2="168"/>
  <text class="lbl" x="606" y="122">R_L=4Ω</text>
  <text class="lbl" x="562" y="102">+</text>
  <text class="lbl" x="552" y="122">v_o</text>
  <text class="lbl" x="562" y="146">-</text>
  <!-- Branch 4: i2(t)=3sin(5t)A -->
  <line class="wire" x1="760" y1="68" x2="760" y2="98"/>
  <circle class="src-w2" cx="760" cy="118" r="18"/>
  <line stroke="#f472b6" stroke-width="2" x1="760" y1="130" x2="760" y2="106"/>
  <polygon fill="#f472b6" points="760,104 755,112 765,112"/>
  <line class="wire" x1="760" y1="136" x2="760" y2="168"/>
  <text class="lbl-w2" x="786" y="116">i₂(t)=3sin(5t)A</text>
  <text class="sub" x="786" y="132">(ω₂ = 5 rad/s)</text>

  <!-- Arrow Down Decomposition -->
  <text class="title" x="348" y="212" fill="#38bdf8">▼ 按频率拆分为三个独立子宇宙，各自求解后回时域相加 ▼</text>

  <!-- Sub-circuit 0: DC -->
  <rect class="panel" x="20" y="226" width="295" height="228"/>
  <text class="lbl-dc" x="34" y="248">子宇宙 ①：直流 ω₀ = 0</text>
  <text class="sub" x="34" y="265">v₁ 短路，i₂ 开路；L→短路，C→开路</text>
  <line class="wire" x1="56" y1="295" x2="270" y2="295"/>
  <line class="wire" x1="56" y1="395" x2="270" y2="395"/>
  <line class="wire" x1="56" y1="295" x2="56" y2="325"/>
  <circle class="src-dc" cx="56" cy="345" r="16"/>
  <text class="lbl-dc" x="51" y="343">+</text>
  <text class="lbl-dc" x="52" y="356">-</text>
  <line class="wire" x1="56" y1="361" x2="56" y2="395"/>
  <text class="lbl-dc" x="26" y="384">12V</text>
  <rect x="92" y="287" width="44" height="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text class="lbl" x="96" y="282">4Ω</text>
  <!-- L shorted -->
  <line stroke="#fbbf24" stroke-width="3" x1="150" y1="295" x2="205" y2="295"/>
  <text class="lbl-dc" x="155" y="283">L 短路</text>
  <!-- C open -->
  <line class="wire-dim" x1="215" y1="295" x2="215" y2="332"/>
  <line class="wire-dim" x1="215" y1="358" x2="215" y2="395"/>
  <text class="sub" x="192" y="349">C 开路</text>
  <!-- RL -->
  <line class="wire" x1="270" y1="295" x2="270" y2="320"/>
  <rect x="262" y="320" width="16" height="48" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <line class="wire" x1="270" y1="368" x2="270" y2="395"/>
  <text class="lbl" x="282" y="348">4Ω</text>
  <text class="lbl-dc" x="34" y="432">v_o0 = 12 × 4/(4+4) = 6.00 V</text>

  <!-- Sub-circuit 1: w1=2 -->
  <rect class="panel" x="332" y="226" width="296" height="228"/>
  <text class="lbl-w1" x="346" y="248">子宇宙 ②：交流 ω₁ = 2 rad/s</text>
  <text class="sub" x="346" y="265">V₀ 短路，i₂ 开路；Z_L=j4Ω, Z_C=-j2Ω</text>
  <line class="wire" x1="362" y1="295" x2="594" y2="295"/>
  <line class="wire" x1="362" y1="395" x2="594" y2="395"/>
  <!-- Left branch shorted to GND -->
  <line class="wire" x1="362" y1="295" x2="362" y2="395"/>
  <rect x="385" y="287" width="38" height="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text class="lbl" x="388" y="282">4Ω</text>
  <path class="comp" d="M432,295 q6,-10 12,0 q6,-10 12,0 q6,-10 12,0"/>
  <text class="lbl-w1" x="434" y="281">j4Ω</text>
  <!-- Middle v1 + ZC -->
  <line class="wire" x1="505" y1="295" x2="505" y2="314"/>
  <rect x="495" y="314" width="20" height="24" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text class="lbl-w1" x="520" y="330">-j2Ω</text>
  <line class="wire" x1="505" y1="338" x2="505" y2="348"/>
  <circle class="src-w1" cx="505" cy="364" r="15"/>
  <text class="lbl-w1" x="525" y="368">20∠0°</text>
  <line class="wire" x1="505" y1="379" x2="505" y2="395"/>
  <!-- RL -->
  <line class="wire" x1="594" y1="295" x2="594" y2="320"/>
  <rect x="586" y="320" width="16" height="48" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <line class="wire" x1="594" y1="368" x2="594" y2="395"/>
  <text class="lbl" x="576" y="314">4Ω</text>
  <text class="lbl-w1" x="346" y="424">V_o1 = 18.86∠45° V</text>
  <text class="sub" x="346" y="442">→ v_o1(t) = 18.86cos(2t+45°) V</text>

  <!-- Sub-circuit 2: w2=5 -->
  <rect class="panel" x="644" y="226" width="296" height="228"/>
  <text class="lbl-w2" x="658" y="248">子宇宙 ③：交流 ω₂ = 5 rad/s</text>
  <text class="sub" x="658" y="265">V₀, v₁ 短路；Z_L=j10Ω, Z_C=-j0.8Ω</text>
  <line class="wire" x1="670" y1="295" x2="906" y2="295"/>
  <line class="wire" x1="670" y1="395" x2="906" y2="395"/>
  <!-- Branch 1: 4 + j10 -->
  <line class="wire" x1="670" y1="295" x2="670" y2="395"/>
  <rect x="692" y="287" width="52" height="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text class="lbl" x="688" y="282">4+j10Ω</text>
  <!-- Branch 2: ZC = -j0.8 -->
  <line class="wire" x1="775" y1="295" x2="775" y2="322"/>
  <rect x="766" y="322" width="18" height="44" fill="#0f172a" stroke="#f472b6" stroke-width="2"/>
  <line class="wire" x1="775" y1="366" x2="775" y2="395"/>
  <text class="lbl-w2" x="752" y="384">-j0.8Ω</text>
  <!-- Branch 3: RL = 4 -->
  <line class="wire" x1="836" y1="295" x2="836" y2="322"/>
  <rect x="828" y="322" width="16" height="44" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <line class="wire" x1="836" y1="366" x2="836" y2="395"/>
  <text class="lbl" x="826" y="384">4Ω</text>
  <!-- Branch 4: I2 = 3∠-90° -->
  <line class="wire" x1="906" y1="295" x2="906" y2="325"/>
  <circle class="src-w2" cx="906" cy="345" r="16"/>
  <line stroke="#f472b6" stroke-width="2" x1="906" y1="355" x2="906" y2="335"/>
  <polygon fill="#f472b6" points="906,333 902,340 910,340"/>
  <line class="wire" x1="906" y1="361" x2="906" y2="395"/>
  <text class="lbl-w2" x="862" y="314">3∠-90°A</text>
  <text class="lbl-w2" x="658" y="424">V_o2 = 2.50∠-166.26° V</text>
  <text class="sub" x="658" y="442">→ v_o2(t) = 2.50cos(5t-166.26°) V</text>
</svg>`;

export const SHEET_ACT2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 230" width="880" height="230" role="img" aria-label="交流电源变换双向等效原理图">
  <defs>
    <style>
      .bg { fill: #0f172a; }
      .panel { fill: #1e293b; stroke: #334155; stroke-width: 1.5; rx: 10; }
      .wire { stroke: #e2e8f0; stroke-width: 2; fill: none; }
      .comp { stroke: #38bdf8; stroke-width: 2; fill: #0f172a; }
      .src { stroke: #34d399; stroke-width: 2; fill: #1e293b; }
      .port { fill: #0f172a; stroke: #f59e0b; stroke-width: 2.5; }
      .title { fill: #f8fafc; font-family: system-ui, sans-serif; font-size: 14px; font-weight: 700; }
      .lbl { fill: #e2e8f0; font-family: monospace; font-size: 13px; }
      .hl { fill: #34d399; font-family: monospace; font-size: 14px; font-weight: 700; }
      .accent { fill: #fbbf24; font-family: monospace; font-size: 13px; font-weight: 700; }
    </style>
  </defs>
  <rect class="bg" x="0" y="0" width="880" height="230"/>
  <!-- Left Box: Practical AC Voltage Source -->
  <rect class="panel" x="20" y="20" width="320" height="190"/>
  <text class="title" x="38" y="45">实际交流电压源（串联复阻抗）</text>
  <line class="wire" x1="85" y1="85" x2="155" y2="85"/>
  <rect class="comp" x="155" y="72" width="76" height="26"/>
  <text class="lbl" x="184" y="90">Z_s</text>
  <line class="wire" x1="231" y1="85" x2="295" y2="85"/>
  <line class="wire" x1="85" y1="85" x2="85" y2="108"/>
  <circle class="src" cx="85" cy="130" r="22"/>
  <text class="hl" x="80" y="124">+</text>
  <text class="hl" x="81" y="144">-</text>
  <line class="wire" x1="85" y1="152" x2="85" y2="178"/>
  <line class="wire" x1="85" y1="178" x2="295" y2="178"/>
  <circle class="port" cx="295" cy="85" r="5"/>
  <circle class="port" cx="295" cy="178" r="5"/>
  <text class="accent" x="308" y="90">a</text>
  <text class="accent" x="308" y="183">b</text>
  <text class="hl" x="36" y="135">V_s</text>

  <!-- Center Bidirectional Arrow & Formula -->
  <line stroke="#fbbf24" stroke-width="2.5" x1="365" y1="108" x2="515" y2="108"/>
  <polygon fill="#fbbf24" points="518,108 506,102 506,114"/>
  <polygon fill="#fbbf24" points="362,108 374,102 374,114"/>
  <text class="hl" x="386" y="90">V_s = Z_s I_s</text>
  <text class="hl" x="386" y="138">I_s = V_s / Z_s</text>
  <text class="lbl" x="372" y="164" fill="#94a3b8">（端口 a-b 外特性完全等价）</text>

  <!-- Right Box: Practical AC Current Source -->
  <rect class="panel" x="540" y="20" width="320" height="190"/>
  <text class="title" x="558" y="45">实际交流电流源（并联复阻抗）</text>
  <line class="wire" x1="610" y1="85" x2="815" y2="85"/>
  <line class="wire" x1="610" y1="178" x2="815" y2="178"/>
  <!-- Current Source -->
  <line class="wire" x1="610" y1="85" x2="610" y2="108"/>
  <circle class="src" cx="610" cy="130" r="22"/>
  <line stroke="#34d399" stroke-width="2.5" x1="610" y1="144" x2="610" y2="116"/>
  <polygon fill="#34d399" points="610,113 604,123 616,123"/>
  <line class="wire" x1="610" y1="152" x2="610" y2="178"/>
  <text class="hl" x="562" y="135">I_s</text>
  <!-- Parallel Zs -->
  <line class="wire" x1="718" y1="85" x2="718" y2="105"/>
  <rect class="comp" x="703" y="105" width="30" height="54"/>
  <text class="lbl" x="708" y="137">Z_s</text>
  <line class="wire" x1="718" y1="159" x2="718" y2="178"/>
  <circle class="port" cx="815" cy="85" r="5"/>
  <circle class="port" cx="815" cy="178" r="5"/>
  <text class="accent" x="828" y="90">a</text>
  <text class="accent" x="828" y="183">b</text>
</svg>`;

export const SHEET_ACT3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 940 275" width="940" height="275" role="img" aria-label="交流戴维南与诺顿等效电路对比图">
  <defs>
    <style>
      .bg { fill: #0f172a; }
      .panel { fill: #1e293b; stroke: #334155; stroke-width: 1.5; rx: 10; }
      .wire { stroke: #e2e8f0; stroke-width: 2; fill: none; }
      .comp { stroke: #38bdf8; stroke-width: 2; fill: #0f172a; }
      .src-v { stroke: #f59e0b; stroke-width: 2; fill: #1e293b; }
      .src-i { stroke: #f472b6; stroke-width: 2; fill: #1e293b; }
      .port { fill: #0f172a; stroke: #34d399; stroke-width: 2.5; }
      .title { fill: #f8fafc; font-family: system-ui, sans-serif; font-size: 13px; font-weight: 700; }
      .lbl { fill: #e2e8f0; font-family: monospace; font-size: 12px; }
      .hl-v { fill: #fbbf24; font-family: monospace; font-size: 12px; font-weight: 700; }
      .hl-i { fill: #f472b6; font-family: monospace; font-size: 12px; font-weight: 700; }
      .hl-g { fill: #34d399; font-family: monospace; font-size: 12px; font-weight: 700; }
    </style>
  </defs>
  <rect class="bg" x="0" y="0" width="940" height="275"/>
  <!-- Left: Original Circuit -->
  <rect class="panel" x="15" y="16" width="385" height="242"/>
  <text class="title" x="30" y="40">原始含独立源交流网络（求端口 a-b 等效）</text>
  <line class="wire" x1="65" y1="88" x2="355" y2="88"/>
  <line class="wire" x1="65" y1="210" x2="355" y2="210"/>
  <!-- Vs -->
  <line class="wire" x1="65" y1="88" x2="65" y2="128"/>
  <circle class="src-v" cx="65" cy="148" r="18"/>
  <text class="hl-v" x="60" y="144">+</text>
  <text class="hl-v" x="61" y="160">-</text>
  <line class="wire" x1="65" y1="166" x2="65" y2="210"/>
  <text class="hl-v" x="26" y="196">50∠0°V</text>
  <!-- Z1 = 6 - j8 -->
  <rect class="comp" x="100" y="76" width="76" height="24"/>
  <text class="lbl" x="110" y="92">6-j8 Ω</text>
  <!-- Shunt Z2 = j10 -->
  <line class="wire" x1="205" y1="88" x2="205" y2="122"/>
  <rect class="comp" x="187" y="122" width="36" height="52"/>
  <text class="lbl" x="191" y="152">j10Ω</text>
  <line class="wire" x1="205" y1="174" x2="205" y2="210"/>
  <!-- Series R2 = 4 -->
  <rect class="comp" x="235" y="76" width="52" height="24"/>
  <text class="lbl" x="249" y="92">4 Ω</text>
  <!-- Current Source Is = 2∠90° at node a -->
  <line class="wire" x1="315" y1="88" x2="315" y2="128"/>
  <circle class="src-i" cx="315" cy="148" r="18"/>
  <line stroke="#f472b6" stroke-width="2" x1="315" y1="159" x2="315" y2="137"/>
  <polygon fill="#f472b6" points="315,134 310,142 320,142"/>
  <line class="wire" x1="315" y1="166" x2="315" y2="210"/>
  <text class="hl-i" x="284" y="196">2∠90°A</text>
  <!-- Terminals a-b -->
  <circle class="port" cx="355" cy="88" r="5"/>
  <circle class="port" cx="355" cy="210" r="5"/>
  <text class="hl-g" x="368" y="93">a</text>
  <text class="hl-g" x="368" y="215">b</text>

  <!-- Middle: Thevenin Equivalent -->
  <rect class="panel" x="420" y="16" width="245" height="242"/>
  <text class="title" x="435" y="40">交流戴维南等效电路</text>
  <line class="wire" x1="468" y1="88" x2="625" y2="88"/>
  <line class="wire" x1="468" y1="210" x2="625" y2="210"/>
  <line class="wire" x1="468" y1="88" x2="468" y2="128"/>
  <circle class="src-v" cx="468" cy="148" r="18"/>
  <text class="hl-v" x="463" y="144">+</text>
  <text class="hl-v" x="464" y="160">-</text>
  <line class="wire" x1="468" y1="166" x2="468" y2="210"/>
  <rect class="comp" x="515" y="76" width="76" height="24"/>
  <text class="lbl" x="521" y="92">19+j5 Ω</text>
  <text class="lbl" x="536" y="68">Z_Th</text>
  <text class="hl-v" x="434" y="236">V_Th = 113.99∠82.44° V</text>
  <circle class="port" cx="625" cy="88" r="5"/>
  <circle class="port" cx="625" cy="210" r="5"/>
  <text class="hl-g" x="638" y="93">a</text>
  <text class="hl-g" x="638" y="215">b</text>

  <!-- Right: Norton Equivalent -->
  <rect class="panel" x="682" y="16" width="243" height="242"/>
  <text class="title" x="698" y="40">交流诺顿等效电路</text>
  <line class="wire" x1="730" y1="88" x2="888" y2="88"/>
  <line class="wire" x1="730" y1="210" x2="888" y2="210"/>
  <line class="wire" x1="730" y1="88" x2="730" y2="128"/>
  <circle class="src-i" cx="730" cy="148" r="18"/>
  <line stroke="#f472b6" stroke-width="2" x1="730" y1="159" x2="730" y2="137"/>
  <polygon fill="#f472b6" points="730,134 725,142 735,142"/>
  <line class="wire" x1="730" y1="166" x2="730" y2="210"/>
  <line class="wire" x1="818" y1="88" x2="818" y2="120"/>
  <rect class="comp" x="795" y="120" width="46" height="56"/>
  <text class="lbl" x="802" y="145">Z_N=</text>
  <text class="lbl" x="798" y="162">19+j5</text>
  <line class="wire" x1="818" y1="176" x2="818" y2="210"/>
  <text class="hl-i" x="698" y="236">I_N = 5.80∠67.70° A</text>
  <circle class="port" cx="888" cy="88" r="5"/>
  <circle class="port" cx="888" cy="210" r="5"/>
  <text class="hl-g" x="900" y="93">a</text>
  <text class="hl-g" x="900" y="215">b</text>
</svg>`;

export const SHEET_ACT4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 270" width="920" height="270" role="img" aria-label="含受控源交流戴维南等效与1V测试源法原理图">
  <defs>
    <style>
      .bg { fill: #0f172a; }
      .panel { fill: #1e293b; stroke: #334155; stroke-width: 1.5; rx: 10; }
      .wire { stroke: #e2e8f0; stroke-width: 2; fill: none; }
      .comp { stroke: #38bdf8; stroke-width: 2; fill: #0f172a; }
      .src-ind { stroke: #f59e0b; stroke-width: 2; fill: #1e293b; }
      .src-dep { stroke: #c084fc; stroke-width: 2; fill: #1e293b; }
      .src-test { stroke: #34d399; stroke-width: 2.5; fill: #064e3b; }
      .port { fill: #0f172a; stroke: #34d399; stroke-width: 2.5; }
      .title { fill: #f8fafc; font-family: system-ui, sans-serif; font-size: 13px; font-weight: 700; }
      .lbl { fill: #e2e8f0; font-family: monospace; font-size: 12px; }
      .hl-p { fill: #d8b4fe; font-family: monospace; font-size: 12px; font-weight: 700; }
      .hl-g { fill: #34d399; font-family: monospace; font-size: 12px; font-weight: 700; }
      .hl-v { fill: #fbbf24; font-family: monospace; font-size: 12px; font-weight: 700; }
    </style>
  </defs>
  <rect class="bg" x="0" y="0" width="920" height="270"/>
  <!-- Left Panel: Open-Circuit V_Th -->
  <rect class="panel" x="16" y="16" width="430" height="238"/>
  <text class="title" x="30" y="40">Step A：保留独立源与受控源，求开路电压 V_Th</text>
  <line class="wire" x1="65" y1="88" x2="395" y2="88"/>
  <line class="wire" x1="65" y1="205" x2="395" y2="205"/>
  <!-- Vs = 12∠0° -->
  <line class="wire" x1="65" y1="88" x2="65" y2="126"/>
  <circle class="src-ind" cx="65" cy="146" r="18"/>
  <text class="hl-v" x="60" y="142">+</text>
  <text class="hl-v" x="61" y="158">-</text>
  <line class="wire" x1="65" y1="164" x2="65" y2="205"/>
  <text class="hl-v" x="26" y="192">12∠0°V</text>
  <!-- R1 = 4 -->
  <rect class="comp" x="98" y="76" width="52" height="24"/>
  <text class="lbl" x="112" y="92">4 Ω</text>
  <!-- Node 1 & ZC = -j4 (Vx across it) -->
  <circle fill="#f8fafc" cx="185" cy="88" r="3.5"/>
  <text class="lbl" x="176" y="74">V₁=V_x</text>
  <line class="wire" x1="185" y1="88" x2="185" y2="120"/>
  <rect class="comp" x="168" y="120" width="34" height="52"/>
  <text class="lbl" x="170" y="150">-j4Ω</text>
  <line class="wire" x1="185" y1="172" x2="185" y2="205"/>
  <text class="hl-p" x="148" y="125">+</text>
  <text class="hl-p" x="144" y="150">V_x</text>
  <text class="hl-p" x="148" y="176">-</text>
  <!-- ZL = j4 -->
  <rect class="comp" x="228" y="76" width="56" height="24"/>
  <text class="lbl" x="242" y="92">j4 Ω</text>
  <!-- Dependent VCCS: 0.5 Vx pointing up -->
  <line class="wire" x1="330" y1="88" x2="330" y2="122"/>
  <polygon class="src-dep" points="330,122 352,146 330,170 308,146"/>
  <line stroke="#d8b4fe" stroke-width="2" x1="330" y1="160" x2="330" y2="134"/>
  <polygon fill="#d8b4fe" points="330,131 325,139 335,139"/>
  <line class="wire" x1="330" y1="170" x2="330" y2="205"/>
  <text class="hl-p" x="356" y="150">0.5V_x</text>
  <!-- Terminals -->
  <circle class="port" cx="395" cy="88" r="5"/>
  <circle class="port" cx="395" cy="205" r="5"/>
  <text class="hl-g" x="407" y="92">a</text>
  <text class="hl-g" x="407" y="210">b</text>
  <text class="hl-v" x="30" y="238">解得：V_Th = 6 - j18 V ≈ 18.97∠-71.57° V</text>

  <!-- Right Panel: Test Source Vt = 1∠0° V -->
  <rect class="panel" x="468" y="16" width="436" height="238"/>
  <text class="title" x="482" y="40">Step B：独立源置零，端口外加 V_t = 1∠0° V 测试源</text>
  <line class="wire" x1="510" y1="88" x2="852" y2="88"/>
  <line class="wire" x1="510" y1="205" x2="852" y2="205"/>
  <!-- Vs shorted -->
  <line stroke="#fbbf24" stroke-width="2.5" x1="510" y1="88" x2="510" y2="205"/>
  <text class="hl-v" x="478" y="148">V_s=0</text>
  <text class="hl-v" x="478" y="164">(短路)</text>
  <!-- R1 = 4 -->
  <rect class="comp" x="538" y="76" width="48" height="24"/>
  <text class="lbl" x="550" y="92">4 Ω</text>
  <!-- ZC = -j4 -->
  <circle fill="#f8fafc" cx="622" cy="88" r="3.5"/>
  <text class="lbl" x="610" y="74">V_x</text>
  <line class="wire" x1="622" y1="88" x2="622" y2="120"/>
  <rect class="comp" x="605" y="120" width="34" height="52"/>
  <text class="lbl" x="607" y="150">-j4Ω</text>
  <line class="wire" x1="622" y1="172" x2="622" y2="205"/>
  <!-- ZL = j4 -->
  <rect class="comp" x="660" y="76" width="52" height="24"/>
  <text class="lbl" x="672" y="92">j4 Ω</text>
  <!-- Dependent VCCS kept alive! -->
  <line class="wire" x1="755" y1="88" x2="755" y2="122"/>
  <polygon class="src-dep" points="755,122 776,146 755,170 734,146"/>
  <line stroke="#d8b4fe" stroke-width="2" x1="755" y1="160" x2="755" y2="134"/>
  <polygon fill="#d8b4fe" points="755,131 750,139 760,139"/>
  <line class="wire" x1="755" y1="170" x2="755" y2="205"/>
  <text class="hl-p" x="700" y="194">0.5V_x(保留!)</text>
  <!-- External Test Source Vt = 1∠0° -->
  <line class="wire" x1="852" y1="88" x2="852" y2="126"/>
  <circle class="src-test" cx="852" cy="146" r="18"/>
  <text class="hl-g" x="847" y="142">+</text>
  <text class="hl-g" x="848" y="158">-</text>
  <line class="wire" x1="852" y1="164" x2="852" y2="205"/>
  <text class="hl-g" x="814" y="194">V_t=1∠0°V</text>
  <!-- Arrow for It going LEFT into terminal a -->
  <line stroke="#34d399" stroke-width="2.5" x1="836" y1="74" x2="796" y2="74"/>
  <polygon fill="#34d399" points="792,74 802,69 802,79"/>
  <text class="hl-g" x="802" y="64">I_t</text>
  <text class="hl-g" x="482" y="238">解得：I_t = 0.25+j0.25 A → Z_Th = V_t/I_t = 2 - j2 Ω</text>
</svg>`;

export const SHEET_ACT5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 320" width="900" height="320" role="img" aria-label="含反馈电容的交流反相运算放大器原理图">
  <defs>
    <style>
      .bg { fill: #0f172a; }
      .panel { fill: #1e293b; stroke: #334155; stroke-width: 1.5; rx: 10; }
      .wire { stroke: #e2e8f0; stroke-width: 2; fill: none; stroke-linecap: round; }
      .comp { stroke: #38bdf8; stroke-width: 2; fill: #0f172a; }
      .cap { stroke: #34d399; stroke-width: 2.5; fill: none; }
      .opamp { fill: #1e293b; stroke: #f59e0b; stroke-width: 2.5; }
      .vground { fill: #ef4444; }
      .title { fill: #f8fafc; font-family: system-ui, sans-serif; font-size: 14px; font-weight: 700; }
      .lbl { fill: #e2e8f0; font-family: monospace; font-size: 13px; }
      .hl-g { fill: #34d399; font-family: monospace; font-size: 12px; font-weight: 700; }
      .hl-v { fill: #fbbf24; font-family: monospace; font-size: 13px; font-weight: 700; }
      .hl-r { fill: #f87171; font-family: monospace; font-size: 12px; font-weight: 700; }
      .sub { fill: #94a3b8; font-family: system-ui, sans-serif; font-size: 12px; }
    </style>
  </defs>
  <rect class="bg" x="0" y="0" width="900" height="320"/>
  <rect class="panel" x="18" y="16" width="864" height="288"/>
  <text class="title" x="36" y="42">交流反相运放（反馈支路 Z_f = R_f ∥ C_f）—— 从放大器到有源低通滤波器（预告 W5-L9）</text>

  <!-- Input Vi -->
  <circle fill="#0f172a" stroke="#38bdf8" stroke-width="2" cx="76" cy="186" r="6"/>
  <text class="hl-v" x="42" y="170">V_i(jω)</text>
  <text class="sub" x="36" y="212">2∠0° V</text>
  <line class="wire" x1="82" y1="186" x2="145" y2="186"/>
  <!-- R1 = 10k -->
  <rect class="comp" x="145" y="174" width="76" height="24"/>
  <text class="lbl" x="155" y="190">R₁=10kΩ</text>
  <line class="wire" x1="221" y1="186" x2="360" y2="186"/>

  <!-- Virtual Ground Node -->
  <circle class="vground" cx="270" cy="186" r="5"/>
  <text class="hl-r" x="234" y="215">虚地 V₋ = 0</text>
  <text class="hl-r" x="234" y="232">(I₋ = 0)</text>

  <!-- Op Amp Triangle -->
  <polygon class="opamp" points="360,152 360,262 475,207"/>
  <text class="hl-v" x="372" y="191">−</text>
  <text class="hl-v" x="372" y="238">+</text>
  <text class="lbl" x="394" y="212">Ideal</text>

  <!-- Non-inverting input to GND -->
  <line class="wire" x1="360" y1="232" x2="320" y2="232"/>
  <line class="wire" x1="320" y1="232" x2="320" y2="268"/>
  <line class="wire" x1="306" y1="268" x2="334" y2="268"/>
  <line class="wire" x1="311" y1="274" x2="329" y2="274"/>
  <line class="wire" x1="316" y1="280" x2="324" y2="280"/>

  <!-- Feedback Loop: Rf || Cf -->
  <line class="wire" x1="270" y1="186" x2="270" y2="92"/>
  <line class="wire" x1="270" y1="128" x2="360" y2="128"/>
  <rect class="comp" x="360" y="116" width="82" height="24"/>
  <text class="lbl" x="368" y="132">R_f=50kΩ</text>
  <line class="wire" x1="442" y1="128" x2="525" y2="128"/>

  <!-- Parallel Cf on top branch -->
  <line class="wire" x1="270" y1="92" x2="394" y2="92"/>
  <line class="cap" x1="394" y1="76" x2="394" y2="108"/>
  <line class="cap" x1="406" y1="76" x2="406" y2="108"/>
  <line class="wire" x1="406" y1="92" x2="525" y2="92"/>
  <text class="hl-g" x="368" y="68">C_f = 20 nF</text>

  <!-- Right feedback drop to output -->
  <line class="wire" x1="525" y1="92" x2="525" y2="207"/>
  <line class="wire" x1="475" y1="207" x2="575" y2="207"/>
  <circle fill="#f8fafc" cx="525" cy="207" r="4"/>
  <circle fill="#0f172a" stroke="#34d399" stroke-width="2" cx="575" cy="207" r="6"/>
  <text class="hl-g" x="556" y="190">V_o(jω)</text>

  <!-- Right Info Callout Card -->
  <rect x="615" y="72" width="245" height="205" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
  <text class="hl-v" x="632" y="98">复增益随 ω 演变规律</text>
  <text class="lbl" x="632" y="124">A_v(jω) = -Z_f / Z₁</text>
  <text class="lbl" x="632" y="146">       = -(R_f/R₁)/(1+jωR_fC_f)</text>
  <line stroke="#334155" stroke-width="1" x1="632" y1="160" x2="844" y2="160"/>
  <text class="hl-g" x="632" y="182">ω = 0 (DC):   |A_v| = 5.00</text>
  <text class="hl-v" x="632" y="206">ω = 1000:     |A_v| = 3.54 (-3dB)</text>
  <text class="lbl" x="632" y="226">              ∠A_v = +135°</text>
  <text class="hl-r" x="632" y="252">ω = 10000:    |A_v| = 0.50 (衰减)</text>
</svg>`;

export const SHEET_ACT6 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 250" width="900" height="250" role="img" aria-label="交流电路分析方法论决策树">
  <defs>
    <style>
      .bg { fill: #0f172a; }
      .box { fill: #1e293b; stroke: #38bdf8; stroke-width: 1.8; rx: 8; }
      .box-win { fill: #064e3b; stroke: #34d399; stroke-width: 2; rx: 8; }
      .box-warn { fill: #451a03; stroke: #f59e0b; stroke-width: 2; rx: 8; }
      .line { stroke: #94a3b8; stroke-width: 2; fill: none; }
      .txt { fill: #f8fafc; font-family: system-ui, sans-serif; font-size: 12px; font-weight: 700; text-anchor: middle; }
      .sub { fill: #cbd5e1; font-family: system-ui, sans-serif; font-size: 11px; text-anchor: middle; }
    </style>
  </defs>
  <rect class="bg" x="0" y="0" width="900" height="250"/>
  <!-- Root -->
  <rect class="box" x="330" y="14" width="240" height="44"/>
  <text class="txt" x="450" y="34">拿到一道交流稳态电路题</text>
  <text class="sub" x="450" y="50">第一步：检查所有独立源的角频率 ω</text>
  <!-- Branch Lines -->
  <path class="line" d="M450,58 L450,78 L140,78 L140,100"/>
  <path class="line" d="M450,78 L360,78 L360,100"/>
  <path class="line" d="M450,78 L580,78 L580,100"/>
  <path class="line" d="M450,78 L780,78 L780,100"/>
  <!-- Node 1: Multi-freq -->
  <rect class="box-warn" x="28" y="100" width="224" height="58"/>
  <text class="txt" x="140" y="122">频率不相同（如 DC+ω₁+ω₂）</text>
  <text class="sub" x="140" y="144">只能用：交流叠加定理</text>
  <rect class="box-win" x="28" y="178" width="224" height="52"/>
  <text class="txt" x="140" y="200">按频拆子电路 → 各自相量解</text>
  <text class="sub" x="140" y="218">→ 全部回时域后再相加</text>
  <line class="line" x1="140" y1="158" x2="140" y2="178"/>
  <!-- Node 2: Op-Amp -->
  <rect class="box" x="266" y="100" width="188" height="58"/>
  <text class="txt" x="360" y="122">同频 + 含理想运放</text>
  <text class="sub" x="360" y="144">负反馈线性区</text>
  <rect class="box-win" x="266" y="178" width="188" height="52"/>
  <text class="txt" x="360" y="200">虚短虚断 + 复阻抗节点法</text>
  <text class="sub" x="360" y="218">A_v = -Z_f/Z₁ 或 1+Z_f/Z₁</text>
  <line class="line" x1="360" y1="158" x2="360" y2="178"/>
  <!-- Node 3: Variable Load -->
  <rect class="box" x="470" y="100" width="220" height="58"/>
  <text class="txt" x="580" y="122">同频 + 端口等效 / 可变负载</text>
  <text class="sub" x="580" y="144">求戴维南 / 诺顿等效</text>
  <rect class="box-win" x="470" y="178" width="220" height="52"/>
  <text class="txt" x="580" y="200">独立源置零求 Z_Th</text>
  <text class="sub" x="580" y="218">含受控源外加 1∠0°V 测试源</text>
  <line class="line" x1="580" y1="158" x2="580" y2="178"/>
  <!-- Node 4: Ladder / General -->
  <rect class="box" x="706" y="100" width="174" height="58"/>
  <text class="txt" x="793" y="122">同频梯形 / 一般网络</text>
  <text class="sub" x="793" y="144">求单支路响应</text>
  <rect class="box-win" x="706" y="178" width="174" height="52"/>
  <text class="txt" x="793" y="200">电源变换 V_s = Z_s I_s</text>
  <text class="sub" x="793" y="218">或 W5-L3 节点/网孔法</text>
  <line class="line" x1="793" y1="158" x2="793" y2="178"/>
</svg>`;

export const SHEET_MINI1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="360" height="110"><rect x="0" y="0" width="360" height="110" fill="#0f172a" rx="8"/><rect x="14" y="22" width="96" height="66" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" rx="6"/><text x="62" y="50" fill="#fbbf24" font-size="12" font-family="monospace" text-anchor="middle">DC: ω₀=0</text><text x="62" y="70" fill="#cbd5e1" font-size="11" font-family="monospace" text-anchor="middle">V₀ = 6 V</text><rect x="132" y="22" width="96" height="66" fill="#1e293b" stroke="#34d399" stroke-width="1.5" rx="6"/><text x="180" y="50" fill="#34d399" font-size="12" font-family="monospace" text-anchor="middle">AC1: ω₁=2</text><text x="180" y="70" fill="#cbd5e1" font-size="11" font-family="monospace" text-anchor="middle">10cos(2t)</text><rect x="250" y="22" width="96" height="66" fill="#1e293b" stroke="#f472b6" stroke-width="1.5" rx="6"/><text x="298" y="50" fill="#f472b6" font-size="12" font-family="monospace" text-anchor="middle">AC2: ω₂=4</text><text x="298" y="70" fill="#cbd5e1" font-size="11" font-family="monospace" text-anchor="middle">5cos(4t)</text></svg>`;

export const SHEET_MINI2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="360" height="110"><rect x="0" y="0" width="360" height="110" fill="#0f172a" rx="8"/><line x1="40" y1="30" x2="300" y2="30" stroke="#e2e8f0" stroke-width="2"/><line x1="40" y1="86" x2="300" y2="86" stroke="#e2e8f0" stroke-width="2"/><circle cx="40" cy="58" r="15" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/><text x="40" y="62" fill="#fbbf24" font-size="11" font-family="monospace" text-anchor="middle">6V</text><line x1="40" y1="30" x2="40" y2="43" stroke="#e2e8f0" stroke-width="2"/><line x1="40" y1="73" x2="40" y2="86" stroke="#e2e8f0" stroke-width="2"/><rect x="84" y="22" width="46" height="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/><text x="107" y="18" fill="#e2e8f0" font-size="11" font-family="monospace" text-anchor="middle">R₁=2Ω</text><line x1="145" y1="30" x2="215" y2="30" stroke="#fbbf24" stroke-width="3"/><text x="180" y="20" fill="#fbbf24" font-size="11" font-family="monospace" text-anchor="middle">L短路</text><line x1="238" y1="30" x2="238" y2="50" stroke="#475569" stroke-dasharray="4 3"/><text x="238" y="62" fill="#94a3b8" font-size="10" font-family="monospace" text-anchor="middle">C开路</text><line x1="300" y1="30" x2="300" y2="42" stroke="#e2e8f0" stroke-width="2"/><rect x="292" y="42" width="16" height="32" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/><line x1="300" y1="74" x2="300" y2="86" stroke="#e2e8f0" stroke-width="2"/><text x="330" y="62" fill="#38bdf8" font-size="11" font-family="monospace" text-anchor="middle">4Ω</text></svg>`;

export const SHEET_MINI3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="360" height="110"><rect x="0" y="0" width="360" height="110" fill="#0f172a" rx="8"/><line x1="42" y1="28" x2="312" y2="28" stroke="#e2e8f0" stroke-width="2"/><line x1="42" y1="88" x2="312" y2="88" stroke="#e2e8f0" stroke-width="2"/><line x1="42" y1="28" x2="42" y2="88" stroke="#e2e8f0" stroke-width="2"/><rect x="75" y="20" width="64" height="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/><text x="107" y="15" fill="#34d399" font-size="11" font-family="monospace" text-anchor="middle">2+j2 Ω</text><line x1="205" y1="28" x2="205" y2="40" stroke="#e2e8f0" stroke-width="2"/><rect x="190" y="40" width="30" height="16" fill="#0f172a" stroke="#34d399" stroke-width="2"/><text x="246" y="52" fill="#34d399" font-size="11" font-family="monospace" text-anchor="middle">-j2Ω</text><circle cx="205" cy="70" r="12" fill="#1e293b" stroke="#34d399" stroke-width="2"/><text x="255" y="74" fill="#34d399" font-size="11" font-family="monospace" text-anchor="middle">10∠0°V</text><line x1="205" y1="82" x2="205" y2="88" stroke="#e2e8f0" stroke-width="2"/><line x1="312" y1="28" x2="312" y2="42" stroke="#e2e8f0" stroke-width="2"/><rect x="304" y="42" width="16" height="32" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/><line x1="312" y1="74" x2="312" y2="88" stroke="#e2e8f0" stroke-width="2"/><text x="336" y="62" fill="#e2e8f0" font-size="11" font-family="monospace" text-anchor="middle">4Ω</text></svg>`;

export const SHEET_MINI4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="360" height="110"><rect x="0" y="0" width="360" height="110" fill="#0f172a" rx="8"/><line x1="38" y1="28" x2="318" y2="28" stroke="#e2e8f0" stroke-width="2"/><line x1="38" y1="88" x2="318" y2="88" stroke="#e2e8f0" stroke-width="2"/><line x1="38" y1="28" x2="38" y2="88" stroke="#e2e8f0" stroke-width="2"/><rect x="64" y="20" width="58" height="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/><text x="93" y="15" fill="#f472b6" font-size="11" font-family="monospace" text-anchor="middle">2+j4 Ω</text><line x1="166" y1="28" x2="166" y2="44" stroke="#e2e8f0" stroke-width="2"/><rect x="152" y="44" width="28" height="28" fill="#0f172a" stroke="#f472b6" stroke-width="2"/><line x1="166" y1="72" x2="166" y2="88" stroke="#e2e8f0" stroke-width="2"/><text x="166" y="102" fill="#f472b6" font-size="10" font-family="monospace" text-anchor="middle">-j1Ω</text><line x1="236" y1="28" x2="236" y2="44" stroke="#e2e8f0" stroke-width="2"/><rect x="226" y="44" width="20" height="28" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/><line x1="236" y1="72" x2="236" y2="88" stroke="#e2e8f0" stroke-width="2"/><text x="236" y="102" fill="#e2e8f0" font-size="10" font-family="monospace" text-anchor="middle">4Ω</text><circle cx="318" cy="58" r="14" fill="#1e293b" stroke="#f472b6" stroke-width="2"/><line x1="318" y1="66" x2="318" y2="50" stroke="#f472b6" stroke-width="2"/><polygon points="318,48 314,54 322,54" fill="#f472b6"/><line x1="318" y1="28" x2="318" y2="44" stroke="#e2e8f0" stroke-width="2"/><line x1="318" y1="72" x2="318" y2="88" stroke="#e2e8f0" stroke-width="2"/><text x="318" y="102" fill="#f472b6" font-size="10" font-family="monospace" text-anchor="middle">5∠0°A</text></svg>`;

export const SHEET_MINI5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="360" height="110"><rect x="0" y="0" width="360" height="110" fill="#0f172a" rx="8"/><text x="180" y="26" fill="#38bdf8" font-size="12" font-family="system-ui, sans-serif" font-weight="700" text-anchor="middle">时域合成：v_o(t) = v_o0 + v_o1(t) + v_o2(t)</text><path d="M24,78 Q60,36 96,62 T168,54 T240,68 T312,48 T336,64" fill="none" stroke="#34d399" stroke-width="2.5"/><line x1="24" y1="64" x2="336" y2="64" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="5 4"/><text x="180" y="98" fill="#e2e8f0" font-size="11" font-family="monospace" text-anchor="middle">4 + 8.94cos(2t+63.43°) + 5.73cos(4t-66.37°) V</text></svg>`;
