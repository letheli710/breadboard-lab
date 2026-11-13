// A build-time content index (problems, challenges) is a lazily loaded chunk of its own (see
// contentIndexPlugin `lazyIndex` in scripts/problem-index-plugin.ts). This wraps its dynamic
// import: one request however often it is asked for, a retry after a failed request, and a
// status the UI can show ("idle" until something asks for it).

export type IndexStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface IndexLoader<T> {
  readonly status: IndexStatus;
  /** the loaded index (null until it arrives) */
  readonly data: T | null;
  /** start loading (once); resolves with the index, rejects if the request failed (a later call retries) */
  ensure(): Promise<T>;
}

/** `onStatus` is called on every change, after `data` is set (so "ready" can read it). */
export function indexLoader<T>(load: () => Promise<T>, onStatus: (status: IndexStatus, error?: unknown) => void): IndexLoader<T> {
  let status: IndexStatus = 'idle';
  let data: T | null = null;
  let pending: Promise<T> | null = null;
  const to = (s: IndexStatus, error?: unknown) => {
    status = s;
    onStatus(s, error);
  };
  return {
    get status() {
      return status;
    },
    get data() {
      return data;
    },
    ensure() {
      if (data !== null) return Promise.resolve(data);
      if (!pending) {
        let p: Promise<T>;
        try {
          p = load();
        } catch (e) {
          p = Promise.reject(e);
        }
        pending = p.then(
          (d) => {
            data = d;
            pending = null;
            to('ready');
            return d;
          },
          (e) => {
            pending = null; // the next ensure() retries
            to('error', e);
            throw e;
          },
        );
        to('loading');
      }
      return pending;
    },
  };
}
