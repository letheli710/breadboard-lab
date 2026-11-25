// The W5-L6 lesson sheet's inline SVGs (docs/lessons/W5-L6.md), copied as given by a script
// (comments and blank lines dropped). All are drawn for a dark canvas; svgs.ts recolours them
// (lightSvg) and applies the changes listed there.

export const SHEET_ACT1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 320" width="820" height="320" style="background:#0f172a;border-radius:12px;font-family:'PingFang SC','Microsoft YaHei',sans-serif;">
  <defs>
    <linearGradient id="beerLiquid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="beerFoam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <marker id="arrCyan1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrAmber1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
    <marker id="arrEmerald1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399"/>
    </marker>
  </defs>
  <text x="410" y="28" fill="#f8fafc" font-size="16" font-weight="bold" text-anchor="middle">第 1 幕：啤酒杯功率直觉 vs. 滞后 / 超前相量判别</text>
  <rect x="20" y="46" width="265" height="254" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="152" y="70" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">工程直觉：一杯交流电啤酒</text>
  <path d="M 162 128 C 192 128, 192 215, 162 215" fill="none" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
  <rect x="74" y="96" width="88" height="54" rx="6" fill="url(#beerFoam)"/>
  <rect x="74" y="150" width="88" height="106" rx="4" fill="url(#beerLiquid)"/>
  <rect x="70" y="92" width="96" height="168" rx="8" fill="none" stroke="#e2e8f0" stroke-width="3"/>
  <text x="118" y="128" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">泡沫 Q (VAR)</text>
  <text x="118" y="205" fill="#fffbeb" font-size="12" font-weight="bold" text-anchor="middle">酒液 P (W)</text>
  <line x1="54" y1="94" x2="54" y2="258" stroke="#38bdf8" stroke-width="2"/>
  <line x1="48" y1="94" x2="60" y2="94" stroke="#38bdf8" stroke-width="2"/>
  <line x1="48" y1="258" x2="60" y2="258" stroke="#38bdf8" stroke-width="2"/>
  <text x="38" y="176" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle" transform="rotate(-90 38 176)">整杯容量 S (VA)</text>
  <text x="200" y="118" fill="#e2e8f0" font-size="11">建立磁场</text>
  <text x="200" y="134" fill="#94a3b8" font-size="10">不干净活</text>
  <text x="200" y="198" fill="#fbbf24" font-size="11">真正做功</text>
  <text x="200" y="214" fill="#94a3b8" font-size="10">发热/驱动</text>
  <text x="152" y="284" fill="#cbd5e1" font-size="11" text-anchor="middle">pf = P / S = cosθ（含酒量）</text>
  <rect x="300" y="46" width="245" height="254" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="422" y="70" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle">滞后功率因数 (Lagging)</text>
  <text x="422" y="88" fill="#cbd5e1" font-size="11" text-anchor="middle">感性负载 · 电机/电感 · Q &gt; 0</text>
  <line x1="335" y1="175" x2="515" y2="175" stroke="#475569" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="365" y1="115" x2="365" y2="235" stroke="#475569" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="365" y1="175" x2="495" y2="175" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrCyan1)"/>
  <text x="502" y="179" fill="#38bdf8" font-size="12" font-weight="bold">V</text>
  <line x1="365" y1="175" x2="461" y2="232" stroke="#fbbf24" stroke-width="3" marker-end="url(#arrAmber1)"/>
  <text x="468" y="242" fill="#fbbf24" font-size="12" font-weight="bold">I (滞后)</text>
  <path d="M 415 175 A 50 50 0 0 1 405 205" fill="none" stroke="#f43f5e" stroke-width="2"/>
  <text x="422" y="198" fill="#f43f5e" font-size="11" font-weight="bold">θ &gt; 0</text>
  <text x="422" y="268" fill="#fde68a" font-size="11" text-anchor="middle">θ = θ_v - θ_i &gt; 0</text>
  <text x="422" y="286" fill="#94a3b8" font-size="10.5" text-anchor="middle">负载吸收无功功率 (Q &gt; 0)</text>
  <rect x="560" y="46" width="240" height="254" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="680" y="70" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">超前功率因数 (Leading)</text>
  <text x="680" y="88" fill="#cbd5e1" font-size="11" text-anchor="middle">容性负载 · 电容器 · Q &lt; 0</text>
  <line x1="595" y1="175" x2="775" y2="175" stroke="#475569" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="625" y1="115" x2="625" y2="235" stroke="#475569" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="625" y1="175" x2="755" y2="175" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrCyan1)"/>
  <text x="762" y="179" fill="#38bdf8" font-size="12" font-weight="bold">V</text>
  <line x1="625" y1="175" x2="721" y2="118" stroke="#34d399" stroke-width="3" marker-end="url(#arrEmerald1)"/>
  <text x="726" y="114" fill="#34d399" font-size="12" font-weight="bold">I (超前)</text>
  <path d="M 675 175 A 50 50 0 0 0 665 145" fill="none" stroke="#34d399" stroke-width="2"/>
  <text x="682" y="160" fill="#34d399" font-size="11" font-weight="bold">θ &lt; 0</text>
  <text x="680" y="268" fill="#a7f3d0" font-size="11" text-anchor="middle">θ = θ_v - θ_i &lt; 0</text>
  <text x="680" y="286" fill="#94a3b8" font-size="10.5" text-anchor="middle">负载发出无功功率 (Q &lt; 0)</text>
