// W1-L1 · 电荷、电流与电压：电路分析的三块基石 (lesson sheet: docs/lessons/W1-L1.md).
// Lesson text, formulas, the act diagrams, the guided example and the self-test are reproduced
// from the sheet as written. Changes, all of form, not of content:
// - TeX lost in the Google Docs export is restored (`i,dt` → `i\,dt`, `R,;` → `,\;` …);
// - act 5's diagram: pillar b is drawn to the same scale as pillar a (4 V of 9 V; the sheet drew
//   it at 32 of 64 px, i.e. 4.5 V), and the bracket ends at its top;
// - act 6's title has no TeX (act titles are plain text); the options lose their "A. " / "B. "
//   prefixes (the guided block letters them itself);
// - act 7's preview of W1-L2 sits above the self-test (act blocks come before the quiz);
// - added: Sadiku Table 1.1 in act 1 (the sheet lists it under textbook tables), the guided
//   example's problem diagram, act 7's diagram and the two quiz diagrams (blueprint rule: every
//   act has a local diagram; the quiz diagrams show the set-up without giving the answer away).
// [[id|…]] only links a term to the stage (the words are unchanged).

import { lazy } from 'react';
import type { StageLesson } from '../../types';

const ChargeFlow = lazy(() => import('./ChargeFlow'));
const VoltageHeight = lazy(() => import('./VoltageHeight'));

/* ------------------------------------------------------------- act diagrams (from the sheet) */

const SVG_ACT1 = `<svg viewBox="0 0 420 104" class="w-full h-auto" aria-label="Sadiku Table 1.2 常用工程数量级标尺">
  <rect x="8" y="8" width="404" height="88" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
  <text x="210" y="25" text-anchor="middle" fill="#0f172a" font-size="9.5" font-weight="800">电路分析最常用 7 档工程前缀（相邻每档差 1000 倍）</text>
  <!-- Axis line -->
  <line x1="28" y1="54" x2="392" y2="54" stroke="#64748b" stroke-width="2" />
  <!-- 7 ticks: p, n, u, m, 1, k, M -->
  <g font-family="monospace" text-anchor="middle">
    <circle cx="42" cy="54" r="4" fill="#6366f1" /><text x="42" y="44" fill="#4338ca" font-size="9" font-weight="800">p (皮)</text><text x="42" y="72" fill="#475569" font-size="8.5">10⁻¹²</text>
    <circle cx="98" cy="54" r="4" fill="#6366f1" /><text x="98" y="44" fill="#4338ca" font-size="9" font-weight="800">n (纳)</text><text x="98" y="72" fill="#475569" font-size="8.5">10⁻⁹</text>
    <circle cx="154" cy="54" r="4" fill="#0284c7" /><text x="154" y="44" fill="#0369a1" font-size="9" font-weight="800">μ (微)</text><text x="154" y="72" fill="#475569" font-size="8.5">10⁻⁶</text>
    <circle cx="210" cy="54" r="4" fill="#0284c7" /><text x="210" y="44" fill="#0369a1" font-size="9" font-weight="800">m (毫)</text><text x="210" y="72" fill="#475569" font-size="8.5">10⁻³</text>
    <circle cx="266" cy="54" r="5" fill="#0f172a" /><text x="266" y="44" fill="#0f172a" font-size="9" font-weight="800">基准</text><text x="266" y="72" fill="#0f172a" font-size="8.5" font-weight="800">10⁰</text>
    <circle cx="322" cy="54" r="4" fill="#d97706" /><text x="322" y="44" fill="#b45309" font-size="9" font-weight="800">k (千)</text><text x="322" y="72" fill="#475569" font-size="8.5">10³</text>
    <circle cx="378" cy="54" r="4" fill="#dc2626" /><text x="378" y="44" fill="#b91c1c" font-size="9" font-weight="800">M (兆)</text><text x="378" y="72" fill="#475569" font-size="8.5">10⁶</text>
  </g>
  <text x="210" y="89" text-anchor="middle" fill="#047857" font-size="8.5" font-weight="700">黄金换算：1 V ÷ 1 kΩ = 1 mA ｜ 1 mA × 1 kΩ = 1 V</text>
</svg>`;

const SVG_ACT2 = `<svg viewBox="0 0 420 92" class="w-full h-auto" aria-label="单个电子与1库仑电荷量级对比图">
  <rect x="10" y="14" width="142" height="64" rx="9" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
  <circle cx="42" cy="46" r="14" fill="#1d4ed8" />
  <text x="42" y="50" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="800">e⁻</text>
  <text x="102" y="39" text-anchor="middle" fill="#1e3a8a" font-size="9" font-weight="800">1 个电子</text>
  <text x="102" y="56" text-anchor="middle" fill="#1d4ed8" font-size="8.5" font-family="monospace">−1.602×10⁻¹⁹ C</text>

  <text x="192" y="42" text-anchor="middle" fill="#64748b" font-size="9" font-weight="800">× 6.24×10¹⁸</text>
  <line x1="158" y1="48" x2="224" y2="48" stroke="#64748b" stroke-width="2" />
  <polygon points="222,43 232,48 222,53" fill="#64748b" />

  <rect x="238" y="14" width="172" height="64" rx="9" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.6" />
  <text x="324" y="37" text-anchor="middle" fill="#92400e" font-size="10.5" font-weight="800">1 库仑电荷 (1 C)</text>
  <text x="324" y="55" text-anchor="middle" fill="#b45309" font-size="8.5">每秒流过 1 C = 1 安培 (1 A)</text>
  <text x="324" y="69" text-anchor="middle" fill="#78350f" font-size="8">普通 LED 约需 20 mA (0.02 C/s)</text>
</svg>`;

