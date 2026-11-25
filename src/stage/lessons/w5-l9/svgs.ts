// W5-L9 figures drawn for the light theme: the guided design's five step diagrams (the sheet's,
// redrawn with "?" where they printed the step's own answer) and the quiz figures (none shows its
// answer).

const R = String.raw;

const FONT = `font-family="ui-sans-serif, system-ui, sans-serif"`;
const INK = '#1f2a44';
const MUTED = '#5f626b';

const zig = (x1: number, x2: number, y: number, n = 6, a = 9) => {
  const pts = [`${x1},${y}`];
  for (let i = 0; i < n; i++) pts.push(`${(x1 + ((i + 0.5) * (x2 - x1)) / n).toFixed(1)},${y + (i % 2 ? a : -a)}`);
  pts.push(`${x2},${y}`);
  return pts.join(' ');
};

/** two periods of a sine from x1 to x2 around y (amplitude a, phase lag `lag` of a period) */
const sine = (x1: number, x2: number, y: number, a: number, lag: number) =>
  Array.from({ length: 49 }, (_, k) => {
    const u = k / 48;
    return `${(x1 + u * (x2 - x1)).toFixed(1)},${(y - a * Math.sin(2 * Math.PI * (2 * u - lag))).toFixed(1)}`;
  }).join(' ');

/* ------------------------------------------------------------- guided step diagrams */

/** step 1: the input resistor into the virtual ground */
export const MINI_STEP1 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90" width="260" height="90" role="img" aria-label="输入电阻 Ri 接到运放虚地 IN−，阻值待选">
<rect x="1" y="1" width="258" height="88" rx="8" fill="#f0f9ff" stroke="#bae6fd"/>
<line x1="20" y1="45" x2="65" y2="45" stroke="${INK}" stroke-width="2"/>
<polyline points="${zig(65, 139, 45)}" fill="none" stroke="#0369a1" stroke-width="2.2"/>
<line x1="139" y1="45" x2="200" y2="45" stroke="${INK}" stroke-width="2"/>
<circle cx="200" cy="45" r="4.5" fill="#d97706"/>
<text x="102" y="24" text-anchor="middle" ${FONT} font-size="12.5" font-weight="700" fill="#0369a1">Ri = ?</text>
<text x="200" y="70" text-anchor="middle" ${FONT} font-size="10.5" fill="#92400e">接运放虚地 IN−</text>
<text x="20" y="78" ${FONT} font-size="10" fill="${MUTED}">输入阻抗 = Ri</text>
</svg>`;

/** step 2: the feedback resistor, rounded to E24 */
export const MINI_STEP2 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90" width="260" height="90" role="img" aria-label="反馈电阻 Rf 取 E24 标称值，阻值待选">
<rect x="1" y="1" width="258" height="88" rx="8" fill="#ecfdf5" stroke="#a7f3d0"/>
<line x1="30" y1="45" x2="75" y2="45" stroke="${INK}" stroke-width="2"/>
<polyline points="${zig(75, 149, 45)}" fill="none" stroke="#047857" stroke-width="2.2"/>
<line x1="149" y1="45" x2="230" y2="45" stroke="${INK}" stroke-width="2"/>
<text x="112" y="24" text-anchor="middle" ${FONT} font-size="12.5" font-weight="700" fill="#047857">Rf = ?（E24：47 / 51 / 56 kΩ）</text>
<text x="130" y="76" text-anchor="middle" ${FONT} font-size="11" fill="#065f46">K_DC = −Rf / Ri = ?</text>
</svg>`;

