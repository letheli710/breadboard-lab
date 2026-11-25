// W5-L3 layer 02: AC nodal analysis with complex potential bubbles. Two circuits: example 1 of
// act 2 (C to ground at node 1, R1 between the nodes carrying I_x, L and the CCCS 2I_x at node 2)
// and the guided example of act 4 (R1 at node 1, C between the nodes, R2 ∥ L at node 2). Controls:
// the circuit, the node bubbles V1 / V2 (click: light that node's branches and show its KCL), the
// dependent-source tracer (example 1), rectangular a + jb ↔ polar M∠θ, and the view (circuit or
// phasor diagram). The guided example's values stay covered until its steps reach them (stage
// param w53_g = steps solved; the act's done_params uncovers them), or the student asks.

import type { ReactNode } from 'react';
import { abs, argDeg, ex1, guided, num, pol, rect, type Cx } from './model';
import {
  C,
  Dot,
  DepISrc,
  Gnd,
  ISrc,
  Lbl,
  Obj,
  P_COORD,
  P_G,
  P_NC,
  P_NODE,
  P_TRACE,
  P_VIEW2,
  PhArrow,
  Readout,
  Seg,
  Toggle,
  Wire,
  ZBox,
  Bubble,
  Arrow,
  useClearHoverOnUnmount,
  useP,
  type Cell,
  type Coord,
  type NodeCircuit,
} from './parts';
import './w5l3.css';

const E1 = ex1();
const G = guided();

const TOP = 72;
const BOT = 184;
const MID = (TOP + BOT) / 2;
const X = { s: 36, n1: 130, r1a: 170, r1b: 250, n2: 290, b4: 380 };

const fmtZ = (z: Cx, coord: Coord, unit: string) => `${coord === 'rect' ? rect(z) : pol(z)} ${unit}`;
const timeFn = (z: Cx, w: number, unit: string) => {
  const a = argDeg(z);
  return `${num(abs(z))}cos(${w}t ${a < 0 ? '−' : '+'} ${num(Math.abs(a))}°) ${unit}`;
};

