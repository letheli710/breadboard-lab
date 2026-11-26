// The lesson sheet's inline SVGs (docs/lessons/W5-L1.md), copied verbatim by a script: the five act
// diagrams (figures 1.1, 2.1, 3.1, 4.1, 5.1) and the five step diagrams of the guided example. They
// are drawn for a dark canvas; svgs.ts fixes them and recolours them for the light theme.

export const SHEET_ACT1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 340" width="820" height="340">
  <defs>
    <marker id="arr-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
    <marker id="arr-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8"/>
    </marker>
  </defs>

  <rect width="820" height="340" rx="12" fill="#0f172a"/>
  <text x="24" y="30" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="bold">图 1.1：逆时针旋转矢量与右侧时域余弦波实时投影关系</text>
  <text x="24" y="50" fill="#94a3b8" font-family="sans-serif" font-size="12">左侧旋转指针长度 = V_m，角速度 = ω，t=0 初相角 = φ；右侧实时记录投影值 v(t) = V_m cos(ωt + φ)</text>

  <!-- Left: Rotating Phasor Circle -->
  <g transform="translate(155, 195)">
    <!-- Axes -->
    <line x1="-115" y1="0" x2="115" y2="0" stroke="#475569" stroke-width="1.5" marker-end="url(#arr-slate)"/>
    <line x1="0" y1="115" x2="0" y2="-115" stroke="#475569" stroke-width="1.5" marker-end="url(#arr-slate)"/>
    <text x="98" y="16" fill="#94a3b8" font-family="sans-serif" font-size="11">Re</text>
    <text x="8" y="-102" fill="#94a3b8" font-family="sans-serif" font-size="11">Im (j)</text>

    <!-- Circle -->
    <circle cx="0" cy="0" r="85" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="5,4"/>

    <!-- Counter-clockwise rotation arc -->
    <path d="M 68 -72 A 98 98 0 0 0 18 -96" fill="none" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr-amber)"/>
    <text x="45" y="-92" fill="#f59e0b" font-family="sans-serif" font-size="12" font-weight="bold">ω (逆时针)</text>

    <!-- Initial angle phi = 30 deg (reference dashed vector) -->
    <line x1="0" y1="0" x2="73.6" y2="-42.5" stroke="#64748b" stroke-width="1.8" stroke-dasharray="4,3"/>
    <text x="76" y="-44" fill="#94a3b8" font-family="sans-serif" font-size="11">t=0 (φ)</text>

    <!-- Active rotating vector at angle = 55 deg -->
    <line x1="0" y1="0" x2="48.8" y2="-69.6" stroke="#38bdf8" stroke-width="3" marker-end="url(#arr-cyan)"/>
    <circle cx="48.8" cy="-69.6" r="4.5" fill="#38bdf8"/>
    <text x="12" y="-50" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">V_m</text>

    <!-- Angle arc for omega*t + phi -->
    <path d="M 30 0 A 30 30 0 0 0 17.2 -24.6" fill="none" stroke="#38bdf8" stroke-width="1.8"/>
    <text x="33" y="-10" fill="#bae6fd" font-family="sans-serif" font-size="11">ωt+φ</text>

    <!-- Projection onto vertical/horizontal visual bridge -->
    <line x1="48.8" y1="-69.6" x2="48.8" y2="0" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3,3"/>
    <line x1="0" y1="0" x2="48.8" y2="0" stroke="#22c55e" stroke-width="3.5"/>
    <text x="4" y="16" fill="#4ade80" font-family="sans-serif" font-size="11">V_m cos(ωt+φ)</text>
  </g>

  <!-- Projection Bridge Dashed Line -->
  <line x1="203.8" y1="125.4" x2="365" y2="125.4" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5,5" opacity="0.75"/>
  <text x="275" y="118" fill="#7dd3fc" font-family="sans-serif" font-size="11" text-anchor="middle">实时投影映射</text>

  <!-- Right: Time-Domain Cosine Wave -->
  <g transform="translate(330, 195)">
    <!-- Axes -->
    <line x1="-15" y1="0" x2="455" y2="0" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr-slate)"/>
    <line x1="0" y1="115" x2="0" y2="-115" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr-slate)"/>
    <text x="442" y="18" fill="#cbd5e1" font-family="sans-serif" font-size="12">ωt</text>
    <text x="10" y="-102" fill="#cbd5e1" font-family="sans-serif" font-size="12">v(t)</text>

    <!-- +Vm and -Vm reference lines -->
    <line x1="0" y1="-85" x2="430" y2="-85" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
    <line x1="0" y1="85" x2="430" y2="85" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
    <text x="-30" y="-81" fill="#94a3b8" font-family="sans-serif" font-size="11">+V_m</text>
    <text x="-30" y="89" fill="#94a3b8" font-family="sans-serif" font-size="11">−V_m</text>

    <!-- Cosine wave v(t) = 85 cos(theta + 30 deg), shifted left by 30 deg (30px = 30 deg, 360px = 2pi) -->
    <!-- At x=0 (theta=0): y = -85*cos(30) = -73.6 -->
    <!-- Peak at x=-30 (not drawn, next peak at x=330): y = -85 -->
    <!-- Zero at x=60 (theta=60): y=0; Trough at x=150: y=+85; Zero at x=240: y=0; Peak at x=330: y=-85; Zero at x=420: y=0 -->
    <path d="M 0 -73.6 C 25 -62, 45 -32, 60 0 C 85 52, 118 85, 150 85 C 182 85, 215 52, 240 0 C 265 -52, 298 -85, 330 -85 C 362 -85, 395 -52, 420 0"
          fill="none" stroke="#38bdf8" stroke-width="3"/>

    <!-- Highlight current sample point at x=35 (approx y=-48.8? Wait: draw point on curve at x=25, y=-69.6 for visual alignment) -->
    <circle cx="35" cy="-48.8" r="4.5" fill="#22c55e"/>
    <line x1="35" y1="0" x2="35" y2="-48.8" stroke="#22c55e" stroke-width="2" stroke-dasharray="3,2"/>

    <!-- Mark t=0 initial value -->
    <circle cx="0" cy="-73.6" r="4" fill="#f59e0b"/>
    <text x="6" y="-68" fill="#fbbf24" font-family="sans-serif" font-size="11">v(0) = V_m cos(φ)</text>

    <!-- Period T bracket between two zeros (60 to 420 = 360px = T) -->
    <line x1="60" y1="102" x2="420" y2="102" stroke="#f59e0b" stroke-width="1.5" marker-start="url(#arr-amber)" marker-end="url(#arr-amber)"/>
    <line x1="60" y1="0" x2="60" y2="108" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3"/>
    <line x1="420" y1="0" x2="420" y2="108" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3"/>
    <text x="240" y="97" fill="#fbbf24" font-family="sans-serif" font-size="12" text-anchor="middle">一个完整周期 T = 2π / ω</text>
  </g>
