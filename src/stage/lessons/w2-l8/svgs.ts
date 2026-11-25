// W2-L8 diagrams. The SHEET_* strings are the lesson sheet's inline SVGs (docs/lessons/W2-L8.md:
// the five act figures 1.2, 2.2, 3.2, 4.2, 5.2 and the guided example's five mini_svg), copied
// as written; they are drawn for a dark canvas and go through the shared `lightSvg`. Before that,
// `fix` changes what does not survive the light theme (listed there) and drops the root's
// `width="100%" height="auto"` (an SVG has no height "auto"; the page's CSS sizes the figure).
// The ADDED_* figures (the guided example's problem, the self-test, the self-test act) are drawn
// here in the same dark sheet style and recoloured the same way.

import { lightSvg } from '../../svgTheme';

const SHEET_ACT1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 300" width="100%" height="auto" style="background:#0f172a;border-radius:12px;font-family:'Segoe UI',system-ui,sans-serif;">
  <defs>
    <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
  </defs>

  <!-- 标题 -->
  <text x="24" y="30" fill="#f8fafc" font-size="16" font-weight="700">第一幕图解：戴维南等效网络驱动可变负载 R_L（端口 a–b 视角）</text>

  <!-- 戴维南等效虚线框 -->
  <rect x="40" y="52" width="330" height="210" rx="10" fill="#1e293b" stroke="#64748b" stroke-width="2" stroke-dasharray="7,5"/>
  <text x="56" y="75" fill="#94a3b8" font-size="13" font-weight="600">左侧固定网络（戴维南等效电路）</text>

  <!-- 上支路导线 -->
  <line x1="120" y1="115" x2="185" y2="115" stroke="#e2e8f0" stroke-width="2.5"/>
  <!-- R_Th 锯齿电阻 -->
  <polyline points="185,115 193,103 205,127 217,103 229,127 241,103 253,127 261,115" fill="none" stroke="#38bdf8" stroke-width="2.8" stroke-linejoin="round"/>
  <text x="223" y="95" fill="#38bdf8" font-size="15" font-weight="700" text-anchor="middle">R_Th</text>
  <!-- R_Th 到端口 a -->
  <line x1="261" y1="115" x2="410" y2="115" stroke="#e2e8f0" stroke-width="2.5"/>

  <!-- 独立电压源 V_Th -->
  <line x1="120" y1="115" x2="120" y2="145" stroke="#e2e8f0" stroke-width="2.5"/>
  <circle cx="120" cy="175" r="30" fill="#0f172a" stroke="#38bdf8" stroke-width="2.8"/>
  <text x="120" y="167" fill="#f8fafc" font-size="18" font-weight="700" text-anchor="middle">+</text>
  <text x="120" y="192" fill="#f8fafc" font-size="18" font-weight="700" text-anchor="middle">−</text>
  <text x="72" y="180" fill="#38bdf8" font-size="15" font-weight="700" text-anchor="end">V_Th</text>
  <line x1="120" y1="205" x2="120" y2="235" stroke="#e2e8f0" stroke-width="2.5"/>

  <!-- 下支路导线 -->
  <line x1="120" y1="235" x2="410" y2="235" stroke="#e2e8f0" stroke-width="2.5"/>

  <!-- 端口 a 和 b -->
  <circle cx="410" cy="115" r="5" fill="#f8fafc" stroke="#38bdf8" stroke-width="2.5"/>
  <text x="410" y="98" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">a</text>
  <circle cx="410" cy="235" r="5" fill="#f8fafc" stroke="#38bdf8" stroke-width="2.5"/>
  <text x="410" y="256" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">b</text>

  <!-- 电流箭头 I_L -->
  <line x1="315" y1="103" x2="365" y2="103" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-cyan)"/>
  <text x="340" y="94" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="middle">I_L</text>

  <!-- 右侧负载支路 -->
  <line x1="415" y1="115" x2="500" y2="115" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="415" y1="235" x2="500" y2="235" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="500" y1="115" x2="500" y2="137" stroke="#e2e8f0" stroke-width="2.5"/>
  <!-- 可变电阻 R_L -->
  <polyline points="500,137 488,145 512,157 488,169 512,181 488,193 512,205 500,213" fill="none" stroke="#f59e0b" stroke-width="2.8" stroke-linejoin="round"/>
  <line x1="500" y1="213" x2="500" y2="235" stroke="#e2e8f0" stroke-width="2.5"/>
  <!-- 斜穿可变箭头 -->
  <line x1="476" y1="204" x2="526" y2="146" stroke="#f59e0b" stroke-width="2.2" marker-end="url(#arrow-amber)"/>
  <text x="532" y="180" fill="#f59e0b" font-size="16" font-weight="700">R_L (可调)</text>

  <!-- 负载电压 V_L 标注 -->
  <text x="458" y="142" fill="#fbbf24" font-size="14" font-weight="700" text-anchor="middle">+</text>
  <text x="458" y="179" fill="#fbbf24" font-size="14" font-weight="700" text-anchor="middle">V_L</text>
  <text x="458" y="218" fill="#fbbf24" font-size="14" font-weight="700" text-anchor="middle">−</text>

  <!-- 极值直觉便签 -->
  <rect x="428" y="262" width="252" height="28" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/>
  <text x="554" y="280" fill="#fde68a" font-size="12" text-anchor="middle">两端归零：R_L→0 (V_L=0) | R_L→∞ (I_L=0)</text>
