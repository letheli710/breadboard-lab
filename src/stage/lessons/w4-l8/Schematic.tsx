// Layer "01 2D 阶跃 RLC 与一般二阶电路原理图". Three topologies on tabs (series RLC step / parallel
// RLC step / the general mixed circuit of act 4), four equivalent views (t = 0−, t = 0+ with L
// open and C shorted, t → ∞ with L shorted and C open, the independent source killed), and under
// the drawing the four steps of Sadiku 8.7 for the circuit on screen: ① x(0+), x'(0+) ② the roots
// ③ x(∞) ④ the complete response — all from model.ts's one solver. The series R follows the
// scope's slider. The parallel circuit is the guided example's: its numbers (and the equivalent
// drawings that give them away) stay "?" until the example has reached them.

import type { ReactNode } from 'react';
import { useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { Cell, hoverProps, RSlider, Seg, useClearHoverOnUnmount, useIsLit, useLab, type Lab, type Topo, type View } from './state';
import { C_F, DAMPING_LABEL, generalPoly, generalStep, L_H, PAR, parallelStep, seriesStep, VS } from './model';
import { fx, responseTex, rootsTex } from './tex';

/* ------------------------------------------------------------- drawing primitives */

type Mode = 'normal' | 'short' | 'open';

const zig = (x1: number, y1: number, x2: number, y2: number, n = 6, a = 8) => {
  const pts: string[] = [`${x1},${y1}`];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = x1 + t * (x2 - x1);
    const y = y1 + t * (y2 - y1);
    const o = i % 2 ? -a : a;
    pts.push(y1 === y2 ? `${x.toFixed(1)},${y + o}` : `${x + o},${y.toFixed(1)}`);
  }
  pts.push(`${x2},${y2}`);
  return pts.join(' ');
};

function coil(x1: number, y1: number, x2: number, y2: number, n = 4) {
  const horiz = y1 === y2;
  const len = horiz ? x2 - x1 : y2 - y1;
  const st = len / n;
  let d = `M ${x1} ${y1}`;
  for (let i = 0; i < n; i++) {
    if (horiz) d += ` Q ${x1 + st * (i + 0.5)} ${y1 - 18} ${x1 + st * (i + 1)} ${y1}`;
    else d += ` Q ${x1 + 18} ${y1 + st * (i + 0.5)} ${x1} ${y1 + st * (i + 1)}`;
  }
  return d;
}

function Part({ id, children, label }: { id: string; children: ReactNode; label: string }) {
  const on = useIsLit()(id);
  return (
    <g className={`w48-part ${on}`} {...hoverProps([id])} tabIndex={0} role="img" aria-label={label}>
      {children}
    </g>
  );
}

