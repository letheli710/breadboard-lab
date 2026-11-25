// W2-L5 layer 03 · 功率不可叠加反例对比台. Scenario A (act 3 circuit, R = 4 Ω: i1 = 0.5 A, i2 = 2 A)
// and scenario B (act 6 circuit, R = 2 Ω: i1 = 3 A, i2 = −2 A) set R and preset the two component
// currents; the sliders move them (−5 … 5 A). Top: three bars as a waterfall — the wrong sum
// p1 + p2, the cross term 2 i1 i2 R running from its end (amber up, red down), the true power
// (i1 + i2)² R. Bottom: the parabola p(i) = R i² with P1, P2, the true point P and the hollow
// "wrong sum" point above i1 + i2; the gap between them is the cross term. Scenario B at its
// preset is the act 6 challenge: its true power stays covered until the guided example is done
// or the student asks (w5_shown). Stage params: w5_scn, w5_i1, w5_i2, w5_shown.

import { useStageParam } from '../../stageStore';
import { fmt, powerSplit } from './model';
import { C, L3, Obj, useStepLayer } from './parts';
import './w2l5.css';

type Scn = 'A' | 'B';
const SCN: Record<Scn, { label: string; more: string; R: number; i1: number; i2: number }> = {
  A: { label: '场景 A：同向增强', more: ' (+8 W 交叉项)', R: 4, i1: 0.5, i2: 2 },
  B: { label: '场景 B：反向抵消', more: ' (-24 W 交叉项)', R: 2, i1: 3, i2: -2 },
};

const GREY = '#64748b';
const GREY2 = '#94a3b8';
const RED = '#e11d48';
const AMBER = '#d97706';
const GREEN = '#059669';

/** a round number ≥ x for an axis end */
function niceCeil(x: number) {
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= x - 1e-9) return m * p;
  return 10 * p;
}

