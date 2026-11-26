// The inline SVGs of the W4-L6 lesson sheet (docs/lessons/W4-L6.md), copied from the sheet by a
// script, not retyped: the five act diagrams and the five step diagrams of the guided-example JSON.
// They are drawn for a dark canvas; svgs.ts recolours them for the light theme and adjusts them.

export const SHEET_ACT1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 340" width="880" height="340">
  <rect x="0" y="0" width="880" height="340" rx="12" fill="#0F172A"/>
  <text x="440" y="34" text-anchor="middle" fill="#F8FAFC" font-family="sans-serif" font-size="18" font-weight="bold">Act 1：二阶电路 6 个边界值与“守恒 vs 跃变”物理边界</text>

  <!-- Left Card: State Variables (Continuous) -->
  <rect x="28" y="56" width="265" height="256" rx="10" fill="#1E293B" stroke="#34D399" stroke-width="2"/>
  <text x="160" y="84" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="15" font-weight="bold">状态守恒量（不可跃变）</text>
  <line x1="48" y1="96" x2="273" y2="96" stroke="#334155" stroke-width="1"/>
  <text x="48" y="122" fill="#E2E8F0" font-family="sans-serif" font-size="13" font-weight="bold">1. 电容电压 v_C(t)</text>
  <text x="48" y="144" fill="#94A3B8" font-family="monospace" font-size="13">v_C(0⁺) = v_C(0⁻)</text>
  <!-- Continuous waveform -->
  <line x1="50" y1="184" x2="265" y2="184" stroke="#475569" stroke-width="1"/>
  <line x1="145" y1="154" x2="145" y2="192" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="4,3"/>
  <path d="M 55 168 L 145 168 Q 185 168 255 156" fill="none" stroke="#34D399" stroke-width="2.5"/>
  <circle cx="145" cy="168" r="4" fill="#34D399"/>
  <text x="150" y="196" fill="#F59E0B" font-family="sans-serif" font-size="11">t = 0（连续平滑衔接）</text>

  <text x="48" y="226" fill="#E2E8F0" font-family="sans-serif" font-size="13" font-weight="bold">2. 电感电流 i_L(t)</text>
  <text x="48" y="248" fill="#94A3B8" font-family="monospace" font-size="13">i_L(0⁺) = i_L(0⁻)</text>
  <line x1="50" y1="286" x2="265" y2="286" stroke="#475569" stroke-width="1"/>
  <line x1="145" y1="256" x2="145" y2="294" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="4,3"/>
  <path d="M 55 274 L 145 274 Q 185 274 255 262" fill="none" stroke="#A78BFA" stroke-width="2.5"/>
  <circle cx="145" cy="274" r="4" fill="#A78BFA"/>
  <text x="150" y="298" fill="#94A3B8" font-family="sans-serif" font-size="11">磁场储能连续，零秒不跳变</text>

  <!-- Middle Card: Non-State Variables (Can Jump!) -->
  <rect x="312" y="56" width="265" height="256" rx="10" fill="#1E293B" stroke="#F43F5E" stroke-width="2"/>
  <text x="444" y="84" text-anchor="middle" fill="#F43F5E" font-family="sans-serif" font-size="15" font-weight="bold">非状态变量（允许跃变！）</text>
  <line x1="332" y1="96" x2="557" y2="96" stroke="#334155" stroke-width="1"/>
  <text x="332" y="122" fill="#E2E8F0" font-family="sans-serif" font-size="13" font-weight="bold">1. 电容电流 i_C(t)</text>
  <text x="332" y="144" fill="#FDA4AF" font-family="monospace" font-size="13">i_C(0⁺) ≠ i_C(0⁻) = 0</text>
  <!-- Jump waveform -->
  <line x1="334" y1="184" x2="549" y2="184" stroke="#475569" stroke-width="1"/>
  <line x1="429" y1="154" x2="429" y2="192" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="339" y1="184" x2="429" y2="184" stroke="#F43F5E" stroke-width="2.5"/>
  <line x1="429" y1="184" x2="429" y2="158" stroke="#F43F5E" stroke-width="2" stroke-dasharray="3,2"/>
  <path d="M 429 158 Q 475 162 539 180" fill="none" stroke="#F43F5E" stroke-width="2.5"/>
  <circle cx="429" cy="184" r="3.5" fill="#0F172A" stroke="#F43F5E" stroke-width="2"/>
  <circle cx="429" cy="158" r="4" fill="#F43F5E"/>
  <text x="436" y="196" fill="#FDA4AF" font-family="sans-serif" font-size="11">t=0⁺ 瞬间阶跃 ⇒ dv_C/dt ≠ 0</text>

  <text x="332" y="226" fill="#E2E8F0" font-family="sans-serif" font-size="13" font-weight="bold">2. 电感电压 v_L(t)</text>
  <text x="332" y="248" fill="#FDA4AF" font-family="monospace" font-size="13">v_L(0⁺) ≠ v_L(0⁻) = 0</text>
  <line x1="334" y1="286" x2="549" y2="286" stroke="#475569" stroke-width="1"/>
  <line x1="429" y1="256" x2="429" y2="294" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="339" y1="286" x2="429" y2="286" stroke="#F59E0B" stroke-width="2.5"/>
  <line x1="429" y1="286" x2="429" y2="260" stroke="#F59E0B" stroke-width="2" stroke-dasharray="3,2"/>
  <path d="M 429 260 Q 475 264 539 282" fill="none" stroke="#F59E0B" stroke-width="2.5"/>
  <circle cx="429" cy="286" r="3.5" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
  <circle cx="429" cy="260" r="4" fill="#F59E0B"/>
  <text x="436" y="298" fill="#FDE68A" font-family="sans-serif" font-size="11">t=0⁺ 瞬间阶跃 ⇒ di_L/dt ≠ 0</text>

  <!-- Right Card: 6 Boundary Values Target -->
  <rect x="596" y="56" width="256" height="256" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
  <text x="724" y="84" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="15" font-weight="bold">必须锁死的 6 个边界值</text>
  <line x1="616" y1="96" x2="832" y2="96" stroke="#334155" stroke-width="1"/>
  <rect x="614" y="108" width="220" height="54" rx="6" fill="#0F172A" stroke="#34D399" stroke-width="1"/>
  <text x="626" y="128" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">快照 1：t = 0⁻（定状态初值）</text>
  <text x="626" y="150" fill="#F8FAFC" font-family="monospace" font-size="13">① v_C(0⁺)   ② i_L(0⁺)</text>

  <rect x="614" y="174" width="220" height="62" rx="6" fill="#0F172A" stroke="#F59E0B" stroke-width="1"/>
  <text x="626" y="194" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">快照 2：t = 0⁺（定导数初值）</text>
  <text x="626" y="214" fill="#F8FAFC" font-family="monospace" font-size="12">③ dv_C(0⁺)/dt = i_C(0⁺)/C</text>
  <text x="626" y="230" fill="#F8FAFC" font-family="monospace" font-size="12">④ di_L(0⁺)/dt = v_L(0⁺)/L</text>

  <rect x="614" y="248" width="220" height="54" rx="6" fill="#0F172A" stroke="#38BDF8" stroke-width="1"/>
  <text x="626" y="268" fill="#38BDF8" font-family="sans-serif" font-size="12" font-weight="bold">快照 3：t = ∞（定新稳态终值）</text>
  <text x="626" y="290" fill="#F8FAFC" font-family="monospace" font-size="13">⑤ v_C(∞)    ⑥ i_L(∞)</text>
