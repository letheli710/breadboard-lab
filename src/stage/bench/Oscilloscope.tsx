// The one 双通道示波器 of every bench (after W4-L8): a light grey box with a dark front panel, a
// 10 × 8 division screen, four knobs, the CH1 / CH2 BNC jacks, and the probes on the board.
//
// The screen is ONE canvas texture (scopeCanvas.ts): graticule, ground and trigger markers, cursors
// and up to three traces are painted into a 2D canvas, which is uploaded only when what it shows
// changes (a fingerprint of the traces in divisions), then `invalidate()` asks for one new frame.
// That keeps it sharp (1024 px across a 14.5-unit screen, mip-mapped when far away), cheap (one
// textured quad, no per-frame work, no line geometry rebuilt on every render) and correct under
// `frameloop="demand"`. The settings line above the graticule is DOM text (Html), so it stays
// legible at phone width.

import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { BENCH_NAMES } from '../benchNames';
import { fmtTdiv, fmtVdiv, signed } from './format';
import { frontDir, toWorld, type BoardPoint, type Placement, type V3 } from './geometry';
import { AMBER, hoverHandlers, NameTag, ProbeLead, useAnyLit } from './parts';
import { CANVAS_W, drawScreen, SCREEN_BG, type ScreenSpec } from './scopeCanvas';
import { divsKey, DIVS_X, traceDivs, tToDiv, vToDiv, type TimeBase, type TraceSource } from './trace';

export const SCOPE_SIZE = { w: 24, h: 13.5, d: 7 };
/** the screen on the front panel (local x of its centre, y of its centre over the bench, size) */
export const SCOPE_SCREEN = { x: -3.2, y: 7.3, w: 14.5, h: 9.2 };

export type ScopeKey = 'ch1' | 'ch2' | 'math';

/** trace colours on the screen: CH1 amber, CH2 teal, MATH violet */
export const TRACE_COLORS: Record<ScopeKey, string> = { ch1: '#fbbf24', ch2: '#2dd4bf', math: '#a78bfa' };
/** jack / probe ring colours */
export const PROBE_COLORS: Record<'ch1' | 'ch2', string> = { ch1: '#eab308', ch2: '#0e9fb5' };

export interface ScopeChannel {
  /** v(t) in volts, or sampled [t, v] points */
  data: TraceSource;
  /** V/div */
  vdiv: number;
  /** where 0 V sits, in divisions above the centre (default 0) */
  pos?: number;
  /** trace colour (default TRACE_COLORS) */
  color?: string;
  /** false hides the trace (the probe stays) */
  on?: boolean;
  /** the settings-line text (default "CH1 2 V/div") */
  label?: string;
  /** line width in canvas px (default 6; the screen is 1024 px across) */
  width?: number;
}

export interface ScopeTrigger {
  source: 'ch1' | 'ch2';
  /** V */
  level: number;
  edge?: 'rise' | 'fall';
  /** the trigger time, s (default 0) */
  at?: number;
  /** the settings-line text (default "Trig ↑ CH1 +2.50 V") */
  label?: string;
}

export type ScopeCursor =
  { kind: 't'; at: number; label?: string; color?: string; dashed?: boolean } | { kind: 'v'; ch: ScopeKey; at: number; label?: string; color?: string; dashed?: boolean };

export interface OsdItem {
  text: string;
  /** colour: a channel's trace colour, 'warn' (rose), 'ok' (green, e.g. 谐振锁定 / TRIG'D) or 'muted' (grey) */
  tone?: ScopeKey | 'warn' | 'ok' | 'muted';
  /** hidden on narrow screens (≤ 960 px), like the automatic settings */
  minor?: boolean;
}

export interface ScopeProbe {
  /** the hole the probe hook sits in */
  tip: BoardPoint;
  /** the ground clip: a board point (on a stub wire) or a world point; omitted: no ground lead */
  ground?: BoardPoint | V3;
  /** hover / lit id of the probe (default `${id}_ch1`) */
  id?: string;
  /** hover / lit id of the ground lead (default `${probe id}_gnd`) */
  groundId?: string;
  /** more ids that light the probe / the ground lead (e.g. the node it measures) */
  litIds?: string[];
  groundLitIds?: string[];
  /** the ground clip is in the wrong place: painted red */
  groundBad?: boolean;
  /** probe ring / jack colour (default PROBE_COLORS) */
  color?: string;
}