</svg>`;

export const SHEET_ACT2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 330" width="820" height="330" style="background:#0f172a;border-radius:12px;font-family:'PingFang SC','Microsoft YaHei',sans-serif;">
  <defs>
    <marker id="arrP2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrQpos2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
    <marker id="arrQneg2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981"/>
    </marker>
    <marker id="arrS2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e"/>
    </marker>
  </defs>
  <text x="410" y="28" fill="#f8fafc" font-size="16" font-weight="bold" text-anchor="middle">第 2 幕：感性 (滞后) 与容性 (超前) 功率三角形对照</text>
  <rect x="20" y="46" width="380" height="266" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="210" y="70" fill="#fbbf24" font-size="13.5" font-weight="bold" text-anchor="middle">感性负载功率三角形（第一象限 · Lagging）</text>
  <line x1="60" y1="230" x2="365" y2="230" stroke="#475569" stroke-width="1.2"/>
  <line x1="80" y1="90" x2="80" y2="255" stroke="#475569" stroke-width="1.2"/>
  <text x="368" y="234" fill="#94a3b8" font-size="11">+P</text>
  <text x="64" y="96" fill="#94a3b8" font-size="11">+jQ</text>
  <polygon points="80,230 290,230 290,115" fill="#f59e0b" fill-opacity="0.14"/>
  <polyline points="276,230 276,216 290,216" fill="none" stroke="#94a3b8" stroke-width="1.2"/>
  <line x1="80" y1="230" x2="286" y2="230" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrP2)"/>
  <text x="185" y="248" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">P = S·cosθ (W)</text>
  <line x1="290" y1="230" x2="290" y2="119" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrQpos2)"/>
  <text x="300" y="175" fill="#fbbf24" font-size="12" font-weight="bold">+jQ (VAR)</text>
  <text x="300" y="191" fill="#fde68a" font-size="10">吸收感性无功</text>
  <line x1="80" y1="230" x2="286" y2="117" stroke="#f43f5e" stroke-width="3.2" marker-end="url(#arrS2)"/>
  <text x="165" y="160" fill="#fb7185" font-size="12.5" font-weight="bold" transform="rotate(-28.7 165 160)">S = P + jQ (VA)</text>
  <path d="M 135 230 A 55 55 0 0 0 128 204" fill="none" stroke="#f8fafc" stroke-width="1.8"/>
  <text x="143" y="218" fill="#f8fafc" font-size="11.5">θ &gt; 0</text>
  <text x="210" y="282" fill="#cbd5e1" font-size="11" text-anchor="middle">S = V_rms · I_rms* = I_rms² (R + jX_L)，Q &gt; 0</text>
  <text x="210" y="300" fill="#94a3b8" font-size="10.5" text-anchor="middle">与阻抗三角形 Z = R + jX_L 严格相似</text>
  <rect x="420" y="46" width="380" height="266" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="610" y="70" fill="#34d399" font-size="13.5" font-weight="bold" text-anchor="middle">容性负载功率三角形（第四象限 · Leading）</text>
  <line x1="460" y1="125" x2="765" y2="125" stroke="#475569" stroke-width="1.2"/>
  <line x1="480" y1="95" x2="480" y2="255" stroke="#475569" stroke-width="1.2"/>
  <text x="768" y="129" fill="#94a3b8" font-size="11">+P</text>
  <text x="462" y="255" fill="#94a3b8" font-size="11">-jQ</text>
  <polygon points="480,125 690,125 690,235" fill="#10b981" fill-opacity="0.14"/>
  <polyline points="676,125 676,139 690,139" fill="none" stroke="#94a3b8" stroke-width="1.2"/>
  <line x1="480" y1="125" x2="686" y2="125" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrP2)"/>
  <text x="585" y="114" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">P = S·cosθ (W)</text>
  <line x1="690" y1="125" x2="690" y2="231" stroke="#10b981" stroke-width="3" marker-end="url(#arrQneg2)"/>
  <text x="700" y="180" fill="#34d399" font-size="12" font-weight="bold">-j|Q| (VAR)</text>
  <text x="700" y="196" fill="#a7f3d0" font-size="10">发出容性无功</text>
  <line x1="480" y1="125" x2="686" y2="233" stroke="#f43f5e" stroke-width="3.2" marker-end="url(#arrS2)"/>
  <text x="565" y="196" fill="#fb7185" font-size="12.5" font-weight="bold" transform="rotate(27.6 565 196)">S = P - j|Q| (VA)</text>
  <path d="M 535 125 A 55 55 0 0 1 528 150" fill="none" stroke="#f8fafc" stroke-width="1.8"/>
  <text x="542" y="146" fill="#f8fafc" font-size="11.5">θ &lt; 0</text>
  <text x="610" y="282" fill="#cbd5e1" font-size="11" text-anchor="middle">S = V_rms · I_rms* = I_rms² (R - j|X_C|)，Q &lt; 0</text>
  <text x="610" y="300" fill="#94a3b8" font-size="10.5" text-anchor="middle">注意：若忘记对 I 取共轭，第一/四象限将彻底颠倒！</text>
</svg>`;

