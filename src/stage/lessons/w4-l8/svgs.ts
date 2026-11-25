// W4-L8 figures. The sheet's six inline SVGs (drawn for a dark canvas) go through lightSvg; their
// geometry, curves and words are the sheet's, only ASCII stand-ins are typeset (Ohm → Ω, uF → µF,
// alpha → α, zeta → ζ, omega_0 → ω₀, t->inf → t→∞, V_s → Vₛ style subscripts are left alone).
// The guided example's step diagrams are redrawn so they ask instead of printing each step's
// answer (the sheet's printed i_L(0+) = 0, α = 5, D_1 = −6 … before the question); the problem
// figure is the sheet's 3.2. The act-3 / act-5 extra figures and the quiz figures are new, drawn
// for the light theme (no lightSvg).

import { lightSvg } from '../../svgTheme';

const FONT = `font-family:'Segoe UI',system-ui,sans-serif`;

/* ------------------------------------------------------------- sheet 1.3: series vs parallel (dark → light) */

export const SVG_DUAL = lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 280" width="760" height="280" style="background:#0f172a;border-radius:10px;${FONT};">
  <text x="380" y="26" fill="#f8fafc" font-size="15" font-weight="700" text-anchor="middle">串联 RLC 阶跃响应 (Section 8.5)  vs  并联 RLC 阶跃响应 (Section 8.6) 对偶拓扑</text>
  <line x1="380" y1="42" x2="380" y2="262" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,4"/>
  <rect x="16" y="44" width="348" height="218" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>
  <text x="190" y="66" fill="#38bdf8" font-size="13" font-weight="700" text-anchor="middle">串联 RLC 阶跃电路：v_C(t) = V_s + v_t(t)</text>
  <circle cx="66" cy="158" r="22" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="66" y="150" fill="#f59e0b" font-size="13" font-weight="700" text-anchor="middle">+</text>
  <text x="66" y="171" fill="#f59e0b" font-size="13" font-weight="700" text-anchor="middle">-</text>
  <text x="66" y="196" fill="#fbbf24" font-size="11" font-weight="600" text-anchor="middle">V_s u(t)</text>
  <line x1="66" y1="136" x2="66" y2="100" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="66" y1="100" x2="96" y2="100" stroke="#cbd5e1" stroke-width="2"/>
  <circle cx="96" cy="100" r="3" fill="#38bdf8"/>
  <line x1="96" y1="100" x2="122" y2="86" stroke="#38bdf8" stroke-width="2.2"/>
  <circle cx="126" cy="100" r="3" fill="#38bdf8"/>
  <text x="111" y="81" fill="#7dd3fc" font-size="10" text-anchor="middle">t=0 闭合</text>
  <line x1="126" y1="100" x2="142" y2="100" stroke="#cbd5e1" stroke-width="2"/>
  <polyline points="142,100 147,92 155,108 163,92 171,108 179,92 187,108 192,100" fill="none" stroke="#f472b6" stroke-width="2.2"/>
  <text x="167" y="86" fill="#f472b6" font-size="12" font-weight="700" text-anchor="middle">R</text>
  <line x1="192" y1="100" x2="212" y2="100" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M 212 100 Q 218 84 224 100 Q 230 84 236 100 Q 242 84 248 100 Q 254 84 260 100" fill="none" stroke="#a78bfa" stroke-width="2.2"/>
  <text x="236" y="84" fill="#a78bfa" font-size="12" font-weight="700" text-anchor="middle">L</text>
  <line x1="260" y1="100" x2="306" y2="100" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="306" y1="100" x2="306" y2="148" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="290" y1="148" x2="322" y2="148" stroke="#34d399" stroke-width="3"/>
  <line x1="290" y1="160" x2="322" y2="160" stroke="#34d399" stroke-width="3"/>
  <line x1="306" y1="160" x2="306" y2="216" stroke="#cbd5e1" stroke-width="2"/>
  <text x="334" y="142" fill="#34d399" font-size="11" font-weight="700">+</text>
  <text x="326" y="158" fill="#34d399" font-size="12" font-weight="700">v_C(t)</text>
  <text x="334" y="174" fill="#34d399" font-size="11" font-weight="700">-</text>
  <line x1="66" y1="180" x2="66" y2="216" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="66" y1="216" x2="306" y2="216" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="266" y1="112" x2="294" y2="112" stroke="#38bdf8" stroke-width="1.8"/>
  <polygon points="294,112 287,108 287,116" fill="#38bdf8"/>
  <text x="280" y="127" fill="#38bdf8" font-size="11" text-anchor="middle">i(t)</text>
  <text x="190" y="246" fill="#94a3b8" font-size="11" text-anchor="middle">稳态 t→∞：C 开路 → i(∞)=0, v_C(∞)=V_s</text>
  <rect x="396" y="44" width="348" height="218" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.2"/>
  <text x="570" y="66" fill="#34d399" font-size="13" font-weight="700" text-anchor="middle">并联 RLC 阶跃电路：i_L(t) = I_s + i_t(t)</text>
  <line x1="446" y1="100" x2="700" y2="100" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="446" y1="216" x2="700" y2="216" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="446" y1="100" x2="446" y2="136" stroke="#cbd5e1" stroke-width="2"/>
  <circle cx="446" cy="158" r="22" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <line x1="446" y1="170" x2="446" y2="146" stroke="#f59e0b" stroke-width="2.2"/>
  <polygon points="446,144 441,152 451,152" fill="#f59e0b"/>
  <line x1="446" y1="180" x2="446" y2="216" stroke="#cbd5e1" stroke-width="2"/>
  <text x="446" y="196" fill="#fbbf24" font-size="11" font-weight="600" text-anchor="middle">I_s u(t)</text>
  <line x1="530" y1="100" x2="530" y2="128" stroke="#cbd5e1" stroke-width="2"/>
  <polyline points="530,128 522,133 538,141 522,149 538,157 522,165 538,173 530,178" fill="none" stroke="#f472b6" stroke-width="2.2"/>
  <line x1="530" y1="178" x2="530" y2="216" stroke="#cbd5e1" stroke-width="2"/>
  <text x="512" y="158" fill="#f472b6" font-size="12" font-weight="700" text-anchor="end">R</text>
  <line x1="615" y1="100" x2="615" y2="128" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M 615 128 Q 630 134 615 140 Q 630 146 615 152 Q 630 158 615 164 Q 630 170 615 176" fill="none" stroke="#a78bfa" stroke-width="2.2"/>
  <line x1="615" y1="176" x2="615" y2="216" stroke="#cbd5e1" stroke-width="2"/>
  <text x="598" y="158" fill="#a78bfa" font-size="12" font-weight="700" text-anchor="end">L</text>
  <line x1="632" y1="112" x2="632" y2="132" stroke="#38bdf8" stroke-width="1.8"/>
  <polygon points="632,134 628,127 636,127" fill="#38bdf8"/>
  <text x="640" y="124" fill="#38bdf8" font-size="10">i_L(t)</text>
  <line x1="700" y1="100" x2="700" y2="148" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="686" y1="148" x2="714" y2="148" stroke="#34d399" stroke-width="3"/>
  <line x1="686" y1="160" x2="714" y2="160" stroke="#34d399" stroke-width="3"/>
  <line x1="700" y1="160" x2="700" y2="216" stroke="#cbd5e1" stroke-width="2"/>
  <text x="722" y="158" fill="#34d399" font-size="12" font-weight="700">C</text>
  <text x="570" y="92" fill="#e2e8f0" font-size="11" text-anchor="middle">+   v(t)   -</text>
  <text x="570" y="246" fill="#94a3b8" font-size="11" text-anchor="middle">稳态 t→∞：L 短路 → v(∞)=0, i_L(∞)=I_s</text>
