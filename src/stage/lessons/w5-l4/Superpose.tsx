// W5-L4 layer 01 · 多频率叠加按频拆分台: the node v_o with four branches (V0 + R1 + L, v1 + C, R_L,
// i2), drawn as the original mixed circuit or as one of its three single-frequency universes (ω = 0,
// ω1, ω2) with the other sources set to zero (short / open; the "置零源" switch draws them as
// short / open or leaves them faded) and L, C replaced by their impedance at that ω. Under it: the
// time-domain waveform v_o(t) = v_o0 + v_o1(t) + v_o2(t) with a time cursor, and the two rotating
// phasors V_o1 e^{jω1 t}, V_o2 e^{jω2 t}: they turn at different speeds, so only their projections
// (Re{·}, the time-domain values) are added — never the phasors themselves. Circuits: act 1's
// example 1 and the guided example of act 6, whose numbers stay covered until the example reaches
// them (stage param w54_g = steps solved).

import { useEffect, useMemo, useRef, useState } from 'react';
import { EX1, GUIDED, fmt, fmtC, fmtP, solveSup, supAt, timeValue, type SupCircuit, type SupSolution } from './model';
import {
  AcSrc,
  Bubble,
  C,
  Cap,
  Cell,
  Dot,
  Gnd,
  ISrc,
  Ind,
  Lbl,
  Mask,
  Obj,
  Open,
  P,
  Res,
  Seg,
  Short,
  Toggle,
  VSrc,
  Wire,
  useClearHoverOnUnmount,
  useP,
  type SupPreset,
  type Uni,
} from './parts';
import './w5l4.css';

const CIRC: Record<SupPreset, SupCircuit> = { ex1: EX1, guided: GUIDED };
const SOL: Record<SupPreset, SupSolution> = { ex1: solveSup(EX1), guided: solveSup(GUIDED) };
const TMAX = 2 * Math.PI;

const UNIS: { id: Uni; text: string; short: string; hot: string }[] = [
  { id: 'all', text: '原电路 · 时域合成', short: '合成', hot: 'wave_total' },
  { id: 'dc', text: '① 直流 ω₀=0', short: '①DC', hot: 'uni_dc' },
  { id: 'w1', text: '② ω₁', short: '②ω₁', hot: 'uni_w1' },
  { id: 'w2', text: '③ ω₂', short: '③ω₂', hot: 'uni_w2' },
];

// schematic geometry
const YT = 34; // top bus
const YG = 100; // ground bus
const XA = 30; // V0 branch
const XN = 150; // node v_o
const XB = 170; // v1 + C branch
const XR = 290; // R_L
const XD = 370; // i2

/** what may be shown of the guided example */
interface Seen {
  dc: boolean;
  w1: boolean;
  w2: boolean;
  all: boolean;
}

function useSeen(preset: SupPreset): Seen {
  const [g] = useP<number>(P.g, 0);
  if (preset !== 'guided') return { dc: true, w1: true, w2: true, all: true };
  return { dc: g >= 2, w1: g >= 3, w2: g >= 4, all: g >= 5 };
}

