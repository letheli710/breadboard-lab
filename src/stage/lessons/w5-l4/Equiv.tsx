// W5-L4 layer 02 · 复阻抗戴维南等效与源变换切换台. Five views of a port a-b:
//  源变换  — act 2's ladder folded by three source transformations (step 0 … 3), V_x the same at
//            every step;
//  原电路 / 戴维南 / 诺顿 — act 3's network and its two equivalents; a load Z_L = R_L + jX_L can be
//            hung on a-b, and the port voltage and current come out the same in all three views;
//  测试源  — act 4's network with the VCCS 0.5 V_x: step A (open circuit, V_Th) and step B
//            (independent source zeroed, dependent source kept, 1∠0° V test source, Z_Th = V_t/I_t).
// The impedance triangle of Z_Th (R_Th, X_Th, |Z_Th|, θ) can be shown over the drawing.

import type { ReactNode } from 'react';
import { EX2, abs, add, argDeg, cx, div, fmt, fmtC, fmtP, inv, mul, nodalSrcT, port3, portN, portTh, scale, solveSrcT, solveTh3, solveTh4, sub, type Cx } from './model';
import { Bubble, C, Cell, Dot, Gnd, ISrc, Lbl, Obj, P, Port, Res, Seg, Short, Toggle, VSrc, Wire, ZBox, useClearHoverOnUnmount, useP, type EqView } from './parts';
import './w5l4.css';

const S2 = solveSrcT();
const S3 = solveTh3();
const S4 = solveTh4();

const YT = 52;
const YG = 150;

const VIEWS: { id: EqView; text: string; short: string; hot: string }[] = [
  { id: 'source', text: '电源变换', short: '源变换', hot: 'st_vx' },
  { id: 'original', text: '原电路', short: '原电路', hot: 'port_ab' },
  { id: 'thevenin', text: '戴维南', short: '戴维南', hot: 'vth' },
  { id: 'norton', text: '诺顿', short: '诺顿', hot: 'in_n' },
  { id: 'test', text: '受控源 · 1∠0° V 测试源', short: '测试源', hot: 'test_src' },
];

const STEP_NOTE = [
  '原图：V_s 串 R_1，C 支路接地，Z_ser 通到节点 x',
  '第 1 次：V_s 串 R_1 → I_s1 并 R_1，再与 Z_C 并联',
  '第 2 次：I_s1 并 Z_eq1 → V_eq1 串 Z_eq1，再串 Z_ser',
  '第 3 次：V_eq1 串 Z_left → I_left 并 Z_left，与 I_2、R_3 并联',
];

