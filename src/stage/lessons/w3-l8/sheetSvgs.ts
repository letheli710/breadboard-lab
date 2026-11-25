// The lesson sheet's inline SVGs (docs/lessons/W3-L8.md), copied as written: the six figures
// of acts 1–4 (1.2, 1.5, 2.2, 2.4, 3.2, 4.1) and the five mini_svg of the guided example. They are
// drawn for a dark canvas; svgs.ts fixes what needs fixing and recolours them with lightSvg.

export const SHEET_DAC = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 390" width="820" height="390" role="img" aria-label="4位二进制加权DAC开关阵列原理图">
  <rect x="0" y="0" width="820" height="390" rx="12" fill="#0f172a"/>
  <text x="24" y="34" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">4 位二进制加权 DAC（Sadiku Fig. 5.39 / Example 5.11）</text>
  <text x="24" y="54" fill="#94a3b8" font-family="sans-serif" font-size="12">R = 10 kΩ, 2R = 20 kΩ, 4R = 40 kΩ, 8R = 80 kΩ, Rf = 10 kΩ | 双电源 ±9V</text>

  <!-- Reference Bus -->
  <line x1="60" y1="85" x2="60" y2="335" stroke="#ef4444" stroke-width="2.5"/>
  <circle cx="60" cy="85" r="4" fill="#ef4444"/>
  <text x="24" y="80" fill="#fca5a5" font-family="sans-serif" font-size="12" font-weight="bold">Vref (逻辑1)</text>
  <text x="16" y="355" fill="#94a3b8" font-family="sans-serif" font-size="11">GND (逻辑0)</text>

  <!-- 4 Bit Branches -->
  <!-- Bit 1 (MSB): R = 10k -->
  <g stroke="#e2e8f0" stroke-width="2" fill="none">
    <line x1="60" y1="110" x2="115" y2="110" stroke="#ef4444"/>
    <circle cx="115" cy="110" r="3" fill="#ef4444" stroke="none"/>
    <line x1="115" y1="110" x2="165" y2="110" stroke="#38bdf8" stroke-width="2.5"/>
    <circle cx="165" cy="110" r="3.5" fill="#38bdf8" stroke="none"/>
    <line x1="165" y1="110" x2="220" y2="110"/>
    <rect x="220" y="98" width="76" height="24" rx="4" fill="#1e293b" stroke="#38bdf8"/>
    <line x1="296" y1="110" x2="385" y2="110"/>
  </g>
  <text x="122" y="100" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">v1 (MSB)</text>
  <text x="232" y="114" fill="#f8fafc" font-family="sans-serif" font-size="11">R = 10kΩ</text>

  <!-- Bit 2: 2R = 20k -->
  <g stroke="#e2e8f0" stroke-width="2" fill="none">
    <line x1="60" y1="175" x2="115" y2="175" stroke="#ef4444"/>
    <circle cx="115" cy="175" r="3" fill="#ef4444" stroke="none"/>
    <line x1="115" y1="175" x2="165" y2="175" stroke="#38bdf8" stroke-width="2.5"/>
    <circle cx="165" cy="175" r="3.5" fill="#38bdf8" stroke="none"/>
    <line x1="165" y1="175" x2="220" y2="175"/>
    <rect x="220" y="163" width="76" height="24" rx="4" fill="#1e293b" stroke="#38bdf8"/>
    <line x1="296" y1="175" x2="385" y2="175"/>
  </g>
  <text x="122" y="165" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">v2</text>
  <text x="228" y="179" fill="#f8fafc" font-family="sans-serif" font-size="11">2R = 20kΩ</text>

  <!-- Bit 3: 4R = 40k -->
  <g stroke="#e2e8f0" stroke-width="2" fill="none">
    <line x1="60" y1="240" x2="115" y2="240" stroke="#ef4444"/>
    <circle cx="115" cy="240" r="3" fill="#ef4444" stroke="none"/>
    <line x1="115" y1="240" x2="165" y2="240" stroke="#38bdf8" stroke-width="2.5"/>
    <circle cx="165" cy="240" r="3.5" fill="#38bdf8" stroke="none"/>
    <line x1="165" y1="240" x2="220" y2="240"/>
    <rect x="220" y="228" width="76" height="24" rx="4" fill="#1e293b" stroke="#38bdf8"/>
    <line x1="296" y1="240" x2="385" y2="240"/>
  </g>
  <text x="122" y="230" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">v3</text>
  <text x="228" y="244" fill="#f8fafc" font-family="sans-serif" font-size="11">4R = 40kΩ</text>

  <!-- Bit 4 (LSB): 8R = 80k -->
  <g stroke="#e2e8f0" stroke-width="2" fill="none">
    <line x1="60" y1="305" x2="115" y2="305" stroke="#ef4444"/>
    <circle cx="115" cy="305" r="3" fill="#ef4444" stroke="none"/>
    <line x1="115" y1="305" x2="165" y2="305" stroke="#38bdf8" stroke-width="2.5"/>
    <circle cx="165" cy="305" r="3.5" fill="#38bdf8" stroke="none"/>
    <line x1="165" y1="305" x2="220" y2="305"/>
    <rect x="220" y="293" width="76" height="24" rx="4" fill="#1e293b" stroke="#38bdf8"/>
    <line x1="296" y1="305" x2="385" y2="305"/>
  </g>
  <text x="122" y="295" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">v4 (LSB)</text>
  <text x="228" y="309" fill="#f8fafc" font-family="sans-serif" font-size="11">8R = 80kΩ</text>

  <!-- Summing Bus (Virtual Ground) -->
  <line x1="385" y1="110" x2="385" y2="305" stroke="#fbbf24" stroke-width="2.5"/>
  <circle cx="385" cy="205" r="5" fill="#fbbf24"/>
  <line x1="385" y1="205" x2="490" y2="205" stroke="#fbbf24" stroke-width="2.5"/>
  <text x="394" y="195" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">虚地节点 v- = 0V</text>

  <!-- Feedback Loop Rf -->
  <line x1="420" y1="205" x2="420" y2="95" stroke="#a78bfa" stroke-width="2"/>
  <line x1="420" y1="95" x2="520" y2="95" stroke="#a78bfa" stroke-width="2"/>
  <rect x="520" y="83" width="84" height="24" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
  <text x="530" y="99" fill="#f8fafc" font-family="sans-serif" font-size="11">Rf = 10kΩ</text>
  <line x1="604" y1="95" x2="675" y2="95" stroke="#a78bfa" stroke-width="2"/>
  <line x1="675" y1="95" x2="675" y2="230" stroke="#a78bfa" stroke-width="2"/>
  <circle cx="675" cy="230" r="4.5" fill="#a78bfa"/>

  <!-- Op-Amp Triangle -->
  <polygon points="490,175 490,285 615,230" fill="#1e293b" stroke="#f8fafc" stroke-width="2.5"/>
  <text x="502" y="211" fill="#fbbf24" font-family="sans-serif" font-size="18" font-weight="bold">−</text>
  <text x="502" y="264" fill="#34d399" font-family="sans-serif" font-size="18" font-weight="bold">+</text>
  <text x="535" y="234" fill="#cbd5e1" font-family="sans-serif" font-size="12" font-weight="bold">OA</text>

  <!-- Dual Power Rails on Op-Amp -->
  <line x1="540" y1="196" x2="540" y2="155" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4,2"/>
  <text x="524" y="148" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="bold">+9V</text>
  <line x1="540" y1="264" x2="540" y2="310" stroke="#60a5fa" stroke-width="1.8" stroke-dasharray="4,2"/>
  <text x="526" y="325" fill="#93c5fd" font-family="sans-serif" font-size="11" font-weight="bold">−9V</text>

  <!-- Non-Inverting Terminal to GND -->
  <line x1="490" y1="255" x2="450" y2="255" stroke="#34d399" stroke-width="2"/>
  <line x1="450" y1="255" x2="450" y2="305" stroke="#34d399" stroke-width="2"/>
  <line x1="436" y1="305" x2="464" y2="305" stroke="#34d399" stroke-width="2.2"/>
  <line x1="441" y1="311" x2="459" y2="311" stroke="#34d399" stroke-width="2"/>
  <line x1="446" y1="317" x2="454" y2="317" stroke="#34d399" stroke-width="1.8"/>

  <!-- Output Vo -->
  <line x1="615" y1="230" x2="735" y2="230" stroke="#34d399" stroke-width="2.5"/>
  <circle cx="735" cy="230" r="4.5" fill="#34d399"/>
  <text x="748" y="235" fill="#34d399" font-family="sans-serif" font-size="16" font-weight="bold">vo</text>
  <text x="640" y="265" fill="#94a3b8" font-family="sans-serif" font-size="11">16 级等距模拟阶梯</text>
  <text x="640" y="282" fill="#94a3b8" font-family="sans-serif" font-size="11">LSB = −(Rf / 8R)·Vref</text>
