// The lesson sheet's act diagrams (docs/lessons/W3-L7.md §1.2, §2.2, §3.2, §4.2, §5.2). They are drawn
// for a light canvas already, so they are not passed through lightSvg. Changes, all of form:
// - marker ids carry a w37 prefix (several diagrams share one page);
// - the dark slate banners of acts 2, 4 and 5 are light tinted boxes with ink text (house theme);
// - the "⚠" glyphs are dropped (they render as emoji on some systems), the words stay;
// - act 3: the sheet's draft leftovers under R₂ (an invisible rect, a stray wire stub and a note
//   to itself) are removed and R₂ is drawn clear of the node it hangs on;
// - act 5: R_G leaves the v₋₁ wire at x = 158 so it no longer runs on top of R_f1's wire.

/** act 1 · 无源加载塌陷 vs 理想运放零加载 */
export const SVG_ACT1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 340" width="820" height="340">
  <defs>
    <marker id="w37a1-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626"/>
    </marker>
    <marker id="w37a1-teal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0D9488"/>
    </marker>
  </defs>
  <rect width="820" height="340" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <rect x="16" y="16" width="384" height="308" rx="8" fill="#FFF7ED" stroke="#FDBA74" stroke-width="1.5"/>
  <text x="32" y="42" font-family="sans-serif" font-size="14" font-weight="bold" fill="#9A3412">A. 无源分压器直连：后级抽流导致加载塌陷</text>
  <text x="32" y="60" font-family="sans-serif" font-size="11.5" fill="#C2410C">空载 A₁ = 0.5, A₂ = 0.5，但直连后 A = 0.20 ≠ 0.25</text>
  <circle cx="48" cy="120" r="4" fill="#0F172A"/>
  <text x="26" y="108" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0F172A">vᵢ = 10V</text>
  <line x1="52" y1="120" x2="80" y2="120" stroke="#0F172A" stroke-width="2"/>
  <rect x="80" y="110" width="54" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="107" y="124" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#0F172A">10kΩ</text>
  <line x1="134" y1="120" x2="176" y2="120" stroke="#0F172A" stroke-width="2"/>
  <circle cx="176" cy="120" r="4.5" fill="#DC2626"/>
  <rect x="142" y="76" width="96" height="26" rx="13" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.2"/>
  <text x="190" y="93" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#B91C1C">v₁ = 4.0 V ↓</text>
  <line x1="176" y1="120" x2="176" y2="148" stroke="#0F172A" stroke-width="2"/>
  <rect x="166" y="148" width="20" height="50" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="158" y="177" text-anchor="end" font-family="sans-serif" font-size="11" fill="#0F172A">10kΩ</text>
  <line x1="176" y1="198" x2="176" y2="232" stroke="#0F172A" stroke-width="2"/>
  <line x1="184" y1="120" x2="234" y2="120" stroke="#DC2626" stroke-width="2.2" marker-end="url(#w37a1-red)"/>
  <text x="208" y="140" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#DC2626">i_load = 0.2mA</text>
  <rect x="238" y="110" width="54" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="265" y="124" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#0F172A">10kΩ</text>
  <line x1="292" y1="120" x2="344" y2="120" stroke="#0F172A" stroke-width="2"/>
  <circle cx="344" cy="120" r="4.5" fill="#DC2626"/>
  <rect x="304" y="76" width="82" height="26" rx="13" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.2"/>
  <text x="345" y="93" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#B91C1C">vₒ = 2.0 V</text>
  <line x1="322" y1="120" x2="322" y2="148" stroke="#0F172A" stroke-width="2"/>
  <rect x="312" y="148" width="20" height="50" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="340" y="177" text-anchor="start" font-family="sans-serif" font-size="11" fill="#0F172A">10kΩ</text>
  <line x1="322" y1="198" x2="322" y2="232" stroke="#0F172A" stroke-width="2"/>
  <line x1="48" y1="232" x2="344" y2="232" stroke="#475569" stroke-width="2"/>
  <line x1="238" y1="232" x2="238" y2="246" stroke="#475569" stroke-width="2"/>
  <line x1="226" y1="246" x2="250" y2="246" stroke="#475569" stroke-width="2"/>
  <line x1="231" y1="252" x2="245" y2="252" stroke="#475569" stroke-width="1.8"/>
  <line x1="235" y1="258" x2="241" y2="258" stroke="#475569" stroke-width="1.5"/>
  <rect x="32" y="272" width="352" height="38" rx="6" fill="#FFEDD5" stroke="#FB923C" stroke-width="1"/>
  <text x="208" y="288" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#9A3412">原因：第一级输出内阻 R_th1 = 5 kΩ ≠ 0</text>
  <text x="208" y="303" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#9A3412">第二级 20 kΩ 并联下拉，导致 v₁ 从 5V 塌陷至 4V（误差 -20%）</text>
  <rect x="420" y="16" width="384" height="308" rx="8" fill="#F0FDFA" stroke="#5EEAD4" stroke-width="1.5"/>
  <text x="436" y="42" font-family="sans-serif" font-size="14" font-weight="bold" fill="#115E59">B. 插入理想运放隔离：R_o = 0 零加载效应</text>
  <text x="436" y="60" font-family="sans-serif" font-size="11.5" fill="#0F766E">级间零电流耦合，A = A₁ × A₂ = 0.5 × 0.5 = 0.25 严格成立</text>
  <circle cx="446" cy="120" r="4" fill="#0F172A"/>
  <text x="432" y="108" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0F172A">10V</text>
  <line x1="450" y1="120" x2="466" y2="120" stroke="#0F172A" stroke-width="2"/>
  <rect x="466" y="110" width="44" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="488" y="124" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#0F172A">10k</text>
  <line x1="510" y1="120" x2="532" y2="120" stroke="#0F172A" stroke-width="2"/>
  <circle cx="526" cy="120" r="3.5" fill="#0D9488"/>
  <line x1="526" y1="120" x2="526" y2="152" stroke="#0F172A" stroke-width="2"/>
  <rect x="516" y="152" width="20" height="44" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="510" y="178" text-anchor="end" font-family="sans-serif" font-size="10.5" fill="#0F172A">10k</text>
  <line x1="526" y1="196" x2="526" y2="232" stroke="#0F172A" stroke-width="2"/>
  <line x1="526" y1="120" x2="564" y2="120" stroke="#0D9488" stroke-width="2"/>
  <text x="546" y="113" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0D9488">i₊=0</text>
  <polygon points="564,104 564,158 616,131" fill="#FFFFFF" stroke="#0F766E" stroke-width="2"/>
  <text x="572" y="124" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0F766E">+</text>
  <text x="572" y="149" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0F766E">−</text>
  <polyline points="616,131 634,131 634,174 548,174 548,144 564,144" fill="none" stroke="#0F766E" stroke-width="1.8"/>
  <circle cx="634" cy="131" r="4" fill="#0D9488"/>
  <rect x="578" y="74" width="84" height="24" rx="12" fill="#CCFBF1" stroke="#0D9488" stroke-width="1.2"/>
  <text x="620" y="90" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#115E59">v₁ = 5.0 V ✓</text>
  <line x1="634" y1="131" x2="674" y2="131" stroke="#0D9488" stroke-width="2" marker-end="url(#w37a1-teal)"/>
  <rect x="678" y="121" width="44" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="700" y="135" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#0F172A">10k</text>
  <line x1="722" y1="131" x2="776" y2="131" stroke="#0F172A" stroke-width="2"/>
  <circle cx="776" cy="131" r="4.5" fill="#0D9488"/>
  <rect x="708" y="74" width="84" height="24" rx="12" fill="#CCFBF1" stroke="#0D9488" stroke-width="1.2"/>
  <text x="750" y="90" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#115E59">vₒ = 2.5 V ✓</text>
  <line x1="752" y1="131" x2="752" y2="156" stroke="#0F172A" stroke-width="2"/>
  <rect x="742" y="156" width="20" height="44" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="768" y="182" text-anchor="start" font-family="sans-serif" font-size="10.5" fill="#0F172A">10k</text>
  <line x1="752" y1="200" x2="752" y2="232" stroke="#0F172A" stroke-width="2"/>
  <line x1="450" y1="232" x2="776" y2="232" stroke="#475569" stroke-width="2"/>
  <line x1="634" y1="232" x2="634" y2="246" stroke="#475569" stroke-width="2"/>
  <line x1="622" y1="246" x2="646" y2="246" stroke="#475569" stroke-width="2"/>
  <line x1="627" y1="252" x2="641" y2="252" stroke="#475569" stroke-width="1.8"/>
  <line x1="631" y1="258" x2="637" y2="258" stroke="#475569" stroke-width="1.5"/>
  <rect x="436" y="272" width="352" height="38" rx="6" fill="#CCFBF1" stroke="#2DD4BF" stroke-width="1"/>
  <text x="612" y="288" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#115E59">机理：输入端 i₊ = 0（不抽前级）且输出端 R_o = 0（硬顶后级）</text>
  <text x="612" y="303" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#115E59">后级所需 0.25 mA 电流由运放电源轨提供，v₁ 纹丝不动！</text>