export default function Equiv() {
  useClearHoverOnUnmount();
  const [view, setView] = useP<EqView>(P.eq, 'source');
  const [st, setSt] = useP<number>(P.st, 0);
  const [ts, setTs] = useP<'A' | 'B'>(P.ts, 'A');
  const [load, setLoad] = useP<boolean>(P.load, false);
  const [rl, setRl] = useP<number>(P.rl, 10);
  const [xl, setXl] = useP<number>(P.xl, -5);
  const [tri, setTri] = useP<boolean>(P.tri, false);
  const Z: Cx | null = load ? cx(rl, xl) : null;
  const ex3 = view === 'original' || view === 'thevenin' || view === 'norton';

  let drawing: ReactNode;
  if (view === 'source') drawing = <SrcT step={st} />;
  else if (view === 'original') drawing = <Orig3 Z={Z} />;
  else if (view === 'thevenin') drawing = <Thev Z={Z} />;
  else if (view === 'norton') drawing = <Nort Z={Z} />;
  else drawing = <Test4 step={ts} />;

  const triZ = view === 'test' ? S4.Zth : S3.Zth;

  return (
    <div className="w54-layer">
      <div className="w54-controls">
        <Seg<EqView> label="视图" value={view} onChange={setView} options={VIEWS} />
      </div>
      <div className="w54-controls">
        {view === 'source' && (
          <Seg<string>
            label="变换步骤"
            value={String(st)}
            onChange={(v) => setSt(Number(v))}
            options={[
              { id: '0', text: '原图' },
              { id: '1', text: '第 1 次', short: '①' },
              { id: '2', text: '第 2 次', short: '②' },
              { id: '3', text: '第 3 次', short: '③' },
            ]}
          />
        )}
        {view === 'test' && (
          <Seg<'A' | 'B'>
            label="步骤"
            value={ts}
            onChange={setTs}
            options={[
              { id: 'A', text: 'Step A 开路求 V_Th', short: 'A 开路' },
              { id: 'B', text: 'Step B 测试源求 Z_Th', short: 'B 测试源' },
            ]}
          />
        )}
        {ex3 && (
          <>
            <Toggle on={load} onChange={setLoad}>
              挂负载 Z_L
            </Toggle>
            {load && (
              <>
                <label className="w54-slider small">
                  <span>
                    R_L <b>{fmt(rl, 0)}</b> Ω
                  </span>
                  <input type="range" min={0} max={20} step={1} value={rl} onChange={(e) => setRl(Number(e.target.value))} aria-label="负载电阻 R_L" />
                </label>
                <label className="w54-slider small">
                  <span>
                    X_L <b>{fmt(xl, 0)}</b> Ω
                  </span>
                  <input type="range" min={-20} max={20} step={1} value={xl} onChange={(e) => setXl(Number(e.target.value))} aria-label="负载电抗 X_L" />
                </label>
              </>
            )}
          </>
        )}
        {view !== 'source' && (
          <Toggle on={tri} onChange={setTri}>
            阻抗三角
          </Toggle>
        )}
      </div>

      <div className="w54-svgwrap">
        <svg viewBox={`0 0 440 ${tri && view !== 'source' ? 262 : 204}`} className="w54-svg" role="img" aria-label={`端口等效：${VIEWS.find((v) => v.id === view)!.text}`}>
          <rect x="1" y="1" width="438" height={tri && view !== 'source' ? 260 : 202} rx="10" className="w54-bg" />
          {drawing}
          {tri && view !== 'source' && <Triangle z={triZ} />}
          {view === 'source' && <Lbl x={12} y={196} s={STEP_NOTE[st]} color={C.muted} anchor="start" cls="w54-tick" />}
        </svg>
      </div>

      <div className="w54-readout">
        <div className="w54-rgrid stack">{readouts(view, st, ts, Z)}</div>
      </div>
    </div>
  );
}

