// Layer "01 2D 三要素求解原理图 (0⁻ / 0⁺ / ∞ 三态切换)": three circuits, each in its three
// snapshots — t = 0⁻ (old DC steady state), t = 0⁺ (the instant after switching: C becomes a voltage
// source vC(0⁺), L a current source iL(0⁺)) and t = ∞ (new DC steady state: C open, L short):
//  - 阶跃充电: the act-1 / act-2 kit, 5 V through 10 kΩ into 100 µF, switch closing at t = 0;
//  - Sadiku 7.5: the SPDT RC example (the guided example: its numbers stay hidden until found,
//    stage param `ex75`);
//  - Sadiku 7.6: the RL example with the switch across R_2.
// Highlight chips light the storage element's equivalent, the Thevenin port and the jumping
// non-state variable.

import type { ReactNode } from 'react';
import { useStageParam } from '../../stageStore';
import { ex75, ex76, fmt, KIT, KIT_TAU, rcStep } from './model';
import { Cell, HIDDEN, hoverProps, Seg, useClearHoverOnUnmount, useEx75Reveal, useIsLit } from './state';

export type Sch = 'step' | 'rc75' | 'rl76';
export type St = '0m' | '0p' | 'inf';

/* ------------------------------------------------------------- drawing primitives */

type P = [number, number];

function Wire({ pts, cls = '' }: { pts: P[]; cls?: string }) {
  return <polyline points={pts.map((p) => p.join(',')).join(' ')} className={`w45-wire ${cls}`} />;
}

/** resistor zigzag from a to b (horizontal or vertical) */
function Zig({ a, b, id, label, lx, ly, anchor = 'mid' }: { a: P; b: P; id: string; label: string; lx: number; ly: number; anchor?: string }) {
  const on = useIsLit()(id);
  const n = 6;
  const horiz = a[1] === b[1];
  const len = horiz ? b[0] - a[0] : b[1] - a[1];
  const pts: P[] = [a];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const s = i % 2 ? -7 : 7;
    pts.push(horiz ? [a[0] + len * t, a[1] + s] : [a[0] + s, a[1] + len * t]);
  }
  pts.push(b);
  return (
    <g className={`w45-part ${on}`} {...hoverProps([id])}>
      <polyline points={pts.map((p) => p.join(',')).join(' ')} className="w45-wire res" />
      <rect x={Math.min(a[0], b[0]) - 10} y={Math.min(a[1], b[1]) - 10} width={Math.abs(b[0] - a[0]) + 20} height={Math.abs(b[1] - a[1]) + 20} className="w45-hit" />
      <text x={lx} y={ly} className={`w45-t name ${anchor}`}>
        {label}
      </text>
    </g>
  );
}

function Gnd({ x, y }: { x: number; y: number }) {
  return (
    <g className="w45-gnd">
      <line x1={x} y1={y} x2={x} y2={y + 10} />
      <line x1={x - 11} y1={y + 10} x2={x + 11} y2={y + 10} />
      <line x1={x - 7} y1={y + 15} x2={x + 7} y2={y + 15} />
      <line x1={x - 3} y1={y + 20} x2={x + 3} y2={y + 20} />
    </g>
  );
}

function VSrc({ x, y, id, label, lx, tone = '', anchor = 'end' }: { x: number; y: number; id: string; label: string; lx?: number; tone?: string; anchor?: string }) {
  const on = useIsLit()(id);
  return (
    <g className={`w45-part ${on}`} {...hoverProps([id])}>
      <circle cx={x} cy={y} r={18} className={`w45-src ${tone}`} />
      <text x={x} y={y - 3} className="w45-t sign mid">
        +
      </text>
      <text x={x} y={y + 13} className="w45-t sign mid">
        −
      </text>
      <text x={anchor === 'below' ? x : (lx ?? x - 24)} y={anchor === 'below' ? y + 40 : y + 5} className={`w45-t src ${anchor === 'below' ? 'mid' : anchor}`}>
        {label}
      </text>
    </g>
  );
}

