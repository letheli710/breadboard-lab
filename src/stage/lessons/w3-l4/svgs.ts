// W3-L4 diagrams. The SHEET_* strings are the lesson sheet's inline SVGs (docs/lessons/W3-L4.md:
// figures 1-1, 2-1, 3-1, 3-2, 4-1, 5-1 and the guided example's five mini_svg), copied as written;
// they are drawn for a dark canvas and go through the shared `lightSvg`. Before that, `fix`
// applies the corrections listed with each export. The added figures (the self-test and its act)
// are drawn here in the same dark sheet style and recoloured the same way.

import { lightSvg } from '../../svgTheme';

const SHEET_FIG11 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 340" width="100%" style="max-width:760px;background:#0f172a;border-radius:12px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arrow-cyan-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrow-amber-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
  </defs>
  <!-- Title -->
  <text x="24" y="34" fill="#f8fafc" font-size="16" font-weight="700">图 1-1 同相放大器标准原理图（Sadiku Fig. 5.16 对应拓扑）</text>
  <text x="24" y="54" fill="#94a3b8" font-size="12">输入直连同相端（+），负反馈网络 R_f 与 R_1 接在反相端（−）</text>

  <!-- Op-Amp Triangle -->
  <polygon points="340,120 340,260 470,190" fill="#1e293b" stroke="#e2e8f0" stroke-width="2.5"/>
  <text x="355" y="160" fill="#f43f5e" font-size="18" font-weight="700">−</text>
  <text x="355" y="232" fill="#34d399" font-size="18" font-weight="700">+</text>
  <text x="382" y="196" fill="#cbd5e1" font-size="13" font-weight="600">Ideal</text>
  <text x="378" y="212" fill="#cbd5e1" font-size="11">Op-Amp</text>

  <!-- Noninverting Input v_i -->
  <line x1="110" y1="226" x2="340" y2="226" stroke="#34d399" stroke-width="2.5"/>
  <circle cx="110" cy="226" r="5" fill="#34d399"/>
  <text x="58" y="231" fill="#34d399" font-size="15" font-weight="700">v_i</text>
  <line x1="210" y1="226" x2="265" y2="226" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-cyan-1)"/>
  <text x="200" y="250" fill="#38bdf8" font-size="12" font-weight="600">i_+ = 0（虚断）</text>
  <text x="275" y="216" fill="#34d399" font-size="12">v_+ = v_i</text>

  <!-- Inverting Node -->
  <line x1="220" y1="154" x2="340" y2="154" stroke="#f43f5e" stroke-width="2.5"/>
  <circle cx="260" cy="154" r="4.5" fill="#f59e0b"/>
  <text x="268" y="144" fill="#f59e0b" font-size="12" font-weight="700">v_− = v_+ = v_i（虚短）</text>
  <text x="278" y="172" fill="#38bdf8" font-size="11">i_− = 0</text>

  <!-- R1 to Ground -->
  <line x1="220" y1="154" x2="220" y2="190" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="208" y="190" width="24" height="58" rx="3" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="172" y="224" fill="#f59e0b" font-size="14" font-weight="700">R_1</text>
  <line x1="220" y1="248" x2="220" y2="288" stroke="#e2e8f0" stroke-width="2"/>
  <!-- Ground symbol -->
  <line x1="202" y1="288" x2="238" y2="288" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="208" y1="295" x2="232" y2="295" stroke="#94a3b8" stroke-width="2"/>
  <line x1="215" y1="302" x2="225" y2="302" stroke="#94a3b8" stroke-width="2"/>
  <text x="244" y="294" fill="#94a3b8" font-size="11">GND (0 V)</text>

  <!-- Feedback Loop Rf -->
  <line x1="260" y1="154" x2="260" y2="86" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="260" y1="86" x2="365" y2="86" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="365" y="74" width="76" height="24" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="394" y="66" fill="#38bdf8" font-size="14" font-weight="700">R_f</text>
  <line x1="441" y1="86" x2="540" y2="86" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="540" y1="86" x2="540" y2="190" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Current i_f arrow -->
  <line x1="495" y1="100" x2="455" y2="100" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-amber-1)"/>
  <text x="456" y="116" fill="#f59e0b" font-size="11">i_f = i_1</text>

  <!-- Output Node v_o -->
  <line x1="470" y1="190" x2="620" y2="190" stroke="#a78bfa" stroke-width="2.5"/>
  <circle cx="540" cy="190" r="4.5" fill="#a78bfa"/>
  <circle cx="620" cy="190" r="5" fill="#a78bfa"/>
  <text x="632" y="195" fill="#a78bfa" font-size="15" font-weight="700">v_o</text>

  <!-- Formula Callout Box -->
  <rect x="520" y="236" width="216" height="76" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="536" y="260" fill="#f8fafc" font-size="13" font-weight="700">核心拓扑特征</text>
  <text x="536" y="280" fill="#34d399" font-size="12">• 输入直连 (+) 端 → R_in → ∞</text>
  <text x="536" y="299" fill="#a78bfa" font-size="12">• 增益 A_v = 1 + R_f / R_1 ≥ 1</text>
