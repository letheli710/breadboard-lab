// Layer "02 实时双通道示波器": CH1 (amber) the input v_i(t) — square, triangle or grounded — and CH2
// (teal) the output v_o(t) of the circuit picked on layer 01 (ideal / lossy integrator, ideal /
// practical differentiator), from model.simulate() with the LM358's ±9 V swing (+7.5 V / −8.9 V):
// a CLIPPING lamp lights when the output sits on a rail. Controls: f 100–2000 Hz, amplitude
// 0.5–5 V, the 3 mV offset switch (with a slow 0–4 s "power-on" strip: the ideal integrator walks
// into the +7.5 V rail at 2.5 s, the lossy one settles at 33 mV) and the 50 kHz glitch switch
// (drawn as a band, |A(50 kHz)| × 50 mV). While the guided example runs, the stage shows its
// circuit (250 Hz ±3 V, v_o(0) = 0) and uncovers CH2 and the readouts step by step.

import { useMemo } from 'react';
import { at, driftLevel, fmtF, fmtSigned, fmtV, gainAt, isInt, lossyDc, MODE_LABEL, type Mode, RC, simulate, triSlope, VN, VOH, VOL, type Wave } from './model';
import { ScopeView, type Mark } from './ScopeView';
import { Cell, Dock, EX, hides, hoverProps, Seg, Slider, useClearHoverOnUnmount, useClock, useIsLit, useScope, useSimCfg } from './state';

const MODES: Mode[] = ['int', 'lossy', 'diff', 'pdiff'];

/** the slow strip: DC level of the output in the first 4 s after power-on, input grounded */
function DriftStrip({ mode, t, restart }: { mode: Mode; t: number; restart: () => void }) {
  const on = useIsLit();
  const W = 600;
  const H = 74;
  const X = (s: number) => 40 + (s / 4) * (W - 52);
  const Yv = (v: number) => H - 14 - (v / VOH) * (H - 26);
  const ideal = [0, 2.5, 4].map((s) => `${X(s).toFixed(1)} ${Yv(driftLevel('int', s)).toFixed(1)}`).join(' L');
  const lossy = Yv(lossyDc());
  return (
    <div className={`w43-strip ${on('vos')}`} {...hoverProps(['vos'])}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`上电后直流漂移：${t.toFixed(1)} s，输出直流 ${fmtSigned(driftLevel(mode, t))}`}>
        <line x1={40} x2={W - 12} y1={Yv(0)} y2={Yv(0)} className="w43-axis" />
        <line x1={40} x2={W - 12} y1={Yv(VOH)} y2={Yv(VOH)} className="w43-rail" />
        <text x={36} y={Yv(VOH) + 4} className="w43-st end rail">
          +7.5
        </text>
        <text x={36} y={Yv(0) + 4} className="w43-st end">
          0
        </text>
        {[0, 1, 2, 3, 4].map((s) => (
          <text key={s} x={X(s)} y={H - 1} className="w43-st mid">
            {s} s
          </text>
        ))}
        <path d={`M${ideal}`} className={`w43-dline ideal ${mode === 'int' ? 'on' : ''}`} />
        <line x1={X(0)} x2={X(4)} y1={lossy} y2={lossy} className={`w43-dline lossy ${mode === 'lossy' ? 'on' : ''}`} />
        <text x={X(0.9)} y={Yv(4.2)} className="w43-st ideal">
          无 R_f：3 V/s
        </text>
        <text x={X(2.6)} y={lossy - 5} className="w43-st lossy">
          并联 100 kΩ：33 mV
        </text>
        <line x1={X(t)} x2={X(t)} y1={6} y2={Yv(0)} className="w43-cursor" />
        <circle cx={X(t)} cy={Yv(driftLevel(mode, t))} r={4.5} className="w43-cdot" />
      </svg>
      <button className="w43-toggle" onClick={restart}>
        重新上电
      </button>
    </div>
  );
}