const SVG_ACT3 = `<svg viewBox="0 0 420 104" class="w-full h-auto" aria-label="电流是电荷的导数、电荷是电流的积分关系图">
  <!-- Wire Cylinder -->
  <rect x="18" y="22" width="166" height="44" rx="12" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
  <ellipse cx="100" cy="44" rx="8" ry="22" fill="rgba(245,158,11,0.35)" stroke="#d97706" stroke-width="2" stroke-dasharray="3 2" />
  <line x1="42" y1="44" x2="154" y2="44" stroke="#0369a1" stroke-width="2.5" />
  <polygon points="150,39 162,44 150,49" fill="#0369a1" />
  <text x="100" y="15" text-anchor="middle" fill="#b45309" font-size="8.5" font-weight="800">观测横截面：每秒穿过多少 C？</text>
  <text x="100" y="82" text-anchor="middle" fill="#0369a1" font-size="9" font-weight="800" font-family="monospace">i = dq / dt (1 A = 1 C/s)</text>

  <!-- Right: Derivative / Integral Loop -->
  <rect x="208" y="16" width="84" height="32" rx="7" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.6" />
  <text x="250" y="36" text-anchor="middle" fill="#92400e" font-size="10" font-weight="800" font-family="monospace">电荷 q(t)</text>

  <rect x="322" y="16" width="84" height="32" rx="7" fill="#eff6ff" stroke="#2563eb" stroke-width="1.6" />
  <text x="364" y="36" text-anchor="middle" fill="#1d4ed8" font-size="10" font-weight="800" font-family="monospace">电流 i(t)</text>

  <!-- Top arrow: d/dt -->
  <path d="M 292 25 L 320 25" stroke="#2563eb" stroke-width="2" />
  <polygon points="316,21 322,25 316,29" fill="#2563eb" />
  <text x="306" y="14" text-anchor="middle" fill="#1d4ed8" font-size="8" font-weight="800">求导 d/dt</text>

  <!-- Bottom arrow: integral -->
  <path d="M 320 40 L 294 40" stroke="#d97706" stroke-width="2" />
  <polygon points="298,36 292,40 298,44" fill="#d97706" />
  <text x="306" y="62" text-anchor="middle" fill="#b45309" font-size="8" font-weight="800">积分 ∫ dt</text>
  <text x="306" y="82" text-anchor="middle" fill="#475569" font-size="8.2">直流 DC 恒定不变；交流 AC 随时间正弦变化</text>
</svg>`;

const SVG_ACT4 = `<svg viewBox="0 0 420 90" class="w-full h-auto" aria-label="正电流向左与负电流向右完全等价示意图">
  <rect x="10" y="14" width="176" height="62" rx="9" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
  <line x1="36" y1="46" x2="160" y2="46" stroke="#1d4ed8" stroke-width="3" />
  <polygon points="154,40 166,46 154,52" fill="#1d4ed8" />
  <text x="98" y="34" text-anchor="middle" fill="#1d4ed8" font-size="11" font-weight="800" font-family="monospace">i = −5 A →</text>
  <text x="98" y="66" text-anchor="middle" fill="#475569" font-size="8.5">假设向右，算出来带负号</text>

  <text x="210" y="50" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="800">≡</text>
  <text x="210" y="68" text-anchor="middle" fill="#64748b" font-size="8">完全等价</text>

  <rect x="234" y="14" width="176" height="62" rx="9" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5" />
  <line x1="260" y1="46" x2="384" y2="46" stroke="#059669" stroke-width="3" />
  <polygon points="266,40 254,46 266,52" fill="#059669" />
  <text x="322" y="34" text-anchor="middle" fill="#047857" font-size="11" font-weight="800" font-family="monospace">← +5 A (真实流向)</text>
  <text x="322" y="66" text-anchor="middle" fill="#475569" font-size="8.5">本质是 5 A 正电流向左流</text>
</svg>`;