export const SHEET_ACT3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 340" width="820" height="340" style="background:#0f172a;border-radius:12px;font-family:'PingFang SC','Microsoft YaHei',sans-serif;">
  <defs>
    <marker id="arrL1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
    <marker id="arrL2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrL3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981"/>
    </marker>
    <marker id="arrStot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e"/>
    </marker>
  </defs>
  <text x="410" y="28" fill="#f8fafc" font-size="16" font-weight="bold" text-anchor="middle">第 3 幕：多负载复功率首尾相接矢量合成 (S_total = S1 + S2 + S3)</text>
  <rect x="25" y="46" width="770" height="278" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <line x1="75" y1="204" x2="600" y2="204" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="75" y1="92" x2="520" y2="92" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="585" y1="204" x2="585" y2="260" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="55" y1="260" x2="640" y2="260" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="75" y1="62" x2="75" y2="285" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="646" y="264" fill="#cbd5e1" font-size="12" font-weight="bold">P (kW)</text>
  <text x="58" y="72" fill="#cbd5e1" font-size="12" font-weight="bold">+jQ</text>
  <text x="315" y="276" fill="#94a3b8" font-size="10.5" text-anchor="middle">8</text>
  <text x="495" y="276" fill="#94a3b8" font-size="10.5" text-anchor="middle">14</text>
  <text x="585" y="276" fill="#fb7185" font-size="11" font-weight="bold" text-anchor="middle">17 kW</text>
  <text x="66" y="96" fill="#fbbf24" font-size="10.5" text-anchor="end">+6</text>
  <text x="66" y="208" fill="#fb7185" font-size="10.5" font-weight="bold" text-anchor="end">+2</text>
  <line x1="75" y1="260" x2="311" y2="95" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrL1)"/>
  <text x="172" y="158" fill="#fbbf24" font-size="12" font-weight="bold" transform="rotate(-35 172 158)">S1 = 8 + j6 kVA (感性)</text>
  <line x1="315" y1="92" x2="490" y2="92" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrL2)"/>
  <text x="405" y="82" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">S2 = 6 + j0 kVA (纯阻)</text>
  <line x1="495" y1="92" x2="582" y2="200" stroke="#10b981" stroke-width="3" marker-end="url(#arrL3)"/>
  <text x="556" y="138" fill="#34d399" font-size="12" font-weight="bold">S3 = 3 - j4 kVA</text>
  <text x="556" y="154" fill="#a7f3d0" font-size="10.5">(容性向下抵消 Q)</text>
  <line x1="75" y1="260" x2="580" y2="205" stroke="#f43f5e" stroke-width="3.6" marker-end="url(#arrStot)"/>
  <text x="345" y="246" fill="#fb7185" font-size="13" font-weight="bold" transform="rotate(-6.3 345 246)">S_total = 17 + j2 kVA  (|S| = 17.12 kVA)</text>
  <rect x="615" y="64" width="168" height="118" rx="8" fill="#0f172a" stroke="#f43f5e" stroke-width="1.2"/>
  <text x="699" y="84" fill="#fb7185" font-size="12" font-weight="bold" text-anchor="middle">严禁标量相加！</text>
  <text x="625" y="106" fill="#94a3b8" font-size="10.5">错误：10 + 6 + 5</text>
  <text x="625" y="122" fill="#f87171" font-size="11.5" font-weight="bold">      = 21.00 kVA ✗</text>
  <text x="625" y="146" fill="#94a3b8" font-size="10.5">正确：√(17² + 2²)</text>
  <text x="625" y="164" fill="#34d399" font-size="11.5" font-weight="bold">      = 17.12 kVA ✓</text>
  <text x="410" y="308" fill="#cbd5e1" font-size="11" text-anchor="middle">总功率因数 pf_total = 17 / 17.12 = 0.9932 (滞后)，容性负载 3 抵消了 4 kVAR 感性无功</text>
