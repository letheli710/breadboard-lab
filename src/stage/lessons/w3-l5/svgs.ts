// The act diagrams of the W3-L5 lesson sheet (docs/lessons/W3-L5.md) and the step diagrams of its
// guided-example JSON, copied from the sheet by a script (not retyped). The sheet draws them for a
// light canvas already (white panels, dark ink), so they are used as they are: lightSvg is for the
// dark-canvas sheets and would turn the white terminal circles into ink dots. Changes:
// - the sheet's sixth diagram (the stage / solver architecture of its engineering checklist) is
//   build instructions, not lesson text, and is left out;
// - the step 5 diagram drew the clipped output ("底部削平！"), which is the step's answer; it is
//   redrawn (figures.ts, MINI_STEP5) to show the two rails and an open question instead;
// - every step diagram is capped at 380 px wide (inline style), like the other lessons.

const SHEET_ACT1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 340" width="880" height="340" role="img" aria-label="无源电阻直连串扰与运放虚地隔离对比图">
  <defs>
    <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D92D20"/>
    </marker>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1570EF"/>
    </marker>
    <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#039855"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="880" height="340" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>

  <!-- Left Panel: Passive Resistor Mixer -->
  <rect x="16" y="16" width="410" height="308" rx="10" fill="#FFF5F5" stroke="#FDA29B" stroke-width="1.5"/>
  <text x="221" y="42" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#B42318">反面教材：无源电阻直连（严重串扰与加载）</text>

  <!-- v1 branch -->
  <circle cx="62" cy="110" r="14" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
  <text x="62" y="115" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" fill="#0F172A">v1</text>
  <line x1="76" y1="110" x2="115" y2="110" stroke="#334155" stroke-width="2"/>
  <rect x="115" y="100" width="66" height="20" rx="3" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
  <text x="148" y="92" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#334155">R1 = 10 kΩ</text>
  <line x1="181" y1="110" x2="250" y2="110" stroke="#334155" stroke-width="2"/>

  <!-- v2 branch -->
  <circle cx="62" cy="210" r="14" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
  <text x="62" y="215" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" fill="#0F172A">v2</text>
  <line x1="76" y1="210" x2="115" y2="210" stroke="#334155" stroke-width="2"/>
  <rect x="115" y="200" width="66" height="20" rx="3" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
  <text x="148" y="192" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#334155">R2 = 10 kΩ</text>
  <line x1="181" y1="210" x2="250" y2="210" stroke="#334155" stroke-width="2"/>

  <!-- Common node v_mix -->
  <line x1="250" y1="110" x2="250" y2="210" stroke="#334155" stroke-width="2"/>
  <circle cx="250" cy="160" r="5" fill="#D92D20"/>
  <text x="262" y="148" font-family="sans-serif" font-size="13" font-weight="700" fill="#B42318">节点 v_mix ≠ 0</text>
  <line x1="250" y1="160" x2="345" y2="160" stroke="#334155" stroke-width="2"/>

  <!-- RL to GND -->
  <line x1="345" y1="160" x2="345" y2="185" stroke="#334155" stroke-width="2"/>
  <rect x="335" y="185" width="20" height="58" rx="3" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
  <text x="382" y="218" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#334155">RL = 10k</text>
  <line x1="345" y1="243" x2="345" y2="268" stroke="#334155" stroke-width="2"/>
  <line x1="331" y1="268" x2="359" y2="268" stroke="#334155" stroke-width="2"/>
  <line x1="336" y1="274" x2="354" y2="274" stroke="#334155" stroke-width="2"/>
  <line x1="341" y1="280" x2="349" y2="280" stroke="#334155" stroke-width="2"/>

  <!-- Crosstalk backflow dashed red path -->
  <path d="M 192 224 C 232 224, 232 126, 192 126" fill="none" stroke="#D92D20" stroke-width="2.2" stroke-dasharray="5,4" marker-end="url(#arrow-red)"/>
  <text x="150" y="164" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#D92D20">串扰回流！</text>
  <text x="150" y="179" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#B42318">v2 抬高 v_mix，反压 i1</text>

  <rect x="30" y="286" width="382" height="28" rx="6" fill="#FEE4E2"/>
  <text x="221" y="304" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#912018">实测：v2 从 0V 调至 4V，通道1电流 i1 从 0.133 mA 骤降至 0 mA</text>

  <!-- Right Panel: Op-Amp Virtual Ground Summer -->
  <rect x="444" y="16" width="420" height="308" rx="10" fill="#ECFDF3" stroke="#6CE9A6" stroke-width="1.5"/>
  <text x="654" y="42" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#027A48">正解：运放虚地隔离架构（零串扰独立汇流）</text>

  <!-- v1 branch -->
  <circle cx="484" cy="115" r="14" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
  <text x="484" y="120" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" fill="#0F172A">v1</text>
  <line x1="498" y1="115" x2="528" y2="115" stroke="#334155" stroke-width="2"/>
  <rect x="528" y="105" width="56" height="20" rx="3" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
  <text x="556" y="97" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">R1=10k</text>
  <line x1="584" y1="115" x2="626" y2="115" stroke="#334155" stroke-width="2"/>
  <line x1="590" y1="107" x2="616" y2="107" stroke="#1570EF" stroke-width="2" marker-end="url(#arrow-blue)"/>
  <text x="603" y="101" text-anchor="middle" font-family="serif" font-size="12" font-style="italic" fill="#1570EF">i1</text>

  <!-- v2 branch -->
  <circle cx="484" cy="195" r="14" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
  <text x="484" y="200" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" fill="#0F172A">v2</text>
  <line x1="498" y1="195" x2="528" y2="195" stroke="#334155" stroke-width="2"/>
  <rect x="528" y="185" width="56" height="20" rx="3" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
  <text x="556" y="177" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">R2=10k</text>
  <line x1="584" y1="195" x2="626" y2="195" stroke="#334155" stroke-width="2"/>
  <line x1="590" y1="205" x2="616" y2="205" stroke="#1570EF" stroke-width="2" marker-end="url(#arrow-blue)"/>
  <text x="603" y="219" text-anchor="middle" font-family="serif" font-size="12" font-style="italic" fill="#1570EF">i2</text>

  <!-- Virtual ground node a -->
  <line x1="626" y1="115" x2="626" y2="195" stroke="#334155" stroke-width="2"/>
  <circle cx="626" cy="155" r="6" fill="#039855"/>
  <rect x="582" y="138" width="40" height="34" rx="5" fill="#D1FADF" stroke="#039855" stroke-width="1"/>
  <text x="602" y="153" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#027A48">虚地</text>
  <text x="602" y="166" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#027A48">v- = 0V</text>

  <!-- Op-amp triangle -->
  <line x1="626" y1="155" x2="682" y2="155" stroke="#334155" stroke-width="2"/>
  <polygon points="682,128 682,218 766,173" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.2"/>
  <text x="694" y="160" font-family="sans-serif" font-size="16" font-weight="700" fill="#0F172A">−</text>
  <text x="693" y="196" font-family="sans-serif" font-size="15" font-weight="700" fill="#0F172A">+</text>

  <!-- Non-inverting input to GND -->
  <line x1="682" y1="191" x2="656" y2="191" stroke="#334155" stroke-width="2"/>
  <line x1="656" y1="191" x2="656" y2="236" stroke="#334155" stroke-width="2"/>
  <line x1="642" y1="236" x2="670" y2="236" stroke="#334155" stroke-width="2"/>
  <line x1="647" y1="242" x2="665" y2="242" stroke="#334155" stroke-width="2"/>
  <line x1="652" y1="248" x2="660" y2="248" stroke="#334155" stroke-width="2"/>

  <!-- Feedback Rf -->
  <line x1="626" y1="115" x2="626" y2="78" stroke="#334155" stroke-width="2"/>
  <line x1="626" y1="78" x2="690" y2="78" stroke="#334155" stroke-width="2"/>
  <rect x="690" y="68" width="60" height="20" rx="3" fill="#FFFFFF" stroke="#039855" stroke-width="2"/>
  <text x="720" y="61" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#027A48">Rf = 10k</text>
  <line x1="750" y1="78" x2="796" y2="78" stroke="#334155" stroke-width="2"/>
  <line x1="796" y1="78" x2="796" y2="173" stroke="#334155" stroke-width="2"/>
  <line x1="692" y1="96" x2="748" y2="96" stroke="#039855" stroke-width="2" marker-end="url(#arrow-green)"/>
  <text x="720" y="111" text-anchor="middle" font-family="serif" font-size="12" font-style="italic" fill="#027A48">if = i1 + i2</text>

  <!-- Output node -->
  <line x1="766" y1="173" x2="834" y2="173" stroke="#334155" stroke-width="2"/>
  <circle cx="796" cy="173" r="4" fill="#0F172A"/>
  <circle cx="834" cy="173" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="838" y="160" text-anchor="middle" font-family="serif" font-size="15" font-style="italic" font-weight="700" fill="#0F172A">vo</text>

  <rect x="458" y="286" width="392" height="28" rx="6" fill="#D1FADF"/>
  <text x="654" y="304" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#027A48">实测：无论 v2 如何变化，通道1电流始终锁定 i1 = 0.200 mA</text>