</svg>`);

/* ------------------------------------------------------------- sheet 2.3: the three damping curves (dark → light) */

/** the sheet's sampled curves (81 points each; x 70 + 240 px/ms, y 270 − 27.5 px/V) — model.test checks them */
export const SHEET_CURVES = {
  over: '70.0,270.0 76.0,266.5 82.0,258.4 88.0,248.3 94.0,237.5 100.0,226.9 106.0,216.8 112.0,207.5 118.0,199.1 124.0,191.5 130.0,184.7 136.0,178.7 142.0,173.3 148.0,168.5 154.0,164.3 160.0,160.6 166.0,157.3 172.0,154.4 178.0,151.8 184.0,149.5 190.0,147.5 196.0,145.8 202.0,144.2 208.0,142.8 214.0,141.6 220.0,140.6 226.0,139.6 232.0,138.8 238.0,138.0 244.0,137.4 250.0,136.8 256.0,136.3 262.0,135.9 268.0,135.5 274.0,135.1 280.0,134.8 286.0,134.5 292.0,134.3 298.0,134.1 304.0,133.9 310.0,133.7 316.0,133.6 322.0,133.5 328.0,133.3 334.0,133.2 340.0,133.2 346.0,133.1 352.0,133.0 358.0,133.0 364.0,132.9 370.0,132.9 376.0,132.8 382.0,132.8 388.0,132.7 394.0,132.7 400.0,132.7 406.0,132.7 412.0,132.6 418.0,132.6 424.0,132.6 430.0,132.6 436.0,132.6 442.0,132.6 448.0,132.6 454.0,132.6 460.0,132.6 466.0,132.5 472.0,132.5 478.0,132.5 484.0,132.5 490.0,132.5 496.0,132.5 502.0,132.5 508.0,132.5 514.0,132.5 520.0,132.5 526.0,132.5 532.0,132.5 538.0,132.5 544.0,132.5 550.0,132.5',
  critical:
    '70.0,270.0 76.0,266.4 82.0,257.6 88.0,246.2 94.0,233.7 100.0,221.1 106.0,209.2 112.0,198.2 118.0,188.3 124.0,179.6 130.0,172.0 136.0,165.5 142.0,159.9 148.0,155.2 154.0,151.2 160.0,147.9 166.0,145.1 172.0,142.8 178.0,140.9 184.0,139.3 190.0,138.1 196.0,137.0 202.0,136.2 208.0,135.5 214.0,134.9 220.0,134.4 226.0,134.1 232.0,133.7 238.0,133.5 244.0,133.3 250.0,133.1 256.0,133.0 262.0,132.9 268.0,132.8 274.0,132.8 280.0,132.7 286.0,132.7 292.0,132.6 298.0,132.6 304.0,132.6 310.0,132.6 316.0,132.6 322.0,132.5 328.0,132.5 334.0,132.5 340.0,132.5 346.0,132.5 352.0,132.5 358.0,132.5 364.0,132.5 370.0,132.5 376.0,132.5 382.0,132.5 388.0,132.5 394.0,132.5 400.0,132.5 406.0,132.5 412.0,132.5 418.0,132.5 424.0,132.5 430.0,132.5 436.0,132.5 442.0,132.5 448.0,132.5 454.0,132.5 460.0,132.5 466.0,132.5 472.0,132.5 478.0,132.5 484.0,132.5 490.0,132.5 496.0,132.5 502.0,132.5 508.0,132.5 514.0,132.5 520.0,132.5 526.0,132.5 532.0,132.5 538.0,132.5 544.0,132.5 550.0,132.5',
  under:
    '70.0,270.0 76.0,265.9 82.0,254.6 88.0,237.7 94.0,216.9 100.0,194.0 106.0,170.4 112.0,147.7 118.0,127.2 124.0,109.6 130.0,95.6 136.0,85.6 142.0,79.6 148.0,77.5 154.0,78.9 160.0,83.1 166.0,89.7 172.0,97.9 178.0,107.1 184.0,116.5 190.0,125.6 196.0,133.9 202.0,141.1 208.0,146.8 214.0,151.0 220.0,153.5 226.0,154.5 232.0,154.1 238.0,152.4 244.0,149.9 250.0,146.6 256.0,143.0 262.0,139.2 268.0,135.6 274.0,132.2 280.0,129.3 286.0,127.0 292.0,125.2 298.0,124.2 304.0,123.7 310.0,123.8 316.0,124.4 322.0,125.4 328.0,126.7 334.0,128.2 340.0,129.7 346.0,131.1 352.0,132.5 358.0,133.7 364.0,134.6 370.0,135.4 376.0,135.8 382.0,136.0 388.0,136.0 394.0,135.7 400.0,135.4 406.0,134.9 412.0,134.3 418.0,133.7 424.0,133.1 430.0,132.5 436.0,132.1 442.0,131.7 448.0,131.4 454.0,131.2 460.0,131.1 466.0,131.1 472.0,131.2 478.0,131.3 484.0,131.5 490.0,131.8 496.0,132.0 502.0,132.2 508.0,132.5 514.0,132.7 520.0,132.8 526.0,132.9 532.0,133.0 538.0,133.1 544.0,133.1 550.0,133.0',
};

export const SVG_CURVES = lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 340" width="640" height="340" style="background:#0f172a;border-radius:10px;${FONT};">
  <text x="320" y="24" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">串联 RLC 阶跃响应精确波形对照 (V_s = 5.0 V, L = 10 mH, C = 1 µF)</text>
  <rect x="70" y="50" width="480" height="220" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <line x1="70" y1="215" x2="550" y2="215" stroke="#334155" stroke-width="0.8" stroke-dasharray="3,3"/>
  <line x1="70" y1="160" x2="550" y2="160" stroke="#334155" stroke-width="0.8" stroke-dasharray="3,3"/>
  <line x1="70" y1="105" x2="550" y2="105" stroke="#334155" stroke-width="0.8" stroke-dasharray="3,3"/>
  <line x1="190" y1="50" x2="190" y2="270" stroke="#334155" stroke-width="0.8" stroke-dasharray="3,3"/>
  <line x1="310" y1="50" x2="310" y2="270" stroke="#334155" stroke-width="0.8" stroke-dasharray="3,3"/>
  <line x1="430" y1="50" x2="430" y2="270" stroke="#334155" stroke-width="0.8" stroke-dasharray="3,3"/>
  <line x1="70" y1="132.5" x2="550" y2="132.5" stroke="#fbbf24" stroke-width="1.6" stroke-dasharray="7,4"/>
  <text x="556" y="136" fill="#fbbf24" font-size="11" font-weight="700">V_s = 5.0 V</text>
  <polyline fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-dasharray="6,3" points="${SHEET_CURVES.over}"/>
  <polyline fill="none" stroke="#34d399" stroke-width="2.8" points="${SHEET_CURVES.critical}"/>
  <polyline fill="none" stroke="#f43f5e" stroke-width="2.8" points="${SHEET_CURVES.under}"/>
  <circle cx="148.5" cy="77.5" r="4.5" fill="#f43f5e" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="148.5" y1="82" x2="148.5" y2="128" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="3,2"/>
  <polygon points="148.5,80 144.5,87 152.5,87" fill="#f43f5e"/>
  <polygon points="148.5,131 144.5,124 152.5,124" fill="#f43f5e"/>
  <rect x="160" y="56" width="218" height="36" rx="5" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="168" y="71" fill="#fda4af" font-size="11" font-weight="700">Overshoot = +40.0% (V_peak = 7.00 V)</text>
  <text x="168" y="85" fill="#cbd5e1" font-size="10">峰值时间 t_p = 0.327 ms (ζ = 0.28)</text>
  <line x1="70" y1="50" x2="70" y2="270" stroke="#e2e8f0" stroke-width="1.8"/>
  <line x1="70" y1="270" x2="550" y2="270" stroke="#e2e8f0" stroke-width="1.8"/>
  <text x="62" y="274" fill="#cbd5e1" font-size="11" text-anchor="end">0 V</text>
  <text x="62" y="219" fill="#cbd5e1" font-size="11" text-anchor="end">2 V</text>
  <text x="62" y="164" fill="#cbd5e1" font-size="11" text-anchor="end">4 V</text>
  <text x="62" y="109" fill="#cbd5e1" font-size="11" text-anchor="end">6 V</text>
  <text x="62" y="54" fill="#cbd5e1" font-size="11" text-anchor="end">8 V</text>
  <text x="22" y="160" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="middle" transform="rotate(-90 22 160)">v_C(t) [V]</text>
  <text x="70" y="288" fill="#cbd5e1" font-size="11" text-anchor="middle">0</text>
  <text x="190" y="288" fill="#cbd5e1" font-size="11" text-anchor="middle">0.5 ms</text>
  <text x="310" y="288" fill="#cbd5e1" font-size="11" text-anchor="middle">1.0 ms</text>
  <text x="430" y="288" fill="#cbd5e1" font-size="11" text-anchor="middle">1.5 ms</text>
  <text x="550" y="288" fill="#cbd5e1" font-size="11" text-anchor="middle">2.0 ms</text>
  <text x="310" y="306" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="middle">时间 t [ms]</text>
  <line x1="76" y1="324" x2="104" y2="324" stroke="#f43f5e" stroke-width="2.8"/>
  <text x="110" y="328" fill="#fda4af" font-size="11">欠阻尼 (R=56 Ω)</text>
  <line x1="238" y1="324" x2="266" y2="324" stroke="#34d399" stroke-width="2.8"/>
  <text x="272" y="328" fill="#6ee7b7" font-size="11">临界阻尼 (R=200 Ω)</text>
  <line x1="416" y1="324" x2="444" y2="324" stroke="#94a3b8" stroke-width="2.2" stroke-dasharray="6,3"/>
  <text x="450" y="328" fill="#cbd5e1" font-size="11">过阻尼 (R=250 Ω)</text>
</svg>`);

