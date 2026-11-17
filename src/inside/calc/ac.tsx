// Calculation cards: capacitors, inductors and AC (reactance, time constants, filters, resonance).

import { tr } from '../../core/i18n';
import type { CalcCard, CalcGroup } from '../types';

export const group = (): CalcGroup => ({
  id: 'ac',
  title: tr('电容、电感与交流 C, L and AC', 'Capacitors, inductors and AC'),
  intro: tr(
    '容抗、感抗、时间常数、截止频率、谐振——第 3、4 期实验和示波器课的计算。',
    'Reactance, time constants, cut-off frequency, resonance — the numbers behind phases 3 and 4 and the scope lessons.',
  ),
});

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
    compute: (v) => 1 / (2 * Math.PI * v.f * v.C),
    why: tr(
      `电容的电流 $i = C\\frac{du}{dt}$。加正弦电压 $u = U_m \\sin(ωt)$，电流 $i = ωCU_m \\cos(ωt)$，幅度之比 $\\frac{U_m}{I_m} = \\frac{1}{ωC}$，其中 $ω = 2πf$。
频率越高、电容越大，容抗越小：**直流（f = 0）时电容是开路，高频时接近短路**。`,
      `A capacitor’s current is $i = C\\frac{du}{dt}$. With $u = U_m \\sin(ωt)$ the current is $i = ωCU_m \\cos(ωt)$, so the amplitude ratio is $\\frac{U_m}{I_m} = \\frac{1}{ωC}$ with $ω = 2πf$.
The higher the frequency or the larger the capacitor, the smaller the reactance: **open at DC (f = 0), nearly a short at high frequency**.`,
    ),
    example: tr('100 nF、1 kHz：$X_C = \\frac{1}{2π × 1000 × 10^{-7}} ≈ 1.59 kΩ$。', '100 nF at 1 kHz: $X_C = \\frac{1}{2π × 1000 × 10^{-7}} ≈ 1.59 kΩ$.'),
    teardowns: ['breadboard'],
    lessons: ['exp4-rc-lowpass-bode', 'exp4-rc-highpass-coupling'],
    chapter: 'ac-analysis',
  },
];
