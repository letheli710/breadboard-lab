// Calendar days for the review schedule (state/mastery.ts). A "day" is the device's local date
// as "YYYY-MM-DD", so "due tomorrow" flips at the student's midnight, not UTC's. Day arithmetic
// goes through UTC dates built from those parts, so daylight-saving changes don't shift it.
//
// The clock can be shifted for browser tests without editing code:
//   window.__bbClock.advance(3)   // pretend it is 3 days later
//   window.__bbClock.reset()
// The shift lives in memory only (a reload goes back to the real date) and notifies listeners,
// so the "due today" count updates at once.

let offsetMs = 0;
const listeners = new Set<() => void>();

/** Milliseconds since the epoch, including the test shift. */
export const nowMs = () => Date.now() + offsetMs;

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day of a timestamp. */
export function dayOf(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Today on the device clock (with the test shift). */
export const today = () => dayOf(nowMs());

export const isDay = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));

const utc = (day: string) => Date.parse(`${day}T00:00:00Z`);
const DAY_MS = 86_400_000;

export function addDays(day: string, n: number): string {
  const d = new Date(utc(day) + n * DAY_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** b − a in whole days. */
export const daysBetween = (a: string, b: string) => Math.round((utc(b) - utc(a)) / DAY_MS);

export function onClockChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function shift(ms: number) {
  offsetMs = ms;
  for (const fn of listeners) fn();
}

export const clockHook = {
  advance: (days: number) => shift(offsetMs + days * DAY_MS),
  reset: () => shift(0),
  offsetDays: () => offsetMs / DAY_MS,
};

if (typeof window !== 'undefined') (window as unknown as { __bbClock: typeof clockHook }).__bbClock = clockHook;