/* ------------------------------------------------------------- sheet 3.2: the guided example's circuit (dark → light) */

export const SVG_PAR_PROBLEM =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" width="600" height="240" style="background:#0f172a;border-radius:10px;${FONT};">
  <text x="300" y="24" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">苏格拉底实战电路：并联 RLC 阶跃响应 (I_s = 6 A, R = 5 Ω, L = 2 H, C = 20 mF)</text>
  <line x1="80" y1="68" x2="510" y2="68" stroke="#cbd5e1" stroke-width="2.2"/>
  <line x1="80" y1="192" x2="510" y2="192" stroke="#cbd5e1" stroke-width="2.2"/>
  <line x1="295" y1="192" x2="295" y2="206" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="281" y1="206" x2="309" y2="206" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="286" y1="212" x2="304" y2="212" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="291" y1="218" x2="299" y2="218" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="80" y1="68" x2="80" y2="106" stroke="#cbd5e1" stroke-width="2"/>
  <circle cx="80" cy="130" r="24" fill="#1e293b" stroke="#f59e0b" stroke-width="2.2"/>
  <line x1="80" y1="144" x2="80" y2="116" stroke="#f59e0b" stroke-width="2.5"/>
  <polygon points="80,113 74,122 86,122" fill="#f59e0b"/>
  <line x1="80" y1="154" x2="80" y2="192" stroke="#cbd5e1" stroke-width="2"/>
  <text x="114" y="126" fill="#fbbf24" font-size="12" font-weight="700">I_s = 6 u(t) A</text>
  <text x="114" y="142" fill="#94a3b8" font-size="10">零初始储能</text>
  <line x1="240" y1="68" x2="240" y2="98" stroke="#cbd5e1" stroke-width="2"/>
  <polyline points="240,98 231,104 249,113 231,122 249,131 231,140 249,149 240,155" fill="none" stroke="#f472b6" stroke-width="2.4"/>
  <line x1="240" y1="155" x2="240" y2="192" stroke="#cbd5e1" stroke-width="2"/>
  <text x="260" y="132" fill="#f472b6" font-size="12" font-weight="700">R = 5 Ω</text>
  <line x1="375" y1="68" x2="375" y2="98" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M 375 98 Q 393 105 375 112 Q 393 119 375 126 Q 393 133 375 140 Q 393 147 375 154" fill="none" stroke="#a78bfa" stroke-width="2.4"/>
  <line x1="375" y1="154" x2="375" y2="192" stroke="#cbd5e1" stroke-width="2"/>
  <text x="398" y="132" fill="#a78bfa" font-size="12" font-weight="700">L = 2 H</text>
  <line x1="358" y1="80" x2="358" y2="104" stroke="#38bdf8" stroke-width="2"/>
  <polygon points="358,107 354,99 362,99" fill="#38bdf8"/>
  <text x="330" y="96" fill="#38bdf8" font-size="11" font-weight="700">i_L(t)</text>
  <line x1="510" y1="68" x2="510" y2="122" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="494" y1="122" x2="526" y2="122" stroke="#34d399" stroke-width="3.2"/>
  <line x1="494" y1="136" x2="526" y2="136" stroke="#34d399" stroke-width="3.2"/>
  <line x1="510" y1="136" x2="510" y2="192" stroke="#cbd5e1" stroke-width="2"/>
  <text x="534" y="132" fill="#34d399" font-size="12" font-weight="700">C = 20 mF</text>
  <text x="300" y="56" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="middle">+   v(t)   -</text>
