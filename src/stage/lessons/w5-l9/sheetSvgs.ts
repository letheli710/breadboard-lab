// The lesson sheet's inline SVGs (docs/lessons/W5-L9.md), drawn for a dark canvas, recoloured
// for the light theme by lightSvg (comments dropped). Changes:
// - SVG_BPF's Phase 1 banner names the worlds as the course map has them (W2 网络分析与电路定理,
//   W4 储能元件与暂态, W5 正弦稳态 / 频率响应); the sheet had "W2 等效/瞬态 → W4 相量";
// - SVG_PREVIEW (7.1): the LM358's swing on ±9 V is +7.5 V / −8.9 V, not ±7.5 V; the figure prints
//   the guided example's answers, so it follows the guided block (通关复盘), and SVG_PREVIEW_MASKED
//   (the same figure with "?" in place of the results) stands before it.

import { lightSvg } from '../../svgTheme';

const R = String.raw;

/** 1.3 四大滤波器家族全景图 */
export const SVG_FAMILY =
  lightSvg(R`<svg role="img" aria-label="1.3 四大滤波器家族全景图" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 440" width="760" height="440" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="380" y="28" fill="#f8fafc" font-size="16" font-weight="700" text-anchor="middle">四大滤波器家族幅频特性全景：理想砖墙（虚线）vs 实际响应（实线）</text>
  <g transform="translate(30,45)">
    <rect x="0" y="0" width="340" height="175" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
    <text x="16" y="22" fill="#38bdf8" font-size="13" font-weight="700">1. 低通滤波器 (LPF)</text>
    <text x="326" y="22" fill="#94a3b8" font-size="11" text-anchor="end">低音炮 / 抗混叠</text>
    <rect x="42" y="42" width="115" height="106" fill="#0ea5e9" fill-opacity="0.12"/>
    <line x1="42" y1="148" x2="318" y2="148" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="42" y1="36" x2="42" y2="148" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="316" y="164" fill="#cbd5e1" font-size="11" text-anchor="end">ω</text>
    <text x="34" y="46" fill="#cbd5e1" font-size="10" text-anchor="end">|H|</text>
    <polyline points="42,58 157,58 157,148" fill="none" stroke="#64748b" stroke-width="1.8" stroke-dasharray="5,4"/>
    <path d="M 42,58 C 105,58 135,68 157,84 C 195,112 245,138 310,145" fill="none" stroke="#38bdf8" stroke-width="2.6"/>
    <line x1="42" y1="84" x2="157" y2="84" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3"/>
    <circle cx="157" cy="84" r="4" fill="#f59e0b"/>
    <text x="157" y="164" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">ωc</text>
    <text x="38" y="87" fill="#f59e0b" font-size="9.5" text-anchor="end">0.707</text>
    <text x="98" y="138" fill="#7dd3fc" font-size="10.5" text-anchor="middle">通带</text>
    <text x="245" y="138" fill="#94a3b8" font-size="10.5" text-anchor="middle">阻带</text>
  </g>
  <g transform="translate(390,45)">
    <rect x="0" y="0" width="340" height="175" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
    <text x="16" y="22" fill="#34d399" font-size="13" font-weight="700">2. 高通滤波器 (HPF)</text>
    <text x="326" y="22" fill="#94a3b8" font-size="11" text-anchor="end">高音头 / 隔直耦合</text>
    <rect x="157" y="42" width="153" height="106" fill="#10b981" fill-opacity="0.12"/>
    <line x1="42" y1="148" x2="318" y2="148" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="42" y1="36" x2="42" y2="148" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="316" y="164" fill="#cbd5e1" font-size="11" text-anchor="end">ω</text>
    <text x="34" y="46" fill="#cbd5e1" font-size="10" text-anchor="end">|H|</text>
    <polyline points="42,148 157,148 157,58 310,58" fill="none" stroke="#64748b" stroke-width="1.8" stroke-dasharray="5,4"/>
    <path d="M 42,148 C 80,142 125,112 157,84 C 190,62 240,58 310,58" fill="none" stroke="#34d399" stroke-width="2.6"/>
    <line x1="42" y1="84" x2="157" y2="84" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3"/>
    <circle cx="157" cy="84" r="4" fill="#f59e0b"/>
    <text x="157" y="164" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">ωc</text>
    <text x="38" y="87" fill="#f59e0b" font-size="9.5" text-anchor="end">0.707</text>
    <text x="98" y="138" fill="#94a3b8" font-size="10.5" text-anchor="middle">阻带</text>
    <text x="240" y="138" fill="#6ee7b7" font-size="10.5" text-anchor="middle">通带</text>
  </g>
  <g transform="translate(30,240)">
    <rect x="0" y="0" width="340" height="175" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
    <text x="16" y="22" fill="#a78bfa" font-size="13" font-weight="700">3. 带通滤波器 (BPF)</text>
    <text x="326" y="22" fill="#94a3b8" font-size="11" text-anchor="end">人声中频 / 无线选台</text>
    <rect x="125" y="42" width="104" height="106" fill="#8b5cf6" fill-opacity="0.14"/>
    <line x1="42" y1="148" x2="318" y2="148" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="42" y1="36" x2="42" y2="148" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="316" y="164" fill="#cbd5e1" font-size="11" text-anchor="end">ω</text>
    <text x="34" y="46" fill="#cbd5e1" font-size="10" text-anchor="end">|H|</text>
    <polyline points="42,148 125,148 125,58 229,58 229,148 310,148" fill="none" stroke="#64748b" stroke-width="1.8" stroke-dasharray="5,4"/>
    <path d="M 42,148 C 78,146 105,122 125,84 C 145,56 162,56 177,56 C 192,56 209,56 229,84 C 249,122 276,144 310,147" fill="none" stroke="#a78bfa" stroke-width="2.6"/>
    <line x1="42" y1="84" x2="229" y2="84" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3"/>
    <circle cx="125" cy="84" r="3.8" fill="#f59e0b"/>
    <circle cx="229" cy="84" r="3.8" fill="#f59e0b"/>
    <line x1="177" y1="56" x2="177" y2="148" stroke="#c4b5fd" stroke-width="1" stroke-dasharray="2,3"/>
    <text x="125" y="164" fill="#f59e0b" font-size="10.5" font-weight="700" text-anchor="middle">ωc1</text>
    <text x="177" y="164" fill="#c4b5fd" font-size="10.5" font-weight="700" text-anchor="middle">ω0</text>
    <text x="229" y="164" fill="#f59e0b" font-size="10.5" font-weight="700" text-anchor="middle">ωc2</text>
    <text x="177" y="135" fill="#ddd6fe" font-size="10" text-anchor="middle">带宽 B = ωc2 - ωc1</text>
  </g>
  <g transform="translate(390,240)">
    <rect x="0" y="0" width="340" height="175" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
    <text x="16" y="22" fill="#fb7185" font-size="13" font-weight="700">4. 带阻 / 陷波滤波器 (BSF / Notch)</text>
    <text x="326" y="22" fill="#94a3b8" font-size="11" text-anchor="end">50/60 Hz 滤工频</text>
    <rect x="125" y="42" width="104" height="106" fill="#f43f5e" fill-opacity="0.14"/>
    <line x1="42" y1="148" x2="318" y2="148" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="42" y1="36" x2="42" y2="148" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="316" y="164" fill="#cbd5e1" font-size="11" text-anchor="end">ω</text>
    <text x="34" y="46" fill="#cbd5e1" font-size="10" text-anchor="end">|H|</text>
    <polyline points="42,58 125,58 125,148 229,148 229,58 310,58" fill="none" stroke="#64748b" stroke-width="1.8" stroke-dasharray="5,4"/>
    <path d="M 42,58 C 80,58 108,64 125,84 C 148,116 164,148 177,148 C 190,148 206,116 229,84 C 246,64 274,58 310,58" fill="none" stroke="#fb7185" stroke-width="2.6"/>
    <line x1="42" y1="84" x2="229" y2="84" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3"/>
    <circle cx="125" cy="84" r="3.8" fill="#f59e0b"/>
    <circle cx="229" cy="84" r="3.8" fill="#f59e0b"/>
    <text x="125" y="164" fill="#f59e0b" font-size="10.5" font-weight="700" text-anchor="middle">ωc1</text>
    <text x="177" y="164" fill="#fda4af" font-size="10.5" font-weight="700" text-anchor="middle">ω0</text>
    <text x="229" y="164" fill="#f59e0b" font-size="10.5" font-weight="700" text-anchor="middle">ωc2</text>
    <text x="177" y="114" fill="#fda4af" font-size="10" text-anchor="middle">陷波阻带</text>
  </g>
</svg>`);