/** the capacitor (or what it is replaced by) standing between y1 and y2 at x; text to its right at lx */
function CapSlot({ x, y1, y2, id, mode, value, label, lx }: { x: number; y1: number; y2: number; id: string; mode: 'open' | 'vsrc'; value: string; label: string; lx: number }) {
  const on = useIsLit()(id, 'equiv');
  const ym = (y1 + y2) / 2;
  const src = mode === 'vsrc';
  return (
    <g className={`w45-part ${on}`} {...hoverProps([id, 'equiv'])}>
      <Wire
        pts={[
          [x, y1],
          [x, src ? ym - 18 : ym - 6],
        ]}
      />
      <Wire
        pts={[
          [x, src ? ym + 18 : ym + 6],
          [x, y2],
        ]}
      />
      {src ? (
        <>
          <circle cx={x} cy={ym} r={18} className="w45-src equiv" />
          <text x={x} y={ym - 3} className="w45-t sign mid">
            +
          </text>
          <text x={x} y={ym + 13} className="w45-t sign mid">
            −
          </text>
        </>
      ) : (
        <>
          <line x1={x - 16} y1={ym - 6} x2={x + 16} y2={ym - 6} className="w45-plate" />
          <line x1={x - 16} y1={ym + 6} x2={x + 16} y2={ym + 6} className="w45-plate" />
        </>
      )}
      <rect x={x - 20} y={y1} width={40} height={y2 - y1} className="w45-hit" />
      <text x={lx} y={ym - 22} className="w45-t name">
        {label}
      </text>
      <text x={lx} y={ym - 3} className={`w45-t eq ${src ? '' : 'open'}`}>
        {src ? '→ 恒压源' : '≡ 开路'}
      </text>
      <text x={lx} y={ym + 16} className="w45-t eqv">
        {value}
      </text>
    </g>
  );
}

/** the inductor (or its replacement) between y1 and y2 at x; text to its right at lx */
function IndSlot({ x, y1, y2, mode, value, lx }: { x: number; y1: number; y2: number; mode: 'short' | 'isrc'; value: string; lx: number }) {
  const on = useIsLit()('l76', 'equiv');
  const ym = (y1 + y2) / 2;
  const src = mode === 'isrc';
  const coils = [0, 1, 2, 3].map((k) => `M ${x} ${ym - 32 + k * 16} a 8 8 0 0 1 0 16`).join(' ');
  return (
    <g className={`w45-part ${on}`} {...hoverProps(['l76', 'equiv'])}>
      <Wire
        pts={[
          [x, y1],
          [x, src ? ym - 18 : ym - 32],
        ]}
      />
      <Wire
        pts={[
          [x, src ? ym + 18 : ym + 32],
          [x, y2],
        ]}
      />
      {src ? (
        <>
          <circle cx={x} cy={ym} r={18} className="w45-src equiv" />
          <line x1={x} y1={ym - 10} x2={x} y2={ym + 6} className="w45-arrow" />
          <polygon points={`${x - 5},${ym + 3} ${x + 5},${ym + 3} ${x},${ym + 12}`} className="w45-arrowhead" />
        </>
      ) : (
        <path d={coils} className="w45-coil" />
      )}
      <rect x={x - 20} y={y1} width={40} height={y2 - y1} className="w45-hit" />
      <text x={x - 14} y={y1 + 14} className="w45-t vl end">
        + vL
      </text>
      <text x={x - 14} y={y2 - 4} className="w45-t vl end">
        −
      </text>
      <text x={lx} y={ym - 22} className="w45-t name">
        L = 2 H
      </text>
      <text x={lx} y={ym - 3} className={`w45-t eq ${src ? '' : 'open'}`}>
        {src ? '→ 恒流源' : '≡ 短路'}
      </text>
      <text x={lx} y={ym + 16} className="w45-t eqv">
        {value}
      </text>
    </g>
  );
}

function Arrow({ from, to, id, label, lx, ly, anchor = 'mid' }: { from: P; to: P; id: string; label: string; lx: number; ly: number; anchor?: string }) {
  const on = useIsLit()(id);
  const [x1, y1] = from;
  const [x2, y2] = to;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = (d: number, s: number): P => [x2 - 9 * Math.cos(a) + s * 5 * Math.sin(a), y2 - 9 * Math.sin(a) - s * 5 * Math.cos(a) + d];
  return (
    <g className={`w45-part cur ${on}`} {...hoverProps([id])}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="w45-arrow" />
      <polygon points={[[x2, y2], h(0, 1), h(0, -1)].map((p) => p.join(',')).join(' ')} className="w45-arrowhead" />
      <text x={lx} y={ly} className={`w45-t cur ${anchor}`}>
        {label}
      </text>
    </g>
  );
}

