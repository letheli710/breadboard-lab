// Dev helper (not shipped): print every measured quantity of a challenge's solution (or start)
// layout for each test, plus board diagnostics. Usage: npx tsx scripts/_probe.ts file.json [--start] [--diag] [--lang en]
import { readFileSync } from 'node:fs';
import { parseChallenge } from '../src/core/challenge';
import { applySet, checkCircuit, runTest } from '../src/core/check';
import { acDiagnostics, boardDiagnostics } from '../src/core/diagnostics';
import { setLang } from '../src/core/i18n';
import { buildNetlist } from '../src/core/netlist';
import { simulate } from '../src/core/solver';
import { hasGenerator, simulateTransient, vavg } from '../src/core/transient';
import { pinId, splitPin } from '../src/core/types';

const args = process.argv.slice(2);
if (args.includes('--lang')) setLang(args[args.indexOf('--lang') + 1] as 'en');
const file = args[0];
const useStart = args.includes('--start');
const json = JSON.parse(readFileSync(file, 'utf8'));
const res = parseChallenge(json, 'folder', file);
for (const e of res.errors) console.log('PARSE ERROR', e);
for (const w of res.warnings) console.log('PARSE WARN', w);
const ch = res.challenge!;
const layout = useStart ? ch.start! : ch.solution!;
const nl = buildNetlist(layout);
const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
console.log('perfect:', r.perfect, 'unplaced:', nl.unplaced);
for (const i of r.issues) console.log('  ISSUE', i.title, '|', i.detail ?? '');
const f = (x: number, d = 4) => (Number.isFinite(x) ? +x.toPrecision(d) : x);
const states = [{ name: '(default)', set: {} as never, gpio: [], voltages: [], currents: [], scope: [], expect: {}, regions: {} }, ...ch.tests];
for (const t of states) {
  console.log(`\n=== ${t.name}`);
  const c = applySet(nl.circuit, t.set, r.mapping, r.pinMap);
  const sim = simulate(c);
  const gen = hasGenerator(c);
  const tr = gen ? simulateTransient(c) : null;
  const mp = (p: string) => r.pinMap.get(p) ?? p;
  for (const [ref, m] of sim.mcus) {
    console.log(` ${ref} running=${m.running} v5=${f(m.v5)} v3=${f(m.v3)} usbI=${f(m.usbCurrent)} reg=${m.reg.mode} iout=${f(m.reg.iout)} i3v3Out=${f(m.i3v3Out)} i5vOut=${f(m.i5vOut)} usbOverload=${m.usbOverload}`);
    for (const [pin, p] of m.pins)
      if (p.connected || p.mode !== 'input')
        console.log(`   ${pin} ${p.mode} V=${f(p.vLocal)} I=${f(p.current * 1000)}mA logic=${p.logic}${p.adc ? ` adc=${p.adc.raw} (${f(p.adc.volts)} V)` : ''}${p.overcurrent ? ' OVERCURRENT' : ''}${p.damaged ? ' DAMAGED' : ''}${p.overvoltage ? ' OVERVOLT' : ''} clamp=${f(p.clamp * 1000)}mA${tr ? ` avgV=${f(tr.measure('vavg', `${ref}.${pin}`, `${ref}.GND`))} avgI=${f(vavg(tr.pinCurrent(`${ref}.${pin}`) ?? [0]) * 1000)}mA` : ''}`);
  }
  for (const [ref, l] of sim.leds) console.log(` LED ${ref} on=${l.on} I=${f(l.current * 1000)}mA${tr ? ` avg=${f(tr.leds.get(ref)!.avgCurrent * 1000)}mA` : ''}`);
  for (const [ref, q] of sim.bjts) console.log(` BJT ${ref} ${q.region} ib=${f(q.ib * 1000)}mA ic=${f(q.ic * 1000)}mA vbe=${f(q.vbe)} vce=${f(q.vce)} P=${f(q.power)}`);
  for (const [ref, q] of sim.mosfets) console.log(` MOS ${ref} ${q.region} vgs=${f(q.vgs)} vds=${f(q.vds)} id=${f(q.id * 1000)}mA rds=${f(q.rds)} P=${f(q.power)}`);
  for (const [ref, q] of sim.regs) console.log(` LDO ${ref} ${q.mode} vin=${f(q.vin)} vout=${f(q.vout)} iout=${f(q.iout * 1000)}mA P=${f(q.power)}`);
  for (const [ref, q] of sim.relays) console.log(` RELAY ${ref} energized=${q.energized} I=${f(q.coilCurrent * 1000)}mA V=${f(q.coilVoltage)}`);
  for (const [ref, q] of sim.motors) console.log(` MOTOR ${ref} running=${q.running} I=${f(q.current * 1000)}mA V=${f(q.voltage)}${tr ? ` avg: ${f(tr.motors.get(ref)!.current * 1000)}mA run=${tr.motors.get(ref)!.running}` : ''}`);
  for (const [ref, q] of sim.buzzers) console.log(` BUZZ ${ref} on=${q.on} I=${f(q.current * 1000)}mA V=${f(q.voltage)}`);
  for (const [ref, s] of sim.sources) console.log(` SRC ${ref} I=${f(s.current * 1000)}mA Vt=${f(s.terminalVoltage)} shorted=${s.shorted} cc=${s.ccMode}`);
  if (tr) console.log(` transient: breakdowns=${[...tr.breakdowns].join(',')} coilPeak=${[...tr.coilPeak].map(([k, v]) => `${k}:${f(v)}`).join(',')} warn=${tr.warnings.join(';')}`);
  // values of every test item
  const netOf = new Map<string, string>();
  c.nets.forEach((n) => n.pins.forEach((p) => netOf.set(p, n.name)));
  for (const v of t.voltages ?? []) {
    const p = mp(v.pin), rr = v.ref ? mp(v.ref) : undefined;
    const val = tr ? tr.measure('vavg', p, rr) : (sim.nodeV.get(netOf.get(p) ?? '') ?? 0) - (rr ? (sim.nodeV.get(netOf.get(rr) ?? '') ?? 0) : 0);
    console.log(`  [V] ${v.pin}${v.ref ? '-' + v.ref : ''} = ${f(val)}  (want ${v.min}..${v.max})`);
  }
  for (const it of t.currents ?? []) {
    const u = r.mapping.get(it.el) ?? it.el;
    const val = tr && it.mode !== undefined ? 0 : sim.current.get(u) ?? 0;
    const avg = tr ? tr.current(u) : null;
    console.log(`  [I] ${it.el} dc=${f(val)}${avg ? ` avg=${f(vavg(avg))}` : ''}  (want ${it.min}..${it.max})`);
  }
  for (const sc of t.scope ?? []) {
    const val = tr!.measure(sc.measure, mp(sc.pin), sc.ref ? mp(sc.ref) : undefined, sc.vs ? mp(sc.vs) : undefined, sc.vsref ? mp(sc.vsref) : undefined);
    console.log(`  [S] ${sc.measure} ${sc.pin} = ${f(val)}  (want ${sc.min}..${sc.max})`);
  }
  for (const g of t.gpio ?? []) console.log(`  [G] ${g.pin} -> ${mp(g.pin)} ${g.read ?? g.measure} (want ${g.min}..${g.max})`);
  const fail = t.name === '(default)' ? null : runTest(t as never, nl.circuit, r.mapping, r.pinMap);
  if (fail) console.log('  FAIL:', fail);
}
if (args.includes('--diag')) {
  const sim = simulate(nl.circuit);
  console.log('\n--- diagnostics (default state)');
  for (const i of boardDiagnostics(nl, sim)) console.log(` [${i.severity}] ${i.title} | ${i.detail ?? ''}`);
  if (hasGenerator(nl.circuit)) for (const i of acDiagnostics(nl, simulateTransient(nl.circuit))) console.log(` [ac ${i.severity}] ${i.title} | ${i.detail ?? ''}`);
}
void pinId;
void splitPin;
