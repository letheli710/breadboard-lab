// W1-L3 · 电阻、欧姆定律、电导与开路/短路极限 (lesson sheet: docs/lessons/W1-L3.md).
// The professor's text, formulas, the seven act diagrams, the guided example and the self-test
// are reproduced from the sheet as written; [[id|…]] only links a term to the stage (the words
// are unchanged). Hover ids use underscores (hl_geom_rho …) instead of the sheet's hyphens, which
// the inline link markup does not accept. Added here (the sheet has none): the guided example's
// hints and blackboard lines, its conclusion, and the self-test's wrong-answer feedback. The
// sheet's breadboard_safety_and_scaling section is shown in act 4, after the 324 Ω red line.
// Displayed formulas inside a sentence are set inline ($\displaystyle …$) so the sentence stays whole.

import { lazy } from 'react';
import type { StageLesson } from '../../types';

const Resistor3DLayer = lazy(() => import('./Resistor3D').then((m) => ({ default: m.Resistor3DLayer })));
const SchematicLayer = lazy(() => import('./Schematic').then((m) => ({ default: m.SchematicLayer })));
const VICurveLayer = lazy(() => import('./VICurve').then((m) => ({ default: m.VICurveLayer })));

/* ------------------------------------------------------------- act diagrams (from the sheet) */

const SVG_ACT1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 200" width="420" height="200">
  <defs>
    <marker id="arr-dark-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1e293b"/>
    </marker>
    <marker id="arr-blue-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
  </defs>
  <rect width="420" height="200" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="16" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#0f172a">导体几何模型 R = ρ(l / A) 与碳膜螺旋刻槽</text>

  <!-- 左侧：均匀圆柱导体模型 -->
  <ellipse cx="62" cy="98" rx="14" ry="30" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
  <path d="M 62 68 L 192 68 A 14 30 0 0 1 192 128 L 62 128" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
  <ellipse cx="192" cy="98" rx="14" ry="30" fill="#bfdbfe" stroke="#2563eb" stroke-width="2"/>
  <!-- 晶格原子与电子碰撞轨迹 -->
  <circle cx="96" cy="88" r="3.5" fill="#64748b"/>
  <circle cx="128" cy="108" r="3.5" fill="#64748b"/>
  <circle cx="158" cy="90" r="3.5" fill="#64748b"/>
  <path d="M 76 96 L 93 88 L 106 105 L 125 108 L 142 94 L 155 90 L 176 98" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="3,2" marker-end="url(#arr-blue-1)"/>
  <!-- 尺寸标注 l 和 A -->
  <line x1="62" y1="146" x2="192" y2="146" stroke="#1e293b" stroke-width="1.4" marker-start="url(#arr-dark-1)" marker-end="url(#arr-dark-1)"/>
  <text x="127" y="164" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#1e293b">长度 l（越长阻力越大）</text>
  <text x="192" y="57" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#2563eb">截面积 A</text>
  <text x="127" y="55" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#475569">材料电阻率 ρ</text>

  <!-- 分隔线 -->
  <line x1="232" y1="42" x2="232" y2="184" stroke="#e2e8f0" stroke-width="1.2" stroke-dasharray="4,3"/>

  <!-- 右侧：碳膜螺旋刻槽示意 -->
  <text x="326" y="54" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#0f172a">1/4 W 碳膜螺旋结构</text>
  <!-- 引脚与金属帽 -->
  <line x1="246" y1="102" x2="266" y2="102" stroke="#94a3b8" stroke-width="4"/>
  <line x1="386" y1="102" x2="406" y2="102" stroke="#94a3b8" stroke-width="4"/>
  <rect x="266" y="84" width="16" height="36" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/>
  <rect x="370" y="84" width="16" height="36" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/>
  <!-- 陶瓷+碳膜本体 -->
  <rect x="282" y="88" width="88" height="28" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <!-- 螺旋激光刻槽 -->
  <path d="M 290 88 L 298 116 M 304 88 L 312 116 M 318 88 L 326 116 M 332 88 L 340 116 M 346 88 L 354 116 M 360 88 L 366 116" stroke="#78350f" stroke-width="2.2"/>
  <!-- 底部说明 -->
  <text x="326" y="144" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#475569">激光螺旋槽拉长路径 l</text>
  <text x="326" y="160" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#475569">并压缩碳膜通道宽度 A</text>
  <text x="326" y="178" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#b45309">⇒ 轻松实现 kΩ ~ MΩ 级阻值</text>
</svg>`;

const SVG_ACT2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 200" width="420" height="200">
  <defs>
    <marker id="arr-green-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="arr-red-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
  </defs>
  <rect width="420" height="200" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="16" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#0f172a">无源符号约定（PSC）对比：v = +iR 与 v = −iR</text>

  <!-- 左侧卡片：PSC -->
  <rect x="14" y="38" width="190" height="148" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.3"/>
  <text x="109" y="57" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#065f46">情况 A：满足 PSC（进 + 出 −）</text>
  <!-- 导线与电阻锯齿 -->
  <line x1="28" y1="104" x2="66" y2="104" stroke="#1e293b" stroke-width="2"/>
  <polyline points="66,104 72,92 82,116 92,92 102,116 112,92 122,116 132,92 138,104" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
  <line x1="138" y1="104" x2="188" y2="104" stroke="#1e293b" stroke-width="2"/>
  <!-- 电流箭头 i1 从左进+ -->
  <line x1="30" y1="90" x2="58" y2="90" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-green-2)"/>
  <text x="44" y="83" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#059669">i₁</text>
  <!-- 极性标注 -->
  <text x="64" y="128" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="#dc2626">+</text>
  <text x="102" y="130" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#1e293b">v = 6 V</text>
  <text x="135" y="128" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#2563eb">−</text>
  <text x="102" y="84" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#475569">R = 2 kΩ</text>
  <!-- 公式框 -->
  <rect x="34" y="144" width="150" height="30" rx="5" fill="#ffffff" stroke="#10b981" stroke-width="1"/>
  <text x="109" y="164" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#065f46">v = +i₁R ⇒ i₁ = +3 mA</text>

  <!-- 右侧卡片：Non-PSC -->
  <rect x="216" y="38" width="190" height="148" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.3"/>
  <text x="311" y="57" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#991b1b">情况 B：非 PSC（进 − 出 +）</text>
  <!-- 导线与电阻锯齿 -->
  <line x1="230" y1="104" x2="268" y2="104" stroke="#1e293b" stroke-width="2"/>
  <polyline points="268,104 274,92 284,116 294,92 304,116 314,92 324,116 334,92 340,104" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
  <line x1="340" y1="104" x2="390" y2="104" stroke="#1e293b" stroke-width="2"/>
  <!-- 电流箭头 i2 从右进- -->
  <line x1="386" y1="90" x2="358" y2="90" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red-2)"/>
  <text x="372" y="83" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#dc2626">i₂</text>
  <!-- 极性标注 -->
  <text x="266" y="128" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="#dc2626">+</text>
  <text x="304" y="130" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#1e293b">v = 6 V</text>
  <text x="337" y="128" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#2563eb">−</text>
  <text x="304" y="84" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#475569">R = 2 kΩ</text>
  <!-- 公式框 -->
  <rect x="236" y="144" width="150" height="30" rx="5" fill="#ffffff" stroke="#ef4444" stroke-width="1"/>
  <text x="311" y="164" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#991b1b">v = −i₂R ⇒ i₂ = −3 mA</text>
</svg>`;

const SVG_ACT3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 210" width="420" height="210">
  <defs>
    <marker id="arr-axis-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
  </defs>
  <rect width="420" height="210" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="16" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#0f172a">i–v 平面斜率直觉：斜率 G = Δi / Δv = 1 / R</text>

  <!-- 坐标轴 -->
  <line x1="48" y1="176" x2="386" y2="176" stroke="#334155" stroke-width="1.8" marker-end="url(#arr-axis-3)"/>
  <line x1="68" y1="190" x2="68" y2="38" stroke="#334155" stroke-width="1.8" marker-end="url(#arr-axis-3)"/>
  <text x="392" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#334155">v (V)</text>
  <text x="58" y="42" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#334155">i (mA)</text>
  <text x="56" y="190" font-family="system-ui, sans-serif" font-size="11" fill="#64748b">0</text>

  <!-- 曲线 1：大电导 G = 1 mS (R = 1 kΩ) -->
  <line x1="68" y1="176" x2="188" y2="48" stroke="#ef4444" stroke-width="2.4"/>
  <text x="194" y="54" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#dc2626">G₁ = 1 mS (R = 1 kΩ) 陡峭</text>

  <!-- 曲线 2：中电导 G = 0.5 mS (R = 2 kΩ) -->
  <line x1="68" y1="176" x2="298" y2="66" stroke="#2563eb" stroke-width="2.4"/>
  <text x="302" y="68" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1d4ed8">G₂ = 0.5 mS</text>
  <text x="302" y="82" font-family="system-ui, sans-serif" font-size="10" fill="#1d4ed8">(R = 2 kΩ)</text>

  <!-- 曲线 3：小电导 G = 0.25 mS (R = 4 kΩ) + 斜率三角形 -->
  <line x1="68" y1="176" x2="368" y2="112" stroke="#059669" stroke-width="2.4"/>
  <polygon points="188,150.4 308,150.4 308,124.8" fill="#d1fae5" fill-opacity="0.7" stroke="#059669" stroke-width="1.2" stroke-dasharray="3,2"/>
  <text x="248" y="164" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#065f46">Δv = 12 V</text>
  <text x="314" y="142" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#065f46">Δi = 3 mA</text>
  <text x="410" y="108" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#059669">G₃ = 0.25 mS (4 kΩ)</text>
