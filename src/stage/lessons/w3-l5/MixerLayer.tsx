// W3-L5 layer 02 · 多路加权电流实时合成台. A three-channel summer whose input resistors come from a
// preset (weighted mixer of act 2, unity summer, 3-channel averager, ADC level shifter) and whose
// feedback resistor Rf is the master fader. Branch-current arrows grow with |iₖ| and turn orange
// when a channel pulls current out of node a; each channel shows its weight wₖ = Rf / Rₖ. Below the
// schematic, the weighted sum laid head to tail on a number line (−wₖvₖ, total vₒ), or, for the
// level shifter, the bipolar signal and the shifted output against the ADC window [0, 3.3 V].
// Stage params: w35_mix, w35_v1, w35_v2, w35_v3, w35_rf.

import { useStageParam } from '../../stageStore';
import { MIX_PRESETS, fmt, type MixPreset } from './model';
import { Bubble, C, Dot, Flow, Ground, Obj, OpAmp, ResH, Src, Terminal, Wire, opIn, useHot } from './parts';
import './w3l5.css';

const YS = [46, 96, 146];
const BUS = 190;
const NODE = 96;
const OPX = 236;
const OPY = NODE + 17;
const RAIL = 12;

/** a "nice" half-range for the sum line */
function span(xs: number[]) {
  const m = Math.max(1, ...xs.map(Math.abs));
  for (const s of [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30, 40, 60, 90, 120]) if (m <= s * 0.95) return s;
  return Math.ceil(m / 50) * 50;
}

function SumLine({ parts, vo, on }: { parts: { c: number; color: string }[]; vo: number; on: boolean[] }) {
  const S = span([vo, ...parts.map((p) => p.c), ...parts.map((_, k) => parts.slice(0, k + 1).reduce((a, p) => a + p.c, 0))]);
  const X0 = 40;
  const X1 = 392;
  const x = (v: number) => X0 + ((v + S) / (2 * S)) * (X1 - X0);
  const Y = 222;
  const ticks = [-S, -S / 2, 0, S / 2, S];
  let acc = 0;
  return (
    <g>
      <line x1={X0} y1={Y} x2={X1} y2={Y} stroke={C.wire} strokeWidth={1.2} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={Y - 3} x2={x(t)} y2={Y + 3} stroke={C.wire} strokeWidth={t === 0 ? 2 : 1} />
          <text x={x(t)} y={Y + 14} className="w35-tick" textAnchor="middle">
            {fmt(t, Number.isInteger(t) ? 0 : 1)}
          </text>
        </g>
      ))}
      <text x={X1 + 4} y={Y + 14} className="w35-tick">
        V
      </text>
      {parts.map((p, k) => {
        if (!on[k]) return null;
        const a = acc;
        acc += p.c;
        const yy = 192 + k * 9;
        if (Math.abs(p.c) < 1e-9) return <circle key={k} cx={x(a)} cy={yy} r={2.5} fill={p.color} />;
        const dir = p.c > 0 ? 1 : -1;
        return (
          <g key={k}>
            <line x1={x(a)} y1={yy} x2={x(acc) - dir * 6} y2={yy} stroke={p.color} strokeWidth={4} strokeLinecap="round" />
            <polygon points={`${x(acc)},${yy} ${x(acc) - dir * 7},${yy - 4.5} ${x(acc) - dir * 7},${yy + 4.5}`} fill={p.color} />
          </g>
        );
      })}
      {Math.abs(vo) > 1e-9 && <line x1={x(0)} y1={Y} x2={x(vo)} y2={Y} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />}
      <polygon points={`${x(vo)},${Y - 6} ${x(vo) + 5},${Y} ${x(vo)},${Y + 6} ${x(vo) - 5},${Y}`} fill={C.ink} />
    </g>
  );
}

