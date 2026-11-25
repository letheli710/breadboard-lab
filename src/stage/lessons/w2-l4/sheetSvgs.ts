// The diagrams of the W2-L4 lesson sheet (docs/lessons/W2-L4.md), copied from the sheet by a script
// (not retyped): the six act figures and the step cards (mini_svg) of the guided-example JSON.
// They are drawn for a dark canvas; svgs.ts passes them through lightSvg (plus a few local fixes).

export const SHEET_ACT1 = `<svg id="svg-act1-gv-mapping" viewBox="0 0 860 360" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:860px;background:#0f172a;border-radius:12px;font-family:'Inter','PingFang SC',sans-serif;">
  <defs>
    <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
    <marker id="arrow-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fb7185"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="24" y="30" fill="#f8fafc" font-size="16" font-weight="700">图 1-1：电导矩阵 Gv = i 与电路支路的直写映射关系（纯独立电流源电路）</text>
  <text x="24" y="50" fill="#94a3b8" font-size="12">主对角线 Gkk = 汇入节点 k 的所有电导之和（正） | 非对角线 Gkj = 节点 k 与 j 之间的共享电导之和（取负）</text>

  <!-- Left Panel: 3-Node Circuit -->
  <rect x="20" y="66" width="440" height="274" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>

  <!-- Reference Rail (Node 0) -->
  <line x1="60" y1="295" x2="420" y2="295" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Ground Symbol -->
  <line x1="240" y1="295" x2="240" y2="312" stroke="#94a3b8" stroke-width="2"/>
  <line x1="226" y1="312" x2="254" y2="312" stroke="#94a3b8" stroke-width="2"/>
  <line x1="231" y1="318" x2="249" y2="318" stroke="#94a3b8" stroke-width="2"/>
  <line x1="236" y1="324" x2="244" y2="324" stroke="#94a3b8" stroke-width="2"/>
  <text x="262" y="318" fill="#94a3b8" font-size="12" font-weight="600">参考节点 0 (GND)</text>

  <!-- Node 1, Node 2, Node 3 -->
  <circle id="node-1" cx="130" cy="145" r="7" fill="#38bdf8" stroke="#0f172a" stroke-width="2"/>
  <text x="116" y="128" fill="#38bdf8" font-size="14" font-weight="700">v₁</text>

  <circle id="node-2" cx="265" cy="145" r="7" fill="#a78bfa" stroke="#0f172a" stroke-width="2"/>
  <text x="258" y="128" fill="#a78bfa" font-size="14" font-weight="700">v₂</text>

  <circle id="node-3" cx="390" cy="145" r="7" fill="#34d399" stroke="#0f172a" stroke-width="2"/>
  <text x="383" y="128" fill="#34d399" font-size="14" font-weight="700">v₃</text>

  <!-- Current source Is1 into Node 1 -->
  <line x1="70" y1="295" x2="70" y2="238" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="70" cy="218" r="18" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <line x1="70" y1="228" x2="70" y2="208" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-cyan)"/>
  <line x1="70" y1="200" x2="70" y2="145" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="70" y1="145" x2="123" y2="145" stroke="#e2e8f0" stroke-width="2"/>
  <text x="36" y="223" fill="#38bdf8" font-size="12" font-weight="600">i₁</text>

  <!-- Branch G1 (Node 1 to GND) -->
  <line x1="130" y1="152" x2="130" y2="195" stroke="#38bdf8" stroke-width="2.5"/>
  <rect x="118" y="195" width="24" height="52" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="148" y="225" fill="#38bdf8" font-size="12" font-weight="700">G₁</text>
  <line x1="130" y1="247" x2="130" y2="295" stroke="#38bdf8" stroke-width="2.5"/>

  <!-- Branch G12 (Node 1 to Node 2) - Highlighted Mutual -->
  <line x1="137" y1="145" x2="170" y2="145" stroke="#f59e0b" stroke-width="2.5"/>
  <rect x="170" y="133" width="56" height="24" rx="4" fill="#0f172a" stroke="#f59e0b" stroke-width="2.5"/>
  <text x="186" y="149" fill="#f59e0b" font-size="12" font-weight="700">G₁₂</text>
  <line x1="226" y1="145" x2="258" y2="145" stroke="#f59e0b" stroke-width="2.5"/>

  <!-- Branch G2 (Node 2 to GND) -->
  <line x1="265" y1="152" x2="265" y2="195" stroke="#a78bfa" stroke-width="2"/>
  <rect x="253" y="195" width="24" height="52" rx="4" fill="#0f172a" stroke="#a78bfa" stroke-width="2"/>
  <text x="283" y="225" fill="#a78bfa" font-size="12" font-weight="700">G₂</text>
  <line x1="265" y1="247" x2="265" y2="295" stroke="#a78bfa" stroke-width="2"/>

  <!-- Branch G23 (Node 2 to Node 3) -->
  <line x1="272" y1="145" x2="300" y2="145" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="300" y="133" width="56" height="24" rx="4" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="316" y="149" fill="#e2e8f0" font-size="12" font-weight="600">G₂₃</text>
  <line x1="356" y1="145" x2="383" y2="145" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Branch G3 (Node 3 to GND) -->
  <line x1="390" y1="152" x2="390" y2="195" stroke="#34d399" stroke-width="2"/>
  <rect x="378" y="195" width="24" height="52" rx="4" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="408" y="225" fill="#34d399" font-size="12" font-weight="700">G₃</text>
  <line x1="390" y1="247" x2="390" y2="295" stroke="#34d399" stroke-width="2"/>

  <!-- Top Arch Branch G13 (Node 1 to Node 3) -->
  <path d="M 130 138 L 130 92 L 232 92" fill="none" stroke="#fb7185" stroke-width="2"/>
  <rect x="232" y="80" width="56" height="24" rx="4" fill="#0f172a" stroke="#fb7185" stroke-width="2"/>
  <text x="248" y="96" fill="#fb7185" font-size="12" font-weight="700">G₁₃</text>
  <path d="M 288 92 L 390 92 L 390 138" fill="none" stroke="#fb7185" stroke-width="2"/>

  <!-- Right Panel: Conductance Matrix Gv = i -->
  <rect x="492" y="66" width="348" height="274" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="514" y="94" fill="#f8fafc" font-size="14" font-weight="700">观察法直写矩阵：G · v = i</text>

  <!-- Matrix Brackets -->
  <path d="M 522 118 L 512 118 L 512 262 L 522 262" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M 736 118 L 746 118 L 746 262 L 736 262" fill="none" stroke="#cbd5e1" stroke-width="2"/>

  <!-- Matrix Cells -->
  <!-- Row 1 -->
  <rect x="520" y="126" width="76" height="36" rx="5" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="558" y="149" text-anchor="middle" fill="#e0f2fe" font-size="11" font-weight="700">G₁+G₁₂+G₁₃</text>

  <rect x="602" y="126" width="62" height="36" rx="5" fill="#451a03" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="633" y="149" text-anchor="middle" fill="#fef3c7" font-size="12" font-weight="700">-G₁₂</text>

  <rect x="670" y="126" width="62" height="36" rx="5" fill="#4c0519" stroke="#fb7185" stroke-width="1.8"/>
  <text x="701" y="149" text-anchor="middle" fill="#ffe4e6" font-size="12" font-weight="700">-G₁₃</text>

  <!-- Row 2 -->
  <rect x="520" y="172" width="76" height="36" rx="5" fill="#451a03" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="558" y="195" text-anchor="middle" fill="#fef3c7" font-size="12" font-weight="700">-G₁₂</text>

  <rect x="602" y="172" width="62" height="36" rx="5" fill="#2e1065" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="633" y="195" text-anchor="middle" fill="#ede9fe" font-size="11" font-weight="700">G₂₂</text>

  <rect x="670" y="172" width="62" height="36" rx="5" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
  <text x="701" y="195" text-anchor="middle" fill="#cbd5e1" font-size="12" font-weight="600">-G₂₃</text>

  <!-- Row 3 -->
  <rect x="520" y="218" width="76" height="36" rx="5" fill="#4c0519" stroke="#fb7185" stroke-width="1.8"/>
  <text x="558" y="241" text-anchor="middle" fill="#ffe4e6" font-size="12" font-weight="700">-G₁₃</text>

  <rect x="602" y="218" width="62" height="36" rx="5" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
  <text x="633" y="241" text-anchor="middle" fill="#cbd5e1" font-size="12" font-weight="600">-G₂₃</text>

  <rect x="670" y="218" width="62" height="36" rx="5" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
  <text x="701" y="241" text-anchor="middle" fill="#d1fae5" font-size="11" font-weight="700">G₃₃</text>

  <!-- Vector v and = i -->
  <text x="760" y="149" fill="#38bdf8" font-size="13" font-weight="700">v₁</text>
  <text x="760" y="195" fill="#a78bfa" font-size="13" font-weight="700">v₂</text>
  <text x="760" y="241" fill="#34d399" font-size="13" font-weight="700">v₃</text>
  <text x="782" y="195" fill="#f8fafc" font-size="14" font-weight="700">=</text>
  <text x="802" y="149" fill="#38bdf8" font-size="13" font-weight="700">i₁</text>
  <text x="802" y="195" fill="#a78bfa" font-size="13" font-weight="700">i₂</text>
  <text x="802" y="241" fill="#34d399" font-size="13" font-weight="700">i₃</text>

  <!-- Mapping Callout Arrows -->
  <path d="M 226 135 C 330 112, 460 116, 600 138" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="5,4" marker-end="url(#arrow-amber)"/>
  <path d="M 288 86 C 420 68, 560 72, 695 123" fill="none" stroke="#fb7185" stroke-width="1.8" stroke-dasharray="5,4" marker-end="url(#arrow-rose)"/>

  <!-- Symmetry & Hard Rule Footer -->
  <rect x="512" y="276" width="312" height="50" rx="6" fill="#0f172a" stroke="#f43f5e" stroke-width="1.2"/>
  <text x="524" y="296" fill="#fda4af" font-size="11.5" font-weight="700">铁律红线：对称性 Gkj = Gjk 仅限“纯独立源”电路！</text>
  <text x="524" y="315" fill="#cbd5e1" font-size="11">一旦电路中出现受控源，矩阵失去对称性，必须回归标准 KCL。</text>
</svg>`;

