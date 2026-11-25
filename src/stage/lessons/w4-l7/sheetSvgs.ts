// The lesson sheet's inline SVGs (docs/lessons/W4-L7.md), reproduced as given (comments dropped).
// Changes: SVG_BENCH names the 5 V rail's source (the bench supply), and its critical mark is the
// loop's total R (the pot itself reads 200 Ω − R_L there), and its scope trace is v_C(t) at R = 40 Ω
// computed point by point (the sheet's smooth "T" curve grew instead of decaying). The two figures
// that are half light, half dark are split (…_LIGHT / …_DARK) so only the dark half goes through lightSvg.

/** act 1 · 串联 vs 并联对偶原理图（浅色底，原样） */
export const SVG_DUAL = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 330" width="760" height="330" role="img" aria-label="串联与并联无源RLC电路对偶原理图">
  <defs>
    <marker id="arrowBlue1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
    <marker id="arrowOrange1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ea580c"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="330" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="380" y="28" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0f172a">无源串联 RLC vs. 并联 RLC 对偶结构与阻尼系数对比</text>
  <rect x="20" y="45" width="350" height="265" rx="10" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="195" y="68" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1d4ed8">A. 无源串联 RLC（Section 8.3 · KVL 回路）</text>
  <line x1="70" y1="105" x2="115" y2="105" stroke="#334155" stroke-width="2.2"/>
  <polyline points="115,105 122,95 132,115 142,95 152,115 162,95 170,105" fill="none" stroke="#dc2626" stroke-width="2.4"/>
  <text x="142" y="88" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#dc2626">R</text>
  <line x1="170" y1="105" x2="210" y2="105" stroke="#334155" stroke-width="2.2"/>
  <path d="M 210 105 Q 220 85 230 105 Q 240 85 250 105 Q 260 85 270 105 Q 280 85 290 105" fill="none" stroke="#0284c7" stroke-width="2.4"/>
  <text x="250" y="86" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0284c7">L</text>
  <line x1="290" y1="105" x2="325" y2="105" stroke="#334155" stroke-width="2.2"/>
  <line x1="325" y1="105" x2="325" y2="145" stroke="#334155" stroke-width="2.2"/>
  <line x1="305" y1="145" x2="345" y2="145" stroke="#059669" stroke-width="3"/>
  <line x1="305" y1="158" x2="345" y2="158" stroke="#059669" stroke-width="3"/>
  <text x="355" y="156" font-family="sans-serif" font-size="13" font-weight="bold" fill="#059669">C</text>
  <text x="292" y="142" font-family="sans-serif" font-size="12" fill="#059669">+</text>
  <text x="292" y="170" font-family="sans-serif" font-size="12" fill="#059669">-</text>
  <text x="275" y="157" font-family="sans-serif" font-size="12" fill="#059669">v_C</text>
  <line x1="325" y1="158" x2="325" y2="195" stroke="#334155" stroke-width="2.2"/>
  <line x1="325" y1="195" x2="70" y2="195" stroke="#334155" stroke-width="2.2"/>
  <line x1="70" y1="195" x2="70" y2="105" stroke="#334155" stroke-width="2.2"/>
  <path d="M 120 175 A 55 24 0 1 1 230 175" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#arrowBlue1)"/>
  <text x="175" y="162" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#2563eb">i(t)</text>
  <rect x="36" y="212" width="318" height="84" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
  <text x="48" y="232" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1e3a8a">尼珀频率：α = R / (2L)   |   R_crit = 2√(L/C)</text>
  <text x="48" y="252" font-family="sans-serif" font-size="12" fill="#334155">• R 越大 → α 越大 → 阻尼越强（P_R = i²R 耗能加剧）</text>
  <text x="48" y="270" font-family="sans-serif" font-size="12" fill="#334155">• R → 0（短路）：无损 LC 持续等幅振荡</text>
  <text x="48" y="288" font-family="sans-serif" font-size="12" fill="#1d4ed8">• 临界判据：R &gt; 2√(L/C) 为过阻尼</text>
  <rect x="390" y="45" width="350" height="265" rx="10" fill="#ffffff" stroke="#fdba74" stroke-width="1.5"/>
  <text x="565" y="68" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#c2410c">B. 无源并联 RLC（Section 8.4 · KCL 节点）</text>
  <line x1="440" y1="98" x2="690" y2="98" stroke="#334155" stroke-width="2.4"/>
  <line x1="440" y1="195" x2="690" y2="195" stroke="#334155" stroke-width="2.4"/>
  <circle cx="565" cy="98" r="4" fill="#ea580c"/>
  <text x="424" y="102" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ea580c">+</text>
  <text x="415" y="150" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ea580c">v(t)</text>
  <text x="424" y="198" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ea580c">-</text>
  <line x1="470" y1="98" x2="470" y2="120" stroke="#334155" stroke-width="2"/>
  <polyline points="470,120 460,126 480,134 460,142 480,150 460,158 470,164" fill="none" stroke="#dc2626" stroke-width="2.4"/>
  <line x1="470" y1="164" x2="470" y2="195" stroke="#334155" stroke-width="2"/>
  <text x="488" y="148" font-family="sans-serif" font-size="13" font-weight="bold" fill="#dc2626">R</text>
  <line x1="452" y1="104" x2="452" y2="119" stroke="#ea580c" stroke-width="1.6" marker-end="url(#arrowOrange1)"/>
  <line x1="565" y1="98" x2="565" y2="118" stroke="#334155" stroke-width="2"/>
  <path d="M 565 118 Q 582 125 565 133 Q 582 141 565 149 Q 582 157 565 165" fill="none" stroke="#0284c7" stroke-width="2.4"/>
  <line x1="565" y1="165" x2="565" y2="195" stroke="#334155" stroke-width="2"/>
  <text x="586" y="148" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0284c7">L</text>
  <line x1="548" y1="104" x2="548" y2="119" stroke="#ea580c" stroke-width="1.6" marker-end="url(#arrowOrange1)"/>
  <line x1="660" y1="98" x2="660" y2="138" stroke="#334155" stroke-width="2"/>
  <line x1="642" y1="138" x2="678" y2="138" stroke="#059669" stroke-width="3"/>
  <line x1="642" y1="150" x2="678" y2="150" stroke="#059669" stroke-width="3"/>
  <line x1="660" y1="150" x2="660" y2="195" stroke="#334155" stroke-width="2"/>
  <text x="684" y="148" font-family="sans-serif" font-size="13" font-weight="bold" fill="#059669">C</text>
  <line x1="642" y1="104" x2="642" y2="119" stroke="#ea580c" stroke-width="1.6" marker-end="url(#arrowOrange1)"/>
  <rect x="406" y="212" width="318" height="84" rx="8" fill="#fff7ed" stroke="#fed7aa" stroke-width="1"/>
  <text x="418" y="232" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#9a3412">尼珀频率：α = 1 / (2RC)   |   R_crit = ½√(L/C)</text>
  <text x="418" y="252" font-family="sans-serif" font-size="12" fill="#334155">• R 越大 → α 越小 → 阻尼越弱（P_R = v²/R 分流耗能越少！）</text>
  <text x="418" y="270" font-family="sans-serif" font-size="12" fill="#334155">• R → ∞（开路）：无损 LC 槽路持续等幅振荡</text>
  <text x="418" y="288" font-family="sans-serif" font-size="12" fill="#c2410c">• 临界判据：R &gt; ½√(L/C) 反而为欠阻尼！</text>
