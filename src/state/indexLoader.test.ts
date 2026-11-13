import { describe, expect, it, vi } from 'vitest';
import { indexLoader, type IndexStatus } from './indexLoader';

const deferred = <T>() => {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('indexLoader', () => {
  it('starts idle and loads once however often it is asked for', async () => {
    const d = deferred<string[]>();
    const load = vi.fn(() => d.promise);
    const seen: IndexStatus[] = [];
    const l = indexLoader(load, (s) => seen.push(s));
    expect(l.status).toBe('idle');
    expect(l.data).toBeNull();
    const a = l.ensure();
    const b = l.ensure();
    expect(load).toHaveBeenCalledTimes(1);
    expect(l.status).toBe('loading');
    d.resolve(['x']);
    expect(await a).toEqual(['x']);
    expect(await b).toEqual(['x']);
    expect(l.status).toBe('ready');
    expect(l.data).toEqual(['x']);
    await l.ensure();
    expect(load).toHaveBeenCalledTimes(1);
    expect(seen).toEqual(['loading', 'ready']);
  });

  it('has the data in place when "ready" is reported', async () => {
    let atReady: unknown = undefined;
    const l = indexLoader(
      () => Promise.resolve(42),
      (s) => {
        if (s === 'ready') atReady = l.data;
      },
    );
    await l.ensure();
    expect(atReady).toBe(42);
  });

  it('reports a failed request and retries on the next call', async () => {
    let n = 0;
    const seen: IndexStatus[] = [];
    const l = indexLoader(
      () => (++n === 1 ? Promise.reject(new Error('offline')) : Promise.resolve('ok')),
      (s) => seen.push(s),
    );
    await expect(l.ensure()).rejects.toThrow('offline');
    expect(l.status).toBe('error');
    expect(l.data).toBeNull();
    expect(await l.ensure()).toBe('ok');
    expect(seen).toEqual(['loading', 'error', 'loading', 'ready']);
  });

  it('treats a loader that throws synchronously as a failed request', async () => {
    const l = indexLoader<number>(
      () => {
        throw new Error('boom');
      },
      () => undefined,
    );
    await expect(l.ensure()).rejects.toThrow('boom');
    expect(l.status).toBe('error');
  });
});
