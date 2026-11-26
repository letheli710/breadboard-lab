// W3-L1 figures the sheet does not draw (the guided example's circuit and route, the four
// self-test questions, the self-test act), in the light style of the sheet's own SVGs (svgs.ts).
// None of them shows an answer.

/** the guided example's circuit: the VCVS model with the given values */
export const ADDED_GD_PROBLEM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 230" role="img" aria-label="引导例题电路：真实运放 VCVS 模型带 1.5 kΩ 负载">
  <rect x="1" y="1" width="478" height="228" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="240" y="24" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#0F172A">±9 V 真实运放：A = 10⁵、R_i = 2 MΩ、R_o = 75 Ω、R_L = 1.5 kΩ</text>
  <rect x="104" y="40" width="250" height="168" rx="12" fill="#FFFFFF" stroke="#64748B" stroke-width="1.6" stroke-dasharray="7 4"/>
  <line x1="40" y1="78" x2="150" y2="78" stroke="#0F172A" stroke-width="2"/>
  <line x1="40" y1="170" x2="150" y2="170" stroke="#0F172A" stroke-width="2"/>
  <circle cx="40" cy="78" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <circle cx="40" cy="170" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="12" y="66" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">v₁ (−)</text>
  <text x="12" y="96" font-family="monospace" font-size="12" font-weight="700" fill="#2563EB">1.50000 V</text>
  <text x="12" y="158" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">v₂ (+)</text>
  <text x="12" y="188" font-family="monospace" font-size="12" font-weight="700" fill="#2563EB">1.50006 V</text>
  <line x1="150" y1="78" x2="150" y2="96" stroke="#0F172A" stroke-width="2"/>
  <rect x="139" y="96" width="22" height="56" rx="3" fill="#EFF6FF" stroke="#1D4ED8" stroke-width="2"/>
  <line x1="150" y1="152" x2="150" y2="170" stroke="#0F172A" stroke-width="2"/>
  <text x="168" y="128" font-family="sans-serif" font-size="13" font-weight="700" fill="#1D4ED8">R_i</text>
  <polygon points="250,92 280,124 250,156 220,124" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="250" y="128" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#92400E">A·v_d</text>
  <line x1="250" y1="92" x2="250" y2="66" stroke="#0F172A" stroke-width="2"/>
  <line x1="250" y1="66" x2="282" y2="66" stroke="#0F172A" stroke-width="2"/>
  <rect x="282" y="56" width="46" height="20" rx="3" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
  <text x="305" y="96" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#047857">R_o</text>
  <line x1="328" y1="66" x2="420" y2="66" stroke="#0F172A" stroke-width="2"/>
  <circle cx="420" cy="66" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="412" y="52" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">v_o</text>
  <line x1="420" y1="66" x2="420" y2="98" stroke="#0F172A" stroke-width="2"/>
  <rect x="409" y="98" width="22" height="56" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="438" y="130" font-family="sans-serif" font-size="12" font-weight="700" fill="#0F172A">R_L</text>
  <line x1="420" y1="154" x2="420" y2="186" stroke="#0F172A" stroke-width="2"/>
  <line x1="250" y1="156" x2="250" y2="186" stroke="#0F172A" stroke-width="2"/>
  <line x1="236" y1="186" x2="434" y2="186" stroke="#0F172A" stroke-width="2"/>
  <line x1="243" y1="193" x2="257" y2="193" stroke="#0F172A" stroke-width="2"/>
  <text x="240" y="222" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#475569">分 5 步：工作区 → v_oc → i_in → 带载 v_o、i_o → 微扰后的输出</text>
</svg>`;

/** the guided act: the five steps on one line */
export const ADDED_GD_ACT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120" role="img" aria-label="引导例题的五步：工作区、空载电压、输入电流、带载输出、微扰饱和">
  <rect x="1" y="1" width="598" height="118" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="300" y="24" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#0F172A">剥壳算透一颗真实运放：五步路线</text>
  <rect x="14" y="40" width="104" height="62" rx="8" fill="#FEF3C7" stroke="#D97706"/>
  <text x="66" y="64" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#92400E">① 判工作区</text>
  <text x="66" y="86" text-anchor="middle" font-family="monospace" font-size="11" fill="#B45309">v_d vs ±90 μV</text>
  <rect x="131" y="40" width="104" height="62" rx="8" fill="#FFFBEB" stroke="#D97706"/>
  <text x="183" y="64" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#92400E">② 空载 v_oc</text>
  <text x="183" y="86" text-anchor="middle" font-family="monospace" font-size="11" fill="#B45309">A·v_d</text>
  <rect x="248" y="40" width="104" height="62" rx="8" fill="#EFF6FF" stroke="#1D4ED8"/>
  <text x="300" y="64" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1E3A8A">③ 输入电流</text>
  <text x="300" y="86" text-anchor="middle" font-family="monospace" font-size="11" fill="#1D4ED8">v_d / R_i</text>
  <rect x="365" y="40" width="104" height="62" rx="8" fill="#ECFDF5" stroke="#059669"/>
  <text x="417" y="64" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#065F46">④ 带载输出</text>
  <text x="417" y="86" text-anchor="middle" font-family="monospace" font-size="11" fill="#047857">分压 + Eq. 5.1</text>
  <rect x="482" y="40" width="104" height="62" rx="8" fill="#FEF2F2" stroke="#DC2626"/>
  <text x="534" y="64" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#991B1B">⑤ 微扰</text>
  <text x="534" y="86" text-anchor="middle" font-family="monospace" font-size="11" fill="#B91C1C">v₂ 再抬 0.10 mV</text>
</svg>`;

