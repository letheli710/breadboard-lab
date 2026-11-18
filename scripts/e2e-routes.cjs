/* global require, process, console, location, history, window, document, localStorage, sessionStorage, MutationObserver, setTimeout */
/* eslint-disable @typescript-eslint/no-require-imports */
// Browser check of routing (not part of npm test: needs a running build).
//   npx vite build && npx vite preview --port 4173 &   node scripts/e2e-routes.cjs [baseUrl]
// Checks Back/Forward across learn → challenge → practice, group tabs, the remembered location,
// unknown-id fallback, Guide anchors, the notebook / review / quiz pages, and that Practice / Guide / Import links never load three.js
// or the bench side panel. The problem / challenge indexes are lazy chunks: deep links, the saved
// current problem and unknown ids are also checked with the index held back until after the first
// paint (a throttled network), recording every URL, tab title and problem title on the way, so a
// flash of another problem or a rewritten URL / bb.route fails. Then the Practice sidebar (current
// chapter expanded, active item in view), the Challenges carousel and the [ ] shortcuts. Then the
// course map, a learning unit and the portal round trip (courseChecks).
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:4173/';
const assert = (c, m) => {
  if (!c) {
    console.log('FAIL', m);
    process.exitCode = 1;
  } else console.log('ok  ', m);
};
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ locale: 'en-US' });
  const page = await ctx.newPage();
  const hash = () => page.evaluate(() => location.hash);
  const settle = () => page.waitForTimeout(700);
  // first visit: Learn
  await page.goto(BASE);
  await settle();
  let h = await hash();
  assert(h.startsWith('#/learn/'), 'first visit → ' + h);
  const lesson = h;
  // learn → challenge
  await page.locator('nav.nav button', { hasText: 'Challenges' }).click();
  await settle();
  const chal = await hash();
  assert(chal.startsWith('#/challenges/'), 'nav Challenges → ' + chal);
  // challenge → practice
  await page.locator('nav.nav button', { hasText: 'Practice' }).click();
  await settle();
  const prac = await hash();
  assert(prac.startsWith('#/practice/'), 'nav Practice → ' + prac);
  assert((await page.locator('.pr-page').count()) === 1, 'practice page shown');
  await page.goBack();
  await settle();
  assert((await hash()) === chal, 'Back → ' + (await hash()));
  assert((await page.locator('.course-btn').count()) === 1 && (await page.title()).includes('Challenges'), 'challenge page shown, title ' + (await page.title()));
  await page.goBack();
  await settle();
  assert((await hash()) === lesson, 'Back → ' + (await hash()));
  assert((await page.title()).includes('Learn'), 'title ' + (await page.title()));
  await page.goForward();
  await settle();
  assert((await hash()) === chal, 'Forward → ' + (await hash()));
  await page.goForward();
  await settle();
  assert((await hash()) === prac, 'Forward → ' + (await hash()));
  const histLen = await page.evaluate(() => history.length);
  assert(histLen === 4, 'history length ' + histLen + ' (blank start + 3 entries)');

  // the course map is a dropdown (header button): closed by default; World tabs only browse
  // (no navigation); picking an item opens it, closes the map and adds one history entry
  await page.goBack();
  await settle();
  assert((await page.locator('.course-pop').count()) === 0, 'course map closed by default');
  await page.click('.course-btn');
  await page.waitForSelector('.course-pop .lesson-card.on');
  assert(await page.evaluate(() => document.activeElement?.classList.contains('lesson-card')), 'course map: focus on the current item');
  const tabs = page.locator('.course-pop .phase-tabs button');
  const n = await tabs.count();
  const atMap = await hash();
  for (let i = 0; i < n; i++) {
    await tabs.nth(i).click();
    await page.waitForTimeout(150);
    const label = (await tabs.nth(i).textContent()).trim();
    assert((await hash()) === atMap && (await page.locator('.course-pop').count()) === 1, `tab ${label}: browses only (URL kept, map open)`);
  }
  const target = page.locator('.course-pop .course-list .lesson-card:not(.theory-card)').first();
  const want = (await target.locator('.lc-title').textContent()).trim();
  await target.click();
  await settle();
  assert((await page.locator('.course-pop').count()) === 0, 'course map: closes after a pick');
  assert((await page.title()).startsWith(want) && (await hash()) !== atMap, `course map: picked "${want}" → ${await hash()}`);
  await page.click('.course-btn');
  await page.waitForSelector('.course-pop');
  await page.keyboard.press('Escape');
  assert(
    (await page.locator('.course-pop').count()) === 0 && (await page.evaluate(() => document.activeElement?.classList.contains('course-btn'))),
    'course map: Esc closes it and returns focus to the button',
  );
  await page.goBack();
  await settle();
  assert((await hash()) === atMap, 'Back after a pick → ' + (await hash()));
  // board edits don't add history entries — click a hole? skip; check reload restores location
  const before = await hash();
  await page.goto(BASE);
  await settle();
  assert((await hash()) === before, 'reload without hash restores ' + (await hash()));
  // unknown id: toast, fallback, URL corrected
  await page.goto(BASE + '#/challenges/no-such-thing');
  await settle();
  const toast = await page
    .locator('.toast')
    .textContent()
    .catch(() => '');
  assert(/doesn't exist/.test(toast), 'toast: ' + toast);
  assert((await hash()).startsWith('#/challenges/') && (await hash()) !== '#/challenges/no-such-thing', 'fallback url ' + (await hash()));
  await page.goto(BASE + '#/nowhere');
  await settle();
  assert((await hash()).startsWith('#/learn/'), 'unknown page → ' + (await hash()));
  // edited hash to a lesson via the challenges path is normalised
  await page.evaluate(() => (location.hash = '#/challenges/lesson-power-and-ground'));
  await settle();
  assert((await hash()) === '#/learn/lesson-power-and-ground', 'kind mismatch normalised → ' + (await hash()));
  // guide deep link via card link
  await page.locator('nav.nav button', { hasText: 'Guide' }).click();
  await settle();
  await page.click('#guide-led a.concept-num');
  await settle();
  assert((await hash()) === '#/guide/led', 'guide card link → ' + (await hash()));
  await page.locator('nav.nav button', { hasText: 'Sandbox' }).click();
  await settle();
  assert((await hash()) === '#/sandbox', 'sandbox ' + (await hash()));
  // Inside (teardowns) and Calc: list pages, a deep link, Back
  // Inside has no menu entry (it opens from lessons, the course map and the Calc page)
  await page.evaluate(() => (location.hash = '#/inside'));
  await settle();
  assert((await hash()) === '#/inside', 'Inside list → ' + (await hash()));
  await page.click('.inside-card');
  await settle();
  await page.waitForSelector('svg.td-fig', { timeout: 15000 });
  assert((await hash()).startsWith('#/inside/') && (await page.locator('svg.td-fig').count()) === 1, 'teardown opened → ' + (await hash()));
  await page.locator('nav.nav button', { hasText: 'Calc' }).click();
  await settle();
  assert((await hash()) === '#/calc' && (await page.locator('.calc-card').count()) > 20, 'nav Calc → ' + (await hash()));
  await page.evaluate(() => (location.hash = '#/calc/led-resistor'));
  await settle();
  assert((await page.locator('#calc-led-resistor .calc-out b').innerText()).includes('Ω'), 'calc card computes');
  // Back walks through the calc card, the Calc list and the teardown to the sandbox
  const back = [];
  for (let i = 0; i < 6 && (await hash()) !== '#/sandbox'; i++) {
    await page.goBack();
    await settle();
    back.push(await hash());
  }
  assert(back.includes('#/calc') && back.some((h) => h.startsWith('#/inside/')), 'Back through calc and the teardown → ' + back.join(' '));
  assert((await hash()) === '#/sandbox', 'Back to sandbox → ' + (await hash()));
  await page.goBack();
  await settle();
  assert((await hash()) === '#/guide/led', 'back to guide section');
  // zh title
  await page.click('.lang-switch button:first-child');
  await settle();
  assert((await page.title()).includes('面包板实验室'), 'zh title ' + (await page.title()));
  // chapter key points: sidebar entry → own URL; a problem from it and Back; problem → key points → Back
  await page.click('.lang-switch button:last-child');
  await settle();
  await page.goto(BASE + '#/practice/basics-03-power-sign');
  await settle();
  await page.locator('.pr-chapter.cur .pr-sumitem').click();
  await settle();
  assert((await hash()) === '#/practice/summary/basics', 'key points entry → ' + (await hash()));
  assert((await page.title()).startsWith('Key points · '), 'key points title ' + (await page.title()));
  await page.locator('.sum-chip').first().click();
  await settle();
  const fromSum = await hash();
  assert(fromSum.startsWith('#/practice/') && !fromSum.includes('summary') && (await page.locator('.sum-main').count()) === 0, 'practise chip → ' + fromSum);
  await page.goBack();
  await settle();
  assert((await hash()) === '#/practice/summary/basics' && (await page.locator('.sum-main').count()) === 1, 'Back → key points ' + (await hash()));
  await page.goto(BASE + '#/practice/basics-13-kcl-chain');
  await settle();
  await page.locator('.pr-crumbs .pr-keypoints').click();
  await settle();
  assert((await hash()) === '#/practice/summary/basics/idea-kcl', 'problem → key points at its idea ' + (await hash()));
  const flashed = await page.locator('#sum-idea-kcl').getAttribute('class');
  assert(/flash/.test(flashed || ''), 'idea highlighted: ' + flashed);
  await page.goBack();
  await settle();
  assert((await hash()) === '#/practice/basics-13-kcl-chain' && (await page.locator('.sum-main').count()) === 0, 'Back → problem ' + (await hash()));
  await page.goForward();
  await settle();
  assert((await page.locator('.sum-main').count()) === 1, 'Forward → key points again');
  await page.goto(BASE + '#/practice/summary/nope');
  await settle();
  assert(
    /doesn't exist/.test(
      await page
        .locator('.toast')
        .textContent()
        .catch(() => ''),
    ),
    'unknown chapter → toast',
  );
  // mistake notebook / review / quiz pages: own URLs, Back / Forward, a problem from there
  await page.goto(BASE + '#/practice/review');
  await settle();
  assert((await page.locator('.ms-main').count()) === 1 && (await page.title()).startsWith('Mistake notebook'), 'notebook direct load, title ' + (await page.title()));
  await page.locator('.ms-navitem').nth(2).click();
  await settle();
  assert((await hash()) === '#/practice/quiz' && (await page.locator('.ms-setup').count()) === 1, 'sidebar Quiz → ' + (await hash()));
  await page.locator('.ms-navitem').nth(1).click();
  await settle();
  assert((await hash()) === '#/practice/review/due', 'sidebar Review → ' + (await hash()));
  await page.locator('.pr-pitem').first().click();
  await settle();
  const fromReview = await hash();
  assert(!/review|quiz/.test(fromReview) && (await page.locator('.ms-main').count()) === 0, 'problem from the sidebar → ' + fromReview);
  await page.goBack();
  await settle();
  assert((await hash()) === '#/practice/review/due' && (await page.locator('.ms-main').count()) === 1, 'Back → review ' + (await hash()));
  await page.goBack();
  await settle();
  assert((await hash()) === '#/practice/quiz', 'Back → quiz ' + (await hash()));
  await page.goForward();
  await settle();
  assert((await hash()) === '#/practice/review/due', 'Forward → review ' + (await hash()));
  await page.goto(BASE + '#/practice/review/how');
  await settle();
  assert((await page.locator('.ms-how').count()) === 1, 'explainer direct load');
  await lazyIndexChecks(browser);
  await courseChecks(browser);
  for (const h of ['#/practice', '#/practice/summary/first-order/formulas', '#/practice/review', '#/practice/quiz', '#/guide', '#/import', '#/map', '#/unit/w3-5b-virtual-short']) {
    const c = await browser.newContext();
    const p = await c.newPage();
    const js = [];
    p.on('request', (r) => r.url().endsWith('.js') && js.push(r.url().split('/').pop()));
    await p.goto(BASE + h);
    await p.waitForLoadState('networkidle');
    assert(!js.some((f) => /^(three|Workbench|Panel)-/.test(f)), `${h}: no three / Workbench / bench Panel chunk (${js.length} JS files)`);
    await c.close();
  }
  await browser.close();
})();

