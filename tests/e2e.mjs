import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const failures = [];
page.on('pageerror', e => failures.push(e.message));
const base = process.env.DEMO_URL || 'http://localhost:5173';
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('shengbian-demo-v1')));
const navigate = async path => { await page.goto(base + path); await page.waitForFunction(() => !!window.demoAudit); };
const action = name => page.locator(`[data-action="${name}"]`).filter({ visible: true }).first();
const confirm = async name => { await page.locator('#demo-dialog footer').getByRole('button', { name, exact: true }).click(); };
const login = async role => {
  await page.locator('#agreementCheckbox').check();
  await page.locator('#loginForm button[type=submit]').click();
  await page.waitForURL(url => !url.pathname.endsWith('/login'));
  await page.waitForFunction(() => !!window.demoAudit);
};
const reports = [];
async function test(name, fn) {
  try { await fn(); reports.push({ name, pass: true }); console.log('PASS ' + name); }
  catch (error) {
    reports.push({ name, pass: false, error: error.message });
    await page.screenshot({ path: 'test-results/e2e-failure.png', fullPage: true });
    console.error('FAIL ' + name + ': ' + error.message);
    throw error;
  }
}
await fs.mkdir('test-results', { recursive: true });
try {
  await test('Protected route login, error and return URL', async () => {
    await navigate('/mobile/repair');
    assert.match(page.url(), /\/mobile\/login\?next=/);
    await page.locator('#loginForm button[type=submit]').click();
    await page.getByRole('status').filter({ hasText: '请先阅读' }).waitFor();
    await login('resident');
    assert.match(page.url(), /\/mobile\/repair$/);
  });
  let orderId;
  await test('Resident repair validation, confirmation, submission and refresh', async () => {
    await action('立即提交报修').click();
    await page.getByRole('status').filter({ hasText: '至少5个字' }).waitFor();
    await page.locator('#issue-text').fill('自动化测试：厨房水管接口持续漏水，需要更换密封圈');
    await action('立即提交报修').click();
    await confirm('确认提交报修');
    await page.waitForURL(/\/mobile\/orders\/BX-/);
    orderId = new URL(page.url()).pathname.split('/').pop();
    await page.getByRole('dialog').waitFor();
    assert.equal((await state()).orders.find(o => o.id === orderId).status, 'pending');
    await page.reload(); await page.getByRole('dialog').waitFor();
    assert.match(await page.getByRole('dialog').innerText(), /自动化测试/);
  });
  await test('Admin login, search, dispatch and persistent state', async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await navigate('/web/orders/' + orderId);
    await login('admin');
    await confirm('指派师傅');
    await page.getByLabel('维修师傅', { exact: true }).selectOption('张建国');
    await confirm('确认提交');
    await page.waitForTimeout(400);
    assert.equal((await state()).orders.find(o => o.id === orderId).status, 'assigned');
    await navigate('/web/work-orders');
    await page.locator('main input[placeholder]').fill('没有这个房间123456');
    await page.getByText('没有符合条件的工单').waitFor();
    await page.locator('main input[placeholder]').fill(orderId);
    await page.locator(`[data-order-card="${orderId}"]`).waitFor();
  });
  await test('Worker accepts, checks in and completes; bill is generated', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await navigate('/worker/orders/' + orderId); await login('worker');
    await confirm('确认接单'); await confirm('确认');
    await page.waitForURL(/\/worker\/checkin/);
    const acceptedOrder = (await state()).orders.find(o => o.id === orderId);
    assert.ok(acceptedOrder.acceptedAt);
    assert.ok(acceptedOrder.arrivalDueAt);
    assert.match(await page.locator('#arrival-sla').innerText(), /到岗/);
    await action('提交完工并推送账单').click();
    await page.getByRole('status').filter({ hasText: '先完成现场' }).waitFor();
    await action('现场到岗打卡').click(); await confirm('确认');
    await page.locator('#checked-state').waitFor({ state: 'visible' });
    assert.match(await page.locator('#arrival-sla').innerText(), /已准时到岗|已超时到岗/);
    await action('提交完工并推送账单').click(); await confirm('确认完工');
    await page.waitForURL(/\/worker\/orders\//);
    assert.equal((await state()).orders.find(o => o.id === orderId).status, 'completed');
    assert.equal((await state()).bills.find(b => b.orderId === orderId).amount, 68);
  });
  await test('Resident payment failure/retry, success and receipt', async () => {
    await navigate('/mobile/billing?tab=others&bill=repair-' + orderId);
    await page.getByLabel('支付结果').selectOption('failure');
    await confirm('确认模拟支付');
    await page.getByRole('status').filter({ hasText: '模拟支付失败' }).waitFor();
    assert.equal((await state()).bills.find(b => b.orderId === orderId).paid, false);
    await page.getByLabel('支付结果').selectOption('success');
    await confirm('确认模拟支付');
    await page.getByRole('heading', { name: '缴费成功', exact: true }).waitFor();
    assert.equal((await state()).orders.find(o => o.id === orderId).paid, true);
    await confirm('查看电子回单');
    await page.getByRole('heading', { name: '缴费电子回单（演示）' }).waitFor();
    const download = page.waitForEvent('download');
    await confirm('下载回单');
    assert.match((await download).suggestedFilename(), /PAY-/);
  });
  await test('Review persists and points awarded once', async () => {
    await navigate('/mobile/profile');
    await page.getByRole('heading', { name: '待评价服务', exact: true }).waitFor();
    await page.locator(`[data-pending-review="${orderId}"]`).click();
    await page.waitForURL(url => url.pathname === '/mobile/review' && url.searchParams.get('id') === orderId);
    const before = (await state()).user.points;
    await action('3星').click();
    await page.locator('#comment-input').fill('维修完成，整体满意，希望预约时间再精准一些。');
    await action('提交评价并领取积分').click(); await confirm('确认');
    await page.getByRole('heading', { name: '评价已提交' }).waitFor();
    assert.equal((await state()).user.points, before + 20);
    await navigate('/mobile/review?id=' + orderId);
    assert.equal(await page.locator('#submit-review-btn').isDisabled(), true);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await navigate('/web/work-orders');
    await page.getByText('维修完成，整体满意，希望预约时间再精准一些。', { exact: true }).waitFor();
    await action('发起服务回访').click();
    await page.getByLabel('回访记录').fill('已电话联系居民，确认后续预约将提前提醒。');
    await confirm('保存回访记录');
    await page.getByText('已回访', { exact: true }).waitFor();
    const reviewed = (await state()).reviews.find(review => review.orderId === orderId);
    assert.equal(reviewed.followUp.status, 'followed_up');
    assert.match(reviewed.followUp.note, /电话联系居民/);
    await page.reload();
    await page.getByText('已回访', { exact: true }).waitFor();
  });
  await test('Points redemption updates balance and coupon record', async () => {
    await navigate('/mobile/points');
    const before = (await state()).user.points;
    await action('兑换50元物业费抵用券').click(); await confirm('确认兑换');
    await page.getByRole('heading', { name: '兑换成功' }).waitFor();
    assert.equal((await state()).user.points, before - 500);
    assert.equal((await state()).coupons.length, 1);
    await navigate('/mobile/points');
    assert.match(await page.locator('[data-points]').innerText(), new RegExp((before - 500).toLocaleString('zh-CN')));
  });
  await test('Cash redemption handles failure and records a successful payment', async () => {
    await navigate('/mobile/points');
    const before = (await state()).user.points;
    await action('兑换深度油烟机高温清洗').click();
    await page.getByLabel('支付结果').selectOption('failure');
    await confirm('确认兑换');
    await page.getByRole('status').filter({ hasText: '模拟支付失败' }).waitFor();
    assert.equal((await state()).user.points, before);
    await page.getByLabel('支付结果').selectOption('success');
    await confirm('确认兑换');
    await page.getByRole('heading', { name: '兑换成功' }).waitFor();
    const redemption = (await state()).redemptions.find(r => r.rewardId === 'cleaning');
    const payment = (await state()).payments.find(p => p.id === redemption.paymentId);
    assert.equal(payment.amount, 49);
    assert.equal(payment.redemptionId, redemption.id);
  });
  await test('Service detail, reservation, record and cancellation', async () => {
    await navigate('/mobile/services/ac');
    await confirm('立即预约');
    await page.getByLabel('数量', { exact: true }).fill('2');
    await confirm('提交预约');
    await page.getByRole('heading', { name: '预约成功' }).waitFor();
    assert.equal((await state()).bookings[0].amount, 198);
    await confirm('查看预约记录');
    await action('取消预约').click(); await confirm('确认');
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('shengbian-demo-v1')).bookings[0].status === '已取消');
    assert.equal((await state()).bookings[0].status, '已取消');
  });
  await test('Expense entry, approval, search and persistence', async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await navigate('/web/expenses');
    await page.locator('#form-amount').fill('123.45');
    await page.locator('#form-applicant').fill('测试经办人');
    await page.locator('#form-payee').fill('测试供应商');
    await page.locator('#form-remark').fill('公共照明灯具采购');
    await page.locator('#new-expense-form button[type=submit]').click();
    await page.getByRole('status').filter({ hasText: '支出已提交审批' }).waitFor();
    const expenseId = (await state()).expenses[0].id;
    await action('审批当前支出').click();
    await page.getByLabel('审批意见').fill('测试审批通过');
    await confirm('确认审批');
    await page.getByRole('status').filter({ hasText: '审批结果已保存' }).waitFor();
    assert.equal((await state()).expenses.find(e => e.id === expenseId).status, 'paid');
    await page.reload(); await page.locator('#search-input').fill(expenseId);
    await page.getByText('公共照明灯具采购', { exact: false }).first().waitFor();
  });
  await test('Group transfer balances update and validation', async () => {
    await navigate('/web/group');
    await login('group');
    await page.getByRole('heading', { name: '集团运营中枢', exact: true }).waitFor();
    assert.match(await page.locator('#group-organization').innerText(), /声边平台[\s\S]*物业公司 A[\s\S]*物业公司 B/);
    const before = (await state()).balances.group;
    await action('发起资金调拨').click();
    await page.getByLabel('划拨金额').fill('123.45');
    await page.getByLabel('调拨原由与审批批文号').fill('审批批文 TEST-001');
    await confirm('确认模拟调拨');
    await page.getByRole('heading', { name: '模拟调拨成功' }).waitFor();
    assert.equal((await state()).balances.group, Math.round((before - 123.45) * 100) / 100);
  });
  await test('Broadcast publish and cross-tab resident update', async () => {
    const resident = await context.newPage();
    await resident.goto(base + '/mobile/home');
    await navigate('/web/broadcast');
    await page.locator('#noticeTitle').fill('自动化广播：今晚设备检修');
    await page.locator('#noticeContent').fill('今晚20点进行设备检修，请居民注意。');
    await action('立即发布并同步滚动').click(); await confirm('确认');
    await resident.getByText('自动化广播：今晚设备检修', { exact: false }).waitFor();
    await action('下线撤回').click(); await confirm('确认');
    await resident.locator('#active-broadcast').waitFor({ state: 'hidden' });
    await resident.close();
  });
  await test('Weekly draft, preview, publication and resident article', async () => {
    await navigate('/web/media');
    const weeklySummary = page.locator('main textarea').first();
    await weeklySummary.fill('本周完成电梯维保、消防巡检和居民回访，相关记录已归档。');
    await page.locator('main textarea').nth(1).fill('下周继续跟进设备巡检复核，并完成居民满意度回访。');
    await action('保存草稿').first().click();
    await page.reload(); await page.waitForFunction(() => !!window.demoAudit);
    assert.equal(await weeklySummary.inputValue(), '本周完成电梯维保、消防巡检和居民回访，相关记录已归档。');
    await action('提交发布').first().click(); await confirm('确认发布');
    await page.getByRole('heading', { name: '发布成功' }).waitFor();
    const article = (await state()).articles.find(a => a.title === '物业服务工作周报');
    assert.equal(article.audience, 'community');
    assert.deepEqual(article.communityIds, ['pengyi']);
    await confirm('查看居民端内容');
    await page.waitForURL(/\/mobile\/articles\/WEEK-/);
    await page.getByRole('heading', { name: '物业服务工作周报' }).waitFor();
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('shengbian-demo-v1'));
      state.user.communityId = 'penger';
      localStorage.setItem('shengbian-demo-v1', JSON.stringify(state));
    });
    await navigate('/mobile/articles/' + article.id);
    await page.getByRole('heading', { name: '内容不存在' }).waitFor();
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('shengbian-demo-v1'));
      state.user.communityId = 'pengyi';
      localStorage.setItem('shengbian-demo-v1', JSON.stringify(state));
    });
  });
  await test('Logout returns to protected page after login', async () => {
    await navigate('/mobile/profile?panel=account');
    await confirm('退出登录'); await confirm('确认');
    await page.waitForURL(/\/mobile\/login$/);
    await navigate('/mobile/points');
    assert.match(page.url(), /login\?next=/);
    await login('resident');
    assert.match(page.url(), /\/mobile\/points$/);
  });
  assert.deepEqual(failures, []);
} finally {
  await fs.writeFile('test-results/e2e.json', JSON.stringify({ reports, consoleErrors: failures }, null, 2));
  await browser.close();
}
