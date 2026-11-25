// The inline SVGs of the W3-L6 lesson sheet (docs/lessons/W3-L6.md), copied from the sheet by a
// script, not retyped: the five act diagrams and the five step diagrams of the guided-example JSON.
// They are drawn for a dark canvas; svgs.ts recolours them for the light theme and adjusts them.

export const SHEET_ACT1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 340" width="100%" height="auto" role="img" aria-label="长导线共模噪声干扰与标准差分放大器框图">
  <defs>
    <marker id="arr-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
    <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="820" height="340" rx="12" fill="#0f172a"/>
  <text x="24" y="30" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">图 1.1 长导线传感器共模噪声入侵与差分提取原理（对齐 Sadiku Fig. 5.19）</text>

  <!-- 左侧：传感器与共模噪声源 -->
  <rect x="28" y="64" width="170" height="196" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
  <text x="113" y="88" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="13" font-weight="bold">远端传感器（微弱信号）</text>
  <!-- 差模电压源 vd -->
  <circle cx="113" cy="142" r="22" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="113" y="138" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">+ v_d −</text>
  <text x="113" y="153" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="10">10 mV</text>
  <!-- 连接到上下导线 -->
  <line x1="113" y1="120" x2="113" y2="105" stroke="#38bdf8" stroke-width="2"/>
  <line x1="113" y1="105" x2="220" y2="105" stroke="#38bdf8" stroke-width="2"/>
  <line x1="113" y1="164" x2="113" y2="180" stroke="#38bdf8" stroke-width="2"/>
  <line x1="113" y1="180" x2="220" y2="180" stroke="#38bdf8" stroke-width="2"/>
  <!-- 共模噪声源 v_cm -->
  <circle cx="113" cy="222" r="18" fill="#0f172a" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4 2"/>
  <text x="113" y="226" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="11" font-weight="bold">v_cm</text>
  <line x1="113" y1="180" x2="113" y2="204" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3 2"/>
  <line x1="113" y1="240" x2="113" y2="255" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="101" y1="255" x2="125" y2="255" stroke="#94a3b8" stroke-width="2"/>
  <line x1="105" y1="260" x2="121" y2="260" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="109" y1="265" x2="117" y2="265" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="113" y="286" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="11">50/60 Hz 工频共模 5 V</text>

  <!-- 中间：长导线干扰区 -->
  <rect x="220" y="64" width="210" height="196" rx="8" fill="#172033" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="6 4"/>
  <text x="325" y="86" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">长导线耦合区（双线同受干扰）</text>
  <line x1="220" y1="105" x2="430" y2="105" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-cyan)"/>
  <line x1="220" y1="180" x2="430" y2="180" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-cyan)"/>
  <text x="325" y="126" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="12">v_1 = v_cm − v_d/2 = 4.995 V</text>
  <text x="325" y="202" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="12">v_2 = v_cm + v_d/2 = 5.005 V</text>
  <!-- 噪声波形示意 -->
  <path d="M 245 148 Q 260 132 275 148 T 305 148 T 335 148 T 365 148 T 395 148" fill="none" stroke="#fbbf24" stroke-width="1.8"/>
  <text x="325" y="238" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">两线同时叠加等幅同相 v_cm</text>

  <!-- 右侧：差分放大器核心 -->
  <rect x="450" y="64" width="342" height="196" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
  <text x="621" y="86" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold">四电阻差分放大器（只放差值、抵消共模）</text>
  <!-- R1 -->
  <line x1="430" y1="105" x2="480" y2="105" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="480" y="97" width="46" height="16" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="503" y="109" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">R1</text>
  <line x1="526" y1="105" x2="580" y2="105" stroke="#e2e8f0" stroke-width="2"/>
  <!-- R2 反馈 -->
  <line x1="552" y1="105" x2="552" y2="68" stroke="#e2e8f0" stroke-width="1.8"/>
  <line x1="552" y1="68" x2="590" y2="68" stroke="#e2e8f0" stroke-width="1.8"/>
  <rect x="590" y="60" width="46" height="16" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="613" y="72" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">R2</text>
  <line x1="636" y1="68" x2="685" y2="68" stroke="#e2e8f0" stroke-width="1.8"/>
  <line x1="685" y1="68" x2="685" y2="142" stroke="#e2e8f0" stroke-width="1.8"/>
  <!-- R3 -->
  <line x1="430" y1="180" x2="480" y2="180" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="480" y="172" width="46" height="16" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="503" y="184" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">R3</text>
  <line x1="526" y1="180" x2="580" y2="180" stroke="#e2e8f0" stroke-width="2"/>
  <!-- R4 下地 -->
  <line x1="552" y1="180" x2="552" y2="196" stroke="#e2e8f0" stroke-width="1.8"/>
  <rect x="544" y="196" width="16" height="36" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="530" y="218" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">R4</text>
  <line x1="552" y1="232" x2="552" y2="244" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="542" y1="244" x2="562" y2="244" stroke="#94a3b8" stroke-width="2"/>
  <line x1="546" y1="249" x2="558" y2="249" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- 运放三角形 -->
  <polygon points="580,92 580,192 662,142" fill="#0f172a" stroke="#34d399" stroke-width="2.2"/>
  <text x="593" y="112" fill="#f87171" font-family="monospace" font-size="16" font-weight="bold">−</text>
  <text x="593" y="184" fill="#34d399" font-family="monospace" font-size="16" font-weight="bold">+</text>
  <!-- 输出端 -->
  <line x1="662" y1="142" x2="735" y2="142" stroke="#34d399" stroke-width="2.5" marker-end="url(#arr-green)"/>
  <text x="760" y="138" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="14" font-weight="bold">v_o</text>
  <text x="752" y="156" text-anchor="middle" fill="#a7f3d0" font-family="monospace" font-size="11">0.100 V</text>
  <text x="688" y="228" text-anchor="middle" fill="#a7f3d0" font-family="sans-serif" font-size="11">v_cm 完全抵消！</text>

  <!-- 底部公式条 -->
  <rect x="28" y="298" width="764" height="30" rx="6" fill="#1e293b"/>
  <text x="410" y="318" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="12">信号正交分解：v_cm = (v_1 + v_2)/2 ，v_d = v_2 − v_1  ⇔  v_1 = v_cm − v_d/2 ，v_2 = v_cm + v_d/2</text>