/** 2.1 无源一阶 RC 低通与高通原理图 */
export const SVG_PASSIVE =
  lightSvg(R`<svg role="img" aria-label="2.1 无源一阶 RC 低通与高通原理图" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 250" width="760" height="250" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <g transform="translate(20,18)">
    <rect x="0" y="0" width="350" height="214" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
    <text x="175" y="24" fill="#38bdf8" font-size="13.5" font-weight="700" text-anchor="middle">(a) 无源一阶 RC 低通滤波器 (LPF)</text>
    <circle cx="52" cy="78" r="4" fill="none" stroke="#f8fafc" stroke-width="1.8"/>
    <circle cx="52" cy="176" r="4" fill="none" stroke="#f8fafc" stroke-width="1.8"/>
    <text x="28" y="130" fill="#f8fafc" font-size="13" font-weight="600" text-anchor="middle">Vi</text>
    <text x="52" y="68" fill="#94a3b8" font-size="11" text-anchor="middle">+</text>
    <text x="52" y="192" fill="#94a3b8" font-size="11" text-anchor="middle">-</text>
    <line x1="56" y1="78" x2="108" y2="78" stroke="#e2e8f0" stroke-width="2"/>
    <polyline points="108,78 114,68 126,88 138,68 150,88 162,68 174,88 180,78" fill="none" stroke="#38bdf8" stroke-width="2.2"/>
    <text x="144" y="58" fill="#38bdf8" font-size="12" font-weight="600" text-anchor="middle">R = 22 kΩ</text>
    <line x1="180" y1="78" x2="294" y2="78" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="222" cy="78" r="3.5" fill="#e2e8f0"/>
    <line x1="222" y1="78" x2="222" y2="118" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="204" y1="118" x2="240" y2="118" stroke="#f59e0b" stroke-width="2.6"/>
    <line x1="204" y1="130" x2="240" y2="130" stroke="#f59e0b" stroke-width="2.6"/>
    <line x1="222" y1="130" x2="222" y2="176" stroke="#e2e8f0" stroke-width="2"/>
    <text x="248" y="128" fill="#f59e0b" font-size="12" font-weight="600">C = 10 nF</text>
    <line x1="56" y1="176" x2="294" y2="176" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="222" cy="176" r="3.5" fill="#e2e8f0"/>
    <circle cx="298" cy="78" r="4" fill="none" stroke="#38bdf8" stroke-width="1.8"/>
    <circle cx="298" cy="176" r="4" fill="none" stroke="#38bdf8" stroke-width="1.8"/>
    <text x="322" y="130" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="middle">Vo</text>
    <text x="298" y="68" fill="#38bdf8" font-size="11" text-anchor="middle">+</text>
    <text x="298" y="192" fill="#38bdf8" font-size="11" text-anchor="middle">-</text>
    <text x="175" y="202" fill="#94a3b8" font-size="11" text-anchor="middle">电容对高频短路 → 高频被旁路入地，低频输出</text>
  </g>
  <g transform="translate(390,18)">
    <rect x="0" y="0" width="350" height="214" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
    <text x="175" y="24" fill="#34d399" font-size="13.5" font-weight="700" text-anchor="middle">(b) 无源一阶 RC 高通滤波器 (HPF)</text>
    <circle cx="52" cy="78" r="4" fill="none" stroke="#f8fafc" stroke-width="1.8"/>
    <circle cx="52" cy="176" r="4" fill="none" stroke="#f8fafc" stroke-width="1.8"/>
    <text x="28" y="130" fill="#f8fafc" font-size="13" font-weight="600" text-anchor="middle">Vi</text>
    <text x="52" y="68" fill="#94a3b8" font-size="11" text-anchor="middle">+</text>
    <text x="52" y="192" fill="#94a3b8" font-size="11" text-anchor="middle">-</text>
    <line x1="56" y1="78" x2="136" y2="78" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="136" y1="60" x2="136" y2="96" stroke="#f59e0b" stroke-width="2.6"/>
    <line x1="148" y1="60" x2="148" y2="96" stroke="#f59e0b" stroke-width="2.6"/>
    <text x="142" y="52" fill="#f59e0b" font-size="12" font-weight="600" text-anchor="middle">C = 100 nF</text>
    <line x1="148" y1="78" x2="294" y2="78" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="222" cy="78" r="3.5" fill="#e2e8f0"/>
    <line x1="222" y1="78" x2="222" y2="96" stroke="#e2e8f0" stroke-width="2"/>
    <polyline points="222,96 212,102 232,112 212,122 232,132 212,142 232,152 222,158" fill="none" stroke="#34d399" stroke-width="2.2"/>
    <line x1="222" y1="158" x2="222" y2="176" stroke="#e2e8f0" stroke-width="2"/>
    <text x="242" y="132" fill="#34d399" font-size="12" font-weight="600">R = 10 kΩ</text>
    <line x1="56" y1="176" x2="294" y2="176" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="222" cy="176" r="3.5" fill="#e2e8f0"/>
    <circle cx="298" cy="78" r="4" fill="none" stroke="#34d399" stroke-width="1.8"/>
    <circle cx="298" cy="176" r="4" fill="none" stroke="#34d399" stroke-width="1.8"/>
    <text x="322" y="130" fill="#34d399" font-size="13" font-weight="600" text-anchor="middle">Vo</text>
    <text x="298" y="68" fill="#34d399" font-size="11" text-anchor="middle">+</text>
    <text x="298" y="192" fill="#34d399" font-size="11" text-anchor="middle">-</text>
    <text x="175" y="202" fill="#94a3b8" font-size="11" text-anchor="middle">电容隔直通交 → 直流被阻断，高频全额落在 R 上</text>
  </g>
</svg>`);

