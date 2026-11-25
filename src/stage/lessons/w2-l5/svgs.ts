// The act diagrams of the W2-L5 lesson sheet (docs/lessons/W2-L5.md) and the step diagrams of
// its guided-example JSON, copied from the sheet by a script (not retyped), drawn for a dark
// canvas and recoloured for the light theme by lightSvg. Changes, colour and layout only:
// - small foreground shapes the sheet fills with a pale colour (node dots in acts 2 and 6, the
//   arrowhead of act 1) are filled with ink: lightSvg keeps pale fills, and they vanished on white;
// - SVG_ACT5_A is act 5's diagram with its left panel only (the right panel is the act 6
//   challenge, so it waits for the review after the guided example): viewBox cut to that panel,
//   its title set on two lines to fit;
// - the step 2 and 3 diagrams get the missing “2Ω” label next to R2; the step diagrams are
//   capped at 380 px wide (inline style), so they do not blow up to the full card width;
// - act 4: the two KCL lines drop to font-size 10.5 (they ran past their boxes);
// - act 3: the “3A 开路” tag moves right of its open branch (it ran over “i′ = 0.5 A”);
// - every act diagram carries class="w5-wide" (it scrolls sideways on a phone instead of
//   shrinking its text, w2l5.css).
// The quiz diagrams (new: the sheet has none) are in quizFigures.ts.

import { lightSvg } from '../../svgTheme';

const wide = (s: string) => lightSvg(s.replace('<svg ', '<svg class="w5-wide" '));

export const SVG_ACT1 = wide(String.raw`<svg viewBox="0 0 760 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="线性性质：齐次性与可加性示意">
  <rect width="760" height="280" rx="12" fill="#0F172A"/>
  <text x="24" y="30" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="15" font-weight="700">Act 1 · 线性电路的两大支柱：齐次性（比例缩放）与可加性（多源叠加）</text>

  <!-- Left Panel: Homogeneity -->
  <rect x="20" y="48" width="350" height="212" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
  <text x="36" y="72" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="13" font-weight="700">① 齐次性 (Homogeneity)：输入 × k → 输出 × k</text>

  <!-- Circuit schematic inside left panel -->
  <line x1="65" y1="115" x2="120" y2="115" stroke="#E2E8F0" stroke-width="2"/>
  <!-- R1 = 4 ohm -->
  <polyline points="120,115 128,105 138,125 148,105 158,125 168,105 176,115" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="148" y="96" fill="#F59E0B" font-family="monospace" font-size="12" text-anchor="middle">R₁ = 4 Ω</text>
  <line x1="176" y1="115" x2="230" y2="115" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="230" cy="115" r="3.5" fill="#38BDF8"/>
  <!-- R2 = 6 ohm -->
  <line x1="230" y1="115" x2="230" y2="132" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="230,132 220,140 240,150 220,160 240,170 220,180 230,188" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="274" y="164" fill="#F59E0B" font-family="monospace" font-size="12" text-anchor="middle">R₂ = 6 Ω</text>
  <line x1="230" y1="188" x2="230" y2="208" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="65" y1="208" x2="230" y2="208" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Vs circle -->
  <line x1="65" y1="115" x2="65" y2="140" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="65" cy="162" r="22" fill="#0F172A" stroke="#38BDF8" stroke-width="2.2"/>
  <text x="65" y="156" fill="#38BDF8" font-family="monospace" font-size="14" font-weight="700" text-anchor="middle">+</text>
  <text x="65" y="176" fill="#38BDF8" font-family="monospace" font-size="14" font-weight="700" text-anchor="middle">−</text>
  <line x1="65" y1="184" x2="65" y2="208" stroke="#E2E8F0" stroke-width="2"/>
  <text x="36" y="166" fill="#38BDF8" font-family="monospace" font-size="12" text-anchor="end">Vs</text>

  <!-- Scaling comparison box -->
  <rect x="36" y="218" width="318" height="32" rx="6" fill="#0F172A" stroke="#38BDF8" stroke-width="1"/>
  <text x="195" y="238" fill="#E2E8F0" font-family="monospace" font-size="11.5" text-anchor="middle">Vs=10V → Vo=6V  |  Vs=30V (×3) → Vo=18V (×3)</text>

  <!-- Right Panel: Additivity -->
  <rect x="390" y="48" width="350" height="212" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
  <text x="406" y="72" fill="#34D399" font-family="system-ui, sans-serif" font-size="13" font-weight="700">② 可加性 (Additivity)：水泵1 + 水泵2 = 合并响应</text>

  <!-- Linear Network Block Diagram -->
  <rect x="415" y="102" width="76" height="34" rx="6" fill="#0F172A" stroke="#38BDF8" stroke-width="1.8"/>
  <text x="453" y="123" fill="#38BDF8" font-family="monospace" font-size="12" text-anchor="middle">源 1 (x₁)</text>
  <rect x="415" y="156" width="76" height="34" rx="6" fill="#0F172A" stroke="#34D399" stroke-width="1.8"/>
  <text x="453" y="177" fill="#34D399" font-family="monospace" font-size="12" text-anchor="middle">源 2 (x₂)</text>

  <line x1="491" y1="119" x2="532" y2="136" stroke="#38BDF8" stroke-width="2"/>
  <line x1="491" y1="173" x2="532" y2="156" stroke="#34D399" stroke-width="2"/>

  <rect x="532" y="110" width="96" height="72" rx="8" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
  <text x="580" y="142" fill="#F59E0B" font-family="system-ui, sans-serif" font-size="12.5" font-weight="700" text-anchor="middle">线性网络</text>
  <text x="580" y="160" fill="#94A3B8" font-family="monospace" font-size="10.5" text-anchor="middle">R + 线性受控源</text>

  <line x1="628" y1="146" x2="655" y2="146" stroke="#E2E8F0" stroke-width="2.2"/>
  <polygon points="655,141 665,146 655,151" fill="#1f2a44"/>

  <rect x="665" y="118" width="62" height="56" rx="6" fill="#0F172A" stroke="#E2E8F0" stroke-width="1.8"/>
  <text x="696" y="143" fill="#F8FAFC" font-family="monospace" font-size="12" font-weight="700" text-anchor="middle">y₁+y₂</text>
  <text x="696" y="161" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">电压/电流</text>

  <rect x="406" y="218" width="318" height="32" rx="6" fill="#0F172A" stroke="#34D399" stroke-width="1"/>
  <text x="565" y="238" fill="#E2E8F0" font-family="monospace" font-size="11.5" text-anchor="middle">f(x₁ + x₂) = f(x₁) + f(x₂)  [仅对 v, i 成立]</text>
</svg>`);

