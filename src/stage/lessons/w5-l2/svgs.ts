// W5-L2 figures. The lesson sheet's inline SVGs (docs/lessons/W5-L2.md) are reproduced as given
// (comments dropped) except where noted; the step diagrams are the sheet's; the quiz figures are
// drawn here (light theme, no answers).
// Changes: SVG_Z_TRIANGLE's vectors were drawn at mixed scales (its Z arrow pointed at 32°, its
// triangle at 47°, both labelled 53.13°): both halves are redrawn to one scale each, so θ_Z = 53.13°.

const R = String.raw;

/** act 1 · R / L / C 三元件相量电压-电流夹角对比（浅色底，原样） */
export const SVG_RLC_ANGLES = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 270" width="100%" role="img" aria-label="R、L、C三大元件相量电压电流夹角对比图">
  <defs>
    <marker id="arrV1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
    <marker id="arrI1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="760" height="270" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="380" y="26" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a">R / L / C 三元件相量关系对比（以电流相量 I 为 0° 参考基准）</text>
  <rect x="20" y="42" width="225" height="210" rx="8" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="132" y="64" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">电阻 R（同相 0°）</text>
  <line x1="45" y1="150" x2="225" y2="150" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="95" y1="80" x2="95" y2="210" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="216" y="144" font-family="sans-serif" font-size="10" fill="#64748b">Re</text>
  <text x="100" y="90" font-family="sans-serif" font-size="10" fill="#64748b">Im (j)</text>
  <line x1="95" y1="150" x2="170" y2="150" stroke="#2563eb" stroke-width="3" marker-end="url(#arrI1)"/>
  <line x1="95" y1="144" x2="205" y2="144" stroke="#dc2626" stroke-width="3" marker-end="url(#arrV1)"/>
  <text x="165" y="168" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2563eb">I</text>
  <text x="195" y="135" font-family="sans-serif" font-size="12" font-weight="bold" fill="#dc2626">V = R·I</text>
  <text x="132" y="226" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">Z_R = R ∠ 0°</text>
  <text x="132" y="243" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#64748b">频率无关 · 纯耗能</text>
  <rect x="267" y="42" width="225" height="210" rx="8" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="380" y="64" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#b45309">电感 L（ELI：V 超前 I 90°）</text>
  <line x1="292" y1="160" x2="472" y2="160" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="355" y1="80" x2="355" y2="210" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="462" y="154" font-family="sans-serif" font-size="10" fill="#64748b">Re</text>
  <text x="361" y="90" font-family="sans-serif" font-size="10" fill="#64748b">+j</text>
  <line x1="355" y1="160" x2="435" y2="160" stroke="#2563eb" stroke-width="3" marker-end="url(#arrI1)"/>
  <line x1="355" y1="160" x2="355" y2="92" stroke="#dc2626" stroke-width="3" marker-end="url(#arrV1)"/>
  <path d="M 382 160 A 27 27 0 0 0 355 133" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <text x="384" y="140" font-family="sans-serif" font-size="11" font-weight="bold" fill="#d97706">+90°</text>
  <text x="430" y="177" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2563eb">I</text>
  <text x="364" y="106" font-family="sans-serif" font-size="12" font-weight="bold" fill="#dc2626">V = jωL·I</text>
  <text x="380" y="226" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">Z_L = jωL = ωL ∠ +90°</text>
  <text x="380" y="243" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#64748b">DC 短路 · 高频开路</text>
  <rect x="514" y="42" width="225" height="210" rx="8" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="626" y="64" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f766e">电容 C（ICE：I 超前 V 90°）</text>
  <line x1="539" y1="130" x2="719" y2="130" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="602" y1="80" x2="602" y2="210" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="709" y="124" font-family="sans-serif" font-size="10" fill="#64748b">Re</text>
  <text x="608" y="206" font-family="sans-serif" font-size="10" fill="#64748b">-j</text>
  <line x1="602" y1="130" x2="682" y2="130" stroke="#2563eb" stroke-width="3" marker-end="url(#arrI1)"/>
  <line x1="602" y1="130" x2="602" y2="196" stroke="#dc2626" stroke-width="3" marker-end="url(#arrV1)"/>
  <path d="M 629 130 A 27 27 0 0 1 602 157" fill="none" stroke="#14b8a6" stroke-width="2"/>
  <text x="630" y="158" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0d9488">-90°</text>
  <text x="678" y="119" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2563eb">I</text>
  <text x="610" y="192" font-family="sans-serif" font-size="12" font-weight="bold" fill="#dc2626">V = (-j/ωC)·I</text>
  <text x="626" y="226" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">Z_C = -j/(ωC) = (1/ωC) ∠ -90°</text>
  <text x="626" y="243" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#64748b">DC 开路 · 高频短路</text>