function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3.5} className="w45-dot" />;
}

/* ------------------------------------------------------------- the three circuits */

const fmtS = (v: number, unit: string, d = 0) => `${fmt(v, d)} ${unit}`;

interface Snap {
  svg: ReactNode;
  cells: { id: string; name: string; value: string; tone?: string; hint?: string }[];
  note: string;
}

type Lit = (...ids: string[]) => string;

function StepCircuit(st: St, lit: Lit): Snap {
  const closed = st !== '0m';
  const i0p = rcStep(KIT.vs, KIT.r, KIT.c, 0, 0).ic;
  const vc = st === 'inf' ? KIT.vs : 0;
  const svg = (
    <>
      <VSrc x={70} y={150} id="vs" label="Vs = 5 V" anchor="below" />
      <Wire
        pts={[
          [70, 132],
          [70, 70],
          [160, 70],
        ]}
      />
      <g className={`w45-part ${lit('sw')}`} {...hoverProps(['sw'])}>
        <circle cx={160} cy={70} r={4} className="w45-contact" />
        <circle cx={206} cy={70} r={4} className="w45-contact" />
        <line x1={160} y1={70} x2={closed ? 206 : 200} y2={closed ? 70 : 44} className="w45-blade" />
        <text x={183} y={30} className="w45-t muted mid">
          S（t = 0 闭合）
        </text>
      </g>
      <Wire
        pts={[
          [206, 70],
          [236, 70],
        ]}
      />
      <Zig a={[236, 70]} b={[322, 70]} id="r" label="R = 10 kΩ" lx={279} ly={50} />
      <Wire
        pts={[
          [322, 70],
          [430, 70],
          [430, 108],
        ]}
      />
      <CapSlot x={430} y1={108} y2={200} id="cap" mode={st === '0p' ? 'vsrc' : 'open'} value={`vC = ${fmtS(vc, 'V')}`} label="C = 100 µF" lx={452} />
      <Wire
        pts={[
          [430, 200],
          [430, 236],
          [70, 236],
          [70, 168],
        ]}
      />
      <Gnd x={250} y={236} />
      {st === '0p' && <Arrow from={[340, 90]} to={[400, 90]} id="ic" label={`i(0⁺) = ${fmt(i0p * 1e3, 1)} mA`} lx={370} ly={112} />}
    </>
  );
  const cells =
    st === '0m'
      ? [
          { id: 'vc', name: 'vC(0⁻)', value: '0 V', tone: 'good' },
          { id: 'ic', name: 'i(0⁻)', value: '0 mA' },
          { id: 'sw', name: '开关 S', value: '断开' },
        ]
      : st === '0p'
        ? [
            { id: 'vc', name: 'vC(0⁺) = vC(0⁻)', value: '0 V', tone: 'good' },
            { id: 'ic', name: 'i(0⁺) = Vs/R', value: `${fmt(i0p * 1e3, 1)} mA`, tone: 'bad' },
            { id: 'r', name: 'vR(0⁺)', value: '5 V', tone: 'bad' },
          ]
        : [
            { id: 'vc', name: 'vC(∞) = Vs', value: '5 V', tone: 'good' },
            { id: 'ic', name: 'i(∞)', value: '0 mA' },
            { id: 'tau', name: 'τ = RC', value: `${fmt(KIT_TAU, 1)} s` },
          ];
  const note =
    st === '0m'
      ? '换路前：开关断开，电容未充电，u(t) = 0'
      : st === '0p'
        ? '换路后瞬间：vC 连续仍为 0，电容等效为 0 V 恒压源（短路），电流跳到峰值'
        : '新稳态：电容开路，vC = Vs，电流衰减为 0';
  return { svg, cells, note };
}

