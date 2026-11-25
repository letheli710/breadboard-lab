// TeX of a second-order solution (model.ts Second): x(t) = x_ss + x_t(t) with the signs folded in,
// and the roots. Used by the stage readouts and checked against the sheet's expressions in
// model.test.ts.

import { num, type Second } from './model';

/** a number for TeX: integers from 100 up, one decimal from 10, three below */
export const fx = (x: number) => {
  const a = Math.abs(x);
  return num(x, a >= 100 ? 0 : a >= 10 ? 1 : 3).replace('−', '-');
};

/** x_ss + x_t(t) as TeX */
export function responseTex(s: Second): string {
  const head = Math.abs(s.xss) < 1e-12 ? '' : fx(s.xss);
  const term = (k: number, body: string, first: boolean) => {
    if (Math.abs(k) < 1e-12) return '';
    const sign = k < 0 ? ' - ' : first && !head ? '' : ' + ';
    return `${sign}${fx(Math.abs(k))}${body}`;
  };
  if (s.kind === 'over') return `${head}${term(s.k1, `e^{${fx(s.s1)}t}`, true)}${term(s.k2, `e^{${fx(s.s2)}t}`, false)}`;
  const sg = s.k1 < 0 ? -1 : 1;
  const a = fx(s.alpha);
  const lead = `${head} ${sg < 0 ? '-' : head ? '+' : ''}`;
  if (s.kind === 'critical') {
    const d2 = sg * s.k2;
    return `${lead} (${fx(sg * s.k1)} ${d2 < 0 ? '-' : '+'} ${fx(Math.abs(d2))}t)e^{-${a}t}`;
  }
  const w = fx(s.wd);
  const b2 = sg * s.k2;
  return `${lead} e^{-${a}t}\\left(${fx(sg * s.k1)}\\cos ${w}t ${b2 < 0 ? '-' : '+'} ${fx(Math.abs(b2))}\\sin ${w}t\\right)`;
}

export function rootsTex(s: Second): string {
  if (s.kind === 'under') return `s_{1,2} = -${fx(s.alpha)} \\pm j${fx(s.wd)}`;
  if (s.kind === 'critical') return `s_1 = s_2 = ${fx(s.s1)}`;
  return `s_1 = ${fx(s.s1)},\\; s_2 = ${fx(s.s2)}`;
}
