import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.document = { cookie: 'sb_csrf=test-csrf' };
globalThis.__SHENGBIAN_API_BASE__ = 'https://api.example.test/api/v1';

const { ApiError } = await import('../src/api/client.js');
const workOrders = await import('../src/api/work-orders.js');

test('Phase 2B.2 maps frozen statuses to resident-safe Chinese text', () => {
  assert.equal(workOrders.residentStatusLabels.COMPLETED, '待您确认');
  assert.equal(workOrders.residentStatusLabels.REWORK_REQUIRED, '返工处理中');
  assert.equal(workOrders.residentStatusLabels.ARCHIVED, '已完成');
  assert.equal(Object.keys(workOrders.residentStatusLabels).length, 8);
});

test('Phase 2B.2 sends real API paths, pagination, and CSRF on mutations', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ data: { ok: true } }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  await workOrders.listWorkOrders({ page: 2, pageSize: 20, status: 'COMPLETED' });
  await workOrders.createWorkOrder({ scope: 'PRIVATE', houseId: 'house-id' });
  await workOrders.confirmCompletion('order-id');
  await workOrders.requestRework('order-id', '水管仍然漏水');
  await workOrders.submitReview('order-id', { rating: 5, comment: '处理及时' });
  assert.match(calls[0].url, /work-orders\?page=2&pageSize=20&status=COMPLETED$/);
  assert.equal(calls[1].options.method, 'POST');
  assert.equal(calls[1].options.headers.get('X-CSRF-Token'), 'test-csrf');
  assert.match(calls[3].options.body, /水管仍然漏水/);
  assert.match(calls[4].options.body, /"rating":5/);
});

test('Phase 2B.2 presents security and conflict errors without leaking internals', () => {
  assert.equal(workOrders.apiErrorMessage(new ApiError('x', { status: 401 })), '登录已失效，请重新登录');
  assert.equal(workOrders.apiErrorMessage(new ApiError('x', { status: 403 })), '您当前无权操作该工单');
  assert.equal(workOrders.apiErrorMessage(new ApiError('x', { status: 404 })), '该工单不存在或您无权查看');
  assert.equal(workOrders.apiErrorMessage(new ApiError('x', { status: 409 })), '工单状态已发生变化，请刷新后重试');
  assert.equal(workOrders.apiErrorMessage(new ApiError('SELECT secret', { status: 500 })), '服务暂时不可用，请稍后重试');
});
