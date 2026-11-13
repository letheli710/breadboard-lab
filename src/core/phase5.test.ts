// Phase 5 models: dev-board GPIOs, transistors, MOSFETs, relay, motor, buzzer, LDO, sensors.
import { describe, expect, it } from 'vitest';
import { ldrResistance, ntcResistance } from './devices';
import { simulate } from './solver';
import type { CComponent, Circuit, PartProps } from './types';

type Comp = [ref: string, type: CComponent['type'], props?: PartProps];

/** Build a circuit from components and nets given as lists of "REF.pin". */
export function circ(comps: Comp[], nets: string[][]): Circuit {
  return {
    components: comps.map(([ref, type, props]) => ({ ref, type, props: props ?? {} })),
    nets: nets.map((pins, i) => ({ name: `N${i + 1}`, pins })),
  };
}

const esp = (pins: PartProps['pins'] = {}, extra: PartProps = {}): Comp => ['U1', 'esp32_devkit', { usb: true, pins, ...extra }];
const stm = (pins: PartProps['pins'] = {}, extra: PartProps = {}): Comp => ['U1', 'stm32_bluepill', { usb: true, pins, ...extra }];

describe('dev board power', () => {
  it('USB powers the board: 5V pin ≈ 4.7 V, 3V3 regulated, chip running', () => {
    const s = simulate(circ([esp()], [['U1.GND']]));
    const m = s.mcus.get('U1')!;
    expect(m.running).toBe(true);
    expect(m.v3).toBeCloseTo(3.3, 1);
    expect(m.v5).toBeGreaterThan(4.5);
    expect(m.v5).toBeLessThan(4.8);
    expect(m.reg.mode).toBe('reg');
    expect(m.usbCurrent).toBeGreaterThan(0.04);
    expect(m.powerLed).toBe(true);
  });

  it('without USB or any supply the chip is off', () => {
    const s = simulate(circ([esp({ GPIO2: { mode: 'out_high' } }, { usb: false }), ['R1', 'resistor', { resistance: 1000 }]], [['U1.GPIO2', 'R1.1'], ['R1.2', 'U1.GND']]));
    const m = s.mcus.get('U1')!;
    expect(m.running).toBe(false);
    expect(Math.abs(m.pins.get('GPIO2')!.voltage)).toBeLessThan(0.01);
  });

  it('a bench supply on the 5V pin powers the board when USB is unplugged', () => {
    const s = simulate(circ([['PSU1', 'bench_supply', { voltage: 5, currentLimit: 1 }], esp({}, { usb: false })], [['PSU1.+', 'U1.5V'], ['PSU1.-', 'U1.GND']]));
    expect(s.mcus.get('U1')!.running).toBe(true);
    expect(s.mcus.get('U1')!.v3).toBeCloseTo(3.3, 1);
  });

  it('the 3V3 pin powers the breadboard; overload pulls the onboard regulator into current limit', () => {
    const ok = simulate(circ([esp(), ['R1', 'resistor', { resistance: 33 }]], [['U1.3V3', 'R1.1'], ['R1.2', 'U1.GND']]));
    expect(ok.mcus.get('U1')!.i3v3Out).toBeCloseTo(0.1, 2);
    const blue = simulate(circ([stm(), ['R1', 'resistor', { resistance: 5 }]], [['U1.3V3', 'R1.1'], ['R1.2', 'U1.GND']]));
    const m = blue.mcus.get('U1')!;
    expect(m.reg.mode).toBe('limit');
    expect(m.v3).toBeLessThan(2);
    expect(m.running).toBe(false);
  });
});

