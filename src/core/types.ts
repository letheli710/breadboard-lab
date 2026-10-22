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
  | 'power_module';

/** Component types allowed in a Circuit. `dc_source` only appears in challenge targets
 *  and matches any power part (battery / bench_supply / power_module) of that voltage. */
export type CompType = Exclude<PartType, 'wire'> | 'dc_source';

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
