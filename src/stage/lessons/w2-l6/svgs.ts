// The diagrams of the W2-L6 lesson sheet (docs/lessons/W2-L6.md): the act SVGs and the step
// SVGs of its guided-example JSON, copied from the sheet by a script (not retyped), then the
// diagrams added for act 6 and the self-test, drawn in the sheet's style. All are drawn for a dark
// canvas and exported through lightSvg (the site's light theme). Edits to the sheet's SVGs (colour
// and glyph only, nothing moved): the padlock emoji (U+1F512) of act 4, act 5 and step 4 is
// replaced by a drawn padlock (an emoji font is not guaranteed); act 1's ⚠ is a text glyph and stays.

import { lightSvg } from '../../svgTheme';

/* ------------------------------------------------------------- the sheet's diagrams */

const SVG_ACT1_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 320" width="100%" role="img" aria-label="端口等效黑盒对比图：实际电压源与实际电流源">
  <defs>
    <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
  </defs>
  <rect width="860" height="320" rx="12" fill="#0f172a"/>
  <text x="430" y="30" fill="#f8fafc" font-size="16" font-weight="700" text-anchor="middle" font-family="sans-serif">端口 a–b 外部等效黑盒对比（External Port Equivalence）</text>

  <!-- 黑盒 A：实际电压源 -->
  <rect x="35" y="52" width="320" height="218" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="195" y="76" fill="#38bdf8" font-size="13" font-weight="700" text-anchor="middle" font-family="sans-serif">黑盒 A：实际电压源（串联 R）</text>

  <!-- 电压源支路 -->
  <line x1="95" y1="225" x2="95" y2="188" stroke="#e2e8f0" stroke-width="2.5"/>
  <circle cx="95" cy="158" r="28" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
  <text x="95" y="149" fill="#f8fafc" font-size="18" font-weight="700" text-anchor="middle" font-family="monospace">+</text>
  <text x="95" y="176" fill="#94a3b8" font-size="18" font-weight="700" text-anchor="middle" font-family="monospace">−</text>
  <text x="54" y="163" fill="#38bdf8" font-size="14" font-weight="700" text-anchor="end" font-family="serif" font-style="italic">v_s</text>

  <!-- 串联电阻 R -->
  <line x1="95" y1="130" x2="95" y2="105" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="95" y1="105" x2="155" y2="105" stroke="#e2e8f0" stroke-width="2.5"/>
  <polyline points="155,105 163,93 175,117 187,93 199,117 211,93 223,117 231,105" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
  <text x="193" y="88" fill="#f59e0b" font-size="14" font-weight="700" text-anchor="middle" font-family="serif" font-style="italic">R</text>
  <line x1="231" y1="105" x2="335" y2="105" stroke="#e2e8f0" stroke-width="2.5"/>

  <!-- 底部导线 -->
  <line x1="95" y1="225" x2="335" y2="225" stroke="#e2e8f0" stroke-width="2.5"/>

  <!-- 端口 a, b -->
  <circle cx="335" cy="105" r="5" fill="#0f172a" stroke="#f8fafc" stroke-width="2.5"/>
  <circle cx="335" cy="225" r="5" fill="#0f172a" stroke="#f8fafc" stroke-width="2.5"/>
  <text x="348" y="109" fill="#f8fafc" font-size="14" font-weight="700" font-family="serif" font-style="italic">a</text>
  <text x="348" y="229" fill="#f8fafc" font-size="14" font-weight="700" font-family="serif" font-style="italic">b</text>
  <text x="305" y="138" fill="#cbd5e1" font-size="13" text-anchor="middle" font-family="monospace">+</text>
  <text x="305" y="168" fill="#cbd5e1" font-size="13" text-anchor="middle" font-family="serif" font-style="italic">v_oc = v_s</text>
  <text x="305" y="202" fill="#cbd5e1" font-size="13" text-anchor="middle" font-family="monospace">−</text>
  <line x1="255" y1="105" x2="295" y2="105" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-cyan)"/>
  <text x="275" y="96" fill="#38bdf8" font-size="12" text-anchor="middle" font-family="serif" font-style="italic">i</text>

  <!-- 中间双向等价符号 -->
  <line x1="378" y1="150" x2="482" y2="150" stroke="#22c55e" stroke-width="3" marker-end="url(#arrow-amber)" marker-start="url(#arrow-amber)"/>
  <text x="430" y="134" fill="#22c55e" font-size="14" font-weight="700" text-anchor="middle" font-family="monospace">v_s = i_s · R</text>
  <text x="430" y="176" fill="#22c55e" font-size="14" font-weight="700" text-anchor="middle" font-family="monospace">i_s = v_s / R</text>
  <text x="430" y="200" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="sans-serif">箭头始终指向 + 极</text>

  <!-- 黑盒 B：实际电流源 -->
  <rect x="505" y="52" width="320" height="218" rx="10" fill="#1e293b" stroke="#22c55e" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="665" y="76" fill="#22c55e" font-size="13" font-weight="700" text-anchor="middle" font-family="sans-serif">黑盒 B：实际电流源（并联 R）</text>

  <!-- 电流源支路 -->
  <line x1="565" y1="225" x2="565" y2="188" stroke="#e2e8f0" stroke-width="2.5"/>
  <circle cx="565" cy="158" r="28" fill="#0f172a" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="565" y1="176" x2="565" y2="140" stroke="#22c55e" stroke-width="3" marker-end="url(#arrow-cyan)"/>
  <text x="526" y="163" fill="#22c55e" font-size="14" font-weight="700" text-anchor="end" font-family="serif" font-style="italic">i_s</text>
  <line x1="565" y1="130" x2="565" y2="105" stroke="#e2e8f0" stroke-width="2.5"/>

  <!-- 并联电阻 R -->
  <line x1="565" y1="105" x2="805" y2="105" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="565" y1="225" x2="805" y2="225" stroke="#e2e8f0" stroke-width="2.5"/>
  <circle cx="660" cy="105" r="3.5" fill="#e2e8f0"/>
  <circle cx="660" cy="225" r="3.5" fill="#e2e8f0"/>
  <line x1="660" y1="105" x2="660" y2="128" stroke="#e2e8f0" stroke-width="2.5"/>
  <polyline points="660,128 648,136 672,148 648,160 672,172 648,184 672,196 660,204" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="660" y1="204" x2="660" y2="225" stroke="#e2e8f0" stroke-width="2.5"/>
  <text x="684" y="168" fill="#f59e0b" font-size="14" font-weight="700" font-family="serif" font-style="italic">R</text>

  <!-- 端口 a, b -->
  <circle cx="805" cy="105" r="5" fill="#0f172a" stroke="#f8fafc" stroke-width="2.5"/>
  <circle cx="805" cy="225" r="5" fill="#0f172a" stroke="#f8fafc" stroke-width="2.5"/>
  <text x="816" y="109" fill="#f8fafc" font-size="14" font-weight="700" font-family="serif" font-style="italic">a</text>
  <text x="816" y="229" fill="#f8fafc" font-size="14" font-weight="700" font-family="serif" font-style="italic">b</text>
  <text x="762" y="168" fill="#cbd5e1" font-size="13" text-anchor="middle" font-family="serif" font-style="italic">i_sc = i_s</text>

  <!-- 底部警示条 -->
  <rect x="35" y="282" width="790" height="28" rx="6" fill="#451a03" stroke="#f59e0b" stroke-width="1"/>
  <text x="430" y="300" fill="#fde68a" font-size="12" font-weight="600" text-anchor="middle" font-family="sans-serif">⚠ 边界铁律：理想电压源 (R = 0) 与理想电流源 (R = ∞) 无法直接电源变换；且两盒内部电阻的功耗并不等效！</text>
