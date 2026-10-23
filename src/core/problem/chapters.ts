// Chapters of the theory-practice area, following a standard first/second-year circuit
// analysis course (e.g. 邱关源《电路》). Problem files name one of these ids in `chapter`.

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
  { id: 'coupled', phase: 4, title: () => tr('耦合电感与理想变压器', 'Coupled inductors and ideal transformers') },
  { id: 'frequency', phase: 4, title: () => tr('频率响应与谐振', 'Frequency response and resonance') },
  { id: 'three-phase', phase: 4, title: () => tr('三相电路', 'Three-phase circuits') },
  { id: 'two-port', phase: 4, title: () => tr('二端口网络', 'Two-port networks') },
];

export const chapterById = (id: string) => CHAPTERS.find((c) => c.id === id);
