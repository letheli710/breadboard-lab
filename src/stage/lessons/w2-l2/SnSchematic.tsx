// The supernode circuits of W2-L2 as one drawing (layers 02 and 03):
//  - 'act2' (acts 2–3): Vs1 grounded at node 1, R1 to node 2, Vs2 floating between nodes 2 (+) and
//    3 (−) with Rp across it, R2 / R3 to ground, Is up into node 3;
//  - 'guided' (act 5): Is1 into node 1, R1 / R2 to ground, Vs floating between nodes 1 (−) and
//    2 (+) with Rp across it, Is2 down out of node 2.
// `refMode` (act2 only) moves the reference to node 3: Vs2 becomes Case 1, the old ground rail
// becomes node 0 and Vs1 floats, so (0, 1) is the new supernode.

import type { ReactNode } from 'react';
import { Arrow, Dot, Ground, ISrc, Obj, Txt, VSrc, Wire, Zig, type P } from './parts';

const YT = 110;
const YB = 262;
const YRP = 58;
const X0 = 70;
const XA = 200;
const XS = 300;
const XB = 400;
const XR = 516;
/** resistor zig-zags of the two down branches, and the centre of the side sources */
const ZT = 194;
const ZB = 240;
const CY = 190;

export interface SnLabels {
  /** node potentials to print ('' prints the bare symbol) */
  v0?: string;
  v1?: string;
  vA: string;
  vB: string;
  /** branch currents next to their arrows ('' prints the bare symbol) */
  iL: string;
  iA: string;
  iB: string;
  /** inner currents: through Rp (null: no arrow — its direction is still the student's to find), through the floating source */
  iRp: string | null;
  iSrc: string;
  /** the KVL tag (null: hidden) */
  kvl: string | null;
}

export interface SnProps {
  kind: 'act2' | 'guided';
  lit: string[];
  loop: boolean;
  rp: boolean;
  /** polarity marks of the floating source lit as the KVL constraint */
  kvlHi: boolean;
  /** the four boundary-current arrows */
  arrows: boolean;
  /** the two inner-current arrows */
  inner: boolean;
  /** animate the closed surface (dash flow) and pulse the boundary arrows */
  flow?: boolean;
  refMode?: boolean;
  /** the new supernode (0, 1) of refMode */
  sn01?: boolean;
  labels: SnLabels;
}

const lbl = (sym: string, v: string | undefined) => (v ? `${sym} = ${v}` : sym);

