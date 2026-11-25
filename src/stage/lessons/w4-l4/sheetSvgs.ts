// The inline SVGs of the W4-L4 lesson sheet (docs/lessons/W4-L4.md), copied from the sheet by a
// script, not retyped: the six act diagrams (figs 1-1 … 6-1) and the five step diagrams of the
// guided-example JSON. They are drawn for a dark canvas; svgs.ts recolours them for the light theme
// and adjusts them.

export const SHEET_ACT1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 280" width="760" height="280">
  <rect width="760" height="280" rx="12" fill="#0f172a"/>
  <text x="380" y="28" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">图 1-1：无源 RC 放电物理直觉——剩余电压越低，泄放电流越小，下降越慢</text>

  <!-- 左侧：t=0+ 与 t=τ 放电状态对比 -->
  <rect x="24" y="48" width="330" height="208" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="189" y="72" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">放电过程电荷与电流演化</text>

  <!-- 电容与电阻简图 -->
  <line x1="75" y1="100" x2="295" y2="100" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="75" y1="220" x2="295" y2="220" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- 电容 -->
  <line x1="75" y1="100" x2="75" y2="150" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="55" y1="150" x2="95" y2="150" stroke="#38bdf8" stroke-width="3.5"/>
  <line x1="55" y1="166" x2="95" y2="166" stroke="#38bdf8" stroke-width="3.5"/>
  <line x1="75" y1="166" x2="75" y2="220" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="42" y="142" fill="#f59e0b" font-family="sans-serif" font-size="14" font-weight="bold">+</text>
  <text x="43" y="185" fill="#94a3b8" font-family="sans-serif" font-size="14" font-weight="bold">-</text>
  <text x="106" y="164" fill="#e2e8f0" font-family="sans-serif" font-size="13">C, v(t)</text>

  <!-- 电阻 -->
  <line x1="295" y1="100" x2="295" y2="128" stroke="#94a3b8" stroke-width="2.5"/>
  <polyline points="295,128 285,134 305,144 285,154 305,164 285,174 305,184 295,190" fill="none" stroke="#f97316" stroke-width="2.5"/>
  <line x1="295" y1="190" x2="295" y2="220" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="315" y="164" fill="#fdba74" font-family="sans-serif" font-size="13">R</text>

  <!-- 泄放电流箭头 -->
  <line x1="145" y1="90" x2="235" y2="90" stroke="#f43f5e" stroke-width="3"/>
  <polygon points="235,84 249,90 235,96" fill="#f43f5e"/>
  <text x="190" y="118" fill="#fda4af" font-family="sans-serif" font-size="12" text-anchor="middle">泄放电流 i(t) = v(t)/R</text>
  <text x="189" y="242" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">v(t) 减半 → i(t) 减半 → |dv/dt| 减半</text>

  <!-- 右侧：斜率递减直觉曲线 -->
  <rect x="374" y="48" width="362" height="208" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="555" y="72" fill="#a78bfa" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">斜率 |dv/dt| 随时间逐步放缓</text>
  <!-- 坐标轴 -->
  <line x1="414" y1="226" x2="710" y2="226" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="414" y1="226" x2="414" y2="90" stroke="#94a3b8" stroke-width="1.8"/>
  <text x="716" y="230" fill="#cbd5e1" font-family="sans-serif" font-size="11">t</text>
  <text x="404" y="96" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="end">v(t)</text>

  <!-- 衰减曲线 -->
  <path d="M 414 106 Q 465 186 555 208 T 700 224" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <!-- 三个局部切线段展示斜率递减 -->
  <line x1="414" y1="106" x2="462" y2="178" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,3"/>
  <circle cx="414" cy="106" r="4" fill="#f43f5e"/>
  <text x="470" y="130" fill="#fda4af" font-family="sans-serif" font-size="11">初期：高压大电流，陡降</text>

  <line x1="485" y1="184" x2="545" y2="206" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,3"/>
  <circle cx="505" cy="192" r="4" fill="#f59e0b"/>
  <text x="530" y="176" fill="#fcd34d" font-family="sans-serif" font-size="11">中期：斜率明显变缓</text>

  <line x1="600" y1="218" x2="675" y2="223" stroke="#22c55e" stroke-width="2" stroke-dasharray="4,3"/>
  <circle cx="635" cy="221" r="4" fill="#22c55e"/>
  <text x="615" y="206" fill="#86efac" font-family="sans-serif" font-size="11">后期：趋近稳态 0</text>