</svg>`;

/** act 2 · 三态同屏对比（深色底，index.ts 里经 lightSvg） */
export const SVG_COMPARE = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 365" width="740" height="365" role="img" aria-label="过阻尼临界阻尼欠阻尼三曲线同屏精确对比图">
  <rect x="0" y="0" width="740" height="365" rx="12" fill="#0f172a"/>
  <text x="370" y="28" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#f8fafc">实时示波器阻尼波形同屏对比（ω₀ = 10 rad/s, v_C(0) = 12 V, i(0) = 0 A）</text>
  <rect x="75" y="55" width="610" height="260" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
  <line x1="75" y1="76.7" x2="685" y2="76.7" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="75" y1="141.7" x2="685" y2="141.7" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="75" y1="206.7" x2="685" y2="206.7" stroke="#94a3b8" stroke-width="1.6"/>
  <line x1="75" y1="271.7" x2="685" y2="271.7" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="197" y1="55" x2="197" y2="315" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="319" y1="55" x2="319" y2="315" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="441" y1="55" x2="441" y2="315" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="563" y1="55" x2="563" y2="315" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <text x="66" y="81" text-anchor="end" font-family="monospace" font-size="11" fill="#cbd5e1">+12V</text>
  <text x="66" y="146" text-anchor="end" font-family="monospace" font-size="11" fill="#cbd5e1">+6V</text>
  <text x="66" y="211" text-anchor="end" font-family="monospace" font-size="11" font-weight="bold" fill="#f8fafc">0V</text>
  <text x="66" y="276" text-anchor="end" font-family="monospace" font-size="11" fill="#cbd5e1">-6V</text>
  <text x="75" y="334" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">0.0s</text>
  <text x="197" y="334" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">0.3s</text>
  <text x="319" y="334" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">0.6s</text>
  <text x="441" y="334" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">0.9s</text>
  <text x="563" y="334" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">1.2s</text>
  <text x="685" y="334" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">1.5s</text>
  <text x="380" y="354" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#94a3b8">时间 t (s)</text>
  <polyline points="75.0,74.0 95.3,86.6 115.7,98.0 136.0,108.4 156.3,117.7 176.7,126.2 197.0,133.8 217.3,140.8 237.7,147.0 258.0,152.7 278.3,157.9 298.7,162.5 319.0,166.7 339.3,170.5 359.7,173.9 380.0,177.1 400.3,179.9 420.7,182.4 441.0,184.7 461.3,186.8 481.7,188.7 502.0,190.4 522.3,192.0 542.7,193.4 563.0,194.6 583.3,195.8 603.7,196.8 624.0,197.7 644.3,198.6 664.7,199.4 685.0,200.1" fill="none" stroke="#60a5fa" stroke-width="1.4" stroke-dasharray="6,4" opacity="0.8"/>
  <polyline points="136.0,305.0 156.3,295.6 176.7,287.1 197.0,279.5 217.3,272.6 237.7,266.3 258.0,260.6 278.3,255.5 298.7,250.8 319.0,246.6 339.3,242.8 359.7,239.4 380.0,236.3 400.3,233.5 420.7,230.9 441.0,228.6 461.3,226.5 481.7,224.6 502.0,222.9 522.3,221.4 542.7,220.0 563.0,218.7 583.3,217.6 603.7,216.5 624.0,215.6 644.3,214.7 664.7,214.0 685.0,213.3" fill="none" stroke="#60a5fa" stroke-width="1.4" stroke-dasharray="6,4" opacity="0.8"/>
  <polyline points="75.0,76.7 87.2,81.1 99.4,90.3 111.6,100.8 123.8,111.4 136.0,121.3 148.2,130.3 160.4,138.5 172.6,145.9 184.8,152.4 197.0,158.3 209.2,163.5 221.4,168.2 233.6,172.4 245.8,176.1 258.0,179.4 270.2,182.3 282.4,185.0 294.6,187.3 306.8,189.4 319.0,191.3 331.2,192.9 343.4,194.4 355.6,195.8 367.8,196.9 380.0,198.0 392.2,198.9 404.4,199.8 416.6,200.5 428.8,201.2 441.0,201.8 453.2,202.3 465.4,202.8 477.6,203.2 489.8,203.6 502.0,203.9 514.2,204.2 526.4,204.5 538.6,204.7 550.8,204.9 563.0,205.1 575.2,205.3 587.4,205.4 599.6,205.6 611.8,205.7 624.0,205.8 636.2,205.9 648.4,206.0 660.6,206.0 672.8,206.1 685.0,206.2" fill="none" stroke="#f87171" stroke-width="2.6"/>
  <polyline points="75.0,76.7 87.2,81.5 99.4,92.5 111.6,106.2 123.8,120.5 136.0,134.1 148.2,146.5 160.4,157.3 172.6,166.6 184.8,174.3 197.0,180.8 209.2,186.0 221.4,190.3 233.6,193.8 245.8,196.5 258.0,198.7 270.2,200.5 282.4,201.8 294.6,202.9 306.8,203.8 319.0,204.4 331.2,204.9 343.4,205.3 355.6,205.6 367.8,205.9 380.0,206.1 392.2,206.2 404.4,206.3 416.6,206.4 428.8,206.5 441.0,206.5 453.2,206.5 465.4,206.6 477.6,206.6 489.8,206.6 502.0,206.6 514.2,206.6 526.4,206.6 538.6,206.6 550.8,206.7 563.0,206.7 575.2,206.7 587.4,206.7 599.6,206.7 611.8,206.7 624.0,206.7 636.2,206.7 648.4,206.7 660.6,206.7 672.8,206.7 685.0,206.7" fill="none" stroke="#34d399" stroke-width="2.8"/>
  <polyline points="75.0,76.7 83.1,79.2 91.3,86.4 99.4,97.7 107.5,112.2 115.7,129.3 123.8,148.0 131.9,167.6 140.1,187.1 148.2,205.9 156.3,223.2 164.5,238.6 172.6,251.6 180.7,261.9 188.9,269.2 197.0,273.6 205.1,275.1 213.3,273.9 221.4,270.2 229.5,264.3 237.7,256.7 245.8,247.7 253.9,237.9 262.1,227.6 270.2,217.3 278.3,207.4 286.5,198.2 294.6,190.1 302.7,183.2 310.9,177.7 319.0,173.8 327.1,171.5 335.3,170.6 343.4,171.2 351.5,173.2 359.7,176.2 367.8,180.2 375.9,184.9 384.1,190.1 392.2,195.5 400.3,200.9 408.5,206.1 416.6,211.0 424.7,215.3 432.9,218.9 441.0,221.8 449.1,223.9 457.3,225.2 465.4,225.6 473.5,225.4 481.7,224.4 489.8,222.8 497.9,220.7 506.1,218.2 514.2,215.5 522.3,212.7 530.5,209.8 538.6,207.0 546.7,204.5 554.9,202.2 563.0,200.3 571.1,198.7 579.3,197.6 587.4,196.9 595.5,196.7 603.7,196.8 611.8,197.3 619.9,198.2 628.1,199.2 636.2,200.5 644.3,202.0 652.5,203.5 660.6,205.0 668.7,206.4 676.9,207.8 685.0,209.0" fill="none" stroke="#38bdf8" stroke-width="2.6"/>
  <circle cx="205.4" cy="275.1" r="4.5" fill="#38bdf8" stroke="#f8fafc" stroke-width="1.5"/>
  <text x="215" y="294" font-family="sans-serif" font-size="11.5" fill="#7dd3fc">首负峰过冲: t = 0.32s, v = -6.32V</text>
  <text x="415" y="160" font-family="sans-serif" font-size="11.5" fill="#93c5fd">包络线 +M·e^(-αt)</text>
  <text x="450" y="252" font-family="sans-serif" font-size="11.5" fill="#93c5fd">包络线 -M·e^(-αt)</text>
  <rect x="455" y="64" width="220" height="84" rx="6" fill="#0f172a" fill-opacity="0.88" stroke="#475569" stroke-width="1"/>
  <line x1="468" y1="82" x2="495" y2="82" stroke="#f87171" stroke-width="2.6"/>
  <text x="503" y="86" font-family="sans-serif" font-size="11.5" fill="#fca5a5">过阻尼 (α=15 &gt; ω₀, 慢拖尾)</text>
  <line x1="468" y1="104" x2="495" y2="104" stroke="#34d399" stroke-width="2.8"/>
  <text x="503" y="108" font-family="sans-serif" font-size="11.5" fill="#6ee7b7">临界阻尼 (α=10 = ω₀, 最快无超调)</text>
  <line x1="468" y1="126" x2="495" y2="126" stroke="#38bdf8" stroke-width="2.6"/>
  <text x="503" y="130" font-family="sans-serif" font-size="11.5" fill="#7dd3fc">欠阻尼 (α=2 &lt; ω₀, 衰减振荡)</text>
</svg>`;