</svg>`;

const SVG_ACT2_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 330" width="100%" role="img" aria-label="电压源极性与电流源箭头方向一一对应图">
  <defs>
    <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#22c55e"/>
    </marker>
    <marker id="arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444"/>
    </marker>
  </defs>
  <rect width="860" height="330" rx="12" fill="#0f172a"/>
  <text x="430" y="28" fill="#f8fafc" font-size="15" font-weight="700" text-anchor="middle" font-family="sans-serif">方向铁律：电流源箭头必须指向电压源的正极（+）端口</text>

  <!-- 情况 1：正极朝上 ↔ 箭头朝上 -->
  <rect x="30" y="45" width="800" height="122" rx="8" fill="#1e293b" stroke="#22c55e" stroke-width="1.5"/>
  <text x="50" y="68" fill="#86efac" font-size="13" font-weight="700" font-family="sans-serif">情形一：电压源 + 极朝向端口 a（上方） ⟺ 电流源箭头向上指向端口 a</text>

  <!-- 左图：上正下负 -->
  <line x1="120" y1="150" x2="120" y2="132" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="120" cy="112" r="20" fill="#0f172a" stroke="#22c55e" stroke-width="2.2"/>
  <text x="120" y="108" fill="#22c55e" font-size="16" font-weight="700" text-anchor="middle" font-family="monospace">+</text>
  <text x="120" y="126" fill="#94a3b8" font-size="16" font-weight="700" text-anchor="middle" font-family="monospace">−</text>
  <line x1="120" y1="92" x2="120" y2="82" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="120" y1="82" x2="175" y2="82" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="175,82 182,73 192,91 202,73 212,91 222,73 230,82" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="230" y1="82" x2="290" y2="82" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="120" y1="150" x2="290" y2="150" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="290" cy="82" r="4" fill="#22c55e"/>
  <circle cx="290" cy="150" r="4" fill="#94a3b8"/>
  <text x="302" y="86" fill="#86efac" font-size="13" font-weight="700">a (+)</text>
  <text x="302" y="154" fill="#94a3b8" font-size="13">b</text>
  <text x="86" y="116" fill="#cbd5e1" font-size="13" text-anchor="end" font-family="serif" font-style="italic">v_s</text>
  <text x="202" y="70" fill="#f59e0b" font-size="12" text-anchor="middle" font-family="serif" font-style="italic">R</text>

  <text x="430" y="122" fill="#22c55e" font-size="22" font-weight="700" text-anchor="middle">⟺</text>

  <!-- 右图：箭头朝上 -->
  <line x1="560" y1="150" x2="560" y2="132" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="560" cy="112" r="20" fill="#0f172a" stroke="#22c55e" stroke-width="2.2"/>
  <line x1="560" y1="126" x2="560" y2="99" stroke="#22c55e" stroke-width="2.8" marker-end="url(#arr-green)"/>
  <line x1="560" y1="92" x2="560" y2="82" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="560" y1="82" x2="730" y2="82" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="560" y1="150" x2="730" y2="150" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="645" y1="82" x2="645" y2="94" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="645,94 636,100 654,108 636,116 654,124 636,132 645,138" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="645" y1="138" x2="645" y2="150" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="730" cy="82" r="4" fill="#22c55e"/>
  <circle cx="730" cy="150" r="4" fill="#94a3b8"/>
  <text x="742" y="86" fill="#86efac" font-size="13" font-weight="700">a (↑)</text>
  <text x="742" y="154" fill="#94a3b8" font-size="13">b</text>
  <text x="526" y="116" fill="#cbd5e1" font-size="13" text-anchor="end" font-family="serif" font-style="italic">i_s</text>
  <text x="666" y="120" fill="#f59e0b" font-size="12" font-family="serif" font-style="italic">R</text>

  <!-- 情况 2：正极朝下 ↔ 箭头朝下（高频易错！） -->
  <rect x="30" y="182" width="800" height="128" rx="8" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
  <text x="50" y="205" fill="#fca5a5" font-size="13" font-weight="700" font-family="sans-serif">情形二（高频陷阱！）：电压源 + 极朝向端口 b（下方） ⟺ 电流源箭头必须向下指向端口 b</text>

  <!-- 左图：上负下正 -->
  <line x1="120" y1="292" x2="120" y2="274" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="120" cy="254" r="20" fill="#0f172a" stroke="#ef4444" stroke-width="2.2"/>
  <text x="120" y="250" fill="#94a3b8" font-size="16" font-weight="700" text-anchor="middle" font-family="monospace">−</text>
  <text x="120" y="269" fill="#ef4444" font-size="16" font-weight="700" text-anchor="middle" font-family="monospace">+</text>
  <line x1="120" y1="234" x2="120" y2="224" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="120" y1="224" x2="175" y2="224" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="175,224 182,215 192,233 202,215 212,233 222,215 230,224" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="230" y1="224" x2="290" y2="224" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="120" y1="292" x2="290" y2="292" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="290" cy="224" r="4" fill="#94a3b8"/>
  <circle cx="290" cy="292" r="4" fill="#ef4444"/>
  <text x="302" y="228" fill="#94a3b8" font-size="13">a (−)</text>
  <text x="302" y="296" fill="#fca5a5" font-size="13" font-weight="700">b (+)</text>
  <text x="86" y="258" fill="#cbd5e1" font-size="13" text-anchor="end" font-family="serif" font-style="italic">v_s</text>
  <text x="202" y="212" fill="#f59e0b" font-size="12" text-anchor="middle" font-family="serif" font-style="italic">R</text>

  <text x="430" y="264" fill="#ef4444" font-size="22" font-weight="700" text-anchor="middle">⟺</text>

  <!-- 右图：箭头朝下 -->
  <line x1="560" y1="292" x2="560" y2="274" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="560" cy="254" r="20" fill="#0f172a" stroke="#ef4444" stroke-width="2.2"/>
  <line x1="560" y1="240" x2="560" y2="267" stroke="#ef4444" stroke-width="2.8" marker-end="url(#arr-red)"/>
  <line x1="560" y1="234" x2="560" y2="224" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="560" y1="224" x2="730" y2="224" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="560" y1="292" x2="730" y2="292" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="645" y1="224" x2="645" y2="236" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="645,236 636,242 654,250 636,258 654,266 636,274 645,280" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="645" y1="280" x2="645" y2="292" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="730" cy="224" r="4" fill="#94a3b8"/>
  <circle cx="730" cy="292" r="4" fill="#ef4444"/>
  <text x="742" y="228" fill="#94a3b8" font-size="13">a</text>
  <text x="742" y="296" fill="#fca5a5" font-size="13" font-weight="700">b (↓)</text>
  <text x="526" y="258" fill="#cbd5e1" font-size="13" text-anchor="end" font-family="serif" font-style="italic">i_s</text>
  <text x="666" y="262" fill="#f59e0b" font-size="12" font-family="serif" font-style="italic">R</text>
</svg>`;