export const SVG_ACT2 = wide(String.raw`<svg viewBox="0 0 840 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="叠加定理三联拓扑演化图：原电路到两个子电路">
  <rect width="840" height="300" rx="12" fill="#0F172A"/>
  <text x="24" y="30" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="15" font-weight="700">Act 2 · 独立源置零手术：原电路 → 子电路 1（电流源开路） + 子电路 2（电压源短路）</text>

  <!-- Panel 1: Original Circuit -->
  <rect x="16" y="48" width="252" height="232" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
  <text x="142" y="70" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">原电路（Vs 与 Is 共存）</text>
  <!-- Wires -->
  <line x1="48" y1="112" x2="78" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="78,112 84,102 92,122 100,102 108,122 116,102 122,112" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="100" y="95" fill="#F59E0B" font-family="monospace" font-size="11" text-anchor="middle">R₁</text>
  <line x1="122" y1="112" x2="224" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="156" cy="112" r="3.5" fill="#1f2a44"/>
  <!-- R2 vertical -->
  <line x1="156" y1="112" x2="156" y2="134" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="156,134 148,141 164,149 148,157 164,165 148,173 156,180" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="134" y="161" fill="#F59E0B" font-family="monospace" font-size="11" text-anchor="end">R₂</text>
  <text x="170" y="150" fill="#F8FAFC" font-family="monospace" font-size="11">+ v −</text>
  <line x1="156" y1="180" x2="156" y2="212" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Bottom rail -->
  <line x1="48" y1="212" x2="224" y2="212" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Vs -->
  <line x1="48" y1="112" x2="48" y2="142" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="48" cy="162" r="20" fill="#0F172A" stroke="#38BDF8" stroke-width="2.2"/>
  <text x="48" y="157" fill="#38BDF8" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle">+</text>
  <text x="48" y="175" fill="#38BDF8" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle">−</text>
  <line x1="48" y1="182" x2="48" y2="212" stroke="#E2E8F0" stroke-width="2"/>
  <text x="48" y="232" fill="#38BDF8" font-family="monospace" font-size="11" text-anchor="middle">Vs</text>
  <!-- Is -->
  <line x1="224" y1="112" x2="224" y2="142" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="224" cy="162" r="20" fill="#0F172A" stroke="#34D399" stroke-width="2.2"/>
  <line x1="224" y1="174" x2="224" y2="152" stroke="#34D399" stroke-width="2"/>
  <polygon points="219,154 224,146 229,154" fill="#34D399"/>
  <line x1="224" y1="182" x2="224" y2="212" stroke="#E2E8F0" stroke-width="2"/>
  <text x="224" y="232" fill="#34D399" font-family="monospace" font-size="11" text-anchor="middle">Is</text>
  <text x="142" y="264" fill="#CBD5E1" font-family="monospace" font-size="11.5" text-anchor="middle">总响应：v = v' + v''</text>

  <!-- Arrow 1 -->
  <text x="282" y="168" fill="#F59E0B" font-family="monospace" font-size="22" font-weight="700" text-anchor="middle">=</text>

  <!-- Panel 2: Subcircuit 1 (Vs active, Is OPEN) -->
  <rect x="296" y="48" width="252" height="232" rx="8" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
  <text x="422" y="70" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">子电路 1：仅保留 Vs（Is 开路）</text>
  <line x1="328" y1="112" x2="358" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="358,112 364,102 372,122 380,102 388,122 396,102 402,112" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="380" y="95" fill="#F59E0B" font-family="monospace" font-size="11" text-anchor="middle">R₁</text>
  <line x1="402" y1="112" x2="436" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="436" cy="112" r="3.5" fill="#38BDF8"/>
  <!-- Dashed open branch -->
  <line x1="436" y1="112" x2="504" y2="112" stroke="#64748B" stroke-width="1.6" stroke-dasharray="5,4"/>
  <line x1="504" y1="112" x2="504" y2="140" stroke="#64748B" stroke-width="1.6" stroke-dasharray="5,4"/>
  <circle cx="504" cy="144" r="3.5" fill="#0F172A" stroke="#F43F5E" stroke-width="2"/>
  <circle cx="504" cy="180" r="3.5" fill="#0F172A" stroke="#F43F5E" stroke-width="2"/>
  <text x="504" y="166" fill="#F43F5E" font-family="monospace" font-size="10.5" font-weight="700" text-anchor="middle">开路 i=0</text>
  <line x1="504" y1="184" x2="504" y2="212" stroke="#64748B" stroke-width="1.6" stroke-dasharray="5,4"/>
  <line x1="436" y1="212" x2="504" y2="212" stroke="#64748B" stroke-width="1.6" stroke-dasharray="5,4"/>
  <!-- R2 vertical -->
  <line x1="436" y1="112" x2="436" y2="134" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="436,134 428,141 444,149 428,157 444,165 428,173 436,180" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="414" y="161" fill="#F59E0B" font-family="monospace" font-size="11" text-anchor="end">R₂</text>
  <text x="450" y="150" fill="#38BDF8" font-family="monospace" font-size="11">v'</text>
  <line x1="436" y1="180" x2="436" y2="212" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="328" y1="212" x2="436" y2="212" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Vs active -->
  <line x1="328" y1="112" x2="328" y2="142" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="328" cy="162" r="20" fill="#0F172A" stroke="#38BDF8" stroke-width="2.2"/>
  <text x="328" y="157" fill="#38BDF8" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle">+</text>
  <text x="328" y="175" fill="#38BDF8" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle">−</text>
  <line x1="328" y1="182" x2="328" y2="212" stroke="#E2E8F0" stroke-width="2"/>
  <text x="422" y="264" fill="#38BDF8" font-family="monospace" font-size="11.5" text-anchor="middle">R₁ 与 R₂ 串联 → 分压求 v'</text>

  <!-- Plus sign -->
  <text x="562" y="168" fill="#F59E0B" font-family="monospace" font-size="22" font-weight="700" text-anchor="middle">+</text>

  <!-- Panel 3: Subcircuit 2 (Is active, Vs SHORT) -->
  <rect x="576" y="48" width="248" height="232" rx="8" fill="#1E293B" stroke="#34D399" stroke-width="1.5"/>
  <text x="700" y="70" fill="#34D399" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">子电路 2：仅保留 Is（Vs 短路）</text>
  <!-- Highlighted short wire on left -->
  <line x1="608" y1="112" x2="608" y2="212" stroke="#F43F5E" stroke-width="3.5"/>
  <rect x="582" y="148" width="52" height="24" rx="4" fill="#0F172A" stroke="#F43F5E" stroke-width="1.2"/>
  <text x="608" y="164" fill="#F43F5E" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle">短路 v=0</text>
  <!-- Top wire & R1 -->
  <line x1="608" y1="112" x2="638" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="638,112 644,102 652,122 660,102 668,122 676,102 682,112" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="660" y="95" fill="#F59E0B" font-family="monospace" font-size="11" text-anchor="middle">R₁</text>
  <line x1="682" y1="112" x2="784" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="716" cy="112" r="3.5" fill="#34D399"/>
  <!-- R2 vertical -->
  <line x1="716" y1="112" x2="716" y2="134" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="716,134 708,141 724,149 708,157 724,165 708,173 716,180" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="694" y="161" fill="#F59E0B" font-family="monospace" font-size="11" text-anchor="end">R₂</text>
  <text x="730" y="150" fill="#34D399" font-family="monospace" font-size="11">v''</text>
  <line x1="716" y1="180" x2="716" y2="212" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Bottom rail -->
  <line x1="608" y1="212" x2="784" y2="212" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Is active -->
  <line x1="784" y1="112" x2="784" y2="142" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="784" cy="162" r="20" fill="#0F172A" stroke="#34D399" stroke-width="2.2"/>
  <line x1="784" y1="174" x2="784" y2="152" stroke="#34D399" stroke-width="2"/>
  <polygon points="779,154 784,146 789,154" fill="#34D399"/>
  <line x1="784" y1="182" x2="784" y2="212" stroke="#E2E8F0" stroke-width="2"/>
  <text x="700" y="264" fill="#34D399" font-family="monospace" font-size="11.5" text-anchor="middle">R₁ // R₂ 并联 → 分流求 v''</text>
</svg>`);