export interface OscilloscopeProps extends Placement {
  id: string;
  ch1?: ScopeChannel;
  ch2?: ScopeChannel;
  /** a computed trace (e.g. CH1 − CH2), no probe */
  math?: ScopeChannel;
  /** s/div and the time at the left edge; `label` replaces the settings-line text */
  time: TimeBase & { label?: string };
  trigger?: ScopeTrigger;
  cursors?: ScopeCursor[];
  /** items appended to the settings line (measurements, warnings) */
  osd?: OsdItem[];
  /** false: only `osd` on the settings line (no automatic V/div, s/div, trigger) */
  autoOsd?: boolean;
  probes?: { ch1?: ScopeProbe; ch2?: ScopeProbe };
  /** 0 … 1: how much of the sweep is drawn (a single shot running across), default 1 */
  progress?: number;
  /** samples per function trace (default 800) */
  samples?: number;
  /** the floating name (default BENCH_NAMES.scope) */
  label?: string;
  /** the settings line at the top of the screen (default) or at the bottom */
  osdAt?: 'top' | 'bottom';
  /** lean the scope back (radians, e.g. 0.2); probes and the settings line follow */
  tilt?: number;
  litIds?: string[];
  hoverIds?: string[];
}

const KEYS: ScopeKey[] = ['ch1', 'ch2', 'math'];
const MARK: Record<ScopeKey, string> = { ch1: '1', ch2: '2', math: 'M' };
const NAME: Record<ScopeKey, string> = { ch1: 'CH1', ch2: 'CH2', math: 'MATH' };

/** The pure part: what the screen shows, in divisions, and the automatic settings line. */
export function scopeScreen(p: Pick<OscilloscopeProps, 'ch1' | 'ch2' | 'math' | 'time' | 'trigger' | 'cursors' | 'progress' | 'samples'>): {
  spec: ScreenSpec;
  key: string;
  osd: OsdItem[];
} {
  const traces: ScreenSpec['traces'] = [];
  const osd: OsdItem[] = [];
  const keys: string[] = [];
  for (const k of KEYS) {
    const c = p[k];
    if (!c) continue;
    const color = c.color ?? TRACE_COLORS[k];
    osd.push({ text: c.label ?? `${NAME[k]} ${fmtVdiv(c.vdiv)}`, tone: k, minor: true });
    if (c.on === false) continue;
    const divs = traceDivs(c.data, p.time, c, p.samples);
    keys.push(`${k}${color}${c.width ?? 6}${c.pos ?? 0}${divsKey(divs)}`);
    traces.push({ divs, color, width: c.width ?? 6, marker: MARK[k], zero: c.pos ?? 0 });
  }
  osd.push({ text: p.time.label ?? fmtTdiv(p.time.div), minor: true });
  let trigger: ScreenSpec['trigger'];
  if (p.trigger) {
    const src = p[p.trigger.source];
    const t = p.trigger;
    trigger = { level: src ? vToDiv(t.level, src) : null, at: tToDiv(t.at ?? 0, p.time), color: src?.color ?? TRACE_COLORS[t.source] };
    osd.push({ text: t.label ?? `Trig ${t.edge === 'fall' ? '↓' : '↑'} ${NAME[t.source]} ${signed(t.level)} V`, minor: true });
  }
  const cursors: ScreenSpec['cursors'] = (p.cursors ?? []).map((c) => {
    const color = c.color ?? (c.kind === 'v' ? (p[c.ch]?.color ?? TRACE_COLORS[c.ch]) : '#e2e8f0');
    const at = c.kind === 't' ? tToDiv(c.at, p.time) : p[c.ch] ? vToDiv(c.at, p[c.ch]!) : 0;
    return { kind: c.kind, at, color, label: c.label, dashed: c.dashed ?? true };
  });
  const progress = p.progress ?? 1;
  const key = [...keys, JSON.stringify(trigger ?? null), JSON.stringify(cursors), progress.toFixed(3), DIVS_X].join('|');
  return { spec: { traces, trigger, cursors, progress }, key, osd };
}

function Screen({ spec, drawKey }: { spec: ScreenSpec; drawKey: string }) {
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);
  const { w, h } = SCOPE_SCREEN;
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = CANVAS_W;
    c.height = Math.round((CANVAS_W * h) / w);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return t;
  }, [w, h, gl]);
  useEffect(() => () => tex.dispose(), [tex]);
  const latest = useRef(spec);
  latest.current = spec;
  useEffect(() => {
    const g = (tex.image as HTMLCanvasElement).getContext('2d');
    if (!g) return;
    drawScreen(g, latest.current);
    tex.needsUpdate = true;
    invalidate();
  }, [drawKey, tex, invalidate]);
  const { d } = SCOPE_SIZE;
  return (
    <>
      <mesh position={[SCOPE_SCREEN.x, SCOPE_SCREEN.y, d / 2 + 0.02]}>
        <planeGeometry args={[w + 0.4, h + 0.4]} />
        <meshBasicMaterial color={SCREEN_BG} />
      </mesh>
      <mesh position={[SCOPE_SCREEN.x, SCOPE_SCREEN.y, d / 2 + 0.03]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </>
  );
}

