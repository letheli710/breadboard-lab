// Moving charge along a wire: a dotted stroke whose dots advance along the path at a speed
// proportional to the branch current (negative current: they run against the path, i.e. against
// the reference arrow). Every path of a scene uses the same dot spacing and the same px-per-ampere
// scale, so the dots arriving at a node per second equal the dots leaving it — the animation obeys
// KCL. One shared animation-frame loop drives all flows; with prefers-reduced-motion the dots
// stand still (the arrows and numbers still tell the direction).

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';

/** spacing of the dots along a path, in SVG units (stroke-dasharray "0 GAP") */
export const DOT_GAP = 16;

interface Entry {
  el: SVGPathElement;
  rate: number; // SVG units per second, signed
  off: number;
}

const entries = new Set<Entry>();
let raf = 0;
let last = 0;

function tick(t: number) {
  const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
  last = t;
  for (const e of entries) {
    e.off = (e.off - e.rate * dt) % (DOT_GAP * 1000);
    e.el.style.strokeDashoffset = e.off.toFixed(2);
  }
  raf = entries.size ? requestAnimationFrame(tick) : 0;
  if (!raf) last = 0;
}

function start() {
  if (!raf && typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(tick);
}

/** The scale (SVG units per second per ampere) for a scene whose largest current is `maxAbs`. */
export function flowScale(maxAbs: number, top = 90, perAmp = 12): number {
  return maxAbs > 0 ? Math.min(perAmp, top / maxAbs) : perAmp;
}

export function Flow({ d, i, scale, className = '', width }: { d: string; i: number; scale: number; className?: string; width?: number }) {
  const ref = useRef<SVGPathElement>(null);
  const entry = useRef<Entry | null>(null);
  const rate = i * scale;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const e: Entry = { el, rate: 0, off: 0 };
    entry.current = e;
    entries.add(e);
    start();
    return () => {
      entries.delete(e);
      entry.current = null;
    };
  }, []);

  useEffect(() => {
    if (entry.current) entry.current.rate = rate;
  }, [rate]);

  const idle = Math.abs(i) < 1e-9;
  return (
    <path
      ref={ref}
      d={d}
      className={`kcl-flow ${idle ? 'idle' : ''} ${className}`}
      style={width ? { strokeWidth: width } : undefined}
      strokeDasharray={`0 ${DOT_GAP}`}
      aria-hidden
    />
  );
}