describe('GPIO outputs', () => {
  it('GPIO → 220 Ω → LED → GND lights the LED at ≈ 5.8 mA', () => {
    const s = simulate(
      circ([esp({ GPIO2: { mode: 'out_high' } }), ['R1', 'resistor', { resistance: 220 }], ['LED1', 'led', { color: 'red' }]], [['U1.GPIO2', 'R1.1'], ['R1.2', 'LED1.anode'], ['LED1.cathode', 'U1.GND']]),
    );
    const p = s.mcus.get('U1')!.pins.get('GPIO2')!;
    expect(s.leds.get('LED1')!.on).toBe(true);
    expect(p.current).toBeCloseTo(0.0058, 3);
    expect(p.overcurrent).toBe(false);
    expect(p.logic).toBe('high');
  });

  it('out_low turns it off; current limit: warning above 20 mA, damage above 40 mA', () => {
    const led = (pins: PartProps['pins'], r: number) =>
      simulate(circ([esp(pins), ['R1', 'resistor', { resistance: r }], ['LED1', 'led', {}]], [['U1.GPIO2', 'R1.1'], ['R1.2', 'LED1.anode'], ['LED1.cathode', 'U1.GND']]));
    expect(led({ GPIO2: { mode: 'out_low' } }, 220).leds.get('LED1')!.on).toBe(false);
    const hot = led({ GPIO2: { mode: 'out_high' } }, 22).mcus.get('U1')!.pins.get('GPIO2')!;
    expect(hot.current).toBeGreaterThan(0.02);
    expect(hot.overcurrent).toBe(true);
    expect(hot.damaged).toBe(false);
    const short = simulate(circ([esp({ GPIO2: { mode: 'out_high' } })], [['U1.GPIO2', 'U1.GND']])).mcus.get('U1')!.pins.get('GPIO2')!;
    expect(short.current).toBeGreaterThan(0.1);
    expect(short.damaged).toBe(true);
  });

  it('STM32 pins are weaker (40 Ω, 25 mA abs max)', () => {
    const s = simulate(circ([stm({ PB12: { mode: 'out_low' } }), ['R1', 'resistor', { resistance: 100 }]], [['U1.3V3', 'R1.1'], ['R1.2', 'U1.PB12']]));
    const p = s.mcus.get('U1')!.pins.get('PB12')!;
    expect(p.current).toBeCloseTo(-3.3 / 140, 3);
    expect(p.overcurrent).toBe(true);
    expect(p.damaged).toBe(false);
  });

  it('two outputs fighting: one high, one low', () => {
    const s = simulate(circ([esp({ GPIO2: { mode: 'out_high' }, GPIO4: { mode: 'out_low' } })], [['U1.GPIO2', 'U1.GPIO4']]));
    const p = s.mcus.get('U1')!.pins;
    expect(p.get('GPIO2')!.current).toBeGreaterThan(0.05);
    expect(p.get('GPIO2')!.damaged).toBe(true);
  });

  it('Blue Pill onboard LED on PC13 lights when the pin is low', () => {
    expect(simulate(circ([stm({ PC13: { mode: 'out_low' } })], [['U1.GND']])).mcus.get('U1')!.userLed).toBe(true);
    expect(simulate(circ([stm({ PC13: { mode: 'out_high' } })], [['U1.GND']])).mcus.get('U1')!.userLed).toBe(false);
  });
});