/** A two-terminal element from (x1, y1) to (x2, y2): drawn, shorted (a wire) or opened (a gap). */
function Two({ x1, y1, x2, y2, mode, kind, note }: { x1: number; y1: number; x2: number; y2: number; mode: Mode; kind: 'r' | 'l' | 'c'; note?: string }) {
  const horiz = y1 === y2;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  if (mode === 'short')
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} className="w48-wire short" />
        <rect x={horiz ? x1 - 4 : x1 - 15} y={horiz ? y1 - 15 : y1 - 4} width={horiz ? x2 - x1 + 8 : 30} height={horiz ? 30 : y2 - y1 + 8} rx={6} className="w48-eq" />
        <text x={horiz ? mx : x1 + 20} y={horiz ? y1 - 20 : my + 4} className={`w48-t eq ${horiz ? 'mid' : ''}`}>
          {note ?? '短路'}
        </text>
      </g>
    );
  if (mode === 'open') {
    const g = 10;
    return (
      <g>
        {horiz ? (
          <>
            <line x1={x1} y1={y1} x2={mx - g} y2={y1} className="w48-wire" />
            <line x1={mx + g} y1={y1} x2={x2} y2={y1} className="w48-wire" />
            <circle cx={mx - g} cy={y1} r={3.2} className="w48-open" />
            <circle cx={mx + g} cy={y1} r={3.2} className="w48-open" />
          </>
        ) : (
          <>
            <line x1={x1} y1={y1} x2={x1} y2={my - g} className="w48-wire" />
            <line x1={x1} y1={my + g} x2={x1} y2={y2} className="w48-wire" />
            <circle cx={x1} cy={my - g} r={3.2} className="w48-open" />
            <circle cx={x1} cy={my + g} r={3.2} className="w48-open" />
          </>
        )}
        <rect x={horiz ? x1 - 4 : x1 - 15} y={horiz ? y1 - 15 : y1 - 4} width={horiz ? x2 - x1 + 8 : 30} height={horiz ? 30 : y2 - y1 + 8} rx={6} className="w48-eq" />
        <text x={horiz ? mx : x1 + 20} y={horiz ? y1 - 20 : my + 4} className={`w48-t eq ${horiz ? 'mid' : ''}`}>
          {note ?? '开路'}
        </text>
      </g>
    );
  }
  if (kind === 'r') {
    const a = horiz ? x1 + (x2 - x1) * 0.18 : y1 + (y2 - y1) * 0.18;
    const b = horiz ? x2 - (x2 - x1) * 0.18 : y2 - (y2 - y1) * 0.18;
    return horiz ? (
      <g>
        <line x1={x1} y1={y1} x2={a} y2={y1} className="w48-wire" />
        <polyline points={zig(a, y1, b, y1)} className="w48-el r" />
        <line x1={b} y1={y1} x2={x2} y2={y1} className="w48-wire" />
      </g>
    ) : (
      <g>
        <line x1={x1} y1={y1} x2={x1} y2={a} className="w48-wire" />
        <polyline points={zig(x1, a, x1, b)} className="w48-el r" />
        <line x1={x1} y1={b} x2={x1} y2={y2} className="w48-wire" />
      </g>
    );
  }
  if (kind === 'l') {
    const a = horiz ? x1 + (x2 - x1) * 0.15 : y1 + (y2 - y1) * 0.2;
    const b = horiz ? x2 - (x2 - x1) * 0.15 : y2 - (y2 - y1) * 0.2;
    return horiz ? (
      <g>
        <line x1={x1} y1={y1} x2={a} y2={y1} className="w48-wire" />
        <path d={coil(a, y1, b, y1)} className="w48-el l" />
        <line x1={b} y1={y1} x2={x2} y2={y1} className="w48-wire" />
      </g>
    ) : (
      <g>
        <line x1={x1} y1={y1} x2={x1} y2={a} className="w48-wire" />
        <path d={coil(x1, a, x1, b)} className="w48-el l" />
        <line x1={x1} y1={b} x2={x1} y2={y2} className="w48-wire" />
      </g>
    );
  }
  // capacitor (vertical in every drawing here)
  return (
    <g>
      <line x1={x1} y1={y1} x2={x1} y2={my - 6} className="w48-wire" />
      <line x1={x1 - 16} y1={my - 6} x2={x1 + 16} y2={my - 6} className="w48-el c" />
      <line x1={x1 - 16} y1={my + 6} x2={x1 + 16} y2={my + 6} className="w48-el c" />
      <line x1={x1} y1={my + 6} x2={x1} y2={y2} className="w48-wire" />
    </g>
  );
}

