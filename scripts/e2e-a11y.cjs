/* global require, process, console, window, document, localStorage, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports */
// Accessibility check (WCAG 2.1 A/AA rules of axe-core) of every page in Chinese and English,
// light theme, plus open popovers / dialogs. Fails on any serious or critical violation that is
// not in the documented baseline (scripts/a11y-baseline.json: rule ids allowed per page, each
// with the reason). `--report` prints the counts by rule and page without failing.
//   node scripts/e2e-a11y.cjs [baseUrl] [--report] [--json out.json]
const { chromium } = require('playwright');
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const args = process.argv.slice(2);
const BASE = (args.find((a) => /^https?:/.test(a)) || 'http://localhost:4174/').replace(/\/?$/, '/');
const REPORT = args.includes('--report');
const JSON_OUT = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASELINE = JSON.parse(readFileSync(join(__dirname, 'a11y-baseline.json'), 'utf8'));

const PAGES = [
  { name: 'learn', hash: '#/learn/lesson-breadboard-basics', ready: '.lesson-pick-name[data-active]' },
  { name: 'challenge-lab', hash: '#/challenges/exp-inverting-amp', ready: '.lesson-pick-name[data-active]' },
  { name: 'sandbox', hash: '#/sandbox', ready: '.stage-view canvas' },
  { name: 'practice', hash: '#/practice/basics-01-ohm', ready: '.pr-main .pr-title' },
  { name: 'practice-choice', hash: '#/practice/basics-03-power-sign', ready: '.pr-main .pr-title' },
  { name: 'summary', hash: '#/practice/summary/basics', ready: '.sum-main' },
  { name: 'guide', hash: '#/guide', ready: '#guide-led' },
  { name: 'import', hash: '#/import', ready: 'main, .import-page' },
  // states: the sandbox with parts, the inspector and an open confirm popover; a checked lab
  { name: 'sandbox-parts', hash: '#/sandbox', ready: '.stage-view canvas', setup: 'parts' },
  { name: 'lab-checked', hash: '#/challenges/exp-inverting-amp', ready: '.lesson-pick-name[data-active]', setup: 'checked' },
  { name: 'lesson-done', hash: '#/learn/lesson-breadboard-basics', ready: '.lesson-pick-name[data-active]', setup: 'celebrate' },
  { name: 'practice-answered', hash: '#/practice/basics-01-ohm', ready: '.pr-main .pr-title', setup: 'answered' },
  // Practice mastery pages
  { name: 'review', hash: '#/practice/review', ready: '.ms-main' },
  { name: 'review-due', hash: '#/practice/review/due', ready: '.ms-main' },
  { name: 'review-how', hash: '#/practice/review/how', ready: '.ms-main' },
  { name: 'quiz-setup', hash: '#/practice/quiz', ready: '.ms-main' },
  { name: 'quiz-running', hash: '#/practice/quiz', ready: '.ms-main', setup: 'quiz' },
  { name: 'quiz-paused', hash: '#/practice/quiz', ready: '.ms-main', setup: 'quiz-paused' },
  { name: 'quiz-results', hash: '#/practice/quiz', ready: '.ms-main', setup: 'quiz-results' },
  // an instrument lesson with per-step checks
  { name: 'lesson-steps', hash: '#/learn/lesson-ammeter', ready: '.lesson-pick-name[data-active]' },
  { name: 'lesson-placed', hash: '#/learn/lesson-ammeter', ready: '.lesson-pick-name[data-active]', setup: 'placed' },
  // phone UI (390 × 844, touch)
  { name: 'phone-drawer', hash: '#/practice/basics-01-ohm', ready: '.pr-main .pr-title', phone: true, setup: 'drawer' },
  { name: 'phone-figure-viewer', hash: '#/practice/basics-01-ohm', ready: '.pr-main .pr-title', phone: true, setup: 'viewer' },
  { name: 'phone-review-menu', hash: '#/practice/basics-01-ohm', ready: '.pr-main .pr-title', phone: true, setup: 'reviewmenu' },
  { name: 'phone-symbol-keys', hash: '#/practice/basics-01-ohm', ready: '.pr-main .pr-title', phone: true, setup: 'symkeys' },
  { name: 'phone-touch-chip', hash: '#/sandbox', ready: '.stage-view canvas', phone: true, setup: 'touchchip' },
];

