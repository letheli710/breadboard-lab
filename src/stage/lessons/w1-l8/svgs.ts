// W1-L8 diagrams, as given in the lesson sheet (docs/lessons/W1-L8.md). Extracted verbatim;
// index.ts adds an aria label and typesets the "R_xx" labels with subscripts (sheetSvg).

export const SVG_ACT1 = `<svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <rect width="420" height="260" rx="12" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Act 1 · 经典 5 电阻惠斯通电桥（无任何串联/并联对）</text>

  <!-- 外部端口引线 a 和 b -->
  <line x1="210" y1="36" x2="210" y2="62" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="210" y1="218" x2="210" y2="244" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="210" cy="36" r="4.5" fill="#0f172a" stroke="#10b981" stroke-width="2.2"/>
  <circle cx="210" cy="244" r="4.5" fill="#0f172a" stroke="#10b981" stroke-width="2.2"/>
  <text x="222" y="40" fill="#10b981" font-size="13" font-weight="700">a</text>
  <text x="222" y="248" fill="#10b981" font-size="13" font-weight="700">b</text>

  <!-- 菱形四臂骨架 -->
  <!-- 左上 R_ac -->
  <line x1="210" y1="62" x2="178" y2="94" stroke="#38bdf8" stroke-width="2.2"/>
  <rect x="132" y="84" width="46" height="18" rx="4" transform="rotate(-45 155 93)" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <line x1="138" y1="134" x2="110" y2="140" stroke="none"/>
  <line x1="142" y1="130" x2="116" y2="140" stroke="none"/>
  <line x1="139" y1="109" x2="108" y2="140" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="118" y="86" fill="#38bdf8" font-size="12" font-weight="600">R_ac</text>

  <!-- 右上 R_ad -->
  <line x1="210" y1="62" x2="242" y2="94" stroke="#38bdf8" stroke-width="2.2"/>
  <rect x="242" y="84" width="46" height="18" rx="4" transform="rotate(45 265 93)" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <line x1="281" y1="109" x2="312" y2="140" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="284" y="86" fill="#38bdf8" font-size="12" font-weight="600">R_ad</text>

  <!-- 左下 R_cb -->
  <line x1="108" y1="140" x2="139" y2="171" stroke="#cbd5e1" stroke-width="2.2"/>
  <rect x="132" y="178" width="46" height="18" rx="4" transform="rotate(45 155 187)" fill="#1e293b" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="178" y1="186" x2="210" y2="218" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="114" y="205" fill="#cbd5e1" font-size="12" font-weight="600">R_cb</text>

  <!-- 右下 R_db -->
  <line x1="312" y1="140" x2="281" y2="171" stroke="#cbd5e1" stroke-width="2.2"/>
  <rect x="242" y="178" width="46" height="18" rx="4" transform="rotate(-45 265 187)" fill="#1e293b" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="242" y1="186" x2="210" y2="218" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="284" y="205" fill="#cbd5e1" font-size="12" font-weight="600">R_db</text>

  <!-- 中间桥臂 R_cd -->
  <line x1="108" y1="140" x2="175" y2="140" stroke="#f43f5e" stroke-width="2.4"/>
  <rect x="175" y="130" width="70" height="20" rx="4" fill="#3b0718" stroke="#f43f5e" stroke-width="2.2"/>
  <text x="210" y="144" fill="#fda4af" font-size="12" font-weight="700" text-anchor="middle">R_cd</text>
  <line x1="245" y1="140" x2="312" y2="140" stroke="#f43f5e" stroke-width="2.4"/>

  <!-- 四个内部节点 -->
  <circle cx="210" cy="62" r="4.5" fill="#10b981"/>
  <circle cx="210" cy="218" r="4.5" fill="#10b981"/>
  <circle cx="108" cy="140" r="5" fill="#f59e0b"/>
  <circle cx="312" cy="140" r="5" fill="#f59e0b"/>

  <!-- 节点与度数标注 -->
  <text x="92" y="144" fill="#f59e0b" font-size="13" font-weight="700" text-anchor="end">c</text>
  <text x="328" y="144" fill="#f59e0b" font-size="13" font-weight="700">d</text>
  <rect x="14" y="154" width="84" height="22" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/>
  <text x="56" y="169" fill="#fde68a" font-size="10.5" text-anchor="middle">度数=3 (分流!)</text>
  <rect x="322" y="154" width="84" height="22" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/>
  <text x="364" y="169" fill="#fde68a" font-size="10.5" text-anchor="middle">度数=3 (分流!)</text>
  <text x="210" y="122" fill="#fda4af" font-size="10.5" text-anchor="middle">桥臂打破了所有串并联关系</text>
</svg>`;

