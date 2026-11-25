// W3-L1 diagrams. The SHEET_* strings are the lesson sheet's inline SVGs (docs/lessons/W3-L1.md:
// the act figures 1.4, 2.2, 3.2, 4.3, 5.2 and the guided example's five mini_svg), copied as
// written. They are drawn for a light canvas already (#F8FAFC panels, #0F172A ink), so they do not
// go through lightSvg (which would turn the dark chip bodies white). Changes: the root's
// width="100%" height="auto" is dropped (an SVG has no height "auto"; the page's CSS sizes the
// figure), and three labels are corrected:
//  - figure 1.4: "引脚 1–4 插入左侧 e 列，引脚 5–8 插入右侧 f 列" → pins 1–4 in f, 5–8 in e, the way
//    the lab chip sits on the 3D board (Lm358.tsx);
//  - figure 2.2: "i_- (… 灌电流时为负)" → negative in both cases (sourcing −1 mA, sinking −5 mA);
//  - figure 4.3: "33.3 倍于悬崖宽" → 33.3 × the 90 μV boundary (the whole 180 μV window is 16.7 ×).
// The ADDED_* figures (guided problem, the self-test questions, the self-test act) are drawn here
// in the same light style.

export const SHEET_ACT1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 390" role="img" aria-label="LM358 与 LM741 DIP-8 引脚对照及面包板跨沟插法">
  <defs>
    <marker id="act1-arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="860" height="390" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="430" y="28" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#0F172A">DIP-8 真实封装引脚生死对照（LM358 双运放 vs LM741 单运放）与面包板跨沟插法</text>

  <!-- Left Panel: LM358 -->
  <rect x="24" y="46" width="388" height="234" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/>
  <text x="218" y="68" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#1D4ED8">LM358（双运放 Dual Op-Amp）</text>
  <!-- Chip Body LM358 -->
  <rect x="158" y="84" width="120" height="174" rx="6" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
  <path d="M 203 84 A 15 15 0 0 0 233 84" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
  <circle cx="174" cy="100" r="4" fill="#94A3B8"/>
  <text x="218" y="168" text-anchor="middle" font-family="monospace" font-size="15" font-weight="700" fill="#E2E8F0">LM358</text>
  <text x="218" y="186" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#94A3B8">缺口朝上 · 逆时针</text>
  <!-- LM358 Left Pins 1-4 -->
  <rect x="138" y="102" width="20" height="12" fill="#94A3B8" stroke="#475569"/>
  <text x="148" y="112" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">1</text>
  <text x="130" y="112" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="700" fill="#059669">OUT1 (输出A)</text>

  <rect x="138" y="142" width="20" height="12" fill="#94A3B8" stroke="#475569"/>
  <text x="148" y="152" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">2</text>
  <text x="130" y="152" text-anchor="end" font-family="sans-serif" font-size="12" fill="#334155">IN1− (反相 v1)</text>

  <rect x="138" y="182" width="20" height="12" fill="#94A3B8" stroke="#475569"/>
  <text x="148" y="192" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">3</text>
  <text x="130" y="192" text-anchor="end" font-family="sans-serif" font-size="12" fill="#334155">IN1+ (同相 v2)</text>

  <rect x="138" y="222" width="20" height="12" fill="#3B82F6" stroke="#1D4ED8"/>
  <text x="148" y="232" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#FFFFFF">4</text>
  <text x="130" y="232" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="700" fill="#1D4ED8">V_EE / GND</text>

  <!-- LM358 Right Pins 8-5 -->
  <rect x="278" y="102" width="20" height="12" fill="#EF4444" stroke="#B91C1C"/>
  <text x="288" y="112" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#FFFFFF">8</text>
  <text x="306" y="112" text-anchor="start" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">V_CC (+9V) ★</text>

  <rect x="278" y="142" width="20" height="12" fill="#94A3B8" stroke="#475569"/>
  <text x="288" y="152" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">7</text>
  <text x="306" y="152" text-anchor="start" font-family="sans-serif" font-size="12" font-weight="700" fill="#059669">OUT2 (输出B)</text>

  <rect x="278" y="182" width="20" height="12" fill="#94A3B8" stroke="#475569"/>
  <text x="288" y="192" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">6</text>
  <text x="306" y="192" text-anchor="start" font-family="sans-serif" font-size="12" fill="#334155">IN2− (反相)</text>

  <rect x="278" y="222" width="20" height="12" fill="#94A3B8" stroke="#475569"/>
  <text x="288" y="232" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">5</text>
  <text x="306" y="232" text-anchor="start" font-family="sans-serif" font-size="12" fill="#334155">IN2+ (同相)</text>

  <!-- Right Panel: LM741 -->
  <rect x="448" y="46" width="388" height="234" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/>
  <text x="642" y="68" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#7C3AED">LM741（单运放 Single Op-Amp · Sadiku 范例）</text>
  <!-- Chip Body LM741 -->
  <rect x="582" y="84" width="120" height="174" rx="6" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
  <path d="M 627 84 A 15 15 0 0 0 657 84" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
  <circle cx="598" cy="100" r="4" fill="#94A3B8"/>
  <text x="642" y="168" text-anchor="middle" font-family="monospace" font-size="15" font-weight="700" fill="#E2E8F0">LM741</text>
  <text x="642" y="186" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#94A3B8">仅含 1 组运放</text>
  <!-- LM741 Left Pins 1-4 -->
  <rect x="562" y="102" width="20" height="12" fill="#CBD5E1" stroke="#64748B"/>
  <text x="572" y="112" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">1</text>
  <text x="554" y="112" text-anchor="end" font-family="sans-serif" font-size="12" fill="#64748B">Offset Null</text>

  <rect x="562" y="142" width="20" height="12" fill="#94A3B8" stroke="#475569"/>
  <text x="572" y="152" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">2</text>
  <text x="554" y="152" text-anchor="end" font-family="sans-serif" font-size="12" fill="#334155">IN− (反相 v1)</text>

  <rect x="562" y="182" width="20" height="12" fill="#94A3B8" stroke="#475569"/>
  <text x="572" y="192" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">3</text>
  <text x="554" y="192" text-anchor="end" font-family="sans-serif" font-size="12" fill="#334155">IN+ (同相 v2)</text>

  <rect x="562" y="222" width="20" height="12" fill="#3B82F6" stroke="#1D4ED8"/>
  <text x="572" y="232" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#FFFFFF">4</text>
  <text x="554" y="232" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="700" fill="#1D4ED8">V_EE (-9V)</text>

  <!-- LM741 Right Pins 8-5 -->
  <rect x="702" y="102" width="20" height="12" fill="#CBD5E1" stroke="#64748B"/>
  <text x="712" y="112" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">8</text>
  <text x="730" y="112" text-anchor="start" font-family="sans-serif" font-size="12" fill="#64748B">NC (空脚)</text>

  <rect x="702" y="142" width="20" height="12" fill="#EF4444" stroke="#B91C1C"/>
  <text x="712" y="152" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#FFFFFF">7</text>
  <text x="730" y="152" text-anchor="start" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">V_CC (+9V) ★</text>

  <rect x="702" y="182" width="20" height="12" fill="#94A3B8" stroke="#475569"/>
  <text x="712" y="192" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">6</text>
  <text x="730" y="192" text-anchor="start" font-family="sans-serif" font-size="12" font-weight="700" fill="#059669">OUT (输出 v_o)</text>

  <rect x="702" y="222" width="20" height="12" fill="#CBD5E1" stroke="#64748B"/>
  <text x="712" y="232" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A">5</text>
  <text x="730" y="232" text-anchor="start" font-family="sans-serif" font-size="12" fill="#64748B">Offset Null</text>

  <!-- Bottom Breadboard Trench Straddle Strip -->
  <rect x="24" y="294" width="812" height="80" rx="10" fill="#FEF2F2" stroke="#FCA5A5" stroke-width="1.2"/>
  <text x="44" y="318" font-family="sans-serif" font-size="13" font-weight="700" fill="#991B1B">面包板跨沟插法剖面（正确 vs 严禁）</text>
  <text x="44" y="340" font-family="sans-serif" font-size="12" fill="#7F1D1D">• 正确：引脚 1–4 插入 f 列、引脚 5–8 插入 e 列（实验箱摆法），芯片骑跨中央隔离沟，左右各自独立。</text>
  <text x="44" y="360" font-family="sans-serif" font-size="12" fill="#7F1D1D">• 警示：LM358 正电源在 Pin 8，LM741 正电源在 Pin 7，绝对禁止未改线直接互换！</text>
  <!-- Mini cross-section icon on right side of bottom banner -->
  <rect x="620" y="308" width="82" height="52" rx="4" fill="#E2E8F0" stroke="#94A3B8"/>
  <rect x="722" y="308" width="82" height="52" rx="4" fill="#E2E8F0" stroke="#94A3B8"/>
  <rect x="702" y="308" width="20" height="52" fill="#CBD5E1"/>
  <text x="712" y="338" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="700" fill="#475569">沟</text>
  <rect x="668" y="304" width="88" height="22" rx="3" fill="#1E293B"/>
  <text x="712" y="319" text-anchor="middle" font-family="monospace" font-size="10" fill="#FFFFFF">DIP-8</text>
  <line x1="684" y1="326" x2="684" y2="352" stroke="#0F172A" stroke-width="3"/>
  <line x1="740" y1="326" x2="740" y2="352" stroke="#0F172A" stroke-width="3"/>
  <text x="652" y="352" font-family="monospace" font-size="10" fill="#334155">a–e</text>
  <text x="756" y="352" font-family="monospace" font-size="10" fill="#334155">f–j</text>