</svg>`;

export const SHEET_STAIRS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 320" width="820" height="320" role="img" aria-label="4位DAC 16级等距阶梯输出波形图">
  <rect x="0" y="0" width="820" height="320" rx="12" fill="#0f172a"/>
  <text x="24" y="32" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold">4 位 DAC 16 级等距阶梯输出波形（Vref = 1V, R = Rf = 10kΩ）</text>
  <text x="24" y="50" fill="#94a3b8" font-family="sans-serif" font-size="12">每增加 1 LSB，输出精确下降 0.125 V；满量程 −1.875 V 远高于 −9V 负电源轨</text>

  <!-- Axes -->
  <line x1="80" y1="75" x2="770" y2="75" stroke="#64748b" stroke-width="1.8"/>
  <line x1="80" y1="75" x2="80" y2="275" stroke="#64748b" stroke-width="1.8"/>
  <text x="745" y="68" fill="#cbd5e1" font-family="sans-serif" font-size="12">数字码 D</text>
  <text x="20" y="79" fill="#cbd5e1" font-family="sans-serif" font-size="11">0.000V</text>

  <!-- Horizontal Grid Lines -->
  <line x1="80" y1="125" x2="770" y2="125" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4"/>
  <text x="16" y="129" fill="#94a3b8" font-family="sans-serif" font-size="11">−0.500V</text>
  <line x1="80" y1="175" x2="770" y2="175" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4"/>
  <text x="16" y="179" fill="#94a3b8" font-family="sans-serif" font-size="11">−1.000V</text>
  <line x1="80" y1="225" x2="770" y2="225" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4"/>
  <text x="16" y="229" fill="#94a3b8" font-family="sans-serif" font-size="11">−1.500V</text>
  <line x1="80" y1="262.5" x2="770" y2="262.5" stroke="#34d399" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="16" y="266" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">−1.875V</text>

  <!-- 16-Step Staircase (dx = 42px per step, dy = 12.5px per 0.125V) -->
  <polyline fill="none" stroke="#38bdf8" stroke-width="3"
    points="80,75 122,75 122,87.5 164,87.5 164,100 206,100 206,112.5 248,112.5 248,125 290,125 290,137.5 332,137.5 332,150 374,150 374,162.5 416,162.5 416,175 458,175 458,187.5 500,187.5 500,200 542,200 542,212.5 584,212.5 584,225 626,225 626,237.5 668,237.5 668,250 710,250 710,262.5 752,262.5"/>

  <!-- Key Code Markers -->
  <circle cx="101" cy="75" r="4" fill="#fbbf24"/>
  <circle cx="143" cy="87.5" r="4" fill="#fbbf24"/>
  <circle cx="437" cy="175" r="4" fill="#fbbf24"/>
  <circle cx="731" cy="262.5" r="5" fill="#34d399"/>

  <!-- X-axis Labels -->
  <text x="86" y="295" fill="#cbd5e1" font-family="monospace" font-size="11">0000</text>
  <text x="128" y="295" fill="#fbbf24" font-family="monospace" font-size="11">0001</text>
  <text x="254" y="295" fill="#94a3b8" font-family="monospace" font-size="11">0100</text>
  <text x="422" y="295" fill="#fbbf24" font-family="monospace" font-size="11">1000</text>
  <text x="590" y="295" fill="#94a3b8" font-family="monospace" font-size="11">1100</text>
  <text x="714" y="295" fill="#34d399" font-family="monospace" font-size="11" font-weight="bold">1111</text>

  <!-- Annotation Callouts -->
  <rect x="465" y="92" width="285" height="62" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>
  <text x="478" y="112" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">关键指标读数</text>
  <text x="478" y="130" fill="#e2e8f0" font-family="sans-serif" font-size="11">• 1 LSB 步长 = −0.125 V（共 16 级，15 个台阶）</text>
  <text x="478" y="146" fill="#e2e8f0" font-family="sans-serif" font-size="11">• MSB (1000) = −1.000 V | 满量程 (1111) = −1.875 V</text>
</svg>`;

