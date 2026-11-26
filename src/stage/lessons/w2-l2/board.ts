// The blackboard of layer 03 (超节点 KCL+KVL 方程联动求解台): for each circuit mode the four steps
// A–D of the sheet's stepper, each a few rows of equation terms. A term with ids is a stage link:
// hovering it lights its branch / source on the schematic, a lit branch lights the term.

export type Mode = 'std' | 'ccvs' | 'ref';

export interface Term {
  tex: string;
  ids?: string[];
}
export interface Row {
  note?: string;
  terms: Term[];
}
export interface BoardStep {
  title: string;
  rows: Row[];
}

export const STEP_NAMES = ['Step A: 识别超节点', 'Step B: 外边界 KCL', 'Step C: 内部 KVL 约束', 'Step D: 联立求解与回代验算'];

const t = (tex: string, ...ids: string[]): Term => (ids.length ? { tex, ids } : { tex });

export const BOARD: Record<Mode, BoardStep[]> = {
  std: [
    {
      title: STEP_NAMES[0],
      rows: [
        { note: 'Vₛ₁ 接地（Case 1）：直接锁定', terms: [t(String.raw`v_1 = 10\text{ V}`, 'sn_vs1')] },
        { note: 'Vₛ₂ 悬空（Case 2）：连同 Rₚ 包成', terms: [t(String.raw`\text{超节点 }(2,3)`, 'sn_loop')] },
        { note: '剩下的未知数', terms: [t(String.raw`v_2,\ v_3`, 'sn_node2', 'sn_node3')] },
      ],
    },
    {
      title: STEP_NAMES[1],
      rows: [
        {
          note: '流出为正（Rₚ、Vₛ₂ 在面内，不写）',
          terms: [t(String.raw`\dfrac{v_2 - 10}{2}`, 'sn_r1'), t(String.raw`+\dfrac{v_2}{4}`, 'sn_r2'), t(String.raw`+\dfrac{v_3}{3}`, 'sn_r3'), t('= 2', 'sn_is')],
        },
        { note: '× 12', terms: [t(String.raw`9v_2 + 4v_3 = 84 \quad \text{(①)}`)] },
      ],
    },
    {
      title: STEP_NAMES[2],
      rows: [
        { note: '+ 端减 − 端', terms: [t('v_2 - v_3', 'sn_kvl'), t('= 5', 'sn_vs2'), t(String.raw`\implies v_3 = v_2 - 5 \quad \text{(②)}`)] },
        { note: '② 代入 ①', terms: [t(String.raw`9v_2 + 4(v_2 - 5) = 84 \implies 13v_2 = 104`)] },
      ],
    },
    {
      title: STEP_NAMES[3],
      rows: [
        { terms: [t(String.raw`v_2 = 8\text{ V}`, 'sn_node2'), t(String.raw`,\ v_3 = 3\text{ V}`, 'sn_node3')] },
        {
          note: '外边界验算',
          terms: [t(String.raw`i_1 = -1`, 'sn_r1'), t(String.raw`,\ i_2 = 2`, 'sn_r2'), t(String.raw`,\ i_3 = 1`, 'sn_r3'), t(String.raw`,\ I_s = 2\ (\text{A})`, 'sn_is')],
        },
        { note: '回代（计入 Rₚ）', terms: [t(String.raw`i_{V_{s2}} = i_1 + i_2 + i_{R_p} = -1 + 2 + 1 = 2\text{ A}`, 'sn_ivs')] },
      ],
    },
  ],
  ccvs: [
    {
      title: STEP_NAMES[0],
      rows: [
        { note: '受控源 4iₓ 跨在节点 2、3 之间', terms: [t(String.raw`\text{超节点 }(2,3)`, 'cc_loop')] },
        { note: '节点 1 是普通节点', terms: [t('v_1', 'cc_node1')] },
        { note: '3 个未知数 → 3 条方程', terms: [t(String.raw`v_1,\ v_2,\ v_3`)] },
      ],
    },
    {
      title: STEP_NAMES[1],
      rows: [
        {
          note: '节点 1 KCL',
          terms: [t(String.raw`\dfrac{v_1}{4}`, 'cc_r1'), t(String.raw`+\dfrac{v_1 - v_2}{2}`, 'cc_r2'), t('= 4', 'cc_is1'), t(String.raw`\implies 3v_1 - 2v_2 = 16`)],
        },
        {
          note: '超节点 KCL',
          terms: [t(String.raw`\dfrac{v_2 - v_1}{2}`, 'cc_r2'), t(String.raw`+\dfrac{v_2}{6}`, 'cc_r3'), t(String.raw`+\dfrac{v_3}{3}`, 'cc_r4'), t(String.raw`= 0`)],
        },
      ],
    },
    {
      title: STEP_NAMES[2],
      rows: [
        { note: '内部 KVL', terms: [t('v_2 - v_3', 'cc_loop'), t('= 4i_x', 'cc_dep')] },
        { note: '控制量翻译', terms: [t(String.raw`i_x = \dfrac{v_1}{4}`, 'cc_ix'), t(String.raw`\implies v_3 = v_2 - v_1`)] },
      ],
    },
    {
      title: STEP_NAMES[3],
      rows: [
        { terms: [t(String.raw`v_1 = 12\text{ V}`, 'cc_node1'), t(String.raw`,\ v_2 = 10\text{ V},\ v_3 = -2\text{ V}`, 'cc_loop')] },
        { note: '验算', terms: [t(String.raw`i_x = 3\text{ A}`, 'cc_ix'), t(String.raw`,\ 4i_x = 12\text{ V} = v_2 - v_3`, 'cc_dep')] },
      ],
    },
  ],
  ref: [
    {
      title: STEP_NAMES[0],
      rows: [
        { note: '参考地移到节点 3：Vₛ₂ 一端接地 → Case 1', terms: [t(String.raw`v_2' = 5\text{ V}`, 'sn_vs2', 'rf_gnd')] },
        { note: '但 Vₛ₁ 两端都不再接地 → 新的', terms: [t(String.raw`\text{超节点 }(0,1)`, 'rf_sn01')] },
        { note: '未知数仍是 2 个', terms: [t(String.raw`v_0',\ v_1'`, 'rf_sn01')] },
      ],
    },
    {
      title: STEP_NAMES[1],
      rows: [
        {
          note: '超节点 (0, 1) 流出为正',
          terms: [t(String.raw`\dfrac{v_1' - 5}{2}`, 'sn_r1'), t(String.raw`+\dfrac{v_0' - 5}{4}`, 'sn_r2'), t(String.raw`+\dfrac{v_0'}{3}`, 'sn_r3'), t('+ 2', 'sn_is'), t('= 0')],
        },
      ],
    },
    {
      title: STEP_NAMES[2],
      rows: [{ note: 'Vₛ₁：+ 端减 − 端', terms: [t(String.raw`v_1' - v_0'`, 'rf_sn01'), t('= 10', 'sn_vs1'), t(String.raw`\implies v_1' = v_0' + 10`)] }],
    },
    {
      title: STEP_NAMES[3],
      rows: [
        { note: '代入 × 12', terms: [t(String.raw`13v_0' + 39 = 0 \implies v_0' = -3\text{ V},\ v_1' = 7\text{ V}`, 'rf_sn01')] },
        { note: '与原参考地对比', terms: [t(String.raw`v' = v - v_3 = v - 3\text{ V}`)] },
        { note: '电位整体平移，支路电流一个都不变', terms: [t(String.raw`i_1 = -1,\ i_2 = 2,\ i_3 = 1\ (\text{A})`, 'sn_cross')] },
      ],
    },
  ],
};