/** step 3: the feedback capacitor across R_f */
export const MINI_STEP3 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90" width="260" height="90" role="img" aria-label="反馈电容 Cf 并联在 Rf 两端，容值待求">
<rect x="1" y="1" width="258" height="88" rx="8" fill="#fffbeb" stroke="#fde68a"/>
<line x1="35" y1="45" x2="120" y2="45" stroke="${INK}" stroke-width="2"/>
<line x1="120" y1="25" x2="120" y2="65" stroke="#b45309" stroke-width="3"/>
<line x1="134" y1="25" x2="134" y2="65" stroke="#b45309" stroke-width="3"/>
<line x1="134" y1="45" x2="225" y2="45" stroke="${INK}" stroke-width="2"/>
<text x="127" y="17" text-anchor="middle" ${FONT} font-size="12.5" font-weight="700" fill="#b45309">Cf = ?（E12）</text>
<text x="127" y="82" text-anchor="middle" ${FONT} font-size="10.5" fill="#92400e">并联在 Rf 两端：fc = 1 / (2π Rf Cf)</text>
</svg>`;

/** step 4: the real corner and the 10 kHz gain */
export const MINI_STEP4 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90" width="260" height="90" role="img" aria-label="标准件回代：实际截止频率与 10 kHz 处的增益待求">
<rect x="1" y="1" width="258" height="88" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
<line x1="25" y1="72" x2="240" y2="72" stroke="#64748b" stroke-width="1.2"/>
<path d="M 25,24 L 115,24 L 235,66" fill="none" stroke="#047857" stroke-width="2.4"/>
<circle cx="115" cy="31" r="4" fill="#d97706"/>
<text x="115" y="16" text-anchor="middle" ${FONT} font-size="10.5" font-weight="700" fill="#b45309">fc,actual = ? Hz（−3 dB）</text>
<text x="196" y="44" text-anchor="middle" ${FONT} font-size="10.5" fill="#065f46">10 kHz：? dB</text>
<text x="30" y="85" ${FONT} font-size="9.5" fill="${MUTED}">−20 dB/dec 滚降区</text>
</svg>`;

/** step 5: the output against the LM358's rails on ±9 V */
export const MINI_STEP5 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90" width="260" height="90" role="img" aria-label="LM358 在 ±9 V 下的输出摆幅红线与输出峰值，峰值待求">
<rect x="1" y="1" width="258" height="88" rx="8" fill="#fff1f2" stroke="#fecdd3"/>
<line x1="20" y1="14" x2="240" y2="14" stroke="#b91c1c" stroke-width="1.3" stroke-dasharray="4,3"/>
<line x1="20" y1="78" x2="240" y2="78" stroke="#1d4ed8" stroke-width="1.3" stroke-dasharray="4,3"/>
<path d="M 20,45 Q 50,22 80,45 T 140,45 T 200,45 T 240,45" fill="none" stroke="#047857" stroke-width="2.4"/>
<text x="236" y="11" text-anchor="end" ${FONT} font-size="9.5" fill="#b91c1c">+7.5 V 饱和红线</text>
<text x="236" y="88" text-anchor="end" ${FONT} font-size="9.5" fill="#1d4ed8">−8.9 V</text>
<text x="130" y="40" text-anchor="middle" ${FONT} font-size="10.5" font-weight="700" fill="#047857">Vout,peak = ?</text>
</svg>`;

/* ------------------------------------------------------------- quiz figures */

/** Q1: the active low-pass with R_i halved */
export const SVG_Q1 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" width="320" height="130" role="img" aria-label="一阶反相有源低通：Ri 由 10 kΩ 换成 5 kΩ，Rf 22 kΩ 与 Cf 10 nF 不变">
<rect x="1" y="1" width="318" height="128" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<line x1="20" y1="82" x2="40" y2="82" stroke="${INK}" stroke-width="2"/>
<polyline points="${zig(40, 100, 82, 6, 7)}" fill="none" stroke="#be185d" stroke-width="2.2"/>
<text x="70" y="104" text-anchor="middle" ${FONT} font-size="11.5" font-weight="700" fill="#be185d">Ri 10 → 5 kΩ</text>
<line x1="100" y1="82" x2="150" y2="82" stroke="${INK}" stroke-width="2"/>
<circle cx="124" cy="82" r="3.6" fill="#d97706"/>
<line x1="124" y1="82" x2="124" y2="26" stroke="${INK}" stroke-width="1.8"/>
<line x1="124" y1="50" x2="150" y2="50" stroke="${INK}" stroke-width="1.8"/>
<polyline points="${zig(150, 200, 50, 6, 6)}" fill="none" stroke="#047857" stroke-width="2"/>
<line x1="200" y1="50" x2="232" y2="50" stroke="${INK}" stroke-width="1.8"/>
<text x="175" y="68" text-anchor="middle" ${FONT} font-size="10.5" fill="#047857">Rf 22 kΩ</text>
<line x1="124" y1="26" x2="170" y2="26" stroke="${INK}" stroke-width="1.8"/>
<line x1="170" y1="17" x2="170" y2="35" stroke="#b45309" stroke-width="2.4"/>
<line x1="178" y1="17" x2="178" y2="35" stroke="#b45309" stroke-width="2.4"/>
<line x1="178" y1="26" x2="232" y2="26" stroke="${INK}" stroke-width="1.8"/>
<text x="200" y="18" ${FONT} font-size="10.5" fill="#b45309">Cf 10 nF</text>
<line x1="232" y1="26" x2="232" y2="94" stroke="${INK}" stroke-width="1.8"/>
<polygon points="150,70 150,118 206,94" fill="#f0fdf4" stroke="#047857" stroke-width="2"/>
<text x="156" y="86" ${FONT} font-size="12" font-weight="800" fill="${INK}">−</text>
<line x1="206" y1="94" x2="300" y2="94" stroke="${INK}" stroke-width="2"/>
<text x="262" y="86" ${FONT} font-size="11.5" font-weight="700" fill="#047857">Vo</text>
<text x="262" y="118" ${FONT} font-size="11" fill="${MUTED}">K、fc = ?</text>
</svg>`;

