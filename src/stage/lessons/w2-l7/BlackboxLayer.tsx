// Layer "01 2D 黑盒等效步骤图": the four-step Thevenin pipeline on one live schematic —
// 拆负载 → 测开路 v_oc → 求 R_Th (独立源置零 / 外加 1 V 测试源) → 接回负载 R_L — for Case 1
// (Sadiku Ex. 4.8), Case 2 (2v_x, test source) and the guided example (0.25v_x). Step 3 shows
// the zeroed sources (voltage source → short, current source → open) and keeps the dependent
// source; Case 2 / the guided example get the blue 1 V test source and the i_o arrow. Step 4
// swaps the network for its Thevenin equivalent with a load slider. Every part is a stage object.

import type { ReactNode } from 'react';
import { CASE_OPTIONS, Chip, hov, RevealButton, Seg, Slider, STEP_OPTIONS, useCase, useClearHoverOnUnmount, useIsLit, useReveal, useRl, useStep } from './common';
import { CASES, equivalent, loadPoint, num, type CaseId, type StepId } from './model';

const Y = 70;
const G = 240;
const X_SRC = 60;
const R1 = [95, 155];
const X_N1 = 195;
const R2 = [118, 178];
const X_IS = 255;
const R3 = [290, 350];
const X_DEP = 385;
const X_A = 420;
const X_RIGHT = 482;

/* ------------------------------------------------------------- parts */

function Obj({ id, className = '', children }: { id: string; className?: string; children: ReactNode }) {
  const isLit = useIsLit();
  return (
    <g className={`w27-obj ${className} ${isLit(id) ? 'lit' : ''}`} {...hov([id])}>
      {children}
    </g>
  );
}

const W = ({ d, className = '' }: { d: string; className?: string }) => <path d={d} className={`w27-wire ${className}`} />;

function ResH({ id, x1, x2, y, name, val }: { id: string; x1: number; x2: number; y: number; name: string; val: string }) {
  return (
    <Obj id={id} className="res">
      <rect x={x1 - 4} y={y - 16} width={x2 - x1 + 8} height={32} className="hit" />
      <rect x={x1} y={y - 9} width={x2 - x1} height={18} rx={2} className="body" />
      <text x={(x1 + x2) / 2} y={y - 15} className="w27-lbl res" textAnchor="middle">
        {name} = {val}
      </text>
    </Obj>
  );
}

function ResV({ id, x, y1, y2, name, val, side = 'left' }: { id: string; x: number; y1: number; y2: number; name: string; val: string; side?: 'left' | 'right' }) {
  return (
    <Obj id={id} className="res">
      <rect x={x - 16} y={y1 - 4} width={32} height={y2 - y1 + 8} className="hit" />
      <rect x={x - 9} y={y1} width={18} height={y2 - y1} rx={2} className="body" />
      <text x={side === 'left' ? x - 14 : x + 14} y={(y1 + y2) / 2 - 2} className="w27-lbl res" textAnchor={side === 'left' ? 'end' : 'start'}>
        {name}
      </text>
      <text x={side === 'left' ? x - 14 : x + 14} y={(y1 + y2) / 2 + 13} className="w27-lbl res" textAnchor={side === 'left' ? 'end' : 'start'}>
        {val}
      </text>
    </Obj>
  );
}

function VSrc({ id, x, cy, label, className = '' }: { id: string; x: number; cy: number; label: string; className?: string }) {
  return (
    <Obj id={id} className={`src ${className}`}>
      <circle cx={x} cy={cy} r={20} className="body" />
      <text x={x} y={cy - 4} className="w27-sign" textAnchor="middle">
        +
      </text>
      <text x={x} y={cy + 14} className="w27-sign" textAnchor="middle">
        −
      </text>
      <text x={x - 26} y={cy + 4} className="w27-lbl src" textAnchor="end">
        {label}
      </text>
    </Obj>
  );
}