function readouts(view: EqView, st: number, ts: 'A' | 'B', Z: Cx | null): ReactNode {
  if (view === 'source') {
    const vx = srcStepVx(st);
    return (
      <>
        <Cell
          id="st_step"
          k="本视图的等效内阻"
          v={st === 0 ? '—' : st === 1 ? `Z_eq1 = ${fmtC(S2.Zeq1, 0)} Ω` : st === 2 ? `Z_left = ${fmtC(S2.Zleft, 0)} Ω` : `Z_tot = ${fmtC(S2.Ztot, 0)} Ω`}
        />
        <Cell
          id="st_src"
          k="本视图的等效源"
          v={st === 0 ? 'V_s = 24∠0° V' : st === 1 ? `I_s1 = ${fmtC(S2.Is1, 0)} A` : st === 2 ? `V_eq1 = ${fmtC(S2.Veq1, 0)} V` : `I_tot = ${fmtC(S2.Itot, 1)} A`}
        />
        <Cell id="st_vx" k="V_x（本视图算得）" v={`${fmtC(vx, 4)} V`} tone={C.w1T} />
        <Cell id="st_vx" k="V_x 极坐标" v={fmtP(vx, 2, 'V')} tone={C.w1T} />
      </>
    );
  }
  if (view === 'test') {
    return ts === 'A' ? (
      <>
        <Cell id="vx_ctrl" k="控制量 V_x" v={`${fmtC(S4.Vx, 2)} V`} tone={C.depT} />
        <Cell id="dep_src" k="受控源 0.5V_x" v={`${fmtC(scale(S4.Vx, 0.5), 2)} A`} tone={C.depT} />
        <Cell id="vth" k="V_Th = V_oc" v={`${fmtC(S4.Vth, 2)} V`} tone={C.dcT} />
        <Cell id="vth" k="V_Th 极坐标" v={fmtP(S4.Vth, 2, 'V')} tone={C.dcT} />
      </>
    ) : (
      <>
        <Cell id="vx_ctrl" k="V_x（V_s = 0）" v={`${fmtC(S4.VxT, 2)} V`} tone={C.depT} />
        <Cell id="it" k="I_t 流入端口" v={`${fmtC(S4.It, 2)} A`} tone={C.testT} />
        <Cell id="zth" k="Z_Th = V_t / I_t" v={`${fmtC(S4.Zth, 2)} Ω`} tone={C.zT} />
        <Cell id="zth" k="Z_Th 极坐标" v={fmtP(S4.Zth, 2, 'Ω')} tone={C.zT} />
      </>
    );
  }
  const o = port3(Z);
  const t = portTh(S3.Vth, S3.Zth, Z);
  const n = portN(S3.In, S3.Zth, Z);
  const same = [t, n].every((p) => abs(sub(p.V, o.V)) < 1e-9 && abs(sub(p.I, o.I)) < 1e-9);
  return (
    <>
      <Cell id="port_ab" k="V_ab · 原电路" v={fmtP(o.V, 4, 'V', 4)} tone={view === 'original' ? C.ink : C.muted} />
      <Cell id="vth" k="V_ab · 戴维南" v={fmtP(t.V, 4, 'V', 4)} tone={view === 'thevenin' ? C.ink : C.muted} />
      <Cell id="in_n" k="V_ab · 诺顿" v={fmtP(n.V, 4, 'V', 4)} tone={view === 'norton' ? C.ink : C.muted} />
      <Cell id="zload" k={`I_ab · ${same ? '三种视图一致' : '不一致'}`} v={Z ? fmtP(o.I, 4, 'A', 4) : '0（开路）'} tone={same ? C.w1T : C.warnT} />
    </>
  );
}

/** V_x computed from the reduced circuit of each step (left part as a Thévenin source V, Z into
 *  node x, where I_2 ∥ R_3 hang): V_x = (V/Z + I_2) / (1/Z + 1/R_3) */
function srcStepVx(st: number): Cx {
  const at = (V: Cx, Zs: Cx) => div(add(div(V, Zs), EX2.I2), add(inv(Zs), inv(EX2.R3)));
  if (st >= 2) return at(S2.Veq1, S2.Zleft);
  if (st === 1) return at(mul(S2.Is1, S2.Zeq1), add(S2.Zeq1, EX2.Zser));
  return nodalSrcT();
}

/* ----------------------------------------------------------------------- drawings */

function GndBus({ x1, x2 }: { x1: number; x2: number }) {
  return (
    <>
      <Wire d={`M ${x1} ${YG} H ${x2}`} />
      <Gnd x={(x1 + x2) / 2} y={YG + 1} />
    </>
  );
}

/** a vertical branch from the top wire to the ground bus with an element centred on it */
function VBranch({ x, children, gap = 18 }: { x: number; children: ReactNode; gap?: number }) {
  const ym = (YT + YG) / 2;
  return (
    <>
      <Wire d={`M ${x} ${YT} V ${ym - gap} M ${x} ${ym + gap} V ${YG}`} />
      {children}
    </>
  );
}

const YM = (YT + YG) / 2;