</svg>`;

export const SHEET_ACT2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 360" role="img" aria-label="Sadiku Eq. 5.1 真实运放五电流 KCL 封闭面节点图">
  <defs>
    <marker id="act2-arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB"/>
    </marker>
    <marker id="act2-arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626"/>
    </marker>
    <marker id="act2-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="act2-arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#7C3AED"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="860" height="360" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="430" y="28" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#0F172A">Eq. (5.1) 真实运放封闭面 KCL：输出电流的能量源自供电轨</text>

  <!-- KCL Gaussian Boundary -->
  <rect x="240" y="76" width="290" height="206" rx="18" fill="#EFF6FF" fill-opacity="0.55" stroke="#3B82F6" stroke-width="2" stroke-dasharray="8 5"/>
  <text x="256" y="98" font-family="sans-serif" font-size="12" font-weight="700" fill="#1D4ED8">KCL 封闭超节点（整个芯片封装）</text>

  <!-- Op-Amp Triangle -->
  <polygon points="310,115 310,245 455,180" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>
  <text x="325" y="156" font-family="monospace" font-size="20" font-weight="700" fill="#0F172A">−</text>
  <text x="325" y="218" font-family="monospace" font-size="20" font-weight="700" fill="#0F172A">+</text>
  <text x="366" y="185" font-family="sans-serif" font-size="13" font-weight="700" fill="#475569">Op-Amp</text>

  <!-- Input 1 (Inverting) -->
  <line x1="120" y1="148" x2="310" y2="148" stroke="#2563EB" stroke-width="2"/>
  <line x1="165" y1="148" x2="215" y2="148" stroke="#2563EB" stroke-width="2.2" marker-end="url(#act2-arrow-blue)"/>
  <circle cx="120" cy="148" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="108" y="152" text-anchor="end" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">v1 (反相)</text>
  <text x="190" y="136" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#2563EB">i1 (极微弱 ~0.1 μA)</text>

  <!-- Input 2 (Non-inverting) -->
  <line x1="120" y1="212" x2="310" y2="212" stroke="#2563EB" stroke-width="2"/>
  <line x1="165" y1="212" x2="215" y2="212" stroke="#2563EB" stroke-width="2.2" marker-end="url(#act2-arrow-blue)"/>
  <circle cx="120" cy="212" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="108" y="216" text-anchor="end" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">v2 (同相)</text>
  <text x="190" y="232" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#2563EB">i2 (极微弱 ~0.1 μA)</text>

  <!-- Positive Supply +V_CC -->
  <line x1="382" y1="48" x2="382" y2="147" stroke="#DC2626" stroke-width="3.2"/>
  <line x1="382" y1="56" x2="382" y2="108" stroke="#DC2626" stroke-width="3.2" marker-end="url(#act2-arrow-red)"/>
  <circle cx="382" cy="48" r="4.5" fill="#DC2626"/>
  <text x="396" y="54" font-family="sans-serif" font-size="13" font-weight="700" fill="#DC2626">+V_CC (+9 V)</text>
  <text x="396" y="72" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">i_+ (主力能量入口，mA 级)</text>

  <!-- Negative Supply -V_EE -->
  <line x1="382" y1="318" x2="382" y2="213" stroke="#7C3AED" stroke-width="3.2"/>
  <line x1="382" y1="308" x2="382" y2="255" stroke="#7C3AED" stroke-width="3.2" marker-end="url(#act2-arrow-purple)"/>
  <circle cx="382" cy="318" r="4.5" fill="#7C3AED"/>
  <text x="396" y="322" font-family="sans-serif" font-size="13" font-weight="700" fill="#7C3AED">−V_EE (−9 V)</text>
  <text x="396" y="302" font-family="sans-serif" font-size="12" font-weight="700" fill="#7C3AED">i_- (按流入芯片定义，两种工况下均为负)</text>

  <!-- Output & Load -->
  <line x1="455" y1="180" x2="625" y2="180" stroke="#059669" stroke-width="3.2"/>
  <line x1="490" y1="180" x2="560" y2="180" stroke="#059669" stroke-width="3.2" marker-end="url(#act2-arrow-green)"/>
  <circle cx="625" cy="180" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="530" y="168" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#059669">i_o (输出电流)</text>
  <text x="640" y="176" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">v_o</text>

  <!-- Load Resistor R_L -->
  <line x1="625" y1="180" x2="625" y2="205" stroke="#0F172A" stroke-width="2"/>
  <rect x="613" y="205" width="24" height="58" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="646" y="238" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">R_L = 1 kΩ</text>
  <line x1="625" y1="263" x2="625" y2="288" stroke="#0F172A" stroke-width="2"/>
  <!-- Ground symbol -->
  <line x1="611" y1="288" x2="639" y2="288" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="616" y1="294" x2="634" y2="294" stroke="#0F172A" stroke-width="2"/>
  <line x1="621" y1="300" x2="629" y2="300" stroke="#0F172A" stroke-width="1.8"/>

  <!-- Formula Callout Box -->
  <rect x="664" y="66" width="176" height="96" rx="8" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="752" y="90" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#92400E">Sadiku Eq. (5.1)</text>
  <text x="752" y="116" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" fill="#78350F">i_o = i_1+i_2+i_++i_-</text>
  <text x="752" y="142" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#92400E">输入仅做“阀门控制”</text>
  <text x="752" y="156" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#92400E">供电轨才是“供水主管道”</text>
</svg>`;

