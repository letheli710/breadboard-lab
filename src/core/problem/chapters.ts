// Chapters of the theory-practice area, titled and numbered after Alexander & Sadiku,
// "Fundamentals of Electric Circuits" (docs/REBUILD_PLAN.md). Problem files name one of these ids in
// `chapter`. Which World a chapter belongs to is set in course/worlds.json (the Practice sidebar
// groups them by World; "next problem", the notebook and quizzes follow the course order).

import { tr } from '../i18n';

export interface Chapter {
  id: string;
  /** Sadiku chapter(s) the material matches, e.g. "1–2" */
  sadiku?: string;
  title: () => string;
}

export const CHAPTERS: Chapter[] = [
  { id: 'basics', sadiku: '1–2', title: () => tr('基本概念与基本定律', 'Basic concepts and basic laws') },
  { id: 'equivalence', sadiku: '2', title: () => tr('串并联与等效变换', 'Series, parallel and equivalent circuits') },
  { id: 'methods', sadiku: '3', title: () => tr('分析方法：结点法与网孔法', 'Methods of analysis: nodal and mesh') },
  { id: 'theorems', sadiku: '4', title: () => tr('电路定理', 'Circuit theorems') },
  { id: 'opamp', sadiku: '5', title: () => tr('运算放大器', 'Operational amplifiers') },
  // dependent sources come after the op-amp: a VCVS is the amplifier just built (Sadiku introduces them in 1.6)
  { id: 'dependent-sources', sadiku: '1.6, 2, 4', title: () => tr('受控源', 'Dependent sources') },
  { id: 'storage', sadiku: '6', title: () => tr('电容与电感', 'Capacitors and inductors') },
  { id: 'first-order', sadiku: '7', title: () => tr('一阶电路', 'First-order circuits') },
  { id: 'second-order', sadiku: '8', title: () => tr('二阶电路', 'Second-order circuits') },
  { id: 'phasors', sadiku: '9', title: () => tr('正弦量与相量', 'Sinusoids and phasors') },
  { id: 'ac-analysis', sadiku: '10', title: () => tr('正弦稳态分析', 'Sinusoidal steady-state analysis') },
  { id: 'ac-power', sadiku: '11', title: () => tr('交流功率', 'AC power analysis') },
  { id: 'three-phase', sadiku: '12', title: () => tr('三相电路', 'Three-phase circuits') },
  { id: 'coupled', sadiku: '13', title: () => tr('耦合电感与变压器', 'Magnetically coupled circuits') },
  { id: 'frequency', sadiku: '14', title: () => tr('频率响应与谐振', 'Frequency response and resonance') },
  // Laplace transform, network functions, impulse response and convolution
  { id: 's-domain', sadiku: '15–16', title: () => tr('拉普拉斯变换及其应用', 'The Laplace transform and its applications') },
  { id: 'non-sinusoidal', sadiku: '17', title: () => tr('傅里叶级数：非正弦周期电路', 'Fourier series: non-sinusoidal periodic circuits') },
  { id: 'two-port', sadiku: '19', title: () => tr('二端口网络', 'Two-port networks') },
  // nonlinear resistive circuits: operating points and small signals (an Electronics I topic)
  { id: 'nonlinear', title: () => tr('非线性电阻电路', 'Nonlinear resistive circuits') },
  // electives (not in Sadiku): network graphs and equations in matrix form; transmission lines (an EM topic)
  { id: 'matrix-form', title: () => tr('电路方程的矩阵形式', 'Circuit equations in matrix form') },
  { id: 'transmission-line', title: () => tr('均匀传输线', 'Uniform transmission lines') },
];

export const chapterById = (id: string) => CHAPTERS.find((c) => c.id === id);
