// Oscilloscope panel: shown in the stage while at least one scope probe is on the board.
// Traces come from the transient simulation (periodic steady state, see core/transient.ts);
// without a function generator (or a PWM pin on a dev board) each channel is a flat DC line.

import { useEffect, useMemo, useRef } from 'react';
import { formatSI, volts } from '../core/format';
import { tr } from '../core/i18n';
import { freq, phaseDeg, vavg, vmax, vmin, vpp, vrms } from '../core/transient';
import { useScopeData, type ScopeChannelData, type ScopeData } from '../state/derived';
import { useStore } from '../state/store';
import { CH_COLORS } from '../three/common';

const DIV_X = 10;
const DIV_Y = 8;
// the screen is 10:7 (wider than the 10:8 grid would be) — divisions are not square, like many scopes
/** trigger point sits one division in from the left edge */
const TRIG_DIV = 1;

/** 1-2-5 sequence from 1e-7 to 50 */
const SEQ: number[] = [];
for (let e = -7; e <= 1; e++) for (const m of [1, 2, 5]) SEQ.push(+(m * 10 ** e).toPrecision(3));
const T_STEPS = SEQ.filter((x) => x >= 1e-6 && x <= 1);
const V_STEPS = SEQ.filter((x) => x >= 1e-3 && x <= 20);

const ceilStep = (steps: number[], x: number) => steps.find((s) => s >= x * 0.999) ?? steps[steps.length - 1];
const stepBy = (steps: number[], x: number, d: number) => {
  let i = steps.findIndex((s) => s >= x * 0.999);
  if (i < 0) i = steps.length - 1;
  return steps[Math.min(steps.length - 1, Math.max(0, i + d))];
};

interface ChStats {
  vpp: number;
  vavg: number;
  vrms: number;
  vmax: number;
  vmin: number;
  freq: number;
}

function stats(ch: ScopeChannelData, data: ScopeData): ChStats {
  const v = ch.v;
  return {
    vpp: vpp(v),
    vavg: vavg(v),
    vrms: vrms(v),
    vmax: vmax(v),
    vmin: vmin(v),
    freq: data.ac ? freq(v, data.dt) : 0,
  };
}

/** Frequency from rising mid-level crossings, treating the window as periodic (it holds whole
 *  periods), so a crossing right at the start of the window is counted too. */
function autoTdiv(data: ScopeData): number {
  // about 2.5 periods across the screen
  return data.period ? ceilStep(T_STEPS, (data.period * 2.5) / DIV_X) : 1e-3;
}

function autoVdiv(s: ChStats | undefined): number {
  if (!s) return 1;
  const peak = Math.max(Math.abs(s.vmax), Math.abs(s.vmin));
  return peak < 1e-4 ? 1 : ceilStep(V_STEPS, peak / 3.4);
}

/** Time of the first rising crossing of the mid level (s); 0 for a flat trace. */
function triggerTime(v: ArrayLike<number>, dt: number): number {
  const hi = vmax(v);
  const lo = vmin(v);
  if (!(hi - lo > 1e-6) || v.length < 3) return 0;
  const level = (hi + lo) / 2;
  const hy = (hi - lo) * 0.1;
  const n = v.length;
  // arm on a sample clearly below the level, then look for the crossing (wrapping: window is periodic)
  let armed = false;
  for (let k = 0; k < 2 * n; k++) {
    const i = k % n;
    const a = v[(i + n - 1) % n];
    const b = v[i];
    if (b < level - hy) armed = true;
    if (armed && a < level && b >= level) {
      const f = (level - a) / (b - a);
      return (i - 1 + f) * dt;
    }
  }
  return 0;
}