</svg>`;

export const SHEET_ACT2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 360" width="960" height="360">
  <rect x="0" y="0" width="960" height="360" rx="12" fill="#0F172A"/>
  <text x="480" y="30" text-anchor="middle" fill="#F8FAFC" font-family="sans-serif" font-size="17" font-weight="bold">Act 2：三时刻拍照法三联对比（同一 RLC 电路的等效替换全景）</text>

  <!-- PANEL 1: t = 0- -->
  <rect x="16" y="46" width="300" height="298" rx="10" fill="#1E293B" stroke="#34D399" stroke-width="2"/>
  <text x="166" y="70" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="14" font-weight="bold">01 | t = 0⁻ 稳态拍照</text>
  <text x="166" y="88" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="11">开关 S 闭合 | C→开路 | L→短路</text>
  <!-- Circuit 1 -->
  <!-- Ground rail -->
  <line x1="46" y1="262" x2="286" y2="262" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Vs -->
  <line x1="46" y1="262" x2="46" y2="205" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="46" cy="185" r="20" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
  <text x="46" y="180" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">+</text>
  <text x="46" y="198" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">-</text>
  <text x="26" y="190" text-anchor="end" fill="#FDE68A" font-family="sans-serif" font-size="11">V_s</text>
  <line x1="46" y1="165" x2="46" y2="122" stroke="#E2E8F0" stroke-width="2"/>
  <!-- R1 -->
  <line x1="46" y1="122" x2="72" y2="122" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="72" y="114" width="42" height="16" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="93" y="108" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₁</text>
  <!-- L replaced by SHORT -->
  <line x1="114" y1="122" x2="184" y2="122" stroke="#A78BFA" stroke-width="3"/>
  <polygon points="156,117 166,122 156,127" fill="#A78BFA"/>
  <text x="149" y="110" text-anchor="middle" fill="#A78BFA" font-family="sans-serif" font-size="11" font-weight="bold">L短路 i_L(0⁻)</text>
  <!-- Top node to branches -->
  <line x1="184" y1="122" x2="286" y2="122" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="184" cy="122" r="3" fill="#E2E8F0"/>
  <!-- Branch 1: R2 -->
  <line x1="184" y1="122" x2="184" y2="162" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="176" y="162" width="16" height="46" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="166" y="189" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₂</text>
  <line x1="184" y1="208" x2="184" y2="262" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Branch 2: S closed + R3 -->
  <circle cx="232" cy="122" r="3" fill="#E2E8F0"/>
  <line x1="232" y1="122" x2="232" y2="162" stroke="#34D399" stroke-width="2"/>
  <text x="232" y="146" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="10">S闭</text>
  <rect x="224" y="162" width="16" height="46" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="218" y="189" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₃</text>
  <line x1="232" y1="208" x2="232" y2="262" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Branch 3: C replaced by OPEN -->
  <line x1="286" y1="122" x2="286" y2="168" stroke="#34D399" stroke-width="2"/>
  <circle cx="286" cy="168" r="3.5" fill="#0F172A" stroke="#34D399" stroke-width="2"/>
  <circle cx="286" cy="210" r="3.5" fill="#0F172A" stroke="#34D399" stroke-width="2"/>
  <line x1="286" y1="210" x2="286" y2="262" stroke="#34D399" stroke-width="2"/>
  <text x="276" y="176" text-anchor="end" fill="#34D399" font-family="sans-serif" font-size="11">+</text>
  <text x="276" y="210" text-anchor="end" fill="#34D399" font-family="sans-serif" font-size="11">-</text>
  <text x="286" y="193" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="10" font-weight="bold">v_C(0⁻)</text>
  <!-- Bottom summary -->
  <rect x="30" y="280" width="272" height="52" rx="6" fill="#0F172A"/>
  <text x="166" y="301" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">输出：守恒初值 v_C(0⁻), i_L(0⁻)</text>
  <text x="166" y="320" text-anchor="middle" fill="#CBD5E1" font-family="monospace" font-size="11">⇒ v_C(0⁺)=v_C(0⁻), i_L(0⁺)=i_L(0⁻)</text>

  <!-- PANEL 2: t = 0+ -->
  <rect x="330" y="46" width="300" height="298" rx="10" fill="#1E293B" stroke="#F59E0B" stroke-width="2.5"/>
  <text x="480" y="70" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="14" font-weight="bold">02 | t = 0⁺ 冻结替换台（核心！）</text>
  <text x="480" y="88" text-anchor="middle" fill="#FDE68A" font-family="sans-serif" font-size="11">开关 S 已断开 | C→电压源 | L→电流源</text>
  <!-- Circuit 2 -->
  <line x1="360" y1="262" x2="600" y2="262" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Vs -->
  <line x1="360" y1="262" x2="360" y2="205" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="360" cy="185" r="20" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
  <text x="360" y="180" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">+</text>
  <text x="360" y="198" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">-</text>
  <text x="342" y="190" text-anchor="end" fill="#FDE68A" font-family="sans-serif" font-size="11">V_s</text>
  <line x1="360" y1="165" x2="360" y2="122" stroke="#E2E8F0" stroke-width="2"/>
  <!-- R1 -->
  <line x1="360" y1="122" x2="384" y2="122" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="384" y="114" width="38" height="16" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="403" y="108" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₁</text>
  <line x1="422" y1="122" x2="444" y2="122" stroke="#E2E8F0" stroke-width="2"/>
  <!-- L replaced by INDEPENDENT CURRENT SOURCE -->
  <circle cx="464" cy="122" r="18" fill="#0F172A" stroke="#38BDF8" stroke-width="2.5"/>
  <line x1="452" y1="122" x2="472" y2="122" stroke="#38BDF8" stroke-width="2"/>
  <polygon points="468,117 478,122 468,127" fill="#38BDF8"/>
  <text x="464" y="100" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="10" font-weight="bold">i_L(0⁺)电流源</text>
  <text x="446" y="150" fill="#F43F5E" font-family="sans-serif" font-size="10" font-weight="bold">+ v_L(0⁺) -</text>
  <line x1="482" y1="122" x2="594" y2="122" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="512" cy="122" r="3" fill="#E2E8F0"/>
  <!-- Branch 1: R2 -->
  <line x1="512" y1="122" x2="512" y2="162" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="504" y="162" width="16" height="46" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="498" y="189" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₂</text>
  <line x1="512" y1="208" x2="512" y2="262" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Branch 2: S OPEN (disconnected) -->
  <line x1="548" y1="122" x2="548" y2="140" stroke="#64748B" stroke-width="1.5" stroke-dasharray="3,2"/>
  <line x1="548" y1="140" x2="558" y2="156" stroke="#F43F5E" stroke-width="2"/>
  <text x="550" y="176" text-anchor="middle" fill="#F43F5E" font-family="sans-serif" font-size="10">S断开</text>
  <!-- Branch 3: C replaced by INDEPENDENT VOLTAGE SOURCE -->
  <line x1="594" y1="122" x2="594" y2="168" stroke="#E2E8F0" stroke-width="2"/>
  <!-- i_C(0+) arrow downward into + -->
  <polygon points="589,144 599,144 594,154" fill="#F43F5E"/>
  <text x="586" y="148" text-anchor="end" fill="#F43F5E" font-family="sans-serif" font-size="10" font-weight="bold">i_C(0⁺)</text>
  <circle cx="594" cy="188" r="20" fill="#0F172A" stroke="#34D399" stroke-width="2.5"/>
  <text x="594" y="182" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">+</text>
  <text x="594" y="201" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">-</text>
  <text x="594" y="222" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="10" font-weight="bold">v_C(0⁺)电压源</text>
  <line x1="594" y1="208" x2="594" y2="262" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Bottom summary -->
  <rect x="344" y="280" width="272" height="52" rx="6" fill="#0F172A"/>
  <text x="480" y="301" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">输出：i_C(0⁺), v_L(0⁺)（纯电阻求解）</text>
  <text x="480" y="320" text-anchor="middle" fill="#FDE68A" font-family="monospace" font-size="11">⇒ dv_C/dt=i_C/C, di_L/dt=v_L/L</text>

  <!-- PANEL 3: t = inf -->
  <rect x="644" y="46" width="300" height="298" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
  <text x="794" y="70" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="14" font-weight="bold">03 | t = ∞ 新稳态拍照</text>
  <text x="794" y="88" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="11">开关 S 保持断开 | C→开路 | L→短路</text>
  <!-- Circuit 3 -->
  <line x1="674" y1="262" x2="914" y2="262" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Vs -->
  <line x1="674" y1="262" x2="674" y2="205" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="674" cy="185" r="20" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
  <text x="674" y="180" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">+</text>
  <text x="674" y="198" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">-</text>
  <text x="656" y="190" text-anchor="end" fill="#FDE68A" font-family="sans-serif" font-size="11">V_s</text>
  <line x1="674" y1="165" x2="674" y2="122" stroke="#E2E8F0" stroke-width="2"/>
  <!-- R1 -->
  <line x1="674" y1="122" x2="700" y2="122" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="700" y="114" width="42" height="16" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="721" y="108" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₁</text>
  <!-- L replaced by SHORT -->
  <line x1="742" y1="122" x2="826" y2="122" stroke="#A78BFA" stroke-width="3"/>
  <polygon points="790,117 800,122 790,127" fill="#A78BFA"/>
  <text x="784" y="110" text-anchor="middle" fill="#A78BFA" font-family="sans-serif" font-size="11" font-weight="bold">L短路 i_L(∞)</text>
  <line x1="826" y1="122" x2="914" y2="122" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="826" cy="122" r="3" fill="#E2E8F0"/>
  <!-- Branch 1: R2 -->
  <line x1="826" y1="122" x2="826" y2="162" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="818" y="162" width="16" height="46" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="810" y="189" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₂</text>
  <line x1="826" y1="208" x2="826" y2="262" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Branch 2: C replaced by OPEN -->
  <line x1="914" y1="122" x2="914" y2="168" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="914" cy="168" r="3.5" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="914" cy="210" r="3.5" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
  <line x1="914" y1="210" x2="914" y2="262" stroke="#38BDF8" stroke-width="2"/>
  <text x="904" y="176" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="11">+</text>
  <text x="904" y="210" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="11">-</text>
  <text x="888" y="193" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="10" font-weight="bold">v_C(∞)</text>
  <!-- Bottom summary -->
  <rect x="658" y="280" width="272" height="52" rx="6" fill="#0F172A"/>
  <text x="794" y="301" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="12" font-weight="bold">输出：新稳态终值 v_C(∞), i_L(∞)</text>
  <text x="794" y="320" text-anchor="middle" fill="#CBD5E1" font-family="monospace" font-size="11">新稳态：dv_C(∞)/dt=0, di_L(∞)/dt=0</text>
</svg>`;