export const SHEET_ACT3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 340" role="img" aria-label="真实运放内部剥壳 VCVS 受控源等效电路模型">
  <defs>
    <marker id="act3-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB"/>
    </marker>
    <marker id="act3-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="860" height="340" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="430" y="28" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#0F172A">真实运放剥壳等效模型（输入电阻 R_i + 压控电压源 A·v_d + 输出电阻 R_o）</text>

  <!-- Chip Dashed Boundary -->
  <rect x="130" y="54" width="510" height="240" rx="14" fill="#FFFFFF" stroke="#64748B" stroke-width="2" stroke-dasharray="8 5"/>
  <text x="148" y="76" font-family="sans-serif" font-size="12" font-weight="700" fill="#475569">真实运放芯片内部等效电路（线性区）</text>

  <!-- Input Terminals v2 (+) and v1 (-) -->
  <!-- v1 top (inverting) -->
  <line x1="65" y1="118" x2="220" y2="118" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="65" cy="118" r="4.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="52" y="122" text-anchor="end" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">v1 (−)</text>
  <line x1="88" y1="118" x2="122" y2="118" stroke="#2563EB" stroke-width="2" marker-end="url(#act3-arrow)"/>
  <text x="102" y="108" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563EB">i1</text>

  <!-- v2 bottom (non-inverting) -->
  <line x1="65" y1="238" x2="220" y2="238" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="65" cy="238" r="4.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="52" y="242" text-anchor="end" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">v2 (+)</text>
  <line x1="88" y1="238" x2="122" y2="238" stroke="#2563EB" stroke-width="2" marker-end="url(#act3-arrow)"/>
  <text x="102" y="256" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2563EB">i2</text>

  <!-- Input Resistor R_i -->
  <line x1="220" y1="118" x2="220" y2="146" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="206" y="146" width="28" height="64" rx="4" fill="#EFF6FF" stroke="#1D4ED8" stroke-width="2"/>
  <line x1="220" y1="210" x2="220" y2="238" stroke="#0F172A" stroke-width="2.2"/>
  <text x="244" y="174" font-family="sans-serif" font-size="14" font-weight="700" fill="#1D4ED8">R_i</text>
  <text x="244" y="192" font-family="sans-serif" font-size="11" fill="#475569">典型 2 MΩ</text>

  <!-- Differential Voltage v_d polarity (v2 - v1, so + at bottom v2, - at top v1) -->
  <text x="184" y="138" text-anchor="middle" font-family="monospace" font-size="16" font-weight="700" fill="#DC2626">−</text>
  <text x="184" y="182" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#DC2626">v_d = v2 − v1</text>
  <text x="184" y="226" text-anchor="middle" font-family="monospace" font-size="16" font-weight="700" fill="#DC2626">+</text>

  <!-- Coupling Dashed Arrow to VCVS -->
  <line x1="296" y1="178" x2="365" y2="178" stroke="#94A3B8" stroke-width="1.8" stroke-dasharray="4 4"/>
  <text x="330" y="168" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748B">压控耦合</text>

  <!-- Output Stage: VCVS A*v_d + R_o -->
  <!-- Diamond VCVS centered at (415, 190) -->
  <polygon points="415,152 453,190 415,228 377,190" fill="#FEF3C7" stroke="#D97706" stroke-width="2.2"/>
  <text x="415" y="176" text-anchor="middle" font-family="monospace" font-size="15" font-weight="700" fill="#B45309">+</text>
  <text x="415" y="214" text-anchor="middle" font-family="monospace" font-size="15" font-weight="700" fill="#B45309">−</text>
  <text x="415" y="195" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#92400E">A·v_d</text>

  <!-- Wire from VCVS top to R_o -->
  <line x1="415" y1="152" x2="415" y2="118" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="415" y1="118" x2="482" y2="118" stroke="#0F172A" stroke-width="2.2"/>

  <!-- Output Resistor R_o -->
  <rect x="482" y="105" width="76" height="26" rx="4" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
  <text x="520" y="123" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#047857">R_o</text>
  <text x="520" y="96" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">典型 75 Ω</text>

  <!-- Wire from R_o to Output Terminal v_o -->
  <line x1="558" y1="118" x2="735" y2="118" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="654" y1="118" x2="704" y2="118" stroke="#059669" stroke-width="2.4" marker-end="url(#act3-arrow-green)"/>
  <text x="678" y="106" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#059669">i_o</text>
  <circle cx="735" cy="118" r="4.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="748" y="122" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">v_o</text>

  <!-- Ground reference inside chip -->
  <line x1="415" y1="228" x2="415" y2="262" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="401" y1="262" x2="429" y2="262" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="406" y1="268" x2="424" y2="268" stroke="#0F172A" stroke-width="2"/>
  <line x1="411" y1="274" x2="419" y2="274" stroke="#0F172A" stroke-width="1.8"/>

  <!-- External Load R_L -->
  <line x1="735" y1="118" x2="735" y2="152" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="722" y="152" width="26" height="70" rx="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <text x="758" y="184" font-family="sans-serif" font-size="13" font-weight="700" fill="#0F172A">R_L</text>
  <text x="758" y="202" font-family="sans-serif" font-size="11" fill="#475569">2 kΩ</text>
  <line x1="735" y1="222" x2="735" y2="262" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="721" y1="262" x2="749" y2="262" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="726" y1="268" x2="744" y2="268" stroke="#0F172A" stroke-width="2"/>
  <line x1="731" y1="274" x2="739" y2="274" stroke="#0F172A" stroke-width="1.8"/>

  <!-- Bottom Thevenin Note -->
  <text x="430" y="320" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#334155">W2-L7 视角映射：输出端左侧即戴维南等效（V_Th = A·v_d，R_Th = R_o），外接负载时形成分压 v_o = [R_L/(R_o+R_L)]·A·v_d</text>