</svg>`;

/** act 2 · 串联 RLC 复阻抗矢量三角形（浅色底；矢量按统一比例重画，见文件头） */
export const SVG_Z_TRIANGLE = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 310" width="100%" role="img" aria-label="串联RLC复阻抗矢量三角形图">
  <defs>
    <marker id="arrBlk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f172a"/>
    </marker>
    <marker id="arrOrg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ea580c"/>
    </marker>
    <marker id="arrTeal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0d9488"/>
    </marker>
    <marker id="arrPurp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#7c3aed"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="720" height="310" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="360" y="28" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a">串联 RLC 复阻抗矢量合成与阻抗三角形（ω = 1000 rad/s）</text>
  <rect x="20" y="44" width="330" height="248" rx="8" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="185" y="66" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#334155">1. 三元件阻抗矢量合成</text>
  <line x1="55" y1="195" x2="320" y2="195" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="115" y1="80" x2="115" y2="275" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="310" y="188" font-family="sans-serif" font-size="10" fill="#64748b">实轴 R</text>
  <text x="122" y="90" font-family="sans-serif" font-size="10" fill="#64748b">虚轴 jX</text>
  <line x1="115" y1="195" x2="115" y2="83" stroke="#ea580c" stroke-width="3" marker-end="url(#arrOrg)"/>
  <text x="108" y="104" text-anchor="end" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#ea580c">+jX_L = +j80 Ω</text>
  <line x1="115" y1="195" x2="115" y2="251" stroke="#0d9488" stroke-width="3" marker-end="url(#arrTeal)"/>
  <text x="108" y="244" text-anchor="end" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0d9488">-jX_C = -j40 Ω</text>
  <line x1="115" y1="195" x2="157" y2="195" stroke="#0f172a" stroke-width="3" marker-end="url(#arrBlk)"/>
  <text x="150" y="213" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0f172a">R = 30 Ω</text>
  <line x1="157" y1="195" x2="157" y2="139" stroke="#ea580c" stroke-width="2.5" stroke-dasharray="5,3" marker-end="url(#arrOrg)"/>
  <text x="165" y="176" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ea580c">j(X_L-X_C) = +j40 Ω</text>
  <line x1="115" y1="195" x2="157" y2="139" stroke="#7c3aed" stroke-width="3.5" marker-end="url(#arrPurp)"/>
  <text x="165" y="138" font-family="sans-serif" font-size="12" font-weight="bold" fill="#7c3aed">Z = 50 ∠ 53.13° Ω</text>
  <rect x="370" y="44" width="330" height="248" rx="8" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="535" y="66" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#334155">2. 勾股阻抗三角形（非相量算子）</text>
  <polygon points="430,235 526,235 526,107" fill="#f3e8ff" fill-opacity="0.45" stroke="none"/>
  <line x1="430" y1="235" x2="526" y2="235" stroke="#0f172a" stroke-width="3"/>
  <line x1="526" y1="235" x2="526" y2="107" stroke="#ea580c" stroke-width="3"/>
  <line x1="430" y1="235" x2="526" y2="107" stroke="#7c3aed" stroke-width="3.5"/>
  <polyline points="512,235 512,221 526,221" fill="none" stroke="#475569" stroke-width="1.5"/>
  <path d="M 468 235 A 38 38 0 0 0 452.8 204.6" fill="none" stroke="#7c3aed" stroke-width="2"/>
  <text x="470" y="226" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#7c3aed" stroke="#ffffff" stroke-width="3" paint-order="stroke">θ_Z = 53.13°</text>
  <text x="478" y="255" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a">实部 R = 30 Ω</text>
  <text x="536" y="174" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ea580c">虚部 X = +40 Ω</text>
  <text x="446" y="166" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#7c3aed" transform="rotate(-53.13 446 166)">|Z| = 50 Ω</text>
  <rect x="392" y="264" width="286" height="22" rx="4" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="535" y="279" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#92400e">对应复导纳：Y = 0.012 - j0.016 S (G ≠ 1/R)</text>
</svg>`;

