// TeX of layer 01's "standard form" view: each transfer function in three lines — as given, with the
// constants of the first-order factors pulled out (coloured), and in Bode standard form with K boxed.
// (lesson.test.ts renders all of them in KaTeX.)

import { BLOCK_W, fmt, kOf, RAW, type BlockKind } from './model';

const R = String.raw;
const HL = (s: string | number) => R`{\color{#b45309}${s}}`;

export function stdRc(wc: number): string[] {
  return [
    R`\mathbf{H}(\omega) = \frac{Z_C}{Z_R + Z_C} = \frac{\dfrac{1}{j\omega C}}{R + \dfrac{1}{j\omega C}}`,
    R`= \frac{1}{1 + j\omega RC} \qquad (\text{上下同乘 } j\omega C)`,
    R`= \frac{\boxed{1}}{1 + j\dfrac{\omega}{\omega_c}}, \qquad \omega_c = \frac{1}{RC} = ${fmt(wc, wc >= 100 ? 0 : 1)}\text{ rad/s}`,
  ];
}

export function stdTwoPole(which: 'ex4' | 'guided'): string[] {
  const { N, poles } = RAW[which];
  const [a, b] = poles;
  const K = kOf(RAW[which]);
  return [
    R`\mathbf{H}(\omega) = \frac{${N}\,j\omega}{(j\omega + ${a})(j\omega + ${b})}`,
    R`= \frac{${N}\,j\omega}{${HL(a)}\left(1 + j\dfrac{\omega}{${a}}\right) \cdot ${HL(b)}\left(1 + j\dfrac{\omega}{${b}}\right)}`,
    R`= \frac{\boxed{${K}}\,j\omega}{\left(1 + j\dfrac{\omega}{${a}}\right)\left(1 + j\dfrac{\omega}{${b}}\right)}, \qquad K = \frac{${N}}{${a} \times ${b}} = ${K}`,
  ];
}

/** the guided example before its step 1 is answered: only the given form, K unknown */
export const STD_GUIDED_MASKED = [
  R`\mathbf{H}(\omega) = \frac{2000\,j\omega}{(j\omega + 2)(j\omega + 100)}`,
  R`= \frac{\boxed{\;?\;}\,j\omega}{\left(1 + j\dfrac{\omega}{?}\right)\left(1 + j\dfrac{\omega}{?}\right)}`,
];

export function stdBlock(kind: BlockKind, k: number, sign: 1 | -1, zeta: number): string {
  const e = sign === 1 ? '+1' : '-1';
  switch (kind) {
    case 'K':
      return R`\mathbf{H}(\omega) = K = ${fmt(k, k % 1 ? 1 : 0).replace('−', '-')}, \qquad 20\log_{10}|K| = ${fmt(20 * Math.log10(Math.abs(k))).replace('−', '-')}\text{ dB}`;
    case 'origin':
      return R`\mathbf{H}(\omega) = (j\omega)^{${e}}`;
    case 'real':
      return R`\mathbf{H}(\omega) = \left(1 + j\dfrac{\omega}{${BLOCK_W}}\right)^{${e}}, \qquad \omega_c = ${BLOCK_W}\text{ rad/s}`;
    case 'quad':
      return R`\mathbf{H}(\omega) = \left[1 + j2\zeta\dfrac{\omega}{\omega_n} - \left(\dfrac{\omega}{\omega_n}\right)^2\right]^{-1}, \qquad \omega_n = ${BLOCK_W}\text{ rad/s},\ \zeta = ${zeta}`;
  }
}

/** every TeX string the layer can show (for the KaTeX test) */
export const ALL_LAYER_TEX = [
  ...stdRc(1000),
  ...stdRc(12.5),
  ...stdTwoPole('ex4'),
  ...stdTwoPole('guided'),
  ...STD_GUIDED_MASKED,
  stdBlock('K', 10, 1, 0.3),
  stdBlock('K', -10, 1, 0.3),
  stdBlock('K', 0.1, 1, 0.3),
  stdBlock('origin', 1, 1, 0.3),
  stdBlock('origin', 1, -1, 0.3),
  stdBlock('real', 1, -1, 0.3),
  stdBlock('quad', 1, -1, 0.707),
];