</svg>`;

export const SHEET_ACT4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 365" role="img" aria-label="真实运放三区传输特性曲线与微伏级线性区放大窗口及双单电源摆幅对比">
  <defs>
    <marker id="act4-axis" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
    <marker id="act4-red-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="860" height="365" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="430" y="28" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#0F172A">真实运放三区传输特性曲线：±90 μV 极窄线性悬崖与双/单电源摆幅</text>

  <!-- Left Main Plot Box -->
  <rect x="24" y="46" width="446" height="298" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/>
  <text x="247" y="68" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1E293B">宏观传输特性（双电源 ±9V 实线 vs 单电源 +9V/0V 虚线）</text>

  <!-- Axes for Main Plot (Origin at 245, 200) -->
  <line x1="55" y1="200" x2="445" y2="200" stroke="#334155" stroke-width="1.6" marker-end="url(#act4-axis)"/>
  <line x1="245" y1="322" x2="245" y2="82" stroke="#334155" stroke-width="1.6" marker-end="url(#act4-axis)"/>
  <text x="448" y="218" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="700" fill="#334155">v_d = v2 − v1</text>
  <text x="255" y="92" font-family="sans-serif" font-size="12" font-weight="700" fill="#334155">v_o (V)</text>

  <!-- Highlight Linear Region Band -->
  <rect x="233" y="106" width="24" height="188" fill="#FEF3C7" fill-opacity="0.8"/>

  <!-- Rail Guide Lines -->
  <line x1="70" y1="112" x2="425" y2="112" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="239" y="108" text-anchor="end" font-family="monospace" font-size="11" font-weight="700" fill="#DC2626">+9V</text>
  <line x1="70" y1="127" x2="425" y2="127" stroke="#F59E0B" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="430" y="131" text-anchor="end" font-family="monospace" font-size="10" font-weight="700" fill="#D97706">+7.5V(实测)</text>
  <line x1="70" y1="288" x2="425" y2="288" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="239" y="298" text-anchor="end" font-family="monospace" font-size="11" font-weight="700" fill="#2563EB">−9V</text>

  <!-- Dual ±9V Curve (Blue/Red solid) -->
  <polyline points="72,288 233,288 257,112 422,112" fill="none" stroke="#1D4ED8" stroke-width="3"/>

  <!-- Single +9V/0V LM358 Curve (Orange dashed) -->
  <polyline points="72,197 245,197 255,127 422,127" fill="none" stroke="#EA580C" stroke-width="2.4" stroke-dasharray="6 4"/>

  <!-- Region Labels -->
  <rect x="76" y="252" width="122" height="24" rx="4" fill="#EFF6FF" stroke="#93C5FD"/>
  <text x="137" y="268" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#1D4ED8">负饱和区 (−V_EE)</text>

  <rect x="292" y="82" width="124" height="24" rx="4" fill="#FEF2F2" stroke="#FCA5A5"/>
  <text x="354" y="98" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#DC2626">正饱和区 (+V_CC)</text>

  <text x="148" y="188" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#C2410C">单电源下限 ≈ 0 V</text>

  <!-- Zoom Box indicator on main plot -->
  <rect x="225" y="102" width="40" height="196" rx="4" fill="none" stroke="#D97706" stroke-width="1.5" stroke-dasharray="3 2"/>
  <line x1="265" y1="150" x2="492" y2="120" stroke="#D97706" stroke-width="1.2" stroke-dasharray="4 3"/>

  <!-- Right Panel: Magnified Linear Window -->
  <rect x="492" y="46" width="344" height="298" rx="10" fill="#FFFFFF" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="664" y="68" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#B45309">微伏级线性区放大窗口（A = 10⁵, ±9 V）</text>

  <!-- Zoom Axes (Origin at 650, 198) -->
  <line x1="516" y1="198" x2="812" y2="198" stroke="#334155" stroke-width="1.5" marker-end="url(#act4-axis)"/>
  <line x1="650" y1="302" x2="650" y2="86" stroke="#334155" stroke-width="1.5" marker-end="url(#act4-axis)"/>
  <text x="816" y="214" text-anchor="end" font-family="sans-serif" font-size="11" font-weight="700" fill="#334155">v_d (μV)</text>
  <text x="658" y="96" font-family="sans-serif" font-size="11" font-weight="700" fill="#334155">v_o (V)</text>

  <!-- Shaded Linear Region [-90 uV, +90 uV] -> x from 575 to 725 -->
  <rect x="575" y="114" width="150" height="168" fill="#FEF3C7" fill-opacity="0.65"/>
  <line x1="575" y1="198" x2="575" y2="282" stroke="#D97706" stroke-width="1.2" stroke-dasharray="3 3"/>
  <line x1="725" y1="114" x2="725" y2="198" stroke="#D97706" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="575" y="191" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#B45309">−90 μV</text>
  <text x="725" y="214" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#B45309">+90 μV</text>

  <!-- Zoomed Curve -->
  <polyline points="522,282 575,282 725,114 804,114" fill="none" stroke="#1D4ED8" stroke-width="3"/>
  <circle cx="575" cy="282" r="4.5" fill="#DC2626"/>
  <circle cx="725" cy="114" r="4.5" fill="#DC2626"/>
  <text x="688" y="156" font-family="sans-serif" font-size="11" font-weight="700" fill="#1D4ED8">斜率 = A = 10⁵</text>
  <text x="642" y="118" text-anchor="end" font-family="monospace" font-size="11" fill="#334155">+9 V</text>
  <text x="642" y="286" text-anchor="end" font-family="monospace" font-size="11" fill="#334155">−9 V</text>

  <!-- 3 mV Offset Voltage Callout -->
  <rect x="514" y="306" width="302" height="30" rx="6" fill="#FEF2F2" stroke="#FCA5A5"/>
  <text x="665" y="325" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#991B1B">真实失调电压 V_OS ≈ 3 mV = 3000 μV（33.3 倍于饱和边界 90 μV！）→</text>
</svg>`;