</svg>`;

export const SHEET_ACT2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 360" width="100%" height="auto" role="img" aria-label="Sadiku Fig. 5.19 四电阻差分放大器节点法标注图">
  <defs>
    <marker id="arr-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f472b6"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="820" height="360" rx="12" fill="#0f172a"/>
  <text x="24" y="30" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">图 2.1 节点分析法标准标注（对齐 Sadiku Fig. 5.19：节点 a、b 与四条支路电流）</text>

  <!-- v1 输入与 R1 -->
  <circle cx="80" cy="135" r="5" fill="#38bdf8"/>
  <text x="58" y="140" text-anchor="end" fill="#38bdf8" font-family="monospace" font-size="15" font-weight="bold">v_1</text>
  <line x1="85" y1="135" x2="170" y2="135" stroke="#e2e8f0" stroke-width="2.2"/>
  <!-- 电流 i1 箭头 -->
  <line x1="112" y1="120" x2="152" y2="120" stroke="#f472b6" stroke-width="1.8" marker-end="url(#arr-i)"/>
  <text x="132" y="112" text-anchor="middle" fill="#f472b6" font-family="monospace" font-size="12">i_1</text>
  <rect x="170" y="122" width="76" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="208" y="140" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="13" font-weight="bold">R_1</text>
  <line x1="246" y1="135" x2="390" y2="135" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- 节点 a -->
  <circle cx="320" cy="135" r="6" fill="#fbbf24"/>
  <text x="320" y="160" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="13" font-weight="bold">节点 a (v_a)</text>
  <text x="366" y="124" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="11">i_− = 0</text>

  <!-- 反馈电阻 R2 -->
  <line x1="320" y1="135" x2="320" y2="72" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="320" y1="72" x2="430" y2="72" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="358" y1="58" x2="402" y2="58" stroke="#f472b6" stroke-width="1.8" marker-end="url(#arr-i)"/>
  <text x="380" y="51" text-anchor="middle" fill="#f472b6" font-family="monospace" font-size="12">i_2</text>
  <rect x="430" y="59" width="76" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="468" y="77" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="13" font-weight="bold">R_2</text>
  <line x1="506" y1="72" x2="625" y2="72" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="625" y1="72" x2="625" y2="180" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- v2 输入与 R3 -->
  <circle cx="80" cy="225" r="5" fill="#34d399"/>
  <text x="58" y="230" text-anchor="end" fill="#34d399" font-family="monospace" font-size="15" font-weight="bold">v_2</text>
  <line x1="85" y1="225" x2="170" y2="225" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="112" y1="210" x2="152" y2="210" stroke="#f472b6" stroke-width="1.8" marker-end="url(#arr-i)"/>
  <text x="132" y="202" text-anchor="middle" fill="#f472b6" font-family="monospace" font-size="12">i_3</text>
  <rect x="170" y="212" width="76" height="26" rx="4" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="208" y="230" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="13" font-weight="bold">R_3</text>
  <line x1="246" y1="225" x2="390" y2="225" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- 节点 b -->
  <circle cx="320" cy="225" r="6" fill="#fbbf24"/>
  <text x="278" y="248" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="13" font-weight="bold">节点 b (v_b)</text>
  <text x="366" y="214" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="11">i_+ = 0</text>

  <!-- 虚短标注 -->
  <line x1="398" y1="145" x2="398" y2="215" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="410" y="184" fill="#fbbf24" font-family="monospace" font-size="11" font-weight="bold">v_a = v_b</text>

  <!-- R4 下地 -->
  <line x1="320" y1="225" x2="320" y2="250" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="340" y1="255" x2="340" y2="292" stroke="#f472b6" stroke-width="1.8" marker-end="url(#arr-i)"/>
  <text x="355" y="278" fill="#f472b6" font-family="monospace" font-size="12">i_4</text>
  <rect x="307" y="250" width="26" height="62" rx="4" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="292" y="286" text-anchor="end" fill="#f8fafc" font-family="monospace" font-size="13" font-weight="bold">R_4</text>
  <line x1="320" y1="312" x2="320" y2="332" stroke="#94a3b8" stroke-width="2"/>
  <line x1="306" y1="332" x2="334" y2="332" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="311" y1="338" x2="329" y2="338" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="316" y1="344" x2="324" y2="344" stroke="#94a3b8" stroke-width="1.5"/>

  <!-- 运放主体 -->
  <polygon points="390,108 390,252 540,180" fill="#1e293b" stroke="#e2e8f0" stroke-width="2.5"/>
  <text x="406" y="142" fill="#f87171" font-family="monospace" font-size="20" font-weight="bold">−</text>
  <text x="406" y="232" fill="#34d399" font-family="monospace" font-size="20" font-weight="bold">+</text>
  <text x="456" y="185" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="12">理想运放</text>

  <!-- 输出端 -->
  <line x1="540" y1="180" x2="680" y2="180" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="625" cy="180" r="5" fill="#e2e8f0"/>
  <circle cx="680" cy="180" r="5" fill="#fbbf24"/>
  <text x="698" y="185" fill="#fbbf24" font-family="monospace" font-size="16" font-weight="bold">v_o</text>

  <!-- 右侧法则卡片 -->
  <rect x="570" y="220" width="224" height="112" rx="8" fill="#172033" stroke="#475569" stroke-width="1.2"/>
  <text x="584" y="244" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">节点法核心方程组：</text>
  <text x="584" y="268" fill="#e2e8f0" font-family="monospace" font-size="11">1) KCL@a: (v_1−v_a)/R_1 = (v_a−v_o)/R_2</text>
  <text x="584" y="290" fill="#e2e8f0" font-family="monospace" font-size="11">2) KCL@b: (v_2−v_b)/R_3 = v_b/R_4</text>
  <text x="584" y="312" fill="#34d399" font-family="monospace" font-size="11">3) 虚短约束: v_a = v_b</text>
</svg>`;