</svg>`;

const SHEET_ACT2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 350" width="100%" height="auto" style="background:#0f172a;border-radius:12px;font-family:'Segoe UI',system-ui,sans-serif;">
  <!-- 标题 -->
  <text x="24" y="28" fill="#f8fafc" font-size="15" font-weight="700">第二幕核心双图：归一化功率 P_L / P_max（偏态钟形）与效率 η（单调递增）同屏对比</text>

  <!-- 网格线 -->
  <g stroke="#1e293b" stroke-width="1">
    <line x1="80" y1="60" x2="620" y2="60"/>
    <line x1="80" y1="115" x2="620" y2="115"/>
    <line x1="80" y1="170" x2="620" y2="170"/>
    <line x1="80" y1="225" x2="620" y2="225"/>
    <line x1="188" y1="60" x2="188" y2="280"/>
    <line x1="296" y1="60" x2="296" y2="280"/>
    <line x1="404" y1="60" x2="404" y2="280"/>
    <line x1="512" y1="60" x2="512" y2="280"/>
    <line x1="620" y1="60" x2="620" y2="280"/>
  </g>

  <!-- 坐标轴 -->
  <line x1="80" y1="280" x2="635" y2="280" stroke="#94a3b8" stroke-width="2"/>
  <line x1="80" y1="280" x2="80" y2="48" stroke="#38bdf8" stroke-width="2"/>
  <line x1="620" y1="280" x2="620" y2="48" stroke="#10b981" stroke-width="2"/>

  <!-- 左纵轴刻度 (P_L / P_max) -->
  <g fill="#38bdf8" font-size="11" text-anchor="end">
    <text x="72" y="64">100%</text>
    <text x="72" y="119">75%</text>
    <text x="72" y="174">50%</text>
    <text x="72" y="229">25%</text>
    <text x="72" y="284">0%</text>
  </g>
  <text x="24" y="170" fill="#38bdf8" font-size="12" font-weight="700" transform="rotate(-90 24 170)" text-anchor="middle">负载功率 P_L / P_max</text>

  <!-- 右纵轴刻度 (效率 η) -->
  <g fill="#10b981" font-size="11" text-anchor="start">
    <text x="628" y="64">100%</text>
    <text x="628" y="119">75%</text>
    <text x="628" y="174">50%</text>
    <text x="628" y="229">25%</text>
    <text x="628" y="284">0%</text>
  </g>
  <text x="680" y="170" fill="#10b981" font-size="12" font-weight="700" transform="rotate(90 680 170)" text-anchor="middle">传输效率 η (%)</text>

  <!-- 横轴刻度 (R_L / R_Th) -->
  <g fill="#cbd5e1" font-size="11" text-anchor="middle">
    <text x="80" y="298">0</text>
    <text x="134" y="298" fill="#fbbf24">0.5 R_Th</text>
    <text x="188" y="298" fill="#f8fafc" font-weight="700">1.0 R_Th</text>
    <text x="296" y="298" fill="#fbbf24">2.0 R_Th</text>
    <text x="404" y="298">3.0 R_Th</text>
    <text x="512" y="298">4.0 R_Th</text>
    <text x="620" y="298">5.0 R_Th</text>
  </g>
  <text x="350" y="320" fill="#e2e8f0" font-size="12" font-weight="600" text-anchor="middle">负载电阻比 R_L / R_Th</text>

  <!-- 50% 水平参考虚线 -->
  <line x1="80" y1="170" x2="620" y2="170" stroke="#10b981" stroke-width="1.2" stroke-dasharray="5,5" opacity="0.65"/>

  <!-- R_L = R_Th 垂直锁定虚线 -->
  <line x1="188" y1="54" x2="188" y2="280" stroke="#f43f5e" stroke-width="2" stroke-dasharray="6,4"/>

  <!-- 88.9% 等功率水平对比线 (0.5 R_Th 与 2.0 R_Th) -->
  <line x1="134" y1="84.4" x2="296" y2="84.4" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.8"/>

  <!-- 精确绘制的 P_L / P_max 曲线 (Python 逐点验算) -->
  <polyline fill="none" stroke="#38bdf8" stroke-width="3.2" stroke-linejoin="round"
    points="80.0,280.0 90.8,207.3 101.6,157.8 112.4,123.8 123.2,100.4 134.0,84.4 144.8,73.8 155.6,66.9 166.4,62.7 177.2,60.6 188.0,60.0 198.8,60.5 209.6,61.8 220.4,63.7 231.2,66.1 242.0,68.8 252.8,71.7 263.6,74.8 274.4,78.0 285.2,81.2 296.0,84.4 306.8,87.7 317.6,90.9 328.4,94.1 339.2,97.3 350.0,100.4 360.8,103.5 371.6,106.4 382.4,109.4 393.2,112.2 404.0,115.0 414.8,117.7 425.6,120.4 436.4,122.9 447.2,125.5 458.0,127.9 468.8,130.3 479.6,132.6 490.4,134.9 501.2,137.1 512.0,139.2 522.8,141.3 533.6,143.3 544.4,145.3 555.2,147.2 566.0,149.1 576.8,150.9 587.6,152.7 598.4,154.4 609.2,156.1 620.0,157.8"/>

  <!-- 精确绘制的 η 效率曲线 (Python 逐点验算) -->
  <polyline fill="none" stroke="#10b981" stroke-width="3" stroke-linejoin="round"
    points="80.0,280.0 90.8,260.0 101.6,243.3 112.4,229.2 123.2,217.1 134.0,206.7 144.8,197.5 155.6,189.4 166.4,182.2 177.2,175.8 188.0,170.0 198.8,164.8 209.6,160.0 220.4,155.7 231.2,151.7 242.0,148.0 252.8,144.6 263.6,141.5 274.4,138.6 285.2,135.9 296.0,133.3 306.8,131.0 317.6,128.8 328.4,126.7 339.2,124.7 350.0,122.9 360.8,121.1 371.6,119.5 382.4,117.9 393.2,116.4 404.0,115.0 414.8,113.7 425.6,112.4 436.4,111.2 447.2,110.0 458.0,108.9 468.8,107.8 479.6,106.8 490.4,105.8 501.2,104.9 512.0,104.0 522.8,103.1 533.6,102.3 544.4,101.5 555.2,100.7 566.0,100.0 576.8,99.3 587.6,98.6 598.4,97.9 609.2,97.3 620.0,96.7"/>

  <!-- 关键标记点 -->
  <!-- P_max 顶点 -->
  <circle cx="188.0" cy="60.0" r="6" fill="#f43f5e" stroke="#f8fafc" stroke-width="2"/>
  <rect x="200" y="42" width="166" height="24" rx="5" fill="#1e293b" stroke="#f43f5e" stroke-width="1"/>
  <text x="283" y="58" fill="#fda4af" font-size="11.5" font-weight="700" text-anchor="middle">峰值 P_max (R_L = R_Th)</text>

  <!-- η = 50% 交点 -->
  <circle cx="188.0" cy="170.0" r="6" fill="#10b981" stroke="#f8fafc" stroke-width="2"/>
  <rect x="200" y="176" width="144" height="24" rx="5" fill="#1e293b" stroke="#10b981" stroke-width="1"/>
  <text x="272" y="192" fill="#6ee7b7" font-size="11.5" font-weight="700" text-anchor="middle">匹配点效率 η = 50%</text>

  <!-- 0.5 R_Th 与 2.0 R_Th 对照点 -->
  <circle cx="134.0" cy="84.4" r="4.5" fill="#fbbf24"/>
  <circle cx="296.0" cy="84.4" r="4.5" fill="#fbbf24"/>
  <text x="296" y="77" fill="#fde68a" font-size="10.5" text-anchor="middle">88.9% P_max (η=66.7%)</text>

  <!-- 图例 -->
  <rect x="430" y="232" width="176" height="40" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <line x1="440" y1="245" x2="462" y2="245" stroke="#38bdf8" stroke-width="3"/>
  <text x="468" y="249" fill="#e2e8f0" font-size="11">负载功率 P_L / P_max</text>
  <line x1="440" y1="262" x2="462" y2="262" stroke="#10b981" stroke-width="3"/>
  <text x="468" y="266" fill="#e2e8f0" font-size="11">传输效率 η = R_L/(R_Th+R_L)</text>
</svg>`;