const SVG_ACT3_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 480" width="100%" role="img" aria-label="Sadiku 4.4 多电源网络四步电源变换逐级化简演变图">
  <defs>
    <marker id="a-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="a-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444"/>
    </marker>
    <marker id="a-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#22c55e"/>
    </marker>
  </defs>
  <rect width="900" height="480" rx="12" fill="#0f172a"/>
  <text x="450" y="28" fill="#f8fafc" font-size="15" font-weight="700" text-anchor="middle" font-family="sans-serif">Sadiku 4.4 经典实战：交替电源变换 + 串并联折叠求 v_o（红框隔离 8Ω 目标支路）</text>

  <!-- Stage 0: 原电路 -->
  <rect x="20" y="42" width="420" height="200" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
  <text x="35" y="64" fill="#38bdf8" font-size="12" font-weight="700">阶段 0：原始多电源网络（锁定红框 8Ω）</text>
  <!-- 顶线与底线 -->
  <line x1="65" y1="100" x2="105" y2="100" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="105,100 110,92 118,108 126,92 134,108 142,92 148,100" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <text x="126" y="86" fill="#f59e0b" font-size="11" text-anchor="middle">3Ω</text>
  <line x1="148" y1="100" x2="235" y2="100" stroke="#e2e8f0" stroke-width="2"/>
  <!-- 2Ω 桥电阻 -->
  <polyline points="235,100 240,92 248,108 256,92 264,108 272,92 278,100" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <text x="256" y="86" fill="#f59e0b" font-size="11" text-anchor="middle">2Ω</text>
  <line x1="278" y1="100" x2="395" y2="100" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="65" y1="210" x2="395" y2="210" stroke="#e2e8f0" stroke-width="2"/>

  <!-- 左侧 -12V 源（上负下正！） -->
  <line x1="65" y1="100" x2="65" y2="135" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="65" cy="155" r="18" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
  <text x="65" y="151" fill="#94a3b8" font-size="14" font-weight="700" text-anchor="middle">−</text>
  <text x="65" y="168" fill="#ef4444" font-size="14" font-weight="700" text-anchor="middle">+</text>
  <line x1="65" y1="173" x2="65" y2="210" stroke="#e2e8f0" stroke-width="2"/>
  <text x="42" y="159" fill="#fca5a5" font-size="11" text-anchor="end">12V</text>

  <!-- 中间红框保护：8Ω (v_o) -->
  <rect x="165" y="108" width="58" height="94" rx="5" fill="#450a0a" fill-opacity="0.45" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4,3"/>
  <line x1="188" y1="100" x2="188" y2="128" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="188,128 180,134 196,142 180,150 196,158 180,166 196,174 188,180" fill="none" stroke="#f8fafc" stroke-width="2"/>
  <line x1="188" y1="180" x2="188" y2="210" stroke="#e2e8f0" stroke-width="2"/>
  <text x="208" y="128" fill="#fca5a5" font-size="11" font-weight="700">+</text>
  <text x="210" y="158" fill="#f8fafc" font-size="11" font-weight="700">8Ω</text>
  <text x="210" y="172" fill="#fca5a5" font-size="11" font-style="italic">v_o</text>
  <text x="208" y="195" fill="#fca5a5" font-size="11" font-weight="700">−</text>

  <!-- 右侧 4Ω || 3A(↑) -->
  <line x1="320" y1="100" x2="320" y2="128" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="320,128 312,134 328,142 312,150 328,158 312,166 328,174 320,180" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <line x1="320" y1="180" x2="320" y2="210" stroke="#e2e8f0" stroke-width="2"/>
  <text x="303" y="158" fill="#f59e0b" font-size="11" text-anchor="end">4Ω</text>

  <line x1="395" y1="100" x2="395" y2="135" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="395" cy="155" r="18" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <line x1="395" y1="167" x2="395" y2="143" stroke="#22c55e" stroke-width="2.5" marker-end="url(#a-green)"/>
  <line x1="395" y1="173" x2="395" y2="210" stroke="#e2e8f0" stroke-width="2"/>
  <text x="418" y="159" fill="#86efac" font-size="11">3A</text>

  <!-- Stage 1: 右侧变换并串联合并 4+2=6Ω -->
  <rect x="460" y="42" width="420" height="200" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
  <text x="475" y="64" fill="#38bdf8" font-size="12" font-weight="700">阶段 1：右侧 3A↑∥4Ω → 12V 串 4Ω，合并 2+4 = 6Ω</text>
  <line x1="505" y1="100" x2="545" y2="100" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="545,100 550,92 558,108 566,92 574,108 582,92 588,100" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <text x="566" y="86" fill="#f59e0b" font-size="11" text-anchor="middle">3Ω</text>
  <line x1="588" y1="100" x2="695" y2="100" stroke="#e2e8f0" stroke-width="2"/>
  <!-- 合并后的 6Ω -->
  <polyline points="695,100 700,92 708,108 716,92 724,108 732,92 738,100" fill="none" stroke="#22c55e" stroke-width="2.2"/>
  <text x="716" y="86" fill="#86efac" font-size="11" font-weight="700" text-anchor="middle">6Ω (2+4)</text>
  <line x1="738" y1="100" x2="820" y2="100" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="505" y1="210" x2="820" y2="210" stroke="#e2e8f0" stroke-width="2"/>

  <!-- 左侧 -12V -->
  <line x1="505" y1="100" x2="505" y2="135" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="505" cy="155" r="18" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
  <text x="505" y="151" fill="#94a3b8" font-size="14" font-weight="700" text-anchor="middle">−</text>
  <text x="505" y="168" fill="#ef4444" font-size="14" font-weight="700" text-anchor="middle">+</text>
  <line x1="505" y1="173" x2="505" y2="210" stroke="#e2e8f0" stroke-width="2"/>
  <text x="482" y="159" fill="#fca5a5" font-size="11" text-anchor="end">12V</text>

  <!-- 红框 8Ω -->
  <rect x="615" y="108" width="58" height="94" rx="5" fill="#450a0a" fill-opacity="0.45" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4,3"/>
  <line x1="638" y1="100" x2="638" y2="128" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="638,128 630,134 646,142 630,150 646,158 630,166 646,174 638,180" fill="none" stroke="#f8fafc" stroke-width="2"/>
  <line x1="638" y1="180" x2="638" y2="210" stroke="#e2e8f0" stroke-width="2"/>
  <text x="660" y="158" fill="#f8fafc" font-size="11" font-weight="700">8Ω</text>
  <text x="660" y="172" fill="#fca5a5" font-size="11" font-style="italic">v_o</text>

  <!-- 右侧 +12V -->
  <line x1="820" y1="100" x2="820" y2="135" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="820" cy="155" r="18" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <text x="820" y="151" fill="#22c55e" font-size="14" font-weight="700" text-anchor="middle">+</text>
  <text x="820" y="168" fill="#94a3b8" font-size="14" font-weight="700" text-anchor="middle">−</text>
  <line x1="820" y1="173" x2="820" y2="210" stroke="#e2e8f0" stroke-width="2"/>
  <text x="844" y="159" fill="#86efac" font-size="11">12V</text>

  <!-- Stage 2: 左右同时变回电流源 -->
  <rect x="20" y="262" width="420" height="200" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
  <text x="35" y="284" fill="#38bdf8" font-size="12" font-weight="700">阶段 2：左右全转电流源（4A↓∥3Ω 与 2A↑∥6Ω）</text>
  <line x1="65" y1="318" x2="395" y2="318" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="65" y1="430" x2="395" y2="430" stroke="#e2e8f0" stroke-width="2"/>

  <!-- 左：4A↓ -->
  <line x1="65" y1="318" x2="65" y2="354" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="65" cy="374" r="18" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
  <line x1="65" y1="362" x2="65" y2="386" stroke="#ef4444" stroke-width="2.5" marker-end="url(#a-red)"/>
  <line x1="65" y1="392" x2="65" y2="430" stroke="#e2e8f0" stroke-width="2"/>
  <text x="42" y="378" fill="#fca5a5" font-size="11" text-anchor="end">4A↓</text>

  <!-- 3Ω -->
  <line x1="130" y1="318" x2="130" y2="346" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="130,346 122,352 138,360 122,368 138,376 122,384 138,392 130,398" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <line x1="130" y1="398" x2="130" y2="430" stroke="#e2e8f0" stroke-width="2"/>
  <text x="148" y="378" fill="#f59e0b" font-size="11">3Ω</text>

  <!-- 红框 8Ω -->
  <rect x="195" y="326" width="58" height="96" rx="5" fill="#450a0a" fill-opacity="0.45" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4,3"/>
  <line x1="218" y1="318" x2="218" y2="346" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="218,346 210,352 226,360 210,368 226,376 210,384 226,392 218,398" fill="none" stroke="#f8fafc" stroke-width="2"/>
  <line x1="218" y1="398" x2="218" y2="430" stroke="#e2e8f0" stroke-width="2"/>
  <text x="239" y="376" fill="#f8fafc" font-size="11" font-weight="700">8Ω</text>
  <text x="239" y="390" fill="#fca5a5" font-size="11" font-style="italic">v_o</text>

  <!-- 6Ω -->
  <line x1="315" y1="318" x2="315" y2="346" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="315,346 307,352 323,360 307,368 323,376 307,384 323,392 315,398" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <line x1="315" y1="398" x2="315" y2="430" stroke="#e2e8f0" stroke-width="2"/>
  <text x="333" y="378" fill="#f59e0b" font-size="11">6Ω</text>

  <!-- 右：2A↑ -->
  <line x1="395" y1="318" x2="395" y2="354" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="395" cy="374" r="18" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
  <line x1="395" y1="386" x2="395" y2="362" stroke="#22c55e" stroke-width="2.5" marker-end="url(#a-green)"/>
  <line x1="395" y1="392" x2="395" y2="430" stroke="#e2e8f0" stroke-width="2"/>
  <text x="418" y="378" fill="#86efac" font-size="11">2A↑</text>

  <!-- Stage 3: 终极合并单并联回路 -->
  <rect x="460" y="262" width="420" height="200" rx="8" fill="#1e293b" stroke="#22c55e" stroke-width="2"/>
  <text x="475" y="284" fill="#86efac" font-size="12" font-weight="700">阶段 3：合并电流源 (4↓−2↑=2A↓) 与电阻 (3∥6=2Ω)</text>
  <line x1="540" y1="318" x2="770" y2="318" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="540" y1="430" x2="770" y2="430" stroke="#e2e8f0" stroke-width="2"/>

  <!-- 2A↓ -->
  <line x1="540" y1="318" x2="540" y2="354" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="540" cy="374" r="18" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
  <line x1="540" y1="362" x2="540" y2="386" stroke="#ef4444" stroke-width="2.5" marker-end="url(#a-red)"/>
  <line x1="540" y1="392" x2="540" y2="430" stroke="#e2e8f0" stroke-width="2"/>
  <text x="512" y="378" fill="#fca5a5" font-size="12" font-weight="700" text-anchor="end">2A↓</text>

  <!-- 2Ω -->
  <line x1="650" y1="318" x2="650" y2="346" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="650,346 642,352 658,360 642,368 658,376 642,384 658,392 650,398" fill="none" stroke="#38bdf8" stroke-width="2.2"/>
  <line x1="650" y1="398" x2="650" y2="430" stroke="#e2e8f0" stroke-width="2"/>
  <text x="670" y="378" fill="#38bdf8" font-size="12" font-weight="700">2Ω</text>

  <!-- 红框 8Ω -->
  <rect x="745" y="326" width="66" height="96" rx="5" fill="#450a0a" fill-opacity="0.45" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4,3"/>
  <line x1="770" y1="318" x2="770" y2="346" stroke="#e2e8f0" stroke-width="2"/>
  <polyline points="770,346 762,352 778,360 762,368 778,376 762,384 778,392 770,398" fill="none" stroke="#f8fafc" stroke-width="2.2"/>
  <line x1="770" y1="398" x2="770" y2="430" stroke="#e2e8f0" stroke-width="2"/>
  <text x="795" y="346" fill="#fca5a5" font-size="12" font-weight="700">+</text>
  <text x="794" y="374" fill="#f8fafc" font-size="12" font-weight="700">8Ω</text>
  <text x="794" y="390" fill="#86efac" font-size="12" font-weight="700" font-style="italic">v_o</text>
  <text x="795" y="414" fill="#fca5a5" font-size="12" font-weight="700">−</text>

  <text x="670" y="452" fill="#86efac" font-size="13" font-weight="700" text-anchor="middle" font-family="monospace">v_o = −2 A × (2Ω ∥ 8Ω) = −2 × 1.6 = −3.2 V</text>
