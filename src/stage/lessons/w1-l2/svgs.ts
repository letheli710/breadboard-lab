// W1-L2 diagrams, reproduced from the lesson sheet (docs/lessons/W1-L2.md): one per act, and the
// three step diagrams of the guided example.

export const SVG_ACT1 = ` <svg viewBox="0 0 420 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="功率与能量转换示意图">
  <rect x="4" y="4" width="412" height="202" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <!-- 标题 -->
  <text x="210" y="26" text-anchor="middle" font-family="'Noto Sans SC', 'PingFang SC', sans-serif" font-size="13" font-weight="700" fill="#0F172A">瞬时功率 p = vi 与能量流直觉</text>

  <!-- 左侧导线与电流箭头 -->
  <line x1="40" y1="75" x2="150" y2="75" stroke="#1E293B" stroke-width="2.5"/>
  <line x1="40" y1="155" x2="150" y2="155" stroke="#1E293B" stroke-width="2.5"/>
  <!-- 电流箭头 -->
  <line x1="65" y1="62" x2="115" y2="62" stroke="#2563EB" stroke-width="2.2"/>
  <polygon points="115,57 125,62 115,67" fill="#2563EB"/>
  <text x="90" y="53" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="12" font-weight="600" fill="#2563EB">i = dq/dt (流量)</text>

  <!-- 元件黑盒 -->
  <rect x="150" y="60" width="90" height="110" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="2.2"/>
  <text x="195" y="108" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="13" font-weight="700" fill="#92400E">二端元件</text>
  <text x="195" y="128" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" fill="#B45309">p = 30 W</text>

  <!-- 极性标注 -->
  <text x="136" y="96" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#DC2626">+</text>
  <text x="136" y="148" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="#2563EB">−</text>
  <text x="108" y="120" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="12" font-weight="600" fill="#DC2626">v = dw/dq</text>
  <text x="108" y="136" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" fill="#64748B">(电位落差)</text>

  <!-- 右侧能量转换箭头与说明 -->
  <line x1="252" y1="115" x2="296" y2="115" stroke="#059669" stroke-width="2.5" stroke-dasharray="5,3"/>
  <polygon points="296,109 308,115 296,121" fill="#059669"/>
  <rect x="312" y="68" width="94" height="94" rx="8" fill="#ECFDF5" stroke="#059669" stroke-width="1.5"/>
  <text x="359" y="92" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="12" font-weight="700" fill="#065F46">能量输出/热</text>
  <text x="359" y="114" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" fill="#047857">w = ∫ p dt</text>
  <text x="359" y="134" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" fill="#047857">40 s → 1200 J</text>
  <text x="359" y="152" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" fill="#64748B">1 W = 1 J/s</text>

  <!-- 底部注解 -->
  <text x="210" y="192" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" fill="#475569">电压决定每库仑电荷释放多少焦耳，电流决定每秒流过多少库仑，乘积即功率</text>
</svg>`;

