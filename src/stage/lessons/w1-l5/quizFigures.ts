// W1-L5 quiz diagrams (added here: every question gets a local diagram). They show the set-up
// of each question without giving the answer away. Same light palette as the act diagrams.

export const SVG_Q1 = `<svg role="img" aria-label="四引脚黑盒芯片：引脚 1 流入 12 mA，引脚 2 流出 4 mA，引脚 3 流入 5 mA，引脚 4 未知" viewBox="0 0 420 150" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-q1g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="arr-q1a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706"/>
    </marker>
  </defs>
  <rect x="120" y="18" width="180" height="114" rx="26" fill="#e0f2fe" fill-opacity="0.5" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="7,5"/>
  <text x="290" y="34" fill="#0369a1" font-size="10" font-weight="700" text-anchor="end">封闭曲面 S</text>
  <rect x="160" y="42" width="100" height="70" rx="6" fill="#ffffff" stroke="#1f2a44" stroke-width="2"/>
  <text x="210" y="74" fill="#1f2a44" font-size="12" font-weight="800" text-anchor="middle">黑盒 IC</text>
  <text x="210" y="92" fill="#64748b" font-size="9.5" text-anchor="middle">内部结构未知</text>
  <line x1="40" y1="58" x2="156" y2="58" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-q1g)"/>
  <text x="44" y="50" fill="#047857" font-size="10.5" font-weight="700">引脚 1：流入 12 mA</text>
  <line x1="160" y1="96" x2="44" y2="96" stroke="#d97706" stroke-width="2.2" marker-end="url(#arr-q1a)"/>
  <text x="44" y="114" fill="#b45309" font-size="10.5" font-weight="700">引脚 2：流出 4 mA</text>
  <line x1="380" y1="58" x2="264" y2="58" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-q1g)"/>
  <text x="376" y="50" fill="#047857" font-size="10.5" font-weight="700" text-anchor="end">引脚 3：流入 5 mA</text>
  <line x1="260" y1="96" x2="380" y2="96" stroke="#94a3b8" stroke-width="2.2" stroke-dasharray="4,3"/>
  <text x="376" y="114" fill="#475569" font-size="10.5" font-weight="700" text-anchor="end">引脚 4：大小？方向？</text>
</svg>`;

export const SVG_Q2 = `<svg role="img" aria-label="两种接法：3 A 与 5 A 同向串联；3 A 向上与 5 A 向下并联" viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <marker id="arr-q2b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7"/>
    </marker>
    <marker id="arr-q2a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706"/>
    </marker>
  </defs>
  <text x="105" y="20" fill="#334155" font-size="11" font-weight="700" text-anchor="middle">接法①：同一条路径上串联</text>
  <line x1="105" y1="32" x2="105" y2="150" stroke="#334155" stroke-width="1.8"/>
  <circle cx="105" cy="62" r="17" fill="#ffffff" stroke="#0284c7" stroke-width="1.8"/>
  <line x1="105" y1="72" x2="105" y2="54" stroke="#0284c7" stroke-width="2" marker-end="url(#arr-q2b)"/>
  <text x="130" y="66" fill="#0369a1" font-size="10.5" font-weight="700">3 A</text>
  <circle cx="105" cy="96" r="4" fill="#1f2a44"/>
  <circle cx="105" cy="128" r="17" fill="#ffffff" stroke="#0284c7" stroke-width="1.8"/>
  <line x1="105" y1="138" x2="105" y2="120" stroke="#0284c7" stroke-width="2" marker-end="url(#arr-q2b)"/>
  <text x="130" y="132" fill="#0369a1" font-size="10.5" font-weight="700">5 A</text>
  <line x1="210" y1="14" x2="210" y2="160" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="315" y="20" fill="#334155" font-size="11" font-weight="700" text-anchor="middle">接法②：并联在同一对节点间</text>
  <line x1="255" y1="40" x2="375" y2="40" stroke="#334155" stroke-width="1.8"/>
  <line x1="255" y1="150" x2="375" y2="150" stroke="#334155" stroke-width="1.8"/>
  <line x1="285" y1="40" x2="285" y2="150" stroke="#334155" stroke-width="1.8"/>
  <line x1="345" y1="40" x2="345" y2="150" stroke="#334155" stroke-width="1.8"/>
  <circle cx="285" cy="95" r="17" fill="#ffffff" stroke="#0284c7" stroke-width="1.8"/>
  <line x1="285" y1="105" x2="285" y2="87" stroke="#0284c7" stroke-width="2" marker-end="url(#arr-q2b)"/>
  <circle cx="345" cy="95" r="17" fill="#ffffff" stroke="#d97706" stroke-width="1.8"/>
  <line x1="345" y1="85" x2="345" y2="103" stroke="#d97706" stroke-width="2" marker-end="url(#arr-q2a)"/>
  <text x="262" y="128" fill="#0369a1" font-size="10.5" font-weight="700" text-anchor="end">3 A↑</text>
  <text x="368" y="128" fill="#b45309" font-size="10.5" font-weight="700">5 A↓</text>
  <text x="380" y="36" fill="#475569" font-size="10" font-weight="700">a</text>
  <text x="380" y="160" fill="#475569" font-size="10" font-weight="700">b</text>
</svg>`;
