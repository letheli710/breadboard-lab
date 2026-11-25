// W3-L6 layer 01 · 差模 vs 共模信号切换交互图. A sensor on two long leads: the mains couples the
// same hum v_cm onto both leads, the sensor puts its small v_d between them (v1 = v_cm − v_d/2,
// v2 = v_cm + v_d/2). Two ×10 amplifiers take the leads: a single-ended one on v2 (clips at the
// ±15 V rails) and the ideal difference amplifier 10·(v2 − v1). Three scope traces: the two leads,
// the single-ended output, the differential output. The hum is a 50 Hz sine and the sensor a slow
// sine, each of the amplitude set on its slider. Stage params: w36_sig, w36_vcm, w36_vd (mV).

import { useStageParam } from '../../stageStore';
import { SENSOR, clip, fmt, split } from './model';
import { C, Obj, Subs, Wire, useHot } from './parts';
import './w3l6.css';

type Mode = 'pure_diff' | 'pure_cm' | 'mixed_hum';
const MODES: { id: Mode; label: string }[] = [
  { id: 'pure_diff', label: '纯差模' },
  { id: 'pure_cm', label: '纯共模' },
  { id: 'mixed_hum', label: '混合工频' },
];

const G = SENSOR.gain;
const RAIL = SENSOR.rail;
const N = 220;
/** time window: 0.2 s → 10 hum cycles, one sensor cycle */
const T = 0.2;

