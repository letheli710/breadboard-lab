// Diagrams the W3-L5 sheet does not give, drawn in its light style (white panels, slate ink, the
// same blue / green / orange / red accents): the redrawn step 5 diagram of the guided example (the
// sheet's drew the clipped output, i.e. the answer), the closing recap of act 6, and one small
// figure per quiz question. None of them shows an answer.

const FONT = 'font-family="sans-serif"';
const INK = '#0F172A';
const WIRE = '#334155';
const CH = ['#1570EF', '#039855', '#DC6803', '#7A5AF8'];
const CHT = ['#175CD3', '#027A48', '#B54708', '#5925DC'];

/** step 5: the two ±10 V rails and the question where the output lands once v₁ jumps to 3.0 V */
export const MINI_STEP5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110" width="260" height="110" style="max-width:380px" role="img" aria-label="±10 V 电源轨与待判定的输出">
<rect x="2" y="2" width="256" height="106" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
<line x1="24" y1="24" x2="236" y2="24" stroke="#039855" stroke-width="1.4" stroke-dasharray="4,3"/>
<text x="232" y="18" text-anchor="end" ${FONT} font-size="10" fill="#027A48">+10 V 轨</text>
<line x1="24" y1="56" x2="236" y2="56" stroke="#CBD5E1" stroke-width="1"/>
<text x="20" y="59" text-anchor="end" ${FONT} font-size="9" fill="#5f626b">0</text>
<line x1="24" y1="88" x2="236" y2="88" stroke="#D92D20" stroke-width="1.6" stroke-dasharray="4,3"/>
<text x="232" y="102" text-anchor="end" ${FONT} font-size="10" font-weight="700" fill="#B42318">−10 V 轨</text>
<path d="M 30 56 C 70 56, 100 64, 128 80" fill="none" stroke="#1570EF" stroke-width="2.4" stroke-dasharray="5,3"/>
<circle cx="142" cy="84" r="10" fill="#FFFFFF" stroke="#D92D20" stroke-width="1.8"/>
<text x="142" y="89" text-anchor="middle" ${FONT} font-size="13" font-weight="700" fill="#B42318">?</text>
<text x="128" y="44" text-anchor="middle" ${FONT} font-size="11" font-weight="700" fill="#0F172A">v1：1.2 V → 3.0 V，vo 落在哪？</text>
</svg>`;

interface In {
  label: string;
  r: string;
  /** highlighted resistor (the one the question changes or asks about) */
  hot?: boolean;
}

/** a small n-input inverting summer, light theme (quiz figures) */
function summer(title: string, ins: In[], rf: string, out: string, extra = ''): string {
  const n = ins.length;
  const top = 62;
  const gap = n === 4 ? 30 : n === 3 ? 40 : 52;
  const ys = ins.map((_, k) => top + k * gap);
  const mid = (ys[0] + ys[n - 1]) / 2;
  const bus = 220;
  const ox = 262;
  const oy = mid + 17;
  const tip = ox + 64;
  const H = Math.max(ys[n - 1] + 34, oy + 62);
  const rows = ins
    .map((c, k) => {
      const y = ys[k];
      const col = c.hot ? '#D92D20' : WIRE;
      return `<text x="14" y="${y + 4}" ${FONT} font-size="11" font-weight="700" fill="${CHT[k]}">${c.label}</text>