/** 3.1 加载效应诊断图 */
export const SVG_LOADING =
  lightSvg(R`<svg role="img" aria-label="3.1 加载效应诊断图" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 230" width="760" height="230" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="380" y="24" fill="#f8fafc" font-size="14.5" font-weight="700" text-anchor="middle">无源 RC 低通接入后级负载 RL = 10 kΩ：戴维南等效揭示“双塌陷”</text>
  <g transform="translate(22,40)">
    <rect x="0" y="0" width="335" height="172" rx="8" fill="#1e293b" stroke="#ef4444" stroke-width="1.3"/>
    <text x="167" y="20" fill="#fca5a5" font-size="12" font-weight="700" text-anchor="middle">带载无源 RC 低通（RL 并联在输出端）</text>
    <circle cx="32" cy="64" r="3.5" fill="none" stroke="#f8fafc" stroke-width="1.8"/>
    <circle cx="32" cy="144" r="3.5" fill="none" stroke="#f8fafc" stroke-width="1.8"/>
    <text x="16" y="108" fill="#f8fafc" font-size="12">Vi</text>
    <line x1="36" y1="64" x2="72" y2="64" stroke="#e2e8f0" stroke-width="2"/>
    <polyline points="72,64 78,55 88,73 98,55 108,73 118,55 128,73 134,64" fill="none" stroke="#38bdf8" stroke-width="2"/>
    <text x="103" y="47" fill="#38bdf8" font-size="11" text-anchor="middle">R = 22 kΩ</text>
    <line x1="134" y1="64" x2="296" y2="64" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="176" cy="64" r="3.2" fill="#e2e8f0"/>
    <line x1="176" y1="64" x2="176" y2="96" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="162" y1="96" x2="190" y2="96" stroke="#f59e0b" stroke-width="2.4"/>
    <line x1="162" y1="106" x2="190" y2="106" stroke="#f59e0b" stroke-width="2.4"/>
    <line x1="176" y1="106" x2="176" y2="144" stroke="#e2e8f0" stroke-width="2"/>
    <text x="150" y="126" fill="#f59e0b" font-size="10.5" text-anchor="middle">10 nF</text>
    <circle cx="250" cy="64" r="3.2" fill="#ef4444"/>
    <line x1="250" y1="64" x2="250" y2="78" stroke="#ef4444" stroke-width="2"/>
    <polyline points="250,78 242,84 258,92 242,100 258,108 242,116 258,124 250,130" fill="none" stroke="#ef4444" stroke-width="2.2"/>
    <line x1="250" y1="130" x2="250" y2="144" stroke="#ef4444" stroke-width="2"/>
    <text x="292" y="108" fill="#ef4444" font-size="11.5" font-weight="700" text-anchor="middle">RL=10kΩ</text>
    <line x1="36" y1="144" x2="296" y2="144" stroke="#e2e8f0" stroke-width="2"/>
    <text x="167" y="164" fill="#cbd5e1" font-size="10.5" text-anchor="middle">RL 抢走电流 → 分压衰减 + 改变充放电时间常数</text>
  </g>
  <g transform="translate(362,116)">
    <line x1="0" y1="8" x2="32" y2="8" stroke="#f59e0b" stroke-width="2.5"/>
    <polygon points="32,2 42,8 32,14" fill="#f59e0b"/>
    <text x="18" y="-4" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="middle">戴维南</text>
  </g>
  <g transform="translate(410,40)">
    <rect x="0" y="0" width="328" height="172" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.3"/>
    <text x="164" y="20" fill="#fde68a" font-size="12" font-weight="700" text-anchor="middle">戴维南等效结果（双指标全面崩塌）</text>
    <circle cx="48" cy="102" r="20" fill="none" stroke="#f59e0b" stroke-width="2"/>
    <text x="48" y="99" fill="#fde68a" font-size="10" font-weight="700" text-anchor="middle">0.3125</text>
    <text x="48" y="112" fill="#fde68a" font-size="10" font-weight="700" text-anchor="middle">× Vi</text>
    <line x1="48" y1="82" x2="48" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="48" y1="62" x2="96" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <polyline points="96,62 102,53 112,71 122,53 132,71 142,53 152,71 158,62" fill="none" stroke="#f59e0b" stroke-width="2"/>
    <text x="127" y="45" fill="#fde68a" font-size="10.5" font-weight="700" text-anchor="middle">Rth = R∥RL = 6.875 kΩ</text>
    <line x1="158" y1="62" x2="262" y2="62" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="215" y1="62" x2="215" y2="94" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="201" y1="94" x2="229" y2="94" stroke="#f59e0b" stroke-width="2.4"/>
    <line x1="201" y1="104" x2="229" y2="104" stroke="#f59e0b" stroke-width="2.4"/>
    <line x1="215" y1="104" x2="215" y2="142" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="48" y1="122" x2="48" y2="142" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="48" y1="142" x2="262" y2="142" stroke="#e2e8f0" stroke-width="2"/>
    <text x="292" y="88" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">通带暴跌</text>
    <text x="292" y="104" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">-10.10 dB</text>
    <text x="292" y="126" fill="#f59e0b" font-size="10.5" font-weight="700" text-anchor="middle">fc→2315Hz</text>
    <text x="164" y="164" fill="#fca5a5" font-size="10.5" text-anchor="middle">原设计 723 Hz 漂移 3.20 倍，完全失效！</text>
  </g>
</svg>`);

