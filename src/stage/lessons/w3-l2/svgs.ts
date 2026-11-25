// W3-L2 diagrams. The SHEET_* sources are the lesson sheet's inline SVGs (docs/lessons/W3-L2.md,
// drawn for a dark canvas), reproduced as given; the exports below recolour them with lightSvg and
// make these changes (each `edit` throws if its source text is gone, so a sheet edit can't slip by):
// - colours lightSvg does not map yet (dark panel tints #0b1324 / #422006 / #1c1117 / #2a1215 /
//   #0d2219, the orange #f97316 / pink #f472b6 / violet #c084fc strokes and shapes) get light-theme
//   shades (`light`);
// - wire crossings without a junction (the vₛ wire across R₁'s lead in Fig. 5.6 a/b and Fig. 5.9)
//   get a hop, so the source never seems wired to node 1;
// - the colour emoji ⛔ / ✅ in diagram text become the text marks ✕ / ✓;
// - anti-spoiler: Fig. 5.9 in act 4 (before the guided example) prints "?" for Example 5.2's
//   results (i, vₒ, the gain, iₒ, the error); the full figure follows the guided example in the
//   通关复盘 board. Mini diagrams 2–4 no longer print their step's answer (i₁ = i₂ = 0, the ✓ / ⛔
//   on the KCL nodes, vₒ/vₛ = 1 + R_f/R₁).

import { lightSvg } from '../../svgTheme';

/** replace each `from` (which must be present) by `to` */
function edit(svg: string, pairs: [string, string][]): string {
  return pairs.reduce((s, [from, to]) => {
    if (!s.includes(from)) throw new Error(`W3-L2 svg edit: missing ${from}`);
    return s.split(from).join(to);
  }, svg);
}

