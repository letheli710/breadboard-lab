// Dense linear algebra for small systems: complex LU with equilibration and partial pivoting,
// real matrix exponential (Padé + scaling and squaring), and eigenvalues (complex QR).

import type { Complex } from '../problem/types';
import { cx } from './complex';

export class SingularMatrixError extends Error {
  /** index of the column (unknown) where elimination broke down */
  constructor(readonly column: number) {
    super(`singular matrix (column ${column})`);
    this.name = 'SingularMatrixError';
  }
}

export interface ComplexLU {
  readonly n: number;
  solve(b: readonly Complex[]): Complex[];
}

/** Pivot threshold on the row- and column-equilibrated matrix. */
const PIVOT_TOL = 1e-12;

export function luFactor(A: readonly (readonly Complex[])[]): ComplexLU {
  const n = A.length;
  const re = new Float64Array(n * n);
  const im = new Float64Array(n * n);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      re[i * n + j] = A[i][j].re;
      im[i * n + j] = A[i][j].im;
    }
  const mag = (k: number) => Math.hypot(re[k], im[k]);
  // equilibration: rows, then columns, scaled to max |a| = 1
  const rs = new Float64Array(n);
  const cs = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let m = 0;
    for (let j = 0; j < n; j++) m = Math.max(m, mag(i * n + j));
    if (!(m > 0) || !Number.isFinite(m)) throw new SingularMatrixError(-1);
    rs[i] = 1 / m;
    for (let j = 0; j < n; j++) {
      re[i * n + j] *= rs[i];
      im[i * n + j] *= rs[i];
    }
  }
  for (let j = 0; j < n; j++) {
    let m = 0;
    for (let i = 0; i < n; i++) m = Math.max(m, mag(i * n + j));
    if (!(m > 0)) throw new SingularMatrixError(j);
    cs[j] = 1 / m;
    for (let i = 0; i < n; i++) {
      re[i * n + j] *= cs[j];
      im[i * n + j] *= cs[j];
    }
  }
  const perm = new Int32Array(n);
  for (let i = 0; i < n; i++) perm[i] = i;
  for (let k = 0; k < n; k++) {
    let p = k;
    let best = mag(k * n + k);
    for (let i = k + 1; i < n; i++) {
      const m = mag(i * n + k);
      if (m > best) {
        best = m;
        p = i;
      }
    }
    if (!(best >= PIVOT_TOL)) throw new SingularMatrixError(k);
    if (p !== k) {
      for (let j = 0; j < n; j++) {
        const a = k * n + j;
        const b = p * n + j;
        let t = re[a];
        re[a] = re[b];
        re[b] = t;
        t = im[a];
        im[a] = im[b];
        im[b] = t;
      }
      const t = perm[k];
      perm[k] = perm[p];
      perm[p] = t;
    }
    const pr = re[k * n + k];
    const pi = im[k * n + k];
    const d = pr * pr + pi * pi;
    const ir = pr / d;
    const ii = -pi / d;
    for (let i = k + 1; i < n; i++) {
      const a = i * n + k;
      if (re[a] === 0 && im[a] === 0) continue;
      const fr = re[a] * ir - im[a] * ii;
      const fi = re[a] * ii + im[a] * ir;
      re[a] = fr;
      im[a] = fi;
      for (let j = k + 1; j < n; j++) {
        const b = k * n + j;
        const c = i * n + j;
        re[c] -= fr * re[b] - fi * im[b];
        im[c] -= fr * im[b] + fi * re[b];
      }
    }
  }
  return {
    n,
    solve(b) {
      const yr = new Float64Array(n);
      const yi = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const s = rs[perm[i]];
        yr[i] = b[perm[i]].re * s;
        yi[i] = b[perm[i]].im * s;
      }
      for (let i = 0; i < n; i++)
        for (let j = 0; j < i; j++) {
          const a = i * n + j;
          yr[i] -= re[a] * yr[j] - im[a] * yi[j];
          yi[i] -= re[a] * yi[j] + im[a] * yr[j];
        }
      for (let i = n - 1; i >= 0; i--) {
        let sr = yr[i];
        let si = yi[i];
        for (let j = i + 1; j < n; j++) {
          const a = i * n + j;
          sr -= re[a] * yr[j] - im[a] * yi[j];
          si -= re[a] * yi[j] + im[a] * yr[j];
        }
        const a = i * n + i;
        const d = re[a] * re[a] + im[a] * im[a];
        yr[i] = (sr * re[a] + si * im[a]) / d;
        yi[i] = (si * re[a] - sr * im[a]) / d;
      }
      const x: Complex[] = new Array(n);
      for (let j = 0; j < n; j++) x[j] = cx(yr[j] * cs[j], yi[j] * cs[j]);
      return x;
    },
  };
}