export const ADDED_Q1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 170" role="img" aria-label="按 LM741 接好的电源线，换插一颗 LM358">
  <rect x="1" y="1" width="358" height="168" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="180" y="22" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">面包板按 LM741 接线，换插一颗 LM358</text>
  <rect x="130" y="40" width="100" height="112" rx="6" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
  <path d="M 167 40 A 13 13 0 0 0 193 40" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
  <text x="180" y="102" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" fill="#E2E8F0">LM358</text>
  <rect x="114" y="52" width="16" height="10" fill="#94A3B8"/>
  <text x="108" y="61" text-anchor="end" font-family="monospace" font-size="11" fill="#334155">1</text>
  <rect x="114" y="78" width="16" height="10" fill="#94A3B8"/>
  <text x="108" y="87" text-anchor="end" font-family="monospace" font-size="11" fill="#334155">2</text>
  <rect x="114" y="104" width="16" height="10" fill="#94A3B8"/>
  <text x="108" y="113" text-anchor="end" font-family="monospace" font-size="11" fill="#334155">3</text>
  <rect x="114" y="130" width="16" height="10" fill="#94A3B8"/>
  <text x="108" y="139" text-anchor="end" font-family="monospace" font-size="11" fill="#334155">4</text>
  <rect x="230" y="52" width="16" height="10" fill="#94A3B8"/>
  <text x="252" y="61" font-family="monospace" font-size="11" fill="#334155">8</text>
  <rect x="230" y="78" width="16" height="10" fill="#94A3B8"/>
  <text x="252" y="87" font-family="monospace" font-size="11" fill="#334155">7</text>
  <rect x="230" y="104" width="16" height="10" fill="#94A3B8"/>
  <text x="252" y="113" font-family="monospace" font-size="11" fill="#334155">6</text>
  <rect x="230" y="130" width="16" height="10" fill="#94A3B8"/>
  <text x="252" y="139" font-family="monospace" font-size="11" fill="#334155">5</text>
  <line x1="266" y1="83" x2="300" y2="83" stroke="#DC2626" stroke-width="2.4"/>
  <text x="304" y="87" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">+9 V</text>
  <line x1="94" y1="135" x2="60" y2="135" stroke="#7C3AED" stroke-width="2.4"/>
  <text x="56" y="139" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="700" fill="#7C3AED">−9 V</text>
  <text x="180" y="166" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">原有接线：+9 V → Pin 7，−9 V → Pin 4。上电之后会怎样？</text>
</svg>`;

export const ADDED_Q2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 170" role="img" aria-label="灌电流时的封闭面 KCL：i_o = −4.0 mA，i_+ = +1.0 mA，i_- 未知">
  <rect x="1" y="1" width="358" height="168" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <rect x="96" y="30" width="150" height="112" rx="14" fill="#EFF6FF" fill-opacity="0.6" stroke="#3B82F6" stroke-width="1.8" stroke-dasharray="7 4"/>
  <polygon points="130,56 130,116 204,86" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <line x1="40" y1="72" x2="130" y2="72" stroke="#0F172A" stroke-width="1.6"/>
  <line x1="40" y1="100" x2="130" y2="100" stroke="#0F172A" stroke-width="1.6"/>
  <text x="36" y="64" font-family="sans-serif" font-size="11" fill="#2563EB">i₁ ≈ 0</text>
  <text x="36" y="116" font-family="sans-serif" font-size="11" fill="#2563EB">i₂ ≈ 0</text>
  <line x1="166" y1="12" x2="166" y2="68" stroke="#DC2626" stroke-width="2.4"/>
  <polygon points="166,64 160,52 172,52" fill="#DC2626"/>
  <text x="174" y="24" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">i₊ = +1.0 mA</text>
  <line x1="166" y1="104" x2="166" y2="160" stroke="#7C3AED" stroke-width="2.4"/>
  <text x="174" y="156" font-family="sans-serif" font-size="12" font-weight="700" fill="#7C3AED">i₋ = ?（按流入芯片定义）</text>
  <line x1="204" y1="86" x2="330" y2="86" stroke="#059669" stroke-width="2.4"/>
  <polygon points="250,86 262,80 262,92" fill="#059669"/>
  <text x="262" y="76" font-family="sans-serif" font-size="12" font-weight="700" fill="#059669">i_o = −4.0 mA</text>
  <text x="236" y="106" font-family="sans-serif" font-size="10" fill="#047857">（4 mA 倒灌进输出脚）</text>
</svg>`;