export const SHEET_ACT3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 320" width="960" height="320">
  <rect x="0" y="0" width="960" height="320" rx="12" fill="#0F172A"/>
  <text x="480" y="28" text-anchor="middle" fill="#F8FAFC" font-family="sans-serif" font-size="16" font-weight="bold">Act 3 例题一（串联主干 SPDT RLC）：t=0⁻、t=0⁺（替换源）、t=∞ 三联图</text>

  <!-- Panel 1: t=0- -->
  <rect x="16" y="44" width="300" height="260" rx="8" fill="#1E293B" stroke="#34D399" stroke-width="1.8"/>
  <text x="166" y="66" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="13" font-weight="bold">t = 0⁻（开关接 a：V₁=12V）</text>
  <line x1="48" y1="242" x2="284" y2="242" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="48" y1="242" x2="48" y2="196" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="48" cy="176" r="20" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
  <text x="48" y="172" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">+</text>
  <text x="48" y="190" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">-</text>
  <text x="48" y="216" text-anchor="middle" fill="#FDE68A" font-family="sans-serif" font-size="10">V₁=12V</text>
  <line x1="48" y1="156" x2="48" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="48" y1="114" x2="78" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="78" y="106" width="44" height="16" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="100" y="99" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₁=6Ω</text>
  <line x1="122" y1="114" x2="210" y2="114" stroke="#A78BFA" stroke-width="3"/>
  <polygon points="164,109 174,114 164,119" fill="#A78BFA"/>
  <text x="166" y="100" text-anchor="middle" fill="#A78BFA" font-family="sans-serif" font-size="11" font-weight="bold">L短路 i_L(0⁻)</text>
  <line x1="210" y1="114" x2="284" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="210" cy="114" r="3" fill="#E2E8F0"/>
  <line x1="210" y1="114" x2="210" y2="152" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="202" y="152" width="16" height="48" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="195" y="180" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₂=6Ω</text>
  <line x1="210" y1="200" x2="210" y2="242" stroke="#E2E8F0" stroke-width="2"/>
  <!-- C open -->
  <line x1="284" y1="114" x2="284" y2="156" stroke="#34D399" stroke-width="2"/>
  <circle cx="284" cy="156" r="3.5" fill="#0F172A" stroke="#34D399" stroke-width="2"/>
  <circle cx="284" cy="198" r="3.5" fill="#0F172A" stroke="#34D399" stroke-width="2"/>
  <line x1="284" y1="198" x2="284" y2="242" stroke="#34D399" stroke-width="2"/>
  <text x="274" y="164" text-anchor="end" fill="#34D399" font-family="sans-serif" font-size="11">+</text>
  <text x="274" y="200" text-anchor="end" fill="#34D399" font-family="sans-serif" font-size="11">-</text>
  <text x="266" y="182" text-anchor="end" fill="#34D399" font-family="sans-serif" font-size="10" font-weight="bold">v_C(0⁻)</text>
  <text x="166" y="276" text-anchor="middle" fill="#34D399" font-family="monospace" font-size="12">i_L(0⁻)=1A, v_C(0⁻)=6V</text>

  <!-- Panel 2: t=0+ -->
  <rect x="330" y="44" width="300" height="260" rx="8" fill="#1E293B" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="480" y="66" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="13" font-weight="bold">t = 0⁺（开关切 b：V₂=30V）</text>
  <line x1="362" y1="242" x2="598" y2="242" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="362" y1="242" x2="362" y2="196" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="362" cy="176" r="20" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
  <text x="362" y="172" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">+</text>
  <text x="362" y="190" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">-</text>
  <text x="362" y="216" text-anchor="middle" fill="#FDE68A" font-family="sans-serif" font-size="10">V₂=30V</text>
  <line x1="362" y1="156" x2="362" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="362" y1="114" x2="386" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="386" y="106" width="40" height="16" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="406" y="99" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₁=6Ω</text>
  <line x1="426" y1="114" x2="446" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <!-- L -> 1A current source -->
  <circle cx="464" cy="114" r="18" fill="#0F172A" stroke="#38BDF8" stroke-width="2.2"/>
  <line x1="452" y1="114" x2="472" y2="114" stroke="#38BDF8" stroke-width="2"/>
  <polygon points="468,109 478,114 468,119" fill="#38BDF8"/>
  <text x="464" y="91" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="10" font-weight="bold">i_L(0⁺)=1A</text>
  <text x="464" y="144" text-anchor="middle" fill="#F43F5E" font-family="sans-serif" font-size="10" font-weight="bold">+ v_L(0⁺) -</text>
  <line x1="482" y1="114" x2="598" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="524" cy="114" r="3" fill="#E2E8F0"/>
  <line x1="524" y1="114" x2="524" y2="152" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="516" y="152" width="16" height="48" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="510" y="180" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₂=6Ω</text>
  <line x1="524" y1="200" x2="524" y2="242" stroke="#E2E8F0" stroke-width="2"/>
  <!-- C -> 6V voltage source -->
  <line x1="598" y1="114" x2="598" y2="156" stroke="#E2E8F0" stroke-width="2"/>
  <polygon points="593,134 603,134 598,144" fill="#F43F5E"/>
  <text x="589" y="139" text-anchor="end" fill="#F43F5E" font-family="sans-serif" font-size="10">i_C(0⁺)</text>
  <circle cx="598" cy="176" r="20" fill="#0F172A" stroke="#34D399" stroke-width="2.2"/>
  <text x="598" y="172" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">+</text>
  <text x="598" y="190" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">-</text>
  <text x="598" y="214" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="10" font-weight="bold">6V</text>
  <line x1="598" y1="196" x2="598" y2="242" stroke="#E2E8F0" stroke-width="2"/>
  <text x="480" y="276" text-anchor="middle" fill="#F59E0B" font-family="monospace" font-size="11">v_L(0⁺)=18V, i_C(0⁺)=0A</text>
  <text x="480" y="294" text-anchor="middle" fill="#FDE68A" font-family="monospace" font-size="11">di_L/dt=36A/s, dv_C/dt=0</text>

  <!-- Panel 3: t=inf -->
  <rect x="644" y="44" width="300" height="260" rx="8" fill="#1E293B" stroke="#38BDF8" stroke-width="1.8"/>
  <text x="794" y="66" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="13" font-weight="bold">t = ∞（新稳态：V₂=30V）</text>
  <line x1="676" y1="242" x2="912" y2="242" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="676" y1="242" x2="676" y2="196" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="676" cy="176" r="20" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
  <text x="676" y="172" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">+</text>
  <text x="676" y="190" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">-</text>
  <text x="676" y="216" text-anchor="middle" fill="#FDE68A" font-family="sans-serif" font-size="10">V₂=30V</text>
  <line x1="676" y1="156" x2="676" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="676" y1="114" x2="706" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="706" y="106" width="44" height="16" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="728" y="99" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₁=6Ω</text>
  <line x1="750" y1="114" x2="838" y2="114" stroke="#A78BFA" stroke-width="3"/>
  <polygon points="792,109 802,114 792,119" fill="#A78BFA"/>
  <text x="794" y="100" text-anchor="middle" fill="#A78BFA" font-family="sans-serif" font-size="11" font-weight="bold">L短路 i_L(∞)</text>
  <line x1="838" y1="114" x2="912" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="838" cy="114" r="3" fill="#E2E8F0"/>
  <line x1="838" y1="114" x2="838" y2="152" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="830" y="152" width="16" height="48" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="823" y="180" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="11">R₂=6Ω</text>
  <line x1="838" y1="200" x2="838" y2="242" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="912" y1="114" x2="912" y2="156" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="912" cy="156" r="3.5" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="912" cy="198" r="3.5" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
  <line x1="912" y1="198" x2="912" y2="242" stroke="#38BDF8" stroke-width="2"/>
  <text x="902" y="164" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="11">+</text>
  <text x="902" y="200" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="11">-</text>
  <text x="894" y="182" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="10" font-weight="bold">v_C(∞)</text>
  <text x="794" y="276" text-anchor="middle" fill="#38BDF8" font-family="monospace" font-size="12">i_L(∞)=2.5A, v_C(∞)=15V</text>