export const SHEET_IA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 420" width="860" height="420" role="img" aria-label="三运放仪表放大器完整拓扑图，标出RG两端虚短电位v1与v2">
  <rect x="0" y="0" width="860" height="420" rx="12" fill="#0f172a"/>
  <text x="24" y="32" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">三运放仪表放大器完整拓扑（Sadiku Fig. 5.42 / Example 5.12）</text>
  <text x="24" y="52" fill="#94a3b8" font-family="sans-serif" font-size="12">前级 (A1, A2)：高阻差分增益级 | 后级 (A3)：精密差分减法级 | 仅调 RG 无级变益</text>

  <!-- Stage Divider -->
  <line x1="415" y1="68" x2="415" y2="395" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,4"/>
  <text x="140" y="78" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">第一级：双同相缓冲 + 单电阻 RG 增益级</text>
  <text x="510" y="78" fill="#a78bfa" font-family="sans-serif" font-size="12" font-weight="bold">第二级：经典四电阻差分放大级 (A3)</text>

  <!-- Op-Amp A1 (Top Left) -->
  <polygon points="150,95 150,175 235,135" fill="#1e293b" stroke="#f8fafc" stroke-width="2.2"/>
  <text x="158" y="122" fill="#34d399" font-family="sans-serif" font-size="16" font-weight="bold">+</text>
  <text x="158" y="162" fill="#fbbf24" font-family="sans-serif" font-size="16" font-weight="bold">−</text>
  <text x="184" y="139" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="bold">A1</text>

  <!-- Input v1 to A1+ -->
  <line x1="65" y1="115" x2="150" y2="115" stroke="#34d399" stroke-width="2.2"/>
  <circle cx="65" cy="115" r="4" fill="#34d399"/>
  <text x="34" y="120" fill="#34d399" font-family="sans-serif" font-size="15" font-weight="bold">v1</text>

  <!-- Op-Amp A2 (Bottom Left) -->
  <polygon points="150,275 150,355 235,315" fill="#1e293b" stroke="#f8fafc" stroke-width="2.2"/>
  <text x="158" y="302" fill="#fbbf24" font-family="sans-serif" font-size="16" font-weight="bold">−</text>
  <text x="158" y="342" fill="#34d399" font-family="sans-serif" font-size="16" font-weight="bold">+</text>
  <text x="184" y="319" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="bold">A2</text>

  <!-- Input v2 to A2+ -->
  <line x1="65" y1="335" x2="150" y2="335" stroke="#34d399" stroke-width="2.2"/>
  <circle cx="65" cy="335" r="4" fill="#34d399"/>
  <text x="34" y="340" fill="#34d399" font-family="sans-serif" font-size="15" font-weight="bold">v2</text>

  <!-- Resistor Chain: vo1 -> R -> (v1-) -> RG -> (v2-) -> R -> vo2 -->
  <!-- A1- node -->
  <line x1="150" y1="155" x2="115" y2="155" stroke="#fbbf24" stroke-width="2"/>
  <line x1="115" y1="155" x2="115" y2="195" stroke="#fbbf24" stroke-width="2"/>
  <line x1="115" y1="195" x2="310" y2="195" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="310" cy="195" r="4.5" fill="#fbbf24"/>
  <text x="180" y="189" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">虚短: v1− = v1</text>

  <!-- A2- node -->
  <line x1="150" y1="295" x2="115" y2="295" stroke="#fbbf24" stroke-width="2"/>
  <line x1="115" y1="295" x2="115" y2="255" stroke="#fbbf24" stroke-width="2"/>
  <line x1="115" y1="255" x2="310" y2="255" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="310" cy="255" r="4.5" fill="#fbbf24"/>
  <text x="180" y="270" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">虚短: v2− = v2</text>

  <!-- Vertical Chain at x=310 -->
  <!-- Top R (between vo1 at y=135 and v1- at y=195) -->
  <line x1="235" y1="135" x2="385" y2="135" stroke="#38bdf8" stroke-width="2.2"/>
  <circle cx="310" cy="135" r="4" fill="#38bdf8"/>
  <line x1="310" y1="135" x2="310" y2="147" stroke="#38bdf8" stroke-width="2"/>
  <rect x="294" y="147" width="32" height="36" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="305" y="169" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="bold">R</text>
  <line x1="310" y1="183" x2="310" y2="195" stroke="#38bdf8" stroke-width="2"/>
  <text x="336" y="127" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">vo1</text>

  <!-- Middle RG (between v1- at y=195 and v2- at y=255) -->
  <line x1="310" y1="195" x2="310" y2="207" stroke="#ef4444" stroke-width="2.5"/>
  <rect x="290" y="207" width="40" height="36" rx="4" fill="#450a0a" stroke="#ef4444" stroke-width="2.2"/>
  <text x="299" y="229" fill="#fca5a5" font-family="sans-serif" font-size="12" font-weight="bold">RG</text>
  <line x1="310" y1="243" x2="310" y2="255" stroke="#ef4444" stroke-width="2.5"/>
  <!-- Current arrow i_RG -->
  <line x1="348" y1="245" x2="348" y2="205" stroke="#f97316" stroke-width="2"/>
  <polygon points="348,200 343,210 353,210" fill="#f97316"/>
  <text x="356" y="229" fill="#fdba74" font-family="sans-serif" font-size="11" font-weight="bold">i = (v2−v1)/RG</text>

  <!-- Bottom R (between v2- at y=255 and vo2 at y=315) -->
  <line x1="235" y1="315" x2="385" y2="315" stroke="#38bdf8" stroke-width="2.2"/>
  <circle cx="310" cy="315" r="4" fill="#38bdf8"/>
  <line x1="310" y1="255" x2="310" y2="267" stroke="#38bdf8" stroke-width="2"/>
  <rect x="294" y="267" width="32" height="36" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="305" y="289" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="bold">R</text>
  <line x1="310" y1="303" x2="310" y2="315" stroke="#38bdf8" stroke-width="2"/>
  <text x="336" y="335" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">vo2</text>

  <!-- Stage 2: Difference Amplifier A3 -->
  <!-- Top R1 from vo1 to A3- -->
  <line x1="385" y1="135" x2="445" y2="135" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="445" y="123" width="56" height="24" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
  <text x="464" y="139" fill="#f8fafc" font-family="sans-serif" font-size="11">R1</text>
  <line x1="501" y1="135" x2="545" y2="135" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="545" y1="135" x2="545" y2="205" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="545" y1="205" x2="590" y2="205" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Feedback R2 around A3 -->
  <circle cx="545" cy="135" r="3.5" fill="#a78bfa"/>
  <line x1="545" y1="135" x2="545" y2="98" stroke="#a78bfa" stroke-width="2"/>
  <line x1="545" y1="98" x2="620" y2="98" stroke="#a78bfa" stroke-width="2"/>
  <rect x="620" y="86" width="56" height="24" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
  <text x="640" y="102" fill="#f8fafc" font-family="sans-serif" font-size="11">R2</text>
  <line x1="676" y1="98" x2="740" y2="98" stroke="#a78bfa" stroke-width="2"/>
  <line x1="740" y1="98" x2="740" y2="225" stroke="#a78bfa" stroke-width="2"/>
  <circle cx="740" cy="225" r="4" fill="#a78bfa"/>

  <!-- Bottom R1 from vo2 to A3+ -->
  <line x1="385" y1="315" x2="445" y2="315" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="445" y="303" width="56" height="24" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
  <text x="464" y="319" fill="#f8fafc" font-family="sans-serif" font-size="11">R1</text>
  <line x1="501" y1="315" x2="545" y2="315" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="545" y1="315" x2="545" y2="245" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="545" y1="245" x2="590" y2="245" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Bottom R2 to GND -->
  <circle cx="545" cy="315" r="3.5" fill="#a78bfa"/>
  <line x1="545" y1="315" x2="545" y2="332" stroke="#a78bfa" stroke-width="2"/>
  <rect x="529" y="332" width="32" height="38" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
  <text x="537" y="355" fill="#f8fafc" font-family="sans-serif" font-size="11">R2</text>
  <line x1="545" y1="370" x2="545" y2="386" stroke="#34d399" stroke-width="2"/>
  <line x1="533" y1="386" x2="557" y2="386" stroke="#34d399" stroke-width="2"/>
  <line x1="538" y1="391" x2="552" y2="391" stroke="#34d399" stroke-width="1.8"/>

  <!-- Op-Amp A3 -->
  <polygon points="590,180 590,270 695,225" fill="#1e293b" stroke="#f8fafc" stroke-width="2.5"/>
  <text x="600" y="211" fill="#fbbf24" font-family="sans-serif" font-size="16" font-weight="bold">−</text>
  <text x="600" y="252" fill="#34d399" font-family="sans-serif" font-size="16" font-weight="bold">+</text>
  <text x="630" y="229" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="bold">A3</text>

  <!-- Final Output vo -->
  <line x1="695" y1="225" x2="795" y2="225" stroke="#34d399" stroke-width="2.5"/>
  <circle cx="795" cy="225" r="4.5" fill="#34d399"/>
  <text x="808" y="230" fill="#34d399" font-family="sans-serif" font-size="16" font-weight="bold">vo</text>
  <text x="612" y="340" fill="#cbd5e1" font-family="sans-serif" font-size="12">vo = (R2/R1)·(1 + 2R/RG)·(v2 − v1)</text>