const SHEET_ACT3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 270" width="100%" height="auto" style="background:#0f172a;border-radius:12px;font-family:'Segoe UI',system-ui,sans-serif;">
  <defs>
    <marker id="arr-sky" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-amb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
  </defs>

  <text x="20" y="26" fill="#f8fafc" font-size="15" font-weight="700">第三幕综合例题：先摘除 R_L 求端口 a–b 左侧戴维南等效，再求最大功率</text>

  <!-- 左图：原多源电路 -->
  <rect x="16" y="42" width="424" height="212" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="28" y="62" fill="#94a3b8" font-size="12" font-weight="600">Step 1 原电路（摘除 R_L 前）</text>

  <!-- 底部公共参考地线 -->
  <line x1="66" y1="220" x2="412" y2="220" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- Vs = 12V -->
  <line x1="66" y1="100" x2="66" y2="132" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="66" cy="160" r="26" fill="#0f172a" stroke="#38bdf8" stroke-width="2.4"/>
  <text x="66" y="153" fill="#f8fafc" font-size="16" font-weight="700" text-anchor="middle">+</text>
  <text x="66" y="175" fill="#f8fafc" font-size="16" font-weight="700" text-anchor="middle">−</text>
  <text x="66" y="202" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">12 V</text>
  <line x1="66" y1="186" x2="66" y2="220" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- R1 = 6 Ohm -->
  <line x1="66" y1="100" x2="96" y2="100" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="96,100 102,90 110,110 118,90 126,110 134,90 142,110 148,100" fill="none" stroke="#38bdf8" stroke-width="2.4"/>
  <text x="122" y="84" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">R1 = 6 Ω</text>
  <line x1="148" y1="100" x2="180" y2="100" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- 节点 A -->
  <circle cx="180" cy="100" r="4" fill="#fbbf24"/>
  <text x="180" y="84" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">节点 A</text>

  <!-- R2 = 12 Ohm -->
  <line x1="180" y1="100" x2="180" y2="128" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="180,128 170,134 190,142 170,150 190,158 170,166 190,174 180,180" fill="none" stroke="#38bdf8" stroke-width="2.4"/>
  <text x="150" y="158" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="end">R2=12 Ω</text>
  <line x1="180" y1="180" x2="180" y2="220" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- R3 = 4 Ohm -->
  <line x1="180" y1="100" x2="212" y2="100" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="212,100 218,90 226,110 234,90 242,110 250,90 258,110 264,100" fill="none" stroke="#38bdf8" stroke-width="2.4"/>
  <text x="238" y="84" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">R3 = 4 Ω</text>
  <line x1="264" y1="100" x2="346" y2="100" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- 电流源 Is = 1 A 向上注入端口 a -->
  <line x1="305" y1="100" x2="305" y2="132" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="305" cy="160" r="24" fill="#0f172a" stroke="#10b981" stroke-width="2.4"/>
  <line x1="305" y1="175" x2="305" y2="147" stroke="#10b981" stroke-width="2.5" marker-end="url(#arr-sky)"/>
  <text x="275" y="164" fill="#10b981" font-size="12" font-weight="700" text-anchor="end">1 A</text>
  <line x1="305" y1="184" x2="305" y2="220" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- 端口 a, b -->
  <circle cx="346" cy="100" r="4.5" fill="#f8fafc" stroke="#f59e0b" stroke-width="2"/>
  <text x="346" y="88" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">a</text>
  <circle cx="346" cy="220" r="4.5" fill="#f8fafc" stroke="#f59e0b" stroke-width="2"/>
  <text x="346" y="238" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">b</text>

  <!-- 负载 R_L -->
  <line x1="351" y1="100" x2="412" y2="100" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="412" y1="100" x2="412" y2="128" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="412,128 402,134 422,142 402,150 422,158 402,166 422,174 412,180" fill="none" stroke="#f59e0b" stroke-width="2.4"/>
  <line x1="395" y1="175" x2="429" y2="133" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#arr-amb)"/>
  <line x1="412" y1="180" x2="412" y2="220" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="386" y="160" fill="#f59e0b" font-size="12" font-weight="700" text-anchor="end">R_L</text>

  <!-- 转换箭头 -->
  <line x1="448" y1="148" x2="482" y2="148" stroke="#f59e0b" stroke-width="3" marker-end="url(#arr-amb)"/>
  <text x="465" y="138" fill="#fde68a" font-size="11" font-weight="700" text-anchor="middle">等效</text>

  <!-- 右图：戴维南等效电路 -->
  <rect x="492" y="42" width="212" height="212" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="504" y="62" fill="#38bdf8" font-size="12" font-weight="600">Step 2 戴维南等效结果</text>

  <line x1="534" y1="104" x2="564" y2="104" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="564,104 570,94 578,114 586,94 594,114 602,94 610,114 616,104" fill="none" stroke="#38bdf8" stroke-width="2.4"/>
  <text x="590" y="88" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">R_Th = 8 Ω</text>
  <line x1="616" y1="104" x2="664" y2="104" stroke="#e2e8f0" stroke-width="2.2"/>

  <line x1="534" y1="104" x2="534" y2="132" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="534" cy="158" r="24" fill="#0f172a" stroke="#38bdf8" stroke-width="2.4"/>
  <text x="534" y="152" fill="#f8fafc" font-size="15" font-weight="700" text-anchor="middle">+</text>
  <text x="534" y="172" fill="#f8fafc" font-size="15" font-weight="700" text-anchor="middle">−</text>
  <text x="534" y="198" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">V_Th = 16 V</text>
  <line x1="534" y1="182" x2="534" y2="218" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="534" y1="218" x2="664" y2="218" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- R_L = 8 Ohm -->
  <line x1="664" y1="104" x2="664" y2="130" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="664,130 654,136 674,144 654,152 674,160 654,168 674,176 664,182" fill="none" stroke="#f59e0b" stroke-width="2.4"/>
  <line x1="664" y1="182" x2="664" y2="218" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="664" y="238" fill="#fde68a" font-size="12" font-weight="700" text-anchor="middle">R_L = 8 Ω → P_max = 8 W</text>
