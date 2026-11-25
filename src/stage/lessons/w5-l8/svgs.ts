// Diagrams drawn for this lesson (light theme, the style of the sheet's figures): the guided
// example's problem figure and its step-5 diagram (the sheet's printed "50 V" and "需 ≥ 100 V", the
// step's answers), and the four self-test figures (none gives its answer away).

const F = `font-family="system-ui, sans-serif"`;

/** a series loop: source on the left, R and L on top, C on the right */
const seriesLoop = (x: number, y: number, w: number, h: number, labels: { r: string; l: string; c: string; s: string }) => `
<g fill="none" stroke="#1e293b" stroke-width="2">
<path d="M ${x} ${y} L ${x + 30} ${y} M ${x + 80} ${y} L ${x + 104} ${y} M ${x + 164} ${y} L ${x + w} ${y} L ${x + w} ${y + h / 2 - 7} M ${x + w} ${y + h / 2 + 7} L ${x + w} ${y + h} L ${x} ${y + h} L ${x} ${y + h / 2 + 20} M ${x} ${y + h / 2 - 20} L ${x} ${y}"/>
</g>
<polyline points="${x + 30},${y} ${x + 35},${y - 8} ${x + 43},${y + 8} ${x + 51},${y - 8} ${x + 59},${y + 8} ${x + 67},${y - 8} ${x + 75},${y + 8} ${x + 80},${y}" fill="none" stroke="#0f172a" stroke-width="2"/>
<path d="M ${x + 104} ${y} Q ${x + 111.5} ${y - 16} ${x + 119} ${y} Q ${x + 126.5} ${y - 16} ${x + 134} ${y} Q ${x + 141.5} ${y - 16} ${x + 149} ${y} Q ${x + 156.5} ${y - 16} ${x + 164} ${y}" fill="none" stroke="#ea580c" stroke-width="2.2"/>
<line x1="${x + w - 16}" y1="${y + h / 2 - 7}" x2="${x + w + 16}" y2="${y + h / 2 - 7}" stroke="#0284c7" stroke-width="3"/>
<line x1="${x + w - 16}" y1="${y + h / 2 + 7}" x2="${x + w + 16}" y2="${y + h / 2 + 7}" stroke="#0284c7" stroke-width="3"/>
<circle cx="${x}" cy="${y + h / 2}" r="20" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
<path d="M ${x - 11} ${y + h / 2} Q ${x - 5.5} ${y + h / 2 - 11} ${x} ${y + h / 2} T ${x + 11} ${y + h / 2}" fill="none" stroke="#2563eb" stroke-width="2"/>
<text x="${x + 40}" y="${y - 14}" ${F} font-size="12" font-weight="700" fill="#0f172a">${labels.r}</text>
<text x="${x + 112}" y="${y - 20}" ${F} font-size="12" font-weight="700" fill="#c2410c">${labels.l}</text>
<text x="${x + w - 22}" y="${y + h / 2 + 4}" text-anchor="end" ${F} font-size="12" font-weight="700" fill="#0369a1">${labels.c}</text>
<text x="${x - 20}" y="${y + h + 18}" ${F} font-size="12" font-weight="700" fill="#1d4ed8">${labels.s}</text>`;

export const SVG_PROBLEM = `<svg viewBox="0 0 480 190" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="串联 RLC 音频选频回路：R = 10 Ω，L = 2 mH，C = 0.2 μF，vs = 5 cos(ωt) V">
<rect x="0" y="0" width="480" height="190" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
<text x="18" y="26" ${F} font-size="14" font-weight="700" fill="#0f172a">串联 RLC 音频选频回路（引导例题）</text>
${seriesLoop(60, 66, 210, 96, { r: 'R = 10 Ω', l: 'L = 2 mH', c: 'C = 0.2 μF', s: 'vs = 5 cos(ωt) V' })}
<rect x="330" y="58" width="134" height="110" rx="8" fill="#fef2f2" stroke="#f87171" stroke-width="1.3"/>
<text x="342" y="80" ${F} font-size="12" font-weight="700" fill="#b91c1c">待求</text>
<text x="342" y="100" ${F} font-size="11.5" fill="#7f1d1d">① ω0、f0　② Q</text>
<text x="342" y="118" ${F} font-size="11.5" fill="#7f1d1d">③ B、Bf　④ ω1、ω2</text>
<text x="342" y="136" ${F} font-size="11.5" fill="#7f1d1d">⑤ |VC(ω0)| = ?</text>
<text x="342" y="156" ${F} font-size="11" font-weight="700" fill="#991b1b">手头电容耐压 25 V</text>
</svg>`;

export const MINI_STEP5 = `<svg viewBox="0 0 260 90" xmlns="http://www.w3.org/2000/svg"><rect width="260" height="90" rx="8" fill="#fef2f2" stroke="#f87171"/><text x="14" y="28" ${F} font-size="12" font-weight="700" fill="#b91c1c">高 Q 过压核验：|VC(ω0)| = Q · Vm</text><text x="14" y="52" ${F} font-size="12" fill="#7f1d1d">输入 Vm = 5 V，Q = 10（第 2 步）⇒ ?</text><text x="14" y="74" ${F} font-size="11" font-weight="700" fill="#991b1b">手头只有 25 V 电容：能直接焊上去吗？</text></svg>`;

export const SVG_Q1 = `<svg viewBox="0 0 360 140" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="串联 RLC 在 ω = ω0 处谐振">
<rect x="0" y="0" width="360" height="140" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
${seriesLoop(40, 40, 200, 78, { r: 'R', l: 'L', c: 'C', s: 'Vs，ω = ω0' })}
<text x="292" y="58" ${F} font-size="13" font-weight="700" fill="#dc2626">Z(ω0) = ?</text>
<text x="292" y="80" ${F} font-size="13" font-weight="700" fill="#dc2626">I = ?</text>
</svg>`;

