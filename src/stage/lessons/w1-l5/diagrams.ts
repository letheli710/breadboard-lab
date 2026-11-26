// W1-L5 diagrams: the act and guided-step SVGs of the lesson sheet (docs/lessons/W1-L5.md),
// recoloured from the sheet's dark slate palette to the light stage palette (same shapes, same
// text). One fix: in the act-4 diagram the downward I₂ arrow gets an amber arrow head (the sheet
// gave it the blue head of the upward sources).

export const SVG_ACT1 = `<svg role="img" aria-label="水流管道类比与四支路节点 A 的 KCL" viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-in-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="arr-out-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706"/>
    </marker>
  </defs>
  <!-- 左侧：水流管道类比 -->
  <text x="95" y="24" fill="#475569" font-size="11" font-weight="600" text-anchor="middle">水流管道类比（Boylestad）</text>
  <rect x="20" y="52" width="60" height="14" rx="3" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
  <rect x="20" y="102" width="60" height="14" rx="3" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
  <rect x="20" y="152" width="60" height="14" rx="3" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
  <circle cx="95" cy="109" r="24" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
  <rect x="117" y="99" width="64" height="20" rx="3" fill="#e0f2fe" stroke="#d97706" stroke-width="1.8"/>
  <line x1="28" y1="59" x2="70" y2="59" stroke="#059669" stroke-width="2" marker-end="url(#arr-in-1)"/>
  <line x1="28" y1="109" x2="70" y2="109" stroke="#059669" stroke-width="2" marker-end="url(#arr-in-1)"/>
  <line x1="28" y1="159" x2="70" y2="159" stroke="#059669" stroke-width="2" marker-end="url(#arr-in-1)"/>
  <line x1="126" y1="109" x2="173" y2="109" stroke="#d97706" stroke-width="2.5" marker-end="url(#arr-out-1)"/>
  <text x="95" y="113" fill="#075985" font-size="10" font-weight="700" text-anchor="middle">无囤积</text>
  <text x="50" y="46" fill="#059669" font-size="10" text-anchor="middle">Q₁ = 4 L/s</text>
  <text x="50" y="96" fill="#059669" font-size="10" text-anchor="middle">Q₂ = 3 L/s</text>
  <text x="50" y="146" fill="#059669" font-size="10" text-anchor="middle">Q₃ = -1 L/s</text>
  <text x="150" y="92" fill="#d97706" font-size="10" font-weight="700" text-anchor="middle">Q₄ = 6 L/s</text>
  <!-- 中央分隔虚线 -->
  <line x1="205" y1="20" x2="205" y2="200" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>
  <!-- 右侧：电路四支路节点 KCL -->
  <text x="315" y="24" fill="#475569" font-size="11" font-weight="600" text-anchor="middle">电路节点模型（Sadiku）</text>
  <line x1="230" y1="55" x2="310" y2="109" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-in-1)"/>
  <line x1="225" y1="109" x2="306" y2="109" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-in-1)"/>
  <line x1="230" y1="163" x2="310" y2="109" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-in-1)"/>
  <line x1="322" y1="109" x2="400" y2="109" stroke="#d97706" stroke-width="2.6" marker-end="url(#arr-out-1)"/>
  <circle cx="315" cy="109" r="7" fill="#0284c7" stroke="#0f172a" stroke-width="2"/>
  <text x="315" y="92" fill="#0f172a" font-size="12" font-weight="700" text-anchor="middle">节点 A</text>
  <text x="255" y="54" fill="#059669" font-size="11" font-weight="600">i₁ = 4 A</text>
  <text x="242" y="102" fill="#059669" font-size="11" font-weight="600">i₂ = 3 A</text>
  <text x="248" y="176" fill="#059669" font-size="11" font-weight="600">i₃ = -1 A</text>
  <text x="362" y="99" fill="#d97706" font-size="11" font-weight="700" text-anchor="middle">i₄ = 6 A</text>
  <!-- 底部公式条 -->
  <rect x="220" y="188" width="186" height="22" rx="5" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
  <text x="313" y="203" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">i₁ + i₂ + i₃ − i₄ = 0  (dq/dt = 0)</text>
</svg>`;