</svg>`;

export const SHEET_ACT2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 270" width="760" height="270">
  <rect width="760" height="270" rx="12" fill="#0f172a"/>
  <text x="380" y="28" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">图 2-1：无源 RC 电路（t &gt; 0）标准参考方向与 KCL 节点分析</text>

  <!-- 上下母线 -->
  <line x1="170" y1="78" x2="570" y2="78" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="170" y1="210" x2="570" y2="210" stroke="#e2e8f0" stroke-width="2.5"/>

  <!-- 顶部节点高亮 -->
  <circle cx="370" cy="78" r="6" fill="#f59e0b"/>
  <text x="370" y="62" fill="#fcd34d" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">节点 v(t) : i_C + i_R = 0</text>

  <!-- 接地符号 -->
  <line x1="370" y1="210" x2="370" y2="228" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="352" y1="228" x2="388" y2="228" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="358" y1="236" x2="382" y2="236" stroke="#94a3b8" stroke-width="2"/>
  <line x1="364" y1="244" x2="376" y2="244" stroke="#94a3b8" stroke-width="2"/>
  <text x="398" y="236" fill="#94a3b8" font-family="sans-serif" font-size="12">参考地 0 V</text>

  <!-- 电容支路 -->
  <line x1="170" y1="78" x2="170" y2="134" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="142" y1="134" x2="198" y2="134" stroke="#38bdf8" stroke-width="4"/>
  <line x1="142" y1="152" x2="198" y2="152" stroke="#38bdf8" stroke-width="4"/>
  <line x1="170" y1="152" x2="170" y2="210" stroke="#e2e8f0" stroke-width="2.5"/>
  <text x="122" y="148" fill="#38bdf8" font-family="sans-serif" font-size="15" font-weight="bold">C</text>
  <text x="208" y="128" fill="#f59e0b" font-family="sans-serif" font-size="14" font-weight="bold">+</text>
  <text x="208" y="150" fill="#f8fafc" font-family="sans-serif" font-size="14">v(t)</text>
  <text x="208" y="172" fill="#94a3b8" font-family="sans-serif" font-size="14" font-weight="bold">-</text>

  <!-- i_C 向下关联参考方向 -->
  <line x1="154" y1="88" x2="154" y2="118" stroke="#38bdf8" stroke-width="2.2"/>
  <polygon points="149,115 154,125 159,115" fill="#38bdf8"/>
  <text x="115" y="108" fill="#7dd3fc" font-family="sans-serif" font-size="12">i_C = C dv/dt</text>

  <!-- 电阻支路 -->
  <line x1="570" y1="78" x2="570" y2="110" stroke="#e2e8f0" stroke-width="2.5"/>
  <polyline points="570,110 558,118 582,128 558,138 582,148 558,158 582,168 570,176" fill="none" stroke="#f97316" stroke-width="2.8"/>
  <line x1="570" y1="176" x2="570" y2="210" stroke="#e2e8f0" stroke-width="2.5"/>
  <text x="598" y="148" fill="#fdba74" font-family="sans-serif" font-size="15" font-weight="bold">R</text>

  <!-- i_R 向下参考方向 -->
  <line x1="552" y1="88" x2="552" y2="118" stroke="#f97316" stroke-width="2.2"/>
  <polygon points="547,115 552,125 557,115" fill="#f97316"/>
  <text x="480" y="108" fill="#fdba74" font-family="sans-serif" font-size="12">i_R = v/R</text>

  <!-- 初始条件与能量框 -->
  <rect x="265" y="116" width="210" height="72" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.2"/>
  <text x="370" y="138" fill="#e2e8f0" font-family="sans-serif" font-size="12" text-anchor="middle">初始条件：v(0+) = v(0-) = V0</text>
  <text x="370" y="158" fill="#38bdf8" font-family="sans-serif" font-size="12" text-anchor="middle">初始储能：w_C(0) = 1/2 C V0^2</text>
  <text x="370" y="178" fill="#86efac" font-family="sans-serif" font-size="12" text-anchor="middle">最终全额转化为电阻焦耳热</text>
</svg>`;