/** 4.1 一阶反相有源低通与高通原理图 */
export const SVG_ACTIVE =
  lightSvg(R`<svg role="img" aria-label="4.1 一阶反相有源低通与高通原理图" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 280" width="760" height="280" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <g transform="translate(18,16)">
    <rect x="0" y="0" width="356" height="248" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.3"/>
    <text x="178" y="22" fill="#34d399" font-size="13" font-weight="700" text-anchor="middle">(a) 一阶反相有源低通 (LM358, ±9V)</text>
    <circle cx="28" cy="142" r="3.5" fill="none" stroke="#f8fafc" stroke-width="1.8"/>
    <text x="14" y="146" fill="#f8fafc" font-size="11.5" font-weight="600">Vi</text>
    <line x1="32" y1="142" x2="54" y2="142" stroke="#e2e8f0" stroke-width="2"/>
    <polyline points="54,142 59,134 67,150 75,134 83,150 91,134 99,150 104,142" fill="none" stroke="#38bdf8" stroke-width="2"/>
    <text x="79" y="166" fill="#38bdf8" font-size="10.5" font-weight="600" text-anchor="middle">Ri = 10 kΩ</text>
    <line x1="104" y1="142" x2="176" y2="142" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="132" cy="142" r="4" fill="#f59e0b"/>
    <text x="132" y="160" fill="#fde68a" font-size="9.5" text-anchor="middle">虚地(0V)</text>
    <line x1="132" y1="142" x2="132" y2="54" stroke="#e2e8f0" stroke-width="1.8"/>
    <line x1="132" y1="92" x2="168" y2="92" stroke="#e2e8f0" stroke-width="1.8"/>
    <polyline points="168,92 173,84 181,100 189,84 197,100 205,84 213,100 218,92" fill="none" stroke="#34d399" stroke-width="2"/>
    <text x="193" y="114" fill="#34d399" font-size="10.5" font-weight="600" text-anchor="middle">Rf = 22 kΩ</text>
    <line x1="218" y1="92" x2="278" y2="92" stroke="#e2e8f0" stroke-width="1.8"/>
    <line x1="132" y1="54" x2="186" y2="54" stroke="#e2e8f0" stroke-width="1.8"/>
    <line x1="186" y1="42" x2="186" y2="66" stroke="#f59e0b" stroke-width="2.4"/>
    <line x1="196" y1="42" x2="196" y2="66" stroke="#f59e0b" stroke-width="2.4"/>
    <text x="191" y="38" fill="#f59e0b" font-size="10.5" font-weight="600" text-anchor="middle">Cf = 10 nF</text>
    <line x1="196" y1="54" x2="278" y2="54" stroke="#e2e8f0" stroke-width="1.8"/>
    <line x1="278" y1="54" x2="278" y2="158" stroke="#e2e8f0" stroke-width="1.8"/>
    <circle cx="278" cy="158" r="3.5" fill="#34d399"/>
    <polygon points="176,126 176,190 250,158" fill="#0f172a" stroke="#34d399" stroke-width="2.2"/>
    <text x="184" y="146" fill="#f8fafc" font-size="13" font-weight="700">-</text>
    <text x="184" y="178" fill="#f8fafc" font-size="12" font-weight="700">+</text>
    <text x="206" y="162" fill="#94a3b8" font-size="9.5" text-anchor="middle">LM358</text>
    <line x1="210" y1="141" x2="210" y2="122" stroke="#ef4444" stroke-width="1.4"/>
    <text x="225" y="128" fill="#ef4444" font-size="9">+9V</text>
    <line x1="210" y1="175" x2="210" y2="196" stroke="#38bdf8" stroke-width="1.4"/>
    <text x="225" y="198" fill="#38bdf8" font-size="9">-9V</text>
    <line x1="176" y1="174" x2="152" y2="174" stroke="#e2e8f0" stroke-width="1.8"/>
    <line x1="152" y1="174" x2="152" y2="202" stroke="#e2e8f0" stroke-width="1.8"/>
    <line x1="142" y1="202" x2="162" y2="202" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="146" y1="207" x2="158" y2="207" stroke="#e2e8f0" stroke-width="1.6"/>
    <line x1="150" y1="212" x2="154" y2="212" stroke="#e2e8f0" stroke-width="1.2"/>
    <line x1="250" y1="158" x2="318" y2="158" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="322" cy="158" r="3.5" fill="none" stroke="#34d399" stroke-width="1.8"/>
    <text x="339" y="162" fill="#34d399" font-size="11.5" font-weight="700">Vo</text>
    <text x="178" y="236" fill="#a7f3d0" font-size="10.5" text-anchor="middle">Kdc = -2.2 (+6.85 dB) | fc = 723.4 Hz | 零后级加载</text>
  </g>
  <g transform="translate(386,16)">
    <rect x="0" y="0" width="356" height="248" rx="8" fill="#1e293b" stroke="#a78bfa" stroke-width="1.3"/>
    <text x="178" y="22" fill="#c4b5fd" font-size="13" font-weight="700" text-anchor="middle">(b) 一阶反相有源高通 (LM358, ±9V)</text>
    <circle cx="24" cy="142" r="3.5" fill="none" stroke="#f8fafc" stroke-width="1.8"/>
    <text x="12" y="146" fill="#f8fafc" font-size="11.5" font-weight="600">Vi</text>
    <line x1="28" y1="142" x2="46" y2="142" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="46" y1="128" x2="46" y2="156" stroke="#f59e0b" stroke-width="2.4"/>
    <line x1="56" y1="128" x2="56" y2="156" stroke="#f59e0b" stroke-width="2.4"/>
    <text x="51" y="120" fill="#f59e0b" font-size="10" font-weight="600" text-anchor="middle">Ci=100nF</text>
    <line x1="56" y1="142" x2="72" y2="142" stroke="#e2e8f0" stroke-width="2"/>
    <polyline points="72,142 77,134 85,150 93,134 101,150 109,134 117,150 122,142" fill="none" stroke="#38bdf8" stroke-width="2"/>
    <text x="97" y="166" fill="#38bdf8" font-size="10" font-weight="600" text-anchor="middle">Ri=10kΩ</text>
    <line x1="122" y1="142" x2="176" y2="142" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="144" cy="142" r="4" fill="#f59e0b"/>
    <line x1="144" y1="142" x2="144" y2="82" stroke="#e2e8f0" stroke-width="1.8"/>
    <line x1="144" y1="82" x2="174" y2="82" stroke="#e2e8f0" stroke-width="1.8"/>
    <polyline points="174,82 179,74 187,90 195,74 203,90 211,74 219,90 224,82" fill="none" stroke="#c4b5fd" stroke-width="2"/>
    <text x="199" y="66" fill="#c4b5fd" font-size="10.5" font-weight="600" text-anchor="middle">Rf = 33 kΩ</text>
    <line x1="224" y1="82" x2="278" y2="82" stroke="#e2e8f0" stroke-width="1.8"/>
    <line x1="278" y1="82" x2="278" y2="158" stroke="#e2e8f0" stroke-width="1.8"/>
    <circle cx="278" cy="158" r="3.5" fill="#c4b5fd"/>
    <polygon points="176,126 176,190 250,158" fill="#0f172a" stroke="#a78bfa" stroke-width="2.2"/>
    <text x="184" y="146" fill="#f8fafc" font-size="13" font-weight="700">-</text>
    <text x="184" y="178" fill="#f8fafc" font-size="12" font-weight="700">+</text>
    <text x="206" y="162" fill="#94a3b8" font-size="9.5" text-anchor="middle">LM358</text>
    <line x1="176" y1="174" x2="152" y2="174" stroke="#e2e8f0" stroke-width="1.8"/>
    <line x1="152" y1="174" x2="152" y2="202" stroke="#e2e8f0" stroke-width="1.8"/>
    <line x1="142" y1="202" x2="162" y2="202" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="146" y1="207" x2="158" y2="207" stroke="#e2e8f0" stroke-width="1.6"/>
    <line x1="150" y1="212" x2="154" y2="212" stroke="#e2e8f0" stroke-width="1.2"/>
    <line x1="250" y1="158" x2="318" y2="158" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="322" cy="158" r="3.5" fill="none" stroke="#c4b5fd" stroke-width="1.8"/>
    <text x="339" y="162" fill="#c4b5fd" font-size="11.5" font-weight="700">Vo</text>
    <text x="178" y="236" fill="#ddd6fe" font-size="10.5" text-anchor="middle">|K∞| = 3.3 (+10.37 dB) | fc = 159.2 Hz | 隔直放大</text>
  </g>
</svg>`);