export const SVG_ACT3 = wide(String.raw`<svg viewBox="0 0 840 310" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sadiku 4.3 经典双独立源叠加拆解图">
  <rect width="840" height="310" rx="12" fill="#0F172A"/>
  <text x="24" y="30" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="15" font-weight="700">Act 3 · Sadiku 4.3 经典原型：6 V 电压源 + 3 A 电流源叠加求 4 Ω 电阻电压 v 与电流 i</text>

  <!-- Left: Subcircuit 1 (6V active, 3A open) -->
  <rect x="20" y="48" width="380" height="242" rx="8" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5"/>
  <text x="210" y="72" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="13.5" font-weight="700" text-anchor="middle">子电路 1：保留 6 V，将 3 A 电流源开路</text>

  <line x1="65" y1="115" x2="115" y2="115" stroke="#E2E8F0" stroke-width="2.2"/>
  <polyline points="115,115 123,104 133,126 143,104 153,126 163,104 171,115" fill="none" stroke="#F59E0B" stroke-width="2.4"/>
  <text x="143" y="96" fill="#F59E0B" font-family="monospace" font-size="12" text-anchor="middle">8 Ω</text>
  <line x1="171" y1="115" x2="230" y2="115" stroke="#E2E8F0" stroke-width="2.2"/>
  <circle cx="230" cy="115" r="4" fill="#38BDF8"/>
  <!-- Open branch -->
  <line x1="230" y1="115" x2="335" y2="115" stroke="#64748B" stroke-width="1.8" stroke-dasharray="6,4"/>
  <line x1="335" y1="115" x2="335" y2="145" stroke="#64748B" stroke-width="1.8" stroke-dasharray="6,4"/>
  <circle cx="335" cy="148" r="4" fill="#0F172A" stroke="#F43F5E" stroke-width="2"/>
  <circle cx="335" cy="184" r="4" fill="#0F172A" stroke="#F43F5E" stroke-width="2"/>
  <text x="344" y="170" fill="#F43F5E" font-family="monospace" font-size="11" font-weight="700" text-anchor="start">3A 开路</text>
  <line x1="335" y1="188" x2="335" y2="215" stroke="#64748B" stroke-width="1.8" stroke-dasharray="6,4"/>
  <line x1="230" y1="215" x2="335" y2="215" stroke="#64748B" stroke-width="1.8" stroke-dasharray="6,4"/>
  <!-- 4 ohm -->
  <line x1="230" y1="115" x2="230" y2="136" stroke="#E2E8F0" stroke-width="2.2"/>
  <polyline points="230,136 221,144 239,153 221,162 239,171 221,180 230,188" fill="none" stroke="#F59E0B" stroke-width="2.4"/>
  <line x1="230" y1="188" x2="230" y2="215" stroke="#E2E8F0" stroke-width="2.2"/>
  <text x="206" y="166" fill="#F59E0B" font-family="monospace" font-size="12" text-anchor="end">4 Ω</text>
  <!-- Current arrow i1 -->
  <line x1="252" y1="138" x2="252" y2="174" stroke="#38BDF8" stroke-width="2"/>
  <polygon points="247,172 252,182 257,172" fill="#38BDF8"/>
  <text x="262" y="154" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="700">v' = 2 V</text>
  <text x="262" y="172" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="700">i' = 0.5 A</text>
  <!-- Bottom wire & 6V -->
  <line x1="65" y1="215" x2="230" y2="215" stroke="#E2E8F0" stroke-width="2.2"/>
  <line x1="65" y1="115" x2="65" y2="143" stroke="#E2E8F0" stroke-width="2.2"/>
  <circle cx="65" cy="165" r="22" fill="#0F172A" stroke="#38BDF8" stroke-width="2.4"/>
  <text x="65" y="160" fill="#38BDF8" font-family="monospace" font-size="14" font-weight="700" text-anchor="middle">+</text>
  <text x="65" y="179" fill="#38BDF8" font-family="monospace" font-size="14" font-weight="700" text-anchor="middle">−</text>
  <line x1="65" y1="187" x2="65" y2="215" stroke="#E2E8F0" stroke-width="2.2"/>
  <text x="36" y="169" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="700" text-anchor="end">6 V</text>
  <!-- Summary badge -->
  <rect x="40" y="242" width="340" height="34" rx="6" fill="#0F172A" stroke="#38BDF8" stroke-width="1"/>
  <text x="210" y="263" fill="#E2E8F0" font-family="monospace" font-size="12" text-anchor="middle">串联分压：v' = 6 × 4/(8+4) = 2 V，i' = 0.5 A</text>

  <!-- Right: Subcircuit 2 (3A active, 6V short) -->
  <rect x="440" y="48" width="380" height="242" rx="8" fill="#1E293B" stroke="#34D399" stroke-width="1.5"/>
  <text x="630" y="72" fill="#34D399" font-family="system-ui, sans-serif" font-size="13.5" font-weight="700" text-anchor="middle">子电路 2：保留 3 A，将 6 V 电压源短路</text>

  <!-- Highlighted Short wire -->
  <line x1="485" y1="115" x2="485" y2="215" stroke="#F43F5E" stroke-width="3.8"/>
  <rect x="454" y="151" width="62" height="24" rx="4" fill="#0F172A" stroke="#F43F5E" stroke-width="1.3"/>
  <text x="485" y="167" fill="#F43F5E" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">6V 短路</text>

  <line x1="485" y1="115" x2="535" y2="115" stroke="#E2E8F0" stroke-width="2.2"/>
  <polyline points="535,115 543,104 553,126 563,104 573,126 583,104 591,115" fill="none" stroke="#F59E0B" stroke-width="2.4"/>
  <text x="563" y="96" fill="#F59E0B" font-family="monospace" font-size="12" text-anchor="middle">8 Ω</text>
  <line x1="591" y1="115" x2="755" y2="115" stroke="#E2E8F0" stroke-width="2.2"/>
  <circle cx="645" cy="115" r="4" fill="#34D399"/>
  <!-- 4 ohm -->
  <line x1="645" y1="115" x2="645" y2="136" stroke="#E2E8F0" stroke-width="2.2"/>
  <polyline points="645,136 636,144 654,153 636,162 654,171 636,180 645,188" fill="none" stroke="#F59E0B" stroke-width="2.4"/>
  <line x1="645" y1="188" x2="645" y2="215" stroke="#E2E8F0" stroke-width="2.2"/>
  <text x="622" y="166" fill="#F59E0B" font-family="monospace" font-size="12" text-anchor="end">4 Ω</text>
  <!-- Current arrow i2 -->
  <line x1="666" y1="138" x2="666" y2="174" stroke="#34D399" stroke-width="2"/>
  <polygon points="661,172 666,182 671,172" fill="#34D399"/>
  <text x="675" y="154" fill="#34D399" font-family="monospace" font-size="11.5" font-weight="700">v''=8V</text>
  <text x="675" y="172" fill="#34D399" font-family="monospace" font-size="11.5" font-weight="700">i''=2A</text>
  <!-- Bottom wire & 3A -->
  <line x1="485" y1="215" x2="755" y2="215" stroke="#E2E8F0" stroke-width="2.2"/>
  <line x1="755" y1="115" x2="755" y2="143" stroke="#E2E8F0" stroke-width="2.2"/>
  <circle cx="755" cy="165" r="22" fill="#0F172A" stroke="#34D399" stroke-width="2.4"/>
  <line x1="755" y1="178" x2="755" y2="154" stroke="#34D399" stroke-width="2.2"/>
  <polygon points="750,156 755,147 760,156" fill="#34D399"/>
  <line x1="755" y1="187" x2="755" y2="215" stroke="#E2E8F0" stroke-width="2.2"/>
  <text x="795" y="169" fill="#34D399" font-family="monospace" font-size="12" font-weight="700" text-anchor="middle">3 A</text>
  <!-- Summary badge -->
  <rect x="460" y="242" width="340" height="34" rx="6" fill="#0F172A" stroke="#34D399" stroke-width="1"/>
  <text x="630" y="263" fill="#E2E8F0" font-family="monospace" font-size="12" text-anchor="middle">并联分流：i'' = 3 × 8/(8+4) = 2 A，v'' = 8 V</text>
</svg>`);