/** a scope trace: f(t) on a strip from x0..x1 at y (centre) ± h/2, scaled to ±span */
function trace(f: (t: number) => number, span: number, x0: number, x1: number, y: number, h: number) {
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const v = Math.max(-span, Math.min(span, f(t)));
    pts.push(`${(x0 + ((x1 - x0) * i) / N).toFixed(1)},${(y - (v / span) * (h / 2)).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** the parts of a trace above / below the rails, as separate polylines */
function clippedRuns(f: (t: number) => number, span: number, x0: number, x1: number, y: number, h: number) {
  const runs: string[] = [];
  let cur: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const raw = f(t);
    if (Math.abs(raw) >= RAIL - 1e-9) {
      const v = Math.sign(raw) * RAIL;
      cur.push(`${(x0 + ((x1 - x0) * i) / N).toFixed(1)},${(y - (v / span) * (h / 2)).toFixed(1)}`);
    } else if (cur.length) {
      runs.push(cur.join(' '));
      cur = [];
    }
  }
  if (cur.length) runs.push(cur.join(' '));
  return runs.filter((r) => r.includes(' '));
}

const niceSpan = (x: number) => {
  const m = Math.max(x, 1e-6) * 1.2;
  const p = 10 ** Math.floor(Math.log10(m));
  for (const k of [1, 2, 5, 10]) if (k * p >= m) return k * p;
  return 10 * p;
};

export default function SignalLayer() {
  const [mode, setMode] = useStageParam<Mode>('w36_sig', 'mixed_hum');
  const [vcmSet, setVcm] = useStageParam('w36_vcm', SENSOR.vcm);
  const [vdSet, setVd] = useStageParam('w36_vd', SENSOR.vd * 1000);
  const vcm = mode === 'pure_diff' ? 0 : vcmSet;
  const vdMv = mode === 'pure_cm' ? 0 : vdSet;
  const vd = vdMv / 1000;
  const { v1, v2 } = split(vcm, vd);
  const single = G * v2;
  const clipped = Math.abs(single) > RAIL;
  const diff = G * vd;

  const hum = (t: number) => vcm * Math.sin(2 * Math.PI * 50 * t);
  const sig = (t: number) => vd * Math.sin((2 * Math.PI * t) / T);
  const w1 = (t: number) => hum(t) - sig(t) / 2;
  const w2 = (t: number) => hum(t) + sig(t) / 2;
  const s0 = niceSpan(Math.max(Math.abs(vcm) + Math.abs(vd) / 2, 1e-3));
  const s2 = niceSpan(Math.max(Math.abs(diff), 1e-3));

  const X0 = 74;
  const X1 = 428;
  const strips = [
    { y: 176, h: 40 },
    { y: 230, h: 40 },
    { y: 284, h: 40 },
  ];
  const railY = (v: number) => strips[1].y - (v / 20) * (strips[1].h / 2);
  const ro = useHot('out_single');
  const rd = useHot('out_diff');

  return (
    <div className="w36-layer">
      <div className="w36-controls">
        <div className="w36-seg" role="radiogroup" aria-label="输入信号">
          {MODES.map((m) => (
            <button key={m.id} role="radio" aria-checked={mode === m.id} className={mode === m.id ? 'on' : ''} onClick={() => setMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w36-sliders">
        <label className={mode === 'pure_diff' ? 'off' : ''}>
          <span>
            共模工频噪声 v<sub>cm</sub>
          </span>
          <b className="hum">{fmt(vcm, 1)} V</b>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={vcmSet}
            disabled={mode === 'pure_diff'}
            onChange={(e) => setVcm(Number(e.target.value))}
            aria-label="共模工频噪声 v_cm (V)"
          />
        </label>
        <label className={mode === 'pure_cm' ? 'off' : ''}>
          <span>
            微弱差模信号 v<sub>d</sub>
          </span>
          <b className="sig">{fmt(vdMv, 0)} mV</b>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={vdSet}
            disabled={mode === 'pure_cm'}
            onChange={(e) => setVd(Number(e.target.value))}
            aria-label="微弱差模信号 v_d (mV)"
          />
        </label>
      </div>

      <div className="w36-svgwrap">
        <svg viewBox="0 0 440 304" className="w36-svg" role="img" aria-label="长导线传感器：共模工频噪声与差模信号">
          <rect x="1" y="1" width="438" height="302" rx="10" className="w36-bg" />
          {/* mains hum coupling onto both leads */}
          <Obj id="noise_vcm" box={[84, 4, 170, 76]}>
            <path d="M 92 18 q 6 -9 12 0 t 12 0 t 12 0" fill="none" stroke={C.hum} strokeWidth={2.2} />
            <text x={134} y={22} className="w36-lbl" fill={C.humT}>
              <Subs s={`工频 v_cm = ${fmt(vcm, 1)} V`} />
            </text>
            {[110, 190].map((x) => (
              <g key={x}>
                <path d={`M ${x} 28 V 40`} stroke={C.hum} strokeWidth={1.6} strokeDasharray="3 3" />
                <polygon points={`${x - 4},39 ${x},46 ${x + 4},39`} fill={C.hum} />
                <path d={`M ${x} 56 V 72`} stroke={C.hum} strokeWidth={1.6} strokeDasharray="3 3" />
                <polygon points={`${x - 4},73 ${x},80 ${x + 4},73`} fill={C.hum} />
              </g>
            ))}
          </Obj>
          {/* the sensor */}
          <Obj id="sensor_vd" box={[6, 36, 60, 66]}>
            <rect x={10} y={40} width={50} height={58} rx={7} fill="#f0f9ff" stroke={C.v1} strokeWidth={1.6} />
            <text x={35} y={60} className="w36-tag" textAnchor="middle" fill={C.v1T}>
              传感器
            </text>
            <text x={35} y={77} className="w36-val" textAnchor="middle" fill={C.v1T}>
              <Subs s="v_d" />
            </text>
            <text x={35} y={91} className="w36-tag" textAnchor="middle" fill={C.v1T}>
              {fmt(vdMv, 0)} mV
            </text>
          </Obj>
          {/* the two leads, straight into the difference amplifier; v2 also feeds the single-ended one */}
          <Obj id="wire_v1" box={[60, 42, 254, 14]}>
            <Wire d="M 60 50 H 314" color={C.v1} w={2.4} />
          </Obj>
          <Obj id="wire_v2" box={[60, 76, 254, 14]}>
            <Wire d="M 60 84 H 314" color={C.v2} w={2.4} />
          </Obj>
          <Wire d="M 300 84 V 122 H 314" color={C.v2} w={1.8} />
          <circle cx={300} cy={84} r={3} fill={C.v2} />
          <text x={160} y={102} className="w36-tag" textAnchor="middle" fill={C.muted}>
            十米长导线（双线同受干扰）
          </text>
          <text x={294} y={44} className="w36-val" textAnchor="end" fill={C.v1T}>
            v₁ = {fmt(v1, 4)} V
          </text>
          <text x={294} y={78} className="w36-val" textAnchor="end" fill={C.v2T}>
            v₂ = {fmt(v2, 4)} V
          </text>
          {/* the two amplifiers */}
          <Obj id="out_diff" box={[310, 34, 128, 66]}>
            <rect x={314} y={38} width={120} height={58} rx={6} fill="#f5f3ff" stroke={C.out} strokeWidth={1.5} />
            <text x={374} y={62} className="w36-tag" textAnchor="middle" fill={C.outT}>
              差分 ×10（v₂ − v₁）
            </text>
            <text x={374} y={82} className="w36-val" textAnchor="middle" fill={C.outT}>
              {fmt(diff, 3)} V
            </text>
          </Obj>
          <Obj id="out_single" box={[310, 102, 128, 42]}>
            <rect x={314} y={106} width={120} height={34} rx={6} fill={clipped ? '#fee2e2' : '#fff'} stroke={clipped ? C.bad : C.ink} strokeWidth={1.5} />
            <text x={374} y={119} className="w36-tag" textAnchor="middle" fill={C.ink}>
              单端 ×10（只放 v₂）
            </text>
            <text x={374} y={134} className="w36-val" textAnchor="middle" fill={clipped ? C.badT : C.ink}>
              {clipped ? `饱和 ${single > 0 ? '+' : '−'}15 V` : `${fmt(single, 3)} V`}
            </text>
          </Obj>

          {/* scope strips */}
          {strips.map((s, i) => (
            <g key={i}>
              <rect x={X0} y={s.y - s.h / 2} width={X1 - X0} height={s.h} rx={4} fill="#fff" stroke="#e3d8c2" />
              <line x1={X0} y1={s.y} x2={X1} y2={s.y} stroke="#e3d8c2" strokeDasharray="2 3" />
            </g>
          ))}
          <text x={8} y={strips[0].y - 4} className="w36-tag" fill={C.ink}>
            导线对地
          </text>
          <text x={8} y={strips[0].y + 10} className="w36-tick" fill={C.muted}>
            ±{fmt(s0, 3)} V
          </text>
          <polyline points={trace(w1, s0, X0, X1, strips[0].y, strips[0].h)} fill="none" stroke={C.v1} strokeWidth={1.6} />
          <polyline points={trace(w2, s0, X0, X1, strips[0].y, strips[0].h)} fill="none" stroke={C.v2} strokeWidth={1.4} strokeDasharray="4 2" />

          <Obj id="out_single" box={[4, strips[1].y - 22, 432, 44]}>
            <text x={8} y={strips[1].y - 4} className="w36-tag" fill={C.ink}>
              单端 10·v₂
            </text>
            <text x={8} y={strips[1].y + 10} className="w36-tick" fill={C.muted}>
              ±20 V
            </text>
            <polyline points={trace((t) => clip(G * w2(t), RAIL), 20, X0, X1, strips[1].y, strips[1].h)} fill="none" stroke={C.ink} strokeWidth={1.6} />
            {clippedRuns((t) => G * w2(t), 20, X0, X1, strips[1].y, strips[1].h).map((p, i) => (
              <polyline key={i} points={p} fill="none" stroke={C.bad} strokeWidth={3.2} strokeLinecap="round" />
            ))}
          </Obj>
          <Obj id="rail" box={[X0, railY(RAIL) - 4, X1 - X0, railY(-RAIL) - railY(RAIL) + 8]}>
            <line x1={X0} y1={railY(RAIL)} x2={X1} y2={railY(RAIL)} stroke={C.bad} strokeWidth={1} strokeDasharray="5 3" />
            <line x1={X0} y1={railY(-RAIL)} x2={X1} y2={railY(-RAIL)} stroke={C.bad} strokeWidth={1} strokeDasharray="5 3" />
          </Obj>
          {clipped && (
            <text x={X1} y={strips[1].y - strips[1].h / 2 - 3} className="w36-tag" textAnchor="end" fill={C.badT}>
              CLIPPED @ ±15 V
            </text>
          )}

          <Obj id="out_diff" box={[4, strips[2].y - 22, 432, 44]}>
            <text x={8} y={strips[2].y - 4} className="w36-tag" fill={C.outT}>
              差分 10·
              <Subs s="v_d" />
            </text>
            <text x={8} y={strips[2].y + 10} className="w36-tick" fill={C.muted}>
              ±{fmt(s2 * 1000, 0)} mV
            </text>
            <polyline points={trace((t) => G * (w2(t) - w1(t)), s2, X0, X1, strips[2].y, strips[2].h)} fill="none" stroke={C.out} strokeWidth={1.8} />
            {vd === 0 && (
              <text x={X1 - 4} y={strips[2].y - 6} className="w36-tag" textAnchor="end" fill={C.outT}>
                0 V：共模被彻底减掉
              </text>
            )}
          </Obj>
        </svg>
      </div>

      <div className="w36-tele" role="group" aria-label="实时读数">
        <span className="c1">
          v₁ = v<sub>cm</sub> − v<sub>d</sub>/2 = {fmt(v1, 4)} V
        </span>
        <span className="c2">
          v₂ = v<sub>cm</sub> + v<sub>d</sub>/2 = {fmt(v2, 4)} V
        </span>
        <span className={`c3${clipped ? ' bad' : ''}${ro.lit ? ' lit' : ''}`} {...ro.on}>
          单端 10·v₂ = {fmt(single, 3)} V{clipped ? '（饱和削波！）' : ''}
        </span>
        <span className={`c4${rd.lit ? ' lit' : ''}`} {...rd.on}>
          差分 10·(v₂ − v₁) = {fmt(diff, 3)} V
        </span>
      </div>
    </div>
  );
}
