// The inline SVGs of the W5-L5 lesson sheet (docs/lessons/W5-L5.md), copied from the sheet by a
// script, not retyped: the six act diagrams and the five step diagrams of the guided-example JSON.
// They are drawn for a dark canvas; svgs.ts recolours them for the light theme and adjusts them.

export const SHEET_ACT1 = String.raw`<svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:760px;background:#0F172A;border-radius:10px;">
  <rect x="0" y="0" width="760" height="400" rx="10" fill="#0F172A"/>
  <text x="380" y="28" fill="#F8FAFC" font-size="15" font-weight="bold" text-anchor="middle" font-family="sans-serif">三曲线同屏示波器：v(t)、i(t) 与二倍频瞬时功率 p(t)（相位差 Δθ = 60°）</text>
  <text x="380" y="46" fill="#94A3B8" font-size="11" text-anchor="middle" font-family="sans-serif">v(t)=120cos(ωt+45°) V | i(t)=10cos(ωt-15°) A | p(t)=300+600cos(2ωt+30°) W</text>
  <line x1="75.0" y1="58" x2="75.0" y2="335" stroke="#334155" stroke-width="1" stroke-dasharray="3,4"/>
  <text x="75.0" y="352" fill="#94A3B8" font-size="11" text-anchor="middle" font-family="monospace">0</text>
  <line x1="233.8" y1="58" x2="233.8" y2="335" stroke="#334155" stroke-width="1" stroke-dasharray="3,4"/>
  <text x="233.8" y="352" fill="#94A3B8" font-size="11" text-anchor="middle" font-family="monospace">T/4 (90°)</text>
  <line x1="392.5" y1="58" x2="392.5" y2="335" stroke="#334155" stroke-width="1" stroke-dasharray="3,4"/>
  <text x="392.5" y="352" fill="#94A3B8" font-size="11" text-anchor="middle" font-family="monospace">T/2 (180°)</text>
  <line x1="551.2" y1="58" x2="551.2" y2="335" stroke="#334155" stroke-width="1" stroke-dasharray="3,4"/>
  <text x="551.2" y="352" fill="#94A3B8" font-size="11" text-anchor="middle" font-family="monospace">3T/4 (270°)</text>
  <line x1="710.0" y1="58" x2="710.0" y2="335" stroke="#334155" stroke-width="1" stroke-dasharray="3,4"/>
  <text x="710.0" y="352" fill="#94A3B8" font-size="11" text-anchor="middle" font-family="monospace">T (360°)</text>
  <line x1="75" y1="80.0" x2="710" y2="80.0" stroke="#334155" stroke-width="1" stroke-dasharray="2,4"/>
  <line x1="75" y1="260.0" x2="710" y2="260.0" stroke="#334155" stroke-width="1" stroke-dasharray="2,4"/>
  <line x1="75" y1="215" x2="724" y2="215" stroke="#CBD5E1" stroke-width="1.5"/>
  <line x1="75" y1="54" x2="75" y2="338" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="728" y="219" fill="#CBD5E1" font-size="12" font-family="monospace">ωt</text>
  <polygon points="163.2,215.0 163.2,227.9 172.0,238.9 180.8,247.9 189.7,254.6 198.5,258.6 207.3,260.0 216.1,258.6 224.9,254.6 233.8,247.9 242.6,238.9 251.4,227.9 260.2,215.0" fill="#EF4444" fill-opacity="0.30" stroke="none"/>
  <polygon points="480.7,215.0 480.7,227.9 489.5,238.9 498.3,247.9 507.2,254.6 516.0,258.6 524.8,260.0 533.6,258.6 542.4,254.6 551.2,247.9 560.1,238.9 568.9,227.9 577.7,215.0" fill="#EF4444" fill-opacity="0.30" stroke="none"/>
  <line x1="75" y1="170.0" x2="710" y2="170.0" stroke="#F59E0B" stroke-width="2" stroke-dasharray="8,5"/>
  <text x="704" y="164.0" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="end" font-family="sans-serif">平均功率 P = +300 W（直流偏置）</text>
  <text x="67" y="84.0" fill="#A78BFA" font-size="10" text-anchor="end" font-family="monospace">+900W</text>
  <text x="67" y="174.0" fill="#FBBF24" font-size="10" text-anchor="end" font-family="monospace">+300W</text>
  <text x="67" y="219" fill="#CBD5E1" font-size="10" text-anchor="end" font-family="monospace">0</text>
  <text x="67" y="264.0" fill="#F87171" font-size="10" text-anchor="end" font-family="monospace">-300W</text>
  <polyline points="75.0,151.4 83.8,157.1 92.6,163.4 101.5,170.0 110.3,177.0 119.1,184.2 127.9,191.7 136.7,199.4 145.6,207.2 154.4,215.0 163.2,222.8 172.0,230.6 180.8,238.3 189.7,245.8 198.5,253.0 207.3,260.0 216.1,266.6 224.9,272.9 233.8,278.6 242.6,283.9 251.4,288.7 260.2,292.9 269.0,296.6 277.8,299.6 286.7,301.9 295.5,303.6 304.3,304.7 313.1,305.0 321.9,304.7 330.8,303.6 339.6,301.9 348.4,299.6 357.2,296.6 366.0,292.9 374.9,288.7 383.7,283.9 392.5,278.6 401.3,272.9 410.1,266.6 419.0,260.0 427.8,253.0 436.6,245.8 445.4,238.3 454.2,230.6 463.1,222.8 471.9,215.0 480.7,207.2 489.5,199.4 498.3,191.7 507.2,184.2 516.0,177.0 524.8,170.0 533.6,163.4 542.4,157.1 551.2,151.4 560.1,146.1 568.9,141.3 577.7,137.1 586.5,133.4 595.3,130.4 604.2,128.1 613.0,126.4 621.8,125.3 630.6,125.0 639.4,125.3 648.3,126.4 657.1,128.1 665.9,130.4 674.7,133.4 683.5,137.1 692.4,141.3 701.2,146.1 710.0,151.4" fill="none" stroke="#38BDF8" stroke-width="2.2"/>
  <polyline points="75.0,152.2 83.8,151.0 92.6,150.2 101.5,150.0 110.3,150.2 119.1,151.0 127.9,152.2 136.7,153.9 145.6,156.1 154.4,158.7 163.2,161.8 172.0,165.2 180.8,169.0 189.7,173.2 198.5,177.7 207.3,182.5 216.1,187.5 224.9,192.8 233.8,198.2 242.6,203.7 251.4,209.3 260.2,215.0 269.0,220.7 277.8,226.3 286.7,231.8 295.5,237.2 304.3,242.5 313.1,247.5 321.9,252.3 330.8,256.8 339.6,261.0 348.4,264.8 357.2,268.2 366.0,271.3 374.9,273.9 383.7,276.1 392.5,277.8 401.3,279.0 410.1,279.8 419.0,280.0 427.8,279.8 436.6,279.0 445.4,277.8 454.2,276.1 463.1,273.9 471.9,271.3 480.7,268.2 489.5,264.8 498.3,261.0 507.2,256.8 516.0,252.3 524.8,247.5 533.6,242.5 542.4,237.2 551.2,231.8 560.1,226.3 568.9,220.7 577.7,215.0 586.5,209.3 595.3,203.7 604.2,198.2 613.0,192.8 621.8,187.5 630.6,182.5 639.4,177.7 648.3,173.2 657.1,169.0 665.9,165.2 674.7,161.8 683.5,158.7 692.4,156.1 701.2,153.9 710.0,152.2" fill="none" stroke="#34D399" stroke-width="2.2"/>
  <polyline points="75.0,92.1 83.8,101.1 92.6,112.1 101.5,125.0 110.3,139.2 119.1,154.4 127.9,170.0 136.7,185.6 145.6,200.8 154.4,215.0 163.2,227.9 172.0,238.9 180.8,247.9 189.7,254.6 198.5,258.6 207.3,260.0 216.1,258.6 224.9,254.6 233.8,247.9 242.6,238.9 251.4,227.9 260.2,215.0 269.0,200.8 277.8,185.6 286.7,170.0 295.5,154.4 304.3,139.2 313.1,125.0 321.9,112.1 330.8,101.1 339.6,92.1 348.4,85.4 357.2,81.4 366.0,80.0 374.9,81.4 383.7,85.4 392.5,92.1 401.3,101.1 410.1,112.1 419.0,125.0 427.8,139.2 436.6,154.4 445.4,170.0 454.2,185.6 463.1,200.8 471.9,215.0 480.7,227.9 489.5,238.9 498.3,247.9 507.2,254.6 516.0,258.6 524.8,260.0 533.6,258.6 542.4,254.6 551.2,247.9 560.1,238.9 568.9,227.9 577.7,215.0 586.5,200.8 595.3,185.6 604.2,170.0 613.0,154.4 621.8,139.2 630.6,125.0 639.4,112.1 648.3,101.1 657.1,92.1 665.9,85.4 674.7,81.4 683.5,80.0 692.4,81.4 701.2,85.4 710.0,92.1" fill="none" stroke="#C084FC" stroke-width="3"/>
  <line x1="215" y1="242" x2="215" y2="295" stroke="#F87171" stroke-width="1.3" stroke-dasharray="2,2"/>
  <rect x="115" y="295" width="218" height="32" rx="5" fill="#7F1D1D" fill-opacity="0.88" stroke="#F87171" stroke-width="1"/>
  <text x="224" y="310" fill="#FECACA" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">p(t) &lt; 0 负功率回流区</text>
  <text x="224" y="323" fill="#FCA5A5" font-size="10" text-anchor="middle" font-family="sans-serif">v 与 i 异号：储能元件将能量送回电源</text>
  <line x1="207" y1="68" x2="525" y2="68" stroke="#C084FC" stroke-width="1.4"/>
  <line x1="207" y1="62" x2="207" y2="74" stroke="#C084FC" stroke-width="1.4"/>
  <line x1="525" y1="62" x2="525" y2="74" stroke="#C084FC" stroke-width="1.4"/>
  <text x="366" y="64" fill="#E9D5FF" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">功率脉动周期 T_p = T/2（频率 2ω）</text>
  <rect x="82" y="366" width="600" height="24" rx="5" fill="#1E293B"/>
  <line x1="98" y1="378" x2="122" y2="378" stroke="#38BDF8" stroke-width="2.5"/>
  <text x="128" y="382" fill="#E2E8F0" font-size="11" font-family="sans-serif">电压 v(t)</text>
  <line x1="205" y1="378" x2="229" y2="378" stroke="#34D399" stroke-width="2.5"/>
  <text x="235" y="382" fill="#E2E8F0" font-size="11" font-family="sans-serif">电流 i(t)</text>
  <line x1="312" y1="378" x2="336" y2="378" stroke="#C084FC" stroke-width="3"/>
  <text x="342" y="382" fill="#E2E8F0" font-size="11" font-family="sans-serif">瞬时功率 p(t)</text>
  <line x1="448" y1="378" x2="472" y2="378" stroke="#F59E0B" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="478" y="382" fill="#FBBF24" font-size="11" font-family="sans-serif">平均功率 P</text>
  <rect x="562" y="372" width="14" height="12" fill="#EF4444" fill-opacity="0.45" stroke="#F87171"/>
  <text x="582" y="382" fill="#FCA5A5" font-size="11" font-family="sans-serif">回流区 p&lt;0</text>
</svg>`;