export const SVG_ACT2 = ` <svg viewBox="0 0 420 205" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="无源符号约定左右对比图">
  <rect x="4" y="4" width="412" height="197" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="210" y="25" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="13" font-weight="700" fill="#0F172A">无源符号约定（PSC）：两种参考基准对比</text>

  <!-- 中央分隔虚线 -->
  <line x1="210" y1="38" x2="210" y2="188" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- 左侧：满足 PSC（正极流入） -->
  <text x="105" y="47" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="12" font-weight="700" fill="#059669">① 电流从正极(+)流入</text>
  <!-- 导线 -->
  <line x1="105" y1="56" x2="105" y2="82" stroke="#1E293B" stroke-width="2.2"/>
  <line x1="105" y1="142" x2="105" y2="164" stroke="#1E293B" stroke-width="2.2"/>
  <!-- 电流向下箭头 -->
  <polygon points="100,67 110,67 105,77" fill="#2563EB"/>
  <text x="122" y="72" font-family="'Noto Sans SC', sans-serif" font-size="12" font-weight="700" fill="#2563EB">i</text>
  <!-- 元件盒 -->
  <rect x="75" y="82" width="60" height="60" rx="6" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
  <text x="105" y="108" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#065F46">p = +vi</text>
  <text x="105" y="126" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" fill="#047857">(吸收基准)</text>
  <!-- 极性 -->
  <text x="64" y="94" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#DC2626">+</text>
  <text x="64" y="116" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#DC2626">v</text>
  <text x="64" y="138" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#2563EB">−</text>
  <!-- 结论 -->
  <text x="105" y="182" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" fill="#334155">算得 p &gt; 0：吸收功率</text>
  <text x="105" y="196" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" fill="#64748B">算得 p &lt; 0：发出功率</text>

  <!-- 右侧：不满足 PSC（正极流出） -->
  <text x="315" y="47" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="12" font-weight="700" fill="#DC2626">② 电流从正极(+)流出</text>
  <!-- 导线 -->
  <line x1="315" y1="56" x2="315" y2="82" stroke="#1E293B" stroke-width="2.2"/>
  <line x1="315" y1="142" x2="315" y2="164" stroke="#1E293B" stroke-width="2.2"/>
  <!-- 电流向上箭头 -->
  <polygon points="310,72 320,72 315,62" fill="#2563EB"/>
  <text x="332" y="72" font-family="'Noto Sans SC', sans-serif" font-size="12" font-weight="700" fill="#2563EB">i</text>
  <!-- 元件盒 -->
  <rect x="285" y="82" width="60" height="60" rx="6" fill="#FEF2F2" stroke="#DC2626" stroke-width="2"/>
  <text x="315" y="108" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#991B1B">p = −vi</text>
  <text x="315" y="126" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" fill="#B91C1C">(吸收功率)</text>
  <!-- 极性 -->
  <text x="274" y="94" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#DC2626">+</text>
  <text x="274" y="116" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#DC2626">v</text>
  <text x="274" y="138" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#2563EB">−</text>
  <!-- 结论 -->
  <text x="315" y="182" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" fill="#334155">等价于发出功率 +vi</text>
  <text x="315" y="196" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" fill="#64748B">算得 p &lt; 0：确实在供电</text>
</svg>`;

export const SVG_ACT3 = ` <svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="四元件闭合回路功率守恒示意图">
  <rect x="4" y="4" width="412" height="212" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="210" y="25" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="13" font-weight="700" fill="#0F172A">能量守恒校验：∑p = p₁ + p₂ + p₃ + p₄ = 0</text>

  <!-- 外环主导线 -->
  <polyline points="70,82 70,55 155,55" fill="none" stroke="#1E293B" stroke-width="2.2"/>
  <polyline points="245,55 345,55 345,82" fill="none" stroke="#1E293B" stroke-width="2.2"/>
  <polyline points="345,142 345,175 245,175" fill="none" stroke="#1E293B" stroke-width="2.2"/>
  <polyline points="155,175 70,175 70,142" fill="none" stroke="#1E293B" stroke-width="2.2"/>

  <!-- 顺时针电流箭头 -->
  <polygon points="118,50 128,55 118,60" fill="#2563EB"/>
  <text x="115" y="46" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" font-weight="700" fill="#2563EB">i = 2 A</text>

  <!-- 元件 1（左：24V 供电） -->
  <circle cx="70" cy="112" r="28" fill="#FEF2F2" stroke="#DC2626" stroke-width="2"/>
  <text x="70" y="100" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#DC2626">+</text>
  <text x="70" y="116" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#991B1B">24 V</text>
  <text x="70" y="131" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#2563EB">−</text>
  <text x="8" y="160" text-anchor="start" font-family="'Noto Sans SC', sans-serif" font-size="10" font-weight="700" fill="#DC2626">p₁ = −48 W</text>

  <!-- 元件 2（上：10V 吸收） -->
  <rect x="155" y="40" width="90" height="30" rx="5" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
  <text x="200" y="59" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#065F46">+  10 V  −</text>
  <text x="200" y="85" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" font-weight="700" fill="#059669">p₂ = +20 W</text>

  <!-- 元件 3（右：6V 吸收） -->
  <rect x="315" y="82" width="60" height="60" rx="5" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
  <text x="345" y="97" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">+</text>
  <text x="345" y="115" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#065F46">6 V</text>
  <text x="345" y="133" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2563EB">−</text>
  <text x="351" y="157" text-anchor="start" font-family="'Noto Sans SC', sans-serif" font-size="10" font-weight="700" fill="#059669">p₃ = +12 W</text>

  <!-- 元件 4（下：8V 吸收） -->
  <rect x="155" y="160" width="90" height="30" rx="5" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
  <text x="200" y="179" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#065F46">−  8 V  +</text>
  <text x="200" y="152" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" font-weight="700" fill="#059669">p₄ = +16 W</text>

  <!-- 中央汇总徽章 -->
  <rect x="135" y="102" width="142" height="34" rx="6" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.2"/>
  <text x="206" y="117" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10.5" font-weight="700" fill="#1D4ED8">发出 48 W = 吸收 48 W</text>
  <text x="206" y="131" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#1E40AF">−48 + 20 + 12 + 16 = 0</text>
</svg>`;

