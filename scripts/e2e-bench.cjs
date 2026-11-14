/* global require, process, console, window, document, localStorage, sessionStorage, Image, __dirname, location */
/* eslint-disable @typescript-eslint/no-require-imports */
// Browser smoke tests of the 3D bench (not part of npm test: needs a running e2e build).
//   npm run e2e                       (builds dist-e2e/, starts a preview, runs this and e2e-routes)
//   node scripts/e2e-bench.cjs [baseUrl] [--only name,name]
// The page is opened with `?e2e`, which a VITE_E2E=1 build honours (src/e2e/flag.ts): window.__bb
// projects hole ids to client coordinates and counts rendered frames, so nothing here depends on
// hard-coded pixels. On a failure a screenshot goes to e2e-artifacts/.
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const { mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith('--') && /^https?:/.test(a)) || 'http://localhost:4174/').replace(/\/?$/, '/');
const ONLY = (() => {
  const i = args.indexOf('--only');
  return i >= 0 ? args[i + 1].split(',') : null;
})();
const ART = join(__dirname, '..', 'e2e-artifacts');
let failures = 0;
const assert = (c, m) => {
  if (!c) {
    console.log('FAIL', m);
    failures++;
    process.exitCode = 1;
  } else console.log('ok  ', m);
  return !!c;
};

const LAUNCH = { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
const url = (hash, q = '') => `${BASE}?e2e${q}${hash}`;

/** fresh context (English, empty storage unless given), page at `hash`, waiting for the bench hook */
async function open(browser, hash, { storage = {}, q = '', viewport = { width: 1440, height: 900 }, waitHook = true, reducedMotion } = {}) {
  const ctx = await browser.newContext({ locale: 'en-US', viewport, reducedMotion });
  await ctx.addInitScript(
    (st) => {
      if (sessionStorage.getItem('seeded')) return;
      for (const [k, v] of Object.entries(st)) localStorage.setItem(k, typeof v === 'string' && k.startsWith('raw:') ? v : JSON.stringify(v));
      sessionStorage.setItem('seeded', '1');
    },
    { 'bb.lang': 'en', ...storage },
  );
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto(url(hash, q));
  if (waitHook) {
    await p.waitForFunction(() => window.__bb && window.__bb.frames > 2, null, { timeout: 30000 });
    await p.waitForTimeout(300);
  }
  return { p, ctx, errors };
}

const hole = (p, id) => p.evaluate((h) => window.__bb.hole(h), id);
const layout = (p) => p.evaluate(() => window.__bb.store.getState().layout);
const saved = (p, key) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);
const clickHole = async (p, id, opts) => {
  const h = await hole(p, id);
  await p.mouse.click(h.x, h.y, opts);
  await p.waitForTimeout(120);
};
const frames = (p) => p.evaluate(() => window.__bb.frames);
/** wait (up to 15 s) until no frame has been rendered for 700 ms: start-up sampling, camera moves done */
async function settleFrames(p) {
  for (let i = 0, last = -1; i < 30; i++) {
    const f = await frames(p);
    if (f === last) return;
    last = f;
    await p.waitForTimeout(700);
  }
}
const tool = (p, name) => p.locator(`button.tool[title="${name}"]`).click();
const pinsOf = async (p, ref) => (await layout(p)).parts.find((x) => x.ref === ref)?.pins;
const nonBlank = (p, sel) =>
  p.evaluate((s) => {
    const c = document.querySelector(s);
    if (!c) return -1;
    const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height).data;
    // pixels that differ from the top-left (background) pixel
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - d[0]) + Math.abs(d[i + 1] - d[1]) + Math.abs(d[i + 2] - d[2]) > 60) n++;
    return n;
  }, sel);

/** count pixels darker than `lum` in a small square of a screenshot around (x, y) */
async function darkPixels(p, x, y, r = 9, lum = 110) {
  const buf = await p.screenshot({ clip: { x: x - r, y: y - r, width: 2 * r, height: 2 * r } });
  return p.evaluate(
    async ({ b64, lum }) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2] < lum) n++;
      return n;
    },
    { b64: buf.toString('base64'), lum },
  );
}

/** drag with the mouse from (x0, y0) to (x1, y1) in small steps */
async function drag(p, x0, y0, x1, y1) {
  await p.mouse.move(x0, y0);
  await p.mouse.down();
  for (let i = 1; i <= 12; i++) await p.mouse.move(x0 + ((x1 - x0) * i) / 12, y0 + ((y1 - y0) * i) / 12);
  await p.waitForTimeout(80);
  await p.mouse.up();
  await p.waitForTimeout(150);
}

/** readings of the lab's reference solution, from the validator (`--readings`) */
function referenceReadings(file) {
  const out = execFileSync('npx', ['tsx', 'scripts/validate-challenges.ts', file, '--readings', '--lang', 'en'], { cwd: join(__dirname, '..'), encoding: 'utf8' });
  const r = {};
  for (const m of out.matchAll(/reading\s+(\S+)\s+=\s+(-?[\d.e+-]+)/g)) r[m[1]] = Number(m[2]);
  return r;
}