</svg>`;

const SVG_ACT4_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 280" width="100%" role="img" aria-label="受控源电源变换示意图：红框隔离控制变量 vx 支路">
  <defs>
    <marker id="ag" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#22c55e"/>
    </marker>
    <marker id="ac" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
  </defs>
  <rect width="860" height="280" rx="12" fill="#0f172a"/>
  <text x="430" y="28" fill="#f8fafc" font-size="15" font-weight="700" text-anchor="middle" font-family="sans-serif">受控源变换铁律：红框锁死控制变量 v_x 支路，仅变换右侧受控源支路</text>

  <!-- 左图：原电路 -->
  <rect x="24" y="45" width="380" height="215" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
  <text x="40" y="66" fill="#38bdf8" font-size="12" font-weight="700">原电路（求 v_x）</text>

  <!-- 红框隔离区：左侧 16V + 2Ω (v_x) -->
  <rect x="38" y="76" width="190" height="168" rx="6" fill="#450a0a" fill-opacity="0.4" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,4"/>
  <g transform="translate(72 88)"><path d="M -3.2 -1 V -3.6 A 3.2 3.2 0 0 1 3.2 -3.6 V -1" fill="none" stroke="#fca5a5" stroke-width="1.6"/><rect x="-4.6" y="-1.2" width="9.2" height="7.2" rx="1.4" fill="#fca5a5"/></g>
  <text x="138" y="92" fill="#fca5a5" font-size="11" font-weight="700" text-anchor="middle">红框隔离区：严禁变换</text>

  <line x1="78" y1="226" x2="78" y2="188" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="78" cy="166" r="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="78" y="162" fill="#f8fafc" font-size="15" font-weight="700" text-anchor="middle">+</text>
  <text x="78" y="180" fill="#94a3b8" font-size="15" font-weight="700" text-anchor="middle">−</text>
  <text x="53" y="170" fill="#38bdf8" font-size="12" text-anchor="end">16V</text>

  <line x1="78" y1="146" x2="78" y2="115" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="78" y1="115" x2="128" y2="115" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="128,115 134,106 144,124 154,106 164,124 174,106 182,115" fill="none" stroke="#f8fafc" stroke-width="2.2"/>
  <text x="128" y="138" fill="#fca5a5" font-size="12" font-weight="700">+</text>
  <text x="155" y="139" fill="#fca5a5" font-size="12" font-weight="700" font-style="italic">v_x</text>
  <text x="178" y="138" fill="#fca5a5" font-size="12" font-weight="700">−</text>
  <text x="155" y="103" fill="#f59e0b" font-size="12" text-anchor="middle">2Ω</text>

  <!-- 右侧可变换区：4Ω || 0.25 v_x (↑) -->
  <line x1="182" y1="115" x2="360" y2="115" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="78" y1="226" x2="360" y2="226" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="275" y1="115" x2="275" y2="142" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="275,142 267,148 283,156 267,164 283,172 267,180 283,188 275,194" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="275" y1="194" x2="275" y2="226" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="260" y="172" fill="#f59e0b" font-size="12" text-anchor="end">4Ω</text>

  <!-- 菱形受控电流源 -->
  <line x1="360" y1="115" x2="360" y2="144" stroke="#e2e8f0" stroke-width="2.2"/>
  <polygon points="360,144 382,168 360,192 338,168" fill="#0f172a" stroke="#22c55e" stroke-width="2.2"/>
  <line x1="360" y1="182" x2="360" y2="154" stroke="#22c55e" stroke-width="2.4" marker-end="url(#ag)"/>
  <line x1="360" y1="192" x2="360" y2="226" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="360" y="244" fill="#86efac" font-size="12" font-weight="700" text-anchor="middle">0.25 v_x (↑)</text>

  <!-- 中间箭头 -->
  <line x1="414" y1="152" x2="452" y2="152" stroke="#38bdf8" stroke-width="2.8" marker-end="url(#ac)"/>
  <text x="433" y="140" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">右侧</text>
  <text x="433" y="172" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">变换</text>

  <!-- 右图：单回路 -->
  <rect x="464" y="45" width="372" height="215" rx="8" fill="#1e293b" stroke="#22c55e" stroke-width="1.8"/>
  <text x="480" y="66" fill="#86efac" font-size="12" font-weight="700">变换后：单回路 KVL（v_d = 0.25 v_x × 4 = v_x）</text>

  <!-- 红框保持 -->
  <rect x="478" y="76" width="180" height="168" rx="6" fill="#450a0a" fill-opacity="0.35" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="5,4"/>
  <line x1="518" y1="226" x2="518" y2="188" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="518" cy="166" r="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="518" y="162" fill="#f8fafc" font-size="15" font-weight="700" text-anchor="middle">+</text>
  <text x="518" y="180" fill="#94a3b8" font-size="15" font-weight="700" text-anchor="middle">−</text>
  <text x="494" y="170" fill="#38bdf8" font-size="12" text-anchor="end">16V</text>

  <line x1="518" y1="146" x2="518" y2="115" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="518" y1="115" x2="562" y2="115" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="562,115 568,106 578,124 588,106 598,124 608,106 616,115" fill="none" stroke="#f8fafc" stroke-width="2.2"/>
  <text x="589" y="103" fill="#f59e0b" font-size="12" text-anchor="middle">2Ω</text>
  <text x="589" y="139" fill="#fca5a5" font-size="12" font-weight="700" text-anchor="middle">+ v_x −</text>

  <!-- 串联的 4Ω -->
  <line x1="616" y1="115" x2="682" y2="115" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="682,115 688,106 698,124 708,106 718,124 728,106 736,115" fill="none" stroke="#22c55e" stroke-width="2.2"/>
  <text x="709" y="103" fill="#86efac" font-size="12" text-anchor="middle">4Ω</text>
  <line x1="736" y1="115" x2="788" y2="115" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="518" y1="226" x2="788" y2="226" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- 菱形受控电压源 v_x（上正下负） -->
  <line x1="788" y1="115" x2="788" y2="144" stroke="#e2e8f0" stroke-width="2.2"/>
  <polygon points="788,144 810,168 788,192 766,168" fill="#0f172a" stroke="#22c55e" stroke-width="2.2"/>
  <text x="788" y="164" fill="#22c55e" font-size="14" font-weight="700" text-anchor="middle">+</text>
  <text x="788" y="182" fill="#94a3b8" font-size="14" font-weight="700" text-anchor="middle">−</text>
  <line x1="788" y1="192" x2="788" y2="226" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="788" y="244" fill="#86efac" font-size="12" font-weight="700" text-anchor="middle">v_d = v_x</text>
</svg>`;

