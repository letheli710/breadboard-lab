// Calculation cards: first- and second-order transients (τ = RC, τ = L/R, the three-element method,
// rise time, the square-wave steady state, flyback, RLC damping, the op-amp integrator) — phase 3.

import { tr } from '../../core/i18n';
import type { CalcCard, CalcGroup } from '../types';
import { C, D, Dot, Gnd, L, OpAmp, Path, R, T, V, VArrow } from './fig';
import { Arrow, Npn } from './figx';

export const group = (): CalcGroup => ({
  id: 'transients',
  title: tr('暂态：一阶与二阶 Transients', 'Transients: first and second order'),
  intro: tr(
    '时间常数、三要素法、上升时间、方波下的稳态摆幅、电感的反冲、RLC 的阻尼——第 3 期实验和继电器、PWM 实验里的每条指数曲线。',
    'Time constants, the three-element method, rise time, the square-wave swing, an inductor’s kick and RLC damping — every exponential in phase 3 and in the relay and PWM labs.',
  ),
});

/** generator → R → C to ground (the plain RC charging circuit) */
function RcFig() {
  return (
    <g>
      <V x={40} y1={45} y2={105} label="Uₛ" />
      <Path d="40,45 40,30 60,30" />
      <R x1={60} y1={30} x2={140} y2={30} label="R" />
      <Path d="140,30 190,30 190,55" />
      <C x1={190} y1={55} x2={190} y2={100} label="C" />
      <Path d="190,100 190,125 40,125 40,105" />
      <Dot x={190} y={30} />
      <VArrow x={225} y1={110} y2={45} label="u_C" />
      <Arrow x={160} y={30} label="i" ly={22} />
      <Gnd x={115} y={125} />
    </g>
  );
}