export const SVG_ACT2 = `<svg role="img" aria-label="五支路节点 B：参考方向与负电流" viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-g2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="arr-a2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706"/>
    </marker>
    <marker id="arr-r2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
  </defs>
  <text x="210" y="22" fill="#475569" font-size="11" font-weight="600" text-anchor="middle">五支路节点 B：参考方向与负电流物理含义</text>
  <!-- 支路 1 (左上流入) -->
  <line x1="95" y1="50" x2="198" y2="104" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-g2)"/>
  <text x="72" y="48" fill="#059669" font-size="11" font-weight="600">i₁ = 5 A</text>
  <!-- 支路 3 (左下流入，负值) -->
  <line x1="95" y1="170" x2="198" y2="116" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-g2)"/>
  <text x="60" y="182" fill="#059669" font-size="11" font-weight="600">i₃ = -2 A</text>
  <!-- 支路 4 (正下流入) -->
  <line x1="210" y1="192" x2="210" y2="121" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-g2)"/>
  <text x="210" y="208" fill="#059669" font-size="11" font-weight="600" text-anchor="middle">i₄ = 1 A</text>
  <!-- 支路 2 (右上流出) -->
  <line x1="220" y1="104" x2="325" y2="50" stroke="#d97706" stroke-width="2.2" marker-end="url(#arr-a2)"/>
  <text x="330" y="48" fill="#d97706" font-size="11" font-weight="600">i₂ = 8 A</text>
  <!-- 支路 5 (右下流出，解得 -4 A) -->
  <line x1="220" y1="116" x2="325" y2="170" stroke="#d97706" stroke-width="2.2" marker-end="url(#arr-a2)"/>
  <text x="328" y="176" fill="#d97706" font-size="11" font-weight="700">i₅ = -4 A</text>
  <!-- 真实流向虚线标注 -->
  <line x1="312" y1="176" x2="245" y2="142" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="4,3" marker-end="url(#arr-r2)"/>
  <text x="335" y="192" fill="#dc2626" font-size="10" text-anchor="middle">实际流向 (4 A 流入)</text>
  <!-- 中心节点 B -->
  <circle cx="210" cy="110" r="8" fill="#0284c7" stroke="#0f172a" stroke-width="2"/>
  <text x="210" y="92" fill="#0f172a" font-size="12" font-weight="700" text-anchor="middle">B</text>
  <!-- 图例 -->
  <rect x="16" y="88" width="94" height="44" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
  <line x1="24" y1="103" x2="42" y2="103" stroke="#059669" stroke-width="2"/>
  <text x="48" y="107" fill="#475569" font-size="10">流入参考</text>
  <line x1="24" y1="121" x2="42" y2="121" stroke="#d97706" stroke-width="2"/>
  <text x="48" y="125" fill="#475569" font-size="10">流出参考</text>
</svg>`;

