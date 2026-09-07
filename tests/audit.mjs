import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { pages } from '../src/routes.js';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext();
const base = process.env.DEMO_URL || 'http://localhost:5173';
await context.addInitScript(() => {
  for (const role of ['admin', 'worker', 'resident']) sessionStorage.setItem('shengbian-auth-' + role, 'yes');
});
await fs.mkdir('test-results/screens', { recursive: true });
const reports = [];
for (const route of pages) {
  const page = await context.newPage();
  await page.setViewportSize(route.group === 'web' ? { width: 1440, height: 1000 } : { width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  await page.goto(base + route.path);
  await page.waitForFunction(() => !!window.demoAudit);
  await page.waitForTimeout(150);
  const result = await page.evaluate(() => ({
    ...(window.demoAudit?.() || { unbound: 'INIT FAILED' }),
    overflow: document.documentElement.scrollWidth > innerWidth + 2,
    brokenImages: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src),
    bodyWidth: document.documentElement.scrollWidth,
    iconFont: getComputedStyle(document.querySelector('.material-symbols-outlined')).fontFamily
  }));
  await page.screenshot({ path: 'test-results/screens/' + route.key + '.png', fullPage: true });
  reports.push({ route: route.path, ...result, errors });
  console.log(JSON.stringify(reports.at(-1)));
  await page.close();
}
await fs.writeFile('test-results/audit.json', JSON.stringify(reports, null, 2));
await browser.close();
