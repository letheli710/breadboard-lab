// Everything read back from localStorage goes through here. Saved data can be from an older
// version of the app, hand-edited, truncated or simply corrupt: each reader validates (and, for
// layouts, migrates by `version`) and drops what it can't use instead of letting a bad value
// crash rendering on every reload.

import { HOLE_MAP } from '../core/breadboard';
import { MOSFETS } from '../core/devices';
import { BATTERIES, LED_COLORS, PARTS } from '../core/parts';
import { PIN_MODES, type BenchPose, type Layout, type PartProps, type PartType, type PinConfig, type PlacedPart } from '../core/types';
import type { ChallengeReadings, ReadingAnswer } from '../core/readings';

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Current layout format. Bump it, and add a step to `MIGRATIONS`, when the saved shape changes. */
export const LAYOUT_VERSION = 1;

/** version n → version n + 1, applied in order. Layouts saved before the version field existed
 *  count as version 1. */
const MIGRATIONS: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {};

const NUM_PROPS = ['resistance', 'capacitance', 'voltage', 'currentLimit', 'wiper', 'inductance', 'frequency', 'amplitude', 'offset', 'beta', 'lux', 'temperature'] as const;

function sanitizePinConfigs(raw: unknown): Record<string, PinConfig> | undefined {
  if (!isObj(raw)) return undefined;
  const out: Record<string, PinConfig> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!isObj(v) || !PIN_MODES.includes(v.mode as PinConfig['mode'])) continue;
    const c: PinConfig = { mode: v.mode as PinConfig['mode'] };
    if (num(v.duty) && v.duty >= 0 && v.duty <= 100) c.duty = v.duty;
    if (num(v.frequency) && v.frequency > 0) c.frequency = v.frequency;
    if (v.openDrain === true) c.openDrain = true;
    out[k] = c;
  }
  return out;
}

/** Known, well-typed props only (anything else is dropped), on top of the part's defaults. */
export function sanitizeProps(type: PartType, raw: unknown): PartProps {
  const r = isObj(raw) ? raw : {};
  const p: PartProps = {};
  for (const k of NUM_PROPS) if (num(r[k])) p[k] = r[k] as number;
  if (typeof r.color === 'string' && r.color in LED_COLORS) p.color = r.color as PartProps['color'];
  if (typeof r.variant === 'string' && r.variant in BATTERIES) p.variant = r.variant as PartProps['variant'];
  if (typeof r.pressed === 'boolean') p.pressed = r.pressed;
  if (typeof r.usb === 'boolean') p.usb = r.usb;
  if (r.position === 'a' || r.position === 'b') p.position = r.position;
  if (typeof r.wireColor === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(r.wireColor)) p.wireColor = r.wireColor;
  if (r.waveform === 'sine' || r.waveform === 'square' || r.waveform === 'triangle') p.waveform = r.waveform;
  if (r.channel === 1 || r.channel === 2) p.channel = r.channel;
  if (r.meterMode === 'auto' || r.meterMode === 'dc' || r.meterMode === 'ac') p.meterMode = r.meterMode;
  if (typeof r.model === 'string' && r.model in MOSFETS) p.model = r.model as PartProps['model'];
  const pins = sanitizePinConfigs(r.pins);
  if (pins) p.pins = pins;
  return { ...PARTS[type].defaults, ...p };
}

/** A saved layout, migrated to the current version and cleaned: parts of unknown type, with a
 *  missing or non-existent hole, or using a hole an earlier part already uses are dropped.
 *  Returns null when the value isn't a layout at all (or is from a newer, unknown version). */
export function sanitizeLayout(raw: unknown, newId: () => string): { layout: Layout; dropped: number } | null {
  if (!isObj(raw) || !Array.isArray(raw.parts)) return null;
  let v = raw.version === undefined ? 1 : raw.version;
  if (!num(v) || v < 1 || v > LAYOUT_VERSION) return null;
  let cur: Record<string, unknown> = raw;
  for (; v < LAYOUT_VERSION; v++) cur = MIGRATIONS[v](cur);
  const list = Array.isArray(cur.parts) ? cur.parts : [];
  const parts: PlacedPart[] = [];
  const used = new Set<string>();
  const refs = new Set<string>();
  const ids = new Set<string>();
  for (const p of list) {
    if (!isObj(p) || typeof p.type !== 'string' || !Object.prototype.hasOwnProperty.call(PARTS, p.type)) continue;
    const type = p.type as PartType;
    const def = PARTS[type];
    if (typeof p.ref !== 'string' || !p.ref || refs.has(p.ref) || !isObj(p.pins)) continue;
    const want = Object.keys(def.terminalOf);
    const pins: Record<string, string> = {};
    let ok = true;
    for (const pin of want) {
      const h = p.pins[pin];
      if (typeof h !== 'string' || !HOLE_MAP.has(h) || used.has(h) || Object.values(pins).includes(h)) {
        ok = false;
        break;
      }
      pins[pin] = h;
    }
    if (!ok || Object.keys(p.pins).length !== want.length) continue;
    for (const h of Object.values(pins)) used.add(h);
    refs.add(p.ref);
    const id = typeof p.id === 'string' && p.id && !ids.has(p.id) ? p.id : newId();
    ids.add(id);
    const pose = sanitizePose(p.pose);
    parts.push({ id, ref: p.ref, type, props: sanitizeProps(type, p.props), pins, ...(pose ? { pose } : {}) });
  }
  return { layout: { version: 1, parts }, dropped: list.length - parts.length };
}