</svg>`;

export const SHEET_ACT2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 330" width="820" height="330">
  <defs>
    <marker id="arr-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4ade80"/>
    </marker>
    <marker id="arr-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e"/>
    </marker>
    <marker id="arr-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-y" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
  </defs>

  <rect width="820" height="330" rx="12" fill="#0f172a"/>
  <text x="24" y="30" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="bold">图 2.1：sin ↔ cos 统一化简三角罗盘与相位差游标尺（Sadiku Example 9.2）</text>

  <!-- Left: Trig Compass -->
  <g transform="translate(170, 185)">
    <circle cx="0" cy="0" r="88" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <!-- 4 cardinal axes -->
    <line x1="-108" y1="0" x2="108" y2="0" stroke="#475569" stroke-width="1.5"/>
    <line x1="0" y1="-108" x2="0" y2="108" stroke="#475569" stroke-width="1.5"/>

    <!-- Labels for +cos, -sin, -cos, +sin -->
    <text x="115" y="5" fill="#4ade80" font-family="sans-serif" font-size="13" font-weight="bold">+cos (0°)</text>
    <text x="0" y="-114" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">−sin (+90°)</text>
    <text x="-115" y="5" fill="#f43f5e" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="end">−cos (±180°)</text>
    <text x="0" y="126" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">+sin (−90°)</text>

    <!-- Curved arrows showing shift to +cos -->
    <path d="M 5 74 A 74 74 0 0 0 74 5" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arr-y)"/>
    <text x="48" y="54" fill="#fde68a" font-family="sans-serif" font-size="11">−90°</text>

    <path d="M 5 -74 A 74 74 0 0 1 74 -5" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arr-c)"/>
    <text x="48" y="-46" fill="#bae6fd" font-family="sans-serif" font-size="11">+90°</text>

    <path d="M -72 -12 A 74 74 0 0 1 68 -26" fill="none" stroke="#f43f5e" stroke-width="1.8" stroke-dasharray="3,3" marker-end="url(#arr-r)"/>
    <text x="-48" y="-48" fill="#fda4af" font-family="sans-serif" font-size="11">±180°</text>
  </g>

  <!-- Right: Phase Number Line & Vectors for Sadiku Ex 9.2 -->
  <g transform="translate(385, 85)">
    <rect x="0" y="0" width="405" height="215" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="18" y="28" fill="#e2e8f0" font-family="sans-serif" font-size="13" font-weight="bold">统一为正余弦后的相位差标尺</text>

    <!-- v1 and v2 equations -->
    <text x="18" y="56" fill="#f43f5e" font-family="sans-serif" font-size="12">v₁(t) = −10cos(ωt+50°)  ⇒  10cos(ωt − 130°)</text>
    <text x="18" y="78" fill="#38bdf8" font-family="sans-serif" font-size="12">v₂(t) = +12sin(ωt−10°)  ⇒  12cos(ωt − 100°)</text>

    <!-- Phase ruler from -180 to 0 deg -->
    <line x1="25" y1="138" x2="380" y2="138" stroke="#94a3b8" stroke-width="2"/>
    <!-- Ticks: -180 (x=35), -130 (x=130), -100 (x=187), -90 (x=206), 0 (x=370) -->
    <line x1="35" y1="132" x2="35" y2="144" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="35" y="160" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">−180°</text>

    <line x1="130" y1="126" x2="130" y2="148" stroke="#f43f5e" stroke-width="3"/>
    <circle cx="130" cy="138" r="5" fill="#f43f5e"/>
    <text x="130" y="166" fill="#f43f5e" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">φ₁ = −130°</text>

    <line x1="187" y1="126" x2="187" y2="148" stroke="#38bdf8" stroke-width="3"/>
    <circle cx="187" cy="138" r="5" fill="#38bdf8"/>
    <text x="200" y="166" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">φ₂ = −100°</text>

    <line x1="365" y1="132" x2="365" y2="144" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="365" y="160" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">0°</text>

    <!-- Delta phi arrow -->
    <line x1="136" y1="115" x2="181" y2="115" stroke="#4ade80" stroke-width="2.5" marker-end="url(#arr-g)"/>
    <text x="158" y="106" fill="#4ade80" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Δφ = +30°</text>

    <!-- Conclusion pill -->
    <rect x="18" y="178" width="368" height="26" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
    <text x="202" y="196" fill="#6ee7b7" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">结论：φ₂ &gt; φ₁，故 v₂ 超前 v₁ 30°（v₁ 滞后 v₂ 30°）</text>
  </g>
</svg>`;

