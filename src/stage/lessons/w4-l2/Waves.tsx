// Layer "03 2D 原理图与 i(t)↔v(t) 波形及反电动势续流演示", two pages:
// - 波形: a trapezoid current i(t) through L (drag the three corners and the plateau, or start from
//   Example 2.1) and, aligned under it, v(t) = L di/dt — steps where the slope changes, green area
//   while the inductor absorbs energy, red while it gives it back (the two areas cancel). A time
//   cursor reads i, di/dt, v, p = vi and w = ½Li².
// - 断电续流: act 3's relay coil (10 mH, 200 mA from the 台式可调直流电源（12 V）, so its winding is
//   60 Ω). Open the switch with or without the flyback diode: without it the current is forced to 0
//   in 1 µs and the coil kicks to −2000 V (arc across the contacts); with it the coil is clamped at
//   −0.7 V and the current circulates through the diode until ½LI₀² is spent (≈ 0.48 ms).

import { useRef, type PointerEvent as RPointerEvent } from 'react';
import { energy, flybackI, flybackTime, iAt, KICK, kickVolts, num, R_COIL, segmentVolts, slopeAt, type Ramp } from './model';
import { Chip, hov, KICK_SUPPLY, Seg, Slider, useClearHoverOnUnmount, useIsLit } from './state';
import { useStage, useStageParam } from '../../stageStore';

type Mode = 'wave' | 'kick';

export default function Waves() {
  useClearHoverOnUnmount();
  const [mode, setMode] = useStageParam<Mode>('wmode', 'wave');
  return (
    <div className="w42-layer">
      <div className="w42-ctrl">
        <div className="w42-row">
          <Seg
            label="演示"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'wave', label: 'i(t) ↔ v(t) 波形', short: '波形', hover: ['i_wave', 'v_wave'] },
              { value: 'kick', label: '断电反电动势 / 续流', short: '断电续流', hover: ['kick_sw', 'flyback_d'] },
            ]}
          />
        </div>
      </div>
      {mode === 'wave' ? <WavePage /> : <KickPage />}
    </div>
  );
}

/* ------------------------------------------------------------- page 1: v = L di/dt */

const W = 520;
const PX0 = 62;
const PX1 = 502;
const TMAX = 8; // ms
const I_TOP = 26;
const I_BOT = 120;
const V_MID = 214;
const V_HALF = 64;
const IMAX = 80; // mA, top of the i axis

function useRamp() {
  const [L] = useStageParam('wL', 10);
  const [ipk] = useStageParam('ipk', 40);
  const [t1] = useStageParam('t1', 2);
  const [t2] = useStageParam('t2', 5);
  const [t3] = useStageParam('t3', 6);
  const [tc] = useStageParam('tc', 1);
  const set = useStage((s) => s.setParams);
  const w: Ramp = { L: L * 1e-3, ipk: ipk * 1e-3, t1: t1 * 1e-3, t2: t2 * 1e-3, t3: t3 * 1e-3 };
  return { w, L, ipk, t1, t2, t3, tc, set };
}

const tx = (t: number) => PX0 + (Math.min(TMAX, Math.max(0, t)) / TMAX) * (PX1 - PX0);
const iy = (ma: number) => I_BOT - (ma / IMAX) * (I_BOT - I_TOP);

function niceV(v: number): number {
  for (const s of [0.25, 0.5, 1, 2, 4, 8, 16, 32]) if (v <= s) return s;
  return 64;
}

type Handle = 't1' | 't2' | 't3' | 'ipk' | 'tc';