export const SVG_ACT4 = ` <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="独立电压源与独立电流源符号及充放电对比">
  <rect x="4" y="4" width="412" height="192" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="210" y="25" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="13" font-weight="700" fill="#0F172A">理想独立源（圆形符号）：电压源 vs 电流源</text>

  <!-- 左区：独立电压源（放电/充电） -->
  <rect x="18" y="38" width="184" height="146" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/>
  <text x="110" y="56" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11.5" font-weight="700" fill="#1E293B">独立电压源 (端电压恒为 v_s)</text>
  <!-- 导线 -->
  <line x1="110" y1="66" x2="110" y2="85" stroke="#1E293B" stroke-width="2"/>
  <line x1="110" y1="133" x2="110" y2="152" stroke="#1E293B" stroke-width="2"/>
  <!-- 圆形电压源 -->
  <circle cx="110" cy="109" r="24" fill="#FEF2F2" stroke="#DC2626" stroke-width="2.2"/>
  <text x="110" y="102" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#DC2626">+</text>
  <text x="110" y="126" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#2563EB">−</text>
  <text x="148" y="113" font-family="sans-serif" font-size="12" font-weight="700" fill="#991B1B">v_s</text>
  <!-- 放/充电电流提示 -->
  <text x="48" y="84" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" fill="#DC2626">↑ 流出: 放电</text>
  <text x="48" y="100" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" fill="#059669">↓ 流入: 充电</text>
  <text x="110" y="172" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10.5" fill="#64748B">电流 i 由外电路决定</text>

  <!-- 右区：独立电流源 -->
  <rect x="218" y="38" width="184" height="146" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/>
  <text x="310" y="56" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11.5" font-weight="700" fill="#1E293B">独立电流源 (电流恒为 i_s)</text>
  <!-- 导线 -->
  <line x1="310" y1="66" x2="310" y2="85" stroke="#1E293B" stroke-width="2"/>
  <line x1="310" y1="133" x2="310" y2="152" stroke="#1E293B" stroke-width="2"/>
  <!-- 圆形电流源 -->
  <circle cx="310" cy="109" r="24" fill="#EFF6FF" stroke="#2563EB" stroke-width="2.2"/>
  <line x1="310" y1="123" x2="310" y2="97" stroke="#2563EB" stroke-width="2.2"/>
  <polygon points="305,101 315,101 310,92" fill="#2563EB"/>
  <text x="348" y="113" font-family="sans-serif" font-size="12" font-weight="700" fill="#1D4ED8">i_s</text>
  <!-- 端电压提示 -->
  <text x="274" y="92" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#DC2626">+</text>
  <text x="274" y="112" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748B">v?</text>
  <text x="274" y="132" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#2563EB">−</text>
  <text x="310" y="172" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10.5" fill="#64748B">端电压 v 由外电路决定</text>
</svg>`;