/** independent source: a voltage source (killed → short) or a current source (killed → open) */
function Source({ x, y1, y2, kind, killed, off, label }: { x: number; y1: number; y2: number; kind: 'v' | 'i'; killed: boolean; off: boolean; label: string }) {
  const my = (y1 + y2) / 2;
  if (killed) return <Two x1={x} y1={y1} x2={x} y2={y2} mode={kind === 'v' ? 'short' : 'open'} kind="r" note={kind === 'v' ? '置零→短路' : '置零→开路'} />;
  return (
    <g className={off ? 'w48-off' : ''}>
      <line x1={x} y1={y1} x2={x} y2={my - 22} className="w48-wire" />
      <circle cx={x} cy={my} r={22} className="w48-src" />
      {kind === 'v' ? (
        <>
          <text x={x} y={my - 5} className="w48-t sign mid">
            +
          </text>
          <text x={x} y={my + 15} className="w48-t sign mid">
            −
          </text>
        </>
      ) : (
        <>
          <line x1={x} y1={my + 12} x2={x} y2={my - 8} className="w48-arrow" />
          <polygon points={`${x},${my - 14} ${x - 5},${my - 5} ${x + 5},${my - 5}`} className="w48-arrowhead" />
        </>
      )}
      <line x1={x} y1={my + 22} x2={x} y2={y2} className="w48-wire" />
      <text x={x + 28} y={my + 4} className="w48-t src">
        {label}
      </text>
    </g>
  );
}

function Switch({ x, y, closed }: { x: number; y: number; closed: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={3} className="w48-sw" />
      <circle cx={x + 30} cy={y} r={3} className="w48-sw" />
      <line x1={x} y1={y} x2={closed ? x + 30 : x + 26} y2={closed ? y : y - 15} className="w48-swblade" />
      <text x={x + 15} y={y - 20} className="w48-t small mid">
        {closed ? 't = 0 闭合' : 't < 0 断开'}
      </text>
    </g>
  );
}

function Tag({ x, y, text, tone = '', anchor = 'start' }: { x: number; y: number; text: string; tone?: string; anchor?: 'start' | 'mid' | 'end' }) {
  return (
    <text x={x} y={y} className={`w48-t tag ${tone} ${anchor === 'start' ? '' : anchor}`}>
      {text}
    </text>
  );
}

/* ------------------------------------------------------------- the three circuits */

const VIEW_TITLE: Record<View, string> = {
  '0m': 't = 0⁻ 换路前：储能为零',
  '0p': 't = 0⁺ 换路瞬间：L 开路（i_L 不突变）、C 短路（v_C 不突变）',
  inf: 't → ∞ 直流稳态：L 短路、C 开路',
  zero: '独立源置零：剩下的无源网络给出特征方程',
};

const Y_TOP = 70;
const Y_BOT = 200;

function SeriesDrawing({ lab }: { lab: Lab }) {
  const v = lab.view;
  const lm: Mode = v === '0p' ? 'open' : v === 'inf' ? 'short' : 'normal';
  const cm: Mode = v === '0p' ? 'short' : v === 'inf' ? 'open' : 'normal';
  return (
    <>
      <Part id="s_vs" label="阶跃电压源 V_s u(t)">
        <Source x={70} y1={Y_TOP} y2={Y_BOT} kind="v" killed={v === 'zero'} off={false} label="" />
        {v !== 'zero' && <Tag x={70} y={Y_BOT + 22} text="V_s = 5 V" tone="src" anchor="mid" />}
      </Part>
      <line x1={70} y1={Y_TOP} x2={100} y2={Y_TOP} className="w48-wire" />
      <Part id="s_sw" label="开关">
        <Switch x={100} y={Y_TOP} closed={v !== '0m'} />
      </Part>
      <Part id="s_r" label={`串联电阻 R = ${lab.r} Ω`}>
        <Two x1={130} y1={Y_TOP} x2={230} y2={Y_TOP} mode="normal" kind="r" />
        <Tag x={180} y={Y_TOP + 32} text={`R = ${Math.round(lab.r)} Ω`} tone="r" anchor="mid" />
      </Part>
      <Part id="s_l" label="串联电感 L = 10 mH">
        <Two x1={230} y1={Y_TOP} x2={360} y2={Y_TOP} mode={lm} kind="l" note={lm === 'open' ? '开路 i_L = 0' : '短路'} />
        {lm === 'normal' && <Tag x={295} y={Y_TOP + 32} text="L = 10 mH" tone="l" anchor="mid" />}
      </Part>
      <line x1={360} y1={Y_TOP} x2={460} y2={Y_TOP} className="w48-wire" />
      <Part id="s_i" label="回路电流 i(t)">
        <line x1={384} y1={Y_TOP - 12} x2={420} y2={Y_TOP - 12} className="w48-arrow" />
        <polygon points={`426,${Y_TOP - 12} 418,${Y_TOP - 16} 418,${Y_TOP - 8}`} className="w48-arrowhead" />
        <Tag x={404} y={Y_TOP - 20} text={v === '0m' ? 'i(0⁻) = 0' : v === '0p' ? 'i(0⁺) = 0' : v === 'inf' ? 'i(∞) = 0' : 'i(t)'} tone="cur" anchor="mid" />
      </Part>
      <Part id="s_c" label="电容 C = 1 µF，电压 v_C(t)">
        <Two x1={460} y1={Y_TOP} x2={460} y2={Y_BOT} mode={cm} kind="c" note={cm === 'short' ? '短路 v_C = 0' : '开路'} />
        <Tag x={482} y={cm === 'normal' ? 135 : Y_TOP + 24} text={v === '0m' ? 'v_C(0⁻) = 0' : v === '0p' ? 'v_C(0⁺) = 0' : v === 'inf' ? 'v_C(∞) = 5 V' : 'C = 1 µF'} tone="c" />
      </Part>
      <line x1={70} y1={Y_BOT} x2={460} y2={Y_BOT} className="w48-wire" />
      {v === '0p' && <Tag x={295} y={Y_TOP + 50} text="v_L(0⁺) = V_s = 5 V → i'(0⁺) = 500 A/s" tone="l" anchor="mid" />}
      {v === 'zero' && <Tag x={265} y={Y_BOT - 24} text="s² + (R/L)s + 1/(LC) = 0" tone="eq" anchor="mid" />}
    </>
  );
}