const SVG_ACT5_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 230" width="100%" role="img" aria-label="苏格拉底引导例题原电路图：求最右侧 12 欧姆电阻电流 io">
  <defs>
    <marker id="g-up" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#22c55e"/>
    </marker>
    <marker id="r-dn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444"/>
    </marker>
    <marker id="c-dn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
  </defs>
  <rect width="820" height="230" rx="12" fill="#0f172a"/>
  <text x="410" y="26" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle" font-family="sans-serif">引导实战：使用多级电源变换求右侧 12Ω 电阻支路电流 i_o</text>

  <!-- 顶线与底线 -->
  <line x1="85" y1="68" x2="255" y2="68" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="255,68 262,58 272,78 282,58 292,78 302,58 310,68" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <text x="282" y="50" fill="#f59e0b" font-size="12" text-anchor="middle">4Ω</text>
  <line x1="310" y1="68" x2="705" y2="68" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="85" y1="192" x2="705" y2="192" stroke="#e2e8f0" stroke-width="2.2"/>

  <!-- 6A↑ -->
  <line x1="85" y1="68" x2="85" y2="108" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="85" cy="130" r="22" fill="#0f172a" stroke="#22c55e" stroke-width="2.2"/>
  <line x1="85" y1="144" x2="85" y2="116" stroke="#22c55e" stroke-width="2.6" marker-end="url(#g-up)"/>
  <line x1="85" y1="152" x2="85" y2="192" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="54" y="135" fill="#86efac" font-size="13" font-weight="700" text-anchor="end">6A</text>

  <!-- 4Ω 并联 -->
  <line x1="185" y1="68" x2="185" y2="100" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="185,100 176,107 194,116 176,125 194,134 176,143 194,152 185,159" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="185" y1="159" x2="185" y2="192" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="206" y="135" fill="#f59e0b" font-size="12">4Ω</text>

  <!-- 1A↓ -->
  <line x1="415" y1="68" x2="415" y2="108" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="415" cy="130" r="22" fill="#0f172a" stroke="#ef4444" stroke-width="2.2"/>
  <line x1="415" y1="116" x2="415" y2="144" stroke="#ef4444" stroke-width="2.6" marker-end="url(#r-dn)"/>
  <line x1="415" y1="152" x2="415" y2="192" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="385" y="135" fill="#fca5a5" font-size="13" font-weight="700" text-anchor="end">1A</text>

  <!-- 8Ω 并联 -->
  <line x1="540" y1="68" x2="540" y2="100" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="540,100 531,107 549,116 531,125 549,134 531,143 549,152 540,159" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="540" y1="159" x2="540" y2="192" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="560" y="135" fill="#f59e0b" font-size="12">8Ω</text>

  <!-- 红框保护：12Ω (i_o) -->
  <rect x="665" y="78" width="95" height="106" rx="6" fill="#450a0a" fill-opacity="0.45" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,4"/>
  <line x1="705" y1="68" x2="705" y2="100" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="705" y1="74" x2="705" y2="94" stroke="#38bdf8" stroke-width="2.4" marker-end="url(#c-dn)"/>
  <text x="722" y="92" fill="#38bdf8" font-size="12" font-weight="700" font-style="italic">i_o</text>
  <polyline points="705,100 696,107 714,116 696,125 714,134 696,143 714,152 705,159" fill="none" stroke="#f8fafc" stroke-width="2.2"/>
  <line x1="705" y1="159" x2="705" y2="192" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="724" y="136" fill="#f8fafc" font-size="12" font-weight="700">12Ω</text>
  <g transform="translate(676 208)"><path d="M -3.2 -1 V -3.6 A 3.2 3.2 0 0 1 3.2 -3.6 V -1" fill="none" stroke="#fca5a5" stroke-width="1.6"/><rect x="-4.6" y="-1.2" width="9.2" height="7.2" rx="1.4" fill="#fca5a5"/></g>
  <text x="716" y="212" fill="#fca5a5" font-size="11" font-weight="700" text-anchor="middle">红框保护支路</text>