export const SHEET_ACT5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 270" role="img" aria-label="开环比较器工作模式与负反馈线性区锁定对比">
  <defs>
    <marker id="act5-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="860" height="270" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="430" y="28" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#0F172A">两种工程命运：开环裸奔（比较器） vs 负反馈闭环（线性放大器 · W3-L2 预告）</text>

  <!-- Left Card: Open-Loop Comparator -->
  <rect x="24" y="46" width="396" height="206" rx="10" fill="#FFFFFF" stroke="#FCA5A5" stroke-width="1.5"/>
  <text x="222" y="68" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#DC2626">① 开环（无负反馈）→ 比较器模式</text>
  <polygon points="150,92 150,174 236,133" fill="#FEF2F2" stroke="#0F172A" stroke-width="2.2"/>
  <text x="160" y="120" font-family="monospace" font-size="16" font-weight="700" fill="#0F172A">−</text>
  <text x="160" y="158" font-family="monospace" font-size="16" font-weight="700" fill="#0F172A">+</text>
  <line x1="90" y1="115" x2="150" y2="115" stroke="#0F172A" stroke-width="2"/>
  <line x1="90" y1="151" x2="150" y2="151" stroke="#0F172A" stroke-width="2"/>
  <line x1="236" y1="133" x2="310" y2="133" stroke="#DC2626" stroke-width="2.4"/>
  <text x="84" y="119" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="700" fill="#334155">V_ref</text>
  <text x="84" y="155" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="700" fill="#334155">v_in</text>
  <text x="318" y="137" font-family="sans-serif" font-size="12" font-weight="700" fill="#DC2626">v_o (高低电平)</text>
  <rect x="44" y="188" width="356" height="50" rx="6" fill="#FEF2F2"/>
  <text x="222" y="208" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#991B1B">v_in &gt; V_ref ⇒ 立刻拍顶 (+V_CC)</text>
  <text x="222" y="227" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#991B1B">v_in &lt; V_ref ⇒ 立刻拍底 (−V_EE 或 0 V)</text>

  <!-- Right Card: Negative Feedback Preview -->
  <rect x="440" y="46" width="396" height="206" rx="10" fill="#FFFFFF" stroke="#6EE7B7" stroke-width="1.5"/>
  <text x="638" y="68" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#059669">② 引入负反馈（输出→反相端）→ 锁回线性区</text>
  <polygon points="566,110 566,184 646,147" fill="#ECFDF5" stroke="#0F172A" stroke-width="2.2"/>
  <text x="576" y="135" font-family="monospace" font-size="16" font-weight="700" fill="#0F172A">−</text>
  <text x="576" y="170" font-family="monospace" font-size="16" font-weight="700" fill="#0F172A">+</text>
  <line x1="506" y1="130" x2="566" y2="130" stroke="#0F172A" stroke-width="2"/>
  <line x1="506" y1="164" x2="566" y2="164" stroke="#0F172A" stroke-width="2"/>
  <line x1="646" y1="147" x2="732" y2="147" stroke="#059669" stroke-width="2.4"/>
  <!-- Feedback Loop -->
  <polyline points="694,147 694,88 532,88 532,130" fill="none" stroke="#059669" stroke-width="2.2" marker-end="url(#act5-arrow)"/>
  <rect x="582" y="77" width="60" height="22" rx="4" fill="#D1FAE5" stroke="#059669" stroke-width="1.6"/>
  <text x="612" y="92" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#065F46">负反馈 R_f</text>
  <circle cx="694" cy="147" r="3.5" fill="#059669"/>
  <circle cx="532" cy="130" r="3.5" fill="#059669"/>
  <text x="740" y="151" font-family="sans-serif" font-size="12" font-weight="700" fill="#059669">v_o (线性)</text>
  <rect x="460" y="196" width="356" height="42" rx="6" fill="#ECFDF5"/>
  <text x="638" y="214" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#065F46">负反馈自动将 v_d 压回 μV 级线性区</text>
  <text x="638" y="231" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#047857">为 W3-L2“虚短 v1 ≈ v2”奠定物理基石</text>