/** act 3 · Sadiku 9.6 混联复阻抗例题电路（浅色底，原样） */
export const SVG_MIX = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 280" width="100%" role="img" aria-label="Sadiku 9.6 混联复阻抗例题电路图">
  <defs>
    <marker id="arrCur3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="740" height="280" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="370" y="26" text-anchor="middle" font-family="sans-serif" font-size="14.5" font-weight="bold" fill="#0f172a">Sadiku 9.6 混联 RLC 网络（ω = 50 rad/s · 蓝字为频域复阻抗等效值）</text>
  <circle cx="85" cy="155" r="26" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
  <path d="M 73 155 Q 79 143 85 155 T 97 155" fill="none" stroke="#dc2626" stroke-width="2"/>
  <text x="85" y="138" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">+</text>
  <text x="85" y="177" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">−</text>
  <text x="85" y="205" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">v_s(t) = 30cos(50t+10°)</text>
  <text x="85" y="221" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#2563eb">V_s = 30 ∠ 10° V</text>
  <polyline points="85,129 85,72 150,72" fill="none" stroke="#0f172a" stroke-width="2"/>
  <line x1="100" y1="62" x2="138" y2="62" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arrCur3)"/>
  <text x="119" y="54" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#2563eb">I</text>
  <rect x="150" y="60" width="60" height="24" rx="3" fill="#fff7ed" stroke="#0f172a" stroke-width="2"/>
  <text x="180" y="76" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">R1 = 2 Ω</text>
  <text x="180" y="53" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#2563eb">2 Ω</text>
  <line x1="210" y1="72" x2="265" y2="72" stroke="#0f172a" stroke-width="2"/>
  <line x1="265" y1="56" x2="265" y2="88" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="277" y1="56" x2="277" y2="88" stroke="#0f172a" stroke-width="2.5"/>
  <text x="271" y="48" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">C1 = 5 mF</text>
  <text x="271" y="103" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2563eb">-j4 Ω</text>
  <rect x="142" y="38" width="160" height="72" rx="6" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,3"/>
  <text x="222" y="123" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#475569">Z_1 = 2 - j4 Ω</text>
  <line x1="277" y1="72" x2="430" y2="72" stroke="#0f172a" stroke-width="2"/>
  <circle cx="430" cy="72" r="4" fill="#dc2626"/>
  <text x="430" y="58" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#dc2626">节点 A (V_p)</text>
  <line x1="430" y1="72" x2="430" y2="98" stroke="#0f172a" stroke-width="2"/>
  <line x1="418" y1="80" x2="418" y2="104" stroke="#2563eb" stroke-width="2" marker-end="url(#arrCur3)"/>
  <text x="403" y="96" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2563eb">I_A</text>
  <rect x="416" y="98" width="28" height="48" rx="3" fill="#fff7ed" stroke="#0f172a" stroke-width="2"/>
  <text x="452" y="118" font-family="sans-serif" font-size="11" fill="#334155">R2 = 8 Ω</text>
  <text x="452" y="133" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#2563eb">8 Ω</text>
  <line x1="430" y1="146" x2="430" y2="165" stroke="#0f172a" stroke-width="2"/>
  <path d="M 430 165 C 446 165 446 177 430 177 C 446 177 446 189 430 189 C 446 189 446 201 430 201 C 446 201 446 213 430 213" fill="none" stroke="#0f172a" stroke-width="2"/>
  <text x="452" y="186" font-family="sans-serif" font-size="11" fill="#334155">L = 120 mH</text>
  <text x="452" y="202" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2563eb">+j6 Ω</text>
  <line x1="430" y1="213" x2="430" y2="242" stroke="#0f172a" stroke-width="2"/>
  <polyline points="430,72 605,72 605,142" fill="none" stroke="#0f172a" stroke-width="2"/>
  <line x1="590" y1="88" x2="590" y2="115" stroke="#2563eb" stroke-width="2" marker-end="url(#arrCur3)"/>
  <text x="572" y="105" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2563eb">I_B</text>
  <line x1="588" y1="142" x2="622" y2="142" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="588" y1="154" x2="622" y2="154" stroke="#0f172a" stroke-width="2.5"/>
  <text x="632" y="144" font-family="sans-serif" font-size="11" fill="#334155">C2 = 2 mF</text>
  <text x="632" y="160" font-family="sans-serif" font-size="11" font-weight="bold" fill="#2563eb">-j10 Ω</text>
  <line x1="605" y1="154" x2="605" y2="242" stroke="#0f172a" stroke-width="2"/>
  <rect x="385" y="79" width="320" height="156" rx="6" fill="none" stroke="#14b8a6" stroke-width="1.3" stroke-dasharray="5,3"/>
  <text x="545" y="264" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0f766e">并联块 Z_p = (8+j6) ∥ (-j10) = 10 - j5 Ω</text>
  <polyline points="85,181 85,242 605,242" fill="none" stroke="#0f172a" stroke-width="2"/>
  <circle cx="430" cy="242" r="4" fill="#0f172a"/>