export const SHEET_ACT3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 340" width="100%" height="auto" role="img" aria-label="叠加定理双子电路对比：反相通道与分压同相通道">
  <rect x="0" y="0" width="820" height="340" rx="12" fill="#0f172a"/>
  <text x="24" y="30" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">图 3.1 叠加定理双视角拆解：子电路 A（v_2 = 0）与子电路 B（v_1 = 0）</text>

  <!-- 左半区：子电路 A (v2 = 0) -->
  <rect x="20" y="48" width="382" height="272" rx="10" fill="#172033" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="211" y="72" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold">子电路 A：令 v_2 = 0（纯反相放大器）</text>
  <!-- v1 与 R1 -->
  <circle cx="54" cy="135" r="4.5" fill="#38bdf8"/>
  <text x="44" y="140" text-anchor="end" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="bold">v_1</text>
  <line x1="58" y1="135" x2="92" y2="135" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="92" y="125" width="46" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="115" y="139" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">R_1</text>
  <line x1="138" y1="135" x2="215" y2="135" stroke="#e2e8f0" stroke-width="2"/>
  <!-- R2 反馈 -->
  <line x1="175" y1="135" x2="175" y2="95" stroke="#e2e8f0" stroke-width="1.8"/>
  <line x1="175" y1="95" x2="225" y2="95" stroke="#e2e8f0" stroke-width="1.8"/>
  <rect x="225" y="85" width="46" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="248" y="99" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">R_2</text>
  <line x1="271" y1="95" x2="328" y2="95" stroke="#e2e8f0" stroke-width="1.8"/>
  <line x1="328" y1="95" x2="328" y2="165" stroke="#e2e8f0" stroke-width="1.8"/>
  <!-- 同相端 v2=0 经 R3||R4 接地 -->
  <line x1="66" y1="195" x2="92" y2="195" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="66" y1="195" x2="66" y2="232" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="56" y1="232" x2="76" y2="232" stroke="#94a3b8" stroke-width="2"/>
  <line x1="60" y1="237" x2="72" y2="237" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="58" y="187" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="10">v_2=0</text>
  <rect x="92" y="185" width="46" height="20" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 2"/>
  <text x="115" y="199" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="11">R_3</text>
  <line x1="138" y1="195" x2="215" y2="195" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="175" y1="195" x2="175" y2="208" stroke="#94a3b8" stroke-width="1.8"/>
  <rect x="165" y="208" width="20" height="32" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 2"/>
  <text x="150" y="228" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="10">R_4</text>
  <line x1="175" y1="240" x2="175" y2="250" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="165" y1="250" x2="185" y2="250" stroke="#94a3b8" stroke-width="2"/>
  <text x="198" y="218" fill="#fbbf24" font-family="monospace" font-size="10">i_+=0 ⇒ v_b1=0</text>
  <!-- 运放 A -->
  <polygon points="215,115 215,215 300,165" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="226" y="140" fill="#f87171" font-family="monospace" font-size="16" font-weight="bold">−</text>
  <text x="226" y="200" fill="#34d399" font-family="monospace" font-size="16" font-weight="bold">+</text>
  <line x1="300" y1="165" x2="360" y2="165" stroke="#38bdf8" stroke-width="2"/>
  <text x="366" y="170" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="bold">v_o1</text>
  <!-- 结论框 A -->
  <rect x="38" y="268" width="346" height="38" rx="6" fill="#0f172a"/>
  <text x="211" y="292" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="bold">v_o1 = −(R_2 / R_1) · v_1</text>

  <!-- 右半区：子电路 B (v1 = 0) -->
  <rect x="418" y="48" width="382" height="272" rx="10" fill="#172033" stroke="#34d399" stroke-width="1.5"/>
  <text x="609" y="72" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="14" font-weight="bold">子电路 B：令 v_1 = 0（分压器 + 同相放大器）</text>
  <!-- v1=0 接地与 R1 -->
  <line x1="464" y1="135" x2="490" y2="135" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="464" y1="135" x2="464" y2="162" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="454" y1="162" x2="474" y2="162" stroke="#94a3b8" stroke-width="2"/>
  <line x1="458" y1="167" x2="470" y2="167" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="456" y="126" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="10">v_1=0</text>
  <rect x="490" y="125" width="46" height="20" rx="3" fill="#0f172a" stroke="#34d399" stroke-width="1.8"/>
  <text x="513" y="139" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">R_1</text>
  <line x1="536" y1="135" x2="613" y2="135" stroke="#e2e8f0" stroke-width="2"/>
  <!-- R2 反馈 -->
  <line x1="573" y1="135" x2="573" y2="95" stroke="#e2e8f0" stroke-width="1.8"/>
  <line x1="573" y1="95" x2="623" y2="95" stroke="#e2e8f0" stroke-width="1.8"/>
  <rect x="623" y="85" width="46" height="20" rx="3" fill="#0f172a" stroke="#34d399" stroke-width="1.8"/>
  <text x="646" y="99" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">R_2</text>
  <line x1="669" y1="95" x2="726" y2="95" stroke="#e2e8f0" stroke-width="1.8"/>
  <line x1="726" y1="95" x2="726" y2="165" stroke="#e2e8f0" stroke-width="1.8"/>
  <!-- v2 经 R3, R4 分压 -->
  <circle cx="452" cy="195" r="4.5" fill="#34d399"/>
  <text x="442" y="200" text-anchor="end" fill="#34d399" font-family="monospace" font-size="13" font-weight="bold">v_2</text>
  <line x1="456" y1="195" x2="490" y2="195" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="490" y="185" width="46" height="20" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1.8"/>
  <text x="513" y="199" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">R_3</text>
  <line x1="536" y1="195" x2="613" y2="195" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="573" cy="195" r="4.5" fill="#fbbf24"/>
  <line x1="573" y1="195" x2="573" y2="208" stroke="#e2e8f0" stroke-width="1.8"/>
  <rect x="563" y="208" width="20" height="32" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1.8"/>
  <text x="548" y="228" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="10">R_4</text>
  <line x1="573" y1="240" x2="573" y2="250" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="563" y1="250" x2="583" y2="250" stroke="#94a3b8" stroke-width="2"/>
  <text x="596" y="220" fill="#fbbf24" font-family="monospace" font-size="10">v_b2 = v_2·R_4/(R_3+R_4)</text>
  <!-- 运放 B -->
  <polygon points="613,115 613,215 698,165" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="624" y="140" fill="#f87171" font-family="monospace" font-size="16" font-weight="bold">−</text>
  <text x="624" y="200" fill="#34d399" font-family="monospace" font-size="16" font-weight="bold">+</text>
  <line x1="698" y1="165" x2="758" y2="165" stroke="#34d399" stroke-width="2"/>
  <text x="764" y="170" fill="#34d399" font-family="monospace" font-size="13" font-weight="bold">v_o2</text>
  <!-- 结论框 B -->
  <rect x="436" y="268" width="346" height="38" rx="6" fill="#0f172a"/>
  <text x="609" y="292" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold">v_o2 = (1 + R_2/R_1)·[R_4/(R_3+R_4)]·v_2</text>
