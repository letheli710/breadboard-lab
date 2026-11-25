// W2-L3 stage ids: the hover map (index.ts shows it) and what each id lights in a circuit, plus
// the id an object of the schematic reports when the pointer is on it.

import type { HoverTarget } from '../../types';
import type { Circuit, El } from './circuits';

export const HOVER_MAP: Record<string, HoverTarget> = {
  mesh_window: { label: '网孔（最小窗格）', desc: '内部不再包含任何其他回路的最小闭合回路：田字格窗户的每一块玻璃' },
  outer_loop: { label: '大外环（回路）', desc: '任意闭合路径都是回路；大外环里还套着中间支路，所以它是回路，但不是网孔' },
  nonplanar_k33: { label: '非平面电路 K₃,₃', desc: '怎么重画都有非节点交叉：窗格无法定义，网孔法失效，改用节点电压法' },
  mesh_i1: { label: '网孔电流 i₁（顺时针）', desc: 'Mesh 1 窗格里的循环“气流”；在外围支路上它就是真实支路电流' },
  mesh_i2: { label: '网孔电流 i₂（顺时针）', desc: 'Mesh 2 窗格里的循环“气流”；在共享支路上与 i₁ 方向相反' },
  edge_branch: { label: '外围边缘支路', desc: '只属于一个网孔的边：真实支路电流 = 该网孔电流（注意方向）' },
  shared_r2: { label: '共享支路电阻', desc: '夹在两个网孔之间：向下净电流 = i₁ − i₂，向上 = i₂ − i₁' },
  src_v1: { label: '电压源 V₁', desc: '顺时针向上穿过：先遇 −、从 + 出，电位升高（压降 −V₁）' },
  src_v2: { label: '电压源 V₂', desc: '顺时针向下穿过：先遇 +、从 − 出，电位降低（压降 +V₂）' },
  edge_is: { label: '边缘电流源（Case 1）', desc: '只属于一个网孔：直接锁死该网孔电流，同向 +Is，反向 −Is' },
  series_r: { label: '与电流源串联的电阻', desc: '不进大外环 KVL、不进内部 KCL，对网孔电流零影响；但照样耗电 I²R，并改变电流源端电压' },
  shared_is: { label: '共享电流源（Case 2）', desc: '夹在两网孔的共享墙上：连同串联电阻整条切除，构造超网孔' },
  supermesh: { label: '超网孔大外环', desc: '绕过共享电流源支路的闭合回路：顺时针列 1 个 KVL，左半用 i₁、右半用 i₂' },
  kcl_node_b: { label: '节点 b 的内部 KCL', desc: '把共享支路放回：谁在共享支路上与电流源同向，谁在前面带正号' },
  node_a: { label: '顶部中节点 a', desc: '电位 Vₐ（b 为 0 V 参考）：从左、从右两条路径算出来必须一致' },
  mat_diag: { label: '自电阻 R_kk（主对角线）', desc: '网孔 k 边框上所有电阻之和，恒为正' },
  mat_off: { label: '互电阻 −R_kj（非对角线）', desc: '两网孔共享支路上的电阻之和，取负号；矩阵对称 R_kj = R_jk' },
  mat_rhs: { label: '右端电压源向量 v', desc: '顺时针绕行网孔 k 时电位升高的代数和（从 − 到 + 取正）' },
  solve_board: { label: '消元板书 Step A–D', desc: '代入数值 → 合并约分 → 加减消元 → 还原支路电流并验算' },
  branch_rebuild: { label: '支路电流还原', desc: '外围支路 = 本网孔电流；共享支路 = 两网孔电流之差' },
};

const all = (c: Circuit): { el: El; mid: boolean }[] => [...[...c.left, c.topL, c.topR, ...c.right].map((el) => ({ el, mid: false })), ...c.mid.map((el) => ({ el, mid: true }))];

const midHasSource = (c: Circuit) => c.mid.some((e) => e.kind === 'I');

/** Element ids of the circuit a stage id lights. */
export function litElements(c: Circuit, lit: string[]): Set<string> {
  const out = new Set<string>();
  const add = (pred: (el: El, mid: boolean) => boolean) => all(c).forEach(({ el, mid }) => pred(el, mid) && out.add(el.id));
  for (const id of lit) {
    if (id === 'edge_branch') add((_, mid) => !mid);
    if (id === 'shared_r2') add((el, mid) => mid && el.kind === 'R' && !midHasSource(c));
    if (id === 'shared_is') add((_, mid) => mid && midHasSource(c));
    if (id === 'edge_is') add((el, mid) => !mid && el.kind === 'I');
    if (id === 'series_r') add((el) => !!el.series);
    if (id === 'src_v1') add((el) => el.id === 'v1');
    if (id === 'src_v2') add((el) => el.id === 'v2');
    if (id === 'mat_diag') add((el) => el.kind === 'R' && !el.series);
    if (id === 'mat_off') add((el, mid) => mid && el.kind === 'R' && !el.series);
    if (id === 'mat_rhs') add((el) => el.kind !== 'R');
  }
  return out;
}

/** Which mesh windows a stage id lights. */
export function litMeshes(lit: string[]): [boolean, boolean] {
  const both = lit.includes('mesh_window') || lit.includes('mat_diag');
  return [both || lit.includes('mesh_i1'), both || lit.includes('mesh_i2')];
}

/** The stage id an object of the schematic stands for. */
export function hoverOfFor(c: Circuit): (what: string) => string | undefined {
  return (what) => {
    if (what.startsWith('el:')) {
      const id = what.slice(3);
      const hit = all(c).find(({ el }) => el.id === id);
      if (!hit) return undefined;
      const { el, mid } = hit;
      if (el.series) return 'series_r';
      if (el.kind === 'I') return mid ? 'shared_is' : 'edge_is';
      if (el.id === 'v1') return 'src_v1';
      if (el.id === 'v2') return 'src_v2';
      return mid ? 'shared_r2' : 'edge_branch';
    }
    return (
      {
        pane1: 'mesh_window',
        pane2: 'mesh_window',
        mesh1: 'mesh_i1',
        mesh2: 'mesh_i2',
        outer: 'outer_loop',
        super: 'supermesh',
        'node-a': 'node_a',
        'node-b': 'kcl_node_b',
      } as Record<string, string>
    )[what];
  };
}