export const SHEET_ACT2 = `<svg id="svg-act2-ri-mapping" viewBox="0 0 860 360" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:860px;background:#0f172a;border-radius:12px;font-family:'Inter','PingFang SC',sans-serif;">
  <defs>
    <marker id="arrow-m-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrow-m-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
    <marker id="arrow-m-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399"/>
    </marker>
  </defs>

  <text x="24" y="30" fill="#f8fafc" font-size="16" font-weight="700">图 2-1：电阻矩阵 Ri = v 与平面网孔支路的直写映射关系（纯独立电压源电路）</text>
  <text x="24" y="50" fill="#94a3b8" font-size="12">强制前提：平面电路 + 所有网孔电流统一取顺时针（CW）→ 主对角线自电阻正，非对角线互电阻必为负</text>

  <!-- Left Panel: 3-Mesh Planar Circuit -->
  <rect x="20" y="66" width="440" height="274" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>

  <!-- Outer Frame for 3 Meshes (M1 bottom-left, M2 bottom-right, M3 top) -->
  <!-- Bottom Rail -->
  <line x1="70" y1="305" x2="410" y2="305" stroke="#e2e8f0" stroke-width="2"/>
  <!-- Left Vertical with Vs1 -->
  <line x1="70" y1="305" x2="70" y2="262" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="70" cy="244" r="18" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="70" y="239" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="700">+</text>
  <text x="70" y="254" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="700">−</text>
  <text x="34" y="248" fill="#38bdf8" font-size="12" font-weight="700">Vs₁</text>
  <line x1="70" y1="226" x2="70" y2="195" stroke="#e2e8f0" stroke-width="2"/>

  <!-- R1 on M1 left -->
  <rect x="59" y="195" width="22" height="26" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="36" y="212" fill="#38bdf8" font-size="11.5" font-weight="700">R₁</text>
  <line x1="70" y1="195" x2="70" y2="180" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Center Vertical R12 (shared M1 & M2) -->
  <line x1="240" y1="180" x2="240" y2="215" stroke="#f59e0b" stroke-width="2.5"/>
  <rect x="228" y="215" width="24" height="50" rx="4" fill="#0f172a" stroke="#f59e0b" stroke-width="2.5"/>
  <text x="258" y="244" fill="#f59e0b" font-size="12" font-weight="700">R₁₂</text>
  <line x1="240" y1="265" x2="240" y2="305" stroke="#f59e0b" stroke-width="2.5"/>

  <!-- Right Vertical with Vs2 & R2 -->
  <line x1="410" y1="305" x2="410" y2="262" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="410" cy="244" r="18" fill="#0f172a" stroke="#a78bfa" stroke-width="2"/>
  <text x="410" y="239" text-anchor="middle" fill="#a78bfa" font-size="12" font-weight="700">+</text>
  <text x="410" y="254" text-anchor="middle" fill="#a78bfa" font-size="12" font-weight="700">−</text>
  <text x="432" y="248" fill="#a78bfa" font-size="12" font-weight="700">Vs₂</text>
  <line x1="410" y1="226" x2="410" y2="180" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Middle Horizontal: R13 (left) & R23 (right) -->
  <line x1="70" y1="180" x2="122" y2="180" stroke="#34d399" stroke-width="2.5"/>
  <rect x="122" y="169" width="54" height="22" rx="4" fill="#0f172a" stroke="#34d399" stroke-width="2.5"/>
  <text x="149" y="184" text-anchor="middle" fill="#34d399" font-size="11.5" font-weight="700">R₁₃</text>
  <line x1="176" y1="180" x2="240" y2="180" stroke="#34d399" stroke-width="2.5"/>

  <line x1="240" y1="180" x2="296" y2="180" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="296" y="169" width="54" height="22" rx="4" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="323" y="184" text-anchor="middle" fill="#e2e8f0" font-size="11.5" font-weight="600">R₂₃</text>
  <line x1="350" y1="180" x2="410" y2="180" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Top Loop (Mesh 3): R3 and Vs3 -->
  <line x1="70" y1="180" x2="70" y2="96" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="70" y1="96" x2="145" y2="96" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="145" y="85" width="52" height="22" rx="4" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="171" y="100" text-anchor="middle" fill="#34d399" font-size="11.5" font-weight="700">R₃</text>
  <line x1="197" y1="96" x2="274" y2="96" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="292" cy="96" r="17" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="284" y="100" fill="#34d399" font-size="12" font-weight="700">−</text>
  <text x="296" y="100" fill="#34d399" font-size="12" font-weight="700">+</text>
  <text x="281" y="75" fill="#34d399" font-size="11.5" font-weight="700">Vs₃</text>
  <line x1="309" y1="96" x2="410" y2="96" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="410" y1="96" x2="410" y2="180" stroke="#e2e8f0" stroke-width="2"/>

  <!-- CW Mesh Arrows -->
  <path d="M 135 232 A 22 22 0 1 1 135 262" fill="none" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-m-cyan)"/>
  <text x="148" y="252" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="700">i₁</text>

  <path d="M 315 232 A 22 22 0 1 1 315 262" fill="none" stroke="#a78bfa" stroke-width="2" marker-end="url(#arrow-m-cyan)"/>
  <text x="328" y="252" text-anchor="middle" fill="#a78bfa" font-size="13" font-weight="700">i₂</text>

  <path d="M 225 126 A 18 18 0 1 1 225 152" fill="none" stroke="#34d399" stroke-width="2" marker-end="url(#arrow-m-emerald)"/>
  <text x="236" y="143" text-anchor="middle" fill="#34d399" font-size="13" font-weight="700">i₃</text>

  <!-- Right Panel: Resistance Matrix Ri = v -->
  <rect x="492" y="66" width="348" height="274" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="514" y="94" fill="#f8fafc" font-size="14" font-weight="700">观察法直写矩阵：R · i = v</text>

  <path d="M 522 118 L 512 118 L 512 262 L 522 262" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M 736 118 L 746 118 L 746 262 L 736 262" fill="none" stroke="#cbd5e1" stroke-width="2"/>

  <!-- Row 1 -->
  <rect x="520" y="126" width="76" height="36" rx="5" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="558" y="149" text-anchor="middle" fill="#e0f2fe" font-size="11" font-weight="700">R₁+R₁₂+R₁₃</text>

  <rect x="602" y="126" width="62" height="36" rx="5" fill="#451a03" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="633" y="149" text-anchor="middle" fill="#fef3c7" font-size="12" font-weight="700">-R₁₂</text>

  <rect x="670" y="126" width="62" height="36" rx="5" fill="#064e3b" stroke="#34d399" stroke-width="1.8"/>
  <text x="701" y="149" text-anchor="middle" fill="#d1fae5" font-size="12" font-weight="700">-R₁₃</text>

  <!-- Row 2 -->
  <rect x="520" y="172" width="76" height="36" rx="5" fill="#451a03" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="558" y="195" text-anchor="middle" fill="#fef3c7" font-size="12" font-weight="700">-R₁₂</text>

  <rect x="602" y="172" width="62" height="36" rx="5" fill="#2e1065" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="633" y="195" text-anchor="middle" fill="#ede9fe" font-size="11" font-weight="700">R₂₂</text>

  <rect x="670" y="172" width="62" height="36" rx="5" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
  <text x="701" y="195" text-anchor="middle" fill="#cbd5e1" font-size="12" font-weight="600">-R₂₃</text>

  <!-- Row 3 -->
  <rect x="520" y="218" width="76" height="36" rx="5" fill="#064e3b" stroke="#34d399" stroke-width="1.8"/>
  <text x="558" y="241" text-anchor="middle" fill="#d1fae5" font-size="12" font-weight="700">-R₁₃</text>

  <rect x="602" y="218" width="62" height="36" rx="5" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
  <text x="633" y="241" text-anchor="middle" fill="#cbd5e1" font-size="12" font-weight="600">-R₂₃</text>

  <rect x="670" y="218" width="62" height="36" rx="5" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
  <text x="701" y="241" text-anchor="middle" fill="#d1fae5" font-size="11" font-weight="700">R₃₃</text>

  <!-- Vectors i and v -->
  <text x="760" y="149" fill="#38bdf8" font-size="13" font-weight="700">i₁</text>
  <text x="760" y="195" fill="#a78bfa" font-size="13" font-weight="700">i₂</text>
  <text x="760" y="241" fill="#34d399" font-size="13" font-weight="700">i₃</text>
  <text x="782" y="195" fill="#f8fafc" font-size="14" font-weight="700">=</text>
  <text x="802" y="149" fill="#38bdf8" font-size="12" font-weight="700">v₁</text>
  <text x="802" y="195" fill="#a78bfa" font-size="12" font-weight="700">v₂</text>
  <text x="802" y="241" fill="#34d399" font-size="12" font-weight="700">v₃</text>

  <!-- Mapping Callouts -->
  <path d="M 254 236 C 350 236, 460 198, 518 190" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="5,4" marker-end="url(#arrow-m-amber)"/>
  <path d="M 162 168 C 310 120, 520 104, 695 123" fill="none" stroke="#34d399" stroke-width="1.8" stroke-dasharray="5,4" marker-end="url(#arrow-m-emerald)"/>

  <!-- Footer Note -->
  <rect x="512" y="276" width="312" height="50" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2"/>
  <text x="524" y="296" fill="#7dd3fc" font-size="11.5" font-weight="700">右端电压源符号法则（极易出错！）：</text>
  <text x="524" y="315" fill="#cbd5e1" font-size="11">沿顺时针绕行：由 − 到 +（升压）记 +Vs；由 + 到 − 记 −Vs</text>
</svg>`;