</svg>`;

/** act 4 · 双通道示波器 −45° 相移波形（深色底，index.ts 里经 lightSvg） */
export const SVG_SCOPE_DARK = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 350" width="100%" role="img" aria-label="双通道示波器45度相移精确波形图">
  <defs>
    <marker id="arrCursor" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="700" height="350" rx="14" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <text x="350" y="25" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#f8fafc">双通道示波器实测：R = 1.6 kΩ, C = 100 nF, f = 1 kHz (250 μs/div · 2.5 V/div)</text>
  <rect x="70" y="40" width="560" height="270" fill="#020617" stroke="#475569" stroke-width="1.5"/>
  <g stroke="#1e293b" stroke-width="1">
    <line x1="140" y1="40" x2="140" y2="310"/>
    <line x1="210" y1="40" x2="210" y2="310"/>
    <line x1="280" y1="40" x2="280" y2="310"/>
    <line x1="350" y1="40" x2="350" y2="310"/>
    <line x1="420" y1="40" x2="420" y2="310"/>
    <line x1="490" y1="40" x2="490" y2="310"/>
    <line x1="560" y1="40" x2="560" y2="310"/>
    <line x1="70" y1="85" x2="630" y2="85"/>
    <line x1="70" y1="130" x2="630" y2="130"/>
    <line x1="70" y1="220" x2="630" y2="220"/>
    <line x1="70" y1="265" x2="630" y2="265"/>
  </g>
  <line x1="70" y1="175" x2="630" y2="175" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="350" y1="40" x2="350" y2="310" stroke="#475569" stroke-width="1.2" stroke-dasharray="4,3"/>
  <text x="62" y="89" text-anchor="end" font-family="monospace" font-size="10.5" fill="#94a3b8">+5.0V</text>
  <text x="62" y="134" text-anchor="end" font-family="monospace" font-size="10.5" fill="#94a3b8">+2.5V</text>
  <text x="62" y="179" text-anchor="end" font-family="monospace" font-size="10.5" fill="#e2e8f0">0.0V</text>
  <text x="62" y="224" text-anchor="end" font-family="monospace" font-size="10.5" fill="#94a3b8">-2.5V</text>
  <text x="62" y="269" text-anchor="end" font-family="monospace" font-size="10.5" fill="#94a3b8">-5.0V</text>
  <path d="M70.0,175.0 L74.7,165.6 L79.3,156.3 L84.0,147.2 L88.7,138.4 L93.3,130.0 L98.0,122.1 L102.7,114.8 L107.3,108.1 L112.0,102.2 L116.7,97.1 L121.3,92.8 L126.0,89.4 L130.7,87.0 L135.3,85.5 L140.0,85.0 L144.7,85.5 L149.3,87.0 L154.0,89.4 L158.7,92.8 L163.3,97.1 L168.0,102.2 L172.7,108.1 L177.3,114.8 L182.0,122.1 L186.7,130.0 L191.3,138.4 L196.0,147.2 L200.7,156.3 L205.3,165.6 L210.0,175.0 L214.7,184.4 L219.3,193.7 L224.0,202.8 L228.7,211.6 L233.3,220.0 L238.0,227.9 L242.7,235.2 L247.3,241.9 L252.0,247.8 L256.7,252.9 L261.3,257.2 L266.0,260.6 L270.7,263.0 L275.3,264.5 L280.0,265.0 L284.7,264.5 L289.3,263.0 L294.0,260.6 L298.7,257.2 L303.3,252.9 L308.0,247.8 L312.7,241.9 L317.3,235.2 L322.0,227.9 L326.7,220.0 L331.3,211.6 L336.0,202.8 L340.7,193.7 L345.3,184.4 L350.0,175.0 L354.7,165.6 L359.3,156.3 L364.0,147.2 L368.7,138.4 L373.3,130.0 L378.0,122.1 L382.7,114.8 L387.3,108.1 L392.0,102.2 L396.7,97.1 L401.3,92.8 L406.0,89.4 L410.7,87.0 L415.3,85.5 L420.0,85.0 L424.7,85.5 L429.3,87.0 L434.0,89.4 L438.7,92.8 L443.3,97.1 L448.0,102.2 L452.7,108.1 L457.3,114.8 L462.0,122.1 L466.7,130.0 L471.3,138.4 L476.0,147.2 L480.7,156.3 L485.3,165.6 L490.0,175.0 L494.7,184.4 L499.3,193.7 L504.0,202.8 L508.7,211.6 L513.3,220.0 L518.0,227.9 L522.7,235.2 L527.3,241.9 L532.0,247.8 L536.7,252.9 L541.3,257.2 L546.0,260.6 L550.7,263.0 L555.3,264.5 L560.0,265.0 L564.7,264.5 L569.3,263.0 L574.0,260.6 L578.7,257.2 L583.3,252.9 L588.0,247.8 L592.7,241.9 L597.3,235.2 L602.0,227.9 L606.7,220.0 L611.3,211.6 L616.0,202.8 L620.7,193.7 L625.3,184.4 L630.0,175.0" fill="none" stroke="#facc15" stroke-width="2.8"/>
  <path d="M70.0,220.0 L74.7,215.1 L79.3,209.7 L84.0,204.0 L88.7,197.9 L93.3,191.6 L98.0,185.1 L102.7,178.5 L107.3,171.8 L112.0,165.2 L116.7,158.7 L121.3,152.4 L126.0,146.3 L130.7,140.6 L135.3,135.2 L140.0,130.2 L144.7,125.8 L149.3,121.9 L154.0,118.5 L158.7,115.8 L163.3,113.7 L168.0,112.3 L172.7,111.6 L177.3,111.6 L182.0,112.3 L186.7,113.7 L191.3,115.7 L196.0,118.4 L200.7,121.7 L205.3,125.6 L210.0,130.0 L214.7,134.9 L219.3,140.3 L224.0,146.0 L228.7,152.1 L233.3,158.4 L238.0,164.9 L242.7,171.5 L247.3,178.2 L252.0,184.8 L256.7,191.3 L261.3,197.6 L266.0,203.7 L270.7,209.4 L275.3,214.8 L280.0,219.8 L284.7,224.2 L289.3,228.1 L294.0,231.5 L298.7,234.2 L303.3,236.3 L308.0,237.7 L312.7,238.4 L317.3,238.4 L322.0,237.7 L326.7,236.3 L331.3,234.3 L336.0,231.6 L340.7,228.3 L345.3,224.4 L350.0,220.0 L354.7,215.1 L359.3,209.7 L364.0,204.0 L368.7,197.9 L373.3,191.6 L378.0,185.1 L382.7,178.5 L387.3,171.8 L392.0,165.2 L396.7,158.7 L401.3,152.4 L406.0,146.3 L410.7,140.6 L415.3,135.2 L420.0,130.2 L424.7,125.8 L429.3,121.9 L434.0,118.5 L438.7,115.8 L443.3,113.7 L448.0,112.3 L452.7,111.6 L457.3,111.6 L462.0,112.3 L466.7,113.7 L471.3,115.7 L476.0,118.4 L480.7,121.7 L485.3,125.6 L490.0,130.0 L494.7,134.9 L499.3,140.3 L504.0,146.0 L508.7,152.1 L513.3,158.4 L518.0,164.9 L522.7,171.5 L527.3,178.2 L532.0,184.8 L536.7,191.3 L541.3,197.6 L546.0,203.7 L550.7,209.4 L555.3,214.8 L560.0,219.8 L564.7,224.2 L569.3,228.1 L574.0,231.5 L578.7,234.2 L583.3,236.3 L588.0,237.7 L592.7,238.4 L597.3,238.4 L602.0,237.7 L606.7,236.3 L611.3,234.3 L616.0,231.6 L620.7,228.3 L625.3,224.4 L630.0,220.0" fill="none" stroke="#22d3ee" stroke-width="2.8"/>
  <line x1="140.0" y1="55" x2="140.0" y2="175" stroke="#facc15" stroke-width="1.3" stroke-dasharray="3,2"/>
  <line x1="175.1" y1="55" x2="175.1" y2="175" stroke="#22d3ee" stroke-width="1.3" stroke-dasharray="3,2"/>
  <circle cx="140.0" cy="85.0" r="4" fill="#facc15"/>
  <circle cx="175.1" cy="111.5" r="4" fill="#22d3ee"/>
  <line x1="142" y1="66" x2="173" y2="66" stroke="#f43f5e" stroke-width="2" marker-start="url(#arrCursor)" marker-end="url(#arrCursor)"/>
  <rect x="182" y="51" width="172" height="28" rx="4" fill="#1e293b" stroke="#f43f5e" stroke-width="1"/>
  <text x="268" y="69" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fda4af">Δt = 125.4 μs (Δφ ≈ -45.2°)</text>
  <line x1="140.0" y1="288" x2="420.0" y2="288" stroke="#a78bfa" stroke-width="1.8" marker-start="url(#arrCursor)" marker-end="url(#arrCursor)"/>
  <rect x="218" y="276" width="124" height="22" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="1"/>
  <text x="280" y="291" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ddd6fe">T = 1.00 ms (4 div)</text>
  <rect x="70" y="317" width="265" height="24" rx="5" fill="#1e293b"/>
  <line x1="82" y1="329" x2="104" y2="329" stroke="#facc15" stroke-width="3"/>
  <text x="112" y="333" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fef08a">CH1 v_in: 5.00 Vpk (0°)</text>

  <rect x="350" y="317" width="280" height="24" rx="5" fill="#1e293b"/>
  <line x1="362" y1="329" x2="384" y2="329" stroke="#22d3ee" stroke-width="3"/>
  <text x="392" y="333" font-family="sans-serif" font-size="11" font-weight="bold" fill="#a5f3fc">CH2 v_C: 3.53 Vpk (0.705×, -45.15°)</text>
</svg>`;