export const SVG_ACT5 = ` <svg viewBox="0 0 420 245" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="四类受控源标准菱形符号全景图">
  <rect x="4" y="4" width="412" height="237" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="210" y="24" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="13" font-weight="700" fill="#0F172A">四类受控源（菱形符号）与量纲全景</text>

  <!-- 1. VCVS (左上，重点高亮) -->
  <rect x="16" y="36" width="188" height="94" rx="8" fill="#FAF5FF" stroke="#9333EA" stroke-width="1.8"/>
  <text x="110" y="52" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" font-weight="700" fill="#6B21A8">VCVS（运放原型 ★）</text>
  <line x1="65" y1="60" x2="65" y2="70" stroke="#1E293B" stroke-width="1.8"/>
  <line x1="65" y1="112" x2="65" y2="122" stroke="#1E293B" stroke-width="1.8"/>
  <polygon points="65,70 86,91 65,112 44,91" fill="#F3E8FF" stroke="#7E22CE" stroke-width="2"/>
  <text x="65" y="87" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">+</text>
  <text x="65" y="106" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2563EB">−</text>
  <text x="142" y="83" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#581C87">v_s = μ v_x</text>
  <text x="142" y="100" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" fill="#6B21A8">μ 无量纲 (V/V)</text>
  <text x="142" y="116" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="9.5" fill="#7E22CE">→ World 3 运放</text>

  <!-- 2. CCVS (右上) -->
  <rect x="216" y="36" width="188" height="94" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.3"/>
  <text x="310" y="52" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" font-weight="700" fill="#1E293B">CCVS（电流控电压）</text>
  <line x1="265" y1="60" x2="265" y2="70" stroke="#1E293B" stroke-width="1.8"/>
  <line x1="265" y1="112" x2="265" y2="122" stroke="#1E293B" stroke-width="1.8"/>
  <polygon points="265,70 286,91 265,112 244,91" fill="#FEF2F2" stroke="#DC2626" stroke-width="2"/>
  <text x="265" y="87" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">+</text>
  <text x="265" y="106" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2563EB">−</text>
  <text x="342" y="86" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#991B1B">v_s = r i_x</text>
  <text x="342" y="105" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" fill="#64748B">r 跨阻 (Ω = V/A)</text>

  <!-- 3. VCCS (左下) -->
  <rect x="16" y="140" width="188" height="92" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.3"/>
  <text x="110" y="156" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" font-weight="700" fill="#1E293B">VCCS（电压控电流）</text>
  <line x1="65" y1="164" x2="65" y2="174" stroke="#1E293B" stroke-width="1.8"/>
  <line x1="65" y1="216" x2="65" y2="226" stroke="#1E293B" stroke-width="1.8"/>
  <polygon points="65,174 86,195 65,216 44,195" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
  <line x1="65" y1="207" x2="65" y2="186" stroke="#2563EB" stroke-width="2"/>
  <polygon points="61,189 69,189 65,181" fill="#2563EB"/>
  <text x="142" y="189" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1D4ED8">i_s = g v_x</text>
  <text x="142" y="208" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" fill="#64748B">g 跨导 (S = A/V)</text>

  <!-- 4. CCCS (右下) -->
  <rect x="216" y="140" width="188" height="92" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.3"/>
  <text x="310" y="156" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" font-weight="700" fill="#1E293B">CCCS（电流控电流）</text>
  <line x1="265" y1="164" x2="265" y2="174" stroke="#1E293B" stroke-width="1.8"/>
  <line x1="265" y1="216" x2="265" y2="226" stroke="#1E293B" stroke-width="1.8"/>
  <polygon points="265,174 286,195 265,216 244,195" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
  <line x1="265" y1="207" x2="265" y2="186" stroke="#059669" stroke-width="2"/>
  <polygon points="261,189 269,189 265,181" fill="#059669"/>
  <text x="342" y="189" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#065F46">i_s = β i_x</text>
  <text x="342" y="208" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" fill="#64748B">β 无量纲 (A/A)</text>
</svg>`;

