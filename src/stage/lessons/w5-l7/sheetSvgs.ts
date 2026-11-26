// The inline SVGs of the W5-L7 lesson sheet (docs/lessons/W5-L7.md), copied from the sheet by a
// script, not retyped: the act diagrams of acts 1–4 and act 5's reference Bode plot. They are drawn
// for a dark canvas; svgs.ts recolours them for the light theme and adjusts them. (The sheet's
// 6.2 stage-architecture diagram is a build note, not lesson content, and is left out.)

export const SHEET_ACT1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 310" width="100%" style="max-width:820px;font-family:'PingFang SC','Noto Sans CJK SC',sans-serif;background:#0f172a;border-radius:12px;">
  <defs>
    <marker id="arrCyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrAmber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="820" height="310" fill="#0f172a" rx="12"/>
  <text x="24" y="32" fill="#f8fafc" font-size="16" font-weight="700">一阶 RC 低通网络：频域复阻抗分压与传递函数黑箱映射</text>

  <!-- Left: RC Circuit -->
  <rect x="24" y="50" width="430" height="236" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="40" y="74" fill="#94a3b8" font-size="13" font-weight="600">频域等效电路（相量法）</text>

  <!-- Input terminals -->
  <circle cx="80" cy="125" r="5" fill="none" stroke="#38bdf8" stroke-width="2.2"/>
  <circle cx="80" cy="240" r="5" fill="none" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="44" y="130" fill="#38bdf8" font-size="14" font-weight="700">+</text>
  <text x="44" y="244" fill="#38bdf8" font-size="14" font-weight="700">−</text>
  <text x="34" y="188" fill="#38bdf8" font-size="14" font-weight="700">V_i(ω)</text>

  <!-- Top wire to R -->
  <line x1="85" y1="125" x2="145" y2="125" stroke="#e2e8f0" stroke-width="2.2"/>
  <!-- Current arrow -->
  <line x1="100" y1="112" x2="132" y2="112" stroke="#fbbf24" stroke-width="1.8" marker-end="url(#arrAmber)"/>
  <text x="106" y="104" fill="#fbbf24" font-size="12" font-weight="600">I(ω)</text>

  <!-- Resistor zig-zag -->
  <polyline points="145,125 153,113 165,137 177,113 189,137 201,113 213,137 221,125" fill="none" stroke="#f59e0b" stroke-width="2.4" stroke-linejoin="round"/>
  <text x="150" y="99" fill="#fbbf24" font-size="13" font-weight="700">R = 1 kΩ</text>
  <text x="158" y="156" fill="#cbd5e1" font-size="11">Z_R = R</text>

  <!-- Wire from R to Node A -->
  <line x1="221" y1="125" x2="365" y2="125" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="290" cy="125" r="4" fill="#e2e8f0"/>

  <!-- Capacitor branch -->
  <line x1="290" y1="125" x2="290" y2="173" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="268" y1="173" x2="312" y2="173" stroke="#38bdf8" stroke-width="3"/>
  <line x1="268" y1="189" x2="312" y2="189" stroke="#38bdf8" stroke-width="3"/>
  <line x1="290" y1="189" x2="290" y2="240" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="200" y="185" fill="#38bdf8" font-size="12" font-weight="700">C = 1 μF</text>
  <text x="184" y="203" fill="#94a3b8" font-size="11">Z_C = 1/(jωC)</text>

  <!-- Bottom wire -->
  <line x1="85" y1="240" x2="365" y2="240" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="290" cy="240" r="4" fill="#e2e8f0"/>

  <!-- Output terminals -->
  <circle cx="370" cy="125" r="5" fill="none" stroke="#34d399" stroke-width="2.2"/>
  <circle cx="370" cy="240" r="5" fill="none" stroke="#34d399" stroke-width="2.2"/>
  <text x="385" y="130" fill="#34d399" font-size="14" font-weight="700">+</text>
  <text x="385" y="244" fill="#34d399" font-size="14" font-weight="700">−</text>
  <text x="380" y="188" fill="#34d399" font-size="14" font-weight="700">V_o(ω)</text>

  <!-- Bottom note inside left box -->
  <text x="40" y="272" fill="#94a3b8" font-size="11">转折频率 ω_c = 1/(RC) = 1000 rad/s (f_c ≈ 159.15 Hz)</text>

  <!-- Right: Black-box Transfer Function -->
  <rect x="476" y="50" width="320" height="236" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="494" y="74" fill="#94a3b8" font-size="13" font-weight="600">系统黑箱视角与零极点结构</text>

  <!-- Input arrow -->
  <text x="492" y="132" fill="#38bdf8" font-size="13" font-weight="700">X(ω)</text>
  <line x1="530" y1="127" x2="574" y2="127" stroke="#38bdf8" stroke-width="2.2" marker-end="url(#arrCyan)"/>

  <!-- System Box -->
  <rect x="578" y="98" width="118" height="60" rx="8" fill="#0f172a" stroke="#a78bfa" stroke-width="2"/>
  <text x="637" y="123" fill="#c4b5fd" font-size="14" font-weight="700" text-anchor="middle">H(ω)</text>
  <text x="637" y="144" fill="#e2e8f0" font-size="11" text-anchor="middle">1 / (1 + jω/1000)</text>

  <!-- Output arrow -->
  <line x1="696" y1="127" x2="736" y2="127" stroke="#34d399" stroke-width="2.2" marker-end="url(#arrCyan)"/>
  <text x="742" y="132" fill="#34d399" font-size="13" font-weight="700">Y(ω)</text>

  <!-- Formula summary cards -->
  <rect x="494" y="176" width="284" height="44" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <text x="506" y="195" fill="#fbbf24" font-size="12" font-weight="700">幅频响应 |H(ω)|：</text>
  <text x="615" y="195" fill="#e2e8f0" font-size="12">决定各频率振幅缩放倍率</text>
  <text x="506" y="212" fill="#34d399" font-size="12" font-weight="700">相频响应 ∠H(ω)：</text>
  <text x="615" y="212" fill="#e2e8f0" font-size="12">决定各频率正弦波相位滞后</text>

  <rect x="494" y="228" width="284" height="44" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <text x="506" y="246" fill="#f472b6" font-size="12" font-weight="700">极点 s = −1000 rad/s：</text>
  <text x="636" y="246" fill="#e2e8f0" font-size="12">高频滚降的转折起点</text>
  <text x="506" y="264" fill="#94a3b8" font-size="11">有限零点：无（ω → ∞ 时电容短路，输出归零）</text>