export const SVG_ACT2 = `<svg viewBox="0 0 420 250" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <rect width="420" height="250" rx="12" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Act 2 · 端口两两开路等效：R_ab(Δ) = R_ab(Y)（c 端开路）</text>

  <!-- 左侧 Δ 网络 -->
  <text x="102" y="48" fill="#38bdf8" font-size="12.5" font-weight="700" text-anchor="middle">Δ 网络（三角形）</text>
  <!-- 端口 a, b, c -->
  <circle cx="42" cy="82" r="4.5" fill="#10b981"/>
  <circle cx="162" cy="82" r="4.5" fill="#10b981"/>
  <circle cx="102" cy="196" r="4.5" fill="#10b981"/>
  <text x="30" y="86" fill="#10b981" font-size="12" font-weight="700">a</text>
  <text x="171" y="86" fill="#10b981" font-size="12" font-weight="700">b</text>
  <text x="102" y="214" fill="#10b981" font-size="12" font-weight="700" text-anchor="middle">c (开路)</text>

  <!-- R_c (a-b) -->
  <line x1="46" y1="82" x2="76" y2="82" stroke="#38bdf8" stroke-width="2.2"/>
  <rect x="76" y="73" width="52" height="18" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="102" y="86" fill="#e0f2fe" font-size="11" font-weight="600" text-anchor="middle">R_c=25Ω</text>
  <line x1="128" y1="82" x2="158" y2="82" stroke="#38bdf8" stroke-width="2.2"/>

  <!-- R_b (a-c) -->
  <line x1="42" y1="86" x2="62" y2="122" stroke="#38bdf8" stroke-width="2.2"/>
  <rect x="48" y="130" width="44" height="18" rx="4" transform="rotate(62 70 139)" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <line x1="82" y1="158" x2="102" y2="192" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="48" y="156" fill="#38bdf8" font-size="11" font-weight="600" text-anchor="end">R_b=10Ω</text>

  <!-- R_a (b-c) -->
  <line x1="162" y1="86" x2="142" y2="122" stroke="#38bdf8" stroke-width="2.2"/>
  <rect x="112" y="130" width="44" height="18" rx="4" transform="rotate(-62 134 139)" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <line x1="122" y1="158" x2="102" y2="192" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="155" y="156" fill="#38bdf8" font-size="11" font-weight="600">R_a=15Ω</text>

  <!-- 等效双箭头 -->
  <line x1="192" y1="138" x2="228" y2="138" stroke="#f59e0b" stroke-width="2.5"/>
  <polygon points="228,133 238,138 228,143" fill="#f59e0b"/>
  <polygon points="192,133 182,138 192,143" fill="#f59e0b"/>
  <text x="210" y="126" fill="#fde68a" font-size="11" font-weight="700" text-anchor="middle">端口等效</text>
  <text x="210" y="156" fill="#94a3b8" font-size="10.5" text-anchor="middle">R_ab=12.5Ω</text>

  <!-- 右侧 Y 网络 -->
  <text x="318" y="48" fill="#f59e0b" font-size="12.5" font-weight="700" text-anchor="middle">Y 网络（星形）</text>
  <circle cx="258" cy="82" r="4.5" fill="#10b981"/>
  <circle cx="378" cy="82" r="4.5" fill="#10b981"/>
  <circle cx="318" cy="196" r="4.5" fill="#10b981"/>
  <circle cx="318" cy="128" r="4.5" fill="#f59e0b"/>
  <text x="246" y="86" fill="#10b981" font-size="12" font-weight="700">a</text>
  <text x="387" y="86" fill="#10b981" font-size="12" font-weight="700">b</text>
  <text x="318" y="214" fill="#10b981" font-size="12" font-weight="700" text-anchor="middle">c (开路)</text>
  <text x="328" y="138" fill="#f59e0b" font-size="11.5" font-weight="700">n</text>

  <!-- R_1 (a-n) -->
  <line x1="262" y1="85" x2="276" y2="96" stroke="#f59e0b" stroke-width="2.2"/>
  <rect x="270" y="96" width="38" height="16" rx="4" transform="rotate(37 289 104)" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <line x1="304" y1="117" x2="315" y2="126" stroke="#f59e0b" stroke-width="2.2"/>
  <text x="266" y="124" fill="#fde68a" font-size="11" font-weight="600" text-anchor="end">R_1=5Ω</text>

  <!-- R_2 (b-n) -->
  <line x1="374" y1="85" x2="360" y2="96" stroke="#f59e0b" stroke-width="2.2"/>
  <rect x="328" y="96" width="38" height="16" rx="4" transform="rotate(-37 347 104)" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <line x1="332" y1="117" x2="321" y2="126" stroke="#f59e0b" stroke-width="2.2"/>
  <text x="369" y="124" fill="#fde68a" font-size="11" font-weight="600">R_2=7.5Ω</text>

  <!-- R_3 (c-n) -->
  <line x1="318" y1="132" x2="318" y2="146" stroke="#f59e0b" stroke-width="2.2"/>
  <rect x="309" y="146" width="18" height="34" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <line x1="318" y1="180" x2="318" y2="192" stroke="#f59e0b" stroke-width="2.2"/>
  <text x="334" y="168" fill="#fde68a" font-size="11" font-weight="600">R_3=3Ω</text>

  <!-- 底部等式提示 -->
  <rect x="24" y="224" width="372" height="18" rx="4" fill="#1e293b"/>
  <text x="210" y="237" fill="#cbd5e1" font-size="10.5" text-anchor="middle">Δ 侧：25 // (15 + 10) = 12.5 Ω   ≡   Y 侧：R_1 + R_2 = 5 + 7.5 = 12.5 Ω</text>
</svg>`;

