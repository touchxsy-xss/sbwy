import { $, $$, bind, label, icon, escape, modal, closeModal, formModal, field, confirm, toast, busy, active, list, empty, download } from '../ui.js';
import { isPhone, now, id, money } from '../services/store.js';
import { products, rewards, statuses } from '../data/seed.js';
import { createRadio } from '../services/audio.js';
import { login as apiLogin } from '../api/auth.js';

const find = (text, root = document) => $$('button,a,[role="button"],.cursor-pointer', root).filter(e => typeof text === 'string' ? label(e) === text : text.test(label(e)));
const on = (text, fn) => find(text).forEach(el => { if (!el.dataset.action) bind(el, label(el), () => fn(el)); });
const today = () => new Date().toLocaleDateString('en-CA');

export function initResident(ctx) {
  const { route, store, state, go, qs, panel, requireAuth } = ctx;
  if (route.key === 'login') loginPage(ctx);
  if (route.key === 'verify') verifyPage(ctx);
  if (route.key === 'repair') repairPage(ctx);
  if (route.key === 'review') reviewPage(ctx);
  if (['bills', 'billing'].includes(route.key)) billingPage(ctx);
  if (route.key === 'points') pointsPage(ctx);
  if (route.key === 'services') servicesPage(ctx);
  if (route.key === 'profile') {
    const amount = $$('span,div').find(e => e.children.length === 0 && e.textContent.trim() === '1,280 积分');
    if (amount) { amount.dataset.points = ''; amount.textContent = state().user.points.toLocaleString('zh-CN'); }
    const activeOrder = state().orders.find(o => !['closed', 'cancelled'].includes(o.status) && o.room === state().user.room);
    const card = $$('main div').find(e => e.classList.contains('bg-surface-container-lowest') && e.textContent.includes('正在为您服务'));
    if (card && activeOrder) {
      const title = $('h2,h3,h4', card);
      if (title) title.textContent = activeOrder.title;
      bind(card, '查看进行中工单', () => go('/mobile/orders/' + activeOrder.id));
    }
    renderPendingReviews(ctx, card);
    const buttons = document.createElement('div'); buttons.className = 'demo-inline';
    buttons.innerHTML = `<button class="demo-button secondary" data-profile="bookings">${icon('event_note')}预约记录</button><button class="demo-button secondary" data-profile="account">${icon('manage_accounts')}账号设置</button><button class="demo-button secondary" data-profile="bills">${icon('receipt_long')}历史账期</button>`;
    $('main > div').append(buttons);
    $$('[data-profile]').forEach(b => bind(b, label(b), () => b.dataset.profile === 'bills' ? go('/mobile/bills') : panel(b.dataset.profile)));
  }
  if (route.group === 'mobile') {
    on(/我要开闪铺|我要开铺|我也要开铺|入驻开店/, () => requireAuth(() => shopForm(ctx)));
    on(/发布|说点什么|文字投稿/, () => requireAuth(() => postForm(ctx)));
    on(/^我的报修/, () => panel('orders'));
    on(/积分明细/, () => pointsHistory(ctx));
    on(/兑换记录/, () => redemptionHistory(ctx));
    on(/去逛邻里圈/, () => go('/mobile/services?panel=community-feed'));
    if (qs.get('panel') === 'community-feed') communityFeed(ctx);
  }
}

function renderPendingReviews(ctx, activeCard) {
  const { state, go } = ctx;
  const snapshot = state();
  const pending = snapshot.orders.filter(order =>
    (order.room === snapshot.user.room || order.contact === snapshot.user.name || order.phone === snapshot.user.phone) &&
    order.communityId === snapshot.user.communityId &&
    order.status === 'completed' &&
    !snapshot.reviews.some(review => review.orderId === order.id)
  );
  if (!pending.length) return;

  const section = document.createElement('section');
  section.className = 'demo-pending-reviews';
  section.setAttribute('aria-label', '待评价服务');
  section.innerHTML = `<div class="demo-pending-reviews-heading"><div><span class="material-symbols-outlined" aria-hidden="true">rate_review</span><div><h2>待评价服务</h2><p>维修已完成，您的反馈将帮助物业改进服务</p></div></div><span>${pending.length} 项待办</span></div><div class="demo-pending-review-list">${pending.map(order => `<article><div><strong>${escape(order.title)}</strong><small>${escape(order.room)} · ${escape(order.technician || '维修师傅')} · ${new Date(order.timeline?.at(-1)?.at || order.createdAt).toLocaleDateString('zh-CN')} 完工</small></div><button class="demo-button" data-pending-review="${escape(order.id)}">立即评价 ${icon('arrow_forward')}</button></article>`).join('')}</div>`;
  const mainContent = $('main > div');
  if (activeCard?.parentElement === mainContent) activeCard.after(section);
  else mainContent?.prepend(section);
  $$('[data-pending-review]', section).forEach(button => bind(button, '立即评价服务', () => go('/mobile/review?id=' + button.dataset.pendingReview)));
}