</svg>`;

export const SHEET_ACT4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 335" width="820" height="335" style="background:#0f172a;border-radius:12px;font-family:'PingFang SC','Microsoft YaHei',sans-serif;">
  <defs>
    <marker id="arrP4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrS1_4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e"/>
    </marker>
    <marker id="arrS2_4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399"/>
    </marker>
    <marker id="arrQc4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7"/>
    </marker>
  </defs>
  <text x="410" y="28" fill="#f8fafc" font-size="16" font-weight="bold" text-anchor="middle">第 4 幕：并联电容功率因数校正——功率三角形压缩对比 (P 不变，Q/S/I 显著下降)</text>
  <rect x="20" y="46" width="510" height="272" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <line x1="55" y1="265" x2="480" y2="265" stroke="#94a3b8" stroke-width="1.4"/>
  <line x1="75" y1="68" x2="75" y2="285" stroke="#94a3b8" stroke-width="1.4"/>
  <text x="486" y="269" fill="#cbd5e1" font-size="11.5" font-weight="bold">+P</text>
  <text x="58" y="76" fill="#cbd5e1" font-size="11.5" font-weight="bold">+jQ</text>
  <polygon points="75,265 395,265 395,85" fill="#f43f5e" fill-opacity="0.12"/>
  <polygon points="75,265 395,265 395,186" fill="#10b981" fill-opacity="0.22"/>
  <line x1="75" y1="265" x2="391" y2="265" stroke="#38bdf8" stroke-width="3.4" marker-end="url(#arrP4)"/>
  <text x="235" y="285" fill="#38bdf8" font-size="12.5" font-weight="bold" text-anchor="middle">有功功率 P = 4.00 kW（校正前后纹丝不动！）</text>
  <line x1="395" y1="265" x2="395" y2="186" stroke="#34d399" stroke-width="3.2"/>
  <text x="405" y="232" fill="#34d399" font-size="11.5" font-weight="bold">Q2 = 1.31 kVAR</text>
  <text x="405" y="247" fill="#a7f3d0" font-size="10">校正后净无功</text>
  <line x1="395" y1="85" x2="395" y2="181" stroke="#a855f7" stroke-width="3.6" marker-end="url(#arrQc4)"/>
  <text x="405" y="130" fill="#c084fc" font-size="12" font-weight="bold">Q_C = 1.69 kVAR</text>
  <text x="405" y="146" fill="#e9d5ff" font-size="10">并联电容向下压缩</text>
  <line x1="75" y1="265" x2="390" y2="88" stroke="#f43f5e" stroke-width="3" stroke-dasharray="7,4" marker-end="url(#arrS1_4)"/>
  <text x="210" y="160" fill="#fb7185" font-size="12" font-weight="bold" transform="rotate(-29.4 210 160)">校正前 S1 = 5.00 kVA (pf=0.80)</text>
  <line x1="75" y1="265" x2="390" y2="187" stroke="#34d399" stroke-width="3.4" marker-end="url(#arrS2_4)"/>
  <text x="235" y="218" fill="#6ee7b7" font-size="12" font-weight="bold" transform="rotate(-13.8 235 218)">校正后 S2 = 4.21 kVA (pf=0.95)</text>
  <path d="M 140 265 A 65 65 0 0 0 132 233" fill="none" stroke="#fb7185" stroke-width="1.8"/>
  <text x="148" y="232" fill="#fb7185" font-size="11">θ1=36.87°</text>
  <path d="M 175 265 A 100 100 0 0 0 172 241" fill="none" stroke="#34d399" stroke-width="1.8"/>
  <text x="182" y="256" fill="#34d399" font-size="11">θ2=18.19°</text>
  <rect x="546" y="46" width="254" height="272" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="673" y="72" fill="#34d399" font-size="13.5" font-weight="bold" text-anchor="middle">工程收益实测对比</text>
  <text x="673" y="90" fill="#94a3b8" font-size="11" text-anchor="middle">4 kW / 120 V / 60 Hz · C = 310.4 µF</text>
  <text x="564" y="122" fill="#cbd5e1" font-size="11.5">校正前线路电流 I1 (pf=0.80)</text>
  <rect x="564" y="130" width="210" height="20" rx="4" fill="#f43f5e"/>
  <text x="768" y="144" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="end">41.67 A</text>
  <text x="564" y="172" fill="#cbd5e1" font-size="11.5">校正后线路电流 I2 (pf=0.95)</text>
  <rect x="564" y="180" width="177" height="20" rx="4" fill="#10b981"/>
  <text x="735" y="194" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="end">35.09 A</text>
  <rect x="564" y="216" width="104" height="44" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="616" y="234" fill="#94a3b8" font-size="10" text-anchor="middle">线路电流降幅</text>
  <text x="616" y="252" fill="#38bdf8" font-size="13.5" font-weight="bold" text-anchor="middle">-15.79%</text>
  <rect x="678" y="216" width="104" height="44" rx="6" fill="#0f172a" stroke="#34d399" stroke-width="1"/>
  <text x="730" y="234" fill="#94a3b8" font-size="10" text-anchor="middle">输电线损降幅</text>
  <text x="730" y="252" fill="#34d399" font-size="13.5" font-weight="bold" text-anchor="middle">-29.09%</text>
  <text x="673" y="286" fill="#fde68a" font-size="11" font-weight="bold" text-anchor="middle">P_loss ∝ I² ∝ 1 / pf²</text>
  <text x="673" y="304" fill="#94a3b8" font-size="10.5" text-anchor="middle">少花电费 + 释放变压器容量！</text>
</svg>`;