export const SVG_ACT3 = `<svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <rect width="420" height="260" rx="12" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Act 3 · 图形记忆法：“把 Δ 叠画在 Y 外面”（相邻 vs 对面）</text>

  <!-- 外框 Δ (青蓝色虚线+元件) -->
  <line x1="95" y1="68" x2="325" y2="68" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4"/>
  <line x1="95" y1="68" x2="210" y2="220" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4"/>
  <line x1="325" y1="68" x2="210" y2="220" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4"/>

  <!-- Δ 电阻框 -->
  <rect x="184" y="57" width="52" height="22" rx="5" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2"/>
  <text x="210" y="72" fill="#e0f2fe" font-size="12" font-weight="700" text-anchor="middle">R_c</text>

  <rect x="115" y="138" width="46" height="22" rx="5" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2"/>
  <text x="138" y="153" fill="#e0f2fe" font-size="12" font-weight="700" text-anchor="middle">R_b</text>

  <rect x="259" y="138" width="46" height="22" rx="5" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2"/>
  <text x="282" y="153" fill="#e0f2fe" font-size="12" font-weight="700" text-anchor="middle">R_a</text>

  <!-- 内部 Y (琥珀色实线+元件) -->
  <line x1="95" y1="68" x2="210" y2="128" stroke="#f59e0b" stroke-width="2.6"/>
  <line x1="325" y1="68" x2="210" y2="128" stroke="#f59e0b" stroke-width="2.6"/>
  <line x1="210" y1="128" x2="210" y2="220" stroke="#f59e0b" stroke-width="2.6"/>

  <!-- Y 电阻框 -->
  <rect x="136" y="88" width="38" height="20" rx="5" fill="#451a03" stroke="#f59e0b" stroke-width="2"/>
  <text x="155" y="102" fill="#fde68a" font-size="11.5" font-weight="700" text-anchor="middle">R_1</text>

  <rect x="246" y="88" width="38" height="20" rx="5" fill="#451a03" stroke="#f59e0b" stroke-width="2"/>
  <text x="265" y="102" fill="#fde68a" font-size="11.5" font-weight="700" text-anchor="middle">R_2</text>

  <rect x="191" y="164" width="38" height="20" rx="5" fill="#451a03" stroke="#f59e0b" stroke-width="2"/>
  <text x="210" y="178" fill="#fde68a" font-size="11.5" font-weight="700" text-anchor="middle">R_3</text>

  <!-- 相邻高亮弧线（围绕端口 a） -->
  <path d="M 122 68 A 28 28 0 0 1 108 92" fill="none" stroke="#10b981" stroke-width="2.2"/>
  <text x="16" y="54" fill="#10b981" font-size="10.5" font-weight="600">相邻两臂: R_b, R_c</text>
  <text x="16" y="68" fill="#94a3b8" font-size="10">→ R_1 = (R_b·R_c)/Σ</text>

  <!-- 对面指引虚线（R_1 指向 R_a） -->
  <line x1="176" y1="106" x2="255" y2="144" stroke="#f43f5e" stroke-width="1.8" stroke-dasharray="4,3"/>
  <polygon points="253,139 260,146 250,146" fill="#f43f5e"/>
  <text x="315" y="196" fill="#fda4af" font-size="10.5" font-weight="600">R_a 的对面是 R_1</text>
  <text x="315" y="210" fill="#94a3b8" font-size="10">→ R_a = P_Σ / R_1</text>

  <!-- 端口节点 -->
  <circle cx="95" cy="68" r="5" fill="#10b981"/>
  <circle cx="325" cy="68" r="5" fill="#10b981"/>
  <circle cx="210" cy="220" r="5" fill="#10b981"/>
  <circle cx="210" cy="128" r="4.5" fill="#f59e0b"/>
  <text x="82" y="72" fill="#10b981" font-size="12.5" font-weight="700">a</text>
  <text x="336" y="72" fill="#10b981" font-size="12.5" font-weight="700">b</text>
  <text x="210" y="239" fill="#10b981" font-size="12.5" font-weight="700" text-anchor="middle">c</text>
  <text x="210" y="121" fill="#fde68a" font-size="10.5" font-weight="700" text-anchor="middle">n</text>
</svg>`;