</svg>`;

export const SHEET_ACT4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 350" width="960" height="350">
  <rect x="0" y="0" width="960" height="350" rx="12" fill="#0F172A"/>
  <text x="480" y="28" text-anchor="middle" fill="#F8FAFC" font-family="sans-serif" font-size="16" font-weight="bold">Act 4 例题二（混合型双电源 RLC，S在t=0闭合）：三时刻等效替换图</text>

  <!-- Panel 1: t=0- (S open) -->
  <rect x="14" y="44" width="302" height="292" rx="8" fill="#1E293B" stroke="#34D399" stroke-width="1.8"/>
  <text x="165" y="66" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="13" font-weight="bold">t = 0⁻（S断开，左右解耦）</text>
  <line x1="36" y1="258" x2="296" y2="258" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Left half: Vs, R1, Node A, R2+L(short) -->
  <line x1="36" y1="258" x2="36" y2="206" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="36" cy="188" r="18" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
  <text x="36" y="184" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="11">+</text>
  <text x="36" y="200" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="11">-</text>
  <text x="36" y="220" text-anchor="middle" fill="#FDE68A" font-family="sans-serif" font-size="9">24V</text>
  <line x1="36" y1="170" x2="36" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="50" y="106" width="36" height="16" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="36" y1="114" x2="50" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="86" y1="114" x2="116" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <text x="68" y="99" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="10">R₁=4Ω</text>
  <circle cx="116" cy="114" r="3.5" fill="#F59E0B"/>
  <text x="116" y="102" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="10" font-weight="bold">A</text>
  <!-- R2 + L short -->
  <line x1="116" y1="114" x2="116" y2="138" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="108" y="138" width="16" height="38" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="102" y="160" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="10">R₂=4Ω</text>
  <line x1="116" y1="176" x2="116" y2="258" stroke="#A78BFA" stroke-width="3"/>
  <polygon points="111,212 121,212 116,222" fill="#A78BFA"/>
  <text x="124" y="218" fill="#A78BFA" font-family="sans-serif" font-size="9" font-weight="bold">L短 i_L</text>
  <!-- Open switch between A and B -->
  <line x1="116" y1="114" x2="146" y2="114" stroke="#64748B" stroke-width="1.5" stroke-dasharray="3,2"/>
  <line x1="146" y1="114" x2="168" y2="98" stroke="#F43F5E" stroke-width="2"/>
  <text x="164" y="132" text-anchor="middle" fill="#F43F5E" font-family="sans-serif" font-size="9">S断开</text>
  <!-- Right half: Node B, R4, Is, C(open) -->
  <circle cx="212" cy="114" r="3.5" fill="#38BDF8"/>
  <text x="212" y="102" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="10" font-weight="bold">B</text>
  <line x1="212" y1="114" x2="296" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Is -->
  <line x1="212" y1="114" x2="212" y2="170" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="212" cy="188" r="18" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
  <line x1="212" y1="200" x2="212" y2="180" stroke="#38BDF8" stroke-width="2"/>
  <polygon points="207,183 217,183 212,174" fill="#38BDF8"/>
  <text x="190" y="192" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="9">6A</text>
  <line x1="212" y1="206" x2="212" y2="258" stroke="#E2E8F0" stroke-width="2"/>
  <!-- R4 -->
  <line x1="254" y1="114" x2="254" y2="158" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="246" y="158" width="16" height="44" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="254" y="216" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="9">R₄=6Ω</text>
  <line x1="254" y1="202" x2="254" y2="258" stroke="#E2E8F0" stroke-width="2"/>
  <!-- C open -->
  <line x1="296" y1="114" x2="296" y2="164" stroke="#34D399" stroke-width="2"/>
  <circle cx="296" cy="164" r="3" fill="#0F172A" stroke="#34D399" stroke-width="2"/>
  <circle cx="296" cy="204" r="3" fill="#0F172A" stroke="#34D399" stroke-width="2"/>
  <line x1="296" y1="204" x2="296" y2="258" stroke="#34D399" stroke-width="2"/>
  <text x="288" y="172" text-anchor="end" fill="#34D399" font-family="sans-serif" font-size="10">+</text>
  <text x="288" y="206" text-anchor="end" fill="#34D399" font-family="sans-serif" font-size="10">-</text>
  <text x="286" y="188" text-anchor="end" fill="#34D399" font-family="sans-serif" font-size="9">v_C</text>
  <text x="165" y="288" text-anchor="middle" fill="#34D399" font-family="monospace" font-size="12">i_L(0⁻)=3A, v_C(0⁻)=36V</text>
  <text x="165" y="310" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="11">守恒传递 ⇒ i_L(0⁺)=3A, v_C(0⁺)=36V</text>

  <!-- Panel 2: t=0+ (S closed, replacement sources) -->
  <rect x="328" y="44" width="304" height="292" rx="8" fill="#1E293B" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="480" y="66" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="13" font-weight="bold">t = 0⁺（S闭合，节点法+替换源）</text>
  <line x1="350" y1="258" x2="612" y2="258" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Vs + R1 -->
  <line x1="350" y1="258" x2="350" y2="206" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="350" cy="188" r="18" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
  <text x="350" y="184" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="11">+</text>
  <text x="350" y="200" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="11">-</text>
  <text x="350" y="220" text-anchor="middle" fill="#FDE68A" font-family="sans-serif" font-size="9">24V</text>
  <line x1="350" y1="170" x2="350" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="350" y1="114" x2="364" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="364" y="106" width="34" height="16" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="381" y="99" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="9">4Ω</text>
  <line x1="398" y1="114" x2="426" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Node A -->
  <circle cx="426" cy="114" r="3.5" fill="#F59E0B"/>
  <text x="426" y="101" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="10" font-weight="bold">v_A(0⁺)</text>
  <!-- R2 + L(3A current source) -->
  <line x1="426" y1="114" x2="426" y2="132" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="418" y="132" width="16" height="34" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="412" y="152" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="9">4Ω</text>
  <line x1="426" y1="166" x2="426" y2="184" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="426" cy="202" r="18" fill="#0F172A" stroke="#38BDF8" stroke-width="2.2"/>
  <line x1="426" y1="190" x2="426" y2="210" stroke="#38BDF8" stroke-width="2"/>
  <polygon points="421,207 431,207 426,216" fill="#38BDF8"/>
  <text x="450" y="198" fill="#38BDF8" font-family="sans-serif" font-size="9" font-weight="bold">3A</text>
  <text x="450" y="214" fill="#F43F5E" font-family="sans-serif" font-size="9" font-weight="bold">+v_L-</text>
  <line x1="426" y1="220" x2="426" y2="258" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Closed switch + R3 between A and B -->
  <line x1="426" y1="114" x2="458" y2="114" stroke="#34D399" stroke-width="2"/>
  <rect x="458" y="106" width="38" height="16" fill="#0F172A" stroke="#34D399" stroke-width="2"/>
  <text x="477" y="99" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="9">R₃=4Ω</text>
  <line x1="496" y1="114" x2="526" y2="114" stroke="#34D399" stroke-width="2"/>
  <!-- Node B (clamped to 36V) -->
  <circle cx="526" cy="114" r="3.5" fill="#34D399"/>
  <text x="526" y="101" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="10" font-weight="bold">v_B=36V</text>
  <line x1="526" y1="114" x2="612" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Is=6A -->
  <line x1="526" y1="114" x2="526" y2="170" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="526" cy="188" r="18" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
  <line x1="526" y1="200" x2="526" y2="180" stroke="#38BDF8" stroke-width="2"/>
  <polygon points="521,183 531,183 526,174" fill="#38BDF8"/>
  <text x="504" y="192" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="9">6A</text>
  <line x1="526" y1="206" x2="526" y2="258" stroke="#E2E8F0" stroke-width="2"/>
  <!-- R4=6ohm -->
  <line x1="566" y1="114" x2="566" y2="158" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="558" y="158" width="16" height="44" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="566" y="216" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="9">6Ω</text>
  <line x1="566" y1="202" x2="566" y2="258" stroke="#E2E8F0" stroke-width="2"/>
  <!-- C -> 36V voltage source -->
  <line x1="612" y1="114" x2="612" y2="168" stroke="#E2E8F0" stroke-width="2"/>
  <polygon points="607,138 617,138 612,148" fill="#F43F5E"/>
  <text x="605" y="143" text-anchor="end" fill="#F43F5E" font-family="sans-serif" font-size="9">i_C</text>
  <circle cx="612" cy="188" r="18" fill="#0F172A" stroke="#34D399" stroke-width="2.2"/>
  <text x="612" y="184" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="11">+</text>
  <text x="612" y="200" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="11">-</text>
  <text x="612" y="220" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="9" font-weight="bold">36V</text>
  <line x1="612" y1="206" x2="612" y2="258" stroke="#E2E8F0" stroke-width="2"/>
  <text x="480" y="286" text-anchor="middle" fill="#F59E0B" font-family="monospace" font-size="11">v_A(0⁺)=24V ⇒ v_L=12V, i_C=-3A</text>
  <text x="480" y="308" text-anchor="middle" fill="#FDE68A" font-family="monospace" font-size="11">di_L/dt=+24A/s, dv_C/dt=-12V/s</text>

  <!-- Panel 3: t=inf (S closed, L short, C open) -->
  <rect x="644" y="44" width="302" height="292" rx="8" fill="#1E293B" stroke="#38BDF8" stroke-width="1.8"/>
  <text x="795" y="66" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="13" font-weight="bold">t = ∞（S闭合新稳态）</text>
  <line x1="666" y1="258" x2="926" y2="258" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Vs + R1 -->
  <line x1="666" y1="258" x2="666" y2="206" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="666" cy="188" r="18" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
  <text x="666" y="184" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="11">+</text>
  <text x="666" y="200" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="11">-</text>
  <text x="666" y="220" text-anchor="middle" fill="#FDE68A" font-family="sans-serif" font-size="9">24V</text>
  <line x1="666" y1="170" x2="666" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="666" y1="114" x2="680" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="680" y="106" width="34" height="16" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="697" y="99" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="9">4Ω</text>
  <line x1="714" y1="114" x2="742" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Node A(inf) -->
  <circle cx="742" cy="114" r="3.5" fill="#F59E0B"/>
  <text x="742" y="101" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="10" font-weight="bold">v_A(∞)</text>
  <!-- R2 + L short -->
  <line x1="742" y1="114" x2="742" y2="138" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="734" y="138" width="16" height="38" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="728" y="160" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="9">4Ω</text>
  <line x1="742" y1="176" x2="742" y2="258" stroke="#A78BFA" stroke-width="3"/>
  <polygon points="737,212 747,212 742,222" fill="#A78BFA"/>
  <text x="750" y="218" fill="#A78BFA" font-family="sans-serif" font-size="9" font-weight="bold">i_L(∞)</text>
  <!-- R3 -->
  <line x1="742" y1="114" x2="774" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="774" y="106" width="38" height="16" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="793" y="99" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="9">4Ω</text>
  <line x1="812" y1="114" x2="842" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Node B(inf) -->
  <circle cx="842" cy="114" r="3.5" fill="#38BDF8"/>
  <text x="842" y="101" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="10" font-weight="bold">v_B(∞)</text>
  <line x1="842" y1="114" x2="926" y2="114" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Is=6A -->
  <line x1="842" y1="114" x2="842" y2="170" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="842" cy="188" r="18" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
  <line x1="842" y1="200" x2="842" y2="180" stroke="#38BDF8" stroke-width="2"/>
  <polygon points="837,183 847,183 842,174" fill="#38BDF8"/>
  <text x="820" y="192" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="9">6A</text>
  <line x1="842" y1="206" x2="842" y2="258" stroke="#E2E8F0" stroke-width="2"/>
  <!-- R4=6ohm -->
  <line x1="882" y1="114" x2="882" y2="158" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="874" y="158" width="16" height="44" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
  <text x="882" y="216" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="9">6Ω</text>
  <line x1="882" y1="202" x2="882" y2="258" stroke="#E2E8F0" stroke-width="2"/>
  <!-- C open -->
  <line x1="926" y1="114" x2="926" y2="164" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="926" cy="164" r="3" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
  <circle cx="926" cy="204" r="3" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
  <line x1="926" y1="204" x2="926" y2="258" stroke="#38BDF8" stroke-width="2"/>
  <text x="918" y="172" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="10">+</text>
  <text x="918" y="206" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="10">-</text>
  <text x="914" y="188" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="9">v_C</text>
  <text x="795" y="286" text-anchor="middle" fill="#38BDF8" font-family="monospace" font-size="11">v_A(∞)=16V, v_B(∞)=24V</text>
  <text x="795" y="308" text-anchor="middle" fill="#CBD5E1" font-family="monospace" font-size="11">i_L(∞)=4A, v_C(∞)=24V</text>
</svg>`;