export const SHEET_ACT3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 350" width="820" height="350">
  <defs>
    <marker id="arr-w" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8"/>
    </marker>
    <marker id="arr-q1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4ade80"/>
    </marker>
    <marker id="arr-q2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e"/>
    </marker>
    <marker id="arr-q3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
    <marker id="arr-q4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
  </defs>

  <rect width="820" height="350" rx="12" fill="#0f172a"/>
  <text x="24" y="30" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="bold">图 3.1：四象限复平面极坐标标注与 x &lt; 0 象限校正警示</text>

  <!-- Left: Complex Plane -->
  <g transform="translate(230, 190)">
    <!-- Quadrant highlight boxes -->
    <rect x="-155" y="-125" width="155" height="125" fill="#f43f5e" opacity="0.07"/>
    <rect x="-155" y="0" width="155" height="125" fill="#fbbf24" opacity="0.07"/>

    <!-- Grid lines -->
    <line x1="-165" y1="0" x2="165" y2="0" stroke="#64748b" stroke-width="1.8" marker-end="url(#arr-w)"/>
    <line x1="0" y1="135" x2="0" y2="-135" stroke="#64748b" stroke-width="1.8" marker-end="url(#arr-w)"/>
    <text x="150" y="18" fill="#cbd5e1" font-family="sans-serif" font-size="12">Re (x)</text>
    <text x="10" y="-122" fill="#cbd5e1" font-family="sans-serif" font-size="12">Im (jy)</text>

    <!-- Quadrant labels -->
    <text x="125" y="-105" fill="#475569" font-family="sans-serif" font-size="13" font-weight="bold">Q1</text>
    <text x="-145" y="-105" fill="#f43f5e" font-family="sans-serif" font-size="13" font-weight="bold">Q2 (+180°)</text>
    <text x="-145" y="115" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="bold">Q3 (−180°)</text>
    <text x="125" y="115" fill="#475569" font-family="sans-serif" font-size="13" font-weight="bold">Q4</text>

    <!-- Vector Q1: 3 + j4 (scale 18px/unit -> 54, -72) -->
    <line x1="0" y1="0" x2="54" y2="-72" stroke="#4ade80" stroke-width="2.6" marker-end="url(#arr-q1)"/>
    <text x="60" y="-75" fill="#4ade80" font-family="sans-serif" font-size="11" font-weight="bold">3+j4 = 5∠+53.13°</text>

    <!-- Vector Q2: Z1 = -3 + j4 (-54, -72) -->
    <line x1="0" y1="0" x2="-54" y2="-72" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-q2)"/>
    <line x1="-54" y1="-72" x2="-54" y2="0" stroke="#f43f5e" stroke-width="1.2" stroke-dasharray="3,3"/>
    <text x="-152" y="-78" fill="#fda4af" font-family="sans-serif" font-size="11" font-weight="bold">Z₁ = −3+j4</text>
    <text x="-152" y="-63" fill="#f43f5e" font-family="sans-serif" font-size="11" font-weight="bold">= 5∠+126.87°</text>
    <!-- Angle arc for 126.87 deg -->
    <path d="M 32 0 A 32 32 0 0 0 -19.2 -25.6" fill="none" stroke="#f43f5e" stroke-width="1.8"/>

    <!-- Vector Q3: Z2 = -6 - j8 (scaled to -78, +104 for clarity) -->
    <line x1="0" y1="0" x2="-78" y2="104" stroke="#fbbf24" stroke-width="3" marker-end="url(#arr-q3)"/>
    <line x1="-78" y1="104" x2="-78" y2="0" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="3,3"/>
    <text x="-152" y="80" fill="#fde68a" font-family="sans-serif" font-size="11" font-weight="bold">Z₂ = −6−j8</text>
    <text x="-152" y="95" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold">= 10∠−126.87°</text>
    <!-- Angle arc for -126.87 deg -->
    <path d="M 26 0 A 26 26 0 0 1 -15.6 20.8" fill="none" stroke="#fbbf24" stroke-width="1.8"/>

    <!-- Vector Q4: 3 - j4 (54, 72) -->
    <line x1="0" y1="0" x2="54" y2="72" stroke="#38bdf8" stroke-width="2.6" marker-end="url(#arr-q4)"/>
    <text x="58" y="82" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">3−j4 = 5∠−53.13°</text>
  </g>

  <!-- Right: Quick Reference Card -->
  <g transform="translate(445, 65)">
    <rect x="0" y="0" width="350" height="250" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="18" y="28" fill="#e2e8f0" font-family="sans-serif" font-size="14" font-weight="bold">相量四则运算黄金法则</text>

    <rect x="16" y="42" width="318" height="58" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
    <text x="26" y="63" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">加减法 → 必须转直角坐标 (x + jy)</text>
    <text x="26" y="84" fill="#cbd5e1" font-family="sans-serif" font-size="12">Z₁ ± Z₂ = (x₁ ± x₂) + j(y₁ ± y₂)</text>

    <rect x="16" y="110" width="318" height="68" rx="6" fill="#0f172a" stroke="#4ade80" stroke-width="1"/>
    <text x="26" y="131" fill="#4ade80" font-family="sans-serif" font-size="12" font-weight="bold">乘除法 → 必须转极坐标 (r∠φ)</text>
    <text x="26" y="151" fill="#cbd5e1" font-family="sans-serif" font-size="12">Z₁ · Z₂ = (r₁r₂)∠(φ₁ + φ₂)</text>
    <text x="26" y="170" fill="#cbd5e1" font-family="sans-serif" font-size="12">Z₁ / Z₂ = (r₁/r₂)∠(φ₁ − φ₂)</text>

    <rect x="16" y="188" width="318" height="48" rx="6" fill="#450a0a" stroke="#f43f5e" stroke-width="1"/>
    <text x="26" y="208" fill="#fda4af" font-family="sans-serif" font-size="12" font-weight="bold">⚠ 致命陷阱：x &lt; 0 时必须做象限校正</text>
    <text x="26" y="226" fill="#fecdd3" font-family="sans-serif" font-size="11">例：−3+j4 在 Q2，arctan(−4/3)=−53.13° → +180° = 126.87°</text>
  </g>