function loginPage(ctx) {
  const { route, qs, safeNext, go, state, role } = ctx;
  const account = $('#accountInput'), password = $('#passwordInput'), agreement = $('#agreementCheckbox');
  account.value = role === 'group' ? 'group-admin' : role === 'admin' ? 'admin' : role === 'worker' ? 'worker' : '13800006688';
  password.value = 'demo123';
  password.autocomplete = 'current-password';
  agreement.checked = false;
  if (role !== 'resident') {
    const heading = $('header h1,header .font-headline-sm');
    if (heading) heading.textContent = role === 'group' ? '集团管理员登录' : role === 'admin' ? '物业管理员登录' : '维修师傅登录';
  }
  bind($('#clearAccountBtn'), '清空账号', () => { account.value = ''; account.focus(); });
  bind($('#togglePasswordBtn'), '显示或隐藏密码', () => {
    password.type = password.type === 'password' ? 'text' : 'password';
    $('#eyeIcon').textContent = password.type === 'password' ? 'visibility_off' : 'visibility';
  });
  $('#clearAccountBtn').classList.remove('opacity-0', 'pointer-events-none');
  let mode = 'password';
  on(/短信验证码登录/, el => {
    mode = mode === 'password' ? 'sms' : 'password';
    password.type = mode === 'sms' ? 'text' : 'password';
    password.value = mode === 'sms' ? '123456' : 'demo123';
    password.setAttribute('aria-label', mode === 'sms' ? '演示验证码' : '登录密码');
    el.innerHTML = icon('sms') + (mode === 'sms' ? '账号密码登录' : '短信验证码登录');
    toast(mode === 'sms' ? '演示验证码为123456，不会发送真实短信' : '已切换密码登录');
  });
  on(/忘记密码/, () => formModal('重置演示密码', field('phone', '手机号', '', { type: 'tel', pattern: '1[3-9][0-9]{9}' }) + field('code', '演示验证码', '123456') + field('password', '新密码', '', { type: 'password' }) + field('confirm', '确认密码', '', { type: 'password' }), v => {
    if (v.code !== '123456') throw new Error('验证码不正确');
    if (v.password.length < 6) throw new Error('密码至少6位');
    if (v.password !== v.confirm) throw new Error('两次密码输入不一致');
    sessionStorage.setItem('shengbian-password', v.password);
    toast('演示密码已更新');
  }));
  const submit = btn => busy(btn, async () => {
    if (!agreement.checked) throw new Error('请先阅读并同意服务协议与隐私政策');
    const validAccount = ['admin', 'worker', 'group-admin'].includes(account.value.trim()) || isPhone(account.value.trim());
    if (!validAccount) throw new Error('请输入有效手机号或演示账号');
    const usingApi = role !== 'resident' && isPhone(account.value.trim());
    if (!usingApi && mode === 'password' && password.value !== (sessionStorage.getItem('shengbian-password') || 'demo123')) throw new Error('账号或密码不正确');
    if (mode === 'sms' && password.value !== '123456') throw new Error('验证码不正确');
    if (role !== 'resident' && isPhone(account.value.trim())) {
      if (mode !== 'password') throw new Error('正式账号请使用密码登录');
      await apiLogin(account.value.trim(), password.value);
      sessionStorage.setItem('shengbian-api-auth-' + role, 'yes');
    }
    if (role === 'admin' && !usingApi && account.value !== 'admin') throw new Error('请使用管理员演示账号 admin');
    if (role === 'worker' && !usingApi && account.value !== 'worker') throw new Error('请使用维修师傅演示账号 worker');
    if (role === 'group' && !usingApi && account.value !== 'group-admin') throw new Error('请使用集团管理员演示账号 group-admin');
    sessionStorage.setItem('shengbian-auth-' + role, 'yes');
    go(safeNext(qs.get('next') || (role === 'group' ? '/web/group' : role === 'admin' ? '/web/overview' : role === 'worker' ? '/worker/tasks' : '/mobile/home')));
  });
  const submitButton = $('#loginForm button[type="submit"]');
  submitButton.dataset.action = '立即登录';
  $('#loginForm').addEventListener('submit', e => { e.preventDefault(); submit(submitButton).catch(error => toast(error.message, true)); });
  on('微信一键快捷登录', btn => {
    if (!agreement.checked) return toast('请先同意服务协议与隐私政策', true);
    confirm('微信演示授权', '将以测试居民身份登录，不会读取真实微信信息。', () => sessionStorage.setItem('shengbian-auth-resident', 'yes'), { label: '确认授权', after: () => go(safeNext(qs.get('next') || '/mobile/home')) });
  });
  on(/去办理/, () => go('/mobile/verify'));
  const note = document.createElement('p'); note.className = 'demo-auth-note'; note.textContent = '演示环境 · 使用虚构资料 · 无真实身份核验或支付';
  $('#loginForm').after(note);
  const audio = $$('main div').find(e => e.classList.contains('rounded-xl') && e.textContent.includes('社区邻里晨播台'));
  if (audio) bind(audio, '收听晨间广播', () => ctx.speech(undefined));
}