export const cards = (): CalcCard[] => [
  {
    id: 'rc-time-constant',
    group: 'transients',
    title: tr('RC 时间常数 τ = RC', 'RC time constant τ = RC'),
    tex: 'τ = R C',
    use: tr(
      '电容经电阻充放电有多快：过 1τ 走完 63 %，5τ 基本到头。',
      'How fast a capacitor charges or discharges through a resistor: 63 % of the way after 1τ, essentially done after 5τ.',
    ),
    vars: [
      { sym: 'R', name: tr('电容看到的电阻（含发生器 50 Ω）', 'resistance the capacitor sees (generator 50 Ω included)'), unit: 'Ω', def: 10050 },
      { sym: 'C', name: tr('电容', 'capacitance'), unit: 'F', def: 1e-7 },
    ],
    out: { sym: 'τ', name: tr('时间常数', 'time constant'), unit: 's' },
    compute: (v) => v.R * v.C,
    why: tr(
      `1. 电容：$i = C\\frac{du_C}{dt}$，电压不能突变。
2. 充电回路的 KVL：$U_s = Ri + u_C = RC\\frac{du_C}{dt} + u_C$。
3. 这个一阶微分方程的解是指数：$u_C = U_s(1 - e^{-t/τ})$，其中 $τ = RC$（Ω × F = s）。
4. 经验值：1τ → 63 %，2τ → 86 %，3τ → 95 %，5τ → 99.3 %。
5. **R 是从电容两端看进去的戴维宁电阻**（电源置零）：要把信号发生器的 50 Ω、并联的电阻都算进去。`,
      `1. A capacitor obeys $i = C\\frac{du_C}{dt}$; its voltage cannot jump.
2. KVL around the charging loop: $U_s = Ri + u_C = RC\\frac{du_C}{dt} + u_C$.
3. This first-order equation is solved by an exponential, $u_C = U_s(1 - e^{-t/τ})$, with $τ = RC$ (Ω × F = s).
4. Rules of thumb: 1τ → 63 %, 2τ → 86 %, 3τ → 95 %, 5τ → 99.3 %.
5. **R is the Thevenin resistance seen from the capacitor’s terminals** (sources zeroed): include the generator’s 50 Ω and any resistor in parallel.`,
    ),
    example: tr(
      `- 实验 3-1：$(10k + 50) × 100 nF ≈ 1.0 ms$。
- 实验 3-2：微分 $10k × 10 nF = 0.1 ms$，积分 $10k × 1 µF = 10 ms$。
- 实验 3-5：充电 $1000 µF × 173 Ω ≈ 0.17 s$，放电 $1000 µF × 482 Ω ≈ 0.48 s$。
- 实验 5-14：$10k × 1 µF = 10 ms$；实验 5-16：$2.2k × 200 pF = 440 ns$。`,
      `- Lab 3-1: $(10k + 50) × 100 nF ≈ 1.0 ms$.
- Lab 3-2: differentiator $10k × 10 nF = 0.1 ms$, integrator $10k × 1 µF = 10 ms$.
- Lab 3-5: charging $1000 µF × 173 Ω ≈ 0.17 s$, discharging $1000 µF × 482 Ω ≈ 0.48 s$.
- Lab 5-14: $10k × 1 µF = 10 ms$; lab 5-16: $2.2k × 200 pF = 440 ns$.`,
    ),
    pitfalls: [
      tr(
        '只用串联的那个 R：电容旁边还并着电阻时，τ 用的是 $R_1 ∥ R_2$（实验 3-7 只有一半）。',
        'Using only the series R: with a resistor across the capacitor τ uses $R_1 ∥ R_2$ (half as long in lab 3-7).',
      ),
      tr('单位：kΩ × µF = ms，kΩ × nF = µs。', 'Units: kΩ × µF = ms, kΩ × nF = µs.'),
    ],
    Figure: () => <RcFig />,
    teardowns: ['capacitor'],
    lessons: [
      'exp3-rc-square-charging',
      'exp3-rc-differentiator-integrator',
      'exp3-led-breathing',
      'exp3-rc-thevenin-tau',
      'exp5-pwm-rc-dac',
      'exp5-adc-battery-divider',
      'exp5-i2c-pullup-rise-time',
    ],
    chapter: 'first-order',
  },
  {
    id: 'rc-charging',
    group: 'transients',
    title: tr('一阶电路的三要素法', 'First-order circuits: the three-element method'),
    tex: 'u(t) = u(∞) + [u(0_+) - u(∞)] e^{-t/τ}',
    use: tr(
      '任何一阶电路的任何电压 / 电流：知道初值、终值、τ，算出任意时刻的值。',
      'Any voltage or current of any first-order circuit: from the initial value, the final value and τ, the value at any time.',
    ),
    vars: [
      { sym: 'u_0', name: tr('初值 u(0+)', 'initial value u(0+)'), unit: 'V', def: 0 },
      { sym: 'u_∞', name: tr('终值 u(∞)', 'final value u(∞)'), unit: 'V', def: 5 },
      { sym: 'τ', name: tr('时间常数', 'time constant'), unit: 's', def: 0.001 },
      { sym: 't', name: tr('经过的时间', 'time elapsed'), unit: 's', def: 0.001 },
    ],
    out: { sym: 'u(t)', name: tr('这一时刻的值', 'value at that time'), unit: 'V' },
    compute: (v) => v['u_∞'] + (v.u_0 - v['u_∞']) * Math.exp(-v.t / v['τ']),
    why: tr(
      `1. 一阶电路里任何量 x 都满足 $τ\\frac{dx}{dt} + x = x(∞)$，解就是“从初值指数地走向终值”。
2. **初值 u(0+)**：电容电压、电感电流不能突变，等于开关动作前一刻的值（方波：上半个周期结束时的值）。
3. **终值 u(∞)**：直流稳态，电容当 **开路**、电感当 **短路** 算出来。
4. **时间常数**：$τ = R_{eq}C$ 或 $τ = \\frac{L}{R_{eq}}$，$R_eq$ 是从储能元件两端看进去的电阻。
5. 代进公式。反过来求“到某个值要多久”：$t = τ ln\\frac{u(0_+) - u(∞)}{u(t) - u(∞)}$。`,
      `1. In a first-order circuit every quantity x obeys $τ\\frac{dx}{dt} + x = x(∞)$; the solution "goes exponentially from the initial to the final value".
2. **Initial value u(0+)**: a capacitor’s voltage and an inductor’s current cannot jump, so they keep the value from just before the switching (square wave: the value at the end of the previous half period).
3. **Final value u(∞)**: the DC steady state, with capacitors **open** and inductors **shorted**.
4. **Time constant**: $τ = R_{eq}C$ or $τ = \\frac{L}{R_{eq}}$, $R_eq$ seen from the storage element’s terminals.
5. Put them in. To find "how long until it reaches a value": $t = τ ln\\frac{u(0_+) - u(∞)}{u(t) - u(∞)}$ (ln = natural log).`,
    ),
    example: tr(
      `- 实验 3-1 充电 1τ：$5 + (0 - 5)e^{-1} ≈ 3.16 V$（走完 63 %）。500 Hz 稳态放电：从 3.65 V 走向 0，1 ms 后 $3.65e^{-1} ≈ 1.34 V$。
- 实验 3-7：终值不是 5 V 而是 $5 × \\frac{10}{20.05} ≈ 2.49 V$，τ ≈ 0.50 ms。
- 实验 5-14：占空比一变，VDAC 走向新值，4.6τ ≈ 46 ms 后误差小于 1 %。`,
      `- Lab 3-1, charging for 1τ: $5 + (0 - 5)e^{-1} ≈ 3.16 V$ (63 % of the way). Steady state at 500 Hz, discharging from 3.65 V towards 0: after 1 ms, $3.65e^{-1} ≈ 1.34 V$.
- Lab 3-7: the final value is not 5 V but $5 × \\frac{10}{20.05} ≈ 2.49 V$, with τ ≈ 0.50 ms.
- Lab 5-14: after a duty change VDAC heads for the new value and is within 1 % after 4.6τ ≈ 46 ms.`,
    ),
    pitfalls: [
      tr(
        '只有电容电压和电感电流连续；电阻电压、电容电流在 0+ 时刻可以跳变（微分电路的尖峰就是这样来的）。',
        'Only capacitor voltage and inductor current are continuous; a resistor’s voltage or a capacitor’s current may jump at 0+ (that is the differentiator’s spike).',
      ),
      tr('终值要用“电容开路”的电路算，别直接写电源电压。', 'Work the final value out with the capacitor open; don’t just write down the source voltage.'),
    ],
    Figure: () => (
      <g>
        <path d="M20 125 H245 M20 125 V15" className="cf-w thin" />
        <path d="M20 30 H245" className="cf-w thin" strokeDasharray="4 3" />
        <polyline
          points={Array.from({ length: 56 }, (_, k) => `${20 + k * 4},${(125 - 95 * (1 - Math.exp(-(k * 4) / 45))).toFixed(1)}`).join(' ')}
          className="cf-w accent"
          fill="none"
        />
        <path d="M65 125 V65" className="cf-w thin" strokeDasharray="2 3" />
        <T x={65} y={140}>
          τ
        </T>
        <T x={78} y={62} anchor="start" cls="small">
          63 %
        </T>
        <T x={244} y={24} anchor="end">
          u(∞)
        </T>
        <T x={26} y={120} anchor="start" cls="small">
          u(0+)
        </T>
      </g>
    ),
    teardowns: ['capacitor'],
    lessons: ['exp3-rc-square-charging', 'exp3-rc-thevenin-tau', 'exp3-led-breathing', 'exp3-rl-square', 'exp5-pwm-rc-dac', 'exp5-i2c-pullup-rise-time'],
    chapter: 'first-order',
  },
  {
    id: 'rise-time',
    group: 'transients',
    title: tr('上升时间 10 %→90 % = τ·ln 9', 'Rise time 10 %→90 % = τ·ln 9'),
    tex: 't_r = τ ln 9 ≈ 2.2 τ',
    use: tr('示波器量到的上升时间 tᵣ 反推时间常数 τ（或反过来）。', 'Work back from the rise time tᵣ the scope measures to the time constant τ (or the other way).'),
    vars: [{ sym: 't_r', name: tr('10 %→90 % 上升时间', '10 %→90 % rise time'), unit: 's', def: 0.0022 }],
    out: { sym: 'τ', name: tr('时间常数', 'time constant'), unit: 's' },
    compute: (v) => v.t_r / Math.log(9),
    why: tr(
      `1. 从 0 充向终值：$\\frac{u}{u(∞)} = 1 - e^{-t/τ}$。
2. 到 10 % 的时刻：$t_1 = τ ln\\frac{1}{0.9}$；到 90 %：$t_2 = τ ln 10$。
3. 相减：$t_r = t_2 - t_1 = τ ln 9 ≈ 2.197τ$。
4. 所以 $τ = \\frac{t_r}{ln 9}$——不用知道终值，也不用从 0 开始量。
5. I²C 规范的 $t_r$ 是 30 %→70 %：$τ ln\\frac{7}{3} ≈ 0.847τ$。`,
      `1. Charging from 0 towards the final value: $\\frac{u}{u(∞)} = 1 - e^{-t/τ}$.
2. It reaches 10 % at $t_1 = τ ln\\frac{1}{0.9}$ and 90 % at $t_2 = τ ln 10$.
3. Subtract: $t_r = t_2 - t_1 = τ ln 9 ≈ 2.197τ$.
4. So $τ = \\frac{t_r}{ln 9}$ — no need for the final value or for starting at 0.
5. The I²C spec’s $t_r$ is 30 %→70 %: $τ ln\\frac{7}{3} ≈ 0.847τ$.`,
    ),
    example: tr(
      '实验 3-1（50 Hz）：$t_r ≈ 2.2 ms$ → τ ≈ 1.0 ms。实验 3-3：电流（$u_R$）的 $t_r ≈ 146 µs$ → τ ≈ 66 µs = 10 mH / 151 Ω。实验 5-16：2.2 kΩ + 200 pF 的 $t_r ≈ 0.97 µs$。',
      'Lab 3-1 (50 Hz): $t_r ≈ 2.2 ms$ → τ ≈ 1.0 ms. Lab 3-3: the current’s ($u_R$’s) $t_r ≈ 146 µs$ → τ ≈ 66 µs = 10 mH / 151 Ω. Lab 5-16: 2.2 kΩ + 200 pF gives $t_r ≈ 0.97 µs$.',
    ),
    pitfalls: [
      tr(
        '半个周期里没走完（τ 和半周期差不多）时，示波器按实际摆幅算 10 %/90 %，结果会比 2.2τ 小。',
        'If the edge doesn’t finish within half a period (τ comparable with it), the scope takes 10 %/90 % of the actual swing and reads less than 2.2τ.',
      ),
    ],
    teardowns: ['oscilloscope'],
    lessons: ['exp3-rc-square-charging', 'exp3-rl-square', 'exp5-i2c-pullup-rise-time'],
    chapter: 'first-order',
  },
  {
    id: 'tau-from-vh-vl',
    group: 'transients',
    title: tr('由 VH、VL 反推 τ', 'τ from the swing VH / VL'),
    tex: 'τ = \\frac{T/2}{ln\\frac{V_H - u(∞)}{V_L - u(∞)}}',
    use: tr(
      '方波驱动、电容在 VH 和 VL 之间来回：用一个半周期的放电段直接算出 τ。',
      'A square-driven capacitor swinging between VH and VL: work τ out straight from one discharging half period.',
    ),
    vars: [
      { sym: 'T_h', name: tr('半周期 T/2', 'half period T/2'), unit: 's', def: 0.0005 },
      { sym: 'V_H', name: tr('最高值', 'highest value'), unit: 'V', def: 1.82 },
      { sym: 'V_L', name: tr('最低值', 'lowest value'), unit: 'V', def: 0.67 },
      { sym: 'u_∞', name: tr('放电段的终值（放到 0 V 就填 0）', 'final value of the discharging half (0 if towards 0 V)'), unit: 'V', def: 0 },
    ],
    out: { sym: 'τ', name: tr('时间常数', 'time constant'), unit: 's' },
    compute: (v) => v.T_h / Math.log((v.V_H - v['u_∞']) / (v.V_L - v['u_∞'])),
    why: tr(
      `1. 稳态时，放电半周期从 $V_H$ 出发，走向终值 $u(∞)$（方波低电平时通常是 0 V）。
2. 三要素法：经过 T/2 正好到 $V_L$：$V_L - u(∞) = [V_H - u(∞)]e^{-T/(2τ)}$。
3. 取对数解出 $τ = \\frac{T/2}{ln\\frac{V_H - u(∞)}{V_L - u(∞)}}$。
4. 好处：不需要从 0 开始，任何频率都行；再用 $R_{eq} = \\frac{τ}{C}$ 就能检查等效电阻（或测出电容的真实值）。`,
      `1. In steady state the discharging half period starts at $V_H$ and heads for the final value $u(∞)$ (usually 0 V while the square is low).
2. Three-element method: after T/2 it is exactly at $V_L$: $V_L - u(∞) = [V_H - u(∞)]e^{-T/(2τ)}$.
3. Take logs: $τ = \\frac{T/2}{ln\\frac{V_H - u(∞)}{V_L - u(∞)}}$.
4. The beauty: no need to start from 0, any frequency works; then $R_{eq} = \\frac{τ}{C}$ checks the equivalent resistance (or measures the capacitor’s real value).`,
    ),
    example: tr(
      '实验 3-7（1 kHz）：$τ = \\frac{0.5 ms}{ln(1.82/0.67)} ≈ 0.50 ms$，$R_{eq} = \\frac{0.50 ms}{100 nF} ≈ 5.0 kΩ = (10k + 50) ∥ 10k$。2 kHz 时 1.55 V / 0.94 V 也给出 ≈ 0.50 ms。',
      'Lab 3-7 (1 kHz): $τ = \\frac{0.5 ms}{ln(1.82/0.67)} ≈ 0.50 ms$, $R_{eq} = \\frac{0.50 ms}{100 nF} ≈ 5.0 kΩ = (10k + 50) ∥ 10k$. At 2 kHz, 1.55 V / 0.94 V also give ≈ 0.50 ms.',
    ),
    pitfalls: [tr('用的是半周期 T/2，不是整周期。', 'It is the half period T/2, not the whole period.')],
    lessons: ['exp3-rc-thevenin-tau', 'exp3-rc-square-charging'],
    chapter: 'first-order',
  },
  {
    id: 'square-rc-vpp',
    group: 'transients',
    title: tr('方波下的稳态摆幅 ΔU·tanh(T/4τ)', 'Square-wave swing ΔU·tanh(T/4τ)'),
    tex: 'V_{pp} = ΔU tanh\\frac{T}{4τ}',
    use: tr(
      '方波反复充放电，一阶电路稳态时来回摆多大（RC 电容电压、RL 电流、PWM 纹波）。',
      'A square wave charging and discharging over and over: how far a first-order circuit swings in steady state (RC capacitor voltage, RL current, PWM ripple).',
    ),
    vars: [
      { sym: 'ΔU', name: tr('方波每次跳变的高度', 'height of each square-wave step'), unit: 'V', def: 5 },
      { sym: 'f', name: tr('方波频率', 'square-wave frequency'), unit: 'Hz', def: 500 },
      { sym: 'τ', name: tr('时间常数', 'time constant'), unit: 's', def: 0.001005 },
    ],
    out: { sym: 'V_pp', name: tr('稳态峰峰值', 'steady-state peak-to-peak'), unit: 'V' },
    compute: (v) => v['ΔU'] * Math.tanh(1 / (4 * v.f * v['τ'])),
    why: tr(
      `1. 稳态时电容在 $V_L$ 和 $V_H$ 之间来回（50 % 占空比，以 0 和 ΔU 为例）。
2. 充电半周期：$V_H = ΔU - (ΔU - V_L)e^{-T/(2τ)}$。
3. 放电半周期：$V_L = V_He^{-T/(2τ)}$。
4. 两式联立：$V_H - V_L = ΔU\\frac{1 - e^{-T/2τ}}{1 + e^{-T/2τ}} = ΔU tanh\\frac{T}{4τ}$。
5. 两头：$T ≫ τ$ 时 tanh → 1，摆满 ΔU；$T ≪ τ$ 时 $tanh x ≈ x$，摆幅 ≈ $\\frac{ΔU T}{4τ}$，波形变成三角波（积分）。`,
      `1. In steady state the capacitor swings between $V_L$ and $V_H$ (50 % duty, steps between 0 and ΔU).
2. Charging half: $V_H = ΔU - (ΔU - V_L)e^{-T/(2τ)}$.
3. Discharging half: $V_L = V_He^{-T/(2τ)}$.
4. Solve both: $V_H - V_L = ΔU\\frac{1 - e^{-T/2τ}}{1 + e^{-T/2τ}} = ΔU tanh\\frac{T}{4τ}$.
5. The limits: for $T ≫ τ$, tanh → 1 and the full ΔU is covered; for $T ≪ τ$, $tanh x ≈ x$, the swing is ≈ $\\frac{ΔU T}{4τ}$ and the waveform becomes a triangle (an integral).`,
    ),
    example: tr(
      `- 实验 3-1：500 Hz、τ ≈ 1 ms：$5 tanh(0.5) ≈ 2.3 V$；5 kHz：≈ 0.25 V 三角波。
- 实验 3-2：积分支路 τ = 10 ms、500 Hz：$5 tanh(0.05) ≈ 0.25 V$。
- 实验 3-3：电阻电压的满幅 1.32 V，10 kHz：$1.32 tanh(0.38) ≈ 0.48 V$。
- 实验 5-14：100 Hz、τ = 10 ms、3.3 V：$3.3 tanh(0.25) ≈ 0.81 V$。`,
      `- Lab 3-1: 500 Hz, τ ≈ 1 ms: $5 tanh(0.5) ≈ 2.3 V$; at 5 kHz a ≈ 0.25 V triangle.
- Lab 3-2: integrator branch τ = 10 ms at 500 Hz: $5 tanh(0.05) ≈ 0.25 V$.
- Lab 3-3: the resistor voltage’s full swing is 1.32 V; at 10 kHz $1.32 tanh(0.38) ≈ 0.48 V$.
- Lab 5-14: 100 Hz, τ = 10 ms, 3.3 V: $3.3 tanh(0.25) ≈ 0.81 V$.`,
    ),
    pitfalls: [
      tr('ΔU 是一次跳变的高度：±2.5 V 的方波跳 5 V，不是 2.5 V。', 'ΔU is the height of one step: a ±2.5 V square jumps by 5 V, not 2.5 V.'),
      tr('只适用于 50 % 占空比；其它占空比的 PWM 纹波见“PWM + RC 的纹波”。', 'Only for 50 % duty; for other duty cycles see "PWM + RC ripple".'),
    ],
    lessons: ['exp3-rc-square-charging', 'exp3-rc-differentiator-integrator', 'exp3-rl-square', 'exp3-rc-thevenin-tau', 'exp3-opamp-integrator', 'exp5-pwm-rc-dac'],
    chapter: 'first-order',
  },
  {
    id: 'rl-time-constant',
    group: 'transients',
    title: tr('RL 时间常数 τ = L/R', 'RL time constant τ = L/R'),
    tex: 'τ = \\frac{L}{R}',
    use: tr('电感电流建立 / 衰减有多快；R 是回路里所有电阻之和。', 'How fast an inductor’s current builds up or dies away; R is all the resistance in the loop.'),
    vars: [
      { sym: 'L', name: tr('电感', 'inductance'), unit: 'H', def: 0.01 },
      { sym: 'R', name: tr('回路总电阻（含 50 Ω、线圈电阻）', 'total loop resistance (50 Ω and winding included)'), unit: 'Ω', def: 151 },
    ],
    out: { sym: 'τ', name: tr('时间常数', 'time constant'), unit: 's' },
    compute: (v) => v.L / v.R,
    why: tr(
      `1. 电感：$u_L = L\\frac{di}{dt}$，**电流不能突变**（电压可以）。
2. KVL：$U_s = Ri + L\\frac{di}{dt}$，和 RC 是同一类方程，$τ = \\frac{L}{R}$（H / Ω = s）。
3. 稳态电流 $\\frac{U_s}{R}$（电感当短路），从初值指数地走过去。
4. 和 RC 相反：**R 越大，τ 越小**（电流的“终点”变小了，走得更快）。
5. 跳变瞬间电流来不及变，整个跳变电压都落在电感上，然后按 τ 衰减。`,
      `1. An inductor obeys $u_L = L\\frac{di}{dt}$: **its current cannot jump** (its voltage can).
2. KVL: $U_s = Ri + L\\frac{di}{dt}$ — the same kind of equation as RC, with $τ = \\frac{L}{R}$ (H / Ω = s).
3. The steady current is $\\frac{U_s}{R}$ (inductor shorted); the current approaches it exponentially.
4. Opposite to RC: **the larger R, the smaller τ** (the end point is lower, so it gets there sooner).
5. At a step the current has no time to change, so the whole step lands on the inductor and then decays with τ.`,
    ),
    example: tr(
      `- 实验 3-3：$\\frac{10 mH}{100 + 50 + 1} ≈ 66 µs$；稳态电流 $\\frac{1 V}{151 Ω} ≈ 6.6 mA$。
- 实验 5-15：电机 $\\frac{2 mH}{8 Ω} = 0.25 ms$：20 kHz 的 50 µs 周期 ≪ τ，电流几乎是平的。
- 实验 5-9：继电器线圈 $\\frac{150 mH}{70 Ω} ≈ 2.1 ms$。`,
      `- Lab 3-3: $\\frac{10 mH}{100 + 50 + 1} ≈ 66 µs$; the steady current is $\\frac{1 V}{151 Ω} ≈ 6.6 mA$.
- Lab 5-15: the motor’s $\\frac{2 mH}{8 Ω} = 0.25 ms$: a 50 µs period at 20 kHz is ≪ τ, so the current is nearly flat.
- Lab 5-9: the relay coil’s $\\frac{150 mH}{70 Ω} ≈ 2.1 ms$.`,
    ),
    pitfalls: [
      tr('忘了线圈自己的电阻：真实的小 10 mH 电感常有 10–30 Ω。', 'Forgetting the coil’s own resistance: a real small 10 mH inductor often has 10–30 Ω.'),
      tr('把 RC 的习惯套过来写成 τ = LR。', 'Carrying the RC habit over and writing τ = LR.'),
    ],
    Figure: () => (
      <g>
        <V x={40} y1={45} y2={105} label="Uₛ" />
        <Path d="40,45 40,30 60,30" />
        <R x1={60} y1={30} x2={140} y2={30} label="R" />
        <Path d="140,30 190,30 190,45" />
        <L x1={190} y1={45} x2={190} y2={105} label="L" />
        <Path d="190,105 190,125 40,125 40,105" />
        <Arrow x={165} y={30} label="i" ly={22} />
        <VArrow x={225} y1={110} y2={45} label="u_L" />
      </g>
    ),
    teardowns: ['inductor'],
    lessons: ['exp3-rl-square', 'exp5-pwm-mosfet-motor', 'exp5-relay-flyback', 'exp5-mosfet-logic-level'],
    chapter: 'first-order',
  },
  {
    id: 'flyback-spike',
    group: 'transients',
    title: tr('电感断电的反冲 v = L·di/dt', 'Inductive kick v = L·di/dt'),
    tex: 'v = L \\frac{di}{dt} ≈ L \\frac{I}{Δt}',
    use: tr(
      '突然切断线圈的电流会产生多高的电压——以及为什么要并续流二极管。',
      'How high the voltage goes when a coil’s current is suddenly cut — and why it needs a flyback diode.',
    ),
    vars: [
      { sym: 'L', name: tr('线圈电感', 'coil inductance'), unit: 'H', def: 0.15 },
      { sym: 'I', name: tr('断开前的电流', 'current before switch-off'), unit: 'A', def: 0.063 },
      { sym: 'Δt', name: tr('开关断开用的时间', 'time the switch takes to open'), unit: 's', def: 0.000001 },
    ],
    out: { sym: 'v', name: tr('“想要”的反冲电压', 'kick voltage it would need'), unit: 'V' },
    compute: (v) => (v.L * v.I) / v['Δt'],
    why: tr(
      `1. 电感电流不能突变：三极管 / MOSFET 断开时，线圈“想”让电流按原方向继续流。
2. 没有路可走，$\\frac{di}{dt}$ 极大，$v = L\\frac{di}{dt}$ 就极高：集电极（漏极）冲到电源电压以上几十伏，直到三极管击穿或空气放电。
3. **续流二极管**反向并在线圈上：导通时它反偏不起作用；断开时集电极一超过 $U_s + 0.7 V$，它就导通，把电压钳住。
4. 电流改走“线圈 → 二极管 → 线圈”这个小回路，按 $τ = \\frac{L}{R}$ 衰减，能量变成线圈电阻和二极管里的热。`,
      `1. An inductor’s current cannot jump: when the transistor / MOSFET opens, the coil "wants" its current to keep flowing the same way.
2. With nowhere to go, $\\frac{di}{dt}$ is huge and so is $v = L\\frac{di}{dt}$: the collector (drain) flies tens of volts above the supply until the transistor breaks down or the air sparks.
3. A **flyback diode** reversed across the coil is reverse-biased while the coil is on; at switch-off, as soon as the collector passes $U_s + 0.7 V$ it conducts and clamps the voltage.
4. The current now circulates "coil → diode → coil" and decays with $τ = \\frac{L}{R}$; the energy becomes heat in the coil resistance and the diode.`,
    ),
    example: tr(
      '实验 5-9：150 mH、63 mA，如果 1 µs 内断开，“需要” $\\frac{0.15 × 0.063}{10^{-6}} ≈ 9.5 kV$——实际在三极管 C–E 击穿（约 40 V）时就停住了（模拟器约 29 V）。并上 D1 后集电极最高只有 $4.65 + 0.7 ≈ 5.4 V$，电流按 $\\frac{150 mH}{70 Ω} ≈ 2 ms$ 衰减。实验 5-8：电机漏极被钳在 $5 + 1.1 ≈ 6.1 V$。',
      'Lab 5-9: 150 mH at 63 mA cut within 1 µs would "need" $\\frac{0.15 × 0.063}{10^{-6}} ≈ 9.5 kV$ — in reality it stops where the transistor’s C–E breaks down (about 40 V; the simulator shows about 29 V). With D1 the collector only reaches $4.65 + 0.7 ≈ 5.4 V$ and the current decays with $\\frac{150 mH}{70 Ω} ≈ 2 ms$. Lab 5-8: the motor’s drain is clamped at $5 + 1.1 ≈ 6.1 V$.',
    ),
    pitfalls: [
      tr(
        '二极管接反：导通时它把线圈短路，三极管直接对电源短路。条纹（阴极）朝电源正端。',
        'Diode the wrong way: it shorts the coil while it is on, and the transistor shorts the supply. The band (cathode) goes to the supply end.',
      ),
      tr('PWM 驱动电机时 1N4007 太慢，用肖特基（1N5819、SS34）。', 'With PWM on a motor a 1N4007 is too slow; use a Schottky (1N5819, SS34).'),
    ],
    Figure: () => (
      <g>
        <Path d="150,15 150,30" />
        <T x={150} y={12}>
          +5 V
        </T>
        <L x1={150} y1={30} x2={150} y2={80} label="" />
        <T x={132} y={60} anchor="end">
          L
        </T>
        <Path d="150,30 200,30 200,40" />
        <D x1={200} y1={80} x2={200} y2={40} />
        <Path d="200,80 200,90 150,90" />
        <Path d="150,80 150,90" />
        <Dot x={150} y={90} />
        <Npn x={110} y={112} />
        <Path d="138,82 138,90 150,90" />
        <Path d="138,142 138,146" />
        <Gnd x={138} y={146} />
        <Path d="70,112 110,112" />
        <T x={66} y={116} anchor="end">
          B
        </T>
        <Arrow x={186} y={60} dir="u" label="" />
        <T x={214} y={64} anchor="start" cls="small accent">
          D1
        </T>
      </g>
    ),
    teardowns: ['relay', 'inductor', 'diode'],
    lessons: ['exp5-relay-flyback', 'exp5-mosfet-logic-level', 'exp5-pwm-mosfet-motor', 'exp5-high-side-vs-low-side', 'exp3-rl-square'],
    chapter: 'storage',
  },
  {
    id: 'rlc-damping',
    group: 'transients',
    title: tr('RLC 串联的阻尼比 ζ', 'Series RLC damping ratio ζ'),
    tex: 'ζ = \\frac{α}{ω_0} = \\frac{R}{2}\\sqrt{\\frac{C}{L}}, α = \\frac{R}{2L}, ω_0 = \\frac{1}{\\sqrt{LC}}',
    use: tr('RLC 串联的阶跃响应会不会振铃：ζ < 1 欠阻尼、= 1 临界、> 1 过阻尼。', 'Whether a series RLC rings after a step: ζ < 1 underdamped, = 1 critical, > 1 overdamped.'),
    vars: [
      { sym: 'R', name: tr('回路总电阻（电位器 + 50 Ω + 线圈 1 Ω）', 'total loop resistance (pot + 50 Ω + 1 Ω winding)'), unit: 'Ω', def: 101 },
      { sym: 'L', name: tr('电感', 'inductance'), unit: 'H', def: 0.01 },
      { sym: 'C', name: tr('电容', 'capacitance'), unit: 'F', def: 1e-7 },
    ],
    out: { sym: 'ζ', name: tr('阻尼比（< 1 振铃）', 'damping ratio (< 1 rings)'), unit: '' },
    compute: (v) => (v.R / 2) * Math.sqrt(v.C / v.L),
    why: tr(
      `1. KVL：$LC u_C'' + RC u_C' + u_C = u_s$，二阶方程。
2. 特征方程 $s^{2} + \\frac{R}{L}s + \\frac{1}{LC} = 0$，根 $s = -α ± \\sqrt{α^{2} - ω_0^{2}}$，$α = \\frac{R}{2L}$（衰减快慢），$ω_0 = \\frac{1}{\\sqrt{LC}}$（无阻尼振荡频率）。
3. 比一比：$ζ = \\frac{α}{ω_0} = \\frac{R}{2}\\sqrt{\\frac{C}{L}}$。
4. ζ < 1：复根，**欠阻尼**，以 $ω_d = ω_0\\sqrt{1 - ζ^{2}}$ 振铃，包络 $e^{-αt}$；ζ = 1：**临界阻尼**，最快不超调，$R_c = 2\\sqrt{\\frac{L}{C}}$；ζ > 1：两个实根，**过阻尼**，慢慢爬上去。`,
      `1. KVL: $LC u_C'' + RC u_C' + u_C = u_s$, a second-order equation.
2. Characteristic equation $s^{2} + \\frac{R}{L}s + \\frac{1}{LC} = 0$, roots $s = -α ± \\sqrt{α^{2} - ω_0^{2}}$ with $α = \\frac{R}{2L}$ (how fast it decays) and $ω_0 = \\frac{1}{\\sqrt{LC}}$ (the undamped frequency).
3. Compare them: $ζ = \\frac{α}{ω_0} = \\frac{R}{2}\\sqrt{\\frac{C}{L}}$.
4. ζ < 1: complex roots, **underdamped**, ringing at $ω_d = ω_0\\sqrt{1 - ζ^{2}}$ inside an $e^{-αt}$ envelope; ζ = 1: **critically damped**, the fastest without overshoot, at $R_c = 2\\sqrt{\\frac{L}{C}}$; ζ > 1: two real roots, **overdamped**, a slow creep up.`,
    ),
    example: tr(
      '实验 3-4（10 mH、100 nF）：$f_0 = \\frac{1}{2π\\sqrt{LC}} ≈ 5.03 kHz$，$R_c = 2\\sqrt{10^{-2}/10^{-7}} ≈ 632 Ω$。电位器 5 %：R ≈ 101 Ω，ζ ≈ 0.16（振铃）；30 %：351 Ω，ζ ≈ 0.56；60 %：651 Ω，ζ ≈ 1.03（临界附近）；100 %：1051 Ω，ζ ≈ 1.66（过阻尼）。',
      'Lab 3-4 (10 mH, 100 nF): $f_0 = \\frac{1}{2π\\sqrt{LC}} ≈ 5.03 kHz$, $R_c = 2\\sqrt{10^{-2}/10^{-7}} ≈ 632 Ω$. Pot at 5 %: R ≈ 101 Ω, ζ ≈ 0.16 (rings); 30 %: 351 Ω, ζ ≈ 0.56; 60 %: 651 Ω, ζ ≈ 1.03 (about critical); 100 %: 1051 Ω, ζ ≈ 1.66 (overdamped).',
    ),
    pitfalls: [
      tr(
        'R 是回路 **总** 电阻：发生器的 50 Ω 和线圈电阻都在里面，电位器转到 0 时 ζ 也只能降到约 0.08。',
        'R is the **total** loop resistance: the generator’s 50 Ω and the winding are in it, so even with the pot at 0 ζ only drops to about 0.08.',
      ),
      tr(
        '并联 RLC 的阻尼比公式不同：$ζ = \\frac{1}{2R}\\sqrt{\\frac{L}{C}}$，R 越大阻尼越小。',
        'A parallel RLC is different: $ζ = \\frac{1}{2R}\\sqrt{\\frac{L}{C}}$ — there a larger R means less damping.',
      ),
    ],
    Figure: () => (
      <g>
        <V x={30} y1={45} y2={105} label="" />
        <Path d="30,45 30,30 45,30" />
        <R x1={45} y1={30} x2={110} y2={30} label="R" />
        <L x1={110} y1={30} x2={175} y2={30} label="L" />
        <Path d="175,30 210,30 210,55" />
        <C x1={210} y1={55} x2={210} y2={100} label="C" />
        <Path d="210,100 210,125 30,125 30,105" />
        <VArrow x={245} y1={110} y2={45} label="" />
        <T x={240} y={130} anchor="end">
          u_C
        </T>
      </g>
    ),
    lessons: ['exp3-rlc-ringing'],
    chapter: 'second-order',
  },
  {
    id: 'rlc-overshoot',
    group: 'transients',
    title: tr('欠阻尼的超调量', 'Underdamped overshoot'),
    tex: 'M_p = e^{-πζ/\\sqrt{1 - ζ^{2}}}',
    use: tr(
      '欠阻尼的阶跃响应第一个峰比终值高出多少（占阶跃高度的百分比）。',
      'How far the first peak of an underdamped step response overshoots the final value (as a share of the step).',
    ),
    vars: [{ sym: 'ζ', name: tr('阻尼比', 'damping ratio'), unit: '', def: 0.16, min: 0 }],
    out: { sym: 'M_p', name: tr('超调量（ζ ≥ 1 时为 0）', 'overshoot (0 for ζ ≥ 1)'), unit: '%' },
    compute: (v) => (v['ζ'] >= 1 ? 0 : Math.exp((-Math.PI * v['ζ']) / Math.sqrt(1 - v['ζ'] * v['ζ'])) * 100),
    why: tr(
      `1. 欠阻尼阶跃响应：$u_C = U[1 - e^{-αt}(cos ω_dt + \\frac{α}{ω_d}sin ω_dt)]$。
2. 第一个峰在半个振荡周期处：$t_p = \\frac{π}{ω_d}$。
3. 代进去，超出终值的部分是 $Ue^{-απ/ω_d}$。
4. 用 ζ 写：$\\frac{α}{ω_d} = \\frac{ζ}{\\sqrt{1 - ζ^{2}}}$，所以 $M_p = e^{-πζ/\\sqrt{1 - ζ^{2}}}$。
5. 峰值电压 = 终值 + $M_p$ × 阶跃高度。ζ → 0 时接近 100 %（电容电压能到电源的两倍）。`,
      `1. Underdamped step response: $u_C = U[1 - e^{-αt}(cos ω_dt + \\frac{α}{ω_d}sin ω_dt)]$.
2. The first peak comes half an oscillation in: $t_p = \\frac{π}{ω_d}$.
3. Substituting, the part above the final value is $Ue^{-απ/ω_d}$.
4. In terms of ζ, $\\frac{α}{ω_d} = \\frac{ζ}{\\sqrt{1 - ζ^{2}}}$, so $M_p = e^{-πζ/\\sqrt{1 - ζ^{2}}}$.
5. Peak voltage = final value + $M_p$ × step height. As ζ → 0 it approaches 100 % (the capacitor reaches twice the source).`,
    ),
    example: tr(
      '实验 3-4：ζ ≈ 0.16 → 约 60 %，0 → 2 V 的阶跃峰值 ≈ $2 + 2 × 0.6 ≈ 3.2 V$（比信号还高）；ζ ≈ 0.56 → 约 12 %，峰值 ≈ 2.25 V。',
      'Lab 3-4: ζ ≈ 0.16 → about 60 %, so a 0 → 2 V step peaks at ≈ $2 + 2 × 0.6 ≈ 3.2 V$ (above the signal); ζ ≈ 0.56 → about 12 %, a peak of ≈ 2.25 V.',
    ),
    pitfalls: [tr('超调乘的是阶跃高度，不是终值的绝对电压（偏置不算）。', 'The overshoot multiplies the step height, not the absolute final voltage (offsets don’t count).')],
    lessons: ['exp3-rlc-ringing'],
    chapter: 'second-order',
  },
  {
    id: 'opamp-integrator',
    group: 'transients',
    title: tr('op-amp 积分器：方波变三角波', 'Op-amp integrator: square in, triangle out'),
    tex: 'u_o = -\\frac{1}{RC}∫u_i dt, V_{pp} = \\frac{U_i}{RC} × \\frac{T}{2}',
    use: tr('反相积分器的输出斜率和三角波的峰峰值。', 'The output slope of an inverting integrator and the peak-to-peak of its triangle.'),
    vars: [
      { sym: 'U_i', name: tr('方波幅度（±Uᵢ）', 'square-wave amplitude (±Uᵢ)'), unit: 'V', def: 1 },
      { sym: 'R', name: tr('输入电阻 R_in', 'input resistor R_in'), unit: 'Ω', def: 10000 },
      { sym: 'C', name: tr('反馈电容 C_F', 'feedback capacitor C_F'), unit: 'F', def: 1e-7 },
      { sym: 'f', name: tr('方波频率', 'square-wave frequency'), unit: 'Hz', def: 1000 },
    ],
    out: { sym: 'V_pp', name: tr('输出三角波峰峰值', 'output triangle peak-to-peak'), unit: 'V' },
    compute: (v) => v.U_i / (v.R * v.C) / (2 * v.f),
    why: tr(
      `1. 虚短：IN− 和 IN+ 同电位（虚地，单电源时是 4.5 V 参考）。
2. 输入电流 $i = \\frac{u_i}{R}$ 与输出无关；虚断：它全部流进 $C_F$。
3. 电容：$i = C\\frac{d(v_- - u_o)}{dt}$ ⇒ $\\frac{du_o}{dt} = -\\frac{u_i}{RC}$——斜率恒定。
4. 方波 ±$U_i$：每半个周期输出走 $\\frac{U_i}{RC} × \\frac{T}{2}$，就是三角波的峰峰值。
5. 正弦输入：输出幅度 $\\frac{U_i}{ωRC}$，超前 90°（反相 180° + 积分 −90°）。并联的 $R_P$ 给直流反馈（直流增益 $-\\frac{R_P}{R}$），否则输出会慢慢漂到电源轨。`,
      `1. Virtual short: IN− sits at IN+’s potential (a virtual ground; 4.5 V reference on a single supply).
2. The input current $i = \\frac{u_i}{R}$ doesn’t depend on the output; virtual open: all of it flows into $C_F$.
3. Capacitor: $i = C\\frac{d(v_- - u_o)}{dt}$ ⇒ $\\frac{du_o}{dt} = -\\frac{u_i}{RC}$ — a constant slope.
4. A ±$U_i$ square: each half period the output moves $\\frac{U_i}{RC} × \\frac{T}{2}$, the triangle’s peak-to-peak.
5. A sine input: output amplitude $\\frac{U_i}{ωRC}$, leading by 90° (inversion 180° + integration −90°). The parallel $R_P$ gives DC feedback (DC gain $-\\frac{R_P}{R}$); without it the output slowly drifts to a rail.`,
    ),
    example: tr(
      '实验 3-6：斜率 $\\frac{1 V}{10k × 100 nF} = 1000 V/s$，半周期 0.5 ms → 0.5 Vpp 三角波，中心 4.5 V；2 kHz → 0.25 Vpp；1 kHz 正弦 → $\\frac{1}{2π × 1000 × 1 ms} ≈ 0.16 V$ 幅度。',
      'Lab 3-6: slope $\\frac{1 V}{10k × 100 nF} = 1000 V/s$, half a period 0.5 ms → a 0.5 Vpp triangle centred on 4.5 V; 2 kHz → 0.25 Vpp; a 1 kHz sine → $\\frac{1}{2π × 1000 × 1 ms} ≈ 0.16 V$ amplitude.',
    ),
    pitfalls: [
      tr('输入为正时输出 **下降**（反相）。', 'While the input is positive the output **falls** (inverting).'),
      tr(
        '频率低到半周期和 $R_PC_F$ 差不多时（100 Hz），$R_P$ 起作用，输出远小于理想积分器。',
        'When half a period becomes comparable with $R_PC_F$ (100 Hz), $R_P$ shows and the output is far below an ideal integrator’s.',
      ),
    ],
    Figure: () => (
      <g>
        <OpAmp x={120} y={85} />
        <R x1={25} y1={65} x2={100} y2={65} label="R_in" />
        <Path d="100,65 120,65" />
        <Path d="120,105 105,105 105,128" />
        <Gnd x={105} y={128} />
        <T x={92} y={124} anchor="end" cls="small">
          V_ref
        </T>
        <Path d="190,85 240,85" />
        <Path d="110,65 110,30 145,30" />
        <C x1={145} y1={30} x2={185} y2={30} label="C_F" />
        <Path d="185,30 215,30 215,85" />
        <Dot x={110} y={65} />
        <Dot x={215} y={85} />
        <T x={25} y={57} anchor="start">
          u_i
        </T>
        <T x={240} y={77} anchor="end">
          u_o
        </T>
      </g>
    ),
    teardowns: ['lm358'],
    lessons: ['exp3-opamp-integrator'],
    chapter: 'opamp',
  },
];