export const SHEET_ACT5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 250" width="640" height="250">
  <rect x="0" y="0" width="640" height="250" rx="12" fill="#0F172A"/>
  <text x="320" y="26" text-anchor="middle" fill="#F8FAFC" font-family="sans-serif" font-size="15" font-weight="bold">Act 5 交互引导例题：开关 S 在 t=0 断开的二阶 RLC 电路</text>
  <!-- Ground rail -->
  <line x1="70" y1="205" x2="560" y2="205" stroke="#E2E8F0" stroke-width="2.2"/>
  <!-- Vs = 36V -->
  <line x1="70" y1="205" x2="70" y2="155" stroke="#E2E8F0" stroke-width="2.2"/>
  <circle cx="70" cy="133" r="22" fill="#0F172A" stroke="#F59E0B" stroke-width="2.2"/>
  <text x="70" y="128" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="13" font-weight="bold">+</text>
  <text x="70" y="148" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="13" font-weight="bold">-</text>
  <text x="42" y="138" text-anchor="end" fill="#FDE68A" font-family="sans-serif" font-size="12" font-weight="bold">36V</text>
  <line x1="70" y1="111" x2="70" y2="68" stroke="#E2E8F0" stroke-width="2.2"/>
  <!-- R1 = 6ohm -->
  <line x1="70" y1="68" x2="118" y2="68" stroke="#E2E8F0" stroke-width="2.2"/>
  <rect x="118" y="58" width="56" height="20" fill="#0F172A" stroke="#E2E8F0" stroke-width="2.2"/>
  <text x="146" y="50" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="12">R₁ = 6Ω</text>
  <line x1="174" y1="68" x2="216" y2="68" stroke="#E2E8F0" stroke-width="2.2"/>
  <!-- Inductor L = 0.25H -->
  <path d="M 216 68 Q 226 48 236 68 Q 246 48 256 68 Q 266 48 276 68 Q 286 48 296 68" fill="none" stroke="#A78BFA" stroke-width="2.6"/>
  <text x="256" y="48" text-anchor="middle" fill="#A78BFA" font-family="sans-serif" font-size="12" font-weight="bold">L = 0.25H</text>
  <polygon points="310,63 320,68 310,73" fill="#A78BFA"/>
  <text x="315" y="54" text-anchor="middle" fill="#A78BFA" font-family="sans-serif" font-size="11">i_L</text>
  <line x1="296" y1="68" x2="560" y2="68" stroke="#E2E8F0" stroke-width="2.2"/>
  <!-- Node B -->
  <circle cx="360" cy="68" r="4" fill="#38BDF8"/>
  <text x="360" y="53" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="12" font-weight="bold">节点 B</text>
  <!-- Branch 1: R2 = 6ohm -->
  <line x1="360" y1="68" x2="360" y2="112" stroke="#E2E8F0" stroke-width="2.2"/>
  <rect x="350" y="112" width="20" height="54" fill="#0F172A" stroke="#E2E8F0" stroke-width="2.2"/>
  <text x="342" y="143" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="12">R₂ = 6Ω</text>
  <line x1="360" y1="166" x2="360" y2="205" stroke="#E2E8F0" stroke-width="2.2"/>
  <!-- Branch 2: Switch S (opens at t=0) + R3 = 6ohm -->
  <circle cx="460" cy="68" r="3.5" fill="#E2E8F0"/>
  <line x1="460" y1="68" x2="460" y2="86" stroke="#E2E8F0" stroke-width="2.2"/>
  <circle cx="460" cy="86" r="3" fill="#F43F5E"/>
  <line x1="460" y1="86" x2="478" y2="108" stroke="#F43F5E" stroke-width="2.4"/>
  <circle cx="460" cy="114" r="3" fill="#F43F5E"/>
  <text x="484" y="100" fill="#F43F5E" font-family="sans-serif" font-size="11" font-weight="bold">S (t=0 断开)</text>
  <line x1="460" y1="114" x2="460" y2="128" stroke="#E2E8F0" stroke-width="2.2"/>
  <rect x="450" y="128" width="20" height="46" fill="#0F172A" stroke="#E2E8F0" stroke-width="2.2"/>
  <text x="442" y="155" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="12">R₃ = 6Ω</text>
  <line x1="460" y1="174" x2="460" y2="205" stroke="#E2E8F0" stroke-width="2.2"/>
  <!-- Branch 3: Capacitor C = 0.5F -->
  <line x1="560" y1="68" x2="560" y2="126" stroke="#34D399" stroke-width="2.2"/>
  <line x1="544" y1="126" x2="576" y2="126" stroke="#34D399" stroke-width="3"/>
  <line x1="544" y1="142" x2="576" y2="142" stroke="#34D399" stroke-width="3"/>
  <line x1="560" y1="142" x2="560" y2="205" stroke="#34D399" stroke-width="2.2"/>
  <text x="582" y="124" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">+</text>
  <text x="582" y="152" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">-</text>
  <text x="584" y="139" fill="#34D399" font-family="sans-serif" font-size="11" font-weight="bold">v_C</text>
  <text x="560" y="230" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="12">C = 0.5F</text>