</svg>`;

export const SHEET_GAIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 300" width="820" height="300" role="img" aria-label="仪表放大器增益Av随外接电阻RG变化双曲线">
  <rect x="0" y="0" width="820" height="300" rx="12" fill="#0f172a"/>
  <text x="24" y="32" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold">仪表放大器增益调节曲线 Av(RG) = (R2/R1)·(1 + 2R/RG)</text>
  <text x="24" y="50" fill="#94a3b8" font-family="sans-serif" font-size="12">Sadiku Example 5.12 参数：R = 25 kΩ, R1 = R2 = 10 kΩ（RG 越小，增益呈双曲线陡增）</text>

  <!-- Axes -->
  <line x1="75" y1="250" x2="770" y2="250" stroke="#64748b" stroke-width="1.8"/>
  <line x1="75" y1="70" x2="75" y2="250" stroke="#64748b" stroke-width="1.8"/>
  <text x="730" y="275" fill="#cbd5e1" font-family="sans-serif" font-size="12">RG (kΩ)</text>
  <text x="24" y="82" fill="#cbd5e1" font-family="sans-serif" font-size="12">Av</text>

  <!-- Horizontal grid -->
  <line x1="75" y1="80" x2="770" y2="80" stroke="#1e293b" stroke-dasharray="4,4"/>
  <text x="44" y="84" fill="#94a3b8" font-family="sans-serif" font-size="11">51</text>
  <line x1="75" y1="163" x2="770" y2="163" stroke="#1e293b" stroke-dasharray="4,4"/>
  <text x="44" y="167" fill="#94a3b8" font-family="sans-serif" font-size="11">26</text>
  <line x1="75" y1="213" x2="770" y2="213" stroke="#1e293b" stroke-dasharray="4,4"/>
  <text x="44" y="217" fill="#94a3b8" font-family="sans-serif" font-size="11">11</text>
  <line x1="75" y1="246" x2="770" y2="246" stroke="#34d399" stroke-dasharray="5,3"/>
  <text x="36" y="250" fill="#34d399" font-family="sans-serif" font-size="10">Av=1</text>

  <!-- Hyperbolic curve: x maps RG in [1, 100] non-linearly/smoothly for visual clarity -->
  <path d="M 95,80 C 125,135 160,175 215,213 C 280,232 390,241 560,244 L 745,245"
        fill="none" stroke="#a78bfa" stroke-width="3"/>

  <!-- Sample Points -->
  <circle cx="95" cy="80" r="5" fill="#ef4444"/>
  <text x="106" y="84" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="bold">RG=1kΩ → Av=51</text>

  <circle cx="148" cy="163" r="4.5" fill="#fbbf24"/>
  <text x="160" y="162" fill="#fde68a" font-family="sans-serif" font-size="11">RG=2kΩ → Av=26</text>

  <circle cx="215" cy="213" r="4.5" fill="#38bdf8"/>
  <text x="226" y="208" fill="#bae6fd" font-family="sans-serif" font-size="11">RG=5kΩ → Av=11</text>

  <circle cx="310" cy="230" r="4.5" fill="#38bdf8"/>
  <text x="315" y="220" fill="#bae6fd" font-family="sans-serif" font-size="11">RG=10kΩ → Av=6</text>

  <circle cx="745" cy="245" r="4.5" fill="#34d399"/>
  <text x="620" y="232" fill="#6ee7b7" font-family="sans-serif" font-size="11">RG=100kΩ → Av=1.5</text>

  <!-- X-axis ticks -->
  <text x="86" y="268" fill="#cbd5e1" font-family="sans-serif" font-size="11">1k</text>
  <text x="140" y="268" fill="#cbd5e1" font-family="sans-serif" font-size="11">2k</text>
  <text x="206" y="268" fill="#cbd5e1" font-family="sans-serif" font-size="11">5k</text>
  <text x="298" y="268" fill="#cbd5e1" font-family="sans-serif" font-size="11">10k</text>
  <text x="545" y="268" fill="#cbd5e1" font-family="sans-serif" font-size="11">50k</text>
  <text x="728" y="268" fill="#cbd5e1" font-family="sans-serif" font-size="11">100k</text>
</svg>`;