export const SVG_ACT4 =
  wide(String.raw`<svg viewBox="0 0 840 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="含受控源的叠加定理：受控源菱形符号在两个子电路中原位保留">
  <rect width="840" height="320" rx="12" fill="#0F172A"/>
  <text x="24" y="30" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="15" font-weight="700">Act 4 · 禁区警告（一）：受控源 2iₓ（紫色菱形）在所有子电路中必须原位保留！</text>

  <!-- Left: Subcircuit 1 (16V active, 6A open, 2ix' KEPT) -->
  <rect x="20" y="48" width="385" height="252" rx="8" fill="#1E293B" stroke="#A78BFA" stroke-width="1.5"/>
  <text x="212" y="72" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">子电路 1：保留 16 V，6 A 开路，2iₓ' 原位保留</text>

  <!-- Top bus -->
  <line x1="56" y1="112" x2="90" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="90,112 96,102 104,122 112,102 120,122 128,102 134,112" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="112" y="95" fill="#F59E0B" font-family="monospace" font-size="11" text-anchor="middle">4 Ω</text>
  <line x1="134" y1="112" x2="270" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="185" cy="112" r="3.5" fill="#38BDF8"/>
  <circle cx="270" cy="112" r="3.5" fill="#A78BFA"/>
  <!-- Open 6A branch on far right -->
  <line x1="270" y1="112" x2="352" y2="112" stroke="#64748B" stroke-width="1.6" stroke-dasharray="5,4"/>
  <line x1="352" y1="112" x2="352" y2="144" stroke="#64748B" stroke-width="1.6" stroke-dasharray="5,4"/>
  <circle cx="352" cy="148" r="3.5" fill="#0F172A" stroke="#F43F5E" stroke-width="2"/>
  <circle cx="352" cy="180" r="3.5" fill="#0F172A" stroke="#F43F5E" stroke-width="2"/>
  <text x="352" y="168" fill="#F43F5E" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle">6A开路</text>
  <line x1="352" y1="184" x2="352" y2="216" stroke="#64748B" stroke-width="1.6" stroke-dasharray="5,4"/>
  <line x1="270" y1="216" x2="352" y2="216" stroke="#64748B" stroke-width="1.6" stroke-dasharray="5,4"/>

  <!-- 16V source -->
  <line x1="56" y1="112" x2="56" y2="144" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="56" cy="164" r="20" fill="#0F172A" stroke="#38BDF8" stroke-width="2.2"/>
  <text x="56" y="159" fill="#38BDF8" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle">+</text>
  <text x="56" y="177" fill="#38BDF8" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle">−</text>
  <line x1="56" y1="184" x2="56" y2="216" stroke="#E2E8F0" stroke-width="2"/>
  <text x="56" y="234" fill="#38BDF8" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">16 V</text>

  <!-- Middle 4 ohm with ix' -->
  <line x1="185" y1="112" x2="185" y2="136" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="185,136 177,143 193,151 177,159 193,167 177,175 185,182" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <line x1="185" y1="182" x2="185" y2="216" stroke="#E2E8F0" stroke-width="2"/>
  <text x="167" y="164" fill="#F59E0B" font-family="monospace" font-size="11" text-anchor="end">4 Ω</text>
  <line x1="204" y1="140" x2="204" y2="174" stroke="#38BDF8" stroke-width="2"/>
  <polygon points="199,172 204,180 209,172" fill="#38BDF8"/>
  <text x="210" y="164" fill="#38BDF8" font-family="monospace" font-size="11" font-weight="700">iₓ'</text>

  <!-- Dependent source 2ix' (Diamond KEPT!) -->
  <line x1="270" y1="112" x2="270" y2="140" stroke="#E2E8F0" stroke-width="2"/>
  <polygon points="270,140 292,164 270,188 248,164" fill="#0F172A" stroke="#A78BFA" stroke-width="2.4"/>
  <line x1="270" y1="152" x2="270" y2="173" stroke="#A78BFA" stroke-width="2"/>
  <polygon points="265,170 270,178 275,170" fill="#A78BFA"/>
  <line x1="270" y1="188" x2="270" y2="216" stroke="#E2E8F0" stroke-width="2"/>
  <text x="270" y="234" fill="#A78BFA" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">2iₓ' (保留!)</text>

  <!-- Bottom bus -->
  <line x1="56" y1="216" x2="270" y2="216" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="36" y="250" width="353" height="36" rx="6" fill="#0F172A" stroke="#A78BFA" stroke-width="1"/>
  <text x="212" y="272" fill="#E2E8F0" font-family="monospace" font-size="10.5" text-anchor="middle">KCL: (v'-16)/4 + v'/4 + 2(v'/4) = 0 → v'=4 V, iₓ'=1 A</text>

  <!-- Right: Subcircuit 2 (6A active, 16V short, 2ix'' KEPT) -->
  <rect x="435" y="48" width="385" height="252" rx="8" fill="#1E293B" stroke="#A78BFA" stroke-width="1.5"/>
  <text x="627" y="72" fill="#34D399" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">子电路 2：保留 6 A，16 V 短路，2iₓ'' 原位保留</text>

  <!-- Short wire on left -->
  <line x1="471" y1="112" x2="471" y2="216" stroke="#F43F5E" stroke-width="3.5"/>
  <rect x="444" y="152" width="54" height="22" rx="4" fill="#0F172A" stroke="#F43F5E" stroke-width="1.2"/>
  <text x="471" y="167" fill="#F43F5E" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle">16V短路</text>

  <!-- Top bus -->
  <line x1="471" y1="112" x2="505" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="505,112 511,102 519,122 527,102 535,122 543,102 549,112" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="527" y="95" fill="#F59E0B" font-family="monospace" font-size="11" text-anchor="middle">4 Ω</text>
  <line x1="549" y1="112" x2="775" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="600" cy="112" r="3.5" fill="#34D399"/>
  <circle cx="685" cy="112" r="3.5" fill="#A78BFA"/>

  <!-- Middle 4 ohm with ix'' -->
  <line x1="600" y1="112" x2="600" y2="136" stroke="#E2E8F0" stroke-width="2"/>
  <polyline points="600,136 592,143 608,151 592,159 608,167 592,175 600,182" fill="none" stroke="#F59E0B" stroke-width="2.2"/>
  <line x1="600" y1="182" x2="600" y2="216" stroke="#E2E8F0" stroke-width="2"/>
  <text x="582" y="164" fill="#F59E0B" font-family="monospace" font-size="11" text-anchor="end">4 Ω</text>
  <line x1="619" y1="140" x2="619" y2="174" stroke="#34D399" stroke-width="2"/>
  <polygon points="614,172 619,180 624,172" fill="#34D399"/>
  <text x="625" y="164" fill="#34D399" font-family="monospace" font-size="11" font-weight="700">iₓ''</text>

  <!-- Dependent source 2ix'' (Diamond KEPT!) -->
  <line x1="685" y1="112" x2="685" y2="140" stroke="#E2E8F0" stroke-width="2"/>
  <polygon points="685,140 707,164 685,188 663,164" fill="#0F172A" stroke="#A78BFA" stroke-width="2.4"/>
  <line x1="685" y1="152" x2="685" y2="173" stroke="#A78BFA" stroke-width="2"/>
  <polygon points="680,170 685,178 690,170" fill="#A78BFA"/>
  <line x1="685" y1="188" x2="685" y2="216" stroke="#E2E8F0" stroke-width="2"/>
  <text x="685" y="234" fill="#A78BFA" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">2iₓ'' (保留!)</text>

  <!-- 6A source active -->
  <line x1="775" y1="112" x2="775" y2="144" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="775" cy="164" r="20" fill="#0F172A" stroke="#34D399" stroke-width="2.2"/>
  <line x1="775" y1="176" x2="775" y2="154" stroke="#34D399" stroke-width="2"/>
  <polygon points="770,156 775,148 780,156" fill="#34D399"/>
  <line x1="775" y1="184" x2="775" y2="216" stroke="#E2E8F0" stroke-width="2"/>
  <text x="775" y="234" fill="#34D399" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">6 A</text>

  <!-- Bottom bus -->
  <line x1="471" y1="216" x2="775" y2="216" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="451" y="250" width="353" height="36" rx="6" fill="#0F172A" stroke="#A78BFA" stroke-width="1"/>
  <text x="627" y="272" fill="#E2E8F0" font-family="monospace" font-size="10.5" text-anchor="middle">KCL: v''/4 + v''/4 + 2(v''/4) = 6 → v''=6 V, iₓ''=1.5 A</text>
</svg>`);

