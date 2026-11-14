import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseChallenge } from '../core/challenge';
import { derive, deriveAc, pinReadout } from './derived';

// lesson 16: GPIO2 PWM 25 % → 330 Ω → red LED. The DC model puts duty × 3.3 V behind 25 Ω (0.82 V,
// below the LED's 1.8 V: 0 mA); the pin list must show what the multimeter and the readings use.
describe('dev-board pin readout under PWM', () => {
  const ch = parseChallenge(JSON.parse(readFileSync(new URL('../../challenges/108-lesson-mcu-pwm-adc.json', import.meta.url), 'utf8'))).challenge!;
  const layout = ch.solution!;
  const base = derive(layout);
  const dc = base.sim.mcus.get('U1')!.pins.get('GPIO2')!;

  it('the DC model alone would show no LED current', () => expect(Math.abs(dc.current)).toBeLessThan(1e-4));

  it('shows the time-domain averages, marked as averages', () => {
    const r = pinReadout({ ac: deriveAc(layout) }, 'U1', 'GPIO2', dc);
    expect(r.averaged).toBe(true);
    expect(r.voltage).toBeGreaterThan(0.77);
    expect(r.voltage).toBeLessThan(0.83);
    expect(r.current).toBeGreaterThan(0.00095);
    expect(r.current).toBeLessThan(0.00109);
  });

  it('falls back to the DC values without a time-domain result', () => {
    expect(pinReadout({ ac: null }, 'U1', 'GPIO2', dc)).toEqual({ voltage: dc.voltage, current: dc.current, averaged: false });
  });
});