export const SHEET_ACT2 = String.raw`<svg viewBox="0 0 760 310" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:760px;background:#0F172A;border-radius:10px;">
  <rect x="0" y="0" width="760" height="310" rx="10" fill="#0F172A"/>
  <text x="380" y="28" fill="#F8FAFC" font-size="15" font-weight="bold" text-anchor="middle" font-family="sans-serif">R / L / C 三类纯元件的瞬时功率 p(t) 与平均功率 P 对照</text>

  <!-- 纯电阻 R -->
  <rect x="20" y="46" width="230" height="248" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.2"/>
  <text x="135" y="68" fill="#10B981" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">纯电阻 R（Δθ = 0°）</text>
  <text x="135" y="86" fill="#CBD5E1" font-size="10.5" text-anchor="middle" font-family="sans-serif">P = ½ Vm Im &gt; 0（全部耗散做功）</text>
  <line x1="38" y1="175" x2="236" y2="175" stroke="#94A3B8" stroke-width="1.2"/>
  <line x1="38" y1="148" x2="236" y2="148" stroke="#FBBF24" stroke-width="1.8" stroke-dasharray="5,4"/>
  <polyline points="38.0,139.0 42.1,139.3 46.2,140.2 50.4,141.7 54.5,143.8 58.6,146.4 62.8,149.5 66.9,153.1 71.0,157.0 75.1,161.2 79.2,165.7 83.4,170.3 87.5,175.0 91.6,179.7 95.8,184.3 99.9,188.8 104.0,193.0 108.1,196.9 112.2,200.5 116.4,203.6 120.5,206.2 124.6,208.3 128.8,209.8 132.9,210.7 137.0,211.0 141.1,210.7 145.2,209.8 149.4,208.3 153.5,206.2 157.6,203.6 161.8,200.5 165.9,196.9 170.0,193.0 174.1,188.8 178.2,184.3 182.4,179.7 186.5,175.0 190.6,170.3 194.8,165.7 198.9,161.2 203.0,157.0 207.1,153.1 211.2,149.5 215.4,146.4 219.5,143.8 223.6,141.7 227.8,140.2 231.9,139.3 236.0,139.0" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-opacity="0.8"/>
  <polyline points="38.0,147.0 42.1,147.2 46.2,148.0 50.4,149.1 54.5,150.8 58.6,152.8 62.8,155.2 66.9,158.0 71.0,161.0 75.1,164.3 79.2,167.8 83.4,171.3 87.5,175.0 91.6,178.7 95.8,182.2 99.9,185.7 104.0,189.0 108.1,192.0 112.2,194.8 116.4,197.2 120.5,199.2 124.6,200.9 128.8,202.0 132.9,202.8 137.0,203.0 141.1,202.8 145.2,202.0 149.4,200.9 153.5,199.2 157.6,197.2 161.8,194.8 165.9,192.0 170.0,189.0 174.1,185.7 178.2,182.2 182.4,178.7 186.5,175.0 190.6,171.3 194.8,167.8 198.9,164.3 203.0,161.0 207.1,158.0 211.2,155.2 215.4,152.8 219.5,150.8 223.6,149.1 227.8,148.0 231.9,147.2 236.0,147.0" fill="none" stroke="#34D399" stroke-width="1.5" stroke-opacity="0.8"/>
  <polyline points="38.0,121.0 42.1,121.9 46.2,124.6 50.4,128.9 54.5,134.5 58.6,141.0 62.8,148.0 66.9,155.0 71.0,161.5 75.1,167.1 79.2,171.4 83.4,174.1 87.5,175.0 91.6,174.1 95.8,171.4 99.9,167.1 104.0,161.5 108.1,155.0 112.2,148.0 116.4,141.0 120.5,134.5 124.6,128.9 128.8,124.6 132.9,121.9 137.0,121.0 141.1,121.9 145.2,124.6 149.4,128.9 153.5,134.5 157.6,141.0 161.8,148.0 165.9,155.0 170.0,161.5 174.1,167.1 178.2,171.4 182.4,174.1 186.5,175.0 190.6,174.1 194.8,171.4 198.9,167.1 203.0,161.5 207.1,155.0 211.2,148.0 215.4,141.0 219.5,134.5 223.6,128.9 227.8,124.6 231.9,121.9 236.0,121.0" fill="none" stroke="#C084FC" stroke-width="2.5"/>
  <text x="135" y="262" fill="#A7F3D0" font-size="11" text-anchor="middle" font-family="sans-serif">p(t) ≥ 0 恒正，永不回流</text>
  <text x="135" y="279" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">cos(0°) = 1</text>

  <!-- 纯电感 L -->
  <rect x="265" y="46" width="230" height="248" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.2"/>
  <text x="380" y="68" fill="#38BDF8" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">纯电感 L（Δθ = +90°）</text>
  <text x="380" y="86" fill="#CBD5E1" font-size="10.5" text-anchor="middle" font-family="sans-serif">P = 0 W（磁场吞吐，净功为零）</text>
  <line x1="283" y1="175" x2="481" y2="175" stroke="#FBBF24" stroke-width="1.8" stroke-dasharray="5,4"/>
  <polyline points="283.0,139.0 287.1,139.3 291.2,140.2 295.4,141.7 299.5,143.8 303.6,146.4 307.8,149.5 311.9,153.1 316.0,157.0 320.1,161.2 324.2,165.7 328.4,170.3 332.5,175.0 336.6,179.7 340.8,184.3 344.9,188.8 349.0,193.0 353.1,196.9 357.2,200.5 361.4,203.6 365.5,206.2 369.6,208.3 373.8,209.8 377.9,210.7 382.0,211.0 386.1,210.7 390.2,209.8 394.4,208.3 398.5,206.2 402.6,203.6 406.8,200.5 410.9,196.9 415.0,193.0 419.1,188.8 423.2,184.3 427.4,179.7 431.5,175.0 435.6,170.3 439.8,165.7 443.9,161.2 448.0,157.0 452.1,153.1 456.2,149.5 460.4,146.4 464.5,143.8 468.6,141.7 472.8,140.2 476.9,139.3 481.0,139.0" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-opacity="0.8"/>
  <polyline points="283.0,175.0 287.1,171.3 291.2,167.8 295.4,164.3 299.5,161.0 303.6,158.0 307.8,155.2 311.9,152.8 316.0,150.8 320.1,149.1 324.2,148.0 328.4,147.2 332.5,147.0 336.6,147.2 340.8,148.0 344.9,149.1 349.0,150.8 353.1,152.8 357.2,155.2 361.4,158.0 365.5,161.0 369.6,164.3 373.8,167.8 377.9,171.3 382.0,175.0 386.1,178.7 390.2,182.2 394.4,185.7 398.5,189.0 402.6,192.0 406.8,194.8 410.9,197.2 415.0,199.2 419.1,200.9 423.2,202.0 427.4,202.8 431.5,203.0 435.6,202.8 439.8,202.0 443.9,200.9 448.0,199.2 452.1,197.2 456.2,194.8 460.4,192.0 464.5,189.0 468.6,185.7 472.8,182.2 476.9,178.7 481.0,175.0" fill="none" stroke="#34D399" stroke-width="1.5" stroke-opacity="0.8"/>
  <polyline points="283.0,175.0 287.1,168.0 291.2,161.5 295.4,155.9 299.5,151.6 303.6,148.9 307.8,148.0 311.9,148.9 316.0,151.6 320.1,155.9 324.2,161.5 328.4,168.0 332.5,175.0 336.6,182.0 340.8,188.5 344.9,194.1 349.0,198.4 353.1,201.1 357.2,202.0 361.4,201.1 365.5,198.4 369.6,194.1 373.8,188.5 377.9,182.0 382.0,175.0 386.1,168.0 390.2,161.5 394.4,155.9 398.5,151.6 402.6,148.9 406.8,148.0 410.9,148.9 415.0,151.6 419.1,155.9 423.2,161.5 427.4,168.0 431.5,175.0 435.6,182.0 439.8,188.5 443.9,194.1 448.0,198.4 452.1,201.1 456.2,202.0 460.4,201.1 464.5,198.4 468.6,194.1 472.8,188.5 476.9,182.0 481.0,175.0" fill="none" stroke="#C084FC" stroke-width="2.5"/>
  <text x="380" y="262" fill="#BAE6FD" font-size="11" text-anchor="middle" font-family="sans-serif">正负面积严格抵消（v 超前 i 90°）</text>
  <text x="380" y="279" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">cos(+90°) = 0</text>

  <!-- 纯电容 C -->
  <rect x="510" y="46" width="230" height="248" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.2"/>
  <text x="625" y="68" fill="#F472B6" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">纯电容 C（Δθ = -90°）</text>
  <text x="625" y="86" fill="#CBD5E1" font-size="10.5" text-anchor="middle" font-family="sans-serif">P = 0 W（电场吞吐，净功为零）</text>
  <line x1="528" y1="175" x2="726" y2="175" stroke="#FBBF24" stroke-width="1.8" stroke-dasharray="5,4"/>
  <polyline points="528.0,139.0 532.1,139.3 536.2,140.2 540.4,141.7 544.5,143.8 548.6,146.4 552.8,149.5 556.9,153.1 561.0,157.0 565.1,161.2 569.2,165.7 573.4,170.3 577.5,175.0 581.6,179.7 585.8,184.3 589.9,188.8 594.0,193.0 598.1,196.9 602.2,200.5 606.4,203.6 610.5,206.2 614.6,208.3 618.8,209.8 622.9,210.7 627.0,211.0 631.1,210.7 635.2,209.8 639.4,208.3 643.5,206.2 647.6,203.6 651.8,200.5 655.9,196.9 660.0,193.0 664.1,188.8 668.2,184.3 672.4,179.7 676.5,175.0 680.6,170.3 684.8,165.7 688.9,161.2 693.0,157.0 697.1,153.1 701.2,149.5 705.4,146.4 709.5,143.8 713.6,141.7 717.8,140.2 721.9,139.3 726.0,139.0" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-opacity="0.8"/>
  <polyline points="528.0,175.0 532.1,178.7 536.2,182.2 540.4,185.7 544.5,189.0 548.6,192.0 552.8,194.8 556.9,197.2 561.0,199.2 565.1,200.9 569.2,202.0 573.4,202.8 577.5,203.0 581.6,202.8 585.8,202.0 589.9,200.9 594.0,199.2 598.1,197.2 602.2,194.8 606.4,192.0 610.5,189.0 614.6,185.7 618.8,182.2 622.9,178.7 627.0,175.0 631.1,171.3 635.2,167.8 639.4,164.3 643.5,161.0 647.6,158.0 651.8,155.2 655.9,152.8 660.0,150.8 664.1,149.1 668.2,148.0 672.4,147.2 676.5,147.0 680.6,147.2 684.8,148.0 688.9,149.1 693.0,150.8 697.1,152.8 701.2,155.2 705.4,158.0 709.5,161.0 713.6,164.3 717.8,167.8 721.9,171.3 726.0,175.0" fill="none" stroke="#34D399" stroke-width="1.5" stroke-opacity="0.8"/>
  <polyline points="528.0,175.0 532.1,182.0 536.2,188.5 540.4,194.1 544.5,198.4 548.6,201.1 552.8,202.0 556.9,201.1 561.0,198.4 565.1,194.1 569.2,188.5 573.4,182.0 577.5,175.0 581.6,168.0 585.8,161.5 589.9,155.9 594.0,151.6 598.1,148.9 602.2,148.0 606.4,148.9 610.5,151.6 614.6,155.9 618.8,161.5 622.9,168.0 627.0,175.0 631.1,182.0 635.2,188.5 639.4,194.1 643.5,198.4 647.6,201.1 651.8,202.0 655.9,201.1 660.0,198.4 664.1,194.1 668.2,188.5 672.4,182.0 676.5,175.0 680.6,168.0 684.8,161.5 688.9,155.9 693.0,151.6 697.1,148.9 701.2,148.0 705.4,148.9 709.5,151.6 713.6,155.9 717.8,161.5 721.9,168.0 726.0,175.0" fill="none" stroke="#C084FC" stroke-width="2.5"/>
  <text x="625" y="262" fill="#FBCFE8" font-size="11" text-anchor="middle" font-family="sans-serif">正负面积严格抵消（i 超前 v 90°）</text>
  <text x="625" y="279" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">cos(-90°) = 0</text>
</svg>`;