</svg>`;

export const MINI_STEP1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" width="320" height="110"><rect x="2" y="2" width="316" height="106" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><line x1="30" y1="55" x2="290" y2="55" stroke="#334155" stroke-width="1.5"/><rect x="100" y="35" width="120" height="40" fill="#FEF3C7" stroke="#D97706" stroke-dasharray="3 2"/><text x="100" y="92" text-anchor="middle" font-family="monospace" font-size="10" fill="#B45309">-90uV</text><text x="160" y="92" text-anchor="middle" font-family="monospace" font-size="10" fill="#334155">0</text><text x="220" y="92" text-anchor="middle" font-family="monospace" font-size="10" fill="#B45309">+90uV</text><circle cx="200" cy="55" r="5" fill="#059669"/><text x="200" y="28" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#059669">v_d = +60 uV</text></svg>`;

export const MINI_STEP2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" width="320" height="110"><rect x="2" y="2" width="316" height="106" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><polygon points="160,18 196,54 160,90 124,54" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/><text x="160" y="58" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#92400E">A·v_d</text><text x="66" y="58" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">v_d=+60uV</text><text x="255" y="58" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#059669">v_oc = ?</text></svg>`;

export const MINI_STEP3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" width="320" height="110"><rect x="2" y="2" width="316" height="106" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><line x1="60" y1="30" x2="160" y2="30" stroke="#0F172A" stroke-width="2"/><line x1="60" y1="80" x2="160" y2="80" stroke="#0F172A" stroke-width="2"/><rect x="148" y="36" width="24" height="38" fill="#EFF6FF" stroke="#1D4ED8" stroke-width="2"/><text x="236" y="52" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#1D4ED8">R_i = 2 MΩ</text><text x="236" y="70" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">i_in = v_d / R_i</text></svg>`;

export const MINI_STEP4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" width="320" height="110"><rect x="2" y="2" width="316" height="106" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/><text x="46" y="52" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#B45309">+6.00V</text><line x1="74" y1="48" x2="104" y2="48" stroke="#0F172A" stroke-width="2"/><rect x="104" y="38" width="52" height="20" fill="#ECFDF5" stroke="#059669" stroke-width="1.8"/><text x="130" y="52" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#047857">75Ω</text><line x1="156" y1="48" x2="214" y2="48" stroke="#0F172A" stroke-width="2"/><rect x="202" y="54" width="24" height="34" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/><text x="266" y="75" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F172A">R_L=1.5kΩ</text></svg>`;

export const MINI_STEP5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" width="320" height="110"><rect x="2" y="2" width="316" height="106" rx="8" fill="#FEF2F2" stroke="#FCA5A5"/><polyline points="35,88 125,88 165,28 285,28" fill="none" stroke="#1D4ED8" stroke-width="2.5"/><circle cx="235" cy="28" r="5" fill="#DC2626"/><text x="235" y="48" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#991B1B">v_d=+160uV 越界拍顶!</text></svg>`;