// pillar b redrawn to scale: GND at y = 88, 9 V = 64 px, so 4 V = 28.4 px (top at y ≈ 59.6)
const SVG_ACT5 = `<svg viewBox="0 0 420 112" class="w-full h-auto" aria-label="电压是两点间电位差与极性反转等价图">
  <!-- Height Analogy Left -->
  <rect x="8" y="10" width="192" height="92" rx="9" fill="#f8fafc" stroke="#cbd5e1" />
  <line x1="22" y1="88" x2="186" y2="88" stroke="#64748b" stroke-width="1.8" />
  <text x="184" y="98" text-anchor="end" fill="#64748b" font-size="8" font-family="monospace">GND = 0 V</text>
  <!-- Pillar a = 9V -->
  <rect x="40" y="24" width="34" height="64" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="1.6" />
  <text x="57" y="42" text-anchor="middle" fill="#1d4ed8" font-size="9.5" font-weight="800" font-family="monospace">va</text>
  <text x="57" y="56" text-anchor="middle" fill="#1e40af" font-size="9" font-family="monospace">9 V</text>
  <!-- Pillar b = 4V -->
  <rect x="116" y="59.6" width="34" height="28.4" rx="4" fill="#d1fae5" stroke="#059669" stroke-width="1.6" />
  <text x="133" y="77" text-anchor="middle" fill="#047857" font-size="9" font-weight="800" font-family="monospace">vb=4V</text>
  <!-- Difference Bracket -->
  <line x1="88" y1="24" x2="88" y2="59.6" stroke="#d97706" stroke-width="2" stroke-dasharray="3 2" />
  <text x="95" y="43" fill="#b45309" font-size="9" font-weight="800" font-family="monospace">v_ab=+5V</text>

  <!-- Right: Polarity Flip Equivalence -->
  <rect x="212" y="10" width="200" height="92" rx="9" fill="#fffbeb" stroke="#fcd34d" />
  <text x="312" y="26" text-anchor="middle" fill="#92400e" font-size="9" font-weight="800">极性翻转等价（Sadiku Fig. 1.7）</text>
  <!-- Box 1: + on top, +5V -->
  <rect x="234" y="40" width="44" height="36" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="1.6" />
  <text x="256" y="36" text-anchor="middle" fill="#dc2626" font-size="11" font-weight="800">+</text>
  <text x="256" y="88" text-anchor="middle" fill="#2563eb" font-size="12" font-weight="800">−</text>
  <text x="256" y="62" text-anchor="middle" fill="#0f172a" font-size="9.5" font-weight="800" font-family="monospace">+5 V</text>

  <text x="312" y="63" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="800">≡</text>

  <!-- Box 2: - on top, -5V -->
  <rect x="342" y="40" width="44" height="36" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="1.6" />
  <text x="364" y="36" text-anchor="middle" fill="#2563eb" font-size="12" font-weight="800">−</text>
  <text x="364" y="88" text-anchor="middle" fill="#dc2626" font-size="11" font-weight="800">+</text>
  <text x="364" y="62" text-anchor="middle" fill="#be123c" font-size="9.5" font-weight="800" font-family="monospace">−5 V</text>
</svg>`;

/* ------------------------------------------------------------- guided-example step diagrams (from the sheet) */

const MINI_1 = `<svg viewBox='0 0 380 56' class='w-full h-auto'><rect x='12' y='10' width='356' height='36' rx='8' fill='#eff6ff' stroke='#93c5fd'/><text x='190' y='32' text-anchor='middle' fill='#1e40af' font-size='10' font-weight='800' font-family='monospace'>已知 i(t) = 3t² − t，反求总电荷 Q：该求导还是求积分？</text></svg>`;
const MINI_2 = `<svg viewBox='0 0 380 56' class='w-full h-auto'><rect x='12' y='10' width='356' height='36' rx='8' fill='#fffbeb' stroke='#fcd34d'/><text x='190' y='32' text-anchor='middle' fill='#92400e' font-size='10' font-weight='800' font-family='monospace'>回忆幂函数积分：∫ tⁿ dt = tⁿ⁺¹ / (n+1)</text></svg>`;
const MINI_3 = `<svg viewBox='0 0 380 56' class='w-full h-auto'><rect x='12' y='10' width='356' height='36' rx='8' fill='#ecfdf5' stroke='#6ee7b7'/><text x='190' y='32' text-anchor='middle' fill='#065f46' font-size='10' font-weight='800' font-family='monospace'>牛顿-莱布尼茨公式：F(上限 2) − F(下限 1)</text></svg>`;

/* ------------------------------------------------------------- added diagrams */