</svg>`;

const SHEET_FIG21 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 320" width="100%" style="max-width:760px;background:#0f172a;border-radius:12px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arrow-green-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399"/>
    </marker>
  </defs>
  <text x="24" y="34" fill="#f8fafc" font-size="16" font-weight="700">图 2-1 分压反馈视角解剖：把负反馈网络“拉直”看本质</text>
  <text x="24" y="54" fill="#94a3b8" font-size="12">由于 i_− = 0，R_f 与 R_1 构成标准无载分压器，将 v_o 按比例缩回给 v_−</text>

  <!-- Left panel: Voltage Divider Chain -->
  <rect x="34" y="74" width="290" height="222" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="52" y="98" fill="#a78bfa" font-size="13" font-weight="700">串联分压链（i_− = 0 严格成立）</text>

  <!-- Top node vo -->
  <circle cx="150" cy="118" r="5" fill="#a78bfa"/>
  <text x="164" y="123" fill="#a78bfa" font-size="14" font-weight="700">v_o（输出电压）</text>
  <line x1="150" y1="123" x2="150" y2="140" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="136" y="140" width="28" height="44" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="98" y="167" fill="#38bdf8" font-size="14" font-weight="700">R_f</text>

  <!-- Mid node v- -->
  <line x1="150" y1="184" x2="150" y2="210" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="150" cy="197" r="5" fill="#f59e0b"/>
  <line x1="150" y1="197" x2="295" y2="197" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,4"/>
  <text x="166" y="191" fill="#f59e0b" font-size="13" font-weight="700">抽头 v_−</text>

  <!-- R1 -->
  <rect x="136" y="210" width="28" height="44" rx="3" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="98" y="237" fill="#f59e0b" font-size="14" font-weight="700">R_1</text>
  <line x1="150" y1="254" x2="150" y2="274" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="134" y1="274" x2="166" y2="274" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="140" y1="280" x2="160" y2="280" stroke="#94a3b8" stroke-width="2"/>
  <text x="172" y="280" fill="#94a3b8" font-size="11">GND (0 V)</text>

  <!-- Arrow between panels -->
  <line x1="336" y1="197" x2="394" y2="197" stroke="#34d399" stroke-width="2.5" marker-end="url(#arrow-green-2)"/>
  <text x="342" y="185" fill="#34d399" font-size="12" font-weight="700">虚短锁死</text>
  <text x="338" y="215" fill="#cbd5e1" font-size="11">v_− = v_i</text>

  <!-- Right panel: Intuition & Formula -->
  <rect x="406" y="74" width="324" height="222" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="424" y="100" fill="#f8fafc" font-size="14" font-weight="700">一步看穿的物理直觉</text>
  <text x="424" y="128" fill="#e2e8f0" font-size="13">1. 分压关系：v_− = [ R_1 / (R_1 + R_f) ] · v_o</text>
  <text x="424" y="156" fill="#34d399" font-size="13">2. 虚短约束：v_− = v_+ = v_i</text>
  <text x="424" y="184" fill="#a78bfa" font-size="13" font-weight="700">3. 倒推输出：v_o = [ (R_1 + R_f) / R_1 ] · v_i</text>
  <rect x="424" y="202" width="288" height="76" rx="8" fill="#0f172a" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="440" y="228" fill="#f8fafc" font-size="15" font-weight="700">v_o = ( 1 + R_f / R_1 ) · v_i</text>
  <text x="440" y="250" fill="#f59e0b" font-size="12">物理铁律：R_f ≥ 0 且 R_1 &gt; 0 ⇒ A_v ≥ 1</text>
  <text x="440" y="268" fill="#94a3b8" font-size="11">（同相放大器只能放大或 1:1 跟随，绝不可能衰减！）</text>
</svg>`;

const SHEET_FIG31 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 270" width="100%" style="max-width:760px;background:#0f172a;border-radius:12px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arrow-cyan-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
  </defs>
  <text x="24" y="34" fill="#f8fafc" font-size="16" font-weight="700">图 3-1 极限特例演变：R_f = 0（短路）且 R_1 = ∞（开路）→ 电压跟随器</text>

  <!-- Left: Limit Operation -->
  <rect x="24" y="56" width="286" height="190" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="42" y="82" fill="#f59e0b" font-size="13" font-weight="700">同相放大器（取极限）</text>
  <text x="42" y="114" fill="#e2e8f0" font-size="13">• 反馈电阻 R_f → 0 Ω（直接短接）</text>
  <text x="42" y="142" fill="#e2e8f0" font-size="13">• 接地电阻 R_1 → ∞（彻底移除）</text>
  <text x="42" y="176" fill="#34d399" font-size="14" font-weight="700">A_v = 1 + 0 / ∞ = 1</text>
  <text x="42" y="206" fill="#94a3b8" font-size="12">注：工程上只要 R_f = 0 即可让</text>
  <text x="42" y="224" fill="#94a3b8" font-size="12">v_o = v_− = v_i，移除 R_1 更省功耗</text>

  <!-- Transition Arrow -->
  <line x1="322" y1="150" x2="378" y2="150" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrow-cyan-3)"/>
  <text x="326" y="138" fill="#38bdf8" font-size="12" font-weight="700">简化为</text>

  <!-- Right: Voltage Follower Schematic -->
  <rect x="392" y="56" width="344" height="190" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="410" y="82" fill="#38bdf8" font-size="13" font-weight="700">电压跟随器（Unity-Gain Buffer）</text>

  <!-- Op-Amp -->
  <polygon points="520,122 520,218 614,170" fill="#0f172a" stroke="#e2e8f0" stroke-width="2.5"/>
  <text x="532" y="152" fill="#f43f5e" font-size="16" font-weight="700">−</text>
  <text x="532" y="200" fill="#34d399" font-size="16" font-weight="700">+</text>

  <!-- Input vi -->
  <line x1="430" y1="194" x2="520" y2="194" stroke="#34d399" stroke-width="2.5"/>
  <circle cx="430" cy="194" r="4.5" fill="#34d399"/>
  <text x="406" y="199" fill="#34d399" font-size="14" font-weight="700">v_i</text>
  <text x="444" y="216" fill="#38bdf8" font-size="11">i_+ = 0 (R_in → ∞)</text>

  <!-- Direct feedback wire -->
  <line x1="520" y1="146" x2="486" y2="146" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="486" y1="146" x2="486" y2="104" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="486" y1="104" x2="652" y2="104" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="652" y1="104" x2="652" y2="170" stroke="#f59e0b" stroke-width="2.5"/>
  <text x="524" y="98" fill="#f59e0b" font-size="11" font-weight="700">100% 负反馈短接线</text>

  <!-- Output vo -->
  <line x1="614" y1="170" x2="698" y2="170" stroke="#a78bfa" stroke-width="2.5"/>
  <circle cx="652" cy="170" r="4.5" fill="#a78bfa"/>
  <circle cx="698" cy="170" r="4.5" fill="#a78bfa"/>
  <text x="664" y="196" fill="#a78bfa" font-size="13" font-weight="700">v_o = v_i</text>
  <text x="650" y="214" fill="#94a3b8" font-size="11">(R_out → 0)</text>