function ParallelDrawing({ lab }: { lab: Lab }) {
  const v = lab.view;
  const k = lab.reveal;
  const q = (need: number, s: string) => (k >= need ? s : s.replace(/=.*$/, '= ?'));
  // the equivalent drawings would give the example's step answers away: plain parts until found
  const lm: Mode = v === '0p' && k >= 1 ? 'open' : v === 'inf' && k >= 3 ? 'short' : 'normal';
  const cm: Mode = v === '0p' && k >= 1 ? 'short' : v === 'inf' && k >= 3 ? 'open' : 'normal';
  return (
    <>
      <line x1={80} y1={Y_TOP} x2={520} y2={Y_TOP} className="w48-wire" />
      <line x1={80} y1={Y_BOT} x2={520} y2={Y_BOT} className="w48-wire" />
      <Part id="p_is" label="阶跃电流源 I_s u(t) = 6 u(t) A">
        <Source x={80} y1={Y_TOP} y2={Y_BOT} kind="i" killed={v === 'zero'} off={v === '0m'} label="" />
        <Tag x={80} y={Y_BOT + 22} text={v === '0m' ? 'I_s u(t) = 0（t < 0）' : 'I_s = 6 u(t) A'} tone="src" anchor="mid" />
      </Part>
      <Part id="p_r" label="并联电阻 R = 5 Ω">
        <Two x1={220} y1={Y_TOP} x2={220} y2={Y_BOT} mode="normal" kind="r" />
        <Tag x={236} y={139} text="R = 5 Ω" tone="r" />
      </Part>
      <Part id="p_l" label="并联电感 L = 2 H，电流 i_L(t)">
        <Two x1={360} y1={Y_TOP} x2={360} y2={Y_BOT} mode={lm} kind="l" note={lm === 'open' ? '开路' : '短路'} />
        {lm === 'normal' && <Tag x={384} y={139} text="L = 2 H" tone="l" />}
        <line x1={342} y1={Y_TOP + 10} x2={342} y2={Y_TOP + 32} className="w48-arrow" />
        <polygon points={`342,${Y_TOP + 38} 338,${Y_TOP + 30} 346,${Y_TOP + 30}`} className="w48-arrowhead" />
        <Tag x={336} y={Y_TOP + 26} text={v === '0m' ? 'i_L(0⁻) = 0' : v === '0p' ? q(1, 'i_L(0⁺) = 0') : v === 'inf' ? q(3, 'i_L(∞) = 6 A') : 'i_L(t)'} tone="cur" anchor="end" />
      </Part>
      <Part id="p_c" label="并联电容 C = 20 mF">
        <Two x1={500} y1={Y_TOP} x2={500} y2={Y_BOT} mode={cm} kind="c" note={cm === 'short' ? '短路' : '开路'} />
        <Tag x={522} y={cm === 'normal' ? 139 : Y_TOP + 24} text="C = 20 mF" tone="c" />
      </Part>
      <Part id="p_v" label="并联端电压 v(t)">
        <Tag
          x={290}
          y={Y_TOP - 12}
          text={v === '0m' ? '+  v(0⁻) = 0  −' : v === '0p' ? q(1, '+  v(0⁺) = 0  −') : v === 'inf' ? q(3, '+  v(∞) = 0  −') : '+  v(t)  −'}
          tone="node"
          anchor="mid"
        />
      </Part>
      {v === 'zero' && <Tag x={340} y={Y_BOT + 24} text={k >= 2 ? 'α = 1/(2RC) = 5，ω₀ = 1/√(LC) = 5' : 's² + s/(RC) + 1/(LC) = 0：α = ?，ω₀ = ?'} tone="eq" anchor="mid" />}
      {k < 9 && <Tag x={630} y={40} text={k >= 5 ? '引导例题：五步已完成' : `引导例题进行中：第 ${k + 1} 步的数值等你求出`} tone="gd" anchor="end" />}
    </>
  );
}