// Records, from the very start of the page, every URL the app writes, every tab title and every
// problem / lesson title shown, so a transient wrong state is caught (not just the final one).
const RECORDER = () => {
  const log = (window.__log = { hashes: [location.hash], titles: [], shown: [] });
  for (const k of ['pushState', 'replaceState']) {
    const orig = history[k].bind(history);
    history[k] = (st, t, url) => {
      log.hashes.push(String(url));
      return orig(st, t, url);
    };
  }
  const note = () => {
    if (log.titles[log.titles.length - 1] !== document.title) log.titles.push(document.title);
    const el = document.querySelector('.pr-main .pr-title, .task h2');
    const t = el && el.textContent;
    if (t && log.shown[log.shown.length - 1] !== t) log.shown.push(t);
  };
  new MutationObserver(note).observe(document, { subtree: true, childList: true, characterData: true });
};

// The course map, learning units and portals (course/*.json, units/*.json, docs/PORTALS.md):
// Map → a World 3 unit, its sliders and a prediction; a lab's portal → target with the reverse
// link and the breadcrumb → back; the watch-later queue (kept across a reload); World tabs.
async function courseChecks(browser) {
  const ctx = await browser.newContext({ locale: 'en-US' });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const hash = () => p.evaluate(() => location.hash);
  await p.goto(BASE + '#/map');
  await p.waitForSelector('#world-w3[open]', { timeout: 15000 });
  assert((await p.locator('details.world').count()) === 9, 'map: 8 Worlds + the UB area');
  assert(/You are here/.test(await p.locator('#world-w3 summary').textContent()), 'map: World 3 marked as current');
  await p.locator('#world-w3 .world-item a', { hasText: '5b' }).click();
  await p.waitForSelector('.unit-page h1', { timeout: 15000 });
  assert((await hash()) === '#/unit/w3-5b-virtual-short', 'map → unit ' + (await hash()));
  assert((await p.title()).startsWith('5b'), 'unit: tab title ' + (await p.title()));
  const layers = await p.locator('.unit-layer > h2').allTextContents();
  assert(layers.length >= 4 && /Intuition/.test(layers[0]), 'unit: layers in order ' + layers.join(' / '));
  // a slider changes the results
  const out = p.locator('.u-explore').first().locator('output').last();
  const before = await out.textContent();
  const slider = p.locator('.u-explore').first().locator('input[type=range]').first();
  await slider.focus();
  for (let i = 0; i < 40; i++) await slider.press('ArrowRight');
  assert((await out.textContent()) !== before, `unit: slider updates the results (${before} → ${await out.textContent()})`);
  // a prediction: answer, then the explanation
  const pr = p.locator('.u-predict').first();
  if ((await pr.locator('input[type=radio]').count()) > 0) await pr.locator('input[type=radio]').first().check();
  else await pr.locator('input.u-input').fill('1');
  await pr.locator('button.primary').click();
  assert((await pr.locator('.u-reveal').count()) === 1, 'unit: prediction reveals the explanation');
  // portal on a lab → target, reverse link, breadcrumb back
  await p.goto(BASE + '#/challenges/exp3-rc-square-charging');
  await p.waitForSelector('.portal', { timeout: 20000 });
  await p.locator('.portal button', { hasText: 'Watch later' }).first().click();
  assert((await p.locator('.later-count').textContent()) === '1', 'portal: watch later counted');
  await p.locator('.portal button.primary').first().click();
  await p.waitForSelector('.trail-bar', { timeout: 15000 });
  assert((await hash()) === '#/challenges/exp4-rc-lowpass-bode', 'portal → target ' + (await hash()));
  await p.waitForSelector('.backlink', { timeout: 10000 });
  assert(/RC charging/.test(await p.locator('.backlink').first().textContent()), 'target: reverse link names the source');
  await p.locator('.trail-bar a').click();
  await p.waitForTimeout(800);
  assert((await hash()) === '#/challenges/exp3-rc-square-charging' && (await p.locator('.trail-bar').count()) === 0, 'breadcrumb → back to the source, bar gone');
  // the queue survives a reload; tick it off
  await p.reload();
  await p.waitForSelector('.later-btn', { timeout: 15000 });
  await p.locator('.later-btn').click();
  await p.waitForSelector('.later-item', { timeout: 10000 });
  assert((await p.locator('.later-item').count()) === 1, 'watch later: kept across a reload');
  await p.locator('.later-item input[type=checkbox]').check();
  assert((await p.locator('.later-item.done').count()) === 1 && (await p.locator('.later-count').count()) === 0, 'watch later: ticked off');
  await p.keyboard.press('Escape');
  assert((await p.locator('.later-dialog').count()) === 0, 'watch later: Esc closes the dialog');
  // the course-map panel's tabs are the Worlds of course/worlds.json
  await p.goto(BASE + '#/challenges/exp-difference-amp');
  await p.waitForSelector('.course-btn', { timeout: 15000 });
  await p.locator('.course-btn').click();
  await p.waitForSelector('.phase-tabs button.on', { timeout: 15000 });
  assert(/^World 3/.test((await p.locator('.phase-tabs button.on').textContent()).trim()), 'course map: the difference amp is in the World 3 tab');
  assert(errors.length === 0, 'course pages: no page errors ' + errors.join(' | '));
  await ctx.close();
}

