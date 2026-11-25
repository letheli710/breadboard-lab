// Layer "04 串并联等效与直流稳态开路分析台", three set-ups:
// - 例题 4: V_s = 12 V – R_1 3 kΩ – node A (R_2 6 kΩ ∥ C_1 10 μF) – R_3 2 kΩ – node B (R_4 4 kΩ ∥
//   C_2 20 μF). 「开路替换」 turns the capacitors into dashed open terminals (i_C = 0) and shows the
//   branch currents, node voltages and energies.
// - 实战题 (the guided example): the same ladder on 9 V with 1 / 3 / 3 / 3 kΩ, C_1 100 μF and C_2
//   200 μF reached through the dead-end R_5 = 2 kΩ. Its numbers stay hidden while the guided
//   example runs (stage param `gd` = how many steps are answered; 9 = finished): the open-circuit
//   view unlocks after step 1, R_eq / I_s after step 2, V_C1 after 3, V_C2 after 4, energies at the end.
// - 例题 5: C_1 in series with [C_2 ∥ (C_3 – C_4)] on 9 V; tap a capacitor to change its value,
//   step through the reduction C_34 → C_234 → C_eq, and read the same numbers as resistors (the
//   mirror: series ↔ parallel swap).

import type { ReactNode } from 'react';
import { useStage, useStageParam } from '../../stageStore';
import { C_STEPS, EX4, EX5, fmtC, fmtI, fmtQ, fmtR, fmtV, fmtW, GUIDED, ladder, mirrorR, net5, type Ladder, type Net5 } from './model';
import { Cell, hoverProps, Seg, useClearHoverOnUnmount, useIsLit } from './state';

export type DcMode = 'ex4' | 'gd' | 'ex5';

/* ------------------------------------------------------------- drawing helpers */

const TOP = 64;
const BOT = 250;

function Res({
  x,
  y,
  vertical,
  id,
  label,
  dim,
  lbl,
}: {
  x: number;
  y: number;
  vertical?: boolean;
  id: string;
  label: string;
  dim?: boolean;
  lbl: [number, number, 'start' | 'middle' | 'end'];
}) {
  const on = useIsLit()(id);
  return (
    <g className={`w41-part ${on} ${dim ? 'dim' : ''}`} {...hoverProps([id])}>
      {vertical ? <rect x={x - 8} y={y} width={16} height={52} rx={2} /> : <rect x={x} y={y - 8} width={52} height={16} rx={2} />}
      <text x={lbl[0]} y={lbl[1]} textAnchor={lbl[2]} className="w41-lbl">
        {label}
      </text>
    </g>
  );
}

/** a capacitor branch from (x, y1) down to (x, y2), plates around `py`; open = dashed terminals */
function CapV({
  x,
  y1,
  y2,
  py,
  id,
  label,
  open,
  lbl,
  cls = '',
}: {
  x: number;
  y1: number;
  y2: number;
  py: number;
  id: string;
  label: string;
  open?: boolean;
  lbl: [number, number, 'start' | 'middle' | 'end'];
  cls?: string;
}) {
  const on = useIsLit()(id, 'dc_open');
  return (
    <g className={`w41-cap ${cls} ${on} ${open ? 'open' : ''}`} {...hoverProps([id])}>
      {open ? (
        <>
          <line x1={x} x2={x} y1={y1} y2={py - 10} className="w41-dash" />
          <circle cx={x} cy={py - 8} r={4} className="w41-term" />
          <circle cx={x} cy={py + 20} r={4} className="w41-term" />
          <line x1={x} x2={x} y1={py + 22} y2={y2} className="w41-dash" />
        </>
      ) : (
        <>
          <line x1={x} x2={x} y1={y1} y2={py} className="w41-wire c" />
          <line x1={x - 15} x2={x + 15} y1={py} y2={py} className="w41-plate" />
          <line x1={x - 15} x2={x + 15} y1={py + 12} y2={py + 12} className="w41-plate" />
          <line x1={x} x2={x} y1={py + 12} y2={y2} className="w41-wire c" />
          <text x={x - 21} y={py + 4} className="w41-pol">
            +
          </text>
        </>
      )}
      <text x={lbl[0]} y={lbl[1]} textAnchor={lbl[2]} className="w41-lbl c">
        {label}
      </text>
      {/* a wider invisible grip */}
      <rect x={x - 18} y={py - 14} width={36} height={40} fill="transparent" />
    </g>
  );
}