export const SHEET_ACT3 = `<svg id="svg-act3-3x3-nodal" viewBox="0 0 820 340" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:820px;background:#0f172a;border-radius:12px;font-family:'Inter','PingFang SC',sans-serif;">
  <defs>
    <marker id="arr-3-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-3-p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#a78bfa"/>
    </marker>
    <marker id="arr-3-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fb7185"/>
    </marker>
  </defs>

  <text x="24" y="30" fill="#f8fafc" font-size="16" font-weight="700">图 3-1：3×3 节点观察法实战例题（已知所有电阻与独立电流源，求 v₁, v₂, v₃）</text>
  <text x="24" y="49" fill="#94a3b8" font-size="12">提示：先在心中把每个电阻 R 换算为电导 G = 1/R（单位：S），再按行直写矩阵</text>

  <!-- Main Ground Rail -->
  <line x1="70" y1="286" x2="740" y2="286" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="405" y1="286" x2="405" y2="304" stroke="#94a3b8" stroke-width="2"/>
  <line x1="391" y1="304" x2="419" y2="304" stroke="#94a3b8" stroke-width="2"/>
  <line x1="396" y1="310" x2="414" y2="310" stroke="#94a3b8" stroke-width="2"/>
  <line x1="401" y1="316" x2="409" y2="316" stroke="#94a3b8" stroke-width="2"/>
  <text x="428" y="310" fill="#94a3b8" font-size="12" font-weight="600">参考节点 0 (0 V)</text>

  <!-- Nodes 1, 2, 3 -->
  <circle cx="190" cy="146" r="7" fill="#38bdf8" stroke="#0f172a" stroke-width="2"/>
  <text x="172" y="130" fill="#38bdf8" font-size="14" font-weight="700">节点 1 (v₁)</text>

  <circle cx="405" cy="146" r="7" fill="#a78bfa" stroke="#0f172a" stroke-width="2"/>
  <text x="372" y="130" fill="#a78bfa" font-size="14" font-weight="700">节点 2 (v₂)</text>

  <circle cx="620" cy="146" r="7" fill="#34d399" stroke="#0f172a" stroke-width="2"/>
  <text x="588" y="130" fill="#34d399" font-size="14" font-weight="700">节点 3 (v₃)</text>

  <!-- Is1 = 12 A (up into Node 1) -->
  <line x1="95" y1="286" x2="95" y2="236" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="95" cy="216" r="19" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <line x1="95" y1="227" x2="95" y2="205" stroke="#38bdf8" stroke-width="2.2" marker-end="url(#arr-3-c)"/>
  <line x1="95" y1="197" x2="95" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="95" y1="146" x2="183" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <text x="34" y="212" fill="#38bdf8" font-size="12.5" font-weight="700">12 A</text>
  <text x="34" y="228" fill="#7dd3fc" font-size="10.5">(流入1)</text>

  <!-- R1 = 2 ohm (G=0.5 S) Node 1 to GND -->
  <line x1="190" y1="153" x2="190" y2="192" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="178" y="192" width="24" height="52" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="209" y="214" fill="#f8fafc" font-size="12" font-weight="700">2 Ω</text>
  <text x="209" y="230" fill="#38bdf8" font-size="11">(0.5 S)</text>
  <line x1="190" y1="244" x2="190" y2="286" stroke="#e2e8f0" stroke-width="2"/>

  <!-- R2 = 1 ohm (G=1 S) Node 1 to Node 2 -->
  <line x1="197" y1="146" x2="262" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="262" y="134" width="66" height="24" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <text x="295" y="150" text-anchor="middle" fill="#fef3c7" font-size="12" font-weight="700">1 Ω (1 S)</text>
  <line x1="328" y1="146" x2="398" y2="146" stroke="#e2e8f0" stroke-width="2"/>

  <!-- R3 = 1 ohm (G=1 S) Node 2 to GND -->
  <line x1="405" y1="153" x2="405" y2="192" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="393" y="192" width="24" height="52" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
  <text x="424" y="214" fill="#f8fafc" font-size="12" font-weight="700">1 Ω</text>
  <text x="424" y="230" fill="#a78bfa" font-size="11">(1 S)</text>
  <line x1="405" y1="244" x2="405" y2="286" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Is2 = 4 A (up into Node 2, offset left of R3) -->
  <line x1="340" y1="286" x2="340" y2="236" stroke="#e2e8f0" stroke-width="1.8"/>
  <circle cx="340" cy="216" r="18" fill="#0f172a" stroke="#a78bfa" stroke-width="2"/>
  <line x1="340" y1="226" x2="340" y2="206" stroke="#a78bfa" stroke-width="2" marker-end="url(#arr-3-p)"/>
  <line x1="340" y1="198" x2="340" y2="174" stroke="#e2e8f0" stroke-width="1.8"/>
  <line x1="340" y1="174" x2="405" y2="174" stroke="#e2e8f0" stroke-width="1.8"/>
  <text x="292" y="214" fill="#a78bfa" font-size="12" font-weight="700">4 A</text>
  <text x="280" y="229" fill="#c4b5fd" font-size="10.5">(流入2)</text>

  <!-- R4 = 1 ohm (G=1 S) Node 2 to Node 3 -->
  <line x1="412" y1="146" x2="478" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="478" y="134" width="66" height="24" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <text x="511" y="150" text-anchor="middle" fill="#fef3c7" font-size="12" font-weight="700">1 Ω (1 S)</text>
  <line x1="544" y1="146" x2="613" y2="146" stroke="#e2e8f0" stroke-width="2"/>

  <!-- R5 = 2 ohm (G=0.5 S) Node 3 to GND -->
  <line x1="620" y1="153" x2="620" y2="192" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="608" y="192" width="24" height="52" rx="4" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="562" y="214" fill="#f8fafc" font-size="12" font-weight="700">2 Ω</text>
  <text x="556" y="230" fill="#34d399" font-size="11">(0.5 S)</text>
  <line x1="620" y1="244" x2="620" y2="286" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Is3 = 3 A (DOWN out of Node 3!) -->
  <line x1="715" y1="286" x2="715" y2="236" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="715" cy="216" r="19" fill="#0f172a" stroke="#fb7185" stroke-width="2"/>
  <line x1="715" y1="205" x2="715" y2="227" stroke="#fb7185" stroke-width="2.2" marker-end="url(#arr-3-r)"/>
  <line x1="715" y1="197" x2="715" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="715" y1="146" x2="627" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <text x="742" y="212" fill="#fb7185" font-size="12.5" font-weight="700">3 A</text>
  <text x="742" y="228" fill="#fda4af" font-size="10.5">(流出3!)</text>

  <!-- Top Arch R6 = 2 ohm (G=0.5 S) Node 1 to Node 3 -->
  <path d="M 190 139 L 190 82 L 368 82" fill="none" stroke="#fb7185" stroke-width="2"/>
  <rect x="368" y="70" width="76" height="24" rx="4" fill="#1e293b" stroke="#fb7185" stroke-width="2"/>
  <text x="406" y="86" text-anchor="middle" fill="#ffe4e6" font-size="12" font-weight="700">2 Ω (0.5 S)</text>
  <path d="M 444 82 L 620 82 L 620 139" fill="none" stroke="#fb7185" stroke-width="2"/>
</svg>`;