export const SHEET_ACT3 = String.raw`<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:760px;background:#0F172A;border-radius:10px;">
  <rect x="0" y="0" width="760" height="360" rx="10" fill="#0F172A"/>
  <text x="380" y="28" fill="#F8FAFC" font-size="15" font-weight="bold" text-anchor="middle" font-family="sans-serif">有效值（RMS）的物理本质：焦耳热等效与平方波形“削峰填谷”</text>
  <rect x="20" y="46" width="350" height="252" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="195" y="68" fill="#38BDF8" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">① 正弦信号：峰值 Im vs 有效值 I_rms</text>
  <line x1="55" y1="190" x2="353" y2="190" stroke="#94A3B8" stroke-width="1.3"/>
  <line x1="55" y1="88" x2="55" y2="282" stroke="#94A3B8" stroke-width="1.3"/>
  <line x1="55" y1="105" x2="345" y2="105" stroke="#475569" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="55" y1="129.9" x2="345" y2="129.9" stroke="#F59E0B" stroke-width="2" stroke-dasharray="6,4"/>
  <polyline points="55.0,105.0 61.0,105.7 67.1,107.9 73.1,111.5 79.2,116.4 85.2,122.6 91.2,129.9 97.3,138.3 103.3,147.5 109.4,157.5 115.4,168.0 121.5,178.9 127.5,190.0 133.5,201.1 139.6,212.0 145.6,222.5 151.7,232.5 157.7,241.7 163.8,250.1 169.8,257.4 175.8,263.6 181.9,268.5 187.9,272.1 194.0,274.3 200.0,275.0 206.0,274.3 212.1,272.1 218.1,268.5 224.2,263.6 230.2,257.4 236.2,250.1 242.3,241.7 248.3,232.5 254.4,222.5 260.4,212.0 266.5,201.1 272.5,190.0 278.5,178.9 284.6,168.0 290.6,157.5 296.7,147.5 302.7,138.3 308.8,129.9 314.8,122.6 320.8,116.4 326.9,111.5 332.9,107.9 339.0,105.7 345.0,105.0" fill="none" stroke="#38BDF8" stroke-width="2.6"/>
  <text x="49" y="109" fill="#38BDF8" font-size="10" text-anchor="end" font-family="monospace">+Im</text>
  <text x="49" y="133.9" fill="#FBBF24" font-size="10" text-anchor="end" font-family="monospace">0.707</text>
  <text x="49" y="194" fill="#94A3B8" font-size="10" text-anchor="end" font-family="monospace">0</text>
  <text x="49" y="278" fill="#38BDF8" font-size="10" text-anchor="end" font-family="monospace">-Im</text>
  <text x="200" y="123.9" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">I_rms = Im / √2 ≈ 0.707 Im</text>

  <rect x="385" y="46" width="355" height="252" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="562" y="68" fill="#F59E0B" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">② 焦耳热积分：i²(t) 面积 = I_rms² · T</text>
  <line x1="415" y1="255" x2="723" y2="255" stroke="#94A3B8" stroke-width="1.3"/>
  <line x1="415" y1="88" x2="415" y2="265" stroke="#94A3B8" stroke-width="1.3"/>
  <rect x="415" y="180.0" width="300" height="75.0" fill="#F59E0B" fill-opacity="0.22" stroke="#F59E0B" stroke-width="2" stroke-dasharray="6,4"/>
  <polygon points="415.0,255.0 415.0,105.0 421.2,107.6 427.5,115.0 433.8,127.0 440.0,142.5 446.2,160.6 452.5,180.0 458.8,199.4 465.0,217.5 471.2,233.0 477.5,245.0 483.8,252.4 490.0,255.0 496.2,252.4 502.5,245.0 508.8,233.0 515.0,217.5 521.2,199.4 527.5,180.0 533.8,160.6 540.0,142.5 546.2,127.0 552.5,115.0 558.8,107.6 565.0,105.0 571.2,107.6 577.5,115.0 583.8,127.0 590.0,142.5 596.2,160.6 602.5,180.0 608.8,199.4 615.0,217.5 621.2,233.0 627.5,245.0 633.8,252.4 640.0,255.0 646.2,252.4 652.5,245.0 658.8,233.0 665.0,217.5 671.2,199.4 677.5,180.0 683.8,160.6 690.0,142.5 696.2,127.0 702.5,115.0 708.8,107.6 715.0,105.0 715.0,255.0" fill="#C084FC" fill-opacity="0.26"/>
  <polyline points="415.0,105.0 421.2,107.6 427.5,115.0 433.8,127.0 440.0,142.5 446.2,160.6 452.5,180.0 458.8,199.4 465.0,217.5 471.2,233.0 477.5,245.0 483.8,252.4 490.0,255.0 496.2,252.4 502.5,245.0 508.8,233.0 515.0,217.5 521.2,199.4 527.5,180.0 533.8,160.6 540.0,142.5 546.2,127.0 552.5,115.0 558.8,107.6 565.0,105.0 571.2,107.6 577.5,115.0 583.8,127.0 590.0,142.5 596.2,160.6 602.5,180.0 608.8,199.4 615.0,217.5 621.2,233.0 627.5,245.0 633.8,252.4 640.0,255.0 646.2,252.4 652.5,245.0 658.8,233.0 665.0,217.5 671.2,199.4 677.5,180.0 683.8,160.6 690.0,142.5 696.2,127.0 702.5,115.0 708.8,107.6 715.0,105.0" fill="none" stroke="#C084FC" stroke-width="2.5"/>
  <text x="409" y="109.0" fill="#C084FC" font-size="10" text-anchor="end" font-family="monospace">Im²</text>
  <text x="409" y="184.0" fill="#FBBF24" font-size="10" text-anchor="end" font-family="monospace">½Im²</text>
  <text x="409" y="259" fill="#94A3B8" font-size="10" text-anchor="end" font-family="monospace">0</text>
  <text x="565" y="128" fill="#E9D5FF" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">波峰切下恰好填满波谷</text>
  <text x="565" y="218" fill="#FDE68A" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">等效直流热面积：I_rms² = ½ Im²</text>

  <rect x="20" y="310" width="720" height="36" rx="6" fill="#0F2942" stroke="#0284C7"/>
  <text x="380" y="332" fill="#E0F2FE" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">家用市电标称值均为 RMS：北美 120 V RMS → 峰值 169.7 V（≈170 V） | 中国 220 V RMS → 峰值 311.1 V（≈311 V）</text>
</svg>`;