export const SVG_ACT3 = `<svg role="img" aria-label="封闭曲面（广义节点）KCL：内部支路精确抵消" viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-g3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="arr-a3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706"/>
    </marker>
    <marker id="arr-p3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#9333ea"/>
    </marker>
  </defs>
  <text x="210" y="22" fill="#475569" font-size="11" font-weight="600" text-anchor="middle">封闭曲面（广义节点）KCL：内部支路精确抵消</text>
  <!-- 封闭虚线曲面 S -->
  <rect x="105" y="42" width="210" height="145" rx="28" fill="#ffffff" fill-opacity="0.55" stroke="#0284c7" stroke-width="2" stroke-dasharray="7,5"/>
  <text x="210" y="62" fill="#0284c7" font-size="11" font-weight="700" text-anchor="middle">封闭边界 S（子电路 / 黑盒 IC）</text>
  <!-- 内部节点 a 与 b -->
  <circle cx="155" cy="115" r="6" fill="#334155"/>
  <text x="155" y="102" fill="#334155" font-size="11" font-weight="700" text-anchor="middle">节点 a</text>
  <circle cx="265" cy="115" r="6" fill="#334155"/>
  <text x="265" y="102" fill="#334155" font-size="11" font-weight="700" text-anchor="middle">节点 b</text>
  <!-- 内部支路 i_int（抵消示意） -->
  <line x1="162" y1="115" x2="255" y2="115" stroke="#9333ea" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arr-p3)"/>
  <text x="210" y="132" fill="#9333ea" font-size="10" font-weight="600" text-anchor="middle">内部支路 i_int（-i_int + i_int = 0）</text>
  <!-- 外部穿越支路 i_A (左上流入 a) -->
  <line x1="28" y1="82" x2="147" y2="112" stroke="#059669" stroke-width="2.4" marker-end="url(#arr-g3)"/>
  <text x="58" y="76" fill="#059669" font-size="11" font-weight="700">i_A = 5 A</text>
  <!-- 外部穿越支路 i_C (左下流出 a) -->
  <line x1="149" y1="118" x2="32" y2="152" stroke="#d97706" stroke-width="2.4" marker-end="url(#arr-a3)"/>
  <text x="58" y="168" fill="#d97706" font-size="11" font-weight="700">i_C = 2 A</text>
  <!-- 外部穿越支路 i_B (右上流入 b) -->
  <line x1="392" y1="82" x2="273" y2="112" stroke="#059669" stroke-width="2.4" marker-end="url(#arr-g3)"/>
  <text x="360" y="76" fill="#059669" font-size="11" font-weight="700" text-anchor="middle">i_B = 3 A</text>
  <!-- 外部穿越支路 i_D (右下流出 b) -->
  <line x1="271" y1="118" x2="388" y2="152" stroke="#d97706" stroke-width="2.4" marker-end="url(#arr-a3)"/>
  <text x="360" y="168" fill="#d97706" font-size="11" font-weight="700" text-anchor="middle">i_D = 6 A</text>
  <!-- World 3 伏笔注脚 -->
  <rect x="28" y="200" width="364" height="28" rx="6" fill="#e0f2fe" fill-opacity="0.6" stroke="#0284c7"/>
  <text x="210" y="218" fill="#0369a1" font-size="10.5" font-weight="600" text-anchor="middle">World 3 运放伏笔 (Eq. 5.1)：i_o = i₁ + i₂ + i₊ + i₋ （整片 IC 亦服从 KCL）</text>
</svg>`;