/** act 5 · 面包板 RC 正确共地接法 vs 探头误接短路（浅色底，原样） */
export const SVG_GROUND = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 285" width="100%" role="img" aria-label="面包板RC电路正确共地接法与双通道探头误接短路对比图">
  <rect x="0" y="0" width="760" height="285" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="380" y="26" text-anchor="middle" font-family="sans-serif" font-size="14.5" font-weight="bold" fill="#0f172a">双通道示波器探头共地安全红线对比（台式示波器 CH1 GND ≡ CH2 GND ≡ PE）</text>
  <rect x="20" y="42" width="350" height="228" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.8"/>
  <text x="195" y="64" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#15803d">✓ 正确接法：三地合一（安全观测 v_in 与 v_C）</text>
  <circle cx="70" cy="145" r="20" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
  <text x="70" y="149" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a">FG</text>
  <polyline points="70,125 70,92 125,92" fill="none" stroke="#0f172a" stroke-width="2"/>
  <rect x="125" y="81" width="64" height="22" rx="3" fill="#fff7ed" stroke="#0f172a" stroke-width="2"/>
  <text x="157" y="96" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a">1.6 kΩ</text>
  <polyline points="189,92 245,92 245,136" fill="none" stroke="#0f172a" stroke-width="2"/>
  <line x1="229" y1="136" x2="261" y2="136" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="229" y1="147" x2="261" y2="147" stroke="#0f172a" stroke-width="2.5"/>
  <text x="278" y="146" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a">100 nF</text>
  <line x1="245" y1="147" x2="245" y2="205" stroke="#0f172a" stroke-width="2"/>
  <polyline points="70,165 70,205 330,205" fill="none" stroke="#0284c7" stroke-width="3"/>
  <text x="195" y="222" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0369a1">面包板蓝色公共地轨 GND (FG + CH1 + CH2 地夹)</text>
  <circle cx="95" cy="92" r="4.5" fill="#eab308"/>
  <text x="95" y="81" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#a16207">CH1 探针</text>
  <circle cx="245" cy="92" r="4.5" fill="#06b6d4"/>
  <text x="245" y="81" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0e7490">CH2 探针</text>
  <circle cx="145" cy="205" r="4" fill="#0f172a"/>
  <circle cx="285" cy="205" r="4" fill="#0f172a"/>
  <text x="195" y="252" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#166534">共地无环流 · 电流 1.57 mA RMS · 功耗 3.93 mW</text>
  <rect x="390" y="42" width="350" height="228" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="1.8"/>
  <text x="565" y="64" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#b91c1c">✗ 致命误接：CH2 地夹夹在 R-C 节点导致短路！</text>
  <circle cx="440" cy="145" r="20" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
  <text x="440" y="149" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a">FG</text>
  <polyline points="440,125 440,92 495,92" fill="none" stroke="#0f172a" stroke-width="2"/>
  <rect x="495" y="81" width="64" height="22" rx="3" fill="#fff7ed" stroke="#0f172a" stroke-width="2"/>
  <text x="527" y="96" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a">1.6 kΩ</text>
  <polyline points="559,92 615,92 615,136" fill="none" stroke="#0f172a" stroke-width="2"/>
  <line x1="599" y1="136" x2="631" y2="136" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="599" y1="147" x2="631" y2="147" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="646" y="146" font-family="sans-serif" font-size="10.5" fill="#94a3b8">C 被短接!</text>
  <line x1="615" y1="147" x2="615" y2="205" stroke="#94a3b8" stroke-width="2"/>
  <polyline points="440,165 440,205 680,205" fill="none" stroke="#0284c7" stroke-width="2.5"/>
  <circle cx="585" cy="92" r="5" fill="#dc2626"/>
  <text x="585" y="80" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#dc2626">CH2 黑色地夹(错!)</text>
  <path d="M 585 97 L 585 182 L 495 182 L 495 205" fill="none" stroke="#dc2626" stroke-width="2.8" stroke-dasharray="6,3"/>
  <rect x="455" y="156" width="142" height="20" rx="4" fill="#fee2e2" stroke="#dc2626"/>
  <text x="526" y="170" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#b91c1c">示波器内部地线直接短路 C!</text>
  <text x="565" y="233" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#991b1b">后果：电容电压被迫归零，相移彻底消失！</text>
  <text x="565" y="252" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#7f1d1d">正确测 v_R：对调 R/C 位置 或用 MATH = CH1 - CH2</text>