export const SHEET_ACT4 = String.raw`<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:760px;background:#0F172A;border-radius:10px;">
  <rect x="0" y="0" width="760" height="340" rx="10" fill="#0F172A"/>
  <text x="380" y="28" fill="#F8FAFC" font-size="15" font-weight="bold" text-anchor="middle" font-family="sans-serif">非正弦波与 DC+AC 混合信号的 RMS：正交叠加（勾股合成）</text>

  <rect x="20" y="46" width="355" height="274" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="197" y="68" fill="#38BDF8" font-size="12.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">v(t) = 12 + 5√2 cos(ωt) V 的有效值</text>
  <line x1="60" y1="275" x2="360" y2="275" stroke="#94A3B8" stroke-width="1.3"/>
  <line x1="60" y1="88" x2="60" y2="281" stroke="#94A3B8" stroke-width="1.3"/>
  <line x1="60" y1="179.5" x2="350" y2="179.5" stroke="#94A3B8" stroke-width="1.4" stroke-dasharray="4,4"/>
  <line x1="60" y1="171.6" x2="350" y2="171.6" stroke="#F59E0B" stroke-width="2.2" stroke-dasharray="7,4"/>
  <polyline points="60.0,123.3 66.0,123.8 72.1,125.2 78.1,127.6 84.2,130.8 90.2,134.9 96.2,139.8 102.3,145.3 108.3,151.4 114.4,158.0 120.4,165.0 126.5,172.2 132.5,179.5 138.5,186.9 144.6,194.1 150.6,201.1 156.7,207.7 162.7,213.8 168.8,219.3 174.8,224.2 180.8,228.3 186.9,231.5 192.9,233.9 199.0,235.3 205.0,235.8 211.0,235.3 217.1,233.9 223.1,231.5 229.2,228.3 235.2,224.2 241.2,219.3 247.3,213.8 253.3,207.7 259.4,201.1 265.4,194.1 271.5,186.9 277.5,179.5 283.5,172.2 289.6,165.0 295.6,158.0 301.7,151.4 307.7,145.3 313.8,139.8 319.8,134.9 325.8,130.8 331.9,127.6 337.9,125.2 344.0,123.8 350.0,123.3" fill="none" stroke="#38BDF8" stroke-width="2.6"/>
  <text x="54" y="279" fill="#94A3B8" font-size="10" text-anchor="end" font-family="monospace">0V</text>
  <text x="54" y="184.5" fill="#CBD5E1" font-size="10" text-anchor="end" font-family="monospace">12V</text>
  <text x="54" y="167.6" fill="#FBBF24" font-size="10" font-weight="bold" text-anchor="end" font-family="monospace">13V</text>
  <text x="205" y="161.6" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">V_rms = √(12² + 5²) = 13 V</text>
  <text x="205" y="302" fill="#94A3B8" font-size="10.5" text-anchor="middle" font-family="sans-serif">注意：绝不是 12 + 5 = 17 V，交叉项周期积分为 0</text>

  <rect x="392" y="46" width="348" height="274" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="566" y="68" fill="#F472B6" font-size="12.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">同峰值 Vp 下的 RMS 系数（波峰越“胖”越热）</text>
  <text x="415" y="102" fill="#E2E8F0" font-size="11.5" font-weight="bold" font-family="sans-serif">方波（Square）</text>
  <rect x="415" y="108" width="220" height="22" rx="4" fill="#0F172A" stroke="#334155"/>
  <rect x="415" y="108" width="220.0" height="22" rx="4" fill="#34D399" fill-opacity="0.85"/>
  <text x="645" y="123" fill="#34D399" font-size="11" font-weight="bold" font-family="monospace">1.000</text>
  <text x="423" y="123" fill="#0F172A" font-size="10.5" font-weight="bold" font-family="sans-serif">V_rms = Vp</text>

  <text x="415" y="162" fill="#E2E8F0" font-size="11.5" font-weight="bold" font-family="sans-serif">正弦波（Sine）</text>
  <rect x="415" y="168" width="220" height="22" rx="4" fill="#0F172A" stroke="#334155"/>
  <rect x="415" y="168" width="155.5" height="22" rx="4" fill="#38BDF8" fill-opacity="0.85"/>
  <text x="645" y="183" fill="#38BDF8" font-size="11" font-weight="bold" font-family="monospace">0.707</text>
  <text x="423" y="183" fill="#0F172A" font-size="10.5" font-weight="bold" font-family="sans-serif">V_rms = Vp / √2</text>

  <text x="415" y="222" fill="#E2E8F0" font-size="11.5" font-weight="bold" font-family="sans-serif">对称三角波 / 锯齿波</text>
  <rect x="415" y="228" width="220" height="22" rx="4" fill="#0F172A" stroke="#334155"/>
  <rect x="415" y="228" width="127.0" height="22" rx="4" fill="#F472B6" fill-opacity="0.85"/>
  <text x="645" y="243" fill="#F472B6" font-size="11" font-weight="bold" font-family="monospace">0.577</text>
  <text x="423" y="243" fill="#0F172A" font-size="10.5" font-weight="bold" font-family="sans-serif">V_rms = Vp / √3</text>
  <text x="566" y="294" fill="#CBD5E1" font-size="10.5" text-anchor="middle" font-family="sans-serif">同样峰值 Vp：方波发热量是正弦波的 2 倍，是三角波的 3 倍</text>
</svg>`;