export const SVG_ACT4 = `<svg role="img" aria-label="并联电流源等效合并与不同电流源串联禁区" viewBox="0 0 420 230" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-c4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7"/>
    </marker>
    <marker id="arr-g4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="arr-r4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
    <marker id="arr-a4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706"/>
    </marker>
  </defs>
  <!-- 左侧：并联电流源合并 -->
  <text x="135" y="22" fill="#059669" font-size="11" font-weight="700" text-anchor="middle">合法：并联电流源等效合并</text>
  <!-- 顶底母线 -->
  <line x1="35" y1="55" x2="175" y2="55" stroke="#334155" stroke-width="2"/>
  <line x1="35" y1="165" x2="175" y2="165" stroke="#334155" stroke-width="2"/>
  <circle cx="175" cy="55" r="3.5" fill="#334155"/>
  <circle cx="175" cy="165" r="3.5" fill="#334155"/>
  <text x="175" y="45" fill="#475569" font-size="10" text-anchor="middle">a</text>
  <text x="175" y="182" fill="#475569" font-size="10" text-anchor="middle">b</text>
  <!-- I1 = 5A 向上 -->
  <line x1="45" y1="55" x2="45" y2="92" stroke="#334155" stroke-width="1.8"/>
  <line x1="45" y1="128" x2="45" y2="165" stroke="#334155" stroke-width="1.8"/>
  <circle cx="45" cy="110" r="18" fill="#ffffff" stroke="#0284c7" stroke-width="1.8"/>
  <line x1="45" y1="121" x2="45" y2="99" stroke="#0284c7" stroke-width="2" marker-end="url(#arr-c4)"/>
  <text x="45" y="196" fill="#475569" font-size="10" text-anchor="middle">I₁=5A</text>
  <!-- I2 = 2A 向下 -->
  <line x1="95" y1="55" x2="95" y2="92" stroke="#334155" stroke-width="1.8"/>
  <line x1="95" y1="128" x2="95" y2="165" stroke="#334155" stroke-width="1.8"/>
  <circle cx="95" cy="110" r="18" fill="#ffffff" stroke="#d97706" stroke-width="1.8"/>
  <line x1="95" y1="99" x2="95" y2="121" stroke="#d97706" stroke-width="2" marker-end="url(#arr-a4)"/>
  <text x="95" y="196" fill="#d97706" font-size="10" text-anchor="middle">I₂=2A</text>
  <!-- I3 = 4A 向上 -->
  <line x1="145" y1="55" x2="145" y2="92" stroke="#334155" stroke-width="1.8"/>
  <line x1="145" y1="128" x2="145" y2="165" stroke="#334155" stroke-width="1.8"/>
  <circle cx="145" cy="110" r="18" fill="#ffffff" stroke="#0284c7" stroke-width="1.8"/>
  <line x1="145" y1="121" x2="145" y2="99" stroke="#0284c7" stroke-width="2" marker-end="url(#arr-c4)"/>
  <text x="145" y="196" fill="#475569" font-size="10" text-anchor="middle">I₃=4A</text>
  <!-- 等效箭头 -->
  <text x="196" y="114" fill="#059669" font-size="16" font-weight="700" text-anchor="middle">⇒</text>
  <!-- 等效电流源 I_T = 7A -->
  <line x1="218" y1="55" x2="255" y2="55" stroke="#334155" stroke-width="2"/>
  <line x1="218" y1="165" x2="255" y2="165" stroke="#334155" stroke-width="2"/>
  <line x1="234" y1="55" x2="234" y2="92" stroke="#334155" stroke-width="1.8"/>
  <line x1="234" y1="128" x2="234" y2="165" stroke="#334155" stroke-width="1.8"/>
  <circle cx="234" cy="110" r="18" fill="#d1fae5" stroke="#059669" stroke-width="2"/>
  <line x1="234" y1="121" x2="234" y2="99" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-g4)"/>
  <text x="234" y="196" fill="#059669" font-size="10.5" font-weight="700" text-anchor="middle">I_T=7A</text>
  <!-- 分隔线 -->
  <line x1="276" y1="20" x2="276" y2="215" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>
  <!-- 右侧：串联禁区 -->
  <rect x="288" y="34" width="120" height="178" rx="8" fill="#fee2e2" fill-opacity="0.45" stroke="#ef4444" stroke-width="1.5"/>
  <text x="348" y="22" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">非法：不同源串联</text>
  <line x1="348" y1="42" x2="348" y2="62" stroke="#334155" stroke-width="1.8"/>
  <circle cx="348" cy="78" r="16" fill="#ffffff" stroke="#dc2626" stroke-width="1.8"/>
  <line x1="348" y1="88" x2="348" y2="68" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-r4)"/>
  <text x="383" y="82" fill="#b91c1c" font-size="10" font-weight="700">2 A</text>
  <!-- 中间冲突节点 m -->
  <line x1="348" y1="94" x2="348" y2="128" stroke="#ef4444" stroke-width="2.2"/>
  <circle cx="348" cy="111" r="5.5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
  <text x="322" y="114" fill="#b91c1c" font-size="10" font-weight="700">节点 m</text>
  <circle cx="348" cy="144" r="16" fill="#ffffff" stroke="#dc2626" stroke-width="1.8"/>
  <line x1="348" y1="154" x2="348" y2="134" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-r4)"/>
  <text x="383" y="148" fill="#b91c1c" font-size="10" font-weight="700">5 A</text>
  <line x1="348" y1="160" x2="348" y2="178" stroke="#334155" stroke-width="1.8"/>
  <text x="348" y="198" fill="#b91c1c" font-size="10" font-weight="700" text-anchor="middle">KCL 冲突：5A ≠ 2A</text>
</svg>`;