</svg>`;

const SHEET_FIG32 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 360" width="100%" style="max-width:760px;background:#0f172a;border-radius:12px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
  <text x="24" y="34" fill="#f8fafc" font-size="16" font-weight="700">图 3-2 带载塌陷 vs 电压跟随器阻抗隔离（V_Th = 5 V, R_Th = 10 kΩ, R_L = 1 kΩ）</text>

  <!-- Left Card: Direct Connection -->
  <rect x="20" y="54" width="348" height="286" rx="10" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="38" y="80" fill="#f43f5e" font-size="14" font-weight="700">A. 直接连接（严重带载塌陷）</text>

  <!-- Source Vth -->
  <circle cx="70" cy="166" r="18" fill="#0f172a" stroke="#e2e8f0" stroke-width="2"/>
  <text x="64" y="162" fill="#e2e8f0" font-size="12" font-weight="700">+</text>
  <text x="65" y="177" fill="#e2e8f0" font-size="12" font-weight="700">−</text>
  <text x="42" y="204" fill="#cbd5e1" font-size="11">V_Th = 5 V</text>
  <!-- Rth -->
  <line x1="70" y1="148" x2="70" y2="116" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="70" y1="116" x2="112" y2="116" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="112" y="106" width="58" height="20" rx="3" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="116" y="100" fill="#f59e0b" font-size="11" font-weight="700">R_Th = 10 kΩ</text>
  <line x1="170" y1="116" x2="250" y2="116" stroke="#e2e8f0" stroke-width="2"/>
  <!-- RL -->
  <line x1="250" y1="116" x2="250" y2="138" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="238" y="138" width="24" height="52" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="2"/>
  <text x="270" y="160" fill="#f43f5e" font-size="12" font-weight="700">R_L = 1 kΩ</text>
  <text x="270" y="178" fill="#f43f5e" font-size="12" font-weight="700">v_L = 0.455 V</text>
  <!-- Return loop -->
  <line x1="250" y1="190" x2="250" y2="220" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="70" y1="184" x2="70" y2="220" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="70" y1="220" x2="250" y2="220" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Bar chart A -->
  <text x="38" y="254" fill="#cbd5e1" font-size="12">负载实得电压占比（仅 9.1%）</text>
  <rect x="38" y="266" width="310" height="20" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1"/>
  <rect x="38" y="266" width="28" height="20" rx="4" fill="#f43f5e"/>
  <text x="74" y="281" fill="#f43f5e" font-size="12" font-weight="700">0.455 V / 5.00 V（暴跌 90.9%）</text>
  <text x="38" y="314" fill="#94a3b8" font-size="11">传感器被抽走 0.455 mA，内阻吃掉 4.545 V</text>

  <!-- Right Card: Buffered Connection -->
  <rect x="392" y="54" width="348" height="286" rx="10" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
  <text x="410" y="80" fill="#34d399" font-size="14" font-weight="700">B. 插入电压跟随器（完美阻抗隔离）</text>

  <!-- Source Vth -->
  <circle cx="432" cy="176" r="16" fill="#0f172a" stroke="#e2e8f0" stroke-width="2"/>
  <text x="427" y="172" fill="#e2e8f0" font-size="11" font-weight="700">+</text>
  <text x="428" y="185" fill="#e2e8f0" font-size="11" font-weight="700">−</text>
  <text x="410" y="210" fill="#cbd5e1" font-size="11">5 V</text>
  <!-- Rth -->
  <line x1="432" y1="160" x2="432" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="432" y1="146" x2="452" y2="146" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="452" y="138" width="42" height="16" rx="3" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <text x="452" y="131" fill="#f59e0b" font-size="10">10 kΩ</text>
  <line x1="494" y1="146" x2="538" y2="146" stroke="#34d399" stroke-width="2"/>
  <text x="498" y="164" fill="#38bdf8" font-size="10">i_+ = 0</text>
  <line x1="432" y1="192" x2="432" y2="218" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="422" y1="218" x2="442" y2="218" stroke="#94a3b8" stroke-width="2"/>

  <!-- Op-Amp Buffer -->
  <polygon points="538,116 538,176 594,146" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="544" y="150" fill="#34d399" font-size="12" font-weight="700">+</text>
  <text x="544" y="132" fill="#f43f5e" font-size="12" font-weight="700">−</text>
  <!-- Feedback wire -->
  <line x1="538" y1="128" x2="522" y2="128" stroke="#f59e0b" stroke-width="2"/>
  <line x1="522" y1="128" x2="522" y2="100" stroke="#f59e0b" stroke-width="2"/>
  <line x1="522" y1="100" x2="616" y2="100" stroke="#f59e0b" stroke-width="2"/>
  <line x1="616" y1="100" x2="616" y2="146" stroke="#f59e0b" stroke-width="2"/>
  <!-- Supply rails note -->
  <line x1="566" y1="104" x2="566" y2="131" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="572" y="114" fill="#a78bfa" font-size="10">±9 V 供电</text>

  <!-- Load RL -->
  <line x1="594" y1="146" x2="660" y2="146" stroke="#34d399" stroke-width="2.5"/>
  <rect x="650" y="156" width="20" height="44" rx="3" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <line x1="660" y1="146" x2="660" y2="156" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="660" y1="200" x2="660" y2="218" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="650" y1="218" x2="670" y2="218" stroke="#94a3b8" stroke-width="2"/>
  <text x="676" y="174" fill="#34d399" font-size="11" font-weight="700">R_L = 1 kΩ</text>
  <text x="676" y="190" fill="#34d399" font-size="11" font-weight="700">v_L = 5.00 V</text>

  <!-- Bar chart B -->
  <text x="410" y="254" fill="#cbd5e1" font-size="12">负载实得电压占比（100% 保真）</text>
  <rect x="410" y="266" width="310" height="20" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1"/>
  <rect x="410" y="266" width="310" height="20" rx="4" fill="#34d399"/>
  <text x="478" y="281" fill="#0f172a" font-size="12" font-weight="700">5.00 V / 5.00 V（完整无损）</text>
  <text x="410" y="314" fill="#94a3b8" font-size="11">传感器零损耗；5.00 mA 负载电流由 ±9 V 电源轨提供</text>
</svg>`;