/** 5.1 精确波特图对比 */
export const SVG_BODE =
  lightSvg(R`<svg role="img" aria-label="5.1 精确波特图对比" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 445" width="740" height="445" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="370" y="24" fill="#f8fafc" font-size="14.5" font-weight="700" text-anchor="middle">精确波特图对比：有源带载稳如磐石 (+6.85 dB) vs 无源空载 (0 dB) vs 无源带载塌陷 (-10.10 dB)</text>
  <rect x="75" y="40" width="600" height="200" fill="#1e293b" stroke="#475569" stroke-width="1.2"/>
  <line x1="75" y1="60" x2="675" y2="60" stroke="#334155" stroke-width="1"/>
  <line x1="75" y1="100" x2="675" y2="100" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="75" y1="140" x2="675" y2="140" stroke="#334155" stroke-width="1"/>
  <line x1="75" y1="180" x2="675" y2="180" stroke="#334155" stroke-width="1"/>
  <line x1="75" y1="220" x2="675" y2="220" stroke="#334155" stroke-width="1"/>
  <line x1="225" y1="40" x2="225" y2="240" stroke="#334155" stroke-width="1"/>
  <line x1="375" y1="40" x2="375" y2="240" stroke="#334155" stroke-width="1"/>
  <line x1="525" y1="40" x2="525" y2="240" stroke="#334155" stroke-width="1"/>
  <text x="68" y="44" fill="#94a3b8" font-size="10" text-anchor="end">+15</text>
  <text x="68" y="64" fill="#94a3b8" font-size="10" text-anchor="end">+10</text>
  <text x="68" y="104" fill="#e2e8f0" font-size="10" font-weight="700" text-anchor="end">0 dB</text>
  <text x="68" y="144" fill="#94a3b8" font-size="10" text-anchor="end">-10</text>
  <text x="68" y="184" fill="#94a3b8" font-size="10" text-anchor="end">-20</text>
  <text x="68" y="224" fill="#94a3b8" font-size="10" text-anchor="end">-30</text>
  <text x="20" y="140" fill="#cbd5e1" font-size="11" font-weight="700" text-anchor="middle" transform="rotate(-90,20,140)">幅度 |H(f)| (dB)</text>
  <line x1="353.9" y1="40" x2="353.9" y2="400" stroke="#10b981" stroke-width="1.1" stroke-dasharray="3,3"/>
  <line x1="429.7" y1="40" x2="429.7" y2="400" stroke="#ef4444" stroke-width="1.1" stroke-dasharray="3,3"/>
  <polyline fill="none" stroke="#10b981" stroke-width="2.8" points="75.0,72.6 90.0,72.6 105.0,72.6 120.0,72.6 135.0,72.6 150.0,72.6 165.0,72.7 180.0,72.7 195.0,72.7 210.0,72.8 225.0,72.9 240.0,73.1 255.0,73.4 270.0,73.9 285.0,74.6 300.0,75.6 315.0,77.2 330.0,79.4 345.0,82.4 360.0,86.3 375.0,91.2 390.0,96.8 405.0,103.1 420.0,110.0 435.0,117.2 450.0,124.7 465.0,132.4 480.0,140.2 495.0,148.1 510.0,156.0 525.0,163.9 540.0,171.9 555.0,179.9 570.0,187.9 585.0,195.9 600.0,203.9 615.0,211.9 630.0,219.9 645.0,227.9 660.0,235.9 675.0,240.0"/>
  <polyline fill="none" stroke="#38bdf8" stroke-width="2.4" points="75.0,100.0 90.0,100.0 105.0,100.0 120.0,100.0 135.0,100.0 150.0,100.0 165.0,100.1 180.0,100.1 195.0,100.1 210.0,100.2 225.0,100.3 240.0,100.5 255.0,100.8 270.0,101.3 285.0,102.0 300.0,103.0 315.0,104.6 330.0,106.8 345.0,109.8 360.0,113.7 375.0,118.6 390.0,124.2 405.0,130.5 420.0,137.4 435.0,144.6 450.0,152.1 465.0,159.8 480.0,167.6 495.0,175.5 510.0,183.4 525.0,191.3 540.0,199.3 555.0,207.3 570.0,215.3 585.0,223.3 600.0,231.3 615.0,239.3 630.0,240.0 645.0,240.0 660.0,240.0 675.0,240.0"/>
  <polyline fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="7,3" points="75.0,140.4 90.0,140.4 105.0,140.4 120.0,140.4 135.0,140.4 150.0,140.4 165.0,140.4 180.0,140.4 195.0,140.4 210.0,140.4 225.0,140.4 240.0,140.5 255.0,140.5 270.0,140.5 285.0,140.6 300.0,140.7 315.0,140.9 330.0,141.2 345.0,141.7 360.0,142.3 375.0,143.4 390.0,144.9 405.0,147.1 420.0,150.1 435.0,153.9 450.0,158.7 465.0,164.3 480.0,170.6 495.0,177.4 510.0,184.7 525.0,192.2 540.0,199.8 555.0,207.6 570.0,215.5 585.0,223.4 600.0,231.3 615.0,239.3 630.0,240.0 645.0,240.0 660.0,240.0 675.0,240.0"/>
  <circle cx="353.9" cy="84.6" r="4.5" fill="#10b981" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="353.9" cy="112.0" r="4" fill="#38bdf8" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="429.7" cy="152.5" r="4.5" fill="#ef4444" stroke="#0f172a" stroke-width="1.2"/>
  <text x="360" y="76" fill="#6ee7b7" font-size="10.5" font-weight="700">fc=723Hz (+3.84dB)</text>
  <text x="436" y="150" fill="#fca5a5" font-size="10.5" font-weight="700">带载漂移 fc=2315Hz (-13.11dB)</text>
  <text x="545" y="148" fill="#a7f3d0" font-size="10.5" font-weight="700">-20 dB/dec</text>
  <rect x="84" y="170" width="232" height="62" rx="6" fill="#0f172a" fill-opacity="0.88" stroke="#334155" stroke-width="1"/>
  <line x1="94" y1="186" x2="118" y2="186" stroke="#10b981" stroke-width="2.8"/>
  <text x="124" y="190" fill="#a7f3d0" font-size="10">有源反相 LPF (带载 +6.85 dB, 723Hz)</text>
  <line x1="94" y1="203" x2="118" y2="203" stroke="#38bdf8" stroke-width="2.4"/>
  <text x="124" y="207" fill="#bae6fd" font-size="10">无源 RC LPF 空载 (0 dB, 723Hz)</text>
  <line x1="94" y1="220" x2="118" y2="220" stroke="#ef4444" stroke-width="2.4" stroke-dasharray="6,3"/>
  <text x="124" y="224" fill="#fecaca" font-size="10">无源 RC 带 10kΩ 负载 (-10.1 dB, 2315Hz)</text>
  <rect x="75" y="285" width="600" height="115" fill="#1e293b" stroke="#475569" stroke-width="1.2"/>
  <line x1="75" y1="342.5" x2="675" y2="342.5" stroke="#475569" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="225" y1="285" x2="225" y2="400" stroke="#334155" stroke-width="1"/>
  <line x1="375" y1="285" x2="375" y2="400" stroke="#334155" stroke-width="1"/>
  <line x1="525" y1="285" x2="525" y2="400" stroke="#334155" stroke-width="1"/>
  <text x="68" y="289" fill="#94a3b8" font-size="10" text-anchor="end">0°</text>
  <text x="68" y="346" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="end">-45°</text>
  <text x="68" y="402" fill="#94a3b8" font-size="10" text-anchor="end">-90°</text>
  <text x="20" y="342" fill="#cbd5e1" font-size="10.5" font-weight="700" text-anchor="middle" transform="rotate(-90,20,342)">极点相移 (°)</text>
  <polyline fill="none" stroke="#10b981" stroke-width="2.6" points="75.0,286.0 90.0,286.3 105.0,286.6 120.0,287.0 135.0,287.5 150.0,288.2 165.0,289.0 180.0,290.1 195.0,291.4 210.0,293.0 225.0,295.1 240.0,297.6 255.0,300.8 270.0,304.7 285.0,309.5 300.0,315.2 315.0,321.8 330.0,329.4 345.0,337.5 360.0,345.9 375.0,354.1 390.0,361.8 405.0,368.7 420.0,374.5 435.0,379.5 450.0,383.5 465.0,386.8 480.0,389.5 495.0,391.6 510.0,393.4 525.0,394.7 540.0,395.8 555.0,396.7 570.0,397.3 585.0,397.9 600.0,398.3 615.0,398.7 630.0,398.9 645.0,399.2 660.0,399.3 675.0,399.5"/>
  <polyline fill="none" stroke="#ef4444" stroke-width="2.3" stroke-dasharray="7,3" points="75.0,285.3 90.0,285.4 105.0,285.5 120.0,285.6 135.0,285.8 150.0,286.0 165.0,286.3 180.0,286.6 195.0,287.0 210.0,287.5 225.0,288.2 240.0,289.0 255.0,290.0 270.0,291.3 285.0,292.9 300.0,294.9 315.0,297.5 330.0,300.6 345.0,304.5 360.0,309.2 375.0,314.9 390.0,321.5 405.0,329.0 420.0,337.1 435.0,345.5 450.0,353.7 465.0,361.4 480.0,368.3 495.0,374.3 510.0,379.2 525.0,383.3 540.0,386.7 555.0,389.4 570.0,391.5 585.0,393.3 600.0,394.7 615.0,395.7 630.0,396.6 645.0,397.3 660.0,397.9 675.0,398.3"/>
  <circle cx="353.9" cy="342.5" r="4" fill="#10b981"/>
  <circle cx="429.7" cy="342.5" r="4" fill="#ef4444"/>
  <text x="84" y="393" fill="#94a3b8" font-size="9.5">注：反相有源 LPF 总相角为 -180° + 极点相移（即 -180° → -225° → -270°）</text>
  <text x="75" y="418" fill="#cbd5e1" font-size="10.5" text-anchor="middle">10 Hz</text>
  <text x="225" y="418" fill="#cbd5e1" font-size="10.5" text-anchor="middle">100 Hz</text>
  <text x="375" y="418" fill="#cbd5e1" font-size="10.5" text-anchor="middle">1 kHz</text>
  <text x="525" y="418" fill="#cbd5e1" font-size="10.5" text-anchor="middle">10 kHz</text>
  <text x="675" y="418" fill="#cbd5e1" font-size="10.5" text-anchor="middle">100 kHz</text>
  <text x="375" y="436" fill="#94a3b8" font-size="11" font-weight="700" text-anchor="middle">频率 f (Hz，对数坐标)</text>
</svg>`);