export const SHEET_ACT5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 260" width="820" height="260" style="background:#0f172a;border-radius:12px;font-family:'PingFang SC','Microsoft YaHei',sans-serif;">
  <defs>
    <marker id="arrI5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399"/>
    </marker>
    <marker id="arrIL5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
    <marker id="arrIC5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc"/>
    </marker>
  </defs>
  <text x="410" y="28" fill="#f8fafc" font-size="15.5" font-weight="bold" text-anchor="middle">第 5 幕实战电路：工厂 20 kW 感性车间并联电容校正接线图</text>
  <circle cx="95" cy="145" r="28" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
  <path d="M 80 145 Q 87.5 130 95 145 T 110 145" fill="none" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="95" y="196" fill="#38bdf8" font-size="11.5" font-weight="bold" text-anchor="middle">240 V_rms</text>
  <text x="95" y="212" fill="#94a3b8" font-size="10.5" text-anchor="middle">60 Hz 电网</text>
  <line x1="95" y1="117" x2="95" y2="75" stroke="#cbd5e1" stroke-width="2.2"/>
  <line x1="95" y1="75" x2="210" y2="75" stroke="#cbd5e1" stroke-width="2.2"/>
  <polyline points="210,75 218,65 228,85 238,65 248,85 258,65 268,85 276,75" fill="none" stroke="#f43f5e" stroke-width="2.4"/>
  <text x="243" y="58" fill="#fb7185" font-size="11" font-weight="bold" text-anchor="middle">输电线电阻 R_line</text>
  <line x1="276" y1="75" x2="620" y2="75" stroke="#cbd5e1" stroke-width="2.2"/>
  <line x1="95" y1="173" x2="95" y2="225" stroke="#cbd5e1" stroke-width="2.2"/>
  <line x1="95" y1="225" x2="620" y2="225" stroke="#cbd5e1" stroke-width="2.2"/>
  <line x1="130" y1="64" x2="188" y2="64" stroke="#34d399" stroke-width="2.6" marker-end="url(#arrI5)"/>
  <text x="159" y="55" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">I_line: 104.2 → 87.7 A</text>
  <circle cx="430" cy="75" r="4" fill="#c084fc"/>
  <circle cx="430" cy="225" r="4" fill="#c084fc"/>
  <line x1="430" y1="75" x2="430" y2="136" stroke="#c084fc" stroke-width="2.4"/>
  <line x1="406" y1="136" x2="454" y2="136" stroke="#c084fc" stroke-width="3.2"/>
  <line x1="406" y1="152" x2="454" y2="152" stroke="#c084fc" stroke-width="3.2"/>
  <line x1="430" y1="152" x2="430" y2="225" stroke="#c084fc" stroke-width="2.4"/>
  <line x1="444" y1="90" x2="444" y2="122" stroke="#c084fc" stroke-width="2" marker-end="url(#arrIC5)"/>
  <text x="456" y="112" fill="#c084fc" font-size="11" font-weight="bold">I_C</text>
  <text x="372" y="144" fill="#e9d5ff" font-size="11.5" font-weight="bold" text-anchor="end">并联电容 C</text>
  <text x="372" y="160" fill="#c084fc" font-size="10.5" text-anchor="end">388.05 µF</text>
  <text x="372" y="176" fill="#94a3b8" font-size="10" text-anchor="end">Q_C = -8.43 kVAR</text>
  <line x1="620" y1="75" x2="620" y2="105" stroke="#fbbf24" stroke-width="2.4"/>
  <rect x="555" y="105" width="130" height="86" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2.2"/>
  <text x="620" y="132" fill="#fbbf24" font-size="12.5" font-weight="bold" text-anchor="middle">工厂感性负载</text>
  <text x="620" y="152" fill="#f8fafc" font-size="11.5" text-anchor="middle">P = 20 kW (不变)</text>
  <text x="620" y="170" fill="#fde68a" font-size="11" text-anchor="middle">pf1 = 0.80 滞后</text>
  <line x1="620" y1="191" x2="620" y2="225" stroke="#fbbf24" stroke-width="2.4"/>
  <line x1="560" y1="64" x2="606" y2="64" stroke="#fbbf24" stroke-width="2.2" marker-end="url(#arrIL5)"/>
  <text x="583" y="55" fill="#fbbf24" font-size="10.5" font-weight="bold" text-anchor="middle">I_L 不变</text>
  <rect x="705" y="88" width="98" height="118" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.2"/>
  <text x="754" y="110" fill="#34d399" font-size="11.5" font-weight="bold" text-anchor="middle">就地循环</text>
  <text x="754" y="132" fill="#cbd5e1" font-size="10" text-anchor="middle">无功电流在</text>
  <text x="754" y="148" fill="#cbd5e1" font-size="10" text-anchor="middle">C 与负载间</text>
  <text x="754" y="164" fill="#cbd5e1" font-size="10" text-anchor="middle">闭环吞吐，</text>
  <text x="754" y="180" fill="#6ee7b7" font-size="10" font-weight="bold" text-anchor="middle">不走输电线！</text>