</svg>`;

/** act 2 · Fig. 5.23 三级级联增益链 */
export const SVG_ACT2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 260" width="820" height="260">
  <defs>
    <marker id="w37a2-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB"/>
    </marker>
  </defs>
  <rect width="820" height="260" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="24" y="34" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0F172A">Sadiku Fig. 5.23：三级级联运放解耦框图与逐级电位追踪链（Eq. 5.21）</text>
  <circle cx="48" cy="130" r="5" fill="#1E40AF"/>
  <text x="48" y="112" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1E40AF">vᵢ</text>
  <line x1="53" y1="130" x2="108" y2="130" stroke="#2563EB" stroke-width="2.2" marker-end="url(#w37a2-blue)"/>
  <rect x="114" y="88" width="144" height="84" rx="10" fill="#EFF6FF" stroke="#3B82F6" stroke-width="2"/>
  <text x="186" y="114" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1E3A8A">Stage 1</text>
  <text x="186" y="135" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#2563EB">增益 A₁</text>
  <text x="186" y="156" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">R_o1 = 0（零内阻）</text>
  <line x1="258" y1="130" x2="328" y2="130" stroke="#2563EB" stroke-width="2.2" marker-end="url(#w37a2-blue)"/>
  <circle cx="294" cy="130" r="4.5" fill="#0D9488"/>
  <rect x="256" y="54" width="78" height="24" rx="12" fill="#CCFBF1" stroke="#0D9488" stroke-width="1.2"/>
  <text x="295" y="70" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#115E59">v₁ = A₁ vᵢ</text>
  <line x1="294" y1="78" x2="294" y2="124" stroke="#0D9488" stroke-width="1.2" stroke-dasharray="3,2"/>
  <rect x="334" y="88" width="144" height="84" rx="10" fill="#F0FDF4" stroke="#22C55E" stroke-width="2"/>
  <text x="406" y="114" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#14532D">Stage 2</text>
  <text x="406" y="135" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#16A34A">增益 A₂</text>
  <text x="406" y="156" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">R_o2 = 0（零内阻）</text>
  <line x1="478" y1="130" x2="548" y2="130" stroke="#2563EB" stroke-width="2.2" marker-end="url(#w37a2-blue)"/>
  <circle cx="514" cy="130" r="4.5" fill="#0D9488"/>
  <rect x="466" y="54" width="96" height="24" rx="12" fill="#CCFBF1" stroke="#0D9488" stroke-width="1.2"/>
  <text x="514" y="70" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#115E59">v₂ = A₁A₂ vᵢ</text>
  <line x1="514" y1="78" x2="514" y2="124" stroke="#0D9488" stroke-width="1.2" stroke-dasharray="3,2"/>
  <rect x="554" y="88" width="144" height="84" rx="10" fill="#FAF5FF" stroke="#A855F7" stroke-width="2"/>
  <text x="626" y="114" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#581C87">Stage 3</text>
  <text x="626" y="135" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#9333EA">增益 A₃</text>
  <text x="626" y="156" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">R_o3 = 0（零内阻）</text>
  <line x1="698" y1="130" x2="758" y2="130" stroke="#2563EB" stroke-width="2.2" marker-end="url(#w37a2-blue)"/>
  <circle cx="764" cy="130" r="5" fill="#7E22CE"/>
  <text x="764" y="110" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#7E22CE">vₒ</text>
  <rect x="44" y="196" width="732" height="44" rx="8" fill="#EEF2FF" stroke="#C7D2FE" stroke-width="1.2"/>
  <text x="410" y="223" text-anchor="middle" font-family="sans-serif" font-size="13.5" font-weight="bold" fill="#1E3A8A">Eq. 5.21：A = vₒ / vᵢ = (v₁ / vᵢ)·(v₂ / v₁)·(vₒ / v₂) = A₁ · A₂ · A₃   （前提：无跨级全局反馈且各级未饱和）</text>
</svg>`;