/** act 3 · s 平面极点轨迹（浅色底，原样） */
export const SVG_SPLANE = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 340" width="740" height="340" role="img" aria-label="复平面s极点随阻尼系数变化的根轨迹图">
  <defs>
    <marker id="axisArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569"/>
    </marker>
    <marker id="locusArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7"/>
    </marker>
    <marker id="splitArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="740" height="340" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="370" y="26" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a">复平面 s 极点轨迹图（固定 ω₀ = 10 rad/s，α 从 0 增大至 ∞）</text>
  <rect x="45" y="42" width="495" height="270" fill="#f1f5f9" rx="4"/>
  <text x="65" y="62" font-family="sans-serif" font-size="12" font-weight="bold" fill="#64748b">左半平面 LHP（稳定衰减区 Re(s) &lt; 0）</text>
  <line x1="45" y1="175" x2="675" y2="175" stroke="#475569" stroke-width="1.8" marker-end="url(#axisArr)"/>
  <text x="684" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">Re(s) = σ</text>
  <line x1="540" y1="315" x2="540" y2="42" stroke="#475569" stroke-width="1.8" marker-end="url(#axisArr)"/>
  <text x="550" y="54" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">Im(s) = jω</text>
  <line x1="480" y1="170" x2="480" y2="180" stroke="#475569" stroke-width="1.4"/>
  <text x="480" y="196" text-anchor="middle" font-family="monospace" font-size="11" fill="#334155">-5</text>
  <line x1="420" y1="170" x2="420" y2="180" stroke="#475569" stroke-width="1.4"/>
  <text x="420" y="196" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#059669">-10</text>
  <line x1="300" y1="170" x2="300" y2="180" stroke="#475569" stroke-width="1.4"/>
  <text x="300" y="196" text-anchor="middle" font-family="monospace" font-size="11" fill="#334155">-20</text>
  <line x1="535" y1="55" x2="545" y2="55" stroke="#475569" stroke-width="1.4"/>
  <text x="552" y="59" font-family="monospace" font-size="11" fill="#334155">+j10</text>
  <line x1="535" y1="295" x2="545" y2="295" stroke="#475569" stroke-width="1.4"/>
  <text x="552" y="299" font-family="monospace" font-size="11" fill="#334155">-j10</text>
  <path d="M 540 55 A 120 120 0 0 0 420 175" fill="none" stroke="#0284c7" stroke-width="2.6" stroke-dasharray="6,3" marker-end="url(#locusArr)"/>
  <path d="M 540 295 A 120 120 0 0 1 420 175" fill="none" stroke="#0284c7" stroke-width="2.6" stroke-dasharray="6,3" marker-end="url(#locusArr)"/>
  <line x1="414" y1="175" x2="215" y2="175" stroke="#dc2626" stroke-width="3" marker-end="url(#splitArr)"/>
  <line x1="426" y1="175" x2="525" y2="175" stroke="#dc2626" stroke-width="3" marker-end="url(#splitArr)"/>
  <line x1="540" y1="175" x2="468" y2="79" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,3"/>
  <text x="512" y="122" font-family="sans-serif" font-size="11" fill="#475569">半径 ω₀=10</text>
  <g stroke="#0284c7" stroke-width="2.8">
    <line x1="462" y1="73" x2="474" y2="85"/>
    <line x1="474" y1="73" x2="462" y2="85"/>
    <line x1="462" y1="265" x2="474" y2="277"/>
    <line x1="474" y1="265" x2="462" y2="277"/>
  </g>
  <text x="454" y="75" text-anchor="end" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0369a1">欠阻尼 (-6 + j8)</text>
  <text x="454" y="280" text-anchor="end" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0369a1">欠阻尼 (-6 - j8)</text>
  <circle cx="420" cy="175" r="7" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
  <text x="415" y="155" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="bold" fill="#047857">临界重根 (-10, 0)</text>
  <g stroke="#dc2626" stroke-width="2.8">
    <line x1="474" y1="169" x2="486" y2="181"/>
    <line x1="486" y1="169" x2="474" y2="181"/>
    <line x1="294" y1="169" x2="306" y2="181"/>
    <line x1="306" y1="169" x2="294" y2="181"/>
  </g>
  <text x="480" y="220" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#b91c1c">慢主导极点 s₁=-5</text>
  <text x="480" y="235" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#991b1b">(向右逼近虚轴→拖尾变慢!)</text>
  <text x="300" y="158" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#b91c1c">快极点 s₂=-20</text>
  <text x="300" y="143" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#991b1b">(迅速衰减消失)</text>
  <circle cx="540" cy="55" r="4.5" fill="#f59e0b"/>
  <circle cx="540" cy="295" r="4.5" fill="#f59e0b"/>
  <text x="585" y="88" font-family="sans-serif" font-size="11.5" fill="#b45309">α = 0（无阻尼）</text>
  <text x="585" y="104" font-family="sans-serif" font-size="11" fill="#78350f">极点落在虚轴 ±jω₀</text>