/** A stored bench pose: finite coordinates within the table, a quarter-turn count. */
export function sanitizePose(v: unknown): BenchPose | undefined {
  if (!isObj(v) || !num(v.x) || !num(v.z) || !num(v.rot)) return undefined;
  if (Math.abs(v.x) > 200 || Math.abs(v.z) > 200) return undefined;
  return { x: v.x, z: v.z, rot: ((Math.round(v.rot) % 4) + 4) % 4 };
}

export const isBoolRecord = (v: unknown): v is Record<string, boolean> => isObj(v) && Object.values(v).every((x) => typeof x === 'boolean');

/** `{ [k]: boolean }` with non-boolean entries dropped */
export function boolRecord(v: unknown): Record<string, boolean> | undefined {
  if (!isObj(v)) return undefined;
  return Object.fromEntries(Object.entries(v).filter(([, x]) => typeof x === 'boolean')) as Record<string, boolean>;
}

/** `{ [problem]: { [question]: boolean } }` with malformed entries dropped */
export function boolRecordMap(v: unknown): Record<string, Record<string, boolean>> | undefined {
  if (!isObj(v)) return undefined;
  const out: Record<string, Record<string, boolean>> = {};
  for (const [k, x] of Object.entries(v)) {
    const r = boolRecord(x);
    if (r) out[k] = r;
  }
  return out;
}

/** Measurement-question answers per challenge (`{ [challengeId]: { passed?, answers } }`):
 *  well-typed fields only, short strings, malformed entries dropped. */
export function sanitizeReadings(v: unknown): Record<string, ChallengeReadings> | undefined {
  if (!isObj(v)) return undefined;
  const str = (x: unknown) => (typeof x === 'string' && x.length <= 200 ? x : undefined);
  const out: Record<string, ChallengeReadings> = {};
  for (const [id, r] of Object.entries(v)) {
    if (!isObj(r) || !isObj(r.answers)) continue;
    const answers: Record<string, ReadingAnswer> = {};
    for (const [q, a] of Object.entries(r.answers)) {
      if (!isObj(a)) continue;
      const x: ReadingAnswer = {};
      if (str(a.predict) !== undefined) x.predict = a.predict as string;
      if (str(a.input) !== undefined) x.input = a.input as string;
      if (str(a.key) !== undefined) x.key = a.key as string;
      if (num(a.choice) && Number.isInteger(a.choice) && a.choice >= 0) x.choice = a.choice;
      if (typeof a.ok === 'boolean') x.ok = a.ok;
      if (a.stale === true) x.stale = true;
      if (num(a.tries) && a.tries >= 0) x.tries = Math.floor(a.tries);
      answers[q] = x;
    }
    out[id] = { answers, ...(str(r.passed) !== undefined ? { passed: r.passed as string } : {}) };
  }
  return out;
}

const scale = (v: unknown) => (v === null ? null : num(v) && v > 0 ? v : undefined);

/** Oscilloscope panel settings: only well-typed fields are kept. */
export function sanitizeScope(v: unknown): Record<string, unknown> | undefined {
  if (!isObj(v)) return undefined;
  const out: Record<string, unknown> = {};
  if (typeof v.collapsed === 'boolean') out.collapsed = v.collapsed;
  const t = scale(v.tdiv);
  if (t !== undefined) out.tdiv = t;
  if (isObj(v.vdiv)) {
    const a = scale(v.vdiv[1]);
    const b = scale(v.vdiv[2]);
    out.vdiv = { 1: a ?? null, 2: b ?? null };
  }
  if (isObj(v.drag) && num(v.drag.x) && num(v.drag.y)) out.drag = { x: v.drag.x, y: v.drag.y };
  return out;
}

/* ------------------------------------------------------------------ storage access */

const pending = new Map<string, unknown>();
let timer: ReturnType<typeof setTimeout> | null = null;

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Read and validate a stored JSON value. `check` returns the cleaned value, or undefined when
 *  it is unusable — then the key is removed and `fallback` returned. Pending (debounced) writes
 *  are seen first. */
export function readStored<T>(key: string, fallback: T, check: (v: unknown) => T | undefined): T {
  if (pending.has(key)) return (check(pending.get(key)) ?? fallback) as T;
  const ls = storage();
  if (!ls) return fallback;
  let text: string | null;
  try {
    text = ls.getItem(key);
  } catch {
    return fallback;
  }
  if (text === null) return fallback;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = undefined;
  }
  const v = parsed === undefined ? undefined : check(parsed);
  if (v === undefined) {
    console.warn(`[breadboard-lab] ignoring unreadable saved data "${key}"`);
    try {
      ls.removeItem(key);
    } catch {
      /* ignore */
    }
    return fallback;
  }
  return v;
}

/** Write now. Returns false when storage is unavailable or full. */
export function writeStored(key: string, value: unknown): boolean {
  pending.delete(key);
  const ls = storage();
  if (!ls) return false;
  try {
    ls.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Write soon: rapid updates (a slider drag) collapse into one write. */
export function writeStoredLater(key: string, value: unknown, ms = 400) {
  pending.set(key, value);
  if (timer) return;
  timer = setTimeout(flushStored, ms);
}

export function flushStored() {
  if (timer) clearTimeout(timer);
  timer = null;
  for (const [k, v] of [...pending]) writeStored(k, v);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushStored);
  window.addEventListener('beforeunload', flushStored);
}

/** Every key this app stores starts with this. */
export const STORAGE_PREFIX = 'bb.';

/** Remove all saved data of this app (the ErrorBoundary's reset). `filter` limits it to some keys. */
export function clearStored(filter: (key: string) => boolean = () => true) {
  pending.clear();
  if (timer) clearTimeout(timer);
  timer = null;
  const ls = storage();
  if (!ls) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (k && k.startsWith(STORAGE_PREFIX) && filter(k)) keys.push(k);
    }
    for (const k of keys) ls.removeItem(k);
  } catch {
    /* ignore */
  }
}