export const SHEET_ACT3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 320" width="760" height="320">
  <rect width="760" height="320" rx="12" fill="#0f172a"/>
  <text x="380" y="28" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">图 3-1：归一化指数衰减曲线 v(t)/V0 = e^(-t/τ)（含 t=0 切线与 5τ 工程稳态区）</text>

  <!-- 5τ 稳态高亮区 -->
  <rect x="530" y="60" width="160" height="190" fill="#22c55e" fill-opacity="0.10"/>
  <line x1="530" y1="60" x2="530" y2="250" stroke="#22c55e" stroke-width="1.8" stroke-dasharray="6,4"/>
  <text x="610" y="84" fill="#86efac" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">工程稳态区 (t ≥ 5τ)</text>
  <text x="610" y="102" fill="#bbf7d0" font-family="sans-serif" font-size="11" text-anchor="middle">剩余 &lt; 0.67% (不足 1%)</text>

  <!-- 网格虚线 -->
  <line x1="80" y1="60" x2="690" y2="60" stroke="#334155" stroke-width="1" stroke-dasharray="3,4"/>
  <line x1="80" y1="180.1" x2="170" y2="180.1" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="170" y1="180.1" x2="170" y2="250" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="260" y1="224.3" x2="260" y2="250" stroke="#475569" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="350" y1="240.5" x2="350" y2="250" stroke="#475569" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="440" y1="246.5" x2="440" y2="250" stroke="#475569" stroke-width="1" stroke-dasharray="3,3"/>

  <!-- 坐标轴 -->
  <line x1="80" y1="250" x2="705" y2="250" stroke="#e2e8f0" stroke-width="2"/>
  <polygon points="705,245 717,250 705,255" fill="#e2e8f0"/>
  <line x1="80" y1="250" x2="80" y2="48" stroke="#e2e8f0" stroke-width="2"/>
  <polygon points="75,52 80,40 85,52" fill="#e2e8f0"/>
  <text x="722" y="254" fill="#e2e8f0" font-family="sans-serif" font-size="13" font-weight="bold">t</text>
  <text x="68" y="48" fill="#e2e8f0" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="end">v(t)</text>

  <!-- Y 轴刻度 -->
  <text x="72" y="64" fill="#f8fafc" font-family="sans-serif" font-size="12" text-anchor="end">1.00 V0</text>
  <text x="72" y="184" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end">0.368 V0</text>
  <text x="72" y="254" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="end">0</text>

  <!-- X 轴刻度 1τ - 5τ -->
  <text x="80" y="270" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">0</text>
  <text x="170" y="270" fill="#f43f5e" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">1τ</text>
  <text x="260" y="270" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">2τ</text>
  <text x="350" y="270" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">3τ</text>
  <text x="440" y="270" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">4τ</text>
  <text x="530" y="270" fill="#22c55e" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">5τ</text>

  <!-- 精确数学折线采样 e^(-t/τ): x=80+90*u, y=250-190*exp(-u) -->
  <polyline points="80,60.0 102.5,102.0 125,134.8 147.5,160.3 170,180.1 192.5,195.6 215,207.6 237.5,217.0 260,224.3 282.5,230.0 305,234.4 327.5,237.9 350,240.5 372.5,242.6 395,244.3 417.5,245.5 440,246.5 462.5,247.3 485,247.9 507.5,248.4 530,248.7 575,249.2 665,249.7" fill="none" stroke="#38bdf8" stroke-width="3.2"/>

  <!-- t=0 切线：精确从 (80,60) 到 (170,250) -->
  <line x1="80" y1="60" x2="170" y2="250" stroke="#f43f5e" stroke-width="2.2" stroke-dasharray="6,4"/>
  <circle cx="170" cy="250" r="4.5" fill="#f43f5e"/>
  <text x="196" y="134" fill="#fda4af" font-family="sans-serif" font-size="12" font-weight="bold">t=0 切线：斜率 = -V0/τ</text>
  <text x="196" y="150" fill="#fda4af" font-family="sans-serif" font-size="11">若保持初始斜率，恰好在 t=1τ 归零</text>
  <line x1="192" y1="138" x2="128" y2="156" stroke="#f43f5e" stroke-width="1.2"/>

  <!-- 关键数据点 -->
  <circle cx="80" cy="60.0" r="4.5" fill="#f8fafc"/>
  <circle cx="170" cy="180.1" r="5" fill="#38bdf8" stroke="#f8fafc" stroke-width="1.5"/>
  <text x="180" y="176" fill="#7dd3fc" font-family="sans-serif" font-size="11" font-weight="bold">(1τ, 36.8%)</text>

  <circle cx="260" cy="224.3" r="4" fill="#38bdf8"/>
  <text x="260" y="214" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">13.5%</text>

  <circle cx="350" cy="240.5" r="4" fill="#38bdf8"/>
  <text x="350" y="230" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">4.98%</text>

  <circle cx="440" cy="246.5" r="4" fill="#38bdf8"/>
  <text x="440" y="236" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">1.83%</text>

  <circle cx="530" cy="248.7" r="5" fill="#22c55e" stroke="#f8fafc" stroke-width="1.5"/>
  <text x="540" y="236" fill="#86efac" font-family="sans-serif" font-size="11" font-weight="bold">0.67%</text>

  <text x="380" y="302" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">规律记忆：每经过一个 τ，当前剩余量就乘以 0.368（衰减掉 63.2%），与起点无关</text>
