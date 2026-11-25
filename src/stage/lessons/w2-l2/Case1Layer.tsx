// W2-L2 layer 01 · 接地电压源直锁电位 (Case 1): Vs between node 1 and ground fixes v1 = Vs, so
// only node 2 is unknown and one KCL solves it. The slider moves Vs (4…16 V); v2, the branch
// currents and the KCL check follow live (v2 = (4/3)(4 + Vs/2)). Stage params: c1_vs, c1_lock.

import { useLit, useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { case1, C1, fmt } from './model';
import { Arrow, Dot, Ground, ISrc, Obj, Switch, Txt, useClearHoverOnUnmount, VSrc, Wire, Zig, hov } from './parts';

const YT = 100;
const YB = 236;

export default function Case1Layer() {
  useClearHoverOnUnmount();
  const lit = useLit();
  const [vs, setVs] = useStageParam('c1_vs', 10);
  const [lock, setLock] = useStageParam('c1_lock', true);
  const s = case1(vs);

  return (
    <div className="w22-layer">
      <div className="w22-controls">
        <Switch on={lock} onChange={setLock} hoverIds={['c1_node1']}>
          <span className="long">高亮电位锁定节点 (v₁ = {vs} V)</span>
          <span className="short">锁定节点 1 (v₁ = {vs} V)</span>
        </Switch>
        <label className="w22-slider" {...hov(['c1_vs'])}>
          <span className="w22-slider-label">
            <span className="long">调节接地电压源 Vₛ</span>
            <span className="short">Vₛ</span>
          </span>
          <input type="range" min={4} max={16} step={2} value={vs} onChange={(e) => setVs(Number(e.target.value))} aria-valuetext={`${vs} V`} />
          <b>{vs} V</b>
        </label>
      </div>

      <div className="w22-sch-wrap">
        <svg className="w22-sch" viewBox="0 0 540 282" role="img" aria-label={`Case 1 电路：Vₛ = ${vs} V，v₂ = ${fmt(s.v2)} V`}>
          {/* wires */}
          <Wire
            pts={[
              [70, YT],
              [150, YT],
            ]}
          />
          <Wire
            pts={[
              [250, YT],
              [460, YT],
            ]}
          />
          <Wire
            pts={[
              [70, YB],
              [460, YB],
            ]}
          />

          <Obj id="c1_gnd" lit={lit} label="参考地 0 V">
            <rect x={180} y={YB - 4} width={110} height={44} className="w22-hitbox" />
            <Ground at={[220, YB]} label="参考地 (0 V)" />
          </Obj>

          {/* Vs: node 1 – ground */}
          <Obj id="c1_vs" lit={lit} label={`接地电压源 Vₛ = ${vs} V`}>
            <Wire
              pts={[
                [70, YT],
                [70, 140],
              ]}
            />
            <Wire
              pts={[
                [70, 196],
                [70, YB],
              ]}
            />
            <VSrc c={[70, 168]} r={28} plus="up" />
            <Txt x={34} y={164} anchor="end" cls="src">
              Vₛ
            </Txt>
            <Txt x={34} y={182} anchor="end" cls="val">
              {vs} V
            </Txt>
          </Obj>

          {/* R1: node 1 – node 2 */}
          <Obj id="c1_r1" lit={lit} label={`R₁ = ${C1.r1} Ω，i₁ = ${fmt(s.i1)} A`}>
            <Zig a={[150, YT]} b={[250, YT]} />
            <Txt x={200} y={YT - 18} cls="res">
              R₁ = 2 Ω
            </Txt>
            <g className={Math.abs(s.i1) < 1e-9 ? 'w22-faint' : ''}>
              <Arrow from={[312, YT + 16]} to={[266, YT + 16]} cls="cur" />
              <Txt x={289} y={YT + 34} cls="cur">
                i₁ = {fmt(s.i1)} A
              </Txt>
            </g>
          </Obj>

          {/* R2: node 2 – ground */}
          <Obj id="c1_r2" lit={lit} label={`R₂ = ${C1.r2} Ω，i₂ = ${fmt(s.i2)} A`}>
            <Wire
              pts={[
                [330, YT],
                [330, 130],
              ]}
            />
            <Zig a={[330, 130]} b={[330, 206]} />
            <Wire
              pts={[
                [330, 206],
                [330, YB],
              ]}
            />
            <Txt x={312} y={172} anchor="end" cls="res">
              R₂ = 4 Ω
            </Txt>
            <Arrow from={[352, 138]} to={[352, 178]} cls="cur" />
            <Txt x={360} y={166} anchor="start" cls="cur">
              i₂ = {fmt(s.i2)} A
            </Txt>
          </Obj>

          {/* Is up into node 2 */}
          <Obj id="c1_is" lit={lit} label="电流源 Iₛ = 4 A，向上流入节点 2">
            <Wire
              pts={[
                [460, YT],
                [460, 140],
              ]}
            />
            <Wire
              pts={[
                [460, 196],
                [460, YB],
              ]}
            />
            <ISrc c={[460, 168]} r={28} dir="up" />
            <Txt x={496} y={164} anchor="start" cls="isrc">
              Iₛ
            </Txt>
            <Txt x={496} y={182} anchor="start" cls="val">
              4 A
            </Txt>
          </Obj>

          {/* node 1 (locked) */}
          <Obj id="c1_node1" lit={lit} label={`节点 1：v₁ = Vₛ = ${vs} V（锁定）`} className={lock ? 'w22-locked' : ''}>
            <circle cx={70} cy={YT} r={14} className="w22-hitdot" />
            {lock && <circle cx={70} cy={YT} r={11} className="w22-lock-ring" />}
            <Dot c={[70, YT]} />
            {lock ? (
              <g className="w22-badge amber">
                <rect x={8} y={44} width={150} height={26} rx={6} />
                <text x={83} y={61}>
                  节点 1 锁定: v₁ = {vs} V
                </text>
              </g>
            ) : (
              <Txt x={70} y={YT - 14} cls="node">
                v₁ = {vs} V
              </Txt>
            )}
          </Obj>

          {/* node 2 */}
          <Obj id="c1_node2" lit={lit} label={`节点 2：v₂ = ${fmt(s.v2)} V`}>
            <circle cx={330} cy={YT} r={14} className="w22-hitdot" />
            <Dot c={[330, YT]} />
            <Txt x={330} y={YT - 16} cls="node">
              节点 2：v₂ = {fmt(s.v2)} V
            </Txt>
          </Obj>
        </svg>
      </div>

      <div className="w22-hud" aria-live="polite">
        <span className="w22-chip amber" {...hov(['c1_node1'])}>
          v₁ = Vₛ = {vs} V <small>已知</small>
        </span>
        <span className="w22-chip" {...hov(['c1_node2'])}>
          <Tex tex={String.raw`v_2 = \tfrac{4}{3}\left(4 + \tfrac{V_s}{2}\right) = ${fmt(s.v2).replace('−', '-')}\text{ V}`} />
        </span>
        <span className="w22-chip ok">
          i₁ + i₂ = {fmt(s.i1)} + {fmt(s.i2)} = {fmt(s.i1 + s.i2)} A = Iₛ
        </span>
        <span className="w22-chip muted">未知数 1 个 · KCL 只列节点 2</span>
      </div>
    </div>
  );
}