<line x1="98" y1="${y}" x2="116" y2="${y}" stroke="${WIRE}" stroke-width="2"/>
<rect x="116" y="${y - 8}" width="60" height="16" rx="3" fill="${c.hot ? '#FEF3F2' : '#FFFFFF'}" stroke="${col}" stroke-width="${c.hot ? 2.2 : 1.8}"/>
<text x="146" y="${y - 12}" text-anchor="middle" ${FONT} font-size="10.5" font-weight="${c.hot ? 700 : 600}" fill="${c.hot ? '#B42318' : INK}">${c.r}</text>
<line x1="176" y1="${y}" x2="${bus}" y2="${y}" stroke="${WIRE}" stroke-width="2"/>
<circle cx="88" cy="${y}" r="9" fill="#FFFFFF" stroke="${CH[k]}" stroke-width="1.8"/>`;
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 ${H}" width="420" height="${H}" role="img" aria-label="${title}">
<rect x="1" y="1" width="418" height="${H - 2}" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
<text x="14" y="22" ${FONT} font-size="12" font-weight="700" fill="${INK}">${title}</text>
${rows}
<line x1="${bus}" y1="${ys[0]}" x2="${bus}" y2="${ys[n - 1]}" stroke="${WIRE}" stroke-width="2"/>
<circle cx="${bus}" cy="${mid}" r="4.5" fill="#039855"/>
<text x="${bus + 6}" y="${mid - 7}" ${FONT} font-size="10" font-weight="700" fill="#027A48">a</text>
<line x1="${bus}" y1="${mid}" x2="${ox}" y2="${mid}" stroke="${WIRE}" stroke-width="2"/>
<line x1="${bus}" y1="${ys[0]}" x2="${bus}" y2="40" stroke="${WIRE}" stroke-width="2"/>
<line x1="${bus}" y1="40" x2="270" y2="40" stroke="${WIRE}" stroke-width="2"/>
<rect x="270" y="32" width="56" height="16" rx="3" fill="#FEF3F2" stroke="#D92D20" stroke-width="1.8"/>
<text x="298" y="62" text-anchor="middle" ${FONT} font-size="10.5" font-weight="700" fill="#B42318">${rf}</text>
<line x1="326" y1="40" x2="352" y2="40" stroke="${WIRE}" stroke-width="2"/>
<line x1="352" y1="40" x2="352" y2="${oy}" stroke="${WIRE}" stroke-width="2"/>
<polygon points="${ox},${oy - 34} ${ox},${oy + 34} ${tip},${oy}" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>
<text x="${ox + 6}" y="${mid + 5}" ${FONT} font-size="14" font-weight="700" fill="${INK}">−</text>
<text x="${ox + 6}" y="${oy + 22}" ${FONT} font-size="13" font-weight="700" fill="${INK}">+</text>
<line x1="${ox}" y1="${oy + 17}" x2="${ox - 12}" y2="${oy + 17}" stroke="${WIRE}" stroke-width="2"/>
<line x1="${ox - 12}" y1="${oy + 17}" x2="${ox - 12}" y2="${oy + 36}" stroke="${WIRE}" stroke-width="2"/>
<path d="M ${ox - 22} ${oy + 36} H ${ox - 2} M ${ox - 18} ${oy + 41} H ${ox - 6} M ${ox - 14} ${oy + 46} H ${ox - 10}" stroke="${WIRE}" stroke-width="2"/>
<line x1="${tip}" y1="${oy}" x2="400" y2="${oy}" stroke="${WIRE}" stroke-width="2"/>
<circle cx="352" cy="${oy}" r="3.5" fill="${INK}"/>
<circle cx="400" cy="${oy}" r="4" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>
<text x="404" y="${oy + 24}" text-anchor="end" ${FONT} font-size="12" font-weight="700" fill="${INK}">${out}</text>
${extra}
</svg>`;
}

/** Q1: R2 is turned down from 10 kΩ to 5 kΩ; what happens to i1? */
export const SVG_Q1 = summer(
  'Q1 · 只把 R2 从 10 kΩ 调成 5 kΩ',
  [
    { label: 'v1', r: 'R1' },
    { label: 'v2', r: 'R2：10k → 5k', hot: true },
    { label: 'v3', r: 'R3' },
  ],
  'Rf',
  'vo',
  `<line x1="182" y1="52" x2="210" y2="52" stroke="#1570EF" stroke-width="2.2"/><polygon points="214,52 206,48 206,56" fill="#1570EF"/><text x="196" y="47" text-anchor="middle" font-family="sans-serif" font-size="11" font-style="italic" font-weight="700" fill="#175CD3">i1 = ?</text>`,
);