export const SHEET_ACT4 = `<svg id="svg-act4-nodal-vs-mesh-compare" viewBox="0 0 880 390" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:880px;background:#0f172a;border-radius:12px;font-family:'Inter','PingFang SC',sans-serif;">
  <defs>
    <marker id="arr-4-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-4-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fb7185"/>
    </marker>
    <marker id="arr-4-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
  </defs>

  <text x="24" y="30" fill="#f8fafc" font-size="16" font-weight="700">图 4-1：同一电路双视角对比——节点法（2 方程秒杀）vs 网孔法（4 方程 + 超网孔）</text>
  <text x="24" y="49" fill="#94a3b8" font-size="12">拓扑参数：总节点数 N = 3，支路数 B = 6 → 节点方程数 = N - 1 = 2；网孔方程数 = B - N + 1 = 4</text>

  <!-- LEFT PANEL: NODAL VIEW (2 Equations) -->
  <rect x="20" y="64" width="410" height="306" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <rect x="34" y="76" width="192" height="26" rx="13" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
  <text x="130" y="93" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700">节点视角：仅 2 个未知节点 ✓</text>

  <!-- Highlight Node 1 Zone -->
  <line x1="56" y1="184" x2="152" y2="184" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" opacity="0.35"/>
  <circle cx="152" cy="184" r="7" fill="#38bdf8"/>
  <text x="86" y="172" fill="#38bdf8" font-size="13" font-weight="700">节点 1 (v₁)</text>

  <!-- Highlight Node 2 Zone -->
  <line x1="296" y1="184" x2="394" y2="184" stroke="#a78bfa" stroke-width="5" stroke-linecap="round" opacity="0.35"/>
  <circle cx="296" cy="184" r="7" fill="#a78bfa"/>
  <text x="310" y="172" fill="#a78bfa" font-size="13" font-weight="700">节点 2 (v₂)</text>

  <!-- Ground Rail -->
  <line x1="56" y1="312" x2="394" y2="312" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="225" y="330" text-anchor="middle" fill="#94a3b8" font-size="11.5" font-weight="600">参考节点 0 (GND)</text>

  <!-- R1 = 4 ohm (outer left) -->
  <line x1="56" y1="184" x2="56" y2="224" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="46" y="224" width="20" height="44" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="32" y="250" fill="#e2e8f0" font-size="11" font-weight="600">4Ω</text>
  <line x1="56" y1="268" x2="56" y2="312" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Is1 = 4 A (interior left, up into Node 1) -->
  <line x1="152" y1="184" x2="152" y2="228" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="152" cy="246" r="16" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <line x1="152" y1="255" x2="152" y2="237" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-4-c)"/>
  <text x="114" y="250" fill="#38bdf8" font-size="11" font-weight="700">4 A</text>
  <line x1="152" y1="262" x2="152" y2="312" stroke="#e2e8f0" stroke-width="2"/>

  <!-- R2 = 2 ohm (between Node 1 and Node 2) -->
  <line x1="159" y1="184" x2="196" y2="184" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="196" y="174" width="56" height="20" rx="3" fill="#0f172a" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="224" y="188" text-anchor="middle" fill="#fef3c7" font-size="11" font-weight="700">2 Ω</text>
  <line x1="252" y1="184" x2="289" y2="184" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Is3 = 2 A (top arch from Node 2 to Node 1, pointing left) -->
  <path d="M 152 177 L 152 128 L 208 128" fill="none" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="224" cy="128" r="16" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <line x1="233" y1="128" x2="215" y2="128" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-4-c)"/>
  <text x="224" y="106" text-anchor="middle" fill="#38bdf8" font-size="11" font-weight="700">2 A (2→1)</text>
  <path d="M 240 128 L 296 128 L 296 177" fill="none" stroke="#e2e8f0" stroke-width="2"/>

  <!-- R3 = 6 ohm (between Node 2 and GND) -->
  <line x1="296" y1="184" x2="296" y2="224" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="286" y="224" width="20" height="44" rx="3" fill="#0f172a" stroke="#a78bfa" stroke-width="1.8"/>
  <text x="266" y="250" fill="#e2e8f0" font-size="11" font-weight="600">6Ω</text>
  <line x1="296" y1="268" x2="296" y2="312" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Is2 = 4 A (outer right, up into Node 2) -->
  <line x1="394" y1="184" x2="394" y2="228" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="394" cy="246" r="16" fill="#0f172a" stroke="#a78bfa" stroke-width="1.8"/>
  <line x1="394" y1="255" x2="394" y2="237" stroke="#a78bfa" stroke-width="2" marker-end="url(#arr-4-c)"/>
  <text x="356" y="250" fill="#a78bfa" font-size="11" font-weight="700">4 A</text>
  <line x1="394" y1="262" x2="394" y2="312" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Summary pill left -->
  <text x="225" y="356" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700">观察法直写 2×2 矩阵，0 超节点，5 秒列完！</text>

  <!-- RIGHT PANEL: MESH VIEW (4 Equations + Supermesh) -->
  <rect x="450" y="64" width="410" height="306" rx="10" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <rect x="464" y="76" width="236" height="26" rx="13" fill="#4c0519" stroke="#f43f5e" stroke-width="1"/>
  <text x="582" y="93" text-anchor="middle" fill="#fda4af" font-size="12" font-weight="700">网孔视角：4 个网孔 + 1 个超网孔 ✗</text>

  <!-- Supermesh 1-2 Dashed Enclosure -->
  <rect x="478" y="176" width="256" height="144" rx="10" fill="#f43f5e" fill-opacity="0.08" stroke="#f43f5e" stroke-width="1.8" stroke-dasharray="6,4"/>
  <text x="606" y="335" text-anchor="middle" fill="#fda4af" font-size="11" font-weight="700">超网孔 1-2（因内部含 4 A 电流源）</text>

  <!-- Same Circuit Topology on Right -->
  <line x1="486" y1="184" x2="582" y2="184" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="726" y1="184" x2="824" y2="184" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="486" y1="312" x2="824" y2="312" stroke="#e2e8f0" stroke-width="2"/>

  <!-- R1 = 4 ohm -->
  <line x1="486" y1="184" x2="486" y2="224" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="476" y="224" width="20" height="44" rx="3" fill="#0f172a" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="486" y1="268" x2="486" y2="312" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Is1 = 4 A (shared M1 & M2 -> causes Supermesh!) -->
  <line x1="582" y1="184" x2="582" y2="228" stroke="#f43f5e" stroke-width="2"/>
  <circle cx="582" cy="246" r="15" fill="#0f172a" stroke="#f43f5e" stroke-width="2"/>
  <line x1="582" y1="254" x2="582" y2="238" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-4-r)"/>
  <line x1="582" y1="261" x2="582" y2="312" stroke="#f43f5e" stroke-width="2"/>

  <!-- R2 = 2 ohm -->
  <line x1="582" y1="184" x2="626" y2="184" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="626" y="174" width="56" height="20" rx="3" fill="#0f172a" stroke="#94a3b8" stroke-width="1.8"/>
  <text x="654" y="188" text-anchor="middle" fill="#e2e8f0" font-size="11">2 Ω</text>
  <line x1="682" y1="184" x2="726" y2="184" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Is3 = 2 A (top) -->
  <path d="M 582 184 L 582 128 L 638 128" fill="none" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="654" cy="128" r="15" fill="#0f172a" stroke="#f59e0b" stroke-width="1.8"/>
  <line x1="662" y1="128" x2="646" y2="128" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr-4-a)"/>
  <path d="M 669 128 L 726 128 L 726 184" fill="none" stroke="#e2e8f0" stroke-width="2"/>

  <!-- R3 = 6 ohm -->
  <line x1="726" y1="184" x2="726" y2="224" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="716" y="224" width="20" height="44" rx="3" fill="#0f172a" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="726" y1="268" x2="726" y2="312" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Is2 = 4 A (outer right) -->
  <line x1="824" y1="184" x2="824" y2="228" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="824" cy="246" r="15" fill="#0f172a" stroke="#f59e0b" stroke-width="1.8"/>
  <line x1="824" y1="254" x2="824" y2="238" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr-4-a)"/>
  <line x1="824" y1="261" x2="824" y2="312" stroke="#e2e8f0" stroke-width="2"/>

  <!-- 4 Mesh Current Loops -->
  <path d="M 526 236 A 16 16 0 1 1 526 260" fill="none" stroke="#fb7185" stroke-width="2" marker-end="url(#arr-4-r)"/>
  <text x="536" y="253" text-anchor="middle" fill="#fb7185" font-size="12" font-weight="700">i₁</text>

  <path d="M 644 236 A 18 18 0 1 1 644 262" fill="none" stroke="#fb7185" stroke-width="2" marker-end="url(#arr-4-r)"/>
  <text x="655" y="254" text-anchor="middle" fill="#fb7185" font-size="12" font-weight="700">i₂</text>

  <path d="M 644 148 A 12 12 0 1 1 644 166" fill="none" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#arr-4-a)"/>
  <text x="654" y="162" text-anchor="middle" fill="#f59e0b" font-size="11.5" font-weight="700">i₃</text>

  <path d="M 766 236 A 16 16 0 1 1 766 260" fill="none" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr-4-a)"/>
  <text x="776" y="253" text-anchor="middle" fill="#f59e0b" font-size="12" font-weight="700">i₄</text>

  <text x="655" y="356" text-anchor="middle" fill="#fda4af" font-size="12" font-weight="700">无法用观察法！需设 4 个未知量 + 超网孔 + 反推节点电压</text>
</svg>`;