describe('GPIO inputs', () => {
  const button = (mode: 'input' | 'input_pullup' | 'input_pulldown', pressed: boolean, type: 'esp' | 'stm' = 'esp') =>
    simulate(
      circ(
        [type === 'esp' ? esp({ GPIO4: { mode } }) : stm({ PB4: { mode } }), ['SW1', 'pushbutton', { pressed }]],
        [[type === 'esp' ? 'U1.GPIO4' : 'U1.PB4', 'SW1.1'], ['SW1.2', 'U1.GND']],
      ),
    ).mcus.get('U1')!.pins.get(type === 'esp' ? 'GPIO4' : 'PB4')!;

  it('button to GND with the internal pull-up reads HIGH released, LOW pressed', () => {
    expect(button('input_pullup', false).logic).toBe('high');
    expect(button('input_pullup', true).logic).toBe('low');
    expect(button('input_pullup', true).current).toBeCloseTo(3.3 / 45e3, 6);
    expect(button('input_pullup', false, 'stm').logic).toBe('high');
  });

  it('without a pull resistor a released button leaves the input floating', () => {
    expect(button('input', false).logic).toBe('floating');
    expect(button('input', true).logic).toBe('low');
    expect(button('input_pulldown', false).logic).toBe('low');
  });

  it('an external 10 kΩ pull-up defines the input', () => {
    const s = simulate(circ([esp({ GPIO34: { mode: 'input' } }), ['R1', 'resistor', { resistance: 10e3 }]], [['U1.3V3', 'R1.1'], ['R1.2', 'U1.GPIO34']]));
    expect(s.mcus.get('U1')!.pins.get('GPIO34')!.logic).toBe('high');
  });

  it('input-only pins have no pull-up: GPIO34 + input_pullup still floats', () => {
    const s = simulate(circ([esp({ GPIO34: { mode: 'input_pullup' } }), ['SW1', 'pushbutton', { pressed: false }]], [['U1.GPIO34', 'SW1.1'], ['SW1.2', 'U1.GND']]));
    expect(s.mcus.get('U1')!.pins.get('GPIO34')!.logic).toBe('floating');
  });

  it('a voltage between VIL and VIH reads "undefined"', () => {
    const s = simulate(circ([esp({ GPIO4: { mode: 'input' } }), ['R1', 'resistor', { resistance: 10e3 }], ['R2', 'resistor', { resistance: 10e3 }]], [['U1.3V3', 'R1.1'], ['R1.2', 'R2.1', 'U1.GPIO4'], ['R2.2', 'U1.GND']]));
    expect(s.mcus.get('U1')!.pins.get('GPIO4')!.logic).toBe('undefined');
  });

  it('ADC: a 10k/10k divider from 3V3 reads ≈ 1.65 V ≈ 2048', () => {
    const s = simulate(circ([esp({ GPIO34: { mode: 'adc' } }), ['R1', 'resistor', { resistance: 10e3 }], ['R2', 'resistor', { resistance: 10e3 }]], [['U1.3V3', 'R1.1'], ['R1.2', 'R2.1', 'U1.GPIO34'], ['R2.2', 'U1.GND']]));
    const adc = s.mcus.get('U1')!.pins.get('GPIO34')!.adc!;
    expect(adc.volts).toBeCloseTo(1.65, 2);
    expect(Math.abs(adc.raw - 2048)).toBeLessThan(8);
  });

  it('5 V into a non-tolerant pin: clamp diode conducts (warning), direct 5 V damages it; FT pins are fine', () => {
    const five = (board: Comp, pin: string, r: number | null) =>
      simulate(
        circ(
          [['PSU1', 'bench_supply', { voltage: 5, currentLimit: 1 }], board, ...(r ? [['R1', 'resistor', { resistance: r }] as Comp] : [])],
          r ? [['PSU1.+', 'R1.1'], ['R1.2', `U1.${pin}`], ['PSU1.-', 'U1.GND']] : [['PSU1.+', `U1.${pin}`], ['PSU1.-', 'U1.GND']],
        ),
      ).mcus.get('U1')!.pins.get(pin)!;
    const viaR = five(esp({ GPIO4: { mode: 'input' } }), 'GPIO4', 1000);
    expect(viaR.overvoltage).toBe(true);
    expect(viaR.clamp).toBeGreaterThan(0.0005);
    expect(viaR.damaged).toBe(false);
    expect(five(esp({ GPIO4: { mode: 'input' } }), 'GPIO4', null).damaged).toBe(true);
    const ft = five(stm({ PA8: { mode: 'input' } }), 'PA8', null);
    expect(ft.overvoltage).toBe(false);
    expect(ft.clamp).toBeLessThan(1e-6);
    expect(ft.logic).toBe('high');
    expect(five(stm({ PA0: { mode: 'input' } }), 'PA0', 1000).overvoltage).toBe(true);
  });
});