export const SHEET_ACT5 = String.raw`<svg viewBox="0 0 760 350" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:760px;background:#0F172A;border-radius:10px;">
  <rect x="0" y="0" width="760" height="350" rx="10" fill="#0F172A"/>
  <text x="380" y="28" fill="#F8FAFC" font-size="15" font-weight="bold" text-anchor="middle" font-family="sans-serif">交流最大平均功率传输：共轭匹配 Z_L = Z_Th* 与功率峰值曲线</text>

  <rect x="18" y="46" width="372" height="284" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="204" y="68" fill="#38BDF8" font-size="12.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">① 交流戴维南 + 共轭负载等效电路</text>
  <circle cx="66" cy="185" r="22" fill="#0F172A" stroke="#38BDF8" stroke-width="2.2"/>
  <path d="M 55 185 Q 60.5 174 66 185 T 77 185" fill="none" stroke="#38BDF8" stroke-width="2"/>
  <text x="66" y="154" fill="#38BDF8" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">V_Th</text>
  <text x="66" y="222" fill="#94A3B8" font-size="10" text-anchor="middle" font-family="sans-serif">戴维南源</text>
  <line x1="66" y1="163" x2="66" y2="115" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="66" y1="115" x2="106" y2="115" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="106" y="103" width="52" height="24" rx="4" fill="#0F172A" stroke="#10B981" stroke-width="2"/>
  <text x="132" y="119" fill="#34D399" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">R_Th</text>
  <line x1="158" y1="115" x2="176" y2="115" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="176" y="103" width="56" height="24" rx="4" fill="#0F172A" stroke="#F472B6" stroke-width="2"/>
  <text x="204" y="119" fill="#F472B6" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">+jX_Th</text>
  <line x1="232" y1="115" x2="262" y2="115" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="262" cy="115" r="4" fill="#FBBF24"/>
  <text x="262" y="101" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">a</text>
  <line x1="262" y1="115" x2="322" y2="115" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="322" y1="115" x2="322" y2="136" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="294" y="136" width="56" height="28" rx="4" fill="#0F172A" stroke="#10B981" stroke-width="2"/>
  <text x="322" y="154" fill="#34D399" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">R_L=R_Th</text>
  <line x1="322" y1="164" x2="322" y2="184" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="294" y="184" width="56" height="28" rx="4" fill="#0F172A" stroke="#F472B6" stroke-width="2"/>
  <text x="322" y="202" fill="#F472B6" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">-jX_Th</text>
  <line x1="322" y1="212" x2="322" y2="250" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="66" y1="207" x2="66" y2="250" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="66" y1="250" x2="322" y2="250" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="262" cy="250" r="4" fill="#FBBF24"/>
  <text x="262" y="268" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">b</text>
  <rect x="282" y="128" width="80" height="94" rx="6" fill="none" stroke="#FBBF24" stroke-width="1.4" stroke-dasharray="4,3"/>
  <text x="322" y="236" fill="#FBBF24" font-size="10.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">Z_L = Z_Th*</text>
  <rect x="36" y="282" width="336" height="36" rx="5" fill="#0F2942" stroke="#0284C7"/>
  <text x="204" y="298" fill="#E0F2FE" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">串联电抗互相抵消：jX_Th + (-jX_Th) = 0（串联谐振）</text>
  <text x="204" y="312" fill="#7DD3FC" font-size="10.5" text-anchor="middle" font-family="sans-serif">回路化归为纯电阻分压：R_L = R_Th 时效率 50% 达峰值</text>

  <rect x="404" y="46" width="338" height="284" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="573" y="68" fill="#F59E0B" font-size="12.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">② 归一化功率曲线 P / P_max vs R_L / R_Th</text>
  <line x1="435" y1="275" x2="728" y2="275" stroke="#94A3B8" stroke-width="1.3"/>
  <line x1="435" y1="84" x2="435" y2="281" stroke="#94A3B8" stroke-width="1.3"/>
  <line x1="516.4" y1="95.0" x2="516.4" y2="275" stroke="#FBBF24" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="435" y1="95.0" x2="516.4" y2="95.0" stroke="#FBBF24" stroke-width="1.2" stroke-dasharray="4,3"/>
  <polyline points="435.0,275.0 440.9,229.4 446.9,195.0 452.8,169.0 458.8,149.1 464.7,134.0 470.6,122.6 476.6,113.9 482.5,107.5 488.4,102.8 494.4,99.4 500.3,97.2 506.2,95.8 512.2,95.1 518.1,95.0 524.1,95.4 530.0,96.1 535.9,97.1 541.9,98.3 547.8,99.7 553.8,101.3 559.7,102.9 565.6,104.7 571.6,106.5 577.5,108.4 583.4,110.3 589.4,112.2 595.3,114.2 601.2,116.1 607.2,118.1 613.1,120.0 619.1,121.9 625.0,123.8 630.9,125.7 636.9,127.5 642.8,129.4 648.8,131.2 654.7,132.9 660.6,134.7 666.6,136.4 672.5,138.1 678.4,139.8 684.4,141.4 690.3,143.0 696.2,144.6 702.2,146.1 708.1,147.6 714.1,149.1 720.0,150.6" fill="none" stroke="#10B981" stroke-width="2.8"/>
  <polyline points="435.0,275.0 440.9,250.6 446.9,229.6 452.8,211.6 458.8,196.3 464.7,183.3 470.6,172.3 476.6,163.0 482.5,155.2 488.4,148.8 494.4,143.4 500.3,139.0 506.2,135.5 512.2,132.6 518.1,130.4 524.1,128.7 530.0,127.5 535.9,126.6 541.9,126.1 547.8,125.9 553.8,125.9 559.7,126.2 565.6,126.6 571.6,127.1 577.5,127.8 583.4,128.7 589.4,129.6 595.3,130.6 601.2,131.6 607.2,132.7 613.1,133.9 619.1,135.1 625.0,136.3 630.9,137.5 636.9,138.8 642.8,140.1 648.8,141.3 654.7,142.6 660.6,143.9 666.6,145.2 672.5,146.5 678.4,147.8 684.4,149.0 690.3,150.3 696.2,151.5 702.2,152.8 708.1,154.0 714.1,155.2 720.0,156.4" fill="none" stroke="#F87171" stroke-width="2.2" stroke-dasharray="6,4"/>
  <circle cx="516.4" cy="95.0" r="5" fill="#FBBF24" stroke="#0F172A" stroke-width="1.5"/>
  <text x="429" y="99.0" fill="#FBBF24" font-size="10" text-anchor="end" font-family="monospace">1.0</text>
  <text x="429" y="279" fill="#94A3B8" font-size="10" text-anchor="end" font-family="monospace">0</text>
  <text x="516.4" y="291" fill="#FBBF24" font-size="10.5" font-weight="bold" text-anchor="middle" font-family="monospace">1.0 (R_L=R_Th)</text>
  <text x="720" y="291" fill="#94A3B8" font-size="10" text-anchor="end" font-family="monospace">3.5</text>
  <text x="580" y="106" fill="#34D399" font-size="10.5" font-weight="bold" font-family="sans-serif">共轭匹配 (X_L = -X_Th)</text>
  <text x="565" y="168" fill="#FCA5A5" font-size="10.5" font-family="sans-serif">未抵消电抗 (X_L = 0)</text>
  <text x="573" y="314" fill="#CBD5E1" font-size="10.5" text-anchor="middle" font-family="sans-serif">P_max = |V_Th|²/(8R_Th) = V_Th,rms²/(4R_Th)</text>
</svg>`;

