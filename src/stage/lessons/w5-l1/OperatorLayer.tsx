// Layer 03 · 复平面微积分旋转 (×jω / ÷jω) 演示台. A phasor I = |I|∠φ and what the two calculus
// operators make of it: d/dt ↔ ×jω turns it +90° (counter-clockwise) and stretches it ω times;
// ∫dt ↔ ÷jω turns it −90° and scales it by 1/ω. "方程拼合" takes a ∫ / d/dt equation
// a·x + b∫x dt + c·dx/dt = V_m cos(ωt + φ_s) into the phasor domain: its three terms for the trial
// phasor (the sliders) are laid tip to tail and compared with the source phasor; they close onto it
// exactly at the solution X = V_s / D. Two equations: example 5.1 of act 5, and the guided example,
// whose numbers stay covered until the guided steps reach them (stage param w51_g = steps solved).

import type { ReactNode } from 'react';
import { DEG, EX51, GUIDED, abs, add, argDeg, fmt, fmtAng, fmtMag, fmtPolar, fmtRect, polar, solveEq, sub, terms, type Cx, type PhasorEq } from './model';
import { C, Cell, Lbl, Obj, P, Seg, Slider, Vec, ArcArrow, useClearHoverOnUnmount, useParam, type EqPreset, type OpMode } from './parts';
import './w5l1.css';

const OX = 158;
const OY = 134;
const RMAX = 96;
const PX = 314; // the side panel

const MODES: { id: OpMode; label: string; short: string }[] = [
  { id: 'base', label: '原相量 I', short: 'I' },
  { id: 'diff', label: '求导 jωI (+90°)', short: '×jω' },
  { id: 'int', label: '积分 I/(jω) (−90°)', short: '÷jω' },
  { id: 'all', label: '三矢量同屏对比', short: '三矢量' },
];
const EQS: { id: EqPreset; label: string; short: string }[] = [
  { id: 'off', label: '不拼合', short: '不拼合' },
  { id: 'ex51', label: '方程拼合 · 例题 5.1', short: '例 5.1' },
  { id: 'guided', label: '方程拼合 · 引导例题', short: '引导题' },
];

const EQ: Record<Exclude<EqPreset, 'off'>, { e: PhasorEq; sym: string; unit: string; text: string[] }> = {
  ex51: { e: EX51, sym: 'I', unit: 'A', text: ['4i + 8∫i dt − 3 di/dt', '= 50cos(2t + 75°)'] },
  guided: { e: GUIDED, sym: 'V', unit: 'V', text: ['2 dv/dt + 6v', '= 20sin(4t + 30°)'] },
};

const timeText = (sym: string, X: Cx, w: number, unit: string) => {
  const a = argDeg(X);
  return `${sym.toLowerCase()}(t) = ${fmtMag(abs(X))}cos(${fmt(w)}t ${a < 0 ? '−' : '+'} ${fmt(Math.abs(a), 2)}°) ${unit}`;
};