export const SVG_ACT5 = `<svg role="img" aria-label="含电流控制电流源的 KCL 与欧姆定律联立电路" viewBox="0 0 420 230" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-c5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7"/>
    </marker>
    <marker id="arr-a5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706"/>
    </marker>
    <marker id="arr-p5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#9333ea"/>
    </marker>
  </defs>
  <text x="210" y="20" fill="#475569" font-size="11" font-weight="600" text-anchor="middle">含电流控制电流源（CCCS）的 KCL + 欧姆定律联立电路</text>
  <!-- 顶部节点 a 母线与底部地线 -->
  <line x1="55" y1="50" x2="355" y2="50" stroke="#334155" stroke-width="2.2"/>
  <line x1="55" y1="180" x2="355" y2="180" stroke="#334155" stroke-width="2.2"/>
  <circle cx="155" cy="50" r="4" fill="#0284c7"/>
  <text x="155" y="40" fill="#0284c7" font-size="11" font-weight="700" text-anchor="middle">节点 a (+ v_o)</text>
  <!-- 接地符号 -->
  <line x1="205" y1="180" x2="205" y2="194" stroke="#475569" stroke-width="1.8"/>
  <line x1="193" y1="194" x2="217" y2="194" stroke="#475569" stroke-width="1.8"/>
  <line x1="197" y1="199" x2="213" y2="199" stroke="#475569" stroke-width="1.6"/>
  <line x1="201" y1="204" x2="209" y2="204" stroke="#475569" stroke-width="1.4"/>
  <!-- 支路 1: 独立电流源 15A 向上 -->
  <line x1="55" y1="50" x2="55" y2="95" stroke="#334155" stroke-width="1.8"/>
  <line x1="55" y1="135" x2="55" y2="180" stroke="#334155" stroke-width="1.8"/>
  <circle cx="55" cy="115" r="20" fill="#ffffff" stroke="#0284c7" stroke-width="2"/>
  <line x1="55" y1="127" x2="55" y2="103" stroke="#0284c7" stroke-width="2.2" marker-end="url(#arr-c5)"/>
  <text x="55" y="200" fill="#0284c7" font-size="11" font-weight="700" text-anchor="middle">I_s = 15 A</text>
  <!-- 支路 2: R1 = 6 Ω, 向下 i1 -->
  <line x1="155" y1="50" x2="155" y2="85" stroke="#334155" stroke-width="1.8"/>
  <polyline points="155,85 147,91 163,99 147,107 163,115 147,123 163,131 155,137" fill="none" stroke="#d97706" stroke-width="2"/>
  <line x1="155" y1="137" x2="155" y2="180" stroke="#334155" stroke-width="1.8"/>
  <line x1="140" y1="60" x2="140" y2="79" stroke="#d97706" stroke-width="1.8" marker-end="url(#arr-a5)"/>
  <text x="126" y="74" fill="#d97706" font-size="11" font-weight="700">i₁</text>
  <text x="180" y="116" fill="#b45309" font-size="11" font-weight="600">6 Ω</text>
  <!-- 支路 3: R2 = 3 Ω, 向下 i2 -->
  <line x1="255" y1="50" x2="255" y2="85" stroke="#334155" stroke-width="1.8"/>
  <polyline points="255,85 247,91 263,99 247,107 263,115 247,123 263,131 255,137" fill="none" stroke="#d97706" stroke-width="2"/>
  <line x1="255" y1="137" x2="255" y2="180" stroke="#334155" stroke-width="1.8"/>
  <line x1="240" y1="60" x2="240" y2="79" stroke="#d97706" stroke-width="1.8" marker-end="url(#arr-a5)"/>
  <text x="226" y="74" fill="#d97706" font-size="11" font-weight="700">i₂</text>
  <text x="280" y="116" fill="#b45309" font-size="11" font-weight="600">3 Ω</text>
  <!-- 支路 4: 受控电流源 2i1 (菱形向下) -->
  <line x1="355" y1="50" x2="355" y2="92" stroke="#334155" stroke-width="1.8"/>
  <line x1="355" y1="138" x2="355" y2="180" stroke="#334155" stroke-width="1.8"/>
  <polygon points="355,92 377,115 355,138 333,115" fill="#f3e8ff" stroke="#9333ea" stroke-width="2"/>
  <line x1="355" y1="104" x2="355" y2="126" stroke="#9333ea" stroke-width="2.2" marker-end="url(#arr-p5)"/>
  <text x="355" y="200" fill="#9333ea" font-size="11" font-weight="700" text-anchor="middle">2i₁ (向下)</text>
</svg>`;