</svg>`;

const MINI_1_DARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='100%'><rect width='360' height='110' rx='8' fill='#0f172a'/><circle cx='55' cy='55' r='18' fill='#1e293b' stroke='#22c55e' stroke-width='2'/><text x='55' y='60' fill='#86efac' font-size='12' text-anchor='middle'>6A↑</text><text x='110' y='60' fill='#f59e0b' font-size='12' text-anchor='middle'>∥ 4Ω</text><text x='180' y='60' fill='#38bdf8' font-size='16' font-weight='700' text-anchor='middle'>⇒</text><circle cx='245' cy='55' r='18' fill='#1e293b' stroke='#38bdf8' stroke-width='2'/><text x='245' y='60' fill='#f8fafc' font-size='12' text-anchor='middle'>v_s1?</text><text x='308' y='60' fill='#f59e0b' font-size='12' text-anchor='middle'>串 4Ω</text></svg>`;

const MINI_2_DARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='100%'><rect width='360' height='110' rx='8' fill='#0f172a'/><text x='55' y='60' fill='#38bdf8' font-size='12' text-anchor='middle'>24V(+上)</text><text x='135' y='60' fill='#f59e0b' font-size='12' text-anchor='middle'>— 4Ω — 4Ω —</text><text x='225' y='60' fill='#38bdf8' font-size='16' font-weight='700' text-anchor='middle'>⇒</text><text x='300' y='60' fill='#86efac' font-size='12' text-anchor='middle'>24V 串 R_eq1?</text></svg>`;

const MINI_3_DARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='100%'><rect width='360' height='110' rx='8' fill='#0f172a'/><text x='85' y='60' fill='#38bdf8' font-size='12' text-anchor='middle'>24V(+上) 串 8Ω</text><text x='180' y='60' fill='#22c55e' font-size='16' font-weight='700' text-anchor='middle'>⇒</text><text x='275' y='60' fill='#86efac' font-size='12' text-anchor='middle'>i_s2? ∥ 8Ω</text></svg>`;

const MINI_4_DARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='100%'><rect width='360' height='110' rx='8' fill='#0f172a'/><text x='100' y='48' fill='#86efac' font-size='11' text-anchor='middle'>3A↑ ∥ 8Ω ∥ 1A↓ ∥ 8Ω</text><g transform='translate(48 70)'><path d='M -3.2 -1 V -3.6 A 3.2 3.2 0 0 1 3.2 -3.6 V -1' fill='none' stroke='#fca5a5' stroke-width='1.6'/><rect x='-4.6' y='-1.2' width='9.2' height='7.2' rx='1.4' fill='#fca5a5'/></g><text x='104' y='74' fill='#fca5a5' font-size='11' text-anchor='middle'>[ 12Ω (i_o) 隔离 ]</text><text x='205' y='60' fill='#38bdf8' font-size='16' font-weight='700' text-anchor='middle'>⇒</text><text x='290' y='60' fill='#f8fafc' font-size='12' text-anchor='middle'>i_net? ∥ R_p?</text></svg>`;

const MINI_5_DARK = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='100%'><rect width='360' height='110' rx='8' fill='#0f172a'/><text x='75' y='60' fill='#86efac' font-size='13' font-weight='700' text-anchor='middle'>2A↑</text><text x='165' y='60' fill='#f59e0b' font-size='13' text-anchor='middle'>∥ 4Ω</text><rect x='220' y='26' width='115' height='58' rx='6' fill='#450a0a' fill-opacity='0.45' stroke='#ef4444' stroke-width='1.5' stroke-dasharray='4,3'/><text x='277' y='60' fill='#38bdf8' font-size='13' font-weight='700' text-anchor='middle'>12Ω (i_o ↓)</text></svg>`;

/* ------------------------------------------------------------- added diagrams (not in the sheet), drawn in its style */

