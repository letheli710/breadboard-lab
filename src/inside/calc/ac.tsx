// Calculation cards: capacitors, inductors and AC (reactance, impedance, phasor KVL, first-order
// filters, decibels, loading between stages, resonance, Q and bandwidth) — phase 4 and the scope
// lessons.

import { tr } from '../../core/i18n';
import type { CalcCard, CalcGroup } from '../types';
import { C, Dot, Gnd, L, OpAmp, Path, R, T, VArrow } from './fig';
import { Arrow } from './figx';

export const group = (): CalcGroup => ({
  id: 'ac',
  title: tr('电容、电感与交流 C, L and AC', 'Capacitors, inductors and AC'),
  intro: tr(
    '容抗、感抗、阻抗、相量、截止频率、dB、级间负载、谐振、Q 值——第 4 期实验和示波器课的计算。',
    'Reactance, impedance, phasors, cut-off frequency, dB, loading between stages, resonance and Q — the numbers behind phase 4 and the scope lessons.',
  ),
});

const TAU = 2 * Math.PI;
const deg = (rad: number) => (rad * 180) / Math.PI;

/** a sine generator symbol (circle with a wave) at x between y1 and y2 */
function Gen({ x, y1, y2, label }: { x: number; y1: number; y2: number; label?: string }) {
  const my = (y1 + y2) / 2;
  return (
    <g>
      <Path d={`${x},${y1} ${x},${my - 14}`} />
      <Path d={`${x},${my + 14} ${x},${y2}`} />
      <circle cx={x} cy={my} r={14} className="cf-w" fill="none" />
      <path d={`M${x - 9} ${my} q4.5 -9 9 0 q4.5 9 9 0`} className="cf-w" fill="none" />
      {label && (
        <T x={x - 20} y={my + 4} anchor="end">
          {label}
        </T>
      )}
    </g>
  );
}

/** generator → series element → shunt element → ground, output across the shunt element */
function TwoPart({ series, shunt, out = 'u_out' }: { series: 'R' | 'C' | 'L'; shunt: 'R' | 'C' | 'L'; out?: string }) {
  const Part = ({ k, x1, y1, x2, y2, label }: { k: 'R' | 'C' | 'L'; x1: number; y1: number; x2: number; y2: number; label: string }) =>
    k === 'R' ? (
      <R x1={x1} y1={y1} x2={x2} y2={y2} label={label} />
    ) : k === 'C' ? (
      <C x1={x1} y1={y1} x2={x2} y2={y2} label={label} />
    ) : (
      <L x1={x1} y1={y1} x2={x2} y2={y2} label={label} />
    );
  return (
    <g>
      <Gen x={40} y1={45} y2={105} label="uᵢ" />
      <Path d="40,45 40,30 65,30" />
      <Part k={series} x1={65} y1={30} x2={145} y2={30} label={series} />
      <Path d="145,30 190,30 190,50" />
      <Part k={shunt} x1={190} y1={50} x2={190} y2={105} label={shunt} />
      <Path d="190,105 190,125 40,125 40,105" />
      <Dot x={190} y={30} />
      <VArrow x={232} y1={112} y2={40} label="" />
      <T x={250} y={135} anchor="end">
        {out}
      </T>
      <Gnd x={115} y={125} />
    </g>
  );
}