</svg>`;

const SHEET_ACT4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 260" width="100%" height="auto" style="background:#0f172a;border-radius:12px;font-family:'Segoe UI',system-ui,sans-serif;">
  <text x="20" y="28" fill="#f8fafc" font-size="15" font-weight="700">第四幕工程权衡：小信号阻抗匹配（η = 50%）vs. 电力电网高效率输电（η &gt; 95%）</text>

  <!-- 左侧卡片：射频/音响/传感器 -->
  <rect x="20" y="44" width="330" height="200" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="36" y="68" fill="#38bdf8" font-size="14" font-weight="700">阵营 A：小信号匹配（R_L = R_Th）</text>
  <text x="36" y="88" fill="#94a3b8" font-size="11.5">应用：50 Ω 射频天线 / 音频功放 / 微弱传感器</text>

  <!-- 能量分配条 50/50 -->
  <text x="36" y="114" fill="#cbd5e1" font-size="11">总发出功率分配（100%）：</text>
  <rect x="36" y="122" width="149" height="28" rx="4" fill="#ef4444" opacity="0.85"/>
  <text x="110" y="140" fill="#fff" font-size="11.5" font-weight="700" text-anchor="middle">内阻发热 50%</text>
  <rect x="187" y="122" width="149" height="28" rx="4" fill="#38bdf8" opacity="0.9"/>
  <text x="261" y="140" fill="#0f172a" font-size="11.5" font-weight="700" text-anchor="middle">负载有用功 50%</text>

  <text x="36" y="176" fill="#e2e8f0" font-size="12">• 目标：信噪比优先，榨干微弱信号源最大功率</text>
  <text x="36" y="198" fill="#e2e8f0" font-size="12">• 典型量级：μW ~ mW（50% 损耗发热量可忽略）</text>
  <text x="36" y="220" fill="#7dd3fc" font-size="12" font-weight="600">• 结论：严格遵循最大功率传输定理</text>

  <!-- 右侧卡片：电力电网 -->
  <rect x="370" y="44" width="330" height="200" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="386" y="68" fill="#10b981" font-size="14" font-weight="700">阵营 B：电力输电（R_L ≫ R_Th）</text>
  <text x="386" y="88" fill="#94a3b8" font-size="11.5">应用：高压电网 / 变电站 / 电池供电系统</text>

  <!-- 能量分配条 4/96 -->
  <text x="386" y="114" fill="#cbd5e1" font-size="11">总发出功率分配（100%）：</text>
  <rect x="386" y="122" width="18" height="28" rx="3" fill="#ef4444" opacity="0.9"/>
  <rect x="406" y="122" width="280" height="28" rx="4" fill="#10b981" opacity="0.9"/>
  <text x="546" y="140" fill="#0f172a" font-size="11.5" font-weight="700" text-anchor="middle">负载有用功 &gt; 95%（线损 &lt; 5%）</text>

  <text x="386" y="176" fill="#e2e8f0" font-size="12">• 目标：极低损耗，绝不允许一半电能变成废热</text>
  <text x="386" y="198" fill="#e2e8f0" font-size="12">• 典型量级：kW ~ GW（若 η=50% 将烧毁变压器）</text>
  <text x="386" y="220" fill="#6ee7b7" font-size="12" font-weight="600">• 结论：压低内阻 R_Th，绝不追求 R_L = R_Th</text>
</svg>`;

const SHEET_ACT5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 265" width="100%" height="auto" style="background:#0f172a;border-radius:12px;font-family:'Segoe UI',system-ui,sans-serif;">
  <text x="20" y="26" fill="#f8fafc" font-size="15" font-weight="700">第五幕面包板拓扑：安全 kΩ 级戴维南实操（V_Th = 5 V, R_Th = 1 kΩ, B10K 电位器）</text>

  <!-- 面包板底板 -->
  <rect x="24" y="44" width="440" height="202" rx="10" fill="#1e293b" stroke="#475569" stroke-width="2"/>
  <!-- 电源轨 +5V (红) 与 GND (蓝) -->
  <line x1="42" y1="68" x2="446" y2="68" stroke="#ef4444" stroke-width="3"/>
  <text x="48" y="61" fill="#fca5a5" font-size="11" font-weight="700">+5.0 V 电源轨 (V_Th)</text>
  <line x1="42" y1="226" x2="446" y2="226" stroke="#3b82f6" stroke-width="3"/>
  <text x="48" y="218" fill="#93c5fd" font-size="11" font-weight="700">GND 接地轨 (端口 b)</text>

  <!-- 跳线：+5V 到 R_Th 左端 -->
  <line x1="100" y1="68" x2="100" y2="128" stroke="#ef4444" stroke-width="2.5"/>
  <circle cx="100" cy="68" r="4" fill="#ef4444"/>
  <circle cx="100" cy="128" r="4" fill="#e2e8f0"/>

  <!-- 1 kΩ 色环电阻 (棕黑红金) -->
  <line x1="100" y1="128" x2="132" y2="128" stroke="#cbd5e1" stroke-width="2.5"/>
  <rect x="132" y="114" width="84" height="28" rx="6" fill="#d6b98c" stroke="#92400e" stroke-width="1.5"/>
  <!-- 色环：棕、黑、红、金 -->
  <rect x="144" y="114" width="7" height="28" fill="#78350f"/>
  <rect x="158" y="114" width="7" height="28" fill="#0f172a"/>
  <rect x="172" y="114" width="7" height="28" fill="#dc2626"/>
  <rect x="196" y="114" width="6" height="28" fill="#eab308"/>
  <line x1="216" y1="128" x2="256" y2="128" stroke="#cbd5e1" stroke-width="2.5"/>
  <text x="174" y="106" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">R_Th = 1 kΩ (棕黑红金)</text>

  <!-- 节点 a (R_Th 与 电位器连接点) -->
  <circle cx="256" cy="128" r="5" fill="#fbbf24"/>
  <text x="256" y="114" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">端口 a</text>

  <!-- B10K 旋转电位器 -->
  <line x1="256" y1="128" x2="310" y2="128" stroke="#f59e0b" stroke-width="2.5"/>
  <circle cx="350" cy="148" r="34" fill="#0f172a" stroke="#f59e0b" stroke-width="3"/>
  <circle cx="350" cy="148" r="22" fill="#334155" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- 旋钮指针 -->
  <line x1="350" y1="148" x2="338" y2="132" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
  <text x="350" y="198" fill="#fde68a" font-size="12" font-weight="700" text-anchor="middle">B10K 电位器 (R_L)</text>
  <!-- Pin 1 接端口 a，Pin 2 & Pin 3 短接至 GND -->
  <line x1="310" y1="128" x2="322" y2="128" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="350" y1="182" x2="350" y2="226" stroke="#3b82f6" stroke-width="2.5"/>
  <circle cx="350" cy="226" r="4" fill="#3b82f6"/>

  <!-- 右侧虚拟数字万用表 (DMM) -->
  <rect x="492" y="44" width="204" height="202" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="594" y="68" fill="#6ee7b7" font-size="13" font-weight="700" text-anchor="middle">虚拟数字万用表 &amp; 功率计</text>
  <!-- LCD 屏幕 -->
  <rect x="510" y="80" width="168" height="86" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  <text x="522" y="102" fill="#a7f3d0" font-size="11">实测 V_L =</text>
  <text x="668" y="104" fill="#ecfdf5" font-size="17" font-weight="700" text-anchor="end">2.500 V</text>
  <text x="522" y="128" fill="#a7f3d0" font-size="11">当前 R_L =</text>
  <text x="668" y="128" fill="#fde68a" font-size="14" font-weight="700" text-anchor="end">1.00 kΩ</text>
  <text x="522" y="154" fill="#a7f3d0" font-size="11">P_L = V_L²/R_L =</text>
  <text x="668" y="155" fill="#38bdf8" font-size="16" font-weight="700" text-anchor="end">6.25 mW</text>

  <!-- 红黑表笔连线示意 -->
  <path d="M 510 190 L 478 190 L 478 128 L 256 128" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="5,3"/>
  <path d="M 510 218 L 468 218 L 468 226 L 350 226" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="594" y="194" fill="#fda4af" font-size="11" text-anchor="middle">红表笔 → 端口 a | 黑表笔 → GND</text>
  <text x="594" y="218" fill="#6ee7b7" font-size="11.5" font-weight="700" text-anchor="middle">★ V_L = 2.50 V 处触发峰值锁定！</text>