/** Q2: the passive RC low-pass with a 10 kΩ load plugged on */
export const SVG_Q2 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" width="320" height="130" role="img" aria-label="无源 RC 低通（R 22 kΩ，C 10 nF）输出端并联 RL 10 kΩ">
<rect x="1" y="1" width="318" height="128" rx="10" fill="#fff1f2" stroke="#fecdd3"/>
<circle cx="26" cy="38" r="4" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
<circle cx="26" cy="108" r="4" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
<text x="14" y="78" ${FONT} font-size="11.5" font-weight="700" fill="#b45309">Vi</text>
<line x1="30" y1="38" x2="60" y2="38" stroke="${INK}" stroke-width="2"/>
<polyline points="${zig(60, 120, 38, 6, 7)}" fill="none" stroke="#be185d" stroke-width="2.2"/>
<text x="90" y="24" text-anchor="middle" ${FONT} font-size="11" font-weight="700" fill="#be185d">R 22 kΩ</text>
<line x1="120" y1="38" x2="290" y2="38" stroke="${INK}" stroke-width="2"/>
<line x1="30" y1="108" x2="290" y2="108" stroke="${INK}" stroke-width="2"/>
<line x1="160" y1="38" x2="160" y2="68" stroke="${INK}" stroke-width="2"/>
<line x1="146" y1="68" x2="174" y2="68" stroke="#047857" stroke-width="2.6"/>
<line x1="146" y1="77" x2="174" y2="77" stroke="#047857" stroke-width="2.6"/>
<line x1="160" y1="77" x2="160" y2="108" stroke="${INK}" stroke-width="2"/>
<text x="180" y="76" ${FONT} font-size="11" fill="#047857">C 10 nF</text>
<line x1="245" y1="38" x2="245" y2="52" stroke="#b91c1c" stroke-width="2"/>
<polyline points="245,52 237,57 253,64 237,71 253,78 237,85 245,90" fill="none" stroke="#b91c1c" stroke-width="2.2"/>
<line x1="245" y1="90" x2="245" y2="108" stroke="#b91c1c" stroke-width="2"/>
<text x="258" y="76" ${FONT} font-size="11" font-weight="700" fill="#b91c1c">RL 10 kΩ</text>
<text x="160" y="124" text-anchor="middle" ${FONT} font-size="10.5" fill="${MUTED}">空载 fc = 723.4 Hz；接上 RL 之后呢？</text>
</svg>`;

/** Q3: two ways to a 0.5 – 40 Hz band pass */
export const SVG_Q3 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" width="320" height="130" role="img" aria-label="0.5 Hz 到 40 Hz 的低频带通：有源 RC 级联与无源 RLC 两种做法">
<rect x="1" y="1" width="318" height="128" rx="10" fill="#f5f3ff" stroke="#ddd6fe"/>
<text x="160" y="20" text-anchor="middle" ${FONT} font-size="12" font-weight="700" fill="#5b21b6">ECG 前端带通 0.5 Hz – 40 Hz：两条路线</text>
<rect x="14" y="32" width="138" height="84" rx="8" fill="#fff" stroke="#a78bfa"/>
<text x="83" y="52" text-anchor="middle" ${FONT} font-size="11.5" font-weight="700" fill="#6d28d9">A 路线：有源 RC 级联</text>
<rect x="24" y="62" width="52" height="26" rx="5" fill="#ecfdf5" stroke="#047857"/>
<text x="50" y="79" text-anchor="middle" ${FONT} font-size="10.5" fill="#047857">HPF</text>
<line x1="76" y1="75" x2="90" y2="75" stroke="${INK}" stroke-width="1.6"/>
<rect x="90" y="62" width="52" height="26" rx="5" fill="#f0f9ff" stroke="#0369a1"/>
<text x="116" y="79" text-anchor="middle" ${FONT} font-size="10.5" fill="#0369a1">LPF</text>
<text x="83" y="106" text-anchor="middle" ${FONT} font-size="10" fill="${MUTED}">R、C、LM358</text>
<rect x="168" y="32" width="138" height="84" rx="8" fill="#fff" stroke="#a78bfa"/>
<text x="237" y="52" text-anchor="middle" ${FONT} font-size="11.5" font-weight="700" fill="#6d28d9">B 路线：无源 RLC</text>
<path d="M 190 75 q 8 -14 16 0 q 8 -14 16 0 q 8 -14 16 0 q 8 -14 16 0" fill="none" stroke="#b45309" stroke-width="2.4"/>
<text x="279" y="80" ${FONT} font-size="11" font-weight="700" fill="#b45309">L = ?</text>
<text x="237" y="106" text-anchor="middle" ${FONT} font-size="10" fill="${MUTED}">低频谐振要多大的电感？</text>
</svg>`;