const SHEET_FIG41 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 340" width="100%" style="max-width:760px;background:#0f172a;border-radius:12px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arrow-amber-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
    <marker id="arrow-cyan-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
  </defs>
  <text x="24" y="34" fill="#f8fafc" font-size="16" font-weight="700">图 4-1 Sadiku Example 5.5（Fig. 5.19）双源混合输入运放电路</text>
  <text x="24" y="54" fill="#94a3b8" font-size="12">已知：V_s1 = 6 V, R_1 = 4 kΩ, R_f = 10 kΩ, V_s2 = 4 V（理想运放，±9 V 供电）</text>

  <!-- Vs1 = 6 V on left -->
  <circle cx="80" cy="212" r="20" fill="#1e293b" stroke="#e2e8f0" stroke-width="2"/>
  <text x="74" y="207" fill="#e2e8f0" font-size="13" font-weight="700">+</text>
  <text x="75" y="224" fill="#e2e8f0" font-size="13" font-weight="700">−</text>
  <text x="28" y="217" fill="#f59e0b" font-size="13" font-weight="700">6 V</text>
  <text x="20" y="233" fill="#94a3b8" font-size="11">(V_s1)</text>
  <line x1="80" y1="232" x2="80" y2="288" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="66" y1="288" x2="94" y2="288" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="72" y1="295" x2="88" y2="295" stroke="#94a3b8" stroke-width="2"/>

  <!-- R1 = 4 kOhm -->
  <line x1="80" y1="192" x2="80" y2="152" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="80" y1="152" x2="146" y2="152" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="146" y="140" width="76" height="24" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <text x="158" y="132" fill="#f59e0b" font-size="13" font-weight="700">R_1 = 4 kΩ</text>
  <line x1="222" y1="152" x2="360" y2="152" stroke="#f43f5e" stroke-width="2.5"/>

  <!-- Current i1 -->
  <line x1="236" y1="168" x2="282" y2="168" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-amber-4)"/>
  <text x="242" y="185" fill="#f59e0b" font-size="12" font-weight="700">i_1</text>

  <!-- Node v- -->
  <circle cx="290" cy="152" r="5" fill="#f59e0b"/>
  <text x="298" y="142" fill="#f59e0b" font-size="12" font-weight="700">v_− = 4 V</text>
  <text x="308" y="170" fill="#38bdf8" font-size="11">i_− = 0</text>

  <!-- Op-Amp -->
  <polygon points="360,118 360,256 490,187" fill="#1e293b" stroke="#e2e8f0" stroke-width="2.5"/>
  <text x="374" y="158" fill="#f43f5e" font-size="18" font-weight="700">−</text>
  <text x="374" y="228" fill="#34d399" font-size="18" font-weight="700">+</text>

  <!-- Vs2 = 4 V to noninverting -->
  <line x1="210" y1="222" x2="360" y2="222" stroke="#34d399" stroke-width="2.5"/>
  <circle cx="210" cy="254" r="20" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="204" y="249" fill="#34d399" font-size="13" font-weight="700">+</text>
  <text x="205" y="266" fill="#34d399" font-size="13" font-weight="700">−</text>
  <line x1="210" y1="222" x2="210" y2="234" stroke="#34d399" stroke-width="2"/>
  <line x1="210" y1="274" x2="210" y2="288" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="196" y1="288" x2="224" y2="288" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="202" y1="295" x2="218" y2="295" stroke="#94a3b8" stroke-width="2"/>
  <text x="238" y="260" fill="#34d399" font-size="13" font-weight="700">4 V (V_s2)</text>
  <text x="278" y="214" fill="#38bdf8" font-size="11">i_+ = 0, v_+ = 4 V</text>

  <!-- Feedback Rf = 10 kOhm -->
  <line x1="290" y1="152" x2="290" y2="86" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="290" y1="86" x2="386" y2="86" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="386" y="74" width="84" height="24" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="394" y="66" fill="#38bdf8" font-size="13" font-weight="700">R_f = 10 kΩ</text>
  <line x1="470" y1="86" x2="554" y2="86" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="554" y1="86" x2="554" y2="187" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Current if -->
  <line x1="322" y1="102" x2="368" y2="102" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-cyan-4)"/>
  <text x="334" y="118" fill="#38bdf8" font-size="12" font-weight="700">i_f</text>

  <!-- Output vo -->
  <line x1="490" y1="187" x2="626" y2="187" stroke="#a78bfa" stroke-width="2.5"/>
  <circle cx="554" cy="187" r="4.5" fill="#a78bfa"/>
  <circle cx="626" cy="187" r="5" fill="#a78bfa"/>
  <text x="638" y="192" fill="#a78bfa" font-size="15" font-weight="700">v_o = ?</text>

  <!-- Summary Box -->
  <rect x="526" y="232" width="212" height="82" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="540" y="255" fill="#f8fafc" font-size="12" font-weight="700">待求目标（Example 5.5）</text>
  <text x="540" y="276" fill="#a78bfa" font-size="12">1. 输出电压 v_o</text>
  <text x="540" y="296" fill="#f59e0b" font-size="12">2. 支路电流 i_1, i_f, i_−, i_+</text>
</svg>`;

const SHEET_FIG51 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 350" width="100%" style="max-width:760px;background:#0f172a;border-radius:12px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
  <text x="24" y="34" fill="#f8fafc" font-size="16" font-weight="700">图 5-1 LM358N（DIP-8）引脚映射：一片芯片同时实测同相放大器与电压跟随器</text>
  <text x="24" y="54" fill="#94a3b8" font-size="12">缺口（Notch）朝左，逆时针编号 1→8；推荐 ±9 V 双电源（Pin 8 = +9 V, Pin 4 = −9 V）</text>

  <!-- DIP-8 IC Body -->
  <rect x="270" y="106" width="220" height="148" rx="8" fill="#1e293b" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Notch on left -->
  <path d="M 270 162 A 18 18 0 0 1 270 198" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <text x="336" y="176" fill="#f8fafc" font-size="18" font-weight="700">LM358N</text>
  <text x="332" y="198" fill="#94a3b8" font-size="11">Dual Op-Amp (DIP-8)</text>

  <!-- Bottom pins 1-4 -->
  <rect x="292" y="254" width="18" height="22" fill="#cbd5e1"/>
  <text x="297" y="246" fill="#a78bfa" font-size="12" font-weight="700">1</text>
  <text x="256" y="294" fill="#a78bfa" font-size="11" font-weight="700">OUT1 (v_oA)</text>

  <rect x="344" y="254" width="18" height="22" fill="#cbd5e1"/>
  <text x="349" y="246" fill="#f43f5e" font-size="12" font-weight="700">2</text>
  <text x="332" y="294" fill="#f43f5e" font-size="11" font-weight="700">IN1−</text>

  <rect x="396" y="254" width="18" height="22" fill="#cbd5e1"/>
  <text x="401" y="246" fill="#34d399" font-size="12" font-weight="700">3</text>
  <text x="384" y="294" fill="#34d399" font-size="11" font-weight="700">IN1+</text>

  <rect x="448" y="254" width="18" height="22" fill="#cbd5e1"/>
  <text x="453" y="246" fill="#38bdf8" font-size="12" font-weight="700">4</text>
  <text x="428" y="294" fill="#38bdf8" font-size="11" font-weight="700">V_EE (−9V / GND)</text>

  <!-- Top pins 8-5 -->
  <rect x="292" y="84" width="18" height="22" fill="#cbd5e1"/>
  <text x="297" y="124" fill="#ef4444" font-size="12" font-weight="700">8</text>
  <text x="256" y="76" fill="#ef4444" font-size="11" font-weight="700">V_CC (+9 V)</text>

  <rect x="344" y="84" width="18" height="22" fill="#cbd5e1"/>
  <text x="349" y="124" fill="#a78bfa" font-size="12" font-weight="700">7</text>
  <text x="328" y="76" fill="#a78bfa" font-size="11" font-weight="700">OUT2 (v_oB)</text>

  <rect x="396" y="84" width="18" height="22" fill="#cbd5e1"/>
  <text x="401" y="124" fill="#f43f5e" font-size="12" font-weight="700">6</text>
  <text x="388" y="76" fill="#f43f5e" font-size="11" font-weight="700">IN2−</text>

  <rect x="448" y="84" width="18" height="22" fill="#cbd5e1"/>
  <text x="453" y="124" fill="#34d399" font-size="12" font-weight="700">5</text>
  <text x="440" y="76" fill="#34d399" font-size="11" font-weight="700">IN2+</text>

  <!-- Left Legend: OpAmp A -->
  <rect x="20" y="96" width="222" height="172" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="34" y="120" fill="#f59e0b" font-size="13" font-weight="700">运放 A：同相放大 (A_v = 3)</text>
  <text x="34" y="146" fill="#e2e8f0" font-size="12">• Pin 3 (IN1+) ← v_i = 1.5 V</text>
  <text x="34" y="170" fill="#e2e8f0" font-size="12">• Pin 2 → GND：R_1 = 10 kΩ</text>
  <text x="34" y="194" fill="#e2e8f0" font-size="12">• Pin 1 → Pin 2：R_f = 20 kΩ</text>
  <text x="34" y="218" fill="#a78bfa" font-size="12" font-weight="700">• Pin 1 万用表实测：4.50 V</text>
  <text x="34" y="246" fill="#94a3b8" font-size="11">若 v_i = 3.0 V：单 9V 下约 7.5 V 削顶</text>

  <!-- Right Legend: OpAmp B -->
  <rect x="518" y="96" width="222" height="172" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
  <text x="532" y="120" fill="#34d399" font-size="13" font-weight="700">运放 B：电压跟随器 (A_v = 1)</text>
  <text x="532" y="146" fill="#e2e8f0" font-size="12">• Pin 5 (IN2+) ← 高内阻源</text>
  <text x="532" y="170" fill="#f59e0b" font-size="12">• Pin 7 直接跳线短接 Pin 6</text>
  <text x="532" y="194" fill="#e2e8f0" font-size="12">• Pin 7 → GND：R_L = 1 kΩ</text>
  <text x="532" y="218" fill="#34d399" font-size="12" font-weight="700">• Pin 7 实测稳稳 5.00 V</text>
  <text x="532" y="246" fill="#94a3b8" font-size="11">拔掉跟随器直连：瞬间跌至 0.455 V</text>

  <!-- Bottom Safety Banner -->
  <rect x="20" y="310" width="720" height="28" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="36" y="328" fill="#cbd5e1" font-size="11">实测排错口诀：先测 Pin 8 与 Pin 4 供电是否到位 → 再测 v_+ 与 v_− 是否相等（验虚短）→ 若不等，必是开环或已撞电源轨饱和！</text>
</svg>`;