</svg>`;

export const SHEET_ACT4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 350" width="820" height="350">
  <defs>
    <marker id="arr-p1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-p2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
    <marker id="arr-psum" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4ade80"/>
    </marker>
    <marker id="arr-ax" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8"/>
    </marker>
  </defs>

  <rect width="820" height="350" rx="12" fill="#0f172a"/>
  <text x="24" y="30" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="bold">图 4.1：同频相量相加的矢量平行四边形合成图（Sadiku Example 9.6）</text>

  <!-- Left: Parallelogram on Complex Plane (scale: 32px per 1 A, origin at 220, 155) -->
  <g transform="translate(220, 155)">
    <!-- Axes -->
    <line x1="-150" y1="0" x2="180" y2="0" stroke="#475569" stroke-width="1.5" marker-end="url(#arr-ax)"/>
    <line x1="0" y1="175" x2="0" y2="-100" stroke="#475569" stroke-width="1.5" marker-end="url(#arr-ax)"/>
    <text x="165" y="16" fill="#94a3b8" font-family="sans-serif" font-size="11">Re (A)</text>
    <text x="8" y="-88" fill="#94a3b8" font-family="sans-serif" font-size="11">Im (j A)</text>

    <!-- Coordinates (scale 30px/A):
         I1 = (3.4641, +2.0000) -> (103.9, -60.0)
         I2 = (-1.7101, -4.6985) -> (-51.3, +141.0)
         I_sum = (1.7540, -2.6985) -> (52.6, +81.0)
    -->
    <!-- Parallelogram dashed completion edges -->
    <polygon points="0,0 103.9,-60.0 52.6,81.0 -51.3,141.0" fill="#4ade80" opacity="0.08"/>
    <line x1="103.9" y1="-60.0" x2="52.6" y2="81.0" stroke="#f59e0b" stroke-width="1.6" stroke-dasharray="5,4"/>
    <line x1="-51.3" y1="141.0" x2="52.6" y2="81.0" stroke="#38bdf8" stroke-width="1.6" stroke-dasharray="5,4"/>

    <!-- Vector I1 -->
    <line x1="0" y1="0" x2="103.9" y2="-60.0" stroke="#38bdf8" stroke-width="3" marker-end="url(#arr-p1)"/>
    <text x="108" y="-65" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">I₁ = 4∠30°</text>
    <text x="108" y="-50" fill="#7dd3fc" font-family="sans-serif" font-size="11">(3.464 + j2.000)</text>

    <!-- Vector I2 -->
    <line x1="0" y1="0" x2="-51.3" y2="141.0" stroke="#f59e0b" stroke-width="3" marker-end="url(#arr-p2)"/>
    <text x="-148" y="135" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">I₂ = 5∠−110°</text>
    <text x="-148" y="150" fill="#fde68a" font-family="sans-serif" font-size="11">(−1.710 − j4.699)</text>

    <!-- Resultant Vector I_sum -->
    <line x1="0" y1="0" x2="52.6" y2="81.0" stroke="#4ade80" stroke-width="3.6" marker-end="url(#arr-psum)"/>
    <circle cx="52.6" cy="81.0" r="4" fill="#4ade80"/>
    <text x="64" y="88" fill="#4ade80" font-family="sans-serif" font-size="12" font-weight="bold">I = I₁ + I₂</text>
    <text x="64" y="104" fill="#86efac" font-family="sans-serif" font-size="11">= 3.218∠−56.98° A</text>

    <!-- Angle arc for -56.98 deg -->
    <path d="M 30 0 A 30 30 0 0 1 16.3 25.1" fill="none" stroke="#4ade80" stroke-width="1.8"/>
    <text x="34" y="22" fill="#86efac" font-family="sans-serif" font-size="10">−56.98°</text>
  </g>

  <!-- Right: Component Breakdown Box -->
  <g transform="translate(465, 65)">
    <rect x="0" y="0" width="330" height="250" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="18" y="28" fill="#e2e8f0" font-family="sans-serif" font-size="14" font-weight="bold">四步相量叠加流水线</text>

    <text x="18" y="58" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">① 统一正余弦</text>
    <text x="18" y="76" fill="#cbd5e1" font-family="sans-serif" font-size="11">i₂ = 5sin(ωt−20°) → 5cos(ωt−110°)</text>

    <text x="18" y="106" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">② 极坐标转直角坐标</text>
    <text x="18" y="124" fill="#cbd5e1" font-family="sans-serif" font-size="11">I₁ = 3.4641 + j2.0000 A</text>
    <text x="18" y="140" fill="#cbd5e1" font-family="sans-serif" font-size="11">I₂ = −1.7101 − j4.6985 A</text>

    <text x="18" y="170" fill="#4ade80" font-family="sans-serif" font-size="12" font-weight="bold">③ 分量分别求和</text>
    <text x="18" y="188" fill="#cbd5e1" font-family="sans-serif" font-size="11">I = (3.4641−1.7101) + j(2.0000−4.6985)</text>
    <text x="18" y="204" fill="#86efac" font-family="sans-serif" font-size="11">I = 1.7540 − j2.6985 A (第四象限)</text>

    <rect x="16" y="216" width="298" height="24" rx="5" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
    <text x="165" y="232" fill="#6ee7b7" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">④ 还原：i(t) = 3.218 cos(ωt − 56.98°) A</text>
  </g>
</svg>`;

