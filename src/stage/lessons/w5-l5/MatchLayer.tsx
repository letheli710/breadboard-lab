// Layer 03 · AC conjugate matching (Z_L = Z_Th*) and the power peak. Top: the Thévenin source
// V_Th with Z_Th = R_Th + jX_Th feeding the load Z_L = R_L + jX_L (for the guided example: its
// original circuit, 20∠0° V – 10 Ω – shunt −j10 Ω – +j8 Ω). The resonance lamp lights when
// X_Th + X_L = 0. Middle: P(R_L) at the present X_L (blue) and at X_L = −X_Th (green dashed), the
// peak P_max at R_L = R_Th (gold) and the present load (dot). Below: the two forms of P_max side by
// side — |V_Th|²/(8R_Th) for a peak phasor, V_Th,rms²/(4R_Th) for an RMS phasor — the one of the
// chosen phasor convention highlighted, with what the wrong denominator would give. Every source
// here is given as a PEAK phasor (as in the sheet); the RMS switch shows the same source as an RMS
// phasor, |V_Th|/√2. While the guided example runs, its numbers stay covered until reached
// (stage param w55_g = steps solved).

import { abs, argDeg, fmt, fmtCx, loadPower, match, RL_RANGE, snap, SOURCES, XL_RANGE, type SrcKey } from './model';
import { Cell, DEF, P, Seg, Slider, SSub, useClearHoverOnUnmount, useHot, useP, type Mode } from './parts';
import './w5l5.css';

const X0 = 50;
const X1 = 446;
const YT = 136;
const YB = 266;
const RMAX = 20;
const N = 200;

const X = (r: number) => X0 + (r / RMAX) * (X1 - X0);

const LOADS: Record<SrcKey, [number, number]> = { a5: [4, 0], a6: [DEF.rl, DEF.xl], gd: [2, 0] };

/** a labelled impedance box on the top wire */
function Box({ x, w, y = 30, name, val, tone }: { x: number; w: number; y?: number; name: string; val: string; tone: string }) {
  return (
    <g>
      <rect x={x} y={y - 10} width={w} height={20} rx={4} className={`w55-zbox ${tone}`} />
      <text x={x + w / 2} y={y + 4} className={`w55-lbl mid ${tone}`}>
        <SSub s={name} />
      </text>
      <text x={x + w / 2} y={y + 25} className={`w55-tk mid ${tone}`}>
        {val}
      </text>
    </g>
  );
}