/** Act 6: the four checkpoints the self-test probes (names only, no answers). */
const SVG_ACT6_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 260" width="100%" role="img" aria-label="电源变换四个检查点：极性、红框隔离、内部功耗、理想源边界">
  <rect width="860" height="260" rx="12" fill="#0f172a"/>
  <text x="430" y="30" fill="#f8fafc" font-size="15" font-weight="700" text-anchor="middle" font-family="sans-serif">动手变换前的四个检查点（随堂诊断测验 Q1–Q4）</text>
  <!-- centre: v_s series R  ⟺  i_s parallel R -->
  <rect x="270" y="56" width="320" height="150" rx="10" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
  <line x1="310" y1="170" x2="310" y2="146" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="310" cy="128" r="18" fill="#0f172a" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="310" y="124" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle" font-family="monospace">+</text>
  <text x="310" y="141" fill="#94a3b8" font-size="14" font-weight="700" text-anchor="middle" font-family="monospace">−</text>
  <line x1="310" y1="110" x2="310" y2="90" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="310" y1="90" x2="335" y2="90" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="335,90 341,81 351,99 361,81 371,99 377,90" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="377" y1="90" x2="400" y2="90" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="310" y1="170" x2="400" y2="170" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="400" cy="90" r="4" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <circle cx="400" cy="170" r="4" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <text x="430" y="135" fill="#22c55e" font-size="20" font-weight="700" text-anchor="middle">⟺</text>
  <line x1="470" y1="170" x2="470" y2="146" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="470" cy="128" r="18" fill="#0f172a" stroke="#22c55e" stroke-width="2.2"/>
  <line x1="470" y1="140" x2="470" y2="120" stroke="#22c55e" stroke-width="2.6"/>
  <polygon points="470,112 465,121 475,121" fill="#22c55e"/>
  <line x1="470" y1="110" x2="470" y2="90" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="470" y1="90" x2="560" y2="90" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="470" y1="170" x2="560" y2="170" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="515" y1="90" x2="515" y2="104" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="515,104 507,110 523,118 507,126 523,134 507,142 515,148" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="515" y1="148" x2="515" y2="170" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="560" cy="90" r="4" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <circle cx="560" cy="170" r="4" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <text x="430" y="196" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="sans-serif">端口 a–b 外部等效</text>
  <!-- four checkpoints -->
  <rect x="24" y="56" width="214" height="64" rx="8" fill="#082f49" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="40" y="80" fill="#7dd3fc" font-size="13" font-weight="700" font-family="sans-serif">Q1 · 极性</text>
  <text x="40" y="104" fill="#cbd5e1" font-size="11.5" font-family="sans-serif">箭头该指向哪一端？</text>
  <rect x="24" y="142" width="214" height="64" rx="8" fill="#450a0a" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="40" y="166" fill="#fca5a5" font-size="13" font-weight="700" font-family="sans-serif">Q2 · 红框隔离</text>
  <text x="40" y="190" fill="#cbd5e1" font-size="11.5" font-family="sans-serif">待求支路能不能卷进去？</text>
  <rect x="622" y="56" width="214" height="64" rx="8" fill="#451a03" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="638" y="80" fill="#fde68a" font-size="13" font-weight="700" font-family="sans-serif">Q3 · 内部功耗</text>
  <text x="638" y="104" fill="#cbd5e1" font-size="11.5" font-family="sans-serif">盒子里面也等效吗？</text>
  <rect x="622" y="142" width="214" height="64" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
  <text x="638" y="166" fill="#6ee7b7" font-size="13" font-weight="700" font-family="sans-serif">Q4 · 理想源边界</text>
  <text x="638" y="190" fill="#cbd5e1" font-size="11.5" font-family="sans-serif">R = 0 或 R = ∞ 时还能变吗？</text>
  <line x1="238" y1="88" x2="300" y2="118" stroke="#475569" stroke-width="1.4" stroke-dasharray="3,3"/>
  <line x1="238" y1="174" x2="270" y2="160" stroke="#475569" stroke-width="1.4" stroke-dasharray="3,3"/>
  <line x1="622" y1="88" x2="590" y2="100" stroke="#475569" stroke-width="1.4" stroke-dasharray="3,3"/>
  <line x1="622" y1="174" x2="590" y2="160" stroke="#475569" stroke-width="1.4" stroke-dasharray="3,3"/>
  <text x="430" y="238" fill="#94a3b8" font-size="12" text-anchor="middle" font-family="sans-serif">每道题对准一个高频误区：先自己判断，再看反馈</text>
</svg>`;

/** Q1: 15 V (− at a, + at b) in series with 5 Ω. */
const SVG_Q1_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 170" width="100%" role="img" aria-label="15 V 电压源（上负下正）串联 5 Ω，引出 a、b">
  <rect width="420" height="170" rx="10" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="11" font-weight="600" font-family="sans-serif">Q1 · 15 V（上 −，下 +）串联 5 Ω</text>
  <line x1="120" y1="146" x2="120" y2="116" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="120" cy="96" r="20" fill="#0f172a" stroke="#ef4444" stroke-width="2.2"/>
  <text x="120" y="92" fill="#94a3b8" font-size="15" font-weight="700" text-anchor="middle" font-family="monospace">−</text>
  <text x="120" y="111" fill="#ef4444" font-size="15" font-weight="700" text-anchor="middle" font-family="monospace">+</text>
  <text x="90" y="100" fill="#cbd5e1" font-size="12" text-anchor="end" font-family="monospace">15 V</text>
  <line x1="120" y1="76" x2="120" y2="50" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="120" y1="50" x2="180" y2="50" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="180,50 187,41 197,59 207,41 217,59 227,41 234,50" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <text x="207" y="36" fill="#f59e0b" font-size="12" text-anchor="middle" font-family="monospace">5 Ω</text>
  <line x1="234" y1="50" x2="300" y2="50" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="120" y1="146" x2="300" y2="146" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="300" cy="50" r="5" fill="#0f172a" stroke="#f8fafc" stroke-width="2.2"/>
  <circle cx="300" cy="146" r="5" fill="#0f172a" stroke="#f8fafc" stroke-width="2.2"/>
  <text x="312" y="54" fill="#f8fafc" font-size="14" font-weight="700" font-style="italic" font-family="serif">a</text>
  <text x="312" y="150" fill="#f8fafc" font-size="14" font-weight="700" font-style="italic" font-family="serif">b</text>
  <text x="360" y="104" fill="#38bdf8" font-size="18" font-weight="700" text-anchor="middle">⇒ ?</text>
</svg>`;

/** Q2: 2 A parallel 10 Ω, v_o across the 10 Ω, the rest of the circuit as a box. */
const SVG_Q2_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 170" width="100%" role="img" aria-label="2 A 电流源与待求 v_o 的 10 Ω 电阻直接并联">
  <rect width="420" height="170" rx="10" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="11" font-weight="600" font-family="sans-serif">Q2 · 2 A ∥ 10 Ω，待求 v_o 就在这颗 10 Ω 上</text>
  <rect x="24" y="48" width="110" height="98" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="79" y="102" fill="#94a3b8" font-size="12" text-anchor="middle" font-family="sans-serif">其余电路</text>
  <line x1="134" y1="58" x2="330" y2="58" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="134" y1="140" x2="330" y2="140" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="210" y1="58" x2="210" y2="80" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="210" cy="99" r="19" fill="#0f172a" stroke="#22c55e" stroke-width="2.2"/>
  <line x1="210" y1="110" x2="210" y2="92" stroke="#22c55e" stroke-width="2.6"/>
  <polygon points="210,85 205,94 215,94" fill="#22c55e"/>
  <line x1="210" y1="118" x2="210" y2="140" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="182" y="103" fill="#86efac" font-size="12" text-anchor="end" font-family="monospace">2 A</text>
  <circle cx="210" cy="58" r="3" fill="#e2e8f0"/>
  <circle cx="210" cy="140" r="3" fill="#e2e8f0"/>
  <line x1="300" y1="58" x2="300" y2="72" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="300,72 292,78 308,86 292,94 308,102 292,110 308,118 300,124" fill="none" stroke="#f8fafc" stroke-width="2.2"/>
  <line x1="300" y1="124" x2="300" y2="140" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="318" y="102" fill="#f8fafc" font-size="12" font-weight="700" font-family="monospace">10 Ω</text>
  <text x="352" y="78" fill="#fca5a5" font-size="12" font-weight="700" font-family="monospace">+</text>
  <text x="350" y="102" fill="#fca5a5" font-size="12" font-weight="700" font-style="italic" font-family="serif">v_o</text>
  <text x="352" y="128" fill="#fca5a5" font-size="12" font-weight="700" font-family="monospace">−</text>