</svg>`;

export const SHEET_ACT4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 350" width="100%" height="auto" role="img" aria-label="电阻容差失配导致共模噪声泄漏与输入电阻不对称分析图">
  <rect x="0" y="0" width="820" height="350" rx="12" fill="#0f172a"/>
  <text x="24" y="30" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">图 4.1 电阻容差失配（R_4 偏大 +5%）引发的共模泄漏与输入电阻短板</text>

  <!-- 左侧：失配电路示意 -->
  <rect x="20" y="48" width="445" height="282" rx="10" fill="#172033" stroke="#475569" stroke-width="1.5"/>
  <text x="242" y="72" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="bold">R_1=R_3=10 kΩ, R_2=100 kΩ, R_4=105 kΩ (+5% 失配)</text>

  <!-- 输入电阻标注框 -->
  <rect x="34" y="96" width="90" height="44" rx="5" fill="#1e293b" stroke="#f87171" stroke-width="1.2" stroke-dasharray="4 2"/>
  <text x="79" y="114" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="10">R_in1(v2=0)</text>
  <text x="79" y="130" text-anchor="middle" fill="#fca5a5" font-family="monospace" font-size="11" font-weight="bold">= R_1 = 10k</text>

  <rect x="34" y="196" width="90" height="44" rx="5" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4 2"/>
  <text x="79" y="214" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="10">R_in2(v1=0)</text>
  <text x="79" y="230" text-anchor="middle" fill="#7dd3fc" font-family="monospace" font-size="11" font-weight="bold">= R_3+R_4</text>

  <!-- 上支路 R1, R2 -->
  <line x1="124" y1="138" x2="152" y2="138" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="152" y="128" width="48" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="176" y="142" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">10k</text>
  <line x1="200" y1="138" x2="275" y2="138" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="236" y1="138" x2="236" y2="96" stroke="#e2e8f0" stroke-width="1.8"/>
  <line x1="236" y1="96" x2="286" y2="96" stroke="#e2e8f0" stroke-width="1.8"/>
  <rect x="286" y="86" width="52" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="312" y="100" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">100k</text>
  <line x1="338" y1="96" x2="395" y2="96" stroke="#e2e8f0" stroke-width="1.8"/>
  <line x1="395" y1="96" x2="395" y2="168" stroke="#e2e8f0" stroke-width="1.8"/>

  <!-- 下支路 R3, R4 (标红失配) -->
  <line x1="124" y1="198" x2="152" y2="198" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="152" y="188" width="48" height="20" rx="3" fill="#0f172a" stroke="#34d399" stroke-width="1.8"/>
  <text x="176" y="202" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="11">10k</text>
  <line x1="200" y1="198" x2="275" y2="198" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="236" y1="198" x2="236" y2="218" stroke="#f87171" stroke-width="2.2"/>
  <rect x="218" y="218" width="36" height="44" rx="4" fill="#450a0a" stroke="#f87171" stroke-width="2.2"/>
  <text x="236" y="237" text-anchor="middle" fill="#fecaca" font-family="monospace" font-size="10" font-weight="bold">R_4</text>
  <text x="236" y="252" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="10" font-weight="bold">105k!</text>
  <line x1="236" y1="262" x2="236" y2="278" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="224" y1="278" x2="248" y2="278" stroke="#94a3b8" stroke-width="2"/>
  <text x="236" y="302" text-anchor="middle" fill="#f87171" font-family="sans-serif" font-size="11" font-weight="bold">ΔR_4 = +5% 打破配对平衡</text>

  <!-- 运放 -->
  <polygon points="275,118 275,218 362,168" fill="#0f172a" stroke="#e2e8f0" stroke-width="2"/>
  <text x="286" y="143" fill="#f87171" font-family="monospace" font-size="16" font-weight="bold">−</text>
  <text x="286" y="203" fill="#34d399" font-family="monospace" font-size="16" font-weight="bold">+</text>
  <line x1="362" y1="168" x2="425" y2="168" stroke="#f87171" stroke-width="2.2"/>
  <text x="444" y="173" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="13" font-weight="bold">v_o</text>

  <!-- 右侧：定量柱状对比图 -->
  <rect x="482" y="48" width="318" height="282" rx="10" fill="#172033" stroke="#f87171" stroke-width="1.5"/>
  <text x="641" y="72" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="13" font-weight="bold">输出端信号 vs 共模泄漏（v_d=10mV, v_cm=5V）</text>

  <!-- 柱状图基准线 -->
  <line x1="510" y1="258" x2="778" y2="258" stroke="#64748b" stroke-width="1.5"/>
  <!-- 组 1：理想配对 -->
  <rect x="528" y="238" width="24" height="20" fill="#34d399"/>
  <rect x="556" y="256" width="24" height="2" fill="#f87171"/>
  <text x="554" y="276" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">理想配对</text>
  <text x="554" y="292" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="10">CMRR = ∞</text>
  <text x="540" y="232" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="9">0.10V</text>
  <text x="568" y="250" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="9">0V</text>

  <!-- 组 2：单颗 R4 +5% -->
  <rect x="612" y="238" width="24" height="20" fill="#34d399"/>
  <rect x="640" y="214" width="24" height="44" fill="#fbbf24"/>
  <text x="638" y="276" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">单颗 +5%</text>
  <text x="638" y="292" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="10">47.25 dB</text>
  <text x="624" y="232" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="9">0.10V</text>
  <text x="652" y="208" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="9">0.22V</text>

  <!-- 组 3：四颗最坏 ±5% -->
  <rect x="698" y="236" width="24" height="22" fill="#34d399"/>
  <rect x="726" y="102" width="24" height="156" fill="#f87171"/>
  <text x="724" y="276" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="11">最坏 ±5%</text>
  <text x="724" y="292" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="10">34.79 dB</text>
  <text x="710" y="230" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="9">0.11V</text>
  <text x="738" y="96" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="9">1.00V!</text>

  <!-- 图例 -->
  <rect x="512" y="306" width="12" height="10" fill="#34d399"/>
  <text x="530" y="315" fill="#cbd5e1" font-family="sans-serif" font-size="11">有用差模输出 |v_o,d|</text>
  <rect x="658" y="306" width="12" height="10" fill="#f87171"/>
  <text x="676" y="315" fill="#cbd5e1" font-family="sans-serif" font-size="11">共模噪声泄漏 |v_o,cm|</text>
</svg>`;

