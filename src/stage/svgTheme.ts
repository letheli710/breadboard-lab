// Lesson sheets draw their inline SVG for a dark canvas (Tailwind slate: #0f172a background, light
// text and wires, pastel accents). The site is warm white, so `lightSvg` recolours such an SVG for
// the light theme. The geometry and text are left alone; only colours change, by role:
//  - text (<text>, <tspan>, and <g> groups whose fill is a text colour): light greys → ink,
//    pastel accents → their deep shade (≥ 4.5:1 on white);
//  - shape fills: the dark canvas / panels → paper / white / light tints, light accents → a
//    deeper shade so they keep ≥ 3:1 on white; pale tints stay (they read as boxes on white);
//  - strokes: light wires and outlines → ink / slate, dark borders → light hairlines, accents
//    deeper.
// Colours not in the tables are kept. Every lesson uses this one mapping, so all diagrams share
// one palette.

type Map = Record<string, string>;

const TEXT: Map = {
  '#ffffff': '#1f2a44',
  '#fff': '#1f2a44',
  '#f8fafc': '#1f2a44',
  '#f1f5f9': '#1f2a44',
  '#e2e8f0': '#1f2a44',
  '#cbd5e1': '#3a4560',
  '#94a3b8': '#5f626b',
  '#64748b': '#5f626b',
  '#38bdf8': '#0369a1',
  '#7dd3fc': '#0369a1',
  '#bae6fd': '#0369a1',
  '#e0f2fe': '#0c4a6e',
  '#60a5fa': '#1d4ed8',
  '#93c5fd': '#1d4ed8',
  '#34d399': '#047857',
  '#6ee7b7': '#047857',
  '#a7f3d0': '#065f46',
  '#10b981': '#047857',
  '#22c55e': '#15803d',
  '#4ade80': '#15803d',
  '#86efac': '#15803d',
  '#f59e0b': '#b45309',
  '#fbbf24': '#a16207',
  '#fcd34d': '#a16207',
  '#fde68a': '#92400e',
  '#fef3c7': '#92400e',
  '#f43f5e': '#be123c',
  '#fb7185': '#be123c',
  '#fda4af': '#be123c',
  '#ef4444': '#b91c1c',
  '#f87171': '#b91c1c',
  '#fca5a5': '#b91c1c',
  '#a78bfa': '#6d28d9',
  '#c4b5fd': '#6d28d9',
  '#a855f7': '#7e22ce',
  '#d8b4fe': '#7e22ce',
  '#f472b6': '#be185d',
  '#2dd4bf': '#0f766e',
};

const FILL: Map = {
  '#020617': '#fbf7ef',
  '#0f172a': '#fbf7ef',
  '#111827': '#fbf7ef',
  '#1e293b': '#ffffff',
  '#1f2937': '#ffffff',
  '#334155': '#e2e8f0',
  '#374151': '#e2e8f0',
  '#475569': '#cbd5e1',
  '#064e3b': '#d1fae5',
  '#065f46': '#d1fae5',
  '#022c22': '#d1fae5',
  '#451a03': '#fef3c7',
  '#78350f': '#fef3c7',
  '#450a0a': '#fee2e2',
  '#7f1d1d': '#fee2e2',
  '#4c0519': '#ffe4e6',
  '#0c4a6e': '#e0f2fe',
  '#082f49': '#e0f2fe',
  '#1e3a8a': '#dbeafe',
  '#172554': '#dbeafe',
  '#2e1065': '#ede9fe',
  '#3b0764': '#f3e8ff',
  '#38bdf8': '#0284c7',
  '#7dd3fc': '#0ea5e9',
  '#34d399': '#059669',
  '#6ee7b7': '#10b981',
  '#4ade80': '#16a34a',
  '#86efac': '#22c55e',
  '#fbbf24': '#d97706',
  '#fcd34d': '#f59e0b',
  '#fb7185': '#e11d48',
  '#fda4af': '#f43f5e',
  '#f87171': '#dc2626',
  '#fca5a5': '#ef4444',
  '#a78bfa': '#7c3aed',
  '#c4b5fd': '#8b5cf6',
  '#d8b4fe': '#a855f7',
  '#94a3b8': '#64748b',
  '#cbd5e1': '#94a3b8',
  '#e2e8f0': '#cbd5e1',
};

const STROKE: Map = {
  '#ffffff': '#1f2a44',
  '#fff': '#1f2a44',
  '#f8fafc': '#1f2a44',
  '#f1f5f9': '#1f2a44',
  '#e2e8f0': '#334155',
  '#cbd5e1': '#475569',
  '#94a3b8': '#64748b',
  '#64748b': '#94a3b8',
  '#475569': '#cbd5e1',
  '#334155': '#d6c9ae',
  '#1e293b': '#e3d8c2',
  '#0f172a': '#ffffff',
  '#38bdf8': '#0284c7',
  '#7dd3fc': '#0284c7',
  '#60a5fa': '#2563eb',
  '#34d399': '#059669',
  '#6ee7b7': '#059669',
  '#22c55e': '#16a34a',
  '#4ade80': '#16a34a',
  '#86efac': '#16a34a',
  '#f59e0b': '#d97706',
  '#fbbf24': '#d97706',
  '#fde68a': '#d97706',
  '#fb7185': '#e11d48',
  '#fda4af': '#e11d48',
  '#f87171': '#dc2626',
  '#fca5a5': '#dc2626',
  '#a78bfa': '#7c3aed',
  '#c4b5fd': '#7c3aed',
  '#d8b4fe': '#9333ea',
};

const TEXT_TAGS = new Set(['text', 'tspan', 'textPath']);

/** #abc → #aabbcc, lower case */
function norm(c: string): string {
  const h = c.toLowerCase();
  return /^#[0-9a-f]{3}$/.test(h) ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;
}

function recolour(tag: string, prop: string, value: string): string {
  const c = norm(value.trim());
  if (!c.startsWith('#')) return value;
  // a group's fill is inherited by its text and shapes alike: a text colour wins there
  const asText = TEXT_TAGS.has(tag) || (tag === 'g' && c in TEXT);
  if (prop === 'stroke') return STROKE[c] ?? value;
  if (prop === 'fill' && asText) return TEXT[c] ?? value;
  if (prop === 'fill' || prop === 'stop-color' || prop === 'background' || prop === 'background-color') return FILL[c] ?? value;
  return value;
}

/** Recolour an inline SVG drawn for a dark canvas to the site's light theme. */
export function lightSvg(svg: string): string {
  return svg.replace(/<([a-zA-Z][\w:-]*)(\s[^<>]*?)?(\/?)>/g, (whole, tag: string, attrs: string | undefined, close: string) => {
    if (!attrs) return whole;
    let a = attrs.replace(/\b(fill|stroke|stop-color)=(["'])([^"']*)\2/g, (_m, prop: string, q: string, v: string) => `${prop}=${q}${recolour(tag, prop, v)}${q}`);
    const css = (body: string) =>
      body.replace(
        /(^|;)\s*(fill|stroke|stop-color|background|background-color)\s*:\s*([^;]+)/g,
        (_x, sep: string, prop: string, v: string) => `${sep}${prop}:${recolour(tag, prop, v)}`,
      );
    a = a.replace(/\bstyle="([^"]*)"/g, (_m, body: string) => `style="${css(body)}"`).replace(/\bstyle='([^']*)'/g, (_m, body: string) => `style='${css(body)}'`);
    return `<${tag}${a}${close}>`;
  });
}