</svg>`;

const SVG_ACT4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 210" width="420" height="210">
  <defs>
    <marker id="arr-axis-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
  </defs>
  <rect width="420" height="210" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="16" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#0f172a">9 V 供电下的功率曲线 p = 81 / R 与 1/4 W 烧毁红线</text>

  <!-- 危险区与安全区背景 -->
  <rect x="64" y="42" width="110" height="132" fill="#fee2e2" fill-opacity="0.55"/>
  <rect x="174" y="42" width="210" height="132" fill="#dcfce7" fill-opacity="0.45"/>

  <!-- 坐标轴 -->
  <line x1="54" y1="174" x2="394" y2="174" stroke="#334155" stroke-width="1.8" marker-end="url(#arr-axis-4)"/>
  <line x1="64" y1="184" x2="64" y2="38" stroke="#334155" stroke-width="1.8" marker-end="url(#arr-axis-4)"/>
  <text x="396" y="190" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#334155">R (Ω)</text>
  <text x="58" y="44" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#334155">p (W)</text>

  <!-- 0.25 W 水平红线 -->
  <line x1="64" y1="126" x2="384" y2="126" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="5,3"/>
  <text x="382" y="120" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#dc2626">P_rated = 0.25 W (1/4 W 上限)</text>

  <!-- R_min = 324 Ω 垂直红线 -->
  <line x1="174" y1="42" x2="174" y2="174" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="4,3"/>
  <text x="174" y="190" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#dc2626">324 Ω</text>

  <!-- p = 81/R 双曲线 -->
  <path d="M 96 48 Q 124 102 174 126 T 378 164" fill="none" stroke="#1d4ed8" stroke-width="2.6"/>

  <!-- 标注点：100 Ω 过载点 -->
  <circle cx="104" cy="64" r="4.5" fill="#dc2626" stroke="#ffffff" stroke-width="1.5"/>
  <text x="112" y="60" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#991b1b">100 Ω → 0.81 W</text>
  <text x="112" y="73" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b">(冒烟烧毁!)</text>

  <!-- 标注点：324 Ω 临界点 -->
  <circle cx="174" cy="126" r="4.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/>

  <!-- 标注点：1 kΩ 安全点 -->
  <circle cx="320" cy="158" r="4.5" fill="#059669" stroke="#ffffff" stroke-width="1.5"/>
  <text x="320" y="148" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#065f46">1 kΩ → 0.081 W</text>
  <text x="320" y="190" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#065f46">1 kΩ (推荐区)</text>
</svg>`;

const SVG_ACT5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 210" width="420" height="210">
  <defs>
    <marker id="arr-axis-5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
    <marker id="arr-red-5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
  </defs>
  <rect width="420" height="210" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="16" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#0f172a">两大理想极限：短路（R = 0）与开路（R → ∞）</text>

  <!-- 左栏：短路 -->
  <rect x="12" y="38" width="124" height="158" rx="7" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.2"/>
  <text x="74" y="56" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#991b1b">短路 Short (R=0)</text>
  <line x1="36" y1="74" x2="112" y2="74" stroke="#1e293b" stroke-width="2"/>
  <line x1="36" y1="134" x2="112" y2="134" stroke="#1e293b" stroke-width="2"/>
  <line x1="74" y1="74" x2="74" y2="134" stroke="#dc2626" stroke-width="3"/>
  <circle cx="74" cy="74" r="3.5" fill="#dc2626"/>
  <circle cx="74" cy="134" r="3.5" fill="#dc2626"/>
  <line x1="88" y1="88" x2="88" y2="118" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-red-5)"/>
  <text x="98" y="107" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#dc2626">i</text>
  <text x="58" y="84" font-family="system-ui, sans-serif" font-size="11" fill="#1e293b">a</text>
  <text x="58" y="132" font-family="system-ui, sans-serif" font-size="11" fill="#1e293b">b</text>
  <text x="74" y="156" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#991b1b">v_ab = 0 V</text>
  <text x="74" y="172" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d">i 由外电路决定</text>
  <text x="74" y="187" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d">G → ∞</text>

  <!-- 中栏：开路 -->
  <rect x="148" y="38" width="124" height="158" rx="7" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.2"/>
  <text x="210" y="56" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#1e40af">开路 Open (R→∞)</text>
  <line x1="172" y1="74" x2="210" y2="74" stroke="#1e293b" stroke-width="2"/>
  <line x1="172" y1="134" x2="210" y2="134" stroke="#1e293b" stroke-width="2"/>
  <circle cx="210" cy="74" r="4" fill="#ffffff" stroke="#2563eb" stroke-width="2.2"/>
  <circle cx="210" cy="134" r="4" fill="#ffffff" stroke="#2563eb" stroke-width="2.2"/>
  <text x="224" y="82" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#dc2626">+</text>
  <text x="224" y="108" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e40af">v_ab</text>
  <text x="224" y="136" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#2563eb">−</text>
  <text x="194" y="84" font-family="system-ui, sans-serif" font-size="11" fill="#1e293b">a</text>
  <text x="194" y="132" font-family="system-ui, sans-serif" font-size="11" fill="#1e293b">b</text>
  <text x="210" y="156" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e40af">i = 0 A</text>
  <text x="210" y="172" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#1e3a8a">v_ab ≠ 0（如 9 V）</text>
  <text x="210" y="187" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#1e3a8a">G = 0 S</text>

  <!-- 右栏：i-v 平面极限轴 -->
  <rect x="284" y="38" width="124" height="158" rx="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="346" y="56" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#0f172a">i–v 极限轨迹</text>
  <!-- 坐标轴（红色纵轴=短路，蓝色横轴=开路） -->
  <line x1="296" y1="120" x2="398" y2="120" stroke="#2563eb" stroke-width="3" marker-end="url(#arr-axis-5)"/>
  <line x1="346" y1="176" x2="346" y2="68" stroke="#dc2626" stroke-width="3" marker-end="url(#arr-axis-5)"/>
  <!-- 普通电阻虚线 -->
  <line x1="308" y1="158" x2="384" y2="82" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="352" y="76" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#dc2626">短路 (v=0)</text>
  <text x="398" y="135" text-anchor="end" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#2563eb">开路 (i=0)</text>
  <text x="346" y="189" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9.5" fill="#64748b">线性电阻夹在两轴之间</text>
</svg>`;

const SVG_ACT6 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 190" width="420" height="190">
  <defs>
    <marker id="arr-blue-6" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
  </defs>
  <rect width="420" height="190" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="16" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#0f172a">实战例题电路：9 V 电源直连 200 Ω（1/4 W）碳膜电阻</text>

  <!-- 左侧闭环电路图 -->
  <!-- 电压源 -->
  <circle cx="84" cy="106" r="22" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
  <text x="84" y="100" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#dc2626">+</text>
  <text x="84" y="121" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="#2563eb">−</text>
  <text x="48" y="110" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#0f172a">9 V</text>

  <!-- 上下导线 -->
  <polyline points="84,84 84,54 226,54 226,76" fill="none" stroke="#1e293b" stroke-width="2"/>
  <polyline points="84,128 84,158 226,158 226,136" fill="none" stroke="#1e293b" stroke-width="2"/>

  <!-- 电流箭头 i (PSC) -->
  <line x1="132" y1="44" x2="178" y2="44" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-blue-6)"/>
  <text x="155" y="39" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#2563eb">i = ?</text>

  <!-- 竖直电阻 R = 200 Ω -->
  <polyline points="226,76 216,81 236,91 216,101 236,111 216,121 236,131 226,136" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
  <text x="206" y="80" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#dc2626">+</text>
  <text x="206" y="138" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#2563eb">−</text>
  <text x="246" y="102" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#0f172a">R = 200 Ω</text>
  <text x="246" y="118" font-family="system-ui, sans-serif" font-size="11" fill="#b45309">额定 1/4 W</text>

  <!-- 右侧色环提示卡 -->
  <rect x="318" y="54" width="88" height="106" rx="7" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.2"/>
  <text x="362" y="72" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#92400e">四色环解码</text>
  <!-- 迷你电阻色环 -->
  <rect x="330" y="84" width="64" height="18" rx="4" fill="#fde68a" stroke="#b45309" stroke-width="1"/>
  <rect x="338" y="84" width="6" height="18" fill="#dc2626"/>
  <rect x="349" y="84" width="6" height="18" fill="#0f172a"/>
  <rect x="360" y="84" width="6" height="18" fill="#78350f"/>
  <rect x="378" y="84" width="6" height="18" fill="#d97706"/>
  <text x="362" y="118" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" fill="#78350f">红(2) 黑(0) 棕(×10)</text>
  <text x="362" y="134" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#92400e">= 200 Ω ±5%</text>
  <text x="362" y="150" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#dc2626">能安全通电吗？</text>
</svg>`;