</svg>`;

export const SHEET_MINI1 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 110" width="300" height="110"><rect x="0" y="0" width="300" height="110" rx="8" fill="#0F172A"/><text x="150" y="22" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">t=0⁻: R_p = R₂∥R₃ = 3Ω</text><line x1="25" y1="86" x2="275" y2="86" stroke="#E2E8F0" stroke-width="2"/><line x1="25" y1="86" x2="25" y2="44" stroke="#F59E0B" stroke-width="2"/><text x="32" y="68" fill="#FDE68A" font-family="sans-serif" font-size="11">36V</text><line x1="25" y1="44" x2="120" y2="44" stroke="#E2E8F0" stroke-width="2"/><rect x="62" y="36" width="36" height="16" fill="#1E293B" stroke="#E2E8F0" stroke-width="1.5"/><text x="80" y="48" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="10">6Ω</text><line x1="120" y1="44" x2="185" y2="44" stroke="#A78BFA" stroke-width="3"/><text x="152" y="36" text-anchor="middle" fill="#A78BFA" font-family="sans-serif" font-size="10">L短路 i_L</text><line x1="185" y1="44" x2="255" y2="44" stroke="#E2E8F0" stroke-width="2"/><rect x="177" y="52" width="16" height="26" fill="#1E293B" stroke="#E2E8F0" stroke-width="1.5"/><text x="200" y="69" fill="#E2E8F0" font-family="sans-serif" font-size="10">3Ω</text><line x1="185" y1="78" x2="185" y2="86" stroke="#E2E8F0" stroke-width="2"/><circle cx="255" cy="54" r="3" fill="#0F172A" stroke="#34D399" stroke-width="2"/><circle cx="255" cy="76" r="3" fill="#0F172A" stroke="#34D399" stroke-width="2"/><text x="264" y="68" fill="#34D399" font-family="sans-serif" font-size="10">v_C</text></svg>`;

