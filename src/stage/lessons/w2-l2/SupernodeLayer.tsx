// W2-L2 layer 02 · 悬空电压源与超节点虚线包围 (Case 2): the floating source and its two nodes
// inside the dashed closed surface. Switches: the surface (dash flow, the four boundary arrows
// pulse), Rp in / out (node potentials stay, only the source current changes), the KVL polarity
// constraint. The circuit switch shows act 2's circuit or act 5's guided example; the guided
// example's numbers stay hidden until the guided steps (or the reveal button) get there.
// Stage params: l2_circuit ('act2' | 'guided'), sn_loop, sn_rp, sn_kvl, gd_reveal (0 | 1 | 2).

import { useState, type ReactNode } from 'react';
import { useLit, useStageParam } from '../../stageStore';
import { act2, fmt, guided } from './model';
import { hov, Seg, Switch, useClearHoverOnUnmount } from './parts';
import { SnSchematic, type SnLabels } from './SnSchematic';

type Circuit = 'act2' | 'guided';

const A = (x: number) => `${fmt(x)} A`;
const V = (x: number) => `${fmt(x)} V`;

export default function SupernodeLayer() {
  useClearHoverOnUnmount();
  const lit = useLit();
  const [circuit, setCircuit] = useStageParam<Circuit>('l2_circuit', 'act2');
  const [loop, setLoop] = useStageParam('sn_loop', true);
  const [rp, setRp] = useStageParam('sn_rp', true);
  const [kvl, setKvl] = useStageParam('sn_kvl', true);
  const [reveal, setReveal] = useStageParam<number>('gd_reveal', 0);
  const [rpToggled, setRpToggled] = useState(false);
  const g = circuit === 'guided';

  let labels: SnLabels;
  let hud: ReactNode;
  if (!g) {
    const s = act2(rp);
    labels = {
      v1: '10 V',
      vA: V(s.v2),
      vB: V(s.v3),
      iL: A(s.i1),
      iA: A(s.i2),
      iB: A(s.i3),
      iRp: A(s.iRp),
      iSrc: A(s.iVs2),
      kvl: kvl ? 'v₂ − v₃ = 5 V' : null,
    };
    hud = (
      <>
        <span className="w22-chip amber" {...hov(['sn_vs1'])}>
          v₁ = 10 V
        </span>
        <span className="w22-chip" {...hov(['sn_node2'])}>
          v₂ = {V(s.v2)}
        </span>
        <span className="w22-chip" {...hov(['sn_node3'])}>
          v₃ = {V(s.v3)}
        </span>
        <span className="w22-chip ok" {...hov(['sn_cross'])}>
          外边界：流入 1 + 2 = 3 A ＝ 流出 2 + 1 = 3 A
        </span>
        <span className="w22-chip violet" {...hov(['sn_ivs'])}>
          内部：i_Rp = {A(s.iRp)} · i_Vs2 = {A(s.iVs2)}
        </span>
      </>
    );
  } else {
    const s = guided(rp);
    const v = reveal >= 1;
    const all = reveal >= 2;
    labels = {
      vA: v ? V(s.v1) : '?',
      vB: v ? V(s.v2) : '?',
      iL: '',
      iA: v ? A(s.iR1) : '',
      iB: v ? A(s.iR2) : '',
      iRp: v ? A(s.iRp) : null,
      iSrc: all ? A(s.is) : '?',
      kvl: kvl ? 'v(+) − v(−) = 3 V' : null,
    };
    hud = (
      <>
        <span className="w22-chip" {...hov(['gd_node1'])}>
          v₁ = {v ? V(s.v1) : '?'}
        </span>
        <span className="w22-chip" {...hov(['gd_node2'])}>
          v₂ = {v ? V(s.v2) : '?'}
        </span>
        <span className="w22-chip violet" {...hov(['gd_is'])}>
          iₛ = {all ? A(s.is) : '?'}
        </span>
        {reveal < 2 ? (
          <button className="w22-btn" onClick={() => setReveal(2)}>
            揭晓数值
          </button>
        ) : (
          <span className="w22-chip ok" {...hov(['gd_cross'])}>
            外边界：流出 3 + 2 + 1 = 6 A ＝ 流入 6 A
          </span>
        )}
      </>
    );
  }

  const notice = !g && rpToggled ? '节点电位 v₂ = 8 V, v₃ = 3 V 保持不变！仅内部电流 i_Vs2 在 1 A 与 2 A 间变化。' : null;

  return (
    <div className="w22-layer">
      <div className="w22-controls">
        <Seg<Circuit>
          label="电路"
          value={circuit}
          onChange={setCircuit}
          options={[
            { v: 'act2', long: '第二幕电路', short: '第二幕' },
            { v: 'guided', long: '第五幕例题电路', short: '例题' },
          ]}
        />
        <Switch on={loop} onChange={setLoop} tone="rose" hoverIds={[g ? 'gd_loop' : 'sn_loop']}>
          <span className="long">显示超节点虚线高斯面</span>
          <span className="short">高斯面</span>
        </Switch>
        <Switch
          on={rp}
          onChange={(x) => {
            setRp(x);
            setRpToggled(true);
          }}
          tone="violet"
          hoverIds={[g ? 'gd_rp' : 'sn_rp']}
        >
          <span className="long">切换超节点内部并联电阻 Rₚ（观察节点电位不变）</span>
          <span className="short">Rₚ</span>
        </Switch>
        <Switch on={kvl} onChange={setKvl} tone="amber" hoverIds={[g ? 'gd_vs' : 'sn_kvl']}>
          <span className="long">高亮内部 KVL 极性约束 ({g ? 'v(+) − v(−) = Vₛ' : 'v₂ − v₃ = 5 V'})</span>
          <span className="short">KVL</span>
        </Switch>
      </div>

      <div className="w22-sch-wrap">
        <SnSchematic kind={circuit} lit={lit} loop={loop} rp={rp} kvlHi={kvl} arrows={loop} inner flow={loop} labels={labels} />
      </div>

      <div className="w22-hud" aria-live="polite">
        {hud}
      </div>
      {notice && (
        <p className="w22-notice" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