export const SVG_ACT5_A = wide(String.raw`<svg viewBox="0 0 425 310" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="功率不可叠加反例 A：同向增强的交叉项">
  <rect width="425" height="310" rx="12" fill="#0F172A"/>
  <text x="20" y="22" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="13" font-weight="700">Act 5 · 禁区警告（二）：功率 p = (i₁ + i₂)²R ≠ p₁ + p₂</text>
  <text x="20" y="40" fill="#CBD5E1" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700">（交叉项 2i₁i₂R 决定偏差方向）</text>

  <!-- Left: Case A Aiding (Act 3 circuit) -->
  <rect x="20" y="48" width="385" height="242" rx="8" fill="#1E293B" stroke="#F43F5E" stroke-width="1.5"/>
  <text x="212" y="72" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">反例 A（第 3 幕电路，同向增强）：R = 4 Ω</text>
  <text x="212" y="92" fill="#94A3B8" font-family="monospace" font-size="11.5" text-anchor="middle">i₁ = +0.5 A, i₂ = +2.0 A → i = +2.5 A</text>

  <!-- Bars Case A -->
  <text x="40" y="132" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="11.5">错误叠加 p₁+p₂</text>
  <rect x="145" y="116" width="136" height="24" rx="4" fill="#64748B"/>
  <text x="290" y="132" fill="#CBD5E1" font-family="monospace" font-size="12" font-weight="700">17 W (漏算!)</text>

  <text x="40" y="172" fill="#F59E0B" font-family="system-ui, sans-serif" font-size="11.5">交叉项 +2i₁i₂R</text>
  <rect x="145" y="156" width="64" height="24" rx="4" fill="#F59E0B"/>
  <text x="218" y="172" fill="#F59E0B" font-family="monospace" font-size="12" font-weight="700">+8 W</text>

  <text x="40" y="212" fill="#34D399" font-family="system-ui, sans-serif" font-size="11.5">真实总功率 p</text>
  <rect x="145" y="196" width="200" height="24" rx="4" fill="#34D399"/>
  <text x="352" y="212" fill="#34D399" font-family="monospace" font-size="12" font-weight="700">25 W</text>

  <rect x="36" y="242" width="353" height="34" rx="6" fill="#0F172A" stroke="#34D399" stroke-width="1"/>
  <text x="212" y="263" fill="#E2E8F0" font-family="monospace" font-size="11.5" text-anchor="middle">i₁, i₂ 同号 → 交叉项 &gt; 0 → 真实功率大于 p₁+p₂</text>

</svg>`);