/** a horizontal impedance box on the top wire from x1 to x2 */
function HZ({ x1, x2, label, color = C.z, tcolor = C.zT, sub }: { x1: number; x2: number; label: string; color?: string; tcolor?: string; sub?: string }) {
  return (
    <>
      <ZBox x={(x1 + x2) / 2} y={YT} w={x2 - x1} h={16} color={color} />
      <Lbl x={(x1 + x2) / 2} y={YT - 13} s={label} color={tcolor} cls="w54-tag" />
      {sub && <Lbl x={(x1 + x2) / 2} y={YT + 22} s={sub} color={C.muted} cls="w54-tick" />}
    </>
  );
}

/** a vertical impedance box centred on a branch */
function VZ({ x, label, color = C.z, tcolor = C.zT, right = true }: { x: number; label: string; color?: string; tcolor?: string; right?: boolean }) {
  return (
    <>
      <ZBox x={x} y={YM} w={16} h={36} color={color} />
      <Lbl x={x + (right ? 12 : -12)} y={YM + 4} s={label} color={tcolor} anchor={right ? 'start' : 'end'} cls="w54-tag" />
    </>
  );
}

/** the load at a-b (x = its branch), or nothing */
function Load({ x, xPort, Z }: { x: number; xPort: number; Z: Cx | null }) {
  if (!Z) return null;
  return (
    <Obj id="zload" box={[xPort + 4, YT - 26, x - xPort + 70, YG - YT + 30]}>
      <Wire d={`M ${xPort} ${YT} H ${x} M ${xPort} ${YG} H ${x}`} />
      <VBranch x={x}>
        <VZ x={x} label={`Z_L = ${fmtC(Z, 0)} Ω`} color={C.dep} tcolor={C.depT} />
      </VBranch>
    </Obj>
  );
}

