// W3-L6 layer 03 · 电阻配对与失配共模泄漏对比台. The four resistors of the gain-10 amplifier with
// their tolerance deviations (presets: ideal, R4 alone +5 %, the worst ±5 % corner, a 0.1 %
// network) and an R4 slider; the bars compare the wanted output A_d·v_d with the common-mode leak
// A_cm·v_cm for v_d = 10 mV, v_cm = 5 V; the readouts give A_d, A_cm, CMRR (and in dB) and the
// input resistances. A fifth preset is Sadiku Example 5.7 (the weighted subtractor of act 5): its
// gains stay covered until the guided example is done (w36_ex = 5) or the student asks.
// Stage params: w36_tol, w36_d4.

import { useStageParam } from '../../stageStore';
import { TOL, fmt, gains, inputR, kOhm, withTol, type TolPreset } from './model';
import { C, Dot, Gnd, Obj, OpAmp, Subs, Wire, useEx57, useHot, zigH, zigV } from './parts';
import './w3l6.css';

const PRESETS: { id: TolPreset; label: string }[] = [
  { id: 'ideal_0pct', label: '理想 0%' },
  { id: 'single_r4_plus5pct', label: '单颗 R₄ +5%' },
  { id: 'worst_case_5pct', label: '最坏 ±5%' },
  { id: 'precision_0_1pct', label: '精密 0.1%' },
  { id: 'ex57', label: 'Ex 5.7' },
];

const VD = 0.01;
const VCM = 5;

const niceMax = (x: number) => {
  const m = Math.max(x, 0.05);
  const p = 10 ** Math.floor(Math.log10(m));
  for (const k of [1, 2, 2.5, 5, 10]) if (k * p >= m - 1e-12) return k * p;
  return 10 * p;
};

const pct = (d: number) => (Math.abs(d) < 1e-9 ? '' : `${d > 0 ? '+' : '−'}${fmt(Math.abs(d), 1)}%`);