export default function OperatorLayer() {
  useClearHoverOnUnmount();
  const [wc, setWc] = useParam<number>(P.wc, 2);
  const [ia, setIa] = useParam<number>(P.ia, 4);
  const [ip, setIp] = useParam<number>(P.ip, 30);
  const [mode, setMode] = useParam<OpMode>(P.mode, 'all');
  const [eqId, setEq] = useParam<EqPreset>(P.eq, 'off');
  const [g, setG] = useParam<number>(P.g, 0);
  const eq = eqId === 'off' ? null : EQ[eqId];
  const isG = eqId === 'guided';
  const seen = (n: number) => !isG || g >= n;
  const w = eq ? eq.e.omega : wc;
  const sym = eq ? eq.sym : 'I';
  const unit = eq ? eq.unit : 'A';
  const X = polar(ia, ip);

  let drawing: ReactNode;
  let cells: ReactNode;
  let panel: string[];

  if (!eq) {
    const D = polar(ia * w, ip + 90);
    const I = polar(ia / w, ip - 90);
    const show = { diff: mode === 'diff' || mode === 'all', int: mode === 'int' || mode === 'all' };
    const k = RMAX / Math.max(ia, show.diff ? ia * w : 0, show.int ? ia / w : 0);
    const p = (z: Cx) => ({ x: OX + z.re * k, y: OY - z.im * k });
    const b = p(X);
    const d = p(D);
    const n = p(I);
    const ra = Math.min(34, Math.max(16, ia * k * 0.5));
    drawing = (
      <>
        {show.diff && (
          <Obj id="op_rot_p">
            <ArcArrow cx={OX} cy={OY} r={ra + 6} a0={ip + 4} a1={ip + 86} color={C.rose} w={1.8} dashed />
            <Lbl x={OX + (ra + 18) * Math.cos((ip + 45) * DEG)} y={OY - (ra + 18) * Math.sin((ip + 45) * DEG) + 4} s="+90°" color={C.roseT} cls="w51-tick strong" />
          </Obj>
        )}
        {show.int && (
          <Obj id="op_rot_m">
            <ArcArrow cx={OX} cy={OY} r={ra} a0={ip - 4} a1={ip - 86} color={C.amber} w={1.8} dashed />
            <Lbl x={OX + (ra + 12) * Math.cos((ip - 45) * DEG)} y={OY - (ra + 12) * Math.sin((ip - 45) * DEG) + 4} s="−90°" color={C.amberT} cls="w51-tick strong" />
          </Obj>
        )}
        <Obj id="op_base" hit={`M ${OX} ${OY} L ${b.x} ${b.y}`}>
          <Vec x0={OX} y0={OY} x1={b.x} y1={b.y} color={C.vec} w={3} />
          <VecLabel at={b} s="I" color={C.vecT} />
        </Obj>
        {show.diff && (
          <Obj id="op_diff" hit={`M ${OX} ${OY} L ${d.x} ${d.y}`}>
            <Vec x0={OX} y0={OY} x1={d.x} y1={d.y} color={C.rose} w={3} />
            <VecLabel at={d} s="jωI（求导）" color={C.roseT} />
          </Obj>
        )}
        {show.int && (
          <Obj id="op_int" hit={`M ${OX} ${OY} L ${n.x} ${n.y}`}>
            <Vec x0={OX} y0={OY} x1={n.x} y1={n.y} color={C.amber} w={3} />
            <VecLabel at={n} s="I/(jω)（积分）" color={C.amberT} />
          </Obj>
        )}
      </>
    );
    cells = (
      <>
        <Cell id="op_base" k="原相量 I" v={`${fmtMag(ia)}∠${fmtAng(ip)} A`} tone={C.vecT} />
        <Cell id="op_diff" k="求导 jωI" v={`${fmtMag(ia * w)}∠${fmtAng(argDeg(D))} A/s`} tone={C.roseT} />
        <Cell id="op_int" k="积分 I/(jω)" v={`${fmtMag(ia / w)}∠${fmtAng(argDeg(I))} A·s`} tone={C.amberT} />
        <Cell id="op_rot_p" k="jω" v={`${fmt(w)}∠+90°`} />
      </>
    );
    panel = ['d/dt ↔ ×jω', '模 ×ω，角 +90°', '∫dt ↔ ÷jω', '模 ×1/ω，角 −90°', 'j = 1∠+90°', '1/j = −j = 1∠−90°'];
  } else {
    const { D, Vs, X: sol } = solveEq(eq.e);
    const ts = terms(eq.e, X);
    const names = [`${fmt(eq.e.a)}${sym}`, `${fmt(eq.e.b)}${sym}/(jω)`, `${eq.e.c < 0 ? '−' : ''}${fmt(Math.abs(eq.e.c))}·jω${sym}`];
    const cols = [C.vec, C.amber, C.rose];
    const chainOn = seen(2);
    const pts: Cx[] = [{ re: 0, im: 0 }];
    ts.forEach((t, i) => {
      if (abs(t) > 1e-12 || i === 0) pts.push(add(pts[pts.length - 1], t));
    });
    const used = ts.map((t, i) => (abs(t) > 1e-12 || i === 0 ? i : -1)).filter((i) => i >= 0);
    const lhs = pts[pts.length - 1];
    const gap = abs(sub(lhs, Vs));
    const closed = gap < 0.01 * abs(Vs);
    const all = [...(chainOn ? pts : []), ...(seen(1) ? [Vs] : [])];
    const k = RMAX / Math.max(1e-9, ...all.map(abs));
    const p = (z: Cx) => ({ x: OX + z.re * k, y: OY - z.im * k });
    drawing = (
      <>
        {seen(1) && (
          <Obj id="eq_src" hit={`M ${OX} ${OY} L ${p(Vs).x} ${p(Vs).y}`}>
            <Vec x0={OX} y0={OY} x1={p(Vs).x} y1={p(Vs).y} color={C.proj} w={5} />
            <VecLabel at={p(Vs)} s={`V_s = ${fmtPolar(Vs)}`} color={C.projT} />
          </Obj>
        )}
        {chainOn && (
          <Obj id="eq_chain">
            {used.map((ti, j) => {
              const a = p(pts[j]);
              const b = p(pts[j + 1]);
              return (
                <g key={ti}>
                  <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} className="w51-hit" />
                  <Vec x0={a.x} y0={a.y} x1={b.x} y1={b.y} color={cols[ti]} w={2.6} />
                  <Lbl
                    x={(a.x + b.x) / 2 + 4}
                    y={(a.y + b.y) / 2 - 4}
                    s={names[ti]}
                    color={cols[ti] === C.vec ? C.vecT : cols[ti] === C.amber ? C.amberT : C.roseT}
                    cls="w51-tick strong"
                    anchor="start"
                  />
                </g>
              );
            })}
            {!closed && seen(1) && <line x1={p(lhs).x} y1={p(lhs).y} x2={p(Vs).x} y2={p(Vs).y} stroke={C.violet} strokeWidth={1.4} strokeDasharray="3 3" />}
            <circle cx={p(lhs).x} cy={p(lhs).y} r={3.4} fill={closed ? C.proj : C.violet} />
            {closed && <Lbl x={p(lhs).x} y={p(lhs).y + 18} s="拼合闭合：左边 = 激励" color={C.projT} cls="w51-tick strong" />}
          </Obj>
        )}
      </>
    );
    const q = (n: number, s: string) => (seen(n) ? s : '?');
    cells = (
      <>
        <Cell id="eq_src" k="激励相量 V_s" v={q(1, `${fmtPolar(Vs)} V`)} tone={C.projT} opt />
        <Cell id="eq_d" k="D = a + j(ωc − b/ω)" v={q(2, fmtRect(D))} opt />
        <Cell id="eq_d" k="D 极坐标" v={q(3, fmtPolar(D))} />
        <Cell id="eq_sol" k={`解 ${sym} = V_s/D`} v={q(4, `${fmtPolar(sol)} ${unit}`)} tone={C.vecT} />
        <Cell id="eq_sol" k="时域稳态解" v={q(5, timeText(sym, sol, w, unit))} tone={C.vecT} />
        <Cell id="eq_chain" k="拼合残差" v={chainOn && seen(1) ? fmtMag(gap) : '?'} tone={C.violetT} />
      </>
    );
    panel = [...eq.text, `ω = ${fmt(w)} rad/s`, seen(1) ? `V_s = ${fmtPolar(Vs)}` : 'V_s = ?', seen(2) ? `D = ${fmtRect(D)}` : 'D = ?', `试探 ${sym} = 滑块`];
  }

  const solveNow = () => {
    if (!eq) return;
    const s = solveEq(eq.e).X;
    setIa(Number(abs(s).toFixed(4)));
    setIp(Number(argDeg(s).toFixed(2)));
  };

  return (
    <div className="w51-layer">
      <div className="w51-controls">
        {!eq && <Seg label="算子开关" value={mode} options={MODES} onChange={setMode} />}
        <Seg label="方程拼合" value={eqId} options={EQS} onChange={setEq} />
        {eq && (
          <button className="w51-btn" onClick={solveNow} disabled={!seen(4)}>
            <span className="full">
              代入解 {sym} = V<sub>s</sub>/D
            </span>
            <span className="short">代入解</span>
          </button>
        )}
        {isG && g < 5 && (
          <button className="w51-btn ghost" onClick={() => setG(5)}>
            <span className="full">揭晓数值（先自己做第 6 幕引导例题）</span>
            <span className="short">揭晓</span>
          </button>
        )}
      </div>
      <div className="w51-controls">
        {!eq && <Slider id="op_rot_p" label="角频率 ω" short="ω" min={0.5} max={10} step={0.5} value={w} onChange={setWc} text={`${fmt(w)} rad/s`} />}
        <Slider id="op_base" label={eq ? `试探 |${sym}|` : '幅值 |I|'} short={`|${sym}|`} min={1} max={10} step={0.5} value={ia} onChange={setIa} text={`${fmtMag(ia)} ${unit}`} />
        <Slider id="op_base" label={eq ? `试探相角` : '相角 φ'} short="φ" min={-180} max={180} step={5} value={ip} onChange={setIp} text={fmtAng(ip, true)} />
      </div>

      <div className="w51-svgwrap">
        <svg
          viewBox="0 0 460 250"
          className="w51-svg"
          role="img"
          aria-label={eq ? `方程拼合：${eq.text.join(' ')}` : `微积分旋转：I = ${fmtMag(ia)}∠${fmtAng(ip)}，ω = ${fmt(w)} rad/s`}
        >
          <rect x="1" y="1" width="458" height="248" rx="10" className="w51-bg" />
          <Lbl x={12} y={17} s={eq ? '复平面 · 各项相量首尾拼合' : '复平面 · ×jω 逆转 90°，÷jω 顺转 90°'} cls="w51-tag" color={C.muted} anchor="start" />
          <line x1={OX - RMAX - 30} y1={OY} x2={OX + RMAX + 30} y2={OY} className="w51-axis" />
          <line x1={OX} y1={OY + RMAX + 12} x2={OX} y2={OY - RMAX - 12} className="w51-axis" />
          <Lbl x={OX + RMAX + 28} y={OY + 13} s="Re" color={C.muted} cls="w51-tick" anchor="end" />
          <Lbl x={OX + 5} y={OY - RMAX - 3} s="Im (j)" color={C.muted} cls="w51-tick" anchor="start" />
          {drawing}
          <rect x={PX} y={30} width={136} height={208} rx={8} className="w51-panel" />
          <text x={PX + 10} y={48} className="w51-lbl" fill={C.ink}>
            {eq ? (isG ? '引导例题' : '例题 5.1') : '降维字典'}
          </text>
          {panel.map((s, i) => (
            <Lbl key={i} x={PX + 10} y={68 + i * 19} s={s} cls="w51-tick strong" color={C.ink} anchor="start" />
          ))}
          {isG && g < 1 && <Lbl x={OX} y={OY - 20} s="引导例题：先完成第 1 步" color={C.muted} cls="w51-lbl" />}
        </svg>
      </div>

      <div className="w51-readout">
        <div className={`w51-rgrid${eq ? ' three' : ''}`}>{cells}</div>
      </div>
    </div>
  );
}

function VecLabel({ at, s, color }: { at: { x: number; y: number }; s: string; color: string }) {
  const right = at.x >= OX;
  return <Lbl x={at.x + (right ? 6 : -6)} y={at.y + (at.y >= OY ? 14 : -5)} s={s} color={color} anchor={right ? 'start' : 'end'} cls="w51-lbl strong" />;
}