export default function PowerLayer() {
  useStepLayer(L3);
  const [scn, setScn] = useStageParam<Scn>('w5_scn', 'A');
  const [i1, setI1] = useStageParam('w5_i1', SCN.A.i1);
  const [i2, setI2] = useStageParam('w5_i2', SCN.A.i2);
  const [shown, setShown] = useStageParam('w5_shown', 0);
  const R = SCN[scn].R;
  const P = powerSplit(i1, i2, R);
  const masked = scn === 'B' && i1 === SCN.B.i1 && i2 === SCN.B.i2 && shown < 5;
  const pick = (s: Scn) => {
    setScn(s);
    setI1(SCN[s].i1);
    setI2(SCN[s].i2);
  };

  /* bars (waterfall) */
  const BX = 120;
  const BW = 160;
  const pMax = Math.max(P.wrong, P.p, 1);
  const bx = (p: number) => BX + (p / pMax) * BW;
  const W = (v: number, signed = false) => `${fmt(v, signed)} W`;

  /* parabola */
  const X0 = 40;
  const X1 = 400;
  const Y0 = 262;
  const Y1 = 150;
  const iMax = niceCeil(Math.max(1, Math.abs(i1), Math.abs(i2), Math.abs(P.i)) * 1.1);
  const pTop = Math.max(R * iMax * iMax, P.wrong) * 1.05;
  const px = (i: number) => X0 + ((i + iMax) / (2 * iMax)) * (X1 - X0);
  const py = (p: number) => Y0 - (p / pTop) * (Y0 - Y1);
  const curve = Array.from({ length: 81 }, (_, k) => {
    const i = -iMax + (2 * iMax * k) / 80;
    return `${px(i).toFixed(1)},${py(R * i * i).toFixed(1)}`;
  }).join(' ');
  const crossColor = P.cross >= 0 ? AMBER : RED;

  return (
    <div className="w5-layer">
      <div className="w5-controls">
        <div className="w5-seg" role="tablist" aria-label="场景">
          {(['A', 'B'] as Scn[]).map((s) => (
            <button key={s} role="tab" aria-selected={scn === s} className={scn === s ? 'on' : ''} onClick={() => pick(s)}>
              {SCN[s].label}
              <small>{SCN[s].more}</small>
            </button>
          ))}
        </div>
        <span className="w5-chip">R = {R} Ω</span>
      </div>
      <div className="w5-sliders">
        <label>
          <span>分量电流 i₁ (A)</span>
          <input type="range" min={-5} max={5} step={0.5} value={i1} onChange={(e) => setI1(Number(e.target.value))} />
          <b className="c1">{fmt(i1, true)}</b>
        </label>
        <label>
          <span>分量电流 i₂ (A)</span>
          <input type="range" min={-5} max={5} step={0.5} value={i2} onChange={(e) => setI2(Number(e.target.value))} />
          <b className="c2">{fmt(i2, true)}</b>
        </label>
      </div>

      <div className="w5-svgwrap">
        <svg viewBox="0 0 420 280" className="w5-svg" role="img" aria-label="功率反例：错误叠加、交叉项与真实功率，以及抛物线 p = R i²">
          <rect x="1" y="1" width="418" height="278" rx="10" className="w5-bg" />
          {/* bars */}
          <Obj id="hl_wrong_sum" box={[6, 12, 408, 30]}>
            <text x={12} y={32} className="w5-blbl" fill="#3a4560">
              错误叠加 p₁ + p₂
            </text>
            <rect x={BX} y={18} width={Math.max(0, bx(P.p1) - BX)} height={18} rx={3} fill={GREY2} />
            <rect x={bx(P.p1)} y={18} width={Math.max(0, bx(P.wrong) - bx(P.p1))} height={18} rx={3} fill={GREY} />
            <text x={bx(P.wrong) + 6} y={32} className="w5-val" fill={C.ink} textAnchor="start">
              {fmt(P.p1)} + {fmt(P.p2)} = {W(P.wrong)}
            </text>
          </Obj>
          <Obj id="hl_cross" box={[6, 48, 408, 30]}>
            <text x={12} y={68} className="w5-blbl" fill={crossColor}>
              交叉项 2i₁i₂R
            </text>
            {masked ? (
              <text x={BX + 8} y={68} className="w5-val" fill={C.muted} textAnchor="start">
                ? W
              </text>
            ) : (
              <>
                <line x1={bx(P.wrong)} y1={50} x2={bx(P.wrong)} y2={76} stroke={GREY} strokeDasharray="3 3" />
                <rect x={Math.min(bx(P.wrong), bx(P.p))} y={54} width={Math.max(1.5, Math.abs(bx(P.p) - bx(P.wrong)))} height={18} rx={3} fill={crossColor} />
                <text x={Math.max(bx(P.wrong), bx(P.p)) + 6} y={68} className="w5-val" fill={crossColor} textAnchor="start">
                  {W(P.cross, true)}
                </text>
              </>
            )}
          </Obj>
          <Obj id="hl_true_p" box={[6, 84, 408, 30]}>
            <text x={12} y={104} className="w5-blbl" fill="#047857">
              真实总功率 p
            </text>
            {masked ? (
              <text x={BX + 8} y={104} className="w5-val" fill={C.muted} textAnchor="start">
                p = (i₁+i₂)²R = ? W
              </text>
            ) : (
              <>
                <rect x={BX} y={90} width={Math.max(1.5, bx(P.p) - BX)} height={18} rx={3} fill={GREEN} />
                <text x={bx(P.p) + 6} y={104} className="w5-val" fill="#047857" textAnchor="start">
                  ({fmt(P.i)})² × {R} = {W(P.p)}
                </text>
              </>
            )}
          </Obj>
          <line x1={BX} y1={14} x2={BX} y2={114} stroke={C.wire} strokeWidth={1.2} />

          {/* parabola */}
          <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.wire} strokeWidth={1.2} />
          <line x1={px(0)} y1={Y1 - 14} x2={px(0)} y2={Y0} stroke={C.wire} strokeWidth={1.2} />
          <text x={px(0) + 5} y={Y1 - 4} className="w5-tick" fill="#5f626b" textAnchor="start">
            p (W)
          </text>
          <text x={X1} y={Y0 - 6} className="w5-tick" fill="#5f626b" textAnchor="end">
            i (A)
          </text>
          {[-iMax, -iMax / 2, 0, iMax / 2, iMax].map((v) => (
            <text key={v} x={px(v)} y={Y0 + 14} className="w5-tick" fill="#5f626b" textAnchor="middle">
              {fmt(v)}
            </text>
          ))}
          <Obj id="hl_parabola" box={[X0 - 4, Y1 - 6, X1 - X0 + 8, Y0 - Y1 + 10]}>
            <polyline points={curve} fill="none" stroke={C.ink} strokeWidth={2} />
            <text x={X0 + 26} y={Y1 + 4} className="w5-val halo" fill={C.ink} textAnchor="start">
              p(i) = R·i²
            </text>
          </Obj>
          <circle cx={px(i1)} cy={py(P.p1)} r={4.5} fill={C.vs} />
          <circle cx={px(i2)} cy={py(P.p2)} r={4.5} fill={C.is} />
          <text x={px(i1)} y={py(P.p1) - 8} className="w5-tick" textAnchor="middle" fill={C.vsT}>
            P₁
          </text>
          <text x={px(i2)} y={py(P.p2) - 8} className="w5-tick" textAnchor="middle" fill={C.isT}>
            P₂
          </text>
          <circle cx={px(P.i)} cy={py(P.wrong)} r={4.5} fill="#fff" stroke={GREY} strokeWidth={2} />
          {!masked && (
            <>
              <line x1={px(P.i)} y1={py(P.wrong)} x2={px(P.i)} y2={py(P.p)} stroke={crossColor} strokeWidth={3} strokeDasharray="5 3" />
              <circle cx={px(P.i)} cy={py(P.p)} r={5} fill={GREEN} stroke="#fff" strokeWidth={1.5} />
            </>
          )}
        </svg>
      </div>

      <div className="w5-tele">
        {masked ? (
          <button className="w5-btn" onClick={() => setShown(5)}>
            揭晓真实功率（第 6 幕实战题，先自己做）
          </button>
        ) : (
          <div className="w5-tele-name">
            p = (i₁ + i₂)²R = p₁ + p₂ + 2i₁i₂R：{fmt(P.p1)} + {fmt(P.p2)} {P.cross < 0 ? '−' : '+'} {fmt(Math.abs(P.cross))} = {W(P.p)}
            <span className="w5-dev" style={{ color: crossColor }}>
              抛物线上的虚线落差 = 非线性偏差 {W(P.cross, true)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