export function SnSchematic(p: SnProps) {
  const { kind, lit, labels: L } = p;
  const g = kind === 'guided';
  const ref = !!p.refMode && !g;
  const id = (a: string, b: string) => (g ? b : a);
  const nA = g ? '1' : '2';
  const nB = g ? '2' : '3';
  const prime = ref ? '′' : '';
  const cross = g ? 'gd_cross' : 'sn_cross';

  const branchArrow = (from: P, to: P, label: ReactNode, at: P, anchor: 'start' | 'middle' | 'end' = 'middle') =>
    p.arrows && (
      <g className={`w22-bound ${p.flow ? 'pulse' : ''}`}>
        <Arrow from={from} to={to} cls="bound" />
        <Txt x={at[0]} y={at[1]} anchor={anchor} cls="bound">
          {label}
        </Txt>
      </g>
    );

  return (
    <svg
      className="w22-sch"
      viewBox="0 0 576 304"
      role="img"
      aria-label={g ? '例题电路：悬空电压源（−左 +右）与内部并联电阻 Rp' : '第二幕电路：接地 Vs1、悬空 Vs2 与内部并联电阻 Rp'}
    >
      {/* the supernode (closed surface) behind everything */}
      {p.loop && !ref && (
        <Obj id={id('sn_loop', 'gd_loop')} lit={lit} label={`超节点 (${nA}, ${nB})`} className="w22-loop-obj">
          <rect x={176} y={26} width={248} height={160} rx={26} className={`w22-loop ${p.flow ? 'flow' : ''}`} />
          <g className="w22-badge rose">
            <rect x={240} y={14} width={120} height={22} rx={6} />
            <text x={300} y={29}>
              超节点 ({nA}, {nB})
            </text>
          </g>
        </Obj>
      )}
      {ref && p.sn01 && (
        <Obj id="rf_sn01" lit={lit} label="新超节点 (0, 1)" className="w22-loop-obj">
          <path d="M 14 78 H 98 V 250 H 566 V 298 H 14 Z" className={`w22-loop ${p.flow ? 'flow' : ''}`} />
          <Txt x={340} y={293} cls="loop-label">
            节点 0（原参考地）+ 节点 1 + Vₛ₁ ＝ 超节点 (0, 1)
          </Txt>
        </Obj>
      )}

      {/* rails */}
      <Wire
        pts={[
          [X0, YT],
          [g ? XA : 110, YT],
        ]}
      />
      <Wire
        pts={[
          [g ? XA : 170, YT],
          [XS - 22, YT],
        ]}
      />
      <Wire
        pts={[
          [XS + 22, YT],
          [XR, YT],
        ]}
      />
      <Wire
        pts={[
          [X0, YB],
          [XR, YB],
        ]}
      />

      {/* reference ground: under the bottom rail, or (refMode) on node 3 */}
      <Obj id={ref ? 'rf_gnd' : 'gnd'} lit={lit} label={ref ? '新参考地：节点 3' : '参考地 0 V'}>
        <rect x={ref ? 430 : 280} y={ref ? YT : YB} width={44} height={34} className="w22-hitbox" />
        <Ground at={ref ? [450, YT] : [XS, YB]} label={ref ? '新参考地' : '参考地 (0 V)'} />
      </Obj>

      {/* left column: Vs1 (act2) / Is1 (guided) */}
      <Obj id={id('sn_vs1', 'gd_is1')} also={g ? [cross] : ref ? ['rf_sn01'] : []} lit={lit} label={g ? '电流源 Iₛ₁ = 6 A，流入节点 1' : '接地电压源 Vₛ₁ = 10 V'}>
        <Wire
          pts={[
            [X0, YT],
            [X0, CY - 24],
          ]}
        />
        <Wire
          pts={[
            [X0, CY + 24],
            [X0, YB],
          ]}
        />
        {g ? <ISrc c={[X0, CY]} r={24} dir="up" /> : <VSrc c={[X0, CY]} r={24} plus="up" />}
        <Txt x={40} y={CY - 4} anchor="end" cls={g ? 'isrc' : 'src'}>
          {g ? 'Iₛ₁' : 'Vₛ₁'}
        </Txt>
        <Txt x={40} y={CY + 13} anchor="end" cls="val">
          {g ? '6 A' : '10 V'}
        </Txt>
        {g && branchArrow([150, YT - 14], [192, YT - 14], 'Iₛ₁ 流入', [170, YT - 22])}
        {ref && L.kvl && (
          <g className={`w22-badge amber ${p.kvlHi ? 'hi' : ''}`}>
            <rect x={6} y={222} width={118} height={20} rx={5} />
            <text x={65} y={236}>
              {L.kvl}
            </text>
          </g>
        )}
      </Obj>

      {/* node 1 of act2 (locked by Vs1; in refMode the potential is measured from node 3) */}
      {!g && (
        <Obj id="sn_vs1" lit={lit} label="节点 1">
          <Dot c={[X0, YT]} />
          <Txt x={X0} y={YT - 14} cls="node">
            {lbl(`v₁${prime}`, L.v1)}
          </Txt>
        </Obj>
      )}

      {/* R1 (act2: node 1 – node 2) */}
      {!g && (
        <Obj id="sn_r1" also={[cross]} lit={lit} label="R₁ = 2 Ω 支路">
          <Zig a={[110, YT]} b={[170, YT]} />
          <Txt x={140} y={YT - 18} cls="res">
            R₁ = 2 Ω
          </Txt>
          {branchArrow([194, YT + 16], [148, YT + 16], lbl('i₁', L.iL), [146, YT + 33])}
        </Obj>
      )}

      {/* node A down resistor: R2 (act2) / R1 (guided) */}
      <Obj id={id('sn_r2', 'gd_r1')} also={[cross]} lit={lit} label={g ? 'R₁ = 3 Ω（节点 1 接地）' : 'R₂ = 4 Ω（节点 2 接地）'}>
        <Wire
          pts={[
            [XA, YT],
            [XA, ZT],
          ]}
        />
        <Zig a={[XA, ZT]} b={[XA, ZB]} />
        <Wire
          pts={[
            [XA, ZB],
            [XA, YB],
          ]}
        />
        <Txt x={XA - 16} y={222} anchor="end" cls="res">
          {g ? 'R₁ = 3 Ω' : 'R₂ = 4 Ω'}
        </Txt>
        {branchArrow([XA + 16, 172], [XA + 16, 212], lbl(g ? 'i_R1' : 'i₂', L.iA), [XA + 23, 206], 'start')}
      </Obj>

      {/* node B down resistor: R3 (act2) / R2 (guided) */}
      <Obj id={id('sn_r3', 'gd_r2')} also={[cross]} lit={lit} label={g ? 'R₂ = 6 Ω（节点 2 接地）' : 'R₃ = 3 Ω（节点 3 接地）'}>
        <Wire
          pts={[
            [XB, YT],
            [XB, ZT],
          ]}
        />
        <Zig a={[XB, ZT]} b={[XB, ZB]} />
        <Wire
          pts={[
            [XB, ZB],
            [XB, YB],
          ]}
        />
        <Txt x={XB - 16} y={222} anchor="end" cls="res">
          {g ? 'R₂ = 6 Ω' : 'R₃ = 3 Ω'}
        </Txt>
        {branchArrow([XB + 16, 172], [XB + 16, 212], lbl(g ? 'i_R2' : 'i₃', L.iB), [XB + 23, 206], 'start')}
      </Obj>

      {/* right column: Is up (act2) / Is2 down (guided) */}
      <Obj id={id('sn_is', 'gd_is2')} also={[cross]} lit={lit} label={g ? '电流源 Iₛ₂ = 1 A，流出节点 2' : '电流源 Iₛ = 2 A，流入节点 3'}>
        <Wire
          pts={[
            [XR, YT],
            [XR, CY - 24],
          ]}
        />
        <Wire
          pts={[
            [XR, CY + 24],
            [XR, YB],
          ]}
        />
        <ISrc c={[XR, CY]} r={24} dir={g ? 'down' : 'up'} />
        <Txt x={XR + 30} y={CY - 4} anchor="start" cls="isrc">
          {g ? 'Iₛ₂' : 'Iₛ'}
        </Txt>
        <Txt x={XR + 30} y={CY + 13} anchor="start" cls="val">
          {g ? '1 A' : '2 A'}
        </Txt>
        {g ? branchArrow([410, YT - 14], [468, YT - 14], 'Iₛ₂ 流出', [440, YT - 22]) : branchArrow([470, YT - 14], [412, YT - 14], 'Iₛ 流入', [454, YT - 22])}
      </Obj>

      {/* Rp across the floating source */}
      <Obj id={id('sn_rp', 'gd_rp')} lit={lit} label={g ? '内部并联电阻 Rₚ = 3 Ω' : '内部并联电阻 Rₚ = 5 Ω'} className={p.rp ? '' : 'w22-out'}>
        <Wire
          pts={[
            [XA, YT],
            [XA, YRP],
            [265, YRP],
          ]}
          dashed
        />
        <Wire
          pts={[
            [335, YRP],
            [XB, YRP],
            [XB, YT],
          ]}
          dashed
        />
        <Zig a={[265, YRP]} b={[335, YRP]} cls="w22-rp" />
        <Txt x={XS} y={84} cls="rp">
          {p.rp ? (g ? 'Rₚ = 3 Ω' : 'Rₚ = 5 Ω') : 'Rₚ 已拔出'}
        </Txt>
        {p.inner && p.rp && L.iRp !== null && (
          <g className="w22-inner rp">
            {g ? <Arrow from={[322, 42]} to={[280, 42]} cls="inner" /> : <Arrow from={[280, 42]} to={[322, 42]} cls="inner" />}
            <Txt x={g ? 274 : 328} y={46} anchor={g ? 'end' : 'start'} cls="inner">
              {lbl('i_Rp', L.iRp ?? '')}
            </Txt>
          </g>
        )}
      </Obj>

      {/* the floating source */}
      <Obj
        id={id('sn_vs2', 'gd_vs')}
        also={[id('sn_kvl', 'gd_vs')]}
        lit={lit}
        label={g ? '悬空电压源 Vₛ = 3 V（− 接节点 1，+ 接节点 2）' : '悬空电压源 Vₛ₂ = 5 V（+ 接节点 2，− 接节点 3）'}
        className={p.kvlHi ? 'w22-kvl' : ''}
      >
        <VSrc c={[XS, YT]} r={22} plus={g ? 'right' : 'left'} />
        <Txt x={XS} y={150} cls="src">
          {g ? 'Vₛ = 3 V' : 'Vₛ₂ = 5 V'}
        </Txt>
        {p.inner && (
          <g className="w22-inner src">
            {g ? <Arrow from={[268, 162]} to={[332, 162]} cls="inner" /> : <Arrow from={[332, 162]} to={[268, 162]} cls="inner" />}
            <Txt x={XS} y={178} cls="inner">
              {lbl(g ? 'iₛ' : 'i_Vs2', L.iSrc)}
            </Txt>
          </g>
        )}
      </Obj>
      {!ref && L.kvl && (
        <Obj id={id('sn_kvl', 'gd_vs')} lit={lit} label="内部 KVL 约束">
          <g className={`w22-badge amber ${p.kvlHi ? 'hi' : ''}`}>
            <rect x={426} y={20} width={128} height={22} rx={6} />
            <text x={490} y={35}>
              {L.kvl}
            </text>
          </g>
        </Obj>
      )}

      {/* nodes A, B (and node 0 in refMode) */}
      <Obj id={id('sn_node2', 'gd_node1')} lit={lit} label={`节点 ${nA}`}>
        <circle cx={XA} cy={YT} r={13} className="w22-hitdot" />
        <Dot c={[XA, YT]} />
        <Txt x={XA + 8} y={YT - 10} anchor="start" cls="node">
          {lbl(`v${g ? '₁' : '₂'}${prime}`, L.vA)}
        </Txt>
      </Obj>
      <Obj id={id('sn_node3', 'gd_node2')} lit={lit} label={`节点 ${nB}`}>
        <circle cx={XB} cy={YT} r={13} className="w22-hitdot" />
        <Dot c={[XB, YT]} />
        <Txt x={XB - 8} y={YT - 10} anchor="end" cls="node">
          {lbl(`v${g ? '₂' : '₃'}${prime}`, L.vB)}
        </Txt>
      </Obj>
      {ref && (
        <Txt x={104} y={YB + 20} anchor="start" cls="node">
          {lbl('v₀′', L.v0)}
        </Txt>
      )}
    </svg>
  );
}