export const SHEET_BOUNDARY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 310" width="820" height="310" role="img" aria-label="线性负反馈放大区与开环比较器非线性饱和区边界对比图">
  <rect x="0" y="0" width="820" height="310" rx="12" fill="#0f172a"/>
  <text x="24" y="32" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold">World 3 终极物理边界：线性负反馈放大 vs 开环/正反馈比较器</text>

  <!-- Left Panel: Linear Negative Feedback -->
  <rect x="24" y="52" width="376" height="236" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.8"/>
  <text x="40" y="76" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold">左翼：负反馈线性区（vo → 反相端 −）</text>
  <!-- Axes -->
  <line x1="60" y1="175" x2="365" y2="175" stroke="#64748b" stroke-width="1.5"/>
  <line x1="212" y1="95" x2="212" y2="255" stroke="#64748b" stroke-width="1.5"/>
  <text x="342" y="191" fill="#94a3b8" font-family="sans-serif" font-size="11">vi</text>
  <text x="220" y="106" fill="#94a3b8" font-family="sans-serif" font-size="11">vo</text>
  <!-- Saturation Rails -->
  <line x1="65" y1="115" x2="360" y2="115" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="68" y="110" fill="#fca5a5" font-family="sans-serif" font-size="10">+Vsat (+9V)</text>
  <line x1="65" y1="235" x2="360" y2="235" stroke="#60a5fa" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="68" y="248" fill="#93c5fd" font-family="sans-serif" font-size="10">−Vsat (−9V)</text>
  <!-- Linear Transfer Curve -->
  <polyline fill="none" stroke="#34d399" stroke-width="3" points="70,235 142,235 282,115 355,115"/>
  <text x="148" y="218" fill="#6ee7b7" font-family="sans-serif" font-size="11" font-weight="bold">虚短成立 (v+ = v−)</text>
  <text x="40" y="274" fill="#cbd5e1" font-family="sans-serif" font-size="11">斜率受外接电阻精确控制；仅超轨时削顶</text>

  <!-- Right Panel: Open-Loop Comparator -->
  <rect x="420" y="52" width="376" height="236" rx="8" fill="#1e293b" stroke="#f97316" stroke-width="1.8"/>
  <text x="436" y="76" fill="#fdba74" font-family="sans-serif" font-size="13" font-weight="bold">右翼：开环比较器（无负反馈 / 正反馈）</text>
  <!-- Axes -->
  <line x1="456" y1="175" x2="761" y2="175" stroke="#64748b" stroke-width="1.5"/>
  <line x1="608" y1="95" x2="608" y2="255" stroke="#64748b" stroke-width="1.5"/>
  <text x="720" y="191" fill="#94a3b8" font-family="sans-serif" font-size="11">v+ − v−</text>
  <text x="616" y="106" fill="#94a3b8" font-family="sans-serif" font-size="11">vo</text>
  <!-- Rails -->
  <line x1="461" y1="115" x2="756" y2="115" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="464" y="110" fill="#fca5a5" font-family="sans-serif" font-size="10">+Vsat (+9V)</text>
  <line x1="461" y1="235" x2="756" y2="235" stroke="#60a5fa" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="464" y="248" fill="#93c5fd" font-family="sans-serif" font-size="10">−Vsat (−9V)</text>
  <!-- Step Switch Curve -->
  <polyline fill="none" stroke="#f97316" stroke-width="3" points="466,235 606,235 610,115 751,115"/>
  <text x="620" y="148" fill="#fdba74" font-family="sans-serif" font-size="11" font-weight="bold">虚短失效 (v+ ≠ v−)</text>
  <text x="436" y="274" fill="#cbd5e1" font-family="sans-serif" font-size="11">开环增益 A ≈ 10^5，微伏差即翻转贴轨</text>