</svg>`;

/** act 4 · 例题 1 原理图与 i(t)（左半浅色；右半深色绘图区单独经 lightSvg） */
export const SVG_EX1_LIGHT = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 295" width="740" height="295" role="img" aria-label="Sadiku 8.3 串联RLC切换电阻原理图与电流波形对比">
  <rect x="0" y="0" width="740" height="295" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="370" y="26" text-anchor="middle" font-family="sans-serif" font-size="14.5" font-weight="bold" fill="#0f172a">例题 1（Sadiku 8.3）：三位开关切换 R 遍历三种阻尼 &amp; 回路电流 i(t) 对比</text>
  <rect x="20" y="42" width="320" height="235" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="180" y="64" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1e293b">L = 0.5 H, C = 0.02 F, v_C(0) = 12 V, i(0) = 0</text>
  <line x1="55" y1="140" x2="88" y2="140" stroke="#334155" stroke-width="2.2"/>
  <circle cx="88" cy="140" r="3.5" fill="#0f172a"/>
  <line x1="88" y1="140" x2="122" y2="108" stroke="#dc2626" stroke-width="2.6"/>
  <circle cx="126" cy="105" r="3" fill="#dc2626"/>
  <circle cx="126" cy="140" r="3" fill="#059669"/>
  <circle cx="126" cy="175" r="3" fill="#0284c7"/>
  <text x="142" y="109" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#dc2626">① 12.5 Ω (过阻尼)</text>
  <text x="142" y="144" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#059669">② 10.0 Ω (临界)</text>
  <text x="142" y="179" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0284c7">③ 6.0 Ω (欠阻尼)</text>
  <line x1="255" y1="105" x2="255" y2="175" stroke="#334155" stroke-width="2"/>
  <line x1="255" y1="140" x2="295" y2="140" stroke="#334155" stroke-width="2.2"/>
  <line x1="295" y1="140" x2="295" y2="235" stroke="#334155" stroke-width="2.2"/>
  <line x1="55" y1="140" x2="55" y2="235" stroke="#334155" stroke-width="2.2"/>
  <line x1="55" y1="235" x2="95" y2="235" stroke="#334155" stroke-width="2.2"/>
  <path d="M 95 235 Q 105 217 115 235 Q 125 217 135 235 Q 145 217 155 235" fill="none" stroke="#0284c7" stroke-width="2.4"/>
  <text x="125" y="256" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0284c7">L = 0.5 H</text>
  <line x1="155" y1="235" x2="205" y2="235" stroke="#334155" stroke-width="2.2"/>
  <line x1="205" y1="218" x2="205" y2="252" stroke="#059669" stroke-width="3"/>
  <line x1="217" y1="218" x2="217" y2="252" stroke="#059669" stroke-width="3"/>
  <text x="211" y="268" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#059669">C = 0.02 F</text>
  <line x1="217" y1="235" x2="295" y2="235" stroke="#334155" stroke-width="2.2"/>
`;
export const SVG_EX1_DARK = String.raw`<rect x="355" y="42" width="365" height="235" rx="8" fill="#0f172a"/>
  <text x="537" y="62" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0">精确仿真回路电流 i(t) = C·dv_C/dt（单位：A）</text>
  <rect x="390" y="70" width="300" height="175" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <line x1="390" y1="112.1" x2="690" y2="112.1" stroke="#94a3b8" stroke-width="1.4"/>
  <line x1="390" y1="169.3" x2="690" y2="169.3" stroke="#334155" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="390" y1="226.4" x2="690" y2="226.4" stroke="#334155" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="384" y="116" text-anchor="end" font-family="monospace" font-size="10.5" fill="#f8fafc">0A</text>
  <text x="384" y="173" text-anchor="end" font-family="monospace" font-size="10.5" fill="#cbd5e1">-1A</text>
  <text x="384" y="230" text-anchor="end" font-family="monospace" font-size="10.5" fill="#cbd5e1">-2A</text>
  <text x="390" y="260" text-anchor="middle" font-family="monospace" font-size="10" fill="#cbd5e1">0s</text>
  <text x="540" y="260" text-anchor="middle" font-family="monospace" font-size="10" fill="#cbd5e1">0.4s</text>
  <text x="690" y="260" text-anchor="middle" font-family="monospace" font-size="10" fill="#cbd5e1">0.8s</text>
  <polyline points="390.0,112.1 397.5,133.6 405.0,145.9 412.5,152.3 420.0,155.0 427.5,155.2 435.0,154.0 442.5,152.0 450.0,149.5 457.5,146.8 465.0,144.1 472.5,141.5 480.0,138.9 487.5,136.6 495.0,134.4 502.5,132.3 510.0,130.5 517.5,128.7 525.0,127.2 532.5,125.8 540.0,124.5 547.5,123.3 555.0,122.3 562.5,121.3 570.0,120.4 577.5,119.6 585.0,118.9 592.5,118.3 600.0,117.7 607.5,117.2 615.0,116.7 622.5,116.3 630.0,115.9 637.5,115.5 645.0,115.2 652.5,114.9 660.0,114.6 667.5,114.4 675.0,114.2 682.5,114.0 690.0,113.8" fill="none" stroke="#f87171" stroke-width="2.2"/>
  <polyline points="390.0,112.1 397.5,134.6 405.0,148.9 412.5,157.3 420.0,161.4 427.5,162.6 435.0,161.7 442.5,159.5 450.0,156.4 457.5,152.9 465.0,149.3 472.5,145.6 480.0,142.0 487.5,138.6 495.0,135.5 502.5,132.6 510.0,130.0 517.5,127.7 525.0,125.6 532.5,123.8 540.0,122.2 547.5,120.8 555.0,119.6 562.5,118.5 570.0,117.6 577.5,116.8 585.0,116.1 592.5,115.5 600.0,115.0 607.5,114.6 615.0,114.2 622.5,113.9 630.0,113.6 637.5,113.4 645.0,113.2 652.5,113.0 660.0,112.9 667.5,112.8 675.0,112.7 682.5,112.6 690.0,112.5" fill="none" stroke="#34d399" stroke-width="2.3"/>
  <polyline points="390.0,112.1 397.5,136.4 405.0,154.6 412.5,167.4 420.0,175.5 427.5,179.6 435.0,180.5 442.5,178.8 450.0,175.0 457.5,169.9 465.0,163.8 472.5,157.1 480.0,150.3 487.5,143.6 495.0,137.2 502.5,131.3 510.0,125.9 517.5,121.3 525.0,117.3 532.5,113.9 540.0,111.2 547.5,109.2 555.0,107.6 562.5,106.6 570.0,106.0 577.5,105.7 585.0,105.7 592.5,105.9 600.0,106.3 607.5,106.9 615.0,107.5 622.5,108.1 630.0,108.8 637.5,109.4 645.0,110.0 652.5,110.5 660.0,111.0 667.5,111.4 675.0,111.8 682.5,112.1 690.0,112.3" fill="none" stroke="#38bdf8" stroke-width="2.3"/>
  <text x="530" y="182" font-family="sans-serif" font-size="10.5" fill="#fca5a5">红：R=12.5Ω 过阻尼</text>
  <text x="530" y="198" font-family="sans-serif" font-size="10.5" fill="#6ee7b7">绿：R=10.0Ω 临界阻尼</text>
  <text x="530" y="214" font-family="sans-serif" font-size="10.5" fill="#7dd3fc">蓝：R=6.0Ω 欠阻尼(反向过零)</text>
</svg>`;