const TESTS = {
  // lesson 1: the board texture with its row / column labels, the step's pulsing rings
  async lesson(browser) {
    const { p, ctx, errors } = await open(browser, '#/learn/lesson-breadboard-basics');
    try {
      const a1 = await hole(p, 'a1');
      const b1 = await hole(p, 'b1');
      // the column number "1" is printed ~one pitch outside row a
      const lx = a1.x + (a1.x - b1.x) * 0.98;
      const ly = a1.y + (a1.y - b1.y) * 0.98;
      const ink = await darkPixels(p, lx, ly, 6);
      const blank = await darkPixels(p, (a1.x + b1.x) / 2 + (await hole(p, 'a2')).x - a1.x, (a1.y + b1.y) / 2, 2); // between holes: cream board
      assert(ink >= 4, `lesson 1: column label "1" drawn next to a1 (${ink} ink pixels)`);
      assert(blank === 0, `lesson 1: board between holes is blank (${blank})`);
      const pulses = await p.evaluate(() => window.__bb.pulses());
      assert(pulses === 2, `lesson 1: step 1 highlights its 2 holes (${pulses} pulse rings)`);
      assert((await p.locator('.step-cur').textContent()).length > 10, 'lesson 1: step text shown');
      await p.locator('.steps button.primary').click();
      await p.waitForTimeout(200);
      const pulses2 = await p.evaluate(() => window.__bb.pulses());
      assert(pulses2 === 6, `lesson 1: step 2 highlights 6 holes (${pulses2})`);
      assert(errors.length === 0, 'lesson 1: no page errors ' + errors.join(' | '));
    } finally {
      await shot(p, 'lesson');
      await ctx.close();
    }
  },

  // sandbox: place by clicking holes, hover tip, drag-move, rejected drop, undo / redo, slider, delete
  async editing(browser) {
    const { p, ctx, errors } = await open(browser, '#/sandbox');
    try {
      await tool(p, 'Battery');
      await clickHole(p, 'tp3');
      await clickHole(p, 'tn3');
      await tool(p, 'Resistor');
      await clickHole(p, 'c10');
      await clickHole(p, 'c14');
      await p.waitForTimeout(600); // the layout is saved 400 ms after the last change
      const st = await saved(p, 'bb.layout.sandbox');
      const bat = st?.parts.find((x) => x.type === 'battery');
      const res = st?.parts.find((x) => x.type === 'resistor');
      assert(bat && bat.pins['+'] === 'tp3' && bat.pins['-'] === 'tn3', 'place: battery saved at tp3 / tn3 ' + JSON.stringify(bat?.pins));
      assert(res && res.pins['1'] === 'c10' && res.pins['2'] === 'c14', 'place: resistor saved at c10 → c14 ' + JSON.stringify(res?.pins));

      // hover tip (after the camera has finished any move a placement started)
      await tool(p, 'Select / use');
      await settleFrames(p);
      const e20 = await hole(p, 'e20');
      await p.mouse.move(e20.x, e20.y);
      await p.waitForTimeout(250);
      const tip = await p
        .locator('.hole-tip')
        .textContent({ timeout: 2000 })
        .catch(() => '');
      const why = tip
        ? ''
        : JSON.stringify(
            await p.evaluate(() => ({
              hover: window.__bb.store.getState().hoverHole,
              tool: window.__bb.store.getState().tool,
              at: window.__bb.hole('e20'),
              el: document.elementFromPoint(window.__bb.hole('e20').x, window.__bb.hole('e20').y)?.className,
            })),
          );
      assert(/^e20/.test(tip) && /connected inside/.test(tip), 'hover: tip names the hole and its strip: ' + tip + why + JSON.stringify(e20));

      // drag the resistor two rows down (c → e)
      const past0 = await p.evaluate(() => window.__bb.store.getState().past.length);
      const body = await p.evaluate(() => {
        // the body sits above the board: aim at the resistor's middle, slightly raised
        const s = window.__bb.store.getState().layout.parts.find((x) => x.type === 'resistor');
        const a = window.__bb.hole(s.pins['1']);
        const b = window.__bb.hole(s.pins['2']);
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      });
      const dy = (await hole(p, 'e12')).y - (await hole(p, 'c12')).y;
      const dx = (await hole(p, 'e12')).x - (await hole(p, 'c12')).x;
      await drag(p, body.x, body.y - 4, body.x + dx, body.y - 4 + dy);
      const moved = await pinsOf(p, 'R1');
      assert(moved && moved['1'] === 'e10' && moved['2'] === 'e14', 'drag: resistor moved to e10 → e14 ' + JSON.stringify(moved));
      const past1 = await p.evaluate(() => window.__bb.store.getState().past.length);
      assert(past1 === past0 + 1, `drag: one undo step (${past0} → ${past1})`);

      // a drop onto the battery's hole is refused: the part stays, a toast says why
      const body2 = { x: body.x + dx, y: body.y - 4 + dy };
      const t3 = await hole(p, 'tp3');
      const e10 = await hole(p, 'e10');
      await drag(p, body2.x, body2.y, body2.x + (t3.x - e10.x), body2.y + (t3.y - e10.y));
      const kept = await pinsOf(p, 'R1');
      assert(kept && kept['1'] === 'e10' && kept['2'] === 'e14', 'invalid drop: resistor stays at e10 → e14 ' + JSON.stringify(kept));
      const past2 = await p.evaluate(() => window.__bb.store.getState().past.length);
      assert(past2 === past1, `invalid drop: no undo step (${past2})`);

      // undo / redo (keyboard and toolbar)
      await p.locator('body').press('Control+z');
      await p.waitForTimeout(150);
      assert((await pinsOf(p, 'R1'))['1'] === 'c10', 'undo (Ctrl+Z): resistor back at c10');
      await p.locator('.toolbar button[aria-label="Redo"]').click();
      await p.waitForTimeout(150);
      assert((await pinsOf(p, 'R1'))['1'] === 'e10', 'redo (toolbar): resistor at e10 again');

      // bench supply: one slider drag = one undo step
      await tool(p, 'Bench power supply');
      await clickHole(p, 'bp3');
      await clickHole(p, 'bn3');
      await p.locator('.side .tabs [role="tab"]', { hasText: 'Properties' }).click();
      const slider = p.locator('.inspector input[type="range"]').first();
      const v0 = (await layout(p)).parts.find((x) => x.type === 'bench_supply').props.voltage;
      const pastS = await p.evaluate(() => window.__bb.store.getState().past.length);
      const box = await slider.boundingBox();
      await p.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
      await p.mouse.down();
      for (let i = 1; i <= 10; i++) await p.mouse.move(box.x + box.width * (0.2 + i * 0.05), box.y + box.height / 2);
      await p.mouse.up();
      await p.waitForTimeout(150);
      const v1 = (await layout(p)).parts.find((x) => x.type === 'bench_supply').props.voltage;
      const pastE = await p.evaluate(() => window.__bb.store.getState().past.length);
      assert(v1 !== v0 && v1 > 15, `slider: voltage ${v0} → ${v1} V`);
      assert(pastE === pastS + 1, `slider: one drag = one undo step (${pastS} → ${pastE})`);
      await p.locator('body').press('Control+z');
      await p.waitForTimeout(150);
      assert((await layout(p)).parts.find((x) => x.type === 'bench_supply').props.voltage === v0, 'slider: one undo restores ' + v0 + ' V');

      // delete + the toast's Undo (select it first: in select mode a click on its hole picks it)
      await tool(p, 'Select / use');
      await clickHole(p, 'bp3');
      await p.locator('.inspector button.danger').click();
      await p.waitForTimeout(150);
      assert(!(await layout(p)).parts.some((x) => x.type === 'bench_supply'), 'delete: supply removed');
      const toast = p.locator('.toast');
      assert(/Deleted PSU1/.test(await toast.textContent()), 'delete: toast ' + (await toast.textContent()));
      await p.locator('.toast-action').click();
      await p.waitForTimeout(150);
      assert(
        (await layout(p)).parts.some((x) => x.type === 'bench_supply'),
        'delete: toast Undo brings it back',
      );
      assert(errors.length === 0, 'editing: no page errors ' + errors.join(' | '));
    } finally {
      await shot(p, 'editing');
      await ctx.close();
    }
  },

  // a scope lab: reference answer, check, waveform drawn, measurement stage, wrong / right reading
  async scopeLab(browser) {
    const ref = referenceReadings('challenges/227-inverting-amp.json');
    const { p, ctx, errors } = await open(browser, '#/challenges/exp-inverting-amp');
    try {
      await p.locator('.actions button', { hasText: 'Show answer' }).click();
      await p.locator('.confirm-pop button.danger-solid').first().click();
      await p.waitForTimeout(500);
      await p.locator('.actions button.primary.big').click();
      await p.waitForTimeout(500);
      const ok = await p.locator('.check-result .ok-box').textContent();
      assert(/Stage 1 done/.test(ok), 'scope lab: check passes, stage 1 done');
      await p.waitForSelector('canvas.sc-screen', { timeout: 5000 });
      await p.waitForTimeout(400);
      const sel = 'canvas.sc-screen';
      const ink = await nonBlank(p, sel);
      assert(ink > 500, `scope lab: scope panel drew a trace (${ink} non-background pixels)`);
      assert((await p.locator('.mq-section').count()) === 1, 'scope lab: measurement stage shown');
      const q1 = p.locator('.mq').first();
      // question 1 asks for a prediction first
      await q1.locator('input').first().fill('2.2');
      await q1.locator('form button[type="submit"]').first().click();
      await p.waitForTimeout(200);
      const vpp = ref.vpp;
      assert(Number.isFinite(vpp), 'scope lab: reference Vpp from the validator ' + vpp);
      const reading = q1.locator('input[aria-label$="reading"]');
      await reading.fill(String(+(vpp * 2).toPrecision(3)));
      await reading.press('Enter');
      await p.waitForTimeout(400);
      assert((await q1.locator('.pr-feedback.bad, .pr-feedback.close').count()) === 1 && (await q1.locator('.pr-feedback.ok').count()) === 0, 'scope lab: wrong reading rejected');
      await reading.fill(String(+vpp.toPrecision(3)));
      await reading.press('Enter');
      await p.waitForTimeout(400);
      assert((await q1.locator('.pr-feedback.ok').count()) === 1, `scope lab: right reading ${vpp.toPrecision(3)} V accepted`);
      assert(errors.length === 0, 'scope lab: no page errors ' + errors.join(' | '));
    } finally {
      await shot(p, 'scope-lab');
      await ctx.close();
    }
  },

  // a Phase 5 MCU lab with PWM: frames run while the motor spins, none when the scene is idle
  async mcuPwm(browser) {
    const { p, ctx, errors } = await open(browser, '#/challenges/exp5-pwm-mosfet-motor');
    try {
      await settleFrames(p);
      const idle0 = await frames(p);
      await p.waitForTimeout(3000);
      const idle1 = await frames(p);
      assert(idle1 - idle0 === 0, `mcu: empty board renders on demand (${idle1 - idle0} frames in 3 s)`);
      await p.locator('.actions button', { hasText: 'Show answer' }).click();
      await p.locator('.confirm-pop button.danger-solid').first().click();
      await p.waitForTimeout(800);
      await p.locator('.actions button.primary.big').click();
      await p.waitForTimeout(400);
      assert(/Stage 1 done|Perfect/.test(await p.locator('.check-result .ok-box').textContent()), 'mcu: check passes');
      const f0 = await frames(p);
      await p.waitForTimeout(1000);
      const f1 = await frames(p);
      assert(f1 - f0 >= 5, `mcu: motor spinning, frames advance (${f1 - f0} in 1 s)`);
      // the MCU inspector's PWM duty slider: one drag = one undo step (window listeners in state/store.ts)
      const pin = await p.evaluate(() => {
        const s = window.__bb.store.getState();
        const b = s.layout.parts.find((x) => /esp32|stm32/.test(x.type));
        const name = Object.entries(b.props.pins ?? {}).find(([, c]) => c && c.mode === 'pwm')?.[0];
        s.selectPin(b.id, name);
        s.setPanel('inspect');
        return { id: b.id, name };
      });
      await p.waitForTimeout(300);
      const duty = p.locator('.inspector input[type="range"][max="100"]').first();
      await duty.scrollIntoViewIfNeeded();
      const dutyOf = () => p.evaluate((q) => window.__bb.store.getState().layout.parts.find((x) => x.id === q.id).props.pins[q.name].duty, pin);
      const d0 = await dutyOf();
      const pastD = await p.evaluate(() => window.__bb.store.getState().past.length);
      const db = await duty.boundingBox();
      await p.mouse.move(db.x + db.width * 0.5, db.y + db.height / 2);
      await p.mouse.down();
      for (let i = 1; i <= 8; i++) await p.mouse.move(db.x + db.width * (0.5 + i * 0.05), db.y + db.height / 2);
      await p.mouse.up();
      await p.waitForTimeout(200);
      const d1 = await dutyOf();
      const pastD1 = await p.evaluate(() => window.__bb.store.getState().past.length);
      assert(d1 > d0 + 10 && pastD1 === pastD + 1, `mcu: PWM duty slider ${d0} → ${d1} % in one undo step (${pastD} → ${pastD1})`);
      await p.keyboard.press('Control+z');
      await p.waitForTimeout(200);
      assert((await dutyOf()) === d0, 'mcu: one undo restores the duty ' + d0 + ' %');
      // take the motor off the board: nothing animates, so the frame loop must go idle
      await p.evaluate(() => {
        const s = window.__bb.store.getState();
        const mot = s.layout.parts.find((x) => x.type === 'motor');
        s.removePart(mot.id);
      });
      await settleFrames(p);
      const g0 = await frames(p);
      await p.waitForTimeout(3000);
      const g1 = await frames(p);
      assert(g1 - g0 === 0, `mcu: idle again, no frames over 3 s (${g1 - g0})`);
      assert(errors.length === 0, 'mcu: no page errors ' + errors.join(' | '));
    } finally {
      await shot(p, 'mcu');
      await ctx.close();
    }
  },

  // view button cycles four views; a language switch keeps the same canvas element
  async viewAndLang(browser) {
    const { p, ctx, errors } = await open(browser, '#/sandbox');
    try {
      const names = [];
      for (let i = 0; i < 4; i++) {
        await p.locator('.view-btn').click();
        await p.waitForTimeout(150);
        names.push((await p.locator('.view-btn b').textContent()).trim());
      }
      assert(names.join(',') === 'Top,Front,Side,Angled', 'view button cycles 4 views: ' + names.join(' → '));
      await p.evaluate(() => (window.__canvasMark = window.__bb.canvas));
      await p.locator('.lang-switch button', { hasText: '中文' }).click();
      await p.waitForTimeout(500);
      const same = await p.evaluate(() => document.querySelector('.stage-view canvas') === window.__canvasMark && window.__bb.canvas === window.__canvasMark);
      assert(same, 'language switch keeps the same canvas element');
      assert(/视角/.test(await p.locator('.view-btn').textContent()), 'language switch: bench text in Chinese');
      assert(errors.length === 0, 'view/lang: no page errors ' + errors.join(' | '));
    } finally {
      await shot(p, 'view-lang');
      await ctx.close();
    }
  },

  // the scope window never covers the current step's highlighted holes (1366×768, lessons 13 and
  // 16 with their reference circuits): it picks a clear corner, narrows, or starts collapsed; a
  // position the user drags it to wins
  async scopeClear(browser) {
    const { p, ctx, errors } = await open(browser, '#/learn/lesson-mcu-pwm-adc', { viewport: { width: 1366, height: 768 } });
    try {
      for (const [file, id] of [
        ['108-lesson-mcu-pwm-adc.json', 'lesson-mcu-pwm-adc'],
        ['105-lesson-scope-two-channels.json', 'lesson-scope-two-channels'],
      ]) {
        await p.evaluate((h) => (location.hash = h), `#/learn/${id}`);
        await p.waitForFunction((i) => document.querySelector('.task h2') && location.hash.endsWith(i), id, { timeout: 20000 });
        const code = `import { readFileSync } from 'node:fs'; import { parseChallenge } from './src/core/challenge';
          const c = parseChallenge(JSON.parse(readFileSync('challenges/${file}', 'utf8'))).challenge;
          console.log(JSON.stringify({ solution: c.solution, steps: c.steps.map((s) => s.highlight) }));`;
        const { solution, steps } = JSON.parse(execFileSync('npx', ['tsx', '-e', code], { cwd: join(__dirname, '..'), encoding: 'utf8' }));
        await p.evaluate((sol) => window.__bb.store.getState().loadLayout(sol), solution);
        for (let i = 0; i < steps.length; i++) {
          if (!steps[i].length) continue;
          await p.evaluate((n) => window.__bb.store.getState().setStep(n), i);
          await p.waitForTimeout(250);
          const hidden = await p.evaluate((hl) => {
            const r = document.querySelector('.sc').getBoundingClientRect();
            return hl.filter((h) => {
              const q = window.__bb.hole(h);
              return q.x >= r.left && q.x <= r.right && q.y >= r.top && q.y <= r.bottom;
            });
          }, steps[i]);
          assert(hidden.length === 0, `${id} step ${i + 1}: the scope window covers none of ${steps[i].join(' ')}${hidden.length ? ' (covers ' + hidden.join(' ') + ')' : ''}`);
        }
      }
      // a dragged window stays where the user put it
      const head = await p.locator('.sc-head').boundingBox();
      await drag(p, head.x + 60, head.y + 10, head.x - 200, head.y + 10);
      const d = await p.evaluate(() => window.__bb.store.getState().scope.drag);
      await p.evaluate(() => window.__bb.store.getState().setStep(4));
      await p.waitForTimeout(250);
      const after = await p.locator('.sc-head').boundingBox();
      assert(d.x < -100 && Math.abs(after.x - (head.x - 260)) < 30, `dragged scope stays put (drag ${Math.round(d.x)}, x ${Math.round(head.x)} → ${Math.round(after.x)})`);
      await p.evaluate(() => window.__bb.store.getState().setScope({ drag: { x: 0, y: 0 } }));
      assert(errors.length === 0, 'scope placement: no page errors ' + errors.join(' | '));
    } finally {
      await shot(p, 'scope-clear');
      await ctx.close();
    }
  },

  // placing a part in a lesson keeps the step in view (a chip names the part and leads to
  // Properties); in the sandbox a part tool still opens its settings
  async lessonPlacement(browser) {
    const { p, ctx, errors } = await open(browser, '#/learn/lesson-multimeter');
    try {
      const tab = () => p.locator('aside.side [role=tab][aria-selected=true]').textContent();
      await tool(p, 'Battery');
      assert(/^Lesson/.test(await tab()), 'lesson: picking a part tool keeps the Lesson tab (' + (await tab()) + ')');
      await clickHole(p, 'tp1');
      await clickHole(p, 'tn1');
      assert(/^Lesson/.test(await tab()), 'lesson: after placing, the Lesson tab is still shown');
      assert(await p.locator('section.steps .step-check.ok').isVisible(), 'lesson: the step shows its check as done');
      const chip = p.locator('.placed-chip');
      assert(/BAT1/.test((await chip.textContent()) || ''), 'lesson: a chip names the part just placed');
      await chip.locator('button.link').click();
      assert(/^Properties/.test(await tab()), 'lesson: the chip opens Properties on request');
      await p.evaluate(() => (location.hash = '#/sandbox'));
      await p.waitForTimeout(800);
      await tool(p, 'Resistor');
      assert(/^Properties/.test(await tab()), 'sandbox: a part tool still opens Properties');
      assert(errors.length === 0, 'lesson placement: no page errors ' + errors.join(' | '));
    } finally {
      await shot(p, 'lesson-placement');
      await ctx.close();
    }
  },

  // the default view shows the whole board — all four rails — with nothing over its holes
  // (Chinese text at 1366×768 used to leave the bottom rail under the toolbar / off the canvas)
  async boardInView(browser) {
    for (const [lang, width, height] of [
      ['zh', 1366, 768],
      ['en', 1366, 768],
      ['zh', 1440, 900],
    ]) {
      const { p, ctx, errors } = await open(browser, '#/learn/lesson-mcu-pwm-adc', { viewport: { width, height }, storage: { 'bb.lang': lang } });
      try {
        await settleFrames(p);
        const blocked = await p.evaluate(() =>
          ['tp1', 'tp30', 'tn1', 'tn30', 'bp1', 'bp30', 'bn1', 'bn15', 'bn30'].filter((h) => {
            const q = window.__bb.hole(h);
            return document.elementFromPoint(q.x, q.y) !== window.__bb.canvas;
          }),
        );
        assert(blocked.length === 0, `${lang} ${width}×${height}: every rail corner is on the canvas, uncovered${blocked.length ? ' (not: ' + blocked.join(' ') + ')' : ''}`);
        assert(errors.length === 0, `${lang} ${width}: no page errors ` + errors.join(' | '));
      } finally {
        await ctx.close();
      }
    }
  },

  // the camera stays where the user put it: placing parts, switching panel tabs, the circuit check
  // and leaving the bench for the Guide and coming back never reset it to the default view
  async cameraKept(browser) {
    const { p, ctx, errors } = await open(browser, '#/learn/lesson-ammeter', { viewport: { width: 1366, height: 768 } });
    try {
      await p.locator('.view-btn').click();
      await settleFrames(p);
      const cam = () => p.evaluate(() => window.__bb.camera());
      const fmt = (v) => v.map((x) => x.toFixed(1)).join(',');
      const before = await cam();
      const kept = async (what) => {
        await settleFrames(p);
        const now = await cam();
        assert(Math.hypot(...now.map((x, i) => x - before[i])) < 0.05, `camera kept after ${what} (${fmt(before)} → ${fmt(now)})`);
      };
      await tool(p, 'Battery');
      await clickHole(p, 'tp1');
      await clickHole(p, 'tn1');
      await kept('placing a part');
      await p.locator('aside.side [role=tab]', { hasText: /^Lesson/ }).click();
      await p.locator('.actions button.primary.big').click();
      await kept('a tab switch and the circuit check');
      await p.evaluate(() => (location.hash = '#/guide'));
      await p.waitForTimeout(800);
      await p.evaluate(() => (location.hash = '#/learn/lesson-ammeter'));
      await p.waitForFunction(() => window.__bb && document.querySelector('.stage-view canvas') === window.__bb.canvas, null, { timeout: 20000 });
      await kept('leaving the bench and coming back');
      assert((await p.locator('.view-btn b').textContent()).trim() === 'Top', 'view button still says Top');
      assert(errors.length === 0, 'camera: no page errors ' + errors.join(' | '));
    } finally {
      await shot(p, 'camera-kept');
      await ctx.close();
    }
  },

  // keyboard only: skip link, build / move / delete by hole id, tabs by arrow keys, focus on route change
  async keyboard(browser) {
    const { p, ctx, errors } = await open(browser, '#/sandbox');
    try {
      await p.keyboard.press('Tab');
      const skip = await p.evaluate(() => document.activeElement.textContent);
      assert(skip === 'Skip to content', 'keyboard: first Tab reaches the skip link: ' + skip);
      await p.keyboard.press('Enter');
      await p.waitForTimeout(100);
      assert(await p.evaluate(() => document.activeElement.matches('#main h1')), 'keyboard: skip link moves focus to the page heading');
      const sum = p.locator('.kb-bench > summary');
      await sum.focus();
      await p.keyboard.press('Enter');
      const sel = p.locator('.kb-place select');
      await sel.focus();
      await sel.selectOption('battery');
      const field = p.locator('.kb-place input');
      await field.focus();
      await p.keyboard.type('tp3 tn3');
      await p.keyboard.press('Enter');
      await p.waitForTimeout(150);
      await sel.selectOption('resistor');
      await field.focus();
      await p.keyboard.type('C10, c14');
      await p.keyboard.press('Enter');
      await p.waitForTimeout(150);
      const lay = await layout(p);
      const bat = lay.parts.find((x) => x.type === 'battery');
      const r1 = lay.parts.find((x) => x.type === 'resistor');
      assert(bat?.pins['+'] === 'tp3' && bat?.pins['-'] === 'tn3' && r1?.pins['1'] === 'c10' && r1?.pins['2'] === 'c14', 'keyboard: battery and resistor placed by hole id');
      assert(/Placed R1/.test(await p.locator('.kb-place [aria-live]').textContent()), 'keyboard: placement announced');
      assert((await p.evaluate(() => window.__bb.store.getState().tool)) === 'select', 'keyboard: tool back to select');
      await field.focus();
      await p.keyboard.type('c14 c18');
      await p.keyboard.press('Enter');
      await p.waitForTimeout(150);
      assert((await layout(p)).parts.length === 2 && (await p.locator('.kb-place .form-err').count()) === 1, 'keyboard: a placement on a used hole is refused with a message');
      await field.fill('zz9');
      await p.keyboard.press('Enter');
      assert(/no hole zz9/.test(await p.locator('.kb-place .form-err').textContent()), 'keyboard: unknown hole id explained');
      await p.locator('.kb-actions button', { hasText: 'Move' }).nth(1).focus();
      await p.keyboard.press('Enter');
      await p.waitForTimeout(100);
      await p.keyboard.press('Control+a');
      await p.keyboard.type('e10 e14');
      await p.keyboard.press('Enter');
      await p.waitForTimeout(150);
      const moved = await pinsOf(p, 'R1');
      assert(moved['1'] === 'e10' && moved['2'] === 'e14', 'keyboard: Move R1 to e10 e14 ' + JSON.stringify(moved));
      assert(
        /R1 \(.*\): .*e10/.test(await p.locator('#board-desc').textContent()),
        'keyboard: board description lists R1 at e10: ' + (await p.locator('#board-desc').textContent()).slice(0, 120),
      );
      await p.locator('.kb-actions button', { hasText: 'Select' }).nth(1).focus();
      await p.keyboard.press('Enter');
      await p.waitForTimeout(150);
      assert(
        (await p.evaluate(() => window.__bb.store.getState().selectedId)) === (await layout(p)).parts[1].id && (await p.evaluate(() => document.activeElement.id)) === 'side-panel',
        'keyboard: Select picks R1 and focuses the properties panel',
      );
      await p.locator('.kb-actions button', { hasText: 'Delete' }).nth(1).focus();
      await p.keyboard.press('Enter');
      await p.waitForTimeout(150);
      assert((await layout(p)).parts.length === 1, 'keyboard: Delete removes R1');
      // side panel tabs: arrow keys move between tabs
      await p.locator('.side [role="tab"][aria-selected="true"]').focus();
      const t0 = await p.evaluate(() => document.activeElement.textContent);
      await p.keyboard.press('ArrowRight');
      await p.waitForTimeout(100);
      const t1 = await p.evaluate(() => [document.activeElement.textContent, document.activeElement.getAttribute('aria-selected')]);
      assert(t1[0] !== t0 && t1[1] === 'true', `keyboard: → moves from tab "${t0}" to "${t1[0]}" and selects it`);
      // route change: focus goes to the new page's heading
      await p.locator('nav.nav button', { hasText: 'Practice' }).focus();
      await p.keyboard.press('Enter');
      await p.waitForSelector('#main h1.pr-title', { timeout: 15000 });
      await p.waitForTimeout(300);
      assert(await p.evaluate(() => document.activeElement.matches('#main h1')), 'keyboard: after a page change focus is on the page heading');
      assert(errors.length === 0, 'keyboard: no page errors ' + errors.join(' | '));
    } finally {
      await shot(p, 'keyboard');
      await ctx.close();
    }
  },

  // keyboard building inside a lesson: one announcement, the placed-part chip keeps focus sensible
  async keyboardLesson(browser) {
    const { p, ctx, errors } = await open(browser, '#/learn/lesson-ammeter');
    try {
      await p.locator('.kb-bench > summary').focus();
      await p.keyboard.press('Enter');
      await p.locator('.kb-place select').selectOption('resistor');
      await p.locator('.kb-place input').focus();
      await p.keyboard.type('c20 c24');
      await p.keyboard.press('Enter');
      await p.waitForTimeout(300);
      const placed = (await layout(p)).parts.find((x) => x.type === 'resistor' && x.pins['1'] === 'c20');
      assert(!!placed, 'lesson: resistor placed by hole id');
      const live = await p.evaluate(
        () => [...document.querySelectorAll('[aria-live], [role="status"]')].filter((e) => /R\d/.test(e.textContent) && /c20|placed|放置|放好/i.test(e.textContent)).length,
      );
      assert(live === 1, `lesson: the placement is announced by one live region (${live})`);
      assert((await p.locator('.side [role="tab"][aria-selected="true"]').textContent()) !== 'Properties', 'lesson: placing keeps the task tab (no jump to Properties)');
      const chip = p.locator('.placed-chip button.link');
      if (await chip.count()) {
        await chip.focus();
        await p.keyboard.press('Enter');
        await p.waitForTimeout(200);
        assert(await p.evaluate(() => document.activeElement.id === 'side-panel'), 'lesson: "Edit in Properties" moves focus to the properties panel');
      }
      assert(errors.length === 0, 'keyboard lesson: no page errors ' + errors.join(' | '));
    } finally {
      await shot(p, 'kb-lesson');
      await ctx.close();
    }
  },

  // keyboard on the newer pages: figure viewer dialog, phone drawer, quiz timer / pause / submit
  async keyboardPages(browser) {
    {
      const { p, ctx, errors } = await open(browser, '#/practice/basics-01-ohm', { viewport: { width: 390, height: 844 }, waitHook: false });
      try {
        await p.waitForSelector('.pr-main .pr-title', { timeout: 20000 });
        const zoom = p.locator('.fig-zoom').first();
        await zoom.focus();
        await p.keyboard.press('Enter');
        await p.waitForSelector('.fig-viewer[role="dialog"][aria-modal="true"]');
        const inDlg = () => p.evaluate(() => !!document.activeElement.closest('.fig-viewer'));
        let trapped = await inDlg();
        for (let i = 0; i < 5; i++) {
          await p.keyboard.press('Tab');
          trapped = trapped && (await inDlg());
        }
        assert(trapped, 'viewer: focus starts in the dialog and Tab stays inside it');
        assert(await p.evaluate(() => document.getElementById('root').inert), 'viewer: the page behind is inert');
        await p.keyboard.press('Escape');
        await p.waitForTimeout(150);
        assert(
          (await p.locator('.fig-viewer').count()) === 0 && (await p.evaluate(() => document.activeElement.classList.contains('fig-zoom'))),
          'viewer: Esc closes it, focus back on its button',
        );
        const tog = p.locator('.pr-phone-nav button[aria-controls="pr-side"]');
        await tog.focus();
        await p.keyboard.press('Enter');
        await p.waitForTimeout(250);
        assert(
          (await tog.getAttribute('aria-expanded')) === 'true' && (await p.evaluate(() => !!document.activeElement.closest('.pr-side'))),
          'drawer: opens expanded, focus moves into it',
        );
        await p.keyboard.press('Escape');
        await p.waitForTimeout(150);
        assert(
          (await tog.getAttribute('aria-expanded')) === 'false' && (await p.evaluate(() => document.activeElement.matches('.pr-phone-nav button[aria-controls="pr-side"]'))),
          'drawer: Esc closes it, focus back on the toggle',
        );
        const rev = p.locator('.pr-phone-review');
        await rev.focus();
        await p.keyboard.press('Enter');
        await p.waitForTimeout(250);
        assert(
          (await rev.getAttribute('aria-expanded')) === 'true' && (await p.evaluate(() => !!document.activeElement.closest('#pr-phone-menu'))),
          'review menu: opens, focus on its first link',
        );
        await p.keyboard.press('Escape');
        await p.waitForTimeout(150);
        assert(
          (await p.locator('#pr-phone-menu').count()) === 0 && (await p.evaluate(() => document.activeElement.classList.contains('pr-phone-review'))),
          'review menu: Esc closes it, focus back on its button',
        );
        assert(errors.length === 0, 'viewer / drawer: no page errors ' + errors.join(' | '));
      } finally {
        await shot(p, 'kb-phone');
        await ctx.close();
      }
    }
    {
      const { p, ctx, errors } = await open(browser, '#/practice/quiz', { waitHook: false });
      try {
        // the problem index must be in first (it resets the chapter picks when it arrives)
        await p.waitForFunction(() => /^\d+\/\d+$/.test(document.querySelector('.progress-card b')?.textContent.trim() ?? ''), null, { timeout: 20000 });
        const box = p.locator('.ms-chpick input[type="checkbox"]').first();
        await box.focus();
        await p.keyboard.press('Space');
        const start = p.locator('.ms-setup button.primary:not(:disabled)').first();
        await start.focus();
        await p.keyboard.press('Enter');
        await p.waitForSelector('.ms-quiz', { timeout: 15000 });
        await p.waitForTimeout(300);
        const live = p.locator('.ms-quiz > .sr-only[aria-live]');
        assert(
          (await p.locator('.ms-timer[role="timer"][aria-live="off"]').count()) === 1 && (await live.textContent()) === '',
          'quiz: the ticking timer is not live; nothing announced at the start',
        );
        const pause = p.locator('.ms-timer button[aria-pressed]');
        await pause.focus();
        await p.keyboard.press('Enter');
        await p.waitForTimeout(150);
        assert((await pause.getAttribute('aria-pressed')) === 'true' && (await live.textContent()) === 'Quiz paused', 'quiz: pause by keyboard, announced once');
        await pause.focus();
        await p.keyboard.press('Enter');
        await p.waitForTimeout(150);
        const submit = p.locator('.ms-quiz .confirm-wrap button.primary');
        await submit.focus();
        await p.keyboard.press('Enter');
        await p.waitForTimeout(150);
        await p.keyboard.press('Shift+Tab');
        await p.keyboard.press('Shift+Tab');
        await p.locator('.confirm-pop button.danger-solid').focus();
        await p.keyboard.press('Enter');
        await p.waitForSelector('.ms-quiz', { state: 'detached', timeout: 10000 });
        assert(/results/i.test(await p.locator('#main h1').textContent()), 'quiz: submitted by keyboard, results shown: ' + (await p.locator('#main h1').textContent()));
        assert(errors.length === 0, 'quiz: no page errors ' + errors.join(' | '));
      } finally {
        await shot(p, 'kb-quiz');
        await ctx.close();
      }
    }
  },

  // damaged saved data and an injected render error
  async robustness(browser) {
    {
      const { p, ctx, errors } = await open(browser, '#/sandbox', {
        storage: { 'bb.route': '#/sandbox' },
        waitHook: false,
      });
      // corrupt the saved layouts, then reload
      await p.evaluate(() => {
        localStorage.setItem('bb.layout.sandbox', '{"version":1,"parts":[{"type":"resistor","pins":{"1":"zz99"}},{"nope":1},42');
        localStorage.setItem('bb.layout.ch.lesson-breadboard-basics', JSON.stringify({ version: 1, parts: [{ type: 'battery', ref: 7, pins: null }, 'x'] }));
      });
      await p.reload();
      await p.waitForFunction(() => window.__bb && window.__bb.frames > 2, null, { timeout: 30000 });
      assert((await p.locator('.error-boundary').count()) === 0 && (await p.locator('.stage-view canvas').count()) === 1, 'corrupted bb.layout.sandbox: bench still renders');
      await p.goto(url('#/learn/lesson-breadboard-basics'));
      await p.waitForTimeout(1500);
      assert((await p.locator('.error-boundary').count()) === 0 && (await p.locator('.stage-view canvas').count()) === 1, 'corrupted lesson layout: bench still renders');
      assert(errors.length === 0, 'corrupted storage: no uncaught errors ' + errors.join(' | '));
      await shot(p, 'corrupt');
      await ctx.close();
    }
    {
      const { p, ctx } = await open(browser, '#/sandbox', { q: '&crash=canvas', waitHook: false });
      await p.waitForSelector('.error-boundary', { timeout: 20000 }).catch(() => null);
      const eb = p.locator('.error-boundary.eb-canvas');
      assert((await eb.count()) === 1 && /injected render error/.test(await eb.textContent()), 'injected render error: caught by the canvas ErrorBoundary');
      assert((await p.locator('header.top nav').count()) === 1 && (await p.locator('.side').count()) === 1, 'injected render error: header and side panel still there');
      await shot(p, 'crash');
      await ctx.close();
    }
  },
};

async function shot(p, name) {
  if (!failures) return;
  try {
    mkdirSync(ART, { recursive: true });
    await p.screenshot({ path: join(ART, `bench-${name}.png`) });
  } catch {
    /* page already gone */
  }
}

(async () => {
  const t0 = Date.now();
  rmSync(ART, { recursive: true, force: true }); // screenshots of this run's failures only
  const browser = await chromium.launch(LAUNCH);
  for (const [name, fn] of Object.entries(TESTS)) {
    if (ONLY && !ONLY.includes(name)) continue;
    const before = failures;
    const t = Date.now();
    try {
      await fn(browser);
    } catch (e) {
      assert(false, `${name}: ${e.message.split('\n')[0]}`);
    }
    console.log(`  ${failures > before ? '✘' : '✔'} ${name} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
  }
  await browser.close();
  console.log(`bench e2e: ${failures ? failures + ' failure(s)' : 'all passed'} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
})();
