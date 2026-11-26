// The diagrams of the W2-L3 lesson sheet (docs/lessons/W2-L3.md), generated from the sheet by a
// script (not retyped), in the sheet's dark board style; index.ts passes them through lightSvg.
// Changes from the sheet: pale colours lightSvg does not map (#fecdd3, #ecfdf5, #c084fc text; the
// #1e1b2e panel) swapped for mapped ones, and the #f8fafc node dots (kept near-white by lightSvg,
// they read as gaps in the wire) drawn in ink; act 1's "V1" label moved off its source; act 4's
// node-b label moved below the dashed outer path; step 3's "↓ 3 A" moved off its branch line; the
// act 5 problem figure without the dashed supermesh outline, and the guided-step diagrams without
// the answers they printed (step 1's "移除共享支路 → 超网孔大外环", step 2's (i₁)/(i₂) tags,
// step 5's 15 V drop and "14 − 15").

export const SVG_ACT1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 380" width="100%" role="img" aria-label="三网孔窗格直觉、回路与网孔区分及非平面电路对比">
  <defs>
    <marker id="act1-arr-cyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#38bdf8"/>
    </marker>
    <marker id="act1-arr-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#f59e0b"/>
    </marker>
    <marker id="act1-arr-rose" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#fb7185"/>
    </marker>
  </defs>

  <rect width="820" height="380" rx="14" fill="#0f172a"/>
  <text x="24" y="34" fill="#f8fafc" font-size="16" font-weight="700" font-family="system-ui, sans-serif">图 1-1：平面三网孔“窗格气流”与共享支路矢量叠加（右附非平面反例）</text>

  <!-- 左侧：平面三网孔电路 -->
  <!-- 外环虚线：表示一个大 Loop（非 Mesh） -->
  <rect x="48" y="60" width="444" height="270" rx="12" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="7 5"/>
  <text x="58" y="54" fill="#a855f7" font-size="12" font-family="system-ui, sans-serif">大外环 = 回路 (Loop)，但不是网孔 (Mesh)</text>

  <!-- 网格骨架导线 -->
  <g stroke="#e2e8f0" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- 外框 -->
    <rect x="70" y="80" width="400" height="230"/>
    <!-- 水平中梁（隔开上部 Mesh 3 与下部 Mesh 1, 2） -->
    <line x1="70" y1="195" x2="470" y2="195"/>
    <!-- 下部垂直共享支路（隔开 Mesh 1 与 Mesh 2） -->
    <line x1="270" y1="195" x2="270" y2="310"/>
  </g>

  <!-- 元件符号（简化清晰电阻矩形块） -->
  <g fill="#1e293b" stroke="#94a3b8" stroke-width="2">
    <rect x="235" y="70" width="70" height="20" rx="4"/>
    <rect x="135" y="185" width="70" height="20" rx="4"/>
    <rect x="335" y="185" width="70" height="20" rx="4"/>
    <rect x="260" y="228" width="20" height="50" rx="4" stroke="#f59e0b" stroke-width="2.5"/>
  </g>
  <!-- 左侧电压源 V1 -->
  <circle cx="70" cy="252" r="18" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
  <text x="70" y="248" fill="#38bdf8" font-size="13" font-weight="700" text-anchor="middle">+</text>
  <text x="70" y="264" fill="#38bdf8" font-size="14" font-weight="700" text-anchor="middle">-</text>
  <text x="46" y="257" fill="#bae6fd" font-size="13" text-anchor="end" font-family="monospace">V1</text>

  <!-- 电阻标注 -->
  <text x="270" y="84" fill="#e2e8f0" font-size="12" text-anchor="middle" font-family="monospace">R5</text>
  <text x="170" y="199" fill="#e2e8f0" font-size="12" text-anchor="middle" font-family="monospace">R1</text>
  <text x="370" y="199" fill="#e2e8f0" font-size="12" text-anchor="middle" font-family="monospace">R3</text>
  <text x="298" y="257" fill="#fcd34d" font-size="12" font-weight="700" font-family="monospace">R2</text>

  <!-- 顺时针网孔电流圆弧 i3 (上窗格) -->
  <path d="M 240 140 A 30 24 0 1 1 298 148" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#act1-arr-cyan)"/>
  <text x="270" y="146" fill="#38bdf8" font-size="15" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₃</text>

  <!-- 顺时针网孔电流圆弧 i1 (左下窗格) -->
  <path d="M 145 252 A 26 24 0 1 1 196 260" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#act1-arr-cyan)"/>
  <text x="170" y="258" fill="#38bdf8" font-size="15" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₁</text>

  <!-- 顺时针网孔电流圆弧 i2 (右下窗格) -->
  <path d="M 345 252 A 26 24 0 1 1 396 260" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#act1-arr-cyan)"/>
  <text x="370" y="258" fill="#38bdf8" font-size="15" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₂</text>

  <!-- 共享支路 R2 双向箭头抵消标注 -->
  <line x1="250" y1="226" x2="250" y2="278" stroke="#f59e0b" stroke-width="2" marker-end="url(#act1-arr-amber)"/>
  <line x1="290" y1="278" x2="290" y2="226" stroke="#fb7185" stroke-width="2" marker-end="url(#act1-arr-rose)"/>
  <text x="242" y="256" fill="#fcd34d" font-size="11" text-anchor="end" font-family="monospace">i₁↓</text>
  <text x="298" y="240" fill="#fda4af" font-size="11" font-family="monospace">↑i₂</text>
  <rect x="176" y="320" width="192" height="28" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="272" y="338" fill="#fde68a" font-size="12" font-weight="600" text-anchor="middle" font-family="monospace">共享支路向下净电流 = i₁ - i₂</text>

  <!-- 右侧：非平面电路禁区框 -->
  <rect x="526" y="68" width="268" height="278" rx="12" fill="#4c0519" stroke="#f43f5e" stroke-width="1.8"/>
  <text x="660" y="94" fill="#fda4af" font-size="13" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif">非平面电路反例（不可用网孔法）</text>
  <!-- 经典 K3,3 不可消去交叉示意 -->
  <g stroke="#cbd5e1" stroke-width="2" fill="none">
    <line x1="570" y1="130" x2="570" y2="245"/>
    <line x1="570" y1="130" x2="660" y2="245"/>
    <line x1="570" y1="130" x2="750" y2="245"/>
    <line x1="660" y1="130" x2="570" y2="245"/>
    <line x1="660" y1="130" x2="660" y2="245"/>
    <line x1="660" y1="130" x2="750" y2="245"/>
    <line x1="750" y1="130" x2="570" y2="245"/>
    <line x1="750" y1="130" x2="660" y2="245"/>
    <line x1="750" y1="130" x2="750" y2="245"/>
  </g>
  <!-- 标注交叉红圈 -->
  <circle cx="615" cy="187" r="9" fill="none" stroke="#f43f5e" stroke-width="2"/>
  <circle cx="705" cy="187" r="9" fill="none" stroke="#f43f5e" stroke-width="2"/>
  <!-- 顶底6个节点 -->
  <g fill="#f43f5e">
    <circle cx="570" cy="130" r="5"/><circle cx="660" cy="130" r="5"/><circle cx="750" cy="130" r="5"/>
    <circle cx="570" cy="245" r="5"/><circle cx="660" cy="245" r="5"/><circle cx="750" cy="245" r="5"/>
  </g>
  <text x="660" y="282" fill="#fda4af" font-size="12" text-anchor="middle" font-family="system-ui, sans-serif">无论如何重画，总存在无法消除的导线交叉</text>
  <text x="660" y="304" fill="#94a3b8" font-size="11.5" text-anchor="middle" font-family="system-ui, sans-serif">无法定义清晰“窗格” → 请改用节点电压法</text>