function SrcT({ step }: { step: number }) {
  const XX = 262; // node x
  const right = (
    <>
      <Obj id="st_vx" box={[XX - 14, YT - 30, 28, 36]}>
        <Dot x={XX} y={YT} color={C.node} r={4} />
        <Lbl x={XX} y={YT - 12} s="V_x" color={C.node} />
      </Obj>
      <Obj id="st_i2" box={[312 - 20, YT + 10, 76, YG - YT - 20]}>
        <VBranch x={312}>
          <ISrc x={312} y={YM} dir="up" color={C.w2} />
          <Lbl x={330} y={YM + 4} s="I_2" color={C.w2T} anchor="start" cls="w54-tag" />
          <Lbl x={330} y={YM + 17} s="2∠90° A" color={C.w2T} anchor="start" cls="w54-tick" />
        </VBranch>
      </Obj>
      <Obj id="st_r3" box={[400 - 14, YT + 10, 40, YG - YT - 20]}>
        <VBranch x={400}>
          <Res x1={400} y1={YM - 18} x2={400} y2={YM + 18} />
          <Lbl x={412} y={YM + 4} s="R_3" color={C.resT} anchor="start" cls="w54-tag" />
          <Lbl x={412} y={YM + 17} s="8 Ω" color={C.resT} anchor="start" cls="w54-tick" />
        </VBranch>
      </Obj>
      <Wire d={`M ${XX} ${YT} H 400`} />
    </>
  );
  if (step === 0)
    return (
      <g>
        <GndBus x1={30} x2={400} />
        <Obj id="st_vs" box={[10, YT + 10, 60, YG - YT - 20]}>
          <VBranch x={30} gap={15}>
            <VSrc x={30} y={YM} />
            <Lbl x={30} y={YG + 22} s="V_s = 24∠0° V" color={C.dcT} cls="w54-tag" anchor="start" />
          </VBranch>
        </Obj>
        <Wire d={`M 30 ${YT} H 60 M 100 ${YT} H 182 M 238 ${YT} H ${XX}`} />
        <Obj id="st_r1" box={[56, YT - 26, 48, 34]}>
          <Res x1={60} y1={YT} x2={100} y2={YT} />
          <Lbl x={80} y={YT - 13} s="R_1 = 6 Ω" color={C.resT} cls="w54-tag" />
        </Obj>
        <Obj id="st_zc" box={[130 - 14, YT + 10, 76, YG - YT - 20]}>
          <VBranch x={130}>
            <VZ x={130} label="Z_C = −j6 Ω" color={C.cap} tcolor={C.capT} />
          </VBranch>
        </Obj>
        <Obj id="st_zser" box={[180, YT - 26, 60, 36]}>
          <HZ x1={182} x2={238} label="Z_ser = 5+j3 Ω" />
        </Obj>
        {right}
      </g>
    );
  if (step === 1)
    return (
      <g>
        <GndBus x1={40} x2={400} />
        <Obj id="st_src" box={[22, YT + 10, 40, YG - YT - 20]}>
          <VBranch x={40}>
            <ISrc x={40} y={YM} dir="up" color={C.dc} />
          </VBranch>
          <Lbl x={40} y={YG + 22} s="I_s1 = V_s/R_1 = 4∠0° A" color={C.dcT} cls="w54-tag" anchor="start" />
        </Obj>
        <Obj id="st_step" box={[100 - 14, YT + 10, 76, YG - YT - 20]}>
          <VBranch x={110}>
            <VZ x={110} label="R_1 ∥ Z_C" />
            <Lbl x={122} y={YM + 17} s="= 3 − j3 Ω" color={C.zT} anchor="start" cls="w54-tick" />
          </VBranch>
        </Obj>
        <Wire d={`M 40 ${YT} H 182 M 238 ${YT} H ${XX}`} />
        <Obj id="st_zser" box={[180, YT - 26, 60, 36]}>
          <HZ x1={182} x2={238} label="Z_ser = 5+j3 Ω" />
        </Obj>
        {right}
      </g>
    );
  if (step === 2)
    return (
      <g>
        <GndBus x1={40} x2={400} />
        <Obj id="st_src" box={[22, YT + 10, 40, YG - YT - 20]}>
          <VBranch x={40} gap={15}>
            <VSrc x={40} y={YM} />
          </VBranch>
          <Lbl x={30} y={YG + 22} s="V_eq1 = I_s1 Z_eq1 = 12 − j12 V" color={C.dcT} cls="w54-tag" anchor="start" />
        </Obj>
        <Wire d={`M 40 ${YT} H 100 M 220 ${YT} H ${XX}`} />
        <Obj id="st_step" box={[96, YT - 26, 128, 52]}>
          <ZBox x={130} y={YT} w={56} h={16} />
          <ZBox x={190} y={YT} w={56} h={16} />
          <Wire d={`M 158 ${YT} H 162`} />
          <Lbl x={130} y={YT - 13} s="3 − j3" color={C.zT} cls="w54-tag" />
          <Lbl x={190} y={YT - 13} s="5 + j3" color={C.zT} cls="w54-tag" />
          <Lbl x={160} y={YT + 24} s="Z_left = 8 Ω（虚部抵消）" color={C.w1T} cls="w54-tag" />
        </Obj>
        {right}
      </g>
    );
  return (
    <g>
      <GndBus x1={40} x2={400} />
      <Obj id="st_src" box={[22, YT + 10, 40, YG - YT - 20]}>
        <VBranch x={40}>
          <ISrc x={40} y={YM} dir="up" color={C.dc} />
        </VBranch>
        <Lbl x={20} y={YG + 22} s="I_left = V_eq1/Z_left = 1.5 − j1.5 A" color={C.dcT} cls="w54-tag" anchor="start" />
      </Obj>
      <Obj id="st_step" box={[100 - 14, YT + 10, 76, YG - YT - 20]}>
        <VBranch x={110}>
          <VZ x={110} label="Z_left" />
          <Lbl x={122} y={YM + 17} s="= 8 Ω" color={C.zT} anchor="start" cls="w54-tick" />
        </VBranch>
      </Obj>
      <Wire d={`M 40 ${YT} H ${XX}`} />
      <Lbl x={190} y={YT - 12} s="I_tot = 1.5 + j0.5 A · Z_tot = 8 ∥ 8 = 4 Ω" color={C.w1T} cls="w54-tick" />
      {right}
    </g>
  );
}