function verifyPage(ctx) {
  const { store, state, go, upload } = ctx;
  let role = 'owner', method = 1;
  const nameInput = $('input[placeholder*="真实姓名"]'), idInput = $('#idCardInput');
  idInput.value = '110101199001010010'; idInput.type = 'password';
  bind($('#toggleIdMask'), '显示或隐藏证件号码', () => { idInput.type = idInput.type === 'password' ? 'text' : 'password'; $('#eyeIcon').textContent = idInput.type === 'password' ? 'visibility_off' : 'visibility'; });
  const roleButtons = [$('#roleOwnerBtn'), $('#roleTenantBtn')];
  roleButtons.forEach((btn, i) => bind(btn, i ? '租客入住' : '业主入住', () => {
    role = i ? 'tenant' : 'owner'; active(roleButtons, btn);
    $('#ownerVerificationCard').classList.toggle('hidden', !!i); $('#tenantHintCard').classList.toggle('hidden', !i);
    $('#submitBtn').innerHTML = icon('verified_user') + (i ? '提交租约并申请认证' : '提交确权并绑定房屋');
    if (i && !$('#tenant-upload')) {
      const button = document.createElement('button'); button.id = 'tenant-upload'; button.className = 'demo-button secondary'; button.textContent = '上传租约';
      $('#tenantHintCard').append(button); bind(button, '上传租约', () => upload(button, { accept: 'image/*,.pdf' }));
    }
  }));
  for (let i = 1; i <= 3; i++) bind($('#tabMethod' + i), '认证方式' + i, () => {
    method = i;
    for (let j = 1; j <= 3; j++) $('#methodContent' + j).classList.toggle('hidden', j !== i);
    active([1, 2, 3].map(j => $('#tabMethod' + j)), $('#tabMethod' + i));
  });
  $$('main .material-symbols-outlined').filter(e => ['keyboard_arrow_down', 'expand_more'].includes(e.textContent.trim())).forEach(el => {
    const row = el.parentElement;
    bind(row, '选择房屋信息', () => formModal('房屋坐落', field('room', '楼栋-单元-房号', state().user.room), v => {
      if (!/^\d{1,3}-\d{1,2}-\d{1,4}$/.test(v.room)) throw new Error('房号格式为16-2-502');
      store.change(s => s.user.room = v.room); toast('房屋信息已更新');
      row.querySelector('span').textContent = v.room;
    }));
  });
  $$('main .material-symbols-outlined').filter(e => ['receipt_long', 'task_alt'].includes(e.textContent.trim()) && e.closest('[id^="methodContent"]')).forEach(el => {
    const card = el.parentElement;
    if (!card.closest('[data-action]')) bind(card, '上传认证凭证', () => upload(card, { accept: 'image/*,.pdf' }));
  });
  bind($('#submitBtn'), '提交房屋认证', btnEvent => {
    const name = nameInput.value.trim();
    if (name.length < 2) throw new Error('请输入真实姓名（演示请使用虚构姓名）');
    if (!/^\d{17}[\dXx]$/.test(idInput.value)) throw new Error('身份证号码须为18位');
    if (!$('#agreementCheck').checked) throw new Error('请确认并同意房屋信息授权');
    const value = $(`#methodContent${method} input`)?.value.trim();
    if (role === 'owner' && !value) throw new Error('请填写所选认证方式的凭证编号');
    if (role === 'owner' && method === 2 && !/^\d{20}$/.test(value)) throw new Error('网签合同号须为20位数字');
    if (role === 'tenant' && !(state().drafts['uploads-verify'] || []).length) throw new Error('请上传租约凭证');
    return confirm('提交房产认证', '此操作仅创建演示认证记录，不会调用真实公安或房产接口。', () => {
      store.change(s => {
        s.user.name = name; s.user.verified = role === 'owner'; s.user.role = role;
        s.logs.unshift({ id: id('VERIFY'), action: '提交房产认证', target: `${name} · ${s.user.room} · ${role === 'tenant' ? '租客待审核' : '演示确权'}`, at: now() });
      });
      sessionStorage.setItem('shengbian-auth-resident', 'yes');
    }, { after: () => go('/mobile/profile') });
  });
}

function repairPage(ctx) {
  const { store, state, go, upload } = ctx;
  let scope = 'private', category = '管道疏通', date = today(), slot = '上午时段 09:00 - 11:30', callConfirm = true;
  renderRepairCenter(ctx);
  const draft = state().drafts.repair || {};
  if (draft.description) $('#issue-text').value = draft.description;
  const save = () => store.saveDraft('repair', { description: $('#issue-text').value, scope, category, date, slot, callConfirm });
  $('#issue-text').maxLength = 1000; $('#issue-text').addEventListener('input', save);
  [$('#tab-private'), $('#tab-public')].forEach((btn, i) => bind(btn, i ? '公共区域报修' : '室内专有报修', () => {
    scope = i ? 'public' : 'private'; active([$('#tab-private'), $('#tab-public')], btn); save();
  }));
  $$('#category-group button').forEach(btn => bind(btn, label(btn), () => { category = label(btn); active($$('#category-group button'), btn); save(); }));
  $$('#date-selector button').forEach((btn, i) => {
    if (i < 3) {
      const d = new Date(); d.setDate(d.getDate() + i); const value = d.toLocaleDateString('en-CA');
      $('span:last-child', btn).textContent = `${d.getMonth() + 1}-${d.getDate()}`;
      bind(btn, ['今天', '明天', '后天'][i], () => { date = value; active($$('#date-selector button'), btn); save(); });
    } else bind(btn, '自选日期', () => formModal('选择预约日期', field('date', '预约日期', date, { type: 'date', min: today() }), v => { date = v.date; active($$('#date-selector button'), btn); $('span:last-child', btn).textContent = date; save(); }));
  });
  $$('#slot-selector button').forEach(btn => bind(btn, label(btn), () => { slot = label(btn); active($$('#slot-selector button'), btn); save(); }));
  bind($('#toggle-call'), '上门前电话确认', () => {
    callConfirm = !callConfirm; $('#toggle-call').setAttribute('aria-pressed', String(callConfirm));
    $('#toggle-call').style.background = callConfirm ? '#006544' : '#bdc9c0';
    $('#toggle-call span').style.transform = `translateX(${callConfirm ? 16 : 0}px)`; save();
  });
  bind($('#voice-record-btn'), '语音填写故障描述', () => voiceInput(ctx, $('#issue-text')));
  on(/立即提交报修/, btn => {
    if ($('#issue-text').value.trim().length < 5) throw new Error('请填写至少5个字的故障描述');
    formModal('确认报修信息', `<p>${escape(category)} · ${escape(date)} · ${escape(slot)}</p>` + field('contact', '联系人', state().user.name) + field('phone', '联系电话', state().user.phone, { type: 'tel', pattern: '1[3-9][0-9]{9}' }) + field('room', scope === 'public' ? '公共区域具体位置' : '报修房屋', scope === 'public' ? '' : state().user.room), values => {
      const photos = [
        ...$$('main img').map(img => ({ src: img.src, name: '现场示例照片' })),
        ...(state().drafts['uploads-repair'] || [])
      ];
      const order = store.createOrder({ ...values, scope, category, description: $('#issue-text').value.trim(), appointment: date + ' ' + slot, urgent: slot.includes('加急'), callConfirm, photos });
      store.saveDraft('repair', {}); store.saveDraft('uploads-repair', []);
      go('/mobile/orders/' + order.id + '?submitted=1');
    }, '确认提交报修');
  });
}