const SHEET_MINI1 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 120' width='360'><rect width='360' height='120' rx='8' fill='#0f172a'/><polygon points='160,25 160,95 235,60' fill='#1e293b' stroke='#e2e8f0' stroke-width='2'/><text x='170' y='48' fill='#f43f5e' font-size='14'>−</text><text x='170' y='82' fill='#34d399' font-size='14'>+</text><line x1='70' y1='78' x2='160' y2='78' stroke='#34d399' stroke-width='2'/><text x='24' y='83' fill='#34d399' font-size='12'>4 V</text><line x1='110' y1='44' x2='160' y2='44' stroke='#f59e0b' stroke-width='2'/><circle cx='120' cy='44' r='4' fill='#f59e0b'/><text x='100' y='34' fill='#f59e0b' font-size='12'>v_− = ?</text></svg>`;

const SHEET_MINI2 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 100' width='360'><rect width='360' height='100' rx='8' fill='#0f172a'/><text x='28' y='55' fill='#f59e0b' font-size='13'>6 V</text><line x1='60' y1='50' x2='120' y2='50' stroke='#e2e8f0' stroke-width='2'/><rect x='120' y='38' width='80' height='24' rx='3' fill='#1e293b' stroke='#f59e0b' stroke-width='2'/><text x='136' y='55' fill='#f59e0b' font-size='12'>4 kΩ</text><line x1='200' y1='50' x2='270' y2='50' stroke='#e2e8f0' stroke-width='2'/><text x='278' y='55' fill='#34d399' font-size='13'>v_− = 4 V</text><text x='145' y='84' fill='#38bdf8' font-size='12'>i_1 → ?</text></svg>`;

const SHEET_MINI3 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 110' width='360'><rect width='360' height='110' rx='8' fill='#0f172a'/><line x1='40' y1='70' x2='170' y2='70' stroke='#f59e0b' stroke-width='2.5'/><circle cx='170' cy='70' r='5' fill='#f59e0b'/><line x1='170' y1='70' x2='290' y2='70' stroke='#f43f5e' stroke-width='2' stroke-dasharray='4,3'/><line x1='170' y1='70' x2='170' y2='24' stroke='#38bdf8' stroke-width='2.5'/><line x1='170' y1='24' x2='290' y2='24' stroke='#38bdf8' stroke-width='2.5'/><text x='56' y='62' fill='#f59e0b' font-size='12'>i_1 = 0.5 mA</text><text x='186' y='20' fill='#38bdf8' font-size='12'>i_f = ? (去往 R_f)</text><text x='194' y='88' fill='#f43f5e' font-size='12'>i_− = ? (进运放)</text></svg>`;

const SHEET_MINI4 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 100' width='360'><rect width='360' height='100' rx='8' fill='#0f172a'/><text x='24' y='55' fill='#f59e0b' font-size='13'>v_− = 4 V</text><line x1='92' y1='50' x2='136' y2='50' stroke='#38bdf8' stroke-width='2'/><rect x='136' y='38' width='88' height='24' rx='3' fill='#1e293b' stroke='#38bdf8' stroke-width='2'/><text x='154' y='55' fill='#38bdf8' font-size='12'>10 kΩ</text><line x1='224' y1='50' x2='274' y2='50' stroke='#a78bfa' stroke-width='2'/><text x='282' y='55' fill='#a78bfa' font-size='13'>v_o = ?</text><text x='132' y='84' fill='#f59e0b' font-size='12'>i_f = 0.5 mA →</text></svg>`;

const SHEET_MINI5 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 100' width='360'><rect width='360' height='100' rx='8' fill='#0f172a'/><rect x='24' y='22' width='312' height='56' rx='6' fill='#1e293b' stroke='#a78bfa' stroke-width='1.5'/><text x='38' y='44' fill='#cbd5e1' font-size='11'>纸面叠加：v_o1 = −15 V，v_o2 = +14 V → 总计 −1 V</text><text x='38' y='66' fill='#34d399' font-size='11'>LM358 (±9 V) 线性窗口：[−7.5 V, +7.5 V]</text></svg>`;