export const SVG_ACT4 = `<svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <rect width="420" height="240" rx="12" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Act 4 · 对称网络秒杀：R_Δ = 3 R_Y（Δ 大 Y 小，系数为 3）</text>

  <!-- 左侧对称 Δ -->
  <rect x="18" y="42" width="160" height="176" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
  <text x="98" y="62" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">对称 Δ（每边 30 Ω）</text>
  <polygon points="52,92 144,92 98,176" fill="none" stroke="#38bdf8" stroke-width="2.4"/>
  <rect x="78" y="83" width="40" height="18" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.6"/>
  <text x="98" y="96" fill="#e0f2fe" font-size="11" font-weight="700" text-anchor="middle">30 Ω</text>
  <rect x="44" y="130" width="38" height="18" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.6"/>
  <text x="63" y="143" fill="#e0f2fe" font-size="10.5" font-weight="700" text-anchor="middle">30 Ω</text>
  <rect x="114" y="130" width="38" height="18" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.6"/>
  <text x="133" y="143" fill="#e0f2fe" font-size="10.5" font-weight="700" text-anchor="middle">30 Ω</text>
  <circle cx="52" cy="92" r="4" fill="#10b981"/>
  <circle cx="144" cy="92" r="4" fill="#10b981"/>
  <circle cx="98" cy="176" r="4" fill="#10b981"/>
  <text x="98" y="204" fill="#94a3b8" font-size="10.5" text-anchor="middle">R_ab = 30 // 60 = 20 Ω</text>

  <!-- 中间转换箭头 -->
  <line x1="186" y1="112" x2="232" y2="112" stroke="#10b981" stroke-width="2.2"/>
  <polygon points="232,107 240,112 232,117" fill="#10b981"/>
  <text x="210" y="104" fill="#10b981" font-size="11.5" font-weight="700" text-anchor="middle">÷ 3</text>

  <line x1="234" y1="146" x2="188" y2="146" stroke="#f59e0b" stroke-width="2.2"/>
  <polygon points="188,141 180,146 188,151" fill="#f59e0b"/>
  <text x="210" y="164" fill="#f59e0b" font-size="11.5" font-weight="700" text-anchor="middle">× 3</text>

  <!-- 右侧对称 Y -->
  <rect x="242" y="42" width="160" height="176" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
  <text x="322" y="62" fill="#f59e0b" font-size="12" font-weight="700" text-anchor="middle">对称 Y（每臂 10 Ω）</text>
  <line x1="276" y1="92" x2="322" y2="128" stroke="#f59e0b" stroke-width="2.4"/>
  <line x1="368" y1="92" x2="322" y2="128" stroke="#f59e0b" stroke-width="2.4"/>
  <line x1="322" y1="128" x2="322" y2="176" stroke="#f59e0b" stroke-width="2.4"/>
  <rect x="275" y="101" width="36" height="17" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.6"/>
  <text x="293" y="113" fill="#fde68a" font-size="10.5" font-weight="700" text-anchor="middle">10 Ω</text>
  <rect x="333" y="101" width="36" height="17" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.6"/>
  <text x="351" y="113" fill="#fde68a" font-size="10.5" font-weight="700" text-anchor="middle">10 Ω</text>
  <rect x="304" y="144" width="36" height="17" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.6"/>
  <text x="322" y="156" fill="#fde68a" font-size="10.5" font-weight="700" text-anchor="middle">10 Ω</text>
  <circle cx="276" cy="92" r="4" fill="#10b981"/>
  <circle cx="368" cy="92" r="4" fill="#10b981"/>
  <circle cx="322" cy="176" r="4" fill="#10b981"/>
  <circle cx="322" cy="128" r="4" fill="#f59e0b"/>
  <text x="322" y="204" fill="#94a3b8" font-size="10.5" text-anchor="middle">R_ab = 10 + 10 = 20 Ω</text>
</svg>`;