</svg>`;

export const SHEET_LAYOUT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 310" width="820" height="310" role="img" aria-label="4位拨码开关DAC面包板物理接线俯视示意图">
  <rect x="0" y="0" width="820" height="310" rx="12" fill="#0f172a"/>
  <text x="24" y="30" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold">3D 面包板实物接线映射图（±9V 双电源 + 4 位 DIP 拨码开关 + TL072）</text>

  <!-- Breadboard Body -->
  <rect x="28" y="48" width="764" height="238" rx="10" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
  <!-- Top Power Rails (+9V red, GND blue) -->
  <line x1="48" y1="68" x2="772" y2="68" stroke="#ef4444" stroke-width="3"/>
  <text x="52" y="63" fill="#b91c1c" font-family="sans-serif" font-size="11" font-weight="bold">+9V 电源轨</text>
  <line x1="48" y1="84" x2="772" y2="84" stroke="#2563eb" stroke-width="3"/>
  <text x="52" y="97" fill="#1d4ed8" font-family="sans-serif" font-size="11" font-weight="bold">GND 公共地轨 (0V)</text>

  <!-- Bottom Power Rails (-9V cyan/blue, Vref orange) -->
  <line x1="48" y1="252" x2="772" y2="252" stroke="#f97316" stroke-width="3"/>
  <text x="52" y="246" fill="#c2410c" font-family="sans-serif" font-size="11" font-weight="bold">Vref 基准轨 (1.000V 基准 / 5.000V 压力测试)</text>
  <line x1="48" y1="268" x2="772" y2="268" stroke="#0284c7" stroke-width="3"/>
  <text x="52" y="281" fill="#0369a1" font-family="sans-serif" font-size="11" font-weight="bold">−9V 负电源轨</text>

  <!-- Center Trench -->
  <rect x="48" y="160" width="724" height="14" fill="#cbd5e1"/>

  <!-- 4-Bit DIP Switch -->
  <rect x="70" y="132" width="132" height="70" rx="5" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>
  <text x="84" y="148" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold">4-BIT DIP SW</text>
  <rect x="82" y="156" width="18" height="32" rx="2" fill="#f8fafc"/>
  <rect x="110" y="156" width="18" height="32" rx="2" fill="#f8fafc"/>
  <rect x="138" y="156" width="18" height="32" rx="2" fill="#f8fafc"/>
  <rect x="166" y="156" width="18" height="32" rx="2" fill="#f8fafc"/>
  <text x="86" y="198" fill="#fef2f2" font-family="monospace" font-size="10">b1 b2 b3 b4</text>

  <!-- Weighted Resistors Array -->
  <g font-family="sans-serif" font-size="10" font-weight="bold">
    <line x1="202" y1="126" x2="255" y2="126" stroke="#334155" stroke-width="2"/>
    <rect x="255" y="116" width="84" height="20" rx="3" fill="#0ea5e9"/>
    <text x="267" y="130" fill="#ffffff">R = 10kΩ</text>
    <line x1="339" y1="126" x2="405" y2="126" stroke="#eab308" stroke-width="2.5"/>

    <line x1="202" y1="152" x2="255" y2="152" stroke="#334155" stroke-width="2"/>
    <rect x="255" y="142" width="84" height="20" rx="3" fill="#0284c7"/>
    <text x="264" y="156" fill="#ffffff">2R = 20kΩ</text>
    <line x1="339" y1="152" x2="405" y2="152" stroke="#eab308" stroke-width="2.5"/>

    <line x1="202" y1="184" x2="255" y2="184" stroke="#334155" stroke-width="2"/>
    <rect x="255" y="174" width="84" height="20" rx="3" fill="#0369a1"/>
    <text x="264" y="188" fill="#ffffff">4R = 40kΩ</text>
    <line x1="339" y1="184" x2="405" y2="184" stroke="#eab308" stroke-width="2.5"/>

    <line x1="202" y1="210" x2="255" y2="210" stroke="#334155" stroke-width="2"/>
    <rect x="255" y="200" width="84" height="20" rx="3" fill="#075985"/>
    <text x="264" y="214" fill="#ffffff">8R = 80kΩ</text>
    <line x1="339" y1="210" x2="405" y2="210" stroke="#eab308" stroke-width="2.5"/>
  </g>

  <!-- Summing Node Bus to Op-Amp Pin 2 -->
  <line x1="405" y1="126" x2="405" y2="210" stroke="#eab308" stroke-width="3"/>
  <line x1="405" y1="145" x2="475" y2="145" stroke="#eab308" stroke-width="2.5"/>
  <text x="410" y="118" fill="#854d0e" font-family="sans-serif" font-size="10" font-weight="bold">虚地汇聚列 (Pin 2)</text>

  <!-- DIP-8 Op-Amp (TL072) across trench -->
  <rect x="475" y="132" width="110" height="70" rx="4" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
  <circle cx="487" cy="188" r="4" fill="#94a3b8"/>
  <text x="505" y="171" fill="#f8fafc" font-family="monospace" font-size="13" font-weight="bold">TL072</text>
  <text x="482" y="128" fill="#334155" font-family="monospace" font-size="9">8(+9V) 7  6  5</text>
  <text x="482" y="214" fill="#334155" font-family="monospace" font-size="9">1(Vo) 2(-) 3(+) 4(-9V)</text>

  <!-- Rf Feedback Resistor -->
  <rect x="490" y="96" width="80" height="20" rx="3" fill="#7c3aed"/>
  <text x="502" y="110" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold">Rf = 10kΩ</text>
  <line x1="490" y1="106" x2="462" y2="106" stroke="#7c3aed" stroke-width="2"/>
  <line x1="462" y1="106" x2="462" y2="145" stroke="#7c3aed" stroke-width="2"/>
  <line x1="570" y1="106" x2="625" y2="106" stroke="#7c3aed" stroke-width="2"/>
  <line x1="625" y1="106" x2="625" y2="195" stroke="#7c3aed" stroke-width="2"/>

  <!-- Virtual DMM Readout Box -->
  <rect x="645" y="124" width="128" height="86" rx="6" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="660" y="144" fill="#94a3b8" font-family="sans-serif" font-size="10" font-weight="bold">虚拟万用表 (DMM)</text>
  <text x="658" y="172" fill="#34d399" font-family="monospace" font-size="18" font-weight="bold">-1.875 V</text>
  <text x="658" y="196" fill="#cbd5e1" font-family="sans-serif" font-size="10">码字: 1111 | Vref=1V</text>
</svg>`;