function Source({ x, id, label }: { x: number; id: string; label: string }) {
  const on = useIsLit()(id);
  return (
    <g className={`w41-part src ${on}`} {...hoverProps([id])}>
      <line x1={x} x2={x} y1={TOP} y2={140} className="w41-wire" />
      <line x1={x} x2={x} y1={176} y2={BOT} className="w41-wire" />
      <circle cx={x} cy={158} r={18} />
      <text x={x} y={154} textAnchor="middle" className="w41-sign">
        +
      </text>
      <text x={x} y={170} textAnchor="middle" className="w41-sign">
        −
      </text>
      <text x={x + 24} y={162} className="w41-lbl src">
        {label}
      </text>
    </g>
  );
}

function Node({ x, id, name, value }: { x: number; id: string; name: string; value: string }) {
  const on = useIsLit()(id);
  return (
    <g className={`w41-node ${on}`} {...hoverProps([id])}>
      <circle cx={x} cy={TOP} r={4.5} />
      <text x={x} y={TOP - 12} textAnchor="middle" className="w41-nodev">
        {name} {value}
      </text>
    </g>
  );
}

function Flow({
  x,
  y,
  text,
  dim,
  dir = 'right',
  anchor = 'middle',
}: {
  x: number;
  y: number;
  text: string;
  dim?: boolean;
  dir?: 'right' | 'down';
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={`w41-flow ${dim ? 'dim' : ''}`}>
      {dir === 'right' ? '→ ' : '↓ '}
      {text}
    </text>
  );
}

/* ------------------------------------------------------------- the DC ladder */