function ShiftWave({ amp, R, Rf }: { amp: number; R: number[]; Rf: number }) {
  // vsig(t) = amp·sin(ωt) through the shifter: vo = −(Rf/R1)·vsig − (Rf/R2)·Vref
  const lo = -1.5;
  const hi = 3.6;
  const Y0 = 186;
  const Y1 = 246;
  const y = (v: number) => Y1 - ((v - lo) / (hi - lo)) * (Y1 - Y0);
  const X0 = 44;
  const X1 = 404;
  const pts = (f: (s: number) => number) =>
    Array.from({ length: 73 }, (_, k) => {
      const t = k / 72;
      return `${(X0 + t * (X1 - X0)).toFixed(1)},${y(f(Math.sin(t * 4 * Math.PI))).toFixed(1)}`;
    }).join(' ');
  const vo = (s: number) => -(Rf / R[0]) * amp * s - (Rf / R[1]) * -3.3;
  return (
    <g>
      <defs>
        <clipPath id="w35-in">
          <rect x={X0} y={y(3.3)} width={X1 - X0} height={y(0) - y(3.3)} />
        </clipPath>
        <clipPath id="w35-out">
          <rect x={X0} y={Y0 - 10} width={X1 - X0} height={y(3.3) - Y0 + 10} />
          <rect x={X0} y={y(0)} width={X1 - X0} height={Y1 - y(0) + 10} />
        </clipPath>
      </defs>
      <rect x={X0} y={y(3.3)} width={X1 - X0} height={y(0) - y(3.3)} fill="#ECFDF3" />
      <line x1={X0} y1={y(3.3)} x2={X1} y2={y(3.3)} stroke={C.node} strokeDasharray="4 3" />
      <line x1={X0} y1={y(1.65)} x2={X1} y2={y(1.65)} stroke={C.ch[0]} strokeDasharray="4 3" strokeWidth={0.8} />
      <line x1={X0} y1={y(0)} x2={X1} y2={y(0)} stroke={C.ink} strokeWidth={1.4} />
      <text x={X0 - 4} y={y(3.3) + 3.5} className="w35-tick" textAnchor="end" fill={C.nodeT}>
        3.3
      </text>
      <text x={X0 - 4} y={y(1.65) + 3.5} className="w35-tick" textAnchor="end" fill={C.chT[0]}>
        1.65
      </text>
      <text x={X0 - 4} y={y(0) + 3.5} className="w35-tick" textAnchor="end">
        0 V
      </text>
      <polyline points={pts((s) => amp * s)} fill="none" stroke="#94A3B8" strokeWidth={1.6} strokeDasharray="4 3" />
      <polyline points={pts(vo)} fill="none" stroke={C.ch[0]} strokeWidth={2.4} clipPath="url(#w35-in)" />
      <polyline points={pts(vo)} fill="none" stroke={C.bad} strokeWidth={2.4} clipPath="url(#w35-out)" />
    </g>
  );
}