</svg>`;

export const SHEET_ACT2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 340" width="100%" style="max-width:840px;font-family:'PingFang SC','Noto Sans CJK SC',sans-serif;background:#0f172a;border-radius:12px;">
  <rect x="0" y="0" width="840" height="340" fill="#0f172a" rx="12"/>
  <text x="24" y="30" fill="#f8fafc" font-size="16" font-weight="700">线性坐标 vs 半对数分贝坐标：为什么波特图能把曲线“拉直”？</text>

  <!-- Left panel -->
  <rect x="16" y="44" width="390" height="280" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="210" y="56" fill="#cbd5e1" font-size="12" font-weight="600" text-anchor="middle">线性刻度：|H(ω)| 随 ω 变化（低频被挤扁）</text>
  <line x1="58.0" y1="62" x2="58.0" y2="285" stroke="#334155" stroke-width="1"/><text x="58.0" y="301" fill="#94a3b8" font-size="11" text-anchor="middle">0</text><line x1="124.4" y1="62" x2="124.4" y2="285" stroke="#334155" stroke-width="1"/><text x="124.4" y="301" fill="#94a3b8" font-size="11" text-anchor="middle">2k</text><line x1="190.8" y1="62" x2="190.8" y2="285" stroke="#334155" stroke-width="1"/><text x="190.8" y="301" fill="#94a3b8" font-size="11" text-anchor="middle">4k</text><line x1="257.2" y1="62" x2="257.2" y2="285" stroke="#334155" stroke-width="1"/><text x="257.2" y="301" fill="#94a3b8" font-size="11" text-anchor="middle">6k</text><line x1="323.6" y1="62" x2="323.6" y2="285" stroke="#334155" stroke-width="1"/><text x="323.6" y="301" fill="#94a3b8" font-size="11" text-anchor="middle">8k</text><line x1="390.0" y1="62" x2="390.0" y2="285" stroke="#334155" stroke-width="1"/><text x="390.0" y="301" fill="#94a3b8" font-size="11" text-anchor="middle">10k</text><line x1="58" y1="285.0" x2="390" y2="285.0" stroke="#334155" stroke-width="1"/><text x="50" y="289.0" fill="#94a3b8" font-size="11" text-anchor="end">0.0</text><line x1="58" y1="244.5" x2="390" y2="244.5" stroke="#334155" stroke-width="1"/><text x="50" y="248.5" fill="#94a3b8" font-size="11" text-anchor="end">0.2</text><line x1="58" y1="203.9" x2="390" y2="203.9" stroke="#334155" stroke-width="1"/><text x="50" y="207.9" fill="#94a3b8" font-size="11" text-anchor="end">0.4</text><line x1="58" y1="163.4" x2="390" y2="163.4" stroke="#334155" stroke-width="1"/><text x="50" y="167.4" fill="#94a3b8" font-size="11" text-anchor="end">0.6</text><line x1="58" y1="122.8" x2="390" y2="122.8" stroke="#334155" stroke-width="1"/><text x="50" y="126.8" fill="#94a3b8" font-size="11" text-anchor="end">0.8</text><line x1="58" y1="82.3" x2="390" y2="82.3" stroke="#334155" stroke-width="1"/><text x="50" y="86.3" fill="#94a3b8" font-size="11" text-anchor="end">1.0</text>
  <polyline points="58.0,82.3 61.4,83.3 64.7,86.3 68.1,91.0 71.4,97.0 74.8,104.0 78.1,111.6 81.5,119.5 84.8,127.3 88.2,135.0 91.5,142.4 94.9,149.4 98.2,156.0 101.6,162.2 104.9,168.0 108.3,173.3 111.7,178.3 115.0,183.0 118.4,187.3 121.7,191.3 125.1,195.1 128.4,198.6 131.8,201.8 135.1,204.8 138.5,207.7 141.8,210.4 145.2,212.9 148.5,215.2 151.9,217.4 155.3,219.5 158.6,221.5 162.0,223.3 165.3,225.1 168.7,226.7 172.0,228.3 175.4,229.8 178.7,231.2 182.1,232.6 185.4,233.9 188.8,235.1 192.1,236.3 195.5,237.4 198.8,238.5 202.2,239.5 205.6,240.5 208.9,241.4 212.3,242.3 215.6,243.2 219.0,244.0 222.3,244.9 225.7,245.6 229.0,246.4 232.4,247.1 235.7,247.8 239.1,248.4 242.4,249.1 245.8,249.7 249.2,250.3 252.5,250.9 255.9,251.5 259.2,252.0 262.6,252.5 265.9,253.0 269.3,253.5 272.6,254.0 276.0,254.5 279.3,254.9 282.7,255.4 286.0,255.8 289.4,256.2 292.7,256.6 296.1,257.0 299.5,257.4 302.8,257.8 306.2,258.1 309.5,258.5 312.9,258.8 316.2,259.1 319.6,259.5 322.9,259.8 326.3,260.1 329.6,260.4 333.0,260.7 336.3,261.0 339.7,261.3 343.1,261.5 346.4,261.8 349.8,262.1 353.1,262.3 356.5,262.6 359.8,262.8 363.2,263.1 366.5,263.3 369.9,263.5 373.2,263.8 376.6,264.0 379.9,264.2 383.3,264.4 386.6,264.6 390.0,264.8" fill="none" stroke="#38bdf8" stroke-width="2.6"/>
  <line x1="91.2" y1="141.7" x2="91.2" y2="285" stroke="#fbbf24" stroke-dasharray="4,3" stroke-width="1.4"/>
  <line x1="58" y1="141.7" x2="91.2" y2="141.7" stroke="#fbbf24" stroke-dasharray="4,3" stroke-width="1.4"/>
  <circle cx="91.2" cy="141.7" r="4.5" fill="#fbbf24"/>
  <text x="101.2" y="135.7" fill="#fbbf24" font-size="11" font-weight="700">半功率点 (1k, 0.707)</text>
  <text x="224" y="316" fill="#94a3b8" font-size="11" text-anchor="middle">角频率 ω (rad/s，线性)</text>

  <!-- Right panel -->
  <rect x="422" y="44" width="402" height="280" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="625" y="56" fill="#cbd5e1" font-size="12" font-weight="600" text-anchor="middle">半对数分贝刻度：20 log10|H(ω)|（乘除变加减，曲线变直线）</text>
  <line x1="472.0" y1="62" x2="472.0" y2="285" stroke="#334155" stroke-width="1"/><text x="472.0" y="301" fill="#94a3b8" font-size="11" text-anchor="middle">10^1</text><line x1="556.5" y1="62" x2="556.5" y2="285" stroke="#334155" stroke-width="1"/><text x="556.5" y="301" fill="#94a3b8" font-size="11" text-anchor="middle">10^2</text><line x1="641.0" y1="62" x2="641.0" y2="285" stroke="#334155" stroke-width="1"/><text x="641.0" y="301" fill="#94a3b8" font-size="11" text-anchor="middle">10^3</text><line x1="725.5" y1="62" x2="725.5" y2="285" stroke="#334155" stroke-width="1"/><text x="725.5" y="301" fill="#94a3b8" font-size="11" text-anchor="middle">10^4</text><line x1="810.0" y1="62" x2="810.0" y2="285" stroke="#334155" stroke-width="1"/><text x="810.0" y="301" fill="#94a3b8" font-size="11" text-anchor="middle">10^5</text><line x1="472" y1="84.3" x2="810" y2="84.3" stroke="#334155" stroke-width="1"/><text x="464" y="88.3" fill="#94a3b8" font-size="11" text-anchor="end">0</text><line x1="472" y1="128.9" x2="810" y2="128.9" stroke="#334155" stroke-width="1"/><text x="464" y="132.9" fill="#94a3b8" font-size="11" text-anchor="end">-10</text><line x1="472" y1="173.5" x2="810" y2="173.5" stroke="#334155" stroke-width="1"/><text x="464" y="177.5" fill="#94a3b8" font-size="11" text-anchor="end">-20</text><line x1="472" y1="218.1" x2="810" y2="218.1" stroke="#334155" stroke-width="1"/><text x="464" y="222.1" fill="#94a3b8" font-size="11" text-anchor="end">-30</text><line x1="472" y1="262.7" x2="810" y2="262.7" stroke="#334155" stroke-width="1"/><text x="464" y="266.7" fill="#94a3b8" font-size="11" text-anchor="end">-40</text>
  <!-- Asymptote -->
  <polyline points="472.0,84.3 641.0,84.3 810.0,262.7" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-dasharray="7,4"/>
  <!-- Exact curve -->
  <polyline points="472.0,84.3 475.4,84.3 478.8,84.3 482.2,84.3 485.7,84.3 489.1,84.3 492.5,84.3 495.9,84.3 499.3,84.3 502.7,84.3 506.1,84.3 509.6,84.3 513.0,84.3 516.4,84.3 519.8,84.3 523.2,84.3 526.6,84.3 530.0,84.3 533.5,84.4 536.9,84.4 540.3,84.4 543.7,84.4 547.1,84.4 550.5,84.4 553.9,84.5 557.4,84.5 560.8,84.5 564.2,84.6 567.6,84.7 571.0,84.7 574.4,84.8 577.8,84.9 581.3,85.0 584.7,85.2 588.1,85.4 591.5,85.6 594.9,85.8 598.3,86.1 601.7,86.5 605.2,86.9 608.6,87.4 612.0,87.9 615.4,88.6 618.8,89.4 622.2,90.2 625.6,91.3 629.1,92.4 632.5,93.7 635.9,95.2 639.3,96.8 642.7,98.6 646.1,100.6 649.5,102.8 652.9,105.0 656.4,107.5 659.8,110.1 663.2,112.8 666.6,115.6 670.0,118.6 673.4,121.6 676.8,124.7 680.3,127.9 683.7,131.2 687.1,134.5 690.5,137.8 693.9,141.2 697.3,144.6 700.7,148.1 704.2,151.6 707.6,155.1 711.0,158.6 714.4,162.1 717.8,165.7 721.2,169.2 724.6,172.8 728.1,176.4 731.5,179.9 734.9,183.5 738.3,187.1 741.7,190.7 745.1,194.3 748.5,197.9 752.0,201.5 755.4,205.1 758.8,208.7 762.2,212.3 765.6,215.9 769.0,219.5 772.4,223.1 775.9,226.7 779.3,230.3 782.7,233.9 786.1,237.5 789.5,241.1 792.9,244.7 796.3,248.3 799.8,251.9 803.2,255.5 806.6,259.1 810.0,262.7" fill="none" stroke="#38bdf8" stroke-width="2.6"/>
  <!-- -3 dB marker -->
  <line x1="641.0" y1="84.3" x2="641.0" y2="97.7" stroke="#f43f5e" stroke-width="2.2"/>
  <circle cx="641.0" cy="97.7" r="4.5" fill="#f43f5e"/>
  <text x="633.0" y="115.7" fill="#fb7185" font-size="11" font-weight="700" text-anchor="end">ω_c=10³: −3.01 dB</text>
  <text x="653.0" y="130.3" fill="#fbbf24" font-size="11" font-weight="700">斜率 −20 dB/dec</text>
  <text x="640" y="316" fill="#94a3b8" font-size="11" text-anchor="middle">角频率 ω (rad/s，每格 1 十倍频程 Decade)</text>
</svg>`;

