/* global require, process, console, window, document, localStorage, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports */
// The instrument lessons (challenges/101-…108-…) end to end, as a student does them: every step's
// parts are placed by clicking holes on the 3D board (positions from the test hook window.__bb, so
// no hard-coded pixels), the multimeter probes and the scope knobs are set, and each step's live
// check must say "done" before Next. Then "Check my circuit" must pass and every measurement
// question must accept the reading of the reference solution (from the validator, --readings).
// Settings (resistor values, supply knobs, generator, pin modes) go through the store's
// updateProps, the same call the Properties editors make (their UI has its own tests in e2e-bench).
//   node scripts/e2e-lessons.cjs [baseUrl] [--all] [--only 101,105] [--lang zh]
// Default: three representative lessons (multimeter, ammeter, two-channel scope); --all: all eight.
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const { mkdirSync, readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

const args = process.argv.slice(2);
const BASE = (args.find((a) => /^https?:/.test(a)) || 'http://localhost:4174/').replace(/\/?$/, '/');
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const LANG = opt('--lang') || 'en';
const ROOT = join(__dirname, '..');
const ART = join(ROOT, 'e2e-artifacts');
const ALL = readdirSync(join(ROOT, 'challenges'))
  .filter((f) => /^1\d\d-lesson-.*\.json$/.test(f))
  .sort();
const pick = opt('--only')?.split(',');
const FILES = pick ? ALL.filter((f) => pick.some((n) => f.startsWith(n))) : args.includes('--all') ? ALL : ALL.filter((f) => /^(101|102|105)-/.test(f));

let failures = 0;
const assert = (c, m) => {
  console.log(c ? 'ok  ' : 'FAIL', m);
  if (!c) {
    failures++;
    process.exitCode = 1;
  }
  return !!c;
};

/** readings of the lesson's reference solution, from the validator */
function referenceReadings(file) {
  const out = execFileSync('npx', ['tsx', 'scripts/validate-challenges.ts', `challenges/${file}`, '--readings', '--lang', 'en'], { cwd: ROOT, encoding: 'utf8' });
  const r = {};
  for (const m of out.matchAll(/reading\s+(\S+)\s+=\s+(-?[\d.e+-]+)/g)) r[m[1]] = Number(m[2]);
  return r;
}

/** each step's checks as the app's parser reads them (holes of footprints resolved, values parsed) */
function parsedSteps(file) {
  const code = `import { readFileSync } from 'node:fs'; import { parseChallenge } from './src/core/challenge';
    const r = parseChallenge(JSON.parse(readFileSync(${JSON.stringify(`challenges/${file}`)}, 'utf8')));
    console.log(JSON.stringify(r.challenge.steps.map((s) => s.check ?? [])));`;
  return JSON.parse(execFileSync('npx', ['tsx', '-e', code], { cwd: ROOT, encoding: 'utf8' }));
}

async function clickHole(p, id, shift = false, retry = true) {
  const h = await p.evaluate((i) => window.__bb.hole(i), id);
  // the hole must be visible, not under an overlay (the scope window, a toolbar): a student could
  // not click it either. Overlays may still be moving into place, so give them a moment.
  let cover = null;
  for (let i = 0; i < 8; i++) {
    cover = await p.evaluate(({ x, y }) => {
      const e = document.elementFromPoint(x, y);
      return e === window.__bb.canvas ? null : `${e?.tagName}.${e?.className}`;
    }, h);
    if (!cover) break;
    await p.waitForTimeout(250);
  }
  if (cover) throw new Error(`hole ${id} is covered by ${cover}`);
  // hover first, as a mouse does (a footprint part takes its anchor from the hovered hole)
  await p.mouse.move(h.x, h.y);
  await p.waitForTimeout(60);
  // in the angled view a raised part (a resistor's leg) can sit in front of the hole: the hover
  // names its hole instead. Do what a student does — switch to the top view — and aim again.
  const hovered = await p.evaluate(() => window.__bb.store.getState().hoverHole);
  if (hovered !== id && retry) {
    for (let i = 0; i < 4 && !/^Top|^俯视/.test((await p.locator('.view-btn b').textContent()).trim()); i++) await p.locator('.view-btn').click();
    await p.waitForTimeout(1200);
    return clickHole(p, id, shift, false);
  }
  if (shift) await p.keyboard.down('Shift');
  await p.mouse.click(h.x, h.y);
  if (shift) await p.keyboard.up('Shift');
  await p.waitForTimeout(80);
}
const setTool = (p, t) => p.evaluate((x) => window.__bb.store.getState().setTool(x), t);

/** carry out one check entry of a step the way the step text tells the student to: `c` is the
 *  parsed check, `raw` the entry as written (for a footprint part's anchor hole, "at") */
async function perform(p, c, raw) {
  const partAt = (h) => p.evaluate((x) => window.__bb.store.getState().layout.parts.find((q) => Object.values(q.pins).includes(x)) ?? null, h);
  const remove = (id) => p.evaluate((x) => window.__bb.store.getState().removePart(x), id);
  if (c.kind === 'part') {
    const holes = Object.values(c.pins);
    // the same part on the same holes, pin for pin (a reversed ammeter is another placement)
    const find = () =>
      p.evaluate(({ type, pins }) => window.__bb.store.getState().layout.parts.find((q) => q.type === type && Object.entries(pins).every(([k, h]) => q.pins[k] === h)) ?? null, {
        type: c.type,
        pins: c.pins,
      });
    let part = await find();
    if (!part) {
      // something already in these holes (e.g. "delete the probe and place it again"): remove it
      for (const h of holes) {
        const old = await partAt(h);
        if (old) await remove(old.id);
      }
      await p.waitForTimeout(200); // let the scene settle after a deletion
      const seq = raw.at ? [raw.at] : Object.keys(raw.pins).map((k) => raw.pins[k]);
      // a click landing mid-render can be dropped by the scene (a person would simply click
      // again): if the part did not appear, pick the tool afresh and place it once more
      for (let attempt = 0; attempt < 2 && !(await find()); attempt++) {
        await setTool(p, 'select');
        await setTool(p, c.type);
        for (const h of seq) await clickHole(p, h);
        await p.waitForTimeout(150);
      }
      const after = await p.evaluate(() => {
        const st = window.__bb.store.getState();
        return { firstHole: st.firstHole, tool: st.tool, hover: st.hoverHole, toast: JSON.stringify(st.toast ?? st.message ?? null) };
      });
      await setTool(p, 'select');
      part = await find();
      if (!part) console.log('      not placed:', c.type, JSON.stringify(c.pins), JSON.stringify(after));
    }
    if (!part) return;
    if (Object.keys(c.props).length)
      await p.evaluate(
        ({ id, props }) => {
          const s = window.__bb.store.getState();
          const cur = s.layout.parts.find((x) => x.id === id).props;
          // dev-board pin modes merge into the board's pin table
          s.updateProps(id, props.pins ? { ...props, pins: { ...(cur.pins || {}), ...props.pins } } : props);
        },
        { id: part.id, props: c.props },
      );
  } else if (c.kind === 'probe') {
    await setTool(p, 'probe');
    if (c.red) await clickHole(p, c.red);
    if (c.black) await clickHole(p, c.black, true);
    await setTool(p, 'select');
  } else if (c.kind === 'empty') {
    for (const h of c.holes) {
      const old = await partAt(h);
      if (old) await remove(old.id);
    }
  } else if (c.kind === 'scope') {
    await p.evaluate((sc) => {
      const st = window.__bb.store.getState();
      const cur = st.scope;
      st.setScope({ tdiv: sc.tdiv ?? cur.tdiv, vdiv: { 1: sc.vdiv1 ?? cur.vdiv[1], 2: sc.vdiv2 ?? cur.vdiv[2] } });
    }, c);
  }
}

async function lesson(browser, file) {
  const json = JSON.parse(readFileSync(join(ROOT, 'challenges', file), 'utf8'));
  const ref = referenceReadings(file);
  const parsed = parsedSteps(file);
  const ctx = await browser.newContext({ locale: LANG === 'zh' ? 'zh-CN' : 'en-US', viewport: { width: 1366, height: 768 } });
  await ctx.addInitScript((l) => localStorage.setItem('bb.lang', JSON.stringify(l)), LANG);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  const t0 = Date.now();
  try {
    await p.goto(`${BASE}?e2e#/learn/${json.id}`);
    await p.waitForFunction(() => window.__bb && window.__bb.frames > 2 && document.querySelector('section.steps'), null, { timeout: 30000 });
    await p.waitForTimeout(300);
    const steps = json.steps;
    let stepsOk = 0;
    for (let i = 0; i < steps.length; i++) {
      const raws = steps[i].check ? (Array.isArray(steps[i].check) ? steps[i].check : [steps[i].check]) : [];
      const checks = parsed[i];
      for (let k = 0; k < checks.length; k++) await perform(p, checks[k], raws[k]);
      if (checks.length) {
        await p.waitForTimeout(150);
        const st = await p.evaluate(() => document.querySelector('.step-check')?.className ?? '');
        if (!assert(st.includes('ok'), `${json.id} step ${i + 1}: check passes after doing what it says`))
          console.log('     ', await p.evaluate(() => document.querySelector('.step-check')?.innerText));
        else stepsOk++;
      }
      if (i < steps.length - 1) await p.locator('section.steps .row button.primary').click();
    }
    // stage 1: the circuit check
    await p.locator('.actions button.primary.big').click();
    await p.waitForTimeout(400);
    const ok = await p.evaluate(() => !!document.querySelector('.check-result .ok-box'));
    if (!assert(ok, `${json.id}: "Check my circuit" passes`)) console.log('     ', await p.evaluate(() => document.querySelector('.check-result')?.innerText.slice(0, 400)));
    // stage 2: every reading
    const qs = json.measurements || [];
    for (let n = 0; n < qs.length; n++) {
      const q = qs[n];
      const li = p.locator('li.mq').nth(n);
      if (q.predict) {
        const f = li.locator('form.mq-row').first();
        await f.locator('input').fill(String(ref[q.id] ?? 1));
        await f.locator('button[type=submit]').click();
      }
      if (q.choices) await li.locator('.pr-choice').nth(q.correct).click();
      else {
        // the reading in SI units, as "8.84m"-style text the answer box understands
        const f = li.locator('form.mq-row').last();
        await f.locator('input').fill(`${Number(ref[q.id].toPrecision(4))}`);
        await f.locator('button[type=submit]').click();
      }
      await p.waitForTimeout(150);
    }
    const done = await p.evaluate(() => document.querySelector('.stages')?.innerText.replace(/\s+/g, ' '));
    assert(new RegExp(`${qs.length}/${qs.length}`).test(done || ''), `${json.id}: all ${qs.length} readings accepted (${done})`);
    assert(errors.length === 0, `${json.id}: no page errors ${errors.join(' | ')}`);
    console.log(`     ${json.id}: ${stepsOk} checked steps, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  } catch (e) {
    assert(false, `${json.id}: ${e.message.split('\n')[0]}`);
  } finally {
    if (process.exitCode) {
      mkdirSync(ART, { recursive: true });
      await p.screenshot({ path: join(ART, `lesson-${json.id}.png`) }).catch(() => {});
    }
    await ctx.close();
  }
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const f of FILES) await lesson(browser, f);
  await browser.close();
  console.log(failures ? `${failures} failed` : `all ${FILES.length} lessons passed`);
})();