function LadderView({ L, kind, open, reveal }: { L: Ladder; kind: 'ex4' | 'gd'; open: boolean; reveal: number }) {
  const p = kind === 'ex4' ? 'e4_' : 'g_';
  const s = ladder(L);
  const k = (r: number) => `${r / 1e3}k`;
  const show = (lvl: number, v: string) => (reveal >= lvl ? v : '?');
  const gd = kind === 'gd';
  const zeroLit = useIsLit()('i_zero');
  // columns: source 40, R1 70–122, node A 165 (R2), C1 225, R3 270–322, node B 370 (R4),
  // C2 440 (example 4) or R5 412–464 then C2 545 (guided)
  const xC2 = gd ? 545 : 440;
  const nA = gd ? '节点 1' : 'A';
  const nB = gd ? '节点 2' : 'B';
  return (
    <svg viewBox="0 0 600 270" className="w41-sch" role="img" aria-label={gd ? '实战题：9 V 直流稳态含电容与死胡同电阻 R5 的网络' : '例题 4：12 V 直流稳态双电容网络'}>
      <line x1={40} x2={70} y1={TOP} y2={TOP} className="w41-wire" />
      <line x1={122} x2={270} y1={TOP} y2={TOP} className="w41-wire" />
      <line x1={322} x2={gd ? 412 : xC2} y1={TOP} y2={TOP} className="w41-wire" />
      {gd && <line x1={464} x2={xC2} y1={TOP} y2={TOP} className={`w41-wire ${open ? 'dim' : ''}`} />}
      <line x1={40} x2={xC2} y1={BOT} y2={BOT} className="w41-wire" />
      <line x1={165} x2={165} y1={TOP} y2={112} className="w41-wire" />
      <line x1={165} x2={165} y1={164} y2={BOT} className="w41-wire" />
      <line x1={370} x2={370} y1={TOP} y2={112} className="w41-wire" />
      <line x1={370} x2={370} y1={164} y2={BOT} className="w41-wire" />
      <Source x={40} id={`${p}vs`} label={`${L.Vs} V`} />
      <Res x={70} y={TOP} id={`${p}r1`} label={`R1 ${k(L.R1)}Ω`} lbl={[96, TOP - 14, 'middle']} />
      <Res x={165} y={112} vertical id={`${p}r2`} label={`R2 ${k(L.R2)}`} lbl={[153, 142, 'end']} />
      <Res x={270} y={TOP} id={`${p}r3`} label={`R3 ${k(L.R3)}Ω`} lbl={[296, TOP - 14, 'middle']} />
      <Res x={370} y={112} vertical id={`${p}r4`} label={`R4 ${k(L.R4)}`} lbl={[382, 142, 'start']} />
      {gd && <Res x={412} y={TOP} id="g_r5" label="R5 2kΩ" dim={open} lbl={[438, TOP - 14, 'middle']} />}
      <CapV x={225} y1={TOP} y2={BOT} py={150} id={`${p}c1`} label={`C1 ${fmtC(L.C1)}`} open={open} lbl={[243, 132, 'start']} cls="c1" />
      <CapV x={xC2} y1={TOP} y2={BOT} py={150} id={`${p}c2`} label={`C2 ${fmtC(L.C2)}`} open={open} lbl={gd ? [xC2 - 20, 132, 'end'] : [xC2 + 18, 132, 'start']} cls="c2" />
      <Node x={165} id={`${p}na`} name={nA} value={open || !gd ? `= ${show(3, fmtV(s.VA, 0))}` : ''} />
      <Node x={370} id={`${p}nb`} name={nB} value={open || !gd ? `= ${show(4, fmtV(s.VB, 0))}` : ''} />
      {open && (
        <g className="w41-flows">
          <Flow x={96} y={TOP + 24} text={`Is ${show(2, fmtI(s.Is))}`} />
          <Flow x={159} y={205} dir="down" anchor="end" text={show(3, fmtI(s.I2))} />
          <Flow x={296} y={TOP + 24} text={show(3, fmtI(s.I34))} />
          <Flow x={364} y={205} dir="down" anchor="end" text={show(3, fmtI(s.I34))} />
          <g className={`w41-zeros ${zeroLit}`} {...hoverProps(['i_zero'])}>
            <text x={225} y={232} textAnchor="middle" className="w41-zero">
              iC1 = 0
            </text>
            <text x={xC2} y={232} textAnchor="middle" className="w41-zero">
              iC2 = 0
            </text>
            {gd && (
              <text x={438} y={TOP + 26} textAnchor="middle" className="w41-zero">
                iR5 = 0
              </text>
            )}
          </g>
        </g>
      )}
      <text x={300} y={266} textAnchor="middle" className="w41-foot">
        {open ? '直流稳态：dv/dt = 0 ⇒ iC = 0，电容 = 开路' : gd ? '所有电容额定耐压 25 V，极性上正下负' : '直流稳态：dv/dt = 0'}
      </text>
    </svg>
  );
}

function LadderCells({ L, kind, reveal }: { L: Ladder; kind: 'ex4' | 'gd'; reveal: number }) {
  const s = ladder(L);
  const p = kind === 'ex4' ? 'e4_' : 'g_';
  const show = (lvl: number, v: string) => (reveal >= lvl ? v : '?');
  return (
    <div className="w41-cells">
      <Cell id="is_total" name="Req · Is" value={reveal >= 2 ? `${fmtR(s.Req)} · ${fmtI(s.Is)}` : '?'} />
      <Cell id={`${p}c1`} name="VC1" value={show(3, fmtV(s.VC1, 1))} tone="good" />
      <Cell id={`${p}c2`} name="VC2" value={show(4, fmtV(s.VC2, 1))} tone="good" />
      <Cell id="w_c" name="wC1" value={show(5, fmtW(s.w1))} />
      <Cell id="w_c" name="wC2" value={show(5, fmtW(s.w2))} />
      <Cell id="w_total" name="w 总" value={show(5, fmtW(s.wt))} tone="good" />
    </div>
  );
}