export default function Scope() {
  useClearHoverOnUnmount();
  const s = useScope();
  const hide = hides(s);
  const int = isInt(s.mode);
  const drifting = s.vos && int;
  const [tOn, restart] = useClock(`${s.mode}|${s.wave}|${s.ic}|${s.vos}`, drifting);
  const cfg = useSimCfg(s, tOn);
  const tr = useMemo(() => simulate(cfg), [cfg]);
  const T = 1 / s.f;
  const zero = s.mode === 'int' && s.ic === 'zero' && s.wave !== 'gnd';
  const outUpto = s.ex ? (hide.seg1 ? 0 : hide.seg2 ? 0.25 : 1) : 1;
  const vHalf = at(tr, T / 2);
  const vFull = at(tr, T);
  const marks: Mark[] = [];
  if (zero && outUpto >= 0.25) marks.push({ x: 0.25, v: vHalf, label: `v_o(T/2) = ${fmtSigned(vHalf, 1)}` });
  if (zero && outUpto >= 0.5) marks.push({ x: 0.5, v: vFull, label: `v_o(T) = ${fmtSigned(vFull, 1)}` });
  const vpp = tr.max - tr.min;
  const bandOut = s.glitch ? gainAt(s.mode, 50_000) * VN : 0;
  const noiseHit = bandOut > 0 && (tr.max + bandOut > VOH || tr.min - bandOut < VOL);
  const lamp = (tr.clipped || noiseHit) && !hide.sat;
  const q = (hidden: boolean, v: string) => (hidden ? '?' : v);
  const sq = s.wave === 'square';
  const slope = int && sq ? `${(s.amp / RC / 1000).toFixed(2)} V/ms` : '—';
  const plateau = !int && s.wave === 'tri' ? RC * triSlope(s.amp, s.f) : null;
  const status = tr.clipped ? '削顶' : noiseHit ? '毛刺撞轨' : '通过';
  return (
    <div className="w43-layer">
      {s.ex ? (
        <div className="w43-exbar" {...hoverProps(['ch1', 'ch2'])}>
          <span>
            <b>引导例题</b>
            <span className="full">
              {' '}
              CH1：{EX.f} Hz、±{s.amp} V 方波 → 理想积分器（R = 10 kΩ，C = 100 nF），v_o(0) = 0；CH2 随解题进度揭晓
            </span>
            <span className="short">
              {' '}
              {EX.f} Hz ±{s.amp} V → 积分器，v_o(0) = 0
            </span>
          </span>
          <button className="w43-toggle" onClick={() => s.set({ scn: 'free', mode: 'int', wave: 'square', f: 500, amp: 2, ic: 'sym' })}>
            <span className="full">自由调节</span>
            <span className="short">自由</span>
          </button>
        </div>
      ) : (
        <Dock
          head={
            <Seg
              label="电路"
              value={s.mode}
              set={(v) => s.set({ mode: v, wave: isInt(v) ? (s.wave === 'tri' ? 'square' : s.wave) : s.wave === 'square' ? 'tri' : s.wave })}
              opts={MODES.map((m) => ({ v: m, full: MODE_LABEL[m][0], short: MODE_LABEL[m][1] }))}
              hl={['opamp']}
            />
          }
        >
          <div className="w43-row">
            <Seg<Wave>
              label="CH1 输入波形"
              small
              value={s.wave}
              set={(v) => s.set({ wave: v })}
              opts={[
                { v: 'square', full: '方波', short: '方' },
                { v: 'tri', full: '三角波', short: '三角' },
                { v: 'gnd', full: '输入接地', short: '接地' },
              ]}
              hl={['ch1']}
            />
            <button className={`w43-toggle ${s.vos ? 'on' : ''}`} aria-pressed={s.vos} onClick={() => s.set({ vos: !s.vos })} {...hoverProps(['vos'])}>
              <span className="full">失调 V_OS = {s.vos ? '3 mV' : '0'}</span>
              <span className="short">V_OS {s.vos ? '3 mV' : '0'}</span>
            </button>
            <button className={`w43-toggle ${s.glitch ? 'on' : ''}`} aria-pressed={s.glitch} onClick={() => s.set({ glitch: !s.glitch })} {...hoverProps(['noise'])}>
              <span className="full">50 kHz 毛刺 {s.glitch ? '开' : '关'}</span>
              <span className="short">毛刺 {s.glitch ? '开' : '关'}</span>
            </button>
            {s.mode === 'int' && s.wave !== 'gnd' && (
              <Seg
                label="积分初值"
                small
                value={s.ic}
                set={(v) => s.set({ ic: v })}
                opts={[
                  { v: 'sym', full: '对称稳态', short: '稳态' },
                  { v: 'zero', full: '从 v_o(0) = 0 起积', short: 'v_o(0)=0' },
                ]}
                hl={['c_fb']}
              />
            )}
          </div>
          <div className="w43-row">
            <Slider name="f" value={s.f} min={100} max={2000} step={50} set={(v) => s.set({ f: v })} text={fmtF(s.f)} aria="信号频率 f" hl="ch1" />
            <Slider
              name="V_in"
              value={s.amp}
              min={0.5}
              max={5}
              step={0.1}
              set={(v) => s.set({ amp: Math.round(v * 10) / 10 })}
              text={`±${s.amp.toFixed(1)} V`}
              aria="输入幅值"
              hl="ch1"
            />
          </div>
        </Dock>
      )}
      <div className="w43-scopebar">
        <span className="in" {...hoverProps(['ch1'])}>
          CH1 v_i
        </span>
        <span className="out" {...hoverProps(['ch2'])}>
          CH2 v_o{outUpto < 1 ? (outUpto === 0 ? '（待求）' : '（待续）') : ''}
        </span>
        {lamp && (
          <b className="w43-lamp" role="alert" {...hoverProps(['sat'])}>
            CLIPPING / 饱和削顶
          </b>
        )}
      </div>
      <div className="w43-screen-wrap">
        <ScopeView
          tr={tr}
          f={s.f}
          outUpto={outUpto}
          bandIn={s.glitch ? VN : 0}
          bandOut={bandOut}
          marks={marks}
          caption={`示波器：CH1 ${fmtF(s.f)} 输入，CH2 ${MODE_LABEL[s.mode][0]}输出${outUpto < 1 ? '（部分待揭晓）' : `，峰峰值 ${fmtV(vpp)}`}`}
        />
      </div>
      {drifting && !s.ex && <DriftStrip mode={s.mode} t={tOn} restart={restart} />}
      <div className="w43-cells">
        <Cell id="ch2" name="CH2 峰峰值" short="CH2 Vpp" value={q(s.ex && hide.seg2, fmtV(vpp))} />
        {zero ? (
          <>
            <Cell id="vo" name="v_o(T/2)" value={q(s.ex && hide.seg1, fmtSigned(vHalf))} />
            <Cell id="vo" name="v_o(T)" value={q(s.ex && hide.seg2, fmtSigned(vFull))} />
          </>
        ) : (
          <Cell id="vo" name="CH2 最高 / 最低" short="max/min" value={`${fmtSigned(tr.max, 1)} / ${fmtSigned(tr.min, 1)}`} />
        )}
        <Cell id="sat" name="饱和校验" short="饱和" value={q(s.ex && hide.sat, status)} cls={s.ex && hide.sat ? '' : tr.clipped || noiseHit ? 'bad' : 'good'} />
        {int || zero ? (
          <Cell id="slope" name="斜率 |k| = V_in/RC" short="|k|" value={q(s.ex && hide.seg1, slope)} />
        ) : (
          <Cell id="slope" name="平台 RC·dv_i/dt" short="平台" value={plateau !== null ? `±${plateau.toFixed(2)} V` : sq ? '边沿尖峰' : '—'} />
        )}
        <Cell id="ch1" name="CH1 输入" short="CH1" value={s.wave === 'gnd' ? '0 V（接地）' : `${fmtF(s.f)} · ${(2 * s.amp).toFixed(1)} Vpp`} />
        {s.glitch ? (
          <Cell
            id="noise"
            name="毛刺输出幅值"
            short="毛刺"
            value={`${bandOut >= 1 ? bandOut.toFixed(2) + ' V' : (bandOut * 1000).toFixed(bandOut < 0.01 ? 2 : 0) + ' mV'}`}
            cls={bandOut > 1 ? 'bad' : 'good'}
          />
        ) : drifting ? (
          <Cell
            id="vos"
            name={`上电 ${tOn.toFixed(1)} s 直流`}
            short={`${tOn.toFixed(1)} s`}
            value={fmtSigned(driftLevel(s.mode, tOn), s.mode === 'lossy' ? 3 : 2)}
            cls={driftLevel(s.mode, tOn) >= VOH - 1e-6 ? 'bad' : ''}
          />
        ) : null}
      </div>
    </div>
  );
}