</svg>`;

const SHEET_ACT2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 350" width="880" height="350" role="img" aria-label="Sadiku Fig. 5.17 三路输入反相加法器完整原理图">
  <defs>
    <marker id="arr-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1570EF"/>
    </marker>
    <marker id="arr-if" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D92D20"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="880" height="350" rx="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="440" y="32" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#0F172A">Sadiku Fig. 5.17：三路加权反相加法器（Summing Amplifier）</text>

  <!-- Input 1 -->
  <circle cx="90" cy="115" r="16" fill="#EFF8FF" stroke="#1570EF" stroke-width="2"/>
  <text x="90" y="120" text-anchor="middle" font-family="serif" font-size="15" font-style="italic" font-weight="700" fill="#175CD3">v1</text>
  <line x1="106" y1="115" x2="175" y2="115" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="175" y="103" width="80" height="24" rx="4" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
  <text x="215" y="96" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" fill="#0F172A">R1</text>
  <line x1="255" y1="115" x2="355" y2="115" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="278" y1="105" x2="322" y2="105" stroke="#1570EF" stroke-width="2" marker-end="url(#arr-i)"/>
  <text x="300" y="98" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" fill="#1570EF">i1</text>

  <!-- Input 2 -->
  <circle cx="90" cy="185" r="16" fill="#EFF8FF" stroke="#1570EF" stroke-width="2"/>
  <text x="90" y="190" text-anchor="middle" font-family="serif" font-size="15" font-style="italic" font-weight="700" fill="#175CD3">v2</text>
  <line x1="106" y1="185" x2="175" y2="185" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="175" y="173" width="80" height="24" rx="4" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
  <text x="215" y="166" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" fill="#0F172A">R2</text>
  <line x1="255" y1="185" x2="355" y2="185" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="278" y1="175" x2="322" y2="175" stroke="#1570EF" stroke-width="2" marker-end="url(#arr-i)"/>
  <text x="300" y="168" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" fill="#1570EF">i2</text>

  <!-- Input 3 -->
  <circle cx="90" cy="255" r="16" fill="#EFF8FF" stroke="#1570EF" stroke-width="2"/>
  <text x="90" y="260" text-anchor="middle" font-family="serif" font-size="15" font-style="italic" font-weight="700" fill="#175CD3">v3</text>
  <line x1="106" y1="255" x2="175" y2="255" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="175" y="243" width="80" height="24" rx="4" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
  <text x="215" y="236" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" fill="#0F172A">R3</text>
  <line x1="255" y1="255" x2="355" y2="255" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="278" y1="245" x2="322" y2="245" stroke="#1570EF" stroke-width="2" marker-end="url(#arr-i)"/>
  <text x="300" y="238" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" fill="#1570EF">i3</text>

  <!-- Summing vertical bus and Node a -->
  <line x1="355" y1="115" x2="355" y2="255" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="355" cy="185" r="6" fill="#039855"/>
  <rect x="366" y="197" width="112" height="36" rx="6" fill="#ECFDF3" stroke="#039855" stroke-width="1.2"/>
  <text x="422" y="213" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#027A48">节点 a（虚地）</text>
  <text x="422" y="227" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#027A48">va = v- = 0 V</text>

  <!-- Line to op-amp inverting input -->
  <line x1="355" y1="185" x2="520" y2="185" stroke="#0F172A" stroke-width="2.2"/>
  <text x="438" y="176" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748B">i- = 0 A（虚断）</text>

  <!-- Feedback loop -->
  <line x1="355" y1="115" x2="355" y2="70" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="355" y1="70" x2="530" y2="70" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="530" y="58" width="90" height="24" rx="4" fill="#FEF3F2" stroke="#D92D20" stroke-width="2"/>
  <text x="575" y="51" text-anchor="middle" font-family="serif" font-size="15" font-style="italic" font-weight="700" fill="#B42318">Rf</text>
  <line x1="620" y1="70" x2="725" y2="70" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="725" y1="70" x2="725" y2="210" stroke="#0F172A" stroke-width="2.2"/>

  <!-- Feedback current arrow -->
  <line x1="420" y1="60" x2="480" y2="60" stroke="#D92D20" stroke-width="2.2" marker-end="url(#arr-if)"/>
  <text x="450" y="53" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" font-weight="700" fill="#D92D20">if</text>

  <!-- Op-Amp symbol -->
  <polygon points="520,150 520,270 655,210" fill="#F8FAFC" stroke="#0F172A" stroke-width="2.5"/>
  <text x="534" y="191" font-family="sans-serif" font-size="20" font-weight="700" fill="#0F172A">−</text>
  <text x="533" y="241" font-family="sans-serif" font-size="19" font-weight="700" fill="#0F172A">+</text>
  <text x="585" y="215" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#475569">理想运放</text>

  <!-- Non-inverting terminal grounded -->
  <line x1="520" y1="235" x2="490" y2="235" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="490" y1="235" x2="490" y2="292" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="472" y1="292" x2="508" y2="292" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="478" y1="299" x2="502" y2="299" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="484" y1="306" x2="496" y2="306" stroke="#0F172A" stroke-width="2.2"/>
  <text x="490" y="324" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">v+ = 0 V</text>

  <!-- Output node -->
  <line x1="655" y1="210" x2="795" y2="210" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="725" cy="210" r="4.5" fill="#0F172A"/>
  <circle cx="795" cy="210" r="5" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.2"/>
  <text x="795" y="193" text-anchor="middle" font-family="serif" font-size="17" font-style="italic" font-weight="700" fill="#0F172A">vo</text>
  <text x="795" y="234" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#475569">对地输出</text>
</svg>`;