const SVG_ACT7 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 200" width="420" height="200">
  <defs>
    <marker id="arr-red-7" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
    </marker>
  </defs>
  <rect width="420" height="200" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="16" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#0f172a">随堂自测配图（左：Q1 非 PSC 电阻；右：Q2 断开开关电路）</text>

  <!-- 左图：Q1 非 PSC -->
  <rect x="14" y="38" width="188" height="148" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="108" y="56" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#0f172a">Q1：非 PSC 电阻</text>
  <line x1="28" y1="112" x2="62" y2="112" stroke="#1e293b" stroke-width="2"/>
  <polyline points="62,112 68,100 78,124 88,100 98,124 108,100 118,124 128,100 134,112" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
  <line x1="134" y1="112" x2="188" y2="112" stroke="#1e293b" stroke-width="2"/>
  <!-- 电流从右进- -->
  <line x1="184" y1="96" x2="150" y2="96" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red-7)"/>
  <text x="167" y="88" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#dc2626">i = 2 mA</text>
  <!-- 极性 -->
  <text x="60" y="138" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#dc2626">+</text>
  <text x="98" y="140" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#1e293b">v = ?</text>
  <text x="130" y="138" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="#2563eb">−</text>
  <text x="98" y="90" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#475569">R = 5 kΩ</text>
  <text x="108" y="170" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" fill="#64748b">求电压 v 与吸收功率 p</text>

  <!-- 右图：Q2 开路开关 -->
  <rect x="218" y="38" width="188" height="148" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="312" y="56" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#0f172a">Q2：断开开关电路</text>
  <!-- 9V 电源 -->
  <circle cx="256" cy="118" r="16" fill="#ffffff" stroke="#1e293b" stroke-width="1.8"/>
  <text x="256" y="114" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#dc2626">+</text>
  <text x="256" y="129" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#2563eb">−</text>
  <text x="234" y="122" text-anchor="end" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#0f172a">9V</text>
  <!-- 上支路：1 kΩ 电阻 -->
  <polyline points="256,102 256,74 282,74" fill="none" stroke="#1e293b" stroke-width="1.8"/>
  <polyline points="282,74 286,66 294,82 302,66 310,82 318,66 322,74" fill="none" stroke="#1e293b" stroke-width="1.8"/>
  <text x="302" y="94" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#475569">1 kΩ</text>
  <polyline points="322,74 366,74 366,96" fill="none" stroke="#1e293b" stroke-width="1.8"/>
  <!-- 右支路：断开开关 -->
  <circle cx="366" cy="96" r="3.2" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
  <circle cx="366" cy="132" r="3.2" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
  <line x1="366" y1="96" x2="384" y2="124" stroke="#2563eb" stroke-width="2"/>
  <text x="348" y="102" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#dc2626">+</text>
  <text x="342" y="118" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#1e40af">v_sw</text>
  <text x="348" y="135" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#2563eb">−</text>
  <!-- 下导线 -->
  <polyline points="256,134 256,158 366,158 366,132" fill="none" stroke="#1e293b" stroke-width="1.8"/>
  <text x="312" y="176" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" fill="#64748b">求 v_sw、i 与断口电导 G</text>
</svg>`;

const MINI_1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 76" width="220" height="76"><rect width="220" height="76" rx="6" fill="#f8fafc" stroke="#cbd5e1"/><line x1="18" y1="42" x2="66" y2="42" stroke="#1e293b" stroke-width="2"/><polyline points="66,42 74,32 86,52 98,32 110,52 122,32 134,52 142,42" fill="none" stroke="#1e293b" stroke-width="2"/><line x1="142" y1="42" x2="202" y2="42" stroke="#1e293b" stroke-width="2"/><text x="36" y="32" font-size="11" font-weight="700" fill="#2563eb">i →</text><text x="64" y="64" font-size="12" font-weight="700" fill="#dc2626">+</text><text x="104" y="64" text-anchor="middle" font-size="11" fill="#0f172a">v = 9 V</text><text x="138" y="64" font-size="13" font-weight="700" fill="#2563eb">−</text><text x="104" y="22" text-anchor="middle" font-size="11" fill="#475569">R = 200 Ω</text></svg>`;
const MINI_2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 76" width="220" height="76"><rect width="220" height="76" rx="6" fill="#ecfdf5" stroke="#10b981"/><line x1="24" y1="60" x2="196" y2="60" stroke="#334155" stroke-width="1.5"/><line x1="36" y1="66" x2="36" y2="14" stroke="#334155" stroke-width="1.5"/><line x1="36" y1="60" x2="176" y2="20" stroke="#059669" stroke-width="2.2"/><text x="118" y="30" font-size="11" font-weight="700" fill="#065f46">斜率 G = 1 / 200 Ω</text><text x="196" y="54" text-anchor="end" font-size="10" fill="#334155">v</text><text x="42" y="20" font-size="10" fill="#334155">i</text></svg>`;
const MINI_3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 76" width="220" height="76"><rect width="220" height="76" rx="6" fill="#fef2f2" stroke="#ef4444"/><rect x="20" y="34" width="180" height="16" rx="4" fill="#e2e8f0"/><rect x="20" y="34" width="156" height="16" rx="4" fill="#ef4444"/><line x1="116" y1="24" x2="116" y2="58" stroke="#0f172a" stroke-width="1.8" stroke-dasharray="3,2"/><text x="116" y="20" text-anchor="middle" font-size="10" font-weight="700" fill="#0f172a">0.25 W 红线</text><text x="110" y="68" text-anchor="middle" font-size="10.5" font-weight="700" fill="#991b1b">p = v²/R = 81/200 = ? W</text></svg>`;

/* ------------------------------------------------------------- stage set-ups */

/** every act sets the whole circuit, so scrolling back and forth always lands on the act's own numbers */
const circuit = (p: { v?: number; r?: number; limit?: 'none' | 'open' | 'short'; psc?: boolean; rs?: boolean; cutaway?: boolean; izoom?: boolean }) => ({
  izoom: false,
  v: 9,
  r: 1000,
  limit: 'none',
  psc: true,
  rs: false,
  cutaway: false,
  ...p,
});

/* ------------------------------------------------------------- the lesson */