export const SHEET_ACT6 = String.raw`<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:760px;background:#0F172A;border-radius:10px;">
  <rect x="0" y="0" width="760" height="320" rx="10" fill="#0F172A"/>
  <text x="380" y="28" fill="#F8FAFC" font-size="15" font-weight="bold" text-anchor="middle" font-family="sans-serif">经典综合实战电路：戴维南等效与峰值 (/8) / RMS (/4) 双轨校验</text>

  <rect x="18" y="46" width="388" height="256" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="212" y="68" fill="#38BDF8" font-size="12.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">原始频域电路（Vs = 20∠0° V 峰值相量）</text>
  <circle cx="62" cy="180" r="20" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
  <path d="M 52 180 Q 57 170 62 180 T 72 180" fill="none" stroke="#38BDF8" stroke-width="1.8"/>
  <text x="62" y="216" fill="#38BDF8" font-size="10.5" font-weight="bold" text-anchor="middle" font-family="monospace">20∠0° V</text>
  <line x1="62" y1="160" x2="62" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="62" y1="112" x2="104" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="104" y="99" width="84" height="26" rx="4" fill="#0F172A" stroke="#10B981" stroke-width="2"/>
  <text x="146" y="116" fill="#34D399" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">Z1 = 4+j2 Ω</text>
  <line x1="188" y1="112" x2="290" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="228" cy="112" r="3.5" fill="#E2E8F0"/>
  <line x1="228" y1="112" x2="228" y2="152" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="196" y="152" width="64" height="32" rx="4" fill="#0F172A" stroke="#F472B6" stroke-width="2"/>
  <text x="228" y="172" fill="#F472B6" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">-j4 Ω</text>
  <line x1="228" y1="184" x2="228" y2="242" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="228" cy="242" r="3.5" fill="#E2E8F0"/>
  <circle cx="290" cy="112" r="4" fill="#FBBF24"/>
  <text x="290" y="99" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">a</text>
  <line x1="290" y1="112" x2="345" y2="112" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="345" y1="112" x2="345" y2="146" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="315" y="146" width="60" height="58" rx="4" fill="#0F172A" stroke="#FBBF24" stroke-width="2" stroke-dasharray="4,2"/>
  <text x="345" y="172" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">Z_L</text>
  <text x="345" y="190" fill="#FDE68A" font-size="9.5" text-anchor="middle" font-family="monospace">3.2+j2.4Ω</text>
  <line x1="345" y1="204" x2="345" y2="242" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="62" y1="200" x2="62" y2="242" stroke="#E2E8F0" stroke-width="2"/>
  <line x1="62" y1="242" x2="345" y2="242" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="290" cy="242" r="4" fill="#FBBF24"/>
  <text x="290" y="259" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">b</text>
  <text x="212" y="286" fill="#CBD5E1" font-size="10.5" text-anchor="middle" font-family="sans-serif">Z_Th = Z1 || Z2 = 3.2 - j2.4 Ω | V_Th = 8 - j16 = 8√5∠-63.43° V</text>

  <rect x="422" y="46" width="320" height="256" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="582" y="68" fill="#F59E0B" font-size="12.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">防踩坑双轨验算：分母 8 vs 分母 4</text>
  <rect x="440" y="84" width="284" height="86" rx="6" fill="#0F2942" stroke="#38BDF8"/>
  <text x="582" y="104" fill="#38BDF8" font-size="11.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">路径 A：峰值相量（分母 8 R_Th）</text>
  <text x="582" y="126" fill="#E2E8F0" font-size="11" text-anchor="middle" font-family="monospace">|V_Th| = 8√5 V → |V_Th|² = 320 V²</text>
  <text x="582" y="150" fill="#34D399" font-size="12.5" font-weight="bold" text-anchor="middle" font-family="monospace">P_max = 320 / (8 × 3.2) = 12.5 W</text>
  <rect x="440" y="186" width="284" height="86" rx="6" fill="#2E1065" stroke="#C084FC"/>
  <text x="582" y="206" fill="#C084FC" font-size="11.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">路径 B：RMS 相量（分母 4 R_Th）</text>
  <text x="582" y="228" fill="#E2E8F0" font-size="11" text-anchor="middle" font-family="monospace">V_Th,rms = 8√5 / √2 = 4√10 V → 160 V²</text>
  <text x="582" y="252" fill="#34D399" font-size="12.5" font-weight="bold" text-anchor="middle" font-family="monospace">P_max = 160 / (4 × 3.2) = 12.5 W</text>
  <text x="582" y="291" fill="#FBBF24" font-size="10.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">✓ 双轨结果严格一致：12.5 W</text>
</svg>`;