const SHEET_ACT3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 330" width="880" height="330" role="img" aria-label="权重系数与音频混音通道滑块及电平偏置移位示意图">
  <rect x="0" y="0" width="880" height="330" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>

  <!-- Left: 3-Channel Audio Mixer Faders & Weights -->
  <rect x="18" y="18" width="430" height="294" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="233" y="44" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#0F172A">音频混音直觉：输入电阻 Rk 即“反向推子”</text>
  <text x="233" y="63" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#64748B">权重 wk = Rf / Rk （Rk 越小，通道音量越大）</text>

  <!-- Channel 1 Fader -->
  <rect x="52" y="84" width="96" height="196" rx="8" fill="#EFF8FF" stroke="#B2DDFF"/>
  <text x="100" y="104" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#175CD3">CH1 主唱</text>
  <rect x="96" y="118" width="8" height="106" rx="4" fill="#CBD5E1"/>
  <rect x="82" y="128" width="36" height="16" rx="4" fill="#1570EF"/>
  <text x="100" y="244" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#0F172A">w1 = 3.0×</text>
  <text x="100" y="262" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">R1 = 4 kΩ</text>

  <!-- Channel 2 Fader -->
  <rect x="185" y="84" width="96" height="196" rx="8" fill="#ECFDF3" stroke="#A6F4C5"/>
  <text x="233" y="104" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#027A48">CH2 吉他</text>
  <rect x="229" y="118" width="8" height="106" rx="4" fill="#CBD5E1"/>
  <rect x="215" y="156" width="36" height="16" rx="4" fill="#039855"/>
  <text x="233" y="244" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#0F172A">w2 = 2.0×</text>
  <text x="233" y="262" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">R2 = 6 kΩ</text>

  <!-- Channel 3 Fader -->
  <rect x="318" y="84" width="96" height="196" rx="8" fill="#FFFAEB" stroke="#FEDF89"/>
  <text x="366" y="104" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#B54708">CH3 贝斯</text>
  <rect x="362" y="118" width="8" height="106" rx="4" fill="#CBD5E1"/>
  <rect x="348" y="186" width="36" height="16" rx="4" fill="#DC6803"/>
  <text x="366" y="244" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#0F172A">w3 = 1.0×</text>
  <text x="366" y="262" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">R3 = 12 kΩ</text>

  <text x="233" y="300" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155">总反馈电阻 Rf = 12 kΩ（总音量 Master Fader）</text>

  <!-- Right: Bipolar to Unipolar Level Shifter Waveform -->
  <rect x="466" y="18" width="396" height="294" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="664" y="44" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#0F172A">电平偏置移位：把双极性信号抬入 ADC 区间</text>
  <text x="664" y="63" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#64748B">vo = −vsig + 1.65 V（叠加 Vref = −3.3 V, w_ref = 0.5）</text>

  <!-- ADC Safe Zone [0V, 3.3V] -->
  <rect x="510" y="84" width="328" height="140" fill="#ECFDF3" opacity="0.7"/>
  <line x1="510" y1="84" x2="838" y2="84" stroke="#039855" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="504" y="88" text-anchor="end" font-family="sans-serif" font-size="11" font-weight="700" fill="#027A48">3.3V</text>

  <!-- Center 1.65V line -->
  <line x1="510" y1="154" x2="838" y2="154" stroke="#1570EF" stroke-width="1.2" stroke-dasharray="4,3"/>
  <text x="504" y="158" text-anchor="end" font-family="sans-serif" font-size="11" font-weight="700" fill="#1570EF">1.65V</text>

  <!-- 0V axis -->
  <line x1="510" y1="224" x2="838" y2="224" stroke="#0F172A" stroke-width="1.8"/>
  <text x="504" y="228" text-anchor="end" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">0V</text>

  <!-- -1V line -->
  <line x1="510" y1="266" x2="838" y2="266" stroke="#FDA29B" stroke-width="1.2" stroke-dasharray="3,3"/>
  <text x="504" y="270" text-anchor="end" font-family="sans-serif" font-size="11" fill="#B42318">−1V</text>

  <!-- Original bipolar sine wave centered at 0V (y=224, amp=42px) -->
  <path d="M 520 224 Q 560 140 600 224 T 680 224 T 760 224 T 830 224" fill="none" stroke="#94A3B8" stroke-width="2.2" stroke-dasharray="5,4"/>
  <text x="772" y="286" font-family="sans-serif" font-size="11" fill="#64748B">原信号 vsig ∈ [−1V, +1V]</text>

  <!-- Shifted + inverted output wave centered at 1.65V (y=154, amp=42px, inverted phase) -->
  <path d="M 520 154 Q 560 238 600 154 T 680 154 T 760 154 T 830 154" fill="none" stroke="#1570EF" stroke-width="2.8"/>
  <text x="742" y="104" font-family="sans-serif" font-size="11" font-weight="700" fill="#1570EF">输出 vo ∈ [0.65V, 2.65V]</text>
  <text x="664" y="302" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#027A48">全部落入 MCU ADC 合法采样窗口 [0 V, 3.3 V]，零负压截断！</text>