function Orig3({ Z }: { Z: Cx | null }) {
  const XA = 270;
  return (
    <g>
      <GndBus x1={30} x2={XA} />
      <Obj id="th_vs" box={[10, YT + 10, 40, YG - YT - 20]}>
        <VBranch x={30} gap={15}>
          <VSrc x={30} y={YM} />
        </VBranch>
        <Lbl x={10} y={YG + 22} s="V_s = 50∠0° V" color={C.dcT} cls="w54-tag" anchor="start" />
      </Obj>
      <Wire d={`M 30 ${YT} H 56 M 116 ${YT} H 160 M 196 ${YT} H ${XA}`} />
      <Obj id="th_z1" box={[52, YT - 26, 68, 36]}>
        <HZ x1={56} x2={116} label="Z_1 = 6 − j8 Ω" />
      </Obj>
      <Obj id="th_z2" box={[132 - 14, YT + 10, 60, YG - YT - 20]}>
        <VBranch x={132}>
          <VZ x={132} label="Z_2 = j10 Ω" color={C.ind} tcolor={C.indT} />
        </VBranch>
      </Obj>
      <Dot x={132} y={YT} />
      <Lbl x={132} y={YT - 12} s="1" color={C.muted} cls="w54-tick" />
      <Obj id="th_r2" box={[156, YT - 26, 44, 34]}>
        <Res x1={160} y1={YT} x2={196} y2={YT} />
        <Lbl x={178} y={YT - 13} s="R_2 = 4 Ω" color={C.resT} cls="w54-tag" />
      </Obj>
      <Obj id="th_is" box={[226 - 18, YT + 10, 40, YG - YT - 20]}>
        <VBranch x={226}>
          <ISrc x={226} y={YM} dir="up" color={C.w2} />
        </VBranch>
        <Lbl x={226} y={YG + 22} s="I_s = 2∠90° A" color={C.w2T} cls="w54-tag" />
      </Obj>
      <Obj id="port_ab" box={[XA - 8, YT - 10, 30, YG - YT + 20]}>
        <Port x={XA} y={YT} name="a" />
        <Port x={XA} y={YG} name="b" below />
      </Obj>
      <Load x={340} xPort={XA} Z={Z} />
      {!Z && <PortNote x={330} />}
    </g>
  );
}

function PortNote({ x }: { x: number }) {
  return (
    <>
      <Lbl x={x} y={YM - 4} s="端口开路" color={C.muted} cls="w54-tag" />
      <Lbl x={x} y={YM + 10} s="V_ab = V_Th" color={C.muted} cls="w54-tag" />
    </>
  );
}

function Thev({ Z }: { Z: Cx | null }) {
  const XA = 230;
  return (
    <g>
      <GndBus x1={60} x2={XA} />
      <Obj id="vth" box={[40, YT + 10, 40, YG - YT - 20]}>
        <VBranch x={60} gap={15}>
          <VSrc x={60} y={YM} />
        </VBranch>
        <Lbl x={20} y={YG + 22} s={`V_Th = ${fmtP(S3.Vth, 2, 'V')}`} color={C.dcT} cls="w54-tag" anchor="start" />
      </Obj>
      <Wire d={`M 60 ${YT} H 110 M 186 ${YT} H ${XA}`} />
      <Obj id="zth" box={[106, YT - 26, 84, 36]}>
        <HZ x1={110} x2={186} label={`Z_Th = ${fmtC(S3.Zth, 0)} Ω`} />
      </Obj>
      <Obj id="port_ab" box={[XA - 8, YT - 10, 30, YG - YT + 20]}>
        <Port x={XA} y={YT} name="a" />
        <Port x={XA} y={YG} name="b" below />
      </Obj>
      <Load x={310} xPort={XA} Z={Z} />
      {!Z && <PortNote x={300} />}
    </g>
  );
}