export const SHEET_MINI1 = String.raw`<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="120" rx="6" fill="#0F172A"/><line x1="30" y1="35" x2="30" y2="90" stroke="#F87171" stroke-width="2.5" stroke-dasharray="3,2"/><text x="30" y="25" fill="#FCA5A5" font-size="10" text-anchor="middle">Vs短路</text><line x1="30" y1="35" x2="75" y2="35" stroke="#E2E8F0" stroke-width="2"/><rect x="75" y="24" width="42" height="22" rx="3" fill="#1E293B" stroke="#10B981"/><text x="96" y="39" fill="#34D399" font-size="10" text-anchor="middle">10 Ω</text><line x1="117" y1="35" x2="195" y2="35" stroke="#E2E8F0" stroke-width="2"/><line x1="145" y1="35" x2="145" y2="52" stroke="#E2E8F0" stroke-width="2"/><rect x="122" y="52" width="46" height="22" rx="3" fill="#1E293B" stroke="#F472B6"/><text x="145" y="67" fill="#F472B6" font-size="10" text-anchor="middle">-j10 Ω</text><line x1="145" y1="74" x2="145" y2="90" stroke="#E2E8F0" stroke-width="2"/><rect x="195" y="24" width="46" height="22" rx="3" fill="#1E293B" stroke="#38BDF8"/><text x="218" y="39" fill="#38BDF8" font-size="10" text-anchor="middle">+j8 Ω</text><line x1="241" y1="35" x2="280" y2="35" stroke="#E2E8F0" stroke-width="2"/><line x1="30" y1="90" x2="280" y2="90" stroke="#E2E8F0" stroke-width="2"/><circle cx="280" cy="35" r="3.5" fill="#FBBF24"/><circle cx="280" cy="90" r="3.5" fill="#FBBF24"/><text x="292" y="39" fill="#FBBF24" font-size="11">a</text><text x="292" y="94" fill="#FBBF24" font-size="11">b</text></svg>`;