export const SVG_Q2 = `<svg viewBox="0 0 360 140" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Q = 15 的串联 RLC，示波器测电容两端">
<rect x="0" y="0" width="360" height="140" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
${seriesLoop(40, 40, 200, 78, { r: 'R', l: 'L', c: 'C', s: 'vs = 4 cos(ω0 t) V' })}
<line x1="240" y1="79" x2="276" y2="79" stroke="#0284c7" stroke-width="1.6" stroke-dasharray="4 2"/>
<rect x="276" y="56" width="74" height="46" rx="6" fill="#0f172a"/>
<text x="284" y="74" font-family="monospace" font-size="11" fill="#38bdf8">CH2: VC</text>
<text x="284" y="92" font-family="monospace" font-size="11" fill="#38bdf8">峰值 = ?</text>
<text x="276" y="124" ${F} font-size="12" font-weight="700" fill="#6d28d9">Q = 15</text>
</svg>`;

export const SVG_Q3 = `<svg viewBox="0 0 360 140" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="并联 RLC 调谐回路，R 增大为 2 倍">
<rect x="0" y="0" width="360" height="140" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<g fill="none" stroke="#1e293b" stroke-width="2"><path d="M 40 50 L 40 34 L 240 34 L 240 64 M 240 76 L 240 116 L 40 116 L 40 90 M 110 34 L 110 48 M 110 102 L 110 116 M 175 34 L 175 50 M 175 100 L 175 116"/></g>
<circle cx="40" cy="70" r="18" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
<line x1="40" y1="80" x2="40" y2="60" stroke="#2563eb" stroke-width="2"/><path d="M 35 63 L 40 56 L 45 63 z" fill="#2563eb"/>
<polyline points="110,48 102,53 118,61 102,69 118,77 102,85 118,93 110,102" fill="none" stroke="#0f172a" stroke-width="2"/>
<path d="M 175 50 Q 191 56.25 175 62.5 Q 191 68.75 175 75 Q 191 81.25 175 87.5 Q 191 93.75 175 100" fill="none" stroke="#ea580c" stroke-width="2.2"/>
<line x1="224" y1="64" x2="256" y2="64" stroke="#0284c7" stroke-width="3"/><line x1="224" y1="76" x2="256" y2="76" stroke="#0284c7" stroke-width="3"/>
<text x="122" y="80" ${F} font-size="12" font-weight="700" fill="#0f172a">R → 2R</text>
<text x="194" y="80" ${F} font-size="12" font-weight="700" fill="#c2410c">L</text>
<text x="262" y="74" ${F} font-size="12" font-weight="700" fill="#0369a1">C</text>
<text x="284" y="56" ${F} font-size="13" font-weight="700" fill="#dc2626">Q ?</text>
<text x="284" y="80" ${F} font-size="13" font-weight="700" fill="#dc2626">B ?</text>
<text x="14" y="134" ${F} font-size="11" fill="#475569">L、C 不变，只改并联电阻</text>
</svg>`;

export const SVG_Q4 = `<svg viewBox="0 0 360 150" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="面包板串联 RLC 扫频实测与理论对比">
<rect x="0" y="0" width="360" height="150" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
<rect x="14" y="24" width="78" height="54" rx="6" fill="#1e293b"/>
<text x="22" y="42" ${F} font-size="10" font-weight="700" fill="#f8fafc">函数信号发生器</text>
<text x="22" y="60" font-family="monospace" font-size="10" fill="#4ade80">SINE 1 Vpp</text>
<line x1="92" y1="52" x2="112" y2="52" stroke="#ef4444" stroke-width="2"/>
<rect x="112" y="42" width="50" height="20" rx="4" fill="#fde68a" stroke="#b45309"/><text x="118" y="56" ${F} font-size="10" font-weight="700" fill="#78350f">100 Ω</text>
<line x1="162" y1="52" x2="172" y2="52" stroke="#1e293b" stroke-width="2"/>
<rect x="172" y="40" width="54" height="24" rx="6" fill="#fed7aa" stroke="#ea580c"/><text x="180" y="56" ${F} font-size="10" font-weight="700" fill="#9a3412">10 mH</text>
<line x1="226" y1="52" x2="240" y2="52" stroke="#1e293b" stroke-width="2"/>
<rect x="240" y="40" width="54" height="24" rx="5" fill="#bae6fd" stroke="#0284c7"/><text x="246" y="56" ${F} font-size="10" font-weight="700" fill="#0369a1">100 nF</text>
<line x1="294" y1="52" x2="306" y2="52" stroke="#1e293b" stroke-width="2"/><line x1="306" y1="52" x2="306" y2="82" stroke="#1e293b" stroke-width="2"/>
<line x1="20" y1="82" x2="306" y2="82" stroke="#2563eb" stroke-width="2.5"/><text x="20" y="96" ${F} font-size="10" font-weight="700" fill="#1d4ed8">GND</text>
<rect x="14" y="104" width="160" height="38" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
<text x="22" y="120" ${F} font-size="11" fill="#334155">理论：Q ≈ 3.16</text>
<text x="22" y="135" ${F} font-size="11" fill="#334155">VC 峰 ≈ 3.16 Vpp</text>
<rect x="186" y="104" width="160" height="38" rx="6" fill="#fef2f2" stroke="#f87171"/>
<text x="194" y="120" ${F} font-size="11" font-weight="700" fill="#b91c1c">实测：VC 峰 ≈ 1.9 Vpp</text>
<text x="194" y="135" ${F} font-size="11" font-weight="700" fill="#b91c1c">带宽更宽 —— 为什么？</text>
</svg>`;