function Nort({ Z }: { Z: Cx | null }) {
  const XA = 230;
  return (
    <g>
      <GndBus x1={60} x2={XA} />
      <Obj id="in_n" box={[40, YT + 10, 40, YG - YT - 20]}>
        <VBranch x={60}>
          <ISrc x={60} y={YM} dir="up" color={C.w2} />
        </VBranch>
        <Lbl x={20} y={YG + 22} s={`I_N = ${fmtP(S3.In, 2, 'A')}`} color={C.w2T} cls="w54-tag" anchor="start" />
      </Obj>
      <Wire d={`M 60 ${YT} H ${XA}`} />
      <Obj id="zth" box={[140 - 14, YT + 10, 80, YG - YT - 20]}>
        <VBranch x={140}>
          <VZ x={140} label={`Z_N = ${fmtC(S3.Zth, 0)} Ω`} />
        </VBranch>
      </Obj>
      <Obj id="port_ab" box={[XA - 8, YT - 10, 30, YG - YT + 20]}>
        <Port x={XA} y={YT} name="a" />
        <Port x={XA} y={YG} name="b" below />
      </Obj>
      <Load x={310} xPort={XA} Z={Z} />
      {!Z && <PortNote x={300} />}
    </g>
  );
}

function Test4({ step }: { step: 'A' | 'B' }) {
  const XA = 300;
  const B = step === 'B';
  return (
    <g>
      <GndBus x1={30} x2={XA} />
      <Obj id="t4_vs" box={[10, YT + 10, 40, YG - YT - 20]}>
        {B ? (
          <>
            <Wire d={`M 30 ${YT} V ${YM - 18} M 30 ${YM + 18} V ${YG}`} />
            <Short x1={30} y1={YM - 18} x2={30} y2={YM + 18} label="V_s=0 短路" lx={36} ly={YM + 4} />
          </>
        ) : (
          <VBranch x={30} gap={15}>
            <VSrc x={30} y={YM} />
          </VBranch>
        )}
        <Lbl x={10} y={YG + 22} s={B ? 'V_s 置零（短路）' : 'V_s = 12∠0° V'} color={C.dcT} cls="w54-tag" anchor="start" />
      </Obj>
      <Wire d={`M 30 ${YT} H 62 M 98 ${YT} H 176 M 224 ${YT} H ${XA}`} />
      <Obj id="t4_r1" box={[58, YT - 26, 44, 34]}>
        <Res x1={62} y1={YT} x2={98} y2={YT} />
        <Lbl x={80} y={YT - 13} s="R_1 = 4 Ω" color={C.resT} cls="w54-tag" />
      </Obj>
      <Obj id="vx_ctrl" box={[134 - 14, YT - 30, 80, YG - YT + 20]}>
        <VBranch x={134}>
          <VZ x={134} label="−j4 Ω" color={C.cap} tcolor={C.capT} />
          <Lbl x={122} y={YM - 22} s="+" color={C.depT} anchor="end" cls="w54-tag" />
          <Lbl x={122} y={YM + 4} s="V_x" color={C.depT} anchor="end" cls="w54-tag" />
          <Lbl x={122} y={YM + 30} s="−" color={C.depT} anchor="end" cls="w54-tag" />
        </VBranch>
        <Dot x={134} y={YT} />
        <Lbl x={134} y={YT - 12} s="1" color={C.muted} cls="w54-tick" />
      </Obj>
      <Obj id="t4_zl" box={[172, YT - 26, 56, 36]}>
        <HZ x1={176} x2={224} label="Z_L = j4 Ω" color={C.ind} tcolor={C.indT} />
      </Obj>
      <Obj id="dep_src" box={[250 - 22, YT + 10, 50, YG - YT - 20]}>
        <VBranch x={250}>
          <ISrc x={250} y={YM} dir="up" color={C.dep} dep />
        </VBranch>
        <Lbl x={250} y={YG + 22} s={B ? '0.5V_x（保留！）' : '0.5V_x'} color={C.depT} cls="w54-tag" />
      </Obj>
      <Obj id="port_ab" box={[XA - 8, YT - 10, 30, YG - YT + 20]}>
        <Port x={XA} y={YT} name="a" />
        <Port x={XA} y={YG} name="b" below />
      </Obj>
      {B ? (
        <Obj id="test_src" box={[XA + 10, YT - 26, 110, YG - YT + 40]}>
          <Wire d={`M ${XA} ${YT} H 362 M ${XA} ${YG} H 362`} />
          <VBranch x={362} gap={15}>
            <VSrc x={362} y={YM} color={C.test} text={C.testT} />
          </VBranch>
          <Lbl x={380} y={YM + 4} s="V_t" color={C.testT} anchor="start" cls="w54-tag" />
          <Lbl x={380} y={YM + 17} s="1∠0° V" color={C.testT} anchor="start" cls="w54-tick" />
          <Obj id="it" box={[312, YT - 24, 48, 20]}>
            <line x1={352} y1={YT - 10} x2={322} y2={YT - 10} stroke={C.test} strokeWidth={2.2} />
            <polygon points={`318,${YT - 10} 326,${YT - 14.5} 326,${YT - 5.5}`} fill={C.test} />
            <Lbl x={336} y={YT - 15} s="I_t" color={C.testT} cls="w54-tag" />
          </Obj>
        </Obj>
      ) : (
        <>
          <Lbl x={370} y={YM - 4} s="端口开路" color={C.muted} cls="w54-tag" />
          <Bubble x={370} y={YM + 14} text="V_oc = V_Th" color={C.dcT} />
        </>
      )}
    </g>
  );
}