</svg>`;

const SHEET_MINI1 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 120' width='320' height='120' style='background:#0f172a;border-radius:8px;'><line x1='30' y1='95' x2='285' y2='95' stroke='#94a3b8' stroke-width='2'/><rect x='20' y='40' width='22' height='36' rx='4' fill='none' stroke='#38bdf8' stroke-dasharray='3,2'/><text x='31' y='62' fill='#38bdf8' font-size='9' text-anchor='middle'>Vs?</text><line x1='31' y1='28' x2='31' y2='40' stroke='#94a3b8' stroke-width='2'/><line x1='31' y1='76' x2='31' y2='95' stroke='#94a3b8' stroke-width='2'/><line x1='31' y1='28' x2='110' y2='28' stroke='#94a3b8' stroke-width='2'/><text x='70' y='21' fill='#e2e8f0' font-size='10' text-anchor='middle'>R1=6Ω</text><circle cx='120' cy='28' r='3' fill='#fbbf24'/><line x1='120' y1='28' x2='120' y2='95' stroke='#38bdf8' stroke-width='2'/><text x='106' y='62' fill='#e2e8f0' font-size='10' text-anchor='end'>R2=3Ω</text><rect x='155' y='40' width='22' height='36' rx='4' fill='none' stroke='#10b981' stroke-dasharray='3,2'/><text x='166' y='62' fill='#10b981' font-size='9' text-anchor='middle'>Is?</text><line x1='120' y1='28' x2='275' y2='28' stroke='#94a3b8' stroke-width='2'/><text x='225' y='21' fill='#e2e8f0' font-size='10' text-anchor='middle'>R3=4Ω</text><circle cx='275' cy='28' r='3.5' fill='#f59e0b'/><text x='286' y='32' fill='#f8fafc' font-size='11'>a</text><circle cx='275' cy='95' r='3.5' fill='#f59e0b'/><text x='286' y='99' fill='#f8fafc' font-size='11'>b</text></svg>`;

const SHEET_MINI2 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 120' width='320' height='120' style='background:#0f172a;border-radius:8px;'><line x1='40' y1='95' x2='275' y2='95' stroke='#94a3b8' stroke-width='2'/><line x1='40' y1='28' x2='40' y2='95' stroke='#38bdf8' stroke-width='2.5'/><text x='30' y='64' fill='#38bdf8' font-size='9' text-anchor='end'>短路</text><line x1='40' y1='28' x2='130' y2='28' stroke='#38bdf8' stroke-width='2'/><text x='85' y='20' fill='#e2e8f0' font-size='10' text-anchor='middle'>R1=6Ω</text><line x1='130' y1='28' x2='130' y2='95' stroke='#38bdf8' stroke-width='2'/><text x='140' y='64' fill='#e2e8f0' font-size='10'>R2=3Ω</text><line x1='130' y1='28' x2='275' y2='28' stroke='#f59e0b' stroke-width='2'/><text x='205' y='20' fill='#fde68a' font-size='10' text-anchor='middle'>R3=4Ω</text><text x='260' y='64' fill='#f59e0b' font-size='11' text-anchor='end'>← 看入 R_Th</text><circle cx='275' cy='28' r='3.5' fill='#f59e0b'/><circle cx='275' cy='95' r='3.5' fill='#f59e0b'/></svg>`;

const SHEET_MINI3 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 120' width='320' height='120' style='background:#0f172a;border-radius:8px;'><line x1='35' y1='95' x2='275' y2='95' stroke='#94a3b8' stroke-width='2'/><circle cx='35' cy='62' r='16' fill='#0f172a' stroke='#38bdf8' stroke-width='2'/><text x='35' y='66' fill='#38bdf8' font-size='9' text-anchor='middle'>18V</text><line x1='35' y1='28' x2='35' y2='46' stroke='#94a3b8' stroke-width='2'/><line x1='35' y1='78' x2='35' y2='95' stroke='#94a3b8' stroke-width='2'/><line x1='35' y1='28' x2='275' y2='28' stroke='#94a3b8' stroke-width='2'/><text x='78' y='20' fill='#e2e8f0' font-size='10' text-anchor='middle'>6Ω</text><circle cx='120' cy='28' r='4' fill='#fbbf24'/><text x='120' y='16' fill='#fbbf24' font-size='10' text-anchor='middle'>V_A</text><line x1='120' y1='28' x2='120' y2='95' stroke='#38bdf8' stroke-width='2'/><text x='108' y='64' fill='#e2e8f0' font-size='10' text-anchor='end'>3Ω</text><circle cx='165' cy='62' r='15' fill='#0f172a' stroke='#10b981' stroke-width='2'/><text x='165' y='66' fill='#10b981' font-size='9' text-anchor='middle'>↑3A</text><line x1='165' y1='28' x2='165' y2='47' stroke='#94a3b8' stroke-width='2'/><line x1='165' y1='77' x2='165' y2='95' stroke='#94a3b8' stroke-width='2'/><text x='222' y='20' fill='#f43f5e' font-size='10' text-anchor='middle'>R3=4Ω (I=0!)</text><circle cx='275' cy='28' r='3.5' fill='#f59e0b'/><circle cx='275' cy='95' r='3.5' fill='#f59e0b'/><text x='284' y='65' fill='#fbbf24' font-size='11'>V_Th</text></svg>`;