</svg>`;

/** Q3: the two boxes of Q3 with open ports. */
const SVG_Q3_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 170" width="100%" role="img" aria-label="10 V 串联 5 Ω 与 2 A 并联 5 Ω，端口均开路">
  <rect width="420" height="170" rx="10" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="11" font-weight="600" font-family="sans-serif">Q3 · 两个黑盒，端口 a–b 都开路（不接负载）</text>
  <rect x="16" y="38" width="186" height="120" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="5,4"/>
  <line x1="46" y1="140" x2="46" y2="116" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="46" cy="98" r="17" fill="#0f172a" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="46" y="94" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle" font-family="monospace">+</text>
  <text x="46" y="110" fill="#94a3b8" font-size="13" font-weight="700" text-anchor="middle" font-family="monospace">−</text>
  <text x="70" y="102" fill="#7dd3fc" font-size="11" font-family="monospace">10 V</text>
  <line x1="46" y1="81" x2="46" y2="60" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="46" y1="60" x2="96" y2="60" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="96,60 102,52 110,68 118,52 126,68 134,52 140,60" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <text x="118" y="84" fill="#f59e0b" font-size="11" text-anchor="middle" font-family="monospace">5 Ω</text>
  <line x1="140" y1="60" x2="180" y2="60" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="46" y1="140" x2="180" y2="140" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="180" cy="60" r="4.5" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <circle cx="180" cy="140" r="4.5" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <text x="180" y="104" fill="#94a3b8" font-size="10" text-anchor="middle" font-family="sans-serif">开路</text>
  <rect x="218" y="38" width="186" height="120" rx="8" fill="#1e293b" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="5,4"/>
  <line x1="248" y1="140" x2="248" y2="116" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="248" cy="98" r="17" fill="#0f172a" stroke="#22c55e" stroke-width="2.2"/>
  <line x1="248" y1="108" x2="248" y2="92" stroke="#22c55e" stroke-width="2.4"/>
  <polygon points="248,85 243,94 253,94" fill="#22c55e"/>
  <text x="272" y="102" fill="#86efac" font-size="11" font-family="monospace">2 A</text>
  <line x1="248" y1="81" x2="248" y2="60" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="248" y1="60" x2="382" y2="60" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="248" y1="140" x2="382" y2="140" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="330" y1="60" x2="330" y2="72" stroke="#e2e8f0" stroke-width="2.2"/>
  <polyline points="330,72 322,78 338,86 322,94 338,102 322,110 338,118 330,124" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="330" y1="124" x2="330" y2="140" stroke="#e2e8f0" stroke-width="2.2"/>
  <text x="346" y="102" fill="#f59e0b" font-size="11" font-family="monospace">5 Ω</text>
  <circle cx="382" cy="60" r="4.5" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <circle cx="382" cy="140" r="4.5" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <text x="382" y="104" fill="#94a3b8" font-size="10" text-anchor="middle" font-family="sans-serif">开路</text>
</svg>`;

/** Q4: an ideal voltage source (no R) and an ideal current source (no R), each "⇒ ?". */
const SVG_Q4_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 170" width="100%" role="img" aria-label="理想电压源（R = 0）与理想电流源（R = ∞）">
  <rect width="420" height="170" rx="10" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="11" font-weight="600" font-family="sans-serif">Q4 · 没有任何内阻的两个理想源</text>
  <line x1="70" y1="146" x2="70" y2="116" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="70" cy="96" r="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="70" y="92" fill="#f8fafc" font-size="15" font-weight="700" text-anchor="middle" font-family="monospace">+</text>
  <text x="70" y="111" fill="#94a3b8" font-size="15" font-weight="700" text-anchor="middle" font-family="monospace">−</text>
  <line x1="70" y1="76" x2="70" y2="50" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="70" y1="50" x2="150" y2="50" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="70" y1="146" x2="150" y2="146" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="150" cy="50" r="4.5" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <circle cx="150" cy="146" r="4.5" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <text x="110" y="42" fill="#7dd3fc" font-size="11" text-anchor="middle" font-family="monospace">R = 0</text>
  <text x="180" y="102" fill="#38bdf8" font-size="16" font-weight="700" text-anchor="middle">⇒ ?</text>
  <line x1="270" y1="146" x2="270" y2="116" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="270" cy="96" r="20" fill="#0f172a" stroke="#22c55e" stroke-width="2.2"/>
  <line x1="270" y1="108" x2="270" y2="90" stroke="#22c55e" stroke-width="2.6"/>
  <polygon points="270,83 265,92 275,92" fill="#22c55e"/>
  <line x1="270" y1="76" x2="270" y2="50" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="270" y1="50" x2="350" y2="50" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="270" y1="146" x2="350" y2="146" stroke="#e2e8f0" stroke-width="2.2"/>
  <circle cx="350" cy="50" r="4.5" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <circle cx="350" cy="146" r="4.5" fill="#0f172a" stroke="#f8fafc" stroke-width="2"/>
  <text x="316" y="102" fill="#86efac" font-size="11" text-anchor="middle" font-family="monospace">R = ∞</text>
  <text x="380" y="102" fill="#38bdf8" font-size="16" font-weight="700" text-anchor="middle">⇒ ?</text>
</svg>`;

/* ------------------------------------------------------------- exports (light theme) */

export const SVG_ACT1 = lightSvg(SVG_ACT1_DARK);
export const SVG_ACT2 = lightSvg(SVG_ACT2_DARK);
export const SVG_ACT3 = lightSvg(SVG_ACT3_DARK);
export const SVG_ACT4 = lightSvg(SVG_ACT4_DARK);
export const SVG_ACT5 = lightSvg(SVG_ACT5_DARK);
export const SVG_ACT6 = lightSvg(SVG_ACT6_DARK);
export const MINI_STEPS = [MINI_1_DARK, MINI_2_DARK, MINI_3_DARK, MINI_4_DARK, MINI_5_DARK].map(lightSvg);
export const SVG_Q1 = lightSvg(SVG_Q1_DARK);
export const SVG_Q2 = lightSvg(SVG_Q2_DARK);
export const SVG_Q3 = lightSvg(SVG_Q3_DARK);
export const SVG_Q4 = lightSvg(SVG_Q4_DARK);