/** impedance triangle of Z = R + jX, in the free corner under the drawing (bottom right) */
function Triangle({ z }: { z: Cx }) {
  const R = z.re;
  const X = z.im;
  const m = Math.max(Math.abs(R), Math.abs(X));
  const k = 44 / m;
  const bx = 300;
  const by = 182;
  const x0 = bx + 10;
  const ind = X >= 0;
  const y0 = ind ? by + 60 : by + 14;
  const x1 = x0 + R * k;
  const y1 = y0 - X * k;
  const col = ind ? C.indT : C.capT;
  return (
    <Obj id="z_tri" box={[bx - 2, by - 2, 136, 80]}>
      <rect x={bx} y={by} width={132} height={76} rx={8} fill="#fff" stroke="#e3d8c2" />
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.res} strokeWidth={2.4} />
      <line x1={x1} y1={y0} x2={x1} y2={y1} stroke={ind ? C.ind : C.cap} strokeWidth={2.4} />
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.z} strokeWidth={2.4} />
      <Lbl x={(x0 + x1) / 2} y={y0 + (ind ? 11 : -4)} s={`R=${fmt(R, 0)}`} color={C.resT} cls="w54-tick" />
      <Lbl x={ind ? x1 + 3 : x1} y={ind ? (y0 + y1) / 2 + 3 : y1 + 11} s={`X=${fmt(X, 0)}`} color={col} anchor={ind ? 'start' : 'middle'} cls="w54-tick" />
      {[`|Z_Th|`, `= ${fmt(abs(z), 2)} Ω`, `θ=${fmt(argDeg(z), 2)}°`, ind ? '感性' : '容性'].map((t, i) => (
        <Lbl key={i} x={bx + 128} y={by + 14 + i * 14} s={t} color={i < 2 ? C.zT : col} anchor="end" cls="w54-tick" />
      ))}
    </Obj>
  );
}