</svg>`;

const SHEET_ACT4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 350" width="880" height="350" role="img" aria-label="Sadiku Example 5.6 电路图与电流标注">
  <defs>
    <marker id="ex-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1570EF"/>
    </marker>
    <marker id="ex-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D92D20"/>
    </marker>
    <marker id="ex-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#7A5AF8"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="880" height="350" rx="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="440" y="32" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#0F172A">Sadiku Example 5.6（Fig. 5.18）：两路反相加法器与输出负载电流分析</text>

  <!-- v1 = 2V, R1 = 5k -->
  <circle cx="88" cy="135" r="22" fill="#EFF8FF" stroke="#1570EF" stroke-width="2"/>
  <text x="88" y="132" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" font-weight="700" fill="#175CD3">v1</text>
  <text x="88" y="148" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#175CD3">2 V</text>
  <line x1="110" y1="135" x2="170" y2="135" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="170" y="123" width="84" height="24" rx="4" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
  <text x="212" y="115" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#0F172A">R1 = 5 kΩ</text>
  <line x1="254" y1="135" x2="345" y2="135" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="274" y1="125" x2="320" y2="125" stroke="#1570EF" stroke-width="2" marker-end="url(#ex-blue)"/>
  <text x="297" y="118" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" fill="#1570EF">i1</text>

  <!-- v2 = 1V, R2 = 2.5k -->
  <circle cx="88" cy="225" r="22" fill="#EFF8FF" stroke="#1570EF" stroke-width="2"/>
  <text x="88" y="222" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" font-weight="700" fill="#175CD3">v2</text>
  <text x="88" y="238" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#175CD3">1 V</text>
  <line x1="110" y1="225" x2="170" y2="225" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="170" y="213" width="84" height="24" rx="4" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
  <text x="212" y="205" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#0F172A">R2 = 2.5 kΩ</text>
  <line x1="254" y1="225" x2="345" y2="225" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="274" y1="215" x2="320" y2="215" stroke="#1570EF" stroke-width="2" marker-end="url(#ex-blue)"/>
  <text x="297" y="208" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" fill="#1570EF">i2</text>

  <!-- Node a -->
  <line x1="345" y1="135" x2="345" y2="225" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="345" cy="180" r="6" fill="#039855"/>
  <text x="345" y="246" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#027A48">节点 a (v- = 0 V)</text>

  <!-- Feedback Rf = 10k -->
  <line x1="345" y1="135" x2="345" y2="75" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="345" y1="75" x2="495" y2="75" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="495" y="63" width="94" height="24" rx="4" fill="#FEF3F2" stroke="#D92D20" stroke-width="2"/>
  <text x="542" y="56" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#B42318">Rf = 10 kΩ</text>
  <line x1="589" y1="75" x2="725" y2="75" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="725" y1="75" x2="725" y2="205" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="396" y1="65" x2="458" y2="65" stroke="#D92D20" stroke-width="2" marker-end="url(#ex-red)"/>
  <text x="427" y="58" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" font-weight="700" fill="#D92D20">if</text>

  <!-- Op-Amp + Power Rails -->
  <line x1="345" y1="180" x2="468" y2="180" stroke="#0F172A" stroke-width="2.2"/>
  <polygon points="468,145 468,265 603,205" fill="#F8FAFC" stroke="#0F172A" stroke-width="2.5"/>
  <text x="482" y="186" font-family="sans-serif" font-size="20" font-weight="700" fill="#0F172A">−</text>
  <text x="481" y="236" font-family="sans-serif" font-size="19" font-weight="700" fill="#0F172A">+</text>

  <!-- Supply Rails -->
  <line x1="535" y1="175" x2="535" y2="125" stroke="#64748B" stroke-width="1.8" stroke-dasharray="4,3"/>
  <text x="535" y="118" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#475569">+Vcc</text>
  <line x1="535" y1="235" x2="535" y2="285" stroke="#64748B" stroke-width="1.8" stroke-dasharray="4,3"/>
  <text x="535" y="302" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#475569">−Vcc</text>

  <!-- Non-inverting GND -->
  <line x1="468" y1="230" x2="438" y2="230" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="438" y1="230" x2="438" y2="292" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="422" y1="292" x2="454" y2="292" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="427" y1="298" x2="449" y2="298" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="433" y1="304" x2="443" y2="304" stroke="#0F172A" stroke-width="2.2"/>

  <!-- Output wire + io arrow -->
  <line x1="603" y1="205" x2="815" y2="205" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="635" y1="194" x2="688" y2="194" stroke="#7A5AF8" stroke-width="2.2" marker-end="url(#ex-purple)"/>
  <text x="661" y="186" text-anchor="middle" font-family="serif" font-size="14" font-style="italic" font-weight="700" fill="#7A5AF8">io</text>

  <!-- Output node & Load RL = 2k -->
  <circle cx="725" cy="205" r="4.5" fill="#0F172A"/>
  <line x1="725" y1="205" x2="725" y2="232" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="713" y="232" width="24" height="58" rx="4" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
  <text x="774" y="264" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#0F172A">RL = 2 kΩ</text>
  <line x1="704" y1="242" x2="704" y2="278" stroke="#7A5AF8" stroke-width="2" marker-end="url(#ex-purple)"/>
  <text x="692" y="264" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" fill="#7A5AF8">iL</text>
  <line x1="725" y1="290" x2="725" y2="314" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="709" y1="314" x2="741" y2="314" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="714" y1="320" x2="736" y2="320" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="720" y1="326" x2="730" y2="326" stroke="#0F172A" stroke-width="2.2"/>

  <!-- Output terminal vo -->
  <circle cx="815" cy="205" r="5" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.2"/>
  <text x="815" y="188" text-anchor="middle" font-family="serif" font-size="16" font-style="italic" font-weight="700" fill="#0F172A">vo</text>
</svg>`;