export const SVG_ACT5 = `<svg viewBox="0 0 420 270" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <rect width="420" height="270" rx="12" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Act 5 · 实战拆解：电桥顶部 Δ → Y 后瞬间退化为普通串并联</text>

  <!-- 左图：原电桥 -->
  <text x="96" y="46" fill="#38bdf8" font-size="11.5" font-weight="700" text-anchor="middle">原电桥（锁定态）</text>
  <polygon points="96,64 42,132 150,132" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" stroke-width="2"/>
  <line x1="42" y1="132" x2="96" y2="212" stroke="#94a3b8" stroke-width="2"/>
  <line x1="150" y1="132" x2="96" y2="212" stroke="#94a3b8" stroke-width="2"/>
  <line x1="96" y1="50" x2="96" y2="64" stroke="#10b981" stroke-width="2"/>
  <line x1="96" y1="212" x2="96" y2="226" stroke="#10b981" stroke-width="2"/>
  <text x="54" y="94" fill="#38bdf8" font-size="10.5" font-weight="600">12Ω</text>
  <text x="122" y="94" fill="#38bdf8" font-size="10.5" font-weight="600">18Ω</text>
  <text x="96" y="126" fill="#fda4af" font-size="10.5" font-weight="700" text-anchor="middle">6Ω</text>
  <text x="48" y="182" fill="#cbd5e1" font-size="10.5">10Ω</text>
  <text x="128" y="182" fill="#cbd5e1" font-size="10.5">21Ω</text>
  <circle cx="96" cy="64" r="3.5" fill="#10b981"/>
  <circle cx="96" cy="212" r="3.5" fill="#10b981"/>
  <circle cx="42" cy="132" r="3.5" fill="#f59e0b"/>
  <circle cx="150" cy="132" r="3.5" fill="#f59e0b"/>
  <text x="105" y="59" fill="#10b981" font-size="11" font-weight="700">a</text>
  <text x="105" y="230" fill="#10b981" font-size="11" font-weight="700">b</text>

  <!-- 箭头 -->
  <line x1="176" y1="136" x2="218" y2="136" stroke="#f59e0b" stroke-width="2.5"/>
  <polygon points="218,131 228,136 218,141" fill="#f59e0b"/>
  <text x="200" y="124" fill="#fde68a" font-size="10.5" font-weight="700" text-anchor="middle">顶部 Δ→Y</text>

  <!-- 右图：退化后的串并联 -->
  <text x="320" y="46" fill="#10b981" font-size="11.5" font-weight="700" text-anchor="middle">普通串并联（R_ab = 14 Ω）</text>
  <line x1="320" y1="54" x2="320" y2="108" stroke="#f59e0b" stroke-width="2.2"/>
  <rect x="300" y="68" width="40" height="20" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="320" y="82" fill="#fde68a" font-size="10.5" font-weight="700" text-anchor="middle">R1=6Ω</text>
  <circle cx="320" cy="108" r="4" fill="#f59e0b"/>
  <text x="320" y="102" fill="#fde68a" font-size="10" text-anchor="middle">n</text>

  <!-- 左侧串联支路框 -->
  <rect x="242" y="118" width="66" height="86" rx="6" fill="rgba(251,146,60,0.12)" stroke="#fb923c" stroke-width="1.4" stroke-dasharray="4,3"/>
  <line x1="320" y1="108" x2="275" y2="108" stroke="#fb923c" stroke-width="2"/>
  <line x1="275" y1="108" x2="275" y2="214" stroke="#fb923c" stroke-width="2"/>
  <rect x="253" y="128" width="44" height="18" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="275" y="141" fill="#fde68a" font-size="10" text-anchor="middle">R2=2Ω</text>
  <rect x="253" y="164" width="44" height="18" rx="4" fill="#1e293b" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="275" y="177" fill="#e2e8f0" font-size="10" text-anchor="middle">10Ω</text>
  <text x="275" y="198" fill="#fed7aa" font-size="10" font-weight="700" text-anchor="middle">串=12Ω</text>

  <!-- 右侧串联支路框 -->
  <rect x="332" y="118" width="66" height="86" rx="6" fill="rgba(167,139,250,0.12)" stroke="#a78bfa" stroke-width="1.4" stroke-dasharray="4,3"/>
  <line x1="320" y1="108" x2="365" y2="108" stroke="#a78bfa" stroke-width="2"/>
  <line x1="365" y1="108" x2="365" y2="214" stroke="#a78bfa" stroke-width="2"/>
  <rect x="343" y="128" width="44" height="18" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="365" y="141" fill="#fde68a" font-size="10" text-anchor="middle">R3=3Ω</text>
  <rect x="343" y="164" width="44" height="18" rx="4" fill="#1e293b" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="365" y="177" fill="#e2e8f0" font-size="10" text-anchor="middle">21Ω</text>
  <text x="365" y="198" fill="#ddd6fe" font-size="10" font-weight="700" text-anchor="middle">串=24Ω</text>

  <!-- 汇合到底部 b -->
  <line x1="275" y1="214" x2="365" y2="214" stroke="#10b981" stroke-width="2"/>
  <line x1="320" y1="214" x2="320" y2="230" stroke="#10b981" stroke-width="2"/>
  <circle cx="320" cy="54" r="3.5" fill="#10b981"/>
  <circle cx="320" cy="230" r="3.5" fill="#10b981"/>
  <text x="330" y="58" fill="#10b981" font-size="11" font-weight="700">a</text>
  <text x="330" y="234" fill="#10b981" font-size="11" font-weight="700">b</text>

  <!-- 底部汇总条 -->
  <rect x="20" y="244" width="380" height="18" rx="4" fill="#1e293b"/>
  <text x="210" y="257" fill="#10b981" font-size="10.5" font-weight="600" text-anchor="middle">R_ab = 6 + (12 // 24) = 6 + 8 = 14 Ω</text>
</svg>`;

