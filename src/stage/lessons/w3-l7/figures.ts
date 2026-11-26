// Diagrams this lesson adds (the sheet gives none for them), drawn in the style of the sheet's
// own light diagrams: the guided example's problem figure (the sheet's mini_svg, unchanged), one
// small diagram per guided step, act 6's five-step map and the four quiz figures. None of them
// prints an answer.

const BG = (w: number, h: number) => `<rect width="${w}" height="${h}" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>`;
const T = (x: number, y: number, s: string, o: { size?: number; bold?: boolean; fill?: string; anchor?: 'start' | 'middle' | 'end' } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? 'middle'}" font-family="sans-serif" font-size="${o.size ?? 11}"${o.bold ? ' font-weight="bold"' : ''} fill="${o.fill ?? '#0F172A'}">${s}</text>`;
const ARROW = (id: string, color: string) =>
  `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="${color}"/></marker>`;

/** a stage box: tint, border, title, second line */
function box(x: number, y: number, w: number, h: number, fill: string, stroke: string, ink: string, l1: string, l2: string, l2fill = ink) {
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>` +
    T(x + w / 2, y + h / 2 - 4, l1, { size: 11.5, bold: true, fill: ink }) +
    T(x + w / 2, y + h / 2 + 13, l2, { size: 11, fill: l2fill })
  );
}
const BLUE = ['#EFF6FF', '#3B82F6', '#1E3A8A'] as const;
const GREEN = ['#F0FDF4', '#22C55E', '#14532D'] as const;
const PURPLE = ['#FAF5FF', '#A855F7', '#581C87'] as const;

/** the guided example's circuit (sheet §6.1 mini_svg) */
export const PROBLEM_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 150' width='640' height='150'><rect width='640' height='150' rx='8' fill='#F8FAFC' stroke='#CBD5E1'/><text x='18' y='24' font-family='sans-serif' font-size='12' font-weight='bold' fill='#0F172A'>三级级联：反相(2k/16k) → 同相(5k/15k) → 反相衰减(20k/5k) + R_L=2k（±15V）</text><rect x='46' y='52' width='124' height='58' rx='8' fill='#EFF6FF' stroke='#3B82F6' stroke-width='1.8'/><text x='108' y='76' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='bold' fill='#1E3A8A'>Stage 1 反相</text><text x='108' y='96' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#2563EB'>R₁=2k, Rf₁=16k</text><line x1='170' y1='81' x2='226' y2='81' stroke='#0F172A' stroke-width='2'/><text x='198' y='72' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#0D9488'>v_o1</text><rect x='226' y='52' width='124' height='58' rx='8' fill='#F0FDF4' stroke='#22C55E' stroke-width='1.8'/><text x='288' y='76' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='bold' fill='#14532D'>Stage 2 同相</text><text x='288' y='96' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#16A34A'>R₂=5k, Rf₂=15k</text><line x1='350' y1='81' x2='406' y2='81' stroke='#0F172A' stroke-width='2'/><text x='378' y='72' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#0D9488'>v_o2</text><rect x='406' y='52' width='134' height='58' rx='8' fill='#FAF5FF' stroke='#A855F7' stroke-width='1.8'/><text x='473' y='76' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='bold' fill='#581C87'>Stage 3 反相衰减</text><text x='473' y='96' text-anchor='middle' font-family='sans-serif' font-size='11' fill='#9333EA'>R₃=20k, Rf₃=5k</text><line x1='540' y1='81' x2='598' y2='81' stroke='#0F172A' stroke-width='2'/><text x='574' y='72' text-anchor='middle' font-family='sans-serif' font-size='11' font-weight='bold' fill='#7E22CE'>v_o3, R_L=2k</text><line x1='16' y1='81' x2='46' y2='81' stroke='#0F172A' stroke-width='2'/><text x='24' y='72' font-family='sans-serif' font-size='11' font-weight='bold' fill='#0F172A'>vᵢ</text></svg>";

/** three stage boxes with a label each, wired left to right (x = 34, 158, 282; 104 wide) */
function chain3(y: number, labels: [string, string][], marker: string) {
  const xs = [34, 158, 282];
  const tints = [BLUE, GREEN, PURPLE];
  let s = '';
  xs.forEach((x, k) => {
    const [f, st, ink] = tints[k];
    s += box(x, y, 104, 46, f, st, ink, labels[k][0], labels[k][1]);
    if (k < 2) s += `<line x1="${x + 104}" y1="${y + 23}" x2="${x + 124}" y2="${y + 23}" stroke="#0F172A" stroke-width="1.8" marker-end="url(#${marker})"/>`;
  });
  s += `<line x1="10" y1="${y + 23}" x2="32" y2="${y + 23}" stroke="#0F172A" stroke-width="1.8" marker-end="url(#${marker})"/>`;
  s += `<line x1="386" y1="${y + 23}" x2="408" y2="${y + 23}" stroke="#0F172A" stroke-width="1.8" marker-end="url(#${marker})"/>`;
  return s;
}

/** step 1: is there a cross-stage resistor? which gain is each stage? */
export const MINI_1 =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 132" width="420" height="132"><defs>${ARROW('w37m1', '#0F172A')}</defs>${BG(420, 132)}` +
  T(14, 22, 'Step 1：先做拓扑体检，再逐级贴标签', { anchor: 'start', bold: true, size: 12 }) +
  `<path d="M 334 70 C 334 38, 86 38, 86 70" fill="none" stroke="#94A3B8" stroke-width="1.6" stroke-dasharray="5 4"/>` +
  T(210, 44, '跨级反馈电阻？', { size: 11, bold: true, fill: '#64748B' }) +
  chain3(
    70,
    [
      ['反相 2k / 16k', 'A₁ = ?'],
      ['同相 5k / 15k', 'A₂ = ?'],
      ['反相 20k / 5k', 'A₃ = ?'],
    ],
    'w37m1',
  ) +
  `</svg>`;

/** a rail corridor: ±rail dashed lines, the zero line and four node columns */
function corridor(title: string, vi: string, gains: [string, string, string]) {
  const xs = [52, 160, 268, 376];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 168" width="420" height="168">${BG(420, 168)}`;
  s += T(14, 22, title, { anchor: 'start', bold: true, size: 12 });
  s += `<rect x="14" y="38" width="392" height="88" fill="#F0FDF4" opacity="0.7"/>`;
  s += `<line x1="14" y1="38" x2="406" y2="38" stroke="#DC2626" stroke-width="1.6" stroke-dasharray="6 4"/>`;
  s += `<line x1="14" y1="126" x2="406" y2="126" stroke="#DC2626" stroke-width="1.6" stroke-dasharray="6 4"/>`;
  s += `<line x1="14" y1="82" x2="406" y2="82" stroke="#94A3B8" stroke-width="1"/>`;
  s += T(18, 34, '+15 V', { anchor: 'start', size: 10, bold: true, fill: '#B91C1C' });
  s += T(18, 139, '−15 V', { anchor: 'start', size: 10, bold: true, fill: '#B91C1C' });
  s += T(402, 78, '0 V', { anchor: 'end', size: 10, fill: '#64748B' });
  const names = ['vᵢ', 'v_o1', 'v_o2', 'v_o3'];
  xs.forEach((x, k) => {
    s += `<line x1="${x}" y1="44" x2="${x}" y2="120" stroke="#CBD5E1" stroke-width="1"/>`;
    if (k === 0) {
      s += `<circle cx="${x}" cy="78" r="5" fill="#1E40AF"/>` + T(x + 8, 72, vi, { anchor: 'start', size: 10.5, bold: true, fill: '#1E40AF' });
    } else {
      s += `<circle cx="${x}" cy="82" r="10" fill="#FFFFFF" stroke="#0D9488" stroke-width="1.6"/>` + T(x, 86, '?', { size: 12, bold: true, fill: '#0F766E' });
    }
    s += T(x, 156, names[k], { size: 11, bold: true, fill: k === 0 ? '#1E40AF' : '#0F766E' });
    if (k > 0) s += T((x + xs[k - 1]) / 2, 104, gains[k - 1], { size: 10.5, bold: true, fill: '#475569' });
  });
  return s + '</svg>';
}

/** step 2: trace v_o1 → v_o2 → v_o3 at vi = 0.25 V inside the ±15 V corridor */
export const MINI_2 = corridor('Step 2：自左向右逐级算电位，每级都对一次铁轨', 'vᵢ = 0.25 V', ['×A₁', '×A₂', '×A₃']);

/** step 3: the two output nodes and the branches hanging on them */
export const MINI_3 = (() => {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 170" width="420" height="170"><defs>${ARROW('w37m3', '#D97706')}</defs>${BG(420, 170)}`;
  s += T(14, 22, 'Step 3：输出端 KCL —— 每个输出节点连着几条支路？', { anchor: 'start', bold: true, size: 12 });
  const node = (x: number, label: string, tint: readonly string[]) => {
    let g = `<polygon points="${x - 58},70 ${x - 58},118 ${x - 18},94" fill="#FFFFFF" stroke="${tint[1]}" stroke-width="2"/>`;
    g += `<line x1="${x - 18}" y1="94" x2="${x}" y2="94" stroke="#0F172A" stroke-width="2"/>`;
    g += `<circle cx="${x}" cy="94" r="4.5" fill="#0D9488"/>` + T(x - 38, 98, label, { size: 10.5, bold: true, fill: tint[2] });
    return g;
  };
  const res = (x: number, y: number, w: number, h: number, t: string) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.6"/>` + T(x + w / 2, y + h / 2 + 4, t, { size: 10 });
  // U2 output: Rf2 up to v₋₂, R3 right to stage 3's virtual ground
  s += node(110, 'U₂', GREEN);
  s += `<polyline points="110,94 110,50 128,50" fill="none" stroke="#0F172A" stroke-width="1.6"/>` + res(128, 41, 46, 18, 'Rf₂ 15k');
  s += `<line x1="174" y1="50" x2="190" y2="50" stroke="#0F172A" stroke-width="1.6"/>` + T(194, 54, 'v₋₂ = v_o1', { anchor: 'start', size: 10, fill: '#15803D' });
  s += `<line x1="110" y1="94" x2="130" y2="94" stroke="#0F172A" stroke-width="1.6"/>` + res(130, 85, 46, 18, 'R₃ 20k');
  s += `<line x1="176" y1="94" x2="190" y2="94" stroke="#0F172A" stroke-width="1.6"/>` + T(194, 98, '虚地 0 V', { anchor: 'start', size: 10, fill: '#7E22CE' });
  s +=
    `<line x1="92" y1="112" x2="118" y2="112" stroke="#D97706" stroke-width="1.8" marker-end="url(#w37m3)"/>` + T(106, 132, 'i_o2 = ?', { size: 11, bold: true, fill: '#B45309' });
  // U3 output: Rf3 up to v₋₃ = 0, R_L down to ground
  s += node(320, 'U₃', PURPLE);
  s += `<polyline points="320,94 320,50 338,50" fill="none" stroke="#0F172A" stroke-width="1.6"/>` + res(338, 41, 46, 18, 'Rf₃ 5k');
  s += `<line x1="384" y1="50" x2="394" y2="50" stroke="#0F172A" stroke-width="1.6"/>` + T(394, 38, 'v₋₃ = 0', { anchor: 'end', size: 10, fill: '#7E22CE' });
  s += `<line x1="320" y1="94" x2="370" y2="94" stroke="#0F172A" stroke-width="1.6"/><line x1="370" y1="94" x2="370" y2="104" stroke="#0F172A" stroke-width="1.6"/>`;
  s +=
    `<rect x="361" y="104" width="18" height="34" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.6"/>` +
    T(388, 126, 'R_L', { anchor: 'start', size: 10 }) +
    T(388, 138, '2k', { anchor: 'start', size: 10 });
  s += `<line x1="370" y1="138" x2="370" y2="150" stroke="#0F172A" stroke-width="1.6"/><line x1="360" y1="150" x2="380" y2="150" stroke="#475569" stroke-width="2"/><line x1="364" y1="155" x2="376" y2="155" stroke="#475569" stroke-width="1.5"/>`;
  s +=
    `<line x1="302" y1="112" x2="328" y2="112" stroke="#D97706" stroke-width="1.8" marker-end="url(#w37m3)"/>` + T(316, 132, 'i_o3 = ?', { size: 11, bold: true, fill: '#B45309' });
  s += T(14, 160, '电流以“流出运放输出端”为正', { anchor: 'start', size: 10, fill: '#475569' });
  return s + '</svg>';
})();

/** step 4: the same corridor with the input doubled */
export const MINI_4 = corridor('Step 4：输入翻倍 —— 哪一级先撞上电源轨？', 'vᵢ = 0.50 V', ['×(−8)', '×(+4)', '×(−0.25)']);

/** step 5: share the gain out again, total unchanged */
export const MINI_5 =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 150" width="420" height="150"><defs>${ARROW('w37m5', '#0F172A')}</defs>${BG(420, 150)}` +
  T(14, 22, 'Step 5：钳位后的真实输出 + 增益重新分配', { anchor: 'start', bold: true, size: 12 }) +
  T(14, 42, 'v_o2 已被钳位在 −15 V，v_o3 = ?', { anchor: 'start', size: 11, fill: '#B91C1C', bold: true }) +
  chain3(
    56,
    [
      ["A₁' = ?", 'Rf₁ 改成？'],
      ["A₂' = +4", '保持不变'],
      ["A₃' = ?", 'Rf₃ 改成？'],
    ],
    'w37m5',
  ) +
  T(210, 128, "约束：A₁'·A₂'·A₃' = +8，且每一级 |v_ok'| < 15 V", { size: 11, bold: true, fill: '#1D4ED8' }) +
  `</svg>`;

/** act 6: the five-step routine the drill runs through */
export const SVG_ACT6 = (() => {
  const steps = ['拓扑体检', '逐级识图写通式', '自左向右算电位', '逐级饱和安检', 'KCL 核算输出电流'];
  const subs = ['有没有跨级反馈？', 'A₁, A₂, …, Aₙ', 'v_o1 → v_o2 → …', '|v_ok| 越轨就钳位', '自身反馈 + 后级/负载'];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 128" width="680" height="128"><defs>${ARROW('w37a6', '#475569')}</defs>${BG(680, 128)}`;
  s += T(18, 26, '“自左向右逐级解耦”五步黄金流程：演练里一步也不跳', { anchor: 'start', bold: true, size: 13 });
  steps.forEach((t, k) => {
    const x = 16 + k * 132;
    const warn = k === 3;
    s += `<rect x="${x}" y="44" width="118" height="64" rx="9" fill="${warn ? '#FEF2F2' : '#EFF6FF'}" stroke="${warn ? '#DC2626' : '#3B82F6'}" stroke-width="1.6"/>`;
    s += `<circle cx="${x + 16}" cy="60" r="9" fill="${warn ? '#DC2626' : '#2563EB'}"/>` + T(x + 16, 64, String(k + 1), { size: 11, bold: true, fill: '#FFFFFF' });
    s += T(x + 71, 64, t, { size: 10, bold: true, fill: warn ? '#991B1B' : '#1E3A8A' });
    s += T(x + 59, 94, subs[k], { size: 10, fill: '#475569' });
    if (k < 4) s += `<line x1="${x + 119}" y1="76" x2="${x + 131}" y2="76" stroke="#475569" stroke-width="1.6" marker-end="url(#w37a6)"/>`;
  });
  return s + '</svg>';
})();

/* ------------------------------------------------------------------ quiz figures */

/** Q1: stage 1 drives an inverting stage 2 that draws current */
export const SVG_Q1 =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 140" width="420" height="140"><defs>${ARROW('w37q1', '#DC2626')}</defs>${BG(420, 140)}` +
  T(14, 22, '两级理想运放直接级联', { anchor: 'start', bold: true, size: 12 }) +
  box(24, 48, 120, 56, ...BLUE, '前级 U₁', '闭环增益 A₁') +
  `<line x1="144" y1="76" x2="262" y2="76" stroke="#0F172A" stroke-width="2"/><circle cx="168" cy="76" r="4.5" fill="#0D9488"/>` +
  T(168, 64, 'v_o1', { size: 11, bold: true, fill: '#0F766E' }) +
  `<line x1="190" y1="90" x2="238" y2="90" stroke="#DC2626" stroke-width="2" marker-end="url(#w37q1)"/>` +
  T(214, 108, 'i_in2', { size: 10.5, bold: true, fill: '#B91C1C' }) +
  box(262, 48, 134, 56, ...GREEN, '后级 U₂', '输入电阻 R_in2') +
  T(210, 130, '后级接上之后，v_o1 会不会被拉低？', { size: 11, fill: '#475569' }) +
  `</svg>`;

/** Q2: inverting → follower → inverting */
export const SVG_Q2 =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 132" width="420" height="132"><defs>${ARROW('w37q2', '#0F172A')}</defs>${BG(420, 132)}` +
  T(14, 22, 'vᵢ = 0.5 V，电源轨 ±15 V', { anchor: 'start', bold: true, size: 12 }) +
  chain3(
    44,
    [
      ['反相', '10k / 30k'],
      ['电压跟随器', '直连反馈'],
      ['反相', '5k / 20k'],
    ],
    'w37q2',
  ) +
  T(410, 112, 'vₒ = ?', { anchor: 'end', size: 12, bold: true, fill: '#7E22CE' }) +
  T(12, 112, 'vᵢ', { anchor: 'start', size: 12, bold: true, fill: '#1E40AF' }) +
  `</svg>`;

/** Q3: three linear gains inside ±12 V */
export const SVG_Q3 =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 132" width="420" height="132"><defs>${ARROW('w37q3', '#0F172A')}</defs>${BG(420, 132)}` +
  T(14, 22, 'vᵢ = 0.8 V，对称电源轨 ±12 V', { anchor: 'start', bold: true, size: 12 }) +
  chain3(
    44,
    [
      ['Stage 1', 'A₁ = +5'],
      ['Stage 2', 'A₂ = −4'],
      ['Stage 3', 'A₃ = +0.2'],
    ],
    'w37q3',
  ) +
  T(410, 112, 'vₒ = ?', { anchor: 'end', size: 12, bold: true, fill: '#7E22CE' }) +
  T(12, 112, 'vᵢ', { anchor: 'start', size: 12, bold: true, fill: '#1E40AF' }) +
  T(210, 112, '每一级的输出都要过 ±12 V 这道关', { size: 10.5, fill: '#B91C1C' }) +
  `</svg>`;

/** Q4: two stages with R_G = 80 kΩ from v_o back to v₋₁ */
export const SVG_Q4 =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 150" width="420" height="150"><defs>${ARROW('w37q4', '#0F172A')}</defs>${BG(420, 150)}` +
  T(14, 22, 'vᵢ = 2.0 V，电源轨 ±15 V', { anchor: 'start', bold: true, size: 12 }) +
  `<polyline points="70,94 70,48 170,48" fill="none" stroke="#DC2626" stroke-width="2.2"/>` +
  `<rect x="170" y="38" width="80" height="20" rx="4" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.6"/>` +
  T(210, 52, 'R_G = 80k', { size: 10.5, bold: true, fill: '#B91C1C' }) +
  `<polyline points="250,48 386,48 386,94" fill="none" stroke="#DC2626" stroke-width="2.2"/>` +
  `<line x1="12" y1="94" x2="78" y2="94" stroke="#0F172A" stroke-width="1.8" marker-end="url(#w37q4)"/>` +
  `<circle cx="70" cy="94" r="4" fill="#DC2626"/>` +
  T(70, 120, 'v₋₁', { size: 10.5, bold: true, fill: '#B91C1C' }) +
  box(80, 70, 116, 48, ...BLUE, 'Stage 1 反相', 'R₁ = 10k, Rf₁ = 40k') +
  `<line x1="196" y1="94" x2="226" y2="94" stroke="#0F172A" stroke-width="1.8" marker-end="url(#w37q4)"/>` +
  box(228, 70, 136, 48, ...GREEN, 'Stage 2 同相', 'R₂ = Rf₂ = 10k') +
  `<line x1="364" y1="94" x2="408" y2="94" stroke="#0F172A" stroke-width="1.8"/><circle cx="386" cy="94" r="4" fill="#7E22CE"/>` +
  T(392, 116, 'vₒ = ?', { size: 11.5, bold: true, fill: '#7E22CE' }) +
  T(14, 140, '红线：一根电阻跨过 Stage 1，把 vₒ 连回 v₋₁', { anchor: 'start', size: 10.5, fill: '#B91C1C' }) +
  `</svg>`;