function ISrc({ id, x, cy, label }: { id: string; x: number; cy: number; label: string }) {
  return (
    <Obj id={id} className="src">
      <circle cx={x} cy={cy} r={19} className="body" />
      <path d={`M ${x} ${cy + 12} V ${cy - 6}`} className="arrow" />
      <path d={`M ${x} ${cy - 12} l -5 8 h 10 z`} className="head" />
      <text x={x + 24} y={cy + 4} className="w27-lbl src">
        {label}
      </text>
    </Obj>
  );
}

function Diamond({ x, cy, kind, label, keep }: { x: number; cy: number; kind: 'v' | 'i'; label: string; keep: boolean }) {
  return (
    <Obj id="hl_dep" className="dep">
      <polygon points={`${x},${cy - 22} ${x + 22},${cy} ${x},${cy + 22} ${x - 22},${cy}`} className="body" />
      {kind === 'v' ? (
        <>
          <text x={x} y={cy - 4} className="w27-sign dep" textAnchor="middle">
            +
          </text>
          <text x={x} y={cy + 14} className="w27-sign dep" textAnchor="middle">
            −
          </text>
        </>
      ) : (
        <>
          <path d={`M ${x} ${cy + 13} V ${cy - 5}`} className="arrow" />
          <path d={`M ${x} ${cy - 12} l -5 8 h 10 z`} className="head" />
        </>
      )}
      <text x={x - 27} y={cy + 4} className="w27-lbl dep" textAnchor="end">
        {label}
      </text>
      {keep && (
        <text x={kind === 'v' ? x + 24 : x - 24} y={cy + 36} className="w27-keep" textAnchor={kind === 'v' ? 'start' : 'end'}>
          保留!
        </text>
      )}
    </Obj>
  );
}

function Terminals() {
  return (
    <Obj id="hl_port" className="port">
      <circle cx={X_A} cy={Y} r={5} className="term" />
      <circle cx={X_A} cy={G} r={5} className="term" />
      <text x={X_A} y={Y - 11} className="w27-lbl port" textAnchor="middle">
        a
      </text>
      <text x={X_A} y={G + 19} className="w27-lbl port" textAnchor="middle">
        b
      </text>
    </Obj>
  );
}

function Bubble({ x, y, text, id, tone = 'node' }: { x: number; y: number; text: string; id: string; tone?: string }) {
  const w = text.length * 6.6 + 14;
  return (
    <Obj id={id} className={`bubble ${tone}`}>
      <rect x={x - w / 2} y={y - 12} width={w} height={20} rx={10} />
      <text x={x} y={y + 2.5} textAnchor="middle">
        {text}
      </text>
    </Obj>
  );
}

/* ------------------------------------------------------------- the network (steps 1–3) */