function renderRepairCenter(ctx) {
  const { state, go } = ctx;
  const snapshot = state();
  const ownerOrders = snapshot.orders
    .filter(order =>
      (!order.communityId || order.communityId === snapshot.user.communityId) &&
      (order.room === snapshot.user.room || order.contact === snapshot.user.name || order.phone === snapshot.user.phone)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const active = ownerOrders.filter(order => !['completed', 'closed', 'cancelled'].includes(order.status));
  const history = ownerOrders.filter(order => ['completed', 'closed', 'cancelled'].includes(order.status));
  const pendingReviews = history.filter(order => order.status === 'completed' && !snapshot.reviews.some(review => review.orderId === order.id));
  const statusText = order => {
    const review = snapshot.reviews.find(item => item.orderId === order.id);
    if (order.status === 'completed' && !review) return '已完工，待评价';
    return review ? `已评价 ${review.rating} 星` : statuses[order.status];
  };
  const section = document.createElement('section');
  section.id = 'resident-repair-center';
  section.className = 'demo-repair-center';
  section.innerHTML = `<div class="demo-repair-center-heading"><div><span class="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span><div><h2>我的报修</h2><p>提交后可在这里查看进度、历史和服务评价</p></div></div><button class="demo-button secondary" data-repair-all>全部记录</button></div>` +
    `<div class="demo-repair-metrics"><span>进行中 ${active.length}</span><span>历史 ${history.length}</span><span>待评价 ${pendingReviews.length}</span></div>` +
    `<div class="demo-repair-section"><h3>进行中</h3>${active.length ? active.slice(0, 1).map(order => `<button class="demo-repair-order" data-repair-detail="${escape(order.id)}"><div><strong>${escape(order.title)}</strong><small>${escape(order.id)} · ${escape(order.appointment)}</small></div><span class="demo-repair-status active">${escape(statusText(order))}</span></button>`).join('') : '<div class="demo-repair-empty">暂无进行中的报修</div>'}</div>` +
    `<div class="demo-repair-section"><h3>待评价</h3>${pendingReviews.length ? pendingReviews.slice(0, 1).map(order => `<article class="demo-repair-order"><div><strong>${escape(order.title)}</strong><small>${escape(order.technician || '维修师傅')}已完成服务</small></div><button class="demo-button" data-repair-review="${escape(order.id)}">立即评价 ${icon('arrow_forward')}</button></article>`).join('') : '<div class="demo-repair-empty">暂无待评价的完工工单</div>'}</div>` +
    `<div class="demo-repair-section"><h3>历史报修</h3>${history.length ? history.slice(0, 1).map(order => `<button class="demo-repair-order" data-repair-detail="${escape(order.id)}"><div><strong>${escape(order.title)}</strong><small>${escape(order.id)} · ${new Date(order.createdAt).toLocaleDateString('zh-CN')}</small></div><span class="demo-repair-status">${escape(statusText(order))}</span></button>`).join('') : '<div class="demo-repair-empty">暂无历史报修记录</div>'}</div>`;
  const anchor = $('#tab-private')?.closest('section');
  anchor?.after(section);
  $$('[data-repair-detail]', section).forEach(button => bind(button, '查看报修详情', () => go('/mobile/orders/' + button.dataset.repairDetail)));
  $$('[data-repair-review]', section).forEach(button => bind(button, '评价已完工报修', () => go('/mobile/review?id=' + button.dataset.repairReview)));
  bind($('[data-repair-all]', section), '查看全部报修记录', () => go('/mobile/profile?panel=orders'));
}

function reviewPage(ctx) {
  const { state, store, qs, go } = ctx;
  const orderId = qs.get('id') || 'BX202407220038';
  const order = state().orders.find(o => o.id === orderId);
  let rating = 5;
  const subratings = { 上门准时性: 5, 技术专业度: 5, 服务态度: 5, 现场卫生: 5 };
  const stars = $$('#main-star-group button');
  stars.forEach((btn, index) => bind(btn, `${index + 1}星`, () => {
    rating = index + 1;
    stars.forEach((b, i) => { $('span', b).style.fontVariationSettings = `'FILL' ${i <= index ? 1 : 0}`; b.style.color = i <= index ? '#9d6300' : '#bdc9c0'; b.setAttribute('aria-pressed', String(i <= index)); });
    $('#rating-text span:last-child').textContent = ['非常不满意，有待改进', '较不满意，体验欠佳', '一般，基本符合预期', '满意，师傅技术可靠', '非常满意，超出预期！'][index];
  }));
  $$('.tag-chip').forEach(btn => bind(btn, label(btn), () => { const selected = btn.dataset.selected !== 'true'; btn.dataset.selected = String(selected); btn.classList.toggle('demo-selected', selected); btn.setAttribute('aria-pressed', String(selected)); }));
  $$('.material-symbols-outlined').filter(e => e.textContent.trim() === 'star' && !e.closest('button') && e.closest('main')).forEach(star => {
    const row = star.parentElement.parentElement;
    const all = $$('.material-symbols-outlined', star.parentElement).filter(e => e.textContent === 'star');
    const key = Object.keys(subratings).find(k => row.textContent.includes(k));
    if (key) bind(star, key + '评分', () => { subratings[key] = all.indexOf(star) + 1; all.forEach((s, i) => s.style.fontVariationSettings = `'FILL' ${i < subratings[key] ? 1 : 0}`); });
  });
  $('#comment-input').maxLength = 300;
  $('#comment-input').addEventListener('input', e => $('#char-counter').textContent = `${e.target.value.length}/300`);
  bind($('#voice-btn'), '语音填写评价', () => voiceInput(ctx, $('#comment-input')));
  bind($('#submit-review-btn'), '提交评价并领取积分', () => confirm('提交服务评价', `综合评分：${rating}星。评价后发放20积分，每个工单仅一次。`, () => store.review(orderId, {
    rating, subratings, comment: $('#comment-input').value, tags: $$('.tag-chip[data-selected="true"]').map(label),
    recommend: $$('main input[type=checkbox]')[0]?.checked || false, anonymous: $$('main input[type=checkbox]')[1]?.checked || false,
    photos: state().drafts['uploads-review'] || []
  }), { after: () => {
    modal('评价已提交', '<p>感谢您的真实反馈，20积分已入账。</p>', [{ label: '查看工单', run: () => go('/mobile/orders/' + orderId) }, { label: '查看积分', secondary: true, run: () => go('/mobile/points') }]);
  } }));
  if (!order || !['completed', 'closed'].includes(order.status)) {
    $('#submit-review-btn').disabled = true; toast('该工单不存在或尚未完工，不能评价', true);
  } else {
    const heading = $('main h2'); if (heading) heading.textContent = order.title;
    if (state().reviews.some(r => r.orderId === orderId)) { $('#submit-review-btn').disabled = true; $('#submit-review-btn').textContent = '已评价，积分已入账'; }
  }
}

function billingPage(ctx) {
  const { route, state, qs, store, go } = ctx;
  const book = route.key === 'bills' ? 'legacy' : 'current';
  let tab = ['property', 'parking', 'others'].includes(qs.get('tab')) ? qs.get('tab') : 'property';
  const tabs = ['property', 'parking', 'others'];
  const topAmount = $('#topTotalAmount') || $$('main span').find(e => e.textContent.trim() === '983.20');
  const topTitle = $('#totalTitleLabel');
  const summary = $('#payAllBtn');
  const update = () => {
    const bills = state().bills.filter(b => b.book === book);
    tabs.forEach(type => {
      const content = $('#content-' + type); if (!content) return;
      content.classList.toggle('hidden', type !== tab);
      const bill = bills.find(b => b.type === type);
      if (bill && book === 'current') {
        const title = $('h2,h3,h4', content); if (title) title.textContent = bill.title;
      }
      if (bill) {
        const pendingLabel = $$('span', content).find(e => /^待缴/.test(e.textContent.trim()) && e.children.length === 0);
        if (pendingLabel) { pendingLabel.textContent = bill.paid ? '已缴清' : '待缴账单'; pendingLabel.dataset.billState = ''; }
        $$('[data-bill-pay]', content).forEach(btn => { btn.disabled = bill.paid; if (bill.paid) btn.textContent = '已缴清'; });
      }
    });
    active(tabs.map(t => $('#tab-' + t)), $('#tab-' + tab));
    const pending = bills.filter(b => !b.paid && (book === 'legacy' || b.type === tab));
    if (topAmount) topAmount.textContent = money(pending.reduce((sum, b) => sum + b.amount, 0));
    if (topTitle) topTitle.textContent = `当前待缴总额 (${tab === 'property' ? '物业服务费' : tab === 'parking' ? '车位管理费' : '公共能耗与维修费'})`;
    summary.disabled = !pending.length;
    const text = $('#payAllBtnText'); if (text) text.textContent = !pending.length ? '本项已缴清' : `缴纳${tab === 'property' ? '物业费' : tab === 'parking' ? '停车费' : '其他费用'}`;
    if (!pending.length && book === 'legacy') summary.textContent = '账单已缴清';
    const repairBills = bills.filter(b => b.orderId);
    if (book === 'current') {
      let box = $('#repair-bills');
      if (!box) { box = document.createElement('div'); box.id = 'repair-bills'; $('#content-others').prepend(box); }
      box.innerHTML = list(repairBills, b => `<article><strong>${escape(b.title)}</strong><p>¥${money(b.amount)} · ${b.paid ? '已缴清' : '待缴费'}</p><button class="demo-button" data-repair-pay="${b.id}" ${b.paid ? 'disabled' : ''}>缴纳维修费</button></article>`);
      $$('[data-repair-pay]', box).forEach(btn => bind(btn, '缴纳维修费', () => payDialog(ctx, [btn.dataset.repairPay], update)));
    }
  };
  tabs.forEach(type => bind($('#tab-' + type), '切换' + type + '账单', () => {
    tab = type;
    const url = new URL(location.href); url.searchParams.set('tab', tab); history.replaceState(null, '', url);
    update();
  }));
  bind(summary, '缴纳当前账单', () => payDialog(ctx, state().bills.filter(b => b.book === book && !b.paid && (book === 'legacy' || b.type === tab)).map(b => b.id), update));
  tabs.forEach(type => {
    const content = $('#content-' + type);
    if (!content) return;
    find(/立即缴费|缴车位费|缴纳停车费/, content).forEach(btn => {
      btn.dataset.billPay = type;
      bind(btn, '缴纳' + type + '账单', () => payDialog(ctx, state().bills.filter(b => b.book === book && b.type === type && !b.paid && !b.orderId).map(b => b.id), update));
    });
  });
  bind($('#houseDropdownBtn'), '选择缴费房产', () => {
    $('#houseDropdownMenu').classList.toggle('hidden'); $('#houseDropdownBtn').setAttribute('aria-expanded', String(!$('#houseDropdownMenu').classList.contains('hidden')));
  });
  $$('#houseDropdownMenu > div').forEach((row, i) => bind(row, i ? '选择车位账单' : '选择住宅账单', () => {
    tab = i ? 'parking' : 'property'; $('#houseDropdownMenu').classList.add('hidden'); update();
  }));
  on(/查看公示/, () => go('/mobile/articles/garden'));
  update();
  window.addEventListener('demo:external', update);
  if (qs.get('bill') && state().bills.some(b => b.id === qs.get('bill') && !b.paid)) payDialog(ctx, [qs.get('bill')], update);
}

function payDialog(ctx, billIds, after) {
  if (!billIds.length) return toast('当前账单已缴清');
  const bills = ctx.state().bills.filter(b => billIds.includes(b.id));
  const amount = bills.reduce((sum, b) => sum + b.amount, 0);
  const coupons = ctx.state().coupons.filter(c => !c.used && bills.every(b => b.type === c.type));
  const couponField = field('coupon', '抵扣券', '', { required: false, choices: [['', '不使用'], ...coupons.map(c => [c.id, `抵扣 ¥${c.amount}`])] });
  formModal('确认缴费（模拟支付）', list(bills, b => `<div>${escape(b.title)}<strong>¥${money(b.amount)}</strong></div>`) + `<p>账单合计：<strong>¥${money(amount)}</strong></p>` + couponField + field('result', '支付结果', 'success', { choices: [['success', '模拟支付成功'], ['failure', '模拟支付失败']] }), values => {
    if (values.result === 'failure') throw new Error('模拟支付失败，账单未扣款，可重新支付');
    const payment = ctx.store.pay(billIds, values.coupon || undefined);
    after();
    modal('缴费成功', `<p>实付 ¥${money(payment.amount)}，抵扣 ¥${money(payment.discount)}</p><p>交易号：${escape(payment.id)}</p><p>已获${Math.floor(payment.amount)}积分。</p>`, [
      { label: '查看电子回单', run: () => modal('缴费电子回单（演示）', `<p>交易号：${payment.id}</p><p>实付：¥${money(payment.amount)}</p><p>${new Date(payment.at).toLocaleString('zh-CN')}</p><p>本凭证非税务发票。</p>`, [{ label: '下载回单', run: () => download(payment.id + '.txt', JSON.stringify(payment, null, 2)) }]) },
      { label: '返回账单', secondary: true, run: closeModal }
    ]);
    return false;
  }, '确认模拟支付');
}

function pointsPage(ctx) {
  const { store, state, go, requireAuth } = ctx;
  const balance = $$('main span').find(e => e.textContent.trim() === '2,480');
  if (balance) { balance.dataset.points = ''; balance.textContent = state().user.points.toLocaleString('zh-CN'); }
  const taskButtons = find(/做任务快速赚分/);
  taskButtons.forEach(btn => bind(btn, '查看积分任务', () => $('#taskSection').scrollIntoView({ behavior: 'smooth' })));
  on(/去评价/, () => {
    const order = state().orders.find(o => o.status === 'completed' && !state().reviews.some(r => r.orderId === o.id));
    if (!order) return modal('服务评价', empty('暂无待评价工单'));
    go('/mobile/review?id=' + order.id);
  });
  on(/报名参与/, () => formModal('周末绿植共建报名', field('name', '参与人姓名', state().user.name) + field('phone', '手机号码', state().user.phone, { type: 'tel', pattern: '1[3-9][0-9]{9}' }) + field('count', '参加人数', '1', { type: 'number', min: 1, max: 10 }), values => {
    store.change(s => {
      if (s.bookings.some(b => b.productId === 'garden-activity' && b.status !== '已取消')) throw new Error('已报名本期活动，请勿重复提交');
      s.bookings.unshift({ ...values, id: id('ACT'), productId: 'garden-activity', title: '周末绿植共建', date: '本周六 09:00', status: '报名成功，待现场签到', amount: 0, at: now() });
    }); toast('报名成功，参与活动后发放50积分');
  }));
  $$('.category-tab').forEach(btn => bind(btn, '筛选' + label(btn), () => {
    const category = btn.dataset.originalOnclick.match(/filterTab\('([^']+)'/)?.[1] || 'all';
    active($$('.category-tab'), btn);
    $$('.product-item').forEach(item => item.hidden = category !== 'all' && !item.classList.contains(category));
  }));
  $$('.product-item').forEach((item, index) => {
    const reward = rewards[index];
    if (!reward) return;
    const btn = $('button', item);
    bind(btn, '兑换' + reward.name, () => {
      const requestId = id('REQ');
      const paymentField = reward.cash ? field('cashPayment', '支付结果', 'success', { choices: [['success', '模拟支付成功'], ['failure', '模拟支付失败']] }) : '';
      formModal('确认积分兑换', `<h3>${escape(reward.name)}</h3><p>扣除 ${reward.points}积分${reward.cash ? ` + ¥${reward.cash}（模拟支付）` : ''}，当前可用 ${state().user.points}积分</p>` + field('delivery', '领取方式', '物业服务中心自提', { choices: ['物业服务中心自提', '配送至已绑定房屋'] }) + paymentField, values => {
        const result = store.redeem(reward.id, values.delivery, requestId, { cashPayment: values.cashPayment || 'success' });
        if (balance) balance.textContent = state().user.points.toLocaleString('zh-CN');
        const payment = result.paymentId && state().payments.find(p => p.id === result.paymentId);
        modal('兑换成功', `<p>${escape(result.name)}</p><h3>核销码：${result.code}</h3><p>${escape(result.delivery)}</p>${payment ? `<p>模拟支付：¥${money(payment.amount)} · 交易号 ${escape(payment.id)}</p>` : ''}`, [
          { label: '查看兑换记录', run: () => redemptionHistory(ctx) }, { label: '返回积分中心', secondary: true, run: closeModal }
        ]); return false;
      }, '确认兑换');
    });
  });
  let accumulated = Number(state().drafts['listened-' + today()] || 0), previous = Date.now();
  const radio = createRadio((audio, error) => {
    if (error) return toast(error.message, true);
    $('#radioIcon').textContent = audio.paused ? 'play_arrow' : 'pause';
    $('#radioText').textContent = audio.paused ? '听播赚分' : '收听中...';
  });
  radio.audio.loop = true;
  const timer = setInterval(() => {
    const elapsed = Math.min(1000, Date.now() - previous); previous = Date.now();
    if (!radio.audio.paused && !radio.audio.seeking && radio.audio.readyState >= 3 && !document.hidden) {
      accumulated += elapsed;
      if (accumulated >= 120000) {
        store.award(15, '每日收听广播', 'radio-' + today());
        $('#radioText').textContent = '今日积分已入账'; clearInterval(timer);
      }
      store.saveDraft('listened-' + today(), accumulated);
    }
  }, 1000);
  window.addEventListener('pagehide', () => clearInterval(timer));
  bind($('#radioPlayBtn'), '收听社区广播赚积分', radio.toggle);
}

function pointsHistory(ctx) {
  modal('积分明细', list(ctx.state().pointsLog, p => `<article><strong>${p.delta > 0 ? '+' : ''}${p.delta} 分 · ${escape(p.reason)}</strong><small>${new Date(p.at).toLocaleString('zh-CN')}</small></article>`));
}
function redemptionHistory(ctx) {
  modal('兑换记录', list(ctx.state().redemptions, r => `<article><strong>${escape(r.name)}</strong><p>${r.points}积分 · 核销码 ${r.code} · ${escape(r.status)}</p><small>${escape(r.delivery)} · ${new Date(r.at).toLocaleString('zh-CN')}</small></article>`));
}

function servicesPage(ctx) {
  const { go, qs } = ctx;
  const buttons = find(/立即拼团|预约排班|立即预订|^预约$|免押借|一键快捷预约|免费量尺预约|立即抢鲜|^联系$/);
  const ids = ['ac-group', 'waterproof', 'vegetables', 'dumplings', 'computer', 'stroller', 'pet', 'ac', 'screen', 'peach'];
  buttons.forEach((btn, i) => bind(btn, '查看服务详情', () => go('/mobile/services/' + ids[i])));
  $$('.cursor-pointer').filter(e => /全屋开荒|油烟机|墙面补漆|闲置代管|冷链到家|老人助餐/.test(e.textContent)).forEach((el, i) => bind(el, '查看服务分类', () => {
    const choices = i === 0 ? [products[7]] : i === 1 ? [products[0], products[7]] : i === 2 ? [products[1], products[8]] : i === 3 ? [] : i === 4 ? [products[2], products[9]] : [products[6]];
    const dlg = modal(label(el).split(' ')[0], list(choices, p => `<button data-product="${p.id}"><strong>${p.name}</strong><small>¥${money(p.price)}</small></button>`), choices.length ? [] : [{ label: '登记租售需求', run: () => formModal('车位与仓储需求', field('description', '需求说明', '', { type: 'textarea' }), v => { ctx.notify('租售需求已登记', v.description); }) }]);
    $$('[data-product]', dlg).forEach(btn => bind(btn, '服务详情', () => go('/mobile/services/' + btn.dataset.product)));
  }));
  if (ctx.route.detail === 'service') serviceDetail(ctx, decodeURIComponent(location.pathname.split('/').pop()));
}
function serviceDetail(ctx, productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return modal('服务不存在', empty('该服务不存在或已下架'), [{ label: '返回服务列表', run: () => ctx.go('/mobile/services') }]);
  modal('服务详情', `<h3>${escape(product.name)}</h3><p>${escape(product.category)}</p><h3>¥${money(product.price)} / 次（份）</h3><p>由物业服务中心协调，提交后管家将确认时间及服务范围。材料增项须另行确认。</p>`, [
    { label: '立即预约', run: () => ctx.requireAuth(() => {
      const requestId = id('REQ');
      formModal('确认预约', field('date', '预约日期', today(), { type: 'date', min: today() }) + field('time', '预约时段', '14:00-16:30', { choices: ['09:00-11:30', '14:00-16:30', '17:30-19:30'] }) + field('quantity', '数量', '1', { type: 'number', min: 1, max: 99 }) + field('phone', '联系电话', ctx.state().user.phone, { type: 'tel', pattern: '1[3-9][0-9]{9}' }) + field('address', '服务/配送地址', ctx.state().user.room), values => {
        const booking = ctx.store.book(productId, values, requestId);
        modal('预约成功', `<p>${escape(booking.title)}</p><p>${escape(booking.date)} · ${escape(booking.time)}</p><p>预约金额 ¥${money(booking.amount)}，待管家确认。</p><small>${booking.id}</small>`, [
          { label: '查看预约记录', run: () => ctx.panel('bookings') }, { label: '返回服务列表', secondary: true, run: () => ctx.go('/mobile/services') }
        ]); return false;
      }, '提交预约');
    }) },
    { label: ctx.state().favorites.includes(productId) ? '取消收藏' : '收藏服务', secondary: true, run: () => { ctx.store.toggle('favorites', productId); serviceDetail(ctx, productId); } }
  ]);
}

function shopForm(ctx) {
  formModal('邻居闪铺入驻申请', field('name', '店铺名称') + field('category', '经营类目', '便民服务', { choices: ['便民服务', '手作食品', '物品租赁', '生活零售'] }) + field('phone', '联系电话', ctx.state().user.phone, { type: 'tel', pattern: '1[3-9][0-9]{9}' }) + field('description', '服务简介', '', { type: 'textarea' }), v => {
    ctx.store.change(s => {
      if (!s.user.verified) throw new Error('请先完成房屋认证');
      s.shops.unshift({ ...v, id: id('SHOP'), status: '待物业审核', at: now() });
    });
    toast('入驻申请已提交，待物业审核');
  });
}
function postForm(ctx) {
  formModal('发布邻里动态', field('body', '动态内容', '', { type: 'textarea', maxLength: 500 }), v => {
    ctx.store.change(s => s.posts.unshift({ id: id('POST'), body: v.body, author: s.user.name, likes: 0, at: now() }));
    toast('动态已发布');
    setTimeout(() => communityFeed(ctx), 0);
  }, '发布');
}
function communityFeed(ctx) {
  const dlg = modal('我的生活圈', list(ctx.state().posts, p => `<article><strong>${escape(p.author)}</strong><p>${escape(p.body)}</p><button class="demo-button secondary" data-like-post="${p.id}">${ctx.state().likes.includes(p.id) ? '取消点赞' : '点赞'} ${p.likes + (ctx.state().likes.includes(p.id) ? 1 : 0)}</button></article>`), [{ label: '发布动态', run: () => ctx.requireAuth(() => postForm(ctx)) }]);
  $$('[data-like-post]', dlg).forEach(btn => bind(btn, '点赞动态', () => { ctx.store.toggle('likes', btn.dataset.likePost); communityFeed(ctx); }));
}
function voiceInput(ctx, target) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    return formModal('语音输入暂不可用', `<p>当前浏览器未提供语音识别，可直接填写内容。</p>` + field('text', '填写内容', target.value, { type: 'textarea' }), v => { target.value = v.text; target.dispatchEvent(new Event('input')); });
  }
  const recognition = new Recognition(); recognition.lang = 'zh-CN'; recognition.interimResults = false;
  recognition.onresult = e => { target.value = (target.value + e.results[0][0].transcript).slice(0, target.maxLength > 0 ? target.maxLength : 1000); target.dispatchEvent(new Event('input')); toast('语音识别完成'); };
  recognition.onerror = e => toast(e.error === 'not-allowed' ? '麦克风权限未获授权，可直接输入文字' : '语音识别失败，请重试或输入文字', true);
  recognition.start(); toast('正在收听，请说出内容');
}