export const SVG_ACT6 = `<svg viewBox="0 0 420 230" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <rect width="420" height="230" rx="12" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Act 6 · 原理图“变装识别”：T 型 ≡ Y 型，Π 型 ≡ Δ 型</text>

  <!-- 左侧：T 型网络 -->
  <rect x="16" y="40" width="186" height="172" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="109" y="60" fill="#f59e0b" font-size="12" font-weight="700" text-anchor="middle">T 型网络 ≡ Y 型网络</text>
  <line x1="36" y1="96" x2="182" y2="96" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="109" y1="96" x2="109" y2="176" stroke="#f59e0b" stroke-width="2.2"/>
  <rect x="52" y="87" width="38" height="18" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="71" y="100" fill="#fde68a" font-size="10.5" font-weight="700" text-anchor="middle">R_1</text>
  <rect x="128" y="87" width="38" height="18" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="147" y="100" fill="#fde68a" font-size="10.5" font-weight="700" text-anchor="middle">R_2</text>
  <rect x="99" y="120" width="20" height="36" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="109" y="142" fill="#fde68a" font-size="10.5" font-weight="700" text-anchor="middle">R3</text>
  <circle cx="36" cy="96" r="4" fill="#10b981"/>
  <circle cx="182" cy="96" r="4" fill="#10b981"/>
  <circle cx="109" cy="176" r="4" fill="#10b981"/>
  <circle cx="109" cy="96" r="4" fill="#f59e0b"/>
  <text x="36" y="84" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">a</text>
  <text x="182" y="84" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">b</text>
  <text x="109" y="194" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">c (底端)</text>

  <!-- 右侧：Π 型网络 -->
  <rect x="218" y="40" width="186" height="172" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="311" y="60" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Π 型网络 ≡ Δ 型网络</text>
  <line x1="256" y1="92" x2="366" y2="92" stroke="#38bdf8" stroke-width="2.2"/>
  <line x1="256" y1="92" x2="256" y2="176" stroke="#38bdf8" stroke-width="2.2"/>
  <line x1="366" y1="92" x2="366" y2="176" stroke="#38bdf8" stroke-width="2.2"/>
  <line x1="242" y1="176" x2="380" y2="176" stroke="#10b981" stroke-width="2.6"/>
  <rect x="291" y="83" width="40" height="18" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="311" y="96" fill="#e0f2fe" font-size="10.5" font-weight="700" text-anchor="middle">R_c</text>
  <rect x="246" y="118" width="20" height="36" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="256" y="140" fill="#e0f2fe" font-size="10" font-weight="700" text-anchor="middle">Rb</text>
  <rect x="356" y="118" width="20" height="36" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="366" y="140" fill="#e0f2fe" font-size="10" font-weight="700" text-anchor="middle">Ra</text>
  <circle cx="256" cy="92" r="4" fill="#10b981"/>
  <circle cx="366" cy="92" r="4" fill="#10b981"/>
  <circle cx="311" cy="176" r="4" fill="#10b981"/>
  <text x="244" y="88" fill="#10b981" font-size="11" font-weight="700">a</text>
  <text x="378" y="88" fill="#10b981" font-size="11" font-weight="700">b</text>
  <text x="311" y="196" fill="#10b981" font-size="10.5" font-weight="700" text-anchor="middle">整条底线皆为同一节点 c</text>
</svg>`;

