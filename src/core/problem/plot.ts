// Optional u–i characteristic figure of a nonlinear resistor (schematic.plot): the element's
// characteristic, the load line of the rest of the circuit (曲线相交法) and the operating points,
// all computed by the analysis engine from the same netlist the questions use.

import { Circuit } from '../analysis/circuit';
import { dcSolver } from '../analysis/engine';
import { operatingPoints, restRelation, sampleLaw } from '../analysis/nonlinear';
import { tr } from '../i18n';
import { extractNetlist } from './geometry';
import type { Schematic, UiPlot } from './types';

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const range = (v: unknown) => Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === 'number' && Number.isFinite(x)) && v[0] < v[1];

/** Structural checks of schematic.plot (errors are pushed in the current language). */
export function checkPlot(s: Schematic, errors: string[]): void {
  const p = (s as { plot?: unknown }).plot;
  if (p === undefined) return;
  if (!isObj(p)) {
    errors.push(tr('schematic.plot: 必须是对象 {"el": "D", "u": [0, 4], "i": [0, 0.005]}', 'schematic.plot: must be an object {"el": "D", "u": [0, 4], "i": [0, 0.005]}'));
    return;
  }
  const el = (s.elements ?? []).find((e) => isObj(e) && e.ref === p.el);
  if (!el || el.type !== 'NR')
    errors.push(tr(`schematic.plot.el: ${JSON.stringify(p.el)} 必须是图中的非线性电阻（type "NR"）`, `schematic.plot.el: ${JSON.stringify(p.el)} must be a nonlinear resistor (type "NR") in the drawing`));
  for (const k of ['u', 'i'])
    if (!range(p[k])) errors.push(tr(`schematic.plot.${k}: 必须是坐标范围 [min, max]（min < max，SI 单位）`, `schematic.plot.${k}: must be an axis range [min, max] (min < max, SI units)`));
  for (const k of ['loadLine', 'points'])
    if (p[k] !== undefined && typeof p[k] !== 'boolean') errors.push(tr(`schematic.plot.${k}: 必须是 true / false`, `schematic.plot.${k}: must be true / false`));
  if (p.iUnit !== undefined && !['A', 'mA', 'µA'].includes(p.iUnit as string))
    errors.push(tr('schematic.plot.iUnit: 必须是 "A"、"mA" 或 "µA"', 'schematic.plot.iUnit: must be "A", "mA" or "µA"'));
  for (const k of Object.keys(p))
    if (!['el', 'u', 'i', 'loadLine', 'points', 'iUnit'].includes(k)) errors.push(tr(`schematic.plot: 不认识的字段 "${k}"`, `schematic.plot: unknown field "${k}"`));
}

export interface PlotData {
  plot: UiPlot;
  /** characteristic, as polylines of [u, i] */
  curve: [number, number][][];
  /** load line α·u + β·i = γ clipped to the window, or null */
  load: [[number, number], [number, number]] | null;
  /** operating points [u, i] of the element */
  points: [number, number][];
}

/** Clip the line α·u + β·i = γ to the window. */
function clipLine(alpha: number, beta: number, gamma: number, u: [number, number], i: [number, number]): [[number, number], [number, number]] | null {
  const pts: [number, number][] = [];
  const add = (a: number, b: number) => {
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;
    const eu = 1e-9 * (u[1] - u[0]);
    const ei = 1e-9 * (i[1] - i[0]);
    if (a < u[0] - eu || a > u[1] + eu || b < i[0] - ei || b > i[1] + ei) return;
    if (!pts.some((p) => Math.abs(p[0] - a) <= eu && Math.abs(p[1] - b) <= ei)) pts.push([a, b]);
  };
  if (beta !== 0) for (const uu of u) add(uu, (gamma - alpha * uu) / beta);
  if (alpha !== 0) for (const ii of i) add((gamma - beta * ii) / alpha, ii);
  return pts.length >= 2 ? [pts[0], pts[1]] : null;
}

/** Everything the figure draws; null when the schematic has no (valid) plot. */
export function plotData(s: Schematic): PlotData | null {
  const plot = (s as { plot?: UiPlot }).plot;
  if (!plot || !range(plot.u) || !range(plot.i)) return null;
  try {
    const { netlist, errors } = extractNetlist(s);
    if (errors.length) return null;
    const ckt = new Circuit(netlist);
    const el = ckt.byRef.get(plot.el);
    if (!el?.nl) return null;
    const curve = sampleLaw(el.nl, plot.u[0], plot.u[1], plot.i[0], plot.i[1]);
    const nls = ckt.els.filter((e) => e.type === 'NR');
    const solver = dcSolver(ckt);
    let load: PlotData['load'] = null;
    if (plot.loadLine && nls.length === 1) {
      const r = restRelation(el, solver);
      if (r) load = clipLine(r.alpha, r.beta, r.gamma, plot.u, plot.i);
    }
    let points: [number, number][] = [];
    if (plot.points) {
      try {
        points = operatingPoints(nls, solver).map((o) => [o.u[el.ref], o.i[el.ref]]);
      } catch {
        points = [];
      }
    }
    return { plot, curve, load, points };
  } catch {
    return null;
  }
}