/* ------------------------------------------------------------- fixes */

function fix(svg: string, swaps: [string, string][] = []): string {
  let s = svg;
  for (const [a, b] of swaps) {
    if (!s.includes(a)) throw new Error(`W3-L4 svg fix not found: ${a}`);
    s = s.split(a).join(b);
  }
  return lightSvg(s);
}

/** Figure 1-1. Layout: the input wire v_i (y = 226) ran straight through the body of R_1; R_1's
 *  body moves up above the wire and the wire hops over R_1's lead. The 虚短 label started on the
 *  op-amp triangle; it now ends left of the R_f wire. The i_+ arrow moves right of the hop. */
export const SVG_FIG11 = fix(SHEET_FIG11, [
  [
    '<line x1="110" y1="226" x2="340" y2="226" stroke="#34d399" stroke-width="2.5"/>',
    '<line x1="110" y1="226" x2="211" y2="226" stroke="#34d399" stroke-width="2.5"/><path d="M 211 226 A 9 9 0 0 1 229 226" fill="none" stroke="#34d399" stroke-width="2.5"/><line x1="229" y1="226" x2="340" y2="226" stroke="#34d399" stroke-width="2.5"/>',
  ],
  ['<line x1="210" y1="226" x2="265" y2="226"', '<line x1="240" y1="226" x2="292" y2="226"'],
  ['<text x="268" y="144" fill="#f59e0b" font-size="12" font-weight="700">', '<text x="254" y="144" fill="#f59e0b" font-size="12" font-weight="700" text-anchor="end">'],
  ['<line x1="220" y1="154" x2="220" y2="190" stroke="#e2e8f0" stroke-width="2"/>', '<line x1="220" y1="154" x2="220" y2="164" stroke="#e2e8f0" stroke-width="2"/>'],
  ['<rect x="208" y="190" width="24" height="58" rx="3"', '<rect x="208" y="164" width="24" height="48" rx="3"'],
  ['<text x="172" y="224" fill="#f59e0b" font-size="14" font-weight="700">R_1</text>', '<text x="172" y="194" fill="#f59e0b" font-size="14" font-weight="700">R_1</text>'],
  ['<line x1="220" y1="248" x2="220" y2="288" stroke="#e2e8f0" stroke-width="2"/>', '<line x1="220" y1="212" x2="220" y2="288" stroke="#e2e8f0" stroke-width="2"/>'],
]);
export const SVG_FIG21 = fix(SHEET_FIG21);
export const SVG_FIG31 = fix(SHEET_FIG31);
export const SVG_FIG32 = fix(SHEET_FIG32);
/** Figure 4-1. Anti-spoiler: the node label "v_− = 4 V" is the guided example's first answer; it
 *  reads "v_− = ?" (the board and the 通关复盘 give it). Layout: "i_+ = 0, v_+ = 4 V" ran onto the
 *  op-amp triangle; it now ends left of the + input. */
export const SVG_FIG41 = fix(SHEET_FIG41, [
  ['>v_− = 4 V</text>', '>v_− = ?</text>'],
  ['<text x="278" y="214" fill="#38bdf8" font-size="11">', '<text x="352" y="214" fill="#38bdf8" font-size="11" text-anchor="end">'],
]);
/** Figure 5-1. Layout: the pin labels ran into each other (OUT2 into IN2−, V_EE into the right-hand
 *  card); they are centred on their pins, every other one a line higher / lower. Content: with
 *  ±9 V the positive rail is still +9 V, so v_i = 3.0 V clips at about +7.5 V on both supplies,
 *  not only on a single 9 V supply. */
export const SVG_FIG51 = fix(SHEET_FIG51, [
  ['<text x="256" y="294" fill="#a78bfa" font-size="11" font-weight="700">OUT1', '<text x="301" y="292" text-anchor="middle" fill="#a78bfa" font-size="11" font-weight="700">OUT1'],
  ['<text x="332" y="294" fill="#f43f5e" font-size="11" font-weight="700">IN1−', '<text x="353" y="304" text-anchor="middle" fill="#f43f5e" font-size="11" font-weight="700">IN1−'],
  ['<text x="384" y="294" fill="#34d399" font-size="11" font-weight="700">IN1+', '<text x="405" y="292" text-anchor="middle" fill="#34d399" font-size="11" font-weight="700">IN1+'],
  ['<text x="428" y="294" fill="#38bdf8" font-size="11" font-weight="700">V_EE', '<text x="457" y="304" text-anchor="middle" fill="#38bdf8" font-size="11" font-weight="700">V_EE'],
  ['<text x="256" y="76" fill="#ef4444" font-size="11" font-weight="700">V_CC', '<text x="301" y="78" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="700">V_CC'],
  ['<text x="328" y="76" fill="#a78bfa" font-size="11" font-weight="700">OUT2', '<text x="353" y="67" text-anchor="middle" fill="#a78bfa" font-size="11" font-weight="700">OUT2'],
  ['<text x="388" y="76" fill="#f43f5e" font-size="11" font-weight="700">IN2−', '<text x="405" y="78" text-anchor="middle" fill="#f43f5e" font-size="11" font-weight="700">IN2−'],
  ['<text x="440" y="76" fill="#34d399" font-size="11" font-weight="700">IN2+', '<text x="457" y="67" text-anchor="middle" fill="#34d399" font-size="11" font-weight="700">IN2+'],
  [
    '<text x="34" y="246" fill="#94a3b8" font-size="11">若 v_i = 3.0 V：单 9V 下约 7.5 V 削顶</text>',
    '<text x="34" y="246" fill="#94a3b8" font-size="10.5">若 v_i = 3.0 V：单/双电源均约 7.5 V 削顶</text>',
  ],
]);
export const MINI_STEP1 = fix(SHEET_MINI1);
export const MINI_STEP2 = fix(SHEET_MINI2);
export const MINI_STEP3 = fix(SHEET_MINI3);
export const MINI_STEP4 = fix(SHEET_MINI4);
export const MINI_STEP5 = fix(SHEET_MINI5);

/* ------------------------------------------------------------- added figures (sheet style) */

const FONT = `font-family="ui-sans-serif, system-ui, -apple-system, sans-serif"`;
const BG = (w: number, h: number) => `<rect width="${w}" height="${h}" rx="12" fill="#0f172a"/>`;
const wire = (pts: string, stroke = '#e2e8f0') => `<polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="2"/>`;
/** a resistor box (the sheet's style) centred at (x, y), horizontal or vertical */
const res = (x: number, y: number, stroke: string, vertical = false) =>
  vertical
    ? `<rect x="${x - 10}" y="${y - 20}" width="20" height="40" rx="3" fill="#0f172a" stroke="${stroke}" stroke-width="2"/>`
    : `<rect x="${x - 26}" y="${y - 10}" width="52" height="20" rx="3" fill="#0f172a" stroke="${stroke}" stroke-width="2"/>`;