export const SHEET_ACT5 = `<svg id="svg-act5-decision-and-nonplanar" viewBox="0 0 880 410" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:880px;background:#0f172a;border-radius:12px;font-family:'Inter','PingFang SC',sans-serif;">
  <defs>
    <marker id="arr-5-w" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8"/>
    </marker>
    <marker id="arr-5-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399"/>
    </marker>
    <marker id="arr-5-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
  </defs>

  <text x="24" y="30" fill="#f8fafc" font-size="16" font-weight="700">图 5-1：节点法 vs 网孔法四步工程选型决策树 &amp; 经典非平面电路（K₃,₃ 交叉桥）</text>

  <!-- LEFT HALF: 4-Step Decision Tree -->
  <rect x="20" y="48" width="460" height="344" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="40" y="74" fill="#38bdf8" font-size="13.5" font-weight="700">工程选型 4 级决策漏斗（Sadiku 3.7）</text>

  <!-- Step 1: Planarity -->
  <rect x="40" y="88" width="230" height="48" rx="8" fill="#4c0519" stroke="#f43f5e" stroke-width="1.8"/>
  <text x="155" y="108" text-anchor="middle" fill="#ffe4e6" font-size="12" font-weight="700">① 是否为非平面电路？</text>
  <text x="155" y="125" text-anchor="middle" fill="#fda4af" font-size="10.5">（存在无法消除的导线交叉）</text>

  <line x1="270" y1="112" x2="324" y2="112" stroke="#f43f5e" stroke-width="1.8" marker-end="url(#arr-5-w)"/>
  <text x="296" y="105" text-anchor="middle" fill="#fda4af" font-size="10.5" font-weight="700">是</text>
  <rect x="328" y="92" width="136" height="40" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.8"/>
  <text x="396" y="110" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">强制节点法</text>
  <text x="396" y="125" text-anchor="middle" fill="#a7f3d0" font-size="10">（网孔法彻底失效）</text>

  <line x1="155" y1="136" x2="155" y2="160" stroke="#94a3b8" stroke-width="1.8" marker-end="url(#arr-5-w)"/>
  <text x="168" y="152" fill="#94a3b8" font-size="10.5">否（平面）</text>

  <!-- Step 2: Equation Count -->
  <rect x="40" y="164" width="230" height="48" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="155" y="184" text-anchor="middle" fill="#e0f2fe" font-size="12" font-weight="700">② 比较有效方程数</text>
  <text x="155" y="201" text-anchor="middle" fill="#7dd3fc" font-size="10.5">节点数 (N-1) vs 网孔数 M</text>

  <line x1="270" y1="188" x2="324" y2="188" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#arr-5-c)"/>
  <text x="296" y="181" text-anchor="middle" fill="#7dd3fc" font-size="10">差异明显</text>
  <rect x="328" y="168" width="136" height="40" rx="6" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="396" y="186" text-anchor="middle" fill="#e0f2fe" font-size="11.5" font-weight="700">谁方程少选谁</text>
  <text x="396" y="201" text-anchor="middle" fill="#bae6fd" font-size="10">（并联多→节点；串联多→网孔）</text>

  <line x1="155" y1="212" x2="155" y2="236" stroke="#94a3b8" stroke-width="1.8" marker-end="url(#arr-5-w)"/>
  <text x="168" y="228" fill="#94a3b8" font-size="10.5">方程数相近</text>

  <!-- Step 3: Source Type -->
  <rect x="40" y="240" width="230" height="48" rx="8" fill="#0f172a" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="155" y="260" text-anchor="middle" fill="#fef3c7" font-size="12" font-weight="700">③ 检查主导电源类型</text>
  <text x="155" y="277" text-anchor="middle" fill="#fcd34d" font-size="10.5">（能否触发观察法直写？）</text>

  <line x1="270" y1="264" x2="324" y2="264" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#arr-5-w)"/>
  <rect x="328" y="242" width="136" height="44" rx="6" fill="#451a03" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="396" y="260" text-anchor="middle" fill="#fef3c7" font-size="10.8" font-weight="700">电流源多 → 节点法</text>
  <text x="396" y="277" text-anchor="middle" fill="#fde68a" font-size="10.8" font-weight="700">电压源多 → 网孔法</text>

  <line x1="155" y1="288" x2="155" y2="312" stroke="#94a3b8" stroke-width="1.8" marker-end="url(#arr-5-w)"/>

  <!-- Step 4: Target Variable -->
  <rect x="40" y="316" width="424" height="58" rx="8" fill="#0f172a" stroke="#a78bfa" stroke-width="1.8"/>
  <text x="252" y="338" text-anchor="middle" fill="#ede9fe" font-size="12" font-weight="700">④ 看目标待求量与器件类型（最终决胜）</text>
  <text x="252" y="358" text-anchor="middle" fill="#c4b5fd" font-size="11">求节点电压 / 含运放或晶体管电路 → 节点法  |  求支路电流 / 串联回路功率 → 网孔法</text>

  <!-- RIGHT HALF: Classic Non-Planar K3,3 Crossing Bridge Circuit -->
  <rect x="500" y="48" width="360" height="344" rx="10" fill="#1e293b" stroke="#f43f5e" stroke-width="1.8"/>
  <text x="520" y="74" fill="#fda4af" font-size="13.5" font-weight="700">网孔法禁区：经典非平面电路（K₃,₃ 拓扑）</text>
  <text x="520" y="92" fill="#94a3b8" font-size="11">顶部 3 节点 (A,B,C) 与底部 3 节点 (D,E,F) 两两全连通</text>

  <!-- Top 3 Nodes A, B, C -->
  <!-- Bottom 3 Nodes D, E, F -->
  <!-- Draw 9 edges (resistors simplified as lines with bridge arcs) -->
  <!-- A(560,138), B(680,138), C(800,138) -->
  <!-- D(560,278), E(680,278), F(800,278) -->

  <!-- Vertical Edges A-D, B-E, C-F -->
  <line x1="560" y1="138" x2="560" y2="278" stroke="#64748b" stroke-width="2"/>
  <line x1="680" y1="138" x2="680" y2="278" stroke="#64748b" stroke-width="2"/>
  <line x1="800" y1="138" x2="800" y2="278" stroke="#64748b" stroke-width="2"/>

  <!-- Diagonal Edges -->
  <line x1="560" y1="138" x2="680" y2="278" stroke="#38bdf8" stroke-width="2"/>
  <line x1="560" y1="138" x2="800" y2="278" stroke="#f43f5e" stroke-width="2.5"/>
  <line x1="680" y1="138" x2="560" y2="278" stroke="#38bdf8" stroke-width="2"/>
  <line x1="680" y1="138" x2="800" y2="278" stroke="#38bdf8" stroke-width="2"/>
  <line x1="800" y1="138" x2="560" y2="278" stroke="#f43f5e" stroke-width="2.5"/>
  <line x1="800" y1="138" x2="680" y2="278" stroke="#38bdf8" stroke-width="2"/>

  <!-- Highlight Irreducible Crossover Point at Center (680, 208) -->
  <circle cx="680" cy="208" r="18" fill="#f43f5e" fill-opacity="0.22" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,2"/>
  <text x="712" y="206" fill="#fda4af" font-size="11" font-weight="700">不可消除的</text>
  <text x="712" y="220" fill="#fda4af" font-size="11" font-weight="700">立体交叉桥!</text>

  <!-- Node Dots -->
  <circle cx="560" cy="138" r="8" fill="#38bdf8" stroke="#0f172a" stroke-width="2"/>
  <text x="560" y="122" text-anchor="middle" fill="#38bdf8" font-size="12.5" font-weight="700">A</text>
  <circle cx="680" cy="138" r="8" fill="#38bdf8" stroke="#0f172a" stroke-width="2"/>
  <text x="680" y="122" text-anchor="middle" fill="#38bdf8" font-size="12.5" font-weight="700">B</text>
  <circle cx="800" cy="138" r="8" fill="#38bdf8" stroke="#0f172a" stroke-width="2"/>
  <text x="800" y="122" text-anchor="middle" fill="#38bdf8" font-size="12.5" font-weight="700">C</text>

  <circle cx="560" cy="278" r="8" fill="#a78bfa" stroke="#0f172a" stroke-width="2"/>
  <text x="560" y="300" text-anchor="middle" fill="#a78bfa" font-size="12.5" font-weight="700">D</text>
  <circle cx="680" cy="278" r="8" fill="#a78bfa" stroke="#0f172a" stroke-width="2"/>
  <text x="680" y="300" text-anchor="middle" fill="#a78bfa" font-size="12.5" font-weight="700">E</text>
  <circle cx="800" cy="278" r="8" fill="#a78bfa" stroke="#0f172a" stroke-width="2"/>
  <text x="800" y="300" text-anchor="middle" fill="#a78bfa" font-size="12.5" font-weight="700">F (GND)</text>

  <!-- Explanation Box -->
  <rect x="520" y="314" width="320" height="62" rx="6" fill="#0f172a" stroke="#475569" stroke-width="1.2"/>
  <text x="532" y="333" fill="#f8fafc" font-size="11.2" font-weight="700">为何非平面电路绝对不能用网孔法？</text>
  <text x="532" y="350" fill="#cbd5e1" font-size="10.5">“网孔”定义为内部不含任何其他支路的平面窗口；</text>
  <text x="532" y="366" fill="#6ee7b7" font-size="10.5">K₃,₃ 无论如何拉扯重绘都必有交叉 → 只能用节点法！</text>
</svg>`;