function GeneralDrawing({ lab }: { lab: Lab }) {
  const v = lab.view;
  const lm: Mode = v === '0p' ? 'open' : v === 'inf' ? 'short' : 'normal';
  const cm: Mode = v === '0p' ? 'short' : v === 'inf' ? 'open' : 'normal';
  return (
    <>
      <Part id="g_vs" label="直流电压源 V_s = 12 V">
        <Source x={60} y1={Y_TOP} y2={Y_BOT} kind="v" killed={v === 'zero'} off={false} label="" />
        {v !== 'zero' && <Tag x={60} y={Y_BOT + 22} text="V_s = 12 V" tone="src" anchor="mid" />}
      </Part>
      <line x1={60} y1={Y_TOP} x2={85} y2={Y_TOP} className="w48-wire" />
      <Part id="g_sw" label="开关">
        <Switch x={85} y={Y_TOP} closed={v !== '0m'} />
      </Part>
      <Part id="g_r1" label="串联电阻 R_1 = 4 Ω">
        <Two x1={115} y1={Y_TOP} x2={205} y2={Y_TOP} mode="normal" kind="r" />
        <Tag x={160} y={Y_TOP + 32} text="R₁ = 4 Ω" tone="r" anchor="mid" />
      </Part>
      <Part id="g_l" label="电感 L = 1 H，电流 i_L(t)">
        <Two x1={205} y1={Y_TOP} x2={320} y2={Y_TOP} mode={lm} kind="l" note={lm === 'open' ? '开路 i_L = 0' : '短路'} />
        {lm === 'normal' && <Tag x={262} y={Y_TOP + 32} text="L = 1 H" tone="l" anchor="mid" />}
        <Tag
          x={262}
          y={Y_TOP + 50}
          text={v === '0m' ? 'i_L(0⁻) = 0' : v === '0p' ? 'v_L(0⁺) = 12 V → i_L′(0⁺) = 12 A/s' : v === 'inf' ? 'i_L(∞) = 2 A' : ''}
          tone="cur"
          anchor="mid"
        />
      </Part>
      <line x1={320} y1={Y_TOP} x2={520} y2={Y_TOP} className="w48-wire" />
      <Part id="g_a" label="节点 A">
        <circle cx={390} cy={Y_TOP} r={5} className="w48-node" />
        <Tag x={390} y={Y_TOP - 12} text="节点 A" tone="node" anchor="mid" />
      </Part>
      <Part id="g_r2" label="负载电阻 R_2 = 2 Ω">
        <Two x1={390} y1={Y_TOP} x2={390} y2={Y_BOT} mode="normal" kind="r" />
        <Tag x={406} y={139} text="R₂ = 2 Ω" tone="r" />
      </Part>
      <Part id="g_c" label="滤波电容 C = 0.5 F，电压 v_C(t)">
        <Two x1={520} y1={Y_TOP} x2={520} y2={Y_BOT} mode={cm} kind="c" note={cm === 'short' ? '短路' : '开路'} />
        <Tag x={542} y={cm === 'normal' ? 139 : Y_TOP + 24} text={v === '0m' ? 'v_C(0⁻) = 0' : v === '0p' ? 'v_C(0⁺) = 0' : v === 'inf' ? 'v_C(∞) = 4 V' : 'C = 0.5 F'} tone="c" />
      </Part>
      <line x1={60} y1={Y_BOT} x2={520} y2={Y_BOT} className="w48-wire" />
      {v === 'zero' && <Tag x={330} y={Y_BOT + 24} text="s² + (R₁/L + 1/(R₂C))s + (R₁+R₂)/(R₂LC) = 0" tone="eq" anchor="mid" />}
    </>
  );
}