export const SHEET_ACT3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 520" width="100%" style="max-width:860px;font-family:'PingFang SC','Noto Sans CJK SC',sans-serif;background:#0f172a;border-radius:12px;">
<rect x="0" y="0" width="860" height="520" fill="#0f172a" rx="12"/>
<text x="24" y="30" fill="#f8fafc" font-size="16" font-weight="700">波特图四大基本因子（幅频渐近线 vs 精确曲线特征全景）</text>
<rect x="20" y="46" width="400" height="218" rx="8" fill="#1e293b" stroke="#334155"/>
<text x="34" y="68" fill="#e2e8f0" font-size="12" font-weight="700">① 常数增益 K = 10（水平直线 +20 dB，相角 0°）</text>
<rect x="440" y="46" width="400" height="218" rx="8" fill="#1e293b" stroke="#334155"/>
<text x="454" y="68" fill="#e2e8f0" font-size="12" font-weight="700">② 原点零/极点 (jω)^±1（过 ω=1，±20 dB/dec，±90°）</text>
<rect x="20" y="280" width="400" height="222" rx="8" fill="#1e293b" stroke="#334155"/>
<text x="34" y="302" fill="#e2e8f0" font-size="12" font-weight="700">③ 一阶实极点 (1+jω/ω_c)^−1（ω_c 处 −3.01 dB 偏差）</text>
<rect x="440" y="280" width="400" height="222" rx="8" fill="#1e293b" stroke="#334155"/>
<text x="454" y="302" fill="#e2e8f0" font-size="12" font-weight="700">④ 二阶共轭极点（−40 dB/dec，ζ &lt; 0.707 谐振尖峰）</text>
<line x1="68" y1="213.7" x2="398" y2="213.7" stroke="#334155" stroke-width="1"/>
<text x="62" y="217.7" fill="#94a3b8" font-size="10" text-anchor="end">-20</text>
<line x1="68" y1="169.1" x2="398" y2="169.1" stroke="#334155" stroke-width="1"/>
<text x="62" y="173.1" fill="#94a3b8" font-size="10" text-anchor="end">0</text>
<line x1="68" y1="124.6" x2="398" y2="124.6" stroke="#334155" stroke-width="1"/>
<text x="62" y="128.6" fill="#94a3b8" font-size="10" text-anchor="end">20</text>
<line x1="68" y1="80.0" x2="398" y2="80.0" stroke="#334155" stroke-width="1"/>
<text x="62" y="84.0" fill="#94a3b8" font-size="10" text-anchor="end">40</text>
<line x1="68.0" y1="80" x2="68.0" y2="236" stroke="#334155" stroke-width="1"/>
<text x="68.0" y="250" fill="#94a3b8" font-size="10" text-anchor="middle">0.1</text>
<line x1="178.0" y1="80" x2="178.0" y2="236" stroke="#334155" stroke-width="1"/>
<text x="178.0" y="250" fill="#94a3b8" font-size="10" text-anchor="middle">1</text>
<line x1="288.0" y1="80" x2="288.0" y2="236" stroke="#334155" stroke-width="1"/>
<text x="288.0" y="250" fill="#94a3b8" font-size="10" text-anchor="middle">10</text>
<line x1="398.0" y1="80" x2="398.0" y2="236" stroke="#334155" stroke-width="1"/>
<text x="398.0" y="250" fill="#94a3b8" font-size="10" text-anchor="middle">100</text>
<line x1="68" y1="124.6" x2="398" y2="124.6" stroke="#38bdf8" stroke-width="2.6"/>
<text x="80" y="118.6" fill="#38bdf8" font-size="11" font-weight="700">K = 10 → +20 dB (水平线)</text>
<line x1="68" y1="213.7" x2="398" y2="213.7" stroke="#a78bfa" stroke-width="2" stroke-dasharray="5,3"/>
<text x="80" y="207.7" fill="#c4b5fd" font-size="11">K = 0.1 → −20 dB</text>
<line x1="488" y1="227.3" x2="818" y2="227.3" stroke="#334155" stroke-width="1"/>
<text x="482" y="231.3" fill="#94a3b8" font-size="10" text-anchor="end">-40</text>
<line x1="488" y1="192.7" x2="818" y2="192.7" stroke="#334155" stroke-width="1"/>
<text x="482" y="196.7" fill="#94a3b8" font-size="10" text-anchor="end">-20</text>
<line x1="488" y1="158.0" x2="818" y2="158.0" stroke="#334155" stroke-width="1"/>
<text x="482" y="162.0" fill="#94a3b8" font-size="10" text-anchor="end">0</text>
<line x1="488" y1="123.3" x2="818" y2="123.3" stroke="#334155" stroke-width="1"/>
<text x="482" y="127.3" fill="#94a3b8" font-size="10" text-anchor="end">20</text>
<line x1="488" y1="88.7" x2="818" y2="88.7" stroke="#334155" stroke-width="1"/>
<text x="482" y="92.7" fill="#94a3b8" font-size="10" text-anchor="end">40</text>
<line x1="488.0" y1="80" x2="488.0" y2="236" stroke="#334155" stroke-width="1"/>
<text x="488.0" y="250" fill="#94a3b8" font-size="10" text-anchor="middle">0.01</text>
<line x1="570.5" y1="80" x2="570.5" y2="236" stroke="#334155" stroke-width="1"/>
<text x="570.5" y="250" fill="#94a3b8" font-size="10" text-anchor="middle">0.1</text>
<line x1="653.0" y1="80" x2="653.0" y2="236" stroke="#334155" stroke-width="1"/>
<text x="653.0" y="250" fill="#94a3b8" font-size="10" text-anchor="middle">1</text>
<line x1="735.5" y1="80" x2="735.5" y2="236" stroke="#334155" stroke-width="1"/>
<text x="735.5" y="250" fill="#94a3b8" font-size="10" text-anchor="middle">10</text>
<line x1="818.0" y1="80" x2="818.0" y2="236" stroke="#334155" stroke-width="1"/>
<text x="818.0" y="250" fill="#94a3b8" font-size="10" text-anchor="middle">100</text>
<line x1="488.0" y1="227.3" x2="818.0" y2="88.7" stroke="#34d399" stroke-width="2.5"/>
<text x="708.0" y="102.7" fill="#34d399" font-size="11" font-weight="700">(jω): +20 dB/dec</text>
<line x1="488.0" y1="88.7" x2="818.0" y2="227.3" stroke="#fb7185" stroke-width="2.5"/>
<text x="702.0" y="219.3" fill="#fb7185" font-size="11" font-weight="700">1/(jω): −20 dB/dec</text>
<circle cx="653.0" cy="158.0" r="4.5" fill="#fbbf24"/>
<text x="661.0" y="150.0" fill="#fbbf24" font-size="10" font-weight="700">(ω=1, 0 dB)</text>
<line x1="68" y1="458.9" x2="398" y2="458.9" stroke="#334155" stroke-width="1"/>
<text x="62" y="462.9" fill="#94a3b8" font-size="10" text-anchor="end">-40</text>
<line x1="68" y1="398.5" x2="398" y2="398.5" stroke="#334155" stroke-width="1"/>
<text x="62" y="402.5" fill="#94a3b8" font-size="10" text-anchor="end">-20</text>
<line x1="68" y1="338.2" x2="398" y2="338.2" stroke="#334155" stroke-width="1"/>
<text x="62" y="342.2" fill="#94a3b8" font-size="10" text-anchor="end">0</text>
<line x1="68.0" y1="314" x2="68.0" y2="474" stroke="#334155" stroke-width="1"/>
<text x="68.0" y="488" fill="#94a3b8" font-size="10" text-anchor="middle">0.01ωc</text>
<line x1="150.5" y1="314" x2="150.5" y2="474" stroke="#334155" stroke-width="1"/>
<text x="150.5" y="488" fill="#94a3b8" font-size="10" text-anchor="middle">0.1ωc</text>
<line x1="233.0" y1="314" x2="233.0" y2="474" stroke="#334155" stroke-width="1"/>
<text x="233.0" y="488" fill="#94a3b8" font-size="10" text-anchor="middle">ωc</text>
<line x1="315.5" y1="314" x2="315.5" y2="474" stroke="#334155" stroke-width="1"/>
<text x="315.5" y="488" fill="#94a3b8" font-size="10" text-anchor="middle">10ωc</text>
<line x1="398.0" y1="314" x2="398.0" y2="474" stroke="#334155" stroke-width="1"/>
<text x="398.0" y="488" fill="#94a3b8" font-size="10" text-anchor="middle">100ωc</text>
<polyline points="68.0,338.2 233.0,338.2 398.0,458.9" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="6,3"/>
<polyline points="68.0,338.2 71.3,338.2 74.7,338.2 78.0,338.2 81.3,338.2 84.7,338.2 88.0,338.2 91.3,338.2 94.7,338.2 98.0,338.2 101.3,338.2 104.7,338.2 108.0,338.2 111.3,338.2 114.7,338.2 118.0,338.2 121.3,338.2 124.7,338.2 128.0,338.2 131.3,338.2 134.7,338.2 138.0,338.2 141.3,338.2 144.7,338.2 148.0,338.3 151.3,338.3 154.7,338.3 158.0,338.3 161.3,338.4 164.7,338.4 168.0,338.5 171.3,338.6 174.7,338.6 178.0,338.7 181.3,338.9 184.7,339.0 188.0,339.2 191.3,339.4 194.7,339.6 198.0,339.9 201.3,340.2 204.7,340.6 208.0,341.1 211.3,341.6 214.7,342.2 218.0,342.9 221.3,343.7 224.7,344.5 228.0,345.5 231.3,346.6 234.7,347.9 238.0,349.2 241.3,350.6 244.7,352.2 248.0,353.8 251.3,355.6 254.7,357.4 258.0,359.3 261.3,361.3 264.7,363.4 268.0,365.5 271.3,367.7 274.7,369.9 278.0,372.1 281.3,374.4 284.7,376.7 288.0,379.0 291.3,381.3 294.7,383.7 298.0,386.1 301.3,388.4 304.7,390.8 308.0,393.2 311.3,395.6 314.7,398.1 318.0,400.5 321.3,402.9 324.7,405.3 328.0,407.7 331.3,410.2 334.7,412.6 338.0,415.0 341.3,417.5 344.7,419.9 348.0,422.3 351.3,424.8 354.7,427.2 358.0,429.6 361.3,432.1 364.7,434.5 368.0,437.0 371.3,439.4 374.7,441.8 378.0,444.3 381.3,446.7 384.7,449.2 388.0,451.6 391.3,454.0 394.7,456.5 398.0,458.9" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
<circle cx="233.0" cy="347.2" r="4" fill="#f43f5e"/>
<text x="225.0" y="365.2" fill="#fb7185" font-size="10" font-weight="700" text-anchor="end">−3.01 dB 误差</text>
<text x="247.0" y="376.2" fill="#fbbf24" font-size="10" font-weight="700">−20 dB/dec</text>
<line x1="488" y1="451.1" x2="818" y2="451.1" stroke="#334155" stroke-width="1"/>
<text x="482" y="455.1" fill="#94a3b8" font-size="10" text-anchor="end">-40</text>
<line x1="488" y1="405.4" x2="818" y2="405.4" stroke="#334155" stroke-width="1"/>
<text x="482" y="409.4" fill="#94a3b8" font-size="10" text-anchor="end">-20</text>
<line x1="488" y1="359.7" x2="818" y2="359.7" stroke="#334155" stroke-width="1"/>
<text x="482" y="363.7" fill="#94a3b8" font-size="10" text-anchor="end">0</text>
<line x1="488" y1="325.4" x2="818" y2="325.4" stroke="#334155" stroke-width="1"/>
<text x="482" y="329.4" fill="#94a3b8" font-size="10" text-anchor="end">15</text>
<line x1="488.0" y1="314" x2="488.0" y2="474" stroke="#334155" stroke-width="1"/>
<text x="488.0" y="488" fill="#94a3b8" font-size="10" text-anchor="middle">0.1ωn</text>
<line x1="620.0" y1="314" x2="620.0" y2="474" stroke="#334155" stroke-width="1"/>
<text x="620.0" y="488" fill="#94a3b8" font-size="10" text-anchor="middle">ωn</text>
<line x1="752.0" y1="314" x2="752.0" y2="474" stroke="#334155" stroke-width="1"/>
<text x="752.0" y="488" fill="#94a3b8" font-size="10" text-anchor="middle">10ωn</text>
<polyline points="488.0,359.7 620.0,359.7 785.0,474.0" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="5,3"/>
<polyline points="488.0,359.5 491.0,359.5 494.0,359.5 497.0,359.4 500.0,359.4 503.0,359.4 506.0,359.3 509.0,359.3 512.0,359.3 515.0,359.2 518.0,359.2 521.0,359.1 524.0,359.0 527.0,358.9 530.0,358.9 533.0,358.8 536.0,358.6 539.0,358.5 542.0,358.4 545.0,358.2 548.0,358.1 551.0,357.9 554.0,357.7 557.0,357.4 560.0,357.2 563.0,356.9 566.0,356.5 569.0,356.1 572.0,355.7 575.0,355.2 578.0,354.7 581.0,354.0 584.0,353.3 587.0,352.4 590.0,351.5 593.0,350.3 596.0,349.0 599.0,347.4 602.0,345.5 605.0,343.2 608.0,340.4 611.0,337.0 614.0,333.0 617.0,329.1 620.0,327.8 623.0,331.2 626.0,337.2 629.0,343.3 632.0,348.7 635.0,353.6 638.0,358.0 641.0,361.9 644.0,365.6 647.0,369.0 650.0,372.2 653.0,375.3 656.0,378.2 659.0,381.0 662.0,383.7 665.0,386.4 668.0,389.0 671.0,391.5 674.0,393.9 677.0,396.3 680.0,398.7 683.0,401.1 686.0,403.4 689.0,405.7 692.0,407.9 695.0,410.2 698.0,412.4 701.0,414.6 704.0,416.8 707.0,419.0 710.0,421.2 713.0,423.4 716.0,425.5 719.0,427.7 722.0,429.8 725.0,431.9 728.0,434.1 731.0,436.2 734.0,438.3 737.0,440.4 740.0,442.5 743.0,444.6 746.0,446.7 749.0,448.8 752.0,450.9 755.0,453.0 758.0,455.1 761.0,457.2 764.0,459.3 767.0,461.4 770.0,463.5 773.0,465.6 776.0,467.7 779.0,469.8 782.0,471.9 785.0,473.9" fill="none" stroke="#f43f5e" stroke-width="2.1"/>
<line x1="690" y1="325" x2="706" y2="325" stroke="#f43f5e" stroke-width="2.2"/>
<text x="712" y="328" fill="#f43f5e" font-size="10" font-weight="600">ζ=0.1 (+14.0 dB)</text>
<polyline points="488.0,359.6 491.0,359.5 494.0,359.5 497.0,359.5 500.0,359.5 503.0,359.4 506.0,359.4 509.0,359.4 512.0,359.3 515.0,359.3 518.0,359.2 521.0,359.2 524.0,359.1 527.0,359.1 530.0,359.0 533.0,358.9 536.0,358.8 539.0,358.7 542.0,358.6 545.0,358.5 548.0,358.4 551.0,358.2 554.0,358.1 557.0,357.9 560.0,357.7 563.0,357.4 566.0,357.2 569.0,356.9 572.0,356.6 575.0,356.2 578.0,355.8 581.0,355.4 584.0,354.9 587.0,354.3 590.0,353.7 593.0,353.1 596.0,352.4 599.0,351.6 602.0,350.9 605.0,350.1 608.0,349.4 611.0,348.9 614.0,348.6 617.0,348.8 620.0,349.6 623.0,350.9 626.0,352.8 629.0,355.1 632.0,357.7 635.0,360.5 638.0,363.3 641.0,366.2 644.0,369.0 647.0,371.8 650.0,374.5 653.0,377.2 656.0,379.8 659.0,382.4 662.0,384.9 665.0,387.4 668.0,389.8 671.0,392.2 674.0,394.6 677.0,396.9 680.0,399.2 683.0,401.5 686.0,403.8 689.0,406.0 692.0,408.2 695.0,410.5 698.0,412.7 701.0,414.8 704.0,417.0 707.0,419.2 710.0,421.3 713.0,423.5 716.0,425.6 719.0,427.8 722.0,429.9 725.0,432.0 728.0,434.1 731.0,436.3 734.0,438.4 737.0,440.5 740.0,442.6 743.0,444.7 746.0,446.8 749.0,448.9 752.0,451.0 755.0,453.1 758.0,455.2 761.0,457.3 764.0,459.3 767.0,461.4 770.0,463.5 773.0,465.6 776.0,467.7 779.0,469.8 782.0,471.9 785.0,473.9" fill="none" stroke="#fbbf24" stroke-width="2.1"/>
<line x1="690" y1="341" x2="706" y2="341" stroke="#fbbf24" stroke-width="2.2"/>
<text x="712" y="344" fill="#fbbf24" font-size="10" font-weight="600">ζ=0.3 (+4.85 dB)</text>
<polyline points="488.0,359.7 491.0,359.7 494.0,359.7 497.0,359.7 500.0,359.7 503.0,359.7 506.0,359.7 509.0,359.7 512.0,359.7 515.0,359.7 518.0,359.7 521.0,359.7 524.0,359.7 527.0,359.7 530.0,359.7 533.0,359.7 536.0,359.7 539.0,359.7 542.0,359.8 545.0,359.8 548.0,359.8 551.0,359.8 554.0,359.8 557.0,359.8 560.0,359.9 563.0,359.9 566.0,359.9 569.0,360.0 572.0,360.1 575.0,360.1 578.0,360.2 581.0,360.3 584.0,360.5 587.0,360.7 590.0,360.9 593.0,361.1 596.0,361.4 599.0,361.8 602.0,362.2 605.0,362.7 608.0,363.3 611.0,364.0 614.0,364.7 617.0,365.6 620.0,366.6 623.0,367.7 626.0,368.9 629.0,370.2 632.0,371.6 635.0,373.1 638.0,374.7 641.0,376.3 644.0,378.0 647.0,379.8 650.0,381.6 653.0,383.5 656.0,385.4 659.0,387.4 662.0,389.3 665.0,391.3 668.0,393.3 671.0,395.3 674.0,397.3 677.0,399.4 680.0,401.4 683.0,403.5 686.0,405.5 689.0,407.6 692.0,409.6 695.0,411.7 698.0,413.8 701.0,415.9 704.0,417.9 707.0,420.0 710.0,422.1 713.0,424.1 716.0,426.2 719.0,428.3 722.0,430.4 725.0,432.4 728.0,434.5 731.0,436.6 734.0,438.7 737.0,440.8 740.0,442.8 743.0,444.9 746.0,447.0 749.0,449.1 752.0,451.1 755.0,453.2 758.0,455.3 761.0,457.4 764.0,459.5 767.0,461.5 770.0,463.6 773.0,465.7 776.0,467.8 779.0,469.8 782.0,471.9 785.0,474.0" fill="none" stroke="#38bdf8" stroke-width="2.1"/>
<line x1="690" y1="357" x2="706" y2="357" stroke="#38bdf8" stroke-width="2.2"/>
<text x="712" y="360" fill="#38bdf8" font-size="10" font-weight="600">ζ=0.707 (无尖峰)</text>
<polyline points="488.0,359.9 491.0,359.9 494.0,360.0 497.0,360.0 500.0,360.0 503.0,360.0 506.0,360.1 509.0,360.1 512.0,360.2 515.0,360.2 518.0,360.3 521.0,360.3 524.0,360.4 527.0,360.5 530.0,360.6 533.0,360.6 536.0,360.7 539.0,360.9 542.0,361.0 545.0,361.1 548.0,361.3 551.0,361.4 554.0,361.6 557.0,361.8 560.0,362.0 563.0,362.3 566.0,362.5 569.0,362.8 572.0,363.1 575.0,363.5 578.0,363.8 581.0,364.2 584.0,364.7 587.0,365.2 590.0,365.7 593.0,366.3 596.0,366.9 599.0,367.5 602.0,368.2 605.0,369.0 608.0,369.8 611.0,370.6 614.0,371.5 617.0,372.5 620.0,373.5 623.0,374.5 626.0,375.7 629.0,376.8 632.0,378.1 635.0,379.3 638.0,380.7 641.0,382.1 644.0,383.5 647.0,385.0 650.0,386.5 653.0,388.0 656.0,389.6 659.0,391.3 662.0,392.9 665.0,394.6 668.0,396.4 671.0,398.1 674.0,399.9 677.0,401.7 680.0,403.6 683.0,405.4 686.0,407.3 689.0,409.2 692.0,411.1 695.0,413.1 698.0,415.0 701.0,417.0 704.0,418.9 707.0,420.9 710.0,422.9 713.0,424.9 716.0,426.9 719.0,428.9 722.0,430.9 725.0,432.9 728.0,435.0 731.0,437.0 734.0,439.0 737.0,441.1 740.0,443.1 743.0,445.2 746.0,447.2 749.0,449.3 752.0,451.3 755.0,453.4 758.0,455.5 761.0,457.5 764.0,459.6 767.0,461.6 770.0,463.7 773.0,465.8 776.0,467.9 779.0,469.9 782.0,472.0 785.0,474.0" fill="none" stroke="#34d399" stroke-width="2.1"/>
<line x1="690" y1="373" x2="706" y2="373" stroke="#34d399" stroke-width="2.2"/>
<text x="712" y="376" fill="#34d399" font-size="10" font-weight="600">ζ=1.0 (−6.0 dB)</text>
<text x="678.0" y="437.7" fill="#cbd5e1" font-size="10" font-weight="700">−40 dB/dec</text>
</svg>`;

export const SHEET_ACT4_MAG = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 410" width="100%" style="max-width:860px;font-family:'PingFang SC','Noto Sans CJK SC',sans-serif;background:#0f172a;border-radius:12px;">
<rect x="0" y="0" width="860" height="410" fill="#0f172a" rx="12"/>
<text x="24" y="30" fill="#f8fafc" font-size="15" font-weight="700">复合传递函数 H(ω) = 200jω / [(jω+2)(jω+10)] 幅频波特图（渐近线 vs 精确曲线）</text>
<rect x="76" y="64" width="746" height="280" fill="#1e293b" stroke="#334155"/>
<line x1="76.0" y1="64" x2="76.0" y2="344" stroke="#475569" stroke-width="1.1"/>
<text x="76.0" y="362" fill="#cbd5e1" font-size="11" text-anchor="middle">0.1</text>
<line x1="132.1" y1="64" x2="132.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="165.0" y1="64" x2="165.0" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="188.3" y1="64" x2="188.3" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="206.4" y1="64" x2="206.4" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="221.1" y1="64" x2="221.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="233.6" y1="64" x2="233.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="244.4" y1="64" x2="244.4" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="254.0" y1="64" x2="254.0" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="262.5" y1="64" x2="262.5" y2="344" stroke="#475569" stroke-width="1.1"/>
<text x="262.5" y="362" fill="#cbd5e1" font-size="11" text-anchor="middle">1</text>
<line x1="318.6" y1="64" x2="318.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="351.5" y1="64" x2="351.5" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="374.8" y1="64" x2="374.8" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="392.9" y1="64" x2="392.9" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="407.6" y1="64" x2="407.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="420.1" y1="64" x2="420.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="430.9" y1="64" x2="430.9" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="440.5" y1="64" x2="440.5" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="449.0" y1="64" x2="449.0" y2="344" stroke="#475569" stroke-width="1.1"/>
<text x="449.0" y="362" fill="#cbd5e1" font-size="11" text-anchor="middle">10</text>
<line x1="505.1" y1="64" x2="505.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="538.0" y1="64" x2="538.0" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="561.3" y1="64" x2="561.3" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="579.4" y1="64" x2="579.4" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="594.1" y1="64" x2="594.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="606.6" y1="64" x2="606.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="617.4" y1="64" x2="617.4" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="627.0" y1="64" x2="627.0" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="635.5" y1="64" x2="635.5" y2="344" stroke="#475569" stroke-width="1.1"/>
<text x="635.5" y="362" fill="#cbd5e1" font-size="11" text-anchor="middle">100</text>
<line x1="691.6" y1="64" x2="691.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="724.5" y1="64" x2="724.5" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="747.8" y1="64" x2="747.8" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="765.9" y1="64" x2="765.9" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="780.6" y1="64" x2="780.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="793.1" y1="64" x2="793.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="803.9" y1="64" x2="803.9" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="813.5" y1="64" x2="813.5" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="822.0" y1="64" x2="822.0" y2="344" stroke="#475569" stroke-width="1.1"/>
<text x="822.0" y="362" fill="#cbd5e1" font-size="11" text-anchor="middle">1000</text>
<line x1="76" y1="320.7" x2="822" y2="320.7" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="324.7" fill="#cbd5e1" font-size="11" text-anchor="end">-20 dB</text>
<line x1="76" y1="274.0" x2="822" y2="274.0" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="278.0" fill="#cbd5e1" font-size="11" text-anchor="end">-10 dB</text>
<line x1="76" y1="227.3" x2="822" y2="227.3" stroke="#64748b" stroke-width="1.4"/>
<text x="66" y="231.3" fill="#cbd5e1" font-size="11" text-anchor="end">0 dB</text>
<line x1="76" y1="180.7" x2="822" y2="180.7" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="184.7" fill="#cbd5e1" font-size="11" text-anchor="end">10 dB</text>
<line x1="76" y1="134.0" x2="822" y2="134.0" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="138.0" fill="#cbd5e1" font-size="11" text-anchor="end">20 dB</text>
<line x1="76" y1="87.3" x2="822" y2="87.3" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="91.3" fill="#cbd5e1" font-size="11" text-anchor="end">30 dB</text>
<line x1="76" y1="134.0" x2="822" y2="134.0" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="4,4"/>
<polyline points="76.0,320.7 86.5,315.4 96.9,310.2 107.4,305.0 117.9,299.7 128.3,294.5 138.8,289.2 149.3,284.0 159.7,278.8 170.2,273.5 180.7,268.3 191.1,263.0 201.6,257.8 212.1,252.6 222.5,247.3 233.0,242.1 243.5,236.9 253.9,231.6 264.4,226.4 274.9,221.1 285.3,215.9 295.8,210.7 306.3,205.4 316.7,200.2 327.2,195.0 337.7,189.7 348.1,184.5 358.6,179.2 369.1,174.0 379.5,168.8 390.0,163.5 400.5,158.3 410.9,153.0 421.4,147.8 431.9,142.6 442.3,137.3 452.8,132.1 463.3,126.9 473.7,121.6 484.2,116.4 494.7,111.1 505.1,105.9 515.6,100.7 526.1,95.4 536.5,90.2 547.0,85.0 557.5,79.7 567.9,74.5 578.4,69.2 588.9,64.0" fill="none" stroke="#34d399" stroke-width="1.3" stroke-dasharray="4,4"/>
<polyline points="76.0,227.3 318.6,227.3 551.8,344.0" fill="none" stroke="#c084fc" stroke-width="1.3" stroke-dasharray="4,4"/>
<polyline points="76.0,227.3 449.0,227.3 682.1,344.0" fill="none" stroke="#f472b6" stroke-width="1.3" stroke-dasharray="4,4"/>
<polyline points="76.0,227.3 318.6,105.9 449.0,105.9 822.0,292.6" fill="none" stroke="#fbbf24" stroke-width="2.6" stroke-dasharray="8,4"/>
<polyline points="76.0,227.4 83.5,223.6 91.1,219.9 98.6,216.1 106.1,212.4 113.7,208.6 121.2,204.9 128.7,201.1 136.3,197.4 143.8,193.7 151.4,190.0 158.9,186.3 166.4,182.6 174.0,178.9 181.5,175.2 189.0,171.6 196.6,168.0 204.1,164.4 211.6,160.9 219.2,157.4 226.7,154.0 234.2,150.6 241.8,147.3 249.3,144.1 256.8,141.0 264.4,138.0 271.9,135.1 279.5,132.3 287.0,129.7 294.5,127.3 302.1,125.1 309.6,123.0 317.1,121.1 324.7,119.4 332.2,117.9 339.7,116.7 347.3,115.6 354.8,114.7 362.3,114.1 369.9,113.6 377.4,113.4 384.9,113.3 392.5,113.4 400.0,113.7 407.6,114.3 415.1,115.0 422.6,115.9 430.2,117.0 437.7,118.4 445.2,119.9 452.8,121.6 460.3,123.6 467.8,125.7 475.4,128.0 482.9,130.5 490.4,133.2 498.0,135.9 505.5,138.9 513.1,141.9 520.6,145.1 528.1,148.3 535.7,151.6 543.2,155.0 550.7,158.5 558.3,162.0 565.8,165.5 573.3,169.1 580.9,172.7 588.4,176.3 595.9,180.0 603.5,183.7 611.0,187.4 618.5,191.1 626.1,194.8 633.6,198.5 641.2,202.2 648.7,206.0 656.2,209.7 663.8,213.5 671.3,217.2 678.8,221.0 686.4,224.8 693.9,228.5 701.4,232.3 709.0,236.0 716.5,239.8 724.0,243.6 731.6,247.3 739.1,251.1 746.6,254.9 754.2,258.6 761.7,262.4 769.3,266.2 776.8,270.0 784.3,273.7 791.9,277.5 799.4,281.3 806.9,285.0 814.5,288.8 822.0,292.6" fill="none" stroke="#38bdf8" stroke-width="3.0"/>
<line x1="318.6" y1="64" x2="318.6" y2="344" stroke="#f43f5e" stroke-width="1.2" stroke-dasharray="3,3"/>
<circle cx="318.6" cy="105.9" r="4" fill="#fbbf24"/>
<circle cx="318.6" cy="120.7" r="4.5" fill="#f43f5e"/>
<text x="318.6" y="80" fill="#fda4af" font-size="11" font-weight="700" text-anchor="middle">ω_p1=2.0</text>
<text x="310.6" y="136.7" fill="#fb7185" font-size="11" font-weight="700" text-anchor="end">精确 22.84 dB (-3.18 dB)</text>
<line x1="449.0" y1="64" x2="449.0" y2="344" stroke="#f43f5e" stroke-width="1.2" stroke-dasharray="3,3"/>
<circle cx="449.0" cy="105.9" r="4" fill="#fbbf24"/>
<circle cx="449.0" cy="120.7" r="4.5" fill="#f43f5e"/>
<text x="449.0" y="80" fill="#fda4af" font-size="11" font-weight="700" text-anchor="middle">ω_p2=10.0</text>
<text x="457.0" y="136.7" fill="#fb7185" font-size="11" font-weight="700" text-anchor="start">精确 22.84 dB (-3.18 dB)</text>
<text x="187.3" y="154.6" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="end">+20 dB/dec</text>
<text x="383.8" y="95.9" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">0 dB/dec (26.02 dB)</text>
<text x="645.5" y="189.2" fill="#fbbf24" font-size="11" font-weight="700">−20 dB/dec</text>
<line x1="76" y1="48" x2="104" y2="48" stroke="#38bdf8" stroke-width="3"/>
<text x="110" y="52" fill="#38bdf8" font-size="11" font-weight="600">精确幅频曲线</text>
<line x1="200" y1="48" x2="228" y2="48" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="6,3"/>
<text x="234" y="52" fill="#fbbf24" font-size="11" font-weight="600">合成直线渐近线</text>
<line x1="340" y1="48" x2="368" y2="48" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4"/>
<text x="374" y="52" fill="#94a3b8" font-size="11">各独立因子分量 (K, jω, p1, p2)</text>
<text x="450" y="388" fill="#94a3b8" font-size="12" text-anchor="middle">角频率 ω (rad/s，对数坐标)</text>
</svg>`;