</svg>`;

/** act 6 · 苏格拉底实战例题拓扑图（浅色底，原样） */
export const SVG_EX_PROBLEM = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 250" width="100%" role="img" aria-label="苏格拉底5步引导例题电路图">
  <rect x="0" y="0" width="700" height="250" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="350" y="25" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">苏格拉底实战例题：求总复阻抗 Z_eq、总电流相量 I 与时域波形 i(t)</text>
  <circle cx="80" cy="140" r="24" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
  <path d="M 69 140 Q 74.5 129 80 140 T 91 140" fill="none" stroke="#dc2626" stroke-width="2"/>
  <text x="80" y="124" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a">+</text>
  <text x="80" y="160" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a">−</text>
  <text x="80" y="185" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#334155">v_s(t) = 30cos(200t+20°) V</text>
  <polyline points="80,116 80,68 150,68" fill="none" stroke="#0f172a" stroke-width="2"/>
  <rect x="150" y="57" width="62" height="22" rx="3" fill="#fff7ed" stroke="#0f172a" stroke-width="2"/>
  <text x="181" y="72" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a">R1 = 3 Ω</text>
  <line x1="212" y1="68" x2="255" y2="68" stroke="#0f172a" stroke-width="2"/>
  <path d="M 255 68 C 255 53 268 53 268 68 C 268 53 281 53 281 68 C 281 53 294 53 294 68 C 294 53 307 53 307 68" fill="none" stroke="#0f172a" stroke-width="2"/>
  <text x="281" y="48" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#b45309">L1 = 55 mH</text>
  <line x1="307" y1="68" x2="430" y2="68" stroke="#0f172a" stroke-width="2"/>
  <circle cx="430" cy="68" r="3.5" fill="#0f172a"/>
  <line x1="430" y1="68" x2="430" y2="110" stroke="#0f172a" stroke-width="2"/>
  <rect x="417" y="110" width="26" height="54" rx="3" fill="#fff7ed" stroke="#0f172a" stroke-width="2"/>
  <text x="452" y="141" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">R2 = 10 Ω</text>
  <line x1="430" y1="164" x2="430" y2="215" stroke="#0f172a" stroke-width="2"/>
  <polyline points="430,68 575,68 575,130" fill="none" stroke="#0f172a" stroke-width="2"/>
  <line x1="557" y1="130" x2="593" y2="130" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="557" y1="142" x2="593" y2="142" stroke="#0f172a" stroke-width="2.5"/>
  <text x="602" y="140" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f766e">C = 500 μF</text>
  <line x1="575" y1="142" x2="575" y2="215" stroke="#0f172a" stroke-width="2"/>
  <polyline points="80,164 80,215 575,215" fill="none" stroke="#0f172a" stroke-width="2"/>
  <circle cx="430" cy="215" r="3.5" fill="#0f172a"/>
  <text x="502" y="236" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">提示：ω = 200 rad/s，先将所有元件搬进频域！</text>
</svg>`;

