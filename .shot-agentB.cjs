const { chromium } = require('playwright');
(async () => {
  const ids = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  for (const id of ids) {
    await p.goto(`http://localhost:5180/#/inside/${id}`);
    await p.waitForSelector('.td-stepper button', { timeout: 15000 });
    const n = await p.$$eval('.td-stepper button', (x) => x.length);
    for (let i = 1; i <= n; i++) {
      await p.click(`.td-stepper button:nth-child(${i})`);
      await p.waitForTimeout(1600);
      const el = await p.$('.td-stage-inner');
      await el.screenshot({ path: `/tmp/claude-0/agentB/${id}-${i}.png` });
    }
    console.log(id, n);
  }
  console.log(errs.join('\n'));
  await b.close();
})();