</svg>`);

/* ------------------------------------------------------------- sheet 4.2: the general circuit (dark → light) */

export const SVG_GENERAL = lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 250" width="660" height="250" style="background:#0f172a;border-radius:10px;${FONT};">
  <text x="330" y="24" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">一般混合二阶电路例题 (Section 8.7)：V_s = 12 V, R_1 = 4 Ω, L = 1 H, R_2 = 2 Ω, C = 0.5 F</text>
  <circle cx="72" cy="138" r="24" fill="#1e293b" stroke="#f59e0b" stroke-width="2.2"/>
  <text x="72" y="130" fill="#f59e0b" font-size="13" font-weight="700" text-anchor="middle">+</text>
  <text x="72" y="152" fill="#f59e0b" font-size="13" font-weight="700" text-anchor="middle">-</text>
  <text x="72" y="178" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">V_s = 12 V</text>
  <line x1="72" y1="114" x2="72" y2="76" stroke="#cbd5e1" stroke-width="2.2"/>
  <line x1="72" y1="76" x2="108" y2="76" stroke="#cbd5e1" stroke-width="2.2"/>
  <circle cx="108" cy="76" r="3.5" fill="#38bdf8"/>
  <line x1="108" y1="76" x2="138" y2="60" stroke="#38bdf8" stroke-width="2.4"/>
  <circle cx="142" cy="76" r="3.5" fill="#38bdf8"/>
  <text x="125" y="54" fill="#7dd3fc" font-size="10.5" text-anchor="middle">t = 0 闭合</text>
  <line x1="142" y1="76" x2="164" y2="76" stroke="#cbd5e1" stroke-width="2.2"/>
  <polyline points="164,76 170,66 179,86 188,66 197,86 206,66 215,86 221,76" fill="none" stroke="#f472b6" stroke-width="2.4"/>
  <text x="192" y="58" fill="#f472b6" font-size="12" font-weight="700" text-anchor="middle">R_1 = 4 Ω</text>
  <line x1="221" y1="76" x2="250" y2="76" stroke="#cbd5e1" stroke-width="2.2"/>
  <path d="M 250 76 Q 258 58 266 76 Q 274 58 282 76 Q 290 58 298 76 Q 306 58 314 76" fill="none" stroke="#a78bfa" stroke-width="2.4"/>
  <text x="282" y="52" fill="#a78bfa" font-size="12" font-weight="700" text-anchor="middle">L = 1 H</text>
  <line x1="324" y1="64" x2="358" y2="64" stroke="#38bdf8" stroke-width="2"/>
  <polygon points="360,64 352,60 352,68" fill="#38bdf8"/>
  <text x="342" y="56" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">i_L(t)</text>
  <line x1="314" y1="76" x2="495" y2="76" stroke="#cbd5e1" stroke-width="2.2"/>
  <circle cx="386" cy="76" r="4.5" fill="#fbbf24"/>
  <text x="400" y="62" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="start">节点 A</text>
  <line x1="386" y1="76" x2="386" y2="108" stroke="#cbd5e1" stroke-width="2.2"/>
  <polyline points="386,108 377,114 395,123 377,132 395,141 377,150 395,159 386,165" fill="none" stroke="#f472b6" stroke-width="2.4"/>
  <line x1="386" y1="165" x2="386" y2="202" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="404" y="140" fill="#f472b6" font-size="12" font-weight="700">R_2 = 2 Ω</text>
  <line x1="495" y1="76" x2="495" y2="130" stroke="#cbd5e1" stroke-width="2.2"/>
  <line x1="479" y1="130" x2="511" y2="130" stroke="#34d399" stroke-width="3.2"/>
  <line x1="479" y1="144" x2="511" y2="144" stroke="#34d399" stroke-width="3.2"/>
  <line x1="495" y1="144" x2="495" y2="202" stroke="#cbd5e1" stroke-width="2.2"/>
  <text x="520" y="122" fill="#34d399" font-size="11" font-weight="700">+</text>
  <text x="520" y="141" fill="#34d399" font-size="12" font-weight="700">v_C(t) (C = 0.5 F)</text>
  <text x="520" y="160" fill="#34d399" font-size="11" font-weight="700">-</text>
  <line x1="72" y1="162" x2="72" y2="202" stroke="#cbd5e1" stroke-width="2.2"/>
  <line x1="72" y1="202" x2="495" y2="202" stroke="#cbd5e1" stroke-width="2.2"/>
  <rect x="72" y="214" width="516" height="26" rx="5" fill="#1e293b" stroke="#334155"/>
  <text x="330" y="231" fill="#cbd5e1" font-size="11" text-anchor="middle">t=0+：i_L=0, v_C=0  |  t→∞：L短路、C开路，R_1 与 R_2 分压得 v_C(∞) = 4 V, i_L(∞) = 2 A</text>
</svg>`);

/* ------------------------------------------------------------- sheet 5.2: PCB trace ringing (dark → light) */

export const SVG_PCB = lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 240" width="740" height="240" style="background:#0f172a;border-radius:10px;${FONT};">
  <text x="370" y="24" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">工程映射：PCB 数字走线寄生 RLC 模型与串联端接电阻消振原理</text>
  <rect x="16" y="40" width="414" height="184" rx="8" fill="#1e293b" stroke="#334155"/>
  <rect x="30" y="76" width="76" height="92" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="68" y="114" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">MCU / FPGA</text>
  <text x="68" y="130" fill="#94a3b8" font-size="10" text-anchor="middle">驱动器 GPIO</text>
  <text x="68" y="146" fill="#fbbf24" font-size="9.5" text-anchor="middle">0→3.3V 阶跃</text>
  <line x1="106" y1="106" x2="128" y2="106" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="128" y="96" width="52" height="20" rx="3" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="154" y="110" fill="#34d399" font-size="10" font-weight="700" text-anchor="middle">R_term</text>
  <text x="154" y="88" fill="#6ee7b7" font-size="10" text-anchor="middle">33 Ω 端接</text>
  <line x1="180" y1="106" x2="202" y2="106" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M 202 106 Q 210 88 218 106 Q 226 88 234 106 Q 242 88 250 106 Q 258 88 266 106" fill="none" stroke="#a78bfa" stroke-width="2.2"/>
  <text x="234" y="80" fill="#a78bfa" font-size="10.5" font-weight="700" text-anchor="middle">L_trace (寄生)</text>
  <line x1="266" y1="106" x2="344" y2="106" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="306" y1="106" x2="306" y2="138" stroke="#cbd5e1" stroke-width="1.8"/>
  <line x1="294" y1="138" x2="318" y2="138" stroke="#f472b6" stroke-width="2.8"/>
  <line x1="294" y1="148" x2="318" y2="148" stroke="#f472b6" stroke-width="2.8"/>
  <line x1="306" y1="148" x2="306" y2="180" stroke="#cbd5e1" stroke-width="1.8"/>
  <text x="306" y="210" fill="#f472b6" font-size="10" text-anchor="middle">C_in (输入电容)</text>
  <rect x="344" y="76" width="72" height="92" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="380" y="118" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">接收端 IC</text>
  <text x="380" y="136" fill="#94a3b8" font-size="10" text-anchor="middle">CMOS 输入</text>
  <line x1="68" y1="168" x2="68" y2="180" stroke="#cbd5e1" stroke-width="1.8"/>
  <line x1="68" y1="180" x2="380" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="5,3"/>
  <line x1="380" y1="168" x2="380" y2="180" stroke="#cbd5e1" stroke-width="1.8"/>
  <text x="170" y="196" fill="#94a3b8" font-size="10" text-anchor="middle">PCB 完整参考地平面 (GND)</text>
  <rect x="444" y="40" width="280" height="184" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="584" y="60" fill="#e2e8f0" font-size="11.5" font-weight="700" text-anchor="middle">接收端实测上升沿对比</text>
  <line x1="464" y1="114" x2="706" y2="114" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="5,3"/>
  <text x="706" y="108" fill="#fbbf24" font-size="9.5" text-anchor="end">3.3 V 高电平</text>
  <polyline fill="none" stroke="#f43f5e" stroke-width="2.2" points="464,186 488,186 502,110 512,72 522,82 534,132 546,142 558,104 570,98 584,122 598,124 614,110 632,116 660,114 704,114"/>
  <polyline fill="none" stroke="#34d399" stroke-width="2.4" points="464,186 488,186 504,158 520,132 538,119 560,115 590,114 704,114"/>
  <line x1="466" y1="208" x2="486" y2="208" stroke="#f43f5e" stroke-width="2.2"/>
  <text x="492" y="212" fill="#fda4af" font-size="10">无端接 (过冲振铃)</text>
  <line x1="594" y1="208" x2="614" y2="208" stroke="#34d399" stroke-width="2.4"/>
  <text x="620" y="212" fill="#6ee7b7" font-size="10">串联端接 (平滑稳定)</text>
