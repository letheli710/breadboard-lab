// W5-L3 layer 03: AC mesh / supermesh analysis. View 1 (act 3, example 2): left mesh V_s, R1, Z_L;
// right mesh Z_C, R2; the current source I_s on the shared branch. Controls: the supermesh loop
// (outer dashed loop, shared branch set aside), the clockwise mesh-current animation, and a Cramer
// stepper over [Z1 Z2; −1 1]·[I1; I2] = [V_s; I_s] (Δ, Δ1 → I1, Δ2 → I2, residual), solved by
// model.ts. View 2 (act 5): the single-frequency check — one circuit with two sources, the second
// at the same ω, at another ω, or DC; the inductor's impedance for each source and the verdict.

import { abs, argDeg, ex2, num, pol, rect, type Cx } from './model';
import {
  C,
  Dot,
  Gnd,
  HSubs,
  ISrc,
  Lbl,
  Obj,
  P_CR,
  P_MV,
  P_SUPER,
  P_TRAP,
  Readout,
  Seg,
  Toggle,
  VSrc,
  Wire,
  ZBox,
  useClearHoverOnUnmount,
  useHot,
  useP,
  type Cell,
  type MeshView,
  type Trap,
} from './parts';
import './w5l3.css';

const E2 = ex2();

const TOP = 62;
const BOT = 188;
const MID = (TOP + BOT) / 2;
const X = { vs: 36, mid: 236, r2: 410 };

const r = (z: Cx) => rect(z);
const both = (z: Cx, unit: string) => `${rect(z)} = ${pol(z)} ${unit}`;

export default function Layer03() {
  useClearHoverOnUnmount();
  const [mv, setMv] = useP<MeshView>(P_MV, 'mesh');
  const [sup, setSup] = useP<boolean>(P_SUPER, true);
  const [anim, setAnim] = useP<boolean>('w53_anim', true);
  const [trap, setTrap] = useP<Trap>(P_TRAP, 'same');
  return (
    <div className="w53-layer">
      <div className="w53-controls">
        <Seg<MeshView>
          label="视图"
          value={mv}
          set={setMv}
          items={[
            { id: 'mesh', label: '超网孔例题 2（第 3 幕）', short: '超网孔' },
            { id: 'trap', label: '同频检查（第 5 幕）', short: '同频检查' },
          ]}
        />
        {mv === 'mesh' ? (
          <>
            <Toggle on={sup} set={setSup} label="超网孔虚线外环" short="超网孔" id="e2_super" />
            <Toggle on={anim} set={setAnim} label="网孔电流动画" short="动画" />
          </>
        ) : (
          <Seg<Trap>
            label="第二个电源"
            value={trap}
            set={setTrap}
            items={[
              { id: 'same', label: 'v₂ = 5sin(50t)', short: '同频' },
              { id: 'diff', label: 'v₂ = 5cos(120t)', short: '异频' },
              { id: 'dc', label: 'v₂ = 5 V 直流', short: '直流' },
            ]}
          />
        )}
      </div>
      {mv === 'mesh' ? <MeshView sup={sup} anim={anim} /> : <TrapView trap={trap} />}
    </div>
  );
}