/** act 5 · 例题 2 v(t)（深色底，经 lightSvg） */
export const SVG_EX2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 315" width="740" height="315" role="img" aria-label="Sadiku 8.4 并联RLC欠阻尼精确电压波形与初值切线">
  <rect x="0" y="0" width="740" height="315" rx="12" fill="#0f172a"/>
  <text x="370" y="26" text-anchor="middle" font-family="sans-serif" font-size="14.5" font-weight="bold" fill="#f8fafc">例题 2（Sadiku 8.4）：并联 RLC 欠阻尼响应 v(t) = e^(-400t)(12cos300t - 36sin300t) V</text>
  <rect x="80" y="50" width="580" height="240" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
  <line x1="80" y1="84.3" x2="660" y2="84.3" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="80" y1="187.1" x2="660" y2="187.1" stroke="#94a3b8" stroke-width="1.6"/>
  <line x1="80" y1="238.6" x2="660" y2="238.6" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="196" y1="50" x2="196" y2="290" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="312" y1="50" x2="312" y2="290" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="428" y1="50" x2="428" y2="290" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="544" y1="50" x2="544" y2="290" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
  <text x="72" y="88" text-anchor="end" font-family="monospace" font-size="11" fill="#cbd5e1">+12V</text>
  <text x="72" y="191" text-anchor="end" font-family="monospace" font-size="11" font-weight="bold" fill="#f8fafc">0V</text>
  <text x="72" y="242" text-anchor="end" font-family="monospace" font-size="11" fill="#cbd5e1">-6V</text>
  <text x="80" y="306" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">0 ms</text>
  <text x="196" y="306" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">3 ms</text>
  <text x="312" y="306" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">6 ms</text>
  <text x="428" y="306" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">9 ms</text>
  <text x="544" y="306" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">12 ms</text>
  <text x="660" y="306" text-anchor="middle" font-family="monospace" font-size="11" fill="#cbd5e1">15 ms</text>
  <line x1="80.0" y1="84.3" x2="109.7" y2="187.1" stroke="#fbbf24" stroke-width="1.8" stroke-dasharray="4,3"/>
  <text x="118" y="102" font-family="sans-serif" font-size="11.5" fill="#fde68a">初值斜率 dv/dt(0⁺) = -15,600 V/s</text>
  <polyline points="80.0,84.3 87.7,109.4 95.5,131.6 103.2,151.0 110.9,167.9 118.7,182.4 126.4,194.8 134.1,205.4 141.9,214.2 149.6,221.4 157.3,227.3 165.1,231.9 172.8,235.4 180.5,238.0 188.3,239.7 196.0,240.7 203.7,241.0 211.5,240.8 219.2,240.1 226.9,239.1 234.7,237.7 242.4,236.0 250.1,234.2 257.9,232.2 265.6,230.0 273.3,227.8 281.1,225.6 288.8,223.3 296.5,221.0 304.3,218.7 312.0,216.5 319.7,214.4 327.5,212.3 335.2,210.3 342.9,208.3 350.7,206.5 358.4,204.8 366.1,203.1 373.9,201.5 381.6,200.1 389.3,198.7 397.1,197.5 404.8,196.3 412.5,195.2 420.3,194.2 428.0,193.3 435.7,192.4 443.5,191.7 451.2,191.0 458.9,190.4 466.7,189.8 474.4,189.3 482.1,188.9 489.9,188.5 497.6,188.1 505.3,187.8 513.1,187.5 520.8,187.3 528.5,187.1 536.3,186.9 544.0,186.8 551.7,186.7 559.5,186.6 567.2,186.5 574.9,186.4 582.7,186.4 590.4,186.4 598.1,186.3 605.9,186.3 613.6,186.3 621.3,186.3 629.1,186.3 636.8,186.4 644.5,186.4 652.3,186.4 660.0,186.4" fill="none" stroke="#38bdf8" stroke-width="2.8"/>
  <circle cx="80.0" cy="84.3" r="4.5" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="121.5" cy="187.1" r="4.5" fill="#34d399" stroke="#ffffff" stroke-width="1.5"/>
  <text x="132" y="178" font-family="sans-serif" font-size="11" fill="#6ee7b7">首次过零: t = 1.07 ms</text>
  <circle cx="204.4" cy="241.0" r="4.5" fill="#f87171" stroke="#ffffff" stroke-width="1.5"/>
  <text x="216" y="256" font-family="sans-serif" font-size="11.5" fill="#fca5a5">首负峰: t = 3.22 ms, v = -6.29 V</text>
  <rect x="430" y="64" width="215" height="92" rx="6" fill="#0f172a" fill-opacity="0.88" stroke="#475569" stroke-width="1"/>
  <text x="442" y="84" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#f8fafc">并联 RLC 参数体检</text>
  <text x="442" y="102" font-family="sans-serif" font-size="11" fill="#cbd5e1">R = 50 Ω &gt; R_crit = 40 Ω</text>
  <text x="442" y="119" font-family="sans-serif" font-size="11" fill="#7dd3fc">α = 400 Np/s &lt; ω₀ = 500 rad/s</text>
  <text x="442" y="136" font-family="sans-serif" font-size="11" fill="#6ee7b7">ω_d = 300 rad/s → 欠阻尼！</text>