function draw(cv: HTMLCanvasElement, data: ScopeData, tdiv: number, vdiv: Record<1 | 2, number>, tTrig: number) {
  const dpr = window.devicePixelRatio || 1;
  const W = cv.clientWidth;
  const H = cv.clientHeight;
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
  }
  const g = cv.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  // CRT background with a soft vignette
  const bg = g.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, W * 0.7);
  bg.addColorStop(0, '#0f2a1c');
  bg.addColorStop(1, '#07150e');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  const dx = W / DIV_X;
  const dy = H / DIV_Y;
  g.lineWidth = 1;
  g.strokeStyle = 'rgba(110, 255, 160, 0.13)';
  g.beginPath();
  for (let i = 1; i < DIV_X; i++) {
    g.moveTo(Math.round(i * dx) + 0.5, 0);
    g.lineTo(Math.round(i * dx) + 0.5, H);
  }
  for (let j = 1; j < DIV_Y; j++) {
    g.moveTo(0, Math.round(j * dy) + 0.5);
    g.lineTo(W, Math.round(j * dy) + 0.5);
  }
  g.stroke();
  // centre axes with minor ticks
  g.strokeStyle = 'rgba(110, 255, 160, 0.3)';
  g.beginPath();
  g.moveTo(0, Math.round(H / 2) + 0.5);
  g.lineTo(W, Math.round(H / 2) + 0.5);
  g.moveTo(Math.round(W / 2) + 0.5, 0);
  g.lineTo(Math.round(W / 2) + 0.5, H);
  for (let i = 0; i < DIV_X * 5; i++) {
    const x = Math.round((i * dx) / 5) + 0.5;
    g.moveTo(x, H / 2 - 3);
    g.lineTo(x, H / 2 + 3);
  }
  for (let j = 0; j < DIV_Y * 5; j++) {
    const y = Math.round((j * dy) / 5) + 0.5;
    g.moveTo(W / 2 - 3, y);
    g.lineTo(W / 2 + 3, y);
  }
  g.stroke();

  // traces
  const span = DIV_X * tdiv;
  for (const ch of data.channels) {
    if (!ch.connected) continue;
    const col = CH_COLORS[ch.channel];
    const vd = vdiv[ch.channel];
    const Y = (v: number) => H / 2 - (v / vd) * dy;
    g.save();
    g.strokeStyle = col;
    g.lineWidth = 2;
    g.shadowColor = col;
    g.shadowBlur = 6;
    g.lineJoin = 'round';
    g.beginPath();
    const v = ch.v;
    const n = v.length;
    if (!data.ac || n < 2) {
      const y = Y(v[0] ?? 0);
      g.moveTo(0, y);
      g.lineTo(W, y);
    } else {
      const at = (t: number) => {
        const x = t / data.dt;
        const i0 = Math.floor(x);
        const f = x - i0;
        const a = v[((i0 % n) + n) % n];
        const b = v[(((i0 + 1) % n) + n) % n];
        return a + (b - a) * f;
      };
      const t0 = tTrig - TRIG_DIV * tdiv;
      const perPx = span / W / data.dt; // samples per pixel
      if (perPx <= 1.5) {
        const steps = Math.max(W, Math.min(4000, Math.ceil(span / data.dt)));
        for (let k = 0; k <= steps; k++) {
          const px = (k / steps) * W;
          const y = Y(at(t0 + (k / steps) * span));
          if (k === 0) g.moveTo(px, y);
          else g.lineTo(px, y);
        }
      } else {
        // many samples per pixel: draw the min..max envelope of each column
        for (let px = 0; px < W; px++) {
          const a = Math.floor((t0 + (px / W) * span) / data.dt);
          const b = Math.min(a + n, Math.ceil((t0 + ((px + 1) / W) * span) / data.dt));
          let lo = Infinity;
          let hi = -Infinity;
          for (let i = a; i <= b; i++) {
            const x = v[((i % n) + n) % n];
            if (x < lo) lo = x;
            if (x > hi) hi = x;
          }
          g.moveTo(px + 0.5, Y(hi) - 0.5);
          g.lineTo(px + 0.5, Y(lo) + 0.5);
        }
      }
    }
    g.stroke();
    g.restore();
    // channel 0 V marker on the left edge
    const y0 = Math.min(H - 8, Math.max(8, Y(0)));
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, y0 - 7);
    g.lineTo(14, y0 - 7);
    g.lineTo(20, y0);
    g.lineTo(14, y0 + 7);
    g.lineTo(0, y0 + 7);
    g.closePath();
    g.fill();
    g.fillStyle = '#07150e';
    g.font = '700 11px "Barlow Condensed", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(ch.channel), 8, y0 + 0.5);
  }
  // trigger marker
  if (data.ac) {
    const x = TRIG_DIV * dx;
    g.fillStyle = 'rgba(255, 159, 67, 0.9)';
    g.beginPath();
    g.moveTo(x - 6, 0);
    g.lineTo(x + 6, 0);
    g.lineTo(x, 8);
    g.closePath();
    g.fill();
  }
}