/** Q4: the scope at the corner frequency, CH2 unknown */
export const SVG_Q4 = R`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" width="320" height="130" role="img" aria-label="示波器：CH1 输入 1.0 Vpp、723.4 Hz，CH2 输出峰峰值待读">
<rect x="1" y="1" width="318" height="128" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<rect x="14" y="14" width="200" height="102" rx="6" fill="#fbfdff" stroke="#94a3b8"/>
<line x1="14" y1="65" x2="214" y2="65" stroke="#cbd5e1" stroke-width="1"/>
<line x1="114" y1="14" x2="114" y2="116" stroke="#cbd5e1" stroke-width="1"/>
<path d="M 14 65 C 30 45, 47 45, 64 65 S 98 85, 114 65 S 147 45, 164 65 S 198 85, 214 65" fill="none" stroke="#b45309" stroke-width="2"/>
<polyline points="${sine(14, 214, 65, 20, 0.25)}" fill="none" stroke="#047857" stroke-width="2.4" stroke-dasharray="6 3"/>
<text x="226" y="34" ${FONT} font-size="11.5" font-weight="700" fill="#b45309">CH1 1.0 Vpp</text>
<text x="226" y="52" ${FONT} font-size="10.5" fill="${MUTED}">f = 723.4 Hz</text>
<text x="226" y="80" ${FONT} font-size="11.5" font-weight="700" fill="#047857">CH2 ? Vpp</text>
<text x="226" y="98" ${FONT} font-size="10.5" fill="${MUTED}">LM358 ±9 V</text>
</svg>`;