export const SHEET_MINI1 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='8' fill='#0f172a'/><text x='14' y='24' fill='#34d399' font-size='11' font-family='sans-serif'>v1 = 2.000V → A1− = v1</text><rect x='108' y='34' width='44' height='40' rx='4' fill='#450a0a' stroke='#ef4444' stroke-width='2'/><text x='120' y='58' fill='#fca5a5' font-size='12' font-family='sans-serif'>RG</text><text x='14' y='96' fill='#34d399' font-size='11' font-family='sans-serif'>v2 = 2.050V → A2− = v2</text><text x='162' y='58' fill='#fbbf24' font-size='11' font-family='sans-serif'>Δv = 50mV</text></svg>`;

export const SHEET_MINI2 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='8' fill='#0f172a'/><line x1='60' y1='14' x2='60' y2='96' stroke='#38bdf8' stroke-width='2'/><rect x='46' y='18' width='28' height='20' rx='3' fill='#1e293b' stroke='#38bdf8'/><text x='56' y='32' fill='#f8fafc' font-size='10' font-family='sans-serif'>R</text><rect x='46' y='45' width='28' height='20' rx='3' fill='#450a0a' stroke='#ef4444'/><text x='51' y='59' fill='#fca5a5' font-size='10' font-family='sans-serif'>RG</text><rect x='46' y='72' width='28' height='20' rx='3' fill='#1e293b' stroke='#38bdf8'/><text x='56' y='86' fill='#f8fafc' font-size='10' font-family='sans-serif'>R</text><text x='92' y='48' fill='#fbbf24' font-size='11' font-family='sans-serif'>同一电流 i 流过</text><text x='92' y='68' fill='#38bdf8' font-size='11' font-family='sans-serif'>R + RG + R 串联链</text></svg>`;