</svg>`;

export const SVG_ACT2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 340" width="100%" role="img" aria-label="标准双网孔电路原理图：V1=20V, R1=5Ω, R2=10Ω, R3=5Ω, V2=5V">
  <defs>
    <marker id="act2-arr-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#38bdf8"/>
    </marker>
    <marker id="act2-arr-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#f59e0b"/>
    </marker>
    <marker id="act2-arr-rose" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#fb7185"/>
    </marker>
  </defs>

  <rect width="780" height="340" rx="14" fill="#0f172a"/>
  <text x="24" y="34" fill="#f8fafc" font-size="16" font-weight="700" font-family="system-ui, sans-serif">图 2-1：标准双网孔电路（统一顺时针设 i₁, i₂，共享电阻 R₂ 呈现双向抵消）</text>

  <!-- 导线框架 -->
  <g stroke="#e2e8f0" stroke-width="2.6" fill="none" stroke-linecap="round">
    <!-- 左支路与顶/底 -->
    <line x1="110" y1="85" x2="670" y2="85"/>
    <line x1="110" y1="275" x2="670" y2="275"/>
    <line x1="110" y1="85" x2="110" y2="152"/>
    <line x1="110" y1="208" x2="110" y2="275"/>
    <!-- 中间共享支路 -->
    <line x1="390" y1="85" x2="390" y2="140"/>
    <line x1="390" y1="220" x2="390" y2="275"/>
    <!-- 右支路 -->
    <line x1="670" y1="85" x2="670" y2="152"/>
    <line x1="670" y1="208" x2="670" y2="275"/>
  </g>

  <!-- 节点圆点 -->
  <circle cx="390" cy="85" r="4.5" fill="#1f2a44"/>
  <circle cx="390" cy="275" r="4.5" fill="#1f2a44"/>

  <!-- 电压源 V1 = 20 V -->
  <circle cx="110" cy="180" r="28" fill="#0f172a" stroke="#38bdf8" stroke-width="2.6"/>
  <text x="110" y="172" fill="#38bdf8" font-size="16" font-weight="700" text-anchor="middle">+</text>
  <text x="110" y="198" fill="#38bdf8" font-size="18" font-weight="700" text-anchor="middle">-</text>
  <text x="68" y="176" fill="#bae6fd" font-size="14" font-weight="700" text-anchor="end" font-family="monospace">V₁</text>
  <text x="68" y="196" fill="#94a3b8" font-size="13" text-anchor="end" font-family="monospace">20 V</text>

  <!-- 电压源 V2 = 5 V -->
  <circle cx="670" cy="180" r="28" fill="#0f172a" stroke="#38bdf8" stroke-width="2.6"/>
  <text x="670" y="172" fill="#38bdf8" font-size="16" font-weight="700" text-anchor="middle">+</text>
  <text x="670" y="198" fill="#38bdf8" font-size="18" font-weight="700" text-anchor="middle">-</text>
  <text x="712" y="176" fill="#bae6fd" font-size="14" font-weight="700" font-family="monospace">V₂</text>
  <text x="712" y="196" fill="#94a3b8" font-size="13" font-family="monospace">5 V</text>

  <!-- 电阻 R1 = 5 Ω -->
  <rect x="205" y="72" width="90" height="26" rx="5" fill="#1e293b" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="250" y="63" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle" font-family="monospace">R₁ = 5 Ω</text>

  <!-- 电阻 R3 = 5 Ω -->
  <rect x="485" y="72" width="90" height="26" rx="5" fill="#1e293b" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="530" y="63" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle" font-family="monospace">R₃ = 5 Ω</text>

  <!-- 共享电阻 R2 = 10 Ω -->
  <rect x="377" y="140" width="26" height="80" rx="5" fill="#1e293b" stroke="#f59e0b" stroke-width="2.6"/>
  <text x="415" y="176" fill="#fde68a" font-size="13" font-weight="700" font-family="monospace">R₂ = 10 Ω</text>
  <text x="415" y="195" fill="#94a3b8" font-size="11.5" font-family="system-ui, sans-serif">（共享支路）</text>

  <!-- 共享支路双向抵消标注 -->
  <line x1="364" y1="142" x2="364" y2="218" stroke="#f59e0b" stroke-width="2.2" marker-end="url(#act2-arr-amber)"/>
  <text x="355" y="184" fill="#fcd34d" font-size="12" font-weight="700" text-anchor="end" font-family="monospace">i₁↓</text>
  <line x1="414" y1="218" x2="414" y2="142" stroke="#fb7185" stroke-width="2.2" marker-end="url(#act2-arr-rose)"/>
  <text x="424" y="150" fill="#fda4af" font-size="12" font-weight="700" font-family="monospace">↑i₂</text>
  <rect x="292" y="292" width="196" height="28" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.4"/>
  <text x="390" y="310" fill="#fde68a" font-size="12" font-weight="600" text-anchor="middle" font-family="monospace">I_R2(向下) = i₁ - i₂</text>

  <!-- 顺时针网孔电流 i1 -->
  <path d="M 218 175 A 36 36 0 1 1 286 190" fill="none" stroke="#38bdf8" stroke-width="2.8" marker-end="url(#act2-arr-blue)"/>
  <text x="250" y="186" fill="#38bdf8" font-size="18" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₁</text>
  <text x="250" y="206" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="system-ui, sans-serif">Mesh 1 (顺时针)</text>

  <!-- 顺时针网孔电流 i2 -->
  <path d="M 498 175 A 36 36 0 1 1 566 190" fill="none" stroke="#38bdf8" stroke-width="2.8" marker-end="url(#act2-arr-blue)"/>
  <text x="530" y="186" fill="#38bdf8" font-size="18" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₂</text>
  <text x="530" y="206" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="system-ui, sans-serif">Mesh 2 (顺时针)</text>
</svg>`;