export const SHEET_ACT4_PHASE = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 390" width="100%" style="max-width:860px;font-family:'PingFang SC','Noto Sans CJK SC',sans-serif;background:#0f172a;border-radius:12px;">
<rect x="0" y="0" width="860" height="390" fill="#0f172a" rx="12"/>
<text x="24" y="30" fill="#f8fafc" font-size="15" font-weight="700">复合传递函数 H(ω) = 200jω / [(jω+2)(jω+10)] 相频波特图（渐近线 vs 精确曲线）</text>
<rect x="76" y="64" width="746" height="262" fill="#1e293b" stroke="#334155"/>
<line x1="76.0" y1="64" x2="76.0" y2="326" stroke="#475569" stroke-width="1.1"/>
<text x="76.0" y="344" fill="#cbd5e1" font-size="11" text-anchor="middle">0.1</text>
<line x1="132.1" y1="64" x2="132.1" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="165.0" y1="64" x2="165.0" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="188.3" y1="64" x2="188.3" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="206.4" y1="64" x2="206.4" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="221.1" y1="64" x2="221.1" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="233.6" y1="64" x2="233.6" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="244.4" y1="64" x2="244.4" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="254.0" y1="64" x2="254.0" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="262.5" y1="64" x2="262.5" y2="326" stroke="#475569" stroke-width="1.1"/>
<text x="262.5" y="344" fill="#cbd5e1" font-size="11" text-anchor="middle">1</text>
<line x1="318.6" y1="64" x2="318.6" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="351.5" y1="64" x2="351.5" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="374.8" y1="64" x2="374.8" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="392.9" y1="64" x2="392.9" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="407.6" y1="64" x2="407.6" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="420.1" y1="64" x2="420.1" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="430.9" y1="64" x2="430.9" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="440.5" y1="64" x2="440.5" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="449.0" y1="64" x2="449.0" y2="326" stroke="#475569" stroke-width="1.1"/>
<text x="449.0" y="344" fill="#cbd5e1" font-size="11" text-anchor="middle">10</text>
<line x1="505.1" y1="64" x2="505.1" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="538.0" y1="64" x2="538.0" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="561.3" y1="64" x2="561.3" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="579.4" y1="64" x2="579.4" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="594.1" y1="64" x2="594.1" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="606.6" y1="64" x2="606.6" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="617.4" y1="64" x2="617.4" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="627.0" y1="64" x2="627.0" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="635.5" y1="64" x2="635.5" y2="326" stroke="#475569" stroke-width="1.1"/>
<text x="635.5" y="344" fill="#cbd5e1" font-size="11" text-anchor="middle">100</text>
<line x1="691.6" y1="64" x2="691.6" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="724.5" y1="64" x2="724.5" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="747.8" y1="64" x2="747.8" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="765.9" y1="64" x2="765.9" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="780.6" y1="64" x2="780.6" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="793.1" y1="64" x2="793.1" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="803.9" y1="64" x2="803.9" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="813.5" y1="64" x2="813.5" y2="326" stroke="#273449" stroke-width="0.8"/>
<line x1="822.0" y1="64" x2="822.0" y2="326" stroke="#475569" stroke-width="1.1"/>
<text x="822.0" y="344" fill="#cbd5e1" font-size="11" text-anchor="middle">1000</text>
<line x1="76" y1="307.3" x2="822" y2="307.3" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="311.3" fill="#cbd5e1" font-size="11" text-anchor="end">-90°</text>
<line x1="76" y1="251.1" x2="822" y2="251.1" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="255.1" fill="#cbd5e1" font-size="11" text-anchor="end">-45°</text>
<line x1="76" y1="195.0" x2="822" y2="195.0" stroke="#64748b" stroke-width="1.4"/>
<text x="66" y="199.0" fill="#cbd5e1" font-size="11" text-anchor="end">+0°</text>
<line x1="76" y1="138.9" x2="822" y2="138.9" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="142.9" fill="#cbd5e1" font-size="11" text-anchor="end">+45°</text>
<line x1="76" y1="82.7" x2="822" y2="82.7" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="86.7" fill="#cbd5e1" font-size="11" text-anchor="end">+90°</text>
<polyline points="76.0,195.0 132.1,195.0 505.1,307.3 822.0,307.3" fill="none" stroke="#c084fc" stroke-width="1.3" stroke-dasharray="4,4"/>
<polyline points="76.0,195.0 262.5,195.0 635.5,307.3 822.0,307.3" fill="none" stroke="#f472b6" stroke-width="1.3" stroke-dasharray="4,4"/>
<line x1="76" y1="82.7" x2="822" y2="82.7" stroke="#34d399" stroke-width="1.3" stroke-dasharray="4,4"/>
<polyline points="76.0,82.7 132.1,82.7 262.5,122.0 505.1,268.0 635.5,307.3 822.0,307.3" fill="none" stroke="#fbbf24" stroke-width="2.6" stroke-dasharray="8,4"/>
<polyline points="76.0,87.0 83.5,87.4 91.1,87.9 98.6,88.4 106.1,88.9 113.7,89.5 121.2,90.2 128.7,90.9 136.3,91.7 143.8,92.6 151.4,93.5 158.9,94.6 166.4,95.7 174.0,97.0 181.5,98.3 189.0,99.8 196.6,101.5 204.1,103.2 211.6,105.2 219.2,107.3 226.7,109.5 234.2,112.0 241.8,114.6 249.3,117.5 256.8,120.6 264.4,123.8 271.9,127.3 279.5,131.0 287.0,134.8 294.5,138.9 302.1,143.1 309.6,147.5 317.1,152.0 324.7,156.7 332.2,161.4 339.7,166.2 347.3,171.1 354.8,176.0 362.3,180.9 369.9,185.8 377.4,190.8 384.9,195.7 392.5,200.7 400.0,205.6 407.6,210.6 415.1,215.5 422.6,220.4 430.2,225.2 437.7,230.0 445.2,234.7 452.8,239.3 460.3,243.8 467.8,248.1 475.4,252.3 482.9,256.3 490.4,260.2 498.0,263.8 505.5,267.2 513.1,270.4 520.6,273.4 528.1,276.2 535.7,278.8 543.2,281.2 550.7,283.4 558.3,285.4 565.8,287.3 573.3,289.0 580.9,290.6 588.4,292.1 595.9,293.4 603.5,294.6 611.0,295.7 618.5,296.8 626.1,297.7 633.6,298.5 641.2,299.3 648.7,300.0 656.2,300.7 663.8,301.2 671.3,301.8 678.8,302.3 686.4,302.7 693.9,303.1 701.4,303.5 709.0,303.8 716.5,304.1 724.0,304.4 731.6,304.7 739.1,304.9 746.6,305.1 754.2,305.3 761.7,305.5 769.3,305.6 776.8,305.8 784.3,305.9 791.9,306.0 799.4,306.2 806.9,306.3 814.5,306.3 822.0,306.4" fill="none" stroke="#38bdf8" stroke-width="3.0"/>
<circle cx="383.8" cy="195.0" r="5" fill="#34d399"/>
<text x="393.8" y="185.0" fill="#34d399" font-size="11" font-weight="700">ω_0 = √(2.0×10.0) ≈ 4.47: 0°</text>
<line x1="76" y1="48" x2="104" y2="48" stroke="#38bdf8" stroke-width="3"/>
<text x="110" y="52" fill="#38bdf8" font-size="11" font-weight="600">精确相频曲线</text>
<line x1="200" y1="48" x2="228" y2="48" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="6,3"/>
<text x="234" y="52" fill="#fbbf24" font-size="11" font-weight="600">合成相角渐近线 (−45°/dec 每极点)</text>
<text x="450" y="370" fill="#94a3b8" font-size="12" text-anchor="middle">角频率 ω (rad/s，对数坐标)</text>
</svg>`;

export const SHEET_ACT5_REF = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 410" width="100%" style="max-width:860px;font-family:'PingFang SC','Noto Sans CJK SC',sans-serif;background:#0f172a;border-radius:12px;">
<rect x="0" y="0" width="860" height="410" fill="#0f172a" rx="12"/>
<text x="24" y="30" fill="#f8fafc" font-size="15" font-weight="700">苏格拉底例题 H(ω) = 2000jω / [(jω+2)(jω+100)] 幅频波特图参考</text>
<rect x="76" y="64" width="746" height="280" fill="#1e293b" stroke="#334155"/>
<line x1="76.0" y1="64" x2="76.0" y2="344" stroke="#475569" stroke-width="1.1"/>
<text x="76.0" y="362" fill="#cbd5e1" font-size="11" text-anchor="middle">0.1</text>
<line x1="132.1" y1="64" x2="132.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="165.0" y1="64" x2="165.0" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="188.3" y1="64" x2="188.3" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="206.4" y1="64" x2="206.4" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="221.1" y1="64" x2="221.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="233.6" y1="64" x2="233.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="244.4" y1="64" x2="244.4" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="254.0" y1="64" x2="254.0" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="262.5" y1="64" x2="262.5" y2="344" stroke="#475569" stroke-width="1.1"/>
<text x="262.5" y="362" fill="#cbd5e1" font-size="11" text-anchor="middle">1</text>
<line x1="318.6" y1="64" x2="318.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="351.5" y1="64" x2="351.5" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="374.8" y1="64" x2="374.8" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="392.9" y1="64" x2="392.9" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="407.6" y1="64" x2="407.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="420.1" y1="64" x2="420.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="430.9" y1="64" x2="430.9" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="440.5" y1="64" x2="440.5" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="449.0" y1="64" x2="449.0" y2="344" stroke="#475569" stroke-width="1.1"/>
<text x="449.0" y="362" fill="#cbd5e1" font-size="11" text-anchor="middle">10</text>
<line x1="505.1" y1="64" x2="505.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="538.0" y1="64" x2="538.0" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="561.3" y1="64" x2="561.3" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="579.4" y1="64" x2="579.4" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="594.1" y1="64" x2="594.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="606.6" y1="64" x2="606.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="617.4" y1="64" x2="617.4" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="627.0" y1="64" x2="627.0" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="635.5" y1="64" x2="635.5" y2="344" stroke="#475569" stroke-width="1.1"/>
<text x="635.5" y="362" fill="#cbd5e1" font-size="11" text-anchor="middle">100</text>
<line x1="691.6" y1="64" x2="691.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="724.5" y1="64" x2="724.5" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="747.8" y1="64" x2="747.8" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="765.9" y1="64" x2="765.9" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="780.6" y1="64" x2="780.6" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="793.1" y1="64" x2="793.1" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="803.9" y1="64" x2="803.9" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="813.5" y1="64" x2="813.5" y2="344" stroke="#273449" stroke-width="0.8"/>
<line x1="822.0" y1="64" x2="822.0" y2="344" stroke="#475569" stroke-width="1.1"/>
<text x="822.0" y="362" fill="#cbd5e1" font-size="11" text-anchor="middle">1000</text>
<line x1="76" y1="320.7" x2="822" y2="320.7" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="324.7" fill="#cbd5e1" font-size="11" text-anchor="end">-20 dB</text>
<line x1="76" y1="274.0" x2="822" y2="274.0" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="278.0" fill="#cbd5e1" font-size="11" text-anchor="end">-10 dB</text>
<line x1="76" y1="227.3" x2="822" y2="227.3" stroke="#64748b" stroke-width="1.4"/>
<text x="66" y="231.3" fill="#cbd5e1" font-size="11" text-anchor="end">0 dB</text>
<line x1="76" y1="180.7" x2="822" y2="180.7" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="184.7" fill="#cbd5e1" font-size="11" text-anchor="end">10 dB</text>
<line x1="76" y1="134.0" x2="822" y2="134.0" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="138.0" fill="#cbd5e1" font-size="11" text-anchor="end">20 dB</text>
<line x1="76" y1="87.3" x2="822" y2="87.3" stroke="#334155" stroke-width="1.0"/>
<text x="66" y="91.3" fill="#cbd5e1" font-size="11" text-anchor="end">30 dB</text>
<line x1="76" y1="134.0" x2="822" y2="134.0" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="4,4"/>
<polyline points="76.0,320.7 86.5,315.4 96.9,310.2 107.4,305.0 117.9,299.7 128.3,294.5 138.8,289.2 149.3,284.0 159.7,278.8 170.2,273.5 180.7,268.3 191.1,263.0 201.6,257.8 212.1,252.6 222.5,247.3 233.0,242.1 243.5,236.9 253.9,231.6 264.4,226.4 274.9,221.1 285.3,215.9 295.8,210.7 306.3,205.4 316.7,200.2 327.2,195.0 337.7,189.7 348.1,184.5 358.6,179.2 369.1,174.0 379.5,168.8 390.0,163.5 400.5,158.3 410.9,153.0 421.4,147.8 431.9,142.6 442.3,137.3 452.8,132.1 463.3,126.9 473.7,121.6 484.2,116.4 494.7,111.1 505.1,105.9 515.6,100.7 526.1,95.4 536.5,90.2 547.0,85.0 557.5,79.7 567.9,74.5 578.4,69.2 588.9,64.0" fill="none" stroke="#34d399" stroke-width="1.3" stroke-dasharray="4,4"/>
<polyline points="76.0,227.3 318.6,227.3 551.8,344.0" fill="none" stroke="#c084fc" stroke-width="1.3" stroke-dasharray="4,4"/>
<polyline points="76.0,227.3 635.5,227.3 822.0,320.7" fill="none" stroke="#f472b6" stroke-width="1.3" stroke-dasharray="4,4"/>
<polyline points="76.0,227.3 318.6,105.9 635.5,105.9 822.0,199.2" fill="none" stroke="#fbbf24" stroke-width="2.6" stroke-dasharray="8,4"/>
<polyline points="76.0,227.4 83.5,223.6 91.1,219.9 98.6,216.1 106.1,212.4 113.7,208.6 121.2,204.9 128.7,201.1 136.3,197.4 143.8,193.7 151.4,189.9 158.9,186.2 166.4,182.5 174.0,178.9 181.5,175.2 189.0,171.6 196.6,168.0 204.1,164.4 211.6,160.8 219.2,157.4 226.7,153.9 234.2,150.5 241.8,147.2 249.3,144.0 256.8,140.8 264.4,137.8 271.9,134.8 279.5,132.0 287.0,129.4 294.5,126.9 302.1,124.5 309.6,122.3 317.1,120.3 324.7,118.5 332.2,116.9 339.7,115.4 347.3,114.0 354.8,112.9 362.3,111.9 369.9,111.0 377.4,110.2 384.9,109.5 392.5,109.0 400.0,108.5 407.6,108.1 415.1,107.8 422.6,107.5 430.2,107.3 437.7,107.1 445.2,107.0 452.8,106.9 460.3,106.8 467.8,106.7 475.4,106.7 482.9,106.7 490.4,106.7 498.0,106.8 505.5,106.9 513.1,107.0 520.6,107.2 528.1,107.4 535.7,107.7 543.2,108.0 550.7,108.3 558.3,108.8 565.8,109.3 573.3,109.9 580.9,110.6 588.4,111.4 595.9,112.4 603.5,113.5 611.0,114.8 618.5,116.2 626.1,117.7 633.6,119.5 641.2,121.4 648.7,123.5 656.2,125.8 663.8,128.2 671.3,130.8 678.8,133.6 686.4,136.4 693.9,139.4 701.4,142.5 709.0,145.7 716.5,149.0 724.0,152.4 731.6,155.8 739.1,159.3 746.6,162.8 754.2,166.4 761.7,169.9 769.3,173.6 776.8,177.2 784.3,180.9 791.9,184.6 799.4,188.3 806.9,192.0 814.5,195.7 822.0,199.4" fill="none" stroke="#38bdf8" stroke-width="3.0"/>
<line x1="318.6" y1="64" x2="318.6" y2="344" stroke="#f43f5e" stroke-width="1.2" stroke-dasharray="3,3"/>
<circle cx="318.6" cy="105.9" r="4" fill="#fbbf24"/>
<circle cx="318.6" cy="120.0" r="4.5" fill="#f43f5e"/>
<text x="318.6" y="80" fill="#fda4af" font-size="11" font-weight="700" text-anchor="middle">ω_p1=2.0</text>
<text x="310.6" y="136.0" fill="#fb7185" font-size="11" font-weight="700" text-anchor="end">精确 23.01 dB (-3.01 dB)</text>
<line x1="635.5" y1="64" x2="635.5" y2="344" stroke="#f43f5e" stroke-width="1.2" stroke-dasharray="3,3"/>
<circle cx="635.5" cy="105.9" r="4" fill="#fbbf24"/>
<circle cx="635.5" cy="120.0" r="4.5" fill="#f43f5e"/>
<text x="635.5" y="80" fill="#fda4af" font-size="11" font-weight="700" text-anchor="middle">ω_p2=100.0</text>
<text x="643.5" y="136.0" fill="#fb7185" font-size="11" font-weight="700" text-anchor="start">精确 23.01 dB (-3.01 dB)</text>
<text x="187.3" y="154.6" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="end">+20 dB/dec</text>
<text x="477.1" y="95.9" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">0 dB/dec (26.02 dB)</text>
<text x="738.8" y="142.6" fill="#fbbf24" font-size="11" font-weight="700">−20 dB/dec</text>
<line x1="76" y1="48" x2="104" y2="48" stroke="#38bdf8" stroke-width="3"/>
<text x="110" y="52" fill="#38bdf8" font-size="11" font-weight="600">精确幅频曲线</text>
<line x1="200" y1="48" x2="228" y2="48" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="6,3"/>
<text x="234" y="52" fill="#fbbf24" font-size="11" font-weight="600">合成直线渐近线</text>
<line x1="340" y1="48" x2="368" y2="48" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4"/>
<text x="374" y="52" fill="#94a3b8" font-size="11">各独立因子分量 (K, jω, p1, p2)</text>
<text x="450" y="388" fill="#94a3b8" font-size="12" text-anchor="middle">角频率 ω (rad/s，对数坐标)</text>
</svg>`;