export const SHEET_MINI2 = String.raw`<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="120" rx="6" fill="#0F172A"/><circle cx="34" cy="62" r="15" fill="#1E293B" stroke="#38BDF8" stroke-width="1.8"/><text x="34" y="66" fill="#38BDF8" font-size="9" text-anchor="middle">20V</text><line x1="34" y1="47" x2="34" y2="35" stroke="#E2E8F0" stroke-width="2"/><line x1="34" y1="35" x2="75" y2="35" stroke="#E2E8F0" stroke-width="2"/><rect x="75" y="24" width="42" height="22" rx="3" fill="#1E293B" stroke="#10B981"/><text x="96" y="39" fill="#34D399" font-size="10" text-anchor="middle">10 Ω</text><line x1="117" y1="35" x2="195" y2="35" stroke="#E2E8F0" stroke-width="2"/><line x1="145" y1="35" x2="145" y2="52" stroke="#E2E8F0" stroke-width="2"/><rect x="122" y="52" width="46" height="22" rx="3" fill="#1E293B" stroke="#F472B6"/><text x="145" y="67" fill="#F472B6" font-size="10" text-anchor="middle">-j10 Ω</text><line x1="145" y1="74" x2="145" y2="90" stroke="#E2E8F0" stroke-width="2"/><rect x="195" y="24" width="46" height="22" rx="3" fill="#1E293B" stroke="#64748B"/><text x="218" y="39" fill="#94A3B8" font-size="10" text-anchor="middle">I = 0</text><line x1="241" y1="35" x2="280" y2="35" stroke="#E2E8F0" stroke-width="2"/><line x1="34" y1="77" x2="34" y2="90" stroke="#E2E8F0" stroke-width="2"/><line x1="34" y1="90" x2="280" y2="90" stroke="#E2E8F0" stroke-width="2"/><text x="286" y="66" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle">V_Th</text></svg>`;

export const SHEET_MINI3 = String.raw`<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="120" rx="6" fill="#0F172A"/><rect x="25" y="38" width="110" height="44" rx="6" fill="#1E293B" stroke="#38BDF8"/><text x="80" y="57" fill="#38BDF8" font-size="11" font-weight="bold" text-anchor="middle">Z_Th = 5 + j3 Ω</text><text x="80" y="73" fill="#94A3B8" font-size="9.5" text-anchor="middle">感性内阻抗</text><text x="160" y="65" fill="#FBBF24" font-size="16" font-weight="bold" text-anchor="middle">⇄</text><rect x="185" y="38" width="110" height="44" rx="6" fill="#1E293B" stroke="#10B981"/><text x="240" y="57" fill="#34D399" font-size="11" font-weight="bold" text-anchor="middle">Z_L = 5 - j3 Ω</text><text x="240" y="73" fill="#A7F3D0" font-size="9.5" text-anchor="middle">容性共轭抵消</text></svg>`;

export const SHEET_MINI4 = String.raw`<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="120" rx="6" fill="#0F172A"/><rect x="22" y="34" width="120" height="52" rx="6" fill="#0F2942" stroke="#38BDF8"/><text x="82" y="56" fill="#38BDF8" font-size="11" font-weight="bold" text-anchor="middle">峰值 |V_Th|</text><text x="82" y="74" fill="#E2E8F0" font-size="12" font-family="monospace" text-anchor="middle">10√2 V</text><text x="160" y="64" fill="#FBBF24" font-size="12" font-weight="bold" text-anchor="middle">÷√2</text><rect x="180" y="34" width="120" height="52" rx="6" fill="#2E1065" stroke="#C084FC"/><text x="240" y="56" fill="#C084FC" font-size="11" font-weight="bold" text-anchor="middle">有效值 V_Th,rms</text><text x="240" y="74" fill="#34D399" font-size="12" font-weight="bold" font-family="monospace" text-anchor="middle">10 V</text></svg>`;

export const SHEET_MINI5 = String.raw`<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="120" rx="6" fill="#0F172A"/><rect x="18" y="20" width="284" height="34" rx="5" fill="#0F2942" stroke="#38BDF8"/><text x="160" y="41" fill="#E0F2FE" font-size="11" font-family="monospace" text-anchor="middle">峰值公式: (10√2)² / (8×5) = 200/40 = 5 W</text><rect x="18" y="64" width="284" height="34" rx="5" fill="#2E1065" stroke="#C084FC"/><text x="160" y="85" fill="#F3E8FF" font-size="11" font-family="monospace" text-anchor="middle">RMS公式:  10² / (4×5) = 100/20 = 5 W</text></svg>`;