export const SVG_ACT3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 340" width="100%" role="img" aria-label="Case 1 边缘电流源电路：V1=24V, R1=2Ω, R2=4Ω, R3=6Ω, 右侧向上电流源 Is=3A">
  <defs>
    <marker id="act3-arr-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#38bdf8"/>
    </marker>
    <marker id="act3-arr-emerald" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#10b981"/>
    </marker>
  </defs>

  <rect width="780" height="340" rx="14" fill="#0f172a"/>
  <text x="24" y="34" fill="#f8fafc" font-size="16" font-weight="700" font-family="system-ui, sans-serif">图 3-1：Case 1 边缘独立电流源（Is 与顺时针 i₂ 反向，直接锁定 i₂ = -Is）</text>

  <!-- 导线 -->
  <g stroke="#e2e8f0" stroke-width="2.6" fill="none" stroke-linecap="round">
    <line x1="110" y1="85" x2="650" y2="85"/>
    <line x1="110" y1="275" x2="650" y2="275"/>
    <line x1="110" y1="85" x2="110" y2="152"/>
    <line x1="110" y1="208" x2="110" y2="275"/>
    <line x1="380" y1="85" x2="380" y2="140"/>
    <line x1="380" y1="220" x2="380" y2="275"/>
    <line x1="650" y1="85" x2="650" y2="152"/>
    <line x1="650" y1="208" x2="650" y2="275"/>
  </g>
  <circle cx="380" cy="85" r="4.5" fill="#1f2a44"/>
  <circle cx="380" cy="275" r="4.5" fill="#1f2a44"/>

  <!-- V1 = 24 V -->
  <circle cx="110" cy="180" r="28" fill="#0f172a" stroke="#38bdf8" stroke-width="2.6"/>
  <text x="110" y="172" fill="#38bdf8" font-size="16" font-weight="700" text-anchor="middle">+</text>
  <text x="110" y="198" fill="#38bdf8" font-size="18" font-weight="700" text-anchor="middle">-</text>
  <text x="68" y="176" fill="#bae6fd" font-size="14" font-weight="700" text-anchor="end" font-family="monospace">V₁</text>
  <text x="68" y="196" fill="#94a3b8" font-size="13" text-anchor="end" font-family="monospace">24 V</text>

  <!-- R1 = 2 Ω, R2 = 4 Ω, R3 = 6 Ω -->
  <rect x="200" y="72" width="90" height="26" rx="5" fill="#1e293b" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="245" y="63" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle" font-family="monospace">R₁ = 2 Ω</text>

  <rect x="367" y="140" width="26" height="80" rx="5" fill="#1e293b" stroke="#f59e0b" stroke-width="2.4"/>
  <text x="405" y="185" fill="#fde68a" font-size="13" font-weight="700" font-family="monospace">R₂ = 4 Ω</text>

  <rect x="470" y="72" width="90" height="26" rx="5" fill="#1e293b" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="515" y="63" fill="#94a3b8" font-size="13" font-weight="700" text-anchor="middle" font-family="monospace">R₃ = 6 Ω (与Is串联)</text>

  <!-- 右侧边缘电流源 Is = 3 A (向上) -->
  <circle cx="650" cy="180" r="28" fill="#0f172a" stroke="#10b981" stroke-width="2.8"/>
  <line x1="650" y1="198" x2="650" y2="162" stroke="#10b981" stroke-width="3" marker-end="url(#act3-arr-emerald)"/>
  <text x="692" y="176" fill="#6ee7b7" font-size="14" font-weight="700" font-family="monospace">Is</text>
  <text x="692" y="196" fill="#a7f3d0" font-size="13" font-family="monospace">3 A ↑</text>

  <!-- 顺时针 i1 -->
  <path d="M 213 175 A 36 36 0 1 1 281 190" fill="none" stroke="#38bdf8" stroke-width="2.8" marker-end="url(#act3-arr-blue)"/>
  <text x="245" y="186" fill="#38bdf8" font-size="18" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₁</text>

  <!-- 顺时针 i2（虚线表示被锁死） -->
  <path d="M 483 175 A 36 36 0 1 1 551 190" fill="none" stroke="#10b981" stroke-width="2.6" stroke-dasharray="5 3" marker-end="url(#act3-arr-emerald)"/>
  <text x="515" y="186" fill="#34d399" font-size="18" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₂</text>

  <!-- 锁死徽章 -->
  <rect x="448" y="290" width="246" height="32" rx="7" fill="#064e3b" stroke="#10b981" stroke-width="1.6"/>
  <text x="571" y="311" fill="#a7f3d0" font-size="12.5" font-weight="700" text-anchor="middle" font-family="monospace">边缘锁定：i₂ = -Is = -3 A (反向!)</text>
