import { describe, expect, it } from 'vitest';
import {
  BRIDGE_EDGES,
  BRIDGE_LAYOUTS,
  CMP,
  compareMesh,
  compareNodal,
  cramer,
  crossings,
  det,
  fmt,
  isSymmetric,
  K33_EDGES,
  K33_LAYOUTS,
  MESH_EX,
  meshByInspection,
  NODAL_EX,
  nodalByInspection,
} from './model';

const close = (a: number[], b: number[]) => a.forEach((x, i) => expect(x).toBeCloseTo(b[i], 9));

describe('W2-L4 act 3 · 3×3 nodal example (图 3-1)', () => {
  const { G, i } = nodalByInspection(NODAL_EX);
  it('writes the sheet’s G and i by inspection', () => {
    expect(G).toEqual([
      [2, -1, -0.5],
      [-1, 3, -1],
      [-0.5, -1, 2],
    ]);
    expect(i).toEqual([12, 4, -3]);
    expect(isSymmetric(G)).toBe(true);
  });
  it('Cramer: Δ = 6.25, Δ1 = 62.5, Δ2 = 37.5, Δ3 = 25, v = (10, 6, 4) V', () => {
    const r = cramer(G, i);
    expect(r.d).toBeCloseTo(6.25, 12);
    close(r.dk, [62.5, 37.5, 25]);
    close(r.x, [10, 6, 4]);
  });
});

describe('W2-L4 act 4 · one circuit, two methods (图 4-1)', () => {
  it('nodal by inspection: G = [[3/4, −1/2], [−1/2, 2/3]], i = (6, 2), v = (20, 18) V', () => {
    const n = compareNodal(CMP);
    close(n.G.flat(), [3 / 4, -1 / 2, -1 / 2, 2 / 3]);
    expect(n.i).toEqual([6, 2]);
    expect(det(n.G)).toBeCloseTo(1 / 4, 12);
    close(n.v, [20, 18]);
  });
  it('supermesh route: i = (−5, −1, −2, −4) A and the same node voltages', () => {
    const m = compareMesh(CMP);
    close(m.i, [-5, -1, -2, -4]);
    close(m.v, [20, 18]);
  });
});

describe('W2-L4 act 6 · guided example (图 6-1)', () => {
  const { R, v } = meshByInspection(MESH_EX);
  it('R = [[8, −4, −2], [−4, 8, −1], [−2, −1, 6]], v = (18, −3, 8)', () => {
    expect(R).toEqual([
      [8, -4, -2],
      [-4, 8, -1],
      [-2, -1, 6],
    ]);
    expect(v).toEqual([18, -3, 8]);
  });
  it('Δ = 232, Δk = (928, 464, 696), i = (4, 2, 3) A, Io = i1 − i2 = 2 A', () => {
    const r = cramer(R, v);
    expect(r.d).toBeCloseTo(232, 9);
    close(r.dk, [928, 464, 696]);
    close(r.x, [4, 2, 3]);
    expect(r.x[0] - r.x[1]).toBeCloseTo(2, 12);
  });
});

describe('W2-L4 planarity demo', () => {
  it('K3,3: 9 crossings as drawn in the sheet, 3 as a hexagon, 1 at best', () => {
    expect(K33_LAYOUTS.map((L) => crossings(L, K33_EDGES).length)).toEqual([9, 3, 1]);
  });
  it('the Wheatstone bridge: one fake crossing, none once redrawn', () => {
    expect(BRIDGE_LAYOUTS.map((L) => crossings(L, BRIDGE_EDGES).length)).toEqual([1, 0]);
  });
  it('formats numbers with a true minus sign', () => {
    expect(fmt(-0.5)).toBe('−0.5');
    expect(fmt(2 / 3, 2)).toBe('0.67');
    expect(fmt(-0)).toBe('0');
  });
});