export const SHEET_ACT5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 330" width="100%" height="auto" role="img" aria-label="Sadiku Example 5.7 成品设计电路图 vo = -5v1 + 3v2">
  <rect x="0" y="0" width="820" height="330" rx="12" fill="#0f172a"/>
  <text x="24" y="30" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">图 5.1 Sadiku Example 5.7 成品电路（目标：v_o = −5 v_1 + 3 v_2）</text>

  <!-- v1 与 R1=10k -->
  <circle cx="88" cy="128" r="5" fill="#38bdf8"/>
  <text x="68" y="133" text-anchor="end" fill="#38bdf8" font-family="monospace" font-size="15" font-weight="bold">v_1</text>
  <line x1="93" y1="128" x2="155" y2="128" stroke="#e2e8f0" stroke-width="2.2"/>
  <rect x="155" y="114" width="84" height="28" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="197" y="133" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="12" font-weight="bold">R_1 = 10 kΩ</text>
  <line x1="239" y1="128" x2="368" y2="128" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- R2=50k 反馈 -->
  <circle cx="298" cy="128" r="5" fill="#fbbf24"/>
  <line x1="298" y1="128" x2="298" y2="68" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="298" y1="68" x2="390" y2="68" stroke="#e2e8f0" stroke-width="2.2"/>
  <rect x="390" y="54" width="88" height="28" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="434" y="73" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="12" font-weight="bold">R_2 = 50 kΩ</text>
  <line x1="478" y1="68" x2="578" y2="68" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="578" y1="68" x2="578" y2="170" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- v2 与 R3=10k -->
  <circle cx="88" cy="212" r="5" fill="#34d399"/>
  <text x="68" y="217" text-anchor="end" fill="#34d399" font-family="monospace" font-size="15" font-weight="bold">v_2</text>
  <line x1="93" y1="212" x2="155" y2="212" stroke="#e2e8f0" stroke-width="2.2"/>
  <rect x="155" y="198" width="84" height="28" rx="4" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="197" y="217" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="12" font-weight="bold">R_3 = 10 kΩ</text>
  <line x1="239" y1="212" x2="368" y2="212" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- R4=10k 下地 -->
  <circle cx="298" cy="212" r="5" fill="#fbbf24"/>
  <line x1="298" y1="212" x2="298" y2="236" stroke="#e2e8f0" stroke-width="2.2"/>
  <rect x="285" y="236" width="26" height="54" rx="4" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="276" y="268" text-anchor="end" fill="#f8fafc" font-family="monospace" font-size="12" font-weight="bold">R_4 = 10 kΩ</text>
  <line x1="298" y1="290" x2="298" y2="306" stroke="#94a3b8" stroke-width="2"/>
  <line x1="286" y1="306" x2="310" y2="306" stroke="#94a3b8" stroke-width="2.2"/>
  <line x1="290" y1="312" x2="306" y2="312" stroke="#94a3b8" stroke-width="1.6"/>

  <!-- 运放 -->
  <polygon points="368,104 368,236 502,170" fill="#1e293b" stroke="#e2e8f0" stroke-width="2.5"/>
  <text x="383" y="134" fill="#f87171" font-family="monospace" font-size="18" font-weight="bold">−</text>
  <text x="383" y="218" fill="#34d399" font-family="monospace" font-size="18" font-weight="bold">+</text>
  <line x1="502" y1="170" x2="625" y2="170" stroke="#fbbf24" stroke-width="2.4"/>
  <circle cx="578" cy="170" r="5" fill="#e2e8f0"/>
  <circle cx="625" cy="170" r="5" fill="#fbbf24"/>
  <text x="642" y="175" fill="#fbbf24" font-family="monospace" font-size="15" font-weight="bold">v_o</text>

  <!-- 右侧验算清单 -->
  <rect x="528" y="206" width="268" height="106" rx="8" fill="#172033" stroke="#34d399" stroke-width="1.2"/>
  <text x="542" y="228" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">设计系数回代验算：</text>
  <text x="542" y="250" fill="#e2e8f0" font-family="monospace" font-size="11">反相系数: −R_2/R_1 = −50/10 = −5</text>
  <text x="542" y="272" fill="#e2e8f0" font-family="monospace" font-size="11">同相系数: (1+5)/(1+10/10) = 6/2 = +3</text>
  <text x="542" y="294" fill="#fbbf24" font-family="monospace" font-size="11">总输出: v_o = −5 v_1 + 3 v_2 (✓)</text>
