// Stage ids of the 3D breadboard's strips (kept apart from the three.js scene, so lesson data can
// name them without loading three.js).

/** Hover id of a column strip: the lesson's id for a10–e10, a generic one for the others. */
export const stripId = (half: 'u' | 'l', c: number) => (half === 'u' && c === 10 ? 'col_strip_a10' : `strip_${half}_${c}`);

/** Tooltip text for ids the hover map doesn't name (the other column strips). */
export function genericLabel(id: string): { label: string; desc: string } | null {
  const m = /^strip_([ul])_(\d+)$/.exec(id);
  if (!m) return null;
  const rows = m[1] === 'u' ? 'a–e' : 'f–j';
  return { label: `第 ${m[2]} 列 ${rows}`, desc: '这 5 个孔底下是同一块铜片：纵向连通，是同一个节点' };
}
