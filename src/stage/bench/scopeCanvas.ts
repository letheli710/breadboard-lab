// The oscilloscope screen painted on a 2D canvas (used as one texture on the 3D scope's screen):
// graticule, ground markers, trigger markers, cursors and traces. Everything arrives already in
// divisions (trace.ts), so this file only knows pixels.

import { DIVS_X, DIVS_Y } from './trace';

export interface ScreenTrace {
  /** screen points in divisions (x 0 … 10 from the left, y −4 … +4 from the centre) */
  divs: [number, number][];
  color: string;
  /** line width in canvas px (the canvas is CANVAS_W wide) */
  width: number;
  /** the ground marker's text ('1', '2', 'M') and its height in divisions (null: off screen / none) */
  marker: string;
  zero: number | null;
}

export interface ScreenCursor {
  kind: 't' | 'v';
  /** divisions: x from the left ('t') or y from the centre ('v') */
  at: number;
  color: string;
  label?: string;
  dashed: boolean;
}

export interface ScreenSpec {
  traces: ScreenTrace[];
  /** trigger level (y, divisions) in the source's colour, and the trigger time (x, divisions) */
  trigger?: { level: number | null; at: number; color: string };
  cursors: ScreenCursor[];
  /** 0 … 1: how much of each trace is drawn, left to right (a single-shot sweep) */
  progress: number;
}

export const CANVAS_W = 1024;
export const SCREEN_BG = '#0b1a14';
const GRID = 'rgba(122, 170, 146, 0.32)';
const AXIS = 'rgba(160, 205, 182, 0.62)';

export function drawScreen(g: CanvasRenderingContext2D, s: ScreenSpec): void {
  const W = g.canvas.width;
  const H = g.canvas.height;
  const dx = W / DIVS_X;
  const dy = H / DIVS_Y;
  const X = (d: number) => d * dx;
  const Y = (d: number) => H / 2 - d * dy;
  g.save();
  g.fillStyle = SCREEN_BG;
  g.fillRect(0, 0, W, H);

  // graticule: 10 × 8 divisions, the centre axes brighter and ticked every 1/5 division
  g.lineWidth = 2;
  g.strokeStyle = GRID;
  g.beginPath();
  for (let k = 1; k < DIVS_X; k++) {
    g.moveTo(X(k), 0);
    g.lineTo(X(k), H);
  }
  for (let k = 1; k < DIVS_Y; k++) {
    g.moveTo(0, k * dy);
    g.lineTo(W, k * dy);
  }
  g.stroke();
  g.strokeStyle = AXIS;
  g.beginPath();
  g.moveTo(W / 2, 0);
  g.lineTo(W / 2, H);
  g.moveTo(0, H / 2);
  g.lineTo(W, H / 2);
  for (let k = 1; k < DIVS_X * 5; k++) {
    g.moveTo(X(k / 5), H / 2 - 7);
    g.lineTo(X(k / 5), H / 2 + 7);
  }
  for (let k = 1; k < DIVS_Y * 5; k++) {
    g.moveTo(W / 2 - 7, (k * dy) / 5);
    g.lineTo(W / 2 + 7, (k * dy) / 5);
  }
  g.stroke();
  g.strokeStyle = AXIS;
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, W - 3, H - 3);

  // cursors (under the traces)
  g.font = '700 26px ui-monospace, monospace';
  for (const c of s.cursors) {
    g.strokeStyle = c.color;
    g.fillStyle = c.color;
    g.lineWidth = 2.5;
    g.setLineDash(c.dashed ? [14, 10] : []);
    g.beginPath();
    if (c.kind === 't') {
      g.moveTo(X(c.at), 0);
      g.lineTo(X(c.at), H);
    } else {
      g.moveTo(0, Y(c.at));
      g.lineTo(W, Y(c.at));
    }
    g.stroke();
    g.setLineDash([]);
    if (c.label) {
      g.textAlign = c.kind === 't' && c.at > DIVS_X * 0.7 ? 'right' : 'left';
      if (c.kind === 't') g.fillText(c.label, X(c.at) + (g.textAlign === 'right' ? -8 : 8), H - 14);
      else g.fillText(c.label, 40, Y(c.at) - 8);
    }
  }

  // traces, with a little phosphor glow
  const lastX = DIVS_X * Math.max(0, Math.min(1, s.progress));
  g.lineJoin = 'round';
  g.lineCap = 'round';
  for (const t of s.traces) {
    if (t.divs.length < 2 || lastX <= 0) continue;
    g.strokeStyle = t.color;
    g.lineWidth = t.width;
    g.shadowColor = t.color;
    g.shadowBlur = 8;
    g.beginPath();
    let started = false;
    for (let k = 0; k < t.divs.length; k++) {
      let [x, y] = t.divs[k];
      if (x > lastX) {
        if (k === 0) break;
        // stop exactly at the sweep front
        const [px, py] = t.divs[k - 1];
        y = py + ((y - py) * (lastX - px)) / (x - px || 1);
        x = lastX;
      }
      if (started) g.lineTo(X(x), Y(y));
      else g.moveTo(X(x), Y(y));
      started = true;
      if (x >= lastX) break;
    }
    g.stroke();
    g.shadowBlur = 0;
  }

  // ground markers on the left edge, trigger markers on the right edge and the top
  g.font = '800 24px ui-monospace, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const placed: number[] = [];
  for (const t of s.traces) {
    if (t.zero === null || Math.abs(t.zero) > DIVS_Y / 2) continue;
    const y = Y(t.zero);
    // markers at the same height stand side by side
    const x0 = placed.filter((py) => Math.abs(py - y) < 32).length * 44;
    placed.push(y);
    g.fillStyle = t.color;
    g.beginPath();
    g.moveTo(x0, y - 15);
    g.lineTo(x0 + 26, y - 15);
    g.lineTo(x0 + 40, y);
    g.lineTo(x0 + 26, y + 15);
    g.lineTo(x0, y + 15);
    g.fill();
    g.fillStyle = SCREEN_BG;
    g.fillText(t.marker, x0 + 14, y + 1);
  }
  if (s.trigger) {
    g.fillStyle = s.trigger.color;
    const lv = s.trigger.level;
    if (lv !== null && Math.abs(lv) <= DIVS_Y / 2) {
      const y = Y(lv);
      g.beginPath();
      g.moveTo(W, y - 13);
      g.lineTo(W - 22, y);
      g.lineTo(W, y + 13);
      g.fill();
    }
    const at = s.trigger.at;
    if (at >= 0 && at <= DIVS_X) {
      g.fillStyle = '#fb923c';
      g.beginPath();
      g.moveTo(X(at) - 13, 0);
      g.lineTo(X(at), 20);
      g.lineTo(X(at) + 13, 0);
      g.fill();
    }
  }
  g.restore();
}
