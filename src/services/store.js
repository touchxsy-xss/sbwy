import { initialState, statuses, rewards, products, organization, communityById, arrivalPolicies, arrivalStatus } from '../data/seed.js';

export const STORAGE_KEY = 'shengbian-demo-v1';
export const id = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
export const now = () => new Date().toISOString();
export const money = value => Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const isPhone = value => /^1[3-9]\d{9}$/.test(value);
export const isAmount = value => /^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) > 0 && Number(value) <= 100000000;
export function createStore(storage, notify = () => {}) {
  function migrate(state) {
    state.version = 2;
    state.organization ||= structuredClone(organization);
    const legacyCompanyNames = { '示范物业公司 A': '物业公司 A', '合作物业公司 B': '物业公司 B' };
    state.organization.companies?.forEach(company => { if (legacyCompanyNames[company.name]) company.name = legacyCompanyNames[company.name]; });
    state.contexts ||= { property: { companyId: 'property-a', communityId: 'pengyi' }, worker: { companyId: 'property-a', communityId: 'pengyi' } };
    state.user.communityId ||= 'pengyi';
    state.orders.forEach(order => {
      order.communityId ||= state.user.communityId;
      order.companyId ||= communityById(order.communityId, state.organization)?.companyId || 'property-a';
      order.sla ||= { arrivalMinutes: order.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes };
      if (['accepted', 'arrived', 'processing', 'completed', 'closed'].includes(order.status) && !order.acceptedAt) {
        order.acceptedAt = order.timeline?.find(t => t.status === 'accepted')?.at || order.createdAt || now();
      }
      if (order.acceptedAt && !order.arrivalDueAt) {
        order.arrivalDueAt = new Date(new Date(order.acceptedAt).getTime() + order.sla.arrivalMinutes * 60000).toISOString();
      }
      if (['arrived', 'processing', 'completed', 'closed'].includes(order.status) && !order.checkinAt) {
        order.checkinAt = order.timeline?.find(t => t.status === 'arrived')?.at || order.acceptedAt;
      }
      if (order.checkinAt && !order.arrivalResult) order.arrivalResult = arrivalStatus(order, new Date(order.checkinAt).getTime());
    });
    state.articles.forEach(article => {
      if (!article.audience && ['elevator', 'safety'].includes(article.id)) article.audience = 'platform';
      article.audience ||= 'community';
      if (article.audience === 'community') article.communityIds ||= [state.user.communityId];
      if (article.audience === 'platform') article.communityIds = [];
      article.publisher ||= article.audience === 'platform' ? '声边平台' : `${state.user.community}物业服务中心`;
    });
    state.notices.forEach(notice => {
      notice.audience ||= 'community';
      if (notice.audience === 'community') notice.communityIds ||= [state.user.communityId];
      notice.publisher ||= `${state.user.community}物业服务中心`;
    });
    return state;
  }
  function read() {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const state = JSON.parse(raw);
        if ([1, 2].includes(state.version) && Array.isArray(state.orders) && state.user) {
          const migrated = migrate(state);
          storage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      } catch { /* A damaged demo snapshot must not blank the application. */ }
    }
    const state = migrate(initialState());
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }
  function change(fn) {
    const state = read();
    const result = fn(state);
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    notify(state);
    return result;
  }
  function points(state, delta, reason, key) {
    if (state.pointsLog.some(p => p.id === key)) return;
    if (state.user.points + delta < 0) throw new Error('积分不足，请先完成积分任务');
    state.user.points += delta;
    state.pointsLog.unshift({ id: key, delta, reason, at: now() });
  }
  function log(state, action, target) { state.logs.unshift({ id: id('LOG'), action, target, at: now() }); }
  return {
    read, change,
    createOrder(input) {
      if (!input.description?.trim() || input.description.trim().length < 5) throw new Error('请填写至少5个字的故障描述');
      if (!input.room?.trim()) throw new Error('请选择报修位置');
      if (!isPhone(input.phone)) throw new Error('请输入有效的11位手机号码');
      if (!input.appointment) throw new Error('请选择预约时间');
      return change(s => {
        const communityId = s.user.communityId;
        const companyId = communityById(communityId, s.organization)?.companyId || s.contexts.property.companyId;
        const order = { ...input, id: id('BX'), title: input.description.trim().slice(0, 42), status: 'pending', createdAt: now(), technician: '', amount: 0, paid: false, companyId, communityId, sla: { arrivalMinutes: input.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes }, timeline: [{ label: '居民提交报修', status: 'pending', at: now() }] };
        if (s.settings.autoDispatch) {
          order.status = 'assigned'; order.technician = '张建国';
          order.timeline.push({ label: '系统自动派发给张建国', status: 'assigned', at: now() });
        }
        s.orders.unshift(order); log(s, '新建报修', order.id); return order;
      });
    },
    transition(orderId, next, extra = {}) {
      return change(s => {
        const order = s.orders.find(o => o.id === orderId);
        if (!order) throw new Error('工单不存在或已删除');
        if (order.status === next) return order;
        const allowed = { pending: ['assigned', 'accepted', 'cancelled'], assigned: ['accepted', 'pending', 'cancelled'], accepted: ['arrived', 'assigned'], arrived: ['processing', 'completed'], processing: ['completed'], completed: ['closed'] };
        if (!allowed[order.status]?.includes(next)) throw new Error(`当前工单为${statuses[order.status]}，不可执行此操作`);
        if (next === 'assigned' && !extra.technician) throw new Error('请选择维修师傅');
        if (next === 'completed' && !extra.photos?.length) throw new Error('请至少上传1张完工照片');
        if (next === 'completed' && (!Number.isFinite(extra.amount) || extra.amount < 0)) throw new Error('结算金额不正确');
        const eventAt = next === 'arrived' && extra.checkinAt ? extra.checkinAt : now();
        if (next === 'accepted') {
          const minutes = order.sla?.arrivalMinutes || (order.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes);
          extra.acceptedAt ||= eventAt;
          extra.arrivalDueAt ||= new Date(new Date(extra.acceptedAt).getTime() + minutes * 60000).toISOString();
          extra.sla = { ...(order.sla || {}), arrivalMinutes: minutes };
        }
        if (next === 'arrived') {
          if (!order.acceptedAt || !order.arrivalDueAt) throw new Error('工单尚未完成接单，不能进行到岗打卡');
          extra.checkinAt ||= eventAt;
          const snapshot = { ...order, ...extra };
          extra.arrivalResult = arrivalStatus(snapshot, new Date(extra.checkinAt).getTime());
        }
        Object.assign(order, extra, { status: next });
        const timelineLabel = next === 'accepted'
          ? `师傅接单，到岗时限 ${order.sla.arrivalMinutes} 分钟`
          : next === 'arrived'
            ? `现场到岗打卡：${order.arrivalResult.text}`
            : statuses[next];
        order.timeline.push({ status: next, label: timelineLabel, at: eventAt });
        if (next === 'completed' && order.amount > 0 && !order.paid) {
          s.bills.push({ id: 'repair-' + order.id, orderId: order.id, title: order.title + ' · 维修结算', amount: order.amount, type: 'others', book: 'current', room: order.room, paid: false });
        }
        log(s, statuses[next], orderId); return order;
      });
    },
    pay(billIds, couponId) {
      return change(s => {
        const bills = s.bills.filter(b => billIds.includes(b.id) && !b.paid);
        if (!bills.length) throw new Error('账单已缴清，请勿重复支付');
        if (bills.length !== new Set(billIds).size) throw new Error('账单状态已变化，请刷新后重新确认');
        let amount = Math.round(bills.reduce((sum, b) => sum + b.amount, 0) * 100) / 100;
        const coupon = couponId && s.coupons.find(c => c.id === couponId && !c.used);
        if (couponId && !coupon) throw new Error('抵扣券已失效');
        if (coupon && !bills.every(b => b.type === coupon.type)) throw new Error('抵扣券不适用于所选账单');
        const discount = coupon ? Math.min(coupon.amount, amount) : 0;
        amount = Math.round((amount - discount) * 100) / 100;
        const payment = { id: id('PAY'), billIds: bills.map(b => b.id), amount, discount, at: now(), status: 'paid' };
        bills.forEach(b => {
          b.paid = true; b.paymentId = payment.id; b.paidAt = payment.at;
          const order = s.orders.find(o => o.id === b.orderId); if (order) order.paid = true;
        });
        if (coupon) coupon.used = true;
        s.payments.unshift(payment); points(s, Math.floor(amount), '在线缴费', payment.id);
        log(s, '模拟支付成功', payment.id); return payment;
      });
    },
    review(orderId, input) {
      return change(s => {
        const order = s.orders.find(o => o.id === orderId);
        if (!order || !['completed', 'closed'].includes(order.status)) throw new Error('仅已完工的工单可以评价');
        if (s.reviews.some(r => r.orderId === orderId)) throw new Error('该工单已评价，积分不会重复发放');
        if (!(input.rating >= 1 && input.rating <= 5)) throw new Error('请选择1至5星评分');
        if (input.comment?.length > 300) throw new Error('评价不能超过300字');
        const review = { ...input, id: id('REV'), orderId, at: now() };
        s.reviews.push(review); points(s, 20, '完成维修服务评价', 'review-' + orderId);
        order.status = 'closed'; order.timeline.push({ status: 'closed', label: '居民评价并归档', at: now() });
        log(s, '提交评价', orderId); return review;
      });
    },
    publishContent(input, actor = {}) {
      return change(s => {
        const context = { ...s.contexts.property, ...actor };
        const audience = input.audience || 'community';
        if (audience === 'platform' && context.level !== 'platform') throw new Error('平台统一内容只能由声边平台发布');
        const communityIds = audience === 'platform' ? [] : (input.communityIds || [context.communityId]);
        if (audience === 'community' && (communityIds.length !== 1 || communityIds[0] !== context.communityId)) throw new Error('物业运营端只能发布到当前管理小区');
        const publisher = audience === 'platform' ? '声边平台' : `${communityById(context.communityId, s.organization)?.name || '当前小区'}物业服务中心`;
        const article = { ...input, id: input.id || id('CONTENT'), audience, communityIds, companyId: context.companyId, publisher, at: input.at || now() };
        s.articles.unshift(article); log(s, audience === 'platform' ? '发布平台统一内容' : '发布小区专属内容', article.id); return article;
      });
    },
    publishNotice(input) {
      return change(s => {
        const context = s.contexts.property;
        const notice = { ...input, id: input.id || id('NOTICE'), audience: 'community', communityIds: [context.communityId], companyId: context.companyId, publisher: `${communityById(context.communityId, s.organization)?.name || '当前小区'}物业服务中心`, at: input.at || now() };
        s.notices.forEach(n => { if (n.active && n.audience === 'community' && n.communityIds?.includes(context.communityId)) n.active = false; });
        s.notices = [notice, ...s.notices.filter(n => n.id !== notice.id)];
        log(s, '发布小区紧急通知', notice.id); return notice;
      });
    },
    redeem(rewardId, delivery, requestId, options = {}) {
      return change(s => {
        if (s.redemptions.some(r => r.requestId === requestId)) return s.redemptions.find(r => r.requestId === requestId);
        const reward = rewards.find(r => r.id === rewardId);
        if (!reward) throw new Error('兑换商品不存在');
        if (reward.cash && options.cashPayment !== 'success') throw new Error('模拟支付失败，积分与兑换记录均未扣减');
        const redemption = { ...reward, rewardId, id: id('EXCHANGE'), requestId, delivery, at: now(), code: String(Math.floor(100000 + Math.random() * 900000)), status: '待核销' };
        points(s, -reward.points, '兑换' + reward.name, redemption.id);
        if (reward.cash) {
          const payment = { id: id('PAY'), billIds: [], redemptionId: redemption.id, amount: reward.cash, discount: 0, at: now(), status: 'paid', kind: 'redemption' };
          redemption.paymentId = payment.id;
          s.payments.unshift(payment);
          log(s, '积分兑换模拟支付成功', payment.id);
        }
        s.redemptions.unshift(redemption);
        if (reward.coupon) s.coupons.push({ id: redemption.id, amount: reward.coupon, type: reward.id === 'parking30' ? 'parking' : 'property', used: false });
        log(s, '积分兑换', redemption.id); return redemption;
      });
    },
    book(productId, input, requestId) {
      if (!isPhone(input.phone)) throw new Error('请输入正确的手机号码');
      if (!Number.isInteger(Number(input.quantity)) || Number(input.quantity) < 1 || Number(input.quantity) > 99) throw new Error('数量须为1至99的整数');
      if (!input.date || input.date < new Date().toLocaleDateString('en-CA')) throw new Error('预约日期不能早于今天');
      return change(s => {
        if (s.bookings.some(b => b.requestId === requestId)) return s.bookings.find(b => b.requestId === requestId);
        const product = products.find(p => p.id === productId);
        if (!product) throw new Error('服务已下架');
        const booking = { ...input, productId, title: product.name, amount: Number((product.price * input.quantity).toFixed(2)), id: id('BOOK'), requestId, at: now(), status: '待确认' };
        s.bookings.unshift(booking); log(s, '提交服务预约', booking.id); return booking;
      });
    },
    transfer(input) {
      if (!isAmount(input.amount)) throw new Error('请输入大于0且最多两位小数的金额');
      if (input.from === input.to) throw new Error('调出与接收账户不能相同');
      if (!input.reason?.trim()) throw new Error('请填写调拨原由与审批批文号');
      return change(s => {
        const amount = Number(input.amount);
        if (!(input.from in s.balances) || !(input.to in s.balances)) throw new Error('账户不存在');
        if (s.balances[input.from] < amount) throw new Error('调出账户余额不足');
        s.balances[input.from] = Math.round((s.balances[input.from] - amount) * 100) / 100;
        s.balances[input.to] = Math.round((s.balances[input.to] + amount) * 100) / 100;
        const transfer = { ...input, amount, id: id('TR'), at: now(), status: '模拟入账' };
        s.transfers.unshift(transfer); log(s, '模拟跨项目调拨', transfer.id); return transfer;
      });
    },
    award(delta, reason, key) { return change(s => points(s, delta, reason, key)); },
    saveDraft(key, value) { return change(s => { s.drafts[key] = value; }); },
    toggle(collection, key) {
      return change(s => { const index = s[collection].indexOf(key); if (index < 0) s[collection].push(key); else s[collection].splice(index, 1); return index < 0; });
    },
    record(action, target) { return change(s => log(s, action, target)); }
  };
}