export const ADDED_Q3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 150" role="img" aria-label="数据手册：开环增益 120 dB，输出电阻 50 Ω">
  <rect x="1" y="1" width="358" height="148" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <rect x="20" y="20" width="160" height="110" rx="8" fill="#FFFFFF" stroke="#94A3B8"/>
  <text x="100" y="42" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#0F172A">数据手册 · 精密运放</text>
  <text x="34" y="72" font-family="monospace" font-size="13" font-weight="700" fill="#B45309">A_OL = 120 dB</text>
  <text x="34" y="96" font-family="monospace" font-size="13" font-weight="700" fill="#047857">R_o  = 50 Ω</text>
  <text x="34" y="120" font-family="monospace" font-size="13" font-weight="700" fill="#1D4ED8">R_i  很大</text>
  <text x="270" y="50" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#334155">A_dB = 20 log₁₀ A</text>
  <text x="270" y="84" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#B45309">A = ?</text>
  <text x="270" y="118" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">高 R_i、低 R_o 各为了什么？</text>
</svg>`;

export const ADDED_Q4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 170" role="img" aria-label="单节 9 V 电池给开环 LM358 供电">
  <rect x="1" y="1" width="358" height="168" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="180" y="22" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">单电源 +9 V / 0 V，开环（无负反馈）</text>
  <polygon points="140,50 140,130 230,90" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.2"/>
  <text x="148" y="76" font-family="monospace" font-size="15" font-weight="700" fill="#0F172A">−</text>
  <text x="148" y="118" font-family="monospace" font-size="15" font-weight="700" fill="#0F172A">+</text>
  <line x1="70" y1="70" x2="140" y2="70" stroke="#0F172A" stroke-width="2"/>
  <line x1="70" y1="110" x2="140" y2="110" stroke="#0F172A" stroke-width="2"/>
  <text x="64" y="74" text-anchor="end" font-family="sans-serif" font-size="12" fill="#334155">v₁</text>
  <text x="64" y="114" text-anchor="end" font-family="sans-serif" font-size="12" fill="#334155">v₂</text>
  <line x1="185" y1="40" x2="185" y2="66" stroke="#DC2626" stroke-width="2.2"/>
  <text x="192" y="44" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">Pin 8 → +9 V</text>
  <line x1="185" y1="114" x2="185" y2="146" stroke="#334155" stroke-width="2.2"/>
  <text x="192" y="150" font-family="sans-serif" font-size="12" font-weight="700" fill="#334155">Pin 4 → 0 V</text>
  <line x1="230" y1="90" x2="300" y2="90" stroke="#059669" stroke-width="2.4"/>
  <text x="304" y="94" font-family="sans-serif" font-size="13" font-weight="700" fill="#059669">v_o = ?</text>
</svg>`;

/** the self-test act: four traps */
export const ADDED_QUIZ_ACT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 170" role="img" aria-label="诊断测验的四个考点">
  <rect x="1" y="1" width="598" height="168" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="300" y="26" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#0F172A">诊断测验：四个真实运放考点</text>
  <rect x="16" y="42" width="134" height="112" rx="8" fill="#FEF2F2" stroke="#FCA5A5"/>
  <text x="83" y="66" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#991B1B">Q1 引脚</text>
  <text x="83" y="94" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#B91C1C">Pin 7 / Pin 8</text>
  <text x="83" y="120" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#7F1D1D">LM358 与 LM741</text>
  <text x="83" y="138" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#7F1D1D">能否直接互换？</text>
  <rect x="162" y="42" width="134" height="112" rx="8" fill="#EFF6FF" stroke="#93C5FD"/>
  <text x="229" y="66" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1E3A8A">Q2 Eq. (5.1)</text>
  <text x="229" y="94" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#1D4ED8">i_o = 四路之和</text>
  <text x="229" y="120" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1E3A8A">灌电流时</text>
  <text x="229" y="138" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1E3A8A">i₋ 的大小与方向</text>
  <rect x="308" y="42" width="134" height="112" rx="8" fill="#FEF3C7" stroke="#F59E0B"/>
  <text x="375" y="66" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#92400E">Q3 Table 5.1</text>
  <text x="375" y="94" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#B45309">dB ↔ 倍数</text>
  <text x="375" y="120" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#78350F">高 R_i、低 R_o</text>
  <text x="375" y="138" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#78350F">为了什么</text>
  <rect x="454" y="42" width="130" height="112" rx="8" fill="#ECFDF5" stroke="#6EE7B7"/>
  <text x="519" y="66" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#065F46">Q4 三区</text>
  <text x="519" y="94" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#047857">+9 V / 0 V</text>
  <text x="519" y="120" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#065F46">开环 + 失调电压</text>
  <text x="519" y="138" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#065F46">输出停在哪？</text>
</svg>`;