const SHEET_ACT5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 360" width="880" height="360" role="img" aria-label="三路不等权音频混音器苏格拉底例题电路图">
  <defs>
    <marker id="soc-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1570EF"/>
    </marker>
    <marker id="soc-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D92D20"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="880" height="360" rx="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="440" y="30" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#0F172A">实战例题：3 路不等权音频混音器（供电 ±10 V，Rf = 12 kΩ，RL = 4 kΩ）</text>

  <!-- CH1 -->
  <rect x="26" y="96" width="86" height="34" rx="6" fill="#EFF8FF" stroke="#1570EF" stroke-width="1.6"/>
  <text x="69" y="111" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#175CD3">CH1 主唱</text>
  <text x="69" y="125" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#175CD3">v1 = 1.2 V</text>
  <line x1="112" y1="113" x2="170" y2="113" stroke="#0F172A" stroke-width="2"/>
  <rect x="170" y="101" width="82" height="24" rx="4" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
  <text x="211" y="94" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#0F172A">R1 = 4 kΩ</text>
  <line x1="252" y1="113" x2="345" y2="113" stroke="#0F172A" stroke-width="2"/>
  <line x1="274" y1="104" x2="318" y2="104" stroke="#1570EF" stroke-width="2" marker-end="url(#soc-blue)"/>
  <text x="296" y="97" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" fill="#1570EF">i1</text>

  <!-- CH2 -->
  <rect x="26" y="168" width="86" height="34" rx="6" fill="#ECFDF3" stroke="#039855" stroke-width="1.6"/>
  <text x="69" y="183" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#027A48">CH2 吉他</text>
  <text x="69" y="197" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#027A48">v2 = 1.5 V</text>
  <line x1="112" y1="185" x2="170" y2="185" stroke="#0F172A" stroke-width="2"/>
  <rect x="170" y="173" width="82" height="24" rx="4" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
  <text x="211" y="166" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#0F172A">R2 = 6 kΩ</text>
  <line x1="252" y1="185" x2="345" y2="185" stroke="#0F172A" stroke-width="2"/>
  <line x1="274" y1="176" x2="318" y2="176" stroke="#1570EF" stroke-width="2" marker-end="url(#soc-blue)"/>
  <text x="296" y="169" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" fill="#1570EF">i2</text>

  <!-- CH3 -->
  <rect x="26" y="240" width="86" height="34" rx="6" fill="#FFFAEB" stroke="#DC6803" stroke-width="1.6"/>
  <text x="69" y="255" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#B54708">CH3 贝斯</text>
  <text x="69" y="269" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#B54708">v3 = −0.6 V</text>
  <line x1="112" y1="257" x2="170" y2="257" stroke="#0F172A" stroke-width="2"/>
  <rect x="170" y="245" width="82" height="24" rx="4" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
  <text x="211" y="238" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#0F172A">R3 = 12 kΩ</text>
  <line x1="252" y1="257" x2="345" y2="257" stroke="#0F172A" stroke-width="2"/>
  <line x1="274" y1="248" x2="318" y2="248" stroke="#1570EF" stroke-width="2" marker-end="url(#soc-blue)"/>
  <text x="296" y="241" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" fill="#1570EF">i3</text>

  <!-- Summing node -->
  <line x1="345" y1="113" x2="345" y2="257" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="345" cy="185" r="6" fill="#039855"/>
  <text x="396" y="176" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#027A48">节点 a (v- = ?)</text>

  <!-- Feedback -->
  <line x1="345" y1="113" x2="345" y2="68" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="345" y1="68" x2="495" y2="68" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="495" y="56" width="96" height="24" rx="4" fill="#FEF3F2" stroke="#D92D20" stroke-width="2"/>
  <text x="543" y="49" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#B42318">Rf = 12 kΩ</text>
  <line x1="591" y1="68" x2="725" y2="68" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="725" y1="68" x2="725" y2="210" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="400" y1="58" x2="462" y2="58" stroke="#D92D20" stroke-width="2" marker-end="url(#soc-red)"/>
  <text x="431" y="51" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" font-weight="700" fill="#D92D20">if</text>

  <!-- Op-Amp -->
  <line x1="345" y1="185" x2="470" y2="185" stroke="#0F172A" stroke-width="2.2"/>
  <polygon points="470,150 470,270 605,210" fill="#F8FAFC" stroke="#0F172A" stroke-width="2.5"/>
  <text x="484" y="191" font-family="sans-serif" font-size="20" font-weight="700" fill="#0F172A">−</text>
  <text x="483" y="241" font-family="sans-serif" font-size="19" font-weight="700" fill="#0F172A">+</text>
  <text x="537" y="128" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#475569">+10 V</text>
  <line x1="537" y1="134" x2="537" y2="180" stroke="#64748B" stroke-width="1.6" stroke-dasharray="3,3"/>
  <line x1="537" y1="240" x2="537" y2="286" stroke="#64748B" stroke-width="1.6" stroke-dasharray="3,3"/>
  <text x="537" y="302" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#475569">−10 V</text>

  <!-- Non-inverting GND -->
  <line x1="470" y1="235" x2="438" y2="235" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="438" y1="235" x2="438" y2="296" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="422" y1="296" x2="454" y2="296" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="427" y1="302" x2="449" y2="302" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="433" y1="308" x2="443" y2="308" stroke="#0F172A" stroke-width="2.2"/>

  <!-- Output + Load RL = 4k -->
  <line x1="605" y1="210" x2="815" y2="210" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="725" cy="210" r="4.5" fill="#0F172A"/>
  <line x1="725" y1="210" x2="725" y2="238" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="713" y="238" width="24" height="58" rx="4" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
  <text x="776" y="270" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#0F172A">RL = 4 kΩ</text>
  <line x1="725" y1="296" x2="725" y2="320" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="709" y1="320" x2="741" y2="320" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="714" y1="326" x2="736" y2="326" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="720" y1="332" x2="730" y2="332" stroke="#0F172A" stroke-width="2.2"/>

  <circle cx="815" cy="210" r="5" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.2"/>
  <text x="815" y="192" text-anchor="middle" font-family="serif" font-size="16" font-style="italic" font-weight="700" fill="#0F172A">vo = ?</text>