function Network({ cid, step, rv }: { cid: CaseId; step: StepId; rv: ReturnType<typeof useReveal> }) {
  const c = CASES[cid];
  const e = equivalent(c);
  const q = (ok: boolean, s: string) => (ok ? s : '?');
  const zero = step === 'rth';
  const hasVs = cid !== 'c2';
  const hasIs = cid !== 'gd';
  const test = zero && cid !== 'c1';
  const val = (x: number) => `${num(x)} Ω`;
  return (
    <>
      {/* network box */}
      <Obj id="hl_network" className="netbox">
        <rect x={20} y={8} width={X_A - 30} height={G + 14} rx={12} />
        <text x={30} y={25} className="w27-boxlbl">
          {zero ? (cid === 'c1' ? '独立源置零后的电阻网络' : '独立源置零 · 受控源保留') : '固定线性网络 A（含全部电源）'}
        </text>
      </Obj>
      {/* ground bus and top wire */}
      <W d={`M ${X_SRC} ${G} H ${X_A}`} className="gnd" />
      <W d={`M ${X_SRC} ${Y} H ${R1[0]} M ${R1[1]} ${Y} H ${R3[0]} M ${R3[1]} ${Y} H ${X_A}`} />
      {/* left source */}
      {hasVs ? (
        zero ? (
          <Obj id="hl_vs" className="zeroed">
            <path d={`M ${X_SRC} ${Y} V ${G}`} className="short" />
            <text x={X_SRC - 8} y={150} className="w27-zero" textAnchor="end">
              短路
            </text>
            <text x={X_SRC - 8} y={165} className="w27-zero sub" textAnchor="end">
              (V_s=0)
            </text>
          </Obj>
        ) : (
          <>
            <W d={`M ${X_SRC} ${Y} V 135 M ${X_SRC} 175 V ${G}`} />
            <VSrc id="hl_vs" x={X_SRC} cy={155} label={`${c.vs}V`} />
          </>
        )
      ) : (
        <>
          <W d={`M ${X_SRC} ${Y} V 133 M ${X_SRC} 177 V ${G}`} />
          <Diamond x={X_SRC} cy={155} kind="v" label="2v_x" keep={zero} />
        </>
      )}
      <ResH id="hl_r1" x1={R1[0]} x2={R1[1]} y={Y} name="R₁" val={val(c.r1)} />
      {/* node 1, R2 and v_x */}
      <W d={`M ${X_N1} ${Y} V ${R2[0]} M ${X_N1} ${R2[1]} V ${G}`} />
      <ResV id="hl_r2" x={X_N1} y1={R2[0]} y2={R2[1]} name="R₂" val={val(c.r2)} />
      {c.mu !== 0 || c.g !== 0 ? (
        <Obj id="hl_vx" className="vx">
          <text x={X_N1 + 14} y={R2[0] + 8} className="w27-lbl dep">
            +
          </text>
          <text x={X_N1 + 14} y={(R2[0] + R2[1]) / 2 + 5} className="w27-lbl dep">
            v_x
          </text>
          <text x={X_N1 + 14} y={R2[1] + 2} className="w27-lbl dep">
            −
          </text>
        </Obj>
      ) : null}
      <Obj id="hl_node1" className="node">
        <circle cx={X_N1} cy={Y} r={5} />
        <text x={X_N1} y={Y - 12} className="w27-lbl node" textAnchor="middle">
          节点 1
        </text>
      </Obj>
      {/* independent current source at node 1 */}
      {hasIs &&
        (zero ? (
          <Obj id="hl_is" className="zeroed">
            <path d={`M ${X_IS} ${Y} V 118 M ${X_IS} 192 V ${G}`} className="open" />
            <text x={X_IS} y={150} className="w27-zero" textAnchor="middle">
              开路
            </text>
            <text x={X_IS} y={165} className="w27-zero sub" textAnchor="middle">
              (I_s=0)
            </text>
          </Obj>
        ) : (
          <>
            <W d={`M ${X_IS} ${Y} V 136 M ${X_IS} 174 V ${G}`} />
            <ISrc id="hl_is" x={X_IS} cy={155} label={`${c.is} A`} />
          </>
        ))}
      <ResH id="hl_r3" x1={R3[0]} x2={R3[1]} y={Y} name="R₃" val={val(c.r3)} />
      {/* the guided example's VCCS at port a */}
      {c.g !== 0 && (
        <>
          <W d={`M ${X_DEP} ${Y} V 133 M ${X_DEP} 177 V ${G}`} />
          <Diamond x={X_DEP} cy={155} kind="i" label="0.25v_x" keep={zero} />
        </>
      )}
      <Terminals />

      {/* right of the port: the detached load, the voltmeter or the test source */}
      {step === 'detach' && (
        <Obj id="hl_load" className="load detached">
          <path d={`M ${X_A + 14} ${Y} H 452 M ${X_A + 14} ${G} H 452`} className="dash" />
          <path d={`M 470 ${Y} H ${X_RIGHT + 8} V 128 M ${X_RIGHT + 8} 182 V ${G} H 470`} className="lead" />
          <rect x={X_RIGHT - 1} y={128} width={18} height={54} rx={2} className="body" />
          <text x={X_RIGHT - 8} y={152} className="w27-lbl load" textAnchor="end">
            R_L
          </text>
          <text x={X_RIGHT - 8} y={168} className="w27-lbl load sub" textAnchor="end">
            已拆下
          </text>
        </Obj>
      )}
      {step === 'voc' && (
        <>
          <Obj id="hl_voc" className="meter">
            <path d={`M ${X_A} ${Y} H ${X_RIGHT} V 133 M ${X_RIGHT} 177 V ${G} H ${X_A}`} className="lead" />
            <circle cx={X_RIGHT} cy={155} r={22} className="body" />
            <text x={X_RIGHT} y={161} className="w27-meter" textAnchor="middle">
              V
            </text>
            <text x={X_RIGHT - 26} y={200} className="w27-lbl voc" textAnchor="end">
              v_oc
            </text>
            <text x={X_RIGHT - 26} y={216} className="w27-lbl voc" textAnchor="end">
              = {q(rv.voc, num(e.vth))} V
            </text>
          </Obj>
          <Bubble id="hl_node1" x={X_N1 + 2} y={96} text={`v₁ = ${q(rv.voc, num(e.v1Open))} V`} />
          {cid === 'gd' ? (
            <>
              <Bubble id="hl_voc" x={X_A - 24} y={42} text={`v_a = ${q(rv.voc, num(e.vth))} V`} tone="voc" />
              <Bubble id="hl_r3" x={(R3[0] + R3[1]) / 2 - 10} y={100} text={`i(R₃) = ${q(rv.voc, num((e.vth - e.v1Open) / c.r3))} A ←`} tone="cur" />
            </>
          ) : (
            <Bubble id="hl_r3" x={(R3[0] + R3[1]) / 2 + 2} y={100} text="i(R₃) = 0 → 无压降" tone="cur" />
          )}
        </>
      )}
      {zero && !test && (
        <Obj id="hl_rth" className="rth">
          <text x={X_A + 12} y={150} className="w27-lbl rth">
            ← 看入
          </text>
          <text x={X_A + 12} y={168} className="w27-lbl rth big">
            R_Th
          </text>
          <text x={X_A + 12} y={186} className="w27-lbl rth">
            = {num(e.rth)} Ω
          </text>
        </Obj>
      )}
      {test && (
        <>
          <Obj id="hl_test" className="test">
            <path d={`M ${X_A} ${Y} H ${X_RIGHT} V 133 M ${X_RIGHT} 177 V ${G} H ${X_A}`} className="lead" />
            <circle cx={X_RIGHT} cy={155} r={21} className="body" />
            <text x={X_RIGHT} y={150} className="w27-sign test" textAnchor="middle">
              +
            </text>
            <text x={X_RIGHT} y={168} className="w27-sign test" textAnchor="middle">
              −
            </text>
            <text x={X_RIGHT - 26} y={200} className="w27-lbl test" textAnchor="end">
              v_o=1V
            </text>
          </Obj>
          <Obj id="hl_io" className="io">
            <path d={`M ${X_RIGHT - 10} ${Y - 12} H ${X_A + 22}`} className="arrow" />
            <path d={`M ${X_A + 14} ${Y - 12} l 9 -5 v 10 z`} className="head" />
            <text x={(X_A + X_RIGHT) / 2 + 4} y={Y - 20} className="w27-lbl io" textAnchor="middle">
              i_o = {q(rv.io, num(e.io, 3))} A
            </text>
          </Obj>
          <Bubble id="hl_node1" x={X_N1 + 2} y={96} text={`v₁ = ${q(rv.v1t, num(e.v1Test))} V`} />
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------- the Thevenin equivalent (step 4) */

function Equivalent({ cid, rl, hidden }: { cid: CaseId; rl: number; hidden: boolean }) {
  const e = equivalent(CASES[cid]);
  const p = loadPoint(e, rl);
  const q = (s: string) => (hidden ? '?' : s);
  const XA = 330;
  const XL = 420;
  return (
    <>
      <Obj id="hl_thev" className="netbox thev">
        <rect x={40} y={8} width={XA - 52} height={G + 14} rx={12} />
        <text x={50} y={25} className="w27-boxlbl">
          戴维南等效（V_Th 串联 R_Th）
        </text>
      </Obj>
      <W d={`M 110 ${G} H ${XL} V 188 M ${XL} 122 V ${Y} H 260 M 180 ${Y} H 110 V 135 M 110 175 V ${G}`} />
      <VSrc id="hl_voc" x={110} cy={155} label={`V_Th = ${q(num(e.vth))} V`} className="vth" />
      <ResH id="hl_rth" x1={180} x2={260} y={Y} name="R_Th" val={`${q(num(e.rth))} Ω`} />
      <Obj id="hl_port" className="port">
        <circle cx={XA} cy={Y} r={5} className="term" />
        <circle cx={XA} cy={G} r={5} className="term" />
        <text x={XA} y={Y - 11} className="w27-lbl port" textAnchor="middle">
          a
        </text>
        <text x={XA} y={G + 19} className="w27-lbl port" textAnchor="middle">
          b
        </text>
      </Obj>
      <Obj id="hl_load" className="load">
        <rect x={XL - 16} y={118} width={32} height={74} className="hit" />
        <rect x={XL - 9} y={122} width={18} height={66} rx={2} className="body" />
        <text x={XL + 16} y={150} className="w27-lbl load">
          R_L
        </text>
        <text x={XL + 16} y={166} className="w27-lbl load">
          {rl} Ω
        </text>
        <text x={XL + 16} y={200} className="w27-lbl voc">
          V_L = {q(num(p.vl))} V
        </text>
      </Obj>
      <Obj id="hl_load" className="io">
        <path d={`M ${XA + 16} ${Y - 12} H ${XL - 16}`} className="arrow" />
        <path d={`M ${XL - 8} ${Y - 12} l -9 -5 v 10 z`} className="head" />
        <text x={(XA + XL) / 2} y={Y - 20} className="w27-lbl io" textAnchor="middle">
          I_L = {q(num(p.il, 3))} A
        </text>
      </Obj>
      <text x={XA + 8} y={G - 14} className="w27-note">
        对端口外部完全等效
      </text>
    </>
  );
}

/* ------------------------------------------------------------- layer */

export default function BlackboxLayer() {
  useClearHoverOnUnmount();
  const [cid, setCase] = useCase();
  const [step, setStep] = useStep();
  const [rl, setRl] = useRl();
  const e = equivalent(CASES[cid]);
  const p = loadPoint(e, rl);
  const rv = useReveal(cid);
  const q = (ok: boolean, s: string) => (ok ? s : '?');
  return (
    <div className="w27-layer">
      <div className="w27-ctrl">
        <Seg label="黑盒等效步骤" value={step} options={STEP_OPTIONS} onChange={setStep} className="steps" />
        <Seg label="电路切换" value={cid} options={CASE_OPTIONS} onChange={setCase} className="small" />
      </div>
      <div className="w27-sch-wrap">
        <svg viewBox="0 0 520 268" className="w27-sch" role="img" aria-label="戴维南黑盒等效步骤图">
          {step === 'load' ? <Equivalent cid={cid} rl={rl} hidden={rv.masked} /> : <Network cid={cid} step={step} rv={rv} />}
        </svg>
      </div>
      {step === 'load' && <Slider label="负载 R_L" value={rl} min={0} max={50} step={1} unit="Ω" onChange={setRl} hover={['hl_load']} />}
      <div className="w27-chips">
        <Chip ids={['hl_voc']} k="V_Th" v={`${q(rv.voc, num(e.vth))} V`} />
        <Chip ids={['hl_rth']} k="R_Th" v={`${q(rv.io, num(e.rth))} Ω`} />
        <Chip ids={['hl_norton', 'vi_in']} k="I_N" v={`${q(rv.io, num(e.iN))} A`} />
        {step === 'rth' && cid !== 'c1' && <Chip ids={['hl_io']} k="i_o" v={`${q(rv.io, num(e.io, 3))} A → R_Th = 1/i_o`} className="wide" />}
        {step === 'rth' && cid !== 'c1' && rv.v1t && <Chip ids={['hl_dep']} tone="bad" k="误把受控源置零" v={`${num(e.rWrong)} Ω ✗`} className="wide" />}
        {step === 'rth' && cid === 'c1' && <Chip ids={['hl_rth']} k="R₃ + R₁∥R₂" v="1 + 3 = 4 Ω" className="wide" />}
        {step === 'load' && <Chip ids={['hl_load']} tone="good" k="I_L / V_L" v={rv.masked ? '?' : `${num(p.il, 3)} A / ${num(p.vl)} V`} className="wide" />}
        {rv.masked && <RevealButton onClick={rv.show} />}
      </div>
    </div>
  );
}