// ---------------- real matrices ----------------

export type Mat = number[][];

export const zeros = (r: number, c: number): Mat => Array.from({ length: r }, () => new Array<number>(c).fill(0));
export const eye = (n: number): Mat => {
  const m = zeros(n, n);
  for (let i = 0; i < n; i++) m[i][i] = 1;
  return m;
};

export function matMul(A: Mat, B: Mat): Mat {
  const n = A.length;
  const m = B[0]?.length ?? 0;
  const k = B.length;
  const C = zeros(n, m);
  for (let i = 0; i < n; i++)
    for (let l = 0; l < k; l++) {
      const a = A[i][l];
      if (a === 0) continue;
      const Bl = B[l];
      const Ci = C[i];
      for (let j = 0; j < m; j++) Ci[j] += a * Bl[j];
    }
  return C;
}

export const matVec = (A: Mat, x: readonly number[]): number[] =>
  A.map((row) => row.reduce((s, a, j) => s + a * x[j], 0));

/** Solve A X = B (A square, real) by Gaussian elimination with partial pivoting. */
export function realSolve(A: Mat, B: Mat): Mat {
  const n = A.length;
  const m = B[0]?.length ?? 0;
  const a = A.map((r) => r.slice());
  const b = B.map((r) => r.slice());
  let scaleMax = 0;
  for (const r of a) for (const v of r) scaleMax = Math.max(scaleMax, Math.abs(v));
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > Math.abs(a[p][k])) p = i;
    if (!(Math.abs(a[p][k]) > 1e-14 * scaleMax)) throw new SingularMatrixError(k);
    [a[k], a[p]] = [a[p], a[k]];
    [b[k], b[p]] = [b[p], b[k]];
    for (let i = k + 1; i < n; i++) {
      const f = a[i][k] / a[k][k];
      if (f === 0) continue;
      for (let j = k; j < n; j++) a[i][j] -= f * a[k][j];
      for (let j = 0; j < m; j++) b[i][j] -= f * b[k][j];
    }
  }
  const x = zeros(n, m);
  for (let i = n - 1; i >= 0; i--)
    for (let j = 0; j < m; j++) {
      let s = b[i][j];
      for (let l = i + 1; l < n; l++) s -= a[i][l] * x[l][j];
      x[i][j] = s / a[i][i];
    }
  return x;
}

/** Matrix exponential e^A: diagonal Padé (6,6) approximant with scaling and squaring.
 *  The squaring phase works on F = e^A − I ((I+F)² − I = 2F + F²), which keeps slowly
 *  decaying modes accurate even when the matrix is very stiff. */
export function expm(A: Mat): Mat {
  const n = A.length;
  if (n === 0) return [];
  let norm = 0;
  for (const r of A) norm = Math.max(norm, r.reduce((s, v) => s + Math.abs(v), 0));
  if (!Number.isFinite(norm)) throw new Error('expm: non-finite matrix');
  const s = norm > 0.5 ? Math.max(0, Math.ceil(Math.log2(norm / 0.5))) : 0;
  const f = 2 ** -s;
  const As = A.map((r) => r.map((v) => v * f));
  const q = 6;
  let c = 0.5;
  let X = As;
  const D = eye(n); // Q(A)
  const O = zeros(n, n); // odd part: (P(A) − Q(A)) / 2
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      O[i][j] += c * As[i][j];
      D[i][j] -= c * As[i][j];
    }
  for (let k = 2; k <= q; k++) {
    c = (c * (q - k + 1)) / (k * (2 * q - k + 1));
    X = matMul(As, X);
    const odd = k % 2 === 1;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if (odd) {
          O[i][j] += c * X[i][j];
          D[i][j] -= c * X[i][j];
        } else D[i][j] += c * X[i][j];
      }
  }
  // F = Q⁻¹P − I = Q⁻¹(P − Q) = 2·Q⁻¹·O
  let F = realSolve(D, O.map((r) => r.map((v) => 2 * v)));
  for (let k = 0; k < s; k++) {
    const FF = matMul(F, F);
    F = F.map((r, i) => r.map((v, j) => 2 * v + FF[i][j]));
  }
  for (let i = 0; i < n; i++) F[i][i] += 1;
  return F;
}