export const SHEET_MINI2 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 110" width="300" height="110"><rect x="0" y="0" width="300" height="110" rx="8" fill="#0F172A"/><text x="150" y="22" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="12" font-weight="bold">t=0⁺ 冻结替换台</text><circle cx="82" cy="62" r="20" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/><line x1="70" y1="62" x2="90" y2="62" stroke="#38BDF8" stroke-width="2"/><polygon points="86,57 96,62 86,67" fill="#38BDF8"/><text x="82" y="96" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="11">L → 4A 电流源</text><circle cx="218" cy="62" r="20" fill="#1E293B" stroke="#34D399" stroke-width="2"/><text x="218" y="58" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">+</text><text x="218" y="74" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">-</text><text x="218" y="96" text-anchor="middle" fill="#34D399" font-family="sans-serif" font-size="11">C → 12V 电压源</text></svg>`;

export const SHEET_MINI3 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 110" width="300" height="110"><rect x="0" y="0" width="300" height="110" rx="8" fill="#0F172A"/><text x="150" y="20" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="11" font-weight="bold">节点 B (12V) KCL 与左回路 KVL</text><line x1="30" y1="50" x2="260" y2="50" stroke="#E2E8F0" stroke-width="2"/><polygon points="108,45 118,50 108,55" fill="#38BDF8"/><text x="105" y="40" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="10">4A 流入</text><circle cx="170" cy="50" r="3.5" fill="#38BDF8"/><line x1="170" y1="50" x2="170" y2="95" stroke="#E2E8F0" stroke-width="2"/><text x="162" y="80" text-anchor="end" fill="#E2E8F0" font-family="sans-serif" font-size="10">i_R2=12/6=2A</text><line x1="245" y1="50" x2="245" y2="95" stroke="#34D399" stroke-width="2"/><polygon points="240,68 250,68 245,78" fill="#F43F5E"/><text x="254" y="76" fill="#F43F5E" font-family="sans-serif" font-size="10" font-weight="bold">i_C(0⁺)</text></svg>`;

