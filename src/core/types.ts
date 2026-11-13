// Shared data model.
// A *Layout* is what sits on the breadboard (physical: parts + holes).
// A *Circuit* is the abstract netlist (logical: components + nets). Both the user's
// breadboard and a challenge's target are turned into a Circuit, so simulation,
// schematic drawing and answer checking all work on the same structure.

export type PartType =
  | 'wire'
  | 'resistor'
  | 'led'
  | 'diode'
  | 'capacitor'
  | 'pushbutton'
  | 'switch'
  | 'potentiometer'
  | 'battery'
  | 'bench_supply'
  | 'power_module'
  // stage C: instruments and new parts
  | 'inductor'
  | 'ammeter'
  | 'opamp'
  | 'function_gen'
  | 'scope_probe'
  // phase 5: MCU dev boards and peripheral devices (docs/ROADMAP.md "Phase 5 contract")
  | 'esp32_devkit'
  | 'stm32_bluepill'
  | 'npn'
  | 'nmos'
  | 'relay'
  | 'motor'
  | 'buzzer'
  | 'ldo'
  | 'ldr'
  | 'ntc';

/** Component types allowed in a Circuit. `dc_source` only appears in challenge targets
 *  and matches any power part (battery / bench_supply / power_module) of that voltage. */
export type CompType = Exclude<PartType, 'wire'> | 'dc_source' | 'mcu';

/** GPIO modes of a dev-board pin (there is no firmware: the mode *is* the program). */
export type PinMode = 'out_high' | 'out_low' | 'input' | 'input_pullup' | 'input_pulldown' | 'pwm' | 'adc';
export const PIN_MODES: PinMode[] = ['out_high', 'out_low', 'input', 'input_pullup', 'input_pulldown', 'pwm', 'adc'];

export interface PinConfig {
  mode: PinMode;
  /** PWM duty cycle in % (0–100, default 50) */
  duty?: number;
  /** PWM frequency in Hz (default 1000) */
  frequency?: number;
  /** open-drain output (out_high / pwm): "high" releases the pin instead of driving it
   *  (I²C-style; needs a pull-up) */
  openDrain?: boolean;
}

export type MosfetModel = 'IRLZ44N' | 'IRF540N';

export type Waveform = 'sine' | 'square' | 'triangle';

export type LedColor = 'red' | 'yellow' | 'green' | 'blue' | 'white';
export type BatteryVariant = '9V' | '2xAA' | '3xAA' | '4xAA' | 'CR2032';

export interface PartProps {
  resistance?: number; // ohms (resistor, potentiometer)
  color?: LedColor; // led
  capacitance?: number; // farads
  variant?: BatteryVariant; // battery
  voltage?: number; // bench_supply / power_module / dc_source
  currentLimit?: number; // bench_supply, amps
  pressed?: boolean; // pushbutton
  position?: 'a' | 'b'; // switch: which outer leg is connected to com
  wiper?: number; // potentiometer 0..1 (0 = at pin 1)
  wireColor?: string; // wire
  inductance?: number; // henries (inductor)
  waveform?: Waveform; // function_gen
  frequency?: number; // Hz (function_gen)
  amplitude?: number; // V peak (function_gen)
  offset?: number; // V DC offset (function_gen)
  channel?: 1 | 2; // scope_probe
  // phase 5
  usb?: boolean; // dev board: virtual USB cable plugged in (default true)
  pins?: Record<string, PinConfig>; // dev board: GPIO modes by pin name (unlisted = input)
  beta?: number; // npn current gain
  model?: MosfetModel; // nmos
  lux?: number; // ldr light level
  temperature?: number; // ntc, °C
}

export interface PlacedPart {
  id: string;
  ref: string;
  type: PartType;
  props: PartProps;
  /** physical pin name -> hole id. Missing entry = not plugged in yet. */
  pins: Record<string, string>;
}

export interface Layout {
  version: 1;
  parts: PlacedPart[];
}

export interface CComponent {
  ref: string;
  type: CompType;
  props: PartProps;
}

export interface CNet {
  name: string;
  /** "REF.pin" terminal ids */
  pins: string[];
}

export interface Circuit {
  components: CComponent[];
  nets: CNet[];
}

export function pinId(ref: string, pin: string): string {
  return `${ref}.${pin}`;
}

export function splitPin(id: string): [string, string] {
  const i = id.lastIndexOf('.');
  return [id.slice(0, i), id.slice(i + 1)];
}