function MeshView({ sup, anim }: { sup: boolean; anim: boolean }) {
  const [step, setStep] = useP<number>(P_CR, 0);
  const cram = useHot('e2_cramer');
  const lines = [
    ['矩阵（超网孔 KVL + 电流约束）：', `[${r(E2.Z1)}, ${r(E2.Z2)}; −1, 1]·[I_1; I_2] = [${r(E2.Vs)}; ${r(E2.Is)}]`],
    ['主行列式（直角坐标展开）：', `Δ = (${r(E2.Z1)})(1) − (${r(E2.Z2)})(−1) = ${r(E2.D)} = ${pol(E2.D)}`],
    ['Δ_1 换第 1 列：', `Δ_1 = ${r(E2.Vs)}·1 − (${r(E2.Z2)})(${r(E2.Is)}) = ${r(E2.D1)}  →  I_1 = Δ_1/Δ = ${both(E2.I1, 'A')}`],
    ['Δ_2 换第 2 列：', `Δ_2 = (${r(E2.Z1)})(${r(E2.Is)}) − ${r(E2.Vs)}·(−1) = ${r(E2.D2)}  →  I_2 = Δ_2/Δ = ${both(E2.I2, 'A')}`],
    ['残差验算：', `‖A·x − b‖ = ${E2.res.toExponential(1).replace('-', '−')} < 10⁻¹²（KVL 与电流约束都满足）`],
  ];
  const cells: Cell[] = [
    { id: 'e2_m1', label: 'i_1(t)', text: `${num(abs(E2.I1))}cos(5t + ${num(argDeg(E2.I1))}°) A` },
    { id: 'e2_m2', label: 'i_2(t)', text: `${num(abs(E2.I2))}cos(5t − ${num(-argDeg(E2.I2))}°) A` },
  ];
  return (
    <>
      <div className="w53-svgwrap">
        <svg viewBox="0 0 440 236" className="w53-svg" role="img" aria-label="例题 2：交流双网孔与超网孔">
          <rect x="1" y="1" width="438" height="234" rx="10" className="w53-bg" />
          <text x={8} y={18} className="w53-tick" fill={C.muted}>
            频域相量图，ω = 5 rad/s
          </text>
          {/* wires */}
          <Wire d={`M ${X.vs} ${TOP} H 66 M 130 ${TOP} H 150 M 214 ${TOP} H 278 M 342 ${TOP} H ${X.r2} V ${MID - 26} M ${X.r2} ${MID + 26} V ${BOT} H ${X.vs}`} />
          <Dot x={X.mid} y={TOP} />
          <Dot x={X.mid} y={BOT} />

          <Obj id="e2_vs" box={[X.vs - 22, TOP + 14, 64, 92]}>
            <Wire d={`M ${X.vs} ${TOP} V ${MID - 16} M ${X.vs} ${MID + 16} V ${BOT}`} />
            <VSrc x={X.vs} y={MID} />
            <Lbl x={X.vs + 8} y={MID + 36} s="20∠0° V" color={C.src} cls="w53-tag" anchor="start" />
          </Obj>
          <Obj id="e2_r1" box={[64, TOP - 16, 68, 32]}>
            <ZBox x={98} y={TOP} w={64} h={24} fill={C.resFill} stroke={C.res} text={C.resT} label="R_1 = 4 Ω" cls="w53-tag" />
          </Obj>
          <Obj id="e2_l" box={[148, TOP - 16, 68, 32]}>
            <ZBox x={182} y={TOP} w={64} h={24} fill={C.indFill} stroke={C.ind} text={C.indT} label="Z_L = j2 Ω" cls="w53-tag" />
          </Obj>
          <Obj id="e2_c" box={[274, TOP - 16, 72, 32]}>
            <ZBox x={310} y={TOP} w={68} h={24} fill={C.capFill} stroke={C.cap} text={C.capT} label="Z_C = −j4 Ω" cls="w53-tag" />
          </Obj>
          <Obj id="e2_r2" box={[X.r2 - 26, MID - 44, 52, 74]}>
            <ZBox x={X.r2} y={MID} w={40} h={52} fill={C.resFill} stroke={C.res} text={C.resT} label="R_2" sub="2 Ω" cls="w53-tag" />
          </Obj>
          <Obj id="e2_is" box={[X.mid - 22, TOP + 6, 112, 110]}>
            <Wire d={`M ${X.mid} ${TOP} V ${MID - 16} M ${X.mid} ${MID + 16} V ${BOT}`} color={sup ? C.warn : C.wire} dashed={sup} />
            <ISrc x={X.mid} y={MID} color={C.warn} fill="#fff1f2" />
            <Lbl x={X.mid + 12} y={MID - 24} s="I_s = −j4 A" color={C.warnT} cls="w53-tag" anchor="start" />
            <Lbl x={X.mid + 12} y={MID + 36} s="I_2 − I_1 = I_s" color={C.warnT} cls="w53-tag" anchor="start" />
          </Obj>

          {/* mesh currents (clockwise) */}
          <Obj id="e2_m1" box={[108, MID - 30, 64, 64]}>
            <Loop cx={140} cy={MID + 2} r={26} anim={anim} />
            <Lbl x={140} y={MID + 7} s="I_1" color={C.meshT} cls="w53-lbl" />
          </Obj>
          <Obj id="e2_m2" box={[320, MID - 28, 56, 56]}>
            <Loop cx={348} cy={MID} r={22} anim={anim} />
            <Lbl x={348} y={MID + 5} s="I_2" color={C.meshT} cls="w53-lbl" />
          </Obj>

          {sup && (
            <Obj id="e2_super" box={[24, 210, 392, 20]}>
              <rect x={20} y={44} width={400} height={160} rx={14} className="w53-super" />
              <Lbl x={220} y={224} s="超网孔外大环路：Z_1·I_1 + Z_2·I_2 = V_s（公共支路移开）" color={C.supT} cls="w53-tag" />
            </Obj>
          )}
          {!sup && <Gnd x={X.mid} y={BOT + 14} />}
        </svg>
      </div>
      <div className="w53-readout">
        <div className={`w53-stepper${cram.lit ? ' lit' : ''}`} {...cram.on}>
          <button className="w53-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} aria-label="上一步">
            ‹
          </button>
          <div className="w53-step">
            <span className="k">
              克莱姆 {step + 1}/5 · <HSubs s={lines[step][0]} />
            </span>
            <span className="v">
              <HSubs s={lines[step][1]} />
            </span>
          </div>
          <button className="w53-btn" onClick={() => setStep(Math.min(4, step + 1))} disabled={step === 4} aria-label="下一步">
            ›
          </button>
        </div>
        <div className="w53-rgrid two">
          {cells.map((c, i) => (
            <Readout key={i} {...c} />
          ))}
        </div>
      </div>
    </>
  );
}