/** 6.1 零电感级联有源带通架构 + Phase 1 → Phase 2 路线 */
export const SVG_BPF =
  lightSvg(R`<svg role="img" aria-label="6.1 零电感级联有源带通架构 + Phase 1 → Phase 2 路线" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 225" width="760" height="225" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="380" y="24" fill="#f8fafc" font-size="14.5" font-weight="700" text-anchor="middle">零电感级联型有源带通滤波器架构（级间零加载，自由叠加增益）</text>
  <rect x="18" y="66" width="84" height="58" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="1.4"/>
  <text x="60" y="91" fill="#f8fafc" font-size="11.5" font-weight="700" text-anchor="middle">传感器 / 麦</text>
  <text x="60" y="109" fill="#94a3b8" font-size="10" text-anchor="middle">全频混合信号</text>
  <line x1="102" y1="95" x2="132" y2="95" stroke="#e2e8f0" stroke-width="2"/>
  <polygon points="132,90 142,95 132,100" fill="#e2e8f0"/>
  <rect x="142" y="50" width="166" height="90" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.8"/>
  <text x="225" y="72" fill="#34d399" font-size="12" font-weight="700" text-anchor="middle">第 1 级：有源高通 (HPF)</text>
  <text x="225" y="92" fill="#e2e8f0" font-size="10.5" text-anchor="middle">fc1 = 338.6 Hz (10kΩ, 47nF)</text>
  <text x="225" y="110" fill="#94a3b8" font-size="10" text-anchor="middle">切掉直流漂移与低频嗡声</text>
  <text x="225" y="128" fill="#6ee7b7" font-size="10" font-weight="700" text-anchor="middle">增益 K1 = -1 (0 dB)</text>
  <line x1="308" y1="95" x2="342" y2="95" stroke="#f59e0b" stroke-width="2"/>
  <polygon points="342,90 352,95 342,100" fill="#f59e0b"/>
  <text x="328" y="84" fill="#fde68a" font-size="9.5" text-anchor="middle">零加载</text>
  <rect x="352" y="50" width="176" height="90" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="440" y="72" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">第 2 级：有源低通 + 增益</text>
  <text x="440" y="92" fill="#e2e8f0" font-size="10.5" text-anchor="middle">fc2 = 3288 Hz (22kΩ, 2.2nF)</text>
  <text x="440" y="110" fill="#94a3b8" font-size="10" text-anchor="middle">滤除高频嘶声与射频干扰</text>
  <text x="440" y="128" fill="#7dd3fc" font-size="10" font-weight="700" text-anchor="middle">增益 K2 = -2.2 (+6.85 dB)</text>
  <line x1="528" y1="95" x2="558" y2="95" stroke="#a78bfa" stroke-width="2"/>
  <polygon points="558,90 568,95 558,100" fill="#a78bfa"/>
  <rect x="568" y="50" width="174" height="90" rx="8" fill="#1e293b" stroke="#a78bfa" stroke-width="1.8"/>
  <text x="655" y="72" fill="#c4b5fd" font-size="12" font-weight="700" text-anchor="middle">纯净带通输出 (BPF)</text>
  <text x="655" y="92" fill="#f8fafc" font-size="10.5" text-anchor="middle">通带: 339 Hz ~ 3.29 kHz</text>
  <text x="655" y="110" fill="#ddd6fe" font-size="10" text-anchor="middle">f0 = 1055 Hz | B = 2.95 kHz</text>
  <text x="655" y="128" fill="#a78bfa" font-size="10" font-weight="700" text-anchor="middle">总增益 +2.2 (同相输出!)</text>
  <rect x="18" y="160" width="724" height="48" rx="8" fill="#172554" stroke="#3b82f6" stroke-width="1.2"/>
  <text x="380" y="180" fill="#93c5fd" font-size="11.5" font-weight="700" text-anchor="middle">Phase 1 知识收官：W1 欧姆/基尔霍夫 → W2 等效/电路定理 → W3 运放 → W4 储能/瞬态 → W5 相量/波特图/谐振/有源滤波</text>
  <text x="380" y="198" fill="#fde68a" font-size="11" font-weight="700" text-anchor="middle">下一站 Phase 2（ESP32 硬件实战）：用今天的 LM358 有源低通做 ADC 抗混叠前端，让微控制器精准读懂真实物理世界！</text>
</svg>`);