/** act 3 · 两级混合级联（反相 → 同相） */
export const SVG_ACT3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 320" width="820" height="320">
  <defs>
    <marker id="w37a3-cur" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706"/>
    </marker>
  </defs>
  <rect width="820" height="320" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="24" y="32" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0F172A">经典实战（一）：Stage 1 反相放大器 → Stage 2 同相放大器（±15V 供电）</text>
  <rect x="30" y="48" width="320" height="248" rx="8" fill="#EFF6FF" fill-opacity="0.45" stroke="#93C5FD" stroke-dasharray="5,4"/>
  <text x="44" y="68" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#1D4ED8">Stage 1：反相级（A₁ = −Rf1 / R1 = −5）</text>
  <rect x="372" y="48" width="424" height="248" rx="8" fill="#F0FDF4" fill-opacity="0.45" stroke="#86EFAC" stroke-dasharray="5,4"/>
  <text x="386" y="68" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#15803D">Stage 2：同相级（A₂ = 1 + Rf2 / R2 = +4）</text>
  <circle cx="54" cy="160" r="4.5" fill="#0F172A"/>
  <text x="54" y="144" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0F172A">vᵢ = 0.4V</text>
  <line x1="58" y1="160" x2="90" y2="160" stroke="#0F172A" stroke-width="2"/>
  <rect x="90" y="150" width="54" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="117" y="164" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#0F172A">R₁=2k</text>
  <line x1="144" y1="160" x2="210" y2="160" stroke="#0F172A" stroke-width="2"/>
  <circle cx="176" cy="160" r="3.5" fill="#0F172A"/>
  <text x="176" y="180" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">v₋₁ = 0V</text>
  <polyline points="176,160 176,104 218,104" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <rect x="218" y="94" width="60" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="248" y="108" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#0F172A">Rf₁=10k</text>
  <polyline points="278,104 316,104 316,176" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <polygon points="210,144 210,208 276,176" fill="#FFFFFF" stroke="#1E40AF" stroke-width="2.2"/>
  <text x="218" y="165" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1E40AF">−</text>
  <text x="218" y="197" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1E40AF">+</text>
  <text x="234" y="180" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#1E40AF">U₁</text>
  <polyline points="210,192 186,192 186,262" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <line x1="176" y1="262" x2="196" y2="262" stroke="#475569" stroke-width="2"/>
  <line x1="180" y1="267" x2="192" y2="267" stroke="#475569" stroke-width="1.6"/>
  <line x1="183" y1="272" x2="189" y2="272" stroke="#475569" stroke-width="1.4"/>
  <line x1="276" y1="176" x2="454" y2="176" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="316" cy="176" r="4" fill="#0D9488"/>
  <line x1="282" y1="188" x2="306" y2="188" stroke="#D97706" stroke-width="1.8" marker-end="url(#w37a3-cur)"/>
  <text x="294" y="204" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#B45309">i_o1 = −0.2mA</text>
  <rect x="330" y="140" width="90" height="24" rx="12" fill="#CCFBF1" stroke="#0D9488" stroke-width="1.2"/>
  <text x="375" y="156" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#115E59">v_o1 = −2.0 V</text>
  <text x="428" y="192" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#15803D">i₊₂ = 0</text>
  <polygon points="454,158 454,222 520,190" fill="#FFFFFF" stroke="#15803D" stroke-width="2.2"/>
  <text x="462" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="#15803D">+</text>
  <text x="462" y="211" font-family="sans-serif" font-size="14" font-weight="bold" fill="#15803D">−</text>
  <text x="478" y="194" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#15803D">U₂</text>
  <polyline points="454,206 426,206 426,248 486,248" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <circle cx="426" cy="248" r="3.5" fill="#0F172A"/>
  <rect x="378" y="238" width="40" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="398" y="252" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#0F172A">R₂=4k</text>
  <line x1="418" y1="248" x2="426" y2="248" stroke="#0F172A" stroke-width="1.8"/>
  <polyline points="378,248 370,248 370,270" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <line x1="360" y1="270" x2="380" y2="270" stroke="#475569" stroke-width="2"/>
  <line x1="364" y1="275" x2="376" y2="275" stroke="#475569" stroke-width="1.6"/>
  <line x1="367" y1="280" x2="373" y2="280" stroke="#475569" stroke-width="1.4"/>
  <rect x="486" y="238" width="60" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="516" y="252" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#0F172A">Rf₂=12k</text>
  <polyline points="546,248 594,248 594,190" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <circle cx="594" cy="190" r="4" fill="#0D9488"/>
  <line x1="520" y1="190" x2="736" y2="190" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="736" cy="190" r="4.5" fill="#7E22CE"/>
  <line x1="530" y1="176" x2="574" y2="176" stroke="#D97706" stroke-width="1.8" marker-end="url(#w37a3-cur)"/>
  <text x="556" y="166" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#B45309">i_o2 = −4.5mA</text>
  <circle cx="672" cy="190" r="3.5" fill="#0F172A"/>
  <line x1="672" y1="190" x2="672" y2="210" stroke="#0F172A" stroke-width="1.8"/>
  <rect x="660" y="210" width="24" height="44" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="690" y="236" font-family="sans-serif" font-size="11" fill="#0F172A">R_L = 2k</text>
  <line x1="672" y1="254" x2="672" y2="272" stroke="#0F172A" stroke-width="1.8"/>
  <line x1="662" y1="272" x2="682" y2="272" stroke="#475569" stroke-width="2"/>
  <line x1="666" y1="277" x2="678" y2="277" stroke="#475569" stroke-width="1.6"/>
  <line x1="669" y1="282" x2="675" y2="282" stroke="#475569" stroke-width="1.4"/>
  <rect x="686" y="140" width="96" height="26" rx="13" fill="#F3E8FF" stroke="#9333EA" stroke-width="1.4"/>
  <text x="734" y="157" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#6B21A8">vₒ = −8.0 V</text>