/** guided step 1 (the sheet's mini diagram) */
export const MINI_STEP1 = R`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 72'><rect width='260' height='72' rx='6' fill='#f8fafc' stroke='#cbd5e1'/><text x='130' y='28' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#0f172a'>ω = 200 rad/s</text><text x='130' y='52' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#2563eb'>L1=55mH → ?   C=500μF → ?</text></svg>`;

/** guided step 2 (the sheet's mini diagram) */
export const MINI_STEP2 = R`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 72'><rect width='260' height='72' rx='6' fill='#f8fafc' stroke='#cbd5e1'/><text x='130' y='30' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#0f172a'>R2 = 10 Ω  ∥  Z_C = -j10 Ω</text><text x='130' y='52' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#0f766e'>Z_p = (10)(-j10) / (10 - j10) = ?</text></svg>`;

/** guided step 3 (the sheet's mini diagram) */
export const MINI_STEP3 = R`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 72'><rect width='260' height='72' rx='6' fill='#f8fafc' stroke='#cbd5e1'/><text x='130' y='30' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#0f172a'>Z_eq = (3 + j11) + (5 - j5)</text><text x='130' y='52' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#7c3aed'>直角形式 &amp; 极坐标 |Z_eq| ∠ θ_Z = ?</text></svg>`;

/** guided step 4 (the sheet's mini diagram) */
export const MINI_STEP4 = R`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 72'><rect width='260' height='72' rx='6' fill='#f8fafc' stroke='#cbd5e1'/><text x='130' y='30' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#0f172a'>I = V_s / Z_eq</text><text x='130' y='52' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#2563eb'>(30 ∠ 20°) / (10 ∠ 36.87°) = ?</text></svg>`;

/** guided step 5 (the sheet's mini diagram) */
export const MINI_STEP5 = R`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 72'><rect width='260' height='72' rx='6' fill='#f8fafc' stroke='#cbd5e1'/><text x='130' y='30' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#0f172a'>I = 3.00 ∠ -16.87° A  (ω = 200)</text><text x='130' y='52' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#15803d'>i(t) = Re{ I · e^(j200t) } = ?</text></svg>`;
/* ------------------------------------------------------------- quiz figures (drawn here, no answers) */

/** Q1 · an inductor and a capacitor, and the two frequency extremes */
export const SVG_Q1 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 130" width="340" height="130" role="img" aria-label="纯电感与纯电容，直流与高频两个极端">
  <rect x="0" y="0" width="340" height="130" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="40" y1="30" x2="40" y2="44" stroke="#334155" stroke-width="2"/>
  <path d="M 40 44 C 52 44 52 56 40 56 C 52 56 52 68 40 68 C 52 68 52 80 40 80 C 52 80 52 92 40 92" fill="none" stroke="#7c3aed" stroke-width="2.4"/>
  <line x1="40" y1="92" x2="40" y2="106" stroke="#334155" stroke-width="2"/>
  <text x="62" y="66" font-family="sans-serif" font-size="13" font-weight="bold" fill="#6d28d9">L</text>
  <text x="62" y="84" font-family="sans-serif" font-size="11" fill="#334155">Z_L = ?</text>
  <line x1="150" y1="30" x2="150" y2="62" stroke="#334155" stroke-width="2"/>
  <line x1="134" y1="62" x2="166" y2="62" stroke="#059669" stroke-width="3"/>
  <line x1="134" y1="74" x2="166" y2="74" stroke="#059669" stroke-width="3"/>
  <line x1="150" y1="74" x2="150" y2="106" stroke="#334155" stroke-width="2"/>
  <text x="174" y="66" font-family="sans-serif" font-size="13" font-weight="bold" fill="#047857">C</text>
  <text x="174" y="84" font-family="sans-serif" font-size="11" fill="#334155">Z_C = ?</text>
  <line x1="232" y1="68" x2="322" y2="68" stroke="#475569" stroke-width="1.6"/>
  <path d="M 316 63 L 324 68 L 316 73 z" fill="#475569"/>
  <text x="236" y="58" font-family="sans-serif" font-size="11" fill="#334155">ω → 0</text>
  <text x="236" y="88" font-family="sans-serif" font-size="10.5" fill="#5f626b">直流</text>
  <text x="318" y="58" text-anchor="end" font-family="sans-serif" font-size="11" fill="#334155">ω → ∞</text>
  <text x="318" y="88" text-anchor="end" font-family="sans-serif" font-size="10.5" fill="#5f626b">高频</text>
  <text x="170" y="122" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#5f626b">谁超前谁？极端频率下各像什么？</text>
