import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { pages } from '../src/routes.js';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext();
const base = process.env.DEMO_URL || 'http://localhost:5173';
await context.addInitScript(() => {
  for (const role of ['admin', 'resident', 'worker']) sessionStorage.setItem('shengbian-auth-' + role, 'yes');
});
const page = await context.newPage();
const reports = [];
for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  for (const route of pages) {
    await page.setViewportSize({ width, height: width <= 768 ? 844 : 1000 });
    await page.goto(base + route.path);
    await page.waitForFunction(() => window.demoAudit);
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => ({
      width: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > innerWidth + 2,
      overlaps: [...document.querySelectorAll('header.fixed button,header.fixed a')].filter(e => {
        const r = e.getBoundingClientRect(); return r.width && r.right > innerWidth + 2;
      }).map(e => e.textContent.trim())
    }));
    reports.push({ route: route.path, ...result });
    if (result.overflow || result.overlaps.length) console.log(JSON.stringify(reports.at(-1)));
  }
}
await fs.writeFile('test-results/responsive.json', JSON.stringify(reports, null, 2));
console.log(`Checked ${reports.length} page/viewport combinations.`);
await browser.close();