export const cards = (): CalcCard[] => [
  {
    id: 'capacitive-reactance',
    group: 'ac',
    title: tr('容抗 Capacitive reactance', 'Capacitive reactance'),
    tex: 'X_C = \\frac{1}{2π f C}',
    use: tr('电容对某个频率的正弦信号“有多难通过”（单位 Ω）。', 'How hard it is for a sine of a given frequency to get through a capacitor (in Ω).'),
    vars: [
      { sym: 'f', name: tr('频率', 'frequency'), unit: 'Hz', def: 1000 },
      { sym: 'C', name: tr('电容', 'capacitance'), unit: 'F', def: 1e-7 },
    ],
    out: { sym: 'X_C', name: tr('容抗', 'reactance'), unit: 'Ω' },
    compute: (v) => 1 / (TAU * v.f * v.C),
    why: tr(
      `1. 电容的电流 $i = C\\frac{du}{dt}$。
2. 加正弦电压 $u = U_m sin(ωt)$，电流 $i = ωCU_m cos(ωt)$：幅度之比 $\\frac{U_m}{I_m} = \\frac{1}{ωC}$，其中 $ω = 2πf$。
3. 电流比电压 **超前 90°**（cos 比 sin 早四分之一周期）；相量写成 $Z_C = \\frac{1}{jωC} = -jX_C$。
4. 频率越高、电容越大，容抗越小：**直流（f = 0）时电容是开路，高频时接近短路**。`,
      `1. A capacitor’s current is $i = C\\frac{du}{dt}$.
2. With $u = U_m sin(ωt)$ the current is $i = ωCU_m cos(ωt)$, so the amplitude ratio is $\\frac{U_m}{I_m} = \\frac{1}{ωC}$ with $ω = 2πf$.
3. The current **leads** the voltage by 90° (cos comes a quarter period before sin); as a phasor $Z_C = \\frac{1}{jωC} = -jX_C$.
4. The higher the frequency or the larger the capacitor, the smaller the reactance: **open at DC (f = 0), nearly a short at high frequency**.`,
    ),
    example: tr(
      '第 13 课：100 nF、1 kHz：$X_C = \\frac{1}{2π × 1000 × 10^{-7}} ≈ 1.59 kΩ$，和 R₁ = 1 kΩ 差不多大。实验 4-1：100 nF 在 1061 Hz 正好 1.5 kΩ = R。',
      'Lesson 13: 100 nF at 1 kHz: $X_C = \\frac{1}{2π × 1000 × 10^{-7}} ≈ 1.59 kΩ$, about the size of R₁ = 1 kΩ. Lab 4-1: 100 nF at 1061 Hz is exactly 1.5 kΩ = R.',
    ),
    pitfalls: [tr('用 f 代替 ω（少了 2π）：结果大了 6.28 倍。', 'Using f instead of ω (missing the 2π): the answer comes out 6.28 times too big.')],
    Figure: () => (
      <g>
        <Gen x={60} y1={40} y2={110} label="u" />
        <Path d="60,40 60,25 170,25 170,52" />
        <C x1={170} y1={52} x2={170} y2={98} label="C" />
        <Path d="170,98 170,125 60,125 60,110" />
        <Arrow x={120} y={25} label="i" ly={17} />
      </g>
    ),
    teardowns: ['capacitor', 'breadboard'],
    lessons: ['lesson-scope-two-channels', 'exp4-rc-lowpass-bode', 'exp4-rc-highpass-coupling', 'exp3-rc-differentiator-integrator'],
    chapter: 'ac-analysis',
  },
  {
    id: 'inductive-reactance',
    group: 'ac',
    title: tr('感抗 Inductive reactance', 'Inductive reactance'),
    tex: 'X_L = 2π f L',
    use: tr('电感对某个频率的正弦信号的阻碍（单位 Ω）：频率越高越大。', 'How much an inductor opposes a sine of a given frequency (in Ω): the higher the frequency, the more.'),
    vars: [
      { sym: 'f', name: tr('频率', 'frequency'), unit: 'Hz', def: 1600 },
      { sym: 'L', name: tr('电感', 'inductance'), unit: 'H', def: 0.01 },
    ],
    out: { sym: 'X_L', name: tr('感抗', 'reactance'), unit: 'Ω' },
    compute: (v) => TAU * v.f * v.L,
    why: tr(
      `1. 电感的电压 $u = L\\frac{di}{dt}$。
2. 电流 $i = I_m sin(ωt)$ 时 $u = ωLI_m cos(ωt)$，幅度之比 $\\frac{U_m}{I_m} = ωL$。
3. 电压比电流 **超前 90°**（电流落后）；相量 $Z_L = jωL = jX_L$。
4. 和电容相反：**直流时电感是短路**（只剩线圈电阻 r），高频时接近开路。`,
      `1. An inductor’s voltage is $u = L\\frac{di}{dt}$.
2. With $i = I_m sin(ωt)$, $u = ωLI_m cos(ωt)$ and the amplitude ratio is $\\frac{U_m}{I_m} = ωL$.
3. The voltage **leads** the current by 90° (the current lags); as a phasor $Z_L = jωL = jX_L$.
4. The opposite of a capacitor: **a short at DC** (only the winding resistance r is left), nearly open at high frequency.`,
    ),
    example: tr(
      '实验 4-3：$2π × 1600 × 10 mH ≈ 100.5 Ω$，和 R + r = 101 Ω 几乎一样，所以电流落后约 45°。160 Hz 只有约 10 Ω，16 kHz 约 1005 Ω。实验 4-4：谐振 5033 Hz 时 $X_L ≈ 316 Ω$。',
      'Lab 4-3: $2π × 1600 × 10 mH ≈ 100.5 Ω$, almost exactly R + r = 101 Ω, so the current lags by about 45°. At 160 Hz only about 10 Ω, at 16 kHz about 1005 Ω. Lab 4-4: at resonance, 5033 Hz, $X_L ≈ 316 Ω$.',
    ),
    pitfalls: [
      tr('真实电感还有线圈电阻 r：它和 $X_L$ 是相量相加，不是直接相加。', 'A real inductor also has a winding resistance r, which adds to $X_L$ as a phasor, not directly.'),
    ],
    Figure: () => (
      <g>
        <Gen x={60} y1={40} y2={110} label="u" />
        <Path d="60,40 60,25 170,25 170,45" />
        <L x1={170} y1={45} x2={170} y2={105} label="L" />
        <Path d="170,105 170,125 60,125 60,110" />
        <Arrow x={120} y={25} label="i" ly={17} />
      </g>
    ),
    teardowns: ['inductor'],
    lessons: ['exp4-rl-phasors', 'exp4-series-resonance', 'exp4-parallel-lc-tank'],
    chapter: 'ac-analysis',
  },
  {
    id: 'rc-impedance',
    group: 'ac',
    title: tr('RC 串联阻抗 Series RC impedance', 'Series RC impedance'),
    tex: '|Z| = \\sqrt{R^{2} + X_C^{2}}, φ = -arctan\\frac{X_C}{R}',
    use: tr('电阻和电容串联后总的“阻碍”有多大，电流比电压超前多少。', 'How large the total opposition of R and C in series is, and how far the current leads the voltage.'),
    vars: [
      { sym: 'R', name: tr('电阻', 'resistance'), unit: 'Ω', def: 1000 },
      { sym: 'C', name: tr('电容', 'capacitance'), unit: 'F', def: 1e-7 },
      { sym: 'f', name: tr('频率', 'frequency'), unit: 'Hz', def: 1000 },
    ],
    out: { sym: '|Z|', name: tr('阻抗的模', 'impedance magnitude'), unit: 'Ω' },
    compute: (v) => Math.hypot(v.R, 1 / (TAU * v.f * v.C)),
    why: tr(
      `1. 相量：$Z = R + \\frac{1}{jωC} = R - jX_C$。
2. 模：$|Z| = \\sqrt{R^{2} + X_C^{2}}$——**不是** $R + X_C$，因为两者差 90°，像直角三角形的两条直角边。
3. 阻抗角 $φ_Z = -arctan\\frac{X_C}{R}$：电压落后电流，也就是电流超前电压。
4. 电流 $I = \\frac{U}{|Z|}$；电容分到 $U\\frac{X_C}{|Z|}$，电阻分到 $U\\frac{R}{|Z|}$。
5. 电容电压比输入落后 $arctan\\frac{R}{X_C}$。`,
      `1. As a phasor: $Z = R + \\frac{1}{jωC} = R - jX_C$.
2. Magnitude: $|Z| = \\sqrt{R^{2} + X_C^{2}}$ — **not** $R + X_C$: the two are 90° apart, like the legs of a right triangle.
3. Impedance angle $φ_Z = -arctan\\frac{X_C}{R}$: the voltage lags the current, i.e. the current leads.
4. Current $I = \\frac{U}{|Z|}$; the capacitor gets $U\\frac{X_C}{|Z|}$, the resistor $U\\frac{R}{|Z|}$.
5. The capacitor voltage lags the input by $arctan\\frac{R}{X_C}$.`,
    ),
    example: tr(
      '第 13 课：1 kΩ + 100 nF、1 kHz：$X_C ≈ 1592 Ω$，$|Z| = \\sqrt{1000^{2} + 1592^{2}} ≈ 1.88 kΩ$；电容电压 = 输入 × $\\frac{1592}{1880} ≈ 0.847$，落后 $arctan\\frac{1000}{1592} ≈ 32°$。',
      'Lesson 13: 1 kΩ + 100 nF at 1 kHz: $X_C ≈ 1592 Ω$, $|Z| = \\sqrt{1000^{2} + 1592^{2}} ≈ 1.88 kΩ$; the capacitor voltage = input × $\\frac{1592}{1880} ≈ 0.847$, lagging by $arctan\\frac{1000}{1592} ≈ 32°$.',
    ),
    pitfalls: [tr('直接把 R 和 $X_C$ 相加。', 'Adding R and $X_C$ directly.')],
    Figure: () => <TwoPart series="R" shunt="C" out="u_C" />,
    lessons: ['lesson-scope-two-channels', 'exp4-rc-lowpass-bode', 'exp4-rc-highpass-coupling'],
    chapter: 'ac-analysis',
  },
  {
    id: 'rl-impedance',
    group: 'ac',
    title: tr('RL 串联阻抗 Series RL impedance', 'Series RL impedance'),
    tex: '|Z| = \\sqrt{(R + r)^{2} + (ωL)^{2}}, φ = arctan\\frac{ωL}{R + r}',
    use: tr(
      '电阻和电感（带线圈电阻 r）串联的阻抗，电流落后电压多少。',
      'The impedance of a resistor and an inductor (with winding resistance r) in series, and how far the current lags.',
    ),
    vars: [
      { sym: 'R', name: tr('电阻', 'resistance'), unit: 'Ω', def: 100 },
      { sym: 'r', name: tr('线圈电阻', 'winding resistance'), unit: 'Ω', def: 1, min: 0 },
      { sym: 'L', name: tr('电感', 'inductance'), unit: 'H', def: 0.01 },
      { sym: 'f', name: tr('频率', 'frequency'), unit: 'Hz', def: 1600 },
    ],
    out: { sym: '|Z|', name: tr('阻抗的模', 'impedance magnitude'), unit: 'Ω' },
    compute: (v) => Math.hypot(v.R + v.r, TAU * v.f * v.L),
    why: tr(
      `1. $Z = (R + r) + jωL$：实部是所有电阻，虚部是感抗。
2. 模 $|Z| = \\sqrt{(R + r)^{2} + (ωL)^{2}}$，角 $φ = arctan\\frac{ωL}{R + r}$：电压超前电流，电流 **落后**。
3. 电阻电压和电流同相，所以示波器上 $u_R$ 就是电流的波形：$\\frac{U_R}{U_{in}} = \\frac{R}{|Z|}$。
4. 取 $u_R$ 当输出，这是一个 **RL 低通**：$ωL = R + r$ 时 |Z| 是 $\\sqrt{2}(R + r)$，相位 45°，截止频率 $f_c = \\frac{R + r}{2πL}$。`,
      `1. $Z = (R + r) + jωL$: the real part is all the resistance, the imaginary part the reactance.
2. Magnitude $|Z| = \\sqrt{(R + r)^{2} + (ωL)^{2}}$, angle $φ = arctan\\frac{ωL}{R + r}$: the voltage leads, the current **lags**.
3. The resistor voltage is in phase with the current, so $u_R$ on the scope is the current’s waveform: $\\frac{U_R}{U_{in}} = \\frac{R}{|Z|}$.
4. With $u_R$ as the output this is an **RL low-pass**: when $ωL = R + r$, |Z| is $\\sqrt{2}(R + r)$, the phase 45° and the cut-off $f_c = \\frac{R + r}{2πL}$.`,
    ),
    example: tr(
      '实验 4-3：1.6 kHz：$|Z| = \\sqrt{101^{2} + 100.5^{2}} ≈ 142.5 Ω$，电流落后约 45°，$\\frac{U_R}{U_{in}} = \\frac{100}{142.5} ≈ 0.70$；$f_c = \\frac{101}{2π × 0.01} ≈ 1.6 kHz$。',
      'Lab 4-3 at 1.6 kHz: $|Z| = \\sqrt{101^{2} + 100.5^{2}} ≈ 142.5 Ω$, the current lags by about 45°, $\\frac{U_R}{U_{in}} = \\frac{100}{142.5} ≈ 0.70$; $f_c = \\frac{101}{2π × 0.01} ≈ 1.6 kHz$.',
    ),
    pitfalls: [
      tr(
        '算电流用的是 |Z|，但算“发生器内部电动势”时还要加上 50 Ω：$|151 + j100.5|$。',
        'The current uses |Z|, but working from the generator’s internal EMF you must add its 50 Ω too: $|151 + j100.5|$.',
      ),
    ],
    Figure: () => <TwoPart series="L" shunt="R" out="u_R" />,
    teardowns: ['inductor'],
    lessons: ['exp4-rl-phasors'],
    chapter: 'ac-analysis',
  },
  {
    id: 'ac-kvl',
    group: 'ac',
    title: tr('交流 KVL：相量相加', 'AC KVL: phasors add'),
    tex: 'U = \\sqrt{U_R^{2} + U_X^{2}}',
    use: tr(
      '电阻电压和电感（或电容）电压差 90°：总电压是两者的“勾股和”，不是直接相加。',
      'A resistor’s and an inductor’s (or capacitor’s) voltage are 90° apart: the total is their "Pythagorean sum", not their plain sum.',
    ),
    vars: [
      { sym: 'U_R', name: tr('电阻电压（Vpp 或有效值）', 'resistor voltage (Vpp or RMS)'), unit: 'V', def: 1.1 },
      { sym: 'U_X', name: tr('电感 / 电容电压（同一种量）', 'inductor / capacitor voltage (same kind)'), unit: 'V', def: 1.11 },
    ],
    out: { sym: 'U', name: tr('总电压', 'total voltage'), unit: 'V' },
    compute: (v) => Math.hypot(v.U_R, v.U_X),
    why: tr(
      `1. 任何时刻 KVL 都成立：$u = u_R + u_L$（瞬时值相加）。
2. 但 $u_R$ 和 $u_L$ 的峰值不在同一时刻到达：电感电压比电阻电压超前 90°。
3. 用相量表示：$U̇ = U̇_R + U̇_L$，两个相量互相垂直，构成直角三角形（电压三角形）。
4. 所以幅度（或有效值、峰峰值）满足 $U = \\sqrt{U_R^{2} + U_L^{2}}$，夹角 $arctan\\frac{U_L}{U_R}$。`,
      `1. KVL holds at every instant: $u = u_R + u_L$ (instantaneous values add).
2. But $u_R$ and $u_L$ don’t peak at the same moment: the inductor voltage leads the resistor voltage by 90°.
3. As phasors $U̇ = U̇_R + U̇_L$, two perpendicular arrows forming a right triangle (the voltage triangle).
4. So the amplitudes (or RMS, or peak-to-peak) obey $U = \\sqrt{U_R^{2} + U_L^{2}}$, at an angle $arctan\\frac{U_L}{U_R}$.`,
    ),
    example: tr(
      '实验 4-3：$u_R ≈ 1.10 Vpp$，$u_L ≈ 1.11 Vpp$：直接加是 2.21，但 $\\sqrt{1.10^{2} + 1.11^{2}} ≈ 1.56 Vpp$ ≈ VIN 的 1.57 Vpp。实验 4-4 谐振时：$U_L$ 和 $U_C$ 大小相等、方向相反，互相抵消，KVL 仍成立。',
      'Lab 4-3: $u_R ≈ 1.10 Vpp$, $u_L ≈ 1.11 Vpp$: the plain sum is 2.21, but $\\sqrt{1.10^{2} + 1.11^{2}} ≈ 1.56 Vpp$ ≈ VIN’s 1.57 Vpp. Lab 4-4 at resonance: $U_L$ and $U_C$ are equal and opposite, cancel, and KVL still holds.',
    ),
    pitfalls: [
      tr(
        '真实线圈有电阻 r，$u_L$ 和 $u_R$ 的夹角略小于 90°，勾股和只是近似。',
        'A real coil has a resistance r, so $u_L$ leads $u_R$ by a little less than 90° and the Pythagorean sum is approximate.',
      ),
    ],
    Figure: () => (
      <g>
        <path d="M40 120 H180" className="cf-w" />
        <path d="M172 116 L180 120 L172 124" className="cf-w" fill="none" />
        <path d="M180 120 V30" className="cf-w accent" />
        <path d="M176 38 L180 30 L184 38" className="cf-w accent" fill="none" />
        <path d="M40 120 L180 30" className="cf-w thick" />
        <path d="M168 33 L180 30 L174 41" className="cf-w" fill="none" />
        <path d="M170 120 V110 H180" className="cf-w thin" />
        <T x={110} y={138}>
          U_R
        </T>
        <T x={190} y={80} anchor="start" cls="accent">
          U_L
        </T>
        <T x={96} y={66} anchor="end">
          U
        </T>
        <path d="M75 120 a35 35 0 0 0 -6 -18" className="cf-w thin" fill="none" />
        <T x={84} y={112} anchor="start" cls="small">
          φ
        </T>
      </g>
    ),
    lessons: ['exp4-rl-phasors', 'exp4-series-resonance', 'lesson-scope-two-channels'],
    chapter: 'phasors',
  },
  {
    id: 'rc-cutoff',
    group: 'ac',
    title: tr('RC 截止频率 Cut-off frequency', 'RC cut-off frequency'),
    tex: 'f_c = \\frac{1}{2π R C}',
    use: tr(
      '一阶 RC 滤波器的“拐点”：低通从这里开始往下掉，高通从这里开始通过。',
      'The corner of a first-order RC filter: where a low-pass starts to fall off and a high-pass starts to pass.',
    ),
    vars: [
      { sym: 'R', name: tr('电阻', 'resistance'), unit: 'Ω', def: 1500 },
      { sym: 'C', name: tr('电容', 'capacitance'), unit: 'F', def: 1e-7 },
    ],
    out: { sym: 'f_c', name: tr('截止频率（−3 dB）', 'cut-off frequency (−3 dB)'), unit: 'Hz' },
    compute: (v) => 1 / (TAU * v.R * v.C),
    why: tr(
      `1. 低通（输出取电容电压）用分压公式：$H = \\frac{1/(jωC)}{R + 1/(jωC)} = \\frac{1}{1 + jωRC}$。
2. 当 $ωRC = 1$，即 $X_C = R$ 时，$H = \\frac{1}{1 + j}$：$|H| = \\frac{1}{\\sqrt{2}} ≈ 0.707$（−3 dB），相位 −45°。
3. 这一点就是截止频率：$f_c = \\frac{1}{2πRC} = \\frac{1}{2πτ}$。
4. 伯德图两条渐近线：$f ≪ f_c$ 时 0 dB 的平线；$f ≫ f_c$ 时每十倍频下降 20 dB，两条线交在 $f_c$。
5. 高通（输出取电阻电压）的 $f_c$ 一样，只是方向反过来。`,
      `1. Low-pass (output across the capacitor), by the divider rule: $H = \\frac{1/(jωC)}{R + 1/(jωC)} = \\frac{1}{1 + jωRC}$.
2. When $ωRC = 1$, i.e. $X_C = R$, $H = \\frac{1}{1 + j}$: $|H| = \\frac{1}{\\sqrt{2}} ≈ 0.707$ (−3 dB) at −45°.
3. That point is the cut-off: $f_c = \\frac{1}{2πRC} = \\frac{1}{2πτ}$.
4. The Bode plot’s two asymptotes: a flat 0 dB line for $f ≪ f_c$, and −20 dB per decade for $f ≫ f_c$; they meet at $f_c$.
5. A high-pass (output across the resistor) has the same $f_c$, the other way round.`,
    ),
    example: tr(
      '实验 4-1：$\\frac{1}{2π × 1.5k × 100n} ≈ 1061 Hz$。实验 4-2：$15k × 10n$ 一样是 1061 Hz。实验 4-6：$R_F C_F = 10k × 15n$ → 1061 Hz。实验 5-14：$10k × 1µ$ → 16 Hz，远低于 1 kHz 的 PWM。',
      'Lab 4-1: $\\frac{1}{2π × 1.5k × 100n} ≈ 1061 Hz$. Lab 4-2: $15k × 10n$, also 1061 Hz. Lab 4-6: $R_F C_F = 10k × 15n$ → 1061 Hz. Lab 5-14: $10k × 1µ$ → 16 Hz, far below the 1 kHz PWM.',
    ),
    pitfalls: [
      tr(
        '信号源内阻（50 Ω）和后级负载都会挪动 $f_c$：前者加到 R 上，后者并在输出上。',
        'The source resistance (50 Ω) and the next stage’s load both move $f_c$: the first adds to R, the second sits across the output.',
      ),
      tr(
        '电容常有 ±10 %–20 % 误差，$f_c$ 跟着偏同样的比例：实测找 0.707、−45° 的点。',
        'Capacitors are often ±10–20 %, and $f_c$ moves by the same fraction: on a real board find the 0.707, −45° point.',
      ),
    ],
    Figure: () => (
      <g>
        <path d="M25 128 H245 M25 128 V15" className="cf-w thin" />
        <path d="M25 40 H120 L230 125" className="cf-w thin" strokeDasharray="4 3" />
        <path d="M25 40 C80 40 100 44 120 54 S200 112 230 124" className="cf-w accent" fill="none" />
        <path d="M120 128 V40" className="cf-w thin" strokeDasharray="2 3" />
        <T x={120} y={142}>
          f_c
        </T>
        <T x={128} y={66} anchor="start" cls="small accent">
          −3 dB
        </T>
        <T x={200} y={92} anchor="start" cls="small">
          −20 dB/dec
        </T>
        <T x={30} y={30} anchor="start" cls="small">
          |H| dB
        </T>
        <T x={245} y={142} anchor="end" cls="small">
          lg f
        </T>
      </g>
    ),
    lessons: ['exp4-rc-lowpass-bode', 'exp4-rc-highpass-coupling', 'exp4-active-lowpass', 'exp4-rc-bandpass-loading', 'exp4-buffered-bandpass', 'exp5-pwm-rc-dac'],
    chapter: 'frequency',
  },
  {
    id: 'rc-lowpass',
    group: 'ac',
    title: tr('RC 低通的增益 |H|', 'RC low-pass gain |H|'),
    tex: '|H| = \\frac{1}{\\sqrt{1 + (f/f_c)^{2}}}, f_c = \\frac{1}{2πRC}',
    use: tr('RC 低通在某个频率下输出是输入的几倍。', 'What fraction of the input an RC low-pass passes at a given frequency.'),
    vars: [
      { sym: 'R', name: tr('串联电阻', 'series resistor'), unit: 'Ω', def: 1500 },
      { sym: 'C', name: tr('对地电容', 'capacitor to ground'), unit: 'F', def: 1e-7 },
      { sym: 'f', name: tr('信号频率', 'signal frequency'), unit: 'Hz', def: 10610 },
    ],
    out: { sym: '|H|', name: tr('幅度比 Uₒᵤₜ / U_in', 'amplitude ratio Uₒᵤₜ / U_in'), unit: '' },
    compute: (v) => 1 / Math.sqrt(1 + (TAU * v.f * v.R * v.C) ** 2),
    why: tr(
      `1. $H = \\frac{1}{1 + jωRC} = \\frac{1}{1 + j f/f_c}$。
2. 模：$|H| = \\frac{1}{\\sqrt{1 + (f/f_c)^{2}}}$；相位 $∠H = -arctan\\frac{f}{f_c}$（输出落后）。
3. 三个好记的点：$f_c/10$ → 0.995（−0.04 dB，−5.7°）；$f_c$ → 0.707（−3 dB，−45°）；$10f_c$ → 0.0995（−20 dB，−84.3°）。
4. 高频时 $|H| ≈ \\frac{f_c}{f}$：频率每乘 10，幅度除以 10。`,
      `1. $H = \\frac{1}{1 + jωRC} = \\frac{1}{1 + j f/f_c}$.
2. Magnitude $|H| = \\frac{1}{\\sqrt{1 + (f/f_c)^{2}}}$; phase $∠H = -arctan\\frac{f}{f_c}$ (the output lags).
3. Three easy points: $f_c/10$ → 0.995 (−0.04 dB, −5.7°); $f_c$ → 0.707 (−3 dB, −45°); $10f_c$ → 0.0995 (−20 dB, −84.3°).
4. At high frequency $|H| ≈ \\frac{f_c}{f}$: ten times the frequency, a tenth of the amplitude.`,
    ),
    example: tr(
      '实验 4-1：10.6 kHz：$\\frac{1}{\\sqrt{1 + 10^{2}}} ≈ 0.0995$；1061 Hz：0.707，VOUT ≈ 1.4 Vpp。第 13 课（1 kΩ、100 nF、1 kHz）：$f_c ≈ 1592 Hz$，$|H| ≈ 0.847$。实验 4-8：跟随器后的第一级在 f₀ 处 0.707∠−45°。',
      'Lab 4-1: 10.6 kHz: $\\frac{1}{\\sqrt{1 + 10^{2}}} ≈ 0.0995$; 1061 Hz: 0.707, VOUT ≈ 1.4 Vpp. Lesson 13 (1 kΩ, 100 nF, 1 kHz): $f_c ≈ 1592 Hz$, $|H| ≈ 0.847$. Lab 4-8: the first stage before the follower is 0.707∠−45° at f₀.',
    ),
    pitfalls: [
      tr(
        '拿输出和发生器的“设定值”比，而不是和端口电压（CH1）比：50 Ω 的压降随频率变。',
        'Dividing by the generator’s setting instead of the terminal voltage (CH1): the drop across its 50 Ω changes with frequency.',
      ),
    ],
    Figure: () => <TwoPart series="R" shunt="C" />,
    lessons: ['exp4-rc-lowpass-bode', 'lesson-scope-two-channels', 'exp4-buffered-bandpass'],
    chapter: 'frequency',
  },
  {
    id: 'rc-highpass',
    group: 'ac',
    title: tr('RC 高通的增益 |H|（隔直通交）', 'RC high-pass gain |H| (blocks DC)'),
    tex: '|H| = \\frac{f/f_c}{\\sqrt{1 + (f/f_c)^{2}}}, f_c = \\frac{1}{2πRC}',
    use: tr('电容串在前、电阻对地：低频（包括直流）被挡住，高频通过。', 'Capacitor in series, resistor to ground: low frequencies (DC included) are blocked, high ones pass.'),
    vars: [
      { sym: 'R', name: tr('对地电阻', 'resistor to ground'), unit: 'Ω', def: 15000 },
      { sym: 'C', name: tr('串联电容', 'series capacitor'), unit: 'F', def: 1e-8 },
      { sym: 'f', name: tr('信号频率', 'signal frequency'), unit: 'Hz', def: 106 },
    ],
    out: { sym: '|H|', name: tr('幅度比 Uₒᵤₜ / U_in', 'amplitude ratio Uₒᵤₜ / U_in'), unit: '' },
    compute: (v) => {
      const x = TAU * v.f * v.R * v.C;
      return x / Math.sqrt(1 + x * x);
    },
    why: tr(
      `1. 输出取电阻电压：$H = \\frac{R}{R + 1/(jωC)} = \\frac{jωRC}{1 + jωRC}$。
2. 模 $|H| = \\frac{f/f_c}{\\sqrt{1 + (f/f_c)^{2}}}$，相位 $∠H = 90° - arctan\\frac{f}{f_c}$（输出 **超前**）。
3. 直流：f = 0，|H| = 0。稳态时电容“存住”了直流偏置，电阻上没有直流电流——这就是级间的 **耦合（隔直）电容**。
4. 同一个 RC 的低通和高通：$H_{LP} + H_{HP} = 1$，在 $f_c$ 两个都是 0.707，相量和正好是输入。`,
      `1. Output across the resistor: $H = \\frac{R}{R + 1/(jωC)} = \\frac{jωRC}{1 + jωRC}$.
2. Magnitude $|H| = \\frac{f/f_c}{\\sqrt{1 + (f/f_c)^{2}}}$, phase $∠H = 90° - arctan\\frac{f}{f_c}$ (the output **leads**).
3. DC: f = 0, |H| = 0. In steady state the capacitor "stores" the DC offset and the resistor carries no DC — a **coupling (DC-blocking) capacitor** between stages.
4. For the same R and C, $H_{LP} + H_{HP} = 1$: both are 0.707 at $f_c$ and their phasors add up to the input.`,
    ),
    example: tr(
      '实验 4-2（15 kΩ、10 nF，$f_c$ ≈ 1061 Hz）：106 Hz → 0.0995、+84.3°；1061 Hz → 0.707、+45°；10.6 kHz → 0.995、+5.7°。2 V 偏置全落在电容上，VOUT 平均为 0。',
      'Lab 4-2 (15 kΩ, 10 nF, $f_c$ ≈ 1061 Hz): 106 Hz → 0.0995 at +84.3°; 1061 Hz → 0.707 at +45°; 10.6 kHz → 0.995 at +5.7°. The 2 V offset sits entirely on the capacitor; VOUT averages 0.',
    ),
    pitfalls: [
      tr(
        'µF 级的耦合电容多是电解电容，有极性：+ 接直流电位高的一边。',
        'µF coupling capacitors are mostly electrolytics with polarity: + goes to the side at the higher DC potential.',
      ),
    ],
    Figure: () => <TwoPart series="C" shunt="R" />,
    lessons: ['exp4-rc-highpass-coupling', 'exp4-buffered-bandpass'],
    chapter: 'frequency',
  },
  {
    id: 'first-order-phase',
    group: 'ac',
    title: tr('一阶滤波器的相位', 'Phase of a first-order filter'),
    tex: 'φ_{LP} = -arctan\\frac{f}{f_c}, φ_{HP} = 90° - arctan\\frac{f}{f_c}',
    use: tr('RC / RL 一阶电路的输出比输入超前或落后几度。', 'How many degrees the output of a first-order RC / RL circuit leads or lags the input.'),
    vars: [
      { sym: 'f', name: tr('信号频率', 'signal frequency'), unit: 'Hz', def: 1061 },
      { sym: 'f_c', name: tr('截止频率', 'cut-off frequency'), unit: 'Hz', def: 1061 },
      { sym: 'k', name: tr('类型：0 = 低通（电容电压），1 = 高通（电阻电压）', 'type: 0 = low-pass (capacitor voltage), 1 = high-pass (resistor voltage)'), unit: '', def: 0 },
    ],
    out: { sym: 'φ', name: tr('输出相对输入的相位（度）', 'output phase vs input (degrees)'), unit: '' },
    compute: (v) => -deg(Math.atan(v.f / v.f_c)) + (v.k >= 0.5 ? 90 : 0),
    why: tr(
      `1. 低通 $H = \\frac{1}{1 + jf/f_c}$：分母的角是 $arctan\\frac{f}{f_c}$，所以 H 的角是它的负数。
2. 高通多一个分子 $jf/f_c$，多 +90°。
3. 低频：低通 0°、高通 +90°；在 $f_c$：−45° / +45°；高频：−90° / 0°。
4. RL 电路一样：电阻电压（电流）相对输入就是“低通”的相位，$f_c = \\frac{R}{2πL}$。
5. 方波驱动的 RC“积分器”对基波落后 $arctan(ωτ)$，接近 −90°；“微分器”超前 $arctan\\frac{1}{ωτ}$，接近 +90°。`,
      `1. Low-pass $H = \\frac{1}{1 + jf/f_c}$: the denominator’s angle is $arctan\\frac{f}{f_c}$, so H’s angle is its negative.
2. A high-pass has an extra $jf/f_c$ on top: +90° more.
3. Low frequency: 0° / +90°; at $f_c$: −45° / +45°; high frequency: −90° / 0°.
4. RL is the same: the resistor voltage (the current) relative to the input has the low-pass phase, with $f_c = \\frac{R}{2πL}$.
5. A square-driven RC "integrator" lags its fundamental by $arctan(ωτ)$, close to −90°; a "differentiator" leads by $arctan\\frac{1}{ωτ}$, close to +90°.`,
    ),
    example: tr(
      '实验 4-1：106 Hz −5.7°、1061 Hz −45°、10.6 kHz −84.3°。实验 3-2：τ = 10 ms、500 Hz：$-arctan(2π × 500 × 0.01) ≈ -88°$。实验 4-6 的有源低通：反相再加 180°，1061 Hz 处 +135°。',
      'Lab 4-1: 106 Hz −5.7°, 1061 Hz −45°, 10.6 kHz −84.3°. Lab 3-2: τ = 10 ms at 500 Hz: $-arctan(2π × 500 × 0.01) ≈ -88°$. Lab 4-6’s active low-pass: inversion adds 180°, giving +135° at 1061 Hz.',
    ),
    pitfalls: [tr('计算器要用“度”模式，或者把弧度 × 180/π。', 'Set the calculator to degrees, or multiply radians by 180/π.')],
    lessons: ['exp4-rc-lowpass-bode', 'exp4-rc-highpass-coupling', 'lesson-scope-two-channels', 'exp3-rc-differentiator-integrator', 'exp4-rl-phasors', 'exp4-active-lowpass'],
    chapter: 'frequency',
  },
  {
    id: 'decibel',
    group: 'ac',
    title: tr('分贝 dB', 'Decibels'),
    tex: 'G_{dB} = 20 lg\\frac{U_{out}}{U_{in}}',
    use: tr('把电压比换成 dB：伯德图的纵轴，乘法变加法。', 'Turn a voltage ratio into dB: the Bode plot’s vertical axis, where multiplying becomes adding.'),
    vars: [{ sym: 'k', name: tr('电压比 Uₒᵤₜ / U_in', 'voltage ratio Uₒᵤₜ / U_in'), unit: '', def: 0.707 }],
    out: { sym: 'G', name: tr('增益（dB）', 'gain (dB)'), unit: '' },
    compute: (v) => 20 * Math.log10(v.k),
    why: tr(
      `1. 功率比的分贝是 $10 lg\\frac{P_2}{P_1}$；功率正比于电压平方，所以电压比用 $20 lg$。
2. 好记的值：×2 = +6 dB，×0.707 = −3 dB（功率减半），×0.5 = −6 dB，×0.1 = −20 dB，×0.01 = −40 dB。
3. 两级串联（不互相负载时）：增益相乘 = dB 相加。
4. 反过来：$\\frac{U_{out}}{U_{in}} = 10^{G/20}$。`,
      `1. A power ratio in decibels is $10 lg\\frac{P_2}{P_1}$; power goes with voltage squared, so voltage ratios use $20 lg$.
2. Values worth remembering: ×2 = +6 dB, ×0.707 = −3 dB (half power), ×0.5 = −6 dB, ×0.1 = −20 dB, ×0.01 = −40 dB.
3. Two stages in a row (not loading each other): gains multiply = dB add.
4. The other way: $\\frac{U_{out}}{U_{in}} = 10^{G/20}$.`,
    ),
    example: tr(
      '实验 4-1：0.995 → −0.04 dB，0.707 → −3 dB，0.0995 → −20 dB：在 lg f – dB 坐标上正好是两条渐近线。实验 4-6 通带增益 2.13 → +6.6 dB。',
      'Lab 4-1: 0.995 → −0.04 dB, 0.707 → −3 dB, 0.0995 → −20 dB: on lg f – dB axes they trace the two asymptotes. Lab 4-6’s passband gain 2.13 → +6.6 dB.',
    ),
    pitfalls: [tr('电压比用 20 lg，功率比用 10 lg，别混。', 'Voltage ratios take 20 lg, power ratios 10 lg — don’t mix them.')],
    lessons: ['exp4-rc-lowpass-bode', 'exp4-rc-highpass-coupling', 'exp4-active-lowpass'],
    chapter: 'frequency',
  },
  {
    id: 'active-lowpass',
    group: 'ac',
    title: tr('有源一阶低通（反相）', 'Active first-order low-pass (inverting)'),
    tex: 'H = -\\frac{R_F}{R_{in}} \\frac{1}{1 + jωR_FC_F}',
    use: tr(
      '反相放大器的反馈电阻上并一个电容：通带增益 R_F / Rᵢₙ，截止频率由 R_F·C_F 决定。',
      'An inverting amplifier with a capacitor across its feedback resistor: passband gain R_F / Rᵢₙ, cut-off set by R_F·C_F.',
    ),
    vars: [
      { sym: 'R_F', name: tr('反馈电阻', 'feedback resistor'), unit: 'Ω', def: 10000 },
      { sym: 'R_in', name: tr('输入电阻', 'input resistor'), unit: 'Ω', def: 4700 },
      { sym: 'C_F', name: tr('反馈电容', 'feedback capacitor'), unit: 'F', def: 1.5e-8 },
      { sym: 'f', name: tr('信号频率', 'signal frequency'), unit: 'Hz', def: 1061 },
    ],
    out: { sym: '|H|', name: tr('增益的大小', 'gain magnitude'), unit: '' },
    compute: (v) => v.R_F / v.R_in / Math.sqrt(1 + (TAU * v.f * v.R_F * v.C_F) ** 2),
    why: tr(
      `1. 虚短：IN− 跟着 IN+（单电源时是 4.5 V 参考），对交流来说 IN− 是“地”。
2. 反馈支路的阻抗 $Z_F = R_F ∥ \\frac{1}{jωC_F} = \\frac{R_F}{1 + jωR_FC_F}$。
3. 反相放大器公式里把 $R_F$ 换成 $Z_F$：$H = -\\frac{Z_F}{R_{in}}$。
4. 通带（低频，电容开路）：$|H| = \\frac{R_F}{R_{in}}$；截止 $f_c = \\frac{1}{2πR_FC_F}$；相位 = 180° − arctan(f/$f_c$)。
5. 和无源 RC 比：增益可以大于 1；输出由 op-amp 驱动，带负载不变；$f_c$ 和信号源内阻无关。`,
      `1. Virtual short: IN− follows IN+ (a 4.5 V reference on a single supply), so for AC, IN− is "ground".
2. The feedback impedance is $Z_F = R_F ∥ \\frac{1}{jωC_F} = \\frac{R_F}{1 + jωR_FC_F}$.
3. Put $Z_F$ in place of $R_F$ in the inverting formula: $H = -\\frac{Z_F}{R_{in}}$.
4. Passband (low frequency, capacitor open): $|H| = \\frac{R_F}{R_{in}}$; cut-off $f_c = \\frac{1}{2πR_FC_F}$; phase = 180° − arctan(f/$f_c$).
5. Compared with a passive RC: the gain may exceed 1; the op-amp drives the output, so a load changes nothing; $f_c$ doesn’t depend on the source resistance.`,
    ),
    example: tr(
      '实验 4-6：通带 $\\frac{10}{4.7} ≈ 2.13$；$f_c = \\frac{1}{2π × 10k × 15n} ≈ 1061 Hz$。106 Hz → 2.12；1061 Hz → 1.50（+135°）；10.6 kHz → 0.21（+96°）。单电源中心 4.5 V、上限 7.5 V：通带输入幅度最多约 $\\frac{3}{2.13} ≈ 1.4 V$。',
      'Lab 4-6: passband $\\frac{10}{4.7} ≈ 2.13$; $f_c = \\frac{1}{2π × 10k × 15n} ≈ 1061 Hz$. 106 Hz → 2.12; 1061 Hz → 1.50 (+135°); 10.6 kHz → 0.21 (+96°). Centred on 4.5 V with a 7.5 V ceiling, the passband input can be at most about $\\frac{3}{2.13} ≈ 1.4 V$ in amplitude.',
    ),
    pitfalls: [tr('$f_c$ 用的是 $R_F$·$C_F$，不是 $R_in$·$C_F$。', '$f_c$ uses $R_F$·$C_F$, not $R_in$·$C_F$.')],
    Figure: () => (
      <g>
        <OpAmp x={120} y={90} />
        <R x1={25} y1={70} x2={100} y2={70} label="R_in" />
        <Path d="100,70 120,70" />
        <Path d="120,110 105,110 105,132" />
        <Gnd x={105} y={132} />
        <Path d="190,90 240,90" />
        <Path d="110,70 110,22 135,22" />
        <R x1={135} y1={22} x2={195} y2={22} label="R_F" />
        <Path d="195,22 220,22 220,90" />
        <Path d="125,22 125,50 145,50" />
        <C x1={145} y1={50} x2={190} y2={50} label="" />
        <Path d="190,50 205,50 205,22" />
        <T x={212} y={66} anchor="start" cls="small">
          C_F
        </T>
        <Dot x={110} y={70} />
        <Dot x={220} y={90} />
      </g>
    ),
    teardowns: ['lm358'],
    lessons: ['exp4-active-lowpass'],
    chapter: 'frequency',
  },
  {
    id: 'two-stage-loading',
    group: 'ac',
    title: tr('两级 RC 带通：级间负载', 'Two RC stages: loading between them'),
    tex: '|H| = \\frac{x}{\\sqrt{(1 - x^{2})^{2} + k^{2}x^{2}}}, x = ωRC',
    use: tr(
      '高通 + 低通串起来：直接相连（k = 3）和中间加跟随器（k = 2）的增益差多少。',
      'A high-pass and a low-pass in a row: the gain when wired straight together (k = 3) versus with a follower between them (k = 2).',
    ),
    vars: [
      { sym: 'R', name: tr('两级相同的 R', 'R of both stages'), unit: 'Ω', def: 10000 },
      { sym: 'C', name: tr('两级相同的 C', 'C of both stages'), unit: 'F', def: 1.5e-8 },
      { sym: 'f', name: tr('信号频率', 'signal frequency'), unit: 'Hz', def: 1061 },
      { sym: 'k', name: tr('3 = 直接相连，2 = 中间有跟随器', '3 = wired straight, 2 = buffered'), unit: '', def: 3 },
    ],
    out: { sym: '|H|', name: tr('总增益', 'overall gain'), unit: '' },
    compute: (v) => {
      const x = TAU * v.f * v.R * v.C;
      return x / Math.sqrt((1 - x * x) ** 2 + v.k * v.k * x * x);
    },
    why: tr(
      `1. **天真估算**：两级各自的 H 相乘，在 $f_0$ 处 $0.707 × 0.707 = 0.5$。
2. 实际直接相连时，第二级（R₂ + C₂）并在第一级的 R₁ 上，第一级不再是原来的高通：这就是 **负载效应**。
3. 对 A、B 两个结点列 KCL（令 $x = ωRC$），解出 $H = \\frac{jx}{1 - x^{2} + 3jx}$。
4. 中间加电压跟随器：第一级不受影响，第二级看到理想电压源，正好相乘：$H = \\frac{jx}{(1 + jx)^{2}} = \\frac{jx}{1 - x^{2} + 2jx}$。
5. 分母里多出来的 jx 就是负载。规则：后级输入阻抗要比前级输出阻抗 **大得多**（10 倍以上），才能直接相乘。`,
      `1. **Naive estimate**: multiply the two stages’ H; at $f_0$ that is $0.707 × 0.707 = 0.5$.
2. Wired straight together, stage 2 (R₂ + C₂) sits across stage 1’s R₁, so stage 1 is no longer the same high-pass: the **loading effect**.
3. KCL at nodes A and B (with $x = ωRC$) gives $H = \\frac{jx}{1 - x^{2} + 3jx}$.
4. With a voltage follower between them stage 1 is untouched and stage 2 sees an ideal source, so they multiply exactly: $H = \\frac{jx}{(1 + jx)^{2}} = \\frac{jx}{1 - x^{2} + 2jx}$.
5. The extra jx in the denominator is the loading. The rule: the next stage’s input impedance must be **much larger** (10× or more) than the previous stage’s output impedance before you may simply multiply.`,
    ),
    example: tr(
      '实验 4-7（k = 3）：1061 Hz → 1/3（不是 0.5），A 点只有 0.471；106 Hz 和 10.6 kHz → 0.097（±73°）。实验 4-8（k = 2）：1061 Hz → 0.5，106 Hz → 0.099（+78.6°）。',
      'Lab 4-7 (k = 3): 1061 Hz → 1/3 (not 0.5), node A only 0.471; 106 Hz and 10.6 kHz → 0.097 (±73°). Lab 4-8 (k = 2): 1061 Hz → 0.5, 106 Hz → 0.099 (+78.6°).',
    ),
    pitfalls: [
      tr(
        '示波器探头也是负载：几百 kΩ 的电路上，1 MΩ 的 ×1 探头会像第二级一样拖低读数。',
        'A scope probe is a load too: on a circuit of several hundred kΩ a 1 MΩ ×1 probe drags the reading down just like a second stage.',
      ),
    ],
    Figure: () => (
      <g>
        <Gen x={25} y1={45} y2={105} />
        <Path d="25,45 25,30 40,30" />
        <C x1={40} y1={30} x2={95} y2={30} label="C₁" />
        <Path d="95,30 110,30" />
        <R x1={110} y1={30} x2={110} y2={125} label="R₁" />
        <R x1={110} y1={30} x2={185} y2={30} label="R₂" />
        <Path d="185,30 200,30" />
        <C x1={200} y1={30} x2={200} y2={125} label="C₂" />
        <Path d="25,105 25,125 200,125" />
        <Dot x={110} y={30} />
        <Dot x={200} y={30} />
        <T x={110} y={18}>
          A
        </T>
        <T x={200} y={18}>
          B
        </T>
        <path d="M128 38 H175 V118 H128 Z" className="cf-w thin accent" strokeDasharray="3 3" fill="none" />
        <T x={152} y={140} cls="small accent">
          {tr('负载', 'load')}
        </T>
      </g>
    ),
    lessons: ['exp4-rc-bandpass-loading', 'exp4-buffered-bandpass'],
    chapter: 'frequency',
  },
  {
    id: 'lc-resonance',
    group: 'ac',
    title: tr('LC 谐振频率 f₀ = 1/(2π√LC)', 'LC resonant frequency f₀ = 1/(2π√LC)'),
    tex: 'f_0 = \\frac{1}{2π\\sqrt{LC}}',
    use: tr(
      '电感和电容的电抗正好相等（互相抵消）的频率——串联、并联 LC 和 RLC 振铃都用它。',
      'The frequency where the inductor’s and capacitor’s reactances are equal and cancel — for series and parallel LC and for RLC ringing.',
    ),
    vars: [
      { sym: 'L', name: tr('电感', 'inductance'), unit: 'H', def: 0.01 },
      { sym: 'C', name: tr('电容', 'capacitance'), unit: 'F', def: 1e-7 },
    ],
    out: { sym: 'f_0', name: tr('谐振频率', 'resonant frequency'), unit: 'Hz' },
    compute: (v) => 1 / (TAU * Math.sqrt(v.L * v.C)),
    why: tr(
      `1. 串联 RLC：$Z = R + j(ωL - \\frac{1}{ωC})$。
2. 两个电抗相等时虚部为 0：$ω_0L = \\frac{1}{ω_0C}$ ⇒ $ω_0 = \\frac{1}{\\sqrt{LC}}$，$f_0 = \\frac{1}{2π\\sqrt{LC}}$。
3. 串联谐振：|Z| 最小（= R），电流最大，电流和电压 **同相**；低于 f₀ 呈容性（电流超前），高于 f₀ 呈感性（电流落后）。
4. 并联 LC：导纳的虚部抵消，阻抗最大（见“并联谐振阻抗”）。
5. 谐振时每个电抗的大小 $X_0 = \\sqrt{\\frac{L}{C}}$（特性阻抗）。`,
      `1. Series RLC: $Z = R + j(ωL - \\frac{1}{ωC})$.
2. The imaginary part vanishes when the reactances are equal: $ω_0L = \\frac{1}{ω_0C}$ ⇒ $ω_0 = \\frac{1}{\\sqrt{LC}}$, $f_0 = \\frac{1}{2π\\sqrt{LC}}$.
3. Series resonance: |Z| is smallest (= R), the current largest and **in phase** with the voltage; below f₀ the circuit is capacitive (current leads), above it inductive (current lags).
4. Parallel LC: the admittance’s imaginary parts cancel and the impedance peaks (see "Parallel tank impedance").
5. At resonance each reactance is $X_0 = \\sqrt{\\frac{L}{C}}$ (the characteristic impedance).`,
    ),
    example: tr(
      '实验 3-4、4-4、4-5（10 mH、100 nF）：$f_0 = \\frac{1}{2π\\sqrt{10^{-9}}} ≈ 5033 Hz$，$X_0 = \\sqrt{\\frac{0.01}{10^{-7}}} ≈ 316 Ω$。2.5 kHz 电流超前约 78°，10 kHz 落后约 78°。',
      'Labs 3-4, 4-4, 4-5 (10 mH, 100 nF): $f_0 = \\frac{1}{2π\\sqrt{10^{-9}}} ≈ 5033 Hz$, $X_0 = \\sqrt{\\frac{0.01}{10^{-7}}} ≈ 316 Ω$. At 2.5 kHz the current leads by about 78°, at 10 kHz it lags by about 78°.',
    ),
    pitfalls: [tr('把 √ 漏掉，或者把 2π 漏掉——结果差几个数量级或 6.28 倍。', 'Dropping the √ or the 2π — off by orders of magnitude or by 6.28.')],
    Figure: () => (
      <g>
        <Gen x={30} y1={45} y2={105} />
        <Path d="30,45 30,30 45,30" />
        <L x1={45} y1={30} x2={115} y2={30} label="L" />
        <C x1={115} y1={30} x2={175} y2={30} label="C" />
        <Path d="175,30 210,30 210,45" />
        <R x1={210} y1={45} x2={210} y2={105} label="R" />
        <Path d="210,105 210,125 30,125 30,105" />
        <Arrow x={195} y={30} label="i" ly={22} />
      </g>
    ),
    lessons: ['exp4-series-resonance', 'exp4-parallel-lc-tank', 'exp3-rlc-ringing'],
    chapter: 'frequency',
  },
  {
    id: 'series-q',
    group: 'ac',
    title: tr('品质因数 Q 与谐振电压放大', 'Quality factor Q and voltage magnification'),
    tex: 'Q = \\frac{ω_0 L}{R} = \\frac{1}{R}\\sqrt{\\frac{L}{C}}, U_C = U_L = Q U',
    use: tr(
      '串联谐振时电容（电感）电压是电源电压的几倍；Q 也决定峰有多尖。',
      'At series resonance, how many times the source voltage the capacitor (inductor) sees; Q also sets how sharp the peak is.',
    ),
    vars: [
      { sym: 'L', name: tr('电感', 'inductance'), unit: 'H', def: 0.01 },
      { sym: 'C', name: tr('电容', 'capacitance'), unit: 'F', def: 1e-7 },
      { sym: 'R', name: tr('回路总电阻（不含发生器时用端口电压）', 'total loop resistance (excluding the generator if you use the terminal voltage)'), unit: 'Ω', def: 101 },
    ],
    out: { sym: 'Q', name: tr('品质因数（电压放大倍数）', 'quality factor (voltage magnification)'), unit: '' },
    compute: (v) => Math.sqrt(v.L / v.C) / v.R,
    why: tr(
      `1. 谐振时电抗抵消，电流 $I = \\frac{U}{R}$（R 是回路电阻）。
2. 电容电压 $U_C = IX_0 = U\\frac{X_0}{R}$，$X_0 = \\sqrt{\\frac{L}{C}}$；电感电压一样大、方向相反。
3. 定义 $Q = \\frac{X_0}{R}$：元件电压是电源的 Q 倍——**比电源还高**。
4. Q 也是“储存的能量 / 每个周期损耗的能量”的 2π 倍：Q 越大，峰越尖，带宽 $BW = \\frac{f_0}{Q}$ 越窄。
5. 并联槽路自己的 Q = $\\frac{X_0}{r}$（r 是线圈电阻）：谐振时 L、C 之间的环流是外部电流的约 Q 倍。`,
      `1. At resonance the reactances cancel and the current is $I = \\frac{U}{R}$ (R = loop resistance).
2. The capacitor voltage is $U_C = IX_0 = U\\frac{X_0}{R}$ with $X_0 = \\sqrt{\\frac{L}{C}}$; the inductor’s is the same size, opposite in sign.
3. Define $Q = \\frac{X_0}{R}$: each part sees Q times the source — **more than the source**.
4. Q is also 2π × (energy stored / energy lost per cycle): the larger Q, the sharper the peak and the narrower the bandwidth $BW = \\frac{f_0}{Q}$.
5. A parallel tank’s own Q = $\\frac{X_0}{r}$ (r = winding resistance): at resonance the current circulating between L and C is about Q times the outside current.`,
    ),
    example: tr(
      '实验 4-4：$Q = \\frac{316}{101} ≈ 3.1$，VIN 只有 1.34 Vpp 时电容上约 4.2 Vpp。实验 4-5：槽路自己的 $Q = \\frac{316}{1} ≈ 316$，测到的环流比 $I_L/I_{R1}$ ≈ 300。',
      'Lab 4-4: $Q = \\frac{316}{101} ≈ 3.1$, so with VIN only 1.34 Vpp the capacitor sees about 4.2 Vpp. Lab 4-5: the tank’s own $Q = \\frac{316}{1} ≈ 316$; the measured circulating ratio $I_L/I_{R1}$ ≈ 300.',
    ),
    pitfalls: [
      tr(
        '高 Q 串联谐振里元件电压可以是电源的几十倍：注意电容耐压。',
        'In a high-Q series circuit the parts can see dozens of times the source voltage: mind the capacitor’s rating.',
      ),
      tr('真实线圈 10–30 Ω 的电阻会把 Q 拉低很多。', 'A real coil’s 10–30 Ω pulls Q down a lot.'),
    ],
    lessons: ['exp4-series-resonance', 'exp4-parallel-lc-tank'],
    chapter: 'frequency',
  },
  {
    id: 'resonance-bandwidth',
    group: 'ac',
    title: tr('谐振带宽 BW = f₀/Q', 'Resonance bandwidth BW = f₀/Q'),
    tex: 'BW = f_2 - f_1 = \\frac{f_0}{Q}',
    use: tr('谐振峰的两个半功率点（0.707）之间有多宽。', 'How wide the resonance peak is between its two half-power (0.707) points.'),
    vars: [
      { sym: 'f_0', name: tr('谐振频率', 'resonant frequency'), unit: 'Hz', def: 5033 },
      { sym: 'Q', name: tr('品质因数', 'quality factor'), unit: '', def: 3.13 },
    ],
    out: { sym: 'BW', name: tr('−3 dB 带宽', '−3 dB bandwidth'), unit: 'Hz' },
    compute: (v) => v.f_0 / v.Q,
    why: tr(
      `1. 串联 RLC：在半功率点，电抗的大小等于电阻：$|ωL - \\frac{1}{ωC}| = R$，这时 $|Z| = \\sqrt{2}R$，电流降到 0.707。
2. 解这个方程的两个正根 $ω_1$、$ω_2$，相减得 $ω_2 - ω_1 = \\frac{R}{L}$，即 $BW = \\frac{R}{2πL}$。
3. 用 $Q = \\frac{ω_0L}{R}$ 改写：$BW = \\frac{f_0}{Q}$。
4. 并联槽路同理，Q 用整个电路的：$Q = \\frac{R_{总}}{X_0}$（R 是并在槽路上的所有电阻）。`,
      `1. Series RLC: at the half-power points the net reactance equals the resistance, $|ωL - \\frac{1}{ωC}| = R$, so $|Z| = \\sqrt{2}R$ and the current is down to 0.707.
2. The two positive roots $ω_1$, $ω_2$ differ by $ω_2 - ω_1 = \\frac{R}{L}$, i.e. $BW = \\frac{R}{2πL}$.
3. With $Q = \\frac{ω_0L}{R}$: $BW = \\frac{f_0}{Q}$.
4. A parallel tank works the same with the whole circuit’s Q: $Q = \\frac{R_{total}}{X_0}$ (R = everything in parallel with the tank).`,
    ),
    example: tr(
      '实验 4-4：$\\frac{5033}{3.13} ≈ 1.6 kHz$（半功率点约 4.3 kHz 和 5.9 kHz）。实验 4-5：整个电路 $Q ≈ \\frac{10k ∥ 100k}{316} ≈ 29$，$BW ≈ 175 Hz$——只有 4.95–5.12 kHz 能通过。',
      'Lab 4-4: $\\frac{5033}{3.13} ≈ 1.6 kHz$ (half-power points near 4.3 kHz and 5.9 kHz). Lab 4-5: the whole circuit’s $Q ≈ \\frac{10k ∥ 100k}{316} ≈ 29$, $BW ≈ 175 Hz$ — only 4.95–5.12 kHz gets through.',
    ),
    pitfalls: [tr('f₁、f₂ 关于 f₀ 是几何对称（$f_1f_2 = f_0^{2}$），不是算术对称。', 'f₁ and f₂ are geometrically symmetric about f₀ ($f_1f_2 = f_0^{2}$), not arithmetically.')],
    lessons: ['exp4-series-resonance', 'exp4-parallel-lc-tank'],
    chapter: 'frequency',
  },
  {
    id: 'tank-impedance',
    group: 'ac',
    title: tr('并联谐振（槽路）阻抗 Z₀ ≈ L/(rC)', 'Parallel tank impedance Z₀ ≈ L/(rC)'),
    tex: 'Z_0 ≈ \\frac{L}{rC} = Q^{2} r',
    use: tr(
      'L 和 C 并联、线圈有电阻 r：谐振时整个槽路像一个多大的电阻。',
      'L in parallel with C, the coil having resistance r: how large a resistor the tank looks like at resonance.',
    ),
    vars: [
      { sym: 'L', name: tr('电感', 'inductance'), unit: 'H', def: 0.01 },
      { sym: 'C', name: tr('电容', 'capacitance'), unit: 'F', def: 1e-7 },
      { sym: 'r', name: tr('线圈电阻', 'winding resistance'), unit: 'Ω', def: 1 },
    ],
    out: { sym: 'Z_0', name: tr('谐振阻抗', 'impedance at resonance'), unit: 'Ω' },
    compute: (v) => v.L / (v.r * v.C),
    why: tr(
      `1. 并联用导纳相加：$Y = \\frac{1}{r + jωL} + jωC$。
2. 在 $f_0$ 附近，电感支路的电纳和电容的 $ωC$ 抵消，只剩很小的实部 $\\frac{r}{(ω_0L)^{2}} = \\frac{rC}{L}$。
3. 所以 $Z_0 = \\frac{1}{Y} ≈ \\frac{L}{rC}$，也等于 $Q^{2}r$（Q = $\\frac{X_0}{r}$）。r 越小，峰越高越尖。
4. 偏离谐振时阻抗迅速变小：低于 f₀ 呈感性，高于 f₀ 呈容性。
5. 串一个 R 驱动它，就得到一个“只让一个频率通过”的分压器：$\\frac{U_T}{U_{in}} = \\frac{Z_0}{R + Z_0}$。`,
      `1. In parallel, admittances add: $Y = \\frac{1}{r + jωL} + jωC$.
2. Near $f_0$ the inductor branch’s susceptance cancels the capacitor’s $ωC$, leaving only a small real part $\\frac{r}{(ω_0L)^{2}} = \\frac{rC}{L}$.
3. So $Z_0 = \\frac{1}{Y} ≈ \\frac{L}{rC}$, which is also $Q^{2}r$ (Q = $\\frac{X_0}{r}$). The smaller r, the higher and sharper the peak.
4. Off resonance the impedance falls fast: inductive below f₀, capacitive above.
5. Feed it through a series R and you get a divider that "passes one frequency": $\\frac{U_T}{U_{in}} = \\frac{Z_0}{R + Z_0}$.`,
    ),
    example: tr(
      '实验 4-5：$\\frac{10 mH}{1 Ω × 100 nF} = 100 kΩ$；和 R₁ = 10 kΩ 分压：$\\frac{100}{110} ≈ 0.91$。2.5 kHz 时槽路只有约 j211 Ω，比值 ≈ 0.021。',
      'Lab 4-5: $\\frac{10 mH}{1 Ω × 100 nF} = 100 kΩ$; dividing with R₁ = 10 kΩ: $\\frac{100}{110} ≈ 0.91$. At 2.5 kHz the tank is only about j211 Ω, a ratio of ≈ 0.021.',
    ),
    pitfalls: [tr('真实 10 mH 电感 10–30 Ω：Z₀ 降到几 kΩ，峰又低又宽。', 'A real 10 mH inductor with 10–30 Ω brings Z₀ down to a few kΩ: a low, wide peak.')],
    Figure: () => (
      <g>
        <Gen x={30} y1={45} y2={105} />
        <Path d="30,45 30,30 45,30" />
        <R x1={45} y1={30} x2={115} y2={30} label="R₁" />
        <Path d="115,30 220,30" />
        <L x1={150} y1={30} x2={150} y2={125} label="L" />
        <C x1={220} y1={30} x2={220} y2={125} label="C" />
        <Path d="30,105 30,125 220,125" />
        <Dot x={150} y={30} />
        <Dot x={150} y={125} />
        <T x={150} y={18}>
          VT
        </T>
      </g>
    ),
    teardowns: ['inductor', 'capacitor'],
    lessons: ['exp4-parallel-lc-tank'],
    chapter: 'frequency',
  },
];