describe('transistors', () => {
  const npnLed = (mode: 'out_high' | 'out_low', rb = 1000) =>
    simulate(
      circ(
        [esp({ GPIO2: { mode } }), ['RB', 'resistor', { resistance: rb }], ['Q1', 'npn'], ['RC', 'resistor', { resistance: 220 }], ['LED1', 'led', {}]],
        [['U1.GPIO2', 'RB.1'], ['RB.2', 'Q1.b'], ['U1.5V', 'RC.1'], ['RC.2', 'LED1.anode'], ['LED1.cathode', 'Q1.c'], ['Q1.e', 'U1.GND']],
      ),
    );

  it('NPN saturates and lights an LED from 5 V; GPIO low → cut-off', () => {
    const on = npnLed('out_high');
    const q = on.bjts.get('Q1')!;
    expect(q.region).toBe('saturation');
    expect(q.vce).toBeLessThan(0.25);
    expect(q.vbe).toBeGreaterThan(0.6);
    expect(q.ib).toBeCloseTo((3.3 - 0.69) / 1025, 4);
    expect(on.leds.get('LED1')!.current).toBeGreaterThan(0.010);
    const off = npnLed('out_low');
    expect(off.bjts.get('Q1')!.region).toBe('cutoff');
    expect(off.leds.get('LED1')!.on).toBe(false);
  });

  it('NPN with a huge base resistor is in the active region: Ic = β·Ib', () => {
    const s = npnLed('out_high', 1e6);
    const q = s.bjts.get('Q1')!;
    expect(q.region).toBe('active');
    expect(q.ic / q.ib).toBeCloseTo(150, 0);
  });

  it('NPN drives a 5 V relay coil; the contact closes', () => {
    const s = simulate(
      circ(
        [esp({ GPIO2: { mode: 'out_high' } }), ['RB', 'resistor', { resistance: 1000 }], ['Q1', 'npn'], ['K1', 'relay'], ['D1', 'diode']],
        [['U1.GPIO2', 'RB.1'], ['RB.2', 'Q1.b'], ['U1.5V', 'K1.coil1', 'D1.cathode'], ['K1.coil2', 'D1.anode', 'Q1.c'], ['Q1.e', 'U1.GND']],
      ),
    );
    expect(s.relays.get('K1')!.energized).toBe(true);
    expect(s.relays.get('K1')!.coilCurrent).toBeGreaterThan(0.06);
    expect(s.bjts.get('Q1')!.region).toBe('saturation');
    expect(s.leds.get('D1')!.on).toBe(false);
  });

  it('a GPIO alone cannot pull in a 5 V relay', () => {
    const s = simulate(circ([esp({ GPIO2: { mode: 'out_high' } }), ['K1', 'relay']], [['U1.GPIO2', 'K1.coil1'], ['K1.coil2', 'U1.GND']]));
    expect(s.relays.get('K1')!.energized).toBe(false);
    expect(s.mcus.get('U1')!.pins.get('GPIO2')!.overcurrent).toBe(true);
  });

  const mosMotor = (mode: 'out_high' | 'out_low', model: 'IRLZ44N' | 'IRF540N' = 'IRLZ44N') =>
    simulate(
      circ(
        [['PSU1', 'bench_supply', { voltage: 5, currentLimit: 3 }], esp({ GPIO2: { mode } }), ['RG', 'resistor', { resistance: 100 }], ['RPD', 'resistor', { resistance: 10e3 }], ['Q1', 'nmos', { model }], ['M1', 'motor'], ['D1', 'diode']],
        [['PSU1.+', 'M1.+', 'D1.cathode'], ['M1.-', 'D1.anode', 'Q1.d'], ['U1.GPIO2', 'RG.1'], ['RG.2', 'Q1.g', 'RPD.1'], ['RPD.2', 'Q1.s', 'PSU1.-', 'U1.GND']],
      ),
    );

  it('logic-level MOSFET switches a motor fully on from 3.3 V', () => {
    const on = mosMotor('out_high');
    const q = on.mosfets.get('Q1')!;
    expect(q.region).toBe('ohmic');
    expect(q.vds).toBeLessThan(0.05);
    expect(on.motors.get('M1')!.running).toBe(true);
    expect(on.motors.get('M1')!.current).toBeGreaterThan(0.6);
    expect(on.mcus.get('U1')!.pins.get('GPIO2')!.current).toBeLessThan(0.0004); // only the 10 kΩ pull-down
    const off = mosMotor('out_low');
    expect(off.mosfets.get('Q1')!.region).toBe('off');
    expect(off.motors.get('M1')!.running).toBe(false);
  });

  it('a standard-level MOSFET is barely on at 3.3 V (saturation, little current, hot)', () => {
    const s = mosMotor('out_high', 'IRF540N');
    const q = s.mosfets.get('Q1')!;
    expect(q.region).toBe('saturation');
    expect(q.id).toBeLessThan(0.2);
    expect(q.power).toBeGreaterThan(0.3);
  });

  it('MOSFET gate without a pull-down floats', () => {
    const s = simulate(circ([['PSU1', 'bench_supply', { voltage: 5 }], ['Q1', 'nmos'], ['R1', 'resistor', { resistance: 100 }]], [['PSU1.+', 'R1.1'], ['R1.2', 'Q1.d'], ['Q1.s', 'PSU1.-'], ['Q1.g']]));
    expect(s.mosfets.get('Q1')!.gateFloating).toBe(true);
  });
});

