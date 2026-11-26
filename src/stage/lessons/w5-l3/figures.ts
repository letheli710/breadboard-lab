// Small light-theme figures for the W5-L3 quiz (the sheet has none). Each shows the set-up of its
// question and none of the answer.

import { subText } from './svgs';

const R = String.raw;

const head = (h: number, label: string) =>
  R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${h}" width="360" height="${h}" role="img" aria-label="${label}" font-family="sans-serif"><rect x="1" y="1" width="358" height="${h - 2}" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>`;

/** Q1: a sine source and a capacitor at ω = 200 rad/s, both to be converted */
export const SVG_Q1 = subText(
  head(130, '时域电源与电容，待转换为相量与复阻抗') +
    R`<text x="180" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">ω = 200 rad/s，以余弦为基准</text>
<rect x="10" y="38" width="182" height="74" rx="8" fill="#eff6ff" stroke="#2563eb"/>
<circle cx="40" cy="75" r="18" fill="#fff" stroke="#1d4ed8" stroke-width="2"/>
<path d="M 29 75 Q 34.5 64 40 75 T 51 75" fill="none" stroke="#1d4ed8" stroke-width="2"/>
<text x="64" y="68" font-size="10.5" fill="#1d4ed8">12sin(200t + 30°) V</text>
<text x="64" y="90" font-size="12" font-weight="bold" fill="#1e3a8a">V_s = ?</text>
<rect x="202" y="38" width="148" height="74" rx="8" fill="#ccfbf1" stroke="#0f766e"/>
<line x1="220" y1="62" x2="244" y2="62" stroke="#0f766e" stroke-width="2.8"/><line x1="220" y1="72" x2="244" y2="72" stroke="#0f766e" stroke-width="2.8"/>
<line x1="232" y1="46" x2="232" y2="62" stroke="#334155" stroke-width="2"/><line x1="232" y1="72" x2="232" y2="104" stroke="#334155" stroke-width="2"/>
<text x="258" y="68" font-size="11" fill="#0f766e">C = 250 μF</text>
<text x="258" y="90" font-size="12" font-weight="bold" fill="#115e59">Z_C = ?</text>
</svg>`,
);

/** Q2: one AC source and one DC source in the same circuit */
export const SVG_Q2 = subText(
  head(130, '交流电压源与直流电源同时激励的 RLC 电路') +
    R`<line x1="50" y1="34" x2="310" y2="34" stroke="#334155" stroke-width="2"/><line x1="50" y1="106" x2="310" y2="106" stroke="#334155" stroke-width="2"/>
<line x1="50" y1="34" x2="50" y2="52" stroke="#334155" stroke-width="2"/><line x1="50" y1="88" x2="50" y2="106" stroke="#334155" stroke-width="2"/>
<circle cx="50" cy="70" r="18" fill="#fff" stroke="#1d4ed8" stroke-width="2"/><path d="M 39 70 Q 44.5 59 50 70 T 61 70" fill="none" stroke="#1d4ed8" stroke-width="2"/>
<text x="74" y="62" font-size="11" font-weight="bold" fill="#1d4ed8">10cos(100t) V</text><text x="74" y="78" font-size="10.5" fill="#475569">ω = 100 rad/s</text>
<rect x="150" y="56" width="46" height="28" rx="4" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/><text x="173" y="74" text-anchor="middle" font-size="11" font-weight="bold" fill="#5b21b6">L, C</text>
<line x1="173" y1="34" x2="173" y2="56" stroke="#334155" stroke-width="2"/><line x1="173" y1="84" x2="173" y2="106" stroke="#334155" stroke-width="2"/>
<line x1="310" y1="34" x2="310" y2="56" stroke="#334155" stroke-width="2"/><line x1="310" y1="84" x2="310" y2="106" stroke="#334155" stroke-width="2"/>
<line x1="296" y1="58" x2="324" y2="58" stroke="#b45309" stroke-width="2.6"/><line x1="302" y1="66" x2="318" y2="66" stroke="#b45309" stroke-width="2.6"/>
<line x1="296" y1="74" x2="324" y2="74" stroke="#b45309" stroke-width="2.6"/><line x1="302" y1="82" x2="318" y2="82" stroke="#b45309" stroke-width="2.6"/>
<text x="290" y="72" text-anchor="end" font-size="11" font-weight="bold" fill="#b45309">5 V（ω = 0）</text>
<text x="180" y="124" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#0f172a">两个电源，怎么分析？</text>
</svg>`,
);

/** Q3: a phasor voltage source straight between two non-reference nodes */
export const SVG_Q3 = subText(
  head(130, '两个非参考节点之间跨接相量电压源') +
    R`<circle cx="80" cy="54" r="20" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/><text x="80" y="59" text-anchor="middle" font-size="13" font-weight="bold" fill="#1d4ed8">V_1</text>
<circle cx="280" cy="54" r="20" fill="#fce7f3" stroke="#db2777" stroke-width="2"/><text x="280" y="59" text-anchor="middle" font-size="13" font-weight="bold" fill="#be185d">V_2</text>
<line x1="100" y1="54" x2="160" y2="54" stroke="#334155" stroke-width="2"/><line x1="200" y1="54" x2="260" y2="54" stroke="#334155" stroke-width="2"/>
<circle cx="180" cy="54" r="20" fill="#fff" stroke="#1d4ed8" stroke-width="2"/><text x="168" y="59" text-anchor="middle" font-size="14" font-weight="bold" fill="#1d4ed8">+</text><text x="192" y="59" text-anchor="middle" font-size="14" font-weight="bold" fill="#1d4ed8">−</text>
<text x="180" y="26" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#1d4ed8">V_s = 10∠90° V</text>
<rect x="44" y="24" width="272" height="60" rx="26" fill="none" stroke="#059669" stroke-width="2" stroke-dasharray="8,5"/>
<text x="180" y="104" text-anchor="middle" font-size="11" fill="#047857">超节点：外围 KCL 一个方程</text>
<text x="180" y="120" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#0f172a">还缺哪一个约束？</text>
</svg>`,
);

/** Q4: the two equations of the supermesh example, and the two coordinate forms */
export const SVG_Q4 = subText(
  head(130, '交流双网孔方程与两种复数坐标') +
    R`<rect x="18" y="16" width="324" height="50" rx="8" fill="#fff" stroke="#cbd5e1"/>
<text x="180" y="36" text-anchor="middle" font-size="12" font-weight="bold" fill="#4338ca">(4 + j2)I_1 + (2 − j4)I_2 = 20</text>
<text x="180" y="56" text-anchor="middle" font-size="12" font-weight="bold" fill="#be123c">I_2 − I_1 = −j4</text>
<rect x="30" y="78" width="130" height="38" rx="8" fill="#eff6ff" stroke="#2563eb"/><text x="95" y="102" text-anchor="middle" font-size="12" font-weight="bold" fill="#1d4ed8">直角 a + jb</text>
<rect x="200" y="78" width="130" height="38" rx="8" fill="#fef3c7" stroke="#d97706"/><text x="265" y="102" text-anchor="middle" font-size="12" font-weight="bold" fill="#92400e">极坐标 M∠θ</text>
<text x="180" y="102" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">?</text>
</svg>`,
);