function fmtFreq(f: number) {
  return f > 0 ? formatSI(f, 'Hz') : '—';
}

export function Scope() {
  const layout = useStore((s) => s.layout);
  const scope = useStore((s) => s.scope);
  const setScope = useStore((s) => s.setScope);
  const data = useScopeData();
  // time-domain simulation is driven by a function generator or by a PWM pin on a dev board
  const hasGen = useStore((s) => s.layout.parts.some((p) => p.type === 'function_gen'));
  const cv = useRef<HTMLCanvasElement>(null);
  const hasProbe = layout.parts.some((p) => p.type === 'scope_probe');

  const st = useMemo(() => new Map(data.channels.map((c) => [c.channel, stats(c, data)])), [data]);
  const tdiv = scope.tdiv ?? autoTdiv(data);
  const vdiv: Record<1 | 2, number> = { 1: scope.vdiv[1] ?? autoVdiv(st.get(1)), 2: scope.vdiv[2] ?? autoVdiv(st.get(2)) };
  const trigCh = data.channels.find((c) => c.connected && c.channel === 1) ?? data.channels.find((c) => c.connected);
  const tTrig = useMemo(() => (data.ac && trigCh ? triggerTime(trigCh.v, data.dt) : 0), [data, trigCh]);
  const ch1 = data.channels.find((c) => c.channel === 1 && c.connected);
  const ch2 = data.channels.find((c) => c.channel === 2 && c.connected);
  const phase = data.ac && ch1 && ch2 && vpp(ch1.v) > 1e-4 && vpp(ch2.v) > 1e-4 ? phaseDeg(ch2.v, ch1.v, data.cycles) : null;

  useEffect(() => {
    if (!cv.current || scope.collapsed) return;
    draw(cv.current, data, tdiv, vdiv, tTrig);
  });

  // dragging by the title bar
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  if (!hasProbe) return null;

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { x: e.clientX, y: e.clientY, ox: scope.drag.x, oy: scope.drag.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    setScope({ drag: { x: Math.min(0, d.ox + e.clientX - d.x), y: Math.min(0, d.oy + e.clientY - d.y) } });
  };
  const onUp = () => (drag.current = null);
  const isAuto = scope.tdiv === null && scope.vdiv[1] === null && scope.vdiv[2] === null;

  return (
    <div
      className={`sc ${scope.collapsed ? 'collapsed' : ''}`}
      style={{ transform: `translate(${scope.drag.x}px, ${scope.drag.y}px)` }}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="sc-head" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} title={tr('拖动标题栏移动示波器窗口', 'Drag the title bar to move the scope')}>
        <span className="sc-title">{tr('示波器', 'Oscilloscope')}</span>
        <span className={`sc-mode ${data.ac ? 'ac' : ''}`}>
          {data.ac && data.period ? `${hasGen ? 'AC' : 'PWM'} · ${fmtFreq(1 / data.period)}` : tr('DC · 没有信号发生器或 PWM', 'DC · no generator or PWM')}
        </span>
        {data.stale && <span className="sc-busy">{tr('计算中…', 'updating…')}</span>}
        {scope.collapsed &&
          data.channels.map((c) => (
            <span key={c.ref} className="sc-mini" style={{ color: CH_COLORS[c.channel] }}>
              CH{c.channel} {c.connected ? (data.ac ? `${volts(st.get(c.channel)!.vpp)}pp` : volts(st.get(c.channel)!.vavg)) : '—'}
            </span>
          ))}
        <button className="sc-collapse" onClick={() => setScope({ collapsed: !scope.collapsed })} title={scope.collapsed ? tr('展开', 'Expand') : tr('收起', 'Collapse')}>
          {scope.collapsed ? '▴' : '▾'}
        </button>
      </div>
      {!scope.collapsed && (
        <>
          <div className="sc-screen-wrap">
            <canvas ref={cv} className="sc-screen" />
            <div className="sc-overlay-tl">
              {data.channels.map((c) => (
                <span key={c.ref} style={{ color: CH_COLORS[c.channel] }}>
                  CH{c.channel} {formatSI(vdiv[c.channel], 'V')}/div
                </span>
              ))}
            </div>
            <div className="sc-overlay-br">
              {formatSI(tdiv, 's')}/div{data.ac && trigCh ? ` · ${tr('触发', 'Trig')} CH${trigCh.channel}↑` : ''}
            </div>
            {data.error && (
              <div className="sc-error">
                {tr('仿真失败：', 'Simulation failed: ')}
                {data.error}
              </div>
            )}
            {!data.error && data.ac && !data.converged && (
              <div className="sc-error warn">{tr('还没完全进入稳态，波形仅供参考', 'Not fully settled yet — the waveform is approximate')}</div>
            )}
            {!data.error && data.ac && data.underResolved && (
              <div className="sc-error warn" style={data.converged ? undefined : { bottom: 48 }}>
                {tr('步长太粗，看不到 LC 振铃（见诊断）', 'Time step too coarse for the LC ringing (see diagnostics)')}
              </div>
            )}
          </div>
          <div className="sc-controls">
            <div className="sc-knob">
              <span>{tr('时间/格', 'Time/div')}</span>
              <button onClick={() => setScope({ tdiv: stepBy(T_STEPS, tdiv, -1) })}>−</button>
              <b>{formatSI(tdiv, 's')}</b>
              <button onClick={() => setScope({ tdiv: stepBy(T_STEPS, tdiv, 1) })}>+</button>
            </div>
            {data.channels.map((c) => (
              <div className="sc-knob" key={c.ref}>
                <span>
                  <i className="sc-dot" style={{ background: CH_COLORS[c.channel] }} />
                  CH{c.channel} {tr('V/格', 'V/div')}
                </span>
                <button onClick={() => setScope({ vdiv: { ...scope.vdiv, [c.channel]: stepBy(V_STEPS, vdiv[c.channel], -1) } })}>−</button>
                <b>{formatSI(vdiv[c.channel], 'V')}</b>
                <button onClick={() => setScope({ vdiv: { ...scope.vdiv, [c.channel]: stepBy(V_STEPS, vdiv[c.channel], 1) } })}>+</button>
              </div>
            ))}
            <button
              className={`sc-auto ${isAuto ? 'on' : ''}`}
              onClick={() => setScope({ tdiv: null, vdiv: { 1: null, 2: null } })}
              title={tr('自动设置时间/格和 V/格', 'Auto-set time/div and V/div')}
            >
              AUTO
            </button>
          </div>
          <table className="sc-meas">
            <thead>
              <tr>
                <th />
                <th>Vpp</th>
                <th>{tr('平均', 'Vavg')}</th>
                <th>{tr('有效值', 'Vrms')}</th>
                <th>{tr('频率', 'Freq')}</th>
              </tr>
            </thead>
            <tbody>
              {data.channels.map((c) => {
                const s = st.get(c.channel)!;
                return (
                  <tr key={c.ref} style={{ color: CH_COLORS[c.channel] }}>
                    <th>
                      CH{c.channel} <small>{c.ref}</small>
                    </th>
                    {c.connected ? (
                      <>
                        <td>{volts(s.vpp)}</td>
                        <td>{volts(s.vavg)}</td>
                        <td>{volts(s.vrms)}</td>
                        <td>{fmtFreq(s.freq)}</td>
                      </>
                    ) : (
                      <td colSpan={4} className="sc-nc">
                        {tr('探头没接好（针尖或接地夹悬空）', 'Probe not connected (tip or ground clip floating)')}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {phase !== null && (
            <div className="sc-phase">
              {tr('相位差 CH2 相对 CH1：', 'Phase of CH2 vs CH1: ')}
              <b>
                {phase > 0 ? '+' : ''}
                {phase.toFixed(1)}°
              </b>
              <span>
                {Math.abs(phase) < 1
                  ? tr('（同相）', '(in phase)')
                  : Math.abs(Math.abs(phase) - 180) < 1
                    ? tr('（反相）', '(inverted)')
                    : phase < 0
                      ? tr('（CH2 滞后）', '(CH2 lags)')
                      : tr('（CH2 超前）', '(CH2 leads)')}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