export default function MismatchLayer() {
  const [tol, setTol] = useStageParam<TolPreset>('w36_tol', 'single_r4_plus5pct');
  const [d4, setD4] = useStageParam('w36_d4', 5);
  const [ex, setEx] = useEx57();
  const r = withTol(tol, d4);
  const d = [...TOL[tol].d.slice(0, 3), d4];
  const g = gains(r);
  const rin = inputR(r);
  const ex57 = tol === 'ex57';
  const masked = ex57 && ex < 5;
  const showR2 = !ex57 || ex >= 2;
  const showR4 = !ex57 || ex >= 4;
  const sig = Math.abs(g.Ad * VD);
  const leak = g.Acm * VCM;
  const top = niceMax(Math.max(sig, Math.abs(leak)));
  const BASE = 156;
  const H = 104;
  const h = (v: number) => Math.max(1.5, (Math.min(Math.abs(v), top) / top) * H);
  const hAd = useHot('ad');
  const hAcm = useHot('acm');
  const hCmrr = useHot('cmrr');
  const hRin = useHot('rin');
  const q = (on: boolean, s: string) => (on ? s : '?');

  const label = (i: number, name: string, value: number, shown: boolean) => {
    const off = Math.abs(d[i]) > 1e-9;
    return (
      <>
        <tspan fill={off ? C.badT : C.resT}>
          {name} = {shown ? kOhm(value) : '?'}
        </tspan>
        {off && shown && <tspan fill={C.badT}> {pct(d[i])}</tspan>}
      </>
    );
  };

  return (
    <div className="w36-layer">
      <div className="w36-controls">
        <div className="w36-seg" role="radiogroup" aria-label="电阻容差预设">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              role="radio"
              aria-checked={tol === p.id}
              className={tol === p.id ? 'on' : ''}
              onClick={() => {
                setTol(p.id);
                setD4(TOL[p.id].d[3]);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w36-sliders one">
        <label>
          <span>
            R₄ 相对失配 ΔR₄<small>（{ex57 ? '标称 ' + (showR4 ? '10k' : '?') : '标称 100k'}）</small>
          </span>
          <b className={Math.abs(d4) > 1e-9 ? 'bad' : ''}>
            {d4 > 0 ? '+' : ''}
            {fmt(d4, 1)} %
          </b>
          <input type="range" min={-5} max={5} step={0.1} value={d4} onChange={(e) => setD4(Number(e.target.value))} aria-label="R4 相对失配 ΔR4 (%)" />
        </label>
      </div>

      <div className="w36-svgwrap">
        <svg viewBox="0 0 440 200" className="w36-svg" role="img" aria-label="电阻失配与共模泄漏对比">
          <rect x="1" y="1" width="438" height="198" rx="10" className="w36-bg" />
          {/* the circuit */}
          <text x={14} y={64} className="w36-lbl" fill={C.v1T}>
            v₁
          </text>
          <text x={14} y={120} className="w36-lbl" fill={C.v2T}>
            v₂
          </text>
          <Wire d="M 28 60 H 36 M 86 60 H 124 V 74 H 134 M 100 60 V 26 H 120 M 170 26 H 204 V 88 M 28 116 H 36 M 86 116 H 124 V 102 H 134 M 100 116 V 124 M 100 168 V 174" />
          <Obj id="r1" box={[32, 48, 58, 34]}>
            <polyline points={zigH(36, 86, 60, 5)} className="w36-res" />
            <text x={61} y={78} className="w36-tag" textAnchor="middle">
              {label(0, 'R₁', r.R1, true)}
            </text>
          </Obj>
          <Obj id="r2" box={[116, 6, 66, 32]}>
            <polyline points={zigH(120, 170, 26, 5)} className="w36-res" />
            <text x={145} y={15} className="w36-tag" textAnchor="middle">
              {label(1, 'R₂', r.R2, showR2)}
            </text>
          </Obj>
          <Obj id="r3" box={[32, 94, 58, 30]}>
            <polyline points={zigH(36, 86, 116, 5)} className="w36-res" />
            <text x={61} y={104} className="w36-tag" textAnchor="middle">
              {label(2, 'R₃', r.R3, true)}
            </text>
          </Obj>
          <Obj id="r4" box={[22, 122, 92, 50]}>
            <polyline points={zigV(100, 124, 168, 5)} className={`w36-res${Math.abs(d4) > 1e-9 ? ' bad' : ''}`} />
            <text x={92} y={152} className="w36-tag" textAnchor="end">
              {label(3, 'R₄', r.R4, showR4)}
            </text>
          </Obj>
          <Gnd x={100} y={174} />
          <Dot x={100} y={60} color={C.node} />
          <Dot x={100} y={116} color={C.node} />
          <Obj id="opamp" box={[132, 48, 60, 80]}>
            <OpAmp x={134} y={88} w={56} h={56} />
          </Obj>
          <Wire d="M 190 88 H 204" />
          <Dot x={204} y={88} />
          <text x={212} y={84} className="w36-lbl" fill={C.outT}>
            <Subs s="v_o" />
          </text>
          <Obj id="rin" box={[8, 182, 226, 16]}>
            <text x={12} y={194} className="w36-tag" fill={C.muted}>
              <Subs s={`R_in1 = ${kOhm(rin.rin1)} · R_in2 = ${showR4 ? kOhm(rin.rin2) : '?'} · R_id = ${kOhm(rin.rid)}`} />
            </text>
          </Obj>

          {/* the bars */}
          <line x1={232} y1={30} x2={232} y2={BASE} stroke="#e3d8c2" />
          <text x={334} y={18} className="w36-tag" textAnchor="middle" fill={C.ink}>
            <Subs s="输出端（v_d = 10 mV，v_cm = 5 V）" />
          </text>
          <text x={236} y={34} className="w36-tick" fill={C.muted}>
            满刻度 {masked ? '?' : fmt(top, 2)} V
          </text>
          <line x1={232} y1={BASE - H} x2={432} y2={BASE - H} stroke="#e3d8c2" strokeDasharray="3 3" />
          <line x1={232} y1={BASE} x2={432} y2={BASE} stroke={C.wire} strokeWidth={1.4} />
          <Obj id="signal" box={[256, BASE - H - 18, 70, H + 40]}>
            {masked ? (
              <rect x={270} y={BASE - 30} width={42} height={30} className="w36-masked" />
            ) : (
              <rect x={270} y={BASE - h(sig)} width={42} height={h(sig)} rx={2} fill={C.good} />
            )}
            <text x={291} y={(masked ? BASE - 30 : BASE - h(sig)) - 5} className="w36-val" textAnchor="middle" fill={C.good}>
              {masked ? '?' : `${fmt(sig, 4)} V`}
            </text>
            <text x={291} y={BASE + 14} className="w36-tag" textAnchor="middle" fill={C.ink}>
              有用差模
            </text>
            <text x={291} y={BASE + 27} className="w36-tag" textAnchor="middle" fill={C.muted}>
              <Subs s="|A_d·v_d|" />
            </text>
          </Obj>
          <Obj id="leak" box={[346, BASE - H - 18, 76, H + 40]}>
            {masked ? (
              <rect x={364} y={BASE - 30} width={42} height={30} className="w36-masked" />
            ) : (
              <rect x={364} y={BASE - h(leak)} width={42} height={h(leak)} rx={2} fill={Math.abs(leak) < 1e-9 ? C.faint : C.bad} />
            )}
            <text x={385} y={(masked ? BASE - 30 : BASE - h(leak)) - 5} className="w36-val" textAnchor="middle" fill={C.badT}>
              {masked ? '?' : `${fmt(leak, 4, true)} V`}
            </text>
            <text x={385} y={BASE + 14} className="w36-tag" textAnchor="middle" fill={C.ink}>
              共模泄漏
            </text>
            <text x={385} y={BASE + 27} className="w36-tag" textAnchor="middle" fill={C.muted}>
              <Subs s="|A_cm·v_cm|" />
            </text>
          </Obj>
        </svg>
      </div>

      <div className="w36-readout">
        <div className="w36-rgrid three">
          <div className={`w36-cell on${hAd.lit ? ' lit' : ''}`} {...hAd.on}>
            <span className="k">
              A<sub>d</sub> 差模增益
            </span>
            <b>{q(!masked, fmt(g.Ad, 4))}</b>
          </div>
          <div className={`w36-cell on${hAcm.lit ? ' lit' : ''}${!masked && Math.abs(g.Acm) > 1e-9 ? ' bad' : ''}`} {...hAcm.on}>
            <span className="k">
              A<sub>cm</sub> 共模增益
            </span>
            <b>{q(!masked, fmt(g.Acm, 5, true))}</b>
          </div>
          <div className={`w36-cell on${hCmrr.lit ? ' lit' : ''}`} {...hCmrr.on}>
            <span className="k">CMRR</span>
            <b>
              {masked ? '?' : g.cmrr === Infinity ? '∞（∞ dB）' : `${fmt(g.cmrrDb, 2)} dB`}
              {!masked && g.cmrr !== Infinity && <span className="w36-long">（{fmt(g.cmrr, 2)}）</span>}
            </b>
          </div>
        </div>
        <div className={`w36-readout-foot${masked ? ' has-btn' : ''}`}>
          {masked ? (
            <button className="w36-btn" onClick={() => setEx(5)}>
              揭晓数值（第 5 幕例题，先自己做）
            </button>
          ) : (
            <span className={hRin.lit ? 'lit' : ''} {...hRin.on}>
              {Math.abs(leak) < 1e-9
                ? '配对成立：共模泄漏为 0，CMRR → ∞'
                : `泄漏是有用信号的 ${fmt(Math.abs(leak) / Math.max(sig, 1e-12), 2)} 倍${ex57 ? '；纯共模 2 V 时 vₒ = ' + fmt(g.Acm * 2, 3) + ' V' : ''}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