export const SHEET_ACT5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 340" width="820" height="340">
  <defs>
    <marker id="arr-base" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-diff" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e"/>
    </marker>
    <marker id="arr-int" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
    <marker id="arr-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8"/>
    </marker>
  </defs>

  <rect width="820" height="340" rx="12" fill="#0f172a"/>
  <text x="24" y="30" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="bold">图 5.1：复平面微积分旋转算子（求导 ×jω 逆时针 +90°，积分 ÷jω 顺时针 −90°）</text>

  <!-- Left: Complex Plane Operator Rotation -->
  <g transform="translate(220, 190)">
    <line x1="-150" y1="0" x2="155" y2="0" stroke="#475569" stroke-width="1.5" marker-end="url(#arr-gray)"/>
    <line x1="0" y1="125" x2="0" y2="-130" stroke="#475569" stroke-width="1.5" marker-end="url(#arr-gray)"/>
    <text x="142" y="16" fill="#94a3b8" font-family="sans-serif" font-size="11">Re</text>
    <text x="8" y="-118" fill="#94a3b8" font-family="sans-serif" font-size="11">Im (j)</text>

    <!-- Base phasor V at +30 deg, length 75 -> (65.0, -37.5) -->
    <line x1="0" y1="0" x2="65.0" y2="-37.5" stroke="#38bdf8" stroke-width="3.2" marker-end="url(#arr-base)"/>
    <text x="72" y="-36" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">V = V_m∠φ</text>

    <!-- Derivative phasor j*omega*V at +120 deg, length 115 -> (-57.5, -99.6) -->
    <line x1="0" y1="0" x2="-57.5" y2="-99.6" stroke="#f43f5e" stroke-width="3.2" marker-end="url(#arr-diff)"/>
    <text x="-148" y="-98" fill="#f43f5e" font-family="sans-serif" font-size="12" font-weight="bold">jωV (求导)</text>
    <text x="-148" y="-82" fill="#fda4af" font-family="sans-serif" font-size="11">= ωV_m∠(φ+90°)</text>

    <!-- Integral phasor V/(j*omega) at -60 deg, length 55 -> (27.5, +47.6) -->
    <line x1="0" y1="0" x2="27.5" y2="47.6" stroke="#fbbf24" stroke-width="3.2" marker-end="url(#arr-int)"/>
    <text x="36" y="58" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">V/(jω) (积分)</text>
    <text x="36" y="74" fill="#fde68a" font-family="sans-serif" font-size="11">= (V_m/ω)∠(φ−90°)</text>

    <!-- +90 deg CCW arc -->
    <path d="M 41.6 -24.0 A 48 48 0 0 0 -24.0 -41.6" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arr-diff)"/>
    <text x="12" y="-52" fill="#fda4af" font-family="sans-serif" font-size="11" font-weight="bold">+90°</text>

    <!-- -90 deg CW arc -->
    <path d="M 38.1 -22.0 A 44 44 0 0 1 22.0 38.1" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arr-int)"/>
    <text x="48" y="16" fill="#fde68a" font-family="sans-serif" font-size="11" font-weight="bold">−90°</text>
  </g>

  <!-- Right: Time Domain <-> Phasor Domain Dictionary -->
  <g transform="translate(430, 62)">
    <rect x="0" y="0" width="365" height="248" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="18" y="28" fill="#e2e8f0" font-family="sans-serif" font-size="14" font-weight="bold">时域 ↔ 相量域“降维字典”</text>

    <rect x="16" y="42" width="333" height="44" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
    <text x="26" y="69" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">v(t) = V_m cos(ωt+φ)   ↔   V = V_m∠φ</text>

    <rect x="16" y="96" width="333" height="44" rx="6" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
    <text x="26" y="123" fill="#fda4af" font-family="sans-serif" font-size="12" font-weight="bold">dv(t)/dt   ↔   jωV   (模×ω，角+90°)</text>

    <rect x="16" y="150" width="333" height="44" rx="6" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
    <text x="26" y="177" fill="#fde68a" font-family="sans-serif" font-size="12" font-weight="bold">∫ v(t) dt   ↔   V/(jω) = −j(V/ω)   (角−90°)</text>

    <rect x="16" y="204" width="333" height="32" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
    <text x="182" y="224" fill="#6ee7b7" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">伏笔：下节课直接导出电感 Z_L=jωL 与电容 Z_C=1/(jωC)！</text>
  </g>