</svg>`;

export const SVG_ACT4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 380" width="100%" role="img" aria-label="Case 2 超网孔原理图：V1=20V, R1=6Ω, 共享支路 Is=6A 向上串联 Rs=2Ω, R2=10Ω, R3=4Ω，标出虚线超网孔大外环与内部 KCL 节点">
  <defs>
    <marker id="act4-arr-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#f59e0b"/>
    </marker>
    <marker id="act4-arr-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#38bdf8"/>
    </marker>
    <marker id="act4-arr-emerald" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#10b981"/>
    </marker>
  </defs>

  <rect width="820" height="380" rx="14" fill="#0f172a"/>
  <text x="24" y="34" fill="#f8fafc" font-size="16" font-weight="700" font-family="system-ui, sans-serif">图 4-1：Case 2 超网孔（移除共享电流源及串联电阻 Rs 后，沿琥珀色虚线大外环列 KVL）</text>

  <!-- 超网孔大外环虚线绕行路径 -->
  <path d="M 76 294 L 76 62 L 664 62 L 664 294 L 112 294" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="10 6" marker-end="url(#act4-arr-amber)"/>
  <rect x="266" y="46" width="210" height="24" rx="6" fill="#451a03" stroke="#f59e0b" stroke-width="1.4"/>
  <text x="371" y="62" fill="#fde68a" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif">超网孔大外环 KVL 绕行路径 (顺时针)</text>

  <!-- 主电路外围导线 -->
  <g stroke="#e2e8f0" stroke-width="2.6" fill="none" stroke-linecap="round">
    <line x1="110" y1="95" x2="630" y2="95"/>
    <line x1="110" y1="275" x2="630" y2="275"/>
    <line x1="110" y1="95" x2="110" y2="157"/>
    <line x1="110" y1="213" x2="110" y2="275"/>
    <line x1="630" y1="95" x2="630" y2="145"/>
    <line x1="630" y1="225" x2="630" y2="275"/>
  </g>

  <!-- 被虚化“切除”的共享支路（Rs=2Ω 串联 Is=6A） -->
  <g stroke="#64748b" stroke-width="2.2" stroke-dasharray="5 4" fill="none">
    <line x1="370" y1="95" x2="370" y2="120"/>
    <line x1="370" y1="168" x2="370" y2="190"/>
    <line x1="370" y1="242" x2="370" y2="275"/>
  </g>
  <!-- 共享支路外框提示 -->
  <rect x="316" y="110" width="108" height="148" rx="10" fill="#1e293b" fill-opacity="0.45" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4 4"/>
  <!-- 串联电阻 Rs = 2 Ω -->
  <rect x="358" y="120" width="24" height="48" rx="4" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="390" y="148" fill="#cbd5e1" font-size="11.5" font-family="monospace">Rs=2Ω</text>
  <!-- 共享电流源 Is = 6 A (向上) -->
  <circle cx="370" cy="216" r="24" fill="#0f172a" stroke="#10b981" stroke-width="2.5"/>
  <line x1="370" y1="231" x2="370" y2="201" stroke="#10b981" stroke-width="2.8" marker-end="url(#act4-arr-emerald)"/>
  <text x="401" y="218" fill="#6ee7b7" font-size="12" font-weight="700" font-family="monospace">6A ↑</text>

  <!-- 节点圆点 -->
  <circle cx="370" cy="95" r="5" fill="#10b981"/>
  <circle cx="370" cy="275" r="5" fill="#10b981"/>
  <text x="370" y="312" fill="#6ee7b7" font-size="12" font-weight="700" text-anchor="middle" font-family="monospace">节点 b（内部 KCL 约束点）</text>

  <!-- V1 = 20 V -->
  <circle cx="110" cy="185" r="28" fill="#0f172a" stroke="#38bdf8" stroke-width="2.6"/>
  <text x="110" y="177" fill="#38bdf8" font-size="16" font-weight="700" text-anchor="middle">+</text>
  <text x="110" y="203" fill="#38bdf8" font-size="18" font-weight="700" text-anchor="middle">-</text>
  <text x="58" y="182" fill="#bae6fd" font-size="13" font-weight="700" text-anchor="end" font-family="monospace">V₁</text>
  <text x="58" y="200" fill="#94a3b8" font-size="12" text-anchor="end" font-family="monospace">20 V</text>

  <!-- R1 = 6 Ω, R2 = 10 Ω, R3 = 4 Ω -->
  <rect x="195" y="82" width="84" height="26" rx="5" fill="#1e293b" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="237" y="125" fill="#f8fafc" font-size="12.5" font-weight="700" text-anchor="middle" font-family="monospace">R₁ = 6 Ω</text>

  <rect x="462" y="82" width="88" height="26" rx="5" fill="#1e293b" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="506" y="125" fill="#f8fafc" font-size="12.5" font-weight="700" text-anchor="middle" font-family="monospace">R₂ = 10 Ω</text>

  <rect x="617" y="145" width="26" height="80" rx="5" fill="#1e293b" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="605" y="190" fill="#f8fafc" font-size="12.5" font-weight="700" text-anchor="end" font-family="monospace">R₃ = 4 Ω</text>

  <!-- 原网孔电流 i1, i2 标记 -->
  <path d="M 192 185 A 30 30 0 1 1 248 198" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#act4-arr-blue)"/>
  <text x="220" y="195" fill="#38bdf8" font-size="17" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₁</text>

  <path d="M 480 185 A 30 30 0 1 1 536 198" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#act4-arr-blue)"/>
  <text x="508" y="195" fill="#38bdf8" font-size="17" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₂</text>

  <!-- 右侧局部放大盒：节点 b 的 KCL 约束 -->
  <rect x="684" y="88" width="118" height="196" rx="10" fill="#064e3b" fill-opacity="0.4" stroke="#10b981" stroke-width="1.6"/>
  <text x="743" y="112" fill="#a7f3d0" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif">节点 b 放大</text>
  <line x1="743" y1="196" x2="743" y2="146" stroke="#10b981" stroke-width="2.6" marker-end="url(#act4-arr-emerald)"/>
  <text x="752" y="160" fill="#6ee7b7" font-size="11.5" font-family="monospace">6A</text>
  <line x1="712" y1="196" x2="743" y2="196" stroke="#38bdf8" stroke-width="2.2"/>
  <line x1="743" y1="196" x2="778" y2="196" stroke="#38bdf8" stroke-width="2.2"/>
  <circle cx="743" cy="196" r="4.5" fill="#10b981"/>
  <text x="716" y="216" fill="#bae6fd" font-size="11" font-family="monospace">← i₁</text>
  <text x="752" y="216" fill="#bae6fd" font-size="11" font-family="monospace">← i₂</text>
  <text x="743" y="246" fill="#a7f3d0" font-size="12" font-weight="700" text-anchor="middle" font-family="monospace">i₂ = i₁ + 6</text>
  <text x="743" y="268" fill="#a7f3d0" font-size="11.5" text-anchor="middle" font-family="monospace">即 i₂ - i₁ = 6</text>

  <!-- 底部串联电阻注释 -->
  <rect x="110" y="324" width="600" height="32" rx="7" fill="#1e293b" stroke="#f43f5e" stroke-width="1.3"/>
  <text x="410" y="344" fill="#fda4af" font-size="12.5" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif">注意：Rs = 2 Ω 与 6 A 电流源串联，被大外环绕过，不进入超网孔 KVL，也不影响 i₁, i₂！</text>
</svg>`;