export const SHEET_MINI3 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='8' fill='#0f172a'/><rect x='16' y='34' width='92' height='42' rx='6' fill='#1e293b' stroke='#38bdf8' stroke-width='1.8'/><text x='32' y='59' fill='#38bdf8' font-size='12' font-family='sans-serif'>Av1 = ?</text><line x1='108' y1='55' x2='140' y2='55' stroke='#e2e8f0' stroke-width='2'/><rect x='140' y='34' width='104' height='42' rx='6' fill='#1e293b' stroke='#a78bfa' stroke-width='1.8'/><text x='150' y='59' fill='#a78bfa' font-size='11' font-family='sans-serif'>Av2 = R2/R1 = 2</text></svg>`;

export const SHEET_MINI4 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='8' fill='#0f172a'/><text x='20' y='36' fill='#cbd5e1' font-size='12' font-family='sans-serif'>1 + 2(25 kΩ) / RG = 51</text><text x='20' y='64' fill='#fbbf24' font-size='12' font-family='sans-serif'>50 kΩ / RG = 50</text><text x='20' y='90' fill='#34d399' font-size='13' font-family='sans-serif' font-weight='bold'>⇒ RG = 1.0 kΩ (标准 E24 阻值)</text></svg>`;

export const SHEET_MINI5 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='8' fill='#0f172a'/><text x='14' y='26' fill='#38bdf8' font-size='11' font-family='sans-serif'>i = 50mV / 1kΩ = 50 μA</text><text x='14' y='48' fill='#cbd5e1' font-size='11' font-family='sans-serif'>vo1 = 2.000 − 1.250 = 0.750 V</text><text x='14' y='68' fill='#cbd5e1' font-size='11' font-family='sans-serif'>vo2 = 2.050 + 1.250 = 3.300 V</text><text x='14' y='92' fill='#34d399' font-size='12' font-family='sans-serif' font-weight='bold'>vo = 2×(3.300−0.750) = 5.100 V ✓</text></svg>`;
