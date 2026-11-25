// The index of stage lessons (#/lesson/<slug>): what the course map, the validator and the progress
// count need to know without loading a lesson (its text, diagrams and stage code are a lazy chunk,
// src/stage/lessons/). A lesson is placed in a World of course/worlds.json as "lesson:<slug>";
// `npm run validate` checks that every entry here is placed exactly once and that the World
// matches, and src/stage/registry.test.ts that each entry matches its lesson file.

export interface StageLessonEntry {
  /** URL / ref id: the lesson id in lower case ("w1-l0") */
  slug: string;
  /** "W1-L0" */
  code: string;
  /** World id in course/worlds.json */
  world: string;
  title: { zh: string; en: string };
  minutes: number;
}

export const STAGE_LESSON_INDEX: StageLessonEntry[] = [
  {
    slug: 'w1-l0',
    code: 'W1-L0',
    world: 'w1',
    title: { zh: '实验箱与万用表极简前置卡', en: 'Quick start: the breadboard and the multimeter' },
    minutes: 5,
  },
  {
    slug: 'w1-l1',
    code: 'W1-L1',
    world: 'w1',
    title: { zh: '电荷、电流与电压：电路分析的三块基石', en: 'Charge, current and voltage' },
    minutes: 15,
  },
  {
    slug: 'w1-l2',
    code: 'W1-L2',
    world: 'w1',
    title: { zh: '功率、无源符号约定与独立/受控源', en: 'Power, the passive sign convention and sources' },
    minutes: 35,
  },
  {
    slug: 'w1-l3',
    code: 'W1-L3',
    world: 'w1',
    title: { zh: '电阻、欧姆定律、电导与开路/短路极限', en: "Resistance, Ohm's law, conductance, open and short circuits" },
    minutes: 35,
  },
  {
    slug: 'w1-l4',
    code: 'W1-L4',
    world: 'w1',
    title: { zh: '支路、节点与回路拓扑识别', en: 'Branches, nodes and loops' },
    minutes: 25,
  },
  {
    slug: 'w1-l5',
    code: 'W1-L5',
    world: 'w1',
    title: { zh: '基尔霍夫电流定律（KCL）', en: "Kirchhoff's current law (KCL)" },
    minutes: 18,
  },
  {
    slug: 'w1-l6',
    code: 'W1-L6',
    world: 'w1',
    title: { zh: '基尔霍夫电压定律（KVL）与单回路求解', en: "Kirchhoff's voltage law (KVL) and single loops" },
    minutes: 35,
  },
  {
    slug: 'w1-l7',
    code: 'W1-L7',
    world: 'w1',
    title: { zh: '串联分压、并联分流与 3D 面包板实测', en: 'Voltage and current division on the breadboard' },
    minutes: 35,
  },
  {
    slug: 'w1-l8',
    code: 'W1-L8',
    world: 'w1',
    title: { zh: 'Y–Δ 等效变换与电桥电阻化简', en: 'Wye–delta transformations and bridges' },
    minutes: 35,
  },
  {
    slug: 'w2-l1',
    code: 'W2-L1',
    world: 'w2',
    title: { zh: '节点分析法（Nodal Analysis）', en: 'Nodal analysis' },
    minutes: 35,
  },
  {
    slug: 'w2-l2',
    code: 'W2-L2',
    world: 'w2',
    title: { zh: '含电压源的节点分析与超节点（Supernode）', en: 'Nodal analysis with voltage sources: the supernode' },
    minutes: 35,
  },
  {
    slug: 'w2-l3',
    code: 'W2-L3',
    world: 'w2',
    title: { zh: '网孔分析法与超网孔（Mesh & Supermesh Analysis）', en: 'Mesh and supermesh analysis' },
    minutes: 45,
  },
  {
    slug: 'w2-l4',
    code: 'W2-L4',
    world: 'w2',
    title: { zh: '节点法 vs 网孔法选型策略与矩阵直写法', en: 'Nodal vs mesh: choosing, and writing the matrix by inspection' },
    minutes: 45,
  },
  {
    slug: 'w2-l5',
    code: 'W2-L5',
    world: 'w2',
    title: { zh: '线性性质与叠加定理', en: 'Linearity and superposition' },
    minutes: 45,
  },
  {
    slug: 'w2-l6',
    code: 'W2-L6',
    world: 'w2',
    title: { zh: '电源变换', en: 'Source transformation' },
    minutes: 35,
  },
  {
    slug: 'w2-l7',
    code: 'W2-L7',
    world: 'w2',
    title: { zh: '戴维南与诺顿定理（含受控源测试源法与面包板实测）', en: 'Thévenin and Norton (test sources, breadboard measurement)' },
    minutes: 55,
  },
  {
    slug: 'w2-l8',
    code: 'W2-L8',
    world: 'w2',
    title: { zh: '最大功率传输定理', en: 'Maximum power transfer' },
    minutes: 45,
  },
  {
    slug: 'w3-l1',
    code: 'W3-L1',
    world: 'w3',
    title: { zh: '认识真实运放：LM358/LM741 封装、VCVS 模型与三区饱和', en: 'The real op amp: LM358/LM741 packages, the VCVS model and three regions' },
    minutes: 45,
  },
  {
    slug: 'w3-l2',
    code: 'W3-L2',
    world: 'w3',
    title: { zh: '理想运放公式与节点分析（虚断与虚短黄金法则）', en: 'The ideal op amp and nodal analysis (the two golden rules)' },
    minutes: 35,
  },
  {
    slug: 'w3-l3',
    code: 'W3-L3',
    world: 'w3',
    title: { zh: '反相放大器（虚地推导、输入电阻与 ±9V 双电源面包板实测）', en: 'The inverting amplifier (virtual ground, input resistance, ±9 V breadboard)' },
    minutes: 45,
  },
  {
    slug: 'w3-l4',
    code: 'W3-L4',
    world: 'w3',
    title: { zh: '同相放大器与电压跟随器（缓冲隔离与面包板实测）', en: 'The non-inverting amplifier and voltage follower (buffering, breadboard)' },
    minutes: 45,
  },
  {
    slug: 'w3-l5',
    code: 'W3-L5',
    world: 'w3',
    title: { zh: '反相加法器：Summing Amplifier 与音频混音直觉', en: 'The inverting summing amplifier and audio mixing' },
    minutes: 45,
  },
  {
    slug: 'w3-l6',
    code: 'W3-L6',
    world: 'w3',
    title: { zh: '差分放大器（双解法推导与共模抑制）', en: 'The difference amplifier (two derivations, common-mode rejection)' },
    minutes: 45,
  },
  {
    slug: 'w3-l7',
    code: 'W3-L7',
    world: 'w3',
    title: { zh: '级联运放电路：零加载效应与多级增益分解', en: 'Cascaded op-amp circuits: no loading, gain stage by stage' },
    minutes: 45,
  },
  {
    slug: 'w3-l8',
    code: 'W3-L8',
    world: 'w3',
    title: { zh: '运放工程综合实战（二进制加权 DAC、仪表放大器与比较器边界总结）', en: 'Op-amp projects: binary-weighted DAC, instrumentation amp, comparator limits' },
    minutes: 55,
  },
];

export const STAGE_LESSON_ENTRY = new Map(STAGE_LESSON_INDEX.map((e) => [e.slug, e]));

/** The stage lessons as the course catalog lists them (core/course/catalog.ts Catalog.lessons). */
export const lessonCatalog = () => new Map(STAGE_LESSON_INDEX.map((e) => [e.slug, { world: e.world, code: e.code, title: e.title }]));
