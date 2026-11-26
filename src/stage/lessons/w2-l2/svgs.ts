// The act diagrams of the W2-L2 lesson sheet (docs/lessons/W2-L2.md) and the step diagrams of its
// guided-example JSON, copied from the sheet by a script (not retyped), drawn for a dark canvas;
// `light()` recolours them for the site's light theme (lightSvg). Before that, a few colours the
// shared mapping does not know yet are swapped for their mapped dark-palette neighbours:
// pale text #ffe4e6 / #fce7f3 / #ddd6fe (would stay pale on white) → #fda4af / #f472b6 / #c4b5fd,
// and the dark pill fills #881337 / #831843 (would stay dark) → #4c0519. Layout fixes (text only):
// act 2's "Rₚ = 5 Ω（内部并联…）" line moves up 4 px and drops to font-size 10 so it clears the Vₛ₂
// circle and the dashed Rp leads; act 3's "超节点内部循环…" header drops to 11 to stay inside the box.
// The self-test diagrams at the end are added (the sheet has none), in the same style.

import { lightSvg } from '../../svgTheme';

const PRE: [RegExp, string][] = [
  [/#ffe4e6/gi, '#fda4af'],
  [/#fce7f3/gi, '#f472b6'],
  [/#ddd6fe/gi, '#c4b5fd'],
  [/#881337/gi, '#4c0519'],
  [/#831843/gi, '#4c0519'],
];

/** dark sheet SVG → light theme */
export const light = (svg: string) => lightSvg(PRE.reduce((s, [re, to]) => s.replace(re, to), svg));

const SVG_ACT1_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300" width="640" height="300" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
    <marker id="arr-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="24" y="30" fill="#e2e8f0" font-size="15" font-weight="700">Case 1：接地电压源直接锁定节点电位 (v₁ = Vₛ = 10 V)</text>

  <!-- Wires -->
  <!-- Top rail: Node 1 (140,90) to R1 (230..330) to Node 2 (420,90) to Is branch (540,90) -->
  <line x1="140" y1="90" x2="230" y2="90" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="330" y1="90" x2="540" y2="90" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Bottom reference rail y=240 -->
  <line x1="140" y1="240" x2="540" y2="240" stroke="#94a3b8" stroke-width="2.5"/>

  <!-- Left branch: Voltage Source Vs = 10V between Node 1 and Ground -->
  <line x1="140" y1="90" x2="140" y2="135" stroke="#94a3b8" stroke-width="2.5"/>
  <circle cx="140" cy="165" r="30" fill="#1e293b" stroke="#f59e0b" stroke-width="2.5"/>
  <text x="140" y="156" fill="#f59e0b" font-size="18" font-weight="700" text-anchor="middle">+</text>
  <text x="140" y="184" fill="#f59e0b" font-size="18" font-weight="700" text-anchor="middle">−</text>
  <line x1="140" y1="195" x2="140" y2="240" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="96" y="160" fill="#fbbf24" font-size="14" font-weight="700" text-anchor="end">Vₛ</text>
  <text x="96" y="178" fill="#cbd5e1" font-size="13" text-anchor="end">10 V</text>

  <!-- Resistor R1 = 2 ohm (horizontal zigzag 230..330 at y=90) -->
  <polyline points="230,90 238,90 246,78 262,102 278,78 294,102 310,78 322,90 330,90" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="280" y="64" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="middle">R₁ = 2 Ω</text>

  <!-- Middle branch: R2 = 4 ohm between Node 2 (420,90) and Ground (420,240) -->
  <line x1="420" y1="90" x2="420" y2="120" stroke="#94a3b8" stroke-width="2.5"/>
  <polyline points="420,120 420,128 408,136 432,150 408,164 432,178 408,192 420,200 420,210" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <line x1="420" y1="210" x2="420" y2="240" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="396" y="169" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="end">R₂ = 4 Ω</text>

  <!-- Right branch: Current Source Is = 4 A pointing UP into Node 2 -->
  <line x1="540" y1="90" x2="540" y2="135" stroke="#94a3b8" stroke-width="2.5"/>
  <circle cx="540" cy="165" r="30" fill="#1e293b" stroke="#34d399" stroke-width="2.5"/>
  <line x1="540" y1="184" x2="540" y2="148" stroke="#34d399" stroke-width="2.5" marker-end="url(#arr-cyan)"/>
  <line x1="540" y1="195" x2="540" y2="240" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="580" y="160" fill="#34d399" font-size="14" font-weight="700">Iₛ</text>
  <text x="580" y="178" fill="#cbd5e1" font-size="13">4 A</text>

  <!-- Branch current arrows at Node 2 -->
  <line x1="392" y1="106" x2="352" y2="106" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr-amber)"/>
  <text x="372" y="123" fill="#fbbf24" font-size="12" text-anchor="middle">i₁</text>
  <line x1="442" y1="126" x2="442" y2="160" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr-amber)"/>
  <text x="456" y="148" fill="#fbbf24" font-size="12">i₂</text>

  <!-- Node dots and Lock Badge -->
  <circle cx="140" cy="90" r="6" fill="#f59e0b"/>
  <rect x="64" y="48" width="152" height="26" rx="6" fill="#451a03" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="140" y="65" fill="#fde68a" font-size="12" font-weight="700" text-anchor="middle">节点 1 锁定: v₁ = 10 V</text>

  <circle cx="420" cy="90" r="6" fill="#38bdf8"/>
  <text x="420" y="72" fill="#e0f2fe" font-size="14" font-weight="700" text-anchor="middle">节点 2 (v₂)</text>

  <!-- Ground symbol at center of bottom rail -->
  <line x1="340" y1="240" x2="340" y2="258" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="322" y1="258" x2="358" y2="258" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="329" y1="266" x2="351" y2="266" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="336" y1="274" x2="344" y2="274" stroke="#94a3b8" stroke-width="2"/>
  <text x="372" y="270" fill="#94a3b8" font-size="12">参考地 (0 V)</text>
</svg>`;

const SVG_ACT2_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 340" width="720" height="340" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e"/>
    </marker>
    <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="24" y="28" fill="#e2e8f0" font-size="15" font-weight="700">Case 2：悬空电压源构成超节点（Supernode）—— 虚线闭合面与外边界电流</text>

  <!-- Supernode Dashed Closed Loop enclosing Node 2, Vs2, Rp, and Node 3 -->
  <rect x="278" y="54" width="264" height="132" rx="28" fill="#f43f5e" fill-opacity="0.09" stroke="#f43f5e" stroke-width="2.8" stroke-dasharray="9,6"/>
  <rect x="335" y="42" width="150" height="22" rx="6" fill="#881337" stroke="#f43f5e" stroke-width="1.2"/>
  <text x="410" y="57" fill="#ffe4e6" font-size="12" font-weight="700" text-anchor="middle">超节点 Supernode (2, 3)</text>

  <!-- Main horizontal wires -->
  <!-- Left Node 1 (95,140) to R1 (145..225) to Node 2 (305,140) -->
  <line x1="95" y1="140" x2="145" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="225" y1="140" x2="305" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Inside Supernode: Node 2 (305,140) to Vs2 (380..440) to Node 3 (515,140) -->
  <line x1="305" y1="140" x2="380" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="440" y1="140" x2="515" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Parallel Rp branch inside supernode at y=86 -->
  <polyline points="305,140 305,86 365,86" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/>
  <polyline points="455,86 515,86 515,140" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/>
  <!-- Node 3 (515,140) to Is branch (625,140) -->
  <line x1="515" y1="140" x2="625" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Ground rail y=285 -->
  <line x1="95" y1="285" x2="625" y2="285" stroke="#94a3b8" stroke-width="2.5"/>

  <!-- Left grounded Vs1 = 10V -->
  <line x1="95" y1="140" x2="95" y2="185" stroke="#94a3b8" stroke-width="2.5"/>
  <circle cx="95" cy="212" r="27" fill="#1e293b" stroke="#f59e0b" stroke-width="2.5"/>
  <text x="95" y="205" fill="#f59e0b" font-size="16" font-weight="700" text-anchor="middle">+</text>
  <text x="95" y="229" fill="#f59e0b" font-size="16" font-weight="700" text-anchor="middle">−</text>
  <line x1="95" y1="239" x2="95" y2="285" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="58" y="208" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="end">Vₛ₁</text>
  <text x="58" y="225" fill="#cbd5e1" font-size="12" text-anchor="end">10 V</text>

  <!-- R1 = 2 ohm -->
  <polyline points="145,140 153,140 160,129 173,151 186,129 199,151 212,129 220,140 225,140" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="185" y="118" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="middle">R₁ = 2 Ω</text>

  <!-- Parallel Resistor Rp = 5 ohm (inside supernode, faded) -->
  <polyline points="365,86 373,86 381,76 395,96 409,76 423,96 437,76 447,86 455,86" fill="none" stroke="#a78bfa" stroke-width="2.2" stroke-linejoin="round"/>
  <text x="410" y="110" fill="#c4b5fd" font-size="11.5" text-anchor="middle">Rₚ = 5 Ω（内部并联，外边界 KCL 可忽略）</text>

  <!-- Floating Voltage Source Vs2 = 5V (+ at left Node 2, - at right Node 3) -->
  <circle cx="410" cy="140" r="28" fill="#1e293b" stroke="#f59e0b" stroke-width="2.8"/>
  <text x="394" y="146" fill="#f59e0b" font-size="18" font-weight="700" text-anchor="middle">+</text>
  <text x="426" y="146" fill="#f59e0b" font-size="18" font-weight="700" text-anchor="middle">−</text>
  <text x="410" y="180" fill="#fde68a" font-size="12.5" font-weight="700" text-anchor="middle">Vₛ₂ = 5 V  (v₂ − v₃ = 5 V)</text>

  <!-- R2 = 4 ohm (Node 2 to Ground) -->
  <line x1="305" y1="140" x2="305" y2="195" stroke="#94a3b8" stroke-width="2.5"/>
  <polyline points="305,195 305,202 294,209 316,221 294,233 316,245 294,257 305,264 305,285" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="285" y="236" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="end">R₂ = 4 Ω</text>

  <!-- R3 = 3 ohm (Node 3 to Ground) -->
  <line x1="515" y1="140" x2="515" y2="195" stroke="#94a3b8" stroke-width="2.5"/>
  <polyline points="515,195 515,202 504,209 526,221 504,233 526,245 504,257 515,264 515,285" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="495" y="236" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="end">R₃ = 3 Ω</text>

  <!-- Right Current Source Is = 2 A entering Node 3 -->
  <line x1="625" y1="140" x2="625" y2="185" stroke="#94a3b8" stroke-width="2.5"/>
  <circle cx="625" cy="212" r="27" fill="#1e293b" stroke="#34d399" stroke-width="2.5"/>
  <line x1="625" y1="229" x2="625" y2="196" stroke="#34d399" stroke-width="2.5" marker-end="url(#arr-green)"/>
  <line x1="625" y1="239" x2="625" y2="285" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="662" y="208" fill="#34d399" font-size="13" font-weight="700">Iₛ</text>
  <text x="662" y="225" fill="#cbd5e1" font-size="12">2 A</text>

  <!-- Boundary-crossing current arrows -->
  <!-- i1 leaving supernode to left -->
  <line x1="274" y1="156" x2="238" y2="156" stroke="#f43f5e" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="256" y="174" fill="#fda4af" font-size="12" font-weight="700" text-anchor="middle">i₁ 流出</text>
  <!-- i2 leaving supernode downward through R2 -->
  <line x1="322" y1="175" x2="322" y2="212" stroke="#f43f5e" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="336" y="200" fill="#fda4af" font-size="12" font-weight="700">i₂ 流出</text>
  <!-- i3 leaving supernode downward through R3 -->
  <line x1="532" y1="175" x2="532" y2="212" stroke="#f43f5e" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="546" y="200" fill="#fda4af" font-size="12" font-weight="700">i₃ 流出</text>
  <!-- Is entering supernode from right -->
  <line x1="590" y1="124" x2="550" y2="124" stroke="#34d399" stroke-width="2.2" marker-end="url(#arr-green)"/>
  <text x="572" y="114" fill="#6ee7b7" font-size="12" font-weight="700" text-anchor="middle">Iₛ 流入</text>

  <!-- Node dots & labels -->
  <circle cx="95" cy="140" r="5.5" fill="#f59e0b"/>
  <text x="95" y="122" fill="#fde68a" font-size="13" font-weight="700" text-anchor="middle">v₁ = 10 V</text>
  <circle cx="305" cy="140" r="6" fill="#38bdf8"/>
  <text x="322" y="129" fill="#e0f2fe" font-size="13" font-weight="700">v₂</text>
  <circle cx="515" cy="140" r="6" fill="#38bdf8"/>
  <text x="498" y="129" fill="#e0f2fe" font-size="13" font-weight="700" text-anchor="end">v₃</text>

  <!-- Ground symbol -->
  <line x1="410" y1="285" x2="410" y2="303" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="392" y1="303" x2="428" y2="303" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="399" y1="311" x2="421" y2="311" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="406" y1="319" x2="414" y2="319" stroke="#94a3b8" stroke-width="2"/>
  <text x="442" y="314" fill="#94a3b8" font-size="12">参考地 (0 V)</text>
</svg>`;

const SVG_ACT3_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 270" width="700" height="270" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-sky" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
  </defs>

  <text x="24" y="28" fill="#e2e8f0" font-size="14.5" font-weight="700">求解结果与支路电流守恒全景图（v₁=10 V, v₂=8 V, v₃=3 V）</text>

  <!-- Supernode box -->
  <rect x="210" y="54" width="280" height="145" rx="22" fill="#f43f5e" fill-opacity="0.08" stroke="#f43f5e" stroke-width="2.4" stroke-dasharray="8,5"/>
  <text x="350" y="73" fill="#fda4af" font-size="12" font-weight="700" text-anchor="middle">超节点内部循环：i_Vs2 = 2 A（右→左），i_Rp = 1 A（左→右）</text>

  <!-- Node 1 box -->
  <rect x="34" y="108" width="90" height="44" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <text x="79" y="126" fill="#fde68a" font-size="12" font-weight="700" text-anchor="middle">节点 1</text>
  <text x="79" y="143" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">v₁ = 10 V</text>

  <!-- Arrow Node 1 -> Node 2 (1 A) -->
  <line x1="124" y1="130" x2="232" y2="130" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-sky)"/>
  <text x="176" y="120" fill="#7dd3fc" font-size="12" font-weight="700" text-anchor="middle">1 A 流入</text>
  <text x="176" y="148" fill="#94a3b8" font-size="11" text-anchor="middle">(R₁=2 Ω)</text>

  <!-- Node 2 circle -->
  <circle cx="256" cy="130" r="22" fill="#1e293b" stroke="#38bdf8" stroke-width="2.4"/>
  <text x="256" y="126" fill="#e0f2fe" font-size="11.5" font-weight="700" text-anchor="middle">节点 2</text>
  <text x="256" y="141" fill="#38bdf8" font-size="12.5" font-weight="700" text-anchor="middle">8 V</text>

  <!-- Node 3 circle -->
  <circle cx="444" cy="130" r="22" fill="#1e293b" stroke="#38bdf8" stroke-width="2.4"/>
  <text x="444" y="126" fill="#e0f2fe" font-size="11.5" font-weight="700" text-anchor="middle">节点 3</text>
  <text x="444" y="141" fill="#38bdf8" font-size="12.5" font-weight="700" text-anchor="middle">3 V</text>

  <!-- Internal Rp path (top, left->right 1 A) -->
  <line x1="278" y1="108" x2="418" y2="108" stroke="#c4b5fd" stroke-width="2" marker-end="url(#arr-sky)"/>
  <text x="350" y="100" fill="#c4b5fd" font-size="11.5" text-anchor="middle">Rₚ=5 Ω：i_Rp = 1 A →</text>

  <!-- Internal Vs2 path (bottom, right->left 2 A) -->
  <line x1="422" y1="154" x2="282" y2="154" stroke="#fbbf24" stroke-width="2.4" marker-end="url(#arr-gold)"/>
  <text x="350" y="176" fill="#fde68a" font-size="11.5" font-weight="700" text-anchor="middle">← Vₛ₂=5 V (+左−右)：i_Vs2 = 2 A</text>

  <!-- Downward arrows to ground -->
  <line x1="256" y1="152" x2="256" y2="230" stroke="#38bdf8" stroke-width="2.4" marker-end="url(#arr-sky)"/>
  <text x="256" y="250" fill="#7dd3fc" font-size="12" font-weight="700" text-anchor="middle">i₂ = 2 A → 地 (R₂=4 Ω)</text>

  <line x1="444" y1="152" x2="444" y2="230" stroke="#38bdf8" stroke-width="2.4" marker-end="url(#arr-sky)"/>
  <text x="444" y="250" fill="#7dd3fc" font-size="12" font-weight="700" text-anchor="middle">i₃ = 1 A → 地 (R₃=3 Ω)</text>

  <!-- Right incoming current Is = 2 A -->
  <line x1="590" y1="130" x2="472" y2="130" stroke="#34d399" stroke-width="2.5" marker-end="url(#arr-sky)"/>
  <rect x="590" y="108" width="84" height="44" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="2"/>
  <text x="632" y="126" fill="#a7f3d0" font-size="12" font-weight="700" text-anchor="middle">Iₛ = 2 A</text>
  <text x="632" y="143" fill="#6ee7b7" font-size="11.5" text-anchor="middle">流入节点 3</text>
</svg>`;

const SVG_ACT4_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 330" width="720" height="330" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-p4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399"/>
    </marker>
    <marker id="arr-ix" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
  </defs>

  <text x="24" y="28" fill="#e2e8f0" font-size="14.5" font-weight="700">进阶拓扑：含流控电压源（CCVS = 4iₓ）的超节点电路</text>

  <!-- Supernode (2, 3) dashed box -->
  <rect x="372" y="64" width="276" height="104" rx="26" fill="#ec4899" fill-opacity="0.10" stroke="#ec4899" stroke-width="2.6" stroke-dasharray="9,6"/>
  <rect x="424" y="52" width="172" height="22" rx="6" fill="#831843" stroke="#ec4899" stroke-width="1.2"/>
  <text x="510" y="67" fill="#fce7f3" font-size="11.5" font-weight="700" text-anchor="middle">受控源超节点 Supernode (2, 3)</text>

  <!-- Top wires -->
  <line x1="90" y1="120" x2="260" y2="120" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="340" y1="120" x2="475" y2="120" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="545" y1="120" x2="615" y2="120" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Bottom reference rail y=275 -->
  <line x1="90" y1="275" x2="615" y2="275" stroke="#94a3b8" stroke-width="2.5"/>

  <!-- Leftmost: Is1 = 4 A entering Node 1 -->
  <line x1="90" y1="120" x2="90" y2="170" stroke="#94a3b8" stroke-width="2.5"/>
  <circle cx="90" cy="197" r="27" fill="#1e293b" stroke="#34d399" stroke-width="2.5"/>
  <line x1="90" y1="214" x2="90" y2="181" stroke="#34d399" stroke-width="2.5" marker-end="url(#arr-p4)"/>
  <line x1="90" y1="224" x2="90" y2="275" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="54" y="194" fill="#34d399" font-size="13" font-weight="700" text-anchor="end">Iₛ₁</text>
  <text x="54" y="211" fill="#cbd5e1" font-size="12" text-anchor="end">4 A</text>

  <!-- R1 = 4 ohm (Node 1 to Ground) with ix arrow -->
  <line x1="200" y1="120" x2="200" y2="165" stroke="#94a3b8" stroke-width="2.5"/>
  <polyline points="200,165 200,173 189,180 211,192 189,204 211,216 189,228 200,235 200,275" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="180" y="206" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="end">R₁ = 4 Ω</text>
  <!-- ix control current arrow -->
  <line x1="220" y1="136" x2="220" y2="172" stroke="#fbbf24" stroke-width="2.4" marker-end="url(#arr-ix)"/>
  <text x="234" y="158" fill="#fde68a" font-size="13" font-weight="700">iₓ</text>

  <!-- R2 = 2 ohm (Node 1 to Node 2) -->
  <polyline points="260,120 268,120 275,109 288,131 301,109 314,131 327,109 334,120 340,120" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="300" y="98" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="middle">R₂ = 2 Ω</text>

  <!-- Dependent Voltage Source (Diamond): 4 ix (+ at Node 2 left, - at Node 3 right) -->
  <polygon points="510,88 545,120 510,152 475,120" fill="#1e293b" stroke="#f59e0b" stroke-width="2.8"/>
  <text x="495" y="126" fill="#f59e0b" font-size="16" font-weight="700" text-anchor="middle">+</text>
  <text x="526" y="126" fill="#f59e0b" font-size="16" font-weight="700" text-anchor="middle">−</text>
  <text x="510" y="164" fill="#fde68a" font-size="12.5" font-weight="700" text-anchor="middle">4iₓ  (v₂ − v₃ = 4iₓ)</text>

  <!-- R3 = 6 ohm (Node 2 to Ground) -->
  <line x1="402" y1="120" x2="402" y2="175" stroke="#94a3b8" stroke-width="2.5"/>
  <polyline points="402,175 402,182 391,189 413,201 391,213 413,225 391,237 402,244 402,275" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="382" y="218" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="end">R₃ = 6 Ω</text>

  <!-- R4 = 3 ohm (Node 3 to Ground) -->
  <line x1="615" y1="120" x2="615" y2="175" stroke="#94a3b8" stroke-width="2.5"/>
  <polyline points="615,175 615,182 604,189 626,201 604,213 626,225 604,237 615,244 615,275" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="595" y="218" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="end">R₄ = 3 Ω</text>

  <!-- Node dots & labels -->
  <circle cx="200" cy="120" r="6" fill="#38bdf8"/>
  <text x="200" y="102" fill="#e0f2fe" font-size="13.5" font-weight="700" text-anchor="middle">节点 1 (v₁)</text>
  <circle cx="402" cy="120" r="6" fill="#38bdf8"/>
  <text x="402" y="102" fill="#e0f2fe" font-size="13.5" font-weight="700" text-anchor="middle">v₂</text>
  <circle cx="615" cy="120" r="6" fill="#38bdf8"/>
  <text x="615" y="102" fill="#e0f2fe" font-size="13.5" font-weight="700" text-anchor="middle">v₃</text>

  <!-- Ground symbol -->
  <line x1="350" y1="275" x2="350" y2="292" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="332" y1="292" x2="368" y2="292" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="339" y1="300" x2="361" y2="300" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="346" y1="308" x2="354" y2="308" stroke="#94a3b8" stroke-width="2"/>
  <text x="380" y="303" fill="#94a3b8" font-size="12">参考地 (0 V)</text>
</svg>`;

const SVG_ACT5_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 320" width="680" height="320" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-s5g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399"/>
    </marker>
    <marker id="arr-s5a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
  </defs>

  <text x="24" y="28" fill="#e2e8f0" font-size="14.5" font-weight="700">苏格拉底引导例题：悬空电压源（−左 +右）与内部并联电阻 Rₚ</text>

  <!-- Supernode (1, 2) dashed contour -->
  <rect x="184" y="54" width="312" height="132" rx="28" fill="#f43f5e" fill-opacity="0.09" stroke="#f43f5e" stroke-width="2.6" stroke-dasharray="9,6"/>
  <rect x="260" y="42" width="160" height="22" rx="6" fill="#881337" stroke="#f43f5e" stroke-width="1.2"/>
  <text x="340" y="57" fill="#ffe4e6" font-size="12" font-weight="700" text-anchor="middle">超节点 Supernode (1, 2)</text>

  <!-- Main wires -->
  <line x1="90" y1="140" x2="310" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="370" y1="140" x2="590" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Parallel Rp wire at y=86 -->
  <polyline points="215,140 215,86 295,86" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/>
  <polyline points="385,86 465,86 465,140" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/>
  <!-- Ground rail y=275 -->
  <line x1="90" y1="275" x2="590" y2="275" stroke="#94a3b8" stroke-width="2.5"/>

  <!-- Leftmost Is1 = 6 A UP into Node 1 -->
  <line x1="90" y1="140" x2="90" y2="180" stroke="#94a3b8" stroke-width="2.5"/>
  <circle cx="90" cy="207" r="27" fill="#1e293b" stroke="#34d399" stroke-width="2.5"/>
  <line x1="90" y1="224" x2="90" y2="191" stroke="#34d399" stroke-width="2.5" marker-end="url(#arr-s5g)"/>
  <line x1="90" y1="234" x2="90" y2="275" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="54" y="204" fill="#34d399" font-size="13" font-weight="700" text-anchor="end">Iₛ₁</text>
  <text x="54" y="221" fill="#cbd5e1" font-size="12" text-anchor="end">6 A</text>

  <!-- R1 = 3 ohm (Node 1 to Ground) -->
  <line x1="215" y1="140" x2="215" y2="190" stroke="#94a3b8" stroke-width="2.5"/>
  <polyline points="215,190 215,197 204,204 226,216 204,228 226,240 204,252 215,259 215,275" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="195" y="232" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="end">R₁ = 3 Ω</text>

  <!-- Parallel Resistor Rp = 3 ohm -->
  <polyline points="295,86 303,86 311,76 325,96 339,76 353,96 367,76 377,86 385,86" fill="none" stroke="#a78bfa" stroke-width="2.2" stroke-linejoin="round"/>
  <text x="340" y="109" fill="#c4b5fd" font-size="12" text-anchor="middle">Rₚ = 3 Ω</text>

  <!-- Floating Voltage Source Vs = 3 V (- at left Node 1, + at right Node 2) -->
  <circle cx="340" cy="140" r="28" fill="#1e293b" stroke="#f59e0b" stroke-width="2.8"/>
  <text x="324" y="146" fill="#f59e0b" font-size="18" font-weight="700" text-anchor="middle">−</text>
  <text x="356" y="146" fill="#f59e0b" font-size="18" font-weight="700" text-anchor="middle">+</text>
  <text x="340" y="179" fill="#fde68a" font-size="12.5" font-weight="700" text-anchor="middle">Vₛ = 3 V  (iₛ →)</text>
  <line x1="255" y1="154" x2="294" y2="154" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr-s5a)"/>
  <text x="274" y="171" fill="#fbbf24" font-size="11.5" text-anchor="middle">iₛ</text>

  <!-- R2 = 6 ohm (Node 2 to Ground) -->
  <line x1="465" y1="140" x2="465" y2="190" stroke="#94a3b8" stroke-width="2.5"/>
  <polyline points="465,190 465,197 454,204 476,216 454,228 476,240 454,252 465,259 465,275" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="445" y="232" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="end">R₂ = 6 Ω</text>

  <!-- Rightmost Is2 = 1 A DOWN leaving Node 2 -->
  <line x1="590" y1="140" x2="590" y2="180" stroke="#94a3b8" stroke-width="2.5"/>
  <circle cx="590" cy="207" r="27" fill="#1e293b" stroke="#34d399" stroke-width="2.5"/>
  <line x1="590" y1="191" x2="590" y2="224" stroke="#34d399" stroke-width="2.5" marker-end="url(#arr-s5g)"/>
  <line x1="590" y1="234" x2="590" y2="275" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="626" y="204" fill="#34d399" font-size="13" font-weight="700">Iₛ₂</text>
  <text x="626" y="221" fill="#cbd5e1" font-size="12">1 A</text>

  <!-- Node dots -->
  <circle cx="215" cy="140" r="6" fill="#38bdf8"/>
  <text x="234" y="130" fill="#e0f2fe" font-size="13" font-weight="700">v₁</text>
  <circle cx="465" cy="140" r="6" fill="#38bdf8"/>
  <text x="446" y="130" fill="#e0f2fe" font-size="13" font-weight="700" text-anchor="end">v₂</text>

  <!-- Ground symbol -->
  <line x1="340" y1="275" x2="340" y2="291" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="322" y1="291" x2="358" y2="291" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="329" y1="299" x2="351" y2="299" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="336" y1="307" x2="344" y2="307" stroke="#94a3b8" stroke-width="2"/>
  <text x="370" y="302" fill="#94a3b8" font-size="12">参考地 (0 V)</text>
</svg>`;

const SVG_ACT6_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 210" width="700" height="210" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="24" y="28" fill="#e2e8f0" font-size="14.5" font-weight="700">超节点四大高频易错点雷达图（诊断测验知识锚点）</text>

  <!-- Card 1 -->
  <rect x="24" y="48" width="152" height="140" rx="10" fill="#1e293b" stroke="#f43f5e" stroke-width="1.8"/>
  <text x="100" y="72" fill="#fda4af" font-size="12.5" font-weight="700" text-anchor="middle">雷区 01：漏列 KVL</text>
  <text x="100" y="96" fill="#cbd5e1" font-size="11.5" text-anchor="middle">只列外边界 KCL</text>
  <text x="100" y="114" fill="#cbd5e1" font-size="11.5" text-anchor="middle">导致方程数 &lt; 未知数</text>
  <text x="100" y="148" fill="#34d399" font-size="11.5" font-weight="700" text-anchor="middle">口诀：每包 1 个电压源</text>
  <text x="100" y="166" fill="#34d399" font-size="11.5" font-weight="700" text-anchor="middle">必补 1 条内部 KVL</text>

  <!-- Card 2 -->
  <rect x="190" y="48" width="152" height="140" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="266" y="72" fill="#fde68a" font-size="12.5" font-weight="700" text-anchor="middle">雷区 02：极性写反</text>
  <text x="266" y="96" fill="#cbd5e1" font-size="11.5" text-anchor="middle">盲目习惯“左减右”</text>
  <text x="266" y="114" fill="#cbd5e1" font-size="11.5" text-anchor="middle">忽略 −左/+右 倒置</text>
  <text x="266" y="148" fill="#34d399" font-size="11.5" font-weight="700" text-anchor="middle">口诀：永远写</text>
  <text x="266" y="166" fill="#34d399" font-size="11.5" font-weight="700" text-anchor="middle">v(+) − v(−) = Vₛ</text>

  <!-- Card 3 -->
  <rect x="356" y="48" width="152" height="140" rx="10" fill="#1e293b" stroke="#a78bfa" stroke-width="1.8"/>
  <text x="432" y="72" fill="#ddd6fe" font-size="12.5" font-weight="700" text-anchor="middle">雷区 03：内阻误入 KCL</text>
  <text x="432" y="96" fill="#cbd5e1" font-size="11.5" text-anchor="middle">把内部并联 Rₚ 写进</text>
  <text x="432" y="114" fill="#cbd5e1" font-size="11.5" text-anchor="middle">外边界 KCL 方程</text>
  <text x="432" y="148" fill="#34d399" font-size="11.5" font-weight="700" text-anchor="middle">口诀：求电位时忽略 Rₚ</text>
  <text x="432" y="166" fill="#34d399" font-size="11.5" font-weight="700" text-anchor="middle">求电源电流时恢复 Rₚ</text>

  <!-- Card 4 -->
  <rect x="522" y="48" width="154" height="140" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="599" y="72" fill="#bae6fd" font-size="12.5" font-weight="700" text-anchor="middle">雷区 04：漏译控制量</text>
  <text x="599" y="96" fill="#cbd5e1" font-size="11.5" text-anchor="middle">受控源含 iₓ 或 vₓ</text>
  <text x="599" y="114" fill="#cbd5e1" font-size="11.5" text-anchor="middle">忘记换成节点电位</text>
  <text x="599" y="148" fill="#34d399" font-size="11.5" font-weight="700" text-anchor="middle">口诀：有受控源必补</text>
  <text x="599" y="166" fill="#34d399" font-size="11.5" font-weight="700" text-anchor="middle">控制量 → 节点电压式</text>
</svg>`;

const MINI_STEP1_DARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 90' width='300' height='90' style='background:#0f172a;border-radius:6px;'><rect x='45' y='12' width='210' height='66' rx='18' fill='#f43f5e' fill-opacity='0.14' stroke='#f43f5e' stroke-width='2' stroke-dasharray='6,4'/><circle cx='70' cy='50' r='5' fill='#38bdf8'/><circle cx='230' cy='50' r='5' fill='#38bdf8'/><line x1='70' y1='50' x2='130' y2='50' stroke='#94a3b8' stroke-width='2'/><circle cx='150' cy='50' r='18' fill='#1e293b' stroke='#f59e0b' stroke-width='2'/><text x='141' y='55' fill='#f59e0b' font-size='13' font-weight='700'>−</text><text x='156' y='55' fill='#f59e0b' font-size='13' font-weight='700'>+</text><line x1='170' y1='50' x2='230' y2='50' stroke='#94a3b8' stroke-width='2'/><text x='150' y='27' fill='#c4b5fd' font-size='11' text-anchor='middle'>Rₚ = 3 Ω（一并包入）</text></svg>`;

const MINI_STEP2_DARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 95' width='300' height='95' style='background:#0f172a;border-radius:6px;'><rect x='65' y='15' width='170' height='46' rx='14' fill='#f43f5e' fill-opacity='0.12' stroke='#f43f5e' stroke-width='2' stroke-dasharray='6,4'/><text x='150' y='43' fill='#ffe4e6' font-size='12' font-weight='700' text-anchor='middle'>Supernode (1, 2)</text><text x='14' y='42' fill='#34d399' font-size='11' font-weight='700'>6A →</text><text x='246' y='42' fill='#f43f5e' font-size='11' font-weight='700'>→ 1A</text><text x='105' y='80' fill='#38bdf8' font-size='11' text-anchor='middle'>↓ v₁/3</text><text x='195' y='80' fill='#38bdf8' font-size='11' text-anchor='middle'>↓ v₂/6</text></svg>`;

const MINI_STEP3_DARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 85' width='300' height='85' style='background:#0f172a;border-radius:6px;'><text x='52' y='48' fill='#e0f2fe' font-size='13' font-weight='700'>v₁</text><line x1='74' y1='43' x2='122' y2='43' stroke='#94a3b8' stroke-width='2'/><circle cx='150' cy='43' r='22' fill='#1e293b' stroke='#f59e0b' stroke-width='2.4'/><text x='139' y='49' fill='#f59e0b' font-size='16' font-weight='700'>−</text><text x='161' y='49' fill='#f59e0b' font-size='16' font-weight='700'>+</text><line x1='178' y1='43' x2='226' y2='43' stroke='#94a3b8' stroke-width='2'/><text x='236' y='48' fill='#e0f2fe' font-size='13' font-weight='700'>v₂</text><text x='150' y='78' fill='#fde68a' font-size='11.5' text-anchor='middle'>高电位(+) − 低电位(−) = 3 V</text></svg>`;

const MINI_STEP4_DARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 75' width='300' height='75' style='background:#0f172a;border-radius:6px;'><text x='150' y='30' fill='#e2e8f0' font-size='13' font-weight='700' text-anchor='middle'>2v₁ + (v₁ + 3) = 30</text><text x='150' y='56' fill='#38bdf8' font-size='13' font-weight='700' text-anchor='middle'>3v₁ = 27  ⇒  v₁ = ? ,  v₂ = ?</text></svg>`;

const MINI_STEP5_DARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 90' width='300' height='90' style='background:#0f172a;border-radius:6px;'><circle cx='150' cy='45' r='12' fill='#1e293b' stroke='#38bdf8' stroke-width='2'/><text x='150' y='49' fill='#e0f2fe' font-size='11' font-weight='700' text-anchor='middle'>1</text><text x='72' y='49' fill='#34d399' font-size='11' font-weight='700'>6A 流入 →</text><text x='150' y='82' fill='#38bdf8' font-size='11' text-anchor='middle'>↓ i_R1 = 9/3 = 3 A</text><text x='232' y='26' fill='#c4b5fd' font-size='11' text-anchor='middle'>← i_Rp = (12−9)/3 = 1 A</text><text x='232' y='52' fill='#fbbf24' font-size='11' font-weight='700' text-anchor='middle'>→ iₛ = ?</text></svg>`;

/* ------------------------------------------------------------- self-test diagrams (added, sheet style) */

const T = `font-family="system-ui, sans-serif"`;

/** Q1: a floating source between two non-reference nodes a, b, wrapped in the dashed closed surface. */
const SVG_Q1_DARK = `<svg viewBox="0 0 420 160" aria-label="悬空电压源与它两端的两个非参考节点，被虚线闭合面包住">
  <rect width="420" height="160" rx="10" fill="#0f172a"/>
  <text x="16" y="22" fill="#94a3b8" ${T} font-size="11" font-weight="600">Q1 · 悬空电压源 Vₛ 与它两端的两个非参考节点 a、b</text>
  <rect x="115" y="40" width="190" height="74" rx="22" fill="#f43f5e" fill-opacity="0.09" stroke="#f43f5e" stroke-width="2" stroke-dasharray="7,5"/>
  <line x1="24" y1="80" x2="50" y2="80" stroke="#94a3b8" stroke-width="2"/>
  <polyline points="50,80 55,80 60,73 68,87 76,73 84,87 90,80 95,80" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <line x1="95" y1="80" x2="192" y2="80" stroke="#94a3b8" stroke-width="2"/>
  <line x1="228" y1="80" x2="345" y2="80" stroke="#94a3b8" stroke-width="2"/>
  <polyline points="345,80 350,80 355,73 363,87 371,73 379,87 385,80 390,80" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <line x1="390" y1="80" x2="404" y2="80" stroke="#94a3b8" stroke-width="2"/>
  <line x1="140" y1="80" x2="140" y2="120" stroke="#94a3b8" stroke-width="2"/>
  <polyline points="140,120 140,124 133,128 147,134 133,140 147,146 140,150" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <line x1="280" y1="80" x2="280" y2="120" stroke="#94a3b8" stroke-width="2"/>
  <polyline points="280,120 280,124 273,128 287,134 273,140 287,146 280,150" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="210" cy="80" r="18" fill="#1e293b" stroke="#f59e0b" stroke-width="2.2"/>
  <text x="202" y="85" fill="#f59e0b" font-size="14" font-weight="700" text-anchor="middle" ${T}>+</text>
  <text x="219" y="85" fill="#f59e0b" font-size="14" font-weight="700" text-anchor="middle" ${T}>−</text>
  <text x="210" y="56" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle" ${T}>Vₛ</text>
  <circle cx="140" cy="80" r="5" fill="#38bdf8"/>
  <circle cx="280" cy="80" r="5" fill="#38bdf8"/>
  <text x="148" y="70" fill="#e2e8f0" font-size="12" font-weight="700" ${T}>a</text>
  <text x="272" y="70" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="end" ${T}>b</text>
  <text x="210" y="106" fill="#fda4af" font-size="10.5" font-weight="700" text-anchor="middle" ${T}>超节点 (a, b)</text>
</svg>`;

/** Q2: the 8 V source between nodes 2 and 3, − on node 2, + on node 3. */
const SVG_Q2_DARK = `<svg viewBox="0 0 420 140" aria-label="节点 2 与节点 3 之间的 8 V 悬空电压源，负极接节点 2，正极接节点 3">
  <rect width="420" height="140" rx="10" fill="#0f172a"/>
  <text x="16" y="22" fill="#94a3b8" ${T} font-size="11" font-weight="600">Q2 · 节点 2 与节点 3 之间的 8 V 悬空电压源</text>
  <line x1="60" y1="78" x2="186" y2="78" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="234" y1="78" x2="360" y2="78" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="110" y1="78" x2="110" y2="120" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4"/>
  <line x1="310" y1="78" x2="310" y2="120" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4"/>
  <line x1="40" y1="78" x2="60" y2="78" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4"/>
  <line x1="360" y1="78" x2="380" y2="78" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4"/>
  <circle cx="210" cy="78" r="24" fill="#1e293b" stroke="#f59e0b" stroke-width="2.4"/>
  <text x="199" y="84" fill="#f59e0b" font-size="16" font-weight="700" text-anchor="middle" ${T}>−</text>
  <text x="222" y="84" fill="#f59e0b" font-size="16" font-weight="700" text-anchor="middle" ${T}>+</text>
  <text x="210" y="122" fill="#fde68a" font-size="12" font-weight="700" text-anchor="middle" ${T}>8 V</text>
  <circle cx="110" cy="78" r="5.5" fill="#38bdf8"/>
  <circle cx="310" cy="78" r="5.5" fill="#38bdf8"/>
  <text x="110" y="62" fill="#e2e8f0" font-size="12.5" font-weight="700" text-anchor="middle" ${T}>节点 2 (v₂)</text>
  <text x="310" y="62" fill="#e2e8f0" font-size="12.5" font-weight="700" text-anchor="middle" ${T}>节点 3 (v₃)</text>
  <text x="210" y="134" fill="#94a3b8" font-size="10" text-anchor="middle" ${T}>虚线：接往电路其余部分</text>
</svg>`;

/** Q3: a 10 Ω resistor in parallel with a 5 V floating source, both inside the supernode. */
const SVG_Q3_DARK = `<svg viewBox="0 0 420 170" aria-label="10 欧电阻与 5 V 悬空电压源并联在节点 2、3 之间，都在超节点内部">
  <rect width="420" height="170" rx="10" fill="#0f172a"/>
  <text x="16" y="22" fill="#94a3b8" ${T} font-size="11" font-weight="600">Q3 · 10 Ω 与 5 V 悬空电压源并联在节点 2、3 之间</text>
  <rect x="96" y="36" width="228" height="112" rx="24" fill="#f43f5e" fill-opacity="0.09" stroke="#f43f5e" stroke-width="2" stroke-dasharray="7,5"/>
  <line x1="40" y1="112" x2="188" y2="112" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="232" y1="112" x2="380" y2="112" stroke="#94a3b8" stroke-width="2.2"/>
  <polyline points="130,112 130,62 175,62" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <polyline points="245,62 290,62 290,112" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <polyline points="175,62 181,62 187,53 197,71 207,53 217,71 227,53 237,71 240,62 245,62" fill="none" stroke="#a78bfa" stroke-width="2.2"/>
  <text x="210" y="88" fill="#c4b5fd" font-size="11.5" font-weight="700" text-anchor="middle" ${T}>10 Ω</text>
  <circle cx="210" cy="112" r="22" fill="#1e293b" stroke="#f59e0b" stroke-width="2.4"/>
  <text x="200" y="118" fill="#f59e0b" font-size="15" font-weight="700" text-anchor="middle" ${T}>+</text>
  <text x="221" y="118" fill="#f59e0b" font-size="15" font-weight="700" text-anchor="middle" ${T}>−</text>
  <text x="210" y="160" fill="#fde68a" font-size="11.5" font-weight="700" text-anchor="middle" ${T}>5 V</text>
  <circle cx="130" cy="112" r="5" fill="#38bdf8"/>
  <circle cx="290" cy="112" r="5" fill="#38bdf8"/>
  <text x="118" y="104" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="end" ${T}>v₂</text>
  <text x="302" y="104" fill="#e2e8f0" font-size="12" font-weight="700" ${T}>v₃</text>
  <text x="60" y="104" fill="#94a3b8" font-size="10" text-anchor="middle" ${T}>外电路</text>
  <text x="360" y="104" fill="#94a3b8" font-size="10" text-anchor="middle" ${T}>外电路</text>
</svg>`;

/** Q4: node 1 with R1 = 6 Ω to ground (i_x downward), and the CCVS 3i_x between nodes 2 and 3. */
const SVG_Q4_DARK = `<svg viewBox="0 0 420 170" aria-label="节点 1 经 R1 = 6 欧接地，电流 ix 向下；节点 2、3 之间接流控电压源 3ix，正极接节点 2">
  <defs>
    <marker id="w22-q4-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
  </defs>
  <rect width="420" height="170" rx="10" fill="#0f172a"/>
  <text x="16" y="22" fill="#94a3b8" ${T} font-size="11" font-weight="600">Q4 · 控制量 iₓ 在 R₁ 上，受控源 3iₓ 在节点 2、3 之间</text>
  <line x1="70" y1="62" x2="160" y2="62" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="160" y1="62" x2="200" y2="62" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4"/>
  <line x1="200" y1="62" x2="262" y2="62" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="318" y1="62" x2="380" y2="62" stroke="#94a3b8" stroke-width="2.2"/>
  <text x="180" y="52" fill="#94a3b8" font-size="10" text-anchor="middle" ${T}>其余电路</text>
  <line x1="70" y1="62" x2="70" y2="86" stroke="#94a3b8" stroke-width="2.2"/>
  <polyline points="70,86 70,92 60,98 80,108 60,118 80,128 70,134 70,140" fill="none" stroke="#38bdf8" stroke-width="2.2"/>
  <line x1="70" y1="140" x2="70" y2="150" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="56" y1="150" x2="84" y2="150" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="61" y1="156" x2="79" y2="156" stroke="#94a3b8" stroke-width="2"/>
  <line x1="66" y1="162" x2="74" y2="162" stroke="#94a3b8" stroke-width="1.8"/>
  <text x="52" y="116" fill="#38bdf8" font-size="11.5" font-weight="700" text-anchor="end" ${T}>R₁</text>
  <text x="52" y="130" fill="#38bdf8" font-size="11" text-anchor="end" ${T}>6 Ω</text>
  <line x1="94" y1="92" x2="94" y2="126" stroke="#fbbf24" stroke-width="2.2" marker-end="url(#w22-q4-arr)"/>
  <text x="102" y="114" fill="#fde68a" font-size="12" font-weight="700" ${T}>iₓ</text>
  <polygon points="290,36 318,62 290,88 262,62" fill="#1e293b" stroke="#f59e0b" stroke-width="2.4"/>
  <text x="277" y="67" fill="#f59e0b" font-size="14" font-weight="700" text-anchor="middle" ${T}>+</text>
  <text x="303" y="67" fill="#f59e0b" font-size="14" font-weight="700" text-anchor="middle" ${T}>−</text>
  <text x="290" y="108" fill="#fde68a" font-size="12" font-weight="700" text-anchor="middle" ${T}>受控源 3iₓ</text>
  <circle cx="70" cy="62" r="5" fill="#38bdf8"/>
  <circle cx="230" cy="62" r="5" fill="#38bdf8"/>
  <circle cx="350" cy="62" r="5" fill="#38bdf8"/>
  <text x="70" y="48" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="middle" ${T}>v₁</text>
  <text x="230" y="48" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="middle" ${T}>v₂</text>
  <text x="350" y="48" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="middle" ${T}>v₃</text>
  <line x1="230" y1="62" x2="230" y2="96" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4"/>
  <line x1="350" y1="62" x2="350" y2="96" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4"/>
</svg>`;

/* ------------------------------------------------------------- light-theme exports */

export const SVG_ACT1 = light(SVG_ACT1_DARK);
export const SVG_ACT2 = light(SVG_ACT2_DARK.replace('<text x="410" y="110" fill="#c4b5fd" font-size="11.5"', '<text x="410" y="106" fill="#c4b5fd" font-size="10"'));
export const SVG_ACT3 = light(SVG_ACT3_DARK.replace('<text x="350" y="73" fill="#fda4af" font-size="12"', '<text x="350" y="73" fill="#fda4af" font-size="11"'));
export const SVG_ACT4 = light(SVG_ACT4_DARK);
export const SVG_ACT5 = light(SVG_ACT5_DARK);
export const SVG_ACT6 = light(SVG_ACT6_DARK);
export const MINI_STEP1 = light(MINI_STEP1_DARK);
export const MINI_STEP2 = light(MINI_STEP2_DARK);
export const MINI_STEP3 = light(MINI_STEP3_DARK);
export const MINI_STEP4 = light(MINI_STEP4_DARK);
export const MINI_STEP5 = light(MINI_STEP5_DARK);
export const SVG_Q1 = light(SVG_Q1_DARK);
export const SVG_Q2 = light(SVG_Q2_DARK);
export const SVG_Q3 = light(SVG_Q3_DARK);
export const SVG_Q4 = light(SVG_Q4_DARK);