/* ------------------------------------------------------------- example 5 */

type Red = 0 | 1 | 2 | 3;

function CapH({ x, id, label, onTap }: { x: number; id: string; label: string; onTap?: () => void }) {
  const on = useIsLit()(id);
  return (
    <g className={`w41-cap ${on} ${onTap ? 'tap' : ''}`} {...hoverProps([id])} onClick={onTap}>
      <line x1={x - 6} x2={x - 6} y1={TOP - 15} y2={TOP + 15} className="w41-plate" />
      <line x1={x + 6} x2={x + 6} y1={TOP - 15} y2={TOP + 15} className="w41-plate" />
      <text x={x} y={TOP - 22} textAnchor="middle" className="w41-lbl c">
        {label}
      </text>
      <rect x={x - 20} y={TOP - 34} width={40} height={52} fill="transparent" />
    </g>
  );
}

function CapTap({ x, py, id, label, onTap }: { x: number; py: number; id: string; label: string; onTap?: () => void }) {
  const on = useIsLit()(id);
  return (
    <g className={`w41-cap ${on} ${onTap ? 'tap' : ''}`} {...hoverProps([id])} onClick={onTap}>
      <line x1={x - 15} x2={x + 15} y1={py} y2={py} className="w41-plate" />
      <line x1={x - 15} x2={x + 15} y1={py + 12} y2={py + 12} className="w41-plate" />
      <text x={x + 20} y={py + 10} className="w41-lbl c">
        {label}
      </text>
      <rect x={x - 18} y={py - 10} width={70} height={32} fill="transparent" />
    </g>
  );
}

const uF = (c: number) => `${+(c * 1e6).toFixed(2)} μF`;