/** Eigenvalues of a real square matrix (balancing, Hessenberg reduction, shifted complex QR). */
export function eigenvalues(A0: Mat): Complex[] {
  const n = A0.length;
  if (n === 0) return [];
  const A = A0.map((r) => r.slice());
  // balancing (Parlett–Reinsch, powers of 2)
  for (let pass = 0, done = false; !done && pass < 100; pass++) {
    done = true;
    for (let i = 0; i < n; i++) {
      let c = 0;
      let r = 0;
      for (let j = 0; j < n; j++)
        if (j !== i) {
          c += Math.abs(A[j][i]);
          r += Math.abs(A[i][j]);
        }
      if (c === 0 || r === 0) continue;
      let g = r / 2;
      let fct = 1;
      const s = c + r;
      while (c < g) {
        fct *= 2;
        c *= 4;
      }
      g = r * 2;
      while (c > g) {
        fct /= 2;
        c /= 4;
      }
      if ((c + r) / fct < 0.95 * s) {
        done = false;
        for (let j = 0; j < n; j++) A[i][j] /= fct;
        for (let j = 0; j < n; j++) A[j][i] *= fct;
      }
    }
  }
  const Hr = A.map((r) => r.slice());
  const Hi = A.map((r) => r.map(() => 0));
  // Householder reduction to Hessenberg form (complex storage)
  for (let k = 0; k < n - 2; k++) {
    let norm = 0;
    for (let i = k + 1; i < n; i++) norm += Hr[i][k] ** 2 + Hi[i][k] ** 2;
    norm = Math.sqrt(norm);
    if (norm === 0) continue;
    const x0r = Hr[k + 1][k];
    const x0i = Hi[k + 1][k];
    const x0m = Math.hypot(x0r, x0i);
    const ph = x0m === 0 ? [1, 0] : [x0r / x0m, x0i / x0m];
    const vr: number[] = [];
    const vi: number[] = [];
    for (let i = k + 1; i < n; i++) {
      vr.push(Hr[i][k]);
      vi.push(Hi[i][k]);
    }
    vr[0] += ph[0] * norm;
    vi[0] += ph[1] * norm;
    let vn = 0;
    for (let i = 0; i < vr.length; i++) vn += vr[i] ** 2 + vi[i] ** 2;
    vn = Math.sqrt(vn);
    if (vn === 0) continue;
    for (let i = 0; i < vr.length; i++) {
      vr[i] /= vn;
      vi[i] /= vn;
    }
    // left: H = (I - 2 v v^H) H on rows k+1..n-1
    for (let j = 0; j < n; j++) {
      let wr = 0;
      let wi = 0;
      for (let i = 0; i < vr.length; i++) {
        const hr = Hr[k + 1 + i][j];
        const hi = Hi[k + 1 + i][j];
        wr += vr[i] * hr + vi[i] * hi;
        wi += vr[i] * hi - vi[i] * hr;
      }
      for (let i = 0; i < vr.length; i++) {
        Hr[k + 1 + i][j] -= 2 * (vr[i] * wr - vi[i] * wi);
        Hi[k + 1 + i][j] -= 2 * (vr[i] * wi + vi[i] * wr);
      }
    }
    // right: H = H (I - 2 v v^H) on cols k+1..n-1
    for (let i = 0; i < n; i++) {
      let wr = 0;
      let wi = 0;
      for (let j = 0; j < vr.length; j++) {
        const hr = Hr[i][k + 1 + j];
        const hi = Hi[i][k + 1 + j];
        wr += hr * vr[j] - hi * vi[j];
        wi += hr * vi[j] + hi * vr[j];
      }
      for (let j = 0; j < vr.length; j++) {
        // subtract 2 w conj(v_j)
        Hr[i][k + 1 + j] -= 2 * (wr * vr[j] + wi * vi[j]);
        Hi[i][k + 1 + j] -= 2 * (wi * vr[j] - wr * vi[j]);
      }
    }
    for (let i = k + 2; i < n; i++) {
      Hr[i][k] = 0;
      Hi[i][k] = 0;
    }
  }
  const out: Complex[] = new Array(n);
  let hi = n - 1;
  let iter = 0;
  let total = 0;
  const m = (i: number, j: number) => Math.hypot(Hr[i][j], Hi[i][j]);
  let hnorm = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) hnorm = Math.max(hnorm, m(i, j));
  while (hi >= 0) {
    if (hi === 0) {
      out[0] = cx(Hr[0][0], Hi[0][0]);
      break;
    }
    let l = hi;
    while (l > 0) {
      const s = m(l - 1, l - 1) + m(l, l);
      if (m(l, l - 1) <= 1e-15 * (s === 0 ? hnorm : s)) {
        Hr[l][l - 1] = 0;
        Hi[l][l - 1] = 0;
        break;
      }
      l--;
    }
    if (l === hi) {
      out[hi] = cx(Hr[hi][hi], Hi[hi][hi]);
      hi--;
      iter = 0;
      continue;
    }
    iter++;
    total++;
    if (total > 1000 * n) throw new Error('eigenvalues: QR iteration did not converge');
    // Wilkinson shift from trailing 2x2
    const a = cx(Hr[hi - 1][hi - 1], Hi[hi - 1][hi - 1]);
    const b = cx(Hr[hi - 1][hi], Hi[hi - 1][hi]);
    const c = cx(Hr[hi][hi - 1], Hi[hi][hi - 1]);
    const d = cx(Hr[hi][hi], Hi[hi][hi]);
    let mu: Complex;
    if (iter % 11 === 10) {
      mu = cx(d.re + Math.abs(c.re) + Math.abs(c.im), d.im);
    } else {
      const hr = (a.re - d.re) / 2;
      const hiP = (a.im - d.im) / 2;
      // disc = sqrt(h^2 + b c)
      const h2r = hr * hr - hiP * hiP + (b.re * c.re - b.im * c.im);
      const h2i = 2 * hr * hiP + (b.re * c.im + b.im * c.re);
      const mm = Math.hypot(h2r, h2i);
      const sr = Math.sqrt((mm + h2r) / 2);
      let si = Math.sqrt(Math.max(0, (mm - h2r) / 2));
      if (h2i < 0) si = -si;
      const meanr = (a.re + d.re) / 2;
      const meani = (a.im + d.im) / 2;
      const m1 = cx(meanr + sr, meani + si);
      const m2 = cx(meanr - sr, meani - si);
      mu = Math.hypot(m1.re - d.re, m1.im - d.im) < Math.hypot(m2.re - d.re, m2.im - d.im) ? m1 : m2;
    }
    for (let k = l; k <= hi; k++) {
      Hr[k][k] -= mu.re;
      Hi[k][k] -= mu.im;
    }
    const rot: [number, number, number, number][] = []; // c (complex), s (complex)
    for (let k = l; k < hi; k++) {
      const xr = Hr[k][k];
      const xi = Hi[k][k];
      const yr = Hr[k + 1][k];
      const yi = Hi[k + 1][k];
      const r = Math.hypot(xr, xi, yr, yi);
      let cr = 1;
      let ci = 0;
      let sr = 0;
      let si = 0;
      if (r > 0) {
        cr = xr / r;
        ci = xi / r;
        sr = yr / r;
        si = yi / r;
      }
      rot.push([cr, ci, sr, si]);
      // rows k, k+1: new_k = conj(c) row_k + conj(s) row_k1 ; new_k1 = -s row_k + c row_k1
      for (let j = k; j <= hi; j++) {
        const ar = Hr[k][j];
        const ai = Hi[k][j];
        const br = Hr[k + 1][j];
        const bi = Hi[k + 1][j];
        Hr[k][j] = cr * ar + ci * ai + (sr * br + si * bi);
        Hi[k][j] = cr * ai - ci * ar + (sr * bi - si * br);
        Hr[k + 1][j] = -(sr * ar - si * ai) + (cr * br - ci * bi);
        Hi[k + 1][j] = -(sr * ai + si * ar) + (cr * bi + ci * br);
      }
    }
    for (let k = l; k < hi; k++) {
      const [cr, ci, sr, si] = rot[k - l];
      // cols k, k+1: new_k = col_k c + col_k1 s ; new_k1 = col_k (-conj s) + col_k1 conj(c)
      for (let i = l; i <= Math.min(k + 2, hi); i++) {
        const ar = Hr[i][k];
        const ai = Hi[i][k];
        const br = Hr[i][k + 1];
        const bi = Hi[i][k + 1];
        Hr[i][k] = ar * cr - ai * ci + (br * sr - bi * si);
        Hi[i][k] = ar * ci + ai * cr + (br * si + bi * sr);
        Hr[i][k + 1] = -(ar * sr + ai * si) + (br * cr + bi * ci);
        Hi[i][k + 1] = -(ai * sr - ar * si) + (bi * cr - br * ci);
      }
    }
    for (let k = l; k <= hi; k++) {
      Hr[k][k] += mu.re;
      Hi[k][k] += mu.im;
    }
  }
  return out;
}