/** Act 6 problem: i(t) = 3t² − t on 0 … 2.5 s, the strip from 1 s to 2 s shaded, "Q = ?". */
function problemSvg(): string {
  const X = (t: number) => 44 + (t / 2.5) * 352;
  const Y = (v: number) => 116 - (v / 17) * 96;
  const f = (t: number) => 3 * t * t - t;
  const curve = Array.from({ length: 51 }, (_, k) => (k / 50) * 2.5)
    .map((t, k) => `${k ? 'L' : 'M'} ${X(t).toFixed(1)} ${Y(Math.max(0, f(t))).toFixed(1)}`)
    .join(' ');
  const area = [`${X(1)},${Y(0)}`, ...Array.from({ length: 21 }, (_, k) => 1 + k / 20).map((t) => `${X(t).toFixed(1)},${Y(f(t)).toFixed(1)}`), `${X(2)},${Y(0)}`].join(' ');
  const ticks = [0, 0.5, 1, 1.5, 2, 2.5].map((t) => `<text x="${X(t)}" y="130" text-anchor="middle" fill="#64748b" font-size="8.5" font-family="monospace">${t}</text>`).join('');
  const yTicks = [0, 5, 10, 15]
    .map(
      (v) =>
        `<line x1="${X(0)}" y1="${Y(v)}" x2="${X(2.5)}" y2="${Y(v)}" stroke="${v ? '#e2e8f0' : '#64748b'}" stroke-width="${v ? 1 : 1.6}" /><text x="${X(0) - 6}" y="${Y(v) + 3}" text-anchor="end" fill="#64748b" font-size="8.5" font-family="monospace">${v}</text>`,
    )
    .join('');
  return `<svg viewBox="0 0 420 140" class="w-full h-auto" aria-label="电流曲线 i(t) = 3t² − t，t = 1 s 到 2 s 之间曲线下方的面积待求">
  <rect x="4" y="4" width="412" height="132" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
  ${yTicks}
  <polygon points="${area}" fill="rgba(245,158,11,0.32)" stroke="#d97706" stroke-width="1" />
  <line x1="${X(1)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(16)}" stroke="#94a3b8" stroke-dasharray="3 3" />
  <line x1="${X(2)}" y1="${Y(0)}" x2="${X(2)}" y2="${Y(16)}" stroke="#94a3b8" stroke-dasharray="3 3" />
  <path d="${curve}" fill="none" stroke="#2563eb" stroke-width="2.4" />
  ${ticks}
  <text x="${X(2.5)}" y="${Y(0) - 4}" text-anchor="end" fill="#475569" font-size="8.5" font-weight="700">t / s</text>
  <text x="14" y="16" fill="#475569" font-size="8.5" font-weight="800">i (A)</text>
  <text x="${X(0.15)}" y="${Y(14)}" fill="#1d4ed8" font-size="10" font-weight="800" font-family="monospace">i(t) = 3t² − t</text>
  <text x="${X(1.5)}" y="${Y(1.6)}" text-anchor="middle" fill="#92400e" font-size="11" font-weight="800">Q = ?</text>
  <text x="${X(1.5)}" y="${Y(15.2)}" text-anchor="middle" fill="#b45309" font-size="8.5" font-weight="700">t = 1 s → 2 s</text>
</svg>`;
}

/** Act 7: the preview of W1-L2 — current (how fast charge flows) times voltage (height) = power. */
const SVG_ACT7 = `<svg viewBox="0 0 420 102" class="w-full h-auto" aria-label="电流 i 乘以电压 v 等于功率 p">
  <rect x="10" y="16" width="118" height="60" rx="9" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
  <text x="69" y="40" text-anchor="middle" fill="#1d4ed8" font-size="11" font-weight="800" font-family="monospace">电流 i</text>
  <text x="69" y="58" text-anchor="middle" fill="#475569" font-size="8.5">电荷流速（C/s）</text>
  <text x="146" y="51" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="800">×</text>
  <rect x="164" y="16" width="118" height="60" rx="9" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5" />
  <text x="223" y="40" text-anchor="middle" fill="#047857" font-size="11" font-weight="800" font-family="monospace">电压 v</text>
  <text x="223" y="58" text-anchor="middle" fill="#475569" font-size="8.5">电位高度差（J/C）</text>
  <text x="300" y="51" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="800">=</text>
  <rect x="318" y="16" width="92" height="60" rx="9" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.6" />
  <text x="364" y="40" text-anchor="middle" fill="#92400e" font-size="11" font-weight="800" font-family="monospace">功率 p</text>
  <text x="364" y="58" text-anchor="middle" fill="#b45309" font-size="8.5">J/s = W</text>
  <text x="210" y="95" text-anchor="middle" fill="#64748b" font-size="8.5" font-weight="700">下一课 W1-L2：p = vi 的正负，说明元件在吸收还是在供出功率</text>
</svg>`;

/** Q1: a wire with the reference arrow drawn to the right and the computed i = −2 A. */
const SVG_Q1 = `<svg viewBox="0 0 420 80" class="w-full h-auto" aria-label="水平导线，参考方向向右，算得 i = −2 A">
  <rect x="8" y="8" width="404" height="64" rx="9" fill="#f8fafc" stroke="#cbd5e1" />
  <rect x="40" y="38" width="340" height="20" rx="10" fill="rgba(251,191,140,0.35)" stroke="#c2410c" stroke-width="1.6" />
  <line x1="150" y1="26" x2="262" y2="26" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3" />
  <polygon points="270,26 260,21 260,31" fill="#64748b" />
  <text x="210" y="20" text-anchor="middle" fill="#334155" font-size="10" font-weight="800" font-family="monospace">参考方向 i →</text>
  <text x="300" y="30" fill="#1d4ed8" font-size="11" font-weight="800" font-family="monospace">i = −2 A</text>
  <text x="210" y="52" text-anchor="middle" fill="#7c2d12" font-size="9" font-weight="700">真实的电荷往哪边走？</text>
</svg>`;

/** Q2: two nodes above ground, a at 3 V and b at 8 V. */
const SVG_Q2 = `<svg viewBox="0 0 420 104" class="w-full h-auto" aria-label="节点 a 电位 3 V，节点 b 电位 8 V，求 v_ab">
  <rect x="8" y="8" width="404" height="88" rx="9" fill="#f8fafc" stroke="#cbd5e1" />
  <line x1="90" y1="84" x2="372" y2="84" stroke="#334155" stroke-width="2" />
  <text x="370" y="80" text-anchor="end" fill="#334155" font-size="8.5" font-weight="800" font-family="monospace">GND = 0 V</text>
  <rect x="130" y="62" width="44" height="22" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="1.6" />
  <text x="152" y="56" text-anchor="middle" fill="#1d4ed8" font-size="9.5" font-weight="800" font-family="monospace">va = 3 V</text>
  <rect x="236" y="25" width="44" height="59" rx="4" fill="#d1fae5" stroke="#059669" stroke-width="1.6" />
  <text x="258" y="20" text-anchor="middle" fill="#047857" font-size="9.5" font-weight="800" font-family="monospace">vb = 8 V</text>
  <text x="205" y="44" text-anchor="middle" fill="#b45309" font-size="10" font-weight="800" font-family="monospace">v_ab = ?</text>
</svg>`;