function Net5View({ n, red, cycle }: { n: Net5; red: Red; cycle: (k: 'C1' | 'C2' | 'C3' | 'C4') => void }) {
  const s = net5(n);
  const right = 470;
  return (
    <svg viewBox="0 0 560 270" className="w41-sch" role="img" aria-label="例题 5：四电容混联网络与逐级化简">
      <Source x={40} id="x_vs" label={`${n.Vs} V`} />
      <line x1={40} x2={red === 3 ? 300 : 144} y1={TOP} y2={TOP} className="w41-wire" />
      <line x1={40} x2={red === 3 ? 300 : red === 2 ? 400 : right} y1={BOT} y2={BOT} className="w41-wire" />
      {red < 3 && (
        <>
          <CapH x={150} id="x_c1" label={`C1 ${uF(n.C1)}`} onTap={red === 0 ? () => cycle('C1') : undefined} />
          <line x1={156} x2={red === 2 ? 400 : right} y1={TOP} y2={TOP} className="w41-wire" />
          <circle cx={red === 2 ? 400 : 300} cy={TOP} r={4} className="w41-dot" />
        </>
      )}
      {red === 0 && (
        <>
          <line x1={300} x2={300} y1={TOP} y2={150} className="w41-wire" />
          <CapTap x={300} py={150} id="x_c2" label={`C2 ${uF(n.C2)}`} onTap={() => cycle('C2')} />
          <line x1={300} x2={300} y1={162} y2={BOT} className="w41-wire" />
          <line x1={right} x2={right} y1={TOP} y2={112} className="w41-wire" />
          <CapTap x={right} py={112} id="x_c3" label={`C3 ${uF(n.C3)}`} onTap={() => cycle('C3')} />
          <line x1={right} x2={right} y1={124} y2={180} className="w41-wire" />
          <CapTap x={right} py={180} id="x_c4" label={`C4 ${uF(n.C4)}`} onTap={() => cycle('C4')} />
          <line x1={right} x2={right} y1={192} y2={BOT} className="w41-wire" />
        </>
      )}
      {red === 1 && (
        <>
          <line x1={300} x2={300} y1={TOP} y2={150} className="w41-wire" />
          <CapTap x={300} py={150} id="x_c2" label={`C2 ${uF(n.C2)}`} />
          <line x1={300} x2={300} y1={162} y2={BOT} className="w41-wire" />
          <line x1={right} x2={right} y1={TOP} y2={150} className="w41-wire" />
          <CapTap x={right} py={150} id="x_c34" label={`C34 ${uF(s.C34)}`} />
          <line x1={right} x2={right} y1={162} y2={BOT} className="w41-wire" />
        </>
      )}
      {red === 2 && (
        <>
          <line x1={400} x2={400} y1={TOP} y2={150} className="w41-wire" />
          <CapTap x={400} py={150} id="x_c234" label={`C234 ${uF(s.C234)}`} />
          <line x1={400} x2={400} y1={162} y2={BOT} className="w41-wire" />
        </>
      )}
      {red === 3 && (
        <>
          <line x1={300} x2={300} y1={TOP} y2={150} className="w41-wire" />
          <CapTap x={300} py={150} id="x_ceq" label={`Ceq ${uF(s.Ceq)}`} />
          <line x1={300} x2={300} y1={162} y2={BOT} className="w41-wire" />
        </>
      )}
      <text x={300} y={266} textAnchor="middle" className="w41-foot">
        {['原网络：点电容换容量（10–100 μF）', '① C3、C4 串联：倒数相加 → C34', '② C2 与 C34 并联：直接相加 → C234', '③ C1 与 C234 串联 → Ceq'][red]}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------- the layer */

export default function DcBench() {
  useClearHoverOnUnmount();
  const on = useIsLit();
  const [mode, setMode] = useStageParam<DcMode>('dc', 'ex4');
  const [openRaw, setOpen] = useStageParam('open', false);
  const [gdRaw] = useStageParam('gd', 0);
  const [red, setRed] = useStageParam<Red>('red', 0);
  const [c1, setC1] = useStageParam('c1', EX5.C1);
  const [c2, setC2] = useStageParam('c2', EX5.C2);
  const [c3, setC3] = useStageParam('c3', EX5.C3);
  const [c4, setC4] = useStageParam('c4', EX5.C4);
  const reveal = mode === 'gd' ? gdRaw : 9;
  // the guided example's open-circuit view unlocks once step 1 is answered
  const open = openRaw && (mode !== 'gd' || reveal >= 1);
  const n: Net5 = { C1: c1, C2: c2, C3: c3, C4: c4, Vs: EX5.Vs };
  const s5 = net5(n);
  const setters = { C1: setC1, C2: setC2, C3: setC3, C4: setC4 };
  const cycle = (k: 'C1' | 'C2' | 'C3' | 'C4') => {
    const cur = Math.round(n[k] * 1e6);
    const i = C_STEPS.indexOf(cur);
    setters[k](C_STEPS[(i + 1) % C_STEPS.length] * 1e-6);
  };
  const isEx5Default = c1 === EX5.C1 && c2 === EX5.C2 && c3 === EX5.C3 && c4 === EX5.C4;
  let view: ReactNode;
  let cells: ReactNode;
  let note: ReactNode;
  if (mode === 'ex5') {
    view = <Net5View n={n} red={red} cycle={cycle} />;
    const R = mirrorR(n) * 1e3 * 1e6; // the μF numbers read as kΩ
    cells = (
      <div className="w41-cells">
        <Cell id="x_ceq" name="Ceq" value={uF(s5.Ceq)} hint={`Q = ${fmtQ(s5.Q)}`} tone="good" />
        <Cell id="x_c1" name="VC1" value={fmtV(s5.V1, 2)} />
        <Cell id="x_c2" name="VC2 = V234" value={fmtV(s5.V2, 2)} />
        <Cell id="x_c3" name="VC3 · VC4" value={`${fmtV(s5.V3, 1)} · ${fmtV(s5.V4, 1)}`} />
        <Cell id="w_total" name={Math.abs(s5.weq - s5.wsum) < 1e-12 ? 'w 等效 = 求和' : 'w 等效 ≠ 求和'} value={fmtW(s5.weq)} tone="good" />
        <Cell id="mirror" name="同数字电阻 Req" value={fmtR(R)} tone="minor" />
      </div>
    );
    note = (
      <>
        <span className="full">
          镜像：电容并联直接相加（像电阻串联），串联倒数相加（像电阻并联）· 串联反比分压：容量小的分压大 · {fmtC(s5.Ceq)} vs 同数字电阻 {fmtR(R)}
        </span>
        <span className="short">并联相加 · 串联倒数相加 · 小电容分大电压</span>
      </>
    );
  } else {
    const L = mode === 'ex4' ? EX4 : GUIDED;
    view = <LadderView L={L} kind={mode} open={open} reveal={reveal} />;
    cells = <LadderCells L={L} kind={mode} reveal={reveal} />;
    note =
      mode === 'gd' && reveal < 9 ? (
        <>
          <span className="full">实战题进行中：答对一步，舞台才揭晓一步的数值</span>
          <span className="short">实战题进行中：答对一步揭晓一步</span>
        </>
      ) : (
        <>
          <span className="full">黄金三步：① 电容开路替换 → ② 纯电阻网络求 VC（零电流电阻压降为 0）→ ③ w = ½CVC²</span>
          <span className="short">开路替换 → 纯阻求压 → 代入储能</span>
        </>
      );
  }
  return (
    <div className="w41-layer">
      <div className="w41-dock">
        <Seg<DcMode>
          label="电路"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'ex4', label: '例题 4 直流稳态', short: '例题 4', hover: ['e4_c1', 'e4_c2'] },
            { value: 'gd', label: '实战题（R5 陷阱）', short: '实战题', hover: ['g_r5'] },
            { value: 'ex5', label: '例题 5 串并联', short: '例题 5', hover: ['x_ceq'] },
          ]}
        />
        {mode === 'ex5' ? (
          <>
            <Seg<Red>
              label="化简步骤"
              value={red}
              onChange={setRed}
              options={[
                { value: 0, label: '原网络', short: '原图' },
                { value: 1, label: 'C34', hover: ['x_c34'] },
                { value: 2, label: 'C234', hover: ['x_c234'] },
                { value: 3, label: 'Ceq', hover: ['x_ceq'] },
              ]}
            />
            {!isEx5Default && (
              <button className="w41-fold" onClick={() => useStage.getState().setParams({ c1: EX5.C1, c2: EX5.C2, c3: EX5.C3, c4: EX5.C4, red: 0 })}>
                复位 60/20/20/20
              </button>
            )}
          </>
        ) : (
          <button
            className={`w41-toggle ${open ? 'on' : ''} ${on('dc_open')}`}
            aria-pressed={open}
            disabled={mode === 'gd' && reveal < 1}
            title={mode === 'gd' && reveal < 1 ? '先答完实战题第 1 步' : undefined}
            onClick={() => setOpen(!open)}
            {...hoverProps(['dc_open'])}
          >
            <span className="full">{open ? '已开路替换' : '直流稳态开路替换'}</span>
            <span className="short">{open ? '已开路' : '开路替换'}</span>
          </button>
        )}
      </div>
      <div className="w41-schwrap">{view}</div>
      {cells}
      <p className={`w41-notice ${on('mirror', 'dc_open')}`} role="note">
        {note}
      </p>
    </div>
  );
}