export const SVG_ACT6 = ` <svg viewBox="0 0 420 225" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="含受控源四元件功率守恒实战例题电路图">
  <rect x="4" y="4" width="412" height="217" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="210" y="24" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="13" font-weight="700" fill="#0F172A">实战电路：含 CCCS 受控源的功率守恒校验</text>

  <!-- 主电路框架 -->
  <!-- 左竖线到顶横线 -->
  <polyline points="62,92 62,58 122,58" fill="none" stroke="#1E293B" stroke-width="2.2"/>
  <polyline points="198,58 352,58 352,92" fill="none" stroke="#1E293B" stroke-width="2.2"/>
  <!-- 中间支路 -->
  <line x1="252" y1="58" x2="252" y2="92" stroke="#1E293B" stroke-width="2.2"/>
  <line x1="252" y1="152" x2="252" y2="188" stroke="#1E293B" stroke-width="2.2"/>
  <!-- 底部公共回线 -->
  <polyline points="62,152 62,188 352,188 352,152" fill="none" stroke="#1E293B" stroke-width="2.2"/>
  <!-- 节点圆点 -->
  <circle cx="252" cy="58" r="3.5" fill="#1E293B"/>
  <circle cx="252" cy="188" r="3.5" fill="#1E293B"/>

  <!-- 电流 I = 5A 标注 -->
  <polygon points="88,53 98,58 88,63" fill="#2563EB"/>
  <text x="93" y="48" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#2563EB">I = 5 A</text>

  <!-- p1：20V 独立电压源 -->
  <circle cx="62" cy="122" r="28" fill="#FEF2F2" stroke="#DC2626" stroke-width="2.2"/>
  <text x="62" y="109" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#DC2626">+</text>
  <text x="62" y="126" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#991B1B">20 V</text>
  <text x="62" y="142" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#2563EB">−</text>
  <text x="22" y="126" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748B">p₁</text>

  <!-- p2：12V 元件 -->
  <rect x="122" y="43" width="76" height="30" rx="5" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
  <text x="160" y="62" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#065F46">+ 12 V −</text>
  <text x="160" y="88" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748B">p₂</text>

  <!-- p3：8V 中间元件 -->
  <rect x="228" y="92" width="48" height="60" rx="5" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
  <text x="252" y="107" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">+</text>
  <text x="252" y="125" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#065F46">8 V</text>
  <text x="252" y="143" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2563EB">−</text>
  <!-- 6A 向下箭头 -->
  <polygon points="247,74 257,74 252,84" fill="#2563EB"/>
  <text x="222" y="81" text-anchor="end" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563EB">6 A</text>
  <text x="216" y="126" text-anchor="end" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748B">p₃</text>

  <!-- p4：0.2I CCCS 受控源 -->
  <polygon points="352,92 380,122 352,152 324,122" fill="#FAF5FF" stroke="#7E22CE" stroke-width="2.2"/>
  <line x1="352" y1="138" x2="352" y2="110" stroke="#7E22CE" stroke-width="2.2"/>
  <polygon points="347,114 357,114 352,104" fill="#7E22CE"/>
  <text x="386" y="117" text-anchor="start" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#6B21A8">0.2I</text>
  <text x="386" y="133" text-anchor="start" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748B">p₄</text>
  <!-- 并联 8V 提示 -->
  <text x="315" y="102" text-anchor="end" font-family="sans-serif" font-size="11" font-weight="700" fill="#DC2626">+</text>
  <text x="315" y="125" text-anchor="end" font-family="sans-serif" font-size="10.5" fill="#475569">8 V</text>
  <text x="315" y="148" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="700" fill="#2563EB">−</text>

  <!-- 底部说明 -->
  <text x="210" y="210" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10.5" fill="#475569">提示：中间支路与右侧受控源并联，共享同一对上下节点（端电压均为 8 V，上正下负）</text>
</svg>`;

export const SVG_ACT7 = ` <svg viewBox="0 0 420 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="随堂自测配图与下节W1-L3欧姆定律桥梁图">
  <rect x="4" y="4" width="412" height="182" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="210" y="24" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="13" font-weight="700" fill="#0F172A">自测 Q1 配图与 W1-L3 知识桥梁</text>

  <!-- 左侧：自测 Q1 配图 -->
  <rect x="16" y="36" width="182" height="138" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/>
  <text x="107" y="54" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11.5" font-weight="700" fill="#1E293B">自测 Q1：符号陷阱考验</text>
  <line x1="107" y1="62" x2="107" y2="85" stroke="#1E293B" stroke-width="2"/>
  <line x1="107" y1="135" x2="107" y2="155" stroke="#1E293B" stroke-width="2"/>
  <polygon points="102,71 112,71 107,80" fill="#2563EB"/>
  <text x="122" y="76" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563EB">i = 4 A</text>
  <rect x="77" y="85" width="60" height="50" rx="6" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="107" y="114" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11" font-weight="700" fill="#92400E">未知元件</text>
  <text x="64" y="96" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#DC2626">+</text>
  <text x="50" y="114" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#DC2626">v=−10V</text>
  <text x="64" y="132" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#2563EB">−</text>
  <text x="107" y="168" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" fill="#64748B">吸收还是发出多少 W？</text>

  <!-- 右侧：W1-L3 下节预告桥梁 -->
  <rect x="212" y="36" width="192" height="138" rx="8" fill="#EFF6FF" stroke="#93C5FD" stroke-width="1.3"/>
  <text x="308" y="54" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="11.5" font-weight="700" fill="#1E3A8A">下节预告：W1-L3 欧姆定律</text>
  <!-- 电阻折线符号 -->
  <line x1="234" y1="95" x2="262" y2="95" stroke="#1E293B" stroke-width="2"/>
  <polyline points="262,95 270,84 282,106 294,84 306,106 318,84 326,95" fill="none" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="326" y1="95" x2="382" y2="95" stroke="#1E293B" stroke-width="2"/>
  <polygon points="244,90 254,95 244,100" fill="#2563EB"/>
  <text x="294" y="75" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#0F172A">R (电阻)</text>
  <text x="308" y="128" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#1D4ED8">v = iR  +  p = vi</text>
  <text x="308" y="148" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">⇒ p = i²R = v²/R ≥ 0</text>
  <text x="308" y="166" text-anchor="middle" font-family="'Noto Sans SC', sans-serif" font-size="10" fill="#475569">为何电阻永远只能发热耗能？</text>
</svg>`;