const vsrc = (x: number, y: number, r = 16, stroke = '#e2e8f0') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#0f172a" stroke="${stroke}" stroke-width="2"/><text x="${x}" y="${y - 3}" fill="#e2e8f0" font-size="11" font-weight="700" text-anchor="middle">+</text><text x="${x}" y="${y + 11}" fill="#e2e8f0" font-size="11" font-weight="700" text-anchor="middle">−</text>`;
const gnd = (x: number, y: number) =>
  `<line x1="${x - 11}" y1="${y}" x2="${x + 11}" y2="${y}" stroke="#94a3b8" stroke-width="2.2"/><line x1="${x - 6}" y1="${y + 5}" x2="${x + 6}" y2="${y + 5}" stroke="#94a3b8" stroke-width="1.8"/>`;
/** an op-amp triangle with its left edge at x, inputs at y ∓ 16 (− on top) */
const opamp = (x: number, y: number, w = 60, stroke = '#e2e8f0') =>
  `<polygon points="${x},${y - 32} ${x},${y + 32} ${x + w},${y}" fill="#1e293b" stroke="${stroke}" stroke-width="2"/><text x="${x + 7}" y="${y - 11}" fill="#f43f5e" font-size="14" font-weight="700">−</text><text x="${x + 7}" y="${y + 22}" fill="#34d399" font-size="14" font-weight="700">+</text>`;

/** Q1: a 100 kΩ sensor and the two amplifiers to choose from. */
export const SVG_Q1 =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 190" ${FONT} role="img" aria-label="戴维南内阻 100 kΩ 的压电传感器，后接反相放大器（R_1 = 10 kΩ，R_f = 50 kΩ）或同相放大器（R_1 = 10 kΩ，R_f = 40 kΩ），二选一">
  ${BG(440, 190)}
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Q1 · 高内阻传感器后接哪一种放大器？</text>
  <rect x="16" y="40" width="150" height="132" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="1.4" stroke-dasharray="6,4"/>
  <text x="26" y="58" fill="#94a3b8" font-size="10.5">压电传感器（戴维南等效）</text>
  ${wire('46,98 46,84 76,84')}
  ${wire('128,84 186,84')}
  ${wire('46,130 46,150 186,150')}
  ${vsrc(46, 114)}
  ${res(102, 84, '#f59e0b')}
  <text x="108" y="114" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">R_Th = 100 kΩ</text>
  <circle cx="186" cy="84" r="4" fill="#fbbf24"/>
  <circle cx="186" cy="150" r="4" fill="#fbbf24"/>
  <text x="214" y="122" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="middle">→ ?</text>
  <rect x="246" y="40" width="180" height="62" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="258" y="62" fill="#f43f5e" font-size="12" font-weight="700">方案一：反相放大器</text>
  <text x="258" y="84" fill="#e2e8f0" font-size="11">R_1 = 10 kΩ，R_f = 50 kΩ</text>
  <rect x="246" y="112" width="180" height="62" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
  <text x="258" y="134" fill="#34d399" font-size="12" font-weight="700">方案二：同相放大器</text>
  <text x="258" y="156" fill="#e2e8f0" font-size="11">R_1 = 10 kΩ，R_f = 40 kΩ</text>
</svg>`);

/** Q2: the sensor, the follower and the 1 kΩ load — and the "just use a wire" proposal. */
export const SVG_Q2 =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 190" ${FONT} role="img" aria-label="传感器（5 V，10 kΩ）经增益为 1 的电压跟随器驱动 1 kΩ 负载；有人提议用一根导线代替跟随器">
  ${BG(440, 190)}
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Q2 · 跟随器换成一根导线，行不行？</text>
  ${wire('46,112 46,86 72,86')}
  ${wire('124,86 196,86', '#34d399')}
  ${wire('46,144 46,162')}
  ${gnd(46, 162)}
  ${vsrc(46, 128)}
  <text x="70" y="132" fill="#cbd5e1" font-size="11">V_Th = 5 V</text>
  ${res(98, 86, '#f59e0b')}
  <text x="98" y="70" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">R_Th = 10 kΩ</text>
  ${opamp(196, 70)}
  ${wire('196,54 182,54 182,40 276,40 276,70', '#f59e0b')}
  <text x="226" y="122" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">A_v = 1</text>
  ${wire('256,70 340,70 340,80')}
  ${res(340, 102, '#34d399', true)}
  ${wire('340,122 340,162')}
  ${gnd(340, 162)}
  <text x="356" y="106" fill="#34d399" font-size="11" font-weight="700">R_L = 1 kΩ</text>
  <path d="M 150 90 C 190 150, 290 150, 336 92" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-dasharray="5,4"/>
  <text x="246" y="160" fill="#fbbf24" font-size="11.5" font-weight="700" text-anchor="middle">“换成导线？”</text>
  <text x="246" y="182" fill="#94a3b8" font-size="11" text-anchor="middle">负载两端电压 v_L = ?</text>
</svg>`);

/** Q3: the A_v = 3 amplifier on a single +9 V supply and its output window. */
export const SVG_Q3 =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 190" ${FONT} role="img" aria-label="单 +9 V 供电的 LM358 同相放大器：R_1 = 10 kΩ，R_f = 20 kΩ，线性输出上限约 +7.5 V">
  ${BG(440, 190)}
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Q3 · 单 +9 V 供电的同相放大器</text>
  ${opamp(150, 100)}
  ${wire('60,116 150,116', '#34d399')}
  <circle cx="60" cy="116" r="4" fill="#34d399"/>
  <text x="54" y="120" fill="#34d399" font-size="12" font-weight="700" text-anchor="end">v_i</text>
  ${wire('150,84 120,84')}
  ${wire('120,84 120,56 160,56')}
  ${res(186, 56, '#38bdf8')}
  ${wire('212,56 240,56 240,100')}
  <text x="186" y="40" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">R_f = 20 kΩ</text>
  ${wire('120,84 104,84 104,120')}
  ${res(104, 140, '#f59e0b', true)}
  ${wire('104,160 104,172')}
  ${gnd(104, 172)}
  <text x="88" y="144" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="end">R_1 = 10 kΩ</text>
  <circle cx="120" cy="84" r="3.5" fill="#f59e0b"/>
  ${wire('210,100 290,100', '#a78bfa')}
  <circle cx="240" cy="100" r="3.5" fill="#a78bfa"/>
  <circle cx="290" cy="100" r="4" fill="#a78bfa"/>
  <text x="290" y="88" fill="#a78bfa" font-size="12" font-weight="700" text-anchor="middle">v_o</text>
  <rect x="330" y="40" width="22" height="130" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1.2"/>
  <rect x="331" y="65" width="20" height="104" rx="3" fill="#064e3b"/>
  <line x1="324" y1="42" x2="358" y2="42" stroke="#f43f5e" stroke-width="1.6"/>
  <line x1="324" y1="65" x2="358" y2="65" stroke="#fbbf24" stroke-width="1.6" stroke-dasharray="4,3"/>
  <line x1="324" y1="169" x2="358" y2="169" stroke="#94a3b8" stroke-width="1.6"/>
  <text x="364" y="46" fill="#f43f5e" font-size="10.5" font-weight="700">+9 V</text>
  <text x="364" y="69" fill="#fbbf24" font-size="10.5" font-weight="700">≈ +7.5 V</text>
  <text x="364" y="173" fill="#94a3b8" font-size="10.5" font-weight="700">0 V</text>
  <text x="341" y="186" fill="#94a3b8" font-size="10" text-anchor="middle">线性窗口</text>
