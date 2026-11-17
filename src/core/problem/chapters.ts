// Chapters of the theory-practice area, following a standard first/second-year circuit
// analysis course (e.g. 邱关源《电路》). Problem files name one of these ids in `chapter`.
// Listed in course order: the order of the Worlds in course/worlds.json (the Practice sidebar
// groups them by World; "next problem", the notebook and quizzes follow this order).

import { tr } from '../i18n';

export interface Chapter {
  id: string;
  /** course phase 1..4 (see docs/ROADMAP.md) */
  phase: 1 | 2 | 3 | 4;
  title: () => string;
}

export const CHAPTERS: Chapter[] = [
  { id: 'basics', phase: 1, title: () => tr('电路模型与基本定律', 'Circuit models and basic laws') },
  { id: 'equivalence', phase: 1, title: () => tr('电阻电路的等效变换', 'Equivalent transformations of resistive circuits') },
  { id: 'methods', phase: 2, title: () => tr('电阻电路的一般分析方法', 'General methods: nodal and mesh analysis') },
  { id: 'theorems', phase: 2, title: () => tr('电路定理', 'Circuit theorems') },
  { id: 'opamp', phase: 2, title: () => tr('含运算放大器的电路', 'Op-amp circuits') },
  { id: 'storage', phase: 3, title: () => tr('电容与电感', 'Capacitors and inductors') },
  { id: 'first-order', phase: 3, title: () => tr('一阶电路的时域分析', 'First-order circuits') },
  { id: 'second-order', phase: 3, title: () => tr('二阶电路的时域分析', 'Second-order circuits') },
  { id: 'phasors', phase: 4, title: () => tr('相量法', 'Phasors') },
  { id: 'ac-analysis', phase: 4, title: () => tr('正弦稳态电路分析', 'Sinusoidal steady-state analysis') },
  { id: 'ac-power', phase: 4, title: () => tr('正弦稳态功率', 'AC power') },
  { id: 'frequency', phase: 4, title: () => tr('频率响应与谐振', 'Frequency response and resonance') },
  { id: 'coupled', phase: 4, title: () => tr('耦合电感与理想变压器', 'Coupled inductors and ideal transformers') },
  { id: 'three-phase', phase: 4, title: () => tr('三相电路', 'Three-phase circuits') },
  // textbook ch. 17, nonlinear resistive circuits only
  { id: 'nonlinear', phase: 4, title: () => tr('非线性电阻电路', 'Nonlinear resistive circuits') },
  // textbook ch. 14 (Laplace transform, network functions) plus impulse response and convolution
  { id: 's-domain', phase: 4, title: () => tr('线性动态电路的复频域分析', 'Laplace transform and s-domain analysis') },
  { id: 'two-port', phase: 4, title: () => tr('二端口网络', 'Two-port networks') },
  { id: 'non-sinusoidal', phase: 4, title: () => tr('非正弦周期电流电路', 'Non-sinusoidal periodic circuits') },
  // textbook ch. 15: network graphs (cut-sets, A / B_f / Q_f), equations in matrix form, state equations
  { id: 'matrix-form', phase: 4, title: () => tr('电路方程的矩阵形式', 'Circuit equations in matrix form') },
  // textbook ch. 18, distributed-parameter circuits (element TL, analysis/tline.ts)
  { id: 'transmission-line', phase: 4, title: () => tr('均匀传输线', 'Uniform transmission lines') },
];

export const chapterById = (id: string) => CHAPTERS.find((c) => c.id === id);