function Rc75Circuit(st: St, reveal: number, lit: Lit): Snap {
  const e = ex75();
  const at = (n: number, s: string) => (reveal >= n ? s : HIDDEN);
  const toB = st !== '0m';
  const svg = (
    <>
      <VSrc x={46} y={160} id="v1" label="18 V" anchor="below" />
      <Wire
        pts={[
          [46, 142],
          [46, 70],
          [66, 70],
        ]}
      />
      <Zig a={[66, 70]} b={[130, 70]} id="r1" label="R₁ = 3 Ω" lx={98} ly={50} />
      <Wire
        pts={[
          [130, 70],
          [176, 70],
        ]}
      />
      <Dot x={150} y={70} />
      <Wire
        pts={[
          [150, 70],
          [150, 108],
        ]}
      />
      <Zig a={[150, 108]} b={[150, 196]} id="r2" label="R₂ = 6 Ω" lx={140} ly={156} anchor="end" />
      <Wire
        pts={[
          [150, 196],
          [150, 236],
        ]}
      />
      <g className={`w45-part ${lit('sw75')}`} {...hoverProps(['sw75'])}>
        <circle cx={180} cy={70} r={4} className="w45-contact" />
        <circle cx={250} cy={70} r={4} className="w45-contact" />
        <circle cx={215} cy={100} r={4} className="w45-contact" />
        <line x1={215} y1={100} x2={toB ? 247 : 183} y2={73} className="w45-blade" />
        <text x={180} y={54} className="w45-t muted mid">
          A
        </text>
        <text x={250} y={54} className="w45-t muted mid">
          B
        </text>
        <text x={215} y={26} className="w45-t muted mid">
          S（t = 0 由 A 切到 B）
        </text>
      </g>
      <Wire
        pts={[
          [215, 104],
          [215, 120],
        ]}
      />
      <CapSlot
        x={215}
        y1={120}
        y2={204}
        id="c75"
        mode={st === '0p' ? 'vsrc' : 'open'}
        value={st === 'inf' ? `vC(∞) = ${at(3, '24 V')}` : `vC(0${st === '0m' ? '⁻' : '⁺'}) = ${at(1, '12 V')}`}
        label="C = 0.25 F"
        lx={232}
      />
      <Wire
        pts={[
          [215, 204],
          [215, 236],
        ]}
      />
      <Wire
        pts={[
          [254, 70],
          [400, 70],
        ]}
      />
      <Dot x={360} y={70} />
      <Wire
        pts={[
          [360, 70],
          [360, 108],
        ]}
      />
      <Zig a={[360, 108]} b={[360, 196]} id="r4" label="R₄ = 12 Ω" lx={372} ly={156} anchor="start" />
      <Wire
        pts={[
          [360, 196],
          [360, 236],
        ]}
      />
      <Zig a={[400, 70]} b={[480, 70]} id="r3" label="R₃ = 6 Ω" lx={440} ly={50} />
      <Wire
        pts={[
          [480, 70],
          [560, 70],
          [560, 142],
        ]}
      />
      <VSrc x={560} y={160} id="v2" label="36 V" tone="v2" anchor="below" />
      <Wire
        pts={[
          [560, 178],
          [560, 236],
          [46, 236],
          [46, 178],
        ]}
      />
      <Gnd x={300} y={236} />
      <Arrow from={[530, 86]} to={[496, 86]} id="i3" label="i₃" lx={514} ly={104} />
      {lit('thev', 'rth') && (
        <g className="w45-thev">
          <rect x={300} y={36} width={300} height={214} rx={10} />
          <text x={450} y={268} className="w45-t thev mid">
            从 C 端口看进去：Rth = R₃ ∥ R₄ = {at(2, '4 Ω')}
          </text>
        </g>
      )}
      {st === '0p' && (
        <g className={`w45-part ${lit('jump', 'i3')}`} {...hoverProps(['jump'])}>
          <rect x={412} y={96} width={140} height={42} rx={7} className="w45-jump" />
          <text x={482} y={113} className="w45-t jump mid">
            i₃(0⁺) = {at(4, '4 A')}
          </text>
          <text x={482} y={131} className="w45-t jumpv mid">
            {reveal >= 4 ? '突变：2 A → 4 A' : '非状态变量：现算！'}
          </text>
        </g>
      )}
    </>
  );
  const cells =
    st === '0m'
      ? [
          { id: 'c75', name: 'vC(0⁻)', value: at(1, '12 V'), tone: 'good' },
          { id: 'i3', name: 'i₃(0⁻)', value: at(3, '2 A') },
          { id: 'ic75', name: 'iC(0⁻)', value: '0 A' },
        ]
      : st === '0p'
        ? [
            { id: 'c75', name: 'vC(0⁺)', value: at(1, '12 V'), tone: 'good' },
            { id: 'jump', name: 'i₃(0⁺)', value: at(4, '4 A'), tone: 'bad' },
            { id: 'ic75', name: 'iC(0⁺)', value: at(9, `${fmt(e.ic0p, 0)} A`), tone: 'bad' },
          ]
        : [
            { id: 'c75', name: 'vC(∞) = Vth', value: at(3, '24 V'), tone: 'good' },
            { id: 'i3', name: 'i₃(∞)', value: at(5, '2 A') },
            { id: 'thev', name: 'Rth · τ', value: reveal >= 2 ? `${fmt(e.rth, 0)} Ω · ${fmt(e.tau, 0)} s` : HIDDEN },
          ];
  const note =
    reveal < 9
      ? '第六幕引导例题完成前，这道题的数值先打问号，随你的作答逐个揭晓'
      : st === '0m'
        ? '开关在 A：C 开路，只看左侧分压器；B 侧独立成回路'
        : st === '0p'
          ? '切到 B 的瞬间：C 钳在 12 V 当恒压源，i₃ 现算得 4 A（≠ 2 A）'
          : '新稳态：C 再次开路，vC = Vth = 24 V，i₃ 回到 2 A';
  return { svg, cells, note };
}