</svg>`;

export const SHEET_ACT4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 270" width="760" height="270">
  <rect width="760" height="270" rx="12" fill="#0f172a"/>
  <text x="380" y="28" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">图 4-1：无源 RL 衰减回路（KVL 分析）与 RC/RL 物理对偶表</text>

  <!-- 左侧：RL 串联单回路 -->
  <rect x="24" y="48" width="340" height="202" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="194" y="72" fill="#a78bfa" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">无源 RL 电路（t &gt; 0）：v_L + v_R = 0</text>

  <line x1="88" y1="98" x2="298" y2="98" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="88" y1="208" x2="298" y2="208" stroke="#e2e8f0" stroke-width="2.5"/>

  <!-- 电感符号（四段半圆弧） -->
  <line x1="88" y1="98" x2="88" y2="120" stroke="#e2e8f0" stroke-width="2.5"/>
  <path d="M 88 120 A 10 10 0 0 1 88 140 A 10 10 0 0 1 88 160 A 10 10 0 0 1 88 180" fill="none" stroke="#a78bfa" stroke-width="3"/>
  <line x1="88" y1="180" x2="88" y2="208" stroke="#e2e8f0" stroke-width="2.5"/>
  <text x="54" y="156" fill="#c4b5fd" font-family="sans-serif" font-size="15" font-weight="bold">L</text>
  <text x="108" y="128" fill="#f59e0b" font-family="sans-serif" font-size="13" font-weight="bold">+</text>
  <text x="108" y="154" fill="#e2e8f0" font-family="sans-serif" font-size="12">v_L</text>
  <text x="108" y="182" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="bold">-</text>

  <!-- 电阻 -->
  <line x1="298" y1="98" x2="298" y2="122" stroke="#e2e8f0" stroke-width="2.5"/>
  <polyline points="298,122 288,128 308,138 288,148 308,158 288,168 308,178 298,184" fill="none" stroke="#f97316" stroke-width="2.5"/>
  <line x1="298" y1="184" x2="298" y2="208" stroke="#e2e8f0" stroke-width="2.5"/>
  <text x="320" y="156" fill="#fdba74" font-family="sans-serif" font-size="15" font-weight="bold">R</text>

  <!-- 顺时针电流箭头 -->
  <line x1="150" y1="88" x2="230" y2="88" stroke="#22c55e" stroke-width="2.5"/>
  <polygon points="230,83 242,88 230,93" fill="#22c55e"/>
  <text x="194" y="116" fill="#86efac" font-family="sans-serif" font-size="12" text-anchor="middle">i(t), 初值 i(0+) = I0</text>
  <text x="194" y="234" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">磁场储能 w_L(0) = 1/2 L I0^2</text>

  <!-- 右侧：对偶对比卡片 -->
  <rect x="384" y="48" width="352" height="202" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="560" y="72" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">RC 与 RL 严格对偶关系</text>

  <line x1="400" y1="86" x2="720" y2="86" stroke="#475569" stroke-width="1"/>
  <text x="445" y="106" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">维度</text>
  <text x="550" y="106" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">无源 RC</text>
  <text x="665" y="106" fill="#a78bfa" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">无源 RL</text>
  <line x1="400" y1="115" x2="720" y2="115" stroke="#475569" stroke-width="1"/>

  <text x="445" y="138" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">连续状态量</text>
  <text x="550" y="138" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">电容电压 v(t)</text>
  <text x="665" y="138" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">电感电流 i(t)</text>

  <text x="445" y="164" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">列写定律</text>
  <text x="550" y="164" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">节点 KCL</text>
  <text x="665" y="164" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">回路 KVL</text>

  <text x="445" y="190" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">时间常数 τ</text>
  <text x="550" y="190" fill="#fcd34d" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">τ = R_Th · C</text>
  <text x="665" y="190" fill="#fcd34d" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">τ = L / R_Th</text>

  <text x="445" y="216" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">R 增大时</text>
  <text x="550" y="216" fill="#86efac" font-family="sans-serif" font-size="11" text-anchor="middle">τ 增大（更慢）</text>
  <text x="665" y="216" fill="#fda4af" font-family="sans-serif" font-size="11" text-anchor="middle">τ 减小（更快）</text>

  <text x="445" y="240" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">稳态等效</text>
  <text x="550" y="240" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">直流开路</text>
  <text x="665" y="240" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">直流短路</text>
</svg>`;