export const SHEET_ACT6 = `<svg id="svg-act6-comprehensive-mesh" viewBox="0 0 820 350" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:820px;background:#0f172a;border-radius:12px;font-family:'Inter','PingFang SC',sans-serif;">
  <defs>
    <marker id="arr-6-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-6-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
    <marker id="arr-6-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399"/>
    </marker>
  </defs>

  <text x="24" y="30" fill="#f8fafc" font-size="16" font-weight="700">图 6-1：综合实战例题——选型决策 + 3×3 电阻矩阵直写（求中心 4 Ω 支路向下电流 Iₒ）</text>
  <text x="24" y="49" fill="#94a3b8" font-size="12">已知：3 个独立电压源（18 V, 3 V, 8 V）与 6 个电阻，不含受控源，平面电路</text>

  <!-- Bottom Rail -->
  <line x1="120" y1="306" x2="700" y2="306" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- Left Outer Edge (Mesh 1): Vs1 = 18 V (+ top, - bottom), R1 = 2 ohm -->
  <line x1="120" y1="306" x2="120" y2="270" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="120" cy="250" r="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="120" y="245" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="700">+</text>
  <text x="120" y="261" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="700">−</text>
  <text x="64" y="255" fill="#38bdf8" font-size="13" font-weight="700">18 V</text>
  <line x1="120" y1="230" x2="120" y2="212" stroke="#e2e8f0" stroke-width="2.2"/>
  <rect x="108" y="176" width="24" height="36" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="72" y="199" fill="#f8fafc" font-size="12.5" font-weight="700">2 Ω</text>
  <line x1="120" y1="176" x2="120" y2="162" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- Center Vertical Branch (Shared M1 & M2): R12 = 4 ohm, target Io downward -->
  <line x1="410" y1="162" x2="410" y2="206" stroke="#f59e0b" stroke-width="2.5"/>
  <rect x="398" y="206" width="24" height="54" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="2.5"/>
  <text x="432" y="238" fill="#fef3c7" font-size="13" font-weight="700">4 Ω</text>
  <line x1="410" y1="260" x2="410" y2="306" stroke="#f59e0b" stroke-width="2.5"/>
  <!-- Target Io Arrow -->
  <line x1="382" y1="214" x2="382" y2="254" stroke="#f59e0b" stroke-width="2.4" marker-end="url(#arr-6-a)"/>
  <text x="358" y="239" fill="#f59e0b" font-size="14" font-weight="700">Iₒ</text>

  <!-- Right Outer Edge (Mesh 2): Vs2 = 3 V (+ top, - bottom), R2 = 3 ohm -->
  <line x1="700" y1="306" x2="700" y2="270" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="700" cy="250" r="20" fill="#0f172a" stroke="#a78bfa" stroke-width="2.2"/>
  <text x="700" y="245" text-anchor="middle" fill="#a78bfa" font-size="13" font-weight="700">+</text>
  <text x="700" y="261" text-anchor="middle" fill="#a78bfa" font-size="13" font-weight="700">−</text>
  <text x="728" y="255" fill="#a78bfa" font-size="13" font-weight="700">3 V</text>
  <line x1="700" y1="230" x2="700" y2="212" stroke="#e2e8f0" stroke-width="2.2"/>
  <rect x="688" y="176" width="24" height="36" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
  <text x="724" y="199" fill="#f8fafc" font-size="12.5" font-weight="700">3 Ω</text>
  <line x1="700" y1="176" x2="700" y2="162" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- Middle Horizontal: R13 = 2 ohm (left) & R23 = 1 ohm (right) -->
  <line x1="120" y1="162" x2="232" y2="162" stroke="#e2e8f0" stroke-width="2.2"/>
  <rect x="232" y="150" width="66" height="24" rx="4" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="265" y="166" text-anchor="middle" fill="#d1fae5" font-size="12.5" font-weight="700">2 Ω</text>
  <line x1="298" y1="162" x2="410" y2="162" stroke="#e2e8f0" stroke-width="2.2"/>

  <line x1="410" y1="162" x2="522" y2="162" stroke="#e2e8f0" stroke-width="2.2"/>
  <rect x="522" y="150" width="66" height="24" rx="4" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="555" y="166" text-anchor="middle" fill="#d1fae5" font-size="12.5" font-weight="700">1 Ω</text>
  <line x1="588" y1="162" x2="700" y2="162" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- Top Loop (Mesh 3): R3 = 3 ohm & Vs3 = 8 V (- left, + right -> +8V CW rise!) -->
  <line x1="120" y1="162" x2="120" y2="86" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="120" y1="86" x2="242" y2="86" stroke="#e2e8f0" stroke-width="2.2"/>
  <rect x="242" y="74" width="66" height="24" rx="4" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="275" y="90" text-anchor="middle" fill="#d1fae5" font-size="12.5" font-weight="700">3 Ω</text>
  <line x1="308" y1="86" x2="480" y2="86" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="500" cy="86" r="20" fill="#0f172a" stroke="#34d399" stroke-width="2.2"/>
  <text x="491" y="91" fill="#34d399" font-size="13" font-weight="700">−</text>
  <text x="504" y="91" fill="#34d399" font-size="13" font-weight="700">+</text>
  <text x="500" y="60" text-anchor="middle" fill="#34d399" font-size="13" font-weight="700">8 V</text>
  <line x1="520" y1="86" x2="700" y2="86" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="700" y1="86" x2="700" y2="162" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- CW Mesh Arrows i1, i2, i3 -->
  <path d="M 248 220 A 24 24 0 1 1 248 256" fill="none" stroke="#38bdf8" stroke-width="2.2" marker-end="url(#arr-6-c)"/>
  <text x="262" y="244" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="700">i₁</text>

  <path d="M 542 220 A 24 24 0 1 1 542 256" fill="none" stroke="#a78bfa" stroke-width="2.2" marker-end="url(#arr-6-c)"/>
  <text x="556" y="244" text-anchor="middle" fill="#a78bfa" font-size="14" font-weight="700">i₂</text>

  <path d="M 396 112 A 18 18 0 1 1 396 138" fill="none" stroke="#34d399" stroke-width="2.2" marker-end="url(#arr-6-g)"/>
  <text x="408" y="130" text-anchor="middle" fill="#34d399" font-size="14" font-weight="700">i₃</text>
</svg>`;