describe('LDO, buzzer, sensors', () => {
  const ldo = (vin: number, rload: number) =>
    simulate(circ([['PSU1', 'bench_supply', { voltage: vin, currentLimit: 3 }], ['U2', 'ldo'], ['RL', 'resistor', { resistance: rload }]], [['PSU1.+', 'U2.in'], ['U2.out', 'RL.1'], ['RL.2', 'U2.gnd', 'PSU1.-']])).regs.get('U2')!;

  it('regulates 3.3 V, drops out below Vin ≈ 4.4 V, current-limits at 800 mA', () => {
    expect(ldo(5, 100).mode).toBe('reg');
    expect(ldo(5, 100).vout).toBeCloseTo(3.3, 2);
    const d = ldo(4, 100);
    expect(d.mode).toBe('dropout');
    expect(d.vout).toBeCloseTo(4 - 1.1 - 0.2 * d.iout, 2);
    const lim = ldo(5, 1);
    expect(lim.mode).toBe('limit');
    expect(lim.iout).toBeCloseTo(0.8, 3);
    expect(ldo(5, 100).power).toBeCloseTo((5 - 3.3) * 0.033 + 5 * 0.005, 3);
  });

  it('active buzzer sounds at 5 V, not when reversed', () => {
    const bz = (rev: boolean) =>
      simulate(circ([['PSU1', 'bench_supply', { voltage: 5 }], ['BZ1', 'buzzer']], rev ? [['PSU1.+', 'BZ1.-'], ['BZ1.+', 'PSU1.-']] : [['PSU1.+', 'BZ1.+'], ['BZ1.-', 'PSU1.-']])).buzzers.get('BZ1')!;
    expect(bz(false).on).toBe(true);
    expect(bz(false).current).toBeCloseTo(4 / 140, 3);
    expect(bz(true).on).toBe(false);
  });

  it('LDR and NTC curves', () => {
    expect(ldrResistance(10)).toBeCloseTo(15e3, -1);
    expect(ldrResistance(1000)).toBeCloseTo(15e3 * Math.pow(100, -0.7), 0);
    expect(ldrResistance(0)).toBe(1e6);
    expect(ntcResistance(25)).toBeCloseTo(10e3, 0);
    expect(ntcResistance(0) / 1000).toBeCloseTo(33.6, 0);
    expect(ntcResistance(50) / 1000).toBeCloseTo(3.59, 1);
    const adc = (lux: number) =>
      simulate(circ([esp({ GPIO34: { mode: 'adc' } }), ['LDR1', 'ldr', { lux }], ['R1', 'resistor', { resistance: 10e3 }]], [['U1.3V3', 'LDR1.1'], ['LDR1.2', 'R1.1', 'U1.GPIO34'], ['R1.2', 'U1.GND']])).mcus.get('U1')!.pins.get('GPIO34')!.adc!.raw;
    expect(adc(1000)).toBeGreaterThan(adc(10));
    expect(adc(1000)).toBeGreaterThan(3500);
  });
});

