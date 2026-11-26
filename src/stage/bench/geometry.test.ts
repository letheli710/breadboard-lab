import { describe, expect, it } from 'vitest';
import { colX, RAIL_Z, ROW_Z } from '../BreadboardXray';
import { BENCH_Y, boardXZ, clipAt, clipPath, frontDir, plugPath, probeCablePath, toWorld } from './geometry';

describe('boardXZ', () => {
  it('reads holes, rail holes and coordinates', () => {
    expect(boardXZ('a10')).toEqual([colX(10), ROW_Z.a]);
    expect(boardXZ('j63')).toEqual([colX(63), ROW_Z.j]);
    expect(boardXZ('T+3')).toEqual([colX(3), RAIL_Z.tp]);
    expect(boardXZ('T-4')).toEqual([colX(4), RAIL_Z.tn]);
    expect(boardXZ('B+3')).toEqual([colX(3), RAIL_Z.bp]);
    expect(boardXZ('B-4')).toEqual([colX(4), RAIL_Z.bn]);
    expect(boardXZ([1.5, -2])).toEqual([1.5, -2]);
    expect(() => boardXZ('k5')).toThrow();
  });
});

describe('toWorld', () => {
  it('places the instrument frame on the bench (y = −1), turned and scaled', () => {
    expect(toWorld({ position: [-43, -2] }, [3.6, 1.4, 4.4])).toEqual([expect.closeTo(-39.4), expect.closeTo(0.4), expect.closeTo(2.4)]);
    const p = toWorld({ position: [0, 0], yaw: Math.PI / 2 }, [1, 0, 2]);
    // turned a quarter left: local +x → world −z, local +z (front) → world +x
    expect(p[0]).toBeCloseTo(2);
    expect(p[2]).toBeCloseTo(-1);
    expect(frontDir({ position: [0, 0], yaw: Math.PI / 2 })[0]).toBeCloseTo(1);
    expect(toWorld({ position: [0, 0], scale: 0.5 }, [2, 4, 2])).toEqual([1, 1, 1]);
  });
});

describe('lead paths', () => {
  it('ends a plug lead in the hole and a clip lead on top of its clip', () => {
    const plug = plugPath([-40, 0.6, -14], [0, 0, 1], 'T+6');
    expect(plug[0]).toEqual([-40, 0.6, -14]);
    expect(plug[plug.length - 1]).toEqual([colX(6), -0.3, RAIL_Z.tp]);
    const clip = clipAt('a10');
    expect(clip).toEqual([colX(10) + 0.15, 1.5, ROW_Z.a]);
    const path = clipPath([-39.4, 0.4, 2.4], [0, 0, 1], clip, [[-31, 2.6, 0.5]]);
    expect(path[2]).toEqual([-31, 2.6, 0.5]);
    expect(path[path.length - 1]).toEqual([clip[0], 2.0, clip[2]]);
  });
  it('runs a probe cable from the probe top to just in front of the jack', () => {
    const p = probeCablePath([colX(10), ROW_Z.e], [-5.4, 0.6, -16.2], [0, 0, 1]);
    expect(p[0]).toEqual([colX(10), 3.4, ROW_Z.e]);
    expect(p[p.length - 1]).toEqual([-5.4, 0.6, expect.closeTo(-15.8)]);
  });
});

describe('tilted instruments', () => {
  it('leans back about the front foot', () => {
    const pl = { position: [0, 0] as [number, number], tilt: Math.PI / 2, tiltPivotZ: 2 };
    const top = toWorld(pl, [0, 4, 2]);
    // a point 4 up the front face ends up 4 behind the foot, at bench height
    expect(top[1]).toBeCloseTo(BENCH_Y + 0);
    expect(top[2]).toBeCloseTo(-2);
  });
});