export const SVG_ACT5 =
  wide(String.raw`<svg viewBox="0 0 840 310" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="功率不可叠加反例对比台：同向增强与反向抵消的交叉项对比">
  <rect width="840" height="310" rx="12" fill="#0F172A"/>
  <text x="24" y="30" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="15" font-weight="700">Act 5 · 禁区警告（二）：功率 p = (i₁ + i₂)²R ≠ p₁ + p₂（交叉项 2i₁i₂R 决定偏差方向）</text>

  <!-- Left: Case A Aiding (Act 3 circuit) -->
  <rect x="20" y="48" width="385" height="242" rx="8" fill="#1E293B" stroke="#F43F5E" stroke-width="1.5"/>
  <text x="212" y="72" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">反例 A（第 3 幕电路，同向增强）：R = 4 Ω</text>
  <text x="212" y="92" fill="#94A3B8" font-family="monospace" font-size="11.5" text-anchor="middle">i₁ = +0.5 A, i₂ = +2.0 A → i = +2.5 A</text>

  <!-- Bars Case A -->
  <text x="40" y="132" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="11.5">错误叠加 p₁+p₂</text>
  <rect x="145" y="116" width="136" height="24" rx="4" fill="#64748B"/>
  <text x="290" y="132" fill="#CBD5E1" font-family="monospace" font-size="12" font-weight="700">17 W (漏算!)</text>

  <text x="40" y="172" fill="#F59E0B" font-family="system-ui, sans-serif" font-size="11.5">交叉项 +2i₁i₂R</text>
  <rect x="145" y="156" width="64" height="24" rx="4" fill="#F59E0B"/>
  <text x="218" y="172" fill="#F59E0B" font-family="monospace" font-size="12" font-weight="700">+8 W</text>

  <text x="40" y="212" fill="#34D399" font-family="system-ui, sans-serif" font-size="11.5">真实总功率 p</text>
  <rect x="145" y="196" width="200" height="24" rx="4" fill="#34D399"/>
  <text x="352" y="212" fill="#34D399" font-family="monospace" font-size="12" font-weight="700">25 W</text>

  <rect x="36" y="242" width="353" height="34" rx="6" fill="#0F172A" stroke="#34D399" stroke-width="1"/>
  <text x="212" y="263" fill="#E2E8F0" font-family="monospace" font-size="11.5" text-anchor="middle">i₁, i₂ 同号 → 交叉项 &gt; 0 → 真实功率大于 p₁+p₂</text>

  <!-- Right: Case B Opposing (Act 6 circuit preview) -->
  <rect x="435" y="48" width="385" height="242" rx="8" fill="#1E293B" stroke="#F43F5E" stroke-width="1.5"/>
  <text x="627" y="72" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">反例 B（反向抵消电路）：R = 2 Ω</text>
  <text x="627" y="92" fill="#94A3B8" font-family="monospace" font-size="11.5" text-anchor="middle">i₁ = +3.0 A, i₂ = −2.0 A → i = +1.0 A</text>

  <!-- Bars Case B -->
  <text x="455" y="132" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="11.5">错误叠加 p₁+p₂</text>
  <rect x="560" y="116" width="182" height="24" rx="4" fill="#64748B"/>
  <text x="750" y="132" fill="#CBD5E1" font-family="monospace" font-size="12" font-weight="700">26 W</text>

  <text x="455" y="172" fill="#F43F5E" font-family="system-ui, sans-serif" font-size="11.5">交叉项 2i₁i₂R</text>
  <rect x="560" y="156" width="168" height="24" rx="4" fill="#F43F5E"/>
  <text x="736" y="172" fill="#F43F5E" font-family="monospace" font-size="12" font-weight="700">−24 W</text>

  <text x="455" y="212" fill="#34D399" font-family="system-ui, sans-serif" font-size="11.5">真实总功率 p</text>
  <rect x="560" y="196" width="16" height="24" rx="4" fill="#34D399"/>
  <text x="584" y="212" fill="#34D399" font-family="monospace" font-size="12" font-weight="700">2 W (比单项还小!)</text>

  <rect x="451" y="242" width="353" height="34" rx="6" fill="#0F172A" stroke="#F43F5E" stroke-width="1"/>
  <text x="627" y="263" fill="#E2E8F0" font-family="monospace" font-size="11.5" text-anchor="middle">i₁, i₂ 异号 → 交叉项 &lt; 0 → 真实功率可远小于 p₁+p₂</text>
</svg>`);