</svg>`;

export const SHEET_MINI1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90"><rect width="260" height="90" rx="8" fill="#0f172a"/><text x="130" y="32" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="13" font-weight="bold">v_o = -5 v_1 + 3 v_2</text><text x="130" y="58" text-anchor="middle" fill="#f87171" font-family="sans-serif" font-size="11">|-5| ≠ |+3| ⇒ 禁止套用 Eq. 5.18！</text><text x="130" y="76" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11">请调用一般式 Eq. 5.16</text></svg>`;

export const SHEET_MINI2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90"><rect width="260" height="90" rx="8" fill="#0f172a"/><line x1="20" y1="50" x2="55" y2="50" stroke="#e2e8f0" stroke-width="2"/><rect x="55" y="40" width="42" height="20" fill="#1e293b" stroke="#38bdf8"/><text x="76" y="54" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="10">10k</text><line x1="97" y1="50" x2="145" y2="50" stroke="#e2e8f0" stroke-width="2"/><line x1="120" y1="50" x2="120" y2="22" stroke="#e2e8f0" stroke-width="1.5"/><rect x="142" y="12" width="46" height="20" fill="#1e293b" stroke="#fbbf24"/><text x="165" y="26" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="10">R_2=?</text><line x1="120" y1="22" x2="142" y2="22" stroke="#e2e8f0" stroke-width="1.5"/><line x1="188" y1="22" x2="215" y2="22" stroke="#e2e8f0" stroke-width="1.5"/><line x1="215" y1="22" x2="215" y2="58" stroke="#e2e8f0" stroke-width="1.5"/><polygon points="145,38 145,78 195,58" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/><line x1="195" y1="58" x2="240" y2="58" stroke="#e2e8f0" stroke-width="2"/></svg>`;