async function lazyIndexChecks(browser) {
  const LAST = 'nonlinear-14-two-nonlinear-small-signal';
  const LAST_TITLE = 'Two nonlinear resistors in parallel: operating point and small-signal response';
  const DELAY = 1500;
  /** a fresh page whose index chunks (and only those) arrive `delay` ms late */
  const open = async (hash, { delay = DELAY, storage = null, viewport = { width: 1366, height: 768 } } = {}) => {
    const ctx = await browser.newContext({ locale: 'en-US', viewport });
    if (storage)
      await ctx.addInitScript((st) => {
        if (!sessionStorage.getItem('seeded')) {
          for (const [k, v] of Object.entries(st)) localStorage.setItem(k, JSON.stringify(v)); // persist.ts stores JSON
          sessionStorage.setItem('seeded', '1');
        }
      }, storage);
    await ctx.addInitScript(RECORDER);
    const p = await ctx.newPage();
    const js = [];
    p.on('request', (r) => r.url().endsWith('.js') && js.push(r.url().split('/').pop()));
    const indexArrived = {};
    await p.route(/\/assets\/(problem|challenge)-index-[^/]+\.js$/, async (route) => {
      await new Promise((r) => setTimeout(r, delay));
      await route.continue();
      indexArrived[/problem-index/.test(route.request().url()) ? 'problems' : 'challenges'] = Date.now();
    });
    await p.goto(BASE + hash);
    return { p, ctx, js, indexArrived };
  };
  const log = (p) => p.evaluate(() => window.__log);
  const progress = (p) => p.locator('.progress-card b').textContent();
  // the course map button next to the logo (Learn / Challenges counts)
  const courseCount = (p) => p.locator('.course-btn b').textContent();

  // 1. deep link to a problem in the last chapter, index late: the page and a neutral progress
  //    card first, the URL / bb.route / tab title untouched, then that problem — never another
  {
    const { p, ctx, js } = await open(`#/practice/${LAST}`, { storage: { 'bb.practice.current': 'basics-01-ohm', 'bb.route': '#/practice/basics-01-ohm', 'bb.lang': 'en' } });
    await p.waitForSelector('.pr-page');
    await p.waitForTimeout(400); // first paint done, index still on its way
    assert((await p.locator('.pr-main .pr-title').count()) === 0, 'late index: no problem shown before the index arrives');
    assert((await progress(p)).trim() === '–/–', 'late index: neutral progress card ' + (await progress(p)));
    assert((await p.evaluate(() => location.hash)) === `#/practice/${LAST}`, 'late index: URL kept while loading');
    assert((await p.evaluate(() => JSON.parse(localStorage.getItem('bb.route')))) === '#/practice/basics-01-ohm', 'late index: bb.route not rewritten while loading');
    assert((await p.title()) === 'Practice — Breadboard Lab', 'late index: page-only title while loading: ' + (await p.title()));
    await p.waitForSelector('.pr-main .pr-title', { timeout: 10000 });
    await p.waitForTimeout(400);
    const l = await log(p);
    assert(l.shown.length === 1 && l.shown[0] === LAST_TITLE, 'late index: only the linked problem was ever shown: ' + JSON.stringify(l.shown));
    assert(
      l.hashes.every((h) => h === `#/practice/${LAST}`),
      'late index: URL never changed: ' + JSON.stringify(l.hashes),
    );
    assert(
      // the static <title> of index.html, the page alone while loading, then the problem
      l.titles.slice(1).every((t) => t === 'Practice — Breadboard Lab' || t === `${LAST_TITLE} · Practice — Breadboard Lab`),
      'late index: titles ' + JSON.stringify(l.titles),
    );
    assert((await p.evaluate(() => JSON.parse(localStorage.getItem('bb.route')))) === `#/practice/${LAST}`, 'late index: bb.route saved once resolved');
    assert(/^\d+\/\d+$/.test((await progress(p)).trim()), 'late index: progress card counts ' + (await progress(p)));
    assert(!js.some((f) => /^challenge-index-/.test(f)), 'practice link: no challenge index fetched up front');
    assert((await p.locator('.course-btn b').count()) === 0, 'practice: course button shows no placeholder count');
    // pointing at the course button loads the lesson list, and its counts fill in
    await p.hover('.course-btn');
    await p.waitForFunction(() => /^\d+\/\d+$/.test(document.querySelector('.course-btn b')?.textContent.trim() ?? ''));
    // sidebar: the last chapter is expanded, the active problem is in view inside the sidebar
    const side = await p.evaluate(() => {
      const s = document.querySelector('.pr-side');
      const on = s.querySelector('.pr-pitem.on');
      const a = s.getBoundingClientRect();
      const b = on.getBoundingClientRect();
      const open = [...s.querySelectorAll('.pr-ch-head[aria-expanded="true"]')].map((h) => h.closest('[data-chapter]').dataset.chapter);
      return { inView: b.top >= a.top && b.bottom <= a.bottom, scrolled: s.scrollTop, open };
    });
    assert(side.inView && side.scrolled > 0, `sidebar: active item in view (scrollTop ${side.scrolled})`);
    assert(side.open.length === 1 && side.open[0] === 'nonlinear', 'sidebar: only the current chapter expanded ' + JSON.stringify(side.open));
    // [ / ] go to the neighbours; not while typing in an answer field
    await p.locator('.pr-main').click({ position: { x: 5, y: 5 } });
    await p.keyboard.press('[');
    await p.waitForTimeout(300);
    const prevHash = await p.evaluate(() => location.hash);
    assert(prevHash !== `#/practice/${LAST}` && prevHash.startsWith('#/practice/nonlinear-'), '[ → previous problem ' + prevHash);
    await p.keyboard.press(']');
    await p.waitForTimeout(300);
    assert((await p.evaluate(() => location.hash)).startsWith('#/practice/'), '] → next problem ' + (await p.evaluate(() => location.hash)));
    const field = p.locator('.pr-main input[type="text"], .pr-main input:not([type])').first();
    if (await field.count()) {
      const before = await p.evaluate(() => location.hash);
      await field.click();
      await p.keyboard.type('[1]');
      await p.waitForTimeout(300);
      assert((await p.evaluate(() => location.hash)) === before && (await field.inputValue()) === '[1]', '[ ] typed into an answer field stay there');
    }
    await p.locator('body').click({ position: { x: 2, y: 2 } });
    await p.keyboard.press('?');
    assert((await p.locator('#pr-keys-pop').count()) === 1, '? opens the shortcut help');
    await p.keyboard.press('Escape');
    assert((await p.locator('#pr-keys-pop').count()) === 0, 'Esc closes it');
    await ctx.close();
  }

  // 2. no hash: the saved current problem (bb.practice.current / bb.route) is restored after the
  //    index arrives, without passing through problem 1
  {
    const { p, ctx } = await open('', { storage: { 'bb.practice.current': LAST, 'bb.route': `#/practice/${LAST}`, 'bb.lang': 'en' } });
    await p.waitForSelector('.pr-main .pr-title', { timeout: 10000 });
    await p.waitForTimeout(400);
    const l = await log(p);
    assert(l.shown.length === 1 && l.shown[0] === LAST_TITLE, 'saved problem restored, nothing else shown: ' + JSON.stringify(l.shown));
    assert((await p.evaluate(() => location.hash)) === `#/practice/${LAST}`, 'saved problem: URL ' + (await p.evaluate(() => location.hash)));
    await ctx.close();
  }

  // 3. #/practice (no id), late index: the saved problem, not the first one
  {
    const { p, ctx } = await open('#/practice', { storage: { 'bb.practice.current': LAST, 'bb.lang': 'en' } });
    await p.waitForSelector('.pr-main .pr-title', { timeout: 10000 });
    await p.waitForTimeout(400);
    const l = await log(p);
    assert(
      l.shown.length === 1 && l.shown[0] === LAST_TITLE && (await p.evaluate(() => location.hash)) === `#/practice/${LAST}`,
      '#/practice → saved problem ' + JSON.stringify(l.shown),
    );
    await ctx.close();
  }

  // 4. unknown problem id, late index: toast + fallback + URL corrected, once the index is in
  {
    const { p, ctx } = await open('#/practice/no-such-problem', { storage: { 'bb.lang': 'en' } });
    await p.waitForSelector('.pr-page');
    await p.waitForTimeout(300);
    assert(
      (await p.locator('.toast').count()) === 0 && (await p.evaluate(() => location.hash)) === '#/practice/no-such-problem',
      'unknown problem: no verdict before the index arrives',
    );
    await p.waitForSelector('.pr-main .pr-title', { timeout: 10000 });
    await p.waitForTimeout(300);
    const toast = await p
      .locator('.toast')
      .textContent()
      .catch(() => '');
    const h = await p.evaluate(() => location.hash);
    assert(/doesn't exist/.test(toast) && h.startsWith('#/practice/') && h !== '#/practice/no-such-problem', 'unknown problem → toast + fallback ' + h);
    await ctx.close();
  }

  // 5. chapter key points of the last chapter, late index: shown at once; the sidebar follows
  {
    const { p, ctx } = await open('#/practice/summary/nonlinear', { storage: { 'bb.lang': 'en' } });
    await p.waitForSelector('.sum-main', { timeout: 10000 });
    assert((await p.evaluate(() => location.hash)) === '#/practice/summary/nonlinear', 'key points: shown before the index, URL kept');
    await p.waitForSelector('.pr-sumitem.on', { timeout: 10000 });
    await p.waitForTimeout(400);
    const inView = await p.evaluate(() => {
      const s = document.querySelector('.pr-side').getBoundingClientRect();
      const b = document.querySelector('.pr-sumitem.on').getBoundingClientRect();
      return b.top >= s.top && b.bottom <= s.bottom;
    });
    assert(inView, 'key points: its sidebar entry in view');
    await ctx.close();
  }

  // 6. deep link to a challenge (phase 5) with a late challenge index: no other challenge
  //    flashes, URL kept, one item ever shown
  {
    const ID = 'exp5-gpio-led-resistor';
    // (the bench page loads three.js first, which can take longer than DELAY: hold the index longer)
    const { p, ctx, js } = await open(`#/challenges/${ID}`, { delay: 6000, storage: { 'bb.lang': 'en', 'bb.route': '#/learn/lesson-power-and-ground' } });
    await p.waitForSelector('.course-btn');
    await p.waitForTimeout(300);
    assert(
      (await p.locator('.task h2').count()) === 0 && (await courseCount(p)).trim() === '–/–',
      `late challenge index: loading state, neutral button (${await p.locator('.task h2').count()} items, ${await courseCount(p)})`,
    );
    await p.waitForSelector('.task h2', { timeout: 20000 });
    await p.waitForTimeout(800);
    const l = await log(p);
    assert(
      l.hashes.every((h) => h === `#/challenges/${ID}`),
      'late challenge index: URL never changed ' + JSON.stringify(l.hashes),
    );
    assert(l.shown.length === 1, 'late challenge index: one card ever active ' + JSON.stringify(l.shown));
    assert((await p.title()).startsWith(l.shown[0]), 'late challenge index: title ' + (await p.title()));
    assert(!js.some((f) => /^problem-index-/.test(f)), 'challenge link: no problem index fetched');
    await ctx.close();
  }
  {
    // a late item in a long World, narrow screen: the open course map scrolls it into view
    const { p, ctx } = await open('#/challenges/exp5-pwm-mosfet-motor', { delay: 0, viewport: { width: 390, height: 844 }, storage: { 'bb.lang': 'en' } });
    await p.waitForSelector('.task h2', { timeout: 15000 });
    await p.click('.course-btn');
    await p.waitForSelector('.course-pop .lesson-card.on', { timeout: 15000 });
    await p.waitForTimeout(300);
    const r = await p.evaluate(() => {
      const c = document.querySelector('.course-pop .course-list');
      const a = c.getBoundingClientRect();
      const b = document.querySelector('.course-pop .lesson-card.on').getBoundingClientRect();
      const pop = document.querySelector('.course-pop').getBoundingClientRect();
      return { inView: b.top >= a.top - 1 && b.bottom <= a.bottom + 1, scrollTop: c.scrollTop, onScreen: pop.left >= 0 && pop.right <= window.innerWidth };
    });
    assert(r.inView && r.scrollTop > 0 && r.onScreen, `course map: active item in view (scrollTop ${r.scrollTop}), dropdown on screen`);
    await ctx.close();
  }

  // 7. Guide: neither index is on the critical path (the lesson index comes at idle time)
  {
    const { p, ctx, js } = await open('#/guide', { delay: 0, storage: { 'bb.lang': 'en' } });
    await p.waitForLoadState('load');
    const atLoad = [...js];
    await p.waitForTimeout(3500);
    assert(!atLoad.some((f) => /^problem-index-/.test(f)) && !js.some((f) => /^problem-index-/.test(f)), 'guide: no problem index');
    assert(/^\d+\/\d+$/.test((await courseCount(p)).trim()), 'guide: lesson counts after idle ' + (await courseCount(p)));
    await ctx.close();
  }
}