</svg>`;

/** Q2 · a two-terminal network with Z = 6 − j8 Ω */
export const SVG_Q2 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 120" width="340" height="120" role="img" aria-label="复阻抗为 6 减 j8 欧的二端网络">
  <rect x="0" y="0" width="340" height="120" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <circle cx="40" cy="40" r="4" fill="#1f2a44"/>
  <circle cx="40" cy="84" r="4" fill="#1f2a44"/>
  <line x1="40" y1="40" x2="110" y2="40" stroke="#334155" stroke-width="2"/>
  <line x1="40" y1="84" x2="110" y2="84" stroke="#334155" stroke-width="2"/>
  <rect x="110" y="24" width="110" height="76" rx="8" fill="#ffffff" stroke="#7c3aed" stroke-width="2"/>
  <text x="165" y="58" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#6d28d9">二端网络</text>
  <text x="165" y="80" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2a44">Z = 6 − j8 Ω</text>
  <text x="236" y="50" font-family="sans-serif" font-size="12" fill="#334155">Y = 1/Z</text>
  <text x="236" y="72" font-family="sans-serif" font-size="12" fill="#334155">= G + jB = ?</text>
  <text x="170" y="114" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#5f626b">Z 是相量吗？感性还是容性？</text>
</svg>`;

/** Q3 · a current source into L ∥ R */
export const SVG_Q3 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 140" width="340" height="140" role="img" aria-label="电流源注入电感与电阻并联电路">
  <defs>
    <marker id="w52q3a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="340" height="140" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <circle cx="60" cy="72" r="20" fill="#ffffff" stroke="#b45309" stroke-width="2"/>
  <line x1="60" y1="84" x2="60" y2="60" stroke="#b45309" stroke-width="2" marker-end="url(#w52q3a)"/>
  <text x="60" y="114" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#b45309">I_s = 5∠0° A</text>
  <polyline points="60,52 60,24 250,24" fill="none" stroke="#334155" stroke-width="2"/>
  <polyline points="60,92 60,124 250,124 250,24" fill="none" stroke="#334155" stroke-width="2"/>
  <line x1="160" y1="24" x2="160" y2="44" stroke="#334155" stroke-width="2"/>
  <path d="M 160 44 C 172 44 172 56 160 56 C 172 56 172 68 160 68 C 172 68 172 80 160 80 C 172 80 172 92 160 92" fill="none" stroke="#7c3aed" stroke-width="2.4"/>
  <line x1="160" y1="92" x2="160" y2="124" stroke="#334155" stroke-width="2"/>
  <text x="178" y="64" font-family="sans-serif" font-size="12" font-weight="bold" fill="#6d28d9">Z_L = j10 Ω</text>
  <line x1="146" y1="40" x2="146" y2="70" stroke="#2563eb" stroke-width="2" marker-end="url(#w52q3a)"/>
  <text x="140" y="60" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1d4ed8">I_L = ?</text>
  <polyline points="250,40 244,46 256,52 244,58 256,64 244,70 256,76 244,82 250,88" fill="none" stroke="#db2777" stroke-width="2.4"/>
  <text x="262" y="68" font-family="sans-serif" font-size="12" font-weight="bold" fill="#be185d">Z_R = 10 Ω</text>
</svg>`;

/** Q4 · the scope reading at 2 kHz */
export const SVG_Q4 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 140" width="340" height="140" role="img" aria-label="2 kHz 下示波器 CH2 比 CH1 晚 62.5 微秒">
  <defs>
    <marker id="w52q4a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#be123c"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="340" height="140" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <rect x="20" y="24" width="300" height="96" fill="#ffffff" stroke="#cbd5e1"/>
  <line x1="20" y1="72" x2="320" y2="72" stroke="#e2e8f0"/>
  <path d="M20,72 C40,40 60,40 80,40 C100,40 120,72 140,72 C160,72 180,104 200,104 C220,104 240,72 260,72 C280,40 300,40 320,40" fill="none" stroke="#d97706" stroke-width="2.2"/>
  <path d="M20,96 C35,80 55,52 95,52 C120,52 135,72 155,72 C175,72 185,92 215,92 C240,92 255,72 275,72 C295,72 305,58 320,53" fill="none" stroke="#0284c7" stroke-width="2.2"/>
  <line x1="80" y1="30" x2="80" y2="112" stroke="#a16207" stroke-dasharray="3 3"/>
  <line x1="95" y1="30" x2="95" y2="112" stroke="#0369a1" stroke-dasharray="3 3"/>
  <line x1="80" y1="32" x2="95" y2="32" stroke="#be123c" stroke-width="1.6" marker-start="url(#w52q4a)" marker-end="url(#w52q4a)"/>
  <text x="100" y="36" font-family="sans-serif" font-size="11" font-weight="bold" fill="#be123c">Δt = 62.5 µs（CH2 右移）</text>
  <text x="24" y="16" font-family="sans-serif" font-size="11" font-weight="bold" fill="#b45309">CH1 v_in</text>
  <text x="96" y="16" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0369a1">CH2 v_C</text>
  <text x="316" y="16" text-anchor="end" font-family="sans-serif" font-size="11" fill="#334155">f = 2 kHz · Δφ = ?</text>
  <text x="170" y="134" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#5f626b">想改看 v_R(t)，CH2 的黑色地夹能挪吗？</text>
</svg>`;