describe('PWM in the time domain', () => {
  it('25 % PWM into an RC filter averages to ≈ 0.25 × 3.3 V with small ripple', async () => {
    const { simulateTransient, hasGenerator } = await import('./transient');
    const c = circ(
      [esp({ GPIO25: { mode: 'pwm', duty: 25, frequency: 1000 } }), ['R1', 'resistor', { resistance: 10e3 }], ['C1', 'capacitor', { capacitance: 10e-6 }]],
      [['U1.GPIO25', 'R1.1'], ['R1.2', 'C1.1'], ['C1.2', 'U1.GND']],
    );
    expect(hasGenerator(c)).toBe(true);
    const tr = simulateTransient(c);
    expect(tr.converged).toBe(true);
    const avg = tr.measure('vavg', 'C1.1', 'U1.GND');
    expect(avg).toBeCloseTo(0.25 * 3.3, 1);
    expect(tr.measure('vpp', 'C1.1', 'U1.GND')).toBeLessThan(0.03);
    expect(tr.measure('vpp', 'U1.GPIO25', 'U1.GND')).toBeGreaterThan(3.2);
    expect(tr.measure('freq', 'U1.GPIO25', 'U1.GND')).toBeCloseTo(1000, -1);
    // the DC solver sees the same average
    expect(simulate(c).mcus.get('U1')!.pins.get('GPIO25')!.voltage).toBeCloseTo(0.25 * 3.3, 1);
  });

  it('PWM dims an LED: average current ∝ duty', async () => {
    const { simulateTransient } = await import('./transient');
    const led = (duty: number) =>
      simulateTransient(
        circ([esp({ GPIO2: { mode: 'pwm', duty, frequency: 500 } }), ['R1', 'resistor', { resistance: 220 }], ['LED1', 'led', {}]], [['U1.GPIO2', 'R1.1'], ['R1.2', 'LED1.anode'], ['LED1.cathode', 'U1.GND']]),
      ).leds.get('LED1')!;
    const full = 1.5 / (25 + 220 + 12);
    expect(led(50).avgCurrent).toBeCloseTo(full * 0.5, 3);
    expect(led(10).avgCurrent).toBeCloseTo(full * 0.1, 3);
  });

  const relayPwm = (diode: boolean) =>
    circ(
      [esp({ GPIO2: { mode: 'pwm', duty: 50, frequency: 20 } }), ['RB', 'resistor', { resistance: 1000 }], ['Q1', 'npn'], ['K1', 'relay'], ...(diode ? [['D1', 'diode'] as Comp] : [])],
      [['U1.GPIO2', 'RB.1'], ['RB.2', 'Q1.b'], ['U1.5V', 'K1.coil1', ...(diode ? ['D1.cathode'] : [])], ['K1.coil2', 'Q1.c', ...(diode ? ['D1.anode'] : [])], ['Q1.e', 'U1.GND']],
    );

  it('switching a relay coil off without a flyback diode kicks the collector into breakdown', async () => {
    const { simulateTransient } = await import('./transient');
    const tr = simulateTransient(relayPwm(false));
    expect(tr.breakdowns.has('Q1')).toBe(true);
    expect(tr.coilPeak.get('K1')!).toBeGreaterThan(30);
    expect(tr.measure('vmax', 'Q1.c', 'Q1.e')).toBeGreaterThan(39);
    expect(tr.relays.get('K1')!.anyOn).toBe(true);
    expect(tr.relays.get('K1')!.allOn).toBe(false);
  });

  it('a flyback diode clamps the kick to ≈ 5 V + 0.7 V', async () => {
    const { simulateTransient } = await import('./transient');
    const tr = simulateTransient(relayPwm(true));
    expect(tr.breakdowns.size).toBe(0);
    expect(tr.measure('vmax', 'Q1.c', 'Q1.e')).toBeLessThan(6.2);
    expect(tr.coilPeak.get('K1')!).toBeLessThan(6);
  });

  it('PWM speed control of a motor through a MOSFET', async () => {
    const { simulateTransient } = await import('./transient');
    const tr = simulateTransient(
      circ(
        [['PSU1', 'bench_supply', { voltage: 5, currentLimit: 3 }], esp({ GPIO2: { mode: 'pwm', duty: 40, frequency: 1000 } }), ['Q1', 'nmos'], ['M1', 'motor'], ['D1', 'diode']],
        [['PSU1.+', 'M1.+', 'D1.cathode'], ['M1.-', 'D1.anode', 'Q1.d'], ['U1.GPIO2', 'Q1.g'], ['Q1.s', 'PSU1.-', 'U1.GND']],
      ),
    );
    const m = tr.motors.get('M1')!;
    expect(m.current).toBeGreaterThan(0.15);
    expect(m.current).toBeLessThan(0.45);
    expect(tr.breakdowns.size).toBe(0);
  });
});

describe('on the breadboard: footprint, nets, diagnostics', () => {
  it('ESP32 at b1: headers in rows b and i, rails named, LED without resistor is flagged', async () => {
    const { PARTS } = await import('./parts');
    const { buildNetlist } = await import('./netlist');
    const { boardDiagnostics } = await import('./diagnostics');
    const { setLang } = await import('./i18n');
    setLang('en');
    const fp = (PARTS.esp32_devkit.placement as { footprint: (a: string) => Record<string, string> | null }).footprint;
    expect(fp('c1')).toBeNull();
    expect(fp('b13')).toBeNull(); // 19 columns don't fit
    const pins = fp('b1')!;
    expect(pins.GND).toBe('b1');
    expect(pins.GPIO2).toBe('b15');
    expect(pins['3V3']).toBe('i1');
    expect(pins['5V']).toBe('i19');
    expect(pins.GND_3).toBe('i14');
    const layout: import('./types').Layout = {
      version: 1 as const,
      parts: [
        { id: 'u', ref: 'U1', type: 'esp32_devkit' as const, props: { usb: true, pins: { GPIO2: { mode: 'out_high' as const }, GPIO4: { mode: 'input' as const } } }, pins },
        { id: 'w', ref: 'W1', type: 'wire' as const, props: {}, pins: { a: 'a1', b: 'tn1' } },
        { id: 'l', ref: 'LED1', type: 'led' as const, props: { color: 'red' as const }, pins: { anode: 'a15', cathode: 'tn15' } },
        { id: 's', ref: 'SW1', type: 'pushbutton' as const, props: { pressed: false }, pins: { '1a': 'a13', '1b': 'tn13', '2a': 'a11', '2b': 'tn11' } },
      ],
    };
    // (the button here is only used as a 2-terminal switch between GPIO4 and GND)
    layout.parts[3].pins = { '1a': 'a13', '2a': 'tn20', '1b': 'c30', '2b': 'h30' } as never;
    const nl = buildNetlist(layout);
    expect(nl.pinNet.get('U1.GND')).toBe('GND');
    expect(nl.pinNet.get('U1.3V3')).toBe('3V3');
    const sim = simulate(nl.circuit);
    expect(sim.mcus.get('U1')!.running).toBe(true);
    const titles = boardDiagnostics(nl, sim).map((i) => `${i.severity}: ${i.title}`);
    expect(titles.some((t) => /GPIO2 (current is high|is damaged)/.test(t))).toBe(true);
    expect(titles.some((t) => /GPIO4 is a floating input/.test(t))).toBe(true);
    expect(titles.some((t) => /No power source/.test(t))).toBe(false);
    expect(titles.some((t) => /floating$/.test(t) && t.includes('U1'))).toBe(false);
    setLang('zh');
  });
});