export const SVG_PROBLEM5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 350" width="100%" role="img" aria-label="第五幕引导例题原理图：V1=30V, V2=6V, R1=4Ω, R2=2Ω, R3=6Ω, 共享支路 Rs=5Ω 串联向下电流源 Is=3A">
  <defs>
    <marker id="act5-arr-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#38bdf8"/>
    </marker>
    <marker id="act5-arr-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#f59e0b"/>
    </marker>
    <marker id="act5-arr-emerald" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,1 L9,5 L0,9 Z" fill="#10b981"/>
    </marker>
  </defs>

  <rect width="780" height="350" rx="14" fill="#0f172a"/>
  <text x="24" y="34" fill="#f8fafc" font-size="16" font-weight="700" font-family="system-ui, sans-serif">图 5-1：苏格拉底引导实战——双电压源 + 向下共享电流源超网孔</text>


  <!-- 主导线 -->
  <g stroke="#e2e8f0" stroke-width="2.6" fill="none" stroke-linecap="round">
    <line x1="110" y1="90" x2="670" y2="90"/>
    <line x1="110" y1="270" x2="670" y2="270"/>
    <line x1="110" y1="90" x2="110" y2="152"/>
    <line x1="110" y1="208" x2="110" y2="270"/>
    <line x1="390" y1="90" x2="390" y2="114"/>
    <line x1="390" y1="164" x2="390" y2="188"/>
    <line x1="390" y1="236" x2="390" y2="270"/>
    <line x1="670" y1="90" x2="670" y2="115"/>
    <line x1="670" y1="175" x2="670" y2="196"/>
    <line x1="670" y1="244" x2="670" y2="270"/>
  </g>
  <circle cx="390" cy="90" r="4.5" fill="#1f2a44"/>
  <circle cx="390" cy="270" r="4.5" fill="#1f2a44"/>

  <!-- V1 = 30 V -->
  <circle cx="110" cy="180" r="28" fill="#0f172a" stroke="#38bdf8" stroke-width="2.6"/>
  <text x="110" y="172" fill="#38bdf8" font-size="16" font-weight="700" text-anchor="middle">+</text>
  <text x="110" y="198" fill="#38bdf8" font-size="18" font-weight="700" text-anchor="middle">-</text>
  <text x="64" y="178" fill="#bae6fd" font-size="13" font-weight="700" text-anchor="end" font-family="monospace">V₁=30V</text>

  <!-- R1 = 4 Ω -->
  <rect x="205" y="77" width="88" height="26" rx="5" fill="#1e293b" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="249" y="122" fill="#f8fafc" font-size="12.5" font-weight="700" text-anchor="middle" font-family="monospace">R₁ = 4 Ω</text>

  <!-- R2 = 2 Ω -->
  <rect x="485" y="77" width="88" height="26" rx="5" fill="#1e293b" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="529" y="122" fill="#f8fafc" font-size="12.5" font-weight="700" text-anchor="middle" font-family="monospace">R₂ = 2 Ω</text>

  <!-- R3 = 6 Ω 与 V2 = 6 V 在右侧支路 -->
  <rect x="657" y="115" width="26" height="60" rx="5" fill="#1e293b" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="646" y="150" fill="#f8fafc" font-size="12.5" font-weight="700" text-anchor="end" font-family="monospace">R₃=6Ω</text>
  <circle cx="670" cy="220" r="24" fill="#0f172a" stroke="#38bdf8" stroke-width="2.6"/>
  <text x="670" y="213" fill="#38bdf8" font-size="14" font-weight="700" text-anchor="middle">+</text>
  <text x="670" y="234" fill="#38bdf8" font-size="16" font-weight="700" text-anchor="middle">-</text>
  <text x="708" y="224" fill="#bae6fd" font-size="13" font-weight="700" font-family="monospace">V₂=6V</text>

  <!-- 共享支路：Rs = 5 Ω + 向下电流源 Is = 3 A -->
  <rect x="378" y="114" width="24" height="50" rx="4" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="412" y="143" fill="#fda4af" font-size="12" font-weight="700" font-family="monospace">Rs = 5 Ω</text>
  <circle cx="390" cy="212" r="24" fill="#0f172a" stroke="#10b981" stroke-width="2.6"/>
  <line x1="390" y1="197" x2="390" y2="227" stroke="#10b981" stroke-width="2.8" marker-end="url(#act5-arr-emerald)"/>
  <text x="422" y="216" fill="#6ee7b7" font-size="12.5" font-weight="700" font-family="monospace">Is = 3 A ↓</text>

  <!-- 顺时针 i1, i2 -->
  <path d="M 218 182 A 30 30 0 1 1 274 196" fill="none" stroke="#38bdf8" stroke-width="2.6" marker-end="url(#act5-arr-blue)"/>
  <text x="246" y="192" fill="#38bdf8" font-size="17" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₁</text>

  <path d="M 500 182 A 30 30 0 1 1 556 196" fill="none" stroke="#38bdf8" stroke-width="2.6" marker-end="url(#act5-arr-blue)"/>
  <text x="528" y="192" fill="#38bdf8" font-size="17" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">i₂</text>
