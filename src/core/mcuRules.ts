// Threshold rules on dev-board pins (pin mode `rule`, types.ts PinRule): an output that follows an
// ADC reading of the same board, the declarative stand-in for a few lines of firmware
//
//     loop() { digitalWrite(FAN, analogRead(TEMP) > 2674); }
//
// The solver has no firmware, so the rule is settled around the DC solve: every rule pin starts
// LOW (or at its last state, for hysteresis), the circuit is solved, each rule compares its ADC
// reading and sets its output, and the solve repeats until no output changes. The solved circuit
// has plain out_high / out_low pins, so the DC model, the transient engine and every reading see
// an ordinary output.
import { adcRaw, isMcu, mcuPin } from './mcu';
import type { Circuit, PinConfig, PinRule } from './types';

/** `ref.pin` → output HIGH? (the state a hysteresis rule remembers between solves) */
export type RuleState = Map<string, boolean>;

interface RulePin {
  key: string;
  ref: string;
  pin: string;
  cfg: PinConfig;
  rule: PinRule;
}

const MAX_ROUNDS = 8;

function rulePins(circuit: Circuit): RulePin[] {
  const out: RulePin[] = [];
  for (const c of circuit.components) {
    if (!isMcu(c.type)) continue;
    for (const [pin, cfg] of Object.entries(c.props.pins ?? {})) if (cfg?.mode === 'rule' && cfg.rule) out.push({ key: `${c.ref}.${pin}`, ref: c.ref, pin, cfg, rule: cfg.rule });
  }
  return out;
}

export function hasRules(circuit: Circuit): boolean {
  return rulePins(circuit).length > 0;
}

/** The reading that turns a HIGH rule output off again (hysteresis > 0), or null without
 *  hysteresis. `above`: off once the reading drops below threshold − hysteresis; `below`: off once
 *  it rises above threshold + hysteresis. Clamped to the 12-bit range, as the editor shows it. */
export function ruleOffAt(rule: PinRule): number | null {
  const h = Math.max(0, rule.hysteresis ?? 0);
  if (!h) return null;
  if (rule.below !== undefined) return Math.min(4095, rule.below + h);
  if (rule.above !== undefined) return Math.max(0, rule.above - h);
  return null;
}

/** The output a rule wants for a reading, given its present output (hysteresis). It is exactly the
 *  firmware the editor shows:
 *      if (raw > above) HIGH; else if (raw < above − h) LOW;   // otherwise keep the output
 */
export function ruleOutput(rule: PinRule, raw: number, wasHigh: boolean): boolean {
  const off = ruleOffAt(rule);
  if (rule.below !== undefined) return raw < rule.below || (wasHigh && off !== null && raw <= off);
  if (rule.above !== undefined) return raw > rule.above || (wasHigh && off !== null && raw >= off);
  return false;
}

/** The firmware line a rule stands for; with hysteresis the turn-off reading is spelled out. */
export function ruleCode(r: PinRule, pin: string): string {
  const below = r.below !== undefined;
  const thr = (below ? r.below : r.above) ?? 2048;
  const on = `if (analogRead(${r.adc}) ${below ? '<' : '>'} ${thr}) ${pin} = HIGH;`;
  const off = ruleOffAt(r);
  return off === null ? `${on} else ${pin} = LOW;` : `${on} else if (analogRead(${r.adc}) ${below ? '>' : '<'} ${off}) ${pin} = LOW;`;
}

/** The circuit with every rule pin replaced by out_high / out_low per `state` (unset = LOW). */
export function withRuleOutputs(circuit: Circuit, state: RuleState): Circuit {
  return {
    ...circuit,
    components: circuit.components.map((c) => {
      if (!isMcu(c.type) || !Object.values(c.props.pins ?? {}).some((p) => p?.mode === 'rule')) return c;
      const pins: Record<string, PinConfig> = {};
      for (const [pin, cfg] of Object.entries(c.props.pins ?? {})) {
        if (cfg?.mode !== 'rule') pins[pin] = cfg;
        else pins[pin] = { mode: state.get(`${c.ref}.${pin}`) ? 'out_high' : 'out_low', ...(cfg.openDrain ? { openDrain: true } : {}) };
      }
      return { ...c, props: { ...c.props, pins } };
    }),
  };
}

/** What a solve exposes that a rule needs: a pin's voltage to the board's GND. */
interface PinVoltages {
  mcus: Map<string, { pins: Map<string, { vLocal: number }> }>;
}

/** The ADC reading a rule sees, or null when its pin has no ADC (the rule then holds LOW). */
function reading(sim: PinVoltages, circuit: Circuit, rp: RulePin): number | null {
  const type = circuit.components.find((c) => c.ref === rp.ref)?.type;
  const def = type ? mcuPin(type, rp.rule.adc) : null;
  if (!def || def.kind !== 'gpio' || !def.gpio?.adc) return null;
  const st = sim.mcus.get(rp.ref)?.pins.get(rp.rule.adc);
  return st ? adcRaw(st.vLocal) : null;
}

/** Settle every rule against `solve`. Returns the solve of the settled circuit, that circuit, and
 *  the outputs (to remember for hysteresis). `prev` gives the starting outputs; missing = LOW. */
export function settleRules<S extends PinVoltages>(circuit: Circuit, solve: (c: Circuit) => S, prev?: RuleState): { sim: S; circuit: Circuit; state: RuleState } {
  const pins = rulePins(circuit);
  const state: RuleState = new Map(pins.map((p) => [p.key, prev?.get(p.key) ?? false]));
  let solved = withRuleOutputs(circuit, state);
  let sim = solve(solved);
  for (let round = 0; round < MAX_ROUNDS; round++) {
    let changed = false;
    for (const p of pins) {
      const raw = reading(sim, circuit, p);
      const want = raw === null ? false : ruleOutput(p.rule, raw, state.get(p.key)!);
      if (want !== state.get(p.key)) {
        state.set(p.key, want);
        changed = true;
      }
    }
    if (!changed) break;
    solved = withRuleOutputs(circuit, state);
    sim = solve(solved);
  }
  return { sim, circuit: solved, state };
}