/** The quiz page is a lazy chunk and the problem index arrives on its own: start a quiz only once
 *  the chapter list is ready (the index resets the picks when it lands), the first chapter is
 *  really ticked and Start is enabled; then wait for the first question to render — generously, CI
 *  runners and loaded machines are slow. `keyboard`: tick / start with Space / Enter. */
async function startQuiz(p, keyboard = false) {
  await p.waitForFunction(
    () => /^\d+\/\d+$/.test(document.querySelector('.progress-card b')?.textContent.trim() ?? '') && document.querySelector('.ms-chpick input[type="checkbox"]'),
    null,
    { timeout: 45000 },
  );
  const box = p.locator('.ms-chpick input[type="checkbox"]').first();
  if (!(await box.isChecked())) {
    if (keyboard) {
      await box.focus();
      await p.keyboard.press('Space');
    } else await box.check();
  }
  await p.waitForFunction(() => document.querySelector('.ms-chpick input[type="checkbox"]')?.checked, null, { timeout: 10000 });
  const start = p.locator('.ms-setup button.primary:not(:disabled)').first();
  await start.waitFor({ timeout: 30000 });
  if (keyboard) {
    await start.focus();
    await p.keyboard.press('Enter');
  } else await start.click();
  try {
    await p.waitForSelector('.ms-quiz .ms-qnav button', { timeout: 45000 });
  } catch (e) {
    const toast = await p
      .locator('.toast')
      .textContent()
      .catch(() => '');
    throw new Error(`quiz did not start within 45 s${toast ? ` (toast: ${toast})` : ''}: ${e.message.split('\n')[0]}`, { cause: e });
  }
}

async function setupPage(p, pg) {
  if (pg.setup === 'parts' || pg.setup === 'placed') await p.waitForFunction(() => window.__bb, null, { timeout: 30000 });
  await setup(p, pg.setup);
}