export const SHEET_MINI1 = `<svg viewBox='0 0 260 110' xmlns='http://www.w3.org/2000/svg' style='background:#0f172a;border-radius:8px;'><rect x='12' y='18' width='108' height='74' rx='6' fill='#1e293b' stroke='#f43f5e' stroke-width='1.5'/><text x='66' y='44' text-anchor='middle' fill='#fda4af' font-size='11' font-weight='700'>节点法</text><text x='66' y='64' text-anchor='middle' fill='#cbd5e1' font-size='10'>4 未知节点 + 超节点</text><rect x='140' y='18' width='108' height='74' rx='6' fill='#064e3b' stroke='#10b981' stroke-width='1.8'/><text x='194' y='44' text-anchor='middle' fill='#6ee7b7' font-size='11' font-weight='700'>网孔观察法 ✓</text><text x='194' y='64' text-anchor='middle' fill='#d1fae5' font-size='10'>3 网孔 · 0 超网孔</text></svg>`;

export const SHEET_MINI2 = `<svg viewBox='0 0 260 110' xmlns='http://www.w3.org/2000/svg' style='background:#0f172a;border-radius:8px;'><text x='130' y='24' text-anchor='middle' fill='#7dd3fc' font-size='11' font-weight='700'>自电阻与共享电阻核对</text><text x='20' y='48' fill='#38bdf8' font-size='10.5'>M1: 2Ω + 4Ω + 2Ω = 8Ω</text><text x='20' y='68' fill='#a78bfa' font-size='10.5'>M2: 3Ω + 4Ω + 1Ω = 8Ω</text><text x='20' y='88' fill='#34d399' font-size='10.5'>M3: 3Ω + 2Ω + 1Ω = 6Ω</text><text x='152' y='48' fill='#f59e0b' font-size='10.5'>R12 = 4Ω</text><text x='152' y='68' fill='#f59e0b' font-size='10.5'>R13 = 2Ω</text><text x='152' y='88' fill='#f59e0b' font-size='10.5'>R23 = 1Ω</text></svg>`;