</svg>`;

/** act 4 · 三级混合级联与中间级饱和警报 */
export const SVG_ACT4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 330" width="820" height="330">
  <rect width="820" height="330" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="24" y="32" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0F172A">经典实战（二）：三级混合级联（反相 → 加法 → 衰减，电源轨 ±12V）</text>
  <circle cx="42" cy="140" r="4" fill="#0F172A"/>
  <text x="42" y="124" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0F172A">v₁=1.5V</text>
  <line x1="46" y1="140" x2="72" y2="140" stroke="#0F172A" stroke-width="1.8"/>
  <rect x="72" y="131" width="44" height="18" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.6"/>
  <text x="94" y="144" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#0F172A">2kΩ</text>
  <line x1="116" y1="140" x2="156" y2="140" stroke="#0F172A" stroke-width="1.8"/>
  <circle cx="136" cy="140" r="3" fill="#0F172A"/>
  <polyline points="136,140 136,92 162,92" fill="none" stroke="#0F172A" stroke-width="1.6"/>
  <rect x="162" y="83" width="48" height="18" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.6"/>
  <text x="186" y="96" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#0F172A">20kΩ</text>
  <polyline points="210,92 232,92 232,154" fill="none" stroke="#0F172A" stroke-width="1.6"/>
  <polygon points="156,126 156,182 212,154" fill="#FEF2F2" stroke="#DC2626" stroke-width="2.2"/>
  <text x="163" y="145" font-family="sans-serif" font-size="13" font-weight="bold" fill="#DC2626">−</text>
  <text x="163" y="173" font-family="sans-serif" font-size="12" font-weight="bold" fill="#DC2626">+</text>
  <text x="177" y="158" font-family="sans-serif" font-size="10" font-weight="bold" fill="#DC2626">U₁</text>
  <polyline points="156,168 136,168 136,204" fill="none" stroke="#0F172A" stroke-width="1.6"/>
  <line x1="128" y1="204" x2="144" y2="204" stroke="#475569" stroke-width="1.8"/>
  <line x1="131" y1="208" x2="141" y2="208" stroke="#475569" stroke-width="1.4"/>
  <line x1="212" y1="154" x2="298" y2="154" stroke="#DC2626" stroke-width="2.2"/>
  <circle cx="232" cy="154" r="4" fill="#DC2626"/>
  <rect x="196" y="48" width="146" height="32" rx="6" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
  <text x="269" y="62" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#B91C1C">U₁ 先行负饱和！</text>
  <text x="269" y="75" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#B91C1C">理论 −15V → 钳位 −12V</text>
  <rect x="298" y="145" width="46" height="18" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.6"/>
  <text x="321" y="158" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#0F172A">Ra=10k</text>
  <line x1="344" y1="154" x2="404" y2="154" stroke="#0F172A" stroke-width="1.8"/>
  <circle cx="272" cy="210" r="4" fill="#0F172A"/>
  <text x="272" y="230" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0F172A">v₂=2.0V</text>
  <line x1="276" y1="210" x2="298" y2="210" stroke="#0F172A" stroke-width="1.8"/>
  <rect x="298" y="201" width="46" height="18" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.6"/>
  <text x="321" y="214" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#0F172A">Rb=5k</text>
  <polyline points="344,210 374,210 374,154" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <circle cx="374" cy="154" r="3.5" fill="#0F172A"/>
  <polyline points="374,154 374,104 408,104" fill="none" stroke="#0F172A" stroke-width="1.6"/>
  <rect x="408" y="95" width="52" height="18" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.6"/>
  <text x="434" y="108" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#0F172A">Rf₂=10k</text>
  <polyline points="460,104 486,104 486,168" fill="none" stroke="#0F172A" stroke-width="1.6"/>
  <polygon points="404,140 404,196 460,168" fill="#FFFFFF" stroke="#15803D" stroke-width="2.2"/>
  <text x="411" y="159" font-family="sans-serif" font-size="13" font-weight="bold" fill="#15803D">−</text>
  <text x="411" y="187" font-family="sans-serif" font-size="12" font-weight="bold" fill="#15803D">+</text>
  <text x="425" y="172" font-family="sans-serif" font-size="10" font-weight="bold" fill="#15803D">U₂</text>
  <polyline points="404,182 388,182 388,236" fill="none" stroke="#0F172A" stroke-width="1.6"/>
  <line x1="380" y1="236" x2="396" y2="236" stroke="#475569" stroke-width="1.8"/>
  <line x1="383" y1="240" x2="393" y2="240" stroke="#475569" stroke-width="1.4"/>
  <line x1="460" y1="168" x2="548" y2="168" stroke="#0F172A" stroke-width="2"/>
  <circle cx="486" cy="168" r="3.5" fill="#D97706"/>
  <rect x="466" y="48" width="136" height="32" rx="6" fill="#FEF3C7" stroke="#D97706" stroke-width="1.2"/>
  <text x="534" y="62" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#92400E">v_o2 实测 = +8.0 V</text>
  <text x="534" y="75" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#92400E">（盲算误以为 +11.0 V）</text>
  <rect x="548" y="159" width="48" height="18" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.6"/>
  <text x="572" y="172" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#0F172A">R₃=20k</text>
  <line x1="596" y1="168" x2="646" y2="168" stroke="#0F172A" stroke-width="1.8"/>
  <circle cx="622" cy="168" r="3" fill="#0F172A"/>
  <polyline points="622,168 622,118 652,118" fill="none" stroke="#0F172A" stroke-width="1.6"/>
  <rect x="652" y="109" width="52" height="18" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.6"/>
  <text x="678" y="122" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#0F172A">Rf₃=10k</text>
  <polyline points="704,118 730,118 730,182" fill="none" stroke="#0F172A" stroke-width="1.6"/>
  <polygon points="646,154 646,210 702,182" fill="#FFFFFF" stroke="#7E22CE" stroke-width="2.2"/>
  <text x="653" y="173" font-family="sans-serif" font-size="13" font-weight="bold" fill="#7E22CE">−</text>
  <text x="653" y="201" font-family="sans-serif" font-size="12" font-weight="bold" fill="#7E22CE">+</text>
  <text x="667" y="186" font-family="sans-serif" font-size="10" font-weight="bold" fill="#7E22CE">U₃</text>
  <polyline points="646,196 630,196 630,236" fill="none" stroke="#0F172A" stroke-width="1.6"/>
  <line x1="622" y1="236" x2="638" y2="236" stroke="#475569" stroke-width="1.8"/>
  <line x1="625" y1="240" x2="635" y2="240" stroke="#475569" stroke-width="1.4"/>
  <line x1="702" y1="182" x2="774" y2="182" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="774" cy="182" r="4.5" fill="#7E22CE"/>
  <rect x="656" y="48" width="144" height="32" rx="6" fill="#F3E8FF" stroke="#9333EA" stroke-width="1.4"/>
  <text x="728" y="62" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#6B21A8">vₒ 实测 = −4.0 V</text>
  <text x="728" y="75" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B21A8">（盲算 −5.5V，误差 27.3%）</text>
  <rect x="24" y="266" width="772" height="46" rx="8" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.2"/>
  <text x="410" y="286" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1D4ED8">工程修复（Gain Staging）：将 U₁ 反馈改为 Rf₁ = 10 kΩ（A₁ = −5），将 U₂ 权重改为 Ra = 5 kΩ</text>
  <text x="410" y="303" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#334155">总线性公式不变，但各级电位变为 v_o1 = −7.5 V → v_o2 = +11.0 V → vₒ = −5.5 V，全链路零削波！</text>
</svg>`;