</svg>`);

/* ------------------------------------------------------------- sheet 6.1: the decision tree (dark → light) */

export const SVG_TREE = lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 230" width="720" height="230" style="background:#0f172a;border-radius:10px;${FONT};">
  <text x="360" y="24" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">W4-L8 二阶阶跃与一般二阶电路求解总决策流程图</text>
  <rect x="24" y="88" width="124" height="54" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="86" y="111" fill="#38bdf8" font-size="11.5" font-weight="700" text-anchor="middle">Step 1: 初值锁定</text>
  <text x="86" y="128" fill="#cbd5e1" font-size="10" text-anchor="middle">x(0+) 与 x'(0+)</text>
  <line x1="148" y1="115" x2="188" y2="115" stroke="#94a3b8" stroke-width="2"/>
  <polygon points="190,115 182,110 182,120" fill="#94a3b8"/>
  <rect x="190" y="88" width="130" height="54" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
  <text x="255" y="111" fill="#fbbf24" font-size="11.5" font-weight="700" text-anchor="middle">Step 2: 拓扑判别</text>
  <text x="255" y="128" fill="#cbd5e1" font-size="10" text-anchor="middle">纯串 / 纯并 / 混合?</text>
  <line x1="320" y1="100" x2="358" y2="66" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="320" y1="115" x2="358" y2="115" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="320" y1="130" x2="358" y2="164" stroke="#94a3b8" stroke-width="1.8"/>
  <rect x="358" y="44" width="168" height="40" rx="6" fill="#1e293b" stroke="#f472b6"/>
  <text x="442" y="61" fill="#f472b6" font-size="10.5" font-weight="700" text-anchor="middle">纯串联 RLC (Sec 8.5)</text>
  <text x="442" y="76" fill="#cbd5e1" font-size="9.5" text-anchor="middle">α = R/(2L), v_ss = V_s</text>
  <rect x="358" y="95" width="168" height="40" rx="6" fill="#1e293b" stroke="#34d399"/>
  <text x="442" y="112" fill="#34d399" font-size="10.5" font-weight="700" text-anchor="middle">纯并联 RLC (Sec 8.6)</text>
  <text x="442" y="127" fill="#cbd5e1" font-size="9.5" text-anchor="middle">α = 1/(2RC), i_ss = I_s</text>
  <rect x="358" y="146" width="168" height="44" rx="6" fill="#1e293b" stroke="#a78bfa"/>
  <text x="442" y="164" fill="#a78bfa" font-size="10.5" font-weight="700" text-anchor="middle">一般混合网络 (Sec 8.7)</text>
  <text x="442" y="180" fill="#cbd5e1" font-size="9.5" text-anchor="middle">独立源置零消元求特征根</text>
  <line x1="526" y1="64" x2="564" y2="100" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="526" y1="115" x2="564" y2="115" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="526" y1="168" x2="564" y2="130" stroke="#94a3b8" stroke-width="1.8"/>
  <rect x="564" y="76" width="136" height="78" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="2.2"/>
  <text x="632" y="98" fill="#fda4af" font-size="11" font-weight="700" text-anchor="middle">Step 3 &amp; 4: 合并</text>
  <text x="632" y="116" fill="#f8fafc" font-size="10.5" font-weight="700" text-anchor="middle">x(t) = x_ss + x_t(t)</text>
  <text x="632" y="134" fill="#fbbf24" font-size="9.5" text-anchor="middle">含 x_ss 代入初值</text>
  <text x="632" y="148" fill="#cbd5e1" font-size="9" text-anchor="middle">解出常数并双向自检</text>
  <text x="360" y="214" fill="#fda4af" font-size="11" font-weight="600" text-anchor="middle">铁律：永远先拼出完整 x(t) = x_ss + x_t(t)，再代入 x(0+) 与 x'(0+) 求解待定常数！</text>
</svg>`);

/* ------------------------------------------------------------- new figures (light theme) */

const LIGHT = `style="background:#fbf7ef;border-radius:10px;${FONT};"`;
const INK = '#1f2a44';

/** act 1.2: the fatal mistake — the transient alone vs the complete response at t = 0+ */
export const SVG_TRAP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 220" width="600" height="220" ${LIGHT}>
  <text x="300" y="24" fill="${INK}" font-size="14" font-weight="700" text-anchor="middle">零初始储能接入 5 V：两种代初值方式画出的 v_C(t)</text>
  <g transform="translate(20,40)">
    <rect width="270" height="160" rx="8" fill="#fff1f2" stroke="#fda4af"/>
    <text x="135" y="20" fill="#be123c" font-size="12" font-weight="700" text-anchor="middle">错误：只拿 v_t(t) 代初值 → B₁ = B₂ = 0</text>
    <line x1="30" y1="130" x2="250" y2="130" stroke="#94a3b8"/>
    <line x1="30" y1="130" x2="30" y2="36" stroke="#94a3b8"/>
    <line x1="30" y1="62" x2="250" y2="62" stroke="#a16207" stroke-dasharray="5,3"/>
    <text x="246" y="56" fill="#a16207" font-size="10" text-anchor="end">5 V</text>
    <polyline points="30,130 30,62 250,62" fill="none" stroke="#e11d48" stroke-width="2.6"/>
    <circle cx="30" cy="96" r="9" fill="none" stroke="#e11d48" stroke-width="1.6"/>
    <text x="44" y="100" fill="#be123c" font-size="10.5">t = 0 瞬间跳变 0 → 5 V：违背电容电压连续</text>
    <text x="135" y="150" fill="#5f626b" font-size="10.5" text-anchor="middle">t</text>
  </g>
  <g transform="translate(310,40)">
    <rect width="270" height="160" rx="8" fill="#ecfdf5" stroke="#86efac"/>
    <text x="135" y="20" fill="#047857" font-size="12" font-weight="700" text-anchor="middle">正确：V_s + B₁ = 0 → B₁ = −V_s</text>
    <line x1="30" y1="130" x2="250" y2="130" stroke="#94a3b8"/>
    <line x1="30" y1="130" x2="30" y2="36" stroke="#94a3b8"/>
    <line x1="30" y1="62" x2="250" y2="62" stroke="#a16207" stroke-dasharray="5,3"/>
    <text x="246" y="56" fill="#a16207" font-size="10" text-anchor="end">5 V</text>
    <path d="M30 130 C 52 128, 60 40, 82 36 C 100 34, 108 74, 126 76 C 144 78, 150 58, 170 60 C 190 62, 200 64, 250 62" fill="none" stroke="#059669" stroke-width="2.6"/>
    <text x="40" y="146" fill="#047857" font-size="10.5">从 0 V 平滑起步：负暂态在 0⁺ 抵消 +5 V</text>
  </g>