export const SHEET_MINI3 = `<svg viewBox='0 0 260 110' xmlns='http://www.w3.org/2000/svg' style='background:#0f172a;border-radius:8px;'><text x='130' y='22' text-anchor='middle' fill='#fcd34d' font-size='11' font-weight='700'>顺时针（CW）穿行电压源极性</text><text x='18' y='46' fill='#38bdf8' font-size='10.5'>M1 左侧向上：由 − 到 + (18 V) → +18</text><text x='18' y='68' fill='#a78bfa' font-size='10.5'>M2 右侧向下：由 + 到 − (3 V) → −3</text><text x='18' y='90' fill='#34d399' font-size='10.5'>M3 顶部向右：由 − 到 + (8 V) → +8</text></svg>`;

export const SHEET_MINI4 = `<svg viewBox='0 0 260 110' xmlns='http://www.w3.org/2000/svg' style='background:#0f172a;border-radius:8px;'><text x='130' y='26' text-anchor='middle' fill='#f8fafc' font-size='11.5' font-weight='700'>克莱默法则核验</text><text x='130' y='50' text-anchor='middle' fill='#38bdf8' font-size='11'>Δ = 8(47) + 4(-26) - 2(20) = 232</text><text x='130' y='74' text-anchor='middle' fill='#6ee7b7' font-size='11'>i_k = Δ_k / Δ  (k = 1, 2, 3)</text></svg>`;

export const SHEET_MINI5 = `<svg viewBox='0 0 260 110' xmlns='http://www.w3.org/2000/svg' style='background:#0f172a;border-radius:8px;'><line x1='130' y1='14' x2='130' y2='96' stroke='#f59e0b' stroke-width='3'/><rect x='118' y='34' width='24' height='42' rx='4' fill='#1e293b' stroke='#f59e0b' stroke-width='2'/><text x='80' y='52' fill='#38bdf8' font-size='11' font-weight='700'>i1=4A ↓</text><text x='152' y='52' fill='#a78bfa' font-size='11' font-weight='700'>↑ i2=2A</text><text x='130' y='106' text-anchor='middle' fill='#fcd34d' font-size='10.5' font-weight='700'>目标 I_o 向下</text></svg>`;