async function setup(p, kind) {
  if (kind === 'parts') {
    await p.evaluate(() => {
      const s = window.__bb.store.getState();
      s.loadLayout({
        version: 1,
        parts: [
          { id: 'a', ref: 'BAT1', type: 'battery', props: { variant: '9V' }, pins: { '+': 'tp1', '-': 'tn1' } },
          { id: 'b', ref: 'R1', type: 'resistor', props: { resistance: 470 }, pins: { 1: 'c5', 2: 'c9' } },
          { id: 'c', ref: 'LED1', type: 'led', props: { color: 'red' }, pins: { anode: 'd9', cathode: 'd12' } },
        ],
      });
      s.select('b');
      s.setPanel('inspect');
    });
    await p.waitForTimeout(300);
    await p.locator('.toolbar .confirm-wrap button').first().click();
  }
  if (kind === 'parts') {
    await p.locator('.kb-bench > summary').click();
  }
  if (kind === 'celebrate') {
    await p.locator('.actions button', { hasText: /Show answer|看答案/ }).click();
    await p.locator('.confirm-pop button.danger-solid').click();
    await p.waitForTimeout(300);
    await p.locator('.actions button.primary.big').click();
    await p.waitForSelector('.modal[role="dialog"]', { timeout: 5000 });
  }
  if (kind === 'answered') {
    const f = p.locator('.pr-q input').first();
    await f.fill('12345');
    await f.press('Enter');
    await p.locator('.pr-q-tools .pr-link').first().click();
  }
  if (kind.startsWith('quiz')) {
    await startQuiz(p);
    if (kind === 'quiz-paused') await p.locator('.ms-timer button[aria-pressed]').click();
    if (kind === 'quiz-results') {
      await p.locator('.ms-quiz .confirm-wrap button.primary').click();
      await p.locator('.confirm-pop button.danger-solid').click();
      await p.waitForSelector('.ms-quiz', { state: 'detached', timeout: 30000 });
    }
  }
  if (kind === 'drawer') await p.locator('.pr-phone-nav button[aria-controls="pr-side"]').click();
  if (kind === 'placed') {
    await p.evaluate(() => {
      const s = window.__bb.store.getState();
      s.setTool('resistor');
      s.clickHole('c20');
      s.clickHole('c24');
      s.setTool('select');
    });
    await p.waitForSelector('.part-pop', { timeout: 5000 });
  }
  if (kind === 'reviewmenu') await p.locator('.pr-phone-review').click();
  if (kind === 'viewer') {
    await p.locator('.fig-zoom').first().click();
    await p.waitForSelector('.fig-viewer[role="dialog"]', { timeout: 5000 });
  }
  if (kind === 'symkeys') await p.locator('.pr-q input').first().tap();
  if (kind === 'touchchip') {
    await p.locator('button.tool').nth(4).tap();
    await p.waitForFunction(() => window.__bb, null, { timeout: 30000 });
    const h = await p.evaluate(() => window.__bb.hole('c10'));
    await p.touchscreen.tap(h.x, h.y);
    await p.waitForSelector('.touch-chip', { timeout: 5000 });
  }
  if (kind === 'checked') {
    await p.locator('.actions button.primary.big').click();
  }
  await p.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const results = {};
  let failures = 0;
  for (const lang of ['zh', 'en']) {
    for (const pg of PAGES) {
      const ctx = await browser.newContext({
        locale: lang === 'zh' ? 'zh-CN' : 'en-US',
        colorScheme: 'light',
        ...(pg.phone ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 } : { viewport: { width: 1440, height: 900 } }),
      });
      await ctx.addInitScript((l) => localStorage.setItem('bb.lang', JSON.stringify(l)), lang);
      const p = await ctx.newPage();
      await p.goto(`${BASE}?e2e${pg.hash}`);
      await p.waitForSelector(pg.ready, { timeout: 30000 }).catch(() => null);
      if (pg.setup)
        try {
          await setupPage(p, pg);
        } catch (e) {
          failures++;
          console.log(`FAIL ${pg.name}/${lang}: setup failed: ${e.message.split('\n')[0]}`);
          await ctx.close();
          continue;
        }
      await p.waitForTimeout(700);
      await p.evaluate(AXE);
      const r = await p.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const res = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }, resultTypes: ['violations'] });
        return res.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          n: v.nodes.length,
          sample: v.nodes.slice(0, 3).map((x) => x.target.join(' ') + ' :: ' + (x.failureSummary || '').split('\n')[1]),
        }));
      });
      const key = `${pg.name}/${lang}`;
      results[key] = r;
      const allowed = new Set([...(BASELINE['*'] || []).map((x) => x.rule), ...(BASELINE[pg.name] || []).map((x) => x.rule)]);
      const bad = r.filter((v) => (v.impact === 'serious' || v.impact === 'critical') && !allowed.has(v.id));
      const line = r.map((v) => `${v.id}(${v.impact[0]})×${v.n}`).join(' ') || 'none';
      if (bad.length && !REPORT) {
        failures++;
        console.log(`FAIL ${key}: ${bad.map((v) => `${v.id}×${v.n} ${v.sample.join(' ; ')}`).join(' | ')}`);
      } else console.log(`ok   ${key}: ${line}`);
      if (REPORT) for (const v of r) for (const s of v.sample) console.log(`       ${v.id}: ${s}`);
      await ctx.close();
    }
  }
  await browser.close();
  if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(results, null, 1));
  const total = Object.values(results).reduce((a, r) => a + r.reduce((b, v) => b + v.n, 0), 0);
  console.log(
    `a11y: ${failures ? failures + ' page(s) with new serious/critical violations' : 'no new serious/critical violations'} (${total} violating nodes in all, any impact)`,
  );
  if (failures && !REPORT) process.exitCode = 1;
})();
