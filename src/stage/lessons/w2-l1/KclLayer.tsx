// W2-L1 layer 02 · 支路电流翻译为电位差: stand on one node; every resistor branch on it gets an
// arrow pointing *out of* the node with its Ohm's-law bubble (v_k − v_j)/R, the current sources
// keep their own arrows and get a sign tag (+ entering, − leaving), and the bubbles assemble into
// the node's KCL equation (numbers or letters). "双向视角" shows a shared resistor from both ends.

import { Tex } from '../../StageText';
import { ctrlTex, incident, kclTex, NODE_ID, NODE_UNI, other, type Elem, type NodeId } from './model';
import { Arrow, Bubble, CircuitPicker, GREY, HiddenInfo, Schematic, Seg, Toggle, arrowBeside, badgeOf, deep, hoverProps, nodeColor, soft, useLayerFollow, useW21 } from './parts';

const symUni = (e: Elem) => e.uni.split(' = ')[0];

/** the bubble text of a branch seen from node k */
function bubble(e: Elem, k: NodeId, ref: NodeId, sym: boolean): string {
  const j = other(e, k);
  const vk = NODE_UNI[k];
  if (e.kind === 'R') {
    const vj = j === ref ? '0' : NODE_UNI[j];
    const R = sym || e.value === undefined ? symUni(e) : String(e.value);
    return `(${vk} − ${vj})/${R}`;
  }
  const name = e.kind === 'CCCS' ? '2iₓ' : sym || e.value === undefined ? symUni(e) : `${e.value} A`;
  const entering = e.b === k;
  if (e.kind === 'CCCS') return entering ? `${name} 流入（左边 −）` : `${name} 流出（左边 +）`;
  return entering ? `${name} 流入 → 右边 +` : `${name} 流出 → 右边 −`;
}

export default function KclLayer() {
  useLayerFollow();
  const { c, ref, free, stand, setStand, sym, setSym, dual, setDual, eq, setEq } = useW21();
  const col = nodeColor(stand, ref);
  const mine = new Set(incident(c, stand).map((e) => e.id));
  // a resistor between two non-reference nodes: the one both views are about
  const shared = c.elems.filter((e) => e.kind === 'R' && e.a !== ref && e.b !== ref && mine.has(e.id));
  const dualOn = dual && shared.length > 0;
  const partner = (e: Elem) => other(e, stand);

  const wire = (n: NodeId) => (n === stand ? col : dualOn && shared.some((e) => partner(e) === n) ? nodeColor(n, ref) : n === ref ? '#86efac' : GREY);
  const badge = (n: NodeId) => {
    if (n === stand) return badgeOf(`站在 ${NODE_UNI[n]}`, col);
    if (n === ref) return badgeOf(n === 'v0' ? '参考地 0 V' : `${NODE_UNI[n]} = 0（参考）`, nodeColor(n, ref));
    return badgeOf(NODE_UNI[n], dualOn && shared.some((e) => partner(e) === n) ? nodeColor(n, ref) : GREY);
  };

  const overlays = incident(c, stand).map((e) => {
    const at = e.a === stand ? e.bubA : e.bubB;
    if (e.kind === 'R') {
      const [p, q] = arrowBeside(e, stand);
      const isShared = dualOn && shared.includes(e);
      const k2 = partner(e);
      const col2 = nodeColor(k2, ref);
      const [p2, q2] = arrowBeside(e, k2, true);
      const flipAt: [number, number, 'middle'] = Math.abs(e.pa[1] - e.pb[1]) < 1 ? [at[0], 2 * e.pa[1] - at[1] + 6, 'middle'] : [at[0], at[1], 'middle'];
      return (
        <g key={e.id} {...hoverProps([e.id])}>
          <Arrow from={p} to={q} color={col} className="w21-out" />
          <Bubble at={at} text={isShared ? `站 ${NODE_UNI[stand]} 看：${bubble(e, stand, ref, sym)}` : bubble(e, stand, ref, sym)} color={deep(col)} bg={soft(col)} />
          {isShared && (
            <>
              <Arrow from={p2} to={q2} color={col2} className="w21-out dashed" />
              <Bubble at={flipAt} text={`站 ${NODE_UNI[k2]} 看：${bubble(e, k2, ref, sym)}`} color={deep(col2)} bg={soft(col2)} />
            </>
          )}
        </g>
      );
    }
    const entering = e.b === stand;
    const tone = e.kind === 'CCCS' ? '#6d28d9' : entering ? '#15803d' : '#b45309';
    return (
      <g key={e.id} {...hoverProps([e.id])}>
        <Bubble at={at} text={bubble(e, stand, ref, sym)} color={tone} bg={entering ? '#dcfce7' : e.kind === 'CCCS' ? '#f3e8ff' : '#fef3c7'} />
      </g>
    );
  });

  const lines = [kclTex(c, stand, ref, sym)];
  const ctrl = ctrlTex(c, ref, sym);
  const usesCtrl = incident(c, stand).some((e) => e.kind === 'CCCS');

  return (
    <div className="w21-layer">
      <div className="w21-dock">
        <CircuitPicker />
        <Seg label="站在" value={stand} options={free.map((k) => ({ v: k, t: NODE_UNI[k] }))} onChange={setStand} />
        <Seg
          label="写法"
          value={sym ? 'sym' : 'num'}
          options={[
            { v: 'num', t: '数值' },
            { v: 'sym', t: '字母' },
          ]}
          onChange={(v) => setSym(v === 'sym')}
          disabled={!c.numeric}
        />
        <Toggle on={dual} onChange={setDual} disabled={shared.length === 0}>
          双向视角
        </Toggle>
        <Toggle on={eq} onChange={setEq}>
          组装 KCL
        </Toggle>
      </div>

      <Schematic
        c={c}
        refNode={ref}
        wire={wire}
        badge={badge}
        dim={(e) => !mine.has(e.id)}
        label={(e) => (dualOn && shared.includes(e) ? '' : sym ? symUni(e) : e.uni)}
        onNode={(n) => n !== ref && setStand(n)}
        showIx={c.elems.some((e) => e.kind === 'CCCS')}
        ariaLabel={`站在节点 ${NODE_UNI[stand]}：所有电阻支路电流按流出写`}
      >
        {overlays}
      </Schematic>

      <div className={`w21-eq ${eq ? '' : 'off'}`} aria-live="polite" {...hoverProps([NODE_ID[stand]])}>
        {eq ? (
          <>
            <span className="w21-eq-head" style={{ color: deep(col) }}>
              节点 {NODE_UNI[stand]} 的 KCL（流出电阻电流之和 = 流入独立电流源之和）
            </span>
            {lines.map((t) => (
              <Tex key={t} tex={t} display />
            ))}
            {usesCtrl && ctrl && (
              <span className="w21-eq-ctrl">
                控制变量约束：
                <Tex tex={ctrl} />
              </span>
            )}
          </>
        ) : (
          <span className="w21-eq-head muted">气泡已经摆好：先自己把节点 {NODE_UNI[stand]} 的方程拼出来，再打开“组装 KCL”对答案。</span>
        )}
      </div>

      <HiddenInfo
        items={[
          '电阻支路一律按流出当前节点写为 (v_curr − v_neighbor) / R',
          '跨接电流源 Iₛ₂ = 10 A 对 v₁ 是流入（+10），对 v₂ 是流出（−10 或左侧 +10）',
          '双向视角下 i₁→₂ = −i₂→₁ 自动保证 KCL 自洽',
        ]}
      />
    </div>
  );
}