function Rl76Circuit(st: St, lit: Lit): Snap {
  const e = ex76();
  const closed = st === '0m';
  const il = st === 'inf' ? e.ilInf : e.il0;
  const svg = (
    <>
      <VSrc x={46} y={165} id="vs76" label="24 V" anchor="below" />
      <Wire
        pts={[
          [46, 147],
          [46, 90],
          [62, 90],
        ]}
      />
      <Zig a={[62, 90]} b={[126, 90]} id="r1_76" label="R₁ = 4 Ω" lx={94} ly={120} />
      <Wire
        pts={[
          [126, 90],
          [176, 90],
        ]}
      />
      <Zig a={[176, 90]} b={[240, 90]} id="r2_76" label="R₂ = 4 Ω" lx={208} ly={120} />
      <Wire
        pts={[
          [240, 90],
          [480, 90],
          [480, 112],
        ]}
      />
      <g className={`w45-part ${lit('s76')}`} {...hoverProps(['s76'])}>
        <Wire
          pts={[
            [160, 90],
            [160, 52],
            [184, 52],
          ]}
        />
        <Wire
          pts={[
            [232, 52],
            [256, 52],
            [256, 90],
          ]}
        />
        <circle cx={184} cy={52} r={4} className="w45-contact" />
        <circle cx={232} cy={52} r={4} className="w45-contact" />
        <line x1={184} y1={52} x2={closed ? 232 : 226} y2={closed ? 52 : 28} className="w45-blade" />
        <text x={208} y={20} className="w45-t muted mid">
          S（t = 0 断开）
        </text>
      </g>
      <Dot x={160} y={90} />
      <Dot x={256} y={90} />
      <Dot x={360} y={90} />
      <Wire
        pts={[
          [360, 90],
          [360, 118],
        ]}
      />
      <Zig a={[360, 118]} b={[360, 206]} id="r3_76" label="R₃ = 8 Ω" lx={348} ly={166} anchor="end" />
      <Wire
        pts={[
          [360, 206],
          [360, 240],
        ]}
      />
      <IndSlot x={480} y1={112} y2={212} mode={st === '0p' ? 'isrc' : 'short'} value={`iL = ${fmtS(il, 'A')}`} lx={500} />
      <Wire
        pts={[
          [480, 212],
          [480, 240],
          [46, 240],
          [46, 183],
        ]}
      />
      <Gnd x={250} y={240} />
      {st === '0p' && <Arrow from={[384, 196]} to={[384, 134]} id="ir3" label="1.5 A" lx={392} ly={170} anchor="start" />}
      {lit('thev') && (
        <g className="w45-thev">
          <rect x={30} y={8} width={420} height={252} rx={10} />
          <text x={240} y={278} className="w45-t thev mid">
            从 L 端口看进去：Rth = (R₁ + R₂) ∥ R₃ = 4 Ω
          </text>
        </g>
      )}
    </>
  );
  const cells =
    st === '0m'
      ? [
          { id: 'il', name: 'iL(0⁻) = Vs/R₁', value: fmtS(e.il0, 'A'), tone: 'good' },
          { id: 'vl', name: 'vL(0⁻)', value: '0 V' },
          { id: 'ir3', name: 'iR3(0⁻)', value: '0 A' },
        ]
      : st === '0p'
        ? [
            { id: 'il', name: 'iL(0⁺) = iL(0⁻)', value: fmtS(e.il0, 'A'), tone: 'good' },
            { id: 'jump', name: 'vL(0⁺)', value: fmtS(e.vl0p, 'V'), tone: 'bad' },
            { id: 'ir3', name: 'iR3(0⁺)', value: fmtS(e.ir3(0), 'A', 1), tone: 'bad', hint: `电源支路 ${fmt(e.isup(0), 1)} A` },
          ]
        : [
            { id: 'il', name: 'iL(∞)', value: fmtS(e.ilInf, 'A'), tone: 'good' },
            { id: 'vl', name: 'vL(∞)', value: '0 V' },
            { id: 'thev', name: 'Rth · τ = L/Rth', value: `${fmt(e.rth, 0)} Ω · ${fmt(e.tau, 1)} s` },
          ];
  const note =
    st === '0m'
      ? 'S 闭合短接 R₂，L 直流短路并短接 R₃：iL = 24/4 = 6 A'
      : st === '0p'
        ? 'S 断开瞬间：L 拼命维持 6 A，上端被拉到 −12 V，1.5 A 经 R₃ 从地倒灌'
        : '新稳态：L 再次短路，iL = 24/8 = 3 A，vL = 0';
  return { svg, cells, note };
}