export default function MixerLayer() {
  const [preset, setPreset] = useStageParam<MixPreset>('w35_mix', 'weighted_mixer');
  const [v1, setV1] = useStageParam('w35_v1', 1);
  const [v2, setV2] = useStageParam('w35_v2', 0.5);
  const [v3, setV3] = useStageParam('w35_v3', -2);
  const [Rf, setRf] = useStageParam('w35_rf', 20);
  const P = MIX_PRESETS[preset];
  const adc = preset === 'adc_level_shifter';
  const vs = [v1, v2, v3].map((v, k) => (P.fixed?.ch === k ? P.fixed.v : v));
  const on = P.R.map((r) => r !== null);
  const i = vs.map((v, k) => (on[k] ? v / P.R[k]! : 0));
  const w = P.R.map((r) => (r === null ? 0 : Rf / r));
  const iF = i.reduce((a, b) => a + b, 0);
  const vo = -iF * Rf;
  const over = Math.abs(vo) > RAIL;
  const { plus } = opIn(OPY, 68);
  const wHot = useHot('hl_weights');
  const sumId = adc ? 'hl_shift' : 'hl_sum';
  const names = ['CH1 主唱', 'CH2 吉他', 'CH3 贝斯'];

  const pick = (p: MixPreset) => {
    setPreset(p);
    setRf(MIX_PRESETS[p].Rf);
    if (p === 'adc_level_shifter') setV1(1);
  };
  const sliders: { k: number; val: number; set: (v: number) => void; min: number; max: number }[] = [
    { k: 0, val: v1, set: setV1, min: -3, max: 3 },
    { k: 1, val: v2, set: setV2, min: -3, max: 3 },
    { k: 2, val: v3, set: setV3, min: -3.3, max: 3 },
  ];

  return (
    <div className="w35-layer">
      <div className="w35-controls">
        <label className="w35-select">
          <span className="w35-long">预设</span>
          <select value={preset} onChange={(e) => pick(e.target.value as MixPreset)} aria-label="电路预设">
            {(Object.keys(MIX_PRESETS) as MixPreset[]).map((k) => (
              <option key={k} value={k}>
                {MIX_PRESETS[k].label}
              </option>
            ))}
          </select>
        </label>
        <label className="w35-slider one rf">
          <span>
            R_f 总音量 <b>{fmt(Rf, 0)} kΩ</b>
          </span>
          <input type="range" min={2} max={30} step={1} value={Rf} onChange={(e) => setRf(Number(e.target.value))} aria-label="反馈电阻 Rf" />
        </label>
      </div>
      <div className="w35-sliders three">
        {sliders.map(({ k, val, set, min, max }) => {
          const fixed = P.fixed?.ch === k;
          const off = !on[k];
          return (
            <label key={k} className={`c${k + 1} ${fixed || off ? 'off' : ''}`}>
              <span>
                {adc && k === 0 ? 'v_sig 峰值' : fixed ? P.fixed!.name : `v${'₁₂₃'[k]}`} <b>{off ? '未接' : `${fmt(fixed ? P.fixed!.v : val, 1)} V`}</b>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={0.1}
                value={fixed ? P.fixed!.v : val}
                disabled={fixed || off}
                onChange={(e) => set(Number(e.target.value))}
                aria-label={`通道 ${k + 1} 电压`}
              />
            </label>
          );
        })}
      </div>

      <div className="w35-svgwrap">
        <svg viewBox="0 0 420 252" className="w35-svg" role="img" aria-label="三路加权反相加法器">
          <rect x="1" y="1" width="418" height="250" rx="10" className="w35-bg" />
          {YS.map((y, k) => (
            <Obj key={k} id={`hl_v${k + 1}`} box={[4, y - 27, 184, 46]} dim={!on[k]}>
              <Src x={24} y={y} color={C.ch[k]} r={12} />
              <text x={42} y={y - 15} className="w35-tag" fill={C.chT[k]}>
                {names[k]}
                {on[k] && ` ${adc && k === 0 ? 'v_sig ' : P.fixed?.ch === k ? 'Vref ' : ''}${fmt(vs[k], 1)} V`}
              </text>
              <Wire d={`M 36 ${y} H 62 M 112 ${y} H ${BUS}`} dashed={!on[k]} />
              <ResH x1={62} x2={112} y={y} />
              <text x={87} y={y + 4} className="w35-rv" textAnchor="middle">
                {on[k] ? `${fmt(P.R[k]!, P.R[k]! % 1 ? 1 : 0)}k` : '—'}
              </text>
              {on[k] && (
                <>
                  <Flow x1={120} y1={y} x2={180} y2={y} I={i[k]} color={C.ch[k]} />
                  <text x={150} y={y + 15} className="w35-val" textAnchor="middle" fill={i[k] < -1e-9 ? C.backT : C.chT[k]}>
                    {fmt(i[k], 3)} mA
                  </text>
                  {wHot.lit && <rect x={60} y={y + 11} width={54} height={13} rx={4} className="w35-wlit" />}
                  <text x={87} y={y + 20} className="w35-tag" textAnchor="middle" fill={C.ink}>
                    w = {fmt(w[k], 2)}
                  </text>
                </>
              )}
            </Obj>
          ))}
          <Wire d={`M ${BUS} ${YS[0]} V ${YS[2]}`} />
          <Obj id="hl_vground" box={[BUS - 8, NODE - 10, 46, 20]}>
            <Dot x={BUS} y={NODE} color={C.node} r={5} />
            <text x={BUS + 7} y={NODE - 6} className="w35-tag" fill={C.nodeT}>
              a
            </text>
          </Obj>
          <Wire d={`M ${BUS} ${NODE} H ${OPX} M ${OPX} ${plus} H 222 V 160`} />
          <Ground x={222} y={160} />
          <Obj id="hl_opamp" box={[OPX - 6, OPY - 38, 76, 76]}>
            <OpAmp x={OPX} y={OPY} h={68} />
          </Obj>
          <Obj id="hl_rf" box={[BUS + 6, 4, 150, 28]}>
            <Wire d={`M ${BUS} ${YS[0]} V 18 H 252 M 312 18 H 336 V ${OPY}`} />
            <ResH x1={252} x2={312} y={18} color={C.rf} fill="#FEF3F2" />
            <text x={282} y={22} className="w35-rv" textAnchor="middle" fill={C.rfT}>
              {fmt(Rf, 0)}k
            </text>
          </Obj>
          <text x={344} y={14} className="w35-tag" fill={C.rfT}>
            R_f · Master
          </text>
          <Obj id="hl_if" box={[BUS + 6, 26, 58, 26]}>
            <Flow x1={200} y1={36} x2={244} y2={36} I={iF} color={C.rf} />
            <text x={222} y={50} className="w35-val" textAnchor="middle" fill={C.rfT}>
              i_f {fmt(iF, 3)}
            </text>
          </Obj>
          <Obj id="hl_vo" box={[300, OPY - 14, 116, 46]}>
            <Wire d={`M ${OPX + 64} ${OPY} H 404`} />
            <Dot x={336} y={OPY} />
            <Terminal x={404} y={OPY} />
            <Bubble x={410} y={OPY + 22} text={`v_o = ${fmt(vo, 2)} V`} color={over ? C.badT : C.ink} anchor="end" bg={over ? '#FEF3F2' : '#fff'} />
          </Obj>

          <Obj id={sumId} box={[4, 168, 412, 80]}>
            <text x={10} y={177} className="w35-tag" fill={over ? C.badT : C.ink}>
              {over
                ? '|v_o| > 12 V：真实运放（±12 V 供电）会削波，见 03 层'
                : adc
                  ? 'v_o = −v_sig + 1.65 V · 灰虚线 v_sig，蓝线 v_o，绿区 ADC 窗口'
                  : '加权求和：v_o = −Σ wₖvₖ（各段首尾相接）'}
            </text>
            {adc ? <ShiftWave amp={v1} R={[P.R[0]!, P.R[1]!]} Rf={Rf} /> : <SumLine parts={vs.map((v, k) => ({ c: -w[k] * v, color: C.ch[k] }))} vo={vo} on={on} />}
          </Obj>
        </svg>
      </div>

      <div className={`w35-readout grid mix ${wHot.lit ? 'lit' : ''}`} {...wHot.on}>
        {[0, 1, 2].map((k) => (
          <span key={`w${k}`} className={`c${k + 1}`}>
            w{'₁₂₃'[k]} <b>{on[k] ? fmt(w[k], 2) : '—'}</b>
          </span>
        ))}
        <span className="rf">
          i_f <b>{fmt(iF, 3)} mA</b>
        </span>
        {[0, 1, 2].map((k) => (
          <span key={`i${k}`} className={`c${k + 1}`}>
            i{'₁₂₃'[k]} <b>{on[k] ? `${fmt(i[k], 3)} mA` : '—'}</b>
          </span>
        ))}
        <span className={over ? 'bad' : ''}>
          v_o <b>{fmt(vo, 2)} V</b>
        </span>
      </div>
    </div>
  );
}