export const SVG_ACT6 = wide(String.raw`<svg viewBox="0 0 720 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="第6幕苏格拉底引导实战电路图：18V电压源与3A向下电流源">
  <rect width="720" height="250" rx="12" fill="#0F172A"/>
  <text x="24" y="30" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="15" font-weight="700">Act 6 · 综合实战题：求 2 Ω 电阻向下电流 iₒ 与其消耗的真实功率 p</text>

  <!-- Main circuit -->
  <line x1="120" y1="86" x2="195" y2="86" stroke="#E2E8F0" stroke-width="2.4"/>
  <polyline points="195,86 205,74 217,98 229,74 241,98 253,74 263,86" fill="none" stroke="#F59E0B" stroke-width="2.6"/>
  <text x="229" y="65" fill="#F59E0B" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle">R₁ = 4 Ω</text>
  <line x1="263" y1="86" x2="540" y2="86" stroke="#E2E8F0" stroke-width="2.4"/>
  <circle cx="360" cy="86" r="4.5" fill="#1f2a44"/>
  <text x="360" y="70" fill="#94A3B8" font-family="monospace" font-size="12" text-anchor="middle">节点 A</text>

  <!-- 18V voltage source -->
  <line x1="120" y1="86" x2="120" y2="120" stroke="#E2E8F0" stroke-width="2.4"/>
  <circle cx="120" cy="144" r="24" fill="#0F172A" stroke="#38BDF8" stroke-width="2.5"/>
  <text x="120" y="138" fill="#38BDF8" font-family="monospace" font-size="15" font-weight="700" text-anchor="middle">+</text>
  <text x="120" y="159" fill="#38BDF8" font-family="monospace" font-size="15" font-weight="700" text-anchor="middle">−</text>
  <line x1="120" y1="168" x2="120" y2="204" stroke="#E2E8F0" stroke-width="2.4"/>
  <text x="82" y="149" fill="#38BDF8" font-family="monospace" font-size="13" font-weight="700" text-anchor="end">18 V</text>

  <!-- 2 ohm vertical with io downward -->
  <line x1="360" y1="86" x2="360" y2="112" stroke="#E2E8F0" stroke-width="2.4"/>
  <polyline points="360,112 349,121 371,131 349,141 371,151 349,161 360,170" fill="none" stroke="#F59E0B" stroke-width="2.6"/>
  <line x1="360" y1="170" x2="360" y2="204" stroke="#E2E8F0" stroke-width="2.4"/>
  <text x="334" y="148" fill="#F59E0B" font-family="monospace" font-size="13" font-weight="700" text-anchor="end">R₂ = 2 Ω</text>
  <line x1="386" y1="116" x2="386" y2="164" stroke="#38BDF8" stroke-width="2.4"/>
  <polygon points="380,162 386,174 392,162" fill="#38BDF8"/>
  <text x="400" y="148" fill="#38BDF8" font-family="monospace" font-size="14" font-weight="700">iₒ (↓)</text>

  <!-- 3A current source pointing DOWN -->
  <line x1="540" y1="86" x2="540" y2="120" stroke="#E2E8F0" stroke-width="2.4"/>
  <circle cx="540" cy="144" r="24" fill="#0F172A" stroke="#34D399" stroke-width="2.5"/>
  <line x1="540" y1="130" x2="540" y2="154" stroke="#34D399" stroke-width="2.4"/>
  <polygon points="534,152 540,162 546,152" fill="#34D399"/>
  <line x1="540" y1="168" x2="540" y2="204" stroke="#E2E8F0" stroke-width="2.4"/>
  <text x="580" y="142" fill="#34D399" font-family="monospace" font-size="13" font-weight="700">3 A (注意：向下!)</text>

  <!-- Bottom rail & Ground -->
  <line x1="120" y1="204" x2="540" y2="204" stroke="#E2E8F0" stroke-width="2.4"/>
  <line x1="360" y1="204" x2="360" y2="220" stroke="#94A3B8" stroke-width="2"/>
  <line x1="346" y1="220" x2="374" y2="220" stroke="#94A3B8" stroke-width="2"/>
  <line x1="351" y1="226" x2="369" y2="226" stroke="#94A3B8" stroke-width="2"/>
  <line x1="356" y1="232" x2="364" y2="232" stroke="#94A3B8" stroke-width="2"/>
</svg>`);

