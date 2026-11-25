// W1-L8 diagrams added here (not in the sheet), drawn in the sheet's dark board style: the guided
// example's problem figure and the two self-test figures (they show the set-up, not the answer).

const SUB = (s: string) => `<tspan baseline-shift="sub" font-size="72%">${s}</tspan>`;

/** A 5-resistor bridge with the given values (Ω), a top, c left, d right, b bottom. */
export function bridgeSvg(title: string, v: { ac: string; ad: string; cd: string; cb: string; db: string }, label: string): string {
  const box = (x: number, y: number, name: string, val: string, stroke: string, fill: string, ink: string) =>
    `<rect x="${x - 36}" y="${y - 10}" width="72" height="20" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
  <text x="${x}" y="${y + 4}" fill="${ink}" font-size="11" font-weight="700" text-anchor="middle">R${SUB(name)} = ${val}</text>`;
  return `<svg viewBox="0 0 420 236" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif" role="img" aria-label="${label}">
  <rect width="420" height="236" rx="12" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">${title}</text>
  <line x1="210" y1="32" x2="210" y2="48" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="210" y1="208" x2="210" y2="224" stroke="#e2e8f0" stroke-width="2.2"/>
  <line x1="210" y1="48" x2="110" y2="128" stroke="#38bdf8" stroke-width="2.2"/>
  <line x1="210" y1="48" x2="310" y2="128" stroke="#38bdf8" stroke-width="2.2"/>
  <line x1="110" y1="128" x2="310" y2="128" stroke="#f43f5e" stroke-width="2.4"/>
  <line x1="110" y1="128" x2="210" y2="208" stroke="#cbd5e1" stroke-width="2.2"/>
  <line x1="310" y1="128" x2="210" y2="208" stroke="#cbd5e1" stroke-width="2.2"/>
  ${box(148, 84, 'ac', v.ac, '#38bdf8', '#1e293b', '#e0f2fe')}
  ${box(272, 84, 'ad', v.ad, '#38bdf8', '#1e293b', '#e0f2fe')}
  ${box(210, 128, 'cd', v.cd, '#f43f5e', '#3b0718', '#fda4af')}
  ${box(148, 172, 'cb', v.cb, '#cbd5e1', '#1e293b', '#e2e8f0')}
  ${box(272, 172, 'db', v.db, '#cbd5e1', '#1e293b', '#e2e8f0')}
  <circle cx="210" cy="48" r="4.5" fill="#10b981"/>
  <circle cx="210" cy="208" r="4.5" fill="#10b981"/>
  <circle cx="110" cy="128" r="5" fill="#f59e0b"/>
  <circle cx="310" cy="128" r="5" fill="#f59e0b"/>
  <circle cx="210" cy="30" r="4" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
  <circle cx="210" cy="226" r="4" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
  <text x="222" y="36" fill="#10b981" font-size="13" font-weight="700">a</text>
  <text x="222" y="230" fill="#10b981" font-size="13" font-weight="700">b</text>
  <text x="96" y="132" fill="#f59e0b" font-size="13" font-weight="700" text-anchor="end">c</text>
  <text x="324" y="132" fill="#f59e0b" font-size="13" font-weight="700">d</text>
</svg>`;
}

export const SVG_PROBLEM = bridgeSvg(
  '例题 · 不平衡电桥',
  { ac: '12 Ω', ad: '18 Ω', cd: '6 Ω', cb: '10 Ω', db: '21 Ω' },
  '不平衡电桥：R_ac 12 Ω，R_ad 18 Ω，R_cd 6 Ω，R_cb 10 Ω，R_db 21 Ω',
);

export const SVG_Q1 = bridgeSvg('Q1 · 全部 18 Ω 的电桥', { ac: '18 Ω', ad: '18 Ω', cd: '18 Ω', cb: '18 Ω', db: '18 Ω' }, '5 颗电阻全部为 18 Ω 的电桥');

/** Q2: the Y (4, 6, 12 Ω) and, dashed, the Δ side R_a (b–c) being asked for. */
export const SVG_Q2 = `<svg viewBox="0 0 420 236" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif" role="img" aria-label="Y 网络 R_1 4 Ω、R_2 6 Ω、R_3 12 Ω，求 b–c 之间的 R_a">
  <rect width="420" height="236" rx="12" fill="#0f172a"/>
  <text x="16" y="24" fill="#94a3b8" font-size="12" font-weight="600">Q2 · 已知 Y 网络，求 b–c 之间的 Δ 边 R${SUB('a')}</text>
  <line x1="300" y1="56" x2="210" y2="206" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4"/>
  <rect x="233" y="100" width="70" height="20" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="268" y="114" fill="#e0f2fe" font-size="11" font-weight="700" text-anchor="middle">R${SUB('a')} = ?</text>
  <line x1="120" y1="56" x2="210" y2="120" stroke="#f59e0b" stroke-width="2.6"/>
  <line x1="300" y1="56" x2="210" y2="120" stroke="#f59e0b" stroke-width="2.6"/>
  <line x1="210" y1="120" x2="210" y2="206" stroke="#f59e0b" stroke-width="2.6"/>
  <rect x="122" y="76" width="62" height="20" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="153" y="90" fill="#fde68a" font-size="11" font-weight="700" text-anchor="middle">R${SUB('1')} = 4 Ω</text>
  <rect x="236" y="76" width="62" height="20" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="267" y="90" fill="#fde68a" font-size="11" font-weight="700" text-anchor="middle">R${SUB('2')} = 6 Ω</text>
  <rect x="176" y="152" width="68" height="20" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.8"/>
  <text x="210" y="166" fill="#fde68a" font-size="11" font-weight="700" text-anchor="middle">R${SUB('3')} = 12 Ω</text>
  <circle cx="120" cy="56" r="5" fill="#10b981"/>
  <circle cx="300" cy="56" r="5" fill="#10b981"/>
  <circle cx="210" cy="206" r="5" fill="#10b981"/>
  <circle cx="210" cy="120" r="4.5" fill="#f59e0b"/>
  <text x="106" y="60" fill="#10b981" font-size="13" font-weight="700" text-anchor="end">a</text>
  <text x="314" y="60" fill="#10b981" font-size="13" font-weight="700">b</text>
  <text x="210" y="226" fill="#10b981" font-size="13" font-weight="700" text-anchor="middle">c</text>
  <text x="196" y="124" fill="#fde68a" font-size="11" font-weight="700" text-anchor="end">n</text>
</svg>`;