export const SHEET_ACT5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 300" width="760" height="300">
  <rect width="760" height="300" rx="12" fill="#0f172a"/>
  <text x="380" y="26" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">图 5-1：带开关多电阻 RC 网络拓扑切换（左：t &lt; 0 充电稳态；右：t &gt; 0 无源放电求 R_Th）</text>

  <!-- 左图：t < 0 稳态（开关 S 闭合，电容开路） -->
  <rect x="16" y="42" width="356" height="242" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="194" y="64" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">状态 A：t = 0-（开关闭合稳态，C 视为开路）</text>

  <!-- 24V 电源 -->
  <circle cx="52" cy="164" r="18" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <text x="52" y="159" fill="#f59e0b" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">+</text>
  <text x="52" y="175" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">-</text>
  <text x="52" y="198" fill="#fcd34d" font-family="sans-serif" font-size="11" text-anchor="middle">24 V</text>

  <!-- 主干连线 -->
  <line x1="52" y1="146" x2="52" y2="96" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="52" y1="182" x2="52" y2="240" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="52" y1="240" x2="340" y2="240" stroke="#e2e8f0" stroke-width="2"/>

  <!-- 闭合开关 S + R1 = 6Ω -->
  <line x1="52" y1="96" x2="80" y2="96" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="80" cy="96" r="3" fill="#22c55e"/>
  <line x1="80" y1="96" x2="108" y2="96" stroke="#22c55e" stroke-width="2.5"/>
  <circle cx="108" cy="96" r="3" fill="#22c55e"/>
  <text x="94" y="85" fill="#86efac" font-family="sans-serif" font-size="10" text-anchor="middle">S 闭合</text>
  <polyline points="108,96 116,96 120,88 128,104 136,88 144,104 152,88 156,96 176,96" fill="none" stroke="#f97316" stroke-width="2.2"/>
  <text x="136" y="80" fill="#fdba74" font-family="sans-serif" font-size="11" text-anchor="middle">R1=6Ω</text>

  <!-- 节点 A -->
  <circle cx="176" cy="96" r="4" fill="#f59e0b"/>
  <text x="176" y="82" fill="#fcd34d" font-family="sans-serif" font-size="11" text-anchor="middle">A (12V)</text>

  <!-- R2 = 12Ω 到地 -->
  <line x1="176" y1="96" x2="176" y2="132" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="176,132 168,138 184,146 168,154 184,162 168,170 184,178 176,184" fill="none" stroke="#f97316" stroke-width="2.2"/>
  <line x1="176" y1="184" x2="176" y2="240" stroke="#e2e8f0" stroke-width="2"/>
  <text x="148" y="162" fill="#fdba74" font-family="sans-serif" font-size="11" text-anchor="end">R2=12Ω</text>

  <!-- R3 = 6Ω -->
  <polyline points="176,96 196,96 200,88 208,104 216,88 224,104 232,88 236,96 264,96" fill="none" stroke="#f97316" stroke-width="2.2"/>
  <text x="216" y="80" fill="#fdba74" font-family="sans-serif" font-size="11" text-anchor="middle">R3=6Ω</text>

  <!-- 节点 B 与 R4 = 6Ω -->
  <circle cx="264" cy="96" r="4" fill="#38bdf8"/>
  <text x="264" y="82" fill="#7dd3fc" font-family="sans-serif" font-size="11" text-anchor="middle">B (6V)</text>
  <line x1="264" y1="96" x2="264" y2="132" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="264,132 256,138 272,146 256,154 272,162 256,170 272,178 264,184" fill="none" stroke="#f97316" stroke-width="2.2"/>
  <line x1="264" y1="184" x2="264" y2="240" stroke="#e2e8f0" stroke-width="2"/>
  <text x="242" y="162" fill="#fdba74" font-family="sans-serif" font-size="11" text-anchor="end">R4=6Ω</text>

  <!-- 电容开路虚线标注 -->
  <line x1="264" y1="96" x2="332" y2="96" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4,3"/>
  <line x1="332" y1="96" x2="332" y2="148" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4,3"/>
  <circle cx="332" cy="148" r="3" fill="#38bdf8"/>
  <circle cx="332" cy="182" r="3" fill="#38bdf8"/>
  <line x1="332" y1="182" x2="332" y2="240" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4,3"/>
  <text x="332" y="169" fill="#7dd3fc" font-family="sans-serif" font-size="10" text-anchor="middle">C 开路</text>
  <text x="194" y="268" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">结果：v_C(0-) = v_B(0-) = 6 V</text>

  <!-- 右图：t > 0 无源放电（开关断开，求 R_Th） -->
  <rect x="388" y="42" width="356" height="242" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="566" y="64" fill="#fda4af" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">状态 B：t &gt; 0（开关断开，左侧电源支路脱离）</text>

  <!-- 断开提示 -->
  <line x1="410" y1="96" x2="432" y2="96" stroke="#64748b" stroke-width="2" stroke-dasharray="3,3"/>
  <line x1="432" y1="96" x2="452" y2="80" stroke="#f43f5e" stroke-width="2.5"/>
  <text x="434" y="114" fill="#fda4af" font-family="sans-serif" font-size="10" text-anchor="middle">S 已断开</text>

  <!-- 右侧无源回路：R2 与 R3 串联，再与 R4 并联，接 C -->
  <line x1="484" y1="96" x2="690" y2="96" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="484" y1="240" x2="690" y2="240" stroke="#e2e8f0" stroke-width="2"/>

  <!-- R2 = 12Ω -->
  <line x1="484" y1="96" x2="484" y2="132" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="484,132 476,138 492,146 476,154 492,162 476,170 492,178 484,184" fill="none" stroke="#f97316" stroke-width="2.2"/>
  <line x1="484" y1="184" x2="484" y2="240" stroke="#e2e8f0" stroke-width="2"/>
  <text x="460" y="162" fill="#fdba74" font-family="sans-serif" font-size="11" text-anchor="end">R2=12Ω</text>

  <!-- R3 = 6Ω -->
  <polyline points="484,96 516,96 520,88 528,104 536,88 544,104 552,88 556,96 594,96" fill="none" stroke="#f97316" stroke-width="2.2"/>
  <text x="536" y="80" fill="#fdba74" font-family="sans-serif" font-size="11" text-anchor="middle">R3=6Ω（与 R2 串联=18Ω）</text>

  <!-- R4 = 6Ω -->
  <line x1="594" y1="96" x2="594" y2="132" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="594,132 586,138 602,146 586,154 602,162 586,170 602,178 594,184" fill="none" stroke="#f97316" stroke-width="2.2"/>
  <line x1="594" y1="184" x2="594" y2="240" stroke="#e2e8f0" stroke-width="2"/>
  <text x="576" y="162" fill="#fdba74" font-family="sans-serif" font-size="11" text-anchor="end">R4=6Ω</text>

  <!-- 电容 C = 0.2 F -->
  <line x1="690" y1="96" x2="690" y2="154" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="670" y1="154" x2="710" y2="154" stroke="#38bdf8" stroke-width="3.5"/>
  <line x1="670" y1="168" x2="710" y2="168" stroke="#38bdf8" stroke-width="3.5"/>
  <line x1="690" y1="168" x2="690" y2="240" stroke="#e2e8f0" stroke-width="2"/>
  <text x="690" y="142" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">C=0.2 F</text>

  <!-- 向左看 R_Th 箭头 -->
  <line x1="660" y1="196" x2="624" y2="196" stroke="#22c55e" stroke-width="2.2"/>
  <polygon points="626,191 616,196 626,201" fill="#22c55e"/>
  <text x="642" y="216" fill="#86efac" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">R_Th = 18∥6</text>
  <text x="566" y="268" fill="#86efac" font-family="sans-serif" font-size="11" text-anchor="middle">结果：R_Th = 4.5 Ω, τ = R_Th·C = 0.9 s</text>