export const MINI_STEP1 = lightSvg(
  String.raw`<svg style='max-width:380px;margin:0 auto' viewBox='0 0 260 110' xmlns='http://www.w3.org/2000/svg'><rect width='260' height='110' rx='6' fill='#0F172A'/><line x1='30' y1='30' x2='75' y2='30' stroke='#E2E8F0' stroke-width='2'/><rect x='75' y='22' width='36' height='16' fill='none' stroke='#F59E0B' stroke-width='2'/><text x='93' y='17' fill='#F59E0B' font-size='10' text-anchor='middle'>4Ω</text><line x1='111' y1='30' x2='155' y2='30' stroke='#E2E8F0' stroke-width='2'/><line x1='155' y1='30' x2='155' y2='85' stroke='#F59E0B' stroke-width='2'/><text x='145' y='62' fill='#F59E0B' font-size='10' text-anchor='end'>2Ω</text><line x1='155' y1='30' x2='225' y2='30' stroke='#64748B' stroke-dasharray='4,3' stroke-width='1.5'/><text x='225' y='62' fill='#F43F5E' font-size='10' text-anchor='middle'>3A=?</text><circle cx='30' cy='58' r='13' fill='#0F172A' stroke='#38BDF8' stroke-width='2'/><text x='30' y='62' fill='#38BDF8' font-size='9' text-anchor='middle'>18V</text><line x1='30' y1='30' x2='30' y2='45' stroke='#E2E8F0' stroke-width='2'/><line x1='30' y1='71' x2='30' y2='85' stroke='#E2E8F0' stroke-width='2'/><line x1='30' y1='85' x2='155' y2='85' stroke='#E2E8F0' stroke-width='2'/></svg>`,
);

export const MINI_STEP2 = lightSvg(
  String.raw`<svg style='max-width:380px;margin:0 auto' viewBox='0 0 260 110' xmlns='http://www.w3.org/2000/svg'><rect width='260' height='110' rx='6' fill='#0F172A'/><line x1='40' y1='28' x2='90' y2='28' stroke='#E2E8F0' stroke-width='2'/><rect x='90' y='20' width='40' height='16' fill='none' stroke='#F59E0B' stroke-width='2'/><text x='110' y='15' fill='#F59E0B' font-size='10' text-anchor='middle'>4Ω</text><line x1='130' y1='28' x2='185' y2='28' stroke='#E2E8F0' stroke-width='2'/><line x1='185' y1='28' x2='185' y2='86' stroke='#F59E0B' stroke-width='2'/><text x='176' y='62' fill='#F59E0B' font-size='10' text-anchor='end'>2Ω</text><text x='205' y='60' fill='#38BDF8' font-size='11'>iₒ' ↓</text><circle cx='40' cy='57' r='14' fill='#0F172A' stroke='#38BDF8' stroke-width='2'/><text x='40' y='61' fill='#38BDF8' font-size='9' text-anchor='middle'>18V</text><line x1='40' y1='28' x2='40' y2='43' stroke='#E2E8F0' stroke-width='2'/><line x1='40' y1='71' x2='40' y2='86' stroke='#E2E8F0' stroke-width='2'/><line x1='40' y1='86' x2='185' y2='86' stroke='#E2E8F0' stroke-width='2'/></svg>`,
);

export const MINI_STEP3 = lightSvg(
  String.raw`<svg style='max-width:380px;margin:0 auto' viewBox='0 0 260 110' xmlns='http://www.w3.org/2000/svg'><rect width='260' height='110' rx='6' fill='#0F172A'/><line x1='35' y1='28' x2='35' y2='86' stroke='#F43F5E' stroke-width='3'/><text x='35' y='100' fill='#F43F5E' font-size='9' text-anchor='middle'>短路</text><line x1='35' y1='28' x2='75' y2='28' stroke='#E2E8F0' stroke-width='2'/><rect x='75' y='20' width='36' height='16' fill='none' stroke='#F59E0B' stroke-width='2'/><text x='93' y='15' fill='#F59E0B' font-size='10' text-anchor='middle'>4Ω</text><line x1='111' y1='28' x2='220' y2='28' stroke='#E2E8F0' stroke-width='2'/><line x1='155' y1='28' x2='155' y2='86' stroke='#F59E0B' stroke-width='2'/><text x='164' y='62' fill='#F59E0B' font-size='10'>2Ω</text><text x='144' y='60' fill='#34D399' font-size='10' text-anchor='end'>iₒ'' ↓</text><circle cx='220' cy='57' r='14' fill='#0F172A' stroke='#34D399' stroke-width='2'/><text x='220' y='61' fill='#34D399' font-size='9' text-anchor='middle'>3A↓</text><line x1='220' y1='28' x2='220' y2='43' stroke='#E2E8F0' stroke-width='2'/><line x1='220' y1='71' x2='220' y2='86' stroke='#E2E8F0' stroke-width='2'/><line x1='35' y1='86' x2='220' y2='86' stroke='#E2E8F0' stroke-width='2'/></svg>`,
);

export const MINI_STEP4 = lightSvg(
  String.raw`<svg style='max-width:380px;margin:0 auto' viewBox='0 0 260 90' xmlns='http://www.w3.org/2000/svg'><rect width='260' height='90' rx='6' fill='#0F172A'/><rect x='14' y='24' width='68' height='42' rx='5' fill='#1E293B' stroke='#38BDF8'/><text x='48' y='49' fill='#38BDF8' font-size='12' text-anchor='middle'>+3 A</text><text x='96' y='50' fill='#F59E0B' font-size='16' text-anchor='middle'>+</text><rect x='110' y='24' width='68' height='42' rx='5' fill='#1E293B' stroke='#34D399'/><text x='144' y='49' fill='#34D399' font-size='12' text-anchor='middle'>−2 A</text><text x='192' y='50' fill='#F59E0B' font-size='16' text-anchor='middle'>=</text><rect x='206' y='24' width='40' height='42' rx='5' fill='#1E293B' stroke='#F8FAFC'/><text x='226' y='49' fill='#F8FAFC' font-size='12' text-anchor='middle'>?</text></svg>`,
);

export const MINI_STEP5 = lightSvg(
  String.raw`<svg style='max-width:380px;margin:0 auto' viewBox='0 0 260 90' xmlns='http://www.w3.org/2000/svg'><rect width='260' height='90' rx='6' fill='#0F172A'/><text x='130' y='32' fill='#F43F5E' font-size='11' text-anchor='middle'>警告：功率不可直接叠加！</text><text x='130' y='56' fill='#E2E8F0' font-family='monospace' font-size='12' text-anchor='middle'>p = iₒ² · R₂ = (1 A)² × 2 Ω = ?</text></svg>`,
);