/* ------------------------------------------------------------- the lesson */

const W1_L1: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { charge_flow: ChargeFlow, voltage_height: VoltageHeight },
  lesson_meta: {
    lesson_id: 'W1-L1',
    world: 'World 1 · 电学公理与基本定律',
    title: '电荷、电流与电压：电路分析的三块基石',
    subtitle: '从单个电子出发，彻底看懂电流的导数/积分定义、负号含义与“两点之间才有电压”',
    lesson_type: 'B',
    lesson_type_label: 'Type B (公式与基础概念课)',
    estimated_minutes: 15,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['1.1 Introduction', '1.2 Systems of Units', '1.3 Charge and Current', '1.4 Voltage'],
    },
    textbook_supplement: 'Introductory Circuit Analysis, 14th Ed. (Boylestad) Ch. 2 电位高度差直觉类比',
    prerequisites: ['W1-L0 实验箱与万用表极简前置卡'],
    next_lesson: 'W1-L2',
    next_lesson_title: '功率、无源符号约定与电路元件',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: 'charge_flow',
        label: '01 电荷流动与电流方向',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '透明铜导线剖面：拖动滑块改变电流 i（参考方向向右），切换「习惯电流方向」与「真实电子流方向」，盯住中间的观测横截面。',
      },
      {
        id: 'voltage_height',
        label: '02 电位高度阶梯台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '以参考地 GND = 0 V 为地面：两个竖滑块调节节点 a、b 的电位，看两根“楼层”柱子的高差 v_ab 与搬运 2 C 电荷所需的功。',
      },
    ],
    hover_map: {
      wire_cross_section: { label: '导线横截面', desc: '单位时间穿过的电荷量 dq/dt，就是电流 i' },
      electron_stream: { label: '自由电子流', desc: '金属里真正移动的是自由电子，方向与习惯电流方向相反' },
      node_a_pillar: { label: '节点 a 电位柱', desc: '节点 a 相对参考地 GND = 0 V 的电位高度' },
      node_b_pillar: { label: '节点 b 电位柱', desc: '节点 b 相对参考地 GND = 0 V 的电位高度' },
      diff_vab_arrow: { label: '两点高差箭头', desc: 'a 点电位减 b 点电位（前减后），反过来看就变号' },
    },
  },
  right_acts: [
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '国际单位制与工程数量级（Sadiku 1.2）',
      sync: { layer: 'charge_flow', params: { cf_plot: 'none', cf_i: 2, cf_view: 'conventional' } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`欢迎来到大学电路分析的第一节正式课。在动笔推公式之前，教授们都会先统一“语言”——电路里几乎永远不会只遇到整数安培和整数欧姆，你每天打交道的是**毫安（$\text{mA}$）**、**微伏（$\mu\text{V}$）和兆欧（$\text{M}\Omega$）**。`,
        },
        {
          kind: 'p',
          text: String.raw`记住一个做题时极其好用的速算规律：**每跨一档工程前缀，指数正好跳 $3$ 次方（1000 倍）**。尤其在后面的欧姆定律里，记住「**伏特 $\div$ 千欧 = 毫安**」（$\text{V} / \text{k}\Omega = \text{mA}$），能让你少算一半小数点。`,
        },
        {
          kind: 'table',
          caption: 'Sadiku Table 1.1 · 6 个 SI 基本单位与本书用到的 1 个导出单位',
          head: ['物理量', '基本单位', '符号'],
          rows: [
            ['长度', '米（meter）', 'm'],
            ['质量', '千克（kilogram）', 'kg'],
            ['时间', '秒（second）', 's'],
            ['电流', '安培（ampere）', 'A'],
            ['热力学温度', '开尔文（kelvin）', 'K'],
            ['发光强度', '坎德拉（candela）', 'cd'],
            ['电荷（导出单位）', '库仑（coulomb）', String.raw`C（$1\text{ C} = 1\text{ A} \cdot \text{s}$）`],
          ],
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: 'Sadiku Table 1.2 常用工程数量级标尺',
    },
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '电荷的最小砖块与库仑（Sadiku 1.3 上 · Example 1.1）',
      sync: { layer: 'charge_flow', params: { cf_plot: 'none', cf_i: 1, cf_view: 'conventional' } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`整个电学世界只有一种最底层的实体——**电荷（Charge，$q$）**，单位是**库仑（$\text{C}$）**。自然界中存在电荷守恒定律：电荷既不能被凭空创造，也不能被消灭，只能在导线与元件之间转移。`,
        },
        {
          kind: 'p',
          text: String.raw`单个电子所带的电荷极其微小，只有 $-1.602 \times 10^{-19}\text{ C}$。反过来问：**凑齐 $1\text{ C}$ 的电荷，需要多少个电子？**（这正是 Sadiku Example 1.1 的核心计算。）`,
        },
        { kind: 'origin', title: '① 公理溯源（Origin）', text: String.raw`电荷是量子化的，总电荷量 $Q$ 等于电子个数 $N$ 乘以单个电子的电荷绝对值 $|e|$。` },
        { kind: 'formula', title: '② 纯符号通式（General Formula）', tex: String.raw`N = \frac{|Q|}{|e|}` },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            {
              label: 'Step A',
              text: String.raw`代入 $|Q| = 1\text{ C}$ 与基本电荷 $|e| = 1.602 \times 10^{-19}\text{ C}$`,
              tex: String.raw`N = \frac{1\text{ C}}{1.602 \times 10^{-19}\text{ C/电子}}`,
            },
            {
              label: 'Step B',
              text: '计算指数与系数',
              tex: String.raw`\begin{aligned} N &= \frac{1}{1.602} \times 10^{19} \\ &\approx \mathbf{6.24 \times 10^{18}\text{ 个电子}} \end{aligned}`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '单个电子与1库仑电荷量级对比图',
    },
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '电流的本质：电荷的时间变化率（Sadiku Eq. 1.1 & Eq. 1.2）',
      sync: { layer: 'charge_flow', halo: ['wire_cross_section'], params: { cf_plot: 'deriv', cf_t: 2, cf_view: 'conventional' } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`静止的电荷无法点亮灯泡，只有**流动起来的电荷**才能做功。把一根导线想象成水管，在某个[[wire_cross_section|横截面]]摆一个计数器：单位时间内穿过这个截面的电荷量，就是**电流（Current，$i$）**。`,
        },
        {
          kind: 'p',
          text: String.raw`在微积分语言里，“瞬时变化率”就是**导数**；反过来，已知电流随时间怎么变，要求一段时间里总共流过了多少库仑电荷，就是把每一小段的 $i\,dt$ 累加起来——也就是**定积分**。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`由电流定义“每秒穿过截面的电荷量”（$1\text{ A} = 1\text{ C/s}$），取时间间隔 $\Delta t \to 0$ 的瞬时极限，即得到微分形式；两边同时对时间积分，即得到电荷总量公式。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula · Sadiku Eq. 1.1 & 1.2）',
          tex: String.raw`\begin{aligned} i(t) &\triangleq \frac{dq(t)}{dt} && \text{(Eq. 1.1)} \\[4pt] Q &\triangleq \int_{t_0}^{t} i(\tau)\,d\tau && \text{(Eq. 1.2)} \end{aligned}`,
        },
        {
          kind: 'calc',
          title: String.raw`③ 代入实例 · 逐步化简（Sadiku Example 1.2 风格：已知 $q(t) = (3t^2 - t)\text{ C}$，求 $t = 2\text{ s}$ 时的电流）`,
          steps: [
            { label: 'Step A', text: '对 $q(t)$ 关于时间 $t$ 求导', tex: String.raw`i(t) = \frac{d}{dt}(3t^2 - t) = (6t - 1)\text{ A}` },
            { label: 'Step B', text: String.raw`代入时刻 $t = 2\text{ s}$`, tex: String.raw`i(2) = 6(2) - 1 = \mathbf{11\text{ A}}` },
          ],
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '电流是电荷的导数、电荷是电流的积分关系图',
    },
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '避开第一个大坑：习惯电流方向与“负电流”的真正含义',
      sync: { layer: 'charge_flow', halo: ['electron_stream'], params: { cf_plot: 'none', cf_i: -3, cf_view: 'electron' } },
      blocks: [
        {
          kind: 'p',
          text: '金属导线里真正移动的是带负电的[[electron_stream|自由电子]]，但 18 世纪富兰克林在发现电子之前，就已经把**正电荷移动的方向**规定为电流方向（Conventional Current）。全世界的电路教材与工程软件至今沿用这个规定——你不需要为电子反向纠结，只要记住：**电子往左跑，就等价于正电流往右流**。',
        },
        {
          kind: 'p',
          text: String.raw`更重要的是学会读懂**参考方向（Reference Direction）**：做题时我们在未知支路上先随便画一个箭头并标上 $i$；如果最后算出来 $i = -5\text{ A}$，千万别以为自己算错了！**负号只说明真实电流的大小是 $5\text{ A}$，方向恰好与你当初画的箭头相反**。`,
        },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '正电流向左与负电流向右完全等价示意图',
    },
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '电压的本质：永远存在于“两点之间”的电位高度差（Sadiku 1.4）',
      sync: { layer: 'voltage_height', halo: ['diff_vab_arrow'], params: { vh_a: 9, vh_b: 4 } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`电荷不会无缘无故在导线里流动，必须有一股“推力”把电荷从低处搬到高处。把 $1\text{ C}$ 正电荷从点 $b$ 搬到点 $a$ 所需要消耗的能量（焦耳 $\text{J}$），就定义为 $a, b$ 两点之间的[[diff_vab_arrow|**电压（Voltage / Potential Difference，$v_{ab}$）**]]。`,
        },
        {
          kind: 'p',
          text: String.raw`借用 Boylestad 最经典的**海拔高度类比**：说一座山“高度是 5 米”没有意义，你必须说“比海平面高 5 米”或“比山脚高 5 米”。电路里完全一样——**电压永远是两个点之间的差值（Across two points）**。我们常说“某点电压是 $5\text{ V}$”，其实暗含了“相对于参考地 GND = 0 V 高出 $5\text{ V}$”。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`由功与电势能定义，单位正电荷获得的势能增量等于两点电位之差（$1\text{ V} = 1\text{ J/C}$）；交换观测点顺序，高度差立即变号。`,
        },
        { kind: 'formula', title: '② 纯符号通式（General Formula · Sadiku Eq. 1.3）', tex: String.raw`v_{ab} \triangleq \frac{dw}{dq} = v_a - v_b, \qquad v_{ab} = -v_{ba}` },
        {
          kind: 'calc',
          title: String.raw`③ 代入数值 · 逐步化简（对应[[node_a_pillar,node_b_pillar|左侧阶梯台]]：$v_a = 9\text{ V},\; v_b = 4\text{ V}$）`,
          steps: [
            {
              label: 'Step A',
              text: String.raw`计算 [[node_a_pillar|$a$]] 相对 [[node_b_pillar|$b$]] 的电压 [[diff_vab_arrow|$v_{ab}$]]`,
              tex: String.raw`v_{ab} = v_a - v_b = 9\text{ V} - 4\text{ V} = \mathbf{+5\text{ V}}`,
            },
            {
              label: 'Step B',
              text: String.raw`反过来，从 $b$ 看 $a$ 的电压 $v_{ba}$`,
              tex: String.raw`\begin{aligned} v_{ba} &= v_b - v_a = 4\text{ V} - 9\text{ V} \\ &= \mathbf{-5\text{ V}} = -v_{ab} \end{aligned}`,
            },
            {
              label: 'Step C',
              text: String.raw`把 $2\text{ C}$ 正电荷从 $b$ 搬到 $a$ 需做功`,
              tex: String.raw`w = q \cdot v_{ab} = 2\text{ C} \times 5\text{ V} = \mathbf{10\text{ J}}`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT5,
      figure_caption: '电压是两点间电位差与极性反转等价图',
    },
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '教授苏格拉底引导例题：已知电流 i(t) 求总电荷 Q（Sadiku Example 1.3）',
      sync: { layer: 'charge_flow', halo: ['wire_cross_section'], params: { cf_plot: 'integral', cf_t: 1, cf_view: 'conventional' } },
      blocks: [
        {
          kind: 'guided',
          title: String.raw`已知 $i(t) = (3t^2 - t)\text{ A}$，求 $t=1\text{ s}$ 到 $t=2\text{ s}$ 间的总电荷 $Q$`,
          source: 'Sadiku Example 1.3 (p. 7)',
          problem: String.raw`某导线中的电流随时间变化规律为 $i(t) = (3t^2 - t)\text{ A}$，求从 $t = 1\text{ s}$ 到 $t = 2\text{ s}$ 之间总共流过导线截面的电荷量 $Q$。`,
          problem_svg: problemSvg(),
          steps: [
            {
              title: 'Step 1 · 选用 Eq. (1.2) 定积分通式',
              mini_svg: MINI_1,
              question: String.raw`第一步（选定公理公式）：现在已知电流 $i(t)$，要求一段时间内流过的总电荷 $Q$，应该选用哪条公式？`,
              hint: String.raw`提示：由电荷求电流是求导 $i = dq/dt$，反过来由电流累计总电荷要做逆运算！`,
              options: [
                {
                  text: String.raw`$\text{对 } i(t) \text{ 求导：} Q = \dfrac{di}{dt}$`,
                  correct: false,
                  feedback: String.raw`方向反啦！$i = dq/dt$ 是从电荷求电流；现在已知电流要求累积的总电荷，需要做积分（把每一瞬间的 $i\,dt$ 加起来）！`,
                },
                {
                  text: String.raw`$\text{使用 Eq. (1.2) 定积分：} Q = \displaystyle\int_{1}^{2} i(t)\,dt$`,
                  correct: true,
                  feedback: String.raw`准确！总电荷就是电流曲线在 $t=1$ 到 $t=2$ 下方的面积。`,
                },
              ],
              board: [String.raw`\begin{aligned} Q &= \int_{t_0}^{t} i(\tau)\,d\tau \\ &= \int_{1}^{2} (3t^2 - t)\,dt \end{aligned}`],
              halo: ['wire_cross_section'],
              params: { cf_plot: 'integral', cf_t: 1 },
            },
            {
              title: 'Step 2 · 求出原函数',
              mini_svg: MINI_2,
              question: '第二步（求原函数）：对 $3t^2 - t$ 逐项求不定积分，原函数是什么？',
              hint: String.raw`提示：$3t^2$ 的原函数是 $t^3$，别忘了 $-t$ 的原函数前面有系数 $\frac{1}{2}$！`,
              options: [
                {
                  text: String.raw`$\left[t^3 - \dfrac{t^2}{2}\right]_{1}^{2}$`,
                  correct: true,
                  feedback: String.raw`很稳！求导验算一下：$(t^3 - \frac{1}{2}t^2)' = 3t^2 - t$，严丝合缝。`,
                },
                {
                  text: String.raw`$\left[3t^3 - t^2\right]_{1}^{2}$`,
                  correct: false,
                  feedback: String.raw`忘了除以新指数 $(n+1)$ 啦！$3t^2$ 积分要除以 $3$ 变成 $t^3$，$-t$ 积分要除以 $2$ 变成 $-\frac{1}{2}t^2$。`,
                },
              ],
              board: [String.raw`Q = \left[ t^3 - \frac{t^2}{2} \right]_{1}^{2}`],
              halo: ['wire_cross_section'],
              params: { cf_plot: 'integral', cf_t: 1.5 },
            },
            {
              title: 'Step 3 · 代入上下限算出总电荷',
              mini_svg: MINI_3,
              question: String.raw`第三步（代入上下限收官）：分别代入 $t = 2$ 与 $t = 1$ 相减，总电荷 $Q$ 是多少库仑？`,
              hint: String.raw`提示：$F(2) = 2^3 - 2^2/2 = 8 - 2 = 6$；$F(1) = 1^3 - 1^2/2 = 1 - 0.5 = 0.5$。`,
              options: [
                {
                  text: String.raw`$Q = (8 - 2) - (1 - 0.5) = \mathbf{5.5\text{ C}}$`,
                  correct: true,
                  feedback: String.raw`完美收官！从 $1\text{ s}$ 到 $2\text{ s}$ 总共有 $5.5\text{ C}$ 的电荷穿过了导线截面。`,
                },
                {
                  text: String.raw`$Q = 6 - 0 = 6\text{ C}$`,
                  correct: false,
                  feedback: String.raw`注意下限是 $t = 1$（不是 $0$）！代入下限 $t = 1$ 得到 $1 - 0.5 = 0.5$，所以 $6 - 0.5 = 5.5\text{ C}$。`,
                },
              ],
              board: [String.raw`\begin{aligned} Q &= \left(2^3 - \frac{2^2}{2}\right) - \left(1^3 - \frac{1^2}{2}\right) \\ &= 6 - 0.5 = \mathbf{5.5\text{ C}} \end{aligned}`],
              halo: ['wire_cross_section'],
              params: { cf_plot: 'integral', cf_t: 2 },
            },
          ],
        },
      ],
    },
    {
      act_index: 7,
      badge: '第 7 幕',
      title: '随堂顿悟自测 + 下节预告（W1-L2）',
      sync: { layer: 'charge_flow', params: { cf_plot: 'none' } },
      blocks: [],
      quiz: [
        {
          id: 'w1l1_q1',
          question: String.raw`在一根水平导线上，我们假设电流参考方向向右，算得 $i = -2\text{ A}$。这意味着什么？`,
          options: [
            { key: 'a', text: '真实正电流大小为 2 A，方向向左（电子向右移动）', correct: true },
            { key: 'b', text: '导线里没有电流，或者公式列错了', correct: false },
          ],
          feedback_correct: '完全掌握！参考方向只是我们的“标尺”，算得负号只代表实际流向与标尺相反，完全正常。',
          feedback_wrong: '别怕负号！负电流绝不代表算错，它仅仅说明真实正电流大小是 2 A、方向与你预设的箭头相反。',
          figure: SVG_Q1,
          sync: { layer: 'charge_flow', params: { cf_plot: 'none', cf_i: 2, cf_view: 'conventional' } },
        },
        {
          id: 'w1l1_q2',
          question: String.raw`已知电路中节点 $a$ 相对地电位 $v_a = 3\text{ V}$，节点 $b$ 相对地电位 $v_b = 8\text{ V}$，则 $v_{ab}$ 是多少？`,
          options: [
            { key: 'a', text: String.raw`$+5\text{ V}$`, correct: false },
            { key: 'b', text: String.raw`$-5\text{ V}\text{（因为 } v_{ab} = v_a - v_b = 3 - 8 = -5\text{ V）}$`, correct: true },
          ],
          feedback_correct: String.raw`精准！永远记住下标顺序：$v_{ab}$ 永远等于“前减后” $v_a - v_b$，代表 $a$ 比 $b$ 低了 5 V。`,
          feedback_wrong: String.raw`注意下标顺序！$v_{ab} = v_a - v_b = 3\text{ V} - 8\text{ V} = -5\text{ V}$，$+5\text{ V}$ 是 $v_{ba}$。`,
          figure: SVG_Q2,
          sync: { layer: 'voltage_height', halo: ['node_a_pillar', 'node_b_pillar'] },
        },
      ],
      after_quiz: [
        {
          kind: 'note',
          tone: 'tip',
          text: '**下节预告（W1-L2 · 功率、无源符号约定与受控源）**：现在你已经同时握住了“电荷流速 $i$”和“电位高度差 $v$”。把它们相乘（$p = vi$），下一课我们就来回答最核心的工程问题：一个元件到底是在**消耗电能（发热）**，还是在**对外供电**？',
        },
        { kind: 'figure', svg: SVG_ACT7, caption: '电流 × 电压 = 功率（下一课 W1-L2）' },
      ],
    },
  ],
};

export default W1_L1;