describe('challenge format: dev boards with logical pins', () => {
  const load = async (name: string) => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    return JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), 'utf8'));
  };
  const judge = async (json: Record<string, unknown>, mutate?: (parts: Record<string, unknown>[]) => void) => {
    const { parseChallenge } = await import('./challenge');
    const { checkCircuit } = await import('./check');
    const { buildNetlist } = await import('./netlist');
    const j = structuredClone(json) as { solution: { parts: Record<string, unknown>[] } };
    mutate?.(j.solution.parts);
    const res = parseChallenge(j);
    expect(res.errors).toEqual([]);
    const ch = res.challenge!;
    const nl = buildNetlist(ch.solution!);
    return { self: checkCircuit(ch, ch.target), user: checkCircuit(ch, nl.circuit, nl.pinHoles) };
  };

  it('GPIO → R → LED: the solution passes, and so does any other output-capable pin', async () => {
    const json = await load('mcu-gpio-led.json');
    const r = await judge(json);
    expect(r.self.perfect).toBe(true);
    expect(r.user.perfect).toBe(true);
    expect(r.user.pinMap.get('U1.GPIO_OUT1')).toBe('U1.GPIO2');
    // GPIO4 sits at b13: move the resistor there
    const other = await judge(json, (parts) => {
      (parts[0].props as { modes: Record<string, string> }).modes = { GPIO4: 'out_high' };
      parts[2].pins = { '1': 'a13', '2': 'a22' };
    });
    expect(other.user.issues.map((i) => i.title)).toEqual([]);
    expect(other.user.pinMap.get('U1.GPIO_OUT1')).toBe('U1.GPIO4');
  });

  it('an input-only pin or the wrong mode is rejected with a reason', async () => {
    const { setLang } = await import('./i18n');
    setLang('en');
    const json = await load('mcu-gpio-led.json');
    // GPIO34 is on the lower header at i5 (free hole j5)
    const inOnly = await judge(json, (parts) => {
      (parts[0].props as { modes: Record<string, string> }).modes = {};
      parts[2].pins = { '1': 'j5', '2': 'a22' };
    });
    expect(inOnly.user.perfect).toBe(false);
    expect(inOnly.user.issues.some((i) => /GPIO34 can't be used as GPIO_OUT1/.test(i.title))).toBe(true);
    const wrongMode = await judge(json, (parts) => {
      (parts[0].props as { modes: Record<string, string> }).modes = { GPIO2: 'input' };
    });
    expect(wrongMode.user.issues.some((i) => /GPIO2 has the wrong mode/.test(i.title))).toBe(true);
    setLang('zh');
  });

  it('button + internal pull-up on the Blue Pill', async () => {
    const r = await judge(await load('mcu-button-pullup.json'));
    expect(r.self.perfect).toBe(true);
    expect(r.user.perfect).toBe(true);
    expect(r.user.testsPassed).toBe(3);
  });

  it('a generic "mcu" target matches either board', async () => {
    const json = await load('mcu-button-pullup.json');
    (json.components as { type: string }[])[0].type = 'mcu';
    const r = await judge(json);
    expect(r.user.perfect).toBe(true);
  });
});

