// Act 4's circuit (layer 03, mode "受控源超节点"): Is1 = 4 A into node 1, R1 = 4 Ω to ground
// (ix down through it), R2 = 2 Ω from node 1 to node 2, the CCVS 4·ix between nodes 2 (+) and
// 3 (−) with R3 = 6 Ω and R4 = 3 Ω to ground; supernode (2, 3).

import { Arrow, Diamond, Dot, Ground, ISrc, Obj, Txt, Wire, Zig } from './parts';

const YT = 110;
const YB = 250;
const X1 = 150;
const X2 = 310;
const XD = 390;
const X3 = 470;

export interface CcLabels {
  v1: string;
  v2: string;
  v3: string;
  ix: string;
  kvl: string | null;
}

export function CcvsSchematic({ lit, loop, arrows, labels: L }: { lit: string[]; loop: boolean; arrows: boolean; labels: CcLabels }) {
  const lbl = (sym: string, v: string) => (v ? `${sym} = ${v}` : sym);
  return (
    <svg className="w22-sch" viewBox="0 0 560 292" role="img" aria-label="第四幕电路：含流控电压源 4iₓ 的超节点">
      {loop && (
        <Obj id="cc_loop" lit={lit} label="受控源超节点 (2, 3)" className="w22-loop-obj">
          <rect x={286} y={26} width={244} height={148} rx={26} className="w22-loop pink" />
          <g className="w22-badge pink">
            <rect x={331} y={14} width={154} height={22} rx={6} />
            <text x={408} y={29}>
              受控源超节点 (2, 3)
            </text>
          </g>
        </Obj>
      )}

      <Wire
        pts={[
          [60, YT],
          [196, YT],
        ]}
      />
      <Wire
        pts={[
          [256, YT],
          [XD - 26, YT],
        ]}
      />
      <Wire
        pts={[
          [XD + 26, YT],
          [X3, YT],
        ]}
      />
      <Wire
        pts={[
          [60, YB],
          [X3, YB],
        ]}
      />

      <Obj id="gnd" lit={lit} label="参考地 0 V">
        <rect x={208} y={YB} width={44} height={34} className="w22-hitbox" />
        <Ground at={[230, YB]} label="参考地 (0 V)" />
      </Obj>

      <Obj id="cc_is1" lit={lit} label="电流源 Iₛ₁ = 4 A，流入节点 1">
        <Wire
          pts={[
            [60, YT],
            [60, 156],
          ]}
        />
        <Wire
          pts={[
            [60, 204],
            [60, YB],
          ]}
        />
        <ISrc c={[60, 180]} r={24} dir="up" />
        <Txt x={30} y={176} anchor="end" cls="isrc">
          Iₛ₁
        </Txt>
        <Txt x={30} y={193} anchor="end" cls="val">
          4 A
        </Txt>
      </Obj>

      <Obj id="cc_r1" lit={lit} label="R₁ = 4 Ω（节点 1 接地）">
        <Wire
          pts={[
            [X1, YT],
            [X1, 182],
          ]}
        />
        <Zig a={[X1, 182]} b={[X1, 232]} />
        <Wire
          pts={[
            [X1, 232],
            [X1, YB],
          ]}
        />
        <Txt x={X1 - 16} y={212} anchor="end" cls="res">
          R₁ = 4 Ω
        </Txt>
      </Obj>
      <Obj id="cc_ix" lit={lit} label="控制量 iₓ：流经 R₁ 向下">
        <rect x={X1 + 6} y={124} width={50} height={46} className="w22-hitbox" />
        <Arrow from={[X1 + 16, 128]} to={[X1 + 16, 166]} cls="ctrl" />
        <Txt x={X1 + 24} y={154} anchor="start" cls="ctrl">
          {lbl('iₓ', L.ix)}
        </Txt>
      </Obj>

      <Obj id="cc_r2" lit={lit} label="R₂ = 2 Ω（节点 1–2）">
        <Zig a={[196, YT]} b={[256, YT]} />
        <Txt x={226} y={YT - 18} cls="res">
          R₂ = 2 Ω
        </Txt>
        {arrows && <Arrow from={[300, YT + 16]} to={[262, YT + 16]} cls="bound" />}
      </Obj>

      <Obj id="cc_r3" lit={lit} label="R₃ = 6 Ω（节点 2 接地）">
        <Wire
          pts={[
            [X2, YT],
            [X2, 182],
          ]}
        />
        <Zig a={[X2, 182]} b={[X2, 232]} />
        <Wire
          pts={[
            [X2, 232],
            [X2, YB],
          ]}
        />
        <Txt x={X2 - 16} y={212} anchor="end" cls="res">
          R₃ = 6 Ω
        </Txt>
        {arrows && <Arrow from={[X2 + 16, 160]} to={[X2 + 16, 200]} cls="bound" />}
      </Obj>

      <Obj id="cc_r4" lit={lit} label="R₄ = 3 Ω（节点 3 接地）">
        <Wire
          pts={[
            [X3, YT],
            [X3, 182],
          ]}
        />
        <Zig a={[X3, 182]} b={[X3, 232]} />
        <Wire
          pts={[
            [X3, 232],
            [X3, YB],
          ]}
        />
        <Txt x={X3 - 16} y={212} anchor="end" cls="res">
          R₄ = 3 Ω
        </Txt>
        {arrows && <Arrow from={[X3 + 16, 160]} to={[X3 + 16, 200]} cls="bound" />}
      </Obj>

      <Obj id="cc_dep" lit={lit} label="流控电压源 4iₓ（+ 接节点 2，− 接节点 3）" className={L.kvl ? 'w22-kvl' : ''}>
        <Diamond c={[XD, YT]} />
        <Txt x={XD} y={152} cls="src">
          4iₓ
        </Txt>
        {L.kvl && (
          <g className="w22-badge amber hi">
            <rect x={XD - 56} y={158} width={112} height={20} rx={5} />
            <text x={XD} y={172}>
              {L.kvl}
            </text>
          </g>
        )}
      </Obj>

      <Obj id="cc_node1" lit={lit} label="普通节点 1">
        <circle cx={X1} cy={YT} r={13} className="w22-hitdot" />
        <Dot c={[X1, YT]} />
        <Txt x={X1} y={YT - 14} cls="node">
          {lbl('v₁', L.v1)}
        </Txt>
      </Obj>
      <Obj id="cc_loop" lit={lit} label="节点 2">
        <Dot c={[X2, YT]} />
        <Txt x={X2 + 8} y={YT - 10} anchor="start" cls="node">
          {lbl('v₂', L.v2)}
        </Txt>
      </Obj>
      <Obj id="cc_loop" lit={lit} label="节点 3">
        <Dot c={[X3, YT]} />
        <Txt x={X3 + 8} y={YT - 10} anchor="start" cls="node">
          {lbl('v₃', L.v3)}
        </Txt>
      </Obj>
    </svg>
  );
}