</svg>`;

export const SHEET_ACT6 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 270" width="760" height="270">
  <rect width="760" height="270" rx="12" fill="#0f172a"/>
  <text x="380" y="26" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">图 6-1：3D 面包板安全实操接线映射（5 V / 10 kΩ / 100 μF → τ = 1.0 s）</text>

  <!-- 左侧：面包板拓扑映射 -->
  <rect x="20" y="44" width="348" height="206" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
  <text x="194" y="66" fill="#fcd34d" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">面包板核心走线（SPDT 开关切换）</text>
  <!-- 电源轨 -->
  <line x1="38" y1="84" x2="348" y2="84" stroke="#ef4444" stroke-width="2.5"/>
  <text x="42" y="79" fill="#fca5a5" font-family="sans-serif" font-size="10">+5 V 电源轨</text>
  <line x1="38" y1="226" x2="348" y2="226" stroke="#3b82f6" stroke-width="2.5"/>
  <text x="42" y="220" fill="#93c5fd" font-family="sans-serif" font-size="10">GND 公共地轨</text>

  <!-- SPDT 开关盒子 -->
  <rect x="52" y="106" width="76" height="44" rx="6" fill="#0f172a" stroke="#22c55e" stroke-width="1.8"/>
  <text x="90" y="125" fill="#86efac" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SPDT 开关</text>
  <text x="90" y="141" fill="#cbd5e1" font-family="sans-serif" font-size="9" text-anchor="middle">左充 ↔ 右放</text>
  <line x1="70" y1="84" x2="70" y2="106" stroke="#ef4444" stroke-width="2"/>

  <!-- 公共节点接电容 100uF -->
  <line x1="128" y1="128" x2="210" y2="128" stroke="#f59e0b" stroke-width="2.2"/>
  <circle cx="195" cy="128" r="4" fill="#f59e0b"/>
  <text x="195" y="116" fill="#fcd34d" font-family="sans-serif" font-size="10" text-anchor="middle">CH1 探头</text>
  <rect x="175" y="146" width="40" height="54" rx="6" fill="#0284c7" stroke="#7dd3fc" stroke-width="1.5"/>
  <text x="195" y="170" fill="#f8fafc" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">100μF</text>
  <text x="195" y="186" fill="#bae6fd" font-family="sans-serif" font-size="9" text-anchor="middle">+ 上 - 下</text>
  <line x1="195" y1="128" x2="195" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="195" y1="200" x2="195" y2="226" stroke="#3b82f6" stroke-width="2"/>

  <!-- 10kΩ 放电电阻 -->
  <line x1="210" y1="128" x2="294" y2="128" stroke="#f59e0b" stroke-width="2.2"/>
  <rect x="278" y="146" width="32" height="54" rx="4" fill="#9a3412" stroke="#fdba74" stroke-width="1.5"/>
  <text x="294" y="176" fill="#ffedd5" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">10kΩ</text>
  <line x1="294" y1="128" x2="294" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="294" y1="200" x2="294" y2="226" stroke="#3b82f6" stroke-width="2"/>

  <!-- 右侧：示波器读数对照 -->
  <rect x="386" y="44" width="354" height="206" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="563" y="66" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">虚拟示波器 CH1 实测衰减检查点 (V0 = 5.00 V)</text>

  <line x1="422" y1="216" x2="716" y2="216" stroke="#94a3b8" stroke-width="1.6"/>
  <line x1="422" y1="216" x2="422" y2="86" stroke="#94a3b8" stroke-width="1.6"/>
  <polyline points="422,96 476,172 530,200 584,210 638,214 692,215.2" fill="none" stroke="#22c55e" stroke-width="2.8"/>

  <circle cx="422" cy="96" r="4" fill="#f8fafc"/>
  <text x="430" y="96" fill="#f8fafc" font-family="sans-serif" font-size="10">0 s: 5.00 V</text>

  <circle cx="476" cy="172" r="4.5" fill="#f59e0b"/>
  <text x="484" y="166" fill="#fcd34d" font-family="sans-serif" font-size="10" font-weight="bold">1 s (1τ): 1.84 V</text>

  <circle cx="530" cy="200" r="4" fill="#38bdf8"/>
  <text x="536" y="192" fill="#7dd3fc" font-family="sans-serif" font-size="10">2 s: 0.68 V</text>

  <circle cx="692" cy="215.2" r="4.5" fill="#22c55e"/>
  <text x="688" y="202" fill="#86efac" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="end">5 s (5τ): 0.034 V</text>

  <text x="563" y="238" fill="#94a3b8" font-family="sans-serif" font-size="10" text-anchor="middle">安全指标：I_max = 0.50 mA | P_max = 2.50 mW | W0 = 1.25 mJ</text>
</svg>`;