/* ------------------------------------------------------------- the layer */

const VIEW: Record<Sch, string> = { step: '0 0 600 270', rc75: '0 0 620 280', rl76: '0 0 620 290' };

export default function Schematic() {
  useClearHoverOnUnmount();
  const [sch, setSch] = useStageParam<Sch>('sch', 'step');
  const [st, setSt] = useStageParam<St>('st', '0m');
  const reveal = useEx75Reveal();
  const lit = useIsLit();
  const snap = sch === 'step' ? StepCircuit(st, lit) : sch === 'rc75' ? Rc75Circuit(st, reveal, lit) : Rl76Circuit(st, lit);
  return (
    <div className="w45-layer">
      <div className="w45-dock">
        <Seg<Sch>
          label="电路"
          small
          value={sch}
          onChange={setSch}
          options={[
            { value: 'step', label: '阶跃充电 5 V', short: '阶跃', hover: ['vs', 'cap'] },
            { value: 'rc75', label: 'Sadiku 7.5 RC', short: '7.5 RC', hover: ['c75'] },
            { value: 'rl76', label: 'Sadiku 7.6 RL', short: '7.6 RL', hover: ['l76'] },
          ]}
        />
        <Seg<St>
          label="时刻"
          value={st}
          onChange={setSt}
          options={[
            { value: '0m', label: 't = 0⁻' },
            { value: '0p', label: 't = 0⁺', tone: 'hot' },
            { value: 'inf', label: 't = ∞' },
          ]}
        />
        <div className="w45-chips" role="group" aria-label="高亮">
          {(
            [
              ['equiv', sch === 'rl76' ? 'L 等效' : 'C 等效'],
              ['thev', '戴维南端口'],
              ['jump', '0⁺ 突变'],
            ] as const
          ).map(([id, t]) => (
            <button key={id} className={`w45-chip ${lit(id)}`} {...hoverProps([id])}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="w45-sch-wrap">
        <svg viewBox={VIEW[sch]} className="w45-sch" role="img" aria-label={`${sch} ${st}`}>
          {snap.svg}
        </svg>
      </div>
      <div className="w45-cells three">
        {snap.cells.map((c) => (
          <Cell key={c.id + c.name} id={c.id} name={c.name} value={c.value} tone={c.tone} hint={c.hint} />
        ))}
      </div>
      <p className="w45-notice">{snap.note}</p>
    </div>
  );
}