export const SHEET_MINI4 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 96" width="300" height="96"><rect x="0" y="0" width="300" height="96" rx="8" fill="#0F172A"/><rect x="14" y="16" width="128" height="64" rx="6" fill="#1E293B" stroke="#34D399" stroke-width="1.5"/><text x="78" y="42" text-anchor="middle" fill="#34D399" font-family="monospace" font-size="12">dv_C/dt = i_C/C</text><text x="78" y="64" text-anchor="middle" fill="#F8FAFC" font-family="monospace" font-size="12">= 2 / 0.5</text><rect x="158" y="16" width="128" height="64" rx="6" fill="#1E293B" stroke="#A78BFA" stroke-width="1.5"/><text x="222" y="42" text-anchor="middle" fill="#A78BFA" font-family="monospace" font-size="12">di_L/dt = v_L/L</text><text x="222" y="64" text-anchor="middle" fill="#F8FAFC" font-family="monospace" font-size="12">= 0 / 0.25</text></svg>`;

export const SHEET_MINI5 = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 106" width="300" height="106"><rect x="0" y="0" width="300" height="106" rx="8" fill="#0F172A"/><text x="150" y="22" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="12" font-weight="bold">t=∞ 新稳态: R₁(6Ω) + R₂(6Ω)</text><line x1="30" y1="84" x2="270" y2="84" stroke="#E2E8F0" stroke-width="2"/><line x1="30" y1="84" x2="30" y2="44" stroke="#F59E0B" stroke-width="2"/><text x="38" y="68" fill="#FDE68A" font-family="sans-serif" font-size="11">36V</text><line x1="30" y1="44" x2="185" y2="44" stroke="#E2E8F0" stroke-width="2"/><rect x="68" y="36" width="36" height="16" fill="#1E293B" stroke="#E2E8F0" stroke-width="1.5"/><text x="86" y="48" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="10">6Ω</text><line x1="120" y1="44" x2="185" y2="44" stroke="#A78BFA" stroke-width="3"/><rect x="177" y="52" width="16" height="26" fill="#1E293B" stroke="#E2E8F0" stroke-width="1.5"/><text x="200" y="69" fill="#E2E8F0" font-family="sans-serif" font-size="10">6Ω</text><line x1="185" y1="78" x2="185" y2="84" stroke="#E2E8F0" stroke-width="2"/><line x1="185" y1="44" x2="255" y2="44" stroke="#E2E8F0" stroke-width="2"/><circle cx="255" cy="54" r="3" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/><circle cx="255" cy="74" r="3" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/><text x="264" y="68" fill="#38BDF8" font-family="sans-serif" font-size="10">v_C(∞)</text></svg>`;