</svg>`);

/** Q4: Example-5.5-style circuit with other numbers. */
export const SVG_Q4 =
  lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 190" ${FONT} role="img" aria-label="同相端接 +3 V；反相端经 R_1 = 2 kΩ 接 +5 V，经 R_f = 6 kΩ 接输出 v_o；±12 V 双电源">
  ${BG(440, 190)}
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Q4 · 仿 Example 5.5（±12 V 双电源）</text>
  ${vsrc(44, 108)}
  <text x="44" y="146" fill="#f59e0b" font-size="12" font-weight="700" text-anchor="middle">+5 V</text>
  ${wire('44,92 44,76 82,76')}
  ${wire('44,124 44,166')}
  ${gnd(44, 166)}
  ${res(108, 76, '#f59e0b')}
  <text x="108" y="62" fill="#f59e0b" font-size="11" font-weight="700" text-anchor="middle">R_1 = 2 kΩ</text>
  ${wire('134,76 230,76', '#f43f5e')}
  <circle cx="176" cy="76" r="4" fill="#f59e0b"/>
  ${wire('176,76 176,40 222,40')}
  ${res(248, 40, '#38bdf8')}
  ${wire('274,40 330,40 330,92')}
  <text x="338" y="64" fill="#38bdf8" font-size="11" font-weight="700">R_f = 6 kΩ</text>
  ${opamp(230, 92, 70)}
  ${wire('150,108 230,108', '#34d399')}
  ${vsrc(150, 140, 15, '#34d399')}
  ${wire('150,125 150,108', '#34d399')}
  ${wire('150,155 150,170')}
  ${gnd(150, 170)}
  <text x="174" y="146" fill="#34d399" font-size="12" font-weight="700">+3 V</text>
  ${wire('300,92 370,92', '#a78bfa')}
  <circle cx="330" cy="92" r="4" fill="#a78bfa"/>
  <circle cx="370" cy="92" r="4.5" fill="#a78bfa"/>
  <text x="378" y="97" fill="#a78bfa" font-size="13" font-weight="700">v_o = ?</text>
</svg>`);

/** The self-test act: the four ideas the questions test (no answers). */
export const SVG_QUIZ_ACT = (() => {
  const card = (x: number, title: string, sub: string, icon: string) =>
    `<rect x="${x}" y="44" width="158" height="140" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="${x + 79}" y="68" fill="#f8fafc" font-size="12.5" font-weight="700" text-anchor="middle">${title}</text>
  <text x="${x + 79}" y="172" fill="#94a3b8" font-size="11" text-anchor="middle">${sub}</text>
  <g transform="translate(${x + 29} 82)">${icon}</g>`;
  const icon1 = `<rect x="0" y="16" width="36" height="16" rx="3" fill="#0f172a" stroke="#f59e0b" stroke-width="1.6"/><text x="18" y="10" fill="#f59e0b" font-size="9.5" font-weight="700" text-anchor="middle">R_Th</text><line x1="36" y1="24" x2="58" y2="24" stroke="#e2e8f0" stroke-width="1.6"/><text x="82" y="29" fill="#fbbf24" font-size="13" font-weight="800" text-anchor="middle">R_in ?</text><text x="50" y="62" fill="#e2e8f0" font-size="10.5" text-anchor="middle">谁不“抽血”？</text>`;
  const icon2 = `<polygon points="20,4 20,44 54,24" fill="#0f172a" stroke="#34d399" stroke-width="1.8"/><text x="60" y="16" fill="#34d399" font-size="10" font-weight="700">A_v = 1</text><line x1="54" y1="24" x2="100" y2="24" stroke="#e2e8f0" stroke-width="1.6"/><text x="50" y="62" fill="#e2e8f0" font-size="10.5" text-anchor="middle">只是一根导线？</text>`;
  const icon3 = `<line x1="0" y1="44" x2="100" y2="44" stroke="#94a3b8" stroke-width="1.4"/><line x1="0" y1="8" x2="100" y2="8" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="4,3"/><path d="M 0 44 L 52 14 L 100 14" fill="none" stroke="#a78bfa" stroke-width="2.2"/><text x="50" y="62" fill="#e2e8f0" font-size="10.5" text-anchor="middle">顶到电源轨会怎样？</text>`;
  const icon4 = `<polygon points="30,0 30,44 70,22" fill="#0f172a" stroke="#e2e8f0" stroke-width="1.8"/><text x="0" y="14" fill="#f59e0b" font-size="10" font-weight="700">+5 V</text><text x="0" y="40" fill="#34d399" font-size="10" font-weight="700">+3 V</text><text x="84" y="27" fill="#a78bfa" font-size="13" font-weight="800">?</text><text x="50" y="62" fill="#e2e8f0" font-size="10.5" text-anchor="middle">两个源一起算</text>`;
  return lightSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 200" ${FONT} role="img" aria-label="诊断测验的四个核心概念">
  ${BG(700, 200)}
  <text x="20" y="28" fill="#f8fafc" font-size="15" font-weight="700">诊断测验：同相放大器与电压跟随器的四个核心概念</text>
  ${card(16, 'Q1 同相 vs 反相输入电阻', '高内阻传感器选型', icon1)}
  ${card(186, 'Q2 能删掉跟随器吗', '阻抗隔离', icon2)}
  ${card(356, 'Q3 增益下限与削顶', '单 +9 V 饱和边界', icon3)}
  ${card(526, 'Q4 双源混合输入', '仿 Example 5.5', icon4)}
</svg>`);
})();