export const SVG_STEP1 = `<svg viewBox="0 0 260 110" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="256" height="106" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><polyline points="50,35 50,24 125,24" fill="none" stroke="#1E293B" stroke-width="2"/><line x1="195" y1="24" x2="230" y2="24" stroke="#1E293B" stroke-width="2"/><line x1="50" y1="85" x2="50" y2="96" stroke="#1E293B" stroke-width="2"/><polygon points="82,19 92,24 82,29" fill="#2563EB"/><text x="87" y="15" text-anchor="middle" font-size="10" font-weight="700" fill="#2563EB">I=5A</text><circle cx="50" cy="60" r="24" fill="#FEF2F2" stroke="#DC2626" stroke-width="2"/><text x="50" y="50" text-anchor="middle" font-size="11" font-weight="700" fill="#DC2626">+</text><text x="50" y="64" text-anchor="middle" font-size="10" font-weight="700" fill="#991B1B">20V</text><text x="50" y="78" text-anchor="middle" font-size="12" font-weight="700" fill="#2563EB">−</text><rect x="125" y="11" width="70" height="26" rx="4" fill="#ECFDF5" stroke="#059669" stroke-width="2"/><text x="160" y="28" text-anchor="middle" font-size="10" font-weight="700" fill="#065F46">+ 12V −</text><text x="160" y="54" text-anchor="middle" font-size="10" fill="#475569">p₁ = ?   p₂ = ?</text></svg>`;

export const SVG_STEP2 = `<svg viewBox="0 0 260 110" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="256" height="106" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><line x1="75" y1="16" x2="190" y2="16" stroke="#1E293B" stroke-width="2"/><line x1="75" y1="96" x2="190" y2="96" stroke="#1E293B" stroke-width="2"/><line x1="75" y1="16" x2="75" y2="32" stroke="#1E293B" stroke-width="2"/><line x1="75" y1="80" x2="75" y2="96" stroke="#1E293B" stroke-width="2"/><polygon points="71,22 79,22 75,29" fill="#2563EB"/><text x="62" y="27" text-anchor="end" font-size="9.5" font-weight="700" fill="#2563EB">6A</text><rect x="55" y="32" width="40" height="48" rx="4" fill="#ECFDF5" stroke="#059669" stroke-width="2"/><text x="75" y="45" text-anchor="middle" font-size="10" font-weight="700" fill="#DC2626">+</text><text x="75" y="59" text-anchor="middle" font-size="10" font-weight="700" fill="#065F46">8V</text><text x="75" y="73" text-anchor="middle" font-size="11" font-weight="700" fill="#2563EB">−</text><line x1="190" y1="16" x2="190" y2="32" stroke="#1E293B" stroke-width="2"/><line x1="190" y1="80" x2="190" y2="96" stroke="#1E293B" stroke-width="2"/><polygon points="190,32 214,56 190,80 166,56" fill="#FAF5FF" stroke="#7E22CE" stroke-width="2"/><line x1="190" y1="69" x2="190" y2="46" stroke="#7E22CE" stroke-width="2"/><polygon points="186,49 194,49 190,41" fill="#7E22CE"/><text x="220" y="60" font-size="10" font-weight="700" fill="#6B21A8">0.2I</text><text x="152" y="44" text-anchor="end" font-size="10" font-weight="700" fill="#DC2626">+</text><text x="152" y="59" text-anchor="end" font-size="9.5" fill="#475569">8V</text><text x="152" y="74" text-anchor="end" font-size="11" font-weight="700" fill="#2563EB">−</text></svg>`;

export const SVG_STEP3 = `<svg viewBox="0 0 260 95" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="256" height="91" rx="8" fill="#EFF6FF" stroke="#3B82F6"/><text x="130" y="24" text-anchor="middle" font-size="11" font-weight="700" fill="#1E3A8A">全电路功率总账本</text><text x="130" y="48" text-anchor="middle" font-size="11" font-weight="700" fill="#DC2626">发出：p₁(−100W) + p₄(−8W)</text><text x="130" y="68" text-anchor="middle" font-size="11" font-weight="700" fill="#059669">吸收：p₂(+60W) + p₃(+48W)</text><text x="130" y="85" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1D4ED8">∑p = ?</text></svg>`;