export const SHEET_MINI1 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='20' fill='#38bdf8' font-size='11' font-family='sans-serif' text-anchor='middle'>t = 0- 稳态：C 等效为开路</text><line x1='24' y1='42' x2='236' y2='42' stroke='#e2e8f0' stroke-width='2'/><line x1='24' y1='90' x2='236' y2='90' stroke='#e2e8f0' stroke-width='2'/><text x='42' y='70' fill='#fcd34d' font-size='11' font-family='sans-serif'>24V</text><text x='86' y='36' fill='#fdba74' font-size='10' font-family='sans-serif'>R1=6Ω</text><text x='132' y='70' fill='#fdba74' font-size='10' font-family='sans-serif'>R2=12Ω</text><text x='186' y='36' fill='#fdba74' font-size='10' font-family='sans-serif'>R3=6Ω</text><text x='214' y='70' fill='#fdba74' font-size='10' font-family='sans-serif'>R4=6Ω</text></svg>`;

export const SHEET_MINI2 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='24' fill='#f59e0b' font-size='11' font-family='sans-serif' text-anchor='middle'>换路瞬间 t = 0- → t = 0+</text><rect x='22' y='40' width='98' height='52' rx='6' fill='#1e293b' stroke='#38bdf8'/><text x='71' y='62' fill='#38bdf8' font-size='11' font-family='sans-serif' text-anchor='middle'>v_C 连续守恒</text><text x='71' y='80' fill='#e2e8f0' font-size='11' font-family='sans-serif' text-anchor='middle'>6 V → 6 V</text><rect x='140' y='40' width='98' height='52' rx='6' fill='#1e293b' stroke='#f43f5e'/><text x='189' y='62' fill='#fda4af' font-size='11' font-family='sans-serif' text-anchor='middle'>v_R2 允许跳变</text><text x='189' y='80' fill='#e2e8f0' font-size='11' font-family='sans-serif' text-anchor='middle'>12 V → 4 V</text></svg>`;