export default function Layer02() {
  useClearHoverOnUnmount();
  const [nc, setNc] = useP<NodeCircuit>(P_NC, 'ex1');
  const [node, setNode] = useP<number>(P_NODE, 0);
  const [trace, setTrace] = useP<boolean>(P_TRACE, false);
  const [coord, setCoord] = useP<Coord>(P_COORD, 'rect');
  const [view, setView] = useP<'circuit' | 'phasor'>(P_VIEW2, 'circuit');
  const [g, setG] = useP<number>(P_G, 0);
  const isG = nc === 'guided';
  const seen = (n: number) => !isG || g >= n;
  const pick = (n: number) => setNode(node === n ? 0 : n);

  const cells: Cell[] = isG
    ? [
        { id: 'g_v1', label: 'V_1', text: seen(4) ? fmtZ(G.V1, coord, 'V') : '? V', tone: seen(4) ? undefined : 'mask' },
        { id: 'g_v1', label: 'v_1(t)', text: seen(5) ? timeFn(G.V1, 100, 'V') : '?', tone: seen(5) ? undefined : 'mask' },
        { id: 'g_v2', label: 'V_2', text: seen(4) ? fmtZ(G.V2, coord, 'V') : '? V', tone: seen(4) ? undefined : 'mask' },
        { id: 'g_v2', label: 'v_2(t)', text: seen(5) ? timeFn(G.V2, 100, 'V') : '?', tone: seen(5) ? undefined : 'mask' },
      ]
    : [
        { id: 'e1_v1', label: 'V_1', text: fmtZ(E1.V1, coord, 'V') },
        { id: 'e1_v2', label: 'V_2', text: fmtZ(E1.V2, coord, 'V') },
        { id: 'e1_ix', label: 'I_x = (V_1 − V_2)/4', text: fmtZ(E1.Ix, coord, 'A') },
        { id: 'e1_res', label: '残差 ‖A·x − b‖', text: `${E1.res.toExponential(1).replace('-', '−')} < 10⁻¹²`, tone: 'ok' },
      ];

  return (
    <div className="w53-layer">
      <div className="w53-controls">
        <Seg<NodeCircuit>
          label="电路"
          value={nc}
          set={setNc}
          items={[
            { id: 'ex1', label: '例题 1（第 2 幕）', short: '例题 1' },
            { id: 'guided', label: '引导例题（第 4 幕）', short: '引导' },
          ]}
        />
        <Seg<'circuit' | 'phasor'>
          label="视图"
          value={view}
          set={setView}
          items={[
            { id: 'circuit', label: '电路', short: '电路' },
            { id: 'phasor', label: '相量图', short: '相量' },
          ]}
        />
        <Seg<Coord>
          label="坐标"
          value={coord}
          set={setCoord}
          items={[
            { id: 'rect', label: 'a + jb', short: 'a+jb' },
            { id: 'polar', label: 'M∠θ', short: 'M∠θ' },
          ]}
        />
        {!isG && <Toggle on={trace} set={setTrace} label="追踪受控源 2I_x" short="受控源" id="e1_cccs" />}
      </div>

      <div className="w53-svgwrap">
        <svg viewBox="0 0 440 236" className="w53-svg" role="img" aria-label={isG ? '引导例题：两节点交流 RLC 电路' : '例题 1：两节点交流电路与 CCCS 受控源'}>
          <rect x="1" y="1" width="438" height="234" rx="10" className="w53-bg" />
          {view === 'phasor' ? (
            isG ? (
              seen(4) ? (
                <PhasorPlot
                  items={[
                    { z: G.V1, c: C.n1, l: 'V_1' },
                    { z: G.V2, c: C.n2, l: 'V_2' },
                  ]}
                  note="V_2 = jV_1：同模长，逆时针转 90°"
                />
              ) : (
                <Masked lines={['引导例题的相量图会泄露答案，', '闯完第 4 幕的第 4 步后揭晓']} />
              )
            ) : (
              <PhasorPlot
                items={[
                  { z: E1.V1, c: C.n1, l: 'V_1' },
                  { z: E1.V2, c: C.n2, l: 'V_2' },
                ]}
                diff={{ from: E1.V2, to: E1.V1, l: 'V_1 − V_2 = 4I_x' }}
                note="减法在直角坐标里做：首尾相接的矢量差"
              />
            )
          ) : isG ? (
            <GuidedCircuit node={node} pick={pick} coord={coord} seen={seen} />
          ) : (
            <Ex1Circuit node={node} pick={pick} coord={coord} trace={trace} />
          )}
        </svg>
      </div>

      <div className="w53-readout">
        <div className={`w53-rgrid${isG ? ' two' : ''}`}>
          {cells.map((c, i) => (
            <Readout key={i} {...c} />
          ))}
        </div>
        {isG && g < 5 && (
          <div className="w53-readout-foot">
            <button className="w53-btn" onClick={() => setG(5)}>
              揭晓数值（第 4 幕引导例题，先自己做）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Masked({ lines }: { lines: string[] }) {
  return (
    <g>
      {lines.map((t, i) => (
        <text key={i} x={220} y={110 + i * 20} className="w53-lbl" textAnchor="middle" fill={C.muted}>
          {t}
        </text>
      ))}
    </g>
  );
}

/** node bubble (clickable) */
function NodeBubble({ id, x, n, text, color, node, pick }: { id: string; x: number; n: number; text: string; color: string; node: number; pick: (n: number) => void }) {
  const on = node === n;
  return (
    <Obj id={id} box={[x - 64, TOP - 46, 128, 26]} onClick={() => pick(n)}>
      <Bubble x={x} y={TOP - 33} text={text} color={on ? '#fff' : color} fill={on ? color : '#fff'} />
      <Dot x={x} y={TOP} color={color} r={4.5} />
    </Obj>
  );
}

function EqStrip({ text }: { text: string }) {
  return (
    <g>
      <rect x={8} y={206} width={424} height={22} rx={6} className="w53-eq" />
      <Lbl x={220} y={221} s={text} color={C.ink} cls="w53-val" />
    </g>
  );
}

function Ex1Circuit({ node, pick, coord, trace }: { node: number; pick: (n: number) => void; coord: Coord; trace: boolean }) {
  // which branches touch the selected node
  const at1 = ['s', 'c', 'r1'];
  const at2 = ['r1', 'l', 'dep'];
  const dim = (k: string) => (node === 1 ? !at1.includes(k) : node === 2 ? !at2.includes(k) : trace ? !['r1', 'dep'].includes(k) : false);
  const eq =
    node === 1
      ? '节点 1：V_1/(−j4) + (V_1 − V_2)/4 = 5  →  (1 + j)V_1 − V_2 = 20'
      : node === 2
        ? '节点 2：(V_2 − V_1)/4 + V_2/(j2) = 2I_x  →  −3V_1 + (3 − j2)V_2 = 0'
        : trace
          ? '控制量 I_x = (V_1 − V_2)/4 先用节点电压表示，再代入节点 2 的 KCL'
          : '点击节点气泡 V_1 / V_2：高亮它的支路，写出它的 KCL';
  return (
    <g>
      <Wire d={`M ${X.s} ${TOP} H ${X.r1a} M ${X.r1b} ${TOP} H ${X.b4}`} />
      <Wire d={`M ${X.s} ${BOT} H ${X.b4}`} />
      <Gnd x={210} y={BOT + 12} />
      <Wire d={`M 210 ${BOT} V ${BOT + 4}`} />

      <Obj id="e1_is" box={[X.s - 22, TOP + 12, 44, 88]} dim={dim('s')}>
        <Wire d={`M ${X.s} ${TOP} V ${MID - 16} M ${X.s} ${MID + 16} V ${BOT}`} />
        <ISrc x={X.s} y={MID} />
        <Lbl x={X.s + 7} y={TOP + 16} s="5∠0° A" color={C.src} cls="w53-tag" anchor="start" />
      </Obj>
      <Obj id="e1_c" box={[X.n1 - 26, TOP + 10, 52, 92]} dim={dim('c')}>
        <Wire d={`M ${X.n1} ${TOP} V ${MID - 24} M ${X.n1} ${MID + 24} V ${BOT}`} />
        <ZBox x={X.n1} y={MID} w={46} h={48} fill={C.capFill} stroke={C.cap} text={C.capT} label="−j4 Ω" />
      </Obj>
      <Obj id="e1_r1" box={[X.r1a - 4, TOP - 16, X.r1b - X.r1a + 8, 30]} dim={dim('r1')}>
        <ZBox x={(X.r1a + X.r1b) / 2} y={TOP} w={X.r1b - X.r1a} h={24} fill={C.resFill} stroke={C.res} text={C.resT} label="R_1 = 4 Ω" />
      </Obj>
      <Obj id="e1_ix" box={[X.r1a, TOP + 10, X.r1b - X.r1a, 32]} dim={dim('r1')}>
        <line x1={X.r1a + 10} y1={TOP + 20} x2={X.r1b - 14} y2={TOP + 20} stroke={C.ix} strokeWidth={2.2} />
        <Arrow x={X.r1b - 12} y={TOP + 20} dir="right" color={C.ix} />
        <Lbl x={(X.r1a + X.r1b) / 2} y={TOP + 36} s="I_x" color={C.ix} cls="w53-val" />
      </Obj>
      <Obj id="e1_l" box={[X.n2 - 26, TOP + 10, 52, 92]} dim={dim('l')}>
        <Wire d={`M ${X.n2} ${TOP} V ${MID - 24} M ${X.n2} ${MID + 24} V ${BOT}`} />
        <ZBox x={X.n2} y={MID} w={46} h={48} fill={C.indFill} stroke={C.ind} text={C.indT} label="j2 Ω" />
      </Obj>
      <Obj id="e1_cccs" box={[X.b4 - 24, TOP + 10, 70, 92]} dim={dim('dep')}>
        <Wire d={`M ${X.b4} ${TOP} V ${MID - 18} M ${X.b4} ${MID + 18} V ${BOT}`} />
        <DepISrc x={X.b4} y={MID} />
        <Lbl x={X.b4 + 22} y={MID + 4} s="2I_x" color={C.depT} cls="w53-val" anchor="start" />
      </Obj>
      {trace && (
        <g>
          <path d={`M ${X.r1b - 4} ${TOP + 30} C 330 ${TOP + 34}, 350 ${MID - 34}, ${X.b4 - 16} ${MID - 10}`} className="w53-couple" />
          <Arrow x={X.b4 - 15} y={MID - 10} dir="right" color={C.dep} />
        </g>
      )}

      <NodeBubble id="e1_v1" x={X.n1} n={1} text={`V_1 = ${fmtZ(E1.V1, coord, 'V')}`} color={C.n1} node={node} pick={pick} />
      <NodeBubble id="e1_v2" x={X.n2} n={2} text={`V_2 = ${fmtZ(E1.V2, coord, 'V')}`} color={C.n2} node={node} pick={pick} />
      <EqStrip text={eq} />
    </g>
  );
}

function GuidedCircuit({ node, pick, coord, seen }: { node: number; pick: (n: number) => void; coord: Coord; seen: (n: number) => boolean }) {
  const at1 = ['s', 'r1', 'c'];
  const at2 = ['c', 'r2', 'l'];
  const dim = (k: string) => (node === 1 ? !at1.includes(k) : node === 2 ? !at2.includes(k) : false);
  const z = seen(1);
  const eq =
    node === 1
      ? seen(2)
        ? '节点 1（两边 ×10）：(1 + j)V_1 − jV_2 = −j60'
        : '节点 1：V_1/R_1 + (V_1 − V_2)/Z_C = I_s'
      : node === 2
        ? seen(2)
          ? '节点 2（两边 ×10）：−jV_1 + V_2 = 0'
          : '节点 2：(V_2 − V_1)/Z_C + V_2/R_2 + V_2/Z_L = 0'
        : '点击节点气泡 V_1 / V_2：高亮它的支路，写出它的 KCL';
  const bubble = (v: Cx, n: 1 | 2) => (seen(4) ? `V_${n} = ${fmtZ(v, coord, 'V')}` : `V_${n} = ?`);
  const tag = (s: string, c: string, x: number, y: number): ReactNode => <Lbl x={x} y={y} s={s} color={c} cls="w53-tag" />;
  return (
    <g>
      <Wire d={`M ${X.s} ${TOP} H ${X.r1a} M ${X.r1b} ${TOP} H ${X.b4}`} />
      <Wire d={`M ${X.s} ${BOT} H ${X.b4}`} />
      <Gnd x={210} y={BOT + 12} />
      <Wire d={`M 210 ${BOT} V ${BOT + 4}`} />

      <Obj id="g_is" box={[X.s - 22, TOP + 12, 44, 88]} dim={dim('s')}>
        <Wire d={`M ${X.s} ${TOP} V ${MID - 16} M ${X.s} ${MID + 16} V ${BOT}`} />
        <ISrc x={X.s} y={MID} />
        <Lbl x={X.s + 7} y={TOP + 16} s={z ? '−j6 A' : '6sin(100t) A'} color={C.src} cls="w53-tag" anchor="start" />
      </Obj>
      <Obj id="g_r1" box={[X.n1 - 26, TOP + 10, 52, 92]} dim={dim('r1')}>
        <Wire d={`M ${X.n1} ${TOP} V ${MID - 24} M ${X.n1} ${MID + 24} V ${BOT}`} />
        <ZBox x={X.n1} y={MID} w={46} h={48} fill={C.resFill} stroke={C.res} text={C.resT} label="10 Ω" />
        {tag('R_1', C.resT, X.n1 + 34, MID + 4)}
      </Obj>
      <Obj id="g_c" box={[X.r1a - 4, TOP - 16, X.r1b - X.r1a + 8, 54]} dim={dim('c')}>
        <ZBox x={(X.r1a + X.r1b) / 2} y={TOP} w={X.r1b - X.r1a} h={24} fill={C.capFill} stroke={C.cap} text={C.capT} label={z ? 'Z_C = −j10 Ω' : 'Z_C = ?'} />
        {tag('C = 1 mF', C.capT, (X.r1a + X.r1b) / 2, TOP + 28)}
      </Obj>
      <Obj id="g_r2" box={[X.n2 - 26, TOP + 10, 52, 92]} dim={dim('r2')}>
        <Wire d={`M ${X.n2} ${TOP} V ${MID - 24} M ${X.n2} ${MID + 24} V ${BOT}`} />
        <ZBox x={X.n2} y={MID} w={46} h={48} fill={C.resFill} stroke={C.res} text={C.resT} label="10 Ω" />
        {tag('R_2', C.resT, X.n2 + 34, MID + 4)}
      </Obj>
      <Obj id="g_l" box={[X.b4 - 28, TOP + 10, 56, 92]} dim={dim('l')}>
        <Wire d={`M ${X.b4} ${TOP} V ${MID - 24} M ${X.b4} ${MID + 24} V ${BOT}`} />
        <ZBox x={X.b4} y={MID} w={66} h={48} fill={C.indFill} stroke={C.ind} text={C.indT} label={z ? 'j10 Ω' : 'Z_L = ?'} sub="L = 0.1 H" />
      </Obj>

      <NodeBubble id="g_v1" x={X.n1} n={1} text={bubble(G.V1, 1)} color={C.n1} node={node} pick={pick} />
      <NodeBubble id="g_v2" x={X.n2} n={2} text={bubble(G.V2, 2)} color={C.n2} node={node} pick={pick} />
      <EqStrip text={eq} />
    </g>
  );
}

/** complex plane with a few voltage phasors (one scale) and an optional difference vector */
function PhasorPlot({ items, diff, note }: { items: { z: Cx; c: string; l: string }[]; diff?: { from: Cx; to: Cx; l: string }; note: string }) {
  const ox = 220;
  const oy = 112;
  const max = Math.max(...items.map((i) => abs(i.z)));
  const k = 82 / max;
  const sc = (z: Cx) => ({ re: z.re * k, im: z.im * k });
  return (
    <g>
      <line x1={110} y1={oy} x2={330} y2={oy} className="w53-axis" />
      <line x1={ox} y1={18} x2={ox} y2={204} className="w53-axis" />
      <text x={330} y={oy - 5} className="w53-tick" textAnchor="end" fill={C.muted}>
        Re
      </text>
      <text x={ox + 5} y={26} className="w53-tick" fill={C.muted}>
        Im
      </text>
      {diff && (
        <g>
          <line x1={ox + diff.from.re * k} y1={oy - diff.from.im * k} x2={ox + diff.to.re * k} y2={oy - diff.to.im * k} className="w53-diff" />
          <circle cx={ox + diff.to.re * k} cy={oy - diff.to.im * k} r={3.2} fill={C.ix} />
          <line x1={14} y1={196} x2={34} y2={196} className="w53-diff" />
          <Lbl x={40} y={200} s={`红色虚线：${diff.l}`} color={C.ix} cls="w53-tag" anchor="start" />
        </g>
      )}
      {items.map((i) => (
        <PhArrow key={i.l} cx0={ox} cy0={oy} z={sc(i.z)} color={i.c} label={`${i.l} = ${pol(i.z)}`} />
      ))}
      <Lbl x={220} y={226} s={note} color={C.ink} cls="w53-tag" />
      <circle cx={ox} cy={oy} r={82} className="w53-ring" />
      <text x={ox + 84} y={oy + 14} className="w53-tick" fill={C.muted}>
        {num(max)} V
      </text>
    </g>
  );
}