/** Q2: the three-channel summer with its numbers */
export const SVG_Q2 = summer(
  'Q2 · 三路加权求和（供电 ±15 V）',
  [
    { label: 'v1 = +1.0 V', r: 'R1 = 5 kΩ' },
    { label: 'v2 = −2.0 V', r: 'R2 = 15 kΩ' },
    { label: 'v3 = +0.5 V', r: 'R3 = 7.5 kΩ' },
  ],
  'Rf = 15 kΩ',
  'vo = ?',
);

/** Q3: four sensors through 20 kΩ each; Rf to choose */
export const SVG_Q3 = summer(
  'Q3 · 4 路传感器反相平均：Rf 取多少？',
  [
    { label: 'v1', r: 'R = 20 kΩ' },
    { label: 'v2', r: 'R = 20 kΩ' },
    { label: 'v3', r: 'R = 20 kΩ' },
    { label: 'v4', r: 'R = 20 kΩ' },
  ],
  'Rf = ?',
  'vo = −(Σv)/4',
);

/** Q4: Sadiku Example 5.6 with its rails lowered from ±12 V to ±5 V */
export const SVG_Q4 = summer(
  'Q4 · Example 5.6：电源轨 ±12 V → ±5 V',
  [
    { label: 'v1 = 2 V', r: 'R1 = 5 kΩ' },
    { label: 'v2 = 1 V', r: 'R2 = 2.5 kΩ' },
  ],
  'Rf = 10 kΩ',
  'vo = ?',
  `<text x="186" y="92" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#027A48">v− = ?</text><text x="306" y="154" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#B42318">供电 ±5 V</text>`,
);

/** act 6: the lesson on one card (a summer and its four rules) */
export const SVG_ACT6 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 230" width="420" height="230" role="img" aria-label="反相加法器四句话复盘">
<rect x="1" y="1" width="418" height="228" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
<text x="14" y="22" ${FONT} font-size="12.5" font-weight="700" fill="${INK}">反相加法器 · 四句话复盘</text>
<rect x="14" y="34" width="392" height="40" rx="8" fill="#ECFDF3" stroke="#6CE9A6"/>
<text x="26" y="52" ${FONT} font-size="11.5" font-weight="700" fill="#027A48">① 线性区：节点 a 是虚地，v− = v+ = 0 V</text>
<text x="26" y="67" ${FONT} font-size="10.5" fill="#027A48">每一路只看见自己的 Rk 接地，互不串扰</text>
<rect x="14" y="80" width="392" height="40" rx="8" fill="#EFF8FF" stroke="#B2DDFF"/>
<text x="26" y="98" ${FONT} font-size="11.5" font-weight="700" fill="#175CD3">② 支路电流：ik = vk / Rk</text>
<text x="26" y="113" ${FONT} font-size="10.5" fill="#175CD3">虚断 i− = 0：全部汇入反馈电阻，if = i1 + i2 + … + in</text>
<rect x="14" y="126" width="392" height="40" rx="8" fill="#FEF3F2" stroke="#FDA29B"/>
<text x="26" y="144" ${FONT} font-size="11.5" font-weight="700" fill="#B42318">③ 输出：vo = −if·Rf = −Σ (Rf / Rk)·vk</text>
<text x="26" y="159" ${FONT} font-size="10.5" fill="#B42318">权重 wk = Rf / Rk：Rk 是单路推子，Rf 是总音量</text>
<rect x="14" y="172" width="392" height="44" rx="8" fill="#F4F3FF" stroke="#BDB4FE"/>
<text x="26" y="190" ${FONT} font-size="11.5" font-weight="700" fill="#5925DC">④ 边界：−VCC ≤ vo ≤ +VCC</text>
<text x="26" y="206" ${FONT} font-size="10.5" fill="#5925DC">算完 vo 先比一比电源轨；输出端电流 io = iL − if</text>
</svg>`;