</svg>`;

/** act 3.1: R in the series path brakes; R across the tank drains */
export const SVG_R_ROLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" width="600" height="200" ${LIGHT}>
  <text x="300" y="22" fill="${INK}" font-size="14" font-weight="700" text-anchor="middle">同一颗 R，两种位置：串联“刹车”，并联“排水沟”</text>
  <g transform="translate(16,36)">
    <rect width="276" height="150" rx="8" fill="#fff" stroke="#e3d8c2"/>
    <text x="138" y="20" fill="#0369a1" font-size="12" font-weight="700" text-anchor="middle">串联：α = R/(2L)，R ↑ → 阻尼 ↑</text>
    <path fill="none" d="M40 60 H96" stroke="#475569" stroke-width="2"/>
    <polyline points="96,60 101,52 109,68 117,52 125,68 133,52 138,60" fill="none" stroke="#db2777" stroke-width="2.4"/>
    <path fill="none" d="M138 60 H160" stroke="#475569" stroke-width="2"/>
    <path d="M160 60 Q166 46 172 60 Q178 46 184 60 Q190 46 196 60" fill="none" stroke="#7c3aed" stroke-width="2.2"/>
    <path fill="none" d="M196 60 H236 V84" stroke="#475569" stroke-width="2"/>
    <path fill="none" d="M222 84 H250 M222 94 H250" stroke="#059669" stroke-width="3"/>
    <path fill="none" d="M236 94 V122 H40 V60" stroke="#475569" stroke-width="2"/>
    <path fill="none" d="M64 38 H120" stroke="#0284c7" stroke-width="1.8" marker-end="url(#ar1)"/>
    <text x="117" y="88" fill="#be185d" font-size="11" text-anchor="middle">电流必经之路上的 R</text>
    <text x="138" y="142" fill="#3a4560" font-size="10.5" text-anchor="middle">R 越大越“刹车”，振荡越快熄灭</text>
  </g>
  <g transform="translate(308,36)">
    <rect width="276" height="150" rx="8" fill="#fff" stroke="#e3d8c2"/>
    <text x="138" y="20" fill="#047857" font-size="12" font-weight="700" text-anchor="middle">并联：α = 1/(2RC)，R ↑ → 阻尼 ↓</text>
    <path fill="none" d="M50 44 H230 M50 122 H230" stroke="#475569" stroke-width="2"/>
    <path fill="none" d="M70 44 V64" stroke="#475569" stroke-width="2"/>
    <polyline points="70,64 62,69 78,76 62,83 78,90 70,96" fill="none" stroke="#db2777" stroke-width="2.4"/>
    <path fill="none" d="M70 96 V122" stroke="#475569" stroke-width="2"/>
    <path fill="none" d="M150 44 V62" stroke="#475569" stroke-width="2"/>
    <path d="M150 62 Q162 68 150 74 Q162 80 150 86 Q162 92 150 98" fill="none" stroke="#7c3aed" stroke-width="2.2"/>
    <path fill="none" d="M150 98 V122" stroke="#475569" stroke-width="2"/>
    <path fill="none" d="M210 44 V78 M196 78 H224 M196 88 H224 M210 88 V122" stroke="#059669" stroke-width="2.4"/>
    <path d="M160 58 C 180 50, 196 52, 204 64" fill="none" stroke="#0284c7" stroke-width="1.6" stroke-dasharray="4,3"/>
    <path d="M204 104 C 196 116, 176 116, 160 108" fill="none" stroke="#0284c7" stroke-width="1.6" stroke-dasharray="4,3"/>
    <text x="180" y="72" fill="#0369a1" font-size="9.5" text-anchor="middle">L ⇄ C</text>
    <text x="96" y="80" fill="#be185d" font-size="10.5" text-anchor="start">旁路排水沟</text>
    <text x="138" y="142" fill="#3a4560" font-size="10.5" text-anchor="middle">R → ∞ 时沟被堵死，能量只在 L、C 间倒腾</text>
  </g>
  <defs><marker id="ar1" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#0284c7"/></marker></defs>
</svg>`;

/** act 5.3: one earth for both instruments — the right and the wrong ground clip */
export const SVG_GROUND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 250" width="620" height="250" ${LIGHT}>
  <text x="310" y="22" fill="${INK}" font-size="14" font-weight="700" text-anchor="middle">示波器共地铁律：两只地夹都只能夹 GND 轨</text>
  <rect x="16" y="44" width="92" height="72" rx="8" fill="#fff" stroke="#d97706" stroke-width="1.8"/>
  <text x="62" y="70" fill="#b45309" font-size="11" font-weight="700" text-anchor="middle">函数信号</text>
  <text x="62" y="86" fill="#b45309" font-size="11" font-weight="700" text-anchor="middle">发生器</text>
  <text x="62" y="104" fill="#5f626b" font-size="9.5" text-anchor="middle">内阻 50 Ω</text>
  <path fill="none" d="M108 64 H150" stroke="#475569" stroke-width="2"/>
  <circle cx="150" cy="64" r="4" fill="${INK}"/>
  <text x="150" y="54" fill="${INK}" font-size="10" text-anchor="middle">N1</text>
  <path fill="none" d="M150 64 H170" stroke="#475569" stroke-width="2"/>
  <polyline points="170,64 175,56 183,72 191,56 199,72 207,56 212,64" fill="none" stroke="#db2777" stroke-width="2.4"/>
  <text x="191" y="48" fill="#be185d" font-size="11" font-weight="700" text-anchor="middle">R</text>
  <path fill="none" d="M212 64 H240" stroke="#475569" stroke-width="2"/>
  <circle cx="240" cy="64" r="4" fill="${INK}"/>
  <text x="240" y="54" fill="${INK}" font-size="10" text-anchor="middle">N2</text>
  <path fill="none" d="M240 64 H258" stroke="#475569" stroke-width="2"/>
  <path d="M258 64 Q265 48 272 64 Q279 48 286 64 Q293 48 300 64" fill="none" stroke="#7c3aed" stroke-width="2.2"/>
  <text x="279" y="44" fill="#6d28d9" font-size="11" font-weight="700" text-anchor="middle">L</text>
  <path fill="none" d="M300 64 H340" stroke="#475569" stroke-width="2"/>
  <circle cx="340" cy="64" r="4" fill="${INK}"/>
  <text x="352" y="58" fill="${INK}" font-size="10">N3 = v_C</text>
  <path fill="none" d="M340 64 V90 M326 90 H354 M326 100 H354 M340 100 V136" stroke="#059669" stroke-width="2.4"/>
  <text x="362" y="100" fill="#047857" font-size="11" font-weight="700">C</text>
  <path fill="none" d="M62 116 V136 H420" stroke="${INK}" stroke-width="3"/>
  <text x="380" y="130" fill="${INK}" font-size="10.5" font-weight="700">GND 轨</text>
  <rect x="470" y="44" width="134" height="92" rx="8" fill="#fff" stroke="#0284c7" stroke-width="1.8"/>
  <text x="537" y="66" fill="#0369a1" font-size="11.5" font-weight="700" text-anchor="middle">双通道示波器</text>
  <text x="537" y="84" fill="#5f626b" font-size="9.5" text-anchor="middle">CH1 / CH2 的 BNC 外壳</text>
  <text x="537" y="98" fill="#5f626b" font-size="9.5" text-anchor="middle">在机内连成一个地</text>
  <path d="M150 64 C 160 44, 460 44, 482 56" fill="none" stroke="#a16207" stroke-width="1.4" stroke-dasharray="4,3"/>
  <text x="320" y="44" fill="#a16207" font-size="9.5" text-anchor="middle">CH1 探头尖 → N1</text>
  <path d="M340 64 C 400 64, 440 70, 482 78" fill="none" stroke="#0284c7" stroke-width="1.4" stroke-dasharray="4,3"/>
  <text x="424" y="96" fill="#0369a1" font-size="9.5" text-anchor="middle">CH2 探头尖 → N3</text>
  <path d="M420 136 C 460 136, 480 130, 500 136" fill="none" stroke="${INK}" stroke-width="1.6"/>
  <text x="470" y="152" fill="#047857" font-size="10" font-weight="700" text-anchor="middle">✓ 两只地夹 → GND 轨</text>
  <path fill="none" d="M62 170 H604" stroke="#64748b" stroke-width="2" stroke-dasharray="6,4"/>
  <path fill="none" d="M62 136 V170 M537 136 V170" stroke="#64748b" stroke-width="1.6" stroke-dasharray="3,3"/>
  <text x="333" y="184" fill="#5f626b" font-size="10" text-anchor="middle">市电保护地 PE：信号源外壳与示波器外壳通过电源线连在一起</text>
  <rect x="16" y="196" width="588" height="44" rx="8" fill="#fff1f2" stroke="#fda4af"/>
  <text x="310" y="214" fill="#be123c" font-size="11" font-weight="700" text-anchor="middle">✕ 把 CH2 地夹夹到 N1 / N2 / N3：该节点经示波器地 → PE → 信号源地被直接短路</text>
  <text x="310" y="231" fill="#be123c" font-size="10.5" text-anchor="middle">要看 v_R 或 v_L：两只地夹仍接 GND，用 MATH 功能算 CH1 − CH2</text>