/** a clockwise mesh-current loop: dashed circle (dashes run when animated), arrowhead going up on the left */
function Loop({ cx, cy, r, anim }: { cx: number; cy: number; r: number; anim: boolean }) {
  return (
    <g>
      <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`} className={`w53-loop${anim ? ' run' : ''}`} />
      <polygon points={`${cx - r},${cy - 7} ${cx - r - 4.5},${cy + 2} ${cx - r + 4.5},${cy + 2}`} fill={C.mesh} />
    </g>
  );
}

const TRAP: Record<Trap, { v2: string; w2: string; zl2: string; ok: boolean }> = {
  same: { v2: 'v₂ = 5sin(50t) V', w2: '50 rad/s', zl2: 'j50L', ok: true },
  diff: { v2: 'v₂ = 5cos(120t) V', w2: '120 rad/s', zl2: 'j120L', ok: false },
  dc: { v2: 'v₂ = 5 V（直流）', w2: '0（直流）', zl2: '0（短路）', ok: false },
};

function TrapView({ trap }: { trap: Trap }) {
  const t = TRAP[trap];
  const col = t.ok ? C.ok : C.warn;
  const colT = t.ok ? '#065f46' : C.warnT;
  const cells: Cell[] = [
    { id: 'trap_v1', label: 'ω_1（v₁）', text: '50 rad/s' },
    { id: 'trap_v2', label: 'ω_2（v₂）', text: t.w2, tone: t.ok ? undefined : 'warn' },
    { id: 'trap_l', label: '电感阻抗', text: t.ok ? 'j50L（唯一）' : `j50L ≠ ${t.zl2}`, tone: t.ok ? undefined : 'warn' },
    { id: 'trap_guard', label: '判定', text: t.ok ? '可画单张相量图' : '必须分频叠加', tone: t.ok ? 'ok' : 'warn' },
  ];
  const Y1 = 70;
  const Y2 = 170;
  const YM = (Y1 + Y2) / 2;
  return (
    <>
      <div className="w53-svgwrap">
        <svg viewBox="0 0 440 236" className="w53-svg" role="img" aria-label={`同频检查：${t.v2}`}>
          <rect x="1" y="1" width="438" height="234" rx="10" className="w53-bg" />
          <Obj id="trap_guard" box={[8, 8, 424, 30]}>
            <rect x={10} y={10} width={420} height={26} rx={7} fill={t.ok ? '#ecfdf5' : '#fef2f2'} stroke={col} strokeWidth={1.6} />
            <text x={220} y={28} className="w53-lbl" textAnchor="middle" fill={colT}>
              {t.ok ? '允许直接画单张相量图（同频 ω₁ = ω₂）' : '严禁画在同一相量图（异频 ω₁ ≠ ω₂）'}
            </text>
          </Obj>
          <Wire d={`M 50 ${Y1} H 130 M 230 ${Y1} H 390 M 50 ${Y2} H 390`} />
          <Obj id="trap_v1" box={[28, Y1 + 10, 70, 80]}>
            <Wire d={`M 50 ${Y1} V ${YM - 17} M 50 ${YM + 17} V ${Y2}`} />
            <VSrc x={50} y={YM} r={17} color={C.ok} fill="#fff" />
            <Lbl x={72} y={YM + 4} s="v₁" color={C.ok} cls="w53-val" anchor="start" />
          </Obj>
          <Obj id="trap_l" box={[128, Y1 - 18, 104, 60]}>
            <ZBox x={180} y={Y1} w={100} h={26} fill={t.ok ? '#fff' : '#fee2e2'} stroke={col} text={colT} label={t.ok ? 'jωL' : `j50L ≠ ${t.zl2}`} />
            <Lbl x={180} y={Y1 + 30} s="L 的阻抗随 ω 变" color={C.muted} cls="w53-tick" />
          </Obj>
          <Wire d={`M 270 ${Y1} V ${YM - 17} M 270 ${YM + 17} V ${Y2}`} />
          <ZBox x={270} y={YM} w={36} h={34} fill="#fff" stroke={col} text={colT} label="R" />
          <Obj id="trap_v2" box={[350, Y1 + 10, 80, 80]}>
            <Wire d={`M 390 ${Y1} V ${YM - 17} M 390 ${YM + 17} V ${Y2}`} />
            <VSrc x={390} y={YM} r={17} color={col} fill="#fff" />
            <Lbl x={368} y={YM + 4} s="v₂" color={colT} cls="w53-val" anchor="end" />
          </Obj>
          <Gnd x={220} y={Y2 + 12} />
          <Wire d={`M 220 ${Y2} V ${Y2 + 4}`} />
          <text x={220} y={204} className="w53-val" textAnchor="middle" fill={colT}>
            v₁ = 10cos(50t) V，{t.v2}
          </text>
          <text x={220} y={222} className="w53-tag" textAnchor="middle" fill={colT}>
            {t.ok ? '结论：全电路唯一 ω = 50 rad/s → 直接用本课节点/网孔法！' : '结论：阻抗不唯一 → 必须移步 W5-L4 叠加定理分频求解！'}
          </text>
        </svg>
      </div>
      <div className="w53-readout">
        <div className="w53-rgrid">
          {cells.map((c, i) => (
            <Readout key={i} {...c} />
          ))}
        </div>
      </div>
    </>
  );
}