</svg>`;

export const SHEET_MINI1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect width="260" height="110" rx="8" fill="#0f172a"/><line x1="20" y1="55" x2="120" y2="55" stroke="#475569" stroke-width="1.2"/><line x1="70" y1="15" x2="70" y2="95" stroke="#475569" stroke-width="1.2"/><line x1="70" y1="55" x2="90" y2="90" stroke="#38bdf8" stroke-width="2.5"/><text x="95" y="88" fill="#38bdf8" font-family="sans-serif" font-size="11">20∠−60°</text><text x="140" y="45" fill="#fbbf24" font-family="sans-serif" font-size="11">sin → cos</text><text x="140" y="65" fill="#e2e8f0" font-family="sans-serif" font-size="11">30° − 90° = −60°</text></svg>`;

export const SHEET_MINI2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect width="260" height="110" rx="8" fill="#0f172a"/><text x="18" y="38" fill="#f43f5e" font-family="sans-serif" font-size="12" font-weight="bold">d/dt  →  × jω = × j4</text><text x="18" y="68" fill="#38bdf8" font-family="sans-serif" font-size="13">(6 + j8) V = 20∠−60°</text><text x="18" y="92" fill="#94a3b8" font-family="sans-serif" font-size="10">微分方程已退化为一元一次代数方程</text></svg>`;

export const SHEET_MINI3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect width="260" height="110" rx="8" fill="#0f172a"/><line x1="35" y1="88" x2="125" y2="88" stroke="#94a3b8" stroke-width="1.5"/><line x1="125" y1="88" x2="125" y2="24" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2"/><line x1="35" y1="88" x2="125" y2="24" stroke="#4ade80" stroke-width="2.5"/><text x="75" y="102" fill="#cbd5e1" font-family="sans-serif" font-size="10">Re = 6</text><text x="130" y="60" fill="#cbd5e1" font-family="sans-serif" font-size="10">Im = 8</text><text x="45" y="48" fill="#4ade80" font-family="sans-serif" font-size="11" font-weight="bold">10∠53.13°</text></svg>`;

export const SHEET_MINI4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect width="260" height="110" rx="8" fill="#0f172a"/><text x="18" y="38" fill="#cbd5e1" font-family="sans-serif" font-size="12">模相除：20 / 10 = 2</text><text x="18" y="64" fill="#cbd5e1" font-family="sans-serif" font-size="12">角相减：−60° − 53.13° = −113.13°</text><text x="18" y="92" fill="#4ade80" font-family="sans-serif" font-size="13" font-weight="bold">V = 2∠−113.13° V</text></svg>`;

export const SHEET_MINI5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110"><rect width="260" height="110" rx="8" fill="#064e3b"/><text x="130" y="42" fill="#6ee7b7" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">稳态特解验证通过！</text><text x="130" y="74" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">v(t) = 2 cos(4t − 113.13°) V</text></svg>`;