</svg>`;

export const MINI_STEP1 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' style='max-width:390px;margin:0 auto'><rect width='260' height='110' rx='8' fill='#0f172a'/><rect x='20' y='18' width='220' height='74' fill='none' stroke='#e2e8f0' stroke-width='2.2'/><line x1='130' y1='18' x2='130' y2='92' stroke='#e2e8f0' stroke-width='2'/><rect x='123' y='26' width='14' height='20' rx='2' fill='#1e293b' stroke='#f43f5e' stroke-width='1.8'/><text x='144' y='40' fill='#fda4af' font-size='10'>Rs=5Ω</text><text x='72' y='60' fill='#38bdf8' font-size='11' text-anchor='middle'>Mesh 1</text><text x='188' y='60' fill='#38bdf8' font-size='11' text-anchor='middle'>Mesh 2</text><circle cx='130' cy='62' r='13' fill='#0f172a' stroke='#10b981' stroke-width='2'/><text x='130' y='66' fill='#10b981' font-size='11' text-anchor='middle'>↓3A</text><text x='130' y='14' fill='#fde68a' font-size='10' text-anchor='middle'>共享支路：3 A 电流源串联 Rs = 5 Ω</text></svg>`;

export const MINI_STEP2 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' style='max-width:390px;margin:0 auto'><rect width='260' height='110' rx='8' fill='#0f172a'/><rect x='24' y='22' width='212' height='66' fill='none' stroke='#f59e0b' stroke-width='2.4'/><text x='42' y='60' fill='#38bdf8' font-size='10'>30V</text><text x='86' y='18' fill='#e2e8f0' font-size='10'>4Ω</text><text x='176' y='18' fill='#e2e8f0' font-size='10'>2Ω</text><text x='204' y='52' fill='#e2e8f0' font-size='10'>6Ω</text><text x='204' y='74' fill='#38bdf8' font-size='10'>+6V-</text></svg>`;