describe('open drain + rise time (I²C pull-ups)', () => {
  it('an open-drain PWM pin with a 4.7 kΩ pull-up and 200 pF: rise ≈ 2.2·RC, fall fast', async () => {
    const { simulateTransient } = await import('./transient');
    const tr = simulateTransient(
      circ(
        [esp({ GPIO21: { mode: 'pwm', duty: 50, frequency: 100e3, openDrain: true } }), ['RP', 'resistor', { resistance: 4700 }], ['CB', 'capacitor', { capacitance: 200e-12 }]],
        [['U1.3V3', 'RP.1'], ['RP.2', 'CB.1', 'U1.GPIO21'], ['CB.2', 'U1.GND']],
      ),
    );
    const rise = tr.measure('rise', 'U1.GPIO21', 'U1.GND');
    expect(rise).toBeGreaterThan(1.9e-6);
    expect(rise).toBeLessThan(2.25e-6);
    expect(tr.measure('fall', 'U1.GPIO21', 'U1.GND')).toBeLessThan(0.1e-6);
    expect(tr.measure('vmax', 'U1.GPIO21', 'U1.GND')).toBeGreaterThan(3.1);
  });

  it('open-drain out_high just releases the pin (floats without a pull-up)', () => {
    const s = simulate(circ([esp({ GPIO21: { mode: 'out_high', openDrain: true } }), ['R1', 'resistor', { resistance: 10e3 }]], [['U1.GPIO21', 'R1.1'], ['R1.2', 'U1.GND']]));
    const p = s.mcus.get('U1')!.pins.get('GPIO21')!;
    expect(Math.abs(p.voltage)).toBeLessThan(0.01);
    expect(p.current).toBe(0);
  });
});

describe('flyback diode is not "reversed"', () => {
  it('no reverse warning for a diode across an energised relay coil', async () => {
    const { buildNetlist } = await import('./netlist');
    const { boardDiagnostics } = await import('./diagnostics');
    const nl = { circuit: circ([['PSU1', 'bench_supply', { voltage: 5, currentLimit: 1 }], ['K1', 'relay'], ['D1', 'diode']], [['PSU1.+', 'K1.coil1', 'D1.cathode'], ['K1.coil2', 'D1.anode', 'PSU1.-']]) };
    void buildNetlist;
    const pinNet = new Map<string, string>();
    nl.circuit.nets.forEach((n) => n.pins.forEach((p) => pinNet.set(p, n.name)));
    const issues = boardDiagnostics({ ...nl, pinNet, pinHoles: new Map(), netHoles: new Map(), holeNet: new Map(), unplaced: [] }, simulate(nl.circuit));
    expect(issues.some((i) => i.refs.includes('D1') && /反|revers/i.test(i.title))).toBe(false);
  });
});

describe('plain diode ratings', () => {
  it('a rectifier diode carrying 200 mA is fine (LED thresholds do not apply)', () => {
    const s = simulate(circ([['V1', 'bench_supply', { voltage: 5, currentLimit: 1 }], ['R1', 'resistor', { resistance: 22 }], ['D1', 'diode', {}]], [['V1.+', 'R1.1'], ['R1.2', 'D1.anode'], ['D1.cathode', 'V1.-']]));
    const d = s.leds.get('D1')!;
    expect(d.current).toBeGreaterThan(0.15);
    expect(d.burnt).toBe(false);
    expect(d.overcurrent).toBe(false);
  });
});

describe('netlist naming with a dev board and a separate supply', () => {
  it('a battery loop not wired to the board GND stays a separate net', async () => {
    const { buildNetlist } = await import('./netlist');
    const { parseChallenge } = await import('./challenge');
    const ch = parseChallenge({
      format: 'breadboard-challenge/1',
      id: 'gnd-split',
      title: 'gnd split',
      components: [{ ref: 'U1', type: 'esp32_devkit' }, { ref: 'BAT1', type: 'battery' }, { ref: 'R1', type: 'resistor' }, { ref: 'LED1', type: 'led' }],
      connections: [['BAT1.+', 'R1.1'], ['R1.2', 'LED1.anode'], ['LED1.cathode', 'BAT1.-']],
      solution: {
        parts: [
          { type: 'esp32_devkit', ref: 'U1', at: 'b1', props: { usb: true } },
          { type: 'wire', pins: { a: 'a1', b: 'tn1' } },
          { type: 'battery', ref: 'BAT1', variant: '9V', pins: { '+': 'a25', '-': 'a28' } },
          { type: 'resistor', ref: 'R1', resistance: 1000, pins: { '1': 'c25', '2': 'c27' } },
          { type: 'led', ref: 'LED1', color: 'red', pins: { anode: 'd27', cathode: 'd28' } },
        ],
      },
    }).challenge!;
    const nl = buildNetlist(ch.solution!);
    expect(nl.pinNet.get('LED1.cathode')).toBeTruthy();
    expect(nl.pinNet.get('LED1.cathode')).not.toBe(nl.pinNet.get('U1.GND'));
  });
});