export default function MatchLayer() {
  useClearHoverOnUnmount();
  const hot = useHot();
  const [src, setSrc] = useP<SrcKey>(P.src, DEF.src);
  const [rl, setRl] = useP(P.rl, DEF.rl);
  const [xl, setXl] = useP(P.xl, DEF.xl);
  const [mode, setMode] = useP<Mode>(P.mode, DEF.mode);
  const [gRaw, setG] = useP(P.g, 0);
  const isG = src === 'gd';
  const g = isG ? gRaw : 5;
  const seen = (n: number) => g >= n;
  const s = SOURCES[src];
  const m = match(s);
  const Rth = s.zth.re;
  const Xth = s.zth.im;
  const pmax = m.pmax8;
  const p = loadPower(s, rl, xl);
  const xsum = Xth + xl;
  const resonant = Math.abs(xsum) < 0.05;
  const peakHere = resonant && Math.abs(rl - Rth) < 0.05;
  const showCurve = seen(3);
  const showP = seen(5);

  const ymax = pmax * 1.28;
  const Y = (v: number) => YB - (v / ymax) * (YB - YT);
  const curve = (x: number) =>
    Array.from({ length: N + 1 }, (_, k) => (k / N) * RMAX)
      .map((r, k) => `${k ? 'L' : 'M'} ${X(r).toFixed(1)} ${Y(loadPower(s, r, x)).toFixed(1)}`)
      .join(' ');

  const vTxt = !seen(2) ? '?' : mode === 'peak' ? `${fmt(abs(s.vth))}∠${fmt(argDeg(s.vth))}° V（峰值）` : seen(4) ? `${fmt(m.vrms)}∠${fmt(argDeg(s.vth))}° V（RMS）` : '? V（RMS）';
  const vName = mode === 'peak' ? 'V_Th = ' : 'V_Th,rms = ';
  const pick = (k: SrcKey) => {
    setSrc(k);
    setRl(LOADS[k][0]);
    setXl(LOADS[k][1]);
  };
  const wrong = mode === 'peak' ? { what: '误把峰值代入 /4', val: 2 * pmax, note: '大一倍' } : { what: '误把 RMS 代入 /8', val: pmax / 2, note: '少一半' };

  return (
    <div className="w55-layer">
      <div className="w55-controls">
        <Seg<SrcKey>
          label="电路"
          value={src}
          onChange={pick}
          options={[
            { value: 'a5', label: '第 5 幕例题', short: '幕 5' },
            { value: 'a6', label: '第 6 幕实战', short: '幕 6' },
            { value: 'gd', label: '引导例题', short: '引导' },
          ]}
        />
        <Seg<Mode>
          label="相量标定模式"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'peak', label: '峰值相量 ÷8', short: '峰值÷8' },
            { value: 'rms', label: 'RMS 相量 ÷4', short: 'RMS÷4' },
          ]}
        />
        {isG && gRaw < 5 && (
          <button type="button" className="w55-toggle" onClick={() => setG(5)}>
            直接揭晓
          </button>
        )}
      </div>
      <div className="w55-svgwrap">
        <svg viewBox="0 0 460 296" className="w55-svg" role="img" aria-label="交流共轭匹配功率峰值台">
          <rect x={4} y={2} width={452} height={118} rx={8} className="w55-panel" />
          {/* ------------------------------------------------ the circuit */}
          {isG ? (
            <g>
              <g {...hot('gd_vs')}>
                <circle cx={30} cy={62} r={15} className="w55-src" />
                <path d="M 22 62 q 4 -8 8 0 t 8 0" className="w55-srcwave" />
                <text x={38} y={90} className="w55-tk v">
                  20∠0° V
                </text>
              </g>
              <path d="M 30 47 V 30 H 56 M 106 30 H 166 M 216 30 H 386 V 98 H 30 V 77" className="w55-wire" />
              <g {...hot('gd_r1')}>
                <Box x={56} w={50} name="R_1" val="10 Ω" tone="r" />
              </g>
              <g {...hot('gd_c')}>
                <path d="M 136 30 V 50 M 136 82 V 98" className="w55-wire" />
                <rect x={118} y={50} width={36} height={32} rx={4} className="w55-zbox c" />
                <text x={136} y={70} className="w55-tk mid c">
                  −j10 Ω
                </text>
              </g>
              <g {...hot('gd_l')}>
                <Box x={166} w={50} name="L" val="+j8 Ω" tone="l" />
              </g>
              <circle cx={236} cy={30} r={3.6} className="w55-term" />
              <circle cx={236} cy={98} r={3.6} className="w55-term" />
              <text x={236} y={18} className="w55-lbl mid term">
                a
              </text>
              <text x={244} y={93} className="w55-lbl term">
                b
              </text>
            </g>
          ) : (
            <g>
              <g {...hot('mt_vth')}>
                <circle cx={30} cy={62} r={15} className="w55-src" />
                <path d="M 22 62 q 4 -8 8 0 t 8 0" className="w55-srcwave" />
                <text x={38} y={90} className="w55-lbl v">
                  <SSub s="V_Th" />
                </text>
              </g>
              <path d="M 30 47 V 30 H 56 M 106 30 H 116 M 176 30 H 250 M 376 30 H 386 V 98 H 30 V 77" className="w55-wire" />
              <g {...hot('mt_zth')}>
                <Box x={56} w={50} name="R_Th" val={`${fmt(Rth)} Ω`} tone="r" />
                <Box x={116} w={60} name="jX_Th" val={`${Xth < 0 ? '−' : '+'}j${fmt(Math.abs(Xth))} Ω`} tone="l" />
              </g>
              <circle cx={212} cy={30} r={3.6} className="w55-term" />
              <circle cx={212} cy={98} r={3.6} className="w55-term" />
              <text x={212} y={18} className="w55-lbl mid term">
                a
              </text>
              <text x={220} y={93} className="w55-lbl term">
                b
              </text>
            </g>
          )}
          <g {...hot('mt_zl')}>
            <Box x={250} w={56} name="R_L" val={`${fmt(rl, 1)} Ω`} tone="r" />
            <Box x={314} w={62} name="jX_L" val={`${xl < 0 ? '−' : '+'}j${fmt(Math.abs(xl), 1)} Ω`} tone="l" />
            <rect x={244} y={8} width={138} height={58} rx={6} className="w55-dash" />
          </g>
          <g {...hot('mt_lamp')}>
            <circle cx={421} cy={52} r={11} className={`w55-lamp${showCurve && resonant ? ' on' : ''}`} />
            <text x={421} y={80} className="w55-tk mid">
              谐振灯
            </text>
            <text x={421} y={93} className="w55-tk mid">
              {showCurve ? <SSub s={`X_Th+X_L=${fmt(xsum, 1)}`} /> : '?'}
            </text>
          </g>
          {/* the Thévenin values (the guided example: as far as it has got) */}
          <g {...hot('mt_zth')}>
            <text x={14} y={114} className={`w55-tk${isG ? ' w55-g' : ''}`}>
              <SSub s={`Z_Th = ${seen(1) ? `${fmtCx(s.zth)} Ω` : '?'}`} />
            </text>
          </g>
          <g {...hot('mt_vth')}>
            <text x={isG ? 126 : 150} y={114} className={`w55-tk${isG ? ' w55-g' : ''}`}>
              <SSub s={`${vName}${vTxt}`} />
            </text>
          </g>
          {/* ------------------------------------------------ P(R_L) */}
          <rect x={X0} y={YT} width={X1 - X0} height={YB - YT} className="w55-screen" />
          <text x={X0} y={YT - 6} className="w55-tk">
            <SSub s="负载功率 P（W）随 R_L 变化" />
          </text>
          {[0, 5, 10, 15, 20].map((r) => (
            <g key={r}>
              <line x1={X(r)} x2={X(r)} y1={YT} y2={YB} className="w55-grid" />
              <text x={X(r)} y={YB + 12} className="w55-tk mid">
                {r}
              </text>
            </g>
          ))}
          <text x={X1} y={YB + 26} className="w55-tk end">
            <SSub s="R_L（Ω）" />
          </text>
          {showCurve ? (
            <>
              <g {...hot('mt_conj')}>
                <path d={curve(-Xth)} className="w55-hit" />
                <path d={curve(-Xth)} className="w55-tr conj" />
              </g>
              <g {...hot('mt_curve')}>
                <path d={curve(xl)} className="w55-hit" />
                <path d={curve(xl)} className="w55-tr cur" />
              </g>
              <g {...hot('mt_peak')}>
                <path d={`M ${X0} ${Y(pmax)} H ${X(Rth)} V ${YB}`} className="w55-guide" />
                <circle cx={X(Rth)} cy={Y(pmax)} r={5} className={`w55-peak${peakHere ? ' locked' : ''}`} />
                <text x={X(Rth) + 8} y={Y(pmax) - 4} className="w55-lbl peak">
                  <SSub s={showP ? `P_max = ${fmt(pmax)} W${peakHere ? '（已锁定）' : ''}` : 'P_max = ?'} />
                </text>
                <text x={X(Rth)} y={YB + 24} className="w55-tk mid peak halo">
                  <SSub s={`R_Th=${fmt(Rth)}`} />
                </text>
                <text x={X0 - 5} y={Y(pmax) + 3.5} className="w55-tk end peak">
                  {showP ? fmt(pmax, 1) : '?'}
                </text>
              </g>
              <g {...hot('mt_op')}>
                <circle cx={X(Math.min(RMAX, rl))} cy={Y(p)} r={4} className="w55-op" />
              </g>
            </>
          ) : (
            <text x={(X0 + X1) / 2} y={(YT + YB) / 2} className="w55-lbl mid wait">
              功率曲线在引导例题第 3 步答对后显示
            </text>
          )}
          <text x={X0 - 5} y={YB + 3.5} className="w55-tk end">
            0
          </text>
        </svg>
      </div>
      <div className="w55-cells">
        <Cell id="mt_div8" name="峰值相量 |V_Th|²/(8R_Th)" value={showP ? `${fmt(m.pmax8)} W` : '? W'} tone="v" on={mode === 'peak'} />
        <Cell id="mt_div4" name="RMS 相量 V_Th,rms²/(4R_Th)" value={showP ? `${fmt(m.pmax4)} W` : '? W'} tone="sq" on={mode === 'rms'} />
        <Cell id="mt_op" name="当前负载 P" value={showP ? `${fmt(p)} W（${fmt((100 * p) / pmax, 0)}%）` : '? W'} tone="avg" />
      </div>
      {showP && (
        <div className="w55-warn">
          {wrong.what}：{fmt(wrong.val)} W（{wrong.note}）——峰值除八，有效除四。
        </div>
      )}
      <div className="w55-sliders">
        <Slider
          id="mt_zl"
          name="负载电阻 R_L"
          value={rl}
          min={RL_RANGE.min}
          max={RL_RANGE.max}
          step={RL_RANGE.step}
          unit="Ω"
          onChange={(v) => setRl(snap(v, RL_RANGE.step, RL_RANGE.min))}
        />
        <Slider
          id="mt_lamp"
          name="负载电抗 X_L"
          value={xl}
          min={XL_RANGE.min}
          max={XL_RANGE.max}
          step={XL_RANGE.step}
          unit="Ω"
          onChange={(v) => setXl(snap(v, XL_RANGE.step, XL_RANGE.min))}
        />
      </div>
    </div>
  );
}