const SHEET_MINI4 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 120' width='320' height='120' style='background:#0f172a;border-radius:8px;'><circle cx='60' cy='62' r='20' fill='#0f172a' stroke='#38bdf8' stroke-width='2'/><text x='60' y='66' fill='#38bdf8' font-size='10' font-weight='700' text-anchor='middle'>12V</text><line x1='60' y1='25' x2='60' y2='42' stroke='#e2e8f0' stroke-width='2'/><line x1='60' y1='82' x2='60' y2='98' stroke='#e2e8f0' stroke-width='2'/><line x1='60' y1='25' x2='240' y2='25' stroke='#e2e8f0' stroke-width='2'/><rect x='115' y='16' width='50' height='18' rx='4' fill='#1e293b' stroke='#38bdf8' stroke-width='1.8'/><text x='140' y='29' fill='#38bdf8' font-size='10' text-anchor='middle'>6 Ω</text><line x1='60' y1='98' x2='240' y2='98' stroke='#e2e8f0' stroke-width='2'/><line x1='240' y1='25' x2='240' y2='98' stroke='#f59e0b' stroke-width='2.5'/><rect x='222' y='44' width='36' height='36' rx='4' fill='#1e293b' stroke='#f59e0b' stroke-width='2'/><text x='240' y='66' fill='#fde68a' font-size='11' font-weight='700' text-anchor='middle'>R_L?</text></svg>`;

const SHEET_MINI5 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 120' width='320' height='120' style='background:#0f172a;border-radius:8px;'><rect x='24' y='20' width='272' height='80' rx='8' fill='#1e293b' stroke='#10b981' stroke-width='1.8'/><text x='160' y='48' fill='#94a3b8' font-size='11' text-anchor='middle'>p_max = V_Th² / (4 · R_Th)</text><text x='160' y='78' fill='#6ee7b7' font-size='16' font-weight='700' text-anchor='middle'>V_Th = 12 V,  R_Th = 6 Ω  →  p_max = ?</text></svg>`;

/* ------------------------------------------------------------- light-theme fixes */

/** Colour fixes before `lightSvg`, for what its shared mapping gets wrong on white:
 *  - figure 5.2: the colour bands of the 1 kΩ resistor are drawn with `#78350f` (brown) and
 *    `#0f172a` (black); as fills these are "dark panel" colours and would turn pale — they get
 *    `#7a3e12` / `#111111`, which the mapping leaves alone;
 *  - figure 5.2: the LCD's reading `#ecfdf5` is not mapped (it would stay near-white on the light
 *    green screen) → `#064e3b`;
 *  - figure 4.2: the labels inside the red and the blue bar (`#fff`, `#0f172a`) would turn ink on
 *    a saturated bar → `#fefefe` (stays white).
 *  One layout fix: in figure 5.2 the LCD's "6.25 mW" (16 px) overlapped its label; it is 13.5 px. */
function fix(svg: string, swaps: [string, string][] = []): string {
  let s = svg.replace(/^<svg([^>]*?) width="100%" height="auto"/, '<svg$1');
  for (const [a, b] of swaps) {
    if (!s.includes(a)) throw new Error(`W2-L8 svg fix not found: ${a}`);
    s = s.split(a).join(b);
  }
  return lightSvg(s);
}

export const SVG_ACT1 = fix(SHEET_ACT1);
export const SVG_ACT2 = fix(SHEET_ACT2);
export const SVG_ACT3 = fix(SHEET_ACT3);
export const SVG_ACT4 = fix(SHEET_ACT4, [
  ['fill="#fff" font-size="11.5" font-weight="700" text-anchor="middle">内阻发热 50%', 'fill="#fefefe" font-size="11.5" font-weight="700" text-anchor="middle">内阻发热 50%'],
  [
    'fill="#0f172a" font-size="11.5" font-weight="700" text-anchor="middle">负载有用功 50%',
    'fill="#fefefe" font-size="11.5" font-weight="700" text-anchor="middle">负载有用功 50%',
  ],
]);
export const SVG_ACT5 = fix(SHEET_ACT5, [
  ['<rect x="144" y="114" width="7" height="28" fill="#78350f"/>', '<rect x="144" y="114" width="7" height="28" fill="#7a3e12"/>'],
  ['<rect x="158" y="114" width="7" height="28" fill="#0f172a"/>', '<rect x="158" y="114" width="7" height="28" fill="#111111"/>'],
  ['fill="#ecfdf5"', 'fill="#064e3b"'],
  // layout, not colour: the 16 px "6.25 mW" ran into its label "P_L = V_L²/R_L ="
  ['<text x="668" y="155" fill="#38bdf8" font-size="16"', '<text x="668" y="155" fill="#38bdf8" font-size="13.5"'],
]);
export const MINI_STEP1 = fix(SHEET_MINI1);
export const MINI_STEP2 = fix(SHEET_MINI2);
export const MINI_STEP3 = fix(SHEET_MINI3);
export const MINI_STEP4 = fix(SHEET_MINI4);
export const MINI_STEP5 = fix(SHEET_MINI5);

/* ------------------------------------------------------------- added figures (sheet style) */

const FONT = `font-family="'Segoe UI', system-ui, sans-serif"`;
const BG = (w: number, h: number) => `<rect width="${w}" height="${h}" rx="12" fill="#0f172a"/>`;
/** a horizontal zigzag resistor from x1 to x2 at height y */
const zigH = (x1: number, x2: number, y: number, stroke: string) => {
  const n = 6;
  const pts = [`${x1},${y}`];
  for (let i = 0; i < n; i++) pts.push(`${(x1 + ((i + 0.5) / n) * (x2 - x1)).toFixed(1)},${y + (i % 2 ? 9 : -9)}`);
  pts.push(`${x2},${y}`);
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>`;
};
/** a vertical zigzag resistor from y1 to y2 at x */
const zigV = (x: number, y1: number, y2: number, stroke: string) => {
  const n = 6;
  const pts = [`${x},${y1}`];
  for (let i = 0; i < n; i++) pts.push(`${x + (i % 2 ? 9 : -9)},${(y1 + ((i + 0.5) / n) * (y2 - y1)).toFixed(1)}`);
  pts.push(`${x},${y2}`);
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>`;
};
const wire = (pts: string) => `<polyline points="${pts}" fill="none" stroke="#e2e8f0" stroke-width="2.2"/>`;
/** a voltage source: circle at (x, y) with + / − */
const vsrc = (x: number, y: number, r = 20) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#0f172a" stroke="#38bdf8" stroke-width="2.4"/><text x="${x}" y="${y - 4}" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">+</text><text x="${x}" y="${y + 14}" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">−</text>`;
/** the arrow of a variable resistor, through the zigzag centred at (x, y) */
const varArrow = (x: number, y: number, stroke: string) =>
  `<line x1="${x - 18}" y1="${y + 22}" x2="${x + 16}" y2="${y - 20}" stroke="${stroke}" stroke-width="1.8"/><polygon points="${x + 19},${y - 24} ${x + 9},${y - 19} ${x + 17},${y - 12}" fill="${stroke}"/>`;