const TINT: [RegExp, string][] = [
  [/fill=(["'])#0b1324\1/g, 'fill=$1#f8fafc$1'],
  [/fill=(["'])#422006\1/g, 'fill=$1#fef3c7$1'],
  [/fill=(["'])#1c1117\1/g, 'fill=$1#fff5f5$1'],
  [/fill=(["'])#2a1215\1/g, 'fill=$1#fef2f2$1'],
  [/fill=(["'])#0d2219\1/g, 'fill=$1#f0fdf4$1'],
  [/fill=(["'])#f97316\1/g, 'fill=$1#c2410c$1'],
  [/stroke=(["'])#f97316\1/g, 'stroke=$1#ea580c$1'],
  [/stroke=(["'])#f472b6\1/g, 'stroke=$1#db2777$1'],
  [/stroke=(["'])#7f1d1d\1/g, 'stroke=$1#fca5a5$1'],
  [/fill=(["'])#f472b6\1/g, 'fill=$1#db2777$1'],
  [/stroke=(["'])#c084fc\1/g, 'stroke=$1#9333ea$1'],
];

/** lightSvg plus the shades it does not map yet */
export const light = (svg: string) => TINT.reduce((s, [re, to]) => s.replace(re, to), lightSvg(svg));

const SHEET_ACT1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 420" width="880" height="420" role="img" aria-label="Fig. 5.6 真实 741 闭环电路及其 VCVS 等效求解模型">
  <defs>
    <marker id="arr-cyan-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-amber-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
  </defs>

  <!-- 背景 -->
  <rect x="0" y="0" width="880" height="420" rx="12" fill="#0f172a"/>
  <rect x="14" y="14" width="852" height="392" rx="8" fill="#111827" stroke="#1e293b" stroke-width="1.5"/>

  <!-- 标题栏 -->
  <text x="30" y="42" fill="#f8fafc" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700">LAYER 01 · Fig. 5.6 真实 741 闭环精确求解台（A = 2×10⁵, Rᵢ = 2 MΩ, Rₒ = 50 Ω）</text>
  <line x1="28" y1="54" x2="852" y2="54" stroke="#1e293b" stroke-width="1"/>

  <!-- 左侧：Fig. 5.6(a) 原始闭环电路 -->
  <text x="34" y="78" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="600">(a) 实际闭环拓扑（Fig. 5.6a）</text>

  <!-- 运放三角形 -->
  <polygon points="155,145 155,245 245,195" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
  <text x="165" y="176" fill="#f87171" font-family="monospace" font-size="16" font-weight="700">−</text>
  <text x="165" y="226" fill="#4ade80" font-family="monospace" font-size="16" font-weight="700">+</text>
  <text x="184" y="200" fill="#e2e8f0" font-family="monospace" font-size="12" font-weight="700">741</text>

  <!-- 同相端接 vs -->
  <line x1="155" y1="220" x2="72" y2="220" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="72" y1="220" x2="72" y2="262" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="72" cy="282" r="20" fill="#0f172a" stroke="#4ade80" stroke-width="2"/>
  <text x="72" y="277" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="13" font-weight="700">+</text>
  <text x="72" y="294" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="13" font-weight="700">−</text>
  <text x="42" y="286" text-anchor="end" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">vₛ</text>
  <text x="42" y="302" text-anchor="end" fill="#94a3b8" font-family="monospace" font-size="11">2 V</text>
  <line x1="72" y1="302" x2="72" y2="340" stroke="#e2e8f0" stroke-width="2"/>

  <!-- 反相端节点 1 与 R1 = 10 kΩ -->
  <line x1="155" y1="170" x2="112" y2="170" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="112" cy="170" r="4" fill="#fbbf24"/>
  <text x="103" y="162" text-anchor="end" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="700">v₁</text>
  <line x1="112" y1="170" x2="112" y2="255" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="102" y="255" width="20" height="54" rx="3" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
  <text x="130" y="278" fill="#fbbf24" font-family="monospace" font-size="11" font-weight="700">R₁</text>
  <text x="130" y="294" fill="#cbd5e1" font-family="monospace" font-size="11">10 kΩ</text>
  <line x1="112" y1="309" x2="112" y2="340" stroke="#e2e8f0" stroke-width="2"/>

  <!-- 反馈电阻 Rf = 20 kΩ -->
  <line x1="112" y1="170" x2="112" y2="108" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="112" y1="108" x2="162" y2="108" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="162" y="98" width="66" height="20" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="92" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="700">R_f = 20 kΩ</text>
  <line x1="228" y1="108" x2="275" y2="108" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="275" y1="108" x2="275" y2="195" stroke="#e2e8f0" stroke-width="2"/>

  <!-- 输出节点 vo -->
  <line x1="245" y1="195" x2="312" y2="195" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="275" cy="195" r="4" fill="#38bdf8"/>
  <circle cx="312" cy="195" r="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="320" y="200" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="700">vₒ</text>

  <!-- 电流 i 箭头 -->
  <line x1="258" y1="122" x2="232" y2="122" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-cyan-1)"/>
  <text x="256" y="137" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="700">i</text>

  <!-- 公共地线 -->
  <line x1="56" y1="340" x2="132" y2="340" stroke="#94a3b8" stroke-width="2"/>
  <line x1="92" y1="340" x2="92" y2="354" stroke="#94a3b8" stroke-width="2"/>
  <line x1="78" y1="354" x2="106" y2="354" stroke="#94a3b8" stroke-width="2"/>
  <line x1="84" y1="360" x2="100" y2="360" stroke="#94a3b8" stroke-width="2"/>
  <line x1="89" y1="366" x2="95" y2="366" stroke="#94a3b8" stroke-width="2"/>

  <!-- 中间分割线 -->
  <line x1="352" y1="68" x2="352" y2="392" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="5,5"/>

  <!-- 右侧：Fig. 5.6(b) 真实 741 VCVS 等效电路 -->
  <text x="372" y="78" fill="#fbbf24" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="600">(b) 真实 741 等效求解电路（Fig. 5.6b）</text>

  <!-- 运放内部虚线框 -->
  <rect x="520" y="148" width="250" height="176" rx="8" fill="#0b1324" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,4"/>
  <text x="645" y="167" text-anchor="middle" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">741 内部等效模型</text>

  <!-- 外部电源 vs（节点 2） -->
  <line x1="406" y1="296" x2="406" y2="348" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="406" cy="276" r="20" fill="#0f172a" stroke="#4ade80" stroke-width="2"/>
  <text x="406" y="271" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="13" font-weight="700">+</text>
  <text x="406" y="288" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="13" font-weight="700">−</text>
  <text x="378" y="280" text-anchor="end" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">vₛ</text>
  <line x1="406" y1="256" x2="406" y2="236" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="406" y1="236" x2="555" y2="236" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="555" cy="236" r="4" fill="#4ade80"/>
  <text x="546" y="254" text-anchor="end" fill="#4ade80" font-family="monospace" font-size="11" font-weight="700">节点 2 (v₂ = vₛ)</text>

  <!-- 外部 R1 = 10 kΩ 与节点 1 -->
  <line x1="472" y1="190" x2="555" y2="190" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="472" cy="190" r="4" fill="#fbbf24"/>
  <text x="462" y="182" text-anchor="end" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="700">节点 1 (v₁)</text>
  <line x1="472" y1="190" x2="472" y2="256" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="462" y="256" width="20" height="54" rx="3" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
  <text x="490" y="280" fill="#fbbf24" font-family="monospace" font-size="11" font-weight="700">R₁</text>
  <text x="490" y="296" fill="#cbd5e1" font-family="monospace" font-size="11">10 kΩ</text>
  <line x1="472" y1="310" x2="472" y2="348" stroke="#e2e8f0" stroke-width="2"/>

  <!-- 内部 Ri = 2 MΩ 与 vd 标注 -->
  <line x1="555" y1="190" x2="555" y2="196" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="545" y="196" width="20" height="34" rx="3" fill="#1e293b" stroke="#f472b6" stroke-width="2"/>
  <line x1="555" y1="230" x2="555" y2="236" stroke="#e2e8f0" stroke-width="2"/>
  <text x="574" y="209" fill="#f472b6" font-family="monospace" font-size="11" font-weight="700">Rᵢ = 2 MΩ</text>
  <text x="574" y="225" fill="#fbbf24" font-family="monospace" font-size="11">v_d = v₂ − v₁</text>
  <!-- 输入电流 i1 箭头 -->
  <line x1="502" y1="181" x2="538" y2="181" stroke="#fbbf24" stroke-width="1.8" marker-end="url(#arr-amber-1)"/>
  <text x="520" y="175" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="10">i₁</text>

  <!-- 内部受控电压源 A*vd 与 Ro = 50 Ω -->
  <polygon points="665,244 687,266 665,288 643,266" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="665" y="261" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="700">+</text>
  <text x="665" y="279" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="700">−</text>
  <text x="665" y="305" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="700">A v_d</text>
  <line x1="665" y1="288" x2="665" y2="348" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="665" y1="244" x2="665" y2="195" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="665" y1="195" x2="688" y2="195" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="688" y="185" width="54" height="20" rx="3" fill="#1e293b" stroke="#f97316" stroke-width="2"/>
  <text x="715" y="178" text-anchor="middle" fill="#f97316" font-family="monospace" font-size="11" font-weight="700">Rₒ = 50 Ω</text>
  <line x1="742" y1="195" x2="815" y2="195" stroke="#e2e8f0" stroke-width="2"/>

  <!-- 外部反馈电阻 Rf = 20 kΩ -->
  <line x1="472" y1="190" x2="472" y2="108" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="472" y1="108" x2="600" y2="108" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="600" y="98" width="76" height="20" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="638" y="92" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="700">R_f = 20 kΩ</text>
  <line x1="676" y1="108" x2="795" y2="108" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="795" y1="108" x2="795" y2="195" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="795" cy="195" r="4" fill="#38bdf8"/>
  <circle cx="815" cy="195" r="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="824" y="200" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="700">vₒ</text>

  <!-- 右侧公共地线 -->
  <line x1="392" y1="348" x2="682" y2="348" stroke="#94a3b8" stroke-width="2"/>
  <line x1="540" y1="348" x2="540" y2="362" stroke="#94a3b8" stroke-width="2"/>
  <line x1="526" y1="362" x2="554" y2="362" stroke="#94a3b8" stroke-width="2"/>
  <line x1="532" y1="368" x2="548" y2="368" stroke="#94a3b8" stroke-width="2"/>
  <line x1="537" y1="374" x2="543" y2="374" stroke="#94a3b8" stroke-width="2"/>

  <!-- 底部探针数值条 -->
  <rect x="370" y="378" width="474" height="22" rx="4" fill="#1e293b"/>
  <text x="382" y="393" fill="#e2e8f0" font-family="monospace" font-size="11">SymPy 精确解：vₒ/vₛ = 2.999955 | v_d = 30.05 μV | i₁ = −15.02 pA | i = 0.199997 mA</text>
</svg>`;

const SHEET_ACT2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 400" width="880" height="400" role="img" aria-label="Fig. 5.8 理想运放黄金法则虚断与虚短高亮图及开环对照">
  <defs>
    <marker id="arr-gold-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
    <marker id="arr-gold-rev-2" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 10 1 L 0 5 L 10 9 z" fill="#fbbf24"/>
    </marker>
    <marker id="arr-red-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f87171"/>
    </marker>
  </defs>

  <!-- 背景 -->
  <rect x="0" y="0" width="880" height="400" rx="12" fill="#0f172a"/>
  <rect x="14" y="14" width="852" height="372" rx="8" fill="#111827" stroke="#1e293b" stroke-width="1.5"/>

  <!-- 标题栏 -->
  <text x="30" y="42" fill="#f8fafc" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700">LAYER 02 · Fig. 5.8 理想运放黄金法则（A → ∞, Rᵢ → ∞, Rₒ → 0）</text>
  <line x1="28" y1="54" x2="852" y2="54" stroke="#1e293b" stroke-width="1"/>

  <!-- 左侧：负反馈线性区（黄金法则成立） -->
  <rect x="28" y="68" width="510" height="304" rx="8" fill="#0b1324" stroke="#22c55e" stroke-width="1.5"/>
  <text x="44" y="92" fill="#4ade80" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="700">✓ 存在负反馈（线性工作区）：虚断 + 虚短同时成立</text>

  <!-- 理想运放符号 -->
  <polygon points="240,145 240,285 370,215" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
  <text x="254" y="186" fill="#f87171" font-family="monospace" font-size="18" font-weight="700">−</text>
  <text x="254" y="256" fill="#4ade80" font-family="monospace" font-size="18" font-weight="700">+</text>
  <text x="292" y="210" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="12" font-weight="700">IDEAL</text>
  <text x="292" y="228" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="11">A → ∞</text>

  <!-- 负反馈外环示意 -->
  <path d="M 370 215 L 440 215 L 440 120 L 155 120 L 155 180 L 240 180" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,3"/>
  <rect x="242" y="108" width="118" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="301" y="124" text-anchor="middle" fill="#38bdf8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="700">负反馈网络（必选）</text>

  <!-- 反相输入引线与虚断标注 -->
  <line x1="74" y1="180" x2="240" y2="180" stroke="#e2e8f0" stroke-width="2.5"/>
  <circle cx="155" cy="180" r="4.5" fill="#fbbf24"/>
  <text x="90" y="170" fill="#fbbf24" font-family="monospace" font-size="13" font-weight="700">v₁</text>
  <line x1="172" y1="170" x2="218" y2="170" stroke="#f87171" stroke-width="2" marker-end="url(#arr-red-2)"/>
  <text x="195" y="162" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="12" font-weight="700">i₁ = 0</text>
  <!-- 断路 X 标记 -->
  <line x1="226" y1="173" x2="236" y2="187" stroke="#f87171" stroke-width="2.5"/>
  <line x1="236" y1="173" x2="226" y2="187" stroke="#f87171" stroke-width="2.5"/>

  <!-- 同相输入引线与虚断标注 -->
  <line x1="74" y1="250" x2="240" y2="250" stroke="#e2e8f0" stroke-width="2.5"/>
  <circle cx="155" cy="250" r="4.5" fill="#fbbf24"/>
  <text x="90" y="240" fill="#fbbf24" font-family="monospace" font-size="13" font-weight="700">v₂</text>
  <line x1="172" y1="262" x2="218" y2="262" stroke="#f87171" stroke-width="2" marker-end="url(#arr-red-2)"/>
  <text x="195" y="280" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="12" font-weight="700">i₂ = 0</text>
  <!-- 断路 X 标记 -->
  <line x1="226" y1="243" x2="236" y2="257" stroke="#f87171" stroke-width="2.5"/>
  <line x1="236" y1="243" x2="226" y2="257" stroke="#f87171" stroke-width="2.5"/>

  <!-- 虚短金色双箭头等电位桥 -->
  <line x1="155" y1="190" x2="155" y2="240" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="4,3" marker-start="url(#arr-gold-rev-2)" marker-end="url(#arr-gold-2)"/>
  <rect x="46" y="198" width="98" height="34" rx="5" fill="#422006" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="95" y="213" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="11" font-weight="700">虚短 v₁ = v₂</text>
  <text x="95" y="227" text-anchor="middle" fill="#fde68a" font-family="monospace" font-size="10">v_d = 0（非导线）</text>

  <!-- 输出端 -->
  <line x1="370" y1="215" x2="490" y2="215" stroke="#e2e8f0" stroke-width="2.5"/>
  <circle cx="490" cy="215" r="4.5" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="500" y="220" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="700">vₒ</text>
  <text x="440" y="242" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="11">iₒ ≠ 0（未知）</text>

  <!-- 底部法则卡片 -->
  <rect x="44" y="304" width="225" height="54" rx="6" fill="#1e293b" stroke="#f87171" stroke-width="1.2"/>
  <text x="56" y="324" fill="#f87171" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700">法则 ① 虚断（Virtual Open）</text>
  <text x="56" y="344" fill="#e2e8f0" font-family="monospace" font-size="11">Rᵢ → ∞ ⇒ i₁ = i₂ = 0</text>

  <rect x="284" y="304" width="238" height="54" rx="6" fill="#1e293b" stroke="#fbbf24" stroke-width="1.2"/>
  <text x="296" y="324" fill="#fbbf24" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700">法则 ② 虚短（Virtual Short）</text>
  <text x="296" y="344" fill="#e2e8f0" font-family="monospace" font-size="11">负反馈 + A → ∞ ⇒ v₁ = v₂</text>

  <!-- 右侧：无负反馈警示对照 -->
  <rect x="554" y="68" width="298" height="304" rx="8" fill="#1c1117" stroke="#ef4444" stroke-width="1.5"/>
  <text x="570" y="92" fill="#f87171" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="700">✗ 无负反馈（开环/正反馈）：虚短失效！</text>

  <!-- 开环运放 -->
  <polygon points="658,145 658,235 742,190" fill="#1e293b" stroke="#ef4444" stroke-width="2.5"/>
  <text x="668" y="176" fill="#f87171" font-family="monospace" font-size="15" font-weight="700">−</text>
  <text x="668" y="218" fill="#4ade80" font-family="monospace" font-size="15" font-weight="700">+</text>
  <line x1="598" y1="170" x2="658" y2="170" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="598" y1="212" x2="658" y2="212" stroke="#e2e8f0" stroke-width="2"/>
  <text x="590" y="174" text-anchor="end" fill="#e2e8f0" font-family="monospace" font-size="11">v₁ = 0 V</text>
  <text x="590" y="216" text-anchor="end" fill="#e2e8f0" font-family="monospace" font-size="11">v₂ = 1 mV</text>
  <line x1="742" y1="190" x2="824" y2="190" stroke="#ef4444" stroke-width="2.5"/>
  <text x="790" y="178" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="12" font-weight="700">vₒ = +V_CC</text>
  <text x="790" y="208" text-anchor="middle" fill="#fca5a5" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">瞬间饱和撞轨！</text>

  <!-- 说明框 -->
  <rect x="570" y="254" width="266" height="104" rx="6" fill="#0f172a" stroke="#7f1d1d" stroke-width="1.2"/>
  <text x="582" y="276" fill="#fca5a5" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700">物理机理：</text>
  <text x="582" y="296" fill="#e2e8f0" font-family="monospace" font-size="11">A·v_d = 2×10⁵ × 1 mV = 200 V</text>
  <text x="582" y="314" fill="#e2e8f0" font-family="monospace" font-size="11">远超供电 ±15 V ⇒ 输出钳位 +15 V</text>
  <text x="582" y="334" fill="#fbbf24" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="700">结论：此时 v₁ ≠ v₂，严禁套用虚短！</text>
  <text x="582" y="350" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="10">（但 Rᵢ → ∞ 仍成立，故虚断 i₁ = i₂ = 0 仍可用）</text>
</svg>`;

const SHEET_ACT3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 370" width="880" height="370" role="img" aria-label="理想运放输出端受控电压源透视与KCL禁区解剖图">
  <defs>
    <marker id="arr-green-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4ade80"/>
    </marker>
    <marker id="arr-red-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f87171"/>
    </marker>
    <marker id="arr-cyan-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="880" height="370" rx="12" fill="#0f172a"/>
  <rect x="14" y="14" width="852" height="342" rx="8" fill="#111827" stroke="#1e293b" stroke-width="1.5"/>

  <text x="30" y="42" fill="#f8fafc" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700">LAYER 02 (X-RAY) · 理想运放输出端 KCL 禁区解剖与正确求解顺序</text>
  <line x1="28" y1="54" x2="852" y2="54" stroke="#1e293b" stroke-width="1"/>

  <!-- 左侧：X-Ray 透视理想运放内部 -->
  <polygon points="150,115 150,275 340,195" fill="#0b1324" stroke="#475569" stroke-width="2" stroke-dasharray="6,4"/>
  <!-- 输入端：断路 -->
  <line x1="58" y1="155" x2="178" y2="155" stroke="#4ade80" stroke-width="2.5"/>
  <line x1="58" y1="235" x2="178" y2="235" stroke="#4ade80" stroke-width="2.5"/>
  <circle cx="178" cy="155" r="3.5" fill="#0f172a" stroke="#4ade80" stroke-width="2"/>
  <circle cx="178" cy="235" r="3.5" fill="#0f172a" stroke="#4ade80" stroke-width="2"/>
  <text x="190" y="199" fill="#4ade80" font-family="monospace" font-size="11" font-weight="700">Rᵢ = ∞</text>
  <text x="72" y="145" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">v₁ (绿区：先列 KCL)</text>
  <text x="72" y="255" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">v₂ (i₁ = i₂ = 0)</text>

  <!-- 输出端内部：理想受控电压源 + 隐藏电源轨 -->
  <polygon points="270,175 290,195 270,215 250,195" fill="#0f172a" stroke="#f87171" stroke-width="2"/>
  <text x="270" y="191" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="12" font-weight="700">+</text>
  <text x="270" y="207" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="12" font-weight="700">−</text>
  <line x1="270" y1="215" x2="270" y2="262" stroke="#94a3b8" stroke-width="2"/>
  <line x1="258" y1="262" x2="282" y2="262" stroke="#94a3b8" stroke-width="2"/>
  <line x1="263" y1="267" x2="277" y2="267" stroke="#94a3b8" stroke-width="2"/>
  <text x="270" y="164" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="10">Rₒ = 0</text>

  <!-- 隐藏供电箭标 -->
  <line x1="240" y1="95" x2="240" y2="145" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arr-cyan-3)"/>
  <text x="240" y="88" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="11">+V_CC / −V_CC（暗中供流）</text>

  <!-- 输出线与红区警示圈 -->
  <line x1="270" y1="175" x2="270" y2="195" stroke="#f87171" stroke-width="0"/>
  <line x1="290" y1="195" x2="430" y2="195" stroke="#f87171" stroke-width="2.5"/>
  <line x1="352" y1="183" x2="392" y2="183" stroke="#f87171" stroke-width="2" marker-end="url(#arr-red-3)"/>
  <text x="372" y="175" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="12" font-weight="700">iₒ（未知！）</text>

  <!-- 节点 o 外部支路（反馈 + 负载） -->
  <circle cx="430" cy="195" r="14" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3"/>
  <circle cx="430" cy="195" r="4.5" fill="#ef4444"/>
  <text x="448" y="189" fill="#f87171" font-family="monospace" font-size="13" font-weight="700">节点 o (vₒ)</text>
  <line x1="430" y1="195" x2="430" y2="115" stroke="#38bdf8" stroke-width="2"/>
  <text x="438" y="138" fill="#38bdf8" font-family="monospace" font-size="11">去往 R_f (i_f)</text>
  <line x1="430" y1="195" x2="430" y2="278" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="438" y="256" fill="#94a3b8" font-family="monospace" font-size="11">去往负载 R_L (i_L)</text>

  <!-- 右侧：两张行动卡（禁区 vs SOP） -->
  <rect x="538" y="72" width="310" height="122" rx="8" fill="#2a1215" stroke="#ef4444" stroke-width="1.5"/>
  <text x="554" y="96" fill="#f87171" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="700">⛔ 绝对禁区：求 vₒ 时对输出节点 o 列 KCL</text>
  <text x="554" y="120" fill="#fca5a5" font-family="monospace" font-size="11">错法 1（漏掉 iₒ）：i_f + i_L = 0  → 彻底算错！</text>
  <text x="554" y="142" fill="#e2e8f0" font-family="monospace" font-size="11">错法 2（写上 iₒ）：iₒ = i_f + i_L → 引入新未知数</text>
  <text x="554" y="164" fill="#cbd5e1" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">根本原因：理想运放输出端是受控电压源，电流 iₒ</text>
  <text x="554" y="182" fill="#cbd5e1" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">不受输入端约束，由外接反馈与负载反向决定。</text>

  <rect x="538" y="210" width="310" height="130" rx="8" fill="#0d2219" stroke="#22c55e" stroke-width="1.5"/>
  <text x="554" y="234" fill="#4ade80" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="700">✅ 正确 SOP：理想运放节点分析四步法</text>
  <text x="554" y="258" fill="#e2e8f0" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">Step 1：确认存在负反馈（输出连回反相端 −）。</text>
  <text x="554" y="278" fill="#e2e8f0" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">Step 2：标出黄金法则：i₁ = i₂ = 0 且 v₁ = v₂。</text>
  <text x="554" y="298" fill="#fbbf24" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="700">Step 3：只对反相/同相输入端列 KCL，解出 vₒ。</text>
  <text x="554" y="318" fill="#38bdf8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">Step 4（按需）：最后再对输出端列 KCL 反算 iₒ。</text>
</svg>`;

const SHEET_ACT4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 390" width="880" height="390" role="img" aria-label="Fig. 5.9 Example 5.2 理想运放反馈网络与节点分析标注图">
  <defs>
    <marker id="arr-cyan-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arr-amber-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24"/>
    </marker>
    <marker id="arr-green-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4ade80"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="880" height="390" rx="12" fill="#0f172a"/>
  <rect x="14" y="14" width="852" height="362" rx="8" fill="#111827" stroke="#1e293b" stroke-width="1.5"/>

  <text x="30" y="42" fill="#f8fafc" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700">LAYER 03 · Fig. 5.9 Example 5.2 理想运放节点分析实战台</text>
  <line x1="28" y1="54" x2="852" y2="54" stroke="#1e293b" stroke-width="1"/>

  <!-- 左侧电路区 -->
  <!-- 理想运放三角形 -->
  <polygon points="300,150 300,270 410,210" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
  <text x="313" y="186" fill="#f87171" font-family="monospace" font-size="18" font-weight="700">−</text>
  <text x="313" y="246" fill="#4ade80" font-family="monospace" font-size="18" font-weight="700">+</text>
  <text x="342" y="214" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="12" font-weight="700">IDEAL</text>

  <!-- 同相端输入 vs = 2 V -->
  <line x1="300" y1="240" x2="105" y2="240" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="105" y1="240" x2="105" y2="274" stroke="#e2e8f0" stroke-width="2.5"/>
  <circle cx="105" cy="296" r="22" fill="#0f172a" stroke="#4ade80" stroke-width="2.2"/>
  <text x="105" y="291" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="14" font-weight="700">+</text>
  <text x="105" y="309" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="14" font-weight="700">−</text>
  <text x="74" y="294" text-anchor="end" fill="#4ade80" font-family="monospace" font-size="13" font-weight="700">vₛ</text>
  <text x="74" y="311" text-anchor="end" fill="#94a3b8" font-family="monospace" font-size="11">2 V</text>
  <line x1="105" y1="318" x2="105" y2="348" stroke="#e2e8f0" stroke-width="2.5"/>

  <!-- 节点 2 与虚断 i2=0 -->
  <circle cx="205" cy="240" r="4.5" fill="#4ade80"/>
  <text x="195" y="260" text-anchor="end" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">v₂ = vₛ = 2 V</text>
  <line x1="238" y1="252" x2="282" y2="252" stroke="#f87171" stroke-width="2" marker-end="url(#arr-amber-4)"/>
  <text x="260" y="270" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="11" font-weight="700">i₂ = 0</text>

  <!-- 反相端节点 1 与 R1 = 10 kΩ -->
  <line x1="300" y1="180" x2="205" y2="180" stroke="#e2e8f0" stroke-width="2.5"/>
  <circle cx="205" cy="180" r="5.5" fill="#fbbf24"/>
  <text x="193" y="172" text-anchor="end" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="700">节点 1 (v₁ = v₂ = vₛ)</text>
  <line x1="238" y1="168" x2="282" y2="168" stroke="#f87171" stroke-width="2" marker-end="url(#arr-amber-4)"/>
  <text x="260" y="160" text-anchor="middle" fill="#f87171" font-family="monospace" font-size="11" font-weight="700">i₁ = 0</text>

  <!-- 虚短虚线桥 -->
  <line x1="205" y1="188" x2="205" y2="232" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,3"/>

  <!-- R1 = 10 kΩ 支路 -->
  <line x1="205" y1="180" x2="205" y2="262" stroke="#e2e8f0" stroke-width="0"/>
  <line x1="205" y1="180" x2="155" y2="180" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="155" y1="180" x2="155" y2="262" stroke="#e2e8f0" stroke-width="2.5"/>
  <rect x="144" y="262" width="22" height="56" rx="3" fill="#1e293b" stroke="#fbbf24" stroke-width="2.2"/>
  <text x="174" y="286" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="700">R₁</text>
  <text x="174" y="303" fill="#cbd5e1" font-family="monospace" font-size="11">10 kΩ</text>
  <line x1="155" y1="318" x2="155" y2="348" stroke="#e2e8f0" stroke-width="2.5"/>
  <!-- 电流 i_R1 向下 -->
  <line x1="136" y1="212" x2="136" y2="246" stroke="#fbbf24" stroke-width="2" marker-end="url(#arr-amber-4)"/>
  <text x="128" y="233" text-anchor="end" fill="#fbbf24" font-family="monospace" font-size="11" font-weight="700">i</text>

  <!-- 反馈电阻 Rf = 20 kΩ -->
  <line x1="205" y1="180" x2="205" y2="104" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="205" y1="104" x2="310" y2="104" stroke="#e2e8f0" stroke-width="2.5"/>
  <rect x="310" y="93" width="84" height="22" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2.2"/>
  <text x="352" y="86" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="700">R_f = 20 kΩ</text>
  <line x1="394" y1="104" x2="475" y2="104" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="475" y1="104" x2="475" y2="210" stroke="#e2e8f0" stroke-width="2.5"/>

  <!-- 反馈电流箭头（从右向左） -->
  <line x1="448" y1="120" x2="408" y2="120" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-cyan-4)"/>
  <text x="428" y="136" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="700">i = 0.2 mA</text>

  <!-- 输出端与 io 箭头 -->
  <line x1="410" y1="210" x2="525" y2="210" stroke="#e2e8f0" stroke-width="2.5"/>
  <line x1="422" y1="196" x2="462" y2="196" stroke="#4ade80" stroke-width="2.2" marker-end="url(#arr-green-4)"/>
  <text x="442" y="188" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">iₒ</text>
  <circle cx="475" cy="210" r="4.5" fill="#38bdf8"/>
  <circle cx="525" cy="210" r="4.5" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="536" y="215" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="700">vₒ = 6 V</text>

  <!-- 公共地线 -->
  <line x1="88" y1="348" x2="178" y2="348" stroke="#94a3b8" stroke-width="2"/>
  <line x1="130" y1="348" x2="130" y2="360" stroke="#94a3b8" stroke-width="2"/>
  <line x1="118" y1="360" x2="142" y2="360" stroke="#94a3b8" stroke-width="2"/>
  <line x1="123" y1="365" x2="137" y2="365" stroke="#94a3b8" stroke-width="2"/>

  <!-- 右侧：实时计算结果板 -->
  <rect x="615" y="72" width="235" height="288" rx="8" fill="#0b1324" stroke="#334155" stroke-width="1.5"/>
  <text x="630" y="98" fill="#fbbf24" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="700">Example 5.2 实战仪表盘</text>
  <line x1="630" y1="108" x2="835" y2="108" stroke="#1e293b" stroke-width="1"/>

  <text x="630" y="132" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">1. 黄金法则直接定位</text>
  <text x="630" y="152" fill="#e2e8f0" font-family="monospace" font-size="12">v₁ = v₂ = vₛ = 2 V</text>
  <text x="630" y="170" fill="#e2e8f0" font-family="monospace" font-size="12">i₁ = i₂ = 0 A</text>

  <text x="630" y="200" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">2. 节点 1 列 KCL（避开输出端）</text>
  <text x="630" y="220" fill="#38bdf8" font-family="monospace" font-size="12">v₁/R₁ = (vₒ − v₁)/R_f</text>
  <text x="630" y="240" fill="#38bdf8" font-family="monospace" font-size="12">vₒ/vₛ = 1 + R_f/R₁ = 3</text>

  <text x="630" y="270" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">3. 输出节点 o 反算 iₒ</text>
  <text x="630" y="290" fill="#4ade80" font-family="monospace" font-size="12">iₒ = (vₒ − v₁)/R_f</text>
  <text x="630" y="310" fill="#4ade80" font-family="monospace" font-size="12">iₒ = (6 − 2)/20k = 0.2 mA</text>

  <rect x="630" y="324" width="205" height="24" rx="4" fill="#1e293b"/>
  <text x="732" y="340" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="11">对比 741 误差：0.0015%</text>
</svg>`;

const SHEET_ACT5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 260" width="880" height="260" role="img" aria-label="理想运放黄金法则节点分析决策树">
  <defs>
    <marker id="arr-w-5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8"/>
    </marker>
    <marker id="arr-g-5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4ade80"/>
    </marker>
    <marker id="arr-r-5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f87171"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="880" height="260" rx="12" fill="#0f172a"/>
  <rect x="14" y="14" width="852" height="232" rx="8" fill="#111827" stroke="#1e293b" stroke-width="1.5"/>
  <text x="30" y="40" fill="#f8fafc" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="700">W3-L2 作战全景图：理想运放节点分析标准决策链</text>

  <!-- Step 1 -->
  <rect x="30" y="70" width="160" height="72" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
  <text x="110" y="96" text-anchor="middle" fill="#fbbf24" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700">① 负反馈检票口</text>
  <text x="110" y="116" text-anchor="middle" fill="#e2e8f0" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">输出是否连回 (−) 端？</text>
  <text x="110" y="132" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="10">Check Negative FB</text>

  <!-- 否分支 -->
  <line x1="110" y1="142" x2="110" y2="178" stroke="#f87171" stroke-width="2" marker-end="url(#arr-r-5)"/>
  <text x="118" y="164" fill="#f87171" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="700">否</text>
  <rect x="30" y="182" width="160" height="48" rx="6" fill="#2a1215" stroke="#ef4444" stroke-width="1.5"/>
  <text x="110" y="203" text-anchor="middle" fill="#f87171" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="700">⛔ 禁用虚短！</text>
  <text x="110" y="220" text-anchor="middle" fill="#fca5a5" font-family="monospace" font-size="10">比较器饱和 ±V_CC</text>

  <!-- 是分支 -> Step 2 -->
  <line x1="190" y1="106" x2="238" y2="106" stroke="#4ade80" stroke-width="2" marker-end="url(#arr-g-5)"/>
  <text x="212" y="98" text-anchor="middle" fill="#4ade80" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="700">是</text>

  <rect x="242" y="70" width="175" height="72" rx="8" fill="#1e293b" stroke="#4ade80" stroke-width="2"/>
  <text x="329" y="96" text-anchor="middle" fill="#4ade80" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700">② 启用双黄金法则</text>
  <text x="329" y="116" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="11">i₁ = i₂ = 0 (虚断)</text>
  <text x="329" y="132" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="11">v₁ = v₂ (虚短≠真短)</text>

  <!-- Step 2 -> Step 3 -->
  <line x1="417" y1="106" x2="455" y2="106" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr-w-5)"/>

  <rect x="459" y="70" width="185" height="72" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="551" y="96" text-anchor="middle" fill="#38bdf8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700">③ 输入节点列 KCL</text>
  <text x="551" y="116" text-anchor="middle" fill="#e2e8f0" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">严禁先对输出端列 KCL</text>
  <text x="551" y="132" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11">解出纯符号通式 vₒ</text>

  <!-- Step 3 -> Step 4 -->
  <line x1="644" y1="106" x2="682" y2="106" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr-w-5)"/>

  <rect x="686" y="70" width="164" height="72" rx="8" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
  <text x="768" y="96" text-anchor="middle" fill="#c084fc" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700">④ 验饱和与反算 iₒ</text>
  <text x="768" y="116" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="11">|vₒ| &lt; V_CC 核验</text>
  <text x="768" y="132" text-anchor="middle" fill="#c084fc" font-family="monospace" font-size="11">节点 o 列 KCL 求 iₒ</text>

  <!-- 底部总结条 -->
  <rect x="242" y="182" width="608" height="48" rx="6" fill="#0b1324" stroke="#334155" stroke-width="1.2"/>
  <text x="546" y="203" text-anchor="middle" fill="#e2e8f0" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700">教授口诀：一查负反馈，二标断与短，三避输出列节点，四算电流验轨限。</text>
  <text x="546" y="221" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="11">Example 5.2 实测：3 行方程 = 真实 741 精确解的 99.9985% 精度</text>
</svg>`;

const SHEET_MINI1 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 120' width='320' height='120'><rect width='320' height='120' rx='8' fill='#0f172a'/><polygon points='120,35 120,95 185,65' fill='#1e293b' stroke='#38bdf8' stroke-width='2'/><text x='128' y='56' fill='#f87171' font-family='monospace' font-size='13'>−</text><text x='128' y='84' fill='#4ade80' font-family='monospace' font-size='13'>+</text><path d='M 185 65 L 225 65 L 225 22 L 85 22 L 85 50 L 120 50' fill='none' stroke='#fbbf24' stroke-width='2.5'/><rect x='135' y='13' width='46' height='18' rx='3' fill='#422006' stroke='#fbbf24' stroke-width='1.5'/><text x='158' y='26' text-anchor='middle' fill='#fbbf24' font-family='monospace' font-size='10'>20 kΩ</text><text x='240' y='69' fill='#38bdf8' font-family='monospace' font-size='12'>vₒ</text><text x='160' y='112' text-anchor='middle' fill='#94a3b8' font-family='sans-serif' font-size='10'>Step 1：检查输出到反相端的反馈环</text></svg>`;

const SHEET_MINI2 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 120' width='320' height='120'><rect width='320' height='120' rx='8' fill='#0f172a'/><polygon points='170,30 170,96 240,63' fill='#1e293b' stroke='#38bdf8' stroke-width='2'/><text x='179' y='52' fill='#f87171' font-family='monospace' font-size='13'>−</text><text x='179' y='84' fill='#4ade80' font-family='monospace' font-size='13'>+</text><line x1='80' y1='46' x2='170' y2='46' stroke='#e2e8f0' stroke-width='2'/><line x1='80' y1='80' x2='170' y2='80' stroke='#e2e8f0' stroke-width='2'/><line x1='115' y1='46' x2='115' y2='80' stroke='#fbbf24' stroke-width='2' stroke-dasharray='3,3'/><text x='56' y='50' fill='#fbbf24' font-family='monospace' font-size='11'>v₁=?</text><text x='46' y='84' fill='#4ade80' font-family='monospace' font-size='11'>v₂=vₛ</text><text x='145' y='40' fill='#f87171' font-family='monospace' font-size='10'>i₁=0</text><text x='145' y='94' fill='#f87171' font-family='monospace' font-size='10'>i₂=0</text></svg>`;

const SHEET_MINI3 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 120' width='320' height='120'><rect width='320' height='120' rx='8' fill='#0f172a'/><circle cx='105' cy='58' r='10' fill='none' stroke='#4ade80' stroke-width='2'/><circle cx='105' cy='58' r='4' fill='#4ade80'/><text x='105' y='40' text-anchor='middle' fill='#4ade80' font-family='monospace' font-size='11'>节点 1 (✓)</text><line x1='105' y1='58' x2='105' y2='104' stroke='#fbbf24' stroke-width='2'/><text x='78' y='90' fill='#fbbf24' font-family='monospace' font-size='10'>R₁</text><line x1='105' y1='58' x2='225' y2='58' stroke='#38bdf8' stroke-width='2'/><rect x='145' y='50' width='42' height='16' rx='2' fill='#1e293b' stroke='#38bdf8'/><text x='166' y='44' text-anchor='middle' fill='#38bdf8' font-family='monospace' font-size='10'>R_f</text><circle cx='225' cy='58' r='10' fill='none' stroke='#ef4444' stroke-width='2' stroke-dasharray='3,2'/><text x='225' y='40' text-anchor='middle' fill='#f87171' font-family='monospace' font-size='11'>节点 o (⛔)</text></svg>`;

const SHEET_MINI4 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 120' width='320' height='120'><rect width='320' height='120' rx='8' fill='#0f172a'/><rect x='22' y='22' width='276' height='76' rx='6' fill='#1e293b' stroke='#38bdf8' stroke-width='1.5'/><text x='160' y='50' text-anchor='middle' fill='#fbbf24' font-family='monospace' font-size='13' font-weight='700'>vₒ / vₛ = 1 + R_f / R₁</text><text x='160' y='78' text-anchor='middle' fill='#e2e8f0' font-family='monospace' font-size='11'>R₁ = 10 kΩ, R_f = 20 kΩ, vₛ = 2 V</text></svg>`;

const SHEET_MINI5 = String.raw`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 120' width='320' height='120'><rect width='320' height='120' rx='8' fill='#0f172a'/><polygon points='50,35 50,95 110,65' fill='#1e293b' stroke='#38bdf8' stroke-width='2'/><line x1='110' y1='65' x2='240' y2='65' stroke='#e2e8f0' stroke-width='2'/><circle cx='185' cy='65' r='4' fill='#4ade80'/><line x1='185' y1='65' x2='185' y2='24' stroke='#38bdf8' stroke-width='2'/><text x='194' y='40' fill='#38bdf8' font-family='monospace' font-size='11'>去往 R_f (20 kΩ)</text><text x='145' y='56' text-anchor='middle' fill='#4ade80' font-family='monospace' font-size='12' font-weight='700'>iₒ →</text><text x='248' y='69' fill='#38bdf8' font-family='monospace' font-size='12'>vₒ=6V</text></svg>`;

/* ------------------------------------------------------------- act diagrams */

/** Act 1 · Fig. 5.6 (a) and (b): the 741 closed loop and its equivalent model */
export const SVG_ACT1 = light(
  edit(SHEET_ACT1, [
    [
      '<line x1="155" y1="220" x2="72" y2="220" stroke="#e2e8f0" stroke-width="2"/>',
      '<path d="M 155 220 H 119 A 7 7 0 0 0 105 220 H 72" fill="none" stroke="#e2e8f0" stroke-width="2"/>',
    ],
    [
      '<line x1="406" y1="236" x2="555" y2="236" stroke="#e2e8f0" stroke-width="2"/>',
      '<path d="M 406 236 H 465 A 7 7 0 0 1 479 236 H 555" fill="none" stroke="#e2e8f0" stroke-width="2"/>',
    ],
    // the node-2 label sat across R₁'s lead, and the probe line ran past the end of its bar
    [
      '<text x="546" y="254" text-anchor="end" fill="#4ade80" font-family="monospace" font-size="11" font-weight="700">节点 2 (v₂ = vₛ)</text>',
      '<text x="546" y="254" text-anchor="end" fill="#4ade80" font-family="monospace" font-size="11" font-weight="700">节点 2</text><text x="574" y="252" fill="#4ade80" font-family="monospace" font-size="11" font-weight="700">(v₂ = vₛ)</text>',
    ],
    [
      '<text x="382" y="393" fill="#e2e8f0" font-family="monospace" font-size="11">',
      '<text x="382" y="393" fill="#e2e8f0" font-family="monospace" font-size="10.5" textLength="452" lengthAdjust="spacingAndGlyphs">',
    ],
  ]),
);

/** Act 2 · Fig. 5.8: the golden rules, with the open-loop counter-example (the virtual-short card
 *  moves up 4 so the v₂ label under it stays clear) */
export const SVG_ACT2 = light(
  edit(SHEET_ACT2, [
    ['<rect x="46" y="198" width="98" height="34" rx="5" fill="#422006"', '<rect x="46" y="194" width="98" height="34" rx="5" fill="#422006"'],
    ['<text x="95" y="213" text-anchor="middle" fill="#fbbf24"', '<text x="95" y="209" text-anchor="middle" fill="#fbbf24"'],
    ['<text x="95" y="227" text-anchor="middle" fill="#fde68a"', '<text x="95" y="223" text-anchor="middle" fill="#fde68a"'],
  ]),
);

/** Act 3 · the output stage X-ray and the forbidden output-node KCL */
export const SVG_ACT3 = light(
  edit(SHEET_ACT3, [
    ['⛔ 绝对禁区', '✕ 绝对禁区'],
    ['✅ 正确 SOP', '✓ 正确 SOP'],
  ]),
);

/** Fig. 5.9 layout: a hop where vₛ's wire crosses R₁'s lead; the v₂ label and the arrow i, which sat
 *  across that crossing, move clear of it */
const ACT4_LAYOUT: [string, string][] = [
  [
    '<line x1="300" y1="240" x2="105" y2="240" stroke="#e2e8f0" stroke-width="2.5"/>',
    '<path d="M 300 240 H 162 A 7 7 0 0 0 148 240 H 105" fill="none" stroke="#e2e8f0" stroke-width="2.5"/>',
  ],
  ['<text x="195" y="260" text-anchor="end" fill="#4ade80"', '<text x="212" y="228" fill="#4ade80"'],
  ['<line x1="136" y1="212" x2="136" y2="246" stroke="#fbbf24"', '<line x1="136" y1="190" x2="136" y2="226" stroke="#fbbf24"'],
  ['<text x="128" y="233" text-anchor="end" fill="#fbbf24"', '<text x="128" y="214" text-anchor="end" fill="#fbbf24"'],
];

/** Act 4 · Fig. 5.9 with Example 5.2's results covered (it comes before the guided example) */
export const SVG_ACT4 = light(
  edit(SHEET_ACT4, [
    ...ACT4_LAYOUT,
    ['>i = 0.2 mA</text>', '>i = ?</text>'],
    ['>vₒ = 6 V</text>', '>vₒ = ?</text>'],
    ['>vₒ/vₛ = 1 + R_f/R₁ = 3</text>', '>vₒ/vₛ = 1 + R_f/R₁ = ?</text>'],
    ['>iₒ = (6 − 2)/20k = 0.2 mA</text>', '>iₒ = ?</text>'],
    ['>对比 741 误差：0.0015%</text>', '>对比 741 误差：?</text>'],
  ]),
);

/** Fig. 5.9 as the sheet draws it, every result printed: the 通关复盘 board after the guided example */
export const SVG_ACT4_FULL = light(edit(SHEET_ACT4, ACT4_LAYOUT));

/** Act 5 · the decision chain of ideal-op-amp nodal analysis */
export const SVG_ACT5 = light(edit(SHEET_ACT5, [['⛔ 禁用虚短！', '✕ 禁用虚短！']]));

/* ------------------------------------------------------------- guided example */

export const MINI_STEP1 = light(SHEET_MINI1);
export const MINI_STEP2 = light(
  edit(SHEET_MINI2, [
    ['>i₁=0</text>', '>i₁=?</text>'],
    ['>i₂=0</text>', '>i₂=?</text>'],
  ]),
);
export const MINI_STEP3 = light(
  edit(SHEET_MINI3, [
    [
      "<circle cx='105' cy='58' r='10' fill='none' stroke='#4ade80' stroke-width='2'/><circle cx='105' cy='58' r='4' fill='#4ade80'/><text x='105' y='40' text-anchor='middle' fill='#4ade80' font-family='monospace' font-size='11'>节点 1 (✓)</text>",
      "<circle cx='105' cy='58' r='10' fill='none' stroke='#fbbf24' stroke-width='2'/><circle cx='105' cy='58' r='4' fill='#fbbf24'/><text x='105' y='40' text-anchor='middle' fill='#fbbf24' font-family='monospace' font-size='11'>节点 1 ?</text>",
    ],
    [
      "<circle cx='225' cy='58' r='10' fill='none' stroke='#ef4444' stroke-width='2' stroke-dasharray='3,2'/><text x='225' y='40' text-anchor='middle' fill='#f87171' font-family='monospace' font-size='11'>节点 o (⛔)</text>",
      "<circle cx='225' cy='58' r='10' fill='none' stroke='#38bdf8' stroke-width='2'/><text x='225' y='40' text-anchor='middle' fill='#38bdf8' font-family='monospace' font-size='11'>节点 o ?</text>",
    ],
  ]),
);
export const MINI_STEP4 = light(edit(SHEET_MINI4, [['>vₒ / vₛ = 1 + R_f / R₁</text>', '>vₒ / vₛ = ?</text>']]));
export const MINI_STEP5 = light(SHEET_MINI5);

/** the guided example's problem: Fig. 5.9 with the unknowns marked (new, in the sheet's style) */
export const PROBLEM = light(String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 266" role="img" aria-label="Example 5.2：理想运放同相闭环，求 vₒ/vₛ、vₒ 与 iₒ">
  <rect x="0" y="0" width="520" height="266" rx="10" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600">Example 5.2 · Fig. 5.9（理想运放）：求 vₒ/vₛ、vₒ 与 iₒ</text>
  <g transform="translate(0 16)">
  <polygon points="250,70 250,170 340,120" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
  <text x="258" y="100" fill="#f87171" font-family="monospace" font-size="15" font-weight="700">−</text>
  <text x="258" y="152" fill="#4ade80" font-family="monospace" font-size="15" font-weight="700">+</text>
  <text x="286" y="125" fill="#e2e8f0" font-family="monospace" font-size="11" font-weight="700">IDEAL</text>
  <line x1="110" y1="95" x2="250" y2="95" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="110" cy="95" r="4" fill="#fbbf24"/>
  <text x="120" y="86" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="700">v₁</text>
  <line x1="110" y1="95" x2="110" y2="150" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="100" y="150" width="20" height="46" rx="3" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
  <text x="92" y="170" text-anchor="end" fill="#fbbf24" font-family="monospace" font-size="11" font-weight="700">R₁</text>
  <text x="92" y="185" text-anchor="end" fill="#cbd5e1" font-family="monospace" font-size="11">10 kΩ</text>
  <line x1="110" y1="196" x2="110" y2="224" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="110" y1="95" x2="110" y2="48" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="110" y1="48" x2="220" y2="48" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="220" y="38" width="76" height="20" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="258" y="34" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="700">R_f = 20 kΩ</text>
  <line x1="296" y1="48" x2="390" y2="48" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="390" y1="48" x2="390" y2="120" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="340" y1="120" x2="450" y2="120" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="390" cy="120" r="4" fill="#38bdf8"/>
  <circle cx="450" cy="120" r="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="458" y="125" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="700">vₒ = ?</text>
  <line x1="350" y1="134" x2="380" y2="134" stroke="#4ade80" stroke-width="2"/>
  <polygon points="380,129 388,134 380,139" fill="#4ade80"/>
  <text x="365" y="152" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">iₒ = ?</text>
  <line x1="250" y1="145" x2="200" y2="145" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="200" y1="145" x2="200" y2="164" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="200" cy="145" r="4" fill="#4ade80"/>
  <circle cx="200" cy="182" r="18" fill="#0f172a" stroke="#4ade80" stroke-width="2"/>
  <text x="200" y="178" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">+</text>
  <text x="200" y="193" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">−</text>
  <text x="226" y="180" fill="#4ade80" font-family="monospace" font-size="12" font-weight="700">vₛ</text>
  <text x="226" y="195" fill="#94a3b8" font-family="monospace" font-size="11">2 V</text>
  <line x1="200" y1="200" x2="200" y2="224" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="96" y1="224" x2="214" y2="224" stroke="#94a3b8" stroke-width="2"/>
  <line x1="155" y1="224" x2="155" y2="232" stroke="#94a3b8" stroke-width="2"/>
  <line x1="143" y1="232" x2="167" y2="232" stroke="#94a3b8" stroke-width="2"/>
  <line x1="148" y1="237" x2="162" y2="237" stroke="#94a3b8" stroke-width="2"/>
  <line x1="152" y1="242" x2="158" y2="242" stroke="#94a3b8" stroke-width="2"/>
  <text x="504" y="236" text-anchor="end" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">vₒ/vₛ = ?</text>
</g>
</svg>`);