function Probe({ pl, scopeId, ch, probe, color }: { pl: Placement; scopeId: string; ch: 'ch1' | 'ch2'; probe: ScopeProbe; color: string }) {
  const id = probe.id ?? `${scopeId}_${ch}`;
  const groundId = probe.groundId ?? `${id}_gnd`;
  const lit = useAnyLit([id, ...(probe.litIds ?? [])]);
  const groundLit = useAnyLit([groundId, ...(probe.groundLitIds ?? [])]);
  const jack = toWorld(pl, [ch === 'ch1' ? 6.6 : 9.2, 1.6, SCOPE_SIZE.d / 2 + 0.3]);
  return (
    <ProbeLead
      jack={jack}
      out={frontDir(pl)}
      tip={probe.tip}
      color={color}
      id={id}
      lit={lit}
      ground={probe.ground}
      groundId={groundId}
      groundLit={groundLit}
      groundBad={probe.groundBad}
    />
  );
}

export function Oscilloscope(p: OscilloscopeProps) {
  const { w, h, d } = SCOPE_SIZE;
  const pl: Placement = { position: p.position, yaw: p.yaw, scale: p.scale, tilt: p.tilt, tiltPivotZ: d / 2 };
  const lit = useAnyLit([p.id, ...(p.litIds ?? [])]);
  const { spec, key, osd } = useMemo(
    () => scopeScreen({ ch1: p.ch1, ch2: p.ch2, math: p.math, time: p.time, trigger: p.trigger, cursors: p.cursors, progress: p.progress, samples: p.samples }),
    [p.ch1, p.ch2, p.math, p.time, p.trigger, p.cursors, p.progress, p.samples],
  );
  const items = [...(p.autoOsd === false ? [] : osd), ...(p.osd ?? [])];
  const toneColor = (t?: OsdItem['tone']) => (t === 'warn' ? '#fda4af' : t === 'ok' ? '#86efac' : t === 'muted' ? '#9ca3af' : t ? (p[t]?.color ?? TRACE_COLORS[t]) : undefined);
  const osdY = p.osdAt === 'bottom' ? SCOPE_SCREEN.y - SCOPE_SCREEN.h / 2 + 0.5 : SCOPE_SCREEN.y + SCOPE_SCREEN.h / 2 - 0.5;
  const s = pl.scale ?? 1;
  const probeColor = (ch: 'ch1' | 'ch2') => p.probes?.[ch]?.color ?? PROBE_COLORS[ch];
  return (
    <group name="bench_oscilloscope">
      <group position={toWorld({ ...pl, tilt: 0 }, [0, 0, 0])} rotation={[0, pl.yaw ?? 0, 0]} scale={s} {...hoverHandlers(p.hoverIds ?? [p.id])}>
        <group position={[0, 0, d / 2]} rotation={[-(p.tilt ?? 0), 0, 0]}>
          <group position={[0, 0, -d / 2]}>
            <mesh position={[0, h / 2, 0]}>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial color="#cfd5dd" roughness={0.55} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.25 : 0} />
            </mesh>
            <mesh position={[0, h / 2, d / 2 + 0.01]}>
              <planeGeometry args={[w - 0.6, h - 0.6]} />
              <meshStandardMaterial color="#3b4250" roughness={0.7} />
            </mesh>
            {[
              [6.6, 10.4],
              [9.2, 10.4],
              [6.6, 7.2],
              [9.2, 7.2],
            ].map(([x, y], i) => (
              <mesh key={i} position={[x, y, d / 2 + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.6, 0.6, 0.5, 20]} />
                <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
              </mesh>
            ))}
            {(['ch1', 'ch2'] as const).map((k) => (
              <mesh key={k} position={[k === 'ch1' ? 6.6 : 9.2, 1.6, d / 2 + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.45, 0.45, 0.6, 16]} />
                <meshStandardMaterial color={probeColor(k)} metalness={0.5} roughness={0.3} />
              </mesh>
            ))}
            <Screen spec={spec} drawKey={key} />
          </group>
        </group>
      </group>
      {p.probes?.ch1 && <Probe pl={pl} scopeId={p.id} ch="ch1" probe={p.probes.ch1} color={probeColor('ch1')} />}
      {p.probes?.ch2 && <Probe pl={pl} scopeId={p.id} ch="ch2" probe={p.probes.ch2} color={probeColor('ch2')} />}
      {items.length > 0 && (
        <Html position={toWorld(pl, [SCOPE_SCREEN.x, osdY, d / 2 + 0.1])} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bench-osd" style={s < 0.98 ? { transform: `scale(${Math.max(0.6, s)})` } : undefined}>
            {items.map((it, i) => (
              <span key={i} className={it.minor ? 'minor' : ''} style={{ color: toneColor(it.tone) }}>
                {it.text}
              </span>
            ))}
          </div>
        </Html>
      )}
      <NameTag position={toWorld(pl, [0, h + 1.6, -d / 2])} text={p.label ?? BENCH_NAMES.scope} tone="scope" lit={lit} />
    </group>
  );
}
