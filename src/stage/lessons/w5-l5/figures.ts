// The quiz figures (light theme, drawn here: the sheet has none). Each shows the question's set-up
// and none of its answer.

const R = String.raw;

const wave = (amp: number, phaseDeg: number, y0: number, x0: number, w: number) =>
  Array.from({ length: 121 }, (_, k) => {
    const t = k / 120;
    return `${(x0 + t * w).toFixed(1)},${(y0 - amp * Math.cos(2 * Math.PI * 1.5 * t + (phaseDeg * Math.PI) / 180)).toFixed(1)}`;
  }).join(' ');

/** Q1: v(t) and i(t) of the port, phases marked, nothing computed */
export const SVG_Q1 = R`<svg viewBox="0 0 340 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="端口电压 v(t) 与电流 i(t) 的波形" style="max-width:400px">
<rect x="0" y="0" width="340" height="130" rx="8" fill="#fbf7ef" stroke="#e3d8c2"/>
<line x1="20" y1="66" x2="320" y2="66" stroke="#64748b" stroke-width="1.2"/>
<polyline points="${wave(40, 30, 66, 20, 300)}" fill="none" stroke="#0284c7" stroke-width="2.2"/>
<polyline points="${wave(28, -30, 66, 20, 300)}" fill="none" stroke="#059669" stroke-width="2.2"/>
<text x="24" y="18" fill="#0369a1" font-size="11" font-weight="bold" font-family="sans-serif">v(t) = 100cos(377t + 30°) V</text>
<text x="24" y="122" fill="#047857" font-size="11" font-weight="bold" font-family="sans-serif">i(t) = 8cos(377t − 30°) A</text>
<text x="318" y="122" fill="#7e22ce" font-size="11" font-weight="bold" text-anchor="end" font-family="sans-serif">p(t) = v·i = ?</text>
</svg>`;

/** Q2: an ideal inductor straight across the mains */
export const SVG_Q2 = R`<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="理想电感直接接在 220 V RMS、50 Hz 交流电源上" style="max-width:360px">
<rect x="0" y="0" width="300" height="120" rx="8" fill="#fbf7ef" stroke="#e3d8c2"/>
<path d="M 100 40 V 24 H 200 V 36 M 200 84 V 96 H 100 V 80" fill="none" stroke="#334155" stroke-width="2"/>
<circle cx="100" cy="60" r="20" fill="#fff" stroke="#0284c7" stroke-width="2.2"/>
<path d="M 89 60 q 5.5 -10 11 0 t 11 0" fill="none" stroke="#0284c7" stroke-width="2"/>
<text x="72" y="56" fill="#0369a1" font-size="11" font-weight="bold" text-anchor="end" font-family="sans-serif">220 V</text>
<text x="72" y="70" fill="#0369a1" font-size="10" text-anchor="end" font-family="sans-serif">RMS, 50 Hz</text>
<path d="M 200 36 c 12 0 12 12 0 12 c 12 0 12 12 0 12 c 12 0 12 12 0 12 c 12 0 12 12 0 12" fill="none" stroke="#7c3aed" stroke-width="2.2"/>
<text x="222" y="58" fill="#6d28d9" font-size="11" font-weight="bold" font-family="sans-serif">L = 50 mH</text>
<text x="222" y="74" fill="#6d28d9" font-size="10" font-family="sans-serif">（理想，无电阻）</text>
<text x="150" y="114" fill="#1f2a44" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">一个周期的平均功率 P = ?</text>
</svg>`;

/** Q3: a DC level with a sinusoidal ripple; peak and level marked, RMS asked */
export const SVG_Q3 = R`<svg viewBox="0 0 340 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="直流 6 V 叠加峰值 8√2 V 正弦纹波的电压波形" style="max-width:400px">
<rect x="0" y="0" width="340" height="130" rx="8" fill="#fbf7ef" stroke="#e3d8c2"/>
<line x1="40" y1="96" x2="320" y2="96" stroke="#64748b" stroke-width="1.2"/>
<line x1="40" y1="14" x2="40" y2="122" stroke="#64748b" stroke-width="1.2"/>
<text x="34" y="100" fill="#5f626b" font-size="10" text-anchor="end" font-family="monospace">0</text>
<line x1="40" y1="72" x2="320" y2="72" stroke="#64748b" stroke-width="1.3" stroke-dasharray="4,3"/>
<text x="34" y="76" fill="#3a4560" font-size="10" font-weight="bold" text-anchor="end" font-family="monospace">6 V</text>
<polyline points="${wave(42, 0, 72, 40, 280)}" fill="none" stroke="#0284c7" stroke-width="2.2"/>
<line x1="44" y1="72" x2="44" y2="30" stroke="#b45309" stroke-width="1.3"/>
<text x="50" y="40" fill="#b45309" font-size="10.5" font-weight="bold" font-family="sans-serif">8√2 V</text>
<text x="316" y="14" fill="#1f2a44" font-size="11" font-weight="bold" text-anchor="end" font-family="sans-serif" dominant-baseline="hanging">v(t) = 6 + 8√2 cos(1000t) V</text>
<text x="316" y="124" fill="#b45309" font-size="11" font-weight="bold" text-anchor="end" font-family="sans-serif">V<tspan dy="3" font-size="78%">rms</tspan><tspan dy="-3"> = ?</tspan></text>
</svg>`;

/** Q4: a Thévenin source given as an RMS phasor, load to be chosen */
export const SVG_Q4 = R`<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="戴维南等效 12∠0° V（RMS 相量）、内阻抗 3 − j4 Ω，端口接可调负载" style="max-width:380px">
<rect x="0" y="0" width="320" height="120" rx="8" fill="#fbf7ef" stroke="#e3d8c2"/>
<path d="M 40 44 V 28 H 90 M 160 28 H 252 V 46 M 252 82 V 98 H 40 V 80" fill="none" stroke="#334155" stroke-width="2"/>
<circle cx="40" cy="62" r="18" fill="#fff" stroke="#0284c7" stroke-width="2.2"/>
<path d="M 30 62 q 5 -9 10 0 t 10 0" fill="none" stroke="#0284c7" stroke-width="2"/>
<text x="8" y="114" fill="#0369a1" font-size="10.5" font-weight="bold" text-anchor="start" font-family="sans-serif">12∠0° V（RMS）</text>
<rect x="90" y="17" width="70" height="22" rx="4" fill="#fff" stroke="#db2777" stroke-width="2"/>
<text x="125" y="32" fill="#be185d" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">3 − j4 Ω</text>
<text x="125" y="54" fill="#5f626b" font-size="10" text-anchor="middle" font-family="sans-serif">Z<tspan dy="3" font-size="78%">Th</tspan></text>
<circle cx="200" cy="28" r="3.5" fill="#ca8a04"/>
<circle cx="200" cy="98" r="3.5" fill="#ca8a04"/>
<text x="200" y="20" fill="#a16207" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">a</text>
<text x="200" y="114" fill="#a16207" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">b</text>
<rect x="230" y="46" width="44" height="36" rx="4" fill="#fff" stroke="#d97706" stroke-width="2" stroke-dasharray="4,3"/>
<text x="252" y="68" fill="#b45309" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">Z<tspan dy="3" font-size="78%">L</tspan><tspan dy="-3"> = ?</tspan></text>
</svg>`;