/** 7.1 工程设计题架构图（通关复盘：标准件落地结果） */
export const SVG_PREVIEW =
  lightSvg(R`<svg role="img" aria-label="7.1 工程设计题架构图（通关复盘：标准件落地结果）" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 175" width="760" height="175" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="380" y="24" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">苏格拉底工程实战目标：设计抗混叠有源低通前端（|K| ≈ 5 / +14 dB，fc ≈ 1.0 kHz）</text>
  <rect x="24" y="42" width="215" height="114" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.4"/>
  <text x="131" y="64" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">已知设计指标</text>
  <text x="38" y="86" fill="#e2e8f0" font-size="11">• 通带增益：|K| = 5 (+14 dB)</text>
  <text x="38" y="106" fill="#e2e8f0" font-size="11">• 截止频率：fc = 1.0 kHz</text>
  <text x="38" y="126" fill="#e2e8f0" font-size="11">• 输入峰值：Vin,peak = 1.2 V</text>
  <text x="38" y="146" fill="#fde68a" font-size="11">• 供电：LM358 (±9V, 摆幅 +7.5/−8.9 V)</text>

  <line x1="239" y1="99" x2="274" y2="99" stroke="#10b981" stroke-width="2.2"/>
  <polygon points="274,94 284,99 274,104" fill="#10b981"/>

  <rect x="284" y="42" width="218" height="114" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.4"/>
  <text x="393" y="64" fill="#34d399" font-size="12" font-weight="700" text-anchor="middle">5 步苏格拉底选型路径</text>
  <text x="298" y="86" fill="#e2e8f0" font-size="11">Step 1：确定输入电阻 Ri</text>
  <text x="298" y="104" fill="#e2e8f0" font-size="11">Step 2：求解反馈电阻 Rf (E24)</text>
  <text x="298" y="122" fill="#e2e8f0" font-size="11">Step 3：计算反馈电容 Cf (E12)</text>
  <text x="298" y="140" fill="#e2e8f0" font-size="11">Step 4-5：核验实际 fc 与防饱和</text>

  <line x1="502" y1="99" x2="537" y2="99" stroke="#a78bfa" stroke-width="2.2"/>
  <polygon points="537,94 547,99 537,104" fill="#a78bfa"/>

  <rect x="547" y="42" width="189" height="114" rx="8" fill="#1e293b" stroke="#a78bfa" stroke-width="1.4"/>
  <text x="641" y="64" fill="#c4b5fd" font-size="12" font-weight="700" text-anchor="middle">标准件落地结果</text>
  <text x="562" y="88" fill="#a7f3d0" font-size="11" font-weight="700">Ri = 10 kΩ, Rf = 51 kΩ</text>
  <text x="562" y="108" fill="#fde68a" font-size="11" font-weight="700">Cf = 3.3 nF (332)</text>
  <text x="562" y="128" fill="#e2e8f0" font-size="10.5">实测 fc = 945.7 Hz (偏差5.4%)</text>
  <text x="562" y="146" fill="#6ee7b7" font-size="10.5">Vout,pk = 6.12 V &lt; 7.5 V ✓</text>
</svg>`);