export const SVG_ACT7 = `<svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <rect width="420" height="220" rx="12" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Act 7 · World 1 通关路线图 → World 2 节点分析法启程</text>

  <!-- World 1 完成节点链 -->
  <rect x="18" y="48" width="256" height="148" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="30" y="68" fill="#10b981" font-size="11.5" font-weight="700">WORLD 1 · 等效化简工具箱（已通关）</text>

  <!-- 三个里程碑 -->
  <rect x="30" y="82" width="108" height="32" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="84" y="102" fill="#cbd5e1" font-size="10.5" text-anchor="middle">Ohm + KCL / KVL</text>

  <rect x="154" y="82" width="108" height="32" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="208" y="102" fill="#cbd5e1" font-size="10.5" text-anchor="middle">串并联 &amp; 分压分流</text>

  <line x1="138" y1="98" x2="152" y2="98" stroke="#10b981" stroke-width="1.8"/>
  <line x1="208" y1="114" x2="208" y2="132" stroke="#10b981" stroke-width="1.8"/>

  <rect x="30" y="134" width="232" height="44" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.8"/>
  <text x="146" y="153" fill="#ecfdf5" font-size="11.5" font-weight="700" text-anchor="middle">W1-L8：Y–Δ 变换与电桥化简 ✓</text>
  <text x="146" y="170" fill="#a7f3d0" font-size="10" text-anchor="middle">破解非串并联死结的终极几何武器</text>

  <!-- 跃迁箭头 -->
  <line x1="276" y1="122" x2="300" y2="122" stroke="#f59e0b" stroke-width="2.8"/>
  <polygon points="300,116 310,122 300,128" fill="#f59e0b"/>

  <!-- World 2 预告卡片 -->
  <rect x="312" y="48" width="92" height="148" rx="10" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.8"/>
  <text x="358" y="72" fill="#a5b4fc" font-size="11" font-weight="700" text-anchor="middle">NEXT</text>
  <text x="358" y="96" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">W2-L1</text>
  <text x="358" y="116" fill="#c7d2fe" font-size="11" font-weight="600" text-anchor="middle">节点分析法</text>
  <line x1="326" y1="130" x2="390" y2="130" stroke="#4f46e5" stroke-width="1"/>
  <text x="358" y="150" fill="#94a3b8" font-size="9.5" text-anchor="middle">不拆电桥</text>
  <text x="358" y="166" fill="#94a3b8" font-size="9.5" text-anchor="middle">多电源通解</text>
  <text x="358" y="182" fill="#f59e0b" font-size="9.5" font-weight="700" text-anchor="middle">SPICE 核心</text>
</svg>`;