</svg>`;

const SHEET_MINI1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect x="2" y="2" width="256" height="106" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><line x1="20" y1="38" x2="100" y2="38" stroke="#0F172A" stroke-width="2"/><circle cx="100" cy="38" r="5" fill="#039855"/><text x="100" y="24" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#027A48">节点 a (v- = ?)</text><polygon points="130,22 130,86 196,54" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/><line x1="100" y1="38" x2="130" y2="38" stroke="#0F172A" stroke-width="2"/><line x1="130" y1="70" x2="106" y2="70" stroke="#0F172A" stroke-width="2"/><line x1="106" y1="70" x2="106" y2="92" stroke="#0F172A" stroke-width="2"/><line x1="94" y1="92" x2="118" y2="92" stroke="#0F172A" stroke-width="2"/><text x="139" y="43" font-family="sans-serif" font-size="14" font-weight="700">−</text><text x="138" y="75" font-family="sans-serif" font-size="14" font-weight="700">+</text><text x="226" y="58" text-anchor="middle" font-family="serif" font-size="14" font-style="italic">vo</text><line x1="196" y1="54" x2="214" y2="54" stroke="#0F172A" stroke-width="2"/></svg>`;

const SHEET_MINI2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect x="2" y="2" width="256" height="106" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><text x="18" y="30" font-family="sans-serif" font-size="11" fill="#175CD3">1.2V → [4kΩ] → i1</text><text x="18" y="58" font-family="sans-serif" font-size="11" fill="#027A48">1.5V → [6kΩ] → i2</text><text x="18" y="86" font-family="sans-serif" font-size="11" fill="#B54708">−0.6V → [12kΩ] → i3</text><line x1="170" y1="25" x2="170" y2="85" stroke="#0F172A" stroke-width="2"/><circle cx="170" cy="55" r="5" fill="#039855"/><text x="214" y="59" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#027A48">v- = 0 V</text></svg>`;