export const MINI_STEP3 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' style='max-width:390px;margin:0 auto'><rect width='260' height='110' rx='8' fill='#0f172a'/><line x1='130' y1='16' x2='130' y2='94' stroke='#10b981' stroke-width='2.6'/><text x='138' y='58' fill='#6ee7b7' font-size='12'>↓ 3 A</text><text x='84' y='58' fill='#38bdf8' font-size='12' text-anchor='middle'>i₁ ↓</text><text x='196' y='58' fill='#fb7185' font-size='12' text-anchor='middle'>↑ i₂</text></svg>`;

export const MINI_STEP4 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' style='max-width:390px;margin:0 auto'><rect width='260' height='110' rx='8' fill='#0f172a'/><text x='130' y='44' fill='#fde68a' font-size='12' text-anchor='middle' font-family='monospace'>i₁ + 2i₂ = 6</text><text x='130' y='72' fill='#6ee7b7' font-size='12' text-anchor='middle' font-family='monospace'>i₁ -  i₂ = 3</text></svg>`;

export const MINI_STEP5 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' style='max-width:390px;margin:0 auto'><rect width='260' height='110' rx='8' fill='#0f172a'/><text x='130' y='24' fill='#bae6fd' font-size='11' text-anchor='middle'>Va = 14 V</text><rect x='120' y='30' width='20' height='26' fill='#1e293b' stroke='#f43f5e' stroke-width='1.8'/><text x='186' y='47' fill='#fda4af' font-size='10' text-anchor='middle'>Rs = 5 Ω</text><circle cx='130' cy='78' r='13' fill='#0f172a' stroke='#10b981' stroke-width='2'/><text x='130' y='82' fill='#6ee7b7' font-size='10' text-anchor='middle'>↓3A</text><text x='188' y='82' fill='#fde68a' font-size='10' text-anchor='middle'>V_Is = ?</text></svg>`;