/** act 5 · 局部级联 vs 跨级全局反馈 */
export const SVG_ACT5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 340" width="820" height="340">
  <rect width="820" height="340" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="24" y="32" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0F172A">辨析台：加上一根跨级全局负反馈电阻 R_G = 30 kΩ，总增益从 −6 骤变为 −2！</text>
  <polyline points="158,188 158,72 390,72" fill="none" stroke="#DC2626" stroke-width="2.4"/>
  <rect x="390" y="60" width="96" height="24" rx="4" fill="#FEE2E2" stroke="#DC2626" stroke-width="2"/>
  <text x="438" y="76" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#B91C1C">R_G = 30 kΩ</text>
  <polyline points="486,72 720,72 720,210" fill="none" stroke="#DC2626" stroke-width="2.4"/>
  <circle cx="720" cy="210" r="4.5" fill="#DC2626"/>
  <rect x="520" y="42" width="186" height="22" rx="11" fill="#DC2626"/>
  <text x="613" y="57" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#FFFFFF">跨级全局反馈支路（破坏级联）</text>
  <circle cx="52" cy="188" r="4.5" fill="#0F172A"/>
  <text x="52" y="172" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0F172A">vᵢ = 1.0V</text>
  <line x1="56" y1="188" x2="88" y2="188" stroke="#0F172A" stroke-width="2"/>
  <rect x="88" y="178" width="54" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="115" y="192" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#0F172A">R₁=10k</text>
  <line x1="142" y1="188" x2="216" y2="188" stroke="#0F172A" stroke-width="2"/>
  <circle cx="172" cy="188" r="4.5" fill="#DC2626"/>
  <text x="158" y="210" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#DC2626">v₋₁ = 0</text>
  <polyline points="172,188 172,130 222,130" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <rect x="222" y="120" width="60" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="252" y="134" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#0F172A">Rf₁=20k</text>
  <polyline points="282,130 330,130 330,204" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <polygon points="216,172 216,236 284,204" fill="#FFFFFF" stroke="#1E40AF" stroke-width="2.2"/>
  <text x="224" y="193" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1E40AF">−</text>
  <text x="224" y="225" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1E40AF">+</text>
  <text x="242" y="208" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#1E40AF">U₁</text>
  <polyline points="216,220 192,220 192,262" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <line x1="182" y1="262" x2="202" y2="262" stroke="#475569" stroke-width="2"/>
  <line x1="186" y1="267" x2="198" y2="267" stroke="#475569" stroke-width="1.5"/>
  <line x1="284" y1="204" x2="482" y2="204" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="330" cy="204" r="4" fill="#0D9488"/>
  <rect x="346" y="168" width="116" height="24" rx="12" fill="#CCFBF1" stroke="#0D9488" stroke-width="1.2"/>
  <text x="404" y="184" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#115E59">v_o1 = −2/3 V</text>
  <polygon points="482,184 482,248 550,216" fill="#FFFFFF" stroke="#15803D" stroke-width="2.2"/>
  <text x="490" y="206" font-family="sans-serif" font-size="13" font-weight="bold" fill="#15803D">+</text>
  <text x="490" y="237" font-family="sans-serif" font-size="14" font-weight="bold" fill="#15803D">−</text>
  <text x="508" y="220" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#15803D">U₂</text>
  <text x="514" y="176" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#15803D">局部 A₂ = +3</text>
  <polyline points="482,232 456,232 456,270 518,270" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <circle cx="456" cy="270" r="3.5" fill="#0F172A"/>
  <rect x="394" y="260" width="52" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="420" y="274" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#0F172A">R₂=10k</text>
  <line x1="446" y1="270" x2="456" y2="270" stroke="#0F172A" stroke-width="1.8"/>
  <polyline points="394,270 384,270 384,284" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <line x1="374" y1="284" x2="394" y2="284" stroke="#475569" stroke-width="2"/>
  <rect x="518" y="260" width="60" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
  <text x="548" y="274" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#0F172A">Rf₂=20k</text>
  <polyline points="578,270 634,270 634,210" fill="none" stroke="#0F172A" stroke-width="1.8"/>
  <circle cx="634" cy="210" r="4" fill="#0F172A"/>
  <line x1="550" y1="210" x2="770" y2="210" stroke="#0F172A" stroke-width="2.2"/>
  <circle cx="770" cy="210" r="4.5" fill="#7E22CE"/>
  <rect x="652" y="168" width="144" height="26" rx="13" fill="#F3E8FF" stroke="#9333EA" stroke-width="1.4"/>
  <text x="724" y="185" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#6B21A8">vₒ = −2.0 V (A = −2)</text>
  <rect x="24" y="294" width="772" height="34" rx="6" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.2"/>
  <text x="410" y="315" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0F172A">对比：断开 R_G 时纯级联 A = (−2)×(+3) = −6（vₒ = −6V）；闭合 R_G = 30kΩ 时全局节点法得 A = −2（vₒ = −2V）</text>
</svg>`;