const SHEET_MINI3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect x="2" y="2" width="256" height="106" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><circle cx="92" cy="58" r="6" fill="#039855"/><line x1="24" y1="34" x2="92" y2="58" stroke="#1570EF" stroke-width="2"/><line x1="24" y1="58" x2="92" y2="58" stroke="#039855" stroke-width="2"/><line x1="24" y1="82" x2="92" y2="58" stroke="#DC6803" stroke-width="2"/><line x1="92" y1="58" x2="92" y2="26" stroke="#D92D20" stroke-width="2.2"/><line x1="92" y1="26" x2="228" y2="26" stroke="#D92D20" stroke-width="2.2"/><rect x="136" y="16" width="54" height="20" rx="3" fill="#FEF3F2" stroke="#D92D20"/><text x="163" y="30" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#B42318">Rf=12k</text><text x="165" y="64" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748B">i- = 0 A (断路)</text><text x="163" y="92" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#D92D20">if = i1 + i2 + i3</text></svg>`;

const SHEET_MINI4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect x="2" y="2" width="256" height="106" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><polygon points="22,22 22,88 84,55" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/><line x1="84" y1="55" x2="220" y2="55" stroke="#0F172A" stroke-width="2"/><text x="122" y="46" text-anchor="middle" font-family="serif" font-size="12" font-style="italic" fill="#7A5AF8">io →</text><circle cx="166" cy="55" r="4" fill="#0F172A"/><line x1="166" y1="55" x2="166" y2="20" stroke="#D92D20" stroke-width="1.8"/><text x="196" y="32" font-family="sans-serif" font-size="10" fill="#D92D20">至 Rf (12k)</text><line x1="166" y1="55" x2="166" y2="92" stroke="#0F172A" stroke-width="1.8"/><text x="200" y="84" font-family="sans-serif" font-size="10" fill="#334155">RL=4k 到地</text><text x="236" y="59" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" font-weight="700">vo</text></svg>`;

export const SVG_ACT1 = SHEET_ACT1;
export const SVG_ACT2 = SHEET_ACT2;
export const SVG_ACT3 = SHEET_ACT3;
export const SVG_ACT4 = SHEET_ACT4;
export const SVG_ACT5 = SHEET_ACT5;

/** step diagrams of the guided example (steps 1–4; step 5 is redrawn in figures.ts) */
const mini = (s: string) => s.replace('<svg ', '<svg style="max-width:380px" ');
export const MINI_STEP1 = mini(SHEET_MINI1);
export const MINI_STEP2 = mini(SHEET_MINI2);
export const MINI_STEP3 = mini(SHEET_MINI3);
export const MINI_STEP4 = mini(SHEET_MINI4);
