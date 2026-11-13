// Structural checks of the matrix-form chapter: the `find` kinds mat / gcount / state and the
// schematic.graph / schematic.state blocks. Kept apart from parse.ts so other chapters' additions
// don't collide with this one. The engine side is src/core/analysis/matrixform.ts; the format is
// documented in docs/PROBLEM_FORMAT.md §6.1.9.

import { COUNTS, MATRICES, MATRIX_KINDS, checkGraphAgainstCircuit, isMatrixKind } from '../analysis/matrixform';
import { tr } from '../i18n';
import type { Analysis, Netlist, Schematic } from './types';

export { MATRIX_KINDS, isMatrixKind };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isPt = (v: unknown) => Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === 'number' && Number.isFinite(x));
const posInt = (v: unknown) => typeof v === 'number' && Number.isInteger(v) && v >= 1;

/** @returns false if the find is structurally invalid */
export function checkMatrixFind(find: Record<string, unknown>, where: string, schematic: Schematic | null, errors: string[]): boolean {
  let ok = true;
  const err = (zh: string, en: string) => {
    errors.push(tr(`${where}.find.${zh}`, `${where}.find.${en}`));
    ok = false;
  };
  const kind = find.kind as string;
  if (kind === 'state') {
    if (schematic && !isObj(schematic.state))
      err('kind: "state" 需要 schematic.state = {"x": [...], "u": [...]}', 'kind: "state" needs schematic.state = {"x": [...], "u": [...]}');
    if (find.mat !== 'A' && find.mat !== 'B') err('mat: 必须是 "A" 或 "B"（ẋ = Ax + Bu）', 'mat: must be "A" or "B" (ẋ = Ax + Bu)');
    if (!posInt(find.row) || !posInt(find.col)) err('row / col: 必须是 1、2、…（第几行、第几列）', 'row / col: must be 1, 2, … (row and column)');
    return ok;
  }
  if (schematic && !isObj(schematic.graph)) err(`kind: "${kind}" 需要 schematic.graph（电路的有向图）`, `kind: "${kind}" needs schematic.graph (the circuit's directed graph)`);
  if (kind === 'gcount') {
    if (!(COUNTS as readonly unknown[]).includes(find.count)) err(`count: 必须是 ${COUNTS.join(' / ')}`, `count: must be ${COUNTS.join(' / ')}`);
    return ok;
  }
  if (!(MATRICES as readonly unknown[]).includes(find.mat)) err(`mat: 必须是 ${MATRICES.join(' / ')}`, `mat: must be ${MATRICES.join(' / ')}`);
  if (!posInt(find.row)) err('row: 必须是 1、2、…', 'row: must be 1, 2, …');
  if (find.col !== undefined && !posInt(find.col)) err('col: 必须是 1、2、…', 'col: must be 1, 2, …');
  return ok;
}

/** schematic.graph / schematic.state: structure, and (with a netlist) agreement with the circuit */
export function checkMatrixSchematic(s: Schematic, netlist: Netlist | null, analysis: Analysis | null, verify: boolean, errors: string[]): void {
  const g = (s as { graph?: unknown }).graph;
  if (g !== undefined) {
    const e = (zh: string, en: string) => errors.push(tr(`schematic.graph: ${zh}`, `schematic.graph: ${en}`));
    if (!isObj(g)) e('必须是对象 {"nodes", "ref", "branches", "tree"}', 'must be an object {"nodes", "ref", "branches", "tree"}');
    else {
      let shape = true;
      for (const k of Object.keys(g))
        if (!['nodes', 'ref', 'branches', 'tree', 'hideTree', 'cutsets'].includes(k)) {
          e(`不认识的字段 "${k}"`, `unknown field "${k}"`);
          shape = false;
        }
      if (!Array.isArray(g.nodes) || !g.nodes.every((x) => isObj(x) && typeof x.name === 'string' && isPt(x.at))) {
        e('nodes 必须是 [{"name": "1", "at": [x, y]}, …]', 'nodes must be [{"name": "1", "at": [x, y]}, …]');
        shape = false;
      }
      if (typeof g.ref !== 'string') {
        e('ref 必须是参考结点的名字', 'ref must name the reference node');
        shape = false;
      }
      if (
        !Array.isArray(g.branches) ||
        !g.branches.every(
          (b) =>
            isObj(b) &&
            posInt(b.n) &&
            typeof b.from === 'string' &&
            typeof b.to === 'string' &&
            Array.isArray(b.els) &&
            b.els.every((x) => typeof x === 'string') &&
            (b.bend === undefined || typeof b.bend === 'number'),
        )
      ) {
        e('branches 必须是 [{"n": 1, "from": "1", "to": "2", "els": ["R1"]}, …]', 'branches must be [{"n": 1, "from": "1", "to": "2", "els": ["R1"]}, …]');
        shape = false;
      }
      if (g.tree !== undefined && !(Array.isArray(g.tree) && g.tree.every(posInt))) {
        e('tree 必须是树支编号的数组，如 [1, 2, 3]', 'tree must be an array of branch numbers, e.g. [1, 2, 3]');
        shape = false;
      }
      if (g.hideTree !== undefined && typeof g.hideTree !== 'boolean') e('hideTree 必须是 true / false', 'hideTree must be true / false');
      if (
        g.cutsets !== undefined &&
        !(
          Array.isArray(g.cutsets) &&
          g.cutsets.every((c) => isObj(c) && Array.isArray(c.branches) && c.branches.every(posInt) && Array.isArray(c.path) && c.path.length >= 3 && c.path.every(isPt))
        )
      ) {
        e('cutsets 必须是 [{"branches": [1, 4], "path": [[x, y], …（至少 3 个点）]}]', 'cutsets must be [{"branches": [1, 4], "path": [[x, y], … (3 points or more)]}]');
        shape = false;
      }
      if (shape && netlist) for (const m of checkGraphAgainstCircuit(netlist, g as never, analysis, verify)) errors.push(tr(`schematic.graph: ${m}`, `schematic.graph: ${m}`));
    }
  }
  const st = (s as { state?: unknown }).state;
  if (st !== undefined && !(isObj(st) && Array.isArray(st.x) && st.x.every((x) => typeof x === 'string') && Array.isArray(st.u) && st.u.every((x) => typeof x === 'string')))
    errors.push(tr('schematic.state: 必须是 {"x": ["C1", "L1"], "u": ["Us"]}', 'schematic.state: must be {"x": ["C1", "L1"], "u": ["Us"]}'));
}