export const SVG_STEP1 = `<svg viewBox='0 0 220 130' xmlns='http://www.w3.org/2000/svg'><rect width='220' height='130' rx='8' fill='#0f172a'/><polygon points='110,16 48,66 172,66' fill='rgba(244,63,94,0.12)' stroke='#f43f5e' stroke-width='2' stroke-dasharray='4,3'/><line x1='48' y1='66' x2='110' y2='114' stroke='#64748b' stroke-width='1.8'/><line x1='172' y1='66' x2='110' y2='114' stroke='#64748b' stroke-width='1.8'/><text x='62' y='38' fill='#38bdf8' font-size='10'>12Ω</text><text x='144' y='38' fill='#38bdf8' font-size='10'>18Ω</text><text x='110' y='62' fill='#fda4af' font-size='10' text-anchor='middle'>6Ω</text><text x='60' y='98' fill='#94a3b8' font-size='10'>10Ω</text><text x='146' y='98' fill='#94a3b8' font-size='10'>21Ω</text><circle cx='110' cy='16' r='3.5' fill='#10b981'/><circle cx='48' cy='66' r='3.5' fill='#f59e0b'/><circle cx='172' cy='66' r='3.5' fill='#f59e0b'/><circle cx='110' cy='114' r='3.5' fill='#10b981'/></svg>`;

export const SVG_STEP2 = `<svg viewBox='0 0 220 130' xmlns='http://www.w3.org/2000/svg'><rect width='220' height='130' rx='8' fill='#0f172a'/><polygon points='110,16 48,88 172,88' fill='none' stroke='#38bdf8' stroke-width='1.5' stroke-dasharray='4,3'/><line x1='110' y1='16' x2='110' y2='62' stroke='#f59e0b' stroke-width='2.2'/><line x1='48' y1='88' x2='110' y2='62' stroke='#f59e0b' stroke-width='2.2'/><line x1='172' y1='88' x2='110' y2='62' stroke='#f59e0b' stroke-width='2.2'/><text x='120' y='44' fill='#fde68a' font-size='10.5' font-weight='700'>R_1=?</text><text x='64' y='72' fill='#fde68a' font-size='10.5' font-weight='700'>R_2=?</text><text x='136' y='72' fill='#fde68a' font-size='10.5' font-weight='700'>R_3=?</text><text x='56' y='46' fill='#38bdf8' font-size='9.5'>12Ω</text><text x='152' y='46' fill='#38bdf8' font-size='9.5'>18Ω</text><text x='110' y='104' fill='#38bdf8' font-size='9.5' text-anchor='middle'>6Ω</text><circle cx='110' cy='62' r='3.5' fill='#f59e0b'/></svg>`;

export const SVG_STEP3 = `<svg viewBox='0 0 220 130' xmlns='http://www.w3.org/2000/svg'><rect width='220' height='130' rx='8' fill='#0f172a'/><line x1='110' y1='10' x2='110' y2='42' stroke='#f59e0b' stroke-width='2'/><rect x='94' y='16' width='32' height='16' rx='3' fill='#451a03' stroke='#f59e0b'/><text x='110' y='28' fill='#fde68a' font-size='9.5' text-anchor='middle'>6Ω</text><line x1='110' y1='42' x2='58' y2='42' stroke='#fb923c' stroke-width='1.8'/><line x1='58' y1='42' x2='58' y2='106' stroke='#fb923c' stroke-width='1.8'/><rect x='36' y='58' width='44' height='28' rx='4' fill='#431407' stroke='#fb923c'/><text x='58' y='75' fill='#fed7aa' font-size='9.5' text-anchor='middle'>2+10Ω</text><line x1='110' y1='42' x2='162' y2='42' stroke='#a78bfa' stroke-width='1.8'/><line x1='162' y1='42' x2='162' y2='106' stroke='#a78bfa' stroke-width='1.8'/><rect x='140' y='58' width='44' height='28' rx='4' fill='#2e1065' stroke='#a78bfa'/><text x='162' y='75' fill='#ddd6fe' font-size='9.5' text-anchor='middle'>3+21Ω</text><line x1='58' y1='106' x2='162' y2='106' stroke='#10b981' stroke-width='1.8'/><line x1='110' y1='106' x2='110' y2='122' stroke='#10b981' stroke-width='2'/></svg>`;