function WavePage() {
  const { w, L, ipk, t1, t2, t3, tc, set } = useRamp();
  const isLit = useIsLit();
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<Handle | null>(null);
  const [v1, , v3] = segmentVolts(w);
  const vScale = niceV(Math.max(Math.abs(v1), Math.abs(v3)));
  const vy = (v: number) => V_MID - (v / vScale) * V_HALF;
  const ex = L === 10 && ipk === 40 && t1 === 2 && t2 === 5 && t3 === 6;

  const toLocal = (e: RPointerEvent) => {
    const el = svg.current!;
    const r = el.getBoundingClientRect();
    const k = W / r.width;
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
  };
  const move = (h: Handle, x: number, y: number) => {
    const t = Math.round((((x - PX0) / (PX1 - PX0)) * TMAX) / 0.25) * 0.25;
    if (h === 'tc') set({ tc: Math.min(TMAX, Math.max(0, t)) });
    else if (h === 't1') set({ t1: Math.min(t2 - 0.25, Math.max(0.25, t)) });
    else if (h === 't2') set({ t2: Math.min(t3 - 0.25, Math.max(t1 + 0.25, t)) });
    else if (h === 't3') set({ t3: Math.min(TMAX - 0.25, Math.max(t2 + 0.25, t)) });
    else set({ ipk: Math.min(IMAX, Math.max(5, Math.round((((I_BOT - y) / (I_BOT - I_TOP)) * IMAX) / 5) * 5)) });
  };
  const down = (h: Handle) => (e: RPointerEvent) => {
    e.stopPropagation();
    drag.current = h;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: RPointerEvent) => {
    if (!drag.current) return;
    const p = toLocal(e);
    move(drag.current, p.x, p.y);
  };
  const up = () => {
    drag.current = null;
  };
  const key = (h: Handle) => (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    if (h === 'ipk') set({ ipk: Math.min(IMAX, Math.max(5, ipk + 5 * d)) });
    else move(h, tx(({ t1, t2, t3, tc } as Record<string, number>)[h] + 0.25 * d), 0);
  };

  const tcs = tc * 1e-3;
  const i = iAt(w, tcs);
  const slope = slopeAt(w, tcs);
  const v = w.L * slope;
  const pts = `${tx(0)},${iy(0)} ${tx(t1)},${iy(ipk)} ${tx(t2)},${iy(ipk)} ${tx(t3)},${iy(0)} ${tx(TMAX)},${iy(0)}`;
  const vLine = `M${tx(0)} ${vy(0)} V${vy(v1)} H${tx(t1)} V${vy(0)} H${tx(t2)} V${vy(v3)} H${tx(t3)} V${vy(0)} H${tx(TMAX)}`;
  const ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const fmtV = (x: number) => (Math.abs(x) < 1 ? `${num(x * 1e3, 0)} mV` : `${num(x, 2)} V`);
  const handle = (h: Handle, cx: number, cy: number, label: string) => (
    <g
      className="w42-handle"
      tabIndex={0}
      role="slider"
      aria-label={label}
      aria-valuenow={h === 'ipk' ? ipk : ({ t1, t2, t3, tc } as Record<string, number>)[h]}
      onPointerDown={down(h)}
      onKeyDown={key(h)}
    >
      <circle cx={cx} cy={cy} r={11} className="halo" />
      <circle cx={cx} cy={cy} r={5.5} className="dot" />
    </g>
  );
  return (
    <>
      <div className="w42-ctrl">
        <div className="w42-row">
          <Slider label="L" value={L} min={5} max={50} step={5} unit="mH" onChange={(x) => set({ wL: x })} hover={['v_wave']} />
          <Slider label="时间光标 t" value={tc} min={0} max={TMAX} step={0.25} unit="ms" onChange={(x) => set({ tc: x })} hover={['cursor']} fmt={(x) => x.toFixed(2)} />
          <button className={`w42-btn ${ex ? 'on' : ''}`} onClick={() => set({ wL: 10, ipk: 40, t1: 2, t2: 5, t3: 6 })}>
            例题 2.1
          </button>
        </div>
      </div>
      <div className="w42-sch-wrap">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} 300`}
          className="w42-sch"
          role="img"
          aria-label={`i(t) 与 v(t) 对齐波形：t = ${tc} ms 时 i = ${num(i * 1e3, 1)} mA，v = ${fmtV(v)}`}
          onPointerMove={onMove}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <rect
            x={PX0}
            y={I_TOP - 10}
            width={PX1 - PX0}
            height={V_MID + V_HALF - I_TOP + 14}
            fill="transparent"
            onPointerDown={(e) => {
              drag.current = 'tc';
              (e.target as Element).setPointerCapture?.(e.pointerId);
              const p = toLocal(e);
              move('tc', p.x, p.y);
            }}
          />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={tx(t)} y1={I_TOP - 6} x2={tx(t)} y2={V_MID + V_HALF + 4} className="w42-grid" />
              <text x={tx(t)} y={V_MID + V_HALF + 18} textAnchor="middle" className="w42-tick">
                {t}
              </text>
            </g>
          ))}
          <text x={PX1} y={V_MID + V_HALF + 32} textAnchor="end" className="w42-tick">
            t (ms)
          </text>
          {/* i(t) */}
          <g className={`w42-plot i ${isLit('i_wave', 'slope') ? 'lit' : ''}`} {...hov(['i_wave'])}>
            <line x1={PX0} y1={I_BOT} x2={PX1} y2={I_BOT} className="axis" />
            <line x1={PX0} y1={I_BOT} x2={PX0} y2={I_TOP - 8} className="axis" />
            <text x={8} y={I_TOP} className="ylab blue">
              i (mA)
            </text>
            <text x={PX0 - 6} y={iy(ipk) + 4} textAnchor="end" className="w42-tick">
              {ipk}
            </text>
            <text x={PX0 - 6} y={I_BOT + 4} textAnchor="end" className="w42-tick">
              0
            </text>
            <polygon points={`${tx(0)},${iy(0)} ${tx(t1)},${iy(ipk)} ${tx(t2)},${iy(ipk)} ${tx(t3)},${iy(0)}`} className="fill" />
            <polyline points={pts} className="line" />
            <text x={(tx(0) + tx(t1)) / 2 + 8} y={(iy(0) + iy(ipk)) / 2 + 20} className={`w42-note ${isLit('slope') ? 'lit' : ''}`}>
              斜率 +{num(ipk / t1, 0)} A/s
            </text>
            <text x={(tx(t2) + tx(t3)) / 2 + 6} y={(iy(0) + iy(ipk)) / 2 - 8} className={`w42-note red ${isLit('slope') ? 'lit' : ''}`}>
              斜率 −{num(ipk / (t3 - t2), 0)} A/s
            </text>
            <text x={(tx(t1) + tx(t2)) / 2} y={iy(ipk) - 17} textAnchor="middle" className={`w42-note teal ${isLit('plateau') ? 'lit' : ''}`}>
              恒流平台 di/dt = 0
            </text>
          </g>
          {/* v(t) */}
          <g className={`w42-plot v ${isLit('v_wave') ? 'lit' : ''}`} {...hov(['v_wave'])}>
            <rect x={tx(0)} y={Math.min(vy(v1), vy(0))} width={tx(t1) - tx(0)} height={Math.abs(vy(v1) - vy(0))} className="pos" />
            <rect x={tx(t2)} y={vy(0)} width={tx(t3) - tx(t2)} height={Math.abs(vy(v3) - vy(0))} className="neg" />
            <line x1={PX0} y1={vy(0)} x2={PX1} y2={vy(0)} className="axis" />
            <line x1={PX0} y1={V_MID + V_HALF + 4} x2={PX0} y2={V_MID - V_HALF - 8} className="axis" />
            <text x={PX0 + 8} y={V_MID - V_HALF - 4} className="ylab red">
              v = L·di/dt
            </text>
            <text x={PX0 - 6} y={vy(vScale) + 4} textAnchor="end" className="w42-tick">
              {fmtV(vScale).replace(' ', '')}
            </text>
            <text x={PX0 - 6} y={vy(-vScale) + 4} textAnchor="end" className="w42-tick">
              {fmtV(-vScale).replace(' ', '')}
            </text>
            <path d={vLine} className="line" />
            <text x={(tx(0) + tx(t1)) / 2} y={vy(v1) - 6} textAnchor="middle" className="w42-note green">
              v₁ = +{fmtV(v1)}（吸能）
            </text>
            <text x={(tx(t1) + tx(t2)) / 2} y={vy(0) - 6} textAnchor="middle" className="w42-note teal">
              v₂ = 0（短路）
            </text>
            <text x={(tx(t2) + tx(t3)) / 2} y={vy(v3) + 16} textAnchor="middle" className="w42-note red">
              v₃ = {fmtV(v3)}（放能）
            </text>
          </g>
          {/* the cursor */}
          <g className={`w42-cursor ${isLit('cursor') ? 'lit' : ''}`}>
            <line x1={tx(tc)} y1={I_TOP - 8} x2={tx(tc)} y2={V_MID + V_HALF + 4} />
            <circle cx={tx(tc)} cy={iy(i * 1e3)} r={4} />
            <circle cx={tx(tc)} cy={vy(v)} r={4} />
          </g>
          {handle('t1', tx(t1), iy(ipk), '上升段终点 t₁')}
          {handle('t2', tx(t2), iy(ipk) + 0.01, '平台终点 t₂')}
          {handle('t3', tx(t3), iy(0), '下降段终点 t₃')}
          {handle('ipk', (tx(t1) + tx(t2)) / 2, iy(ipk), '峰值电流')}
        </svg>
      </div>
      <div className="w42-chips">
        <Chip ids={['cursor']} k={`t = ${tc.toFixed(2)} ms · i`} v={`${num(i * 1e3, 1)} mA`} />
        <Chip ids={['slope']} k="di/dt" v={`${num(slope, 1)} A/s`} />
        <Chip ids={['v_wave']} k="v = L di/dt" v={fmtV(v)} tone={v > 0 ? 'good' : v < 0 ? 'bad' : undefined} />
        <Chip ids={['v_wave', 'i_wave']} k="p = vi" v={`${num(v * i * 1e3, 2)} mW`} />
        <Chip ids={['i_wave']} k="w = ½Li²" v={`${num(energy(w.L, i) * 1e6, 2)} µJ`} />
      </div>
      <p className="w42-hint">拖动 i(t) 的三个拐点与平台（或时间光标）：电流斜率一变，下面的电压立刻阶跃；两块面积总是相互抵消，电流才能回到 0。</p>
    </>
  );
}

/* ------------------------------------------------------------- page 2: switch-off */

const KX0 = 262;
const KX1 = 508;
const KT0 = -0.1; // ms
const KT1 = 0.8;
const kx = (t: number) => KX0 + ((t - KT0) / (KT1 - KT0)) * (KX1 - KX0);
const VTOP = 26;
const VBOT = 128;
const VMAXK = 15;
const kvy = (v: number) => (VTOP + VBOT) / 2 - (v / VMAXK) * ((VBOT - VTOP) / 2);
const ITOP = 168;
const IBOT = 262;
const kiy = (ma: number) => IBOT - (ma / 250) * (IBOT - ITOP);

function KickPage() {
  const [sw, setSw] = useStageParam<'closed' | 'open'>('sw', 'closed');
  const [diode, setDiode] = useStageParam('diode', false);
  const isLit = useIsLit();
  const open = sw === 'open';
  const arc = open && !diode;
  const tEnd = flybackTime();
  const vKick = kickVolts(KICK.L, KICK.I0, KICK.dt);
  // the current after the switch opens (t in ms)
  const iAfter = (t: number) => (diode ? flybackI(t * 1e-3) : t < 0.001 ? KICK.I0 * (1 - t / 0.001) : 0);
  const n = 90;
  const iPts = [`${kx(KT0)},${kiy(200)}`, `${kx(0)},${kiy(200)}`];
  const vPts = [`${kx(KT0)},${kvy(KICK.Vs)}`, `${kx(0)},${kvy(KICK.Vs)}`];
  if (open) {
    for (let k = 0; k <= n; k++) {
      const t = (k / n) * KT1;
      iPts.push(`${kx(t)},${kiy(iAfter(t) * 1e3)}`);
    }
    if (diode) vPts.push(`${kx(0)},${kvy(-KICK.Vd)}`, `${kx(tEnd * 1e3)},${kvy(-KICK.Vd)}`, `${kx(tEnd * 1e3)},${kvy(0)}`, `${kx(KT1)},${kvy(0)}`);
    else vPts.push(`${kx(0)},${VBOT + 14}`, `${kx(0.004)},${VBOT + 14}`, `${kx(0.004)},${kvy(0)}`, `${kx(KT1)},${kvy(0)}`);
  } else {
    iPts.push(`${kx(KT1)},${kiy(200)}`);
    vPts.push(`${kx(KT1)},${kvy(KICK.Vs)}`);
  }
  const vL = !open ? '+12 V（L·di/dt = 0）' : diode ? `−${KICK.Vd} V（钳位）` : `${num(vKick, 0)} V`;
  const vSw = !open ? '0 V（闭合）' : diode ? `${num(KICK.Vs + KICK.Vd, 1)} V` : `≈ ${num(KICK.Vs - vKick, 0)} V`;
  return (
    <>
      <div className="w42-ctrl">
        <div className="w42-row">
          <button className={`w42-btn ${open ? '' : 'on'}`} onClick={() => setSw('closed')} {...hov(['kick_sw'])}>
            闭合开关
          </button>
          <button className={`w42-btn danger ${open ? 'on' : ''}`} onClick={() => setSw('open')} {...hov(['kick_sw'])}>
            断开开关
          </button>
          <label className={`w42-check ${isLit('flyback_d') ? 'lit' : ''}`} {...hov(['flyback_d'])}>
            <input type="checkbox" checked={diode} onChange={(e) => setDiode(e.target.checked)} />
            <span className="full">并联续流二极管 D₁（1N4007）</span>
            <span className="short">续流二极管 D₁</span>
          </label>
        </div>
      </div>
      <div className="w42-sch-wrap">
        <svg
          viewBox={`0 0 ${W} 300`}
          className="w42-sch"
          role="img"
          aria-label={`继电器线圈断电演示：开关${open ? '已断开' : '闭合'}，${diode ? '有' : '无'}续流二极管，线圈电压 ${vL}`}
        >
          {/* the circuit */}
          <path className="w42-wire" d="M40 130 V40 H200 M150 40 V58 M40 170 V262 H150 V226" />
          <g className={`w42-obj src ${isLit('kick_src') ? 'lit' : ''}`} {...hov(['kick_src'])}>
            <circle cx={40} cy={150} r={20} className="body" />
            <text x={40} y={146} textAnchor="middle" className="pm">
              +
            </text>
            <text x={40} y={163} textAnchor="middle" className="pm">
              −
            </text>
            <text x={66} y={158} className="lab">
              12 V
            </text>
          </g>
          <g className={`w42-obj ind ${isLit('relay_coil') ? 'lit' : ''}`} {...hov(['relay_coil'])}>
            <path className="coil" d="M150 58 c14 0 14 12 0 12 c14 0 14 12 0 12 c14 0 14 12 0 12 c14 0 14 12 0 12 c14 0 14 12 0 12 v14" />
            <rect x={136} y={56} width={30} height={78} className="hit" />
            <text x={106} y={84} textAnchor="end" className="lab">
              L = 10 mH
            </text>
            <text x={106} y={100} textAnchor="end" className="sub">
              线圈 {R_COIL} Ω
            </text>
            <text x={136} y={60} textAnchor="end" className={`pm ${open ? 'red' : ''}`}>
              {open ? '−' : '+'}
            </text>
            <text x={136} y={140} textAnchor="end" className={`pm ${open ? 'red' : ''}`}>
              {open ? '+' : '−'}
            </text>
          </g>
          <g className={`w42-obj sw ${isLit('kick_sw', 'spark') ? 'lit' : ''}`} {...hov(['kick_sw'])}>
            <path className="w42-wire" d="M150 132 V180" />
            <circle cx={150} cy={182} r={3.5} className="dot" />
            <line x1={150} y1={182} x2={open ? 172 : 150} y2={open ? 214 : 222} className="blade" />
            <circle cx={150} cy={224} r={3.5} className="dot" />
            <rect x={136} y={176} width={44} height={54} className="hit" />
            <text x={186} y={200} className="lab">
              开关
            </text>
          </g>
          {arc && (
            <g className={`w42-spark ${isLit('spark') ? 'lit' : ''}`} {...hov(['spark'])}>
              <polyline points="143,190 156,197 144,204 157,212" />
              <text x={10} y={290} className="lab red">
                触点拉弧 / 击穿！v_L = {num(vKick, 0)} V
              </text>
            </g>
          )}
          <g className={`w42-obj diode ${diode ? '' : 'off'} ${isLit('flyback_d') ? 'lit' : ''}`} {...hov(['flyback_d'])}>
            <path className="w42-wire d" d="M200 40 V76 M200 100 V144 H150" />
            <polygon points="188,100 212,100 200,78" className="body" />
            <line x1={188} y1={78} x2={212} y2={78} className="bar" />
            <text x={218} y={92} className="lab green">
              D₁
            </text>
            {diode && open && (
              <>
                <path d="M176 144 h14 M200 120 v-10" className="flow" />
                <text x={162} y={162} className="sub green">
                  续流 {num(tEnd * 1e3, 2)} ms
                </text>
              </>
            )}
          </g>
          <text x={10} y={20} className="sub">
            {KICK_SUPPLY}
          </text>
          {/* v_L(t) */}
          <g className={`w42-plot v ${isLit('v_wave', 'spark') ? 'lit' : ''}`} {...hov(['v_wave'])}>
            <line x1={KX0} y1={kvy(0)} x2={KX1} y2={kvy(0)} className="axis" />
            <line x1={kx(0)} y1={VTOP - 6} x2={kx(0)} y2={IBOT + 4} className="w42-grid" />
            <text x={KX0} y={VTOP - 10} className="ylab red">
              线圈两端 v_L (V)
            </text>
            <text x={KX0 - 4} y={kvy(12) + 4} textAnchor="end" className="w42-tick">
              12
            </text>
            <text x={KX0 - 4} y={kvy(0) + 4} textAnchor="end" className="w42-tick">
              0
            </text>
            <text x={KX0 - 4} y={kvy(-12) + 4} textAnchor="end" className="w42-tick">
              −12
            </text>
            <polyline points={vPts.join(' ')} className="line" />
            {arc && (
              <text x={kx(0.02)} y={VBOT + 12} className="w42-note red">
                ↓ −2000 V（1 μs，超出量程）
              </text>
            )}
            {open && diode && (
              <text x={kx(0.05)} y={kvy(-0.7) + 16} className="w42-note green">
                钳位 −0.7 V
              </text>
            )}
          </g>
          {/* i_L(t) */}
          <g className={`w42-plot i ${isLit('i_wave') ? 'lit' : ''}`} {...hov(['i_wave'])}>
            <line x1={KX0} y1={IBOT} x2={KX1} y2={IBOT} className="axis" />
            <text x={KX0} y={ITOP - 8} className="ylab blue">
              线圈电流 i_L (mA)
            </text>
            <text x={KX0 - 4} y={kiy(200) + 4} textAnchor="end" className="w42-tick">
              200
            </text>
            <text x={KX0 - 4} y={IBOT + 4} textAnchor="end" className="w42-tick">
              0
            </text>
            <polyline points={iPts.join(' ')} className="line" />
            {[0, 0.2, 0.4, 0.6, 0.8].map((t) => (
              <text key={t} x={kx(t)} y={IBOT + 16} textAnchor="middle" className="w42-tick">
                {t}
              </text>
            ))}
            <text x={KX1} y={IBOT + 30} textAnchor="end" className="w42-tick">
              断开后 t (ms)
            </text>
          </g>
        </svg>
      </div>
      <div className="w42-chips">
        <Chip ids={['relay_coil', 'v_wave']} k="线圈两端 v_L" v={vL} tone={arc ? 'bad' : open ? 'good' : undefined} />
        <Chip ids={['kick_sw']} k="开关两端" v={vSw} tone={arc ? 'bad' : undefined} />
        <Chip ids={['relay_coil']} k="½LI₀²" v={`${num(energy(KICK.L, KICK.I0) * 1e3, 2)} mJ`} />
      </div>
      <p className="w42-hint">线圈自带 60 Ω 绕组电阻：通电稳态时 12 V 全落在绕组电阻上，理想电感部分 L·di/dt = 0。</p>
    </>
  );
}