const port = (x: number, y: number, name: string, dy: number) =>
  `<circle cx="${x}" cy="${y}" r="4.5" fill="#f8fafc" stroke="#f59e0b" stroke-width="2"/><text x="${x}" y="${y + dy}" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">${name}</text>`;

/** The guided example's network: 18 V via R1 = 6 Ω to node A, R2 = 3 Ω from A to ground, 3 A up
 *  into A, R3 = 4 Ω from A to port a, the load R_L across a–b. */
export const SVG_GD_PROBLEM =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 236" ${FONT} role="img" aria-label="引导例题电路：18 V 电压源经 R1 = 6 Ω 接节点 A，R2 = 3 Ω 接 A 与地，3 A 电流源由地向上注入 A，R3 = 4 Ω 接 A 与端口 a，端口 a–b 接可变负载 R_L">
  ${BG(600, 236)}
  <text x="20" y="26" fill="#f8fafc" font-size="14" font-weight="700">引导例题：18 V 电压源 + 3 A 电流源网络，端口 a–b 接可变负载 R_L</text>
  <rect x="14" y="40" width="402" height="184" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="1.5" stroke-dasharray="7,5"/>
  ${wire('60,80 96,80')}
  ${wire('156,80 330,80')}
  ${wire('390,80 520,80 520,106')}
  ${wire('520,174 520,200 60,200 60,164')}
  ${wire('60,116 60,80')}
  ${vsrc(60, 140, 24)}
  <text x="92" y="190" fill="#38bdf8" font-size="12" font-weight="700">V_s = 18 V</text>
  ${zigH(96, 156, 80, '#38bdf8')}
  <text x="126" y="62" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">R1 = 6 Ω</text>
  <circle cx="200" cy="80" r="4.5" fill="#fbbf24"/>
  <text x="200" y="62" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">节点 A</text>
  ${wire('200,80 200,110')}
  ${zigV(200, 110, 170, '#38bdf8')}
  ${wire('200,170 200,200')}
  <text x="186" y="144" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="end">R2 = 3 Ω</text>
  ${wire('272,80 272,118')}
  <circle cx="272" cy="140" r="22" fill="#0f172a" stroke="#10b981" stroke-width="2.4"/>
  <line x1="272" y1="154" x2="272" y2="128" stroke="#10b981" stroke-width="2.4"/>
  <polygon points="272,122 266,132 278,132" fill="#10b981"/>
  ${wire('272,162 272,200')}
  <text x="302" y="144" fill="#10b981" font-size="12" font-weight="700">I_s = 3 A</text>
  ${zigH(330, 390, 80, '#38bdf8')}
  <text x="360" y="62" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">R3 = 4 Ω</text>
  ${port(440, 80, 'a', -12)}
  ${port(440, 200, 'b', 20)}
  ${zigV(520, 106, 174, '#f59e0b')}
  ${varArrow(520, 140, '#f59e0b')}
  <text x="546" y="144" fill="#fde68a" font-size="13" font-weight="700">R_L</text>
</svg>`);

/** Q1: V_Th = 20 V, R_Th variable (1–20 Ω), R_L fixed at 10 Ω. */
export const SVG_Q1 =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 176" ${FONT} role="img" aria-label="20 V 戴维南电压源，内阻 R_Th 可调，负载 R_L = 10 Ω 固定">
  ${BG(420, 176)}
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Q1 · 负载 R_L 固定，内阻 R_Th 可调（1–20 Ω）</text>
  ${wire('70,80 70,54 140,54')}
  ${wire('200,54 320,54 320,78')}
  ${wire('320,136 320,156 70,156 70,124')}
  ${vsrc(70, 102, 22)}
  <text x="40" y="106" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="end">20 V</text>
  ${zigH(140, 200, 54, '#38bdf8')}
  ${varArrow(170, 54, '#38bdf8')}
  <text x="170" y="94" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">R_Th = ?（可调）</text>
  ${zigV(320, 78, 136, '#f59e0b')}
  <text x="338" y="104" fill="#fde68a" font-size="12" font-weight="700">R_L = 10 Ω</text>
  <text x="338" y="120" fill="#94a3b8" font-size="11">（固定）</text>
</svg>`);

/** Q2: a power plant (generator + line resistance) feeding a city load. */
export const SVG_Q2 =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 176" ${FONT} role="img" aria-label="发电厂经输电线向城市负载供电：R_Th 为发电机内阻与输电线电阻，R_L 为城市负载">
  ${BG(420, 176)}
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Q2 · 发电厂 → 输电线 → 城市用户</text>
  ${wire('62,80 62,54 120,54')}
  ${wire('200,54 340,54 340,78')}
  ${wire('340,136 340,156 62,156 62,124')}
  <circle cx="62" cy="102" r="22" fill="#0f172a" stroke="#10b981" stroke-width="2.4"/>
  <text x="62" y="107" fill="#10b981" font-size="15" font-weight="800" text-anchor="middle">G</text>
  <text x="62" y="146" fill="#94a3b8" font-size="11" text-anchor="middle">发电机</text>
  ${zigH(120, 200, 54, '#38bdf8')}
  <text x="160" y="40" fill="#38bdf8" font-size="11.5" font-weight="700" text-anchor="middle">R_Th：发电机内阻 + 输电线</text>
  <path d="M 228 54 L 240 40 L 252 54 M 270 54 L 282 40 L 294 54" fill="none" stroke="#94a3b8" stroke-width="1.4"/>
  ${zigV(340, 78, 136, '#f59e0b')}
  <text x="358" y="104" fill="#fde68a" font-size="12" font-weight="700">R_L</text>
  <text x="358" y="120" fill="#94a3b8" font-size="11">城市负载</text>
  <text x="200" y="112" fill="#e2e8f0" font-size="13" font-weight="700" text-anchor="middle">MW–GW 级 · η = ?</text>