export default function Superpose() {
  useClearHoverOnUnmount();
  const [preset, setPreset] = useP<SupPreset>(P.sup, 'ex1');
  const [uni, setUni] = useP<Uni>(P.uni, 'all');
  const [kill, setKill] = useP<boolean>(P.kill, true);
  const [t, setT] = useP<number>(P.t, 0.6);
  const [g, setG] = useP<number>(P.g, 0);
  const [playing, setPlaying] = useState(false);
  const c = CIRC[preset];
  const s = SOL[preset];
  const seen = useSeen(preset);
  const masked = preset === 'guided' && g < 5;

  // play: the time cursor sweeps 0 … 2π s in real time
  const tRef = useRef(t);
  tRef.current = t;
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setT((tRef.current + dt * 0.8) % TMAX);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, setT]);

  const v = supAt(s, t);
  const q = (ok: boolean, x: number) => (ok ? `${fmt(x, 2)} V` : '? V');

  return (
    <div className="w54-layer">
      <div className="w54-controls">
        <Seg<SupPreset>
          label="电路"
          value={preset}
          onChange={setPreset}
          options={[
            { id: 'ex1', text: '例题 1（ω₂=5）', short: '例1' },
            { id: 'guided', text: '引导例题（ω₂=4）', short: '引导' },
          ]}
        />
        <Seg<Uni> label="频率子宇宙" value={uni} onChange={setUni} options={UNIS} />
      </div>
      <div className="w54-controls">
        <Toggle on={kill} onChange={setKill}>
          <span className="full">置零源画成短路/开路</span>
          <span className="short">短路/开路</span>
        </Toggle>
        <label className="w54-slider">
          <span>
            t = <b>{fmt(t, 2)}</b> s
          </span>
          <input type="range" min={0} max={TMAX} step={0.01} value={t} onChange={(e) => setT(Number(e.target.value))} aria-label="时间 t" />
        </label>
        <button className="w54-btn" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
          {playing ? '暂停' : '播放'}
        </button>
      </div>

      <div className="w54-svgwrap">
        <svg viewBox="0 0 440 250" className="w54-svg" role="img" aria-label={`多频率叠加：${UNIS.find((u) => u.id === uni)!.text}`}>
          <rect x="1" y="1" width="438" height="248" rx="10" className="w54-bg" />
          <Schematic c={c} s={s} uni={uni} kill={kill} seen={seen} />
          <Waves s={s} uni={uni} t={t} seen={seen} />
          <Phasors s={s} uni={uni} t={t} seen={seen} />
        </svg>
      </div>

      <div className="w54-readout">
        <div className="w54-rgrid">
          <Cell id="wave_dc" k="v_o0（直流）" v={q(seen.dc, v.dc)} tone={C.dcT} />
          <Cell id="wave_w1" k={`v_o1(t) · ω₁=${s.w1}`} v={q(seen.w1, v.w1)} tone={C.w1T} />
          <Cell id="wave_w2" k={`v_o2(t) · ω₂=${s.w2}`} v={q(seen.w2, v.w2)} tone={C.w2T} />
          <Cell id="wave_total" k="v_o(t) = 三者之和" v={q(seen.all, v.total)} tone={C.ink} />
        </div>
        {masked && (
          <div className="w54-readout-foot">
            <button className="w54-btn" onClick={() => setG(5)}>
              揭晓数值（第 6 幕引导例题，先自己做）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------- schematic */

function Schematic({ c, s, uni, kill, seen }: { c: SupCircuit; s: SupSolution; uni: Uni; kill: boolean; seen: Seen }) {
  const v0Off = uni === 'w1' || uni === 'w2';
  const v1Off = uni === 'dc' || uni === 'w2';
  const i2Off = uni === 'dc' || uni === 'w1';
  const known = uni === 'all' ? true : seen[uni];
  // L and C at this universe
  const zl = uni === 'w1' ? s.ZL1 : s.ZL2;
  const zc = uni === 'w1' ? s.ZC1 : s.ZC2;
  const lLabel = uni === 'all' ? `L=${c.L}H` : uni === 'dc' ? (known ? 'L 短路' : 'L → ?') : known ? `Z_L=${fmtC(zl, 1).replace('.0', '')}Ω` : 'Z_L = ?';
  const cLabel = uni === 'all' ? `C = ${c.C} F` : uni === 'dc' ? (known ? 'C 开路' : 'C → ?') : known ? `Z_C = ${fmtC(zc, 1).replace(/\.0$/, '')} Ω` : 'Z_C = ?';
  const result =
    uni === 'all'
      ? 'v_o(t) = v_o0 + v_o1(t) + v_o2(t)'
      : uni === 'dc'
        ? `v_o0 = ${known ? `${fmt(s.vo0, 2)} V` : '?'}`
        : uni === 'w1'
          ? `V_o1 = ${known ? fmtP(s.Vo1, 2, 'V') : '?'}`
          : `V_o2 = ${known ? fmtP(s.Vo2, 2, 'V') : '?'}`;
  const tone = uni === 'dc' ? C.dcT : uni === 'w1' ? C.w1T : uni === 'w2' ? C.w2T : C.ink;
  const uniHalo = uni === 'all' ? 'node_vo' : `uni_${uni}`;
  const v1Text = uni === 'all' ? `v_1 = ${c.v1.text}` : uni === 'w1' ? `V_1 = ${c.v1.amp}∠${fmt(c.v1.deg, 0)}° V` : 'v_1 置零';
  const i2Text = uni === 'all' ? `i_2 = ${c.i2.text}` : uni === 'w2' ? `I_2 = ${c.i2.amp}∠${fmt(c.i2.deg, 0)}° A` : 'i_2 置零';
  const v0Text = uni === 'all' || uni === 'dc' ? `V_0 = ${c.V0} V` : 'V_0 置零';

  return (
    <g>
      {/* buses */}
      <Wire d={`M ${XA} ${YT} H ${52} M ${86} ${YT} H ${96} M ${134} ${YT} H ${XD}`} />
      <Wire d={`M ${XA} ${YG} H ${XD}`} />
      <Gnd x={XR + 40} y={YG + 1} />
      <Obj id="node_vo" box={[XN - 8, YT - 22, 28, 30]}>
        <Dot x={XN} y={YT} color={C.node} r={4} />
        <Lbl x={XN + 5} y={YT - 8} s="v_o" color={C.node} anchor="start" />
      </Obj>

      {/* branch A: V0, R1, L */}
      <Obj id="v0" box={[XA - 18, YT + 16, 36, 50]} dim={v0Off && !kill}>
        {v0Off && kill ? (
          <>
            <Wire d={`M ${XA} ${YT} V ${YT + 21} M ${XA} ${YG - 17} V ${YG}`} />
            <Short x1={XA} y1={YT + 21} x2={XA} y2={YG - 17} label="短路" lx={XA + 6} ly={YT + 40} />
          </>
        ) : (
          <>
            <Wire d={`M ${XA} ${YT} V ${YT + 21} M ${XA} ${YG - 17} V ${YG}`} />
            <VSrc x={XA} y={(YT + YG) / 2} color={C.dc} text={C.dcT} />
          </>
        )}
      </Obj>
      <Obj id="r1" box={[50, YT - 22, 40, 30]}>
        <Res x1={52} y1={YT} x2={86} y2={YT} />
        <Lbl x={69} y={YT - 11} s={`R_1=${c.R1}Ω`} color={C.resT} cls="w54-tag" />
      </Obj>
      <Obj id="ind" box={[94, YT - 22, 44, 30]}>
        {uni === 'dc' && known && kill ? <Short x1={96} y1={YT} x2={134} y2={YT} /> : <Ind x1={96} y1={YT} x2={134} y2={YT} color={uni === 'dc' && !known ? C.faint : C.ind} />}
        <Lbl x={115} y={YT - 11} s={lLabel} color={uni === 'dc' ? C.dcT : C.indT} cls="w54-tag" />
      </Obj>

      {/* branch B: C over v1 */}
      <Obj id="cap" box={[XB - 14, YT + 6, 100, 22]}>
        {uni === 'dc' && known && kill ? (
          <>
            <Wire d={`M ${XB} ${YT} V ${YT + 11} M ${XB} ${YT + 25} V ${YT + 30}`} />
            <Open x={XB} y1={YT + 13} y2={YT + 23} />
          </>
        ) : (
          <>
            <Wire d={`M ${XB} ${YT} V ${YT + 14.5} M ${XB} ${YT + 21.5} V ${YT + 30}`} />
            <Cap x={XB} y={YT + 18} color={uni === 'dc' && !known ? C.faint : C.cap} />
          </>
        )}
        <Lbl x={XB + 15} y={YT + 22} s={cLabel} color={uni === 'dc' ? C.dcT : C.capT} anchor="start" cls="w54-tag" />
      </Obj>
      <Obj id="v1" box={[XB - 16, YT + 30, 32, 36]} dim={v1Off && !kill}>
        <Wire d={`M ${XB} ${YT + 30} V ${YT + 35} M ${XB} ${YG - 7} V ${YG}`} />
        {v1Off && kill ? <Short x1={XB} y1={YT + 35} x2={XB} y2={YG - 7} label="短路" lx={XB + 6} ly={YT + 54} /> : <AcSrc x={XB} y={YT + 47} r={12} color={C.w1} />}
      </Obj>

      {/* branch C: R_L */}
      <Obj id="rl" box={[XR - 12, YT + 4, 24, YG - YT - 8]}>
        <Wire d={`M ${XR} ${YT} V ${YT + 14} M ${XR} ${YG - 14} V ${YG}`} />
        <Res x1={XR} y1={YT + 14} x2={XR} y2={YG - 14} />
      </Obj>

      {/* branch D: i2 */}
      <Obj id="i2" box={[XD - 18, YT + 14, 36, 52]} dim={i2Off && !kill}>
        {i2Off && kill ? (
          <>
            <Wire d={`M ${XD} ${YT} V ${YT + 18} M ${XD} ${YG - 18} V ${YG}`} />
            <Open x={XD} y1={YT + 21} y2={YG - 21} label="开路" lx={XD - 8} anchor="end" />
          </>
        ) : (
          <>
            <Wire d={`M ${XD} ${YT} V ${YT + 19} M ${XD} ${YG - 19} V ${YG}`} />
            <ISrc x={XD} y={(YT + YG) / 2} r={14} dir="up" color={C.w2} />
          </>
        )}
      </Obj>

      {/* labels under the ground bus */}
      <Lbl x={8} y={YG + 16} s={v0Text} color={v0Off ? C.muted : C.dcT} anchor="start" cls="w54-tag" />
      <Lbl x={XB} y={YG + 16} s={v1Text} color={v1Off ? C.muted : C.w1T} cls="w54-tag" />
      <Lbl x={XR} y={YG + 16} s={`R_L = ${c.RL} Ω`} color={C.resT} cls="w54-tag" />
      <Lbl x={432} y={YG + 16} s={i2Text} color={i2Off ? C.muted : C.w2T} anchor="end" cls="w54-tag" />

      {/* the universe's result */}
      <Obj id={uniHalo} box={[226, 4, 198, 22]}>
        <Bubble x={325} y={15} text={result} color={tone} />
      </Obj>
    </g>
  );
}

/* --------------------------------------------------------------------------- waveforms */

const WX0 = 34;
const WX1 = 300;
const WY0 = 134;
const WY1 = 232;

function Waves({ s, uni, t, seen }: { s: SupSolution; uni: Uni; t: number; seen: Seen }) {
  const N = 240;
  const pts = useMemo(() => Array.from({ length: N + 1 }, (_, i) => supAt(s, (i / N) * TMAX)), [s]);
  // the scale comes from what is shown (the guided example's hidden parts must not set it)
  const all = pts.flatMap((p) => [seen.all ? p.total : 0, seen.dc ? p.dc : 0, seen.w1 ? p.w1 : 0, seen.w2 ? p.w2 : 0, 1, -1]);
  let lo = Math.min(0, ...all);
  let hi = Math.max(0, ...all);
  const pad = (hi - lo) * 0.08;
  lo -= pad;
  hi += pad;
  const X = (tt: number) => WX0 + (tt / TMAX) * (WX1 - WX0);
  const Y = (v: number) => WY1 - ((v - lo) / (hi - lo)) * (WY1 - WY0);
  const path = (k: 'total' | 'dc' | 'w1' | 'w2') => pts.map((p, i) => `${i ? 'L' : 'M'} ${X((i / N) * TMAX).toFixed(1)} ${Y(p[k]).toFixed(1)}`).join(' ');
  const focus = (k: Uni) => uni === 'all' || uni === k;
  const v = supAt(s, t);
  const xt = X(t);
  const traces: { k: 'dc' | 'w1' | 'w2'; id: string; col: string; ok: boolean }[] = [
    { k: 'dc', id: 'wave_dc', col: C.dc, ok: seen.dc },
    { k: 'w1', id: 'wave_w1', col: C.w1, ok: seen.w1 },
    { k: 'w2', id: 'wave_w2', col: C.w2, ok: seen.w2 },
  ];
  return (
    <g>
      <rect x={WX0} y={WY0} width={WX1 - WX0} height={WY1 - WY0} className="w54-plot" />
      <line x1={WX0} y1={Y(0)} x2={WX1} y2={Y(0)} className="w54-axis0" />
      <Lbl x={WX0 - 3} y={WY0 + 8} s={fmt(hi, 0)} color={C.muted} anchor="end" cls="w54-tick" />
      <Lbl x={WX0 - 3} y={Y(0) + 3} s="0" color={C.muted} anchor="end" cls="w54-tick" />
      <Lbl x={WX0 - 3} y={WY1} s={fmt(lo, 0)} color={C.muted} anchor="end" cls="w54-tick" />
      <Lbl x={WX0 - 3} y={(WY0 + WY1) / 2 - 8} s="V" color={C.muted} anchor="end" cls="w54-tick" />
      <Lbl x={WX0} y={WY1 + 11} s="0" color={C.muted} anchor="middle" cls="w54-tick" />
      <Lbl x={WX1} y={WY1 + 11} s="t = 2π s" color={C.muted} anchor="end" cls="w54-tick" />
      {/* legend */}
      <g>
        {[
          ['v_o0', C.dc, '4 3'],
          ['v_o1(t)', C.w1, '4 3'],
          ['v_o2(t)', C.w2, '4 3'],
          ['v_o(t) 时域相加', C.ink, ''],
        ].map(([name, col, dash], i) => (
          <g key={name}>
            <line x1={WX0 + 4 + i * 58} y1={WY0 - 6} x2={WX0 + 16 + i * 58} y2={WY0 - 6} stroke={col} strokeWidth={2.2} strokeDasharray={dash || undefined} />
            <Lbl x={WX0 + 19 + i * 58} y={WY0 - 3} s={name} color={col === C.ink ? C.ink : col} anchor="start" cls="w54-tick" />
          </g>
        ))}
      </g>
      {traces.map((tr) => (tr.ok ? <Trace key={tr.k} id={tr.id} d={path(tr.k)} color={tr.col} w={focus(tr.k) ? 2 : 1.2} dash="5 3" faint={!focus(tr.k)} /> : null))}
      {seen.all ? (
        <Trace id="wave_total" d={path('total')} color={C.ink} w={uni === 'all' ? 2.8 : 1.6} faint={uni !== 'all'} />
      ) : (
        <text x={(WX0 + WX1) / 2} y={(WY0 + WY1) / 2 + 4} className="w54-lbl" textAnchor="middle" fill={C.muted}>
          引导例题：每答完一步，这里多一条分量
        </text>
      )}
      {/* time cursor */}
      <line x1={xt} y1={WY0} x2={xt} y2={WY1} className="w54-cursor" />
      {seen.all && <circle cx={xt} cy={Y(v.total)} r={3.6} fill={C.ink} />}
      {seen.w1 && focus('w1') && <circle cx={xt} cy={Y(v.w1)} r={3} fill={C.w1} />}
      {seen.w2 && focus('w2') && <circle cx={xt} cy={Y(v.w2)} r={3} fill={C.w2} />}
    </g>
  );
}

function Trace({ id, d, color, w, dash, faint }: { id: string; d: string; color: string; w: number; dash?: string; faint?: boolean }) {
  return (
    <Obj id={id} box={[0, 0, 0, 0]}>
      <path d={d} className="w54-trace-hit" />
      <path d={d} className="w54-trace-line" fill="none" stroke={color} strokeWidth={w} strokeDasharray={dash} opacity={faint ? 0.35 : 1} />
    </Obj>
  );
}

/* ----------------------------------------------------------------------------- phasors */

const PCX = 372;
const PCY = 186;
const PR = 40;

function Phasors({ s, uni, t, seen }: { s: SupSolution; uni: Uni; t: number; seen: Seen }) {
  // one scale for both in the time-domain view (their true sizes); a single universe fills the circle
  const m1 = Math.hypot(s.Vo1.re, s.Vo1.im);
  const m2 = Math.hypot(s.Vo2.re, s.Vo2.im);
  const m = uni === 'w1' ? m1 : uni === 'w2' ? m2 : Math.max(m1, m2);
  const k = PR / m;
  const show1 = (uni === 'all' || uni === 'w1') && seen.w1;
  const show2 = (uni === 'all' || uni === 'w2') && seen.w2;
  const arrow = (V: { re: number; im: number }, w: number, col: string, id: string, name: string) => {
    // the rotating phasor V e^{jωt}
    const re = timeValue(V, w, t);
    const im = V.re * Math.sin(w * t) + V.im * Math.cos(w * t);
    const x = PCX + re * k;
    const y = PCY - im * k;
    const ang = Math.atan2(y - PCY, x - PCX);
    const hx = (a: number) => x - 7 * Math.cos(ang + a);
    const hy = (a: number) => y - 7 * Math.sin(ang + a);
    return (
      <Obj id={id} box={[Math.min(PCX, x) - 4, Math.min(PCY, y) - 4, Math.abs(x - PCX) + 8, Math.abs(y - PCY) + 8]}>
        <line x1={x} y1={y} x2={x} y2={PCY} stroke={col} strokeWidth={1.2} strokeDasharray="3 2" />
        <line x1={PCX} y1={PCY} x2={x} y2={y} stroke={col} strokeWidth={2.4} />
        <polygon points={`${x},${y} ${hx(0.4)},${hy(0.4)} ${hx(-0.4)},${hy(-0.4)}`} fill={col} />
        <circle cx={x} cy={PCY} r={3} fill={col} />
        <Lbl x={x + (x >= PCX ? 4 : -4)} y={y + (y < PCY ? -3 : 10)} s={name} color={col} anchor={x >= PCX ? 'start' : 'end'} cls="w54-tick" />
      </Obj>
    );
  };
  return (
    <g>
      <rect x={308} y={124} width={126} height={120} rx={8} className="w54-plot" />
      <Lbl x={371} y={136} s="旋转相量 → 取实部" color={C.ink} cls="w54-tag" />
      <circle cx={PCX} cy={PCY} r={PR} fill="none" stroke="#e3d8c2" strokeDasharray="2 3" />
      <line x1={PCX - PR - 6} y1={PCY} x2={PCX + PR + 8} y2={PCY} stroke={C.faint} strokeWidth={1} />
      <line x1={PCX} y1={PCY - PR - 4} x2={PCX} y2={PCY + PR + 2} stroke={C.faint} strokeWidth={1} />
      <Lbl x={PCX + PR + 8} y={PCY - 3} s="Re" color={C.muted} anchor="end" cls="w54-tick" />
      {uni === 'dc' ? (
        <>
          <Lbl x={PCX} y={PCY - 6} s="ω = 0：直流" color={C.dcT} cls="w54-tag" />
          <Lbl x={PCX} y={PCY + 8} s="不旋转" color={C.dcT} cls="w54-tag" />
        </>
      ) : (
        <>
          {show1 && arrow(s.Vo1, s.w1, C.w1, 'ph_w1', `ω₁=${s.w1}`)}
          {show2 && arrow(s.Vo2, s.w2, C.w2, 'ph_w2', `ω₂=${s.w2}`)}
          {!show1 && !show2 && <Mask x={PCX} y={PCY} w={60} h={22} />}
        </>
      )}
      <Obj id="no_phasor_sum" box={[310, 228, 122, 15]}>
        <Lbl x={371} y={239} s={uni === 'all' ? '转速不同：只加投影' : '投影 = 时域值'} color={uni === 'all' ? C.warnT : C.muted} cls="w54-tick" />
      </Obj>
    </g>
  );
}
