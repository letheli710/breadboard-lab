// Structural checks of the s-domain `find` kinds (H, pole, zero, hcoef, residue) — kept apart from
// parse.ts so other chapters' additions don't collide with this one. The engine side is
// src/core/analysis/sdomain.ts; the format is documented in docs/PROBLEM_FORMAT.md §6.1.7.

import { tr } from '../i18n';
import { SDOMAIN_KINDS, isSdomainKind } from '../analysis/sdomain';

export { SDOMAIN_KINDS, isSdomainKind };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isCplx = (v: unknown) =>
  (typeof v === 'number' && Number.isFinite(v)) ||
  (isObj(v) &&
    Object.keys(v).every((k) => k === 're' || k === 'im') &&
    ['re', 'im'].every((k) => v[k] === undefined || (typeof v[k] === 'number' && Number.isFinite(v[k] as number))));

/** The element / node an `out` names, for the auto-added reference mark ({i: "L"} → current arrow on L). */
export function sdomainMark(find: Record<string, unknown>): { kind: 'i' | 'v'; el: string } | null {
  if (!isSdomainKind(find.kind) || !isObj(find.out)) return null;
  if (typeof find.out.i === 'string') return { kind: 'i', el: find.out.i };
  if (typeof find.out.v === 'string') return { kind: 'v', el: find.out.v };
  return null;
}

/**
 * @param el   checks that find[key] names an element (pushes the error itself)
 * @param node checks a node name (pushes the error itself)
 * @returns false if the find is structurally invalid
 */
export function checkSdomainFind(
  find: Record<string, unknown>,
  where: string,
  el: (key: string) => void,
  hasEl: (ref: unknown) => boolean,
  node: (n: unknown, label: string) => void,
  analysisType: string | undefined,
  errors: string[],
): boolean {
  let ok = true;
  const err = (zh: string, en: string) => {
    errors.push(tr(`${where}.find.${zh}`, `${where}.find.${en}`));
    ok = false;
  };
  const kind = find.kind as string;
  // out
  const out = find.out;
  if (Array.isArray(out) && out.length >= 1 && out.length <= 2) out.forEach((n, i) => node(n, `out[${i}]`));
  else if (isObj(out) && Object.keys(out).length === 1 && (typeof out.v === 'string' || typeof out.i === 'string')) {
    const ref = (out.v ?? out.i) as string;
    if (!hasEl(ref)) err(`out: 找不到元件 ${JSON.stringify(ref)}`, `out: no element ${JSON.stringify(ref)}`);
  } else
    err(
      'out: 必须是 ["a"]、["a", "b"]（结点电压）、{"v": "R1"}（元件电压）或 {"i": "R1"}（元件电流）',
      'out: must be ["a"], ["a", "b"] (node voltage), {"v": "R1"} (element voltage) or {"i": "R1"} (element current)',
    );
  if (kind !== 'residue') el('input');
  switch (kind) {
    case 'H':
      if (!isCplx(find.s)) err('s: 必须是数或 {"re": …, "im": …}', 's: must be a number or {"re": …, "im": …}');
      break;
    case 'pole':
    case 'zero':
      if (!(typeof find.n === 'number' && Number.isInteger(find.n) && find.n >= 1)) err('n: 必须是 1、2、…（第几个）', 'n: must be 1, 2, … (which one)');
      break;
    case 'hcoef':
      if (find.of !== 'num' && find.of !== 'den') err('of: 必须是 "num"（分子）或 "den"（分母）', 'of: must be "num" (numerator) or "den" (denominator)');
      if (!(typeof find.power === 'number' && Number.isInteger(find.power) && find.power >= 0))
        err('power: 必须是 0、1、2、…（s 的幂次）', 'power: must be 0, 1, 2, … (power of s)');
      break;
    case 'residue':
      if (!isCplx(find.at)) err('at: 必须是极点的值：数或 {"re": …, "im": …}', 'at: must be the pole: a number or {"re": …, "im": …}');
      if (find.order !== undefined && !(typeof find.order === 'number' && Number.isInteger(find.order) && find.order >= 1))
        err('order: 必须是 1、2、…（1/(s − p)^k 的 k）', 'order: must be 1, 2, … (the k of 1/(s − p)^k)');
      if (analysisType !== undefined && analysisType !== 'tran') err('kind: "residue" 只用于暂态题（tran）', 'kind: "residue" is only available in transient problems (tran)');
      break;
  }
  return ok;
}