/* ------------------------------------------------------------- the four steps */

interface Steps {
  init: string;
  roots: string;
  kind: string;
  ss: string;
  resp: string;
  extra?: string;
}

function stepsOf(lab: Lab): Steps {
  if (lab.topo === 'series') {
    const s = seriesStep(lab.r, L_H, C_F, VS).v;
    return {
      init: String.raw`v_C(0^+) = 0,\; v_C'(0^+) = \tfrac{i(0^+)}{C} = 0`,
      roots: `\\alpha = ${fx(s.alpha)},\\; \\omega_0 = ${fx(s.w0)}:\\; ${rootsTex(s)}`,
      kind: DAMPING_LABEL[s.kind],
      ss: String.raw`v_C(\infty) = V_s = 5\text{ V}`,
      resp: `v_C(t) = ${responseTex(s)}\\text{ V}`,
    };
  }
  if (lab.topo === 'general') {
    const g = generalStep();
    const { a1, a0 } = generalPoly();
    return {
      init: String.raw`v_C(0^+) = 0,\; v_C'(0^+) = \tfrac{1}{C}\left(i_L(0^+) - \tfrac{v_C(0^+)}{R_2}\right) = 0`,
      roots: `s^2 + ${fx(a1)}s + ${fx(a0)} = 0:\\; ${rootsTex(g.vc)}`,
      kind: DAMPING_LABEL[g.vc.kind],
      ss: String.raw`v_C(\infty) = 12 \cdot \tfrac{2}{4+2} = 4\text{ V},\; i_L(\infty) = 2\text{ A}`,
      resp: `v_C(t) = ${responseTex(g.vc)}\\text{ V}`,
      extra: String.raw`i_L(t) = 2 + 6e^{-2t} - 8e^{-3t}\text{ A}`,
    };
  }
  const p = parallelStep();
  const k = lab.reveal;
  const hide = String.raw`\;?`;
  return {
    init: k >= 1 ? String.raw`i_L(0^+) = 0,\; i_L'(0^+) = \tfrac{v(0^+)}{L} = 0` : String.raw`i_L(0^+) = ?,\; i_L'(0^+) = ?`,
    roots: k >= 2 ? `\\alpha = ${fx(p.alpha)},\\; \\omega_0 = ${fx(p.w0)}:\\; ${rootsTex(p)}` : String.raw`\alpha = \tfrac{1}{2RC} = ?,\; \omega_0 = ?`,
    kind: k >= 2 ? DAMPING_LABEL[p.kind] : '?',
    ss: k >= 3 ? String.raw`i_L(\infty) = I_s = 6\text{ A}` : String.raw`i_L(\infty) =${hide}`,
    resp: k >= 4 ? `i_L(t) = 6 - (6 + 30t)e^{-5t}\\text{ A}` : String.raw`i_L(t) = i_L(\infty) + (D_1 + D_2 t)e^{-\alpha t}:\; D_1, D_2 = ?`,
    extra: k >= 5 ? String.raw`v(t) = L\tfrac{di_L}{dt} = ${PAR.L} \cdot 150te^{-5t} = 300te^{-5t}\text{ V}` : undefined,
  };
}