export const SVG_ACT6 = `<svg role="img" aria-label="苏格拉底例题电路：6 A 源、2 Ω、4 Ω 与向上的 0.5 i_o 受控源" viewBox="0 0 420 230" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-g6" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="arr-a6" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706"/>
    </marker>
    <marker id="arr-p6" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#9333ea"/>
    </marker>
  </defs>
  <text x="210" y="20" fill="#475569" font-size="11" font-weight="600" text-anchor="middle">苏格拉底实战例题：求未知电流 i_o 与节点电压 v_o</text>
  <!-- 顶底母线 -->
  <line x1="55" y1="52" x2="355" y2="52" stroke="#334155" stroke-width="2.2"/>
  <line x1="55" y1="182" x2="355" y2="182" stroke="#334155" stroke-width="2.2"/>
  <circle cx="205" cy="52" r="4.5" fill="#0284c7"/>
  <text x="205" y="40" fill="#0284c7" font-size="11" font-weight="700" text-anchor="middle">节点 a (+ v_o −)</text>
  <!-- 支路 1: 6A 独立电流源 向上流入 -->
  <line x1="55" y1="52" x2="55" y2="97" stroke="#334155" stroke-width="1.8"/>
  <line x1="55" y1="137" x2="55" y2="182" stroke="#334155" stroke-width="1.8"/>
  <circle cx="55" cy="117" r="20" fill="#d1fae5" stroke="#059669" stroke-width="2"/>
  <line x1="55" y1="129" x2="55" y2="105" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-g6)"/>
  <text x="55" y="202" fill="#059669" font-size="11" font-weight="700" text-anchor="middle">I_s = 6 A (流入)</text>
  <!-- 支路 2: R1 = 2 Ω, 向下 i_o -->
  <line x1="155" y1="52" x2="155" y2="87" stroke="#334155" stroke-width="1.8"/>
  <polyline points="155,87 147,93 163,101 147,109 163,117 147,125 163,133 155,139" fill="none" stroke="#d97706" stroke-width="2"/>
  <line x1="155" y1="139" x2="155" y2="182" stroke="#334155" stroke-width="1.8"/>
  <line x1="139" y1="62" x2="139" y2="81" stroke="#d97706" stroke-width="2" marker-end="url(#arr-a6)"/>
  <text x="123" y="76" fill="#d97706" font-size="11" font-weight="700">i_o</text>
  <text x="180" y="118" fill="#b45309" font-size="11" font-weight="600">2 Ω</text>
  <!-- 支路 3: R2 = 4 Ω, 向下 i2 -->
  <line x1="255" y1="52" x2="255" y2="87" stroke="#334155" stroke-width="1.8"/>
  <polyline points="255,87 247,93 263,101 247,109 263,117 247,125 263,133 255,139" fill="none" stroke="#d97706" stroke-width="2"/>
  <line x1="255" y1="139" x2="255" y2="182" stroke="#334155" stroke-width="1.8"/>
  <line x1="239" y1="62" x2="239" y2="81" stroke="#d97706" stroke-width="2" marker-end="url(#arr-a6)"/>
  <text x="223" y="76" fill="#d97706" font-size="11" font-weight="700">i₂</text>
  <text x="280" y="118" fill="#b45309" font-size="11" font-weight="600">4 Ω</text>
  <!-- 支路 4: 受控电流源 0.5 i_o (菱形向上流入！) -->
  <line x1="355" y1="52" x2="355" y2="94" stroke="#334155" stroke-width="1.8"/>
  <line x1="355" y1="140" x2="355" y2="182" stroke="#334155" stroke-width="1.8"/>
  <polygon points="355,94 377,117 355,140 333,117" fill="#f3e8ff" stroke="#9333ea" stroke-width="2"/>
  <line x1="355" y1="128" x2="355" y2="106" stroke="#9333ea" stroke-width="2.2" marker-end="url(#arr-p6)"/>
  <text x="355" y="202" fill="#9333ea" font-size="11" font-weight="700" text-anchor="middle">0.5i_o (向上流入!)</text>
</svg>`;