export const SHEET_MINI3 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='20' fill='#86efac' font-size='11' font-family='sans-serif' text-anchor='middle'>t &gt; 0 等效电阻：R_Th = (R2 + R3) ∥ R4</text><rect x='26' y='40' width='86' height='46' rx='6' fill='#1e293b' stroke='#f97316'/><text x='69' y='68' fill='#fdba74' font-size='11' font-family='sans-serif' text-anchor='middle'>R2+R3=18Ω</text><text x='130' y='68' fill='#e2e8f0' font-size='14' font-family='sans-serif' text-anchor='middle'>∥</text><rect x='148' y='40' width='86' height='46' rx='6' fill='#1e293b' stroke='#f97316'/><text x='191' y='68' fill='#fdba74' font-size='11' font-family='sans-serif' text-anchor='middle'>R4=6Ω</text></svg>`;

export const SHEET_MINI4 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='22' fill='#38bdf8' font-size='11' font-family='sans-serif' text-anchor='middle'>电容电压驱动两支路同步指数衰减</text><line x1='30' y1='90' x2='230' y2='90' stroke='#94a3b8' stroke-width='1.5'/><line x1='30' y1='90' x2='30' y2='34' stroke='#94a3b8' stroke-width='1.5'/><path d='M 30 38 Q 90 74 220 88' fill='none' stroke='#38bdf8' stroke-width='2.5'/><path d='M 30 56 Q 90 80 220 89' fill='none' stroke='#f59e0b' stroke-width='2' stroke-dasharray='4,3'/><text x='155' y='52' fill='#7dd3fc' font-size='10' font-family='sans-serif'>v_C(t) = 6e^(-t/0.9)</text><text x='155' y='70' fill='#fcd34d' font-size='10' font-family='sans-serif'>v_R2(t) = 4e^(-t/0.9)</text></svg>`;

export const SHEET_MINI5 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 110' width='260' height='110'><rect width='260' height='110' rx='6' fill='#0f172a'/><text x='130' y='22' fill='#86efac' font-size='11' font-family='sans-serif' text-anchor='middle'>总储能 W0 = 3.6 J 分配条形图</text><rect x='20' y='44' width='165' height='26' fill='#f97316'/><text x='102' y='61' fill='#0f172a' font-size='10' font-weight='bold' font-family='sans-serif' text-anchor='middle'>R4: 2.7 J (75%)</text><rect x='185' y='44' width='37' height='26' fill='#38bdf8'/><text x='203' y='61' fill='#0f172a' font-size='9' font-weight='bold' font-family='sans-serif' text-anchor='middle'>0.6J</text><rect x='222' y='44' width='18' height='26' fill='#a78bfa'/><text x='130' y='92' fill='#cbd5e1' font-size='10' font-family='sans-serif' text-anchor='middle'>2.7 + 0.6 + 0.3 = 3.6 J（严格守恒）</text></svg>`;
