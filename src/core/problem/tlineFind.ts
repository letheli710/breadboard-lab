// Structural checks of the transmission-line `find` kind {kind: "tl", el, what, x?, from?} — kept
// apart from parse.ts so other chapters' additions don't collide with this one. The engine side is
// src/core/analysis/tline.ts; the format is documented in docs/PROBLEM_FORMAT.md §6.1.9.

import { tr } from '../i18n';
import { TL_AT_X, TL_TIMED, TL_WHATS, TL_X_OK } from '../analysis/tline';
import type { ProblemElement } from './types';

/**
 * @returns false if the find is structurally invalid (errors pushed)
 */
export function checkTlineFind(find: Record<string, unknown>, where: string, els: Map<string, ProblemElement>, analysisType: string | undefined, errors: string[]): boolean {
  let ok = true;
  const err = (zh: string, en: string) => {
    errors.push(tr(`${where}.find.${zh}`, `${where}.find.${en}`));
    ok = false;
  };
  const lines = [...els.values()].filter((e) => e.type === 'TL').map((e) => e.ref);
  if (typeof find.el !== 'string' || (els.size > 0 && els.get(find.el)?.type !== 'TL'))
    err(`el: 必须是传输线（type TL）的 ref（现有：${lines.join(', ') || '无'}）`, `el: must name a transmission line (type TL) (available: ${lines.join(', ') || 'none'})`);
  const what = find.what as string;
  if (!(TL_WHATS as readonly string[]).includes(what)) {
    err(`what: 未知的传输线量 ${JSON.stringify(what)}（可用：${TL_WHATS.join(', ')}）`, `what: unknown line quantity ${JSON.stringify(what)} (available: ${TL_WHATS.join(', ')})`);
    return false;
  }
  if (find.x !== undefined) {
    if (!(typeof find.x === 'number' && Number.isFinite(find.x) && find.x >= 0)) err('x: 必须是 ≥ 0 的距离（米）', 'x: must be a distance ≥ 0 (metres)');
    else if (!TL_X_OK.includes(what)) err(`x: "${what}" 不需要位置`, `x: "${what}" takes no position`);
  } else if (TL_AT_X.includes(what)) err(`x: "${what}" 需要位置 x（米，默认从始端量起）`, `x: "${what}" needs a position x (metres, from the start unless "from": "end")`);
  if (find.from !== undefined && find.from !== 'start' && find.from !== 'end') err('from: 必须是 "start"（始端）或 "end"（终端）', 'from: must be "start" or "end"');
  if (analysisType === 'tran') {
    if (TL_TIMED.includes(what) && find.t === undefined)
      err(`t: 暂态题的 "${what}" 必须给出时刻 t（秒，或 "0+" / "inf"）`, `t: "${what}" in a transient problem needs a time t (seconds, or "0+" / "inf")`);
  } else if (analysisType !== undefined && analysisType !== 'ac')
    err('kind: "tl" 只用于正弦稳态（ac）或暂态（tran）题', 'kind: "tl" is only available in AC or transient (tran) problems');
  return ok;
}