export const SVG_ACT7 = `<svg role="img" aria-label="基尔霍夫双璧对偶预告：KCL 到 KVL" viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-kcl7" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="arr-kvl7" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7"/>
    </marker>
  </defs>
  <text x="210" y="22" fill="#475569" font-size="11" font-weight="600" text-anchor="middle">基尔霍夫双璧对偶预告：W1-L5 (KCL) → W1-L6 (KVL)</text>
  <!-- 左侧卡片：本节 KCL -->
  <rect x="18" y="38" width="176" height="146" rx="10" fill="#d1fae5" fill-opacity="0.35" stroke="#059669" stroke-width="1.6"/>
  <text x="106" y="58" fill="#059669" font-size="12" font-weight="700" text-anchor="middle">W1-L5：KCL（已掌握）</text>
  <line x1="66" y1="88" x2="100" y2="106" stroke="#059669" stroke-width="2" marker-end="url(#arr-kcl7)"/>
  <line x1="66" y1="126" x2="100" y2="108" stroke="#059669" stroke-width="2" marker-end="url(#arr-kcl7)"/>
  <line x1="112" y1="107" x2="148" y2="107" stroke="#d97706" stroke-width="2" marker-end="url(#arr-kcl7)"/>
  <circle cx="106" cy="107" r="6" fill="#059669"/>
  <text x="106" y="148" fill="#334155" font-size="11" font-weight="700" text-anchor="middle">Σ i_n = 0（节点 / 曲面）</text>
  <text x="106" y="168" fill="#047857" font-size="10" text-anchor="middle">物理根源：电荷守恒</text>
  <!-- 中央对偶箭头 -->
  <text x="210" y="114" fill="#475569" font-size="18" font-weight="700" text-anchor="middle">⇄</text>
  <!-- 右侧卡片：下节 KVL -->
  <rect x="226" y="38" width="176" height="146" rx="10" fill="#e0f2fe" fill-opacity="0.35" stroke="#0284c7" stroke-width="1.6" stroke-dasharray="5,3"/>
  <text x="314" y="58" fill="#0284c7" font-size="12" font-weight="700" text-anchor="middle">W1-L6：KVL（下节预告）</text>
  <rect x="274" y="78" width="80" height="48" rx="6" fill="none" stroke="#0284c7" stroke-width="2"/>
  <path d="M 304 94 A 11 11 0 1 1 304 112" fill="none" stroke="#0284c7" stroke-width="2" marker-end="url(#arr-kvl7)"/>
  <text x="314" y="148" fill="#334155" font-size="11" font-weight="700" text-anchor="middle">Σ v_m = 0（闭合回路）</text>
  <text x="314" y="168" fill="#0369a1" font-size="10" text-anchor="middle">物理根源：能量守恒</text>
</svg>`;

export const MINI_STEP1 = `<svg role="img" aria-label="第 1 步：节点 a 的四条支路方向" viewBox="0 0 220 76" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:6px;max-width:400px;margin:0 auto;"><line x1="20" y1="38" x2="200" y2="38" stroke="#334155" stroke-width="2"/><circle cx="110" cy="38" r="4" fill="#0284c7"/><text x="35" y="28" fill="#059669" font-size="10">↑6A</text><text x="85" y="58" fill="#d97706" font-size="10">↓i_o</text><text x="130" y="58" fill="#d97706" font-size="10">↓i₂</text><text x="168" y="28" fill="#9333ea" font-size="10">↑0.5i_o</text></svg>`;

export const MINI_STEP2 = `<svg role="img" aria-label="第 2 步：并联等压" viewBox="0 0 220 76" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:6px;max-width:400px;margin:0 auto;"><text x="110" y="24" fill="#0284c7" font-size="10" text-anchor="middle">并联等压：v_o = i_o·R₁ = i₂·R₂</text><text x="110" y="50" fill="#b45309" font-size="11" text-anchor="middle">R₁ = 2 Ω  ∥  R₂ = 4 Ω</text></svg>`;

export const MINI_STEP3 = `<svg role="img" aria-label="第 3 步：代回 KCL 方程" viewBox="0 0 220 76" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:6px;max-width:400px;margin:0 auto;"><text x="110" y="28" fill="#334155" font-size="10.5" text-anchor="middle">6 + 0.5 i_o = i_o + 0.5 i_o</text><text x="110" y="54" fill="#059669" font-size="10.5" text-anchor="middle">化简消去两侧 0.5 i_o → 求 v_o = 2 i_o</text></svg>`;