</svg>`;

export const SHEET_MINI1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 120" width="260" height="120" style="background:#0f172a;border-radius:8px;font-family:sans-serif;"><polygon points="30,98 200,98 200,26" fill="#f59e0b" fill-opacity="0.18" stroke="#f59e0b" stroke-width="2"/><line x1="30" y1="98" x2="200" y2="98" stroke="#38bdf8" stroke-width="2.5"/><text x="115" y="113" fill="#38bdf8" font-size="11" text-anchor="middle">P = 20 kW</text><text x="208" y="66" fill="#fbbf24" font-size="11">Q1 = ?</text><text x="82" y="90" fill="#f8fafc" font-size="10">θ1=36.87°</text></svg>`;

export const SHEET_MINI2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 120" width="260" height="120" style="background:#0f172a;border-radius:8px;font-family:sans-serif;"><polygon points="30,98 200,98 200,26" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,3"/><polygon points="30,98 200,98 200,66" fill="#10b981" fill-opacity="0.22" stroke="#34d399" stroke-width="2"/><text x="115" y="113" fill="#38bdf8" font-size="11" text-anchor="middle">P = 20 kW (不变)</text><text x="206" y="86" fill="#34d399" font-size="11">Q2 = ?</text><text x="88" y="93" fill="#f8fafc" font-size="10">θ2=18.19°</text></svg>`;