/** 7.1 before the guided example: the results read "?" */
export const SVG_PREVIEW_MASKED =
  lightSvg(R`<svg role="img" aria-label="7.1 工程设计题架构图（通关复盘：标准件落地结果（待你求出））" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 175" width="760" height="175" style="background:#0f172a;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <text x="380" y="24" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">苏格拉底工程实战目标：设计抗混叠有源低通前端（|K| ≈ 5 / +14 dB，fc ≈ 1.0 kHz）</text>
  <rect x="24" y="42" width="215" height="114" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.4"/>
  <text x="131" y="64" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">已知设计指标</text>
  <text x="38" y="86" fill="#e2e8f0" font-size="11">• 通带增益：|K| = 5 (+14 dB)</text>
  <text x="38" y="106" fill="#e2e8f0" font-size="11">• 截止频率：fc = 1.0 kHz</text>
  <text x="38" y="126" fill="#e2e8f0" font-size="11">• 输入峰值：Vin,peak = 1.2 V</text>
  <text x="38" y="146" fill="#fde68a" font-size="11">• 供电：LM358 (±9V, 摆幅 +7.5/−8.9 V)</text>

  <line x1="239" y1="99" x2="274" y2="99" stroke="#10b981" stroke-width="2.2"/>
  <polygon points="274,94 284,99 274,104" fill="#10b981"/>

  <rect x="284" y="42" width="218" height="114" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.4"/>
  <text x="393" y="64" fill="#34d399" font-size="12" font-weight="700" text-anchor="middle">5 步苏格拉底选型路径</text>
  <text x="298" y="86" fill="#e2e8f0" font-size="11">Step 1：确定输入电阻 Ri</text>
  <text x="298" y="104" fill="#e2e8f0" font-size="11">Step 2：求解反馈电阻 Rf (E24)</text>
  <text x="298" y="122" fill="#e2e8f0" font-size="11">Step 3：计算反馈电容 Cf (E12)</text>
  <text x="298" y="140" fill="#e2e8f0" font-size="11">Step 4-5：核验实际 fc 与防饱和</text>

  <line x1="502" y1="99" x2="537" y2="99" stroke="#a78bfa" stroke-width="2.2"/>
  <polygon points="537,94 547,99 537,104" fill="#a78bfa"/>

  <rect x="547" y="42" width="189" height="114" rx="8" fill="#1e293b" stroke="#a78bfa" stroke-width="1.4"/>
  <text x="641" y="64" fill="#c4b5fd" font-size="12" font-weight="700" text-anchor="middle">标准件落地结果（待你求出）</text>
  <text x="562" y="88" fill="#a7f3d0" font-size="11" font-weight="700">Ri = ?, Rf = ? (E24)</text>
  <text x="562" y="108" fill="#fde68a" font-size="11" font-weight="700">Cf = ? (E12)</text>
  <text x="562" y="128" fill="#e2e8f0" font-size="10.5">实际 fc = ? Hz（偏差 ?）</text>
  <text x="562" y="146" fill="#6ee7b7" font-size="10.5">Vout,pk = ? V（削波吗？）</text>
</svg>`);