export const SHEET_MINI3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90"><rect width="260" height="90" rx="8" fill="#0f172a"/><text x="130" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="12">同相本体增益 = 1 + 50/10 = 6</text><text x="130" y="54" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="12">6 × [R_4 / (R_3 + R_4)] = 3</text><text x="130" y="76" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="11">⇒ 分压比 = 1/2</text></svg>`;

export const SHEET_MINI4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90"><rect width="260" height="90" rx="8" fill="#0f172a"/><line x1="24" y1="36" x2="62" y2="36" stroke="#34d399" stroke-width="2"/><rect x="62" y="26" width="46" height="20" fill="#1e293b" stroke="#34d399"/><text x="85" y="40" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="10">R_3=10k</text><line x1="108" y1="36" x2="156" y2="36" stroke="#e2e8f0" stroke-width="2"/><line x1="132" y1="36" x2="132" y2="50" stroke="#e2e8f0" stroke-width="2"/><rect x="109" y="50" width="46" height="20" fill="#1e293b" stroke="#fbbf24"/><text x="132" y="64" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="10">R_4=?</text><text x="205" y="46" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="11">v_b = 0.5 v_2</text></svg>`;

export const SHEET_MINI5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90"><rect width="260" height="90" rx="8" fill="#0f172a"/><text x="130" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="12">v_1 = v_2 = 2 V (纯共模)</text><text x="130" y="54" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="13" font-weight="bold">v_o = -5(2) + 3(2) = -4 V</text><text x="130" y="76" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">A_cm = -5 + 3 = -2 ≠ 0</text></svg>`;
