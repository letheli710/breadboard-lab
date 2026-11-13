/* global require, process, console, location, history */
/* eslint-disable @typescript-eslint/no-require-imports */
// Browser check of routing (not part of npm test: needs a running build).
//   npx vite build && npx vite preview --port 4173 &   node scripts/e2e-routes.cjs [baseUrl]
// Checks Back/Forward across learn → challenge → practice, group tabs, the remembered location,
// unknown-id fallback, Guide anchors, and that Practice / Guide / Import links never load three.js
// or the bench side panel.
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:4173/';
const assert = (c, m) => { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log('ok  ', m); };
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
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
  await page.click('nav.nav button:nth-child(2)');
  await settle();
  const chal = await hash();
  assert(chal.startsWith('#/challenges/'), 'nav Challenges → ' + chal);
  // challenge → practice
  await page.click('nav.nav button:nth-child(3)');
  await settle();
  const prac = await hash();
  assert(prac.startsWith('#/practice/'), 'nav Practice → ' + prac);
  assert(await page.locator('.pr-page').count() === 1, 'practice page shown');
  await page.goBack(); await settle();
  assert(await hash() === chal, 'Back → ' + (await hash()));
  assert(await page.locator('.carousel-wrap').count() === 1 && (await page.title()).includes('Challenges'), 'challenge page shown, title ' + await page.title());
  await page.goBack(); await settle();
  assert(await hash() === lesson, 'Back → ' + (await hash()));
  assert((await page.title()).includes('Learn'), 'title ' + await page.title());
  await page.goForward(); await settle();
  assert(await hash() === chal, 'Forward → ' + (await hash()));
  await page.goForward(); await settle();
  assert(await hash() === prac, 'Forward → ' + (await hash()));
  const histLen = await page.evaluate(() => history.length);
  assert(histLen === 4, 'history length ' + histLen + ' (blank start + 3 entries)');

  // group tab bug: tabs open that group's challenge, panel+URL follow
  await page.goBack(); await settle();
  const tabs = page.locator('.phase-tabs button');
  const n = await tabs.count();
  for (let i = 0; i < n; i++) {
    await tabs.nth(i).click(); await settle();
    const h2 = await hash();
    const onCard = await page.locator('.lesson-card.on .lc-title').textContent().catch(() => null);
    const panelTitle = await page.title();
    const label = await tabs.nth(i).textContent();
    assert(onCard && panelTitle.startsWith(onCard), `tab ${label.trim()} → ${h2}, highlighted card "${onCard}" = title`);
  }
  // board edits don't add history entries — click a hole? skip; check reload restores location
  const before = await hash();
  await page.goto(BASE); await settle();
  assert(await hash() === before, 'reload without hash restores ' + (await hash()));
  // unknown id: toast, fallback, URL corrected
  await page.goto(BASE + '#/challenges/no-such-thing'); await settle();
  const toast = await page.locator('.toast').textContent().catch(() => '');
  assert(/doesn't exist/.test(toast), 'toast: ' + toast);
  assert((await hash()).startsWith('#/challenges/') && (await hash()) !== '#/challenges/no-such-thing', 'fallback url ' + (await hash()));
  await page.goto(BASE + '#/nowhere'); await settle();
  assert((await hash()).startsWith('#/learn/'), 'unknown page → ' + (await hash()));
  // edited hash to a lesson via the challenges path is normalised
  await page.evaluate(() => (location.hash = '#/challenges/lesson-power-and-ground')); await settle();
  assert(await hash() === '#/learn/lesson-power-and-ground', 'kind mismatch normalised → ' + (await hash()));
  // guide deep link via card link
  await page.click('nav.nav button:nth-child(5)'); await settle();
  await page.click('#guide-led a.concept-num'); await settle();
  assert(await hash() === '#/guide/led', 'guide card link → ' + (await hash()));
  await page.click('nav.nav button:nth-child(4)'); await settle();
  assert(await hash() === '#/sandbox', 'sandbox ' + (await hash()));
  await page.goBack(); await settle();
  assert(await hash() === '#/guide/led', 'back to guide section');
  // zh title
  await page.click('.lang-switch button:first-child'); await settle();
  assert((await page.title()).includes('面包板实验室'), 'zh title ' + await page.title());
  // chapter key points: sidebar entry → own URL; a problem from it and Back; problem → key points → Back
  await page.click('.lang-switch button:last-child'); await settle();
  await page.goto(BASE + '#/practice/basics-03-power-sign'); await settle();
  await page.locator('.pr-chapter.cur .pr-sumitem').click(); await settle();
  assert(await hash() === '#/practice/summary/basics', 'key points entry → ' + (await hash()));
  assert((await page.title()).startsWith('Key points · '), 'key points title ' + await page.title());
  await page.locator('.sum-chip').first().click(); await settle();
  const fromSum = await hash();
  assert(fromSum.startsWith('#/practice/') && !fromSum.includes('summary') && (await page.locator('.sum-main').count()) === 0, 'practise chip → ' + fromSum);
  await page.goBack(); await settle();
  assert(await hash() === '#/practice/summary/basics' && (await page.locator('.sum-main').count()) === 1, 'Back → key points ' + (await hash()));
  await page.goto(BASE + '#/practice/basics-13-kcl-chain'); await settle();
  await page.locator('.pr-crumbs .pr-keypoints').click(); await settle();
  assert(await hash() === '#/practice/summary/basics/idea-kcl', 'problem → key points at its idea ' + (await hash()));
  const flashed = await page.locator('#sum-idea-kcl').getAttribute('class');
  assert(/flash/.test(flashed || ''), 'idea highlighted: ' + flashed);
  await page.goBack(); await settle();
  assert(await hash() === '#/practice/basics-13-kcl-chain' && (await page.locator('.sum-main').count()) === 0, 'Back → problem ' + (await hash()));
  await page.goForward(); await settle();
  assert((await page.locator('.sum-main').count()) === 1, 'Forward → key points again');
  await page.goto(BASE + '#/practice/summary/nope'); await settle();
  assert(/doesn't exist/.test(await page.locator('.toast').textContent().catch(() => '')), 'unknown chapter → toast');
  for (const h of ['#/practice', '#/practice/summary/first-order/formulas', '#/guide', '#/import']) {
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