export const SHEET_MINI3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 120" width="260" height="120" style="background:#0f172a;border-radius:8px;font-family:sans-serif;"><line x1="30" y1="98" x2="195" y2="98" stroke="#38bdf8" stroke-width="2"/><line x1="195" y1="98" x2="195" y2="66" stroke="#34d399" stroke-width="2.5"/><line x1="195" y1="24" x2="195" y2="62" stroke="#a855f7" stroke-width="3"/><polygon points="191,58 199,58 195,66" fill="#a855f7"/><text x="204" y="48" fill="#c084fc" font-size="11" font-weight="bold">Q_C</text><text x="110" y="52" fill="#cbd5e1" font-size="10.5" text-anchor="middle">Q_C = Q1 - Q2</text></svg>`;

export const SHEET_MINI4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 120" width="260" height="120" style="background:#0f172a;border-radius:8px;font-family:sans-serif;"><line x1="50" y1="60" x2="112" y2="60" stroke="#c084fc" stroke-width="2.5"/><line x1="112" y1="36" x2="112" y2="84" stroke="#c084fc" stroke-width="3.5"/><line x1="126" y1="36" x2="126" y2="84" stroke="#c084fc" stroke-width="3.5"/><line x1="126" y1="60" x2="190" y2="60" stroke="#c084fc" stroke-width="2.5"/><text x="130" y="24" fill="#e9d5ff" font-size="11" text-anchor="middle">C = Q_C / (ω · V_rms²)</text><text x="130" y="106" fill="#94a3b8" font-size="10.5" text-anchor="middle">ω = 2π·60 ≈ 376.99 rad/s</text></svg>`;

export const SHEET_MINI5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 120" width="260" height="120" style="background:#0f172a;border-radius:8px;font-family:sans-serif;"><text x="16" y="28" fill="#fb7185" font-size="10.5">I1 (pf=0.80)</text><rect x="16" y="34" width="210" height="16" rx="3" fill="#f43f5e"/><text x="220" y="46" fill="#fff" font-size="10" text-anchor="end">104.17 A</text><text x="16" y="72" fill="#34d399" font-size="10.5">I2 (pf=0.95)</text><rect x="16" y="78" width="177" height="16" rx="3" fill="#10b981"/><text x="188" y="90" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="end">87.72 A</text><text x="130" y="112" fill="#fde68a" font-size="10.5" text-anchor="middle">线损降幅 = 29.09%</text></svg>`;