</svg>`);

/** Q3: R_Th = 1 kΩ and two candidate loads, 500 Ω and 2 kΩ. */
export const SVG_Q3 =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 176" ${FONT} role="img" aria-label="传感器前端 R_Th = 1 kΩ，负载在 500 Ω 与 2 kΩ 之间二选一">
  ${BG(420, 176)}
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Q3 · 传感器前端 R_Th = 1 kΩ，负载二选一</text>
  ${wire('56,80 56,54 100,54')}
  ${wire('160,54 210,54')}
  ${wire('56,124 56,156 380,156')}
  ${vsrc(56, 102, 22)}
  ${zigH(100, 160, 54, '#38bdf8')}
  <text x="130" y="40" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">R_Th = 1 kΩ</text>
  ${port(210, 54, 'a', -10)}
  <line x1="214" y1="54" x2="242" y2="54" stroke="#fbbf24" stroke-width="2.2"/>
  <text x="334" y="58" fill="#fbbf24" font-size="10.5" text-anchor="middle">二选一</text>
  <circle cx="250" cy="40" r="3" fill="#fbbf24"/>
  <circle cx="250" cy="68" r="3" fill="#fbbf24"/>
  ${wire('250,40 370,40 370,78')}
  ${wire('250,68 300,68 300,78')}
  ${zigV(300, 78, 132, '#f59e0b')}
  ${zigV(370, 78, 132, '#f59e0b')}
  ${wire('300,132 300,156')}
  ${wire('370,132 370,156')}
  <text x="284" y="110" fill="#fde68a" font-size="11.5" font-weight="700" text-anchor="end">① 500 Ω</text>
  <text x="354" y="110" fill="#fde68a" font-size="11.5" font-weight="700" text-anchor="end">② 2 kΩ</text>
  <text x="160" y="128" fill="#94a3b8" font-size="11" text-anchor="middle">功率 P_L ? · 效率 η ?</text>
</svg>`);

/** Q4: V_Th = 10 V, R_Th = 1 kΩ, a potentiometer R_L and a voltmeter across it. */
export const SVG_Q4 =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 176" ${FONT} role="img" aria-label="电源模块 V_Th = 10 V、R_Th = 1 kΩ，输出端接电位器 R_L，电压表并联测 V_L">
  ${BG(420, 176)}
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Q4 · 电源模块 + 电位器 + 电压表</text>
  <rect x="24" y="36" width="190" height="130" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="1.4" stroke-dasharray="6,4"/>
  <text x="34" y="52" fill="#94a3b8" font-size="10.5">电源模块（戴维南等效）</text>
  ${wire('64,84 64,66 110,66')}
  ${wire('170,66 270,66 270,82')}
  ${wire('270,140 270,150 64,150 64,128')}
  ${vsrc(64, 106, 22)}
  <text x="96" y="110" fill="#38bdf8" font-size="12" font-weight="700">10 V</text>
  ${zigH(110, 170, 66, '#38bdf8')}
  <text x="140" y="90" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">1 kΩ</text>
  ${zigV(270, 82, 140, '#f59e0b')}
  ${varArrow(270, 111, '#f59e0b')}
  <text x="250" y="114" fill="#fde68a" font-size="12" font-weight="700" text-anchor="end">R_L</text>
  ${wire('270,66 340,66 340,88')}
  ${wire('340,132 340,150 270,150')}
  <circle cx="340" cy="110" r="20" fill="#0f172a" stroke="#10b981" stroke-width="2.4"/>
  <text x="340" y="115" fill="#10b981" font-size="15" font-weight="800" text-anchor="middle">V</text>
  <text x="366" y="114" fill="#6ee7b7" font-size="11.5" font-weight="700">V_L = ?</text>
</svg>`);

/** The self-test act: the four traps the questions test (no answers). */
export const SVG_QUIZ_ACT = (() => {
  const card = (x: number, title: string, sub: string, icon: string) =>
    `<rect x="${x}" y="44" width="158" height="140" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="${x + 79}" y="68" fill="#f8fafc" font-size="12.5" font-weight="700" text-anchor="middle">${title}</text>
  <text x="${x + 79}" y="170" fill="#94a3b8" font-size="11" text-anchor="middle">${sub}</text>
  <g transform="translate(${x + 29} 80)">${icon}</g>`;
  const icon1 = `${zigH(0, 44, 26, '#38bdf8')}<text x="22" y="10" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">R_Th</text>${zigV(80, 0, 52, '#f59e0b')}<text x="96" y="30" fill="#fde68a" font-size="10" font-weight="700">R_L</text><text x="50" y="70" fill="#e2e8f0" font-size="10.5" text-anchor="middle">谁固定？谁在调？</text>`;
  const icon2 = `<path d="M 10 60 L 24 6 L 38 60 M 15 40 L 33 40 M 18 26 L 30 26" fill="none" stroke="#94a3b8" stroke-width="1.6"/><path d="M 38 14 C 58 26, 78 26, 98 14" fill="none" stroke="#38bdf8" stroke-width="1.6"/><rect x="70" y="30" width="30" height="30" rx="3" fill="#0f172a" stroke="#f59e0b" stroke-width="1.6"/><text x="85" y="50" fill="#fde68a" font-size="10" font-weight="700" text-anchor="middle">城市</text>`;
  const icon3 = `<line x1="0" y1="60" x2="100" y2="60" stroke="#94a3b8" stroke-width="1.4"/><line x1="0" y1="60" x2="0" y2="0" stroke="#94a3b8" stroke-width="1.4"/><path d="M 0 60 C 8 10, 18 4, 28 6 C 50 10, 75 30, 100 40" fill="none" stroke="#38bdf8" stroke-width="2.4"/><circle cx="14" cy="16" r="3.5" fill="#fbbf24"/><circle cx="56" cy="16" r="3.5" fill="#fbbf24"/><text x="35" y="74" fill="#e2e8f0" font-size="10.5" text-anchor="middle">左边还是右边？</text>`;
  const icon4 = `<circle cx="50" cy="28" r="24" fill="#0f172a" stroke="#10b981" stroke-width="2.2"/><text x="50" y="34" fill="#10b981" font-size="16" font-weight="800" text-anchor="middle">V</text><text x="50" y="74" fill="#e2e8f0" font-size="10.5" text-anchor="middle">读数到多少算峰值？</text>`;
  return lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 200" ${FONT} role="img" aria-label="诊断测验的四个概念陷阱">
  ${BG(700, 200)}
  <text x="20" y="28" fill="#f8fafc" font-size="15" font-weight="700">诊断测验：最大功率传输的四个高频陷阱</text>
  ${card(16, 'Q1 调 R_L 还是调 R_Th', '经典误区', icon1)}
  ${card(186, 'Q2 电网为什么不匹配', '50% 效率与工程权衡', icon2)}
  ${card(356, 'Q3 偏态曲线怎么选', '工程容差选型', icon3)}
  ${card(526, 'Q4 面包板怎么判峰值', '实验室判据', icon4)}
</svg>`);
})();