</svg>`;

/** the closing act: what the quiz covers */
export const SVG_QUIZ_ACT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120" width="600" height="120" ${LIGHT}>
  <text x="300" y="22" fill="${INK}" font-size="13" font-weight="700" text-anchor="middle">诊断测验的四个考点</text>
  ${[
    ['Q1', '代初值带上 x_ss', '#e11d48'],
    ['Q2', '临界电阻 R_crit', '#059669'],
    ['Q3', '并联 R 的阻尼方向', '#0284c7'],
    ['Q4', '混合电路四步法', '#7c3aed'],
  ]
    .map(
      ([q, t, c], i) =>
        `<g transform="translate(${16 + i * 146},40)"><rect width="130" height="64" rx="8" fill="#fff" stroke="${c}" stroke-width="1.6"/><text x="65" y="26" fill="${c}" font-size="14" font-weight="800" text-anchor="middle">${q}</text><text x="65" y="47" fill="#3a4560" font-size="11" text-anchor="middle">${t}</text></g>`,
    )
    .join('')}
</svg>`;

/* ------------------------------------------------------------- guided example: step diagrams (ask, do not answer) */

const MINI = (title: string, color: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90" width="260" height="90" style="background:#fbf7ef;border-radius:6px;${FONT};"><text x="130" y="20" fill="${color}" font-size="11" font-weight="700" text-anchor="middle">${title}</text>${body}</svg>`;
const box = (x: number, stroke: string, l1: string, l2: string, c2 = '#5f626b') =>
  `<rect x="${x}" y="30" width="104" height="48" rx="5" fill="#fff" stroke="${stroke}"/><text x="${x + 52}" y="50" fill="${INK}" font-size="10.5" text-anchor="middle">${l1}</text><text x="${x + 52}" y="67" fill="${c2}" font-size="10" text-anchor="middle">${l2}</text>`;

export const MINI_STEP1 = MINI('t = 0+ 等效判定', '#0369a1', box(16, '#7c3aed', 'L：i_L(0+) = ?', '电流能突变吗？') + box(140, '#059669', 'C：v(0+) = ?', '电压能突变吗？'));
export const MINI_STEP2 = MINI(
  '并联特征根判别',
  '#047857',
  `<text x="130" y="46" fill="${INK}" font-size="11" text-anchor="middle">α = 1/(2RC) = ?    ω₀ = 1/√(LC) = ?</text><text x="130" y="68" fill="#a16207" font-size="11" text-anchor="middle">α 与 ω₀ 比大小 → 哪种阻尼？</text>`,
);
export const MINI_STEP3 = MINI(
  't → ∞ 直流稳态',
  '#a16207',
  `<text x="130" y="46" fill="${INK}" font-size="11" text-anchor="middle">L 短路、C 开路 → i_L(∞) = ?</text><text x="130" y="68" fill="#0369a1" font-size="11" text-anchor="middle">i_L(t) = i_ss + i_t(t)</text>`,
);
export const MINI_STEP4 = MINI(
  '求导联立定常数',
  '#be185d',
  `<text x="130" y="46" fill="${INK}" font-size="10.5" text-anchor="middle">代 i_L(0+)：6 + D_1 = ?  ⇒  D_1 = ?</text><text x="130" y="68" fill="${INK}" font-size="10.5" text-anchor="middle">代 i_L'(0+)：D_2 − 5 D_1 = ?  ⇒  D_2 = ?</text>`,
);
export const MINI_STEP5 = MINI(
  'v(t) = L · di_L/dt 的物理自检',
  '#047857',
  `<text x="130" y="46" fill="${INK}" font-size="10.5" text-anchor="middle">v(0+) 应等于 ?（电容电压不能突变）</text><text x="130" y="68" fill="${INK}" font-size="10.5" text-anchor="middle">v(∞) 应等于 ?（电感把节点短路）</text>`,
);

/* ------------------------------------------------------------- quiz figures (no answers) */

const QF = (w: number, h: number, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${LIGHT}>${body}</svg>`;

export const SVG_Q1 = QF(
  420,
  150,
  `<text x="210" y="20" fill="${INK}" font-size="12" font-weight="700" text-anchor="middle">零初始储能串联 RLC · 10 V 阶跃 · 过阻尼</text>
  <circle cx="50" cy="86" r="18" fill="#fff" stroke="#d97706" stroke-width="2"/><text x="50" y="82" fill="#b45309" font-size="11" text-anchor="middle">+</text><text x="50" y="98" fill="#b45309" font-size="11" text-anchor="middle">−</text>
  <text x="50" y="145" fill="#b45309" font-size="10.5" text-anchor="middle">10 u(t) V</text>
  <path fill="none" d="M50 68 V44 H110" stroke="#475569" stroke-width="2"/><polyline points="110,44 115,36 123,52 131,36 139,52 144,44" fill="none" stroke="#db2777" stroke-width="2.2"/>
  <path fill="none" d="M144 44 H166" stroke="#475569" stroke-width="2"/><path d="M166 44 Q172 30 178 44 Q184 30 190 44 Q196 30 202 44" fill="none" stroke="#7c3aed" stroke-width="2.2"/>
  <path fill="none" d="M202 44 H240 V74 M226 74 H254 M226 84 H254 M240 84 V128 H50 V104" stroke="#475569" stroke-width="2"/>
  <path fill="none" d="M226 74 H254 M226 84 H254" stroke="#059669" stroke-width="3"/>
  <text x="262" y="84" fill="#047857" font-size="11">v_C(t)</text>
  <rect x="300" y="48" width="108" height="58" rx="6" fill="#fff" stroke="#e3d8c2"/>
  <text x="354" y="68" fill="${INK}" font-size="11" text-anchor="middle">s₁ = −2,  s₂ = −5</text>
  <text x="354" y="86" fill="#5f626b" font-size="10" text-anchor="middle">v_C(0⁺) = 0</text>
  <text x="354" y="100" fill="#5f626b" font-size="10" text-anchor="middle">i(0⁺) = 0</text>`,
);

export const SVG_Q2 = QF(
  420,
  140,
  `<text x="210" y="20" fill="${INK}" font-size="12" font-weight="700" text-anchor="middle">面包板串联 RLC：R 调到多少，上升沿零过冲且最快？</text>
  <rect x="16" y="50" width="70" height="50" rx="6" fill="#fff" stroke="#d97706" stroke-width="1.6"/><text x="51" y="72" fill="#b45309" font-size="10.5" text-anchor="middle">0–5 V 方波</text><text x="51" y="88" fill="#5f626b" font-size="9.5" text-anchor="middle">200 Hz</text>
  <path fill="none" d="M86 62 H120" stroke="#475569" stroke-width="2"/><polyline points="120,62 125,54 133,70 141,54 149,70 154,62" fill="none" stroke="#db2777" stroke-width="2.2"/>
  <text x="137" y="46" fill="#be185d" font-size="11" font-weight="700" text-anchor="middle">R = ?</text>
  <path fill="none" d="M154 62 H178" stroke="#475569" stroke-width="2"/><path d="M178 62 Q185 48 192 62 Q199 48 206 62 Q213 48 220 62" fill="none" stroke="#7c3aed" stroke-width="2.2"/>
  <text x="199" y="44" fill="#6d28d9" font-size="10.5" text-anchor="middle">10 mH</text>
  <path fill="none" d="M220 62 H260 V86 M260 96 V118 H51 V100" stroke="#475569" stroke-width="2"/><path fill="none" d="M246 86 H274 M246 96 H274" stroke="#059669" stroke-width="3"/>
  <text x="282" y="94" fill="#047857" font-size="10.5">1 µF</text>
  <path d="M320 104 H336 C 350 104, 352 40, 366 40 C 378 40, 380 76, 392 76 C 400 76, 402 64, 410 64" fill="none" stroke="#e11d48" stroke-width="2"/>
  <path fill="none" d="M320 64 H410" stroke="#a16207" stroke-dasharray="4,3"/>
  <text x="366" y="124" fill="#be123c" font-size="10" text-anchor="middle">现在：过冲振铃</text>`,
);

export const SVG_Q3 = QF(
  420,
  140,
  `<text x="210" y="20" fill="${INK}" font-size="12" font-weight="700" text-anchor="middle">并联 RLC 原本临界阻尼：只把 R 换成 2R</text>
  <path fill="none" d="M40 44 H380 M40 118 H380" stroke="#475569" stroke-width="2"/>
  <circle cx="60" cy="81" r="16" fill="#fff" stroke="#d97706" stroke-width="2"/><path fill="none" d="M60 92 V72" stroke="#d97706" stroke-width="2"/><polygon points="60,68 55,76 65,76" fill="#d97706"/>
  <path fill="none" d="M60 44 V65 M60 97 V118" stroke="#475569" stroke-width="2"/>
  <text x="84" y="86" fill="#b45309" font-size="10.5">I_s u(t)</text>
  <path fill="none" d="M170 44 V58" stroke="#475569" stroke-width="2"/><polyline points="170,58 162,63 178,70 162,77 178,84 170,90" fill="none" stroke="#db2777" stroke-width="2.4"/><path fill="none" d="M170 90 V118" stroke="#475569" stroke-width="2"/>
  <text x="186" y="72" fill="#be185d" font-size="11" font-weight="700">R → 2R</text>
  <path fill="none" d="M270 44 V58" stroke="#475569" stroke-width="2"/><path d="M270 58 Q282 64 270 70 Q282 76 270 82 Q282 88 270 94" fill="none" stroke="#7c3aed" stroke-width="2.2"/><path fill="none" d="M270 94 V118" stroke="#475569" stroke-width="2"/><text x="288" y="82" fill="#6d28d9" font-size="10.5">L 不变</text>
  <path fill="none" d="M350 44 V76 M336 76 H364 M336 86 H364 M350 86 V118" stroke="#059669" stroke-width="2.4"/><text x="354" y="134" fill="#047857" font-size="10.5" text-anchor="middle">C 不变</text>`,
);

export const SVG_Q4 = QF(
  420,
  140,
  `<text x="210" y="20" fill="${INK}" font-size="12" font-weight="700" text-anchor="middle">既非纯串也非纯并：特征方程与 v_C(∞)？</text>
  <circle cx="40" cy="86" r="16" fill="#fff" stroke="#d97706" stroke-width="2"/><text x="40" y="82" fill="#b45309" font-size="10" text-anchor="middle">+</text><text x="40" y="96" fill="#b45309" font-size="10" text-anchor="middle">−</text><text x="62" y="90" fill="#b45309" font-size="10" text-anchor="start">12 V</text>
  <path fill="none" d="M40 70 V46 H80" stroke="#475569" stroke-width="2"/><polyline points="80,46 85,38 93,54 101,38 109,54 114,46" fill="none" stroke="#db2777" stroke-width="2.2"/><text x="97" y="34" fill="#be185d" font-size="10" text-anchor="middle">R_1 = 4 Ω</text>
  <path fill="none" d="M114 46 H136" stroke="#475569" stroke-width="2"/><path d="M136 46 Q143 32 150 46 Q157 32 164 46 Q171 32 178 46" fill="none" stroke="#7c3aed" stroke-width="2.2"/><text x="157" y="66" fill="#6d28d9" font-size="10" text-anchor="middle">L = 1 H</text>
  <path fill="none" d="M178 46 H320" stroke="#475569" stroke-width="2"/><circle cx="230" cy="46" r="3.5" fill="#d97706"/><text x="230" y="36" fill="#a16207" font-size="10" text-anchor="middle">A</text>
  <path fill="none" d="M230 46 V60" stroke="#475569" stroke-width="2"/><polyline points="230,60 222,65 238,72 222,79 238,86 230,92" fill="none" stroke="#db2777" stroke-width="2.2"/><path fill="none" d="M230 92 V126" stroke="#475569" stroke-width="2"/><text x="244" y="82" fill="#be185d" font-size="10">R_2 = 2 Ω</text>
  <path fill="none" d="M320 46 V76 M306 76 H334 M306 86 H334 M320 86 V126" stroke="#059669" stroke-width="2.4"/><text x="340" y="86" fill="#047857" font-size="10">C = 0.5 F</text>
  <path fill="none" d="M40 102 V126 H320" stroke="#475569" stroke-width="2"/>`,
);
