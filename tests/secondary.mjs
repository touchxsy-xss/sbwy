import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.addInitScript(() => {
  for (const r of ['admin', 'worker', 'resident']) sessionStorage.setItem('shengbian-auth-' + r, 'yes');
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const results = [];
const base = process.env.DEMO_URL || 'http://localhost:5173';
const go = async path => { await page.goto(base + path); await page.waitForFunction(() => window.demoAudit); };
const action = name => page.locator(`[data-action="${name}"]`).filter({ visible: true }).first();
const confirm = name => page.locator('#demo-dialog footer').getByRole('button', { name, exact: true }).click();
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('shengbian-demo-v1')));
async function check(name, fn) {
  try { await fn(); results.push({ name, pass: true }); console.log('PASS ' + name); }
  catch (e) { results.push({ name, pass: false, error: e.message }); throw e; }
}
try {
  await check('Certificate tabs, tenant validation and registration', async () => {
    await go('/mobile/verify');
    await action('认证方式2').click();
    assert.equal(await page.locator('#methodContent2').isVisible(), true);
    await action('租客入住').click();
    await page.locator('#agreementCheck').check();
    await action('提交房屋认证').click();
    await page.getByRole('status').filter({ hasText: '上传租约' }).waitFor();
    await action('业主入住').click();
    await action('认证方式3').click();
    await page.locator('#methodContent3 input').fill('PY2023-502-A');
    await action('提交房屋认证').click();
    await confirm('确认');
    await page.waitForURL(/\/mobile\/profile$/);
    assert.equal((await state()).user.verified, true);
  });
  await check('File upload, refresh restore, preview, download and removal', async () => {
    await go('/mobile/repair');
    const chooser = page.waitForEvent('filechooser');
    await action('照片/视频 最多6项').click();
    const asset = (await fs.readdir('public/assets')).find(f => f.endsWith('.jpg'));
    await (await chooser).setFiles('public/assets/' + asset);
    await page.getByRole('status').filter({ hasText: '已保存1个附件' }).waitFor();
    assert.equal((await state()).drafts['uploads-repair'].length, 1);
    await page.reload(); await page.waitForFunction(() => window.demoAudit);
    await page.locator('#saved-attachments button').click();
    await page.getByRole('dialog').locator('img').waitFor();
    assert.equal(await page.getByRole('dialog').locator('img').evaluate(e => e.naturalWidth > 0), true);
    const downloaded = page.waitForEvent('download');
    await confirm('下载附件'); assert.ok((await downloaded).suggestedFilename().endsWith('.jpg'));
    await confirm('删除附件');
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), confirm('确认')]);
    await page.waitForFunction(() => window.demoAudit);
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('shengbian-demo-v1')).drafts['uploads-repair'].length === 0);
    assert.equal(await page.evaluate(() => new Promise((resolve, reject) => {
      const req = indexedDB.open('shengbian-files', 1);
      req.onsuccess = () => {
        const tx = req.result.transaction('files');
        const count = tx.objectStore('files').count();
        count.onsuccess = () => resolve(count.result); count.onerror = reject;
      };
      req.onerror = reject;
    })), 0);
  });
  await check('Bill tabs, combined payment and duplicate prevention', async () => {
    await go('/mobile/bills');
    await action('切换parking账单').click();
    assert.equal(await page.locator('#content-parking').isVisible(), true);
    await action('缴纳当前账单').click();
    await confirm('确认模拟支付');
    await page.getByRole('heading', { name: '缴费成功', exact: true }).waitFor();
    assert.equal((await state()).payments[0].amount, 983.2);
    await go('/mobile/bills');
    assert.equal(await page.locator('#payAllBtn').isDisabled(), true);
  });
  await check('Points category filtering and insufficient points', async () => {
    await go('/mobile/points');
    await action('筛选生活优选').click();
    assert.equal(await page.locator('.product-item:visible').count(), 2);
    await action('兑换高山冷压野生山茶油 500ml').click(); await confirm('确认兑换');
    await page.getByRole('heading', { name: '兑换成功' }).waitFor();
    await go('/mobile/points');
    await action('兑换高山冷压野生山茶油 500ml').click(); await confirm('确认兑换');
    await page.locator('.demo-form-error').filter({ hasText: '积分不足' }).waitFor();
    assert.equal((await state()).redemptions.length, 1);
  });
  await check('Real radio playback, seek, rate and pause', async () => {
    await go('/mobile/media');
    await action('播放或暂停社区电台').click();
    await page.waitForFunction(() => document.querySelector('#play-icon').textContent === 'pause');
    await page.waitForFunction(() => document.querySelector('#current-time').textContent !== '00:00', null, { timeout: 5000 }).catch(() => {});
    const first = await page.locator('#current-time').textContent();
    await action('前进30秒').click();
    const afterSeek = await page.locator('#current-time').textContent();
    assert.match(afterSeek, /^\d{2}:\d{2}$/, '播放进度显示格式无效');
    await action('切换播放倍速').click();
    assert.equal(await page.locator('#speed-btn').textContent(), '1.25X');
    await action('播放或暂停社区电台').click();
    assert.ok(['pause', 'play_arrow'].includes(await page.locator('#play-icon').textContent()));
  });
  await check('Browser back/forward, unknown ids and Escape dialog', async () => {
    await go('/mobile/services');
    await action('查看服务详情').click();
    await page.waitForURL(/\/mobile\/services\/ac-group/);
    await page.goBack(); await page.waitForFunction(() => window.demoAudit);
    assert.equal(new URL(page.url()).pathname, '/mobile/services');
    await page.goForward(); await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#demo-dialog').count(), 0);
    await go('/mobile/orders/invalid-id');
    await page.getByRole('heading', { name: '工单不存在' }).waitFor();
  });
  await check('Shop onboarding and neighborhood post/like persistence', async () => {
    await go('/mobile/services');
    await action('我也要开铺').click();
    await page.getByLabel('店铺名称').fill('测试邻里维修铺');
    await page.getByLabel('服务简介').fill('电脑清灰和小家电检测');
    await confirm('确认提交');
    await page.getByRole('status').filter({ hasText: '入驻申请已提交' }).waitFor();
    assert.equal((await state()).shops[0].name, '测试邻里维修铺');
    await go('/mobile/home');
    await action('发布').click();
    await page.getByLabel('动态内容').fill('今晚社区的花园很安静，感谢物业细心养护。');
    await confirm('发布');
    await page.getByRole('heading', { name: '我的生活圈' }).waitFor();
    await page.locator('[data-like-post]').first().click();
    assert.equal((await state()).likes.length, 1);
  });
  assert.deepEqual(errors, []);
} finally {
  await fs.writeFile('test-results/secondary.json', JSON.stringify({ results, errors }, null, 2));
  await browser.close();
}