</svg>`;

/** act 6 · 面包板蓝图（左半浅色；右侧示波器单独经 lightSvg） */
export const SVG_BENCH_LIGHT = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 300" width="760" height="300" role="img" aria-label="3D面包板实操接线与示波器观测蓝图">
  <rect x="0" y="0" width="760" height="300" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="380" y="26" text-anchor="middle" font-family="sans-serif" font-size="14.5" font-weight="bold" fill="#0f172a">3D 面包板实操蓝图：L = 10 mH, C = 1 µF, R_crit = 200 Ω（f₀ ≈ 1.59 kHz）</text>
  <rect x="25" y="45" width="445" height="235" rx="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="40" y1="68" x2="455" y2="68" stroke="#ef4444" stroke-width="2.5"/>
  <text x="45" y="61" font-family="monospace" font-size="11" font-weight="bold" fill="#dc2626">+5V 供电轨（台式可调直流电源 5 V）</text>
  <line x1="40" y1="258" x2="455" y2="258" stroke="#2563eb" stroke-width="2.5"/>
  <text x="45" y="274" font-family="monospace" font-size="11" font-weight="bold" fill="#1d4ed8">GND 公共地轨</text>
  <rect x="52" y="105" width="66" height="58" rx="6" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <text x="85" y="128" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#f8fafc">SPDT</text>
  <text x="85" y="144" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#cbd5e1">充/放切换</text>
  <line x1="85" y1="68" x2="85" y2="105" stroke="#ef4444" stroke-width="2"/>
  <line x1="85" y1="163" x2="85" y2="258" stroke="#2563eb" stroke-width="2"/>
  <circle cx="190" cy="134" r="28" fill="#1e293b" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="190" y1="134" x2="206" y2="116" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <text x="190" y="178" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#b45309">0–1 kΩ 电位器</text>
  <text x="190" y="193" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">总电阻过 200Ω 振铃消失</text>
  <line x1="118" y1="134" x2="162" y2="134" stroke="#f97316" stroke-width="2.4"/>
  <rect x="255" y="114" width="76" height="40" rx="8" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
  <text x="293" y="132" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#ffffff">L = 10 mH</text>
  <text x="293" y="147" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#e0f2fe">(含 R_L ≈ 10 Ω)</text>
  <line x1="218" y1="134" x2="255" y2="134" stroke="#f97316" stroke-width="2.4"/>
  <rect x="372" y="155" width="54" height="58" rx="6" fill="#059669" stroke="#047857" stroke-width="1.5"/>
  <text x="399" y="180" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#ffffff">1 µF</text>
  <text x="399" y="196" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#d1fae5">无极性CBB</text>
  <line x1="331" y1="134" x2="399" y2="134" stroke="#10b981" stroke-width="2.4"/>
  <line x1="399" y1="134" x2="399" y2="155" stroke="#10b981" stroke-width="2.4"/>
  <line x1="399" y1="213" x2="399" y2="258" stroke="#2563eb" stroke-width="2.4"/>
  <circle cx="399" cy="134" r="4.5" fill="#fbbf24" stroke="#0f172a" stroke-width="1.2"/>
`;
export const SVG_BENCH_DARK = String.raw`<rect x="490" y="45" width="245" height="235" rx="10" fill="#1e293b" stroke="#475569" stroke-width="2"/>
  <text x="612" y="68" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#f8fafc">示波器 CH1：跨接在 C 两端</text>
  <rect x="508" y="80" width="210" height="120" rx="6" fill="#020617" stroke="#334155" stroke-width="1.2"/>
  <line x1="508" y1="150" x2="718" y2="150" stroke="#475569" stroke-width="1" stroke-dasharray="3,3"/>
  <path d="M 508 112.5 L 512 112.5 L 514.3 113.4 L 516.5 115.8 L 518.8 119.5 L 521.1 124.3 L 523.4 129.9 L 525.6 135.9 L 527.9 142.0 L 530.2 148.0 L 532.5 153.6 L 534.8 158.5 L 537.0 162.7 L 539.3 165.9 L 541.6 168.2 L 543.9 169.4 L 546.1 169.7 L 548.4 169.1 L 550.7 167.7 L 553.0 165.6 L 555.2 163.0 L 557.5 160.0 L 559.8 156.8 L 562.0 153.6 L 564.3 150.4 L 566.6 147.6 L 568.9 145.0 L 571.1 142.9 L 573.4 141.3 L 575.7 140.2 L 578.0 139.7 L 580.2 139.6 L 582.5 140.1 L 584.8 140.9 L 587.1 142.1 L 589.4 143.5 L 591.6 145.1 L 593.9 146.8 L 596.2 148.5 L 598.5 150.1 L 600.7 151.6 L 603.0 152.9 L 605.3 153.9 L 607.5 154.7 L 609.8 155.2 L 612.1 155.5 L 614.4 155.4 L 616.6 155.2 L 618.9 154.7 L 621.2 154.0 L 623.5 153.3 L 625.8 152.4 L 628.0 151.5 L 630.3 150.6 L 632.6 149.8 L 634.9 149.0 L 637.1 148.4 L 639.4 147.8 L 641.7 147.5 L 644.0 147.2 L 646.2 147.1 L 648.5 147.2 L 650.8 147.3 L 653.0 147.6 L 655.3 147.9 L 657.6 148.4 L 659.9 148.8 L 662.1 149.3 L 664.4 149.8 L 666.7 150.2 L 669.0 150.6 L 671.2 150.9 L 673.5 151.2 L 675.8 151.4 L 678.1 151.5 L 680.3 151.5 L 682.6 151.5 L 684.9 151.4 L 687.2 151.2 L 689.5 151.0 L 691.7 150.8 L 694.0 150.6 L 696.3 150.3 L 698.5 150.1 L 700.8 149.9 L 703.1 149.7 L 705.4 149.5 L 707.6 149.4 L 709.9 149.3 L 712.2 149.2 L 714.5 149.2 L 716.8 149.2" fill="none" stroke="#38bdf8" stroke-width="2.4"/>
  <text x="515" y="96" font-family="monospace" font-size="10" fill="#38bdf8">2V/div  200us/div</text>
  <text x="515" y="193" font-family="monospace" font-size="10" fill="#34d399">Trig: Falling +4.5V</text>
  <path d="M 399 134 C 445 134, 460 115, 508 115" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="612" y="222" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#fde68a">旋钮实操观察目标：</text>
  <text x="612" y="240" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#cbd5e1">① R=40Ω：3–4 轮振铃过零</text>
  <text x="612" y="256" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#6ee7b7">② R=200Ω：临界归零最快</text>
  <text x="612" y="272" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#fca5a5">③ R=500Ω：过阻尼明显拖尾</text>
</svg>`;