function FourSteps({ lab }: { lab: Lab }) {
  // the self-test asks for the general circuit's results: they wait while it is on screen
  const [hide] = useStageParam('hide', false);
  const q = String.raw`\text{自测中：先自己算}`;
  const s = hide && lab.topo === 'general' ? { init: q, roots: q, kind: '?', ss: q, resp: q } : stepsOf(lab);
  const x = lab.topo === 'parallel' ? 'i_L' : 'v_C';
  return (
    <div className="w48-steps">
      <Cell id="step_1" name={`① 初值 ${x}(0⁺), ${x}′(0⁺)`} value={<Tex tex={s.init} />} tone={lab.view === '0p' ? 'cur' : ''} />
      <Cell id="step_2" name={`② 暂态形式 · ${s.kind}`} value={<Tex tex={s.roots} />} tone={lab.view === 'zero' ? 'cur' : ''} />
      <Cell id="step_3" name={`③ 稳态 ${x}(∞)`} value={<Tex tex={s.ss} />} tone={lab.view === 'inf' ? 'cur' : ''} />
      <Cell id="step_4" name="④ 合并定常数（代入完全响应）" value={<Tex tex={s.resp} />} hint={'extra' in s && s.extra ? <Tex tex={s.extra} /> : undefined} />
    </div>
  );
}

/* ------------------------------------------------------------- the layer */

const TOPO_NAME: Record<Topo, string> = { series: '串联 RLC 阶跃', parallel: '并联 RLC 阶跃', general: '一般混合二阶' };

export default function Schematic() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const on = useIsLit();
  const viewIds: Record<View, string> = { '0m': 'v_0m', '0p': 'v_0p', inf: 'v_inf', zero: 'v_zero' };
  return (
    <div className="w48-layer">
      <div className="w48-dock">
        <Seg<Topo>
          label="拓扑"
          value={lab.topo}
          onChange={(t) => lab.set({ topo: t })}
          options={[
            { value: 'series', label: TOPO_NAME.series, short: '串联' },
            { value: 'parallel', label: TOPO_NAME.parallel, short: '并联' },
            { value: 'general', label: TOPO_NAME.general, short: '混合' },
          ]}
        />
        <Seg<View>
          label="等效视图"
          value={lab.view}
          onChange={(v) => lab.set({ view: v })}
          options={[
            { value: '0m', label: 't = 0⁻', hover: ['v_0m'] },
            { value: '0p', label: 't = 0⁺', hover: ['v_0p'] },
            { value: 'inf', label: 't → ∞', hover: ['v_inf'] },
            { value: 'zero', label: '源置零', short: '置零', hover: ['v_zero'] },
          ]}
        />
        {lab.topo === 'series' && <RSlider lab={lab} label="R" ids={['s_r']} />}
      </div>
      <div className={`w48-sch-wrap ${on(viewIds[lab.view])}`}>
        <svg viewBox="0 0 640 240" className="w48-sch" role="img" aria-label={`${TOPO_NAME[lab.topo]}：${VIEW_TITLE[lab.view]}`}>
          <text x={10} y={20} className="w48-t vtitle" {...hoverProps([viewIds[lab.view]])}>
            {VIEW_TITLE[lab.view]}
          </text>
          {lab.topo === 'series' ? <SeriesDrawing lab={lab} /> : lab.topo === 'parallel' ? <ParallelDrawing lab={lab} /> : <GeneralDrawing lab={lab} />}
        </svg>
      </div>
      <FourSteps lab={lab} />
    </div>
  );
}