const W1_L3: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { 'layer-01-3d-resistor': Resistor3DLayer, 'layer-02-2d-schematic': SchematicLayer, 'layer-03-vi-curve': VICurveLayer },
  lesson_meta: {
    lesson_id: 'W1-L3',
    world: 'World 1 · 电学公理与基本定律',
    title: '电阻、欧姆定律、电导与开路/短路极限',
    subtitle: "Resistance, Ohm's Law, Conductance & Open/Short-Circuit Limits",
    lesson_type: 'A',
    lesson_type_label: 'Type A（器件导论课：3D 实物层 + 2D 动态原理图层 + V-I 特性曲线层）',
    estimated_minutes: 35,
    textbook_primary: {
      book: 'Alexander & Sadiku, Fundamentals of Electric Circuits (2026 Release)',
      sections: ['Ch. 2.1 Introduction', "Ch. 2.2 Ohm's Law (Resistance, Conductance, Short/Open Circuit, Power)"],
    },
    textbook_supplement: "Boylestad, Introductory Circuit Analysis · Ch. 3 Resistance (Physical Formula R = ρl/A, Color Coding)、Ch. 4 Ohm's Law, Power, and Energy",
    prerequisites: ['W1-L1: 电荷、电流、电压与参考方向', 'W1-L2: 功率、能量与无源符号约定（Passive Sign Convention）'],
    next_lesson: 'W1-L4',
    next_lesson_title: '节点、支路与回路拓扑（Nodes, Branches, and Loops）',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: 'layer-01-3d-resistor',
        label: '01 3D 电阻实物',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption: '3D 碳膜电阻实物与色环：1/4 W 轴向碳膜电阻插在面包板上，色环随阻值重绘；打开剖视看陶瓷基体上的激光螺旋碳膜，拖动可 360° 旋转。',
      },
      {
        id: 'layer-02-2d-schematic',
        label: '02 2D 原理图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '2D 欧姆定律动态原理图：电源 v、电阻 R、串联电流表 A、并联电压表 V 与顶部功率计 W；光点流速随 |i| 变化。',
      },
      {
        id: 'layer-03-vi-curve',
        label: '03 V-I 曲线',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: 'V-I 线性特性与开路/短路极限曲线：直线斜率就是电导 G；淡红色区域超出 |v·i| = 0.25 W；拖动绿色工作点 Q 反推电源电压。',
      },
    ],
    hover_map: {
      hl_geom_rho: { label: '电阻率 ρ 与几何 R = ρl/A', desc: '碳膜螺旋条带：螺旋越密，路径 l 越长、条带截面 A 越窄，阻值越大' },
      hl_color_bands: { label: '四色环 / 阻值 R', desc: '第 1、2 环有效数字，第 3 环倍率，第 4 环金色 ±5%' },
      hl_psc_sign: { label: '无源符号约定 v = ±iR', desc: '参考电流从 + 端流入取 v = +iR，从 − 端流入取 v = −iR' },
      hl_conductance: { label: '电导 G = 1/R（S）', desc: 'i–v 平面上特性直线的斜率 Δi/Δv' },
      hl_power_soa: { label: '功率 p = v²/R 与 324 Ω 红线', desc: '|v·i| = 0.25 W 等功率双曲线之外就是过载区' },
      hl_short_limit: { label: '短路极限 R = 0 ⇒ v = 0', desc: '0 Ω 跳线：电压为零，电流由外电路决定；特性线竖到纵轴' },
      hl_open_limit: { label: '开路极限 R = ∞ ⇒ i = 0', desc: '断口只有空气：电流为零，电压不一定为零；特性线放平到横轴' },
    },
  },
  right_acts: [
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '电阻的物理本质——为什么导体会“阻碍”电流？',
      sync: { layer: 'layer-01-3d-resistor', halo: ['hl_geom_rho'], params: circuit({}) },
      blocks: [
        { kind: 'p', text: '同学们好，欢迎回到 Breadboard Lab。前两节课我们认识了电荷、电流、电压和功率，今天我们正式迎来电路世界里的第一位“实体主角”——**电阻器（Resistor）**。' },
        {
          kind: 'p',
          text: String.raw`请把目光投向左侧 01 号图层里的[[hl_color_bands|这颗米黄色小家伙]]。你以后在面包板上插得最多的元件就是它。先抛一个物理直觉问题：铜导线和这颗 $1\text{ k}\Omega$ 的碳膜电阻，里面都能过电流，为什么我们把铜导线当成畅通无阻的“高速公路”，而把电阻器当成专门用来控流、分压的“限流收费站”？`,
        },
        {
          kind: 'p',
          text: String.raw`答案藏在微观晶格里。当电压驱动自由电子在材料内部定向漂移时，电子并不是在真空中直线狂奔，而是不断与材料内部的原子核晶格发生弹性与非弹性碰撞。每次碰撞都会把电子从电场获得的动能转化为晶格热振动——宏观上，这种**阻碍电流通过并把电能转化为热能的性质**，就是**电阻（Resistance，符号 $R$，单位欧姆 $\Omega$）**。`,
        },
        { kind: 'p', text: '按照 Boylestad 在物理直觉章节里的经典建模，一段均匀柱状导体的电阻取决于三个几何与材料参数：' },
        {
          kind: 'ul',
          items: [
            String.raw`[[hl_geom_rho|**电阻率 $\rho$（Resistivity，单位 $\Omega\cdot\text{m}$）**]]：材料的“本性”。铜的 $\rho_{\text{Cu}} \approx 1.72 \times 10^{-8}\ \Omega\cdot\text{m}$，极度顺滑；碳膜的电阻率则比铜高出数千倍；而陶瓷和塑料的 $\rho$ 高达 $10^{12}\ \Omega\cdot\text{m}$ 以上，属于绝缘体。`,
            String.raw`**长度 $l$**：通道越长，电子一路上撞击晶格的次数越多，阻力成正比增加。`,
            String.raw`**横截面积 $A$**：通道越宽，可供电子并行通过的“车道”越多，阻力成反比减小。`,
          ],
        },
        {
          kind: 'p',
          text: String.raw`试着在左侧 Layer 01 打开[[hl_geom_rho|**“碳膜剖视”**]]开关：你会发现小小一颗碳膜电阻内部，工程师用激光在圆柱形陶瓷基体镀碳层上刻出了一道精密的[[hl_geom_rho|**螺旋沟槽**]]。沟槽刻得越密，电流被迫走过的螺旋路径 $l$ 就越长、有效截面积 $A$ 就越窄——这就是为什么指甲盖大小的元件，能轻松做出 $1\text{ k}\Omega$ 甚至 $1\text{ M}\Omega$ 的阻值。`,
        },
        {
          kind: 'p',
          text: String.raw`下面我们用严格的三段式推导，算一算实验室里一根长 $10\text{ m}$、直径 $1\text{ mm}$ 的普通铜导线电阻有多大，看看为什么我们在电路图里敢把导线当成“零电阻”。`,
        },
        { kind: 'p', text: '**【三段式推导 1-1：铜导线电阻计算】**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: String.raw`根据均匀导体的电阻物理定义（Boylestad Ch. 3 / Alexander & Sadiku Ch. 2.2）与圆截面面积公式： $\displaystyle R = \rho \frac{l}{A}, \qquad A = \pi r^2 = \frac{\pi d^2}{4}$`,
        },
        { kind: 'formula', title: String.raw`② 纯符号通式：将 $A = \frac{\pi d^2}{4}$ 代入电阻定义式，消去中间面积变量：`, tex: String.raw`R = \frac{4 \rho l}{\pi d^2}` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A',
              text: String.raw`取室温 $20^\circ\text{C}$ 下铜的电阻率 $\rho_{\text{Cu}} = 1.72 \times 10^{-8}\ \Omega\cdot\text{m}$，长度 $l = 10\text{ m}$，直径 $d = 1\text{ mm} = 1.0 \times 10^{-3}\text{ m}$：`,
              tex: String.raw`A = \frac{\pi (1.0 \times 10^{-3}\text{ m})^2}{4} = 2.5\pi \times 10^{-7}\text{ m}^2 \approx 7.854 \times 10^{-7}\text{ m}^2`,
            },
            {
              label: 'Step B',
              tex: String.raw`R = \frac{(1.72 \times 10^{-8}\ \Omega\cdot\text{m}) \times 10\text{ m}}{7.854 \times 10^{-7}\text{ m}^2} = \frac{1.72 \times 10^{-7}}{7.854 \times 10^{-7}}\ \Omega \approx 0.219\ \Omega`,
            },
          ],
        },
        {
          kind: 'p',
          text: String.raw`看这个结果：$10\text{ m}$ 长的铜线才 $0.219\ \Omega$，而面包板上一段 $5\text{ cm}$ 的跳线更是只有约 $1\text{ m}\Omega$。与我们常用的 $1\text{ k}\Omega$ 电阻相比，相差整整一百万倍！这就是理想导线近似成立的物理底气。`,
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '导体几何模型 R = ρ(l / A) 与碳膜螺旋刻槽',
    },
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '欧姆定律与无源符号约定的“正负号生死线”',
      sync: { layer: 'layer-02-2d-schematic', halo: ['hl_psc_sign'], params: circuit({ v: 6, r: 2000 }) },
      blocks: [
        { kind: 'p', text: "有了电阻的概念，我们就可以请出电路分析第一定律——德国物理学家格奥尔格·西蒙·欧姆（Georg Simon Ohm）在 1827 年确立的**欧姆定律（Ohm's Law）**。" },
        { kind: 'p', text: String.raw`在 Alexander & Sadiku 第 2.2 节中，欧姆定律的表述极其简洁：**线性电阻两端的电压 $v$ 与流过它的电流 $i$ 成正比，比例常数就是电阻 $R$。**` },
        { kind: 'p', text: '听到这里，很多同学可能心里暗笑：“老师，初中我就背过 $V = IR$ 了，这有什么好讲的？”' },
        {
          kind: 'p',
          text: '先别急——大学电路分析与中学物理的第一道分水岭，恰恰就藏在这个看似人畜无害的等号后面：**参考方向（Reference Direction）与[[hl_psc_sign|无源符号约定（Passive Sign Convention, PSC）]]**。',
        },
        { kind: 'p', text: '请盯紧左侧 Layer 02 原理图里的[[hl_psc_sign|极性 +/- 和电流箭头]]，试着拨动底部的 PSC / Non-PSC 切换开关：' },
        {
          kind: 'ul',
          items: [
            '**情况 A（满足无源符号约定）**：电流参考方向 $i$ 从电阻标有 **+** 号的端子**流入**，从 **-** 号端子流出。此时欧姆定律取**正号**： $v = +iR$',
            '**情况 B（违背无源符号约定）**：电流参考方向 $i$ 从标有 **-** 号的端子**流入**，从 **+** 号端子流出。此时欧姆定律**必须取负号**： $v = -iR$',
          ],
        },
        {
          kind: 'p',
          text: '**为什么这条“正负号生死线”绝不能含糊？** 因为在实际的复杂多回路电路里，我们动笔列方程时往往**提前不知道真实电流往哪边流**，只能先人为指定一个参考方向。如果你看到一个电阻，不管三七二十一就写 $v = iR$，一旦参考方向画反了，整个方程组就会符号崩盘！',
        },
        { kind: 'p', text: '记住教授的一句口诀：**“电阻 $R$ 永远是正数，但 $v$ 和 $i$ 是带方向的代数值；先看箭头进正还是进负，再落笔写 $+iR$ 还是 $-iR$。”**' },
        { kind: 'p', text: '我们来做一次对比推导，看看这两种写法如何在物理上殊途同归。' },
        { kind: 'p', text: '**【三段式推导 2-1：同一电阻在 PSC 与非 PSC 下的电流求解】**' },
        {
          kind: 'p',
          text: String.raw`已知某电阻 $R = 2\text{ k}\Omega$，两端参考电压 $v = 6\text{ V}$（左 + 右 -）。现分别按图左（$i_1$ 从 + 流入）与图右（$i_2$ 从 - 流入）求参考电流。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: '依据欧姆定律与[[hl_psc_sign|无源符号约定]]（Alexander & Sadiku Ch. 2.2）：当电流从电压 + 端流入（PSC）：$v = +i_1 R$；当电流从电压 - 端流入（Non-PSC）：$v = -i_2 R$',
        },
        { kind: 'formula', title: '② 纯符号通式：分别解出参考电流的符号表达式：', tex: String.raw`i_1 = +\frac{v}{R}, \qquad i_2 = -\frac{v}{R}` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A',
              text: String.raw`代入 $v = 6\text{ V}$、$R = 2\text{ k}\Omega = 2 \times 10^3\ \Omega$：`,
              tex: String.raw`i_1 = +\frac{6\text{ V}}{2 \times 10^3\ \Omega} = +3 \times 10^{-3}\text{ A} = +3\text{ mA}`,
            },
            { label: 'Step B', tex: String.raw`i_2 = -\frac{6\text{ V}}{2 \times 10^3\ \Omega} = -3 \times 10^{-3}\text{ A} = -3\text{ mA}` },
          ],
        },
        {
          kind: 'p',
          text: String.raw`看懂了吗？$i_2 = -3\text{ mA}$ 并不是说电阻变成负的了，而是告诉你：“你画的向右进 - 端的箭头画反了，真实物理电流其实是 $3\text{ mA}$ 从左向右流（从 + 进 - 出）。”两种参考方向描述的是**完全同一个物理事实**。`,
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '无源符号约定（PSC）对比：v = +iR 与 v = −iR',
    },
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '电导 G——换个视角看“通畅程度”',
      sync: { layer: 'layer-03-vi-curve', halo: ['hl_conductance'], params: circuit({ v: 12, r: 4000, izoom: true }) },
      blocks: [
        {
          kind: 'p',
          text: '电阻 $R$ 衡量的是元件**阻碍**电流的能力。但很多时候——尤其是后面学到并联电路和节点电压法（Nodal Analysis）时——反过来问“元件**允许**电流通过的顺畅程度有多高”会让计算简洁得多。',
        },
        { kind: 'p', text: String.raw`这个物理量叫做[[hl_conductance|**电导（Conductance，符号 $G$）**]]，它就是电阻的倒数： $\displaystyle G = \frac{1}{R} = \frac{i}{v}$` },
        {
          kind: 'ul',
          items: [
            String.raw`**SI 单位**：**西门子（Siemens，符号 $\text{S}$）**，$1\text{ S} = 1\text{ A/V} = 1\ \Omega^{-1}$。（在 Boylestad 等经典北美教材中，有时也会见到它的传统别称 **姆欧 mho**，符号是倒写的欧米茄 $\mho$，寓意“把 ohm 倒过来念”，但现代标准统一使用 $\text{S}$。）`,
            String.raw`**量级直觉**：由于面包板电阻动辄几 $\text{k}\Omega$，实验室里电导的常见单位是**毫西门子（$\text{mS} = 10^{-3}\text{ S}$）和微西门子（$\mu\text{S} = 10^{-6}\text{ S}$）**。记住一个秒算口诀：**$\text{k}\Omega$ 的倒数就是 $\text{mS}$**（例如 $1\text{ k}\Omega \leftrightarrow 1\text{ mS}$，$2\text{ k}\Omega \leftrightarrow 0.5\text{ mS}$）。`,
          ],
        },
        {
          kind: 'p',
          text: '现在把视线切到左侧 Layer 03（$i$-$v$ 平面）：在横轴为 $v$、纵轴为 $i$ 的坐标系中，欧姆定律写成 $i = Gv$，是一条过原点的直线——[[hl_conductance|**直线的斜率就是电导 $G$**]]！',
        },
        {
          kind: 'ul',
          items: [
            String.raw`电阻越小 $\Rightarrow$ 电导 $G$ 越大 $\Rightarrow$ 直线越**陡峭**（稍微加一点电压，电流就猛增）。`,
            String.raw`电阻越大 $\Rightarrow$ 电导 $G$ 越小 $\Rightarrow$ 直线越**平缓**（电压加得很高，电流依然细如游丝）。`,
          ],
        },
        { kind: 'p', text: '**【三段式推导 3-1：电导换算与 $i = Gv$ 求解】**' },
        { kind: 'p', text: String.raw`已知电阻 $R = 4\text{ k}\Omega$，两端施加满足无源符号约定的电压 $v = 12\text{ V}$，求其电导 $G$ 与流过电流 $i$。` },
        { kind: 'origin', title: '① 公理溯源', text: String.raw`依据电导定义与电导形式的欧姆定律（Alexander & Sadiku Ch. 2.2）： $\displaystyle G = \frac{1}{R}, \qquad i = Gv$` },
        { kind: 'formula', title: '② 纯符号通式', tex: String.raw`G = R^{-1}, \qquad i = Gv = \frac{v}{R}` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: 'Step A',
              text: String.raw`代入 $R = 4\text{ k}\Omega = 4 \times 10^3\ \Omega$ 与 $v = 12\text{ V}$：`,
              tex: String.raw`G = \frac{1}{4 \times 10^3\ \Omega} = 2.5 \times 10^{-4}\text{ S} = 0.25\text{ mS} = 250\ \mu\text{S}`,
            },
            { label: 'Step B', tex: String.raw`i = Gv = (0.25 \times 10^{-3}\text{ S}) \times 12\text{ V} = 3.0 \times 10^{-3}\text{ A} = 3\text{ mA}` },
          ],
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: 'i–v 平面斜率直觉：斜率 G = Δi / Δv = 1 / R',
    },
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '焦耳热与功率消耗——电阻永远是能量的“单行道”',
      sync: { layer: 'layer-03-vi-curve', halo: ['hl_power_soa'], params: circuit({}) },
      blocks: [
        { kind: 'p', text: '回到第 1 幕的微观画面：电子不断撞击晶格把电能交给原子核振动，那么电阻每秒钟吃掉多少电能？' },
        {
          kind: 'p',
          text: String.raw`把上一讲学过的电功率公式 $p = vi$（在无源符号约定下代表**吸收功率**）与欧姆定律 $v = iR$ 或 $i = v/R$ 联立，我们立刻得到电阻功率的四种等价形式： $\displaystyle p = vi = i^2 R = \frac{v^2}{R} = v^2 G = \frac{i^2}{G}$`,
        },
        { kind: 'p', text: String.raw`请特别凝视中间那两个平方项：[[hl_power_soa|**$i^2 R$ 和 $\frac{v^2}{R}$**]]。这里藏着电路理论里两条铁律：` },
        {
          kind: 'ul',
          items: [
            String.raw`**铁律一（无源单向耗散）**：只要 $R > 0$，无论电流 $i$ 是正还是负、电压 $v$ 是正还是负，它们的平方永远非负，因此： $\displaystyle p = i^2 R = \frac{v^2}{R} \ge 0$ 这意味着**理想电阻永远只能吸收功率（转化为热），绝不可能对外输出功率**！就算你在第 2 幕里故意违背无源符号约定画出 $v = -iR$，代入吸收功率定义时负负得正，算出来的吸收功率照样是 $+i^2R \ge 0$。`,
            String.raw`**铁律二（平方律热险境）**：在恒定电源电压 $v$ 下（比如面包板的 $9\text{ V}$ 电池），功率与阻值成**反比**（$p = v^2/R$），与电压成**平方正比**。电压翻倍，发热直接暴涨 **4 倍**；阻值减半，发热直接翻倍！`,
          ],
        },
        {
          kind: 'p',
          text: String.raw`请看左侧 Layer 03 的[[hl_power_soa|浅红色双曲线安全区（$p \le 0.25\text{ W}$）]]，再动手把电压设在 $9\text{ V}$，把阻值滑块从 $1\text{ k}\Omega$ 往左拖过 $324\ \Omega$——你会亲眼看到 Layer 01 的碳膜电阻发红冒烟。下面我们用三段式推导精确锁定这条安全红线。`,
        },
        { kind: 'p', text: String.raw`**【三段式推导 4-1：$9\text{ V}$ 供电下 $1/4\text{ W}$ 电阻的功率校验与安全阻值下限】**` },
        {
          kind: 'p',
          text: String.raw`在 $v = 9\text{ V}$ 恒压源下，比较 $R_1 = 100\ \Omega$ 与 $R_2 = 1\text{ k}\Omega$ 的耗散功率，并求不超 $P_{\max} = 0.25\text{ W}$ 的最小安全阻值 $R_{\min}$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: String.raw`依据吸收功率公式 $p = vi$ 与欧姆定律 $i = \frac{v}{R}$（Alexander & Sadiku Ch. 2.2）： $\displaystyle p = vi, \qquad i = \frac{v}{R}$`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式：消去电流 $i$ 得电压-电阻功率公式，并由安全不等式 $p \le P_{\max}$ 反解最小阻值：`,
          tex: String.raw`p = \frac{v^2}{R}, \qquad R \ge R_{\min} = \frac{v^2}{P_{\max}}`,
        },
        {
          kind: 'calc',
          title: String.raw`③ 代入数值逐步化简：代入 $v = 9\text{ V}$、$P_{\max} = \frac{1}{4}\text{ W} = 0.25\text{ W}$`,
          steps: [
            {
              label: String.raw`当 R₁ = 100 Ω 时`,
              tex: String.raw`p_1 = \frac{(9\text{ V})^2}{100\ \Omega} = \frac{81}{100}\text{ W} = 0.81\text{ W} = 810\text{ mW} > 0.25\text{ W} \quad (\text{过载 } 324\%\text{，迅速烧毁！})`,
            },
            {
              label: String.raw`当 R₂ = 1 kΩ = 1000 Ω 时`,
              tex: String.raw`p_2 = \frac{(9\text{ V})^2}{1000\ \Omega} = 0.081\text{ W} = 81\text{ mW} < 0.25\text{ W} \quad (\text{仅占 } 32.4\%\text{，安全运行})`,
            },
            { label: '临界安全阻值下限', tex: String.raw`R_{\min} = \frac{(9\text{ V})^2}{0.25\text{ W}} = \frac{81}{0.25}\ \Omega = 324\ \Omega` },
          ],
        },
        {
          kind: 'p',
          text: String.raw`记住 [[hl_power_soa|$324\ \Omega$]] 这个数字——它是你在 $9\text{ V}$ 面包板世界里的“保命红线”。为了留出工程降额余量，我们在实验室默认直接上 $\text{k}\Omega$ 级电阻。`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: String.raw`**面包板安全规范与量级标定** 在 Breadboard Lab 虚拟与实体同步实验中，默认直流电源为标准 **$9\text{ V}$ 电池 / $9\text{ V}$ 稳压轨**，套件配发的轴向碳膜电阻默认额定功率为 **$P_{\text{rated}} = \frac{1}{4}\text{ W} = 0.25\text{ W}$**。`,
        },
        {
          kind: 'ul',
          items: [
            String.raw`**理论烧毁红线（硬下限）** 当单只电阻直接跨接在 $V = 9\text{ V}$ 电源两端时，其耗散功率为 $P = \frac{V^2}{R}$。为保证不突破 $0.25\text{ W}$ 额定上限，电阻阻值必须满足： $\displaystyle R \ge \frac{V^2}{P_{\text{rated}}} = \frac{(9\text{ V})^2}{0.25\text{ W}} = \frac{81}{0.25}\ \Omega = 324\ \Omega$`,
            String.raw`若误插 $R < 324\ \Omega$ 的电阻（例如 $100\ \Omega$ 或 $220\ \Omega$），碳膜表面温度会在数秒内飙升至 $150^\circ\text{C}$ 以上，轻则色环碳化变黑，重则冒烟烧断并熔化面包板 ABS 塑料插孔。`,
            String.raw`**工程降额安全线（$50\%$ Derating Rule）** 实际工程中不会让电阻长期满载运行，通常按 **$50\%$ 功率降额**（即 $P_{\text{safe}} \le 0.125\text{ W}$）设计： $\displaystyle R_{\text{derated}} \ge \frac{9^2}{0.125} = 648\ \Omega \xrightarrow{\text{E12 标准值向上取整}} 680\ \Omega$`,
            String.raw`**实验室默认 $\text{k}\Omega$ 级标定原则** 因此，Breadboard Lab 的基础实验默认采用 **$\text{k}\Omega$ 级电阻（$1\text{ k}\Omega \sim 10\text{ k}\Omega$）**，其工程收益如下表所示：`,
          ],
        },
        {
          kind: 'table',
          head: [String.raw`阻值 $R$`, String.raw`$9\text{ V}$ 下电流 $i$`, '耗散功率 $p$', String.raw`占 $1/4\text{ W}$ 额定比例`, '热状态与实验评价'],
          rows: [
            [
              String.raw`$100\ \Omega$`,
              String.raw`$90\text{ mA}$`,
              String.raw`$0.810\text{ W}$`,
              String.raw`$324\%$`,
              String.raw`**严重过载**：迅速冒烟烧毁，严禁直连 $9\text{ V}$`,
            ],
            [String.raw`$330\ \Omega$`, String.raw`$27.3\text{ mA}$`, String.raw`$0.245\text{ W}$`, String.raw`$98\%$`, '**临界边缘**：烫手，长时间通电存在漂移与热损风险'],
            [
              String.raw`$1\text{ k}\Omega$`,
              String.raw`$9.0\text{ mA}$`,
              String.raw`$0.081\text{ W}$`,
              String.raw`$32.4\%$`,
              String.raw`**推荐基准值**：微温、安全、万用表 $\text{mA}$ 档读数清晰`,
            ],
            [String.raw`$4.7\text{ k}\Omega$`, String.raw`$1.91\text{ mA}$`, String.raw`$0.017\text{ W}$`, String.raw`$6.9\%$`, '**常规安全值**：无明显温升，9 V 电池续航持久'],
            [String.raw`$10\text{ k}\Omega$`, String.raw`$0.90\text{ mA}$`, String.raw`$0.0081\text{ W}$`, String.raw`$3.2\%$`, '**低功耗安全值**：适合分压网络与高阻测量'],
          ],
        },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '9 V 供电下的功率曲线 p = 81 / R 与 1/4 W 烧毁红线',
    },
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '两个极端宇宙——短路（R → 0）与开路（R → ∞）',
      sync: { layer: 'layer-03-vi-curve', halo: ['hl_short_limit', 'hl_open_limit'], params: circuit({ rs: true }) },
      blocks: [
        {
          kind: 'p',
          text: String.raw`线性电阻的阻值范围是 $0 < R < \infty$。现在，请点击左侧控制台上的[[hl_short_limit|**一键短路**]]和[[hl_open_limit|**一键开路**]]按钮，把电阻推向数学上的两个极端边界——Alexander & Sadiku 第 2.2 节专门把它们单独拎出来，因为它们在电路化简、故障排查和等效定理（如戴维南定理）里无处不在。`,
        },
        { kind: 'p', text: String.raw`[[hl_short_limit|**极端一：短路（Short Circuit，$R = 0$，$G \to \infty$）**]]` },
        {
          kind: 'ul',
          items: [
            '**定义**：两端之间电阻为零的理想连接（例如一根理想跳线）。',
            String.raw`**核心特征**：无论流过多少有限电流 $i$，两端电压**恒为零**： $v = iR = i \cdot 0 = 0\text{ V}$`,
            String.raw`**关键警示**：短路并不意味着电流为零！电流 $i$ 的大小完全由**外部电路**决定。如果外电路有串联限流电阻，短路只是把某个元件安全旁路；但如果你用跳线直接短接 $9\text{ V}$ 电池的正负极，理论电流 $i \to \infty$（现实中受电池内阻限制仍有数安培大电流），瞬间就会烫伤手指或烧毁电源。`,
            '**图像形态**：在 Layer 03 的 $i$-$v$ 平面上，直线逆时针竖直，完全重合在[[hl_short_limit|**纵轴（$v = 0$ 轴）**]]上。',
          ],
        },
        { kind: 'p', text: String.raw`[[hl_open_limit|**极端二：开路（Open Circuit，$R \to \infty$，$G = 0$）**]]` },
        {
          kind: 'ul',
          items: [
            '**定义**：两点之间断开、无导电通路（例如断开的开关、拔出的电阻、空气间隙）。',
            String.raw`**核心特征**：无论两端存在多大电压 $v$，流过断口的电流**恒为零**： $\displaystyle i = \lim_{R \to \infty} \frac{v}{R} = 0\text{ A}$`,
            String.raw`**最高频错觉破除**：很多同学一看到“开路”，就脱口而出“电压是 $0\text{ V}$”——**大错特错！** 开路只强制 $i = 0$，绝不强制 $v = 0$！你家墙上的三孔插座没插电器时就是开路，流过插孔的电流是 $0\text{ A}$，但两孔之间的开路电压依然是致命的 $220\text{ V}$（或 $120\text{ V}$）！在我们的 $9\text{ V}$ 面包板回路里，断开开关后，回路电流归零，串联电阻上的压降归零，全部 $9\text{ V}$ 电压都完整地“悬”在断开的开关两端。`,
            '**图像形态**：在 Layer 03 的 $i$-$v$ 平面上，直线顺时针放平，完全重合在[[hl_open_limit|**横轴（$i = 0$ 轴）**]]上。',
          ],
        },
        { kind: 'p', text: '**【三段式推导 5-1：欧姆定律的短路与开路极限】**' },
        {
          kind: 'p',
          text: String.raw`在 $9\text{ V}$ 电池串联 $R_s = 1\text{ k}\Omega$ 保护电阻的回路中，考察输出端 $a$-$b$ 分别处于短路与开路时的端电压 $v_{ab}$ 与端口电流 $i$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: String.raw`依据欧姆定律 $v_{ab} = i R_{\text{load}}$ 与电导形式 $i = G_{\text{load}} v_{ab}$： $\displaystyle v_{ab} = i R_{\text{load}}, \qquad i = \frac{v_{ab}}{R_{\text{load}}}$`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式：分别对负载阻值 $R_{\text{load}}$ 取 $0$ 与 $\infty$ 极限：`,
          tex: String.raw`\begin{aligned} &\text{短路极限（}R_{\text{load}} \to 0\text{）：}\ v_{ab} = \lim_{R_{\text{load}} \to 0} (i R_{\text{load}}) = 0\text{，此时回路电流由保护电阻决定 } i_{\text{sc}} = \frac{V_s}{R_s}\text{。} \\ &\text{开路极限（}R_{\text{load}} \to \infty\text{）：}\ i = \lim_{R_{\text{load}} \to \infty} \frac{v_{ab}}{R_{\text{load}}} = 0\text{，保护电阻压降 } v_{R_s} = i R_s = 0\text{，故 } v_{\text{oc}} = V_s\text{。} \end{aligned}`,
        },
        {
          kind: 'calc',
          title: String.raw`③ 代入数值逐步化简：代入 $V_s = 9\text{ V}$、$R_s = 1\text{ k}\Omega = 1000\ \Omega$`,
          steps: [
            {
              label: '短路态',
              text: String.raw`[[hl_short_limit|$v_{ab} = 0\text{ V}$]]，$i_{\text{sc}} = \frac{9\text{ V}}{1000\ \Omega} = 9\text{ mA}$（全部 $9\text{ V}$ 落在保护电阻 $R_s$ 上）。`,
            },
            { label: '开路态', text: String.raw`[[hl_open_limit|$i = 0\text{ A}$]]，$v_{R_s} = 0 \times 1000 = 0\text{ V}$，断口电压 $v_{ab} = 9\text{ V}$。` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '左侧舞台已经按这道推导串入了 $R_s = 1\\text{ k}\\Omega$ 保护电阻（控制条上的「串 R_s」），$R$ 就是 $a$-$b$ 之间的负载：点一下「短路」「开路」，看工作点 Q 分别落到纵轴 $(0, 9\\text{ mA})$ 和横轴 $(9\\text{ V}, 0)$ 上。',
        },
      ],
      inline_svg: SVG_ACT5,
      figure_caption: '两大理想极限：短路（R = 0）与开路（R → ∞）',
    },
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式分步引导例题——面包板“排雷”实战',
      sync: { layer: 'layer-02-2d-schematic', halo: ['hl_color_bands', 'hl_power_soa'], params: circuit({ r: 200 }) },
      blocks: [
        {
          kind: 'p',
          text: String.raw`光听不练假把式。现在假设你在实体实验室里准备搭电路，随手抓起一只四色环为[[hl_color_bands|**红-黑-棕-金**]]（$200\ \Omega \pm 5\%$）、额定功率 **$1/4\text{ W}$** 的碳膜电阻，打算直接跨接在 **$9\text{ V}$** 电源两端（电流参考方向满足无源符号约定）。`,
        },
        { kind: 'p', text: '在通电之前，请跟着下面 3 步苏格拉底式引导完成“排雷”计算——每一步都设了常见思维陷阱的拦截器，先自己算，再验证！' },
        {
          kind: 'guided',
          title: '面包板排雷：9 V 直连 200 Ω (1/4 W) 碳膜电阻安全诊断',
          source: 'W1-L3-SOCRATIC-01',
          problem:
            '将一只标称 R = 200 Ω（色环：红-黑-棕-金）、额定功率 1/4 W (0.25 W) 的碳膜电阻直接跨接在 v = 9 V 直流电源两端，电流参考方向 i 从电阻正极性端流入（满足无源符号约定）。',
          problem_svg: SVG_ACT6,
          steps: [
            {
              title: 'Step 1 · 求解流过电阻的电流 i',
              mini_svg: MINI_1,
              question: "第一步：先看符号约定。电流参考箭头从电阻的 '+' 端流入，那么欧姆定律应该写成 v = +iR 还是 v = -iR？由此算出 i 是多少毫安（mA）？",
              hint: String.raw`先看箭头进的是 '+' 还是 '−' 端，决定正负号；再把 $v = iR$ 移项成 $i = v/R$。电阻越大电流越小，A 换成 mA 要乘以 1000。`,
              options: [
                { text: '45 mA（0.045 A）', correct: true, feedback: '漂亮！i = 9 / 200 = 0.045 A = 45 mA。记住这个数，下一步换个视角看它的导通能力。' },
                {
                  text: '-45 mA（-0.045 A）',
                  correct: false,
                  feedback:
                    "【无源符号约定判断反转】停一下！看看图中电流箭头 i 是从标着 '+' 的一端流入电阻的，完全满足无源符号约定（PSC），所以应当取正号 v = +iR，算出的电流是 +45 mA，而不是负值。",
                },
                {
                  text: '22.2 A',
                  correct: false,
                  feedback:
                    '【分子分母颠倒（误算成 R / v）】小心别把欧姆定律除反了！v = iR 移项后是 i = v / R = 9 / 200，不是 200 / 9。电阻越大电流应该越小，200 Ω 怎么可能流过 22 A 呢？',
                },
                {
                  text: '0.45 mA',
                  correct: false,
                  feedback: '【小数点与 mA 换算错位】9 / 200 = 0.045 A。从 A 换算到 mA 要乘以 1000（小数点右移三位），0.045 × 1000 = 45 mA，不是 0.45 mA。',
                },
              ],
              board: [String.raw`\text{PSC：}\ v = +iR \;\Rightarrow\; i = \frac{v}{R} = \frac{9\text{ V}}{200\ \Omega} = 0.045\text{ A} = 45\text{ mA}`],
              halo: ['hl_psc_sign'],
            },
            {
              title: 'Step 2 · 计算该电阻的电导 G',
              mini_svg: MINI_2,
              question: '第二步：这只 200 Ω 电阻的电导 G 是多少？请换算成实验室常用的毫西门子（mS），并用 i = Gv 反向验算一遍电流。',
              hint: String.raw`电导是电阻的倒数 $G = 1/R$；$1/200$ 算出来的单位已经是西门子 S，而 $1\text{ S} = 1000\text{ mS}$。`,
              options: [
                { text: '5 mS（0.005 S）', correct: true, feedback: '完全正确！G = 5 mS，反向验算 i = Gv = 5 mS × 9 V = 45 mA，严丝合缝。' },
                {
                  text: '0.005 mS',
                  correct: false,
                  feedback: '【S 与 mS 单位重复缩放】1 / 200 = 0.005 的单位已经是西门子（S）了！再换算成毫西门子（mS）要乘以 1000，得到 5 mS，别忘了乘回去。',
                },
                { text: '200 S', correct: false, feedback: '【混淆电阻 R 与电导 G】200 Ω 是电阻 R，电导 G 是它的倒数 G = 1 / R，数值上要取倒数，单位也从 Ω 变为 S。' },
              ],
              board: [
                String.raw`G = \frac{1}{R} = \frac{1}{200\ \Omega} = 5 \times 10^{-3}\text{ S} = 5\text{ mS}`,
                String.raw`i = Gv = 5\text{ mS} \times 9\text{ V} = 45\text{ mA}`,
              ],
              halo: ['hl_conductance'],
            },
            {
              title: 'Step 3 · 计算耗散功率 p 并判定是否超过 1/4 W 烧毁极限',
              mini_svg: MINI_3,
              question: '第三步（生死裁决）：计算该电阻此刻吸收的功率 p，并与额定值 1/4 W (0.25 W) 对比——你能按下电源开关吗？',
              hint: String.raw`功率要电压和电流一起出场：$p = vi$ 或 $p = v^2/R$；再把 $1/4\text{ W}$ 化成小数，和算出的 $p$ 比一比。`,
              options: [
                {
                  text: 'p = 0.405 W（405 mW），超过 0.25 W（过载 162%），禁止通电！',
                  correct: true,
                  feedback: '排雷成功！200 Ω 低于 9 V 下的 324 Ω 红线，功耗达 405 mW。实战中应立即更换为 1 kΩ 或更高阻值的电阻。',
                },
                {
                  text: 'p = 0.405 W，但 1/4 W ≈ 0.4 W，勉强可以安全通电',
                  correct: false,
                  feedback: '【分数 1/4 换算小数错误】危险！1/4 = 0.25，不是 0.4！0.405 W 已经是额定功率 0.25 W 的 1.62 倍，几秒钟内碳膜就会焦糊冒烟。',
                },
                {
                  text: 'p = 0.045 W（45 mW）< 0.25 W，非常安全',
                  correct: false,
                  feedback:
                    '【漏算电压平方或漏乘电压 v】0.045 是电流（A），不是功率（W）！功率是 p = vi = 9 × 0.045 = 0.405 W（或者 p = v²/R = 81/200 = 0.405 W），漏掉电压因数会让你误判为安全！',
                },
              ],
              board: [
                String.raw`p = vi = \frac{v^2}{R} = \frac{81}{200} = 0.405\text{ W} = 405\text{ mW} > 0.25\text{ W}`,
                String.raw`\frac{0.405\text{ W}}{0.25\text{ W}} = 162\% \implies \text{禁止通电}`,
              ],
              halo: ['hl_power_soa'],
            },
          ],
          conclusion: String.raw`$200\ \Omega$ 低于 $9\text{ V}$ 下的 $324\ \Omega$ 红线：左侧原理图的功率计此刻正闪着 OVERLOAD。把阻值滑块拖到 $1\text{ k}\Omega$，功耗降到 $81\text{ mW}$（$32.4\%$），这才可以放心通电。`,
        },
        { kind: 'p', text: '**【三段式标准复盘 6-1】**' },
        { kind: 'origin', title: '① 公理溯源', text: String.raw`满足 PSC 时，$v = +iR$、$G = \frac{1}{R}$、$p = vi = \frac{v^2}{R}$。` },
        {
          kind: 'formula',
          title: '② 纯符号通式',
          tex: String.raw`i = \frac{v}{R}, \qquad G = \frac{1}{R}, \qquad p = \frac{v^2}{R}, \qquad \text{安全判据 } p \le P_{\text{rated}}`,
        },
        {
          kind: 'calc',
          title: String.raw`③ 代入数值逐步化简：代入 $v = 9\text{ V}$、$R = 200\ \Omega$、$P_{\text{rated}} = 0.25\text{ W}$`,
          steps: [
            { label: 'Step A', tex: String.raw`i = \frac{9}{200} = 0.045\text{ A} = 45\text{ mA}, \qquad G = \frac{1}{200} = 5 \times 10^{-3}\text{ S} = 5\text{ mS}` },
            {
              label: 'Step B',
              tex: String.raw`p = \frac{9^2}{200} = \frac{81}{200} = 0.405\text{ W} = 405\text{ mW} > 0.25\text{ W} \implies \text{过载 } 162\%\text{，禁止通电！}`,
            },
          ],
        },
      ],
    },
    {
      act_index: 7,
      badge: '第 7 幕',
      title: '随堂自测与下节预告（W1-L4 节点与回路拓扑）',
      sync: { layer: 'layer-02-2d-schematic', params: circuit({}) },
      blocks: [
        { kind: 'p', text: '恭喜你打通了欧姆定律的“任督二脉”！在离开今天的实验台前，先独立拿下下面 2 道精准狙击高频坑点的随堂自测题。' },
        {
          kind: 'note',
          tone: 'tip',
          text: String.raw`**下节预告：W1-L4 节点、支路与回路拓扑（Nodes, Branches, and Loops）** 今天我们彻底摸清了单只电阻的“脾气”——物理阻值、欧姆定律正负号、电导斜率、热功率红线，以及短路/开路两极。但真实的电路板上不会只有孤零零的一颗电阻：当十几只电阻、电源、LED 交织成一张网时，哪些点其实是同一个电位？哪些闭合路径是独立的？ 下一讲 **W1-L4**，我们将戴上**图论拓扑（Circuit Topology）**的透视镜，精准解剖电路的三大骨架——**支路（Branches）、节点（Nodes）与回路（Loops）**，并推导出著名的拓扑恒等式 $b = l + n - 1$，为你亲手推开基尔霍夫两大定律（KCL & KVL）的大门！我们下节见。`,
        },
      ],
      inline_svg: SVG_ACT7,
      figure_caption: '随堂自测配图（左：Q1 非 PSC 电阻；右：Q2 断开开关电路）',
      quiz: [
        {
          id: 'w1l3_q1',
          question: "如上图 Q1 所示，已知电阻 R = 5 kΩ，参考电流 i = 2 mA 从标有 '−' 的一端流入、从 '+' 端流出。求该电阻的参考电压 v 与它实际吸收的功率 p。",
          options: [
            { key: 'A', text: 'v = +10 V，p = +20 mW', correct: false },
            { key: 'B', text: 'v = −10 V，p = −20 mW（对外供电）', correct: false },
            { key: 'C', text: 'v = −10 V，p = +20 mW（吸收功率）', correct: true },
            { key: 'D', text: 'v = +10 V，p = +2 mW', correct: false },
          ],
          feedback_correct:
            "① 电流从 '−' 端流入，违背无源符号约定（Non-PSC），故欧姆定律取负号：v = −iR = −(2 mA)(5 kΩ) = −10 V。② 电阻作为无源元件永远只能吸收功率，其吸收功率 p = i²R = (2×10⁻³)² × 5000 = +0.02 W = +20 mW（也可由非 PSC 下的吸收功率公式 p_abs = −vi = −(−10 V)(2 mA) = +20 mW 互验）。",
          feedback_wrong: '再看一眼图中箭头：电流从哪一端流入？回到第 2 幕决定欧姆定律的正负号；再回到第 4 幕想一想，电阻吸收的功率可能是负的吗？',
          sync: { layer: 'layer-02-2d-schematic', halo: ['hl_psc_sign'], params: circuit({ psc: false, r: 5000 }) },
        },
        {
          id: 'w1l3_q2',
          question: '如上图 Q2 所示，一只 9 V 电池通过 1 kΩ 电阻连接一只处于断开状态的开关。此时开关两端的开路电压 v_sw、回路电流 i 以及该断口的等效电导 G 分别是多少？',
          options: [
            { key: 'A', text: 'v_sw = 0 V，i = 0 A，G = 0 S', correct: false },
            { key: 'B', text: 'v_sw = 9 V，i = 0 A，G = 0 S', correct: true },
            { key: 'C', text: 'v_sw = 9 V，i = 9 mA，G = 1 mS', correct: false },
            { key: 'D', text: 'v_sw = 0 V，i = 9 mA，G → ∞', correct: false },
          ],
          feedback_correct:
            '断开的开关属于理想开路（R → ∞），其等效电导 G = 1/R = 0 S，强制回路电流 i = 0 A。由于 1 kΩ 电阻上没有电流流过，其压降 v_R = iR = 0 V，因此电源的全部 9 V 电压完整出现在断开的开关两端（v_sw = 9 V）。切记：开路意味着零电流，绝不意味着零电压！',
          feedback_wrong: '回想第 5 幕：开路强制的是哪个量为零？1 kΩ 电阻上没有电流时，它的压降是多少，电源的 9 V 又落在了哪里？可以在左侧串入 R_s、点「开路」验证。',
          sync: { layer: 'layer-02-2d-schematic', params: circuit({ rs: true }) },
        },
      ],
    },
  ],
};

export default W1_L3;
