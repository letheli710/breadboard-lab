import confetti from 'canvas-confetti';

let fire: confetti.CreateTypes | null = null;
/** The confetti canvas: decorative, hidden from assistive technology (the dialog says it all). */
function shooter() {
  if (fire) return fire;
  const c = document.createElement('canvas');
  c.setAttribute('aria-hidden', 'true');
  c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:200';
  document.body.appendChild(c);
  fire = confetti.create(c, { resize: true, disableForReducedMotion: true });
  return fire;
}

/** Confetti burst (none with reduced motion) + a short major arpeggio. */
export function celebrate() {
  const colors = ['#2ba59b', '#f2c14e', '#e63946', '#1f2a44', '#f4a261'];
  const confetti = shooter();
  confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors });
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 }, colors }), 250);
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 }, colors }), 400);
  try {
    const ctx = new AudioContext();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.11;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.4);
    });
  } catch {
    /* audio not available */
  }
}
